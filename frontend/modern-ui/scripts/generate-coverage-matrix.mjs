import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptDir, '..');
const routeRegistryPath = resolve(packageRoot, 'src', 'lib', 'routeRegistry.ts');
const outputPath = resolve(packageRoot, '..', '..', 'docs', 'modern-ui-route-coverage.md');

const LEGACY_FORWARD_COMPONENTS = new Set([
  'LegacyDownloadForwardActionPage',
  'LoginLegacyActionPage',
  'UtilityEndpointForwardActionPage',
  'ImportWorkflowActionPage',
  'OperationsWorkspaceActionPage',
  'ReportsWorkflowActionPage',
  'SettingsAdminWorkspaceActionPage',
  'SettingsTagsActionPage',
  'SettingsWizardActionPage',
  'CandidatesWorkspaceActionPage',
  'GraphsWorkspaceActionPage'
]);

function parseRouteRegistry(source) {
  function parseNamedObjectRoutes(constName) {
    const namedBlockMatch = new RegExp(`const\\s+${constName}:[\\s\\S]*?=\\s*\\{([\\s\\S]*?)\\n\\};`, 'm').exec(source);
    if (!namedBlockMatch) {
      return [];
    }

    const namedBody = namedBlockMatch[1];
    const entries = [];
    const routeRegex = /'([^']+)'\s*:\s*([A-Za-z0-9_]+)/g;
    let routeMatch;
    while ((routeMatch = routeRegex.exec(namedBody)) !== null) {
      entries.push({
        routeKey: routeMatch[1].toLowerCase(),
        component: routeMatch[2]
      });
    }

    return entries;
  }

  function parseExplicitBridgeRoutes(constName) {
    const bridgeBlockMatch = new RegExp(
      `const\\s+${constName}\\s*=\\s*buildExplicitBridgeRoutes\\(\\{([\\s\\S]*?)\\}(?:,\\s*([A-Za-z0-9_]+)\\s*)?\\);`,
      'm'
    ).exec(source);
    if (!bridgeBlockMatch) {
      return [];
    }

    const bridgeBody = bridgeBlockMatch[1];
    const componentName = bridgeBlockMatch[2] ? String(bridgeBlockMatch[2]) : 'ModuleBridgePage';
    const entries = [];
    const moduleRegex = /([A-Za-z0-9_]+)\s*:\s*\[([\s\S]*?)\]/g;
    let moduleMatch;
    while ((moduleMatch = moduleRegex.exec(bridgeBody)) !== null) {
      const moduleKey = moduleMatch[1].toLowerCase();
      const actionsBody = moduleMatch[2];
      const actionRegex = /'([^']+)'/g;
      let actionMatch;
      while ((actionMatch = actionRegex.exec(actionsBody)) !== null) {
        entries.push({
          routeKey: `${moduleKey}.${actionMatch[1].toLowerCase()}`,
          component: componentName
        });
      }
    }

    return entries;
  }

  const registryBlockMatch = /const\s+registry:[\s\S]*?=\s*\{([\s\S]*?)\n\};/m.exec(source);
  if (!registryBlockMatch) {
    throw new Error('Unable to parse route registry block.');
  }

  const routes = new Map();
  const registryBody = registryBlockMatch[1];
  const routeRegex = /'([^']+)'\s*:\s*([A-Za-z0-9_]+)/g;
  let routeMatch;
  while ((routeMatch = routeRegex.exec(registryBody)) !== null) {
    routes.set(routeMatch[1].toLowerCase(), routeMatch[2]);
  }

  for (const entry of parseNamedObjectRoutes('explicitNativeActionRoutes')) {
    routes.set(entry.routeKey, entry.component);
  }
  for (const entry of parseExplicitBridgeRoutes('explicitBridgeActionRoutes')) {
    routes.set(entry.routeKey, entry.component);
  }
  for (const entry of parseExplicitBridgeRoutes('explicitActionCompatRoutes')) {
    routes.set(entry.routeKey, entry.component);
  }

  const guardedBlockMatch = /const\s+guardedRouteParams:[\s\S]*?=\s*\{([\s\S]*?)\n\};/m.exec(source);
  const guardedRouteParams = new Map();
  const guardedRoutes = new Set();
  if (guardedBlockMatch) {
    const guardedBody = guardedBlockMatch[1];
    const guardedRegex = /'([^']+)'\s*:\s*\[([^\]]*)\]/g;
    let guardedMatch;
    while ((guardedMatch = guardedRegex.exec(guardedBody)) !== null) {
      const routeKey = guardedMatch[1].toLowerCase();
      guardedRoutes.add(routeKey);
      const rawList = guardedMatch[2] || '';
      const params = rawList
        .split(',')
        .map((entry) => entry.replace(/['"\s]/g, '').trim())
        .filter((entry) => entry !== '');
      guardedRouteParams.set(routeKey, params);
    }
  }

  return { routes, guardedRoutes, guardedRouteParams };
}

function classifyComponent(component) {
  if (component === 'ModuleBridgePage') {
    return 'bridge';
  }

  if (LEGACY_FORWARD_COMPONENTS.has(component)) {
    return 'legacy-forward';
  }

  return 'native-ui';
}

const source = readFileSync(routeRegistryPath, 'utf8');
const { routes, guardedRoutes, guardedRouteParams } = parseRouteRegistry(source);

const routeRows = Array.from(routes.entries()).map(([routeKey, component]) => {
  const moduleName = routeKey.split('.')[0] || '(unknown)';
  const coverage = classifyComponent(component);
  return {
    routeKey,
    moduleName,
    component,
    coverage,
    guarded: guardedRoutes.has(routeKey),
    guardParams: guardedRouteParams.get(routeKey) || []
  };
});

routeRows.sort((left, right) => {
  if (left.moduleName === right.moduleName) {
    return left.routeKey.localeCompare(right.routeKey);
  }
  return left.moduleName.localeCompare(right.moduleName);
});

const totalCount = routeRows.length;
const nativeCount = routeRows.filter((row) => row.coverage === 'native-ui').length;
const legacyForwardCount = routeRows.filter((row) => row.coverage === 'legacy-forward').length;
const bridgeCount = routeRows.filter((row) => row.coverage === 'bridge').length;
const nativeRate = totalCount > 0 ? ((nativeCount / totalCount) * 100).toFixed(1) : '0.0';

const moduleSummary = new Map();
for (const row of routeRows) {
  const current = moduleSummary.get(row.moduleName) || { nativeUI: 0, legacyForward: 0, bridge: 0 };
  if (row.coverage === 'native-ui') {
    current.nativeUI += 1;
  } else if (row.coverage === 'legacy-forward') {
    current.legacyForward += 1;
  } else {
    current.bridge += 1;
  }
  moduleSummary.set(row.moduleName, current);
}

const summaryLines = Array.from(moduleSummary.entries())
  .sort(([left], [right]) => left.localeCompare(right))
  .map(
    ([moduleName, counts]) =>
      `- \`${moduleName}\`: native-ui=${counts.nativeUI}, legacy-forward=${counts.legacyForward}, bridge=${counts.bridge}`
  );

const routeTableRows = routeRows.map((row) => {
  const guardText = row.guardParams.length > 0 ? row.guardParams.join(', ') : '-';
  return `| \`${row.routeKey}\` | \`${row.component}\` | ${row.coverage} | ${guardText} |`;
});

const legacyForwardRows = routeRows.filter((row) => row.coverage === 'legacy-forward');
const bridgeRows = routeRows.filter((row) => row.coverage === 'bridge');

const generatedAt = new Date().toISOString();

const markdown = [
  '# Modern UI Route Coverage Matrix',
  '',
  `Generated: ${generatedAt}`,
  '',
  'This report classifies routeRegistry mappings into true native UI routes, intentional legacy-forward endpoints/wrappers, and bridge fallbacks.',
  '',
  '## Summary',
  '',
  `- Total route mappings: **${totalCount}**`,
  `- True native UI mappings: **${nativeCount}**`,
  `- Intentional legacy-forward mappings: **${legacyForwardCount}**`,
  `- Bridge mappings: **${bridgeCount}**`,
  `- True native UI coverage (mapping-level): **${nativeRate}%**`,
  '',
  '## Module Summary',
  '',
  ...summaryLines,
  '',
  '## Intentional Legacy-Forward Routes',
  '',
  '| Route | Component | Guarded |',
  '| --- | --- | --- |',
  ...(legacyForwardRows.length > 0
    ? legacyForwardRows.map((row) => `| \`${row.routeKey}\` | \`${row.component}\` | ${row.guarded ? 'yes' : 'no'} |`)
    : ['| _(none)_ | _(none)_ | _(none)_ |']),
  '',
  '## Bridge Routes',
  '',
  '| Route | Component | Guarded |',
  '| --- | --- | --- |',
  ...(bridgeRows.length > 0
    ? bridgeRows.map((row) => `| \`${row.routeKey}\` | \`${row.component}\` | ${row.guarded ? 'yes' : 'no'} |`)
    : ['| _(none)_ | _(none)_ | _(none)_ |']),
  '',
  '## Full Route Detail',
  '',
  '| Route | Component | Coverage | Guarded Params |',
  '| --- | --- | --- | --- |',
  ...routeTableRows,
  ''
].join('\n');

writeFileSync(outputPath, markdown, 'utf8');
console.log(`[modern-ui] Wrote route coverage matrix: ${outputPath}`);
