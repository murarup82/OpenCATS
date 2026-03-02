# Modern UI Remaining Queue (Comparison Driven)

Source: `docs/modern-ui-legacy-route-gap-report.md`  
Generated from latest comparison snapshot: `2026-03-02T03:57:04.527Z`

## Snapshot

- Legacy `handleRequest` actions discovered: `223`
- Native explicit route coverage: `18`
- Native default fallback: `1`
- Bridge fallback: `204`
- In-scope bridged/fallback actions (core modernization modules): `80`

## In-Scope Gaps By Module

- `candidates`: 24
- `joborders`: 20
- `reports`: 10
- `companies`: 7
- `contacts`: 7
- `lists`: 7
- `calendar`: 4
- `dashboard`: 1

## Execution Queue (30 Tasks)

1. `P0` Add explicit route handling for `dashboard.setPipelineStatus` and keep mutation response parity.
2. `P0` Calendar native create-event flow for `calendar.addEvent` (modal + async save + inline refresh).
3. `P0` Calendar native edit-event flow for `calendar.editEvent` with in-place update.
4. `P0` Calendar native delete-event flow for `calendar.deleteEvent` with confirmation modal parity.
5. `P0` Calendar explicit data-feed parity for `calendar.dynamicData` with stable modern-json contract.
6. `P0` Candidates search parity for `candidates.search` (native filter/search surface parity with legacy behavior).
7. `P0` Candidates resume parity for `candidates.viewResume` (native preview modal + fallback).
8. `P0` Candidates questionnaire parity for `candidates.show_questionnaire` (native embed/view consistency).
9. `P0` Candidates pipeline-add parity for `candidates.addToPipeline` (native flow defaults + status-on-add parity).
10. `P0` Candidates pipeline-remove parity for `candidates.removeFromPipeline` (native reason capture + optimistic refresh).
11. `P0` Candidates status-change parity for `candidates.addActivityChangeStatus` (quick + full-form parity).
12. `P0` Candidates message/comment endpoint parity review (`postMessage`, `deleteMessageThread`, `addProfileComment`) with explicit contracts.
13. `P0` Candidates attachment endpoint parity review (`createAttachment`, `deleteAttachment`) and error-state consistency.
14. `P1` Candidates admin/tag/source utility parity (`administrativeHideShow`, `addCandidateTags`, `saveSources`) through native controls.
15. `P1` Candidates duplicate workflows parity (`linkDuplicate`, `merge`, `mergeInfo`, `removeDuplicity`, `addDuplicates`) with bridge-safe native wrappers.
16. `P1` Companies add/edit form modernization (`companies.add`, `companies.edit`) with explicit native/bridge decision per form section.
17. `P1` Companies list/search parity (`companies.search`) and filter behavior alignment.
18. `P1` Companies attachment/delete/internal postings parity (`createAttachment`, `deleteAttachment`, `delete`, `internalPostings`).
19. `P1` Contacts add/edit modernization (`contacts.add`, `contacts.edit`) with form parity checklist.
20. `P1` Contacts utility parity (`addActivityScheduleEvent`, `downloadVCard`, `showColdCallList`, `delete`, `search`).
21. `P1` Job orders search parity (`joborders.search`) aligned with current list filters and URL state.
22. `P1` Job orders pipeline parity (`addToPipeline`, `removeFromPipeline`, `addActivityChangeStatus`, `pipelineStatusDetails`, `pipelineStatusEditDate`).
23. `P1` Job orders message/comment parity (`postMessage`, `deleteMessageThread`, `addProfileComment`) with explicit endpoint contracts.
24. `P1` Job orders attachment/admin parity (`createAttachment`, `deleteAttachment`, `administrativeHideShow`, `delete`).
25. `P1` Job orders assignment/recruiter parity (`considerCandidateSearch`, `setMonitoredJobOrder`, `recruiterAllocation`, `setCandidateJobOrder`).
26. `P1` Job orders add-popup parity cleanup (`addJobOrderPopup`, `addCandidateModal`) into modern modal patterns.
27. `P1` Lists parity for mutation/ACL actions (`addToListFromDatagridModal`, `quickActionAddToListModal`, `removeFromListDatagrid`, `deleteStaticList`, `saveListAccess`).
28. `P1` Lists detail parity (`show`, `showList`) as native page or dedicated modern bridge workspace.
29. `P1` Reports launcher-to-report parity (`showHireReport`, `showPlacementReport`, `showSubmissionReport`, `graphView`) with modern navigation shell.
30. `P1` Reports customization/export parity (`customerDashboard`, `customerDashboardDetails`, `customizeEEOReport`, `customizeJobOrderReport`, `generateEEOReportPreview`, `generateJobOrderReportPDF`).

## Post-Queue Module Waves (Still Bridge-Only)

- `settings` (58 actions): full modernization wave required.
- `home` (23 actions): workspace/inbox/notes wave required.
- `import` (15 actions): import tooling wave required.
- `toolbar` (8 actions), `login` (7 actions), `graphs` (5 actions): targeted modernization or hard bridge retention decision.
- `export`, `gdpr`, `attachments`, `kpis`, `rss`, `wizard`, `xml`: keep bridge unless product asks for native parity.

## Notes

- Comparison identifies route/action coverage gaps, not only visible page gaps.
- Some bridged actions are endpoint-style operations already used by native pages; they still need explicit contract coverage and parity checks.
- Completion criteria for each queue task:
  - explicit route/contract mapping or intentional bridge retention documented
  - UI control parity validated against legacy behavior
  - included in smoke/parity evidence artifacts.
