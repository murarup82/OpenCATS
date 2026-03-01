import type {
  CandidateDuplicateCheckResponse,
  CandidatesAddModernDataResponse,
  CandidatesEditModernDataResponse,
  CandidatesListModernDataResponse,
  CandidatesShowModernDataResponse,
  DashboardModernDataResponse,
  DashboardSetPipelineStatusResponse,
  JobOrdersShowModernDataResponse,
  JobOrdersListModernDataResponse,
  ModernMutationResponse,
  PipelineStatusDetailsModernDataResponse,
  PipelineStatusHistoryUpdateResponse,
  PipelineRemoveModernResponse,
  QuickActionAddToListModernDataResponse,
  UIModeBootstrap
} from '../types';
import { getJSON } from './httpClient';
import {
  MODERN_CANDIDATES_PAGE,
  MODERN_CANDIDATE_ADD_PAGE,
  MODERN_CANDIDATE_EDIT_PAGE,
  MODERN_CANDIDATE_SHOW_PAGE,
  MODERN_CONTRACT_VERSION,
  MODERN_DASHBOARD_PAGE,
  MODERN_JOBORDER_SHOW_PAGE,
  MODERN_JOBORDERS_PAGE,
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

  if (
    data.meta.contractKey !== 'dashboard.my.readonly.v1' &&
    data.meta.contractKey !== 'dashboard.my.interactive.v1'
  ) {
    throw new Error('Unexpected dashboard contract key.');
  }

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
  if (!data.meta || data.meta.contractVersion !== MODERN_CONTRACT_VERSION) {
    throw new Error('Contract version mismatch while loading pipeline details.');
  }

  if (data.meta.contractKey !== 'pipeline.statusDetails.v1') {
    throw new Error('Unexpected pipeline details contract key.');
  }

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
  if (!data.meta || data.meta.contractVersion !== MODERN_CONTRACT_VERSION) {
    throw new Error('Contract version mismatch while loading candidates data.');
  }

  if (data.meta.contractKey !== 'candidates.listByView.v1') {
    throw new Error('Unexpected candidates contract key.');
  }

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
  if (!data.meta || data.meta.contractVersion !== MODERN_CONTRACT_VERSION) {
    throw new Error('Contract version mismatch while loading candidate profile.');
  }

  if (data.meta.contractKey !== 'candidates.show.v1') {
    throw new Error('Unexpected candidate profile contract key.');
  }

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
  if (!data.meta || data.meta.contractVersion !== MODERN_CONTRACT_VERSION) {
    throw new Error('Contract version mismatch while loading candidate edit form.');
  }

  if (data.meta.contractKey !== 'candidates.edit.v1') {
    throw new Error('Unexpected candidate edit contract key.');
  }

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
  if (!data.meta || data.meta.contractVersion !== MODERN_CONTRACT_VERSION) {
    throw new Error('Contract version mismatch while loading candidate add form.');
  }

  if (data.meta.contractKey !== 'candidates.add.v1') {
    throw new Error('Unexpected candidate add contract key.');
  }

  return data;
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
  if (!data.meta || data.meta.contractVersion !== MODERN_CONTRACT_VERSION) {
    throw new Error('Contract version mismatch while loading job orders data.');
  }

  if (data.meta.contractKey !== 'joborders.listByView.v1') {
    throw new Error('Unexpected job orders contract key.');
  }

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
  if (!data.meta || data.meta.contractVersion !== MODERN_CONTRACT_VERSION) {
    throw new Error('Contract version mismatch while loading job order profile.');
  }

  if (data.meta.contractKey !== 'joborders.show.v1') {
    throw new Error('Unexpected job order profile contract key.');
  }

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
  if (!data.meta || data.meta.contractVersion !== MODERN_CONTRACT_VERSION) {
    throw new Error('Contract version mismatch while loading list modal data.');
  }

  if (data.meta.contractKey !== 'lists.quickActionAddToList.v1') {
    throw new Error('Unexpected list modal contract key.');
  }

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
  if (!data.meta || data.meta.contractVersion !== MODERN_CONTRACT_VERSION) {
    throw new Error('Contract version mismatch while loading list modal data.');
  }

  if (data.meta.contractKey !== 'lists.quickActionAddToList.v1') {
    throw new Error('Unexpected list modal contract key.');
  }

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
