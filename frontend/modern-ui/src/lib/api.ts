import type { DashboardModernDataResponse, UIModeBootstrap } from '../types';
import { getJSON } from './httpClient';
import {
  MODERN_CONTRACT_VERSION,
  MODERN_DASHBOARD_PAGE,
  buildModernJSONRequestQuery
} from './modernContract';

export async function fetchDashboardModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<DashboardModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'dashboard',
    action: 'my',
    modernPage: MODERN_DASHBOARD_PAGE,
    query
  });
  if (!apiQuery.get('view')) {
    apiQuery.set('view', 'kanban');
  }

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<DashboardModernDataResponse>(url);
  if (!data.meta || data.meta.contractVersion !== MODERN_CONTRACT_VERSION) {
    throw new Error('Contract version mismatch while loading dashboard data.');
  }

  if (data.meta.contractKey !== 'dashboard.my.readonly.v1') {
    throw new Error('Unexpected dashboard contract key.');
  }

  return data;
}
