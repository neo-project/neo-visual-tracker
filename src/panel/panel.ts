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
    BlockDetailPreviousLink: '#blockdetail .previous',
    BlockDetailNextLink: '#blockdetail .next',
};

// Names of events expected by the code running in neoTrackerPanel.ts:
const panelEvents = {
    Init: 'init',
    PreviousBlocksPage: 'previousBlocks',
    NextBlocksPage: 'nextBlocks',
    ShowBlock: 'showBlock',
    ShowBlockList: 'showBlockList',
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
    }
};

const renderers = {
    renderBlockchainInfo: function(blockchainInfo: any) {
        if (blockchainInfo) {
            htmlHelpers.setPlaceholder(selectors.BlockHeight, htmlHelpers.text(blockchainInfo.height.toLocaleString()));
        }
    },
    renderBlock: function(block?: any) {
        if (block) {
            htmlHelpers.setPlaceholder(selectors.BlockDetailHash, htmlHelpers.text(block.hash));
            htmlHelpers.setPlaceholder(selectors.BlockDetailIndex, htmlHelpers.text(block.index.toLocaleString()));
            htmlHelpers.setPlaceholder(selectors.BlockDetailTime, htmlHelpers.text(block.time));
            htmlHelpers.setPlaceholder(selectors.BlockDetailValidator, htmlHelpers.text(block.nextconsensus));
            htmlHelpers.setPlaceholder(selectors.BlockDetailSize, htmlHelpers.text(block.size));
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
                    htmlHelpers.text(contents.time),
                    htmlHelpers.text(contents.tx.length),
                    htmlHelpers.text(contents.nextconsensus),
                    htmlHelpers.text(contents.size));
                tbody.appendChild(row);
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
    console.log(message);
    renderers.renderBlockchainInfo(message.blockChainInfo);
    renderers.renderBlocks(message.blocks.blocks, message.firstBlock);
    renderers.renderBlock(message.currentBlock);
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
    htmlHelpers.setOnClickEvent(selectors.BlockDetailClose, panelEvents.ShowBlockList);
}

window.onload = initializePanel;