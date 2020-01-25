export interface IWallet {
    readonly walletName: string;
    readonly description: string;
    readonly isMultiSig: boolean;
    readonly signingFunction: ((tx: string, pk: string) => string) | undefined;
    readonly account: any;
    readonly address: string;
    unlock(): Promise<boolean>;
}