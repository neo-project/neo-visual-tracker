/*
 * This code runs in the context of the WebView panel. It receives messages from the main extension 
 * containing blockchain information that should be rendered.  The browser instance running this code 
 * is disposed whenever the panel loses focus, and reloaded when it later gains focus (so navigation 
 * state should not be stored here).
 */

declare var acquireVsCodeApi: any;

const htmlHelpers = {
    clearChildren: function(element: Element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    },
    newTableRow: function(...cells: string[]) {
        const row = document.createElement('tr');
        for (let i = 0; i < cells.length; i++) {
            const cell = document.createElement('td');
            cell.appendChild(document.createTextNode(cells[i]));
            row.appendChild(cell);
        }
    
        return row;
    },
    setOnClickEvent: function(selector: string, event: string, postMessage: any) {
        const clickable = document.querySelector(selector);
        if (clickable) {
            clickable.addEventListener('click', () => postMessage({ e: event }));
        }
    },
    setPlaceholder: function(selector: string, text: string) {
        const placeHolderElement = document.querySelector(selector);
        if (placeHolderElement) {
            placeHolderElement.textContent = text;
        }
    },
};

const renderers = {
    renderBlockchainInfo: function(blockchainInfo: any) {
        htmlHelpers.setPlaceholder('#blockHeight', blockchainInfo.height);
    },
    renderBlocks: function (blocks: any[]) {
        const tbody = document.querySelector('#blocks tbody');
        if (tbody) {
            htmlHelpers.clearChildren(tbody);   
            for (let i = 0; i < blocks.length; i++) {
                const contents = blocks[i];
                const row = htmlHelpers.newTableRow(
                    contents.index,
                    contents.time,
                    contents.tx.length,
                    contents.nextconsensus,
                    contents.size);
                tbody.appendChild(row);
            }
        }
    },
};

function handleMessage(message: any) {
    console.log(message);
    renderers.renderBlockchainInfo(message.blockChainInfo);
    renderers.renderBlocks(message.blocks.blocks);
}

function initializePanel() {
    const vscode = acquireVsCodeApi();
    window.addEventListener('message', msg => handleMessage(msg.data));
    vscode.postMessage({ e: 'init' });
    htmlHelpers.setOnClickEvent('#blocks .previous', 'previousBlocks', vscode.postMessage);
    htmlHelpers.setOnClickEvent('#blocks .next', 'nextBlocks', vscode.postMessage);
}

window.onload = initializePanel;