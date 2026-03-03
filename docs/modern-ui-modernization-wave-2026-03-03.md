# Modern UI Legacy Modernization Wave (2026-03-03)

## Review Snapshot

- Current system has no unresolved routes, but many actions still rely on wildcard `ModuleBridgePage` fallbacks.
- This wave reduces wildcard dependency by promoting 30 legacy actions to explicit `ActionCompatPage` routes.
- Result: these routes are now explicitly tracked in the route registry and are ready for targeted native replacement.

## 30-Change Plan And Implementation

Status legend: `done`, `pending`

1. `done` Promote `home.addPersonalItem` to explicit ActionCompat route.
2. `done` Promote `home.addSavedSearch` to explicit ActionCompat route.
3. `done` Promote `home.appendPersonalNote` to explicit ActionCompat route.
4. `done` Promote `home.archiveInboxThread` to explicit ActionCompat route.
5. `done` Promote `home.createInboxNote` to explicit ActionCompat route.
6. `done` Promote `home.createInboxTodo` to explicit ActionCompat route.
7. `done` Promote `home.deleteInboxThread` to explicit ActionCompat route.
8. `done` Promote `home.deletePersonalItem` to explicit ActionCompat route.
9. `done` Promote `home.deleteSavedSearch` to explicit ActionCompat route.
10. `done` Promote `home.movePersonalNoteToTodo` to explicit ActionCompat route.
11. `done` Promote `home.postInboxMessage` to explicit ActionCompat route.
12. `done` Promote `home.quickSearch` to explicit ActionCompat route.
13. `done` Promote `home.sendPersonalNote` to explicit ActionCompat route.
14. `done` Promote `home.setPersonalNoteArchived` to explicit ActionCompat route.
15. `done` Promote `home.setPersonalTodoStatus` to explicit ActionCompat route.
16. `done` Promote `home.submitFeedback` to explicit ActionCompat route.
17. `done` Promote `home.togglePersonalTodo` to explicit ActionCompat route.
18. `done` Promote `home.updatePersonalNote` to explicit ActionCompat route.
19. `done` Promote `home.updatePersonalTodo` to explicit ActionCompat route.
20. `done` Promote `login.attemptLogin` to explicit ActionCompat route.
21. `done` Promote `login.forgotPassword` to explicit ActionCompat route.
22. `done` Promote `login.googleCallback` to explicit ActionCompat route.
23. `done` Promote `login.googleStart` to explicit ActionCompat route.
24. `done` Promote `login.noCookiesModal` to explicit ActionCompat route.
25. `done` Promote `login.requestAccess` to explicit ActionCompat route.
26. `done` Promote `login.showLoginForm` to explicit ActionCompat route.
27. `done` Promote `import.commit` to explicit ActionCompat route.
28. `done` Promote `import.import` to explicit ActionCompat route.
29. `done` Promote `import.importUploadFile` to explicit ActionCompat route.
30. `done` Promote `rss.jobOrders` to explicit ActionCompat route.

## Follow-Up Native Conversion Queue

1. Replace `home.quickSearch` with native quick-search endpoint + React panel.
2. Replace `home.postInboxMessage` and `home.archiveInboxThread` with native inbox mutations.
3. Replace `import.import` and `import.importUploadFile` with native import wizard shell and upload API.
4. Replace login actions with native auth pages and redirect-safe callback flow.
