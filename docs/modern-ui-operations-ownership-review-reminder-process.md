# Operations Ownership Review Reminder Process

This process standardizes periodic review of `modern-ui-operations-ownership-matrix.md`.

## Cadence

- Cutover window active: weekly review.
- Steady-state modernization: monthly review.

## Automation

Run:

```bash
npm run ownership:reminder
```

This generates:

- `docs/modern-ui-operations-ownership-review-reminder.md`

## Required Review Steps

1. Verify each ownership row has primary, secondary, and escalation contacts.
2. Verify command ownership aligns with current runbook/tooling.
3. Verify rollback owner is explicitly assigned.
4. Attach review output to release readiness changelog entry.
5. Re-run quality gate after ownership updates.

## Escalation

If any critical row remains unassigned for more than one review cycle, set rollout status to `Hold` until ownership is resolved.
