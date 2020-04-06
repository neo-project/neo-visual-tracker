import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import * as ttfTaxonomy from './ttf/protos/taxonomy_pb';

import { tokenDesignerEvents } from './panels/tokenDesignerEvents';
import { TokenDesignerTaxonomy } from './panels/tokenDesignerTaxonomy';
import { TokenDesignerViewState } from './panels/tokenDesignerViewState';

const JavascriptHrefPlaceholder : string = '[JAVASCRIPT_HREF]';
const CssHrefPlaceholder : string = '[CSS_HREF]';

export class TokenDesignerPanel {
    
    get title() {
        return this.viewState.tokenName + ' - Token Designer';
    }

    private readonly panel: vscode.WebviewPanel;
    
    private readonly taxonomy: TokenDesignerTaxonomy;
    
    private viewState: TokenDesignerViewState = new TokenDesignerViewState();
    
    constructor(taxonomy: ttfTaxonomy.Taxonomy, private readonly extensionPath: string, disposables: vscode.Disposable[]) {
        this.panel = vscode.window.createWebviewPanel('tokenDesigner', this.title, vscode.ViewColumn.Active, { enableScripts: true });
        this.panel.iconPath = vscode.Uri.file(path.join(extensionPath, 'resources', 'neo.svg'));
        this.panel.onDidDispose(this.onClose, this, disposables);
        this.panel.webview.onDidReceiveMessage(this.onMessage, this, disposables);        
        this.panel.webview.html = this.getPanelHtml();

        this.taxonomy = {
            baseTokenTypes: taxonomy.getBaseTokenTypesMap().toArray().map(_ => _[1]),
        };
    }

    dispose() {
        this.panel.dispose();
    }

    private getPanelHtml() {
        const htmlFileContents = fs.readFileSync(
            path.join(this.extensionPath, 'src', 'panels', 'tokenDesigner.html'), { encoding: 'utf8' });
        const javascriptHref: string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(this.extensionPath, 'out', 'panels', 'bundles', 'tokenDesigner.main.js'))) + '';
        const cssHref: string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(this.extensionPath, 'out', 'panels', 'tokenDesigner.css'))) + '';
        return htmlFileContents.replace(JavascriptHrefPlaceholder, javascriptHref).replace(CssHrefPlaceholder, cssHref);
    }

    private onClose() {
        this.dispose();
    }

    private onMessage(message: any) {
        if (message.e === tokenDesignerEvents.Init) {
            this.panel.webview.postMessage({ viewState: this.viewState, taxonomy: this.taxonomy });
        } else if (message.e === tokenDesignerEvents.Update) {
            this.viewState = message.viewState;
            this.panel.title = this.viewState.tokenName + ' - Token Designer';
        }
    }

}