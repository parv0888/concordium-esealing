import { AppBar, Container, Paper, Stack, ThemeProvider, Typography } from "@mui/material";
import { useState } from "react";
import FileDisplay from "./components/FileDisplay";
import FileUploadZone, { IUploadedFile } from "./components/FileUploadZone";
import { theme } from "./theme";

const appBarHeight = 70;

interface IFileState extends IUploadedFile { };
interface IState {
    files: { [hash: string]: IFileState }
};

const App = () => {
    const [state, setState] = useState<IState>({ files: {} });
    const fileUploaded = (file: IUploadedFile) => {
        setState({ ...state, files: { ...state.files, [file.hash]: file } })
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
                            <FileUploadZone onUpload={fileUploaded} />
                        </Paper>
                        <Stack spacing={2}>
                            {
                                Object.keys(state.files)
                                    .map(hash => <FileDisplay key={hash} file={state.files[hash]} />)
                            }
                        </Stack>
                    </Stack>
                </Container>
            </div>
        </ThemeProvider>
    );
}
export default App;