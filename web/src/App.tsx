import { useState } from 'react';
import './App.css';
import {
  AppBar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  createTheme,
  IconButton,
  InputLabel,
  Link,
  Paper,
  Stack,
  TextField,
  ThemeProvider,
  Typography
} from '@mui/material';
import { DropzoneArea } from "mui-file-dropzone";
import sha256 from "fast-sha256";
import ConcordiumWalletClient, {
  IBridgeMessage,
  IBridgeMessageDataFromTransactionConctactParam,
  IBridgeMessageDataFromTransactionRequest
} from '@pioneeringtechventures/concordium-wallet-client';

import { registerData } from './client/client';
import { UserWalletSigning } from './components/UserWalletSigning'
import { CONCORDIUM_BRIDGE_ACCESS_KEY, CONCORDIUM_BRIDGE_URL, TXN_LOOKUP_URL } from './client/const';

//@ts-ignore
BigInt.prototype.toJSON = function () { return this.toString() }

interface AppStateFileCentralSigningState {
  txnStatus: string;
  txnHash: string;
  txnSentStatus: boolean;
}

interface AppStateFileWalletSigningState {
  connected?: boolean;
  txnHash?: string;
  connAccepted?: boolean;
  account?: string;
  qrCodeUrl?: string | undefined;
  inProcess?: boolean;
  qrScanned?: boolean;
}

interface AppStateFile {
  name: string;
  hash: string;
  centralSigning?: AppStateFileCentralSigningState,
  walletSigning?: AppStateFileWalletSigningState
  loading: boolean
}

interface AppState {
  files: { [hash: string]: AppStateFile },
  loading: boolean
}

function App() {
  const appBarHeight = 70;
  const [state, setState] = useState<AppState>({
    files: {},
    loading: false,
  });

  const theme = createTheme({
    typography: {
      fontFamily: '"Segoe UI",Arial,sans-serif',
      fontSize: 16,
      body1: {
        fontSize: 18
      },
      body2: {
        fontSize: 16
      },
      h1: {
        fontSize: 50,
      },
      h2: {
        fontSize: 40
      },
      h3: {
        fontSize: 24
      },
    },
    palette: {
      primary: {
        main: '#325D76',
        contrastText: '#FBFBF9',
      },
      secondary: {
        main: '#907D6A',
        contrastText: '#000000',
        dark: '#343231',
        light: '#C0B2A4'
      },
      mode: 'light',
      common: {
        black: '#181817',
        white: '#FBFBF9'
      },
    }
  });

  const handleChange = (loadedFiles: File[]) => {
    if (!loadedFiles || !loadedFiles.length) {
      return;
    }

    const file = loadedFiles[loadedFiles.length - 1];
    file.arrayBuffer()
      .then(buff => sha256(new Uint8Array(buff)))
      .then(hash => Buffer.from(hash).toString("hex"))
      .then(hash => setState({
        ...state,
        files: {
          ...state.files,
          [hash]: { name: file.name, hash, loading: false, centralSigning: undefined }
        }
      }));
  }

  const registerCentralWallet = (file: AppStateFile) => {
    registerData(file.hash)
      .then(res => {
        const centralSigning = file.centralSigning || {} as AppStateFileCentralSigningState;
        centralSigning.txnSentStatus = res.data.txnSentStatus;
        centralSigning.txnHash = res.data.txnHash;
        centralSigning.txnStatus = "";
        file.centralSigning = centralSigning;
        return file;
      })
      .then(file => setState({
        ...state,
        files: { ...state.files, [file.hash]: file }
      }));
  }

  const getFileArray = (files: { [hash: string]: AppStateFile }) => {
    return Object.keys(files)
      .map(hash => files[hash]);
  }

  const setFileState = (file: AppStateFile) => {
    setState({
      ...state,
      files: {
        ...state.files,
        [file.hash]: { ...file }
      }
    });
  }

  const registerUserWallet = (fileState: AppStateFile) => {
    const file = { ...fileState };

    if (file.walletSigning && file.walletSigning.inProcess) {
      file.walletSigning = { inProcess: true };
      setFileState(file);
    }

    class QrCodeHandler {
      public open = (msg: IBridgeMessage) => {
        file.walletSigning = {
          ...file.walletSigning,
          qrCodeUrl: msg.connect_string,
          connected: true,
          inProcess: true,
        };
        setFileState(file);
      }

      public close = () => {
        console.log('close')
      }
    }

    const concordiumWalletClient = new ConcordiumWalletClient({
      bridgeHost: CONCORDIUM_BRIDGE_URL,
      bridgeConnectionKey: CONCORDIUM_BRIDGE_ACCESS_KEY,
      qrModal: QrCodeHandler,
    });

    concordiumWalletClient.on('connect', (data) => {
      console.log('on connect');
      file.walletSigning = {
        ...file.walletSigning,
        qrScanned: true,
      };
      setFileState(file);
    });

    concordiumWalletClient.on('accept', () => {
      concordiumWalletClient.send("AccountInfo", {});
      file.walletSigning = {
        ...file.walletSigning,
        connected: true,
        connAccepted: true,
        inProcess: true,
      };
      setFileState(file);
    });

    concordiumWalletClient.on('accountInfo', (data: { address: string }[]) => {
      console.log('Wallet balance: ', data);
      file.walletSigning = file.walletSigning || {};
      file.walletSigning.account = data[0].address;
      setFileState(file);

      const buff = Buffer.alloc(4);
      buff.writeInt32LE(file.hash.length);
      const serializedSize = buff.toString('hex');
      const utf8Encode = new TextEncoder();
      const serialzedHash = Buffer.from(utf8Encode.encode(file.hash)).toString('hex');
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
        from: file.walletSigning.account,
        contract_params: [
          {
            param_name: "",
            param_type: "string",
            param_value: file.hash,
            mandatory: "1",
          } as unknown as IBridgeMessageDataFromTransactionConctactParam
        ],
        expiry: (new Date().getTime() + 3600000).toString(),
        nrg_limit: "3000",
        // serialized_params: file.hash
        // serialized_params: "014000000062663262383766313561313266343734373266663838646637663532643637303962373531333931356364323239396162663637356338366334326164373261"
        // serialized_params: "bf2b87f15a12f47472ff88df7f52d6709b7513915cd2299abf675c86c42ad72a",
        serialized_params: serialzedParams,
      } as IBridgeMessageDataFromTransactionRequest;

      console.log('sending transaction', txn);
      concordiumWalletClient.send('Transaction', txn);
    });

    concordiumWalletClient.on(
      'transfer',
      (data: { data: { tx_hash: string, tx_status: 'Accepted' | 'Rejected' } }) => {

        file.walletSigning = file.walletSigning || {};
        file.walletSigning.txnHash = data.data.tx_hash;

        setFileState(file);
        console.log('transfer', data.data.tx_hash, data);
        console.log('transfer', file);
        concordiumWalletClient.disconnect();
    });

    //   concordiumWalletClient.on('error', async (message) => {
    //     await concordiumWalletClient.disconnect();

    //     throw new Error(`WS.bridge.error ${JSON.stringify(message)}`);
    //   });

    //   concordiumWalletClient.on('reject', () => {
    //     console.error('Request was rejected');

    //     concordiumWalletClient.disconnect();
    //   });

    concordiumWalletClient.on('transactionReject', () => {
      console.error('Transaction was rejected');
    });

    //   concordiumWalletClient.on('connectionReject', () => {
    //     console.error('Connection was rejected');
    //   });

    concordiumWalletClient.connect();
    setFileState({ ...file, walletSigning: { inProcess: true } });
  }

  const cancelRegisterUserWallet = (file: AppStateFile) => {
    file.walletSigning = { inProcess: false };
    setFileState(file);
  }

  const WalletSigningInformation = (props: { hash: string }) => {
    const { hash } = props;

    const file = state.files[hash];
    const walletSigning = file.walletSigning;
    if (!walletSigning) {
      return <></>
    }

    if (!walletSigning.inProcess) {
      return <></>
    }

    return <UserWalletSigning
      bridgeConnected={walletSigning.connected}
      isProcess={walletSigning.inProcess}
      account={walletSigning.account}
      qrCodeUrl={walletSigning.qrCodeUrl}
      txnHash={walletSigning.txnHash}
      walletConnected={walletSigning.connAccepted}
      qrCodeScanned={walletSigning.qrScanned}
      onReset={() => registerUserWallet(file)}
      onCancel={() => cancelRegisterUserWallet(file)}
      onDone={() => cancelRegisterUserWallet(file)}
    />
  }

  const CentralSigningInformation = (props: { info?: AppStateFileCentralSigningState }) => {
    const { info } = props;

    if (!info) {
      return <></>
    }

    return <Box>
      <Typography variant="h6">Registering file using Central Account</Typography>
      <Link
        variant='subtitle1'
        target={'_blank'}
        href={`${TXN_LOOKUP_URL}/${info.txnHash}`}>View Transaction Info</Link>
    </Box>
  }

  const FileDisplayCard = (props: { file: AppStateFile }) => {
    const { file } = props;

    return (
      <Card variant='outlined'>
        <CardHeader
          action={
            <IconButton aria-label="delete"></IconButton>
          }
          title={<Typography variant='h3'>{file.name}</Typography>}
        />
        <CardContent>
          <Stack spacing={1}>
            <InputLabel>File Hash</InputLabel>
            <TextField defaultValue={file.hash} disabled fullWidth multiline></TextField>
            <CentralSigningInformation info={file.centralSigning}></CentralSigningInformation>
            <WalletSigningInformation hash={file.hash} />
          </Stack>
        </CardContent>
        <CardActions>
          <Button
            disabled={!!file.centralSigning?.txnHash}
            type='button'
            onClick={e => registerCentralWallet(file)}>
            Sign using sponsored Account
          </Button>
          <Button
            onClick={e => registerUserWallet(file)}>
            Sign using your wallet
          </Button>
        </CardActions>
      </Card>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <AppBar sx={{ height: appBarHeight }}>
          <Stack maxWidth="xl" direction={'row'} spacing={3} sx={{ width: "fit-content", margin: "auto" }}>
            <Typography
              noWrap
              variant='h1'
              sx={{
                marginTop: "auto",
                marginBottom: "auto",
              }}> Concordium Sealing Service </Typography>
          </Stack>
        </AppBar>
        <Container sx={{ marginTop: (2 * appBarHeight) + 'px' }} maxWidth={'sm'}>
          <Stack spacing={3}>
            <Paper>
              <DropzoneArea
                onChange={handleChange}
                fileObjects={{}}
                showPreviewsInDropzone={false}
                showPreviews={false}
                initialFiles={[]}
                filesLimit={1} />
            </Paper>
            <Stack spacing={2}>
              {
                getFileArray(state.files)
                  .map(file => <FileDisplayCard file={file} />)
              }
            </Stack>
          </Stack>
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;
