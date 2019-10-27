import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import Neon, { api, wallet } from "@cityofzion/neon-js";

import { invokeEvents } from './panels/invokeEvents';
import { DoInvokeConfig } from '@cityofzion/neon-api/lib/funcs/types';

const JavascriptHrefPlaceholder : string = '[JAVASCRIPT_HREF]';
const CssHrefPlaceholder : string = '[CSS_HREF]';

class ViewState {
    rpcUrl: string = '';
    neoExpressJsonFullPath: string = '';
    neoExpressJsonFileName: string = '';
    wallets: any[] = [];
    contracts: any[] = [];
    selectedWallet: string = '';
    selectedContract: string = '';
    selectedMethod: string = '';
    invocationError?: string;
    invocationResult?: string;
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
            this.viewState.neoExpressJsonFileName,
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
        } else if (message.e === invokeEvents.Invoke) {
            await this.invoke(message.c);
            this.panel.webview.postMessage({ viewState: this.viewState });
        }
    }

    private async invoke(methodName: string) {
        try {
            for (let i = 0; i < this.viewState.contracts.length; i++) {
                if (this.viewState.contracts[i].hash === this.viewState.selectedContract) {
                    const contract = this.viewState.contracts[i];
                    for (let j = 0; j < contract.functions.length; j++) {
                        if (contract.functions[j].name === methodName) {
                            const method = contract.functions[j];
                            // TODO: Extract parameter data from method
                            const sb = Neon.create.scriptBuilder();
                            const config: DoInvokeConfig = {
                                api: new api.neoCli.instance(this.viewState.rpcUrl),
                                script: sb.emitAppCall(contract.hash.replace(/^0x/, ''), method.name).str,
                                account: new wallet.Account(this.viewState.selectedWallet),
                                // TODO: Allow specification of 'intents' through UI
                            };
                            const result = await Neon.doInvoke(config);
                            this.viewState.invocationResult = JSON.stringify(result);
                            return;
                        }
                    }

                    this.viewState.invocationError =
                        'Could not find NEO Express configuration for method ' + methodName;
                    return;
                }
            }
            this.viewState.invocationError = 
                'Could not find NEO Express configuration for contract with hash ' + this.viewState.selectedContract;
        } catch (e) {
            this.viewState.invocationError = 'Could not invoke ' + methodName + ': ' + e;
        }
    }

    dispose() {
        this.panel.dispose();
    }

}