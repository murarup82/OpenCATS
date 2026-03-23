# Modern UI Sanity Report

Started: 2026-03-23T13:17:46.987Z
Finished: 2026-03-23T13:18:10.564Z
Overall Required Status: **Pass**

## Summary

| Check | Status | Required | Exit Code |
| --- | --- | --- | --- |
| Frontend Build | Pass | Yes | 0 |
| Coverage Matrix | Pass | Yes | 0 |
| Route Parity Checklist | Pass | Yes | 0 |
| Bridge Wildcard Retirement | Pass | Yes | 0 |
| No-Bridge Action Guard | Pass | Yes | 0 |
| Unexpected Legacy Redirect Guard | Pass | Yes | 0 |
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
[32m✓[39m 160 modules transformed.
rendering chunks...
[2m../../public/modern-ui/build/[22m[32m.vite/manifest.json  [39m[1m[2m    0.20 kB[22m[1m[22m
[2m../../public/modern-ui/build/[22m[35mstyle.css            [39m[1m[2m  362.62 kB[22m[1m[22m
[2m../../public/modern-ui/build/[22m[36mapp.bundle.js        [39m[1m[33m1,863.74 kB[39m[22m[2m │ map: 6,971.81 kB[22m
[32m✓ built in 11.03s[39m
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

### Unexpected Legacy Redirect Guard (Pass)

Command: `npm run verify:no-unexpected-legacy-redirects`

**stdout**
```text
> opencats-modern-ui@0.1.0 verify:no-unexpected-legacy-redirects
> node ./scripts/verify-no-unexpected-legacy-redirects.mjs

[modern-ui] Wrote unexpected legacy redirect guard report: D:\Work\opencats\OpenCATS\docs\modern-ui-unexpected-legacy-redirects-check.md
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


Running 56 tests using 1 worker

  -   1 tests\playwright\add-edit-workflows.spec.mjs:114:5 › Modern add/edit workflow contract smoke › candidates.add modern contract
  -   2 tests\playwright\add-edit-workflows.spec.mjs:122:5 › Modern add/edit workflow contract smoke › candidates.edit modern contract
  -   3 tests\playwright\add-edit-workflows.spec.mjs:114:5 › Modern add/edit workflow contract smoke › companies.add modern contract
  -   4 tests\playwright\add-edit-workflows.spec.mjs:122:5 › Modern add/edit workflow contract smoke › companies.edit modern contract
  -   5 tests\playwright\add-edit-workflows.spec.mjs:114:5 › Modern add/edit workflow contract smoke › contacts.add modern contract
  -   6 tests\playwright\add-edit-workflows.spec.mjs:122:5 › Modern add/edit workflow contract smoke › contacts.edit modern contract
  -   7 tests\playwright\add-edit-workflows.spec.mjs:114:5 › Modern add/edit workflow contract smoke › joborders.add modern contract
  -   8 tests\playwright\add-edit-workflows.spec.mjs:122:5 › Modern add/edit workflow contract smoke › joborders.edit modern contract
  -   9 tests\playwright\candidates-workspace-actions.spec.mjs:42:3 › Candidates workspace action smoke › candidates.merge ui=modern mounts without a runtime boundary
  -  10 tests\playwright\candidates-workspace-actions.spec.mjs:60:3 › Candidates workspace action smoke › candidates.savesources ui=modern mounts without a runtime boundary
  -  11 tests\playwright\gdpr-consent-visual.spec.mjs:56:3 › GDPR consent visual snapshots › invalid-link state
  -  12 tests\playwright\gdpr-consent-visual.spec.mjs:70:5 › GDPR consent visual snapshots › active state
  -  13 tests\playwright\gdpr-consent-visual.spec.mjs:70:5 › GDPR consent visual snapshots › accepted state
  -  14 tests\playwright\gdpr-consent-visual.spec.mjs:70:5 › GDPR consent visual snapshots › declined state
  -  15 tests\playwright\gdpr-consent-visual.spec.mjs:70:5 › GDPR consent visual snapshots › expired state
  -  16 tests\playwright\graphs-workspace-actions.spec.mjs:42:3 › Graphs workspace action smoke › graphs.generic ui=modern mounts without a runtime boundary
  -  17 tests\playwright\graphs-workspace-actions.spec.mjs:54:3 › Graphs workspace action smoke › graphs.wordverify ui=modern mounts without a runtime boundary
  -  18 tests\playwright\import-workflow-actions.spec.mjs:89:3 › Import workflow route smoke › import.viewpending ui=modern mounts without a runtime boundary
  -  19 tests\playwright\import-workflow-actions.spec.mjs:101:3 › Import workflow route smoke › import.viewerrors ui=modern forwards without an iframe
  -  20 tests\playwright\import-workflow-actions.spec.mjs:118:3 › Import workflow route smoke › import.revert ui=modern mounts without a runtime boundary and no iframe
  -  21 tests\playwright\import-workflow-actions.spec.mjs:143:3 › Import workflow route smoke › import.revert modern-json returns the import.revert.v1 contract
  -  22 tests\playwright\import-workflow-actions.spec.mjs:170:3 › Import workflow route smoke › import.deletebulkresumes ui=modern mounts without a runtime boundary and no iframe
  -  23 tests\playwright\import-workflow-actions.spec.mjs:190:3 › Import workflow route smoke › import.deleteBulkResumes modern-json returns the import.deleteBulkResumes.v1 contract
  -  24 tests\playwright\import-workflow-actions.spec.mjs:221:3 › Import workflow route smoke › import.importbulkresumes ui=modern forwards without a runtime boundary and no iframe
  -  25 tests\playwright\import-workflow-actions.spec.mjs:241:3 › Import workflow route smoke › import.importBulkResumes modern-json returns the import.bulkResumes.v1 contract
  -  26 tests\playwright\import-workflow-advanced-actions.spec.mjs:42:3 › Import workflow advanced route smoke › import.massimport ui=modern mounts without a runtime boundary
  -  27 tests\playwright\import-workflow-advanced-actions.spec.mjs:54:3 › Import workflow advanced route smoke › import.massimportdocument ui=modern mounts without a runtime boundary
  -  28 tests\playwright\operations-workspace-actions.spec.mjs:60:3 › Operations workspace action smoke › joborders.edithiringplan ui=modern forwards without an iframe
  -  29 tests\playwright\operations-workspace-actions.spec.mjs:83:3 › Operations workspace action smoke › settings.previewpagetop ui=modern forwards without an iframe
  -  30 tests\playwright\operations-workspace-actions.spec.mjs:102:3 › Operations workspace action smoke › gdpr.requests ui=modern mounts and returns the gdpr.requests.v1 contract
  -  31 tests\playwright\pipeline-matrix-runtime.spec.mjs:46:3 › Pipeline matrix runtime smoke › joborders.pipelineMatrix modern contract
  -  32 tests\playwright\pipeline-matrix-runtime.spec.mjs:66:3 › Pipeline matrix runtime smoke › pipeline matrix route mounts without runtime boundary
  -  33 tests\playwright\reports-workflow-actions.spec.mjs:42:3 › Reports workflow action smoke › reports.showhirereport ui=modern exposes an explicit legacy fallback before redirecting
  -  34 tests\playwright\reports-workflow-actions.spec.mjs:64:3 › Reports workflow action smoke › reports.customizejoborderreport ui=modern exposes an explicit legacy fallback before redirecting
  -  35 tests\playwright\reports-workflow-actions.spec.mjs:85:3 › Reports workflow action smoke › reports.generatejoborderreportpdf ui=modern forwards to the legacy download endpoint
  -  36 tests\playwright\reports-workflow-actions.spec.mjs:101:3 › Reports workflow action smoke › reports.showPlacementReport ui=modern exposes an explicit legacy fallback before redirecting
  -  37 tests\playwright\reports-workflow-actions.spec.mjs:121:3 › Reports workflow action smoke › reports.showSubmissionReport ui=modern exposes an explicit legacy fallback before redirecting
  -  38 tests\playwright\settings-admin-workspace-actions.spec.mjs:60:3 › Settings admin workspace action smoke › settings.administration modern-json returns the settings.administration.v1 contract
  -  39 tests\playwright\settings-admin-workspace-actions.spec.mjs:71:3 › Settings admin workspace action smoke › settings.myprofile modern-json returns the settings.myprofile.v1 contract
  -  40 tests\playwright\settings-admin-workspace-actions.spec.mjs:83:3 › Settings admin workspace action smoke › settings.myprofile?s=changePassword modern-json returns the settings.myprofile.changePassword.v1 contract
  -  41 tests\playwright\settings-admin-workspace-actions.spec.mjs:102:3 › Settings admin workspace action smoke › settings.administration ui=modern mounts without a runtime boundary
  -  42 tests\playwright\settings-admin-workspace-actions.spec.mjs:116:3 › Settings admin workspace action smoke › settings.myprofile ui=modern mounts without a runtime boundary
  -  43 tests\playwright\settings-admin-workspace-actions.spec.mjs:129:3 › Settings admin workspace action smoke › settings.manageusers ui=modern mounts without a runtime boundary
  -  44 tests\playwright\settings-admin-workspace-actions.spec.mjs:146:3 › Settings admin workspace action smoke › settings.emailtemplates ui=modern forwards without an iframe
  -  45 tests\playwright\settings-admin-workspace-actions.spec.mjs:163:3 › Settings admin workspace action smoke › settings.myprofile?s=changePassword ui=modern mounts without a runtime boundary
  -  46 tests\playwright\settings-platform-workspace-actions.spec.mjs:42:3 › Settings platform workspace action smoke › settings.careerportalsettings ui=modern forwards without an iframe
  -  47 tests\playwright\settings-platform-workspace-actions.spec.mjs:59:3 › Settings platform workspace action smoke › settings.createbackup ui=modern forwards without an iframe
  -  48 tests\playwright\settings-platform-workspace-actions.spec.mjs:76:3 › Settings platform workspace action smoke › settings.rolepagepermissions ui=modern forwards without an iframe
  -  49 tests\playwright\settings-platform-workspace-actions.spec.mjs:93:3 › Settings platform workspace action smoke › settings.schemamigrations ui=modern forwards without an iframe
  -  50 tests\playwright\settings-wizard-actions.spec.mjs:80:3 › Settings wizard action smoke › settings.ajax_wizardImport modern-json GET returns mutation-like JSON
  -  51 tests\playwright\settings-wizard-actions.spec.mjs:92:3 › Settings wizard action smoke › settings.ajax_wizardCheckKey rejects an intentionally invalid key with modern-json GET
  -  52 tests\playwright\settings-wizard-actions.spec.mjs:107:3 › Settings wizard action smoke › settings.ajax_wizardImport ui=modern mounts without a runtime boundary
  -  53 tests\playwright\utility-endpoint-forward-actions.spec.mjs:42:3 › Utility endpoint forward action smoke › calendar.dynamicdata ui=modern mounts without a runtime boundary
  -  54 tests\playwright\utility-endpoint-forward-actions.spec.mjs:54:3 › Utility endpoint forward action smoke › wizard.ajax_getpage ui=modern mounts without a runtime boundary
  -  55 tests\playwright\utility-forward-actions.spec.mjs:40:3 › Utility forward route smoke › xml.jobOrders ui=modern mounts without a runtime boundary
  -  56 tests\playwright\utility-forward-actions.spec.mjs:52:3 › Utility forward route smoke › settings.ajax_tags_add ui=modern mounts without a runtime boundary

  56 skipped
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
