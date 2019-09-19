import * as neon from '@cityofzion/neon-js';
import { RPCClient } from '@cityofzion/neon-core/lib/rpc';

export class BlockchainInfo {
    constructor(public height : number){
    }
}

export interface INeoRpcConnection {
    getBlockchainInfo() : Promise<BlockchainInfo> | BlockchainInfo;
}

export class NeoRpcConnection implements INeoRpcConnection {
    
    private readonly rpcClient : RPCClient;

    constructor() {
        this.rpcClient = new neon.rpc.RPCClient('http://127.0.0.1:10332');
    }

    public async getBlockchainInfo() {
        const height = await this.rpcClient.getBlockCount();
        return new BlockchainInfo(height);
    }

}