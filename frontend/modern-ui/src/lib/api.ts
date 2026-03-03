import type {
  ActivityListModernDataResponse,
  CalendarEventMutationResponse,
  CalendarModernDataResponse,
  CandidateResumeModernDataResponse,
  CandidateAssignToJobOrderModernDataResponse,
  CandidateAssignToJobOrderMutationResponse,
  CandidateDuplicateCheckResponse,
  CandidatesAddModernDataResponse,
  CandidatesEditModernDataResponse,
  CandidatesListModernDataResponse,
  CandidatesShowModernDataResponse,
  CompaniesAddModernDataResponse,
  CompaniesEditModernDataResponse,
  CompaniesListModernDataResponse,
  CompaniesShowModernDataResponse,
  ContactsAddModernDataResponse,
  ContactsEditModernDataResponse,
  ContactsListModernDataResponse,
  ContactsShowModernDataResponse,
  DashboardModernDataResponse,
  DashboardSetPipelineStatusResponse,
  GraphsOverviewModernDataResponse,
  HomeInboxModernDataResponse,
  HomeMyNotesModernDataResponse,
  HomeOverviewModernDataResponse,
  JobOrderAddPopupModernDataResponse,
  JobOrderCompanyContextModernDataResponse,
  JobOrderAssignCandidateModernDataResponse,
  JobOrdersAddModernDataResponse,
  JobOrdersEditModernDataResponse,
  JobOrdersShowModernDataResponse,
  JobOrdersListModernDataResponse,
  KpisDetailsModernDataResponse,
  KpisListModernDataResponse,
  ListsDetailModernDataResponse,
  ListsManageModernDataResponse,
  ModernMutationResponse,
  PipelineStatusDetailsModernDataResponse,
  PipelineStatusHistoryUpdateResponse,
  PipelineRemoveModernResponse,
  QueueOverviewModernDataResponse,
  QuickActionAddToListModernDataResponse,
  ReportsCustomerDashboardModernDataResponse,
  ReportsGraphViewModernDataResponse,
  ReportsLauncherModernDataResponse,
  SourcingListModernDataResponse,
  SourcingSaveMutationResponse,
  UIModeBootstrap
} from '../types';
import { getJSON } from './httpClient';
import { assertModernContract } from './contractGuards';
import {
  MODERN_ACTIVITY_PAGE,
  MODERN_CALENDAR_PAGE,
  MODERN_CANDIDATE_RESUME_PAGE,
  MODERN_CANDIDATES_PAGE,
  MODERN_CANDIDATE_ADD_PAGE,
  MODERN_CANDIDATE_EDIT_PAGE,
  MODERN_CANDIDATE_SHOW_PAGE,
  MODERN_COMPANY_ADD_PAGE,
  MODERN_COMPANY_EDIT_PAGE,
  MODERN_COMPANIES_PAGE,
  MODERN_COMPANY_SHOW_PAGE,
  MODERN_CONTACT_ADD_PAGE,
  MODERN_CONTACT_EDIT_PAGE,
  MODERN_CONTACTS_PAGE,
  MODERN_CONTACT_SHOW_PAGE,
  MODERN_DASHBOARD_PAGE,
  MODERN_GRAPHS_PAGE,
  MODERN_JOBORDER_ADD_PAGE,
  MODERN_JOBORDER_ADD_POPUP_PAGE,
  MODERN_JOBORDER_EDIT_PAGE,
  MODERN_JOBORDER_SHOW_PAGE,
  MODERN_JOBORDERS_PAGE,
  MODERN_KPIS_PAGE,
  MODERN_LISTS_DETAIL_PAGE,
  MODERN_LISTS_PAGE,
  MODERN_HOME_OVERVIEW_PAGE,
  MODERN_HOME_INBOX_PAGE,
  MODERN_HOME_MYNOTES_PAGE,
  MODERN_QUEUE_PAGE,
  MODERN_REPORTS_CUSTOMER_DASHBOARD_PAGE,
  MODERN_REPORTS_GRAPH_VIEW_PAGE,
  MODERN_REPORTS_PAGE,
  MODERN_SOURCING_PAGE,
  MODERN_KPIS_DETAILS_PAGE,
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
  assertModernContract(data.meta, ['dashboard.my.readonly.v1', 'dashboard.my.interactive.v1'], 'dashboard data');

  return data;
}

export async function fetchHomeOverviewModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<HomeOverviewModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'home',
    action: 'home',
    modernPage: MODERN_HOME_OVERVIEW_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<HomeOverviewModernDataResponse>(url);
  assertModernContract(data.meta, 'home.overview.v1', 'home overview data');

  return data;
}

export async function fetchKpisListModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<KpisListModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'kpis',
    action: '',
    modernPage: MODERN_KPIS_PAGE,
    query
  });
  apiQuery.delete('a');

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<KpisListModernDataResponse>(url);
  assertModernContract(data.meta, 'kpis.list.v1', 'kpis list data');

  return data;
}

export async function fetchKpisDetailsModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<KpisDetailsModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'kpis',
    action: 'details',
    modernPage: MODERN_KPIS_DETAILS_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<KpisDetailsModernDataResponse>(url);
  assertModernContract(data.meta, 'kpis.details.v1', 'kpis details data');

  return data;
}

export async function fetchHomeInboxModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<HomeInboxModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'home',
    action: 'inbox',
    modernPage: MODERN_HOME_INBOX_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<HomeInboxModernDataResponse>(url);
  assertModernContract(data.meta, 'home.inbox.v1', 'home inbox data');

  return data;
}

export async function fetchHomeMyNotesModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<HomeMyNotesModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'home',
    action: 'myNotes',
    modernPage: MODERN_HOME_MYNOTES_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<HomeMyNotesModernDataResponse>(url);
  assertModernContract(data.meta, 'home.mynotes.v1', 'home my-notes data');

  return data;
}

export async function setDashboardPipelineStatus(
  bootstrap: UIModeBootstrap,
  payload: {
    url?: string;
    securityToken: string;
    candidateID: number;
    jobOrderID: number;
    statusID: number;
    enforceOwner: boolean;
    statusComment?: string;
    requireStatusComment?: boolean;
    rejectionReasonIDs?: number[];
    rejectionReasonOther?: string;
  }
): Promise<DashboardSetPipelineStatusResponse> {
  const url =
    typeof payload.url === 'string' && payload.url.trim() !== ''
      ? payload.url
      : `${bootstrap.indexName}?m=dashboard&a=setPipelineStatus`;

  const body = new URLSearchParams();
  body.set('securityToken', payload.securityToken || '');
  body.set('candidateID', String(payload.candidateID || 0));
  body.set('jobOrderID', String(payload.jobOrderID || 0));
  body.set('statusID', String(payload.statusID || 0));
  body.set('enforceOwner', payload.enforceOwner ? '1' : '0');
  if (payload.requireStatusComment === true) {
    body.set('requireStatusComment', '1');
  }
  if (typeof payload.statusComment === 'string' && payload.statusComment.trim() !== '') {
    body.set('statusComment', payload.statusComment.trim());
  }
  if (Array.isArray(payload.rejectionReasonIDs)) {
    payload.rejectionReasonIDs
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value) && value > 0)
      .forEach((value) => {
        body.append('rejectionReasonIDs[]', String(value));
      });
  }
  if (typeof payload.rejectionReasonOther === 'string' && payload.rejectionReasonOther.trim() !== '') {
    body.set('rejectionReasonOther', payload.rejectionReasonOther.trim());
  }

  const response = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: DashboardSetPipelineStatusResponse | null = null;
  try {
    result = (await response.json()) as DashboardSetPipelineStatusResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Pipeline status update failed (${response.status}).`);
  }

  return result;
}

export async function removePipelineEntryViaLegacyURL(
  removeURL: string,
  securityToken: string,
  commentText: string
): Promise<PipelineRemoveModernResponse> {
  const parsedURL = new URL(String(removeURL || '').replace(/&amp;/g, '&'), window.location.href);
  parsedURL.searchParams.set('format', 'modern-json');
  parsedURL.searchParams.delete('display');

  const candidateID = parsedURL.searchParams.get('candidateID') || '';
  const jobOrderID = parsedURL.searchParams.get('jobOrderID') || '';

  const body = new URLSearchParams();
  body.set('candidateID', candidateID);
  body.set('jobOrderID', jobOrderID);
  body.set('comment', commentText || '');
  body.set('securityToken', securityToken || '');

  const response = await fetch(parsedURL.toString(), {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let payload: PipelineRemoveModernResponse | null = null;
  try {
    payload = (await response.json()) as PipelineRemoveModernResponse;
  } catch (_error) {
    payload = null;
  }

  if (!payload) {
    throw new Error(`Remove from pipeline failed (${response.status}).`);
  }

  return payload;
}

export async function fetchPipelineStatusDetailsModernData(
  bootstrap: UIModeBootstrap,
  pipelineID: number
): Promise<PipelineStatusDetailsModernDataResponse> {
  const query = new URLSearchParams();
  query.set('m', 'joborders');
  query.set('a', 'pipelineStatusDetails');
  query.set('pipelineID', String(pipelineID || 0));
  query.set('format', 'modern-json');
  query.set('modernPage', 'pipeline.status.details');

  const url = `${bootstrap.indexName}?${query.toString()}`;
  const data = await getJSON<PipelineStatusDetailsModernDataResponse>(url);
  assertModernContract(data.meta, 'pipeline.statusDetails.v1', 'pipeline details');

  return data;
}

export async function updatePipelineStatusHistoryDate(
  editURL: string,
  payload: {
    pipelineID: number;
    historyID: number;
    newDate: string;
    originalDate: string;
    editNote: string;
  }
): Promise<PipelineStatusHistoryUpdateResponse> {
  const body = new URLSearchParams();
  body.set('postback', 'postback');
  body.set('format', 'modern-json');
  body.set('pipelineID', String(payload.pipelineID || 0));
  body.set('historyID', String(payload.historyID || 0));
  body.set(`newDate[${payload.historyID}]`, payload.newDate || '');
  body.set(`originalDate[${payload.historyID}]`, payload.originalDate || '');
  body.set(`editNote[${payload.historyID}]`, payload.editNote || '');

  const response = await fetch(editURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: PipelineStatusHistoryUpdateResponse | null = null;
  try {
    result = (await response.json()) as PipelineStatusHistoryUpdateResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Pipeline history update failed (${response.status}).`);
  }

  return result;
}

export async function addJobOrderProfileComment(
  submitURL: string,
  payload: {
    jobOrderID: number;
    securityToken: string;
    commentCategory: string;
    commentText: string;
  }
): Promise<ModernMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('jobOrderID', String(payload.jobOrderID || 0));
  body.set('securityToken', payload.securityToken || '');
  body.set('commentCategory', payload.commentCategory || 'General');
  body.set('commentText', payload.commentText || '');

  const response = await fetch(submitURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: ModernMutationResponse | null = null;
  try {
    result = (await response.json()) as ModernMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Comment submit failed (${response.status}).`);
  }

  return result;
}

export async function postJobOrderMessage(
  submitURL: string,
  payload: {
    jobOrderID: number;
    securityToken: string;
    messageBody: string;
  }
): Promise<ModernMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('jobOrderID', String(payload.jobOrderID || 0));
  body.set('securityToken', payload.securityToken || '');
  body.set('messageBody', payload.messageBody || '');

  const response = await fetch(submitURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: ModernMutationResponse | null = null;
  try {
    result = (await response.json()) as ModernMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Message post failed (${response.status}).`);
  }

  return result;
}

export async function deleteJobOrderMessageThread(
  submitURL: string,
  payload: {
    jobOrderID: number;
    threadID: number;
    securityToken: string;
  }
): Promise<ModernMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('jobOrderID', String(payload.jobOrderID || 0));
  body.set('threadID', String(payload.threadID || 0));
  body.set('securityToken', payload.securityToken || '');

  const response = await fetch(submitURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: ModernMutationResponse | null = null;
  try {
    result = (await response.json()) as ModernMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Message thread delete failed (${response.status}).`);
  }

  return result;
}

export async function addCandidateProfileComment(
  submitURL: string,
  payload: {
    candidateID: number;
    securityToken: string;
    commentCategory: string;
    commentText: string;
  }
): Promise<ModernMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('candidateID', String(payload.candidateID || 0));
  body.set('securityToken', payload.securityToken || '');
  body.set('commentCategory', payload.commentCategory || 'General');
  body.set('commentText', payload.commentText || '');

  const response = await fetch(submitURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: ModernMutationResponse | null = null;
  try {
    result = (await response.json()) as ModernMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Candidate comment submit failed (${response.status}).`);
  }

  return result;
}

export async function postCandidateMessage(
  submitURL: string,
  payload: {
    candidateID: number;
    securityToken: string;
    messageBody: string;
  }
): Promise<ModernMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('candidateID', String(payload.candidateID || 0));
  body.set('securityToken', payload.securityToken || '');
  body.set('messageBody', payload.messageBody || '');

  const response = await fetch(submitURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: ModernMutationResponse | null = null;
  try {
    result = (await response.json()) as ModernMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Candidate message post failed (${response.status}).`);
  }

  return result;
}

export async function deleteCandidateMessageThread(
  submitURL: string,
  payload: {
    candidateID: number;
    threadID: number;
    securityToken: string;
  }
): Promise<ModernMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('candidateID', String(payload.candidateID || 0));
  body.set('threadID', String(payload.threadID || 0));
  body.set('securityToken', payload.securityToken || '');

  const response = await fetch(submitURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: ModernMutationResponse | null = null;
  try {
    result = (await response.json()) as ModernMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Candidate thread delete failed (${response.status}).`);
  }

  return result;
}

export async function deleteCandidateAttachment(
  submitURL: string,
  payload: {
    candidateID: number;
    attachmentID: number;
    securityToken: string;
  }
): Promise<ModernMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('candidateID', String(payload.candidateID || 0));
  body.set('attachmentID', String(payload.attachmentID || 0));
  body.set('securityToken', payload.securityToken || '');

  const response = await fetch(submitURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: ModernMutationResponse | null = null;
  try {
    result = (await response.json()) as ModernMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Candidate attachment delete failed (${response.status}).`);
  }

  return result;
}

export async function deleteJobOrderAttachment(
  submitURL: string,
  payload: {
    jobOrderID: number;
    attachmentID: number;
    securityToken: string;
  }
): Promise<ModernMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('jobOrderID', String(payload.jobOrderID || 0));
  body.set('attachmentID', String(payload.attachmentID || 0));
  body.set('securityToken', payload.securityToken || '');

  const response = await fetch(submitURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: ModernMutationResponse | null = null;
  try {
    result = (await response.json()) as ModernMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Job order attachment delete failed (${response.status}).`);
  }

  return result;
}

export async function updateCandidateTags(
  submitURL: string,
  payload: {
    candidateID: number;
    tagIDs: number[];
    securityToken: string;
  }
): Promise<ModernMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('candidateID', String(payload.candidateID || 0));
  body.set('securityToken', payload.securityToken || '');
  for (const tagID of payload.tagIDs || []) {
    body.append('candidate_tags[]', String(tagID || 0));
  }

  const response = await fetch(submitURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: ModernMutationResponse | null = null;
  try {
    result = (await response.json()) as ModernMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Candidate tag update failed (${response.status}).`);
  }

  return result;
}

export async function setJobOrderAdministrativeVisibility(
  actionBaseURL: string,
  payload: {
    jobOrderID: number;
    state: boolean;
  }
): Promise<ModernMutationResponse> {
  const url = new URL(actionBaseURL, window.location.href);
  url.searchParams.set('jobOrderID', String(payload.jobOrderID || 0));
  url.searchParams.set('state', payload.state ? '1' : '0');
  url.searchParams.set('format', 'modern-json');

  const response = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'same-origin'
  });

  let result: ModernMutationResponse | null = null;
  try {
    result = (await response.json()) as ModernMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Administrative visibility update failed (${response.status}).`);
  }

  return result;
}

export async function setJobOrderMonitored(
  actionBaseURL: string,
  payload: {
    state: boolean;
  }
): Promise<ModernMutationResponse> {
  const url = new URL(actionBaseURL, window.location.href);
  url.searchParams.set('value', payload.state ? '1' : '0');
  url.searchParams.set('format', 'modern-json');

  const response = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'same-origin'
  });

  let result: ModernMutationResponse | null = null;
  try {
    result = (await response.json()) as ModernMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Job order monitor update failed (${response.status}).`);
  }

  return result;
}

export async function uploadCandidateAttachment(
  submitURL: string,
  payload: {
    candidateID: number;
    file: File;
    isResume: boolean;
  }
): Promise<ModernMutationResponse> {
  const form = new FormData();
  form.set('format', 'modern-json');
  form.set('candidateID', String(payload.candidateID || 0));
  form.set('resume', payload.isResume ? '1' : '0');
  form.set('file', payload.file);

  const response = await fetch(submitURL, {
    method: 'POST',
    credentials: 'same-origin',
    body: form
  });

  let result: ModernMutationResponse | null = null;
  try {
    result = (await response.json()) as ModernMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Candidate attachment upload failed (${response.status}).`);
  }

  return result;
}

export async function uploadJobOrderAttachment(
  submitURL: string,
  payload: {
    jobOrderID: number;
    file: File;
  }
): Promise<ModernMutationResponse> {
  const form = new FormData();
  form.set('format', 'modern-json');
  form.set('jobOrderID', String(payload.jobOrderID || 0));
  form.set('file', payload.file);

  const response = await fetch(submitURL, {
    method: 'POST',
    credentials: 'same-origin',
    body: form
  });

  let result: ModernMutationResponse | null = null;
  try {
    result = (await response.json()) as ModernMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Job order attachment upload failed (${response.status}).`);
  }

  return result;
}

export async function uploadCompanyAttachment(
  submitURL: string,
  payload: {
    companyID: number;
    file: File;
  }
): Promise<ModernMutationResponse> {
  const form = new FormData();
  form.set('format', 'modern-json');
  form.set('companyID', String(payload.companyID || 0));
  form.set('file', payload.file);

  const response = await fetch(submitURL, {
    method: 'POST',
    credentials: 'same-origin',
    body: form
  });

  let result: ModernMutationResponse | null = null;
  try {
    result = (await response.json()) as ModernMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Company attachment upload failed (${response.status}).`);
  }

  return result;
}

export async function deleteCompanyAttachment(
  submitURL: string,
  payload: {
    companyID: number;
    attachmentID: number;
    securityToken: string;
  }
): Promise<ModernMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('companyID', String(payload.companyID || 0));
  body.set('attachmentID', String(payload.attachmentID || 0));
  body.set('securityToken', payload.securityToken || '');

  const response = await fetch(submitURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: ModernMutationResponse | null = null;
  try {
    result = (await response.json()) as ModernMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Company attachment delete failed (${response.status}).`);
  }

  return result;
}

export async function fetchCandidatesListModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<CandidatesListModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'candidates',
    action: 'listByView',
    modernPage: MODERN_CANDIDATES_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<CandidatesListModernDataResponse>(url);
  assertModernContract(data.meta, 'candidates.listByView.v1', 'candidates data');

  return data;
}

export async function fetchCandidateResumeModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<CandidateResumeModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'candidates',
    action: 'viewResume',
    modernPage: MODERN_CANDIDATE_RESUME_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<CandidateResumeModernDataResponse>(url);
  assertModernContract(data.meta, 'candidates.viewResume.v1', 'candidate resume preview');

  return data;
}

export async function fetchCompaniesListModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<CompaniesListModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'companies',
    action: 'listByView',
    modernPage: MODERN_COMPANIES_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<CompaniesListModernDataResponse>(url);
  assertModernContract(data.meta, 'companies.listByView.v1', 'companies');

  return data;
}

export async function fetchCompaniesShowModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<CompaniesShowModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'companies',
    action: 'show',
    modernPage: MODERN_COMPANY_SHOW_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<CompaniesShowModernDataResponse>(url);
  assertModernContract(data.meta, 'companies.show.v1', 'company profile');

  return data;
}

export async function fetchCompaniesAddModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<CompaniesAddModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'companies',
    action: 'add',
    modernPage: MODERN_COMPANY_ADD_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<CompaniesAddModernDataResponse>(url);
  assertModernContract(data.meta, 'companies.add.v1', 'company add form');

  return data;
}

export async function fetchCompaniesEditModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<CompaniesEditModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'companies',
    action: 'edit',
    modernPage: MODERN_COMPANY_EDIT_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<CompaniesEditModernDataResponse>(url);
  assertModernContract(data.meta, 'companies.edit.v1', 'company edit form');

  return data;
}

export async function fetchContactsListModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<ContactsListModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'contacts',
    action: 'listByView',
    modernPage: MODERN_CONTACTS_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<ContactsListModernDataResponse>(url);
  assertModernContract(data.meta, 'contacts.listByView.v1', 'contacts');

  return data;
}

export async function fetchContactsShowModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<ContactsShowModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'contacts',
    action: 'show',
    modernPage: MODERN_CONTACT_SHOW_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<ContactsShowModernDataResponse>(url);
  assertModernContract(data.meta, 'contacts.show.v1', 'contact profile');

  return data;
}

export async function fetchContactsAddModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<ContactsAddModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'contacts',
    action: 'add',
    modernPage: MODERN_CONTACT_ADD_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<ContactsAddModernDataResponse>(url);
  assertModernContract(data.meta, 'contacts.add.v1', 'contact add form');

  return data;
}

export async function fetchContactsEditModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<ContactsEditModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'contacts',
    action: 'edit',
    modernPage: MODERN_CONTACT_EDIT_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<ContactsEditModernDataResponse>(url);
  assertModernContract(data.meta, 'contacts.edit.v1', 'contact edit form');

  return data;
}

export async function fetchActivityListModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<ActivityListModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'activity',
    action: 'listByViewDataGrid',
    modernPage: MODERN_ACTIVITY_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<ActivityListModernDataResponse>(url);
  assertModernContract(data.meta, 'activity.listByView.v1', 'activities');

  return data;
}

export async function fetchCalendarModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<CalendarModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'calendar',
    action: 'showCalendar',
    modernPage: MODERN_CALENDAR_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<CalendarModernDataResponse>(url);
  assertModernContract(data.meta, 'calendar.show.v1', 'calendar');

  return data;
}

type CalendarEventMutationPayload = {
  eventID?: number;
  eventTypeID: number;
  title: string;
  description: string;
  allDay: boolean;
  dateISO: string;
  timeHHMM: string;
  duration: number;
  isPublic: boolean;
  dataItemID?: number;
  dataItemType?: number;
  jobOrderID?: number;
};

function buildCalendarEventMutationBody(
  securityToken: string,
  payload: CalendarEventMutationPayload
): URLSearchParams {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('securityToken', securityToken || '');
  body.set('eventTypeID', String(payload.eventTypeID || 0));
  body.set('title', payload.title || '');
  body.set('description', payload.description || '');
  body.set('allDay', payload.allDay ? '1' : '0');
  body.set('dateISO', payload.dateISO || '');
  body.set('timeHHMM', payload.timeHHMM || '');
  body.set('duration', String(payload.duration || 30));
  body.set('isPublic', payload.isPublic ? '1' : '0');

  if (typeof payload.eventID === 'number' && payload.eventID > 0) {
    body.set('eventID', String(payload.eventID));
  }
  if (typeof payload.dataItemID === 'number') {
    body.set('dataItemID', String(payload.dataItemID));
  }
  if (typeof payload.dataItemType === 'number') {
    body.set('dataItemType', String(payload.dataItemType));
  }
  if (typeof payload.jobOrderID === 'number') {
    body.set('jobOrderID', String(payload.jobOrderID));
  }

  return body;
}

export async function createCalendarEvent(
  submitURL: string,
  securityToken: string,
  payload: CalendarEventMutationPayload
): Promise<CalendarEventMutationResponse> {
  const body = buildCalendarEventMutationBody(securityToken, payload);

  const response = await fetch(submitURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: CalendarEventMutationResponse | null = null;
  try {
    result = (await response.json()) as CalendarEventMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Calendar event create failed (${response.status}).`);
  }

  return result;
}

export async function updateCalendarEvent(
  submitURL: string,
  securityToken: string,
  payload: CalendarEventMutationPayload
): Promise<CalendarEventMutationResponse> {
  const body = buildCalendarEventMutationBody(securityToken, payload);

  const response = await fetch(submitURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: CalendarEventMutationResponse | null = null;
  try {
    result = (await response.json()) as CalendarEventMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Calendar event update failed (${response.status}).`);
  }

  return result;
}

export async function deleteCalendarEvent(
  submitURL: string,
  securityToken: string,
  eventID: number
): Promise<CalendarEventMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('securityToken', securityToken || '');
  body.set('eventID', String(eventID || 0));

  const response = await fetch(submitURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: CalendarEventMutationResponse | null = null;
  try {
    result = (await response.json()) as CalendarEventMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Calendar event delete failed (${response.status}).`);
  }

  return result;
}

export async function fetchListsManageModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<ListsManageModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'lists',
    action: 'listByView',
    modernPage: MODERN_LISTS_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<ListsManageModernDataResponse>(url);
  assertModernContract(data.meta, 'lists.listByView.v1', 'lists');

  return data;
}

export async function fetchListsDetailModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<ListsDetailModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'lists',
    action: 'showList',
    modernPage: MODERN_LISTS_DETAIL_PAGE,
    query
  });

  const actionName = String(query.get('a') || '').toLowerCase();
  if (actionName === 'show') {
    apiQuery.set('a', 'show');
  }

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<ListsDetailModernDataResponse>(url);
  assertModernContract(data.meta, 'lists.detail.v1', 'list details');

  return data;
}

export async function fetchReportsLauncherModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<ReportsLauncherModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'reports',
    action: 'reports',
    modernPage: MODERN_REPORTS_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<ReportsLauncherModernDataResponse>(url);
  assertModernContract(data.meta, 'reports.launcher.v1', 'reports');

  return data;
}

export async function fetchReportsCustomerDashboardModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<ReportsCustomerDashboardModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'reports',
    action: 'customerDashboard',
    modernPage: MODERN_REPORTS_CUSTOMER_DASHBOARD_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<ReportsCustomerDashboardModernDataResponse>(url);
  assertModernContract(data.meta, 'reports.customerDashboard.v1', 'reports customer dashboard');

  return data;
}

export async function fetchReportsGraphViewModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<ReportsGraphViewModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'reports',
    action: 'graphView',
    modernPage: MODERN_REPORTS_GRAPH_VIEW_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<ReportsGraphViewModernDataResponse>(url);
  assertModernContract(data.meta, 'reports.graphView.v1', 'reports graph view');

  return data;
}

export async function fetchSourcingListModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<SourcingListModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'sourcing',
    action: '',
    modernPage: MODERN_SOURCING_PAGE,
    query
  });
  apiQuery.delete('a');

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<SourcingListModernDataResponse>(url);
  assertModernContract(data.meta, 'sourcing.list.v1', 'sourcing workspace');

  return data;
}

export async function saveSourcingListModernData(
  saveURL: string,
  rows: Array<{ weekYear: number; weekNumber: number; count: number }>
): Promise<SourcingSaveMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('modernPage', MODERN_SOURCING_PAGE);

  rows.forEach((row) => {
    body.append('weekYear[]', String(row.weekYear));
    body.append('weekNumber[]', String(row.weekNumber));
    body.append('sourcedCount[]', String(Math.max(0, Math.round(Number(row.count) || 0))));
  });

  const response = await fetch(saveURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: SourcingSaveMutationResponse | null = null;
  try {
    result = (await response.json()) as SourcingSaveMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Sourcing save failed (${response.status}).`);
  }

  return result;
}

export async function fetchQueueOverviewModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<QueueOverviewModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'queue',
    action: '',
    modernPage: MODERN_QUEUE_PAGE,
    query
  });
  apiQuery.delete('a');

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<QueueOverviewModernDataResponse>(url);
  assertModernContract(data.meta, 'queue.overview.v1', 'queue workspace');

  return data;
}

export async function fetchGraphsOverviewModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<GraphsOverviewModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'graphs',
    action: '',
    modernPage: MODERN_GRAPHS_PAGE,
    query
  });
  apiQuery.delete('a');

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<GraphsOverviewModernDataResponse>(url);
  assertModernContract(data.meta, 'graphs.overview.v1', 'graphs workspace');

  return data;
}

export async function fetchCandidatesShowModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<CandidatesShowModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'candidates',
    action: 'show',
    modernPage: MODERN_CANDIDATE_SHOW_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<CandidatesShowModernDataResponse>(url);
  assertModernContract(data.meta, 'candidates.show.v1', 'candidate profile');

  return data;
}

export async function fetchCandidatesEditModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<CandidatesEditModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'candidates',
    action: 'edit',
    modernPage: MODERN_CANDIDATE_EDIT_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<CandidatesEditModernDataResponse>(url);
  assertModernContract(data.meta, 'candidates.edit.v1', 'candidate edit form');

  return data;
}

export async function fetchCandidatesAddModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<CandidatesAddModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'candidates',
    action: 'add',
    modernPage: MODERN_CANDIDATE_ADD_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<CandidatesAddModernDataResponse>(url);
  assertModernContract(data.meta, 'candidates.add.v1', 'candidate add form');

  return data;
}

export async function submitCandidatesAddResumeAction(
  bootstrap: UIModeBootstrap,
  formData: FormData
): Promise<CandidatesAddModernDataResponse> {
  const query = new URLSearchParams();
  query.set('m', 'candidates');
  query.set('a', 'add');
  query.set('ui', 'modern');
  query.set('format', 'modern-json');
  query.set('modernPage', MODERN_CANDIDATE_ADD_PAGE);

  const response = await fetch(`${bootstrap.indexName}?${query.toString()}`, {
    method: 'POST',
    credentials: 'same-origin',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Resume import failed (${response.status}).`);
  }

  const data = (await response.json()) as CandidatesAddModernDataResponse;
  assertModernContract(data.meta, 'candidates.add.v1', 'candidate add form');
  return data;
}

type TalentFitFlowCandidateParseAJAXResponse = {
  jobID: string;
  status: string;
  candidate: Record<string, unknown> | null;
  warnings: unknown[];
  errorCode: string;
  errorMessage: string;
};

function getXMLTagValue(doc: Document, tagName: string): string {
  const node = doc.getElementsByTagName(tagName).item(0);
  return node && node.textContent ? String(node.textContent) : '';
}

function parseTalentFitFlowCandidateParseXML(xmlText: string): TalentFitFlowCandidateParseAJAXResponse {
  const xml = new DOMParser().parseFromString(xmlText, 'application/xml');
  if (xml.getElementsByTagName('parsererror').length > 0) {
    throw new Error('Invalid XML response from AI parse endpoint.');
  }

  const errorCode = getXMLTagValue(xml, 'errorcode');
  const errorMessage = getXMLTagValue(xml, 'errormessage');
  const jobID = getXMLTagValue(xml, 'jobid');
  const status = getXMLTagValue(xml, 'status');
  const candidateRaw = getXMLTagValue(xml, 'candidate_json');
  const warningsRaw = getXMLTagValue(xml, 'warnings_json');

  let candidate: Record<string, unknown> | null = null;
  if (candidateRaw.trim() !== '') {
    try {
      candidate = JSON.parse(candidateRaw) as Record<string, unknown>;
    } catch (_error) {
      candidate = null;
    }
  }

  let warnings: unknown[] = [];
  if (warningsRaw.trim() !== '') {
    try {
      const parsed = JSON.parse(warningsRaw) as unknown;
      warnings = Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
      warnings = [];
    }
  }

  return {
    jobID,
    status,
    candidate,
    warnings,
    errorCode,
    errorMessage
  };
}

function buildDefaultTalentFitFlowConsent(actor: string): string {
  return JSON.stringify({
    consent_given: true,
    timestamp: new Date().toISOString(),
    actor
  });
}

export async function createTalentFitFlowCandidateParseJob(payload: {
  documentTempFile?: string;
  attachmentID?: number;
  candidateID?: number;
  requestedFields?: string;
  idempotencyKey?: string;
  actor?: string;
}): Promise<TalentFitFlowCandidateParseAJAXResponse> {
  const body = new URLSearchParams();
  body.set('f', 'talentFitFlowCandidateParse');
  body.set('action', 'create');

  const documentTempFile = String(payload.documentTempFile || '').trim();
  if (documentTempFile !== '') {
    body.set('documentTempFile', documentTempFile);
  }

  const attachmentID = Number(payload.attachmentID || 0);
  if (attachmentID > 0) {
    body.set('attachmentID', String(attachmentID));
  }

  const candidateID = Number(payload.candidateID || 0);
  if (candidateID > 0) {
    body.set('candidateID', String(candidateID));
  }

  const requestedFields =
    String(payload.requestedFields || '').trim() ||
    '["first_name","last_name","email","phone","location","country_name","skills","summary","experience_years","seniority_band","current_employer","employment_recent"]';
  body.set('requested_fields', requestedFields);
  body.set('consent', buildDefaultTalentFitFlowConsent(String(payload.actor || 'modern-ui')));

  const idempotencyKey = String(payload.idempotencyKey || '').trim();
  if (idempotencyKey !== '') {
    body.set('idempotency_key', idempotencyKey);
  }

  const response = await fetch('ajax.php', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  if (!response.ok) {
    throw new Error(`AI parse request failed (${response.status}).`);
  }

  const parsed = parseTalentFitFlowCandidateParseXML(await response.text());
  if (parsed.errorCode !== '0') {
    throw new Error(parsed.errorMessage || 'AI parse request failed.');
  }
  if (parsed.jobID.trim() === '') {
    throw new Error('AI parse request did not return a job ID.');
  }
  return parsed;
}

export async function fetchTalentFitFlowCandidateParseStatus(
  jobID: string
): Promise<TalentFitFlowCandidateParseAJAXResponse> {
  const body = new URLSearchParams();
  body.set('f', 'talentFitFlowCandidateParse');
  body.set('action', 'status');
  body.set('jobId', String(jobID || '').trim());

  const response = await fetch('ajax.php', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  if (!response.ok) {
    throw new Error(`AI parse status check failed (${response.status}).`);
  }

  const parsed = parseTalentFitFlowCandidateParseXML(await response.text());
  if (parsed.errorCode !== '0') {
    throw new Error(parsed.errorMessage || 'AI parse status check failed.');
  }
  return parsed;
}

export async function fetchCandidateDuplicateCheck(
  fields: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    country: string;
  }
): Promise<CandidateDuplicateCheckResponse> {
  const body = new URLSearchParams();
  body.set('f', 'candidates:checkDuplicates');
  body.set('firstName', fields.firstName || '');
  body.set('lastName', fields.lastName || '');
  body.set('email', fields.email || '');
  body.set('phone', fields.phone || '');
  body.set('city', fields.city || '');
  body.set('country', fields.country || '');
  body.set('rhash', String(Math.floor(Math.random() * 100000000)));

  const response = await fetch('ajax.php', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  if (!response.ok) {
    throw new Error(`Duplicate check failed (${response.status}).`);
  }

  const payload = (await response.json()) as CandidateDuplicateCheckResponse;
  if (!payload || Number(payload.success) !== 1) {
    throw new Error(payload?.message || 'Duplicate check failed.');
  }

  return {
    success: 1,
    hardMatches: Array.isArray(payload.hardMatches) ? payload.hardMatches : [],
    softMatches: Array.isArray(payload.softMatches) ? payload.softMatches : []
  };
}

export async function fetchJobOrdersListModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<JobOrdersListModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'joborders',
    action: 'listByView',
    modernPage: MODERN_JOBORDERS_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<JobOrdersListModernDataResponse>(url);
  assertModernContract(data.meta, 'joborders.listByView.v1', 'job orders data');

  return data;
}

export async function fetchJobOrdersShowModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<JobOrdersShowModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'joborders',
    action: 'show',
    modernPage: MODERN_JOBORDER_SHOW_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<JobOrdersShowModernDataResponse>(url);
  assertModernContract(data.meta, 'joborders.show.v1', 'job order profile');

  return data;
}

export async function fetchJobOrdersAddModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<JobOrdersAddModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'joborders',
    action: 'add',
    modernPage: MODERN_JOBORDER_ADD_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<JobOrdersAddModernDataResponse>(url);
  assertModernContract(data.meta, 'joborders.add.v1', 'job order add form');

  return data;
}

export async function fetchJobOrderAddPopupModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<JobOrderAddPopupModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'joborders',
    action: 'addJobOrderPopup',
    modernPage: MODERN_JOBORDER_ADD_POPUP_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<JobOrderAddPopupModernDataResponse>(url);
  assertModernContract(data.meta, 'joborders.addPopup.v1', 'job order add-popup action');

  return data;
}

export async function fetchJobOrdersEditModernData(
  bootstrap: UIModeBootstrap,
  query: URLSearchParams
): Promise<JobOrdersEditModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'joborders',
    action: 'edit',
    modernPage: MODERN_JOBORDER_EDIT_PAGE,
    query
  });

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<JobOrdersEditModernDataResponse>(url);
  assertModernContract(data.meta, 'joborders.edit.v1', 'job order edit form');

  return data;
}

export async function fetchJobOrderCompanyContextModernData(
  bootstrap: UIModeBootstrap,
  companyID: number
): Promise<JobOrderCompanyContextModernDataResponse> {
  const apiQuery = buildModernJSONRequestQuery({
    module: 'joborders',
    action: 'companyContext',
    modernPage: 'joborders-company-context'
  });
  apiQuery.set('companyID', String(companyID || 0));

  const url = `${bootstrap.indexName}?${apiQuery.toString()}`;
  const data = await getJSON<JobOrderCompanyContextModernDataResponse>(url);
  assertModernContract(data.meta, 'joborders.companyContext.v1', 'job order company context');

  return data;
}

export async function fetchQuickActionAddToListData(
  bootstrap: UIModeBootstrap,
  dataItemType: number,
  dataItemID: number
): Promise<QuickActionAddToListModernDataResponse> {
  const query = new URLSearchParams();
  query.set('m', 'lists');
  query.set('a', 'quickActionAddToListModal');
  query.set('format', 'modern-json');
  query.set('modernPage', 'lists-quick-action-add');
  query.set('dataItemType', String(dataItemType));
  query.set('dataItemID', String(dataItemID));
  const url = `${bootstrap.indexName}?${query.toString()}`;

  const data = await getJSON<QuickActionAddToListModernDataResponse>(url);
  assertModernContract(data.meta, 'lists.quickActionAddToList.v1', 'list modal data');

  return data;
}

export async function fetchAddToListDataFromPopupURL(
  bootstrap: UIModeBootstrap,
  popupURL: string
): Promise<QuickActionAddToListModernDataResponse> {
  const url = new URL(String(popupURL || '').replace(/&amp;/g, '&'), window.location.href);
  url.searchParams.set('format', 'modern-json');
  url.searchParams.set('modernPage', 'lists-quick-action-add');
  if (!url.searchParams.get('m')) {
    url.searchParams.set('m', 'lists');
  }
  if (!url.searchParams.get('a')) {
    url.searchParams.set('a', 'quickActionAddToListModal');
  }

  const data = await getJSON<QuickActionAddToListModernDataResponse>(url.toString());
  assertModernContract(data.meta, 'lists.quickActionAddToList.v1', 'list modal data');

  return data;
}

export async function fetchCandidateAssignToJobOrderData(
  bootstrap: UIModeBootstrap,
  popupURL: string
): Promise<CandidateAssignToJobOrderModernDataResponse> {
  const rawURL = String(popupURL || `${bootstrap.indexName}?m=candidates&a=considerForJobSearch`).replace(/&amp;/g, '&');
  const url = new URL(rawURL, window.location.href);
  url.searchParams.set('format', 'modern-json');
  url.searchParams.set('modernPage', 'candidate-assign-joborder');
  if (!url.searchParams.get('m')) {
    url.searchParams.set('m', 'candidates');
  }
  if (!url.searchParams.get('a')) {
    url.searchParams.set('a', 'considerForJobSearch');
  }

  const data = await getJSON<CandidateAssignToJobOrderModernDataResponse>(url.toString());
  assertModernContract(data.meta, 'candidates.considerForJobSearch.v1', 'add-to-job modal data');
  return data;
}

export async function assignCandidateToJobOrder(
  submitURL: string,
  payload: {
    candidateID: number;
    jobOrderID: number;
    securityToken: string;
    confirmReapplyRejected?: boolean;
    assignmentStatusID?: number;
  }
): Promise<CandidateAssignToJobOrderMutationResponse> {
  const body = new URLSearchParams();
  body.set('format', 'modern-json');
  body.set('candidateID', String(payload.candidateID || 0));
  body.set('jobOrderID', String(payload.jobOrderID || 0));
  body.set('securityToken', payload.securityToken || '');
  body.set('confirmReapplyRejected', payload.confirmReapplyRejected ? '1' : '0');
  if (Number(payload.assignmentStatusID || 0) > 0) {
    body.set('assignmentStatusID', String(payload.assignmentStatusID || 0));
  }

  const response = await fetch(submitURL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  let result: CandidateAssignToJobOrderMutationResponse | null = null;
  try {
    result = (await response.json()) as CandidateAssignToJobOrderMutationResponse;
  } catch (_error) {
    result = null;
  }

  if (!result) {
    throw new Error(`Candidate assign failed (${response.status}).`);
  }
  return result;
}

export async function fetchJobOrderAssignCandidateData(
  bootstrap: UIModeBootstrap,
  popupURL: string,
  query = ''
): Promise<JobOrderAssignCandidateModernDataResponse> {
  const rawURL = String(popupURL || `${bootstrap.indexName}?m=joborders&a=considerCandidateSearch`).replace(/&amp;/g, '&');
  const url = new URL(rawURL, window.location.href);
  url.searchParams.set('format', 'modern-json');
  url.searchParams.set('modernPage', 'joborder-consider-candidate');
  if (!url.searchParams.get('m')) {
    url.searchParams.set('m', 'joborders');
  }
  if (!url.searchParams.get('a')) {
    url.searchParams.set('a', 'considerCandidateSearch');
  }

  const normalizedQuery = String(query || '').trim();
  if (normalizedQuery === '') {
    url.searchParams.delete('wildCardString');
  } else {
    url.searchParams.set('wildCardString', normalizedQuery);
  }

  const data = await getJSON<JobOrderAssignCandidateModernDataResponse>(url.toString());
  assertModernContract(data.meta, 'joborders.considerCandidateSearch.v1', 'candidate search data');
  return data;
}

type LegacyAjaxResponse = {
  response: string;
  errorCode: string;
  errorMessage: string;
};

function getTextNodeValue(xml: Document, tagName: string): string {
  const node = xml.getElementsByTagName(tagName).item(0);
  if (!node || !node.textContent) {
    return '';
  }

  return node.textContent.trim();
}

function parseSessionCookie(sessionCookie: string): { key: string; value: string } | null {
  const normalized = String(sessionCookie || '').trim();
  if (normalized === '') {
    return null;
  }

  const separatorIndex = normalized.indexOf('=');
  if (separatorIndex <= 0) {
    return null;
  }

  const key = normalized.substring(0, separatorIndex).trim();
  const value = normalized.substring(separatorIndex + 1).trim();
  if (key === '' || value === '') {
    return null;
  }

  return { key, value };
}

export async function callLegacyAjaxFunction(
  functionName: string,
  fields: Record<string, string>,
  sessionCookie: string
): Promise<LegacyAjaxResponse> {
  const body = new URLSearchParams();
  body.set('f', functionName);
  Object.keys(fields).forEach((key) => {
    body.set(key, fields[key]);
  });
  body.set('rhash', String(Math.floor(Math.random() * 100000000)));

  const cookieKV = parseSessionCookie(sessionCookie);
  if (cookieKV) {
    body.set(cookieKV.key, cookieKV.value);
  }

  const response = await fetch('ajax.php', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  if (!response.ok) {
    throw new Error(`AJAX request failed (${response.status}).`);
  }

  const responseText = await response.text();
  const xml = new DOMParser().parseFromString(responseText, 'application/xml');
  if (xml.getElementsByTagName('parsererror').length > 0) {
    throw new Error('Invalid server response for AJAX request.');
  }

  const errorCode = getTextNodeValue(xml, 'errorcode');
  const errorMessage = getTextNodeValue(xml, 'errormessage');
  if (errorCode !== '' && errorCode !== '0') {
    throw new Error(errorMessage || 'Server returned an error.');
  }

  return {
    response: getTextNodeValue(xml, 'response'),
    errorCode,
    errorMessage
  };
}
