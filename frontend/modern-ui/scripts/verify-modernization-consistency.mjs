import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptDir, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const gapReportPath = resolve(repoRoot, 'docs', 'modern-ui-legacy-route-gap-report.json');
const boardPath = resolve(repoRoot, 'docs', 'modern-ui-modernization-board.json');
const outputPath = resolve(repoRoot, 'docs', 'modern-ui-modernization-consistency-check.md');

function parseJSON(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function toNumber(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function main() {
  const gap = parseJSON(gapReportPath);
  const board = parseJSON(boardPath);

  const failures = [];
  const checks = [];

  const gapTotals = gap?.totals || {};
  const boardTotals = board?.totals || {};
  const boardRows = Array.isArray(board?.rows) ? board.rows : [];
  const boardModules = Array.isArray(board?.moduleSummaries) ? board.moduleSummaries : [];
  const boardBuckets = Array.isArray(board?.bucketSummaries) ? board.bucketSummaries : [];
  const boardTargets = Array.isArray(board?.next50Targets) ? board.next50Targets : [];

  const gapActions = toNumber(gapTotals.actions);
  const boardActions = toNumber(boardTotals.actions);
  const boardModernNative = toNumber(boardTotals.modernNative);
  const boardLegacyDependent = toNumber(boardTotals.legacyDependent);

  const boardRowCount = boardRows.length;
  const boardLegacyRows = boardRows.filter((row) => Boolean(row?.legacyDependent)).length;
  const boardModernRows = boardRows.filter((row) => !row?.legacyDependent).length;
  const boardModuleTotal = boardModules.reduce((sum, row) => sum + toNumber(row?.totalActions), 0);
  const boardBucketTotal = boardBuckets.reduce((sum, row) => sum + toNumber(row?.count), 0);
  const gapCoverageTotal =
    toNumber(gapTotals.nativeExplicit) +
    toNumber(gapTotals.nativeDefaultFallback) +
    toNumber(gapTotals.bridge) +
    toNumber(gapTotals.unresolved);

  const assertions = [
    {
      label: 'Gap actions equals board actions',
      pass: gapActions === boardActions,
      detail: `${gapActions} vs ${boardActions}`
    },
    {
      label: 'Board row count equals board actions',
      pass: boardRowCount === boardActions,
      detail: `${boardRowCount} vs ${boardActions}`
    },
    {
      label: 'Board modernNative + legacyDependent equals board actions',
      pass: boardModernNative + boardLegacyDependent === boardActions,
      detail: `${boardModernNative} + ${boardLegacyDependent} vs ${boardActions}`
    },
    {
      label: 'Board legacyDependent equals legacyDependent rows',
      pass: boardLegacyDependent === boardLegacyRows,
      detail: `${boardLegacyDependent} vs ${boardLegacyRows}`
    },
    {
      label: 'Board modernNative equals non-legacy rows',
      pass: boardModernNative === boardModernRows,
      detail: `${boardModernNative} vs ${boardModernRows}`
    },
    {
      label: 'Board module totals equal board actions',
      pass: boardModuleTotal === boardActions,
      detail: `${boardModuleTotal} vs ${boardActions}`
    },
    {
      label: 'Board bucket totals equal board actions',
      pass: boardBucketTotal === boardActions,
      detail: `${boardBucketTotal} vs ${boardActions}`
    },
    {
      label: 'Gap coverage totals equal gap actions',
      pass: gapCoverageTotal === gapActions,
      detail: `${gapCoverageTotal} vs ${gapActions}`
    },
    {
      label: 'When legacyDependent is zero, next50 targets is empty',
      pass: boardLegacyDependent > 0 || boardTargets.length === 0,
      detail: `legacyDependent=${boardLegacyDependent}, next50Targets=${boardTargets.length}`
    }
  ];

  for (const assertion of assertions) {
    checks.push(`| ${assertion.label} | ${assertion.pass ? 'Pass' : 'Fail'} | ${assertion.detail} |`);
    if (!assertion.pass) {
      failures.push(`${assertion.label}: ${assertion.detail}`);
    }
  }

  const markdown = [
    '# Modern UI Modernization Consistency Check',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Checks',
    '',
    '| Check | Status | Detail |',
    '| --- | --- | --- |',
    ...checks,
    '',
    failures.length > 0 ? '## Failures' : '## Result',
    '',
    failures.length > 0 ? failures.map((failure) => `- ${failure}`).join('\n') : 'All modernization consistency checks passed.',
    ''
  ].join('\n');

  writeFileSync(outputPath, markdown, 'utf8');
  console.log(`[modern-ui] Wrote modernization consistency check: ${outputPath}`);

  if (failures.length > 0) {
    process.exit(1);
  }
}

main();

