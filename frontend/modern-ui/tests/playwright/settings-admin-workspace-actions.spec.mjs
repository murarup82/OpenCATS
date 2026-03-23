import { expect, test } from '@playwright/test';

const baseURL = String(process.env.OPENCATS_BASE_URL || '').trim();
const indexPath = String(process.env.OPENCATS_INDEX_PATH || '/index.php').trim() || '/index.php';
const sessionCookie = String(process.env.OPENCATS_COOKIE || '').trim();
const contractVersion = 1;
const settingsAdministrationContractKey = 'settings.administration.v1';
const settingsMyProfileContractKey = 'settings.myprofile.v1';
const settingsMyProfileChangePasswordContractKey = 'settings.myprofile.changePassword.v1';
const settingsLoginActivityContractKey = 'settings.loginActivity.v1';
const settingsRejectionReasonsContractKey = 'settings.rejectionReasons.v1';
const settingsTagsContractKey = 'settings.tags.v1';

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

async function assertModernContract(response, expectedContractKey) {
  expect(response.ok(), 'modern-json request should return HTTP 200').toBeTruthy();

  const payload = await response.json();
  const meta = payload?.meta || {};
  const actions = payload?.actions || {};

  expect(Number(meta.contractVersion || 0)).toBe(contractVersion);
  expect(String(meta.contractKey || '').trim()).toBe(expectedContractKey);
  expect(String(meta.modernPage || '').trim()).not.toBe('');

  return { payload, actions };
}

test.describe('Settings admin workspace action smoke', () => {
  test.skip(baseURL === '', 'Set OPENCATS_BASE_URL to run settings admin workspace smoke checks.');

  test('settings.administration modern-json returns the settings.administration.v1 contract', async ({ request }) => {
    const response = await request.get(buildModernJSONURL('administration', 'settings-administration'), {
      headers: buildHeaders(),
      failOnStatusCode: false
    });

    const { actions } = await assertModernContract(response, settingsAdministrationContractKey);
    expect(String(actions.dashboardURL || '').trim()).not.toBe('');
    expect(String(actions.legacyURL || '').trim()).not.toBe('');
  });

  test('settings.myprofile modern-json returns the settings.myprofile.v1 contract', async ({ request }) => {
    const response = await request.get(buildModernJSONURL('myProfile', 'settings-myprofile'), {
      headers: buildHeaders(),
      failOnStatusCode: false
    });

    const { actions } = await assertModernContract(response, settingsMyProfileContractKey);
    expect(String(actions.showProfileURL || '').trim()).not.toBe('');
    expect(String(actions.changePasswordURL || '').trim()).not.toBe('');
    expect(String(actions.legacyURL || '').trim()).not.toBe('');
  });

  test('settings.myprofile?s=changePassword modern-json returns the settings.myprofile.changePassword.v1 contract', async ({
    request
  }) => {
    const response = await request.get(
      buildModernJSONURL('myProfile', 'settings-myprofile-change-password', {
        s: 'changePassword'
      }),
      {
        headers: buildHeaders(),
        failOnStatusCode: false
      }
    );

    const { actions } = await assertModernContract(response, settingsMyProfileChangePasswordContractKey);
    expect(String(actions.submitURL || '').trim()).not.toBe('');
    expect(String(actions.backURL || '').trim()).not.toBe('');
    expect(String(actions.legacyURL || '').trim()).not.toBe('');
  });

  test('settings.loginactivity modern-json returns the settings.loginActivity.v1 contract', async ({ request }) => {
    const response = await request.get(buildModernJSONURL('loginActivity', 'settings-login-activity'), {
      headers: buildHeaders(),
      failOnStatusCode: false
    });

    const { actions } = await assertModernContract(response, settingsLoginActivityContractKey);
    expect(String(actions.routeURL || '').trim()).not.toBe('');
    expect(String(actions.legacyURL || '').trim()).not.toBe('');
  });

  test('settings.rejectionreasons modern-json returns the settings.rejectionReasons.v1 contract', async ({ request }) => {
    const response = await request.get(buildModernJSONURL('rejectionReasons', 'settings-rejection-reasons'), {
      headers: buildHeaders(),
      failOnStatusCode: false
    });

    const { actions } = await assertModernContract(response, settingsRejectionReasonsContractKey);
    expect(String(actions.submitURL || '').trim()).not.toBe('');
    expect(String(actions.legacyURL || '').trim()).not.toBe('');
  });

  test('settings.tags modern-json returns the settings.tags.v1 contract', async ({ request }) => {
    const response = await request.get(buildModernJSONURL('tags', 'settings-tags'), {
      headers: buildHeaders(),
      failOnStatusCode: false
    });

    const { actions } = await assertModernContract(response, settingsTagsContractKey);
    expect(String(actions.addURL || '').trim()).not.toBe('');
    expect(String(actions.deleteURL || '').trim()).not.toBe('');
    expect(String(actions.updateURL || '').trim()).not.toBe('');
  });

  test('settings.administration ui=modern mounts without a runtime boundary', async ({ context, page }) => {
    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    await page.goto(buildModernRouteURL('administration'), {
      waitUntil: 'domcontentloaded'
    });

    await page.waitForTimeout(200);
    await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);
    await expect(page.getByText('Candidate records')).toHaveCount(1);
    await expect(page.getByText('Legacy Workspace')).toHaveCount(1);
  });

  test('settings.myprofile ui=modern mounts without a runtime boundary', async ({ context, page }) => {
    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    await page.goto(buildModernRouteURL('myProfile'), {
      waitUntil: 'domcontentloaded'
    });

    await page.waitForTimeout(200);
    await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);
    await expect(page.getByText('Profile Shortcuts')).toHaveCount(1);
  });

  test('settings.manageusers ui=modern mounts without a runtime boundary', async ({ context, page }) => {
    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    await page.goto(buildModernRouteURL('manageUsers'), {
      waitUntil: 'domcontentloaded'
    });

    await page.waitForSelector('.modern-compat-page--forward', { state: 'visible' });
    await expect(page.getByRole('heading', { name: 'User Management Workspace' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Continue to Legacy UI' })).toBeVisible();
    await expect(page.locator('iframe')).toHaveCount(0);
    await page.waitForURL((url) => url.searchParams.get('ui') === 'legacy', { timeout: 5000 });
    await page.waitForTimeout(200);
    await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);
  });

  test('settings.emailtemplates ui=modern forwards without an iframe', async ({ context, page }) => {
    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    await page.goto(buildModernRouteURL('emailTemplates'), {
      waitUntil: 'domcontentloaded'
    });

    await page.waitForSelector('.modern-compat-page--forward', { state: 'visible' });
    await expect(page.getByRole('heading', { name: 'Email Templates Workspace' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Continue to Legacy UI' })).toBeVisible();
    await expect(page.locator('iframe')).toHaveCount(0);
    await page.waitForURL((url) => url.searchParams.get('ui') === 'legacy', { timeout: 5000 });
    await page.waitForTimeout(200);
    await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);
  });

  test('settings.myprofile?s=changePassword ui=modern mounts without a runtime boundary', async ({ context, page }) => {
    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    await page.goto(buildModernRouteURL('myProfile', {
      s: 'changePassword'
    }), {
      waitUntil: 'domcontentloaded'
    });

    await page.waitForTimeout(200);
    await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);
    await expect(page.getByText('Password Form')).toHaveCount(1);
  });

  test('settings.loginactivity ui=modern mounts without a runtime boundary', async ({ context, page }) => {
    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    await page.goto(buildModernRouteURL('loginActivity'), {
      waitUntil: 'domcontentloaded'
    });

    await page.waitForTimeout(200);
    await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);
    await expect(page.getByText('Recent Entries')).toHaveCount(1);
  });

  test('settings.rejectionreasons ui=modern mounts without a runtime boundary', async ({ context, page }) => {
    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    await page.goto(buildModernRouteURL('rejectionReasons'), {
      waitUntil: 'domcontentloaded'
    });

    await page.waitForTimeout(200);
    await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);
    await expect(page.getByText('Existing Reasons')).toHaveCount(1);
  });

  test('settings.tags ui=modern mounts without a runtime boundary', async ({ context, page }) => {
    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    await page.goto(buildModernRouteURL('tags'), {
      waitUntil: 'domcontentloaded'
    });

    await page.waitForTimeout(200);
    await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);
    await expect(page.getByText('Tag Hierarchy')).toHaveCount(1);
  });
});
