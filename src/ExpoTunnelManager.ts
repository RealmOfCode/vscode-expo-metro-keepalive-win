import EventEmitter from 'events';
import fs from 'fs';
import * as vscode from 'vscode';
import * as Constants from './constants';

/**
 * Manages the lifecycle of the Expo tunnel and its associated processes.
 *
 * @remarks
 * This class is responsible for starting, monitoring, and stopping the Expo tunnel process.
 * It utilizes a PowerShell script to handle the keep-alive functionality.
 *
 * @example
 * ```typescript
 * const manager = new ExpoTunnelManager();
 * await manager.startAsync();
 * // ...
 * await manager.disposeAsync();
 * ```
 */
export default class ExpoTunnelManager extends EventEmitter
{
	private terminal: vscode.Terminal | null = null;
	private terminalProcessId: number | null | undefined = null;
	private interval: NodeJS.Timeout | null = null;
	private checkingOutputLog = false;

	/**
	 * Starts the Expo tunnel and its associated processes.
	 *
	 * @remarks
	 * This method creates a new terminal, sets up the PowerShell script, and starts the script.
	 * It also sets up an interval to check the output log for completion.
	 *
	 * @throws Will throw an error if any exception occurs during the process.
	 */
	async startAsync ()
	{
		try
		{
			await this.openTerminalAsync(); // creates, sets and opens.

			const command = `powershell.exe -ExecutionPolicy Bypass -File "${ Constants.PATH_PS_SCRIPT }" -outputPath "${ Constants.PATH_OUTPUT_LOG }" -Constants.PATH_NPX "${ Constants.PATH_NPX }" -Constants.PATH_KEEP_ALIVE "${ Constants.PATH_KEEP_ALIVE }" -Constants.PATH_PROJECT_USER "${ Constants.PATH_PROJECT_USER }"`;

			this.terminal?.sendText(command);

			this.interval = setInterval(() => this.checkOutputLog(), 1000);
		} catch (err)
		{
			console.error('[Metro Keep-Alive]: Encountered an error: ', err);
			this.emit('error', new Error(`[Metro Keep-Alive]: Encountered an error: ${ JSON.stringify(err) }`));
			this.disposeAsync();
		}
	}

	/**
	 * Disposes of the Expo tunnel and its associated processes.
	 *
	 * @remarks
	 * This method stops the PowerShell script, disposes of the terminal, and cleans up any resources.
	 * It emits the 'done' event with the reason for disposal.
	 *
	 * @throws Will throw an error if any exception occurs during the process.
	 */
	async disposeAsync ()
	{
		if (this.terminal)
		{
			const exitStatus = await this.terminal.exitStatus;
			try
			{
				const reason = exitStatus?.reason || "Process"; // TODO: Find the right reason here.
				this.emit('done', reason);
			}
			catch (err)
			{
				this.emit('done', "Extension"); // TODO: Fix this issue where the reason can't be found on user pressing the stop button.
			}

			this.terminal.dispose();
			this.terminal = null;
			this.terminalProcessId = null;
			if (this.interval !== null) clearInterval(this.interval);
			this.interval = null;
			this.cleanup();
		}
	}

	/**
	 * Creates a new terminal for the Expo tunnel process.
	 *
	 * @remarks
	 * This method disposes of any existing terminal with the same name, creates a new terminal,
	 * and sets up the necessary properties.
	 *
	 * @throws Will throw an error if any exception occurs during the process.
	 */
	private async createTerminalAsync ()
	{
		// Dispose of the terminal if it already exists. This must happen before the
		// `createTerminal` command, or it will fail.
		vscode.window.terminals.forEach(t =>
		{
			if (t.name === Constants.NAME_TERMINAL) t.dispose();
		});

		this.terminalProcessId = null;

		// Create the new terminal
		this.terminal = vscode.window.createTerminal({
			name: Constants.NAME_TERMINAL,
			cwd: Constants.PATH_PROJECT_USER,
			isTransient: true,
			shellPath: 'pwsh.exe',
		});

		this.terminalProcessId = await this.terminal.processId;

		vscode.window.onDidCloseTerminal(async (t) =>
		{
			const tId = await t.processId;
			if (tId === this.terminalProcessId) this.disposeAsync();
		});
	}

	/**
	 * Opens the terminal for the Expo tunnel process.
	 *
	 * @remarks
	 * This method creates a new terminal if it doesn't already exist, and then shows the terminal.
	 *
	 * @throws Will throw an error if any exception occurs during the process.
	 */
	private async openTerminalAsync ()
	{
		// Create the terminal if it it's null
		if (!this.terminal) await this.createTerminalAsync(); // Sets the terminal property as well
		// Show the terminal
		this.terminal!.show();
	}

	/**
	 * Checks the output log for completion of the PowerShell script.
	 *
	 * @remarks
	 * This method reads the output log file and checks if the script has completed.
	 * If the script has completed, it stops the interval, emits the 'done' event, and cleans up any resources.
	 *
	 * @throws Will throw an error if any exception occurs during the process.
	 */
	private checkOutputLog ()
	{
		// Ensure this check only runs once at a time.
		if (!this.checkingOutputLog)
		{
			this.checkingOutputLog = true;

			const exists = fs.existsSync(Constants.PATH_OUTPUT_LOG);

			if (exists)
			{
				this.interval && clearInterval(this.interval);

				console.log('[Metro Keep-Alive]: PowerShell script completed its job.');

				let fileContents = null;
				try
				{
					fileContents = fs.readFileSync(Constants.PATH_OUTPUT_LOG, { encoding: 'utf16le' });
				} catch (error)
				{
					console.error('[Metro Keep-Alive]: Could not open the log file.', error);
					this.checkingOutputLog = false;
					this.handleExit(1);
					return;
				}

				let exitCode = -1;
				try
				{
					exitCode = parseInt(fileContents.trim(), 10);
				} catch (error)
				{
					console.error('[Metro Keep-Alive]: Could not parse the contents of the log file.', error);
					this.checkingOutputLog = false;
					this.handleExit(1);
					return;
				}

				this.handleExit(exitCode);
			}
			this.checkingOutputLog = false;
		}
	}

	/**
	 * Cleans up any resources used by the Expo tunnel manager.
	 *
	 * @remarks
	 * This method removes the output log file.
	 */
	private cleanup ()
	{
		fs.existsSync(Constants.PATH_OUTPUT_LOG) && fs.rmSync(Constants.PATH_OUTPUT_LOG);
	}

	/**
	 * Handles the exit of the PowerShell script.
	 *
	 * @remarks
	 * This method displays a message based on the exit code, and then disposes of the Expo tunnel manager.
	 *
	 * @param exitCode - The exit code of the PowerShell script.
	 */
	private handleExit (exitCode: number)
	{
		if (exitCode === 0)
			vscode.window.showInformationMessage('[Metro Keep-Alive]: Process completed successfully.');
		else
			vscode.window.showErrorMessage('[Metro Keep-Alive]: Process failed.');

		this.disposeAsync();
	}
}