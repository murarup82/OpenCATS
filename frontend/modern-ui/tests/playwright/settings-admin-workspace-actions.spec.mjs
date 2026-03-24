import { expect, test } from '@playwright/test';

const baseURL = String(process.env.OPENCATS_BASE_URL || '').trim();
const indexPath = String(process.env.OPENCATS_INDEX_PATH || '/index.php').trim() || '/index.php';
const sessionCookie = String(process.env.OPENCATS_COOKIE || '').trim();
const contractVersion = 1;
const settingsAdministrationContractKey = 'settings.administration.v1';
const settingsMyProfileContractKey = 'settings.myprofile.v1';
const settingsMyProfileChangePasswordContractKey = 'settings.myprofile.changePassword.v1';
const settingsLoginActivityContractKey = 'settings.loginActivity.v1';
const settingsEmailTemplatesContractKey = 'settings.emailTemplates.v1';
const settingsGdprSettingsContractKey = 'settings.gdprSettings.v1';
const settingsRejectionReasonsContractKey = 'settings.rejectionReasons.v1';
const settingsTagsContractKey = 'settings.tags.v1';
const settingsManageUsersContractKey = 'settings.manageUsers.v1';
const settingsAddUserContractKey = 'settings.addUser.v1';
const settingsEditUserContractKey = 'settings.editUser.v1';
const settingsShowUserContractKey = 'settings.showUser.v1';
const settingsEmailSettingsContractKey = 'settings.emailSettings.v1';
const settingsFeedbackSettingsContractKey = 'settings.feedbackSettings.v1';
const settingsForceEmailContractKey = 'settings.forceEmail.v1';
const settingsGoogleOIDCSettingsContractKey = 'settings.googleOIDCSettings.v1';
const settingsDeleteUserContractKey = 'settings.deleteUser.v1';
const settingsCustomizeCalendarContractKey = 'settings.customizeCalendar.v1';
const settingsEEOContractKey = 'settings.eeo.v1';
const settingsTalentFitFlowSettingsContractKey = 'settings.talentFitFlowSettings.v1';
const settingsNewInstallPasswordContractKey = 'settings.newInstallPassword.v1';
const settingsNewSiteNameContractKey = 'settings.newSiteName.v1';

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

function getFirstUserID(rows) {
  if (!Array.isArray(rows)) {
    return 0;
  }

  for (const row of rows) {
    const userID = Number(row?.userID || 0);
    if (Number.isFinite(userID) && userID > 0) {
      return userID;
    }
  }

  return 0;
}

const modernSettingsRoutes = [
  {
    action: 'emailSettings',
    modernPage: 'settings-email-settings',
    contractKey: settingsEmailSettingsContractKey,
    requiredActions: ['submitURL', 'legacyURL']
  },
  {
    action: 'feedbackSettings',
    modernPage: 'settings-feedback-settings',
    contractKey: settingsFeedbackSettingsContractKey,
    requiredActions: ['submitURL', 'legacyURL']
  },
  {
    action: 'forceEmail',
    modernPage: 'settings-force-email',
    contractKey: settingsForceEmailContractKey,
    requiredActions: ['submitURL', 'legacyURL']
  },
  {
    action: 'googleOIDCSettings',
    modernPage: 'settings-google-oidc-settings',
    contractKey: settingsGoogleOIDCSettingsContractKey,
    requiredActions: ['submitURL', 'legacyURL']
  },
  {
    action: 'deleteUser',
    modernPage: 'settings-delete-user',
    contractKey: settingsDeleteUserContractKey,
    requiredActions: ['deleteActionURL', 'legacyURL']
  },
  {
    action: 'customizeCalendar',
    modernPage: 'settings-customize-calendar',
    contractKey: settingsCustomizeCalendarContractKey,
    requiredActions: ['submitURL', 'legacyURL']
  },
  {
    action: 'eeo',
    modernPage: 'settings-eeo',
    contractKey: settingsEEOContractKey,
    requiredActions: ['submitURL', 'legacyURL']
  },
  {
    action: 'talentFitFlowSettings',
    modernPage: 'settings-talent-fit-flow-settings',
    contractKey: settingsTalentFitFlowSettingsContractKey,
    requiredActions: ['submitURL', 'legacyURL']
  },
  {
    action: 'newInstallPassword',
    modernPage: 'settings-new-install-password',
    contractKey: settingsNewInstallPasswordContractKey,
    requiredActions: ['submitURL', 'legacyURL']
  },
  {
    action: 'newSiteName',
    modernPage: 'settings-new-site-name',
    contractKey: settingsNewSiteNameContractKey,
    requiredActions: ['submitURL', 'legacyURL']
  }
];

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

  test('settings.emailtemplates modern-json returns the settings.emailTemplates.v1 contract', async ({ request }) => {
    const response = await request.get(buildModernJSONURL('emailTemplates', 'settings-email-templates'), {
      headers: buildHeaders(),
      failOnStatusCode: false
    });

    const { payload, actions } = await assertModernContract(response, settingsEmailTemplatesContractKey);
    expect(String(actions.submitURL || '').trim()).not.toBe('');
    expect(String(actions.addURL || '').trim()).not.toBe('');
    expect(String(actions.deleteURL || '').trim()).not.toBe('');
    expect(String(actions.legacyURL || '').trim()).not.toBe('');
    expect(Array.isArray(payload.templates)).toBeTruthy();

    if (Array.isArray(payload.templates) && payload.templates.length > 0) {
      const firstTemplate = payload.templates[0] || {};
      expect(Number(firstTemplate.emailTemplateID || 0)).toBeGreaterThan(0);
      expect(String(firstTemplate.emailTemplateTitle || '').trim()).not.toBe('');
      expect(String(firstTemplate.emailTemplateTag || '').trim()).not.toBe('');
      expect(typeof firstTemplate.isCustom).toBe('boolean');
    }
  });

  test('settings.gdprsettings modern-json returns the settings.gdprSettings.v1 contract', async ({ request }) => {
    const response = await request.get(buildModernJSONURL('gdprSettings', 'settings-gdpr-settings'), {
      headers: buildHeaders(),
      failOnStatusCode: false
    });

    const { payload, actions } = await assertModernContract(response, settingsGdprSettingsContractKey);
    expect(String(actions.submitURL || '').trim()).not.toBe('');
    expect(String(actions.backURL || '').trim()).not.toBe('');
    expect(String(actions.legacyURL || '').trim()).not.toBe('');
    expect(payload && typeof payload === 'object').toBeTruthy();
    expect(payload.settings && typeof payload.settings === 'object').toBeTruthy();
    expect(Object.prototype.hasOwnProperty.call(payload.settings || {}, 'gdprExpirationYears')).toBeTruthy();
    expect(Object.prototype.hasOwnProperty.call(payload.settings || {}, 'gdprFromAddress')).toBeTruthy();
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

  test('settings.manageusers modern-json returns the settings.manageUsers.v1 contract', async ({ request }) => {
    const response = await request.get(buildModernJSONURL('manageUsers', 'settings-manage-users'), {
      headers: buildHeaders(),
      failOnStatusCode: false
    });

    const { payload, actions } = await assertModernContract(response, settingsManageUsersContractKey);
    expect(String(actions.addUserURL || '').trim()).not.toBe('');
    expect(String(actions.deleteActionURL || '').trim()).not.toBe('');
    expect(String(actions.backURL || '').trim()).not.toBe('');
    expect(String(actions.legacyURL || '').trim()).not.toBe('');
    expect(Array.isArray(payload.rows)).toBeTruthy();

    if (Array.isArray(payload.rows) && payload.rows.length > 0) {
      const firstRow = payload.rows[0] || {};
      expect(Number(firstRow.userID || 0)).toBeGreaterThan(0);
      expect(String(firstRow.showURL || '').trim()).not.toBe('');
      expect(String(firstRow.editURL || '').trim()).not.toBe('');
    }
  });

  test('settings.adduser modern-json returns the settings.addUser.v1 contract', async ({ request }) => {
    const response = await request.get(buildModernJSONURL('addUser', 'settings-add-user'), {
      headers: buildHeaders(),
      failOnStatusCode: false
    });

    const { actions } = await assertModernContract(response, settingsAddUserContractKey);
    expect(String(actions.submitURL || '').trim()).not.toBe('');
    expect(String(actions.manageUsersURL || '').trim()).not.toBe('');
    expect(String(actions.legacyURL || '').trim()).not.toBe('');
  });

  test('settings.edituser modern-json returns the settings.editUser.v1 contract', async ({ request }) => {
    const usersResponse = await request.get(buildModernJSONURL('manageUsers', 'settings-manage-users'), {
      headers: buildHeaders(),
      failOnStatusCode: false
    });

    const { payload: usersPayload } = await assertModernContract(usersResponse, settingsManageUsersContractKey);
    const userID = getFirstUserID(usersPayload.rows);
    test.skip(userID <= 0, 'No users returned to exercise the editUser contract.');

    const response = await request.get(
      buildModernJSONURL('editUser', 'settings-edit-user', {
        userID
      }),
      {
        headers: buildHeaders(),
        failOnStatusCode: false
      }
    );

    const { payload, actions } = await assertModernContract(response, settingsEditUserContractKey);
    expect(Number(payload?.meta?.userID || 0)).toBe(userID);
    expect(Number(payload?.user?.userID || 0)).toBe(userID);
    expect(String(actions.submitURL || '').trim()).not.toBe('');
    expect(String(actions.showUserURL || '').trim()).not.toBe('');
    expect(String(actions.manageUsersURL || '').trim()).not.toBe('');
    expect(String(actions.legacyURL || '').trim()).not.toBe('');
  });

  test('settings.showuser modern-json returns the settings.showUser.v1 contract', async ({ request }) => {
    const usersResponse = await request.get(buildModernJSONURL('manageUsers', 'settings-manage-users'), {
      headers: buildHeaders(),
      failOnStatusCode: false
    });

    const { payload: usersPayload } = await assertModernContract(usersResponse, settingsManageUsersContractKey);
    const userID = getFirstUserID(usersPayload.rows);
    test.skip(userID <= 0, 'No users returned to exercise the showUser contract.');

    const response = await request.get(
      buildModernJSONURL('showUser', 'settings-show-user', {
        userID
      }),
      {
        headers: buildHeaders(),
        failOnStatusCode: false
      }
    );

    const { payload, actions } = await assertModernContract(response, settingsShowUserContractKey);
    expect(Number(payload?.meta?.userID || 0)).toBe(userID);
    expect(Number(payload?.user?.userID || 0)).toBe(userID);
    expect(String(actions.editURL || '').trim()).not.toBe('');
    expect(String(actions.manageUsersURL || '').trim()).not.toBe('');
    expect(String(actions.settingsURL || '').trim()).not.toBe('');
    expect(String(actions.legacyURL || '').trim()).not.toBe('');
  });

  for (const routeDefinition of modernSettingsRoutes) {
    test(`settings.${routeDefinition.action.toLowerCase()} modern-json returns the ${routeDefinition.contractKey} contract`, async ({
      request
    }) => {
      const response = await request.get(buildModernJSONURL(routeDefinition.action, routeDefinition.modernPage), {
        headers: buildHeaders(),
        failOnStatusCode: false
      });

      const { actions } = await assertModernContract(response, routeDefinition.contractKey);

      for (const actionName of routeDefinition.requiredActions) {
        expect(String(actions[actionName] || '').trim()).not.toBe('');
      }
    });

    test(`settings.${routeDefinition.action.toLowerCase()} ui=modern mounts natively without a forward redirect`, async ({
      context,
      page
    }) => {
      await context.setExtraHTTPHeaders(buildHeaders());
      await page.setViewportSize({ width: 1366, height: 900 });

      await page.goto(buildModernRouteURL(routeDefinition.action), {
        waitUntil: 'domcontentloaded'
      });

      await page.waitForTimeout(200);
      await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);
      await expect(page.getByRole('link', { name: 'Open Legacy UI' })).toBeVisible();
      await expect(page.locator('.modern-compat-page--forward')).toHaveCount(0);
      await expect(page.locator('iframe')).toHaveCount(0);
    });
  }

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

  test('settings.manageusers ui=modern mounts natively without a forward redirect', async ({ context, page }) => {
    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    await page.goto(buildModernRouteURL('manageUsers'), {
      waitUntil: 'domcontentloaded'
    });

    await page.waitForTimeout(200);
    await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Manage Users' })).toBeVisible();
    await expect(page.locator('.modern-compat-page--forward')).toHaveCount(0);
    await expect(page.locator('iframe')).toHaveCount(0);
  });

  test('settings.emailtemplates ui=modern mounts natively without a forward redirect', async ({ context, page }) => {
    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    await page.goto(buildModernRouteURL('emailTemplates'), {
      waitUntil: 'domcontentloaded'
    });

    await page.waitForTimeout(200);
    await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Email Templates' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open Legacy UI' })).toBeVisible();
    await expect(page.locator('.modern-compat-page--forward')).toHaveCount(0);
    await expect(page.locator('iframe')).toHaveCount(0);
  });

  test('settings.gdprsettings ui=modern mounts natively without a forward redirect', async ({ context, page }) => {
    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    await page.goto(buildModernRouteURL('gdprSettings'), {
      waitUntil: 'domcontentloaded'
    });

    await page.waitForTimeout(200);
    await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'GDPR Settings' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open Legacy UI' })).toBeVisible();
    await expect(page.locator('.modern-compat-page--forward')).toHaveCount(0);
    await expect(page.locator('iframe')).toHaveCount(0);
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
