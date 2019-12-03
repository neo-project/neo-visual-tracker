import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { NeoExpressHelper } from './neoExpressHelper';
import { transferEvents } from './panels/transferEvents';

const JavascriptHrefPlaceholder : string = '[JAVASCRIPT_HREF]';
const CssHrefPlaceholder : string = '[CSS_HREF]';

class ViewState {
    neoExpressJsonFullPath: string = '';
    wallets: string[] = [];
    sourceWalletBalances: any[] = [];
    sourceWalletBalancesError: boolean = false;
    sourceWallet?: string = undefined;
    assetName?: string = undefined;
    amount?: string = undefined;
    destinationWallet?: string = undefined;
    showError: boolean = false;
    showSuccess: boolean = false;
    result: string = '';
    isValid: boolean = false;
}

export class TransferPanel {

    private readonly panel: vscode.WebviewPanel;

    private viewState: ViewState;

    constructor(
        extensionPath: string,
        neoExpressJsonFullPath: string,
        disposables: vscode.Disposable[]) {

        this.viewState = new ViewState();
        this.viewState.neoExpressJsonFullPath = neoExpressJsonFullPath;

        this.panel = vscode.window.createWebviewPanel(
            'transferPanel',
            path.basename(neoExpressJsonFullPath) + ' - Transfer assets',
            vscode.ViewColumn.Active,
            { enableScripts: true });
        this.panel.iconPath = vscode.Uri.file(path.join(extensionPath, 'resources', 'neo.svg'));
        this.panel.webview.onDidReceiveMessage(this.onMessage, this, disposables);

        const htmlFileContents = fs.readFileSync(
            path.join(extensionPath, 'src', 'panels', 'transfer.html'), { encoding: 'utf8' });
        const javascriptHref : string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panels', 'bundles', 'transfer.main.js'))) + '';
        const cssHref : string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panels', 'transfer.css'))) + '';
        this.panel.webview.html = htmlFileContents
            .replace(JavascriptHrefPlaceholder, javascriptHref)
            .replace(CssHrefPlaceholder, cssHref);
    }

    public dispose() {
        this.panel.dispose();
    }

    private async doTransfer() {
        const result = await NeoExpressHelper.transfer(
            this.viewState.neoExpressJsonFullPath,
            this.viewState.assetName || 'unknown',
            parseFloat(this.viewState.amount || '0') || 0,
            this.viewState.sourceWallet || 'unknown',
            this.viewState.destinationWallet || 'unknown');
        this.viewState.showError = result.isError;
        this.viewState.showSuccess = !result.isError;
        this.viewState.result = result.output;
        if (result.isError) {
            this.viewState.result = 'The transfer failed. Please check that the values entered are valid and try again.';
        }
    }

    private async onMessage(message: any) {
        if (message.e === transferEvents.Init) {
            await this.refresh();
            await this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === transferEvents.Refresh) {
            await this.refresh();
            await this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === transferEvents.Update) {
            this.viewState = message.c;
            if (message.r) {
                await this.refresh();
            }
            this.validate();
            await this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === transferEvents.Transfer) {
            await this.doTransfer();
            await this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === transferEvents.Close) {
            this.dispose();
        }
    }

    private async refresh() {
        this.viewState.wallets = [ 'genesis' ];

        try {
            const jsonFileContents = fs.readFileSync(this.viewState.neoExpressJsonFullPath, { encoding: 'utf8' });
            const neoExpressConfig = JSON.parse(jsonFileContents);
            const wallets = neoExpressConfig.wallets || [];
            for (let i = 0; i < wallets.length; i++) {
                if (wallets[i].name) {
                    this.viewState.wallets.push(wallets[i].name);
                }
            }
        } catch (e) {
            console.error('TransferPanel encountered an error parsing ', this.viewState.neoExpressJsonFullPath, e);
        }

        this.viewState.sourceWalletBalances = [];
        if (this.viewState.sourceWallet) {
            const accountResult = await NeoExpressHelper.showAccount(
                this.viewState.neoExpressJsonFullPath,
                this.viewState.sourceWallet);
            if (accountResult.isError) {
                this.viewState.sourceWalletBalancesError = true;
            } else {    
                this.viewState.sourceWalletBalancesError = false;
                const account = accountResult.result;
                if (account.balances && account.balances.length) {
                    for (let i = 0; i < account.balances.length; i++) {
                        let assetName = account.balances[i].asset;
                        if (assetName === '0xc56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b') {
                            assetName = 'NEO';
                        } else if (assetName === '0x602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7') {
                            assetName = 'GAS';
                        }
                        this.viewState.sourceWalletBalances.push({
                            asset: assetName,
                            value: account.balances[i].value,
                        });
                    }
                }
            }
        }
        
        this.validate();
    }

    private validate() {
        if (this.viewState.sourceWallet && this.viewState.wallets.indexOf(this.viewState.sourceWallet) === -1) {
            this.viewState.sourceWallet = undefined;
        }

        if (this.viewState.destinationWallet && this.viewState.wallets.indexOf(this.viewState.destinationWallet) === -1) {
            this.viewState.destinationWallet = undefined;
        }

        if (this.viewState.assetName &&
            (this.viewState.sourceWalletBalances.map(_ => _.asset).indexOf(this.viewState.assetName) === -1)) {
            this.viewState.assetName = undefined;
            this.viewState.amount = undefined;
        }

        this.viewState.isValid =
            !!this.viewState.sourceWallet &&
            !!this.viewState.destinationWallet &&
            !this.viewState.sourceWalletBalancesError &&
            !!this.viewState.sourceWalletBalances.length &&
            !!this.viewState.assetName;
    }
}