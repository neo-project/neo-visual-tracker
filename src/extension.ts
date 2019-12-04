import * as vscode from 'vscode';

import { ClaimPanel } from './claimPanel';
import { ContractDetector } from './contractDetector';
import { CreateInstancePanel } from './createInstancePanel';
import { DeployPanel } from './deployPanel';
import { InvocationPanel } from './invocationPanel';
import { NeoExpressInstanceManager } from './neoExpressInstanceManager';
import { NeoTrackerPanel } from './neoTrackerPanel';
import { NewWalletPanel } from './newWalletPanel';
import { RpcServerExplorer } from './rpcServerExplorer';
import { RpcConnectionPool } from './rpcConnectionPool';
import { TransferPanel } from './transferPanel';

export function activate(context: vscode.ExtensionContext) {

	const rpcConnectionPool = new RpcConnectionPool();

	const rpcServerExplorer = new RpcServerExplorer(context.extensionPath);

	const neoExpressInstanceManager = new NeoExpressInstanceManager();

	const contractDetector = new ContractDetector();

	let createInstancePanel: CreateInstancePanel | null = null;

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

	const createWalletCommand = vscode.commands.registerCommand('neo-visual-devtracker.createWallet', (server) => {
		try {
			const panel = new NewWalletPanel(
				context.extensionPath, 
				server.jsonFile,
				context.subscriptions);
		} catch (e) {
			console.error('Error opening new wallet panel ', e);
		}
	});

	const transferCommand = vscode.commands.registerCommand('neo-visual-devtracker.transferAssets', (server) => {
		try {
			const panel = new TransferPanel(
				context.extensionPath, 
				server.jsonFile,
				context.subscriptions);
		} catch (e) {
			console.error('Error opening transfer panel ', e);
		}
	});

	const claimCommand = vscode.commands.registerCommand('neo-visual-devtracker.claim', (server) => {
		try {
			const panel = new ClaimPanel(
				context.extensionPath, 
				server.jsonFile,
				context.subscriptions);
		} catch (e) {
			console.error('Error opening claim panel ', e);
		}
	});

	const deployContractCommand = vscode.commands.registerCommand('neo-visual-devtracker.deployContract', (server) => {
		try {
			const panel = new DeployPanel(
				context.extensionPath, 
				server.jsonFile,
				contractDetector,
				context.subscriptions);
		} catch (e) {
			console.error('Error opening contract deployment panel ', e);
		}
	});

	const invokeContractCommand = vscode.commands.registerCommand('neo-visual-devtracker.invokeContract', (server) => {
		try {
			const panel = new InvocationPanel(
				context.extensionPath, 
				server.jsonFile,
				server.rpcUri,
				context.subscriptions);
		} catch (e) {
			console.error('Error opening invocation panel ', e);
		}
	});

	const createInstanceCommand = vscode.commands.registerCommand('neo-visual-devtracker.createInstance', () => {
		if (createInstancePanel !== null) {
			createInstancePanel.disposeIfCreated(); // clear previous successful creation
		}

		if ((createInstancePanel === null) || createInstancePanel.isDisposed()) {
			const defaultPath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length ? 
				vscode.workspace.workspaceFolders[0].uri.fsPath : 
				process.cwd();
			createInstancePanel = new CreateInstancePanel(
				context.extensionPath,
				defaultPath,
				rpcServerExplorer,
				context.subscriptions);
		}

		createInstancePanel.reveal();
	});

	const serverExplorer = vscode.window.registerTreeDataProvider('neo-visual-devtracker.rpcServerExplorer', rpcServerExplorer);

	context.subscriptions.push(openTrackerCommand);
	context.subscriptions.push(refreshServersCommand);
	context.subscriptions.push(startServerCommand);
	context.subscriptions.push(stopServerCommand);
	context.subscriptions.push(createWalletCommand);
	context.subscriptions.push(transferCommand);
	context.subscriptions.push(claimCommand);
	context.subscriptions.push(deployContractCommand);
	context.subscriptions.push(invokeContractCommand);
	context.subscriptions.push(createInstanceCommand);
	context.subscriptions.push(serverExplorer);
	context.subscriptions.push(contractDetector);
}

export function deactivate() {

}
