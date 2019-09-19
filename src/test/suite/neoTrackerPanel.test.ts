import * as assert from 'assert';
import * as vscode from 'vscode';

import { NeoTrackerPanel } from '../../neoTrackerPanel';
import { INeoRpcConnection, BlockchainInfo } from '../../neoRpcConnection';

const disposables : vscode.Disposable[] = [];
const extensionRoot : string = __dirname + '/../../../';

class MockRpcConnection implements INeoRpcConnection {
    public getBlockchainInfo() {
        return new BlockchainInfo(1234);
    }
}

suite('NEO Tracker Panel Test Suite', () => {

	const rpcConnection = new MockRpcConnection();

	test('Webview can be opened', async () => {		
		const target = new NeoTrackerPanel(extensionRoot, rpcConnection, disposables);
		assert.equal('NEO Express Tracker', target.panel.title);
		assert.equal(true, target.panel.visible);
	});

	test('Webview can be closed', async () => {		
		const target = new NeoTrackerPanel(extensionRoot, rpcConnection, disposables);
		target.dispose();
	});

	test('Content security policy is correct', async () => {
		const ExpectedCSP = '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src vscode-resource:;">';
		const target = new NeoTrackerPanel(extensionRoot, rpcConnection, disposables);
		assert.notEqual(
			target.panel.webview.html.indexOf(ExpectedCSP), 
			-1);
	});

	test('Injected Javascript is invoked', async () => {
		const target = new NeoTrackerPanel(extensionRoot, rpcConnection, disposables);
		await target.ready; // test will timeout and fail if promise is never resolved
	});
});
