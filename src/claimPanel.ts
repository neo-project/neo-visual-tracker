import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { claimEvents } from './panels/claimEvents';
import { NeoExpressHelper } from './neoExpressHelper';

const JavascriptHrefPlaceholder : string = '[JAVASCRIPT_HREF]';
const CssHrefPlaceholder : string = '[CSS_HREF]';

class ViewState {
    claimable: number = 0;
    getClaimableError: boolean = false;
    isValid: boolean = false;
    neoExpressJsonFullPath: string = '';
    result: string = '';
    showError: boolean = false;
    showSuccess: boolean = false;
    wallet?: string = undefined;
    wallets: string[] = [];
}

export class ClaimPanel {

    private readonly panel: vscode.WebviewPanel;

    private viewState: ViewState;
    private initialized: boolean = false;

    constructor(
        extensionPath: string,
        neoExpressJsonFullPath: string,
        disposables: vscode.Disposable[]) {

        this.viewState = new ViewState();
        this.viewState.neoExpressJsonFullPath = neoExpressJsonFullPath;

        this.panel = vscode.window.createWebviewPanel(
            'claimPanel',
            path.basename(neoExpressJsonFullPath) + ' - Claim GAS',
            vscode.ViewColumn.Active,
            { enableScripts: true });
        this.panel.iconPath = vscode.Uri.file(path.join(extensionPath, 'resources', 'neo.svg'));
        this.panel.webview.onDidReceiveMessage(this.onMessage, this, disposables);

        const htmlFileContents = fs.readFileSync(
            path.join(extensionPath, 'src', 'panels', 'claim.html'), { encoding: 'utf8' });
        const javascriptHref : string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panels', 'claimBundle.js'))) + '';
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
        const result = await NeoExpressHelper.claimGas(
            this.viewState.neoExpressJsonFullPath,
            this.viewState.wallet || 'unknown');
        this.viewState.showError = result.isError;
        this.viewState.showSuccess = !result.isError;
        this.viewState.result = result.output;
        if (result.isError) {
            this.viewState.result = 'The claim failed. Please confirm that the account has claimable GAS and the correct Neo Express instance is running, then try again.';
        }
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
            console.error('ClaimPanel encountered an error parsing ', this.viewState.neoExpressJsonFullPath, e);
        }

        this.viewState.claimable = 0;
        if (this.viewState.wallet) {
            const showClaimableResult = await NeoExpressHelper.showClaimable(
                this.viewState.neoExpressJsonFullPath,
                this.viewState.wallet || 'unknown');
            this.viewState.claimable = showClaimableResult.result.unclaimed || 0;
            this.viewState.getClaimableError = showClaimableResult.isError;
        }
        
        if (this.viewState.wallet && this.viewState.wallets.indexOf(this.viewState.wallet) === -1) {
            this.viewState.wallet = undefined;
            this.viewState.claimable = 0;
        }

        this.viewState.isValid =
            !!this.viewState.wallet &&
            (this.viewState.claimable > 0) &&
            !this.viewState.getClaimableError;

        this.initialized = true;
    }

}