import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { invokeEvents } from './panels/invokeEvents';

const JavascriptHrefPlaceholder : string = '[JAVASCRIPT_HREF]';
const CssHrefPlaceholder : string = '[CSS_HREF]';

class ViewState {
    jsonFile?: string;
}

export class InvocationPanel {
    public readonly panel: vscode.WebviewPanel;
    public readonly ready: Promise<void>;
    public readonly viewState: ViewState;

    private onIncomingMessage?: () => void;

    constructor(
        extensionPath: string,
        jsonFile: string,
        disposables: vscode.Disposable[]) {

        this.viewState = new ViewState();

        this.viewState.jsonFile = jsonFile;

        this.ready = new Promise((resolve, reject) => {
            this.onIncomingMessage = resolve;
        });

        this.panel = vscode.window.createWebviewPanel(
            'invocationPanel',
            'Invoke Smart Contract',
            vscode.ViewColumn.Active,
            { enableScripts: true });

        this.panel.iconPath = vscode.Uri.file(path.join(extensionPath, 'resources', 'neo.svg'));

        this.panel.onDidDispose(this.onClose, this, disposables);
        this.panel.webview.onDidReceiveMessage(this.onMessage, this, disposables);

        const htmlFileContents = fs.readFileSync(
            path.join(extensionPath, 'src', 'panels', 'invoke.html'), { encoding: 'utf8' });
        const javascriptHref : string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panels', 'invokeBundle.js'))) + '';
        const cssHref : string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panels', 'invoke.css'))) + '';
        this.panel.webview.html = htmlFileContents
            .replace(JavascriptHrefPlaceholder, javascriptHref)
            .replace(CssHrefPlaceholder, cssHref);
    }

    private onClose() {

    }

    private async onMessage(message: any) {
        if (this.onIncomingMessage) {
            this.onIncomingMessage();
        }

        if (message.e === invokeEvents.Init) {
            this.panel.webview.postMessage({ viewState: this.viewState });
        } /* else if (message.e === ...) {
            ...
        } ... */
    }

    dispose() {
        this.panel.dispose();
    }

}