# Modern UI Migration Template (Route-by-Route)

Use this template for each new migrated page.

## 1. Route Selection

Pick one route only:
- `module.action`
- Prefer read-only first
- Keep legacy route fully available

## 2. Permission-Safe Backend Entry

Implement contract in the **existing UI action** after the same permission checks.

Pattern:
1. Read `format` + `modernPage` query inputs.
2. If `format=modern-json` and `modernPage` matches expected key, return JSON.
3. Otherwise continue legacy template render.

Rules:
- No auth/session changes
- No duplicated business rules in frontend
- No POST workflow migration in early phase

## 3. Data Contract Convention

Request:
- `format=modern-json`
- `modernPage=<module-action-key>`
- `contractVersion=1`
- `ui=legacy` (to bypass shell recursion)

Response:
- `meta.contractVersion`
- `meta.contractKey`
- `meta.modernPage`
- payload for page data and filter options

## 4. Frontend Page Wiring

1. Add typed contract in `frontend/modern-ui/src/types.ts` (or page-specific type file).
2. Add request helper in `src/lib/api.ts` using `buildModernJSONRequestQuery(...)`.
3. Add page component in `src/pages`.
4. Register route in `src/lib/routeRegistry.ts`.
5. Reuse shared primitives:
   - `PageContainer`
   - `LoadingState`
   - `ErrorState`
   - `EmptyState`
   - `DataTable` / `StatChip` when useful

## 5. Route Enablement

In `config.ui.php`:
- Keep `UI_SWITCH_ENABLED=true` only for pilot
- Add route in `UI_SWITCH_ROUTE_MAP` (single action)
- Keep `UI_SWITCH_REQUIRE_ROUTE_MATCH=true`

## 6. Validation Checklist

- PHP lint passes for changed backend files.
- Frontend build completes (`npm run build` + `npm run verify:build`).
- Legacy route still works with `?ui=legacy`.
- Modern route renders with `?ui=modern`.
- Data endpoint returns JSON contract and does not recurse into shell.
- Role/permission behavior unchanged.

## 7. Rollback

Immediate options:
1. Global: `UI_SWITCH_ENABLED=false`
2. Route-level: remove route from `UI_SWITCH_ROUTE_MAP`
3. Session-level: append `?ui=legacy`

No DB rollback required for UI migration slices.

