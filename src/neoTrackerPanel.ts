import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { INeoRpcConnection, INeoSubscription, BlockchainInfo, Blocks } from './neoRpcConnection';

const JavascriptHrefPlaceholder : string = '[JAVASCRIPT_HREF]';

enum ActiveTab {
    Blocks,
    Transactions,
}

class ViewState {
    public blockChainInfo? : BlockchainInfo = undefined;
    public activeTab : ActiveTab = ActiveTab.Blocks;
    public firstBlock? : number = undefined;
    public blocks : Blocks = new Blocks();
}

export class NeoTrackerPanel implements INeoSubscription {
    public readonly panel : vscode.WebviewPanel;
    public readonly ready : Promise<void>;
    public readonly viewState : ViewState;

    private onIncomingMessage? : () => void;
    private rpcConnection : INeoRpcConnection;

    constructor(
        extensionPath : string,
        rpcConnection : INeoRpcConnection,
        disposables : vscode.Disposable[]) {

        this.rpcConnection = rpcConnection;
        this.rpcConnection.subscribe(this);

        this.viewState = new ViewState();

        this.ready = new Promise((resolve, reject) => {
            this.onIncomingMessage = resolve;
        });

        this.panel = vscode.window.createWebviewPanel(
            'newExpressTracker',
            'NEO Express Tracker',
            vscode.ViewColumn.Active,
            { enableScripts: true });

        this.panel.onDidDispose(this.onClose, this, disposables);
        this.panel.webview.onDidReceiveMessage(this.onMessage, this, disposables);

        const htmlFileContents = fs.readFileSync(
            path.join(extensionPath, 'src', 'panel', 'panel.html'), { encoding: 'utf8' });
        const javascriptHref : string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panel', 'panel.js'))) + '';
        this.panel.webview.html = htmlFileContents.replace(JavascriptHrefPlaceholder, javascriptHref);
    }

    public async onNewBlock(blockchainInfo: BlockchainInfo) {
        this.viewState.blockChainInfo = blockchainInfo;
        await this.updateBlockList();
        this.panel.webview.postMessage(this.viewState);
    }

    private async updateBlockList(force?: boolean) {
        if (force || (this.viewState.firstBlock === undefined)) {
            this.viewState.blocks = await this.rpcConnection.getBlocks(this.viewState.firstBlock);
        }
    }

    private onClose() {
        this.rpcConnection.unsubscribe(this);
    }

    private async onMessage(message: any) {
        if (this.onIncomingMessage) {
            this.onIncomingMessage();
        }

        if (message.e === 'previousBlocks') {
            this.viewState.firstBlock = this.viewState.blocks.previous;
            await this.updateBlockList(true);
        } else if (message.e === 'nextBlocks') {
            this.viewState.firstBlock = this.viewState.blocks.next;
            await this.updateBlockList(true);
        } // else if ...

        this.panel.webview.postMessage(this.viewState);
    }

    dispose() {
        this.panel.dispose();
    }

}