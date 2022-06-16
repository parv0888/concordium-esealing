import { Link } from "@mui/material";
import { TXN_LOOKUP_URL } from "../client/const";

const TxnHashDisplay = (props: { txnHash: string }) => { 
    return <>
        <Link href={`${TXN_LOOKUP_URL}/${props.txnHash}`} target='_blank'>
            {`${props.txnHash.substring(0, 4)}...${props.txnHash.substring(props.txnHash.length - 5)}`}
        </Link>
    </>
}
export default TxnHashDisplay;