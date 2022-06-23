# Central Signing Service
## Exposes following endpoints

### `/concordium/register-data`
#### Request

* type `POST`

* body
`
{
    "hash" : "<FILE-SHA256 HASH>"
}
`

#### Response
`{txnHash: <CONCORDIUM_TXN_HASH>}`

## Debug
* clone repo
* npm install
* npm run start

## Deploy
* `NODE_ENV=production ./scripts/dist.sh`
* copy paste the dist directory to destination machine
* install node / npm on destination machine
* `NODE_ENV=production node index.js`