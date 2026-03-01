import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptDir, '..');
const routeRegistryPath = resolve(packageRoot, 'src', 'lib', 'routeRegistry.ts');
const outputPath = resolve(packageRoot, '..', '..', 'docs', 'modern-ui-route-coverage.md');

const source = readFileSync(routeRegistryPath, 'utf8');

function extractBlock(marker) {
  const start = source.indexOf(marker);
  if (start < 0) {
    return '';
  }
  const braceStart = source.indexOf('{', start);
  if (braceStart < 0) {
    return '';
  }

  let depth = 0;
  for (let index = braceStart; index < source.length; index += 1) {
    const char = source[index];
    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(braceStart + 1, index);
      }
    }
  }

  return '';
}

const registryBlock = extractBlock('const registry');
const guardBlock = extractBlock('const guardedRouteParams');

const routeRows = [];
const routePattern = /'([^']+)':\s*([A-Za-z0-9_]+)/g;
let routeMatch = routePattern.exec(registryBlock);
while (routeMatch) {
  const routeKey = routeMatch[1];
  const component = routeMatch[2];
  const moduleName = routeKey.split('.')[0] || '(unknown)';
  const coverage = component === 'ModuleBridgePage' ? 'bridge' : 'native';
  routeRows.push({
    routeKey,
    moduleName,
    component,
    coverage
  });
  routeMatch = routePattern.exec(registryBlock);
}

const routeGuards = new Map();
const guardPattern = /'([^']+)':\s*\[([^\]]*)\]/g;
let guardMatch = guardPattern.exec(guardBlock);
while (guardMatch) {
  const routeKey = guardMatch[1];
  const rawGuardList = guardMatch[2] || '';
  const params = rawGuardList
    .split(',')
    .map((entry) => entry.replace(/['"\s]/g, '').trim())
    .filter((entry) => entry !== '');
  routeGuards.set(routeKey, params);
  guardMatch = guardPattern.exec(guardBlock);
}

routeRows.sort((left, right) => {
  if (left.moduleName === right.moduleName) {
    return left.routeKey.localeCompare(right.routeKey);
  }
  return left.moduleName.localeCompare(right.moduleName);
});

const totalCount = routeRows.length;
const nativeCount = routeRows.filter((row) => row.coverage === 'native').length;
const bridgeCount = routeRows.filter((row) => row.coverage === 'bridge').length;
const nativeRate = totalCount > 0 ? ((nativeCount / totalCount) * 100).toFixed(1) : '0.0';

const moduleSummary = new Map();
for (const row of routeRows) {
  const current = moduleSummary.get(row.moduleName) || { native: 0, bridge: 0 };
  if (row.coverage === 'native') {
    current.native += 1;
  } else {
    current.bridge += 1;
  }
  moduleSummary.set(row.moduleName, current);
}

const summaryLines = Array.from(moduleSummary.entries())
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([moduleName, counts]) => `- \`${moduleName}\`: native=${counts.native}, bridge=${counts.bridge}`);

const routeTableRows = routeRows.map((row) => {
  const guards = routeGuards.get(row.routeKey);
  const guardText = guards && guards.length > 0 ? guards.join(', ') : '-';
  return `| \`${row.routeKey}\` | \`${row.component}\` | ${row.coverage} | ${guardText} |`;
});

const generatedAt = new Date().toISOString();

const markdown = [
  '# Modern UI Route Coverage Matrix',
  '',
  `Generated: ${generatedAt}`,
  '',
  '## Summary',
  '',
  `- Total route mappings: **${totalCount}**`,
  `- Native mappings: **${nativeCount}**`,
  `- Bridge mappings: **${bridgeCount}**`,
  `- Native coverage (mapping-level): **${nativeRate}%**`,
  '',
  '## Module Summary',
  '',
  ...summaryLines,
  '',
  '## Route Detail',
  '',
  '| Route | Component | Coverage | Guarded Params |',
  '| --- | --- | --- | --- |',
  ...routeTableRows,
  ''
].join('\n');

writeFileSync(outputPath, markdown, 'utf8');
console.log(`[modern-ui] Wrote route coverage matrix: ${outputPath}`);
