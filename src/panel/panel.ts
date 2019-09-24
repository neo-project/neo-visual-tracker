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
    BlocksTableBody: '#blocks tbody',
    BlocksPaginationNext: '#blocks .next',
    BlocksPaginationPrevious: '#blocks .previous',
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
    TransactionDetailClaimsTable: '#transactiondetail .claims',
    TransactionDetailInputsTable: '#transactiondetail .inputs',
    TransactionDetailOutputsTable: '#transactiondetail .outputs',
};

// Names of events expected by the code running in neoTrackerPanel.ts:
const panelEvents = {
    Init: 'init',
    PreviousBlocksPage: 'previousBlocks',
    NextBlocksPage: 'nextBlocks',
    ShowBlock: 'showBlock',
    CloseBlock: 'closeBlock',
    ShowTransaction: 'showTransaction',
    CloseTransaction: 'closeTransaction',
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
    renderBlockchainInfo: function(blockchainInfo: any) {
        if (blockchainInfo) {
            htmlHelpers.setPlaceholder(selectors.BlockHeight, htmlHelpers.text(blockchainInfo.height.toLocaleString()));
            htmlHelpers.setPlaceholder(selectors.RpcUrl, htmlHelpers.text(blockchainInfo.url));
            htmlHelpers.setPlaceholder(selectors.RpcStatus, htmlHelpers.text(blockchainInfo.online ? 'Connected to' : 'Connecting to'));
        }
    },
    renderBlock: function(block?: any) {
        if (block) {
            htmlHelpers.setPlaceholder(selectors.BlockDetailHash, htmlHelpers.text(block.hash));
            htmlHelpers.setPlaceholder(selectors.BlockDetailIndex, htmlHelpers.text(block.index.toLocaleString()));
            htmlHelpers.setPlaceholder(selectors.BlockDetailTime, htmlHelpers.text(htmlHelpers.time(block.time)));
            htmlHelpers.setPlaceholder(selectors.BlockDetailValidator, htmlHelpers.text(block.nextconsensus));
            htmlHelpers.setPlaceholder(selectors.BlockDetailSize, htmlHelpers.text(block.size.toLocaleString() + ' bytes'));
            htmlHelpers.setPlaceholder(selectors.BlockDetailVersion, htmlHelpers.text(block.version));
            htmlHelpers.setPlaceholder(selectors.BlockDetailMerkleRoot, htmlHelpers.text(block.merkleroot));
            htmlHelpers.setPlaceholder(selectors.BlockDetailTransactions, htmlHelpers.text(block.tx.length));

            if (block.previousblockhash) {
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
                        htmlHelpers.text(tx.size.toLocaleString() + ' bytes'),
                        htmlHelpers.text(tx.net_fee.toLocaleString() + ' GAS'),
                        htmlHelpers.text(tx.sys_fee.toLocaleString() + ' GAS'));
                        txTbody.appendChild(row);
                }
            }
        }
    },
    renderBlocks: function (blocks: any[], firstBlock?: number) {
        htmlHelpers.setEnabled(selectors.BlocksPaginationPrevious, firstBlock !== undefined);
        const tbody = document.querySelector(selectors.BlocksTableBody);
        if (tbody) {
            htmlHelpers.clearChildren(tbody);
            for (let i = 0; i < blocks.length; i++) {
                const contents = blocks[i];
                const row = htmlHelpers.newTableRow(
                    htmlHelpers.newEventLink(contents.index.toLocaleString(), panelEvents.ShowBlock, contents.index),
                    htmlHelpers.text(htmlHelpers.time(contents.time)),
                    htmlHelpers.text(contents.tx.length),
                    htmlHelpers.text(contents.nextconsensus),
                    htmlHelpers.text(contents.size.toLocaleString() + ' bytes'));
                tbody.appendChild(row);
            }
        }
    },
    renderInputsOutputs: function(tbodySelector: string, inputOutputList: any[]) {
        const tbody = document.querySelector(tbodySelector);
        if (tbody) {
            htmlHelpers.clearChildren(tbody);
            for (let i = 0; i < inputOutputList.length; i++) {
                const inputOutput = inputOutputList[i];
                const row = htmlHelpers.newTableRow(
                    htmlHelpers.text(inputOutput.address),
                    htmlHelpers.text(inputOutput.asset),
                    htmlHelpers.text(inputOutput.value.toLocaleString()));
                tbody.appendChild(row);
            }
        }
    },
    renderTransaction: function(transaction?: any) {
        if (transaction) {
            htmlHelpers.setPlaceholder(selectors.TransactionDetailType, htmlHelpers.text(transaction.type));
            htmlHelpers.setPlaceholder(selectors.TransactionDetailHash, htmlHelpers.text(transaction.txid));
            htmlHelpers.setPlaceholder(selectors.TransactionDetailTime, htmlHelpers.text(htmlHelpers.time(transaction.blocktime)));
            htmlHelpers.setPlaceholder(selectors.TransactionDetailNetworkFee, htmlHelpers.text(transaction.net_fee.toLocaleString() + ' GAS'));
            htmlHelpers.setPlaceholder(selectors.TransactionDetailSystemFee, htmlHelpers.text(transaction.sys_fee.toLocaleString() + ' GAS'));
            htmlHelpers.setPlaceholder(selectors.TransactionDetailSize, htmlHelpers.text(transaction.size.toLocaleString() + ' bytes'));
            htmlHelpers.setPlaceholder(
                selectors.TransactionDetailBlock, 
                htmlHelpers.newEventLink(transaction.blockhash, panelEvents.ShowBlock, transaction.blockhash));
            this.renderInputsOutputs(selectors.TransactionDetailClaimsTable, transaction.claimsAugmented);
            this.renderInputsOutputs(selectors.TransactionDetailInputsTable, transaction.vinAugmented);
            this.renderInputsOutputs(selectors.TransactionDetailOutputsTable, transaction.vout);
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
    console.log(message);
    renderers.renderBlockchainInfo(message.blockChainInfo);
    renderers.renderBlocks(message.blocks.blocks, message.firstBlock);
    renderers.renderBlock(message.currentBlock);
    renderers.renderTransaction(message.currentTransaction);
    renderers.setPage(message.activePage);
}

let vsCodePostMessage : Function;

function initializePanel() {
    const vscode = acquireVsCodeApi();
    vsCodePostMessage = vscode.postMessage;
    window.addEventListener('message', msg => handleMessage(msg.data));
    vscode.postMessage({ e: panelEvents.Init });
    htmlHelpers.setOnClickEvent(selectors.BlocksPaginationPrevious, panelEvents.PreviousBlocksPage);
    htmlHelpers.setOnClickEvent(selectors.BlocksPaginationNext, panelEvents.NextBlocksPage);
    htmlHelpers.setOnClickEvent(selectors.BlockDetailClose, panelEvents.CloseBlock);
    htmlHelpers.setOnClickEvent(selectors.TransactionDetailClose, panelEvents.CloseTransaction);
}

window.onload = initializePanel;