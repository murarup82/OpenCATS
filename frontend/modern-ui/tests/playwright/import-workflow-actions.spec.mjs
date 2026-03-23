import { expect, test } from '@playwright/test';

const baseURL = String(process.env.OPENCATS_BASE_URL || '').trim();
const indexPath = String(process.env.OPENCATS_INDEX_PATH || '/index.php').trim() || '/index.php';
const sessionCookie = String(process.env.OPENCATS_COOKIE || '').trim();
const contractVersion = 1;
const importLauncherContractKey = 'import.launcher.v1';
const importRevertContractKey = 'import.revert.v1';
const importBulkResumesContractKey = 'import.bulkResumes.v1';
const importDeleteBulkResumesContractKey = 'import.deleteBulkResumes.v1';

function joinURL(root, path) {
  const normalizedRoot = root.endsWith('/') ? root.slice(0, -1) : root;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedRoot}${normalizedPath}`;
}

function buildHeaders() {
  const headers = {};

  if (sessionCookie !== '') {
    headers.Cookie = sessionCookie;
  }

  return headers;
}

function buildModernRouteURL(moduleName, actionName, query = {}) {
  const params = new URLSearchParams({
    m: moduleName,
    a: actionName,
    ui: 'modern'
  });

  Object.entries(query).forEach(([key, value]) => {
    if (value !== null && value !== undefined && String(value) !== '') {
      params.set(key, String(value));
    }
  });

  return `${joinURL(baseURL, indexPath)}?${params.toString()}`;
}

function buildModernJSONURL(moduleName, actionName, modernPage, query = {}) {
  const params = new URLSearchParams({
    m: moduleName,
    a: actionName,
    format: 'modern-json',
    modernPage,
    ui: 'legacy'
  });

  Object.entries(query).forEach(([key, value]) => {
    if (value !== null && value !== undefined && String(value) !== '') {
      params.set(key, String(value));
    }
  });

  return `${joinURL(baseURL, indexPath)}?${params.toString()}`;
}

async function fetchImportLauncherModernJSON(request) {
  const response = await request.get(buildModernJSONURL('import', 'import', 'import-launcher'), {
    headers: buildHeaders(),
    failOnStatusCode: false
  });

  expect(response.ok(), 'import.import should return HTTP 200').toBeTruthy();

  const payload = await response.json();
  const meta = payload?.meta || {};
  const pendingImports = Array.isArray(payload?.pendingImports) ? payload.pendingImports : [];
  const bulkResumeCount = Number(payload?.summary?.bulkResumeCount || 0);

  expect(Number(meta.contractVersion || 0)).toBe(contractVersion);
  expect(String(meta.contractKey || '').trim()).toBe(importLauncherContractKey);
  expect(String(meta.modernPage || '').trim()).toBe('import-launcher');

  if (pendingImports.length > 0) {
    expect(String(pendingImports[0]?.revertURL || '')).toContain('ui=modern');
  }

  return { payload, pendingImports, bulkResumeCount };
}

test.describe('Import workflow route smoke', () => {
  test.skip(baseURL === '', 'Set OPENCATS_BASE_URL to run import workflow smoke checks.');

  test('import.viewpending ui=modern mounts without a runtime boundary', async ({ context, page }) => {
    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    await page.goto(buildModernRouteURL('import', 'viewpending'), {
      waitUntil: 'domcontentloaded'
    });

    await page.waitForTimeout(200);
    await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);
  });

  test('import.revert ui=modern mounts without a runtime boundary and no iframe', async ({
    context,
    page,
    request
  }) => {
    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    const { pendingImports } = await fetchImportLauncherModernJSON(request);
    test.skip(pendingImports.length === 0, 'Set up at least one pending import to run import.revert smoke.');

    await page.goto(
      buildModernRouteURL('import', 'revert', {
        importID: pendingImports[0].importID
      }),
      {
        waitUntil: 'domcontentloaded'
      }
    );

    await page.waitForTimeout(200);
    await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);
    await expect(page.locator('iframe')).toHaveCount(0);
  });

  test('import.revert modern-json returns the import.revert.v1 contract', async ({ request }) => {
    const { pendingImports } = await fetchImportLauncherModernJSON(request);
    test.skip(pendingImports.length === 0, 'Set up at least one pending import to run import.revert contract smoke.');

    const response = await request.get(
      buildModernJSONURL('import', 'revert', 'import-revert', {
        importID: pendingImports[0].importID
      }),
      {
        headers: buildHeaders(),
        failOnStatusCode: false
      }
    );

    expect(response.ok(), 'import.revert should return HTTP 200').toBeTruthy();

    const payload = await response.json();
    const meta = payload?.meta || {};

    expect(Number(meta.contractVersion || 0)).toBe(contractVersion);
    expect(String(meta.contractKey || '').trim()).toBe(importRevertContractKey);
    expect(String(meta.modernPage || '').trim()).toBe('import-revert');
    expect(payload.success).toBe(true);
    expect(String(payload.code || '').trim()).toBe('importReverted');
    expect(String(payload.message || '').trim()).not.toBe('');
  });

  test('import.deletebulkresumes ui=modern mounts without a runtime boundary and no iframe', async ({
    context,
    page,
    request
  }) => {
    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    const { bulkResumeCount } = await fetchImportLauncherModernJSON(request);
    test.skip(bulkResumeCount === 0, 'Set up at least one bulk resume document to run import.deleteBulkResumes smoke.');

    await page.goto(buildModernRouteURL('import', 'deletebulkresumes'), {
      waitUntil: 'domcontentloaded'
    });

    await page.waitForTimeout(200);
    await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);
    await expect(page.locator('iframe')).toHaveCount(0);
  });

  test('import.deleteBulkResumes modern-json returns the import.deleteBulkResumes.v1 contract', async ({ request }) => {
    const { bulkResumeCount } = await fetchImportLauncherModernJSON(request);
    test.skip(
      bulkResumeCount === 0,
      'Set up at least one bulk resume document to run import.deleteBulkResumes contract smoke.'
    );

    const response = await request.get(
      buildModernJSONURL('import', 'deleteBulkResumes', 'import-delete-bulk-resumes'),
      {
        headers: buildHeaders(),
        failOnStatusCode: false
      }
    );

    expect(response.ok(), 'import.deleteBulkResumes should return HTTP 200').toBeTruthy();

    const payload = await response.json();
    const meta = payload?.meta || {};

    expect(Number(meta.contractVersion || 0)).toBe(contractVersion);
    expect(String(meta.contractKey || '').trim()).toBe(importDeleteBulkResumesContractKey);
    expect(String(meta.modernPage || '').trim()).toBe('import-delete-bulk-resumes');
    expect(payload.success).toBe(true);
    expect(String(payload.code || '').trim()).toBe('bulkResumesDeleted');
    expect(String(payload.message || '').trim()).not.toBe('');
    expect(String(payload.redirectURL || '')).toContain('m=import');
    expect(String(payload.redirectURL || '')).toContain('a=import');
    expect(String(payload.redirectURL || '')).toContain('ui=modern');
  });

  test('import.importbulkresumes ui=modern forwards without a runtime boundary and no iframe', async ({
    context,
    page,
    request
  }) => {
    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    const { bulkResumeCount } = await fetchImportLauncherModernJSON(request);
    test.skip(bulkResumeCount === 0, 'Set up at least one bulk resume document to run import.importBulkResumes smoke.');

    await page.goto(buildModernRouteURL('import', 'importbulkresumes'), {
      waitUntil: 'domcontentloaded'
    });

    await page.waitForTimeout(200);
    await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);
    await expect(page.locator('iframe')).toHaveCount(0);
  });

  test('import.importBulkResumes modern-json returns the import.bulkResumes.v1 contract', async ({ request }) => {
    const { bulkResumeCount } = await fetchImportLauncherModernJSON(request);
    test.skip(bulkResumeCount === 0, 'Set up at least one bulk resume document to run import.importBulkResumes contract smoke.');

    const response = await request.get(
      buildModernJSONURL('import', 'importBulkResumes', 'import-bulk-resumes'),
      {
        headers: buildHeaders(),
        failOnStatusCode: false
      }
    );

    expect(response.ok(), 'import.importBulkResumes should return HTTP 200').toBeTruthy();

    const payload = await response.json();
    const meta = payload?.meta || {};

    expect(Number(meta.contractVersion || 0)).toBe(contractVersion);
    expect(String(meta.contractKey || '').trim()).toBe(importBulkResumesContractKey);
    expect(String(meta.modernPage || '').trim()).toBe('import-bulk-resumes');
    expect(payload.success).toBe(true);
    expect(String(payload.code || '').trim()).toBe('bulkResumesPrepared');
    expect(String(payload.message || '').trim()).not.toBe('');
    expect(String(payload.redirectURL || '')).toContain('m=import');
    expect(String(payload.redirectURL || '')).toContain('a=massImport');
    expect(String(payload.redirectURL || '')).toContain('ui=legacy');
  });
});
