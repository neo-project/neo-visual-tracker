import { createCheckpointEvents } from "./createCheckpointEvents";
import { createCheckpointRenderers } from "./createCheckpointRenderers";
import { createCheckpointSelectors } from "./createCheckpointSelectors";

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
    const checkpointNameInput = document.querySelector(createCheckpointSelectors.CheckpointNameInput) as HTMLInputElement;
    const allowOverwrite = document.querySelector(createCheckpointSelectors.AllowOverwrite) as HTMLInputElement;
    const mainForm = document.querySelector(createCheckpointSelectors.MainForm) as HTMLFormElement;
    const resultForm = document.querySelector(createCheckpointSelectors.ResultForm) as HTMLFormElement;
    browseButton.addEventListener('click', _ => vsCodePostMessage({ e: createCheckpointEvents.PickFolder }));
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
    mainForm.addEventListener('submit', _ => vsCodePostMessage({ e: createCheckpointEvents.Create }));
    resultForm.addEventListener('submit', _ => vsCodePostMessage({ e: createCheckpointEvents.Close }));
    window.addEventListener('message', msg => handleMessage(msg.data));
    vscode.postMessage({ e: createCheckpointEvents.Init });
}

window.onload = initializePanel;