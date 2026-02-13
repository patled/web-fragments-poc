import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import {
  InteractionRequiredAuthError,
  InteractionStatus,
} from "@azure/msal-browser";
import { loginScopes } from "../auth/authConfig";
import { getShellAccessToken } from "../auth/tokenBroker";
import { apiBaseUrl } from "./config";
import type { BigCity } from "../types/bigcities";

const BIGCITIES_URL = `${apiBaseUrl}/bigcities`;

export type BigCitiesState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: BigCity[] }
  | { status: "error"; error: string };

/**
 * Holt ein Access-Token per acquireTokenSilent (mit Scopes aus VITE_B2C_SCOPES)
 * und ruft die API GET /bigcities auf.
 */
export function useBigCities(): BigCitiesState {
  const { instance, accounts, inProgress } = useMsal();
  const [state, setState] = useState<BigCitiesState>({ status: "idle" });

  useEffect(() => {
    if (inProgress !== InteractionStatus.None || accounts.length === 0) {
      if (inProgress !== InteractionStatus.None) {
        return;
      }
    }

    let isActive = true;

    const fetchWithToken = async (accessToken: string) => {
      const response = await fetch(BIGCITIES_URL, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(`API ${response.status}: ${response.statusText}`);
      }
      return (await response.json()) as BigCity[];
    };

    const acquireLocalToken = async () => {
      if (accounts.length === 0) {
        throw new Error("No account available for token acquisition.");
      }
      const account = accounts[0];
      const request = { scopes: loginScopes, account };

      try {
        const response = await instance.acquireTokenSilent(request);
        return response.accessToken;
      } catch (err) {
        if (err instanceof InteractionRequiredAuthError) {
          const response = await instance.acquireTokenPopup(request);
          return response.accessToken;
        }
        throw err;
      }
    };

    const load = async () => {
      setState({ status: "loading" });

      try {
        const brokerToken = await getShellAccessToken(loginScopes);
        const accessToken = brokerToken ?? (await acquireLocalToken());
        const data = await fetchWithToken(accessToken);
        if (isActive) {
          setState({ status: "success", data });
        }
      } catch (err) {
        if (isActive) {
          setState({
            status: "error",
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
    };

    void load();

    return () => {
      isActive = false;
    };
  }, [instance, accounts, inProgress]);

  return state;
}
