import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptDir, '..');
const docsPath = resolve(packageRoot, '..', '..', 'docs', 'modern-ui-sanity-report.md');
const npmBin = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const checks = [
  { id: 'build', label: 'Frontend Build', command: ['run', 'build'], required: true },
  { id: 'coverage', label: 'Coverage Matrix', command: ['run', 'coverage:matrix'], required: true },
  { id: 'parity-routes', label: 'Route Parity Checklist', command: ['run', 'parity:routes'], required: true },
  { id: 'bridge-wildcards', label: 'Bridge Wildcard Retirement', command: ['run', 'verify:bridge-wildcards'], required: true },
  { id: 'no-bridge-actions', label: 'No-Bridge Action Guard', command: ['run', 'verify:no-bridge-actions'], required: true },
  { id: 'legacy-redirect-guard', label: 'Unexpected Legacy Redirect Guard', command: ['run', 'verify:no-unexpected-legacy-redirects'], required: true },
  { id: 'legacy-fallback-links', label: 'Legacy Fallback Link Guard', command: ['run', 'verify:legacy-fallback-links'], required: true },
  { id: 'shell-noscript-fallback', label: 'Shell No-JS Fallback Guard', command: ['run', 'verify:shell-noscript-fallback'], required: true },
  { id: 'playwright-smoke', label: 'Playwright Workflow Smoke', command: ['run', 'smoke:playwright'], required: true },
  { id: 'smoke-routes', label: 'Route Smoke', command: ['run', 'smoke:routes'], required: false },
  { id: 'smoke-endpoints', label: 'Endpoint Smoke', command: ['run', 'smoke:endpoints'], required: false }
];

function runCheck(check) {
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
  const code = typeof result.status === 'number' ? result.status : 1;
  const success = code === 0;

  return {
    ...check,
    success,
    code,
    stdout,
    stderr
  };
}

function toBlock(text) {
  if (text.trim() === '') {
    return '`(no output)`';
  }
  return ['```text', text, '```'].join('\n');
}

const startedAt = new Date();
const results = checks.map((check) => runCheck(check));
const finishedAt = new Date();

const requiredFailures = results.filter((result) => result.required && !result.success);
const overallSuccess = requiredFailures.length === 0;

const summaryRows = results.map((result) => {
  const status = result.success ? 'Pass' : 'Fail';
  const requiredText = result.required ? 'Yes' : 'No';
  return `| ${result.label} | ${status} | ${requiredText} | ${result.code} |`;
});

const detailSections = results
  .map((result) => {
    const status = result.success ? 'Pass' : 'Fail';
    return [
      `### ${result.label} (${status})`,
      '',
      `Command: \`npm ${result.command.join(' ')}\``,
      '',
      '**stdout**',
      toBlock(result.stdout),
      '',
      '**stderr**',
      toBlock(result.stderr),
      ''
    ].join('\n');
  })
  .join('\n');

const markdown = [
  '# Modern UI Sanity Report',
  '',
  `Started: ${startedAt.toISOString()}`,
  `Finished: ${finishedAt.toISOString()}`,
  `Overall Required Status: **${overallSuccess ? 'Pass' : 'Fail'}**`,
  '',
  '## Summary',
  '',
  '| Check | Status | Required | Exit Code |',
  '| --- | --- | --- | --- |',
  ...summaryRows,
  '',
  '## Details',
  '',
  detailSections
].join('\n');

writeFileSync(docsPath, markdown, 'utf8');
console.log(`[modern-ui] Wrote sanity report: ${docsPath}`);

if (!overallSuccess) {
  process.exit(1);
}
