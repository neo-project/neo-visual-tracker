export interface IWallet {
    readonly description: string;
    readonly isMultiSig: boolean;
    readonly signingFunction: ((tx: string, pk: string) => string) | undefined;
    readonly account: any;
    readonly address: string;
    unlock(): Promise<boolean>;
}