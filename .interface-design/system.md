# Design System

## Direction

**Personality:** Sophistication & Trust (Avel SaaS Variant)  
**Foundation:** Cool teal-neutral, light mode default  
**Depth:** Subtle single-shadow + fine border layering

### Intent
- **Human:** Recruiter/operator managing active candidate pipelines.
- **Must do:** Filter quickly, identify stalled candidates, move between candidate and job views.
- **Should feel:** Controlled, high-signal, operationally calm.

## Domain Exploration

### Domain
- Candidate pipeline health
- Stage throughput
- Job-order portfolio monitoring
- Recruiter execution cadence
- Stale risk detection

### Color World
- Avel teal-blue interfaces (`#00425b`, `#006d90`, `#0097bd`, `#38b1cc`)
- Paper-like light surfaces (`#ffffff`, `#f8fcff`)
- Cool, low-noise borders (`#c7ddea`, `#9bc4d9`)
- Soft success/warning/risk accents for freshness and status states
- Sky tint overlays for hero/background atmosphere

### Signature
- **Pipeline Command Center shell**:
  - Hero summary + operational stat stack
  - KPI strip for current slice
  - Priority-stage chip band
  - Sticky command bar + kanban/list parity

### Defaults Rejected
- Generic flat white dashboard -> layered Avel-tinted surfaces with restrained depth
- Template metric cards only -> mixed hero/stat/KPI composition with priority band
- Neutral gray+blue token set -> brand-anchored Avel teal token architecture

## Tokens

### Spacing
- **Base:** `4px`
- **Scale:** `4, 8, 10, 12, 14, 16, 20, 24`
- **Usage:**
  - Micro gaps: `4-6px`
  - Control internals: `8-12px`
  - Card internals: `10-14px`
  - Section gaps: `12-16px`

### Color

#### Primitives
- `--avel-50: #f4fbff`
- `--avel-100: #e6f4fa`
- `--avel-200: #d9efff`
- `--avel-300: #b9dff0`
- `--avel-400: #7bc2dd`
- `--avel-500: #38b1cc`
- `--avel-600: #0097bd`
- `--avel-700: #006d90`
- `--avel-800: #005471`
- `--avel-900: #00425b`

#### Semantic
- `--avel-text: #0d3344`
- `--avel-text-soft: #446677`
- `--avel-border: #c7ddea`
- `--avel-border-strong: #9bc4d9`
- `--avel-surface: #ffffff`
- `--avel-surface-soft: #f8fcff`

#### States
- Success: green-tinted chips/badges (fresh, hired)
- Warning: amber-tinted chips/badges (aging, interview/negotiation)
- Risk: red-tinted chips/badges (stale, rejected)
- Informational: Avel-blue chips/badges (active/open)

### Typography
- **Display/Headings:** `Space Grotesk` (600-700)
- **Body/UI:** `Manrope` (400-800)
- **Hierarchy:**
  - Page title: `clamp(1.8rem, 1.25rem + 1.9vw, 2.8rem)`
  - Section headers: `~1rem`
  - Control labels/meta: `0.58rem-0.76rem` uppercase with tracking
  - Body rows/cards: `0.74rem-0.95rem`

### Radius
- Small: `9-10px` (chips, fields, mini buttons)
- Medium: `12-14px` (cards, columns, tables)
- Large: `16-20px` (major containers)
- Pill: `999px` (status/filter chips)

### Shadows
- `--avel-shadow-sm: 0 8px 20px rgba(0, 66, 91, 0.09)`
- `--avel-shadow-md: 0 18px 38px rgba(0, 66, 91, 0.13)`
- Hover lift on cards/buttons only; avoid dramatic elevation jumps.

### Motion
- Hover/controls: `150-170ms`
- Entry reveal: `380-460ms`, `cubic-bezier(0.16, 1, 0.3, 1)`
- Skeleton shimmer: `1.4s`
- `prefers-reduced-motion` supported (animations/transitions minimized)

## Layout & Pattern Library

### Page Composition
1. Header container with title/actions
2. Hero command summary
3. KPI strip
4. Priority-stage band
5. Sticky command bar
6. Kanban board or list panel

### Key Components
- Hero (`.avel-hero`, `.avel-stat-card`)
- KPI cards (`.avel-kpi-grid`, `.avel-kpi`)
- Priority stage chips (`.avel-priority-band`)
- Sticky filters (`.modern-command-bar` in Avel scope)
- Kanban shell (`.modern-kanban-*` themed)
- List shell (`.avel-list-panel`, themed data table)

### Data Presentation Rules
- Status communicated by text + chip treatment (not color alone)
- Freshness triage surfaced in hero/KPI and row/card chips
- Priority stages shown as top 3 by visible volume

## Accessibility Baseline

- Visible focus rings on controls/buttons/inputs
- Light-mode contrast maintained via dark text on light surfaces
- `prefers-reduced-motion` media query implemented
- Chips include explicit text labels for state clarity

## Decisions

### 2026-02-28
- Adopted Avel teal palette as the sole brand accent family.
- Chose **subtle-shadow depth** over flat borders-only to keep premium SaaS feel.
- Kept existing dashboard behavior and APIs; redesign is presentational + hierarchy-focused.
- Established `dashboard-avel.css` as scoped styling layer (`.avel-dashboard-page`) to avoid global regressions.

