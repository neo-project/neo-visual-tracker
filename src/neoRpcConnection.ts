import * as neon from '@cityofzion/neon-js';
import { RPCClient } from '@cityofzion/neon-core/lib/rpc';

const BlocksPerPage = 20;

const PollingInterval = 1000;

export class BlockchainInfo {
    constructor(public height : number) {
    }
}

export class Block {
    constructor(public contents : object | string) {
    }
}

export interface INeoRpcConnection {
    getBlockchainInfo() : Promise<BlockchainInfo> | BlockchainInfo;
    getBlocks(startAt? : number) : Promise<Block[]>;
    subscribe(subscriber: INeoSubscription) : void;
    unsubscribe(subscriber: INeoSubscription) : void;
}

export interface INeoSubscription {
    onNewBlock(blockchainInfo: BlockchainInfo) : Promise<void>;
}

export class NeoRpcConnection implements INeoRpcConnection {
    
    private readonly rpcClient : RPCClient;

    private lastKnownHeight : number;

    private subscriptions : INeoSubscription[];

    private timeout? : NodeJS.Timeout;

    constructor() {
        this.rpcClient = new neon.rpc.RPCClient('http://127.0.0.1:49154');
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

    public async getBlockchainInfo() {
        const height = await this.rpcClient.getBlockCount();
        return new BlockchainInfo(height);
    }

    public async getBlocks(startAt? : number) {
        startAt = startAt || (await this.getBlockchainInfo()).height - 1;
        const result : Block[] = [];
        for (let i = startAt; i > startAt - BlocksPerPage; i--) {
            if (i >= 0) {
                try {
                    result.push(new Block(await this.rpcClient.getBlock(i)));
                } catch(e) {
                    console.error('NeoRpcConnection could not retrieve block #' + i + ': ' + e);
                }
            }
        }

        return result;
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
        if (blockchainInfo.height !== this.lastKnownHeight) {
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