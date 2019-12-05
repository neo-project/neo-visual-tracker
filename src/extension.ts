import * as vscode from 'vscode';

import { ClaimPanel } from './claimPanel';
import { CreateInstancePanel } from './createInstancePanel';
import { InvocationPanel } from './invocationPanel';
import { NeoExpressHelper } from './neoExpressHelper';
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

	let createInstancePanel: CreateInstancePanel | null = null;

	const requireNeoExpress = async (then: Function) => {
		if (await NeoExpressHelper.isNeoExpressInstalled()) {
			then();
		} else {
			const moreInfo = 'More Information';
			const install = 'Install';
			const dialogResponse = await vscode.window.showInformationMessage(
				'Neo Express Required\n\nNeo Express was not detected on your machine. Neo Express must be installed in order to use this functionality.\n',
				{ modal: true },
				install,
				moreInfo);
			if (dialogResponse === moreInfo) {
				vscode.env.openExternal(vscode.Uri.parse('https://github.com/neo-project/neo-express#Installation'));
			} else if (dialogResponse === install) {
				vscode.tasks.executeTask(
					new vscode.Task(
						{ type: 'install-neo-express' },
						vscode.TaskScope.Global,
						'Install Neo Express',
						'dotnet',
						new vscode.ShellExecution('dotnet tool install Neo.Express -g')));
			}
		}
	};

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

	const startServerCommand = vscode.commands.registerCommand('neo-visual-devtracker.startServer', async (server) => {
		await requireNeoExpress(() => {
			console.log('User requested to start ', server);
			let label = undefined;
			if (server.parent) {
				label = server.parent.label;
			}
			neoExpressInstanceManager.start(server.jsonFile, server.index, label);
		});
	});

	const stopServerCommand = vscode.commands.registerCommand('neo-visual-devtracker.stopServer', async (server) => {
		await requireNeoExpress(() => {
			console.log('User requested to stop ', server);
			neoExpressInstanceManager.stop(server.jsonFile, server.index);
		});
	});

	const createWalletCommand = vscode.commands.registerCommand('neo-visual-devtracker.createWallet', async (server) => {
		await requireNeoExpress(() => {
			try {
				const panel = new NewWalletPanel(
					context.extensionPath, 
					server.jsonFile,
					context.subscriptions);
			} catch (e) {
				console.error('Error opening new wallet panel ', e);
			}
		});
	});

	const transferCommand = vscode.commands.registerCommand('neo-visual-devtracker.transferAssets', async (server) => {
		await requireNeoExpress(() => {
			try {
				const panel = new TransferPanel(
					context.extensionPath, 
					server.jsonFile,
					context.subscriptions);
			} catch (e) {
				console.error('Error opening transfer panel ', e);
			}
		});
	});

	const claimCommand = vscode.commands.registerCommand('neo-visual-devtracker.claim', async (server) => {
		await requireNeoExpress(() => {
			try {
				const panel = new ClaimPanel(
					context.extensionPath, 
					server.jsonFile,
					context.subscriptions);
			} catch (e) {
				console.error('Error opening claim panel ', e);
			}
		});
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

	const createInstanceCommand = vscode.commands.registerCommand('neo-visual-devtracker.createInstance', async () => {
		await requireNeoExpress(() => {
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
	});

	const serverExplorer = vscode.window.registerTreeDataProvider('neo-visual-devtracker.rpcServerExplorer', rpcServerExplorer);

	context.subscriptions.push(openTrackerCommand);
	context.subscriptions.push(refreshServersCommand);
	context.subscriptions.push(startServerCommand);
	context.subscriptions.push(stopServerCommand);
	context.subscriptions.push(createWalletCommand);
	context.subscriptions.push(transferCommand);
	context.subscriptions.push(claimCommand);
	context.subscriptions.push(invokeContractCommand);
	context.subscriptions.push(createInstanceCommand);
	context.subscriptions.push(serverExplorer);
}

export function deactivate() {

}
