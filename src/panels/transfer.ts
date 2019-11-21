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

function postViewState() {
    vsCodePostMessage({ e: transferEvents.Update, c: viewState });
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

function render() {
    const transferButton = document.querySelector(transferSelectors.TransferButton) as HTMLButtonElement;
    populateWalletDropdown(transferSelectors.SourceWalletDropdown, viewState.sourceWallet);
    populateWalletDropdown(transferSelectors.DestinationWalletDropdown, viewState.destinationWallet);
    htmlHelpers.setPlaceholder(transferSelectors.ResultText, htmlHelpers.text(viewState.result));
    htmlHelpers.showHide(transferSelectors.ErrorMessage, viewState.showError);
    htmlHelpers.showHide(transferSelectors.ViewResults, viewState.showSuccess);
    htmlHelpers.showHide(transferSelectors.ViewDataEntry, !viewState.showSuccess);
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
    const sourceWalletDropdown = document.querySelector(transferSelectors.SourceWalletDropdown) as HTMLSelectElement;
    const destinationWalletDropdown = document.querySelector(transferSelectors.DestinationWalletDropdown) as HTMLSelectElement;
    sourceWalletDropdown.addEventListener('change', _ => {
        viewState.sourceWallet = sourceWalletDropdown.options[sourceWalletDropdown.selectedIndex].value;
        postViewState();
    });
    destinationWalletDropdown.addEventListener('change', _ => {
        viewState.destinationWallet = destinationWalletDropdown.options[destinationWalletDropdown.selectedIndex].value;
        postViewState();
    });
    window.addEventListener('message', msg => handleMessage(msg.data));
    vscode.postMessage({ e: transferEvents.Init });
}

window.onload = initializePanel;