import { expect, test } from '@playwright/test';

const baseURL = String(process.env.OPENCATS_BASE_URL || '').trim();
const indexPath = String(process.env.OPENCATS_INDEX_PATH || '/index.php').trim() || '/index.php';
const sessionCookie = String(process.env.OPENCATS_COOKIE || '').trim();

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

function buildModernRouteURL(action, query = {}) {
  const params = new URLSearchParams({
    m: 'settings',
    a: action,
    ui: 'modern'
  });

  Object.entries(query).forEach(([key, value]) => {
    if (value !== null && value !== undefined && String(value) !== '') {
      params.set(key, String(value));
    }
  });

  return `${joinURL(baseURL, indexPath)}?${params.toString()}`;
}

test.describe('Settings platform workspace action smoke', () => {
  test.skip(baseURL === '', 'Set OPENCATS_BASE_URL to run settings platform workspace smoke checks.');

  test('settings.careerportalsettings ui=modern forwards without an iframe', async ({ context, page }) => {
    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    await page.goto(buildModernRouteURL('careerPortalSettings'), {
      waitUntil: 'domcontentloaded'
    });

    await page.waitForSelector('.modern-compat-page--forward', { state: 'visible' });
    await expect(page.getByRole('heading', { name: 'Career Portal Settings Workspace' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Continue to Legacy UI' })).toBeVisible();
    await expect(page.locator('iframe')).toHaveCount(0);
    await page.waitForURL((url) => url.searchParams.get('ui') === 'legacy', { timeout: 5000 });
    await page.waitForTimeout(200);
    await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);
  });

  test('settings.createbackup ui=modern forwards without an iframe', async ({ context, page }) => {
    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    await page.goto(buildModernRouteURL('createBackup'), {
      waitUntil: 'domcontentloaded'
    });

    await page.waitForSelector('.modern-compat-page--forward', { state: 'visible' });
    await expect(page.getByRole('heading', { name: 'Backup Creation Workspace' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Continue to Legacy UI' })).toBeVisible();
    await expect(page.locator('iframe')).toHaveCount(0);
    await page.waitForURL((url) => url.searchParams.get('ui') === 'legacy', { timeout: 5000 });
    await page.waitForTimeout(200);
    await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);
  });

  test('settings.rolepagepermissions ui=modern mounts natively without a forward redirect', async ({ context, page }) => {
    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    await page.goto(buildModernRouteURL('rolePagePermissions'), {
      waitUntil: 'domcontentloaded'
    });

    await page.waitForTimeout(200);
    await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);
    await expect(page.getByText('Role Access Matrix')).toHaveCount(1);
    await expect(page.locator('.modern-compat-page--forward')).toHaveCount(0);
  });

  test('settings.schemamigrations ui=modern mounts natively without a forward redirect', async ({ context, page }) => {
    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    await page.goto(buildModernRouteURL('schemaMigrations'), {
      waitUntil: 'domcontentloaded'
    });

    await page.waitForTimeout(200);
    await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);
    await expect(page.getByText('Schema Migrations')).toHaveCount(1);
    await expect(page.locator('.modern-compat-page--forward')).toHaveCount(0);
  });
});
