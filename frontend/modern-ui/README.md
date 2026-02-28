# OpenCATS Modern UI Workspace

This workspace is configured for:
- React
- Vite
- TypeScript
- Tailwind CSS

## Build Integration

- Bundle contract:
  - `window.OpenCATSModernApp.mount(rootElement, bootstrapPayload)`
- Output path:
  - `public/modern-ui/app.bundle.js`

## Commands

```bash
cd frontend/modern-ui
npm install
npm run build
```

## Routing Scope

The first migrated route is:
- `m=dashboard&a=my` (read-only modern view)

Data is fetched from same-origin backend:
- `index.php?m=dashboard&a=my&format=modern-json`

## Rollback

- Global rollback: set `UI_SWITCH_ENABLED=false`.
- Session rollback: add `?ui=legacy` to URL.
- Route rollback: remove `dashboard => ['my']` from `UI_SWITCH_ROUTE_MAP`.

## Current State

- A checked-in runtime bundle exists at `public/modern-ui/app.bundle.js` for immediate use.
- React/Vite source is the long-term source-of-truth and can replace the checked-in bundle after build pipeline adoption.
