import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptFile = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(scriptFile);
const repoRoot = path.resolve(scriptDir, '../../..');
const modulesDir = path.join(repoRoot, 'modules');
const routeRegistryPath = path.join(repoRoot, 'frontend/modern-ui/src/lib/routeRegistry.ts');
const docsDir = path.join(repoRoot, 'docs');
const reportMarkdownPath = path.join(docsDir, 'modern-ui-legacy-route-gap-report.md');
const reportJsonPath = path.join(docsDir, 'modern-ui-legacy-route-gap-report.json');

const skipModuleDirs = new Set(['tests']);

function stripPhpComments(source) {
  const withoutBlockComments = source.replace(/\/\*[\s\S]*?\*\//g, '');
  const withoutLineComments = withoutBlockComments.replace(/^\s*\/\/.*$/gm, '');
  return withoutLineComments;
}

function listModuleUIFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!skipModuleDirs.has(entry.name.toLowerCase())) {
        files.push(...listModuleUIFiles(fullPath));
      }
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('UI.php')) {
      files.push(fullPath);
    }
  }

  return files;
}

function findMatchingBrace(source, openBraceIndex) {
  let depth = 0;
  for (let i = openBraceIndex; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === '{') {
      depth += 1;
    } else if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        return i;
      }
    }
  }

  return -1;
}

function countChar(line, char) {
  let count = 0;
  for (let i = 0; i < line.length; i += 1) {
    if (line[i] === char) {
      count += 1;
    }
  }
  return count;
}

function extractHandleRequestActions(source) {
  const handleRequestMatch = /function\s+handleRequest\s*\(/i.exec(source);
  if (!handleRequestMatch) {
    return [];
  }

  const handleRequestStart = handleRequestMatch.index;
  const switchMatch = /switch\s*\(\s*\$action\s*\)/i.exec(source.slice(handleRequestStart));
  if (!switchMatch) {
    return [];
  }

  const switchStart = handleRequestStart + switchMatch.index;
  const switchOpenBrace = source.indexOf('{', switchStart);
  if (switchOpenBrace < 0) {
    return [];
  }

  const switchCloseBrace = findMatchingBrace(source, switchOpenBrace);
  if (switchCloseBrace < 0) {
    return [];
  }

  const switchBody = source.slice(switchOpenBrace + 1, switchCloseBrace);
  const lines = switchBody.split(/\r?\n/);
  const actions = [];
  let depth = 1;

  for (const line of lines) {
    const trimmed = line.trim();

    if (depth === 1) {
      const caseMatch = /^case\s+'([^']+)'\s*:/i.exec(trimmed);
      if (caseMatch) {
        actions.push(caseMatch[1]);
      }
    }

    depth += countChar(line, '{');
    depth -= countChar(line, '}');
  }

  return Array.from(new Set(actions)).sort((a, b) => a.localeCompare(b));
}

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

  const registryBody = registryBlockMatch[1];
  const routes = new Map();
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
  const guardedRoutes = new Set();
  if (guardedBlockMatch) {
    const guardedBody = guardedBlockMatch[1];
    const guardedRegex = /'([^']+)'\s*:\s*\[/g;
    let guardedMatch;
    while ((guardedMatch = guardedRegex.exec(guardedBody)) !== null) {
      guardedRoutes.add(guardedMatch[1].toLowerCase());
    }
  }

  return { routes, guardedRoutes };
}

function resolveRoute(moduleName, actionName, routes, guardedRoutes) {
  const moduleKey = moduleName.toLowerCase();
  const actionKey = actionName.toLowerCase();
  const explicitRouteKey = `${moduleKey}.${actionKey}`;
  const explicitComponent = routes.get(explicitRouteKey);

  if (explicitComponent) {
    return {
      routeKey: explicitRouteKey,
      component: explicitComponent,
      resolution: explicitComponent === 'ModuleBridgePage' ? 'bridge' : 'native',
      guarded: guardedRoutes.has(explicitRouteKey)
    };
  } else {
    const fallbackCandidates = actionKey
      ? [`${moduleKey}.*`, '*.*', `${moduleKey}.(default)`]
      : [`${moduleKey}.(default)`, `${moduleKey}.*`, '*.*'];

    for (const routeKey of fallbackCandidates) {
      const component = routes.get(routeKey);
      if (component) {
        return {
          routeKey,
          component,
          resolution: component === 'ModuleBridgePage' ? 'bridge' : 'native',
          guarded: guardedRoutes.has(routeKey)
        };
      }
    }
  }

  return {
    routeKey: '(unresolved)',
    component: '(none)',
    resolution: 'legacy',
    guarded: false
  };
}

function classifyResolution(moduleName, actionName, resolved) {
  const exactKey = `${moduleName.toLowerCase()}.${actionName.toLowerCase()}`;
  const defaultKey = `${moduleName.toLowerCase()}.(default)`;

  if (resolved.resolution === 'legacy') {
    return 'legacy-unresolved';
  }

  if (resolved.routeKey === exactKey && resolved.resolution === 'native') {
    return resolved.guarded ? 'native-explicit-guarded' : 'native-explicit';
  }

  if (resolved.routeKey === defaultKey && resolved.resolution === 'native') {
    return 'native-default-fallback';
  }

  if (resolved.resolution === 'bridge') {
    if (resolved.routeKey === exactKey) {
      return 'bridge-explicit';
    }
    if (resolved.routeKey === `${moduleName.toLowerCase()}.*`) {
      return 'bridge-module-fallback';
    }
    return 'bridge-global-fallback';
  }

  return 'native-other';
}

const routeRegistrySource = fs.readFileSync(routeRegistryPath, 'utf8');
const { routes, guardedRoutes } = parseRouteRegistry(routeRegistrySource);
const moduleUiFiles = listModuleUIFiles(modulesDir);

const rows = [];
for (const moduleFile of moduleUiFiles) {
  const moduleName = path.basename(path.dirname(moduleFile)).toLowerCase();
  const source = stripPhpComments(fs.readFileSync(moduleFile, 'utf8'));
  const actions = extractHandleRequestActions(source);

  for (const actionName of actions) {
    const resolved = resolveRoute(moduleName, actionName, routes, guardedRoutes);
    const classification = classifyResolution(moduleName, actionName, resolved);

    rows.push({
      module: moduleName,
      action: actionName,
      classification,
      routeKey: resolved.routeKey,
      resolution: resolved.resolution,
      component: resolved.component,
      guarded: resolved.guarded
    });
  }
}

rows.sort((a, b) => {
  const moduleCmp = a.module.localeCompare(b.module);
  if (moduleCmp !== 0) {
    return moduleCmp;
  }
  return a.action.localeCompare(b.action);
});

const moduleSummaries = [];
const moduleMap = new Map();
for (const row of rows) {
  if (!moduleMap.has(row.module)) {
    moduleMap.set(row.module, {
      module: row.module,
      totalActions: 0,
      nativeExplicit: 0,
      nativeFallback: 0,
      bridge: 0,
      unresolved: 0
    });
  }

  const summary = moduleMap.get(row.module);
  summary.totalActions += 1;

  if (row.classification === 'native-explicit' || row.classification === 'native-explicit-guarded') {
    summary.nativeExplicit += 1;
  } else if (row.classification === 'native-default-fallback') {
    summary.nativeFallback += 1;
  } else if (row.classification.startsWith('bridge-')) {
    summary.bridge += 1;
  } else if (row.classification === 'legacy-unresolved') {
    summary.unresolved += 1;
  }
}

for (const summary of moduleMap.values()) {
  moduleSummaries.push(summary);
}

moduleSummaries.sort((a, b) => a.module.localeCompare(b.module));

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

const fallbackRowsInScope = rows.filter((row) =>
  inScopeModules.has(row.module) &&
  row.classification !== 'native-explicit' &&
  row.classification !== 'native-explicit-guarded'
);

const byModuleFallback = new Map();
for (const row of fallbackRowsInScope) {
  if (!byModuleFallback.has(row.module)) {
    byModuleFallback.set(row.module, []);
  }
  byModuleFallback.get(row.module).push(row);
}

const generatedAt = new Date().toISOString();
const reportJson = {
  generatedAt,
  totals: {
    actions: rows.length,
    nativeExplicit: rows.filter((row) => row.classification === 'native-explicit' || row.classification === 'native-explicit-guarded').length,
    nativeDefaultFallback: rows.filter((row) => row.classification === 'native-default-fallback').length,
    bridge: rows.filter((row) => row.classification.startsWith('bridge-')).length,
    bridgeExplicit: rows.filter((row) => row.classification === 'bridge-explicit').length,
    bridgeFallback: rows.filter((row) => row.classification === 'bridge-module-fallback' || row.classification === 'bridge-global-fallback').length,
    unresolved: rows.filter((row) => row.classification === 'legacy-unresolved').length
  },
  moduleSummaries,
  rows
};

if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

fs.writeFileSync(reportJsonPath, `${JSON.stringify(reportJson, null, 2)}\n`);

const markdown = [];
markdown.push('# Modern UI Legacy Comparison Report');
markdown.push('');
markdown.push(`Generated: ${generatedAt}`);
markdown.push('');
markdown.push('## Summary');
markdown.push('');
markdown.push(`- Legacy handleRequest actions discovered: ${reportJson.totals.actions}`);
markdown.push(`- Native explicit modern coverage: ${reportJson.totals.nativeExplicit}`);
markdown.push(`- Native default fallback coverage: ${reportJson.totals.nativeDefaultFallback}`);
markdown.push(`- Bridge coverage (explicit + fallback): ${reportJson.totals.bridge}`);
markdown.push(`- Bridge explicit route mapping: ${reportJson.totals.bridgeExplicit}`);
markdown.push(`- Bridge wildcard fallback mapping: ${reportJson.totals.bridgeFallback}`);
markdown.push(`- Legacy unresolved: ${reportJson.totals.unresolved}`);
markdown.push('');
markdown.push('## Module Coverage');
markdown.push('');
markdown.push('| Module | Legacy Actions | Native Explicit | Native Default Fallback | Bridge | Unresolved |');
markdown.push('| --- | ---: | ---: | ---: | ---: | ---: |');
for (const summary of moduleSummaries) {
  markdown.push(
    `| ${summary.module} | ${summary.totalActions} | ${summary.nativeExplicit} | ${summary.nativeFallback} | ${summary.bridge} | ${summary.unresolved} |`
  );
}

markdown.push('');
markdown.push('## In-Scope Missing or Fallback Actions');
markdown.push('');
markdown.push('These are legacy actions for modernized modules that are not mapped as explicit native routes.');
markdown.push('');

const orderedModules = Array.from(byModuleFallback.keys()).sort((a, b) => a.localeCompare(b));
if (orderedModules.length === 0) {
  markdown.push('- None.');
} else {
  for (const moduleName of orderedModules) {
    const moduleRows = byModuleFallback.get(moduleName);
    markdown.push(`### ${moduleName}`);
    markdown.push('');
    markdown.push('| Action | Classification | Resolved Route | Component |');
    markdown.push('| --- | --- | --- | --- |');
    for (const row of moduleRows) {
      markdown.push(`| ${row.action} | ${row.classification} | ${row.routeKey} | ${row.component} |`);
    }
    markdown.push('');
  }
}

markdown.push('## Full Action Matrix');
markdown.push('');
markdown.push('| Module | Action | Classification | Resolved Route | Component |');
markdown.push('| --- | --- | --- | --- | --- |');
for (const row of rows) {
  markdown.push(`| ${row.module} | ${row.action} | ${row.classification} | ${row.routeKey} | ${row.component} |`);
}

fs.writeFileSync(reportMarkdownPath, `${markdown.join('\n')}\n`);

console.log(`Wrote ${path.relative(repoRoot, reportMarkdownPath)}`);
console.log(`Wrote ${path.relative(repoRoot, reportJsonPath)}`);
