

## MSAL + Web Fragments: timed_out in embedded context
Observed: MSAL `acquireTokenSilent` can throw `BrowserAuthError: timed_out` when used in Web Fragments setups. Stack shows Web Fragments patching DOM insertion (`appendChild` etc.) in `web-fragments.js` and MSAL hidden-iframe creation going through these patched APIs, causing `monitor_window_timeout` even though the silent redirect returns.

Mitigation implemented:
- In `shell/src/main.tsx`, capture native DOM APIs before calling `initializeWebFragments()` and store them on `globalThis.__wfNativeDom`.
- In `shell/src/auth/fragmentTokenBroker.tsx`, wrap MSAL silent calls (`ssoSilent`, `acquireTokenSilent`) with `withNativeDom()` that temporarily restores native `Node.prototype.appendChild/insertBefore/removeChild` and `Document.prototype.createElement/createElementNS`.
- Fragment requests tokens from host via BroadcastChannel (`showcase-fragment-channel`) only as fallback for `timed_out` in embedded contexts.
