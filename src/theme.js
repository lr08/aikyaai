import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // Blue for buttons
    },
    secondary: {
      main: "#f50057", // Pink for highlights
    },
  },
  typography: {
    fontFamily: "Arial, sans-serif",
  },
});

export default theme;
