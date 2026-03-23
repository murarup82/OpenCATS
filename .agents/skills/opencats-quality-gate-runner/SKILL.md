---
name: opencats-quality-gate-runner
description: OpenCATS modernization validation runner that executes build, verify-build, Playwright smoke, and quality-gate checks, then summarizes failures by compatibility risk and fix order.
---

# Goal
Run and interpret OpenCATS modernization checks consistently so merge readiness is decided on compatibility risk, not just raw failures.

# Use this skill when
- You finished a modern UI change and need release-safe validation.
- CI/local checks failed and you need risk-focused triage.
- You need a compact pass/fail and next-fix plan for reviewers.

# Do not use this skill when
- No code/config changes were made.
- You only need a quick single-command sanity check.

# Critical invariants or preserve list
- Treat contract key/version failures as compatibility-critical.
- Treat missing fallback or missing "Open Legacy" behavior as migration-critical.
- Treat guard/parity failures as route-wiring incompleteness until proven otherwise.
- Treat GDPR visual failures as workflow-critical.

# Workflow
1. Run from `frontend/modern-ui`:
   - `npm run build:dev`
   - `npm run verify:build`
   - `npm run smoke:playwright`
   - `npm run quality:gate`
2. Capture command outputs and failing checks.
3. Group failures by risk tier (compatibility, migration/fallback, route wiring, workflow visual).
4. Map each failure to likely root cause file area.
5. Propose next fix order that reduces highest risk first.

# Output format
- **Commands run:** with status.
- **Pass/fail summary:** compact table or list.
- **Failures by risk:** grouped and prioritized.
- **Likely root cause per failure:** concrete file/area.
- **Recommended next fix order:** actionable sequence.
- **Merge-readiness judgment:** ready / blocked with reason.
