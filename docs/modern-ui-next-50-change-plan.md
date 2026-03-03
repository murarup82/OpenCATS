# Modern UI Next 50 Changes Plan

Generated: 2026-03-03T16:02:45.667Z

This file is generated from `docs/modern-ui-legacy-route-gap-report.json` by `npm run modernization:board`.

## Scope

Prioritized legacy-dependent route actions that still rely on redirect/wrapper/bridge behavior.

## 50 Planned Changes

1. `home.quicksearch` (`LegacyRedirectPage`, `legacy-redirect`) -> Build a native page + contract path and retire full legacy redirect.
2. `import.commit` (`LegacyRedirectPage`, `legacy-redirect`) -> Build a native page + contract path and retire full legacy redirect.
3. `import.import` (`LegacyRedirectPage`, `legacy-redirect`) -> Build a native page + contract path and retire full legacy redirect.
4. `import.importuploadfile` (`LegacyRedirectPage`, `legacy-redirect`) -> Build a native page + contract path and retire full legacy redirect.
5. `login.attemptlogin` (`LegacyRedirectPage`, `legacy-redirect`) -> Build a native page + contract path and retire full legacy redirect.
6. `login.forgotpassword` (`LegacyRedirectPage`, `legacy-redirect`) -> Build a native page + contract path and retire full legacy redirect.
7. `login.googlecallback` (`LegacyRedirectPage`, `legacy-redirect`) -> Build a native page + contract path and retire full legacy redirect.
8. `login.googlestart` (`LegacyRedirectPage`, `legacy-redirect`) -> Build a native page + contract path and retire full legacy redirect.
9. `login.nocookiesmodal` (`LegacyRedirectPage`, `legacy-redirect`) -> Build a native page + contract path and retire full legacy redirect.
10. `login.requestaccess` (`LegacyRedirectPage`, `legacy-redirect`) -> Build a native page + contract path and retire full legacy redirect.
11. `login.showloginform` (`LegacyRedirectPage`, `legacy-redirect`) -> Build a native page + contract path and retire full legacy redirect.
12. `rss.joborders` (`LegacyRedirectPage`, `legacy-redirect`) -> Build a native page + contract path and retire full legacy redirect.
13. `attachments.getattachment` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
14. `calendar.deleteevent` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
15. `calendar.dynamicdata` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
16. `candidates.addduplicates` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
17. `candidates.addeditimage` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
18. `candidates.emailcandidates` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
19. `candidates.linkduplicate` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
20. `candidates.merge` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
21. `candidates.mergeinfo` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
22. `candidates.removeduplicity` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
23. `candidates.savesources` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
24. `export.export` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
25. `export.exportbydatagrid` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
26. `gdpr.export` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
27. `gdpr.requests` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
28. `import.deletebulkresumes` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
29. `import.importbulkresumes` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
30. `import.importselecttype` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
31. `import.importuploadresume` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
32. `import.massimport` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
33. `import.massimportdocument` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
34. `import.massimportedit` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
35. `import.revert` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
36. `import.showmassimport` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
37. `import.viewerrors` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
38. `import.viewpending` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
39. `import.whatisbulkresumes` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
40. `joborders.edithiringplan` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
41. `settings.addemailtemplate` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
42. `settings.adduser` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
43. `settings.administration` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
44. `settings.ajax_tags_add` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
45. `settings.ajax_tags_del` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
46. `settings.ajax_tags_upd` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
47. `settings.ajax_wizardadduser` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
48. `settings.ajax_wizardcheckkey` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
49. `settings.ajax_wizarddeleteuser` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
50. `settings.ajax_wizardemail` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
