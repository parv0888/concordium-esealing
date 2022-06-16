export const RegisterFilePath = "/concordium/register-file";
export const RegisterDataPath = "/concordium/register-data";
export const GetFilePath = "/concordium/getfile"
export const GetTxnStatus = "/concordium/get-txn-status"
export interface RegisterFileRequest { hash: string }
export interface RegisterDataRequest { hash: string }
export interface RegisterFileResponse {
    txnSentStatus: boolean,
    txnHash: string
}
export interface RegisterDataResponse {
    txnSentStatus: boolean,
    txnHash: string
}
export interface GetTxnStatusRequest {
    hash: string
}
export interface GetTxnStatusResponse {
    status: string
}