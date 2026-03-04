import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptDir, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const routeRegistryPath = resolve(packageRoot, 'src', 'lib', 'routeRegistry.ts');
const outputPath = resolve(repoRoot, 'docs', 'modern-ui-no-legacy-wrapper-routes-check.md');

const blockedComponents = new Set([
  'LegacyRedirectPage',
  'EntityUtilityActionPage',
  'ReportsActionPage',
  'GraphsActionPage'
]);

const source = readFileSync(routeRegistryPath, 'utf8');
const routeRegex = /'([^']+)'\s*:\s*([A-Za-z0-9_]+)/g;

const blockedRows = [];
let match;
while ((match = routeRegex.exec(source)) !== null) {
  const routeKey = match[1];
  const component = match[2];
  if (blockedComponents.has(component)) {
    blockedRows.push({ routeKey, component });
  }
}

const markdown = [
  '# Modern UI Legacy Wrapper Route Guard',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  `Blocked components: ${Array.from(blockedComponents).map((name) => `\`${name}\``).join(', ')}`,
  '',
  blockedRows.length > 0 ? '## Blocking Findings' : '## Result',
  '',
  blockedRows.length > 0
    ? ['| Route | Component |', '| --- | --- |', ...blockedRows.map((row) => `| \`${row.routeKey}\` | \`${row.component}\` |`)].join('\n')
    : 'No blocked legacy-wrapper components are mapped to routes.',
  ''
].join('\n');

writeFileSync(outputPath, markdown, 'utf8');
console.log(`[modern-ui] Wrote legacy-wrapper route guard report: ${outputPath}`);

if (blockedRows.length > 0) {
  console.error(`[modern-ui] Blocked wrapper components detected in route registry (${blockedRows.length}).`);
  process.exit(1);
}

