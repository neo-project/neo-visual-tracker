import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as vscode from 'vscode';

const request = util.promisify(require('request'));

class RpcServerTreeItemIdentifier {

    public readonly jsonFile?: string;

    public readonly label?: string;

    public readonly description?: string;

    public readonly rpcUri?: string;

    public readonly parent?: RpcServerTreeItemIdentifier;

    public readonly index?: number;

    public readonly children: RpcServerTreeItemIdentifier[];

    public static fromNeoExpressJsonFile(allRootPaths: string[], jsonFile: string) {
        try {
            let label = jsonFile;
            for (let i = 0; i < allRootPaths.length; i++) {
                label = label.replace(allRootPaths[i], '');
            }

            if (label.startsWith('/') || label.startsWith('\\')) {
                label = label.substr(1);
            }

            const result = new RpcServerTreeItemIdentifier(jsonFile, undefined, undefined, label, 'Neo Express Instance', undefined);
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

    public static fromNeoServersJsonFile(allRootPaths: string[], jsonFile: string) {
        try {
            let label = jsonFile;
            for (let i = 0; i < allRootPaths.length; i++) {
                label = label.replace(allRootPaths[i], '');
            }

            if (label.startsWith('/') || label.startsWith('\\')) {
                label = label.substr(1);
            }

            const result = new RpcServerTreeItemIdentifier(jsonFile, undefined, undefined, label, 'JSON server list', undefined);
            const jsonFileContents = fs.readFileSync(jsonFile, { encoding: 'utf8' });
            const contents = JSON.parse(jsonFileContents);
            if (contents && contents.length) {
                for (let i = 0; i < contents.length; i++) {
                    const server = contents[i];
                    if (server && server.url) {
                        const name = server.name || server.url;
                        const child = RpcServerTreeItemIdentifier.fromUri(server.url, name, result, jsonFile);
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

    private constructor(
        jsonFile?: string, 
        rpcUri?: string, 
        parent?: RpcServerTreeItemIdentifier,
        label?: string,
        description?: string,
        index?: number) {

        this.jsonFile = jsonFile;
        this.rpcUri = rpcUri;
        this.parent = parent;
        this.label = label;
        this.description = description;
        this.index = index;
        this.children = [];
    }

    public asTreeItem(extensionPath: string) : vscode.TreeItem {
        if (this.rpcUri) {
            const result = new vscode.TreeItem(this.label || this.rpcUri);
            result.iconPath = vscode.Uri.file(path.join(extensionPath, 'resources', 'neo.svg'));
            result.description = this.rpcUri;
            result.command = {
                title: 'Open tracker',
                command: 'neo-visual-devtracker.openTracker',
                arguments: [ this.rpcUri ],
            };
            if (this.rpcUri.startsWith('http://127.0.0.1:')) {
                result.contextValue = 'startable';
            }
            return result;
        } else {
            const result = new vscode.TreeItem('' + this.label, vscode.TreeItemCollapsibleState.Expanded);
            result.iconPath = vscode.ThemeIcon.Folder;
            result.description = this.description;
            result.tooltip = 'Configuration loaded from: ' + this.jsonFile;
            return result;
        }
    }
}

export class RpcServerExplorer implements vscode.TreeDataProvider<RpcServerTreeItemIdentifier> {

    private readonly onDidChangeTreeDataEmitter: vscode.EventEmitter<any>;
    
    public readonly onDidChangeTreeData: vscode.Event<any>;

    private rootItems: RpcServerTreeItemIdentifier[];

	constructor(private readonly extensionPath: string) { 
        this.onDidChangeTreeDataEmitter = new vscode.EventEmitter<any>();
        this.onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;
        this.rootItems = [];
        this.refresh();
        vscode.workspace.onDidSaveTextDocument(this.refresh, this);
        vscode.workspace.onDidChangeWorkspaceFolders(this.refresh, this);
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
            const neoExpressServerFromJson = RpcServerTreeItemIdentifier.fromNeoExpressJsonFile(
                allRootPaths,
                allJsonFiles[i].fsPath);
            if (neoExpressServerFromJson) {
                this.rootItems.push(neoExpressServerFromJson);
                this.onDidChangeTreeDataEmitter.fire();
            }

            const neoServersFromJson = RpcServerTreeItemIdentifier.fromNeoServersJsonFile(
                allRootPaths,
                allJsonFiles[i].fsPath);
            if (neoServersFromJson) {
                this.rootItems.push(neoServersFromJson);
                this.onDidChangeTreeDataEmitter.fire();
            }
        }
        
        // const testNetRpcServer = await RpcServerExplorer.getBestRpcServer(
        //     'https://neoscan-testnet.io/api/main_net/v1/get_all_nodes', 
        //     'Neo Test Net');
        // if (testNetRpcServer) {
        //     this.rootItems.unshift(testNetRpcServer);
        //     this.onDidChangeTreeDataEmitter.fire();
        // }

        // const mainNetRpcServer = await RpcServerExplorer.getBestRpcServer(
        //     'https://api.neoscan.io/api/main_net/v1/get_all_nodes', 
        //     'Neo Main Net');
        // if (mainNetRpcServer) {
        //     this.rootItems.unshift(mainNetRpcServer);
        //     this.onDidChangeTreeDataEmitter.fire();
        // }
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
    
    private static async getBestRpcServer(apiUrl: string, label: string): Promise<RpcServerTreeItemIdentifier | undefined> {
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
                return RpcServerTreeItemIdentifier.fromUri(candidates[Math.floor(Math.random() * candidates.length)], label);
            } else {
                throw new Error('API server result provide any RPC servers');
            }
        } catch(e) {
            console.error('Could not get an example RPC server from ', apiUrl, e);
            return undefined;
        }
    }

}