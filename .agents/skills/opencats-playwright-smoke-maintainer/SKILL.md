---
name: opencats-playwright-smoke-maintainer
description: OpenCATS Playwright smoke and GDPR visual maintenance workflow that diagnoses failures, preserves contract/fallback safety assertions, and updates specs/fixtures only when product intent truly changed.
---

# Goal
Maintain Playwright smoke coverage and GDPR visual checks without masking compatibility regressions.

# Use this skill when
- Playwright smoke or GDPR visual tests fail after route/UI/contract changes.
- You need to update smoke assertions or fixtures with strong compatibility guarantees.
- You need root-cause triage for failures across UI, contracts, route wiring, or fallback behavior.

# Do not use this skill when
- The task does not involve Playwright/spec/fixture behavior.
- You are not prepared to validate contract and fallback expectations.

# Critical invariants or preserve list
- Preserve `.gdpr-shell` readiness expectation for consent visuals.
- Preserve `actions.submitURL` and `actions.legacyURL` expectations.
- Preserve required "Open Legacy" checks where guard scripts depend on them.
- Do not weaken assertions to hide compatibility regressions.

# Workflow
1. Identify impacted smoke or visual spec and failing assertion.
2. Map each assertion to intended product/contract behavior.
3. Classify root cause: UI-only, contract change, route change, or fallback break.
4. Update fixtures/specs only when product intent truly changed.
5. Keep compatibility-critical assertions explicit and strong.

# Output format
- **Failing checks:** exact tests and assertions.
- **Root cause classification:** per failure.
- **Exact test updates:** what changed and why.
- **Assertions intentionally preserved:** compatibility safety list.
- **Residual risk:** what still needs verification.
