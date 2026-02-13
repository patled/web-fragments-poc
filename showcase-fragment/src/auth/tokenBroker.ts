const REQUEST_TYPE = "shell-auth-request";
const RESPONSE_TYPE = "shell-auth-response";
const REQUEST_TIMEOUT_MS = 5000;

type TokenResponse = {
  type: string;
  requestId: string;
  accessToken?: string;
  error?: string;
};

function isEmbedded(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

function getTargetOrigin(): string {
  if (document.referrer) {
    try {
      return new URL(document.referrer).origin;
    } catch {
      return "*";
    }
  }
  return "*";
}

async function requestTokenViaPostMessage(scopes: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    const requestId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
    const targetOrigin = getTargetOrigin();

    const timeoutId = window.setTimeout(() => {
      channel.port1.onmessage = null;
      channel.port1.close();
      reject(new Error("Shell token request timed out."));
    }, REQUEST_TIMEOUT_MS);

    channel.port1.onmessage = (event) => {
      const data = event.data as TokenResponse | undefined;
      if (
        !data ||
        data.type !== RESPONSE_TYPE ||
        data.requestId !== requestId
      ) {
        return;
      }
      window.clearTimeout(timeoutId);
      channel.port1.onmessage = null;
      channel.port1.close();

      if (data.error) {
        reject(new Error(data.error));
        return;
      }
      if (!data.accessToken) {
        reject(new Error("Shell did not return an access token."));
        return;
      }
      resolve(data.accessToken);
    };

    window.parent.postMessage(
      { type: REQUEST_TYPE, requestId, scopes },
      targetOrigin,
      [channel.port2],
    );
  });
}

export async function getShellAccessToken(
  scopes: string[],
): Promise<string | null> {
  if (!isEmbedded()) {
    return null;
  }

  try {
    const direct = (window.parent as Window & { shellAuth?: unknown })
      .shellAuth;
    if (typeof direct === "object" && direct && "getAccessToken" in direct) {
      const getAccessToken = (direct as { getAccessToken: unknown })
        .getAccessToken;
      if (typeof getAccessToken === "function") {
        return await (getAccessToken as (s: string[]) => Promise<string>)(
          scopes,
        );
      }
    }
  } catch {
    // Cross-origin access, fall back to postMessage.
  }

  try {
    return await requestTokenViaPostMessage(scopes);
  } catch {
    return null;
  }
}
