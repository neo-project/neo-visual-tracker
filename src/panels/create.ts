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

function postViewState() {
    vsCodePostMessage({ e: createEvents.Update, c: viewState });
    console.log('->', viewState);
}

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

    const browseButton = document.querySelector(createSelectors.BrowseButton) as HTMLButtonElement;
    const customPathPicker = document.querySelector(createSelectors.CustomPathPicker) as HTMLInputElement;
    const filenameInput = document.querySelector(createSelectors.FilenameInput) as HTMLInputElement;
    browseButton.addEventListener('click', _ => customPathPicker.click());
    customPathPicker.addEventListener('change', _ => {
        const newPath = customPathPicker.files && customPathPicker.files.length ? (customPathPicker.files[0] as any).path : viewState.path;
        htmlHelpers.setPlaceholder(createSelectors.CurrentPath, htmlHelpers.text(newPath));
        viewState.path = newPath;
        postViewState();
    });
    filenameInput.addEventListener('change', _ => {
        viewState.filename = filenameInput.value;
        postViewState();
    });
    filenameInput.addEventListener('keyup', _ => {
        viewState.filename = filenameInput.value;
        postViewState();
    });

    window.addEventListener('message', msg => handleMessage(msg.data));
    vscode.postMessage({ e: createEvents.Init });
}

window.onload = initializePanel;