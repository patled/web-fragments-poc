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
      }}
    >
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, margin: 0 }}>
        Anmeldung erforderlich
      </h1>
      <p
        style={{
          color: "var(--color-text-secondary)",
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
          color: "var(--color-btn-primary-fg)",
          backgroundColor: "var(--color-btn-primary)",
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
