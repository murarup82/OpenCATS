import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  addJobOrderProfileComment,
  deleteJobOrderMessageThread,
  fetchPipelineStatusDetailsModernData,
  fetchJobOrdersShowModernData,
  postJobOrderMessage,
  removePipelineEntryViaLegacyURL,
  setDashboardPipelineStatus,
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
import { ensureModernUIURL } from '../lib/navigation';
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
    openInPopup: { width: number; height: number; refreshOnClose: boolean };
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
  const [pipelineDetailsModal, setPipelineDetailsModal] = useState<{
    title: string;
    fullDetailsURL: string;
    pipelineID: number;
    details: PipelineStatusDetailsModernDataResponse | null;
    loading: boolean;
    error: string;
  } | null>(null);
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
    if (!window.confirm('Delete this thread for all users? This cannot be undone.')) {
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
      refreshPageData();
    } catch (err: unknown) {
      setMessageDeleteError(err instanceof Error ? err.message : 'Unable to delete message thread.');
    } finally {
      setMessageDeletePending(false);
    }
  }, [data, messageDeletePending, refreshPageData]);

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
          openInPopup: { width: 970, height: 730, refreshOnClose: true },
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
    },
    [data, getForwardStatusOptions]
  );

  const submitQuickStatus = useCallback(
    async (targetStatusID: number) => {
      if (!data || !quickStatusModal) {
        return;
      }

      const token = data.actions.setPipelineStatusToken || '';
      if (token === '') {
        setQuickStatusModal(null);
        setPipelineModal({
          url: quickStatusModal.fallbackURL,
          title: quickStatusModal.fallbackTitle,
          openInPopup: { width: 970, height: 730, refreshOnClose: true },
          showRefreshClose: true
        });
        return;
      }

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
            setQuickStatusModal(null);
            setPipelineModal({
              url: quickStatusModal.fallbackURL,
              title: quickStatusModal.fallbackTitle,
              openInPopup: { width: 970, height: 730, refreshOnClose: true },
              showRefreshClose: true
            });
            return;
          }

          window.alert(result.message || 'Unable to update pipeline status.');
          return;
        }

        setQuickStatusModal(null);
        refreshPageData();
      } catch (err: unknown) {
        window.alert(err instanceof Error ? err.message : 'Unable to update pipeline status.');
      }
    },
    [bootstrap, data, quickStatusModal, refreshPageData]
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
          openInPopup: { width: 430, height: 200, refreshOnClose: true },
          showRefreshClose: true
        });
        return;
      }

      const candidateName = toDisplayText(item.candidateName);
      const confirmed = window.confirm(`Remove ${candidateName} from this pipeline?`);
      if (!confirmed) {
        return;
      }

      const note = window.prompt('Optional removal note (leave blank for none):', '');
      if (note === null) {
        return;
      }

      try {
        const result = await removePipelineEntryViaLegacyURL(
          decodeLegacyURL(item.actions.removeFromPipelineURL),
          token,
          note
        );
        if (!result.success) {
          window.alert(result.message || 'Unable to remove candidate from pipeline.');
          return;
        }
        refreshPageData();
      } catch (err: unknown) {
        window.alert(err instanceof Error ? err.message : 'Unable to remove candidate from pipeline.');
      }
    },
    [data, refreshPageData]
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
                    openInPopup: { width: 1120, height: 760, refreshOnClose: true },
                    showRefreshClose: true
                  })
                }
              >
                Add Candidate
              </button>
            ) : null}
            <a className="modern-btn modern-btn--secondary" href={decodeLegacyURL(data.actions.reportURL)}>
              Report
            </a>
            {permissions.canViewHistory ? (
              <a className="modern-btn modern-btn--secondary" href={decodeLegacyURL(data.actions.historyURL)}>
                History
              </a>
            ) : null}
            <a className="modern-btn modern-btn--secondary" href={decodeLegacyURL(data.actions.hiringPlanURL)}>
              Hiring Plan
            </a>
            {permissions.canAdministrativeHideShow ? (
              <a
                className="modern-btn modern-btn--secondary"
                href={`${decodeLegacyURL(data.actions.administrativeHideShowBaseURL)}&state=${jobOrder.isAdminHidden ? '0' : '1'}`}
              >
                {jobOrder.isAdminHidden ? 'Unhide' : 'Hide'}
              </a>
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
                      onClick={() =>
                        setPipelineModal({
                          url: decodeLegacyURL(data.actions.createAttachmentURL),
                          title: 'Add Attachment',
                          openInPopup: { width: 520, height: 280, refreshOnClose: true },
                          showRefreshClose: true
                        })
                      }
                    >
                      Add Attachment
                    </button>
                  ) : null}
                </div>
              </div>
              <DataTable
                columns={[
                  { key: 'fileName', title: 'File' },
                  { key: 'dateCreated', title: 'Date' }
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
                      <a className="modern-btn modern-btn--mini modern-btn--secondary" href={ensureModernUIURL(decodeLegacyURL(data.messages.openInboxURL))}>
                        Open Inbox
                      </a>
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
                        onClick={handleDeleteMessageThread}
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
          onCancel={() => setQuickStatusModal(null)}
          onSubmit={submitQuickStatus}
          onOpenFullForm={
            quickStatusModal
              ? () => {
                  setQuickStatusModal(null);
                  setPipelineModal({
                    url: quickStatusModal.fallbackURL,
                    title: quickStatusModal.fallbackTitle,
                    openInPopup: { width: 970, height: 730, refreshOnClose: true },
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
                  window.open(pipelineDetailsModal.fullDetailsURL, '_blank', 'noopener');
                }
              : undefined
          }
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
