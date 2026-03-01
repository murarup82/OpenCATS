import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  addCandidateProfileComment,
  deleteCandidateAttachment,
  deleteCandidateMessageThread,
  fetchPipelineStatusDetailsModernData,
  fetchCandidatesShowModernData,
  postCandidateMessage,
  removePipelineEntryViaLegacyURL,
  setDashboardPipelineStatus,
  updateCandidateTags,
  uploadCandidateAttachment,
  updatePipelineStatusHistoryDate
} from '../lib/api';
import type {
  CandidatesShowModernDataResponse,
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

function formatQuestionnaireDate(value: unknown): string {
  const raw = String(value || '').trim();
  if (raw === '') {
    return '--';
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return raw;
  }

  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function createStatusClassName(statusSlug: string): string {
  return `modern-status modern-status--${statusSlug || 'unknown'}`;
}

export function CandidatesShowPage({ bootstrap }: Props) {
  const [data, setData] = useState<CandidatesShowModernDataResponse | null>(null);
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
  const [pipelineDetailsModal, setPipelineDetailsModal] = useState<{
    title: string;
    fullDetailsURL: string;
    pipelineID: number;
    details: PipelineStatusDetailsModernDataResponse | null;
    loading: boolean;
    error: string;
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
  const [tagEditorOpen, setTagEditorOpen] = useState<boolean>(false);
  const [selectedTagIDs, setSelectedTagIDs] = useState<number[]>([]);
  const [tagSavePending, setTagSavePending] = useState<boolean>(false);
  const [tagSaveError, setTagSaveError] = useState<string>('');
  const [attachmentUploadOpen, setAttachmentUploadOpen] = useState<boolean>(false);
  const [attachmentUploadFile, setAttachmentUploadFile] = useState<File | null>(null);
  const [attachmentUploadIsResume, setAttachmentUploadIsResume] = useState<boolean>(false);
  const [attachmentUploadPending, setAttachmentUploadPending] = useState<boolean>(false);
  const [attachmentUploadError, setAttachmentUploadError] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchCandidatesShowModernData(bootstrap, query)
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
        setSelectedTagIDs(
          Array.isArray(result.tagManagement?.assignedTagIDs)
            ? result.tagManagement.assignedTagIDs.map((value) => Number(value || 0)).filter((value) => value > 0)
            : []
        );
      })
      .catch((err: Error) => {
        if (!isMounted) {
          return;
        }
        setError(err.message || 'Unable to load candidate profile.');
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

  const handleRemoveFromPipeline = useCallback(
    async (pipeline: CandidatesShowModernDataResponse['pipelines']['items'][number]) => {
      if (!data) {
        return;
      }

      const token = data.actions.removeFromPipelineToken || '';
      if (token === '') {
        setPipelineModal({
          url: decodeLegacyURL(pipeline.actions.removeFromPipelineURL),
          title: `Remove From Pipeline: ${toDisplayText(pipeline.jobOrderTitle)}`,
          openInPopup: { width: 500, height: 320, refreshOnClose: true },
          showRefreshClose: true
        });
        return;
      }

      const candidateName = toDisplayText(data.candidate.fullName);
      const jobOrderTitle = toDisplayText(pipeline.jobOrderTitle);
      const confirmed = window.confirm(`Remove ${candidateName} from ${jobOrderTitle}?`);
      if (!confirmed) {
        return;
      }

      const note = window.prompt('Optional removal note (leave blank for none):', '');
      if (note === null) {
        return;
      }

      try {
        const result = await removePipelineEntryViaLegacyURL(
          decodeLegacyURL(pipeline.actions.removeFromPipelineURL),
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
    async (pipeline: CandidatesShowModernDataResponse['pipelines']['items'][number]) => {
      const pipelineID = Number(pipeline.candidateJobOrderID || 0);
      if (pipelineID <= 0) {
        return;
      }

      const title = `Pipeline Details: ${toDisplayText(pipeline.jobOrderTitle)}`;
      const fullDetailsURL = decodeLegacyURL(pipeline.actions.pipelineDetailsURL);
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

  const submitCandidateComment = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!data || commentSubmitPending) {
        return;
      }

      setCommentSubmitError('');
      setCommentSubmitPending(true);
      try {
        const result = await addCandidateProfileComment(decodeLegacyURL(data.actions.addCommentURL), {
          candidateID: Number(data.meta.candidateID || 0),
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

  const submitCandidateMessage = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!data || messageSubmitPending) {
        return;
      }

      setMessageSubmitError('');
      setMessageSubmitPending(true);
      try {
        const result = await postCandidateMessage(decodeLegacyURL(data.actions.postMessageURL), {
          candidateID: Number(data.meta.candidateID || 0),
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
      const result = await deleteCandidateMessageThread(decodeLegacyURL(data.actions.deleteMessageThreadURL), {
        candidateID: Number(data.meta.candidateID || 0),
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

  const handleDeleteAttachment = useCallback(
    async (attachmentID: number, fileName: string) => {
      if (!data) {
        return;
      }

      const deleteURL = decodeLegacyURL(data.actions.deleteAttachmentURL || '');
      const token = data.actions.deleteAttachmentToken || '';
      if (deleteURL === '' || token === '') {
        window.alert('Attachment delete endpoint is not available in this mode.');
        return;
      }

      const confirmed = window.confirm(`Delete attachment "${toDisplayText(fileName, 'this file')}"?`);
      if (!confirmed) {
        return;
      }

      try {
        const result = await deleteCandidateAttachment(deleteURL, {
          candidateID: Number(data.meta.candidateID || 0),
          attachmentID: Number(attachmentID || 0),
          securityToken: token
        });
        if (!result.success) {
          window.alert(result.message || 'Unable to delete attachment.');
          return;
        }
        refreshPageData();
      } catch (err: unknown) {
        window.alert(err instanceof Error ? err.message : 'Unable to delete attachment.');
      }
    },
    [data, refreshPageData]
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
      const result = await uploadCandidateAttachment(submitURL, {
        candidateID: Number(data.meta.candidateID || 0),
        file: attachmentUploadFile,
        isResume: attachmentUploadIsResume
      });
      if (!result.success) {
        setAttachmentUploadError(result.message || 'Unable to upload attachment.');
        return;
      }

      setAttachmentUploadFile(null);
      setAttachmentUploadIsResume(false);
      setAttachmentUploadOpen(false);
      refreshPageData();
    } catch (err: unknown) {
      setAttachmentUploadError(err instanceof Error ? err.message : 'Unable to upload attachment.');
    } finally {
      setAttachmentUploadPending(false);
    }
  }, [attachmentUploadFile, attachmentUploadIsResume, attachmentUploadPending, data, refreshPageData]);

  const openTagEditor = useCallback(() => {
    if (!data) {
      return;
    }

    const tagCatalog = data.tagManagement?.catalog || [];
    const token = data.actions.addTagsToken || '';
    if (tagCatalog.length === 0 || token === '') {
      setPipelineModal({
        url: decodeLegacyURL(data.actions.addTagsURL),
        title: 'Manage Tags',
        openInPopup: { width: 500, height: 300, refreshOnClose: true },
        showRefreshClose: true
      });
      return;
    }

    setSelectedTagIDs(
      Array.isArray(data.tagManagement.assignedTagIDs)
        ? data.tagManagement.assignedTagIDs.map((value) => Number(value || 0)).filter((value) => value > 0)
        : []
    );
    setTagSaveError('');
    setTagEditorOpen(true);
  }, [data]);

  const toggleTagSelection = useCallback((tagID: number) => {
    setSelectedTagIDs((current) => {
      if (current.includes(tagID)) {
        return current.filter((value) => value !== tagID);
      }
      return [...current, tagID];
    });
  }, []);

  const submitTagEditor = useCallback(async () => {
    if (!data || tagSavePending) {
      return;
    }
    if (selectedTagIDs.length === 0) {
      setTagSaveError('Select at least one tag.');
      return;
    }

    const submitURL = decodeLegacyURL(data.actions.addTagsURL || '');
    const token = data.actions.addTagsToken || '';
    if (submitURL === '' || token === '') {
      setTagSaveError('Tag update endpoint is not available.');
      return;
    }

    setTagSavePending(true);
    setTagSaveError('');
    try {
      const result = await updateCandidateTags(submitURL, {
        candidateID: Number(data.meta.candidateID || 0),
        tagIDs: selectedTagIDs,
        securityToken: token
      });
      if (!result.success) {
        setTagSaveError(result.message || 'Unable to update tags.');
        return;
      }

      setTagEditorOpen(false);
      refreshPageData();
    } catch (err: unknown) {
      setTagSaveError(err instanceof Error ? err.message : 'Unable to update tags.');
    } finally {
      setTagSavePending(false);
    }
  }, [data, refreshPageData, selectedTagIDs, tagSavePending]);

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
    (pipeline: CandidatesShowModernDataResponse['pipelines']['items'][number]) => {
      if (!data) {
        return;
      }

      const fallbackURL = decodeLegacyURL(pipeline.actions.changeStatusURL);
      const fallbackTitle = `Change Status: ${toDisplayText(pipeline.jobOrderTitle)}`;
      const statusOptions = getForwardStatusOptions(Number(pipeline.statusID || 0));
      if (statusOptions.length === 0) {
        setPipelineModal({
          url: fallbackURL,
          title: fallbackTitle,
          openInPopup: { width: 700, height: 620, refreshOnClose: true },
          showRefreshClose: true
        });
        return;
      }

      setQuickStatusModal({
        title: `Quick Status: ${toDisplayText(pipeline.jobOrderTitle)}`,
        currentStatusLabel: toDisplayText(pipeline.statusLabel),
        statusOptions,
        candidateID: Number(data.meta.candidateID || 0),
        jobOrderID: Number(pipeline.jobOrderID || 0),
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
          openInPopup: { width: 700, height: 620, refreshOnClose: true },
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
              openInPopup: { width: 700, height: 620, refreshOnClose: true },
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

  const openAddToListOverlay = useCallback(
    (sourceURL: string) => {
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
    },
    []
  );

  const navigateWithShowClosed = (showClosed: boolean) => {
    const nextQuery = new URLSearchParams(serverQueryString);
    nextQuery.set('m', 'candidates');
    nextQuery.set('a', 'show');
    if (data) {
      nextQuery.set('candidateID', String(data.meta.candidateID));
    }
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
    return <div className="modern-state">Loading candidate profile...</div>;
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
    return <EmptyState message="Candidate profile not available." />;
  }

  const permissions = data.meta.permissions;
  const candidate = data.candidate;
  const gdpr = data.gdpr;
  const showClosed = data.meta.showClosedPipeline;
  const tagCatalog = [...(data.tagManagement?.catalog || [])].sort((left, right) =>
    toDisplayText(left.title, '').localeCompare(toDisplayText(right.title, ''))
  );

  return (
    <div className="avel-dashboard-page avel-candidate-show-page">
      <PageContainer
        title={toDisplayText(candidate.fullName, 'Candidate')}
        subtitle={`Candidate profile #${candidate.candidateID}`}
        actions={
          <>
            {permissions.canEditCandidate ? (
              <a className="modern-btn modern-btn--secondary" href={ensureModernUIURL(decodeLegacyURL(data.actions.editURL))}>
                Edit Candidate
              </a>
            ) : null}
            {permissions.canAddToJobOrder ? (
              <button
                type="button"
                className="modern-btn modern-btn--secondary"
                onClick={() =>
                  setPipelineModal({
                    url: decodeLegacyURL(data.actions.addToJobOrderURL),
                    title: 'Add Candidate To Job Order',
                    openInPopup: { width: 1120, height: 760, refreshOnClose: true },
                    showRefreshClose: true
                  })
                }
              >
                Add To Job Order
              </button>
            ) : null}
            {permissions.canViewHistory ? (
              <button
                type="button"
                className="modern-btn modern-btn--secondary"
                onClick={() =>
                  setPipelineModal({
                    url: decodeLegacyURL(data.actions.viewHistoryURL),
                    title: 'Candidate History',
                    openInPopup: { width: 980, height: 720, refreshOnClose: false },
                    showRefreshClose: false
                  })
                }
              >
                History
              </button>
            ) : null}
            <a className="modern-btn modern-btn--secondary" href={decodeLegacyURL(data.actions.legacyURL)}>
              Open Legacy UI
            </a>
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-candidate-hero">
            <div className="avel-candidate-hero__identity">
              <div className="avel-candidate-hero__name">
                {toDisplayText(candidate.fullName)}
                {!candidate.isActive ? <span className="modern-chip modern-chip--critical">Inactive</span> : null}
                {candidate.isHot ? <span className="modern-chip modern-chip--warning">Hot</span> : null}
              </div>
              <div className="avel-candidate-hero__meta">
                {String(candidate.email1 || '').trim() !== '' ? (
                  <a className="modern-link" href={`mailto:${candidate.email1}`}>
                    {toDisplayText(candidate.email1)}
                  </a>
                ) : (
                  <span>{toDisplayText(candidate.email1)}</span>
                )}
                <span>{toDisplayText(candidate.phoneCell)}</span>
                <span>{`${toDisplayText(candidate.city)}, ${toDisplayText(candidate.country)}`}</span>
                <span>Owner: {toDisplayText(candidate.owner)}</span>
                <span>Source: {toDisplayText(candidate.source)}</span>
              </div>
              {candidate.duplicates.length > 0 ? (
                <div className="avel-candidate-hero__duplicates">
                  {candidate.duplicates.map((duplicate) => (
                    <a key={duplicate.candidateID} className="modern-chip modern-chip--info" href={ensureModernUIURL(duplicate.showURL)}>
                      Duplicate #{duplicate.candidateID}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
            {candidate.profileImageURL !== '' ? (
              <div className="avel-candidate-hero__avatar">
                <img src={decodeLegacyURL(candidate.profileImageURL)} alt={candidate.fullName} />
              </div>
            ) : null}
          </section>

          <section className="avel-kpi-grid">
            <div className="avel-kpi">
              <span className="avel-kpi__label">Pipeline Entries</span>
              <span className="avel-kpi__value">{candidate.pipelineCount}</span>
              <span className="avel-kpi__hint">Active: {data.pipelines.activeCount}</span>
            </div>
            <div className="avel-kpi">
              <span className="avel-kpi__label">Proposed</span>
              <span className="avel-kpi__value">{candidate.submittedCount}</span>
              <span className="avel-kpi__hint">To customer</span>
            </div>
            <div className="avel-kpi">
              <span className="avel-kpi__label">Comments</span>
              <span className="avel-kpi__value">{data.comments.count}</span>
              <span className="avel-kpi__hint">Profile notes</span>
            </div>
            <div className="avel-kpi">
              <span className="avel-kpi__label">Attachments</span>
              <span className="avel-kpi__value">{data.attachments.items.length}</span>
              <span className="avel-kpi__hint">Documents</span>
            </div>
          </section>

          <div className="avel-candidate-grid">
            <section className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Details</h2>
                <p className="avel-list-panel__hint">Core profile data and custom fields.</p>
              </div>
              <div className="avel-candidate-details">
                <div><strong>Current Employer:</strong> {toDisplayText(candidate.currentEmployer)}</div>
                <div><strong>Date Available:</strong> {toDisplayText(candidate.dateAvailable)}</div>
                <div><strong>Best Time To Call:</strong> {toDisplayText(candidate.bestTimeToCall)}</div>
                <div><strong>Can Relocate:</strong> {toDisplayText(candidate.canRelocate)}</div>
                <div><strong>Current Pay:</strong> {toDisplayText(candidate.currentPay)}</div>
                <div><strong>Desired Pay:</strong> {toDisplayText(candidate.desiredPay)}</div>
                <div><strong>Created:</strong> {toDisplayText(candidate.dateCreated)} ({toDisplayText(candidate.enteredBy)})</div>
                <div><strong>Modified:</strong> {toDisplayText(candidate.dateModified)}</div>
                <div className="avel-candidate-details__full"><strong>Address:</strong> {toDisplayText(candidate.address)}</div>
                <div className="avel-candidate-details__full"><strong>Key Skills:</strong> {toDisplayText(candidate.keySkills)}</div>
                {data.extraFields.map((field) => (
                  <div key={field.fieldName} className="avel-candidate-details__full">
                    <strong>{toDisplayText(field.fieldName)}:</strong> {toDisplayText(field.display)}
                  </div>
                ))}
              </div>
            </section>

            <section className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">GDPR</h2>
                <p className="avel-list-panel__hint">
                  Latest status: {toDisplayText(gdpr.latestRequest.status)}
                </p>
              </div>
              <div className="avel-candidate-details">
                <div><strong>Request Created:</strong> {toDisplayText(gdpr.latestRequest.createdAt)}</div>
                <div><strong>Email Sent:</strong> {toDisplayText(gdpr.latestRequest.emailSentAt)}</div>
                <div><strong>Link Expires:</strong> {toDisplayText(gdpr.latestRequest.expiresAt)}</div>
                <div><strong>Deleted At:</strong> {toDisplayText(gdpr.latestRequest.deletedAt)}</div>
                {gdpr.sendDisabledReason !== '' ? (
                  <div className="avel-candidate-details__full">
                    <strong>Send Disabled:</strong> {gdpr.sendDisabledReason}
                  </div>
                ) : null}
                {gdpr.legacyProof.link !== '' ? (
                  <div className="avel-candidate-details__full">
                    <strong>Legacy Proof:</strong>{' '}
                    <a className="modern-link" href={decodeLegacyURL(gdpr.legacyProof.link)} target="_blank" rel="noreferrer">
                      {toDisplayText(gdpr.legacyProof.fileName, 'View file')}
                    </a>
                  </div>
                ) : null}
                {gdpr.flashMessage !== '' ? (
                  <div className="avel-candidate-details__full">
                    <strong>Info:</strong> {gdpr.flashMessage}
                  </div>
                ) : null}
              </div>
            </section>
          </div>

          {data.eeoValues.length > 0 ? (
            <section className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">EEO Information</h2>
                <p className="avel-list-panel__hint">Compliance-related candidate attributes.</p>
              </div>
              <div className="avel-candidate-details">
                {data.eeoValues.map((item) => (
                  <div key={item.fieldName}>
                    <strong>{toDisplayText(item.fieldName)}:</strong> {toDisplayText(item.fieldValue)}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Notes & Comments</h2>
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
            <div className="avel-candidate-notes">
              <pre>{toDisplayText(candidate.notesText, '') || 'No notes provided.'}</pre>
            </div>
            {data.comments.flashMessage ? (
              <div className={`modern-state ${data.comments.flashIsError ? 'modern-state--error' : 'modern-state--empty'}`}>
                {data.comments.flashMessage}
              </div>
            ) : null}
            {commentsOpen ? (
              <>
                {data.comments.canAddComment ? (
                  <form className="avel-joborder-thread-form" onSubmit={submitCandidateComment}>
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
                        placeholder="Share an internal update for this candidate."
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
                  <div className="avel-candidate-comments">
                    {data.comments.items.map((comment) => (
                      <article key={comment.activityID} className="avel-candidate-comment">
                        <div className="avel-candidate-comment__meta">
                          <span>{toDisplayText(comment.category)}</span>
                          <span>{toDisplayText(comment.enteredBy)}</span>
                          <span>{toDisplayText(comment.dateCreated)}</span>
                        </div>
                        <p>{toDisplayText(comment.commentText, '')}</p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="modern-state modern-state--empty">No comments yet.</div>
                )}
              </>
            ) : null}
          </section>

          <section className="avel-list-panel">
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
            {data.messages.flashMessage ? (
              <div className={`modern-state ${data.messages.flashIsError ? 'modern-state--error' : 'modern-state--empty'}`}>
                {data.messages.flashMessage}
              </div>
            ) : null}
            {!data.messages.enabled ? (
              <div className="modern-state modern-state--empty">
                Messaging tables are missing. Run schema migrations to enable Team Inbox.
              </div>
            ) : messagesOpen ? (
              <div className="avel-joborder-thread-block">
                {permissions.candidateMessagingEnabled ? (
                  <form className="avel-joborder-thread-form" onSubmit={submitCandidateMessage}>
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
          </section>

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Pipelines</h2>
              <div className="avel-candidates-pagination">
                <label className="modern-command-toggle">
                  <input
                    type="checkbox"
                    checked={showClosed}
                    onChange={(event) => navigateWithShowClosed(event.target.checked)}
                  />
                  <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                  <span>Show Closed</span>
                </label>
              </div>
            </div>
            <DataTable
              columns={[
                { key: 'job', title: 'Job Order' },
                { key: 'company', title: 'Company' },
                { key: 'status', title: 'Status' },
                { key: 'owner', title: 'Owner' },
                { key: 'date', title: 'Added' },
                { key: 'actions', title: 'Actions' }
              ]}
              hasRows={data.pipelines.items.length > 0}
              emptyMessage="No pipeline entries for this candidate."
            >
              {data.pipelines.items.map((pipeline) => (
                <tr key={pipeline.candidateJobOrderID}>
                  <td>
                    <a className="modern-link" href={ensureModernUIURL(decodeLegacyURL(pipeline.jobOrderURL))}>
                      {toDisplayText(pipeline.jobOrderTitle)}
                    </a>
                    {pipeline.clientJobID !== '' ? <div>{pipeline.clientJobID}</div> : null}
                  </td>
                  <td>
                    <a className="modern-link" href={ensureModernUIURL(decodeLegacyURL(pipeline.companyURL))}>
                      {toDisplayText(pipeline.companyName)}
                    </a>
                  </td>
                  <td>
                    <span className={createStatusClassName(pipeline.statusSlug)}>{toDisplayText(pipeline.statusLabel)}</span>
                    {!pipeline.isActive ? <span className="modern-chip modern-chip--critical">Closed</span> : null}
                  </td>
                  <td>{toDisplayText(pipeline.ownerName)}</td>
                  <td>{toDisplayText(pipeline.dateCreated)}</td>
                  <td>
                    <div className="modern-table-actions">
                      {permissions.canChangePipelineStatus ? (
                        <button
                          type="button"
                          className="modern-btn modern-btn--mini modern-btn--secondary"
                          onClick={() => openQuickStatus(pipeline)}
                        >
                          Change Status
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="modern-btn modern-btn--mini modern-btn--secondary"
                        onClick={() => openPipelineDetailsInline(pipeline)}
                      >
                        Details
                      </button>
                      {permissions.canRemoveFromPipeline ? (
                        <button
                          type="button"
                          className="modern-btn modern-btn--mini modern-btn--secondary"
                          onClick={() => handleRemoveFromPipeline(pipeline)}
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </DataTable>
          </section>

          <div className="avel-candidate-grid">
            <section className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Attachments</h2>
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
                  <label className="modern-command-toggle">
                    <input
                      type="checkbox"
                      checked={attachmentUploadIsResume}
                      onChange={(event) => setAttachmentUploadIsResume(event.target.checked)}
                    />
                    <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                    <span>Treat as resume (enable parsing/indexing)</span>
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
                          openInPopup: { width: 520, height: 280, refreshOnClose: true },
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
                  { key: 'name', title: 'File' },
                  { key: 'date', title: 'Date' },
                  { key: 'actions', title: 'Actions' }
                ]}
                hasRows={data.attachments.items.length > 0}
                emptyMessage="No attachments."
              >
                {data.attachments.items.map((attachment) => (
                  <tr key={attachment.attachmentID}>
                    <td>
                      <a className="modern-link" href={decodeLegacyURL(attachment.retrievalURL)} target="_blank" rel="noreferrer">
                        {toDisplayText(attachment.fileName)}
                      </a>
                    </td>
                    <td>{toDisplayText(attachment.dateCreated)}</td>
                    <td>
                      <div className="modern-table-actions">
                        {attachment.previewAvailable ? (
                          <a className="modern-btn modern-btn--mini modern-btn--secondary" href={decodeLegacyURL(attachment.previewURL)} target="_blank" rel="noreferrer">
                            Preview
                          </a>
                        ) : null}
                        {permissions.canDeleteAttachment ? (
                          <button
                            type="button"
                            className="modern-btn modern-btn--mini modern-btn--danger"
                            onClick={() => handleDeleteAttachment(attachment.attachmentID, attachment.fileName)}
                          >
                            Delete
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </DataTable>
            </section>

            <section className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Tags & Lists</h2>
                <div className="modern-table-actions">
                  {permissions.canManageTags ? (
                    <button
                      type="button"
                      className="modern-btn modern-btn--mini modern-btn--secondary"
                      onClick={openTagEditor}
                    >
                      Manage Tags
                    </button>
                  ) : null}
                  {permissions.canManageLists ? (
                    <button
                      type="button"
                      className="modern-btn modern-btn--mini modern-btn--secondary"
                      onClick={() => openAddToListOverlay(data.actions.addToListURL)}
                    >
                      Manage Lists
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="avel-candidate-tag-cloud">
                {data.tags.length > 0 ? data.tags.map((tag) => <span key={tag} className="modern-chip">{tag}</span>) : <span>No tags.</span>}
              </div>
              <ul className="avel-candidate-lists">
                {data.lists.map((list) => (
                  <li key={list.listID}>
                    <a className="modern-link" href={ensureModernUIURL(decodeLegacyURL(list.url))}>
                      {toDisplayText(list.name)}
                    </a>
                  </li>
                ))}
                {data.lists.length === 0 ? <li>No lists linked.</li> : null}
              </ul>
            </section>
          </div>

          <div className="avel-candidate-grid">
            <section className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Upcoming Events</h2>
                <p className="avel-list-panel__hint">Calendar items linked to this profile.</p>
              </div>
              {data.calendar.length > 0 ? (
                <ul className="avel-candidate-lists">
                  {data.calendar.slice(0, 10).map((eventItem) => (
                    <li key={eventItem.eventID}>
                      <button
                        type="button"
                        className="modern-btn modern-btn--mini modern-btn--secondary"
                        onClick={() =>
                          setPipelineModal({
                            url: ensureModernUIURL(decodeLegacyURL(eventItem.eventURL)),
                            title: `Calendar Event: ${toDisplayText(eventItem.title)}`,
                            openInPopup: { width: 1120, height: 760, refreshOnClose: false },
                            showRefreshClose: false
                          })
                        }
                      >
                        {toDisplayText(eventItem.dateShow)}: {toDisplayText(eventItem.title)}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="modern-state modern-state--empty">No upcoming events.</div>
              )}
            </section>

            <section className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Questionnaires</h2>
                <p className="avel-list-panel__hint">Submitted candidate questionnaires.</p>
              </div>
              {data.questionnaires.length > 0 ? (
                <DataTable
                  columns={[
                    { key: 'title', title: 'Title' },
                    { key: 'completed', title: 'Completed' },
                    { key: 'description', title: 'Description' },
                    { key: 'actions', title: 'Actions' }
                  ]}
                  hasRows={data.questionnaires.length > 0}
                >
                  {data.questionnaires.slice(0, 10).map((questionnaire, index) => {
                    const row = questionnaire as Record<string, unknown>;
                    const rawTitle = row['questionnaireTitle'];
                    const title = toDisplayText(rawTitle);
                    const titleEncoded = encodeURIComponent(String(rawTitle || ''));
                    const viewURL =
                      `${bootstrap.indexName}?m=candidates&a=show_questionnaire&candidateID=${candidate.candidateID}` +
                      `&questionnaireTitle=${titleEncoded}&print=no&ui=legacy`;
                    const printURL =
                      `${bootstrap.indexName}?m=candidates&a=show_questionnaire&candidateID=${candidate.candidateID}` +
                      `&questionnaireTitle=${titleEncoded}&print=yes&ui=legacy`;

                    return (
                      <tr key={`${title}-${index}`}>
                        <td>{title}</td>
                        <td>{formatQuestionnaireDate(row['questionnaireDate'])}</td>
                        <td>{toDisplayText(row['questionnaireDescription'])}</td>
                        <td>
                          <div className="modern-table-actions">
                            <button
                              type="button"
                              className="modern-btn modern-btn--mini modern-btn--secondary"
                              onClick={() =>
                                setPipelineModal({
                                  url: decodeLegacyURL(viewURL),
                                  title: `Questionnaire: ${title}`,
                                  openInPopup: { width: 980, height: 720, refreshOnClose: false },
                                  showRefreshClose: false
                                })
                              }
                            >
                              View
                            </button>
                            <a className="modern-btn modern-btn--mini modern-btn--secondary" href={printURL} target="_blank" rel="noreferrer">
                              Print
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </DataTable>
              ) : (
                <div className="modern-state modern-state--empty">No questionnaires available.</div>
              )}
            </section>
          </div>
        </div>

        {tagEditorOpen ? (
          <div className="modern-inline-modal" role="dialog" aria-modal="true" aria-label="Manage Tags">
            <div className="modern-inline-modal__dialog modern-inline-modal__dialog--compact">
              <div className="modern-inline-modal__header">
                <h3>Manage Tags</h3>
                <p>Select tags assigned to this candidate.</p>
              </div>
              <div className="modern-inline-modal__body modern-inline-modal__body--form">
                <div className="modern-tag-editor">
                  {tagCatalog.map((tag) => {
                    const tagID = Number(tag.tagID || 0);
                    if (tagID <= 0) {
                      return null;
                    }
                    return (
                      <label key={tagID} className="modern-tag-editor__option">
                        <input
                          type="checkbox"
                          checked={selectedTagIDs.includes(tagID)}
                          onChange={() => toggleTagSelection(tagID)}
                        />
                        <span>{toDisplayText(tag.title)}</span>
                      </label>
                    );
                  })}
                </div>
                {tagSaveError ? <div className="modern-state modern-state--error">{tagSaveError}</div> : null}
              </div>
              <div className="modern-inline-modal__actions">
                <button
                  type="button"
                  className="modern-btn modern-btn--emphasis"
                  onClick={submitTagEditor}
                  disabled={tagSavePending}
                >
                  {tagSavePending ? 'Saving...' : 'Save Tags'}
                </button>
                <button
                  type="button"
                  className="modern-btn modern-btn--secondary"
                  onClick={() => {
                    setTagEditorOpen(false);
                    setTagSaveError('');
                  }}
                  disabled={tagSavePending}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}

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
                    openInPopup: { width: 700, height: 620, refreshOnClose: true },
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
