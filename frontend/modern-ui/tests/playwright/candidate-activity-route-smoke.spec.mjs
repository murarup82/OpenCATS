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

async function assertForwardRoute(page, moduleName, actionName, query = {}) {
  await page.goto(buildModernRouteURL(moduleName, actionName, query), {
    waitUntil: 'domcontentloaded'
  });

  await page.waitForSelector('.modern-compat-page--forward', { state: 'visible' });
  await expect(page.locator('.modern-compat-page--forward')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Continue to Legacy UI' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open Legacy UI' })).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);
  await page.waitForURL((url) => url.searchParams.get('ui') === 'legacy', { timeout: 5000 });
  await page.waitForTimeout(200);
  await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);
}

test.describe('Candidate route smoke', () => {
  test.skip(baseURL === '', 'Set OPENCATS_BASE_URL to run candidate route smoke checks.');

  test('candidates.show_questionnaire ui=modern forwards without an iframe', async ({ context, page }) => {
    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    await assertForwardRoute(page, 'candidates', 'show_questionnaire', {
      candidateID: 1,
      questionnaireTitle: 'Engineering Questionnaire',
      print: 'yes'
    });
  });

  test('contacts.addActivityScheduleEvent ui=modern forwards without an iframe', async ({ context, page }) => {
    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    await assertForwardRoute(page, 'contacts', 'addActivityScheduleEvent', {
      contactID: 1,
      onlyScheduleEvent: 'true'
    });
  });
});
