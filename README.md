# Web Fragments PoC - Micro-Frontend Example

This project demonstrates the use of **Web Fragments** for implementing micro-frontends. It shows how a remote application (fragment) can be seamlessly integrated into a shell application (host).

## What is Web Fragments?

Web Fragments is a radically new architecture for micro-frontends that:

- Enables **JavaScript isolation** through separate JavaScript contexts (similar to Docker containers for apps)
- Is **framework-agnostic** and works with any web stack
- Enables **incremental migration** of existing monolithic frontends
- Provides **scalability** through decentralized development and deployment of micro-frontends

Unlike other micro-frontend solutions, Web Fragments isolates individual fragments from each other while sharing the same DOM document, browser navigation, and history.

## Project Structure

```
web-fragments-poc/
├── shell/          # Host application (Shell)
│   ├── src/
│   │   ├── App.tsx           # Shell main component with <web-fragment>
│   │   ├── main.tsx          # Initializes Web Fragments client
│   │   └── vite-env.d.ts     # TypeScript definitions for <web-fragment>
│   └── vite.config.ts        # Vite configuration with gateway middleware
│
└── remote/         # Remote application (Fragment)
    ├── src/
    │   ├── RemoteFragment.tsx  # MUI-based fragment component
    │   ├── App.tsx             # Fragment app wrapper
    │   └── main.tsx           # Fragment entry point with MUI theme
    └── vite.config.ts         # Vite configuration with base path
```

## Architecture

### Shell (Host)

The shell application is the host application that embeds fragments:

- **Port**: 5173
- **Role**: Hosts the main application and integrates remote fragments
- **Gateway**: Uses `FragmentGateway` as middleware to route requests to fragments
- **Client**: Initializes `initializeWebFragments()` for client-side fragment management

### Remote (Fragment)

The remote application is a standalone fragment:

- **Port**: 5174
- **Role**: Provides an isolated fragment with its own UI
- **Base Path**: `/remote/` - All assets are served under this path
- **UI**: Uses Material-UI (MUI) for components

### Gateway

The gateway is a middleware that:

- Recognizes requests to fragment routes (`/remote/`, `/remote/:_*`)
- Routes these requests to the corresponding fragment endpoint (`http://localhost:5174`)
- Proxies fragment assets (JS, CSS, etc.) through the gateway
- Supports Server-Side Rendering (SSR) for fragments

## Prerequisites

- Node.js (version 18 or higher)
- Yarn (version 4.x recommended, used with this project)

## Installation

1. **Install dependencies** (in both directories):

```bash
# Install shell
cd shell
yarn install

# Install remote
cd ../remote
yarn install
```

## Starting the Application

The application consists of two separate dev servers that must run simultaneously:

### Terminal 1: Start Remote Fragment

```bash
cd remote
yarn dev
```

The remote server starts on **<http://localhost:5174>**

### Terminal 2: Start Shell Host

```bash
cd shell
yarn dev
```

The shell server starts on **<http://localhost:5173>**

### Open the Application

Open **<http://localhost:5173/remote/>** in your browser.

**Important**: Use the path `/remote/` with a trailing slash. The path `/remote` will be automatically redirected.

## What is Demonstrated?

### 1. Fragment Integration

The project shows how a remote fragment is seamlessly integrated into the shell:

- The `<web-fragment>` custom element is used in the shell
- The fragment runs in an isolated JavaScript context
- Fragment assets are automatically loaded through the gateway

### 2. Gateway Routing

The gateway middleware demonstrates:

- Automatic routing of fragment requests
- Proxying of fragment assets (JS, CSS, etc.)
- Support for different request types (HTML, assets, etc.)

### 3. Framework Integration

The example shows:

- Use of React in both applications
- Integration of Material-UI in the fragment
- Independent development and deployment of fragments

### 4. Isolation

Web Fragments provides:

- **JavaScript Isolation**: Each fragment runs in its own context
- **Style Isolation**: Styles are isolated through Shadow DOM
- **Memory Management**: When the fragment is removed, the context is released

## Key Concepts

### Fragment Registration

Fragments are registered in the gateway (`shell/vite.config.ts`):

```typescript
gateway.registerFragment({
  fragmentId: 'remote-example',
  piercingClassNames: [],
  endpoint: 'http://localhost:5174',
  routePatterns: ['/remote/', '/remote/:_*'],
})
```

- **fragmentId**: Unique ID of the fragment
- **endpoint**: URL of the fragment server
- **routePatterns**: URL patterns assigned to this fragment

### Fragment Element

The fragment is embedded in the shell using a custom element:

```tsx
<web-fragment fragment-id="remote-example"></web-fragment>
```

The element is automatically registered by `initializeWebFragments()`.

### Base Path Configuration

The remote fragment uses a base path (`remote/vite.config.ts`):

```typescript
export default defineConfig({
  base: '/remote/',
  // ...
})
```

This ensures that all assets are served under `/remote/`, which matches the gateway route patterns.

## Development

### Hot Module Replacement (HMR)

Both applications support HMR:

- Changes in the shell are automatically updated
- Changes in the remote fragment are automatically updated
- The gateway correctly proxies the updates

### Debugging

- **Browser DevTools**: Open DevTools to see the fragment structure
- **Shadow DOM**: Fragments are embedded in Shadow DOM
- **JavaScript Contexts**: Each fragment has its own context (`wf:remote-example`)

## Stopping the Application

Stop both dev servers with `Ctrl+C` in their respective terminals.

Alternatively, the processes can be terminated:

```bash
# Stop shell
kill $(lsof -ti tcp:5173)

# Stop remote
kill $(lsof -ti tcp:5174)
```

## Technology Stack

- **React 19**: UI framework for both applications
- **Vite 7**: Build tool and dev server
- **TypeScript**: Type safety
- **Material-UI (MUI)**: UI component library in the fragment
- **Web Fragments**: Micro-frontend framework

## Useful Links

- [Web Fragments Documentation](https://web-fragments.dev/documentation/getting-started/)
- [Web Fragments GitHub](https://github.com/web-fragments/web-fragments)
- [Material-UI Documentation](https://mui.com/)

## Next Steps

This PoC project can be extended to:

- Add more fragments
- Demonstrate fragment communication via events
- Show fragment piercing
- Configure production builds
- Document deployment strategies

## License

MIT
