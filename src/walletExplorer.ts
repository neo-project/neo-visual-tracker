import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { IWallet } from './iWallet';
import { wallet } from '@cityofzion/neon-core';

const NewWalletFileInstructions = 'Save this JSON file anywhere in your workspace.';

class WalletExplorerAccount implements IWallet {

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

    public async unlock(): Promise<boolean> {
        const passphrase = await vscode.window.showInputBox({
            prompt: 'Enter the passphrase for ' + path.basename(this.filename),
            password: true,
            ignoreFocusOut: true,
        });
        if (passphrase) {
            try {
                return (await this.parsedWallet.decryptAll(passphrase)).reduce((a, b) => a && b, true);
            } catch (e) {
                console.error('Wallet decryption error', this.filename, e);
            }
        }
        return false;
    }
}

class WalletExplorerWallet {

    public readonly children: WalletExplorerAccount[] = [];

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
            const result = new WalletExplorerWallet(jsonFile, label, parsedWallet.name);
            if (parsedWallet.accounts && parsedWallet.accounts.length) {
                for (let i = 0; i < parsedWallet.accounts.length; i++) {
                    result.children.push(
                        new WalletExplorerAccount(parsedWallet, parsedWallet.accounts[i], label, parsedWallet.name));
                }
                return result;
            } else {
                return undefined;
            }
        } catch (e) {
            return undefined;
        }
    }

    private constructor(
        public readonly jsonFile: string,
        public readonly jsonFileName: string,
        public readonly label?: string) {
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
                    decrypted = (await parsedWallet.decryptAll(passphrase)).reduce((a, b) => a && b, true);
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

export class WalletExplorer implements vscode.CodeLensProvider {

    private readonly onDidChangeCodeLensesEmitter: vscode.EventEmitter<void>;
    private readonly fileSystemWatcher: vscode.FileSystemWatcher;
    private readonly searchPattern: vscode.GlobPattern = '**/*.json';

    public readonly allAccounts: WalletExplorerAccount[] = [];
    public readonly onDidChangeCodeLenses: vscode.Event<void>;

    private rootItems: WalletExplorerWallet[];

    constructor() {
        this.onDidChangeCodeLensesEmitter = new vscode.EventEmitter<void>();
        this.onDidChangeCodeLenses = this.onDidChangeCodeLensesEmitter.event;
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

    public getWalletForFile(uri: vscode.Uri): WalletExplorerWallet | undefined {
        return this.rootItems.filter(_ => _.jsonFile === uri.fsPath)[0];
    }

    public async refresh() {
        this.rootItems = [];
        this.allAccounts.length = 0;

        this.onDidChangeCodeLensesEmitter.fire();

        let allRootPaths: string[] = [];
        if (vscode.workspace.workspaceFolders) {
            allRootPaths = vscode.workspace.workspaceFolders.map(_ => _.uri.fsPath);
        }

        const allJsonFiles = await vscode.workspace.findFiles('**/*.json');
        for (let i = 0; i < allJsonFiles.length; i++) {
            const walletFromJson = WalletExplorerWallet.fromJsonFile(
                allRootPaths,
                allJsonFiles[i].fsPath);
            if (walletFromJson) {
                this.rootItems.push(walletFromJson);
                for (let j = 0; j < walletFromJson.children.length; j++) {
                    this.allAccounts.push(walletFromJson.children[j] as WalletExplorerAccount);
                }
                this.onDidChangeCodeLensesEmitter.fire();
            }
        }
    }

    public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens[]> {
        for (let i = 0; i < this.rootItems.length; i++) {
            const item = this.rootItems[i];
            if (item.jsonFile === document.fileName) {
                return [
                    new vscode.CodeLens(
                        new vscode.Range(0, 0, 0, 0),
                        { 
                            command: 'neo-visual-devtracker.createAccount', 
                            title: 'Click to add an additional account to this NEP-6 wallet', 
                            arguments: [ item ],
                        }
                    ),
                ];
            }
        }
        
        return [];
    }

    public static async newWalletFile(locationHint: string | undefined) {
        const walletName = await vscode.window.showInputBox({
            prompt: 'Enter a name for the new wallet (e.g. testWallet)',
            ignoreFocusOut: true,
        });
        if (!walletName) {
            return;
        }

        const passphrase = await vscode.window.showInputBox({
            prompt: 'Choose a passphrase to encrypt account keys in the new wallet',
            password: true,
            ignoreFocusOut: true,
        });
        if (!passphrase) {
            return;
        }

        const newWallet = new wallet.Wallet({ name: walletName });
        const account = new wallet.Account(wallet.generatePrivateKey());
        account.label = 'Default account';
        account.isDefault = true;
        newWallet.addAccount(account);
        if (!(await newWallet.encryptAll(passphrase))) {
            vscode.window.showErrorMessage('A new wallet file could not be encrypted using the supplied passphrase.', { modal: true });
            return;
        }

        let fullPathToNewFile: string | undefined = undefined;
        try {
            if (locationHint) {
                if (!fs.statSync(locationHint).isDirectory()) {
                    locationHint = path.dirname(locationHint);
                } 
                fullPathToNewFile = path.join(locationHint, walletName.replace(/[^-_.a-z0-9]/gi, '-') + '.neo-wallet.json');
                if (fs.existsSync(fullPathToNewFile)) {
                    console.warn('Wallet file exists; prompting user to save manually to avoid accidental overwrite', fullPathToNewFile);
                    fullPathToNewFile = undefined;
                }
            }
        } catch (e) {
            console.warn('Error determining filename for new wallet, user must save manually', locationHint, fullPathToNewFile, e);
            fullPathToNewFile = undefined;
        }

        const content = JSON.stringify(newWallet.export(), undefined, 4);

        if (fullPathToNewFile) {
            try {
                fs.writeFileSync(fullPathToNewFile, content);
                const textDocument = await vscode.workspace.openTextDocument(fullPathToNewFile);
                vscode.window.showTextDocument(textDocument);
                return;
            } catch (e) {
                console.warn('Error saving new wallet to', fullPathToNewFile, '(user must save manually)', e);
            }
        }

        const textDocument = await vscode.workspace.openTextDocument({ language: 'json', content: content });
        vscode.window.showTextDocument(textDocument);
        vscode.window.showInformationMessage(NewWalletFileInstructions, { modal: true });
    }
}