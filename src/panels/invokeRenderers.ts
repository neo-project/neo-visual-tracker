import { htmlHelpers } from "./htmlHelpers";
import { invokeSelectors } from "./invokeSelectors";

const invokeRenderers = {
    
    render: function(viewState: any, updateViewState: any) {
        htmlHelpers.setPlaceholder(invokeSelectors.JsonFileName, htmlHelpers.text(viewState.neoExpressJsonFileName));
        htmlHelpers.setPlaceholder(invokeSelectors.JsonFilePath, htmlHelpers.text(viewState.neoExpressJsonFullPath));
        this.renderWallets(viewState.wallets, viewState.selectedWallet);
        this.renderContracts(viewState.contracts, viewState.selectedContract, updateViewState);
    },

    renderContracts: function(contracts: any[], selectedContract: string, updateViewState: any) {
        const placeholder = document.querySelector(invokeSelectors.ContractsPlaceholder);
        const contractTemplate = document.querySelector(invokeSelectors.ContractTemplate);
        if (placeholder && contractTemplate) {
            htmlHelpers.clearChildren(placeholder);
            for (let i = 0; i < contracts.length; i++) {
                const contractData = contracts[i];
                const thisContract = document.createElement('div');
                thisContract.innerHTML = contractTemplate.innerHTML;
                const thisContractDetail = thisContract.querySelector(invokeSelectors.ContractDetail);
                if (thisContractDetail) {
                    htmlHelpers.setInnerPlaceholder(thisContract, invokeSelectors.ContractName, htmlHelpers.text(contractData.name));
                    (thisContractDetail as any).style.display = selectedContract === contractData.hash ? 'block' : 'none';
                    const clickable = thisContract.querySelector(invokeSelectors.Clickable);
                    if (clickable) {
                        clickable.addEventListener(
                            'click', 
                            () => {
                                htmlHelpers.hideAll(invokeSelectors.ContractDetail);
                                updateViewState((viewState: any) => {
                                    viewState.selectedContract = (viewState.selectedContract === contractData.hash) ? '' : contractData.hash;
                                    (thisContractDetail as any).style.display = (viewState.selectedContract === contractData.hash) ? 'block' : 'none';
                                });
                            });
                    }
                    placeholder.appendChild(thisContract);
                }
            }
        }
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