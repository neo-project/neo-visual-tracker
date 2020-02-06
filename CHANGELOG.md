# Neo Visual DevTracker Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This project uses [NerdBank.GitVersioning](https://github.com/AArnott/Nerdbank.GitVersioning)
to manage version numbers. This tool automatically sets the Semantic Versioning Patch
value based on the [Git height](https://github.com/AArnott/Nerdbank.GitVersioning#what-is-git-height)
of the commit that generated the build. As such, released versions of this extension
will not have contiguous patch numbers. Initial major and minor releases will be documented
in this file without a patch number. Patch version will be included for bug fix releases, but
may not exactly match a publicly released version.

## [1.0] - 2020-02-06

### Added

- Search for a specific block/transaction/address from within the block explorer
- Support for smart contract deployment
- Support for smart contract invocation on Neo Express instances
- Support for smart contract invocation in the debugger
- Support for creation of new Neo Express instances
- Support for creation of new Neo Express wallets
- Support for creation of new NEP-6 wallets
- Support for transfer of assets between accounts
- Support for claiming GAS
- Support for Neo Express checkpoint creation
- Neo Express can be installed from within VS Code when needed but not detected
- Custom RPC servers can be added to the RPC Servers tree-view

### Changed

- Block explorer now shows getapplicationlog output for transactions
- Block explorer now shows unclaimed GAS for an address
- Hiding empty blocks in the block exploer is now much more efficient

## [0.5.18] - 2019-11-01

### Changed

- Moved project home to official [Neo project GitHub organization](https://github.com/neo-project).
- Updated Neo branding as per [official press kit](https://neo.org/presskit).
- Added support for smart contract invocation within vscode.

## [0.5] - 2019-10-17

Initial Release
