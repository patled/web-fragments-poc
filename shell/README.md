# Shell (Host) — Web Fragments PoC

This package is the **host (shell)** application. It renders the main UI and embeds micro-frontends via **Web Fragments** using the `<web-fragment>` custom element and a development gateway/proxy.

## Prerequisites

- Node.js 18+
- Yarn via Corepack (recommended for this repo):

```bash
corepack enable
```

## Quick start

Install dependencies and run the shell:

```bash
cd shell
yarn install
yarn dev
```

Open `https://localhost:5173`.

To see the embedded fragments, start them as well (in separate terminals):

```bash
cd ../assignments-fragment && yarn install && yarn dev
cd ../showcase-fragment && yarn install && yarn dev
cd ../widget-fragment && yarn install && yarn dev
```

To run the Angular widget fragment over HTTPS and have the shell proxy to it:

```bash
cd ../widget-fragment && yarn install && yarn cert && yarn dev
yarn --cwd shell dev
```

If you run the widget over HTTP, set:

```bash
WF_WIDGET_ENDPOINT=http://localhost:5177 yarn --cwd shell dev
```

## Local ports

- Shell: `5173`
- Assignments fragment: `5175` (mounted under `/assignments/`, proxied by the shell gateway)
- Showcase fragment: `5176` (mounted under `/showcase/`, proxied by the shell gateway)
- Angular widget fragment: `5177` (served from `/` by Angular dev server, proxied by the shell gateway under `/widget/`)

## Scripts

- `yarn dev`: start Vite dev server
- `yarn build`: typecheck + production build
- `yarn preview`: preview the production build
- `yarn lint`: run ESLint

## How fragment routing works (dev)

The shell’s `vite.config.ts` registers fragments and proxies fragment requests to the fragment dev servers.

- Requests to fragment routes like `/assignments/*`, `/showcase/*`, and `/widget/*` are matched and forwarded to the respective fragment endpoint.
- For HTML document requests initiated by `<web-fragment>` (iframe navigations), the Web Fragments middleware wraps the response so the fragment runs in an isolated context.
- Direct browser navigations to fragment routes are **not** proxied as fragments; they remain shell navigations (so routing stays consistent).

## Troubleshooting

- **“Fragment not available” overlay**: start the corresponding fragment dev server (see commands above).
- **Port already in use**: stop the process using that port or change the port in the fragment’s config.
- **Yarn PnP issues in IDE**: this repo uses Yarn Berry (PnP). Use the Yarn SDKs in `.yarn/sdks` if your editor needs it.
- **HTTPS fragments fail with certificate errors**: the shell gateway fetches fragments from Node.js. The shell `yarn dev` script enables `--use-system-ca` so Node trusts mkcert certificates.
