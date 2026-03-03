# Modern UI Next 50 Changes Plan

Generated: 2026-03-03T16:38:44.924Z

This file is generated from `docs/modern-ui-legacy-route-gap-report.json` by `npm run modernization:board`.

## Scope

Prioritized legacy-dependent route actions that still rely on redirect/wrapper/bridge behavior.

## 50 Planned Changes

1. `attachments.getattachment` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
2. `calendar.deleteevent` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
3. `calendar.dynamicdata` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
4. `candidates.addduplicates` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
5. `candidates.addeditimage` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
6. `candidates.emailcandidates` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
7. `candidates.linkduplicate` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
8. `candidates.merge` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
9. `candidates.mergeinfo` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
10. `candidates.removeduplicity` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
11. `candidates.savesources` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
12. `export.export` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
13. `export.exportbydatagrid` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
14. `gdpr.export` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
15. `gdpr.requests` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
16. `import.deletebulkresumes` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
17. `import.importbulkresumes` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
18. `import.importselecttype` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
19. `import.importuploadresume` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
20. `import.massimport` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
21. `import.massimportdocument` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
22. `import.massimportedit` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
23. `import.revert` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
24. `import.showmassimport` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
25. `import.viewerrors` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
26. `import.viewpending` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
27. `import.whatisbulkresumes` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
28. `joborders.edithiringplan` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
29. `settings.addemailtemplate` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
30. `settings.adduser` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
31. `settings.administration` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
32. `settings.ajax_tags_add` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
33. `settings.ajax_tags_del` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
34. `settings.ajax_tags_upd` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
35. `settings.ajax_wizardadduser` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
36. `settings.ajax_wizardcheckkey` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
37. `settings.ajax_wizarddeleteuser` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
38. `settings.ajax_wizardemail` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
39. `settings.ajax_wizardfirsttimesetup` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
40. `settings.ajax_wizardimport` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
41. `settings.ajax_wizardlicense` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
42. `settings.ajax_wizardlocalization` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
43. `settings.ajax_wizardpassword` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
44. `settings.ajax_wizardsitename` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
45. `settings.ajax_wizardwebsite` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
46. `settings.asplocalization` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
47. `settings.careerportalquestionnaire` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
48. `settings.careerportalquestionnairepreview` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
49. `settings.careerportalquestionnaireupdate` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
50. `settings.careerportalsettings` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
