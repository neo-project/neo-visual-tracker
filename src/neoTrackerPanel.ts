import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { INeoRpcConnection, INeoSubscription, INeoStatusReceiver, BlockchainInfo, Blocks } from './neoRpcConnection';

const JavascriptHrefPlaceholder : string = '[JAVASCRIPT_HREF]';
const CssHrefPlaceholder : string = '[CSS_HREF]';

enum ActivePage {
    Blocks = 'blocks',
    BlockDetail = 'blockdetail',
    TransactionDetail = 'transactiondetail',
}

class ViewState {
    public blockChainInfo? : BlockchainInfo = undefined;
    public activePage : ActivePage = ActivePage.Blocks;
    public firstBlock? : number = undefined;
    public forwards: boolean = true;
    public blocks: Blocks = new Blocks();
    public currentBlock: any = undefined;
    public currentTransaction: any = undefined;
    public hideEmptyBlocks: boolean = false;
}

export class NeoTrackerPanel implements INeoSubscription, INeoStatusReceiver {
    public readonly panel: vscode.WebviewPanel;
    public readonly ready: Promise<void>;
    public readonly viewState: ViewState;

    private onIncomingMessage?: () => void;
    private rpcConnection: INeoRpcConnection;
    private isPageLoading: boolean;

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

        this.isPageLoading = true;

        this.panel = vscode.window.createWebviewPanel(
            'newExpressTracker',
            rpcConnection.rpcUrl,
            vscode.ViewColumn.Active,
            { enableScripts: true });

        this.panel.iconPath = vscode.Uri.file(path.join(extensionPath, 'resources', 'neo.svg'));

        this.panel.onDidDispose(this.onClose, this, disposables);
        this.panel.webview.onDidReceiveMessage(this.onMessage, this, disposables);

        const htmlFileContents = fs.readFileSync(
            path.join(extensionPath, 'src', 'panel', 'panel.html'), { encoding: 'utf8' });
        const javascriptHref : string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panel', 'bundle.js'))) + '';
        const cssHref : string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panel', 'panel.css'))) + '';
        this.panel.webview.html = htmlFileContents
            .replace(JavascriptHrefPlaceholder, javascriptHref)
            .replace(CssHrefPlaceholder, cssHref);
    }

    public async onNewBlock(blockchainInfo: BlockchainInfo) {
        this.viewState.blockChainInfo = blockchainInfo;
        
        if (!this.isPageLoading) {
            await this.updateBlockList();
        }

        this.panel.webview.postMessage({ viewState: this.viewState });
    }

    public updateStatus(status?: string) : void {
        this.panel.webview.postMessage({ status: { message: status, isLoading: this.isPageLoading } });
    }

    private async updateBlockList(force?: boolean) {
        if (force || (this.viewState.firstBlock === undefined)) {
            this.viewState.blocks = await this.rpcConnection.getBlocks(
                this.viewState.firstBlock, 
                this.viewState.hideEmptyBlocks,
                this.viewState.forwards,
                this);
        }
    }

    private onClose() {
        this.rpcConnection.unsubscribe(this);
    }

    private async onMessage(message: any) {
        try {
            this.isPageLoading = true;

            if (this.onIncomingMessage) {
                this.onIncomingMessage();
            }

            if (message.e === 'init') {
                this.panel.webview.postMessage({ viewState: this.viewState });
                if (this.viewState.blocks.blocks.length === 0) {
                    await this.updateBlockList(true);
                }
            } else if (message.e === 'previousBlocks') {
                this.viewState.firstBlock = this.viewState.blocks.firstIndex + 1;
                this.viewState.forwards = false;
                await this.updateBlockList(true);
            } else if (message.e === 'nextBlocks') {
                this.viewState.firstBlock = this.viewState.blocks.lastIndex - 1;
                this.viewState.forwards = true;
                await this.updateBlockList(true);
            } else if (message.e === 'firstBlocks') {
                this.viewState.firstBlock = undefined;
                this.viewState.forwards = true;
                await this.updateBlockList(true);
            } else if (message.e === 'lastBlocks') {
                this.viewState.firstBlock = 0;
                this.viewState.forwards = false;
                await this.updateBlockList(true);
            } else if (message.e === 'changeHideEmpty') {
                this.viewState.hideEmptyBlocks = !!message.c;
                await this.updateBlockList(true);
            } else if (message.e === 'showBlock') {
                this.viewState.currentBlock = await this.rpcConnection.getBlock(message.c, this);
                this.viewState.activePage = ActivePage.BlockDetail;
            } else if (message.e === 'closeBlock') {
                this.viewState.currentBlock = undefined;
                this.viewState.activePage = (this.viewState.currentTransaction === undefined) ?
                    ActivePage.Blocks : ActivePage.TransactionDetail;
            } else if (message.e === 'showTransaction') {
                this.viewState.currentTransaction = await this.rpcConnection.getTransaction(message.c, this);
                this.viewState.activePage = ActivePage.TransactionDetail;
            } else if (message.e === 'closeTransaction') {
                this.viewState.currentTransaction = undefined;
                this.viewState.activePage = (this.viewState.currentBlock === undefined) ?
                    ActivePage.Blocks : ActivePage.BlockDetail;
            }

            this.panel.webview.postMessage({ viewState: this.viewState });
        } finally {
            this.isPageLoading = false;
            this.updateStatus();
        }
    }

    dispose() {
        this.panel.dispose();
    }

}