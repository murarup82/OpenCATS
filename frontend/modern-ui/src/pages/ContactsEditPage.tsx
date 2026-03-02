import { useEffect, useState } from 'react';
import { fetchContactsEditModernData } from '../lib/api';
import { ensureModernUIURL } from '../lib/navigation';
import type { ContactsEditModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type ContactExtraField = ContactsEditModernDataResponse['extraFields'][number];

type ContactEditFormState = {
  firstName: string;
  lastName: string;
  companyID: string;
  title: string;
  department: string;
  departmentsCSV: string;
  reportsTo: string;
  isHot: boolean;
  leftCompany: boolean;
  owner: string;
  ownershipChange: boolean;
  email1: string;
  email2: string;
  phoneWork: string;
  phoneCell: string;
  phoneOther: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  notes: string;
  extraFields: Record<string, string>;
};

function toFormState(data: ContactsEditModernDataResponse): ContactEditFormState {
  const extraFields: Record<string, string> = {};
  data.extraFields.forEach((field) => {
    extraFields[field.postKey] = field.value || (field.inputType === 'checkbox' ? 'No' : '');
  });

  return {
    firstName: data.contact.firstName || '',
    lastName: data.contact.lastName || '',
    companyID: data.contact.companyID || '-1',
    title: data.contact.title || '',
    department: data.contact.department || '(none)',
    departmentsCSV: data.contact.departmentsCSV || '',
    reportsTo: data.contact.reportsTo || '(none)',
    isHot: !!data.contact.isHot,
    leftCompany: !!data.contact.leftCompany,
    owner: data.contact.owner || '-1',
    ownershipChange: false,
    email1: data.contact.email1 || '',
    email2: data.contact.email2 || '',
    phoneWork: data.contact.phoneWork || '',
    phoneCell: data.contact.phoneCell || '',
    phoneOther: data.contact.phoneOther || '',
    address: data.contact.address || '',
    city: data.contact.city || '',
    state: data.contact.state || '',
    zip: data.contact.zip || '',
    notes: data.contact.notes || '',
    extraFields
  };
}

export function ContactsEditPage({ bootstrap }: Props) {
  const [data, setData] = useState<ContactsEditModernDataResponse | null>(null);
  const [formState, setFormState] = useState<ContactEditFormState | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [validationError, setValidationError] = useState('');
  const [serverQueryString] = useState<string>(() => new URLSearchParams(window.location.search).toString());

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchContactsEditModernData(bootstrap, query)
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
        setError(err.message || 'Unable to load contact edit form.');
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

  const renderExtraFieldControl = (field: ContactExtraField) => {
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
    return <div className="modern-state">Loading contact edit form...</div>;
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
    return <EmptyState message="Contact edit form not available." />;
  }

  const showURL = ensureModernUIURL(data.actions.showURL);
  const listURL = ensureModernUIURL(data.actions.listURL);
  const legacyURL = data.actions.legacyURL;
  const departmentOptions = [
    { value: '(none)', label: '(None)' },
    ...data.options.departments.map((department) => ({
      value: department.name,
      label: department.name
    }))
  ];

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="Edit Contact"
        subtitle={`Contact #${data.meta.contactID}`}
        actions={
          <>
            <a className="modern-btn modern-btn--secondary" href={showURL}>
              Back To Contact
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
              <h2 className="avel-list-panel__title">Contact Profile</h2>
              <p className="avel-list-panel__hint">Edit fields submit through existing legacy contact update handlers.</p>
            </div>

            <form
              method="post"
              action={data.actions.submitURL}
              onSubmit={(event) => {
                setValidationError('');
                if (formState.firstName.trim() === '' || formState.lastName.trim() === '' || formState.title.trim() === '') {
                  event.preventDefault();
                  setValidationError('First name, last name, and title are required.');
                  return;
                }
                if (Number(formState.companyID || -1) <= 0) {
                  event.preventDefault();
                  setValidationError('Select a company before saving this contact.');
                }
              }}
            >
              <input type="hidden" name="postback" value="postback" />
              <input type="hidden" name="contactID" value={String(data.contact.contactID)} />

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

                <label className="modern-command-field avel-candidate-edit-field--full">
                  <span className="modern-command-label">Company *</span>
                  <div className="modern-table-actions" style={{ marginBottom: '6px' }}>
                    {data.options.defaultCompanyID > 0 ? (
                      <button
                        type="button"
                        className="modern-btn modern-btn--mini modern-btn--secondary"
                        onClick={() =>
                          setFormState((current) =>
                            current
                              ? {
                                  ...current,
                                  companyID: String(data.options.defaultCompanyID)
                                }
                              : current
                          )
                        }
                      >
                        Internal Contact
                      </button>
                    ) : null}
                  </div>
                  <select
                    className="avel-form-control"
                    name="companyID"
                    value={formState.companyID}
                    onChange={(event) => setFormState((current) => (current ? { ...current, companyID: event.target.value } : current))}
                    required
                  >
                    {data.options.companies.map((option) => (
                      <option key={`company-${option.value}`} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="modern-command-field">
                  <span className="modern-command-label">Title *</span>
                  <input
                    className="avel-form-control"
                    type="text"
                    name="title"
                    value={formState.title}
                    onChange={(event) => setFormState((current) => (current ? { ...current, title: event.target.value } : current))}
                    required
                  />
                </label>

                <label className="modern-command-field">
                  <span className="modern-command-label">Department</span>
                  <select
                    className="avel-form-control"
                    name="department"
                    value={formState.department}
                    onChange={(event) => setFormState((current) => (current ? { ...current, department: event.target.value } : current))}
                  >
                    {departmentOptions.map((option) => (
                      <option key={`department-${option.value}`} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="modern-command-field">
                  <span className="modern-command-label">Reports To</span>
                  <select
                    className="avel-form-control"
                    name="reportsTo"
                    value={formState.reportsTo}
                    onChange={(event) => setFormState((current) => (current ? { ...current, reportsTo: event.target.value } : current))}
                  >
                    {data.options.reportsTo.map((option) => (
                      <option key={`reportsto-${option.value}`} value={option.value}>
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

                <label className="modern-command-field avel-candidate-edit-field--full">
                  <span className="modern-command-label">Departments (comma separated)</span>
                  <input
                    className="avel-form-control"
                    type="text"
                    name="departmentsCSV"
                    value={formState.departmentsCSV}
                    onChange={(event) => setFormState((current) => (current ? { ...current, departmentsCSV: event.target.value } : current))}
                    placeholder="Sales, Engineering"
                  />
                </label>
              </div>

              <div className="avel-candidate-form-divider">
                <strong>Contact Details</strong>
                <span>Primary communication and status fields.</span>
              </div>

              <div className="avel-candidate-edit-grid">
                <label className="modern-command-field">
                  <span className="modern-command-label">E-Mail</span>
                  <input
                    className="avel-form-control"
                    type="text"
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
                    name="state"
                    value={formState.state}
                    onChange={(event) => setFormState((current) => (current ? { ...current, state: event.target.value } : current))}
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
              </div>

              <div className="avel-candidate-edit-toggles">
                <label className="modern-command-toggle">
                  <input
                    type="checkbox"
                    name="isHot"
                    checked={formState.isHot}
                    onChange={(event) => setFormState((current) => (current ? { ...current, isHot: event.target.checked } : current))}
                  />
                  <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                  <span>Hot Contact</span>
                </label>

                <label className="modern-command-toggle">
                  <input
                    type="checkbox"
                    name="leftCompany"
                    checked={formState.leftCompany}
                    onChange={(event) => setFormState((current) => (current ? { ...current, leftCompany: event.target.checked } : current))}
                  />
                  <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                  <span>Left Company</span>
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

              <input type="hidden" name="email2" value={formState.email2} />
              <input type="hidden" name="phoneWork" value={formState.phoneWork} />
              <input type="hidden" name="phoneOther" value={formState.phoneOther} />
              <input type="hidden" name="zip" value={formState.zip} />

              <label className="modern-command-field avel-candidate-edit-field--full">
                <span className="modern-command-label">Misc. Notes</span>
                <textarea
                  className="avel-form-control"
                  name="notes"
                  value={formState.notes}
                  onChange={(event) => setFormState((current) => (current ? { ...current, notes: event.target.value } : current))}
                  rows={4}
                />
              </label>

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

              {validationError !== '' ? <div className="modern-state modern-state--error">{validationError}</div> : null}

              <div className="modern-table-actions avel-candidate-edit-actions">
                <button type="submit" className="modern-btn modern-btn--emphasis">
                  Save Contact
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
