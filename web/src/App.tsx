import { Paper, Stack, SxProps } from "@mui/material";
import { useState } from "react";
import FileDisplay from "./components/FileDisplay";
import FileUploadZone, { IUploadedFile } from "./components/FileUploadZone";


interface IFileState extends IUploadedFile { };
interface IState {
    files: { [hash: string]: IFileState }
};

const App = (props: { sx?: SxProps }) => {
    const [state, setState] = useState<IState>({ files: {} });
    const fileUploaded = (file: IUploadedFile) => {
        setState({ ...state, files: { ...state.files, [file.hash]: file } })
    }

    return (
        <Stack spacing={3} sx={props.sx}>
            <FileUploadZone onUpload={fileUploaded} />
            {Object.keys(state.files).length ? <Stack spacing={2}>
                {
                    Object.keys(state.files)
                        .map(hash => <FileDisplay key={hash} file={state.files[hash]} />)
                }
            </Stack> : <></>
            }
        </Stack>
    );
}
export default App;