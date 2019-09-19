import * as vscode from 'vscode';

import { NeoTrackerPanel } from './neoTrackerPanel';
import { NeoRpcConnection } from './neoRpcConnection';

export function activate(context: vscode.ExtensionContext) {

	const rpcConnection = new NeoRpcConnection();

	const disposable = vscode.commands.registerCommand('extension.openTracker', () => {
		const panel = new NeoTrackerPanel(context.extensionPath, rpcConnection, context.subscriptions);
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {

}
