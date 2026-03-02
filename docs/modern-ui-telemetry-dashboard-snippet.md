# Route Resolution Telemetry Dashboard Snippet

Use this snippet in browser devtools on modern pages to inspect route-resolution telemetry counters.

```js
(() => {
  const key = 'opencats:modern:route-resolution-counters:v1';
  const raw = window.sessionStorage.getItem(key);
  const counters = raw ? JSON.parse(raw) : { native: 0, bridge: 0, legacy: 0 };

  const total = (Number(counters.native || 0) + Number(counters.bridge || 0) + Number(counters.legacy || 0)) || 1;
  const pct = (value) => `${((Number(value || 0) / total) * 100).toFixed(1)}%`;

  console.table([
    { type: 'native', count: Number(counters.native || 0), pct: pct(counters.native) },
    { type: 'bridge', count: Number(counters.bridge || 0), pct: pct(counters.bridge) },
    { type: 'legacy', count: Number(counters.legacy || 0), pct: pct(counters.legacy) }
  ]);
  console.log('lastRouteKey:', counters.lastRouteKey || '-');
  console.log('lastRequestURI:', counters.lastRequestURI || '-');
  console.log('lastUpdatedUTC:', counters.lastUpdatedUTC || '-');
})();
```

## Live Event Monitor

```js
window.addEventListener('opencats:modern-route:resolution', (event) => {
  console.log('[route-resolution]', event.detail);
});
```

## Reset Counters

```js
window.sessionStorage.removeItem('opencats:modern:route-resolution-counters:v1');
```
