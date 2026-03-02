import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptDir, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const checklistPath = resolve(repoRoot, 'docs', 'modern-ui-cutover-checklist.md');
const evidenceSnapshotPath = resolve(repoRoot, 'docs', 'modern-ui-cutover-evidence-links.md');

const evidenceFiles = [
  'docs/modern-ui-sanity-report.md',
  'docs/modern-ui-route-coverage.md',
  'docs/modern-ui-parity-checklist.md',
  'docs/modern-ui-rollout-scorecard.md',
  'docs/modern-ui-rollout-scorecard-prefill.md',
  'docs/modern-ui-release-runbook.md',
  'docs/modern-ui-quality-gate.md',
  'docs/modern-ui-legacy-route-gap-report.md',
  'docs/modern-ui-deprecation-evidence-check.md'
];

const generatedAt = new Date().toISOString();
const evidenceRows = evidenceFiles.map((relativePath) => {
  const absolutePath = resolve(repoRoot, relativePath);
  const exists = existsSync(absolutePath);
  return {
    path: relativePath,
    exists,
    modifiedAt: exists ? statSync(absolutePath).mtime.toISOString() : ''
  };
});

const snapshotMarkdown = [
  '# Cutover Evidence Snapshot',
  '',
  `Generated: ${generatedAt}`,
  '',
  '| Evidence | Exists | Last Modified |',
  '| --- | --- | --- |',
  ...evidenceRows.map((row) => `| \`${row.path}\` | ${row.exists ? 'Yes' : 'No'} | ${row.modifiedAt || '--'} |`)
].join('\n');

writeFileSync(evidenceSnapshotPath, `${snapshotMarkdown}\n`, 'utf8');
console.log(`[modern-ui] Wrote cutover evidence snapshot: ${evidenceSnapshotPath}`);

if (existsSync(checklistPath)) {
  const checklist = readFileSync(checklistPath, 'utf8');
  const requiredBullet = '- `docs/modern-ui-cutover-evidence-links.md` (auto-generated snapshot)';

  if (!checklist.includes(requiredBullet)) {
    const sectionHeader = '## Evidence Links';
    let updatedChecklist;

    if (checklist.includes(sectionHeader)) {
      updatedChecklist = checklist.replace(sectionHeader, `${sectionHeader}\n\n${requiredBullet}`);
    } else {
      updatedChecklist = `${checklist.trimEnd()}\n\n## Evidence Links\n\n${requiredBullet}\n`;
    }

    writeFileSync(checklistPath, updatedChecklist, 'utf8');
    console.log(`[modern-ui] Updated cutover checklist links: ${checklistPath}`);
  }
}
