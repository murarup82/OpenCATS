import { expect, test } from '@playwright/test';

const baseURL = String(process.env.OPENCATS_BASE_URL || '').trim();
const indexPath = String(process.env.OPENCATS_INDEX_PATH || '/index.php').trim() || '/index.php';
const sessionCookie = String(process.env.OPENCATS_COOKIE || '').trim();
const contractVersion = 1;

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

function buildModernJSONURL(action, modernPage, query = {}) {
  const params = new URLSearchParams({
    m: 'settings',
    a: action,
    format: 'modern-json',
    modernPage,
    contractVersion: String(contractVersion),
    ui: 'legacy'
  });

  Object.entries(query).forEach(([key, value]) => {
    if (value !== null && value !== undefined && String(value) !== '') {
      params.set(key, String(value));
    }
  });

  return `${joinURL(baseURL, indexPath)}?${params.toString()}`;
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

async function assertModernMutationLike(response) {
  expect(response.ok(), 'wizard action should return HTTP 200').toBeTruthy();

  const payload = await response.json();

  expect(typeof payload.success).toBe('boolean');

  if (payload.code !== undefined) {
    expect(typeof payload.code).toBe('string');
  }

  if (payload.message !== undefined) {
    expect(typeof payload.message).toBe('string');
  }

  return payload;
}

test.describe('Settings wizard action smoke', () => {
  test.skip(baseURL === '', 'Set OPENCATS_BASE_URL to run settings wizard smoke checks.');

  test('settings.ajax_wizardImport modern-json GET returns mutation-like JSON', async ({ request }) => {
    const response = await request.get(
      buildModernJSONURL('ajax_wizardImport', 'settings-wizard-import'),
      {
        headers: buildHeaders(),
        failOnStatusCode: false
      }
    );

    await assertModernMutationLike(response);
  });

  test('settings.ajax_wizardCheckKey rejects an intentionally invalid key with modern-json GET', async ({ request }) => {
    const response = await request.get(
      buildModernJSONURL('ajax_wizardCheckKey', 'settings-wizard-check-key', {
        key: 'INVALID-OPENCATS-WIZARD-KEY-DO-NOT-USE-12345'
      }),
      {
        headers: buildHeaders(),
        failOnStatusCode: false
      }
    );

    const payload = await assertModernMutationLike(response);
    expect(payload.success).toBe(false);
  });

  test('settings.ajax_wizardImport ui=modern mounts without a runtime boundary', async ({ context, page }) => {
    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    await page.goto(buildModernRouteURL('ajax_wizardImport'), {
      waitUntil: 'domcontentloaded'
    });

    await page.waitForTimeout(200);

    await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);
  });
});
