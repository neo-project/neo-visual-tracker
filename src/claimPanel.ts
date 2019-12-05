import * as fs from 'fs';
import * as neon from '@cityofzion/neon-js';
import * as path from 'path';
import * as vscode from 'vscode';

import { claimEvents } from './panels/claimEvents';
import { NeoExpressConfig } from './neoExpressConfig';
import { NeoExpressHelper } from './neoExpressHelper';

const JavascriptHrefPlaceholder : string = '[JAVASCRIPT_HREF]';
const CssHrefPlaceholder : string = '[CSS_HREF]';

class ViewState {
    claimable: number = 0;
    getClaimableError: boolean = false;
    isValid: boolean = false;
    result: string = '';
    showError: boolean = false;
    showSuccess: boolean = false;
    walletKey?: string = undefined;
    walletDescription?: string = undefined;
    wallets: any[] = [];
}

export class ClaimPanel {

    private readonly neoExpressConfig: NeoExpressConfig;
    private readonly panel: vscode.WebviewPanel;
    private readonly rpcUri: string;

    private viewState: ViewState;
    private initialized: boolean = false;

    constructor(
        extensionPath: string,
        neoExpressConfig: NeoExpressConfig,
        rpcUri: string,
        disposables: vscode.Disposable[]) {

        this.rpcUri = rpcUri;

        this.neoExpressConfig = neoExpressConfig;

        this.viewState = new ViewState();

        this.panel = vscode.window.createWebviewPanel(
            'claimPanel',
            this.neoExpressConfig.basename + ' - Claim GAS',
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

    private async doClaim() {
        this.viewState.showError = false;
        this.viewState.showSuccess = false;
        try {
            const api = new neon.api.neoCli.instance(this.rpcUri);
            const config = {
                api: api,
                account: new neon.wallet.Account(this.viewState.walletKey),
            };
            const result = await neon.default.claimGas(config);
            if (result.response && result.response.txid) {
                this.viewState.showSuccess = true;
                this.viewState.result = result.response.txid;
            } else {
                this.viewState.showError = true;    
                this.viewState.result = 'A claim transaction could not be created';
            }
        } catch (e) {
            this.viewState.showError = true;
            this.viewState.result = 'There was an error when trying to claim GAS: ' + e;
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
        }
    }

    private async refresh(force: boolean) {
        if (!force && this.initialized) {
            return;
        }

        this.viewState.showError = false;
        this.viewState.showSuccess = false;

        this.viewState.wallets = this.neoExpressConfig.wallets;

        this.viewState.claimable = 0;
        const walletConfig = this.viewState.wallets.filter(_=>_.privateKey === this.viewState.walletKey)[0];
        const walletName = walletConfig ? walletConfig.walletName : undefined;
        if (walletName) {
            const showClaimableResult = await NeoExpressHelper.showClaimable(
                this.neoExpressConfig.neoExpressJsonFullPath,
                walletName);
            this.viewState.claimable = showClaimableResult.result.unclaimed || 0;
            this.viewState.getClaimableError = showClaimableResult.isError;
        }
        
        if (this.viewState.walletKey && !this.viewState.wallets.filter(_ => _.privateKey === this.viewState.walletKey).length) {
            this.viewState.walletKey = undefined;
            this.viewState.walletDescription = undefined;
            this.viewState.claimable = 0;
        }

        this.viewState.isValid =
            !!this.viewState.walletKey &&
            (this.viewState.claimable > 0) &&
            !this.viewState.getClaimableError;

        this.initialized = true;
    }

}