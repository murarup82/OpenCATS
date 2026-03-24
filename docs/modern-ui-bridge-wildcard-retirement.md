# Bridge Wildcard Retirement Check

Generated: 2026-03-24T05:11:16.654Z
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
