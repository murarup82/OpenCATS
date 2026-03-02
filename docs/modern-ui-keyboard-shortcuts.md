# Modern UI Keyboard Shortcuts

These shortcuts are active in modern UI pages.

| Shortcut | Action | Notes |
| --- | --- | --- |
| `/` | Focus primary search input | Ignored while typing inside inputs/textareas/selects/contenteditable fields. |
| `Shift + R` | Trigger in-page refresh event | Uses modern refresh event pipeline (`opencats:modern-page:refresh`) to avoid full-page reload where supported. |

## Usage Notes

- Shortcuts are intentionally minimal to avoid collisions with browser/system defaults.
- Refresh behavior depends on each page’s refresh-event integration (`usePageRefreshEvents`).
- Legacy bridge/embedded content may not react to shortcuts unless the hosting modern page handles the event.
