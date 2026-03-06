import { useCallback, useEffect, useRef, useState } from 'react';
import {
  deleteCompanyAttachment,
  fetchCompaniesShowModernData,
  uploadCompanyAttachment
} from '../lib/api';
import type { CompaniesShowModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { DataTable } from '../components/primitives/DataTable';
import { FormattedTextBlock } from '../components/primitives/FormattedTextBlock';
import { LegacyFrameModal } from '../components/primitives/LegacyFrameModal';
import { ConfirmActionModal } from '../components/primitives/ConfirmActionModal';
import { ensureModernUIURL } from '../lib/navigation';
import { usePageRefreshEvents } from '../lib/usePageRefreshEvents';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
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

function getDetailFieldClassName(value: unknown): string {
  return `avel-entity-detail-field ${isDisplayValueEmpty(value) ? 'is-empty' : 'is-filled'}`;
}

export function CompaniesShowPage({ bootstrap }: Props) {
  const [data, setData] = useState<CompaniesShowModernDataResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [serverQueryString, setServerQueryString] = useState<string>(() => new URLSearchParams(window.location.search).toString());
  const [reloadToken, setReloadToken] = useState(0);
  const [legacyModal, setLegacyModal] = useState<{
    url: string;
    title: string;
    showRefreshClose: boolean;
  } | null>(null);
  const [attachmentUploadOpen, setAttachmentUploadOpen] = useState<boolean>(false);
  const [attachmentUploadFile, setAttachmentUploadFile] = useState<File | null>(null);
  const [attachmentUploadPending, setAttachmentUploadPending] = useState<boolean>(false);
  const [attachmentUploadError, setAttachmentUploadError] = useState<string>('');
  const [attachmentDeleteModal, setAttachmentDeleteModal] = useState<{
    attachmentID: number;
    fileName: string;
  } | null>(null);
  const [attachmentDeletePending, setAttachmentDeletePending] = useState<boolean>(false);
  const [attachmentDeleteError, setAttachmentDeleteError] = useState<string>('');
  const loadRequestRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    const requestID = loadRequestRef.current + 1;
    loadRequestRef.current = requestID;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchCompaniesShowModernData(bootstrap, query)
      .then((result) => {
        if (!isMounted || requestID !== loadRequestRef.current) {
          return;
        }
        setData(result);
      })
      .catch((err: Error) => {
        if (!isMounted || requestID !== loadRequestRef.current) {
          return;
        }
        setError(err.message || 'Unable to load company profile.');
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

  const refreshPageData = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);
  usePageRefreshEvents(refreshPageData);

  const closeLegacyModal = useCallback(
    (refreshOnClose: boolean) => {
      setLegacyModal(null);
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
      const result = await uploadCompanyAttachment(submitURL, {
        companyID: Number(data.meta.companyID || 0),
        file: attachmentUploadFile
      });
      if (!result.success) {
        setAttachmentUploadError(result.message || 'Unable to upload attachment.');
        return;
      }

      setAttachmentUploadFile(null);
      setAttachmentUploadOpen(false);
      refreshPageData();
    } catch (err: unknown) {
      setAttachmentUploadError(err instanceof Error ? err.message : 'Unable to upload attachment.');
    } finally {
      setAttachmentUploadPending(false);
    }
  }, [attachmentUploadFile, attachmentUploadPending, data, refreshPageData]);

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
        const result = await deleteCompanyAttachment(deleteURL, {
          companyID: Number(data.meta.companyID || 0),
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

  if (loading && !data) {
    return <div className="modern-state">Loading company profile...</div>;
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
    return <EmptyState message="Company profile not available." />;
  }

  const permissions = data.meta.permissions;
  const company = data.company;

  return (
    <div className="avel-dashboard-page avel-joborder-show-page avel-company-show-page">
      <PageContainer
        title={toDisplayText(company.name, 'Company')}
        subtitle={`Company #${company.companyID}`}
        actions={
          <>
            {permissions.canEditCompany ? (
              <a className="modern-btn modern-btn--secondary" href={ensureModernUIURL(data.actions.editURL)}>
                Edit Company
              </a>
            ) : null}
            {permissions.canAddJobOrder ? (
              <a className="modern-btn modern-btn--secondary" href={ensureModernUIURL(data.actions.addJobOrderURL)}>
                Add Job Order
              </a>
            ) : null}
            {permissions.canAddContact ? (
              <a className="modern-btn modern-btn--secondary" href={ensureModernUIURL(data.actions.addContactURL)}>
                Add Contact
              </a>
            ) : null}
            {permissions.canViewHistory ? (
              <button
                type="button"
                className="modern-btn modern-btn--secondary"
                onClick={() =>
                  setLegacyModal({
                    url: ensureModernUIURL(data.actions.historyURL),
                    title: 'Company History',
                    showRefreshClose: false
                  })
                }
              >
                History
              </button>
            ) : null}
            <a className="modern-btn modern-btn--secondary" href={bootstrap.legacyURL}>
              Open Legacy UI
            </a>
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-joborder-show-grid">
            <div className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Company Details</h2>
                <div className="modern-table-actions">
                  {company.isHot ? <span className="modern-chip modern-chip--warning">Hot Company</span> : null}
                </div>
              </div>
              <div className="avel-entity-details avel-entity-details--company">
                <div className={getDetailFieldClassName(company.phone)}>
                  <strong>Phone</strong>
                  <span className="avel-entity-detail-field__value">{toDisplayText(company.phone)}</span>
                </div>
                <div className={getDetailFieldClassName(company.address)}>
                  <strong>Address</strong>
                  <span className="avel-entity-detail-field__value">{toDisplayText(company.address)}</span>
                </div>
                <div className={getDetailFieldClassName(company.cityAndState)}>
                  <strong>Location</strong>
                  <span className="avel-entity-detail-field__value">{toDisplayText(company.cityAndState)}</span>
                </div>
                <div className={getDetailFieldClassName(company.billingContactID > 0 ? company.billingContactFullName : '')}>
                  <strong>Billing Contact</strong>
                  <span className="avel-entity-detail-field__value">
                    {company.billingContactID > 0 ? (
                      <a className="modern-link" href={ensureModernUIURL(`${bootstrap.indexName}?m=contacts&a=show&contactID=${company.billingContactID}`)}>
                        {toDisplayText(company.billingContactFullName)}
                      </a>
                    ) : (
                      '--'
                    )}
                  </span>
                </div>
                <div className={getDetailFieldClassName(company.webSite)}>
                  <strong>Web Site</strong>
                  <span className="avel-entity-detail-field__value">
                    {company.webSite.trim() !== '' ? (
                      <a className="modern-link" href={company.webSite} target="_blank" rel="noreferrer">
                        {company.webSite}
                      </a>
                    ) : (
                      '--'
                    )}
                  </span>
                </div>
                <div className={getDetailFieldClassName(company.keyTechnologies)}>
                  <strong>Key Technologies</strong>
                  <span className="avel-entity-detail-field__value">{toDisplayText(company.keyTechnologies)}</span>
                </div>
                <div className={getDetailFieldClassName(company.dateCreated)}>
                  <strong>Created</strong>
                  <span className="avel-entity-detail-field__value">
                    {toDisplayText(company.dateCreated)} ({toDisplayText(company.enteredByFullName)})
                  </span>
                </div>
                <div className={getDetailFieldClassName(company.ownerFullName)}>
                  <strong>Owner</strong>
                  <span className="avel-entity-detail-field__value">{toDisplayText(company.ownerFullName)}</span>
                </div>
              </div>
            </div>

            <div className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Attachments</h2>
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
                      <a className="modern-link" href={decodeLegacyURL(attachment.retrievalURL)} target="_blank" rel="noreferrer">
                        {toDisplayText(attachment.fileName)}
                      </a>
                    </td>
                    <td>{toDisplayText(attachment.dateCreated)}</td>
                    <td>
                      <div className="modern-table-actions">
                        <a className="modern-btn modern-btn--mini modern-btn--secondary" href={decodeLegacyURL(attachment.retrievalURL)} target="_blank" rel="noreferrer">
                          Preview
                        </a>
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
            </div>
          </section>

          <section className="avel-joborder-show-split">
            <div className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Job Orders</h2>
                <p className="avel-list-panel__hint">{data.jobOrders.count} linked roles</p>
              </div>
              <DataTable
                columns={[
                  { key: 'title', title: 'Title' },
                  { key: 'status', title: 'Status' },
                  { key: 'metrics', title: 'Pipeline' },
                  { key: 'dates', title: 'Dates' }
                ]}
                hasRows={data.jobOrders.items.length > 0}
                emptyMessage="No job orders."
              >
                {data.jobOrders.items.map((jobOrder) => (
                  <tr key={jobOrder.jobOrderID}>
                    <td>
                      <a className="modern-link" href={ensureModernUIURL(jobOrder.showURL)}>
                        {toDisplayText(jobOrder.title)}
                      </a>
                    </td>
                    <td>{toDisplayText(jobOrder.status)}</td>
                    <td>{jobOrder.pipeline} pipeline / {jobOrder.submitted} submitted</td>
                    <td>{toDisplayText(jobOrder.dateCreated)} / {toDisplayText(jobOrder.dateModified)}</td>
                  </tr>
                ))}
              </DataTable>
            </div>

            <div className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Contacts</h2>
                <p className="avel-list-panel__hint">{data.contacts.activeCount} active of {data.contacts.count}</p>
              </div>
              <DataTable
                columns={[
                  { key: 'name', title: 'Name' },
                  { key: 'title', title: 'Title' },
                  { key: 'contact', title: 'Contact' },
                  { key: 'owner', title: 'Owner' }
                ]}
                hasRows={data.contacts.items.length > 0}
                emptyMessage="No contacts."
              >
                {data.contacts.items.map((contact) => (
                  <tr key={contact.contactID}>
                    <td>
                      <a className="modern-link" href={ensureModernUIURL(contact.showURL)}>
                        {toDisplayText(contact.firstName)} {toDisplayText(contact.lastName, '')}
                      </a>
                      {contact.leftCompany ? <span className="modern-chip modern-chip--critical" style={{ marginLeft: '6px' }}>Left</span> : null}
                    </td>
                    <td>{toDisplayText(contact.title)}</td>
                    <td>
                      {toDisplayText(contact.phone)}
                      {contact.email.trim() !== '' ? ` / ${contact.email}` : ''}
                    </td>
                    <td>{toDisplayText(contact.ownerName)}</td>
                  </tr>
                ))}
              </DataTable>
            </div>
          </section>

          <section className="avel-joborder-show-split">
            <div className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Departments</h2>
              </div>
              {data.departments.length > 0 ? (
                <div className="avel-candidate-tag-cloud">
                  {data.departments.map((department) => (
                    <span key={department.departmentID || department.name} className="modern-chip">
                      {toDisplayText(department.name)}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="modern-state modern-state--empty">No departments configured.</div>
              )}
            </div>

            <div className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Extra Fields</h2>
              </div>
              <DataTable
                columns={[
                  { key: 'field', title: 'Field' },
                  { key: 'value', title: 'Value' }
                ]}
                hasRows={data.extraFields.length > 0}
                emptyMessage="No extra fields."
              >
                {data.extraFields.map((field) => (
                  <tr key={field.fieldName}>
                    <td>{toDisplayText(field.fieldName)}</td>
                    <td>{toDisplayText(field.display)}</td>
                  </tr>
                ))}
              </DataTable>
            </div>
          </section>

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Notes</h2>
            </div>
            <FormattedTextBlock text={toDisplayText(company.notesText, '')} emptyMessage="No notes available." />
          </section>
        </div>

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

        <LegacyFrameModal
          isOpen={!!legacyModal}
          title={legacyModal?.title || 'Legacy Workspace'}
          url={legacyModal?.url || ''}
          onClose={closeLegacyModal}
          showRefreshClose={legacyModal?.showRefreshClose ?? true}
        />
      </PageContainer>
    </div>
  );
}
