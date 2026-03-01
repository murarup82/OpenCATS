import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
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
import { LegacyFrameModal } from '../components/primitives/LegacyFrameModal';
import { PipelineDetailsInlineModal } from '../components/primitives/PipelineDetailsInlineModal';
import { PipelineQuickStatusModal } from '../components/primitives/PipelineQuickStatusModal';
import { PipelineRemoveModal } from '../components/primitives/PipelineRemoveModal';
import { ConfirmActionModal } from '../components/primitives/ConfirmActionModal';
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

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchJobOrdersShowModernData(bootstrap, query)
      .then((result) => {
        if (!isMounted) {
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
        if (!isMounted) {
          return;
        }
        setError(err.message || 'Unable to load job order profile.');
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
        return null;
      } catch (err: unknown) {
        return err instanceof Error ? err.message : 'Unable to update history date.';
      }
    },
    [reloadPipelineDetailsModal, refreshPageData]
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
      } catch (err: unknown) {
        setCommentSubmitError(err instanceof Error ? err.message : 'Unable to save comment.');
      } finally {
        setCommentSubmitPending(false);
      }
    },
    [commentCategory, commentSubmitPending, commentText, data, refreshPageData]
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
      } catch (err: unknown) {
        setMessageSubmitError(err instanceof Error ? err.message : 'Unable to send message.');
      } finally {
        setMessageSubmitPending(false);
      }
    },
    [data, messageBody, messageSubmitPending, refreshPageData]
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
    } catch (err: unknown) {
      setMessageDeleteError(err instanceof Error ? err.message : 'Unable to delete message thread.');
    } finally {
      setMessageDeletePending(false);
    }
  }, [data, messageDeletePending, refreshPageData]);

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
      } catch (err: unknown) {
        setAttachmentDeleteError(err instanceof Error ? err.message : 'Unable to delete attachment.');
      } finally {
        setAttachmentDeletePending(false);
      }
    },
    [attachmentDeletePending, data, refreshPageData]
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
    } catch (err: unknown) {
      setAttachmentUploadError(err instanceof Error ? err.message : 'Unable to upload attachment.');
    } finally {
      setAttachmentUploadPending(false);
    }
  }, [attachmentUploadFile, attachmentUploadPending, data, refreshPageData]);

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
    } catch (err: unknown) {
      setAdminHideToggleError(err instanceof Error ? err.message : 'Unable to update administrative visibility.');
    } finally {
      setAdminHideTogglePending(false);
    }
  }, [adminHideTogglePending, data, refreshPageData]);

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
          if (status.statusID === statusData.rejectedStatusID) {
            return false;
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
      } catch (err: unknown) {
        setQuickStatusError(err instanceof Error ? err.message : 'Unable to update pipeline status.');
      } finally {
        setQuickStatusPending(false);
      }
    },
    [bootstrap, data, quickStatusModal, quickStatusPending, refreshPageData]
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
      } catch (err: unknown) {
        setRemovePipelineError(err instanceof Error ? err.message : 'Unable to remove candidate from pipeline.');
      } finally {
        setRemovePipelinePending(false);
      }
    },
    [data, removePipelineModal, removePipelinePending, refreshPageData]
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
  const hasPipelineRows = data.pipeline.items.length > 0;
  const hasAttachments = data.attachments.items.length > 0;
  const hasExtraFields = data.extraFields.length > 0;
  const hasHiringPlanRows = data.hiringPlan.items.length > 0;

  return (
    <div className="avel-dashboard-page avel-joborder-show-page">
      <PageContainer
        title={toDisplayText(jobOrder.title, 'Job Order')}
        subtitle={`Job order #${jobOrder.jobOrderID}`}
        actions={
          <>
            {permissions.canEditJobOrder ? (
              <a className="modern-btn modern-btn--secondary" href={ensureModernUIURL(data.actions.editURL)}>
                Edit Job Order
              </a>
            ) : null}
            {permissions.canAddCandidateToPipeline ? (
              <button
                type="button"
                className="modern-btn modern-btn--secondary"
                onClick={() =>
                  setPipelineModal({
                    url: decodeLegacyURL(data.actions.addCandidateURL),
                    title: 'Add Candidate',
                    showRefreshClose: true
                  })
                }
              >
                Add Candidate
              </button>
            ) : null}
            <button
              type="button"
              className="modern-btn modern-btn--secondary"
              onClick={() =>
                setPipelineModal({
                  url: decodeLegacyURL(data.actions.reportURL),
                  title: 'Job Order Report',
                  showRefreshClose: false
                })
              }
            >
              Report
            </button>
            {permissions.canViewHistory ? (
              <button
                type="button"
                className="modern-btn modern-btn--secondary"
                onClick={() =>
                  setPipelineModal({
                    url: decodeLegacyURL(data.actions.historyURL),
                    title: 'Job Order History',
                    showRefreshClose: false
                  })
                }
              >
                History
              </button>
            ) : null}
            <button
              type="button"
              className="modern-btn modern-btn--secondary"
              onClick={() =>
                setPipelineModal({
                  url: decodeLegacyURL(data.actions.hiringPlanURL),
                  title: 'Hiring Plan',
                  showRefreshClose: true
                })
              }
            >
              Hiring Plan
            </button>
            {permissions.canAdministrativeHideShow ? (
              <button
                type="button"
                className="modern-btn modern-btn--secondary"
                onClick={toggleAdministrativeHidden}
                disabled={adminHideTogglePending}
              >
                {adminHideTogglePending ? 'Updating...' : jobOrder.isAdminHidden ? 'Unhide' : 'Hide'}
              </button>
            ) : null}
            <a className="modern-btn modern-btn--secondary" href={decodeLegacyURL(data.actions.legacyURL)}>
              Open Legacy UI
            </a>
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Overview</h2>
              <p className="avel-list-panel__hint">
                {toDisplayText(jobOrder.companyName)} {jobOrder.cityAndState ? `| ${jobOrder.cityAndState}` : ''}
              </p>
            </div>
            <div className="avel-joborder-hero">
              <div className="avel-joborder-hero__chips">
                <span className={createStatusClassName(String(jobOrder.status).toLowerCase().replace(/[^a-z0-9]+/g, '-'))}>
                  {toDisplayText(jobOrder.status)}
                </span>
                {jobOrder.isHot ? <span className="modern-chip modern-chip--warning">Hot</span> : null}
                {jobOrder.isAdminHidden ? <span className="modern-chip modern-chip--critical">Admin Hidden</span> : null}
                {jobOrder.public ? <span className="modern-chip modern-chip--info">Public</span> : null}
              </div>
              <div className="avel-joborder-hero__grid">
                <div><span>Company</span><strong>{toDisplayText(jobOrder.companyName)}</strong></div>
                <div><span>Owner</span><strong>{toDisplayText(jobOrder.ownerFullName)}</strong></div>
                <div><span>Recruiter</span><strong>{toDisplayText(jobOrder.recruiterFullName)}</strong></div>
                <div><span>Type</span><strong>{toDisplayText(jobOrder.typeDescription)}</strong></div>
                <div><span>Start Date</span><strong>{toDisplayText(jobOrder.startDate)}</strong></div>
                <div><span>Modified</span><strong>{toDisplayText(jobOrder.dateModified)}</strong></div>
              </div>
            </div>
          </section>

          <section className="avel-kpi-grid">
            <div className="avel-kpi">
              <span className="avel-kpi__label">Pipeline</span>
              <span className="avel-kpi__value">{jobOrder.pipelineCount}</span>
              <span className="avel-kpi__hint">Active: {data.pipeline.activeCount}</span>
            </div>
            <div className="avel-kpi">
              <span className="avel-kpi__label">Submitted</span>
              <span className="avel-kpi__value">{jobOrder.submittedCount}</span>
              <span className="avel-kpi__hint">Proposed to customer</span>
            </div>
            <div className="avel-kpi">
              <span className="avel-kpi__label">Openings</span>
              <span className="avel-kpi__value">{jobOrder.openingsAvailable}</span>
              <span className="avel-kpi__hint">Total planned: {jobOrder.openings}</span>
            </div>
            <div className="avel-kpi">
              <span className="avel-kpi__label">Age</span>
              <span className="avel-kpi__value">{jobOrder.daysOld}d</span>
              <span className="avel-kpi__hint">Since creation</span>
            </div>
          </section>

          <section className="modern-command-bar modern-command-bar--sticky" aria-label="Job order controls">
            <div className="modern-command-bar__row modern-command-bar__row--meta">
              <label className="modern-command-toggle">
                <input
                  type="checkbox"
                  checked={data.meta.showClosedPipeline}
                  onChange={(event) => navigateWithShowClosed(event.target.checked)}
                />
                <span className="modern-command-toggle__switch" aria-hidden="true" />
                <span>Include closed pipeline entries</span>
              </label>
              {data.comments.flashMessage ? (
                <span className={`modern-chip ${data.comments.flashIsError ? 'modern-chip--critical' : 'modern-chip--success'}`}>
                  {data.comments.flashMessage}
                </span>
              ) : null}
              {data.messages.flashMessage ? (
                <span className={`modern-chip ${data.messages.flashIsError ? 'modern-chip--critical' : 'modern-chip--success'}`}>
                  {data.messages.flashMessage}
                </span>
              ) : null}
              {adminHideToggleError ? <span className="modern-chip modern-chip--critical">{adminHideToggleError}</span> : null}
            </div>
          </section>

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Pipeline</h2>
              <p className="avel-list-panel__hint">
                Active {data.pipeline.activeCount} | Closed {data.pipeline.closedCount}
              </p>
            </div>
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
              emptyMessage="No candidates in pipeline for this job order."
            >
              {data.pipeline.items.map((item) => (
                <tr key={item.candidateJobOrderID}>
                  <td>
                    <a className="modern-link" href={ensureModernUIURL(item.candidateURL)}>
                      {toDisplayText(item.candidateName)}
                    </a>
                    <div className="avel-joborders-flags">
                      {item.isHotCandidate ? <span className="modern-chip modern-chip--warning">Hot</span> : null}
                      {item.isDuplicateCandidate ? <span className="modern-chip modern-chip--critical">Duplicate</span> : null}
                      {!item.isActive ? <span className="modern-chip modern-chip--info">Closed</span> : null}
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
                          className="modern-btn modern-btn--secondary modern-btn--mini"
                          onClick={() => openQuickStatus(item)}
                        >
                          Status
                        </button>
                      ) : null}
                      {permissions.canRemoveFromPipeline ? (
                        <button
                          type="button"
                          className="modern-btn modern-btn--secondary modern-btn--mini"
                          onClick={() => handleRemoveFromPipeline(item)}
                        >
                          Remove
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="modern-btn modern-btn--secondary modern-btn--mini"
                        onClick={() => openPipelineDetailsInline(item)}
                      >
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </DataTable>
          </section>

          <section className="avel-joborder-show-split">
            <div className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Notes</h2>
                <p className="avel-list-panel__hint">Description and internal notes</p>
              </div>
              <div className="avel-joborder-richtext">
                <h4>Description</h4>
                <p>{toDisplayText(jobOrder.description)}</p>
                <h4>Notes</h4>
                <p>{toDisplayText(jobOrder.notes)}</p>
              </div>
            </div>

            <div className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Attachments</h2>
                <div className="modern-table-actions">
                  <p className="avel-list-panel__hint">{data.attachments.count} files</p>
                  {permissions.canCreateAttachment ? (
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
                  ) : null}
                </div>
              </div>
              {permissions.canCreateAttachment && attachmentUploadOpen ? (
                <div className="avel-joborder-thread-form" style={{ marginBottom: '8px' }}>
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
                    <button
                      type="button"
                      className="modern-btn modern-btn--mini modern-btn--secondary"
                      onClick={() =>
                        setPipelineModal({
                          url: decodeLegacyURL(data.actions.createAttachmentURL),
                          title: 'Add Attachment (Legacy)',
                          showRefreshClose: true
                        })
                      }
                    >
                      Use Legacy Uploader
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
                            className="modern-btn modern-btn--mini modern-btn--danger"
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
            </div>
          </section>

          <section className="avel-joborder-show-split">
            <div className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Team Comments</h2>
                <div className="modern-table-actions">
                  <span className="modern-chip modern-chip--info">{data.comments.count} entries</span>
                  <button
                    type="button"
                    className="modern-btn modern-btn--mini modern-btn--secondary"
                    onClick={() => setCommentsOpen((current) => !current)}
                  >
                    {commentsOpen ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              {commentsOpen ? (
                <div className="avel-joborder-thread-block">
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
                          rows={5}
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
                </div>
              ) : null}
            </div>

            <div className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Team Inbox</h2>
                <div className="modern-table-actions">
                  {data.messages.enabled ? (
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
                  ) : null}
                </div>
              </div>

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
                          rows={5}
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
                        className="modern-btn modern-btn--mini modern-btn--danger"
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
            </div>
          </section>

          <section className="avel-joborder-show-split">
            <div className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Hiring Plan</h2>
                <p className="avel-list-panel__hint">Total openings: {data.hiringPlan.totalOpenings}</p>
              </div>
              <DataTable
                columns={[
                  { key: 'description', title: 'Description' },
                  { key: 'openings', title: 'Openings' },
                  { key: 'window', title: 'Window' }
                ]}
                hasRows={hasHiringPlanRows}
                emptyMessage="No hiring plan rows."
              >
                {data.hiringPlan.items.map((row) => (
                  <tr key={row.hiringPlanID}>
                    <td>{toDisplayText(row.description)}</td>
                    <td>{row.openings}</td>
                    <td>{`${toDisplayText(row.startDate)} - ${toDisplayText(row.endDate)}`}</td>
                  </tr>
                ))}
              </DataTable>
            </div>

            <div className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Extra Fields</h2>
                <p className="avel-list-panel__hint">Custom metadata</p>
              </div>
              <DataTable
                columns={[
                  { key: 'field', title: 'Field' },
                  { key: 'value', title: 'Value' }
                ]}
                hasRows={hasExtraFields}
                emptyMessage="No extra fields."
              >
                {data.extraFields.map((field) => (
                  <tr key={field.fieldName}>
                    <td>{toDisplayText(field.fieldName)}</td>
                    <td>{toDisplayText(field.display)}</td>
                  </tr>
                ))}
              </DataTable>
            </div>
          </section>
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

        <LegacyFrameModal
          isOpen={!!pipelineModal}
          title={pipelineModal?.title || 'Pipeline Action'}
          url={pipelineModal?.url || ''}
          onClose={closePipelineModal}
          showRefreshClose={pipelineModal?.showRefreshClose ?? true}
        />
      </PageContainer>
    </div>
  );
}


