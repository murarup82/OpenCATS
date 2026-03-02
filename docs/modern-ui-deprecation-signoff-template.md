# Compatibility Deprecation Sign-Off Template

Use this template before removing any compatibility route pattern (`*. *` or module wildcard mappings).

## Change Summary

- Route pattern:
- Target status: `Deprecate` -> `Retired`
- Planned release:
- Owner:
- Reviewer:

## Required Evidence

| Evidence | Link / Result | Status |
| --- | --- | --- |
| Route coverage matrix reviewed |  | Pending |
| Route-resolution telemetry confirms low/zero fallback hits |  | Pending |
| Parity checklist complete for affected module(s) |  | Pending |
| Smoke checks pass in target environment |  | Pending |
| Rollback path verified |  | Pending |
| Stakeholder sign-off |  | Pending |

## Risk Assessment

- User impact if regression occurs:
- Expected fallback behavior after deprecation:
- Monitoring window after release:

## Rollback Trigger

Deprecation must be reverted if:

1. Critical workflow becomes inaccessible in modern native routes.
2. Error volume spikes for affected module actions.
3. Support escalations indicate blocked recruiter operations.

## Approval

- Engineering lead:
- Product/operations lead:
- Approval timestamp:
