import * as vscode from 'vscode';

export class ContractParameterType {

    // See: https://docs.neo.org/docs/en-us/sc/deploy/Parameter.html
    private static readonly TypeMap = [
        ['Signature', '00'],
        ['Boolean', '01'],
        ['Integer', '02'],
        ['Hash160', '03'],
        ['Hash256', '04'],
        ['ByteArray', '05'],
        ['PublicKey', '06'],
        ['String', '07'],
        ['Array', '10'],
        ['Map', '12'],
        ['InteropInterface', 'f0'],
        ['Any', 'fe'],
        ['Void', 'ff'],
    ];

    public static typeNameToHexString(typeName: string | undefined): string | undefined {
        typeName = typeName ? typeName.toLowerCase() : undefined;
        const match = ContractParameterType.TypeMap.filter((_: string[]) => _[0].toLowerCase() === typeName)[0];
        return match ? match[1] : undefined;
    }

    public static async promptForTypeString(prompt: string): Promise<string | undefined> {
        return await vscode.window.showQuickPick(
            ContractParameterType.TypeMap.map(_ => _[0]),
            { placeHolder: prompt, ignoreFocusOut: true });
    }

    public static async promptForTypeStringList(prompt: string, noMore: string): Promise<string[] | undefined> {
        const result: string[] = [];
        let i = 0;
        while (true) {
            i++;
            const next = await vscode.window.showQuickPick(
                [ noMore ].concat(ContractParameterType.TypeMap.map(_ => _[0])),
                { placeHolder: prompt.replace('##', '#' + i), ignoreFocusOut: true });
            if (next === noMore) {
                return result;
            } else if (next === undefined) {
                return undefined;
            } else {
                result.push(next);
            }
        }
    }

    public static async promptForTypeHex(prompt: string): Promise<string | undefined> {
        return ContractParameterType.typeNameToHexString(
            await ContractParameterType.promptForTypeString(prompt));
    }

    public static async promptForTypeHexList(prompt: string, noMore: string): Promise<string | undefined> {
        const stringList = await ContractParameterType.promptForTypeStringList(prompt, noMore);
        if (!stringList) {
            return undefined;
        } else {
            return stringList.map(_ => ContractParameterType.typeNameToHexString(_) as string).join('');
        }
    }

}