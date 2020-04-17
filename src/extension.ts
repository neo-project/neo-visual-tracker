import * as vscode from 'vscode';
import * as grpc from 'grpc';

import * as ttfClient from './ttf/protos/service_grpc_pb';

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
import { StartPanel } from './startPanel';
import { StoragePanel } from './storagePanel';
import { TokenDefinitionExplorer } from './tokenDefinitionExplorer';
import { TokenDesignerPanel } from './tokenDesignerPanel';
import { TokenFormulaExplorer } from './tokenFormulaExplorer';
import { TokenTaxonomy } from './tokenTaxonomy';
import { TransferPanel } from './transferPanel';
import { WalletExplorer } from './walletExplorer';

export function activate(context: vscode.ExtensionContext) {

    const ttfConnection = new ttfClient.ServiceClient('127.0.0.1:8086', grpc.credentials.createInsecure());

    const ttfTaxonomy = new TokenTaxonomy(ttfConnection);

    const rpcConnectionPool = new RpcConnectionPool();

    const rpcServerExplorer = new RpcServerExplorer(context.extensionPath, rpcConnectionPool);

    const tokenFormulaExplorer = new TokenFormulaExplorer(context.extensionPath, ttfTaxonomy);

    const tokenDefinitionExplorer = new TokenDefinitionExplorer(context.extensionPath, ttfTaxonomy);

    const neoExpressInstanceManager = new NeoExpressInstanceManager();

    const contractDetector = new ContractDetector();
    
    const walletExplorer = new WalletExplorer();
    
    const checkpointDetector = new CheckpointDetector();

    const neoExpressHelper = new NeoExpressHelper();

    let createInstancePanel: CreateInstancePanel | null = null;

    const selectUri = async (title: string, server: any, state: vscode.Memento) => {
        if (!server) {
            return;
        }
            
        let node = server.rpcUri ? server.parent : server;
        let uriSelectionId = '';
        while (node) {
            uriSelectionId = '|' + (node.jsonFile || node.label || '*').replace(/[|]/g, '?') + uriSelectionId;
            node = node.parent;
        }
        const stateKey = 'LastUri:' + uriSelectionId;
        let lastUsedUri = state.get<string | undefined>(stateKey, undefined);

        if (server.rpcUri) {
            state.update(stateKey, server.rpcUri);
            return server.rpcUri;
        } else if (server.children && server.children.length) {
            const possibleUris = server.children.map((_: any) => _.rpcUri).filter((_: any) => !!_);
            if (possibleUris.length) {
                if (possibleUris.length === 1) {
                    state.update(stateKey, possibleUris[0]);
                    return possibleUris[0];
                } else {
                    if (possibleUris.indexOf(lastUsedUri) !== -1) {
                        return lastUsedUri;
                    } else {
                        const quickPick = vscode.window.createQuickPick();
                        quickPick.title = title;
                        quickPick.placeholder = 'Select an RPC server (Press \'Enter\' to confirm or \'Escape\' to cancel)';
                        quickPick.items = possibleUris.sort((a: string, b: string) => a > b ? 1 : -1).map((_: string) => { return { label: _ }; });
                        quickPick.activeItems = quickPick.items.filter((_: any) => _.label === lastUsedUri);
                        const result = await new Promise(resolve => {
                            quickPick.onDidAccept(() => resolve(quickPick.activeItems[0].label));
                            quickPick.show();
                        });
                        state.update(stateKey, result);
                        return result;
                    }
                }
            }
        } 
    };

    const selectBlockchain = async (title: string, state: vscode.Memento, filter: (string | undefined)[] = []) => {
        const stateKey = 'LastBlockchain:' + filter.join('|');
        let blockchains = rpcServerExplorer.getChildren();
        if (blockchains.length === 0) { // Control may still be initializing
            await rpcServerExplorer.refresh();
            blockchains = rpcServerExplorer.getChildren();
        }

        if (filter.length) {
            blockchains = blockchains.filter(_ => filter.indexOf(_.asTreeItem().contextValue) !== -1);
        }

        if (blockchains.length === 1) {
            return blockchains[0];
        } else if (blockchains.length > 1) {
            let lastUsedBlockchain = state.get<string | undefined>(stateKey, undefined);
            const quickPick = vscode.window.createQuickPick();
            quickPick.title = title;
            quickPick.placeholder = 'Select a blockchain (Press \'Enter\' to confirm or \'Escape\' to cancel)';
            quickPick.items = blockchains.filter(_ => !!_.label).map((_: RpcServerTreeItemIdentifier) => { return { label: _.label as string, server: _ }; });
            quickPick.activeItems = quickPick.items.filter((_: any) => _.label === lastUsedBlockchain);
            const selectedItem: any = await new Promise(resolve => {
                quickPick.onDidAccept(() => {
                    resolve(quickPick.activeItems[0]);
                    quickPick.hide();
                });
                quickPick.show();
            });
            if (selectedItem) {
                state.update(stateKey, selectedItem.label);
            }
            return selectedItem.server;
        }
        console.error('Could not select a blockchain; context:', stateKey);
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
            server = server || await selectBlockchain('Open Neo Visual DevTracker', context.globalState);
            if (!server) {
                return;
            }
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

    const openStorageExplorerCommand = vscode.commands.registerCommand('neo-visual-devtracker.storageExplorer', async (server) => {
        await neoExpressHelper.requireNeoExpress('*', async () => {
            server = server || await selectBlockchain('Explore Storage', context.globalState, [ 'expressNode', 'expressNodeMulti' ]);
            if (!server) {
                return;
            }
            const rpcUri = await selectUri('Explore Storage', server, context.globalState);
            try {
                const panel = new StoragePanel(
                    context.extensionPath,
                    rpcUri,
                    rpcConnectionPool.getConnection(rpcUri),
                    contractDetector,
                    context.subscriptions,
                    server.jsonFile ? new NeoExpressConfig(server.jsonFile) : undefined);
            } catch (e) {
                console.error('Error opening new storage explorer panel ', e);
            }
        });
    });

    const refreshServersCommand = vscode.commands.registerCommand('neo-visual-devtracker.refreshObjectExplorerNode', () => {
        rpcServerExplorer.refresh();
        walletExplorer.refresh();
        checkpointDetector.refresh();
        contractDetector.refresh();
    });

    const startServerCommand = vscode.commands.registerCommand('neo-visual-devtracker.startServer', async (server) => {
        await neoExpressHelper.requireNeoExpress('*', async () => {
            server = server || await selectBlockchain('Start Neo Express (using default options)', context.globalState, [ 'expressNode', 'expressNodeMulti' ]);
            if (!server) {
                return;
            }
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

    const startServerAdvancedCommand = vscode.commands.registerCommand('neo-visual-devtracker.startServerAdvanced', async (server) => {
        await neoExpressHelper.requireNeoExpress('*', async () => {
            server = server || await selectBlockchain('Start Neo Express...', context.globalState, [ 'expressNode', 'expressNodeMulti' ]);
            if (!server) {
                return;
            }
            try {        
                const panel = new StartPanel(
                    context.extensionPath,
                    new NeoExpressConfig(server.jsonFile),
                    neoExpressInstanceManager,
                    checkpointDetector,
                    context.subscriptions);
            } catch (e) {
                console.error('Error opening advanced start panel ', e);
            }
        });
    });

    const stopServerCommand = vscode.commands.registerCommand('neo-visual-devtracker.stopServer', async (server) => {
        await neoExpressHelper.requireNeoExpress('*', async () => {
            server = server || await selectBlockchain('Stop Neo Express', context.globalState, [ 'expressNode', 'expressNodeMulti' ]);
            if (!server) {
                return;
            }
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
        await neoExpressHelper.requireNeoExpress('*', async () => {
            server = server || await selectBlockchain('Create Neo Express wallet', context.globalState, [ 'expressNode', 'expressNodeMulti' ]);
            if (!server) {
                return;
            }
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
                    const result = await neoExpressHelper.createWallet(server.jsonFile, walletName, allowOverwrite);
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
        await neoExpressHelper.requireNeoExpress('*', async () => {
            server = server || await selectBlockchain('Create checkpoint', context.globalState, [ 'expressNode' ]);
            if (!server) {
                return;
            }
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
        await neoExpressHelper.requireNeoExpress('*', async () => {
            server = server || await selectBlockchain('Restore checkpoint', context.globalState, [ 'expressNode' ]);
            if (!server) {
                return;
            }
            const neoExpressConfig = new NeoExpressConfig(server.jsonFile);
            const checkpoints = checkpointDetector.checkpoints.filter(_ => _.magic === neoExpressConfig.magic);
            if (checkpoints.length) {
                const checkpoint = await vscode.window.showQuickPick(checkpoints);
                if (checkpoint) {
                    const result = await neoExpressHelper.restoreCheckpoint(
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
            server = server || await selectBlockchain('Transfer assets', context.globalState);
            if (!server) {
                return;
            }
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
            server = server || await selectBlockchain('Claim GAS', context.globalState);
            if (!server) {
                return;
            }
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
            if (!commandContext) {
                server = await selectBlockchain('Deploy contract', context.globalState);
            } else if (commandContext.fsPath) {
                contractPathHint = commandContext.fsPath;
                server = await selectBlockchain('Deploy contract', context.globalState);
            }
            if (server) {
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
            }
        } catch (e) {
            console.error('Error opening contract deployment panel ', e);
        }
    });

    const invokeContractCommand = vscode.commands.registerCommand('neo-visual-devtracker.invokeContract', async (server) => {
        try {
            server = server || await selectBlockchain('Invoke contract', context.globalState);
            if (!server) {
                return;
            }
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
        await neoExpressHelper.requireNeoExpress('*', () => {
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
                    neoExpressHelper,
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

    const createTokenFormulaCommand = vscode.commands.registerCommand('neo-visual-devtracker.createTokenFormula', async (commandContext) => {
        const panel = await TokenDesignerPanel.openNewFormula(ttfConnection, ttfTaxonomy, context.extensionPath, context.subscriptions);
    });

    const openTokenFormulaCommand = vscode.commands.registerCommand('neo-visual-devtracker.openTokenFormula', async (commandContext) => {
        const panel = await TokenDesignerPanel.openExistingFormula(commandContext, ttfConnection, ttfTaxonomy, context.extensionPath, context.subscriptions);
    });

    const createTokenDefinitionCommand = vscode.commands.registerCommand('neo-visual-devtracker.createTokenDefinition', async (commandContext) => {
        const panel = await TokenDesignerPanel.openNewDefinition(commandContext?.id || '', ttfConnection, ttfTaxonomy, context.extensionPath, context.subscriptions);
    });

    const openTokenDefinitionCommand = vscode.commands.registerCommand('neo-visual-devtracker.openTokenDefinition', async (commandContext) => {
        const panel = await TokenDesignerPanel.openExistingDefinition(commandContext, ttfConnection, ttfTaxonomy, context.extensionPath, context.subscriptions);
    });

    const refreshTokenTaxonomyCommand = vscode.commands.registerCommand('neo-visual-devtracker.refreshTokenTaxonomy', async (commandContext) => {
        await ttfTaxonomy.refresh();
    });

    const tokenFormulaExplorerProvider = vscode.window.registerTreeDataProvider('neo-visual-devtracker.tokenFormulaExplorer', tokenFormulaExplorer);

    const tokenDefinitionExplorerProvider = vscode.window.registerTreeDataProvider('neo-visual-devtracker.tokenDefinitionExplorer', tokenDefinitionExplorer);

    const serverExplorerProvider = vscode.window.registerTreeDataProvider('neo-visual-devtracker.rpcServerExplorer', rpcServerExplorer);

    const waletExplorerProvider = vscode.languages.registerCodeLensProvider({ language: 'json' }, walletExplorer);

    context.subscriptions.push(openTrackerCommand);
    context.subscriptions.push(openStorageExplorerCommand);
    context.subscriptions.push(refreshServersCommand);
    context.subscriptions.push(startServerCommand);
    context.subscriptions.push(startServerAdvancedCommand);
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
    context.subscriptions.push(createTokenFormulaCommand);
    context.subscriptions.push(openTokenFormulaCommand);
    context.subscriptions.push(createTokenDefinitionCommand);
    context.subscriptions.push(openTokenDefinitionCommand);
    context.subscriptions.push(refreshTokenTaxonomyCommand);
    context.subscriptions.push(tokenFormulaExplorerProvider);
    context.subscriptions.push(tokenDefinitionExplorerProvider);
    context.subscriptions.push(serverExplorerProvider);
    context.subscriptions.push(waletExplorerProvider);
}

export function deactivate() {

}
