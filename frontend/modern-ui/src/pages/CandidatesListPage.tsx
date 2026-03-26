import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchCandidatesListModernData } from '../lib/api';
import type { CandidatesListModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { DataTable } from '../components/primitives/DataTable';
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

type LocalFocusFilter = 'all' | 'hot' | 'submitted' | 'duplicates' | 'resume';

const SEARCH_APPLY_DEBOUNCE_MS = 420;

const sortOptions: Array<{ value: string; label: string }> = [
  { value: 'dateModifiedSort', label: 'Updated' },
  { value: 'dateCreatedSort', label: 'Added' },
  { value: 'lastName', label: 'Name' },
  { value: 'ownerSort', label: 'Owner' },
  { value: 'source', label: 'Source' }
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
  const [localFocus, setLocalFocus] = useState<LocalFocusFilter>('all');
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);
  const moreFiltersRef = useRef<HTMLDetailsElement | null>(null);
  const skipNextAutoSearchRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
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
    if (!isMoreFiltersOpen) {
      return;
    }

    const handleDocumentPointerDown = (event: MouseEvent | TouchEvent) => {
      const container = moreFiltersRef.current;
      const target = event.target as Node | null;
      if (!container || !target) {
        return;
      }
      if (!container.contains(target)) {
        setIsMoreFiltersOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMoreFiltersOpen(false);
      }
    };

    document.addEventListener('mousedown', handleDocumentPointerDown);
    document.addEventListener('touchstart', handleDocumentPointerDown, { passive: true });
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleDocumentPointerDown);
      document.removeEventListener('touchstart', handleDocumentPointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMoreFiltersOpen]);

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

  const selectedSortBy = sortOptions.some((option) => option.value === data.meta.sortBy) ? data.meta.sortBy : 'dateModifiedSort';
  const selectedSortDirection = data.meta.sortDirection === 'ASC' ? 'ASC' : 'DESC';
  const selectedSortLabel = sortOptions.find((option) => option.value === selectedSortBy)?.label || 'Updated';

  const filters = data.filters;
  const permissions = data.meta.permissions;
  const canAddCandidate = isCapabilityEnabled(permissions.canAddCandidate);
  const canEditCandidate = isCapabilityEnabled(permissions.canEditCandidate);
  const canAddToList = isCapabilityEnabled(permissions.canAddToList);
  const canAddToJobOrder = isCapabilityEnabled(permissions.canAddToJobOrder);
  const activeFilterLabels: string[] = [];
  if (filters.quickSearch.trim() !== '') {
    activeFilterLabels.push(`Search: "${filters.quickSearch.trim()}"`);
  }
  if (filters.sourceFilter !== '') {
    activeFilterLabels.push(`Source: ${filters.sourceFilter}`);
  }
  if (filters.onlyMyCandidates) {
    activeFilterLabels.push('Only My Candidates');
  }
  if (filters.onlyHotCandidates) {
    activeFilterLabels.push('Only Hot Candidates');
  }
  if (filters.onlyGdprUnsigned) {
    activeFilterLabels.push('GDPR Not Signed');
  }
  if (filters.onlyInternalCandidates) {
    activeFilterLabels.push('Internal Candidates');
  }
  if (filters.onlyActiveCandidates) {
    activeFilterLabels.push('Only Active');
  }

  const canGoPrev = data.meta.page > 1;
  const canGoNext = data.meta.page < data.meta.totalPages;
  const hasActiveFilters = activeFilterLabels.length > 0;
  const visibleHotCount = data.rows.filter((row) => row.isHot).length;
  const visibleDuplicateCount = data.rows.filter((row) => row.hasDuplicate).length;
  const visibleSubmittedCount = data.rows.filter((row) => row.isSubmitted).length;
  const visibleResumeCount = data.rows.filter((row) => row.hasAttachment).length;
  const visibleRows = data.rows.filter((row) => {
    switch (localFocus) {
      case 'hot':
        return row.isHot;
      case 'submitted':
        return row.isSubmitted;
      case 'duplicates':
        return row.hasDuplicate;
      case 'resume':
        return row.hasAttachment;
      case 'all':
      default:
        return true;
    }
  });
  const hasVisibleRows = visibleRows.length > 0;
  const candidateTableColumns = [
    { key: 'candidate', title: 'Candidate' },
    { key: 'source', title: 'Source' },
    { key: 'skills', title: 'Key Skills' },
    { key: 'pipeline', title: 'Pipeline' },
    { key: 'gdpr', title: 'GDPR' },
    { key: 'owner', title: 'Owner' },
    { key: 'created', title: 'Added' },
    { key: 'updated', title: 'Updated' },
    { key: 'actions', title: 'Actions' }
  ];

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
            <a className="modern-btn modern-btn--secondary" href={bootstrap.legacyURL}>
              Open Legacy UI
            </a>
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-candidate-hero" aria-label="Candidates overview">
            <div className="avel-candidate-hero__intro">
              <p className="avel-candidate-hero__eyebrow">Candidate Intelligence</p>
              <h2 className="avel-candidate-hero__title">Move from search to action faster</h2>
              <p className="avel-candidate-hero__subtitle">
                Filter quickly, inspect key signals, and trigger next steps directly from each profile card.
              </p>
            </div>
            <div className="avel-candidate-hero__stats">
              <article className="avel-candidate-stat">
                <span className="avel-candidate-stat__label">Visible Candidates</span>
                <strong className="avel-candidate-stat__value">{data.meta.totalRows}</strong>
              </article>
              <article className="avel-candidate-stat">
                <span className="avel-candidate-stat__label">Hot Profiles</span>
                <strong className="avel-candidate-stat__value">{visibleHotCount}</strong>
              </article>
              <article className="avel-candidate-stat">
                <span className="avel-candidate-stat__label">Submitted</span>
                <strong className="avel-candidate-stat__value">{visibleSubmittedCount}</strong>
              </article>
              <article className="avel-candidate-stat">
                <span className="avel-candidate-stat__label">Possible Duplicates</span>
                <strong className="avel-candidate-stat__value">{visibleDuplicateCount}</strong>
              </article>
            </div>
          </section>

          <section className="avel-candidate-toolbar modern-command-bar modern-command-bar--sticky" aria-label="Candidates filters and controls">
            <div className="avel-candidate-toolbar__primary">
              <form
                className="modern-command-search avel-candidate-toolbar__search"
                onSubmit={(event) => {
                  event.preventDefault();
                  skipNextAutoSearchRef.current = true;
                  navigateWithFilters({ quickSearch: searchDraft, page: 1 });
                }}
              >
                <span className="modern-command-label">Search Talent</span>
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

            <div className="avel-candidate-toolbar__filters">
              <label className="modern-command-toggle">
                <input
                  type="checkbox"
                  checked={filters.onlyActiveCandidates}
                  onChange={(event) => navigateWithFilters({ onlyActiveCandidates: event.target.checked, page: 1 })}
                />
                <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                <span>Only Active</span>
              </label>

              <label className="modern-command-toggle">
                <input
                  type="checkbox"
                  checked={filters.onlyMyCandidates}
                  onChange={(event) => navigateWithFilters({ onlyMyCandidates: event.target.checked, page: 1 })}
                />
                <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                <span>My Candidates Only</span>
              </label>

              <details className="avel-candidate-more-filters" ref={moreFiltersRef} open={isMoreFiltersOpen}>
                <summary
                  className="avel-candidate-more-filters__summary"
                  aria-expanded={isMoreFiltersOpen}
                  onClick={(event) => {
                    event.preventDefault();
                    setIsMoreFiltersOpen((current) => !current);
                  }}
                >
                  More Filters
                </summary>
                <div className="avel-candidate-more-filters__panel">
                  <label className="modern-command-toggle">
                    <input
                      type="checkbox"
                      checked={filters.onlyHotCandidates}
                      onChange={(event) => {
                        setIsMoreFiltersOpen(false);
                        navigateWithFilters({ onlyHotCandidates: event.target.checked, page: 1 });
                      }}
                    />
                    <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                    <span>Hot Candidates</span>
                  </label>

                  <label className="modern-command-toggle">
                    <input
                      type="checkbox"
                      checked={filters.onlyGdprUnsigned}
                      onChange={(event) => {
                        setIsMoreFiltersOpen(false);
                        navigateWithFilters({ onlyGdprUnsigned: event.target.checked, page: 1 });
                      }}
                    />
                    <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                    <span>GDPR Not Signed</span>
                  </label>

                  <label className="modern-command-toggle">
                    <input
                      type="checkbox"
                      checked={filters.onlyInternalCandidates}
                      onChange={(event) => {
                        setIsMoreFiltersOpen(false);
                        navigateWithFilters({ onlyInternalCandidates: event.target.checked, page: 1 });
                      }}
                    />
                    <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                    <span>Internal Candidates</span>
                  </label>
                </div>
              </details>
            </div>

            <div className="avel-candidate-toolbar__compact-meta">
              <div className="avel-candidate-toolbar__focus" aria-label="Quick focus filters">
                <button
                  type="button"
                  className={`avel-candidate-focus-chip${localFocus === 'all' ? ' is-active' : ''}`}
                  onClick={() => setLocalFocus('all')}
                  aria-pressed={localFocus === 'all'}
                >
                  All <strong>{data.rows.length}</strong>
                </button>
                <button
                  type="button"
                  className={`avel-candidate-focus-chip${localFocus === 'hot' ? ' is-active' : ''}`}
                  onClick={() => setLocalFocus('hot')}
                  aria-pressed={localFocus === 'hot'}
                >
                  Hot <strong>{visibleHotCount}</strong>
                </button>
                <button
                  type="button"
                  className={`avel-candidate-focus-chip${localFocus === 'submitted' ? ' is-active' : ''}`}
                  onClick={() => setLocalFocus('submitted')}
                  aria-pressed={localFocus === 'submitted'}
                >
                  Submitted <strong>{visibleSubmittedCount}</strong>
                </button>
                <button
                  type="button"
                  className={`avel-candidate-focus-chip${localFocus === 'duplicates' ? ' is-active' : ''}`}
                  onClick={() => setLocalFocus('duplicates')}
                  aria-pressed={localFocus === 'duplicates'}
                >
                  Duplicates <strong>{visibleDuplicateCount}</strong>
                </button>
                <button
                  type="button"
                  className={`avel-candidate-focus-chip${localFocus === 'resume' ? ' is-active' : ''}`}
                  onClick={() => setLocalFocus('resume')}
                  aria-pressed={localFocus === 'resume'}
                >
                  Resume <strong>{visibleResumeCount}</strong>
                </button>
              </div>

              {hasActiveFilters ? (
                <div className="avel-candidate-toolbar__active">
                  <div className="modern-command-active__count is-active" aria-live="polite" aria-atomic="true">
                    {activeFilterLabels.length} active filter{activeFilterLabels.length === 1 ? '' : 's'}
                  </div>
                  <div className="modern-command-active__list">
                    {activeFilterLabels.map((label) => (
                      <span className="modern-active-filter modern-active-filter--server" key={label}>
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          {toDisplayText(data.state.topLog, '') !== '' ? (
            <div className="modern-state">{toDisplayText(data.state.topLog, '')}</div>
          ) : null}

          <section className="avel-list-panel avel-candidate-results">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">
                Candidates {data.meta.totalRows > 0 ? `(${data.meta.totalRows})` : ''}
              </h2>
              <p className="avel-list-panel__hint">
                Showing {visibleRows.length} of {data.rows.length} on this page
                {' | '}
                Sorted by {selectedSortLabel} ({selectedSortDirection === 'ASC' ? 'ascending' : 'descending'})
                {localFocus !== 'all' ? ` | focus: ${localFocus}` : ''}
              </p>
              <div className="avel-candidate-inline-sort" aria-label="Inline sort controls">
                <span className="avel-candidate-inline-sort__label">Sort</span>
                <div className="avel-candidate-inline-sort__chips" role="group" aria-label="Sort field">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`avel-candidate-inline-sort__chip${selectedSortBy === option.value ? ' is-active' : ''}`}
                      onClick={() => navigateWithFilters({ sortBy: option.value, page: 1 })}
                      aria-pressed={selectedSortBy === option.value}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="avel-candidate-inline-sort__direction"
                  onClick={() =>
                    navigateWithFilters({
                      sortDirection: selectedSortDirection === 'DESC' ? 'ASC' : 'DESC',
                      page: 1
                    })
                  }
                  aria-label={`Switch sort direction. Current: ${
                    selectedSortDirection === 'DESC' ? 'descending' : 'ascending'
                  }`}
                >
                  {selectedSortDirection === 'DESC' ? 'DESC' : 'ASC'}
                </button>
              </div>
              <div className="avel-candidates-pagination">
                <button
                  type="button"
                  className="modern-btn modern-btn--mini modern-btn--secondary"
                  disabled={!canGoPrev}
                  onClick={() => navigateWithFilters({ page: data.meta.page - 1 })}
                >
                  Prev
                </button>
                <span className="avel-candidates-pagination__label">
                  Page {data.meta.page} / {data.meta.totalPages}
                </span>
                <button
                  type="button"
                  className="modern-btn modern-btn--mini modern-btn--secondary"
                  disabled={!canGoNext}
                  onClick={() => navigateWithFilters({ page: data.meta.page + 1 })}
                >
                  Next
                </button>
              </div>
            </div>

            {!hasVisibleRows ? (
              <EmptyState
                message={
                  localFocus === 'all'
                    ? 'No candidates match current filters.'
                    : `No candidates match the "${localFocus}" focus on this page.`
                }
              />
            ) : (
              <DataTable
                columns={candidateTableColumns}
                hasRows={hasVisibleRows}
                emptyMessage="No candidates match current filters."
              >
                {visibleRows.map((row) => {
                  const locationParts = [row.city, row.country]
                    .map((value) => String(value || '').trim())
                    .filter((value) => value !== '');
                  const locationText = locationParts.length > 0 ? locationParts.join(', ') : '--';

                  return (
                    <tr key={row.candidateID}>
                      <td className="avel-candidate-table__candidate">
                        <div className="avel-candidate-table__title-row">
                          <a className="modern-link avel-candidate-table__name" href={ensureModernUIURL(row.candidateURL)}>
                            {toDisplayText(row.fullName)}
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
                      <td>
                        <span className={`modern-chip ${getSourceChipClass(row.source)}`}>{toDisplayText(row.source)}</span>
                      </td>
                      <td className="avel-candidate-table__skills">{toDisplayText(row.keySkills)}</td>
                      <td>
                        {row.isInPipeline ? (
                          <span className="modern-chip modern-chip--pipeline">
                            Allocated ({row.pipelineActiveCount})
                          </span>
                        ) : (
                          <span className="modern-chip modern-chip--pipeline-idle">Unassigned</span>
                        )}
                      </td>
                      <td>
                        {row.gdprSigned ? (
                          <span className="modern-chip modern-chip--gdpr-signed">Signed</span>
                        ) : (
                          <span className="modern-chip modern-chip--gdpr-unsigned">Not Signed</span>
                        )}
                      </td>
                      <td>{toDisplayText(row.ownerName)}</td>
                      <td>{toDisplayText(row.createdDate)}</td>
                      <td>{toDisplayText(row.modifiedDate)}</td>
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
              </DataTable>
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

