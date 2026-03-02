# Modern UI Release Runbook

Use this runbook for enabling modern UI by default and handling rollback safely.

## Pre-Release Checklist

1. Confirm latest scorecard and parity checklist are complete.
2. Run:
   - `npm run sanity:modern`
   - `npm run smoke:routes` (in target env with auth cookie)
   - `npm run smoke:endpoints` (with optional IDs for guarded routes)
3. Verify route coverage and telemetry counters are reviewed.
4. Confirm rollback owner and communication channel for incident response.

## Cutover Steps

1. Deploy latest code to target environment.
2. Update `config.ui.php`:
   - `UI_SWITCH_ENABLED = true`
   - `UI_SWITCH_DEFAULT_MODE = 'modern'`
   - `UI_SWITCH_REQUIRE_ROUTE_MATCH = true`
   - Keep `UI_SWITCH_ALLOW_POST = false` and `UI_SWITCH_ALLOW_AJAX = false` unless explicitly validated.
3. Keep legacy override path available (`ui=legacy`) during rollout window.
4. Monitor:
   - Route-resolution telemetry (`native/bridge/legacy`)
   - Smoke script outcomes
   - User-reported blockers.

## Rollback Procedure

If severe regressions occur:

1. Flip default mode to hybrid:
   - `UI_SWITCH_DEFAULT_MODE = 'hybrid'`
2. If required, disable switch entirely:
   - `UI_SWITCH_ENABLED = false`
3. Validate legacy entry routes manually (`dashboard`, `candidates`, `joborders`).
4. Announce rollback completion with incident summary and ETA for next attempt.

## Incident Triage Priorities

1. Blockers on candidate/joborder status mutations.
2. Missing critical list/show routes for recruiter daily workflows.
3. Broken modal actions that prevent save/submit flows.
4. Navigation dead-ends where legacy fallback is unavailable.

## Post-Release Validation Window

1. Track telemetry trend for `bridge` and `legacy` resolution counts.
2. Capture top failing flows and patch in small slices.
3. Re-run smoke and sanity scripts after each hotfix.
