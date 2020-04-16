import * as fs from 'fs';
import * as path from 'path';
import * as uuid from 'uuid';
import * as vscode from 'vscode';
import * as protobufAny from 'google-protobuf/google/protobuf/any_pb';

import * as ttfArtifact from './ttf/protos/artifact_pb';
import * as ttfClient from './ttf/protos/service_grpc_pb';
import * as ttfCore from './ttf/protos/core_pb';
import * as ttfTaxonomy from './ttf/protos/taxonomy_pb';

import { tokenDesignerEvents } from './panels/tokenDesignerEvents';
import { TokenDesignerTaxonomy } from './panels/tokenDesignerTaxonomy';

const JavascriptHrefPlaceholder : string = '[JAVASCRIPT_HREF]';
const CssHrefPlaceholder : string = '[CSS_HREF]';
const BaseHrefPlaceholder : string = '[BASE_HREF]';

export class TokenDesignerPanel {
    
    get title() {
        return (this.formula?.getArtifact()?.getName() || 'New formula') + ' - Token Designer';
    }

    private readonly panel: vscode.WebviewPanel;
    
    private readonly taxonomyObjects: TokenDesignerTaxonomy;

    private formula: ttfCore.TemplateFormula | null = null;
    
    constructor(
        private readonly client: ttfClient.ServiceClient, 
        private readonly taxonomy: ttfTaxonomy.Taxonomy, 
        private readonly extensionPath: string, 
        disposables: vscode.Disposable[]) {

        this.panel = vscode.window.createWebviewPanel('tokenDesigner', this.title, vscode.ViewColumn.Active, { enableScripts: true });
        this.panel.iconPath = vscode.Uri.file(path.join(extensionPath, 'resources', 'neo.svg'));
        this.panel.onDidDispose(this.onClose, this, disposables);
        this.panel.webview.onDidReceiveMessage(this.onMessage, this, disposables);        
        this.panel.webview.html = this.getPanelHtml();

        const taxonomyObject = taxonomy.toObject();
        this.taxonomyObjects = {
            baseTokenTypes: taxonomyObject.baseTokenTypesMap.map(_ => _[1]),
            propertySets: taxonomyObject.propertySetsMap.map(_ => _[1]),
            behaviors: taxonomyObject.behaviorsMap.map(_ => _[1]),
            behaviorGroups: taxonomyObject.behaviorGroupsMap.map(_ => _[1]),
        };

        //this.newFormula('david-token', 'DN');
        this.openFormula('[tF{~d,t,g,SC}+phSKU]');
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
        const baseHref: string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(this.extensionPath, 'resources'))) + '/';
        return htmlFileContents
            .replace(JavascriptHrefPlaceholder, javascriptHref)
            .replace(CssHrefPlaceholder, cssHref)
            .replace(BaseHrefPlaceholder, baseHref);
    }

    private async newFormula(name: string, symbol: string) {
        const id = uuid.v1();
        const newArtifactSymbol = new ttfArtifact.ArtifactSymbol();
        newArtifactSymbol.setId(id);
        newArtifactSymbol.setTooling(symbol);
        newArtifactSymbol.setVisual(symbol);
        newArtifactSymbol.setVersion('1.0,');
        newArtifactSymbol.setType(ttfArtifact.ArtifactType.TEMPLATE_FORMULA);
        newArtifactSymbol.setTemplateValidated(false);
        const newArtifact = new ttfArtifact.Artifact();
        newArtifact.setName(name);
        newArtifact.setArtifactSymbol(newArtifactSymbol);
        const newFormula = new ttfCore.TemplateFormula();
        newFormula.setArtifact(newArtifact);
        const newArtifactRequest = new ttfArtifact.NewArtifactRequest();
        newArtifactRequest.setType(ttfArtifact.ArtifactType.TEMPLATE_FORMULA);
        newArtifactRequest.setArtifact(this.packTemplateFormula(newFormula));
        await new Promise((resolve, reject) => this.client.createArtifact(newArtifactRequest, (error, response) => (error && reject(error)) || resolve(response)));
        this.refreshFormula(symbol);
    }

    private async openFormula(symbol: string) {
        this.refreshFormula(symbol);
    }

    private onClose() {
        this.dispose();
    }

    private async onMessage(message: any) {
        if (message.e === tokenDesignerEvents.Init) {
            this.panel.webview.postMessage({ formula: this.formula?.toObject(), taxonomy: this.taxonomyObjects });
        } else if (message.e === tokenDesignerEvents.Remove) {
            await this.removeArtifact(message.id);
        }
    }

    private packTemplateFormula(formula: ttfCore.TemplateFormula) {
        const any = new protobufAny.Any();
        any.pack(formula.serializeBinary(), 'taxonomy.model.core.TemplateFormula');
        return any;
    }

    private async refreshFormula(symbol?: string) {
        symbol = symbol || this.formula?.getArtifact()?.getArtifactSymbol()?.getTooling();
        if (symbol) {
            const existingArtifactSymbol = new ttfArtifact.ArtifactSymbol();
            existingArtifactSymbol.setTooling(symbol);
            const formula: ttfCore.TemplateFormula = await new Promise(
                (resolve, reject) => this.client.getTemplateFormulaArtifact(existingArtifactSymbol, (error, response) => (error && reject(error)) || resolve(response)));
            this.formula = formula;
        } else {
            this.formula = null;
        }
        this.panel.webview.postMessage({ formula: this.formula?.toObject() || null });
        this.panel.title = this.title;
    }

    private async removeArtifact(id: string) {
        const toRemove = 
            this.taxonomy.getBaseTokenTypesMap().get(id) ||
            this.taxonomy.getPropertySetsMap().get(id) ||
            this.taxonomy.getBehaviorsMap().get(id) ||
            this.taxonomy.getBehaviorGroupsMap().get(id);
        if (this.formula && toRemove) {
            const removeId = toRemove.getArtifact()?.getArtifactSymbol()?.getId();
            const removeType = toRemove.getArtifact()?.getArtifactSymbol()?.getType();
            if (removeType === ttfArtifact.ArtifactType.BASE) {
                this.formula.setTokenBase(undefined);
            } else {
                this.formula.setPropertySetsList(this.formula.getPropertySetsList().filter(_ => _.getPropertySet()?.getId() !== removeId));
                this.formula.setBehaviorsList(this.formula.getBehaviorsList().filter(_ => _.getBehavior()?.getId() !== removeId));
                this.formula.setBehaviorGroupsList(this.formula.getBehaviorGroupsList().filter(_ => _.getBehaviorGroup()?.getId() !== removeId));
            }
            const updateReqest = new ttfArtifact.UpdateArtifactRequest();
            updateReqest.setType(ttfArtifact.ArtifactType.TEMPLATE_FORMULA);
            updateReqest.setArtifactTypeObject(this.packTemplateFormula(this.formula));
            const response: ttfArtifact.UpdateArtifactResponse =
                await new Promise((resolve, reject) => this.client.updateArtifact(updateReqest, (error, response) => (error && reject(error)) || resolve(response)));
            this.formula = this.unackTemplateFormula(response.getArtifactTypeObject());
            this.refreshFormula();
        }
    }

    private unackTemplateFormula(input?: protobufAny.Any): ttfCore.TemplateFormula | null {
        if (input) {
            return input.unpack<ttfCore.TemplateFormula>(ttfCore.TemplateFormula.deserializeBinary, 'taxonomy.model.core.TemplateFormula');
        }
        return null;
    }

}