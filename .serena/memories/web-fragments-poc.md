Web Fragments PoC in /Users/patrick/source/micro-frontends/wf:
- shell uses web-fragments gateway in shell/vite.config.ts with getWebMiddleware + connect adapter and skip header x-wf-skip.
- fragmentId: remote-example, endpoint: http://localhost:5174, routePatterns: /remote/ and /remote/:_*.
- remote Vite base set to /remote/ (remote/vite.config.ts) so assets resolve under /remote/.
- shell renders <web-fragment fragment-id="remote-example"> on /remote/ route (shell/src/App.tsx).
