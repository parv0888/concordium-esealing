import { ThemeProvider } from '@emotion/react';
import { AppBar, Stack, Typography, Container } from '@mui/material';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import FAQ from './FAQ';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { theme } from "./theme";

const appBarHeight = 70;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <div className="App">
        <AppBar sx={{ height: appBarHeight }}>
          <Stack maxWidth="xl" spacing={3} sx={{ width: "fit-content", margin: "auto" }}>
            <Typography
              noWrap
              variant='h1'
              sx={{
                marginTop: "auto",
                marginBottom: "auto",
              }}> Concordium Sealing Service </Typography>
          </Stack>
        </AppBar>
        <Container sx={{
          marginTop: appBarHeight + 'px',
          paddingTop: 5,
        }}>
          <Stack
            direction={{ md: 'row', sm: 'column', xs: 'column' }}
            spacing={1}
          >
            <App sx={{
              width: { md: 1 / 2, sm: 1, xs: 1 },
              borderWidth: 8,
              borderColor: 'primary.main',
              borderStyle: 'solid',
              backgroundColor: 'primary.light',
              padding: { md: 2, sm: 0, xs: 0 }
            }} />
            <FAQ sx={{ width: { md: 1 / 2, sm: 1, xs: 1 } }} />
          </Stack>
        </Container>
      </div>
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
