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

test.describe('Reports workflow action smoke', () => {
  test.skip(baseURL === '', 'Set OPENCATS_BASE_URL to run reports workflow action smoke checks.');

  test('reports.showhirereport ui=modern mounts without a runtime boundary', async ({ context, page }) => {
    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    await page.goto(buildModernRouteURL('reports', 'showhirereport'), {
      waitUntil: 'domcontentloaded'
    });

    await page.waitForSelector('.modern-compat-page', { state: 'visible' });
    await expect(page.getByRole('heading', { name: 'Hire Report Workspace' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reload' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back To Reports' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open Legacy UI' })).toBeVisible();
    await page.waitForTimeout(200);
    await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);
  });

  test('reports.generatejoborderreportpdf ui=modern forwards to the legacy download endpoint', async ({
    context,
    page
  }) => {
    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    await page.goto(buildModernRouteURL('reports', 'generatejoborderreportpdf'), {
      waitUntil: 'domcontentloaded'
    });

    await page.waitForURL((url) => url.searchParams.get('ui') === 'legacy', { timeout: 5000 });
    await page.waitForTimeout(200);
    await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);
  });
});
