# Modern UI Strict-Native Execution Plan (2026-03-23)

## Scope Definition
- **Goal:** remove compatibility wrappers/embedded legacy pages for true UI surfaces.
- **Intentional legacy-forward endpoints:** auth callbacks, binary downloads, and utility endpoints may remain forward-only.
- **Assumption:** endpoint-only routes are out of strict native UI scope once explicitly classified and guarded.

## Current Snapshot
- `routeRegistry` entries: **251**
- Native/UI component mappings: **143**
- Compatibility-dependent mappings: **108**

Compatibility buckets (remaining):
- `SettingsAdminWorkspaceActionPage`: 41
- `ImportWorkflowActionPage`: 12
- `CandidatesWorkspaceActionPage`: 9
- `UtilityEndpointForwardActionPage`: 7
- `OperationsWorkspaceActionPage`: 6
- `ReportsWorkflowActionPage`: 6
- `LoginLegacyActionPage`: 6
- `GraphsWorkspaceActionPage`: 5
- `LegacyDownloadForwardActionPage`: 4
- `SettingsTagsActionPage`: 3
- `PipelineStatusActionPage`: 2
- `ListsActionPage`: 2
- `CandidateQuestionnaireActionPage`: 1
- `ContactActivityActionPage`: 1
- `ContactVCardActionPage`: 1
- `ReportsJobOrderPdfActionPage`: 1
- `ModuleBridgePage`: 1

## Execution Waves

### Wave 1: Low-Risk Contract/UI Expansions
1. `settings.myprofile` native read contract + shell.
2. `settings.administration?s=changePassword` native shell with legacy submit path preserved.
3. One additional import mutation route to modern-json contract (no iframe mode).
4. One additional reports workflow route split from `ReportsWorkflowActionPage`.
5. One non-GDPR operations route moved from iframe embed to explicit forward mode.

### Wave 2: Intentional Forward Endpoint Normalization
1. Finalize intentional-forward inventory (login/export/xml/utility/attachments subset).
2. Guard scripts enforce explicit classification for each forward route.
3. Quality gate flags unexpected legacy redirects outside approved inventory.
4. UI switch excludes validated for endpoint-only routes.

### Wave 3: Settings Decomposition (Largest Block)
1. User management routes (`manageusers`, `adduser`, `edituser`, `showuser`, `deleteuser`).
2. Template routes (`emailtemplates`, `addemailtemplate`, `deleteemailtemplate`).
3. Profile/security routes (`myprofile`, `changePassword`) fully native forms.
4. Keep backend payload/field/token compatibility unchanged.

### Wave 4: Workflow Wrapper Retirement
1. Import flow (`viewerrors`, `importselecttype`, `massimport`, `massimportedit`).
2. Reports flow (`showhire`, `showplacement`, `showsubmission`, customize routes).
3. Operations flow (`edithiringplan`, preview routes, install flow).

### Wave 5: Final Hardening
1. Candidates workspace action decomposition.
2. Graph/list/pipeline action cleanup.
3. Bridge wildcard retirement (`*.* -> ModuleBridgePage`) after strict guard criteria pass.

## Done Criteria (Strict Native)
1. All UI surfaces for in-scope modules resolve to native React pages without embedded legacy iframes.
2. Remaining legacy forwards are endpoint-only and explicitly listed in guards/docs.
3. `quality:gate` passes with strict guard settings enabled.
4. Route guard and contract invariants remain stable (`contractVersion=1`, exact keys, legacy escape hatches preserved where required).
