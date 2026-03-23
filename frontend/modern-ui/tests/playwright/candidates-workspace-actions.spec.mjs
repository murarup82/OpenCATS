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
    m: 'candidates',
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

test.describe('Candidates workspace action smoke', () => {
  test.skip(baseURL === '', 'Set OPENCATS_BASE_URL to run candidates workspace smoke checks.');

  test('candidates.merge ui=modern mounts without a runtime boundary', async ({ context, page }) => {
    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    await page.goto(
      buildModernRouteURL('merge', {
        oldCandidateID: 1,
        newCandidateID: 2
      }),
      {
        waitUntil: 'domcontentloaded'
      }
    );

    await page.waitForTimeout(200);
    await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);
  });

  test('candidates.savesources ui=modern mounts without a runtime boundary', async ({ context, page }) => {
    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    await page.goto(buildModernRouteURL('saveSources'), {
      waitUntil: 'domcontentloaded'
    });

    await page.waitForTimeout(200);
    await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);
  });
});
