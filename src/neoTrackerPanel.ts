import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { INeoRpcConnection } from './neoRpcConnection';
import { PanelMessage } from './panelMessage';

const JavascriptHrefPlaceholder : string = '[JAVASCRIPT_HREF]';

export class NeoTrackerPanel {

    public readonly panel : vscode.WebviewPanel;
    public readonly ready : Promise<void>;

    private onIncomingMessage? : () => void;

    private rpcConnection : INeoRpcConnection;

    constructor(
        extensionPath : string,
        rpcConnection : INeoRpcConnection,
        disposables : vscode.Disposable[]) {

        this.rpcConnection = rpcConnection;

        this.ready = new Promise((resolve, reject) => {
            this.onIncomingMessage = resolve;
        });

        this.panel = vscode.window.createWebviewPanel(
            'newExpressTracker',
            'NEO Express Tracker',
            vscode.ViewColumn.Active,
            { enableScripts: true });

        this.panel.onDidDispose(this.onClose, this, disposables);
        this.panel.webview.onDidReceiveMessage(this.onMessage, this, disposables);

        const htmlFileContents = fs.readFileSync(
            path.join(extensionPath, 'src', 'panel', 'panel.html'), { encoding: 'utf8' });
        const javascriptHref : string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panel', 'panel.js'))) + '';
        this.panel.webview.html = htmlFileContents.replace(JavascriptHrefPlaceholder, javascriptHref);
    }

    private onClose() {
    }

    private async onMessage(message : PanelMessage) {
        if (this.onIncomingMessage) {
            this.onIncomingMessage();
        }

        if (message.t === 'init') {
            this.panel.webview.postMessage(new PanelMessage('pong', await this.rpcConnection.getBlockchainInfo()));
        }
    }

    dispose() {
        this.panel.dispose();
    }

}