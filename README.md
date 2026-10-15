# Mock Exchange

Mock Exchange is a full-stack market explorer that demonstrates an exchange-style interface using realistic, dynamically generated data. It runs entirely locally, requires no third-party account or API key, and is designed to showcase event discovery, market pricing, order books, and short-term price movement.

## Features

- Demo authentication with an HTTP-only session cookie
- Upcoming events grouped by sport and category
- Event detail pages with multiple markets and selections
- Dynamic bid, ask, and last-traded prices refreshed every five seconds
- Expandable order books with price and available-volume levels
- SVG price-trend charts built from observations collected during the session
- Decimal, percentage, and American price formats
- Buy, sell, or combined price-button views
- Dark and light themes
- Responsive layouts for desktop and mobile
- URL-based event and category navigation

## Technology

| Technology | Purpose |
| --- | --- |
| React 18 | Component-driven user interface |
| TypeScript | Typed data contracts across the client and server |
| Vite | Development server and production bundling |
| Express | Local backend-for-frontend and demo API |
| TanStack Query | Server-state caching, loading states, and price polling |
| Zod | Runtime validation of API requests and responses |
| Sass | Responsive styling, themes, and shared design tokens |
| Vitest | Deterministic unit tests for pricing and quote mapping |

## Architecture

The React client communicates only with local `/api/*` endpoints. The Express server owns session state and supplies typed event, market, and quote responses. Keeping this boundary in place makes the demo behave like a production client/server application while remaining self-contained.

Quote values change on a five-second cycle. The same polling flow updates price buttons, order-book levels, last-traded values, and the locally observed trend history. The generator is deterministic enough to keep the interface coherent while still showing visible market movement.

The application intentionally uses a compact architecture:

- TanStack Query handles remote state without a global Redux store.
- Lightweight `history.pushState` navigation supports the homepage and event routes without a router dependency.
- The trend graph is rendered with custom SVG rather than a charting library.
- Mock data is served through API contracts instead of being imported directly into components.

## Running locally

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

- Application: `http://localhost:5178`
- Demo API: `http://localhost:8798`

Sign in with any valid-looking email address and any non-empty password, for example:

```text
demo@example.com
demo
```

## Quality checks

```bash
npm test
npm run lint
npm run build
```

The test suite covers odds and stake conversion plus order-book quote mapping. Tests do not require network access.

## Project structure

```text
src/
  components/   Interface components for events, markets, prices, and settings
  context/      Price display and exchange quote providers
  hooks/        Authentication, navigation, polling, theme, and price history
  lib/          API client, schemas, formatting, and pricing utilities
  styles/       Global Sass tokens and base styles
server/
  index.ts      Express API and session routes
  mockData.ts   Dynamic events, markets, order books, and quote generation
```
