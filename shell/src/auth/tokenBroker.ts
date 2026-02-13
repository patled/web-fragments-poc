import type { IPublicClientApplication } from "@azure/msal-browser";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import type { PopupRequest } from "@azure/msal-browser";

type TokenBrokerApi = {
  getAccessToken: (scopes: string[]) => Promise<string>;
};

declare global {
  interface Window {
    shellAuth?: TokenBrokerApi;
  }
}

const REQUEST_TYPE = "shell-auth-request";
const RESPONSE_TYPE = "shell-auth-response";

function getAllowedOrigins(): string[] {
  const raw = import.meta.env.VITE_FRAGMENT_ORIGINS;
  if (!raw) return [];
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function isAllowedOrigin(origin: string, allowedOrigins: string[]): boolean {
  if (allowedOrigins.length === 0) {
    return true;
  }
  return allowedOrigins.includes(origin);
}

export function registerTokenBroker(
  msalInstance: IPublicClientApplication,
): () => void {
  const api: TokenBrokerApi = {
    getAccessToken: async (scopes) => {
      const account =
        msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0];
      if (!account) {
        throw new Error("No account available for token acquisition.");
      }

      const request: PopupRequest = { scopes, account };

      try {
        const response = await msalInstance.acquireTokenSilent(request);
        console.log(
          "[TokenBroker] Acquired token silently for scopes:",
          scopes,
        );
        return response.accessToken;
      } catch (err) {
        if (err instanceof InteractionRequiredAuthError) {
          const response = await msalInstance.acquireTokenPopup(request);
          return response.accessToken;
        }
        throw err;
      }
    },
  };

  const allowedOrigins = getAllowedOrigins();
  window.shellAuth = api;

  const handleMessage = async (event: MessageEvent) => {
    const data = event.data;
    if (!data || data.type !== REQUEST_TYPE) return;
    if (!isAllowedOrigin(event.origin, allowedOrigins)) return;

    const port = event.ports?.[0];
    if (!port) return;

    const requestId = data.requestId as string | undefined;
    const scopes = data.scopes as string[] | undefined;

    if (!requestId || !Array.isArray(scopes)) {
      port.postMessage({
        type: RESPONSE_TYPE,
        requestId,
        error: "Invalid token request.",
      });
      return;
    }

    try {
      const accessToken = await api.getAccessToken(scopes);
      port.postMessage({ type: RESPONSE_TYPE, requestId, accessToken });
    } catch (err) {
      port.postMessage({
        type: RESPONSE_TYPE,
        requestId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  };

  window.addEventListener("message", handleMessage);

  return () => {
    window.removeEventListener("message", handleMessage);
    delete window.shellAuth;
  };
}
