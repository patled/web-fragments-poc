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

The Angular dev server runs on `http://localhost:5177/` (configured in `angular.json`).

## Run (embedded in the shell)

Start the shell and the widget fragment (separate terminals):

```bash
cd shell && yarn install && yarn dev
cd ../widget-fragment && yarn install && yarn dev
```

Then open `http://localhost:5173/`. The shell proxies `/widget/*` requests to the Angular dev server.

## Communication (demo)

The widget uses the `BroadcastChannel` API (channel: `angular-widget-channel`) to send:

- `angular-widget-ready`
- `angular-widget-update` (includes `clickCount`)

The shell listens to these messages and shows a small status panel next to the embedded fragment.

## Scripts

- `yarn dev`: start Angular dev server (`ng serve`)
- `yarn build`: build (`ng build`)
- `yarn test`: unit tests (`ng test`)

## Notes

- The fragment is proxied under `/widget/` by the shell gateway. The Angular dev server itself serves assets from `/`, so the gateway rewrites some dev-server URLs in development to keep them within the `/widget/` route.

## Useful links

- Angular CLI: `https://angular.dev/tools/cli`
