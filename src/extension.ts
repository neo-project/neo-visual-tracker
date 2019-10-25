import * as vscode from 'vscode';

import { NeoExpressInstanceManager } from './neoExpressInstanceManager';
import { NeoTrackerPanel } from './neoTrackerPanel';
import { RpcServerExplorer } from './rpcServerExplorer';
import { RpcConnectionPool } from './rpcConnectionPool';
import { sampleInvocation } from './contractInvocation';

export function activate(context: vscode.ExtensionContext) {

	const rpcConnectionPool = new RpcConnectionPool(context.globalState);

	const rpcServerExplorer = new RpcServerExplorer(context.extensionPath);

	const neoExpressInstanceManager = new NeoExpressInstanceManager();

	const openTrackerCommand = vscode.commands.registerCommand('extension.openTracker', (url?: string) => {
		if (url) {	
			try {
				const panel = new NeoTrackerPanel(
					context.extensionPath, 
					rpcConnectionPool.getConnection(url), 
					context.subscriptions);
			} catch (e) {
				console.error('Error opening NEO tracker panel ', e);
			}
		} else {
			console.warn('Attempted to open NEO tracker without providing RPC URL');
		}
	});

	const refreshServersCommand = vscode.commands.registerCommand('extension.refreshObjectExplorerNode', () => {
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

	const stopServerCommand = vscode.commands.registerCommand('extension.stopServer', (server) => {
		console.log('User requested to stop ', server);
		neoExpressInstanceManager.stop(server.jsonFile, server.index);
	});

	const invokeContractCommand = vscode.commands.registerCommand('extension.invokeContract', (server) => {
		console.log('User requested to invoke a contract ', server);
		sampleInvocation(server.rpcUri);
	});

	const serverExplorer = vscode.window.registerTreeDataProvider('extension.rpcServerExplorer', rpcServerExplorer);

	context.subscriptions.push(openTrackerCommand);
	context.subscriptions.push(refreshServersCommand);
	context.subscriptions.push(startServerCommand);
	context.subscriptions.push(stopServerCommand);
	context.subscriptions.push(invokeContractCommand);
	context.subscriptions.push(serverExplorer);
}

export function deactivate() {

}
