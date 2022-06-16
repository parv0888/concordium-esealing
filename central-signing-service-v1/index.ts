import dotenv from 'dotenv';
import path from 'path';

const nodeEnv = process.env.NODE_ENV || 'development';
console.log(dotenv.config({ path: path.join(__dirname, `.env.${nodeEnv}`), }));

import express from 'express';
import { default as cors } from 'cors';
import { RegisterDataPath, RegisterDataRequest, RegisterDataResponse } from './shared-client-server-types';
import { registerData } from './smart-contract-utils';

// console.log(dotenv.config());
const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const port = process.env.PORT || 5000;

//Register Data
app.post(RegisterDataPath, async (req, res) => {

    try {
        const registerDataRes = await registerData((req.body as RegisterDataRequest).hash);
        res.json({
            txnSentStatus: registerDataRes.sentStatus,
            txnHash: registerDataRes.txnHash
        } as RegisterDataResponse);
    } catch (e) {
        console.error(JSON.stringify(e));
        res.status(500).json({ error: JSON.stringify(e) })
    }
});

app.listen(port, () => {
    console.log(`[server]: env: ${nodeEnv}`);
    console.log(`[server]: Server is running at https://localhost:${port}`);
});