import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchJobOrdersPipelineMatrixModernData } from '../lib/api';
import type { JobOrdersPipelineMatrixModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { ensureModernUIURL } from '../lib/navigation';
import { useServerQueryState } from '../lib/useServerQueryState';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type ColumnKey =
  | 'candidate'
  | 'jobOrder'
  | 'company'
  | 'source'
  | 'keySkills'
  | 'pipeline'
  | 'owner'
  | 'recruiter'
  | 'location'
  | 'gdpr'
  | 'dateAdded'
  | 'lastActivity';

type SortDirection = 'asc' | 'desc';

type MatrixView = {
  id: string;
  name: string;
  columnOrder: ColumnKey[];
  visibleColumns: Record<ColumnKey, boolean>;
  columnFilters: Record<ColumnKey, string>;
  sortBy: ColumnKey;
  sortDirection: SortDirection;
};

const DEFAULT_ORDER: ColumnKey[] = [
  'candidate',
  'jobOrder',
  'source',
  'keySkills',
  'pipeline',
  'company',
  'owner',
  'recruiter',
  'location',
  'gdpr',
  'dateAdded',
  'lastActivity'
];

const DEFAULT_VISIBLE: Record<ColumnKey, boolean> = {
  candidate: true,
  jobOrder: true,
  company: false,
  source: true,
  keySkills: true,
  pipeline: true,
  owner: true,
  recruiter: false,
  location: false,
  gdpr: true,
  dateAdded: false,
  lastActivity: true
};

function toInteger(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
}

function toDisplayText(value: unknown, fallback = '--'): string {
  const normalized = String(value || '').trim();
  return normalized === '' ? fallback : normalized;
}

function emptyFilters(): Record<ColumnKey, string> {
  return {
    candidate: '',
    jobOrder: '',
    company: '',
    source: '',
    keySkills: '',
    pipeline: '',
    owner: '',
    recruiter: '',
    location: '',
    gdpr: '',
    dateAdded: '',
    lastActivity: ''
  };
}

function columnLabel(columnKey: ColumnKey): string {
  switch (columnKey) {
    case 'candidate':
      return 'Candidate';
    case 'jobOrder':
      return 'Job Order';
    case 'company':
      return 'Company';
    case 'source':
      return 'Source';
    case 'keySkills':
      return 'Key Skills';
    case 'pipeline':
      return 'Pipeline';
    case 'owner':
      return 'Owner';
    case 'recruiter':
      return 'Recruiter';
    case 'location':
      return 'Location';
    case 'gdpr':
      return 'GDPR';
    case 'dateAdded':
      return 'Added';
    case 'lastActivity':
    default:
      return 'Last Activity';
  }
}

export function JobOrdersPipelineMatrixPage({ bootstrap }: Props) {
  const [data, setData] = useState<JobOrdersPipelineMatrixModernDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [searchDraft, setSearchDraft] = useState('');

  const [columnOrder, setColumnOrder] = useState<ColumnKey[]>(DEFAULT_ORDER);
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>(DEFAULT_VISIBLE);
  const [columnFilters, setColumnFilters] = useState<Record<ColumnKey, string>>(emptyFilters());
  const [sortBy, setSortBy] = useState<ColumnKey>('lastActivity');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [activeHeaderMenuColumn, setActiveHeaderMenuColumn] = useState<ColumnKey | null>(null);
  const [savedViews, setSavedViews] = useState<MatrixView[]>([]);
  const [activeViewID, setActiveViewID] = useState('default');
  const [viewNameDraft, setViewNameDraft] = useState('');

  const { serverQueryString, applyServerQuery } = useServerQueryState(bootstrap.indexName);
  const storageKey = useMemo(
    () => `opencats:modern:${bootstrap.siteID}:${bootstrap.userID}:joborders:pipeline-matrix:v1`,
    [bootstrap.siteID, bootstrap.userID]
  );

  const applyDefaultLayout = useCallback(() => {
    setColumnOrder(DEFAULT_ORDER);
    setVisibleColumns(DEFAULT_VISIBLE);
    setColumnFilters(emptyFilters());
    setSortBy('lastActivity');
    setSortDirection('desc');
    setActiveHeaderMenuColumn(null);
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');
    fetchJobOrdersPipelineMatrixModernData(bootstrap, new URLSearchParams(serverQueryString))
      .then((result) => {
        if (!isMounted) {
          return;
        }
        setData(result);
        setSearchDraft(result.filters.search || '');
      })
      .catch((err: unknown) => {
        if (!isMounted) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Unable to load pipeline matrix.');
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [bootstrap, reloadToken, serverQueryString]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        return;
      }
      const payload = JSON.parse(raw) as {
        savedViews?: MatrixView[];
        activeViewID?: string;
        working?: {
          columnOrder?: ColumnKey[];
          visibleColumns?: Record<ColumnKey, boolean>;
          columnFilters?: Record<ColumnKey, string>;
          sortBy?: ColumnKey;
          sortDirection?: SortDirection;
        };
      };
      if (Array.isArray(payload.savedViews)) {
        setSavedViews(payload.savedViews);
      }
      if (payload.activeViewID) {
        setActiveViewID(payload.activeViewID);
      }
      if (payload.working) {
        if (Array.isArray(payload.working.columnOrder)) {
          setColumnOrder(payload.working.columnOrder);
        }
        if (payload.working.visibleColumns) {
          setVisibleColumns(payload.working.visibleColumns);
        }
        if (payload.working.columnFilters) {
          setColumnFilters(payload.working.columnFilters);
        }
        if (payload.working.sortBy) {
          setSortBy(payload.working.sortBy);
        }
        if (payload.working.sortDirection) {
          setSortDirection(payload.working.sortDirection);
        }
      }
    } catch (_error) {
      // Ignore broken local storage payloads.
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          savedViews,
          activeViewID,
          working: {
            columnOrder,
            visibleColumns,
            columnFilters,
            sortBy,
            sortDirection
          }
        })
      );
    } catch (_error) {
      // Ignore local storage errors.
    }
  }, [activeViewID, columnFilters, columnOrder, savedViews, sortBy, sortDirection, storageKey, visibleColumns]);

  const applyServerFilters = useCallback(
    (next: {
      search?: string;
      ownerUserID?: number;
      recruiterUserID?: number;
      pipelineStatusID?: number;
      includeClosed?: boolean;
      page?: number;
      maxResults?: number;
    }) => {
      const query = new URLSearchParams(serverQueryString);
      query.set('m', 'joborders');
      query.set('a', 'pipelineMatrix');
      query.set('ui', 'modern');
      query.set('search', String(next.search ?? data?.filters.search ?? '').trim());
      query.set('ownerUserID', String(next.ownerUserID ?? data?.filters.ownerUserID ?? 0));
      query.set('recruiterUserID', String(next.recruiterUserID ?? data?.filters.recruiterUserID ?? -2));
      query.set('pipelineStatusID', String(next.pipelineStatusID ?? data?.filters.pipelineStatusID ?? -2));
      const includeClosed = (next.includeClosed ?? data?.filters.includeClosed) ? true : false;
      query.set('includeClosed', includeClosed ? '1' : '0');
      query.set('sortBy', sortBy);
      query.set('sortDirection', sortDirection === 'asc' ? 'ASC' : 'DESC');
      query.set('maxResults', String(next.maxResults ?? data?.meta.entriesPerPage ?? 100));
      query.set('page', String(Math.max(1, toInteger(next.page ?? data?.meta.page ?? 1, 1))));
      applyServerQuery(query);
    },
    [applyServerQuery, data?.filters, data?.meta.entriesPerPage, data?.meta.page, serverQueryString, sortBy, sortDirection]
  );

  const getColumnValue = useCallback((row: JobOrdersPipelineMatrixModernDataResponse['rows'][number], columnKey: ColumnKey): string => {
    switch (columnKey) {
      case 'candidate':
        return row.candidateName || '';
      case 'jobOrder':
        return row.jobOrderTitle || '';
      case 'company':
        return row.companyName || '';
      case 'source':
        return row.source || '';
      case 'keySkills':
        return row.keySkills || '';
      case 'pipeline':
        return row.pipelineStatus || '';
      case 'owner':
        return row.ownerName || '';
      case 'recruiter':
        return row.recruiterName || '';
      case 'location':
        return row.location || '';
      case 'gdpr':
        return row.gdprSigned ? 'Signed' : 'Not Signed';
      case 'dateAdded':
        return row.dateAdded || '';
      case 'lastActivity':
      default:
        return row.lastActivity || '';
    }
  }, []);

  const visibleColumnOrder = useMemo(() => {
    const columns = columnOrder.filter((columnKey) => visibleColumns[columnKey]);
    return columns.length > 0 ? columns : ['jobOrder'];
  }, [columnOrder, visibleColumns]);

  const filteredRows = useMemo(() => {
    if (!data) {
      return [];
    }
    const rows = data.rows.filter((row) =>
      (Object.keys(columnFilters) as ColumnKey[]).every((columnKey) => {
        const filterText = (columnFilters[columnKey] || '').trim().toLowerCase();
        if (filterText === '') {
          return true;
        }
        return getColumnValue(row, columnKey).toLowerCase().includes(filterText);
      })
    );

    const sign = sortDirection === 'asc' ? 1 : -1;
    rows.sort((left, right) => {
      const leftValue = getColumnValue(left, sortBy).toLowerCase();
      const rightValue = getColumnValue(right, sortBy).toLowerCase();
      if (leftValue === rightValue) {
        return 0;
      }
      return leftValue > rightValue ? sign : -sign;
    });
    return rows;
  }, [columnFilters, data, getColumnValue, sortBy, sortDirection]);

  if (loading && !data) {
    return <div className="modern-state">Loading pipeline matrix...</div>;
  }

  if (error !== '') {
    return <ErrorState message={error} actionLabel="Open Legacy UI" actionURL={bootstrap.legacyURL} />;
  }

  if (!data) {
    return <EmptyState message="Pipeline matrix data is unavailable." />;
  }

  const canGoPrev = data.meta.page > 1;
  const canGoNext = data.meta.page < data.meta.totalPages;
  const activeColumnFilterCount = (Object.keys(columnFilters) as ColumnKey[]).filter(
    (columnKey) => (columnFilters[columnKey] || '').trim() !== ''
  ).length;

  const saveCurrentView = () => {
    const name = viewNameDraft.trim() === '' ? `View ${savedViews.length + 1}` : viewNameDraft.trim();
    const nextID = activeViewID === 'default' ? `view-${Date.now()}` : activeViewID;
    const nextView: MatrixView = { id: nextID, name, columnOrder, visibleColumns, columnFilters, sortBy, sortDirection };
    setSavedViews((current) => {
      const index = current.findIndex((entry) => entry.id === nextID);
      if (index === -1) {
        return [...current, nextView];
      }
      const next = current.slice();
      next[index] = nextView;
      return next;
    });
    setActiveViewID(nextID);
    setViewNameDraft(name);
  };

  const deleteCurrentView = () => {
    if (activeViewID === 'default') {
      return;
    }
    setSavedViews((current) => current.filter((entry) => entry.id !== activeViewID));
    setActiveViewID('default');
    setViewNameDraft('');
    applyDefaultLayout();
  };

  const moveColumn = (columnKey: ColumnKey, direction: -1 | 1) => {
    setColumnOrder((current) => {
      const currentIndex = current.indexOf(columnKey);
      if (currentIndex === -1) {
        return current;
      }
      const targetIndex = currentIndex + direction;
      if (targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }
      const next = current.slice();
      const [moved] = next.splice(currentIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  return (
    <div className="avel-dashboard-page avel-pipeline-matrix-page">
      <PageContainer title="Pipeline Matrix" subtitle="Excel-style candidate-job-order matrix with saved views and per-column filters." actions={<><a className="modern-btn modern-btn--secondary" href={ensureModernUIURL(data.actions.listURL)}>Back To Job Orders</a><a className="modern-btn modern-btn--secondary" href={ensureModernUIURL(data.actions.recruiterAllocationURL)}>Recruiter Allocation</a><a className="modern-btn modern-btn--secondary" href={data.actions.legacyURL}>Open Legacy UI</a></>}>
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="modern-command-bar modern-command-bar--sticky">
            <div className="modern-command-bar__row modern-command-bar__row--filters">
              <label className="modern-command-field"><span className="modern-command-label">Search</span><input type="text" value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Candidate, job order, company" /></label>
              <label className="modern-command-field"><span className="modern-command-label">Owner</span><select value={String(data.filters.ownerUserID)} onChange={(event) => applyServerFilters({ ownerUserID: toInteger(event.target.value, 0), page: 1 })}>{data.options.owners.map((option) => <option key={`owner-${option.value}`} value={option.value}>{option.label}</option>)}</select></label>
              <label className="modern-command-field"><span className="modern-command-label">Recruiter</span><select value={String(data.filters.recruiterUserID)} onChange={(event) => applyServerFilters({ recruiterUserID: toInteger(event.target.value, -2), page: 1 })}>{data.options.recruiters.map((option) => <option key={`recruiter-${option.value}`} value={option.value}>{option.label}</option>)}</select></label>
              <label className="modern-command-field"><span className="modern-command-label">Pipeline</span><select value={String(data.filters.pipelineStatusID)} onChange={(event) => applyServerFilters({ pipelineStatusID: toInteger(event.target.value, -2), page: 1 })}>{data.options.pipelineStatuses.map((option) => <option key={`status-${option.value}`} value={option.value}>{option.label}</option>)}</select></label>
              <label className="modern-command-field modern-command-field--compact"><span className="modern-command-label">Rows</span><select value={String(data.meta.entriesPerPage)} onChange={(event) => applyServerFilters({ maxResults: toInteger(event.target.value, 100), page: 1 })}>{data.options.rowsPerPage.map((value) => <option key={`rows-${value}`} value={value}>{value} rows</option>)}</select></label>
              <label className="modern-command-toggle"><input type="checkbox" checked={data.filters.includeClosed} onChange={(event) => applyServerFilters({ includeClosed: event.target.checked, page: 1 })} /><span className="modern-command-toggle__switch" aria-hidden="true" /><span>Include Closed</span></label>
              <div className="modern-table-actions"><button type="button" className="modern-btn modern-btn--secondary" onClick={() => applyServerFilters({ search: searchDraft, page: 1 })}>Apply</button><button type="button" className="modern-btn modern-btn--secondary" onClick={() => { setSearchDraft(''); setColumnFilters(emptyFilters()); applyServerFilters({ search: '', ownerUserID: 0, recruiterUserID: -2, pipelineStatusID: -2, includeClosed: false, page: 1 }); }}>Reset Filters</button></div>
            </div>

            <div className="modern-command-bar__row modern-command-bar__row--meta">
              <div className="modern-chip-strip"><span className="modern-chip modern-chip--info">Column filters: {activeColumnFilterCount}</span><span className="modern-chip modern-chip--info">Rows on page: {filteredRows.length}/{data.rows.length}</span></div>
              <div className="avel-pipeline-matrix__views">
                <select className="avel-pipeline-matrix__view-select" value={activeViewID} onChange={(event) => { const nextID = event.target.value; setActiveViewID(nextID); if (nextID === 'default') { applyDefaultLayout(); setViewNameDraft(''); return; } const nextView = savedViews.find((entry) => entry.id === nextID); if (!nextView) { return; } setViewNameDraft(nextView.name); setColumnOrder(nextView.columnOrder); setVisibleColumns(nextView.visibleColumns); setColumnFilters(nextView.columnFilters); setSortBy(nextView.sortBy); setSortDirection(nextView.sortDirection); }}>{<option value="default">Default Layout</option>}{savedViews.map((view) => <option key={view.id} value={view.id}>{view.name}</option>)}</select>
                <input type="text" className="avel-pipeline-matrix__view-name" value={viewNameDraft} onChange={(event) => setViewNameDraft(event.target.value)} placeholder="View name" />
                <button type="button" className="modern-btn modern-btn--secondary" onClick={saveCurrentView}>Save View</button>
                <button type="button" className="modern-btn modern-btn--secondary" disabled={activeViewID === 'default'} onClick={deleteCurrentView}>Delete View</button>
              </div>
              <details className="avel-pipeline-matrix__columns-menu">
                <summary className="modern-chip modern-chip--column-toggle">Columns</summary>
                <div className="avel-pipeline-matrix__columns-panel">
                  {columnOrder.map((columnKey, index) => (
                    <div key={`column-${columnKey}`} className="avel-pipeline-matrix__column-item">
                      <label className="avel-pipeline-matrix__column-toggle">
                        <input
                          type="checkbox"
                          checked={visibleColumns[columnKey]}
                          onChange={() =>
                            setVisibleColumns((current) => {
                              const visibleCount = (Object.keys(current) as ColumnKey[]).reduce(
                                (total, key) => total + (current[key] ? 1 : 0),
                                0
                              );
                              if (current[columnKey] && visibleCount <= 1) {
                                return current;
                              }
                              return {
                                ...current,
                                [columnKey]: !current[columnKey]
                              };
                            })
                          }
                        />
                        <span>{columnLabel(columnKey)}</span>
                      </label>
                      <div className="avel-pipeline-matrix__column-move">
                        <button type="button" disabled={index === 0} onClick={() => moveColumn(columnKey, -1)}>Up</button>
                        <button type="button" disabled={index === columnOrder.length - 1} onClick={() => moveColumn(columnKey, 1)}>Down</button>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            </div>
            {data.state.errorMessage !== '' ? <div className="modern-state modern-state--error">{data.state.errorMessage}</div> : null}
          </section>

          <section className="avel-list-panel">
            <div className="avel-list-panel__header"><h2 className="avel-list-panel__title">Candidate Assignments</h2><p className="avel-list-panel__hint">Showing {data.state.startRow}-{data.state.endRow} of {data.meta.totalRows}</p></div>
            <div className="modern-table-wrap avel-pipeline-matrix__table-wrap">
              <table className="modern-table avel-pipeline-matrix__table">
                <thead><tr>{visibleColumnOrder.map((columnKey) => <th key={`header-${columnKey}`}><div className="avel-pipeline-matrix__th-shell"><button type="button" className="avel-pipeline-matrix__th-title" onClick={() => setActiveHeaderMenuColumn((current) => current === columnKey ? null : columnKey)}>{columnLabel(columnKey)}{sortBy === columnKey ? ` (${sortDirection})` : ''}</button>{(columnFilters[columnKey] || '').trim() !== '' ? <span className="modern-chip modern-chip--info">Filtered</span> : null}</div>{activeHeaderMenuColumn === columnKey ? <div className="avel-pipeline-matrix__header-menu"><label>Filter value<input type="text" value={columnFilters[columnKey]} onChange={(event) => setColumnFilters((current) => ({ ...current, [columnKey]: event.target.value }))} placeholder={`Filter ${columnLabel(columnKey)}`} /></label><div className="avel-pipeline-matrix__header-menu-actions"><button type="button" onClick={() => { setSortBy(columnKey); setSortDirection('asc'); }}>Sort A-Z</button><button type="button" onClick={() => { setSortBy(columnKey); setSortDirection('desc'); }}>Sort Z-A</button><button type="button" onClick={() => setColumnFilters((current) => ({ ...current, [columnKey]: '' }))}>Clear</button><button type="button" onClick={() => setActiveHeaderMenuColumn(null)}>Close</button></div></div> : null}</th>)}</tr></thead>
                <tbody>{filteredRows.length === 0 ? <tr><td colSpan={visibleColumnOrder.length}>No rows match the current column filters.</td></tr> : filteredRows.map((row) => <tr key={`row-${row.candidateJobOrderID}`}>{visibleColumnOrder.map((columnKey) => { if (columnKey === 'candidate') { return <td key={`${row.candidateJobOrderID}-${columnKey}`}><a className="modern-link" href={ensureModernUIURL(row.candidateURL)}>{toDisplayText(row.candidateName)}</a></td>; } if (columnKey === 'jobOrder') { return <td key={`${row.candidateJobOrderID}-${columnKey}`}><a className="modern-link" href={ensureModernUIURL(row.jobOrderURL)}>{toDisplayText(row.jobOrderTitle)}</a></td>; } if (columnKey === 'company') { return <td key={`${row.candidateJobOrderID}-${columnKey}`}><a className="modern-link" href={ensureModernUIURL(row.companyURL)}>{toDisplayText(row.companyName)}</a></td>; } if (columnKey === 'pipeline') { return <td key={`${row.candidateJobOrderID}-${columnKey}`}><span className="modern-chip modern-chip--pipeline">{toDisplayText(row.pipelineStatus)}</span></td>; } if (columnKey === 'gdpr') { return <td key={`${row.candidateJobOrderID}-${columnKey}`}><span className={`modern-chip ${row.gdprSigned ? 'modern-chip--gdpr-signed' : 'modern-chip--gdpr-unsigned'}`}>{row.gdprSigned ? 'Signed' : 'Not Signed'}</span></td>; } return <td key={`${row.candidateJobOrderID}-${columnKey}`}>{toDisplayText(getColumnValue(row, columnKey))}</td>; })}</tr>)}</tbody>
              </table>
            </div>
            <div className="modern-table-actions" style={{ justifyContent: 'space-between', marginTop: 12 }}><span className="modern-state">Page {data.meta.page} of {data.meta.totalPages}</span><div className="modern-table-actions"><button type="button" className="modern-btn modern-btn--secondary" disabled={!canGoPrev} onClick={() => applyServerFilters({ page: data.meta.page - 1 })}>Prev</button><button type="button" className="modern-btn modern-btn--secondary" disabled={!canGoNext} onClick={() => applyServerFilters({ page: data.meta.page + 1 })}>Next</button><button type="button" className="modern-btn modern-btn--secondary" onClick={() => setReloadToken((current) => current + 1)}>Refresh</button></div></div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
