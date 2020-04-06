import { htmlHelpers } from "./htmlHelpers";
import { tokenDesignerEvents } from "./tokenDesignerEvents";
import { TokenDesignerTaxonomy } from "./tokenDesignerTaxonomy";
import { TokenDesignerViewState } from "./tokenDesignerViewState";

declare var acquireVsCodeApi: any;

let vsCodePostMessage: Function;

let taxonomy: TokenDesignerTaxonomy | null = null;
let viewState: TokenDesignerViewState | null = null;

function handleMessage(message: any) {
    if (message.taxonomy) {
        console.log('Received taxonomy update', message.taxonomy);
        taxonomy = message.taxonomy;
    }
    if (message.viewState) {
        console.log('Received viewState update', message.viewState);
        viewState = message.viewState;
    }
    render();
}

function initializePanel() {
    vsCodePostMessage = acquireVsCodeApi().postMessage;
    window.addEventListener('message', msg => handleMessage(msg.data));
    vsCodePostMessage({ e: tokenDesignerEvents.Init });
}

function render() {
    // document.body.innerHTML = JSON.stringify(taxonomy?.baseTokenTypes);
}

window.onload = initializePanel;