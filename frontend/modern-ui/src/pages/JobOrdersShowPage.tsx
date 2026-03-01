import { useCallback, useEffect, useState } from 'react';
import { fetchJobOrdersShowModernData } from '../lib/api';
import type { JobOrdersShowModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { DataTable } from '../components/primitives/DataTable';
import { ensureModernUIURL } from '../lib/navigation';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type PopupCallback = ((returnValue?: unknown) => void) | null;

type PopupWindow = Window & {
  showPopWin?: (url: string, width: number, height: number, returnFunc?: PopupCallback) => void;
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

function createStatusClassName(statusSlug: string): string {
  return `modern-status modern-status--${statusSlug || 'unknown'}`;
}

export function JobOrdersShowPage({ bootstrap }: Props) {
  const [data, setData] = useState<JobOrdersShowModernDataResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [serverQueryString, setServerQueryString] = useState<string>(() => new URLSearchParams(window.location.search).toString());
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchJobOrdersShowModernData(bootstrap, query)
      .then((result) => {
        if (!isMounted) {
          return;
        }
        setData(result);
      })
      .catch((err: Error) => {
        if (!isMounted) {
          return;
        }
        setError(err.message || 'Unable to load job order profile.');
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

  const navigateWithShowClosed = (showClosed: boolean) => {
    if (!data) {
      return;
    }

    const nextQuery = new URLSearchParams(serverQueryString);
    nextQuery.set('m', 'joborders');
    nextQuery.set('a', 'show');
    nextQuery.set('jobOrderID', String(data.meta.jobOrderID));
    if (showClosed) {
      nextQuery.set('showClosed', '1');
    } else {
      nextQuery.delete('showClosed');
    }
    if (!nextQuery.get('ui')) {
      nextQuery.set('ui', 'modern');
    }

    const nextQueryString = nextQuery.toString();
    window.history.replaceState({}, '', `${bootstrap.indexName}?${nextQueryString}`);
    if (nextQueryString !== serverQueryString) {
      setServerQueryString(nextQueryString);
    }
  };

  if (loading && !data) {
    return <div className="modern-state">Loading job order profile...</div>;
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
    return <EmptyState message="Job order profile not available." />;
  }

  const permissions = data.meta.permissions;
  const jobOrder = data.jobOrder;
  const hasPipelineRows = data.pipeline.items.length > 0;
  const hasAttachments = data.attachments.items.length > 0;
  const hasExtraFields = data.extraFields.length > 0;
  const hasHiringPlanRows = data.hiringPlan.items.length > 0;

  return (
    <div className="avel-dashboard-page avel-joborder-show-page">
      <PageContainer
        title={toDisplayText(jobOrder.title, 'Job Order')}
        subtitle={`Job order #${jobOrder.jobOrderID}`}
        actions={
          <>
            {permissions.canEditJobOrder ? (
              <a className="modern-btn modern-btn--secondary" href={ensureModernUIURL(data.actions.editURL)}>
                Edit Job Order
              </a>
            ) : null}
            {permissions.canAddCandidateToPipeline ? (
              <button
                type="button"
                className="modern-btn modern-btn--secondary"
                onClick={() => openLegacyPopup(data.actions.addCandidateURL, 1120, 760, true)}
              >
                Add Candidate
              </button>
            ) : null}
            <a className="modern-btn modern-btn--secondary" href={decodeLegacyURL(data.actions.legacyURL)}>
              Open Legacy UI
            </a>
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Overview</h2>
              <p className="avel-list-panel__hint">
                {toDisplayText(jobOrder.companyName)} {jobOrder.cityAndState ? `• ${jobOrder.cityAndState}` : ''}
              </p>
            </div>
            <div className="avel-joborder-hero">
              <div className="avel-joborder-hero__chips">
                <span className={createStatusClassName(String(jobOrder.status).toLowerCase().replace(/[^a-z0-9]+/g, '-'))}>
                  {toDisplayText(jobOrder.status)}
                </span>
                {jobOrder.isHot ? <span className="modern-chip modern-chip--warning">Hot</span> : null}
                {jobOrder.isAdminHidden ? <span className="modern-chip modern-chip--critical">Admin Hidden</span> : null}
                {jobOrder.public ? <span className="modern-chip modern-chip--info">Public</span> : null}
              </div>
              <div className="avel-joborder-hero__grid">
                <div><span>Company</span><strong>{toDisplayText(jobOrder.companyName)}</strong></div>
                <div><span>Owner</span><strong>{toDisplayText(jobOrder.ownerFullName)}</strong></div>
                <div><span>Recruiter</span><strong>{toDisplayText(jobOrder.recruiterFullName)}</strong></div>
                <div><span>Type</span><strong>{toDisplayText(jobOrder.typeDescription)}</strong></div>
                <div><span>Start Date</span><strong>{toDisplayText(jobOrder.startDate)}</strong></div>
                <div><span>Modified</span><strong>{toDisplayText(jobOrder.dateModified)}</strong></div>
              </div>
            </div>
          </section>

          <section className="avel-kpi-grid">
            <div className="avel-kpi">
              <span className="avel-kpi__label">Pipeline</span>
              <span className="avel-kpi__value">{jobOrder.pipelineCount}</span>
              <span className="avel-kpi__hint">Active: {data.pipeline.activeCount}</span>
            </div>
            <div className="avel-kpi">
              <span className="avel-kpi__label">Submitted</span>
              <span className="avel-kpi__value">{jobOrder.submittedCount}</span>
              <span className="avel-kpi__hint">Proposed to customer</span>
            </div>
            <div className="avel-kpi">
              <span className="avel-kpi__label">Openings</span>
              <span className="avel-kpi__value">{jobOrder.openingsAvailable}</span>
              <span className="avel-kpi__hint">Total planned: {jobOrder.openings}</span>
            </div>
            <div className="avel-kpi">
              <span className="avel-kpi__label">Age</span>
              <span className="avel-kpi__value">{jobOrder.daysOld}d</span>
              <span className="avel-kpi__hint">Since creation</span>
            </div>
          </section>

          <section className="modern-command-bar modern-command-bar--sticky" aria-label="Job order controls">
            <div className="modern-command-bar__row modern-command-bar__row--meta">
              <label className="modern-command-toggle">
                <input
                  type="checkbox"
                  checked={data.meta.showClosedPipeline}
                  onChange={(event) => navigateWithShowClosed(event.target.checked)}
                />
                <span className="modern-command-toggle__switch" aria-hidden="true" />
                <span>Include closed pipeline entries</span>
              </label>
              {data.comments.flashMessage ? (
                <span className={`modern-chip ${data.comments.flashIsError ? 'modern-chip--critical' : 'modern-chip--success'}`}>
                  {data.comments.flashMessage}
                </span>
              ) : null}
              {data.messages.flashMessage ? (
                <span className={`modern-chip ${data.messages.flashIsError ? 'modern-chip--critical' : 'modern-chip--success'}`}>
                  {data.messages.flashMessage}
                </span>
              ) : null}
            </div>
          </section>

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Pipeline</h2>
              <p className="avel-list-panel__hint">
                Active {data.pipeline.activeCount} • Closed {data.pipeline.closedCount}
              </p>
            </div>
            <DataTable
              columns={[
                { key: 'candidate', title: 'Candidate' },
                { key: 'status', title: 'Status' },
                { key: 'date', title: 'Added' },
                { key: 'owner', title: 'Owner' },
                { key: 'addedBy', title: 'Added By' },
                { key: 'actions', title: 'Actions' }
              ]}
              hasRows={hasPipelineRows}
              emptyMessage="No candidates in pipeline for this job order."
            >
              {data.pipeline.items.map((item) => (
                <tr key={item.candidateJobOrderID}>
                  <td>
                    <a className="modern-link" href={ensureModernUIURL(item.candidateURL)}>
                      {toDisplayText(item.candidateName)}
                    </a>
                    <div className="avel-joborders-flags">
                      {item.isHotCandidate ? <span className="modern-chip modern-chip--warning">Hot</span> : null}
                      {item.isDuplicateCandidate ? <span className="modern-chip modern-chip--critical">Duplicate</span> : null}
                      {!item.isActive ? <span className="modern-chip modern-chip--info">Closed</span> : null}
                    </div>
                  </td>
                  <td>
                    <span className={createStatusClassName(item.statusSlug)}>{toDisplayText(item.statusLabel)}</span>
                  </td>
                  <td>{toDisplayText(item.dateCreated)}</td>
                  <td>{toDisplayText(item.ownerName)}</td>
                  <td>{toDisplayText(item.addedByName)}</td>
                  <td>
                    <div className="modern-table-actions">
                      {permissions.canChangePipelineStatus ? (
                        <button
                          type="button"
                          className="modern-btn modern-btn--secondary modern-btn--mini"
                          onClick={() => openLegacyPopup(item.actions.changeStatusURL, 970, 730, true)}
                        >
                          Status
                        </button>
                      ) : null}
                      {permissions.canRemoveFromPipeline ? (
                        <button
                          type="button"
                          className="modern-btn modern-btn--secondary modern-btn--mini"
                          onClick={() => openLegacyPopup(item.actions.removeFromPipelineURL, 430, 200, true)}
                        >
                          Remove
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="modern-btn modern-btn--secondary modern-btn--mini"
                        onClick={() => openLegacyPopup(item.actions.pipelineDetailsURL, 940, 700, false)}
                      >
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </DataTable>
          </section>

          <section className="avel-joborder-show-split">
            <div className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Notes</h2>
                <p className="avel-list-panel__hint">Description and internal notes</p>
              </div>
              <div className="avel-joborder-richtext">
                <h4>Description</h4>
                <p>{toDisplayText(jobOrder.description)}</p>
                <h4>Notes</h4>
                <p>{toDisplayText(jobOrder.notes)}</p>
              </div>
            </div>

            <div className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Attachments</h2>
                <p className="avel-list-panel__hint">{data.attachments.count} files</p>
              </div>
              <DataTable
                columns={[
                  { key: 'fileName', title: 'File' },
                  { key: 'dateCreated', title: 'Date' }
                ]}
                hasRows={hasAttachments}
                emptyMessage="No attachments."
              >
                {data.attachments.items.map((attachment) => (
                  <tr key={attachment.attachmentID}>
                    <td>
                      {attachment.retrievalURL ? (
                        <a className="modern-link" href={decodeLegacyURL(attachment.retrievalURL)}>
                          {toDisplayText(attachment.fileName)}
                        </a>
                      ) : (
                        <span>{toDisplayText(attachment.fileName)}</span>
                      )}
                    </td>
                    <td>{toDisplayText(attachment.dateCreated)}</td>
                  </tr>
                ))}
              </DataTable>
            </div>
          </section>

          <section className="avel-joborder-show-split">
            <div className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Hiring Plan</h2>
                <p className="avel-list-panel__hint">Total openings: {data.hiringPlan.totalOpenings}</p>
              </div>
              <DataTable
                columns={[
                  { key: 'description', title: 'Description' },
                  { key: 'openings', title: 'Openings' },
                  { key: 'window', title: 'Window' }
                ]}
                hasRows={hasHiringPlanRows}
                emptyMessage="No hiring plan rows."
              >
                {data.hiringPlan.items.map((row) => (
                  <tr key={row.hiringPlanID}>
                    <td>{toDisplayText(row.description)}</td>
                    <td>{row.openings}</td>
                    <td>{`${toDisplayText(row.startDate)} - ${toDisplayText(row.endDate)}`}</td>
                  </tr>
                ))}
              </DataTable>
            </div>

            <div className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Extra Fields</h2>
                <p className="avel-list-panel__hint">Custom metadata</p>
              </div>
              <DataTable
                columns={[
                  { key: 'field', title: 'Field' },
                  { key: 'value', title: 'Value' }
                ]}
                hasRows={hasExtraFields}
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
        </div>
      </PageContainer>
    </div>
  );
}

