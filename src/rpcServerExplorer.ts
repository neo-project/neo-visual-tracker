import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as vscode from 'vscode';

const request = util.promisify(require('request'));

const TemplateServerList = `[
    {
        "name": "Neo Main Net",
        "url": "MAINNET_URL"
    },
    {
        "name": "Neo Test Net",
        "url": "TESTNET_URL"
    }
]`;

const MainNetPlaceholder = 'MAINNET_URL';

const TestNetPlaceholder = 'TESTNET_URL';

const TemplateInstructions = 'To add a group of RPC servers, create a JSON file anywhere in your workspace ' +
    '\n\nAn example file is being shown. Save this file to see the new servers appear in the list.';

const MainNetServerListUrl = 'https://api.neoscan.io/api/main_net/v1/get_all_nodes';

const TestNetServerListUrl = 'https://neoscan-testnet.io/api/main_net/v1/get_all_nodes';

class RpcServerTreeItemIdentifier {

    public readonly children: RpcServerTreeItemIdentifier[];

    public static fromChildren(label: string, contextValue: string, children: RpcServerTreeItemIdentifier[]) {
        const result = new RpcServerTreeItemIdentifier(undefined, undefined, undefined, label, undefined, undefined, contextValue);
        result.iconPath = vscode.ThemeIcon.Folder;
        for (let i = 0; i < children.length; i++) {
            result.children.push(children[i]);
        }
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

            const result = new RpcServerTreeItemIdentifier(jsonFile, undefined, undefined, label, 'Neo Express instance', undefined);
            result.iconPath = vscode.Uri.file(path.join(extensionPath, 'resources', 'neo.svg'));
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

    public static fromNeoServersJsonFile(extensionPath: string, allRootPaths: string[], jsonFile: string) {
        try {
            let label = jsonFile;
            for (let i = 0; i < allRootPaths.length; i++) {
                label = label.replace(allRootPaths[i], '');
            }
            if (label.startsWith('/') || label.startsWith('\\')) {
                label = label.substr(1);
            }
            label = path.basename(label).replace(/\.json$/, '');

            const result = new RpcServerTreeItemIdentifier(jsonFile, undefined, undefined, label, 'JSON server list', undefined);
            const jsonFileContents = fs.readFileSync(jsonFile, { encoding: 'utf8' });
            const contents = JSON.parse(jsonFileContents);
            if (contents && contents.length) {
                for (let i = 0; i < contents.length; i++) {
                    const server = contents[i];
                    if (server && server.url) {
                        const name = server.name || server.url;
                        const child = RpcServerTreeItemIdentifier.fromUri(server.url, name, result);
                        child.iconPath = vscode.Uri.file(path.join(extensionPath, 'resources', 'neo.svg'));
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
            onUpdate();
        }).catch(e => {
            console.error('Error populating', label, e);
        });
        return result;
    }

    private constructor(
        public readonly jsonFile?: string, 
        public readonly rpcUri?: string, 
        public readonly parent?: RpcServerTreeItemIdentifier,
        public readonly label?: string,
        public readonly description?: string,
        public readonly index?: number,
        public readonly contextValue?: string) {

        this.children = [];
        this.iconPath = vscode.ThemeIcon.File; // fallback to file icon if not specified
    }

    public iconPath: vscode.ThemeIcon | vscode.Uri;

    public asTreeItem(extensionPath: string) : vscode.TreeItem {
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
            if (this.rpcUri.startsWith('http://127.0.0.1:')) {
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
            // Neo Express configuration or JSON server list:
            const result = new vscode.TreeItem('' + this.label, vscode.TreeItemCollapsibleState.Expanded);
            result.iconPath = this.iconPath;
            result.description = this.description;
            result.tooltip = this.jsonFile;
            if (this.children.find(_ => _.rpcUri && _.rpcUri.startsWith('http://127.0.0.1:'))) {
                result.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
                if (this.children.length > 1) {
                    result.contextValue = 'expressNodeMulti';
                } else {
                    result.contextValue = 'expressNode';
                }
            } else {
                result.contextValue = 'editable';
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
        const onUpdate = () => this.onDidChangeTreeDataEmitter.fire();

        let allRootPaths: string[] = [];
        if (vscode.workspace.workspaceFolders) {
            allRootPaths = vscode.workspace.workspaceFolders.map(_ => _.uri.fsPath);
        }

        const newRootItems = [];
        const jsonServerLists = [];
        const allJsonFiles = await vscode.workspace.findFiles('**/*.json');
        for (let i = 0; i < allJsonFiles.length; i++) {
            const neoExpressServerFromJson = RpcServerTreeItemIdentifier.fromNeoExpressJsonFile(
                this.extensionPath,
                allRootPaths,
                allJsonFiles[i].fsPath);
            if (neoExpressServerFromJson) {
                newRootItems.push(neoExpressServerFromJson);
            }

            const neoServersFromJson = RpcServerTreeItemIdentifier.fromNeoServersJsonFile(
                this.extensionPath,
                allRootPaths,
                allJsonFiles[i].fsPath);
            if (neoServersFromJson) {
                jsonServerLists.push(neoServersFromJson);
            }
        }

        newRootItems.push(RpcServerTreeItemIdentifier.fromUriFetcher(this.extensionPath, 'Main Net', RpcServerExplorer.getAllRpcServers(MainNetServerListUrl), onUpdate));
        newRootItems.push(RpcServerTreeItemIdentifier.fromUriFetcher(this.extensionPath, 'Test Net', RpcServerExplorer.getAllRpcServers(TestNetServerListUrl), onUpdate));
        newRootItems.push(RpcServerTreeItemIdentifier.fromChildren('Server lists', 'customserverlists', jsonServerLists));
        this.rootItems = newRootItems;

        onUpdate();
	}

	public getTreeItem(element: RpcServerTreeItemIdentifier): vscode.TreeItem {
        return element.asTreeItem(this.extensionPath);
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
    
    public static async editJsonFile(item: RpcServerTreeItemIdentifier) {
        if (item.jsonFile) {
            const textDocument = await vscode.workspace.openTextDocument(vscode.Uri.file(item.jsonFile));
            vscode.window.showTextDocument(textDocument);
        }
    }

    public static async newServerList() {
        const testNetUrl = await RpcServerExplorer.getBestRpcServer(TestNetServerListUrl);
        const mainNetUrl = await RpcServerExplorer.getBestRpcServer(MainNetServerListUrl);
        const textDocument = await vscode.workspace.openTextDocument({
            language: 'json',
            content: TemplateServerList.replace(MainNetPlaceholder, mainNetUrl).replace(TestNetPlaceholder, testNetUrl),
        });
        vscode.window.showTextDocument(textDocument);
        vscode.window.showInformationMessage(TemplateInstructions, { modal: true });
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

    private static async getBestRpcServer(apiUrl: string): Promise<string> {
        try {
            const apiResponse = JSON.parse((await request(apiUrl)).body);
            let maxHeight = -1;
            for (let i = 0; i < apiResponse.length; i++) {
                const datum = apiResponse[i];
                if (datum.height > maxHeight) {
                    maxHeight = datum.height;
                }
            }

            const candidates: string[] = [];
            for (let i = 0; i < apiResponse.length; i++) {
                const datum = apiResponse[i];
                if (datum.height === maxHeight) {
                    candidates.push(datum.url);
                }
            }

            if (candidates.length > 0) {
                return candidates[Math.floor(Math.random() * candidates.length)];
            } else {
                return '';
            }
        } catch(e) {
            console.error('Could not get an example RPC server from ', apiUrl, e);
            return '';
        }
    }

}