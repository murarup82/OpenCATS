---
name: opencats-ui-refactor-safe
description: OpenCATS presentation-only refactor for hierarchy, scanability, spacing, and layout polish while preserving contracts, route semantics, field names, IDs, hidden tokens, submit URLs, selectors, and business logic.
---

# Goal
Refactor OpenCATS modern UI presentation safely without changing backend compatibility or workflow behavior.

# Use this skill when
- You are improving visual hierarchy, scanability, spacing, card structure, or action prominence.
- The request is explicitly presentation-focused on existing pages/components.
- You must keep contracts, payload shape, and form wiring unchanged.

# Do not use this skill when
- The task requires new backend behavior, new contract keys, or route/guard changes.
- Field semantics, submit flow, token model, or action URLs must change.
- You are intentionally changing business logic or validation rules.

# Critical invariants or preserve list
- Preserve route semantics (`m` / `a`) and existing page wiring.
- Preserve form names, hidden fields, IDs, tokens, and submit URLs.
- Preserve `meta.contractVersion === 1`, exact `contractKey`, and `modernPage` semantics.
- Preserve selectors/behaviors relied on by tests (`.gdpr-shell`, "Open Legacy" presence, submit/legacy URLs in payload actions).
- Preserve legacy escape hatch UX.

# Workflow
1. Classify request as presentation-only vs behavior-changing.
2. List non-negotiable invariants before editing.
3. Audit current page structure, reusable primitives, and style layers.
4. Propose the layout refactor plan before coding (sections, action hierarchy, density reductions).
5. Implement the smallest clean refactor that achieves the visual goal.
6. Reuse existing OpenCATS primitives and style vocabulary; avoid new UI libraries.
7. Return diagnosis, layout decisions, implementation summary, and regression checklist.

# Output format
- **Diagnosis:** what felt noisy/flat and why.
- **Layout updates:** section hierarchy, action area, sidebar/context handling.
- **Implementation summary:** files changed and what was presentation-only.
- **Regression checklist:** explicit confirmation of preserved invariants.

UI heuristics to apply:
- Prefer section cards over excessive nested framing.
- Reduce competing borders and tinted surfaces.
- Make primary actions visually dominant.
- Keep labels quieter than section headers.
- Move contextual utilities to sidebar when appropriate.
- Preserve OpenCATS enterprise blue/teal family.
