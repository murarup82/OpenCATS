import { useEffect, useState } from 'react';
import { fetchCompaniesEditModernData } from '../lib/api';
import { ensureModernUIURL } from '../lib/navigation';
import type { CompaniesEditModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { MarkdownTextarea } from '../components/primitives/MarkdownTextarea';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type CompanyExtraField = CompaniesEditModernDataResponse['extraFields'][number];

type CompanyEditFormState = {
  name: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  url: string;
  keyTechnologies: string;
  notes: string;
  isHot: boolean;
  owner: string;
  billingContact: string;
  departmentsCSV: string;
  updateContacts: 'yes' | 'no';
  ownershipChange: boolean;
  extraFields: Record<string, string>;
};

function toFormState(data: CompaniesEditModernDataResponse): CompanyEditFormState {
  const extraFields: Record<string, string> = {};
  data.extraFields.forEach((field) => {
    extraFields[field.postKey] = field.value || (field.inputType === 'checkbox' ? 'No' : '');
  });

  return {
    name: data.company.name || '',
    phone: data.company.phone || '',
    address: data.company.address || '',
    city: data.company.city || '',
    country: data.company.country || '',
    url: data.company.url || '',
    keyTechnologies: data.company.keyTechnologies || '',
    notes: data.company.notes || '',
    isHot: !!data.company.isHot,
    owner: data.company.owner || '-1',
    billingContact: data.company.billingContact || '-1',
    departmentsCSV: data.company.departmentsCSV || '',
    updateContacts: 'no',
    ownershipChange: false,
    extraFields
  };
}

export function CompaniesEditPage({ bootstrap }: Props) {
  const [data, setData] = useState<CompaniesEditModernDataResponse | null>(null);
  const [formState, setFormState] = useState<CompanyEditFormState | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [validationError, setValidationError] = useState('');
  const [serverQueryString] = useState<string>(() => new URLSearchParams(window.location.search).toString());

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchCompaniesEditModernData(bootstrap, query)
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
        setError(err.message || 'Unable to load company edit form.');
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

  const renderExtraFieldControl = (field: CompanyExtraField) => {
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
    return <div className="modern-state">Loading company edit form...</div>;
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
    return <EmptyState message="Company edit form not available." />;
  }

  const showURL = ensureModernUIURL(data.actions.showURL);
  const listURL = ensureModernUIURL(data.actions.listURL);
  const legacyURL = data.actions.legacyURL;

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="Edit Company"
        subtitle={`Company #${data.meta.companyID}`}
        actions={
          <>
            <a className="modern-btn modern-btn--secondary" href={showURL}>
              Back To Company
            </a>
            <a className="modern-btn modern-btn--secondary" href={listURL}>
              Back To List
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-joborder-thread-form">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Company Profile</h2>
              <p className="avel-list-panel__hint">Edits submit through existing legacy update handlers.</p>
            </div>

            <form
              method="post"
              action={data.actions.submitURL}
              onSubmit={(event) => {
                setValidationError('');
                if (formState.name.trim() === '') {
                  event.preventDefault();
                  setValidationError('Company name is required.');
                }
              }}
            >
              <input type="hidden" name="postback" value="postback" />
              <input type="hidden" name="companyID" value={String(data.company.companyID)} />

              <div className="avel-candidate-edit-grid">
                {data.company.defaultCompany ? (
                  <label className="modern-command-field">
                    <span className="modern-command-label">Company Name *</span>
                    <span className="modern-state">{formState.name || `Company #${data.company.companyID}`}</span>
                    <input type="hidden" name="name" value={formState.name} />
                  </label>
                ) : (
                  <label className="modern-command-field">
                    <span className="modern-command-label">Company Name *</span>
                    <input
                      className="avel-form-control"
                      type="text"
                      name="name"
                      value={formState.name}
                      onChange={(event) => setFormState((current) => (current ? { ...current, name: event.target.value } : current))}
                      required
                    />
                  </label>
                )}

                <label className="modern-command-field">
                  <span className="modern-command-label">Billing Contact</span>
                  <select
                    className="avel-form-control"
                    name="billingContact"
                    value={formState.billingContact}
                    onChange={(event) => setFormState((current) => (current ? { ...current, billingContact: event.target.value } : current))}
                  >
                    {data.options.billingContacts.map((option) => (
                      <option key={`billing-${option.value}`} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="modern-command-field">
                  <span className="modern-command-label">Owner</span>
                  <select
                    className="avel-form-control"
                    name="owner"
                    value={formState.owner}
                    onChange={(event) => setFormState((current) => (current ? { ...current, owner: event.target.value } : current))}
                  >
                    {data.options.owners.map((option) => (
                      <option key={`owner-${option.value}`} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="modern-command-field">
                  <span className="modern-command-label">Web Site</span>
                  <input
                    className="avel-form-control"
                    type="text"
                    name="url"
                    value={formState.url}
                    onChange={(event) => setFormState((current) => (current ? { ...current, url: event.target.value } : current))}
                  />
                </label>

                <label className="modern-command-field">
                  <span className="modern-command-label">Phone</span>
                  <input
                    className="avel-form-control"
                    type="text"
                    name="phone"
                    value={formState.phone}
                    onChange={(event) => setFormState((current) => (current ? { ...current, phone: event.target.value } : current))}
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
                  <span className="modern-command-label">Departments (comma separated)</span>
                  <input
                    className="avel-form-control"
                    type="text"
                    name="departmentsCSV"
                    value={formState.departmentsCSV}
                    onChange={(event) => setFormState((current) => (current ? { ...current, departmentsCSV: event.target.value } : current))}
                    placeholder="Sales, Engineering, Finance"
                  />
                </label>
              </div>

              {data.departments.length > 0 ? (
                <div className="avel-candidate-tag-cloud" style={{ marginBottom: '12px' }}>
                  {data.departments.map((department) => (
                    <span key={`${department.departmentID}-${department.name}`} className="modern-chip">
                      {department.name || `Department #${department.departmentID}`}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="avel-candidate-form-divider">
                <strong>Tags & Notes</strong>
                <span>Operational metadata and visibility markers.</span>
              </div>

              <div className="avel-candidate-edit-grid">
                <label className="modern-command-field avel-candidate-edit-field--full">
                  <span className="modern-command-label">Key Technologies</span>
                  <input
                    className="avel-form-control"
                    type="text"
                    name="keyTechnologies"
                    value={formState.keyTechnologies}
                    onChange={(event) => setFormState((current) => (current ? { ...current, keyTechnologies: event.target.value } : current))}
                  />
                </label>

                <label className="modern-command-field avel-candidate-edit-field--full">
                  <span className="modern-command-label">Misc. Notes</span>
                  <MarkdownTextarea
                    name="notes"
                    value={formState.notes}
                    rows={6}
                    ariaLabel="Company notes"
                    onChange={(nextValue) => setFormState((current) => (current ? { ...current, notes: nextValue } : current))}
                  />
                </label>
              </div>

              <div className="avel-candidate-edit-toggles" role="group" aria-label="Company visibility and ownership options">
                <label className="modern-command-toggle">
                  <input
                    type="checkbox"
                    name="isHot"
                    checked={formState.isHot}
                    onChange={(event) => setFormState((current) => (current ? { ...current, isHot: event.target.checked } : current))}
                  />
                  <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                  <span>Hot Company</span>
                </label>

                <label className="modern-command-field" style={{ minWidth: '300px' }}>
                  <span className="modern-command-label">Address Synchronization</span>
                  <select
                    className="avel-form-control"
                    name="updateContacts"
                    value={formState.updateContacts}
                    onChange={(event) =>
                      setFormState((current) =>
                        current ? { ...current, updateContacts: event.target.value === 'yes' ? 'yes' : 'no' } : current
                      )
                    }
                  >
                    <option value="yes">Yes, synchronize contacts</option>
                    <option value="no">No, leave contacts unmodified</option>
                  </select>
                </label>

                {data.options.canSendOwnershipEmail ? (
                  <label className="modern-command-toggle">
                    <input
                      type="checkbox"
                      name="ownershipChange"
                      checked={formState.ownershipChange}
                      onChange={(event) =>
                        setFormState((current) => (current ? { ...current, ownershipChange: event.target.checked } : current))
                      }
                    />
                    <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                    <span>E-mail new owner of change</span>
                  </label>
                ) : null}
              </div>

              {data.extraFields.length > 0 ? (
                <div className="avel-candidate-edit-extra avel-candidate-edit-extra--custom">
                  <div className="avel-list-panel__header">
                    <h3 className="avel-list-panel__title">Custom Fields</h3>
                    <p className="avel-list-panel__hint">Configured in legacy settings and saved to same keys.</p>
                  </div>
                  <div className="avel-candidate-edit-grid">
                    {data.extraFields.map((field) => {
                      const fieldClassName = `modern-command-field${
                        field.inputType === 'textarea' || field.inputType === 'radio'
                          ? ' avel-candidate-edit-field--full'
                          : ''
                      }`;

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

              {validationError !== '' ? <div className="modern-state modern-state--error" role="alert">{validationError}</div> : null}

              <div className="modern-table-actions avel-candidate-edit-actions">
                <button type="submit" className="modern-btn modern-btn--emphasis">
                  Save Company
                </button>
                <button
                  type="button"
                  className="modern-btn modern-btn--secondary"
                  onClick={() => {
                    setValidationError('');
                    setFormState(toFormState(data));
                  }}
                >
                  Reset
                </button>
                <a className="modern-btn modern-btn--secondary" href={showURL}>
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
