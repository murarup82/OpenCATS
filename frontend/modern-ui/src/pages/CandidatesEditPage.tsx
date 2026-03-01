import { useCallback, useEffect, useState } from 'react';
import { fetchCandidatesEditModernData } from '../lib/api';
import type { CandidatesEditModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { DataTable } from '../components/primitives/DataTable';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type CandidateExtraField = CandidatesEditModernDataResponse['extraFields'][number];

type PopupCallback = ((returnValue?: unknown) => void) | null;

type PopupWindow = Window & {
  showPopWin?: (url: string, width: number, height: number, returnFunc?: PopupCallback) => void;
};

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

function toDisplayText(value: unknown, fallback = '--'): string {
  const text = String(value ?? '').trim();
  return text === '' ? fallback : text;
}

export function CandidatesEditPage({ bootstrap }: Props) {
  const [data, setData] = useState<CandidatesEditModernDataResponse | null>(null);
  const [formState, setFormState] = useState<CandidateEditFormState | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [serverQueryString] = useState<string>(() => new URLSearchParams(window.location.search).toString());
  const [reloadToken, setReloadToken] = useState(0);
  const [validationError, setValidationError] = useState('');

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
  }, [bootstrap, serverQueryString, reloadToken]);

  useEffect(() => {
    setValidationError('');
  }, [formState?.firstName, formState?.lastName, formState?.gdprSigned, formState?.gdprExpirationDate]);

  const refreshPageData = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);

  const openLegacyPopup = useCallback(
    (url: string, width: number, height: number, refreshOnClose: boolean) => {
      const popupWindow = window as PopupWindow;
      const popupURL = decodeLegacyURL(url);
      if (typeof popupWindow.showPopWin === 'function') {
        popupWindow.showPopWin(
          popupURL,
          width,
          height,
          refreshOnClose
            ? () => {
                refreshPageData();
              }
            : null
        );
        return;
      }

      window.location.href = popupURL;
    },
    [refreshPageData]
  );

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

  return (
    <div className="avel-dashboard-page avel-candidate-edit-page">
      <PageContainer
        title={`Edit Candidate #${data.meta.candidateID}`}
        subtitle="Modern candidate editing workspace. Save action uses the proven legacy backend."
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
          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Candidate Details</h2>
              <p className="avel-list-panel__hint">Required fields: First Name, Last Name, Owner.</p>
            </div>

            <form
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
              <input type="hidden" name="sourceCSV" value={data.options.sourceCSV || ''} />

              <div className="avel-candidate-edit-grid">
                {validationError !== '' ? (
                  <div className="modern-state modern-state--error avel-candidate-edit-field--full">{validationError}</div>
                ) : null}
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

                <label className="modern-command-field">
                  <span className="modern-command-label">Source</span>
                  <select
                    className="avel-form-control"
                    name="source"
                    value={formState.source}
                    onChange={(event) => setFormState((current) => (current ? { ...current, source: event.target.value } : current))}
                  >
                    {data.options.sources.map((option) => (
                      <option key={`${option.value}-${option.label}`} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="modern-command-field">
                  <span className="modern-command-label">Owner *</span>
                  <select
                    className="avel-form-control"
                    name="owner"
                    value={formState.owner}
                    onChange={(event) => setFormState((current) => (current ? { ...current, owner: event.target.value } : current))}
                    required
                  >
                    {data.options.owners.map((option) => (
                      <option key={`${option.value}-${option.label}`} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="modern-command-field">
                  <span className="modern-command-label">GDPR Signed</span>
                  <select
                    className="avel-form-control"
                    name="gdprSigned"
                    value={formState.gdprSigned}
                    onChange={(event) => setFormState((current) => (current ? { ...current, gdprSigned: event.target.value as '0' | '1' } : current))}
                  >
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                </label>

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

              <div className="avel-candidate-edit-toggles">
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
                <label className="modern-command-field">
                  <span className="modern-command-label">Gender</span>
                  <select
                    className="avel-form-control"
                    name="gender"
                    value={formState.gender}
                    onChange={(event) => setFormState((current) => (current ? { ...current, gender: event.target.value } : current))}
                  >
                    <option value="">----</option>
                    <option value="m">Male</option>
                    <option value="f">Female</option>
                  </select>
                </label>

                <label className="modern-command-field">
                  <span className="modern-command-label">Ethnicity</span>
                  <select
                    className="avel-form-control"
                    name="race"
                    value={formState.race}
                    onChange={(event) => setFormState((current) => (current ? { ...current, race: event.target.value } : current))}
                  >
                    <option value="">----</option>
                    <option value="1">American Indian</option>
                    <option value="2">Asian or Pacific Islander</option>
                    <option value="3">Hispanic or Latino</option>
                    <option value="4">Non-Hispanic Black</option>
                    <option value="5">Non-Hispanic White</option>
                  </select>
                </label>

                <label className="modern-command-field">
                  <span className="modern-command-label">Veteran Status</span>
                  <select
                    className="avel-form-control"
                    name="veteran"
                    value={formState.veteran}
                    onChange={(event) => setFormState((current) => (current ? { ...current, veteran: event.target.value } : current))}
                  >
                    <option value="">----</option>
                    <option value="1">No</option>
                    <option value="2">Eligible Veteran</option>
                    <option value="3">Disabled Veteran</option>
                    <option value="4">Eligible and Disabled</option>
                  </select>
                </label>

                <label className="modern-command-field">
                  <span className="modern-command-label">Disability Status</span>
                  <select
                    className="avel-form-control"
                    name="disability"
                    value={formState.disability}
                    onChange={(event) => setFormState((current) => (current ? { ...current, disability: event.target.value } : current))}
                  >
                    <option value="">----</option>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </label>
              </div>

              {data.extraFields.length > 0 ? (
                <div className="avel-candidate-edit-extra">
                  <div className="avel-list-panel__header">
                    <h3 className="avel-list-panel__title">Custom Fields</h3>
                    <p className="avel-list-panel__hint">Values are saved to legacy extra fields.</p>
                  </div>
                  <div className="avel-candidate-edit-grid">
                    {data.extraFields.map((field) => (
                      <label
                        key={field.postKey}
                        className={`modern-command-field${field.inputType === 'textarea' || field.inputType === 'radio' ? ' avel-candidate-edit-field--full' : ''}`}
                      >
                        <span className="modern-command-label">{field.fieldName}</span>
                        {renderExtraFieldControl(field)}
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="modern-table-actions">
                <button type="submit" className="modern-btn modern-btn--emphasis">
                  Save Candidate
                </button>
                <a className="modern-btn modern-btn--secondary" href={showURL}>
                  Cancel
                </a>
              </div>
            </form>

            <section className="avel-candidate-edit-attachments">
              <div className="avel-list-panel__header">
                <h3 className="avel-list-panel__title">Attachments</h3>
                <div className="modern-table-actions">
                  {data.meta.permissions.canCreateAttachment ? (
                    <button
                      type="button"
                      className="modern-btn modern-btn--mini modern-btn--secondary"
                      onClick={() => openLegacyPopup(data.actions.createAttachmentURL, 480, 220, true)}
                    >
                      Add Attachment
                    </button>
                  ) : null}
                  <a className="modern-btn modern-btn--mini modern-btn--secondary" href={showURL}>
                    Manage In Profile
                  </a>
                </div>
              </div>
              <DataTable
                columns={[
                  { key: 'file', title: 'File' },
                  { key: 'created', title: 'Created' },
                  { key: 'type', title: 'Type' }
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
                  </tr>
                ))}
              </DataTable>
            </section>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}

