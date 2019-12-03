import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { newwalletEvents } from './panels/newwalletEvents';
import { NeoExpressHelper } from './neoExpressHelper';

const JavascriptHrefPlaceholder : string = '[JAVASCRIPT_HREF]';
const CssHrefPlaceholder : string = '[CSS_HREF]';

class ViewState {
    neoExpressJsonFullPath: string = '';
    walletName: string = '';
    allowOverwrite: boolean = false;
    walletExists: boolean = false;
    showError: boolean = false;
    showSuccess: boolean = false;
    result: string = '';
}

export class NewWalletPanel {

    private readonly panel: vscode.WebviewPanel;

    private viewState: ViewState;
    private jsonParsed: boolean;
    private existingWallets: any[] = [];

    constructor(
        extensionPath: string,
        neoExpressJsonFullPath: string,
        disposables: vscode.Disposable[]) {

        this.jsonParsed = false;

        this.viewState = new ViewState();
        this.viewState.neoExpressJsonFullPath = neoExpressJsonFullPath;

        this.panel = vscode.window.createWebviewPanel(
            'newwalletPanel',
            path.basename(neoExpressJsonFullPath) + ' - Create wallet',
            vscode.ViewColumn.Active,
            { enableScripts: true });
        this.panel.iconPath = vscode.Uri.file(path.join(extensionPath, 'resources', 'neo.svg'));
        this.panel.webview.onDidReceiveMessage(this.onMessage, this, disposables);

        const htmlFileContents = fs.readFileSync(
            path.join(extensionPath, 'src', 'panels', 'newwallet.html'), { encoding: 'utf8' });
        const javascriptHref : string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panels', 'newwalletBundle.js'))) + '';
        const cssHref : string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panels', 'newwallet.css'))) + '';
        this.panel.webview.html = htmlFileContents
            .replace(JavascriptHrefPlaceholder, javascriptHref)
            .replace(CssHrefPlaceholder, cssHref);
    }

    public dispose() {
        this.panel.dispose();
    }

    private async doCreate() {
        const result = await NeoExpressHelper.createWallet(
            this.viewState.neoExpressJsonFullPath,
            this.viewState.walletName,
            this.viewState.allowOverwrite);
        this.viewState.showError = result.isError;
        this.viewState.showSuccess = !result.isError;
        this.viewState.result = result.output;
        this.panel.webview.postMessage({ viewState: this.viewState });
    }

    private async onMessage(message: any) {
        if (!this.jsonParsed) {
            await this.parseJson();
        }

        if (message.e === newwalletEvents.Init) {
            this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === newwalletEvents.Update) {
            this.viewState = message.c;
            this.checkForExistingWallet();
            this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === newwalletEvents.Create) {
            await this.parseJson();
            this.checkForExistingWallet();
            await this.doCreate();
            this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === newwalletEvents.Close) {
            this.dispose();
        }
    }

    private async parseJson() {
        try {
            const jsonFileContents = fs.readFileSync(this.viewState.neoExpressJsonFullPath, { encoding: 'utf8' });
            const neoExpressConfig = JSON.parse(jsonFileContents);
            this.existingWallets = neoExpressConfig.wallets || []; 
        } catch (e) {
            console.error('NewWalletPanel encountered an error parsing ', this.viewState.neoExpressJsonFullPath, e);
            this.existingWallets = [];
        }
        this.jsonParsed = true;
    }

    private checkForExistingWallet() {
        const matches = this.existingWallets.filter(
            _ => _.name.toLowerCase() === this.viewState.walletName.toLowerCase());
        this.viewState.walletExists = matches.length > 0;
        if (!this.viewState.walletExists) {
            this.viewState.allowOverwrite = false;
        }
    }

}