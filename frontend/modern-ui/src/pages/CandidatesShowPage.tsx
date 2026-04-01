import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  addCandidateProfileComment,
  createTalentFitFlowTransformJob,
  deleteCandidateGoogleDriveAttachmentFile,
  deleteCandidateAttachment,
  deleteCandidateMessageThread,
  fetchPipelineStatusDetailsModernData,
  fetchTalentFitFlowTransformStatus,
  fetchCandidatesShowModernData,
  postCandidateMessage,
  removePipelineEntryViaLegacyURL,
  searchJobOrdersForTransform,
  setDashboardPipelineStatus,
  storeTalentFitFlowTransformedAttachment,
  uploadCandidateAttachmentToGoogleDrive,
  updateCandidateTags,
  uploadCandidateAttachment,
  updatePipelineStatusHistoryDate,
  sendGdprRequest
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
import { FormattedTextBlock } from '../components/primitives/FormattedTextBlock';
import { LegacyFrameModal } from '../components/primitives/LegacyFrameModal';
import { CandidateAssignJobOrderModal } from '../components/primitives/CandidateAssignJobOrderModal';
import { PipelineDetailsInlineModal } from '../components/primitives/PipelineDetailsInlineModal';
import { PipelineQuickStatusModal } from '../components/primitives/PipelineQuickStatusModal';
import { PipelineRejectionModal } from '../components/primitives/PipelineRejectionModal';
import { PipelineRemoveModal } from '../components/primitives/PipelineRemoveModal';
import { ConfirmActionModal } from '../components/primitives/ConfirmActionModal';
import { MutationToast } from '../components/primitives/MutationToast';
import { ensureModernUIURL } from '../lib/navigation';
import { usePageRefreshEvents } from '../lib/usePageRefreshEvents';
import { InlineModal } from '../ui-core';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type AddToListCompletedDetail = {
  dataItemType?: number | string;
  dataItemIDs?: Array<number | string>;
  listIDs?: Array<number | string>;
};

type TransformJobOrderOption = {
  jobOrderID: number;
  title: string;
  companyName: string;
  isAllocated: boolean;
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

function getDetailFieldClassName(value: unknown, extraClassName = ''): string {
  const classes = ['avel-candidate-detail-field', isDisplayValueEmpty(value) ? 'is-empty' : 'is-filled'];
  const extra = String(extraClassName || '').trim();
  if (extra !== '') {
    classes.push(extra);
  }
  return classes.join(' ');
}

function getGDPRStatusChipClass(status: unknown): string {
  const normalized = normalizeDisplayValue(status).toLowerCase();
  if (
    normalized.includes('sent') ||
    normalized.includes('signed') ||
    normalized.includes('complete') ||
    normalized.includes('approved') ||
    normalized.includes('active')
  ) {
    return 'avel-candidate-gdpr-chip--success';
  }
  if (
    normalized.includes('pending') ||
    normalized.includes('request') ||
    normalized.includes('open') ||
    normalized.includes('in progress') ||
    normalized.includes('process')
  ) {
    return 'avel-candidate-gdpr-chip--pending';
  }
  if (normalized.includes('expire')) {
    return 'avel-candidate-gdpr-chip--warning';
  }
  if (
    normalized.includes('delete') ||
    normalized.includes('fail') ||
    normalized.includes('reject') ||
    normalized.includes('revoke')
  ) {
    return 'avel-candidate-gdpr-chip--danger';
  }
  return 'avel-candidate-gdpr-chip--neutral';
}

function normalizeSearchText(value: string): string {
  return String(value || '').trim().toLowerCase();
}

function matchesTransformJobOrderSearch(jobOrder: { title: string; companyName: string }, query: string): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (normalizedQuery === '') {
    return true;
  }

  return (
    normalizeSearchText(jobOrder.title).includes(normalizedQuery) ||
    normalizeSearchText(jobOrder.companyName).includes(normalizedQuery)
  );
}

function isDocxAttachment(filename: unknown): boolean {
  const normalized = String(filename || '').trim().toLowerCase();
  return normalized.endsWith('.docx');
}

function getAllocatedTransformJobOrders(
  data: CandidatesShowModernDataResponse | null,
  queryRaw: string
): TransformJobOrderOption[] {
  if (!data) {
    return [];
  }

  const query = String(queryRaw || '').trim();
  const allocatedMap = new Map<number, TransformJobOrderOption>();
  data.pipelines.items.forEach((pipelineRow) => {
    const jobOrderID = Number(pipelineRow.jobOrderID || 0);
    if (jobOrderID <= 0 || allocatedMap.has(jobOrderID)) {
      return;
    }
    const option: TransformJobOrderOption = {
      jobOrderID,
      title: toDisplayText(pipelineRow.jobOrderTitle, `Job Order #${jobOrderID}`),
      companyName: toDisplayText(pipelineRow.companyName, ''),
      isAllocated: true
    };
    if (!matchesTransformJobOrderSearch(option, query)) {
      return;
    }
    allocatedMap.set(jobOrderID, option);
  });

  return Array.from(allocatedMap.values());
}

function sleep(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delayMs);
  });
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
    showRefreshClose: boolean;
  } | null>(null);
  const [assignJobModal, setAssignJobModal] = useState<{ url: string } | null>(null);
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
  const [tagEditorOpen, setTagEditorOpen] = useState<boolean>(false);
  const [selectedTagIDs, setSelectedTagIDs] = useState<number[]>([]);
  const [tagSavePending, setTagSavePending] = useState<boolean>(false);
  const [tagSaveError, setTagSaveError] = useState<string>('');
  const [attachmentUploadOpen, setAttachmentUploadOpen] = useState<boolean>(false);
  const [attachmentUploadFile, setAttachmentUploadFile] = useState<File | null>(null);
  const [attachmentUploadIsResume, setAttachmentUploadIsResume] = useState<boolean>(false);
  const [attachmentUploadPending, setAttachmentUploadPending] = useState<boolean>(false);
  const [attachmentUploadError, setAttachmentUploadError] = useState<string>('');
  const [attachmentDeleteModal, setAttachmentDeleteModal] = useState<{
    attachmentID: number;
    fileName: string;
  } | null>(null);
  const [attachmentDeletePending, setAttachmentDeletePending] = useState<boolean>(false);
  const [attachmentDeleteError, setAttachmentDeleteError] = useState<string>('');
  const [googleDrivePendingAttachmentID, setGoogleDrivePendingAttachmentID] = useState<number>(0);
  const [googleDriveDeletePendingAttachmentID, setGoogleDriveDeletePendingAttachmentID] = useState<number>(0);
  const [transformCVModalOpen, setTransformCVModalOpen] = useState<boolean>(false);
  const [transformAttachmentID, setTransformAttachmentID] = useState<number>(0);
  const [transformJobSearch, setTransformJobSearch] = useState<string>('');
  const [transformJobOrderOffset, setTransformJobOrderOffset] = useState<number>(0);
  const [transformJobOrders, setTransformJobOrders] = useState<TransformJobOrderOption[]>([]);
  const [transformJobOrderID, setTransformJobOrderID] = useState<number>(0);
  const [transformJobLoading, setTransformJobLoading] = useState<boolean>(false);
  const [transformJobCanLoadMore, setTransformJobCanLoadMore] = useState<boolean>(false);
  const [transformLanguage, setTransformLanguage] = useState<string>('English');
  const [transformRoleType, setTransformRoleType] = useState<string>('Technical');
  const [transformStoreAttachment, setTransformStoreAttachment] = useState<boolean>(true);
  const [transformAnonymous, setTransformAnonymous] = useState<boolean>(false);
  const [transformPending, setTransformPending] = useState<boolean>(false);
  const [transformStatusInfo, setTransformStatusInfo] = useState<string>('');
  const [transformStatusError, setTransformStatusError] = useState<string>('');
  const [transformDownloadURL, setTransformDownloadURL] = useState<string>('');
  const [transformAnalysisMessage, setTransformAnalysisMessage] = useState<string>('');
  const [toast, setToast] = useState<{ id: number; message: string; tone: 'success' | 'error' | 'info' } | null>(null);
  const [gdprSendPending, setGdprSendPending] = useState<boolean>(false);
  const [gdprSendError, setGdprSendError] = useState<string>('');
  const loadRequestRef = useRef(0);
  const transformRequestIDRef = useRef(0);
  const transformSearchRequestRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    const requestID = loadRequestRef.current + 1;
    loadRequestRef.current = requestID;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchCandidatesShowModernData(bootstrap, query)
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
        setSelectedTagIDs(
          Array.isArray(result.tagManagement?.assignedTagIDs)
            ? result.tagManagement.assignedTagIDs.map((value) => Number(value || 0)).filter((value) => value > 0)
            : []
        );
      })
      .catch((err: Error) => {
        if (!isMounted || requestID !== loadRequestRef.current) {
          return;
        }
        setError(err.message || 'Unable to load candidate profile.');
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

  useEffect(() => {
    if (!data) {
      return;
    }
    const transformRows = data.attachments.transformCandidates || [];
    if (transformRows.length === 0) {
      setTransformAttachmentID(0);
      setTransformCVModalOpen(false);
      return;
    }
    const currentID = Number(transformAttachmentID || 0);
    if (currentID > 0 && transformRows.some((row) => Number(row.attachmentID || 0) === currentID)) {
      return;
    }
    setTransformAttachmentID(Number(transformRows[0].attachmentID || 0));
  }, [data, transformAttachmentID]);

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

  useEffect(() => {
    const handleAddToListCompleted = (rawEvent: Event) => {
      const event = rawEvent as CustomEvent<AddToListCompletedDetail>;
      const candidateID = Number(data?.meta.candidateID || 0);
      if (candidateID <= 0) {
        return;
      }

      const ids = Array.isArray(event.detail?.dataItemIDs)
        ? event.detail.dataItemIDs.map((value) => Number(value || 0))
        : [];
      if (!ids.includes(candidateID)) {
        return;
      }

      refreshPageData();
    };

    window.addEventListener('opencats:add-to-list:completed', handleAddToListCompleted as EventListener);
    return () => {
      window.removeEventListener('opencats:add-to-list:completed', handleAddToListCompleted as EventListener);
    };
  }, [data?.meta.candidateID, refreshPageData]);

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
          showRefreshClose: true
        });
        return;
      }

      const candidateName = toDisplayText(data.candidate.fullName);
      const jobOrderTitle = toDisplayText(pipeline.jobOrderTitle);
      setRemovePipelineError('');
      setRemovePipelineModal({
        title: `Remove From Pipeline: ${jobOrderTitle}`,
        description: `Remove ${candidateName} from ${jobOrderTitle}?`,
        actionURL: decodeLegacyURL(pipeline.actions.removeFromPipelineURL)
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
        showToast('Pipeline history date updated.');
        return null;
      } catch (err: unknown) {
        return err instanceof Error ? err.message : 'Unable to update history date.';
      }
    },
    [reloadPipelineDetailsModal, refreshPageData, showToast]
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
        showToast('Comment saved.');
      } catch (err: unknown) {
        setCommentSubmitError(err instanceof Error ? err.message : 'Unable to save comment.');
      } finally {
        setCommentSubmitPending(false);
      }
    },
    [commentCategory, commentSubmitPending, commentText, data, refreshPageData, showToast]
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
        const result = await deleteCandidateAttachment(deleteURL, {
          candidateID: Number(data.meta.candidateID || 0),
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
      showToast('Attachment uploaded.');
    } catch (err: unknown) {
      setAttachmentUploadError(err instanceof Error ? err.message : 'Unable to upload attachment.');
    } finally {
      setAttachmentUploadPending(false);
    }
  }, [attachmentUploadFile, attachmentUploadIsResume, attachmentUploadPending, data, refreshPageData, showToast]);

  const openGoogleDriveConnectPopup = useCallback((connectURLRaw: string): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      const connectURL = decodeLegacyURL(connectURLRaw);
      if (connectURL === '') {
        resolve({
          success: false,
          message: 'Google Drive connect URL is not available.'
        });
        return;
      }

      const popup = window.open(
        connectURL,
        'opencats-google-drive-connect',
        'popup=yes,width=560,height=720,resizable=yes,scrollbars=yes'
      );
      if (!popup) {
        resolve({
          success: false,
          message: 'Popup blocked. Allow popups for ATS and try again.'
        });
        return;
      }

      try {
        popup.focus();
      } catch (_error) {
        // Best effort.
      }

      const expectedOrigin = String(window.location.origin || '');
      let settled = false;
      let closeWatchTimer = 0;
      let timeoutTimer = 0;
      let onMessage: (event: MessageEvent) => void = () => undefined;

      const cleanup = () => {
        window.removeEventListener('message', onMessage);
        if (closeWatchTimer > 0) {
          window.clearInterval(closeWatchTimer);
        }
        if (timeoutTimer > 0) {
          window.clearTimeout(timeoutTimer);
        }
      };

      const settle = (result: { success: boolean; message: string }) => {
        if (settled) {
          return;
        }
        settled = true;
        cleanup();
        resolve(result);
      };

      onMessage = (event: MessageEvent) => {
        const payload = event.data as { type?: string; success?: boolean; message?: string } | null;
        if (!payload || payload.type !== 'opencats-google-drive-auth') {
          return;
        }

        if (expectedOrigin !== '' && event.origin !== expectedOrigin) {
          return;
        }

        settle({
          success: !!payload.success,
          message: String(payload.message || (payload.success ? 'Google Drive connected.' : 'Google Drive connection failed.'))
        });
      };

      window.addEventListener('message', onMessage);

      closeWatchTimer = window.setInterval(() => {
        if (popup.closed) {
          settle({
            success: false,
            message: 'Google Drive connection window was closed.'
          });
        }
      }, 400);

      timeoutTimer = window.setTimeout(() => {
        settle({
          success: false,
          message: 'Google Drive connection timed out. Please try again.'
        });
      }, 180000);
    });
  }, []);

  const handleSendAttachmentToGoogleDocs = useCallback(
    async (attachment: CandidatesShowModernDataResponse['attachments']['items'][number]) => {
      if (!data || googleDrivePendingAttachmentID > 0 || googleDriveDeletePendingAttachmentID > 0) {
        return;
      }

      const submitURL = decodeLegacyURL(data.actions.googleDriveUploadAttachmentURL || '');
      const securityToken = data.actions.googleDriveUploadAttachmentToken || '';
      if (submitURL === '' || securityToken === '') {
        showToast('Google Drive action is not available for this page.', 'error');
        return;
      }

      const candidateID = Number(data.meta.candidateID || 0);
      const attachmentID = Number(attachment.attachmentID || 0);
      if (candidateID <= 0 || attachmentID <= 0) {
        showToast('Invalid candidate or attachment ID.', 'error');
        return;
      }

      const executeUpload = async () =>
        uploadCandidateAttachmentToGoogleDrive(submitURL, {
          candidateID,
          attachmentID,
          securityToken,
          origin: String(window.location.origin || '')
        });

      setGoogleDrivePendingAttachmentID(attachmentID);
      try {
        let result = await executeUpload();
        if (!result.success && String(result.code || '') === 'googleDriveAuthRequired') {
          const connectURL = decodeLegacyURL(String(result.authURL || data.actions.googleDriveConnectURL || ''));
          const authResult = await openGoogleDriveConnectPopup(connectURL);
          if (!authResult.success) {
            throw new Error(authResult.message || 'Google Drive connection failed.');
          }

          result = await executeUpload();
        }

        if (!result.success) {
          throw new Error(result.message || 'Unable to send attachment to Google Docs.');
        }

        const editURL = decodeLegacyURL(String(result.editURL || ''));
        if (editURL !== '') {
          window.open(editURL, '_blank', 'noopener,noreferrer');
          if (result.reusedExisting) {
            showToast('Opened existing Google Doc (no duplicate created).', 'success');
          } else {
            showToast('Sent to Google Docs. Opened in a new tab.', 'success');
          }
        } else {
          showToast(result.reusedExisting ? 'Opened existing Google Doc.' : 'Sent to Google Docs.', 'success');
        }
        refreshPageData();
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : 'Unable to send attachment to Google Docs.', 'error');
      } finally {
        setGoogleDrivePendingAttachmentID(0);
      }
    },
    [
      data,
      googleDriveDeletePendingAttachmentID,
      googleDrivePendingAttachmentID,
      openGoogleDriveConnectPopup,
      refreshPageData,
      showToast
    ]
  );

  const handleDeleteGoogleDocsFile = useCallback(
    async (attachment: CandidatesShowModernDataResponse['attachments']['items'][number]) => {
      if (!data || googleDrivePendingAttachmentID > 0 || googleDriveDeletePendingAttachmentID > 0) {
        return;
      }

      const submitURL = decodeLegacyURL(data.actions.googleDriveDeleteAttachmentURL || '');
      const securityToken = data.actions.googleDriveDeleteAttachmentToken || '';
      if (submitURL === '' || securityToken === '') {
        showToast('Google Drive delete action is not available for this page.', 'error');
        return;
      }

      const candidateID = Number(data.meta.candidateID || 0);
      const attachmentID = Number(attachment.attachmentID || 0);
      if (candidateID <= 0 || attachmentID <= 0) {
        showToast('Invalid candidate or attachment ID.', 'error');
        return;
      }

      const confirmed = window.confirm(
        `Delete the linked Google Docs file for "${toDisplayText(attachment.fileName, 'this attachment')}"?`
      );
      if (!confirmed) {
        return;
      }

      const executeDelete = async () =>
        deleteCandidateGoogleDriveAttachmentFile(submitURL, {
          candidateID,
          attachmentID,
          securityToken,
          origin: String(window.location.origin || '')
        });

      setGoogleDriveDeletePendingAttachmentID(attachmentID);
      try {
        let result = await executeDelete();
        if (!result.success && String(result.code || '') === 'googleDriveAuthRequired') {
          const connectURL = decodeLegacyURL(String(result.authURL || data.actions.googleDriveConnectURL || ''));
          const authResult = await openGoogleDriveConnectPopup(connectURL);
          if (!authResult.success) {
            throw new Error(authResult.message || 'Google Drive connection failed.');
          }

          result = await executeDelete();
        }

        if (!result.success) {
          throw new Error(result.message || 'Unable to delete Google Docs file.');
        }

        showToast('Google Docs file deleted.', 'success');
        refreshPageData();
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : 'Unable to delete Google Docs file.', 'error');
      } finally {
        setGoogleDriveDeletePendingAttachmentID(0);
      }
    },
    [
      data,
      googleDriveDeletePendingAttachmentID,
      googleDrivePendingAttachmentID,
      openGoogleDriveConnectPopup,
      refreshPageData,
      showToast
    ]
  );

  const handleGdprSend = useCallback(async () => {
    if (!data || gdprSendPending) {
      return;
    }

    const sendURL = String(data.actions.gdprSendURL || '').trim();
    if (sendURL === '') {
      setGdprSendError('Send GDPR request action is not available.');
      return;
    }

    const candidateID = Number(data.meta.candidateID || 0);
    if (candidateID <= 0) {
      setGdprSendError('Invalid candidate ID.');
      return;
    }

    const confirmed = window.confirm('Send a GDPR consent request email to this candidate now?');
    if (!confirmed) {
      return;
    }

    setGdprSendPending(true);
    setGdprSendError('');
    try {
      const result = await sendGdprRequest(sendURL, candidateID);
      if (result.success) {
        showToast('GDPR request sent successfully.', 'success');
        refreshPageData();
      } else {
        setGdprSendError(String(result.message || 'Failed to send GDPR request.'));
      }
    } catch (err) {
      setGdprSendError(err instanceof Error ? err.message : 'Failed to send GDPR request.');
    } finally {
      setGdprSendPending(false);
    }
  }, [data, gdprSendPending, refreshPageData, showToast]);

  const closeTransformCVModal = useCallback(() => {
    transformRequestIDRef.current += 1;
    transformSearchRequestRef.current += 1;
    setTransformCVModalOpen(false);
    setTransformPending(false);
    setTransformJobLoading(false);
    setTransformStatusInfo('');
    setTransformStatusError('');
    setTransformDownloadURL('');
    setTransformAnalysisMessage('');
  }, []);

  const loadTransformJobOrders = useCallback(async (queryRaw: string, offset: number, append: boolean) => {
    const requestID = transformSearchRequestRef.current + 1;
    transformSearchRequestRef.current = requestID;
    setTransformJobLoading(true);
    setTransformStatusError('');

    try {
      const query = String(queryRaw || '').trim();
      const result = await searchJobOrdersForTransform(query, 50, Math.max(0, Number(offset || 0)));
      if (requestID !== transformSearchRequestRef.current) {
        return;
      }
      const allocatedOptions = getAllocatedTransformJobOrders(data, query);
      const allocatedIDs = new Set<number>(allocatedOptions.map((row) => row.jobOrderID));
      const fetchedOptions: TransformJobOrderOption[] = result.jobOrders.map((row) => ({
        jobOrderID: Number(row.jobOrderID || 0),
        title: toDisplayText(row.title, `Job Order #${row.jobOrderID}`),
        companyName: toDisplayText(row.companyName, ''),
        isAllocated: allocatedIDs.has(Number(row.jobOrderID || 0))
      }));

      setTransformJobOrders((current) => {
        if (!append) {
          const merged = [...allocatedOptions];
          const seen = new Set<number>(allocatedOptions.map((row) => row.jobOrderID));
          fetchedOptions.forEach((row) => {
            if (row.jobOrderID <= 0 || seen.has(row.jobOrderID)) {
              return;
            }
            seen.add(row.jobOrderID);
            merged.push(row);
          });
          return merged;
        }

        const merged = [...current];
        const seen = new Set<number>(current.map((row) => row.jobOrderID));
        fetchedOptions.forEach((row) => {
          if (row.jobOrderID <= 0 || seen.has(row.jobOrderID)) {
            return;
          }
          seen.add(row.jobOrderID);
          merged.push(row);
        });
        return merged;
      });
      setTransformJobOrderOffset(Math.max(0, Number(offset || 0)));
      setTransformJobCanLoadMore(query === '' && result.jobOrders.length >= 50);
    } catch (err: unknown) {
      if (requestID !== transformSearchRequestRef.current) {
        return;
      }
      setTransformStatusError(err instanceof Error ? err.message : 'Unable to load job orders.');
      if (!append) {
        const query = String(queryRaw || '').trim();
        setTransformJobOrders(getAllocatedTransformJobOrders(data, query));
        setTransformJobOrderOffset(0);
        setTransformJobCanLoadMore(false);
      }
    } finally {
      if (requestID === transformSearchRequestRef.current) {
        setTransformJobLoading(false);
      }
    }
  }, [data]);

  useEffect(() => {
    if (!transformCVModalOpen || !data) {
      return;
    }

    transformRequestIDRef.current += 1;
    transformSearchRequestRef.current += 1;
    setTransformJobSearch('');
    setTransformJobOrderOffset(0);
    setTransformJobOrders([]);
    setTransformJobOrderID(0);
    setTransformJobCanLoadMore(false);
    setTransformLanguage('English');
    setTransformRoleType('Technical');
    setTransformStoreAttachment(true);
    setTransformAnonymous(false);
    setTransformPending(false);
    setTransformStatusInfo('');
    setTransformStatusError('');
    setTransformDownloadURL('');
    setTransformAnalysisMessage('');
  }, [data, transformCVModalOpen]);

  useEffect(() => {
    if (!transformCVModalOpen || !data) {
      return;
    }

    const timerID = window.setTimeout(() => {
      void loadTransformJobOrders(transformJobSearch, 0, false);
    }, 300);

    return () => {
      window.clearTimeout(timerID);
    };
  }, [data, loadTransformJobOrders, transformCVModalOpen, transformJobSearch]);

  useEffect(() => {
    if (!transformCVModalOpen) {
      return;
    }
    if (transformJobOrders.length === 0) {
      setTransformJobOrderID(0);
      return;
    }
    if (transformJobOrderID > 0 && transformJobOrders.some((row) => Number(row.jobOrderID) === transformJobOrderID)) {
      return;
    }
    setTransformJobOrderID(Number(transformJobOrders[0].jobOrderID || 0));
  }, [transformCVModalOpen, transformJobOrderID, transformJobOrders]);

  const loadNextTransformJobOrders = useCallback(() => {
    if (transformJobLoading || transformPending) {
      return;
    }
    const query = String(transformJobSearch || '').trim();
    if (query !== '') {
      return;
    }
    const nextOffset = transformJobOrderOffset + 50;
    void loadTransformJobOrders('', nextOffset, true);
  }, [loadTransformJobOrders, transformJobLoading, transformJobOrderOffset, transformJobSearch, transformPending]);

  const submitTransformCV = useCallback(async () => {
    if (!data || transformPending) {
      return;
    }

    const candidateID = Number(data.meta.candidateID || 0);
    const attachmentID = Number(transformAttachmentID || 0);
    const jobOrderID = Number(transformJobOrderID || 0);

    if (candidateID <= 0) {
      setTransformStatusError('Invalid candidate ID.');
      return;
    }
    if (attachmentID <= 0) {
      setTransformStatusError('Select a CV attachment.');
      return;
    }
    if (jobOrderID <= 0) {
      setTransformStatusError('Select a job order.');
      return;
    }

    const requestID = transformRequestIDRef.current + 1;
    transformRequestIDRef.current = requestID;
    setTransformPending(true);
    setTransformStatusError('');
    setTransformStatusInfo('Submitting transform request...');
    setTransformDownloadURL('');
    setTransformAnalysisMessage('');

    try {
      const createResult = await createTalentFitFlowTransformJob({
        candidateID,
        attachmentID,
        jobOrderID,
        language: transformLanguage,
        roleType: transformRoleType,
        anonymous: transformAnonymous
      });
      if (requestID !== transformRequestIDRef.current) {
        return;
      }

      let latestStatus = String(createResult.status || '').toUpperCase();
      let statusResult = {
        status: createResult.status,
        cvDownloadURL: '',
        analysisPdfState: '',
        analysisPdfAttached: false,
        analysisPdfRetryAfter: '',
        errorCodeText: '',
        errorMessageText: ''
      };
      setTransformStatusInfo(`Status: ${latestStatus || 'PENDING'}`);

      while (
        requestID === transformRequestIDRef.current &&
        (latestStatus === '' || latestStatus === 'PENDING' || latestStatus === 'RUNNING' || latestStatus === 'QUEUED')
      ) {
        await sleep(7000);
        if (requestID !== transformRequestIDRef.current) {
          return;
        }
        statusResult = await fetchTalentFitFlowTransformStatus({
          jobID: createResult.jobID,
          candidateID,
          jobOrderID,
          anonymous: transformAnonymous
        });
        if (requestID !== transformRequestIDRef.current) {
          return;
        }
        latestStatus = String(statusResult.status || '').toUpperCase();
        setTransformStatusInfo(`Status: ${latestStatus || 'UNKNOWN'}`);
      }

      if (requestID !== transformRequestIDRef.current) {
        return;
      }

      if (latestStatus !== 'COMPLETED') {
        const failureMessage =
          statusResult.errorMessageText ||
          statusResult.errorCodeText ||
          `Transform failed with status "${latestStatus || 'UNKNOWN'}".`;
        throw new Error(failureMessage);
      }

      let analysisMessage = '';
      const analysisState = String(statusResult.analysisPdfState || '').toUpperCase();
      if (analysisState === 'PENDING') {
        analysisMessage = 'Analysis report generating...';
      } else if (analysisState === 'FAILED') {
        analysisMessage = 'Analysis report failed.';
      } else if (analysisState === 'READY') {
        analysisMessage = statusResult.analysisPdfAttached ? 'Analysis PDF attached.' : 'Analysis PDF ready.';
      }

      if (transformStoreAttachment) {
        setTransformStatusInfo('Saving attachment...');
        const storeResult = await storeTalentFitFlowTransformedAttachment({
          candidateID,
          attachmentID,
          jobOrderID,
          jobID: createResult.jobID,
          anonymous: transformAnonymous
        });
        if (requestID !== transformRequestIDRef.current) {
          return;
        }
        setTransformStatusInfo(
          storeResult.attachmentFilename !== ''
            ? `Attachment saved as ${storeResult.attachmentFilename}.`
            : 'Attachment saved.'
        );
        setTransformDownloadURL(statusResult.cvDownloadURL);
        setTransformAnalysisMessage(analysisMessage);
        refreshPageData();
        showToast('Transform completed and saved as attachment.');
        closeTransformCVModal();
        return;
      }

      setTransformDownloadURL(statusResult.cvDownloadURL);
      setTransformAnalysisMessage(analysisMessage);
      setTransformStatusInfo(statusResult.cvDownloadURL !== '' ? 'Transform completed. Download is ready.' : 'Transform completed.');
    } catch (err: unknown) {
      if (requestID !== transformRequestIDRef.current) {
        return;
      }
      setTransformStatusError(err instanceof Error ? err.message : 'Transform request failed.');
      setTransformStatusInfo('');
    } finally {
      if (requestID === transformRequestIDRef.current) {
        setTransformPending(false);
      }
    }
  }, [
    closeTransformCVModal,
    data,
    refreshPageData,
    showToast,
    transformAttachmentID,
    transformAnonymous,
    transformJobOrderID,
    transformLanguage,
    transformPending,
    transformRoleType,
    transformStoreAttachment
  ]);

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
      showToast('Tags updated.');
    } catch (err: unknown) {
      setTagSaveError(err instanceof Error ? err.message : 'Unable to update tags.');
    } finally {
      setTagSavePending(false);
    }
  }, [data, refreshPageData, selectedTagIDs, showToast, tagSavePending]);

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
  const tagCatalog = [...(data.tagManagement?.catalog || [])].sort((left, right) =>
    toDisplayText(left.title, '').localeCompare(toDisplayText(right.title, ''))
  );
  const googleDriveAccountEmail = String(data.actions.googleDriveAccountEmail || '').trim();
  const googleDriveLinkMode = String(data.actions.googleDriveLinkMode || '').trim().toLowerCase();
  const googleDriveUsesSharedLink = googleDriveLinkMode === 'shared';

  return (
    <div className="avel-dashboard-page avel-candidate-show-page">
      <PageContainer
        title={toDisplayText(candidate.fullName, 'Candidate')}
        subtitle={`Candidate profile #${candidate.candidateID}`}
        actions={
          <>
            {permissions.canEditCandidate ? (
              <a className="modern-btn modern-btn--emphasis" href={ensureModernUIURL(decodeLegacyURL(data.actions.editURL))}>
                Edit Candidate
              </a>
            ) : null}
            {permissions.canAddToJobOrder ? (
              <button
                type="button"
                className="modern-btn modern-btn--emphasis"
                onClick={() =>
                  setAssignJobModal({
                    url: decodeLegacyURL(data.actions.addToJobOrderURL)
                  })
                }
              >
                Add To Job Order
              </button>
            ) : null}
            {permissions.canDeleteCandidate ? (
              <a
                className="modern-btn modern-btn--danger"
                href={ensureModernUIURL(decodeLegacyURL(data.actions.deleteURL))}
              >
                Delete Candidate
              </a>
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
                  <a className="modern-link avel-candidate-hero__meta-item avel-candidate-hero__meta-item--email" href={`mailto:${candidate.email1}`}>
                    {toDisplayText(candidate.email1)}
                  </a>
                ) : (
                  <span className="avel-candidate-hero__meta-item">{toDisplayText(candidate.email1)}</span>
                )}
                <span className="avel-candidate-hero__meta-item">{toDisplayText(candidate.phoneCell)}</span>
                <span className="avel-candidate-hero__meta-item">{`${toDisplayText(candidate.city)}, ${toDisplayText(candidate.country)}`}</span>
                <span className="avel-candidate-hero__meta-item avel-candidate-hero__meta-item--owner">Owner: {toDisplayText(candidate.owner)}</span>
                <span className="avel-candidate-hero__meta-item avel-candidate-hero__meta-item--source">Source: {toDisplayText(candidate.source)}</span>
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

          <div className="avel-candidate-grid avel-candidate-grid--summary">
            <section className="avel-list-panel avel-candidate-panel avel-candidate-panel--profile">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Details</h2>
                <p className="avel-list-panel__hint">Core profile data and custom fields.</p>
              </div>
              <div className="avel-candidate-details avel-candidate-details--profile">
                <div className={getDetailFieldClassName(candidate.currentEmployer)}><strong>Current Employer:</strong> {toDisplayText(candidate.currentEmployer)}</div>
                <div className={getDetailFieldClassName(candidate.dateAvailable)}><strong>Date Available:</strong> {toDisplayText(candidate.dateAvailable)}</div>
                <div className={getDetailFieldClassName(candidate.bestTimeToCall)}><strong>Best Time To Call:</strong> {toDisplayText(candidate.bestTimeToCall)}</div>
                <div className={getDetailFieldClassName(candidate.canRelocate)}><strong>Can Relocate:</strong> {toDisplayText(candidate.canRelocate)}</div>
                <div className={getDetailFieldClassName(candidate.currentPay)}><strong>Current Pay:</strong> {toDisplayText(candidate.currentPay)}</div>
                <div className={getDetailFieldClassName(candidate.desiredPay)}><strong>Desired Pay:</strong> {toDisplayText(candidate.desiredPay)}</div>
                <div className={getDetailFieldClassName(candidate.dateCreated)}><strong>Created:</strong> {toDisplayText(candidate.dateCreated)} ({toDisplayText(candidate.enteredBy)})</div>
                <div className={getDetailFieldClassName(candidate.dateModified)}><strong>Modified:</strong> {toDisplayText(candidate.dateModified)}</div>
                <div className={getDetailFieldClassName(candidate.address)}><strong>Address:</strong> {toDisplayText(candidate.address)}</div>
                <div className={getDetailFieldClassName(candidate.keySkills, 'avel-candidate-details__full avel-candidate-details__full--skills')}>
                  <strong>Key Skills:</strong> {toDisplayText(candidate.keySkills)}
                </div>
                {data.extraFields.map((field) => (
                  <div
                    key={field.fieldName}
                    className={getDetailFieldClassName(
                      field.display,
                      String(field.fieldName || '').toLowerCase().includes('key skill')
                        ? 'avel-candidate-details__full avel-candidate-details__full--skills'
                        : ''
                    )}
                  >
                    <strong>{toDisplayText(field.fieldName)}:</strong> {toDisplayText(field.display)}
                  </div>
                ))}
              </div>
            </section>

            <section className="avel-list-panel avel-candidate-panel avel-candidate-panel--gdpr">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">GDPR</h2>
                <div className="avel-list-panel__hint avel-candidate-gdpr-hint">
                  <span>Latest status:</span>
                  <span className={`modern-chip avel-candidate-gdpr-chip ${getGDPRStatusChipClass(gdpr.latestRequest.status)}`}>
                    {toDisplayText(gdpr.latestRequest.status)}
                  </span>
                  {gdpr.sendEnabled ? (
                    <button
                      type="button"
                      className="modern-btn modern-btn--sm modern-btn--primary"
                      onClick={handleGdprSend}
                      disabled={gdprSendPending || gdpr.sendDisabled}
                      title={gdpr.sendDisabled && gdpr.sendDisabledReason !== '' ? gdpr.sendDisabledReason : 'Send GDPR consent request to this candidate'}
                    >
                      {gdprSendPending ? 'Sending...' : 'Send GDPR Request'}
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="avel-candidate-details avel-candidate-details--gdpr">
                <div className={getDetailFieldClassName(gdpr.latestRequest.createdAt)}><strong>Request Created:</strong> {toDisplayText(gdpr.latestRequest.createdAt)}</div>
                <div className={getDetailFieldClassName(gdpr.latestRequest.emailSentAt)}><strong>Email Sent:</strong> {toDisplayText(gdpr.latestRequest.emailSentAt)}</div>
                <div className={getDetailFieldClassName(gdpr.latestRequest.acceptedAt)}><strong>Accepted At:</strong> {toDisplayText(gdpr.latestRequest.acceptedAt)}</div>
                <div className={getDetailFieldClassName(gdpr.expirationDate)}><strong>GDPR Expires:</strong> {toDisplayText(gdpr.expirationDate)}</div>
                <div className={getDetailFieldClassName(gdpr.latestRequest.expiresAt)}><strong>Link Expires:</strong> {toDisplayText(gdpr.latestRequest.expiresAt)}</div>
                <div className={getDetailFieldClassName(gdpr.latestRequest.deletedAt)}><strong>Deleted At:</strong> {toDisplayText(gdpr.latestRequest.deletedAt)}</div>
                {gdpr.sendDisabledReason !== '' ? (
                  <div className={getDetailFieldClassName(gdpr.sendDisabledReason, 'avel-candidate-details__full')}>
                    <strong>Send Disabled:</strong> {gdpr.sendDisabledReason}
                  </div>
                ) : null}
                {gdprSendError !== '' ? (
                  <div className="avel-candidate-details__full modern-inline-error">
                    {gdprSendError}
                  </div>
                ) : null}
                {gdpr.legacyProof.link !== '' ? (
                  <div className={getDetailFieldClassName(gdpr.legacyProof.fileName, 'avel-candidate-details__full')}>
                    <strong>Legacy Proof:</strong>{' '}
                    <a className="modern-link" href={decodeLegacyURL(gdpr.legacyProof.link)} target="_blank" rel="noreferrer">
                      {toDisplayText(gdpr.legacyProof.fileName, 'View file')}
                    </a>
                  </div>
                ) : null}
                {gdpr.flashMessage !== '' ? (
                  <div className={getDetailFieldClassName(gdpr.flashMessage, 'avel-candidate-details__full')}>
                    <strong>Info:</strong> {gdpr.flashMessage}
                  </div>
                ) : null}
              </div>
            </section>
          </div>

          {data.eeoValues.length > 0 ? (
            <section className="avel-list-panel avel-candidate-panel avel-candidate-panel--eeo">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">EEO Information</h2>
                <p className="avel-list-panel__hint">Compliance-related candidate attributes.</p>
              </div>
              <div className="avel-candidate-details avel-candidate-details--eeo">
                {data.eeoValues.map((item) => (
                  <div key={item.fieldName}>
                    <strong>{toDisplayText(item.fieldName)}:</strong> {toDisplayText(item.fieldValue)}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="avel-list-panel avel-candidate-panel avel-candidate-panel--notes">
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
              <FormattedTextBlock text={toDisplayText(candidate.notesText, '')} emptyMessage="No notes provided." />
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

          <section className="avel-list-panel avel-candidate-panel avel-candidate-panel--messages">
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
          </section>

          <section className="avel-list-panel avel-candidate-panel avel-candidate-panel--pipelines">
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

          <div className="avel-candidate-grid avel-candidate-grid--assets">
            <section className="avel-list-panel avel-candidate-panel avel-candidate-panel--attachments">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Attachments</h2>
                <div className="modern-table-actions">
                  {data.attachments.transformCandidates.length > 0 ? (
                    <button
                      type="button"
                      className="modern-btn modern-btn--mini modern-btn--emphasis"
                      onClick={() => setTransformCVModalOpen(true)}
                    >
                      Transform CV
                    </button>
                  ) : null}
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
              <p className="avel-list-panel__hint">
                {googleDriveUsesSharedLink
                  ? (googleDriveAccountEmail !== ''
                      ? `Google Docs links are shared across users through the configured shared drive. Connected Google account: ${googleDriveAccountEmail}.`
                      : 'Google Docs links are shared across users through the configured shared drive once you connect a Google account with access.')
                  : (googleDriveAccountEmail !== ''
                      ? `Google Docs links are per-user. Connected Google account: ${googleDriveAccountEmail}.`
                      : 'Google Docs links are per-user and map only to your connected Google account.')}
              </p>
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
                      {(() => {
                        const canOpenInGoogleDocs =
                          isDocxAttachment(attachment.fileName) &&
                          !!data.actions.googleDriveUploadAttachmentURL &&
                          !!data.actions.googleDriveUploadAttachmentToken;
                        const hasLinkedGoogleDoc = !!attachment.googleDriveLinked;
                        return (
                          <>
                            <a className="modern-link" href={decodeLegacyURL(attachment.retrievalURL)} target="_blank" rel="noreferrer">
                              {toDisplayText(attachment.fileName)}
                            </a>
                            {canOpenInGoogleDocs ? (
                              <span className="modern-chip modern-chip--info" style={{ marginLeft: 8 }}>
                                {hasLinkedGoogleDoc
                                  ? (googleDriveUsesSharedLink ? 'Linked in shared Google Docs' : 'Linked in Google Docs')
                                  : (googleDriveUsesSharedLink ? 'Not linked in shared Google Docs' : 'Not linked in Google Docs')}
                              </span>
                            ) : null}
                          </>
                        );
                      })()}
                    </td>
                    <td>{toDisplayText(attachment.dateCreated)}</td>
                    <td>
                      <div className="modern-table-actions">
                        {isDocxAttachment(attachment.fileName) &&
                        data.actions.googleDriveUploadAttachmentURL &&
                        data.actions.googleDriveUploadAttachmentToken ? (
                          <button
                            type="button"
                            className="modern-btn modern-btn--mini modern-btn--emphasis"
                            onClick={() => void handleSendAttachmentToGoogleDocs(attachment)}
                            disabled={
                              attachmentDeletePending ||
                              (googleDrivePendingAttachmentID > 0 && googleDrivePendingAttachmentID !== attachment.attachmentID) ||
                              (googleDriveDeletePendingAttachmentID > 0 && googleDriveDeletePendingAttachmentID !== attachment.attachmentID)
                            }
                          >
                            {googleDrivePendingAttachmentID === attachment.attachmentID ? 'Opening...' : 'Open in Google Docs'}
                          </button>
                        ) : null}
                        {attachment.googleDriveLinked &&
                        data.actions.googleDriveDeleteAttachmentURL &&
                        data.actions.googleDriveDeleteAttachmentToken ? (
                          <button
                            type="button"
                            className="modern-btn modern-btn--mini modern-btn--google-delete"
                            onClick={() => void handleDeleteGoogleDocsFile(attachment)}
                            disabled={
                              attachmentDeletePending ||
                              (googleDrivePendingAttachmentID > 0 && googleDrivePendingAttachmentID !== attachment.attachmentID) ||
                              (googleDriveDeletePendingAttachmentID > 0 && googleDriveDeletePendingAttachmentID !== attachment.attachmentID)
                            }
                          >
                            {googleDriveDeletePendingAttachmentID === attachment.attachmentID
                              ? 'Deleting...'
                              : (googleDriveUsesSharedLink ? 'Delete shared Google Doc' : 'Delete from Google')}
                          </button>
                        ) : null}
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
            </section>

            <section className="avel-list-panel avel-candidate-panel avel-candidate-panel--tags">
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

          <div className="avel-candidate-grid avel-candidate-grid--secondary">
            <section className="avel-list-panel avel-candidate-panel avel-candidate-panel--events">
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

            <section className="avel-list-panel avel-candidate-panel avel-candidate-panel--questionnaires">
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
          <InlineModal
            isOpen={tagEditorOpen}
            ariaLabel="Manage Tags"
            dialogClassName="modern-inline-modal__dialog--compact"
            closeOnBackdrop={!tagSavePending}
            closeOnEscape={!tagSavePending}
            onClose={() => {
              if (tagSavePending) {
                return;
              }
              setTagEditorOpen(false);
              setTagSaveError('');
            }}
          >
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
          </InlineModal>
        ) : null}

        {transformCVModalOpen && data ? (
          <InlineModal
            isOpen={transformCVModalOpen}
            ariaLabel="Transform CV"
            dialogClassName="modern-inline-modal__dialog--compact"
            closeOnBackdrop={!transformPending}
            closeOnEscape={!transformPending}
            onClose={() => {
              if (transformPending) {
                return;
              }
              closeTransformCVModal();
            }}
          >
            <div className="modern-inline-modal__header">
              <h3>Transform CV</h3>
              <p>Generate a transformed CV and optional analysis report for a selected job order.</p>
            </div>
            <div className="modern-inline-modal__body modern-inline-modal__body--form">
              <label className="modern-command-field">
                <span className="modern-command-label">CV Attachment</span>
                <select
                  className="avel-form-control"
                  value={String(transformAttachmentID || '')}
                  onChange={(event) => setTransformAttachmentID(Number(event.target.value || 0))}
                  disabled={transformPending}
                >
                  {data.attachments.transformCandidates.map((item) => (
                    <option key={`transform-attachment-${item.attachmentID}`} value={String(item.attachmentID)}>
                      {toDisplayText(item.originalFilename, `Attachment #${item.attachmentID}`)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="modern-command-field">
                <span className="modern-command-label">Job Order Search</span>
                <input
                  className="avel-form-control"
                  type="text"
                  value={transformJobSearch}
                  onChange={(event) => setTransformJobSearch(event.target.value)}
                  placeholder="Search job orders"
                  disabled={transformPending}
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '8px', alignItems: 'end' }}>
                <label className="modern-command-field" style={{ marginBottom: 0 }}>
                  <span className="modern-command-label">Job Order</span>
                  <select
                    className="avel-form-control"
                    value={transformJobOrderID > 0 ? String(transformJobOrderID) : ''}
                    onChange={(event) => setTransformJobOrderID(Number(event.target.value || 0))}
                    disabled={transformPending || transformJobLoading}
                  >
                    {transformJobOrders.length === 0 ? (
                      <option value="">
                        {transformJobLoading ? 'Loading job orders...' : 'No job orders found'}
                      </option>
                    ) : null}
                    {transformJobOrders.map((row) => (
                      <option key={`transform-joborder-${row.jobOrderID}`} value={String(row.jobOrderID)}>
                        {row.isAllocated ? '[Allocated] ' : ''}
                        {row.title}
                        {row.companyName !== '' ? ` (${row.companyName})` : ''}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className="modern-btn modern-btn--mini modern-btn--secondary"
                  onClick={loadNextTransformJobOrders}
                  disabled={
                    transformPending ||
                    transformJobLoading ||
                    String(transformJobSearch || '').trim() !== '' ||
                    !transformJobCanLoadMore
                  }
                >
                  Next 50
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
                <label className="modern-command-field" style={{ marginBottom: 0 }}>
                  <span className="modern-command-label">Language</span>
                  <input
                    className="avel-form-control"
                    type="text"
                    value={transformLanguage}
                    onChange={(event) => setTransformLanguage(event.target.value)}
                    disabled={transformPending}
                  />
                </label>
                <label className="modern-command-field" style={{ marginBottom: 0 }}>
                  <span className="modern-command-label">Role Type</span>
                  <input
                    className="avel-form-control"
                    type="text"
                    value={transformRoleType}
                    onChange={(event) => setTransformRoleType(event.target.value)}
                    disabled={transformPending}
                  />
                </label>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                <label className="modern-command-toggle" style={{ marginBottom: 0 }}>
                  <input
                    type="checkbox"
                    checked={transformStoreAttachment}
                    onChange={(event) => setTransformStoreAttachment(event.target.checked)}
                    disabled={transformPending}
                  />
                  <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                  <span>Download and store as attachment</span>
                </label>
                <label className="modern-command-toggle" style={{ marginBottom: 0 }}>
                  <input
                    type="checkbox"
                    checked={transformAnonymous}
                    onChange={(event) => setTransformAnonymous(event.target.checked)}
                    disabled={transformPending}
                  />
                  <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                  <span>Anonymous</span>
                </label>
              </div>

              {transformStatusError !== '' ? <div className="modern-state modern-state--error">{transformStatusError}</div> : null}
              {transformStatusInfo !== '' ? <div className="modern-state">{transformStatusInfo}</div> : null}
              {transformDownloadURL !== '' ? (
                <div className="modern-state">
                  Download available:{' '}
                  <a className="modern-link" href={decodeLegacyURL(transformDownloadURL)} target="_blank" rel="noreferrer">
                    Download CV
                  </a>
                </div>
              ) : null}
              {transformAnalysisMessage !== '' ? <div className="modern-state">{transformAnalysisMessage}</div> : null}
            </div>
            <div className="modern-inline-modal__actions">
              <button
                type="button"
                className="modern-btn modern-btn--emphasis"
                onClick={submitTransformCV}
                disabled={transformPending || Number(transformAttachmentID || 0) <= 0 || Number(transformJobOrderID || 0) <= 0}
              >
                {transformPending ? 'Processing...' : 'Submit'}
              </button>
              <button
                type="button"
                className="modern-btn modern-btn--secondary"
                onClick={closeTransformCVModal}
                disabled={transformPending}
              >
                Cancel
              </button>
            </div>
          </InlineModal>
        ) : null}

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

        <CandidateAssignJobOrderModal
          isOpen={!!assignJobModal}
          bootstrap={bootstrap}
          sourceURL={assignJobModal?.url || ''}
          onClose={() => setAssignJobModal(null)}
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
