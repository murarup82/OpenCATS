import { existsSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptDir, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const npmBin = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const checks = [
  { id: 'sanity', label: 'Sanity Report', command: ['run', 'sanity:modern'], required: true },
  { id: 'scorecard', label: 'Scorecard Prefill', command: ['run', 'scorecard:prefill'], required: true },
  { id: 'fixtures', label: 'Fixture Lint', command: ['run', 'fixtures:lint'], required: true },
  { id: 'cutoverEvidence', label: 'Cutover Evidence Snapshot', command: ['run', 'cutover:evidence'], required: true },
  { id: 'deprecationEvidence', label: 'Deprecation Evidence Validation', command: ['run', 'deprecation:validate'], required: true }
];

const evidenceFiles = [
  'docs/modern-ui-route-coverage.md',
  'docs/modern-ui-sanity-report.md',
  'docs/modern-ui-parity-checklist.md',
  'docs/modern-ui-rollout-scorecard.md',
  'docs/modern-ui-rollout-scorecard-prefill.md',
  'docs/modern-ui-release-runbook.md',
  'docs/modern-ui-cutover-checklist.md',
  'docs/modern-ui-cutover-evidence-links.md',
  'docs/modern-ui-deprecation-evidence-check.md'
];

function runCommand(check) {
  const commandLine = `${npmBin} ${check.command.join(' ')}`;
  const result = spawnSync(commandLine, [], {
    cwd: packageRoot,
    encoding: 'utf8',
    stdio: 'pipe',
    shell: true
  });

  const stdout = String(result.stdout || '').trim();
  const errorText = result.error ? String(result.error.message || result.error) : '';
  const stderr = [String(result.stderr || '').trim(), errorText].filter((value) => value !== '').join('\n');
  const exitCode = typeof result.status === 'number' ? result.status : 1;

  return {
    ...check,
    commandLine,
    exitCode,
    success: exitCode === 0,
    stdout,
    stderr
  };
}

function toBlock(text) {
  if (!text || text.trim() === '') {
    return '`(no output)`';
  }
  return ['```text', text, '```'].join('\n');
}

const startedAt = new Date();
const commandResults = checks.map(runCommand);
const evidenceResults = evidenceFiles.map((relativePath) => {
  const absolutePath = resolve(repoRoot, relativePath);
  return {
    path: relativePath,
    exists: existsSync(absolutePath)
  };
});
const finishedAt = new Date();

const commandFailures = commandResults.filter((result) => result.required && !result.success);
const missingEvidence = evidenceResults.filter((result) => !result.exists);
const overallSuccess = commandFailures.length === 0 && missingEvidence.length === 0;

const summaryRows = [
  ...commandResults.map(
    (result) =>
      `| Command: ${result.label} | ${result.success ? 'Pass' : 'Fail'} | ${result.exitCode} |`
  ),
  ...evidenceResults.map(
    (result) =>
      `| Evidence: \`${result.path}\` | ${result.exists ? 'Pass' : 'Fail'} | ${result.exists ? 'present' : 'missing'} |`
  )
];

const detailSections = commandResults
  .map((result) =>
    [
      `### ${result.label} (${result.success ? 'Pass' : 'Fail'})`,
      '',
      `Command: \`${result.commandLine}\``,
      '',
      '**stdout**',
      toBlock(result.stdout),
      '',
      '**stderr**',
      toBlock(result.stderr),
      ''
    ].join('\n')
  )
  .join('\n');

const markdown = [
  '# Modern UI Quality Gate Report',
  '',
  `Started: ${startedAt.toISOString()}`,
  `Finished: ${finishedAt.toISOString()}`,
  `Overall Status: **${overallSuccess ? 'Pass' : 'Fail'}**`,
  '',
  '## Summary',
  '',
  '| Check | Status | Detail |',
  '| --- | --- | --- |',
  ...summaryRows,
  '',
  '## Command Details',
  '',
  detailSections
].join('\n');

const outputPath = resolve(repoRoot, 'docs', 'modern-ui-quality-gate.md');
writeFileSync(outputPath, markdown, 'utf8');
console.log(`[modern-ui] Wrote quality gate report: ${outputPath}`);

if (!overallSuccess) {
  process.exit(1);
}
