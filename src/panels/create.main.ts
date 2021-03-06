import { createEvents } from "./createEvents";
import { createRenderers } from "./createRenderers";
import { createSelectors } from "./createSelectors";

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

function handleMessage(message: any) {
    if (message.viewState) {
        console.log('<-', message.viewState);
        viewState = message.viewState;
        createRenderers.render(viewState);
    }
}

function setNodeCount(nodeCount: number) {
    viewState.nodeCount = nodeCount;
    postViewState();
}

function initializePanel() {
    const vscode = acquireVsCodeApi();
    vsCodePostMessage = vscode.postMessage;
    const browseButton = document.querySelector(createSelectors.BrowseButton) as HTMLButtonElement;
    const filenameInput = document.querySelector(createSelectors.FilenameInput) as HTMLInputElement;
    const allowOverwrite = document.querySelector(createSelectors.AllowOverwrite) as HTMLInputElement;
    const nodeCountOption1 = document.querySelector(createSelectors.NodeCountOption1) as HTMLElement;
    const nodeCountOption4 = document.querySelector(createSelectors.NodeCountOption4) as HTMLElement;
    const nodeCountOption7 = document.querySelector(createSelectors.NodeCountOption7) as HTMLElement;
    const mainForm = document.querySelector(createSelectors.MainForm) as HTMLFormElement;
    const resultForm = document.querySelector(createSelectors.ResultForm) as HTMLFormElement;
    const preloadGasInput = document.querySelector(createSelectors.PreloadGasInput) as HTMLInputElement;
    browseButton.addEventListener('click', _ => vsCodePostMessage({ e: createEvents.PickFolder }));
    filenameInput.addEventListener('change', _ => {
        viewState.filename = filenameInput.value;
        postViewState();
    });
    filenameInput.addEventListener('keyup', _ => {
        viewState.filename = filenameInput.value;
        postViewState();
    });
    preloadGasInput.addEventListener('change', _ => {
        viewState.preloadGas = preloadGasInput.value;
        postViewState();
    });
    preloadGasInput.addEventListener('keyup', _ => {
        viewState.preloadGas = preloadGasInput.value;
        postViewState();
    });
    allowOverwrite.addEventListener('change', _ => {
        viewState.allowOverwrite = allowOverwrite.checked;
        postViewState();
    });
    nodeCountOption1.addEventListener('click', _ => setNodeCount(1));
    nodeCountOption4.addEventListener('click', _ => setNodeCount(4));
    nodeCountOption7.addEventListener('click', _ => setNodeCount(7));
    mainForm.addEventListener('submit', _ => vsCodePostMessage({ e: createEvents.Create }));
    resultForm.addEventListener('submit', _ => vsCodePostMessage({ e: createEvents.Close }));
    window.addEventListener('message', msg => handleMessage(msg.data));
    vscode.postMessage({ e: createEvents.Init });
}

window.onload = initializePanel;