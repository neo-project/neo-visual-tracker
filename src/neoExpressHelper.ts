import * as childProcess from 'child_process';
import * as shellEscape from 'shell-escape';

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

class JsonResult {
    private constructor(public isError: boolean, public result: any) {
    }

    public static Error() {
        return new JsonResult(true, {});
    }

    public static Success(outputJson: string) {
        return new JsonResult(false, JSON.parse(outputJson));
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

    public static async isNeoExpressInstalled(): Promise<boolean> {
        let command = shellEscape.default([ 'neo-express', '-v' ]);
        return await new Promise((resolve) => {
            childProcess.exec(command, (error, stdout, stderr) => {
                if (error) {
                    resolve(false);
                } else if (stderr) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    }

    public static async showAccount(
        neoExpressJsonFullPath: string,
        wallet: string): Promise<JsonResult> {

        let command = shellEscape.default(['neo-express', 'show', 'account']);
        command += ' ' + NeoExpressHelper.doubleQuoteEscape(wallet);
        command += ' -i ' + NeoExpressHelper.doubleQuoteEscape(neoExpressJsonFullPath);
        command += ' -j';
        return await new Promise((resolve) => {
            childProcess.exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error('Error showing account', command, error, stderr);
                    resolve(JsonResult.Error());
                } else if (stderr) {
                    console.error('Error showing account', command, error, stderr);
                    resolve(JsonResult.Error());
                } else {
                    resolve(JsonResult.Success(stdout));
                }
            });
        });
    }

    public static async transfer(
        neoExpressJsonFullPath: string,
        assetName: string,
        amount: number,
        sourceWallet: string,
        destinationWallet: string): Promise<StringResult> {

        let command = shellEscape.default(['neo-express', 'transfer']);
        command += ' -i ' + NeoExpressHelper.doubleQuoteEscape(neoExpressJsonFullPath);
        command += ' ' + NeoExpressHelper.doubleQuoteEscape(assetName);
        command += ' ' + amount;
        command += ' ' + NeoExpressHelper.doubleQuoteEscape(sourceWallet);
        command += ' ' + NeoExpressHelper.doubleQuoteEscape(destinationWallet);
        return await new Promise((resolve) => {
            childProcess.exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error('Transfer failed', command, error, stderr);
                    resolve(StringResult.Error(error.message));
                } else if (stderr) {
                    console.error('Transfer failed', command, error, stderr);
                    resolve(StringResult.Error(stderr));
                } else {
                    console.info('Transfer succeeded', command, stdout);
                    resolve(StringResult.Success(command));
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