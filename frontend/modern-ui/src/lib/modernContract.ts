export const MODERN_JSON_FORMAT = 'modern-json';
export const MODERN_DASHBOARD_PAGE = 'dashboard-my';
export const MODERN_CANDIDATES_PAGE = 'candidates-list';
export const MODERN_CANDIDATE_SHOW_PAGE = 'candidates-show';
export const MODERN_CANDIDATE_EDIT_PAGE = 'candidates-edit';
export const MODERN_CANDIDATE_ADD_PAGE = 'candidates-add';
export const MODERN_JOBORDERS_PAGE = 'joborders-list';
export const MODERN_JOBORDER_SHOW_PAGE = 'joborders-show';
export const MODERN_CONTRACT_VERSION = 1;

export type ModernRequestParams = {
  module: string;
  action: string;
  modernPage: string;
  query?: URLSearchParams;
};

export function buildModernJSONRequestQuery(params: ModernRequestParams): URLSearchParams {
  const next = new URLSearchParams(params.query ?? undefined);
  next.set('m', params.module);
  next.set('a', params.action);
  next.set('format', MODERN_JSON_FORMAT);
  next.set('modernPage', params.modernPage);
  next.set('contractVersion', String(MODERN_CONTRACT_VERSION));

  /* Explicitly bypass modern shell routing for data requests. */
  next.set('ui', 'legacy');

  return next;
}
