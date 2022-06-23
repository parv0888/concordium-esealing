import ConcordiumWalletClient, { IBridgeMessage, IBridgeMessageDataFromTransactionConctactParam, IBridgeMessageDataFromTransactionRequest } from "@pioneeringtechventures/concordium-wallet-client";
import { CONCORDIUM_BRIDGE_URL, CONCORDIUM_BRIDGE_ACCESS_KEY } from "./const";

interface IEvents {
    onBridgeConnected: (qrCodeUrl: string) => void,
    onBridgeDisconnected: () => void,
    onQrCodeScanned: (client: ConcordiumWalletClient) => void,
    onWalletConnectionAccepted: (client: ConcordiumWalletClient) => void,
    onWalletConnectionRejected: (client: ConcordiumWalletClient) => void,
    onAccountSelected: (client: ConcordiumWalletClient, accountAddress: string) => void,
    onTransactionAccepted: (client: ConcordiumWalletClient, txnHash: string) => void,
    onTransactionRejected: (client: ConcordiumWalletClient) => void,
    onError: (client: ConcordiumWalletClient, message: string) => void,
    onOperationRejected: (client: ConcordiumWalletClient) => void,
}

const deSerAccessKey = (accessKey: string) => {
    const hkArray = accessKey.trim()
        .split(';')
        .map(hk => {
            const parts = hk.split('#');
            if (parts.length < 2) {
                return null;
            }

            return {
                host: parts[0],
                key: parts[1]
            }
        })
        .filter(o=>!!o)
        .filter(o=>o?.host === window.location.host)
        ;

    if(hkArray.length < 1) {
        console.error(`no key found for host : ${window.location.host}`);
    }

    return hkArray[0]?.key || '';
}

export const getWalletClient = (events: IEvents) => {
    class QrCodeHandler {
        public open = (msg: IBridgeMessage) => {
            events.onBridgeConnected(msg.connect_string || '');
        }

        public close = events.onBridgeDisconnected
    }

    const client = new ConcordiumWalletClient({
        bridgeHost: CONCORDIUM_BRIDGE_URL,
        bridgeConnectionKey: deSerAccessKey(CONCORDIUM_BRIDGE_ACCESS_KEY),
        qrModal: QrCodeHandler,
    });

    client.on('connect', (data) => { events.onQrCodeScanned(client) });
    client.on('accept', () => { events.onWalletConnectionAccepted(client) });
    client.on('accountInfo', (data: { address: string }[]) => events.onAccountSelected(client, data[0].address));
    client.on(
        'transfer',
        (data: { data: { tx_hash: string, tx_status: 'Accepted' | 'Rejected' } }) => events.onTransactionAccepted(client, data.data.tx_hash));
    client.on('error', async (message) => events.onError(client, message));
    client.on('reject', () => events.onOperationRejected(client));
    client.on('transactionReject', () => events.onTransactionRejected(client));
    client.on('connectionReject', () => events.onWalletConnectionRejected(client));
    return client;
}

export const sendAccountInfoRequest = (client: ConcordiumWalletClient) => {
    client.send("AccountInfo", {});
}

export const sendRegisterFileTransaction = (
    client: ConcordiumWalletClient,
    fileHash: string,
    accountAddress: string,
) => {
    const buff = Buffer.alloc(4);
    buff.writeInt32LE(fileHash.length);
    const serializedSize = buff.toString('hex');
    const utf8Encode = new TextEncoder();
    const serialzedHash = Buffer.from(utf8Encode.encode(fileHash)).toString('hex');
    const serialzedParams = serializedSize + serialzedHash;
    const txn = {
        amount: "0",
        contract_address: {
            address: "",
            index: "6771",
            sub_index: "0"
        },
        contract_name: "notary",
        contract_method: "registerfile",
        nonce: "",
        from: accountAddress,
        contract_params: [
            {
                param_name: "",
                param_type: "string",
                param_value: fileHash,
                mandatory: "1",
            } as unknown as IBridgeMessageDataFromTransactionConctactParam
        ],
        expiry: (new Date().getTime() + 3600000).toString(),
        nrg_limit: "6000",
        serialized_params: serialzedParams,
    } as IBridgeMessageDataFromTransactionRequest;

    client.send('Transaction', txn);
}
