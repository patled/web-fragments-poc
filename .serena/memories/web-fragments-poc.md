Web Fragments PoC in /Users/patrick/source/micro-frontends/wf:
- shell uses web-fragments gateway in shell/vite.config.ts with getWebMiddleware + connect adapter and skip header x-wf-skip.
- fragmentId: remote-example, endpoint: http://localhost:5174, routePatterns: /remote/ and /remote/:_*.
- remote Vite base set to /remote/ (remote/vite.config.ts) so assets resolve under /remote/.
- shell renders <web-fragment fragment-id="remote-example"> on /remote/ route (shell/src/App.tsx).

- shell also registers second fragmentId: second-example, endpoint: http://localhost:5174, routePatterns: /second/ and /second/:_*; shell rewrites /second/ asset requests to /remote/ and adds query param _fragment=second for HTML requests (shell/vite.config.ts).
- remote keeps Vite base /remote/ but serves SPA HTML for /second/ in dev via a Vite dev-server middleware plugin (remote/vite.config.ts), so http://localhost:5174/second/ renders SecondFragment directly.
