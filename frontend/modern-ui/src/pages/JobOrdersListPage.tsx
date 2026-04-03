import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  fetchJobOrderRejectionReasonBreakdownModernData,
  fetchJobOrdersListModernData,
  setJobOrderMonitored,
  updateJobOrderQuickAction
} from '../lib/api';
import type {
  JobOrderRejectionReasonBreakdownModernDataResponse,
  JobOrdersListModernDataResponse,
  UIModeBootstrap
} from '../types';
import { RowActionMenu } from '../components/RowActionMenu';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { JobOrderAssignCandidateModal } from '../components/primitives/JobOrderAssignCandidateModal';
import { InlineModal, SelectMenu } from '../ui-core';
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
  status?: string;
  companyID?: number;
  onlyMyJobOrders?: boolean;
  showInactive?: boolean;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  page?: number;
  maxResults?: number;
};

type JobOrderRow = JobOrdersListModernDataResponse['rows'][number];

type JobOrderDataColumnKey =
  | 'jobOrder'
  | 'company'
  | 'status'
  | 'priority'
  | 'openings'
  | 'remainingOpenings'
  | 'internalValidation'
  | 'customerInterview'
  | 'proposed'
  | 'hired'
  | 'rejected'
  | 'owner'
  | 'recruiter'
  | 'monitor'
  | 'actions';

type JobOrderColumnConfig = {
  key: JobOrderDataColumnKey;
  title: string;
  sortKey: string;
  filterable?: boolean;
};

type JobOrderColumnVisibility = Record<JobOrderDataColumnKey, boolean>;

const MULTI_FILTER_PREFIX = '__multi__:';

const JOB_ORDER_COLUMNS: JobOrderColumnConfig[] = [
  { key: 'jobOrder', title: 'Job Order', sortKey: 'title', filterable: true },
  { key: 'company', title: 'Company', sortKey: 'companyName', filterable: true },
  { key: 'status', title: 'Status', sortKey: 'status', filterable: true },
  { key: 'priority', title: 'Priority', sortKey: '', filterable: true },
  { key: 'openings', title: 'Total Openings', sortKey: '', filterable: true },
  { key: 'remainingOpenings', title: 'Remaining Openings', sortKey: '', filterable: true },
  { key: 'internalValidation', title: 'Internal Validation', sortKey: '', filterable: true },
  { key: 'customerInterview', title: 'Customer Interview', sortKey: '', filterable: true },
  { key: 'proposed', title: 'Proposed', sortKey: '', filterable: true },
  { key: 'hired', title: 'Hired', sortKey: '', filterable: true },
  { key: 'rejected', title: 'Rejected', sortKey: '', filterable: true },
  { key: 'owner', title: 'Owner', sortKey: 'ownerSort', filterable: true },
  { key: 'recruiter', title: 'Recruiter', sortKey: 'recruiterSort', filterable: true },
  { key: 'monitor', title: 'Monitor', sortKey: '', filterable: true },
  { key: 'actions', title: 'Actions', sortKey: '', filterable: false }
];

const DEFAULT_VISIBLE_COLUMNS: JobOrderColumnVisibility = {
  jobOrder: true,
  company: false,
  status: true,
  priority: true,
  openings: true,
  remainingOpenings: true,
  internalValidation: true,
  customerInterview: true,
  proposed: true,
  hired: true,
  rejected: true,
  owner: false,
  recruiter: false,
  monitor: false,
  actions: true
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

function formatCountWithClosed(activeCount: number, totalIncludingClosed: number): string {
  const activeValue = Number.isFinite(activeCount) ? Math.max(0, Math.trunc(activeCount)) : 0;
  const totalValue = Number.isFinite(totalIncludingClosed) ? Math.max(0, Math.trunc(totalIncludingClosed)) : activeValue;
  return `${activeValue} (${Math.max(activeValue, totalValue)})`;
}

function decodeLegacyURL(url: string): string {
  return String(url || '').replace(/&amp;/g, '&');
}

function buildStatusTone(tone: string): string {
  const normalized = String(tone || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized === '' ? 'status' : normalized;
}

function buildJobOrderStatusTone(status: string, statusSlug: string): string {
  const normalized = `${String(status || '').toLowerCase()} ${String(statusSlug || '').toLowerCase()}`;

  if (normalized.includes('cancel')) {
    return 'cancelled';
  }
  if (normalized.includes('closed')) {
    return 'closed';
  }
  if (normalized.includes('lead') || normalized.includes('upcoming') || normalized.includes('pre-open')) {
    return 'lead';
  }
  if (normalized.includes('on hold') || normalized.includes('on-hold')) {
    return 'on-hold';
  }
  if (normalized.includes('full')) {
    return 'full';
  }
  if (normalized.includes('active')) {
    return 'active';
  }

  return 'default';
}

function isActiveJobOrderStatus(status: string, statusSlug: string): boolean {
  const normalizedStatus = String(status || '').trim().toLowerCase();
  const normalizedSlug = String(statusSlug || '').trim().toLowerCase();
  return normalizedStatus === 'active' || normalizedSlug === 'active';
}

function isCountedPositionStatus(status: string, statusSlug: string): boolean {
  const normalizedStatus = String(status || '').trim().toLowerCase();
  const normalizedSlug = String(statusSlug || '').trim().toLowerCase();
  return normalizedStatus === 'active' || normalizedSlug === 'active' || normalizedStatus === 'lead' || normalizedSlug === 'lead';
}


function normalizeJobOrderPriorityValue(
  priorityValue: unknown,
  fallbackIsHot = false
): 'low' | 'standard' | 'high' {
  const normalized = String(priorityValue || '').trim().toLowerCase();
  if (normalized === 'high' || normalized === 'hot') {
    return 'high';
  }
  if (normalized === 'standard') {
    return 'standard';
  }
  if (normalized === 'low') {
    return 'low';
  }
  return fallbackIsHot ? 'high' : 'low';
}

function getJobOrderPriorityLabel(priorityValue: 'low' | 'standard' | 'high'): string {
  if (priorityValue === 'high') {
    return 'High';
  }
  if (priorityValue === 'standard') {
    return 'Standard';
  }
  return 'Low';
}

function getJobOrderPriorityChipClass(priorityValue: 'low' | 'standard' | 'high'): string {
  if (priorityValue === 'high') {
    return 'modern-chip--priority-high';
  }
  if (priorityValue === 'standard') {
    return 'modern-chip--priority-standard';
  }
  return 'modern-chip--priority-low';
}

function getJobOrderColumnValue(row: JobOrderRow, key: JobOrderDataColumnKey): string {
  switch (key) {
    case 'jobOrder': return `${toDisplayText(row.title)} #${Number(row.jobOrderID || 0)}`;
    case 'company': return String(row.companyName || '');
    case 'status': return String(row.status || '');
    case 'priority': {
      const priorityValue = normalizeJobOrderPriorityValue((row as { priority?: string }).priority, row.isHot);
      return toDisplayText((row as { priorityLabel?: string }).priorityLabel, getJobOrderPriorityLabel(priorityValue));
    }
    case 'openings': return String(Number(row.openings || 0));
    case 'remainingOpenings': return String(Number(row.remainingOpenings || 0));
    case 'internalValidation': return String(Number(row.internalValidation || 0));
    case 'customerInterview': return String(Number(row.clientInterview || 0));
    case 'proposed': return String(Number(row.proposed || 0));
    case 'hired': return String(Number(row.hired || 0));
    case 'rejected': return String(Number(row.rejected || 0));
    case 'owner': return String(row.ownerName || '');
    case 'recruiter': return String(row.recruiterName || '');
    case 'monitor': return row.isMonitored ? 'Monitored' : 'Not Monitored';
    case 'actions': return '';
    default: return '';
  }
}

const REJECTION_PIE_PALETTE = ['#d55454', '#e77b4f', '#d38f2f', '#9d658a', '#4f7da8', '#4b9589', '#627f58'];

function buildPieBackground(slices: Array<{ count: number; color: string }>): string {
  const total = slices.reduce((sum, slice) => sum + Math.max(0, Number(slice.count || 0)), 0);
  if (total <= 0) {
    return 'radial-gradient(circle at center, #ffffff 0, #ffffff 61%, #f2f6f9 62%, #f2f6f9 100%)';
  }

  let offset = 0;
  const segments: string[] = [];
  slices.forEach((slice) => {
    const value = Math.max(0, Number(slice.count || 0));
    if (value <= 0) {
      return;
    }
    const start = offset;
    const span = (value / total) * 100;
    const end = Math.min(100, start + span);
    segments.push(`${slice.color} ${start}% ${end}%`);
    offset = end;
  });

  if (segments.length === 0) {
    return 'radial-gradient(circle at center, #ffffff 0, #ffffff 61%, #f2f6f9 62%, #f2f6f9 100%)';
  }

  return `conic-gradient(${segments.join(', ')})`;
}

const stripDiacritics = (input: string) => input.normalize('NFD').replace(/\p{Diacritic}/gu, '');

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

function splitColumnFilterValues(columnKey: JobOrderDataColumnKey, rawValue: string): string[] {
  const normalized = String(rawValue || '').trim();
  if (normalized === '') {
    return [];
  }

  if (columnKey === 'jobOrder' || columnKey === 'company') {
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

function emptyColumnFilters(): Record<JobOrderDataColumnKey, string> {
  return {
    jobOrder: '',
    company: '',
    status: '',
    priority: '',
    openings: '',
    remainingOpenings: '',
    internalValidation: '',
    customerInterview: '',
    proposed: '',
    hired: '',
    rejected: '',
    owner: '',
    recruiter: '',
    monitor: '',
    actions: ''
  };
}

function emptyColumnOptions(): Record<JobOrderDataColumnKey, string[]> {
  return {
    jobOrder: [],
    company: [],
    status: [],
    priority: [],
    openings: [],
    remainingOpenings: [],
    internalValidation: [],
    customerInterview: [],
    proposed: [],
    hired: [],
    rejected: [],
    owner: [],
    recruiter: [],
    monitor: [],
    actions: []
  };
}

function normalizeVisibleColumns(visibleColumns: unknown): JobOrderColumnVisibility {
  const normalized: JobOrderColumnVisibility = { ...DEFAULT_VISIBLE_COLUMNS };
  if (!visibleColumns || typeof visibleColumns !== 'object') {
    return normalized;
  }

  const payload = visibleColumns as Record<string, unknown>;
  (Object.keys(DEFAULT_VISIBLE_COLUMNS) as JobOrderDataColumnKey[]).forEach((columnKey) => {
    if (Object.prototype.hasOwnProperty.call(payload, columnKey)) {
      normalized[columnKey] = Boolean(payload[columnKey]);
    }
  });

  return normalized;
}

function isJobOrderSearchMatch(row: JobOrderRow, query: string): boolean {
  const normalizedQuery = normalizeFilterToken(query);
  if (normalizedQuery === '') {
    return true;
  }

  const searchableValues = [
    row.title,
    row.companyName,
    row.status,
    row.ownerName,
    row.recruiterName,
    String(row.jobOrderID || '')
  ].map((value) => normalizeFilterToken(String(value || '')));

  return searchableValues.some((value) => value.includes(normalizedQuery));
}

type JobOrderStatusModalState = {
  jobOrderID: number;
  title: string;
  status: string;
  pending: boolean;
  error: string;
};

type JobOrderPriorityModalState = {
  jobOrderID: number;
  title: string;
  priority: 'low' | 'standard' | 'high';
  pending: boolean;
  error: string;
};

type JobOrderAssignmentModalState = {
  jobOrderID: number;
  title: string;
  ownerUserID: number;
  recruiterUserID: number;
  pending: boolean;
  error: string;
};

type JobOrderAssignCandidateModalState = {
  sourceURL: string;
  title: string;
  initialSearchTerm: string;
};

export function JobOrdersListPage({ bootstrap }: Props) {
  const [data, setData] = useState<JobOrdersListModernDataResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { serverQueryString, applyServerQuery } = useServerQueryState(bootstrap.indexName);
  const [reloadToken, setReloadToken] = useState(0);
  const [searchDraft, setSearchDraft] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<JobOrderColumnVisibility>(DEFAULT_VISIBLE_COLUMNS);
  const [activeHeaderMenuColumn, setActiveHeaderMenuColumn] = useState<JobOrderDataColumnKey | null>(null);
  const [activeRowActionMenuJobOrderID, setActiveRowActionMenuJobOrderID] = useState<number | null>(null);
  const [headerMenuSearch, setHeaderMenuSearch] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<JobOrderDataColumnKey, string>>(emptyColumnFilters());
  const [monitorTogglePendingIDs, setMonitorTogglePendingIDs] = useState<number[]>([]);
  const [monitorToggleError, setMonitorToggleError] = useState('');
  const [quickActionError, setQuickActionError] = useState('');
  const [statusModal, setStatusModal] = useState<JobOrderStatusModalState | null>(null);
  const [priorityModal, setPriorityModal] = useState<JobOrderPriorityModalState | null>(null);
  const [assignmentModal, setAssignmentModal] = useState<JobOrderAssignmentModalState | null>(null);
  const [assignCandidateModal, setAssignCandidateModal] = useState<JobOrderAssignCandidateModalState | null>(null);
  const [rejectionBreakdownModal, setRejectionBreakdownModal] = useState<{
    jobOrderID: number;
    jobOrderTitle: string;
    loading: boolean;
    error: string;
    data: JobOrderRejectionReasonBreakdownModernDataResponse | null;
  } | null>(null);
  const columnsMenuRef = useRef<HTMLDetailsElement | null>(null);
  const columnStorageKey = useMemo(
    () => `opencats:modern:${bootstrap.siteID}:${bootstrap.userID}:joborders:list:columns:v6`,
    [bootstrap.siteID, bootstrap.userID]
  );

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    if (!query.get('maxResults')) {
      query.set('maxResults', '50');
    }

    fetchJobOrdersListModernData(bootstrap, query)
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
        setError(err.message || 'Unable to load job orders.');
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
    try {
      const raw = window.localStorage.getItem(columnStorageKey);
      if (!raw) {
        setVisibleColumns(DEFAULT_VISIBLE_COLUMNS);
        return;
      }

      const parsed = JSON.parse(raw) as { visibleColumns?: unknown };
      setVisibleColumns(normalizeVisibleColumns(parsed.visibleColumns));
    } catch (_error) {
      setVisibleColumns(DEFAULT_VISIBLE_COLUMNS);
    }
  }, [columnStorageKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        columnStorageKey,
        JSON.stringify({
          visibleColumns
        })
      );
    } catch (_error) {
      // Ignore persistence issues.
    }
  }, [columnStorageKey, visibleColumns]);

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

    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeColumnsMenu();
        setActiveHeaderMenuColumn(null);
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

  const toggleMonitoredState = useCallback(
    async (row: JobOrderRow) => {
      const jobOrderID = Number(row.jobOrderID || 0);
      if (jobOrderID <= 0) {
        return;
      }

      let alreadyPending = false;
      setMonitorTogglePendingIDs((current) => {
        if (current.includes(jobOrderID)) {
          alreadyPending = true;
          return current;
        }
        return [...current, jobOrderID];
      });

      if (alreadyPending) {
        return;
      }

      setMonitorToggleError('');
      try {
        const result = await setJobOrderMonitored(decodeLegacyURL(row.setMonitoredBaseURL), {
          state: !row.isMonitored
        });
        if (!result.success) {
          setMonitorToggleError(result.message || 'Unable to update monitor setting.');
          return;
        }
        refreshPageData();
      } catch (err: unknown) {
        setMonitorToggleError(err instanceof Error ? err.message : 'Unable to update monitor setting.');
      } finally {
        setMonitorTogglePendingIDs((current) => current.filter((id) => id !== jobOrderID));
      }
    },
    [refreshPageData]
  );

  const openRejectionBreakdown = useCallback(
    async (row: JobOrderRow) => {
      const jobOrderID = Number(row.jobOrderID || 0);
      const rejectedCount = Number(row.rejected || 0);
      if (jobOrderID <= 0 || rejectedCount <= 0) {
        return;
      }

      setRejectionBreakdownModal({
        jobOrderID,
        jobOrderTitle: toDisplayText(row.title, `Job Order #${jobOrderID}`),
        loading: true,
        error: '',
        data: null
      });

      try {
        const breakdown = await fetchJobOrderRejectionReasonBreakdownModernData(bootstrap, jobOrderID);
        setRejectionBreakdownModal((current) => {
          if (!current || current.jobOrderID !== jobOrderID) {
            return current;
          }
          return {
            ...current,
            loading: false,
            data: breakdown
          };
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unable to load rejection reason breakdown.';
        setRejectionBreakdownModal((current) => {
          if (!current || current.jobOrderID !== jobOrderID) {
            return current;
          }
          return {
            ...current,
            loading: false,
            error: message
          };
        });
      }
    },
    [bootstrap]
  );

  const closeRejectionBreakdownModal = useCallback(() => {
    setRejectionBreakdownModal(null);
  }, []);

  const openStatusModalForRow = useCallback((row: JobOrderRow) => {
    setActiveRowActionMenuJobOrderID(null);
    setQuickActionError('');
    setStatusModal({
      jobOrderID: Number(row.jobOrderID || 0),
      title: toDisplayText(row.title, `Job Order #${Number(row.jobOrderID || 0)}`),
      status: String(row.status || ''),
      pending: false,
      error: ''
    });
  }, []);

  const openPriorityModalForRow = useCallback((row: JobOrderRow) => {
    setActiveRowActionMenuJobOrderID(null);
    setQuickActionError('');
    setPriorityModal({
      jobOrderID: Number(row.jobOrderID || 0),
      title: toDisplayText(row.title, `Job Order #${Number(row.jobOrderID || 0)}`),
      priority: normalizeJobOrderPriorityValue(row.priority, row.isHot),
      pending: false,
      error: ''
    });
  }, []);

  const openAssignmentModalForRow = useCallback((row: JobOrderRow) => {
    setActiveRowActionMenuJobOrderID(null);
    setQuickActionError('');
    setAssignmentModal({
      jobOrderID: Number(row.jobOrderID || 0),
      title: toDisplayText(row.title, `Job Order #${Number(row.jobOrderID || 0)}`),
      ownerUserID: Math.max(0, Number(row.ownerUserID || 0)),
      recruiterUserID: Math.max(0, Number(row.recruiterUserID || 0)),
      pending: false,
      error: ''
    });
  }, []);

  const openAddCandidateModalForRow = useCallback((row: JobOrderRow) => {
    setActiveRowActionMenuJobOrderID(null);
    setQuickActionError('');
    setAssignCandidateModal({
      sourceURL: decodeLegacyURL(row.addCandidateURL || ''),
      title: `Assign candidate to ${toDisplayText(row.title, `Job Order #${Number(row.jobOrderID || 0)}`)}`,
      initialSearchTerm: ''
    });
  }, []);

  const submitStatusQuickUpdate = useCallback(async () => {
    if (!data || !statusModal) {
      return;
    }

    const payload = {
      jobOrderID: statusModal.jobOrderID,
      status: statusModal.status
    };

    setStatusModal((current) => (
      current && current.jobOrderID === payload.jobOrderID
        ? { ...current, pending: true, error: '' }
        : current
    ));
    setQuickActionError('');

    try {
      const result = await updateJobOrderQuickAction(data.actions.quickUpdateURL, payload);
      if (!result.success) {
        setStatusModal((current) => (
          current && current.jobOrderID === payload.jobOrderID
            ? { ...current, pending: false, error: result.message || 'Unable to update status.' }
            : current
        ));
        return;
      }

      setStatusModal(null);
      refreshPageData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to update status.';
      setStatusModal((current) => (
        current && current.jobOrderID === payload.jobOrderID
          ? { ...current, pending: false, error: message }
          : current
      ));
      setQuickActionError(message);
    }
  }, [data, refreshPageData, statusModal]);

  const submitPriorityQuickUpdate = useCallback(async () => {
    if (!data || !priorityModal) {
      return;
    }

    const payload = {
      jobOrderID: priorityModal.jobOrderID,
      priority: priorityModal.priority
    };

    setPriorityModal((current) => (
      current && current.jobOrderID === payload.jobOrderID
        ? { ...current, pending: true, error: '' }
        : current
    ));
    setQuickActionError('');

    try {
      const result = await updateJobOrderQuickAction(data.actions.quickUpdateURL, payload);
      if (!result.success) {
        setPriorityModal((current) => (
          current && current.jobOrderID === payload.jobOrderID
            ? { ...current, pending: false, error: result.message || 'Unable to update priority.' }
            : current
        ));
        return;
      }

      setPriorityModal(null);
      refreshPageData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to update priority.';
      setPriorityModal((current) => (
        current && current.jobOrderID === payload.jobOrderID
          ? { ...current, pending: false, error: message }
          : current
      ));
      setQuickActionError(message);
    }
  }, [data, priorityModal, refreshPageData]);

  const submitAssignmentQuickUpdate = useCallback(async () => {
    if (!data || !assignmentModal) {
      return;
    }

    const payload = {
      jobOrderID: assignmentModal.jobOrderID,
      ownerUserID: assignmentModal.ownerUserID,
      recruiterUserID: assignmentModal.recruiterUserID
    };

    setAssignmentModal((current) => (
      current && current.jobOrderID === payload.jobOrderID
        ? { ...current, pending: true, error: '' }
        : current
    ));
    setQuickActionError('');

    try {
      const result = await updateJobOrderQuickAction(data.actions.quickUpdateURL, payload);
      if (!result.success) {
        setAssignmentModal((current) => (
          current && current.jobOrderID === payload.jobOrderID
            ? { ...current, pending: false, error: result.message || 'Unable to update assignment.' }
            : current
        ));
        return;
      }

      setAssignmentModal(null);
      refreshPageData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to update assignment.';
      setAssignmentModal((current) => (
        current && current.jobOrderID === payload.jobOrderID
          ? { ...current, pending: false, error: message }
          : current
      ));
      setQuickActionError(message);
    }
  }, [assignmentModal, data, refreshPageData]);

  const navigateWithFilters = useCallback(
    (next: NavigationFilters) => {
      if (!data) {
        return;
      }

      const nextQuery = new URLSearchParams(serverQueryString);
      nextQuery.set('m', 'joborders');
      nextQuery.set('a', 'listByView');

      const statusValue = String(next.status ?? data.filters.status ?? '').trim();
      if (statusValue === '') {
        nextQuery.delete('view');
        nextQuery.delete('status');
      } else {
        nextQuery.set('view', statusValue);
      }

      const companyID = typeof next.companyID === 'number' ? next.companyID : data.filters.companyID;
      if (companyID > 0) {
        nextQuery.set('companyID', String(companyID));
      } else {
        nextQuery.delete('companyID');
        nextQuery.delete('companyFilter');
      }

      const onlyMyJobOrders = typeof next.onlyMyJobOrders === 'boolean' ? next.onlyMyJobOrders : data.filters.onlyMyJobOrders;
      const showInactive = typeof next.showInactive === 'boolean' ? next.showInactive : data.filters.showInactive;
      nextQuery.set('onlyMyJobOrders', toBooleanString(onlyMyJobOrders));
      nextQuery.set('showInactive', toBooleanString(showInactive));

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

  const statusOptions = useMemo<SelectMenuOption[]>(() => {
    if (!data) {
      return [{ value: '', label: 'All statuses', tone: 'all-statuses' }];
    }

    return (data.options.statuses || []).map((option) => ({
      value: String(option.value || ''),
      label: toDisplayText(option.label, 'Status'),
      tone: buildStatusTone(option.tone)
    }));
  }, [data]);

  const companyOptions = useMemo<SelectMenuOption[]>(() => {
    if (!data) {
      return [{ value: '0', label: 'All companies' }];
    }

    return (data.options.companies || []).map((company) => ({
      value: String(company.companyID || 0),
      label: toDisplayText(company.name, 'Unknown')
    }));
  }, [data]);

  const quickStatusOptions = useMemo<SelectMenuOption[]>(() => {
    if (!data) {
      return [];
    }

    return (data.options.quickActions?.statuses || []).map((option) => ({
      value: String(option.value || ''),
      label: toDisplayText(option.label, 'Status'),
      tone: buildStatusTone(option.tone)
    }));
  }, [data]);

  const quickPriorityOptions = useMemo<Array<{ value: 'low' | 'standard' | 'high'; label: string }>>(() => {
    if (!data) {
      return [
        { value: 'low', label: 'Low' },
        { value: 'standard', label: 'Standard' },
        { value: 'high', label: 'High' }
      ];
    }

    const seen = new Set<string>();
    const normalized = (data.options.quickActions?.priorities || [])
      .map((option) => {
        const value = normalizeJobOrderPriorityValue(option.value);
        if (seen.has(value)) {
          return null;
        }
        seen.add(value);
        return {
          value,
          label: toDisplayText(option.label, getJobOrderPriorityLabel(value))
        };
      })
      .filter((option): option is { value: 'low' | 'standard' | 'high'; label: string } => option !== null);

    return normalized.length > 0
      ? normalized
      : [
          { value: 'low', label: 'Low' },
          { value: 'standard', label: 'Standard' },
          { value: 'high', label: 'High' }
        ];
  }, [data]);

  const quickOwnerOptions = useMemo<Array<{ value: string; label: string }>>(() => {
    if (!data) {
      return [{ value: '0', label: '(Unassigned)' }];
    }

    const options = (data.options.quickActions?.owners || []).map((option) => ({
      value: String(option.value || '0'),
      label: toDisplayText(option.label, '(Unassigned)')
    }));

    return options.length > 0 ? options : [{ value: '0', label: '(Unassigned)' }];
  }, [data]);

  const quickRecruiterOptions = useMemo<Array<{ value: string; label: string }>>(() => {
    if (!data) {
      return [{ value: '0', label: '(Unassigned)' }];
    }

    const options = (data.options.quickActions?.recruiters || []).map((option) => ({
      value: String(option.value || '0'),
      label: toDisplayText(option.label, '(Unassigned)')
    }));

    return options.length > 0 ? options : [{ value: '0', label: '(Unassigned)' }];
  }, [data]);

  const rowsPerPageOptions: SelectMenuOption[] = [
    { value: '25', label: '25 rows' },
    { value: '50', label: '50 rows' },
    { value: '100', label: '100 rows' }
  ];

  const setColumnFilterSelection = useCallback((columnKey: JobOrderDataColumnKey, values: string[]) => {
    const encoded = encodeFilterSelection(values);
    setColumnFilters((current) => ({
      ...current,
      [columnKey]: encoded
    }));
  }, []);

  const toggleColumnFilterValue = useCallback(
    (columnKey: JobOrderDataColumnKey, value: string, checked: boolean) => {
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
    const columns = (Object.keys(DEFAULT_VISIBLE_COLUMNS) as JobOrderDataColumnKey[]).filter(
      (columnKey) => visibleColumns[columnKey]
    );
    return columns.length > 0 ? columns : ['jobOrder'];
  }, [visibleColumns]);

  const visibleTableColumns = useMemo(() => {
    return visibleColumnOrder
      .map((columnKey) => JOB_ORDER_COLUMNS.find((column) => column.key === columnKey) || null)
      .filter((column): column is JobOrderColumnConfig => column !== null);
  }, [visibleColumnOrder]);

  const columnFilterOptions = useMemo(() => {
    const options = emptyColumnOptions();
    if (!data) {
      return options;
    }

    (Object.keys(options) as JobOrderDataColumnKey[]).forEach((columnKey) => {
      const values = new Map<string, string>();
      data.rows.forEach((row) => {
        const rowValues = splitColumnFilterValues(columnKey, getJobOrderColumnValue(row, columnKey));
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
    return (Object.keys(emptyColumnOptions()) as JobOrderDataColumnKey[]).reduce(
      (accumulator, columnKey) => {
        accumulator[columnKey] = new Set(columnFilterOptions[columnKey].map((value) => normalizeFilterToken(value)));
        return accumulator;
      },
      {} as Record<JobOrderDataColumnKey, Set<string>>
    );
  }, [columnFilterOptions]);

  const filteredRows = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.rows.filter((row) => {
      if (!isJobOrderSearchMatch(row, appliedSearch)) {
        return false;
      }

      return (Object.keys(columnFilters) as JobOrderDataColumnKey[]).every((columnKey) => {
        const selection = parseFilterSelection(columnFilters[columnKey] || '');
        const selectedTokens = selection.values
          .map((value) => normalizeFilterToken(value))
          .filter((value) => value !== '');
        if (selectedTokens.length === 0) {
          return true;
        }

        const rowTokens = splitColumnFilterValues(columnKey, getJobOrderColumnValue(row, columnKey))
          .map((value) => normalizeFilterToken(value))
          .filter((value) => value !== '');

        if (selection.isMulti) {
          return selectedTokens.some((token) => rowTokens.includes(token));
        }

        const filterText = selectedTokens[0];
        const rowValue = normalizeFilterToken(getJobOrderColumnValue(row, columnKey));
        if (columnFilterOptionTokens[columnKey].has(filterText)) {
          return rowTokens.includes(filterText);
        }
        return rowValue.includes(filterText);
      });
    });
  }, [appliedSearch, columnFilterOptionTokens, columnFilters, data]);

  if (loading && !data) {
    return <div className="modern-state">Loading job orders...</div>;
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
    return <EmptyState message="No job orders available." />;
  }

  const permissions = data.meta.permissions;
  const canAddJobOrder = isCapabilityEnabled(permissions.canAddJobOrder);
  const canEditJobOrder = isCapabilityEnabled(permissions.canEditJobOrder);
  const canManageRecruiterAllocation = isCapabilityEnabled(permissions.canManageRecruiterAllocation);
  const canToggleMonitored = isCapabilityEnabled(permissions.canToggleMonitored);
  const canAddCandidateToPipeline = isCapabilityEnabled(permissions.canAddCandidateToPipeline);
  const canGoPrev = data.meta.page > 1;
  const canGoNext = data.meta.page < data.meta.totalPages;

  const activeFilters: Array<{ label: string; onRemove: () => void }> = [];
  if (appliedSearch.trim() !== '') {
    activeFilters.push({
      label: `Search: "${appliedSearch.trim()}"`,
      onRemove: () => {
        setSearchDraft('');
        setAppliedSearch('');
      }
    });
  }
  if (data.filters.status.trim() !== '') {
    activeFilters.push({
      label: `Status: ${data.filters.status}`,
      onRemove: () => navigateWithFilters({ status: '', page: 1 })
    });
  }
  if (data.filters.companyID > 0 && data.filters.companyName.trim() !== '') {
    activeFilters.push({
      label: `Company: ${data.filters.companyName}`,
      onRemove: () => navigateWithFilters({ companyID: 0, page: 1 })
    });
  }
  if (data.filters.onlyMyJobOrders) {
    activeFilters.push({
      label: 'My Jobs Only',
      onRemove: () => navigateWithFilters({ onlyMyJobOrders: false, page: 1 })
    });
  }
  if (data.filters.showInactive) {
    activeFilters.push({
      label: 'Including Inactive',
      onRemove: () => navigateWithFilters({ showInactive: false, status: '', page: 1 })
    });
  }

  const hasActiveFilters = activeFilters.length > 0;
  const activeColumnFilterCount = (Object.keys(columnFilters) as JobOrderDataColumnKey[]).filter(
    (columnKey) => (columnFilters[columnKey] || '').trim() !== ''
  ).length;

  const rangeStart = data.meta.totalRows > 0 ? (data.meta.page - 1) * data.meta.entriesPerPage + 1 : 0;
  const rangeEnd = data.meta.totalRows > 0
    ? Math.min(rangeStart + data.rows.length - 1, data.meta.totalRows)
    : 0;

  const hasVisibleRows = filteredRows.length > 0;
  const activeJobsCount = filteredRows.reduce((total, row) => total + (isActiveJobOrderStatus(row.status, row.statusSlug) ? 1 : 0), 0);
  const activeStatusRows = filteredRows.filter((row) => isActiveJobOrderStatus(row.status, row.statusSlug));
  const totalOpenings = activeStatusRows.reduce((total, row) => total + Number(row.remainingOpenings || 0), 0);
  const totalClientInterviewHistorical = filteredRows.reduce(
    (total, row) => total + Number(row.clientInterviewHistorical || 0),
    0
  );
  const totalClientInterviewHistoricalAll = Number(data.summary.clientInterviewHistoricalAll || 0);
  const totalHired = filteredRows.reduce((total, row) => total + Number(row.hired || 0), 0);
  const totalHiredAll = Number(data.summary.hiredAll || 0);
  const totalRejected = filteredRows.reduce((total, row) => total + Number(row.rejected || 0), 0);
  const totalRejectedAll = Number(data.summary.rejectedAll || 0);
  const rejectionBreakdownRows = rejectionBreakdownModal?.data
    ? rejectionBreakdownModal.data.reasons
        .filter((reason) => Number(reason.count || 0) > 0)
        .map((reason, index) => ({
          key: `reason-${Number(reason.reasonID || 0)}-${index}`,
          label: toDisplayText(reason.label, 'Unknown'),
          count: Number(reason.count || 0),
          color: REJECTION_PIE_PALETTE[index % REJECTION_PIE_PALETTE.length]
        }))
    : [];
  const rejectionUnspecifiedCount = Math.max(
    0,
    Number(rejectionBreakdownModal?.data?.summary.candidatesWithoutReasons || 0)
  );
  const rejectionLegendRows = rejectionUnspecifiedCount > 0
    ? [
        ...rejectionBreakdownRows,
        {
          key: 'reason-unspecified',
          label: 'Unspecified',
          count: rejectionUnspecifiedCount,
          color: '#9eb0be'
        }
      ]
    : rejectionBreakdownRows;
  const rejectionLegendTotal = rejectionLegendRows.reduce((total, row) => total + Number(row.count || 0), 0);
  const rejectionPieBackground = buildPieBackground(rejectionLegendRows);
  const rejectionSummary = rejectionBreakdownModal?.data?.summary || null;
  const rejectionSummaryTotalCandidates = Number(rejectionSummary?.totalRejectedCandidates || 0);
  const rejectionSummaryTotalMentions = Number(rejectionSummary?.totalReasonMentions || 0);

  return (
    <div className="avel-dashboard-page avel-candidates-page avel-joborders-page avel-joborders-page--candidate-grammar">
      <PageContainer
        title="Job Orders"
        subtitle="Job order intelligence workspace for allocation, prioritization, and delivery tracking."
        actions={
          <>
            {canAddJobOrder ? (
              <a className="modern-btn modern-btn--emphasis avel-joborders-action avel-joborders-action--add" href={ensureModernUIURL(data.actions.addJobOrderPopupURL)}>
                Add Job Order
              </a>
            ) : null}
            {canManageRecruiterAllocation ? (
              <a className="modern-btn avel-joborders-action avel-joborders-action--allocation" href={ensureModernUIURL(data.actions.recruiterAllocationURL)}>
                Recruiter Allocation
              </a>
            ) : null}
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-candidate-stats-bar" aria-label="Job order overview">
            <div
              className="avel-candidate-stats-bar__item avel-candidate-stats-bar__item--total"
              title="Total number of job orders returned by the current server filters."
            >
              <span className="avel-candidate-stats-bar__label">Total Job Orders</span>
              <strong className="avel-candidate-stats-bar__value">{data.meta.totalRows}</strong>
            </div>
            <span className="avel-candidate-stats-bar__sep" aria-hidden="true" />
            <div
              className="avel-candidate-stats-bar__item avel-candidate-stats-bar__chip"
              title="Jobs with Active status in the currently visible/filtered list."
            >
              <span className="avel-candidate-stats-bar__chip-label">Active</span>
              <strong className="avel-candidate-stats-bar__chip-value">{activeJobsCount}</strong>
            </div>
            <div
              className="avel-candidate-stats-bar__item avel-candidate-stats-bar__item--gdpr avel-candidate-stats-bar__item--openings"
              title="Open positions remaining across currently visible job orders in Active status only."
            >
              <span className="avel-candidate-stats-bar__label">Remaining Openings</span>
              <strong className="avel-candidate-stats-bar__value">{totalOpenings}</strong>
            </div>
            <div
              className="avel-candidate-stats-bar__item avel-candidate-stats-bar__item--pipeline avel-candidate-stats-bar__item--client-interview"
              title="Candidates that reached Customer Interview at any point: first value is for active jobs, parentheses include all filtered jobs (including inactive/closed)."
            >
              <span className="avel-candidate-stats-bar__label">Customer Interview (Active/Hist)</span>
              <strong className="avel-candidate-stats-bar__value">
                {formatCountWithClosed(totalClientInterviewHistorical, totalClientInterviewHistoricalAll)}
              </strong>
            </div>
            <div
              className="avel-candidate-stats-bar__item avel-candidate-stats-bar__item--pipeline avel-candidate-stats-bar__item--hired"
              title="Candidates currently in Hired status for the job orders returned by the current filters; parentheses include all filtered jobs across statuses and closed pipeline entries."
            >
              <span className="avel-candidate-stats-bar__label">Hired</span>
              <strong className="avel-candidate-stats-bar__value">{formatCountWithClosed(totalHired, totalHiredAll)}</strong>
            </div>
            <div
              className="avel-candidate-stats-bar__item avel-candidate-stats-bar__item--pipeline avel-candidate-stats-bar__item--rejected"
              title="Candidates currently in Rejected status for the job orders returned by the current filters; parentheses include all filtered jobs across statuses and closed pipeline entries."
            >
              <span className="avel-candidate-stats-bar__label">Rejected</span>
              <strong className="avel-candidate-stats-bar__value">{formatCountWithClosed(totalRejected, totalRejectedAll)}</strong>
            </div>
          </section>

          <section className="avel-candidate-toolbar modern-command-bar" aria-label="Job order filters and controls">
            <div className="avel-candidate-toolbar__primary">
              <form
                className="modern-command-search avel-candidate-toolbar__search"
                onSubmit={(event) => {
                  event.preventDefault();
                  setAppliedSearch(searchDraft.trim());
                }}
              >
                <span className="modern-command-label">Global Database Search</span>
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
                    placeholder="Search by title, company, owner, recruiter"
                  />
                </span>
              </form>

              <SelectMenu
                label="Status"
                value={data.filters.status || ''}
                options={statusOptions}
                onChange={(value) => navigateWithFilters({ status: value, page: 1 })}
              />

              <SelectMenu
                label="Company"
                value={String(data.filters.companyID || 0)}
                options={companyOptions}
                onChange={(value) => navigateWithFilters({ companyID: Number(value), page: 1 })}
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
                  setSearchDraft('');
                  setAppliedSearch('');
                  setColumnFilters(emptyColumnFilters());
                  setActiveHeaderMenuColumn(null);
                  navigateWithFilters({
                    status: '',
                    companyID: 0,
                    onlyMyJobOrders: false,
                    showInactive: false,
                    sortBy: '',
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
                <input
                  type="checkbox"
                  checked={data.filters.onlyMyJobOrders}
                  onChange={(event) => navigateWithFilters({ onlyMyJobOrders: event.target.checked, page: 1 })}
                />
                <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                <span>My Jobs Only</span>
              </label>
              <label className="modern-command-toggle">
                <input
                  type="checkbox"
                  checked={data.filters.showInactive}
                  onChange={(event) => navigateWithFilters({ showInactive: event.target.checked, status: '', page: 1 })}
                />
                <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                <span>Show Inactive</span>
              </label>
            </div>

            {hasActiveFilters ? (
              <div className="avel-candidate-toolbar__active-strip">
                <span className="modern-command-active__count is-active" aria-live="polite" aria-atomic="true">
                  {activeFilters.length} active filter{activeFilters.length === 1 ? '' : 's'}
                </span>
                {activeFilters.map((filter) => (
                  <button
                    key={filter.label}
                    type="button"
                    className="modern-active-filter modern-active-filter--server"
                    onClick={filter.onRemove}
                    title={`Remove filter: ${filter.label}`}
                  >
                    {filter.label} <span aria-hidden="true">x</span>
                  </button>
                ))}
              </div>
            ) : null}
          </section>

          {data.state.errorMessage ? <div className="modern-state">{data.state.errorMessage}</div> : null}
          {monitorToggleError !== '' ? <div className="modern-state">{monitorToggleError}</div> : null}
          {quickActionError !== '' ? <div className="modern-state modern-state--error">{quickActionError}</div> : null}

          <section className="avel-list-panel avel-candidate-results">
            <div className="avel-list-panel__header">
              <div className="avel-list-panel__header-left">
                <div className="avel-candidate-results__title-row">
                  <h2 className="avel-list-panel__title">
                    Job Order Portfolio {data.meta.totalRows > 0 ? `(${data.meta.totalRows})` : ''}
                  </h2>
                  <span className="avel-candidate-results__scope-note">
                    Local table filters refine only the current page selection.
                  </span>
                </div>
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
                    Filters: {activeColumnFilterCount} x
                  </button>
                ) : null}
                <details className="avel-pipeline-matrix__columns-menu" ref={columnsMenuRef}>
                  <summary className="modern-chip modern-chip--column-toggle">Columns</summary>
                  <div className="avel-pipeline-matrix__columns-panel">
                    {(Object.keys(DEFAULT_VISIBLE_COLUMNS) as JobOrderDataColumnKey[]).map((columnKey) => {
                      const column = JOB_ORDER_COLUMNS.find((entry) => entry.key === columnKey);
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
                                  const visibleCount = (Object.keys(current) as JobOrderDataColumnKey[]).reduce(
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
              <EmptyState message="No job orders match current filters." />
            ) : (
              <div className="modern-table-wrap avel-candidate-results__table-wrap">
                <table className="modern-table avel-candidate-results__table">
                  <thead>
                    <tr>
                      {visibleTableColumns.map((col) => {
                        const isSorted = col.sortKey !== '' && data.meta.sortBy === col.sortKey;
                        const columnKey = col.key;
                        const isMetricColumn =
                          columnKey === 'openings' ||
                          columnKey === 'remainingOpenings' ||
                          columnKey === 'internalValidation' ||
                          columnKey === 'customerInterview' ||
                          columnKey === 'proposed' ||
                          columnKey === 'hired' ||
                          columnKey === 'rejected';
                        const isFilterable = col.filterable === true;
                        const isFilterOpen = activeHeaderMenuColumn === columnKey;
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

                        const headerClasses = [
                          isFilterOpen ? 'avel-col-filter--active' : '',
                          isMetricColumn ? 'avel-joborders-metric-column' : ''
                        ]
                          .filter(Boolean)
                          .join(' ');

                        return (
                          <th key={col.key} className={headerClasses}>
                            <div className="avel-pipeline-matrix__th-shell">
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
                              {(columnFilters[columnKey] || '').trim() !== '' ? (
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
                                      const numericValue = Number(optionValue);
                                      const statusTone = buildJobOrderStatusTone(optionValue, optionValue);

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
                                          {columnKey === 'status' ? (
                                            <span className={`modern-chip modern-chip--jo-status-${statusTone}`}>{optionValue}</span>
                                          ) : columnKey === 'priority' ? (
                                            <span
                                              className={`modern-chip ${getJobOrderPriorityChipClass(
                                                normalizeJobOrderPriorityValue(optionValue)
                                              )}`}
                                            >
                                              {optionValue}
                                            </span>
                                          ) : columnKey === 'monitor' ? (
                                            <span className={`modern-chip modern-chip--monitor ${optionValue === 'Monitored' ? 'modern-chip--monitor-on' : 'modern-chip--monitor-off'}`}>
                                              {optionValue}
                                            </span>
                                          ) : columnKey === 'openings' || columnKey === 'remainingOpenings' ? (
                                            <span className={`modern-chip ${numericValue > 0 ? 'modern-chip--openings' : 'modern-chip--openings-zero'}`}>
                                              {optionValue}
                                            </span>
                                          ) : columnKey === 'customerInterview' ? (
                                            <span className={`modern-chip ${numericValue > 0 ? 'modern-chip--metric-customer-interview' : 'modern-chip--openings-zero'}`}>
                                              {optionValue}
                                            </span>
                                          ) : columnKey === 'hired' ? (
                                            <span className={`modern-chip ${numericValue > 0 ? 'modern-chip--metric-hired' : 'modern-chip--openings-zero'}`}>
                                              {optionValue}
                                            </span>
                                          ) : columnKey === 'rejected' ? (
                                            <span className={`modern-chip ${numericValue > 0 ? 'modern-chip--metric-rejected' : 'modern-chip--openings-zero'}`}>
                                              {optionValue}
                                            </span>
                                          ) : columnKey === 'internalValidation' || columnKey === 'proposed' ? (
                                            <span className={`modern-chip ${numericValue > 0 ? 'modern-chip--success' : 'modern-chip--openings-zero'}`}>
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
                    {filteredRows.map((row) => (
                      <tr key={row.jobOrderID}>
                        {visibleTableColumns.map((column) => {
                          switch (column.key) {
                            case 'jobOrder':
                              {
                                const rowPriorityValue = normalizeJobOrderPriorityValue(row.priority, row.isHot);
                                const rowPriorityLabel = toDisplayText(row.priorityLabel, getJobOrderPriorityLabel(rowPriorityValue));
                                return (
                                  <td key={`${row.jobOrderID}-jobOrder`} className="avel-candidate-table__candidate avel-joborders-table__joborder">
                                    <div className="avel-candidate-table__title-row">
                                      <a className="modern-link avel-candidate-table__name" href={ensureModernUIURL(row.showURL)}>
                                        {toDisplayText(row.title, 'Job Order')} <span className="avel-candidate-table__id">#{row.jobOrderID}</span>
                                      </a>
                                      <div className="avel-candidate-table__quick-tags">
                                        {row.isMonitored ? <span className="modern-chip modern-chip--success">Monitored</span> : null}
                                        <span className={`modern-chip ${getJobOrderPriorityChipClass(rowPriorityValue)}`}>
                                          {rowPriorityLabel}
                                        </span>
                                        {row.hasAttachment ? <span className="modern-chip modern-chip--resume">Attachment</span> : null}
                                        {row.commentCount > 0 ? (
                                          <span className="modern-chip modern-chip--info">{row.commentCount} comments</span>
                                        ) : null}
                                      </div>
                                    </div>
                                    <div className="avel-candidate-table__meta">
                                      {toDisplayText(row.companyName)} | {Math.max(0, Number(row.daysOld || 0))} days old | Added {toDisplayText(row.dateCreated)}
                                    </div>
                                  </td>
                                );
                              }
                            case 'company':
                              return (
                                <td key={`${row.jobOrderID}-company`}>
                                  <a className="modern-link" href={ensureModernUIURL(row.companyURL)}>
                                    {toDisplayText(row.companyName)}
                                  </a>
                                </td>
                              );
                            case 'status':
                              return (
                                <td key={`${row.jobOrderID}-status`}>
                                  <span className={`modern-chip modern-chip--jo-status-${buildJobOrderStatusTone(row.status, row.statusSlug)}`}>
                                    {toDisplayText(row.status)}
                                  </span>
                                </td>
                              );
                            case 'priority':
                              {
                                const rowPriorityValue = normalizeJobOrderPriorityValue(row.priority, row.isHot);
                                const rowPriorityLabel = toDisplayText(row.priorityLabel, getJobOrderPriorityLabel(rowPriorityValue));
                                return (
                                  <td key={`${row.jobOrderID}-priority`}>
                                    <span className={`modern-chip ${getJobOrderPriorityChipClass(rowPriorityValue)}`}>
                                      {rowPriorityLabel}
                                    </span>
                                  </td>
                                );
                              }
                            case 'openings':
                              return (
                                <td key={`${row.jobOrderID}-openings`} className="avel-joborders-metric-cell">
                                  <span
                                    className={`modern-chip ${
                                      row.openings > 0
                                        ? (isCountedPositionStatus(row.status, row.statusSlug) ? 'modern-chip--openings' : 'modern-chip--openings-not-counted')
                                        : 'modern-chip--openings-zero'
                                    }`}
                                  >
                                    {row.openings}
                                  </span>
                                </td>
                              );
                            case 'remainingOpenings':
                              return (
                                <td key={`${row.jobOrderID}-remainingOpenings`} className="avel-joborders-metric-cell">
                                  <span
                                    className={`modern-chip ${
                                      row.remainingOpenings > 0
                                        ? (isCountedPositionStatus(row.status, row.statusSlug) ? 'modern-chip--openings modern-chip--info' : 'modern-chip--openings-not-counted')
                                        : 'modern-chip--openings-zero'
                                    }`}
                                  >
                                    {row.remainingOpenings}
                                  </span>
                                </td>
                              );
                            case 'internalValidation':
                              return (
                                <td key={`${row.jobOrderID}-internalValidation`} className="avel-joborders-metric-cell">
                                  <span className={`modern-chip ${row.internalValidation > 0 ? 'modern-chip--success' : 'modern-chip--openings-zero'}`}>
                                    {row.internalValidation}
                                  </span>
                                </td>
                              );
                            case 'customerInterview':
                              return (
                                <td key={`${row.jobOrderID}-customerInterview`} className="avel-joborders-metric-cell">
                                  <span className={`modern-chip ${row.clientInterview > 0 ? 'modern-chip--metric-customer-interview' : 'modern-chip--openings-zero'}`}>
                                    {row.clientInterview}
                                  </span>
                                </td>
                              );
                            case 'proposed':
                              return (
                                <td key={`${row.jobOrderID}-proposed`} className="avel-joborders-metric-cell">
                                  <span className={`modern-chip ${row.proposed > 0 ? 'modern-chip--success' : 'modern-chip--openings-zero'}`}>
                                    {row.proposed}
                                  </span>
                                </td>
                              );
                            case 'hired':
                              return (
                                <td key={`${row.jobOrderID}-hired`} className="avel-joborders-metric-cell">
                                  <span className={`modern-chip ${row.hired > 0 ? 'modern-chip--metric-hired' : 'modern-chip--openings-zero'}`}>
                                    {row.hired}
                                  </span>
                                </td>
                              );
                            case 'rejected':
                              return (
                                <td key={`${row.jobOrderID}-rejected`} className="avel-joborders-metric-cell">
                                  {row.rejected > 0 ? (
                                    <button
                                      type="button"
                                      className="modern-chip modern-chip--metric-rejected avel-joborders-metric-drilldown"
                                      onClick={() => void openRejectionBreakdown(row)}
                                      title="View rejected reasons breakdown"
                                    >
                                      {row.rejected}
                                    </button>
                                  ) : (
                                    <span className="modern-chip modern-chip--openings-zero">{row.rejected}</span>
                                  )}
                                </td>
                              );
                            case 'owner':
                              return <td key={`${row.jobOrderID}-owner`}>{toDisplayText(row.ownerName)}</td>;
                            case 'recruiter':
                              return <td key={`${row.jobOrderID}-recruiter`}>{toDisplayText(row.recruiterName)}</td>;
                            case 'monitor':
                              return (
                                <td key={`${row.jobOrderID}-monitor`}>
                                  {canToggleMonitored ? (
                                    <button
                                      type="button"
                                      className={`modern-chip modern-chip--monitor ${row.isMonitored ? 'modern-chip--monitor-on' : 'modern-chip--monitor-off'}`}
                                      onClick={() => void toggleMonitoredState(row)}
                                      disabled={monitorTogglePendingIDs.includes(Number(row.jobOrderID || 0))}
                                    >
                                      {monitorTogglePendingIDs.includes(Number(row.jobOrderID || 0))
                                        ? 'Updating...'
                                        : row.isMonitored
                                          ? 'Monitored'
                                          : 'Not Monitored'}
                                    </button>
                                  ) : (
                                    <span className={`modern-chip modern-chip--monitor ${row.isMonitored ? 'modern-chip--monitor-on' : 'modern-chip--monitor-off'}`}>
                                      {row.isMonitored ? 'Monitored' : 'Not Monitored'}
                                    </span>
                                  )}
                                </td>
                              );
                            case 'actions': {
                              const hasOpenDetailsAction = String(row.showURL || '').trim() !== '';
                              const hasEditAction = canEditJobOrder && String(row.editURL || '').trim() !== '';
                              const hasHiringPlanAction = canEditJobOrder && String(row.hiringPlanURL || '').trim() !== '';
                              const hasAddCandidateAction = canAddCandidateToPipeline && String(row.addCandidateURL || '').trim() !== '';
                              const hasStatusAction = canEditJobOrder;
                              const hasPriorityAction = canEditJobOrder;
                              const hasAssignmentAction = canManageRecruiterAllocation;
                              const hasAnyAction =
                                hasOpenDetailsAction ||
                                hasEditAction ||
                                hasHiringPlanAction ||
                                hasAddCandidateAction ||
                                hasStatusAction ||
                                hasPriorityAction ||
                                hasAssignmentAction;

                              if (!hasAnyAction) {
                                return (
                                  <td key={`${row.jobOrderID}-actions`}>
                                    <span className="avel-candidate-row-menu__empty">—</span>
                                  </td>
                                );
                              }

                              return (
                                <td key={`${row.jobOrderID}-actions`} className="avel-candidate-row-menu-cell">
                                  <RowActionMenu
                                    isOpen={activeRowActionMenuJobOrderID === row.jobOrderID}
                                    onToggle={() =>
                                      setActiveRowActionMenuJobOrderID((current) =>
                                        current === row.jobOrderID ? null : row.jobOrderID
                                      )
                                    }
                                    onClose={() => setActiveRowActionMenuJobOrderID(null)}
                                    triggerLabel={`Open actions for ${toDisplayText(row.title, 'job order')}`}
                                    menuLabel="Job order actions"
                                  >
                                    {hasStatusAction ? (
                                      <button
                                        type="button"
                                        className="avel-candidate-row-menu__item"
                                        role="menuitem"
                                        onClick={() => openStatusModalForRow(row)}
                                      >
                                        Change Status
                                      </button>
                                    ) : null}
                                    {hasPriorityAction ? (
                                      <button
                                        type="button"
                                        className="avel-candidate-row-menu__item"
                                        role="menuitem"
                                        onClick={() => openPriorityModalForRow(row)}
                                      >
                                        Change Priority
                                      </button>
                                    ) : null}
                                    {hasAddCandidateAction ? (
                                      <button
                                        type="button"
                                        className="avel-candidate-row-menu__item"
                                        role="menuitem"
                                        onClick={() => openAddCandidateModalForRow(row)}
                                      >
                                        Add Candidate
                                      </button>
                                    ) : null}
                                    {hasOpenDetailsAction ? (
                                      <a
                                        className="avel-candidate-row-menu__item"
                                        role="menuitem"
                                        href={ensureModernUIURL(row.showURL)}
                                        onClick={() => setActiveRowActionMenuJobOrderID(null)}
                                      >
                                        Open Job Order
                                      </a>
                                    ) : null}
                                    {hasEditAction ? (
                                      <a
                                        className="avel-candidate-row-menu__item"
                                        role="menuitem"
                                        href={ensureModernUIURL(row.editURL)}
                                        onClick={() => setActiveRowActionMenuJobOrderID(null)}
                                      >
                                        Edit Job Order
                                      </a>
                                    ) : null}
                                    {hasHiringPlanAction ? (
                                      <a
                                        className="avel-candidate-row-menu__item"
                                        role="menuitem"
                                        href={ensureModernUIURL(row.hiringPlanURL)}
                                        onClick={() => setActiveRowActionMenuJobOrderID(null)}
                                      >
                                        Open Hiring Plan
                                      </a>
                                    ) : null}
                                    {hasAssignmentAction ? (
                                      <button
                                        type="button"
                                        className="avel-candidate-row-menu__item"
                                        role="menuitem"
                                        onClick={() => openAssignmentModalForRow(row)}
                                      >
                                        Assign Recruiter/Owner
                                      </button>
                                    ) : null}
                                  </RowActionMenu>
                                </td>
                              );
                            }
                            default:
                              return null;
                          }
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {statusModal ? (
            <InlineModal
              isOpen={Boolean(statusModal)}
              ariaLabel="Change job order status"
              dialogClassName="modern-inline-modal__dialog--status modern-inline-modal__dialog--compact"
              onClose={() => {
                if (!statusModal.pending) {
                  setStatusModal(null);
                }
              }}
            >
              <div className="modern-inline-modal__header">
                <h3>Change Status</h3>
                <p>{statusModal.title}</p>
              </div>
              <div className="modern-inline-modal__body modern-inline-modal__body--form">
                <label className="modern-command-field">
                  <span className="modern-command-label">Status</span>
                  <select
                    className="avel-form-control"
                    value={statusModal.status}
                    onChange={(event) =>
                      setStatusModal((current) => (
                        current
                          ? { ...current, status: String(event.target.value || ''), error: '' }
                          : current
                      ))
                    }
                    disabled={statusModal.pending}
                  >
                    {quickStatusOptions.map((option) => (
                      <option key={`joborder-status-${option.value}`} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                {statusModal.error !== '' ? (
                  <div className="modern-state modern-state--error">{statusModal.error}</div>
                ) : null}
              </div>
              <div className="modern-inline-modal__actions">
                <button
                  type="button"
                  className="modern-btn modern-btn--secondary"
                  onClick={() => setStatusModal(null)}
                  disabled={statusModal.pending}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="modern-btn modern-btn--emphasis"
                  onClick={() => void submitStatusQuickUpdate()}
                  disabled={statusModal.pending || String(statusModal.status || '').trim() === ''}
                >
                  {statusModal.pending ? 'Saving...' : 'Save Status'}
                </button>
              </div>
            </InlineModal>
          ) : null}

          {priorityModal ? (
            <InlineModal
              isOpen={Boolean(priorityModal)}
              ariaLabel="Change job order priority"
              dialogClassName="modern-inline-modal__dialog--status modern-inline-modal__dialog--compact"
              onClose={() => {
                if (!priorityModal.pending) {
                  setPriorityModal(null);
                }
              }}
            >
              <div className="modern-inline-modal__header">
                <h3>Change Priority</h3>
                <p>{priorityModal.title}</p>
              </div>
              <div className="modern-inline-modal__body modern-inline-modal__body--form">
                <label className="modern-command-field">
                  <span className="modern-command-label">Priority</span>
                  <select
                    className="avel-form-control"
                    value={priorityModal.priority}
                    onChange={(event) =>
                      setPriorityModal((current) => (
                        current
                          ? {
                              ...current,
                              priority: normalizeJobOrderPriorityValue(event.target.value),
                              error: ''
                            }
                          : current
                      ))
                    }
                    disabled={priorityModal.pending}
                  >
                    {quickPriorityOptions.map((option) => (
                      <option key={`joborder-priority-${option.value}`} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                {priorityModal.error !== '' ? (
                  <div className="modern-state modern-state--error">{priorityModal.error}</div>
                ) : null}
              </div>
              <div className="modern-inline-modal__actions">
                <button
                  type="button"
                  className="modern-btn modern-btn--secondary"
                  onClick={() => setPriorityModal(null)}
                  disabled={priorityModal.pending}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="modern-btn modern-btn--emphasis"
                  onClick={() => void submitPriorityQuickUpdate()}
                  disabled={priorityModal.pending}
                >
                  {priorityModal.pending ? 'Saving...' : 'Save Priority'}
                </button>
              </div>
            </InlineModal>
          ) : null}

          {assignmentModal ? (
            <InlineModal
              isOpen={Boolean(assignmentModal)}
              ariaLabel="Assign recruiter or owner"
              dialogClassName="modern-inline-modal__dialog--status modern-inline-modal__dialog--compact"
              onClose={() => {
                if (!assignmentModal.pending) {
                  setAssignmentModal(null);
                }
              }}
            >
              <div className="modern-inline-modal__header">
                <h3>Assign Recruiter/Owner</h3>
                <p>{assignmentModal.title}</p>
              </div>
              <div className="modern-inline-modal__body modern-inline-modal__body--form">
                <label className="modern-command-field">
                  <span className="modern-command-label">Owner</span>
                  <select
                    className="avel-form-control"
                    value={String(assignmentModal.ownerUserID)}
                    onChange={(event) =>
                      setAssignmentModal((current) => (
                        current
                          ? { ...current, ownerUserID: Math.max(0, Number(event.target.value || 0)), error: '' }
                          : current
                      ))
                    }
                    disabled={assignmentModal.pending}
                  >
                    {quickOwnerOptions.map((option) => (
                      <option key={`joborder-owner-${option.value}`} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="modern-command-field">
                  <span className="modern-command-label">Recruiter</span>
                  <select
                    className="avel-form-control"
                    value={String(assignmentModal.recruiterUserID)}
                    onChange={(event) =>
                      setAssignmentModal((current) => (
                        current
                          ? { ...current, recruiterUserID: Math.max(0, Number(event.target.value || 0)), error: '' }
                          : current
                      ))
                    }
                    disabled={assignmentModal.pending}
                  >
                    {quickRecruiterOptions.map((option) => (
                      <option key={`joborder-recruiter-${option.value}`} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                {assignmentModal.error !== '' ? (
                  <div className="modern-state modern-state--error">{assignmentModal.error}</div>
                ) : null}
              </div>
              <div className="modern-inline-modal__actions">
                <button
                  type="button"
                  className="modern-btn modern-btn--secondary"
                  onClick={() => setAssignmentModal(null)}
                  disabled={assignmentModal.pending}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="modern-btn modern-btn--emphasis"
                  onClick={() => void submitAssignmentQuickUpdate()}
                  disabled={assignmentModal.pending}
                >
                  {assignmentModal.pending ? 'Saving...' : 'Save Assignment'}
                </button>
              </div>
            </InlineModal>
          ) : null}

          <JobOrderAssignCandidateModal
            isOpen={Boolean(assignCandidateModal)}
            bootstrap={bootstrap}
            sourceURL={assignCandidateModal?.sourceURL || ''}
            subtitle={assignCandidateModal?.title || ''}
            initialSearchTerm={assignCandidateModal?.initialSearchTerm || ''}
            onClose={() => setAssignCandidateModal(null)}
            onAssigned={() => {
              setQuickActionError('');
              refreshPageData();
            }}
          />

          {rejectionBreakdownModal ? (
            <InlineModal
              isOpen={Boolean(rejectionBreakdownModal)}
              ariaLabel="Rejected reason breakdown"
              dialogClassName="modern-inline-modal__dialog--status modern-inline-modal__dialog--compact avel-joborders-rejection-breakdown-modal"
              onClose={closeRejectionBreakdownModal}
            >
              <div className="modern-inline-modal__header">
                <h3>Rejected Reasons</h3>
                <p>
                  {toDisplayText(rejectionBreakdownModal.jobOrderTitle)}
                  {rejectionBreakdownModal.data?.jobOrder.companyName
                    ? ` • ${toDisplayText(rejectionBreakdownModal.data.jobOrder.companyName)}`
                    : ''}
                </p>
              </div>
              <div className="modern-inline-modal__body modern-inline-modal__body--form">
                {rejectionBreakdownModal.loading ? (
                  <div className="modern-state">Loading rejection reasons…</div>
                ) : rejectionBreakdownModal.error ? (
                  <div className="modern-state modern-state--error">{rejectionBreakdownModal.error}</div>
                ) : rejectionBreakdownModal.data ? (
                  <div className="avel-joborders-rejection-breakdown">
                    <div className="avel-joborders-rejection-breakdown__hero">
                      <div
                        className="avel-joborders-rejection-breakdown__pie"
                        style={{ background: rejectionPieBackground }}
                        aria-hidden="true"
                      />
                      <div className="avel-joborders-rejection-breakdown__totals">
                        <div className="avel-joborders-rejection-breakdown__total">
                          <span>Total Rejected</span>
                          <strong>{rejectionSummaryTotalCandidates}</strong>
                        </div>
                        <div className="avel-joborders-rejection-breakdown__total">
                          <span>Reason Mentions</span>
                          <strong>{rejectionSummaryTotalMentions}</strong>
                        </div>
                      </div>
                    </div>

                    {rejectionLegendRows.length > 0 ? (
                      <ul className="avel-joborders-rejection-breakdown__legend">
                        {rejectionLegendRows.map((reasonRow) => {
                          const count = Math.max(0, Number(reasonRow.count || 0));
                          const percent = rejectionLegendTotal > 0
                            ? Math.round((count / rejectionLegendTotal) * 100)
                            : 0;
                          return (
                            <li key={reasonRow.key}>
                              <span className="avel-joborders-rejection-breakdown__legend-swatch" style={{ background: reasonRow.color }} />
                              <span className="avel-joborders-rejection-breakdown__legend-label">{toDisplayText(reasonRow.label)}</span>
                              <span className="avel-joborders-rejection-breakdown__legend-value">{count}</span>
                              <span className="avel-joborders-rejection-breakdown__legend-percent">{percent}%</span>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="modern-state">No rejection reasons recorded for this job order.</div>
                    )}

                    {rejectionUnspecifiedCount > 0 ? (
                      <p className="avel-joborders-rejection-breakdown__footnote">
                        Unspecified means rejected candidates without an assigned rejection reason.
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <div className="modern-state">No rejection data available.</div>
                )}
              </div>
              <div className="modern-inline-modal__actions">
                <button type="button" className="modern-btn modern-btn--secondary" onClick={closeRejectionBreakdownModal}>
                  Close
                </button>
              </div>
            </InlineModal>
          ) : null}
        </div>
      </PageContainer>
    </div>
  );
}
