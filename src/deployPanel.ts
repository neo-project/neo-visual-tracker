import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { ContractDetector } from './contractDetector';
import { deployEvents } from './panels/deployEvents';

const JavascriptHrefPlaceholder : string = '[JAVASCRIPT_HREF]';
const CssHrefPlaceholder : string = '[CSS_HREF]';

class ViewState {
    contracts: string[] = [];
    contractPath?: string = undefined;
    isValid: boolean = false;
    neoExpressJsonFullPath: string = '';
    result: string = '';
    showError: boolean = false;
    showSuccess: boolean = false;
    wallet?: string = undefined;
    wallets: string[] = [];
}

export class DeployPanel {

    private readonly panel: vscode.WebviewPanel;
    private readonly contractDetector: ContractDetector;

    private viewState: ViewState;
    private initialized: boolean = false;

    constructor(
        extensionPath: string,
        neoExpressJsonFullPath: string,
        contractDetector: ContractDetector,
        disposables: vscode.Disposable[]) {

        this.contractDetector = contractDetector;

        this.viewState = new ViewState();
        this.viewState.neoExpressJsonFullPath = neoExpressJsonFullPath;

        this.panel = vscode.window.createWebviewPanel(
            'deployPanel',
            path.basename(neoExpressJsonFullPath) + ' - Deploy contract',
            vscode.ViewColumn.Active,
            { enableScripts: true });
        this.panel.iconPath = vscode.Uri.file(path.join(extensionPath, 'resources', 'neo.svg'));
        this.panel.webview.onDidReceiveMessage(this.onMessage, this, disposables);

        const htmlFileContents = fs.readFileSync(
            path.join(extensionPath, 'src', 'panels', 'deploy.html'), { encoding: 'utf8' });
        const javascriptHref : string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panels', 'bundles', 'deploy.main.js'))) + '';
        const cssHref : string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panels', 'deploy.css'))) + '';
        this.panel.webview.html = htmlFileContents
            .replace(JavascriptHrefPlaceholder, javascriptHref)
            .replace(CssHrefPlaceholder, cssHref);
    }

    public dispose() {
        this.panel.dispose();
    }

    private async doDeploy() {
        this.viewState.result = 'Code not written yet';
        this.viewState.showError = true;
        this.viewState.showSuccess = false;
    }

    private async onMessage(message: any) {
        if (message.e === deployEvents.Init) {
            await this.refresh(false);
            await this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === deployEvents.Refresh) {
            await this.refresh(true);
            await this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === deployEvents.Update) {
            this.viewState = message.c;
            await this.refresh(true);
            await this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === deployEvents.Deploy) {
            await this.doDeploy();
            await this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === deployEvents.Close) {
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
            console.error('DeployPanel encountered an error parsing ', this.viewState.neoExpressJsonFullPath, e);
        }

        if (this.viewState.wallet && this.viewState.wallets.indexOf(this.viewState.wallet) === -1) {
            this.viewState.wallet = undefined;
        }

        await this.contractDetector.refresh();
        this.viewState.contracts = this.contractDetector.contracts.map(c => c.path);

        if (this.viewState.contractPath && this.viewState.contracts.indexOf(this.viewState.contractPath) === -1) {
            this.viewState.contractPath = undefined;
        }

        this.viewState.isValid =
            !!this.viewState.wallet &&
            !!this.viewState.contractPath;

        this.initialized = true;
    }

}