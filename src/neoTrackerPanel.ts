import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { wallet } from '@cityofzion/neon-core';

import { INeoRpcConnection, INeoSubscription, INeoStatusReceiver, BlockchainInfo, Blocks } from './neoRpcConnection';
import { NeoExpressConfig } from './neoExpressConfig';
import { trackerEvents } from './panels/trackerEvents';
import { WalletExplorer } from './walletExplorer';

const JavascriptHrefPlaceholder : string = '[JAVASCRIPT_HREF]';
const CssHrefPlaceholder : string = '[CSS_HREF]';

const MaxSearchHistorySize = 10;

enum ActivePage {
    Blocks = 'blocks',
    BlockDetail = 'blockdetail',
    TransactionDetail = 'transactiondetail',
    AddressDetail = 'addressdetail',
}

class ViewState {
    public blockChainInfo?: BlockchainInfo = undefined;
    public activePage: ActivePage = ActivePage.Blocks;
    public firstBlock?: number = undefined;
    public forwards: boolean = true;
    public blocks: Blocks = new Blocks();
    public currentBlock: any = undefined;
    public blockHighlight?: number = undefined;
    public transactionHighlight?: string = undefined;
    public currentTransaction: any = undefined;
    public currentAddressUnspents: any = undefined;
    public currentAddressUnclaimed: any = undefined;
    public hideEmptyBlocks: boolean = false;
    public searchHistory: string[] = [];
    public searchCompletions: any[] = [];
}

export class NeoTrackerPanel implements INeoSubscription, INeoStatusReceiver {
    public readonly panel: vscode.WebviewPanel;
    public readonly ready: Promise<void>;
    public readonly viewState: ViewState;
    
    private readonly historyId: string;
    private readonly state: vscode.Memento;
    private readonly walletExplorer: WalletExplorer;
    private readonly neoExpressConfig?: NeoExpressConfig;

    private onIncomingMessage?: () => void;
    private rpcConnection: INeoRpcConnection;
    private isPageLoading: boolean;

    public static async newSearch(
        query: string,
        extensionPath: string,
        rpcConnection: INeoRpcConnection,
        historyId: string,
        state: vscode.Memento,
        walletExplorer: WalletExplorer,
        disposables: vscode.Disposable[],
        neoExpressConfig?: NeoExpressConfig) {

        const panel = new NeoTrackerPanel(
            extensionPath, 
            rpcConnection, 
            historyId, 
            state, 
            walletExplorer, 
            disposables, 
            neoExpressConfig);
        await panel.search(query);
    }

    constructor(
        extensionPath: string,
        rpcConnection: INeoRpcConnection,
        historyId: string,
        state: vscode.Memento,
        walletExplorer: WalletExplorer,
        disposables: vscode.Disposable[],
        neoExpressConfig?: NeoExpressConfig) {

        this.rpcConnection = rpcConnection;
        this.rpcConnection.subscribe(this);

        this.viewState = new ViewState();

        this.ready = new Promise((resolve, reject) => {
            this.onIncomingMessage = resolve;
        });

        this.isPageLoading = true;
        
        this.historyId = historyId;
        this.state = state;
        this.walletExplorer = walletExplorer;
        this.neoExpressConfig = neoExpressConfig;

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

    private async augmentSearchHistory(query: string) {
        query = (query + '').replace(/^0x/, '');
        if (query.length) {
            const oldHistory = this.state.get<string[]>('searchHistory:' + this.historyId, []);
            const newHistory = [ query ];
            let i = 0;
            while ((i < oldHistory.length) && (newHistory.length < MaxSearchHistorySize)) {
                if (oldHistory[i] !== query) {
                    newHistory.push(oldHistory[i]);
                }
                i++;
            }
            await this.state.update('searchHistory:' + this.historyId, newHistory);
        }
    }

    private async clearSearchHistory() {
        await this.state.update('searchHistory:' + this.historyId, []);
    }

    private refreshViewState() {
        this.viewState.searchHistory = this.state.get<string[]>('searchHistory:' + this.historyId, []);

        const newSearchCompletions = [];

        for (let i = 0; i < this.viewState.searchHistory.length; i++) {
            const item = this.viewState.searchHistory[i];
            newSearchCompletions.push({ label: item, query: item });
        }

        const allAccounts = this.walletExplorer.allAccounts;
        for (let i = 0; i < allAccounts.length; i++) {
            const account = allAccounts[i];
            newSearchCompletions.push({ label: account.description, query: account.address });
        }

        if (this.neoExpressConfig) {
            this.neoExpressConfig.refresh();
            for (let i = 0; i < this.neoExpressConfig.wallets.length; i++) {
                const wallet = this.neoExpressConfig.wallets[i];
                newSearchCompletions.push({ label: wallet.description, query: wallet.address });
            }
        }

        this.viewState.searchCompletions = 
            newSearchCompletions.sort((a: any, b: any) => a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1);
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

    private async search(query: string) {
        let resultFound = false;
        query = this.viewState.searchCompletions.find(_ => _.label === query)?.query || query;
        const input = query.trim();
        const inputIsAddress = wallet.isAddress(input);
        const inputIsHash = !!input.match(/^(0x)?[0-9a-f]{64}$/i);
        const inputIsNumber = parseInt(input) + '' === input;
        // If the input is obviously (based on its format) an address, just get the data for that address:
        if (inputIsAddress) {
            this.viewState.currentAddressUnspents = await this.rpcConnection.getUnspents(input, this);
            this.viewState.currentAddressUnclaimed = await this.rpcConnection.getUnclaimed(input, this);
            await this.augmentSearchHistory(input);
            this.viewState.activePage = ActivePage.AddressDetail;
            resultFound = true;
        }
        // Next, see if the input is a block number or a block hash (only do the RPC call if the input is a valid integer or hash):
        if (!resultFound && (inputIsNumber || inputIsHash)) {
            const block = await this.rpcConnection.getBlock(inputIsNumber ? parseInt(input) : input, this);
            if (block) {
                this.viewState.currentBlock = block;
                await this.augmentSearchHistory(block.index);
                this.viewState.activePage = ActivePage.BlockDetail;
                resultFound = true;
            }
        }
        // Next, see if the input corresponds to a transaction hash (only do the RPC call if the input looks like a valid hash):
        if (!resultFound && inputIsHash) {
            const transaction = await this.rpcConnection.getTransaction(input, this);
            if (transaction) {
                this.viewState.currentTransaction = transaction;
                this.viewState.activePage = ActivePage.TransactionDetail;
                await this.augmentSearchHistory(input);
                resultFound = true;
            }
        }
        // Go to first page of block explorer when no results found:
        if (!resultFound) {
            this.viewState.firstBlock = undefined;
            this.viewState.forwards = true;
            await this.updateBlockList(true);
            this.viewState.activePage = ActivePage.Blocks;
        }
        this.refreshViewState();
        this.panel.webview.postMessage({ viewState: this.viewState, isSearch: true });
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
                // Fix the position in the block list (so that user sees the same blocks after hitting 'Back'):
                this.viewState.firstBlock = this.viewState.blocks.firstIndex;
                this.viewState.forwards = true;
                this.viewState.blockHighlight = message.c;
                this.viewState.currentBlock = await this.rpcConnection.getBlock(message.c, this);
                await this.augmentSearchHistory(this.viewState.currentBlock.index);
                this.viewState.activePage = ActivePage.BlockDetail;
            } else if (message.e === trackerEvents.CloseBlock) {
                this.viewState.currentBlock = undefined;
                this.viewState.transactionHighlight = undefined;
                this.viewState.activePage = (this.viewState.currentTransaction === undefined) ?
                    ActivePage.Blocks : ActivePage.TransactionDetail;
            } else if (message.e === trackerEvents.ShowTransaction) {
                this.viewState.transactionHighlight = message.c;
                this.viewState.currentTransaction = await this.rpcConnection.getTransaction(message.c, this);
                await this.augmentSearchHistory(message.c);
                this.viewState.activePage = ActivePage.TransactionDetail;
            } else if (message.e === trackerEvents.CloseTransaction) {
                this.viewState.currentTransaction = undefined;
                this.viewState.activePage = (this.viewState.currentAddressUnspents !== undefined) ?
                    ActivePage.AddressDetail : 
                    ((this.viewState.currentBlock === undefined) ? ActivePage.Blocks : ActivePage.BlockDetail);
            } else if (message.e === trackerEvents.ShowAddress) {
                this.viewState.currentAddressUnspents = await this.rpcConnection.getUnspents(message.c, this);
                this.viewState.currentAddressUnclaimed = await this.rpcConnection.getUnclaimed(message.c, this);
                await this.augmentSearchHistory(message.c);
                this.viewState.activePage = ActivePage.AddressDetail;
            } else if (message.e === trackerEvents.CloseAddress) {
                this.viewState.currentAddressUnspents = undefined;
                this.viewState.currentAddressUnclaimed = undefined;
                this.viewState.activePage = (this.viewState.currentTransaction !== undefined) ?
                    ActivePage.TransactionDetail : 
                    ((this.viewState.currentBlock !== undefined) ? ActivePage.BlockDetail : ActivePage.Blocks );
            } else if (message.e === trackerEvents.Copy) {
                await vscode.env.clipboard.writeText(message.c);
            } else if (message.e === trackerEvents.ClearHistory) {
                this.viewState.blockHighlight = undefined;
                this.viewState.transactionHighlight = undefined;
                await this.clearSearchHistory();
            } else if (message.e === trackerEvents.Search) {
                this.viewState.blockHighlight = undefined;
                this.viewState.transactionHighlight = undefined;
                await this.search(message.c);
            }
            if (message.e !== trackerEvents.Search) {
                this.refreshViewState();
                this.panel.webview.postMessage({ viewState: this.viewState, isSearch: false });
            }
        } finally {
            this.isPageLoading = false;
            this.updateStatus();
        }
    }

    dispose() {
        this.panel.dispose();
    }

}