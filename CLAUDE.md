# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

OpenCATS is a PHP-based Applicant Tracking System (ATS) undergoing progressive modernization. The app runs legacy PHP modules alongside a modern React shell. Both layers are live and production-used; do not break either.

## Commands

### PHP Backend

```bash
composer install                                          # Install PHP dependencies
./vendor/bin/phpunit src/OpenCATS/Tests/UnitTests         # Run unit tests
./vendor/bin/phpunit src/OpenCATS/Tests/IntegrationTests  # Run integration tests (needs DB)
./vendor/bin/behat -v -c ./test/behat.yml --suite=default # Run BDD tests
./vendor/bin/behat -v -c ./test/behat.yml --suite=security
```

### Modern Frontend (run from `frontend/modern-ui/`)

```bash
npm run dev             # Dev server
npm run build           # Production build
npm run build:dev       # Dev build (use before smoke tests)
npm run verify:build    # Verify build output
npm run smoke:playwright          # E2E Playwright tests
npm run smoke:playwright:gdpr-consent
npm run quality:gate    # Quality gate (run last)
```

### Standard verification sequence (from `frontend/modern-ui/`):

```bash
npm run build:dev && npm run verify:build && npm run smoke:playwright && npm run quality:gate
```

### Docker (from `docker/`)

```bash
docker-compose up -d                                    # Dev environment
docker-compose -f docker-compose-test.yml up -d         # Test environment
```

## Architecture

### Routing Model

All requests go through `index.php` as the single entry point. Routes use query strings:
`index.php?m=<module>&a=<action>&param=value`

The modern React shell intercepts routes registered in `frontend/modern-ui/src/lib/routeRegistry.ts` and renders a React page instead of the legacy PHP template. Unregistered routes fall back to legacy PHP views.

### Hybrid UI Architecture

- **Legacy UI**: PHP module handlers (`modules/<module>/<Action>.php`) render Smarty templates (`modules/<module>/*.tpl`)
- **Modern UI**: React pages in `frontend/modern-ui/src/pages/` served via `public/modern-ui/build/`
- **Bridge**: `modules/modernui/Shell.tpl` — the fallback container for routes not yet modernized
- **Contract Protocol**: PHP actions emit JSON (when `format=modern-json` is requested) with fields: `contractKey`, `contractVersion=1`, `modernPage`, data payload. React pages consume this via the API client.

### Key Directories

| Path | Purpose |
|------|---------|
| `modules/*/` | Legacy PHP route handlers and Smarty templates |
| `lib/*.php` | Shared business logic (ACL, candidates, companies, etc.) |
| `src/OpenCATS/` | PSR-4 namespaced classes (Entity, Tests, UI) |
| `frontend/modern-ui/src/pages/` | Modern React route pages |
| `frontend/modern-ui/src/components/` | Shared React UI components |
| `frontend/modern-ui/src/lib/` | Route registry, API client, contract guards, plumbing |
| `frontend/modern-ui/src/types.ts` | TypeScript type definitions |
| `config.php` | Core DB/auth config (not committed with credentials) |
| `constants.php` | Application-wide constants (module IDs, data types) |

### High-Risk Files

Changes to these files have wide blast radius — be conservative:

- `frontend/modern-ui/src/lib/routeRegistry.ts` — maps legacy `m`/`a` to React pages
- `frontend/modern-ui/src/lib/modernContract.ts` — contract shape definitions
- `frontend/modern-ui/src/lib/api.ts` — backend API client
- `frontend/modern-ui/src/lib/contractGuards.ts` — contract validation
- `frontend/modern-ui/src/lib/routeGuards.ts` — route access control
- `modules/modernui/Shell.tpl` — modern shell + noscript fallback
- `modules/*/*UI.php` files — contract emitters and permission-gated actions

## Core Rules

**Modern UI changes must remain backend-compatible** unless explicitly coordinated as a cross-layer migration.

### Do Not Break

- `m`/`a` route semantics and `routeRegistry.ts` mappings
- Contract protocol: `format=modern-json`, `modernPage`, `contractVersion=1`, exact `contractKey`
- Payload/field compatibility: existing form field names, hidden IDs/tokens, submit URL behavior
- Fallback markers and legacy escape paths in `modules/modernui/Shell.tpl`
- Test assumptions: `.gdpr-shell`, `actions.submitURL`, `actions.legacyURL`, visible "Open Legacy" actions

## Frontend Conventions

- **Page pattern**: fetch-on-mount with loading/error/data state split; `PageContainer` wrapper with top-level actions
- **Component reuse**: use existing primitives — `PageContainer`, `DataTable`, `SelectMenu`, modal primitives, state components
- **No new UI libraries** unless explicitly requested
- **Styling**: hand-authored CSS, enterprise blue/teal palette, rounded calm surfaces; do not introduce CSS frameworks
- **Every modern page** must preserve an explicit "Open Legacy UI" fallback affordance
- **Accessibility**: preserve keyboard navigation, ARIA semantics, select keyboard model, modal focus trap/escape/backdrop behavior
- **TypeScript**: strict mode is enabled; no `any` shortcuts

## Backend Conventions

- Backend permission checks are authoritative; never bypass them in the frontend
- Contract metadata (`contractKey`, `contractVersion`) must stay stable and exact
- Mutations must preserve existing submit endpoints and token wiring
- PHP modules follow the pattern: `modules/<module>/<Action>UI.php` emits the contract; `modules/<module>/<Action>.php` processes the form POST

## Change Style

- Prefer minimal, coordinated diffs over broad rewrites
- Keep naming and folder patterns consistent with existing code
- Call out assumptions explicitly when source behavior is uncertain
- After any frontend change, run the verification sequence above and report which checks passed
