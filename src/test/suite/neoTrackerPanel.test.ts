import * as assert from 'assert';
import * as vscode from 'vscode';

import { NeoTrackerPanel } from '../../neoTrackerPanel';
import { INeoRpcConnection, BlockchainInfo, Blocks, INeoSubscription } from '../../neoRpcConnection';

const disposables : vscode.Disposable[] = [];
const extensionRoot : string = __dirname + '/../../../';

class MockRpcConnection implements INeoRpcConnection {

	public subscriptions : number = 0;

	public blocks : Blocks;

	public blockchainInfo : BlockchainInfo = new BlockchainInfo(1234, 'http://foo');

	constructor() {
		this.blocks = new Blocks();
		this.blocks.blocks.push("Block 0");
		this.blocks.blocks.push("Block 1");
		this.blocks.blocks.push("Block 2");
	}

    public async getBlockchainInfo() {
        return this.blockchainInfo;
    }

	public async getBlock(index: number): Promise<any> {
		return this.blocks.blocks[0];
	}

	public async getBlocks(startAt?: number | undefined): Promise<Blocks> {
		return this.blocks;
	}

	public subscribe(subscriber: INeoSubscription): void {
		this.subscriptions++;
	}

	public unsubscribe(subscriber: INeoSubscription): void {
		this.subscriptions--;
	}
}

suite('NEO Tracker Panel Test Suite', () => {

	test('Webview can be opened', async () => {		
		const target = new NeoTrackerPanel(extensionRoot, new MockRpcConnection(), disposables);
		assert.equal('NEO Express Tracker', target.panel.title);
		assert.equal(true, target.panel.visible);
	});

	test('Webview can be closed', async () => {		
		const target = new NeoTrackerPanel(extensionRoot, new MockRpcConnection(), disposables);
		target.dispose();
	});

	test('Content security policy is correct', async () => {
		const ExpectedCSP = '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src vscode-resource:; style-src vscode-resource:;">';
		const target = new NeoTrackerPanel(extensionRoot, new MockRpcConnection(), disposables);
		assert.notEqual(
			target.panel.webview.html.indexOf(ExpectedCSP), 
			-1);
	});

	test('Injected Javascript is invoked', async () => {
		const target = new NeoTrackerPanel(extensionRoot, new MockRpcConnection(), disposables);
		await target.ready; // test will timeout and fail if promise is never resolved
	});

	test('Panel subscribes/unsubscribes to/from blockchain updates', async () => {
		const rpcConnection = new MockRpcConnection();
		assert.equal(rpcConnection.subscriptions, 0);
		const target = new NeoTrackerPanel(extensionRoot, rpcConnection, disposables);

		assert.equal(rpcConnection.subscriptions, 1);
		
		target.dispose();
		
		assert.equal(rpcConnection.subscriptions, 0);
	});

	test('Panel responds to first blockchain update', async () => {
		const rpcConnection = new MockRpcConnection();
		const target = new NeoTrackerPanel(extensionRoot, rpcConnection, disposables);
		assert.equal(target.viewState.firstBlock, undefined);
		assert.equal(target.viewState.blockChainInfo, undefined);
		assert.equal(target.viewState.blocks.blocks.length, 0);
		
		await target.onNewBlock(rpcConnection.blockchainInfo);

		assert.equal(target.viewState.firstBlock, undefined);
		assert.notEqual(target.viewState.blockChainInfo, undefined);
		assert.equal(target.viewState.blocks.blocks.length, rpcConnection.blocks.blocks.length);
	});

	test('New blocks do not reset pagination', async () => {
		const rpcConnection = new MockRpcConnection();
		const target = new NeoTrackerPanel(extensionRoot, rpcConnection, disposables);
		await target.onNewBlock(rpcConnection.blockchainInfo);
		const initialBlockLength = rpcConnection.blocks.blocks.length;
		assert.equal(initialBlockLength > 0, true);
		assert.equal(target.viewState.blocks.blocks.length, initialBlockLength);

		target.viewState.firstBlock = 1; // user has explicity selected a page, viewstate should not be updated
		rpcConnection.blocks = new Blocks();
		await target.onNewBlock(rpcConnection.blockchainInfo);

		assert.equal(target.viewState.blocks.blocks.length, initialBlockLength);
	});
});
