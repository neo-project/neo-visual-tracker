import * as neon from '@cityofzion/neon-js';
import { RPCClient } from '@cityofzion/neon-core/lib/rpc';

import memoize from 'memoizee';

const MaxCacheAgeInMilliseconds = 1000 * 60 * 5; // 5 minutes
const MaxObjectsInCache = 10000;

const CacheOptions = { 
    promise: true, // All cached methods return promises
    primitive: true, // Use stringified arguments as cache key
    maxAge: MaxCacheAgeInMilliseconds, // Ensure memory usage will shrink after period of inactivity
    max: MaxObjectsInCache, // Place a rough cap on maximum memory usage
};

const labeledCacheOptions = (label: string) => {
    const result: any = Object.assign({}, CacheOptions);
    result['profileName'] = label;
    return result;
};

//
// Uncomment the below code to periodically print cache statistics to the console:
//

// const PrintCacheStatisticsIntervalInMilliseconds = 10000;
// const memProfile = require('memoizee/profile');
// setInterval(
//     () => {
//         console.log('CachedRpcClient statistics: \r\n' + memProfile.log());
//     }, 
//     PrintCacheStatisticsIntervalInMilliseconds
// );

// Provides a wrapper around neon.rpc.RPCClient that uses an in-memory cache for results.
export class CachedRpcClient {

    private readonly rpcClient: RPCClient;

    private readonly memoizedGetBlock: 
        ((indexOrHash: string | number, verbose?: number | undefined) => Promise<string | object>) & memoize.Memoized<(indexOrHash: string | number, verbose?: number | undefined) => Promise<string | object>>;

    private readonly memoizedGetRawTransaction: 
        ((txid: string, verbose?: number | undefined) => Promise<any>) & memoize.Memoized<(txid: string, verbose?: number | undefined) => Promise<any>>;
    
    private readonly memoizedGetAssetState: 
        ((assetId: string) => Promise<any>) & memoize.Memoized<(assetId: string) => Promise<any>>;

    private readonly memoizedGetApplicationLog: 
        ((txid: string) => Promise<any>) & memoize.Memoized<(txid: string) => Promise<any>>;

    private lastKnownBlockCount: number;
    
    public constructor(rpcUrl: string) {
        this.rpcClient = new neon.rpc.RPCClient(rpcUrl);

        this.lastKnownBlockCount = -1;

        this.memoizedGetBlock = 
            memoize(
                (indexOrHash: string | number, verbose?: number) => this.rpcClient.getBlock(indexOrHash, verbose),
                labeledCacheOptions('getBlock'));

        this.memoizedGetRawTransaction = 
            memoize(
                (txid: string, verbose?: number) => this.rpcClient.getRawTransaction(txid, verbose),
                labeledCacheOptions('getRawTransaction'));

        this.memoizedGetAssetState =
            memoize(
                (assetId: string) => this.rpcClient.getAssetState(assetId),
                labeledCacheOptions('getAssetState'));

        this.memoizedGetApplicationLog =
            memoize(
                (txid: string) => this.rpcClient.query({ method: 'getapplicationlog', params: [ txid ] }),
                labeledCacheOptions('getapplicationlog'));
    }

    public async getBlockCount() : Promise<number> {
        // Note that this method is not cached. It is called periodically to check when 
        // there are new blocks to be retrieved.
        
        const result = await this.rpcClient.getBlockCount();
        this.lastKnownBlockCount = result;
        return result;
    }

    public async getBlockChainId() : Promise<string> {
        // Note that this method is not cached. We should detect as soon as possible if one
        // instance of neo-express has been terminated and then another one started using
        // the same URL
        
        return await this.rpcClient.getBlockHash(0);
    }

    public getBlock(indexOrHash: string | number, verbose?: number): Promise<object | string> {
        // Note that the result is not cached if the most recent block is being retrieved.
        // The pointer to the next block will initially be null, so the block must be 
        // re-retrieved later to get a version with the next pointer populated.
        
        if ((typeof indexOrHash === 'number') && (indexOrHash >= (this.lastKnownBlockCount - 1))) {
            // console.log('Not caching retrieval of block #' + indexOrHash);
            return this.rpcClient.getBlock(indexOrHash, verbose);    
        }

        return this.memoizedGetBlock(indexOrHash, verbose);
    }

    public async getRawTransaction(txid: string, verbose?: number): Promise<any> {
        // Note that the result is not cached if the transaction is unconfirmed.
        // The block hash will initially be null, so the transaction must be 
        // re-retrieved later to get a version with the block hash populated.

        const result = await this.memoizedGetRawTransaction(txid, verbose);
        if (!result.blockhash) {
            await this.memoizedGetRawTransaction.delete(txid, verbose);
        }
        return result;
    }

    public getAssetState(assetId: string): Promise<any> {
        return this.memoizedGetAssetState(assetId);
    }

    public getUnspents(address: string): Promise<any> {
        // Note that this method is not cached. The state of an address can change in-between calls.
        return this.rpcClient.getUnspents(address);
    }

    public getClaimable(address: string): Promise<any> {
        // Note that this method is not cached. The state of an address can change in-between calls.
        return this.rpcClient.query({ method: 'getclaimable', params: [ address ] });
    }

    public getPopulatedBlocks(): Promise<any> {
        // Note that this method is not cached. The list of populated blocks could potentially
        // change every time a new block is generated.

        return this.rpcClient.query({ method: 'express-get-populated-blocks' });
    }

    public getContractStorage(contractHash: string): Promise<any> {
        // Note that this method is not cached. Contract storage could potentially change at any
        // new block.

        return this.rpcClient.query({ method: 'express-get-contract-storage', params: [ contractHash ] });
    }

    public getUnclaimed(address: string): Promise<any> {
        // Note that this method is not cached. The state of an address can change in-between calls.
        return this.rpcClient.getUnclaimed(address);
    }

    public getApplicationLog(txid: string): Promise<any> {
        return this.memoizedGetApplicationLog(txid);
    }

}