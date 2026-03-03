import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptDir, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const signoffRelativePath = process.env.DEPRECATION_SIGNOFF_FILE || 'docs/modern-ui-deprecation-signoff.md';
const signoffPath = resolve(repoRoot, signoffRelativePath);
const reportPath = resolve(repoRoot, 'docs', 'modern-ui-deprecation-evidence-check.md');
const strict = process.env.DEPRECATION_SIGNOFF_STRICT === '1';

const requiredEvidenceRows = [
  'Route coverage matrix reviewed',
  'Route-resolution telemetry confirms low/zero fallback hits',
  'Parity checklist complete for affected module(s)',
  'Smoke checks pass in target environment',
  'Rollback path verified',
  'Stakeholder sign-off'
];

const requiredEvidenceFiles = [
  'docs/modern-ui-route-coverage.md',
  'docs/modern-ui-telemetry-dashboard-snippet.md',
  'docs/modern-ui-parity-checklist.md',
  'docs/modern-ui-sanity-report.md',
  'docs/modern-ui-release-runbook.md',
  'docs/modern-ui-cutover-checklist.md',
  'docs/modern-ui-rollout-scorecard.md'
];

function normalizeStatus(value) {
  return String(value || '').trim().toLowerCase();
}

function statusIsComplete(statusText) {
  const status = normalizeStatus(statusText);
  return ['complete', 'completed', 'done', 'approved', 'pass', 'passed', 'ok'].includes(status);
}

function extractDocPaths(text) {
  const paths = new Set();
  const patterns = [
    /\[[^\]]+\]\((docs\/[^)\s]+)\)/g,
    /`(docs\/[^`\s]+)`/g,
    /(docs\/[A-Za-z0-9._\/-]+\.md)/g
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      paths.add(match[1]);
    }
  }

  return Array.from(paths).sort((a, b) => a.localeCompare(b));
}

if (!existsSync(signoffPath)) {
  writeFileSync(
    reportPath,
    `# Deprecation Evidence Check\n\nStatus: **Fail**\n\nSign-off file not found: \`${relative(repoRoot, signoffPath)}\`\n`,
    'utf8'
  );
  console.error(`[modern-ui] Missing sign-off file: ${signoffPath}`);
  process.exit(1);
}

const signoff = readFileSync(signoffPath, 'utf8');
const lines = signoff.split(/\r?\n/);
const evidenceRows = new Map();

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|')) {
    continue;
  }

  const cells = trimmed
    .split('|')
    .slice(1, -1)
    .map((value) => value.trim());

  if (cells.length < 3) {
    continue;
  }

  const evidenceName = cells[0];
  if (!requiredEvidenceRows.includes(evidenceName)) {
    continue;
  }

  evidenceRows.set(evidenceName, {
    evidence: evidenceName,
    link: cells[1],
    status: cells[2]
  });
}

const missingRows = requiredEvidenceRows.filter((name) => !evidenceRows.has(name));
const strictFailures = [];

if (strict) {
  for (const evidenceName of requiredEvidenceRows) {
    const row = evidenceRows.get(evidenceName);
    if (!row) {
      continue;
    }

    if (row.link === '') {
      strictFailures.push(`${evidenceName}: link is empty`);
    }
    if (!statusIsComplete(row.status)) {
      strictFailures.push(`${evidenceName}: status is not complete (${row.status || 'empty'})`);
    }
  }
}

const referencedDocPaths = new Set(requiredEvidenceFiles);
for (const row of evidenceRows.values()) {
  for (const docPath of extractDocPaths(row.link)) {
    referencedDocPaths.add(docPath);
  }
}

const evidenceFileChecks = Array.from(referencedDocPaths)
  .sort((a, b) => a.localeCompare(b))
  .map((relativePath) => {
    const absolutePath = resolve(repoRoot, relativePath);
    const exists = existsSync(absolutePath);
    return {
      path: relativePath,
      exists,
      modifiedAt: exists ? statSync(absolutePath).mtime.toISOString() : ''
    };
  });

const missingFiles = evidenceFileChecks.filter((check) => !check.exists).map((check) => check.path);
const passed = missingRows.length === 0 && strictFailures.length === 0 && missingFiles.length === 0;

const markdown = [
  '# Deprecation Evidence Check',
  '',
  `Sign-off file: \`${relative(repoRoot, signoffPath)}\``,
  `Strict mode: \`${strict ? 'enabled' : 'disabled'}\``,
  `Status: **${passed ? 'Pass' : 'Fail'}**`,
  '',
  '## Required Evidence Rows',
  '',
  '| Evidence | Link | Status |',
  '| --- | --- | --- |',
  ...requiredEvidenceRows.map((name) => {
    const row = evidenceRows.get(name);
    if (!row) {
      return `| ${name} | (missing row) | (missing row) |`;
    }
    return `| ${name} | ${row.link || '(empty)'} | ${row.status || '(empty)'} |`;
  }),
  '',
  '## Evidence Files',
  '',
  '| File | Exists | Last Modified |',
  '| --- | --- | --- |',
  ...evidenceFileChecks.map((check) => `| \`${check.path}\` | ${check.exists ? 'Yes' : 'No'} | ${check.modifiedAt || '--'} |`)
];

if (missingRows.length > 0) {
  markdown.push('', '## Missing Evidence Rows', '');
  for (const item of missingRows) {
    markdown.push(`- ${item}`);
  }
}

if (strictFailures.length > 0) {
  markdown.push('', '## Strict Mode Failures', '');
  for (const item of strictFailures) {
    markdown.push(`- ${item}`);
  }
}

if (missingFiles.length > 0) {
  markdown.push('', '## Missing Evidence Files', '');
  for (const item of missingFiles) {
    markdown.push(`- \`${item}\``);
  }
}

writeFileSync(reportPath, `${markdown.join('\n')}\n`, 'utf8');
console.log(`[modern-ui] Wrote deprecation evidence check: ${reportPath}`);

if (!passed) {
  process.exit(1);
}
