import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const fixturePath = resolve(scriptDir, 'fixtures', 'mutation-safe-replays.json');

const baseURL = String(process.env.OPENCATS_BASE_URL || '').trim();
const indexPath = String(process.env.OPENCATS_INDEX_PATH || '/index.php').trim() || '/index.php';
const sessionCookie = String(process.env.OPENCATS_COOKIE || '').trim();
const timeoutMS = Number(process.env.OPENCATS_SMOKE_TIMEOUT_MS || 20000);

const ids = {
  candidateID: Number(process.env.OPENCATS_CANDIDATE_ID || 0),
  jobOrderID: Number(process.env.OPENCATS_JOBORDER_ID || 0),
  companyID: Number(process.env.OPENCATS_COMPANY_ID || 0),
  contactID: Number(process.env.OPENCATS_CONTACT_ID || 0),
  pipelineID: Number(process.env.OPENCATS_PIPELINE_ID || 0)
};

const MODERN_CONTRACT_VERSION = 1;

const endpointChecks = [
  {
    id: 'dashboard.my',
    query: { m: 'dashboard', a: 'my', view: 'kanban' },
    expectedKeys: ['dashboard.my.readonly.v1', 'dashboard.my.interactive.v1']
  },
  {
    id: 'candidates.listByView',
    query: { m: 'candidates', a: 'listByView' },
    expectedKeys: ['candidates.listByView.v1']
  },
  {
    id: 'candidates.add',
    query: { m: 'candidates', a: 'add' },
    expectedKeys: ['candidates.add.v1']
  },
  {
    id: 'candidates.show',
    query: { m: 'candidates', a: 'show' },
    requiredEnv: 'OPENCATS_CANDIDATE_ID',
    addID: () => ({ candidateID: ids.candidateID }),
    expectedKeys: ['candidates.show.v1']
  },
  {
    id: 'candidates.edit',
    query: { m: 'candidates', a: 'edit' },
    requiredEnv: 'OPENCATS_CANDIDATE_ID',
    addID: () => ({ candidateID: ids.candidateID }),
    expectedKeys: ['candidates.edit.v1']
  },
  {
    id: 'joborders.listByView',
    query: { m: 'joborders', a: 'listByView' },
    expectedKeys: ['joborders.listByView.v1']
  },
  {
    id: 'joborders.show',
    query: { m: 'joborders', a: 'show' },
    requiredEnv: 'OPENCATS_JOBORDER_ID',
    addID: () => ({ jobOrderID: ids.jobOrderID }),
    expectedKeys: ['joborders.show.v1']
  },
  {
    id: 'joborders.pipelineStatusDetails',
    query: { m: 'joborders', a: 'pipelineStatusDetails' },
    requiredEnv: 'OPENCATS_PIPELINE_ID',
    addID: () => ({ pipelineID: ids.pipelineID }),
    expectedKeys: ['pipeline.statusDetails.v1']
  },
  {
    id: 'companies.listByView',
    query: { m: 'companies', a: 'listByView' },
    expectedKeys: ['companies.listByView.v1']
  },
  {
    id: 'companies.show',
    query: { m: 'companies', a: 'show' },
    requiredEnv: 'OPENCATS_COMPANY_ID',
    addID: () => ({ companyID: ids.companyID }),
    expectedKeys: ['companies.show.v1']
  },
  {
    id: 'contacts.listByView',
    query: { m: 'contacts', a: 'listByView' },
    expectedKeys: ['contacts.listByView.v1']
  },
  {
    id: 'contacts.show',
    query: { m: 'contacts', a: 'show' },
    requiredEnv: 'OPENCATS_CONTACT_ID',
    addID: () => ({ contactID: ids.contactID }),
    expectedKeys: ['contacts.show.v1']
  },
  {
    id: 'activity.listByViewDataGrid',
    query: { m: 'activity', a: 'listByViewDataGrid' },
    expectedKeys: ['activity.listByView.v1']
  },
  {
    id: 'calendar.showCalendar',
    query: { m: 'calendar', a: 'showCalendar' },
    expectedKeys: ['calendar.show.v1']
  },
  {
    id: 'lists.listByView',
    query: { m: 'lists', a: 'listByView' },
    expectedKeys: ['lists.listByView.v1']
  },
  {
    id: 'reports.reports',
    query: { m: 'reports', a: 'reports' },
    expectedKeys: ['reports.launcher.v1']
  }
];

function loadFixtures() {
  try {
    const raw = readFileSync(fixturePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch (_error) {
    return [];
  }
}

function joinURL(base, path) {
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function createHeaders(contentType = '') {
  const headers = {};
  if (contentType !== '') {
    headers['Content-Type'] = contentType;
  }
  if (sessionCookie !== '') {
    headers.Cookie = sessionCookie;
  }
  return headers;
}

async function fetchWithTimeout(url, init = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMS);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeError(error) {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error || 'Unknown error');
}

function getValueByPath(source, path) {
  const segments = String(path || '').split('.').filter((segment) => segment !== '');
  let cursor = source;
  for (const segment of segments) {
    if (!cursor || typeof cursor !== 'object' || !(segment in cursor)) {
      return undefined;
    }
    cursor = cursor[segment];
  }
  return cursor;
}

function buildCheckURL(check) {
  const query = new URLSearchParams();
  const merged = {
    ...check.query,
    ...(typeof check.addID === 'function' ? check.addID() : {})
  };
  Object.keys(merged).forEach((key) => {
    query.set(key, String(merged[key]));
  });
  query.set('format', 'modern-json');
  query.set('modernPage', `smoke.endpoint.${check.id}`);
  query.set('ui', 'modern');
  return `${joinURL(baseURL, indexPath)}?${query.toString()}`;
}

async function runEndpointCheck(check) {
  const response = await fetchWithTimeout(buildCheckURL(check), {
    method: 'GET',
    headers: createHeaders(),
    redirect: 'follow'
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const payload = await response.json();
  const meta = payload?.meta || {};
  const version = Number(meta.contractVersion || 0);
  const key = String(meta.contractKey || '').trim();
  if (version !== MODERN_CONTRACT_VERSION) {
    throw new Error(`contractVersion=${version} (expected ${MODERN_CONTRACT_VERSION})`);
  }
  if (!check.expectedKeys.includes(key)) {
    throw new Error(`contractKey=${key || 'missing'} (expected ${check.expectedKeys.join(' or ')})`);
  }
  return payload;
}

async function runMutationFixture(fixture, payloadByCheckID) {
  const sourcePayload = payloadByCheckID.get(fixture.sourceCheckID);
  if (!sourcePayload) {
    return {
      skipped: true,
      message: `source payload ${fixture.sourceCheckID} unavailable`
    };
  }

  const endpointValue = getValueByPath(sourcePayload, fixture.endpointPath);
  const endpointURLRaw = String(endpointValue || '').trim();
  if (endpointURLRaw === '') {
    return {
      skipped: true,
      message: `endpoint path ${fixture.endpointPath} missing`
    };
  }

  const endpointURL = new URL(endpointURLRaw.replace(/&amp;/g, '&'), joinURL(baseURL, indexPath)).toString();

  const bodyData = new URLSearchParams();
  const templateBody = fixture.body || {};
  Object.keys(templateBody).forEach((key) => {
    bodyData.set(key, String(templateBody[key]));
  });

  if (fixture.tokenField && fixture.tokenPath) {
    const token = String(getValueByPath(sourcePayload, fixture.tokenPath) || '').trim();
    if (token === '') {
      return {
        skipped: true,
        message: `token path ${fixture.tokenPath} missing`
      };
    }
    bodyData.set(String(fixture.tokenField), token);
  }

  const method = String(fixture.method || 'POST').toUpperCase();
  const response = await fetchWithTimeout(endpointURL, {
    method,
    headers: createHeaders('application/x-www-form-urlencoded'),
    body: bodyData.toString(),
    redirect: 'follow'
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (_error) {
    throw new Error(`non-json response (${response.status})`);
  }

  const expectedField = String(fixture.expectsBooleanField || 'success');
  if (!payload || typeof payload[expectedField] !== 'boolean') {
    throw new Error(`missing boolean field "${expectedField}"`);
  }

  return {
    skipped: false,
    value: payload[expectedField] ? 'success' : 'error',
    code: String(payload.code || '')
  };
}

async function main() {
  if (baseURL === '') {
    console.log('[modern-ui endpoints] Skipped: set OPENCATS_BASE_URL (and optional OPENCATS_COOKIE) to run HTTP endpoint checks.');
    process.exit(0);
  }

  const failures = [];
  const rows = [];
  const payloadByCheckID = new Map();

  for (const check of endpointChecks) {
    if (check.requiredEnv) {
      const value = process.env[check.requiredEnv];
      if (!value || Number(value) <= 0) {
        rows.push({ id: check.id, status: 'SKIP', message: `missing ${check.requiredEnv}` });
        continue;
      }
    }

    try {
      const payload = await runEndpointCheck(check);
      payloadByCheckID.set(check.id, payload);
      rows.push({ id: check.id, status: 'OK', message: '' });
    } catch (error) {
      const message = normalizeError(error);
      rows.push({ id: check.id, status: 'FAIL', message });
      failures.push(`${check.id}: ${message}`);
    }
  }

  const fixtures = loadFixtures();
  for (const fixture of fixtures) {
    try {
      const result = await runMutationFixture(fixture, payloadByCheckID);
      if (result.skipped) {
        rows.push({ id: fixture.id, status: 'SKIP', message: result.message });
      } else {
        rows.push({
          id: fixture.id,
          status: 'OK',
          message: `${result.value}${result.code ? ` (code=${result.code})` : ''}`
        });
      }
    } catch (error) {
      const message = normalizeError(error);
      rows.push({ id: fixture.id, status: 'FAIL', message });
      failures.push(`${fixture.id}: ${message}`);
    }
  }

  console.log('[modern-ui endpoints] Results:');
  for (const row of rows) {
    const suffix = row.message ? ` (${row.message})` : '';
    console.log(`- ${row.status}: ${row.id}${suffix}`);
  }

  if (failures.length > 0) {
    console.error('[modern-ui endpoints] Failures detected:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log('[modern-ui endpoints] All configured checks passed.');
}

main().catch((error) => {
  console.error(`[modern-ui endpoints] Fatal error: ${normalizeError(error)}`);
  process.exit(1);
});
