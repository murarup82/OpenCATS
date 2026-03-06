import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createTalentFitFlowCandidateParseJob,
  deleteCandidateAttachment,
  fetchCandidatesEditModernData,
  fetchTalentFitFlowCandidateParseStatus,
  uploadCandidateAttachment
} from '../lib/api';
import type { CandidatesEditModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { DataTable } from '../components/primitives/DataTable';
import { MarkdownTextarea } from '../components/primitives/MarkdownTextarea';
import { ConfirmActionModal } from '../components/primitives/ConfirmActionModal';
import { LegacyFrameModal } from '../components/primitives/LegacyFrameModal';
import { SelectMenu } from '../ui-core';
import type { SelectMenuOption } from '../ui-core';
import { usePageRefreshEvents } from '../lib/usePageRefreshEvents';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type CandidateExtraField = CandidatesEditModernDataResponse['extraFields'][number];

type CandidateEditFormState = {
  isActive: boolean;
  firstName: string;
  lastName: string;
  email1: string;
  phoneCell: string;
  address: string;
  city: string;
  country: string;
  bestTimeToCall: string;
  dateAvailable: string;
  gdprSigned: '0' | '1';
  gdprExpirationDate: string;
  isHot: boolean;
  source: string;
  owner: string;
  keySkills: string;
  currentEmployer: string;
  currentPay: string;
  desiredPay: string;
  notes: string;
  canRelocate: boolean;
  gender: string;
  race: string;
  veteran: string;
  disability: string;
  extraFields: Record<string, string>;
};

type CandidateTrackedFieldKey =
  | 'firstName'
  | 'lastName'
  | 'email1'
  | 'phoneCell'
  | 'address'
  | 'city'
  | 'country'
  | 'keySkills'
  | 'currentEmployer'
  | 'notes';

type CandidateFieldSource = 'ai-prefill';

const TRACKED_FIELD_KEYS: CandidateTrackedFieldKey[] = [
  'firstName',
  'lastName',
  'email1',
  'phoneCell',
  'address',
  'city',
  'country',
  'keySkills',
  'currentEmployer',
  'notes'
];

function toFormState(data: CandidatesEditModernDataResponse): CandidateEditFormState {
  const extraFields: Record<string, string> = {};
  data.extraFields.forEach((field) => {
    extraFields[field.postKey] = field.value || (field.inputType === 'checkbox' ? 'No' : '');
  });

  return {
    isActive: !!data.candidate.isActive,
    firstName: data.candidate.firstName || '',
    lastName: data.candidate.lastName || '',
    email1: data.candidate.email1 || '',
    phoneCell: data.candidate.phoneCell || '',
    address: data.candidate.address || '',
    city: data.candidate.city || '',
    country: data.candidate.country || '',
    bestTimeToCall: data.candidate.bestTimeToCall || '',
    dateAvailable: data.candidate.dateAvailable || '',
    gdprSigned: data.candidate.gdprSigned ? '1' : '0',
    gdprExpirationDate: data.candidate.gdprExpirationDate || '',
    isHot: !!data.candidate.isHot,
    source: data.candidate.source || '(none)',
    owner: data.candidate.owner || '-1',
    keySkills: data.candidate.keySkills || '',
    currentEmployer: data.candidate.currentEmployer || '',
    currentPay: data.candidate.currentPay || '',
    desiredPay: data.candidate.desiredPay || '',
    notes: data.candidate.notes || '',
    canRelocate: !!data.candidate.canRelocate,
    gender: data.candidate.gender || '',
    race: data.candidate.race || '',
    veteran: data.candidate.veteran || '',
    disability: data.candidate.disability || '',
    extraFields
  };
}

function decodeLegacyURL(url: string): string {
  return String(url || '').replace(/&amp;/g, '&');
}

function readAutoAIPrefillAttachmentIDFromURL(): number {
  const query = new URLSearchParams(window.location.search);
  const shouldAuto = String(query.get('autoAIPrefill') || '').trim().toLowerCase();
  if (shouldAuto !== '1' && shouldAuto !== 'true' && shouldAuto !== 'yes') {
    return 0;
  }
  const attachmentID = Number(query.get('aiAttachmentID') || 0);
  return Number.isFinite(attachmentID) && attachmentID > 0 ? attachmentID : 0;
}

function toDisplayText(value: unknown, fallback = '--'): string {
  const text = String(value ?? '').trim();
  return text === '' ? fallback : text;
}

function parseSourceCSV(csv: string): string[] {
  return String(csv || '')
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item !== '');
}

function serializeSourceCSV(values: string[]): string {
  const seen = new Set<string>();
  const normalized: string[] = [];
  values.forEach((value) => {
    const trimmed = String(value || '').trim();
    if (trimmed === '') {
      return;
    }
    const key = trimmed.toLowerCase();
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    normalized.push(trimmed);
  });
  return normalized.join(',');
}

function toISODateInput(value: string): string {
  const raw = String(value || '').trim();
  const match = /^(\d{2})-(\d{2})-(\d{2})$/.exec(raw);
  if (!match) {
    return '';
  }
  const month = Number(match[1]);
  const day = Number(match[2]);
  const shortYear = Number(match[3]);
  if (!Number.isFinite(month) || !Number.isFinite(day) || !Number.isFinite(shortYear)) {
    return '';
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return '';
  }
  const year = shortYear >= 70 ? 1900 + shortYear : 2000 + shortYear;
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function toLegacyShortDate(isoDate: string): string {
  const raw = String(isoDate || '').trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!match) {
    return '';
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return '';
  }
  return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}-${String(year % 100).padStart(2, '0')}`;
}

function isLikelyCVFileName(fileName: string): boolean {
  const normalized = String(fileName || '').trim().toLowerCase();
  if (normalized === '') {
    return false;
  }

  if (
    normalized.endsWith('.pdf') ||
    normalized.endsWith('.doc') ||
    normalized.endsWith('.docx') ||
    normalized.endsWith('.rtf') ||
    normalized.endsWith('.txt') ||
    normalized.endsWith('.odt')
  ) {
    return true;
  }

  return normalized.includes('cv') || normalized.includes('resume');
}

function pickDefaultAIAttachmentID(
  attachments: Array<{ attachmentID: number; fileName: string; isProfileImage: boolean }>
): number {
  const candidates = attachments.filter((item) => !item.isProfileImage);
  if (candidates.length === 0) {
    return 0;
  }

  const preferred = candidates.find((item) => isLikelyCVFileName(item.fileName));
  if (preferred) {
    return Number(preferred.attachmentID || 0);
  }

  return Number(candidates[0].attachmentID || 0);
}

function normalizeAIText(value: unknown): string {
  return String(value ?? '').trim();
}

function parseAILocation(value: string): { city: string; country: string } {
  const raw = normalizeAIText(value);
  if (raw === '') {
    return { city: '', country: '' };
  }

  const segments = raw
    .split(',')
    .map((segment) => segment.trim())
    .filter((segment) => segment !== '');
  if (segments.length === 0) {
    return { city: '', country: '' };
  }
  if (segments.length === 1) {
    return { city: segments[0], country: '' };
  }

  return {
    city: segments[segments.length - 2],
    country: segments[segments.length - 1]
  };
}

function readAIValue(value: unknown): { value: string; confidence: number } {
  if (value && typeof value === 'object') {
    const objectValue = value as Record<string, unknown>;
    if (typeof objectValue.value !== 'undefined') {
      const confidenceValue = Number(objectValue.confidence ?? 0);
      return {
        value: normalizeAIText(objectValue.value),
        confidence: Number.isFinite(confidenceValue) ? confidenceValue : 0
      };
    }
  }

  return {
    value: normalizeAIText(value),
    confidence: 0
  };
}

function mergeAIPrefillIntoEditState(
  current: CandidateEditFormState,
  candidate: Record<string, unknown> | null
): CandidateEditFormState {
  if (!candidate) {
    return current;
  }

  const next = { ...current };
  const confidenceThreshold = 0.6;

  const firstName = readAIValue(candidate.first_name);
  if (firstName.value !== '' && firstName.confidence >= confidenceThreshold) {
    next.firstName = firstName.value;
  }

  const lastName = readAIValue(candidate.last_name);
  if (lastName.value !== '' && lastName.confidence >= confidenceThreshold) {
    next.lastName = lastName.value;
  }

  const email = readAIValue(candidate.email);
  if (email.value !== '' && email.confidence >= confidenceThreshold) {
    next.email1 = email.value;
  }

  const phone = readAIValue(candidate.phone);
  if (phone.value !== '' && phone.confidence >= confidenceThreshold) {
    next.phoneCell = phone.value;
  }

  const location = candidate.location as unknown;
  if (typeof location === 'string') {
    const rawLocation = normalizeAIText(location);
    if (rawLocation !== '') {
      next.address = rawLocation;
      const parsed = parseAILocation(rawLocation);
      if (parsed.city !== '') {
        next.city = parsed.city;
      }
      if (parsed.country !== '') {
        next.country = parsed.country;
      }
    }
  } else if (location && typeof location === 'object') {
    const locationObject = location as Record<string, unknown>;
    const address = normalizeAIText(locationObject.address || locationObject.raw);
    if (address !== '') {
      next.address = address;
    }

    const city = normalizeAIText(locationObject.city);
    if (city !== '') {
      next.city = city;
    }

    const country = normalizeAIText(locationObject.country_name || locationObject.country);
    if (country !== '') {
      next.country = country;
    }
  }

  const skills = candidate.skills;
  if (Array.isArray(skills)) {
    const pickedSkills = skills
      .map((item) => {
        if (!item || typeof item !== 'object') {
          return '';
        }
        const skillObject = item as Record<string, unknown>;
        const skillName = normalizeAIText(skillObject.name);
        const skillConfidence = Number(skillObject.confidence ?? 0);
        if (skillName === '') {
          return '';
        }
        if (Number.isFinite(skillConfidence) && skillConfidence < confidenceThreshold) {
          return '';
        }
        return skillName;
      })
      .filter((item) => item !== '');

    if (pickedSkills.length > 0) {
      next.keySkills = pickedSkills.join(', ');
    }
  }

  const summary = readAIValue(candidate.summary);
  if (summary.value !== '' && summary.confidence >= confidenceThreshold && normalizeAIText(next.notes) === '') {
    next.notes = summary.value;
  }

  const currentEmployer = readAIValue(candidate.current_employer);
  if (currentEmployer.value !== '' && currentEmployer.confidence >= confidenceThreshold) {
    next.currentEmployer = currentEmployer.value;
  }

  return next;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function getChangedTrackedFields(
  before: CandidateEditFormState,
  after: CandidateEditFormState
): CandidateTrackedFieldKey[] {
  return TRACKED_FIELD_KEYS.filter((fieldKey) => before[fieldKey] !== after[fieldKey]);
}

function toTrackedFieldLabel(fieldKey: CandidateTrackedFieldKey): string {
  const labels: Record<CandidateTrackedFieldKey, string> = {
    firstName: 'First Name',
    lastName: 'Last Name',
    email1: 'Email',
    phoneCell: 'Cell Phone',
    address: 'Address',
    city: 'City',
    country: 'Country',
    keySkills: 'Key Skills',
    currentEmployer: 'Current Employer',
    notes: 'Notes'
  };
  return labels[fieldKey];
}

function buildCandidateParseFailureMessage(statusResult: {
  status: string;
  errorMessage: string;
  providerErrorCode: string;
  providerErrorMessage: string;
}): string {
  const status = String(statusResult.status || '').trim().toUpperCase();
  const providerCode = String(statusResult.providerErrorCode || '').trim().toUpperCase();
  const providerMessage = String(statusResult.providerErrorMessage || '').trim();
  const ajaxMessage = String(statusResult.errorMessage || '').trim();
  const effectiveMessage = providerMessage || ajaxMessage;

  if (providerCode === 'TEXT_EXTRACTION_FAILED') {
    return 'AI could not extract text from this CV. The file is likely scanned/image-only or encrypted. Upload a searchable PDF/DOCX (or run OCR) and retry.';
  }

  if (providerCode === 'UNSUPPORTED_FILE_TYPE') {
    return 'AI cannot parse this file type. Upload PDF, DOC, DOCX, RTF, ODT, or TXT and retry.';
  }

  if (effectiveMessage !== '') {
    return providerCode !== '' ? `${providerCode}: ${effectiveMessage}` : effectiveMessage;
  }

  return `AI prefill failed with status "${status || 'UNKNOWN'}".`;
}

function getCandidateParseWarningMessages(warnings: unknown[]): string[] {
  if (!Array.isArray(warnings)) {
    return [];
  }
  return warnings
    .map((warning) => {
      if (typeof warning === 'string') {
        return warning.trim();
      }
      if (warning && typeof warning === 'object') {
        const warningRecord = warning as Record<string, unknown>;
        const message = String(warningRecord.message || '').trim();
        const code = String(warningRecord.code || '').trim();
        if (message !== '') {
          return message;
        }
        if (code !== '') {
          return code;
        }
      }
      return '';
    })
    .filter((message) => message !== '');
}

export function CandidatesEditPage({ bootstrap }: Props) {
  const [autoAIPrefillAttachmentID] = useState<number>(() => readAutoAIPrefillAttachmentIDFromURL());
  const [data, setData] = useState<CandidatesEditModernDataResponse | null>(null);
  const [formState, setFormState] = useState<CandidateEditFormState | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [serverQueryString] = useState<string>(() => new URLSearchParams(window.location.search).toString());
  const [reloadToken, setReloadToken] = useState(0);
  const [validationError, setValidationError] = useState('');
  const [attachmentModal, setAttachmentModal] = useState<{
    url: string;
    title: string;
    showRefreshClose: boolean;
  } | null>(null);
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
  const [aiAttachmentID, setAiAttachmentID] = useState<number>(0);
  const [aiPrefillPending, setAiPrefillPending] = useState<boolean>(false);
  const [aiPrefillStatus, setAiPrefillStatus] = useState<string>('');
  const [aiPrefillError, setAiPrefillError] = useState<string>('');
  const [aiUndoSnapshot, setAiUndoSnapshot] = useState<CandidateEditFormState | null>(null);
  const [fieldSources, setFieldSources] = useState<Partial<Record<CandidateTrackedFieldKey, CandidateFieldSource>>>({});
  const [editableSourceOptions, setEditableSourceOptions] = useState<SelectMenuOption[]>([]);
  const [sourceCSV, setSourceCSV] = useState<string>('');
  const [newSourceDraft, setNewSourceDraft] = useState<string>('');
  const [sourceNotice, setSourceNotice] = useState<string>('');
  const formStateRef = useRef<CandidateEditFormState | null>(null);
  const autoAIPrefillHandledRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchCandidatesEditModernData(bootstrap, query)
      .then((result) => {
        if (!isMounted) {
          return;
        }
        setData(result);
        setFormState(toFormState(result));
        const sourceOptions = result.options.sources.map((option) => ({ value: option.value, label: option.label }));
        const selectedSource = String(result.candidate.source || '').trim();
        if (
          selectedSource !== '' &&
          !sourceOptions.some((option) => option.value.trim().toLowerCase() === selectedSource.toLowerCase())
        ) {
          sourceOptions.push({ value: selectedSource, label: selectedSource });
        }
        setEditableSourceOptions(sourceOptions);
        setSourceCSV(serializeSourceCSV([...parseSourceCSV(result.options.sourceCSV || ''), selectedSource]));
        setNewSourceDraft('');
        setSourceNotice('');
        setFieldSources({});
        const requestedAttachmentID = Number(autoAIPrefillAttachmentID || 0);
        const hasRequestedAttachment =
          requestedAttachmentID > 0 &&
          result.attachments.some(
            (attachment) => Number(attachment.attachmentID || 0) === requestedAttachmentID && !attachment.isProfileImage
          );
        setAiAttachmentID(
          hasRequestedAttachment ? requestedAttachmentID : pickDefaultAIAttachmentID(result.attachments)
        );
      })
      .catch((err: Error) => {
        if (!isMounted) {
          return;
        }
        setError(err.message || 'Unable to load candidate edit form.');
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [autoAIPrefillAttachmentID, bootstrap, serverQueryString, reloadToken]);

  useEffect(() => {
    setValidationError('');
  }, [formState?.firstName, formState?.lastName, formState?.gdprSigned, formState?.gdprExpirationDate]);

  useEffect(() => {
    formStateRef.current = formState;
  }, [formState]);

  const getFieldSource = (fieldKey: CandidateTrackedFieldKey): CandidateFieldSource | null =>
    fieldSources[fieldKey] || null;

  const getFieldClassName = (fieldKey: CandidateTrackedFieldKey): string => {
    const classNames = ['avel-form-control'];
    const source = getFieldSource(fieldKey);
    if (source === 'ai-prefill') {
      classNames.push('avel-form-control--source-ai');
    }
    return classNames.join(' ');
  };

  const getEditorClassName = (fieldKey: CandidateTrackedFieldKey): string => {
    const classNames: string[] = [];
    const source = getFieldSource(fieldKey);
    if (source === 'ai-prefill') {
      classNames.push('avel-markdown-field--source-ai');
    }
    return classNames.join(' ');
  };

  const renderFieldLabel = (label: string, fieldKey?: CandidateTrackedFieldKey) => {
    const source = fieldKey ? getFieldSource(fieldKey) : null;
    return (
      <span className="modern-command-label">
        {label}
        {source ? (
          <span className={`avel-field-source-badge avel-field-source-badge--${source}`}>
            AI
          </span>
        ) : null}
      </span>
    );
  };

  const clearFieldSource = (fieldKey: CandidateTrackedFieldKey) => {
    setFieldSources((current) => {
      if (!current[fieldKey]) {
        return current;
      }
      const next = { ...current };
      delete next[fieldKey];
      return next;
    });
  };

  const refreshPageData = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);
  usePageRefreshEvents(refreshPageData);

  const closeAttachmentModal = useCallback(
    (refreshOnClose: boolean) => {
      setAttachmentModal(null);
      if (refreshOnClose) {
        refreshPageData();
      }
    },
    [refreshPageData]
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

  const handleDeleteAttachment = useCallback(
    async (attachmentID: number) => {
      if (!data || attachmentDeletePending) {
        return;
      }
      const deleteURL = decodeLegacyURL(data.actions.deleteAttachmentURL || '');
      const token = data.actions.deleteAttachmentToken || '';
      if (deleteURL === '' || token === '') {
        setAttachmentDeleteError('Attachment delete endpoint is unavailable.');
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
      } catch (err: unknown) {
        setAttachmentDeleteError(err instanceof Error ? err.message : 'Unable to delete attachment.');
      } finally {
        setAttachmentDeletePending(false);
      }
    },
    [attachmentDeletePending, data, refreshPageData]
  );

  const runAIPrefillFromAttachment = useCallback(async () => {
    if (!data || !formState || aiPrefillPending) {
      return;
    }

    if (!(data.resumeImport?.isParsingEnabled ?? false)) {
      setAiPrefillError('AI parsing is disabled by server configuration.');
      return;
    }

    const attachmentID = Number(aiAttachmentID || 0);
    if (attachmentID <= 0) {
      setAiPrefillError('Select an attachment first.');
      return;
    }

    const baselineState = formStateRef.current || formState;
    if (!baselineState) {
      setAiPrefillError('Candidate form is not ready for AI prefill.');
      return;
    }

    setAiPrefillPending(true);
    setAiPrefillError('');
    setAiPrefillStatus('Submitting AI prefill request...');
    setAiUndoSnapshot({ ...baselineState, extraFields: { ...baselineState.extraFields } });

    try {
      const createResult = await createTalentFitFlowCandidateParseJob({
        attachmentID,
        candidateID: Number(data.meta.candidateID || 0),
        idempotencyKey: `candidate-${data.meta.candidateID}-attachment-${attachmentID}`,
        actor: String(bootstrap.userID || '')
      });

      let statusResult = createResult;
      let status = String(createResult.status || '').toUpperCase();
      setAiPrefillStatus(`Status: ${status || 'PENDING'}`);

      if ((status === 'COMPLETED' || status === 'PARTIAL') && !statusResult.candidate) {
        await sleep(600);
        statusResult = await fetchTalentFitFlowCandidateParseStatus(createResult.jobID);
        status = String(statusResult.status || '').toUpperCase();
        setAiPrefillStatus(`Status: ${status || 'PENDING'}`);
      }

      while (status === 'PENDING' || status === 'RUNNING') {
        await sleep(1800);
        statusResult = await fetchTalentFitFlowCandidateParseStatus(createResult.jobID);
        status = String(statusResult.status || '').toUpperCase();
        setAiPrefillStatus(`Status: ${status}`);
      }

      if (status !== 'COMPLETED' && status !== 'PARTIAL') {
        throw new Error(buildCandidateParseFailureMessage(statusResult));
      }

      const baseState = formStateRef.current || baselineState;
      const mergedState = mergeAIPrefillIntoEditState(baseState, statusResult.candidate);
      const changedByAI = getChangedTrackedFields(baseState, mergedState);
      setFormState(mergedState);
      formStateRef.current = mergedState;
      if (changedByAI.length > 0) {
        setFieldSources((current) => {
          const next = { ...current };
          changedByAI.forEach((fieldKey) => {
            next[fieldKey] = 'ai-prefill';
          });
          return next;
        });
      }
      const warningMessages = getCandidateParseWarningMessages(statusResult.warnings);
      const warningSuffix =
        warningMessages.length > 0
          ? ` Warnings: ${warningMessages.slice(0, 3).join(' | ')}${warningMessages.length > 3 ? ' ...' : ''}`
          : '';
      setAiPrefillStatus(
        changedByAI.length > 0
          ? `AI prefill applied. ${changedByAI.length} field${changedByAI.length === 1 ? '' : 's'} updated.${warningSuffix}`
          : `AI prefill completed. No editable fields changed.${warningSuffix}`
      );
    } catch (prefillError) {
      setAiPrefillError(prefillError instanceof Error ? prefillError.message : 'AI prefill failed.');
    } finally {
      setAiPrefillPending(false);
    }
  }, [aiAttachmentID, aiPrefillPending, bootstrap.userID, data, formState]);

  useEffect(() => {
    if (autoAIPrefillHandledRef.current) {
      return;
    }
    if (Number(autoAIPrefillAttachmentID || 0) <= 0) {
      return;
    }
    if (!data || !formState || aiPrefillPending) {
      return;
    }
    if (!(data.resumeImport?.isParsingEnabled ?? false)) {
      setAiPrefillError('AI parsing is disabled by server configuration.');
      autoAIPrefillHandledRef.current = true;
      return;
    }
    const attachmentID = Number(autoAIPrefillAttachmentID || 0);
    const hasRequestedAttachment = data.attachments.some(
      (attachment) => Number(attachment.attachmentID || 0) === attachmentID && !attachment.isProfileImage
    );
    if (!hasRequestedAttachment) {
      setAiPrefillError('Selected resume attachment is no longer available.');
      autoAIPrefillHandledRef.current = true;
      return;
    }
    if (Number(aiAttachmentID || 0) !== attachmentID) {
      setAiAttachmentID(attachmentID);
      return;
    }
    autoAIPrefillHandledRef.current = true;
    void runAIPrefillFromAttachment();
  }, [aiAttachmentID, aiPrefillPending, autoAIPrefillAttachmentID, data, formState, runAIPrefillFromAttachment]);

  const addSourceOption = useCallback(() => {
    const candidateSource = newSourceDraft.trim();
    if (candidateSource === '') {
      setSourceNotice('Enter a source name first.');
      return;
    }

    const existing = editableSourceOptions.find(
      (option) => option.value.trim().toLowerCase() === candidateSource.toLowerCase()
    );
    if (existing) {
      setFormState((current) => (current ? { ...current, source: existing.value } : current));
      setSourceNotice(`Source "${existing.value}" already exists. Selected it.`);
      setNewSourceDraft('');
      return;
    }

    const nextOptions = [...editableSourceOptions, { value: candidateSource, label: candidateSource }];
    const normalized = nextOptions
      .filter((option) => option.value !== '(none)')
      .sort((left, right) => left.label.localeCompare(right.label, undefined, { sensitivity: 'base' }));

    const withNone: SelectMenuOption[] = [{ value: '(none)', label: '(None)' }, ...normalized];
    setEditableSourceOptions(withNone);
    setSourceCSV(serializeSourceCSV([...parseSourceCSV(sourceCSV), candidateSource]));
    setFormState((current) => (current ? { ...current, source: candidateSource } : current));
    setSourceNotice(`Added source "${candidateSource}".`);
    setNewSourceDraft('');
  }, [editableSourceOptions, newSourceDraft, sourceCSV]);

  const updateExtraFieldValue = (postKey: string, value: string) => {
    setFormState((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        extraFields: {
          ...current.extraFields,
          [postKey]: value
        }
      };
    });
  };

  const renderExtraFieldControl = (field: CandidateExtraField) => {
    const value = formState?.extraFields[field.postKey] || '';

    if (field.inputType === 'textarea') {
      return (
        <textarea
          className="avel-form-control"
          name={field.postKey}
          value={value}
          onChange={(event) => updateExtraFieldValue(field.postKey, event.target.value)}
          rows={3}
        />
      );
    }

    if (field.inputType === 'dropdown') {
      return (
        <select
          className="avel-form-control"
          name={field.postKey}
          value={value}
          onChange={(event) => updateExtraFieldValue(field.postKey, event.target.value)}
        >
          <option value="">- Select from List -</option>
          {field.options.map((option) => (
            <option key={`${field.postKey}-${option}`} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    if (field.inputType === 'radio') {
      return (
        <span className="avel-candidate-extra-radio">
          {field.options.map((option) => (
            <label key={`${field.postKey}-${option}`} className="avel-candidate-extra-radio__item">
              <input
                type="radio"
                name={field.postKey}
                value={option}
                checked={value === option}
                onChange={() => updateExtraFieldValue(field.postKey, option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </span>
      );
    }

    if (field.inputType === 'checkbox') {
      const checked = value === 'Yes';
      return (
        <span className="avel-candidate-extra-checkbox">
          <input type="hidden" name={field.postKey} value={checked ? 'Yes' : 'No'} />
          <label className="modern-command-toggle">
            <input
              type="checkbox"
              name={`${field.postKey}CB`}
              checked={checked}
              onChange={(event) => updateExtraFieldValue(field.postKey, event.target.checked ? 'Yes' : 'No')}
            />
            <span className="modern-command-toggle__switch" aria-hidden="true"></span>
            <span>{checked ? 'Yes' : 'No'}</span>
          </label>
        </span>
      );
    }

    return (
      <input
        className="avel-form-control"
        type="text"
        name={field.postKey}
        value={value}
        onChange={(event) => updateExtraFieldValue(field.postKey, event.target.value)}
        placeholder={field.inputType === 'date' ? 'MM-DD-YY' : ''}
      />
    );
  };

  if (loading && !data) {
    return <div className="modern-state">Loading candidate form...</div>;
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

  if (!data || !formState) {
    return <EmptyState message="Candidate form is not available." />;
  }

  const submitURL = data.actions.submitURL || `${bootstrap.indexName}?m=candidates&a=edit&ui=modern`;
  const showURL = data.actions.showURL || `${bootstrap.indexName}?m=candidates&a=show&candidateID=${data.meta.candidateID}&ui=modern`;
  const sourceOptions: SelectMenuOption[] = editableSourceOptions.length > 0
    ? editableSourceOptions
    : data.options.sources.map((option) => ({ value: option.value, label: option.label }));
  const ownerOptions: SelectMenuOption[] = data.options.owners.map((option) => ({
    value: option.value,
    label: option.label
  }));
  const gdprOptions: SelectMenuOption[] = [
    { value: '0', label: 'No' },
    { value: '1', label: 'Yes' }
  ];
  const aiCandidateAttachments = data.attachments.filter((attachment) => !attachment.isProfileImage);
  const aiPreferredAttachments = aiCandidateAttachments.filter((attachment) => isLikelyCVFileName(attachment.fileName));
  const aiSourceAttachments = aiPreferredAttachments.length > 0 ? aiPreferredAttachments : aiCandidateAttachments;
  const aiParsingEnabled = data.resumeImport?.isParsingEnabled ?? false;
  const parseLimitRaw = data.resumeImport?.parsingStatus?.['parseLimit'];
  const parseLimitText =
    typeof parseLimitRaw === 'number' && Number.isFinite(parseLimitRaw) ? `Remaining parses: ${parseLimitRaw}` : '';
  const aiCanRunPrefill =
    aiParsingEnabled && aiSourceAttachments.length > 0 && Number(aiAttachmentID || 0) > 0 && !aiPrefillPending;
  const aiRefillDisabledReason = !aiParsingEnabled
    ? 'AI parsing is disabled in server configuration.'
    : aiSourceAttachments.length === 0
      ? 'No CV-like attachment found. Upload a CV first.'
      : Number(aiAttachmentID || 0) <= 0
        ? 'Select a source attachment.'
        : '';
  const aiUpdatedFieldKeys = TRACKED_FIELD_KEYS.filter((fieldKey) => fieldSources[fieldKey] === 'ai-prefill');
  const aiFieldCount = aiUpdatedFieldKeys.length;
  const aiUpdatedFieldSummary = aiUpdatedFieldKeys.map((fieldKey) => toTrackedFieldLabel(fieldKey)).join(', ');
  const candidateDisplayName = `${formState.firstName} ${formState.lastName}`.trim() || 'Unnamed Candidate';

  return (
    <div className="avel-dashboard-page avel-candidate-edit-page">
      <PageContainer
        title={candidateDisplayName}
        subtitle={`Candidate Profile #${data.meta.candidateID} · Modern editing workspace with legacy-safe save flow.`}
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={showURL}>
              Back To Profile
            </a>
            <a className="modern-btn modern-btn--secondary" href={data.actions.legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel avel-candidate-edit-panel avel-candidate-edit-panel--edit avel-candidate-edit-panel--workbench">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Candidate Details</h2>
              <p className="avel-list-panel__hint">Required fields: First Name, Last Name, Owner.</p>
            </div>

            <form
              id="candidate-edit-form"
              className="avel-candidate-edit-form"
              method="post"
              action={submitURL}
              onSubmit={(event) => {
                setValidationError('');
                if (formState.firstName.trim() === '' || formState.lastName.trim() === '') {
                  event.preventDefault();
                  setValidationError('First Name and Last Name are required.');
                  return;
                }
                if (formState.gdprSigned === '1' && formState.gdprExpirationDate.trim() === '') {
                  event.preventDefault();
                  setValidationError('GDPR Expiration Date is required when GDPR Signed is Yes.');
                }
              }}
            >
              <input type="hidden" name="postback" value="postback" />
              <input type="hidden" name="candidateID" value={String(data.meta.candidateID)} />
              <input type="hidden" name="sourceCSV" value={sourceCSV} />
              <input type="hidden" name="gender" value={formState.gender} />
              <input type="hidden" name="race" value={formState.race} />
              <input type="hidden" name="veteran" value={formState.veteran} />
              <input type="hidden" name="disability" value={formState.disability} />

              <div className="avel-candidate-form-strip">
                <span className="modern-chip modern-chip--info">Candidate ID: {data.meta.candidateID}</span>
                <span className={`modern-chip ${formState.isActive ? 'modern-chip--success' : 'modern-chip--critical'}`}>
                  {formState.isActive ? 'Active Profile' : 'Inactive Profile'}
                </span>
                <span className={`modern-chip ${formState.isHot ? 'modern-chip--warning' : 'modern-chip--info'}`}>
                  {formState.isHot ? 'Hot Candidate' : 'Standard Priority'}
                </span>
                {parseLimitText !== '' ? <span className="modern-chip modern-chip--source-other">{parseLimitText}</span> : null}
              </div>

              <div className="modern-table-actions avel-candidate-edit-actions avel-candidate-edit-actions--sticky">
                <button type="submit" className="modern-btn modern-btn--emphasis">
                  Save Candidate
                </button>
                <a className="modern-btn modern-btn--secondary" href={showURL}>
                  Cancel
                </a>
              </div>

              {aiPrefillStatus !== '' ? <div className="modern-state">{aiPrefillStatus}</div> : null}
              {aiPrefillError !== '' ? <div className="modern-state modern-state--error" role="alert">{aiPrefillError}</div> : null}

              <div className="avel-candidate-edit-sections">
                {validationError !== '' ? (
                  <div className="modern-state modern-state--error" role="alert">{validationError}</div>
                ) : null}
                <section className="avel-candidate-edit-section avel-candidate-edit-section--status">
                  <div className="avel-candidate-form-divider avel-candidate-form-divider--status">
                    <strong>Profile Status & GDPR</strong>
                    <span>Operational state and GDPR settings used in day-to-day reporting.</span>
                  </div>
                  <div className="avel-candidate-edit-grid">
                    <label className="modern-command-toggle">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formState.isActive}
                        onChange={(event) => setFormState((current) => (current ? { ...current, isActive: event.target.checked } : current))}
                      />
                      <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                      <span>Active Candidate</span>
                    </label>

                    <label className="modern-command-toggle">
                      <input
                        type="checkbox"
                        name="isHot"
                        checked={formState.isHot}
                        onChange={(event) => setFormState((current) => (current ? { ...current, isHot: event.target.checked } : current))}
                      />
                      <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                      <span>Hot Candidate</span>
                    </label>

                    <input type="hidden" name="gdprSigned" value={formState.gdprSigned} />
                    <SelectMenu
                      label="GDPR Signed"
                      value={formState.gdprSigned}
                      options={gdprOptions}
                      className="modern-command-field avel-candidate-edit-field--span-2"
                      onChange={(value) => setFormState((current) => (current ? { ...current, gdprSigned: value as '0' | '1' } : current))}
                    />

                    <label className="modern-command-field">
                      <span className="modern-command-label">GDPR Expiration</span>
                      <input type="hidden" name="gdprExpirationDate" value={formState.gdprExpirationDate} />
                      <input
                        className="avel-form-control"
                        type="date"
                        value={toISODateInput(formState.gdprExpirationDate)}
                        onChange={(event) =>
                          setFormState((current) => (current ? { ...current, gdprExpirationDate: toLegacyShortDate(event.target.value) } : current))
                        }
                      />
                    </label>
                  </div>
                </section>

                <section className="avel-candidate-edit-section avel-candidate-edit-section--identity">
                  <div className="avel-candidate-form-divider avel-candidate-form-divider--identity">
                    <strong>Profile & Reachability</strong>
                    <span>Identity, contact channels, and candidate availability details.</span>
                  </div>
                  <div className="avel-candidate-edit-grid">
                    <label className="modern-command-field">
                      {renderFieldLabel('First Name *', 'firstName')}
                      <input
                        className={getFieldClassName('firstName')}
                        type="text"
                        name="firstName"
                        value={formState.firstName}
                        onChange={(event) => {
                          clearFieldSource('firstName');
                          setFormState((current) => (current ? { ...current, firstName: event.target.value } : current));
                        }}
                        required
                      />
                    </label>

                    <label className="modern-command-field">
                      {renderFieldLabel('Last Name *', 'lastName')}
                      <input
                        className={getFieldClassName('lastName')}
                        type="text"
                        name="lastName"
                        value={formState.lastName}
                        onChange={(event) => {
                          clearFieldSource('lastName');
                          setFormState((current) => (current ? { ...current, lastName: event.target.value } : current));
                        }}
                        required
                      />
                    </label>

                    <label className="modern-command-field">
                      {renderFieldLabel('Email', 'email1')}
                      <input
                        className={getFieldClassName('email1')}
                        type="email"
                        name="email1"
                        value={formState.email1}
                        onChange={(event) => {
                          clearFieldSource('email1');
                          setFormState((current) => (current ? { ...current, email1: event.target.value } : current));
                        }}
                      />
                    </label>

                    <label className="modern-command-field">
                      {renderFieldLabel('Cell Phone', 'phoneCell')}
                      <input
                        className={getFieldClassName('phoneCell')}
                        type="text"
                        name="phoneCell"
                        value={formState.phoneCell}
                        onChange={(event) => {
                          clearFieldSource('phoneCell');
                          setFormState((current) => (current ? { ...current, phoneCell: event.target.value } : current));
                        }}
                      />
                    </label>

                    <label className="modern-command-field">
                      {renderFieldLabel('City', 'city')}
                      <input
                        className={getFieldClassName('city')}
                        type="text"
                        name="city"
                        value={formState.city}
                        onChange={(event) => {
                          clearFieldSource('city');
                          setFormState((current) => (current ? { ...current, city: event.target.value } : current));
                        }}
                      />
                    </label>

                    <label className="modern-command-field">
                      {renderFieldLabel('Country', 'country')}
                      <input
                        className={getFieldClassName('country')}
                        type="text"
                        name="country"
                        value={formState.country}
                        onChange={(event) => {
                          clearFieldSource('country');
                          setFormState((current) => (current ? { ...current, country: event.target.value } : current));
                        }}
                      />
                    </label>

                    <label className="modern-command-field">
                      <span className="modern-command-label">Best Time To Call</span>
                      <input
                        className="avel-form-control"
                        type="text"
                        name="bestTimeToCall"
                        value={formState.bestTimeToCall}
                        onChange={(event) => setFormState((current) => (current ? { ...current, bestTimeToCall: event.target.value } : current))}
                      />
                    </label>

                    <label className="modern-command-field">
                      <span className="modern-command-label">Date Available</span>
                      <input type="hidden" name="dateAvailable" value={formState.dateAvailable} />
                      <input
                        className="avel-form-control"
                        type="date"
                        value={toISODateInput(formState.dateAvailable)}
                        onChange={(event) =>
                          setFormState((current) => (current ? { ...current, dateAvailable: toLegacyShortDate(event.target.value) } : current))
                        }
                      />
                    </label>

                    <label className="modern-command-toggle">
                      <input
                        type="checkbox"
                        name="canRelocate"
                        checked={formState.canRelocate}
                        onChange={(event) => setFormState((current) => (current ? { ...current, canRelocate: event.target.checked } : current))}
                      />
                      <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                      <span>Open To Relocation</span>
                    </label>

                    <label className="modern-command-field avel-candidate-edit-field--span-3">
                      {renderFieldLabel('Address', 'address')}
                      <textarea
                        className={getFieldClassName('address')}
                        name="address"
                        value={formState.address}
                        onChange={(event) => {
                          clearFieldSource('address');
                          setFormState((current) => (current ? { ...current, address: event.target.value } : current));
                        }}
                        rows={2}
                      />
                    </label>
                  </div>
                </section>

                <section className="avel-candidate-edit-section avel-candidate-edit-section--source">
                  <div className="avel-candidate-form-divider avel-candidate-form-divider--source">
                    <strong>Sourcing & Ownership</strong>
                    <span>Assign ownership and keep source taxonomy up to date.</span>
                  </div>
                  <div className="avel-candidate-edit-grid">
                    <input type="hidden" name="source" value={formState.source} />
                    <SelectMenu
                      label="Source"
                      value={formState.source}
                      options={sourceOptions.length > 0 ? sourceOptions : [{ value: '(none)', label: '(None)' }]}
                      className="modern-command-field avel-candidate-edit-field--span-2"
                      onChange={(value) => {
                        setSourceNotice('');
                        setFormState((current) => (current ? { ...current, source: value } : current));
                      }}
                    />
                    <div className="modern-command-field avel-candidate-source-add">
                      <span className="modern-command-label">Add New Source</span>
                      <div className="avel-candidate-source-add__row">
                        <input
                          className="avel-form-control"
                          type="text"
                          value={newSourceDraft}
                          placeholder="Type source name"
                          onChange={(event) => setNewSourceDraft(event.target.value)}
                        />
                        <button type="button" className="modern-btn modern-btn--mini modern-btn--secondary" onClick={addSourceOption}>
                          Add
                        </button>
                      </div>
                      {sourceNotice !== '' ? <span className="avel-field-source-help">{sourceNotice}</span> : null}
                    </div>

                    <input type="hidden" name="owner" value={formState.owner} />
                    <SelectMenu
                      label="Owner *"
                      value={formState.owner}
                      options={ownerOptions}
                      onChange={(value) => setFormState((current) => (current ? { ...current, owner: value } : current))}
                    />

                    <label className="modern-command-field">
                      {renderFieldLabel('Current Employer', 'currentEmployer')}
                      <input
                        className={getFieldClassName('currentEmployer')}
                        type="text"
                        name="currentEmployer"
                        value={formState.currentEmployer}
                        onChange={(event) => {
                          clearFieldSource('currentEmployer');
                          setFormState((current) => (current ? { ...current, currentEmployer: event.target.value } : current));
                        }}
                      />
                    </label>
                  </div>
                </section>

                <section className="avel-candidate-edit-section avel-candidate-edit-section--narrative">
                  <div className="avel-candidate-form-divider">
                    <strong>Compensation & Narrative</strong>
                    <span>Comp package and recruiter context for submissions.</span>
                  </div>
                  <div className="avel-candidate-edit-grid">
                    <label className="modern-command-field">
                      <span className="modern-command-label">Current Pay</span>
                      <input
                        className="avel-form-control"
                        type="text"
                        name="currentPay"
                        value={formState.currentPay}
                        onChange={(event) => setFormState((current) => (current ? { ...current, currentPay: event.target.value } : current))}
                      />
                    </label>

                    <label className="modern-command-field">
                      <span className="modern-command-label">Desired Pay</span>
                      <input
                        className="avel-form-control"
                        type="text"
                        name="desiredPay"
                        value={formState.desiredPay}
                        onChange={(event) => setFormState((current) => (current ? { ...current, desiredPay: event.target.value } : current))}
                      />
                    </label>

                    <label className="modern-command-field avel-candidate-edit-field--span-3">
                      {renderFieldLabel('Key Skills', 'keySkills')}
                      <textarea
                        className={getFieldClassName('keySkills')}
                        name="keySkills"
                        value={formState.keySkills}
                        onChange={(event) => {
                          clearFieldSource('keySkills');
                          setFormState((current) => (current ? { ...current, keySkills: event.target.value } : current));
                        }}
                        rows={2}
                      />
                    </label>

                    <label className="modern-command-field avel-candidate-edit-field--span-3">
                      {renderFieldLabel('Notes', 'notes')}
                      <MarkdownTextarea
                        name="notes"
                        value={formState.notes}
                        rows={6}
                        className={getEditorClassName('notes')}
                        ariaLabel="Candidate notes"
                        onChange={(nextValue) => {
                          clearFieldSource('notes');
                          setFormState((current) => (current ? { ...current, notes: nextValue } : current));
                        }}
                      />
                    </label>
                  </div>
                </section>
              </div>

              {data.extraFields.length > 0 ? (
                <div className="avel-candidate-edit-extra avel-candidate-edit-extra--custom">
                  <div className="avel-list-panel__header">
                    <h3 className="avel-list-panel__title">Custom Fields</h3>
                    <p className="avel-list-panel__hint">Values are saved to legacy extra fields.</p>
                  </div>
                  <div className="avel-candidate-edit-grid">
                    {data.extraFields.map((field) => {
                      const fieldClassName = `modern-command-field${
                        field.inputType === 'textarea' || field.inputType === 'radio'
                          ? ' avel-candidate-edit-field--full'
                          : ''
                      }`;
                      if (field.inputType === 'dropdown') {
                        const value = formState.extraFields[field.postKey] || '';
                        const extraFieldOptions: SelectMenuOption[] = [
                          { value: '', label: '- Select from List -' },
                          ...field.options.map((option) => ({
                            value: option,
                            label: option
                          }))
                        ];
                        return (
                          <div key={field.postKey}>
                            <input type="hidden" name={field.postKey} value={value} />
                            <SelectMenu
                              label={field.fieldName}
                              value={value}
                              options={extraFieldOptions}
                              onChange={(nextValue) => updateExtraFieldValue(field.postKey, nextValue)}
                            />
                          </div>
                        );
                      }

                      return (
                        <label key={field.postKey} className={fieldClassName}>
                          <span className="modern-command-label">{field.fieldName}</span>
                          {renderExtraFieldControl(field)}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </form>

            <section className="avel-candidate-edit-attachments avel-candidate-edit-attachments--panel">
              <div className="avel-list-panel__header">
                <h3 className="avel-list-panel__title">Attachments</h3>
                <div className="modern-table-actions">
                  {data.meta.permissions.canCreateAttachment ? (
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
                  <a className="modern-btn modern-btn--mini modern-btn--secondary" href={showURL}>
                    Manage In Profile
                  </a>
                </div>
              </div>
              <div className="avel-joborder-thread-form" style={{ marginBottom: '8px' }}>
                <div className="avel-candidate-provenance">
                  <span className="modern-chip modern-chip--success">AI-updated fields: {aiFieldCount}</span>
                  <span className="avel-field-source-badge avel-field-source-badge--ai-prefill">AI</span>
                  <span className="avel-field-source-help">High-confidence values applied from selected CV.</span>
                  {aiUpdatedFieldSummary !== '' ? (
                    <span className="avel-field-source-help avel-field-source-help--emphasis">
                      Updated: {aiUpdatedFieldSummary}
                    </span>
                  ) : null}
                </div>
                <div className="modern-state" style={{ marginBottom: '8px' }}>
                  Load CV details with AI and apply high-confidence values into this form.
                  {parseLimitText !== '' ? ` ${parseLimitText}` : ''}
                </div>
                <label className="modern-command-field avel-candidate-edit-field--full">
                  <span className="modern-command-label">AI Source Attachment</span>
                  <select
                    className="avel-form-control"
                    value={String(aiAttachmentID || '')}
                    onChange={(event) => setAiAttachmentID(Number(event.target.value || 0))}
                  >
                    <option value="">Select CV attachment...</option>
                    {aiSourceAttachments.map((attachment) => (
                      <option key={`ai-attachment-${attachment.attachmentID}`} value={String(attachment.attachmentID)}>
                        {toDisplayText(attachment.fileName, `Attachment #${attachment.attachmentID}`)}
                      </option>
                    ))}
                  </select>
                </label>
                {aiRefillDisabledReason !== '' ? <div className="modern-state">{aiRefillDisabledReason}</div> : null}
                <div className="modern-table-actions">
                  <button
                    type="button"
                    className="modern-btn modern-btn--emphasis avel-candidate-edit-ai-upload"
                    onClick={runAIPrefillFromAttachment}
                    disabled={!aiCanRunPrefill}
                  >
                    {aiPrefillPending ? 'AI Running...' : 'Load CV Details With AI'}
                  </button>
                  {aiUndoSnapshot ? (
                    <button
                      type="button"
                      className="modern-btn modern-btn--mini modern-btn--secondary"
                      onClick={() => {
                        if (!aiUndoSnapshot) {
                          return;
                        }
                        setFormState({
                          ...aiUndoSnapshot,
                          extraFields: { ...aiUndoSnapshot.extraFields }
                        });
                        formStateRef.current = {
                          ...aiUndoSnapshot,
                          extraFields: { ...aiUndoSnapshot.extraFields }
                        };
                        setFieldSources((current) => {
                          const next = { ...current };
                          TRACKED_FIELD_KEYS.forEach((fieldKey) => {
                            if (next[fieldKey] === 'ai-prefill') {
                              delete next[fieldKey];
                            }
                          });
                          return next;
                        });
                        setAiUndoSnapshot(null);
                        setAiPrefillStatus('AI refill undone.');
                        setAiPrefillError('');
                      }}
                    >
                      Undo AI Refill
                    </button>
                  ) : null}
                </div>
              </div>
              {data.meta.permissions.canCreateAttachment && attachmentUploadOpen ? (
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
                  {attachmentUploadError ? <div className="modern-state modern-state--error" role="alert">{attachmentUploadError}</div> : null}
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
                  { key: 'file', title: 'File' },
                  { key: 'created', title: 'Created' },
                  { key: 'type', title: 'Type' },
                  { key: 'actions', title: 'Actions' }
                ]}
                hasRows={data.attachments.length > 0}
                emptyMessage="No attachments."
              >
                {data.attachments.map((attachment) => (
                  <tr key={attachment.attachmentID}>
                    <td>
                      {attachment.retrievalURL !== '' ? (
                        <a className="modern-link" href={decodeLegacyURL(attachment.retrievalURL)} target="_blank" rel="noreferrer">
                          {toDisplayText(attachment.fileName, 'Attachment')}
                        </a>
                      ) : (
                        toDisplayText(attachment.fileName, 'Attachment')
                      )}
                    </td>
                    <td>{toDisplayText(attachment.dateCreated)}</td>
                    <td>{attachment.isProfileImage ? 'Profile image' : 'Document'}</td>
                    <td>
                      <div className="modern-table-actions">
                        {attachment.previewAvailable && attachment.previewURL !== '' ? (
                          <button
                            type="button"
                            className="modern-btn modern-btn--mini modern-btn--secondary"
                            onClick={() =>
                              setAttachmentModal({
                                url: decodeLegacyURL(attachment.previewURL),
                                title: `Preview: ${toDisplayText(attachment.fileName, 'Attachment')}`,
                                showRefreshClose: false
                              })
                            }
                          >
                            Preview
                          </button>
                        ) : null}
                        {data.meta.permissions.canDeleteAttachment ? (
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

          </section>
        </div>

        <LegacyFrameModal
          isOpen={!!attachmentModal}
          title={attachmentModal?.title || 'Add Attachment'}
          url={attachmentModal?.url || ''}
          onClose={closeAttachmentModal}
          showRefreshClose={attachmentModal?.showRefreshClose ?? true}
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
      </PageContainer>
    </div>
  );
}

