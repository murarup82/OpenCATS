import { existsSync, readFileSync, writeFileSync } from 'node:fs';
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
const deprecatedPageFiles = [
  'src/pages/LegacyRedirectPage.tsx',
  'src/pages/EntityUtilityActionPage.tsx',
  'src/pages/ReportsActionPage.tsx',
  'src/pages/GraphsActionPage.tsx'
];

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

const deprecatedFilesPresent = deprecatedPageFiles
  .map((relativePath) => ({
    relativePath,
    exists: existsSync(resolve(packageRoot, relativePath))
  }))
  .filter((entry) => entry.exists);

const hasBlockingFindings = blockedRows.length > 0 || deprecatedFilesPresent.length > 0;

const markdown = [
  '# Modern UI Legacy Wrapper Route Guard',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  `Blocked components: ${Array.from(blockedComponents).map((name) => `\`${name}\``).join(', ')}`,
  '',
  hasBlockingFindings ? '## Blocking Findings' : '## Result',
  '',
  blockedRows.length > 0
    ? ['| Route | Component |', '| --- | --- |', ...blockedRows.map((row) => `| \`${row.routeKey}\` | \`${row.component}\` |`)].join('\n')
    : 'No blocked legacy-wrapper components are mapped to routes.',
  '',
  deprecatedFilesPresent.length > 0 ? '### Deprecated Wrapper Files Still Present' : '### Deprecated Wrapper Files',
  '',
  deprecatedFilesPresent.length > 0
    ? deprecatedFilesPresent.map((entry) => `- \`${entry.relativePath}\``).join('\n')
    : 'No deprecated wrapper page files found in `src/pages`.',
  ''
].join('\n');

writeFileSync(outputPath, markdown, 'utf8');
console.log(`[modern-ui] Wrote legacy-wrapper route guard report: ${outputPath}`);

if (hasBlockingFindings) {
  if (blockedRows.length > 0) {
    console.error(`[modern-ui] Blocked wrapper components detected in route registry (${blockedRows.length}).`);
  }
  if (deprecatedFilesPresent.length > 0) {
    console.error(`[modern-ui] Deprecated wrapper page files still present (${deprecatedFilesPresent.length}).`);
  }
  process.exit(1);
}
