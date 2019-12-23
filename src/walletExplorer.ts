import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { IWallet } from './iWallet';
import { wallet } from '@cityofzion/neon-core';

const NewWalletFileInstructions = 'Save this JSON file anywhere in your workspace. You will then see your new wallet appear ' +
    'in the wallet explorer.';

class WalletExplorerWallet implements IWallet {

    public readonly isMultiSig: boolean = false;
    public readonly signingFunction: ((tx: string, pk: string) => string) | undefined = undefined;
    public readonly description: string;
    public readonly address: string;

    public constructor(
        private readonly parsedWallet: wallet.Wallet,
        public readonly account: wallet.Account,
        private readonly filename: string, 
        walletName: string) {

        this.description = filename + ' - ' + walletName + ' - ' + account.label;
        this.address = account.address;
    }

    public async unlock() : Promise<boolean> {
        const passphrase = await vscode.window.showInputBox({
            prompt: 'Enter the passphrase for ' + path.basename(this.filename),
            password: true,
            ignoreFocusOut: true,
        });
        if (passphrase) {
            try {
                return (await this.parsedWallet.decryptAll(passphrase)).reduce((a, b)=> a && b, true);
            } catch (e) {
                console.error('Wallet decryption error', this.filename, e);
            }
        } 
        return false;
    }
}

class WalletTreeItemIdentifier {

    public readonly children: WalletTreeItemIdentifier[] = [];

    public static fromJsonFile(allRootPaths: string[], jsonFile: string) {
        try {
            let label = jsonFile;
            for (let i = 0; i < allRootPaths.length; i++) {
                label = label.replace(allRootPaths[i], '');
            }

            if (label.startsWith('/') || label.startsWith('\\')) {
                label = label.substr(1);
            }

            const jsonFileContents = fs.readFileSync(jsonFile, { encoding: 'utf8' });
            const contents = JSON.parse(jsonFileContents);
            const parsedWallet = new wallet.Wallet(contents);
            const result = new WalletTreeItemIdentifier(jsonFile, label, parsedWallet.name);
            if ((parsedWallet.name !== 'myWallet') || (parsedWallet.accounts && parsedWallet.accounts.length)) {
                for (let i = 0; i < parsedWallet.accounts.length; i++) {
                    const accountRef = new WalletExplorerWallet(parsedWallet, parsedWallet.accounts[i], label, parsedWallet.name);
                    result.children.push(
                        new WalletTreeItemIdentifier(jsonFile, label, parsedWallet.name, i, parsedWallet.accounts[i].label, accountRef));
                }
                return result;
            } else {
                return undefined;
            }
        } catch(e) {
            return undefined;
        }
    }

    private constructor(
        public readonly jsonFile: string,
        public readonly jsonFileName: string,
        public readonly label?: string,
        public readonly index?: number,
        public readonly accountLabel?: string,
        public readonly accountRef?: WalletExplorerWallet) {
    }

    public asTreeItem() : vscode.TreeItem {
        const treeItemLabel = (this.index !== undefined) ?
            (this.accountLabel || 'Account #' + this.index) :
            (this.label || path.basename(this.jsonFile));
        const result = new vscode.TreeItem(treeItemLabel, (this.index !== undefined) ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Expanded);
        result.description = (this.index !== undefined) ? '' : this.jsonFileName;
        result.iconPath = (this.index !== undefined) ? vscode.ThemeIcon.File : vscode.ThemeIcon.Folder;
        result.tooltip = (this.index !== undefined) ? '' : 'Wallet loaded from: ' + this.jsonFile;
        result.contextValue = (this.index !== undefined) ? '' : 'cancreate';
        if (this.index !== undefined) {
            result.command = {
                title: 'Open wallet',
                command: 'neo-visual-devtracker.openWallet',
                arguments: [ this.jsonFile ],
            };
        }
        return result;
    }

    public async createAccount() {
        if (this.jsonFile) {
            const jsonFileContents = fs.readFileSync(this.jsonFile, { encoding: 'utf8' });
            const contents = JSON.parse(jsonFileContents);
            const parsedWallet = new wallet.Wallet(contents);
            const passphrase = await vscode.window.showInputBox({
                prompt: 'Enter the passphrase for ' + path.basename(this.jsonFile),
                password: true,
                ignoreFocusOut: true,
            });
            if (passphrase) {
                let decrypted = false;
                try {
                    decrypted = (await parsedWallet.decryptAll(passphrase)).reduce((a, b)=> a && b, true);
                } catch (e) {
                    console.error('Wallet decryption error', this.jsonFile, e);
                }
                if (decrypted) {
                    const accountName = await vscode.window.showInputBox({
                        prompt: 'Enter a name for the new account',
                        ignoreFocusOut: true,
                    });
                    if (accountName) {
                        const account = new wallet.Account(wallet.generatePrivateKey());
                        account.label = accountName;
                        parsedWallet.addAccount(account);
                        if (await parsedWallet.encryptAll(passphrase)) {
                            fs.writeFileSync(this.jsonFile, JSON.stringify(parsedWallet.export(), undefined, 4));
                        } else {
                            vscode.window.showErrorMessage('The wallet file could not be encrypted using the supplied passphrase, the account was not added.', { modal: true });
                        }
                    }
                } else {
                    vscode.window.showErrorMessage('The passphrase supplied was incorrect.', { modal: true });
                }
            }
        }
    }
}

export class WalletExplorer implements vscode.TreeDataProvider<WalletTreeItemIdentifier> {

    private readonly onDidChangeTreeDataEmitter: vscode.EventEmitter<any>;
    private readonly fileSystemWatcher: vscode.FileSystemWatcher;
    private readonly searchPattern: vscode.GlobPattern = '**/*.json';
    
    public readonly allAccounts: WalletExplorerWallet[] = [];
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
        this.allAccounts.length = 0;

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
                for (let j = 0; j < walletFromJson.children.length; j++) {
                    this.allAccounts.push(walletFromJson.children[j].accountRef as WalletExplorerWallet);
                }
                this.onDidChangeTreeDataEmitter.fire();
            }
        }
	}

	public getTreeItem(element: WalletTreeItemIdentifier): vscode.TreeItem {
        return element.asTreeItem();
	}

	public getChildren(element?: WalletTreeItemIdentifier): WalletTreeItemIdentifier[] {
        if (element) {
            return element.children;
        } else {
            return this.rootItems;
        }
	}

	public getParent(element: WalletTreeItemIdentifier) {
		return undefined;
    }

    public static async newWalletFile() {
        const walletName = await vscode.window.showInputBox({
            prompt: 'Enter a name for the new wallet',
            ignoreFocusOut: true,
        });
        if (walletName) {
            const passphrase = await vscode.window.showInputBox({
                prompt: 'Choose a passphrase to encrypt account keys in the new wallet',
                password: true,
                ignoreFocusOut: true,
            });
            if (passphrase) {
                const newWallet = new wallet.Wallet({ name: walletName });
                const account = new wallet.Account(wallet.generatePrivateKey());
                account.label = 'Default account';
                account.isDefault = true;
                newWallet.addAccount(account);
                if (await newWallet.encryptAll(passphrase)) {
                    const textDocument = await vscode.workspace.openTextDocument({
                        language: 'jsonc',
                        content: JSON.stringify(newWallet.export(), undefined, 4),
                    });
                    vscode.window.showTextDocument(textDocument);
                    vscode.window.showInformationMessage(NewWalletFileInstructions, { modal: true });
                } else {
                    vscode.window.showErrorMessage('A new wallet file could not be encrypted using the supplied passphrase.', { modal: true });
                }
            }       
        }
    }
}