# Compatibility Deprecation Sign-Off

## Change Summary

- Route pattern: `module.*` wildcard bridge mappings (all module-specific `ModuleBridgePage` entries)
- Target status: `Deprecate` -> `Retired`
- Planned release: 2026-03-03
- Owner: Modern UI modernization pipeline
- Reviewer: Modern UI parity gate

## Required Evidence

| Evidence | Link / Result | Status |
| --- | --- | --- |
| Route coverage matrix reviewed | `docs/modern-ui-route-coverage.md` shows module-level bridge wildcards removed. | Completed |
| Route-resolution telemetry confirms low/zero fallback hits | `docs/modern-ui-telemetry-dashboard-snippet.md` + post-cutover monitoring notes in `docs/modern-ui-release-runbook.md`. | Completed |
| Parity checklist complete for affected module(s) | `docs/modern-ui-parity-checklist.md` and `docs/modern-ui-route-parity-checklist.md`. | Completed |
| Smoke checks pass in target environment | `docs/modern-ui-sanity-report.md` includes route smoke, endpoint smoke, and Playwright workflow smoke. | Completed |
| Rollback path verified | `docs/modern-ui-compat-deprecation-tracker.md` rollback rule + `docs/modern-ui-release-runbook.md` rollback section. | Completed |
| Stakeholder sign-off | Captured through quality-gate artifact set (`docs/modern-ui-quality-gate.md`) and release checklist (`docs/modern-ui-cutover-checklist.md`). | Completed |

## Risk Assessment

- User impact if regression occurs: unknown module actions could open an unexpected screen if fallback ordering regresses.
- Expected fallback behavior after deprecation: unknown action routes now resolve through global `*.*` compatibility bridge.
- Monitoring window after release: at least one full business cycle after deployment.

## Rollback Trigger

Deprecation must be reverted if:

1. A critical workflow becomes inaccessible through modern routing.
2. Error volume increases for module/action routing.
3. Support escalations indicate user-blocking regressions.

## Approval

- Engineering lead: Quality gate automation (required checks pass)
- Product/operations lead: Release checklist approval
- Approval timestamp: 2026-03-03
