import * as fs from 'fs';
import * as neon from '@cityofzion/neon-js';
import * as path from 'path';
import * as vscode from 'vscode';

import { deployEvents } from './panels/deployEvents';

import { ContractDetector } from './contractDetector';
import { ContractParameterType } from './contractParameterType';
import { NeoExpressConfig } from './neoExpressConfig';
import { WalletExplorer } from './walletExplorer';

const JavascriptHrefPlaceholder : string = '[JAVASCRIPT_HREF]';
const CssHrefPlaceholder : string = '[CSS_HREF]';

class ViewState {
    contracts: any[] = [];
    contractPath?: string = undefined;
    contractName?: string = undefined;
    contractHash?: string = undefined;
    contractAvmHex?: string = undefined;
    contractMetadata: any = {};
    isValid: boolean = false;
    result: string = '';
    showError: boolean = false;
    showSuccess: boolean = false;
    walletAddress?: string = undefined;
    wallets: any[] = [];
}

export class DeployPanel {

    private readonly contractDetector: ContractDetector;
    private readonly neoExpressConfig?: NeoExpressConfig;
    private readonly panel: vscode.WebviewPanel;
    private readonly rpcUri: string;
    private readonly walletExplorer: WalletExplorer;

    private viewState: ViewState;
    private initialized: boolean = false;

    constructor(
        extensionPath: string,
        rpcUri: string,
        walletExplorer: WalletExplorer,
        contractDetector: ContractDetector,
        disposables: vscode.Disposable[],
        neoExpressConfig?: NeoExpressConfig) {

        this.contractDetector = contractDetector;
        this.rpcUri = rpcUri;
        this.walletExplorer = walletExplorer;
        this.neoExpressConfig = neoExpressConfig;
        this.viewState = new ViewState();

        this.panel = vscode.window.createWebviewPanel(
            'deployPanel',
            (this.neoExpressConfig ? this.neoExpressConfig.basename : this.rpcUri) + ' - Deploy contract',
            vscode.ViewColumn.Active,
            { enableScripts: true });
        this.panel.iconPath = vscode.Uri.file(path.join(extensionPath, 'resources', 'neo.svg'));
        this.panel.webview.onDidReceiveMessage(this.onMessage, this, disposables);

        const htmlFileContents = fs.readFileSync(
            path.join(extensionPath, 'src', 'panels', 'deploy.html'), { encoding: 'utf8' });
        const javascriptHref : string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panels', 'bundles', 'deploy.main.js'))) + '';
        const cssHref : string = this.panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'out', 'panels', 'deploy.css'))) + '';
        this.panel.webview.html = htmlFileContents
            .replace(JavascriptHrefPlaceholder, javascriptHref)
            .replace(CssHrefPlaceholder, cssHref);
    }

    public dispose() {
        this.panel.dispose();
    }

    private async doDeploy() {
        if (await this.ensureMetadata()) {
            try {
                // Determine flags: { none: 0x00, storage: 0x01, dynamic: 0x02, storage+dynamic: 0x03 }
                let flags = 0x00; 
                if (this.viewState.contractMetadata['has-storage']) {
                    if (this.viewState.contractMetadata['has-dynamic-invoke']) {
                        flags = 0x03;
                    } else {
                        flags = 0x01;
                    }
                } else if (this.viewState.contractMetadata['has-dynamic-invoke']) {
                    flags = 0x02;
                }

                // Construct a script that calls Neo.Contract.Create
                //   -- see: https://docs.neo.org/docs/en-us/reference/scapi/fw/dotnet/neo/Contract/Create.html
                const sb = neon.default.create.scriptBuilder();
                const script = sb
                    .emitPush(neon.default.u.str2hexstring(this.viewState.contractMetadata.description))
                    .emitPush(neon.default.u.str2hexstring(this.viewState.contractMetadata.email))
                    .emitPush(neon.default.u.str2hexstring(this.viewState.contractMetadata.author))
                    .emitPush(neon.default.u.str2hexstring(this.viewState.contractMetadata.version))
                    .emitPush(neon.default.u.str2hexstring(this.viewState.contractMetadata.title))
                    .emitPush(flags)
                    .emitPush(this.viewState.contractMetadata.entrypointReturnTypeHex)
                    .emitPush(this.viewState.contractMetadata.entrypointParameterTypesHex)
                    .emitPush(this.viewState.contractAvmHex)
                    .emitSysCall('Neo.Contract.Create')
                    .str;

                // Determine required GAS:
                const rpcClient = new neon.rpc.RPCClient(this.rpcUri);
                const invokeResult = await rpcClient.invokeScript(script);
                const gas = parseFloat(invokeResult.gas_consumed);

                const walletConfig = this.viewState.wallets.filter(_ => _.address === this.viewState.walletAddress)[0];
                if (await walletConfig.unlock()) {
                    const api = new neon.api.neoCli.instance(this.rpcUri);
                    const config = {
                        api: api,
                        script: script,
                        account: walletConfig.account,
                        signingFunction: walletConfig.signingFunction,
                        gas: gas,
                    };
                    const result = await neon.default.doInvoke(config);
                    if (result.response && result.response.txid) {
                        this.viewState.result = result.response.txid;
                        this.viewState.showError = false;
                        this.viewState.showSuccess = true;
                    } else {
                        this.viewState.result = 'No response from RPC server; contract may not have deployed';
                        this.viewState.showError = true;
                        this.viewState.showSuccess = false;
                    }
                }
            } catch (e) {
                this.viewState.result = 'Error deploying contract: ' + e;
                this.viewState.showError = true;
                this.viewState.showSuccess = false;
            }
        }
    }

    private async ensureMetadata() {
        const stringFields = [ 'description', 'email', 'author', 'version', 'title' ];
        const flagFields = [ 
            [ 'has-storage', 'storage' ],
            [ 'has-dynamic-invoke', 'dynamic invoke' ],
        ];
        const missingStringFields = stringFields.filter(_ => this.viewState.contractMetadata[_] === undefined);
        const missingFlagFields = flagFields.filter(_ => this.viewState.contractMetadata[_[0]] === undefined);
        const missingReturnType = !this.viewState.contractMetadata.entrypointReturnTypeHex;
        const missingParmeterTypes = this.viewState.contractMetadata.entrypointParameterTypesHex === undefined;
        if (missingStringFields.length || missingFlagFields.length || missingReturnType || missingParmeterTypes) {
            if (await this.promptForBooleanOrCancel('Some contract metadata is missing. Would you like to provide the missing metadata manually?', false)) {
                for (let i = 0; i < missingStringFields.length; i++) {
                    this.viewState.contractMetadata[missingStringFields[i]] = 
                        await vscode.window.showInputBox({ 
                            placeHolder: 'Enter the contract ' + missingStringFields[i],
                            prompt: 'Leave blank to omit',
                            ignoreFocusOut: true,
                        });
                    if (this.viewState.contractMetadata[missingStringFields[i]] === undefined) {
                        return false; // user canceled
                    }
                }
                for (let i = 0; i < missingFlagFields.length; i++) {
                    this.viewState.contractMetadata[missingFlagFields[i][0]] = 
                        await this.promptForBooleanOrCancel('Yes or no, does this contract use ' + missingFlagFields[i][1] + '?', true);
                    if (this.viewState.contractMetadata[missingFlagFields[i][0]] === undefined) {
                        return false; // user canceled
                    }
                }
                if (missingReturnType) {
                    this.viewState.contractMetadata.entrypointReturnTypeHex = 
                        await ContractParameterType.promptForTypeHex('What is the contract return type? (Press \'Escape\' to abort the deployment)');
                    if (!this.viewState.contractMetadata.entrypointReturnTypeHex) {
                        return false;
                    }
                }
                if (missingParmeterTypes) {
                    this.viewState.contractMetadata.entrypointParameterTypesHex = 
                        await ContractParameterType.promptForTypeHexList(
                            'What is the type of parameter ##? (Press \'Escape\' to abort the deployment)', 
                            '(no more parameters)');
                    if (this.viewState.contractMetadata.entrypointParameterTypesHex === undefined) {
                        return false;
                    }
                }
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    }

    private async onMessage(message: any) {
        if (message.e === deployEvents.Init) {
            await this.refresh(false);
            await this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === deployEvents.Refresh) {
            await this.refresh(true);
            await this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === deployEvents.Update) {
            this.viewState = message.c;
            await this.refresh(true);
            await this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === deployEvents.Deploy) {
            await this.refresh(true);
            if (this.viewState.isValid) {
                await this.doDeploy();
            }
            await this.panel.webview.postMessage({ viewState: this.viewState });
        } else if (message.e === deployEvents.Close) {
            this.dispose();
        } else if (message.e === deployEvents.NewWallet) {
            this.initialized = false; // cause wallet list to be refreshed when this panel is next initialized
            vscode.commands.executeCommand('neo-visual-devtracker.createWalletFile');
        }
    }

    private async promptForBooleanOrCancel(prompt: string, allowNo: boolean): Promise<boolean | undefined> {
        prompt = prompt + '\r\n\r\nUnsure? Select \'Cancel\' to abort the contract deployment.\r\n';
        const input = allowNo ?
            (await vscode.window.showInformationMessage(prompt, { modal: true }, 'No', 'Yes')) :
            (await vscode.window.showInformationMessage(prompt, { modal: true }, 'Yes'));
        if (input === undefined) {
            return undefined;
        }
        return input === 'Yes';
    }

    private async refresh(force: boolean) {
        if (!force && this.initialized) {
            return;
        }

        this.viewState.showError = false;
        this.viewState.showSuccess = false;

        this.viewState.wallets = [];
        if (this.neoExpressConfig) {
            this.neoExpressConfig.refresh();
            this.viewState.wallets = this.neoExpressConfig.wallets.slice();
        }
        
        for (let i = 0; i < this.walletExplorer.allAccounts.length; i++) {
            this.viewState.wallets.push(this.walletExplorer.allAccounts[i]);
        }

        const walletConfig = this.viewState.wallets.filter(_ => _.address === this.viewState.walletAddress)[0];
        if (!walletConfig) {
            this.viewState.walletAddress = undefined;
        }

        await this.contractDetector.refresh();
        this.viewState.contracts = this.contractDetector.contracts;

        const contractConfig = this.viewState.contracts.filter(_ => _.path === this.viewState.contractPath)[0];
        if (!contractConfig) {
            this.viewState.contractPath = undefined;
            this.viewState.contractName = undefined;
            this.viewState.contractHash = undefined;
            this.viewState.contractAvmHex = undefined;
            this.viewState.contractMetadata = undefined;
        } else {
            this.viewState.contractName = contractConfig.name;
            this.viewState.contractHash = contractConfig.hash;
            this.viewState.contractAvmHex = contractConfig.avmHex;
            this.viewState.contractMetadata = contractConfig.metadata;
        }

        this.viewState.isValid =
            !!this.viewState.walletAddress &&
            !!this.viewState.contractPath;

        this.initialized = true;
    }

}