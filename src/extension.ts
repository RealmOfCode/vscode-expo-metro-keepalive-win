import fs from 'fs';
import * as vscode from 'vscode';
import * as Constants from './constants';
import ExpoTunnelManager from './ExpoTunnelManager';

const tunnelManager = createTunnelManager(); // TODO: Future implementation of options for interval amount, etc.

/**
 * Activates the Metro Keep-Alive extension.
 *
 * This function initializes the extension by creating an instance of `ExpoTunnelManager`,
 * setting up the status bar item, and registering the extension's commands. It also subscribes
 * to the extension's lifecycle events.
 *
 * @param context - The extension context provided by VS Code.
 *
 * @returns {void}
 */
export function activate (context: vscode.ExtensionContext): void
{
	const isExpo = isExpoProject();
	const statusBarItem: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);

	// 1. Activate the status bar item, if the project is an Expo project
	if (isExpo)
	{
		setStatusBarItemFor('start', statusBarItem);
		statusBarItem.show();

		context.subscriptions.push(statusBarItem);
	}

	// 2. Activate the extension's commands
	const startDisposable = vscode.commands.registerCommand(Constants.COMMAND_START, async (): Promise<void> =>
	{
		if (!isExpo) vscode.window.showWarningMessage(Constants.MESSAGE_COMMAND_UNSUPPORTED);
		else if (statusBarItem)
		{
			await tunnelManager.startAsync();
			setStatusBarItemFor('stop', statusBarItem);
		}
	});
	const stopDisposable = vscode.commands.registerCommand(Constants.COMMAND_STOP, async (): Promise<void> =>
	{
		if (!isExpo) vscode.window.showWarningMessage(Constants.MESSAGE_COMMAND_UNSUPPORTED);
		else if (statusBarItem)
		{
			await tunnelManager.disposeAsync();
			setStatusBarItemFor('start', statusBarItem);
		}
	});

	// 3. Subscribe elements.
	context.subscriptions.push(startDisposable, stopDisposable);
}

/**
 * Deactivates the Metro Keep-Alive extension.
 *
 * This function cleans up the extension's resources, such as disposing of the ExpoTunnelManager and
 * removing the output log file. It is called when the extension is deactivated by VS Code.
 *
 * @returns {void}
 */
export function deactivate (): void
{
	tunnelManager && tunnelManager.disposeAsync();
	if (fs.existsSync(Constants.PATH_OUTPUT_LOG))
	{
		fs.rmSync(Constants.PATH_OUTPUT_LOG);
	}
}

/**
 * Creates and initializes an instance of `ExpoTunnelManager`.
 *
 * This function creates a new `ExpoTunnelManager` instance, sets up event listeners for warnings, errors,
 * and process completion, and returns the initialized instance.
 *
 * @returns {ExpoTunnelManager} - An initialized instance of `ExpoTunnelManager`.
 */
function createTunnelManager (): ExpoTunnelManager
{
	const tm = new ExpoTunnelManager();
	tm.on('warn', warn => vscode.window.showWarningMessage(`[Metro Keep-Alive]: ${ warn }`));
	tm.on('error', err =>
	{
		vscode.window.showErrorMessage(`[Metro Keep-Alive]: ${ err }`);
		vscode.commands.executeCommand(Constants.COMMAND_STOP);
	});
	tm.on('done', code =>
	{
		vscode.window.showInformationMessage(`[Metro Keep-Alive]: Process completed by:  ${ code }.`);
		vscode.commands.executeCommand(Constants.COMMAND_STOP);
	});
	return tm;
}

/**
 * Sets the status bar item's text, tooltip, and command based on the provided mode.
 *
 * @param mode - The mode to set the status bar item for. It can be either 'start' or 'stop'.
 * @param item - The status bar item to be updated.
 *
 * @returns {void}
 */
function setStatusBarItemFor (mode: 'start' | 'stop', item: vscode.StatusBarItem): void
{
	if (mode === 'start')
	{
		item.text = '$(debug-start) Start Metro (keep alive)'; // Use an icon
		item.tooltip = 'Starts the project in tunnel mode with a keep-alive mechanism so it does not stall on inactivity.';
		item.command = Constants.COMMAND_START;
	}
	else
	{
		item.text = '$(debug-stop) Stop Metro'; // Use an icon
		item.tooltip = 'Stop the current expo project.';
		item.command = Constants.COMMAND_STOP;
	}
}

/**
 * Checks if the current project is an Expo project.
 *
 * This function reads the user's package.json file and checks if the 'expo' package is listed as a dependency.
 * If the 'expo' package is found, it returns `true`, indicating that the project is an Expo project.
 * If the 'expo' package is not found or if an error occurs while reading the package.json file, it returns `false`.
 *
 * @returns {boolean} - `true` if the project is an Expo project, `false` otherwise.
 */
function isExpoProject (): boolean
{
	try
	{
		const packageJson = JSON.parse(fs.readFileSync(Constants.PATH_USER_PACKAGE_JSON, 'utf8'));
		return packageJson.dependencies && packageJson.dependencies.expo;
	}
	catch (e)
	{
		return false;
	}
}
