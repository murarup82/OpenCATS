---
name: opencats-legacy-bridge-audit
description: OpenCATS fallback-chain audit for ModuleBridgePage, unresolved routes, shell noscript markers, and Open Legacy UI escape hatches, with regression classification and exact fix targets.
---

# Goal
Audit and fix legacy bridge/fallback regressions without breaking route safety or migration guarantees.

# Use this skill when
- You suspect unresolved-route fallback issues.
- Bridge/parity/wildcard checks fail.
- Shell fallback behavior or legacy escape hatches appear broken.

# Do not use this skill when
- Work is strictly visual and unrelated to route resolution/fallback.
- The issue is only data rendering with valid route resolution.

# Critical invariants or preserve list
- Keep `ModuleBridgePage` and unresolved fallback chain behavior intentional.
- Preserve shell template markers and noscript legacy path.
- Preserve visible "Open Legacy UI" escape hatch behavior.
- Preserve wildcard/bridge guard expectations used by modernization checks.

# Workflow
1. Identify affected route/path and reproduce failure.
2. Inspect route resolution chain (`routeRegistry` + guard rules + fallback mapping).
3. Inspect shell template markers and legacy links.
4. Verify required "Open Legacy UI" behavior on impacted pages.
5. Classify regression: route mapping, shell fallback, guard mismatch, or fixture drift.
6. Propose exact fix points and validation checks.

# Output format
- **Fallback chain summary:** intended vs actual.
- **Regression classification:** one primary cause per issue.
- **Impacted files:** route, shell, page, or script touchpoints.
- **Exact fix targets:** minimal edits.
- **Verification checklist:** bridge/wildcard/fallback checks to rerun.
