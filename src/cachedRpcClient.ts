import * as neon from '@cityofzion/neon-js';
import { RPCClient } from '@cityofzion/neon-core/lib/rpc';

export class CachedRpcClient {

    private readonly rpcClient: RPCClient;

    public constructor(rpcUrl: string) {
        this.rpcClient = new neon.rpc.RPCClient(rpcUrl);
    }

    public getBlockCount() : Promise<number> {
        return this.rpcClient.getBlockCount();
    }

    public getBlock(indexOrHash: string | number, verbose?: number): Promise<object | string> {
        return this.rpcClient.getBlock(indexOrHash, verbose);
    }

    public getRawTransaction(txid: string, verbose?: number): Promise<any> {
        return this.rpcClient.getRawTransaction(txid, verbose);
    }

    public getAssetState(assetId: string): Promise<any> {
        return this.rpcClient.getAssetState(assetId);
    }

}