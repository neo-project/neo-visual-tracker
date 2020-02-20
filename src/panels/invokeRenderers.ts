import { htmlHelpers } from "./htmlHelpers";
import { invokeEvents } from "./invokeEvents";
import { invokeSelectors } from "./invokeSelectors";

const invokeRenderers = {

    render: function(viewState: any, updateViewState: Function, postMessage: Function) {
        htmlHelpers.setPlaceholder(invokeSelectors.RpcDescription, htmlHelpers.text(viewState.rpcDescription));
        htmlHelpers.setPlaceholder(invokeSelectors.RpcUrl, htmlHelpers.text(viewState.rpcUrl));
        this.renderContracts(
            viewState.contracts, 
            viewState.selectedContract, 
            viewState.selectedMethod, 
            viewState.wallets,
            viewState.checkpoints,
            updateViewState, 
            postMessage);
        this.renderBroadcastResult(viewState.broadcastResult, postMessage);
        this.renderInvokeError(viewState.invocationError);
        this.renderInvokeResult(viewState);
    },

    renderBroadcastResult: function(txid: string, postMessage: Function) {
        if (txid) {
            const resultPlaceholder = document.querySelector(invokeSelectors.BroadcastResultText) as HTMLElement;
            htmlHelpers.clearChildren(resultPlaceholder);
            const searchLink = htmlHelpers.newEventLink(
                txid,
                invokeEvents.Search,
                txid,
                postMessage);
            resultPlaceholder.appendChild(htmlHelpers.text('Transaction created: '));
            resultPlaceholder.appendChild(searchLink);
            htmlHelpers.showHide(invokeSelectors.BroadcastResultPopup, true);
        } else {
            htmlHelpers.showHide(invokeSelectors.BroadcastResultPopup, false);
        }
    },

    renderCheckpoints: function(parent: ParentNode, checkpoints: any[], selectedCheckpoint: string, setSelected: Function) {
        const placeholder = parent.querySelector(invokeSelectors.CheckpointDropdown) as HTMLElement;
        if (placeholder) {
            htmlHelpers.clearChildren(placeholder);
            const dropdown = document.createElement('select') as HTMLSelectElement;
            placeholder.appendChild(dropdown);
            const noneItem = document.createElement('option');
            noneItem.value = '';
            noneItem.innerText = '(none)';
            dropdown.appendChild(noneItem);    
            for (let i = 0; i < checkpoints.length; i++) {
                const checkpoint = checkpoints[i];
                const item = document.createElement('option');
                item.value = checkpoint.fullpath;
                item.innerText = checkpoint.label;
                if (selectedCheckpoint === checkpoint.fullpath) {
                    item.selected = true;
                }
                dropdown.appendChild(item);
            }
            dropdown.addEventListener('change', _ => {
                setSelected(dropdown.options[dropdown.selectedIndex].value);
                dropdown.blur();
            });
        }
    },

    renderContracts: function(
        contracts: any[], 
        selectedContract: string, 
        selectedMethod: string, 
        wallets: any[],
        checkpoints: any[],
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
                    if (selectedContract === contractData.hash) {
                        htmlHelpers.addClass(thisContract.firstElementChild as HTMLElement, 'selectedContract');
                    }
                    const clickable = thisContract.querySelector(invokeSelectors.Clickable);
                    if (clickable) {
                        clickable.addEventListener(
                            'click', 
                            () => {
                                htmlHelpers.hideAll(placeholder, invokeSelectors.ContractDetail);
                                htmlHelpers.removeAllClass(document.body, 'selectedContract');
                                updateViewState((viewState: any) => {
                                    viewState.selectedContract = (viewState.selectedContract === contractData.hash) ? '' : contractData.hash;
                                    if (viewState.selectedContract === contractData.hash) {
                                        htmlHelpers.addClass(thisContract.firstElementChild as HTMLElement, 'selectedContract');
                                    }
                                    (thisContractDetail as any).style.display = (viewState.selectedContract === contractData.hash) ? 'block' : 'none';
                                });
                            });
                    }
                    this.renderMethods(
                        thisContractDetail, 
                        contractData.hash,
                        contractData.functions || [],
                        selectedMethod,
                        wallets,
                        checkpoints,
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

    renderInvokeResult: function(viewstate: any) {
        if (viewstate.showResult) {
            htmlHelpers.setPlaceholder(invokeSelectors.InvocationResultGasUsed, htmlHelpers.text(viewstate.resultGasUsed));
            htmlHelpers.setPlaceholder(invokeSelectors.InvocationResultVMState, htmlHelpers.text(viewstate.resultVmState));
            const resultsPlaceholder = document.querySelector(invokeSelectors.InvocationResultsPlaceholder);
            const resultTemplate = document.querySelector(invokeSelectors.InvocationResultTemplate);
            const noResultsTemplate = document.querySelector(invokeSelectors.InvocationNoResultsTemplate);
            if (resultsPlaceholder && resultTemplate && noResultsTemplate) {
                htmlHelpers.clearChildren(resultsPlaceholder);
                if (viewstate.resultValues && viewstate.resultValues.length) {
                    for (let i = 0; i < viewstate.resultValues.length; i++) {
                        const result = viewstate.resultValues[i];
                        const resultElement = document.createElement('table');
                        resultElement.innerHTML = resultTemplate.innerHTML;
                        htmlHelpers.setInnerPlaceholder(resultElement, invokeSelectors.ResultAsData, htmlHelpers.text(result.asByteArray));
                        htmlHelpers.setInnerPlaceholder(resultElement, invokeSelectors.ResultAsNumber, htmlHelpers.text(result.asInteger));
                        htmlHelpers.setInnerPlaceholder(resultElement, invokeSelectors.ResultAsString, htmlHelpers.text(result.asString));
                        htmlHelpers.setInnerPlaceholder(resultElement, invokeSelectors.ResultAsAddress, htmlHelpers.text(result.asAddress));
                        resultsPlaceholder.appendChild(resultElement);
                    }
                } else {
                    const resultElement = document.createElement('div');
                    resultElement.innerHTML = noResultsTemplate.innerHTML;
                    resultsPlaceholder.appendChild(resultElement);
                }
            }
            htmlHelpers.showHide(invokeSelectors.InvocationResultPopup, true);
        } else {
            htmlHelpers.showHide(invokeSelectors.InvocationResultPopup, false);
        }
    },

    renderMethods: function(
        contractDetailElement: ParentNode,
        contractHash: string, 
        methods: any[], 
        selectedMethod: string, 
        wallets: any[],
        checkpoints: any[],
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
                    if (selectedMethod === methodId) {
                        htmlHelpers.addClass(thisMethod.firstElementChild as HTMLElement, 'selectedMethod');
                    }
                    const clickable = thisMethod.querySelector(invokeSelectors.Clickable);
                    if (clickable) {
                        clickable.addEventListener(
                            'click', 
                            () => {
                                htmlHelpers.hideAll(placeholder, invokeSelectors.MethodDetail);
                                htmlHelpers.removeAllClass(document.body, 'selectedMethod');
                                updateViewState((viewState: any) => {
                                    viewState.selectedMethod = (viewState.selectedMethod === methodId) ? '' : methodId;
                                    if (viewState.selectedMethod === methodId) {
                                        htmlHelpers.addClass(thisMethod.firstElementChild as HTMLElement, 'selectedMethod');
                                    }
                                    (thisMethodDetail as any).style.display = (viewState.selectedMethod === methodId) ? 'block' : 'none';
                                });
                            });
                    }
                    this.renderParameters(thisMethodDetail, methodData.parameters, updateViewState);
                    this.renderIntents(thisMethodDetail, methodData, updateViewState);
                    const launchDebuggerButton = thisMethodDetail.querySelector(invokeSelectors.LaunchDebuggerButton);
                    if (launchDebuggerButton) {
                        htmlHelpers.setOnClickEvent(launchDebuggerButton, invokeEvents.Debug, methodData.name, postMessage);
                    }
                    const invokeOffChainButton = thisMethodDetail.querySelector(invokeSelectors.InvokeOffChainButton);
                    if (invokeOffChainButton) {
                        htmlHelpers.setOnClickEvent(invokeOffChainButton, invokeEvents.InvokeOffChain, methodData.name, postMessage);
                    }
                    const invokeOnChainButton = thisMethodDetail.querySelector(invokeSelectors.InvokeOnChainButton);
                    if (invokeOnChainButton) {
                        htmlHelpers.setOnClickEvent(invokeOnChainButton, invokeEvents.InvokeOnChain, methodData.name, postMessage);
                    }
                    this.renderWallets(
                        thisMethod, 
                        wallets, 
                        methodData.walletAddress, 
                        (w: string) => { methods[i].walletAddress = w; updateViewState(); });
                    this.renderCheckpoints(
                        thisMethod, 
                        checkpoints, 
                        methodData.selectedCheckpoint, 
                        (c: string) => { methods[i].selectedCheckpoint = c; updateViewState(); });
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

    renderWallets: function(parent: ParentNode, wallets: any[], selectedWalletAddress: string, setSelected: Function) {
        const placeholder = parent.querySelector(invokeSelectors.WalletDropdown) as HTMLElement;
        
        if (placeholder) {
            htmlHelpers.clearChildren(placeholder);
            const dropdown = document.createElement('select') as HTMLSelectElement;
            placeholder.appendChild(dropdown);
            if (wallets.length === 0) {
                const noneItem = document.createElement('option');
                noneItem.value = '';
                noneItem.innerText = '(Create a wallet to continue)';
                dropdown.appendChild(noneItem);
                setSelected(undefined);
            } else {
                const noneItem = document.createElement('option');
                noneItem.value = '';
                noneItem.innerText = '(Select a wallet...)';
                dropdown.appendChild(noneItem);
                for (let i = 0; i < wallets.length; i++) {
                    const item = document.createElement('option');
                    item.value = wallets[i].address;
                    item.innerText = wallets[i].description;
                    if (selectedWalletAddress === wallets[i].address) {
                        item.selected = true;
                    }
                    dropdown.appendChild(item);
                }
                dropdown.addEventListener('change', _ => {
                    setSelected(dropdown.options[dropdown.selectedIndex].value);
                    dropdown.blur();
                });
            }
        }
    },
};

export { invokeRenderers };