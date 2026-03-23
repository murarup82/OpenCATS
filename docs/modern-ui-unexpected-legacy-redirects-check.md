# Modern UI Unexpected Legacy Redirect Guard

Generated: 2026-03-23T12:17:54.481Z

This guard tracks runtime `window.location.assign/replace` redirects that target legacy URLs.

## Totals

- Redirect findings: 10
- Expected legacy-redirect pages: 9
- Unexpected redirect findings: 0
- Expected pages without redirect findings: 0

## Redirect Findings

| File | Line | Method | Argument Preview | Status |
| --- | ---: | --- | --- | --- |
| `src/pages/ContactVCardActionPage.tsx` | 39 | `assign` | `legacyDownloadURL` | Expected |
| `src/pages/ImportWorkflowActionPage.tsx` | 161 | `assign` | `legacyURL` | Expected |
| `src/pages/ImportWorkflowActionPage.tsx` | 168 | `assign` | `legacyURL` | Expected |
| `src/pages/LegacyDownloadForwardActionPage.tsx` | 41 | `assign` | `legacyURL` | Expected |
| `src/pages/LoginLegacyActionPage.tsx` | 16 | `replace` | `legacyURL` | Expected |
| `src/pages/PipelineStatusActionPage.tsx` | 165 | `assign` | `ensureUIURL(decodeLegacyURL(details.actions.legacyDetailsURL), 'legacy')` | Expected |
| `src/pages/ReportsJobOrderPdfActionPage.tsx` | 24 | `assign` | `legacyURL` | Expected |
| `src/pages/ReportsWorkflowActionPage.tsx` | 99 | `assign` | `legacyURL` | Expected |
| `src/pages/SettingsTagsActionPage.tsx` | 42 | `assign` | `legacyURL` | Expected |
| `src/pages/UtilityEndpointForwardActionPage.tsx` | 86 | `assign` | `legacyURL` | Expected |

## Unexpected Findings

None.

## Expected Pages Without Findings

None.
