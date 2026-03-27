import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchCandidatesListModernData } from '../lib/api';
import type { CandidatesListModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { CandidateAssignJobOrderModal } from '../components/primitives/CandidateAssignJobOrderModal';
import { SelectMenu } from '../ui-core';
import type { SelectMenuOption } from '../ui-core';
import { ensureModernUIURL } from '../lib/navigation';
import { usePageRefreshEvents } from '../lib/usePageRefreshEvents';
import { isCapabilityEnabled } from '../lib/routeGuards';
import { useServerQueryState } from '../lib/useServerQueryState';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type NavigationFilters = {
  quickSearch?: string;
  sourceFilter?: string;
  onlyMyCandidates?: boolean;
  onlyHotCandidates?: boolean;
  onlyGdprUnsigned?: boolean;
  onlyInternalCandidates?: boolean;
  onlyActiveCandidates?: boolean;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  page?: number;
  maxResults?: number;
};

type AddToListCompletedDetail = {
  dataItemType?: number | string;
  dataItemIDs?: Array<number | string>;
  listIDs?: Array<number | string>;
};

const SEARCH_APPLY_DEBOUNCE_MS = 420;

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

function toBooleanString(value: boolean): string {
  return value ? '1' : '0';
}

function decodeLegacyURL(url: string): string {
  return String(url || '').replace(/&amp;/g, '&');
}

function getSourceChipClass(source: string): string {
  const normalized = String(source || '').toLowerCase();
  if (normalized.includes('linkedin')) {
    return 'modern-chip--source-linkedin';
  }
  if (normalized.includes('partner')) {
    return 'modern-chip--source-partner';
  }
  if (normalized.includes('direct')) {
    return 'modern-chip--source-direct';
  }
  if (normalized.includes('internal')) {
    return 'modern-chip--source-internal';
  }
  if (normalized.includes('network')) {
    return 'modern-chip--source-network';
  }
  return 'modern-chip--source-other';
}

function getRowColumnValue(row: CandidatesListModernDataResponse['rows'][0], key: string): string {
  switch (key) {
    case 'candidate': return String(row.fullName || '');
    case 'source': return String(row.source || '');
    case 'skills': return String(row.keySkills || '');
    case 'pipeline': return row.isInPipeline ? `Allocated (${row.pipelineActiveCount})` : 'Unassigned';
    case 'gdpr': return row.gdprSigned ? 'Signed' : 'Not Signed';
    case 'owner': return String(row.ownerName || '');
    default: return '';
  }
}

const stripDiacritics = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '');

const MULTI_FILTER_PREFIX = 'multi:';

function encodeFilterSelection(values: string[]): string {
  if (values.length === 0) return '';
  return MULTI_FILTER_PREFIX + JSON.stringify(values);
}

function parseFilterSelection(raw: string): { values: string[] } {
  if (!raw || raw === '') return { values: [] };
  if (raw.startsWith(MULTI_FILTER_PREFIX)) {
    try {
      const arr = JSON.parse(raw.slice(MULTI_FILTER_PREFIX.length));
      return { values: Array.isArray(arr) ? arr : [] };
    } catch { return { values: [] }; }
  }
  return { values: [raw] };
}

function normalizeToken(s: string): string {
  return stripDiacritics(s.toLowerCase().trim());
}

export function CandidatesListPage({ bootstrap }: Props) {
  const [data, setData] = useState<CandidatesListModernDataResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { serverQueryString, applyServerQuery } = useServerQueryState(bootstrap.indexName);
  const [searchDraft, setSearchDraft] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [assignJobModal, setAssignJobModal] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [menuSearch, setMenuSearch] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    candidate: true, source: true, skills: true, pipeline: true,
    gdpr: true, owner: true, created: true, updated: true, actions: true
  });
  const columnsMenuRef = useRef<HTMLDetailsElement | null>(null);
  const skipNextAutoSearchRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    if (!query.get('maxResults')) {
      query.set('maxResults', '100');
    }
    fetchCandidatesListModernData(bootstrap, query)
      .then((result) => {
        if (!isMounted) {
          return;
        }
        setData(result);
        setSearchDraft(result.filters.quickSearch || '');
      })
      .catch((err: Error) => {
        if (!isMounted) {
          return;
        }
        setError(err.message || 'Unable to load candidates.');
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

  const refreshPageData = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);
  usePageRefreshEvents(refreshPageData);

  useEffect(() => {
    const handleAddToListCompleted = (rawEvent: Event) => {
      const event = rawEvent as CustomEvent<AddToListCompletedDetail>;
      const ids = Array.isArray(event.detail?.dataItemIDs)
        ? event.detail.dataItemIDs.map((value) => Number(value || 0)).filter((value) => value > 0)
        : [];
      if (ids.length === 0) {
        return;
      }

      const visibleCandidateIDs = new Set(
        (data?.rows || []).map((row) => Number(row.candidateID || 0)).filter((value) => value > 0)
      );
      if (visibleCandidateIDs.size === 0) {
        return;
      }

      if (!ids.some((id) => visibleCandidateIDs.has(id))) {
        return;
      }

      refreshPageData();
    };

    window.addEventListener('opencats:add-to-list:completed', handleAddToListCompleted as EventListener);
    return () => {
      window.removeEventListener('opencats:add-to-list:completed', handleAddToListCompleted as EventListener);
    };
  }, [data?.rows, refreshPageData]);

  const openAddToListOverlay = useCallback((sourceURL: string) => {
    const normalizedURL = decodeLegacyURL(sourceURL);
    if (normalizedURL === '') {
      return;
    }

    window.dispatchEvent(
      new CustomEvent('opencats:add-to-list:open', {
        detail: {
          url: normalizedURL
        }
      })
    );
  }, []);

  const navigateWithFilters = useCallback(
    (next: NavigationFilters) => {
      if (!data) {
        return;
      }

      const nextQuery = new URLSearchParams(serverQueryString);
      nextQuery.set('m', 'candidates');
      nextQuery.set('a', 'listByView');
      nextQuery.set('view', 'list');

      const quickSearchValue = String(next.quickSearch ?? data.filters.quickSearch ?? '').trim();
      if (quickSearchValue === '') {
        nextQuery.delete('wildCardString');
      } else {
        nextQuery.set('wildCardString', quickSearchValue);
      }

      const sourceFilterValue = String(next.sourceFilter ?? data.filters.sourceFilter ?? '').trim();
      if (sourceFilterValue === '') {
        nextQuery.delete('sourceFilter');
      } else {
        nextQuery.set('sourceFilter', sourceFilterValue);
      }

      const onlyMyCandidates = typeof next.onlyMyCandidates === 'boolean' ? next.onlyMyCandidates : data.filters.onlyMyCandidates;
      const onlyHotCandidates = typeof next.onlyHotCandidates === 'boolean' ? next.onlyHotCandidates : data.filters.onlyHotCandidates;
      const onlyGdprUnsigned = typeof next.onlyGdprUnsigned === 'boolean' ? next.onlyGdprUnsigned : data.filters.onlyGdprUnsigned;
      const onlyInternalCandidates = typeof next.onlyInternalCandidates === 'boolean' ? next.onlyInternalCandidates : data.filters.onlyInternalCandidates;
      const onlyActiveCandidates = typeof next.onlyActiveCandidates === 'boolean' ? next.onlyActiveCandidates : data.filters.onlyActiveCandidates;

      nextQuery.set('onlyMyCandidates', toBooleanString(onlyMyCandidates));
      nextQuery.set('onlyHotCandidates', toBooleanString(onlyHotCandidates));
      nextQuery.set('onlyGdprUnsigned', toBooleanString(onlyGdprUnsigned));
      nextQuery.set('onlyInternalCandidates', toBooleanString(onlyInternalCandidates));
      nextQuery.set('onlyActiveCandidates', toBooleanString(onlyActiveCandidates));

      const sortBy = String(next.sortBy ?? data.meta.sortBy ?? '').trim();
      if (sortBy === '') {
        nextQuery.delete('sortBy');
      } else {
        nextQuery.set('sortBy', sortBy);
      }

      const sortDirection = String(next.sortDirection ?? data.meta.sortDirection ?? '').trim().toUpperCase();
      if (sortDirection === 'ASC' || sortDirection === 'DESC') {
        nextQuery.set('sortDirection', sortDirection);
      } else {
        nextQuery.delete('sortDirection');
      }

      const entriesPerPage =
        typeof next.maxResults === 'number' && next.maxResults > 0
          ? next.maxResults
          : data.meta.entriesPerPage;
      nextQuery.set('maxResults', String(entriesPerPage));

      const page = typeof next.page === 'number' && next.page > 0 ? next.page : 1;
      nextQuery.set('page', String(page));
      nextQuery.delete('rangeStart');

      if (!nextQuery.get('ui')) {
        nextQuery.set('ui', 'modern');
      }

      applyServerQuery(nextQuery);
    },
    [applyServerQuery, data, serverQueryString]
  );

  useEffect(() => {
    if (!data) {
      return;
    }

    if (skipNextAutoSearchRef.current) {
      skipNextAutoSearchRef.current = false;
      return;
    }

    const nextSearch = searchDraft.trim();
    const currentSearch = String(data.filters.quickSearch || '').trim();
    if (nextSearch === currentSearch) {
      return;
    }

    const debounceID = window.setTimeout(() => {
      navigateWithFilters({ quickSearch: nextSearch, page: 1 });
    }, SEARCH_APPLY_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(debounceID);
    };
  }, [data, navigateWithFilters, searchDraft]);

  useEffect(() => {
    if (!activeMenu) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.avel-col-filter')) {
        setActiveMenu(null);
        setMenuSearch('');
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenu(null);
        setMenuSearch('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [activeMenu]);

  useEffect(() => {
    const el = columnsMenuRef.current;
    if (!el || !el.open) return;
    const handleClick = (e: MouseEvent) => {
      if (!el.contains(e.target as Node)) {
        el.open = false;
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        el.open = false;
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  });

  const sourceOptions = useMemo<SelectMenuOption[]>(() => {
    if (!data) {
      return [{ value: '', label: 'All sources' }];
    }

    const normalized = (data.options.sources || []).map((option) => ({
      value: String(option.value || ''),
      label: toDisplayText(option.label, 'Unknown')
    }));

    if (!normalized.find((option) => option.value === '')) {
      normalized.unshift({ value: '', label: 'All sources' });
    }

    return normalized;
  }, [data]);

  const rowsPerPageOptions: SelectMenuOption[] = [
    { value: '15', label: '15 rows' },
    { value: '30', label: '30 rows' },
    { value: '50', label: '50 rows' },
    { value: '100', label: '100 rows' }
  ];

  // Source distribution (from current page rows)
  const sourceDistribution = useMemo(() => {
    if (!data) return [];
    const counts = new Map<string, number>();
    for (const row of data.rows) {
      const src = String(row.source || '').trim();
      const key = src === '' ? 'Other' : src;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    // Sort by count descending, take top 5 + "Other"
    const entries = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    return entries.slice(0, 6).map(([label, count]) => ({
      label,
      count,
      chipClass: getSourceChipClass(label)
    }));
  }, [data]);

  const filterOptions = useMemo(() => {
    if (!data) return {} as Record<string, string[]>;
    const filterable = ['candidate', 'source', 'skills', 'pipeline', 'gdpr', 'owner'] as const;
    const opts: Record<string, string[]> = {};
    for (const key of filterable) {
      const seen = new Map<string, string>();
      for (const row of data.rows) {
        const v = getRowColumnValue(row, key).trim();
        if (v === '') continue;
        const token = normalizeToken(v);
        if (!seen.has(token)) seen.set(token, v);
      }
      opts[key] = Array.from(seen.values()).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true })
      );
    }
    return opts;
  }, [data]);

  const toggleFilterValue = useCallback((key: string, value: string, checked: boolean) => {
    const normalized = String(value || '').trim();
    if (normalized === '') return;
    setColumnFilters((current) => {
      const existing = parseFilterSelection(current[key] || '').values;
      const map = new Map(existing.map((e) => [normalizeToken(e), e]));
      const token = normalizeToken(normalized);
      if (checked) map.set(token, normalized);
      else map.delete(token);
      return { ...current, [key]: encodeFilterSelection(Array.from(map.values())) };
    });
  }, []);

  const setFilterSelection = useCallback((key: string, values: string[]) => {
    setColumnFilters((current) => ({ ...current, [key]: encodeFilterSelection(values) }));
  }, []);

  const filteredRows = useMemo(() => {
    if (!data) return [];
    const activeKeys = Object.keys(columnFilters).filter((k) => {
      const sel = parseFilterSelection(columnFilters[k]);
      return sel.values.length > 0;
    });
    if (activeKeys.length === 0) return data.rows;
    // Text-heavy columns use substring matching; discrete columns use exact match
    const textColumns = new Set(['candidate', 'skills']);
    return data.rows.filter((row) =>
      activeKeys.every((key) => {
        const sel = parseFilterSelection(columnFilters[key]);
        if (sel.values.length === 0) return true;
        const rowVal = normalizeToken(getRowColumnValue(row, key));
        if (textColumns.has(key)) {
          return sel.values.some((v) => rowVal.includes(normalizeToken(v)));
        }
        return sel.values.some((v) => normalizeToken(v) === rowVal);
      })
    );
  }, [data, columnFilters]);

  if (loading && !data) {
    return <div className="modern-state">Loading candidates...</div>;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        actionLabel="Open Legacy UI"
        actionURL={bootstrap.legacyURL}
      />
    );
  }

  if (!data) {
    return <EmptyState message="No candidates available." />;
  }

  const filters = data.filters;
  const permissions = data.meta.permissions;
  const canAddCandidate = isCapabilityEnabled(permissions.canAddCandidate);
  const canEditCandidate = isCapabilityEnabled(permissions.canEditCandidate);
  const canAddToList = isCapabilityEnabled(permissions.canAddToList);
  const canAddToJobOrder = isCapabilityEnabled(permissions.canAddToJobOrder);
  const activeFilterItems: Array<{ label: string; onRemove: () => void }> = [];
  if (filters.quickSearch.trim() !== '') {
    activeFilterItems.push({
      label: `Search: "${filters.quickSearch.trim()}"`,
      onRemove: () => { skipNextAutoSearchRef.current = true; setSearchDraft(''); navigateWithFilters({ quickSearch: '', page: 1 }); }
    });
  }
  if (filters.sourceFilter !== '') {
    activeFilterItems.push({
      label: `Source: ${filters.sourceFilter}`,
      onRemove: () => navigateWithFilters({ sourceFilter: '', page: 1 })
    });
  }
  if (filters.onlyMyCandidates) {
    activeFilterItems.push({
      label: 'Only My Candidates',
      onRemove: () => navigateWithFilters({ onlyMyCandidates: false, page: 1 })
    });
  }
  if (filters.onlyHotCandidates) {
    activeFilterItems.push({
      label: 'Only Hot Candidates',
      onRemove: () => navigateWithFilters({ onlyHotCandidates: false, page: 1 })
    });
  }
  if (filters.onlyGdprUnsigned) {
    activeFilterItems.push({
      label: 'GDPR Not Signed',
      onRemove: () => navigateWithFilters({ onlyGdprUnsigned: false, page: 1 })
    });
  }
  if (filters.onlyInternalCandidates) {
    activeFilterItems.push({
      label: 'Internal Candidates',
      onRemove: () => navigateWithFilters({ onlyInternalCandidates: false, page: 1 })
    });
  }
  if (filters.onlyActiveCandidates) {
    activeFilterItems.push({
      label: 'Only Active',
      onRemove: () => navigateWithFilters({ onlyActiveCandidates: false, page: 1 })
    });
  }

  const canGoPrev = data.meta.page > 1;
  const canGoNext = data.meta.page < data.meta.totalPages;
  const hasActiveFilters = activeFilterItems.length > 0;

  const gdprSignedCount = data.rows.filter((row) => row.gdprSigned).length;
  const pipelineAllocatedCount = data.rows.filter((row) => row.isInPipeline).length;

  // Pagination range text
  const rangeStart = (data.meta.page - 1) * data.meta.entriesPerPage + 1;
  const rangeEnd = Math.min(rangeStart + data.rows.length - 1, data.meta.totalRows);

  const hasVisibleRows = filteredRows.length > 0;

  return (
    <div className="avel-dashboard-page avel-candidates-page">
      <PageContainer
        title="Candidates"
        subtitle="Candidate intelligence workspace for sourcing, triage, and placement prep."
        actions={
          <>
            {canAddCandidate ? (
              <a className="modern-btn modern-btn--emphasis" href={`${bootstrap.indexName}?m=candidates&a=add&ui=modern`}>
                Add Candidate
              </a>
            ) : null}
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-candidate-stats-bar" aria-label="Candidate pool overview">
            <div className="avel-candidate-stats-bar__item avel-candidate-stats-bar__item--total">
              <span className="avel-candidate-stats-bar__label">Candidates</span>
              <strong className="avel-candidate-stats-bar__value">{data.meta.totalRows}</strong>
            </div>
            <span className="avel-candidate-stats-bar__sep" aria-hidden="true" />
            {sourceDistribution.map(({ label, count, chipClass }) => (
              <div key={label} className={`avel-candidate-stats-bar__item avel-candidate-stats-bar__chip ${chipClass}`}>
                <span className="avel-candidate-stats-bar__chip-label">{label}</span>
                <strong className="avel-candidate-stats-bar__chip-value">{count}</strong>
              </div>
            ))}
            <span className="avel-candidate-stats-bar__sep" aria-hidden="true" />
            <div className="avel-candidate-stats-bar__item avel-candidate-stats-bar__item--gdpr">
              <span className="avel-candidate-stats-bar__label">GDPR Signed</span>
              <strong className="avel-candidate-stats-bar__value">{gdprSignedCount}/{data.rows.length}</strong>
            </div>
            <div className="avel-candidate-stats-bar__item avel-candidate-stats-bar__item--pipeline">
              <span className="avel-candidate-stats-bar__label">In Pipeline</span>
              <strong className="avel-candidate-stats-bar__value">{pipelineAllocatedCount}</strong>
            </div>
          </section>

          <section className="avel-candidate-toolbar modern-command-bar" aria-label="Candidates filters and controls">
            <div className="avel-candidate-toolbar__primary">
              <form
                className="modern-command-search avel-candidate-toolbar__search"
                onSubmit={(event) => {
                  event.preventDefault();
                  skipNextAutoSearchRef.current = true;
                  navigateWithFilters({ quickSearch: searchDraft, page: 1 });
                }}
              >
                <span className="modern-command-label">Search</span>
                <span className="modern-command-search__shell">
                  <span className="modern-command-search__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="14" height="14" role="presentation" style={{ width: 14, height: 14 }}>
                      <path d="M11 4a7 7 0 1 1-4.95 11.95A7 7 0 0 1 11 4zm0-2a9 9 0 1 0 5.66 16l4.17 4.17 1.41-1.41-4.17-4.17A9 9 0 0 0 11 2z" />
                    </svg>
                  </span>
                  <input
                    type="search"
                    value={searchDraft}
                    onChange={(event) => setSearchDraft(event.target.value)}
                    placeholder="Search by name, skills, location, resume"
                  />
                </span>
              </form>

              <SelectMenu
                label="Source"
                value={filters.sourceFilter}
                options={sourceOptions}
                onChange={(value) => navigateWithFilters({ sourceFilter: value, page: 1 })}
              />

              <SelectMenu
                label="Rows"
                value={String(data.meta.entriesPerPage)}
                options={rowsPerPageOptions}
                onChange={(value) => navigateWithFilters({ maxResults: Number(value), page: 1 })}
                className="modern-command-field modern-command-field--compact"
              />

              <button
                type="button"
                className="modern-btn modern-btn--secondary"
                onClick={() => {
                  skipNextAutoSearchRef.current = true;
                  setSearchDraft('');
                  setColumnFilters({});
                  setActiveMenu(null);
                  setMenuSearch('');
                  navigateWithFilters({
                    quickSearch: '',
                    sourceFilter: '',
                    onlyMyCandidates: false,
                    onlyHotCandidates: false,
                    onlyGdprUnsigned: false,
                    onlyInternalCandidates: false,
                    onlyActiveCandidates: true,
                    sortBy: 'dateModifiedSort',
                    sortDirection: 'DESC',
                    page: 1
                  });
                }}
              >
                Reset Filters
              </button>
            </div>

            <div className="avel-candidate-toolbar__toggles-row">
              <label className="modern-command-toggle">
                <input type="checkbox" checked={filters.onlyActiveCandidates} onChange={(event) => navigateWithFilters({ onlyActiveCandidates: event.target.checked, page: 1 })} />
                <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                <span>Only Active</span>
              </label>
              <label className="modern-command-toggle">
                <input type="checkbox" checked={filters.onlyMyCandidates} onChange={(event) => navigateWithFilters({ onlyMyCandidates: event.target.checked, page: 1 })} />
                <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                <span>My Candidates Only</span>
              </label>
              <label className="modern-command-toggle">
                <input type="checkbox" checked={filters.onlyHotCandidates} onChange={(event) => navigateWithFilters({ onlyHotCandidates: event.target.checked, page: 1 })} />
                <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                <span>Hot Candidates</span>
              </label>
              <label className="modern-command-toggle">
                <input type="checkbox" checked={filters.onlyGdprUnsigned} onChange={(event) => navigateWithFilters({ onlyGdprUnsigned: event.target.checked, page: 1 })} />
                <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                <span>GDPR Not Signed</span>
              </label>
              <label className="modern-command-toggle">
                <input type="checkbox" checked={filters.onlyInternalCandidates} onChange={(event) => navigateWithFilters({ onlyInternalCandidates: event.target.checked, page: 1 })} />
                <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                <span>Internal Candidates</span>
              </label>
            </div>

            {hasActiveFilters ? (
              <div className="avel-candidate-toolbar__active-strip">
                <span className="modern-command-active__count is-active" aria-live="polite" aria-atomic="true">
                  {activeFilterItems.length} active filter{activeFilterItems.length === 1 ? '' : 's'}
                </span>
                {activeFilterItems.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className="modern-active-filter modern-active-filter--server"
                    onClick={item.onRemove}
                  >
                    {item.label} &times;
                  </button>
                ))}
              </div>
            ) : null}
          </section>

          {toDisplayText(data.state.topLog, '') !== '' ? (
            <div className="modern-state">{toDisplayText(data.state.topLog, '')}</div>
          ) : null}

          <section className="avel-list-panel avel-candidate-results">
            <div className="avel-list-panel__header">
              <div className="avel-list-panel__header-left">
                <h2 className="avel-list-panel__title">
                  Candidates {data.meta.totalRows > 0 ? `(${data.meta.totalRows})` : ''}
                </h2>
                <p className="avel-list-panel__hint">
                  Showing {rangeStart}–{rangeEnd} of {data.meta.totalRows}
                  {Object.values(columnFilters).some((v) => parseFilterSelection(v).values.length > 0) ? ` (${filteredRows.length} matching column filters)` : ''}
                </p>
              </div>
              <details className="avel-candidate-columns-menu" ref={columnsMenuRef}>
                <summary className="modern-btn modern-btn--mini modern-btn--secondary">Columns</summary>
                <div className="avel-candidate-columns-panel">
                  {[
                    { key: 'candidate', title: 'Candidate' },
                    { key: 'source', title: 'Source' },
                    { key: 'skills', title: 'Key Skills' },
                    { key: 'pipeline', title: 'Pipeline' },
                    { key: 'gdpr', title: 'GDPR' },
                    { key: 'owner', title: 'Owner' },
                    { key: 'created', title: 'Added' },
                    { key: 'updated', title: 'Updated' },
                  ].map((col) => (
                    <label key={`vis-${col.key}`} className="avel-candidate-columns-item">
                      <input
                        type="checkbox"
                        checked={visibleColumns[col.key] !== false}
                        onChange={() => setVisibleColumns((current) => {
                          const visCount = Object.values(current).filter(Boolean).length;
                          if (current[col.key] && visCount <= 2) return current;
                          return { ...current, [col.key]: !current[col.key] };
                        })}
                      />
                      <span>{col.title}</span>
                    </label>
                  ))}
                </div>
              </details>
              <div className="avel-candidates-pagination">
                <button
                  type="button"
                  className="modern-btn modern-btn--mini modern-btn--secondary"
                  disabled={!canGoPrev}
                  onClick={() => navigateWithFilters({ page: data.meta.page - 1 })}
                >
                  ‹ Prev
                </button>
                <span className="avel-candidates-pagination__label">
                  {data.meta.page} / {data.meta.totalPages}
                </span>
                <button
                  type="button"
                  className="modern-btn modern-btn--mini modern-btn--secondary"
                  disabled={!canGoNext}
                  onClick={() => navigateWithFilters({ page: data.meta.page + 1 })}
                >
                  Next ›
                </button>
              </div>
            </div>

            {!hasVisibleRows ? (
              <EmptyState message="No candidates match current filters." />
            ) : (
              <div className="modern-table-wrap">
                <table className="modern-table">
                  <thead>
                    <tr>
                      {[
                        { key: 'candidate', title: 'Candidate', sortKey: 'lastName' },
                        { key: 'source', title: 'Source', sortKey: 'source' },
                        { key: 'skills', title: 'Key Skills', sortKey: '' },
                        { key: 'pipeline', title: 'Pipeline', sortKey: '' },
                        { key: 'gdpr', title: 'GDPR', sortKey: '' },
                        { key: 'owner', title: 'Owner', sortKey: 'ownerSort' },
                        { key: 'created', title: 'Added', sortKey: 'dateCreatedSort' },
                        { key: 'updated', title: 'Updated', sortKey: 'dateModifiedSort' },
                        { key: 'actions', title: 'Actions', sortKey: '' }
                      ].filter((col) => col.key === 'actions' || visibleColumns[col.key] !== false).map((col) => {
                        const isSorted = col.sortKey !== '' && data.meta.sortBy === col.sortKey;
                        const canFilter = ['candidate', 'source', 'skills', 'pipeline', 'gdpr', 'owner'].includes(col.key);
                        const isFilterOpen = activeMenu === col.key;
                        const hasFilterValues = parseFilterSelection(columnFilters[col.key] || '').values.length > 0;

                        return (
                          <th key={col.key} className={isFilterOpen ? 'avel-col-filter--active' : ''}>
                            <div className="avel-col-header">
                              {col.sortKey !== '' ? (
                                <button
                                  type="button"
                                  className="avel-col-header__sort"
                                  onClick={() => {
                                    if (isSorted) {
                                      navigateWithFilters({
                                        sortDirection: data.meta.sortDirection === 'DESC' ? 'ASC' : 'DESC',
                                        page: 1
                                      });
                                    } else {
                                      navigateWithFilters({ sortBy: col.sortKey, sortDirection: 'DESC', page: 1 });
                                    }
                                  }}
                                >
                                  {col.title}
                                  {isSorted ? (
                                    <span className="avel-col-header__arrow" aria-hidden="true">
                                      {data.meta.sortDirection === 'ASC' ? ' ▲' : ' ▼'}
                                    </span>
                                  ) : null}
                                </button>
                              ) : (
                                <span>{col.title}</span>
                              )}
                              {canFilter ? (
                                <div className="avel-col-filter">
                                  <button
                                    type="button"
                                    className={`avel-col-filter__toggle${hasFilterValues ? ' is-active' : ''}`}
                                    onClick={() => { setActiveMenu(activeMenu === col.key ? null : col.key); setMenuSearch(''); }}
                                    aria-label={`Filter ${col.title}`}
                                    aria-expanded={isFilterOpen}
                                  >
                                    <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true">
                                      <path d="M1 2h14l-5.5 6.5V14l-3-1.5V8.5z" fill="currentColor" />
                                    </svg>
                                  </button>
                                  {canFilter && activeMenu === col.key ? (
                                    <div className="avel-col-filter__dropdown">
                                      <label className="avel-col-filter__search-label">
                                        Search values
                                        <input
                                          type="text"
                                          className="avel-col-filter__input"
                                          value={menuSearch}
                                          onChange={(e) => setMenuSearch(e.target.value)}
                                          placeholder={`Find ${col.title.toLowerCase()}`}
                                          autoFocus
                                        />
                                      </label>
                                      <div className="avel-col-filter__options">
                                        {(() => {
                                          const options = filterOptions[col.key] || [];
                                          const searchNorm = normalizeToken(menuSearch);
                                          const rendered = searchNorm ? options.filter((o) => normalizeToken(o).includes(searchNorm)) : options;
                                          const selectedTokens = new Set(parseFilterSelection(columnFilters[col.key] || '').values.map(normalizeToken));
                                          if (rendered.length === 0) return <div className="avel-col-filter__empty">No matching values.</div>;
                                          return rendered.map((opt) => {
                                            const token = normalizeToken(opt);
                                            return (
                                              <label key={`f-${col.key}-${opt}`} className="avel-col-filter__option">
                                                <input
                                                  type="checkbox"
                                                  checked={selectedTokens.has(token)}
                                                  onChange={(e) => toggleFilterValue(col.key, opt, e.target.checked)}
                                                />
                                                {col.key === 'source' ? (
                                                  <span className={`modern-chip ${getSourceChipClass(opt)}`}>{opt}</span>
                                                ) : col.key === 'gdpr' ? (
                                                  <span className={opt === 'Signed' ? 'modern-chip modern-chip--gdpr-signed' : 'modern-chip modern-chip--gdpr-unsigned'}>{opt}</span>
                                                ) : col.key === 'pipeline' ? (
                                                  <span className={opt.startsWith('Allocated') ? 'modern-chip modern-chip--pipeline' : 'modern-chip modern-chip--pipeline-idle'}>{opt}</span>
                                                ) : (
                                                  <span>{opt}</span>
                                                )}
                                              </label>
                                            );
                                          });
                                        })()}
                                      </div>
                                      <div className="avel-col-filter__actions">
                                        <button type="button" onClick={() => { const options = filterOptions[col.key] || []; const searchNorm = normalizeToken(menuSearch); const rendered = searchNorm ? options.filter((o) => normalizeToken(o).includes(searchNorm)) : options; setFilterSelection(col.key, rendered); }}>Select Visible</button>
                                        <button type="button" onClick={() => setFilterSelection(col.key, [])}>Clear</button>
                                        {col.sortKey !== '' ? (
                                          <>
                                            <button type="button" onClick={() => { navigateWithFilters({ sortBy: col.sortKey, sortDirection: 'ASC', page: 1 }); setActiveMenu(null); setMenuSearch(''); }}>Sort A–Z</button>
                                            <button type="button" onClick={() => { navigateWithFilters({ sortBy: col.sortKey, sortDirection: 'DESC', page: 1 }); setActiveMenu(null); setMenuSearch(''); }}>Sort Z–A</button>
                                          </>
                                        ) : null}
                                      </div>
                                    </div>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row) => {
                      const locationParts = [row.city, row.country]
                        .map((value) => String(value || '').trim())
                        .filter((value) => value !== '');
                      const locationText = locationParts.length > 0 ? locationParts.join(', ') : '--';

                      return (
                        <tr key={row.candidateID}>
                          {visibleColumns['candidate'] !== false ? (
                            <td className="avel-candidate-table__candidate">
                              <div className="avel-candidate-table__title-row">
                                <a className="modern-link avel-candidate-table__name" href={ensureModernUIURL(row.candidateURL)}>
                                  {toDisplayText(row.fullName)} <span className="avel-candidate-table__id">#{row.candidateID}</span>
                                </a>
                                <div className="avel-candidate-table__quick-tags">
                                  {row.hasAttachment ? <span className="modern-chip modern-chip--resume">Resume</span> : null}
                                  {row.hasDuplicate ? <span className="modern-chip modern-chip--critical">Duplicate</span> : null}
                                  {row.isHot ? <span className="modern-chip modern-chip--warning">Hot</span> : null}
                                  {row.commentCount > 0 ? (
                                    <span className="modern-chip modern-chip--success">{row.commentCount} comments</span>
                                  ) : null}
                                </div>
                              </div>
                              <div className="avel-candidate-table__meta">{locationText}</div>
                            </td>
                          ) : null}
                          {visibleColumns['source'] !== false ? (
                            <td>
                              <span className={`modern-chip ${getSourceChipClass(row.source)}`}>{toDisplayText(row.source)}</span>
                            </td>
                          ) : null}
                          {visibleColumns['skills'] !== false ? (
                            <td className="avel-candidate-table__skills">{toDisplayText(row.keySkills)}</td>
                          ) : null}
                          {visibleColumns['pipeline'] !== false ? (
                            <td>
                              {row.isInPipeline ? (
                                <span className="modern-chip modern-chip--pipeline">
                                  Allocated ({row.pipelineActiveCount})
                                </span>
                              ) : (
                                <span className="modern-chip modern-chip--pipeline-idle">Unassigned</span>
                              )}
                            </td>
                          ) : null}
                          {visibleColumns['gdpr'] !== false ? (
                            <td>
                              {row.gdprSigned ? (
                                <span className="modern-chip modern-chip--gdpr-signed">Signed</span>
                              ) : (
                                <span className="modern-chip modern-chip--gdpr-unsigned">Not Signed</span>
                              )}
                            </td>
                          ) : null}
                          {visibleColumns['owner'] !== false ? (
                            <td>{toDisplayText(row.ownerName)}</td>
                          ) : null}
                          {visibleColumns['created'] !== false ? (
                            <td>{toDisplayText(row.createdDate)}</td>
                          ) : null}
                          {visibleColumns['updated'] !== false ? (
                            <td>{toDisplayText(row.modifiedDate)}</td>
                          ) : null}
                          <td>
                            <div className="modern-table-actions">
                              {canAddToJobOrder ? (
                                <button
                                  type="button"
                                  className="modern-btn modern-btn--mini modern-btn--emphasis avel-candidate-action avel-candidate-action--primary"
                                  onClick={() =>
                                    setAssignJobModal({
                                      url: decodeLegacyURL(row.addToJobOrderURL),
                                      title: `Add To Job Order: ${toDisplayText(row.fullName, 'Candidate')}`
                                    })
                                  }
                                >
                                  Add To Job
                                </button>
                              ) : null}
                              {canEditCandidate ? (
                                <a
                                  className="modern-btn modern-btn--mini modern-btn--secondary avel-candidate-action avel-candidate-action--edit"
                                  href={ensureModernUIURL(row.candidateEditURL)}
                                >
                                  Edit
                                </a>
                              ) : null}
                              {canAddToList ? (
                                <button
                                  type="button"
                                  className="modern-btn modern-btn--mini modern-btn--ghost avel-candidate-action avel-candidate-action--tertiary"
                                  onClick={() => openAddToListOverlay(row.addToListURL)}
                                >
                                  Add To List
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <CandidateAssignJobOrderModal
          isOpen={!!assignJobModal}
          bootstrap={bootstrap}
          sourceURL={assignJobModal?.url || ''}
          onClose={() => setAssignJobModal(null)}
          onAssigned={() => {
            refreshPageData();
          }}
        />
      </PageContainer>
    </div>
  );
}

