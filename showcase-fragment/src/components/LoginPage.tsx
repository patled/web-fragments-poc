import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../auth/loginRequest";

export function LoginPage() {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginRedirect(loginRequest);
  };

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        fontFamily: "system-ui",
        padding: "2.5rem",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, margin: 0 }}>
        Anmeldung erforderlich
      </h1>
      <p
        style={{
          color: "rgba(0,0,0,0.6)",
          margin: 0,
          textAlign: "center",
          maxWidth: "28rem",
        }}
      >
        Bitte melden Sie sich an, um die Anwendung zu nutzen.
      </p>
      <button
        type="button"
        onClick={handleLogin}
        style={{
          padding: "0.75rem 1.5rem",
          fontSize: "1rem",
          fontWeight: 600,
          color: "#fff",
          backgroundColor: "#0ea5e9",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        Anmelden
      </button>
    </div>
  );
}
