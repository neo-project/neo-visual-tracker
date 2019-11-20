import { htmlHelpers } from "./htmlHelpers";
import { trackerEvents } from "./trackerEvents";
import { trackerSelectors } from "./trackerSelectors";

const trackerRenderers = {
    
    assetName: function(assetId: string, assets: any) {
        const assetInfo = assets[assetId];
        if (assetInfo) {
            const assetNames = assetInfo.name;
            if (assetNames && assetNames.length) {
                for (let i = 0; i < assetNames.length; i++) {
                    if (assetNames[i].lang === "en") {
                        let result = assetNames[i].name || assetId;
                        if (result === 'AntCoin') {
                            result = 'GAS';
                        } else if (result === 'AntShare') {
                            result = 'NEO';
                        }
                        return result;
                    }
                }
            }
        }
        return assetId;
    },

    renderAddress: function(unspentsInfo: any | undefined, claimableInfo: any | undefined, postMessage: any) {
        if (unspentsInfo) {
            htmlHelpers.setPlaceholder(trackerSelectors.AddressDetailsHash, htmlHelpers.text(unspentsInfo.address));
            htmlHelpers.showHide(trackerSelectors.AddressDetailsGetUnspentsNotSupported, !unspentsInfo.getUnspentsSupport);
            htmlHelpers.showHide(trackerSelectors.AddressDetailsGetUnspentsSupported, !!unspentsInfo.getUnspentsSupport);
            if (unspentsInfo.getUnspentsSupport) {
                const unspentAssetTemplate = document.querySelector(trackerSelectors.AddressDetailsUnspentAssetTemplate);
                const placeholderArea = document.querySelector(trackerSelectors.AddressDetailsGetUnspentsSupported);
                if (unspentAssetTemplate && placeholderArea) {
                    htmlHelpers.clearChildren(placeholderArea);
                    for (let assetName in unspentsInfo.assets) {
                        const unspentAsset = document.createElement('div');
                        unspentAsset.innerHTML = unspentAssetTemplate.innerHTML;
                        const assetNameElement = unspentAsset.querySelector(trackerSelectors.AddressDetailsUnspentAssetName);
                        const tbody = unspentAsset.querySelector('tbody');
                        if (assetNameElement && tbody) {
                            let assetBalance = 0;
                            if (unspentsInfo.assets[assetName].unspent) {
                                for (let i = 0; i < unspentsInfo.assets[assetName].unspent.length; i++) {
                                    const txid = unspentsInfo.assets[assetName].unspent[i].txid;
                                    const value = parseFloat(unspentsInfo.assets[assetName].unspent[i].value);
                                    assetBalance += value;
                                    const row = htmlHelpers.newTableRow(
                                        htmlHelpers.newEventLink(txid, trackerEvents.ShowTransaction, txid, postMessage),
                                        htmlHelpers.text(htmlHelpers.number(value) + ' ' + assetName),
                                        htmlHelpers.newCopyLink(JSON.stringify(unspentsInfo.assets[assetName].unspent[i]), postMessage));
                                    tbody.appendChild(row);
                                }
                                tbody.appendChild(
                                    htmlHelpers.newTableHead(
                                        htmlHelpers.text('Total'), 
                                        htmlHelpers.text(htmlHelpers.number(assetBalance) + ' ' + assetName),
                                        htmlHelpers.text(' ')));
                            }
                            htmlHelpers.clearChildren(assetNameElement);
                            assetNameElement.appendChild(htmlHelpers.text(assetName));
                            placeholderArea.appendChild(unspentAsset);
                        }
                    }
                }
            } 
        }
        if (claimableInfo) {
            htmlHelpers.showHide(trackerSelectors.AddressDetailsGetClaimableNotSupported, !claimableInfo.getClaimableSupport);
            htmlHelpers.showHide(trackerSelectors.AddressDetailsGetClaimableSupported, !!claimableInfo.getClaimableSupport);
            if (claimableInfo.getClaimableSupport) {
                const placeholderArea = document.querySelector(trackerSelectors.AddressDetailsGetClaimableSupported);
                if (placeholderArea) {
                    const tbody = placeholderArea.querySelector('tbody');
                    if (tbody) {
                        htmlHelpers.clearChildren(tbody);
                        if (claimableInfo.claimable && claimableInfo.claimable.length) {
                            for (let i = 0; i < claimableInfo.claimable.length; i++) {
                                const txid = claimableInfo.claimable[i].txid;
                                const value = parseFloat(claimableInfo.claimable[i].unclaimed);
                                const row = htmlHelpers.newTableRow(
                                    htmlHelpers.newEventLink(txid, trackerEvents.ShowTransaction, txid, postMessage),
                                    htmlHelpers.text(htmlHelpers.number(value) + ' GAS'),
                                    htmlHelpers.newCopyLink(JSON.stringify(claimableInfo.claimable[i]), postMessage));
                                tbody.appendChild(row);
                            }
                            tbody.appendChild(
                                htmlHelpers.newTableHead(
                                    htmlHelpers.text('Total'), 
                                    htmlHelpers.text(htmlHelpers.number(claimableInfo.unclaimed) + ' GAS'),
                                    htmlHelpers.text(' ')));
                        } else {
                            htmlHelpers.showHide(trackerSelectors.AddressDetailsGetClaimableSupported, false);
                        }
                    }
                }
            } 
        }
    },

    renderBlockchainInfo: function(blockchainInfo: any) {
        if (blockchainInfo) {
            htmlHelpers.setPlaceholder(trackerSelectors.BlockHeight, htmlHelpers.text(htmlHelpers.number(blockchainInfo.height)));
            htmlHelpers.setPlaceholder(trackerSelectors.RpcUrl, htmlHelpers.text(blockchainInfo.url));
            htmlHelpers.setPlaceholder(trackerSelectors.RpcStatus, htmlHelpers.text(blockchainInfo.online ? 'Connected to' : 'Connecting to'));
        }
    },

    renderBlock: function(block: any | undefined, postMessage : any) {
        if (block) {
            htmlHelpers.setPlaceholder(trackerSelectors.BlockDetailHash, htmlHelpers.text(block.hash));
            htmlHelpers.setPlaceholder(trackerSelectors.BlockDetailIndex, htmlHelpers.text(htmlHelpers.number(block.index)));
            htmlHelpers.setPlaceholder(trackerSelectors.BlockDetailTime, htmlHelpers.text(htmlHelpers.time(block.time)));
            htmlHelpers.setPlaceholder(trackerSelectors.BlockDetailSize, htmlHelpers.text(htmlHelpers.number(block.size) + ' bytes'));
            htmlHelpers.setPlaceholder(trackerSelectors.BlockDetailVersion, htmlHelpers.text(block.version));
            htmlHelpers.setPlaceholder(trackerSelectors.BlockDetailMerkleRoot, htmlHelpers.text(block.merkleroot));
            htmlHelpers.setPlaceholder(trackerSelectors.BlockDetailTransactions, htmlHelpers.text(block.tx.length));
            htmlHelpers.setPlaceholder(
                trackerSelectors.BlockDetailValidator, 
                htmlHelpers.newEventLink(block.nextconsensus, trackerEvents.ShowAddress, block.nextconsensus, postMessage));

            if ((block.index > 0) && block.previousblockhash) {
                htmlHelpers.setPlaceholder(
                    trackerSelectors.BlockDetailPreviousLink, 
                    htmlHelpers.newEventLink(block.previousblockhash, trackerEvents.ShowBlock, block.index - 1, postMessage));
            } else {
                htmlHelpers.setPlaceholder(trackerSelectors.BlockDetailPreviousLink, htmlHelpers.text('None'));
            }

            if (block.nextblockhash) {
                htmlHelpers.setPlaceholder(
                    trackerSelectors.BlockDetailNextLink, 
                    htmlHelpers.newEventLink(block.nextblockhash, trackerEvents.ShowBlock, block.index + 1, postMessage));
            } else {
                htmlHelpers.setPlaceholder(trackerSelectors.BlockDetailNextLink, htmlHelpers.text('None'));
            }

            const txTbody = document.querySelector(trackerSelectors.BlockDetailTransactionsTable);
            if (txTbody) {
                htmlHelpers.clearChildren(txTbody);
                for (let i = 0; i < block.tx.length; i++) {
                    const tx = block.tx[i];
                    const row = htmlHelpers.newTableRow(
                        htmlHelpers.text(tx.type),
                        htmlHelpers.newEventLink(tx.txid, trackerEvents.ShowTransaction, tx.txid, postMessage),
                        htmlHelpers.text(htmlHelpers.number(tx.size) + ' bytes'),
                        htmlHelpers.text(htmlHelpers.number(tx.net_fee) + ' GAS'),
                        htmlHelpers.text(htmlHelpers.number(tx.sys_fee) + ' GAS'));
                        txTbody.appendChild(row);
                }
            }
        }
    },

    renderBlocks: function (blocks: any[], firstBlock: number | undefined, postMessage: any) {
        htmlHelpers.setEnabled(trackerSelectors.BlocksPaginationPrevious, firstBlock !== undefined);
        htmlHelpers.setEnabled(trackerSelectors.BlocksPaginationFirst, firstBlock !== undefined);
        if (blocks.length) {
            htmlHelpers.setEnabled(trackerSelectors.BlocksPaginationNext, blocks[blocks.length - 1].index !== 0);
            htmlHelpers.setEnabled(trackerSelectors.BlocksPaginationLast, blocks[blocks.length - 1].index !== 0);
        }

        const tbody = document.querySelector(trackerSelectors.BlocksTableBody);
        if (tbody) {
            htmlHelpers.clearChildren(tbody);
            for (let i = 0; i < blocks.length; i++) {
                const contents = blocks[i];
                const row = htmlHelpers.newTableRow(
                    htmlHelpers.newEventLink(htmlHelpers.number(contents.index), trackerEvents.ShowBlock, contents.index, postMessage),
                    htmlHelpers.text(htmlHelpers.time(contents.time)),
                    htmlHelpers.text(contents.tx.length),
                    htmlHelpers.newEventLink(contents.nextconsensus, trackerEvents.ShowAddress, contents.nextconsensus, postMessage),
                    htmlHelpers.text(htmlHelpers.number(contents.size) + ' bytes'));
                tbody.appendChild(row);
            }
        }
    },

    renderInputsOutputs: function(tbodySelector: string, inputOutputList: any[], assets: any, clear: boolean, negate: boolean, postMessage: any) {
        const tbody = document.querySelector(tbodySelector);
        if (tbody) {
            if (clear) {
                htmlHelpers.clearChildren(tbody);
            }
            for (let i = 0; i < inputOutputList.length; i++) {
                const inputOutput = inputOutputList[i];
                if (negate) {
                    inputOutput.value *= -1;
                }
                const row = htmlHelpers.newTableRow(
                    htmlHelpers.newEventLink(inputOutput.address, trackerEvents.ShowAddress, inputOutput.address, postMessage),
                    htmlHelpers.text(htmlHelpers.number(inputOutput.value) + ' ' + this.assetName(inputOutput.asset, assets)));
                tbody.appendChild(row);
            }
            return inputOutputList.length;
        }
        return 0;
    },

    renderTransaction: function(transaction: any | undefined, postMessage: any) {
        if (transaction) {
            htmlHelpers.setPlaceholder(trackerSelectors.TransactionDetailType, htmlHelpers.text(transaction.type));
            htmlHelpers.setPlaceholder(trackerSelectors.TransactionDetailHash, htmlHelpers.text(transaction.txid));
            htmlHelpers.setPlaceholder(trackerSelectors.TransactionDetailTime, htmlHelpers.text(htmlHelpers.time(transaction.blocktime)));
            htmlHelpers.setPlaceholder(trackerSelectors.TransactionDetailNetworkFee, htmlHelpers.text(htmlHelpers.number(transaction.net_fee) + ' GAS'));
            htmlHelpers.setPlaceholder(trackerSelectors.TransactionDetailSystemFee, htmlHelpers.text(htmlHelpers.number(transaction.sys_fee) + ' GAS'));
            htmlHelpers.setPlaceholder(trackerSelectors.TransactionDetailSize, htmlHelpers.text(htmlHelpers.number(transaction.size) + ' bytes'));
            htmlHelpers.setPlaceholder(
                trackerSelectors.TransactionDetailBlock, 
                htmlHelpers.newEventLink(transaction.blockhash, trackerEvents.ShowBlock, transaction.blockhash, postMessage));
            let valueTransferCount = 0;
            valueTransferCount += this.renderInputsOutputs(trackerSelectors.TransactionDetailInputsClaimsTable, transaction.claimsAugmented, transaction.assets, true, false, postMessage);
            valueTransferCount += this.renderInputsOutputs(trackerSelectors.TransactionDetailInputsClaimsTable, transaction.vinAugmented, transaction.assets, false, true, postMessage);
            valueTransferCount += this.renderInputsOutputs(trackerSelectors.TransactionDetailOutputsTable, transaction.vout, transaction.assets, true, false, postMessage);
            htmlHelpers.showHide(trackerSelectors.TransactionValueTransferTable, valueTransferCount > 0, true);
            const scriptsTbody = document.querySelector(trackerSelectors.TransactionScriptsTableBody);
            htmlHelpers.showHide(trackerSelectors.TransactionMainScriptArea, transaction.scriptDisassembled, true);
            htmlHelpers.setPlaceholder(trackerSelectors.TransactionMainScriptBody, htmlHelpers.text(transaction.scriptDisassembled));
            htmlHelpers.showHide(trackerSelectors.TransactionScriptsTable, transaction.scripts.length > 0, true);
            if (scriptsTbody) {
                htmlHelpers.clearChildren(scriptsTbody);
                for (let i = 0; i < transaction.scripts.length; i++) {
                    const script = transaction.scripts[i];
                    scriptsTbody.appendChild(
                        htmlHelpers.newTableRow(htmlHelpers.text('Invocation:'), htmlHelpers.text(script.invocationDisassembled)));
                    scriptsTbody.appendChild(
                        htmlHelpers.newTableRow(htmlHelpers.text('Verification:'), htmlHelpers.text(script.verificationDisassembled)));
                }
            }
            if (!transaction.applicationLogsSupported) {
                htmlHelpers.showHide(trackerSelectors.TransactionApplicationLog, true, true);
                htmlHelpers.setPlaceholder(
                    trackerSelectors.TransactionApplicationLogBody,
                    htmlHelpers.text('This RPC server does not support the getapplicationlog method.'));
            } else if (!transaction.applicationLog || !transaction.applicationLog.result) {
                htmlHelpers.showHide(trackerSelectors.TransactionApplicationLog, false, true);
            } else {
                htmlHelpers.showHide(trackerSelectors.TransactionApplicationLog, true, true);
                htmlHelpers.setPlaceholder(
                    trackerSelectors.TransactionApplicationLogBody,
                    htmlHelpers.text(JSON.stringify(transaction.applicationLog.result.executions || [], undefined, 4)));
            }
        }
    },

    setPage: function(activePage: string) {
        const allPages = document.querySelectorAll(trackerSelectors.AllPages);
        for (let i = 0; i < allPages.length; i++) {
            const id = allPages[i].id;
            (allPages[i] as any).style.display = id === activePage ? 'block' : 'none';
        }
    },
};

export { trackerRenderers };