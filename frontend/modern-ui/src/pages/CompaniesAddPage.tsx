import { useEffect, useState } from 'react';
import { fetchCompaniesAddModernData } from '../lib/api';
import { ensureModernUIURL } from '../lib/navigation';
import type { CompaniesAddModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { MarkdownTextarea } from '../components/primitives/MarkdownTextarea';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type CompanyExtraField = CompaniesAddModernDataResponse['extraFields'][number];

type CompanyAddFormState = {
  name: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  url: string;
  keyTechnologies: string;
  notes: string;
  isHot: boolean;
  departmentsCSV: string;
  extraFields: Record<string, string>;
};

function toFormState(data: CompaniesAddModernDataResponse): CompanyAddFormState {
  const extraFields: Record<string, string> = {};
  data.extraFields.forEach((field) => {
    extraFields[field.postKey] = field.value || (field.inputType === 'checkbox' ? 'No' : '');
  });

  return {
    name: data.defaults.name || '',
    phone: data.defaults.phone || '',
    address: data.defaults.address || '',
    city: data.defaults.city || '',
    country: data.defaults.country || '',
    url: data.defaults.url || '',
    keyTechnologies: data.defaults.keyTechnologies || '',
    notes: data.defaults.notes || '',
    isHot: !!data.defaults.isHot,
    departmentsCSV: data.defaults.departmentsCSV || '',
    extraFields
  };
}

export function CompaniesAddPage({ bootstrap }: Props) {
  const [data, setData] = useState<CompaniesAddModernDataResponse | null>(null);
  const [formState, setFormState] = useState<CompanyAddFormState | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [validationError, setValidationError] = useState('');
  const [serverQueryString] = useState<string>(() => new URLSearchParams(window.location.search).toString());

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchCompaniesAddModernData(bootstrap, query)
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
        setError(err.message || 'Unable to load company add form.');
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
    return <div className="modern-state">Loading company add form...</div>;
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
    return <EmptyState message="Company add form not available." />;
  }

  const listURL = ensureModernUIURL(data.actions.listURL);
  const legacyURL = data.actions.legacyURL;

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="Add Company"
        subtitle="Create a company record with native modern form controls."
        actions={
          <>
            <a className="modern-btn modern-btn--secondary" href={listURL}>
              Back To Companies
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
              <p className="avel-list-panel__hint">Fields map 1:1 to existing legacy company create handlers.</p>
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

              <div className="avel-candidate-edit-grid">
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
                  <span className="modern-command-label">Web Site</span>
                  <input
                    className="avel-form-control"
                    type="text"
                    name="url"
                    value={formState.url}
                    onChange={(event) => setFormState((current) => (current ? { ...current, url: event.target.value } : current))}
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

              <div className="avel-candidate-form-divider">
                <strong>Tags & Notes</strong>
                <span>Classification fields used by company search and reporting.</span>
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

              <div className="avel-candidate-edit-toggles">
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
              </div>

              {data.extraFields.length > 0 ? (
                <div className="avel-candidate-edit-extra avel-candidate-edit-extra--custom">
                  <div className="avel-list-panel__header">
                    <h3 className="avel-list-panel__title">Custom Fields</h3>
                    <p className="avel-list-panel__hint">Tenant-specific fields from legacy configuration.</p>
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
                  Add Company
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
