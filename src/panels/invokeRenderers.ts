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
        this.renderInvokeResult(viewState.invocationResult);
        this.renderInvokeError(viewState.invocationError);
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

    renderIntents: function(
        methodDetailElement: ParentNode, 
        methodData: any,
        updateViewState: Function) {

        const intentSymbolInput = methodDetailElement.querySelector(invokeSelectors.IntentSymbol) as HTMLInputElement;
        const intentValueInput = methodDetailElement.querySelector(invokeSelectors.IntentValue) as HTMLInputElement;
        if (intentSymbolInput && intentValueInput) {
            intentSymbolInput.value = (methodData.intentSymbol || 'NEO');
            intentValueInput.value = (methodData.intentValue || '0');
            const handler = () => {
                methodData.intentSymbol = intentSymbolInput.value;
                methodData.intentValue = intentValueInput.value;
                updateViewState();
            };
            intentSymbolInput.addEventListener('change', handler);
            intentSymbolInput.addEventListener('keyup', handler);
            intentValueInput.addEventListener('change', handler);
            intentValueInput.addEventListener('keyup', handler);
        }
    },

    renderInvokeError: function(error: string) {
        if (error) {
            htmlHelpers.showHide(invokeSelectors.InvocationErrorPopup, true);
            htmlHelpers.setPlaceholder(invokeSelectors.InvocationErrorText, htmlHelpers.text(error));
        } else {
            htmlHelpers.showHide(invokeSelectors.InvocationErrorPopup, false);
        }
    },

    renderInvokeResult: function(result: string) {
        if (result) {
            htmlHelpers.showHide(invokeSelectors.InvocationResultPopup, true);
            htmlHelpers.setPlaceholder(invokeSelectors.InvocationResultText, htmlHelpers.text(result));
        } else {
            htmlHelpers.showHide(invokeSelectors.InvocationResultPopup, false);
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
        const instructionsTemplate = document.querySelector(invokeSelectors.InvokeInstructionsTemplate);
        if (placeholder && methodTemplate && instructionsTemplate) {
            for (let i = 0; i < methods.length; i++) {
                const methodData = methods[i];
                const methodId = contractHash + '.' + methodData.name;
                const thisMethod = document.createElement('div');
                thisMethod.innerHTML = methodTemplate.innerHTML;
                const thisMethodDetail = thisMethod.querySelector(invokeSelectors.MethodDetail);
                const instructionsPlaceholder = thisMethod.querySelector(invokeSelectors.InstructionsPlaceholder);
                if (thisMethodDetail && instructionsPlaceholder) {
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
                    this.renderParameters(thisMethodDetail, methodData.parameters, updateViewState);
                    this.renderIntents(thisMethodDetail, methodData, updateViewState);
                    const invokeButton = thisMethodDetail.querySelector(invokeSelectors.InvokeButton);
                    if (invokeButton) {
                        htmlHelpers.setOnClickEvent(invokeButton, invokeEvents.Invoke, methodData.name, postMessage);
                    }
                    instructionsPlaceholder.innerHTML = instructionsTemplate.innerHTML;
                    placeholder.appendChild(thisMethod);
                }
            }
        }
    },

    renderParameters: function(
        methodDetailElement: ParentNode, 
        parameters: any[],
        updateViewState: Function) {

        const area = methodDetailElement.querySelector(invokeSelectors.ParametersInputArea);
        const placeholder = methodDetailElement.querySelector(invokeSelectors.ParametersPlaceholder);
        const parameterTemplate = document.querySelector(invokeSelectors.ParameterTemplate);
        if (area && placeholder && parameterTemplate) {
            (area as any).style.display = (parameters.length > 0) ? 'block' : 'none';
            for (let i = 0 ; i < parameters.length; i++) {
                const parameterData = parameters[i];
                const thisParameter = document.createElement('tr');
                thisParameter.innerHTML = parameterTemplate.innerHTML;
                htmlHelpers.setInnerPlaceholder(thisParameter, invokeSelectors.ParameterName, htmlHelpers.text(parameterData.name));
                htmlHelpers.setInnerPlaceholder(thisParameter, invokeSelectors.ParameterType, htmlHelpers.text('(' + parameterData.type + ')'));
                const input = thisParameter.querySelector(invokeSelectors.ParameterInput) as HTMLInputElement;
                if (input) {
                    if (parameterData.value) {
                        input.value = parameterData.value;
                    }
                    const handler = () => {
                        parameterData.value = input.value;
                        updateViewState();
                    };
                    input.addEventListener('change', handler);
                    input.addEventListener('keyup', handler);
                }
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
                        const address = accounts[j]['script-hash'];
                        if (privateKey) {
                            const item = document.createElement('option');
                            item.value = privateKey;
                            item.innerText = walletName + ' - ' + address;
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