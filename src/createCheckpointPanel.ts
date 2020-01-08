import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { createEvents } from './panels/createEvents';
import { NeoExpressHelper } from './neoExpressHelper';
import { RpcServerExplorer } from './rpcServerExplorer';

const JavascriptHrefPlaceholder : string = '[JAVASCRIPT_HREF]';
const CssHrefPlaceholder : string = '[CSS_HREF]';

class ViewState {
    neoExpressJsonFullPath: string = '';
    path: string = '';
    checkpointName: string = 'checkpoint';
    combinedPath: string = '';
    fileExists: boolean = false;
    allowOverwrite: boolean = false;
    showError: boolean = false;
    showSuccess: boolean = false;
    result: string = '';
}

export class CreateCheckpointPanel {

    private readonly panel: vscode.WebviewPanel;

    private viewState: ViewState;

    constructor(
        extensionPath: string,
        neoExpressJsonFullPath: string,
        workspacePath: string,
        disposables: vscode.Disposable[]) {

        this.viewState = new ViewState();
        this.viewState.neoExpressJsonFullPath = neoExpressJsonFullPath;
        this.viewState.path = workspacePath;
        this.updateViewState();
        
        this.panel = vscode.window.createWebviewPanel(
            'createCheckpointPanel',
            path.basename(neoExpressJsonFullPath) + ' - Create checkpoint',
            vscode.ViewColumn.Active,
            { enableScripts: true });

        this.panel.iconPath = vscode.Uri.file(path.join(extensionPath, 'resources', 'neo.svg'));

        this.panel.onDidDispose(this.onClose, this, disposables);
        this.panel.webview.onDidReceiveMessage(this.onMessage, this, disposables);

        const htmlFileContents = fs.readFileSync(
            path.join(extensionPath, 'src', 'panels', 'createCheckpoint.html'), { encoding: 'utf8' });
        const javascriptHref : string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panels', 'bundles', 'createCheckpoint.main.js'))) + '';
        const cssHref : string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panels', 'createCheckpoint.css'))) + '';
        this.panel.webview.html = htmlFileContents
            .replace(JavascriptHrefPlaceholder, javascriptHref)
            .replace(CssHrefPlaceholder, cssHref);
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
            await this.doCreate();
        } else if (message.e === createEvents.Close) {
            this.dispose();
        }
    }

    private updateViewState() {
        this.viewState.combinedPath = path.join(this.viewState.path, this.viewState.checkpointName + '.neo-express-checkpoint');
        this.viewState.fileExists = fs.existsSync(this.viewState.combinedPath);
        if (!this.viewState.fileExists) {
            this.viewState.allowOverwrite = false;
        }
    }

    private async doCreate() {
        const result = await NeoExpressHelper.createCheckpoint(
            this.viewState.neoExpressJsonFullPath,
            this.viewState.path,
            this.viewState.checkpointName,
            this.viewState.allowOverwrite);
        this.viewState.showError = result.isError;
        this.viewState.showSuccess = !result.isError;
        this.viewState.result = result.output;
        this.updateViewState();
        this.panel.webview.postMessage({ viewState: this.viewState });
    }

    dispose() {
        this.panel.dispose();
    }

}