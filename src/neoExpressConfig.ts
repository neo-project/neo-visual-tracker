import * as fs from 'fs';
import * as path from 'path';

class Wallet {
    public readonly description: string;
    public constructor(
        public readonly walletName: string,
        public readonly accountLabel: string | null,
        public readonly isDefault: boolean,
        public readonly privateKey: string) {
        this.description = 
            walletName + (accountLabel ? ' - ' + accountLabel + (isDefault ? ' (default)' : '') : '');
    }
}

export class NeoExpressConfig {

    public readonly basename: string;

    public readonly wallets: Wallet[] = [];

    public constructor(public readonly neoExpressJsonFullPath: string) {
        this.basename = path.basename(neoExpressJsonFullPath);
        const jsonFileContents = fs.readFileSync(this.neoExpressJsonFullPath, { encoding: 'utf8' });
        const neoExpressConfig = JSON.parse(jsonFileContents);
        this.parseWallets(neoExpressConfig);
    }

    private parseWallets(neoExpressConfig: any) {
        //
        // TODO: Add 'genesis' wallet to list
        //
        const walletConfigs: any[] = neoExpressConfig.wallets || [];
        this.wallets.length = 0;
        walletConfigs.forEach(walletConfig => {
            const walletName: string = walletConfig.name;
            const accounts: any[] = walletConfig.accounts;
            if (walletName && accounts) {
                accounts.forEach(accountConfig => {
                    const accountLabel: string | null = accountConfig['label'];
                    const isDefault: boolean = !!accountConfig['is-default'];
                    const privateKey: string | null = accountConfig['private-key'];
                    if (privateKey) {
                        this.wallets.push(new Wallet(walletName, accountLabel, isDefault, privateKey));
                    }
                });
            }
        });
    }

}