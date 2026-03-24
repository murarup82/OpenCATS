import { expect, test } from '@playwright/test';

const baseURL = String(process.env.OPENCATS_BASE_URL || '').trim();
const indexPath = String(process.env.OPENCATS_INDEX_PATH || '/index.php').trim() || '/index.php';
const sessionCookie = String(process.env.OPENCATS_COOKIE || '').trim();
const contractVersion = 1;
const settingsCareerPortalSettingsContractKey = 'settings.careerPortalSettings.v1';
const settingsCareerPortalTemplateEditContractKey = 'settings.careerPortalTemplateEdit.v1';
const settingsCareerPortalQuestionnaireContractKey = 'settings.careerPortalQuestionnaire.v1';
const settingsCareerPortalQuestionnairePreviewContractKey = 'settings.careerPortalQuestionnairePreview.v1';
const settingsCareerPortalQuestionnaireUpdateContractKey = 'settings.careerPortalQuestionnaireUpdate.mutation.v1';

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

async function assertModernContract(response, expectedContractKey, expectedModernPage = '') {
  expect(response.ok(), 'modern-json request should return HTTP 200').toBeTruthy();

  const payload = await response.json();
  const meta = payload?.meta || {};
  const actions = payload?.actions || {};

  expect(Number(meta.contractVersion || 0)).toBe(contractVersion);
  expect(String(meta.contractKey || '').trim()).toBe(expectedContractKey);
  expect(String(meta.modernPage || '').trim()).not.toBe('');
  if (expectedModernPage !== '') {
    expect(String(meta.modernPage || '').trim()).toBe(expectedModernPage);
  }

  return { payload, actions };
}

function pickFirstString(value) {
  if (Array.isArray(value)) {
    for (const item of value) {
      const candidate = pickFirstString(item);
      if (candidate !== '') {
        return candidate;
      }
    }
    return '';
  }

  if (typeof value === 'string') {
    const text = value.trim();
    return text === '' ? '' : text;
  }

  if (value && typeof value === 'object') {
    for (const key of ['careerPortalName', 'templateName', 'name', 'title', 'label', 'value']) {
      const candidate = pickFirstString(value[key]);
      if (candidate !== '') {
        return candidate;
      }
    }
  }

  return '';
}

function pickFirstQuestionnaireID(value) {
  if (Array.isArray(value)) {
    for (const item of value) {
      const questionnaireID = pickFirstQuestionnaireID(item);
      if (questionnaireID > 0) {
        return questionnaireID;
      }
    }
    return 0;
  }

  if (value && typeof value === 'object') {
    for (const key of ['questionnaireID', 'id']) {
      const candidate = Number(value[key] || 0);
      if (Number.isFinite(candidate) && candidate > 0) {
        return candidate;
      }
    }
  }

  return 0;
}

async function fetchCareerPortalSettingsModernData(request) {
  const response = await request.get(buildModernJSONURL('careerPortalSettings', 'settings-career-portal-settings'), {
    headers: buildHeaders(),
    failOnStatusCode: false
  });

  const { payload, actions } = await assertModernContract(
    response,
    settingsCareerPortalSettingsContractKey,
    'settings-career-portal-settings'
  );

  expect(String(actions.submitURL || '').trim()).not.toBe('');
  expect(String(actions.legacyURL || '').trim()).not.toBe('');

  return payload;
}

async function getCareerPortalSelectionData(request) {
  const payload = await fetchCareerPortalSettingsModernData(request);
  return {
    templateName:
      pickFirstString(payload.careerPortalTemplateCustomNames) ||
      pickFirstString(payload.careerPortalTemplateNames) ||
      pickFirstString(payload.templates),
    questionnaireID:
      pickFirstQuestionnaireID(payload.questionnaires) ||
      pickFirstQuestionnaireID(payload.careerPortalQuestionnaires) ||
      pickFirstQuestionnaireID(payload.questions)
  };
}

test.describe('Settings platform workspace action smoke', () => {
  test.skip(baseURL === '', 'Set OPENCATS_BASE_URL to run settings platform workspace smoke checks.');

  test('settings.careerportalsettings modern-json returns the settings.careerPortalSettings.v1 contract', async ({
    request
  }) => {
    const response = await request.get(
      buildModernJSONURL('careerPortalSettings', 'settings-career-portal-settings'),
      {
        headers: buildHeaders(),
        failOnStatusCode: false
      }
    );

    const { actions } = await assertModernContract(
      response,
      settingsCareerPortalSettingsContractKey,
      'settings-career-portal-settings'
    );
    expect(String(actions.submitURL || '').trim()).not.toBe('');
    expect(String(actions.legacyURL || '').trim()).not.toBe('');
  });

  test('settings.careerportalsettings ui=modern mounts natively without a forward redirect', async ({
    context,
    page
  }) => {
    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    await page.goto(buildModernRouteURL('careerPortalSettings'), {
      waitUntil: 'domcontentloaded'
    });

    await page.waitForTimeout(200);
    await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Open Legacy UI' })).toBeVisible();
    await expect(page.locator('.modern-compat-page--forward')).toHaveCount(0);
    await expect(page.locator('iframe')).toHaveCount(0);
  });

  test('settings.careerportaltemplateedit modern-json returns the settings.careerPortalTemplateEdit.v1 contract', async ({
    request
  }) => {
    const selectionData = await getCareerPortalSelectionData(request);
    test.skip(selectionData.templateName === '', 'No career portal templates returned to exercise the template edit contract.');

    const response = await request.get(
      buildModernJSONURL('careerPortalTemplateEdit', 'settings-career-portal-template-edit', {
        templateName: selectionData.templateName
      }),
      {
        headers: buildHeaders(),
        failOnStatusCode: false
      }
    );

    const { actions } = await assertModernContract(
      response,
      settingsCareerPortalTemplateEditContractKey,
      'settings-career-portal-template-edit'
    );
    expect(String(actions.submitURL || '').trim()).not.toBe('');
    expect(String(actions.legacyURL || '').trim()).not.toBe('');
  });

  test('settings.careerportaltemplateedit ui=modern mounts natively without a forward redirect', async ({
    context,
    page,
    request
  }) => {
    const selectionData = await getCareerPortalSelectionData(request);
    test.skip(selectionData.templateName === '', 'No career portal templates returned to exercise the template edit mount.');

    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    await page.goto(
      buildModernRouteURL('careerPortalTemplateEdit', {
        templateName: selectionData.templateName
      }),
      {
        waitUntil: 'domcontentloaded'
      }
    );

    await page.waitForTimeout(200);
    await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Open Legacy UI' })).toBeVisible();
    await expect(page.locator('.modern-compat-page--forward')).toHaveCount(0);
    await expect(page.locator('iframe')).toHaveCount(0);
  });

  test('settings.careerportalquestionnaire modern-json returns the settings.careerPortalQuestionnaire.v1 contract', async ({
    request
  }) => {
    const response = await request.get(
      buildModernJSONURL('careerPortalQuestionnaire', 'settings-career-portal-questionnaire'),
      {
        headers: buildHeaders(),
        failOnStatusCode: false
      }
    );

    const { actions } = await assertModernContract(
      response,
      settingsCareerPortalQuestionnaireContractKey,
      'settings-career-portal-questionnaire'
    );
    expect(String(actions.submitURL || '').trim()).not.toBe('');
    expect(String(actions.legacyURL || '').trim()).not.toBe('');
  });

  test('settings.careerportalquestionnaire ui=modern mounts natively without a forward redirect', async ({
    context,
    page
  }) => {
    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    await page.goto(buildModernRouteURL('careerPortalQuestionnaire'), {
      waitUntil: 'domcontentloaded'
    });

    await page.waitForTimeout(200);
    await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Open Legacy UI' })).toBeVisible();
    await expect(page.locator('.modern-compat-page--forward')).toHaveCount(0);
    await expect(page.locator('iframe')).toHaveCount(0);
  });

  test('settings.careerportalquestionnairepreview modern-json returns the settings.careerPortalQuestionnairePreview.v1 contract', async ({
    request
  }) => {
    const selectionData = await getCareerPortalSelectionData(request);
    test.skip(selectionData.questionnaireID <= 0, 'No career portal questionnaires returned to exercise the preview contract.');

    const response = await request.get(
      buildModernJSONURL('careerPortalQuestionnairePreview', 'settings-career-portal-questionnaire-preview', {
        questionnaireID: selectionData.questionnaireID
      }),
      {
        headers: buildHeaders(),
        failOnStatusCode: false
      }
    );

    const { actions } = await assertModernContract(
      response,
      settingsCareerPortalQuestionnairePreviewContractKey,
      'settings-career-portal-questionnaire-preview'
    );
    expect(String(actions.routeURL || '').trim()).not.toBe('');
    expect(String(actions.legacyURL || '').trim()).not.toBe('');
  });

  test('settings.careerportalquestionnairepreview ui=modern mounts natively without a forward redirect', async ({
    context,
    page,
    request
  }) => {
    const selectionData = await getCareerPortalSelectionData(request);
    test.skip(selectionData.questionnaireID <= 0, 'No career portal questionnaires returned to exercise the preview mount.');

    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    await page.goto(
      buildModernRouteURL('careerPortalQuestionnairePreview', {
        questionnaireID: selectionData.questionnaireID
      }),
      {
        waitUntil: 'domcontentloaded'
      }
    );

    await page.waitForTimeout(200);
    await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Open Legacy UI' })).toBeVisible();
    await expect(page.locator('.modern-compat-page--forward')).toHaveCount(0);
    await expect(page.locator('iframe')).toHaveCount(0);
  });

  test('settings.careerportalquestionnaireupdate modern-json returns the settings.careerPortalQuestionnaireUpdate.mutation.v1 contract', async ({
    request
  }) => {
    const response = await request.post(
      buildModernJSONURL('careerPortalQuestionnaireUpdate', 'settings-career-portal-questionnaire-update'),
      {
        headers: buildHeaders(),
        failOnStatusCode: false,
        form: {
          postback: '1'
        }
      }
    );

    const { actions } = await assertModernContract(
      response,
      settingsCareerPortalQuestionnaireUpdateContractKey,
      'settings-career-portal-questionnaire-update'
    );
    expect(String(actions.submitURL || '').trim()).not.toBe('');
    expect(String(actions.legacyURL || '').trim()).not.toBe('');
  });

  test('settings.careerportalquestionnaireupdate ui=modern mounts natively without a forward redirect', async ({
    context,
    page
  }) => {
    await context.setExtraHTTPHeaders(buildHeaders());
    await page.setViewportSize({ width: 1366, height: 900 });

    await page.goto(buildModernRouteURL('careerPortalQuestionnaireUpdate'), {
      waitUntil: 'domcontentloaded'
    });

    await page.waitForTimeout(200);
    await expect(page.getByText('Modern UI encountered a runtime error.')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Open Legacy UI' })).toBeVisible();
    await expect(page.locator('.modern-compat-page--forward')).toHaveCount(0);
    await expect(page.locator('iframe')).toHaveCount(0);
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
