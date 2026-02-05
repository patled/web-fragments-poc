import type { Configuration } from "@azure/msal-browser";

/**
 * MSAL-Konfiguration für Azure B2C.
 * Alle Werte werden aus Umgebungsvariablen (.env) geladen.
 *
 * @see https://dev.azure.com/baugruppe/Brz365/_wiki/wikis/Brz365.wiki/13153/Authentication
 */
function requireEnv(name: string): string {
  const value = import.meta.env[name];
  if (!value || typeof value !== "string") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getEnv(name: string, defaultValue: string): string {
  const value = import.meta.env[name];
  return (value && typeof value === "string" ? value : defaultValue) as string;
}

const VALID_CACHE_LOCATIONS = [
  "localStorage",
  "sessionStorage",
  "memoryStorage",
] as const;

function getValidCacheLocation(
  value: string,
): (typeof VALID_CACHE_LOCATIONS)[number] {
  return VALID_CACHE_LOCATIONS.includes(
    value as (typeof VALID_CACHE_LOCATIONS)[number],
  )
    ? (value as (typeof VALID_CACHE_LOCATIONS)[number])
    : "localStorage";
}

export const msalConfig: Configuration = {
  auth: {
    clientId: requireEnv("VITE_APP_CLIENT_ID"),
    authority: requireEnv("VITE_AUTHORITY"),
    knownAuthorities: getEnv("VITE_KNOWN_AUTHORITIES", "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    redirectUri: requireEnv("VITE_REDIRECT_URI"),
    postLogoutRedirectUri:
      getEnv("VITE_POST_LOGOUT_REDIRECT_URI", "") ||
      requireEnv("VITE_REDIRECT_URI"),
  },
  cache: {
    cacheLocation: getValidCacheLocation(
      getEnv("VITE_CACHE_LOCATION", "localStorage"),
    ),
  },
};

/** Authority für Passwort-Reset (optional, für "Passwort vergessen"-Link) */
export const passwordResetAuthority = getEnv(
  "VITE_PASSWORD_RESET_AUTHORITY",
  "",
);

/** Scopes für Login (openid, offline_access für Refresh-Token) */
export const loginScopes = getEnv("VITE_B2C_SCOPES", "openid offline_access")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
