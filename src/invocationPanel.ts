import * as fs from 'fs';
import * as neon from '@cityofzion/neon-js';
import * as path from 'path';
import * as vscode from 'vscode';

import { CheckpointDetector } from './checkpointDetector';
import { ContractDetector } from './contractDetector';
import { INeoRpcConnection } from './neoRpcConnection';
import { invokeEvents } from './panels/invokeEvents';
import { NeoExpressConfig } from './neoExpressConfig';
import { NeoTrackerPanel } from './neoTrackerPanel';
import { ResultValue } from './resultValue';
import { WalletExplorer } from './walletExplorer';

import { api } from '@cityofzion/neon-js';
import { DoInvokeConfig } from '@cityofzion/neon-api/lib/funcs/types';
import { TransactionOutput } from '@cityofzion/neon-core/lib/tx';

const bs58check = require('bs58check');

const JavascriptHrefPlaceholder : string = '[JAVASCRIPT_HREF]';
const CssHrefPlaceholder : string = '[CSS_HREF]';

class ViewState {
    rpcUrl: string = '';
    rpcDescription: string = '';
    wallets: any[] = [];
    checkpoints: any[] = [];
    contracts: any[] = [];
    selectedContract: string = '';
    selectedMethod: string = '';
    invocationError?: string;
    showResult?: boolean;
    resultVmState?: string;
    resultGasUsed?: string;
    resultValues?: ResultValue[];
    broadcastResult?: string;
}

export class InvocationPanel {

    private readonly neoExpressConfig?: NeoExpressConfig;
    private readonly panel: vscode.WebviewPanel;
    private readonly walletExplorer: WalletExplorer;
    private readonly contractDetector: ContractDetector;
    private readonly checkpointDetector: CheckpointDetector;
    private readonly startSearch: Function;
    
    private viewState: ViewState;
    private jsonParsed: boolean;

    constructor(
        extensionPath: string,
        rpcUrl: string,
        rpcConnection: INeoRpcConnection,
        historyId: string,
        state: vscode.Memento,
        walletExplorer: WalletExplorer,
        contractDetector: ContractDetector,
        checkpointDetector: CheckpointDetector,
        disposables: vscode.Disposable[],
        neoExpressConfig?: NeoExpressConfig) {

        this.jsonParsed = false;

        this.walletExplorer = walletExplorer;
        this.contractDetector = contractDetector;
        this.checkpointDetector = checkpointDetector;
        this.neoExpressConfig = neoExpressConfig;

        this.startSearch = async (q: string) => {
            await NeoTrackerPanel.newSearch(
                q, 
                extensionPath, 
                rpcConnection, 
                historyId, 
                state, 
                walletExplorer, 
                disposables, 
                neoExpressConfig);
        };

        this.viewState = new ViewState();
        this.viewState.rpcDescription = neoExpressConfig ? neoExpressConfig.neoExpressJsonFullPath : '';
        this.viewState.rpcUrl = rpcUrl;

        this.panel = vscode.window.createWebviewPanel(
            'invocationPanel',
            (neoExpressConfig ? neoExpressConfig.basename : rpcUrl) + ' - Invoke contract',
            vscode.ViewColumn.Active,
            { enableScripts: true });

        this.panel.iconPath = vscode.Uri.file(path.join(extensionPath, 'resources', 'neo.svg'));

        this.panel.onDidDispose(this.onClose, this, disposables);
        this.panel.webview.onDidReceiveMessage(this.onMessage, this, disposables);

        const htmlFileContents = fs.readFileSync(
            path.join(extensionPath, 'src', 'panels', 'invoke.html'), { encoding: 'utf8' });
        const javascriptHref : string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panels', 'bundles', 'invoke.main.js'))) + '';
        const cssHref : string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panels', 'invoke.css'))) + '';
        this.panel.webview.html = htmlFileContents
            .replace(JavascriptHrefPlaceholder, javascriptHref)
            .replace(CssHrefPlaceholder, cssHref);
    }

    private async reload() {        
        this.viewState.contracts = [];

        if (this.neoExpressConfig) {
            this.neoExpressConfig.refresh();
            this.viewState.contracts = this.neoExpressConfig.contracts.slice();
        }

        // TODO: Don't assume all contracts found in the workspace have been deployed.
        const workspaceContracts = this.contractDetector.contracts;
        for (let i = 0; i < workspaceContracts.length; i++) {
            if (this.viewState.contracts.filter(c => c.hash.toLowerCase() === workspaceContracts[i].hash.toLowerCase()).length === 0) {
                this.viewState.contracts.push(workspaceContracts[i].abi);
            }
        }

        this.jsonParsed = true;
    }

    private onClose() {
    }

    private async onMessage(message: any) {
        if (!this.jsonParsed) {
            await this.reload();
        }

        this.viewState.checkpoints = this.checkpointDetector.checkpoints || [];

        this.viewState.wallets = [];
        if (this.neoExpressConfig) {
            this.viewState.wallets = this.neoExpressConfig.wallets.slice();
        }
        for (let i = 0; i < this.walletExplorer.allAccounts.length; i++) {
            this.viewState.wallets.push(this.walletExplorer.allAccounts[i]);
        }

        if (message.e === invokeEvents.Init) {
            this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === invokeEvents.Update) {
            this.viewState = message.c;
        } else if (message.e === invokeEvents.InvokeOffChain) {
            await this.invoke(message.c, /*onChain=*/ false);
            this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === invokeEvents.InvokeOnChain) {
            await this.invoke(message.c, /*onChain=*/ true);
            this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === invokeEvents.Dismiss) {
            this.viewState.invocationError = '';
            this.viewState.broadcastResult = '';
            this.viewState.showResult = false;
            this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === invokeEvents.Debug) {
            this.viewState.invocationError = undefined;
            if (!(await this.startDebugging(message.c, false))) {
                this.viewState.invocationError = this.viewState.invocationError || 'There was an error launching the debugger.';
                this.panel.webview.postMessage({ viewState: this.viewState });
            }
        } else if (message.e === invokeEvents.AddDebugConfig) {
            this.viewState.invocationError = undefined;
            if (!(await this.startDebugging(message.c, true))) {
                this.viewState.invocationError = this.viewState.invocationError || 'There was an error creating the debug configuration.';
                this.panel.webview.postMessage({ viewState: this.viewState });
            }
        } else if (message.e === invokeEvents.Search) {
            await this.startSearch(message.c);
        }
    }

    private async invoke(methodName: string, onChain: boolean) {
        try {
            for (let i = 0; i < this.viewState.contracts.length; i++) {
                if (this.viewState.contracts[i].hash === this.viewState.selectedContract) {
                    const contract = this.viewState.contracts[i];
                    for (let j = 0; j < contract.functions.length; j++) {
                        if (contract.functions[j].name === methodName) {
                            const method = contract.functions[j];
                            const contractHash = contract.hash.replace(/^0x/, '');

                            const rpcClient = new neon.rpc.RPCClient(this.viewState.rpcUrl);
                            try {
                                await rpcClient.getContractState(contractHash);
                            } catch (e) {
                                this.viewState.showResult = false;
                                this.viewState.broadcastResult = undefined;
                                this.viewState.invocationError = 'Could not invoke ' + methodName + '; the contract is not deployed';
                                return;
                            }

                            const sb = neon.default.create.scriptBuilder();
                            let script = '';
                            if (method.name === 'Main') {
                                if (method.parameters.length === 0) {
                                    script = sb.emitAppCall(contractHash).str;
                                } else if (method.parameters.length === 1) {
                                    script = sb.emitAppCall(contractHash, method.parameters[0].value).str;
                                } else {
                                    const args = InvocationPanel.parseArrayArgument(method.parameters[1].value);
                                    script = sb.emitAppCall(
                                        contractHash, 
                                        method.parameters[0].value, 
                                        args).str;
                                }
                            } else {
                                const args = InvocationPanel.extractArguments(method.parameters);
                                script = sb.emitAppCall(
                                    contractHash, 
                                    method.name, 
                                    args).str;
                            }
                            
                            if (onChain) {
                                const walletConfig = this.viewState.wallets.filter(_ => _.address === method.walletAddress)[0];
                                const walletAddress = walletConfig ? walletConfig.address : undefined;
                                if (!walletAddress) {
                                    method.walletAddress = '';
                                    this.viewState.broadcastResult = '';
                                    this.viewState.showResult = false;
                                    this.viewState.invocationError = 'Please select a wallet';
                                } else {
                                    if (await walletConfig.unlock()) {
                                        const api = new neon.api.neoCli.instance(this.viewState.rpcUrl);
                                        const config: DoInvokeConfig = {
                                            api: api,
                                            script: script,
                                            account: walletConfig.account,
                                            intents: InvocationPanel.extractIntents(method, contractHash),
                                        };
                                        const result = await neon.default.doInvoke(config);
                                        if (result.response && result.response.txid) {
                                            this.viewState.broadcastResult = result.response.txid;
                                        } else {
                                            this.viewState.broadcastResult = undefined;
                                            this.viewState.invocationError = 'No response from RPC server; transaction may not have been relayed';
                                        }
                                    } else {
                                        return;
                                    }
                                }
                            } else {
                                const rpcClient = new neon.rpc.RPCClient(this.viewState.rpcUrl);
                                const result = await rpcClient.invokeScript(script);
                                this.viewState.showResult = true;
                                this.viewState.resultGasUsed = result.gas_consumed;
                                this.viewState.resultVmState = result.state;
                                this.viewState.resultValues = result.stack.map(_ => new ResultValue(_));
                            }

                            return;
                        }
                    }
                    this.viewState.showResult = false;
                    this.viewState.broadcastResult = undefined;
                    this.viewState.invocationError =
                        'Could not find NEO Express configuration for method ' + methodName;
                    return;
                }
            }
            this.viewState.showResult = false;
            this.viewState.broadcastResult = undefined;
            this.viewState.invocationError = 
                'Could not find NEO Express configuration for contract with hash ' + this.viewState.selectedContract;
        } catch (e) {
            this.viewState.showResult = false;
            this.viewState.broadcastResult = undefined;
            this.viewState.invocationError = 'Could not invoke ' + methodName + ': ' + e;
        }
    }

    private async startDebugging(methodName: string, addToLaunchJson: boolean) {
        try {
            for (let i = 0; i < this.viewState.contracts.length; i++) {
                const contractHash = this.viewState.contracts[i].hash;
                if (contractHash === this.viewState.selectedContract) {
                    const contract = this.viewState.contracts[i];
                    const contractName = contract.name;
                    for (let j = 0; j < contract.functions.length; j++) {
                        const method = contract.functions[j];
                        if (method.name === methodName) {
                            let compiledContract = this.contractDetector.getContractByHash(contractHash);
                            if (compiledContract) {
                                let args: any[] = [];
                                if (methodName === 'Main') {
                                    if (method.parameters.length === 0) {
                                        args = [];
                                    } else if (method.parameters.length === 1) {
                                        args = [ method.parameters[0].value, '[]' ];
                                    } else {
                                        args = [
                                            method.parameters[0].value,
                                            InvocationPanel.parseArrayArgument(method.parameters[1].value || '[]'),
                                        ];
                                    }
                                } else {
                                    args = [
                                        methodName,
                                        InvocationPanel.extractArguments(method.parameters),
                                    ];
                                }
                                const debugConfiguration: vscode.DebugConfiguration = {
                                    'name': contractName + '-' + methodName,
                                    'type': 'neo-contract',
                                    'request': 'launch',
                                    'program': compiledContract.path,
                                    'args': args,
                                    'storage': [],
                                    'runtime': {
                                        'witnesses': {
                                            'check-result': true,
                                        }
                                    }
                                };
                                method.selectedCheckpoint = this.viewState.checkpoints.map(c => c.fullpath).filter(fp => fp === method.selectedCheckpoint)[0];
                                if (method.selectedCheckpoint) {
                                    debugConfiguration['checkpoint'] = method.selectedCheckpoint;
                                }
                                if (addToLaunchJson) {
                                    return await this.addToLaunchJson(debugConfiguration);
                                } else {
                                    return await vscode.debug.startDebugging(undefined, debugConfiguration);
                                }
                            } else {
                                this.viewState.invocationError = 'Could not find an AVM file for this contract in the current workspace.';
                                return false;
                            }
                        }
                    }
                }
            }
        } catch (e) {
            this.viewState.invocationError = 'Could not debug ' + methodName + ': ' + e;
            return false;
        }

        this.viewState.invocationError = 'Could not find NEO Express configuration for this contract.';
        return false;
    }

    private async addToLaunchJson(debugConfiguration: vscode.DebugConfiguration) {
        if (!vscode.workspace.workspaceFolders || !vscode.workspace.workspaceFolders.length) {
            this.viewState.invocationError = 'The current workspace does not contain any folders.';
            return false;
        }

        let workspaceFolder = vscode.workspace.workspaceFolders[0].uri;
        if (vscode.workspace.workspaceFolders.length > 1) {
            const selectedWorkspace = await vscode.window.showQuickPick(
                vscode.workspace.workspaceFolders.map(_ => _.uri.toString()),
                { placeHolder: 'Select a workspace folder' });
            if (!selectedWorkspace) {
                this.viewState.invocationError = 'A workspace folder must be selected.';
                return false;
            }
            workspaceFolder = vscode.Uri.parse(selectedWorkspace);
        }
        const config = vscode.workspace.getConfiguration('launch', workspaceFolder);
        const debugConfigurations = config.configurations || [];

        const desiredName = debugConfiguration.name;
        let deDuplicationIndex = 0;
        while (debugConfigurations.find((_: vscode.DebugConfiguration) => _.name === debugConfiguration.name)) {
            deDuplicationIndex++;
            debugConfiguration.name = desiredName + '-' + deDuplicationIndex;
        }

        const workspaceFolderString = workspaceFolder.fsPath.toString();
        if (debugConfiguration.program && debugConfiguration.program.startsWith(workspaceFolderString)) {
            debugConfiguration.program = '${workspaceFolder}' + debugConfiguration.program.substr(workspaceFolderString.length);
        }
        if (debugConfiguration.checkpoint && debugConfiguration.checkpoint.startsWith(workspaceFolderString)) {
            debugConfiguration.checkpoint = '${workspaceFolder}' + debugConfiguration.checkpoint.substr(workspaceFolderString.length);
        }

        debugConfigurations.push(debugConfiguration);
        await config.update('configurations', debugConfigurations, vscode.ConfigurationTarget.WorkspaceFolder);
        await vscode.window.showTextDocument(
            await vscode.workspace.openTextDocument(path.join(workspaceFolderString, '.vscode', 'launch.json')));
        return true;
    }

    private static extractArguments(parameters: any[]) {
        const result = [];
        for (let i = 0; i < parameters.length; i++) {
            const parameter = parameters[i];
            parameter.value = parameter.value || '';
            if (parameter.type === 'ByteArray') {
                result.push(InvocationPanel.parseStringArgument(parameter.value));
            } else if (parameter.type === 'Integer') {
                result.push(parseInt(parameter.value) || 0);
            } else if (parameter.type === 'String') {
                result.push((Buffer.from(parameter.value)).toString('hex'));
            } else if (parameter.type === 'Array') {
                result.push(InvocationPanel.parseArrayArgument(parameter.value));
            } else {
                throw new Error('Parameters of type ' + parameter.type + ' not yet supported');
            }
        }
        return result;
    }

    private static extractIntents(method: any, contractHash: string): TransactionOutput[] | undefined {
        const symbol = method.intentSymbol;
        const value = method.intentValue;
        if (symbol && value) {
            const numericValue = parseFloat(value);
            if (!isNaN(numericValue) && (numericValue > 0)) {
                const intentAssets: any = {};
                intentAssets[symbol] = value;
                return api.makeIntent(intentAssets, contractHash);
            }
        }

        return undefined;
    }

    private static parseArrayArgument(parameter: string) {
        const array = JSON.parse(parameter);
        if (!Array.isArray(array)) {
            throw new Error('Object passed instead of an array');
        }
        for (let j = 0; j < array.length; j++) {
            if (typeof array[j] !== 'number') {
                array[j] = InvocationPanel.parseStringArgument(array[j]);
            }
        }
        return array;
    }

    private static parseStringArgument(parameter: string) {
        // For ByteArray parameters, the user can provide either:
        // i)   A NEO address (prefixed with '@'), or
        // ii)  A hex string (prefixed with '0x'), or
        // iii) An arbitrary string
        if (parameter[0] === '@') { // case (i)
            return bs58check.decode(parameter.substring(1)).toString('hex');
        } else if ((parameter[0] === '0') && (parameter[1] === 'x')) { // case (ii)
            return parameter.substring(2);
        } else { // case (iii)
            return (Buffer.from(parameter)).toString('hex');
        }
    }

    dispose() {
        this.panel.dispose();
    }

}