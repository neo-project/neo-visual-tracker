import * as fs from 'fs';
import * as neon from '@cityofzion/neon-js';
import * as path from 'path';
import * as vscode from 'vscode';

import { invokeEvents } from './panels/invokeEvents';

import { api } from '@cityofzion/neon-js';
import { DoInvokeConfig } from '@cityofzion/neon-api/lib/funcs/types';
import { TransactionOutput } from '@cityofzion/neon-core/lib/tx';

const bs58check = require('bs58check');

const JavascriptHrefPlaceholder : string = '[JAVASCRIPT_HREF]';
const CssHrefPlaceholder : string = '[CSS_HREF]';

class ResultValue {
    public readonly asInteger: string;
    public readonly asByteArray: string;
    public readonly asString: string;
    public readonly asAddress: string;
    constructor(result: any) {
        let value = result.value;
        if ((value !== null) && (value !== undefined)) {
            if (value.length === 0) {
                value = '00';
            }
            this.asByteArray = '0x' + value;
            const buffer = new Buffer(value, 'hex');
            this.asString = buffer.toString();
            this.asAddress = '';
            if (value.length === 42) {
                this.asAddress = bs58check.encode(buffer);
            }
            buffer.reverse();
            this.asInteger = BigInt('0x' + buffer.toString('hex')).toString();
        } else {
            this.asInteger = '0';
            this.asByteArray = '(empty)';
            this.asString = '(empty)';
            this.asAddress = '(empty)';
        }
    }
}

class ViewState {
    rpcUrl: string = '';
    neoExpressJsonFullPath: string = '';
    neoExpressJsonFileName: string = '';
    wallets: any[] = [];
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

    private readonly panel: vscode.WebviewPanel;

    private viewState: ViewState;
    private jsonParsed: boolean;

    constructor(
        extensionPath: string,
        neoExpressJsonFullPath: string,
        rpcUrl: string,
        disposables: vscode.Disposable[]) {

        this.jsonParsed = false;

        this.viewState = new ViewState();
        this.viewState.neoExpressJsonFullPath = neoExpressJsonFullPath;
        this.viewState.neoExpressJsonFileName = path.basename(neoExpressJsonFullPath);
        this.viewState.rpcUrl = rpcUrl;

        this.panel = vscode.window.createWebviewPanel(
            'invocationPanel',
            this.viewState.neoExpressJsonFileName + ' - Invoke contract',
            vscode.ViewColumn.Active,
            { enableScripts: true });

        this.panel.iconPath = vscode.Uri.file(path.join(extensionPath, 'resources', 'neo.svg'));

        this.panel.onDidDispose(this.onClose, this, disposables);
        this.panel.webview.onDidReceiveMessage(this.onMessage, this, disposables);

        const htmlFileContents = fs.readFileSync(
            path.join(extensionPath, 'src', 'panels', 'invoke.html'), { encoding: 'utf8' });
        const javascriptHref : string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panels', 'invokeBundle.js'))) + '';
        const cssHref : string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panels', 'invoke.css'))) + '';
        this.panel.webview.html = htmlFileContents
            .replace(JavascriptHrefPlaceholder, javascriptHref)
            .replace(CssHrefPlaceholder, cssHref);
    }

    private async reload() {
        console.log('InvocationPanel is parsing ', this.viewState.neoExpressJsonFullPath);
        try {
            const jsonFileContents = fs.readFileSync(this.viewState.neoExpressJsonFullPath, { encoding: 'utf8' });
            const neoExpressConfig = JSON.parse(jsonFileContents);
            this.viewState.wallets = neoExpressConfig.wallets || [];
            this.viewState.contracts = neoExpressConfig.contracts || [];    
        } catch (e) {
            console.error('Error parsing ', this.viewState.neoExpressJsonFullPath, e);
            this.viewState.wallets = [];
            this.viewState.contracts = [];
        }

        this.jsonParsed = true;
    }

    private onClose() {

    }

    private async onMessage(message: any) {
        if (!this.jsonParsed) {
            await this.reload();
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
                            const sb = neon.default.create.scriptBuilder();
                            let script = '';
                            if (method.name === 'Main') {
                                const args = InvocationPanel.parseArrayArgument(method.parameters[1].value);
                                script = sb.emitAppCall(
                                    contractHash, 
                                    method.parameters[0].value, 
                                    args).str;
                            } else {
                                const args = InvocationPanel.extractArguments(method.parameters);
                                script = sb.emitAppCall(
                                    contractHash, 
                                    method.name, 
                                    args).str;
                            }
                            
                            if (onChain) {
                                const selectedWallet = method.selectedWallet;
                                if (!selectedWallet) {
                                    this.viewState.broadcastResult = '';
                                    this.viewState.showResult = false;
                                    this.viewState.invocationError = 'Please select a wallet';
                                } else {
                                    const api = new neon.api.neoCli.instance(this.viewState.rpcUrl);
                                    const config: DoInvokeConfig = {
                                        api: api,
                                        script: script,
                                        account: new neon.wallet.Account(selectedWallet),
                                        intents: InvocationPanel.extractIntents(method, contractHash),
                                    };
                                    const result = await neon.default.doInvoke(config);
                                    if (result.response && result.response.txid) {
                                        this.viewState.broadcastResult = 'Transaction ' + result.response.txid + ' created.';
                                    } else {
                                        this.viewState.broadcastResult = undefined;
                                        this.viewState.invocationError = 'No response from RPC server; transaction may not have been relayed';
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

    private static extractArguments(parameters: any[]) {
        if (parameters.length === 0) {
            return undefined;
        }

        const result = [];
        for (let i = 0; i < parameters.length; i++) {
            const parameter = parameters[i];
            parameter.value = parameter.value || '';
            if (parameter.type === 'ByteArray') {
                result.push(InvocationPanel.parseStringArgument(parameter.value));
            } else if (parameter.type === 'Integer') {
                result.push(parseInt(parameter.value));
            } else if (parameter.type === 'String') {
                result.push((new Buffer(parameter.value)).toString('hex'));
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
            return (new Buffer(parameter)).toString('hex');
        }
    }

    dispose() {
        this.panel.dispose();
    }

}