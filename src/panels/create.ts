import { createEvents } from "./createEvents";
import { createRenderers } from "./createRenderers";
import { createSelectors } from "./createSelectors";
import { htmlHelpers } from "./htmlHelpers";

/*
 * This code runs in the context of the WebView panel. It exchanges JSON messages with the main 
 * extension code. The browser instance running this code is disposed whenever the panel loses 
 * focus, and reloaded when it later gains focus (so navigation state should not be stored here).
 */

declare var acquireVsCodeApi: any;

let viewState: any = {};

let vsCodePostMessage: Function;

function updateViewState(updater: any) {
    if (updater) {
        updater(viewState);
    }
    postViewState();   
}

function handleMessage(message: any) {
    if (message.viewState) {
        console.log('<-', message.viewState);
        viewState = message.viewState;
        createRenderers.render(viewState, updateViewState, vsCodePostMessage);
    }
}

function initializePanel() {
    const vscode = acquireVsCodeApi();
    vsCodePostMessage = vscode.postMessage;
    window.addEventListener('message', msg => handleMessage(msg.data));
    vscode.postMessage({ e: createEvents.Init });
}

function postViewState() {
    vsCodePostMessage({ e: createEvents.Update, c: viewState });
    console.log('->', viewState);
}

window.onload = initializePanel;