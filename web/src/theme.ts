import { createTheme } from "@mui/material";

export const theme = createTheme({
    typography: {
        fontFamily: 'NB Akademie Std',
        fontSize: 16,
        body1: {
            fontSize: 18,
        },
        body2: {
            fontSize: 16
        },
        h1: {
            fontSize: 50,
            fontWeight: 'bold',
            fontFamily: 'NB Akademie Std'
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
            light: '#FBFBF9',
            dark: '#181817'
        },
        secondary: {
            main: '#907D6A',
            dark: '#343231',
            light: '#D1D0C9'
        },
    }
});