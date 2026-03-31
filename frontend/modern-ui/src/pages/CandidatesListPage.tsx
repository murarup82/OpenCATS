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

type CandidateRow = CandidatesListModernDataResponse['rows'][number];

type CandidateDataColumnKey =
  | 'candidate'
  | 'source'
  | 'skills'
  | 'pipeline'
  | 'gdpr'
  | 'owner'
  | 'created'
  | 'updated';

type CandidateColumnKey = CandidateDataColumnKey | 'actions';

type CandidateColumnConfig = {
  key: CandidateColumnKey;
  title: string;
  sortKey: string;
  filterable?: boolean;
};

type CandidateColumnVisibility = Record<CandidateDataColumnKey, boolean>;

const SEARCH_APPLY_DEBOUNCE_MS = 420;
const MULTI_FILTER_PREFIX = '__multi__:';

const CANDIDATE_COLUMNS: CandidateColumnConfig[] = [
  { key: 'candidate', title: 'Candidate', sortKey: 'lastName', filterable: true },
  { key: 'source', title: 'Source', sortKey: 'source', filterable: true },
  { key: 'skills', title: 'Key Skills', sortKey: '', filterable: true },
  { key: 'pipeline', title: 'Pipeline', sortKey: '', filterable: true },
  { key: 'gdpr', title: 'GDPR', sortKey: '', filterable: true },
  { key: 'owner', title: 'Owner', sortKey: 'ownerSort', filterable: true },
  { key: 'created', title: 'Added', sortKey: 'dateCreatedSort', filterable: true },
  { key: 'updated', title: 'Updated', sortKey: 'dateModifiedSort', filterable: true },
  { key: 'actions', title: 'Actions', sortKey: '' }
];

const DEFAULT_VISIBLE_COLUMNS: CandidateColumnVisibility = {
  candidate: true,
  source: true,
  skills: true,
  pipeline: true,
  gdpr: true,
  owner: true,
  created: true,
  updated: true
};

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

function getRowColumnValue(row: CandidateRow, key: CandidateDataColumnKey): string {
  switch (key) {
    case 'candidate': return String(row.fullName || '');
    case 'source': return String(row.source || '');
    case 'skills': return String(row.keySkills || '');
    case 'pipeline': return row.isInPipeline ? `Allocated (${row.pipelineActiveCount})` : 'Unassigned';
    case 'gdpr': return row.gdprSigned ? 'Signed' : 'Not Signed';
    case 'owner': return String(row.ownerName || '');
    case 'created': return String(row.createdDate || '');
    case 'updated': return String(row.modifiedDate || '');
    default: return '';
  }
}

const stripDiacritics = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '');

function normalizeFilterToken(value: string): string {
  return stripDiacritics(String(value || '').trim().toLowerCase());
}

function dedupeFilterValues(values: string[]): string[] {
  const uniqueValues = new Map<string, string>();
  values.forEach((value) => {
    const normalized = String(value || '').trim();
    if (normalized === '') {
      return;
    }
    const token = normalizeFilterToken(normalized);
    if (!uniqueValues.has(token)) {
      uniqueValues.set(token, normalized);
    }
  });
  return Array.from(uniqueValues.values());
}

function parseMultiFilterValues(rawValue: string): string[] | null {
  const normalized = String(rawValue || '').trim();
  if (!normalized.startsWith(MULTI_FILTER_PREFIX)) {
    return null;
  }
  const payload = normalized.slice(MULTI_FILTER_PREFIX.length).trim();
  if (payload === '') {
    return [];
  }
  try {
    const parsed = JSON.parse(payload) as unknown;
    if (!Array.isArray(parsed)) {
      return null;
    }
    return dedupeFilterValues(parsed.map((value) => String(value || '')));
  } catch (_error) {
    return null;
  }
}

function parseFilterSelection(rawValue: string): { values: string[]; isMulti: boolean } {
  const multiValues = parseMultiFilterValues(rawValue);
  if (multiValues !== null) {
    return { values: multiValues, isMulti: true };
  }

  const single = String(rawValue || '').trim();
  if (single === '') {
    return { values: [], isMulti: false };
  }
  return { values: [single], isMulti: false };
}

function encodeFilterSelection(values: string[]): string {
  const uniqueValues = dedupeFilterValues(values);
  if (uniqueValues.length === 0) {
    return '';
  }
  if (uniqueValues.length === 1) {
    return uniqueValues[0];
  }
  return `${MULTI_FILTER_PREFIX}${JSON.stringify(uniqueValues)}`;
}

function splitColumnFilterValues(columnKey: CandidateDataColumnKey, rawValue: string): string[] {
  const normalized = String(rawValue || '').trim();
  if (normalized === '') {
    return [];
  }

  if (columnKey === 'skills') {
    const splitValues = normalized
      .split(/[,;|/]+/g)
      .map((value) => value.trim())
      .filter((value) => value !== '');
    if (splitValues.length > 0) {
      return dedupeFilterValues(splitValues);
    }
  }

  return [normalized];
}

function emptyColumnFilters(): Record<CandidateDataColumnKey, string> {
  return {
    candidate: '',
    source: '',
    skills: '',
    pipeline: '',
    gdpr: '',
    owner: '',
    created: '',
    updated: ''
  };
}

function normalizeVisibleColumns(visibleColumns: unknown): CandidateColumnVisibility {
  const normalized: CandidateColumnVisibility = { ...DEFAULT_VISIBLE_COLUMNS };
  if (!visibleColumns || typeof visibleColumns !== 'object') {
    return normalized;
  }

  const payload = visibleColumns as Record<string, unknown>;
  (Object.keys(DEFAULT_VISIBLE_COLUMNS) as CandidateDataColumnKey[]).forEach((columnKey) => {
    if (Object.prototype.hasOwnProperty.call(payload, columnKey)) {
      normalized[columnKey] = Boolean(payload[columnKey]);
    }
  });

  return normalized;
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
  const [activeHeaderMenuColumn, setActiveHeaderMenuColumn] = useState<CandidateDataColumnKey | null>(null);
  const [headerMenuSearch, setHeaderMenuSearch] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<CandidateDataColumnKey, string>>(emptyColumnFilters());
  const [visibleColumns, setVisibleColumns] = useState<CandidateColumnVisibility>(DEFAULT_VISIBLE_COLUMNS);
  const [activeRowActionMenuCandidateID, setActiveRowActionMenuCandidateID] = useState<number | null>(null);
  const skipNextAutoSearchRef = useRef(false);
  const columnsMenuRef = useRef<HTMLDetailsElement | null>(null);
  const columnVisibilityStorageKey = useMemo(
    () => `opencats:modern:${bootstrap.siteID}:${bootstrap.userID}:candidates:list:columns:v1`,
    [bootstrap.siteID, bootstrap.userID]
  );

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
    try {
      const raw = window.localStorage.getItem(columnVisibilityStorageKey);
      if (!raw) {
        setVisibleColumns(DEFAULT_VISIBLE_COLUMNS);
        return;
      }

      const parsed = JSON.parse(raw) as { visibleColumns?: unknown };
      setVisibleColumns(normalizeVisibleColumns(parsed.visibleColumns));
    } catch (_error) {
      setVisibleColumns(DEFAULT_VISIBLE_COLUMNS);
    }
  }, [columnVisibilityStorageKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        columnVisibilityStorageKey,
        JSON.stringify({
          visibleColumns
        })
      );
    } catch (_error) {
      // Ignore persistence issues.
    }
  }, [columnVisibilityStorageKey, visibleColumns]);

  useEffect(() => {
    setHeaderMenuSearch('');
  }, [activeHeaderMenuColumn]);

  useEffect(() => {
    const closeColumnsMenu = () => {
      if (columnsMenuRef.current?.open) {
        columnsMenuRef.current.removeAttribute('open');
      }
    };

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const targetNode = event.target as Node | null;
      const element = targetNode instanceof Element ? targetNode : null;

      if (columnsMenuRef.current && targetNode && !columnsMenuRef.current.contains(targetNode)) {
        closeColumnsMenu();
      }

      if (
        activeHeaderMenuColumn !== null &&
        !element?.closest('.avel-candidates-header-menu') &&
        !element?.closest('.avel-candidates-results__th-title')
      ) {
        setActiveHeaderMenuColumn(null);
      }

      if (activeRowActionMenuCandidateID !== null && !element?.closest('.avel-candidate-row-menu')) {
        setActiveRowActionMenuCandidateID(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeColumnsMenu();
        setActiveHeaderMenuColumn(null);
        setActiveRowActionMenuCandidateID(null);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown, { passive: true });
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [activeHeaderMenuColumn, activeRowActionMenuCandidateID]);

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

  const setColumnFilterSelection = useCallback((columnKey: CandidateDataColumnKey, values: string[]) => {
    const encoded = encodeFilterSelection(values);
    setColumnFilters((current) => ({
      ...current,
      [columnKey]: encoded
    }));
  }, []);

  const toggleColumnFilterValue = useCallback(
    (columnKey: CandidateDataColumnKey, value: string, checked: boolean) => {
      const normalizedValue = String(value || '').trim();
      if (normalizedValue === '') {
        return;
      }

      setColumnFilters((current) => {
        const existing = parseFilterSelection(current[columnKey] || '').values;
        const nextMap = new Map(existing.map((entry) => [normalizeFilterToken(entry), entry]));
        const token = normalizeFilterToken(normalizedValue);
        if (checked) {
          nextMap.set(token, normalizedValue);
        } else {
          nextMap.delete(token);
        }
        return {
          ...current,
          [columnKey]: encodeFilterSelection(Array.from(nextMap.values()))
        };
      });
    },
    []
  );

  const visibleColumnOrder = useMemo(() => {
    const columns = (Object.keys(DEFAULT_VISIBLE_COLUMNS) as CandidateDataColumnKey[]).filter(
      (columnKey) => visibleColumns[columnKey]
    );
    return columns.length > 0 ? columns : ['candidate'];
  }, [visibleColumns]);

  const visibleTableColumns = useMemo(() => {
    const visibleDataColumns = visibleColumnOrder
      .map((columnKey) => CANDIDATE_COLUMNS.find((column) => column.key === columnKey) || null)
      .filter((column): column is CandidateColumnConfig => column !== null);
    const actionsColumn = CANDIDATE_COLUMNS.find((column) => column.key === 'actions');
    return actionsColumn ? [...visibleDataColumns, actionsColumn] : visibleDataColumns;
  }, [visibleColumnOrder]);

  const columnFilterOptions = useMemo(() => {
    const options = emptyColumnFilters() as unknown as Record<CandidateDataColumnKey, string[]>;
    if (!data) {
      return options;
    }

    (Object.keys(options) as CandidateDataColumnKey[]).forEach((columnKey) => {
      const values = new Map<string, string>();
      data.rows.forEach((row) => {
        const rowValues = splitColumnFilterValues(columnKey, getRowColumnValue(row, columnKey));
        rowValues.forEach((rowValue) => {
          const token = normalizeFilterToken(rowValue);
          if (token === '') {
            return;
          }
          if (!values.has(token)) {
            values.set(token, rowValue);
          }
        });
      });
      options[columnKey] = Array.from(values.values()).sort((left, right) =>
        left.localeCompare(right, undefined, { sensitivity: 'base', numeric: true })
      );
    });

    return options;
  }, [data]);

  const columnFilterOptionTokens = useMemo(() => {
    return (Object.keys(emptyColumnFilters()) as CandidateDataColumnKey[]).reduce(
      (accumulator, columnKey) => {
        accumulator[columnKey] = new Set(columnFilterOptions[columnKey].map((value) => normalizeFilterToken(value)));
        return accumulator;
      },
      {} as Record<CandidateDataColumnKey, Set<string>>
    );
  }, [columnFilterOptions]);

  const filteredRows = useMemo(() => {
    if (!data) return [];
    return data.rows.filter((row) =>
      (Object.keys(columnFilters) as CandidateDataColumnKey[]).every((columnKey) => {
        const selection = parseFilterSelection(columnFilters[columnKey] || '');
        const selectedTokens = selection.values
          .map((value) => normalizeFilterToken(value))
          .filter((value) => value !== '');
        if (selectedTokens.length === 0) {
          return true;
        }

        const rowTokens = splitColumnFilterValues(columnKey, getRowColumnValue(row, columnKey))
          .map((value) => normalizeFilterToken(value))
          .filter((value) => value !== '');

        if (selection.isMulti) {
          return selectedTokens.some((token) => rowTokens.includes(token));
        }

        const filterText = selectedTokens[0];
        const rowValue = normalizeFilterToken(getRowColumnValue(row, columnKey));
        if (columnFilterOptionTokens[columnKey].has(filterText)) {
          return rowTokens.includes(filterText);
        }
        return rowValue.includes(filterText);
      })
    );
  }, [columnFilterOptionTokens, columnFilters, data]);

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
  const activeColumnFilterCount = (Object.keys(columnFilters) as CandidateDataColumnKey[]).filter(
    (columnKey) => (columnFilters[columnKey] || '').trim() !== ''
  ).length;

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
                  setColumnFilters(emptyColumnFilters());
                  setActiveHeaderMenuColumn(null);
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
                  {activeFilterLabels.length} active filter{activeFilterLabels.length === 1 ? '' : 's'}
                </span>
                {activeFilterLabels.map((label) => (
                  <span className="modern-active-filter modern-active-filter--server" key={label}>
                    {label}
                  </span>
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
                  {activeColumnFilterCount > 0 ? ` (${filteredRows.length} matching column filters)` : ''}
                </p>
              </div>
              <div className="avel-candidate-results__header-right">
                {activeColumnFilterCount > 0 ? (
                  <button
                    type="button"
                    className="modern-chip modern-chip--info avel-dashboard-list__clear-btn"
                    onClick={() => {
                      setColumnFilters(emptyColumnFilters());
                      setActiveHeaderMenuColumn(null);
                    }}
                    title="Clear all column filters"
                  >
                    Filters: {activeColumnFilterCount} ×
                  </button>
                ) : null}
                <details className="avel-pipeline-matrix__columns-menu" ref={columnsMenuRef}>
                  <summary className="modern-chip modern-chip--column-toggle">Columns</summary>
                  <div className="avel-pipeline-matrix__columns-panel">
                    {(Object.keys(DEFAULT_VISIBLE_COLUMNS) as CandidateDataColumnKey[]).map((columnKey) => {
                      const column = CANDIDATE_COLUMNS.find((entry) => entry.key === columnKey);
                      if (!column) {
                        return null;
                      }

                      return (
                        <div key={`column-${columnKey}`} className="avel-pipeline-matrix__column-item">
                          <label className="avel-pipeline-matrix__column-toggle">
                            <input
                              type="checkbox"
                              checked={visibleColumns[columnKey]}
                              onChange={() =>
                                setVisibleColumns((current) => {
                                  const visibleCount = (Object.keys(current) as CandidateDataColumnKey[]).reduce(
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
                            <span>{column.title}</span>
                          </label>
                        </div>
                      );
                    })}
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
            </div>

            {!hasVisibleRows ? (
              <EmptyState message="No candidates match current filters." />
            ) : (
              <div className="modern-table-wrap avel-candidate-results__table-wrap">
                <table className="modern-table avel-candidate-results__table">
                  <thead>
                    <tr>
                      {visibleTableColumns.map((col) => {
                        const isSorted = col.sortKey !== '' && data.meta.sortBy === col.sortKey;
                        const columnKey = col.key === 'actions' ? null : col.key;
                        const isFilterable = col.filterable === true && columnKey !== null;
                        const isFilterOpen = columnKey !== null && activeHeaderMenuColumn === columnKey;
                        const activeSelection =
                          columnKey !== null
                            ? parseFilterSelection(columnFilters[columnKey] || '')
                            : { values: [], isMulti: false };
                        const selectedTokens = new Set(activeSelection.values.map((value) => normalizeFilterToken(value)));
                        const allOptions = columnKey !== null ? columnFilterOptions[columnKey] : [];
                        const searchToken = normalizeFilterToken(headerMenuSearch);
                        const visibleOptions =
                          searchToken === ''
                            ? allOptions
                            : allOptions.filter((value) => normalizeFilterToken(value).includes(searchToken));
                        const selectedUnknownValues =
                          columnKey !== null
                            ? activeSelection.values.filter(
                                (value) => !columnFilterOptionTokens[columnKey].has(normalizeFilterToken(value))
                              )
                            : [];
                        const renderedOptions = dedupeFilterValues([...selectedUnknownValues, ...visibleOptions]);

                        return (
                          <th key={col.key} className={isFilterOpen ? 'avel-col-filter--active' : ''}>
                            <div className="avel-pipeline-matrix__th-shell">
                              {columnKey !== null ? (
                                <button
                                  type="button"
                                  className="avel-candidates-results__th-title"
                                  onClick={() => setActiveHeaderMenuColumn((current) => (current === columnKey ? null : columnKey))}
                                  aria-expanded={isFilterOpen}
                                >
                                  {col.title}
                                  {isSorted ? (
                                    <span className="avel-col-header__arrow" aria-hidden="true">
                                      {data.meta.sortDirection === 'ASC' ? ' ▲' : ' ▼'}
                                    </span>
                                  ) : null}
                                </button>
                              ) : (
                                <span className="avel-col-header__label">{col.title}</span>
                              )}
                              {columnKey !== null && (columnFilters[columnKey] || '').trim() !== '' ? (
                                <span className="modern-chip modern-chip--info">Filtered</span>
                              ) : null}
                            </div>
                            {isFilterable && isFilterOpen ? (
                              <div className="avel-candidates-header-menu">
                                <label>
                                  Search values
                                  <input
                                    type="text"
                                    value={headerMenuSearch}
                                    onChange={(event) => setHeaderMenuSearch(event.target.value)}
                                    placeholder={`Find ${col.title}`}
                                    autoFocus
                                  />
                                </label>
                                <div className="avel-candidates-header-menu__options">
                                  {renderedOptions.length === 0 ? (
                                    <div className="avel-candidates-header-menu__empty">No matching values.</div>
                                  ) : (
                                    renderedOptions.map((optionValue) => {
                                      const token = normalizeFilterToken(optionValue);
                                      return (
                                        <label
                                          key={`filter-${col.key}-${optionValue}`}
                                          className="avel-pipeline-matrix__header-menu-option"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={selectedTokens.has(token)}
                                            onChange={(event) =>
                                              toggleColumnFilterValue(columnKey, optionValue, event.target.checked)
                                            }
                                          />
                                          {columnKey === 'source' ? (
                                            <span className={`modern-chip ${getSourceChipClass(optionValue)}`}>{optionValue}</span>
                                          ) : columnKey === 'pipeline' ? (
                                            <span className={`modern-chip ${optionValue === 'Unassigned' ? 'modern-chip--pipeline-idle' : 'modern-chip--pipeline'}`}>
                                              {optionValue}
                                            </span>
                                          ) : columnKey === 'gdpr' ? (
                                            <span className={`modern-chip ${optionValue === 'Signed' ? 'modern-chip--gdpr-signed' : 'modern-chip--gdpr-unsigned'}`}>
                                              {optionValue}
                                            </span>
                                          ) : (
                                            <span>{optionValue}</span>
                                          )}
                                        </label>
                                      );
                                    })
                                  )}
                                </div>
                                <div className="avel-candidates-header-menu__actions">
                                  <button
                                    type="button"
                                    onClick={() => setColumnFilterSelection(columnKey, renderedOptions)}
                                    disabled={renderedOptions.length === 0}
                                  >
                                    Select Visible
                                  </button>
                                  <button type="button" onClick={() => setColumnFilterSelection(columnKey, [])}>
                                    Clear
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => navigateWithFilters({ sortBy: col.sortKey, sortDirection: 'ASC', page: 1 })}
                                    disabled={col.sortKey === ''}
                                  >
                                    Sort A-Z
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => navigateWithFilters({ sortBy: col.sortKey, sortDirection: 'DESC', page: 1 })}
                                    disabled={col.sortKey === ''}
                                  >
                                    Sort Z-A
                                  </button>
                                </div>
                              </div>
                            ) : null}
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
                          {visibleTableColumns.map((column) => {
                            switch (column.key) {
                              case 'candidate':
                                return (
                                  <td key={`${row.candidateID}-candidate`} className="avel-candidate-table__candidate">
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
                                );
                              case 'source':
                                return (
                                  <td key={`${row.candidateID}-source`}>
                                    <span className={`modern-chip ${getSourceChipClass(row.source)}`}>{toDisplayText(row.source)}</span>
                                  </td>
                                );
                              case 'skills':
                                return <td key={`${row.candidateID}-skills`} className="avel-candidate-table__skills">{toDisplayText(row.keySkills)}</td>;
                              case 'pipeline':
                                return (
                                  <td key={`${row.candidateID}-pipeline`}>
                                    {row.isInPipeline ? (
                                      <span className="modern-chip modern-chip--pipeline">
                                        Allocated ({row.pipelineActiveCount})
                                      </span>
                                    ) : (
                                      <span className="modern-chip modern-chip--pipeline-idle">Unassigned</span>
                                    )}
                                  </td>
                                );
                              case 'gdpr':
                                return (
                                  <td key={`${row.candidateID}-gdpr`}>
                                    {row.gdprSigned ? (
                                      <span className="modern-chip modern-chip--gdpr-signed">Signed</span>
                                    ) : (
                                      <span className="modern-chip modern-chip--gdpr-unsigned">Not Signed</span>
                                    )}
                                  </td>
                                );
                              case 'owner':
                                return <td key={`${row.candidateID}-owner`}>{toDisplayText(row.ownerName)}</td>;
                              case 'created':
                                return <td key={`${row.candidateID}-created`}>{toDisplayText(row.createdDate)}</td>;
                              case 'updated':
                                return <td key={`${row.candidateID}-updated`}>{toDisplayText(row.modifiedDate)}</td>;
                              case 'actions':
                                if (!canAddToJobOrder && !canEditCandidate && !canAddToList) {
                                  return <td key={`${row.candidateID}-actions`}><span className="avel-candidate-row-menu__empty">—</span></td>;
                                }

                                return (
                                  <td key={`${row.candidateID}-actions`} className="avel-candidate-row-menu-cell">
                                    <div className="avel-candidate-row-menu">
                                      <button
                                        type="button"
                                        className="avel-candidate-row-menu__trigger"
                                        onClick={() =>
                                          setActiveRowActionMenuCandidateID((current) =>
                                            current === row.candidateID ? null : row.candidateID
                                          )
                                        }
                                        aria-label={`Open actions for ${toDisplayText(row.fullName, 'candidate')}`}
                                        aria-expanded={activeRowActionMenuCandidateID === row.candidateID}
                                      >
                                        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                                          <circle cx="8" cy="3" r="1.25" fill="currentColor" />
                                          <circle cx="8" cy="8" r="1.25" fill="currentColor" />
                                          <circle cx="8" cy="13" r="1.25" fill="currentColor" />
                                        </svg>
                                      </button>
                                      {activeRowActionMenuCandidateID === row.candidateID ? (
                                        <div className="avel-candidate-row-menu__panel" role="menu" aria-label="Candidate actions">
                                          {canAddToJobOrder ? (
                                            <button
                                              type="button"
                                              className="avel-candidate-row-menu__item"
                                              role="menuitem"
                                              onClick={() => {
                                                setActiveRowActionMenuCandidateID(null);
                                                setAssignJobModal({
                                                  url: decodeLegacyURL(row.addToJobOrderURL),
                                                  title: `Add To Job Order: ${toDisplayText(row.fullName, 'Candidate')}`
                                                });
                                              }}
                                            >
                                              Add To Job
                                            </button>
                                          ) : null}
                                          {canEditCandidate ? (
                                            <a
                                              className="avel-candidate-row-menu__item"
                                              role="menuitem"
                                              href={ensureModernUIURL(row.candidateEditURL)}
                                              onClick={() => setActiveRowActionMenuCandidateID(null)}
                                            >
                                              Edit
                                            </a>
                                          ) : null}
                                          {canAddToList ? (
                                            <button
                                              type="button"
                                              className="avel-candidate-row-menu__item"
                                              role="menuitem"
                                              onClick={() => {
                                                setActiveRowActionMenuCandidateID(null);
                                                openAddToListOverlay(row.addToListURL);
                                              }}
                                            >
                                              Add To List
                                            </button>
                                          ) : null}
                                        </div>
                                      ) : null}
                                    </div>
                                  </td>
                                );
                              default:
                                return null;
                            }
                          })}
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
