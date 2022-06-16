import { Button, CircularProgress, Link, Step, StepContent, StepLabel, Stepper, Typography } from "@mui/material"
import { red } from "@mui/material/colors";
import { Box } from "@mui/system"
import QRCode from "react-qr-code";
import { TXN_LOOKUP_URL } from "../client/const";

enum Steps {
    //Connecting to the Bridge
    Connecting = 0,
    ScanQrCode = 1,
    // Bridge Connection has been Accepted
    WalletConnection = 2,
    SelectAccount = 3,
    ApproveTransaction = 4,
    WaitForTransactionFinalization = 5
}

interface IProps {
    walletConnected?: boolean;
    bridgeConnected?: boolean;
    isProcess: boolean;
    txnHash?: string;
    qrCodeUrl?: string;
    bridgeConnectionError?: string;
    walletConnectionError?: string;
    account?: string;
    txnApprovalError?: string;
    txnSubmitError?: string;
    qrCodeScanned?: boolean;
    onReset: () => void;
    onCancel: () => void;
    onDone: () => void;
}

export const ErrorDisplay = (props: { message: string }) => {
    return <Typography>{props.message || 'Error'}</Typography>
}

const callculateActiveStep = (props: IProps): Steps => {
    console.log(`callculating step for props`, props);

    if (props.txnHash || props.txnSubmitError) {
        return Steps.WaitForTransactionFinalization;
    }

    if (props.account) {
        return Steps.ApproveTransaction;
    }

    if (props.walletConnected) {
        return Steps.SelectAccount;
    }

    if (props.qrCodeScanned) {
        return Steps.WalletConnection;
    }

    if (props.bridgeConnected || props.walletConnectionError) {
        return Steps.ScanQrCode;
    }

    if (props.bridgeConnectionError) {
        return Steps.Connecting;
    }

    return Steps.Connecting;
};

export const UserWalletSigning = (props: IProps) => {
    if (!props.isProcess) {
        return <></>
    }

    const step: Steps = callculateActiveStep(props);

    return <Box>
        <Typography variant="h6">Signing using your wallet</Typography>
        <Stepper activeStep={step} orientation='vertical'>
            <Step key={Steps.Connecting}>
                <StepLabel>Connecting to Bridge</StepLabel>
                <StepContent>
                    <Typography>Connecting to Bridge</Typography>
                    {props.bridgeConnectionError ? <ErrorDisplay message="Error in Bridge Connection" /> : <CircularProgress />}
                </StepContent>
            </Step>
            <Step key={Steps.ScanQrCode}>
                <StepLabel>Scan QR Code</StepLabel>
                <StepContent>
                    <Box>
                        {props.qrCodeUrl
                            ? <QRCode value={props.qrCodeUrl}></QRCode>
                            : <ErrorDisplay message="QR Code Url Not Found" />}
                        <Typography>Scan the QR code with the wallet App</Typography>
                        {props.walletConnectionError ? <ErrorDisplay message="Error in Wallet Connection" /> : <CircularProgress />}
                    </Box>
                </StepContent>
            </Step>
            <Step key={Steps.WalletConnection}>
                <StepLabel error={!!props.walletConnectionError}>Connect To Wallet</StepLabel>
                <StepContent>
                    <Typography>Approve the wallet connection in the app</Typography>
                    {props.walletConnectionError
                        ? <ErrorDisplay message={props.walletConnectionError} />
                        : <></>
                    }
                </StepContent>
            </Step>
            <Step key={Steps.SelectAccount}>
                <StepLabel>Select Account</StepLabel>
                <StepContent>
                    <Typography>Select Account</Typography>
                </StepContent>
            </Step>
            <Step key={Steps.ApproveTransaction}>
                <StepLabel error={!!props.txnApprovalError}>Approve Transaction</StepLabel>
                <StepContent>
                    <Typography>Approve the transaction on Mobile App</Typography>
                    {props.txnApprovalError
                        ? <ErrorDisplay message="Error in Transaction approval" />
                        : <></>
                    }
                </StepContent>
            </Step>
            <Step key={Steps.WaitForTransactionFinalization}>
                <StepLabel error={!!props.txnSubmitError}>Wait for Transaction</StepLabel>
                <StepContent>
                    {props.txnSubmitError
                        ? <ErrorDisplay message="Error in Submitting Transaction" />
                        : <></>
                    }
                    {!props.txnHash && !props.txnSubmitError
                        ? <ErrorDisplay message="No Transaction hash found" />
                        : <Link
                            variant='subtitle1'
                            target={'_blank'}
                            href={`${TXN_LOOKUP_URL}/${props.txnHash}`}>View Transaction Info</Link>
                    }
                </StepContent>
            </Step>
        </Stepper>
        <Button type="button" onClick={e => props.onReset()}>Reset</Button>
        {step !== Steps.WaitForTransactionFinalization
            ? <Button type="button" onClick={e => props.onCancel()}>Cancel</Button>
            : <></>
        }
        {step == Steps.WaitForTransactionFinalization
            ? <Button type="button" onClick={e => props.onDone()}>Done</Button>
            : <></>
        }
    </Box>
}