import * as vscode from 'vscode';

import { NeoTrackerPanel } from './neoTrackerPanel';
import { NeoRpcConnection } from './neoRpcConnection';
import { RpcServerExplorer } from './rpcServerExplorer';

export function activate(context: vscode.ExtensionContext) {

	const rpcConnection = new NeoRpcConnection();

	const rpcServerExplorer = new RpcServerExplorer();

	const openTrackerCommand = vscode.commands.registerCommand('extension.openTracker', (url: string) => {
		const panel = new NeoTrackerPanel(context.extensionPath, rpcConnection, context.subscriptions);
	});

	const refreshServersCommand = vscode.commands.registerCommand('extension.refreshServers', () => {
		rpcServerExplorer.refresh();
	});

	const serverExplorer = vscode.window.registerTreeDataProvider('extension.rpcServerExplorer', rpcServerExplorer);

	context.subscriptions.push(openTrackerCommand);
	context.subscriptions.push(refreshServersCommand);
	context.subscriptions.push(serverExplorer);
}

export function deactivate() {

}
