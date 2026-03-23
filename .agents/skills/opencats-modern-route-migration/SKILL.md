---
name: opencats-modern-route-migration
description: OpenCATS route migration workflow for module.action updates that must stay aligned across routeRegistry, guarded params, React page wiring, PHP handlers, contract metadata, and legacy fallback behavior.
---

# Goal
Safely add or modify an OpenCATS modern route end-to-end without breaking compatibility, guards, or legacy escape paths.

# Use this skill when
- You are adding/changing a modern route for a specific `module.action`.
- You need coordinated updates across React route mapping, API typing, and backend contract emitters.
- You need to audit unresolved-route fallback or compatibility path behavior.

# Do not use this skill when
- Work is presentation-only with no route/contract/guard impact.
- The request is limited to isolated CSS or component-level visual changes.
- There is no route-chain or contract implication.

# Critical invariants or preserve list
- Preserve `m/a` route semantics and `routeRegistry.ts` alignment.
- Preserve guarded route param requirements.
- Preserve `modernPage`, `contractVersion=1`, and exact `contractKey` validity.
- Preserve fallback/legacy escape hatches and shell noscript behavior.
- Preserve backend permission checks and token-aware mutation model.

# Workflow
1. Identify exact route target (`module.action`) and required params.
2. Inspect page component, `routeRegistry`, route guards, API contract typing, backend action, and shell/fallback touchpoints.
3. Map current route chain end-to-end (request -> resolver -> page -> data contract -> fallback).
4. Propose minimum coordinated changes.
5. Implement frontend/backend wiring only when task scope requires both.
6. Verify fallback behavior and "Open Legacy UI" path still exist.
7. Call out smoke fixtures/checks that must be updated.

# Output format
- **Route chain summary:** current and new path.
- **Changed files:** exact list.
- **Contract and guard impact:** what changed and what stayed stable.
- **Verification steps:** commands/checks run.
- **Residual risks:** remaining migration risks and follow-ups.
