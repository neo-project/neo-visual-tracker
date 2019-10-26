import { invokeEvents } from "./invokeEvents";
import { invokeRenderers } from "./invokeRenderers";
import { invokeSelectors } from "./invokeSelectors";

/*
 * This code runs in the context of the WebView panel. It receives messages from the main extension 
 * containing blockchain information that should be rendered.  The browser instance running this code 
 * is disposed whenever the panel loses focus, and reloaded when it later gains focus (so navigation 
 * state should not be stored here).
 */

declare var acquireVsCodeApi: any;

let viewState: any = {};

function updateViewState(updater: any) {
    updater(viewState);
    postViewState();   
}

function handleMessage(message: any) {
    if (message.viewState) {
        console.log('<-', message.viewState);
        viewState = message.viewState;
        invokeRenderers.render(viewState, updateViewState);
    }
}

let vsCodePostMessage : Function;

function initializePanel() {
    const vscode = acquireVsCodeApi();
    vsCodePostMessage = vscode.postMessage;
    window.addEventListener('message', msg => handleMessage(msg.data));
    const walletDropdown: any = document.querySelector(invokeSelectors.WalletDropdown);
    if (walletDropdown) {
        walletDropdown.addEventListener(
            'change', 
            () => updateViewState((viewState: any) => viewState.selectedWallet = walletDropdown.children[walletDropdown.selectedIndex].value));
    }

    vscode.postMessage({ e: invokeEvents.Init });
}

function postViewState() {
    vsCodePostMessage({ e: invokeEvents.Update, c: viewState });
    console.log('->', viewState);
}

window.onload = initializePanel;