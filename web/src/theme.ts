import { createTheme } from "@mui/material";

export const theme = createTheme({
    typography: {
        fontFamily: '"Segoe UI",Arial,sans-serif',
        fontSize: 16,
        body1: {
            fontSize: 18
        },
        body2: {
            fontSize: 16
        },
        h1: {
            fontSize: 50,
        },
        h2: {
            fontSize: 40
        },
        h3: {
            fontSize: 24
        },
    },
    palette: {
        primary: {
            main: '#325D76',
            contrastText: '#FBFBF9',
        },
        secondary: {
            main: '#907D6A',
            contrastText: '#000000',
            dark: '#343231',
            light: '#C0B2A4'
        },
        mode: 'light',
        common: {
            black: '#181817',
            white: '#FBFBF9'
        },
    }
});