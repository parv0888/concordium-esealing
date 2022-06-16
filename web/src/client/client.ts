import { default as axios } from 'axios';
import { CENTRAL_SIGNING_SERVICE_URL } from './const';
import {
    GetTxnStatusRequest,
    GetTxnStatusResponse,
    RegisterDataPath,
    RegisterDataRequest,
    RegisterDataResponse,
    RegisterFilePath
} from './shared-client-server-types';

export const registerData = async (hash: string) => {
    return await axios.post<RegisterDataResponse>(
        `${CENTRAL_SIGNING_SERVICE_URL}${RegisterDataPath}`,
        { hash } as RegisterDataRequest
    );
}

export const getTransactionStatus = async (hash: string) => {
    return await axios.post<GetTxnStatusResponse>(
        `${CENTRAL_SIGNING_SERVICE_URL}${RegisterFilePath}`,
        { hash } as GetTxnStatusRequest
    );
}