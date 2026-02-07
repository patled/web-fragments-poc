import { Injectable, signal } from '@angular/core';
import { loginScopes } from './authConfig';
import { getMsalInstance } from './msalInstance';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly isAuthenticated = signal(false);
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    const msal = await getMsalInstance();
    const redirectResult = await msal.handleRedirectPromise();

    if (redirectResult?.account) {
      msal.setActiveAccount(redirectResult.account);
    } else {
      const accounts = msal.getAllAccounts();
      if (accounts.length > 0) {
        msal.setActiveAccount(accounts[0]);
      }
    }

    this.isAuthenticated.set(Boolean(msal.getActiveAccount()));
  }

  async login(): Promise<void> {
    const msal = await getMsalInstance();
    await msal.loginRedirect({ scopes: loginScopes });
  }

  async logout(): Promise<void> {
    const msal = await getMsalInstance();
    await msal.logoutRedirect();
  }
}
