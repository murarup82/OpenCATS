import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..', '..', '..');

const sanityReportPath = resolve(repoRoot, 'docs', 'modern-ui-sanity-report.md');
const outputPath = resolve(repoRoot, 'docs', 'modern-ui-rollout-scorecard-prefill.md');

function readText(path) {
  try {
    return readFileSync(path, 'utf8');
  } catch (_error) {
    return '';
  }
}

function extractCheckStatus(report, checkName) {
  const lines = report.split(/\r?\n/);
  for (const line of lines) {
    if (!line.startsWith('|')) {
      continue;
    }
    if (!line.includes(checkName)) {
      continue;
    }

    const cols = line
      .split('|')
      .map((value) => value.trim())
      .filter((value) => value !== '');
    if (cols.length < 4) {
      continue;
    }

    return {
      status: cols[1],
      exitCode: cols[3]
    };
  }

  return {
    status: 'Unknown',
    exitCode: '-'
  };
}

function escapeRegExp(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function checkWasSkipped(report, checkName) {
  const pattern = new RegExp(
    `###\\s+${escapeRegExp(checkName)}\\s+\\([^\\n]+\\)([\\s\\S]*?)(?=\\n###\\s+|$)`,
    'm'
  );
  const match = pattern.exec(report);
  if (!match) {
    return false;
  }
  const body = String(match[1] || '');
  return body.includes('Skipped:');
}

function scoreFromStatus(status) {
  if (status === 'Pass') {
    return 2;
  }
  if (status === 'Fail') {
    return 0;
  }
  return 1;
}

const sanity = readText(sanityReportPath);
const build = extractCheckStatus(sanity, 'Frontend Build');
const coverage = extractCheckStatus(sanity, 'Coverage Matrix');
const routes = extractCheckStatus(sanity, 'Route Smoke');
const endpoints = extractCheckStatus(sanity, 'Endpoint Smoke');
const routesSkipped = checkWasSkipped(sanity, 'Route Smoke');
const endpointsSkipped = checkWasSkipped(sanity, 'Endpoint Smoke');

const rows = [
  {
    criterion: 'Frontend build (`npm run build`)',
    critical: 'Yes',
    score: scoreFromStatus(build.status),
    evidence: `Sanity report: ${build.status} (exit ${build.exitCode})`
  },
  {
    criterion: 'Coverage matrix generated/reviewed (`npm run coverage:matrix`)',
    critical: 'No',
    score: scoreFromStatus(coverage.status),
    evidence: `Sanity report: ${coverage.status} (exit ${coverage.exitCode})`
  },
  {
    criterion: 'Route smoke in target env (`npm run smoke:routes`)',
    critical: 'Yes',
    score: routesSkipped ? 1 : scoreFromStatus(routes.status),
    evidence: routesSkipped
      ? `Sanity report: ${routes.status} (exit ${routes.exitCode}); skipped in current environment.`
      : `Sanity report: ${routes.status} (exit ${routes.exitCode})`
  },
  {
    criterion: 'Endpoint smoke in target env (`npm run smoke:endpoints`)',
    critical: 'Yes',
    score: endpointsSkipped ? 1 : scoreFromStatus(endpoints.status),
    evidence: endpointsSkipped
      ? `Sanity report: ${endpoints.status} (exit ${endpoints.exitCode}); skipped in current environment.`
      : `Sanity report: ${endpoints.status} (exit ${endpoints.exitCode})`
  },
  {
    criterion: 'Sanity report generated (`npm run sanity:modern`)',
    critical: 'No',
    score: sanity.trim() !== '' ? 2 : 0,
    evidence: sanity.trim() !== '' ? 'Sanity report file present.' : 'Sanity report missing.'
  },
  {
    criterion: 'Route-resolution telemetry shows acceptable native/bridge ratio',
    critical: 'Yes',
    score: 1,
    evidence: 'Pending manual review.'
  },
  {
    criterion: 'Parity checklist completed for impacted modules',
    critical: 'Yes',
    score: 1,
    evidence: 'Pending manual review.'
  },
  {
    criterion: 'Accessibility spot-check completed (keyboard + focus + ARIA)',
    critical: 'Yes',
    score: 1,
    evidence: 'Pending manual review.'
  },
  {
    criterion: 'Rollback path validated (flag/config + runbook)',
    critical: 'Yes',
    score: 1,
    evidence: 'Pending manual review.'
  },
  {
    criterion: 'Stakeholder/UAT sign-off',
    critical: 'Yes',
    score: 1,
    evidence: 'Pending manual review.'
  }
];

const totalScore = rows.reduce((sum, row) => sum + Number(row.score || 0), 0);
const criticalZeros = rows.filter((row) => row.critical === 'Yes' && row.score === 0).length;
const suggestedOutcome = totalScore >= 18 && criticalZeros === 0 ? 'Go' : totalScore >= 14 ? 'Hold' : 'No-Go';

const markdown = [
  '# Modern UI Rollout Scorecard (Prefilled)',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  `Auto-filled total score: **${totalScore} / 20**`,
  `Suggested outcome: **${suggestedOutcome}**`,
  '',
  '| Criterion | Critical | Score (0-2) | Evidence |',
  '| --- | --- | --- | --- |',
  ...rows.map(
    (row) => `| ${row.criterion} | ${row.critical} | ${row.score} | ${row.evidence} |`
  ),
  '',
  '## Notes',
  '',
  '- This prefill only covers machine-derivable checks from the latest sanity report.',
  '- Replace `Pending manual review` entries with validated evidence before final go/no-go decisions.',
  '',
  '## Confidence Notes',
  '',
  `- Route smoke confidence: ${routesSkipped ? 'Limited (skipped, not target-validated)' : 'Validated by executed check'}.`,
  `- Endpoint smoke confidence: ${endpointsSkipped ? 'Limited (skipped, not target-validated)' : 'Validated by executed check'}.`,
  '- Treat skipped smoke checks as provisional and require target-environment execution before final Go decision.'
].join('\n');

writeFileSync(outputPath, markdown, 'utf8');
console.log(`[modern-ui] Wrote rollout scorecard prefill: ${outputPath}`);
