import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchCompaniesShowModernData } from '../lib/api';
import type { CompaniesShowModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { DataTable } from '../components/primitives/DataTable';
import { LegacyFrameModal } from '../components/primitives/LegacyFrameModal';
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
    <div className="avel-dashboard-page avel-joborder-show-page">
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
              <DataTable
                columns={[
                  { key: 'field', title: 'Field' },
                  { key: 'value', title: 'Value' }
                ]}
                hasRows={true}
              >
                <tr><td>Phone</td><td>{toDisplayText(company.phone)}</td></tr>
                <tr><td>Address</td><td>{toDisplayText(company.address)}</td></tr>
                <tr><td>Location</td><td>{toDisplayText(company.cityAndState)}</td></tr>
                <tr>
                  <td>Billing Contact</td>
                  <td>
                    {company.billingContactID > 0 ? (
                      <a className="modern-link" href={ensureModernUIURL(`${bootstrap.indexName}?m=contacts&a=show&contactID=${company.billingContactID}`)}>
                        {toDisplayText(company.billingContactFullName)}
                      </a>
                    ) : (
                      'None'
                    )}
                  </td>
                </tr>
                <tr>
                  <td>Web Site</td>
                  <td>
                    {company.webSite.trim() !== '' ? (
                      <a className="modern-link" href={company.webSite} target="_blank" rel="noreferrer">
                        {company.webSite}
                      </a>
                    ) : (
                      '--'
                    )}
                  </td>
                </tr>
                <tr><td>Key Technologies</td><td>{toDisplayText(company.keyTechnologies)}</td></tr>
                <tr><td>Created</td><td>{toDisplayText(company.dateCreated)} ({toDisplayText(company.enteredByFullName)})</td></tr>
                <tr><td>Owner</td><td>{toDisplayText(company.ownerFullName)}</td></tr>
              </DataTable>
            </div>

            <div className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Attachments</h2>
                {permissions.canCreateAttachment ? (
                  <button
                    type="button"
                    className="modern-btn modern-btn--mini modern-btn--secondary"
                    onClick={() =>
                      setLegacyModal({
                        url: decodeLegacyURL(data.actions.createAttachmentURL),
                        title: 'Add Attachment',
                        showRefreshClose: true
                      })
                    }
                  >
                    Add Attachment
                  </button>
                ) : null}
              </div>
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
                            className="modern-btn modern-btn--mini modern-btn--secondary"
                            onClick={() =>
                              setLegacyModal({
                                url: ensureModernUIURL(data.actions.legacyURL),
                                title: 'Manage Attachments (Legacy)',
                                showRefreshClose: true
                              })
                            }
                          >
                            Manage
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
            <p>{toDisplayText(company.notesText, '') || 'No notes available.'}</p>
          </section>
        </div>

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
