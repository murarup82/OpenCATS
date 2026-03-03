import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptDir, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const shellTemplatePath = resolve(repoRoot, 'modules', 'modernui', 'Shell.tpl');

if (!existsSync(shellTemplatePath)) {
  console.error(`[modern-ui] Shell template missing: ${shellTemplatePath}`);
  process.exit(1);
}

const content = readFileSync(shellTemplatePath, 'utf8');
const requiredMarkers = [
  { id: 'noscript-tag', pattern: /<noscript>/i },
  { id: 'noscript-container', pattern: /modern-shell-noscript/ },
  { id: 'legacy-link', pattern: /legacyURL/ }
];

const failures = requiredMarkers.filter((marker) => !marker.pattern.test(content));

if (failures.length > 0) {
  console.error('[modern-ui] Shell no-JS fallback guard failed:');
  for (const failure of failures) {
    console.error(`- missing marker: ${failure.id}`);
  }
  process.exit(1);
}

console.log('[modern-ui] Shell no-JS fallback guard passed.');
