import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { MsalProvider } from "@azure/msal-react";
import { getMsalInstance } from "./auth/msalInstance";
import App from "./App.tsx";

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0ea5e9" },
    secondary: { main: "#0f766e" },
  },
});

const msalInstance = await getMsalInstance();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <ThemeProvider theme={lightTheme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </MsalProvider>
  </StrictMode>,
);
