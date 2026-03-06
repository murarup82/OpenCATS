import { expect, test } from '@playwright/test';

const baseURL = String(process.env.OPENCATS_BASE_URL || '').trim();
const consentPath = String(process.env.OPENCATS_GDPR_CONSENT_PATH || '/gdpr/consent.php').trim() || '/gdpr/consent.php';
const sessionCookie = String(process.env.OPENCATS_COOKIE || '').trim();
const consentLang = String(process.env.OPENCATS_GDPR_CONSENT_LANG || 'en').trim() || 'en';

const tokensByState = {
  active: String(process.env.OPENCATS_GDPR_TOKEN_ACTIVE || '').trim(),
  accepted: String(process.env.OPENCATS_GDPR_TOKEN_ACCEPTED || '').trim(),
  declined: String(process.env.OPENCATS_GDPR_TOKEN_DECLINED || '').trim(),
  expired: String(process.env.OPENCATS_GDPR_TOKEN_EXPIRED || '').trim()
};

function joinURL(root, path) {
  const normalizedRoot = root.endsWith('/') ? root.slice(0, -1) : root;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedRoot}${normalizedPath}`;
}

function buildConsentURL(token = '') {
  const url = new URL(joinURL(baseURL, consentPath));
  if (token !== '') {
    url.searchParams.set('t', token);
  }
  if (consentLang !== '') {
    url.searchParams.set('lang', consentLang);
  }
  return url.toString();
}

async function openConsentPage(page, token = '') {
  await page.goto(buildConsentURL(token), {
    waitUntil: 'domcontentloaded'
  });
  await page.waitForSelector('.gdpr-shell', { state: 'visible' });
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch {
        // Best effort only. Snapshot should still proceed if fonts fail to load.
      }
    }
  });
}

test.describe('GDPR consent visual snapshots', () => {
  test.skip(baseURL === '', 'Set OPENCATS_BASE_URL to run GDPR consent visual checks.');

  test.beforeEach(async ({ context, page }) => {
    await context.setExtraHTTPHeaders(sessionCookie !== '' ? { Cookie: sessionCookie } : {});
    await page.setViewportSize({ width: 1366, height: 900 });
  });

  test('invalid-link state', async ({ page }) => {
    await openConsentPage(page);
    await expect(page).toHaveScreenshot(`gdpr-consent-invalid-link-${consentLang}.png`, {
      fullPage: true,
      animations: 'disabled'
    });
  });

  [
    { key: 'active', envName: 'OPENCATS_GDPR_TOKEN_ACTIVE' },
    { key: 'accepted', envName: 'OPENCATS_GDPR_TOKEN_ACCEPTED' },
    { key: 'declined', envName: 'OPENCATS_GDPR_TOKEN_DECLINED' },
    { key: 'expired', envName: 'OPENCATS_GDPR_TOKEN_EXPIRED' }
  ].forEach(({ key, envName }) => {
    test(`${key} state`, async ({ page }) => {
      const token = tokensByState[key];
      test.skip(token === '', `Set ${envName} to run GDPR consent "${key}" visual check.`);

      await openConsentPage(page, token);
      await expect(page).toHaveScreenshot(`gdpr-consent-${key}-${consentLang}.png`, {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });
});
