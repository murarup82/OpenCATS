const baseURL = String(process.env.OPENCATS_BASE_URL || '').trim();
const indexPath = String(process.env.OPENCATS_INDEX_PATH || '/index.php').trim() || '/index.php';
const sessionCookie = String(process.env.OPENCATS_COOKIE || '').trim();
const timeoutMS = Number(process.env.OPENCATS_SMOKE_TIMEOUT_MS || 20000);

const MODERN_CONTRACT_VERSION = 1;

const smokeTargets = [
  { id: 'dashboard', module: 'dashboard', action: 'my', expectedContractKeys: ['dashboard.my.readonly.v1', 'dashboard.my.interactive.v1'] },
  { id: 'candidates-list', module: 'candidates', action: 'listByView', expectedContractKeys: ['candidates.listByView.v1'] },
  { id: 'joborders-list', module: 'joborders', action: 'listByView', expectedContractKeys: ['joborders.listByView.v1'] },
  { id: 'companies-list', module: 'companies', action: 'listByView', expectedContractKeys: ['companies.listByView.v1'] },
  { id: 'contacts-list', module: 'contacts', action: 'listByView', expectedContractKeys: ['contacts.listByView.v1'] },
  { id: 'activity-list', module: 'activity', action: 'listByViewDataGrid', expectedContractKeys: ['activity.listByView.v1'] },
  { id: 'calendar', module: 'calendar', action: 'showCalendar', expectedContractKeys: ['calendar.show.v1'] },
  { id: 'lists', module: 'lists', action: 'listByView', expectedContractKeys: ['lists.listByView.v1'] },
  { id: 'reports', module: 'reports', action: 'reports', expectedContractKeys: ['reports.launcher.v1'] }
];

function joinURL(base, path) {
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function buildRequestURL(target) {
  const query = new URLSearchParams();
  query.set('m', target.module);
  query.set('a', target.action);
  query.set('format', 'modern-json');
  query.set('modernPage', `smoke.${target.id}`);
  query.set('ui', 'modern');
  return `${joinURL(baseURL, indexPath)}?${query.toString()}`;
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

async function runRouteSmoke(target) {
  const url = buildRequestURL(target);
  const response = await fetchWithTimeout(url, {
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
  if (!target.expectedContractKeys.includes(key)) {
    throw new Error(`contractKey=${key || 'missing'} (expected ${target.expectedContractKeys.join(' or ')})`);
  }

  return payload;
}

async function runDashboardMutationProbe(dashboardPayload) {
  const url = String(dashboardPayload?.actions?.setPipelineStatusURL || '').trim();
  const token = String(dashboardPayload?.actions?.setPipelineStatusToken || '').trim();
  if (url === '' || token === '') {
    return { skipped: true, message: 'No dashboard mutation endpoint/token exposed for this user.' };
  }

  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('securityToken', token);
  body.set('candidateID', '0');
  body.set('jobOrderID', '0');
  body.set('statusID', '0');
  body.set('enforceOwner', '1');

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: createHeaders('application/x-www-form-urlencoded'),
    body: body.toString(),
    redirect: 'follow'
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (_error) {
    throw new Error(`non-json response (HTTP ${response.status})`);
  }

  if (!payload || typeof payload.success !== 'boolean') {
    throw new Error('response missing boolean success field');
  }

  return {
    skipped: false,
    success: Boolean(payload.success),
    code: String(payload.code || ''),
    message: String(payload.message || '')
  };
}

async function main() {
  if (baseURL === '') {
    console.log('[modern-ui smoke] Skipped: set OPENCATS_BASE_URL (and optional OPENCATS_COOKIE) to run HTTP smoke checks.');
    process.exit(0);
  }

  const failures = [];
  const results = [];
  let dashboardPayload = null;

  for (const target of smokeTargets) {
    try {
      const payload = await runRouteSmoke(target);
      results.push({ target: target.id, status: 'ok' });
      if (target.module === 'dashboard' && target.action === 'my') {
        dashboardPayload = payload;
      }
    } catch (error) {
      const message = normalizeError(error);
      failures.push(`route:${target.id} -> ${message}`);
      results.push({ target: target.id, status: 'failed', message });
    }
  }

  if (dashboardPayload) {
    try {
      const probe = await runDashboardMutationProbe(dashboardPayload);
      if (probe.skipped) {
        results.push({ target: 'dashboard-mutation-probe', status: 'skipped', message: probe.message });
      } else {
        results.push({
          target: 'dashboard-mutation-probe',
          status: 'ok',
          message: `success=${probe.success} code=${probe.code || '-'}`
        });
      }
    } catch (error) {
      failures.push(`mutation:dashboard.setPipelineStatus -> ${normalizeError(error)}`);
      results.push({
        target: 'dashboard-mutation-probe',
        status: 'failed',
        message: normalizeError(error)
      });
    }
  }

  console.log('[modern-ui smoke] Results:');
  for (const result of results) {
    const status = result.status.toUpperCase();
    const suffix = result.message ? ` (${result.message})` : '';
    console.log(`- ${status}: ${result.target}${suffix}`);
  }

  if (failures.length > 0) {
    console.error('[modern-ui smoke] Failures detected:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log('[modern-ui smoke] All configured checks passed.');
}

main().catch((error) => {
  console.error(`[modern-ui smoke] Fatal error: ${normalizeError(error)}`);
  process.exit(1);
});
