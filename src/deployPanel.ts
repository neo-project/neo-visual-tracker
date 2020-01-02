import * as fs from 'fs';
import * as neon from '@cityofzion/neon-js';
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
    contractAvmHex?: string = undefined;
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

    private viewState: ViewState;
    private initialized: boolean = false;

    constructor(
        extensionPath: string,
        neoExpressConfig: NeoExpressConfig,
        rpcUri: string,
        contractDetector: ContractDetector,
        disposables: vscode.Disposable[]) {

        this.contractDetector = contractDetector;
        this.rpcUri = rpcUri;
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
        try {
            //
            // Construct a script that calls Neo.Contract.Create
            //   -- see: https://docs.neo.org/docs/en-us/reference/scapi/fw/dotnet/neo/Contract/Create.html
            //
            // TODO: Find the contracts .abi.json and correctly determine parameters and return types. For now
            //       we assume that all contracts take two parameters (a string and an array) and return void.
            // TODO: Allow storage usage to be specified in the UI. For now we assume storage is used.
            // TODO: Allow specification of description, email, etc. in the UI. For now we use blank values.
            //
            const sb = neon.default.create.scriptBuilder();
            const script = sb
                .emitPush(neon.default.u.str2hexstring('')) // description
                .emitPush(neon.default.u.str2hexstring('')) // email
                .emitPush(neon.default.u.str2hexstring('')) // author
                .emitPush(neon.default.u.str2hexstring('')) // code_version
                .emitPush(neon.default.u.str2hexstring('')) // name
                .emitPush(0x01) // storage: {none: 0x00, storage: 0x01, dynamic: 0x02, storage+dynamic:0x03}
                .emitPush('ff') // return type - see https://docs.neo.org/docs/en-us/sc/deploy/Parameter.html
                .emitPush('0710') // parameter list - see https://docs.neo.org/docs/en-us/sc/deploy/Parameter.html
                .emitPush(this.viewState.contractAvmHex)
                .emitSysCall('Neo.Contract.Create')
                .str;

            const api = new neon.api.neoCli.instance(this.rpcUri);
            const walletConfig = this.viewState.wallets.filter(_ => _.address === this.viewState.walletAddress)[0];
            const config = {
                api: api,
                script: script,
                account: walletConfig.account,
                signingFunction: walletConfig.signingFunction,
            };
            const result = await neon.default.doInvoke(config);
            if (result.response && result.response.txid) {
                this.viewState.result = result.response.txid;
                this.viewState.showError = false;
                this.viewState.showSuccess = true;
            } else {
                this.viewState.result = 'No response from RPC server; contract may not have deployed';
                this.viewState.showError = true;
                this.viewState.showSuccess = false;
            }
        } catch (e) {
            this.viewState.result = 'Error deploying contract: ' + e;
            this.viewState.showError = true;
            this.viewState.showSuccess = false;
        }
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
            await this.refresh(true);
            if (this.viewState.isValid) {
                await this.doDeploy();
            }
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
            this.viewState.contractAvmHex = undefined;
        } else {
            this.viewState.contractName = contractConfig.name;
            this.viewState.contractHash = contractConfig.hash;
            this.viewState.contractAvmHex = contractConfig.avmHex;
        }

        this.viewState.isValid =
            !!this.viewState.walletAddress &&
            !!this.viewState.contractPath;

        this.initialized = true;
    }

}