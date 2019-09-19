/*
 * This code runs in the context of the WebView panel. It receives messages from the main extension 
 * containing blockchain information that should be rendered.  The browser instance running this code 
 * is disposed whenever the panel loses focus, and reloaded when it later gains focus (so navigation 
 * state should not be stored here).
 */

declare var acquireVsCodeApi: any;

function handleMessage(message: object) {
    console.log(message);
}

function initializePanel() {
    const vscode = acquireVsCodeApi();

    window.addEventListener('message', msg => handleMessage(msg.data));

    vscode.postMessage({t:'init'});
}

window.onload = initializePanel;