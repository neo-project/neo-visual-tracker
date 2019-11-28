import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as shellEscape from 'shell-escape';
import * as vscode from 'vscode';

import { claimEvents } from './panels/claimEvents';

const JavascriptHrefPlaceholder : string = '[JAVASCRIPT_HREF]';
const CssHrefPlaceholder : string = '[CSS_HREF]';

class ViewState {
    claimable: number = 0;
    getClaimableError: boolean = false;
    isValid: boolean = false;
    neoExpressJsonFullPath: string = '';
    result: string = '';
    showError: boolean = false;
    showSuccess: boolean = false;
    wallet?: string = undefined;
    wallets: string[] = [];
}

export class ClaimPanel {

    private readonly panel: vscode.WebviewPanel;

    private viewState: ViewState;
    private initialized: boolean = false;

    constructor(
        extensionPath: string,
        neoExpressJsonFullPath: string,
        disposables: vscode.Disposable[]) {

        this.viewState = new ViewState();
        this.viewState.neoExpressJsonFullPath = neoExpressJsonFullPath;

        this.panel = vscode.window.createWebviewPanel(
            'claimPanel',
            path.basename(neoExpressJsonFullPath) + ' - Claim GAS',
            vscode.ViewColumn.Active,
            { enableScripts: true });
        this.panel.iconPath = vscode.Uri.file(path.join(extensionPath, 'resources', 'neo.svg'));
        this.panel.webview.onDidReceiveMessage(this.onMessage, this, disposables);

        const htmlFileContents = fs.readFileSync(
            path.join(extensionPath, 'src', 'panels', 'claim.html'), { encoding: 'utf8' });
        const javascriptHref : string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panels', 'claimBundle.js'))) + '';
        const cssHref : string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panels', 'claim.css'))) + '';
        this.panel.webview.html = htmlFileContents
            .replace(JavascriptHrefPlaceholder, javascriptHref)
            .replace(CssHrefPlaceholder, cssHref);
    }

    public dispose() {
        this.panel.dispose();
    }

    private async doClaim() {
        try {
            this.viewState.showError = false;
            this.viewState.showSuccess = false;
            let command = shellEscape.default(['neo-express', 'claim']);
            command += ' -i ' + ClaimPanel.doubleQuoteEscape(this.viewState.neoExpressJsonFullPath);
            command += ' GAS';
            command += ' ' + ClaimPanel.doubleQuoteEscape(this.viewState.wallet || 'unknown');
            const output = await new Promise((resolve, reject) => {
                childProcess.exec(command, (error, stdout, stderr) => {
                    if (error) {
                        reject(error);
                    } else if (stderr) {
                        reject(stderr);
                    } else {
                        resolve(stdout);
                    }
                });
            });
            console.info('Claim completed', command, output);
            this.viewState.showSuccess = true;
            this.viewState.result = command;
        } catch (e) {
            this.viewState.showError = true;
            this.viewState.result = 'The claim failed. Please confirm that the account has claimable GAS and the correct Neo Express instance is running, then try again.';
            console.error('Claim failed ', e);
        }
    }

    private async onMessage(message: any) {
        if (message.e === claimEvents.Init) {
            await this.refresh(false);
            await this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === claimEvents.Refresh) {
            await this.refresh(true);
            await this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === claimEvents.Update) {
            this.viewState = message.c;
            await this.refresh(true);
            await this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === claimEvents.Claim) {
            await this.doClaim();
            await this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === claimEvents.Close) {
            this.dispose();
        }
    }

    private async refresh(force: boolean) {
        if (!force && this.initialized) {
            return;
        }

        this.viewState.showError = false;
        this.viewState.showSuccess = false;

        this.viewState.wallets = [ 'genesis' ];
        try {
            const jsonFileContents = fs.readFileSync(this.viewState.neoExpressJsonFullPath, { encoding: 'utf8' });
            const neoExpressConfig = JSON.parse(jsonFileContents);
            const wallets = neoExpressConfig.wallets || [];
            for (let i = 0; i < wallets.length; i++) {
                if (wallets[i].name) {
                    this.viewState.wallets.push(wallets[i].name);
                }
            }
        } catch (e) {
            console.error('ClaimPanel encountered an error parsing ', this.viewState.neoExpressJsonFullPath, e);
        }

        this.viewState.claimable = 0;
        if (this.viewState.wallet) {
            try {
                let command = shellEscape.default(['neo-express', 'show', 'claimable']);
                command += ' -i ' + ClaimPanel.doubleQuoteEscape(this.viewState.neoExpressJsonFullPath);
                command += ' ' + ClaimPanel.doubleQuoteEscape(this.viewState.wallet);
                const claimableJson = await new Promise((resolve, reject) => {
                    childProcess.exec(command, (error, stdout, stderr) => {
                        if (error) {
                            reject(error);
                        } else if (stderr) {
                            reject(stderr);
                        } else {
                            resolve(stdout);
                        }
                    });
                });
                this.viewState.claimable = JSON.parse(claimableJson as string).unclaimed || 0;
                this.viewState.getClaimableError = false;
            } catch (e) {
                this.viewState.getClaimableError = true;
                console.error('Could not get claimable assets for ', this.viewState.wallet, e);
            }
        }
        
        if (this.viewState.wallet && this.viewState.wallets.indexOf(this.viewState.wallet) === -1) {
            this.viewState.wallet = undefined;
            this.viewState.claimable = 0;
        }

        this.viewState.isValid =
            !!this.viewState.wallet &&
            (this.viewState.claimable > 0) &&
            !this.viewState.getClaimableError;

        this.initialized = true;
    }

    private static doubleQuoteEscape(argument: string) {
        let escaped = shellEscape.default([ argument ]);
        if ((escaped.length >= 2) && 
            (escaped[0] === '\'') && 
            (escaped[escaped.length - 1] === '\'')) {
            escaped = '"' + escaped.substring(1, escaped.length - 1).replace(/"/g, '\\"') + '"';
        }
        return escaped;
    }

}