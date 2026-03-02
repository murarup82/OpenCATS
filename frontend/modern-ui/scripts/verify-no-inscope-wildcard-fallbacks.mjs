import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptDir, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const reportPath = resolve(repoRoot, 'docs', 'modern-ui-legacy-route-gap-report.json');

const inScopeModules = new Set([
  'dashboard',
  'candidates',
  'joborders',
  'companies',
  'contacts',
  'activity',
  'calendar',
  'lists',
  'reports'
]);

if (!existsSync(reportPath)) {
  console.error(`[modern-ui] Comparison report not found: ${reportPath}`);
  process.exit(1);
}

const report = JSON.parse(readFileSync(reportPath, 'utf8'));
const blockedClassifications = new Set([
  'native-default-fallback',
  'bridge-module-fallback',
  'bridge-global-fallback',
  'legacy-unresolved'
]);

const failures = (Array.isArray(report.rows) ? report.rows : []).filter((row) =>
  inScopeModules.has(String(row.module || '').toLowerCase()) && blockedClassifications.has(String(row.classification || ''))
);

if (failures.length > 0) {
  console.error(`[modern-ui] In-scope fallback routes found: ${failures.length}`);
  for (const failure of failures) {
    console.error(`- ${failure.module}.${failure.action} -> ${failure.classification} (${failure.routeKey})`);
  }
  process.exit(1);
}

console.log('[modern-ui] No in-scope wildcard/default fallback routes detected.');
