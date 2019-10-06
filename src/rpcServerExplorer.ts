import * as vscode from 'vscode';

export class RpcServerExplorer implements vscode.TreeDataProvider<string> {

    private readonly onDidChangeTreeDataEmitter: vscode.EventEmitter<any>;
    
    public readonly onDidChangeTreeData: vscode.Event<any>;

	constructor() { 
        this.onDidChangeTreeDataEmitter = new vscode.EventEmitter<any>();
        this.onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;
    }

	public refresh(): any {
		this.onDidChangeTreeDataEmitter.fire();
	}

	public getTreeItem(element: string): vscode.TreeItem {
        return new vscode.TreeItem(element);
	}

	public getChildren(element?: string): string[] | Thenable<string[]> {
		if (element) {
            return [];
        } else {
            return ["http://foo","http://bar"];
        }
	}

	public getParent(element: string) {
		return undefined;
	}

}