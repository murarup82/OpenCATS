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

## Next Queue

1. Move remaining candidate/joborder profile actions (remaining legacy utility workflows and advanced forms) from popup/form-post flows to native mutation + optimistic refresh patterns.
2. Introduce native modal shells for add-to-job-order workflows (candidate list/show) with modern filtering controls and async submit.
3. Replace remaining confirmation `window.confirm/prompt` flows on list/dashboard actions with native inline modal components for consistent UX/state handling.

## Rules

1. Keep legacy route available for every migrated page (`Open Legacy UI` action present).
2. Use small, verifiable commits per slice.
3. Run `npm run build` for `frontend/modern-ui` before bundle commits.
4. Commit source and bundle artifacts separately.
