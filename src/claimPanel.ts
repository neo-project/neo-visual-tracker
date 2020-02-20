import * as bignumber from 'bignumber.js';
import * as fs from 'fs';
import * as neon from '@cityofzion/neon-js';
import * as path from 'path';
import * as vscode from 'vscode';

import { claimEvents } from './panels/claimEvents';

import { INeoRpcConnection } from './neoRpcConnection';
import { IWallet } from './iWallet';
import { NeoExpressConfig } from './neoExpressConfig';
import { NeoTrackerPanel } from './neoTrackerPanel';
import { WalletExplorer } from './walletExplorer';

const JavascriptHrefPlaceholder : string = '[JAVASCRIPT_HREF]';
const CssHrefPlaceholder : string = '[CSS_HREF]';

class ViewState {
    claimable: number = 0;
    unavailable: number = 0;
    doSelfTransfer: boolean = false;
    doSelfTransferEnabled: boolean = true;
    getClaimableError: boolean = false;
    isValid: boolean = false;
    result: string = '';
    showError: boolean = false;
    showSuccess: boolean = false;
    walletAddress?: string = undefined;
    walletDescription?: string = undefined;
    wallets: any[] = [];
}

export class ClaimPanel {

    private readonly neoExpressConfig?: NeoExpressConfig;
    private readonly panel: vscode.WebviewPanel;
    private readonly rpcUri: string;
    private readonly rpcConnection: INeoRpcConnection;
    private readonly walletExplorer: WalletExplorer;
    private readonly startSearch: Function;

    private viewState: ViewState;
    private initialized: boolean = false;

    constructor(
        extensionPath: string,
        rpcUri: string,
        rpcConnection: INeoRpcConnection,
        historyId: string,
        state: vscode.Memento,
        walletExplorer: WalletExplorer,
        disposables: vscode.Disposable[],
        neoExpressConfig?: NeoExpressConfig) {

        this.rpcUri = rpcUri;
        this.rpcConnection = rpcConnection;
        this.walletExplorer = walletExplorer;
        this.neoExpressConfig = neoExpressConfig;
        this.viewState = new ViewState();

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
            this.dispose(); // close the dialog after navigating to the tracker
        };

        this.panel = vscode.window.createWebviewPanel(
            'claimPanel',
            (this.neoExpressConfig ? this.neoExpressConfig.basename : this.rpcUri) + ' - Claim GAS',
            vscode.ViewColumn.Active,
            { enableScripts: true });
        this.panel.iconPath = vscode.Uri.file(path.join(extensionPath, 'resources', 'neo.svg'));
        this.panel.onDidDispose(this.onClose, this, disposables);
        this.panel.webview.onDidReceiveMessage(this.onMessage, this, disposables);

        const htmlFileContents = fs.readFileSync(
            path.join(extensionPath, 'src', 'panels', 'claim.html'), { encoding: 'utf8' });
        const javascriptHref : string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panels', 'bundles', 'claim.main.js'))) + '';
        const cssHref : string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panels', 'claim.css'))) + '';
        this.panel.webview.html = htmlFileContents
            .replace(JavascriptHrefPlaceholder, javascriptHref)
            .replace(CssHrefPlaceholder, cssHref);
    }

    public dispose() {
        this.panel.dispose();
    }

    public updateStatus(status: string) {
        console.info('ClaimPanel status:', status);
    }

    private async doClaim() {
        this.viewState.showError = false;
        this.viewState.showSuccess = false;
        this.viewState.getClaimableError = false;
        try {
            const walletConfig = this.viewState.wallets.filter(_ => _.address === this.viewState.walletAddress)[0];
            if (await walletConfig.unlock()) {
                if (this.viewState.doSelfTransfer) {
                    await this.doSelfTransfer(walletConfig);
                }
                const api = new neon.api.neoCli.instance(this.rpcUri);
                const config: any = {
                    api: api,
                    account: walletConfig.account,
                    signingFunction: walletConfig.signingFunction,
                };
                if (walletConfig.isMultiSig) {
                    // The neon.default.claimGas function expects the config.account property to be present and 
                    // a regular (non-multisig) account object (so we arbitrarily provide the fist account in
                    // the multisig group); however it also uses config.account.address when looking up unclaimed
                    // GAS. So we manually lookup the unclaimed GAS information (using the multisig address) and then
                    // pass it in (thus avoiding the unclaimed lookup within claimGas).
                    config.claims = await api.getClaims(walletConfig.address);
                }
                const result = await neon.default.claimGas(config);
                if (result.response && result.response.txid) {
                    this.viewState.showSuccess = true;
                    this.viewState.result = result.response.txid;
                } else {
                    this.viewState.showError = true;    
                    this.viewState.result = 'A claim transaction could not be created';
                }
            }
        } catch (e) {
            this.viewState.showError = true;
            this.viewState.result = 'There was an error when trying to claim GAS: ' + e;
        }
    }

    private async doSelfTransfer(walletConfig: IWallet) {
        if (this.viewState.walletAddress) {
            const walletAddress = this.viewState.walletAddress;
            const getUnspentsResult = await this.rpcConnection.getUnspents(walletAddress, this);
            if (getUnspentsResult.assets && getUnspentsResult.assets['NEO']) {
                const neoUnspents = getUnspentsResult.assets['NEO'].unspent;
                if (neoUnspents && neoUnspents.length) {
                    let sum = new bignumber.BigNumber(0);
                    for (let i = 0; i < neoUnspents.length; i++) {
                        sum = sum.plus(neoUnspents[i].value as bignumber.BigNumber);
                    }
                    const totalNeo = sum.toNumber();
                    const api = new neon.api.neoCli.instance(this.rpcUri);
                    const config: any = {
                        api: api,
                        account: walletConfig.account,
                        signingFunction: walletConfig.signingFunction,
                        intents: neon.api.makeIntent({ 'NEO': totalNeo }, walletAddress),
                    };
                    if (walletConfig.isMultiSig) {
                        // The neon.default.sendAsset function expects the config.account property to be present and 
                        // a regular (non-multisig) account object (so we arbitrarily provide the fist account in
                        // the multisig group); however it also uses config.account.address when looking up the available
                        // balance. So we manually lookup the available balance (using the multisig address) and then
                        // pass it in (thus avoiding the balance lookup within sendAsset).
                        config.balance = await api.getBalance(walletAddress);
                    }
                    const result = await neon.default.sendAsset(config);
                    if (result.response && result.response.txid) {
                        return new Promise((resolve, reject) => {
                            const initialClaimable = this.viewState.claimable;
                            let attempts = 0;
                            const resolveWhenClaimableIncreases = async () => {
                                attempts++;
                                if (attempts > 15) {
                                    console.error('ClaimPanel timed out waiting for self-transfer to confirm; continuing with claim');
                                    resolve();
                                } else {
                                    try {
                                        const unclaimed = await this.rpcConnection.getUnclaimed(walletAddress, this);
                                        if (!unclaimed.getUnclaimedSupport) {
                                            reject('No longer able to determine unclaimed GAS');
                                        } else if (unclaimed.available > initialClaimable) {
                                            resolve();
                                        } else {
                                            setTimeout(resolveWhenClaimableIncreases, 2000);
                                        }
                                    } catch (e) {
                                        reject('Error determining unclaimed GAS');
                                    }
                                }
                            };
                            resolveWhenClaimableIncreases();
                        });
                    } else {
                        console.error('ClaimPanel self-transfer failed', result, getUnspentsResult, this.viewState);    
                    }
                } else {
                    console.error('ClaimPanel skipping self-transfer (no unspent NEO)', getUnspentsResult, this.viewState);
                }
            } else {
                console.error('ClaimPanel skipping self-transfer (no unspents)', getUnspentsResult, this.viewState);
            } 
        } else {
            console.error('ClaimPanel skipping self-transfer (no wallet sleected)', this.viewState);
        }
    }

    private onClose() {
        this.dispose();
    }

    private async onMessage(message: any) {
        if (message.e === claimEvents.Init) {
            await this.refresh(false);
            await this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === claimEvents.Refresh) {
            await this.refresh(true);
            await this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === claimEvents.Update) {
            this.viewState = message.c;
            await this.refresh(true);
            await this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === claimEvents.Claim) {
            await this.doClaim();
            await this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === claimEvents.Close) {
            this.dispose();
        } else if (message.e === claimEvents.NewWallet) {
            this.initialized = false; // cause wallet list to be refreshed when this panel is next initialized
            vscode.commands.executeCommand('neo-visual-devtracker.createWalletFile');
        } else if (message.e === claimEvents.Search) {
            await this.startSearch(message.c);
        }
    }

    private async refresh(force: boolean) {
        if (!force && this.initialized) {
            return;
        }

        this.viewState.showError = false;
        this.viewState.showSuccess = false;

        this.viewState.wallets = [];
        if (this.neoExpressConfig) {
            this.neoExpressConfig.refresh();
            this.viewState.wallets = this.neoExpressConfig.wallets.slice();
        }
        
        for (let i = 0; i < this.walletExplorer.allAccounts.length; i++) {
            this.viewState.wallets.push(this.walletExplorer.allAccounts[i]);
        }

        this.viewState.claimable = 0;
        const walletConfig = this.viewState.wallets.filter(_ => _.address === this.viewState.walletAddress)[0];
        const walletAddress = walletConfig ? walletConfig.address : undefined;
        this.viewState.doSelfTransferEnabled = false;
        if (walletAddress) {
            this.viewState.doSelfTransferEnabled = true;
            try {
                const unclaimed = await this.rpcConnection.getUnclaimed(walletAddress, this);
                this.viewState.claimable = unclaimed.available || 0;
                this.viewState.unavailable = unclaimed.unavailable || 0;
                this.viewState.getClaimableError = !unclaimed.getUnclaimedSupport;
                if (this.viewState.getClaimableError) {
                    this.viewState.doSelfTransfer = false;
                    this.viewState.doSelfTransferEnabled = false;
                } else {
                    if ((this.viewState.claimable === 0) && (this.viewState.unavailable > 0)) {
                        this.viewState.doSelfTransfer = true;
                        this.viewState.doSelfTransferEnabled = false;
                    } else if (this.viewState.unavailable === 0) {
                        this.viewState.doSelfTransfer = false;
                        this.viewState.doSelfTransferEnabled = false;
                    }
                }
            } catch (e) {
                console.error('ClaimPanel could not query claimable GAS', walletAddress, this.rpcUri, e);
                this.viewState.claimable = 0;
                this.viewState.unavailable = 0;
                this.viewState.getClaimableError = true;
            }
        }
        
        if (!walletConfig) {
            this.viewState.walletAddress = undefined;
            this.viewState.walletDescription = undefined;
            this.viewState.claimable = 0;
        }

        this.viewState.isValid =
            !!this.viewState.walletAddress &&
            ((this.viewState.claimable > 0) || (this.viewState.unavailable > 0) || this.viewState.getClaimableError);

        this.initialized = true;
    }

}