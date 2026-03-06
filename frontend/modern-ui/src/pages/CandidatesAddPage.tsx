import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createTalentFitFlowCandidateParseJob,
  fetchCandidateDuplicateCheck,
  fetchCandidatesAddModernData,
  fetchTalentFitFlowCandidateParseStatus,
  submitCandidatesAddResumeAction
} from '../lib/api';
import type { CandidateDuplicateMatch, CandidatesAddModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { DataTable } from '../components/primitives/DataTable';
import { MarkdownTextarea } from '../components/primitives/MarkdownTextarea';
import { SelectMenu } from '../ui-core';
import type { SelectMenuOption } from '../ui-core';
import { ensureModernUIURL } from '../lib/navigation';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type CandidateExtraField = CandidatesAddModernDataResponse['extraFields'][number];

type CandidateAddFormState = {
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
  source: string;
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

function toFormState(data: CandidatesAddModernDataResponse): CandidateAddFormState {
  const extraFields: Record<string, string> = {};
  data.extraFields.forEach((field) => {
    extraFields[field.postKey] = field.value || (field.inputType === 'checkbox' ? 'No' : '');
  });

  return {
    firstName: data.defaults.firstName || '',
    lastName: data.defaults.lastName || '',
    email1: data.defaults.email1 || '',
    phoneCell: data.defaults.phoneCell || '',
    address: data.defaults.address || '',
    city: data.defaults.city || '',
    country: data.defaults.country || '',
    bestTimeToCall: data.defaults.bestTimeToCall || '',
    dateAvailable: data.defaults.dateAvailable || '',
    gdprSigned: data.defaults.gdprSigned ? '1' : '0',
    gdprExpirationDate: data.defaults.gdprExpirationDate || '',
    source: data.defaults.source || '(none)',
    keySkills: data.defaults.keySkills || '',
    currentEmployer: data.defaults.currentEmployer || '',
    currentPay: data.defaults.currentPay || '',
    desiredPay: data.defaults.desiredPay || '',
    notes: data.defaults.notes || '',
    canRelocate: !!data.defaults.canRelocate,
    gender: data.defaults.gender || '',
    race: data.defaults.race || '',
    veteran: data.defaults.veteran || '',
    disability: data.defaults.disability || '',
    extraFields
  };
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

function mergeAIPrefillIntoFormState(
  current: CandidateAddFormState,
  candidate: Record<string, unknown> | null
): CandidateAddFormState {
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
  before: CandidateAddFormState,
  after: CandidateAddFormState
): CandidateTrackedFieldKey[] {
  return TRACKED_FIELD_KEYS.filter((fieldKey) => before[fieldKey] !== after[fieldKey]);
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

  return `AI extraction failed with status "${status || 'UNKNOWN'}".`;
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

export function CandidatesAddPage({ bootstrap }: Props) {
  const [data, setData] = useState<CandidatesAddModernDataResponse | null>(null);
  const [formState, setFormState] = useState<CandidateAddFormState | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [serverQueryString] = useState<string>(() => new URLSearchParams(window.location.search).toString());
  const formRef = useRef<HTMLFormElement | null>(null);
  const resumeFileInputRef = useRef<HTMLInputElement | null>(null);
  const [duplicateChecking, setDuplicateChecking] = useState(false);
  const [duplicateError, setDuplicateError] = useState('');
  const [duplicateMode, setDuplicateMode] = useState<'none' | 'hard' | 'soft'>('none');
  const [hardMatches, setHardMatches] = useState<CandidateDuplicateMatch[]>([]);
  const [softMatches, setSoftMatches] = useState<CandidateDuplicateMatch[]>([]);
  const [softOverrideAccepted, setSoftOverrideAccepted] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [resumeTempFile, setResumeTempFile] = useState('');
  const [resumeUploadFile, setResumeUploadFile] = useState<File | null>(null);
  const [resumeActionPending, setResumeActionPending] = useState<'none' | 'upload'>('none');
  const [resumeActionError, setResumeActionError] = useState('');
  const [aiPrefillPending, setAiPrefillPending] = useState(false);
  const [aiPrefillStatus, setAiPrefillStatus] = useState('');
  const [aiPrefillError, setAiPrefillError] = useState('');
  const [aiUndoSnapshot, setAiUndoSnapshot] = useState<CandidateAddFormState | null>(null);
  const [fieldSources, setFieldSources] = useState<Partial<Record<CandidateTrackedFieldKey, CandidateFieldSource>>>({});
  const [editableSourceOptions, setEditableSourceOptions] = useState<SelectMenuOption[]>([]);
  const [sourceCSV, setSourceCSV] = useState<string>('');
  const [newSourceDraft, setNewSourceDraft] = useState<string>('');
  const [sourceNotice, setSourceNotice] = useState<string>('');
  const formStateRef = useRef<CandidateAddFormState | null>(null);
  const targetModule = String(bootstrap.targetModule || '').toLowerCase();
  const targetAction = String(bootstrap.targetAction || '').toLowerCase();
  const isJobOrderQuickAddMode = targetModule === 'joborders' && targetAction === 'addcandidatemodal';
  const jobOrderID = Number(new URLSearchParams(serverQueryString).get('jobOrderID') || 0);
  const hasValidJobOrderID = Number.isFinite(jobOrderID) && jobOrderID > 0;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchCandidatesAddModernData(bootstrap, query)
      .then((result) => {
        if (!isMounted) {
          return;
        }
        setData(result);
        const nextFormState = toFormState(result);
        setFormState(nextFormState);
        const sourceOptions = result.options.sources.map((option) => ({ value: option.value, label: option.label }));
        const selectedSource = String(nextFormState.source || '').trim();
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
        setResumeText(result.resumeImport.documentText || '');
        setResumeTempFile(result.resumeImport.documentTempFile || '');
      })
      .catch((err: Error) => {
        if (!isMounted) {
          return;
        }
        setError(err.message || 'Unable to load candidate add form.');
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [bootstrap, serverQueryString]);

  useEffect(() => {
    formStateRef.current = formState;
  }, [formState]);

  const getFieldSource = (fieldKey: CandidateTrackedFieldKey): CandidateFieldSource | null =>
    fieldSources[fieldKey] || null;

  const isBlankValue = (value: string, treatNoneAsBlank = false): boolean => {
    const normalized = String(value || '').trim();
    if (normalized === '') {
      return true;
    }
    if (treatNoneAsBlank && normalized.toLowerCase() === '(none)') {
      return true;
    }
    return false;
  };

  const getFieldClassName = (fieldKey: CandidateTrackedFieldKey, value: string): string => {
    const classNames = ['avel-form-control'];
    const source = getFieldSource(fieldKey);
    if (source === 'ai-prefill') {
      classNames.push('avel-form-control--source-ai');
    }
    if (isBlankValue(value)) {
      classNames.push('avel-form-control--missing');
    }
    return classNames.join(' ');
  };

  const getEditorClassName = (fieldKey: CandidateTrackedFieldKey, value: string): string => {
    const classNames: string[] = [];
    const source = getFieldSource(fieldKey);
    if (source === 'ai-prefill') {
      classNames.push('avel-markdown-field--source-ai');
    }
    if (isBlankValue(value)) {
      classNames.push('avel-markdown-field--missing');
    }
    return classNames.join(' ');
  };

  const getFieldContainerClassName = (baseClassName: string, value: string, treatNoneAsBlank = false): string =>
    isBlankValue(value, treatNoneAsBlank) ? `${baseClassName} avel-candidate-field--missing` : baseClassName;

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

  const addSourceOption = useCallback(() => {
    const candidateSource = newSourceDraft.trim();
    if (candidateSource === '') {
      setSourceNotice('Enter a source label first.');
      return;
    }

    const duplicate = editableSourceOptions.some((option) => option.value.trim().toLowerCase() === candidateSource.toLowerCase());
    if (duplicate) {
      setFormState((current) => (current ? { ...current, source: candidateSource } : current));
      setSourceNotice('Source already exists. Selected existing value.');
      setNewSourceDraft('');
      return;
    }

    const nextOptions = [...editableSourceOptions, { value: candidateSource, label: candidateSource }];
    setEditableSourceOptions(nextOptions);
    setFormState((current) => (current ? { ...current, source: candidateSource } : current));
    setSourceCSV(serializeSourceCSV([...parseSourceCSV(sourceCSV), candidateSource]));
    setSourceNotice('Source added and selected.');
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
          className={`avel-form-control${isBlankValue(value) ? ' avel-form-control--missing' : ''}`}
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
          className={`avel-form-control${isBlankValue(value) ? ' avel-form-control--missing' : ''}`}
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
        className={`avel-form-control${isBlankValue(value) ? ' avel-form-control--missing' : ''}`}
        type="text"
        name={field.postKey}
        value={value}
        onChange={(event) => updateExtraFieldValue(field.postKey, event.target.value)}
        placeholder={field.inputType === 'date' ? 'MM-DD-YY' : ''}
      />
    );
  };

  useEffect(() => {
    setSoftOverrideAccepted(false);
    setDuplicateMode('none');
    setHardMatches([]);
    setSoftMatches([]);
    setDuplicateError('');
    setValidationError('');
  }, [formState?.firstName, formState?.lastName, formState?.email1, formState?.phoneCell, formState?.city, formState?.country]);

  const runResumeAction = async (mode: 'upload') => {
    if (!data || !formState || resumeActionPending !== 'none') {
      return;
    }

    if (mode === 'upload' && !resumeUploadFile) {
      setResumeActionError('Select a CV file first.');
      return;
    }

    const formData = new FormData();
    formData.set('postback', 'postback');
    formData.set('sourceCSV', sourceCSV);
    formData.set('firstName', formState.firstName);
    formData.set('lastName', formState.lastName);
    formData.set('email1', formState.email1);
    formData.set('phoneCell', formState.phoneCell);
    formData.set('address', formState.address);
    formData.set('city', formState.city);
    formData.set('country', formState.country);
    formData.set('bestTimeToCall', formState.bestTimeToCall);
    formData.set('dateAvailable', formState.dateAvailable);
    formData.set('gdprSigned', formState.gdprSigned);
    formData.set('gdprExpirationDate', formState.gdprExpirationDate);
    formData.set('source', formState.source);
    formData.set('keySkills', formState.keySkills);
    formData.set('currentEmployer', formState.currentEmployer);
    formData.set('currentPay', formState.currentPay);
    formData.set('desiredPay', formState.desiredPay);
    formData.set('notes', formState.notes);
    formData.set('canRelocate', formState.canRelocate ? '1' : '0');
    formData.set('gender', formState.gender);
    formData.set('race', formState.race);
    formData.set('veteran', formState.veteran);
    formData.set('disability', formState.disability);
    formData.set('documentText', resumeText);
    formData.set('documentTempFile', resumeTempFile);
    if (isJobOrderQuickAddMode && hasValidJobOrderID) {
      formData.set('jobOrderID', String(jobOrderID));
    }

    Object.entries(formState.extraFields).forEach(([postKey, value]) => {
      formData.set(postKey, value);
    });

    if (mode === 'upload' || resumeUploadFile) {
      formData.set('loadDocument', 'true');
      if (resumeUploadFile) {
        formData.set('documentFile', resumeUploadFile);
      }
    }
    setResumeActionPending(mode);
    setResumeActionError('');
    setAiPrefillStatus('');
    setAiPrefillError('');
    try {
      const response = await submitCandidatesAddResumeAction(bootstrap, formData);
      setData(response);
      setResumeText(response.resumeImport.documentText || '');
      setResumeTempFile(response.resumeImport.documentTempFile || '');
      setResumeUploadFile(null);
      if (resumeFileInputRef.current) {
        resumeFileInputRef.current.value = '';
      }
      setAiUndoSnapshot(null);
    } catch (resumeError) {
      const message = resumeError instanceof Error ? resumeError.message : 'Resume import failed.';
      setResumeActionError(message);
    } finally {
      setResumeActionPending('none');
    }
  };

  const runAIPrefill = async () => {
    if (aiPrefillPending) {
      return;
    }
    const currentState = formStateRef.current;
    if (!currentState) {
      return;
    }
    if (resumeTempFile.trim() === '') {
      setAiPrefillError('Upload CV content first so AI can parse it.');
      return;
    }

    setAiPrefillPending(true);
    setAiPrefillError('');
    setAiPrefillStatus('Submitting AI extraction request...');
    setAiUndoSnapshot({ ...currentState, extraFields: { ...currentState.extraFields } });

    try {
      const createResult = await createTalentFitFlowCandidateParseJob({
        documentTempFile: resumeTempFile,
        idempotencyKey: resumeTempFile,
        actor: String(bootstrap.userID || '')
      });

      let statusResult = createResult;
      let status = String(createResult.status || '').toUpperCase();
      setAiPrefillStatus(`Status: ${status || 'PENDING'}`);

      while (status === 'PENDING' || status === 'RUNNING') {
        await sleep(1800);
        statusResult = await fetchTalentFitFlowCandidateParseStatus(createResult.jobID);
        status = String(statusResult.status || '').toUpperCase();
        setAiPrefillStatus(`Status: ${status}`);
      }

      if (status !== 'COMPLETED' && status !== 'PARTIAL') {
        throw new Error(buildCandidateParseFailureMessage(statusResult));
      }

      const baseState = formStateRef.current || currentState;
      const mergedState = mergeAIPrefillIntoFormState(baseState, statusResult.candidate);
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
      setAiPrefillStatus('AI extraction applied. Review values before saving.');
    } catch (prefillError) {
      setAiPrefillError(prefillError instanceof Error ? prefillError.message : 'AI extraction failed.');
    } finally {
      setAiPrefillPending(false);
    }
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

  if (isJobOrderQuickAddMode && !hasValidJobOrderID) {
    return (
      <ErrorState
        message="Unable to open quick add candidate flow: missing job order ID."
        actionLabel="Open Legacy UI"
        actionURL={bootstrap.legacyURL}
      />
    );
  }

  const submitURL = isJobOrderQuickAddMode && hasValidJobOrderID
    ? `${bootstrap.indexName}?m=joborders&a=addCandidateModal&jobOrderID=${jobOrderID}&ui=modern`
    : data.actions.submitURL || `${bootstrap.indexName}?m=candidates&a=add&ui=modern`;
  const backURL = isJobOrderQuickAddMode && hasValidJobOrderID
    ? `${bootstrap.indexName}?m=joborders&a=considerCandidateSearch&jobOrderID=${jobOrderID}&ui=modern`
    : data.actions.listURL || `${bootstrap.indexName}?m=candidates&a=listByView&ui=modern`;
  const legacyURL = isJobOrderQuickAddMode && hasValidJobOrderID
    ? `${bootstrap.indexName}?m=joborders&a=addCandidateModal&jobOrderID=${jobOrderID}&ui=legacy`
    : data.actions.legacyURL;
  const pageTitle = isJobOrderQuickAddMode ? 'Quick Add Candidate' : 'Add Candidate';
  const pageSubtitle = isJobOrderQuickAddMode
    ? `Create a new candidate and assign directly to job order #${jobOrderID}.`
    : 'Modern candidate creation form. Save action uses the proven legacy backend.';
  const backLabel = isJobOrderQuickAddMode ? 'Back To Candidate Search' : 'Back To Candidates';
  const sourceOptions: SelectMenuOption[] = editableSourceOptions.length > 0
    ? editableSourceOptions
    : data.options.sources.map((option) => ({
        value: option.value,
        label: option.label
      }));
  const gdprOptions: SelectMenuOption[] = [
    { value: '0', label: 'No' },
    { value: '1', label: 'Yes' }
  ];
  const parseLimitRaw = data.resumeImport.parsingStatus?.['parseLimit'];
  const parseLimitText =
    typeof parseLimitRaw === 'number' && Number.isFinite(parseLimitRaw) ? `Remaining AI parses: ${parseLimitRaw}` : '';
  const aiCanRunPrefillTopAction =
    data.resumeImport.isParsingEnabled && resumeTempFile.trim() !== '' && !aiPrefillPending && resumeActionPending === 'none';
  const aiTopActionDisabledReason = !data.resumeImport.isParsingEnabled
    ? 'AI parsing is disabled in server configuration.'
    : resumeTempFile.trim() === ''
      ? 'Upload a CV first to prepare AI source content.'
      : resumeActionPending !== 'none'
        ? 'Wait for CV upload to complete.'
        : '';
  const aiFieldCount = Object.values(fieldSources).filter((source) => source === 'ai-prefill').length;

  return (
    <div className="avel-dashboard-page avel-candidate-edit-page">
      <PageContainer
        title={pageTitle}
        subtitle={pageSubtitle}
        actions={(
          <>
            <button
              type="button"
              className="modern-btn modern-btn--emphasis avel-candidate-edit-ai-top"
              onClick={runAIPrefill}
              disabled={!aiCanRunPrefillTopAction}
              title={aiTopActionDisabledReason || 'Extract CV details with AI'}
            >
              {aiPrefillPending ? 'AI Extraction Running...' : 'Extract CV Details'}
            </button>
            <a className="modern-btn modern-btn--secondary" href={backURL}>
              {backLabel}
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel avel-candidate-edit-panel avel-candidate-edit-panel--add avel-candidate-edit-panel--compact avel-candidate-edit-panel--workbench">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Candidate Details</h2>
              <p className="avel-list-panel__hint">Required fields: First Name, Last Name.</p>
            </div>

            <form
              ref={formRef}
              id="modernCandidateAddForm"
              className="avel-candidate-edit-form avel-candidate-edit-form--compact"
              method="post"
              encType="multipart/form-data"
              action={submitURL}
              onSubmit={async (event) => {
                const formElement = event.currentTarget;
                setValidationError('');
                if (formState.firstName.trim() === '' || formState.lastName.trim() === '') {
                  event.preventDefault();
                  setValidationError('First Name and Last Name are required.');
                  return;
                }
                if (formState.gdprSigned === '1' && formState.gdprExpirationDate.trim() === '') {
                  event.preventDefault();
                  setValidationError('GDPR Expiration Date is required when GDPR Signed is Yes.');
                  return;
                }

                if (softOverrideAccepted) {
                  return;
                }

                event.preventDefault();
                setDuplicateChecking(true);
                setDuplicateError('');
                try {
                  const duplicateResult = await fetchCandidateDuplicateCheck({
                    firstName: formState.firstName,
                    lastName: formState.lastName,
                    email: formState.email1,
                    phone: formState.phoneCell,
                    city: formState.city,
                    country: formState.country
                  });

                  const hasHardMatches = duplicateResult.hardMatches.length > 0;
                  const hasSoftMatches = duplicateResult.softMatches.length > 0;
                  setHardMatches(duplicateResult.hardMatches);
                  setSoftMatches(duplicateResult.softMatches);

                  if (hasHardMatches) {
                    setDuplicateMode('hard');
                    return;
                  }

                  if (hasSoftMatches) {
                    setDuplicateMode('soft');
                    return;
                  }

                  setDuplicateMode('none');
                  formElement.submit();
                } catch (duplicateCheckError) {
                  const message = duplicateCheckError instanceof Error ? duplicateCheckError.message : 'Duplicate check failed.';
                  setDuplicateError(message);
                  setDuplicateMode('none');
                } finally {
                  setDuplicateChecking(false);
                }
              }}
            >
              <input type="hidden" name="postback" value="postback" />
              {isJobOrderQuickAddMode && hasValidJobOrderID ? (
                <input type="hidden" name="jobOrderID" value={String(jobOrderID)} />
              ) : null}
              <input type="hidden" name="sourceCSV" value={sourceCSV} />
              <input type="hidden" name="dup_soft_override" value={softOverrideAccepted ? '1' : '0'} />
              <input type="hidden" name="documentTempFile" id="documentTempFile" value={resumeTempFile} />
              <input type="hidden" name="gender" value={formState.gender} />
              <input type="hidden" name="race" value={formState.race} />
              <input type="hidden" name="veteran" value={formState.veteran} />
              <input type="hidden" name="disability" value={formState.disability} />

              <div className="avel-candidate-form-strip">
                <span className="modern-chip modern-chip--info">Required: First Name, Last Name</span>
                <span className="modern-chip modern-chip--warning">Duplicate Protection: Enabled</span>
                <span className="modern-chip">Flow: Add + Validate + Save</span>
                {parseLimitText !== '' ? <span className="modern-chip modern-chip--source-other">{parseLimitText}</span> : null}
              </div>

              {data.resumeImport.isParsingEnabled ? (
                <div className="avel-candidate-edit-extra">
                  <div className="avel-list-panel__header">
                    <h3 className="avel-list-panel__title">Resume Import & AI Extraction</h3>
                    <p className="avel-list-panel__hint">Upload CV content, then extract details with AI (TalentFitFlow).</p>
                  </div>

                  <div className="avel-candidate-provenance">
                    <span className="modern-chip modern-chip--success">AI-updated fields: {aiFieldCount}</span>
                    <span className="avel-field-source-badge avel-field-source-badge--ai-prefill">AI</span>
                    <span className="avel-field-source-help">Values generated by TalentFitFlow extraction.</span>
                  </div>

                  <div className="avel-candidate-import-row">
                    <label className="modern-command-field avel-candidate-import-row__file">
                      <span className="modern-command-label">CV File</span>
                      <input
                        className="avel-form-control"
                        type="file"
                        name="documentFile"
                        id="documentFile"
                        ref={resumeFileInputRef}
                        onChange={(event) => setResumeUploadFile(event.target.files?.[0] || null)}
                      />
                    </label>
                    <div className="modern-table-actions avel-candidate-import-row__actions">
                      <button
                        type="button"
                        className="modern-btn modern-btn--secondary"
                        onClick={() => runResumeAction('upload')}
                        disabled={resumeActionPending !== 'none' || aiPrefillPending}
                      >
                        {resumeActionPending === 'upload' ? 'Uploading...' : 'Upload CV'}
                      </button>
                      <button
                        type="button"
                        className="modern-btn modern-btn--secondary"
                        onClick={runAIPrefill}
                        disabled={aiPrefillPending || resumeActionPending !== 'none'}
                      >
                        {aiPrefillPending ? 'AI Extraction Running...' : 'Extract With AI'}
                      </button>
                      {aiUndoSnapshot ? (
                        <button
                          type="button"
                          className="modern-btn modern-btn--secondary"
                          onClick={() => {
                            if (!aiUndoSnapshot) {
                              return;
                            }
                            setFormState({
                              ...aiUndoSnapshot,
                              extraFields: { ...aiUndoSnapshot.extraFields }
                            });
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
                            setAiPrefillStatus('AI extraction undone.');
                            setAiPrefillError('');
                          }}
                        >
                          Undo AI Extraction
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="modern-btn modern-btn--secondary"
                        onClick={() => {
                          setResumeUploadFile(null);
                          setResumeTempFile('');
                          setResumeText('');
                          if (resumeFileInputRef.current) {
                            resumeFileInputRef.current.value = '';
                          }
                          setAiPrefillStatus('');
                          setAiPrefillError('');
                        }}
                      >
                        Clear Resume
                      </button>
                    </div>
                  </div>

                  <div className="avel-candidate-edit-grid">
                    <label className="modern-command-field avel-candidate-edit-field--full">
                      <span className="modern-command-label">Resume Text</span>
                      <textarea
                        className="avel-form-control avel-form-control--compact-text"
                        name="documentText"
                        id="documentText"
                        value={resumeText}
                        onChange={(event) => setResumeText(event.target.value)}
                        rows={5}
                        placeholder="Paste resume text or upload a CV file."
                      />
                    </label>
                  </div>

                  {resumeTempFile.trim() !== '' ? (
                    <div className="modern-state">
                      Uploaded temp file: <strong>{resumeTempFile}</strong>
                    </div>
                  ) : null}
                  {aiPrefillStatus !== '' ? <div className="modern-state">{aiPrefillStatus}</div> : null}
                  {resumeActionError !== '' ? <div className="modern-state modern-state--error" role="alert">{resumeActionError}</div> : null}
                  {aiPrefillError !== '' ? <div className="modern-state modern-state--error" role="alert">{aiPrefillError}</div> : null}
                </div>
              ) : null}

              <div className="avel-candidate-edit-sections">
                <section className="avel-candidate-edit-section avel-candidate-edit-section--status">
                  <div className="avel-candidate-form-divider avel-candidate-form-divider--status">
                    <strong>Profile Status & GDPR</strong>
                    <span>GDPR controls used by legacy validation and reporting.</span>
                  </div>
                  <div className="avel-candidate-edit-grid">
                    <input type="hidden" name="gdprSigned" value={formState.gdprSigned} />
                    <SelectMenu
                      label="GDPR Signed"
                      value={formState.gdprSigned}
                      options={gdprOptions}
                      className="modern-command-field avel-candidate-edit-field--span-2"
                      onChange={(value) => setFormState((current) => (current ? { ...current, gdprSigned: value as '0' | '1' } : current))}
                    />

                    <label className={getFieldContainerClassName('modern-command-field', formState.gdprExpirationDate)}>
                      <span className="modern-command-label">GDPR Expiration</span>
                      <input type="hidden" name="gdprExpirationDate" value={formState.gdprExpirationDate} />
                      <input
                        className={`avel-form-control${isBlankValue(formState.gdprExpirationDate) ? ' avel-form-control--missing' : ''}`}
                        type="date"
                        value={toISODateInput(formState.gdprExpirationDate)}
                        onChange={(event) =>
                          setFormState((current) =>
                            current ? { ...current, gdprExpirationDate: toLegacyShortDate(event.target.value) } : current
                          )
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
                    <label className={getFieldContainerClassName('modern-command-field', formState.firstName)}>
                      {renderFieldLabel('First Name *', 'firstName')}
                      <input
                        className={getFieldClassName('firstName', formState.firstName)}
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

                    <label className={getFieldContainerClassName('modern-command-field', formState.lastName)}>
                      {renderFieldLabel('Last Name *', 'lastName')}
                      <input
                        className={getFieldClassName('lastName', formState.lastName)}
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

                    <label className={getFieldContainerClassName('modern-command-field', formState.email1)}>
                      {renderFieldLabel('Email', 'email1')}
                      <input
                        className={getFieldClassName('email1', formState.email1)}
                        type="email"
                        name="email1"
                        value={formState.email1}
                        onChange={(event) => {
                          clearFieldSource('email1');
                          setFormState((current) => (current ? { ...current, email1: event.target.value } : current));
                        }}
                      />
                    </label>

                    <label className={getFieldContainerClassName('modern-command-field', formState.phoneCell)}>
                      {renderFieldLabel('Cell Phone', 'phoneCell')}
                      <input
                        className={getFieldClassName('phoneCell', formState.phoneCell)}
                        type="text"
                        name="phoneCell"
                        value={formState.phoneCell}
                        onChange={(event) => {
                          clearFieldSource('phoneCell');
                          setFormState((current) => (current ? { ...current, phoneCell: event.target.value } : current));
                        }}
                      />
                    </label>

                    <label className={getFieldContainerClassName('modern-command-field', formState.city)}>
                      {renderFieldLabel('City', 'city')}
                      <input
                        className={getFieldClassName('city', formState.city)}
                        type="text"
                        name="city"
                        value={formState.city}
                        onChange={(event) => {
                          clearFieldSource('city');
                          setFormState((current) => (current ? { ...current, city: event.target.value } : current));
                        }}
                      />
                    </label>

                    <label className={getFieldContainerClassName('modern-command-field', formState.country)}>
                      {renderFieldLabel('Country', 'country')}
                      <input
                        className={getFieldClassName('country', formState.country)}
                        type="text"
                        name="country"
                        value={formState.country}
                        onChange={(event) => {
                          clearFieldSource('country');
                          setFormState((current) => (current ? { ...current, country: event.target.value } : current));
                        }}
                      />
                    </label>

                    <label className={getFieldContainerClassName('modern-command-field', formState.bestTimeToCall)}>
                      <span className="modern-command-label">Best Time To Call</span>
                      <input
                        className={`avel-form-control${isBlankValue(formState.bestTimeToCall) ? ' avel-form-control--missing' : ''}`}
                        type="text"
                        name="bestTimeToCall"
                        value={formState.bestTimeToCall}
                        onChange={(event) => setFormState((current) => (current ? { ...current, bestTimeToCall: event.target.value } : current))}
                      />
                    </label>

                    <label className={getFieldContainerClassName('modern-command-field', formState.dateAvailable)}>
                      <span className="modern-command-label">Date Available</span>
                      <input type="hidden" name="dateAvailable" value={formState.dateAvailable} />
                      <input
                        className={`avel-form-control${isBlankValue(formState.dateAvailable) ? ' avel-form-control--missing' : ''}`}
                        type="date"
                        value={toISODateInput(formState.dateAvailable)}
                        onChange={(event) =>
                          setFormState((current) => (current ? { ...current, dateAvailable: toLegacyShortDate(event.target.value) } : current))
                        }
                      />
                    </label>

                    <label className={getFieldContainerClassName('modern-command-field avel-candidate-edit-field--span-3', formState.address)}>
                      {renderFieldLabel('Address', 'address')}
                      <textarea
                        className={getFieldClassName('address', formState.address)}
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
                    <strong>Sourcing</strong>
                    <span>Track profile origin and current company context.</span>
                  </div>
                  <div className="avel-candidate-edit-grid">
                    <input type="hidden" name="source" value={formState.source} />
                    <SelectMenu
                      label="Source"
                      value={formState.source}
                      options={sourceOptions.length > 0 ? sourceOptions : [{ value: '(none)', label: '(None)' }]}
                      className={getFieldContainerClassName('modern-command-field avel-candidate-edit-field--span-2', formState.source, true)}
                      onChange={(value) => {
                        setSourceNotice('');
                        setFormState((current) => (current ? { ...current, source: value } : current));
                      }}
                    />

                    <div className="modern-command-field avel-candidate-source-add">
                      <span className="modern-command-label">Add New Source</span>
                      <div className="avel-candidate-source-add__row">
                        <input
                          className={`avel-form-control${isBlankValue(newSourceDraft) ? ' avel-form-control--missing' : ''}`}
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

                    <label className={getFieldContainerClassName('modern-command-field', formState.currentEmployer)}>
                      {renderFieldLabel('Current Employer', 'currentEmployer')}
                      <input
                        className={getFieldClassName('currentEmployer', formState.currentEmployer)}
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
                    <span>Comp package expectations and recruiter context.</span>
                  </div>
                  <div className="avel-candidate-edit-grid">
                    <label className={getFieldContainerClassName('modern-command-field', formState.currentPay)}>
                      <span className="modern-command-label">Current Pay</span>
                      <input
                        className={`avel-form-control${isBlankValue(formState.currentPay) ? ' avel-form-control--missing' : ''}`}
                        type="text"
                        name="currentPay"
                        value={formState.currentPay}
                        onChange={(event) => setFormState((current) => (current ? { ...current, currentPay: event.target.value } : current))}
                      />
                    </label>

                    <label className={getFieldContainerClassName('modern-command-field', formState.desiredPay)}>
                      <span className="modern-command-label">Desired Pay</span>
                      <input
                        className={`avel-form-control${isBlankValue(formState.desiredPay) ? ' avel-form-control--missing' : ''}`}
                        type="text"
                        name="desiredPay"
                        value={formState.desiredPay}
                        onChange={(event) => setFormState((current) => (current ? { ...current, desiredPay: event.target.value } : current))}
                      />
                    </label>

                    <label className={getFieldContainerClassName('modern-command-field avel-candidate-edit-field--span-3', formState.keySkills)}>
                      {renderFieldLabel('Key Skills', 'keySkills')}
                      <textarea
                        className={getFieldClassName('keySkills', formState.keySkills)}
                        name="keySkills"
                        value={formState.keySkills}
                        onChange={(event) => {
                          clearFieldSource('keySkills');
                          setFormState((current) => (current ? { ...current, keySkills: event.target.value } : current));
                        }}
                        rows={2}
                      />
                    </label>

                    <label className={getFieldContainerClassName('modern-command-field avel-candidate-edit-field--span-3', formState.notes)}>
                      {renderFieldLabel('Notes', 'notes')}
                      <MarkdownTextarea
                        name="notes"
                        value={formState.notes}
                        rows={6}
                        className={getEditorClassName('notes', formState.notes)}
                        ariaLabel="Candidate notes"
                        onChange={(nextValue) => {
                          clearFieldSource('notes');
                          setFormState((current) => (current ? { ...current, notes: nextValue } : current));
                        }}
                      />
                    </label>
                  </div>
                </section>
                <section className="avel-candidate-edit-section avel-candidate-edit-section--custom">
                  <div className="avel-candidate-form-divider avel-candidate-form-divider--custom">
                    <strong>Additional Profile Details</strong>
                    <span>Relocation preferences and optional fields configured in legacy settings.</span>
                  </div>
                  <div className="avel-candidate-edit-grid">
                    <label className="modern-command-toggle avel-candidate-edit-field--span-2">
                      <input
                        type="checkbox"
                        name="canRelocate"
                        checked={formState.canRelocate}
                        onChange={(event) => setFormState((current) => (current ? { ...current, canRelocate: event.target.checked } : current))}
                      />
                      <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                      <span>Open To Relocation</span>
                    </label>

                    {data.extraFields.length > 0 ? (
                      data.extraFields.map((field) => {
                        const fieldClassName = getFieldContainerClassName(
                          `modern-command-field${
                            field.inputType === 'textarea' || field.inputType === 'radio'
                              ? ' avel-candidate-edit-field--full'
                              : ''
                          }`,
                          formState.extraFields[field.postKey] || ''
                        );
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
                                className={fieldClassName}
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
                      })
                    ) : (
                      <div className="modern-state">No additional legacy fields are configured for this tenant.</div>
                    )}
                  </div>
                </section>
              </div>

              {duplicateChecking ? <div className="modern-state">Checking for potential duplicates...</div> : null}
              {validationError !== '' ? <div className="modern-state modern-state--error" role="alert">{validationError}</div> : null}
              {duplicateError !== '' ? <div className="modern-state modern-state--error" role="alert">{duplicateError}</div> : null}

              {duplicateMode !== 'none' ? (
                <div className={`avel-candidate-duplicates avel-candidate-duplicates--${duplicateMode}`}>
                  <div className="avel-list-panel__header">
                    <h3 className="avel-list-panel__title">
                      {duplicateMode === 'hard' ? 'Potential Existing Candidate Found' : 'Possible Duplicate Candidates'}
                    </h3>
                    <p className="avel-list-panel__hint">
                      {duplicateMode === 'hard'
                        ? 'A strong match exists by email or phone. Open the existing profile instead of creating a duplicate.'
                        : 'Review similar profiles. You can continue if this is a genuinely new person.'}
                    </p>
                  </div>
                  <DataTable
                    columns={[
                      { key: 'candidate', title: 'Candidate' },
                      { key: 'contact', title: 'Contact' },
                      { key: 'location', title: 'Location' },
                      { key: 'status', title: 'Status' },
                      { key: 'reasons', title: 'Match Reasons' }
                    ]}
                    hasRows={(duplicateMode === 'hard' ? hardMatches : softMatches).length > 0}
                    emptyMessage="No duplicate suggestions."
                  >
                    {(duplicateMode === 'hard' ? hardMatches : softMatches).map((match) => (
                      <tr key={`${duplicateMode}-${match.candidate_id}`}>
                        <td>
                          <a
                            className="modern-link"
                            href={ensureModernUIURL(`${bootstrap.indexName}?m=candidates&a=show&candidateID=${match.candidate_id}&ui=modern`)}
                          >
                            {match.name || `Candidate #${match.candidate_id}`}
                          </a>
                        </td>
                        <td>
                          {match.email || '--'}
                          <br />
                          {match.phone || '--'}
                        </td>
                        <td>{[match.city, match.country].filter((item) => String(item || '').trim() !== '').join(', ') || '--'}</td>
                        <td>{match.status || '--'}</td>
                        <td>{(match.matchReasons || []).join(', ') || '--'}</td>
                      </tr>
                    ))}
                  </DataTable>
                </div>
              ) : null}

              <div className="modern-table-actions avel-candidate-edit-actions">
                {duplicateMode === 'soft' ? (
                  <button
                    type="button"
                    className="modern-btn modern-btn--emphasis"
                    onClick={() => {
                      setSoftOverrideAccepted(true);
                      formRef.current?.submit();
                    }}
                  >
                    Create Candidate Anyway
                  </button>
                ) : (
                <button type="submit" className="modern-btn modern-btn--emphasis">
                  Create Candidate
                </button>
                )}
                {duplicateMode === 'hard' ? (
                  <button
                    type="button"
                    className="modern-btn modern-btn--secondary"
                    onClick={() => {
                      setDuplicateMode('none');
                      setHardMatches([]);
                      setSoftMatches([]);
                    }}
                  >
                    Dismiss Warning
                  </button>
                ) : null}
                <a className="modern-btn modern-btn--secondary" href={backURL}>
                  Cancel
                </a>
              </div>
            </form>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
