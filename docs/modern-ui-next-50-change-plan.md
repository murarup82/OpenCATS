# Modern UI Next 50 Changes Plan

Generated: 2026-03-03T16:24:54.785Z

This file is generated from `docs/modern-ui-legacy-route-gap-report.json` by `npm run modernization:board`.

## Scope

Prioritized legacy-dependent route actions that still rely on redirect/wrapper/bridge behavior.

## 50 Planned Changes

1. `login.attemptlogin` (`LegacyRedirectPage`, `legacy-redirect`) -> Build a native page + contract path and retire full legacy redirect.
2. `login.forgotpassword` (`LegacyRedirectPage`, `legacy-redirect`) -> Build a native page + contract path and retire full legacy redirect.
3. `login.googlecallback` (`LegacyRedirectPage`, `legacy-redirect`) -> Build a native page + contract path and retire full legacy redirect.
4. `login.googlestart` (`LegacyRedirectPage`, `legacy-redirect`) -> Build a native page + contract path and retire full legacy redirect.
5. `login.nocookiesmodal` (`LegacyRedirectPage`, `legacy-redirect`) -> Build a native page + contract path and retire full legacy redirect.
6. `login.requestaccess` (`LegacyRedirectPage`, `legacy-redirect`) -> Build a native page + contract path and retire full legacy redirect.
7. `login.showloginform` (`LegacyRedirectPage`, `legacy-redirect`) -> Build a native page + contract path and retire full legacy redirect.
8. `attachments.getattachment` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
9. `calendar.deleteevent` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
10. `calendar.dynamicdata` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
11. `candidates.addduplicates` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
12. `candidates.addeditimage` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
13. `candidates.emailcandidates` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
14. `candidates.linkduplicate` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
15. `candidates.merge` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
16. `candidates.mergeinfo` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
17. `candidates.removeduplicity` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
18. `candidates.savesources` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
19. `export.export` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
20. `export.exportbydatagrid` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
21. `gdpr.export` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
22. `gdpr.requests` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
23. `import.deletebulkresumes` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
24. `import.importbulkresumes` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
25. `import.importselecttype` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
26. `import.importuploadresume` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
27. `import.massimport` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
28. `import.massimportdocument` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
29. `import.massimportedit` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
30. `import.revert` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
31. `import.showmassimport` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
32. `import.viewerrors` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
33. `import.viewpending` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
34. `import.whatisbulkresumes` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
35. `joborders.edithiringplan` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
36. `settings.addemailtemplate` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
37. `settings.adduser` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
38. `settings.administration` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
39. `settings.ajax_tags_add` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
40. `settings.ajax_tags_del` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
41. `settings.ajax_tags_upd` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
42. `settings.ajax_wizardadduser` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
43. `settings.ajax_wizardcheckkey` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
44. `settings.ajax_wizarddeleteuser` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
45. `settings.ajax_wizardemail` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
46. `settings.ajax_wizardfirsttimesetup` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
47. `settings.ajax_wizardimport` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
48. `settings.ajax_wizardlicense` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
49. `settings.ajax_wizardlocalization` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
50. `settings.ajax_wizardpassword` (`EntityUtilityActionPage`, `legacy-utility-wrapper`) -> Split this utility action into a dedicated native page/action handler.
