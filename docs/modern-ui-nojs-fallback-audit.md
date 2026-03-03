# Modern UI No-JS Fallback Audit

This audit identifies critical workflows that rely on JavaScript in modern UI and the fallback path to preserve operability.

## Findings

| Workflow | JS Dependency | Current Fallback | Risk |
| --- | --- | --- | --- |
| Dashboard status mutation (quick modal + drag/drop) | High | Legacy status form route (`addActivityChangeStatus`) via fallback action | Medium |
| Dashboard assign candidate modal | High | Legacy assignment route (`considerCandidateSearch`) in embedded/legacy mode | Medium |
| Candidate add/edit dynamic form controls | Medium | Legacy candidate forms available (`ui=legacy`) | Medium |
| Candidate/joborder attachment upload async flow | High | Legacy uploader routes exposed from same page | Medium |
| Add-To-List overlay + inline list management | High | Legacy quick-action modal path remains available | Medium |
| Custom `SelectMenu` controls | Medium | Underlying backend still supports legacy/native form submits | Low |
| Route resolution and module bridge fallback | Medium | `ModuleBridgePage` + legacy URL switch | Low |

## Gaps

| Gap | Impact | Mitigation |
| --- | --- | --- |
| Native list pages rely on JS for filter application and pagination updates | Medium | Keep legacy route switch visible; consider server-render fallback mode for critical lists. |
| Custom modal workflows require JS to open/submit inline actions | High | Preserve explicit legacy action links/buttons on major mutation paths. |
| Keyboard shortcut behavior is JS-only | Low | Shortcuts are additive; no functional dependency when disabled. |

## Recommended Next Steps

1. Keep `Open Legacy UI` action visible on all native modern pages until no-JS parity is intentionally solved.
2. Prioritize server-render fallback for at least one critical list page (`dashboard.my` or `candidates.listByView`) if strict no-JS support becomes a requirement.
3. Add CI smoke check that verifies legacy fallback links are present on all native page headers.

## Implemented Guard

- Added CI/runtime guard script `frontend/modern-ui/scripts/verify-legacy-fallback-links.mjs`.
- The guard validates `Open Legacy` fallback action labels across core native pages.
- Wired into both `sanity:modern` and `quality:gate` pipelines as required checks.
- Added shell-level no-JS fallback in `modules/modernui/Shell.tpl` (`<noscript>` legacy handoff block).
- Added guard `frontend/modern-ui/scripts/verify-shell-noscript-fallback.mjs` to prevent shell no-JS fallback regressions.
- Wired shell no-JS fallback guard into both `sanity:modern` and `quality:gate` required checks.
