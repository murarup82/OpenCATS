# Bridge Wildcard Retirement Check

Generated: 2026-03-23T16:01:11.623Z
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
