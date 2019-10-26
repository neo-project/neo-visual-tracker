import { htmlHelpers } from "./htmlHelpers";
import { invokeSelectors } from "./invokeSelectors";

const invokeRenderers = {
    
    render: function(viewState: any) {
        htmlHelpers.setPlaceholder(invokeSelectors.JsonFileName, htmlHelpers.text(viewState.neoExpressJsonFileName));
        htmlHelpers.setPlaceholder(invokeSelectors.JsonFilePath, htmlHelpers.text(viewState.neoExpressJsonFullPath));
        this.renderWallets(viewState.wallets, viewState.selectedWallet);
    },

    renderWallets: function(wallets: any[], selectedWallet: string) {
        const dropdown = document.querySelector(invokeSelectors.WalletDropdown);
        if (dropdown) {
            htmlHelpers.clearChildren(dropdown);
            const noneItem = document.createElement('option');
            noneItem.value = '';
            noneItem.innerText = '(none)';
            dropdown.appendChild(noneItem);
            for (let i = 0; i < wallets.length; i++) {
                const walletName = wallets[i].name;
                const accounts = wallets[i].accounts;
                if (accounts && accounts.length) {
                    for (let j = 0; j < accounts.length; j++) {
                        const privateKey = accounts[j]['private-key'];
                        if (privateKey) {
                            const item = document.createElement('option');
                            item.value = privateKey;
                            item.innerText = walletName + ' - ' + privateKey;
                            if (selectedWallet === privateKey) {
                                item.selected = true;
                            }
                            dropdown.appendChild(item);
                        }
                    }
                }
            }
        }
    },
};

export { invokeRenderers };