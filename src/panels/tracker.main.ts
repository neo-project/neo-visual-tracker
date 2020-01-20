import { htmlHelpers } from "./htmlHelpers";
import { trackerEvents } from "./trackerEvents";
import { trackerRenderers } from "./trackerRenderers";
import { trackerSelectors } from "./trackerSelectors";

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
        trackerRenderers.renderBlockchainInfo(message.viewState.blockChainInfo);
        trackerRenderers.renderBlocks(message.viewState.blocks.blocks, message.viewState.firstBlock, vsCodePostMessage);
        trackerRenderers.renderBlock(message.viewState.currentBlock, vsCodePostMessage);
        trackerRenderers.renderTransaction(message.viewState.currentTransaction, vsCodePostMessage);
        trackerRenderers.renderAddress(message.viewState.currentAddressUnspents, message.viewState.currentAddressUnclaimed, message.viewState.currentAddressClaimable, vsCodePostMessage);
        trackerRenderers.setPage(message.viewState.activePage);
        if (message.viewState.activePage !== 'addressdetail') {
            htmlHelpers.showHide(trackerSelectors.AddressDetailsGasExpando, false);
            htmlHelpers.showHide(trackerSelectors.AddressDetailsShowGasDetails, true, 'inline');
            htmlHelpers.showHide(trackerSelectors.AddressDetailsHideGasDetails, false);
        } 
        htmlHelpers.showHide(trackerSelectors.StatusBar, !!message.viewState.blockChainInfo);
        const openingIndicator: any = document.querySelector(trackerSelectors.OpeningIndicator);
        openingIndicator.style.display = (!message.viewState.blockChainInfo || !message.viewState.blockChainInfo.online) ? 'block' : 'none';
        const checkbox: any = document.querySelector(trackerSelectors.HideEmptyBlocksCheckbox);
        checkbox.checked = message.viewState.hideEmptyBlocks;
        debugger;
        htmlHelpers.showHide(trackerSelectors.HideEmptyBlocksCheckboxArea, message.viewState.blockChainInfo && message.viewState.blockChainInfo.populatedBlockFilterSupported);
        if (message.isSearch) {
            const searchInput = document.querySelector(trackerSelectors.SearchInput) as HTMLInputElement;
            searchInput.value = '';
        }
    } else if (message.status) {
        const loadingIndicator: any = document.querySelector(trackerSelectors.LoadingIndicator);
        loadingIndicator.style.display = message.status.isLoading ? 'block' : 'none';
        htmlHelpers.setPlaceholder(trackerSelectors.LoadingMessage, htmlHelpers.text(message.status.message));
        // console.warn(new Date, 'status: ', message.status);
    }
}

let vsCodePostMessage : Function;

function initializePanel() {
    const vscode = acquireVsCodeApi();
    vsCodePostMessage = vscode.postMessage;
    window.addEventListener('message', msg => handleMessage(msg.data));
    vscode.postMessage({ e: trackerEvents.Init });
    htmlHelpers.setOnClickEvent(trackerSelectors.BlocksPaginationPrevious, trackerEvents.PreviousBlocksPage, null, vsCodePostMessage);
    htmlHelpers.setOnClickEvent(trackerSelectors.BlocksPaginationNext, trackerEvents.NextBlocksPage, null, vsCodePostMessage);
    htmlHelpers.setOnClickEvent(trackerSelectors.BlocksPaginationFirst, trackerEvents.FirstBlocksPage, null, vsCodePostMessage);
    htmlHelpers.setOnClickEvent(trackerSelectors.BlocksPaginationLast, trackerEvents.LastBlocksPage, null, vsCodePostMessage);
    htmlHelpers.setOnClickEvent(trackerSelectors.BlockDetailClose, trackerEvents.CloseBlock, null, vsCodePostMessage);
    htmlHelpers.setOnClickEvent(trackerSelectors.TransactionDetailClose, trackerEvents.CloseTransaction, null, vsCodePostMessage);
    htmlHelpers.setOnClickEvent(trackerSelectors.AddressDetailsClose, trackerEvents.CloseAddress, null, vsCodePostMessage);

    htmlHelpers.showHide(trackerSelectors.AddressDetailsGasExpando, false);
    htmlHelpers.showHide(trackerSelectors.AddressDetailsShowGasDetails, true, 'inline');
    htmlHelpers.showHide(trackerSelectors.AddressDetailsHideGasDetails, false);

    const showGasDetail = document.querySelector(trackerSelectors.AddressDetailsShowGasDetails) as HTMLAnchorElement;
    showGasDetail.addEventListener('click', _ => {
        htmlHelpers.showHide(trackerSelectors.AddressDetailsGasExpando, true);
        htmlHelpers.showHide(trackerSelectors.AddressDetailsShowGasDetails, false);
        htmlHelpers.showHide(trackerSelectors.AddressDetailsHideGasDetails, true, 'inline');
    });

    const hideGasDetail = document.querySelector(trackerSelectors.AddressDetailsHideGasDetails) as HTMLAnchorElement;
    hideGasDetail.addEventListener('click', _ => {
        htmlHelpers.showHide(trackerSelectors.AddressDetailsGasExpando, false);
        htmlHelpers.showHide(trackerSelectors.AddressDetailsShowGasDetails, true, 'inline');
        htmlHelpers.showHide(trackerSelectors.AddressDetailsHideGasDetails, false);
    });

    const checkbox = document.querySelector(trackerSelectors.HideEmptyBlocksCheckbox);
    if (checkbox) {
        checkbox.addEventListener(
            'change', 
            () => vsCodePostMessage({ e: trackerEvents.ChangeHideEmpty, c: (checkbox as any).checked }));
    }

    const searchButton = document.querySelector(trackerSelectors.SearchButton) as HTMLButtonElement;
    const searchInput = document.querySelector(trackerSelectors.SearchInput) as HTMLInputElement;
    searchButton.addEventListener('click', _ => {
        vsCodePostMessage({ e: trackerEvents.Search, c: searchInput.value });
    });
    searchInput.addEventListener('keyup', e => {
        if (e.keyCode === 13) { // enter
            vsCodePostMessage({ e: trackerEvents.Search, c: searchInput.value });
        }
    });
}

window.onload = initializePanel;