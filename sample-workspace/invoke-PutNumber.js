//  
//  Instructions:
//  
//  - Save this file as a JavaScript file (e.g. invoke.js), 
//  - Ensure that the @cityofzion/neon-js package is installed (e.g. `npm install @cityofzion/neon-js`, 
//  - Press F5
//  

const neon = require("@cityofzion/neon-js");

const rpcUrl = "http://127.0.0.1:49154";
const contractHash = "e6e0ba5fbf6dffc05391f4a61682a7efd9b5012a";
const privateKey = "cea9fd5b3d8efb6328d562cf43eb31e814e30add3615dca0be24ab7950de3d0d";
const methodName = "PutNumber";
const args = [
    42
];

/*
Arguments: 
[
    {
        "name": "n",
        "type": "Integer",
        "value": "42"
    }
]
*/

const sb = neon.default.create.scriptBuilder();
const script = sb.emitAppCall(contractHash, methodName, args).str;
const api = new neon.api.neoCli.instance(rpcUrl);
const account = new neon.wallet.Account(privateKey);
const config = { api: api, script: script, account: account };
(async function() {
    try {
        const result = await neon.default.doInvoke(config);
        console.log("Success:", result);
    } catch (e) {
        console.error("Error:", e);
    }
})();
