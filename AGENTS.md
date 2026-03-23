# OpenCATS Codex Guide

## Repository Purpose
OpenCATS is an ATS platform. This repo runs legacy PHP modules and a modern React shell for recruiter workflows (candidates, job orders, companies, contacts, activity/calendar, reports, GDPR consent, login/auth).

## Primary Stack
- Backend: PHP module/actions in `modules/*`, domain/services in `lib/*.php`
- Frontend: React 18 + Vite + TypeScript (`strict: true`) in `frontend/modern-ui`
- Styling: hand-authored CSS (`styles.css`, `dashboard-avel.css`, `ui-core/*.css`)
- Tests: Playwright + Node smoke scripts (modern UI), Behat/PHPUnit (backend)

## Key Directories
- `modules/*`: route handlers/templates by `m` / `a`
- `lib/*.php`: business logic and infrastructure
- `frontend/modern-ui/src/pages`: route pages
- `frontend/modern-ui/src/components`: shared UI
- `frontend/modern-ui/src/lib`: route, API, contract, guard plumbing
- `modules/modernui/Shell.tpl`: modern shell + noscript fallback

## Core Operating Rule
Modern UI changes must remain backend-compatible unless explicitly coordinated as a cross-layer migration.

## Do-Not-Break List
- `m`/`a` route semantics and `routeRegistry.ts` mappings
- guarded route params for show/edit/detail routes
- contract protocol: `format=modern-json`, `modernPage`, `contractVersion=1`, exact `contractKey`
- payload/field compatibility: existing form names, hidden IDs/tokens, submit URL behavior
- fallback markers and legacy escape paths in `modules/modernui/Shell.tpl`
- test assumptions: `.gdpr-shell`, `actions.submitURL`, `actions.legacyURL`, visible "Open Legacy" actions

## High-Risk Files
- `frontend/modern-ui/src/lib/routeRegistry.ts`
- `frontend/modern-ui/src/lib/modernContract.ts`
- `frontend/modern-ui/src/lib/api.ts`
- `frontend/modern-ui/src/lib/contractGuards.ts`
- `frontend/modern-ui/src/lib/routeGuards.ts`
- `modules/modernui/Shell.tpl`
- module handlers such as `modules/*/*UI.php` (contract emitters and permission-gated actions)

## UI Expectations
- Keep OpenCATS enterprise blue/teal family and rounded, calm surfaces
- Prefer cleaner hierarchy over extra framing/noise
- Reuse existing primitives (`PageContainer`, `DataTable`, `SelectMenu`, modal primitives, state components)
- Keep explicit "Open Legacy UI" fallback affordance on modern pages

## Page Conventions
- Fetch-on-mount with loading/error/data state split
- `PageContainer` wrapper and clear top-level actions
- Route/page logic in `src/pages`, reusable pieces in `src/components`, plumbing in `src/lib`
- Do not introduce new UI libraries unless explicitly requested

## Validation and Contract Expectations
- Contract metadata must stay stable and exact
- Backend permission checks remain authoritative; do not bypass in frontend
- Mutations must preserve existing submit endpoints and token wiring

## Testing and Verification Defaults
From `frontend/modern-ui`:
1. `npm run build:dev`
2. `npm run verify:build`
3. `npm run smoke:playwright`
4. `npm run quality:gate`

## Accessibility Expectations
- Preserve keyboard navigation and ARIA semantics
- Preserve select keyboard model and modal focus trap/escape/backdrop behavior
- Preserve shortcut and live-region behavior already in place

## Change Style
- Prefer minimal, coordinated diffs over broad rewrites
- Keep naming and folder patterns consistent with existing code
- Call out assumptions explicitly when source behavior is uncertain

## Done-When Checklist
- Route, contract, and payload compatibility preserved
- Legacy fallback paths still present and visible where expected
- Relevant build/smoke/quality checks run (or explicitly reported as not run)
- No unintended selector/contract regressions for existing tests
- Change summary includes touched files, risks, and verification status
