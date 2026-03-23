# Modern UI Unexpected Legacy Redirect Guard

Generated: 2026-03-23T12:43:42.608Z

This guard tracks runtime `window.location.assign/replace` redirects that target legacy URLs.

## Totals

- Redirect findings: 12
- Expected legacy-redirect pages: 10
- Unexpected redirect findings: 0
- Expected pages without redirect findings: 0

## Redirect Findings

| File | Line | Method | Argument Preview | Status |
| --- | ---: | --- | --- | --- |
| `src/pages/ContactVCardActionPage.tsx` | 39 | `assign` | `legacyDownloadURL` | Expected |
| `src/pages/ImportWorkflowActionPage.tsx` | 177 | `replace` | `redirectURL` | Expected |
| `src/pages/ImportWorkflowActionPage.tsx` | 193 | `assign` | `legacyURL` | Expected |
| `src/pages/ImportWorkflowActionPage.tsx` | 203 | `assign` | `legacyURL` | Expected |
| `src/pages/LegacyDownloadForwardActionPage.tsx` | 41 | `assign` | `legacyURL` | Expected |
| `src/pages/LoginLegacyActionPage.tsx` | 16 | `replace` | `legacyURL` | Expected |
| `src/pages/OperationsWorkspaceActionPage.tsx` | 140 | `assign` | `legacyURL` | Expected |
| `src/pages/PipelineStatusActionPage.tsx` | 165 | `assign` | `ensureUIURL(decodeLegacyURL(details.actions.legacyDetailsURL), 'legacy')` | Expected |
| `src/pages/ReportsJobOrderPdfActionPage.tsx` | 24 | `assign` | `legacyURL` | Expected |
| `src/pages/ReportsWorkflowActionPage.tsx` | 169 | `assign` | `legacyURL` | Expected |
| `src/pages/SettingsTagsActionPage.tsx` | 42 | `assign` | `legacyURL` | Expected |
| `src/pages/UtilityEndpointForwardActionPage.tsx` | 86 | `assign` | `legacyURL` | Expected |

## Unexpected Findings

None.

## Expected Pages Without Findings

None.
