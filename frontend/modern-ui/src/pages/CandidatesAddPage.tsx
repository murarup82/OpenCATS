import { useEffect, useRef, useState } from 'react';
import { fetchCandidateDuplicateCheck, fetchCandidatesAddModernData } from '../lib/api';
import type { CandidateDuplicateMatch, CandidatesAddModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { DataTable } from '../components/primitives/DataTable';
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

export function CandidatesAddPage({ bootstrap }: Props) {
  const [data, setData] = useState<CandidatesAddModernDataResponse | null>(null);
  const [formState, setFormState] = useState<CandidateAddFormState | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [serverQueryString] = useState<string>(() => new URLSearchParams(window.location.search).toString());
  const formRef = useRef<HTMLFormElement | null>(null);
  const [duplicateChecking, setDuplicateChecking] = useState(false);
  const [duplicateError, setDuplicateError] = useState('');
  const [duplicateMode, setDuplicateMode] = useState<'none' | 'hard' | 'soft'>('none');
  const [hardMatches, setHardMatches] = useState<CandidateDuplicateMatch[]>([]);
  const [softMatches, setSoftMatches] = useState<CandidateDuplicateMatch[]>([]);
  const [softOverrideAccepted, setSoftOverrideAccepted] = useState(false);

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
  }, [formState?.firstName, formState?.lastName, formState?.email1, formState?.phoneCell, formState?.city, formState?.country]);

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
          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Candidate Details</h2>
              <p className="avel-list-panel__hint">Required fields: First Name, Last Name.</p>
            </div>

            <form
              ref={formRef}
              id="modernCandidateAddForm"
              className="avel-candidate-edit-form"
              method="post"
              action={submitURL}
              onSubmit={async (event) => {
                if (formState.firstName.trim() === '' || formState.lastName.trim() === '') {
                  event.preventDefault();
                  window.alert('First Name and Last Name are required.');
                  return;
                }
                if (formState.gdprSigned === '1' && formState.gdprExpirationDate.trim() === '') {
                  event.preventDefault();
                  window.alert('GDPR Expiration Date is required when GDPR Signed is Yes.');
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

              <div className="avel-candidate-edit-grid">
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
                    <p className="avel-list-panel__hint">Configured per tenant in legacy settings.</p>
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

              {duplicateChecking ? <div className="modern-state">Checking for potential duplicates...</div> : null}
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

              <div className="modern-table-actions">
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
