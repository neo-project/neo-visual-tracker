import * as path from 'path';
import * as vscode from 'vscode';

import { TokenTaxonomy } from './tokenTaxonomy';

export class TokenFormulaIdentifier {

    constructor(
        public readonly extensionPath: string,
        public readonly toolingSymbol: string,
        public readonly label: string,
        public readonly description: string,
        public readonly id: string) {
    }

    public asTreeItem(): vscode.TreeItem {
        const result = new vscode.TreeItem(this.label);
        result.iconPath = vscode.Uri.file(path.join(this.extensionPath, 'resources', 'token-designer', 'token-base.svg'));
        result.description = this.description;
        result.command = {
            title: 'Open formula',
            command: 'neo-visual-devtracker.openTokenFormula',
            arguments: [this.toolingSymbol],
        };
        return result;
    }
}

export class TokenFormulaExplorer implements vscode.TreeDataProvider<TokenFormulaIdentifier> {

    private readonly onDidChangeTreeDataEmitter: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();

    public readonly onDidChangeTreeData: vscode.Event<any> = this.onDidChangeTreeDataEmitter.event;

    private disposed = false;

    private rootItems: TokenFormulaIdentifier[] = [];

    constructor(private readonly extensionPath: string, private readonly ttfTaxonomy: TokenTaxonomy) {
        this.refresh();
        this.ttfTaxonomy.onRefresh(this.refresh, this);
    }

    dispose() {
        this.disposed = true;
    }

    getTreeItem(element: TokenFormulaIdentifier): vscode.TreeItem {
        return element.asTreeItem();
    }

    getChildren(element?: TokenFormulaIdentifier): TokenFormulaIdentifier[] {
        return element ? [] : this.rootItems;
    }

    getParent(element: TokenFormulaIdentifier) {
        return undefined;
    }

    private refresh() {
        if (this.ttfTaxonomy.taxonomy && !this.disposed) {
            this.rootItems = this.ttfTaxonomy
                .taxonomy
                .toObject()
                .templateFormulasMap
                .map(_ => _[1])
                .filter(_ => !!_.artifact?.artifactSymbol?.tooling)
                .map(_ => new TokenFormulaIdentifier(
                    this.extensionPath, 
                    _.artifact?.artifactSymbol?.tooling as string, 
                    _.artifact?.name || _.artifact?.artifactSymbol?.tooling as string, 
                    _.artifact?.artifactDefinition?.businessDescription || '',
                    _.artifact?.artifactSymbol?.id || ''));
            this.rootItems.sort((a, b) => a.label.localeCompare(b.label));
            this.onDidChangeTreeDataEmitter.fire();
        }
    }
}