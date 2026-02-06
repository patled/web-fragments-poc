# Widget Fragment (Angular) — Web Fragments PoC

This package contains a small **Angular** app that is used as a **fragment** in the Web Fragments PoC. The shell embeds it on the home page via `<web-fragment src="/widget/">`.

## Prerequisites

- Node.js 18+
- Yarn via Corepack (recommended):

```bash
corepack enable
```

## Run (standalone)

```bash
cd widget-fragment
yarn install
yarn dev
```

The Angular dev server runs on `https://localhost:5177/` (configured in `angular.json`).

### HTTPS (default)

The widget runs over HTTPS by default using mkcert.

If you haven't generated a local certificate yet, install mkcert and generate one:

```bash
brew install mkcert
cd widget-fragment
yarn cert
```

Then start the HTTPS dev server:

```bash
cd widget-fragment
yarn dev
```

This serves the widget at `https://localhost:5177/`.

### HTTP (optional)

If you explicitly want HTTP:

```bash
cd widget-fragment
yarn dev:http
```

## Run (embedded in the shell)

Start the shell and the widget fragment (separate terminals):

```bash
cd shell && yarn install && yarn dev
cd ../widget-fragment && yarn install && yarn dev
```

Then open `https://localhost:5173/`. The shell proxies `/widget/*` requests to the Angular dev server.

If you run the widget over HTTPS, start the shell with the widget endpoint override:

```bash
WF_WIDGET_ENDPOINT=https://localhost:5177 yarn --cwd shell dev
```

## Communication (demo)

The widget uses the `BroadcastChannel` API (channel: `angular-widget-channel`) to send:

- `angular-widget-ready`
- `angular-widget-update` (includes `clickCount`)

The shell listens to these messages and shows a small status panel next to the embedded fragment.

## Scripts

- `yarn dev`: start Angular dev server over HTTPS (requires `yarn cert`)
- `yarn dev:http`: start Angular dev server over HTTP
- `yarn cert`: generate a local mkcert certificate into `.cert/`
- `yarn build`: build (`ng build`)
- `yarn test`: unit tests (`ng test`)

## Notes

- The fragment is proxied under `/widget/` by the shell gateway. The Angular dev server itself serves assets from `/`, so the gateway rewrites some dev-server URLs in development to keep them within the `/widget/` route.

## Useful links

- Angular CLI: `https://angular.dev/tools/cli`
