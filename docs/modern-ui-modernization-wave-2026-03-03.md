# Modern UI Legacy Modernization Wave (2026-03-03)

Historical note (2026-03-04): This wave log describes an intermediate milestone.
References to `LegacyRedirectPage` reflect the state on 2026-03-03 only.
Login/import/rss routes were subsequently modernized with native handlers
(`LoginPage`, `LoginLegacyActionPage`, `ImportLauncherPage`, `RssJobOrdersPage`),
and legacy wrapper pages were fully removed in commit `caa70f0`.

## Review Snapshot

- Current system has no unresolved routes, but many actions still rely on wildcard `ModuleBridgePage` fallbacks.
- This wave removes 30 legacy actions from `ActionCompatPage` iframe routing.
- Result: these routes now resolve through native handler pages:
- `HomeActionPage` for home actions (redirects to modern home/inbox/myNotes surfaces).
- `LegacyRedirectPage` for login/import/rss actions (full legacy redirect until native auth/import/feed contracts land).

## 30-Change Plan And Implementation

Status legend: `done`, `pending`

1. `done` Route `home.addPersonalItem` through `HomeActionPage` native handler.
2. `done` Route `home.addSavedSearch` through `HomeActionPage` native handler.
3. `done` Route `home.appendPersonalNote` through `HomeActionPage` native handler.
4. `done` Route `home.archiveInboxThread` through `HomeActionPage` native handler.
5. `done` Route `home.createInboxNote` through `HomeActionPage` native handler.
6. `done` Route `home.createInboxTodo` through `HomeActionPage` native handler.
7. `done` Route `home.deleteInboxThread` through `HomeActionPage` native handler.
8. `done` Route `home.deletePersonalItem` through `HomeActionPage` native handler.
9. `done` Route `home.deleteSavedSearch` through `HomeActionPage` native handler.
10. `done` Route `home.movePersonalNoteToTodo` through `HomeActionPage` native handler.
11. `done` Route `home.postInboxMessage` through `HomeActionPage` native handler.
12. `done` Route `home.quickSearch` through `HomeActionPage` native handler.
13. `done` Route `home.sendPersonalNote` through `HomeActionPage` native handler.
14. `done` Route `home.setPersonalNoteArchived` through `HomeActionPage` native handler.
15. `done` Route `home.setPersonalTodoStatus` through `HomeActionPage` native handler.
16. `done` Route `home.submitFeedback` through `HomeActionPage` native handler.
17. `done` Route `home.togglePersonalTodo` through `HomeActionPage` native handler.
18. `done` Route `home.updatePersonalNote` through `HomeActionPage` native handler.
19. `done` Route `home.updatePersonalTodo` through `HomeActionPage` native handler.
20. `done` Route `login.attemptLogin` through `LegacyRedirectPage` native handler.
21. `done` Route `login.forgotPassword` through `LegacyRedirectPage` native handler.
22. `done` Route `login.googleCallback` through `LegacyRedirectPage` native handler.
23. `done` Route `login.googleStart` through `LegacyRedirectPage` native handler.
24. `done` Route `login.noCookiesModal` through `LegacyRedirectPage` native handler.
25. `done` Route `login.requestAccess` through `LegacyRedirectPage` native handler.
26. `done` Route `login.showLoginForm` through `LegacyRedirectPage` native handler.
27. `done` Route `import.commit` through `LegacyRedirectPage` native handler.
28. `done` Route `import.import` through `LegacyRedirectPage` native handler.
29. `done` Route `import.importUploadFile` through `LegacyRedirectPage` native handler.
30. `done` Route `rss.jobOrders` through `LegacyRedirectPage` native handler.

## Follow-Up Native Conversion Queue

1. Replace `home.quickSearch` with native quick-search endpoint + React panel.
2. Replace `home.postInboxMessage` and `home.archiveInboxThread` with native inbox mutations.
3. Replace `import.import` and `import.importUploadFile` with native import wizard shell and upload API.
4. Replace login actions with native auth pages and redirect-safe callback flow.
