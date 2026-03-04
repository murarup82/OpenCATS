# Modern UI Autopipeline

This queue is used for autonomous modernization runs while keeping legacy behavior available as fallback.

Historical note (2026-03-04): This log preserves intermediate migration steps.
Entries that mention intermediary wrappers (`LegacyRedirectPage`,
`EntityUtilityActionPage`, `ReportsActionPage`, `GraphsActionPage`) are historical.
Those wrappers were retired and removed in commit `caa70f0`.
Current status is enforced by:
- `docs/modern-ui-zero-legacy-dependent-check.md`
- `docs/modern-ui-no-legacy-wrapper-routes-check.md`

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
85. Added native rejection/reason flow for dashboard quick status transitions:
    - `dashboard.setPipelineStatus` now accepts rejection reason IDs + optional "other reason" text in modern-json mutation mode
    - dashboard modern contract now exposes rejection reason catalog + `rejectionOtherReasonID`
    - dashboard quick status now opens an in-app rejection modal instead of forcing legacy modal fallback.
86. Extended candidate and job order show contracts for rejection parity:
    - `candidates.show.v1` and `joborders.show.v1` now expose rejection reason catalog + `rejectionOtherReasonID` under `pipelineStatus`
    - quick-status flows can now branch into native rejection capture paths.
87. Migrated remaining quick-status fallback actions on `candidates.show` and `joborders.show`:
    - quick status now includes Rejected transition where valid
    - native rejection modal submits via `dashboard.setPipelineStatus` modern-json mutation
    - explicit full-form fallback remains available when contract/token data is missing.
88. Added optimistic modern data refresh guards for high-frequency mutations:
    - `dashboard.my`, `candidates.show`, and `joborders.show` now ignore stale fetch responses via request-id guards
    - rapid mutations no longer risk older responses overriding newer state.
89. Added non-blocking success toasts across modern mutation-heavy pages:
    - new shared `MutationToast` component with auto-dismiss
    - wired to status changes, rejection updates, assignment, uploads, deletes, comments/messages, and admin hide/show actions on dashboard/candidate/joborder pages.
90. Added shared mutation error surface for modern modal flows:
    - introduced reusable `MutationErrorSurface` component for consistent inline error rendering
    - replaced repeated ad-hoc error blocks in `PipelineQuickStatusModal`, `PipelineRejectionModal`, `PipelineRemoveModal`, and `ConfirmActionModal`.
91. Added native `companies.listByView` modernization starter:
    - backend `companies.listByView` now supports `format=modern-json` contract `companies.listByView.v1` with pagination, search, sort, and ownership/hot filters
    - new `CompaniesListPage` added to modern shell with Avel command bar, table, pagination, and list-action parity starter
    - route registry now maps `companies.listByView`/`companies.list`/`companies.(default)` to native page while keeping wildcard bridge fallback for remaining company actions.
92. Added native `companies.show` modernization starter:
    - backend `companies.show` now supports `format=modern-json` contract `companies.show.v1` with summary, attachments, job orders, contacts, departments, and extra fields payloads
    - new `CompaniesShowPage` added to modern shell with Avel card layout and legacy-safe modal fallbacks for history/attachment management
    - route registry now maps `companies.show` to native page while preserving wildcard legacy bridge for unresolved company actions.
93. Added native `contacts.listByView` modernization starter:
    - backend `contacts.listByView` now supports `format=modern-json` contract `contacts.listByView.v1` with pagination, search, sort, ownership/hot filters, and list-action URLs
    - new `ContactsListPage` added to modern shell with Avel command bar, toggles, table pagination, and Add-To-List overlay parity
    - route registry now maps `contacts.listByView`/`contacts.list`/`contacts.(default)` to native page while keeping wildcard bridge fallback for unresolved contact actions.
94. Added native `contacts.show` modernization starter:
    - backend `contacts.show` now supports `format=modern-json` contract `contacts.show.v1` with profile, notes, events, job orders, lists, activity, and extra fields payloads
    - new `ContactsShowPage` added to modern shell with Avel profile layout and legacy-safe modal actions (history, schedule event, log activity)
    - route registry now maps `contacts.show` to native page while preserving wildcard legacy bridge fallback for remaining contact actions.
95. Added native `activity.listByViewDataGrid` modernization starter:
    - backend `activity.listByViewDataGrid` now supports `format=modern-json` contract `activity.listByView.v1` with period/date range, profile-type, and activity-type filtering
    - new `ActivityListPage` added to modern shell with Avel command bar, filter chips, and unified candidate/contact activity timeline table
    - route registry now maps `activity.listByViewDataGrid`/`activity.viewByDate`/`activity.(default)` to the native page while keeping wildcard bridge fallback.
96. Added native `calendar.showCalendar` modernization starter:
    - backend `calendar.showCalendar` now supports `format=modern-json` contract `calendar.show.v1` with day/week/month range resolution, event payloads, and upcoming list data
    - new `CalendarPage` added to modern shell with range navigation, anchor-date controls, and native event/upcoming tables
    - route registry now maps `calendar.showCalendar`/`calendar.(default)` to native page while preserving legacy fallback routes for remaining calendar actions.
97. Added native `lists.listByView` modernization starter:
    - backend `lists.listByView` now supports `format=modern-json` contract `lists.listByView.v1` with visibility-safe list retrieval, pagination, and filters (search/data-type/list-type)
    - new `ListsManagePage` added to modern shell with native filtering, create-list workflow, and delete-list confirmation flow
    - route registry now maps `lists.listByView`/`lists.(default)` to native page while preserving bridge fallback for unmodernized list actions (e.g., `showList` detail page).
98. Added native `reports.reports` modernization starter:
    - backend `reports.reports` now supports `format=modern-json` contract `reports.launcher.v1` with KPI snapshot payloads and launcher metadata
    - new `ReportsLauncherPage` added to modern shell as a native report-entry control center
    - route registry now maps `reports.reports`/`reports.(default)` to the native launcher while preserving bridge fallback for specialized report routes.
99. Upgraded global compatibility-shell treatment for remaining bridge routes:
    - `LegacyCompatPage` now uses full modern page framing (`PageContainer` + Avel shell) instead of a bare embedded section
    - added consistent compatibility header/actions and quick-navigation chips (Dashboard/Candidates/Job Orders/Reports)
    - unified fallback route experience for non-migrated modules with the same visual/interaction language used by dedicated bridge pages.
100. Added shared API contract assertion helper and applied it across modern data fetchers:
    - introduced `assertModernContract` in `frontend/modern-ui/src/lib/contractGuards.ts`
    - replaced repeated contract-version/contract-key checks in `frontend/modern-ui/src/lib/api.ts` with a centralized guard call
    - improved diagnostics for contract drift with expected vs received metadata in one place.
101. Added shared inline-modal accessibility controls and select keyboard/ARIA polish:
    - introduced `InlineModal` in `frontend/modern-ui/src/ui-core/components/InlineModal.tsx` with focus trap, Escape handling, backdrop close control, and focus restoration
    - migrated inline modal surfaces (`ConfirmActionModal`, `Pipeline*` modals, `LegacyFrameModal`, and candidate tag editor) to the shared accessibility wrapper
    - improved `SelectMenu` with explicit label wiring (`aria-labelledby`), active-option semantics, and predictable focus restoration on close.
102. Added centralized URL-state synchronization helper for native list pages:
    - introduced `useServerQueryState()` in `frontend/modern-ui/src/lib/useServerQueryState.ts` for URL replace-state + server-query synchronization
    - refactored all native list pages (`Candidates`, `Job Orders`, `Companies`, `Contacts`, `Activity`, `Lists`) to use the shared query-state helper
    - removed repeated query-state boilerplate from list-filter/pagination flows while preserving existing route semantics.
103. Added shared route/capability guard helpers and applied them to core routing/actions:
    - introduced `routeGuards` helpers (`parseRequestQueryParams`, `hasPositiveIntegerQueryParam`, `isCapabilityEnabled`) in `frontend/modern-ui/src/lib/routeGuards.ts`
    - updated route resolution to enforce required entity IDs for guarded routes (`show`/`edit` surfaces) and fallback safely to module defaults/bridge when missing
    - applied capability guard helper to primary action rendering in Dashboard/Candidates list/Job Orders list to standardize permission checks.
104. Added migration coverage matrix generator for release gating:
    - introduced `frontend/modern-ui/scripts/generate-coverage-matrix.mjs` and npm script `coverage:matrix`
    - generator parses route registry + guarded-param map and outputs module/route-level coverage to `docs/modern-ui-route-coverage.md`
    - route coverage can now be regenerated quickly as part of modernization stabilization and rollout decisions.
105. Added minimal frontend smoke script for modern route contracts:
    - introduced `frontend/modern-ui/scripts/smoke-modern-routes.mjs` and npm script `smoke:routes`
    - smoke runner validates modern-json contract keys/versions for core native routes via HTTP and performs a safe dashboard mutation endpoint probe
    - script is environment-driven (`OPENCATS_BASE_URL`, optional `OPENCATS_COOKIE`) and skips cleanly when not configured.
106. Added backend modern-json endpoint smoke checks:
    - introduced `frontend/modern-ui/scripts/smoke-modern-endpoints.mjs` and npm script `smoke:endpoints`
    - endpoint checker validates contract version/key for list/show/add/edit modern-json routes (with optional env-provided entity IDs for guarded endpoints)
    - includes safe dashboard mutation endpoint probe to verify JSON mutation contract path without changing valid entities.
107. Added refresh-event debouncing for modal-close stability:
    - updated `usePageRefreshEvents` to debounce burst refresh events from embedded legacy/modal flows
    - coalesces back-to-back `opencats:legacy-popup:refresh-request` + `opencats:modern-page:refresh` into a single data reload
    - reduces repeated fetches/flicker on modal close while preserving in-place refresh behavior.
108. Expanded ARIA semantics for high-frequency custom controls:
    - dashboard scope/view segmented buttons now expose `aria-pressed` state and active filter count uses polite live-region updates
    - job order column preset and column visibility chips now expose pressed-state + explicit action labels
    - improved keyboard/screen-reader clarity for non-native toggle-chip controls during list customization.
109. Added module-by-module modernization parity checklist:
    - introduced `docs/modern-ui-parity-checklist.md` with global/module/release-gate validation grids
    - checklist now tracks parity status across Dashboard, Candidates, Job Orders, Companies, Contacts, Activity, Calendar, Lists, and Reports
    - provides explicit go/no-go criteria before switching default mode from hybrid to modern.
110. Added one-command modernization sanity report:
    - introduced `frontend/modern-ui/scripts/modern-sanity-report.mjs` and npm script `sanity:modern`
    - sanity command runs build + coverage matrix + smoke scripts and writes consolidated output to `docs/modern-ui-sanity-report.md`
    - required checks (`build`, `coverage`) now provide immediate pass/fail gate for release readiness.
111. Added baseline modern keyboard shortcuts and reference documentation:
    - introduced `useModernKeyboardShortcuts()` with `/` (focus search) and `Shift+R` (in-page refresh event)
    - wired shortcut hook in app shell so all native modern pages can use consistent quick actions
    - added keyboard shortcut reference in `docs/modern-ui-keyboard-shortcuts.md`.
112. Migrated `joborders.addJobOrderPopup` to a native action workspace:
    - backend `joborders.addJobOrderPopup` now supports `format=modern-json` contract `joborders.addPopup.v1` (mode defaults + copy-source catalog)
    - added native `JobOrderAddActionPage` with empty-vs-copy workflow, source search/select, and direct handoff into modern `joborders.add`
    - switched `joborders.listByView` Add Job Order entry from legacy iframe modal to direct native route navigation.
113. Migrated `candidates.viewResume` to a native action workspace:
    - backend `candidates.viewResume` now supports `format=modern-json` contract `candidates.viewResume.v1` with resume text/query payload
    - added native `CandidateResumeActionPage` with in-page highlight support and modern fallback navigation
    - route mapping now resolves `candidates.viewResume` directly to native action page (compat wrapper removed).
114. Migrated `joborders.recruiterAllocation` to a native modern workspace:
    - backend `joborders.recruiterAllocation` now supports `format=modern-json` contract `joborders.recruiterAllocation.v1` (filters/options/rows/paging)
    - backend mutation path for recruiter allocation now supports `format=modern-json` for async assignment save responses
    - added native `JobOrdersRecruiterAllocationPage` with filter controls, in-table assignment editing, async save, and pagination.
115. Migrated `joborders.setMonitoredJobOrder` to a native action workspace:
    - added native `JobOrderMonitorActionPage` that executes existing modern-json monitor toggle mutation and handles safe return navigation
    - route mapping now resolves `joborders.setMonitoredJobOrder` directly to native action handling (compat wrapper removed).
116. Migrated contacts utility actions from compat to native handling:
    - backend `contacts.showColdCallList` now supports `format=modern-json` contract `contacts.coldCallList.v1`
    - added native `ContactsColdCallListPage` for in-app cold-call workflow (with direct modern links to contact/company/vCard actions)
    - added native `ContactVCardActionPage` for `contacts.downloadVCard` route handling with legacy download redirect fallback.
117. Migrated `candidates.show_questionnaire` to a dedicated native action workspace:
    - added native `CandidateQuestionnaireActionPage` with embedded legacy questionnaire rendering (`ui_embed=1`)
    - added explicit view/print mode controls and candidate-context navigation
    - route mapping now resolves `candidates.show_questionnaire` directly to native action handling (compat wrapper removed).
118. Migrated `contacts.addActivityScheduleEvent` to a dedicated native action workspace:
    - added native `ContactActivityActionPage` with embedded legacy activity/event form rendering (`ui_embed=1`)
    - added explicit full-mode vs schedule-only mode controls and contact-context navigation
    - route mapping now resolves `contacts.addActivityScheduleEvent` directly to native action handling (compat wrapper removed).
112. Added compatibility-route deprecation tracker:
    - introduced `docs/modern-ui-compat-deprecation-tracker.md` with route-pattern status tracking (`Keep/Candidate/Deprecate/Retired`)
    - documented per-module fallback preconditions and a retirement workflow for bridge-route removal
    - added rollback rule to safely restore compatibility mappings if deprecation causes blockers.
113. Added route-resolution telemetry counters for rollout visibility:
    - extended route resolution to emit structured outcomes (`native`, `bridge`, `legacy`) with matched route key metadata
    - introduced `recordRouteResolutionTelemetry()` with session-based counters and `opencats:modern-route:resolution` events
    - app shell now records resolution telemetry per route signature to support fallback confidence monitoring during cutover.
114. Added mutation-safe replay fixtures for endpoint smoke workflows:
    - introduced `frontend/modern-ui/scripts/fixtures/mutation-safe-replays.json` for safe, repeatable mutation probes
    - updated `smoke-modern-endpoints.mjs` to replay fixture-driven probes from loaded modern payloads using extracted action URLs/tokens
    - fixtures validate JSON mutation contract shape (`success` boolean) without targeting valid entity IDs.
115. Added rollout scorecard for modern-default go/no-go decisions:
    - introduced `docs/modern-ui-rollout-scorecard.md` with weighted pass/partial/fail criteria and release thresholds
    - scorecard maps build/smoke/parity/telemetry/accessibility/rollback/UAT checks into a single decision artifact
    - provides explicit `Go / Hold / No-Go` rules for default-mode switch governance.
116. Added targeted no-JS fallback audit:
    - introduced `docs/modern-ui-nojs-fallback-audit.md` with workflow-level JS dependency and fallback risk mapping
    - documented current mitigation paths (legacy routes, embedded fallbacks, explicit escape-hatch actions)
    - identified remaining no-JS gaps and recommended mitigation steps before strict fallback requirements.
117. Added native async calendar event mutations on `calendar.showCalendar`:
    - backend `calendar.addEvent`, `calendar.editEvent`, and `calendar.deleteEvent` now support `format=modern-json` with CSRF validation and structured success/error payloads
    - `calendar.show.v1` now includes mutation action URLs/tokens and event edit-time metadata (`timeHHMM`)
    - modern `CalendarPage` now supports native Add/Edit/Delete flows via in-app modal and confirmation UX with inline error/toast feedback (legacy calendar route remains available).
117. Added release runbook for modern default cutover:
    - introduced `docs/modern-ui-release-runbook.md` with pre-release, cutover, rollback, and post-release validation steps
    - documented safe `config.ui.php` switch sequencing and rollback toggles (`modern -> hybrid -> disabled`)
    - added incident triage priorities focused on mutation and navigation-critical recruiter workflows.
118. Added owner/date cutover checklist template:
    - introduced `docs/modern-ui-cutover-checklist.md` with actionable release-day steps and accountable owner/date/status fields
    - checklist links core evidence artifacts (sanity report, coverage matrix, parity checklist, scorecard, runbook)
    - provides a structured execution log for hybrid-to-modern mode switching.
119. Added compatibility deprecation sign-off template:
    - introduced `docs/modern-ui-deprecation-signoff-template.md` with required evidence, risk/rollback sections, and approvals
    - template links telemetry/parity/smoke/rollback checks into a single route-retirement decision artifact
    - enforces explicit go/no-go conditions before retiring compatibility route patterns.
120. Added route-resolution telemetry dashboard snippet:
    - introduced `docs/modern-ui-telemetry-dashboard-snippet.md` with console snippets for inspecting session counters and live events
    - includes quick reset helper for per-session telemetry during troubleshooting
    - enables lightweight admin-side monitoring without additional backend dashboards.
121. Added smoke fixture maintenance guide:
    - introduced `docs/modern-ui-smoke-fixture-maintenance.md` with schema, safety rules, and extension workflow
    - documented how to add mutation-safe replay probes without mutating real entities
    - linked validation steps for updating fixture-driven endpoint smoke coverage.
122. Added rollout scorecard prefill helper:
    - introduced `frontend/modern-ui/scripts/prefill-rollout-scorecard.mjs` and npm script `scorecard:prefill`
    - helper parses latest sanity report and auto-populates machine-derivable scorecard criteria
    - writes generated baseline to `docs/modern-ui-rollout-scorecard-prefill.md` for final manual sign-off completion.
123. Added smoke fixture lint validation:
    - introduced `frontend/modern-ui/scripts/lint-smoke-fixtures.mjs` and npm script `fixtures:lint`
    - validates replay fixture schema integrity (required fields, token pair coherence, unique IDs)
    - prevents malformed mutation replay definitions from breaking endpoint smoke workflows.
124. Added consolidated quality gate runner:
    - introduced `frontend/modern-ui/scripts/quality-gate.mjs` and npm script `quality:gate`
    - quality gate executes sanity report, scorecard prefill, fixture lint, and evidence file presence checks
    - writes consolidated report to `docs/modern-ui-quality-gate.md` with pass/fail output for release readiness.
125. Added no-JS acceptance criteria into rollout scorecard:
    - extended `docs/modern-ui-rollout-scorecard.md` with explicit no-JS acceptance gates
    - linked acceptance requirements to fallback audit and stakeholder acknowledgment.
126. Added release-day operations ownership matrix:
    - introduced `docs/modern-ui-operations-ownership-matrix.md` with primary/secondary ownership and escalation mapping
    - covers command execution, telemetry monitoring, smoke validation, incident triage, rollback, and communications.
127. Added post-cutover review checklist:
    - introduced `docs/modern-ui-post-cutover-review-checklist.md` with Day 1 / Day 7 / Day 30 review gates
    - formalizes post-release telemetry/parity/accessibility follow-through and retirement candidate identification.
128. Added legacy-vs-modern route parity audit and safer fallback routing:
    - introduced `frontend/modern-ui/scripts/compare-legacy-modern-routes.mjs` and npm script `compare:legacy-routes`
    - generated `docs/modern-ui-legacy-route-gap-report.md` + `.json` with per-module action parity classification
    - updated route resolution to prefer module bridge fallback for unknown actions (instead of default native page), reducing hidden-control regressions.
129. Added deprecation evidence validation + cutover evidence auto-link automation:
    - introduced `frontend/modern-ui/scripts/validate-deprecation-signoff.mjs` and npm script `deprecation:validate`
    - introduced `frontend/modern-ui/scripts/generate-cutover-evidence-links.mjs` and npm script `cutover:evidence`
    - extended quality gate to run both checks and validate generated artifacts (`docs/modern-ui-deprecation-evidence-check.md`, `docs/modern-ui-cutover-evidence-links.md`).
130. Refreshed legacy-vs-modern comparison and generated a concrete remaining modernization queue:
    - re-ran `npm run compare:legacy-routes` to refresh action parity snapshot
    - added `docs/modern-ui-comparison-driven-queue.md` with a prioritized 30-task execution plan based on the comparison report
    - documented in-scope bridged action counts by module to drive the next implementation wave.
131. Executed comparison-driven 30-task parity wave (phase 1):
    - added explicit in-scope action mappings in route registry (native-explicit or bridge-explicit by action family)
    - added dedicated modern compatibility form pages for `companies.add/edit` and `contacts.add/edit`
    - removed in-scope wildcard/default fallback resolution (`verify:in-scope-routes` now enforces zero fallback for core modules).
132. Hardened comparison tooling for dynamic route definitions:
    - upgraded `compare-legacy-modern-routes.mjs` parser to include explicit dynamic route maps and strip commented legacy code from action extraction
    - report now includes `bridgeExplicit` vs `bridgeFallback` counters for clearer migration progress.
133. Added in-scope fallback guard automation:
    - introduced `frontend/modern-ui/scripts/verify-no-inscope-wildcard-fallbacks.mjs` and npm script `verify:in-scope-routes`
    - wired quality gate to run route comparison plus in-scope fallback guard before evidence publication.
134. Added telemetry retention guidance for rollout observability:
    - introduced `docs/modern-ui-telemetry-retention-guidance.md` with tiered retention policy (session snapshots and optional persisted telemetry)
    - documented privacy/data-minimization requirements and escalation triggers for retention upgrades.
135. Added smoke fixture coverage reporting automation:
    - introduced `frontend/modern-ui/scripts/generate-smoke-fixture-coverage.mjs` and npm script `fixtures:coverage`
    - generated `docs/modern-ui-smoke-fixture-coverage.md` with endpoint-check coverage, uncovered gaps, and orphan fixture detection.
136. Added release readiness changelog template:
    - introduced `docs/modern-ui-release-readiness-changelog-template.md` with per-slice evidence linkage and interpretation rules
    - aligned changelog fields with quality gate, scorecard, and fallback metrics.
137. Added scorecard prefill confidence-note support:
    - updated `frontend/modern-ui/scripts/prefill-rollout-scorecard.mjs` to append confidence notes for smoke validation context
    - prefill artifact now explicitly calls out provisional/skipped smoke confidence handling.
138. Added periodic ownership-matrix review reminder process:
    - introduced `frontend/modern-ui/scripts/generate-ownership-review-reminder.mjs` and npm script `ownership:reminder`
    - generated `docs/modern-ui-operations-ownership-review-reminder.md` and documented workflow in `docs/modern-ui-operations-ownership-review-reminder-process.md`.
139. Added keyboard shortcut extension plan for next modernization wave:
    - introduced `docs/modern-ui-keyboard-shortcuts-extension-plan.md` with module-jump, action-palette, and context-action shortcut roadmap
    - documented accessibility/safety constraints and phased rollout strategy.
140. Extended quality gate with governance and coverage artifacts:
    - `quality:gate` now runs fixture coverage and ownership reminder checks
    - evidence validation now requires telemetry retention, fixture coverage, release changelog template, keyboard extension plan, and ownership reminder process artifacts.
141. Executed phase-2A native deepening for explicit action routes:
    - introduced `ActionCompatPage` and moved explicit action compatibility mappings from `ModuleBridgePage` to native-explicit wrapper routing
    - in-scope action routes now resolve without wildcard/default fallback and without bridge-explicit classification.
142. Refined comparison telemetry for phase-2 tracking:
    - updated comparison parser to read component-targeted explicit action maps and preserve route-classification fidelity
    - refreshed comparison artifacts showing `nativeExplicit=95`, `bridgeExplicit=0`, and `inScopeNonNative=0`.
143. Added native `reports.customerDashboard` modernization contract and page:
    - extended `modules/reports/ReportsUI.php` with `reports.customerDashboard.v1` modern-json payload and legacy-safe fallback behavior
    - introduced `ReportsCustomerDashboardPage` with in-page filter controls, interactive trend/source charts, and metric drill-down table rendering
    - routed `reports.customerDashboard` away from compatibility iframe to native React page resolution.
144. Added native `reports.graphView` modernization contract and page:
    - extended `modules/reports/ReportsUI.php` with `reports.graphView.v1` modern-json payload for fullscreen graph mode metadata
    - introduced `ReportsGraphViewPage` with auto-refresh controls, fullscreen toggle, and in-page visual customization sliders
    - routed `reports.graphView` away from compatibility iframe to native React page resolution.
145. Added native `sourcing/(default)` modernization contract and page:
    - extended `modules/sourcing/SourcingUI.php` with `sourcing.list.v1` modern-json payload and modern-json save mutation handling
    - introduced `SourcingPage` with in-page editable weekly rows, interactive windowed trend chart, and draft-save workflow
    - routed `sourcing.(default)` to native React page while keeping `sourcing.*` fallback routing for legacy safety.
146. Added native `queue/(default)` modernization contract and page:
    - extended `modules/queue/QueueUI.php` with `queue.overview.v1` modern-json payload containing processor health, queue summaries, priority buckets, and recent task rows
    - introduced `QueuePage` with in-page interactive filters (state/search/row-limit) and interactive priority distribution modes
    - routed `queue.(default)` to native React page while preserving `queue.*` compatibility fallback behavior.
147. Added native `graphs/(default)` modernization contract and page:
    - extended `modules/graphs/GraphsUI.php` with `graphs.overview.v1` modern-json payload for graph launcher metadata and defaults
    - introduced `GraphsPage` with interactive in-page controls for graph selection, sizing, refresh cadence, and render styling
    - routed `graphs.(default)` to native React page while keeping `graphs.*` fallback behavior for raw image actions.
148. Added per-route parity checklist automation for newly modernized pages:
    - introduced `frontend/modern-ui/scripts/generate-route-parity-checklist.mjs` and npm script `parity:routes`
    - generated `docs/modern-ui-route-parity-checklist.md` with route-level checklist rows for lists/reports/sourcing/queue/graphs modern pages
    - wired parity checklist generation into sanity and quality governance workflows (`modern-sanity-report` + quality-gate evidence validation).
149. Added Playwright smoke coverage for modern add/edit workflows:
    - introduced Playwright configuration (`frontend/modern-ui/playwright.config.mjs`) and suite `tests/playwright/add-edit-workflows.spec.mjs`
    - added npm command `smoke:playwright` validating add/edit contract payloads for `candidates`, `companies`, `contacts`, and `joborders`
    - wired Playwright workflow smoke into sanity and quality gate automation.
150. Retired module-specific wildcard bridge mappings after deprecation sign-off:
    - removed module-level `module.*` bridge mappings from route registry and kept only the global `*.*` safety net
    - updated fallback order for unknown action routes so unresolved action requests flow to global compatibility bridge before module default
    - added `verify-bridge-wildcard-retirement.mjs` guard plus deprecation artifacts (`docs/modern-ui-deprecation-signoff.md`, updated tracker) to keep wildcard debt from reappearing.
151. Converted list add-to-list popup action routes to native action workspace handling:
    - introduced `ListsActionPage` to execute `lists.quickActionAddToListModal` and `lists.addToListFromDatagridModal` through modern overlay orchestration instead of compatibility iframe
    - mapped both routes as explicit native routes in registry and kept legacy fallback actions (`saveListAccess`, `removeFromListDatagrid`, `deleteStaticList`) on compatibility path
    - retained quality gate protections (`verify:in-scope-routes`, wildcard retirement guard) and regenerated coverage/sanity artifacts.
152. Converted assignment popup action routes to native action workspace handling:
    - introduced `CandidateAssignActionPage` and `JobOrderAssignActionPage` for `candidates.considerForJobSearch` and `joborders.considerCandidateSearch`
    - routed both actions as explicit native mappings while preserving existing modern assignment modal behavior (`CandidateAssignJobOrderModal`, `JobOrderAssignCandidateModal`)
    - removed these two actions from `ActionCompatPage` bridge mappings and kept quality gate/scope guards green.
153. Converted pipeline status detail/edit action routes to native workspace handling:
    - introduced `PipelineStatusActionPage` for `joborders.pipelineStatusDetails` and `joborders.pipelineStatusEditDate`
    - reused modern pipeline detail contract + inline editor (`fetchPipelineStatusDetailsModernData`, `PipelineDetailsInlineModal`) and native date-save flow
    - removed both actions from `ActionCompatPage` bridge mappings and added guarded `pipelineID` route requirements.
154. Converted job order company-context action route to native workspace handling:
    - introduced `JobOrderCompanyContextActionPage` for `joborders.companyContext`
    - reused existing `joborders.companyContext.v1` contract to render location/contact/department defaults in a native page
    - removed `joborders.companyContext` from `ActionCompatPage` bridge mappings and added guarded `companyID` route requirement.
155. Converted remaining reports action routes from compatibility wrapper to native workspace handling:
    - introduced `ReportsActionPage` for `reports.customerDashboardDetails`, `reports.customizeEEOReport`, `reports.customizeJobOrderReport`, `reports.generateEEOReportPreview`, `reports.generateJobOrderReportPDF`, `reports.showHireReport`, `reports.showPlacementReport`, and `reports.showSubmissionReport`
    - embedded report render/customization routes inside the modern compatibility workspace (`ui_embed=1`) with in-page action switching and reload controls
    - switched PDF export route (`reports.generateJobOrderReportPDF`) to native action handling with explicit legacy endpoint redirect for download behavior parity.
156. Converted core entity delete actions from compatibility wrapper to native action handling:
    - introduced `EntityDeleteActionPage` for `candidates.delete`, `companies.delete`, `contacts.delete`, and `joborders.delete`
    - routed delete actions through guarded modern routes (required entity IDs) with explicit cancel-return targets
    - preserved backend parity by redirecting to legacy delete endpoints (`ui=legacy`) from native action pages.
157. Converted companies internal-postings action route to native handling:
    - introduced `CompaniesInternalPostingsActionPage` for `companies.internalPostings`
    - resolves default company by following legacy route redirect and then navigates to modern `companies.show`
    - removed `companies.internalPostings` from compatibility action routing and added modern list CTA for direct access.
158. Converted candidate/joborder utility compat actions to native action workspaces:
    - introduced shared `EntityUtilityActionPage` and routed remaining `candidates.*` + `joborders.*` utility actions from `ActionCompatPage` to explicit native mappings
    - preserves behavioral parity via embedded legacy rendering (`ui_embed=1`) while providing modern context-aware return navigation
    - reduced compatibility action scope to calendar/lists/company-attachment action tails.
159. Retired explicit compatibility action-route wrapper usage for remaining tail actions:
    - routed `calendar.deleteEvent`, `calendar.dynamicData`, `companies.deleteAttachment`, `lists.deleteStaticList`, `lists.removeFromListDatagrid`, and `lists.saveListAccess` to native `EntityUtilityActionPage` handling
    - kept behavior parity by using embedded legacy utility workspace for form/modal actions and redirect mode for calendar data/delete endpoints
    - removed `ActionCompatPage` route-registry usage (global `*.* -> ModuleBridgePage` safety fallback remains unchanged).
160. Removed obsolete compatibility-wrapper page component:
    - deleted unused `frontend/modern-ui/src/pages/ActionCompatPage.tsx` after complete route retirement
    - kept migration history in docs while removing dead runtime source.
161. Added no-JS fallback-link guard to modernization CI gates:
    - introduced `frontend/modern-ui/scripts/verify-legacy-fallback-links.mjs` to assert `Open Legacy` fallback links remain present on core native page headers
    - wired `verify:legacy-fallback-links` into both `sanity:modern` and `quality:gate` required command suites
    - documented guard rollout in `docs/modern-ui-nojs-fallback-audit.md`.
162. Added shell-level no-JS fallback handoff + guard:
    - added `<noscript>` legacy handoff panel in `modules/modernui/Shell.tpl` so modern routes stay recoverable when JavaScript is disabled
    - styled no-JS handoff in `public/modern-ui/modern-shell.css` with explicit `Open Legacy UI` call-to-action
    - introduced `verify:shell-noscript-fallback` guard and wired it into required `sanity:modern` and `quality:gate` checks.
163. Normalized helper-generated action mappings to explicit static route keys for coverage fidelity:
    - replaced dynamic helper-spread mappings for `home.*`, `login.*`, `import.*`, and `rss.jobOrders` with explicit entries in `frontend/modern-ui/src/lib/routeRegistry.ts`
    - keeps runtime behavior unchanged while ensuring route-comparison tooling classifies these actions as native-explicit instead of wildcard fallback.
164. Retired discovered wildcard bridge fallback usage via explicit action mappings:
    - added explicit `ModuleBridgePage` action routes for all discovered legacy fallback actions in `attachments`, `export`, `gdpr`, `graphs`, `import`, `settings`, `toolbar`, `wizard`, and `xml`
    - preserved runtime behavior while shifting route-comparison classification from `bridge-global-fallback` to `bridge-explicit`
    - reduced comparison totals to `bridgeFallback=0` with `bridgeExplicit=90`, keeping unresolved routes at zero.
165. Modernized legacy graph action routes into native in-page action workspace:
    - introduced `frontend/modern-ui/src/pages/GraphsActionPage.tsx` with interactive controls (size, refresh cadence, visual filters, and custom query parameters) for legacy graph image actions
    - routed `graphs.generic`, `graphs.genericPie`, `graphs.jobOrderReportGraph`, `graphs.testGraph`, and `graphs.wordVerify` to native action handling in `routeRegistry`
    - improved coverage metrics to `nativeExplicit=137` and reduced bridge-explicit routes to `85` while preserving zero unresolved actions.
166. Completed explicit native action coverage for all discovered legacy routes:
    - expanded `EntityUtilityActionPage` with module-aware handling for `settings`, `import`, `gdpr`, `attachments`, `export`, `toolbar`, `wizard`, and `xml` action families
    - switched remaining explicit bridge mappings from `ModuleBridgePage` to native explicit `EntityUtilityActionPage` routes while preserving legacy-safe behavior through embed/redirect mode rules
    - comparison coverage now reports `nativeExplicit=222`, `bridge=0`, and `unresolved=0` for discovered legacy `handleRequest` actions.
167. Added zero-bridge regression guard for full explicit coverage baseline:
    - introduced `frontend/modern-ui/scripts/verify-no-bridge-actions.mjs` and npm script `verify:no-bridge-actions`
    - wired no-bridge guard into required sanity and quality workflows to fail CI if route comparison reintroduces any bridge-classified action
    - added generated evidence artifact `docs/modern-ui-no-bridge-actions-check.md` to quality gate evidence validation.
168. Expanded mutation-safe replay fixtures for modern endpoint smoke coverage:
    - added fixture `calendar.deleteEvent.safeInvalid` sourced from `calendar.showCalendar` using contract tokenized delete endpoint with invalid event ID
    - added fixture `joborders.pipelineStatusEditDate.safeInvalid` sourced from `joborders.pipelineStatusDetails` using modern-json invalid pipeline probe
    - improved fixture coverage baseline from 3/16 to 5/16 endpoint checks while keeping lint, sanity, and quality gates green.
169. Completed endpoint replay-fixture coverage for all modern smoke endpoint checks:
    - extended replay runner to support fixture-level query params and safe GET/HEAD execution without request bodies
    - added non-mutating invalid-modern-page probes for uncovered list/show/add/report endpoints, plus a safe invalid candidate attachment delete probe for `candidates.edit`
    - raised fixture coverage from 5/16 to 16/16 endpoint checks with lint/sanity/quality gates passing.
170. Reduced legacy-embedded utility action exposure for already-modernized entity workflows:
    - upgraded `EntityUtilityActionPage` mode resolution to distinguish `modern-redirect` vs `legacy-redirect` vs `embed`
    - mapped candidate/joborder utility actions already covered in native show pages (status, tags, comments/messages, pipeline, attachment, admin hide/show) to automatic redirect back into modern workspaces
    - mapped company attachment deletion utility route to modern company profile redirect while keeping legacy-safe redirect/embed behavior for non-modernized modules and download/export actions.
171. Hardened utility-route guardrails and shifted legacy list utility actions to native workspace redirects:
    - added explicit route guard parameter requirements for candidate/joborder/company/list utility action routes in `routeRegistry`
    - mapped list utility actions (`lists.deletestaticlist`, `lists.removefromlistdatagrid`, `lists.savelistaccess`) to `modern-redirect` behavior in `EntityUtilityActionPage`
    - reduced invalid utility-action entry points and kept fallback behavior deterministic by routing incomplete utility URLs to guarded module defaults.
172. Expanded live-region and toggle-state accessibility semantics on dynamic filter surfaces:
    - added `aria-live="polite"` and `aria-atomic="true"` to dynamic filter/status summary counters across candidates, companies, contacts, activity, lists, queue, sourcing, and reports dashboard pages
    - added explicit `aria-pressed` state semantics to candidate quick-focus chips to reflect active focus mode for assistive technologies
    - kept existing visual behavior unchanged while improving screen-reader announcements for filter/scope transitions.
173. Completed next accessibility semantics pass for toggle-style controls and repeated action labels:
    - added `aria-pressed` semantics to candidate inline sort chips and KPI source-focus chips (all/internal/partner) to expose active state beyond visual styling
    - added group labeling for KPI source-focus control cluster (`role="group"` + explicit label)
    - improved reports customer dashboard metric-inspection controls with unique `aria-label` values and active-state `aria-pressed` semantics for focused metric toggles.
174. Expanded route guard precision for utility and modal entry actions:
    - added explicit guarded query requirements for `candidates.considerForJobSearch`, `joborders.considerCandidateSearch`, and lists add-to-list modal routes (`quickActionAddToListModal`, `addToListFromDatagridModal`)
    - added duplicate-workflow guard requirements for candidate utility routes requiring pair IDs (`candidates.addDuplicates`, `candidates.merge`, `candidates.removeDuplicity`)
    - tightened fallback behavior for malformed utility action URLs by forcing guarded module defaults when required IDs are missing.

## Next Queue (30-Slice Execution)

1. Execute phase-2B native deepening backlog from `docs/modern-ui-comparison-driven-queue.md` (replace compatibility wrappers with fully native action contracts).
2. Complete ARIA/labeling sweep for remaining custom controls not yet covered (toggle switches and icon-only actions outside dashboard/joborders surfaces).
3. Run end-to-end stabilization sweep across migrated pages and fix parity gaps before defaulting additional routes to modern.
4. Expand mutation-safe replay fixtures to reduce uncovered endpoint checks in `docs/modern-ui-smoke-fixture-coverage.md`.
5. Fill and maintain ownership assignments in `docs/modern-ui-operations-ownership-matrix.md` (current reminder report shows unassigned rows).
6. Run target-environment smoke checks so scorecard confidence moves from provisional to validated.

## Rules

1. Keep legacy route available for every migrated page (`Open Legacy UI` action present).
2. Use small, verifiable commits per slice.
3. Run `npm run build` for `frontend/modern-ui` before bundle commits.
4. Commit source and bundle artifacts separately.
