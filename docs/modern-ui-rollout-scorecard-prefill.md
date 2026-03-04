# Modern UI Rollout Scorecard (Prefilled)

Generated: 2026-03-04T05:18:30.806Z

Auto-filled total score: **15 / 20**
Suggested outcome: **Hold**

| Criterion | Critical | Score (0-2) | Evidence |
| --- | --- | --- | --- |
| Frontend build (`npm run build`) | Yes | 2 | Sanity report: Pass (exit 0) |
| Coverage matrix generated/reviewed (`npm run coverage:matrix`) | No | 2 | Sanity report: Pass (exit 0) |
| Route smoke in target env (`npm run smoke:routes`) | Yes | 2 | Sanity report: Pass (exit 0) |
| Endpoint smoke in target env (`npm run smoke:endpoints`) | Yes | 2 | Sanity report: Pass (exit 0) |
| Sanity report generated (`npm run sanity:modern`) | No | 2 | Sanity report file present. |
| Route-resolution telemetry shows acceptable native/bridge ratio | Yes | 1 | Pending manual review. |
| Parity checklist completed for impacted modules | Yes | 1 | Pending manual review. |
| Accessibility spot-check completed (keyboard + focus + ARIA) | Yes | 1 | Pending manual review. |
| Rollback path validated (flag/config + runbook) | Yes | 1 | Pending manual review. |
| Stakeholder/UAT sign-off | Yes | 1 | Pending manual review. |

## Notes

- This prefill only covers machine-derivable checks from the latest sanity report.
- Replace `Pending manual review` entries with validated evidence before final go/no-go decisions.

## Confidence Notes

- Route smoke confidence: Validated by executed check.
- Endpoint smoke confidence: Validated by executed check.
- Treat skipped smoke checks as provisional and require target-environment execution before final Go decision.