import { expect, test } from '@playwright/test';

const baseURL = String(process.env.OPENCATS_BASE_URL || '').trim();
const indexPath = String(process.env.OPENCATS_INDEX_PATH || '/index.php').trim() || '/index.php';
const sessionCookie = String(process.env.OPENCATS_COOKIE || '').trim();
const contractVersion = 1;
const gdprRequestsContractKey = 'gdpr.requests.v1';

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

function buildModernJSONURL(moduleName, actionName, query = {}) {
  const params = new URLSearchParams({
    m: moduleName,
    a: actionName,
    format: 'modern-json',
    modernPage: `playwright.smoke.${moduleName}.${actionName}`,
    ui: 'modern'
  });

  Object.entries(query).forEach(([key, value]) => {
    if (value !== null && value !== undefined && String(value) !== '') {
      params.set(key, String(value));
    }
  });

  return `${joinURL(baseURL, indexPath)}?${params.toString()}`;
}

test.describe('Operations workspace action smoke', () => {
  test.skip(baseURL === '', 'Set OPENCATS_BASE_URL to run operations workspace smoke checks.');

  test('joborders.edithiringplan ui=modern mounts without a runtime boundary', async ({ context, page }) => {
    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    await page.goto(
      buildModernRouteURL('joborders', 'editHiringPlan', {
        jobOrderID: 1
      }),
      {
        waitUntil: 'domcontentloaded'
      }
    );

    await page.waitForTimeout(200);
    await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);
  });

  test('settings.previewpage ui=modern forwards without an iframe', async ({ context, page }) => {
    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    await page.goto(buildModernRouteURL('settings', 'previewpage'), {
      waitUntil: 'domcontentloaded'
    });

    await page.waitForSelector('.modern-compat-page', { state: 'visible' });
    await expect(page.getByRole('heading', { name: 'Settings Preview Redirect' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Settings Preview Forward' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Continue' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open Legacy UI' }).first()).toBeVisible();
    await expect(page.locator('iframe')).toHaveCount(0);
    await page.waitForURL((url) => url.searchParams.get('ui') === 'legacy', { timeout: 5000 });
    await page.waitForTimeout(200);
    await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);
  });

  test('gdpr.requests ui=modern mounts and returns the gdpr.requests.v1 contract', async ({
    context,
    page,
    request
  }) => {
    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    await page.goto(buildModernRouteURL('gdpr', 'requests'), {
      waitUntil: 'domcontentloaded'
    });

    await page.waitForTimeout(200);
    await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);

    const response = await request.get(buildModernJSONURL('gdpr', 'requests'), {
      headers: buildHeaders(),
      failOnStatusCode: false
    });

    expect(response.ok(), 'gdpr.requests should return HTTP 200').toBeTruthy();

    const payload = await response.json();
    const meta = payload?.meta || {};
    const actions = payload?.actions || {};

    expect(Number(meta.contractVersion || 0)).toBe(contractVersion);
    expect(String(meta.contractKey || '').trim()).toBe(gdprRequestsContractKey);
    expect(String(meta.modernPage || '').trim()).not.toBe('');
    expect(String(actions.submitURL || '').trim()).not.toBe('');
    expect(String(actions.legacyURL || '').trim()).not.toBe('');
  });
});
