import * as fs from 'fs';
import * as vscode from 'vscode';

import { wallet } from '@cityofzion/neon-js';

class WalletTreeItemIdentifier {

    public readonly jsonFile?: string;

    public readonly label?: string;

    public static fromJsonFile(allRootPaths: string[], jsonFile: string) {
        try {
            let label = jsonFile;
            for (let i = 0; i < allRootPaths.length; i++) {
                label = label.replace(allRootPaths[i], '');
            }

            if (label.startsWith('/') || label.startsWith('\\')) {
                label = label.substr(1);
            }

            const result = new WalletTreeItemIdentifier(jsonFile, label);
            const jsonFileContents = fs.readFileSync(jsonFile, { encoding: 'utf8' });
            const contents = JSON.parse(jsonFileContents);
            const parsedWallet = new wallet.Wallet(contents);
            if ((parsedWallet.name !== "myWallet") || (parsedWallet.accounts && parsedWallet.accounts.length)) {
                return result;
            } else {
                return undefined;
            }
        } catch(e) {
            return undefined;
        }
    }

    private constructor(
        jsonFile?: string, 
        label?: string) {

        this.jsonFile = jsonFile;
        this.label = label;
    }

    public asTreeItem(extensionPath: string) : vscode.TreeItem {
        const result = new vscode.TreeItem('' + this.label, vscode.TreeItemCollapsibleState.None);
        result.iconPath = vscode.ThemeIcon.File;
        result.tooltip = 'Wallet loaded from: ' + this.jsonFile;
        return result;
    }
}

export class WalletExplorer implements vscode.TreeDataProvider<WalletTreeItemIdentifier> {

    private readonly onDidChangeTreeDataEmitter: vscode.EventEmitter<any>;
    private readonly fileSystemWatcher: vscode.FileSystemWatcher;
    private readonly searchPattern: vscode.GlobPattern = '**/*.json';
    
    public readonly onDidChangeTreeData: vscode.Event<any>;

    private rootItems: WalletTreeItemIdentifier[];

	constructor(private readonly extensionPath: string) { 
        this.onDidChangeTreeDataEmitter = new vscode.EventEmitter<any>();
        this.onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;
        this.rootItems = [];
        this.refresh();
        this.fileSystemWatcher = vscode.workspace.createFileSystemWatcher(this.searchPattern);
        this.fileSystemWatcher.onDidChange(this.refresh, this);
        this.fileSystemWatcher.onDidCreate(this.refresh, this);
        this.fileSystemWatcher.onDidDelete(this.refresh, this);
    }

    public dispose() {
        if (this.fileSystemWatcher) {
            this.fileSystemWatcher.dispose();
        }
    }

	public async refresh() {
        this.rootItems = [];

        this.onDidChangeTreeDataEmitter.fire();

        let allRootPaths: string[] = [];
        if (vscode.workspace.workspaceFolders) {
            allRootPaths = vscode.workspace.workspaceFolders.map(_ => _.uri.fsPath);
        }

        const allJsonFiles = await vscode.workspace.findFiles('**/*.json');
        for (let i = 0; i < allJsonFiles.length; i++) {
            const walletFromJson = WalletTreeItemIdentifier.fromJsonFile(
                allRootPaths,
                allJsonFiles[i].fsPath);
            if (walletFromJson) {
                this.rootItems.push(walletFromJson);
                this.onDidChangeTreeDataEmitter.fire();
            }
        }
	}

	public getTreeItem(element: WalletTreeItemIdentifier): vscode.TreeItem {
        return element.asTreeItem(this.extensionPath);
	}

	public getChildren(element?: WalletTreeItemIdentifier): WalletTreeItemIdentifier[] {
        if (element) {
            return [];
        } else {
            return this.rootItems;
        }
	}

	public getParent(element: WalletTreeItemIdentifier) {
		return undefined;
    }
}