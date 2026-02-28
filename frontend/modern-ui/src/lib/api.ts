import type {
  DashboardModernDataResponse,
  QuickActionAddToListModernDataResponse,
  UIModeBootstrap
} from '../types';
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
