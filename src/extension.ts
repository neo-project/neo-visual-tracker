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

	const openTrackerCommand = vscode.commands.registerCommand('neo-visual-devtracker.openTracker', (url?: string) => {
		if (url) {	
			try {
				const panel = new NeoTrackerPanel(
					context.extensionPath, 
					rpcConnectionPool.getConnection(url), 
					context.subscriptions);
			} catch (e) {
				console.error('Error opening Neo tracker panel ', e);
			}
		} else {
			console.warn('Attempted to open Neo tracker without providing RPC URL');
		}
	});

	const refreshServersCommand = vscode.commands.registerCommand('neo-visual-devtracker.refreshObjectExplorerNode', () => {
		rpcServerExplorer.refresh();
	});

	const startServerCommand = vscode.commands.registerCommand('neo-visual-devtracker.startServer', (server) => {
		console.log('User requested to start ', server);
		let label = undefined;
		if (server.parent) {
			label = server.parent.label;
		}
		neoExpressInstanceManager.start(server.jsonFile, server.index, label);
	});

	const stopServerCommand = vscode.commands.registerCommand('neo-visual-devtracker.stopServer', (server) => {
		console.log('User requested to stop ', server);
		neoExpressInstanceManager.stop(server.jsonFile, server.index);
	});

	const invokeContractCommand = vscode.commands.registerCommand('neo-visual-devtracker.invokeContract', (server) => {
		console.log('User requested to invoke a contract ', server);
		sampleInvocation(server.rpcUri);
	});

	const serverExplorer = vscode.window.registerTreeDataProvider('neo-visual-devtracker.rpcServerExplorer', rpcServerExplorer);

	context.subscriptions.push(openTrackerCommand);
	context.subscriptions.push(refreshServersCommand);
	context.subscriptions.push(startServerCommand);
	context.subscriptions.push(stopServerCommand);
	context.subscriptions.push(invokeContractCommand);
	context.subscriptions.push(serverExplorer);
}

export function deactivate() {

}
