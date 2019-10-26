import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { invokeEvents } from './panels/invokeEvents';

const JavascriptHrefPlaceholder : string = '[JAVASCRIPT_HREF]';
const CssHrefPlaceholder : string = '[CSS_HREF]';

class ViewState {
    neoExpressJsonFullPath: string = '';
    neoExpressJsonFileName: string = '';
    wallets: any[] = [];
    contracts: any[] = [];
    selectedWallet: string = '';
    selectedContract: string = '';
    selectedMethod: string = '';
}

export class InvocationPanel {

    private readonly panel: vscode.WebviewPanel;
    
    private viewState: ViewState;
    private jsonParsed: boolean;

    constructor(
        extensionPath: string,
        neoExpressJsonFullPath: string,
        disposables: vscode.Disposable[]) {

        this.jsonParsed = false;

        this.viewState = new ViewState();
        this.viewState.neoExpressJsonFullPath = neoExpressJsonFullPath;
        this.viewState.neoExpressJsonFileName = path.basename(neoExpressJsonFullPath);

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
        }
    }

    dispose() {
        this.panel.dispose();
    }

}