import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { ContractDetector } from './contractDetector';
import { deployEvents } from './panels/deployEvents';
import { INeoRpcConnection } from './neoRpcConnection';
import { NeoExpressConfig } from './neoExpressConfig';

const JavascriptHrefPlaceholder : string = '[JAVASCRIPT_HREF]';
const CssHrefPlaceholder : string = '[CSS_HREF]';

class ViewState {
    contracts: any[] = [];
    contractPath?: string = undefined;
    contractName?: string = undefined;
    contractHash?: string = undefined;
    isValid: boolean = false;
    result: string = '';
    showError: boolean = false;
    showSuccess: boolean = false;
    walletAddress?: string = undefined;
    wallets: any[] = [];
}

export class DeployPanel {

    private readonly contractDetector: ContractDetector;
    private readonly neoExpressConfig: NeoExpressConfig;
    private readonly panel: vscode.WebviewPanel;
    private readonly rpcUri: string;
    private readonly rpcConnection: INeoRpcConnection;

    private viewState: ViewState;
    private initialized: boolean = false;

    constructor(
        extensionPath: string,
        neoExpressConfig: NeoExpressConfig,
        rpcUri: string,
        rpcConnection: INeoRpcConnection,
        contractDetector: ContractDetector,
        disposables: vscode.Disposable[]) {

        this.contractDetector = contractDetector;
        this.rpcUri = rpcUri;
        this.rpcConnection = rpcConnection;
        this.neoExpressConfig = neoExpressConfig;
        this.viewState = new ViewState();

        this.panel = vscode.window.createWebviewPanel(
            'deployPanel',
            this.neoExpressConfig.basename + ' - Deploy contract',
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
        // TODO
        //   See: https://github.com/Moonlight-io/moonlight-ico-template/blob/master/lib/nep5-interface.js#L191
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

        this.viewState.wallets = this.neoExpressConfig.wallets;

        const walletConfig = this.viewState.wallets.filter(_ => _.address === this.viewState.walletAddress)[0];
        if (!walletConfig) {
            this.viewState.walletAddress = undefined;
        }

        await this.contractDetector.refresh();
        this.viewState.contracts = this.contractDetector.contracts;

        const contractConfig = this.viewState.contracts.filter(_ => _.path === this.viewState.contractPath)[0];
        if (!contractConfig) {
            this.viewState.contractPath = undefined;
            this.viewState.contractName = undefined;
            this.viewState.contractHash = undefined;
        } else {
            this.viewState.contractName = contractConfig.name;
            this.viewState.contractHash = contractConfig.hash;
        }

        this.viewState.isValid =
            !!this.viewState.walletAddress &&
            !!this.viewState.contractPath;

        this.initialized = true;
    }

}