import * as path from 'path';
import * as vscode from 'vscode';

class Checkpoint {
    constructor(public readonly name: string, public readonly fullpath: string) {
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
        if (this.fileSystemWatcher) {
            this.fileSystemWatcher.dispose();
        }
    }

    public async refresh() {
        const allDirs = [];
        const allCheckpointsUris = await vscode.workspace.findFiles(this.searchPattern);
        const allCheckpoints =  allCheckpointsUris.map(uri => uri.path);
        for (let i = 0; i < allCheckpoints.length; i++) {
            allDirs.push((path.parse(allCheckpoints[i])).dir + path.sep);
        }
        const commonPrefix = CheckpointDetector.commonPrefix(allDirs);

        this.checkpoints = [];
        for (let i = 0; i < allCheckpoints.length; i++) {
            this.checkpoints.push(
                new Checkpoint(allCheckpoints[i].substring(commonPrefix.length), allCheckpoints[i]));
        }
    }

    private static commonPrefix(paths: string[]){
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