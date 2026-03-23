export const MODERN_JSON_FORMAT = 'modern-json';
export const MODERN_DASHBOARD_PAGE = 'dashboard-my';
export const MODERN_CANDIDATES_PAGE = 'candidates-list';
export const MODERN_CANDIDATE_RESUME_PAGE = 'candidates-view-resume';
export const MODERN_CANDIDATE_SHOW_PAGE = 'candidates-show';
export const MODERN_CANDIDATE_EDIT_PAGE = 'candidates-edit';
export const MODERN_CANDIDATE_ADD_PAGE = 'candidates-add';
export const MODERN_JOBORDERS_PAGE = 'joborders-list';
export const MODERN_JOBORDER_SHOW_PAGE = 'joborders-show';
export const MODERN_JOBORDER_ADD_PAGE = 'joborders-add';
export const MODERN_JOBORDER_ADD_POPUP_PAGE = 'joborders-add-popup';
export const MODERN_JOBORDER_RECRUITER_ALLOCATION_PAGE = 'joborders-recruiter-allocation';
export const MODERN_JOBORDER_PIPELINE_MATRIX_PAGE = 'joborders-pipeline-matrix';
export const MODERN_JOBORDER_EDIT_PAGE = 'joborders-edit';
export const MODERN_COMPANIES_PAGE = 'companies-list';
export const MODERN_COMPANY_SHOW_PAGE = 'companies-show';
export const MODERN_COMPANY_ADD_PAGE = 'companies-add';
export const MODERN_COMPANY_EDIT_PAGE = 'companies-edit';
export const MODERN_CONTACTS_PAGE = 'contacts-list';
export const MODERN_CONTACT_COLD_CALL_LIST_PAGE = 'contacts-cold-call-list';
export const MODERN_CONTACT_SHOW_PAGE = 'contacts-show';
export const MODERN_CONTACT_ADD_PAGE = 'contacts-add';
export const MODERN_CONTACT_EDIT_PAGE = 'contacts-edit';
export const MODERN_ACTIVITY_PAGE = 'activity-list';
export const MODERN_CALENDAR_PAGE = 'calendar-workspace';
export const MODERN_LISTS_PAGE = 'lists-manage';
export const MODERN_LISTS_DETAIL_PAGE = 'lists-detail';
export const MODERN_REPORTS_PAGE = 'reports-launcher';
export const MODERN_REPORTS_CUSTOMER_DASHBOARD_PAGE = 'reports-customer-dashboard';
export const MODERN_REPORTS_GRAPH_VIEW_PAGE = 'reports-graph-view';
export const MODERN_GDPR_REQUESTS_PAGE = 'gdpr-requests';
export const MODERN_SOURCING_PAGE = 'sourcing-workspace';
export const MODERN_QUEUE_PAGE = 'queue-workspace';
export const MODERN_GRAPHS_PAGE = 'graphs-workspace';
export const MODERN_HOME_OVERVIEW_PAGE = 'home-overview';
export const MODERN_HOME_INBOX_PAGE = 'home-inbox';
export const MODERN_HOME_MYNOTES_PAGE = 'home-mynotes';
export const MODERN_HOME_QUICKSEARCH_PAGE = 'home-quicksearch';
export const MODERN_IMPORT_LAUNCHER_PAGE = 'import-launcher';
export const MODERN_SETTINGS_ADMINISTRATION_PAGE = 'settings-administration';
export const MODERN_LOGIN_PAGE = 'login-workspace';
export const MODERN_RSS_JOBORDERS_PAGE = 'rss-joborders';
export const MODERN_KPIS_PAGE = 'kpis-list';
export const MODERN_KPIS_DETAILS_PAGE = 'kpis-details';
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
