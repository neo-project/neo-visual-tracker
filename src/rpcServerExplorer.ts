import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

class RpcServerTreeItemIdentifier {

    public readonly jsonFile?: string;

    public readonly rpcUri?: string;

    public readonly parent?: RpcServerTreeItemIdentifier;

    public readonly children: RpcServerTreeItemIdentifier[];

    public static fromJsonFile(jsonFile: string) {
        try {
            const jsonFileContents = fs.readFileSync(jsonFile, { encoding: 'utf8' });
            const neoExpressConfig = JSON.parse(jsonFileContents);
            const result = new RpcServerTreeItemIdentifier(jsonFile, undefined, undefined);
            if (neoExpressConfig['consensus-nodes'] && neoExpressConfig['consensus-nodes'].length) {
                for (let i = 0; i < neoExpressConfig['consensus-nodes'].length; i++) {
                    const consensusNode = neoExpressConfig['consensus-nodes'][i];
                    if (consensusNode["tcp-port"]) {
                        result.children.push(RpcServerTreeItemIdentifier.fromUri('http://127.0.0.1:' + consensusNode["tcp-port"]));
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
        return new RpcServerTreeItemIdentifier(undefined, rpcUri, parent);
    }

    private constructor(jsonFile?: string, rpcUri?: string, parent?: RpcServerTreeItemIdentifier) {
        this.jsonFile = jsonFile;
        this.rpcUri = rpcUri;
        this.parent = parent;
        this.children = [];
    }

    public asTreeItem() : vscode.TreeItem {
        if (this.rpcUri) {
            return new vscode.TreeItem('Server: ' + this.rpcUri);
        } else {
            return new vscode.TreeItem('Config: ' + this.jsonFile, vscode.TreeItemCollapsibleState.Expanded);
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

	public refresh(): any {

        // ...
        // vscode.workspace.rootPath
        // ...

        const json1 = RpcServerTreeItemIdentifier.fromJsonFile('/Users/david/HelloWorld/num3.json');
        const json2 = RpcServerTreeItemIdentifier.fromJsonFile('/Users/david/HelloWorld/default.neo-express.json');

        this.rootItems = [
            RpcServerTreeItemIdentifier.fromUri('http://seed1.ngd.network:10332'),
            RpcServerTreeItemIdentifier.fromUri('http://seed2.ngd.network:10332')
        ];

        if (json1) {
            this.rootItems.push(json1);
        }

        if (json2) {
            this.rootItems.push(json2);
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