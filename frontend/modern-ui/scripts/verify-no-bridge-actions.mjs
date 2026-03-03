import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptDir, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const gapReportPath = resolve(repoRoot, 'docs', 'modern-ui-legacy-route-gap-report.json');
const outputPath = resolve(repoRoot, 'docs', 'modern-ui-no-bridge-actions-check.md');

function parseJSONFile(path) {
  const raw = readFileSync(path, 'utf8');
  return JSON.parse(raw);
}

function isBridgeClassification(value) {
  const normalized = String(value || '').toLowerCase().trim();
  return normalized.startsWith('bridge');
}

function main() {
  const report = parseJSONFile(gapReportPath);
  const totals = report && typeof report === 'object' ? report.totals || {} : {};
  const rows = Array.isArray(report?.rows) ? report.rows : [];

  const bridgeRows = rows.filter((row) => isBridgeClassification(row?.classification));
  const totalBridge = Number(totals.bridge || 0);
  const totalBridgeExplicit = Number(totals.bridgeExplicit || 0);
  const totalBridgeFallback = Number(totals.bridgeFallback || 0);
  const hasBridge = bridgeRows.length > 0 || totalBridge > 0 || totalBridgeExplicit > 0 || totalBridgeFallback > 0;

  const previewRows = bridgeRows.slice(0, 20).map((row) => {
    const moduleName = String(row?.module || '--');
    const actionName = String(row?.action || '--');
    const classification = String(row?.classification || '--');
    const routeKey = String(row?.routeKey || '--');
    return `| ${moduleName} | ${actionName} | ${classification} | ${routeKey} |`;
  });

  const markdown = [
    '# Modern UI Bridge Action Guard',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Totals',
    '',
    `- Bridge (total): ${totalBridge}`,
    `- Bridge explicit: ${totalBridgeExplicit}`,
    `- Bridge fallback: ${totalBridgeFallback}`,
    `- Bridge-classified rows: ${bridgeRows.length}`,
    '',
    hasBridge ? '## Bridge Rows (Preview)' : '## Result',
    '',
    hasBridge
      ? ['| Module | Action | Classification | Route Key |', '| --- | --- | --- | --- |', ...previewRows].join('\n')
      : 'No bridge-classified actions detected in the legacy-modern gap report.',
    ''
  ].join('\n');

  writeFileSync(outputPath, markdown, 'utf8');
  console.log(`[modern-ui] Wrote no-bridge-action guard report: ${outputPath}`);

  if (hasBridge) {
    console.error(
      `[modern-ui] Bridge actions detected (bridge=${totalBridge}, bridgeExplicit=${totalBridgeExplicit}, bridgeFallback=${totalBridgeFallback}, rows=${bridgeRows.length}).`
    );
    process.exit(1);
  }
}

main();
