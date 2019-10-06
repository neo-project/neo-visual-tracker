import * as fs from 'fs';
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
                    if (consensusNode["rpc-port"]) {
                        const uri = 'http://127.0.0.1:' + consensusNode["rpc-port"];
                        const child = RpcServerTreeItemIdentifier.fromUri(uri, 'Node #' + (i + 1));
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

    public static fromUri(rpcUri: string, label: string, parent?: RpcServerTreeItemIdentifier) {
        return new RpcServerTreeItemIdentifier(undefined, rpcUri, parent, label);
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
            const result = new vscode.TreeItem(this.label || this.rpcUri);
            result.iconPath = vscode.ThemeIcon.File;
            result.description = this.rpcUri;
            result.command = {
                title: 'Open tracker',
                command: 'extension.openTracker',
                arguments: [ this.rpcUri ],
            };
            return result;
        } else {
            const result = new vscode.TreeItem('' + this.label, vscode.TreeItemCollapsibleState.Expanded);
            result.iconPath = vscode.ThemeIcon.Folder;
            result.description = 'NEO Express Instance';
            result.tooltip = 'NEO Express configuration loaded from: ' + this.jsonFile;
            return result;
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
        vscode.workspace.onDidSaveTextDocument(this.refresh, this);
        vscode.workspace.onDidChangeWorkspaceFolders(this.refresh, this);
    }

	public async refresh() {

        this.rootItems = [
            RpcServerTreeItemIdentifier.fromUri('http://seed1.ngd.network:10332', 'NGD'),
            RpcServerTreeItemIdentifier.fromUri('https://seed1.cityofzion.io:443', 'City of Zion')
        ];

        let allRootPaths: string[] = [];
        if (vscode.workspace.workspaceFolders) {
            allRootPaths = vscode.workspace.workspaceFolders.map(_ => _.uri.fsPath);
        }

        const allJsonFiles = await vscode.workspace.findFiles('**/*.json');
        for (let i = 0; i < allJsonFiles.length; i++) {
            const rpcServerFromJson = RpcServerTreeItemIdentifier.fromJsonFile(
                allRootPaths,
                allJsonFiles[i].fsPath);
            if (rpcServerFromJson) {
                this.rootItems.push(rpcServerFromJson);
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