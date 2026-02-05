import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MsalProvider } from "@azure/msal-react";
import { initializeWebFragments } from "web-fragments";
import { getMsalInstance } from "./auth/msalInstance";
import App from "./App.tsx";
import "./theme.css";

initializeWebFragments();

const msalInstance = await getMsalInstance();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  </StrictMode>,
);
