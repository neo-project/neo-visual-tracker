import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { IWallet } from './iWallet';
import { wallet } from '@cityofzion/neon-core';

const NewWalletFileInstructions = 'Save this JSON file anywhere in your workspace.';

const ContinueWithoutPassphrase = 'Continue without protecting the wallet with a password?\r\n\r\n(Anyone with access to the wallet file will be able to easily retrieve the private key.)\r\n';

const WrongPassword = undefined;

const BlankPassphrase = '';

const unlockWalletAndReturnPassphrase = async function(
    fullPath: string, 
    parsedWallet: wallet.Wallet): Promise<string | undefined> {
    
    // First, try and unlock with a blank passphrase:
    try {
        if ((await parsedWallet.decryptAll(BlankPassphrase)).reduce((a, b) => a && b, true)) {
            return BlankPassphrase;
        }
    } catch(e) {
    }

    // If passphrase is not blank, prompt user for input:
    const passphrase = await vscode.window.showInputBox({
        prompt: 'Enter the passphrase for ' + path.basename(fullPath),
        password: true,
        ignoreFocusOut: true,
    });

    if (passphrase) {
        try {
            if ((await parsedWallet.decryptAll(passphrase)).reduce((a, b) => a && b, true)) {
                return passphrase;
            } else {
                return WrongPassword;
            }
        } catch (e) {
            console.error('Wallet decryption error', fullPath, e);
        }
    }

    return WrongPassword;
};

const promptForNewPassphrase = async function(): Promise<string | undefined> {
    let passphrase: string | undefined = undefined;
    while (passphrase === undefined) {

        // Prompt for passphrase (a blank passphrase is Ok if the user accepts the security warning):
        passphrase = await vscode.window.showInputBox({
            prompt: 'Choose a passphrase to encrypt account keys in the new wallet',
            password: true,
            ignoreFocusOut: true,
        });
        if (passphrase === BlankPassphrase) {
            const selection = (await vscode.window.showWarningMessage(ContinueWithoutPassphrase, { modal: true }, 'No', 'Yes'));
            if ('No' === selection) {
                passphrase = undefined; // Cause passphrase prompt to re-appear.
            } else if (!selection) {
                return; // User selected 'Cancel'; abort.
            }
        } else if (!passphrase) {
            return; // User pressed 'Escape'; abort.
        }

        // If a passphrase has been chosen (and it is non-blank), re-prompt for confirmation:
        if ((passphrase !== undefined) && (passphrase !== BlankPassphrase)) {
            const passphraseConfirmation = await vscode.window.showInputBox({
                prompt: 'Please re-enter the passphrase (for confirmation)',
                password: true,
                ignoreFocusOut: true,
            });
            if (passphraseConfirmation || (passphraseConfirmation === BlankPassphrase)) {
                if (passphraseConfirmation !== passphrase) {
                    passphrase = undefined; // Confirmation did not match original entry; restart.
                    if ('Ok' !== await vscode.window.showWarningMessage('The passphrases that you entered did not match, please try again', { modal: true }, 'Ok')) {
                        return; // User selected 'Cancel'; abort.
                    }
                }
            } else {
                return; // User pressed 'Escape'; abort.
            }
        }
    }

    return passphrase;
};

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
        return (await unlockWalletAndReturnPassphrase(this.filename, this.parsedWallet)) !== WrongPassword;
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
            const passphrase = await unlockWalletAndReturnPassphrase(this.jsonFile, parsedWallet);
            if (passphrase === WrongPassword) {
                vscode.window.showErrorMessage('The passphrase supplied was incorrect.', { modal: true });
            } else {
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
        let walletName: string | undefined = undefined;
        while (!walletName) {
            walletName = await vscode.window.showInputBox({ prompt: 'Enter a name for the new wallet', ignoreFocusOut: true });
            if (walletName === '') {
                const selection = (await vscode.window.showWarningMessage('The wallet name cannot be empty', { modal: true }, 'Ok'));
                if (!selection) {
                    return; // User selected 'Cancel'; abort.
                }
            } else if (!walletName) {
                return; // User pressed 'Escape'; abort.
            }
        }

        const passphrase = await promptForNewPassphrase();
        if (!passphrase && (passphrase !== BlankPassphrase)) {
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