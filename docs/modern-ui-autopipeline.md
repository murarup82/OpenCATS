# Modern UI Autopipeline

This queue is used for autonomous modernization runs while keeping legacy behavior available as fallback.

## Completed

1. Dashboard and candidate list/show modern pages.
2. Candidate profile enrichment: EEO, events, questionnaires.
3. Candidate add/edit route bridge in modern shell (legacy-safe iframe).
4. Full-width shell fix for `ui2-sidebar-enabled`.
5. Candidate navigation links forced to `ui=modern` across dashboard and candidates pages.
6. Shared modern URL utility applied across dashboard/candidate links.
7. Expanded sample route map to run major modules inside modern shell compatibility mode.
8. Native `candidates.edit` phase 1: modern form UI + legacy-safe save endpoint.
9. Native `candidates.add` phase 1: modern form UI + legacy-safe create endpoint.
10. Native `joborders.listByView` phase 1: modern filters/table UI + modern-json backend contract.
11. Native `joborders.listByView` phase 2: sort controls + monitored toggle action wiring.
12. Native `joborders.show` phase 1: modern profile UI + modern-json backend contract (summary, pipeline, attachments, hiring plan).
13. Native `joborders.listByView` phase 3: column visibility controls for dense recruiter workflows.
14. Native `candidates.add/edit` phase 2: dynamic extra fields + modern attachment actions wired to legacy-safe endpoints.
15. Native `joborders.show` phase 2: comments/messages native panels + richer quick actions + attachment action wiring.
16. Native `joborders.listByView` phase 4: column presets with per-user persistence (local storage keyed by site/user).
17. Native duplicate pre-check flow in `candidates.add` with modern inline review (hard/soft match UX).
18. Native in-app status change modal on `dashboard.my` (popup replaced by embedded modal workflow).
19. Expanded embedded modal coverage for pipeline actions (`dashboard.my` details, `candidates.show` pipeline actions, `joborders.show` pipeline actions).
20. Candidate action parity: modern Add-To-List overlay + embedded Add-To-Job modal flows on list/show pages.
21. Native dashboard drag/drop status mutation: no-popup transition endpoint with CSRF, owner-scope guardrails, forward-only enforcement, auto-fill for skipped stages, and hired openings checks.
22. Dashboard assign workspace (`considerCandidateSearch`) moved from popup to embedded modal flow in modern UI shell.
23. Removed `Open In Popup` affordance from shared embedded legacy modal component to reduce popup dependency across modern pages.
24. Added modern-json pipeline removal mutation path (with CSRF tokens) and wired inline remove actions on `candidates.show` and `joborders.show` to use it with confirm + note prompts.
25. Added native quick status modal on `candidates.show` and `joborders.show` for forward transitions (using secure mutation endpoint), with one-click fallback to full legacy status form for complex transitions.
26. Replaced iframe pipeline details action with native inline details modal (AJAX timeline HTML) on `candidates.show` and `joborders.show`, including full-details fallback.
27. Removed dead popup callback wiring from `LegacyFrameModal` call sites and simplified the modal API after popup affordance removal.
28. Replaced pipeline details HTML dependency with `pipeline.statusDetails.v1` modern-json timeline contract on `candidates.show` and `joborders.show`, including native inline timeline rendering and inline history date edit actions.
29. Migrated remaining show-page utility popups (joborder add-candidate, candidate/joborder add-attachment, candidate tag management) into embedded in-app modal flows using `LegacyFrameModal`.
30. Added `modern-json` mutation mode for `joborders.addProfileComment` and `joborders.postMessage`, and switched modern `joborders.show` comment/message forms to async in-place submit with immediate data refresh.
31. Added `modern-json` mutation mode for `joborders.deleteMessageThread` and switched modern `joborders.show` thread deletion to async in-place action.
32. Extended `candidates.show.v1` with comment/message contract parity (categories, open-state hints, flash metadata, inbox/thread payload, and secure action URLs/tokens).
33. Added `modern-json` mutation mode for `candidates.addProfileComment` and `candidates.postMessage`, and switched modern `candidates.show` comment/message forms to async in-place submit with immediate data refresh.
34. Added `modern-json` mutation mode for `candidates.deleteMessageThread` and switched modern `candidates.show` thread deletion to async in-place action.
35. Added `modern-json` mutation mode for candidate/joborder attachment deletion and wired modern `candidates.show` + `joborders.show` attachment tables to async delete actions with instant refresh.
36. Embedded legacy history/report utilities into the modern in-app modal shell (`candidates.show` history and `joborders.show` history/report) to avoid full context-switch navigation.

## Next Queue

1. Move remaining candidate/joborder profile actions (tag mutations and remaining legacy utility workflows) from popup/form-post flows to native mutation + optimistic refresh patterns.

## Rules

1. Keep legacy route available for every migrated page (`Open Legacy UI` action present).
2. Use small, verifiable commits per slice.
3. Run `npm run build` for `frontend/modern-ui` before bundle commits.
4. Commit source and bundle artifacts separately.
