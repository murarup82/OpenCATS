import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptDir, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const routeRegistryPath = resolve(packageRoot, 'src', 'lib', 'routeRegistry.ts');
const uiConfigPath = resolve(repoRoot, 'config.ui.php');
const outputPath = resolve(repoRoot, 'docs', 'modern-ui-legacy-forward-endpoints-check.md');

const expectedRoutesByCategory = {};

const expectedExcludedRoutes = ['wizard.ajax_getpage'];

function extractLegacyForwardRoutes(source) {
  const routeRegex = /'([^']+)'\s*:\s*LegacyUtilityForwardActionPage/g;
  const routes = [];
  let match;

  while ((match = routeRegex.exec(source)) !== null) {
    routes.push(String(match[1] || '').trim().toLowerCase());
  }

  return routes;
}

function extractUIExcludeRoutes(source) {
  const blockMatch = source.match(/UI_SWITCH_EXCLUDE_ROUTES'\]\s*=\s*array\s*\(([\s\S]*?)\);/i);
  if (!blockMatch || !blockMatch[1]) {
    return [];
  }

  const block = blockMatch[1];
  const routeRegex = /'([^']+)'/g;
  const routes = [];
  let match;

  while ((match = routeRegex.exec(block)) !== null) {
    routes.push(String(match[1] || '').trim().toLowerCase());
  }

  return routes;
}

function main() {
  const routeRegistrySource = readFileSync(routeRegistryPath, 'utf8');
  const uiConfigSource = readFileSync(uiConfigPath, 'utf8');

  const actualRoutes = extractLegacyForwardRoutes(routeRegistrySource);
  const actualSet = new Set(actualRoutes);
  const excludedRoutes = extractUIExcludeRoutes(uiConfigSource);
  const excludedSet = new Set(excludedRoutes);

  const expectedRoutes = Object.values(expectedRoutesByCategory).flat();
  const expectedSet = new Set(expectedRoutes);

  const unexpectedRoutes = actualRoutes.filter((routeKey) => !expectedSet.has(routeKey));
  const missingExpectedRoutes = expectedRoutes.filter((routeKey) => !actualSet.has(routeKey));
  const missingExcludedRoutes = expectedExcludedRoutes.filter((routeKey) => !excludedSet.has(routeKey));
  const hasDuplicates = actualRoutes.length !== actualSet.size;

  const rowsByCategory = Object.entries(expectedRoutesByCategory).map(([category, routeKeys]) => {
    const rows = routeKeys.map((routeKey) => {
      const present = actualSet.has(routeKey);
      return `| ${category} | \`${routeKey}\` | ${present ? 'Present' : 'Missing'} |`;
    });
    return rows.join('\n');
  });

  const hasExpectedInventory = rowsByCategory.length > 0;

  const markdown = [
    '# Modern UI Intentional Legacy-Forward Endpoint Guard',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    'This guard ensures endpoint-style routes have migrated off `LegacyUtilityForwardActionPage` while preserving required UI switch excludes.',
    '',
    '## Totals',
    '',
    `- Actual legacy-forward routes: ${actualRoutes.length}`,
    `- Expected legacy-forward routes: ${expectedRoutes.length}`,
    `- Unexpected routes: ${unexpectedRoutes.length}`,
    `- Missing expected routes: ${missingExpectedRoutes.length}`,
    `- Missing required UI switch excludes: ${missingExcludedRoutes.length}`,
    `- Duplicate route mappings detected: ${hasDuplicates ? 'yes' : 'no'}`,
    '',
    '## Expected Route Inventory',
    '',
    ...(hasExpectedInventory
      ? [
          '| Category | Route | Status |',
          '| --- | --- | --- |',
          ...rowsByCategory
        ]
      : ['None. `LegacyUtilityForwardActionPage` inventory is expected to be empty.']),
    '',
    unexpectedRoutes.length > 0 ? '## Unexpected Routes (Must Classify)' : '## Unexpected Routes',
    '',
    unexpectedRoutes.length > 0
      ? unexpectedRoutes.map((routeKey) => `- \`${routeKey}\``).join('\n')
      : 'None.',
    '',
    missingExpectedRoutes.length > 0 ? '## Missing Expected Routes (Review Needed)' : '## Missing Expected Routes',
    '',
    missingExpectedRoutes.length > 0
      ? missingExpectedRoutes.map((routeKey) => `- \`${routeKey}\``).join('\n')
      : 'None.',
    '',
    missingExcludedRoutes.length > 0 ? '## Missing Required UI Switch Excludes' : '## Required UI Switch Excludes',
    '',
    missingExcludedRoutes.length > 0
      ? missingExcludedRoutes.map((routeKey) => `- \`${routeKey}\``).join('\n')
      : expectedExcludedRoutes.map((routeKey) => `- \`${routeKey}\``).join('\n'),
    ''
  ].join('\n');

  writeFileSync(outputPath, markdown, 'utf8');
  console.log(`[modern-ui] Wrote legacy-forward endpoint guard report: ${outputPath}`);

  if (
    unexpectedRoutes.length > 0 ||
    missingExpectedRoutes.length > 0 ||
    missingExcludedRoutes.length > 0 ||
    hasDuplicates
  ) {
    if (unexpectedRoutes.length > 0) {
      console.error(`[modern-ui] Unexpected legacy-forward routes detected (${unexpectedRoutes.length}).`);
    }
    if (missingExpectedRoutes.length > 0) {
      console.error(`[modern-ui] Expected legacy-forward routes missing (${missingExpectedRoutes.length}).`);
    }
    if (missingExcludedRoutes.length > 0) {
      console.error(`[modern-ui] Required UI switch excludes missing (${missingExcludedRoutes.length}).`);
    }
    if (hasDuplicates) {
      console.error('[modern-ui] Duplicate legacy-forward route mappings detected.');
    }
    process.exit(1);
  }
}

main();
