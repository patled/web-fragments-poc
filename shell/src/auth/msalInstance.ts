import type { IPublicClientApplication } from "@azure/msal-browser";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./authConfig";

let msalInstance: IPublicClientApplication | undefined;

/**
 * Erstellt und initialisiert die MSAL-Instanz asynchron.
 * Muss vor der ersten Verwendung aufgerufen werden.
 */
export async function getMsalInstance(): Promise<IPublicClientApplication> {
  if (msalInstance) {
    return msalInstance;
  }
  const instance = new PublicClientApplication(msalConfig);
  await instance.initialize();
  msalInstance = instance;
  return instance;
}
