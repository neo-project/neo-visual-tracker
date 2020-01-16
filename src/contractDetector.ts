import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

class Contract {
    public readonly hash?: string;
    public readonly name?: string;
    public readonly path: string;
    public readonly avmHex?: string;
    constructor(fullpath: string) {
        this.path = fullpath;
        try {
            this.name = path.basename(fullpath).replace(/\.avm$/, '');
            const avmContents = fs.readFileSync(fullpath);
            this.avmHex = avmContents.toString('hex');
            const sha256Bytes = crypto.createHash('sha256').update(avmContents).digest();
            const ripemd160Bytes = crypto.createHash('ripemd160').update(sha256Bytes).digest();
            this.hash = '0x' + Buffer.from(ripemd160Bytes.reverse()).toString('hex');
        } catch (e) {
            console.error('Error parsing', path, e);
        }
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
        const files = await vscode.workspace.findFiles(this.searchPattern);
        this.contracts = files
            .map(uri => new Contract(uri.fsPath))
            .filter(contract => !!contract.hash);
    }

}