import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { INeoRpcConnection, INeoSubscription, INeoStatusReceiver, BlockchainInfo, Blocks } from './neoRpcConnection';
import { trackerEvents } from './panels/trackerEvents';

const JavascriptHrefPlaceholder : string = '[JAVASCRIPT_HREF]';
const CssHrefPlaceholder : string = '[CSS_HREF]';

enum ActivePage {
    Blocks = 'blocks',
    BlockDetail = 'blockdetail',
    TransactionDetail = 'transactiondetail',
    AddressDetail = 'addressdetail',
}

class ViewState {
    public blockChainInfo? : BlockchainInfo = undefined;
    public activePage : ActivePage = ActivePage.Blocks;
    public firstBlock? : number = undefined;
    public forwards: boolean = true;
    public blocks: Blocks = new Blocks();
    public currentBlock: any = undefined;
    public currentTransaction: any = undefined;
    public currentAddressUnspents: any = undefined;
    public currentAddressClaimable: any = undefined;
    public currentAddressUnclaimed: any = undefined;
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
            path.join(extensionPath, 'src', 'panels', 'tracker.html'), { encoding: 'utf8' });
        const javascriptHref : string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panels', 'bundles', 'tracker.main.js'))) + '';
        const cssHref : string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panels', 'tracker.css'))) + '';
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
        if (force || ((this.viewState.firstBlock === undefined) && this.viewState.blockChainInfo && this.viewState.blockChainInfo.online)) {
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

            if (message.e === trackerEvents.Init) {
                this.panel.webview.postMessage({ viewState: this.viewState });
                if (this.viewState.blocks.blocks.length === 0) {
                    await this.updateBlockList(true);
                }
            } else if (message.e === trackerEvents.PreviousBlocksPage) {
                this.viewState.firstBlock = this.viewState.blocks.firstIndex + 1;
                this.viewState.forwards = false;
                await this.updateBlockList(true);
            } else if (message.e === trackerEvents.NextBlocksPage) {
                this.viewState.firstBlock = this.viewState.blocks.lastIndex - 1;
                this.viewState.forwards = true;
                await this.updateBlockList(true);
            } else if (message.e === trackerEvents.FirstBlocksPage) {
                this.viewState.firstBlock = undefined;
                this.viewState.forwards = true;
                await this.updateBlockList(true);
            } else if (message.e === trackerEvents.LastBlocksPage) {
                this.viewState.firstBlock = 0;
                this.viewState.forwards = false;
                await this.updateBlockList(true);
            } else if (message.e === trackerEvents.ChangeHideEmpty) {
                this.viewState.hideEmptyBlocks = !!message.c;
                await this.updateBlockList(true);
            } else if (message.e === trackerEvents.ShowBlock) {
                this.viewState.currentBlock = await this.rpcConnection.getBlock(message.c, this);
                this.viewState.activePage = ActivePage.BlockDetail;
            } else if (message.e === trackerEvents.CloseBlock) {
                this.viewState.currentBlock = undefined;
                this.viewState.activePage = (this.viewState.currentTransaction === undefined) ?
                    ActivePage.Blocks : ActivePage.TransactionDetail;
            } else if (message.e === trackerEvents.ShowTransaction) {
                this.viewState.currentTransaction = await this.rpcConnection.getTransaction(message.c, this);
                this.viewState.activePage = ActivePage.TransactionDetail;
            } else if (message.e === trackerEvents.CloseTransaction) {
                this.viewState.currentTransaction = undefined;
                this.viewState.activePage = (this.viewState.currentAddressUnspents !== undefined) ?
                    ActivePage.AddressDetail : 
                    ((this.viewState.currentBlock === undefined) ? ActivePage.Blocks : ActivePage.BlockDetail);
            } else if (message.e === trackerEvents.ShowAddress) {
                this.viewState.currentAddressUnspents = await this.rpcConnection.getUnspents(message.c, this);
                this.viewState.currentAddressClaimable = await this.rpcConnection.getClaimable(message.c, this);
                this.viewState.currentAddressUnclaimed = await this.rpcConnection.getUnclaimed(message.c, this);
                this.viewState.activePage = ActivePage.AddressDetail;
            } else if (message.e === trackerEvents.CloseAddress) {
                this.viewState.currentAddressUnspents = undefined;
                this.viewState.currentAddressClaimable = undefined;
                this.viewState.currentAddressUnclaimed = undefined;
                this.viewState.activePage = (this.viewState.currentTransaction !== undefined) ?
                    ActivePage.TransactionDetail : 
                    ((this.viewState.currentBlock !== undefined) ? ActivePage.BlockDetail : ActivePage.Blocks );
            } else if (message.e === trackerEvents.Copy) {
                await vscode.env.clipboard.writeText(message.c);
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