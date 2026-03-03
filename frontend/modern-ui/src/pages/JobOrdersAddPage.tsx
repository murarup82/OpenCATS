import { useEffect, useRef, useState } from 'react';
import { fetchJobOrderCompanyContextModernData, fetchJobOrdersAddModernData } from '../lib/api';
import { ensureModernUIURL } from '../lib/navigation';
import type { JobOrdersAddModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { MarkdownTextarea } from '../components/primitives/MarkdownTextarea';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type JobOrderExtraField = JobOrdersAddModernDataResponse['extraFields'][number];

type JobOrderAddFormState = {
  title: string;
  startDate: string;
  companyID: string;
  department: string;
  departmentsCSV: string;
  contactID: string;
  type: string;
  city: string;
  state: string;
  duration: string;
  maxRate: string;
  salary: string;
  openings: string;
  companyJobID: string;
  recruiter: string;
  owner: string;
  isHot: boolean;
  public: boolean;
  questionnaire: string;
  description: string;
  notes: string;
  extraFields: Record<string, string>;
};

function toFormState(data: JobOrdersAddModernDataResponse): JobOrderAddFormState {
  const extraFields: Record<string, string> = {};
  data.extraFields.forEach((field) => {
    extraFields[field.postKey] = field.value || (field.inputType === 'checkbox' ? 'No' : '');
  });

  return {
    title: data.defaults.title || '',
    startDate: data.defaults.startDate || '',
    companyID: data.defaults.companyID || '0',
    department: data.defaults.department || '(none)',
    departmentsCSV: data.defaults.departmentsCSV || '',
    contactID: data.defaults.contactID || '-1',
    type: data.defaults.type || '',
    city: data.defaults.city || '',
    state: data.defaults.state || '',
    duration: data.defaults.duration || '',
    maxRate: data.defaults.maxRate || '',
    salary: data.defaults.salary || '',
    openings: data.defaults.openings || '1',
    companyJobID: data.defaults.companyJobID || '',
    recruiter: data.defaults.recruiter || '',
    owner: data.defaults.owner || '',
    isHot: !!data.defaults.isHot,
    public: !!data.defaults.public,
    questionnaire: data.defaults.questionnaire || 'none',
    description: data.defaults.description || '',
    notes: data.defaults.notes || '',
    extraFields
  };
}

export function JobOrdersAddPage({ bootstrap }: Props) {
  const [data, setData] = useState<JobOrdersAddModernDataResponse | null>(null);
  const [formState, setFormState] = useState<JobOrderAddFormState | null>(null);
  const [contacts, setContacts] = useState<JobOrdersAddModernDataResponse['options']['contacts']>([]);
  const [departments, setDepartments] = useState<JobOrdersAddModernDataResponse['options']['departments']>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [validationError, setValidationError] = useState('');
  const [companyContextError, setCompanyContextError] = useState('');
  const [companyContextLoading, setCompanyContextLoading] = useState(false);
  const [serverQueryString] = useState<string>(() => new URLSearchParams(window.location.search).toString());
  const companyRequestRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchJobOrdersAddModernData(bootstrap, query)
      .then((result) => {
        if (!isMounted) {
          return;
        }
        setData(result);
        setFormState(toFormState(result));
        setContacts(result.options.contacts || []);
        setDepartments(result.options.departments || []);
      })
      .catch((err: Error) => {
        if (!isMounted) {
          return;
        }
        setError(err.message || 'Unable to load job order add form.');
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

  const loadCompanyContext = async (companyID: string) => {
    const numericCompanyID = Number(companyID || 0);
    if (numericCompanyID <= 0) {
      setContacts([{ value: '-1', label: 'None' }]);
      setDepartments([]);
      setCompanyContextError('');
      return;
    }

    const requestID = companyRequestRef.current + 1;
    companyRequestRef.current = requestID;
    setCompanyContextLoading(true);
    setCompanyContextError('');

    try {
      const context = await fetchJobOrderCompanyContextModernData(bootstrap, numericCompanyID);
      if (requestID !== companyRequestRef.current) {
        return;
      }
      setContacts([{ value: '-1', label: 'None' }, ...(context.contacts || [])]);
      setDepartments(context.departments.items || []);
      setFormState((current) => {
        if (!current) {
          return current;
        }
        const departmentNames = (context.departments.items || [])
          .map((item) => String(item.name || '').trim())
          .filter((item) => item !== '');
        const nextDepartment = departmentNames.includes(current.department) ? current.department : '(none)';

        return {
          ...current,
          city: context.location.city || '',
          state: context.location.state || '',
          contactID: '-1',
          departmentsCSV: context.departments.csv || '',
          department: nextDepartment
        };
      });
    } catch (contextError) {
      if (requestID !== companyRequestRef.current) {
        return;
      }
      setCompanyContextError(contextError instanceof Error ? contextError.message : 'Unable to refresh company context.');
    } finally {
      if (requestID === companyRequestRef.current) {
        setCompanyContextLoading(false);
      }
    }
  };

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

  const renderExtraFieldControl = (field: JobOrderExtraField) => {
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
    return <div className="modern-state">Loading job order add form...</div>;
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
    return <EmptyState message="Job order add form not available." />;
  }

  const listURL = ensureModernUIURL(data.actions.listURL);
  const legacyURL = data.actions.legacyURL;

  if (data.state.noCompanies) {
    return (
      <div className="avel-dashboard-page">
        <PageContainer
          title="Add Job Order"
          subtitle="At least one company is required before creating a job order."
          actions={
            <>
              <a className="modern-btn modern-btn--secondary" href={ensureModernUIURL(`${bootstrap.indexName}?m=companies&a=listByView`)}>
                Go To Companies
              </a>
              <a className="modern-btn modern-btn--secondary" href={listURL}>
                Back To Job Orders
              </a>
            </>
          }
        >
          <div className="modern-state modern-state--empty">
            No companies are available. Add a company first, then create a job order.
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="Add Job Order"
        subtitle="Create a job order with native modern form controls."
        actions={
          <>
            <a className="modern-btn modern-btn--secondary" href={listURL}>
              Back To Job Orders
            </a>
            <a className="modern-btn modern-btn--secondary" href={legacyURL}>
              Open Legacy UI
            </a>
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-joborder-thread-form">
            <form
              method="post"
              action={data.actions.submitURL}
              onSubmit={(event) => {
                setValidationError('');
                if (
                  formState.title.trim() === '' ||
                  Number(formState.companyID || 0) <= 0 ||
                  formState.type.trim() === '' ||
                  formState.city.trim() === '' ||
                  formState.state.trim() === '' ||
                  Number(formState.recruiter || 0) <= 0 ||
                  Number(formState.owner || 0) <= 0 ||
                  !/^\d+$/.test(formState.openings.trim())
                ) {
                  event.preventDefault();
                  setValidationError('Title, company, type, city, country, recruiter, owner, and numeric openings are required.');
                }
              }}
            >
              <input type="hidden" name="postback" value="postback" />
              <input type="hidden" name="departmentsCSV" value={formState.departmentsCSV} />

              <div className="avel-candidate-edit-grid">
                <label className="modern-command-field">
                  <span className="modern-command-label">Title *</span>
                  <input className="avel-form-control" type="text" name="title" value={formState.title} onChange={(event) => setFormState((current) => (current ? { ...current, title: event.target.value } : current))} required />
                </label>

                <label className="modern-command-field">
                  <span className="modern-command-label">Start Date (MM-DD-YY)</span>
                  <input className="avel-form-control" type="text" name="startDate" value={formState.startDate} onChange={(event) => setFormState((current) => (current ? { ...current, startDate: event.target.value } : current))} />
                </label>

                <label className="modern-command-field avel-candidate-edit-field--full">
                  <span className="modern-command-label">Company *</span>
                  <div className="modern-table-actions" style={{ marginBottom: '6px' }}>
                    {data.options.defaultCompanyID > 0 ? (
                      <button
                        type="button"
                        className="modern-btn modern-btn--mini modern-btn--secondary"
                        onClick={() => {
                          const nextCompanyID = String(data.options.defaultCompanyID);
                          setFormState((current) => (current ? { ...current, companyID: nextCompanyID } : current));
                          void loadCompanyContext(nextCompanyID);
                        }}
                      >
                        Use Default Company
                      </button>
                    ) : null}
                  </div>
                  <select
                    className="avel-form-control"
                    name="companyID"
                    value={formState.companyID}
                    onChange={(event) => {
                      const nextCompanyID = event.target.value;
                      setFormState((current) => (current ? { ...current, companyID: nextCompanyID } : current));
                      void loadCompanyContext(nextCompanyID);
                    }}
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
                  <span className="modern-command-label">Department</span>
                  <select className="avel-form-control" name="department" value={formState.department} onChange={(event) => setFormState((current) => (current ? { ...current, department: event.target.value } : current))}>
                    <option value="(none)">None</option>
                    {departments.map((department) => (
                      <option key={`department-${department.departmentID}-${department.name}`} value={department.name}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="modern-command-field">
                  <span className="modern-command-label">Contact</span>
                  <select className="avel-form-control" name="contactID" value={formState.contactID} onChange={(event) => setFormState((current) => (current ? { ...current, contactID: event.target.value } : current))}>
                    {contacts.map((option) => (
                      <option key={`contact-${option.value}`} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="modern-command-field">
                  <span className="modern-command-label">Type *</span>
                  <select className="avel-form-control" name="type" value={formState.type} onChange={(event) => setFormState((current) => (current ? { ...current, type: event.target.value } : current))}>
                    {data.options.jobTypes.map((option) => (
                      <option key={`type-${option.value}`} value={option.value}>
                        {option.label} ({option.description})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="modern-command-field">
                  <span className="modern-command-label">City *</span>
                  <input className="avel-form-control" type="text" name="city" value={formState.city} onChange={(event) => setFormState((current) => (current ? { ...current, city: event.target.value } : current))} required />
                </label>

                <label className="modern-command-field">
                  <span className="modern-command-label">Country *</span>
                  <input className="avel-form-control" type="text" name="state" value={formState.state} onChange={(event) => setFormState((current) => (current ? { ...current, state: event.target.value } : current))} required />
                </label>

                <label className="modern-command-field">
                  <span className="modern-command-label">Recruiter *</span>
                  <select className="avel-form-control" name="recruiter" value={formState.recruiter} onChange={(event) => setFormState((current) => (current ? { ...current, recruiter: event.target.value } : current))}>
                    {data.options.users.map((option) => (
                      <option key={`recruiter-${option.value}`} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="modern-command-field">
                  <span className="modern-command-label">Owner *</span>
                  <select className="avel-form-control" name="owner" value={formState.owner} onChange={(event) => setFormState((current) => (current ? { ...current, owner: event.target.value } : current))}>
                    {data.options.users.map((option) => (
                      <option key={`owner-${option.value}`} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="modern-command-field">
                  <span className="modern-command-label">Openings *</span>
                  <input className="avel-form-control" type="text" name="openings" value={formState.openings} onChange={(event) => setFormState((current) => (current ? { ...current, openings: event.target.value } : current))} required />
                </label>

                <label className="modern-command-field">
                  <span className="modern-command-label">Duration</span>
                  <input className="avel-form-control" type="text" name="duration" value={formState.duration} onChange={(event) => setFormState((current) => (current ? { ...current, duration: event.target.value } : current))} />
                </label>

                <label className="modern-command-field">
                  <span className="modern-command-label">Maximum Rate</span>
                  <input className="avel-form-control" type="text" name="maxRate" value={formState.maxRate} onChange={(event) => setFormState((current) => (current ? { ...current, maxRate: event.target.value } : current))} />
                </label>

                <label className="modern-command-field">
                  <span className="modern-command-label">Salary</span>
                  <input className="avel-form-control" type="text" name="salary" value={formState.salary} onChange={(event) => setFormState((current) => (current ? { ...current, salary: event.target.value } : current))} />
                </label>

                <label className="modern-command-field">
                  <span className="modern-command-label">Company Job ID</span>
                  <input className="avel-form-control" type="text" name="companyJobID" value={formState.companyJobID} onChange={(event) => setFormState((current) => (current ? { ...current, companyJobID: event.target.value } : current))} />
                </label>
              </div>

              <div className="avel-candidate-edit-toggles">
                <label className="modern-command-toggle">
                  <input type="checkbox" name="isHot" checked={formState.isHot} onChange={(event) => setFormState((current) => (current ? { ...current, isHot: event.target.checked } : current))} />
                  <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                  <span>Hot Job Order</span>
                </label>

                <label className="modern-command-toggle">
                  <input type="checkbox" name="public" checked={formState.public} onChange={(event) => setFormState((current) => (current ? { ...current, public: event.target.checked } : current))} />
                  <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                  <span>Public Job Order</span>
                </label>
              </div>

              {data.options.careerPortalEnabled && formState.public ? (
                <label className="modern-command-field avel-candidate-edit-field--full">
                  <span className="modern-command-label">Questionnaire</span>
                  <select className="avel-form-control" name="questionnaire" value={formState.questionnaire} onChange={(event) => setFormState((current) => (current ? { ...current, questionnaire: event.target.value } : current))}>
                    {data.options.questionnaires.map((option) => (
                      <option key={`questionnaire-${option.value}`} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <input type="hidden" name="questionnaire" value={formState.questionnaire} />
              )}

              <label className="modern-command-field avel-candidate-edit-field--full">
                <span className="modern-command-label">Description</span>
                <MarkdownTextarea
                  name="description"
                  value={formState.description}
                  rows={8}
                  ariaLabel="Job order description"
                  onChange={(nextValue) =>
                    setFormState((current) => (current ? { ...current, description: nextValue } : current))
                  }
                />
              </label>

              <label className="modern-command-field avel-candidate-edit-field--full">
                <span className="modern-command-label">Internal Notes</span>
                <MarkdownTextarea
                  name="notes"
                  value={formState.notes}
                  rows={5}
                  ariaLabel="Job order internal notes"
                  onChange={(nextValue) =>
                    setFormState((current) => (current ? { ...current, notes: nextValue } : current))
                  }
                />
              </label>

              {data.extraFields.length > 0 ? (
                <div className="avel-candidate-edit-extra avel-candidate-edit-extra--custom">
                  <div className="avel-list-panel__header">
                    <h3 className="avel-list-panel__title">Custom Fields</h3>
                    <p className="avel-list-panel__hint">Values are stored in legacy extra fields.</p>
                  </div>
                  <div className="avel-candidate-edit-grid">
                    {data.extraFields.map((field) => {
                      const fieldClassName = `modern-command-field${
                        field.inputType === 'textarea' || field.inputType === 'radio' ? ' avel-candidate-edit-field--full' : ''
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

              {companyContextLoading ? <div className="modern-state">Refreshing company contacts and departments...</div> : null}
              {companyContextError !== '' ? <div className="modern-state modern-state--error">{companyContextError}</div> : null}
              {validationError !== '' ? <div className="modern-state modern-state--error">{validationError}</div> : null}

              <div className="modern-table-actions avel-candidate-edit-actions">
                <button type="submit" className="modern-btn modern-btn--emphasis">Add Job Order</button>
                <button
                  type="button"
                  className="modern-btn modern-btn--secondary"
                  onClick={() => {
                    setValidationError('');
                    setCompanyContextError('');
                    setFormState(toFormState(data));
                    setContacts(data.options.contacts || []);
                    setDepartments(data.options.departments || []);
                  }}
                >
                  Reset
                </button>
                <a className="modern-btn modern-btn--secondary" href={listURL}>Cancel</a>
              </div>
            </form>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
