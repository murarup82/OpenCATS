import { useEffect, useRef, useState } from 'react';
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
  const [resumeActionPending, setResumeActionPending] = useState<'none' | 'upload' | 'parse'>('none');
  const [resumeActionError, setResumeActionError] = useState('');
  const [aiPrefillPending, setAiPrefillPending] = useState(false);
  const [aiPrefillStatus, setAiPrefillStatus] = useState('');
  const [aiPrefillError, setAiPrefillError] = useState('');
  const [aiUndoSnapshot, setAiUndoSnapshot] = useState<CandidateAddFormState | null>(null);

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
        setFormState(toFormState(result));
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

  useEffect(() => {
    setSoftOverrideAccepted(false);
    setDuplicateMode('none');
    setHardMatches([]);
    setSoftMatches([]);
    setDuplicateError('');
    setValidationError('');
  }, [formState?.firstName, formState?.lastName, formState?.email1, formState?.phoneCell, formState?.city, formState?.country]);

  const runResumeAction = async (mode: 'upload' | 'parse') => {
    if (!data || !formState || resumeActionPending !== 'none') {
      return;
    }

    if (mode === 'upload' && !resumeUploadFile) {
      setResumeActionError('Select a CV file first.');
      return;
    }

    if (mode === 'parse' && !resumeUploadFile && resumeText.trim() === '' && resumeTempFile.trim() === '') {
      setResumeActionError('Provide resume text or upload a CV file first.');
      return;
    }

    const formData = new FormData();
    formData.set('postback', 'postback');
    formData.set('sourceCSV', data.options.sourceCSV || '');
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

    Object.entries(formState.extraFields).forEach(([postKey, value]) => {
      formData.set(postKey, value);
    });

    if (mode === 'upload' || resumeUploadFile) {
      formData.set('loadDocument', 'true');
      if (resumeUploadFile) {
        formData.set('documentFile', resumeUploadFile);
      }
    }
    if (mode === 'parse') {
      formData.set('parseDocument', 'true');
    }

    setResumeActionPending(mode);
    setResumeActionError('');
    setAiPrefillStatus('');
    setAiPrefillError('');
    try {
      const response = await submitCandidatesAddResumeAction(bootstrap, formData);
      setData(response);
      setFormState((current) => {
        const next = toFormState(response);
        if (!current) {
          return next;
        }
        return {
          ...next,
          extraFields: {
            ...current.extraFields,
            ...next.extraFields
          }
        };
      });
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
    if (!formState || aiPrefillPending) {
      return;
    }
    if (resumeTempFile.trim() === '') {
      setAiPrefillError('Upload CV content first so AI can parse it.');
      return;
    }

    setAiPrefillPending(true);
    setAiPrefillError('');
    setAiPrefillStatus('Submitting AI prefill request...');
    setAiUndoSnapshot({ ...formState, extraFields: { ...formState.extraFields } });

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
        throw new Error(statusResult.errorMessage || `AI prefill failed with status "${status || 'UNKNOWN'}".`);
      }

      setFormState((current) => {
        if (!current) {
          return current;
        }
        return mergeAIPrefillIntoFormState(current, statusResult.candidate);
      });
      setAiPrefillStatus('AI prefill applied. Review values before saving.');
    } catch (prefillError) {
      setAiPrefillError(prefillError instanceof Error ? prefillError.message : 'AI prefill failed.');
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

  const submitURL = data.actions.submitURL || `${bootstrap.indexName}?m=candidates&a=add&ui=modern`;
  const listURL = data.actions.listURL || `${bootstrap.indexName}?m=candidates&a=listByView&ui=modern`;
  const sourceOptions: SelectMenuOption[] = data.options.sources.map((option) => ({
    value: option.value,
    label: option.label
  }));
  const gdprOptions: SelectMenuOption[] = [
    { value: '0', label: 'No' },
    { value: '1', label: 'Yes' }
  ];
  const genderOptions: SelectMenuOption[] = [
    { value: '', label: '----' },
    { value: 'm', label: 'Male' },
    { value: 'f', label: 'Female' }
  ];
  const ethnicityOptions: SelectMenuOption[] = [
    { value: '', label: '----' },
    { value: '1', label: 'American Indian' },
    { value: '2', label: 'Asian or Pacific Islander' },
    { value: '3', label: 'Hispanic or Latino' },
    { value: '4', label: 'Non-Hispanic Black' },
    { value: '5', label: 'Non-Hispanic White' }
  ];
  const veteranOptions: SelectMenuOption[] = [
    { value: '', label: '----' },
    { value: '1', label: 'No' },
    { value: '2', label: 'Eligible Veteran' },
    { value: '3', label: 'Disabled Veteran' },
    { value: '4', label: 'Eligible and Disabled' }
  ];
  const disabilityOptions: SelectMenuOption[] = [
    { value: '', label: '----' },
    { value: 'No', label: 'No' },
    { value: 'Yes', label: 'Yes' }
  ];

  return (
    <div className="avel-dashboard-page avel-candidate-edit-page">
      <PageContainer
        title="Add Candidate"
        subtitle="Modern candidate creation form. Save action uses the proven legacy backend."
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={listURL}>
              Back To Candidates
            </a>
            <a className="modern-btn modern-btn--secondary" href={data.actions.legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel avel-candidate-edit-panel avel-candidate-edit-panel--add">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Candidate Details</h2>
              <p className="avel-list-panel__hint">Required fields: First Name, Last Name.</p>
            </div>

            <form
              ref={formRef}
              id="modernCandidateAddForm"
              className="avel-candidate-edit-form"
              method="post"
              encType="multipart/form-data"
              action={submitURL}
              onSubmit={async (event) => {
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
                  event.currentTarget.submit();
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
              <input type="hidden" name="sourceCSV" value={data.options.sourceCSV || ''} />
              <input type="hidden" name="dup_soft_override" value={softOverrideAccepted ? '1' : '0'} />
              <input type="hidden" name="documentTempFile" id="documentTempFile" value={resumeTempFile} />

              <div className="avel-candidate-form-strip">
                <span className="modern-chip modern-chip--info">Required: First Name, Last Name</span>
                <span className="modern-chip modern-chip--warning">Duplicate Protection: Enabled</span>
                <span className="modern-chip">Flow: Add + Validate + Save</span>
              </div>

              {data.resumeImport.isParsingEnabled ? (
                <div className="avel-candidate-edit-extra">
                  <div className="avel-list-panel__header">
                    <h3 className="avel-list-panel__title">Resume Import & AI Prefill</h3>
                    <p className="avel-list-panel__hint">Upload CV content, parse core fields, then run AI prefill (TalentFitFlow).</p>
                  </div>

                  <div className="avel-candidate-edit-grid">
                    <label className="modern-command-field avel-candidate-edit-field--full">
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

                    <label className="modern-command-field avel-candidate-edit-field--full">
                      <span className="modern-command-label">Resume Text</span>
                      <textarea
                        className="avel-form-control"
                        name="documentText"
                        id="documentText"
                        value={resumeText}
                        onChange={(event) => setResumeText(event.target.value)}
                        rows={8}
                        placeholder="Paste resume text or upload a CV file."
                      />
                    </label>
                  </div>

                  <div className="modern-table-actions">
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
                      onClick={() => runResumeAction('parse')}
                      disabled={resumeActionPending !== 'none' || aiPrefillPending}
                    >
                      {resumeActionPending === 'parse' ? 'Parsing...' : 'Parse Resume'}
                    </button>
                    <button
                      type="button"
                      className="modern-btn modern-btn--secondary"
                      onClick={runAIPrefill}
                      disabled={aiPrefillPending || resumeActionPending !== 'none'}
                    >
                      {aiPrefillPending ? 'AI Prefill Running...' : 'AI Prefill'}
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
                          setAiUndoSnapshot(null);
                          setAiPrefillStatus('AI prefill undone.');
                          setAiPrefillError('');
                        }}
                      >
                        Undo AI Prefill
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

                  {resumeTempFile.trim() !== '' ? (
                    <div className="modern-state">
                      Uploaded temp file: <strong>{resumeTempFile}</strong>
                    </div>
                  ) : null}
                  {aiPrefillStatus !== '' ? <div className="modern-state">{aiPrefillStatus}</div> : null}
                  {resumeActionError !== '' ? <div className="modern-state modern-state--error">{resumeActionError}</div> : null}
                  {aiPrefillError !== '' ? <div className="modern-state modern-state--error">{aiPrefillError}</div> : null}
                </div>
              ) : null}

              <div className="avel-candidate-edit-grid">
                <div className="avel-candidate-form-divider avel-candidate-edit-field--full">
                  <strong>Identity & Contact</strong>
                  <span>Core profile identity and communication data.</span>
                </div>
                <label className="modern-command-field">
                  <span className="modern-command-label">First Name *</span>
                  <input
                    className="avel-form-control"
                    type="text"
                    name="firstName"
                    value={formState.firstName}
                    onChange={(event) => setFormState((current) => (current ? { ...current, firstName: event.target.value } : current))}
                    required
                  />
                </label>

                <label className="modern-command-field">
                  <span className="modern-command-label">Last Name *</span>
                  <input
                    className="avel-form-control"
                    type="text"
                    name="lastName"
                    value={formState.lastName}
                    onChange={(event) => setFormState((current) => (current ? { ...current, lastName: event.target.value } : current))}
                    required
                  />
                </label>

                <label className="modern-command-field">
                  <span className="modern-command-label">Email</span>
                  <input
                    className="avel-form-control"
                    type="email"
                    name="email1"
                    value={formState.email1}
                    onChange={(event) => setFormState((current) => (current ? { ...current, email1: event.target.value } : current))}
                  />
                </label>

                <label className="modern-command-field">
                  <span className="modern-command-label">Cell Phone</span>
                  <input
                    className="avel-form-control"
                    type="text"
                    name="phoneCell"
                    value={formState.phoneCell}
                    onChange={(event) => setFormState((current) => (current ? { ...current, phoneCell: event.target.value } : current))}
                  />
                </label>

                <label className="modern-command-field">
                  <span className="modern-command-label">City</span>
                  <input
                    className="avel-form-control"
                    type="text"
                    name="city"
                    value={formState.city}
                    onChange={(event) => setFormState((current) => (current ? { ...current, city: event.target.value } : current))}
                  />
                </label>

                <label className="modern-command-field">
                  <span className="modern-command-label">Country</span>
                  <input
                    className="avel-form-control"
                    type="text"
                    name="country"
                    value={formState.country}
                    onChange={(event) => setFormState((current) => (current ? { ...current, country: event.target.value } : current))}
                  />
                </label>

                <div className="avel-candidate-form-divider avel-candidate-edit-field--full">
                  <strong>Availability & Source</strong>
                  <span>When candidate is reachable and where profile originates.</span>
                </div>
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
                  <span className="modern-command-label">Date Available (MM-DD-YY)</span>
                  <input
                    className="avel-form-control"
                    type="text"
                    name="dateAvailable"
                    value={formState.dateAvailable}
                    onChange={(event) => setFormState((current) => (current ? { ...current, dateAvailable: event.target.value } : current))}
                  />
                </label>

                <input type="hidden" name="source" value={formState.source} />
                <SelectMenu
                  label="Source"
                  value={formState.source}
                  options={sourceOptions}
                  onChange={(value) => setFormState((current) => (current ? { ...current, source: value } : current))}
                />

                <input type="hidden" name="gdprSigned" value={formState.gdprSigned} />
                <SelectMenu
                  label="GDPR Signed"
                  value={formState.gdprSigned}
                  options={gdprOptions}
                  onChange={(value) => setFormState((current) => (current ? { ...current, gdprSigned: value as '0' | '1' } : current))}
                />

                <label className="modern-command-field">
                  <span className="modern-command-label">GDPR Expiration (MM-DD-YY)</span>
                  <input
                    className="avel-form-control"
                    type="text"
                    name="gdprExpirationDate"
                    value={formState.gdprExpirationDate}
                    onChange={(event) => setFormState((current) => (current ? { ...current, gdprExpirationDate: event.target.value } : current))}
                  />
                </label>

                <label className="modern-command-field">
                  <span className="modern-command-label">Current Employer</span>
                  <input
                    className="avel-form-control"
                    type="text"
                    name="currentEmployer"
                    value={formState.currentEmployer}
                    onChange={(event) => setFormState((current) => (current ? { ...current, currentEmployer: event.target.value } : current))}
                  />
                </label>

                <div className="avel-candidate-form-divider avel-candidate-edit-field--full">
                  <strong>Compensation & Narrative</strong>
                  <span>Comp package expectations plus role-fit context for recruiters.</span>
                </div>
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

                <label className="modern-command-field avel-candidate-edit-field--full">
                  <span className="modern-command-label">Address</span>
                  <textarea
                    className="avel-form-control"
                    name="address"
                    value={formState.address}
                    onChange={(event) => setFormState((current) => (current ? { ...current, address: event.target.value } : current))}
                    rows={2}
                  />
                </label>

                <label className="modern-command-field avel-candidate-edit-field--full">
                  <span className="modern-command-label">Key Skills</span>
                  <textarea
                    className="avel-form-control"
                    name="keySkills"
                    value={formState.keySkills}
                    onChange={(event) => setFormState((current) => (current ? { ...current, keySkills: event.target.value } : current))}
                    rows={2}
                  />
                </label>

                <label className="modern-command-field avel-candidate-edit-field--full">
                  <span className="modern-command-label">Notes</span>
                  <textarea
                    className="avel-form-control"
                    name="notes"
                    value={formState.notes}
                    onChange={(event) => setFormState((current) => (current ? { ...current, notes: event.target.value } : current))}
                    rows={4}
                  />
                </label>
              </div>

              <div className="avel-candidate-form-divider">
                <strong>Mobility & Compliance Attributes</strong>
                <span>Controls used for relocation and compliance reporting.</span>
              </div>
              <div className="avel-candidate-edit-toggles">
                <label className="modern-command-toggle">
                  <input
                    type="checkbox"
                    name="canRelocate"
                    checked={formState.canRelocate}
                    onChange={(event) => setFormState((current) => (current ? { ...current, canRelocate: event.target.checked } : current))}
                  />
                  <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                  <span>Can Relocate</span>
                </label>
              </div>

              <div className="avel-candidate-edit-grid">
                <input type="hidden" name="gender" value={formState.gender} />
                <SelectMenu
                  label="Gender"
                  value={formState.gender}
                  options={genderOptions}
                  onChange={(value) => setFormState((current) => (current ? { ...current, gender: value } : current))}
                />

                <input type="hidden" name="race" value={formState.race} />
                <SelectMenu
                  label="Ethnicity"
                  value={formState.race}
                  options={ethnicityOptions}
                  onChange={(value) => setFormState((current) => (current ? { ...current, race: value } : current))}
                />

                <input type="hidden" name="veteran" value={formState.veteran} />
                <SelectMenu
                  label="Veteran Status"
                  value={formState.veteran}
                  options={veteranOptions}
                  onChange={(value) => setFormState((current) => (current ? { ...current, veteran: value } : current))}
                />

                <input type="hidden" name="disability" value={formState.disability} />
                <SelectMenu
                  label="Disability Status"
                  value={formState.disability}
                  options={disabilityOptions}
                  onChange={(value) => setFormState((current) => (current ? { ...current, disability: value } : current))}
                />
              </div>

              {data.extraFields.length > 0 ? (
                <div className="avel-candidate-edit-extra avel-candidate-edit-extra--custom">
                  <div className="avel-list-panel__header">
                    <h3 className="avel-list-panel__title">Custom Fields</h3>
                    <p className="avel-list-panel__hint">Configured per tenant in legacy settings.</p>
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

              {duplicateChecking ? <div className="modern-state">Checking for potential duplicates...</div> : null}
              {validationError !== '' ? <div className="modern-state modern-state--error">{validationError}</div> : null}
              {duplicateError !== '' ? <div className="modern-state modern-state--error">{duplicateError}</div> : null}

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
                <a className="modern-btn modern-btn--secondary" href={listURL}>
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
