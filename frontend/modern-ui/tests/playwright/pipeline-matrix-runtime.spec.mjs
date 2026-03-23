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

function buildContractURL() {
  const query = new URLSearchParams({
    m: 'joborders',
    a: 'pipelineMatrix',
    format: 'modern-json',
    modernPage: 'playwright.smoke.joborders.pipelinematrix',
    ui: 'modern'
  });

  return `${joinURL(baseURL, indexPath)}?${query.toString()}`;
}

function buildUIRouteURL() {
  const query = new URLSearchParams({
    m: 'joborders',
    a: 'pipelineMatrix',
    ui: 'modern'
  });

  return `${joinURL(baseURL, indexPath)}?${query.toString()}`;
}

test.describe('Pipeline matrix runtime smoke', () => {
  test.skip(baseURL === '', 'Set OPENCATS_BASE_URL to run pipeline matrix smoke checks.');

  test('joborders.pipelineMatrix modern contract', async ({ request }) => {
    const response = await request.get(buildContractURL(), {
      headers: buildHeaders(),
      failOnStatusCode: false
    });

    expect(response.ok(), 'joborders.pipelineMatrix should return HTTP 200').toBeTruthy();

    const payload = await response.json();
    const meta = payload?.meta || {};
    const actions = payload?.actions || {};

    expect(Number(meta.contractVersion || 0)).toBe(1);
    expect(String(meta.contractKey || '').trim()).toBe('joborders.pipelineMatrix.v1');
    expect(String(meta.modernPage || '').trim()).not.toBe('');
    expect(String(actions.saveViewURL || '').trim()).not.toBe('');
    expect(String(actions.deleteViewURL || '').trim()).not.toBe('');
    expect(String(actions.legacyURL || '').trim()).not.toBe('');
  });

  test('pipeline matrix route mounts without runtime boundary', async ({ context, page }) => {
    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    await page.goto(buildUIRouteURL(), {
      waitUntil: 'domcontentloaded'
    });

    await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);
    await expect(page.locator('.avel-pipeline-matrix-page')).toBeVisible();
  });
});
