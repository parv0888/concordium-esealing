import ConcordiumWalletClient from "@pioneeringtechventures/concordium-wallet-client"

const clients: { [hash: string]: {
    client: ConcordiumWalletClient,
    isConnected: boolean,
    isConnecting: boolean,
    isLoadingAccountInfo?: boolean
} } = {};

const onError = async (hash: string, client: ConcordiumWalletClient, data?: any) => {
    await disconnectAndRemoveClient(client, hash);
    throw new Error(`WS.bridge.error ${JSON.stringify(data)}`);
};

const onReject = async (hash: string, client: ConcordiumWalletClient) => {
    await disconnectAndRemoveClient(client, hash);
    console.error(`file: ${hash}, disconnected`);
};

export const getClient = (hash: string) => {
    if (clients[hash]) {
        console.log(`getting client from cache, file: ${hash}`);
        return clients[hash];
    };

    console.log(`creating client from file: ${hash}`);
    const client = new ConcordiumWalletClient({
        bridgeHost: 'ws://ec2-3-87-182-68.compute-1.amazonaws.com:8888',
        bridgeConnectionKey: '000000000',
    });

    clients[hash] = {
        client,
        isConnected: false,
        isConnecting: false
    };

    client.on('error', async (data?: any) => onError.apply(this, [hash, client, data]));
    client.on('reject', async () => onReject.apply(this, [hash, client]));

    return clients[hash];
}

export const connectClient = (hash: string, onConnect?: ()=> {}) => {
    const client = getClient(hash);

    if(!client.isConnected && !client.isConnecting) {
        client.client.connect();
        client.isConnecting = true;
        client.isConnected = false;
        client.client.on('connect', ()=>{
            client.isConnected = true;
            client.isConnecting = false;

            if(onConnect) {
                onConnect.call(this);
            }
        });
    }
}

export const loadAccountInfo = (hash: string, onAccountInfo: (infos: any)=> void) => {
    const client = getClient(hash);

    if(!client.isLoadingAccountInfo && client.isConnected) {
        client.isLoadingAccountInfo = true;
        client.client.send('AccountInfo', {});
        client.client.on('accountInfo', (infos)=> {
            client.isLoadingAccountInfo = false;
            client.client.of('accountInfo', (data)=> {
                console.log('of account info', data);
            });
        });
    }

}

async function disconnectAndRemoveClient(client: ConcordiumWalletClient, hash: string) {
    await client.disconnect();
    delete clients[hash];
}
