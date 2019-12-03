import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as shellEscape from 'shell-escape';
import * as vscode from 'vscode';

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
        try {
            this.viewState.showError = false;
            this.viewState.showSuccess = false;
            let command = shellEscape.default(['neo-express', 'transfer']);
            command += ' -i ' + TransferPanel.doubleQuoteEscape(this.viewState.neoExpressJsonFullPath);
            command += ' ' + TransferPanel.doubleQuoteEscape(this.viewState.assetName || 'unknown');
            command += ' ' + (parseFloat(this.viewState.amount || '0') || 0);
            command += ' ' + TransferPanel.doubleQuoteEscape(this.viewState.sourceWallet || 'unknown');
            command += ' ' + TransferPanel.doubleQuoteEscape(this.viewState.destinationWallet || 'unknown');
            const output = await new Promise((resolve, reject) => {
                childProcess.exec(command, (error, stdout, stderr) => {
                    if (error) {
                        reject(error);
                    } else if (stderr) {
                        reject(stderr);
                    } else {
                        resolve(stdout);
                    }
                });
            });
            console.info('Transfer completed', command, output);
            this.viewState.showSuccess = true;
            this.viewState.result = command;
        } catch (e) {
            this.viewState.showError = true;
            this.viewState.result = 'The transfer failed. Please check that the values entered are valid and try again.';
            console.error('Transfer failed ', e);
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
        this.viewState.sourceWalletBalancesError = false;
        if (this.viewState.sourceWallet) {
            try {
                let command = shellEscape.default(['neo-express', 'show', 'account']);
                command += ' ' + TransferPanel.doubleQuoteEscape(this.viewState.sourceWallet);
                command += ' -i ' + TransferPanel.doubleQuoteEscape(this.viewState.neoExpressJsonFullPath);
                const accountJson = await new Promise((resolve, reject) => {
                    childProcess.exec(command, (error, stdout, stderr) => {
                        if (error) {
                            reject(error);
                        } else if (stderr) {
                            reject(stderr);
                        } else {
                            resolve(stdout);
                        }
                    });
                });
                const account = JSON.parse(accountJson as string);
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
            } catch (e) {
                this.viewState.sourceWalletBalancesError = true;
                console.error('Could not get balances for ', this.viewState.sourceWallet, e);
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

    private static doubleQuoteEscape(argument: string) {
        let escaped = shellEscape.default([ argument ]);
        if ((escaped.length >= 2) && 
            (escaped[0] === '\'') && 
            (escaped[escaped.length - 1] === '\'')) {
            escaped = '"' + escaped.substring(1, escaped.length - 1).replace(/"/g, '\\"') + '"';
        }
        return escaped;
    }

}