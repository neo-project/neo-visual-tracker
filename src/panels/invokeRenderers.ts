import { htmlHelpers } from "./htmlHelpers";
import { invokeEvents } from "./invokeEvents";
import { invokeSelectors } from "./invokeSelectors";

const invokeRenderers = {
    
    render: function(viewState: any, updateViewState: Function, postMessage: Function) {
        htmlHelpers.setPlaceholder(invokeSelectors.JsonFileName, htmlHelpers.text(viewState.neoExpressJsonFileName));
        htmlHelpers.setPlaceholder(invokeSelectors.JsonFilePath, htmlHelpers.text(viewState.neoExpressJsonFullPath));
        htmlHelpers.setPlaceholder(invokeSelectors.RpcUrl, htmlHelpers.text(viewState.rpcUrl));
        this.renderWallets(viewState.wallets, viewState.selectedWallet);
        this.renderContracts(
            viewState.contracts, 
            viewState.selectedContract, 
            viewState.selectedMethod, 
            updateViewState, 
            postMessage);
    },

    renderContracts: function(
        contracts: any[], 
        selectedContract: string, 
        selectedMethod: string, 
        updateViewState: Function,
        postMessage: Function) {

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
                                htmlHelpers.hideAll(placeholder, invokeSelectors.ContractDetail);
                                updateViewState((viewState: any) => {
                                    viewState.selectedContract = (viewState.selectedContract === contractData.hash) ? '' : contractData.hash;
                                    (thisContractDetail as any).style.display = (viewState.selectedContract === contractData.hash) ? 'block' : 'none';
                                });
                            });
                    }
                    this.renderMethods(
                        thisContractDetail, 
                        contractData.hash,
                        contractData.functions || [],
                        selectedMethod,
                        updateViewState,
                        postMessage);
                    placeholder.appendChild(thisContract);
                }
            }
        }
    },

    renderMethods: function(
        contractDetailElement: ParentNode,
        contractHash: string, 
        methods: any[], 
        selectedMethod: string, 
        updateViewState: Function,
        postMessage: Function) {

        const placeholder = contractDetailElement.querySelector(invokeSelectors.MethodsPlaceholder);
        const methodTemplate = document.querySelector(invokeSelectors.MethodTemplate);
        if (placeholder && methodTemplate) {
            for (let i = 0; i < methods.length; i++) {
                const methodData = methods[i];
                const methodId = contractHash + '.' + methodData.name;
                const thisMethod = document.createElement('div');
                thisMethod.innerHTML = methodTemplate.innerHTML;
                const thisMethodDetail = thisMethod.querySelector(invokeSelectors.MethodDetail);
                if (thisMethodDetail) {
                    htmlHelpers.setInnerPlaceholder(thisMethod, invokeSelectors.MethodName, htmlHelpers.text(methodData.name));
                    (thisMethodDetail as any).style.display = selectedMethod === methodId ? 'block' : 'none';
                    const clickable = thisMethod.querySelector(invokeSelectors.Clickable);
                    if (clickable) {
                        clickable.addEventListener(
                            'click', 
                            () => {
                                htmlHelpers.hideAll(placeholder, invokeSelectors.MethodDetail);
                                updateViewState((viewState: any) => {
                                    viewState.selectedMethod = (viewState.selectedMethod === methodId) ? '' : methodId;
                                    (thisMethodDetail as any).style.display = (viewState.selectedMethod === methodId) ? 'block' : 'none';
                                });
                            });
                    }
                    this.renderParameters(thisMethodDetail, methodData.parameters);
                    const invokeButton = thisMethodDetail.querySelector(invokeSelectors.InvokeButton);
                    if (invokeButton) {
                        htmlHelpers.setOnClickEvent(invokeButton, invokeEvents.Invoke, methodData.name, postMessage);
                    }
                    placeholder.appendChild(thisMethod);
                }
            }
        }
    },

    renderParameters: function(
        methodDetailElement: ParentNode, 
        parameters: any[]) {

        const placeholder = methodDetailElement.querySelector(invokeSelectors.ParametersPlaceholder);
        const parameterTemplate = document.querySelector(invokeSelectors.ParameterTemplate);
        if (placeholder && parameterTemplate) {
            for (let i = 0 ; i < parameters.length; i++) {
                const parameterData = parameters[i];
                const thisParameter = document.createElement('div');
                thisParameter.innerHTML = parameterTemplate.innerHTML;
                // TODO: Populate thisParameter DOM with data from parameterData
                placeholder.appendChild(thisParameter);
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