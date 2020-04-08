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
    
    constructor(taxonomy: ttfTaxonomy.Taxonomy.AsObject, private readonly extensionPath: string, disposables: vscode.Disposable[]) {
        this.panel = vscode.window.createWebviewPanel('tokenDesigner', this.title, vscode.ViewColumn.Active, { enableScripts: true });
        this.panel.iconPath = vscode.Uri.file(path.join(extensionPath, 'resources', 'neo.svg'));
        this.panel.onDidDispose(this.onClose, this, disposables);
        this.panel.webview.onDidReceiveMessage(this.onMessage, this, disposables);        
        this.panel.webview.html = this.getPanelHtml();

        this.taxonomy = {
            baseTokenTypes: taxonomy.baseTokenTypesMap.map(_ => _[1]),
            propertySets: taxonomy.propertySetsMap.map(_ => _[1]),
            behaviors: taxonomy.behaviorsMap.map(_ => _[1]),
            behaviorGroups: taxonomy.behaviorGroupsMap.map(_ => _[1]),
        };
    }

    dispose() {
        this.panel.dispose();
    }

    private generateFormula() {
        this.viewState.formulaHtml = this.viewState.tokenBase?.artifact?.artifactSymbol?.visual || '❓';
        this.viewState.formulaTooling = this.viewState.tokenBase?.artifact?.artifactSymbol?.tooling || '?';
        let behaviorsHtml = this.viewState.behaviorGroups
            .map(_ => _.artifact?.artifactSymbol?.visual || '❓')
            .concat(this.viewState.behaviors.map(_ => _.artifact?.artifactSymbol?.visual || '❓'))
            .join(',');
        if (behaviorsHtml) {
            if (this.viewState.formulaHtml.indexOf('}') !== -1) {
                this.viewState.formulaHtml = this.viewState.formulaHtml.replace('}', ',' + behaviorsHtml + '}');
            } else {
                this.viewState.formulaHtml += `{${behaviorsHtml}}`;
            }
        }
        let behaviorsTooling = this.viewState.behaviorGroups
            .map(_ => _.artifact?.artifactSymbol?.tooling || '?')
            .concat(this.viewState.behaviors.map(_ => _.artifact?.artifactSymbol?.tooling || '?'))
            .join(',');
        if (behaviorsTooling) {
            if (this.viewState.formulaTooling.indexOf('}') !== -1) {
                this.viewState.formulaTooling = this.viewState.formulaTooling.replace('}', ',' + behaviorsTooling + '}');
            } else {
                this.viewState.formulaTooling += `{${behaviorsTooling}}`;
            }
        }
        for (const propertySet of this.viewState.propertySets) {
            this.viewState.formulaHtml += ' + ' + propertySet.artifact?.artifactSymbol?.visual || '❓';
            this.viewState.formulaTooling += ' + ' + propertySet.artifact?.artifactSymbol?.tooling || '?';
        }
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
            this.generateFormula();
            this.panel.title = this.viewState.tokenName + ' - Token Designer';
            this.panel.webview.postMessage({ viewState: this.viewState });
        }
    }

}