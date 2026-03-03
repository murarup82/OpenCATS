import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptDir, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const legacyGapReportPath = resolve(repoRoot, 'docs', 'modern-ui-legacy-route-gap-report.json');
const boardMarkdownPath = resolve(repoRoot, 'docs', 'modern-ui-modernization-board.md');
const boardJsonPath = resolve(repoRoot, 'docs', 'modern-ui-modernization-board.json');
const next50Path = resolve(repoRoot, 'docs', 'modern-ui-next-50-change-plan.md');

const LEGACY_DEPENDENT_COMPONENTS = {
  LegacyRedirectPage: {
    bucket: 'legacy-redirect',
    rank: 1,
    guidance: 'Build a native page + contract path and retire full legacy redirect.'
  },
  EntityUtilityActionPage: {
    bucket: 'legacy-utility-wrapper',
    rank: 2,
    guidance: 'Split this utility action into a dedicated native page/action handler.'
  },
  ReportsActionPage: {
    bucket: 'legacy-reports-wrapper',
    rank: 3,
    guidance: 'Replace embedded legacy report action with native report workflow.'
  },
  GraphsActionPage: {
    bucket: 'legacy-graphs-wrapper',
    rank: 3,
    guidance: 'Replace legacy graph action endpoint dependency with native chart rendering.'
  },
  HomeActionPage: {
    bucket: 'home-redirect-wrapper',
    rank: 4,
    guidance: 'Route directly to native home surfaces or dedicated native mutations.'
  }
};

function classifyRow(row) {
  const component = String(row.component || '');
  const resolution = String(row.resolution || '');
  const classification = String(row.classification || '');

  if (classification === 'legacy-unresolved' || resolution === 'legacy') {
    return { status: 'legacy-unresolved', bucket: 'legacy-unresolved', rank: 0, legacyDependent: true };
  }

  if (resolution === 'bridge' || component === 'ModuleBridgePage' || classification.startsWith('bridge-')) {
    return { status: 'bridge', bucket: 'bridge', rank: 0, legacyDependent: true };
  }

  const legacyComponent = LEGACY_DEPENDENT_COMPONENTS[component];
  if (legacyComponent) {
    return {
      status: 'legacy-dependent',
      bucket: legacyComponent.bucket,
      rank: legacyComponent.rank,
      legacyDependent: true
    };
  }

  if (component.endsWith('ActionPage')) {
    return { status: 'modern-native', bucket: 'native-action', rank: 9, legacyDependent: false };
  }

  return { status: 'modern-native', bucket: 'native-surface', rank: 10, legacyDependent: false };
}

function buildTargetGuidance(component) {
  const meta = LEGACY_DEPENDENT_COMPONENTS[component];
  if (meta) {
    return meta.guidance;
  }
  if (component === 'ModuleBridgePage') {
    return 'Add explicit native route mapping and remove wildcard bridge resolution.';
  }
  return 'Define native route behavior and remove unresolved legacy dependency.';
}

const report = JSON.parse(readFileSync(legacyGapReportPath, 'utf8'));
const baseRows = Array.isArray(report.rows) ? report.rows : [];

const rows = baseRows.map((row) => {
  const routeKey = `${row.module}.${row.action}`.toLowerCase();
  const classification = classifyRow(row);
  return {
    ...row,
    routeKey,
    modernizationStatus: classification.status,
    modernizationBucket: classification.bucket,
    modernizationRank: classification.rank,
    legacyDependent: classification.legacyDependent
  };
});

rows.sort((left, right) => {
  const rank = left.modernizationRank - right.modernizationRank;
  if (rank !== 0) {
    return rank;
  }
  const moduleCmp = String(left.module).localeCompare(String(right.module));
  if (moduleCmp !== 0) {
    return moduleCmp;
  }
  return String(left.action).localeCompare(String(right.action));
});

const totals = {
  actions: rows.length,
  modernNative: rows.filter((row) => row.modernizationStatus === 'modern-native').length,
  legacyDependent: rows.filter((row) => row.legacyDependent).length,
  bridge: rows.filter((row) => row.modernizationBucket === 'bridge').length,
  unresolved: rows.filter((row) => row.modernizationBucket === 'legacy-unresolved').length
};

const bucketMap = new Map();
for (const row of rows) {
  const key = row.modernizationBucket;
  const current = bucketMap.get(key) || 0;
  bucketMap.set(key, current + 1);
}
const bucketSummaries = Array.from(bucketMap.entries())
  .map(([bucket, count]) => ({ bucket, count }))
  .sort((left, right) => {
    const rank = (left.bucket === 'legacy-unresolved' ? 0 : 1) - (right.bucket === 'legacy-unresolved' ? 0 : 1);
    if (rank !== 0) {
      return rank;
    }
    return left.bucket.localeCompare(right.bucket);
  });

const moduleMap = new Map();
for (const row of rows) {
  if (!moduleMap.has(row.module)) {
    moduleMap.set(row.module, {
      module: row.module,
      totalActions: 0,
      modernNative: 0,
      legacyDependent: 0
    });
  }
  const summary = moduleMap.get(row.module);
  summary.totalActions += 1;
  if (row.legacyDependent) {
    summary.legacyDependent += 1;
  } else {
    summary.modernNative += 1;
  }
}
const moduleSummaries = Array.from(moduleMap.values()).sort((left, right) => left.module.localeCompare(right.module));

const legacyTargets = rows.filter((row) => row.legacyDependent);
const next50Targets = legacyTargets.slice(0, 50).map((row, index) => ({
  order: index + 1,
  module: row.module,
  action: row.action,
  routeKey: row.routeKey,
  component: row.component,
  bucket: row.modernizationBucket,
  guidance: buildTargetGuidance(row.component)
}));

const generatedAt = new Date().toISOString();
const boardJson = {
  generatedAt,
  sourceReport: 'docs/modern-ui-legacy-route-gap-report.json',
  totals,
  bucketSummaries,
  moduleSummaries,
  next50Targets,
  rows
};

writeFileSync(boardJsonPath, `${JSON.stringify(boardJson, null, 2)}\n`, 'utf8');

const moduleRows = moduleSummaries.map(
  (summary) =>
    `| ${summary.module} | ${summary.totalActions} | ${summary.modernNative} | ${summary.legacyDependent} |`
);
const bucketRows = bucketSummaries.map((summary) => `| ${summary.bucket} | ${summary.count} |`);
const topRows = next50Targets.map(
  (target) =>
    `| ${target.order} | \`${target.routeKey}\` | \`${target.component}\` | ${target.bucket} | ${target.guidance} |`
);

const boardMarkdown = [
  '# Modern UI Modernization Board (Generated)',
  '',
  `Generated: ${generatedAt}`,
  '',
  'This file is generated by `npm run modernization:board`.',
  '',
  '## Summary',
  '',
  `- Actions in legacy comparison report: **${totals.actions}**`,
  `- Modern-native routes (surface + action pages): **${totals.modernNative}**`,
  `- Legacy-dependent routes (redirect/wrapper/bridge/unresolved): **${totals.legacyDependent}**`,
  `- Bridge routes: **${totals.bridge}**`,
  `- Unresolved routes: **${totals.unresolved}**`,
  '',
  '## Bucket Breakdown',
  '',
  '| Bucket | Count |',
  '| --- | ---: |',
  ...bucketRows,
  '',
  '## Module Breakdown',
  '',
  '| Module | Total Actions | Modern-Native | Legacy-Dependent |',
  '| --- | ---: | ---: | ---: |',
  ...moduleRows,
  '',
  '## Next 50 Prioritized Targets',
  '',
  '| # | Route | Current Component | Bucket | Guidance |',
  '| ---: | --- | --- | --- | --- |',
  ...topRows,
  ''
].join('\n');

writeFileSync(boardMarkdownPath, boardMarkdown, 'utf8');

const next50Markdown = [
  '# Modern UI Next 50 Changes Plan',
  '',
  `Generated: ${generatedAt}`,
  '',
  'This file is generated from `docs/modern-ui-legacy-route-gap-report.json` by `npm run modernization:board`.',
  '',
  '## Scope',
  '',
  'Prioritized legacy-dependent route actions that still rely on redirect/wrapper/bridge behavior.',
  '',
  '## 50 Planned Changes',
  '',
  ...next50Targets.map(
    (target) => `${target.order}. \`${target.routeKey}\` (\`${target.component}\`, \`${target.bucket}\`) -> ${target.guidance}`
  ),
  ''
].join('\n');

writeFileSync(next50Path, next50Markdown, 'utf8');

console.log(`[modern-ui] Wrote modernization board: ${boardMarkdownPath}`);
console.log(`[modern-ui] Wrote modernization board JSON: ${boardJsonPath}`);
console.log(`[modern-ui] Wrote next-50 plan: ${next50Path}`);
