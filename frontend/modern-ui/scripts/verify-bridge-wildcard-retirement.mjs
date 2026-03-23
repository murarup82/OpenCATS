import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptDir, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const routeRegistryPath = resolve(packageRoot, 'src', 'lib', 'routeRegistry.ts');
const reportPath = resolve(repoRoot, 'docs', 'modern-ui-bridge-wildcard-retirement.md');
const allowWildcardBridgeOverride = String(process.env.OPENCATS_ALLOW_BRIDGE_WILDCARD || '').trim() === '1';
const enforceWildcardBridgeRetirement = String(process.env.OPENCATS_ENFORCE_BRIDGE_WILDCARD || '').trim() === '1';

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
const globalWildcardBridgeRow = wildcardBridgeRows.find((row) => row.routeKey === '*.*');
const nonGlobalWildcardBridgeRows = wildcardBridgeRows.filter((row) => row.routeKey !== '*.*');
const strictMode = enforceWildcardBridgeRetirement && !allowWildcardBridgeOverride;
const retiredPass = strictMode ? wildcardBridgeRows.length === 0 : nonGlobalWildcardBridgeRows.length === 0;

const markdown = [
  '# Bridge Wildcard Retirement Check',
  '',
  `Generated: ${new Date().toISOString()}`,
  `Status: **${retiredPass ? 'Pass' : 'Fail'}**`,
  `Strict mode: ${strictMode ? 'enabled via `OPENCATS_ENFORCE_BRIDGE_WILDCARD=1`' : 'disabled (global *.* bridge tolerated)'}`,
  `Override: ${allowWildcardBridgeOverride ? 'enabled via `OPENCATS_ALLOW_BRIDGE_WILDCARD=1`' : 'disabled'}`,
  '',
  '## Wildcard Route Mappings',
  '',
  '| Route Pattern | Component |',
  '| --- | --- |',
  ...wildcardRows.map((row) => `| \`${row.routeKey}\` | \`${row.component}\` |`)
];

if (wildcardBridgeRows.length > 0) {
  markdown.push('', allowWildcardBridgeOverride ? '## Bridge Wildcard Rows' : '## Blocking Findings', '');
  if (globalWildcardBridgeRow) {
    markdown.push(
      strictMode
        ? '- `*.*` still maps to `ModuleBridgePage`.'
        : '- `*.*` still maps to `ModuleBridgePage` (allowed while strict mode is disabled).'
    );
  }
  nonGlobalWildcardBridgeRows.forEach((row) => {
    markdown.push(`- \`${row.routeKey}\` still maps to \`ModuleBridgePage\`.`);
  });
  if (allowWildcardBridgeOverride) {
    markdown.push('', 'The guard is bypassed because `OPENCATS_ALLOW_BRIDGE_WILDCARD=1` is set.');
  }
}

writeFileSync(reportPath, `${markdown.join('\n')}\n`, 'utf8');
console.log(`[modern-ui] Wrote bridge wildcard retirement check: ${reportPath}`);

if (!retiredPass) {
  if (globalWildcardBridgeRow && strictMode) {
    console.error('[modern-ui] Global wildcard route *.* still maps to ModuleBridgePage.');
  }
  if (nonGlobalWildcardBridgeRows.length > 0) {
    console.error(`[modern-ui] Additional bridge wildcard mappings detected (${nonGlobalWildcardBridgeRows.length}).`);
  }
  process.exit(1);
}
