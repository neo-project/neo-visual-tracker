import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as shellEscape from 'shell-escape';
import * as vscode from 'vscode';

import { createEvents } from './panels/createEvents';
import { RpcServerExplorer } from './rpcServerExplorer';

const JavascriptHrefPlaceholder : string = '[JAVASCRIPT_HREF]';
const CssHrefPlaceholder : string = '[CSS_HREF]';

class ViewState {
    path: string = '';
    filename: string = 'default.neo-express.json';
    combinedPath: string = '';
    configFileExists: boolean = false;
    allowOverwrite: boolean = false;
    showError: boolean = false;
    showSuccess: boolean = false;
    result: string = '';
    nodeCount: number = 1;
}

export class CreateInstancePanel {

    private readonly panel: vscode.WebviewPanel;
    private readonly rpcServerExplorer: RpcServerExplorer;

    private viewState: ViewState;

    private disposed: boolean = false;
    private created: boolean = false;

    constructor(
        extensionPath: string,
        workspacePath: string,
        rpcServerExplorer: RpcServerExplorer,
        disposables: vscode.Disposable[]) {

        this.rpcServerExplorer = rpcServerExplorer;

        this.viewState = new ViewState();
        this.viewState.path = workspacePath;
        this.updateViewState();
        
        this.panel = vscode.window.createWebviewPanel(
            'createInstancePanel',
            'Create instance',
            vscode.ViewColumn.Active,
            { enableScripts: true });

        this.panel.iconPath = vscode.Uri.file(path.join(extensionPath, 'resources', 'neo.svg'));

        this.panel.onDidDispose(this.onClose, this, disposables);
        this.panel.webview.onDidReceiveMessage(this.onMessage, this, disposables);

        const htmlFileContents = fs.readFileSync(
            path.join(extensionPath, 'src', 'panels', 'create.html'), { encoding: 'utf8' });
        const javascriptHref : string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panels', 'createBundle.js'))) + '';
        const cssHref : string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panels', 'create.css'))) + '';
        this.panel.webview.html = htmlFileContents
            .replace(JavascriptHrefPlaceholder, javascriptHref)
            .replace(CssHrefPlaceholder, cssHref);
    }

    public isDisposed() {
        return this.disposed;
    }

    public reveal() {
        this.panel.reveal();
    }

    private onClose() {
        this.dispose();
    }

    private async onMessage(message: any) {
        if (message.e === createEvents.Init) {
            this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === createEvents.Update) {
            this.viewState = message.c;
            this.updateViewState();
            this.viewState.showError = false;
            this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === createEvents.Create) {
            this.doCreate();
        } else if (message.e === createEvents.Close) {
            this.dispose();
        }
    }

    private updateViewState() {
        this.viewState.combinedPath = path.join(this.viewState.path, this.viewState.filename);
        this.viewState.configFileExists = fs.existsSync(this.viewState.combinedPath);
        if (!this.viewState.configFileExists) {
            this.viewState.allowOverwrite = false;
        }
    }

    private doCreate() {
        const command = shellEscape.default([
            'neo-express', 
            'create', 
            '-c', this.viewState.nodeCount + '', 
            '-o', this.viewState.combinedPath, 
            this.viewState.allowOverwrite ? '-f' : '']);
        this.viewState.showError = false;
        this.viewState.showSuccess = false;
        childProcess.exec(command, (error, stdout, stderr) => {
            if (error) {
                this.viewState.showError = true;
                this.viewState.result = error.message;
            } else if (stderr) {
                this.viewState.showError = true;
                this.viewState.result = stderr;
            } else {
                this.created = true;
                this.viewState.showSuccess = true;
                this.viewState.result = stdout;
                this.rpcServerExplorer.refresh();
            }
            this.updateViewState();
            this.panel.webview.postMessage({ viewState: this.viewState });
        });
    }

    dispose() {
        this.disposed = true;
        this.panel.dispose();
    }

    disposeIfCreated() {
        if (this.created) {
            this.dispose();
        }
    }

}