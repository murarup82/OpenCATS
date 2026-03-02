# Hybrid to Modern Cutover Checklist

Complete this checklist before and during default-mode switch.

| Item | Owner | Target Date | Status | Notes |
| --- | --- | --- | --- | --- |
| Confirm `sanity:modern` report is green |  |  | Pending |  |
| Confirm route and endpoint smoke checks in target env |  |  | Pending |  |
| Validate parity checklist for critical modules |  |  | Pending |  |
| Review telemetry counters baseline (`native/bridge/legacy`) |  |  | Pending |  |
| Validate rollback config path (`modern -> hybrid -> disabled`) |  |  | Pending |  |
| Communicate release window to stakeholders |  |  | Pending |  |
| Enable modern as default in `config.ui.php` |  |  | Pending |  |
| Monitor first-hour incidents and route fallback metrics |  |  | Pending |  |
| Confirm no critical blockers after monitoring window |  |  | Pending |  |
| Record cutover decision and link evidence artifacts |  |  | Pending |  |

## Evidence Links

- `docs/modern-ui-cutover-evidence-links.md` (auto-generated snapshot)

- `docs/modern-ui-sanity-report.md`
- `docs/modern-ui-route-coverage.md`
- `docs/modern-ui-parity-checklist.md`
- `docs/modern-ui-rollout-scorecard.md`
- `docs/modern-ui-release-runbook.md`
