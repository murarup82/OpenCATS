import type { DashboardModernDataResponse, UIModeBootstrap } from '../types';

export async function fetchDashboardModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<DashboardModernDataResponse> {
  const apiQuery = new URLSearchParams(query);
  apiQuery.set('m', 'dashboard');
  apiQuery.set('a', 'my');
  apiQuery.set('format', 'modern-json');
  apiQuery.set('ui', 'legacy');
  apiQuery.set('view', 'list');

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'same-origin'
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  return (await response.json()) as DashboardModernDataResponse;
}

