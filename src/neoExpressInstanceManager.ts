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

    public start(
        jsonFile: string, 
        index: number, 
        label?: string, 
        dontReincarnate?: boolean,
        secondsPerBlock?: number) {

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

        terminal.processId.then(async pid => {
            console.log('Existing PID: ', pid);
            findProcess('pid', pid).then((matches: any) => {
                if (!matches.length) {
                    if (!dontReincarnate) {
                        this.stop(jsonFile, index);
                        this.start(jsonFile, index, label, true);
                    }
                }
            });
        });

        terminal.show();
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