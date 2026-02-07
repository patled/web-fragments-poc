import type { Configuration } from '@azure/msal-browser';
import { env } from '../../env';

function requireEnv(name: keyof typeof env): string {
  const value = env[name];
  if (!value || typeof value !== 'string') {
    throw new Error(`Missing required environment variable: ${String(name)}`);
  }
  return value;
}

function getEnv(name: keyof typeof env, defaultValue: string): string {
  const value = env[name];
  return (value && typeof value === 'string' ? value : defaultValue) as string;
}

function resolveBrowserUrl(value: string): string {
  if (!value) return value;
  if (value.startsWith('/')) {
    const origin = globalThis.location?.origin;
    return origin ? new URL(value, origin).toString() : value;
  }
  return value;
}

const VALID_CACHE_LOCATIONS = ['localStorage', 'sessionStorage', 'memoryStorage'] as const;

function getValidCacheLocation(value: string): (typeof VALID_CACHE_LOCATIONS)[number] {
  return VALID_CACHE_LOCATIONS.includes(value as (typeof VALID_CACHE_LOCATIONS)[number])
    ? (value as (typeof VALID_CACHE_LOCATIONS)[number])
    : 'localStorage';
}

export const msalConfig: Configuration = {
  auth: {
    clientId: requireEnv('VITE_APP_CLIENT_ID'),
    authority: requireEnv('VITE_AUTHORITY'),
    knownAuthorities: getEnv('VITE_KNOWN_AUTHORITIES', '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    redirectUri: resolveBrowserUrl(requireEnv('VITE_REDIRECT_URI')),
    postLogoutRedirectUri:
      resolveBrowserUrl(getEnv('VITE_POST_LOGOUT_REDIRECT_URI', '')) ||
      resolveBrowserUrl(requireEnv('VITE_REDIRECT_URI')),
  },
  cache: {
    cacheLocation: getValidCacheLocation(getEnv('VITE_CACHE_LOCATION', 'localStorage')),
  },
};

export const loginScopes = getEnv('VITE_B2C_SCOPES', 'openid offline_access')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
