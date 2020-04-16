import * as vscode from 'vscode';

import * as ttfClient from './ttf/protos/service_grpc_pb';
import * as ttfTaxonomy from './ttf/protos/taxonomy_pb';

export class TokenTaxonomy {

    private readonly onRefreshEmitter: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();

    public readonly onRefresh: vscode.Event<any> = this.onRefreshEmitter.event;

    private latestTaxonomy: ttfTaxonomy.Taxonomy | null = null;

    get taxonomy(): ttfTaxonomy.Taxonomy | null {
        return this.latestTaxonomy;
    }

    constructor(private readonly ttfConnection: ttfClient.ServiceClient) {
        this.refresh();
    }

    public async refresh() {
        const version = new ttfTaxonomy.TaxonomyVersion();
        version.setVersion('1.0');
        this.latestTaxonomy = await new Promise(
            (resolve, reject) => this.ttfConnection.getFullTaxonomy(version, (error, response) => error ? reject(error) : resolve(response)));
        this.onRefreshEmitter.fire();
    }
}