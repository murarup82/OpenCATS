import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptDir, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const pagesDir = resolve(packageRoot, 'src', 'pages');
const outputPath = resolve(repoRoot, 'docs', 'modern-ui-unexpected-legacy-redirects-check.md');

const expectedLegacyRedirectPages = new Set([
  'src/pages/CompaniesInternalPostingsActionPage.tsx',
  'src/pages/ContactVCardActionPage.tsx',
  'src/pages/ImportWorkflowActionPage.tsx',
  'src/pages/LegacyDownloadForwardActionPage.tsx',
  'src/pages/LoginLegacyActionPage.tsx',
  'src/pages/PipelineStatusActionPage.tsx',
  'src/pages/ReportsWorkflowActionPage.tsx',
  'src/pages/SettingsTagsActionPage.tsx',
  'src/pages/UtilityEndpointForwardActionPage.tsx'
]);

function listFilesRecursive(directoryPath) {
  const entries = readdirSync(directoryPath, { withFileTypes: true });
  const files = [];

  entries.forEach((entry) => {
    const fullPath = resolve(directoryPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFilesRecursive(fullPath));
      return;
    }

    if (entry.isFile() && extname(entry.name).toLowerCase() === '.tsx') {
      files.push(fullPath);
    }
  });

  return files;
}

function getLineNumber(source, offset) {
  if (offset <= 0) {
    return 1;
  }
  return source.slice(0, offset).split('\n').length;
}

function collectLegacyRedirectVariableNames(source) {
  const names = new Set();
  const variableRegex = /const\s+([A-Za-z_$][\w$]*)\s*=\s*[\s\S]{0,280}?ensureUIURL\([\s\S]{0,280}?'legacy'[\s\S]{0,120}?\);/g;

  let match;
  while ((match = variableRegex.exec(source)) !== null) {
    const variableName = String(match[1] || '').trim();
    if (variableName !== '') {
      names.add(variableName);
    }
  }

  return names;
}

function collectLegacyRedirectFindings(source, relativePath) {
  const findings = [];
  const legacyVariables = collectLegacyRedirectVariableNames(source);
  const redirectRegex = /window\.location\.(assign|replace)\(([\s\S]{0,200}?)\);/g;

  let match;
  while ((match = redirectRegex.exec(source)) !== null) {
    const method = String(match[1] || '').trim();
    const argument = String(match[2] || '').trim();
    const lowerArgument = argument.toLowerCase();
    const variableRedirect = Array.from(legacyVariables).find((name) => new RegExp(`\\b${name}\\b`).test(argument));
    const isLegacyRedirect =
      lowerArgument.includes('legacy') ||
      lowerArgument.includes("'ui=legacy'") ||
      lowerArgument.includes('"ui=legacy"') ||
      Boolean(variableRedirect);

    if (!isLegacyRedirect) {
      continue;
    }

    findings.push({
      file: relativePath,
      line: getLineNumber(source, match.index),
      method,
      argument: argument.replace(/\s+/g, ' ').slice(0, 180)
    });
  }

  return findings;
}

function main() {
  const pageFiles = listFilesRecursive(pagesDir);
  const findings = pageFiles
    .flatMap((filePath) => {
      const source = readFileSync(filePath, 'utf8');
      const relativePath = relative(packageRoot, filePath).replace(/\\/g, '/');
      return collectLegacyRedirectFindings(source, relativePath);
    })
    .sort((left, right) => {
      const fileComparison = left.file.localeCompare(right.file);
      if (fileComparison !== 0) {
        return fileComparison;
      }
      return left.line - right.line;
    });

  const unexpected = findings.filter((finding) => !expectedLegacyRedirectPages.has(finding.file));
  const expectedUnused = Array.from(expectedLegacyRedirectPages)
    .filter((pagePath) => !findings.some((finding) => finding.file === pagePath))
    .sort((left, right) => left.localeCompare(right));

  const markdown = [
    '# Modern UI Unexpected Legacy Redirect Guard',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    'This guard tracks runtime `window.location.assign/replace` redirects that target legacy URLs.',
    '',
    '## Totals',
    '',
    `- Redirect findings: ${findings.length}`,
    `- Expected legacy-redirect pages: ${expectedLegacyRedirectPages.size}`,
    `- Unexpected redirect findings: ${unexpected.length}`,
    `- Expected pages without redirect findings: ${expectedUnused.length}`,
    '',
    findings.length > 0 ? '## Redirect Findings' : '## Redirect Findings',
    '',
    findings.length > 0
      ? [
          '| File | Line | Method | Argument Preview | Status |',
          '| --- | ---: | --- | --- | --- |',
          ...findings.map((finding) => {
            const status = expectedLegacyRedirectPages.has(finding.file) ? 'Expected' : 'Unexpected';
            return `| \`${finding.file}\` | ${finding.line} | \`${finding.method}\` | \`${finding.argument}\` | ${status} |`;
          })
        ].join('\n')
      : 'No legacy redirect findings detected.',
    '',
    unexpected.length > 0 ? '## Unexpected Findings (Fail)' : '## Unexpected Findings',
    '',
    unexpected.length > 0
      ? unexpected
          .map((finding) => `- \`${finding.file}:${finding.line}\` -> \`${finding.method}(${finding.argument})\``)
          .join('\n')
      : 'None.',
    '',
    expectedUnused.length > 0 ? '## Expected Pages Without Findings (Review Inventory)' : '## Expected Pages Without Findings',
    '',
    expectedUnused.length > 0
      ? expectedUnused.map((pagePath) => `- \`${pagePath}\``).join('\n')
      : 'None.',
    ''
  ].join('\n');

  writeFileSync(outputPath, markdown, 'utf8');
  console.log(`[modern-ui] Wrote unexpected legacy redirect guard report: ${outputPath}`);

  if (unexpected.length > 0) {
    console.error(`[modern-ui] Unexpected legacy redirect findings detected (${unexpected.length}).`);
    process.exit(1);
  }
}

main();

