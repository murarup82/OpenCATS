import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { DashboardRow } from './types';
import { ensureModernUIURL } from '../../lib/navigation';

type ListColumnKey =
  | 'candidate'
  | 'jobOrder'
  | 'company'
  | 'source'
  | 'keySkills'
  | 'status'
  | 'owner'
  | 'recruiter'
  | 'location'
  | 'gdpr'
  | 'dateAdded'
  | 'lastUpdated'
  | 'rejectionReason';

type SortDirection = 'asc' | 'desc';

type SavedView = {
  id: string;
  name: string;
  config: {
    columnOrder: ListColumnKey[];
    visibleColumns: Record<ListColumnKey, boolean>;
    columnFilters: Record<ListColumnKey, string>;
    sortBy: ListColumnKey;
    sortDir: SortDirection;
  };
};

type CandidateGroup = {
  candidateID: number;
  candidateName: string;
  candidateURL: string;
  location: string;
  rows: DashboardRow[];
};

const COLUMN_KEYS: ListColumnKey[] = [
  'candidate', 'jobOrder', 'company', 'source', 'keySkills',
  'status', 'owner', 'recruiter', 'location', 'gdpr',
  'dateAdded', 'lastUpdated', 'rejectionReason'
];

const DEFAULT_ORDER: ListColumnKey[] = [...COLUMN_KEYS];

const DEFAULT_VISIBLE: Record<ListColumnKey, boolean> = {
  candidate: true,
  jobOrder: true,
  company: false,
  source: true,
  keySkills: true,
  status: true,
  owner: true,
  recruiter: false,
  location: false,
  gdpr: true,
  dateAdded: false,
  lastUpdated: true,
  rejectionReason: false
};

const MULTI_FILTER_PREFIX = '__multi__:';

function toDisplayText(value: unknown, fallback = '--'): string {
  const normalized = String(value ?? '').trim();
  return normalized === '' ? fallback : normalized;
}

function normalizeToken(value: string): string {
  return String(value || '').trim().toLowerCase();
}

function dedupeValues(values: string[]): string[] {
  const seen = new Map<string, string>();
  values.forEach((v) => {
    const normalized = String(v || '').trim();
    if (normalized === '') return;
    const token = normalizeToken(normalized);
    if (!seen.has(token)) seen.set(token, normalized);
  });
  return Array.from(seen.values());
}

function parseMultiFilterValues(raw: string): string[] | null {
  const normalized = String(raw || '').trim();
  if (!normalized.startsWith(MULTI_FILTER_PREFIX)) return null;
  const payload = normalized.slice(MULTI_FILTER_PREFIX.length).trim();
  if (payload === '') return [];
  try {
    const parsed = JSON.parse(payload) as unknown;
    if (!Array.isArray(parsed)) return null;
    return dedupeValues(parsed.map((v) => String(v || '')));
  } catch {
    return null;
  }
}

function parseFilterSelection(raw: string): { values: string[]; isMulti: boolean } {
  const multi = parseMultiFilterValues(raw);
  if (multi !== null) return { values: multi, isMulti: true };
  const single = String(raw || '').trim();
  if (single === '') return { values: [], isMulti: false };
  return { values: [single], isMulti: false };
}

function encodeFilterSelection(values: string[]): string {
  const unique = dedupeValues(values);
  if (unique.length === 0) return '';
  if (unique.length === 1) return unique[0];
  return `${MULTI_FILTER_PREFIX}${JSON.stringify(unique)}`;
}

function emptyFilters(): Record<ListColumnKey, string> {
  return {
    candidate: '', jobOrder: '', company: '', source: '', keySkills: '',
    status: '', owner: '', recruiter: '', location: '', gdpr: '',
    dateAdded: '', lastUpdated: '', rejectionReason: ''
  };
}

function columnLabel(key: ListColumnKey): string {
  switch (key) {
    case 'candidate': return 'Candidate';
    case 'jobOrder': return 'Job Order';
    case 'company': return 'Company';
    case 'source': return 'Source';
    case 'keySkills': return 'Key Skills';
    case 'status': return 'Pipeline';
    case 'owner': return 'Owner';
    case 'recruiter': return 'Recruiter';
    case 'location': return 'Location';
    case 'gdpr': return 'GDPR';
    case 'dateAdded': return 'Added';
    case 'lastUpdated': return 'Last Activity';
    case 'rejectionReason': return 'Rejection Reason';
  }
}

function getRowValue(row: DashboardRow, key: ListColumnKey): string {
  switch (key) {
    case 'candidate': return row.candidateName || '';
    case 'jobOrder': return row.jobOrderTitle || '';
    case 'company': return row.companyName || '';
    case 'source': return row.source || '';
    case 'keySkills': return row.keySkills || '';
    case 'status': return row.statusLabel || '';
    case 'owner': return row.ownerName || '';
    case 'recruiter': return row.recruiterName || '';
    case 'location': return row.location || '';
    case 'gdpr': return row.gdprSigned ? 'Signed' : 'Not Signed';
    case 'dateAdded': return row.dateAdded || '';
    case 'lastUpdated': return row.lastStatusChangeDisplay || '';
    case 'rejectionReason': return row.rejectionReasons || '';
  }
}

function getSourceChipClass(source: string): string {
  const s = normalizeToken(source);
  if (s.includes('linkedin')) return 'modern-chip--source-linkedin';
  if (s.includes('partner')) return 'modern-chip--source-partner';
  if (s.includes('direct')) return 'modern-chip--source-direct';
  if (s.includes('internal')) return 'modern-chip--source-internal';
  if (s.includes('network')) return 'modern-chip--source-network';
  return 'modern-chip--source-other';
}

function normalizeColOrder(raw: unknown): ListColumnKey[] {
  if (!Array.isArray(raw)) return [...DEFAULT_ORDER];
  const next: ListColumnKey[] = [];
  (raw as unknown[]).forEach((v) => {
    const k = String(v || '').trim() as ListColumnKey;
    if (COLUMN_KEYS.includes(k) && !next.includes(k)) next.push(k);
  });
  DEFAULT_ORDER.forEach((k) => { if (!next.includes(k)) next.push(k); });
  return next.length > 0 ? next : [...DEFAULT_ORDER];
}

function normalizeColVisible(raw: unknown): Record<ListColumnKey, boolean> {
  const result = { ...DEFAULT_VISIBLE };
  if (!raw || typeof raw !== 'object') return result;
  const payload = raw as Record<string, unknown>;
  COLUMN_KEYS.forEach((k) => {
    if (Object.prototype.hasOwnProperty.call(payload, k)) result[k] = Boolean(payload[k]);
  });
  return result;
}

function normalizeColFilters(raw: unknown): Record<ListColumnKey, string> {
  const result = emptyFilters();
  if (!raw || typeof raw !== 'object') return result;
  const payload = raw as Record<string, unknown>;
  COLUMN_KEYS.forEach((k) => {
    if (Object.prototype.hasOwnProperty.call(payload, k)) result[k] = String(payload[k] || '');
  });
  return result;
}

function normalizeSortKey(raw: unknown): ListColumnKey {
  const k = String(raw || '').trim() as ListColumnKey;
  return COLUMN_KEYS.includes(k) ? k : 'lastUpdated';
}

function normalizeSortDir(raw: unknown): SortDirection {
  return String(raw || '').toLowerCase() === 'asc' ? 'asc' : 'desc';
}

function loadSavedViews(presetsKey: string): SavedView[] {
  try {
    const raw = window.localStorage.getItem(presetsKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return (parsed as unknown[]).filter(
      (v): v is SavedView =>
        !!v && typeof v === 'object' &&
        typeof (v as SavedView).id === 'string' &&
        typeof (v as SavedView).name === 'string' &&
        !!((v as SavedView).config)
    );
  } catch {
    return [];
  }
}

function persistSavedViews(presetsKey: string, views: SavedView[]): void {
  try {
    window.localStorage.setItem(presetsKey, JSON.stringify(views));
  } catch {
    // ignore
  }
}

type Props = {
  rows: DashboardRow[];
  storageKey: string;
};

export function DashboardListView({ rows, storageKey }: Props) {
  const presetsKey = `${storageKey}:presets`;

  const [columnOrder, setColumnOrder] = useState<ListColumnKey[]>([...DEFAULT_ORDER]);
  const [visibleColumns, setVisibleColumns] = useState<Record<ListColumnKey, boolean>>({ ...DEFAULT_VISIBLE });
  const [columnFilters, setColumnFilters] = useState<Record<ListColumnKey, string>>(emptyFilters());
  const [sortBy, setSortBy] = useState<ListColumnKey>('lastUpdated');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const [activeMenu, setActiveMenu] = useState<ListColumnKey | null>(null);
  const [menuSearch, setMenuSearch] = useState('');
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [saveViewName, setSaveViewName] = useState('');
  const [viewPanelOpen, setViewPanelOpen] = useState(false);

  const columnsMenuRef = useRef<HTMLDetailsElement | null>(null);
  const viewPanelRef = useRef<HTMLDivElement | null>(null);
  const saveInputId = useId();

  // Load working state + presets from localStorage
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const payload = JSON.parse(raw) as {
          columnOrder?: unknown;
          visibleColumns?: unknown;
          columnFilters?: unknown;
          sortBy?: unknown;
          sortDir?: unknown;
        };
        setColumnOrder(normalizeColOrder(payload.columnOrder));
        setVisibleColumns(normalizeColVisible(payload.visibleColumns));
        setColumnFilters(normalizeColFilters(payload.columnFilters));
        setSortBy(normalizeSortKey(payload.sortBy));
        setSortDir(normalizeSortDir(payload.sortDir));
      }
    } catch {
      // ignore
    }
    setSavedViews(loadSavedViews(presetsKey));
  }, [storageKey, presetsKey]);

  // Save working state
  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ columnOrder, visibleColumns, columnFilters, sortBy, sortDir }));
    } catch {
      // ignore
    }
  }, [columnOrder, visibleColumns, columnFilters, sortBy, sortDir, storageKey]);

  useEffect(() => { setMenuSearch(''); }, [activeMenu]);

  // Close menus on outside click / escape
  useEffect(() => {
    const closeColumns = () => { if (columnsMenuRef.current?.open) columnsMenuRef.current.removeAttribute('open'); };
    const closeMenu = () => setActiveMenu(null);

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      const el = target instanceof Element ? target : null;
      if (columnsMenuRef.current && target && !columnsMenuRef.current.contains(target)) closeColumns();
      if (activeMenu !== null && !el?.closest('.adl-header-menu') && !el?.closest('.avel-pipeline-matrix__th-title')) closeMenu();
      if (viewPanelOpen && viewPanelRef.current && target && !viewPanelRef.current.contains(target) && !el?.closest('.adl-views-trigger')) {
        setViewPanelOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { closeColumns(); closeMenu(); setViewPanelOpen(false); }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown, { passive: true });
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [activeMenu, viewPanelOpen]);

  const moveColumn = (key: ListColumnKey, dir: -1 | 1) => {
    setColumnOrder((current) => {
      const idx = current.indexOf(key);
      if (idx === -1) return current;
      const target = idx + dir;
      if (target < 0 || target >= current.length) return current;
      const next = current.slice();
      const [moved] = next.splice(idx, 1);
      next.splice(target, 0, moved);
      return next;
    });
  };

  const setFilterSelection = useCallback((key: ListColumnKey, values: string[]) => {
    setColumnFilters((c) => ({ ...c, [key]: encodeFilterSelection(values) }));
  }, []);

  const toggleFilterValue = useCallback((key: ListColumnKey, value: string, checked: boolean) => {
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

  const currentConfig = useCallback(() => ({
    columnOrder: [...columnOrder],
    visibleColumns: { ...visibleColumns },
    columnFilters: { ...columnFilters },
    sortBy,
    sortDir
  }), [columnOrder, visibleColumns, columnFilters, sortBy, sortDir]);

  const saveCurrentView = () => {
    const name = saveViewName.trim();
    if (name === '') return;
    const view: SavedView = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      config: currentConfig()
    };
    const next = [...savedViews, view];
    setSavedViews(next);
    persistSavedViews(presetsKey, next);
    setSaveViewName('');
  };

  const loadView = (view: SavedView) => {
    setColumnOrder(normalizeColOrder(view.config.columnOrder));
    setVisibleColumns(normalizeColVisible(view.config.visibleColumns));
    setColumnFilters(normalizeColFilters(view.config.columnFilters));
    setSortBy(normalizeSortKey(view.config.sortBy));
    setSortDir(normalizeSortDir(view.config.sortDir));
    setViewPanelOpen(false);
  };

  const deleteView = (id: string) => {
    const next = savedViews.filter((v) => v.id !== id);
    setSavedViews(next);
    persistSavedViews(presetsKey, next);
  };

  const visibleColumnOrder = useMemo(() => {
    const cols = columnOrder.filter((k) => visibleColumns[k]);
    return cols.length > 0 ? cols : ['candidate' as ListColumnKey];
  }, [columnOrder, visibleColumns]);

  const candidateColVisible = visibleColumnOrder.includes('candidate');

  const filterOptions = useMemo(() => {
    const opts: Record<ListColumnKey, string[]> = emptyFilters() as unknown as Record<ListColumnKey, string[]>;
    COLUMN_KEYS.forEach((key) => {
      const seen = new Map<string, string>();
      rows.forEach((row) => {
        const v = getRowValue(row, key).trim();
        if (v === '') return;
        const token = normalizeToken(v);
        if (!seen.has(token)) seen.set(token, v);
      });
      opts[key] = Array.from(seen.values()).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true })
      );
    });
    return opts;
  }, [rows]);

  const filterOptionTokens = useMemo(() => {
    return COLUMN_KEYS.reduce((acc, key) => {
      acc[key] = new Set(filterOptions[key].map(normalizeToken));
      return acc;
    }, {} as Record<ListColumnKey, Set<string>>);
  }, [filterOptions]);

  const filteredRows = useMemo(() => {
    const result = rows.filter((row) =>
      (Object.keys(columnFilters) as ListColumnKey[]).every((key) => {
        const selection = parseFilterSelection(columnFilters[key] || '');
        const selectedTokens = selection.values.map(normalizeToken).filter((t) => t !== '');
        if (selectedTokens.length === 0) return true;
        const rowValue = normalizeToken(getRowValue(row, key));
        if (selection.isMulti) {
          return selectedTokens.some((t) =>
            filterOptionTokens[key].has(t) ? rowValue === t : rowValue.includes(t)
          );
        }
        const filterText = selectedTokens[0];
        return filterOptionTokens[key].has(filterText) ? rowValue === filterText : rowValue.includes(filterText);
      })
    );

    const sign = sortDir === 'asc' ? 1 : -1;
    result.sort((a, b) => {
      const av = getRowValue(a, sortBy).toLowerCase();
      const bv = getRowValue(b, sortBy).toLowerCase();
      if (av === bv) return 0;
      return av > bv ? sign : -sign;
    });
    return result;
  }, [rows, columnFilters, filterOptionTokens, sortBy, sortDir]);

  const groupedRows = useMemo((): CandidateGroup[] => {
    const groups = new Map<number, CandidateGroup>();
    const order: number[] = [];
    filteredRows.forEach((row) => {
      if (!groups.has(row.candidateID)) {
        groups.set(row.candidateID, {
          candidateID: row.candidateID,
          candidateName: row.candidateName,
          candidateURL: row.candidateURL,
          location: row.location || '',
          rows: []
        });
        order.push(row.candidateID);
      }
      groups.get(row.candidateID)!.rows.push(row);
    });
    return order.map((id) => groups.get(id)!);
  }, [filteredRows]);

  const totalCandidates = groupedRows.length;
  const totalAssignments = filteredRows.length;
  const totalUniqueCandidates = useMemo(() => new Set(rows.map((r) => r.candidateID)).size, [rows]);
  const activeFilterCount = (Object.keys(columnFilters) as ListColumnKey[]).filter(
    (k) => (columnFilters[k] || '').trim() !== ''
  ).length;

  return (
    <div className="avel-dashboard-list modern-table-animated">
      <div className="avel-dashboard-list__header">
        <div className="avel-dashboard-list__header-left">
          <h2 className="avel-list-panel__title">Pipeline Matrix</h2>
          <p className="avel-list-panel__hint">
            {totalAssignments === rows.length
              ? `${totalCandidates} candidate${totalCandidates !== 1 ? 's' : ''}${totalAssignments !== totalCandidates ? `, ${totalAssignments} assignment${totalAssignments !== 1 ? 's' : ''}` : ''}`
              : `${totalCandidates} of ${totalUniqueCandidates} candidates (${totalAssignments} of ${rows.length} assignments)`}
          </p>
        </div>
        <div className="avel-dashboard-list__header-right">
          {activeFilterCount > 0 ? (
            <button
              type="button"
              className="modern-chip modern-chip--info avel-dashboard-list__clear-btn"
              onClick={() => setColumnFilters(emptyFilters())}
              title="Clear all column filters"
            >
              Filters: {activeFilterCount} ×
            </button>
          ) : null}

          {/* Saved Views */}
          <div className="adl-views-wrap">
            <button
              type="button"
              className="modern-chip modern-chip--column-toggle adl-views-trigger"
              onClick={() => setViewPanelOpen((o) => !o)}
              aria-expanded={viewPanelOpen}
            >
              Views{savedViews.length > 0 ? ` (${savedViews.length})` : ''}
            </button>
            {viewPanelOpen ? (
              <div className="adl-views-panel" ref={viewPanelRef}>
                {savedViews.length > 0 ? (
                  <div className="adl-views-panel__list">
                    {savedViews.map((view) => (
                      <div key={view.id} className="adl-views-panel__item">
                        <span className="adl-views-panel__item-name" title={view.name}>{view.name}</span>
                        <button type="button" className="adl-views-panel__load" onClick={() => loadView(view)}>Load</button>
                        <button type="button" className="adl-views-panel__delete" onClick={() => deleteView(view.id)} aria-label={`Delete view "${view.name}"`}>×</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="adl-views-panel__empty">No saved views yet.</p>
                )}
                <div className="adl-views-panel__save">
                  <label htmlFor={saveInputId} className="adl-views-panel__save-label">Save current as:</label>
                  <input
                    id={saveInputId}
                    type="text"
                    className="adl-views-panel__save-input"
                    value={saveViewName}
                    onChange={(e) => setSaveViewName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveCurrentView(); }}
                    placeholder="View name…"
                    maxLength={80}
                  />
                  <button
                    type="button"
                    className="modern-btn modern-btn--mini modern-btn--emphasis"
                    disabled={saveViewName.trim() === ''}
                    onClick={saveCurrentView}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Columns toggle */}
          <details className="avel-pipeline-matrix__columns-menu" ref={columnsMenuRef}>
            <summary className="modern-chip modern-chip--column-toggle">Columns</summary>
            <div className="avel-pipeline-matrix__columns-panel">
              {columnOrder.map((key, index) => (
                <div key={`col-${key}`} className="avel-pipeline-matrix__column-item">
                  <label className="avel-pipeline-matrix__column-toggle">
                    <input
                      type="checkbox"
                      checked={visibleColumns[key]}
                      onChange={() =>
                        setVisibleColumns((current) => {
                          const visCount = (Object.keys(current) as ListColumnKey[]).reduce(
                            (t, k) => t + (current[k] ? 1 : 0), 0
                          );
                          if (current[key] && visCount <= 1) return current;
                          return { ...current, [key]: !current[key] };
                        })
                      }
                    />
                    <span>{columnLabel(key)}</span>
                  </label>
                  <div className="avel-pipeline-matrix__column-move">
                    <button type="button" disabled={index === 0} onClick={() => moveColumn(key, -1)}>Up</button>
                    <button type="button" disabled={index === columnOrder.length - 1} onClick={() => moveColumn(key, 1)}>Down</button>
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>

      <div className="modern-table-wrap avel-pipeline-matrix__table-wrap avel-dashboard-list__table-wrap">
        <table className="modern-table avel-pipeline-matrix__table avel-dashboard-list__table">
          <thead>
            <tr>
              {visibleColumnOrder.map((key) => {
                const activeSelection = parseFilterSelection(columnFilters[key] || '');
                const selectedTokens = new Set(activeSelection.values.map(normalizeToken));
                const allOptions = filterOptions[key];
                const searchToken = normalizeToken(menuSearch);
                const visibleOptions = searchToken === ''
                  ? allOptions
                  : allOptions.filter((v) => normalizeToken(v).includes(searchToken));
                const selectedUnknown = activeSelection.values.filter(
                  (v) => !filterOptionTokens[key].has(normalizeToken(v))
                );
                const renderedOptions = dedupeValues([...selectedUnknown, ...visibleOptions]);

                return (
                  <th key={`th-${key}`}>
                    <div className="avel-pipeline-matrix__th-shell">
                      <button
                        type="button"
                        className="avel-pipeline-matrix__th-title"
                        onClick={() => setActiveMenu((c) => (c === key ? null : key))}
                      >
                        {columnLabel(key)}{sortBy === key ? ` (${sortDir})` : ''}
                      </button>
                      {(columnFilters[key] || '').trim() !== '' ? (
                        <span className="modern-chip modern-chip--info">Filtered</span>
                      ) : null}
                    </div>
                    {activeMenu === key ? (
                      <div className="adl-header-menu">
                        <label>
                          Search values
                          <input
                            type="text"
                            value={menuSearch}
                            onChange={(e) => setMenuSearch(e.target.value)}
                            placeholder={`Find ${columnLabel(key)}`}
                          />
                        </label>
                        <div className="adl-header-menu__options">
                          {renderedOptions.length === 0 ? (
                            <div className="avel-pipeline-matrix__header-empty">No matching values.</div>
                          ) : (
                            renderedOptions.map((opt) => {
                              const token = normalizeToken(opt);
                              return (
                                <label key={`f-${key}-${opt}`} className="avel-pipeline-matrix__header-menu-option">
                                  <input
                                    type="checkbox"
                                    checked={selectedTokens.has(token)}
                                    onChange={(e) => toggleFilterValue(key, opt, e.target.checked)}
                                  />
                                  {key === 'status' ? (
                                    <span className={`modern-status modern-status--${normalizeToken(opt).replace(/\s+/g, '-')}`}>{opt}</span>
                                  ) : key === 'source' ? (
                                    <span className={`modern-chip ${getSourceChipClass(opt)}`}>{opt}</span>
                                  ) : key === 'gdpr' ? (
                                    <span className={opt === 'Signed' ? 'modern-chip modern-chip--gdpr-signed' : 'modern-chip modern-chip--gdpr-unsigned'}>{opt}</span>
                                  ) : (
                                    <span>{opt}</span>
                                  )}
                                </label>
                              );
                            })
                          )}
                        </div>
                        <div className="avel-pipeline-matrix__header-menu-actions">
                          <button type="button" disabled={renderedOptions.length === 0} onClick={() => setFilterSelection(key, renderedOptions)}>Select Visible</button>
                          <button type="button" onClick={() => setFilterSelection(key, [])}>Clear</button>
                          <button type="button" onClick={() => { setSortBy(key); setSortDir('asc'); }}>Sort A–Z</button>
                          <button type="button" onClick={() => { setSortBy(key); setSortDir('desc'); }}>Sort Z–A</button>
                        </div>
                      </div>
                    ) : null}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {groupedRows.length === 0 ? (
              <tr>
                <td colSpan={visibleColumnOrder.length} className="avel-dashboard-list__empty">
                  No candidates match the current filters.
                </td>
              </tr>
            ) : (
              groupedRows.map((group) =>
                group.rows.map((row, rowIndex) => {
                  const isFirstInGroup = rowIndex === 0;
                  const isLastInGroup = rowIndex === group.rows.length - 1;
                  const rowSpan = group.rows.length;
                  const rowKey = `${row.candidateID}-${row.jobOrderID}-${row.statusID}`;

                  return (
                    <tr
                      key={rowKey}
                      className={[
                        isFirstInGroup ? 'adl-group-first' : 'adl-group-continuation',
                        isLastInGroup ? 'adl-group-last' : ''
                      ].filter(Boolean).join(' ')}
                    >
                      {visibleColumnOrder.map((key) => {
                        if (key === 'candidate' && candidateColVisible) {
                          if (!isFirstInGroup) return null;
                          return (
                            <td key={`${rowKey}-candidate`} rowSpan={rowSpan} className="adl-candidate-cell">
                              <div className="avel-candidate-table__title-row">
                                <a className="modern-link avel-candidate-table__name adl-candidate-name" href={row.candidateURL}>
                                  {toDisplayText(row.candidateName)}
                                </a>
                                {rowSpan > 1 ? (
                                  <span className="adl-candidate-count" title={`${rowSpan} assignments`}>{rowSpan}</span>
                                ) : null}
                              </div>
                              {(row.location && row.location !== '--') ? (
                                <div className="avel-candidate-table__meta">{row.location}</div>
                              ) : null}
                            </td>
                          );
                        }

                        if (key === 'jobOrder') {
                          return (
                            <td key={`${rowKey}-jobOrder`} className="adl-subrow-cell">
                              <a className="modern-link" href={ensureModernUIURL(row.jobOrderURL)}>
                                {toDisplayText(row.jobOrderTitle)}
                              </a>
                            </td>
                          );
                        }

                        if (key === 'source') {
                          const src = row.source || '';
                          const isEmpty = src === '' || src === '--';
                          return (
                            <td key={`${rowKey}-source`} className="adl-subrow-cell">
                              {isEmpty
                                ? <span className="adl-cell-muted">(none)</span>
                                : <span className={`modern-chip ${getSourceChipClass(src)}`}>{src}</span>
                              }
                            </td>
                          );
                        }

                        if (key === 'keySkills') {
                          return (
                            <td key={`${rowKey}-keySkills`} className="adl-subrow-cell avel-candidate-table__skills">
                              {toDisplayText(row.keySkills)}
                            </td>
                          );
                        }

                        if (key === 'status') {
                          return (
                            <td key={`${rowKey}-status`} className="adl-subrow-cell">
                              <span className={`modern-status modern-status--${row.statusSlug || normalizeToken(row.statusLabel || '').replace(/\s+/g, '-')}`}>
                                {toDisplayText(row.statusLabel)}
                              </span>
                            </td>
                          );
                        }

                        if (key === 'gdpr') {
                          return (
                            <td key={`${rowKey}-gdpr`} className="adl-subrow-cell">
                              {row.gdprSigned
                                ? <span className="modern-chip modern-chip--gdpr-signed">Signed</span>
                                : <span className="modern-chip modern-chip--gdpr-unsigned">Not Signed</span>
                              }
                            </td>
                          );
                        }

                        if (key === 'rejectionReason') {
                          const reasons = (row.rejectionReasons || '').trim();
                          return (
                            <td key={`${rowKey}-rejectionReason`} className="adl-subrow-cell">
                              {reasons !== ''
                                ? <span className="adl-rejection-reasons">{reasons}</span>
                                : <span className="adl-cell-muted">—</span>
                              }
                            </td>
                          );
                        }

                        return (
                          <td key={`${rowKey}-${key}`} className="adl-subrow-cell">
                            {toDisplayText(getRowValue(row, key))}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
