import * as bignumber from 'bignumber.js';
import * as fs from 'fs';
import * as neon from '@cityofzion/neon-js';
import * as path from 'path';
import * as vscode from 'vscode';

import { INeoRpcConnection } from './neoRpcConnection';
import { NeoExpressConfig } from './neoExpressConfig';
import { transferEvents } from './panels/transferEvents';
import { WalletExplorer } from './walletExplorer';

const JavascriptHrefPlaceholder : string = '[JAVASCRIPT_HREF]';
const CssHrefPlaceholder : string = '[CSS_HREF]';

class ViewState {
    wallets: any[] = [];
    sourceWalletBalances: any[] = [];
    sourceWalletBalancesError: boolean = false;
    sourceWalletAddress?: string = undefined;
    sourceWalletDescription?: string = undefined;
    assetName?: string = undefined;
    amount?: string = undefined;
    destinationWalletAddress?: string = undefined;
    destinationWalletDescription?: string = undefined;
    showError: boolean = false;
    showSuccess: boolean = false;
    result: string = '';
    isValid: boolean = false;
}

export class TransferPanel {

    private readonly neoExpressConfig?: NeoExpressConfig;
    private readonly panel: vscode.WebviewPanel;
    private readonly rpcUri: string;
    private readonly rpcConnection: INeoRpcConnection;
    private readonly walletExplorer: WalletExplorer;

    private viewState: ViewState;

    constructor(
        extensionPath: string,
        rpcUri: string,
        rpcConnection: INeoRpcConnection,
        walletExplorer: WalletExplorer,
        disposables: vscode.Disposable[],
        neoExpressConfig?: NeoExpressConfig) {

        this.rpcUri = rpcUri;
        this.rpcConnection = rpcConnection;
        this.walletExplorer = walletExplorer;
        this.neoExpressConfig = neoExpressConfig;
        this.viewState = new ViewState();

        this.panel = vscode.window.createWebviewPanel(
            'transferPanel',
            (this.neoExpressConfig ? this.neoExpressConfig.basename : this.rpcUri) + ' - Transfer assets',
            vscode.ViewColumn.Active,
            { enableScripts: true });
        this.panel.iconPath = vscode.Uri.file(path.join(extensionPath, 'resources', 'neo.svg'));
        this.panel.onDidDispose(this.onClose, this, disposables);
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

    public updateStatus(status: string) {
        console.info('TransferPanel status:', status);
    }

    private async doTransfer() {
        this.viewState.showError = false;
        this.viewState.showSuccess = false;
        this.viewState.sourceWalletBalancesError = false;
        try {
            const sourceWalletConfig = this.viewState.wallets.filter(_ => _.address === this.viewState.sourceWalletAddress)[0];
            if (await sourceWalletConfig.unlock()) {
                const api = new neon.api.neoCli.instance(this.rpcUri);
                const transfer: any = {};
                transfer[this.viewState.assetName as string] = this.viewState.amount;
                const config: any = {
                    api: api,
                    account: sourceWalletConfig.account,
                    signingFunction: sourceWalletConfig.signingFunction,
                    intents: neon.api.makeIntent(transfer, this.viewState.destinationWalletAddress as string),
                };
                if (sourceWalletConfig.isMultiSig) {
                    // The neon.default.sendAsset function expects the config.account property to be present and 
                    // a regular (non-multisig) account object (so we arbitrarily provide the fist account in
                    // the multisig group); however it also uses config.account.address when looking up the available
                    // balance. So we manually lookup the available balance (using the multisig address) and then
                    // pass it in (thus avoiding the balance lookup within sendAsset).
                    config.balance = await api.getBalance(this.viewState.sourceWalletAddress as string);
                }
                const result = await neon.default.sendAsset(config);
                if (result.response && result.response.txid) {
                    this.viewState.showSuccess = true;
                    this.viewState.result = result.response.txid;
                } else {
                    this.viewState.showError = true;    
                    this.viewState.result = 'A transaction could not be created';
                }
            }
        } catch (e) {
            this.viewState.showError = true;
            this.viewState.result = 'The transfer failed. ' + e;
        }
    }

    private onClose() {
        this.dispose();
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
            await this.refresh();
            await this.doTransfer();
            await this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === transferEvents.Close) {
            this.dispose();
        }
    }

    private async refresh() {

        this.viewState.wallets = [];
        if (this.neoExpressConfig) {
            this.neoExpressConfig.refresh();
            this.viewState.wallets = this.neoExpressConfig.wallets.slice();
        }
        
        for (let i = 0; i < this.walletExplorer.allAccounts.length; i++) {
            this.viewState.wallets.push(this.walletExplorer.allAccounts[i]);
        }

        this.viewState.sourceWalletBalances = [];
        if (this.viewState.sourceWalletAddress) {
            try {
                const getUnspentsResult = await this.rpcConnection.getUnspents(this.viewState.sourceWalletAddress, this);
                if (getUnspentsResult.assets) {
                    this.viewState.sourceWalletBalancesError = false;
                    for (let assetName in getUnspentsResult.assets) {
                        const unspents = getUnspentsResult.assets[assetName].unspent;
                        if (unspents && unspents.length) {
                            let total = new bignumber.BigNumber(0);
                            for (let i = 0; i < unspents.length; i++) {
                                total = total.plus(unspents[i].value as bignumber.BigNumber);
                            }
                            this.viewState.sourceWalletBalances.push({
                                asset: assetName,
                                value: total.toNumber(),
                            });
                        }
                    }
                } else {
                    this.viewState.sourceWalletBalancesError = true;    
                }
            } catch(e) {
                this.viewState.sourceWalletBalancesError = true;
            }            
        }

        if (this.viewState.sourceWalletBalancesError) {
            // If unspents cannot be retrieved, populate the asset dropdown with 'GAS' and 'NEO' and
            // rely on the user to know how much of each asset is available in the wallet.
            this.viewState.sourceWalletBalances = [
                { asset: 'NEO', amount: 0 },
                { asset: 'GAS', amount: 0 },
            ];
        }
        
        this.validate();
    }

    private validate() {
        const sourceWalletConfig = this.viewState.wallets.filter(_ => _.address === this.viewState.sourceWalletAddress)[0];
        if (!sourceWalletConfig) {
            this.viewState.sourceWalletAddress = undefined;
            this.viewState.sourceWalletDescription = undefined;
        }

        const destinationWalletConfig = this.viewState.wallets.filter(_ => _.address === this.viewState.destinationWalletAddress)[0];
        if (!destinationWalletConfig) {
            this.viewState.destinationWalletAddress = undefined;
            this.viewState.destinationWalletDescription = undefined;
        }

        if (this.viewState.assetName &&
            (this.viewState.sourceWalletBalances.map(_ => _.asset).indexOf(this.viewState.assetName) === -1)) {
            this.viewState.assetName = undefined;
            this.viewState.amount = undefined;
        }

        this.viewState.isValid =
            !!this.viewState.sourceWalletAddress &&
            !!this.viewState.destinationWalletAddress &&
            !!this.viewState.assetName;
    }
}