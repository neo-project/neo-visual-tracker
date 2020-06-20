import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { createCheckpointEvents } from './panels/createCheckpointEvents';
import { NeoExpressHelper } from './neoExpressHelper';

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
    private readonly neoExpressHelper: NeoExpressHelper;

    private viewState: ViewState;

    constructor(
        extensionPath: string,
        neoExpressJsonFullPath: string,
        workspacePath: string,
        neoExpressHelper: NeoExpressHelper,
        disposables: vscode.Disposable[]) {

        this.neoExpressHelper = neoExpressHelper;

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
        if (message.e === createCheckpointEvents.Init) {
            this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === createCheckpointEvents.Update) {
            this.viewState = message.c;
            this.updateViewState();
            this.viewState.showError = false;
            this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === createCheckpointEvents.Create) {
            await this.doCreate();
        } else if (message.e === createCheckpointEvents.Close) {
            this.dispose();
        } else if (message.e === createCheckpointEvents.PickFolder) {
            await this.pickFolder();
            this.panel.webview.postMessage({ viewState: this.viewState });
        }
    }

    private async pickFolder() {
        const result = await vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            defaultUri: vscode.Uri.file(this.viewState.path),
            openLabel: "Select folder"
        });
        if (result?.length) {
            this.viewState.path = result[0].fsPath;
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
        const result = await this.neoExpressHelper.createCheckpoint(
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