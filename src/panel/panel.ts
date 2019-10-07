import { htmlHelpers } from "./htmlHelpers";
import { panelEvents } from "./panelEvents";
import { renderers } from "./renderers";
import { selectors } from "./selectors";

/*
 * This code runs in the context of the WebView panel. It receives messages from the main extension 
 * containing blockchain information that should be rendered.  The browser instance running this code 
 * is disposed whenever the panel loses focus, and reloaded when it later gains focus (so navigation 
 * state should not be stored here).
 */

declare var acquireVsCodeApi: any;

function handleMessage(message: any) {
    if (message.viewState) {
        console.log(message.viewState);
        renderers.renderBlockchainInfo(message.viewState.blockChainInfo);
        renderers.renderBlocks(message.viewState.blocks.blocks, message.viewState.firstBlock, vsCodePostMessage);
        renderers.renderBlock(message.viewState.currentBlock, vsCodePostMessage);
        renderers.renderTransaction(message.viewState.currentTransaction, vsCodePostMessage);
        renderers.setPage(message.viewState.activePage);
    } else if (message.status) {
        const loadingIndicator: any = document.querySelector(selectors.LoadingIndicator);
        loadingIndicator.style.display = message.status.isLoading ? 'block' : 'none';
        htmlHelpers.setPlaceholder(selectors.LoadingMessage, htmlHelpers.text(message.status.message));
        // console.warn(new Date, 'status: ', message.status);
    }
}

let vsCodePostMessage : Function;

function initializePanel() {
    const vscode = acquireVsCodeApi();
    vsCodePostMessage = vscode.postMessage;
    window.addEventListener('message', msg => handleMessage(msg.data));
    vscode.postMessage({ e: panelEvents.Init });
    htmlHelpers.setOnClickEvent(selectors.BlocksPaginationPrevious, panelEvents.PreviousBlocksPage, null, vsCodePostMessage);
    htmlHelpers.setOnClickEvent(selectors.BlocksPaginationNext, panelEvents.NextBlocksPage, null, vsCodePostMessage);
    htmlHelpers.setOnClickEvent(selectors.BlocksPaginationFirst, panelEvents.FirstBlocksPage, null, vsCodePostMessage);
    htmlHelpers.setOnClickEvent(selectors.BlocksPaginationLast, panelEvents.LastBlocksPage, null, vsCodePostMessage);
    htmlHelpers.setOnClickEvent(selectors.BlockDetailClose, panelEvents.CloseBlock, null, vsCodePostMessage);
    htmlHelpers.setOnClickEvent(selectors.TransactionDetailClose, panelEvents.CloseTransaction, null, vsCodePostMessage);
    
    const checkbox = document.querySelector(selectors.HideEmptyBlocksCheckbox);
    if (checkbox) {
        checkbox.addEventListener(
            'change', 
            () => vsCodePostMessage({ e: panelEvents.ChangeHideEmpty, c: (checkbox as any).checked }));
    }
}

window.onload = initializePanel;