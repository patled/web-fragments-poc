function getEnv(name: string, defaultValue: string): string {
  const value = import.meta.env[name];
  return value && typeof value === "string" ? value : defaultValue;
}

/** Basis-URL der Business-API (z. B. https://localhost:7163) */
export const apiBaseUrl = getEnv("VITE_API_BASE_URL", "https://localhost:7163");
