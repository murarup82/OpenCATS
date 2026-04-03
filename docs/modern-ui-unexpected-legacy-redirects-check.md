# Modern UI Unexpected Legacy Redirect Guard

Generated: 2026-04-03T05:58:49.163Z

This guard tracks runtime `window.location.assign/replace` redirects that target legacy URLs.

## Totals

- Redirect findings: 19
- Expected legacy-redirect pages: 18
- Unexpected redirect findings: 0
- Expected pages without redirect findings: 0

## Redirect Findings

| File | Line | Method | Argument Preview | Status |
| --- | ---: | --- | --- | --- |
| `src/pages/CandidateQuestionnaireActionPage.tsx` | 69 | `assign` | `legacyRouteURL` | Expected |
| `src/pages/CandidatesFormBridgePage.tsx` | 38 | `assign` | `legacyURL` | Expected |
| `src/pages/CandidatesWorkspaceActionPage.tsx` | 145 | `assign` | `legacyURL` | Expected |
| `src/pages/CompaniesFormBridgePage.tsx` | 38 | `assign` | `legacyURL` | Expected |
| `src/pages/ContactActivityActionPage.tsx` | 70 | `assign` | `legacyURL` | Expected |
| `src/pages/ContactsFormBridgePage.tsx` | 38 | `assign` | `legacyURL` | Expected |
| `src/pages/ContactVCardActionPage.tsx` | 39 | `assign` | `legacyDownloadURL` | Expected |
| `src/pages/ImportWorkflowActionPage.tsx` | 217 | `assign` | `legacyURL` | Expected |
| `src/pages/ImportWorkflowActionPage.tsx` | 227 | `assign` | `legacyURL` | Expected |
| `src/pages/JobOrdersFormBridgePage.tsx` | 38 | `assign` | `legacyURL` | Expected |
| `src/pages/LegacyDownloadForwardActionPage.tsx` | 41 | `assign` | `legacyURL` | Expected |
| `src/pages/LoginLegacyActionPage.tsx` | 16 | `replace` | `legacyURL` | Expected |
| `src/pages/OperationsWorkspaceActionPage.tsx` | 140 | `assign` | `legacyURL` | Expected |
| `src/pages/PipelineStatusActionPage.tsx` | 165 | `assign` | `ensureUIURL(decodeLegacyURL(details.actions.legacyDetailsURL), 'legacy')` | Expected |
| `src/pages/ReportsJobOrderPdfActionPage.tsx` | 24 | `assign` | `legacyURL` | Expected |
| `src/pages/ReportsWorkflowActionPage.tsx` | 169 | `assign` | `legacyURL` | Expected |
| `src/pages/SettingsAdminWorkspaceActionPage.tsx` | 6343 | `assign` | `legacyURL` | Expected |
| `src/pages/SettingsTagsActionPage.tsx` | 42 | `assign` | `legacyURL` | Expected |
| `src/pages/UtilityEndpointForwardActionPage.tsx` | 86 | `assign` | `legacyURL` | Expected |

## Unexpected Findings

None.

## Expected Pages Without Findings

None.
