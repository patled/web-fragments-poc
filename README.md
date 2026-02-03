# Web Fragments PoC - Micro-Frontend Example

This project demonstrates the use of **Web Fragments** for implementing micro-frontends. It shows how fragment applications can be seamlessly integrated into a shell application (host).

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
├── shell/                    # Host application (Shell, React + Vite)
│   ├── src/
│   │   ├── App.tsx           # Shell routes (React Router)
│   │   ├── main.tsx          # Initializes Web Fragments client
│   │   └── components/       # Shell pages + embedded fragments
│   └── vite.config.ts        # Vite dev gateway (fragment proxy + SSR wrapper)
│
├── assignments-fragment/     # Assignments fragment (React + MUI, Vite)
│   ├── src/
│   │   ├── AssignmentsFragment.tsx
│   │   └── mockData.ts       # Used for standalone dev mode
│   └── vite.config.ts        # `base: /assignments/`, port 5175
│
├── showcase-fragment/        # Showcase fragment (React, Vite)
│   ├── src/
│   │   └── ShowcaseFragment.tsx
│   └── vite.config.ts        # `base: /showcase/`, port 5176
│
└── widget-fragment/          # Angular widget fragment (Angular CLI)
    ├── src/app/app.ts        # BroadcastChannel demo + UI
    └── angular.json          # Dev server port 5177
```

## Architecture

### Shell (Host)

The shell application is the host application that embeds fragments:

- **Port**: 5173
- **Role**: Hosts the main application and integrates fragments
- **Gateway**: Uses `FragmentGateway` as middleware to route requests to fragments
- **Client**: Initializes `initializeWebFragments()` for client-side fragment management
- **Routing**: Uses React Router for navigation between pages
- **Pages**: Home, Projects, Showcase (with embedded fragments)

### Assignments Fragment

The assignments fragment is a separate fragment application:

- **Port**: 5175
- **Role**: Provides the project-assignments fragment for managing project assignments
- **Base Path**: `/assignments/` - All assets are served under this path
- **UI**: Uses Material-UI (MUI) for components
- **Integration**: Embedded in ProjectsPage for project-specific assignments
- **Standalone Mode**: Can run independently for development without the shell

#### Standalone Development Mode

The assignments fragment supports standalone development mode, allowing you to develop and test it independently without running the shell application.

**Automatic Detection:**
- If no data is received from the shell within 1 second, the fragment automatically switches to standalone mode
- Mock data is loaded automatically for development

**Manual Activation:**
You can force standalone mode by adding `?standalone=true` to the URL:
```
http://localhost:5175/assignments/1?standalone=true
```

**Mock Data:**
The fragment includes mock projects and staff members for standalone development:
- 3 example projects (Website Redesign, Mobile App Entwicklung, Datenbank Migration)
- 6 staff members (Lea Nguyen, Markus Klein, Maya Fischer, Julian Weber, Sofia Hartmann, Tobias Richter)

**Usage:**
1. Start only the assignments fragment: `cd assignments-fragment && yarn dev`
2. Open `http://localhost:5175/assignments/1` (or any project ID)
3. The fragment will automatically detect standalone mode and load mock data
4. A banner indicates when standalone mode is active

### Showcase Fragment

The showcase fragment is a lightweight playground to explore Web Fragments:

- **Port**: 5176
- **Role**: Top-level demo fragment shown on the shell home page and `/showcase`
- **Base Path**: `/showcase/` - All assets are served under this path
- **UI**: Pure React (no additional UI libraries)
- **Integration**: Embedded on the home page and accessible as a full page route

### Angular Widget Fragment

The widget fragment is a small Angular app embedded on the shell home page:

- **Port**: 5177
- **Role**: Demonstrates a non-React fragment (Angular) embedded via Web Fragments
- **Gateway Path**: `/widget/` - Proxied by the shell gateway
- **Dev server behavior**: The Angular dev server serves assets from `/`, so the shell gateway rewrites some dev-server URLs in development to keep them within the `/widget/` route
- **Communication**: Uses `BroadcastChannel` (`angular-widget-channel`) to send `clickCount` updates to the shell

### Gateway

The gateway is a middleware that:

- Recognizes requests to fragment routes (`/assignments/`, `/projects/:_*/assignments/`, `/showcase/`, `/widget/`)
- Routes these requests to the fragment endpoints (`http://localhost:5175`, `http://localhost:5176`, `http://localhost:5177`)
- Proxies fragment assets (JS, CSS, etc.) through the gateway
- Supports Server-Side Rendering (SSR) for fragments

## Prerequisites

- Node.js (version 18 or higher)
- Yarn (Berry / v4.x recommended, used with this project). If you use Corepack:

```bash
corepack enable
```

## Installation

1. **Install dependencies** (in all directories):

```bash
# Install shell
cd shell
yarn install

# Install assignments-fragment
cd ../assignments-fragment
yarn install

# Install showcase-fragment
cd ../showcase-fragment
yarn install

# Install widget-fragment (Angular)
cd ../widget-fragment
yarn install
```

## Starting the Application

The application consists of four dev servers that should run simultaneously:

### Terminal 1: Start Assignments Fragment Server

```bash
cd assignments-fragment
yarn dev
```

The assignments fragment server starts on **<http://localhost:5175>**

### Terminal 2: Start Shell Host

```bash
cd shell
yarn dev
```

The shell server starts on **<http://localhost:5173>**

### Terminal 3: Start Showcase Fragment Server

```bash
cd showcase-fragment
yarn dev
```

The showcase fragment server starts on **<http://localhost:5176>**

### Terminal 4: Start Angular Widget Fragment Server

```bash
cd widget-fragment
yarn dev
```

The Angular widget fragment server starts on **<http://localhost:5177>**

### Open the Application

Open **<http://localhost:5173>** in your browser.

**Available Routes:**
- `/` - Home page
- `/projects` - Projects management page
- `/projects/:projectId` - Project details with assignments
- `/assignments/:projectId` - Assignments fragment for a specific project
- `/showcase` - Showcase fragment full-page view

**Note:** The Angular widget is embedded on `/`. The fragment route `/widget/` is used by `<web-fragment>` internally (it is not a dedicated shell page route).

## What is Demonstrated?

### 1. Fragment Integration

The project shows how multiple fragments are seamlessly integrated into the shell:

- The `<web-fragment>` custom element is used in the shell
- Fragments run in isolated JavaScript contexts
- Fragment assets are automatically loaded through the gateway
- One fragment: `project-assignments` (embedded in ProjectsPage)
- One fragment: `showcase-lab` (embedded on HomePage and accessible at `/showcase`)
- One fragment: `angular-widget` (embedded on HomePage via `/widget/`)

### 2. Gateway Routing

The gateway middleware demonstrates:

- Automatic routing of fragment requests
- Proxying of fragment assets (JS, CSS, etc.)
- Support for different request types (HTML, assets, etc.)
- Fragment requests proxied to the assignments fragment endpoint

### 3. Framework Integration

The example shows:

- Use of React in the shell + Vite-based fragments
- Use of Angular in the widget fragment
- React Router for navigation in the shell
- Integration of Material-UI in fragments
- Independent development and deployment of fragments

### 4. Fragment Communication

The project demonstrates:

- Communication between shell and fragments via events
- BroadcastChannel API for cross-fragment communication

### 5. Real-World Use Case

The ProjectsPage demonstrates:

- Project management with local storage
- Drag-and-drop staff assignments
- Integration of assignments fragment within a shell page
- Multi-fragment coordination

### 6. Isolation

Web Fragments provides:

- **JavaScript Isolation**: Each fragment runs in its own context
- **Style Isolation**: Styles are isolated through Shadow DOM
- **Memory Management**: When the fragment is removed, the context is released

## Key Concepts

### Fragment Registration

Fragments are registered in the gateway (`shell/vite.config.ts`):

```typescript
gateway.registerFragment({
  fragmentId: 'project-assignments',
  piercingClassNames: [],
  endpoint: 'http://localhost:5175',
  routePatterns: [
    '/assignments/',
    '/assignments/:_*',
    '/projects/:_*/assignments/',
    '/projects/:_*/assignments/:_*',
  ],
})

gateway.registerFragment({
  fragmentId: 'showcase-lab',
  piercingClassNames: [],
  endpoint: 'http://localhost:5176',
  routePatterns: ['/showcase/', '/showcase/:_*'],
})

gateway.registerFragment({
  fragmentId: 'angular-widget',
  piercingClassNames: [],
  endpoint: 'http://localhost:5177',
  routePatterns: ['/widget/', '/widget/:_*'],
})
```

- **fragmentId**: Unique ID of the fragment
- **endpoint**: URL of the fragment server
- **routePatterns**: URL patterns assigned to this fragment

### Fragment Element

The fragment is embedded in the shell using a custom element (e.g. in ProjectsPage):

```tsx
<web-fragment fragment-id="project-assignments"></web-fragment>
```

The element is automatically registered by `initializeWebFragments()`.

### Base Path Configuration

Each fragment application uses a base path (or a gateway mount path) so asset URLs work correctly behind the shell gateway.

**Assignments fragment** (`assignments-fragment/vite.config.ts`):
```typescript
export default defineConfig({
  base: '/assignments/',
  // ...
})
```

**Showcase fragment** (`showcase-fragment/vite.config.ts`):
```typescript
export default defineConfig({
  base: '/showcase/',
  // ...
})
```

**Widget fragment (Angular)**:

- The Angular dev server serves assets from `/`, but the shell mounts it under `/widget/` via the gateway.
- In development, the shell gateway rewrites some dev-server URLs so everything stays within `/widget/`.

## Development

### Hot Module Replacement (HMR)

All apps support HMR:

- Changes in the shell are automatically updated
- Changes in the assignments fragment are automatically updated
- Changes in the showcase fragment are automatically updated
- Changes in the Angular widget are automatically updated
- The gateway correctly proxies the updates

### Debugging

- **Browser DevTools**: Open DevTools to see the fragment structure
- **Shadow DOM**: Fragments are embedded in Shadow DOM
- **JavaScript Contexts**: Each fragment has its own context (e.g. `wf:project-assignments`)

## Stopping the Application

Stop all dev servers with `Ctrl+C` in their respective terminals.

Alternatively, the processes can be terminated:

```bash
# Stop shell
kill $(lsof -ti tcp:5173)

# Stop assignments-fragment
kill $(lsof -ti tcp:5175)

# Stop showcase-fragment
kill $(lsof -ti tcp:5176)

# Stop widget-fragment (Angular)
kill $(lsof -ti tcp:5177)
```

## Technology Stack

- **React 19**: UI framework for the shell and Vite-based fragments
- **React Router 7**: Client-side routing in shell
- **Vite 7**: Build tool and dev server
- **TypeScript**: Type safety
- **Material-UI (MUI)**: UI component library in fragments
- **Angular 21**: Example of a non-React fragment
- **Web Fragments**: Micro-frontend framework
- **BroadcastChannel API**: Cross-fragment communication

## Useful Links

- [Web Fragments Documentation](https://web-fragments.dev/documentation/getting-started/)
- [Web Fragments GitHub](https://github.com/web-fragments/web-fragments)
- [Material-UI Documentation](https://mui.com/)

## Next Steps

This PoC project can be extended to:

- Add more fragments
- Enhance fragment communication patterns
- Show fragment piercing
- Configure production builds
- Document deployment strategies
- Add authentication and authorization
- Implement state management across fragments

## License

MIT
