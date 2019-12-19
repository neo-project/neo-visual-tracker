# Neo Visual DevTracker

[![Build Status](https://dev.azure.com/NGDSeattle/Public/_apis/build/status/neo-project.neo-visual-tracker?branchName=master)](https://dev.azure.com/NGDSeattle/Public/_build/latest?definitionId=28&branchName=master)
[![](https://vsmarketplacebadge.apphb.com/version-short/ngd-seattle.neo-visual-devtracker.svg)](https://marketplace.visualstudio.com/items?itemName=ngd-seattle.neo-visual-devtracker)

This is a Visual Studio Code extension that supports running and interacting
with Neo-Express instances from within Visual Studio Code.

## Installation

The latest released version of the Neo Visual DevTracker can be installed via the
[Visual Studio Code Marketplace](https://marketplace.visualstudio.com/vscode).
It can be installed
[by itself](https://marketplace.visualstudio.com/items?itemName=ngd-seattle.neo-visual-devtracker)
or as part of the
[Neo Blockchain Toolkit](https://marketplace.visualstudio.com/items?itemName=ngd-seattle.neo-blockchain-toolkit).

Please see the
[Neo-Express repo](https://github.com/neo-project/neo-express#installation)
for instructions on installing Neo-Express.

### Install Preview Releases

The Neo Visual DevTracker has a public [build server](https://dev.azure.com/NGDSeattle/Public/_build?definitionId=28).
You can install preview builds of the DevTracker by navigating to the build you wish to install,
pressing the "Artifacts" button in the upper right hand corner and downloading the VSIX-package
artifact. The artifact is a zip file containing the DevTracker VSIX file, which can be installed
manually. For more information on installing VSIX extensions in VSCode, please see the
[official VSCode docs](https://code.visualstudio.com/docs/editor/extension-gallery#_install-from-a-vsix).

## Features

* Automatic detection of Neo-Express configuration files in the vscode workspace

![Neo-Express config detection](https://raw.githubusercontent.com/neo-project/neo-visual-tracker/master/images/feature-detect.png)

* Create a new Neo-Express instance 

![Create instance](https://raw.githubusercontent.com/neo-project/neo-visual-tracker/master/images/feature-create.png)

* Start and stop Neo-Express instances 

![Starting and stopping Neo-Express instances](https://raw.githubusercontent.com/neo-project/neo-visual-tracker/master/images/feature-start-stop.png)

* View Neo-Express output

![Neo-Express output shown in vscode terminal](https://raw.githubusercontent.com/neo-project/neo-visual-tracker/master/images/feature-terminal.png)

* Explore the blockchain (works for Neo-Express private blockchains and the public Neo blockchain)

![Built-in blockchain explorer](https://raw.githubusercontent.com/neo-project/neo-visual-tracker/master/images/feature-block-explorer.png)

* Create a Neo-Express wallet 

![Neo-Express wallet creation](https://raw.githubusercontent.com/neo-project/neo-visual-tracker/master/images/feature-create-wallet.png)

* Transfer assets between Neo-Express wallets

![Transfer assets](https://raw.githubusercontent.com/neo-project/neo-visual-tracker/master/images/feature-transfer.png)

* Claim GAS

![Claiming GAS](https://raw.githubusercontent.com/neo-project/neo-visual-tracker/master/images/feature-claim.png)

* Invoke smart contracts on a Neo-Express instance

![Contract invocation](https://raw.githubusercontent.com/neo-project/neo-visual-tracker/master/images/feature-invoke.png)
