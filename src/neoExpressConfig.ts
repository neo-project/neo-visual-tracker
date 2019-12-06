import * as fs from 'fs';
import * as neon from '@cityofzion/neon-js';
import * as path from 'path';

class Wallet {
    public readonly description: string;
    public readonly isMultiSig: boolean = false;
    public readonly signingFunction: ((tx: string, pk: string) => string) | undefined = undefined;
    public readonly account: any;
    public constructor(
        public readonly walletName: string,
        public readonly accountLabel: string | null,
        public readonly isDefault: boolean,
        public readonly address: string,
        public readonly privateKey: string) {
        this.account = new neon.wallet.Account(this.privateKey);
        this.description = 
            walletName + 
            (accountLabel ? ' - ' + accountLabel + (isDefault ? ' (default)' : '') : '');
    }
}

class MultiSigWallet {
    public readonly description: string;
    public readonly isMultiSig: boolean = true;
    public readonly signingFunction: ((tx: string, pk: string) => string) | undefined;
    public readonly multiSigAccount: any;
    public readonly address: string;
    public readonly individualAccounts: any[];
    public readonly account: any;
    public readonly publicKeys: string[];
    public constructor(
        public readonly walletName: string,
        public readonly signingThreshold: number,
        public readonly privateKeys: string[]) {
        this.individualAccounts = this.privateKeys.map(k => new neon.wallet.Account(k));
        this.publicKeys = this.individualAccounts.map(a => a.publicKey);
        this.publicKeys.sort(); // Neo Express uses the keys in alphabetical order when constructing the multisig script
        this.multiSigAccount = neon.wallet.Account.createMultiSig(this.signingThreshold, this.publicKeys);
        this.address = this.multiSigAccount.address;
        this.account = this.individualAccounts[0];
        this.signingFunction = (tx: string, publicKey: string) => {
            const signatures = [];
            for (let i = 0; i < this.signingThreshold; i++) {
                signatures.push(neon.wallet.sign(tx, this.privateKeys[i]));
            }
            return neon.tx.Witness.buildMultiSig(tx, signatures, this.multiSigAccount).serialize();
        };
        this.description = 
            walletName + 
            ' (' + this.signingThreshold + ' of ' + this.publicKeys.length + ' multisig)';
    }
}

export class NeoExpressConfig {

    public readonly basename: string;

    public readonly wallets: (Wallet | MultiSigWallet)[] = [];

    public constructor(public readonly neoExpressJsonFullPath: string) {
        this.basename = path.basename(neoExpressJsonFullPath);
        const jsonFileContents = fs.readFileSync(this.neoExpressJsonFullPath, { encoding: 'utf8' });
        const neoExpressConfig = JSON.parse(jsonFileContents);
        this.parseWallets(neoExpressConfig);
    }

    private parseWallets(neoExpressConfig: any) {

        this.wallets.length = 0;

        const genesisPrivateKeys: string[] = [];
        let genesisThreshold = 0;
        const consensusNodes = neoExpressConfig['consensus-nodes'] || [];
        consensusNodes.forEach((consensusNode: any) => {
            const nodeWallet = consensusNode.wallet || {};
            if (nodeWallet.accounts && nodeWallet.accounts.length) {
                const multiSigAccount = nodeWallet.accounts.filter((a: any) => 'MultiSigContract' === a.label)[0];
                if (multiSigAccount && multiSigAccount['private-key']) {
                    genesisPrivateKeys.push(multiSigAccount['private-key']);
                    const contract = multiSigAccount.contract || {};
                    if (contract.parameters && contract.parameters.length) {
                        genesisThreshold = contract.parameters.length;
                    }
                }
            }
        });
        this.wallets.push(new MultiSigWallet('genesis', genesisThreshold, genesisPrivateKeys));

        const walletConfigs: any[] = neoExpressConfig.wallets || [];
        walletConfigs.forEach(walletConfig => {
            const walletName: string = walletConfig.name;
            const accounts: any[] = walletConfig.accounts;
            if (walletName && accounts) {
                accounts.forEach(accountConfig => {
                    const accountLabel: string | null = accountConfig['label'];
                    const isDefault: boolean = !!accountConfig['is-default'];
                    const privateKey: string | null = accountConfig['private-key'];
                    const address: string | null = accountConfig['script-hash'];
                    if (privateKey && address) {
                        this.wallets.push(new Wallet(walletName, accountLabel, isDefault, address, privateKey));
                    }
                });
            }
        });
    }

}