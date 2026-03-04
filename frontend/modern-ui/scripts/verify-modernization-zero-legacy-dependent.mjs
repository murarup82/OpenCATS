import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptDir, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const boardJsonPath = resolve(repoRoot, 'docs', 'modern-ui-modernization-board.json');
const outputPath = resolve(repoRoot, 'docs', 'modern-ui-zero-legacy-dependent-check.md');

function parseJSONFile(path) {
  const raw = readFileSync(path, 'utf8');
  return JSON.parse(raw);
}

function main() {
  const board = parseJSONFile(boardJsonPath);
  const totals = board && typeof board === 'object' ? board.totals || {} : {};
  const rows = Array.isArray(board?.rows) ? board.rows : [];

  const legacyDependentCount = Number(totals.legacyDependent || 0);
  const legacyRows = rows.filter((row) => Boolean(row?.legacyDependent));

  const previewRows = legacyRows.slice(0, 25).map((row) => {
    const routeKey = String(row?.routeKey || `${row?.module || '--'}.${row?.action || '--'}`);
    const component = String(row?.component || '--');
    const bucket = String(row?.modernizationBucket || '--');
    return `| \`${routeKey}\` | ${component} | ${bucket} |`;
  });

  const markdown = [
    '# Modern UI Zero Legacy-Dependent Guard',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Totals',
    '',
    `- Modern-native routes: ${Number(totals.modernNative || 0)}`,
    `- Legacy-dependent routes: ${legacyDependentCount}`,
    '',
    legacyRows.length > 0 ? '## Legacy-Dependent Routes (Preview)' : '## Result',
    '',
    legacyRows.length > 0
      ? ['| Route | Component | Bucket |', '| --- | --- | --- |', ...previewRows].join('\n')
      : 'No legacy-dependent routes detected in modernization board.',
    ''
  ].join('\n');

  writeFileSync(outputPath, markdown, 'utf8');
  console.log(`[modern-ui] Wrote zero-legacy-dependent guard report: ${outputPath}`);

  if (legacyDependentCount > 0 || legacyRows.length > 0) {
    console.error(
      `[modern-ui] Legacy-dependent routes detected (totals.legacyDependent=${legacyDependentCount}, rows=${legacyRows.length}).`
    );
    process.exit(1);
  }
}

main();

