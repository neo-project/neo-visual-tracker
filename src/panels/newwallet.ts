import { htmlHelpers } from "./htmlHelpers";
import { newwalletEvents } from "./newwalletEvents";
import { newwalletSelectors } from "./newwalletSelectors";

/*
 * This code runs in the context of the WebView panel. It exchanges JSON messages with the main 
 * extension code. The browser instance running this code is disposed whenever the panel loses 
 * focus, and reloaded when it later gains focus (so navigation state should not be stored here).
 */

declare var acquireVsCodeApi: any;

let viewState: any = {};

let vsCodePostMessage: Function;

function postViewState() {
    vsCodePostMessage({ e: newwalletEvents.Update, c: viewState });
    console.log('->', viewState);
}

function render() {
    htmlHelpers.setPlaceholder(newwalletSelectors.DisplayWalletName, htmlHelpers.text(viewState.walletName));
    htmlHelpers.setPlaceholder(newwalletSelectors.DisplayConfigFile, htmlHelpers.text(viewState.neoExpressJsonFullPath));
    (document.querySelector(newwalletSelectors.WalletNameInput) as HTMLInputElement).value = viewState.walletName;
    htmlHelpers.showHide(newwalletSelectors.WalletExistsWarning, viewState.walletExists);
    const allowOverwrite = document.querySelector(newwalletSelectors.AllowOverwrite) as HTMLInputElement;
    const createButton = document.querySelector(newwalletSelectors.CreateButton) as HTMLButtonElement;
    allowOverwrite.checked = viewState.allowOverwrite;
    createButton.disabled = !allowOverwrite.checked && viewState.walletExists;
    htmlHelpers.setPlaceholder(newwalletSelectors.ResultText, htmlHelpers.text(viewState.result));
    htmlHelpers.showHide(newwalletSelectors.ErrorMessage, viewState.showError);
    htmlHelpers.showHide(newwalletSelectors.ViewResults, viewState.showSuccess);
    htmlHelpers.showHide(newwalletSelectors.ViewDataEntry, !viewState.showSuccess);
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
    const walletNameInput = document.querySelector(newwalletSelectors.WalletNameInput) as HTMLInputElement;
    const allowOverwrite = document.querySelector(newwalletSelectors.AllowOverwrite) as HTMLInputElement;
    const createButton = document.querySelector(newwalletSelectors.CreateButton) as HTMLButtonElement;
    const closeButton = document.querySelector(newwalletSelectors.CloseButton) as HTMLButtonElement;
    walletNameInput.addEventListener('change', _ => {
        viewState.walletName = walletNameInput.value;
        postViewState();
    });
    walletNameInput.addEventListener('keyup', _ => {
        viewState.walletName = walletNameInput.value;
        postViewState();
    });
    allowOverwrite.addEventListener('change', _ => {
        viewState.allowOverwrite = allowOverwrite.checked;
        postViewState();
    });
    createButton.addEventListener('click', _ => vsCodePostMessage({ e: newwalletEvents.Create }));
    closeButton.addEventListener('click', _ => vsCodePostMessage({ e: newwalletEvents.Close }));
    window.addEventListener('message', msg => handleMessage(msg.data));
    vscode.postMessage({ e: newwalletEvents.Init });
}

window.onload = initializePanel;