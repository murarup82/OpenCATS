# Bridge Wildcard Retirement Check

Generated: 2026-04-01T13:52:15.063Z
Status: **Pass**
Strict mode: disabled (global *.* bridge tolerated)
Override: disabled

## Wildcard Route Mappings

| Route Pattern | Component |
| --- | --- |
| `logs.*` | `LogsPage` |
| `*.*` | `ModuleBridgePage` |

## Blocking Findings

- `*.*` still maps to `ModuleBridgePage` (allowed while strict mode is disabled).
