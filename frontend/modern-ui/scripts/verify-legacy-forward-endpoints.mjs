import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptDir, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const routeRegistryPath = resolve(packageRoot, 'src', 'lib', 'routeRegistry.ts');
const outputPath = resolve(repoRoot, 'docs', 'modern-ui-legacy-forward-endpoints-check.md');

const expectedRoutesByCategory = {
  'Calendar legacy feed endpoint': [
    'calendar.dynamicdata'
  ],
  'Attachment/export/download endpoints': [
    'attachments.getattachment',
    'export.export',
    'export.exportbydatagrid',
    'gdpr.export',
    'xml.joborders'
  ],
  'Settings AJAX and mutation endpoints': [
    'settings.ajax_tags_add',
    'settings.ajax_tags_del',
    'settings.ajax_tags_upd',
    'settings.ajax_wizardadduser',
    'settings.ajax_wizardcheckkey',
    'settings.ajax_wizarddeleteuser',
    'settings.ajax_wizardemail',
    'settings.ajax_wizardfirsttimesetup',
    'settings.ajax_wizardimport',
    'settings.ajax_wizardlicense',
    'settings.ajax_wizardlocalization',
    'settings.ajax_wizardpassword',
    'settings.ajax_wizardsitename',
    'settings.ajax_wizardwebsite',
    'settings.oncareerportaltweak'
  ],
  'Toolbar integration endpoints': [
    'toolbar.attemptlogin',
    'toolbar.authenticate',
    'toolbar.checkemailisinsystem',
    'toolbar.getjavascriptlib',
    'toolbar.getlicensekey',
    'toolbar.getremoteversion',
    'toolbar.storemonsterresumetext'
  ],
  'Wizard AJAX endpoint': [
    'wizard.ajax_getpage'
  ]
};

function extractLegacyForwardRoutes(source) {
  const routeRegex = /'([^']+)'\s*:\s*LegacyUtilityForwardActionPage/g;
  const routes = [];
  let match;

  while ((match = routeRegex.exec(source)) !== null) {
    routes.push(String(match[1] || '').trim().toLowerCase());
  }

  return routes;
}

function main() {
  const source = readFileSync(routeRegistryPath, 'utf8');
  const actualRoutes = extractLegacyForwardRoutes(source);
  const actualSet = new Set(actualRoutes);

  const expectedRoutes = Object.values(expectedRoutesByCategory).flat();
  const expectedSet = new Set(expectedRoutes);

  const unexpectedRoutes = actualRoutes.filter((routeKey) => !expectedSet.has(routeKey));
  const missingExpectedRoutes = expectedRoutes.filter((routeKey) => !actualSet.has(routeKey));
  const hasDuplicates = actualRoutes.length !== actualSet.size;

  const rowsByCategory = Object.entries(expectedRoutesByCategory).map(([category, routeKeys]) => {
    const rows = routeKeys.map((routeKey) => {
      const present = actualSet.has(routeKey);
      return `| ${category} | \`${routeKey}\` | ${present ? 'Present' : 'Missing'} |`;
    });
    return rows.join('\n');
  });

  const markdown = [
    '# Modern UI Intentional Legacy-Forward Endpoint Guard',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    'This guard tracks endpoint-style routes that intentionally remain on `LegacyUtilityForwardActionPage` to avoid breaking download, AJAX, auth, XML, and mutation compatibility behavior.',
    '',
    '## Totals',
    '',
    `- Actual legacy-forward routes: ${actualRoutes.length}`,
    `- Expected legacy-forward routes: ${expectedRoutes.length}`,
    `- Unexpected routes: ${unexpectedRoutes.length}`,
    `- Missing expected routes: ${missingExpectedRoutes.length}`,
    `- Duplicate route mappings detected: ${hasDuplicates ? 'yes' : 'no'}`,
    '',
    '## Expected Route Inventory',
    '',
    '| Category | Route | Status |',
    '| --- | --- | --- |',
    ...rowsByCategory,
    '',
    unexpectedRoutes.length > 0 ? '## Unexpected Routes (Must Classify)' : '## Unexpected Routes',
    '',
    unexpectedRoutes.length > 0
      ? unexpectedRoutes.map((routeKey) => `- \`${routeKey}\``).join('\n')
      : 'None.',
    '',
    missingExpectedRoutes.length > 0 ? '## Missing Expected Routes (Review Needed)' : '## Missing Expected Routes',
    '',
    missingExpectedRoutes.length > 0
      ? missingExpectedRoutes.map((routeKey) => `- \`${routeKey}\``).join('\n')
      : 'None.',
    ''
  ].join('\n');

  writeFileSync(outputPath, markdown, 'utf8');
  console.log(`[modern-ui] Wrote legacy-forward endpoint guard report: ${outputPath}`);

  if (unexpectedRoutes.length > 0 || missingExpectedRoutes.length > 0 || hasDuplicates) {
    if (unexpectedRoutes.length > 0) {
      console.error(`[modern-ui] Unexpected legacy-forward routes detected (${unexpectedRoutes.length}).`);
    }
    if (missingExpectedRoutes.length > 0) {
      console.error(`[modern-ui] Expected legacy-forward routes missing (${missingExpectedRoutes.length}).`);
    }
    if (hasDuplicates) {
      console.error('[modern-ui] Duplicate legacy-forward route mappings detected.');
    }
    process.exit(1);
  }
}

main();
