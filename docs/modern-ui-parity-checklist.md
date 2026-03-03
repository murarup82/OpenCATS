# Modern UI Parity Checklist

Use this checklist before changing default mode from `hybrid` to `modern`.

Route-level automation companion:
- Generated per-route checklist: `docs/modern-ui-route-parity-checklist.md` (run `npm run parity:routes`).

Status legend:
- `Pending`: not yet validated.
- `Pass`: validated in modern UI.
- `Fail`: regression or missing parity found.
- `N/A`: not applicable for this deployment.

## Global

| Area | Status | Notes |
| --- | --- | --- |
| Route resolution fallback (`native -> bridge -> legacy`) | Pending | Validate guarded routes with/without IDs. |
| Open Legacy UI escape hatch on all native pages | Pending | Verify top-level action is present and working. |
| Embedded modal refresh behavior (no double-refresh) | Pending | Validate with add/edit/status workflows. |
| Accessibility baseline (keyboard navigation + focus trap + ARIA labels) | Pending | Include segmented controls, select menus, modal dialogs. |
| Visual consistency with Avel theme tokens | Pending | Validate spacing/contrast on desktop + mobile breakpoints. |

## Dashboard (`dashboard.my`)

| Feature | Status | Notes |
| --- | --- | --- |
| Kanban and list rendering parity | Pending | Row counts and status groups must match legacy. |
| Drag/drop status change | Pending | Confirm forward transitions and rejection path. |
| Native quick status modal | Pending | Validate rejection reasons + full-form fallback. |
| Assign candidate workflow | Pending | Validate native modal search + assignment mutation. |
| Pipeline details timeline modal | Pending | Validate edit-date save + full-details fallback. |

## Candidates

| Feature | Status | Notes |
| --- | --- | --- |
| List filters, pagination, row actions | Pending | Compare server query params and results with legacy. |
| Show profile sections (notes/messages/pipeline/attachments/tags/questionnaires) | Pending | Validate data completeness and action parity. |
| Add candidate flow (duplicates + custom fields) | Pending | Validate create success + server validation feedback. |
| Edit candidate flow (custom fields + attachments) | Pending | Validate save, upload, preview, delete attachment. |

## Job Orders

| Feature | Status | Notes |
| --- | --- | --- |
| List filters, sort, presets, monitor toggle | Pending | Validate in-place updates and persistence. |
| Show page summary + pipeline + comments/messages | Pending | Validate mutations and history/report modal fallbacks. |
| Assign candidate workflow | Pending | Validate search, selection, status-on-add behavior. |
| Administrative hide/show | Pending | Validate async toggle parity with legacy. |

## Companies

| Feature | Status | Notes |
| --- | --- | --- |
| List filters, pagination, list actions | Pending | Validate ownership/hot filters and actions. |
| Show page tabs/panels and legacy utility actions | Pending | Validate attachments/history/job/contact links. |

## Contacts

| Feature | Status | Notes |
| --- | --- | --- |
| List filters, pagination, list actions | Pending | Validate owner/hot filters and cold call list route. |
| Show page activity/list/history actions | Pending | Validate embedded modal routes and link targets. |

## Activity

| Feature | Status | Notes |
| --- | --- | --- |
| Date range, profile/activity filters, pagination | Pending | Validate period handling and custom ranges. |
| Candidate/contact/job links | Pending | Validate modern URL routing from result rows. |

## Calendar

| Feature | Status | Notes |
| --- | --- | --- |
| Day/week/month range navigation | Pending | Validate date anchors and navigation controls. |
| Event and upcoming lists | Pending | Validate links and legacy fallback behavior. |

## Lists

| Feature | Status | Notes |
| --- | --- | --- |
| List filtering and pagination | Pending | Validate search/data-type/list-type combinations. |
| Create/rename/delete list actions | Pending | Validate permissions and error handling. |
| Link out to list details | Pending | Ensure fallback to legacy detail route is intentional. |

## Reports

| Feature | Status | Notes |
| --- | --- | --- |
| Launcher metrics and entry points | Pending | Validate KPI snapshot accuracy and report links. |
| Specialized report fallback routing | Pending | Validate non-modernized report routes open correctly. |

## Release Gate

| Gate | Status | Notes |
| --- | --- | --- |
| `npm run build` passes | Pending | Frontend production build must be green. |
| `npm run coverage:matrix` generated + reviewed | Pending | Confirm native/bridge distribution is acceptable. |
| `npm run smoke:routes` passes in target env | Pending | Requires `OPENCATS_BASE_URL` (+ cookie). |
| `npm run smoke:endpoints` passes in target env | Pending | Include optional IDs for guarded route checks. |
| Stakeholder UAT sign-off | Pending | Final acceptance before changing default mode. |
