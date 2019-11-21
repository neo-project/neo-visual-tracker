import { htmlHelpers } from "./htmlHelpers";
import { transferEvents } from "./transferEvents";
import { transferSelectors } from "./transferSelectors";

/*
 * This code runs in the context of the WebView panel. It exchanges JSON messages with the main 
 * extension code. The browser instance running this code is disposed whenever the panel loses 
 * focus, and reloaded when it later gains focus (so navigation state should not be stored here).
 */

declare var acquireVsCodeApi: any;

let viewState: any = {};

let vsCodePostMessage: Function;

function postViewState(skipValidation?: boolean) {
    vsCodePostMessage({ e: transferEvents.Update, c: viewState, v: !skipValidation });
    console.log('->', viewState);
}

function populateWalletDropdown(selector: string, currentSelection?: string) {
    const dropdown = document.querySelector(selector) as HTMLSelectElement;
    htmlHelpers.clearChildren(dropdown);
    let index = 0;
    dropdown.appendChild(document.createElement('option'));
    for (let i = 0; i < viewState.wallets.length; i++) {
        index++;
        const option = document.createElement('option') as HTMLOptionElement;
        option.value = viewState.wallets[i];
        option.appendChild(htmlHelpers.text(viewState.wallets[i]));
        dropdown.appendChild(option);
        if (viewState.wallets[i] === currentSelection) {
            dropdown.selectedIndex = index;
        }
    }
}

function populateAssetDropdown() {
    const dropdown = document.querySelector(transferSelectors.AssetDropdown) as HTMLSelectElement;
    htmlHelpers.clearChildren(dropdown);
    let index = 0;
    dropdown.appendChild(document.createElement('option'));
    for (let i = 0; i < viewState.sourceWalletBalances.length; i++) {
        index++;
        const option = document.createElement('option') as HTMLOptionElement;
        option.value = viewState.sourceWalletBalances[i].asset;
        option.appendChild(htmlHelpers.text(viewState.sourceWalletBalances[i].asset));
        dropdown.appendChild(option);
        if (viewState.sourceWalletBalances[i].asset === viewState.assetName) {
            dropdown.selectedIndex = index;
        }
    }
}

function render() {
    const transferButton = document.querySelector(transferSelectors.TransferButton) as HTMLButtonElement;
    const balancesTableBody = document.querySelector(transferSelectors.SourceBalancesTableBody) as HTMLTableSectionElement;
    const amountInput = document.querySelector(transferSelectors.AmountInput) as HTMLInputElement;
    populateWalletDropdown(transferSelectors.SourceWalletDropdown, viewState.sourceWallet);
    populateWalletDropdown(transferSelectors.DestinationWalletDropdown, viewState.destinationWallet);
    populateAssetDropdown();
    htmlHelpers.setPlaceholder(transferSelectors.DisplaySourceWallet, htmlHelpers.text(viewState.sourceWallet || '(unknown)'));
    htmlHelpers.setPlaceholder(transferSelectors.ResultText, htmlHelpers.text(viewState.result));
    htmlHelpers.showHide(transferSelectors.ErrorBalanceRetrievalFailure, viewState.sourceWalletBalancesError);
    htmlHelpers.showHide(transferSelectors.ErrorSourceWalletEmpty, viewState.sourceWallet && !viewState.sourceWalletBalancesError && !viewState.sourceWalletBalances.length);
    htmlHelpers.showHide(transferSelectors.SourceBalancesTable, viewState.sourceWalletBalances.length);
    htmlHelpers.showHide(transferSelectors.ErrorMessage, viewState.showError);
    htmlHelpers.showHide(transferSelectors.ViewResults, viewState.showSuccess);
    htmlHelpers.showHide(transferSelectors.ViewDataEntry, !viewState.showSuccess);
    amountInput.value = viewState.amount || '';
    htmlHelpers.clearChildren(balancesTableBody);
    for (let i = 0; i < viewState.sourceWalletBalances.length; i++) {
        const assetDetails = viewState.sourceWalletBalances[i];
        const row = htmlHelpers.newTableRow(
            htmlHelpers.text(assetDetails.asset + ':'),
            htmlHelpers.text(htmlHelpers.number(assetDetails.value)));
        balancesTableBody.appendChild(row);
    }
    transferButton.disabled = !viewState.isValid;
}

function handleMessage(message: any) {
    if (message.viewState) {
        console.log('<-', message.viewState);
        viewState = message.viewState;
        render();
    }
}

function initializePanel() {
    const vscode = acquireVsCodeApi();
    vsCodePostMessage = vscode.postMessage;
    const refreshLink = document.querySelector(transferSelectors.RefreshBalancesLink) as HTMLAnchorElement;
    const sourceWalletDropdown = document.querySelector(transferSelectors.SourceWalletDropdown) as HTMLSelectElement;
    const destinationWalletDropdown = document.querySelector(transferSelectors.DestinationWalletDropdown) as HTMLSelectElement;
    const assetDropdown = document.querySelector(transferSelectors.AssetDropdown) as HTMLSelectElement;
    const amountInput = document.querySelector(transferSelectors.AmountInput) as HTMLInputElement;
    refreshLink.addEventListener('click', _ => {
        viewState.nonce++;
        postViewState();
    });
    sourceWalletDropdown.addEventListener('change', _ => {
        viewState.sourceWallet = sourceWalletDropdown.options[sourceWalletDropdown.selectedIndex].value;
        postViewState();
    });
    destinationWalletDropdown.addEventListener('change', _ => {
        viewState.destinationWallet = destinationWalletDropdown.options[destinationWalletDropdown.selectedIndex].value;
        postViewState();
    });
    assetDropdown.addEventListener('change', _ => {
        viewState.assetName = assetDropdown.options[assetDropdown.selectedIndex].value;
        postViewState();
    });
    amountInput.addEventListener('change', _ => {
        viewState.amount = amountInput.value;
        postViewState();
    });
    amountInput.addEventListener('keypress', _ => {
        viewState.amount = amountInput.value;
        postViewState(true);
    });
    window.addEventListener('message', msg => handleMessage(msg.data));
    vscode.postMessage({ e: transferEvents.Init });
}

window.onload = initializePanel;