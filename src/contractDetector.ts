import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { ContractParameterType } from './contractParameterType';

class Contract {
    
    private constructor(
        public readonly hash: string,
        public readonly name: string,
        public readonly path: string,
        public readonly avmHex: string,
        public readonly metadata: any) {
    }

    public static parse(fullPathToAvm: string): Contract | undefined {
        try {
            const name = path.basename(fullPathToAvm).replace(/\.avm$/, '');
            const avmContents = fs.readFileSync(fullPathToAvm);
            const avmHex = avmContents.toString('hex');
            const sha256Bytes = crypto.createHash('sha256').update(avmContents).digest();
            const ripemd160Bytes = crypto.createHash('ripemd160').update(sha256Bytes).digest();
            const hash = '0x' + Buffer.from(ripemd160Bytes.reverse()).toString('hex');
            const fullPathToAbi = fullPathToAvm.replace(/\.avm$/, '.abi.json');
            const abiContents = fs.readFileSync(fullPathToAbi);
            const abi = JSON.parse(abiContents.toString());
            
            if (abi.hash !== hash) {
                console.warn('ABI', fullPathToAbi, 'does not match', fullPathToAvm, 'expected hash:', hash);
                return undefined;
            } 

            const functions = abi.functions || [];
            const entrypoint = abi.entrypoint || '';
            const entrypointFunction = functions.filter((_: any) => _.name === entrypoint)[0];
            if (!entrypointFunction || !entrypointFunction.parameters || !entrypointFunction.returntype) {
                console.warn('ABI', fullPathToAbi, 'does not contain metadata for entrypoint function', abi);
                return undefined;
            }

            const entrypointFunctionParameters = entrypointFunction.parameters;
            const entrypointParameterTypes = entrypointFunctionParameters.map((_: any) => _.type || '');
            const entrypointParameterTypesHex = entrypointParameterTypes.map(ContractParameterType.typeNameToHexString);
            if (entrypointParameterTypesHex.filter((_: any) => _ === undefined).length) {
                console.warn('ABI for', fullPathToAbi, 'defined an entrypoint method with unknown parameter types', entrypointFunction);
                return undefined;
            } 

            const entrypointReturnType = entrypointFunction.returntype;
            const entrypointReturnTypeHex = ContractParameterType.typeNameToHexString(entrypointReturnType);
            if (!entrypointReturnTypeHex) {
                console.warn('ABI for', fullPathToAbi, 'defined an entrypoint method with an unknown return type', entrypointFunction);
                return undefined;
            } 

            const abiMetadata = abi.metadata || {};
            const metadata = {
                title: abiMetadata.title || name,
                description: abiMetadata.description || '',
                version: abiMetadata.version || '',
                author: abiMetadata.author || '',
                email: abiMetadata.email || '',
                hasStorage: abiMetadata['has-storage'], // may be undefined
                hasDynamicInvoke: abiMetadata['has-dynamic-invoke'], // may be undefined
                entrypointParameterTypes: entrypointParameterTypes,
                entrypointParameterTypesHex: entrypointParameterTypesHex.join(''),
                entrypointReturnType: entrypointReturnType,
                entrypointReturnTypeHex: entrypointReturnTypeHex,
            };

            return new Contract(hash, name, fullPathToAvm, avmHex, metadata);
        } catch (e) {
            console.warn('Error parsing', fullPathToAvm, e);
            return undefined;
        }
    }

}

export class ContractDetector {

    private readonly fileSystemWatcher: vscode.FileSystemWatcher;
    private readonly searchPattern: vscode.GlobPattern = '**/*.avm';

    public contracts: Contract[];

    constructor() {
        this.contracts = [];
        this.refresh();
        this.fileSystemWatcher = vscode.workspace.createFileSystemWatcher(this.searchPattern);
        this.fileSystemWatcher.onDidChange(this.refresh, this);
        this.fileSystemWatcher.onDidCreate(this.refresh, this);
        this.fileSystemWatcher.onDidDelete(this.refresh, this);
    }

    public dispose() {
        if (this.fileSystemWatcher) {
            this.fileSystemWatcher.dispose();
        }
    }

    public getContractByHash(hash: string): Contract | undefined {
        hash = hash || '';
        return this.contracts.filter(c => c.hash.replace(/^0x/, '').toLowerCase() === hash.replace(/^0x/, '').toLowerCase())[0];
    }

    public async refresh() {
        const files = await vscode.workspace.findFiles(this.searchPattern);
        this.contracts = files.map(uri => Contract.parse(uri.fsPath)).filter(contract => !!contract) as Contract[];
    }

}