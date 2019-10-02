import { BitSet } from 'bitset';

import { CachedRpcClient } from "./cachedRpcClient";

const BlocksPerPage = 20;

const PollingInterval = 1000;

export class BlockchainInfo {
    constructor(
        public height: number,
        public url: string,
        public online: boolean) {
    }
}

export class Blocks {
    public blocks: any[] = [];
    public firstIndex: number = 0;
    public lastIndex: number = 0;
}

export interface INeoRpcConnection {
    getBlockchainInfo(statusReceiver?: INeoStatusReceiver): Promise<BlockchainInfo> | BlockchainInfo;
    getBlock(index: number, statusReceiver: INeoStatusReceiver): Promise<any>;
    getBlocks(index: number | undefined, hideEmptyBlocks: boolean, forwards: boolean, statusReceiver: INeoStatusReceiver): Promise<Blocks>;
    getTransaction(txid: string, statusReceiver: INeoStatusReceiver): Promise<any>;
    subscribe(subscriber: INeoSubscription): void;
    unsubscribe(subscriber: INeoSubscription): void;
}

export interface INeoSubscription {
    onNewBlock(blockchainInfo: BlockchainInfo) : Promise<void>;
}

export interface INeoStatusReceiver {
    updateStatus(status: string) : void;
}

export class NeoRpcConnection implements INeoRpcConnection {
    
    private readonly rpcClient: CachedRpcClient;
    // private readonly rpcUrl: string = 'http://127.0.0.1:49154';
    private readonly rpcUrl: string = 'http://seed1.ngd.network:10332';
    private readonly knownEmptyBlocks: BitSet;

    private lastKnownHeight: number;
    private subscriptions: INeoSubscription[];
    private timeout?: NodeJS.Timeout;
    private online: boolean = true;

    constructor() {
        this.rpcClient = new CachedRpcClient(this.rpcUrl);
        this.knownEmptyBlocks = new BitSet();
        this.lastKnownHeight = 0;
        this.subscriptions = [];
        this.timeout = undefined;
    }

    public subscribe(subscriber: INeoSubscription) {
        this.subscriptions.push(subscriber);
        this.ensurePolling();
    }

    public unsubscribe(subscriber: INeoSubscription) {
        const oldSubscriptions = this.subscriptions;
        this.subscriptions = [];
        for (let i = 0; i < oldSubscriptions.length; i++) {
            if (oldSubscriptions[i] !== subscriber) {
                this.subscribe(oldSubscriptions[i]);
            }
        }

        this.ensurePolling();
    }

    public async getBlockchainInfo(statusReceiver?: INeoStatusReceiver) {
        let height = this.lastKnownHeight;
        try {
            if (statusReceiver) {
                statusReceiver.updateStatus('Determining current blockchain height');
            }

            height = await this.rpcClient.getBlockCount();
            this.online = true;
        } catch (e) {
            console.error('NeoRpcConnection could not retrieve block height: ' + e);
            this.online = false;
        }

        return new BlockchainInfo(height, this.rpcUrl, this.online);
    }

    public async getBlock(index: number, statusReceiver: INeoStatusReceiver) {
        try {
            statusReceiver.updateStatus('Retrieving block #' + index + '...');
            const result = await this.rpcClient.getBlock(index) as any;
            if (result.tx && (result.tx.length <= 1)) {
                this.knownEmptyBlocks.set(index);
            }

            statusReceiver.updateStatus('Retrieved block #' + index);
            return result;
        } catch(e) {
            console.error('NeoRpcConnection could not retrieve individual block #' + index + ': ' + e);
            return undefined;
        }
    }

    public async getBlocks(
        index: number | undefined, 
        hideEmptyBlocks: boolean,
        forwards: boolean,
        statusReceiver: INeoStatusReceiver) : Promise<Blocks> {

        const blockchainInfo = await this.getBlockchainInfo(statusReceiver);
        const height = blockchainInfo.height;
        if (index === undefined) {
            index = height - 1;
            forwards = true;
        }

        const result = new Blocks();
        
        while ((result.blocks.length < BlocksPerPage) && 
            ((forwards && (index >= 0)) || (!forwards && (index < height)))) {

            const blocksThisBatch : any[] = [];
            const promises = [];
            for (let i = 0; i < BlocksPerPage; i++) {
                if ((index >= 0) && (index < height)) {
                    if (!this.knownEmptyBlocks.get(index) || !hideEmptyBlocks) {
                        const promise = (async (batchIndex, blockIndex) => {
                            try {
                                blocksThisBatch[batchIndex] = await this.getBlock(blockIndex, statusReceiver);
                            } catch(e) {
                                console.error('NeoRpcConnection could not retrieve block #' + blockIndex + ': ' + e);
                            }
                        })(i, index);
                        promises.push(promise);
                    }
                }

                if (forwards) {
                    index--;
                } else {
                    index++;
                }
            }

            await Promise.all(promises);

            for (let i = 0; i < blocksThisBatch.length; i++) {
                if ((result.blocks.length < BlocksPerPage) &&
                    blocksThisBatch[i] && 
                    (!this.knownEmptyBlocks.get(blocksThisBatch[i].index) || !hideEmptyBlocks)) {

                    result.blocks.push(blocksThisBatch[i]);
                }
            }
        }

        if (!forwards) {
            result.blocks = result.blocks.reverse();
        }

        if (result.blocks.length === 0) {
            if (forwards) {
                return await this.getBlocks(0, hideEmptyBlocks, false, statusReceiver);
            } else {
                return await this.getBlocks(undefined, hideEmptyBlocks, true, statusReceiver);
            }
        } else {
            result.firstIndex = result.blocks[0].index;
            result.lastIndex = result.blocks[result.blocks.length - 1].index;
            return result;
        }
    }

    public async getTransaction(txid: string, statusReceiver: INeoStatusReceiver) {
        try {
            statusReceiver.updateStatus('Retrieving transaction ' + txid);
            const tx = await this.rpcClient.getRawTransaction(txid);
            return await this.augmentTransaction(txid, tx, statusReceiver);
        } catch(e) {
            console.error('NeoRpcConnection could not retrieve transaction (id=' + txid + '): ' + e);
            return undefined;
        }
    }

    private async augmentTransaction(txid: string, transaction: any, statusReceiver: INeoStatusReceiver) {       
        transaction.assets = {};
        
        transaction.claimsAugmented = [];
        if (transaction.claims && transaction.claims.length) {
            for (let i = 0; i < transaction.claims.length; i++) {
                const claim = transaction.claims[i];
                statusReceiver.updateStatus('Retrieving transaction ' + txid + ' (claim ' + (i + 1) + ')');
                const voutTx = await this.rpcClient.getRawTransaction(claim.txid);
                const vinVout = voutTx.vout[claim.vout];
                transaction.assets[vinVout.asset] = {};
                transaction.claimsAugmented.push(vinVout);
            }
        }

        transaction.vinAugmented = [];
        if (transaction.vin && transaction.vin.length) {
            for (let i = 0; i < transaction.vin.length; i++) {
                const vin = transaction.vin[i];
                statusReceiver.updateStatus('Retrieving transaction ' + txid + ' (vin ' + (i + 1) + ')');
                const voutTx = await this.rpcClient.getRawTransaction(vin.txid);
                const vinVout = voutTx.vout[vin.vout];
                transaction.assets[vinVout.asset] = {};
                transaction.vinAugmented.push(vinVout);
            }
        }

        if (transaction.vout && transaction.vout.length) {
            for (let i = 0; i < transaction.vout.length; i++) {
                const vout = transaction.vout[i];
                transaction.assets[vout.asset] = {};
            }
        }

        for (let assetId in transaction.assets) {
            statusReceiver.updateStatus('Retrieving transaction ' + txid + ' (asset ' + assetId + ')');
            transaction.assets[assetId] = await this.rpcClient.getAssetState(assetId);
        }

        // TODO: Parse script hex into byte code
        //       neo-blockchain package may be useful:
        //       https://github.com/neotracker/neo-blockchain/blob/e746fa7940ec64dec295e35208fcebe0345b9a0f/packages/neo-blockchain-core/src/vm.js
        //
        // for (let i = 0; i < transaction.scripts.length; i++) {
        //     const script = transaction.scripts[i];
        //     for (let portion in { invocation: null, verification: null }) {
        //         const scriptBuilder = new neon.sc.ScriptBuilder(script[portion]);
        //         console.log(scriptBuilder.toScriptParams());
        //     }
        // }

        return transaction;
    }

    private ensurePolling() : void {
        if ((this.timeout === undefined) && (this.subscriptions.length > 0)) {
            this.timeout = setTimeout(async () => { await this.poll(); }, PollingInterval);
        } else if ((this.timeout !== undefined) && (this.subscriptions.length === 0)) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
    }

    private async poll() : Promise<void> {
        this.timeout = undefined;
        const blockchainInfo = await this.getBlockchainInfo();
        if ((blockchainInfo.height !== this.lastKnownHeight) || !blockchainInfo.online) {
            this.lastKnownHeight = blockchainInfo.height;
            for (let i = 0; i < this.subscriptions.length; i++) {
                try {
                    await this.subscriptions[i].onNewBlock(blockchainInfo);
                } catch (e) {
                    console.error('Error within INeoSubscription #' + i + ' (' + this.subscriptions[i] + ')');
                }
            }
        }

        this.ensurePolling();
    }

}