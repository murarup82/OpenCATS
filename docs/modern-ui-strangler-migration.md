# Modern UI Strangler Migration Plan

## 1. Recommended Architecture

### Core model
- Keep legacy PHP modules as the system of record for business logic.
- Add a **UI switching layer** in `ModuleUtility::loadModule()` after permission checks.
- If a request matches modern rollout rules, render `modules/modernui/Shell.tpl`.
- If not, continue normal legacy module rendering.

### Why this is safe
- Existing URL structure (`index.php?m=...&a=...`) remains unchanged.
- Existing authentication/session/cookie behavior remains unchanged (same PHP app, same origin).
- Existing permission checks remain unchanged because switching happens only **after** role access check.
- If modern shell cannot render, code falls back to legacy module rendering in the same request.

### Switching controls
- Global kill switch: `UI_SWITCH_ENABLED` or env `OPENCATS_UI_SWITCH_ENABLED`.
- Default mode: `legacy|hybrid|modern`.
- Route map: module/action mapping (`UI_SWITCH_ROUTE_MAP` or `OPENCATS_UI_ROUTE_MAP`).
- Session override:
  - `?ui=legacy` forces legacy for current session.
  - `?ui=modern` forces modern for current session.
  - `?ui=auto` clears override.
- Optional rollout cohorts:
  - `UI_SWITCH_TARGET_USER_IDS`
  - `UI_SWITCH_TARGET_ACCESS_LEVELS`

### Asset/build strategy
- Modern shell static assets are served from:
  - `public/modern-ui/modern-shell.css`
  - `public/modern-ui/modern-shell.js`
- Compiled SPA bundle is published to:
  - `public/modern-ui/build/app.bundle.js`
- Asset manifest:
  - `public/modern-ui/build/asset-manifest.json`
- Bundle URL resolution order:
  1. `UI_SWITCH_MODERN_BUNDLE_URL` when explicitly set
  2. Manifest entry (`UI_SWITCH_MANIFEST_PATH`, `UI_SWITCH_MANIFEST_ENTRY`)
  3. Safe fallback path (`public/modern-ui/build/app.bundle.js`)
- Optional alternate integration:
  - `UI_SWITCH_MODERN_DEV_SERVER_URL` for dev iframe mode
  - or `UI_SWITCH_MODERN_DEV_SERVER_URL` (dev iframe mode)

### Avoid business logic duplication
- Keep writes/workflows in legacy backend endpoints.
- Modern frontend consumes existing PHP endpoints (`index.php`, `ajax.php`) incrementally.
- Do not duplicate workflow logic in Node/React; reuse PHP APIs/actions.

## 2. Migration Strategy

### Phase 1: Foundation
- Scope:
  - Add switch service (`lib/UIModeSwitcher.php`)
  - Add shell template/assets
  - Add config hooks (`config.ui.php` optional include)
- Risks:
  - Misconfigured route map could route wrong pages.
- Rollback:
  - Set `UI_SWITCH_ENABLED=false` (or env false), or use `?ui=legacy`.
- Validation:
  - Confirm legacy routes unchanged with switch disabled.
  - Confirm mapped routes show modern shell when enabled.

### Phase 2: Low-risk screens
- Scope:
  - Read-only pages (dashboard summaries, details pages).
- Risks:
  - Missing data contract in shell/SPA.
- Rollback:
  - Remove route from map or force `ui=legacy`.
- Validation:
  - Permission checks still enforced.
  - No POST flow routed to modern unless explicitly enabled.

### Phase 3: Module-by-module migration
- Scope:
  - Migrate one action at a time (`module.action`).
  - Keep mutation forms in legacy until API contract is stable.
- Risks:
  - Inconsistent UX between migrated/non-migrated actions.
- Rollback:
  - Route-level map rollback (single action/module).
- Validation:
  - Error logs show switch decisions.
  - No session/auth regressions.

### Phase 4: Controlled rollout expansion
- Scope:
  - Expand cohorts and route coverage.
- Risks:
  - Performance/load regression from new bundle.
- Rollback:
  - Cohort rollback (user IDs/access levels) or global kill switch.
- Validation:
  - Monitor error logs, response times, and user reports.

### Phase 5: Legacy retirement (only after full validation)
- Scope:
  - Remove legacy rendering per route only after KPI and workflow parity.
- Risks:
  - Hidden dependencies in legacy templates/scripts.
- Rollback:
  - Keep route map + fallback until deprecation is proven safe.

## 3. Implemented Scaffold (Current Code)

- `index.php`
  - Loads optional `config.ui.php`.
  - Loads `lib/UIModeSwitcher.php`.
  - Captures per-session UI override from query string.
- `lib/ModuleUtility.php`
  - Calls switcher after permissions are checked.
  - Renders modern shell or falls back to legacy module.
- `lib/UIModeSwitcher.php`
  - Route/mode/capability decision engine.
  - Session override, env + config parsing, cohort targeting, logging.
- `modules/modernui/Shell.tpl`
  - Modern shell host page with immediate "Use Legacy UI" action.
- `public/modern-ui/modern-shell.js`
  - Mount point loader for SPA bundle/dev server, with fallback UI.
- `public/modern-ui/modern-shell.css`
  - Base styling for shell.
- `config.ui.php.sample`
  - Copy-ready switch configuration template.

## 3.1 First Real Migrated Page (Read-only)

- Route: `index.php?m=dashboard&a=my`
- Modern data contract (same action, JSON mode):
  - `index.php?m=dashboard&a=my&format=modern-json&modernPage=dashboard-my&contractVersion=1`
- Safety details:
  - Uses existing dashboard permission gate (`joborders.show` read access).
  - No POST/write endpoints added.
  - No auth/session changes.
  - UI switcher bypasses `format=modern-json` requests to avoid shell recursion.
  - Contract is versioned (`meta.contractVersion`) and keyed (`meta.contractKey`).

Response payload includes:
- `meta` (scope, pagination, visibility, labels)
- `filters` (selected company/job order/status)
- `options` (companies, job orders, statuses)
- `rows` (candidate/job/status read-only details and legacy deep links)

## 3.2 Runtime Safety and Observability

- Client shell telemetry events are emitted as:
  - console logs (`[modern-shell] ...`) when `UI_SWITCH_CLIENT_LOGGING=true`
  - browser events: `window` event name `opencats:modern-shell`
- Runtime error handlers:
  - shell script load/mount failures render explicit fallback panel
  - global `error` and `unhandledrejection` are captured for diagnostics
  - React mount path includes local error boundary with legacy escape action
- Optional auto fallback:
  - `UI_SWITCH_CLIENT_AUTO_FALLBACK_SECONDS` (default `0`)
  - when `>0`, fallback panel auto-redirects to legacy route after timeout

## 4. Deployment and Rollback

### Deployment
1. Deploy code with `UI_SWITCH_ENABLED=false`.
2. Validate no behavior change in production.
3. Create `config.ui.php` from sample.
4. Enable for a small route set and pilot cohort.
5. Increase route coverage gradually.

For first real migration:
1. Copy `config.ui.php.sample` to `config.ui.php`.
2. Set `UI_SWITCH_ENABLED=true`.
3. Keep `UI_SWITCH_ROUTE_MAP = ['dashboard' => ['my']]`.
4. Run frontend build in `frontend/modern-ui`.
5. Verify `public/modern-ui/build/app.bundle.js` and `asset-manifest.json`.
6. Enable mapped route for pilot users.

### Rollback
- Immediate rollback options:
  - Global: `UI_SWITCH_ENABLED=false`.
  - Route-level: remove route from `UI_SWITCH_ROUTE_MAP`.
  - User/session-level: append `?ui=legacy`.
- No DB migration required for switch itself.

## 5. Assumptions / Open Questions

- Assumption: modern frontend will call existing same-origin PHP endpoints.
- Assumption: route map will initially target GET/read routes only.
- Open question: should `settings`/admin routes be permanently excluded until later phase?
- Open question: preferred source of truth for feature flags (file config vs env-only).
- Open question: whether to add analytics table for switch telemetry instead of `error_log`.

## 6. Repeatable Template

For every next migrated page, follow:
- `docs/modern-ui-migration-template.md`

This is the standard sequence:
1. Keep legacy route intact.
2. Add contract-safe `format=modern-json` response in existing action.
3. Add typed frontend page and register route in `routeRegistry`.
4. Enable only that route in `UI_SWITCH_ROUTE_MAP`.
5. Validate and keep rollback as config-only.
