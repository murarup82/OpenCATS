import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchContactsShowModernData } from '../lib/api';
import type { ContactsShowModernDataResponse, UIModeBootstrap } from '../types';
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

export function ContactsShowPage({ bootstrap }: Props) {
  const [data, setData] = useState<ContactsShowModernDataResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [serverQueryString] = useState<string>(() => new URLSearchParams(window.location.search).toString());
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
    fetchContactsShowModernData(bootstrap, query)
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
        setError(err.message || 'Unable to load contact profile.');
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

  const openAddToListOverlay = useCallback((sourceURL: string) => {
    const normalizedURL = decodeLegacyURL(sourceURL);
    if (normalizedURL === '') {
      return;
    }

    window.dispatchEvent(
      new CustomEvent('opencats:add-to-list:open', {
        detail: {
          url: normalizedURL
        }
      })
    );
  }, []);

  if (loading && !data) {
    return <div className="modern-state">Loading contact profile...</div>;
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
    return <EmptyState message="Contact profile not available." />;
  }

  const permissions = data.meta.permissions;
  const contact = data.contact;

  return (
    <div className="avel-dashboard-page avel-joborder-show-page">
      <PageContainer
        title={toDisplayText(contact.fullName, 'Contact')}
        subtitle={`Contact #${contact.contactID}`}
        actions={
          <>
            {permissions.canEditContact ? (
              <a className="modern-btn modern-btn--secondary" href={ensureModernUIURL(data.actions.editURL)}>
                Edit Contact
              </a>
            ) : null}
            <a className="modern-btn modern-btn--secondary" href={decodeLegacyURL(data.actions.downloadVCardURL)}>
              Download vCard
            </a>
            {permissions.canViewHistory ? (
              <button
                type="button"
                className="modern-btn modern-btn--secondary"
                onClick={() =>
                  setLegacyModal({
                    url: ensureModernUIURL(data.actions.historyURL),
                    title: 'Contact History',
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
                <h2 className="avel-list-panel__title">Contact Details</h2>
                <div className="modern-table-actions">
                  {contact.isHotContact ? <span className="modern-chip modern-chip--warning">Hot Contact</span> : null}
                  {contact.leftCompany ? <span className="modern-chip modern-chip--critical">No Longer At Company</span> : null}
                </div>
              </div>
              <DataTable
                columns={[
                  { key: 'field', title: 'Field' },
                  { key: 'value', title: 'Value' }
                ]}
                hasRows={true}
              >
                <tr>
                  <td>Company</td>
                  <td>
                    {contact.companyID > 0 ? (
                      <a className="modern-link" href={ensureModernUIURL(contact.companyShowURL)}>
                        {toDisplayText(contact.companyName)}
                      </a>
                    ) : (
                      toDisplayText(contact.companyName)
                    )}
                  </td>
                </tr>
                <tr><td>Title</td><td>{toDisplayText(contact.title)}</td></tr>
                <tr><td>Department</td><td>{toDisplayText(contact.department)}</td></tr>
                <tr>
                  <td>Reports To</td>
                  <td>
                    {contact.reportsToID > 0 ? (
                      <a className="modern-link" href={ensureModernUIURL(contact.reportsToURL)}>
                        {toDisplayText(contact.reportsToName)}
                      </a>
                    ) : (
                      'None'
                    )}
                    {contact.reportsToTitle.trim() !== '' ? ` (${contact.reportsToTitle})` : ''}
                  </td>
                </tr>
                <tr><td>E-Mail</td><td>{toDisplayText(contact.email1)}</td></tr>
                <tr><td>Phone (Cell)</td><td>{toDisplayText(contact.phoneCell)}</td></tr>
                <tr><td>Phone (Work)</td><td>{toDisplayText(contact.phoneWork)}</td></tr>
                <tr><td>Phone (Other)</td><td>{toDisplayText(contact.phoneOther)}</td></tr>
                <tr><td>Location</td><td>{toDisplayText(contact.cityAndState)}</td></tr>
                <tr><td>Address</td><td>{toDisplayText(contact.address)}</td></tr>
                <tr><td>Created</td><td>{toDisplayText(contact.dateCreated)} ({toDisplayText(contact.enteredByFullName)})</td></tr>
                <tr><td>Owner</td><td>{toDisplayText(contact.ownerFullName)}</td></tr>
              </DataTable>
            </div>

            <div className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Notes & Upcoming Events</h2>
                <div className="modern-table-actions">
                  {permissions.canAddActivityScheduleEvent ? (
                    <button
                      type="button"
                      className="modern-btn modern-btn--mini modern-btn--secondary"
                      onClick={() =>
                        setLegacyModal({
                          url: decodeLegacyURL(data.actions.scheduleEventURL),
                          title: 'Schedule Event',
                          showRefreshClose: true
                        })
                      }
                    >
                      Schedule Event
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="modern-state modern-state--empty" style={{ marginBottom: '10px', textAlign: 'left' }}>
                {contact.notesHTML.trim() !== '' ? (
                  <div
                    style={{ whiteSpace: 'normal' }}
                    dangerouslySetInnerHTML={{ __html: contact.notesHTML }}
                  />
                ) : (
                  'No notes.'
                )}
              </div>

              <DataTable
                columns={[
                  { key: 'date', title: 'Date' },
                  { key: 'title', title: 'Event' },
                  { key: 'enteredBy', title: 'By' }
                ]}
                hasRows={data.upcomingEvents.items.length > 0}
                emptyMessage="No upcoming events."
              >
                {data.upcomingEvents.items.map((event) => (
                  <tr key={event.eventID}>
                    <td>{toDisplayText(event.dateDisplay)}</td>
                    <td>
                      <a className="modern-link" href={ensureModernUIURL(event.showURL)}>
                        {toDisplayText(event.title)}
                      </a>
                    </td>
                    <td>{toDisplayText(event.enteredByName)}</td>
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
                  { key: 'pipeline', title: 'Pipeline' },
                  { key: 'owner', title: 'Owner' }
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
                    <td>{jobOrder.pipeline} / {jobOrder.submitted}</td>
                    <td>{toDisplayText(jobOrder.ownerName)}</td>
                  </tr>
                ))}
              </DataTable>
            </div>

            <div className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Lists</h2>
                {permissions.canManageLists ? (
                  <button
                    type="button"
                    className="modern-btn modern-btn--mini modern-btn--secondary"
                    onClick={() => openAddToListOverlay(data.actions.manageListsURL)}
                  >
                    Manage Lists
                  </button>
                ) : null}
              </div>
              <DataTable
                columns={[
                  { key: 'name', title: 'List Name' }
                ]}
                hasRows={data.lists.items.length > 0}
                emptyMessage="Contact is not assigned to any saved list."
              >
                {data.lists.items.map((list) => (
                  <tr key={list.listID}>
                    <td>
                      {permissions.canOpenLists ? (
                        <a className="modern-link" href={ensureModernUIURL(list.showURL)}>
                          {toDisplayText(list.name)}
                        </a>
                      ) : (
                        toDisplayText(list.name)
                      )}
                    </td>
                  </tr>
                ))}
              </DataTable>
            </div>
          </section>

          <section className="avel-joborder-show-split">
            <div className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Activity</h2>
                {permissions.canLogActivityScheduleEvent ? (
                  <button
                    type="button"
                    className="modern-btn modern-btn--mini modern-btn--secondary"
                    onClick={() =>
                      setLegacyModal({
                        url: decodeLegacyURL(data.actions.addActivityURL),
                        title: 'Log Activity / Schedule Event',
                        showRefreshClose: true
                      })
                    }
                  >
                    Log Activity
                  </button>
                ) : null}
              </div>
              <DataTable
                columns={[
                  { key: 'date', title: 'Date' },
                  { key: 'type', title: 'Type' },
                  { key: 'regarding', title: 'Regarding' },
                  { key: 'notes', title: 'Notes' },
                  { key: 'entered', title: 'By' }
                ]}
                hasRows={data.activity.items.length > 0}
                emptyMessage="No activity logged."
              >
                {data.activity.items.map((entry) => (
                  <tr key={entry.activityID}>
                    <td>{toDisplayText(entry.dateCreated)}</td>
                    <td>{toDisplayText(entry.type)}</td>
                    <td>{toDisplayText(entry.regarding)}</td>
                    <td>{toDisplayText(entry.notes)}</td>
                    <td>{toDisplayText(entry.enteredByName)}</td>
                  </tr>
                ))}
              </DataTable>
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
                emptyMessage="No extra fields configured."
              >
                {data.extraFields.map((field) => (
                  <tr key={`${field.fieldName}:${field.display}`}>
                    <td>{toDisplayText(field.fieldName)}</td>
                    <td>{toDisplayText(field.display)}</td>
                  </tr>
                ))}
              </DataTable>
            </div>
          </section>
        </div>
      </PageContainer>

      {legacyModal ? (
        <LegacyFrameModal
          open={true}
          title={legacyModal.title}
          src={legacyModal.url}
          width="min(980px, 96vw)"
          height="min(760px, 88vh)"
          onClose={(options) => closeLegacyModal(Boolean(options?.refreshOnClose))}
          showRefreshClose={legacyModal.showRefreshClose}
        />
      ) : null}
    </div>
  );
}
