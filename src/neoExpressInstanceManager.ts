import * as vscode from "vscode";

const findProcess = require('find-process');

class InstanceIdentifier {
    constructor(
        public readonly jsonFile: string,
        public readonly index: number
    ) {}

    public asString(): string {
        return this.jsonFile + ':' + this.index;
    }
}

export class NeoExpressInstanceManager {

    private readonly terminals: Map<string, vscode.Terminal> = new Map<string, vscode.Terminal>();

    public async startCheckpoint(
        jsonFile: string, 
        fullPathToCheckpoint: string, 
        label?: string, 
        secondsPerBlock?: number): Promise<boolean> {

        const nodeIndex = 0;

        if (!label) {
            label = jsonFile;
        }

        secondsPerBlock = secondsPerBlock || 15;

        const key = new InstanceIdentifier(jsonFile, nodeIndex);
        let terminal = this.terminals.get(key.asString());
        if (terminal) {
            console.log('Restarting', jsonFile, 'from checkpoint', fullPathToCheckpoint);
            this.stop(jsonFile, 0);
        } else {
            console.log('Starting', jsonFile, 'from checkpoint', fullPathToCheckpoint);
        }
        
        if (process.platform === 'win32') {
            terminal = vscode.window.createTerminal(
                'NEO: ' + label + ':' + nodeIndex,
                'cmd.exe',
                ['/c', 'neo-express', 'checkpoint', 'run', '-s', secondsPerBlock + '', '-i', jsonFile, fullPathToCheckpoint]);
        } else {
            terminal = vscode.window.createTerminal(
                'NEO: ' + label + ':' + nodeIndex,
                'sh',
                ['-c', 'neo-express', 'checkpoint', 'run', '-s', secondsPerBlock + '', '-i', jsonFile, fullPathToCheckpoint]);
        }

        this.terminals.set(key.asString(), terminal);
        
        terminal.show();

        let success = true;
        await terminal.processId.then(async pid => {
            await findProcess('pid', pid).then((matches: any) => { success = !!matches.length; });
        });
        return success;
    }

    public async start(
        jsonFile: string, 
        index: number, 
        label?: string, 
        secondsPerBlock?: number,
        dontReincarnate?: boolean): Promise<boolean> {

        if (!label) {
            label = jsonFile;
        }

        secondsPerBlock = secondsPerBlock || 15;

        const key = new InstanceIdentifier(jsonFile, index);
        let terminal = this.terminals.get(key.asString());
        if (!terminal) {
            if (process.platform === 'win32') {
                // On Windows vscode fails to launch a terminal using neo-express as the shell
                terminal = vscode.window.createTerminal(
                    'NEO: ' + label + ':' + index,
                    'cmd.exe',
                    ['/c', 'neo-express', 'run', '-s', secondsPerBlock + '', '-i', jsonFile, '' + index]);
            } else {
                terminal = vscode.window.createTerminal(
                    'NEO: ' + label + ':' + index,
                    'neo-express',
                    ['run', '-s', secondsPerBlock + '', '-i', jsonFile, '' + index]);
            }

            this.terminals.set(key.asString(), terminal);
        }

        terminal.show();

        let success = true;
        await terminal.processId.then(async pid => {
            console.log('Existing PID: ', pid);
            await findProcess('pid', pid).then(async (matches: any) => {
                if (!matches.length) {
                    if (dontReincarnate) {
                        success = false;
                    } else {
                        this.stop(jsonFile, index);
                        success = await this.start(jsonFile, index, label, secondsPerBlock, true);
                    }
                }
            });
        });

        return success;
    }

    public stop(jsonFile: string, index: number) {
        const key = new InstanceIdentifier(jsonFile, index);
        let terminal = this.terminals.get(key.asString());
        if (terminal) {
            terminal.dispose();
            this.terminals.delete(key.asString());   
        }
    }

}