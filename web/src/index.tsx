import { ThemeProvider } from '@emotion/react';
import styled from '@emotion/styled';
import { AppBar as MuiAppBar, Stack, Typography, Container, Paper, Box, Divider, Icon } from '@mui/material';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import FAQ from './FAQ';
import './index.css';
import Logo from './Logo';
import { theme } from "./theme";

const AppBar = styled(MuiAppBar)({
  height: '20%',
  width: '100%',
  maxWidth: 'xl',
  position: 'static',
  boxShadow: 'none',
  backgroundImage: 'url("header-background.jpeg")',
  backgroundColor: 'transparent',
  backgroundBlendMode: 'lighten'

});

const AppBarContent = styled('div')({
  marginTop: 'auto',
  marginBottom: 'auto',
  marginLeft: 'auto',
  marginRight: 'auto',
})

const PageHeading = styled(Typography)({
  fontSize: 60,
  marginTop: '0 !important',
  fontWeight: 700,
  color: 'black',
  lineHeight: 'normal'
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <div className="App" style={{ minWidth: '500px' }}>
        <AppBar>
          <AppBarContent>
            <Stack maxWidth="xl" spacing={3} sx={{
              width: "fit-content",
              margin: "auto",
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              padding: '20px',
              borderRadius: 3
            }}>
              <Logo
                fontSize='h1'
                viewBox="0 0 250 45"
              />
              <PageHeading> Sealing Service </PageHeading>
            </Stack>
          </AppBarContent>
        </AppBar>
        <Box sx={{ padding: 2, }}>
          <Container>
            <Typography variant='h2'>
              What is File Sealing ?
            </Typography>
            <Typography variant='body1'>
              Seals are used to protect things which must not be tampered with.
              A seal is unique to the sealer and shows the valid execution, source, importance, authenticity or witness by the sealer.
              A seal is data, which is attached to or logically associated with other data in electronic form to ensure the latter’s origin and integrity.
            </Typography>
            <Typography variant='body1'>
              If you seal a file, you can prove that it was in your possession at the time of sealing.
            </Typography>
          </Container>
        </Box>
        <Divider></Divider>
        <Container sx={{ paddingTop: 5 }}>
          <Stack
            direction={{ md: 'row', sm: 'column', xs: 'column' }}
            spacing={1}
          >
            <Paper sx={{ width: { md: 1 / 2, sm: 1, xs: 1 } }} variant="outlined">
              <App sx={{
                backgroundColor: 'primary.light',
                paddingLeft: 2,
                paddingRight: 2,
                paddingBottom: 2
              }} />
            </Paper>
            <Divider></Divider>
            <FAQ sx={{ width: { md: 1 / 2, sm: 1, xs: 1 } }} />
          </Stack>
        </Container>
      </div>
    </ThemeProvider>
  </React.StrictMode>
);
