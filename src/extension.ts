import * as vscode from 'vscode';

import { CheckpointDetector } from './checkpointDetector';
import { ClaimPanel } from './claimPanel';
import { ContractDetector } from './contractDetector';
import { CreateCheckpointPanel } from './createCheckpointPanel';
import { CreateInstancePanel } from './createInstancePanel';
import { DeployPanel } from './deployPanel';
import { InvocationPanel } from './invocationPanel';
import { NeoExpressConfig } from './neoExpressConfig';
import { NeoExpressHelper } from './neoExpressHelper';
import { NeoExpressInstanceManager } from './neoExpressInstanceManager';
import { NeoTrackerPanel } from './neoTrackerPanel';
import { NewWalletPanel } from './newWalletPanel';
import { RpcServerExplorer } from './rpcServerExplorer';
import { RpcConnectionPool } from './rpcConnectionPool';
import { TransferPanel } from './transferPanel';
import { WalletExplorer } from './walletExplorer';

export function activate(context: vscode.ExtensionContext) {

    const rpcConnectionPool = new RpcConnectionPool();

    const rpcServerExplorer = new RpcServerExplorer(context.extensionPath);

    const neoExpressInstanceManager = new NeoExpressInstanceManager();

    const contractDetector = new ContractDetector();
    
    const walletExplorer = new WalletExplorer();
    
    const checkpointDetector = new CheckpointDetector();

    let createInstancePanel: CreateInstancePanel | null = null;

    const installationTaskName = 'Install Neo Express';
    let postInstallAction: Function | null = null;
    vscode.tasks.onDidEndTask(async e => {
        if (postInstallAction && (e.execution.task.name === installationTaskName)) {
            const action = postInstallAction;
            postInstallAction = null;
            if (await NeoExpressHelper.isNeoExpressInstalled()) {
                action();
            } else {
                await vscode.window.showErrorMessage(
                    'Neo Express installation error.\n\nNeo Express did not install successfully. Check the terminal output for more information.\n',
                    { modal: true });
            }
        }
    });

    const requireNeoExpress = async (then: Function) => {
        if (await NeoExpressHelper.isNeoExpressInstalled()) {
            then();
        } else if (postInstallAction) {
            await vscode.window.showErrorMessage(
                'Neo Express installation is in progress.\n\nPlease wait for the installation to finish and then try again.\n',
                { modal: true });
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
                postInstallAction = then;
                await vscode.tasks.executeTask(
                    new vscode.Task(
                        { type: 'install-neo-express' },
                        vscode.TaskScope.Global,
                        installationTaskName,
                        'dotnet',
                        new vscode.ShellExecution('dotnet tool install Neo.Express -g')));
            }
        }
    };

    const selectUri = async (server: any) => {
        if (server && server.rpcUri) {
            return server.rpcUri;
        } else if (server && server.children && server.children.length) {
            const possibleUris = server.children.map((_: any) => _.rpcUri).filter((_: any) => !!_);
            if (possibleUris.length) {
                if (possibleUris.length === 1) {
                    return possibleUris[0];
                } else {
                    return await vscode.window.showQuickPick(possibleUris, { placeHolder: 'Select an RPC server to use for this operation...' });
                }
            }
        } 
        console.error('Could not select an RPC URI from node', server);
        throw new Error('Could not select an RPC URI from node');
    };

    const openTrackerCommand = vscode.commands.registerCommand('neo-visual-devtracker.openTracker', async (server) => {
        try {
            const rpcUri = await selectUri(server);
            if (rpcUri) {
                const panel = new NeoTrackerPanel(
                    context.extensionPath,
                    rpcConnectionPool.getConnection(rpcUri),
                    context.subscriptions);
            }
        } catch (e) {
            console.error('Error opening Neo tracker panel ', e);
        }
    });

    const refreshServersCommand = vscode.commands.registerCommand('neo-visual-devtracker.refreshObjectExplorerNode', () => {
        rpcServerExplorer.refresh();
        walletExplorer.refresh();
    });

    const startServerCommand = vscode.commands.registerCommand('neo-visual-devtracker.startServer', async (server) => {
        await requireNeoExpress(() => {
            if (server.index !== undefined) {
                const label = server.parent ? server.parent.label : server.label;
                neoExpressInstanceManager.start(server.jsonFile, server.index, label);
            } else if (server.children && server.children.length) {
                for (let i = 0; i < server.children.length; i++) {
                    neoExpressInstanceManager.start(server.jsonFile, server.children[i].index, server.label);
                }
            }
        });
    });

    const stopServerCommand = vscode.commands.registerCommand('neo-visual-devtracker.stopServer', async (server) => {
        await requireNeoExpress(() => {
            if (server.index !== undefined) {
                neoExpressInstanceManager.stop(server.jsonFile, server.index);
            } else if (server.children && server.children.length) {
                for (let i = 0; i < server.children.length; i++) {
                    neoExpressInstanceManager.stop(server.jsonFile, server.children[i].index);
                }
            }
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
    
    const createCheckpointCommand = vscode.commands.registerCommand('neo-visual-devtracker.createCheckpoint', async (server) => {
        await requireNeoExpress(() => {
            try {
                const defaultPath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length ? 
                    vscode.workspace.workspaceFolders[0].uri.fsPath : 
                    process.cwd();
                const panel = new CreateCheckpointPanel(
                    context.extensionPath,
                    server.jsonFile,
                    defaultPath,
                    context.subscriptions);
            } catch (e) {
                console.error('Error opening new checkpoint panel ', e);
            }
        });
    });

    const transferCommand = vscode.commands.registerCommand('neo-visual-devtracker.transferAssets', async (server) => {
        try {
            const rpcUri = await selectUri(server);
            if (rpcUri) {
                const panel = new TransferPanel(
                    context.extensionPath,
                    rpcUri,
                    rpcConnectionPool.getConnection(rpcUri),
                    walletExplorer,
                    context.subscriptions,
                    server.jsonFile ? new NeoExpressConfig(server.jsonFile) : undefined);
            }
        } catch (e) {
            console.error('Error opening transfer panel ', e);
        }
    });

    const claimCommand = vscode.commands.registerCommand('neo-visual-devtracker.claim', async (server) => {
        try {
            const rpcUri = await selectUri(server);
            if (rpcUri) {
                const panel = new ClaimPanel(
                    context.extensionPath,
                    rpcUri,
                    rpcConnectionPool.getConnection(rpcUri),
                    walletExplorer,
                    context.subscriptions,
                    server.jsonFile ? new NeoExpressConfig(server.jsonFile) : undefined);
            }
        } catch (e) {
            console.error('Error opening claim panel ', e);
        }
    });

    const deployContractCommand = vscode.commands.registerCommand('neo-visual-devtracker.deployContract', async (server) => {
        try {
            const rpcUri = await selectUri(server);
            if (rpcUri) {
                const panel = new DeployPanel(
                    context.extensionPath,
                    rpcUri,
                    walletExplorer,
                    contractDetector,
                    context.subscriptions,
                    server.jsonFile ? new NeoExpressConfig(server.jsonFile) : undefined);
            }
        } catch (e) {
            console.error('Error opening contract deployment panel ', e);
        }
    });

    const invokeContractCommand = vscode.commands.registerCommand('neo-visual-devtracker.invokeContract', async (server) => {
        try {
            const rpcUri = await selectUri(server);
            if (rpcUri) {
                const panel = new InvocationPanel(
                    context.extensionPath, 
                    rpcUri,
                    walletExplorer,
                    contractDetector,
                    checkpointDetector,
                    context.subscriptions,
                    server.jsonFile ? new NeoExpressConfig(server.jsonFile) : undefined);
            }
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

    const createAccountCommand = vscode.commands.registerCommand('neo-visual-devtracker.createAccount', async (wallet) => {
        try {
            if (!wallet && vscode.window.activeTextEditor) {
                wallet = walletExplorer.getWalletForFile(vscode.window.activeTextEditor.document.uri);
            }
            if (wallet) {
                await wallet.createAccount();
            } else {
                vscode.window.showErrorMessage('Please open a NEP-6 wallet file before attempting to create a new account');
            }
        } catch (e) {
            console.error('Error creating new account in wallet ', wallet, e);
        }
    });

    const createServerListCommand = vscode.commands.registerCommand('neo-visual-devtracker.createServerList', async () => {
        await RpcServerExplorer.newServerList();
    });

    const createWalletFileCommand = vscode.commands.registerCommand('neo-visual-devtracker.createWalletFile', async () => {
        await WalletExplorer.newWalletFile();
    });

    const editJsonCommand = vscode.commands.registerCommand('neo-visual-devtracker.editJson', async (item) => {
        await RpcServerExplorer.editJsonFile(item);
    });

    const serverExplorerProvider = vscode.window.registerTreeDataProvider('neo-visual-devtracker.rpcServerExplorer', rpcServerExplorer);

    const waletExplorerProvider = vscode.languages.registerCodeLensProvider({ language: 'json' }, walletExplorer);

    context.subscriptions.push(openTrackerCommand);
    context.subscriptions.push(refreshServersCommand);
    context.subscriptions.push(startServerCommand);
    context.subscriptions.push(stopServerCommand);
    context.subscriptions.push(createWalletCommand);
    context.subscriptions.push(createCheckpointCommand);
    context.subscriptions.push(transferCommand);
    context.subscriptions.push(claimCommand);
    context.subscriptions.push(deployContractCommand);
    context.subscriptions.push(invokeContractCommand);
    context.subscriptions.push(createInstanceCommand);
    context.subscriptions.push(createAccountCommand);
    context.subscriptions.push(createServerListCommand);
    context.subscriptions.push(createWalletFileCommand);
    context.subscriptions.push(editJsonCommand);
    context.subscriptions.push(serverExplorerProvider);
    context.subscriptions.push(waletExplorerProvider);
}

export function deactivate() {

}
