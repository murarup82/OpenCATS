import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { fetchGdprRequestsModernData } from '../lib/api';
import type { GdprRequestsModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { DataTable } from '../components/primitives/DataTable';
import { SelectMenu } from '../ui-core';
import type { SelectMenuOption } from '../ui-core';
import { ensureModernUIURL, ensureUIURL } from '../lib/navigation';
import { usePageRefreshEvents } from '../lib/usePageRefreshEvents';
import { useServerQueryState } from '../lib/useServerQueryState';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type FilterDraft = {
  status: string;
  expiring: string;
  search: string;
  candidateID: string;
  dateFrom: string;
  dateTo: string;
  needsDeletion: boolean;
  maxResults: number;
};

type NormalizedRow = {
  requestID: number;
  candidateID: number;
  candidateLabel: string;
  candidateEmail: string;
  candidateURL: string;
  status: string;
  statusLabel: string;
  isExpired: boolean;
  createdAt: string;
  expiresAt: string;
  sentAt: string;
  decision: string;
  acceptedAt: string;
  acceptedIP: string;
  acceptedLang: string;
  noticeVersion: string;
  proofLabel: string;
  proofURL: string;
  deletedAt: string;
  isLatest: boolean;
  isLegacy: boolean;
  renewalEligible: boolean;
};

const STATUS_OPTIONS: SelectMenuOption[] = [
  { value: '', label: 'All statuses' },
  { value: 'CREATED', label: 'Created' },
  { value: 'SENT', label: 'Sent' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'DECLINED', label: 'Declined' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'CANCELED', label: 'Canceled' },
  { value: 'LEGACY', label: 'Legacy' }
];

const ROWS_PER_PAGE_OPTIONS_BASE: SelectMenuOption[] = [
  { value: '15', label: '15 rows' },
  { value: '25', label: '25 rows' },
  { value: '50', label: '50 rows' },
  { value: '100', label: '100 rows' }
];

function toDisplayText(value: unknown, fallback = '--'): string {
  if (typeof value === 'string') {
    const normalized = value.trim();
    return normalized !== '' ? normalized : fallback;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return fallback;
}

function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value > 0;
  }

  const normalized = String(value || '').trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
}

function parsePositiveInt(value: string | null): number {
  const parsed = Number(String(value || '').trim());
  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : 0;
}

function normalizeURL(url: string): string {
  return String(url || '').replace(/&amp;/g, '&');
}

function normalizeDateInput(value: string): string {
  const normalized = String(value || '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : '';
}

function buildFilterDraft(query: URLSearchParams, entriesPerPage: number): FilterDraft {
  return {
    status: String(query.get('status') || '').trim(),
    expiring: String(query.get('expiring') || '').trim(),
    search: String(query.get('search') || '').trim(),
    candidateID: String(query.get('candidateID') || '').trim(),
    dateFrom: normalizeDateInput(String(query.get('dateFrom') || '')),
    dateTo: normalizeDateInput(String(query.get('dateTo') || '')),
    needsDeletion: toBoolean(query.get('needsDeletion')),
    maxResults: Math.max(1, parsePositiveInt(query.get('maxResults')) || entriesPerPage || 15)
  };
}

function buildQueryFromFilterDraft(
  baseQueryString: string,
  draft: FilterDraft
): URLSearchParams {
  const nextQuery = new URLSearchParams(baseQueryString);
  nextQuery.set('m', 'gdpr');
  nextQuery.set('a', 'requests');
  nextQuery.set('ui', 'modern');
  nextQuery.delete('format');
  nextQuery.delete('modernPage');
  nextQuery.delete('contractVersion');

  const status = String(draft.status || '').trim();
  if (status !== '') {
    nextQuery.set('status', status);
  } else {
    nextQuery.delete('status');
  }

  const expiring = parsePositiveInt(String(draft.expiring || '').trim() || null);
  if (expiring > 0) {
    nextQuery.set('expiring', String(expiring));
  } else {
    nextQuery.delete('expiring');
  }

  const search = String(draft.search || '').trim();
  if (search !== '') {
    nextQuery.set('search', search);
  } else {
    nextQuery.delete('search');
  }

  const candidateID = parsePositiveInt(String(draft.candidateID || '').trim() || null);
  if (candidateID > 0) {
    nextQuery.set('candidateID', String(candidateID));
  } else {
    nextQuery.delete('candidateID');
  }

  const dateFrom = normalizeDateInput(draft.dateFrom);
  if (dateFrom !== '') {
    nextQuery.set('dateFrom', dateFrom);
  } else {
    nextQuery.delete('dateFrom');
  }

  const dateTo = normalizeDateInput(draft.dateTo);
  if (dateTo !== '') {
    nextQuery.set('dateTo', dateTo);
  } else {
    nextQuery.delete('dateTo');
  }

  if (draft.needsDeletion) {
    nextQuery.set('needsDeletion', '1');
  } else {
    nextQuery.delete('needsDeletion');
  }

  const rowsPerPage = Math.max(1, Math.trunc(Number(draft.maxResults || 15)));
  nextQuery.set('maxResults', String(rowsPerPage));
  nextQuery.set('page', '1');
  nextQuery.delete('rangeStart');

  return nextQuery;
}

function buildLegacyExportURL(
  bootstrap: UIModeBootstrap,
  baseQueryString: string,
  format: 'csv' | 'pdf'
): string {
  const query = new URLSearchParams(baseQueryString);
  query.set('m', 'gdpr');
  query.set('a', 'export');
  query.set('exportFormat', format);
  query.set('ui', 'legacy');
  query.delete('format');
  query.delete('modernPage');
  query.delete('contractVersion');

  return `${bootstrap.indexName}?${query.toString()}`;
}

function getStatusTone(status: string, isExpired: boolean, isLegacy: boolean, renewalEligible: boolean): string {
  const normalized = String(status || '').trim().toUpperCase();
  if (isLegacy) {
    return renewalEligible ? 'warning' : 'info';
  }
  if (isExpired || normalized === 'EXPIRED') {
    return 'warning';
  }
  if (normalized === 'ACCEPTED') {
    return 'success';
  }
  if (normalized === 'DECLINED') {
    return 'critical';
  }
  if (normalized === 'SENT' || normalized === 'CREATED') {
    return 'info';
  }
  return 'info';
}

function normalizeRow(row: GdprRequestsModernDataResponse['rows'][number]): NormalizedRow {
  const candidateFirstName = toDisplayText(row.firstName, '');
  const candidateLastName = toDisplayText(row.lastName, '');
  const candidateName = toDisplayText(row.candidateName || row.fullName, '');
  const fallbackName = [candidateFirstName, candidateLastName].filter((value) => value !== '').join(' ').trim();

  return {
    requestID: Number(row.requestID || 0),
    candidateID: Number(row.candidateID || 0),
    candidateLabel: candidateName !== '' ? candidateName : fallbackName !== '' ? fallbackName : 'Deleted Candidate',
    candidateEmail: toDisplayText(row.candidateEmail || row.email1, ''),
    candidateURL: normalizeURL(String(row.candidateURL || row.showURL || '')),
    status: String(row.status || '').trim(),
    statusLabel: toDisplayText(row.statusLabel || row.displayStatus || row.status, 'Unknown'),
    isExpired: toBoolean(row.isExpired),
    createdAt: toDisplayText(row.createdAt || row.createdAtSort, '--'),
    expiresAt: toDisplayText(row.expiresAt, '--'),
    sentAt: toDisplayText(row.sentAt, '--'),
    decision: toDisplayText(row.decision || row.decisionLabel || row.statusLabel || row.displayStatus || row.status, '--'),
    acceptedAt: toDisplayText(row.acceptedAt, '--'),
    acceptedIP: toDisplayText(row.acceptedIP, '--'),
    acceptedLang: toDisplayText(row.acceptedLang, '--'),
    noticeVersion: toDisplayText(row.noticeVersion, '--'),
    proofLabel: toDisplayText(row.proofLabel || row.proofFilename, ''),
    proofURL: normalizeURL(String(row.proofURL || '')),
    deletedAt: toDisplayText(row.deletedAt || row.deletedAtFormatted, '--'),
    isLatest: toBoolean(row.isLatest),
    isLegacy: toBoolean(row.isLegacy),
    renewalEligible: toBoolean(row.renewalEligible)
  };
}

function buildActiveFilterLabels(draft: FilterDraft): string[] {
  const labels: string[] = [];
  const status = String(draft.status || '').trim();
  if (status !== '') {
    labels.push(`Status: ${status}`);
  }
  const expiring = parsePositiveInt(String(draft.expiring || '').trim() || null);
  if (expiring > 0) {
    labels.push(`Expiring in ${expiring} day${expiring === 1 ? '' : 's'}`);
  }
  const search = String(draft.search || '').trim();
  if (search !== '') {
    labels.push(`Search: "${search}"`);
  }
  const candidateID = parsePositiveInt(String(draft.candidateID || '').trim() || null);
  if (candidateID > 0) {
    labels.push(`Candidate ID: ${candidateID}`);
  }
  if (normalizeDateInput(draft.dateFrom) !== '') {
    labels.push(`Created from: ${draft.dateFrom}`);
  }
  if (normalizeDateInput(draft.dateTo) !== '') {
    labels.push(`Created to: ${draft.dateTo}`);
  }
  if (draft.needsDeletion) {
    labels.push('Needs deletion');
  }
  if (draft.maxResults > 0) {
    labels.push(`Rows per page: ${draft.maxResults}`);
  }
  return labels;
}

export function GdprRequestsPage({ bootstrap }: Props) {
  const [data, setData] = useState<GdprRequestsModernDataResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);
  const { serverQueryString, applyServerQuery } = useServerQueryState(bootstrap.indexName);
  const [filterDraft, setFilterDraft] = useState<FilterDraft>(() =>
    buildFilterDraft(new URLSearchParams(window.location.search), 15)
  );

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchGdprRequestsModernData(bootstrap, query)
      .then((result) => {
        if (!isMounted) {
          return;
        }
        setData(result);
      })
      .catch((err: Error) => {
        if (!isMounted) {
          return;
        }
        setError(err.message || 'Unable to load GDPR requests.');
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [bootstrap, serverQueryString, reloadToken]);

  useEffect(() => {
    if (!data) {
      return;
    }

    setFilterDraft(buildFilterDraft(new URLSearchParams(serverQueryString), data.meta.entriesPerPage || 15));
  }, [data, serverQueryString]);

  const refreshPageData = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);
  usePageRefreshEvents(refreshPageData);

  const normalizedRows = useMemo(() => (data ? data.rows.map((row) => normalizeRow(row)) : []), [data]);
  const activeFilterLabels = useMemo(() => buildActiveFilterLabels(filterDraft), [filterDraft]);
  const statusOptions = useMemo(() => {
    if (!data?.options?.statuses || data.options.statuses.length === 0) {
      return STATUS_OPTIONS;
    }

    const options = data.options.statuses.map((option) => ({
      value: String(option.value || ''),
      label: toDisplayText(option.label, 'Status')
    }));
    if (!options.some((option) => option.value === '')) {
      options.unshift({ value: '', label: 'All statuses' });
    }
    return options;
  }, [data]);
  const rowsPerPageOptions = useMemo<SelectMenuOption[]>(() => {
    const options = [...ROWS_PER_PAGE_OPTIONS_BASE];
    if (filterDraft.maxResults > 0 && !options.some((option) => Number(option.value) === filterDraft.maxResults)) {
      options.unshift({ value: String(filterDraft.maxResults), label: `${filterDraft.maxResults} rows` });
    }
    return options;
  }, [filterDraft.maxResults]);

  const legacyURL = useMemo(() => ensureUIURL(data?.actions.legacyURL || bootstrap.legacyURL, 'legacy'), [bootstrap.legacyURL, data?.actions.legacyURL]);
  const exportCSVURL = useMemo(
    () => ensureUIURL(data?.actions.exportCSVURL || buildLegacyExportURL(bootstrap, serverQueryString, 'csv'), 'legacy'),
    [bootstrap, data?.actions.exportCSVURL, serverQueryString]
  );
  const exportPDFURL = useMemo(
    () => ensureUIURL(data?.actions.exportPDFURL || buildLegacyExportURL(bootstrap, serverQueryString, 'pdf'), 'legacy'),
    [bootstrap, data?.actions.exportPDFURL, serverQueryString]
  );

  const totalLegacyRows = normalizedRows.filter((row) => row.isLegacy).length;
  const needsDeletionRows = normalizedRows.filter((row) => row.status === 'DECLINED' && row.deletedAt === '--').length;
  const expiringRows = normalizedRows.filter((row) => row.isExpired || row.status === 'EXPIRED').length;
  const currentPage = data?.meta.page || 1;
  const totalPages = data?.meta.totalPages || 1;
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const submitFilters = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const nextQuery = buildQueryFromFilterDraft(serverQueryString, filterDraft);
      applyServerQuery(nextQuery);
    },
    [applyServerQuery, filterDraft, serverQueryString]
  );

  const resetFilters = useCallback(() => {
    const nextDraft: FilterDraft = {
      status: '',
      expiring: '',
      search: '',
      candidateID: '',
      dateFrom: '',
      dateTo: '',
      needsDeletion: false,
      maxResults: data?.meta.entriesPerPage || filterDraft.maxResults || 15
    };
    setFilterDraft(nextDraft);
    applyServerQuery(buildQueryFromFilterDraft(serverQueryString, nextDraft));
  }, [applyServerQuery, data?.meta.entriesPerPage, filterDraft.maxResults, serverQueryString]);

  const applyPage = useCallback(
    (nextPage: number) => {
      if (!data || nextPage < 1 || nextPage > data.meta.totalPages) {
        return;
      }

      const nextQuery = new URLSearchParams(serverQueryString);
      nextQuery.set('m', 'gdpr');
      nextQuery.set('a', 'requests');
      nextQuery.set('ui', 'modern');
      nextQuery.set('page', String(nextPage));
      nextQuery.delete('rangeStart');
      if (!nextQuery.get('maxResults')) {
        nextQuery.set('maxResults', String(data.meta.entriesPerPage || filterDraft.maxResults || 15));
      }
      applyServerQuery(nextQuery);
    },
    [applyServerQuery, data, filterDraft.maxResults, serverQueryString]
  );

  const summaryChips = useMemo(() => {
    const totalRows = data?.meta.totalRows || 0;
    const rowsOnPage = normalizedRows.length;
    return [
      `Total requests: ${totalRows}`,
      `Page rows: ${rowsOnPage}`,
      `Page legacy rows: ${totalLegacyRows}`,
      `Page needs deletion: ${needsDeletionRows}`
    ];
  }, [data?.meta.totalRows, normalizedRows.length, needsDeletionRows, totalLegacyRows]);

  const tableColumns = [
    { key: 'candidate', title: 'Candidate' },
    { key: 'email', title: 'Email' },
    { key: 'status', title: 'Status' },
    { key: 'created', title: 'Created' },
    { key: 'expires', title: 'Expires' },
    { key: 'sent', title: 'Sent' },
    { key: 'decision', title: 'Decision' },
    { key: 'accepted', title: 'Accepted' },
    { key: 'deleted', title: 'Deleted' },
    { key: 'latest', title: 'Latest' },
    { key: 'proof', title: 'Proof' }
  ];

  if (loading && !data) {
    return <div className="modern-state">Loading GDPR requests...</div>;
  }

  if (error) {
    return <ErrorState message={error} actionLabel="Open Legacy UI" actionURL={legacyURL} />;
  }

  if (!data) {
    return <EmptyState message="GDPR requests are unavailable." />;
  }

  return (
    <div className="avel-dashboard-page avel-gdpr-requests-page">
      <PageContainer
        title="GDPR Requests"
        subtitle="Track request status, review expiry windows, and export compliance slices from the native shell."
        actions={
          <>
            <a className="modern-btn modern-btn--secondary" href={exportCSVURL} target="_blank" rel="noreferrer">
              Export CSV
            </a>
            <a className="modern-btn modern-btn--secondary" href={exportPDFURL} target="_blank" rel="noreferrer">
              Export PDF
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-kpi-grid">
            <div className="avel-kpi">
              <span className="avel-kpi__label">Total Requests</span>
              <span className="avel-kpi__value">{data.meta.totalRows}</span>
              <span className="avel-kpi__hint">Matching the current server filters</span>
            </div>
            <div className="avel-kpi">
              <span className="avel-kpi__label">Current Page</span>
              <span className="avel-kpi__value">{currentPage}</span>
              <span className="avel-kpi__hint">Of {totalPages}</span>
            </div>
            <div className="avel-kpi">
              <span className="avel-kpi__label">Rows Per Page</span>
              <span className="avel-kpi__value">{data.meta.entriesPerPage}</span>
              <span className="avel-kpi__hint">Server page size</span>
            </div>
            <div className="avel-kpi">
              <span className="avel-kpi__label">Expiring On Page</span>
              <span className="avel-kpi__value">{expiringRows}</span>
              <span className="avel-kpi__hint">{needsDeletionRows} need deletion on page</span>
            </div>
          </section>

          <section className="modern-command-bar modern-command-bar--sticky" aria-label="GDPR request filters">
            <form onSubmit={submitFilters} className="modern-command-bar__row modern-command-bar__row--filters" style={{ gridTemplateColumns: 'minmax(260px, 2fr) repeat(4, minmax(150px, 1fr)) auto' }}>
              <label className="modern-command-search">
                <span className="modern-command-label">Search</span>
                <input
                  type="search"
                  value={filterDraft.search}
                  onChange={(event) => setFilterDraft((current) => ({ ...current, search: event.target.value }))}
                  placeholder="Candidate name or email"
                />
              </label>

              <SelectMenu
                label="Status"
                value={filterDraft.status}
                options={statusOptions}
                onChange={(value) => setFilterDraft((current) => ({ ...current, status: value }))}
                className="modern-command-field"
              />

              <label className="modern-command-search">
                <span className="modern-command-label">Expiring In</span>
                <input
                  type="number"
                  min={1}
                  max={3650}
                  value={filterDraft.expiring}
                  onChange={(event) => setFilterDraft((current) => ({ ...current, expiring: event.target.value }))}
                  placeholder="Days"
                />
              </label>

              <label className="modern-command-search">
                <span className="modern-command-label">Candidate ID</span>
                <input
                  type="number"
                  min={1}
                  value={filterDraft.candidateID}
                  onChange={(event) => setFilterDraft((current) => ({ ...current, candidateID: event.target.value }))}
                  placeholder="ID"
                />
              </label>

              <SelectMenu
                label="Rows"
                value={String(filterDraft.maxResults)}
                options={rowsPerPageOptions}
                onChange={(value) =>
                  setFilterDraft((current) => ({
                    ...current,
                    maxResults: Math.max(1, parsePositiveInt(value) || 15)
                  }))
                }
                className="modern-command-field modern-command-field--compact"
              />

              <div className="modern-command-actions modern-command-actions--primary">
                <button type="submit" className="modern-btn modern-btn--emphasis">
                  Apply
                </button>
              </div>
            </form>

            <form
              onSubmit={submitFilters}
              className="modern-command-bar__row modern-command-bar__row--filters"
              style={{ gridTemplateColumns: 'repeat(2, minmax(180px, 1fr)) auto auto auto' }}
            >
              <label className="modern-command-search">
                <span className="modern-command-label">Created From</span>
                <input
                  type="date"
                  value={filterDraft.dateFrom}
                  onChange={(event) => setFilterDraft((current) => ({ ...current, dateFrom: event.target.value }))}
                />
              </label>

              <label className="modern-command-search">
                <span className="modern-command-label">Created To</span>
                <input
                  type="date"
                  value={filterDraft.dateTo}
                  onChange={(event) => setFilterDraft((current) => ({ ...current, dateTo: event.target.value }))}
                />
              </label>

              <label className="modern-command-toggle">
                <input
                  type="checkbox"
                  checked={filterDraft.needsDeletion}
                  onChange={(event) => setFilterDraft((current) => ({ ...current, needsDeletion: event.target.checked }))}
                />
                <span className="modern-command-toggle__switch" aria-hidden="true" />
                <span>Needs Deletion</span>
              </label>

              <div className="modern-command-actions">
                <button type="button" className="modern-btn modern-btn--secondary" onClick={resetFilters}>
                  Reset
                </button>
                <button type="submit" className="modern-btn modern-btn--secondary">
                  Apply
                </button>
              </div>
            </form>

            <div className="modern-command-bar__row modern-command-bar__row--meta">
              <div className="modern-command-active">
                <div className={`modern-command-active__count${activeFilterLabels.length > 0 ? ' is-active' : ''}`} aria-live="polite" aria-atomic="true">
                  {activeFilterLabels.length > 0
                    ? `${activeFilterLabels.length} active filter${activeFilterLabels.length === 1 ? '' : 's'}`
                    : 'No active filters'}
                </div>
                <div className="modern-command-active__list">
                  {activeFilterLabels.length > 0 ? (
                    activeFilterLabels.map((label) => (
                      <span className="modern-active-filter modern-active-filter--server" key={label}>
                        {label}
                      </span>
                    ))
                  ) : (
                    <span className="modern-command-active__empty">Use the controls above to narrow the queue.</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Request Queue</h2>
              <p className="avel-list-panel__hint">
                Showing page {currentPage} of {totalPages}. Use export actions for CSV or PDF slices that match the applied filters.
              </p>
            </div>

            <DataTable
              columns={tableColumns}
              hasRows={normalizedRows.length > 0}
              emptyMessage="No GDPR requests match the current filters."
            >
              {normalizedRows.map((row) => {
                const candidateLabel = row.candidateURL !== ''
                  ? (
                    <a className="modern-link" href={ensureModernUIURL(row.candidateURL)}>
                      {toDisplayText(row.candidateLabel, `Candidate #${row.candidateID}`)}
                    </a>
                  )
                  : (
                    <span>{toDisplayText(row.candidateLabel, `Candidate #${row.candidateID}`)}</span>
                  );

                const statusTone = getStatusTone(row.status, row.isExpired, row.isLegacy, row.renewalEligible);
                const statusClass = `modern-chip modern-chip--${statusTone}`;
                const proofAvailable = row.proofURL !== '';

                return (
                  <tr key={row.requestID || `${row.candidateID}-${row.createdAt}`}>
                    <td>
                      <div style={{ display: 'grid', gap: '5px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          {candidateLabel}
                          <span className="modern-chip modern-chip--info">#{row.candidateID}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--modern-muted)' }}>
                          {toDisplayText(row.candidateEmail, 'No email on file')}
                        </div>
                        <div className="modern-chip-strip">
                          {row.isLegacy ? <span className="modern-chip modern-chip--info">Legacy</span> : null}
                          {row.renewalEligible ? <span className="modern-chip modern-chip--warning">Renewal Eligible</span> : null}
                          {row.isExpired ? <span className="modern-chip modern-chip--warning">Expired</span> : null}
                          {row.isLatest ? <span className="modern-chip modern-chip--success">Latest</span> : null}
                        </div>
                      </div>
                    </td>
                    <td>{toDisplayText(row.candidateEmail, '--')}</td>
                    <td>
                      <span className={statusClass}>{toDisplayText(row.statusLabel, row.status || 'Unknown')}</span>
                    </td>
                    <td>{toDisplayText(row.createdAt)}</td>
                    <td>{toDisplayText(row.expiresAt)}</td>
                    <td>{toDisplayText(row.sentAt)}</td>
                    <td>{toDisplayText(row.decision, '--')}</td>
                    <td>{toDisplayText(row.acceptedAt)}</td>
                    <td>{toDisplayText(row.deletedAt)}</td>
                    <td>{row.isLatest ? <span className="modern-chip modern-chip--success">Yes</span> : <span className="modern-chip modern-chip--info">No</span>}</td>
                    <td>
                      {proofAvailable ? (
                        <a className="modern-link" href={ensureModernUIURL(row.proofURL)} target="_blank" rel="noreferrer">
                          {toDisplayText(row.proofLabel, 'View proof')}
                        </a>
                      ) : (
                        <span className="modern-chip modern-chip--info">--</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </DataTable>

            <div className="modern-table-actions" style={{ justifyContent: 'space-between', marginTop: '12px' }}>
              <span className="modern-state">Page {currentPage} of {totalPages}</span>
              <div className="modern-table-actions">
                <button type="button" className="modern-btn modern-btn--secondary" disabled={!canGoPrev} onClick={() => applyPage(currentPage - 1)}>
                  Prev
                </button>
                <button type="button" className="modern-btn modern-btn--secondary" disabled={!canGoNext} onClick={() => applyPage(currentPage + 1)}>
                  Next
                </button>
              </div>
            </div>
          </section>

          <div className="modern-command-active__list" aria-label="GDPR summary">
            {summaryChips.map((chip) => (
              <span key={chip} className="modern-active-filter modern-active-filter--server">
                {chip}
              </span>
            ))}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
