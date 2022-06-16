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
    "palette": {
        "common": {
            "black": "#000",
            "white": "#fff"
        },
        "background": {
            "paper": "#fff",
            "default": "#fafafa"
        },
        "primary": {
            light: "rgba(251, 251, 249, 1)",
            "main": "rgba(68, 134, 171, 1)",
            "dark": "rgba(24, 24, 23, 1)",
            "contrastText": "rgba(255, 255, 255, 1)"
        },
        "secondary": {
            "light": "rgba(209, 208, 201, 1)",
            "main": "rgba(52, 50, 49, 1)",
            "dark": "rgba(192, 178, 164, 1)",
            "contrastText": "rgba(247, 247, 244, 1)"
        },
        "error": {
            "light": "#e57373",
            "main": "#f44336",
            "dark": "#d32f2f",
            "contrastText": "#fff"
        },
        "text": {
            "primary": "rgba(0, 0, 0, 0.87)",
            "secondary": "rgba(0, 0, 0, 0.54)",
            "disabled": "rgba(0, 0, 0, 0.38)",
        }
    }
});