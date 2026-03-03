import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptDir, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const routeRegistryPath = resolve(packageRoot, 'src', 'lib', 'routeRegistry.ts');
const reportPath = resolve(repoRoot, 'docs', 'modern-ui-bridge-wildcard-retirement.md');

const source = readFileSync(routeRegistryPath, 'utf8');
const wildcardRouteRegex = /'([a-z*]+\.\*)':\s*([A-Za-z0-9_]+)/g;

const wildcardRows = [];
let match;
while ((match = wildcardRouteRegex.exec(source)) !== null) {
  wildcardRows.push({
    routeKey: match[1],
    component: match[2]
  });
}

const wildcardBridgeRows = wildcardRows.filter((row) => row.component === 'ModuleBridgePage');
const retiredPass = wildcardBridgeRows.every((row) => row.routeKey === '*.*');

const markdown = [
  '# Bridge Wildcard Retirement Check',
  '',
  `Generated: ${new Date().toISOString()}`,
  `Status: **${retiredPass ? 'Pass' : 'Fail'}**`,
  '',
  '## Wildcard Route Mappings',
  '',
  '| Route Pattern | Component |',
  '| --- | --- |',
  ...wildcardRows.map((row) => `| \`${row.routeKey}\` | \`${row.component}\` |`)
];

const nonGlobalBridgeRows = wildcardBridgeRows.filter((row) => row.routeKey !== '*.*');
if (nonGlobalBridgeRows.length > 0) {
  markdown.push('', '## Blocking Findings', '');
  nonGlobalBridgeRows.forEach((row) => {
    markdown.push(`- \`${row.routeKey}\` still maps to \`ModuleBridgePage\`.`);
  });
}

writeFileSync(reportPath, `${markdown.join('\n')}\n`, 'utf8');
console.log(`[modern-ui] Wrote bridge wildcard retirement check: ${reportPath}`);

if (!retiredPass) {
  process.exit(1);
}
