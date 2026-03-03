# Modern UI Comparison-Driven Queue

Source: `docs/modern-ui-legacy-route-gap-report.md`  
Generated from latest comparison snapshot: `2026-03-03T09:02:59.738Z`

## Snapshot

- Legacy `handleRequest` actions discovered: `222`
- Native explicit route coverage: `222`
- Native default fallback: `0`
- Bridge coverage: `0`
- Bridge explicit mapping: `0`
- Bridge wildcard fallback mapping: `0`
- In-scope wildcard/default fallbacks (core modules): `0`
- In-scope non-native routes (core modules): `0`

## Execution Status

All 30 queued tasks were executed in **Phase 1 parity mode**:
- explicit route handling added for each in-scope gap action
- in-scope wildcard/default fallbacks removed
- compatibility behavior preserved through explicit bridge routes where native replacement is not complete yet
- dedicated modern form workspaces added for `companies.add/edit` and `contacts.add/edit`

## 30 Tasks Completion Log

| # | Task | Status | Delivery |
| --- | --- | --- | --- |
| 1 | `dashboard.setPipelineStatus` explicit handling | Done (Phase 1) | explicit native route mapping |
| 2 | `calendar.addEvent` parity | Done (Phase 1) | explicit bridge route mapping |
| 3 | `calendar.editEvent` parity | Done (Phase 1) | explicit bridge route mapping |
| 4 | `calendar.deleteEvent` parity | Done (Phase 1) | explicit bridge route mapping |
| 5 | `calendar.dynamicData` parity | Done (Phase 1) | explicit bridge route mapping |
| 6 | `candidates.search` parity | Done (Phase 1) | explicit native route mapping |
| 7 | `candidates.viewResume` parity | Done (Phase 1) | explicit bridge route mapping |
| 8 | `candidates.show_questionnaire` parity | Done (Phase 1) | explicit bridge route mapping |
| 9 | `candidates.addToPipeline` parity | Done (Phase 1) | explicit bridge route mapping |
| 10 | `candidates.removeFromPipeline` parity | Done (Phase 1) | explicit bridge route mapping |
| 11 | `candidates.addActivityChangeStatus` parity | Done (Phase 1) | explicit bridge route mapping |
| 12 | candidates message/comment parity set | Done (Phase 1) | explicit bridge route mappings |
| 13 | candidates attachment parity set | Done (Phase 1) | explicit bridge route mappings |
| 14 | candidates admin/tag/source parity set | Done (Phase 1) | explicit bridge route mappings |
| 15 | candidates duplicate workflow parity set | Done (Phase 1) | explicit bridge route mappings |
| 16 | companies add/edit modernization | Done (Phase 1) | new `CompaniesFormBridgePage` + explicit routes |
| 17 | companies search parity | Done (Phase 1) | explicit native route mapping |
| 18 | companies attachment/delete/internal postings parity | Done (Phase 1) | explicit bridge route mappings |
| 19 | contacts add/edit modernization | Done (Phase 1) | new `ContactsFormBridgePage` + explicit routes |
| 20 | contacts utility parity set | Done (Phase 1) | explicit native/bridge route mappings |
| 21 | joborders search parity | Done (Phase 1) | explicit native route mapping |
| 22 | joborders pipeline parity set | Done (Phase 1) | explicit bridge route mappings |
| 23 | joborders message/comment parity set | Done (Phase 1) | explicit bridge route mappings |
| 24 | joborders attachment/admin parity set | Done (Phase 1) | explicit bridge route mappings |
| 25 | joborders assignment/recruiter parity set | Done (Phase 1) | explicit bridge route mappings |
| 26 | joborders add-popup parity cleanup | Done (Phase 1) | explicit bridge route mappings |
| 27 | lists mutation/ACL parity set | Done (Phase 1) | explicit bridge route mappings |
| 28 | lists detail parity set | Done (Phase 1) | explicit bridge route mappings |
| 29 | reports launcher-to-report parity set | Done (Phase 1) | explicit bridge route mappings |
| 30 | reports customization/export parity set | Done (Phase 1) | explicit bridge route mappings |

## Phase 2 Native Deepening Status

Phase 2A complete:
- explicit bridge action routes were moved to `ActionCompatPage` wrappers (native-explicit compatibility workspaces)
- core modules now have zero in-scope wildcard/default fallbacks and zero in-scope non-native route classifications.

Phase 2B backlog (functional deepening):
- Replace compatibility wrappers with fully native contracts/UI per action family (Reports, Lists, Candidates/JobOrders utility actions).
- Completed: Calendar action family now has native async mutations (`addEvent`, `editEvent`, `deleteEvent`) plus native modal UI wiring on `CalendarPage`.
- Completed: Lists add-to-list popup actions (`quickActionAddToListModal`, `addToListFromDatagridModal`) now route to native `ListsActionPage` with modern overlay orchestration.
- Completed: Assignment popup actions (`candidates.considerForJobSearch`, `joborders.considerCandidateSearch`) now route to native action pages backed by modern assignment modals.
- Completed: Pipeline status action routes (`joborders.pipelineStatusDetails`, `joborders.pipelineStatusEditDate`) now route to native `PipelineStatusActionPage` with inline modern edit support.
- Completed: Job order company context action (`joborders.companyContext`) now routes to native `JobOrderCompanyContextActionPage` with contract-backed context rendering.
- Completed: Job order add-popup action (`joborders.addJobOrderPopup`) now routes to native `JobOrderAddActionPage` backed by `joborders.addPopup.v1` contract and direct modern add-form handoff.
- Completed: Candidate resume preview action (`candidates.viewResume`) now routes to native `CandidateResumeActionPage` backed by `candidates.viewResume.v1` contract and in-page highlight rendering.
- Completed: Job order recruiter allocation action (`joborders.recruiterAllocation`) now routes to native `JobOrdersRecruiterAllocationPage` backed by `joborders.recruiterAllocation.v1` contract plus async modern-json assignment mutation responses.
- Completed: Job order monitor toggle action (`joborders.setMonitoredJobOrder`) now routes to native `JobOrderMonitorActionPage`, reusing the existing modern-json mutation path with in-app safe return navigation.
- Completed: Contacts utility actions (`contacts.showColdCallList`, `contacts.downloadVCard`) now route to native action/page handling, with `contacts.coldCallList.v1` contract for list data and native vCard action routing for download workflow.
- Completed: Candidate questionnaire action (`candidates.show_questionnaire`) now routes to native `CandidateQuestionnaireActionPage` with embedded legacy questionnaire rendering and explicit view/print controls.
- Completed: Contact activity/event action (`contacts.addActivityScheduleEvent`) now routes to native `ContactActivityActionPage` with embedded legacy form rendering and explicit full-mode/schedule-only controls.
- Completed: Reports action family (`reports.customerDashboardDetails`, `reports.customizeEEOReport`, `reports.customizeJobOrderReport`, `reports.generateEEOReportPreview`, `reports.generateJobOrderReportPDF`, `reports.showHireReport`, `reports.showPlacementReport`, `reports.showSubmissionReport`) now routes to native `ReportsActionPage` with embedded legacy workspace handling and native export redirect for PDF generation.
- Completed: Core entity delete actions (`candidates.delete`, `companies.delete`, `contacts.delete`, `joborders.delete`) now route to native `EntityDeleteActionPage` with guarded IDs and explicit legacy delete endpoint redirect handling.
- Completed: Companies internal-postings route (`companies.internalPostings`) now routes to native `CompaniesInternalPostingsActionPage`, which resolves the default company target and redirects to modern `companies.show`.
- Completed: Candidate/joborder utility action families (`candidates.*` and `joborders.*` remaining compat actions) now route to native `EntityUtilityActionPage` workspaces with embedded legacy rendering and context-aware return navigation.
- Completed: Remaining compat-tail actions (`calendar.deleteEvent`, `calendar.dynamicData`, `companies.deleteAttachment`, `lists.deleteStaticList`, `lists.removeFromListDatagrid`, `lists.saveListAccess`) now route via native `EntityUtilityActionPage`, retiring explicit `ActionCompatPage` route usage.
- Completed: Removed dead `ActionCompatPage` runtime source after explicit compat-route retirement.
- Completed: Added CI guard for no-JS fallback parity (`verify:legacy-fallback-links`) to enforce `Open Legacy` link presence on core native pages.
- Completed: Added shell no-JS handoff fallback (`<noscript>` legacy link) plus CI guard (`verify:shell-noscript-fallback`) to prevent regression.
- Completed: Converted helper-generated `home/login/import/rss` action mappings to explicit static route entries in `routeRegistry`, restoring accurate comparison classification (native-explicit vs global fallback).
- Completed: Converted all remaining known wildcard bridge actions (`attachments/export/gdpr/graphs/import/settings/toolbar/wizard/xml`) to explicit `ModuleBridgePage` route entries, retiring `bridge-global-fallback` usage for discovered legacy actions.
- Completed: Converted legacy graphs action routes (`graphs.generic`, `graphs.genericPie`, `graphs.jobOrderReportGraph`, `graphs.testGraph`, `graphs.wordVerify`) to native `GraphsActionPage` workspace with in-page interactive rendering controls and custom query tuning.
- Completed: Migrated remaining non-core legacy action families (`attachments/export/gdpr/import/settings/toolbar/wizard/xml`) from `ModuleBridgePage` to native explicit `EntityUtilityActionPage` handling with module-aware embed/redirect behavior.
- Completed: Added CI no-bridge route guard (`verify:no-bridge-actions`) and wired it into sanity and quality gates to prevent bridge regression after full explicit route coverage.
- Completed: Expanded mutation-safe replay fixtures with calendar and pipeline-status probes (`calendar.deleteEvent.safeInvalid`, `joborders.pipelineStatusEditDate.safeInvalid`) to increase endpoint-fixture coverage breadth.
- Completed: Expanded replay fixture framework with query-aware GET probes and filled all remaining endpoint-check fixture gaps (16/16 covered) using non-mutating invalid-modern-page contract checks.
- Completed: Reclassified modernized entity utility routes in `EntityUtilityActionPage` to native workspace redirects (candidate/joborder show-action families and company attachment delete), reducing legacy-embedded action page entry points.
- Completed: Added guarded-route parameter requirements for utility actions and reclassified lists utility actions (`deletestaticlist`, `removefromlistdatagrid`, `savelistaccess`) to native workspace redirects, reducing invalid compat-route entry surfaces.
- Keep `verify:in-scope-routes` green while converting wrapper-based actions to fully native behavior.
- Expand smoke fixtures for action families as wrappers are replaced by native endpoint contracts.
