import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { ContractDetector } from './contractDetector';
import { BlockchainInfo, INeoRpcConnection, INeoSubscription, INeoStatusReceiver } from './neoRpcConnection';
import { NeoExpressConfig } from './neoExpressConfig';
import { ResultValue } from './resultValue';
import { storageEvents } from './panels/storageEvents';

const JavascriptHrefPlaceholder : string = '[JAVASCRIPT_HREF]';
const CssHrefPlaceholder : string = '[CSS_HREF]';

class ViewState {
    contracts: any[] = [];
    rpcUrl: string = '';
    rpcDescription: string = '';
    selectedContractHash: string = '';
    selectedContractStorage: any = [];
}

export class StoragePanel implements INeoSubscription, INeoStatusReceiver {
    
    private readonly neoExpressConfig?: NeoExpressConfig;
    private readonly panel: vscode.WebviewPanel;
    private readonly rpcUri: string;
    private readonly rpcConnection: INeoRpcConnection;
    private readonly contractDetector: ContractDetector;

    private viewState: ViewState;

    constructor(
        extensionPath: string,
        rpcUri: string,
        rpcConnection: INeoRpcConnection,
        contractDetector: ContractDetector,
        disposables: vscode.Disposable[],
        neoExpressConfig?: NeoExpressConfig) {

        this.rpcUri = rpcUri;
        this.contractDetector = contractDetector;
        this.neoExpressConfig = neoExpressConfig;
        this.viewState = new ViewState();
        this.viewState.rpcDescription = neoExpressConfig ? neoExpressConfig.neoExpressJsonFullPath : '';
        this.viewState.rpcUrl = rpcUri;

        this.rpcConnection = rpcConnection;
        this.rpcConnection.subscribe(this);

        this.panel = vscode.window.createWebviewPanel(
            'storagePanel',
            (this.neoExpressConfig ? this.neoExpressConfig.basename : this.rpcUri) + ' - Storage Explorer',
            vscode.ViewColumn.Active,
            { enableScripts: true });
        this.panel.iconPath = vscode.Uri.file(path.join(extensionPath, 'resources', 'neo.svg'));
        this.panel.onDidDispose(this.onClose, this, disposables);
        this.panel.webview.onDidReceiveMessage(this.onMessage, this, disposables);

        const htmlFileContents = fs.readFileSync(
            path.join(extensionPath, 'src', 'panels', 'storage.html'), { encoding: 'utf8' });
        const javascriptHref : string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panels', 'bundles', 'storage.main.js'))) + '';
        const cssHref : string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panels', 'storage.css'))) + '';
        this.panel.webview.html = htmlFileContents
            .replace(JavascriptHrefPlaceholder, javascriptHref)
            .replace(CssHrefPlaceholder, cssHref);
    }

    public dispose() {
        this.panel.dispose();
    }

    public updateStatus(status: string) {
        console.info('StoragePanel status:', status);
    }

    public async onNewBlock(blockchainInfo: BlockchainInfo) {
        if (this.viewState.selectedContractHash) {
            await this.refresh();
            await this.panel.webview.postMessage({ viewState: this.viewState });
        }
    }

    private onClose() {
        this.dispose();
    }

    private async onMessage(message: any) {
        if (message.e === storageEvents.Init) {
            await this.refresh();
            await this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === storageEvents.Refresh) {
            await this.refresh();
            await this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === storageEvents.Update) {
            this.viewState = message.c;
            await this.refresh();
            await this.panel.webview.postMessage({ viewState: this.viewState });
        }
    }

    private async refresh() {
        this.viewState.contracts = [];
        this.viewState.selectedContractStorage = {};

        if (this.neoExpressConfig) {
            this.neoExpressConfig.refresh();
            this.viewState.contracts = this.neoExpressConfig.contracts.slice();
        }

        // TODO: Don't assume all contracts found in the workspace have been deployed.
        const workspaceContracts = this.contractDetector.contracts;
        for (let i = 0; i < workspaceContracts.length; i++) {
            if (this.viewState.contracts.filter(c => c.hash.toLowerCase() === workspaceContracts[i].hash.toLowerCase()).length === 0) {
                this.viewState.contracts.push(workspaceContracts[i].abi);
            }
        }

        if (!this.viewState.contracts.find(c => c.hash === this.viewState.selectedContractHash)) {
            this.viewState.selectedContractHash = '';
        }

        if (this.viewState.contracts.length) {
            this.viewState.selectedContractHash = this.viewState.selectedContractHash || this.viewState.contracts[0].hash;
        }

        if (this.viewState.selectedContractHash) {
            this.viewState.selectedContractStorage = 
                await this.rpcConnection.getContractStorage(this.viewState.selectedContractHash, this);
            if (this.viewState.selectedContractStorage) {
                for (let i = 0; i < this.viewState.selectedContractStorage.length; i++) {
                    this.viewState.selectedContractStorage[i].parsed =
                        new ResultValue(this.viewState.selectedContractStorage[i]);
                }
            }
        }
    }

}