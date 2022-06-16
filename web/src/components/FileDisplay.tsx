import { Button, Card, CardActions, CardContent, Chip, List, ListItem, ListItemText, Typography } from "@mui/material";
import { useState } from "react";
import ConcordiumWalletClient from "@pioneeringtechventures/concordium-wallet-client";

import { IUploadedFile } from "./FileUploadZone";
import { registerData } from '../client/client';
import { getWalletClient, sendAccountInfoRequest, sendRegisterFileTransaction } from "../client/crypto-wallet-client";
import { UserWalletSigning } from "./UserWalletSigning";
import './FileDisplay.css';
import TxnHashDisplay from "./TransactionHashDisplay";

interface IWalletSigningState {
    error?: string;
    walletConnected?: boolean;
    bridgeConnected?: boolean;
    txnHash?: string;
    qrCodeUrl?: string;
    bridgeConnectionError?: string;
    walletConnectionError?: string;
    account?: string;
    txnApprovalError?: string;
    txnSubmitError?: string;
    qrCodeScanned?: boolean;
}

interface ISignState {
    inProcess: boolean;
    type?: 'wallet' | 'central';
    txnHash?: string;
}

interface IState {
    isSigned: boolean;
}

const FileDisplay = (props: { file: IUploadedFile }) => {
    const { file } = props;
    const [state, setState] = useState<IState>({
        isSigned: false,
    });
    const [signedState, setSignedState] = useState<ISignState>({ inProcess: false });
    const [walletState, setWalletState] = useState<IWalletSigningState>({});


    const registerCentral = () => {
        setSignedState({ inProcess: true });

        registerData(file.hash).then(res => {
            setState({ isSigned: true });
            setSignedState({
                type: "central",
                inProcess: false,
                txnHash: res.data.txnHash
            });
        });
    }

    const updateWalletState = (newState: IWalletSigningState) => {
        setWalletState({ ...walletState, ...newState });
    };

    const resetWalletState = () => {
        walletState.account = undefined;
        walletState.bridgeConnected = undefined;
        walletState.bridgeConnectionError = undefined;
        walletState.error = undefined;
        walletState.qrCodeScanned = undefined;
        walletState.qrCodeUrl = undefined;
        walletState.txnApprovalError = undefined;
        walletState.txnHash = undefined;
        walletState.txnSubmitError = undefined;
        walletState.walletConnected = undefined;
        walletState.walletConnectionError = undefined;
        return walletState;
    }

    const registerWallet = () => {
        getWalletClient({
            onBridgeConnected: (qrCodeUrl) => {
                console.log('bridge connected');
                walletState.qrCodeUrl = qrCodeUrl;
                walletState.bridgeConnected = true;
                updateWalletState(walletState);
            },
            onBridgeDisconnected: () => {
                console.log('bridge disconnected');
                walletState.bridgeConnected = false;
                updateWalletState(walletState);
            },
            onAccountSelected: (client: ConcordiumWalletClient, accountAddress: string) => {
                console.log('account selected');
                sendRegisterFileTransaction(client, file.hash, accountAddress);
                walletState.account = accountAddress;
                updateWalletState(walletState);
            },
            onError: (client: ConcordiumWalletClient, message) => {
                console.log('bridge / wallet error');
                walletState.error = message;
                updateWalletState(walletState);
                client.disconnect();
            },
            onOperationRejected: (client: ConcordiumWalletClient) => {
                console.log('operation rejected');
                walletState.error = 'Operation was rejected';
                updateWalletState(walletState);
                client.disconnect();
            },
            onQrCodeScanned: (client: ConcordiumWalletClient) => {
                console.log('qr code scanned');
                walletState.qrCodeScanned = true;
                updateWalletState(walletState);
            },
            onTransactionAccepted: (client: ConcordiumWalletClient, txnHash: string) => {
                console.log('txn accepted');
                walletState.txnHash = txnHash;
                updateWalletState(walletState);
                setSignedState({ type: "wallet", inProcess: false, txnHash: txnHash });
                setState({ isSigned: true });
            },
            onTransactionRejected: (client: ConcordiumWalletClient) => {
                console.log('txn rejected');
                walletState.txnApprovalError = 'Transaction was rejected';
                updateWalletState(walletState);
                client.disconnect();
            },
            onWalletConnectionAccepted: (client: ConcordiumWalletClient) => {
                console.log('wallet connection accepted');
                walletState.walletConnected = true;
                updateWalletState(walletState);
                sendAccountInfoRequest(client);
            },
            onWalletConnectionRejected: (client: ConcordiumWalletClient) => {
                console.log('wallet connection rejected');
                walletState.walletConnectionError = 'Wallet connection was rejected';
                updateWalletState(walletState);
                client.disconnect();
            },
        }).connect();

        setSignedState({ type: "wallet", inProcess: true });
        setWalletState(resetWalletState());
    }

    const cancelRegisterWallet = () => {
        setSignedState({ ...signedState, type: undefined, inProcess: false });
        setWalletState(resetWalletState());
    }

    return <Card variant="outlined">
        <CardContent>
            <List>
                <ListItem>
                    <ListItemText primary={<Typography sx={{ fontSize: 24 }} component="div">
                        {file.name}
                    </Typography>} secondary='Name'></ListItemText>
                </ListItem>
                {/* <ListItem>
                    <ListItemText primary={file.size} secondary='Size'></ListItemText>
                </ListItem>
                <ListItem>
                    <ListItemText primary={file.type} secondary='Type'></ListItemText>
                </ListItem> */}
                {/* <ListItem>
                    <ListItemText primary={file.hash} secondary='Hash'></ListItemText>
                </ListItem> */}
                <ListItem>
                    <ListItemText
                        primary={state.isSigned ? 'Registered' : 'Not Registered'}
                        secondary='Status'></ListItemText>
                </ListItem>
                {state.isSigned && signedState.txnHash
                    ? <ListItem>
                        <ListItemText 
                            primary={<TxnHashDisplay txnHash={signedState.txnHash}/>} 
                            secondary='Transaction Hash'/>
                    </ListItem>
                    : <></>}
            </List>
            <CardActions>
            <Button
                    type='button'
                    variant="contained"
                    onClick={registerWallet}
                    disabled={state.isSigned || signedState.inProcess}
                    hidden={state.isSigned}
                >Register using Your Account</Button>
                <Button
                    type='button'
                    variant="outlined"
                    onClick={registerCentral}
                    disabled={state.isSigned || signedState.inProcess}
                    hidden={state.isSigned}
                >Register using Central Account</Button>
            </CardActions>
            {signedState.inProcess && signedState.type === 'wallet' ? <UserWalletSigning
                bridgeConnected={walletState.bridgeConnected}
                isProcess={signedState.inProcess}
                account={walletState.account}
                qrCodeUrl={walletState.qrCodeUrl}
                txnHash={walletState.txnHash}
                walletConnected={walletState.walletConnected}
                qrCodeScanned={walletState.qrCodeScanned}
                onReset={() => registerWallet()}
                onCancel={() => cancelRegisterWallet()}
                onDone={() => cancelRegisterWallet()}
            /> : <></>}
        </CardContent>
    </Card >
}

export default FileDisplay;