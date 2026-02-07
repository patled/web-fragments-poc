import type { IPublicClientApplication } from '@azure/msal-browser';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './authConfig';

let instance: IPublicClientApplication | undefined;

export async function getMsalInstance(): Promise<IPublicClientApplication> {
  if (instance) return instance;
  const next = new PublicClientApplication(msalConfig);
  await next.initialize();
  instance = next;
  return next;
}
