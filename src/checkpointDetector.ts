import * as path from 'path';
import * as zip from 'adm-zip';
import * as vscode from 'vscode';

class Checkpoint {
    public readonly magic?: number;
    constructor(public readonly label: string, public readonly fullpath: string) {
        try {
            const archive = new zip.default(fullpath);
            let magic = undefined;
            archive.getEntries().forEach(archiveEntry => {
                if (archiveEntry.name === 'ADDRESS.neo-express') {
                    magic = parseInt(archiveEntry.getData().toString('utf8').split('\n')[0].trim());
                }
            });
            this.magic = magic;
        } catch (e) {
            console.warn('Error determining neo-express instance used to create checkpoint', fullpath, e);
        }
    }
}

export class CheckpointDetector {

    private readonly fileSystemWatcher: vscode.FileSystemWatcher;
    private readonly searchPattern: vscode.GlobPattern = '**/*.neo-express-checkpoint';

    public checkpoints: Checkpoint[];

    constructor() {
        this.checkpoints = [];
        this.fileSystemWatcher = vscode.workspace.createFileSystemWatcher(this.searchPattern);
        this.fileSystemWatcher.onDidChange(this.refresh, this);
        this.fileSystemWatcher.onDidCreate(this.refresh, this);
        this.fileSystemWatcher.onDidDelete(this.refresh, this);
        this.refresh();
    }

    public dispose() {
        this.fileSystemWatcher.dispose();
    }

    public async refresh() {
        const checkpointFiles = (await vscode.workspace.findFiles(this.searchPattern)).map(uri => uri.path);
        const checkpointDirs = checkpointFiles.map(c => path.parse(c).dir + path.sep);
        const commonPrefixLength = CheckpointDetector.commonPrefix(checkpointDirs).length;
        this.checkpoints = checkpointFiles.map(c => new Checkpoint(c.substring(commonPrefixLength), c));
    }

    private static commonPrefix(paths: string[]) {
        if (paths.length === 0) {
            return '';
        }
        const sortedPaths = paths.sort();
        const firstPath = sortedPaths[0];
        const lastPath = sortedPaths[sortedPaths.length - 1];
        let i = 0;
        while ((i < firstPath.length) && (firstPath[i] === lastPath[i])) {
            i++;
        }
        return firstPath.substring(0, i);
    }

}