import { createCheckpointEvents } from "./createCheckpointEvents";
import { createCheckpointRenderers } from "./createCheckpointRenderers";
import { createCheckpointSelectors } from "./createCheckpointSelectors";
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
    vsCodePostMessage({ e: createCheckpointEvents.Update, c: viewState });
    console.log('->', viewState);
}

function handleMessage(message: any) {
    if (message.viewState) {
        console.log('<-', message.viewState);
        viewState = message.viewState;
        createCheckpointRenderers.render(viewState);
    }
}

function initializePanel() {
    const vscode = acquireVsCodeApi();
    vsCodePostMessage = vscode.postMessage;
    const browseButton = document.querySelector(createCheckpointSelectors.BrowseButton) as HTMLButtonElement;
    const customPathPicker = document.querySelector(createCheckpointSelectors.CustomPathPicker) as HTMLInputElement;
    const checkpointNameInput = document.querySelector(createCheckpointSelectors.CheckpointNameInput) as HTMLInputElement;
    const allowOverwrite = document.querySelector(createCheckpointSelectors.AllowOverwrite) as HTMLInputElement;
    const createButton = document.querySelector(createCheckpointSelectors.CreateButton) as HTMLButtonElement;
    const closeButton = document.querySelector(createCheckpointSelectors.CloseButton) as HTMLButtonElement;
    browseButton.addEventListener('click', _ => customPathPicker.click());
    customPathPicker.addEventListener('change', _ => {
        const newPath = customPathPicker.files && customPathPicker.files.length ? (customPathPicker.files[0] as any).path : viewState.path;
        htmlHelpers.setPlaceholder(createCheckpointSelectors.CurrentPath, htmlHelpers.text(newPath));
        viewState.path = newPath;
        postViewState();
    });
    checkpointNameInput.addEventListener('change', _ => {
        viewState.checkpointName = checkpointNameInput.value;
        postViewState();
    });
    checkpointNameInput.addEventListener('keyup', _ => {
        viewState.checkpointName = checkpointNameInput.value;
        postViewState();
    });
    allowOverwrite.addEventListener('change', _ => {
        viewState.allowOverwrite = allowOverwrite.checked;
        postViewState();
    });
    createButton.addEventListener('click', _ => vsCodePostMessage({ e: createCheckpointEvents.Create }));
    closeButton.addEventListener('click', _ => vsCodePostMessage({ e: createCheckpointEvents.Close }));
    window.addEventListener('message', msg => handleMessage(msg.data));
    vscode.postMessage({ e: createCheckpointEvents.Init });
}

window.onload = initializePanel;