import * as vscode from 'vscode';

import { NeoExpressInstanceManager } from './neoExpressInstanceManager';
import { NeoTrackerPanel } from './neoTrackerPanel';
import { RpcServerExplorer } from './rpcServerExplorer';
import { RpcConnectionPool } from './rpcConnectionPool';

export function activate(context: vscode.ExtensionContext) {

	const rpcConnectionPool = new RpcConnectionPool(context.globalState);

	const rpcServerExplorer = new RpcServerExplorer();

	const neoExpressInstanceManager = new NeoExpressInstanceManager();

	const openTrackerCommand = vscode.commands.registerCommand('extension.openTracker', (url?: string) => {
		if (url) {	
			const panel = new NeoTrackerPanel(
				context.extensionPath, 
				rpcConnectionPool.getConnection(url), 
				context.subscriptions);
		}
	});

	const refreshServersCommand = vscode.commands.registerCommand('extension.refreshServers', () => {
		rpcServerExplorer.refresh();
	});

	const startServerCommand = vscode.commands.registerCommand('extension.startServer', (server) => {
		console.log('User requested to start ', server);
		let label = undefined;
		if (server.parent) {
			label = server.parent.label;
		}

		neoExpressInstanceManager.start(server.jsonFile, server.index, label);
	});

	const serverExplorer = vscode.window.registerTreeDataProvider('extension.rpcServerExplorer', rpcServerExplorer);

	context.subscriptions.push(openTrackerCommand);
	context.subscriptions.push(refreshServersCommand);
	context.subscriptions.push(startServerCommand);
	context.subscriptions.push(serverExplorer);
}

export function deactivate() {

}
