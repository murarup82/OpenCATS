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
| `candidates.*` | `*.* -> ModuleBridgePage` | Retired | Parity sign-off complete (`docs/modern-ui-deprecation-signoff.md`). |
| `joborders.*` | `*.* -> ModuleBridgePage` | Retired | Parity sign-off complete (`docs/modern-ui-deprecation-signoff.md`). |
| `companies.*` | `*.* -> ModuleBridgePage` | Retired | Parity sign-off complete (`docs/modern-ui-deprecation-signoff.md`). |
| `contacts.*` | `*.* -> ModuleBridgePage` | Retired | Parity sign-off complete (`docs/modern-ui-deprecation-signoff.md`). |
| `activity.*` | `*.* -> ModuleBridgePage` | Retired | Parity sign-off complete (`docs/modern-ui-deprecation-signoff.md`). |
| `activities.*` | `*.* -> ModuleBridgePage` | Retired | Alias wildcard removed; global fallback remains. |
| `calendar.*` | `*.* -> ModuleBridgePage` | Retired | Parity sign-off complete (`docs/modern-ui-deprecation-signoff.md`). |
| `lists.*` | `*.* -> ModuleBridgePage` | Retired | Native list pages + route parity checklist completed. |
| `reports.*` | `*.* -> ModuleBridgePage` | Retired | Native launcher/dashboard/graph coverage completed. |
| `home.*` | `*.* -> ModuleBridgePage` | Retired | Native home pages + explicit action compat coverage completed. |
| `kpis.*` | `*.* -> ModuleBridgePage` | Retired | Native KPI default/detail pages available. |
| `sourcing.*` | `*.* -> ModuleBridgePage` | Retired | Native sourcing default page available. |
| `queue.*` | `*.* -> ModuleBridgePage` | Retired | Native queue default page available. |
| `graphs.*` | `*.* -> ModuleBridgePage` | Retired | Native graphs default page available. |
| `rss.*` | `*.* -> ModuleBridgePage` | Retired | Legacy redirect/compat path covered by global fallback. |
| `careers.*` | `*.* -> ModuleBridgePage` | Retired | Legacy-only path covered by global fallback. |
| `wizard.*` | `*.* -> ModuleBridgePage` | Retired | Legacy-only path covered by global fallback. |
| `tests.*` | `*.* -> ModuleBridgePage` | Retired | Legacy-only path covered by global fallback. |
| `xml.*` | `*.* -> ModuleBridgePage` | Retired | Legacy-only path covered by global fallback. |
| `*.*` | `ModuleBridgePage` | Keep | Safety net; retire last after full telemetry confidence. |

## Retirement Workflow

1. Mark route pattern as `Candidate`.
2. Run `npm run sanity:modern` and complete parity checklist validation for affected module.
3. Validate no critical fallback hits in telemetry/logs for agreed monitoring window.
4. Change route status to `Deprecate`, schedule release, and document rollback path.
5. Remove fallback mapping from `routeRegistry` and set status to `Retired`.

## Rollback Rule

If a removed route causes a production blocker, reintroduce the pattern immediately as `ModuleBridgePage` fallback and reopen parity validation.
