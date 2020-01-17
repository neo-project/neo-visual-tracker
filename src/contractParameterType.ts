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

}