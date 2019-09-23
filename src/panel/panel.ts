/*
 * This code runs in the context of the WebView panel. It receives messages from the main extension 
 * containing blockchain information that should be rendered.  The browser instance running this code 
 * is disposed whenever the panel loses focus, and reloaded when it later gains focus (so navigation 
 * state should not be stored here).
 */

declare var acquireVsCodeApi: any;

const selectors = {
    BlockHeight: '#blockHeight',
    BlocksTableBody: '#blocks tbody',
    BlocksPaginationNext: '#blocks .next',
    BlocksPaginationPrevious: '#blocks .previous',
};

const panelEvents = {
    Init: 'init',
    PreviousBlocksPage: 'previousBlocks',
    NextBlocksPage: 'nextBlocks',
    ShowBlock: 'showBlock',
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
    setPlaceholder: function(selector: string, text: string) {
        const placeHolderElement = document.querySelector(selector);
        if (placeHolderElement) {
            placeHolderElement.textContent = text;
        }
    },
    text: function(content: string) {
        return document.createTextNode(content);
    }
};

const renderers = {
    renderBlockchainInfo: function(blockchainInfo: any) {
        if (blockchainInfo) {
            htmlHelpers.setPlaceholder(selectors.BlockHeight, blockchainInfo.height);
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
                    htmlHelpers.newEventLink(contents.index, panelEvents.ShowBlock, contents.index),
                    htmlHelpers.text(contents.time),
                    htmlHelpers.text(contents.tx.length),
                    htmlHelpers.text(contents.nextconsensus),
                    htmlHelpers.text(contents.size));
                tbody.appendChild(row);
            }
        }
    },
};

function handleMessage(message: any) {
    console.log(message);
    renderers.renderBlockchainInfo(message.blockChainInfo);
    renderers.renderBlocks(message.blocks.blocks, message.firstBlock);
}

let vsCodePostMessage : Function;

function initializePanel() {
    const vscode = acquireVsCodeApi();
    vsCodePostMessage = vscode.postMessage;
    window.addEventListener('message', msg => handleMessage(msg.data));
    vscode.postMessage({ e: panelEvents.Init });
    htmlHelpers.setOnClickEvent(selectors.BlocksPaginationPrevious, panelEvents.PreviousBlocksPage);
    htmlHelpers.setOnClickEvent(selectors.BlocksPaginationNext, panelEvents.NextBlocksPage);
}

window.onload = initializePanel;