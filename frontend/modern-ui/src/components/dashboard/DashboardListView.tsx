import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DashboardRow } from './types';
import { ensureModernUIURL } from '../../lib/navigation';

type ListColumnKey = 'candidate' | 'jobOrder' | 'company' | 'status' | 'location' | 'lastUpdated';
type SortDirection = 'asc' | 'desc';

type CandidateGroup = {
  candidateID: number;
  candidateName: string;
  candidateURL: string;
  rows: DashboardRow[];
};

const COLUMN_KEYS: ListColumnKey[] = ['candidate', 'jobOrder', 'company', 'status', 'location', 'lastUpdated'];

const DEFAULT_ORDER: ListColumnKey[] = ['candidate', 'jobOrder', 'company', 'status', 'location', 'lastUpdated'];

const DEFAULT_VISIBLE: Record<ListColumnKey, boolean> = {
  candidate: true,
  jobOrder: true,
  company: true,
  status: true,
  location: false,
  lastUpdated: true
};

const MULTI_FILTER_PREFIX = '__multi__:';

function toDisplayText(value: unknown, fallback = '--'): string {
  const normalized = String(value || '').trim();
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
  return { candidate: '', jobOrder: '', company: '', status: '', location: '', lastUpdated: '' };
}

function columnLabel(key: ListColumnKey): string {
  switch (key) {
    case 'candidate': return 'Candidate';
    case 'jobOrder': return 'Job Order';
    case 'company': return 'Company';
    case 'status': return 'Status';
    case 'location': return 'Location';
    case 'lastUpdated': return 'Last Updated';
  }
}

function getRowValue(row: DashboardRow, key: ListColumnKey): string {
  switch (key) {
    case 'candidate': return row.candidateName || '';
    case 'jobOrder': return row.jobOrderTitle || '';
    case 'company': return row.companyName || '';
    case 'status': return row.statusLabel || '';
    case 'location': return row.location || '';
    case 'lastUpdated': return row.lastStatusChangeDisplay || '';
  }
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

type Props = {
  rows: DashboardRow[];
  canChangeStatus: boolean;
  storageKey: string;
  onChangeStatus: (row: DashboardRow) => void;
  onOpenDetails: (row: DashboardRow) => void;
};

export function DashboardListView({ rows, canChangeStatus, storageKey, onChangeStatus, onOpenDetails }: Props) {
  const [columnOrder, setColumnOrder] = useState<ListColumnKey[]>([...DEFAULT_ORDER]);
  const [visibleColumns, setVisibleColumns] = useState<Record<ListColumnKey, boolean>>({ ...DEFAULT_VISIBLE });
  const [columnFilters, setColumnFilters] = useState<Record<ListColumnKey, string>>(emptyFilters());
  const [sortBy, setSortBy] = useState<ListColumnKey>('lastUpdated');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const [activeMenu, setActiveMenu] = useState<ListColumnKey | null>(null);
  const [menuSearch, setMenuSearch] = useState('');
  const columnsMenuRef = useRef<HTMLDetailsElement | null>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
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
    } catch {
      // ignore broken storage
    }
  }, [storageKey]);

  // Save to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ columnOrder, visibleColumns, columnFilters, sortBy, sortDir }));
    } catch {
      // ignore
    }
  }, [columnOrder, visibleColumns, columnFilters, sortBy, sortDir, storageKey]);

  // Reset menu search when active column changes
  useEffect(() => { setMenuSearch(''); }, [activeMenu]);

  // Close menus on outside click / escape
  useEffect(() => {
    const closeColumns = () => { if (columnsMenuRef.current?.open) columnsMenuRef.current.removeAttribute('open'); };
    const closeMenu = () => setActiveMenu(null);

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      const el = target instanceof Element ? target : null;
      if (columnsMenuRef.current && target && !columnsMenuRef.current.contains(target)) closeColumns();
      if (activeMenu !== null) {
        if (!el?.closest('.adl-header-menu') && !el?.closest('.avel-pipeline-matrix__th-title')) closeMenu();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { closeColumns(); closeMenu(); }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown, { passive: true });
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [activeMenu]);

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

  const visibleColumnOrder = useMemo(() => {
    const cols = columnOrder.filter((k) => visibleColumns[k]);
    return cols.length > 0 ? cols : ['candidate' as ListColumnKey];
  }, [columnOrder, visibleColumns]);

  const candidateColVisible = visibleColumnOrder.includes('candidate');

  // Build per-column filter options from the rows passed in (already server-filtered)
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
      opts[key] = Array.from(seen.values()).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true }));
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
        if (selection.isMulti) return selectedTokens.some((t) => rowValue === t || (filterOptionTokens[key].has(t) ? rowValue === t : rowValue.includes(t)));
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

  // Group consecutive rows by candidateID, preserving sorted order of first appearance
  const groupedRows = useMemo((): CandidateGroup[] => {
    const groups = new Map<number, CandidateGroup>();
    const order: number[] = [];
    filteredRows.forEach((row) => {
      if (!groups.has(row.candidateID)) {
        groups.set(row.candidateID, {
          candidateID: row.candidateID,
          candidateName: row.candidateName,
          candidateURL: row.candidateURL,
          rows: []
        });
        order.push(row.candidateID);
      }
      groups.get(row.candidateID)!.rows.push(row);
    });
    return order.map((id) => groups.get(id)!);
  }, [filteredRows]);

  const totalCandidates = groupedRows.length;
  const totalRows = filteredRows.length;
  const activeFilterCount = (Object.keys(columnFilters) as ListColumnKey[]).filter((k) => (columnFilters[k] || '').trim() !== '').length;

  return (
    <div className="avel-dashboard-list modern-table-animated">
      <div className="avel-dashboard-list__header">
        <div className="avel-dashboard-list__header-left">
          <h2 className="avel-list-panel__title">Pipeline Matrix</h2>
          <p className="avel-list-panel__hint">
            {totalRows === rows.length
              ? `${totalCandidates} candidate${totalCandidates !== 1 ? 's' : ''}${totalRows !== totalCandidates ? `, ${totalRows} assignment${totalRows !== 1 ? 's' : ''}` : ''}`
              : `${totalCandidates} of ${new Set(rows.map((r) => r.candidateID)).size} candidates (${totalRows} of ${rows.length} assignments)`}
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
                          const visCount = (Object.keys(current) as ListColumnKey[]).reduce((t, k) => t + (current[k] ? 1 : 0), 0);
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
                const visibleOptions = searchToken === '' ? allOptions : allOptions.filter((v) => normalizeToken(v).includes(searchToken));
                const selectedUnknown = activeSelection.values.filter((v) => !filterOptionTokens[key].has(normalizeToken(v)));
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
              <th className="avel-dashboard-list__actions-th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {groupedRows.length === 0 ? (
              <tr>
                <td colSpan={visibleColumnOrder.length + 1} className="avel-dashboard-list__empty">
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
                        // Candidate cell: spans all rows in the group, only rendered on first sub-row
                        if (key === 'candidate') {
                          if (!isFirstInGroup) return null;
                          return (
                            <td key={`${rowKey}-candidate`} rowSpan={rowSpan} className="adl-candidate-cell">
                              <a className="modern-link adl-candidate-name" href={row.candidateURL}>
                                {toDisplayText(row.candidateName)}
                              </a>
                              {rowSpan > 1 ? (
                                <span className="adl-candidate-count" title={`${rowSpan} assignments`}>{rowSpan}</span>
                              ) : null}
                            </td>
                          );
                        }
                        if (key === 'jobOrder') {
                          return (
                            <td key={`${rowKey}-jobOrder`} className="adl-subrow-cell">
                              <a className="modern-link" href={ensureModernUIURL(row.jobOrderURL)}>{toDisplayText(row.jobOrderTitle)}</a>
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
                        return (
                          <td key={`${rowKey}-${key}`} className="adl-subrow-cell">{toDisplayText(getRowValue(row, key))}</td>
                        );
                      })}
                      <td className="adl-subrow-cell">
                        <div className="modern-table-actions">
                          {canChangeStatus ? (
                            <button
                              type="button"
                              className="modern-btn modern-btn--mini modern-btn--secondary"
                              onClick={() => onChangeStatus(row)}
                            >
                              Change Status
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className="modern-btn modern-btn--mini modern-btn--secondary"
                            onClick={() => onOpenDetails(row)}
                            disabled={Number(row.candidateJobOrderID || 0) <= 0}
                          >
                            Details
                          </button>
                        </div>
                      </td>
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
