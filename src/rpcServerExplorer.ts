import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as vscode from 'vscode';

import { RpcConnectionPool } from './rpcConnectionPool';

const request = util.promisify(require('request'));

const TemplateServerList = `{
    "neo-rpc-uris": [
        "http://seed2.ngd.network:10332",
        "http://127.0.0.1:49154"
    ],
    "neo-blockchain-names": {
        "4661f92562043b8cf39caa79a9f0de1ed462371aec26746c0998225fa5b8b2ca": "My Private Net"
    }
}`;

const TemplateInstructionsFirstRun = 'To add custom RPC servers, save a JSON file anywhere in your workspace.\r\n\r\n' + 
    'In the file you can provide a list of URLs for custom RPC servers and a friendly name for any private blockchains used ' + 
    '(private blockchains are identified by the hash of their genesis block).\r\n\r\n' +
    'An example file is being shown.\r\n';

const TemplateInstructionsSecondRun = 'To update custom RPC servers, edit your JSON server list.\r\n\r\n' + 
    'In this file you can provide a list of URLs for custom RPC servers and a friendly name for any private blockchains used ' + 
    '(private blockchains are identified by the hash of their genesis block).\r\n';

const MainNetServerListUrl = 'https://api.neoscan.io/api/main_net/v1/get_all_nodes';

const TestNetServerListUrl = 'https://neoscan-testnet.io/api/main_net/v1/get_all_nodes';

const MainNetGenesisBlock = 'd42561e3d30e15be6400b6df2f328e02d2bf6354c41dce433bc57687c82144bf';

const TestNetGenesisBlock = 'b3181718ef6167105b70920e4a8fbbd0a0a56aacf460d70e10ba6fa1668f1fef';

const parseNeoServersJsonFile = function(jsonFile: string) {
    try {
        const jsonFileContents = fs.readFileSync(jsonFile, { encoding: 'utf8' });
        const contents = JSON.parse(jsonFileContents);
        if (contents && (contents['neo-rpc-uris'] || contents['neo-blockchain-names'])) {
            if (!contents['neo-rpc-uris'] || !contents['neo-rpc-uris'].length) {
                contents['neo-rpc-uris'] = [];
            }
            if (!contents['neo-blockchain-names']) {
                contents['neo-blockchain-names'] = {};
            }
            return contents;
        }
    } catch(e) {
    }
    return undefined;
};

export class RpcServerTreeItemIdentifier {

    public readonly children: RpcServerTreeItemIdentifier[];

    public static fromUriFetcher(extensionPath: string, label: string, uriFetch: Promise<string[]>, onUpdate: Function) {
        const result = new RpcServerTreeItemIdentifier(undefined, undefined, undefined, label, undefined, undefined, 'url');
        result.iconPath = vscode.Uri.file(path.join(extensionPath, 'resources', 'neo.svg'));
        uriFetch.then(uris => {
            for (let i = 0; i < uris.length; i++) {
                try { 
                    result.children.push(RpcServerTreeItemIdentifier.fromUri(
                        uris[i], 
                        vscode.Uri.parse(uris[i]).authority, 
                        result));
                } catch (e) {
                    console.error('Error adding', uris[i], 'to', label, e);
                }
            }
            result.children.sort((a, b) => (a.label || '') > (b.label || '') ? 1 : -1);
            onUpdate();
        }).catch(e => {
            console.error('Error populating', label, e);
        });
        return result;
    }

    public static fromNeoExpressJsonFile(extensionPath: string, allRootPaths: string[], jsonFile: string) {
        try {
            let label = jsonFile;
            for (let i = 0; i < allRootPaths.length; i++) {
                label = label.replace(allRootPaths[i], '');
            }
            if (label.startsWith('/') || label.startsWith('\\')) {
                label = label.substr(1);
            }
            label = path.basename(label).replace(/\.json$/, '');

            const result = new RpcServerTreeItemIdentifier(jsonFile, undefined, undefined, 'Neo Express: ' + label, undefined, undefined);
            result.iconPath = vscode.Uri.file(path.join(extensionPath, 'resources', 'neo-express.svg'));
            const jsonFileContents = fs.readFileSync(jsonFile, { encoding: 'utf8' });
            const neoExpressConfig = JSON.parse(jsonFileContents);
            if (neoExpressConfig['consensus-nodes'] && neoExpressConfig['consensus-nodes'].length) {
                for (let i = 0; i < neoExpressConfig['consensus-nodes'].length; i++) {
                    const consensusNode = neoExpressConfig['consensus-nodes'][i];
                    if (consensusNode["rpc-port"]) {
                        const uri = 'http://127.0.0.1:' + consensusNode["rpc-port"];
                        const child = RpcServerTreeItemIdentifier.fromUri(uri, 'Node #' + (i + 1), result, jsonFile, i);
                        result.children.push(child);
                    }
                }
                return result;
            } else {
                return undefined;
            }
        } catch(e) {
            return undefined;
        }
    }

    public static fromUri(
        rpcUri: string, 
        label: string, 
        parent?: RpcServerTreeItemIdentifier,
        jsonFile?: string,
        index?: number) {

        return new RpcServerTreeItemIdentifier(jsonFile, rpcUri, parent, label, undefined, index);
    }

    public static forCustomBlockchain(extensionPath: string, label: string) {
        const result = new RpcServerTreeItemIdentifier(undefined, undefined, undefined, label, undefined, undefined, 'url');
        result.iconPath = vscode.Uri.file(path.join(extensionPath, 'resources', 'custom-blockchain.svg'));
        return result;
    }

    private constructor(
        public readonly jsonFile?: string, 
        public readonly rpcUri?: string, 
        public readonly parent?: RpcServerTreeItemIdentifier,
        public label?: string,
        public readonly description?: string,
        public readonly index?: number,
        public readonly contextValue?: string) {

        this.children = [];
        this.iconPath = vscode.ThemeIcon.File; // fallback to file icon if not specified
    }

    public iconPath: vscode.ThemeIcon | vscode.Uri;

    public asTreeItem() : vscode.TreeItem {
        if (this.rpcUri) { 
            // Individual node from a Neo Express configuration, or individual item from a JSON server list:
            const result = new vscode.TreeItem(this.label || this.rpcUri);
            result.iconPath = this.iconPath;
            result.description = this.rpcUri;
            result.command = {
                title: 'Open tracker',
                command: 'neo-visual-devtracker.openTracker',
                arguments: [ this ],
            };
            if (this.jsonFile && this.rpcUri.startsWith('http://127.0.0.1:')) {
                if (this.parent && (this.parent.children.length > 1)) {
                    result.contextValue = 'expressNodeMulti';
                } else {
                    result.contextValue = 'expressNode';
                }
            } else {
                result.contextValue = 'url';
            }
            return result;
        } else if (this.jsonFile) {
            // Neo Express configuration:
            const result = new vscode.TreeItem('' + this.label, vscode.TreeItemCollapsibleState.Expanded);
            result.iconPath = this.iconPath;
            result.description = this.description;
            result.tooltip = this.jsonFile;
            if (this.children.find(_ => _.jsonFile && _.rpcUri && _.rpcUri.startsWith('http://127.0.0.1:'))) {
                result.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
                if (this.children.length > 1) {
                    result.contextValue = 'expressNodeMulti';
                } else {
                    result.contextValue = 'expressNode';
                }
            }
            return result;
        } else {
            // Top-level group:
            const result = new vscode.TreeItem(
                '' + this.label, 
                this.contextValue === 'url' ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.Expanded);
            result.iconPath = this.iconPath;
            result.contextValue = this.contextValue;
            return result;
        }
    }
}

export class RpcServerExplorer implements vscode.TreeDataProvider<RpcServerTreeItemIdentifier> {

    private readonly onDidChangeTreeDataEmitter: vscode.EventEmitter<any>;
    private readonly fileSystemWatcher: vscode.FileSystemWatcher;
    private readonly searchPattern: vscode.GlobPattern = '**/*.json';
    
    public readonly onDidChangeTreeData: vscode.Event<any>;

    private rootItems: RpcServerTreeItemIdentifier[];

    private firstServerListFile?: string = undefined;

	constructor(private readonly extensionPath: string, private readonly connectionPool: RpcConnectionPool) { 
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
        const onUpdate = () => this.onDidChangeTreeDataEmitter.fire();
        const extensionPath = this.extensionPath;
        const allJsonFiles = await vscode.workspace.findFiles('**/*.json');
        const newRootItems = [];

        let allRootPaths: string[] = [];
        if (vscode.workspace.workspaceFolders) {
            allRootPaths = vscode.workspace.workspaceFolders.map(_ => _.uri.fsPath);
        }

        for (let i = 0; i < allJsonFiles.length; i++) {
            const neoExpressServerFromJson = RpcServerTreeItemIdentifier.fromNeoExpressJsonFile(
                this.extensionPath,
                allRootPaths,
                allJsonFiles[i].fsPath);
            if (neoExpressServerFromJson) {
                newRootItems.push(neoExpressServerFromJson);
            }
        }

        const mainNetNode = RpcServerTreeItemIdentifier.fromUriFetcher(
            this.extensionPath, 
            'Main Net', 
            RpcServerExplorer.getAllRpcServers(MainNetServerListUrl), 
            onUpdate);
        newRootItems.push(mainNetNode);

        const testNetNode = RpcServerTreeItemIdentifier.fromUriFetcher(
            this.extensionPath, 
            'Test Net', 
            RpcServerExplorer.getAllRpcServers(TestNetServerListUrl), 
            onUpdate);
        newRootItems.push(testNetNode);

        const otherBlockChains: Map<string, RpcServerTreeItemIdentifier> = new Map<string, RpcServerTreeItemIdentifier>();
        otherBlockChains.set(MainNetGenesisBlock, mainNetNode);
        otherBlockChains.set(TestNetGenesisBlock, testNetNode);
        
        const availableNodes = [ MainNetGenesisBlock, TestNetGenesisBlock ];
        const addCustomUrlToCorrectNode = function(genesisBlockHash: string, customUrl: vscode.Uri, jsonFile: string) {
            genesisBlockHash = genesisBlockHash.replace(/^0x/, '');
            let node = otherBlockChains.get(genesisBlockHash);
            if (!node) {
                let label = 'Unknown blockchain';
                if (genesisBlockHash.length > 8) {
                    label += ' - ...' + genesisBlockHash.substr(-8);
                }
                node = RpcServerTreeItemIdentifier.forCustomBlockchain(extensionPath, label);
                otherBlockChains.set(genesisBlockHash, node);
            }
            const urlNode = RpcServerTreeItemIdentifier.fromUri(customUrl.toString(), customUrl.authority, node);
            urlNode.iconPath = vscode.Uri.file(path.join(extensionPath, 'resources', 'custom-blockchain-server.svg')); 
            node.children.push(urlNode);
            node.children.sort((a, b) => (a.label || '') > (b.label || '') ? 1 : -1);
            if (availableNodes.indexOf(genesisBlockHash) === -1) { // Only add top-level tree nodes for blockchains with at least one URL
                newRootItems.push(node);
                availableNodes.push(genesisBlockHash);
            }
            onUpdate();
        };

        this.firstServerListFile = undefined;
        for (let i = 0; i < allJsonFiles.length; i++) {
            const jsonFile = allJsonFiles[i].fsPath;
            const customServers = parseNeoServersJsonFile(jsonFile);
            if (customServers) {
                this.firstServerListFile = this.firstServerListFile || jsonFile;
                const genesisBlockHashes = Object.keys(customServers['neo-blockchain-names']);
                for (let j = 0; j < genesisBlockHashes.length; j++) {
                    const genesisBlockHash = (genesisBlockHashes[j] + '').replace(/^0x/, '');
                    const blockchainName = customServers['neo-blockchain-names'][genesisBlockHash];
                    if (blockchainName) {
                        const node = otherBlockChains.get(genesisBlockHash);
                        if (!node) {
                            otherBlockChains.set(
                                genesisBlockHash,
                                RpcServerTreeItemIdentifier.forCustomBlockchain(this.extensionPath, blockchainName));
                        } else {
                            node.label = blockchainName;
                        }
                    }
                }
                const customUrls = customServers['neo-rpc-uris'];
                for (let j = 0; j < customUrls.length; j++) {
                    const customUrl = customUrls[j];
                    try {
                        const parsedUrl = vscode.Uri.parse(customUrl, true);
                        const connection = this.connectionPool.getConnection(customUrl);
                        connection.getBlock(0).then(block => {
                            addCustomUrlToCorrectNode(block.hash || '', parsedUrl, jsonFile);
                        }).catch(e => {
                            addCustomUrlToCorrectNode('', parsedUrl, jsonFile);
                        });
                    } catch (e) {
                        console.warn('Ignoring invalid URL in', jsonFile, customUrl);
                    }
                }
            }
        }
        
        this.rootItems = newRootItems;

        onUpdate();
	}

	public getTreeItem(element: RpcServerTreeItemIdentifier): vscode.TreeItem {
        return element.asTreeItem();
	}

	public getChildren(element?: RpcServerTreeItemIdentifier): RpcServerTreeItemIdentifier[] {
		if (element) {
            return element.children;
        } else {
            return this.rootItems;
        }
	}

	public getParent(element: RpcServerTreeItemIdentifier) {
		return element.parent;
    }

    public async customizeServerList() {
        if (this.firstServerListFile) {
            vscode.window.showTextDocument(vscode.Uri.file(this.firstServerListFile));
            vscode.window.showInformationMessage(TemplateInstructionsSecondRun);
        } else {
            const textDocument = await vscode.workspace.openTextDocument({
                language: 'json',
                content: TemplateServerList,
            });
            vscode.window.showTextDocument(textDocument);
            vscode.window.showInformationMessage(TemplateInstructionsFirstRun);
        }
    }

    private static async getAllRpcServers(apiUrl: string): Promise<string[]> {
        try {
            const apiResponse = JSON.parse((await request(apiUrl)).body);
            if (apiResponse && apiResponse.length) {
                return apiResponse.map((_: any) => _.url);
            } else {
                console.error('Unexpected API response when querying RPC servers ', apiUrl, apiResponse);
            }
        } catch(e) {
            console.error('Could not get an example RPC server from ', apiUrl, e);
        }
        return [];
    }

}