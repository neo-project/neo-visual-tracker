import Neon, { api, wallet } from "@cityofzion/neon-js";

//
// NOTE: This is some sample code to test invoking contracts from within the vscode extension.
//       It contains hard coded keys and script hashes that will only work against a deployment
//       of the CNEO contract to a specific neo-express instance.
//

export async function sampleInvocation(rpcUrl: string) {

    const sb = Neon.create.scriptBuilder();

    const walletPrivateKey  = '8f1d86c5f47ec3d946dc717ff78b8abf9ea6e82e02507e4afa0160f6d0fd3c68';

    const contractScriptHash = '30f41a14ca6019038b055b585d002b287b5fdd47';

    const config = {
        api: new api.neoCli.instance(rpcUrl),
        account: new wallet.Account(walletPrivateKey),
        script: sb.emitAppCall(contractScriptHash, 'mintTokens').str,
        intents: api.makeIntent({ NEO: 50 }, contractScriptHash)
    };
     
    console.log(await Neon.doInvoke(config));

}