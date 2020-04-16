import * as fs from 'fs';
import * as path from 'path';
import * as uuid from 'uuid';
import * as vscode from 'vscode';
import * as protobufAny from 'google-protobuf/google/protobuf/any_pb';

import * as ttfArtifact from './ttf/protos/artifact_pb';
import * as ttfClient from './ttf/protos/service_grpc_pb';
import * as ttfCore from './ttf/protos/core_pb';

import { TokenTaxonomy } from './tokenTaxonomy';
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
    
    private taxonomyObjects: TokenDesignerTaxonomy | null = null;

    private formula: ttfCore.TemplateFormula | null = null;

    private incompatabilities: any = {};

    private disposed = false;

    static async openNewFormula(ttfConnection: ttfClient.ServiceClient, ttfTaxonomy: TokenTaxonomy, extensionPath: string, disposables: vscode.Disposable[]) {
        let symbolName;
        while (!symbolName) {
            symbolName = await vscode.window.showInputBox({ 
                ignoreFocusOut: true, 
                prompt: 'Choose a name for the formula',
                validateInput: _ => _ && _.length ? '' : 'The name cannot be empty',
            });
        }
        const panel = new TokenDesignerPanel(ttfConnection, ttfTaxonomy, extensionPath, disposables);
        panel.newFormula(symbolName);
        return panel;
    }

    static async openExistingFormula(toolingSymbol: string, ttfConnection: ttfClient.ServiceClient, ttfTaxonomy: TokenTaxonomy, extensionPath: string, disposables: vscode.Disposable[]) {
        const panel = new TokenDesignerPanel(ttfConnection, ttfTaxonomy, extensionPath, disposables);
        await panel.openFormula(toolingSymbol);
        return panel;
    }

    private constructor(
        private readonly ttfConnection: ttfClient.ServiceClient, 
        private readonly ttfTaxonomy: TokenTaxonomy, 
        private readonly extensionPath: string, 
        disposables: vscode.Disposable[]) {
    
        this.panel = vscode.window.createWebviewPanel('tokenDesigner', this.title, vscode.ViewColumn.Active, { enableScripts: true });
        this.panel.iconPath = vscode.Uri.file(path.join(extensionPath, 'resources', 'token-designer', 'token-base.svg'));
        this.panel.onDidDispose(this.onClose, this, disposables);
        this.panel.webview.onDidReceiveMessage(this.onMessage, this, disposables);        
        this.panel.webview.html = this.getPanelHtml();

        this.refreshTaxonomy();
        this.ttfTaxonomy.onRefresh(this.refreshTaxonomy, this);
    }

    dispose() {
        this.disposed = true;
        this.panel.dispose();
    }

    private async addArtifact(id: string) {
        const toAdd = this.getArtifcactById(id);
        if (this.formula && toAdd) {
            await this.removeArtifact(id, false); // avoid duplicates
            const addType = toAdd.getArtifact()?.getArtifactSymbol()?.getType();
            switch (addType) {
                case ttfArtifact.ArtifactType.BASE:
                    const templateBase = new ttfCore.TemplateBase();
                    templateBase.setBase(toAdd.getArtifact()?.getArtifactSymbol());
                    this.formula.setTokenBase(templateBase);
                    break;
                case ttfArtifact.ArtifactType.PROPERTY_SET:
                    const templatePropertySet = new ttfCore.TemplatePropertySet();
                    templatePropertySet.setPropertySet(toAdd.getArtifact()?.getArtifactSymbol());
                    this.formula.getPropertySetsList().push(templatePropertySet);
                    break;
                case ttfArtifact.ArtifactType.BEHAVIOR:
                    const templateBehavior = new ttfCore.TemplateBehavior();
                    templateBehavior.setBehavior(toAdd.getArtifact()?.getArtifactSymbol());
                    this.formula.getBehaviorsList().push(templateBehavior);
                    break;
                case ttfArtifact.ArtifactType.BEHAVIOR_GROUP:
                    const templateBehaviorGroup = new ttfCore.TemplateBehaviorGroup();
                    templateBehaviorGroup.setBehaviorGroup(toAdd.getArtifact()?.getArtifactSymbol());
                    this.formula.getBehaviorGroupsList().push(templateBehaviorGroup);
                    break;
            }
            await this.saveFormula();
        }
    }

    private getArtifcactById(id?: string) {
        const taxonomy = this.ttfTaxonomy.taxonomy;
        if (!id || !taxonomy) {
            return undefined;
        }
        return taxonomy.getBaseTokenTypesMap().get(id) ||
            taxonomy.getPropertySetsMap().get(id) ||
            taxonomy.getBehaviorsMap().get(id) ||
            taxonomy.getBehaviorGroupsMap().get(id);
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

    private async newFormula(name: string) {
        const id = uuid.v1();
        const temporaryTooling = id;
        const newArtifactSymbol = new ttfArtifact.ArtifactSymbol();
        newArtifactSymbol.setId(id);
        newArtifactSymbol.setTooling(temporaryTooling);
        newArtifactSymbol.setVisual('');
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
        await new Promise((resolve, reject) => this.ttfConnection.createArtifact(newArtifactRequest, (error, response) => (error && reject(error)) || resolve(response)));
        this.refreshFormula(temporaryTooling);
    }

    private async openFormula(symbol: string) {
        this.refreshFormula(symbol);
    }

    private onClose() {
        this.dispose();
    }

    private async onMessage(message: any) {
        if (message.e === tokenDesignerEvents.Init) {
            this.panel.webview.postMessage({
                formula: this.formula?.toObject(),
                taxonomy: this.taxonomyObjects,
                incompatabilities: this.incompatabilities,
            });
        } else if (message.e === tokenDesignerEvents.Add) {
            await this.addArtifact(message.id);
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
                (resolve, reject) => this.ttfConnection.getTemplateFormulaArtifact(existingArtifactSymbol, (error, response) => (error && reject(error)) || resolve(response)));
            this.formula = formula;
        } else {
            this.formula = null;
        }
        this.updateIncompatibilities();
        this.panel.webview.postMessage({ formula: this.formula?.toObject() || null, incompatabilities: this.incompatabilities });
        this.panel.title = this.title;
        await this.ttfTaxonomy.refresh();
    }

    private async refreshTaxonomy() {
        if (!this.disposed) {
            const taxonomy = this.ttfTaxonomy.taxonomy;
            if (taxonomy) {
                const taxonomyObject = taxonomy.toObject();
                this.taxonomyObjects = {
                    baseTokenTypes: taxonomyObject.baseTokenTypesMap.map(_ => _[1]),
                    propertySets: taxonomyObject.propertySetsMap.map(_ => _[1]),
                    behaviors: taxonomyObject.behaviorsMap.map(_ => _[1]),
                    behaviorGroups: taxonomyObject.behaviorGroupsMap.map(_ => _[1]),
                };
            } else {
                this.taxonomyObjects = null;
            }
            this.panel.webview.postMessage({ taxonomy: this.taxonomyObjects });
        }
    }

    private async removeArtifact(id: string, save: boolean = true) {
        const toRemove = this.getArtifcactById(id);
        if (this.formula && toRemove) {
            if (this.formula.getTokenBase()?.getBase()?.getId() === id) {
                this.formula.setTokenBase(undefined);            
            } else {
                this.formula.setPropertySetsList(this.formula.getPropertySetsList().filter(_ => _.getPropertySet()?.getId() !== id));
                this.formula.setBehaviorsList(this.formula.getBehaviorsList().filter(_ => _.getBehavior()?.getId() !== id));
                this.formula.setBehaviorGroupsList(this.formula.getBehaviorGroupsList().filter(_ => _.getBehaviorGroup()?.getId() !== id));
            }
            if (save) {
                await this.saveFormula();
            }
        }
    }

    private async saveFormula() {
        if (this.formula) {
            this.updateSymbol();
            const updateReqest = new ttfArtifact.UpdateArtifactRequest();
            updateReqest.setType(ttfArtifact.ArtifactType.TEMPLATE_FORMULA);
            updateReqest.setArtifactTypeObject(this.packTemplateFormula(this.formula));
            const response: ttfArtifact.UpdateArtifactResponse =
                await new Promise((resolve, reject) => this.ttfConnection.updateArtifact(updateReqest, (error, response) => (error && reject(error)) || resolve(response)));
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

    private updateIncompatibilities() {
        const newIncompatabilities: any = {};
        if (this.formula) {
            const allIds = [];
            allIds.push(this.formula.getTokenBase()?.getBase()?.getId());
            allIds.push(...this.formula.getBehaviorsList().map(_ => _.getBehavior()?.getId()));
            allIds.push(...this.formula.getBehaviorGroupsList().map(_ => _.getBehaviorGroup()?.getId()));
            allIds.push(...this.formula.getPropertySetsList().map(_ => _.getPropertySet()?.getId()));
            for (const id of allIds) {
                const artifact = this.getArtifcactById(id);
                if (artifact) {
                    const artifactName = artifact.getArtifact()?.getName();
                    for (const artifactIncompatibleWith of artifact.getArtifact()?.getIncompatibleWithSymbolsList() || []) {
                        if (newIncompatabilities[artifactIncompatibleWith.getId()]) {
                            newIncompatabilities[artifactIncompatibleWith.getId()].push(artifactName);
                        } else {
                            newIncompatabilities[artifactIncompatibleWith.getId()] = [ artifactName ];
                        }
                    }
                }
            }
        }
        this.incompatabilities = newIncompatabilities;
    }

    private updateSymbol() {
        if (this.formula) {
            const tokenBaseTooling = this.formula.getTokenBase()?.getBase()?.getTooling() || '?{}';
            const tokenBaseVisual = this.formula.getTokenBase()?.getBase()?.getVisual() || '?{}';
            let [ tooling, includedBehaviorsTooling ] = tokenBaseTooling.replace('}', '').split('{', 2);
            let [ visual, includedBehaviorsVisual ] = tokenBaseVisual.replace('}', '').split('{', 2);
            const behaviorsTooling = (includedBehaviorsTooling || '').split(',');
            const behaviorsVisual = (includedBehaviorsVisual || '').split(',');
            for (const behavior of this.formula.getBehaviorsList()) {
                if (behaviorsTooling.indexOf(behavior.getBehavior()?.getTooling() || '') === -1) {
                    behaviorsTooling.push(behavior.getBehavior()?.getTooling() || '?');
                    behaviorsVisual.push(behavior.getBehavior()?.getVisual() || '?');
                }
            }
            for (const behaviorGroup of this.formula.getBehaviorGroupsList()) {
                if (behaviorsTooling.indexOf(behaviorGroup.getBehaviorGroup()?.getTooling() || '') === -1) {
                    behaviorsTooling.push(behaviorGroup.getBehaviorGroup()?.getTooling() || '?');
                    behaviorsVisual.push(behaviorGroup.getBehaviorGroup()?.getVisual() || '?');
                }
            }
            tooling += '{' + behaviorsTooling.join(',') + '}';
            visual += '{' + behaviorsVisual.join(',') + '}';
            for (const propertySet of this.formula.getPropertySetsList()) {
                tooling += '+' + (propertySet.getPropertySet()?.getTooling() || '?');
                visual += '+' + (propertySet.getPropertySet()?.getVisual() || '?');
            }
            this.formula.getArtifact()?.getArtifactSymbol()?.setTooling('[' + tooling + ']');
            this.formula.getArtifact()?.getArtifactSymbol()?.setVisual('[' + visual + ']');
        }
    }

}