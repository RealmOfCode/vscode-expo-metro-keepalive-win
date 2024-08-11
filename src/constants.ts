import path from 'path';
import * as vscode from 'vscode';

export const COMMAND_START = 'expo-metro-keepalive-win.start';
export const COMMAND_STOP = 'expo-metro-keepalive-win.stop';
export const MESSAGE_COMMAND_UNSUPPORTED = "[Metro Keep-Alive]: This command is only supported on Expo projects.";
export const MESSAGE_ERROR_NO_PATH_PROVIDED = "[Metro Keep-Alive]: No workspace path provided";
export const MESSAGE_ERROR_NO_MECH_FILE = "[Metro Keep-Alive]: No suitable file found for keep-alive mechanism.";
export const MESSAGE_SUCCESS_MECH_FILE = "[Metro Keep-Alive]: Suitable file found for keep-alive mechanism!";
export const NAME_TERMINAL = 'Expo Metro Keep-Alive';
export const PATH_ROOT = path.join(__dirname, '..');
export const PATH_DIST = path.join(PATH_ROOT, 'dist');
export const PATH_ASSETS = path.join(PATH_DIST, 'assets');
export const PATH_KEEP_ALIVE = path.join(PATH_DIST, 'keepAlive.js');
export const PATH_NPX = "C:\\Program Files\\nodejs\\npx.cmd";
export const PATH_OUTPUT_LOG = path.join(PATH_ASSETS, 'output.log');
export const PATH_PROJECT_USER = (() =>
{
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (workspaceFolders && workspaceFolders.length > 0) return workspaceFolders[ 0 ].uri.fsPath;
	return '';
})();
export const PATH_USER_PACKAGE_JSON = path.join(PATH_PROJECT_USER, 'package.json');
export const PATH_PS_SCRIPT = path.join(PATH_ASSETS, 'start.ps1');
export const KEEP_ALIVE_INTERVAL = 20 * 1000;
