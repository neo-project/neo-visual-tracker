import { htmlHelpers } from "./htmlHelpers";
import { claimEvents } from "./claimEvents";
import { claimSelectors } from "./claimSelectors";

/*
 * This code runs in the context of the WebView panel. It exchanges JSON messages with the main 
 * extension code. The browser instance running this code is disposed whenever the panel loses 
 * focus, and reloaded when it later gains focus (so navigation state should not be stored here).
 */

declare var acquireVsCodeApi: any;

let viewState: any = {};

let vsCodePostMessage: Function;

const CreateNewWallet = 'CREATE_NEW_WALLET';

function enterLoadingState() {
    htmlHelpers.showHide(claimSelectors.LoadingIndicator, true, 'inline');
    const claimButton = document.querySelector(claimSelectors.ClaimButton) as HTMLButtonElement;
    const walletDropdown = document.querySelector(claimSelectors.WalletDropdown) as HTMLSelectElement;
    claimButton.disabled = true;
    walletDropdown.disabled = true;
}

function exitLoadingState() {
    htmlHelpers.showHide(claimSelectors.LoadingIndicator, false);
}

function populateWalletDropdown() {
    const dropdown = document.querySelector(claimSelectors.WalletDropdown) as HTMLSelectElement;
    htmlHelpers.clearChildren(dropdown);
    let index = 0;
    dropdown.appendChild(document.createElement('option'));
    for (let i = 0; i < viewState.wallets.length; i++) {
        index++;
        const option = document.createElement('option') as HTMLOptionElement;
        option.value = viewState.wallets[i].address;
        option.appendChild(htmlHelpers.text(viewState.wallets[i].description));
        dropdown.appendChild(option);
        if (viewState.wallets[i].address === viewState.walletAddress) {
            dropdown.selectedIndex = index;
        }
    }
    dropdown.appendChild(document.createElement('option'));
    const newWalletOption = document.createElement('option') as HTMLOptionElement;
    newWalletOption.value = CreateNewWallet;
    newWalletOption.appendChild(htmlHelpers.text('Create a new NEP-6 wallet file...'));
    dropdown.appendChild(newWalletOption);
}

function render() {
    const claimButton = document.querySelector(claimSelectors.ClaimButton) as HTMLButtonElement;
    const walletDropdown = document.querySelector(claimSelectors.WalletDropdown) as HTMLSelectElement;
    populateWalletDropdown();
    htmlHelpers.setPlaceholder(claimSelectors.DisplayWallet, htmlHelpers.text(viewState.walletDescription || '(unknown)'));
    htmlHelpers.setPlaceholder(claimSelectors.DisplayClaimable, htmlHelpers.text(htmlHelpers.number(viewState.claimable || 0)));
    htmlHelpers.setPlaceholder(claimSelectors.ResultText, htmlHelpers.text(viewState.result));
    htmlHelpers.setPlaceholder(claimSelectors.ErrorMessage, htmlHelpers.text(viewState.result));
    htmlHelpers.showHide(claimSelectors.ErrorClaimableRetrievalFailure, viewState.getClaimableError);
    htmlHelpers.showHide(claimSelectors.ErrorWalletHasNoClaimableGas, viewState.walletAddress && !viewState.showError && !(viewState.getClaimableError || (viewState.claimable > 0)));
    htmlHelpers.showHide(claimSelectors.ClaimableInfo, viewState.claimable > 0);
    htmlHelpers.showHide(claimSelectors.ErrorMessage, viewState.showError);
    htmlHelpers.showHide(claimSelectors.ViewResults, viewState.showSuccess);
    htmlHelpers.showHide(claimSelectors.ViewDataEntry, !viewState.showSuccess);
    htmlHelpers.showHide(claimSelectors.ErrorMessage, !!viewState.showError);
    claimButton.disabled = !viewState.isValid;
    walletDropdown.disabled = false;
}

function handleMessage(message: any) {
    exitLoadingState();
    if (message.viewState) {
        console.log('<-', message.viewState);
        viewState = message.viewState;
        render();
    }
}

function initializePanel() {
    const vscode = acquireVsCodeApi();
    vsCodePostMessage = vscode.postMessage;
    const claimButton = document.querySelector(claimSelectors.ClaimButton) as HTMLButtonElement;
    const closeButton = document.querySelector(claimSelectors.CloseButton) as HTMLButtonElement;
    const refreshLink = document.querySelector(claimSelectors.RefreshClaimableLink) as HTMLAnchorElement;
    const walletDropdown = document.querySelector(claimSelectors.WalletDropdown) as HTMLSelectElement;
    claimButton.addEventListener('click', _ => {
        enterLoadingState();
        vscode.postMessage({ e: claimEvents.Claim });
    });
    closeButton.addEventListener('click', _ => {
        enterLoadingState();
        vscode.postMessage({ e: claimEvents.Close });
    });
    refreshLink.addEventListener('click', _ => {
        enterLoadingState();
        vscode.postMessage({ e: claimEvents.Refresh });
    });
    walletDropdown.addEventListener('change', _ => {
        if (walletDropdown.options[walletDropdown.selectedIndex].value === CreateNewWallet) {
            vsCodePostMessage({ e: claimEvents.NewWallet, c: viewState });
            walletDropdown.selectedIndex = 0;
        } else {
            viewState.walletAddress = walletDropdown.options[walletDropdown.selectedIndex].value;
            viewState.walletDescription = walletDropdown.options[walletDropdown.selectedIndex].textContent;
            enterLoadingState();
            vsCodePostMessage({ e: claimEvents.Update, c: viewState });
        }
        console.log('->', viewState);
    });
    window.addEventListener('message', msg => handleMessage(msg.data));
    enterLoadingState();
    vscode.postMessage({ e: claimEvents.Init });
}

window.onload = initializePanel;