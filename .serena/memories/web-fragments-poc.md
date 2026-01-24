Web Fragments PoC in /Users/patrick/source/micro-frontends/web-fragments-poc:
- shell uses web-fragments gateway in shell/vite.config.ts with getWebMiddleware + connect adapter and skip header x-wf-skip.
- fragmentId: first-example, endpoint: http://localhost:5174, routePatterns: /first/ and /first/:_*.
- fragments Vite base set to /first/ (fragments/vite.config.ts) so assets resolve under /first/.
- shell renders <web-fragment fragment-id="first-example"> on /first/ route (shell/src/App.tsx).

- shell also registers second fragmentId: second-example, endpoint: http://localhost:5174, routePatterns: /second/ and /second/:_*; shell rewrites /second/ asset requests to /first/ and adds query param _fragment=second for HTML requests (shell/vite.config.ts).
- fragments keeps Vite base /first/ but serves SPA HTML for /second/ in dev via a Vite dev-server middleware plugin (fragments/vite.config.ts), so http://localhost:5174/second/ renders SecondFragment directly.
- shell registers assignments fragmentId: project-assignments, endpoint: http://localhost:5175, routePatterns: /assignments/, /assignments/:_*, /projects/:_*/assignments/, /projects/:_*/assignments/:_*; path /projects/ID/assignments is rewritten to /assignments/ID when forwarding to the fragment; assignments-fragment uses Vite base /assignments/ and its own dev server middleware to serve SPA HTML for /assignments/*.
- shell routes /projects/:projectId/assignments and /projects/:projectId/assignments/* render ProjectsPage; assignments panel on the right is shown when URL matches /projects/ID/assignments or /assignments/ID; "Assignments" button and "Close" set URL to /projects/ID/assignments resp. /projects/ID.
