import { htmlHelpers } from "./htmlHelpers";
import { storageEvents } from "./storageEvents";
import { storageSelectors } from "./storageSelectors";

/*
 * This code runs in the context of the WebView panel. It exchanges JSON messages with the main 
 * extension code. The browser instance running this code is disposed whenever the panel loses 
 * focus, and reloaded when it later gains focus (so navigation state should not be stored here).
 */

declare var acquireVsCodeApi: any;

let viewState: any = {};

let vsCodePostMessage: Function;

const contractDropdown = document.querySelector(storageSelectors.ContractDropdown) as HTMLSelectElement;
const storageTableBody = document.querySelector(storageSelectors.StorageTableBody) as HTMLElement;

function hexToAscii(hex?: string) {
    var result = '';
    if (hex) {
        for (var i = 0; i < hex.length; i += 2) {
            result += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
    }
    return result;
}

function storageRow(key?: string, value?: string, parsed?: any, constant?: boolean) {
    const keyAsString = hexToAscii(key);
    const keyAsBytes = key || ' ';
    const valueAsBytes = value || ' ';
    const valueAsString = hexToAscii(value);
    const valueAsNumber = parsed?.asInteger || ' ';
    const valueAsAddress = parsed?.asAddress || ' ';
    return htmlHelpers.newTableRow(
        htmlHelpers.text(keyAsString),
        htmlHelpers.text(keyAsBytes),
        htmlHelpers.text(valueAsBytes),
        htmlHelpers.text(valueAsString),
        htmlHelpers.text(valueAsNumber),
        htmlHelpers.text(valueAsAddress),
        htmlHelpers.text(constant === undefined ? '' : (constant ? 'true' : 'false')));
}

function render() {
    htmlHelpers.setPlaceholder(storageSelectors.RpcDescription, htmlHelpers.text(viewState.rpcDescription));
    htmlHelpers.setPlaceholder(storageSelectors.RpcUrl, htmlHelpers.text(viewState.rpcUrl));
    htmlHelpers.showHide(storageSelectors.Error, viewState.selectedContractHash && !viewState.selectedContractStorage);
    htmlHelpers.showHide(storageSelectors.NoStorage, viewState.selectedContractHash && viewState.selectedContractStorage && !viewState.selectedContractStorage.length);
    htmlHelpers.showHide(storageSelectors.StorageTable, viewState.selectedContractStorage, 'table');
    htmlHelpers.clearChildren(contractDropdown);
    for (let i = 0; i < viewState.contracts.length; i++) {
        const contract = viewState.contracts[i];
        const contractHash = contract.hash;
        const contractName = contract.name;
        const option = document.createElement('option') as HTMLOptionElement;
        option.value = contractHash;
        option.appendChild(htmlHelpers.text(contractName + ' - ' + contractHash));
        contractDropdown.appendChild(option);
        if (viewState.selectedContractHash === contractHash) {
            option.selected = true;
        }
    }
    htmlHelpers.clearChildren(storageTableBody);
    if (viewState.selectedContractStorage) {
        for (let i = 0; i < viewState.selectedContractStorage.length; i++) {
            const row = viewState.selectedContractStorage[i];
            storageTableBody.appendChild(storageRow(row.key, row.value, row.parsed, row.constant));
        }
    }
    contractDropdown.focus();
}

function handleMessage(message: any) {
    if (message.viewState) {
        viewState = message.viewState;
        console.log('<-', viewState);
        render();
    }
}

function initializePanel() {
    const vscode = acquireVsCodeApi();
    vsCodePostMessage = vscode.postMessage;
    contractDropdown.addEventListener('change', _ => {
        viewState.selectedContractHash = contractDropdown.options[contractDropdown.selectedIndex].value;
        vsCodePostMessage({ e: storageEvents.Update, c: viewState });
    });
    window.addEventListener('message', msg => handleMessage(msg.data));
    vscode.postMessage({ e: storageEvents.Init });
}

window.onload = initializePanel;