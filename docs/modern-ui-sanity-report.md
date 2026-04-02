# Modern UI Sanity Report

Started: 2026-04-02T06:37:29.875Z
Finished: 2026-04-02T06:37:46.922Z
Overall Required Status: **Fail**

## Summary

| Check | Status | Required | Exit Code |
| --- | --- | --- | --- |
| Frontend Build | Pass | Yes | 0 |
| Coverage Matrix | Pass | Yes | 0 |
| Route Parity Checklist | Pass | Yes | 0 |
| Bridge Wildcard Retirement | Pass | Yes | 0 |
| No-Bridge Action Guard | Fail | Yes | 1 |
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
[36mvite v8.0.2 [32mbuilding client environment for production...[36m[39m
[2Ktransforming...✓ 153 modules transformed.
rendering chunks...
../../public/modern-ui/build/.vite/manifest.json         0.20 kB
../../public/modern-ui/build/opencats-modern-ui.css    400.89 kB
../../public/modern-ui/build/app.bundle.js           2,091.77 kB

[32m✓ built in 2.61s[39m
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

### No-Bridge Action Guard (Fail)

Command: `npm run verify:no-bridge-actions`

**stdout**
```text
> opencats-modern-ui@0.1.0 verify:no-bridge-actions
> node ./scripts/verify-no-bridge-actions.mjs

[modern-ui] Wrote no-bridge-action guard report: D:\Work\opencats\OpenCATS\docs\modern-ui-no-bridge-actions-check.md
```

**stderr**
```text
[modern-ui] Bridge actions detected (bridge=1, bridgeExplicit=0, bridgeFallback=1, rows=1).
```

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


Running 114 tests using 1 worker

  -    1 tests\playwright\add-edit-workflows.spec.mjs:143:5 › Modern add/edit workflow contract smoke › candidates.add modern contract
  -    2 tests\playwright\add-edit-workflows.spec.mjs:151:5 › Modern add/edit workflow contract smoke › candidates.edit modern contract
  -    3 tests\playwright\add-edit-workflows.spec.mjs:143:5 › Modern add/edit workflow contract smoke › companies.add modern contract
  -    4 tests\playwright\add-edit-workflows.spec.mjs:151:5 › Modern add/edit workflow contract smoke › companies.edit modern contract
  -    5 tests\playwright\add-edit-workflows.spec.mjs:143:5 › Modern add/edit workflow contract smoke › contacts.add modern contract
  -    6 tests\playwright\add-edit-workflows.spec.mjs:151:5 › Modern add/edit workflow contract smoke › contacts.edit modern contract
  -    7 tests\playwright\add-edit-workflows.spec.mjs:143:5 › Modern add/edit workflow contract smoke › joborders.add modern contract
  -    8 tests\playwright\add-edit-workflows.spec.mjs:151:5 › Modern add/edit workflow contract smoke › joborders.edit modern contract
  -    9 tests\playwright\add-edit-workflows.spec.mjs:175:5 › Modern add/edit workflow route smoke › candidates.add ui=modern forwards without an iframe
  -   10 tests\playwright\add-edit-workflows.spec.mjs:175:5 › Modern add/edit workflow route smoke › companies.add ui=modern forwards without an iframe
  -   11 tests\playwright\add-edit-workflows.spec.mjs:175:5 › Modern add/edit workflow route smoke › contacts.add ui=modern forwards without an iframe
  -   12 tests\playwright\add-edit-workflows.spec.mjs:175:5 › Modern add/edit workflow route smoke › joborders.add ui=modern forwards without an iframe
  -   13 tests\playwright\candidate-activity-route-smoke.spec.mjs:57:3 › Candidate route smoke › candidates.show_questionnaire ui=modern forwards without an iframe
  -   14 tests\playwright\candidate-activity-route-smoke.spec.mjs:68:3 › Candidate route smoke › contacts.addActivityScheduleEvent ui=modern forwards without an iframe
  -   15 tests\playwright\candidates-workspace-actions.spec.mjs:57:3 › Candidates workspace action smoke › candidates.merge ui=modern forwards without an iframe
  -   16 tests\playwright\candidates-workspace-actions.spec.mjs:67:3 › Candidates workspace action smoke › candidates.savesources ui=modern forwards without an iframe
  -   17 tests\playwright\gdpr-consent-visual.spec.mjs:56:3 › GDPR consent visual snapshots › invalid-link state
  -   18 tests\playwright\gdpr-consent-visual.spec.mjs:70:5 › GDPR consent visual snapshots › active state
  -   19 tests\playwright\gdpr-consent-visual.spec.mjs:70:5 › GDPR consent visual snapshots › accepted state
  -   20 tests\playwright\gdpr-consent-visual.spec.mjs:70:5 › GDPR consent visual snapshots › declined state
  -   21 tests\playwright\gdpr-consent-visual.spec.mjs:70:5 › GDPR consent visual snapshots › expired state
  -   22 tests\playwright\graphs-workspace-actions.spec.mjs:42:3 › Graphs workspace action smoke › graphs.generic ui=modern mounts without a runtime boundary
  -   23 tests\playwright\graphs-workspace-actions.spec.mjs:54:3 › Graphs workspace action smoke › graphs.wordverify ui=modern mounts without a runtime boundary
  -   24 tests\playwright\import-workflow-actions.spec.mjs:89:3 › Import workflow route smoke › import.viewpending ui=modern mounts without a runtime boundary
  -   25 tests\playwright\import-workflow-actions.spec.mjs:101:3 › Import workflow route smoke › import.viewerrors ui=modern forwards without an iframe
  -   26 tests\playwright\import-workflow-actions.spec.mjs:118:3 › Import workflow route smoke › import.revert ui=modern mounts without a runtime boundary and no iframe
  -   27 tests\playwright\import-workflow-actions.spec.mjs:143:3 › Import workflow route smoke › import.revert modern-json returns the import.revert.v1 contract
  -   28 tests\playwright\import-workflow-actions.spec.mjs:170:3 › Import workflow route smoke › import.deletebulkresumes ui=modern mounts without a runtime boundary and no iframe
  -   29 tests\playwright\import-workflow-actions.spec.mjs:190:3 › Import workflow route smoke › import.deleteBulkResumes modern-json returns the import.deleteBulkResumes.v1 contract
  -   30 tests\playwright\import-workflow-actions.spec.mjs:221:3 › Import workflow route smoke › import.importbulkresumes ui=modern forwards without a runtime boundary and no iframe
  -   31 tests\playwright\import-workflow-actions.spec.mjs:241:3 › Import workflow route smoke › import.importBulkResumes modern-json returns the import.bulkResumes.v1 contract
  -   32 tests\playwright\import-workflow-advanced-actions.spec.mjs:42:3 › Import workflow advanced route smoke › import.massimport ui=modern mounts without a runtime boundary
  -   33 tests\playwright\import-workflow-advanced-actions.spec.mjs:54:3 › Import workflow advanced route smoke › import.massimportdocument ui=modern mounts without a runtime boundary
  -   34 tests\playwright\operations-workspace-actions.spec.mjs:60:3 › Operations workspace action smoke › joborders.edithiringplan ui=modern forwards without an iframe
  -   35 tests\playwright\operations-workspace-actions.spec.mjs:83:3 › Operations workspace action smoke › settings.previewpagetop ui=modern forwards without an iframe
  -   36 tests\playwright\operations-workspace-actions.spec.mjs:102:3 › Operations workspace action smoke › gdpr.requests ui=modern mounts and returns the gdpr.requests.v1 contract
  -   37 tests\playwright\pipeline-matrix-runtime.spec.mjs:46:3 › Pipeline matrix runtime smoke › joborders.pipelineMatrix modern contract
  -   38 tests\playwright\pipeline-matrix-runtime.spec.mjs:66:3 › Pipeline matrix runtime smoke › pipeline matrix route mounts without runtime boundary
  -   39 tests\playwright\reports-workflow-actions.spec.mjs:42:3 › Reports workflow action smoke › reports.showhirereport ui=modern exposes an explicit legacy fallback before redirecting
  -   40 tests\playwright\reports-workflow-actions.spec.mjs:64:3 › Reports workflow action smoke › reports.customizejoborderreport ui=modern exposes an explicit legacy fallback before redirecting
  -   41 tests\playwright\reports-workflow-actions.spec.mjs:85:3 › Reports workflow action smoke › reports.generatejoborderreportpdf ui=modern forwards to the legacy download endpoint
  -   42 tests\playwright\reports-workflow-actions.spec.mjs:101:3 › Reports workflow action smoke › reports.showPlacementReport ui=modern exposes an explicit legacy fallback before redirecting
  -   43 tests\playwright\reports-workflow-actions.spec.mjs:121:3 › Reports workflow action smoke › reports.showSubmissionReport ui=modern exposes an explicit legacy fallback before redirecting
  -   44 tests\playwright\settings-admin-workspace-actions.spec.mjs:209:3 › Settings admin workspace action smoke › settings.administration modern-json returns the settings.administration.v1 contract
  -   45 tests\playwright\settings-admin-workspace-actions.spec.mjs:220:3 › Settings admin workspace action smoke › settings.myprofile modern-json returns the settings.myprofile.v1 contract
  -   46 tests\playwright\settings-admin-workspace-actions.spec.mjs:232:3 › Settings admin workspace action smoke › settings.myprofile?s=changePassword modern-json returns the settings.myprofile.changePassword.v1 contract
  -   47 tests\playwright\settings-admin-workspace-actions.spec.mjs:251:3 › Settings admin workspace action smoke › settings.loginactivity modern-json returns the settings.loginActivity.v1 contract
  -   48 tests\playwright\settings-admin-workspace-actions.spec.mjs:262:3 › Settings admin workspace action smoke › settings.emailtemplates modern-json returns the settings.emailTemplates.v1 contract
  -   49 tests\playwright\settings-admin-workspace-actions.spec.mjs:284:3 › Settings admin workspace action smoke › settings.gdprsettings modern-json returns the settings.gdprSettings.v1 contract
  -   50 tests\playwright\settings-admin-workspace-actions.spec.mjs:300:3 › Settings admin workspace action smoke › settings.rejectionreasons modern-json returns the settings.rejectionReasons.v1 contract
  -   51 tests\playwright\settings-admin-workspace-actions.spec.mjs:311:3 › Settings admin workspace action smoke › settings.tags modern-json returns the settings.tags.v1 contract
  -   52 tests\playwright\settings-admin-workspace-actions.spec.mjs:323:3 › Settings admin workspace action smoke › settings.manageusers modern-json returns the settings.manageUsers.v1 contract
  -   53 tests\playwright\settings-admin-workspace-actions.spec.mjs:344:3 › Settings admin workspace action smoke › settings.adduser modern-json returns the settings.addUser.v1 contract
  -   54 tests\playwright\settings-admin-workspace-actions.spec.mjs:356:3 › Settings admin workspace action smoke › settings.edituser modern-json returns the settings.editUser.v1 contract
  -   55 tests\playwright\settings-admin-workspace-actions.spec.mjs:385:3 › Settings admin workspace action smoke › settings.showuser modern-json returns the settings.showUser.v1 contract
  -   56 tests\playwright\settings-admin-workspace-actions.spec.mjs:415:5 › Settings admin workspace action smoke › settings.emailsettings modern-json returns the settings.emailSettings.v1 contract
  -   57 tests\playwright\settings-admin-workspace-actions.spec.mjs:434:5 › Settings admin workspace action smoke › settings.emailsettings ui=modern mounts natively without a forward redirect
  -   58 tests\playwright\settings-admin-workspace-actions.spec.mjs:415:5 › Settings admin workspace action smoke › settings.feedbacksettings modern-json returns the settings.feedbackSettings.v1 contract
  -   59 tests\playwright\settings-admin-workspace-actions.spec.mjs:434:5 › Settings admin workspace action smoke › settings.feedbacksettings ui=modern mounts natively without a forward redirect
  -   60 tests\playwright\settings-admin-workspace-actions.spec.mjs:415:5 › Settings admin workspace action smoke › settings.forceemail modern-json returns the settings.forceEmail.v1 contract
  -   61 tests\playwright\settings-admin-workspace-actions.spec.mjs:434:5 › Settings admin workspace action smoke › settings.forceemail ui=modern mounts natively without a forward redirect
  -   62 tests\playwright\settings-admin-workspace-actions.spec.mjs:415:5 › Settings admin workspace action smoke › settings.googleoidcsettings modern-json returns the settings.googleOIDCSettings.v1 contract
  -   63 tests\playwright\settings-admin-workspace-actions.spec.mjs:434:5 › Settings admin workspace action smoke › settings.googleoidcsettings ui=modern mounts natively without a forward redirect
  -   64 tests\playwright\settings-admin-workspace-actions.spec.mjs:415:5 › Settings admin workspace action smoke › settings.deleteuser modern-json returns the settings.deleteUser.v1 contract
  -   65 tests\playwright\settings-admin-workspace-actions.spec.mjs:434:5 › Settings admin workspace action smoke › settings.deleteuser ui=modern mounts natively without a forward redirect
  -   66 tests\playwright\settings-admin-workspace-actions.spec.mjs:415:5 › Settings admin workspace action smoke › settings.customizecalendar modern-json returns the settings.customizeCalendar.v1 contract
  -   67 tests\playwright\settings-admin-workspace-actions.spec.mjs:434:5 › Settings admin workspace action smoke › settings.customizecalendar ui=modern mounts natively without a forward redirect
  -   68 tests\playwright\settings-admin-workspace-actions.spec.mjs:415:5 › Settings admin workspace action smoke › settings.eeo modern-json returns the settings.eeo.v1 contract
  -   69 tests\playwright\settings-admin-workspace-actions.spec.mjs:434:5 › Settings admin workspace action smoke › settings.eeo ui=modern mounts natively without a forward redirect
  -   70 tests\playwright\settings-admin-workspace-actions.spec.mjs:415:5 › Settings admin workspace action smoke › settings.talentfitflowsettings modern-json returns the settings.talentFitFlowSettings.v1 contract
  -   71 tests\playwright\settings-admin-workspace-actions.spec.mjs:434:5 › Settings admin workspace action smoke › settings.talentfitflowsettings ui=modern mounts natively without a forward redirect
  -   72 tests\playwright\settings-admin-workspace-actions.spec.mjs:415:5 › Settings admin workspace action smoke › settings.newinstallpassword modern-json returns the settings.newInstallPassword.v1 contract
  -   73 tests\playwright\settings-admin-workspace-actions.spec.mjs:434:5 › Settings admin workspace action smoke › settings.newinstallpassword ui=modern mounts natively without a forward redirect
  -   74 tests\playwright\settings-admin-workspace-actions.spec.mjs:415:5 › Settings admin workspace action smoke › settings.newsitename modern-json returns the settings.newSiteName.v1 contract
  -   75 tests\playwright\settings-admin-workspace-actions.spec.mjs:434:5 › Settings admin workspace action smoke › settings.newsitename ui=modern mounts natively without a forward redirect
  -   76 tests\playwright\settings-admin-workspace-actions.spec.mjs:415:5 › Settings admin workspace action smoke › settings.createbackup modern-json returns the settings.createBackup.v1 contract
  -   77 tests\playwright\settings-admin-workspace-actions.spec.mjs:434:5 › Settings admin workspace action smoke › settings.createbackup ui=modern mounts natively without a forward redirect
  -   78 tests\playwright\settings-admin-workspace-actions.spec.mjs:415:5 › Settings admin workspace action smoke › settings.deletebackup modern-json returns the settings.deleteBackup.mutation.v1 contract
  -   79 tests\playwright\settings-admin-workspace-actions.spec.mjs:434:5 › Settings admin workspace action smoke › settings.deletebackup ui=modern mounts natively without a forward redirect
  -   80 tests\playwright\settings-admin-workspace-actions.spec.mjs:415:5 › Settings admin workspace action smoke › settings.customizeextrafields modern-json returns the settings.customizeExtraFields.v1 contract
  -   81 tests\playwright\settings-admin-workspace-actions.spec.mjs:434:5 › Settings admin workspace action smoke › settings.customizeextrafields ui=modern mounts natively without a forward redirect
  -   82 tests\playwright\settings-admin-workspace-actions.spec.mjs:415:5 › Settings admin workspace action smoke › settings.newinstallfinished modern-json returns the settings.newInstallFinished.v1 contract
  -   83 tests\playwright\settings-admin-workspace-actions.spec.mjs:434:5 › Settings admin workspace action smoke › settings.newinstallfinished ui=modern mounts natively without a forward redirect
  -   84 tests\playwright\settings-admin-workspace-actions.spec.mjs:415:5 › Settings admin workspace action smoke › settings.upgradesitename modern-json returns the settings.upgradeSiteName.v1 contract
  -   85 tests\playwright\settings-admin-workspace-actions.spec.mjs:434:5 › Settings admin workspace action smoke › settings.upgradesitename ui=modern mounts natively without a forward redirect
  -   86 tests\playwright\settings-admin-workspace-actions.spec.mjs:453:3 › Settings admin workspace action smoke › settings.administration ui=modern mounts without a runtime boundary
  -   87 tests\playwright\settings-admin-workspace-actions.spec.mjs:467:3 › Settings admin workspace action smoke › settings.myprofile ui=modern mounts without a runtime boundary
  -   88 tests\playwright\settings-admin-workspace-actions.spec.mjs:480:3 › Settings admin workspace action smoke › settings.manageusers ui=modern mounts natively without a forward redirect
  -   89 tests\playwright\settings-admin-workspace-actions.spec.mjs:495:3 › Settings admin workspace action smoke › settings.emailtemplates ui=modern mounts natively without a forward redirect
  -   90 tests\playwright\settings-admin-workspace-actions.spec.mjs:511:3 › Settings admin workspace action smoke › settings.gdprsettings ui=modern mounts natively without a forward redirect
  -   91 tests\playwright\settings-admin-workspace-actions.spec.mjs:527:3 › Settings admin workspace action smoke › settings.myprofile?s=changePassword ui=modern mounts without a runtime boundary
  -   92 tests\playwright\settings-admin-workspace-actions.spec.mjs:542:3 › Settings admin workspace action smoke › settings.loginactivity ui=modern mounts without a runtime boundary
  -   93 tests\playwright\settings-admin-workspace-actions.spec.mjs:555:3 › Settings admin workspace action smoke › settings.rejectionreasons ui=modern mounts without a runtime boundary
  -   94 tests\playwright\settings-admin-workspace-actions.spec.mjs:568:3 › Settings admin workspace action smoke › settings.tags ui=modern mounts without a runtime boundary
  -   95 tests\playwright\settings-platform-workspace-actions.spec.mjs:167:3 › Settings platform workspace action smoke › settings.careerportalsettings modern-json returns the settings.careerPortalSettings.v1 contract
  -   96 tests\playwright\settings-platform-workspace-actions.spec.mjs:187:3 › Settings platform workspace action smoke › settings.careerportalsettings ui=modern mounts natively without a forward redirect
  -   97 tests\playwright\settings-platform-workspace-actions.spec.mjs:205:3 › Settings platform workspace action smoke › settings.careerportaltemplateedit modern-json returns the settings.careerPortalTemplateEdit.v1 contract
  -   98 tests\playwright\settings-platform-workspace-actions.spec.mjs:230:3 › Settings platform workspace action smoke › settings.careerportaltemplateedit ui=modern mounts natively without a forward redirect
  -   99 tests\playwright\settings-platform-workspace-actions.spec.mjs:257:3 › Settings platform workspace action smoke › settings.careerportalquestionnaire modern-json returns the settings.careerPortalQuestionnaire.v1 contract
  -  100 tests\playwright\settings-platform-workspace-actions.spec.mjs:277:3 › Settings platform workspace action smoke › settings.careerportalquestionnaire ui=modern mounts natively without a forward redirect
  -  101 tests\playwright\settings-platform-workspace-actions.spec.mjs:295:3 › Settings platform workspace action smoke › settings.careerportalquestionnairepreview modern-json returns the settings.careerPortalQuestionnairePreview.v1 contract
  -  102 tests\playwright\settings-platform-workspace-actions.spec.mjs:320:3 › Settings platform workspace action smoke › settings.careerportalquestionnairepreview ui=modern mounts natively without a forward redirect
  -  103 tests\playwright\settings-platform-workspace-actions.spec.mjs:347:3 › Settings platform workspace action smoke › settings.careerportalquestionnaireupdate modern-json returns the settings.careerPortalQuestionnaireUpdate.mutation.v1 contract
  -  104 tests\playwright\settings-platform-workspace-actions.spec.mjs:370:3 › Settings platform workspace action smoke › settings.careerportalquestionnaireupdate ui=modern mounts natively without a forward redirect
  -  105 tests\playwright\settings-platform-workspace-actions.spec.mjs:388:3 › Settings platform workspace action smoke › settings.createbackup ui=modern forwards without an iframe
  -  106 tests\playwright\settings-platform-workspace-actions.spec.mjs:405:3 › Settings platform workspace action smoke › settings.rolepagepermissions ui=modern mounts natively without a forward redirect
  -  107 tests\playwright\settings-platform-workspace-actions.spec.mjs:419:3 › Settings platform workspace action smoke › settings.schemamigrations ui=modern mounts natively without a forward redirect
  -  108 tests\playwright\settings-wizard-actions.spec.mjs:80:3 › Settings wizard action smoke › settings.ajax_wizardImport modern-json GET returns mutation-like JSON
  -  109 tests\playwright\settings-wizard-actions.spec.mjs:92:3 › Settings wizard action smoke › settings.ajax_wizardCheckKey rejects an intentionally invalid key with modern-json GET
  -  110 tests\playwright\settings-wizard-actions.spec.mjs:107:3 › Settings wizard action smoke › settings.ajax_wizardImport ui=modern mounts without a runtime boundary
  -  111 tests\playwright\utility-endpoint-forward-actions.spec.mjs:42:3 › Utility endpoint forward action smoke › calendar.dynamicdata ui=modern mounts without a runtime boundary
  -  112 tests\playwright\utility-endpoint-forward-actions.spec.mjs:54:3 › Utility endpoint forward action smoke › wizard.ajax_getpage ui=modern mounts without a runtime boundary
  -  113 tests\playwright\utility-forward-actions.spec.mjs:40:3 › Utility forward route smoke › xml.jobOrders ui=modern mounts without a runtime boundary
  -  114 tests\playwright\utility-forward-actions.spec.mjs:52:3 › Utility forward route smoke › settings.ajax_tags_add ui=modern mounts without a runtime boundary

  114 skipped
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
