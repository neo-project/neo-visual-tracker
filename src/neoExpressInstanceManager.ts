import * as vscode from "vscode";

const shellescape = require('shell-escape');

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

    public start(jsonFile: string, index: number, label?: string) {
        if (!label) {
            label = jsonFile;
        }

        const key = new InstanceIdentifier(jsonFile, index);
        let terminal = this.terminals.get(key.asString());
        if (!terminal) {
            terminal = vscode.window.createTerminal('NEO: ' + label + ':' + index);
            this.terminals.set(key.asString(), terminal);
        }

        terminal.show();
        terminal.sendText(
            shellescape(['neo-express', 'run', '-i', jsonFile, index]),
            true);
    }

}