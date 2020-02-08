import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { startEvents } from './panels/startEvents';

import { CheckpointDetector } from './checkpointDetector';
import { NeoExpressInstanceManager } from './neoExpressInstanceManager';
import { NeoExpressConfig } from './neoExpressConfig';

const JavascriptHrefPlaceholder : string = '[JAVASCRIPT_HREF]';
const CssHrefPlaceholder : string = '[CSS_HREF]';

class ViewState {
    checkpoints: any[] = [];
    error?: string = undefined;
    multiNode: boolean = false;
    secondsPerBlock: number = 15;
    selectedCheckpoint?: string = undefined;
}

export class StartPanel {

    private readonly neoExpressConfig: NeoExpressConfig;
    private readonly neoExpressInstanceManager: NeoExpressInstanceManager;
    private readonly checkpointDetector: CheckpointDetector;
    private readonly panel: vscode.WebviewPanel;

    private viewState: ViewState;

    constructor(
        extensionPath: string,
        neoExpressConfig: NeoExpressConfig,
        neoExpressInstanceManager: NeoExpressInstanceManager,
        checkpointDetector: CheckpointDetector,
        disposables: vscode.Disposable[]) {

        this.neoExpressConfig = neoExpressConfig;
        this.neoExpressInstanceManager = neoExpressInstanceManager;
        this.checkpointDetector = checkpointDetector;
        this.viewState = new ViewState();

        this.panel = vscode.window.createWebviewPanel(
            'startPanel',
            'Start ' + neoExpressConfig.instancename,
            vscode.ViewColumn.Active,
            { enableScripts: true });
        this.panel.iconPath = vscode.Uri.file(path.join(extensionPath, 'resources', 'neo.svg'));
        this.panel.webview.onDidReceiveMessage(this.onMessage, this, disposables);

        const htmlFileContents = fs.readFileSync(
            path.join(extensionPath, 'src', 'panels', 'start.html'), { encoding: 'utf8' });
        const javascriptHref: string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panels', 'bundles', 'start.main.js'))) + '';
        const cssHref: string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panels', 'start.css'))) + '';
        this.panel.webview.html = htmlFileContents
            .replace(JavascriptHrefPlaceholder, javascriptHref)
            .replace(CssHrefPlaceholder, cssHref);
    }

    public dispose() {
        this.panel.dispose();
    }

    private async doStart(): Promise<boolean> {
        if (this.viewState.selectedCheckpoint) {
            if (!( await this.neoExpressInstanceManager.startCheckpoint(
                this.neoExpressConfig.neoExpressJsonFullPath, 
                this.viewState.selectedCheckpoint,
                this.neoExpressConfig.instancename,
                this.viewState.secondsPerBlock))) {
                
                this.viewState.error = 'The selected checkpoint cannot be applied to this Neo Express instance';
                return false;
            }
        } else {
            for (let i = 0; i < this.neoExpressConfig.nodeCount; i++) {
                if (!(await this.neoExpressInstanceManager.start(
                    this.neoExpressConfig.neoExpressJsonFullPath, 
                    i, 
                    this.neoExpressConfig.instancename,
                    this.viewState.secondsPerBlock))) {
                    if (i > 0) {
                        this.viewState.error = 'One or more of the nodes in this Neo Express instance failed to start';
                    } else {
                        this.viewState.error = 'The Neo Express instance failed to start';
                    }
                    return false;
                }
            }
        }

        this.dispose(); // close panel after successful start
        return true;
    }

    private async onMessage(message: any) {
        if (message.e === startEvents.Init) {
            await this.refresh();
            await this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === startEvents.Refresh) {
            await this.refresh();
            await this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === startEvents.Update) {
            this.viewState = message.c;
            await this.refresh();
            await this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === startEvents.Start) {
            await this.refresh();
            if (!(await this.doStart())) {
                await this.panel.webview.postMessage({ viewState: this.viewState });
            }
        }
    }

    private async refresh() {
        this.viewState.error = undefined;

        this.neoExpressConfig.refresh();
        await this.checkpointDetector.refresh();

        this.viewState.multiNode = this.neoExpressConfig.nodeCount > 1;

        this.viewState.checkpoints = this.checkpointDetector.checkpoints;
        if (!this.viewState.checkpoints.find(_ => _.fullpath === this.viewState.selectedCheckpoint)) {
            this.viewState.selectedCheckpoint = undefined;
        }

        if (this.viewState.multiNode) {
            this.viewState.selectedCheckpoint = undefined;
        }

        if (isNaN(this.viewState.secondsPerBlock) || (this.viewState.secondsPerBlock < 1)) {
            this.viewState.secondsPerBlock = 15;
        }
    }

}