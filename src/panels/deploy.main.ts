import { htmlHelpers } from "./htmlHelpers";
import { deployEvents } from "./deployEvents";
import { deploySelectors } from "./deploySelectors";

/*
 * This code runs in the context of the WebView panel. It exchanges JSON messages with the main 
 * extension code. The browser instance running this code is disposed whenever the panel loses 
 * focus, and reloaded when it later gains focus (so navigation state should not be stored here).
 */

declare var acquireVsCodeApi: any;

let viewState: any = {};

let vsCodePostMessage: Function;

let deployButton: HTMLButtonElement;
let closeButton: HTMLButtonElement;
let walletDropdown: HTMLSelectElement;
let contractDropdown: HTMLSelectElement;
let refreshLink: HTMLAnchorElement;

function enterLoadingState() {
    htmlHelpers.showHide(deploySelectors.LoadingIndicator, true, 'inline');
    deployButton.disabled = true;
    walletDropdown.disabled = true;
}

function exitLoadingState() {
    htmlHelpers.showHide(deploySelectors.LoadingIndicator, false);
}

function populateDropdown(dropdown: HTMLSelectElement, items: string[], selected?: string) {
    htmlHelpers.clearChildren(dropdown);
    let index = 0;
    dropdown.appendChild(document.createElement('option'));
    for (let i = 0; i < items.length; i++) {
        index++;
        const option = document.createElement('option') as HTMLOptionElement;
        option.value = items[i];
        option.appendChild(htmlHelpers.text(items[i]));
        dropdown.appendChild(option);
        if (items[i] === selected) {
            dropdown.selectedIndex = index;
        }
    }
}

function render() {
    populateDropdown(contractDropdown, viewState.contracts, viewState.contractPath);
    populateDropdown(walletDropdown, viewState.wallets, viewState.wallet);
    htmlHelpers.setPlaceholder(deploySelectors.DisplayContract, htmlHelpers.text(viewState.contractPath));
    htmlHelpers.setPlaceholder(deploySelectors.ErrorMessage, htmlHelpers.text(viewState.result));
    htmlHelpers.showHide(deploySelectors.ErrorNoContracts, viewState.contracts.length === 0);
    htmlHelpers.showHide(deploySelectors.ErrorMessage, viewState.showError);
    htmlHelpers.showHide(deploySelectors.ViewResults, viewState.showSuccess);
    htmlHelpers.showHide(deploySelectors.ViewDataEntry, !viewState.showSuccess);
    htmlHelpers.showHide(deploySelectors.ErrorMessage, !!viewState.showError);
    deployButton.disabled = !viewState.isValid;
    walletDropdown.disabled = false;
    contractDropdown.disabled = false;
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
    vsCodePostMessage = acquireVsCodeApi().postMessage;

    deployButton = document.querySelector(deploySelectors.DeployButton) as HTMLButtonElement;
    closeButton = document.querySelector(deploySelectors.CloseButton) as HTMLButtonElement;
    walletDropdown = document.querySelector(deploySelectors.WalletDropdown) as HTMLSelectElement;
    contractDropdown = document.querySelector(deploySelectors.ContractDropdown) as HTMLSelectElement;
    refreshLink = document.querySelector(deploySelectors.RefreshLink) as HTMLAnchorElement;
    
    deployButton.addEventListener('click', _ => {
        enterLoadingState();
        vsCodePostMessage({ e: deployEvents.Deploy });
    });

    closeButton.addEventListener('click', _ => {
        enterLoadingState();
        vsCodePostMessage({ e: deployEvents.Close });
    });

    refreshLink.addEventListener('click', _ => {
        enterLoadingState();
        vsCodePostMessage({ e: deployEvents.Refresh });
    });

    walletDropdown.addEventListener('change', _ => {
        viewState.wallet = walletDropdown.options[walletDropdown.selectedIndex].value;
        vsCodePostMessage({ e: deployEvents.Update, c: viewState });
        console.log('->', viewState);
    });

    contractDropdown.addEventListener('change', _ => {
        viewState.contractPath = contractDropdown.options[contractDropdown.selectedIndex].value;
        vsCodePostMessage({ e: deployEvents.Update, c: viewState });
        console.log('->', viewState);
    });

    window.addEventListener('message', msg => handleMessage(msg.data));

    enterLoadingState();

    vsCodePostMessage({ e: deployEvents.Init });
}

window.onload = initializePanel;