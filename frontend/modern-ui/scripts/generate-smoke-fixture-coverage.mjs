import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..', '..', '..');
const fixturesPath = resolve(repoRoot, 'frontend', 'modern-ui', 'scripts', 'fixtures', 'mutation-safe-replays.json');
const endpointsScriptPath = resolve(repoRoot, 'frontend', 'modern-ui', 'scripts', 'smoke-modern-endpoints.mjs');
const outputPath = resolve(repoRoot, 'docs', 'modern-ui-smoke-fixture-coverage.md');

function readJSON(path) {
  const raw = readFileSync(path, 'utf8');
  return JSON.parse(raw);
}

function parseEndpointIDs(scriptText) {
  const blockMatch = /const\s+endpointChecks\s*=\s*\[([\s\S]*?)\n\];/m.exec(scriptText);
  if (!blockMatch) {
    return [];
  }

  const block = blockMatch[1];
  const ids = [];
  const idRegex = /id:\s*'([^']+)'/g;
  let match;
  while ((match = idRegex.exec(block)) !== null) {
    ids.push(match[1]);
  }

  return Array.from(new Set(ids)).sort((a, b) => a.localeCompare(b));
}

function moduleNameFromID(id) {
  const parts = String(id || '').split('.');
  return parts.length > 0 && parts[0] ? parts[0] : 'unknown';
}

const fixtures = Array.isArray(readJSON(fixturesPath)) ? readJSON(fixturesPath) : [];
const endpointScript = readFileSync(endpointsScriptPath, 'utf8');
const endpointIDs = parseEndpointIDs(endpointScript);
const endpointSet = new Set(endpointIDs);

const fixtureBySource = new Map();
for (const fixture of fixtures) {
  const source = String(fixture.sourceCheckID || '').trim();
  if (!fixtureBySource.has(source)) {
    fixtureBySource.set(source, []);
  }
  fixtureBySource.get(source).push(String(fixture.id || 'unknown-fixture'));
}

const coveredEndpoints = endpointIDs.filter((id) => fixtureBySource.has(id));
const uncoveredEndpoints = endpointIDs.filter((id) => !fixtureBySource.has(id));

const moduleCoverage = new Map();
for (const endpointID of endpointIDs) {
  const moduleName = moduleNameFromID(endpointID);
  if (!moduleCoverage.has(moduleName)) {
    moduleCoverage.set(moduleName, { module: moduleName, endpointChecks: 0, coveredChecks: 0 });
  }

  const row = moduleCoverage.get(moduleName);
  row.endpointChecks += 1;
  if (fixtureBySource.has(endpointID)) {
    row.coveredChecks += 1;
  }
}

const orphanFixtures = fixtures.filter((fixture) => {
  const source = String(fixture.sourceCheckID || '').trim();
  return source === '' || !endpointSet.has(source);
});

const moduleRows = Array.from(moduleCoverage.values())
  .sort((a, b) => a.module.localeCompare(b.module))
  .map((row) => {
    const pct = row.endpointChecks > 0 ? `${Math.round((row.coveredChecks / row.endpointChecks) * 100)}%` : '0%';
    return { ...row, coveragePct: pct };
  });

const markdown = [
  '# Modern UI Smoke Fixture Coverage Report',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  '## Summary',
  '',
  `- Endpoint checks discovered: ${endpointIDs.length}`,
  `- Endpoint checks with replay fixtures: ${coveredEndpoints.length}`,
  `- Endpoint checks without replay fixtures: ${uncoveredEndpoints.length}`,
  `- Fixture entries: ${fixtures.length}`,
  `- Orphan fixtures (missing source check): ${orphanFixtures.length}`,
  '',
  '## Module Coverage',
  '',
  '| Module | Endpoint Checks | Covered By Fixtures | Coverage |',
  '| --- | ---: | ---: | ---: |',
  ...moduleRows.map((row) => `| ${row.module} | ${row.endpointChecks} | ${row.coveredChecks} | ${row.coveragePct} |`),
  '',
  '## Covered Endpoint Checks',
  '',
  '| Endpoint Check | Fixture IDs |',
  '| --- | --- |',
  ...coveredEndpoints.map((id) => `| ${id} | ${fixtureBySource.get(id).join(', ')} |`),
  '',
  '## Uncovered Endpoint Checks',
  ''
];

if (uncoveredEndpoints.length === 0) {
  markdown.push('- None.');
} else {
  for (const id of uncoveredEndpoints) {
    markdown.push(`- ${id}`);
  }
}

markdown.push('', '## Orphan Fixtures', '');
if (orphanFixtures.length === 0) {
  markdown.push('- None.');
} else {
  for (const fixture of orphanFixtures) {
    markdown.push(`- ${fixture.id || 'unknown-id'} (sourceCheckID=${fixture.sourceCheckID || 'missing'})`);
  }
}

writeFileSync(outputPath, `${markdown.join('\n')}\n`, 'utf8');
console.log(`[modern-ui] Wrote smoke fixture coverage report: ${outputPath}`);
