import type { RedirectRequest } from "@azure/msal-browser";
import { loginScopes } from "./authConfig";

export const loginRequest: RedirectRequest = {
  scopes: loginScopes,
};
