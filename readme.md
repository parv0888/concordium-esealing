# Concordium File Sealing Service

## Projects

### Central Signing Service
Simple Node JS Service. Which uses Concordium Node SDK to push a `RegisterData` transaction on the Blockchain Node. 
Takes File Hash as input. 

### Deploy
Deploys the Concordium Web to Mobile App Bridge using docker. We internally use this to deploy the bridge to an EC2 Instance manually. Automated Deployment is a `TODO`

### Notary Smart Contract
A Simple Smart Contract that takes file has as input
1. Register the hash and the sender in the Contracts State.
2. Puts events out with Binary *Serialized File Hash* and *Sender Account Address* as witness

### Web
A React frontend app with two main functionalities. 
1. Allowing user to Register File using the `Central Signing Service`. Which does a `RegisterData` transaction. 
2. Or Alternatively allows user to Update the Smart Contract. To register the file using his own wallet. Currently only CryptoX wallet supports connecting to the Bridge. 

## Demo
File Sealing : http://filesealing.newtrust.co/

## Links

* CryptoX Wallet : https://apps.apple.com/sg/app/cryptox-wallet/id1593386457
* Concordium Bridge : https://hub.docker.com/r/concordiumtech/concordium-bridge
* Concordium Node SDK : https://www.npmjs.com/package/@concordium/node-sdk