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

function handleMessage(message: any) {
    if (message.viewState) {
        console.log(message.viewState);
        viewState = message.viewState;
        invokeRenderers.render(viewState);
    }
}

let vsCodePostMessage : Function;

function initializePanel() {
    const vscode = acquireVsCodeApi();
    vsCodePostMessage = vscode.postMessage;
    window.addEventListener('message', msg => handleMessage(msg.data));
    const walletDropdown: any = document.querySelector(invokeSelectors.WalletDropdown);
    if (walletDropdown) {
        walletDropdown.addEventListener('change', () => {
            viewState.selectedWallet = walletDropdown.children[walletDropdown.selectedIndex].value;
            postViewState();
        });
    }

    vscode.postMessage({ e: invokeEvents.Init });
}

function postViewState() {
    vsCodePostMessage({ e: invokeEvents.Update, c: viewState });
}

window.onload = initializePanel;