# Modern UI Autopipeline

This queue is used for autonomous modernization runs while keeping legacy behavior available as fallback.

## Completed

1. Dashboard and candidate list/show modern pages.
2. Candidate profile enrichment: EEO, events, questionnaires.
3. Candidate add/edit route bridge in modern shell (legacy-safe iframe).
4. Full-width shell fix for `ui2-sidebar-enabled`.
5. Candidate navigation links forced to `ui=modern` across dashboard and candidates pages.

## Next Queue

1. Migrate `candidates.edit` from bridge iframe to native modern form (phase 1: read + save basic fields).
2. Migrate `candidates.add` native modern form (same component mode as edit).
3. Modernize candidate actions panel (delete/history/duplicate link) as native modal actions.
4. Build native status change modal for dashboard/card actions (replace legacy popup for common transitions).
5. Add modern route coverage for top menu modules in bridge mode (`joborders`, `companies`, `contacts`) for full-shell navigation tests.
6. Convert high-usage list pages module-by-module from bridge to native (starting with `joborders.listByView`).

## Rules

1. Keep legacy route available for every migrated page (`Open Legacy UI` action present).
2. Use small, verifiable commits per slice.
3. Run `npm run build` for `frontend/modern-ui` before bundle commits.
4. Commit source and bundle artifacts separately.

