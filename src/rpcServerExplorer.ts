import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

class RpcServerTreeItemIdentifier {

    public readonly jsonFile?: string;

    public readonly label?: string;

    public readonly rpcUri?: string;

    public readonly parent?: RpcServerTreeItemIdentifier;

    public readonly children: RpcServerTreeItemIdentifier[];

    public static fromJsonFile(allRootPaths: string[], jsonFile: string) {
        try {
            let label = jsonFile;
            for (let i = 0; i < allRootPaths.length; i++) {
                label = label.replace(allRootPaths[i], '');
            }

            if (label.startsWith('/') || label.startsWith('\\')) {
                label = label.substr(1);
            }

            const result = new RpcServerTreeItemIdentifier(jsonFile, undefined, undefined, label);
            const jsonFileContents = fs.readFileSync(jsonFile, { encoding: 'utf8' });
            const neoExpressConfig = JSON.parse(jsonFileContents);
            if (neoExpressConfig['consensus-nodes'] && neoExpressConfig['consensus-nodes'].length) {
                for (let i = 0; i < neoExpressConfig['consensus-nodes'].length; i++) {
                    const consensusNode = neoExpressConfig['consensus-nodes'][i];
                    if (consensusNode["tcp-port"]) {
                        const uri = 'http://127.0.0.1:' + consensusNode["tcp-port"];
                        const child = RpcServerTreeItemIdentifier.fromUri(uri);
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

    public static fromUri(rpcUri: string, parent?: RpcServerTreeItemIdentifier) {
        return new RpcServerTreeItemIdentifier(undefined, rpcUri, parent, undefined);
    }

    private constructor(
        jsonFile?: string, 
        rpcUri?: string, 
        parent?: RpcServerTreeItemIdentifier,
        label?: string) {

        this.jsonFile = jsonFile;
        this.rpcUri = rpcUri;
        this.parent = parent;
        this.label = label;
        this.children = [];
    }

    public asTreeItem() : vscode.TreeItem {
        if (this.rpcUri) {
            return new vscode.TreeItem('Server: ' + this.rpcUri);
        } else {
            return new vscode.TreeItem('' + this.label, vscode.TreeItemCollapsibleState.Expanded);
        }
    }
}

export class RpcServerExplorer implements vscode.TreeDataProvider<RpcServerTreeItemIdentifier> {

    private readonly onDidChangeTreeDataEmitter: vscode.EventEmitter<any>;
    
    public readonly onDidChangeTreeData: vscode.Event<any>;

    private rootItems: RpcServerTreeItemIdentifier[];

	constructor() { 
        this.onDidChangeTreeDataEmitter = new vscode.EventEmitter<any>();
        this.onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;
        this.rootItems = [];
        this.refresh();
    }

	public async refresh() {

        this.rootItems = [
            RpcServerTreeItemIdentifier.fromUri('http://seed1.ngd.network:10332'),
            RpcServerTreeItemIdentifier.fromUri('http://seed2.ngd.network:10332')
        ];

        let allRootPaths: string[] = [];
        if (vscode.workspace.workspaceFolders) {
            allRootPaths = vscode.workspace.workspaceFolders.map(_ => _.uri.fsPath);
        }

        const rootPath = vscode.workspace.rootPath;
        if (rootPath) {
            const allJsonFiles = await vscode.workspace.findFiles('**/*.json');
            for (let i = 0; i < allJsonFiles.length; i++) {
                const rpcServerFromJson = RpcServerTreeItemIdentifier.fromJsonFile(
                    allRootPaths,
                    allJsonFiles[i].fsPath);
                if (rpcServerFromJson) {
                    this.rootItems.push(rpcServerFromJson);
                }
            }
        }

		this.onDidChangeTreeDataEmitter.fire();
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

}