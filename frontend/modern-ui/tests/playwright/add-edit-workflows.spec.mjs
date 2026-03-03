import { expect, test } from '@playwright/test';

const baseURL = String(process.env.OPENCATS_BASE_URL || '').trim();
const indexPath = String(process.env.OPENCATS_INDEX_PATH || '/index.php').trim() || '/index.php';
const sessionCookie = String(process.env.OPENCATS_COOKIE || '').trim();
const contractVersion = 1;

const idsByEnv = {
  OPENCATS_CANDIDATE_ID: Number(process.env.OPENCATS_CANDIDATE_ID || 0),
  OPENCATS_COMPANY_ID: Number(process.env.OPENCATS_COMPANY_ID || 0),
  OPENCATS_CONTACT_ID: Number(process.env.OPENCATS_CONTACT_ID || 0),
  OPENCATS_JOBORDER_ID: Number(process.env.OPENCATS_JOBORDER_ID || 0)
};

const workflows = [
  {
    module: 'candidates',
    add: { action: 'add', expectedContractKey: 'candidates.add.v1' },
    edit: {
      action: 'edit',
      expectedContractKey: 'candidates.edit.v1',
      requiredEnv: 'OPENCATS_CANDIDATE_ID',
      idParam: 'candidateID'
    }
  },
  {
    module: 'companies',
    add: { action: 'add', expectedContractKey: 'companies.add.v1' },
    edit: {
      action: 'edit',
      expectedContractKey: 'companies.edit.v1',
      requiredEnv: 'OPENCATS_COMPANY_ID',
      idParam: 'companyID'
    }
  },
  {
    module: 'contacts',
    add: { action: 'add', expectedContractKey: 'contacts.add.v1' },
    edit: {
      action: 'edit',
      expectedContractKey: 'contacts.edit.v1',
      requiredEnv: 'OPENCATS_CONTACT_ID',
      idParam: 'contactID'
    }
  },
  {
    module: 'joborders',
    add: { action: 'add', expectedContractKey: 'joborders.add.v1' },
    edit: {
      action: 'edit',
      expectedContractKey: 'joborders.edit.v1',
      requiredEnv: 'OPENCATS_JOBORDER_ID',
      idParam: 'jobOrderID'
    }
  }
];

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

function buildURL(moduleName, actionName, extras = {}) {
  const query = new URLSearchParams({
    m: moduleName,
    a: actionName,
    format: 'modern-json',
    modernPage: `playwright.smoke.${moduleName}.${actionName}`,
    ui: 'modern'
  });

  Object.entries(extras).forEach(([key, value]) => {
    if (value !== null && value !== undefined && String(value) !== '') {
      query.set(key, String(value));
    }
  });

  return `${joinURL(baseURL, indexPath)}?${query.toString()}`;
}

async function assertModernContract(request, definition, extras = {}) {
  const url = buildURL(definition.module, definition.action, extras);
  const response = await request.get(url, {
    headers: buildHeaders(),
    failOnStatusCode: false
  });

  expect(response.ok(), `${definition.module}.${definition.action} should return HTTP 200`).toBeTruthy();

  const payload = await response.json();
  const meta = payload?.meta || {};
  const actions = payload?.actions || {};

  expect(Number(meta.contractVersion || 0)).toBe(contractVersion);
  expect(String(meta.contractKey || '').trim()).toBe(definition.expectedContractKey);
  expect(String(meta.modernPage || '').trim()).not.toBe('');
  expect(String(actions.submitURL || '').trim()).not.toBe('');
  expect(String(actions.legacyURL || '').trim()).not.toBe('');
}

test.describe('Modern add/edit workflow contract smoke', () => {
  test.skip(baseURL === '', 'Set OPENCATS_BASE_URL to run Playwright contract smoke checks.');

  workflows.forEach((workflow) => {
    test(`${workflow.module}.add modern contract`, async ({ request }) => {
      await assertModernContract(request, {
        module: workflow.module,
        action: workflow.add.action,
        expectedContractKey: workflow.add.expectedContractKey
      });
    });

    test(`${workflow.module}.edit modern contract`, async ({ request }) => {
      const requiredID = idsByEnv[workflow.edit.requiredEnv];
      test.skip(
        !Number.isFinite(requiredID) || requiredID <= 0,
        `Set ${workflow.edit.requiredEnv} to run ${workflow.module}.edit smoke.`
      );

      await assertModernContract(
        request,
        {
          module: workflow.module,
          action: workflow.edit.action,
          expectedContractKey: workflow.edit.expectedContractKey
        },
        { [workflow.edit.idParam]: requiredID }
      );
    });
  });
});
