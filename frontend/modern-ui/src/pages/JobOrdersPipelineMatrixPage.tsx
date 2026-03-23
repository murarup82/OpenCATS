import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  deleteJobOrdersPipelineMatrixView,
  fetchJobOrdersPipelineMatrixModernData,
  saveJobOrdersPipelineMatrixView
} from '../lib/api';
import type {
  JobOrdersPipelineMatrixModernDataResponse,
  JobOrdersPipelineMatrixSavedView,
  UIModeBootstrap
} from '../types';
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

type MatrixServerFilters = {
  search: string;
  ownerUserID: number;
  recruiterUserID: number;
  pipelineStatusID: number;
  includeClosed: boolean;
  maxResults: number;
};

type MatrixView = {
  id: string;
  name: string;
  columnOrder: ColumnKey[];
  visibleColumns: Record<ColumnKey, boolean>;
  columnFilters: Record<ColumnKey, string>;
  sortBy: ColumnKey;
  sortDirection: SortDirection;
  serverFilters: MatrixServerFilters;
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

const COLUMN_KEYS: ColumnKey[] = [
  'candidate',
  'jobOrder',
  'company',
  'source',
  'keySkills',
  'pipeline',
  'owner',
  'recruiter',
  'location',
  'gdpr',
  'dateAdded',
  'lastActivity'
];

const MULTI_FILTER_PREFIX = '__multi__:';

function toInteger(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
}

function toDisplayText(value: unknown, fallback = '--'): string {
  const normalized = String(value || '').trim();
  return normalized === '' ? fallback : normalized;
}

function normalizeFilterToken(value: string): string {
  return String(value || '').trim().toLowerCase();
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

function splitColumnFilterValues(columnKey: ColumnKey, rawValue: string): string[] {
  const normalized = String(rawValue || '').trim();
  if (normalized === '') {
    return [];
  }

  if (columnKey === 'keySkills') {
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

function normalizeColumnOrder(columnOrder: unknown): ColumnKey[] {
  if (!Array.isArray(columnOrder)) {
    return [...DEFAULT_ORDER];
  }

  const nextOrder: ColumnKey[] = [];
  columnOrder.forEach((columnName) => {
    const normalized = String(columnName || '').trim() as ColumnKey;
    if (!COLUMN_KEYS.includes(normalized)) {
      return;
    }
    if (nextOrder.includes(normalized)) {
      return;
    }
    nextOrder.push(normalized);
  });

  DEFAULT_ORDER.forEach((columnName) => {
    if (!nextOrder.includes(columnName)) {
      nextOrder.push(columnName);
    }
  });

  return nextOrder.length > 0 ? nextOrder : [...DEFAULT_ORDER];
}

function normalizeVisibleColumns(visibleColumns: unknown): Record<ColumnKey, boolean> {
  const normalized: Record<ColumnKey, boolean> = { ...DEFAULT_VISIBLE };
  if (!visibleColumns || typeof visibleColumns !== 'object') {
    return normalized;
  }

  const payload = visibleColumns as Record<string, unknown>;
  COLUMN_KEYS.forEach((columnName) => {
    if (Object.prototype.hasOwnProperty.call(payload, columnName)) {
      normalized[columnName] = Boolean(payload[columnName]);
    }
  });

  return normalized;
}

function normalizeColumnFilters(columnFilters: unknown): Record<ColumnKey, string> {
  const normalized = emptyFilters();
  if (!columnFilters || typeof columnFilters !== 'object') {
    return normalized;
  }

  const payload = columnFilters as Record<string, unknown>;
  COLUMN_KEYS.forEach((columnName) => {
    if (Object.prototype.hasOwnProperty.call(payload, columnName)) {
      normalized[columnName] = String(payload[columnName] || '');
    }
  });

  return normalized;
}

function normalizeSortBy(sortBy: unknown): ColumnKey {
  const normalized = String(sortBy || '').trim() as ColumnKey;
  return COLUMN_KEYS.includes(normalized) ? normalized : 'lastActivity';
}

function normalizeSortDirection(sortDirection: unknown): SortDirection {
  return String(sortDirection || '').toLowerCase() === 'asc' ? 'asc' : 'desc';
}

function normalizeServerFilters(serverFilters: unknown): MatrixServerFilters {
  const defaults: MatrixServerFilters = {
    search: '',
    ownerUserID: 0,
    recruiterUserID: -2,
    pipelineStatusID: -2,
    includeClosed: false,
    maxResults: 100
  };

  if (!serverFilters || typeof serverFilters !== 'object') {
    return defaults;
  }

  const payload = serverFilters as Record<string, unknown>;
  const nextOwnerUserID = toInteger(payload.ownerUserID, defaults.ownerUserID);
  const nextRecruiterUserID = toInteger(payload.recruiterUserID, defaults.recruiterUserID);
  const nextPipelineStatusID = toInteger(payload.pipelineStatusID, defaults.pipelineStatusID);
  const nextMaxResults = toInteger(payload.maxResults, defaults.maxResults);

  return {
    search: String(payload.search || '').trim(),
    ownerUserID: nextOwnerUserID >= 0 ? nextOwnerUserID : defaults.ownerUserID,
    recruiterUserID: nextRecruiterUserID >= -2 ? nextRecruiterUserID : defaults.recruiterUserID,
    pipelineStatusID: nextPipelineStatusID >= -2 ? nextPipelineStatusID : defaults.pipelineStatusID,
    includeClosed: Boolean(payload.includeClosed),
    maxResults: [50, 100, 200].includes(nextMaxResults) ? nextMaxResults : defaults.maxResults
  };
}

function emptyColumnOptions(): Record<ColumnKey, string[]> {
  return {
    candidate: [],
    jobOrder: [],
    company: [],
    source: [],
    keySkills: [],
    pipeline: [],
    owner: [],
    recruiter: [],
    location: [],
    gdpr: [],
    dateAdded: [],
    lastActivity: []
  };
}

function normalizeSavedViews(savedViews: JobOrdersPipelineMatrixSavedView[] | undefined): MatrixView[] {
  if (!Array.isArray(savedViews)) {
    return [];
  }

  const payload: MatrixView[] = [];
  savedViews.forEach((view) => {
    const viewID = Number(view?.viewID || 0);
    const viewName = String(view?.name || '').trim();
    if (!Number.isFinite(viewID) || viewID <= 0 || viewName === '') {
      return;
    }

    payload.push({
      id: String(viewID),
      name: viewName,
      columnOrder: normalizeColumnOrder(view?.config?.columnOrder),
      visibleColumns: normalizeVisibleColumns(view?.config?.visibleColumns),
      columnFilters: normalizeColumnFilters(view?.config?.columnFilters),
      sortBy: normalizeSortBy(view?.config?.sortBy),
      sortDirection: normalizeSortDirection(view?.config?.sortDirection),
      serverFilters: normalizeServerFilters(view?.config?.serverFilters)
    });
  });

  return payload;
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
  const [headerMenuSearch, setHeaderMenuSearch] = useState('');
  const [savedViews, setSavedViews] = useState<MatrixView[]>([]);
  const [activeViewID, setActiveViewID] = useState('default');
  const [viewNameDraft, setViewNameDraft] = useState('');
  const [viewMutationBusy, setViewMutationBusy] = useState(false);
  const [viewMutationError, setViewMutationError] = useState('');
  const [viewMutationNotice, setViewMutationNotice] = useState('');
  const columnsMenuRef = useRef<HTMLDetailsElement | null>(null);

  const { serverQueryString, applyServerQuery } = useServerQueryState(bootstrap.indexName);
  const storageKey = useMemo(
    () => `opencats:modern:${bootstrap.siteID}:${bootstrap.userID}:joborders:pipeline-matrix:v2`,
    [bootstrap.siteID, bootstrap.userID]
  );

  const applyDefaultLayout = useCallback(() => {
    setColumnOrder([...DEFAULT_ORDER]);
    setVisibleColumns({ ...DEFAULT_VISIBLE });
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
        setSavedViews(normalizeSavedViews(result.savedViews));
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
        activeViewID?: string;
        working?: {
          columnOrder?: unknown;
          visibleColumns?: unknown;
          columnFilters?: unknown;
          sortBy?: unknown;
          sortDirection?: unknown;
        };
      };
      if (payload.activeViewID) {
        setActiveViewID(payload.activeViewID);
      }
      if (payload.working) {
        setColumnOrder(normalizeColumnOrder(payload.working.columnOrder));
        setVisibleColumns(normalizeVisibleColumns(payload.working.visibleColumns));
        setColumnFilters(normalizeColumnFilters(payload.working.columnFilters));
        setSortBy(normalizeSortBy(payload.working.sortBy));
        setSortDirection(normalizeSortDirection(payload.working.sortDirection));
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
  }, [activeViewID, columnFilters, columnOrder, sortBy, sortDirection, storageKey, visibleColumns]);

  useEffect(() => {
    if (activeViewID === 'default') {
      return;
    }

    const nextView = savedViews.find((entry) => entry.id === activeViewID);
    if (!nextView) {
      setActiveViewID('default');
      setViewNameDraft('');
      return;
    }

    if (viewNameDraft.trim() === '') {
      setViewNameDraft(nextView.name);
    }
  }, [activeViewID, savedViews, viewNameDraft]);

  useEffect(() => {
    setHeaderMenuSearch('');
  }, [activeHeaderMenuColumn]);

  useEffect(() => {
    const closeColumnsMenu = () => {
      if (columnsMenuRef.current?.open) {
        columnsMenuRef.current.removeAttribute('open');
      }
    };

    const closeHeaderMenu = () => {
      setActiveHeaderMenuColumn(null);
    };

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const targetNode = event.target as Node | null;
      const targetElement = targetNode instanceof Element ? targetNode : null;

      if (columnsMenuRef.current && targetNode && !columnsMenuRef.current.contains(targetNode)) {
        closeColumnsMenu();
      }

      if (activeHeaderMenuColumn !== null) {
        const clickedHeaderMenu = targetElement?.closest('.avel-pipeline-matrix__header-menu');
        const clickedHeaderToggle = targetElement?.closest('.avel-pipeline-matrix__th-title');
        if (!clickedHeaderMenu && !clickedHeaderToggle) {
          closeHeaderMenu();
        }
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeColumnsMenu();
        closeHeaderMenu();
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
  }, [activeHeaderMenuColumn]);

  const applyServerFilters = useCallback(
    (next: {
      search?: string;
      ownerUserID?: number;
      recruiterUserID?: number;
      pipelineStatusID?: number;
      includeClosed?: boolean;
      page?: number;
      maxResults?: number;
      sortBy?: ColumnKey;
      sortDirection?: SortDirection;
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
      const nextSortBy = next.sortBy ?? sortBy;
      const nextSortDirection = next.sortDirection ?? sortDirection;
      query.set('sortBy', nextSortBy);
      query.set('sortDirection', nextSortDirection === 'asc' ? 'ASC' : 'DESC');
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

  const getColumnFilterTokens = useCallback(
    (row: JobOrdersPipelineMatrixModernDataResponse['rows'][number], columnKey: ColumnKey): string[] => {
      return splitColumnFilterValues(columnKey, getColumnValue(row, columnKey))
        .map((value) => normalizeFilterToken(value))
        .filter((value) => value !== '');
    },
    [getColumnValue]
  );

  const setColumnFilterSelection = useCallback((columnKey: ColumnKey, values: string[]) => {
    const encoded = encodeFilterSelection(values);
    setColumnFilters((current) => ({
      ...current,
      [columnKey]: encoded
    }));
  }, []);

  const toggleColumnFilterValue = useCallback(
    (columnKey: ColumnKey, value: string, checked: boolean) => {
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
    const columns = columnOrder.filter((columnKey) => visibleColumns[columnKey]);
    return columns.length > 0 ? columns : ['jobOrder'];
  }, [columnOrder, visibleColumns]);

  const columnFilterOptions = useMemo(() => {
    const options = emptyColumnOptions();
    if (!data) {
      return options;
    }

    COLUMN_KEYS.forEach((columnKey) => {
      const values = new Map<string, string>();
      data.rows.forEach((row) => {
        const rowValues = splitColumnFilterValues(columnKey, getColumnValue(row, columnKey));
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
  }, [data, getColumnValue]);

  const columnFilterOptionTokens = useMemo(() => {
    return COLUMN_KEYS.reduce(
      (accumulator, columnKey) => {
        accumulator[columnKey] = new Set(columnFilterOptions[columnKey].map((value) => normalizeFilterToken(value)));
        return accumulator;
      },
      {} as Record<ColumnKey, Set<string>>
    );
  }, [columnFilterOptions]);

  const filteredRows = useMemo(() => {
    if (!data) {
      return [];
    }
    const rows = data.rows.filter((row) =>
      (Object.keys(columnFilters) as ColumnKey[]).every((columnKey) => {
        const selection = parseFilterSelection(columnFilters[columnKey] || '');
        const selectedTokens = selection.values
          .map((value) => normalizeFilterToken(value))
          .filter((value) => value !== '');
        if (selectedTokens.length === 0) {
          return true;
        }

        const rowTokens = getColumnFilterTokens(row, columnKey);
        if (selection.isMulti) {
          return selectedTokens.some((token) => rowTokens.includes(token));
        }

        const filterText = selectedTokens[0];
        const rowValue = normalizeFilterToken(getColumnValue(row, columnKey));
        if (columnFilterOptionTokens[columnKey].has(filterText)) {
          return rowTokens.includes(filterText);
        }
        return rowValue.includes(filterText);
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
  }, [columnFilterOptionTokens, columnFilters, data, getColumnFilterTokens, getColumnValue, sortBy, sortDirection]);

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
  const canPersistViews =
    String(data.actions.saveViewURL || '').trim() !== '' && String(data.actions.deleteViewURL || '').trim() !== '';
  const activeColumnFilterCount = (Object.keys(columnFilters) as ColumnKey[]).filter(
    (columnKey) => (columnFilters[columnKey] || '').trim() !== ''
  ).length;

  const saveCurrentView = async () => {
    if (!data) {
      return;
    }

    const submitURL = String(data.actions.saveViewURL || '').trim();
    if (submitURL === '') {
      setViewMutationError('Saved views endpoint is unavailable.');
      return;
    }

    const viewName = viewNameDraft.trim() === '' ? `View ${savedViews.length + 1}` : viewNameDraft.trim();
    const viewID = activeViewID === 'default' ? 0 : toInteger(activeViewID, 0);

    setViewMutationBusy(true);
    setViewMutationError('');
    setViewMutationNotice('');

    try {
      const response = await saveJobOrdersPipelineMatrixView(submitURL, {
        viewID: viewID > 0 ? viewID : undefined,
        viewName,
        viewConfig: {
          columnOrder,
          visibleColumns,
          columnFilters,
          sortBy,
          sortDirection,
          serverFilters: {
            search: String(data.filters.search || '').trim(),
            ownerUserID: Number(data.filters.ownerUserID || 0),
            recruiterUserID: Number(data.filters.recruiterUserID || -2),
            pipelineStatusID: Number(data.filters.pipelineStatusID || -2),
            includeClosed: Boolean(data.filters.includeClosed),
            maxResults: Number(data.meta.entriesPerPage || 100)
          }
        }
      });

      if (!response.success) {
        setViewMutationError(response.message || 'Unable to save view.');
        return;
      }

      const nextSavedViews = normalizeSavedViews(response.views);
      setSavedViews(nextSavedViews);

      const persistedViewID = Number(response.viewID || viewID || 0);
      if (persistedViewID > 0) {
        const nextID = String(persistedViewID);
        setActiveViewID(nextID);
        const persistedView = nextSavedViews.find((entry) => entry.id === nextID);
        setViewNameDraft(persistedView ? persistedView.name : viewName);
      } else {
        setViewNameDraft(viewName);
      }

      setViewMutationNotice(response.message || 'View saved.');
    } catch (err: unknown) {
      setViewMutationError(err instanceof Error ? err.message : 'Unable to save view.');
    } finally {
      setViewMutationBusy(false);
    }
  };

  const deleteCurrentView = async () => {
    if (!data || activeViewID === 'default') {
      return;
    }

    const submitURL = String(data.actions.deleteViewURL || '').trim();
    if (submitURL === '') {
      setViewMutationError('Delete view endpoint is unavailable.');
      return;
    }

    const viewID = toInteger(activeViewID, 0);
    if (viewID <= 0) {
      setViewMutationError('Invalid view selection.');
      return;
    }

    setViewMutationBusy(true);
    setViewMutationError('');
    setViewMutationNotice('');

    try {
      const response = await deleteJobOrdersPipelineMatrixView(submitURL, viewID);
      if (!response.success) {
        setViewMutationError(response.message || 'Unable to delete view.');
        return;
      }

      setSavedViews(normalizeSavedViews(response.views));
      setActiveViewID('default');
      setViewNameDraft('');
      applyDefaultLayout();
      setViewMutationNotice(response.message || 'View deleted.');
    } catch (err: unknown) {
      setViewMutationError(err instanceof Error ? err.message : 'Unable to delete view.');
    } finally {
      setViewMutationBusy(false);
    }
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

  const applySavedView = (view: MatrixView) => {
    setViewNameDraft(view.name);
    setColumnOrder(view.columnOrder);
    setVisibleColumns(view.visibleColumns);
    setColumnFilters(view.columnFilters);
    setSortBy(view.sortBy);
    setSortDirection(view.sortDirection);
    setSearchDraft(view.serverFilters.search);
    applyServerFilters({
      search: view.serverFilters.search,
      ownerUserID: view.serverFilters.ownerUserID,
      recruiterUserID: view.serverFilters.recruiterUserID,
      pipelineStatusID: view.serverFilters.pipelineStatusID,
      includeClosed: view.serverFilters.includeClosed,
      maxResults: view.serverFilters.maxResults,
      page: 1,
      sortBy: view.sortBy,
      sortDirection: view.sortDirection
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
              <div className="modern-table-actions"><button type="button" className="modern-btn modern-btn--secondary" onClick={() => applyServerFilters({ search: searchDraft, page: 1 })}>Apply</button><button type="button" className="modern-btn modern-btn--secondary" onClick={() => { setSearchDraft(''); setColumnFilters(emptyFilters()); setActiveHeaderMenuColumn(null); applyServerFilters({ search: '', ownerUserID: 0, recruiterUserID: -2, pipelineStatusID: -2, includeClosed: false, page: 1 }); }}>Reset Filters</button></div>
            </div>

            <div className="modern-command-bar__row modern-command-bar__row--meta">
              <div className="modern-chip-strip"><span className="modern-chip modern-chip--info">Column filters: {activeColumnFilterCount}</span><span className="modern-chip modern-chip--info">Rows on page: {filteredRows.length}/{data.rows.length}</span></div>
              <div className="avel-pipeline-matrix__views">
                <select
                  className="avel-pipeline-matrix__view-select"
                  value={activeViewID}
                  onChange={(event) => {
                    const nextID = event.target.value;
                    setActiveViewID(nextID);
                    setViewMutationError('');
                    setViewMutationNotice('');
                    if (nextID === 'default') {
                      applyDefaultLayout();
                      setViewNameDraft('');
                      return;
                    }
                    const nextView = savedViews.find((entry) => entry.id === nextID);
                    if (!nextView) {
                      return;
                    }
                    applySavedView(nextView);
                  }}
                >
                  {<option value="default">Default Layout</option>}
                  {savedViews.map((view) => <option key={view.id} value={view.id}>{view.name}</option>)}
                </select>
                <input type="text" className="avel-pipeline-matrix__view-name" value={viewNameDraft} onChange={(event) => setViewNameDraft(event.target.value)} placeholder="View name" />
                <button type="button" className="modern-btn modern-btn--secondary" disabled={!canPersistViews || viewMutationBusy} onClick={saveCurrentView}>{viewMutationBusy ? 'Saving...' : 'Save View'}</button>
                <button type="button" className="modern-btn modern-btn--secondary" disabled={!canPersistViews || activeViewID === 'default' || viewMutationBusy} onClick={deleteCurrentView}>Delete View</button>
              </div>
              <details className="avel-pipeline-matrix__columns-menu" ref={columnsMenuRef}>
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
            {viewMutationError !== '' ? <div className="modern-state modern-state--error">{viewMutationError}</div> : null}
            {viewMutationNotice !== '' ? <div className="modern-state">{viewMutationNotice}</div> : null}
            {data.state.errorMessage !== '' ? <div className="modern-state modern-state--error">{data.state.errorMessage}</div> : null}
          </section>

          <section className="avel-list-panel">
            <div className="avel-list-panel__header"><h2 className="avel-list-panel__title">Candidate Assignments</h2><p className="avel-list-panel__hint">Showing {data.state.startRow}-{data.state.endRow} of {data.meta.totalRows}</p></div>
            <div className="modern-table-wrap avel-pipeline-matrix__table-wrap">
              <table className="modern-table avel-pipeline-matrix__table">
                <thead>
                  <tr>
                    {visibleColumnOrder.map((columnKey) => {
                      const activeSelection = parseFilterSelection(columnFilters[columnKey] || '');
                      const selectedTokens = new Set(activeSelection.values.map((value) => normalizeFilterToken(value)));
                      const allOptions = columnFilterOptions[columnKey];
                      const searchToken = normalizeFilterToken(headerMenuSearch);
                      const visibleOptions =
                        searchToken === ''
                          ? allOptions
                          : allOptions.filter((value) => normalizeFilterToken(value).includes(searchToken));
                      const selectedUnknownValues = activeSelection.values.filter(
                        (value) => !columnFilterOptionTokens[columnKey].has(normalizeFilterToken(value))
                      );
                      const renderedOptions = dedupeFilterValues([...selectedUnknownValues, ...visibleOptions]);

                      return (
                        <th key={`header-${columnKey}`}>
                          <div className="avel-pipeline-matrix__th-shell">
                            <button
                              type="button"
                              className="avel-pipeline-matrix__th-title"
                              onClick={() => setActiveHeaderMenuColumn((current) => (current === columnKey ? null : columnKey))}
                            >
                              {columnLabel(columnKey)}
                              {sortBy === columnKey ? ` (${sortDirection})` : ''}
                            </button>
                            {(columnFilters[columnKey] || '').trim() !== '' ? (
                              <span className="modern-chip modern-chip--info">Filtered</span>
                            ) : null}
                          </div>
                          {activeHeaderMenuColumn === columnKey ? (
                            <div className="avel-pipeline-matrix__header-menu">
                              <label>
                                Search values
                                <input
                                  type="text"
                                  value={headerMenuSearch}
                                  onChange={(event) => setHeaderMenuSearch(event.target.value)}
                                  placeholder={`Find ${columnLabel(columnKey)}`}
                                />
                              </label>
                              <div className="avel-pipeline-matrix__header-menu-options">
                                {renderedOptions.length === 0 ? (
                                  <div className="avel-pipeline-matrix__header-empty">No matching values.</div>
                                ) : (
                                  renderedOptions.map((optionValue) => {
                                    const token = normalizeFilterToken(optionValue);
                                    return (
                                      <label
                                        key={`filter-${columnKey}-${optionValue}`}
                                        className="avel-pipeline-matrix__header-menu-option"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={selectedTokens.has(token)}
                                          onChange={(event) =>
                                            toggleColumnFilterValue(columnKey, optionValue, event.target.checked)
                                          }
                                        />
                                        <span>{optionValue}</span>
                                      </label>
                                    );
                                  })
                                )}
                              </div>
                              <div className="avel-pipeline-matrix__header-menu-actions">
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
                                <button type="button" onClick={() => { setSortBy(columnKey); setSortDirection('asc'); }}>
                                  Sort A-Z
                                </button>
                                <button type="button" onClick={() => { setSortBy(columnKey); setSortDirection('desc'); }}>
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
