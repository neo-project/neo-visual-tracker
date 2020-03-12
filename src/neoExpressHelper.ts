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

export class NeoExpressHelper {

    public static async createInstance(
        neoExpressJsonFullPath: string,
        nodeCount: number,
        allowOverwrite: boolean): Promise<StringResult> {

        let command = shellEscape.default([
            'neo-express', 
            'create', 
            '-c', nodeCount + '', 
            allowOverwrite ? '-f' : '']);
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

    public static async createCheckpoint(
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

    public static async createWallet(
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

    public static async isNeoExpressInstalled(requiredVersion: string): Promise<'ok' | 'missing' | 'upgrade'> {
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
                        const installedVersionComponents = installedVersion.split('.').map(parseInt);
                        const requiredVersionComponents = requiredVersion.trim().split('.').map(parseInt);
                        console.log('version check', installedVersionComponents, requiredVersionComponents);
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

    public static async restoreCheckpoint(
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

    private static async createCheckpointInternal(
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

    private static async restoreCheckpointInternal(
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