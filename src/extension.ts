import * as vscode from 'vscode';

import { NeoTrackerPanel } from './neoTrackerPanel';
import { NeoRpcConnection } from './neoRpcConnection';
import { RpcServerExplorer } from './rpcServerExplorer';

export function activate(context: vscode.ExtensionContext) {

	const rpcConnection = new NeoRpcConnection();

	const openTrackerCommand = vscode.commands.registerCommand('extension.openTracker', (url: string) => {
		console.log('extension.openTracker', url);
		const panel = new NeoTrackerPanel(context.extensionPath, rpcConnection, context.subscriptions);
	});

	const serverExplorer = vscode.window.registerTreeDataProvider('extension.rpcServerExplorer', new RpcServerExplorer());

	context.subscriptions.push(openTrackerCommand);
	context.subscriptions.push(serverExplorer);
}

export function deactivate() {

}
