import * as vscode from 'vscode';

class Contract {
    constructor(public path: string) {
    }
}

export class ContractDetector {

    private readonly fileSystemWatcher: vscode.FileSystemWatcher;
    private readonly searchPattern: vscode.GlobPattern = '**/*.avm';

    public contracts: Contract[];

    constructor() {
        this.contracts = [];
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
        this.contracts = (await vscode.workspace.findFiles(this.searchPattern)).map(
            uri => new Contract(uri.path));
        console.info('Available contracts refreshed', this.contracts);
    }

}