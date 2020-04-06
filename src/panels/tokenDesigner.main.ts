import { htmlHelpers } from "./htmlHelpers";
import { tokenDesignerEvents } from "./tokenDesignerEvents";

declare var acquireVsCodeApi: any;

let vsCodePostMessage : Function;

function handleMessage(message: any) {
    if (message.viewState) {
        console.log(message.viewState);
        // TODO ...
    }
}

function initializePanel() {
    vsCodePostMessage = acquireVsCodeApi().postMessage;
    window.addEventListener('message', msg => handleMessage(msg.data));
    vsCodePostMessage({ e: tokenDesignerEvents.Init });
}

window.onload = initializePanel;