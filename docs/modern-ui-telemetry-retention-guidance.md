# Modern UI Telemetry Retention Guidance

This document defines retention policy for modern route-resolution telemetry and related rollout evidence.

## Current Implementation State

- Runtime telemetry is stored in browser `sessionStorage` under key:
  - `opencats:modern:route-resolution-counters:v1`
- Telemetry is session-scoped and reset when the browser session ends.
- Counters are emitted on `opencats:modern-route:resolution` events for live troubleshooting.

## Retention Tiers

- Tier 1: Session telemetry (current)
  - Purpose: real-time troubleshooting during active user/admin sessions.
  - Retention: browser session only.
  - Storage location: client-side `sessionStorage`.

- Tier 2: Release-window snapshot evidence (required)
  - Purpose: cutover and rollback decisions.
  - Retention: keep snapshot docs for at least 90 days after each cutover.
  - Artifacts: `modern-ui-quality-gate.md`, `modern-ui-cutover-evidence-links.md`, scorecard artifacts.

- Tier 3: Optional persisted telemetry (future)
  - Purpose: trend monitoring across sessions and weeks.
  - Retention recommendation: 30-day detailed, 90-day aggregated.
  - Privacy requirement: never store candidate names, IDs, or request payloads; store aggregate counters only.

## Operational Policy

- During cutover week:
  - Capture route telemetry snapshots at least every 2 hours.
  - Attach snapshots to release readiness changelog entries.
- During steady state:
  - Capture at least one daily snapshot until bridge-explicit routes are reduced to target threshold.

## Data Minimization and Privacy

- Keep telemetry aggregate-only (`native`, `bridge`, `legacy` counters, route key, timestamp).
- Do not persist full request URIs long-term if they may contain sensitive query params.
- If persisted telemetry is introduced, hash/normalize route signatures before storage.

## Trigger for Retention Escalation

Move from Tier 1-only to Tier 2+3 when either condition is met:

1. Modern UI becomes default mode for all users.
2. Bridge-explicit route share remains above target for more than 2 release cycles.

## Ownership

- Primary: release operations owner (see operations ownership matrix).
- Secondary: modern UI engineering owner.
