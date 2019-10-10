import { htmlHelpers } from "./htmlHelpers";
import { panelEvents } from "./panelEvents";
import { selectors } from "./selectors";

const renderers = {
    
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

    renderBlockchainInfo: function(blockchainInfo: any) {
        if (blockchainInfo) {
            htmlHelpers.setPlaceholder(selectors.BlockHeight, htmlHelpers.text(htmlHelpers.number(blockchainInfo.height)));
            htmlHelpers.setPlaceholder(selectors.RpcUrl, htmlHelpers.text(blockchainInfo.url));
            htmlHelpers.setPlaceholder(selectors.RpcStatus, htmlHelpers.text(blockchainInfo.online ? 'Connected to' : 'Connecting to'));
        }
    },

    renderBlock: function(block: any | undefined, postMessage : any) {
        if (block) {
            htmlHelpers.setPlaceholder(selectors.BlockDetailHash, htmlHelpers.text(block.hash));
            htmlHelpers.setPlaceholder(selectors.BlockDetailIndex, htmlHelpers.text(htmlHelpers.number(block.index)));
            htmlHelpers.setPlaceholder(selectors.BlockDetailTime, htmlHelpers.text(htmlHelpers.time(block.time)));
            htmlHelpers.setPlaceholder(selectors.BlockDetailValidator, htmlHelpers.text(block.nextconsensus));
            htmlHelpers.setPlaceholder(selectors.BlockDetailSize, htmlHelpers.text(htmlHelpers.number(block.size) + ' bytes'));
            htmlHelpers.setPlaceholder(selectors.BlockDetailVersion, htmlHelpers.text(block.version));
            htmlHelpers.setPlaceholder(selectors.BlockDetailMerkleRoot, htmlHelpers.text(block.merkleroot));
            htmlHelpers.setPlaceholder(selectors.BlockDetailTransactions, htmlHelpers.text(block.tx.length));

            if ((block.index > 0) && block.previousblockhash) {
                htmlHelpers.setPlaceholder(
                    selectors.BlockDetailPreviousLink, 
                    htmlHelpers.newEventLink(block.previousblockhash, panelEvents.ShowBlock, block.index - 1, postMessage));
            } else {
                htmlHelpers.setPlaceholder(selectors.BlockDetailPreviousLink, htmlHelpers.text('None'));
            }

            if (block.nextblockhash) {
                htmlHelpers.setPlaceholder(
                    selectors.BlockDetailNextLink, 
                    htmlHelpers.newEventLink(block.nextblockhash, panelEvents.ShowBlock, block.index + 1, postMessage));
            } else {
                htmlHelpers.setPlaceholder(selectors.BlockDetailNextLink, htmlHelpers.text('None'));
            }

            const txTbody = document.querySelector(selectors.BlockDetailTransactionsTable);
            if (txTbody) {
                htmlHelpers.clearChildren(txTbody);
                for (let i = 0; i < block.tx.length; i++) {
                    const tx = block.tx[i];
                    const row = htmlHelpers.newTableRow(
                        htmlHelpers.text(tx.type),
                        htmlHelpers.newEventLink(tx.txid, panelEvents.ShowTransaction, tx.txid, postMessage),
                        htmlHelpers.text(htmlHelpers.number(tx.size) + ' bytes'),
                        htmlHelpers.text(htmlHelpers.number(tx.net_fee) + ' GAS'),
                        htmlHelpers.text(htmlHelpers.number(tx.sys_fee) + ' GAS'));
                        txTbody.appendChild(row);
                }
            }
        }
    },

    renderBlocks: function (blocks: any[], firstBlock: number | undefined, postMessage: any) {
        htmlHelpers.setEnabled(selectors.BlocksPaginationPrevious, firstBlock !== undefined);
        htmlHelpers.setEnabled(selectors.BlocksPaginationFirst, firstBlock !== undefined);
        if (blocks.length) {
            htmlHelpers.setEnabled(selectors.BlocksPaginationNext, blocks[blocks.length - 1].index !== 0);
            htmlHelpers.setEnabled(selectors.BlocksPaginationLast, blocks[blocks.length - 1].index !== 0);
        }

        const tbody = document.querySelector(selectors.BlocksTableBody);
        if (tbody) {
            htmlHelpers.clearChildren(tbody);
            for (let i = 0; i < blocks.length; i++) {
                const contents = blocks[i];
                const row = htmlHelpers.newTableRow(
                    htmlHelpers.newEventLink(htmlHelpers.number(contents.index), panelEvents.ShowBlock, contents.index, postMessage),
                    htmlHelpers.text(htmlHelpers.time(contents.time)),
                    htmlHelpers.text(contents.tx.length),
                    htmlHelpers.text(contents.nextconsensus),
                    htmlHelpers.text(htmlHelpers.number(contents.size) + ' bytes'));
                tbody.appendChild(row);
            }
        }
    },

    renderInputsOutputs: function(tbodySelector: string, inputOutputList: any[], assets: any, clear: boolean, negate: boolean) {
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
                    htmlHelpers.text(inputOutput.address),
                    htmlHelpers.text(htmlHelpers.number(inputOutput.value) + ' ' + this.assetName(inputOutput.asset, assets)));
                tbody.appendChild(row);
            }
            return inputOutputList.length;
        }
        return 0;
    },

    renderTransaction: function(transaction: any | undefined, postMessage: any) {
        if (transaction) {
            htmlHelpers.setPlaceholder(selectors.TransactionDetailType, htmlHelpers.text(transaction.type));
            htmlHelpers.setPlaceholder(selectors.TransactionDetailHash, htmlHelpers.text(transaction.txid));
            htmlHelpers.setPlaceholder(selectors.TransactionDetailTime, htmlHelpers.text(htmlHelpers.time(transaction.blocktime)));
            htmlHelpers.setPlaceholder(selectors.TransactionDetailNetworkFee, htmlHelpers.text(htmlHelpers.number(transaction.net_fee) + ' GAS'));
            htmlHelpers.setPlaceholder(selectors.TransactionDetailSystemFee, htmlHelpers.text(htmlHelpers.number(transaction.sys_fee) + ' GAS'));
            htmlHelpers.setPlaceholder(selectors.TransactionDetailSize, htmlHelpers.text(htmlHelpers.number(transaction.size) + ' bytes'));
            htmlHelpers.setPlaceholder(
                selectors.TransactionDetailBlock, 
                htmlHelpers.newEventLink(transaction.blockhash, panelEvents.ShowBlock, transaction.blockhash, postMessage));
            let valueTransferCount = 0;
            valueTransferCount += this.renderInputsOutputs(selectors.TransactionDetailInputsClaimsTable, transaction.claimsAugmented, transaction.assets, true, false);
            valueTransferCount += this.renderInputsOutputs(selectors.TransactionDetailInputsClaimsTable, transaction.vinAugmented, transaction.assets, false, true);
            valueTransferCount += this.renderInputsOutputs(selectors.TransactionDetailOutputsTable, transaction.vout, transaction.assets, true, false);
            (document.querySelector(selectors.TransactionValueTransferTable) as any).style.display =
                valueTransferCount > 0 ? 'table' : 'none';
            const scriptsTbody = document.querySelector(selectors.TransactionScriptsTableBody);
            (document.querySelector(selectors.TransactionMainScriptArea) as any).style.display =
                transaction.scriptDisassembled ? 'table' : 'none';
            htmlHelpers.setPlaceholder(
                selectors.TransactionMainScriptBody, 
                htmlHelpers.text(transaction.scriptDisassembled));
            (document.querySelector(selectors.TransactionScriptsTable) as any).style.display =
                transaction.scripts.length > 0 ? 'table' : 'none';
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
        }
    },

    setPage: function(activePage: string) {
        const allPages = document.querySelectorAll(selectors.AllPages);
        for (let i = 0; i < allPages.length; i++) {
            const id = allPages[i].id;
            (allPages[i] as any).style.display = id === activePage ? 'block' : 'none';
        }
    },
};

export { renderers };