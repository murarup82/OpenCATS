# Compatibility Route Deprecation Tracker

Track bridge/legacy dependencies before retiring compatibility routes.

## Status Legend

- `Keep`: route still required in compatibility mode.
- `Candidate`: parity appears complete; needs validation cycle.
- `Deprecate`: approved for retirement behind release gate.
- `Retired`: removed from modern route fallback mapping.

## Module Route Tracker

| Module Route Pattern | Current Fallback | Status | Preconditions |
| --- | --- | --- | --- |
| `candidates.*` | `ModuleBridgePage` | Keep | Validate add/edit edge flows + no-JS fallback path. |
| `joborders.*` | `ModuleBridgePage` | Keep | Validate add/edit full parity + recruiter allocation utility paths. |
| `companies.*` | `ModuleBridgePage` | Keep | Validate all company utility actions in native/embedded flows. |
| `contacts.*` | `ModuleBridgePage` | Keep | Validate schedule/log activity and list utilities in native flow. |
| `activity.*` | `ModuleBridgePage` | Candidate | Confirm all date/view action variants are covered by native page. |
| `activities.*` | `ModuleBridgePage` | Candidate | Confirm alias routes are no longer called in production logs. |
| `calendar.*` | `ModuleBridgePage` | Keep | Validate all calendar drill-down actions and legacy edit paths. |
| `lists.*` | `ModuleBridgePage` | Keep | Validate list detail/edit/delete variants outside listByView. |
| `reports.*` | `ModuleBridgePage` | Keep | Validate specialized reports and export formats. |
| `home.*` | `ModuleBridgePage` | Keep | Validate all home/utility actions remain accessible. |
| `*.*` | `ModuleBridgePage` | Keep | Safety net; retire last after full telemetry confidence. |

## Retirement Workflow

1. Mark route pattern as `Candidate`.
2. Run `npm run sanity:modern` and complete parity checklist validation for affected module.
3. Validate no critical fallback hits in telemetry/logs for agreed monitoring window.
4. Change route status to `Deprecate`, schedule release, and document rollback path.
5. Remove fallback mapping from `routeRegistry` and set status to `Retired`.

## Rollback Rule

If a removed route causes a production blocker, reintroduce the pattern immediately as `ModuleBridgePage` fallback and reopen parity validation.
