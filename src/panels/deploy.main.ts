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

const CreateNewWallet = 'CREATE_NEW_WALLET';

let deployButton: HTMLButtonElement;
let closeButton: HTMLButtonElement;
let walletDropdown: HTMLSelectElement;
let contractDropdown: HTMLSelectElement;
let refreshLink: HTMLAnchorElement;
let mainForm: HTMLFormElement;
let resultForm: HTMLFormElement;

function enterLoadingState() {
    htmlHelpers.showHide(deploySelectors.LoadingIndicator, true, 'inline');
    deployButton.disabled = true;
    walletDropdown.disabled = true;
    mainForm.disabled = true;
}

function exitLoadingState() {
    htmlHelpers.showHide(deploySelectors.LoadingIndicator, false);
}

function populateDropdown(
    dropdown: HTMLSelectElement, 
    items: string[], 
    values: string[], 
    selectedValue?: string,
    addNewCallToAction?: string) {

    htmlHelpers.clearChildren(dropdown);
    let index = 0;
    dropdown.appendChild(document.createElement('option'));
    for (let i = 0; i < Math.min(items.length, values.length); i++) {
        index++;
        const option = document.createElement('option') as HTMLOptionElement;
        option.value = values[i];
        option.appendChild(htmlHelpers.text(items[i]));
        dropdown.appendChild(option);
        if (values[i] === selectedValue) {
            dropdown.selectedIndex = index;
        }
    }
    if (addNewCallToAction) {
        dropdown.appendChild(document.createElement('option'));
        const addNewCallToActionOption = document.createElement('option') as HTMLOptionElement;
        addNewCallToActionOption.value = CreateNewWallet;
        addNewCallToActionOption.appendChild(htmlHelpers.text(addNewCallToAction));
        dropdown.appendChild(addNewCallToActionOption);
    }
}

let firstRender = true;
function render() {
    populateDropdown(
        contractDropdown, 
        viewState.contracts.map((_: any) => _.name + ' - ' + _.path), 
        viewState.contracts.map((_: any) => _.path), 
        viewState.contractPath);
    populateDropdown(
        walletDropdown, 
        viewState.wallets.map((_: any) => _.description), 
        viewState.wallets.map((_: any) => _.address), 
        viewState.walletAddress,
        'Create a new NEP-6 wallet file...');
    htmlHelpers.showHide(deploySelectors.ContractDetail, !!viewState.contractPath);
    htmlHelpers.setPlaceholder(deploySelectors.DisplayContractHash, htmlHelpers.text(viewState.contractHash));
    htmlHelpers.setPlaceholder(deploySelectors.DisplayContractName, htmlHelpers.text(viewState.contractName));
    htmlHelpers.setPlaceholder(deploySelectors.DisplayContractPath, htmlHelpers.text(viewState.contractPath));
    htmlHelpers.setPlaceholder(deploySelectors.ErrorMessage, htmlHelpers.text(viewState.result));
    htmlHelpers.showHide(deploySelectors.ErrorNoContracts, viewState.contracts.length === 0);
    htmlHelpers.showHide(deploySelectors.ErrorMessage, viewState.showError);
    htmlHelpers.showHide(deploySelectors.ViewResults, viewState.showSuccess);
    htmlHelpers.showHide(deploySelectors.ViewDataEntry, !viewState.showSuccess);
    htmlHelpers.showHide(deploySelectors.ErrorMessage, !!viewState.showError);
    deployButton.disabled = !viewState.isValid;
    walletDropdown.disabled = false;
    contractDropdown.disabled = false;
    mainForm.disabled = false;
    if (viewState.showSuccess) {
        const resultPlaceholder = document.querySelector(deploySelectors.Result) as HTMLElement;
        htmlHelpers.clearChildren(resultPlaceholder);
        const searchLink = htmlHelpers.newEventLink(
            viewState.result,
            deployEvents.Search,
            viewState.result,
            vsCodePostMessage);
        resultPlaceholder.appendChild(searchLink);
        closeButton.focus();
    } else if (firstRender) {
        contractDropdown.focus();
        firstRender = false;
    }
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
    mainForm = document.querySelector(deploySelectors.MainForm) as HTMLFormElement;
    resultForm = document.querySelector(deploySelectors.ResultForm) as HTMLFormElement;
    
    mainForm.addEventListener('submit', _ => {
        enterLoadingState();
        vsCodePostMessage({ e: deployEvents.Deploy });
    });

    resultForm.addEventListener('submit', _ => {
        enterLoadingState();
        vsCodePostMessage({ e: deployEvents.Close });
    });

    refreshLink.addEventListener('click', _ => {
        enterLoadingState();
        vsCodePostMessage({ e: deployEvents.Refresh });
    });

    walletDropdown.addEventListener('change', _ => {
        if (walletDropdown.options[walletDropdown.selectedIndex].value === CreateNewWallet) {
            vsCodePostMessage({ e: deployEvents.NewWallet, c: viewState });
            walletDropdown.selectedIndex = 0;
        } else {
            viewState.walletAddress = walletDropdown.options[walletDropdown.selectedIndex].value;
            vsCodePostMessage({ e: deployEvents.Update, c: viewState });
        }
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