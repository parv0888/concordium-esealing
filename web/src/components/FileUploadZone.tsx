import sha256 from "fast-sha256";
import { DropzoneArea } from "mui-file-dropzone"

export interface IUploadedFile {
    name: string;
    size: number;
    type: string;
    hash: string;
}

const FileUploadZone = (props: { onUpload: (file: IUploadedFile) => void }) => {
    const handleChange = (loadedFiles: File[]) => {
        if (!loadedFiles || !loadedFiles.length) {
            return;
        }

        const file = loadedFiles[loadedFiles.length - 1];
        file.arrayBuffer()
            .then(buff => sha256(new Uint8Array(buff)))
            .then(hash => Buffer.from(hash).toString("hex"))
            .then(hash => props.onUpload({
                hash,
                name: file.name,
                size: file.size,
                type: file.type
            }));
    }

    return (<DropzoneArea
        onChange={handleChange}
        fileObjects={{}}
        showPreviewsInDropzone={false}
        showPreviews={false}
        initialFiles={[]}
        filesLimit={1} />
    )
};
export default FileUploadZone;