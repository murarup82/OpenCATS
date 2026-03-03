# Modern UI Quality Gate Report

Started: 2026-03-03T07:36:49.101Z
Finished: 2026-03-03T07:37:16.309Z
Overall Status: **Pass**

## Summary

| Check | Status | Detail |
| --- | --- | --- |
| Command: Sanity Report | Pass | 0 |
| Command: Scorecard Prefill | Pass | 0 |
| Command: Fixture Lint | Pass | 0 |
| Command: Fixture Coverage Report | Pass | 0 |
| Command: Playwright Workflow Smoke | Pass | 0 |
| Command: Legacy Route Comparison | Pass | 0 |
| Command: In-Scope Route Fallback Guard | Pass | 0 |
| Command: Bridge Wildcard Retirement Guard | Pass | 0 |
| Command: Legacy Fallback Link Guard | Pass | 0 |
| Command: Shell No-JS Fallback Guard | Pass | 0 |
| Command: Cutover Evidence Snapshot | Pass | 0 |
| Command: Deprecation Evidence Validation | Pass | 0 |
| Command: Ownership Review Reminder | Pass | 0 |
| Evidence: `docs/modern-ui-route-coverage.md` | Pass | present |
| Evidence: `docs/modern-ui-route-parity-checklist.md` | Pass | present |
| Evidence: `docs/modern-ui-bridge-wildcard-retirement.md` | Pass | present |
| Evidence: `docs/modern-ui-sanity-report.md` | Pass | present |
| Evidence: `docs/modern-ui-parity-checklist.md` | Pass | present |
| Evidence: `docs/modern-ui-rollout-scorecard.md` | Pass | present |
| Evidence: `docs/modern-ui-rollout-scorecard-prefill.md` | Pass | present |
| Evidence: `docs/modern-ui-release-runbook.md` | Pass | present |
| Evidence: `docs/modern-ui-cutover-checklist.md` | Pass | present |
| Evidence: `docs/modern-ui-cutover-evidence-links.md` | Pass | present |
| Evidence: `docs/modern-ui-deprecation-evidence-check.md` | Pass | present |
| Evidence: `docs/modern-ui-legacy-route-gap-report.md` | Pass | present |
| Evidence: `docs/modern-ui-smoke-fixture-coverage.md` | Pass | present |
| Evidence: `docs/modern-ui-telemetry-retention-guidance.md` | Pass | present |
| Evidence: `docs/modern-ui-release-readiness-changelog-template.md` | Pass | present |
| Evidence: `docs/modern-ui-keyboard-shortcuts-extension-plan.md` | Pass | present |
| Evidence: `docs/modern-ui-operations-ownership-review-reminder.md` | Pass | present |
| Evidence: `docs/modern-ui-operations-ownership-review-reminder-process.md` | Pass | present |

## Command Details

### Sanity Report (Pass)

Command: `npm.cmd run sanity:modern`

**stdout**
```text
> opencats-modern-ui@0.1.0 sanity:modern
> node ./scripts/modern-sanity-report.mjs

[modern-ui] Wrote sanity report: D:\Work\opencats\OpenCATS\docs\modern-ui-sanity-report.md
```

**stderr**
`(no output)`

### Scorecard Prefill (Pass)

Command: `npm.cmd run scorecard:prefill`

**stdout**
```text
> opencats-modern-ui@0.1.0 scorecard:prefill
> node ./scripts/prefill-rollout-scorecard.mjs

[modern-ui] Wrote rollout scorecard prefill: D:\Work\opencats\OpenCATS\docs\modern-ui-rollout-scorecard-prefill.md
```

**stderr**
`(no output)`

### Fixture Lint (Pass)

Command: `npm.cmd run fixtures:lint`

**stdout**
```text
> opencats-modern-ui@0.1.0 fixtures:lint
> node ./scripts/lint-smoke-fixtures.mjs

[fixtures:lint] OK (5 fixtures validated)
```

**stderr**
`(no output)`

### Fixture Coverage Report (Pass)

Command: `npm.cmd run fixtures:coverage`

**stdout**
```text
> opencats-modern-ui@0.1.0 fixtures:coverage
> node ./scripts/generate-smoke-fixture-coverage.mjs

[modern-ui] Wrote smoke fixture coverage report: D:\Work\opencats\OpenCATS\docs\modern-ui-smoke-fixture-coverage.md
```

**stderr**
`(no output)`

### Playwright Workflow Smoke (Pass)

Command: `npm.cmd run smoke:playwright`

**stdout**
```text
> opencats-modern-ui@0.1.0 smoke:playwright
> playwright test --config=playwright.config.mjs


Running 8 tests using 1 worker

  -  1 tests\playwright\add-edit-workflows.spec.mjs:114:5 › Modern add/edit workflow contract smoke › candidates.add modern contract
  -  2 tests\playwright\add-edit-workflows.spec.mjs:122:5 › Modern add/edit workflow contract smoke › candidates.edit modern contract
  -  3 tests\playwright\add-edit-workflows.spec.mjs:114:5 › Modern add/edit workflow contract smoke › companies.add modern contract
  -  4 tests\playwright\add-edit-workflows.spec.mjs:122:5 › Modern add/edit workflow contract smoke › companies.edit modern contract
  -  5 tests\playwright\add-edit-workflows.spec.mjs:114:5 › Modern add/edit workflow contract smoke › contacts.add modern contract
  -  6 tests\playwright\add-edit-workflows.spec.mjs:122:5 › Modern add/edit workflow contract smoke › contacts.edit modern contract
  -  7 tests\playwright\add-edit-workflows.spec.mjs:114:5 › Modern add/edit workflow contract smoke › joborders.add modern contract
  -  8 tests\playwright\add-edit-workflows.spec.mjs:122:5 › Modern add/edit workflow contract smoke › joborders.edit modern contract

  8 skipped
```

**stderr**
`(no output)`

### Legacy Route Comparison (Pass)

Command: `npm.cmd run compare:legacy-routes`

**stdout**
```text
> opencats-modern-ui@0.1.0 compare:legacy-routes
> node ./scripts/compare-legacy-modern-routes.mjs

Wrote docs\modern-ui-legacy-route-gap-report.md
Wrote docs\modern-ui-legacy-route-gap-report.json
```

**stderr**
`(no output)`

### In-Scope Route Fallback Guard (Pass)

Command: `npm.cmd run verify:in-scope-routes`

**stdout**
```text
> opencats-modern-ui@0.1.0 verify:in-scope-routes
> node ./scripts/verify-no-inscope-wildcard-fallbacks.mjs

[modern-ui] No in-scope wildcard/default fallback routes detected.
```

**stderr**
`(no output)`

### Bridge Wildcard Retirement Guard (Pass)

Command: `npm.cmd run verify:bridge-wildcards`

**stdout**
```text
> opencats-modern-ui@0.1.0 verify:bridge-wildcards
> node ./scripts/verify-bridge-wildcard-retirement.mjs

[modern-ui] Wrote bridge wildcard retirement check: D:\Work\opencats\OpenCATS\docs\modern-ui-bridge-wildcard-retirement.md
```

**stderr**
`(no output)`

### Legacy Fallback Link Guard (Pass)

Command: `npm.cmd run verify:legacy-fallback-links`

**stdout**
```text
> opencats-modern-ui@0.1.0 verify:legacy-fallback-links
> node ./scripts/verify-legacy-fallback-links.mjs

[modern-ui] Legacy fallback link coverage passed (33 pages).
```

**stderr**
`(no output)`

### Shell No-JS Fallback Guard (Pass)

Command: `npm.cmd run verify:shell-noscript-fallback`

**stdout**
```text
> opencats-modern-ui@0.1.0 verify:shell-noscript-fallback
> node ./scripts/verify-shell-noscript-fallback.mjs

[modern-ui] Shell no-JS fallback guard passed.
```

**stderr**
`(no output)`

### Cutover Evidence Snapshot (Pass)

Command: `npm.cmd run cutover:evidence`

**stdout**
```text
> opencats-modern-ui@0.1.0 cutover:evidence
> node ./scripts/generate-cutover-evidence-links.mjs

[modern-ui] Wrote cutover evidence snapshot: D:\Work\opencats\OpenCATS\docs\modern-ui-cutover-evidence-links.md
```

**stderr**
`(no output)`

### Deprecation Evidence Validation (Pass)

Command: `npm.cmd run deprecation:validate`

**stdout**
```text
> opencats-modern-ui@0.1.0 deprecation:validate
> node ./scripts/validate-deprecation-signoff.mjs

[modern-ui] Wrote deprecation evidence check: D:\Work\opencats\OpenCATS\docs\modern-ui-deprecation-evidence-check.md
```

**stderr**
`(no output)`

### Ownership Review Reminder (Pass)

Command: `npm.cmd run ownership:reminder`

**stdout**
```text
> opencats-modern-ui@0.1.0 ownership:reminder
> node ./scripts/generate-ownership-review-reminder.mjs

[modern-ui] Wrote ownership review reminder: D:\Work\opencats\OpenCATS\docs\modern-ui-operations-ownership-review-reminder.md
```

**stderr**
`(no output)`
