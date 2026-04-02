import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  addJobOrderProfileComment,
  deleteJobOrderAttachment,
  deleteJobOrderMessageThread,
  fetchPipelineStatusDetailsModernData,
  fetchJobOrdersShowModernData,
  postJobOrderMessage,
  removePipelineEntryViaLegacyURL,
  setJobOrderAdministrativeVisibility,
  setDashboardPipelineStatus,
  uploadJobOrderAttachment,
  updatePipelineStatusHistoryDate
} from '../lib/api';
import type {
  JobOrdersShowModernDataResponse,
  PipelineStatusDetailsModernDataResponse,
  UIModeBootstrap
} from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { DataTable } from '../components/primitives/DataTable';
import { FormattedTextBlock } from '../components/primitives/FormattedTextBlock';
import { LegacyFrameModal } from '../components/primitives/LegacyFrameModal';
import { JobOrderAssignCandidateModal } from '../components/primitives/JobOrderAssignCandidateModal';
import { PipelineDetailsInlineModal } from '../components/primitives/PipelineDetailsInlineModal';
import { PipelineQuickStatusModal } from '../components/primitives/PipelineQuickStatusModal';
import { PipelineRejectionModal } from '../components/primitives/PipelineRejectionModal';
import { PipelineRemoveModal } from '../components/primitives/PipelineRemoveModal';
import { PipelinePurgeModal } from '../components/primitives/PipelinePurgeModal';
import { ConfirmActionModal } from '../components/primitives/ConfirmActionModal';
import { MutationToast } from '../components/primitives/MutationToast';
import { ensureModernUIURL } from '../lib/navigation';
import { usePageRefreshEvents } from '../lib/usePageRefreshEvents';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
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

function decodeLegacyURL(url: string): string {
  return String(url || '').replace(/&amp;/g, '&');
}

function createStatusClassName(statusSlug: string): string {
  return `modern-status modern-status--${statusSlug || 'unknown'}`;
}

function normalizeDisplayValue(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim();
  }
  return '';
}

function isDisplayValueEmpty(value: unknown): boolean {
  const normalized = normalizeDisplayValue(value).toLowerCase();
  return normalized === '' || normalized === '-' || normalized === '--' || normalized === 'n/a' || normalized === 'na';
}

function getDetailFieldClassName(value: unknown): string {
  return `avel-entity-detail-field ${isDisplayValueEmpty(value) ? 'is-empty' : 'is-filled'}`;
}

type JobOrderSummaryChip = {
  key: string;
  label: string;
  tone: string;
};

function getJobOrderStatusChipTone(statusLabel: unknown): string {
  const normalized = String(statusLabel || '').toLowerCase();
  if (normalized.includes('cancel')) {
    return 'status-cancelled';
  }
  if (normalized.includes('closed')) {
    return 'status-closed';
  }
  if (normalized.includes('lead') || normalized.includes('upcoming') || normalized.includes('pre-open')) {
    return 'status-lead';
  }
  if (normalized.includes('on hold') || normalized.includes('on-hold')) {
    return 'status-on-hold';
  }
  if (normalized.includes('full')) {
    return 'status-full';
  }
  if (normalized.includes('active')) {
    return 'status-active';
  }
  return 'status-default';
}

type JobOrderShowSectionCardProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
};

function JobOrderShowSectionCard({
  title,
  description,
  actions = null,
  className = '',
  children
}: JobOrderShowSectionCardProps) {
  return (
    <section className={`avel-candidate-add-card avel-candidate-edit-section avel-joborder-show-section ${className}`.trim()}>
      <div className="avel-candidate-add-card__header avel-candidate-edit-card__header">
        <div>
          <h2>{title}</h2>
          {description ? <p className="avel-candidate-edit-section__description">{description}</p> : null}
        </div>
        {actions ? <div className="modern-table-actions avel-joborder-show-card-actions">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

type JobOrderShowSidebarCardProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
};

function JobOrderShowSidebarCard({
  title,
  description,
  actions = null,
  className = '',
  children
}: JobOrderShowSidebarCardProps) {
  return (
    <section className={`avel-candidate-add-card avel-candidate-add-card--sidebar avel-candidate-edit-sidebar-card avel-joborder-show-sidebar-card ${className}`.trim()}>
      <div className="avel-candidate-add-card__header avel-candidate-edit-sidebar-card__header">
        <div>
          <h2>{title}</h2>
          {description ? <p className="avel-candidate-edit-sidebar-card__description">{description}</p> : null}
        </div>
        {actions ? <div className="modern-table-actions avel-joborder-show-card-actions">{actions}</div> : null}
      </div>
      <div className="avel-candidate-edit-sidebar-card__body avel-joborder-show-sidebar-card__body">{children}</div>
    </section>
  );
}

type JobOrderShowValueFieldProps = {
  label: string;
  value: unknown;
  className?: string;
  valueClassName?: string;
  children?: ReactNode;
};

function JobOrderShowValueField({
  label,
  value,
  className = '',
  valueClassName = '',
  children = null
}: JobOrderShowValueFieldProps) {
  const isEmpty = isDisplayValueEmpty(value);
  return (
    <div className={`modern-command-field ${className}`.trim()}>
      <span className="modern-command-label">{label}</span>
      <div
        className={`avel-form-control avel-candidate-show-static${isEmpty ? ' avel-form-control--missing' : ''} ${valueClassName}`.trim()}
      >
        {children ?? toDisplayText(value)}
      </div>
    </div>
  );
}

export function JobOrdersShowPage({ bootstrap }: Props) {
  const [data, setData] = useState<JobOrdersShowModernDataResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [serverQueryString, setServerQueryString] = useState<string>(() => new URLSearchParams(window.location.search).toString());
  const [reloadToken, setReloadToken] = useState(0);
  const [pipelineModal, setPipelineModal] = useState<{
    url: string;
    title: string;
    showRefreshClose: boolean;
  } | null>(null);
  const [assignCandidateModal, setAssignCandidateModal] = useState<{
    url: string;
    subtitle: string;
  } | null>(null);
  const [quickStatusModal, setQuickStatusModal] = useState<{
    title: string;
    currentStatusLabel: string;
    statusOptions: Array<{ statusID: number; statusLabel: string }>;
    candidateID: number;
    jobOrderID: number;
    fallbackURL: string;
    fallbackTitle: string;
  } | null>(null);
  const [quickStatusPending, setQuickStatusPending] = useState<boolean>(false);
  const [quickStatusError, setQuickStatusError] = useState<string>('');
  const [rejectionModal, setRejectionModal] = useState<{
    title: string;
    currentStatusLabel: string;
    candidateID: number;
    jobOrderID: number;
    fallbackURL: string;
    fallbackTitle: string;
  } | null>(null);
  const [rejectionPending, setRejectionPending] = useState<boolean>(false);
  const [rejectionError, setRejectionError] = useState<string>('');
  const [pipelineDetailsModal, setPipelineDetailsModal] = useState<{
    title: string;
    fullDetailsURL: string;
    pipelineID: number;
    details: PipelineStatusDetailsModernDataResponse | null;
    loading: boolean;
    error: string;
  } | null>(null);
  const [removePipelineModal, setRemovePipelineModal] = useState<{
    title: string;
    description: string;
    actionURL: string;
  } | null>(null);
  const [removePipelinePending, setRemovePipelinePending] = useState<boolean>(false);
  const [removePipelineError, setRemovePipelineError] = useState<string>('');
  const [purgeModal, setPurgeModal] = useState<{
    candidateID: number;
    candidateName: string;
    jobOrderTitle: string;
    removeURL: string;
  } | null>(null);
  const [purgePending, setPurgePending] = useState(false);
  const [purgeError, setPurgeError] = useState('');
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [commentCategory, setCommentCategory] = useState<string>('General');
  const [commentText, setCommentText] = useState<string>('');
  const [commentSubmitPending, setCommentSubmitPending] = useState<boolean>(false);
  const [commentSubmitError, setCommentSubmitError] = useState<string>('');
  const [messageBody, setMessageBody] = useState<string>('');
  const [messageSubmitPending, setMessageSubmitPending] = useState<boolean>(false);
  const [messageSubmitError, setMessageSubmitError] = useState<string>('');
  const [messageDeletePending, setMessageDeletePending] = useState<boolean>(false);
  const [messageDeleteError, setMessageDeleteError] = useState<string>('');
  const [messageDeleteConfirmOpen, setMessageDeleteConfirmOpen] = useState<boolean>(false);
  const [adminHideTogglePending, setAdminHideTogglePending] = useState<boolean>(false);
  const [adminHideToggleError, setAdminHideToggleError] = useState<string>('');
  const [attachmentUploadOpen, setAttachmentUploadOpen] = useState<boolean>(false);
  const [attachmentUploadFile, setAttachmentUploadFile] = useState<File | null>(null);
  const [attachmentUploadPending, setAttachmentUploadPending] = useState<boolean>(false);
  const [attachmentUploadError, setAttachmentUploadError] = useState<string>('');
  const [attachmentDeleteModal, setAttachmentDeleteModal] = useState<{
    attachmentID: number;
    fileName: string;
  } | null>(null);
  const [attachmentDeletePending, setAttachmentDeletePending] = useState<boolean>(false);
  const [attachmentDeleteError, setAttachmentDeleteError] = useState<string>('');
  const [jobOrderDeleteModalOpen, setJobOrderDeleteModalOpen] = useState<boolean>(false);
  const [jobOrderDeletePending, setJobOrderDeletePending] = useState<boolean>(false);
  const [jobOrderDeleteError, setJobOrderDeleteError] = useState<string>('');
  const [jobOrderDeleteConfirmation, setJobOrderDeleteConfirmation] = useState<string>('');
  const [toast, setToast] = useState<{ id: number; message: string; tone: 'success' | 'error' | 'info' } | null>(null);
  const loadRequestRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    const requestID = loadRequestRef.current + 1;
    loadRequestRef.current = requestID;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchJobOrdersShowModernData(bootstrap, query)
      .then((result) => {
        if (!isMounted || requestID !== loadRequestRef.current) {
          return;
        }
        setData(result);
        setCommentsOpen(!!result.comments.initiallyOpen);
        setMessagesOpen(!!result.messages.initiallyOpen);
        if (result.comments.categories.length > 0) {
          setCommentCategory((current) =>
            result.comments.categories.includes(current) ? current : result.comments.categories[0]
          );
        } else {
          setCommentCategory('General');
        }
      })
      .catch((err: Error) => {
        if (!isMounted || requestID !== loadRequestRef.current) {
          return;
        }
        setError(err.message || 'Unable to load job order profile.');
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
    if (!data) {
      return;
    }
    if (String(bootstrap.targetAction || '').toLowerCase() !== 'createattachment') {
      return;
    }
    if (!data.meta.permissions.canCreateAttachment) {
      return;
    }

    setAttachmentUploadOpen(true);
    setAttachmentUploadError('');
  }, [bootstrap.targetAction, data]);

  const refreshPageData = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);
  const showToast = useCallback((message: string, tone: 'success' | 'error' | 'info' = 'success') => {
    setToast({
      id: Date.now(),
      message,
      tone
    });
  }, []);
  usePageRefreshEvents(refreshPageData);

  const closePipelineModal = useCallback(
    (refreshOnClose: boolean) => {
      setPipelineModal(null);
      if (refreshOnClose) {
        refreshPageData();
      }
    },
    [refreshPageData]
  );

  const openPipelineDetailsInline = useCallback(
    async (item: JobOrdersShowModernDataResponse['pipeline']['items'][number]) => {
      const pipelineID = Number(item.candidateJobOrderID || 0);
      if (pipelineID <= 0) {
        return;
      }

      const title = `Pipeline Details: ${toDisplayText(item.candidateName)}`;
      const fullDetailsURL = decodeLegacyURL(item.actions.pipelineDetailsURL);
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
        refreshPageData();
        showToast('Pipeline history date updated.');
        return null;
      } catch (err: unknown) {
        return err instanceof Error ? err.message : 'Unable to update history date.';
      }
    },
    [reloadPipelineDetailsModal, refreshPageData, showToast]
  );

  const submitJobOrderComment = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!data || commentSubmitPending) {
        return;
      }

      setCommentSubmitError('');
      setCommentSubmitPending(true);
      try {
        const result = await addJobOrderProfileComment(decodeLegacyURL(data.actions.addCommentURL), {
          jobOrderID: Number(data.meta.jobOrderID || 0),
          securityToken: data.comments.securityToken || '',
          commentCategory,
          commentText
        });
        if (!result.success) {
          setCommentSubmitError(result.message || 'Unable to save comment.');
          return;
        }

        setCommentText('');
        setCommentsOpen(true);
        refreshPageData();
        showToast('Comment saved.');
      } catch (err: unknown) {
        setCommentSubmitError(err instanceof Error ? err.message : 'Unable to save comment.');
      } finally {
        setCommentSubmitPending(false);
      }
    },
    [commentCategory, commentSubmitPending, commentText, data, refreshPageData, showToast]
  );

  const submitJobOrderMessage = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!data || messageSubmitPending) {
        return;
      }

      setMessageSubmitError('');
      setMessageSubmitPending(true);
      try {
        const result = await postJobOrderMessage(decodeLegacyURL(data.actions.postMessageURL), {
          jobOrderID: Number(data.meta.jobOrderID || 0),
          securityToken: data.messages.securityToken || '',
          messageBody
        });
        if (!result.success) {
          setMessageSubmitError(result.message || 'Unable to send message.');
          return;
        }

        setMessageBody('');
        setMessagesOpen(true);
        refreshPageData();
        showToast('Message sent.');
      } catch (err: unknown) {
        setMessageSubmitError(err instanceof Error ? err.message : 'Unable to send message.');
      } finally {
        setMessageSubmitPending(false);
      }
    },
    [data, messageBody, messageSubmitPending, refreshPageData, showToast]
  );

  const handleDeleteMessageThread = useCallback(async () => {
    if (!data || messageDeletePending) {
      return;
    }

    setMessageDeleteError('');
    setMessageDeletePending(true);
    try {
      const result = await deleteJobOrderMessageThread(decodeLegacyURL(data.actions.deleteMessageThreadURL), {
        jobOrderID: Number(data.meta.jobOrderID || 0),
        threadID: Number(data.messages.threadID || 0),
        securityToken: data.messages.deleteThreadSecurityToken || ''
      });
      if (!result.success) {
        setMessageDeleteError(result.message || 'Unable to delete message thread.');
        return;
      }

      setMessagesOpen(true);
      setMessageDeleteConfirmOpen(false);
      refreshPageData();
      showToast('Message thread deleted.');
    } catch (err: unknown) {
      setMessageDeleteError(err instanceof Error ? err.message : 'Unable to delete message thread.');
    } finally {
      setMessageDeletePending(false);
    }
  }, [data, messageDeletePending, refreshPageData, showToast]);

  const handleDeleteAttachment = useCallback(
    async (attachmentID: number) => {
      if (!data || attachmentDeletePending) {
        return;
      }

      const deleteURL = decodeLegacyURL(data.actions.deleteAttachmentURL || '');
      const token = data.actions.deleteAttachmentToken || '';
      if (deleteURL === '' || token === '') {
        setAttachmentDeleteError('Attachment delete endpoint is not available in this mode.');
        return;
      }

      setAttachmentDeleteError('');
      setAttachmentDeletePending(true);
      try {
        const result = await deleteJobOrderAttachment(deleteURL, {
          jobOrderID: Number(data.meta.jobOrderID || 0),
          attachmentID: Number(attachmentID || 0),
          securityToken: token
        });
        if (!result.success) {
          setAttachmentDeleteError(result.message || 'Unable to delete attachment.');
          return;
        }
        setAttachmentDeleteModal(null);
        refreshPageData();
        showToast('Attachment deleted.');
      } catch (err: unknown) {
        setAttachmentDeleteError(err instanceof Error ? err.message : 'Unable to delete attachment.');
      } finally {
        setAttachmentDeletePending(false);
      }
    },
    [attachmentDeletePending, data, refreshPageData, showToast]
  );

  const submitAttachmentUpload = useCallback(async () => {
    if (!data || attachmentUploadPending) {
      return;
    }
    const submitURL = decodeLegacyURL(data.actions.createAttachmentURL || '');
    if (submitURL === '') {
      setAttachmentUploadError('Attachment upload endpoint is not available.');
      return;
    }
    if (!attachmentUploadFile) {
      setAttachmentUploadError('Select a file to upload.');
      return;
    }

    setAttachmentUploadError('');
    setAttachmentUploadPending(true);
    try {
      const result = await uploadJobOrderAttachment(submitURL, {
        jobOrderID: Number(data.meta.jobOrderID || 0),
        file: attachmentUploadFile
      });
      if (!result.success) {
        setAttachmentUploadError(result.message || 'Unable to upload attachment.');
        return;
      }

      setAttachmentUploadFile(null);
      setAttachmentUploadOpen(false);
      refreshPageData();
      showToast('Attachment uploaded.');
    } catch (err: unknown) {
      setAttachmentUploadError(err instanceof Error ? err.message : 'Unable to upload attachment.');
    } finally {
      setAttachmentUploadPending(false);
    }
  }, [attachmentUploadFile, attachmentUploadPending, data, refreshPageData, showToast]);

  const toggleAdministrativeHidden = useCallback(async () => {
    if (!data || adminHideTogglePending) {
      return;
    }

    const nextState = !data.jobOrder.isAdminHidden;
    setAdminHideToggleError('');
    setAdminHideTogglePending(true);
    try {
      const result = await setJobOrderAdministrativeVisibility(
        decodeLegacyURL(data.actions.administrativeHideShowBaseURL),
        {
          jobOrderID: Number(data.meta.jobOrderID || 0),
          state: nextState
        }
      );
      if (!result.success) {
        setAdminHideToggleError(result.message || 'Unable to update administrative visibility.');
        return;
      }
      refreshPageData();
      showToast(nextState ? 'Job order hidden from recruiters.' : 'Job order is visible to recruiters.');
    } catch (err: unknown) {
      setAdminHideToggleError(err instanceof Error ? err.message : 'Unable to update administrative visibility.');
    } finally {
      setAdminHideTogglePending(false);
    }
  }, [adminHideTogglePending, data, refreshPageData, showToast]);

  const getForwardStatusOptions = useCallback(
    (currentStatusID: number) => {
      if (!data) {
        return [] as Array<{ statusID: number; statusLabel: string }>;
      }

      const statusData = data.pipelineStatus;
      const statusOrder =
        Array.isArray(statusData.orderedStatusIDs) && statusData.orderedStatusIDs.length > 0
          ? statusData.orderedStatusIDs
          : statusData.statuses.map((status) => status.statusID);

      const currentIndex = statusOrder.indexOf(currentStatusID);
      const sortedStatuses = [...statusData.statuses].sort(
        (left, right) => statusOrder.indexOf(left.statusID) - statusOrder.indexOf(right.statusID)
      );

      return sortedStatuses
        .filter((status) => {
          if (status.statusID <= 0 || status.statusID === currentStatusID) {
            return false;
          }

          if (currentStatusID === statusData.rejectedStatusID) {
            return false;
          }

          if (status.statusID === statusData.rejectedStatusID) {
            return true;
          }

          if (currentIndex < 0) {
            return true;
          }

          const targetIndex = statusOrder.indexOf(status.statusID);
          if (targetIndex < 0) {
            return true;
          }

          return targetIndex > currentIndex;
        })
        .map((status) => ({
          statusID: status.statusID,
          statusLabel: toDisplayText(status.status)
        }));
    },
    [data]
  );

  const openQuickStatus = useCallback(
    (item: JobOrdersShowModernDataResponse['pipeline']['items'][number]) => {
      if (!data) {
        return;
      }

      const fallbackURL = decodeLegacyURL(item.actions.changeStatusURL);
      const fallbackTitle = `Change Status: ${toDisplayText(item.candidateName)}`;
      const statusOptions = getForwardStatusOptions(Number(item.statusID || 0));
      if (statusOptions.length === 0) {
        setPipelineModal({
          url: fallbackURL,
          title: fallbackTitle,
          showRefreshClose: true
        });
        return;
      }

      setQuickStatusModal({
        title: `Quick Status: ${toDisplayText(item.candidateName)}`,
        currentStatusLabel: toDisplayText(item.statusLabel),
        statusOptions,
        candidateID: Number(item.candidateID || 0),
        jobOrderID: Number(data.meta.jobOrderID || 0),
        fallbackURL,
        fallbackTitle
      });
      setQuickStatusError('');
    },
    [data, getForwardStatusOptions]
  );

  const submitQuickStatus = useCallback(
    async (targetStatusID: number) => {
      if (!data || !quickStatusModal || quickStatusPending) {
        return;
      }

      const rejectedStatusID = Number(data.pipelineStatus.rejectedStatusID || 0);
      if (rejectedStatusID > 0 && targetStatusID === rejectedStatusID) {
        const rejectionReasons = Array.isArray(data.pipelineStatus.rejectionReasons)
          ? data.pipelineStatus.rejectionReasons.filter((reason) => Number(reason.reasonID || 0) > 0)
          : [];

        setQuickStatusError('');
        setQuickStatusModal(null);
        if (rejectionReasons.length === 0) {
          setPipelineModal({
            url: quickStatusModal.fallbackURL,
            title: quickStatusModal.fallbackTitle,
            showRefreshClose: true
          });
          return;
        }

        setRejectionError('');
        setRejectionModal({
          title: quickStatusModal.title.replace(/^Quick Status:/, 'Reject Candidate:'),
          currentStatusLabel: quickStatusModal.currentStatusLabel,
          candidateID: quickStatusModal.candidateID,
          jobOrderID: quickStatusModal.jobOrderID,
          fallbackURL: quickStatusModal.fallbackURL,
          fallbackTitle: quickStatusModal.fallbackTitle
        });
        return;
      }

      const token = data.actions.setPipelineStatusToken || '';
      if (token === '') {
        setQuickStatusError('');
        setQuickStatusModal(null);
        setPipelineModal({
          url: quickStatusModal.fallbackURL,
          title: quickStatusModal.fallbackTitle,
          showRefreshClose: true
        });
        return;
      }

      setQuickStatusError('');
      setQuickStatusPending(true);
      try {
        const result = await setDashboardPipelineStatus(bootstrap, {
          url: data.actions.setPipelineStatusURL,
          securityToken: token,
          candidateID: quickStatusModal.candidateID,
          jobOrderID: quickStatusModal.jobOrderID,
          statusID: targetStatusID,
          enforceOwner: false
        });

        if (!result.success) {
          if (result.code === 'requiresModal') {
            setQuickStatusPending(false);
            setQuickStatusError('');
            setQuickStatusModal(null);
            setPipelineModal({
              url: quickStatusModal.fallbackURL,
              title: quickStatusModal.fallbackTitle,
              showRefreshClose: true
            });
            return;
          }

          setQuickStatusError(result.message || 'Unable to update pipeline status.');
          return;
        }

        setQuickStatusPending(false);
        setQuickStatusError('');
        setQuickStatusModal(null);
        refreshPageData();
        const statusLabel =
          typeof result.updatedStatusLabel === 'string' && result.updatedStatusLabel.trim() !== ''
            ? result.updatedStatusLabel.trim()
            : 'updated';
        showToast(`Status changed to ${statusLabel}.`);
      } catch (err: unknown) {
        setQuickStatusError(err instanceof Error ? err.message : 'Unable to update pipeline status.');
      } finally {
        setQuickStatusPending(false);
      }
    },
    [bootstrap, data, quickStatusModal, quickStatusPending, refreshPageData, showToast]
  );

  const submitRejectedStatus = useCallback(
    async (payload: { rejectionReasonIDs: number[]; rejectionReasonOther: string; statusComment: string }) => {
      if (!data || !rejectionModal || rejectionPending) {
        return;
      }

      const token = data.actions.setPipelineStatusToken || '';
      const rejectedStatusID = Number(data.pipelineStatus.rejectedStatusID || 0);
      if (token === '' || rejectedStatusID <= 0) {
        setRejectionError('');
        setRejectionModal(null);
        setPipelineModal({
          url: rejectionModal.fallbackURL,
          title: rejectionModal.fallbackTitle,
          showRefreshClose: true
        });
        return;
      }

      setRejectionError('');
      setRejectionPending(true);
      try {
        const result = await setDashboardPipelineStatus(bootstrap, {
          url: data.actions.setPipelineStatusURL,
          securityToken: token,
          candidateID: rejectionModal.candidateID,
          jobOrderID: rejectionModal.jobOrderID,
          statusID: rejectedStatusID,
          enforceOwner: false,
          statusComment: payload.statusComment,
          rejectionReasonIDs: payload.rejectionReasonIDs,
          rejectionReasonOther: payload.rejectionReasonOther
        });

        if (!result.success) {
          if (result.code === 'requiresModal') {
            setRejectionPending(false);
            setRejectionError('');
            setRejectionModal(null);
            setPipelineModal({
              url: rejectionModal.fallbackURL,
              title: rejectionModal.fallbackTitle,
              showRefreshClose: true
            });
            return;
          }

          setRejectionError(result.message || 'Unable to update pipeline status.');
          return;
        }

        setRejectionPending(false);
        setRejectionError('');
        setRejectionModal(null);
        refreshPageData();
        showToast('Candidate moved to Rejected.');
      } catch (err: unknown) {
        setRejectionError(err instanceof Error ? err.message : 'Unable to update pipeline status.');
      } finally {
        setRejectionPending(false);
      }
    },
    [bootstrap, data, rejectionModal, rejectionPending, refreshPageData, showToast]
  );

  const handleRemoveFromPipeline = useCallback(
    async (item: JobOrdersShowModernDataResponse['pipeline']['items'][number]) => {
      if (!data) {
        return;
      }

      const token = data.actions.removeFromPipelineToken || '';
      if (token === '') {
        setPipelineModal({
          url: decodeLegacyURL(item.actions.removeFromPipelineURL),
          title: `Remove From Pipeline: ${toDisplayText(item.candidateName)}`,
          showRefreshClose: true
        });
        return;
      }

      const candidateName = toDisplayText(item.candidateName);
      setRemovePipelineError('');
      setRemovePipelineModal({
        title: `Remove From Pipeline: ${candidateName}`,
        description: `Remove ${candidateName} from this pipeline?`,
        actionURL: decodeLegacyURL(item.actions.removeFromPipelineURL)
      });
    },
    [data, refreshPageData]
  );

  const submitRemoveFromPipeline = useCallback(
    async (note: string) => {
      if (!data || !removePipelineModal || removePipelinePending) {
        return;
      }

      const token = data.actions.removeFromPipelineToken || '';
      if (token === '') {
        setRemovePipelineError('Removal security token is not available.');
        return;
      }

      setRemovePipelineError('');
      setRemovePipelinePending(true);
      try {
        const result = await removePipelineEntryViaLegacyURL(
          removePipelineModal.actionURL,
          token,
          note
        );
        if (!result.success) {
          setRemovePipelineError(result.message || 'Unable to remove candidate from pipeline.');
          return;
        }

        setRemovePipelineModal(null);
        refreshPageData();
        showToast('Candidate removed from pipeline.');
      } catch (err: unknown) {
        setRemovePipelineError(err instanceof Error ? err.message : 'Unable to remove candidate from pipeline.');
      } finally {
        setRemovePipelinePending(false);
      }
    },
    [data, removePipelineModal, removePipelinePending, refreshPageData, showToast]
  );

  const submitPurgeFromPipeline = useCallback(
    async () => {
      if (!data || !purgeModal || purgePending) {
        return;
      }

      const token = data.actions.removeFromPipelineToken || '';
      if (token === '') {
        setPurgeError('Security token is not available.');
        return;
      }

      setPurgeError('');
      setPurgePending(true);
      try {
        const parsedURL = new URL(
          decodeLegacyURL(purgeModal.removeURL),
          window.location.href
        );
        parsedURL.searchParams.set('a', 'purgeFromPipeline');
        parsedURL.searchParams.set('format', 'modern-json');
        parsedURL.searchParams.delete('display');

        const candidateID = parsedURL.searchParams.get('candidateID') || String(purgeModal.candidateID);
        const jobOrderID = parsedURL.searchParams.get('jobOrderID') || String(data.meta.jobOrderID);

        const body = new URLSearchParams();
        body.set('candidateID', candidateID);
        body.set('jobOrderID', jobOrderID);
        body.set('securityToken', token);

        const response = await fetch(parsedURL.toString(), {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString()
        });

        const result = await response.json();
        if (!result.success) {
          setPurgeError(result.message || 'Purge failed.');
          return;
        }

        setPurgeModal(null);
        refreshPageData();
        showToast('Candidate permanently purged from pipeline.');
      } catch (err: unknown) {
        setPurgeError(err instanceof Error ? err.message : 'Purge failed.');
      } finally {
        setPurgePending(false);
      }
    },
    [data, purgeModal, purgePending, refreshPageData, showToast]
  );

  const navigateWithShowClosed = (showClosed: boolean) => {
    if (!data) {
      return;
    }

    const nextQuery = new URLSearchParams(serverQueryString);
    nextQuery.set('m', 'joborders');
    nextQuery.set('a', 'show');
    nextQuery.set('jobOrderID', String(data.meta.jobOrderID));
    if (showClosed) {
      nextQuery.set('showClosed', '1');
    } else {
      nextQuery.delete('showClosed');
    }
    if (!nextQuery.get('ui')) {
      nextQuery.set('ui', 'modern');
    }

    const nextQueryString = nextQuery.toString();
    window.history.replaceState({}, '', `${bootstrap.indexName}?${nextQueryString}`);
    if (nextQueryString !== serverQueryString) {
      setServerQueryString(nextQueryString);
    }
  };

  if (loading && !data) {
    return <div className="modern-state">Loading job order profile...</div>;
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
    return <EmptyState message="Job order profile not available." />;
  }

  const permissions = data.meta.permissions;
  const jobOrder = data.jobOrder;
  const rejectionReasons = Array.isArray(data.pipelineStatus.rejectionReasons)
    ? data.pipelineStatus.rejectionReasons
        .map((reason) => ({
          reasonID: Number(reason.reasonID || 0),
          label: toDisplayText(reason.label)
        }))
        .filter((reason) => reason.reasonID > 0)
    : [];
  const rejectionOtherReasonID =
    Number(data.pipelineStatus.rejectionOtherReasonID || 0) > 0
      ? Number(data.pipelineStatus.rejectionOtherReasonID)
      : 0;
  const hasPipelineRows = data.pipeline.items.length > 0;
  const hasAttachments = data.attachments.items.length > 0;
  const hasExtraFields = data.extraFields.length > 0;
  const hasHiringPlanRows = data.hiringPlan.items.length > 0;
  const showClosed = data.meta.showClosedPipeline;
  const totalCandidateCount = Number(data.pipeline.activeCount || 0) + Number(data.pipeline.closedCount || 0);
  const hiddenClosedCandidates = !showClosed && Number(data.pipeline.closedCount || 0) > 0;
  const deleteURL = ensureModernUIURL(decodeLegacyURL(data.actions.deleteURL));
  const summaryChips: JobOrderSummaryChip[] = [
    {
      key: 'priority',
      label: jobOrder.isHot ? 'Priority: Hot' : 'Priority: Standard',
      tone: jobOrder.isHot ? 'priority-hot' : 'priority-standard'
    },
    {
      key: 'visibility',
      label: jobOrder.public ? 'Public Job Order' : 'Internal Job Order',
      tone: jobOrder.public ? 'visibility-public' : 'visibility-internal'
    },
    {
      key: 'status',
      label: `Status: ${toDisplayText(jobOrder.status)}`,
      tone: getJobOrderStatusChipTone(jobOrder.status)
    },
    {
      key: 'company',
      label: `Company: ${toDisplayText(jobOrder.companyName)}`,
      tone: 'company'
    },
    {
      key: 'candidates',
      label: `Candidates: ${totalCandidateCount}`,
      tone: 'candidates'
    }
  ];
  const openJobOrderDeleteModal = () => {
    setJobOrderDeleteError('');
    setJobOrderDeleteConfirmation('');
    setJobOrderDeletePending(false);
    setJobOrderDeleteModalOpen(true);
  };
  const closeJobOrderDeleteModal = () => {
    if (jobOrderDeletePending) {
      return;
    }
    setJobOrderDeleteError('');
    setJobOrderDeleteConfirmation('');
    setJobOrderDeleteModalOpen(false);
  };
  const confirmJobOrderDelete = () => {
    if (deleteURL === '') {
      setJobOrderDeleteError('Delete action is unavailable for this job order.');
      return;
    }
    setJobOrderDeleteError('');
    setJobOrderDeletePending(true);
    window.location.assign(deleteURL);
  };

  return (
    <div className="avel-dashboard-page avel-joborder-show-page avel-joborder-show-page--refined avel-candidate-add-page avel-candidate-edit-page avel-candidate-edit-page--refined avel-candidate-show-page--refined avel-joborder-edit-page">
      <PageContainer
        title={toDisplayText(jobOrder.title, 'Job Order')}
        subtitle="Review recruiter-facing role scope, pipeline, attachments, and collaboration."
        actions={
          <>
            {permissions.canEditJobOrder ? (
              <a className="modern-btn modern-btn--emphasis" href={ensureModernUIURL(data.actions.editURL)}>
                Edit Job Order
              </a>
            ) : null}
            {permissions.canDeleteJobOrder ? (
              <button
                type="button"
                className="modern-btn avel-candidate-edit-page__danger-btn"
                onClick={openJobOrderDeleteModal}
              >
                Delete Job Order
              </button>
            ) : null}
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <div className="avel-candidate-edit-form avel-joborder-show-workbench">
            <div className="avel-candidate-edit-summary avel-joborder-show-summary">
              {summaryChips.map((chip) => (
                <span
                  key={chip.key}
                  className={`modern-chip avel-joborder-show-summary__chip avel-joborder-show-summary__chip--${chip.tone}`}
                >
                  {chip.label}
                </span>
              ))}
            </div>

            <div className="avel-candidate-edit-layout avel-joborder-show-layout">
              <div className="avel-candidate-edit-main avel-joborder-show-main">
                <JobOrderShowSectionCard
                  title="Role & Assignment"
                  description="Company context and assignment details."
                  className="avel-joborder-show-section--identity"
                >
                  <div className="avel-candidate-edit-grid avel-candidate-edit-grid--3col">
                    <JobOrderShowValueField label="Company" value={jobOrder.companyName}>
                      {normalizeDisplayValue(jobOrder.companyURL) !== '' ? (
                        <a className="modern-link" href={ensureModernUIURL(decodeLegacyURL(jobOrder.companyURL))}>
                          {toDisplayText(jobOrder.companyName)}
                        </a>
                      ) : (
                        toDisplayText(jobOrder.companyName)
                      )}
                    </JobOrderShowValueField>
                    <JobOrderShowValueField label="Contact" value={jobOrder.contactFullName} />
                    <JobOrderShowValueField label="Recruiter" value={jobOrder.recruiterFullName} />
                    <JobOrderShowValueField label="Type" value={jobOrder.typeDescription} />
                  </div>
                </JobOrderShowSectionCard>

                <JobOrderShowSectionCard
                  title="Location & Timing"
                  description="Placement timing and job location."
                >
                  <div className="avel-candidate-edit-grid avel-candidate-edit-grid--3col">
                    <JobOrderShowValueField label="Location" value={jobOrder.cityAndState} />
                    <JobOrderShowValueField label="Start Date" value={jobOrder.startDate} />
                    <JobOrderShowValueField label="Duration" value={jobOrder.duration} />
                    <JobOrderShowValueField label="Age" value={`${Number(jobOrder.daysOld || 0)} days`} />
                  </div>
                </JobOrderShowSectionCard>

                <JobOrderShowSectionCard
                  title="Candidates"
                  description="Track active and closed pipeline relationships for this job order."
                  className="avel-joborder-show-section--pipeline"
                  actions={
                    <>
                      {permissions.canAddCandidateToPipeline ? (
                        <button
                          type="button"
                          className="modern-btn modern-btn--mini modern-btn--emphasis"
                          onClick={() =>
                            setAssignCandidateModal({
                              url: decodeLegacyURL(data.actions.addCandidateURL),
                              subtitle: toDisplayText(jobOrder.title, `Job Order #${jobOrder.jobOrderID}`)
                            })
                          }
                        >
                          Add Candidate
                        </button>
                      ) : null}
                      <label className="modern-command-toggle">
                        <input
                          type="checkbox"
                          checked={showClosed}
                          onChange={(event) => navigateWithShowClosed(event.target.checked)}
                        />
                        <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                        <span>Show Closed</span>
                      </label>
                    </>
                  }
                >
                  <div className="avel-candidate-show-joborder-summary avel-joborder-show-pipeline-summary">
                    <span className="modern-chip modern-chip--info">Active: {Number(data.pipeline.activeCount || 0)}</span>
                    <span className={`modern-chip ${Number(data.pipeline.closedCount || 0) > 0 ? 'modern-chip--warning' : 'modern-chip--resume'}`}>
                      Closed: {Number(data.pipeline.closedCount || 0)}
                    </span>
                    <span className={`modern-chip ${totalCandidateCount > 0 ? 'modern-chip--success' : 'modern-chip--resume'}`}>
                      {totalCandidateCount > 0 ? 'Candidates assigned' : 'No candidates assigned'}
                    </span>
                  </div>
                  {hiddenClosedCandidates ? (
                    <p className="avel-list-panel__hint">
                      Closed candidates exist for this job order. Enable <strong>Show Closed</strong> to review them.
                    </p>
                  ) : null}
                  {data.comments.flashMessage ? (
                    <div className={`modern-state ${data.comments.flashIsError ? 'modern-state--error' : 'modern-state--empty'}`}>
                      {data.comments.flashMessage}
                    </div>
                  ) : null}
                  {data.messages.flashMessage ? (
                    <div className={`modern-state ${data.messages.flashIsError ? 'modern-state--error' : 'modern-state--empty'}`}>
                      {data.messages.flashMessage}
                    </div>
                  ) : null}
                  <DataTable
                    columns={[
                      { key: 'candidate', title: 'Candidate' },
                      { key: 'status', title: 'Status' },
                      { key: 'date', title: 'Added' },
                      { key: 'owner', title: 'Owner' },
                      { key: 'addedBy', title: 'Added By' },
                      { key: 'actions', title: 'Actions' }
                    ]}
                    hasRows={hasPipelineRows}
                    emptyMessage={
                      hiddenClosedCandidates
                        ? 'No active candidates shown. Enable Show Closed to review previous assignments.'
                        : 'No candidates in pipeline for this job order.'
                    }
                  >
                    {data.pipeline.items.map((item) => (
                      <tr key={item.candidateJobOrderID}>
                        <td>
                          <a className="modern-link" href={ensureModernUIURL(item.candidateURL)}>
                            {toDisplayText(item.candidateName)}
                          </a>
                          <div className="avel-joborders-flags avel-joborder-show-flag-row">
                            {item.isHotCandidate ? <span className="modern-chip modern-chip--warning">Hot</span> : null}
                            {item.isDuplicateCandidate ? <span className="modern-chip modern-chip--critical">Duplicate</span> : null}
                            {!item.isActive ? <span className="modern-chip modern-chip--resume">Closed</span> : null}
                            {item.submitted ? <span className="modern-chip modern-chip--success">Submitted</span> : null}
                          </div>
                        </td>
                        <td>
                          <span className={createStatusClassName(item.statusSlug)}>{toDisplayText(item.statusLabel)}</span>
                        </td>
                        <td>{toDisplayText(item.dateCreated)}</td>
                        <td>{toDisplayText(item.ownerName)}</td>
                        <td>{toDisplayText(item.addedByName)}</td>
                        <td>
                          <div className="modern-table-actions">
                            {permissions.canChangePipelineStatus ? (
                              <button
                                type="button"
                                className="modern-btn modern-btn--mini modern-btn--secondary"
                                onClick={() => openQuickStatus(item)}
                              >
                                Change Status
                              </button>
                            ) : null}
                            {permissions.canRemoveFromPipeline ? (
                              <button
                                type="button"
                                className="modern-btn modern-btn--mini modern-btn--secondary"
                                onClick={() => handleRemoveFromPipeline(item)}
                              >
                                Remove
                              </button>
                            ) : null}
                            {permissions.canPurgeFromPipeline ? (
                              <button
                                type="button"
                                className="modern-btn modern-btn--mini avel-candidate-edit-page__danger-btn"
                                onClick={() =>
                                  setPurgeModal({
                                    candidateID: item.candidateID,
                                    candidateName: toDisplayText(item.candidateName),
                                    jobOrderTitle: data.jobOrder.title || 'Job Order',
                                    removeURL: item.actions.removeFromPipelineURL
                                  })
                                }
                              >
                                Purge
                              </button>
                            ) : null}
                            <button
                              type="button"
                              className="modern-btn modern-btn--mini modern-btn--secondary"
                              onClick={() => openPipelineDetailsInline(item)}
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </DataTable>
                </JobOrderShowSectionCard>

                <JobOrderShowSectionCard
                  title="Attachments"
                  description="Role documents, intake assets, and recruiter-facing files."
                  className="avel-joborder-show-section--attachments"
                  actions={
                    permissions.canCreateAttachment ? (
                      <button
                        type="button"
                        className="modern-btn modern-btn--mini modern-btn--secondary"
                        onClick={() => {
                          setAttachmentUploadOpen((current) => !current);
                          setAttachmentUploadError('');
                        }}
                      >
                        {attachmentUploadOpen ? 'Cancel Upload' : 'Add Attachment'}
                      </button>
                    ) : null
                  }
                >
                  {permissions.canCreateAttachment && attachmentUploadOpen ? (
                    <div className="avel-candidate-edit-inline-card avel-joborder-show-inline-card">
                      <label className="modern-command-field avel-candidate-edit-field--full">
                        <span className="modern-command-label">Attachment File</span>
                        <input
                          className="avel-form-control"
                          type="file"
                          onChange={(event) => setAttachmentUploadFile(event.target.files?.[0] || null)}
                        />
                      </label>
                      {attachmentUploadError ? <div className="modern-state modern-state--error">{attachmentUploadError}</div> : null}
                      <div className="modern-table-actions">
                        <button
                          type="button"
                          className="modern-btn modern-btn--mini modern-btn--emphasis"
                          onClick={submitAttachmentUpload}
                          disabled={attachmentUploadPending}
                        >
                          {attachmentUploadPending ? 'Uploading...' : 'Upload'}
                        </button>
                      </div>
                    </div>
                  ) : null}
                  <DataTable
                    columns={[
                      { key: 'fileName', title: 'File' },
                      { key: 'dateCreated', title: 'Date' },
                      { key: 'actions', title: 'Actions' }
                    ]}
                    hasRows={hasAttachments}
                    emptyMessage="No attachments."
                  >
                    {data.attachments.items.map((attachment) => (
                      <tr key={attachment.attachmentID}>
                        <td>
                          {attachment.retrievalURL ? (
                            <a className="modern-link" href={decodeLegacyURL(attachment.retrievalURL)}>
                              {toDisplayText(attachment.fileName)}
                            </a>
                          ) : (
                            <span>{toDisplayText(attachment.fileName)}</span>
                          )}
                        </td>
                        <td>{toDisplayText(attachment.dateCreated)}</td>
                        <td>
                          <div className="modern-table-actions">
                            {permissions.canDeleteAttachment ? (
                              <button
                                type="button"
                                className="modern-btn modern-btn--mini avel-candidate-edit-page__danger-btn"
                                onClick={() => {
                                  setAttachmentDeleteError('');
                                  setAttachmentDeleteModal({
                                    attachmentID: attachment.attachmentID,
                                    fileName: toDisplayText(attachment.fileName, 'Attachment')
                                  });
                                }}
                              >
                                Delete
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </DataTable>
                </JobOrderShowSectionCard>

                <JobOrderShowSectionCard
                  title="Description & Notes"
                  description="Role narrative, delivery context, and internal recruiter notes."
                >
                  <div className="avel-joborder-show-richtext">
                    <div className="avel-candidate-notes avel-joborder-show-richtext-block">
                      <p className="avel-joborder-show-caption">Description</p>
                      <FormattedTextBlock text={toDisplayText(jobOrder.description, '')} emptyMessage="No description provided." />
                    </div>
                    <div className="avel-candidate-notes avel-joborder-show-richtext-block">
                      <p className="avel-joborder-show-caption">Notes</p>
                      <FormattedTextBlock text={toDisplayText(jobOrder.notes, '')} emptyMessage="No notes provided." />
                    </div>
                  </div>
                </JobOrderShowSectionCard>

                {hasExtraFields ? (
                  <JobOrderShowSectionCard
                    title="Extra Fields"
                    description="Custom metadata captured for this job order."
                  >
                    <div className="avel-candidate-edit-grid avel-candidate-edit-grid--3col">
                      {data.extraFields.map((field) => (
                        <JobOrderShowValueField key={field.fieldName} label={toDisplayText(field.fieldName)} value={field.display} />
                      ))}
                    </div>
                  </JobOrderShowSectionCard>
                ) : null}
              </div>

              <aside className="avel-candidate-edit-sidebar avel-joborder-show-sidebar">
                <JobOrderShowSidebarCard
                  title="Status & Visibility"
                  description="Job-order state, visibility, and admin controls."
                  actions={
                    permissions.canAdministrativeHideShow ? (
                      <button
                        type="button"
                        className="modern-btn modern-btn--mini modern-btn--secondary"
                        onClick={toggleAdministrativeHidden}
                        disabled={adminHideTogglePending}
                      >
                        {adminHideTogglePending ? 'Updating...' : jobOrder.isAdminHidden ? 'Unhide' : 'Hide'}
                      </button>
                    ) : null
                  }
                >
                  <div className="avel-joborder-show-sidebar-stack">
                    <JobOrderShowValueField
                      label="Current Status"
                      value={jobOrder.status}
                      valueClassName={createStatusClassName(String(jobOrder.status).toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                    />
                    <JobOrderShowValueField label="Priority" value={jobOrder.isHot ? 'Hot' : 'Standard'} />
                    {adminHideToggleError ? <div className="modern-inline-error">{adminHideToggleError}</div> : null}
                  </div>
                </JobOrderShowSidebarCard>

                <JobOrderShowSidebarCard
                  title="Capacity & Compensation"
                  description="Total openings, availability, compensation, and hiring plan."
                  actions={
                    <button
                      type="button"
                      className="modern-btn modern-btn--mini modern-btn--secondary"
                      onClick={() =>
                        setPipelineModal({
                          url: decodeLegacyURL(data.actions.hiringPlanURL),
                          title: 'Hiring Plan',
                          showRefreshClose: true
                        })
                      }
                    >
                      Open Hiring Plan
                    </button>
                  }
                >
                  <div className="avel-joborder-show-sidebar-stack">
                    <JobOrderShowValueField label="Total Openings" value={jobOrder.openings} />
                    <JobOrderShowValueField label="Openings Available" value={jobOrder.openingsAvailable} />
                    <JobOrderShowValueField label="Max Rate" value={jobOrder.maxRate} />
                    <JobOrderShowValueField label="Salary" value={jobOrder.salary} />
                  </div>
                  <div className="avel-candidate-edit-inline-card avel-joborder-show-inline-card">
                    <div className="avel-joborder-show-sidebar-stack">
                      <JobOrderShowValueField label="Hiring Plan Openings" value={data.hiringPlan.totalOpenings} />
                      <JobOrderShowValueField label="Hiring Plan Rows" value={data.hiringPlan.items.length} />
                    </div>
                  </div>
                  <div className="avel-joborder-show-inline-card">
                    <p className="avel-joborder-show-caption">Hiring Plan Items</p>
                  </div>
                  {hasHiringPlanRows ? (
                    <div className="avel-joborder-show-hiring-plan-list">
                      {data.hiringPlan.items.map((row) => (
                        <div key={row.hiringPlanID} className="avel-joborder-show-hiring-plan-item">
                          <strong>{toDisplayText(row.description)}</strong>
                          <span>{row.openings} openings</span>
                          <span>{`${toDisplayText(row.startDate)} - ${toDisplayText(row.endDate)}`}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="modern-state modern-state--empty">No hiring plan rows.</div>
                  )}
                </JobOrderShowSidebarCard>
              </aside>
            </div>

            <div className="avel-candidate-show-collaboration avel-joborder-show-collaboration">
              <JobOrderShowSectionCard
                title="Team Comments"
                description="Internal recruiter updates attached to this job order."
                className="avel-candidate-show-section--compact"
                actions={
                  <>
                    <span className="modern-chip modern-chip--info">{data.comments.count} entries</span>
                    <button
                      type="button"
                      className="modern-btn modern-btn--mini modern-btn--secondary"
                      onClick={() => setCommentsOpen((current) => !current)}
                    >
                      {commentsOpen ? 'Hide' : 'Show'}
                    </button>
                  </>
                }
              >
                {commentsOpen ? (
                  <>
                    {data.comments.canAddComment ? (
                      <form className="avel-joborder-thread-form" onSubmit={submitJobOrderComment}>
                        <label className="modern-command-field">
                          <span className="modern-command-label">Comment Type</span>
                          <select
                            className="avel-form-control"
                            name="commentCategory"
                            value={commentCategory}
                            onChange={(event) => setCommentCategory(event.target.value)}
                          >
                            {data.comments.categories.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="modern-command-field avel-candidate-edit-field--full">
                          <span className="modern-command-label">Comment</span>
                          <textarea
                            className="avel-form-control"
                            name="commentText"
                            rows={4}
                            maxLength={data.comments.maxLength}
                            required
                            placeholder="Share an internal update for this job order."
                            value={commentText}
                            onChange={(event) => setCommentText(event.target.value)}
                          />
                        </label>
                        {commentSubmitError ? <div className="modern-state modern-state--error">{commentSubmitError}</div> : null}
                        <div className="modern-table-actions">
                          <button
                            type="submit"
                            className="modern-btn modern-btn--mini modern-btn--emphasis"
                            disabled={commentSubmitPending}
                          >
                            {commentSubmitPending ? 'Saving...' : 'Save Comment'}
                          </button>
                        </div>
                      </form>
                    ) : null}

                    {data.comments.items.length > 0 ? (
                      <div className="avel-joborder-comment-list">
                        {data.comments.items.map((comment) => (
                          <article key={comment.activityID} className="avel-joborder-comment-item">
                            <header>
                              <span>{toDisplayText(comment.category)}</span>
                              <span>{toDisplayText(comment.enteredBy)}</span>
                              <span>{toDisplayText(comment.dateCreated)}</span>
                            </header>
                            <p>{toDisplayText(comment.commentText, '')}</p>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <div className="modern-state modern-state--empty">No comments yet.</div>
                    )}
                  </>
                ) : null}
              </JobOrderShowSectionCard>

              <JobOrderShowSectionCard
                title="Team Inbox"
                description="Internal collaboration thread for recruiter communication."
                className="avel-candidate-show-section--compact"
                actions={
                  data.messages.enabled ? (
                    <>
                      <button
                        type="button"
                        className="modern-btn modern-btn--mini modern-btn--secondary"
                        onClick={() =>
                          setPipelineModal({
                            url: ensureModernUIURL(decodeLegacyURL(data.messages.openInboxURL)),
                            title: 'Team Inbox',
                            showRefreshClose: false
                          })
                        }
                      >
                        Open Inbox
                      </button>
                      <button
                        type="button"
                        className="modern-btn modern-btn--mini modern-btn--secondary"
                        onClick={() => setMessagesOpen((current) => !current)}
                      >
                        {messagesOpen ? 'Hide' : 'Show'}
                      </button>
                    </>
                  ) : null
                }
              >
                {!data.messages.enabled ? (
                  <div className="modern-state modern-state--empty">
                    Messaging tables are missing. Run schema migrations to enable Team Inbox.
                  </div>
                ) : messagesOpen ? (
                  <div className="avel-joborder-thread-block">
                    {permissions.canPostMessage ? (
                      <form className="avel-joborder-thread-form" onSubmit={submitJobOrderMessage}>
                        <label className="modern-command-field avel-candidate-edit-field--full">
                          <span className="modern-command-label">Message</span>
                          <textarea
                            className="avel-form-control"
                            name="messageBody"
                            rows={4}
                            maxLength={data.messages.maxLength}
                            required
                            placeholder="Type a message and mention teammates with @First Last."
                            value={messageBody}
                            onChange={(event) => setMessageBody(event.target.value)}
                          />
                        </label>
                        {data.messages.mentionHintNames.length > 0 ? (
                          <p className="avel-list-panel__hint">Mention help: {data.messages.mentionHintNames.map((name) => `@${name}`).join(', ')}</p>
                        ) : null}
                        {messageSubmitError ? <div className="modern-state modern-state--error">{messageSubmitError}</div> : null}
                        <div className="modern-table-actions">
                          <button
                            type="submit"
                            className="modern-btn modern-btn--mini modern-btn--emphasis"
                            disabled={messageSubmitPending}
                          >
                            {messageSubmitPending ? 'Sending...' : 'Send Message'}
                          </button>
                        </div>
                      </form>
                    ) : null}

                    {permissions.canDeleteMessageThread && data.messages.threadID > 0 && data.messages.threadVisibleToCurrentUser ? (
                      <div className="modern-table-actions">
                        <button
                          type="button"
                          className="modern-btn modern-btn--mini avel-candidate-edit-page__danger-btn"
                          onClick={() => {
                            setMessageDeleteError('');
                            setMessageDeleteConfirmOpen(true);
                          }}
                          disabled={messageDeletePending}
                        >
                          {messageDeletePending ? 'Deleting...' : 'Delete Thread'}
                        </button>
                      </div>
                    ) : null}
                    {messageDeleteError ? <div className="modern-state modern-state--error">{messageDeleteError}</div> : null}

                    {data.messages.threadID > 0 && !data.messages.threadVisibleToCurrentUser ? (
                      <div className="modern-state modern-state--empty">
                        You are not part of this thread yet. Send a message and mention teammates to start collaborating.
                      </div>
                    ) : null}

                    <DataTable
                      columns={[
                        { key: 'date', title: 'Date' },
                        { key: 'from', title: 'From' },
                        { key: 'mentions', title: 'Mentions' },
                        { key: 'message', title: 'Message' }
                      ]}
                      hasRows={data.messages.items.length > 0}
                      emptyMessage="No messages yet."
                    >
                      {data.messages.items.map((message) => (
                        <tr key={message.messageID}>
                          <td>{toDisplayText(message.dateCreated)}</td>
                          <td>{toDisplayText(message.senderName)}</td>
                          <td>{toDisplayText(message.mentionedUsers)}</td>
                          <td>{toDisplayText(message.bodyText, '')}</td>
                        </tr>
                      ))}
                    </DataTable>
                  </div>
                ) : null}
              </JobOrderShowSectionCard>
            </div>

            <div className="avel-candidate-edit-legacy-footer">
              <a className="avel-candidate-edit-legacy-footer__link" href={decodeLegacyURL(data.actions.legacyURL)}>
                Open Legacy UI
              </a>
            </div>
          </div>
        </div>

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
                  setQuickStatusModal(null);
                  setPipelineModal({
                    url: quickStatusModal.fallbackURL,
                    title: quickStatusModal.fallbackTitle,
                    showRefreshClose: true
                  });
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
          onSubmit={submitRejectedStatus}
          onOpenFullForm={
            rejectionModal
              ? () => {
                  if (rejectionPending) {
                    return;
                  }
                  setRejectionError('');
                  const fallbackURL = rejectionModal.fallbackURL;
                  const fallbackTitle = rejectionModal.fallbackTitle;
                  setRejectionModal(null);
                  setPipelineModal({
                    url: fallbackURL,
                    title: fallbackTitle,
                    showRefreshClose: true
                  });
                }
              : undefined
          }
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
                  setPipelineDetailsModal(null);
                  setPipelineModal({
                    url: decodeLegacyURL(pipelineDetailsModal.fullDetailsURL),
                    title: pipelineDetailsModal.title,
                    showRefreshClose: false
                  });
                }
              : undefined
          }
        />

        <ConfirmActionModal
          isOpen={messageDeleteConfirmOpen}
          title="Delete Message Thread"
          message="Delete this thread for all users? This action cannot be undone."
          confirmLabel="Delete Thread"
          pending={messageDeletePending}
          error={messageDeleteError}
          onCancel={() => {
            if (messageDeletePending) {
              return;
            }
            setMessageDeleteError('');
            setMessageDeleteConfirmOpen(false);
          }}
          onConfirm={handleDeleteMessageThread}
        />

        <ConfirmActionModal
          isOpen={jobOrderDeleteModalOpen}
          title="Delete Job Order"
          message={`Delete "${toDisplayText(jobOrder.title, 'this job order')}"? This permanently removes the job order profile and its related recruiting records.`}
          confirmLabel="Delete Job Order"
          pending={jobOrderDeletePending}
          error={jobOrderDeleteError}
          confirmationKeyword="DELETE"
          confirmationValue={jobOrderDeleteConfirmation}
          confirmationHint="Type DELETE to confirm this destructive action."
          onConfirmationValueChange={setJobOrderDeleteConfirmation}
          onCancel={closeJobOrderDeleteModal}
          onConfirm={confirmJobOrderDelete}
        />

        <ConfirmActionModal
          isOpen={!!attachmentDeleteModal}
          title="Delete Attachment"
          message={`Delete "${attachmentDeleteModal?.fileName || 'this attachment'}"?`}
          confirmLabel="Delete Attachment"
          pending={attachmentDeletePending}
          error={attachmentDeleteError}
          onCancel={() => {
            if (attachmentDeletePending) {
              return;
            }
            setAttachmentDeleteError('');
            setAttachmentDeleteModal(null);
          }}
          onConfirm={() => {
            if (!attachmentDeleteModal) {
              return;
            }
            handleDeleteAttachment(attachmentDeleteModal.attachmentID);
          }}
        />

        <PipelineRemoveModal
          isOpen={!!removePipelineModal}
          title={removePipelineModal?.title || 'Remove From Pipeline'}
          description={removePipelineModal?.description || 'Confirm pipeline removal.'}
          pending={removePipelinePending}
          error={removePipelineError}
          onCancel={() => {
            if (removePipelinePending) {
              return;
            }
            setRemovePipelineError('');
            setRemovePipelineModal(null);
          }}
          onSubmit={submitRemoveFromPipeline}
        />

        <PipelinePurgeModal
          isOpen={!!purgeModal}
          candidateName={purgeModal?.candidateName || ''}
          jobOrderTitle={purgeModal?.jobOrderTitle || ''}
          pending={purgePending}
          error={purgeError}
          onCancel={() => { setPurgeModal(null); setPurgeError(''); }}
          onConfirm={submitPurgeFromPipeline}
        />

        <LegacyFrameModal
          isOpen={!!pipelineModal}
          title={pipelineModal?.title || 'Pipeline Action'}
          url={pipelineModal?.url || ''}
          onClose={closePipelineModal}
          showRefreshClose={pipelineModal?.showRefreshClose ?? true}
        />

        <JobOrderAssignCandidateModal
          isOpen={!!assignCandidateModal}
          bootstrap={bootstrap}
          sourceURL={assignCandidateModal?.url || ''}
          subtitle={assignCandidateModal?.subtitle}
          onClose={() => setAssignCandidateModal(null)}
          onAssigned={() => {
            refreshPageData();
            showToast('Candidate assigned to job order.');
          }}
        />

        <MutationToast toast={toast} onDismiss={() => setToast(null)} />
      </PageContainer>
    </div>
  );
}
