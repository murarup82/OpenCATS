import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..', '..', '..');
const matrixPath = resolve(repoRoot, 'docs', 'modern-ui-operations-ownership-matrix.md');
const outputPath = resolve(repoRoot, 'docs', 'modern-ui-operations-ownership-review-reminder.md');

function parseOwnershipRows(markdown) {
  const lines = markdown.split(/\r?\n/);
  const rows = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|') || trimmed.includes('---')) {
      continue;
    }

    const cells = trimmed
      .split('|')
      .slice(1, -1)
      .map((value) => value.trim());

    if (cells.length < 5 || cells[0] === 'Area') {
      continue;
    }

    rows.push({
      area: cells[0],
      primary: cells[1],
      secondary: cells[2],
      escalation: cells[3],
      notes: cells[4]
    });
  }

  return rows;
}

function addDays(date, days) {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

const matrix = readFileSync(matrixPath, 'utf8');
const rows = parseOwnershipRows(matrix);
const incompleteRows = rows.filter((row) => row.primary === '' || row.secondary === '' || row.escalation === '');
const generatedAt = new Date();
const nextReviewAt = addDays(generatedAt, 30);

const markdown = [
  '# Operations Ownership Review Reminder',
  '',
  `Generated: ${generatedAt.toISOString()}`,
  `Next Review Due: ${nextReviewAt.toISOString().slice(0, 10)}`,
  `Review Cadence: Monthly during steady-state, weekly during cutover windows.`,
  '',
  '## Matrix Snapshot',
  '',
  `- Total ownership rows: ${rows.length}`,
  `- Rows missing owner/escalation assignments: ${incompleteRows.length}`,
  '',
  '## Review Checklist',
  '',
  '1. Confirm primary/secondary owners are still active for each area.',
  '2. Confirm escalation contacts are reachable during release windows.',
  '3. Confirm notes mention current tools/commands and rollback path.',
  '4. Record review date + reviewer in change log artifacts.',
  '5. Re-run `npm run quality:gate` after ownership updates.',
  '',
  '## Incomplete Ownership Rows',
  ''
];

if (incompleteRows.length === 0) {
  markdown.push('- None.');
} else {
  for (const row of incompleteRows) {
    markdown.push(`- ${row.area}`);
  }
}

markdown.push('', '## Source', '', '- `docs/modern-ui-operations-ownership-matrix.md`');

writeFileSync(outputPath, `${markdown.join('\n')}\n`, 'utf8');
console.log(`[modern-ui] Wrote ownership review reminder: ${outputPath}`);
