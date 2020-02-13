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
import { RpcServerExplorer, RpcServerTreeItemIdentifier } from './rpcServerExplorer';
import { RpcConnectionPool } from './rpcConnectionPool';
import { TransferPanel } from './transferPanel';
import { WalletExplorer } from './walletExplorer';

export function activate(context: vscode.ExtensionContext) {

    const rpcConnectionPool = new RpcConnectionPool();

    const rpcServerExplorer = new RpcServerExplorer(context.extensionPath, rpcConnectionPool);

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
                await action();
            } else {
                await vscode.window.showErrorMessage(
                    'Neo Express installation error.\n\nNeo Express did not install successfully. Check the terminal output for more information.');
            }
        }
    });

    const requireNeoExpress = async (then: Function) => {
        if (await NeoExpressHelper.isNeoExpressInstalled()) {
            await then();
        } else if (postInstallAction) {
            await vscode.window.showErrorMessage(
                'Neo Express installation is in progress.\n\nPlease wait for the installation to finish and then try again.');
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

    const selectUri = async (title: string, server: any, state: vscode.Memento) => {
        if (server && server.rpcUri) {
            return server.rpcUri;
        } else if (server && server.children && server.children.length) {
            const possibleUris = server.children.map((_: any) => _.rpcUri).filter((_: any) => !!_);
            if (possibleUris.length) {
                if (possibleUris.length === 1) {
                    return possibleUris[0];
                } else {
                    let node = server;
                    let uriSelectionId = '';
                    while (node) {
                        uriSelectionId = '|' + (node.jsonFile || node.label || '*').replace(/[|]/g, '?') + uriSelectionId;
                        node = node.parent;
                    }
                    let lastUsedUri = state.get<string | undefined>('LastUri:' + uriSelectionId, undefined);
                    if (possibleUris.indexOf(lastUsedUri) === -1) {
                        lastUsedUri = undefined;
                    }
                    const quickPick = vscode.window.createQuickPick();
                    quickPick.title = title;
                    quickPick.placeholder = 'Select an RPC server (Press \'Enter\' to confirm or \'Escape\' to cancel)';
                    quickPick.items = possibleUris.sort((a: string, b: string) => a > b ? 1 : -1).map((_: string) => { return { label: _ }; });
                    quickPick.activeItems = quickPick.items.filter((_: any) => _.label === lastUsedUri);
                    const result = await new Promise(resolve => {
                        quickPick.onDidAccept(() => resolve(quickPick.activeItems[0].label));
                        quickPick.show();
                    });
                    if (result) {
                        state.update('LastUri:' + uriSelectionId, result);
                    }
                    return result;
                }
            }
        } 
        console.error('Could not select an RPC URI from node', server);
        throw new Error('Could not select an RPC URI from node');
    };

    const selectBlockchain = async (title: string, operationContext: string, state: vscode.Memento) => {
        let blockchains = rpcServerExplorer.getChildren();
        if (blockchains.length === 0) { // Control may still be initializing
            await rpcServerExplorer.refresh();
            blockchains = rpcServerExplorer.getChildren();
        }

        if (blockchains.length === 1) {
            return blockchains[0];
        } else if (blockchains.length > 1) {
            let lastUsedBlockchain = state.get<string | undefined>('LastBlockchain:' + operationContext, undefined);
            const quickPick = vscode.window.createQuickPick();
            quickPick.title = title;
            quickPick.placeholder = 'Select a blockchain (Press \'Enter\' to confirm or \'Escape\' to cancel)';
            quickPick.items = blockchains.filter(_ => !!_.label).map((_: RpcServerTreeItemIdentifier) => { return { label: _.label as string, server: _ }; });
            quickPick.activeItems = quickPick.items.filter((_: any) => _.label === lastUsedBlockchain);
            const selectedItem: any = await new Promise(resolve => {
                quickPick.onDidAccept(() => resolve(quickPick.activeItems[0]));
                quickPick.show();
            });
            if (selectedItem) {
                state.update('LastBlockchain:' + operationContext, selectedItem.label);
            }
            return selectedItem.server;
        }
        console.error('Could not select a blockchain; contenxt:', operationContext);
        throw new Error('Could not select a blockchain');
    };

    const getHistoryId = (server: any) => {
        let result = server.label;
        while (server.parent) {
            server = server.parent;
            result = server.label || result;
        }
        return result;
    };

    const openTrackerCommand = vscode.commands.registerCommand('neo-visual-devtracker.openTracker', async (server) => {
        try {
            const rpcUri = await selectUri('Open Neo Visual DevTracker', server, context.globalState);
            if (rpcUri) {
                const panel = new NeoTrackerPanel(
                    context.extensionPath,
                    rpcConnectionPool.getConnection(rpcUri),
                    getHistoryId(server),
                    context.workspaceState,
                    walletExplorer,
                    context.subscriptions,
                    server.jsonFile ? new NeoExpressConfig(server.jsonFile) : undefined);
            }
        } catch (e) {
            console.error('Error opening Neo tracker panel ', e);
        }
    });

    const refreshServersCommand = vscode.commands.registerCommand('neo-visual-devtracker.refreshObjectExplorerNode', () => {
        rpcServerExplorer.refresh();
        walletExplorer.refresh();
        checkpointDetector.refresh();
        contractDetector.refresh();
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
        await requireNeoExpress(async () => {
            try {
                const walletName = await vscode.window.showInputBox({ 
                    ignoreFocusOut: true, 
                    prompt: 'Choose a name for the new wallet',
                    validateInput: _ => _ && _.length ? '' : 'The wallet name cannot be empty',
                });
                if (walletName) {
                    const neoExpressConfig = new NeoExpressConfig(server.jsonFile);
                    let allowOverwrite = false;
                    if (neoExpressConfig.wallets.filter(_ => _.walletName.toLowerCase() === walletName.toLowerCase()).length) {
                        const selection = await vscode.window.showWarningMessage(
                            'A wallet with name \'' + walletName + '\' already exists. Overwrite?', 
                            { modal: true }, 
                            'Overwrite');
                        if (selection !== 'Overwrite') {
                            return;
                        }
                        allowOverwrite = true;
                    } 
                    const result = await NeoExpressHelper.createWallet(server.jsonFile, walletName, allowOverwrite);
                    if (result.isError) {
                        await vscode.window.showErrorMessage(
                            'There was an unexpected error creating the wallet:\r\n\r\n' + result.output);
                    } else {
                        await vscode.window.showInformationMessage(
                            'Wallet created:\r\n' + result.output.replace(/[\r\n]/g, ' ').replace(/( )+/g, ' '));
                    }
                }
            } catch (e) {
                console.error('Error creating new neo-express wallet ', e);
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

    const restoreCheckpointCommand = vscode.commands.registerCommand('neo-visual-devtracker.restoreCheckpoint', async (server) => {
        await requireNeoExpress(async () => {
            const neoExpressConfig = new NeoExpressConfig(server.jsonFile);
            const checkpoints = checkpointDetector.checkpoints.filter(_ => _.magic === neoExpressConfig.magic);
            if (checkpoints.length) {
                const checkpoint = await vscode.window.showQuickPick(checkpoints);
                if (checkpoint) {
                    const result = await NeoExpressHelper.restoreCheckpoint(
                        server.jsonFile, 
                        checkpoint.fullpath, 
                        checkpoint.label);
                    if (result) {
                        if (result.isError) {
                            await vscode.window.showErrorMessage('There was an unexpected error restoring the checkpoint:\r\n\r\n' + result.output);
                        } else {
                            await vscode.window.showInformationMessage('Checkpoint restored');
                        }
                    } 
                }
            } else {
                vscode.window.showErrorMessage('No checkpoints for this Neo Express instance were found in the current workspace');
            }
        });
    });

    const transferCommand = vscode.commands.registerCommand('neo-visual-devtracker.transferAssets', async (server) => {
        try {
            const rpcUri = await selectUri('Transfer assets', server, context.globalState);
            if (rpcUri) {
                const panel = new TransferPanel(
                    context.extensionPath,
                    rpcUri,
                    rpcConnectionPool.getConnection(rpcUri),
                    getHistoryId(server),
                    context.workspaceState,
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
            const rpcUri = await selectUri('Claim GAS', server, context.globalState);
            if (rpcUri) {
                const panel = new ClaimPanel(
                    context.extensionPath,
                    rpcUri,
                    rpcConnectionPool.getConnection(rpcUri),
                    getHistoryId(server),
                    context.workspaceState,
                    walletExplorer,
                    context.subscriptions,
                    server.jsonFile ? new NeoExpressConfig(server.jsonFile) : undefined);
            }
        } catch (e) {
            console.error('Error opening claim panel ', e);
        }
    });

    const deployContractCommand = vscode.commands.registerCommand('neo-visual-devtracker.deployContract', async (commandContext) => {
        try {
            let server: RpcServerTreeItemIdentifier = commandContext;
            let contractPathHint: string = '';
            if (commandContext.fsPath) {
                contractPathHint = commandContext.fsPath;
                server = await selectBlockchain('Deploy contract', 'Deploy:' + contractPathHint, context.globalState);
            }
            const rpcUri = await selectUri('Deploy contract', server, context.globalState);
            if (rpcUri) {
                const panel = new DeployPanel(
                    context.extensionPath,
                    rpcUri,
                    rpcConnectionPool.getConnection(rpcUri),
                    getHistoryId(server),
                    context.workspaceState,
                    walletExplorer,
                    contractDetector,
                    context.subscriptions,
                    server.jsonFile ? new NeoExpressConfig(server.jsonFile) : undefined,
                    contractPathHint);
            }
        } catch (e) {
            console.error('Error opening contract deployment panel ', e);
        }
    });

    const invokeContractCommand = vscode.commands.registerCommand('neo-visual-devtracker.invokeContract', async (server) => {
        try {
            const rpcUri = await selectUri('Invoke contract', server, context.globalState);
            if (rpcUri) {
                const panel = new InvocationPanel(
                    context.extensionPath, 
                    rpcUri,
                    rpcConnectionPool.getConnection(rpcUri),
                    getHistoryId(server),
                    context.workspaceState,
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

    const customizeServerListCommand = vscode.commands.registerCommand('neo-visual-devtracker.customizeServerList', async () => {
        await rpcServerExplorer.customizeServerList();
    });

    const createWalletFileCommand = vscode.commands.registerCommand('neo-visual-devtracker.createWalletFile', async (commandContext) => {
        if (commandContext && commandContext.fsPath) {
            await WalletExplorer.newWalletFile(commandContext.fsPath);
        } else {
            const defaultPath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length ?
                vscode.workspace.workspaceFolders[0].uri.fsPath :
                undefined;
            await WalletExplorer.newWalletFile(defaultPath);
        }
    });

    const serverExplorerProvider = vscode.window.registerTreeDataProvider('neo-visual-devtracker.rpcServerExplorer', rpcServerExplorer);

    const waletExplorerProvider = vscode.languages.registerCodeLensProvider({ language: 'json' }, walletExplorer);

    context.subscriptions.push(openTrackerCommand);
    context.subscriptions.push(refreshServersCommand);
    context.subscriptions.push(startServerCommand);
    context.subscriptions.push(stopServerCommand);
    context.subscriptions.push(createWalletCommand);
    context.subscriptions.push(createCheckpointCommand);
    context.subscriptions.push(restoreCheckpointCommand);
    context.subscriptions.push(transferCommand);
    context.subscriptions.push(claimCommand);
    context.subscriptions.push(deployContractCommand);
    context.subscriptions.push(invokeContractCommand);
    context.subscriptions.push(createInstanceCommand);
    context.subscriptions.push(createAccountCommand);
    context.subscriptions.push(customizeServerListCommand);
    context.subscriptions.push(createWalletFileCommand);
    context.subscriptions.push(serverExplorerProvider);
    context.subscriptions.push(waletExplorerProvider);
}

export function deactivate() {

}
