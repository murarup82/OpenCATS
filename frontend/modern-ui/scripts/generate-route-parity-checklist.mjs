import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptDir, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const routeRegistryPath = resolve(packageRoot, 'src', 'lib', 'routeRegistry.ts');
const outputPath = resolve(repoRoot, 'docs', 'modern-ui-route-parity-checklist.md');

const routeSpecs = [
  {
    routeKey: 'lists.show',
    module: 'Lists',
    contractKey: 'lists.detail.v1',
    focus: 'Static list detail parity',
    manualChecks: [
      'Search and pagination parity versus legacy list detail.',
      'Missing-item row rendering and link fallback behavior.',
      'Legacy escape hatch and back-to-lists navigation.'
    ]
  },
  {
    routeKey: 'lists.showlist',
    module: 'Lists',
    contractKey: 'lists.detail.v1',
    focus: 'Saved list detail parity',
    manualChecks: [
      'Saved-list filters and rows-per-page parity.',
      'Entity link routing for candidate/company/contact/job order rows.',
      'Dynamic-list unsupported message and legacy fallback.'
    ]
  },
  {
    routeKey: 'reports.customerdashboard',
    module: 'Reports',
    contractKey: 'reports.customerDashboard.v1',
    focus: 'Customer dashboard parity',
    manualChecks: [
      'Filter-driven metric snapshots match legacy values.',
      'Drill-down detail tables by focus metric.',
      'Source/funnel/trend interactions keep data context.'
    ]
  },
  {
    routeKey: 'reports.graphview',
    module: 'Reports',
    contractKey: 'reports.graphView.v1',
    focus: 'Graph view parity',
    manualChecks: [
      'Graph URL rendering and refresh cycle behavior.',
      'Fullscreen and in-page visual controls.',
      'Legacy graph view fallback and navigation back to reports.'
    ]
  },
  {
    routeKey: 'sourcing.(default)',
    module: 'Sourcing',
    contractKey: 'sourcing.list.v1',
    focus: 'Weekly sourcing parity',
    manualChecks: [
      'Editable weekly values match legacy initial state.',
      'Save mutation success/error handling parity.',
      'Windowed chart reacts to unsaved draft values.'
    ]
  },
  {
    routeKey: 'queue.(default)',
    module: 'Queue',
    contractKey: 'queue.overview.v1',
    focus: 'Queue ops visibility parity',
    manualChecks: [
      'Summary counters align with queue table state.',
      'Task row state mapping (pending/locked/error/completed).',
      'Filter/search/row-limit interactions keep row totals coherent.'
    ]
  },
  {
    routeKey: 'graphs.(default)',
    module: 'Graphs',
    contractKey: 'graphs.overview.v1',
    focus: 'Graphs launcher parity',
    manualChecks: [
      'All launcher cards render valid graph image endpoints.',
      'View-mode and sizing controls alter image requests correctly.',
      'Single/all gallery modes and refresh behavior.'
    ]
  }
];

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
const routePattern = /'([^']+)':\s*([A-Za-z0-9_]+)/g;
const routeComponentMap = new Map();
let match = routePattern.exec(registryBlock);
while (match) {
  routeComponentMap.set(match[1], match[2]);
  match = routePattern.exec(registryBlock);
}

const rows = routeSpecs.map((spec) => {
  const component = routeComponentMap.get(spec.routeKey) || '(missing)';
  const resolution = component === 'ModuleBridgePage' ? 'bridge' : component === '(missing)' ? 'missing' : 'native';
  const automatedEvidence = [
    `contract: \`${spec.contractKey}\``,
    'coverage: `npm run coverage:matrix`',
    'parity doc: this checklist row'
  ].join(' ; ');
  const manualChecks = spec.manualChecks.join(' ; ');

  return {
    ...spec,
    component,
    resolution,
    automatedEvidence,
    manualChecks
  };
});

const nativeCount = rows.filter((row) => row.resolution === 'native').length;
const bridgeCount = rows.filter((row) => row.resolution === 'bridge').length;
const missingCount = rows.filter((row) => row.resolution === 'missing').length;
const generatedAt = new Date().toISOString();

const tableRows = rows.map((row) => {
  const routeText = `\`${row.routeKey}\``;
  const componentText = `\`${row.component}\``;
  const statusText = 'Pending';
  return `| ${row.module} | ${routeText} | ${componentText} | ${row.resolution} | \`${row.contractKey}\` | ${row.focus} | ${row.automatedEvidence} | ${row.manualChecks} | ${statusText} |`;
});

const markdown = [
  '# Modern UI Route Parity Checklist (Generated)',
  '',
  `Generated: ${generatedAt}`,
  '',
  'This file is auto-generated by `npm run parity:routes`.',
  'Scope: newly modernized route set from the active modernization wave.',
  '',
  '## Summary',
  '',
  `- Total tracked routes: **${rows.length}**`,
  `- Native route mappings: **${nativeCount}**`,
  `- Bridge route mappings: **${bridgeCount}**`,
  `- Missing route mappings: **${missingCount}**`,
  '',
  '## Route Checklist',
  '',
  '| Module | Route | Component | Resolution | Contract | Parity Focus | Automated Evidence | Manual Checks | Status |',
  '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  ...tableRows,
  '',
  '## Usage',
  '',
  '1. Regenerate this file with `npm run parity:routes` after route/contract updates.',
  '2. Update `Status` and checklist notes during parity validation in PRs/release checks.',
  '3. Keep this file aligned with `docs/modern-ui-parity-checklist.md` release-gate decisions.',
  ''
].join('\n');

writeFileSync(outputPath, markdown, 'utf8');
console.log(`[modern-ui] Wrote route parity checklist: ${outputPath}`);
