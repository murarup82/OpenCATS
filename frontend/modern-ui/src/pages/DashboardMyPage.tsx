import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  fetchDashboardModernData,
  fetchPipelineStatusDetailsModernData,
  setDashboardPipelineStatus,
  updatePipelineStatusHistoryDate
} from '../lib/api';
import type {
  DashboardModernDataResponse,
  PipelineStatusDetailsModernDataResponse,
  UIModeBootstrap
} from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { DataTable } from '../components/primitives/DataTable';
import { LegacyFrameModal } from '../components/primitives/LegacyFrameModal';
import { PipelineStatusChangeModal } from '../components/primitives/PipelineStatusChangeModal';
import type { FullStatusChangePayload } from '../components/primitives/PipelineStatusChangeModal';
import { QuickAssignModal } from '../components/primitives/QuickAssignModal';
import { PipelineDetailsInlineModal } from '../components/primitives/PipelineDetailsInlineModal';
import { PipelineQuickStatusModal } from '../components/primitives/PipelineQuickStatusModal';
import { PipelineRejectionModal } from '../components/primitives/PipelineRejectionModal';
import { PipelineStatusCommentModal } from '../components/primitives/PipelineStatusCommentModal';
import { MutationToast } from '../components/primitives/MutationToast';
import { DashboardToolbar } from '../components/dashboard/DashboardToolbar';
import { KanbanBoard } from '../components/dashboard/KanbanBoard';
import { DashboardKanbanSkeleton } from '../components/dashboard/DashboardKanbanSkeleton';
import { DashboardListView } from '../components/dashboard/DashboardListView';
import type { DashboardRow, DashboardStatusColumn } from '../components/dashboard/types';
import { ensureModernUIURL } from '../lib/navigation';
import { usePageRefreshEvents } from '../lib/usePageRefreshEvents';
import { isCapabilityEnabled } from '../lib/routeGuards';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type StatusCatalogEntry = {
  statusID: number;
  statusLabel: string;
  statusSlug: string;
};

type NavigationFilters = {
  scope?: string;
  companyID?: string;
  jobOrderID?: string;
  showClosed?: boolean;
  showMonitored?: boolean;
  page?: number;
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

function toSearchText(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return '';
}

function toStatusSlug(value: string): string {
  const slug = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'unknown';
}

function createStatusClassName(statusLabel: string): string {
  return `modern-status modern-status--${toStatusSlug(statusLabel)}`;
}

function decodeLegacyURL(url: string): string {
  return String(url || '').replace(/&amp;/g, '&');
}

export function DashboardMyPage({ bootstrap }: Props) {
  const [data, setData] = useState<DashboardModernDataResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [serverQueryString, setServerQueryString] = useState<string>(() => new URLSearchParams(window.location.search).toString());
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>(() => {
    const query = new URLSearchParams(window.location.search);
    return query.get('mode') === 'list' ? 'list' : 'kanban';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [localStatusID, setLocalStatusID] = useState<string>('all');
  const [reloadToken, setReloadToken] = useState(0);
  const [fullStatusModal, setFullStatusModal] = useState<{
    row: DashboardRow;
    targetStatusID: number;
    title: string;
    currentStatusLabel: string;
    statusOptions: Array<{ statusID: number; statusLabel: string }>;
    legacyFormURL: string;
  } | null>(null);
  const [fullStatusPending, setFullStatusPending] = useState(false);
  const [fullStatusError, setFullStatusError] = useState('');
  const [quickStatusModal, setQuickStatusModal] = useState<{
    row: DashboardRow;
    title: string;
    currentStatusLabel: string;
    statusOptions: Array<{ statusID: number; statusLabel: string }>;
  } | null>(null);
  const [quickStatusPending, setQuickStatusPending] = useState<boolean>(false);
  const [quickStatusError, setQuickStatusError] = useState<string>('');
  const [rejectionModal, setRejectionModal] = useState<{
    row: DashboardRow;
    title: string;
    currentStatusLabel: string;
  } | null>(null);
  const [rejectionPending, setRejectionPending] = useState<boolean>(false);
  const [rejectionError, setRejectionError] = useState<string>('');
  const [kanbanCommentModal, setKanbanCommentModal] = useState<{
    row: DashboardRow;
    targetStatusID: number;
    title: string;
    currentStatusLabel: string;
    targetStatusLabel: string;
  } | null>(null);
  const [kanbanCommentPending, setKanbanCommentPending] = useState<boolean>(false);
  const [kanbanCommentError, setKanbanCommentError] = useState<string>('');
  const [quickAssignOpen, setQuickAssignOpen] = useState<boolean>(false);
  const [detailsModal, setDetailsModal] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const [pipelineDetailsModal, setPipelineDetailsModal] = useState<{
    title: string;
    fullDetailsURL: string;
    pipelineID: number;
    details: PipelineStatusDetailsModernDataResponse | null;
    loading: boolean;
    error: string;
  } | null>(null);
  const [interactionError, setInteractionError] = useState<string>('');
  const [toast, setToast] = useState<{ id: number; message: string; tone: 'success' | 'error' | 'info' } | null>(null);
  const loadRequestRef = useRef(0);
  const listStorageKey = useMemo(
    () => `opencats:modern:${bootstrap.siteID}:${bootstrap.userID}:dashboard:list-view:v1`,
    [bootstrap.siteID, bootstrap.userID]
  );

  useEffect(() => {
    let isMounted = true;
    const requestID = loadRequestRef.current + 1;
    loadRequestRef.current = requestID;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchDashboardModernData(bootstrap, query)
      .then((result) => {
        if (!isMounted || requestID !== loadRequestRef.current) {
          return;
        }
        setData(result);
        setInteractionError('');
      })
      .catch((err: Error) => {
        if (!isMounted || requestID !== loadRequestRef.current) {
          return;
        }
        setError(err.message || 'Unable to load data');
      })
      .finally(() => {
        if (isMounted && requestID === loadRequestRef.current) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [bootstrap, serverQueryString, reloadToken]);

  useEffect(() => {
    const nextURL = new URL(window.location.href);
    nextURL.searchParams.set('mode', viewMode);
    window.history.replaceState({}, '', nextURL.toString());
  }, [viewMode]);

  const navigateWithFilters = (next: NavigationFilters) => {
    if (!data) {
      return;
    }

    const nextQuery = new URLSearchParams(serverQueryString);
    nextQuery.set('m', 'dashboard');
    nextQuery.set('a', 'my');
    nextQuery.set('view', 'kanban');

    const scopeValue = next.scope ?? data.meta.scope;
    nextQuery.set('scope', scopeValue === 'all' ? 'all' : 'mine');

    const setOptionalNumberValue = (key: string, value: string | undefined) => {
      const normalized = (value ?? '').trim();
      if (normalized === '' || normalized === '0') {
        nextQuery.delete(key);
      } else {
        nextQuery.set(key, normalized);
      }
    };

    setOptionalNumberValue('companyID', next.companyID ?? String(data.filters.companyID || ''));
    setOptionalNumberValue('jobOrderID', next.jobOrderID ?? String(data.filters.jobOrderID || ''));
    nextQuery.delete('statusID');

    const showClosedValue = typeof next.showClosed === 'boolean' ? next.showClosed : data.meta.showClosed;
    if (showClosedValue) {
      nextQuery.set('showClosed', '1');
    } else {
      nextQuery.delete('showClosed');
    }

    const showMonitoredValue = typeof next.showMonitored === 'boolean' ? next.showMonitored : data.meta.showMonitored;
    if (showMonitoredValue) {
      nextQuery.set('showMonitored', '1');
    } else {
      nextQuery.delete('showMonitored');
    }

    const nextPage = typeof next.page === 'number' && next.page > 0 ? next.page : 1;
    nextQuery.set('page', String(nextPage));
    nextQuery.set('mode', viewMode);

    if (!nextQuery.get('ui')) {
      nextQuery.set('ui', 'modern');
    }

    const nextQueryString = nextQuery.toString();
    window.history.replaceState({}, '', `${bootstrap.indexName}?${nextQueryString}`);
    if (nextQueryString !== serverQueryString) {
      setServerQueryString(nextQueryString);
    }
  };

  const refreshDashboard = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);
  const showToast = useCallback((message: string, tone: 'success' | 'error' | 'info' = 'success') => {
    setToast({
      id: Date.now(),
      message,
      tone
    });
  }, []);
  usePageRefreshEvents(refreshDashboard);

  const openFullStatusModal = useCallback(
    (row: DashboardRow, targetStatusID: number | null) => {
      if (!data) return;
      const enforceOwner = data.meta.scope === 'mine' ? 1 : 0;
      let legacyURL = `${bootstrap.indexName}?m=joborders&a=addActivityChangeStatus`;
      legacyURL += `&jobOrderID=${encodeURIComponent(String(row.jobOrderID))}`;
      legacyURL += `&candidateID=${encodeURIComponent(String(row.candidateID))}`;
      legacyURL += `&enforceOwner=${encodeURIComponent(String(enforceOwner))}`;
      legacyURL += '&refreshParent=1&display=popup&ui=legacy';
      if (targetStatusID !== null && targetStatusID > 0) {
        legacyURL += `&statusID=${encodeURIComponent(String(targetStatusID))}`;
      }

      const currentStatusID = Number(row.statusID || 0);
      const rjStatusID = Number(data.meta.statusRules?.rejectedStatusID || 0);
      const orderedIDs = Array.isArray(data.meta.statusRules?.orderedStatusIDs)
        ? data.meta.statusRules.orderedStatusIDs
        : [];
      const byStatus = new Map<number, string>();
      (data.options.statuses ?? []).forEach((s) => byStatus.set(Number(s.statusID), s.status || ''));
      (data.rows ?? []).forEach((r) => {
        if (!byStatus.has(Number(r.statusID))) byStatus.set(Number(r.statusID), r.statusLabel || '');
      });
      const statusOptions = Array.from(byStatus.entries())
        .filter(([sid]) => {
          if (sid <= 0 || sid === currentStatusID) return false;
          if (currentStatusID === rjStatusID) return false;
          if (sid === rjStatusID) return true;
          const ci = orderedIDs.indexOf(currentStatusID);
          const ti = orderedIDs.indexOf(sid);
          if (ci < 0 || ti < 0) return true;
          return ti > ci;
        })
        .sort(([a], [b]) => {
          const ai = orderedIDs.indexOf(a);
          const bi = orderedIDs.indexOf(b);
          return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
        })
        .map(([statusID, statusLabel]) => ({ statusID, statusLabel }));

      const preferredID =
        targetStatusID !== null && targetStatusID > 0
          ? targetStatusID
          : (statusOptions[0]?.statusID ?? 0);

      setFullStatusError('');
      setFullStatusModal({
        row,
        targetStatusID: preferredID,
        title: `Change Status: ${toDisplayText(row.candidateName)}`,
        currentStatusLabel: toDisplayText(row.statusLabel),
        statusOptions,
        legacyFormURL: legacyURL
      });
    },
    [bootstrap.indexName, data]
  );

  const submitFullStatus = useCallback(
    async (payload: FullStatusChangePayload) => {
      if (!fullStatusModal || !data || fullStatusPending) return;
      const mutationToken = data.actions?.setPipelineStatusToken || '';
      if (!mutationToken) {
        setFullStatusError('Security token unavailable. Use the "Open Legacy Form" button to continue.');
        return;
      }
      setFullStatusError('');
      setFullStatusPending(true);
      try {
        const result = await setDashboardPipelineStatus(bootstrap, {
          url: data.actions?.setPipelineStatusURL,
          securityToken: mutationToken,
          candidateID: Number(fullStatusModal.row.candidateID || 0),
          jobOrderID: Number(fullStatusModal.row.jobOrderID || 0),
          statusID: payload.statusID,
          enforceOwner: data.meta.scope === 'mine',
          statusComment: payload.statusComment,
          requireStatusComment: false,
          rejectionReasonIDs: payload.rejectionReasonIDs,
          rejectionReasonOther: payload.rejectionReasonOther
        });
        if (result.success) {
          setFullStatusModal(null);
          setInteractionError('');
          refreshDashboard();
          const label =
            typeof result.updatedStatusLabel === 'string' && result.updatedStatusLabel.trim() !== ''
              ? result.updatedStatusLabel.trim()
              : 'updated';
          showToast(`Status changed to ${label}.`);
          return;
        }
        if (result.code === 'requiresModal') {
          setFullStatusError(
            'This transition requires additional data. Use the \u201cOpen Legacy Form\u201d button to complete it.'
          );
          return;
        }
        setFullStatusError(result.message || 'Unable to change pipeline status.');
      } catch (err: unknown) {
        setFullStatusError(err instanceof Error ? err.message : 'Unable to change pipeline status.');
      } finally {
        setFullStatusPending(false);
      }
    },
    [bootstrap, data, fullStatusModal, fullStatusPending, refreshDashboard, showToast]
  );

  const openRejectionModal = useCallback((row: DashboardRow) => {
    setRejectionError('');
    setRejectionModal({
      row,
      title: `Reject Candidate: ${toDisplayText(row.candidateName)}`,
      currentStatusLabel: toDisplayText(row.statusLabel)
    });
  }, []);

  const closeDetailsModal = useCallback(
    (refreshOnClose: boolean) => {
      setDetailsModal(null);
      if (refreshOnClose) {
        refreshDashboard();
      }
    },
    [refreshDashboard]
  );

  const openPipelineDetails = useCallback(
    async (row: DashboardRow) => {
      const pipelineID = Number(row.candidateJobOrderID || 0);
      if (pipelineID <= 0) {
        return;
      }

      const title = `Pipeline Details: ${toDisplayText(row.candidateName)}`;
      const fullDetailsURL = `${bootstrap.indexName}?m=joborders&a=pipelineStatusDetails&pipelineID=${encodeURIComponent(
        String(pipelineID)
      )}&display=popup&ui=legacy`;
      setPipelineDetailsModal({
        title,
        fullDetailsURL,
        pipelineID,
        details: null,
        loading: true,
        error: ''
      });

      try {
        const details = await fetchPipelineStatusDetailsModernData(bootstrap, pipelineID);
        setPipelineDetailsModal((current) =>
          current
            ? {
                ...current,
                details,
                loading: false,
                error: ''
              }
            : current
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unable to load pipeline details.';
        setPipelineDetailsModal((current) =>
          current
            ? {
                ...current,
                loading: false,
                error: message
              }
            : current
        );
      }
    },
    [bootstrap]
  );

  const reloadPipelineDetailsModal = useCallback(
    async (pipelineID: number) => {
      const nextDetails = await fetchPipelineStatusDetailsModernData(bootstrap, pipelineID);
      setPipelineDetailsModal((current) =>
        current
          ? {
              ...current,
              details: nextDetails,
              loading: false,
              error: ''
            }
          : current
      );
    },
    [bootstrap]
  );

  const savePipelineHistoryDate = useCallback(
    async (
      details: PipelineStatusDetailsModernDataResponse,
      payload: { historyID: number; newDate: string; originalDate: string; editNote: string }
    ) => {
      const editURL = decodeLegacyURL(details.actions.editDateURL);
      if (editURL === '') {
        return 'Missing edit endpoint.';
      }
      if (payload.newDate.trim() === '') {
        return 'Please select a date.';
      }

      try {
        const result = await updatePipelineStatusHistoryDate(editURL, {
          pipelineID: details.meta.pipelineID,
          historyID: payload.historyID,
          newDate: payload.newDate.replace('T', ' '),
          originalDate: payload.originalDate,
          editNote: payload.editNote
        });
        if (!result.success) {
          return result.message || 'Unable to update history date.';
        }

        await reloadPipelineDetailsModal(details.meta.pipelineID);
        refreshDashboard();
        showToast('Pipeline history date updated.');
        return null;
      } catch (err: unknown) {
        return err instanceof Error ? err.message : 'Unable to update history date.';
      }
    },
    [reloadPipelineDetailsModal, refreshDashboard, showToast]
  );

  const openAssignWorkspace = useCallback(() => {
    setQuickAssignOpen(true);
    setInteractionError('');
  }, []);

  const byStatusID = new Map<number, StatusCatalogEntry>();
  (data?.options.statuses ?? []).forEach((statusOption) => {
    const statusLabel = toDisplayText(statusOption.status);
    byStatusID.set(statusOption.statusID, {
      statusID: statusOption.statusID,
      statusLabel,
      statusSlug: toStatusSlug(statusLabel)
    });
  });
  (data?.rows ?? []).forEach((row) => {
    if (!byStatusID.has(row.statusID)) {
      const statusLabel = toDisplayText(row.statusLabel);
      byStatusID.set(row.statusID, {
        statusID: row.statusID,
        statusLabel,
        statusSlug: toStatusSlug(statusLabel)
      });
    }
  });
  const statusCatalog: StatusCatalogEntry[] = Array.from(byStatusID.values());
  const canChangeStatus = isCapabilityEnabled(data?.meta.permissions?.canChangeStatus);
  const canAssignToJobOrder = isCapabilityEnabled(data?.meta.permissions?.canAssignToJobOrder);
  const rejectedStatusID =
    Number(data?.meta.statusRules?.rejectedStatusID || 0) > 0
      ? Number(data?.meta.statusRules?.rejectedStatusID)
      : Number(
          statusCatalog.find((status) => status.statusSlug === 'rejected')?.statusID || 0
        );
  const orderedStatusIDs =
    Array.isArray(data?.meta.statusRules?.orderedStatusIDs) &&
    data.meta.statusRules?.orderedStatusIDs.length > 0
      ? data.meta.statusRules.orderedStatusIDs
      : statusCatalog.map((status) => status.statusID);
  const kanbanDisplayOrder =
    rejectedStatusID > 0
      ? [
          rejectedStatusID,
          ...orderedStatusIDs.filter((statusID) => Number(statusID || 0) !== rejectedStatusID)
        ]
      : orderedStatusIDs;
  const kanbanDisplayIndex = new Map<number, number>();
  kanbanDisplayOrder.forEach((statusID, index) => {
    const normalizedStatusID = Number(statusID || 0);
    if (normalizedStatusID > 0 && !kanbanDisplayIndex.has(normalizedStatusID)) {
      kanbanDisplayIndex.set(normalizedStatusID, index);
    }
  });
  const sortStatusesForKanban = (statuses: StatusCatalogEntry[]) =>
    [...statuses].sort((left, right) => {
      const leftIndex = kanbanDisplayIndex.get(Number(left.statusID || 0));
      const rightIndex = kanbanDisplayIndex.get(Number(right.statusID || 0));
      const normalizedLeftIndex = typeof leftIndex === 'number' ? leftIndex : Number.MAX_SAFE_INTEGER;
      const normalizedRightIndex = typeof rightIndex === 'number' ? rightIndex : Number.MAX_SAFE_INTEGER;
      if (normalizedLeftIndex !== normalizedRightIndex) {
        return normalizedLeftIndex - normalizedRightIndex;
      }

      return Number(left.statusID || 0) - Number(right.statusID || 0);
    });
  const rejectionReasons = Array.isArray(data?.options.rejectionReasons)
    ? data.options.rejectionReasons
        .map((reason) => ({
          reasonID: Number(reason.reasonID || 0),
          label: toDisplayText(reason.label)
        }))
        .filter((reason) => reason.reasonID > 0)
    : [];
  const rejectionOtherReasonID =
    Number(data?.meta.statusRules?.rejectionOtherReasonID || 0) > 0
      ? Number(data?.meta.statusRules?.rejectionOtherReasonID)
      : 0;
  const requestStatusChange = useCallback(
    async (
      row: DashboardRow,
      targetStatusID: number | null,
      options?: { statusComment?: string; requireStatusComment?: boolean }
    ) => {
      if (!data) {
        return {
          success: false,
          openedLegacy: false,
          openedInline: false,
          message: 'Dashboard data unavailable.'
        };
      }

      if (targetStatusID === null || targetStatusID <= 0) {
        openFullStatusModal(row, null);
        return {
          success: false,
          openedLegacy: false,
          openedInline: true,
          message: ''
        };
      }

      if (!canChangeStatus) {
        return {
          success: false,
          openedLegacy: false,
          openedInline: false,
          message: 'Status changes are not allowed for this user.'
        };
      }

      if (targetStatusID === rejectedStatusID) {
        if (rejectionReasons.length === 0) {
          openFullStatusModal(row, targetStatusID);
          return {
            success: false,
            openedLegacy: false,
            openedInline: true,
            message: ''
          };
        }
        openRejectionModal(row);
        return {
          success: false,
          openedLegacy: false,
          openedInline: true,
          message: ''
        };
      }

      const mutationToken = data.actions?.setPipelineStatusToken || '';
      if (mutationToken === '') {
        openFullStatusModal(row, targetStatusID);
        return {
          success: false,
          openedLegacy: false,
          openedInline: true,
          message: ''
        };
      }

      try {
        const mutationResult = await setDashboardPipelineStatus(bootstrap, {
          url: data.actions?.setPipelineStatusURL,
          securityToken: mutationToken,
          candidateID: Number(row.candidateID || 0),
          jobOrderID: Number(row.jobOrderID || 0),
          statusID: targetStatusID,
          enforceOwner: data.meta.scope === 'mine',
          statusComment: options?.statusComment || '',
          requireStatusComment: options?.requireStatusComment === true
        });

        if (mutationResult.success) {
          setInteractionError('');
          refreshDashboard();
          const statusLabel =
            typeof mutationResult.updatedStatusLabel === 'string' && mutationResult.updatedStatusLabel.trim() !== ''
              ? mutationResult.updatedStatusLabel.trim()
              : 'updated';
          showToast(`Status changed to ${statusLabel}.`);
          return {
            success: true,
            openedLegacy: false,
            openedInline: false,
            message: ''
          };
        }

        if (mutationResult.code === 'requiresModal') {
          openFullStatusModal(row, targetStatusID);
          return {
            success: false,
            openedLegacy: false,
            openedInline: true,
            message: ''
          };
        }

        const errorMessage = mutationResult.message || 'Unable to change pipeline status.';
        setInteractionError(errorMessage);
        return {
          success: false,
          openedLegacy: false,
          openedInline: false,
          message: errorMessage
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unable to change pipeline status.';
        setInteractionError(message);
        return {
          success: false,
          openedLegacy: false,
          openedInline: false,
          message
        };
      }
    },
    [
      bootstrap,
      canChangeStatus,
      data?.actions?.setPipelineStatusToken,
      data?.actions?.setPipelineStatusURL,
      data?.meta.scope,
      openFullStatusModal,
      openRejectionModal,
      rejectionReasons.length,
      refreshDashboard,
      rejectedStatusID,
      showToast
    ]
  );

  const openKanbanCommentModal = useCallback(
    (row: DashboardRow, targetStatusID: number | null) => {
      if (targetStatusID === null || targetStatusID <= 0) {
        void requestStatusChange(row, targetStatusID);
        return;
      }

      if (targetStatusID === rejectedStatusID) {
        void requestStatusChange(row, targetStatusID);
        return;
      }

      const targetStatusLabel =
        statusCatalog.find((status) => Number(status.statusID || 0) === targetStatusID)?.statusLabel || `Status ${targetStatusID}`;

      setKanbanCommentError('');
      setKanbanCommentModal({
        row,
        targetStatusID,
        title: `Move Candidate: ${toDisplayText(row.candidateName)}`,
        currentStatusLabel: toDisplayText(row.statusLabel),
        targetStatusLabel: toDisplayText(targetStatusLabel)
      });
    },
    [rejectedStatusID, requestStatusChange, statusCatalog]
  );

  const submitKanbanComment = useCallback(
    async (comment: string) => {
      if (!kanbanCommentModal || kanbanCommentPending) {
        return;
      }

      setKanbanCommentError('');
      setKanbanCommentPending(true);
      try {
        const result = await requestStatusChange(kanbanCommentModal.row, kanbanCommentModal.targetStatusID, {
          statusComment: comment,
          requireStatusComment: true
        });
        if (result.success || result.openedLegacy || result.openedInline) {
          setKanbanCommentModal(null);
          return;
        }
        setKanbanCommentError(result.message || 'Unable to change status.');
      } catch (err: unknown) {
        setKanbanCommentError(err instanceof Error ? err.message : 'Unable to change status.');
      } finally {
        setKanbanCommentPending(false);
      }
    },
    [kanbanCommentModal, kanbanCommentPending, requestStatusChange]
  );

  const openQuickStatusModal = useCallback(
    (row: DashboardRow) => {
      const currentStatusID = Number(row.statusID || 0);
      const statusOptions = statusCatalog
        .filter((status) => {
          const targetStatusID = Number(status.statusID || 0);
          if (targetStatusID <= 0 || targetStatusID === currentStatusID) {
            return false;
          }
          if (currentStatusID === rejectedStatusID) {
            return false;
          }
          if (targetStatusID === rejectedStatusID) {
            return true;
          }

          const currentIndex = orderedStatusIDs.indexOf(currentStatusID);
          const targetIndex = orderedStatusIDs.indexOf(targetStatusID);
          if (currentIndex < 0 || targetIndex < 0) {
            return true;
          }
          return targetIndex > currentIndex;
        })
        .map((status) => ({
          statusID: status.statusID,
          statusLabel: status.statusLabel
        }));

      if (statusOptions.length === 0) {
        setInteractionError('No status transitions are available for this candidate.');
        return;
      }

      setQuickStatusError('');
      setQuickStatusModal({
        row,
        title: `Change Status: ${toDisplayText(row.candidateName)}`,
        currentStatusLabel: toDisplayText(row.statusLabel),
        statusOptions
      });
    },
    [orderedStatusIDs, rejectedStatusID, statusCatalog]
  );

  const submitQuickStatus = useCallback(
    async (statusID: number) => {
      if (!quickStatusModal || quickStatusPending) {
        return;
      }

      setQuickStatusError('');
      setQuickStatusPending(true);
      try {
        const result = await requestStatusChange(quickStatusModal.row, statusID);
        if (result.success || result.openedLegacy || result.openedInline) {
          setQuickStatusModal(null);
          return;
        }
        setQuickStatusError(result.message || 'Unable to change status.');
      } catch (err: unknown) {
        setQuickStatusError(err instanceof Error ? err.message : 'Unable to change status.');
      } finally {
        setQuickStatusPending(false);
      }
    },
    [quickStatusModal, quickStatusPending, requestStatusChange]
  );

  const submitRejectionStatus = useCallback(
    async (payload: { rejectionReasonIDs: number[]; rejectionReasonOther: string; statusComment: string }) => {
      if (!data || !rejectionModal || rejectionPending) {
        return;
      }

      const mutationToken = data.actions?.setPipelineStatusToken || '';
      if (mutationToken === '') {
        setRejectionModal(null);
        openFullStatusModal(rejectionModal.row, rejectedStatusID);
        return;
      }

      setRejectionError('');
      setRejectionPending(true);
      try {
        const mutationResult = await setDashboardPipelineStatus(bootstrap, {
          url: data.actions?.setPipelineStatusURL,
          securityToken: mutationToken,
          candidateID: Number(rejectionModal.row.candidateID || 0),
          jobOrderID: Number(rejectionModal.row.jobOrderID || 0),
          statusID: rejectedStatusID,
          enforceOwner: data.meta.scope === 'mine',
          statusComment: payload.statusComment,
          requireStatusComment: true,
          rejectionReasonIDs: payload.rejectionReasonIDs,
          rejectionReasonOther: payload.rejectionReasonOther
        });

        if (mutationResult.success) {
          setRejectionModal(null);
          setInteractionError('');
          refreshDashboard();
          showToast('Candidate moved to Rejected.');
          return;
        }

        if (mutationResult.code === 'requiresModal') {
          setRejectionModal(null);
          openFullStatusModal(rejectionModal.row, rejectedStatusID);
          return;
        }

        setRejectionError(mutationResult.message || 'Unable to change pipeline status.');
      } catch (err: unknown) {
        setRejectionError(err instanceof Error ? err.message : 'Unable to change pipeline status.');
      } finally {
        setRejectionPending(false);
      }
    },
    [
      bootstrap,
      data?.actions?.setPipelineStatusToken,
      data?.actions?.setPipelineStatusURL,
      data?.meta.scope,
      openFullStatusModal,
      refreshDashboard,
      rejectedStatusID,
      rejectionModal,
      rejectionPending,
      showToast
    ]
  );

  if (loading && !data) {
    return <DashboardKanbanSkeleton />;
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
    return <EmptyState message="No data available." />;
  }

  const stripDiacritics = (s: string) =>
    s.normalize('NFD').replace(/\p{Diacritic}/gu, '');

  const normalizedSearch = stripDiacritics(searchTerm.trim().toLowerCase());

  // Base filter: search/scope only, no localStatusID — used for chip counts so tokens stay visible while focused
  const baseFilteredRows = data.rows
    .filter((row) => {
      if (normalizedSearch === '') return true;
      const searchable = [
        row.candidateName,
        row.jobOrderTitle,
        row.companyName,
        row.location,
        row.statusLabel
      ]
        .map((value) => stripDiacritics(toSearchText(value).toLowerCase()))
        .join(' ');
      return searchable.includes(normalizedSearch);
    })
    .map((row) => ({
      ...row,
      candidateURL: ensureModernUIURL(row.candidateURL)
    }));

  const filteredRows = localStatusID === 'all'
    ? baseFilteredRows
    : baseFilteredRows.filter((row) => String(row.statusID) === localStatusID);

  const visibleStatuses = localStatusID === 'all'
    ? sortStatusesForKanban(statusCatalog)
    : sortStatusesForKanban(statusCatalog.filter((status) => String(status.statusID) === localStatusID));

  const groupedByStatus = new Map<number, DashboardModernDataResponse['rows']>();
  filteredRows.forEach((row) => {
    const existing = groupedByStatus.get(row.statusID) || [];
    existing.push(row);
    groupedByStatus.set(row.statusID, existing);
  });

  const columns: DashboardStatusColumn[] = visibleStatuses.map((status) => ({
    statusID: status.statusID,
    statusLabel: status.statusLabel,
    statusSlug: status.statusSlug,
    rows: groupedByStatus.get(status.statusID) || []
  }));

  // Chip counts from base (unfiltered by status) so tokens remain visible when one is active
  const baseCountByStatus = new Map<number, number>();
  baseFilteredRows.forEach((row) => {
    baseCountByStatus.set(row.statusID, (baseCountByStatus.get(row.statusID) || 0) + 1);
  });

  const allStatusChips = sortStatusesForKanban(statusCatalog)
    .filter((status) => (baseCountByStatus.get(status.statusID) || 0) > 0)
    .map((status) => ({
      statusID: status.statusID,
      statusLabel: status.statusLabel,
      statusSlug: status.statusSlug,
      count: baseCountByStatus.get(status.statusID) || 0
    }));


  const activeServerFilters: { label: string; onRemove: () => void }[] = [];
  if (data.filters.companyID > 0) {
    const selectedCompany = data.options.companies.find((company) => company.companyID === data.filters.companyID);
    activeServerFilters.push({
      label: `Customer: ${selectedCompany ? toDisplayText(selectedCompany.name) : data.filters.companyID}`,
      onRemove: () => navigateWithFilters({ companyID: '', jobOrderID: '', page: 1 })
    });
  }
  if (data.filters.jobOrderID > 0) {
    const selectedJobOrder = data.options.jobOrders.find((jobOrder) => jobOrder.jobOrderID === data.filters.jobOrderID);
    activeServerFilters.push({
      label: `Job: ${selectedJobOrder ? toDisplayText(selectedJobOrder.title) : data.filters.jobOrderID}`,
      onRemove: () => navigateWithFilters({ jobOrderID: '', page: 1 })
    });
  }
  if (data.meta.showClosed) {
    activeServerFilters.push({
      label: 'Show Closed',
      onRemove: () => navigateWithFilters({ showClosed: false, page: 1 })
    });
  }
  if (data.meta.showMonitored) {
    activeServerFilters.push({
      label: 'Monitored Only',
      onRemove: () => navigateWithFilters({ showMonitored: false, page: 1 })
    });
  }

  const activeLocalFilters: { label: string; onRemove: () => void }[] = [];
  if (searchTerm.trim() !== '') {
    activeLocalFilters.push({
      label: `Search: "${searchTerm.trim()}"`,
      onRemove: () => setSearchTerm('')
    });
  }
  if (localStatusID !== 'all') {
    const localStatus = statusCatalog.find((status) => String(status.statusID) === localStatusID);
    activeLocalFilters.push({
      label: `Stage: ${localStatus ? localStatus.statusLabel : localStatusID}`,
      onRemove: () => setLocalStatusID('all')
    });
  }
  return (
    <div className="avel-dashboard-page avel-my-dashboard">
      <PageContainer
        title="MyDashboard"
        subtitle="Avel recruiting control center"
        actions={
          <>
            {canAssignToJobOrder ? (
              <button type="button" className="modern-btn modern-btn--emphasis" onClick={openAssignWorkspace}>
                Assign Candidate
              </button>
            ) : null}
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
<DashboardToolbar
          canViewAllScopes={data.meta.canViewAllScopes}
          scope={data.meta.scope}
          customerID={String(data.filters.companyID || '')}
          jobOrderID={String(data.filters.jobOrderID || '')}
          showClosed={data.meta.showClosed}
          showMonitored={data.meta.showMonitored}
          isTopManagementUser={data.meta.isTopManagementUser}
          customers={[
            { value: '', label: 'All customers' },
            ...data.options.companies.map((company) => ({
              value: String(company.companyID),
              label: toDisplayText(company.name)
            }))
          ]}
          jobOrders={[
            { value: '', label: data.meta.jobOrderScopeLabel || 'All job orders' },
            ...data.options.jobOrders.map((jobOrder) => ({
              value: String(jobOrder.jobOrderID),
              label: `${toDisplayText(jobOrder.title)}${jobOrder.companyName ? ` (${toDisplayText(jobOrder.companyName)})` : ''}`
            }))
          ]}
          searchTerm={searchTerm}
          activeServerFilters={activeServerFilters}
          activeLocalFilters={activeLocalFilters}
          viewMode={viewMode}
          onScopeChange={(scope) => navigateWithFilters({ scope, page: 1 })}
          onCustomerChange={(companyID) => navigateWithFilters({ companyID, jobOrderID: '', page: 1 })}
          onJobOrderChange={(jobOrderID) => navigateWithFilters({ jobOrderID, page: 1 })}
          onShowClosedChange={(showClosed) => navigateWithFilters({ showClosed, page: 1 })}
          onShowMonitoredChange={(showMonitored) => navigateWithFilters({ showMonitored, page: 1 })}
          onSearchTermChange={setSearchTerm}
          onViewModeChange={setViewMode}
          onResetServerFilters={() =>
            navigateWithFilters({
              scope: data.meta.scope,
              companyID: '',
              jobOrderID: '',
              showClosed: false,
              showMonitored: false,
              page: 1
            })
          }
          onClearLocalFilters={() => {
            setSearchTerm('');
            setLocalStatusID('all');
          }}
        />
        {interactionError ? (
          <div className="modern-state modern-state--error">{interactionError}</div>
        ) : null}

        {filteredRows.length === 0 ? (
          <EmptyState message="No candidates match current filters. Adjust search or reset filters." />
        ) : (
          <>
            {viewMode === 'kanban' ? (
              <KanbanBoard
                columns={columns}
                totalVisibleRows={filteredRows.length}
                priorityChips={allStatusChips}
              focusedStatusID={localStatusID === 'all' ? null : Number(localStatusID)}
              onFocusStatus={(id) => setLocalStatusID(id === null ? 'all' : String(id))}
                getStatusClassName={createStatusClassName}
                canChangeStatus={canChangeStatus}
                statusOrder={orderedStatusIDs}
                rejectedStatusID={rejectedStatusID}
                onRequestStatusChange={openKanbanCommentModal}
                onOpenDetails={openPipelineDetails}
                onInteractionError={setInteractionError}
              />
            ) : (
              <DashboardListView
                rows={filteredRows}
                storageKey={listStorageKey}
              />
            )}
          </>
        )}
        </div>

        <PipelineStatusCommentModal
          isOpen={!!kanbanCommentModal}
          title={kanbanCommentModal?.title || 'Status Comment'}
          currentStatusLabel={kanbanCommentModal?.currentStatusLabel || '--'}
          targetStatusLabel={kanbanCommentModal?.targetStatusLabel || '--'}
          submitPending={kanbanCommentPending}
          submitError={kanbanCommentError}
          onCancel={() => {
            if (kanbanCommentPending) {
              return;
            }
            setKanbanCommentError('');
            setKanbanCommentModal(null);
          }}
          onSubmit={submitKanbanComment}
        />

        <PipelineQuickStatusModal
          isOpen={!!quickStatusModal}
          title={quickStatusModal?.title || 'Quick Status Change'}
          currentStatusLabel={quickStatusModal?.currentStatusLabel || '--'}
          statusOptions={quickStatusModal?.statusOptions || []}
          submitPending={quickStatusPending}
          submitError={quickStatusError}
          onCancel={() => {
            if (quickStatusPending) {
              return;
            }
            setQuickStatusError('');
            setQuickStatusModal(null);
          }}
          onSubmit={submitQuickStatus}
          onOpenFullForm={
            quickStatusModal
              ? () => {
                  if (quickStatusPending) {
                    return;
                  }
                  setQuickStatusError('');
                  const row = quickStatusModal.row;
                  const firstStatusID = quickStatusModal.statusOptions[0]?.statusID ?? 0;
                  setQuickStatusModal(null);
                  openFullStatusModal(row, firstStatusID > 0 ? firstStatusID : null);
                }
              : undefined
          }
        />

        <PipelineRejectionModal
          isOpen={!!rejectionModal}
          title={rejectionModal?.title || 'Reject Candidate'}
          currentStatusLabel={rejectionModal?.currentStatusLabel || '--'}
          rejectionReasons={rejectionReasons}
          otherReasonID={rejectionOtherReasonID}
          submitPending={rejectionPending}
          submitError={rejectionError}
          onCancel={() => {
            if (rejectionPending) {
              return;
            }
            setRejectionError('');
            setRejectionModal(null);
          }}
          onSubmit={submitRejectionStatus}
          onOpenFullForm={
            rejectionModal
              ? () => {
                  if (rejectionPending) {
                    return;
                  }
                  setRejectionError('');
                  const row = rejectionModal.row;
                  setRejectionModal(null);
                  openFullStatusModal(row, rejectedStatusID);
                }
              : undefined
          }
        />

        <PipelineStatusChangeModal
          isOpen={!!fullStatusModal}
          title={fullStatusModal?.title || 'Change Status'}
          currentStatusLabel={fullStatusModal?.currentStatusLabel || '--'}
          initialStatusID={fullStatusModal?.targetStatusID ?? 0}
          statusOptions={fullStatusModal?.statusOptions || []}
          rejectedStatusID={rejectedStatusID}
          rejectionReasons={rejectionReasons}
          rejectionOtherReasonID={rejectionOtherReasonID}
          legacyFormURL={fullStatusModal?.legacyFormURL || ''}
          pending={fullStatusPending}
          error={fullStatusError}
          onClose={() => { setFullStatusModal(null); setFullStatusError(''); }}
          onSubmit={submitFullStatus}
        />

        <QuickAssignModal
          isOpen={quickAssignOpen}
          bootstrap={bootstrap}
          jobOrders={data?.options.jobOrders || []}
          initialJobOrderID={Number(data?.filters.jobOrderID || 0)}
          initialCandidateQuery={searchTerm}
          onClose={() => setQuickAssignOpen(false)}
          onAssigned={(message) => {
            refreshDashboard();
            showToast(message || 'Candidate assigned to job order.');
          }}
        />

        <PipelineDetailsInlineModal
          isOpen={!!pipelineDetailsModal}
          title={pipelineDetailsModal?.title || 'Pipeline Details'}
          details={pipelineDetailsModal?.details || null}
          loading={pipelineDetailsModal?.loading || false}
          error={pipelineDetailsModal?.error || ''}
          onClose={() => setPipelineDetailsModal(null)}
          onSaveHistoryDate={savePipelineHistoryDate}
          onOpenFullDetails={
            pipelineDetailsModal
              ? () => {
                  setDetailsModal({
                    url: decodeLegacyURL(pipelineDetailsModal.fullDetailsURL),
                    title: pipelineDetailsModal.title
                  });
                }
              : undefined
          }
        />

        <LegacyFrameModal
          isOpen={!!detailsModal}
          title={detailsModal?.title || 'Pipeline Details'}
          url={detailsModal?.url || ''}
          onClose={closeDetailsModal}
          showRefreshClose={false}
        />

        <MutationToast toast={toast} onDismiss={() => setToast(null)} />
      </PageContainer>
    </div>
  );
}
