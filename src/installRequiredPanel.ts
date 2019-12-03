import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

const JavascriptHrefPlaceholder : string = '[JAVASCRIPT_HREF]';
const CssHrefPlaceholder : string = '[CSS_HREF]';

export class InstallRequiredPanel {

    private readonly panel: vscode.WebviewPanel;

    private disposed: boolean = false;

    constructor(
        extensionPath: string,
        disposables: vscode.Disposable[]) {

        this.panel = vscode.window.createWebviewPanel(
            'installRequiredPanel',
            'Neo Express required',
            vscode.ViewColumn.Active,
            { enableScripts: true });
        this.panel.iconPath = vscode.Uri.file(path.join(extensionPath, 'resources', 'neo.svg'));
        this.panel.onDidDispose(this.onClose, this, disposables);
        this.panel.webview.onDidReceiveMessage(this.onMessage, this, disposables);

        const htmlFileContents = fs.readFileSync(
            path.join(extensionPath, 'src', 'panels', 'installRequired.html'), { encoding: 'utf8' });
        const javascriptHref : string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panels', 'bundles', 'installRequired.main.js'))) + '';
        const cssHref : string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panels', 'installRequired.css'))) + '';
        this.panel.webview.html = htmlFileContents
            .replace(JavascriptHrefPlaceholder, javascriptHref)
            .replace(CssHrefPlaceholder, cssHref);
    }

    public dispose() {
        this.disposed = true;
        this.panel.dispose();
    }

    public isDisposed() {
        return this.disposed;
    }

    private onClose() {
        this.dispose();
    }

    private async onMessage() {
        this.dispose();
    }

    public reveal() {
        this.panel.reveal();
    }

}