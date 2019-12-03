import { INeoRpcConnection, NeoRpcConnection } from "./neoRpcConnection";

export class RpcConnectionPool {

    private readonly connections: Map<string, INeoRpcConnection> = new Map<string, INeoRpcConnection>();

    constructor() {
    }

    public getConnection(rpcUrl: string): INeoRpcConnection {
        let pooledConnection = this.connections.get(rpcUrl);
        if (!pooledConnection) {
            pooledConnection = new NeoRpcConnection(rpcUrl);
            this.connections.set(rpcUrl, pooledConnection);
        }

        return pooledConnection;
    }

}