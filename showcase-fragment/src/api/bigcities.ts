import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import {
  InteractionRequiredAuthError,
  InteractionStatus,
} from "@azure/msal-browser";
import { loginScopes } from "../auth/authConfig";
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
      return;
    }

    const account = accounts[0];
    const request = { scopes: loginScopes, account };

    setState({ status: "loading" });

    instance
      .acquireTokenSilent(request)
      .then((response) => {
        return fetch(BIGCITIES_URL, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${response.accessToken}`,
          },
        });
      })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`API ${res.status}: ${res.statusText}`);
        }
        const data = (await res.json()) as BigCity[];
        setState({ status: "success", data });
      })
      .catch((err) => {
        if (err instanceof InteractionRequiredAuthError) {
          instance
            .acquireTokenPopup(request)
            .then((response) => {
              return fetch(BIGCITIES_URL, {
                headers: {
                  Accept: "application/json",
                  Authorization: `Bearer ${response.accessToken}`,
                },
              });
            })
            .then(async (res) => {
              if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
              const data = (await res.json()) as BigCity[];
              setState({ status: "success", data });
            })
            .catch((error_) => {
              setState({
                status: "error",
                error: error_ instanceof Error ? error_.message : String(error_),
              });
            });
        } else {
          setState({
            status: "error",
            error: err instanceof Error ? err.message : String(err),
          });
        }
      });
  }, [instance, accounts, inProgress]);

  return state;
}
