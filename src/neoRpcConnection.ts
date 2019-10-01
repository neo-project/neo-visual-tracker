import * as neon from '@cityofzion/neon-js';
import { RPCClient } from '@cityofzion/neon-core/lib/rpc';

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
    public previous?: number = undefined;
    public next?: number = undefined;
    public last?: number = undefined;
}

export interface INeoRpcConnection {
    getBlockchainInfo(statusReceiver?: INeoStatusReceiver): Promise<BlockchainInfo> | BlockchainInfo;
    getBlock(index: number, statusReceiver: INeoStatusReceiver): Promise<any>;
    getBlocks(startAt: number | undefined, statusReceiver: INeoStatusReceiver): Promise<Blocks>;
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
    
    private readonly rpcClient: RPCClient;
    // private readonly rpcUrl: string = 'http://127.0.0.1:49154';
    private readonly rpcUrl: string = 'http://seed1.ngd.network:10332';

    private lastKnownHeight: number;
    private subscriptions: INeoSubscription[];
    private timeout?: NodeJS.Timeout;
    private online: boolean = true;

    constructor() {
        this.rpcClient = new neon.rpc.RPCClient(this.rpcUrl);
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
            statusReceiver.updateStatus('Retrieving block #' + index);
            return await this.rpcClient.getBlock(index) as any;
        } catch(e) {
            console.error('NeoRpcConnection could not retrieve individual block #' + index + ': ' + e);
            return undefined;
        }
    }

    public async getBlocks(startAt: number | undefined, statusReceiver: INeoStatusReceiver) {
        const blockchainInfo = await this.getBlockchainInfo(statusReceiver);
        const height = blockchainInfo.height;
        startAt = startAt || height - 1;
        startAt = Math.max(startAt, BlocksPerPage - 1);

        const result = new Blocks();
        result.last = BlocksPerPage - 1;
        result.previous = startAt + BlocksPerPage;
        if (result.previous >= height) {
            result.previous = undefined;
        }

        for (let i = startAt; i > startAt - BlocksPerPage; i--) {
            if (i >= 0) {
                try {
                    const block = await this.getBlock(i, statusReceiver);
                    result.blocks.push(block);
                    result.next = block.index - 1;
                } catch(e) {
                    console.error('NeoRpcConnection could not retrieve block #' + i + ': ' + e);
                }
            }
        }

        return result;
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
                transaction.assets[claim.asset] = {};
                statusReceiver.updateStatus('Retrieving transaction ' + txid + ' (claim ' + (i + 1) + ')');
                const voutTx = await this.rpcClient.getRawTransaction(claim.txid);
                transaction.claimsAugmented.push(voutTx.vout[claim.vout]);
            }
        }

        transaction.vinAugmented = [];
        if (transaction.vin && transaction.vin.length) {
            for (let i = 0; i < transaction.vin.length; i++) {
                const vin = transaction.vin[i];
                transaction.assets[vin.asset] = {};
                statusReceiver.updateStatus('Retrieving transaction ' + txid + ' (vin ' + (i + 1) + ')');
                const voutTx = await this.rpcClient.getRawTransaction(vin.txid);
                transaction.vinAugmented.push(voutTx.vout[vin.vout]);
            }
        }

        if (transaction.vout && transaction.vout.length) {
            for (let i = 0; i < transaction.vout.length; i++) {
                const vout = transaction.vout[i];
                transaction.assets[vout.asset] = {};
            }
        }

        for (let assetId in transaction.assets) {
            // TODO: Let client know the names of all assets involved in the tx
            // transaction.assets[assetId] = await this.rpcClient.getAssetState(assetId);
        }

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