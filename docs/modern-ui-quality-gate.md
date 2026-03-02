# Modern UI Quality Gate Report

Started: 2026-03-02T03:52:55.625Z
Finished: 2026-03-02T03:53:07.260Z
Overall Status: **Pass**

## Summary

| Check | Status | Detail |
| --- | --- | --- |
| Command: Sanity Report | Pass | 0 |
| Command: Scorecard Prefill | Pass | 0 |
| Command: Fixture Lint | Pass | 0 |
| Command: Cutover Evidence Snapshot | Pass | 0 |
| Command: Deprecation Evidence Validation | Pass | 0 |
| Evidence: `docs/modern-ui-route-coverage.md` | Pass | present |
| Evidence: `docs/modern-ui-sanity-report.md` | Pass | present |
| Evidence: `docs/modern-ui-parity-checklist.md` | Pass | present |
| Evidence: `docs/modern-ui-rollout-scorecard.md` | Pass | present |
| Evidence: `docs/modern-ui-rollout-scorecard-prefill.md` | Pass | present |
| Evidence: `docs/modern-ui-release-runbook.md` | Pass | present |
| Evidence: `docs/modern-ui-cutover-checklist.md` | Pass | present |
| Evidence: `docs/modern-ui-cutover-evidence-links.md` | Pass | present |
| Evidence: `docs/modern-ui-deprecation-evidence-check.md` | Pass | present |

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
