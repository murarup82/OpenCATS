# Modern UI Release Readiness Changelog Template

Use this template to track release-readiness evidence over time.

## Entry Format

| Timestamp (UTC) | Release/Slice | Commit | Quality Gate | In-Scope Fallback Rows | Scorecard Suggestion | Smoke Context | Notes / Actions |
| --- | --- | --- | --- | ---: | --- | --- | --- |
|  |  |  | Pass/Fail |  | Go/Hold/No-Go | Target env / Local-only |  |

## Required Links Per Entry

- `docs/modern-ui-quality-gate.md`
- `docs/modern-ui-legacy-route-gap-report.md`
- `docs/modern-ui-rollout-scorecard-prefill.md`
- `docs/modern-ui-cutover-evidence-links.md`
- `docs/modern-ui-deprecation-evidence-check.md`

## Interpretation Rules

- If `In-Scope Fallback Rows > 0`, cutover decision should remain `Hold` unless exception is approved.
- If smoke checks are skipped (non-target environment), mark confidence as limited and keep manual validation open.
- If quality gate fails, add incident note and rollback/mitigation action before next entry.

## Example Entry

| Timestamp (UTC) | Release/Slice | Commit | Quality Gate | In-Scope Fallback Rows | Scorecard Suggestion | Smoke Context | Notes / Actions |
| --- | --- | --- | --- | ---: | --- | --- | --- |
| 2026-03-02T04:10:00Z | Phase-1 parity wave | 33cd463 | Pass | 0 | Hold | Local-only (smoke skipped) | Proceed with phase-2 native conversion and target-env smoke validation. |
