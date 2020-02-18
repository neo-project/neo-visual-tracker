import { htmlHelpers } from "./htmlHelpers";
import { startEvents } from "./startEvents";
import { startSelectors } from "./startSelectors";

/*
 * This code runs in the context of the WebView panel. It exchanges JSON messages with the main 
 * extension code. The browser instance running this code is disposed whenever the panel loses 
 * focus, and reloaded when it later gains focus (so navigation state should not be stored here).
 */

declare var acquireVsCodeApi: any;

let viewState: any = {};

let vsCodePostMessage: Function;

let refreshLink: HTMLAnchorElement;
let checkpointDropdown: HTMLSelectElement;
let secondsPerBlockInput: HTMLInputElement;
let startButton: HTMLButtonElement;

function enterLoadingState() {
    htmlHelpers.showHide(startSelectors.LoadingIndicator, true, 'inline');
    startButton.disabled = true;
    checkpointDropdown.disabled = true;
}

function exitLoadingState() {
    htmlHelpers.showHide(startSelectors.LoadingIndicator, false);
}

function populateCheckpointDropdown(checkpoints: any[], selectedFullPath?: string) {
    htmlHelpers.clearChildren(checkpointDropdown);
    const noneOption = document.createElement('option');
    noneOption.appendChild(htmlHelpers.text('(do not use a checkpoint)'));
    checkpointDropdown.appendChild(noneOption);
    for (let i = 0; i < checkpoints.length; i++) {
        const option = document.createElement('option') as HTMLOptionElement;
        option.value = checkpoints[i].fullpath;
        option.appendChild(htmlHelpers.text(checkpoints[i].label));
        option.selected = (option.value === selectedFullPath);
        checkpointDropdown.appendChild(option);
    }
}

function render() {
    populateCheckpointDropdown(viewState.checkpoints, viewState.selectedCheckpoint);
    secondsPerBlockInput.value = viewState.secondsPerBlock;
    htmlHelpers.setPlaceholder(startSelectors.ErrorMessage, htmlHelpers.text(viewState.error));
    htmlHelpers.showHide(startSelectors.CheckpointRestoreWarning, !!viewState.selectedCheckpoint);
    htmlHelpers.showHide(startSelectors.ErrorMessage, !!viewState.error);
    htmlHelpers.showHide(startSelectors.CheckpointSelection, !viewState.multiNode);
    checkpointDropdown.disabled = false;
    startButton.disabled = false;
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

    refreshLink = document.querySelector(startSelectors.RefreshLink) as HTMLAnchorElement;
    checkpointDropdown = document.querySelector(startSelectors.CheckpointDropdown) as HTMLSelectElement;
    secondsPerBlockInput = document.querySelector(startSelectors.SecondsPerBlockInput) as HTMLInputElement;
    startButton = document.querySelector(startSelectors.StartButton) as HTMLButtonElement;
    
    refreshLink.addEventListener('click', _ => {
        enterLoadingState();
        vsCodePostMessage({ e: startEvents.Refresh });
    });

    startButton.addEventListener('click', _ => {
        enterLoadingState();
        vsCodePostMessage({ e: startEvents.Start });
    });

    checkpointDropdown.addEventListener('change', _ => {
        viewState.selectedCheckpoint = checkpointDropdown.options[checkpointDropdown.selectedIndex].value;
        vsCodePostMessage({ e: startEvents.Update, c: viewState });
        console.log('->', viewState);
    });

    secondsPerBlockInput.addEventListener('change', _ => {
        viewState.secondsPerBlock = secondsPerBlockInput.valueAsNumber;
        vsCodePostMessage({ e: startEvents.Update, c: viewState });
        console.log('->', viewState);
    });

    window.addEventListener('message', msg => handleMessage(msg.data));

    enterLoadingState();

    vsCodePostMessage({ e: startEvents.Init });
}

window.onload = initializePanel;