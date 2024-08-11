import fs from 'fs';
import path from 'path';

// TODO: Fix the handling of these constants.
// There's a copy of these in the `constants.ts` file waiting to be used
// in the fulfillment of this todo.
const Constants = {
	MESSAGE_ERROR_NO_PATH_PROVIDED: "[Metro Keep-Alive]: No workspace path provided",
	MESSAGE_SUCCESS_MECH_FILE: "[Metro Keep-Alive]: Suitable file found for keep-alive mechanism!",
	KEEP_ALIVE_INTERVAL: 20 * 1000,
	MESSAGE_ERROR_NO_MECH_FILE: "[Metro Keep-Alive]: No suitable file found for keep-alive mechanism."
};

/**
 * Provided to the PowerShell script, which in turn provides it here.
 */
const workspacePath = process.argv[ 2 ];

if (!workspacePath) throw new Error(Constants.MESSAGE_ERROR_NO_PATH_PROVIDED);

/**
 * These are the possible files to keep __touching__ in order to fool Metro
 * into triggering Expo's Fast Refresh mechanism.
 */
const possibleEntryPoints = [ 'App.tsx', 'App.js' ];

/**
 * The selected file for the mechanism.
 */
const filePath = getKeepAliveFile();
console.log(`${ Constants.MESSAGE_SUCCESS_MECH_FILE }: ${ filePath }`);

/**
 * Update the timestamp of the selected entry point, at regular intervals.
 * This will trigger Expo's Fast Refresh mechanism in a React Native project.
 */
setInterval((): void =>
{
	fs.utimesSync(filePath, new Date(), new Date());
}, Constants.KEEP_ALIVE_INTERVAL);

/**
 * This function retrieves the path of the keep-alive file for triggering Expo's Fast Refresh mechanism.
 * It searches for a predefined list of entry point files in the workspace path.
 */
function getKeepAliveFile (): string
{
	for (const file of possibleEntryPoints)
	{
		const filePath = path.join(workspacePath, file);
		if (fs.existsSync(filePath)) return filePath;
	}
	throw new Error(Constants.MESSAGE_ERROR_NO_MECH_FILE);
}
