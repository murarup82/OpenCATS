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
  { id: 'fixtureCoverage', label: 'Fixture Coverage Report', command: ['run', 'fixtures:coverage'], required: true },
  { id: 'playwrightSmoke', label: 'Playwright Workflow Smoke', command: ['run', 'smoke:playwright'], required: true },
  { id: 'compareRoutes', label: 'Legacy Route Comparison', command: ['run', 'compare:legacy-routes'], required: true },
  { id: 'modernizationBoard', label: 'Modernization Board', command: ['run', 'modernization:board'], required: true },
  { id: 'verifyModernizationConsistency', label: 'Modernization Consistency Guard', command: ['run', 'verify:modernization-consistency'], required: true },
  { id: 'verifyNoLegacyWrapperRoutes', label: 'No Legacy-Wrapper Route Guard', command: ['run', 'verify:no-legacy-wrapper-routes'], required: true },
  { id: 'verifyLegacyForwardEndpoints', label: 'Intentional Legacy-Forward Endpoint Guard', command: ['run', 'verify:legacy-forward-endpoints'], required: true },
  { id: 'verifyZeroLegacyDependent', label: 'Zero Legacy-Dependent Guard', command: ['run', 'verify:zero-legacy-dependent'], required: true },
  { id: 'verifyInScopeRoutes', label: 'In-Scope Route Fallback Guard', command: ['run', 'verify:in-scope-routes'], required: true },
  { id: 'verifyBridgeWildcards', label: 'Bridge Wildcard Retirement Guard', command: ['run', 'verify:bridge-wildcards'], required: true },
  { id: 'verifyNoBridgeActions', label: 'No-Bridge Action Guard', command: ['run', 'verify:no-bridge-actions'], required: true },
  { id: 'verifyLegacyFallbackLinks', label: 'Legacy Fallback Link Guard', command: ['run', 'verify:legacy-fallback-links'], required: true },
  { id: 'verifyShellNoJSSFallback', label: 'Shell No-JS Fallback Guard', command: ['run', 'verify:shell-noscript-fallback'], required: true },
  { id: 'cutoverEvidence', label: 'Cutover Evidence Snapshot', command: ['run', 'cutover:evidence'], required: true },
  { id: 'deprecationEvidence', label: 'Deprecation Evidence Validation', command: ['run', 'deprecation:validate'], required: true },
  { id: 'ownershipReminder', label: 'Ownership Review Reminder', command: ['run', 'ownership:reminder'], required: true }
];

const evidenceFiles = [
  'docs/modern-ui-route-coverage.md',
  'docs/modern-ui-route-parity-checklist.md',
  'docs/modern-ui-bridge-wildcard-retirement.md',
  'docs/modern-ui-no-legacy-wrapper-routes-check.md',
  'docs/modern-ui-legacy-forward-endpoints-check.md',
  'docs/modern-ui-no-bridge-actions-check.md',
  'docs/modern-ui-sanity-report.md',
  'docs/modern-ui-parity-checklist.md',
  'docs/modern-ui-rollout-scorecard.md',
  'docs/modern-ui-rollout-scorecard-prefill.md',
  'docs/modern-ui-release-runbook.md',
  'docs/modern-ui-cutover-checklist.md',
  'docs/modern-ui-cutover-evidence-links.md',
  'docs/modern-ui-deprecation-evidence-check.md',
  'docs/modern-ui-legacy-route-gap-report.md',
  'docs/modern-ui-modernization-board.md',
  'docs/modern-ui-modernization-board.json',
  'docs/modern-ui-modernization-consistency-check.md',
  'docs/modern-ui-finalization-2026-03-04.md',
  'docs/modern-ui-zero-legacy-dependent-check.md',
  'docs/modern-ui-next-50-change-plan.md',
  'docs/modern-ui-smoke-fixture-coverage.md',
  'docs/modern-ui-telemetry-retention-guidance.md',
  'docs/modern-ui-release-readiness-changelog-template.md',
  'docs/modern-ui-keyboard-shortcuts-extension-plan.md',
  'docs/modern-ui-operations-ownership-review-reminder.md',
  'docs/modern-ui-operations-ownership-review-reminder-process.md'
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
