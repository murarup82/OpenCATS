# Modern UI Next 50 Changes Plan

Generated: 2026-03-03T16:51:42.438Z

This file is generated from `docs/modern-ui-legacy-route-gap-report.json` by `npm run modernization:board`.

## Scope

Prioritized legacy-dependent route actions that still rely on redirect/wrapper/bridge behavior.

## 50 Planned Changes

1. `candidates.addduplicates` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
2. `candidates.addeditimage` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
3. `candidates.emailcandidates` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
4. `candidates.linkduplicate` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
5. `candidates.merge` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
6. `candidates.mergeinfo` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
7. `candidates.removeduplicity` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
8. `candidates.savesources` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
9. `joborders.edithiringplan` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
10. `graphs.generic` (`GraphsActionPage`, `legacy-graphs-wrapper`) -> Replace legacy graph action endpoint dependency with native chart rendering.
11. `graphs.genericpie` (`GraphsActionPage`, `legacy-graphs-wrapper`) -> Replace legacy graph action endpoint dependency with native chart rendering.
12. `graphs.joborderreportgraph` (`GraphsActionPage`, `legacy-graphs-wrapper`) -> Replace legacy graph action endpoint dependency with native chart rendering.
13. `graphs.testgraph` (`GraphsActionPage`, `legacy-graphs-wrapper`) -> Replace legacy graph action endpoint dependency with native chart rendering.
14. `graphs.wordverify` (`GraphsActionPage`, `legacy-graphs-wrapper`) -> Replace legacy graph action endpoint dependency with native chart rendering.
15. `reports.customizeeeoreport` (`ReportsActionPage`, `legacy-reports-wrapper`) -> Replace embedded legacy report action with native report workflow.
16. `reports.customizejoborderreport` (`ReportsActionPage`, `legacy-reports-wrapper`) -> Replace embedded legacy report action with native report workflow.
17. `reports.generateeeoreportpreview` (`ReportsActionPage`, `legacy-reports-wrapper`) -> Replace embedded legacy report action with native report workflow.
18. `reports.generatejoborderreportpdf` (`ReportsActionPage`, `legacy-reports-wrapper`) -> Replace embedded legacy report action with native report workflow.
19. `reports.showhirereport` (`ReportsActionPage`, `legacy-reports-wrapper`) -> Replace embedded legacy report action with native report workflow.
20. `reports.showplacementreport` (`ReportsActionPage`, `legacy-reports-wrapper`) -> Replace embedded legacy report action with native report workflow.
21. `reports.showsubmissionreport` (`ReportsActionPage`, `legacy-reports-wrapper`) -> Replace embedded legacy report action with native report workflow.
