# Modern UI Autopipeline

This queue is used for autonomous modernization runs while keeping legacy behavior available as fallback.

## Completed

1. Dashboard and candidate list/show modern pages.
2. Candidate profile enrichment: EEO, events, questionnaires.
3. Candidate add/edit route bridge in modern shell (legacy-safe iframe).
4. Full-width shell fix for `ui2-sidebar-enabled`.
5. Candidate navigation links forced to `ui=modern` across dashboard and candidates pages.
6. Shared modern URL utility applied across dashboard/candidate links.
7. Expanded sample route map to run major modules inside modern shell compatibility mode.
8. Native `candidates.edit` phase 1: modern form UI + legacy-safe save endpoint.
9. Native `candidates.add` phase 1: modern form UI + legacy-safe create endpoint.
10. Native `joborders.listByView` phase 1: modern filters/table UI + modern-json backend contract.
11. Native `joborders.listByView` phase 2: sort controls + monitored toggle action wiring.
12. Native `joborders.show` phase 1: modern profile UI + modern-json backend contract (summary, pipeline, attachments, hiring plan).
13. Native `joborders.listByView` phase 3: column visibility controls for dense recruiter workflows.
14. Native `candidates.add/edit` phase 2: dynamic extra fields + modern attachment actions wired to legacy-safe endpoints.
15. Native `joborders.show` phase 2: comments/messages native panels + richer quick actions + attachment action wiring.
16. Native `joborders.listByView` phase 4: column presets with per-user persistence (local storage keyed by site/user).
17. Native duplicate pre-check flow in `candidates.add` with modern inline review (hard/soft match UX).
18. Native in-app status change modal on `dashboard.my` (popup replaced by embedded modal workflow).
19. Expanded embedded modal coverage for pipeline actions (`dashboard.my` details, `candidates.show` pipeline actions, `joborders.show` pipeline actions).
20. Candidate action parity: modern Add-To-List overlay + embedded Add-To-Job modal flows on list/show pages.
21. Native dashboard drag/drop status mutation: no-popup transition endpoint with CSRF, owner-scope guardrails, forward-only enforcement, auto-fill for skipped stages, and hired openings checks.
22. Dashboard assign workspace (`considerCandidateSearch`) moved from popup to embedded modal flow in modern UI shell.
23. Removed `Open In Popup` affordance from shared embedded legacy modal component to reduce popup dependency across modern pages.
24. Added modern-json pipeline removal mutation path (with CSRF tokens) and wired inline remove actions on `candidates.show` and `joborders.show` to use it with confirm + note prompts.
25. Added native quick status modal on `candidates.show` and `joborders.show` for forward transitions (using secure mutation endpoint), with one-click fallback to full legacy status form for complex transitions.
26. Replaced iframe pipeline details action with native inline details modal (AJAX timeline HTML) on `candidates.show` and `joborders.show`, including full-details fallback.
27. Removed dead popup callback wiring from `LegacyFrameModal` call sites and simplified the modal API after popup affordance removal.
28. Replaced pipeline details HTML dependency with `pipeline.statusDetails.v1` modern-json timeline contract on `candidates.show` and `joborders.show`, including native inline timeline rendering and inline history date edit actions.
29. Migrated remaining show-page utility popups (joborder add-candidate, candidate/joborder add-attachment, candidate tag management) into embedded in-app modal flows using `LegacyFrameModal`.
30. Added `modern-json` mutation mode for `joborders.addProfileComment` and `joborders.postMessage`, and switched modern `joborders.show` comment/message forms to async in-place submit with immediate data refresh.
31. Added `modern-json` mutation mode for `joborders.deleteMessageThread` and switched modern `joborders.show` thread deletion to async in-place action.
32. Extended `candidates.show.v1` with comment/message contract parity (categories, open-state hints, flash metadata, inbox/thread payload, and secure action URLs/tokens).
33. Added `modern-json` mutation mode for `candidates.addProfileComment` and `candidates.postMessage`, and switched modern `candidates.show` comment/message forms to async in-place submit with immediate data refresh.
34. Added `modern-json` mutation mode for `candidates.deleteMessageThread` and switched modern `candidates.show` thread deletion to async in-place action.
35. Added `modern-json` mutation mode for candidate/joborder attachment deletion and wired modern `candidates.show` + `joborders.show` attachment tables to async delete actions with instant refresh.
36. Embedded legacy history/report utilities into the modern in-app modal shell (`candidates.show` history and `joborders.show` history/report) to avoid full context-switch navigation.
37. Added native candidate tag editor on `candidates.show` (modal checkbox workflow) backed by `modern-json` mutation support for `candidates.addCandidateTags`, with CSRF token enforcement and legacy modal fallback.
38. Embedded candidate questionnaire `View` action into the modern in-app modal shell (with `Print` kept as new-tab) to reduce page context switches.
39. Embedded candidate upcoming calendar event navigation into the modern in-app modal shell to keep profile context during calendar drill-downs.
40. Added `modern-json` mutation mode for `joborders.administrativeHideShow` and switched modern `joborders.show` hide/unhide action to async in-place toggle.
41. Added native async attachment upload workflows on `candidates.show` and `joborders.show` (with modern-json backend mutations), while keeping legacy upload modal fallback from the same panel.
42. Embedded `joborders.show` Hiring Plan action into the in-app modal shell to avoid a full-page context switch while preserving legacy functionality.
43. Embedded `Open Inbox` actions on `candidates.show` and `joborders.show` into the in-app modal shell to keep profile context during team inbox review.
44. Replaced `window.open` pipeline full-details fallbacks on `candidates.show` and `joborders.show` with in-app embedded modal navigation, keeping users in modern shell context.
45. Embedded candidate attachment `Preview` action into the in-app modal shell to avoid new-tab context switches while preserving legacy preview rendering.
46. Replaced pipeline removal `window.confirm`/`window.prompt` flows on `candidates.show` and `joborders.show` with a native inline confirmation modal (optional note, inline error/pending states).
47. Replaced show-page message-thread and attachment deletion `window.confirm` dialogs with native inline confirmation modals on `candidates.show` and `joborders.show`, including inline pending/error state handling.
48. Improved `candidates.listByView` Add-To-Job modal parity by using full-size embedded modal dimensions and refresh-on-close behavior so list data stays accurate after assignment.
49. Replaced quick-status mutation `window.alert` error handling on `candidates.show` and `joborders.show` with native inline modal error/pending states in `PipelineQuickStatusModal`.
50. Replaced dashboard/kanban interaction alerts with inline page-level feedback (`Assign Candidate` precondition and invalid drag/drop transitions), removing native `window.alert` usage from `dashboard.my`.
51. Replaced add/edit candidate form validation alerts with inline validation state messaging (`candidates.add` and `candidates.edit`) for required-name and GDPR-expiration rules.
52. Replaced static-list delete `window.confirm` in `ModernOverlayHost` with a native confirmation modal, removing the last browser-confirm usage in modern pages/components.
53. Embedded `joborders.listByView` Add Job Order action into the in-app modal shell (with refresh-on-close), removing legacy popup helper dependency for this flow.
54. Removed remaining popup-helper dependency from candidate surfaces by:
    - removing dead popup helper code from `candidates.listByView`
    - embedding `candidates.edit` Add Attachment action into the in-app modal shell with refresh-on-close.
55. Removed dead popup-helper code from `dashboard.my` after migrating dashboard actions to embedded modal shell flows.
56. Added async monitor-toggle parity on `joborders.listByView`:
    - backend `setMonitoredJobOrder` supports `format=modern-json`
    - frontend monitor toggle now updates in-place without full-page reload.
57. Removed forced full-page reload after Add-To-List mutation in `ModernOverlayHost`; now dispatches an in-app completion event and refreshes `candidates.show` data contextually.
58. Added legacy-popup refresh event interception across modern pages (`dashboard.my`, `candidates.list/show/edit`, `joborders.list/show`) so refresh requests now use in-place data reload and avoid full browser reload by default.
59. Stabilized refresh + modal behavior for modern list/show pages:
    - introduced shared `usePageRefreshEvents` hook and applied it across `dashboard.my`, `candidates.list/show/edit`, and `joborders.list/show`
    - `ModernOverlayHost` now emits `opencats:modern-page:refresh` and avoids hard reload fallback in modern mode
    - `candidates.listByView` now refreshes in-place after Add-To-List completion when visible rows are affected
    - removed stale `openInPopup` metadata from list/edit modal state and re-enabled refresh-close parity for Add-To-Job embedded modal
    - improved command/search icon sizing guardrails and forced visible kanban horizontal scrollbar in Avel theme.
60. Added native Add-To-Job-Order flow for candidate surfaces (`candidates.listByView` and `candidates.show`):
    - introduced `candidates.considerForJobSearch.v1` modern-json contract (open job order options + assignment metadata + CSRF token)
    - added `CandidateAssignJobOrderModal` with in-app search, status-on-add option, and async assignment submit
    - switched candidate list/show Add-To-Job actions from iframe modal to native async modal (legacy link fallback still available).
61. Added `modern-json` mutation handling for legacy reapply-confirm flows in pipeline assignment:
    - `candidates.addToPipeline` now supports JSON codes (`requiresConfirm`, `candidateAssigned`, `alreadyAssignedOrClosed`, `addFailed`) with CSRF validation for modern requests
    - `joborders.addToPipeline` now supports JSON `requiresConfirm` and success/error responses, removing legacy `window.confirm` dependency for modern callers.
62. Added native assign-candidate search flow for job order surfaces:
    - introduced `joborders.considerCandidateSearch.v1` modern-json contract (search query + candidate rows + status options + CSRF token)
    - added `JobOrderAssignCandidateModal` with in-app search, candidate selection, status-on-add, and async submit handling
    - switched `joborders.show` and `dashboard.my` assign actions to the native modal path (legacy assignment link preserved in-modal).
63. Extended `joborders.addToPipeline` modern-json mutation for production parity:
    - added CSRF token validation for modern requests
    - added optional `assignmentStatusID` support with automatic status transition after add
    - returned richer mutation payload (`statusApplied`) for modern UI feedback.
64. Stabilized modern type/contract parity for job orders:
    - fixed `joborders.show.v1` permission contract drift by adding `canDeleteAttachment` to both backend payload and frontend type definitions
    - fixed strict sort-control typing on `joborders.listByView` (`selectedSortBy` now always resolves to a concrete string).
65. Migrated dashboard pipeline details from legacy iframe to native inline timeline modal:
    - `dashboard.my` now uses `pipeline.statusDetails.v1` via `fetchPipelineStatusDetailsModernData`
    - added inline history-date edit/save flow using `updatePipelineStatusHistoryDate`
    - kept an explicit in-modal legacy full-details fallback action for parity.
66. Migrated `candidates.edit` attachment add flow to native async upload:
    - replaced default legacy attachment iframe path with in-page upload controls (`file` + `resume` toggle)
    - wired submit to `uploadCandidateAttachment` using existing `candidates.createAttachment` modern-json endpoint
    - kept legacy uploader as an explicit fallback button in the same panel.
67. Added native attachment deletion on `candidates.edit`:
    - extended `candidates.edit.v1` contract actions with `deleteAttachmentURL` and `deleteAttachmentToken`
    - wired inline delete actions to `deleteCandidateAttachment` with CSRF token validation
    - replaced destructive browser dialogs with `ConfirmActionModal` for consistent in-app feedback.
68. Modernized core select/dropdown controls on candidate forms:
    - replaced native selects on `candidates.add` and `candidates.edit` for Source/GDPR and EEO fields with shared `SelectMenu`
    - preserved legacy form-post compatibility by binding each control to hidden inputs (`name=value`) so backend handlers remain unchanged
    - kept dynamic custom-field dropdown rendering intact for compatibility while reducing generic/native dropdown footprint on primary forms.
69. Upgraded `ModuleBridgePage` compatibility UX for non-modernized modules:
    - added in-place `Reload Workspace` action (iframe key refresh) to avoid full-page refresh when legacy content gets stale
    - added quick navigation chips to core native modern surfaces (Dashboard/Candidates/Job Orders)
    - added explicit "open current route in new tab" capability while preserving embedded legacy route behavior (`ui_embed=1`).
70. Added native quick-status modal entrypoint for `dashboard.my` list view:
    - replaced list-row "Change Status" direct legacy form launch with `PipelineQuickStatusModal`
    - preserved full legacy form parity via explicit "open full form" fallback from the modal
    - kept drag/drop and backend status mutation behavior unchanged while reducing popup dependency in list interactions.
71. Upgraded `CandidatesFormBridgePage` to the modern compatibility workspace pattern:
    - added in-place iframe reload action (`Reload Form`) to avoid full page reloads during form troubleshooting
    - added explicit new-tab open for the exact legacy form route while preserving `ui_embed=1` default behavior
    - aligned bridge-page UX with ModuleBridge quick-navigation chips for consistent cross-module experience.
72. Migrated dynamic custom-field dropdowns on `candidates.add` and `candidates.edit` to shared `SelectMenu`:
    - replaced remaining primary-form dropdown controls for tenant-defined extra fields with modern select UX
    - preserved legacy backend post contracts by writing selected values through hidden named inputs
    - retained all existing custom-field data flow and validation behavior.
73. Added compatibility iframe loading states across bridge surfaces:
    - `LegacyCompatPage`, `ModuleBridgePage`, and `CandidatesFormBridgePage` now show explicit inline loading placeholders
    - added in-place frame reload flow that resets loading state predictably
    - reduced white-screen/flicker perception while legacy content initializes.
74. Added dedicated modern route bridge for job order forms:
    - introduced `JobOrdersFormBridgePage` with compatibility workspace actions (reload form, open in new tab, quick navigation)
    - wired `joborders.add` and `joborders.edit` routes to the dedicated bridge instead of generic module fallback
    - preserved full legacy form behavior through `ui_embed=1` rendering.
75. Hardened dashboard status mutation fallback behavior:
    - removed implicit legacy status modal fallback on transient async mutation errors in `dashboard.my`
    - legacy status form now opens only for explicit full-form usage, rejected transitions, missing token path, or backend `requiresModal` responses.
76. Restricted dashboard quick-status choices to valid forward transitions:
    - `dashboard.my` quick status options now respect ordered pipeline stages and keep rejected handling explicit
    - blocked invalid backward options from the quick-status modal list.
77. Extended `candidates.edit.v1` attachment payload with preview metadata:
    - added `previewAvailable` and `previewURL` fields for edit-page attachment parity with candidate profile.
78. Added native in-app attachment preview action on `candidates.edit`:
    - attachment rows now expose `Preview` when available and open inside embedded legacy modal shell
    - upload modal state now supports modal mode flags to avoid unnecessary refresh prompts for preview-only views.
79. Added in-app attachment preview action on `joborders.show`:
    - attachment rows now expose `Preview` using retrieval URL in the embedded modal shell to reduce context switching.
80. Added shared legacy embedding URL utility:
    - introduced `buildEmbeddedLegacyURL()` in `frontend/modern-ui/src/lib/embeddedLegacy.ts`
    - removed duplicated URL embedding logic across compatibility surfaces.
81. Added shared embedded-frame loading/reload hook:
    - introduced `useEmbeddedLegacyFrame()` for standardized frame loading state, reload token, and load handlers.
82. Refactored `ModuleBridgePage` to shared embedding utilities:
    - now uses centralized embedded URL + frame loading/reload hook behavior.
83. Refactored form bridge pages to shared embedding utilities:
    - `CandidatesFormBridgePage` and `JobOrdersFormBridgePage` now use shared frame loading/reload orchestration.
84. Refactored `LegacyCompatPage` to shared embedding utilities:
    - now uses shared frame loading hook and includes explicit in-place workspace reload action.

## Next Queue (30-Slice Execution)

1. Add native rejection/reason flow for dashboard status changes to reduce remaining legacy fallback usage.
2. Migrate remaining `candidates.show` utility fallback actions from `LegacyFrameModal` into native async/mutation flows where backend contracts already exist.
3. Migrate remaining `joborders.show` utility fallback actions from `LegacyFrameModal` into native async/mutation flows where backend contracts already exist.
4. Add inline optimistic refresh tokens for candidate/joborder show mutations to eliminate stale panel windows after rapid actions.
5. Add async/non-blocking feedback toasts for successful mutations (status change, assign, upload, delete) across modern pages.
6. Add unified mutation error surface component to replace repeated per-page error blocks.
7. Add `companies.listByView` modern-json contract and native page shell (filters + table + legacy fallback actions).
8. Add `companies.show` modern-json contract and native profile page shell (summary + notes/messages parity starter).
9. Add `contacts.listByView` modern-json contract and native list page shell.
10. Add `contacts.show` modern-json contract and native profile page shell.
11. Add `activities.listByView` modern-json contract and native list page shell with date/status filtering.
12. Add `calendar` modern-json contract and native list/day shell with in-app navigation.
13. Add `lists.manage` modern-json contract and native static-list management page.
14. Add reports entry modernization (`reports.*`) with native launcher panel and embedded report builder fallback.
15. Add global modern shell menu/header treatment for bridge pages to keep UX consistent outside dashboard/candidate/joborder routes.
16. Add consistent keyboard navigation and focus-trap behavior audit/fixes for all custom menus/modals.
17. Add ARIA/labeling pass for all custom controls, especially select menus in form contexts.
18. Add centralized URL-state sync helper for filters/pagination shared by list pages.
19. Add route guard + capability guard helper to standardize permission-based button visibility/action blocking.
20. Add API contract guard helpers to fail fast with actionable diagnostics on contract drift.
21. Add minimal frontend smoke test script covering modern routes and key actions (load + primary mutation success).
22. Add backend endpoint smoke checks for all `format=modern-json` actions introduced in migration.
23. Add migration coverage matrix generator (route -> native/bridge/legacy) for release gating.
24. Add performance/stability pass: avoid unnecessary iframe reloads and reduce repeated fetches on modal close events.
25. Run end-to-end stabilization sweep across migrated pages and fix parity gaps before defaulting additional routes to modern.

## Rules

1. Keep legacy route available for every migrated page (`Open Legacy UI` action present).
2. Use small, verifiable commits per slice.
3. Run `npm run build` for `frontend/modern-ui` before bundle commits.
4. Commit source and bundle artifacts separately.
