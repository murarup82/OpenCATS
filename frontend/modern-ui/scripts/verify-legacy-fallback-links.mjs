import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptDir, '..');

const requiredPages = [
  'src/pages/DashboardMyPage.tsx',
  'src/pages/HomePage.tsx',
  'src/pages/HomeInboxPage.tsx',
  'src/pages/HomeMyNotesPage.tsx',
  'src/pages/KpisPage.tsx',
  'src/pages/KpisDetailsPage.tsx',
  'src/pages/CandidatesListPage.tsx',
  'src/pages/CandidatesShowPage.tsx',
  'src/pages/CandidatesAddPage.tsx',
  'src/pages/CandidatesEditPage.tsx',
  'src/pages/JobOrdersListPage.tsx',
  'src/pages/JobOrdersShowPage.tsx',
  'src/pages/JobOrdersAddPage.tsx',
  'src/pages/JobOrdersEditPage.tsx',
  'src/pages/CompaniesListPage.tsx',
  'src/pages/CompaniesShowPage.tsx',
  'src/pages/CompaniesAddPage.tsx',
  'src/pages/CompaniesEditPage.tsx',
  'src/pages/ContactsListPage.tsx',
  'src/pages/ContactsShowPage.tsx',
  'src/pages/ContactsAddPage.tsx',
  'src/pages/ContactsEditPage.tsx',
  'src/pages/ActivityListPage.tsx',
  'src/pages/CalendarPage.tsx',
  'src/pages/ListsManagePage.tsx',
  'src/pages/ListsDetailPage.tsx',
  'src/pages/ReportsLauncherPage.tsx',
  'src/pages/ReportsCustomerDashboardPage.tsx',
  'src/pages/ReportsGraphViewPage.tsx',
  'src/pages/SourcingPage.tsx',
  'src/pages/QueuePage.tsx',
  'src/pages/GraphsPage.tsx',
  'src/pages/LogsPage.tsx'
];

const failures = [];

for (const relativePath of requiredPages) {
  const absolutePath = resolve(packageRoot, relativePath);
  if (!existsSync(absolutePath)) {
    failures.push(`${relativePath}: file missing`);
    continue;
  }

  const content = readFileSync(absolutePath, 'utf8');
  if (!/Open Legacy/i.test(content)) {
    failures.push(`${relativePath}: missing "Open Legacy" fallback action label`);
  }
}

if (failures.length > 0) {
  console.error(`[modern-ui] Legacy fallback link coverage failed (${failures.length}):`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`[modern-ui] Legacy fallback link coverage passed (${requiredPages.length} pages).`);
