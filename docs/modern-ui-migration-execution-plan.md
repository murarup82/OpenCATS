# OpenCATS Modern UI Migration Execution Plan

Generated: 2026-03-23

## Current State Snapshot

- Modern-native routes: 223
- Legacy-dependent bridge routes: 5
- Explicit legacy-wrapper routes: ~110

Remaining bridge routes:

1. `candidates.googleDriveDeleteAttachmentFile`
2. `candidates.googleDriveUploadAttachment`
3. `joborders.pipelineMatrixDeleteView`
4. `joborders.pipelineMatrixSaveView`
5. `login.googleDriveStart`

Assumptions:

- Route totals are taken from the latest generated modernization reports in this repository.
- Existing component coverage is sufficient to map the 5 bridge routes without backend contract changes.

## Phase 1: Eliminate 5 Bridge Routes

Goal: remove `bridge-global-fallback` usage for the 5 remaining actions by explicit route mappings.

### Route-to-Component Mappings

| Route | Target Component | Notes |
| --- | --- | --- |
| `candidates.googleDriveUploadAttachment` | `CandidatesShowPage` | Align with existing candidate attachment mutation surface. |
| `candidates.googleDriveDeleteAttachmentFile` | `CandidatesShowPage` | Align with existing candidate attachment deletion surface. |
| `joborders.pipelineMatrixSaveView` | `JobOrdersPipelineMatrixPage` | Align with matrix view save workflow. |
| `joborders.pipelineMatrixDeleteView` | `JobOrdersPipelineMatrixPage` | Align with matrix view delete workflow. |
| `login.googleDriveStart` | `LoginLegacyActionPage` | Keep auth redirect semantics explicit. |

### Guard Expectations

- Add guarded params for:
  - `candidates.googleDriveUploadAttachment`: `candidateID`
  - `candidates.googleDriveDeleteAttachmentFile`: `candidateID`
- Do not loosen existing guard requirements for other routes.

### Verification Commands

Run from `frontend/modern-ui`:

1. `npm run build:dev`
2. `npm run verify:build`
3. `npm run verify:no-bridge-actions`
4. `npm run verify:in-scope-routes`
5. `npm run verify:zero-legacy-dependent`
6. `npm run quality:gate`

Exit criteria:

- Bridge actions count = 0
- In-scope fallback violations = 0
- Zero legacy-dependent guard passes

## Phase 2: Retire Highest-Impact Recruiter Legacy Wrappers

Goal: migrate recruiter-critical wrappers to dedicated modern-native action/page handling.

### Priority Streams

1. Candidate duplicate and merge workflows:
   - `candidates.addduplicates`
   - `candidates.merge`
   - `candidates.mergeinfo`
   - `candidates.linkduplicate`
   - `candidates.removeduplicity`

2. Job order hiring plan path:
   - `joborders.edithiringplan`
   - keep `Open Legacy UI` fallback until feature parity is confirmed

3. Report customization and generation actions:
   - `reports.customizeeeoreport`
   - `reports.customizejoborderreport`
   - `reports.generateeeoreportpreview`
   - `reports.generatejoborderreportpdf`
   - `reports.showhirereport`
   - `reports.showplacementreport`
   - `reports.showsubmissionreport`

### Phase 2 Execution Pattern

1. Add explicit native route entries per action.
2. Introduce/extend modern-json contract emitters only where needed.
3. Keep field names, payload shape, tokens, and submit endpoints stable.
4. Keep visible legacy escape hatch until parity and smoke checks pass.

## Phase 3: Admin, Settings, and Import Wrapper Retirement

Goal: reduce explicit legacy-wrapper routes in lower-priority operational domains.

### Scope Buckets

1. `settings.*` wrappers (largest backlog)
2. `import.*` wrappers
3. Remaining operational wrappers:
   - `toolbar.*`
   - `graphs.*`
   - `export.*`
   - `gdpr.*`
   - `attachments.getattachment`
   - `wizard.ajax_getpage`
   - `xml.joborders`

### Delivery Strategy

1. Batch by module and shared contract surface.
2. Convert high-frequency admin pages first, low-frequency utilities last.
3. Keep fallback and noscript behavior intact during each batch.

## Risk Controls and Invariants

Do not break:

- `m` and `a` route semantics and `routeRegistry.ts` alignment
- guarded route param rules
- contract protocol:
  - `format=modern-json`
  - `modernPage`
  - `contractVersion=1`
  - exact `contractKey`
- existing field names, hidden IDs/tokens, and submit URL behavior
- shell fallback markers and no-JS behavior in `modules/modernui/Shell.tpl`
- visible `Open Legacy UI` actions where expected by guards/tests

## Definition of Done

Done when all are true:

1. 5 bridge routes are explicitly mapped and no longer resolved by `*.*`.
2. Quality guards report:
   - no bridge actions
   - no in-scope fallback violations
   - zero legacy-dependent routes
3. Required route/contract/fallback checks pass.
4. No regression in selector/contract expectations used by smoke and Playwright checks.
5. Legacy fallback links remain available where parity is not complete.

## Command Ladder

Run from `frontend/modern-ui` for each migration batch:

1. `npm run build:dev`
2. `npm run verify:build`
3. `npm run smoke:playwright`
4. `npm run verify:no-bridge-actions`
5. `npm run verify:in-scope-routes`
6. `npm run verify:zero-legacy-dependent`
7. `npm run quality:gate`

