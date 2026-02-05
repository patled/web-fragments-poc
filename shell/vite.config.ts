import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";
import { FragmentGateway, getWebMiddleware } from "web-fragments/gateway";

const assignmentsFragmentId = "project-assignments";
const showcaseFragmentId = "showcase-lab";
const angularWidgetFragmentId = "angular-widget";
const gateway = new FragmentGateway();
const webFragmentsMiddleware = getWebMiddleware(gateway, {
  mode: "development",
});
const skipHeaderName = "x-wf-skip";
const lastGatewayErrorLogByFragment = new Map<string, number>();

function toSafeHeadersInit(
  headers: Record<string, string | string[] | undefined>,
): HeadersInit {
  const entries: [string, string][] = [];
  const validHeaderName = /^[A-Za-z0-9!#$%&'*+.^_`|~-]+$/;
  for (const [key, value] of Object.entries(headers)) {
    // When Vite runs over HTTP/2 (e.g., HTTPS dev server), Node may surface
    // HTTP/2 pseudo headers like ":method" which are not valid Fetch headers.
    if (!validHeaderName.test(key)) continue;
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) entries.push([key, v]);
      continue;
    }
    entries.push([key, value]);
  }
  return entries;
}

gateway.registerFragment({
  fragmentId: assignmentsFragmentId,
  piercingClassNames: [],
  endpoint: "http://localhost:5175",
  routePatterns: [
    "/assignments/",
    "/assignments/:_*",
    "/projects/:_*/assignments/",
    "/projects/:_*/assignments/:_*",
  ],
});

gateway.registerFragment({
  fragmentId: showcaseFragmentId,
  piercingClassNames: [],
  endpoint: "http://localhost:5176",
  routePatterns: ["/showcase/", "/showcase/:_*"],
});

gateway.registerFragment({
  fragmentId: angularWidgetFragmentId,
  piercingClassNames: [],
  endpoint: "http://localhost:5177",
  routePatterns: ["/widget/", "/widget/:_*"],
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // mkcert(),
    {
      name: "web-fragments-gateway",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.headers[skipHeaderName]) {
            next();
            return;
          }

          const host = req.headers.host ?? "localhost:5173";
          const url = new URL(req.url ?? "/", `http://${host}`);

          const fragmentIdHeader = req.headers["x-web-fragment-id"];
          const requestFragmentId = Array.isArray(fragmentIdHeader)
            ? fragmentIdHeader[0]
            : fragmentIdHeader;

          // Check if it's an asset request
          const isAssetRequest =
            url.pathname.includes(".") ||
            url.pathname.startsWith("/@") ||
            url.pathname.startsWith("/node_modules") ||
            url.pathname.startsWith("/src");

          // Check if it's a fragment route
          const isProjectsAssignments =
            /^\/projects\/[^/]+\/assignments(\/|$)/.test(url.pathname);
          const isShowcaseRoute =
            url.pathname === "/showcase" ||
            url.pathname.startsWith("/showcase/");
          const isWidgetRoute =
            url.pathname === "/widget" || url.pathname.startsWith("/widget/");
          const isFragmentRoute =
            url.pathname.startsWith("/assignments/") ||
            isProjectsAssignments ||
            isShowcaseRoute ||
            isWidgetRoute;

          // Check if it's a direct browser navigation
          // The <web-fragment> element sends requests in an IFrame
          const fetchDest = req.headers["sec-fetch-dest"];
          const isIframeRequest = fetchDest === "iframe";
          const isDirectBrowserNavigation =
            !requestFragmentId && fetchDest === "document";

          // If it's a fragment route, not an asset request, no fragment ID,
          // and it's a direct browser navigation, let the shell app render
          // All other requests (from the <web-fragment> element) are forwarded
          if (
            isFragmentRoute &&
            !isAssetRequest &&
            !requestFragmentId &&
            !isIframeRequest &&
            isDirectBrowserNavigation
          ) {
            next();
            return;
          }

          const matchedFragment = gateway.matchRequestToFragment(
            `${url.pathname}${url.search}`,
            requestFragmentId,
          );

          if (!matchedFragment) {
            next();
            return;
          }

          const init: RequestInit = {
            method: req.method,
            headers: toSafeHeadersInit(req.headers),
          };

          if (req.method && req.method !== "GET" && req.method !== "HEAD") {
            init.body = req as unknown as BodyInit;
            init.duplex = "half";
          }

          // Transform /projects/ID/assignments to /assignments/ID for the assignments fragment
          let transformedPath = url.pathname;
          const projectsAssignmentsMatch = url.pathname.match(
            /^\/projects\/([^/]+)\/assignments\/?(.*)$/,
          );
          const isProjectsAssignmentsPath =
            matchedFragment.fragmentId === assignmentsFragmentId &&
            projectsAssignmentsMatch;

          if (isProjectsAssignmentsPath && projectsAssignmentsMatch) {
            transformedPath = projectsAssignmentsMatch[2]
              ? `/assignments/${projectsAssignmentsMatch[1]}/${projectsAssignmentsMatch[2]}`
              : `/assignments/${projectsAssignmentsMatch[1]}`;
          }

          // Transform /widget/* asset requests to /* for Angular Dev Server
          // Angular Dev Server serves assets from root, not from /widget/
          // This includes /widget/@vite/client, /widget/main.js, etc.
          if (
            matchedFragment.fragmentId === angularWidgetFragmentId &&
            transformedPath.startsWith("/widget")
          ) {
            transformedPath = transformedPath.replace(/^\/widget/, "");
            // Ensure path starts with / if it was /widget
            if (!transformedPath.startsWith("/")) {
              transformedPath = "/" + transformedPath;
            }
          }

          // Transform URL to fragment endpoint
          const fragmentEndpoint = matchedFragment.endpoint;
          const fragmentUrl = new URL(
            transformedPath + url.search,
            fragmentEndpoint,
          );
          // IMPORTANT:
          // The Web Fragments middleware must see the *host* URL (e.g. http://localhost:5173/widget/)
          // to initialize the "reframed" iframe wrapper correctly.
          // If we pass the fragment endpoint URL here, the iframe will load the fragment HTML directly
          // and `initializeWebFragments()` will throw "Reframed IFrame init error".
          const hostUrl = new URL(
            `${url.pathname}${url.search}`,
            `http://${host}`,
          );
          // Browsers cannot add `x-web-fragment-id` on iframe navigations or subresource loads.
          // For HTML document requests we set it server-side so the middleware can bind the request to a fragment.
          const wfHeaders = new Headers(init.headers);
          wfHeaders.set("x-web-fragment-id", matchedFragment.fragmentId);

          // Preserve the original scheme when the dev server runs on HTTPS.
          // Web Fragments uses forwarded headers for downstream requests.
          const isHttps = Boolean(
            (req.socket as { encrypted?: boolean }).encrypted,
          );
          wfHeaders.set("x-forwarded-proto", isHttps ? "https" : "http");
          const wfRequest = new Request(hostUrl, {
            ...init,
            headers: wfHeaders,
          });

          const sendResponseToNode = async (response: Response) => {
            res.statusCode = response.status;
            response.headers.forEach((value, key) => {
              res.setHeader(key, value);
            });

            if (!response.body) {
              res.end();
              return;
            }

            const body = Buffer.from(await response.arrayBuffer());
            res.end(body);
          };

          const nextResponse = async () => {
            const headers = new Headers(wfRequest.headers);
            headers.set(skipHeaderName, "1");
            headers.delete("x-web-fragment-id");

            const nextInit: RequestInit = {
              method: wfRequest.method,
              headers,
            };

            if (wfRequest.method !== "GET" && wfRequest.method !== "HEAD") {
              nextInit.body = wfRequest.body;
              nextInit.duplex = "half";
            }

            // Add timeout for fragment requests (5 seconds)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            nextInit.signal = controller.signal;

            try {
              const response = await fetch(fragmentUrl, nextInit);
              clearTimeout(timeoutId);

              // Angular's Vite-based dev server emits absolute Vite URLs like "/@vite/client" and "/@fs/...".
              // When the fragment is mounted under "/widget/", those must be prefixed so they stay within the
              // fragment route and get proxied to the Angular dev server.
              const isAngularWidget =
                matchedFragment.fragmentId === angularWidgetFragmentId;
              const contentType = response.headers.get("content-type") ?? "";
              const shouldRewrite =
                isAngularWidget &&
                (contentType.includes("text/javascript") ||
                  contentType.includes("application/javascript") ||
                  contentType.includes("text/html"));

              if (!shouldRewrite) {
                return response;
              }

              const originalText = await response.text();
              const rewrittenText = originalText
                .replaceAll('"/@vite/', '"/widget/@vite/')
                .replaceAll("'/@vite/", "'/widget/@vite/")
                .replaceAll('"/@fs/', '"/widget/@fs/')
                .replaceAll("'/@fs/", "'/widget/@fs/")
                .replaceAll('"/@id/', '"/widget/@id/')
                .replaceAll("'/@id/", "'/widget/@id/")
                // Ensure HTML-referenced root assets resolve under /widget/ even if <base> scripts are neutralized
                .replaceAll('href="styles.css"', 'href="/widget/styles.css"')
                .replaceAll("href='styles.css'", "href='/widget/styles.css'")
                .replaceAll('src="main.js"', 'src="/widget/main.js"')
                .replaceAll("src='main.js'", "src='/widget/main.js'");

              const rewrittenHeaders = new Headers(response.headers);
              rewrittenHeaders.delete("content-length");

              return new Response(rewrittenText, {
                status: response.status,
                statusText: response.statusText,
                headers: rewrittenHeaders,
              });
            } catch (error) {
              clearTimeout(timeoutId);
              // Return a 503 Service Unavailable response if fragment is not available
              return new Response(
                JSON.stringify({
                  error: "Fragment unavailable",
                  fragmentId: matchedFragment.fragmentId,
                  endpoint: fragmentEndpoint,
                  message:
                    error instanceof Error ? error.message : "Unknown error",
                }),
                {
                  status: 503,
                  statusText: "Service Unavailable",
                  headers: {
                    "Content-Type": "application/json",
                  },
                },
              );
            }
          };

          // For non-HTML requests (JS, CSS, Vite internals, etc.) we must proxy directly.
          // The "reframed" bootstrap wrapper only applies to HTML document requests.
          const acceptHeader = req.headers.accept ?? "";
          const wantsHtml = acceptHeader.includes("text/html");

          const responsePromise = wantsHtml
            ? webFragmentsMiddleware(wfRequest, nextResponse)
            : nextResponse();

          responsePromise.then(sendResponseToNode).catch((error) => {
            // Don't crash the shell; throttle logs to avoid spam when a fragment is down
            const fragmentId = matchedFragment?.fragmentId ?? "unknown";
            const now = Date.now();
            const lastLoggedAt =
              lastGatewayErrorLogByFragment.get(fragmentId) ?? 0;
            if (now - lastLoggedAt > 10_000) {
              lastGatewayErrorLogByFragment.set(fragmentId, now);
              console.warn(
                `[Gateway] Fragment "${fragmentId}" unavailable:`,
                error,
              );
            }

            // Return a 503 response to the client
            res.statusCode = 503;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                error: "Fragment unavailable",
                fragmentId: matchedFragment?.fragmentId,
                message:
                  error instanceof Error ? error.message : "Unknown error",
              }),
            );
          });
        });
      },
    },
  ],
  server: {
    port: 5173,
    strictPort: true,
  },
});
