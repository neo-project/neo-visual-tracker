/*
 * This code runs in the context of the WebView panel. It receives messages from the main extension 
 * containing blockchain information that should be rendered.  The browser instance running this code 
 * is disposed whenever the panel loses focus, and reloaded when it later gains focus (so navigation 
 * state should not be stored here).
 */

declare var acquireVsCodeApi: any;

// DOM query selectors for various elements in the panel.html template:
const selectors = {
    AllPages: '.page',
    BlockHeight: '#blockHeight',
    RpcUrl: '#rpcUrl',
    RpcStatus: '#rpcStatus',
    HideEmptyBlocksCheckbox: '#hideEmpty',
    BlocksTableBody: '#blocks tbody',
    BlocksPaginationFirst: '#blocks .first',
    BlocksPaginationNext: '#blocks .next',
    BlocksPaginationPrevious: '#blocks .previous',
    BlocksPaginationLast: '#blocks .last',
    BlockDetailClose: '#blockdetail .close',
    BlockDetailHash: '#blockdetail .hash',
    BlockDetailIndex: '#blockdetail .index',
    BlockDetailTime: '#blockdetail .time',
    BlockDetailValidator: '#blockdetail .validator',
    BlockDetailSize: '#blockdetail .size',
    BlockDetailVersion: '#blockdetail .version',
    BlockDetailMerkleRoot: '#blockdetail .merkleRoot',
    BlockDetailTransactions: '#blockdetail .transactions',
    BlockDetailTransactionsTable: '#blockdetail .txs',
    BlockDetailPreviousLink: '#blockdetail .previous',
    BlockDetailNextLink: '#blockdetail .next',
    TransactionDetailClose: '#transactiondetail .close',
    TransactionDetailType: '#transactiondetail .type',
    TransactionDetailHash: '#transactiondetail .hash',
    TransactionDetailTime: '#transactiondetail .time',
    TransactionDetailNetworkFee: '#transactiondetail .networkFee',
    TransactionDetailSystemFee: '#transactiondetail .systemFee',
    TransactionDetailSize: '#transactiondetail .size',
    TransactionDetailBlock: '#transactiondetail .block',
    TransactionValueTransferTable: '#transactiondetail #value-transfer',
    TransactionDetailInputsClaimsTable: '#transactiondetail .inputsClaims',
    TransactionDetailOutputsTable: '#transactiondetail .outputs',
    TransactionScriptsTable: '#transactiondetail #scripts',
    TransactionScriptsTableBody: '#transactiondetail #scripts .script-rows',
    TransactionMainScriptArea: '#transactiondetail #main-script',
    TransactionMainScriptBody: '#transactiondetail #main-script .script-body',
    LoadingIndicator: '#loading-indicator',
    LoadingMessage: '#loading-indicator .message',
};

// Names of events expected by the code running in neoTrackerPanel.ts:
const panelEvents = {
    Init: 'init',
    PreviousBlocksPage: 'previousBlocks',
    NextBlocksPage: 'nextBlocks',
    FirstBlocksPage: 'firstBlocks',
    LastBlocksPage: 'lastBlocks',
    ShowBlock: 'showBlock',
    CloseBlock: 'closeBlock',
    ShowTransaction: 'showTransaction',
    CloseTransaction: 'closeTransaction',
    ChangeHideEmpty: 'changeHideEmpty',
};

const htmlHelpers = {
    clearChildren: function(element: Element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    },
    newEventLink: function(text: string, event: string, context?: any) {
        const link = document.createElement('a');
        link.href = '#';
        link.appendChild(document.createTextNode(text));
        this.setOnClickEvent(link, event, context);
        return link;
    },
    newTableRow: function(...cells: Node[]) {
        const row = document.createElement('tr');
        for (let i = 0; i < cells.length; i++) {
            const cell = document.createElement('td');
            cell.appendChild(cells[i]);
            row.appendChild(cell);
        }
        return row;
    },
    number: function(n: number) {
        // avoid rounding small values to 0:
        return n.toLocaleString(undefined, { maximumFractionDigits: 20 });
    },
    setEnabled: function(selector: string, isEnabled: boolean) {
        const element = document.querySelector(selector);
        if (element) {
            (element as any).disabled = !isEnabled;
        }
    },
    setOnClickEvent: function(element: string | Element, event: string, context?: any) {
        const clickable = (typeof element === 'string') ? document.querySelector(element) : element;
        if (clickable) {
            clickable.addEventListener('click', () => vsCodePostMessage({ e: event, c: context }));
        }
    },
    setPlaceholder: function(selector: string, value: Node) {
        const placeHolderElement = document.querySelector(selector);
        if (placeHolderElement) {
            this.clearChildren(placeHolderElement);
            placeHolderElement.appendChild(value);
        }
    },
    text: function(content: string) {
        return document.createTextNode(content);
    },
    time: function(unixTimestamp: number) {
        return (new Date(unixTimestamp * 1000)).toLocaleString();
    },
};

const renderers = {
    assetName: function(assetId: string, assets: any) {
        const assetInfo = assets[assetId];
        if (assetInfo) {
            const assetNames = assetInfo.name;
            if (assetNames && assetNames.length) {
                for (let i = 0; i < assetNames.length; i++) {
                    if (assetNames[i].lang === "en") {
                        return assetNames[i].name || assetId;
                    }
                }
            }
        }
        return assetId;
    },
    renderBlockchainInfo: function(blockchainInfo: any) {
        if (blockchainInfo) {
            htmlHelpers.setPlaceholder(selectors.BlockHeight, htmlHelpers.text(htmlHelpers.number(blockchainInfo.height)));
            htmlHelpers.setPlaceholder(selectors.RpcUrl, htmlHelpers.text(blockchainInfo.url));
            htmlHelpers.setPlaceholder(selectors.RpcStatus, htmlHelpers.text(blockchainInfo.online ? 'Connected to' : 'Connecting to'));
        }
    },
    renderBlock: function(block?: any) {
        if (block) {
            htmlHelpers.setPlaceholder(selectors.BlockDetailHash, htmlHelpers.text(block.hash));
            htmlHelpers.setPlaceholder(selectors.BlockDetailIndex, htmlHelpers.text(htmlHelpers.number(block.index)));
            htmlHelpers.setPlaceholder(selectors.BlockDetailTime, htmlHelpers.text(htmlHelpers.time(block.time)));
            htmlHelpers.setPlaceholder(selectors.BlockDetailValidator, htmlHelpers.text(block.nextconsensus));
            htmlHelpers.setPlaceholder(selectors.BlockDetailSize, htmlHelpers.text(htmlHelpers.number(block.size) + ' bytes'));
            htmlHelpers.setPlaceholder(selectors.BlockDetailVersion, htmlHelpers.text(block.version));
            htmlHelpers.setPlaceholder(selectors.BlockDetailMerkleRoot, htmlHelpers.text(block.merkleroot));
            htmlHelpers.setPlaceholder(selectors.BlockDetailTransactions, htmlHelpers.text(block.tx.length));

            if ((block.index > 0) && block.previousblockhash) {
                htmlHelpers.setPlaceholder(
                    selectors.BlockDetailPreviousLink, 
                    htmlHelpers.newEventLink(block.previousblockhash, panelEvents.ShowBlock, block.index - 1));
            } else {
                htmlHelpers.setPlaceholder(selectors.BlockDetailPreviousLink, htmlHelpers.text('None'));
            }

            if (block.nextblockhash) {
                htmlHelpers.setPlaceholder(
                    selectors.BlockDetailNextLink, 
                    htmlHelpers.newEventLink(block.nextblockhash, panelEvents.ShowBlock, block.index + 1));
            } else {
                htmlHelpers.setPlaceholder(selectors.BlockDetailNextLink, htmlHelpers.text('None'));
            }

            const txTbody = document.querySelector(selectors.BlockDetailTransactionsTable);
            if (txTbody) {
                htmlHelpers.clearChildren(txTbody);
                for (let i = 0; i < block.tx.length; i++) {
                    const tx = block.tx[i];
                    const row = htmlHelpers.newTableRow(
                        htmlHelpers.text(tx.type),
                        htmlHelpers.newEventLink(tx.txid, panelEvents.ShowTransaction, tx.txid),
                        htmlHelpers.text(htmlHelpers.number(tx.size) + ' bytes'),
                        htmlHelpers.text(htmlHelpers.number(tx.net_fee) + ' GAS'),
                        htmlHelpers.text(htmlHelpers.number(tx.sys_fee) + ' GAS'));
                        txTbody.appendChild(row);
                }
            }
        }
    },
    renderBlocks: function (blocks: any[], firstBlock?: number) {
        htmlHelpers.setEnabled(selectors.BlocksPaginationPrevious, firstBlock !== undefined);
        htmlHelpers.setEnabled(selectors.BlocksPaginationFirst, firstBlock !== undefined);
        const tbody = document.querySelector(selectors.BlocksTableBody);
        if (tbody) {
            htmlHelpers.clearChildren(tbody);
            for (let i = 0; i < blocks.length; i++) {
                const contents = blocks[i];
                const row = htmlHelpers.newTableRow(
                    htmlHelpers.newEventLink(htmlHelpers.number(contents.index), panelEvents.ShowBlock, contents.index),
                    htmlHelpers.text(htmlHelpers.time(contents.time)),
                    htmlHelpers.text(contents.tx.length),
                    htmlHelpers.text(contents.nextconsensus),
                    htmlHelpers.text(htmlHelpers.number(contents.size) + ' bytes'));
                tbody.appendChild(row);
            }
        }
    },
    renderInputsOutputs: function(tbodySelector: string, inputOutputList: any[], assets: any, clear: boolean, negate: boolean) {
        const tbody = document.querySelector(tbodySelector);
        if (tbody) {
            if (clear) {
                htmlHelpers.clearChildren(tbody);
            }
            for (let i = 0; i < inputOutputList.length; i++) {
                const inputOutput = inputOutputList[i];
                if (negate) {
                    inputOutput.value *= -1;
                }
                const row = htmlHelpers.newTableRow(
                    htmlHelpers.text(inputOutput.address),
                    htmlHelpers.text(htmlHelpers.number(inputOutput.value) + ' ' + this.assetName(inputOutput.asset, assets)));
                tbody.appendChild(row);
            }
            return inputOutputList.length;
        }
        return 0;
    },
    renderTransaction: function(transaction?: any) {
        if (transaction) {
            htmlHelpers.setPlaceholder(selectors.TransactionDetailType, htmlHelpers.text(transaction.type));
            htmlHelpers.setPlaceholder(selectors.TransactionDetailHash, htmlHelpers.text(transaction.txid));
            htmlHelpers.setPlaceholder(selectors.TransactionDetailTime, htmlHelpers.text(htmlHelpers.time(transaction.blocktime)));
            htmlHelpers.setPlaceholder(selectors.TransactionDetailNetworkFee, htmlHelpers.text(htmlHelpers.number(transaction.net_fee) + ' GAS'));
            htmlHelpers.setPlaceholder(selectors.TransactionDetailSystemFee, htmlHelpers.text(htmlHelpers.number(transaction.sys_fee) + ' GAS'));
            htmlHelpers.setPlaceholder(selectors.TransactionDetailSize, htmlHelpers.text(htmlHelpers.number(transaction.size) + ' bytes'));
            htmlHelpers.setPlaceholder(
                selectors.TransactionDetailBlock, 
                htmlHelpers.newEventLink(transaction.blockhash, panelEvents.ShowBlock, transaction.blockhash));
            let valueTransferCount = 0;
            valueTransferCount += this.renderInputsOutputs(selectors.TransactionDetailInputsClaimsTable, transaction.claimsAugmented, transaction.assets, true, false);
            valueTransferCount += this.renderInputsOutputs(selectors.TransactionDetailInputsClaimsTable, transaction.vinAugmented, transaction.assets, false, true);
            valueTransferCount += this.renderInputsOutputs(selectors.TransactionDetailOutputsTable, transaction.vout, transaction.assets, true, false);
            (document.querySelector(selectors.TransactionValueTransferTable) as any).style.display =
                valueTransferCount > 0 ? 'table' : 'none';
            const scriptsTbody = document.querySelector(selectors.TransactionScriptsTableBody);
            (document.querySelector(selectors.TransactionMainScriptArea) as any).style.display =
                transaction.scriptDisassembled ? 'table' : 'none';
            htmlHelpers.setPlaceholder(
                selectors.TransactionMainScriptBody, 
                htmlHelpers.text(transaction.scriptDisassembled));
            (document.querySelector(selectors.TransactionScriptsTable) as any).style.display =
                transaction.scripts.length > 0 ? 'table' : 'none';
            if (scriptsTbody) {
                htmlHelpers.clearChildren(scriptsTbody);
                for (let i = 0; i < transaction.scripts.length; i++) {
                    const script = transaction.scripts[i];
                    scriptsTbody.appendChild(
                        htmlHelpers.newTableRow(htmlHelpers.text('Invocation:'), htmlHelpers.text(script.invocationDisassembled)));
                    scriptsTbody.appendChild(
                        htmlHelpers.newTableRow(htmlHelpers.text('Verification:'), htmlHelpers.text(script.verificationDisassembled)));
                }
            }
        }
    },
    setPage: function(activePage: string) {
        const allPages = document.querySelectorAll(selectors.AllPages);
        for (let i = 0; i < allPages.length; i++) {
            const id = allPages[i].id;
            (allPages[i] as any).style.display = id === activePage ? 'block' : 'none';
        }
    },
};

function handleMessage(message: any) {
    if (message.viewState) {
        console.log(message.viewState);
        renderers.renderBlockchainInfo(message.viewState.blockChainInfo);
        renderers.renderBlocks(message.viewState.blocks.blocks, message.viewState.firstBlock);
        renderers.renderBlock(message.viewState.currentBlock);
        renderers.renderTransaction(message.viewState.currentTransaction);
        renderers.setPage(message.viewState.activePage);
    } else if (message.status) {
        const loadingIndicator: any = document.querySelector(selectors.LoadingIndicator);
        loadingIndicator.style.display = message.status.isLoading ? 'block' : 'none';
        htmlHelpers.setPlaceholder(selectors.LoadingMessage, htmlHelpers.text(message.status.message));
        console.warn(new Date, 'status: ', message.status);
    }
}

let vsCodePostMessage : Function;

function initializePanel() {
    const vscode = acquireVsCodeApi();
    vsCodePostMessage = vscode.postMessage;
    window.addEventListener('message', msg => handleMessage(msg.data));
    vscode.postMessage({ e: panelEvents.Init });
    htmlHelpers.setOnClickEvent(selectors.BlocksPaginationPrevious, panelEvents.PreviousBlocksPage);
    htmlHelpers.setOnClickEvent(selectors.BlocksPaginationNext, panelEvents.NextBlocksPage);
    htmlHelpers.setOnClickEvent(selectors.BlocksPaginationFirst, panelEvents.FirstBlocksPage);
    htmlHelpers.setOnClickEvent(selectors.BlocksPaginationLast, panelEvents.LastBlocksPage);
    htmlHelpers.setOnClickEvent(selectors.BlockDetailClose, panelEvents.CloseBlock);
    htmlHelpers.setOnClickEvent(selectors.TransactionDetailClose, panelEvents.CloseTransaction);
    
    const checkbox = document.querySelector(selectors.HideEmptyBlocksCheckbox);
    if (checkbox) {
        checkbox.addEventListener(
            'change', 
            () => vsCodePostMessage({ e: panelEvents.ChangeHideEmpty, c: (checkbox as any).checked }));
    }
}

window.onload = initializePanel;