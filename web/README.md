# Concordium Sealing Service Web Frontend

## Debug locally
* Clone Repo
* `cd ./web`
* `npm install`
* Change the [.env](.env) file according to your env setup
* `npm run dev`

### Env Variables
Change the [.env](./env) file
* `REACT_APP_TXN_LOOKUP_URL` : Not current being used
* `REACT_APP_CENTRAL_SIGNING_SERVICE_URL` : url for thheh deployed [Central Signing Service](../central-signing-service-v1/README.md)
* `REACT_APP_CONCORDIUM_BRIDGE_URL` : url for the deplaoyed [Bridge](../deploy/README.md)
* `REACT_APP_CONCORDIUM_BRIDGE_ACCESS_KEY` : depends on the values defined in bridge's [registory.json](../deploy/registry.json)