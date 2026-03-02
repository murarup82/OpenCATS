# Modern UI Keyboard Shortcut Extension Plan

This plan extends baseline shortcuts (`/`, `Shift+R`) with module navigation and action palette support.

## Goals

- Reduce pointer-heavy navigation for recruiters and operators.
- Keep shortcuts discoverable and conflict-safe.
- Preserve accessibility (`aria-keyshortcuts`, focus-visible, escape paths).

## Planned Shortcut Groups

1. Module jumps (`g` then key)
- `g d`: Dashboard
- `g c`: Candidates list
- `g j`: Job Orders list
- `g o`: Companies list
- `g t`: Contacts list
- `g a`: Activity
- `g l`: Lists
- `g r`: Reports

2. Global actions
- `Shift+P`: Open command/action palette
- `Shift+F`: Focus primary filter/search field on current page
- `Shift+K`: Toggle Kanban/List when supported

3. Context actions (page-specific)
- `n`: New entity (candidate/job order/contact/company) if permitted
- `e`: Edit current profile when on show pages
- `u`: Open legacy UI fallback for current route

## Safety and Accessibility Rules

- Ignore shortcuts while typing in `input`, `textarea`, or content-editable elements.
- Provide visible helper panel in command bar (`?` icon) listing available shortcuts.
- Respect `prefers-reduced-motion` for palette animations.
- Ensure all shortcut-triggered actions are available via visible clickable controls.

## Rollout Plan

1. Phase A: Module jumps + helper UI.
2. Phase B: Action palette with route/action registry integration.
3. Phase C: Context actions per page with permission guards.

## Validation

- Keyboard-only walkthrough for Dashboard, Candidates, Job Orders.
- Screen-reader spot-check for shortcut hints.
- Conflict testing against browser and OS defaults.
