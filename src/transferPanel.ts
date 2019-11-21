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
            vscode.Uri.file(path.join(extensionPath, 'out', 'panels', 'transferBundle.js'))) + '';
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
        // TODO
    }

    private async onMessage(message: any) {
        if (message.e === transferEvents.Init) {
            await this.updateWallets();
            this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === transferEvents.Update) {
            this.viewState = message.c;
            await this.updateWallets();
            this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === transferEvents.Transfer) {
            await this.updateWallets();
            await this.doTransfer();
            this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === transferEvents.Close) {
            this.dispose();
        }
    }

    private async updateBalances() {
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
    }

    private async updateWallets() {
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

        if (this.viewState.sourceWallet && this.viewState.wallets.indexOf(this.viewState.sourceWallet) === -1) {
            this.viewState.sourceWallet = undefined;
        }

        if (this.viewState.destinationWallet && this.viewState.wallets.indexOf(this.viewState.destinationWallet) === -1) {
            this.viewState.destinationWallet = undefined;
        }

        await this.updateBalances();

        this.viewState.isValid =
            !!this.viewState.sourceWallet &&
            !!this.viewState.destinationWallet &&
            !this.viewState.sourceWalletBalancesError &&
            !!this.viewState.sourceWalletBalances.length;
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