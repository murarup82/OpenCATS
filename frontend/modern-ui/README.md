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
  - `public/modern-ui/build/app.bundle.js`
- Build manifest:
  - `public/modern-ui/build/asset-manifest.json`
  - entry key: `src/mount.tsx`

## Commands

```bash
cd frontend/modern-ui
npm install
npm run clean:build
npm run build
npm run verify:build
```

### Development

```bash
cd frontend/modern-ui
npm install
npm run dev
```

For local dev-server preview inside PHP shell:
- set `UI_SWITCH_MODERN_DEV_SERVER_URL` in `config.ui.php` to your Vite URL (example `http://localhost:5173`)
- keep route-level switch narrow (`dashboard.my` only)

## Routing Scope

The first migrated route is:
- `m=dashboard&a=my` (read-only modern view)

Data is fetched from same-origin backend:
- `index.php?m=dashboard&a=my&format=modern-json&modernPage=dashboard-my`

Contract checks:
- `meta.contractVersion === 1`
- `meta.contractKey === "dashboard.my.readonly.v1"`

## Rollback

- Global rollback: set `UI_SWITCH_ENABLED=false`.
- Session rollback: add `?ui=legacy` to URL.
- Route rollback: remove `dashboard => ['my']` from `UI_SWITCH_ROUTE_MAP`.

## Current State

- Source of truth is `frontend/modern-ui/src`.
- Generated artifacts are in `public/modern-ui/build`.
- A checked-in runtime bundle remains temporarily for production safety bootstrap while CI build publish is being finalized.
