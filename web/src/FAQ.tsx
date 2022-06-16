import { Accordion, AccordionDetails as MuiAccordionDetails, AccordionSummary, Link, Paper, Stack, styled, SxProps, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
    padding: theme.spacing(2),
    borderTop: '1px solid rgba(0, 0, 0, .125)',
}));

const FAQ = (props: { sx?: SxProps }) => {
    return <>
        <Stack sx={props.sx}>
            <Accordion sx={{width: 1}}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h3">What is sealing?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        Seals are used to protect things which must not be tampered with.
                        A seal is unique to the sealer and shows the valid execution, source, importance, authenticity or witness by the sealer.
                        A seal is data, which is attached to or logically associated with other data in electronic form to ensure the latter’s origin and integrity.
                    </Typography>
                    <Typography>
                        If you seal a file, you can prove that it was in your possession at the time of sealing.
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body1">How does it work?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        Drag and drop a file or click to import a file.
                        You can now use your own Concordium account to seal the file by registering its hash on chain.
                        For this you need to have your Concordium account in the CryptoX wallet so you can use the QR functionality.
                        The CryptoX wallet is available for <Link target={"_blank"} href="https://apps.apple.com/sg/app/cryptox-wallet/id1593386457">Apple</Link> and <Link target={"_blank"
                        } href="https://play.google.com/store/apps/details?id=com.pioneeringtechventures.wallet&hl=en_GB&gl=US">Android</Link>.
                    </Typography>
                    <Typography>
                        If you seal a file, you can prove that it was in your possession at the time of sealing.
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body1">How to check your sealed documents?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        You can check for your transaction hash in &nbsp;
                        <Link target={"_blank"} href="https://dashboard.mainnet.concordium.software/">Concordium Explorer</Link> or
                        &nbsp;<Link target={"_blank"} href="https://ccdscan.io/">ccdscan</Link>.
                        If you used the sponsored account you can also use the <Link target={"_blank"} href="https://timestamp.northstake.dk/">timestamping showcase</Link> to check your file via its hash.
                        Finding the hash of a sealed document is a next step in functionality and is a little more tricky
                        - but of course it is there: On chain / globally / tamper resistant.
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body1">What is a document hash?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        A document hash is an algorithmic way to assign a unique string to a document using cryptographic functions,
                        which is considered tamper proof.
                        The document hash allows for an easy way to verify with overwhelming probability if this is the time stamped document.
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body1">What is a transaction hash?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        A transaction hash represents a data entry on the Concordium blockchain,
                        which stores the document hash and time stamp on an immutable,
                        decentralized record that can be retrieved at a later stage.
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body1">What is the cost of using your account to seal a file?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        The cost is currently approximately 7 Euro cents.
                        Concordium has a roadmap for developing more wallets with more functionality and in the future it will be possible to do it for 1 Euro cent.
                    </Typography>
                </AccordionDetails>
            </Accordion>
        </Stack>
    </>
}
export default FAQ;