import * as childProcess from 'child_process';
import * as shellEscape from 'shell-escape';
import * as vscode from 'vscode';

class StringResult {
    private constructor(public isError: boolean, public output: string) {
    }

    public static Error(output: string) {
        return new StringResult(true, output);
    }

    public static Success(output: string) {
        return new StringResult(false, output);
    }
}

const InstallationTaskName = 'Install Neo Express';

export class NeoExpressHelper {

    private postInstallAction: Function | null = null;
    private postInstallVersionCheck: string | null = null;

    constructor() {
        vscode.tasks.onDidEndTask(async e => {
            if (this.postInstallAction && this.postInstallVersionCheck && (e.execution.task.name === InstallationTaskName)) {
                const action = this.postInstallAction;
                const version = this.postInstallVersionCheck;
                this.postInstallAction = null;
                this.postInstallVersionCheck = null;
                const checkResult = await this.isNeoExpressInstalled(version);
                if (checkResult === 'ok') {
                    await action();
                } else {
                    await vscode.window.showErrorMessage(
                        'Neo Express installation error.\n\nNeo Express did not install successfully. Check the terminal output for more information.');
                }
            }
        });
    }

    public async requireNeoExpress(version: string, then: Function, featureDescription?: string) {
        featureDescription =  featureDescription || 'use this functionality';
        const checkResult = await this.isNeoExpressInstalled(version);
        if (checkResult === 'ok') {
            await then();
        } else if (this.postInstallAction) {
            await vscode.window.showErrorMessage(
                'Neo Express installation is in progress.\n\nPlease wait for the installation to finish and then try again.');
        } else if (checkResult === 'upgrade') {
            const upgrade = 'Upgrade';
            const dialogResponse = await vscode.window.showInformationMessage(
                'Neo Express ' + version + ' Required\n\nYour installation of Neo Express must be upgraded in order to ' + featureDescription + '.\n',
                { modal: true },
                upgrade);
            if (dialogResponse === upgrade) {
                this.postInstallAction = then;
                this.postInstallVersionCheck = version;
                await vscode.tasks.executeTask(
                    new vscode.Task(
                        { type: 'install-neo-express' },
                        vscode.TaskScope.Global,
                        InstallationTaskName,
                        'dotnet',
                        new vscode.ShellExecution('dotnet tool update Neo.Express -g')));
            }
        } else {
            const moreInfo = 'More Information';
            const install = 'Install';
            const dialogResponse = await vscode.window.showInformationMessage(
                'Neo Express Required\n\nNeo Express was not detected on your machine. Neo Express must be installed in order to ' + featureDescription + '.\n',
                { modal: true },
                install,
                moreInfo);
            if (dialogResponse === moreInfo) {
                vscode.env.openExternal(vscode.Uri.parse('https://github.com/neo-project/neo-express#Installation'));
            } else if (dialogResponse === install) {
                this.postInstallAction = then;
                this.postInstallVersionCheck = version;
                await vscode.tasks.executeTask(
                    new vscode.Task(
                        { type: 'install-neo-express' },
                        vscode.TaskScope.Global,
                        InstallationTaskName,
                        'dotnet',
                        new vscode.ShellExecution('dotnet tool install Neo.Express -g')));
            }
        }
    }

    public async createInstance(
        neoExpressJsonFullPath: string,
        nodeCount: number,
        allowOverwrite: boolean,
        preloadGas: number): Promise<StringResult> {

        const doGasPreload = (preloadGas > 0);
        let command = shellEscape.default([
            'neo-express', 
            'create', 
            '-c', nodeCount + '', 
            allowOverwrite ? '-f' : '',
            doGasPreload ? '--preload-gas' : '',
            doGasPreload ? preloadGas + '' : '']);
        command += ' -o ' + NeoExpressHelper.doubleQuoteEscape(neoExpressJsonFullPath);
        return await new Promise((resolve) => {
            childProcess.exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error('Error creating instance', command, error, stderr);
                    resolve(StringResult.Error(error.message));
                } else if (stderr) {
                    console.error('Error creating instance', command, error, stderr);
                    resolve(StringResult.Error(stderr));
                } else {
                    resolve(StringResult.Success(stdout));
                }
            });
        });
    }

    public async createCheckpoint(
        neoExpressJsonFullPath: string,
        checkpointPath: string,
        checkpointName: string,
        allowOverwrite: boolean): Promise<StringResult> {
        
        // First try in offline mode...
        const offlineModeResult = await this.createCheckpointInternal(
            neoExpressJsonFullPath, 
            checkpointPath, 
            checkpointName, 
            allowOverwrite, 
            false);
        if (offlineModeResult.isError) {
            // ...if that fails then try online mode...
            const onlineModeResult =
                await this.createCheckpointInternal(
                    neoExpressJsonFullPath, 
                    checkpointPath, 
                    checkpointName, 
                    allowOverwrite, 
                    true);
            // ...if both modes fail, return the original error:
            return onlineModeResult.isError ? offlineModeResult : onlineModeResult;
        } else {
            return offlineModeResult;
        }
    }

    public async createWallet(
        neoExpressJsonFullPath: string,
        walletName: string,
        allowOverwrite: boolean): Promise<StringResult> {

        let command = shellEscape.default([
            'neo-express',
            'wallet',
            'create', 
            allowOverwrite ? '-f' : '']);
        command += ' -i ' + NeoExpressHelper.doubleQuoteEscape(neoExpressJsonFullPath);
        command += ' ' + NeoExpressHelper.doubleQuoteEscape(walletName);
        return await new Promise((resolve) => {
            childProcess.exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error('Error creating wallet', command, error, stderr);
                    resolve(StringResult.Error(error.message));
                } else if (stderr) {
                    console.error('Error creating wallet', command, error, stderr);
                    resolve(StringResult.Error(stderr));
                } else {
                    resolve(StringResult.Success(stdout));
                }
            });
        });
    }

    public async isNeoExpressInstalled(requiredVersion: string): Promise<'ok' | 'missing' | 'upgrade'> {
        let command = shellEscape.default([ 'neo-express', '-v' ]);
        return await new Promise((resolve) => {
            childProcess.exec(command, (error, stdout, stderr) => {
                if (error) {
                    resolve('missing');
                } else if (stderr) {
                    resolve('missing');
                } else {
                    if (requiredVersion === '*') {
                        resolve('ok');
                    } else {
                        const installedVersion = stdout.trim().split('+')[0];
                        const installedVersionComponents = installedVersion.split('.').map(_ => parseInt(_));
                        const requiredVersionComponents = requiredVersion.trim().split('.').map(_ => parseInt(_));
                        if (installedVersionComponents.length !== requiredVersionComponents.length) {
                            console.error('neo-express version check failure, unable to compare', requiredVersionComponents, 'with', installedVersionComponents);
                            resolve('ok');
                        } else {
                            let success = true, i = 0;
                            while (success && (i < installedVersionComponents.length)) {
                                if (installedVersionComponents[i] < requiredVersionComponents[i]) {
                                    success = false;
                                } else if (installedVersionComponents[i] === requiredVersionComponents[i]) {
                                    i++;
                                } else {
                                    i = installedVersionComponents.length;
                                }
                            }
                            console.info('Required neo-express version: ', requiredVersion, 'Installed version: ', installedVersion);
                            resolve(success ? 'ok' : 'upgrade');
                        }
                    }
                }
            });
        });
    }

    public async restoreCheckpoint(
        neoExpressJsonFullPath: string, 
        fullCheckpointPath: string,
        checkpointLabel: string): Promise<StringResult | undefined> {

        // TODO: First try without '-f' option, and only show overwrite warning to user if '-f' is needed.
        //       See: https://github.com/neo-project/neo-express/issues/38
        const allowOverwrite = (await vscode.window.showWarningMessage(
            'Overwrite existing blockchain data (if any) with the contents of checkpoint ' + checkpointLabel + '?',
            { modal: true },
            'Overwrite')) === 'Overwrite';
        if (allowOverwrite) {
            return await this.restoreCheckpointInternal(
                neoExpressJsonFullPath,
                fullCheckpointPath,
                true);
        } else {
            return undefined;
        }
    }

    private async createCheckpointInternal(
        neoExpressJsonFullPath: string,
        checkpointPath: string,
        checkpointName: string,
        allowOverwrite: boolean,
        onlineMode: boolean): Promise<StringResult> {

        let command = shellEscape.default([
            'neo-express',
            'checkpoint',
            'create', 
            allowOverwrite ? '-f' : '',
            onlineMode ? '-o' : '']);
        command += ' -i ' + NeoExpressHelper.doubleQuoteEscape(neoExpressJsonFullPath);
        command += ' ' + NeoExpressHelper.doubleQuoteEscape(checkpointName);
        return await new Promise((resolve) => {
            childProcess.exec(command, { cwd: checkpointPath }, (error, stdout, stderr) => {
                if (error) {
                    console.warn('Error creating checkpoint', command, error, stderr);
                    resolve(StringResult.Error(error.message));
                } else if (stderr) {
                    console.warn('Error creating checkpoint', command, error, stderr);
                    resolve(StringResult.Error(stderr));
                } else {
                    resolve(StringResult.Success(stdout));
                }
            });
        });
    }

    private async restoreCheckpointInternal(
        neoExpressJsonFullPath: string,
        fullCheckpointPath: string,
        allowOverwrite: boolean): Promise<StringResult> {

        let command = shellEscape.default([
            'neo-express',
            'checkpoint',
            'restore', 
            allowOverwrite ? '-f' : '']);
        command += ' -i ' + NeoExpressHelper.doubleQuoteEscape(neoExpressJsonFullPath);
        command += ' ' + NeoExpressHelper.doubleQuoteEscape(fullCheckpointPath);
        return await new Promise((resolve) => {
            childProcess.exec(command, (error, stdout, stderr) => {
                if (error || stderr) {
                    const message = stdout ? stdout.split(/[\r\n]/)[0].trim() : (stderr || error?.message);
                    console.warn('Error restoring checkpoint', command, error, stdout, stderr);
                    resolve(StringResult.Error(message || 'Unknown error'));
                } else {
                    resolve(StringResult.Success(stdout));
                }
            });
        });
    }

    private static doubleQuoteEscape(argument: string) {
        let escaped = shellEscape.default([ argument ]);
        if ((escaped.length >= 2) && 
            (escaped[0] === '\'') && 
            (escaped[escaped.length - 1] === '\'')) {
            escaped = '"' + escaped.substring(1, escaped.length - 1).replace(/"/g, '\\"') + '"';
        }
        return escaped;
    }

}