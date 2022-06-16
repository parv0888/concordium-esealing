import {
    AccountTransactionHeader,
    TransactionExpiry,
    AccountAddress,
    AccountTransaction,
    AccountTransactionType,
    ConcordiumNodeClient,
    getAccountTransactionSignDigest,
    AccountTransactionSignature,
    getAccountTransactionHash,
    TransactionStatus,
    DataBlob,
    RegisterDataPayload,
} from "@concordium/node-sdk";
import { credentials, Metadata } from "@grpc/grpc-js";
import * as ed from "noble-ed25519";
import * as cbor from 'cbor';

// export const registerFile = async (fileHash: string): Promise<{ sentStatus: boolean; txnHash: string; }> => {
//     const client = getClient();
//     const nOnce = await client.getNextAccountNonce(new AccountAddress(accountAddress));
//     const header: AccountTransactionHeader = {
//         expiry: new TransactionExpiry(new Date(Date.now() + 3600000)),
//         nonce: nOnce.nonce,
//         sender: new AccountAddress(accountAddress),
//     };
//     const serializedParams = serializeParameters({
//         typeTag: ParameterType.String,
//         sizeLength: SizeLength.U32
//     } as StringType, fileHash);
//     const payload: UpdateContractPayload = {
//         maxContractExecutionEnergy: BigInt(3000),
//         amount: new GtuAmount(BigInt(0)),
//         receiveName: 'notary.registerfile',
//         contractAddress: {
//             index: contractIndex,
//             subindex: contractSubindex
//         },
//         parameter: serializedParams
//     };
//     const txn: AccountTransaction = {
//         header: header,
//         payload: payload,
//         type: AccountTransactionType.UpdateSmartContractInstance,
//     };

//     return await sendTransaction(txn, client);
// }

export const registerData = async (fileHash: string): Promise<{ sentStatus: boolean; txnHash: string; }> => {
    const client = getClient();
    const nOnce = await client.getNextAccountNonce(new AccountAddress(accountAddress));

    if (!nOnce) {
        throw new Error("could not get nonce");
    }

    const header: AccountTransactionHeader = {
        expiry: new TransactionExpiry(new Date(Date.now() + 3600000)),
        nonce: nOnce.nonce,
        sender: new AccountAddress(accountAddress),
    };
    const payload: RegisterDataPayload = {
        data: new DataBlob(cbor.encode(fileHash) as any)
    };
    const txn: AccountTransaction = {
        header: header,
        payload: payload,
        type: AccountTransactionType.RegisterData,
    };
    return sendTransaction(txn, client);
}

export const getTrasactionStatus = async (txnHash: string): Promise<TransactionStatus | undefined> => {
    const client = getClient();
    return await client.getTransactionStatus(txnHash);
}

async function sendTransaction(txn: AccountTransaction, client: ConcordiumNodeClient) {
    const hashToSign = getAccountTransactionSignDigest(txn);
    const signature = Buffer.from(await ed.sign(hashToSign, signingKey)).toString("hex");
    const signatures: AccountTransactionSignature = {
        0: {
            0: signature
        }
    };

    const transactionHash = getAccountTransactionHash(txn, signatures);
    return client.sendAccountTransaction(txn, signatures)
        .then(r => ({ sentStatus: r, txnHash: transactionHash }))
        .catch(e => ({ sentStatus: false, txnHash: transactionHash }));
}

const accountAddress = process.env.CONCORDIUM_ACCOUNT || "";
const signingKey = process.env.CONCORDIUM_ACCOUNT_KEY || "";
const NODE_ADDRESS = process.env.CONCORDIUM_NODE_URL || "127.0.0.1"
const NODE_PORT = parseInt(process.env.CONCORDIUM_NODE_PORT || "10000");
const NODE_TIMEOUT = 15000;
const NODE_AUTH_TOKEN = process.env.CONCORDIUM_NODE_AUTH_TOKEN || 'rpcadmin';

function getClient() {
    const metadata = new Metadata();
    metadata.add("authentication", NODE_AUTH_TOKEN);
    return new ConcordiumNodeClient(
        NODE_ADDRESS,
        NODE_PORT,
        credentials.createInsecure(),
        metadata,
        NODE_TIMEOUT
    );
}
