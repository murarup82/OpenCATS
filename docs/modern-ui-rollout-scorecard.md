# Modern UI Rollout Scorecard

Use this scorecard during go-live decisions for switching default mode from `hybrid` to `modern`.

## Scoring Model

- Each criterion is scored `0` (Fail), `1` (Partial), or `2` (Pass).
- Suggested production gate: **minimum 18 / 20**, with no `0` in Critical criteria.

## Criteria

| # | Criterion | Critical | Score (0-2) | Evidence |
| --- | --- | --- | --- | --- |
| 1 | Frontend build (`npm run build`) | Yes |  |  |
| 2 | Coverage matrix generated/reviewed (`npm run coverage:matrix`) | No |  |  |
| 3 | Route smoke in target env (`npm run smoke:routes`) | Yes |  |  |
| 4 | Endpoint smoke in target env (`npm run smoke:endpoints`) | Yes |  |  |
| 5 | Sanity report generated (`npm run sanity:modern`) | No |  |  |
| 6 | Route-resolution telemetry shows acceptable native/bridge ratio | Yes |  |  |
| 7 | Parity checklist completed for impacted modules | Yes |  |  |
| 8 | Accessibility spot-check completed (keyboard + focus + ARIA) | Yes |  |  |
| 9 | Rollback path validated (flag/config + runbook) | Yes |  |  |
| 10 | Stakeholder/UAT sign-off | Yes |  |  |

## Decision

| Outcome | Rule |
| --- | --- |
| Go | Score >= 18 and no Critical criterion scored `0`. |
| Hold | Score 14-17 or any Critical criterion scored `0`. |
| No-Go | Score < 14. |

## Notes

- Record links to generated artifacts:
  - `docs/modern-ui-route-coverage.md`
  - `docs/modern-ui-sanity-report.md`
  - `docs/modern-ui-parity-checklist.md`
  - `docs/modern-ui-compat-deprecation-tracker.md`
