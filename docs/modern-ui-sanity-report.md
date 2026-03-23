# Modern UI Sanity Report

Started: 2026-03-23T06:06:07.305Z
Finished: 2026-03-23T06:06:33.944Z
Overall Required Status: **Pass**

## Summary

| Check | Status | Required | Exit Code |
| --- | --- | --- | --- |
| Frontend Build | Pass | Yes | 0 |
| Coverage Matrix | Pass | Yes | 0 |
| Route Parity Checklist | Pass | Yes | 0 |
| Bridge Wildcard Retirement | Pass | Yes | 0 |
| No-Bridge Action Guard | Pass | Yes | 0 |
| Legacy Fallback Link Guard | Pass | Yes | 0 |
| Shell No-JS Fallback Guard | Pass | Yes | 0 |
| Playwright Workflow Smoke | Pass | Yes | 0 |
| Route Smoke | Pass | No | 0 |
| Endpoint Smoke | Pass | No | 0 |

## Details

### Frontend Build (Pass)

Command: `npm run build`

**stdout**
```text
> opencats-modern-ui@0.1.0 build
> npm run clean:build && vite build --mode production


> opencats-modern-ui@0.1.0 clean:build
> node ./scripts/clean-build-output.mjs

[modern-ui] Cleaned build output directory: D:\Work\opencats\OpenCATS\public\modern-ui\build
[36mvite v5.4.21 [32mbuilding for production...[36m[39m
transforming...
[32m✓[39m 150 modules transformed.
rendering chunks...
[2m../../public/modern-ui/build/[22m[32m.vite/manifest.json  [39m[1m[2m    0.20 kB[22m[1m[22m
[2m../../public/modern-ui/build/[22m[35mstyle.css            [39m[1m[2m  357.01 kB[22m[1m[22m
[2m../../public/modern-ui/build/[22m[36mapp.bundle.js        [39m[1m[33m1,785.53 kB[39m[22m[2m │ map: 6,772.49 kB[22m
[32m✓ built in 10.89s[39m
```

**stderr**
`(no output)`

### Coverage Matrix (Pass)

Command: `npm run coverage:matrix`

**stdout**
```text
> opencats-modern-ui@0.1.0 coverage:matrix
> node ./scripts/generate-coverage-matrix.mjs

[modern-ui] Wrote route coverage matrix: D:\Work\opencats\OpenCATS\docs\modern-ui-route-coverage.md
```

**stderr**
`(no output)`

### Route Parity Checklist (Pass)

Command: `npm run parity:routes`

**stdout**
```text
> opencats-modern-ui@0.1.0 parity:routes
> node ./scripts/generate-route-parity-checklist.mjs

[modern-ui] Wrote route parity checklist: D:\Work\opencats\OpenCATS\docs\modern-ui-route-parity-checklist.md
```

**stderr**
`(no output)`

### Bridge Wildcard Retirement (Pass)

Command: `npm run verify:bridge-wildcards`

**stdout**
```text
> opencats-modern-ui@0.1.0 verify:bridge-wildcards
> node ./scripts/verify-bridge-wildcard-retirement.mjs

[modern-ui] Wrote bridge wildcard retirement check: D:\Work\opencats\OpenCATS\docs\modern-ui-bridge-wildcard-retirement.md
```

**stderr**
`(no output)`

### No-Bridge Action Guard (Pass)

Command: `npm run verify:no-bridge-actions`

**stdout**
```text
> opencats-modern-ui@0.1.0 verify:no-bridge-actions
> node ./scripts/verify-no-bridge-actions.mjs

[modern-ui] Wrote no-bridge-action guard report: D:\Work\opencats\OpenCATS\docs\modern-ui-no-bridge-actions-check.md
```

**stderr**
`(no output)`

### Legacy Fallback Link Guard (Pass)

Command: `npm run verify:legacy-fallback-links`

**stdout**
```text
> opencats-modern-ui@0.1.0 verify:legacy-fallback-links
> node ./scripts/verify-legacy-fallback-links.mjs

[modern-ui] Legacy fallback link coverage passed (33 pages).
```

**stderr**
`(no output)`

### Shell No-JS Fallback Guard (Pass)

Command: `npm run verify:shell-noscript-fallback`

**stdout**
```text
> opencats-modern-ui@0.1.0 verify:shell-noscript-fallback
> node ./scripts/verify-shell-noscript-fallback.mjs

[modern-ui] Shell no-JS fallback guard passed.
```

**stderr**
`(no output)`

### Playwright Workflow Smoke (Pass)

Command: `npm run smoke:playwright`

**stdout**
```text
> opencats-modern-ui@0.1.0 smoke:playwright
> playwright test --config=playwright.config.mjs


Running 18 tests using 1 worker

  -   1 tests\playwright\add-edit-workflows.spec.mjs:114:5 › Modern add/edit workflow contract smoke › candidates.add modern contract
  -   2 tests\playwright\add-edit-workflows.spec.mjs:122:5 › Modern add/edit workflow contract smoke › candidates.edit modern contract
  -   3 tests\playwright\add-edit-workflows.spec.mjs:114:5 › Modern add/edit workflow contract smoke › companies.add modern contract
  -   4 tests\playwright\add-edit-workflows.spec.mjs:122:5 › Modern add/edit workflow contract smoke › companies.edit modern contract
  -   5 tests\playwright\add-edit-workflows.spec.mjs:114:5 › Modern add/edit workflow contract smoke › contacts.add modern contract
  -   6 tests\playwright\add-edit-workflows.spec.mjs:122:5 › Modern add/edit workflow contract smoke › contacts.edit modern contract
  -   7 tests\playwright\add-edit-workflows.spec.mjs:114:5 › Modern add/edit workflow contract smoke › joborders.add modern contract
  -   8 tests\playwright\add-edit-workflows.spec.mjs:122:5 › Modern add/edit workflow contract smoke › joborders.edit modern contract
  -   9 tests\playwright\gdpr-consent-visual.spec.mjs:56:3 › GDPR consent visual snapshots › invalid-link state
  -  10 tests\playwright\gdpr-consent-visual.spec.mjs:70:5 › GDPR consent visual snapshots › active state
  -  11 tests\playwright\gdpr-consent-visual.spec.mjs:70:5 › GDPR consent visual snapshots › accepted state
  -  12 tests\playwright\gdpr-consent-visual.spec.mjs:70:5 › GDPR consent visual snapshots › declined state
  -  13 tests\playwright\gdpr-consent-visual.spec.mjs:70:5 › GDPR consent visual snapshots › expired state
  -  14 tests\playwright\pipeline-matrix-runtime.spec.mjs:46:3 › Pipeline matrix runtime smoke › joborders.pipelineMatrix modern contract
  -  15 tests\playwright\pipeline-matrix-runtime.spec.mjs:66:3 › Pipeline matrix runtime smoke › pipeline matrix route mounts without runtime boundary
  -  16 tests\playwright\settings-wizard-actions.spec.mjs:80:3 › Settings wizard action smoke › settings.ajax_wizardImport modern-json GET returns mutation-like JSON
  -  17 tests\playwright\settings-wizard-actions.spec.mjs:92:3 › Settings wizard action smoke › settings.ajax_wizardCheckKey rejects an intentionally invalid key with modern-json GET
  -  18 tests\playwright\settings-wizard-actions.spec.mjs:107:3 › Settings wizard action smoke › settings.ajax_wizardImport ui=modern mounts without a runtime boundary

  18 skipped
```

**stderr**
`(no output)`

### Route Smoke (Pass)

Command: `npm run smoke:routes`

**stdout**
```text
> opencats-modern-ui@0.1.0 smoke:routes
> node ./scripts/smoke-modern-routes.mjs

[modern-ui smoke] Skipped: set OPENCATS_BASE_URL (and optional OPENCATS_COOKIE) to run HTTP smoke checks.
```

**stderr**
`(no output)`

### Endpoint Smoke (Pass)

Command: `npm run smoke:endpoints`

**stdout**
```text
> opencats-modern-ui@0.1.0 smoke:endpoints
> node ./scripts/smoke-modern-endpoints.mjs

[modern-ui endpoints] Skipped: set OPENCATS_BASE_URL (and optional OPENCATS_COOKIE) to run HTTP endpoint checks.
```

**stderr**
`(no output)`
