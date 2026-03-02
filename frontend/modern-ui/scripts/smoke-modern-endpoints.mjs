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
}

async function runMutationProbe() {
  const dashboardCheck = endpointChecks.find((entry) => entry.id === 'dashboard.my');
  if (!dashboardCheck) {
    return { skipped: true, message: 'dashboard.my check not configured.' };
  }

  const response = await fetchWithTimeout(buildCheckURL(dashboardCheck), {
    method: 'GET',
    headers: createHeaders(),
    redirect: 'follow'
  });
  if (!response.ok) {
    return { skipped: true, message: `dashboard fetch failed (${response.status})` };
  }
  const payload = await response.json();

  const url = String(payload?.actions?.setPipelineStatusURL || '').trim();
  const token = String(payload?.actions?.setPipelineStatusToken || '').trim();
  if (url === '' || token === '') {
    return { skipped: true, message: 'No setPipelineStatus endpoint/token exposed.' };
  }

  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('securityToken', token);
  body.set('candidateID', '0');
  body.set('jobOrderID', '0');
  body.set('statusID', '0');
  body.set('enforceOwner', '1');

  const mutationResponse = await fetchWithTimeout(url, {
    method: 'POST',
    headers: createHeaders('application/x-www-form-urlencoded'),
    body: body.toString(),
    redirect: 'follow'
  });

  let mutationPayload = null;
  try {
    mutationPayload = await mutationResponse.json();
  } catch (_error) {
    throw new Error(`dashboard mutation probe returned non-json response (${mutationResponse.status})`);
  }

  if (!mutationPayload || typeof mutationPayload.success !== 'boolean') {
    throw new Error('dashboard mutation probe missing boolean success field');
  }

  return {
    skipped: false,
    status: mutationPayload.success ? 'success' : 'error',
    code: String(mutationPayload.code || '')
  };
}

async function main() {
  if (baseURL === '') {
    console.log('[modern-ui endpoints] Skipped: set OPENCATS_BASE_URL (and optional OPENCATS_COOKIE) to run HTTP endpoint checks.');
    process.exit(0);
  }

  const failures = [];
  const rows = [];

  for (const check of endpointChecks) {
    if (check.requiredEnv) {
      const value = process.env[check.requiredEnv];
      if (!value || Number(value) <= 0) {
        rows.push({ id: check.id, status: 'SKIP', message: `missing ${check.requiredEnv}` });
        continue;
      }
    }

    try {
      await runEndpointCheck(check);
      rows.push({ id: check.id, status: 'OK', message: '' });
    } catch (error) {
      const message = normalizeError(error);
      rows.push({ id: check.id, status: 'FAIL', message });
      failures.push(`${check.id}: ${message}`);
    }
  }

  try {
    const probe = await runMutationProbe();
    if (probe.skipped) {
      rows.push({ id: 'dashboard.setPipelineStatus.probe', status: 'SKIP', message: probe.message });
    } else {
      rows.push({
        id: 'dashboard.setPipelineStatus.probe',
        status: 'OK',
        message: `${probe.status} ${probe.code ? `(code=${probe.code})` : ''}`.trim()
      });
    }
  } catch (error) {
    const message = normalizeError(error);
    rows.push({ id: 'dashboard.setPipelineStatus.probe', status: 'FAIL', message });
    failures.push(`dashboard.setPipelineStatus.probe: ${message}`);
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
