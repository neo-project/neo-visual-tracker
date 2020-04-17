import * as path from 'path';
import * as vscode from 'vscode';

import * as ttfArtifact from './ttf/protos/artifact_pb';
import * as ttfTaxonomy from './ttf/protos/taxonomy_pb';

import { TokenTaxonomy } from './tokenTaxonomy';

export class TokenDefinitionIdentifier {

    static create(extensionPath: string, label: string, parent: TokenDefinitionIdentifier | undefined, dataSource: any) {
        const children: TokenDefinitionIdentifier[] = [];
        const result = new TokenDefinitionIdentifier(extensionPath, label, parent, dataSource?.artifact);
        if (dataSource?.fungibles) {
            children.push(TokenDefinitionIdentifier.create(extensionPath, 'Fungibles', result, dataSource.fungibles));
        }
        if (dataSource?.nonFungibles) {
            children.push(TokenDefinitionIdentifier.create(extensionPath, 'Non-fungibles', result, dataSource.nonFungibles));
        }
        if (dataSource?.hybrids) {
            children.push(TokenDefinitionIdentifier.create(extensionPath, 'Hybrids', result, dataSource.hybrids));
        }
        if (dataSource?.fungible) {
            children.push(TokenDefinitionIdentifier.create(extensionPath, 'Fungible', result, dataSource.fungible));
        }
        if (dataSource?.nonFungible) {
            children.push(TokenDefinitionIdentifier.create(extensionPath, 'Non-fungible', result, dataSource.nonFungible));
        }
        if (dataSource?.fractional) {
            children.push(TokenDefinitionIdentifier.create(extensionPath, 'Fractional', result, dataSource.fractional));
        }
        if (dataSource?.whole) {
            children.push(TokenDefinitionIdentifier.create(extensionPath, 'Whole', result, dataSource.whole));
        }
        if (dataSource?.singleton) {
            children.push(TokenDefinitionIdentifier.create(extensionPath, 'Singleton', result, dataSource.singleton));
        }
        if (dataSource?.name && dataSource?.branchesList) {
            for (const branch of dataSource.branchesList) {
                children.push(TokenDefinitionIdentifier.create(extensionPath, dataSource.name, result, branch));
            }
        }
        if (dataSource?.templates?.templateMap) {
            for (const mapItem of dataSource.templates.templateMap) {
                if (mapItem[1]?.definition) {
                    children.push(
                        TokenDefinitionIdentifier.create(
                            extensionPath,
                            mapItem[1].definition.artifact?.name || 'Unknown',
                            result,
                            mapItem[1].definition));
                }
            }
        }
        result.children = children.sort((a, b) => a.label.localeCompare(b.label));
        return result;
    }

    children: TokenDefinitionIdentifier[] = [];

    private constructor(
        public readonly extensionPath: string,
        public readonly label: string,
        public readonly parent: TokenDefinitionIdentifier | undefined,
        public readonly artifact?: ttfArtifact.Artifact.AsObject) {
    }

    public asTreeItem(): vscode.TreeItem {
        const result = new vscode.TreeItem(
            this.label, 
            this.children?.length ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None);
        result.iconPath = this.artifact ?
            vscode.Uri.file(path.join(this.extensionPath, 'resources', 'token-designer', 'token-base.svg')) : 
            vscode.Uri.file(path.join(this.extensionPath, 'resources', 'token-designer', 'unknown.svg'));
        if (this.artifact) {
            result.command = {
                title: 'Open definition',
                command: 'neo-visual-devtracker.openTokenDefinition',
                arguments: [this.artifact?.artifactSymbol?.id],
            };
        }
        return result;
    }
}

export class TokenDefinitionExplorer implements vscode.TreeDataProvider<TokenDefinitionIdentifier> {

    private readonly onDidChangeTreeDataEmitter: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();

    public readonly onDidChangeTreeData: vscode.Event<any> = this.onDidChangeTreeDataEmitter.event;

    private disposed = false;

    private hierarchy: ttfTaxonomy.Hierarchy.AsObject | undefined = undefined;

    constructor(private readonly extensionPath: string, private readonly taxonomy: TokenTaxonomy) {
        this.refresh();
        this.taxonomy.onRefresh(this.refresh, this);
    }

    dispose() {
        this.disposed = true;
    }

    getTreeItem(element: TokenDefinitionIdentifier): vscode.TreeItem {
        return element.asTreeItem();
    }

    getChildren(element?: TokenDefinitionIdentifier): TokenDefinitionIdentifier[] {
        if (element) {
            return element.children;
        } else if (this.hierarchy) {
            return this.getChildren(TokenDefinitionIdentifier.create(this.extensionPath, 'Token definitions', undefined, this.hierarchy));
        } else {
            return [];
        }
    }

    getParent(element: TokenDefinitionIdentifier) {
        return element?.parent;
    }

    private refresh() {
        if (this.taxonomy.taxonomy && !this.disposed) {
            this.hierarchy = this.taxonomy
                .taxonomy
                .toObject()
                .tokenTemplateHierarchy;
            this.onDidChangeTreeDataEmitter.fire();
        }
    }
}