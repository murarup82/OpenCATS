import { useCallback, useEffect, useState } from 'react';
import { fetchCandidatesShowModernData } from '../lib/api';
import type { CandidatesShowModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { DataTable } from '../components/primitives/DataTable';
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

function ensureModernUIURL(url: string): string {
  const raw = String(url || '').trim();
  if (raw === '') {
    return raw;
  }

  try {
    const parsed = new URL(raw, window.location.href);
    parsed.searchParams.set('ui', 'modern');
    if (parsed.origin === window.location.origin) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
    return parsed.toString();
  } catch (error) {
    const hasQuery = raw.includes('?');
    const hasUI = /(?:\?|&)ui=/.test(raw);
    if (hasUI) {
      return raw.replace(/([?&])ui=[^&#]*/i, '$1ui=modern');
    }
    return `${raw}${hasQuery ? '&' : '?'}ui=modern`;
  }
}

function formatQuestionnaireDate(value: unknown): string {
  const raw = String(value || '').trim();
  if (raw === '') {
    return '--';
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return raw;
  }

  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function createStatusClassName(statusSlug: string): string {
  return `modern-status modern-status--${statusSlug || 'unknown'}`;
}

export function CandidatesShowPage({ bootstrap }: Props) {
  const [data, setData] = useState<CandidatesShowModernDataResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [serverQueryString, setServerQueryString] = useState<string>(() => new URLSearchParams(window.location.search).toString());
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchCandidatesShowModernData(bootstrap, query)
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
        setError(err.message || 'Unable to load candidate profile.');
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
    const nextQuery = new URLSearchParams(serverQueryString);
    nextQuery.set('m', 'candidates');
    nextQuery.set('a', 'show');
    if (data) {
      nextQuery.set('candidateID', String(data.meta.candidateID));
    }
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
    return <div className="modern-state">Loading candidate profile...</div>;
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
    return <EmptyState message="Candidate profile not available." />;
  }

  const permissions = data.meta.permissions;
  const candidate = data.candidate;
  const gdpr = data.gdpr;
  const showClosed = data.meta.showClosedPipeline;

  return (
    <div className="avel-dashboard-page avel-candidate-show-page">
      <PageContainer
        title={toDisplayText(candidate.fullName, 'Candidate')}
        subtitle={`Candidate profile #${candidate.candidateID}`}
        actions={
          <>
            {permissions.canEditCandidate ? (
              <a className="modern-btn modern-btn--secondary" href={ensureModernUIURL(decodeLegacyURL(data.actions.editURL))}>
                Edit Candidate
              </a>
            ) : null}
            {permissions.canAddToJobOrder ? (
              <button
                type="button"
                className="modern-btn modern-btn--secondary"
                onClick={() => openLegacyPopup(data.actions.addToJobOrderURL, 1120, 760, true)}
              >
                Add To Job Order
              </button>
            ) : null}
            <a className="modern-btn modern-btn--secondary" href={decodeLegacyURL(data.actions.legacyURL)}>
              Open Legacy UI
            </a>
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-candidate-hero">
            <div className="avel-candidate-hero__identity">
              <div className="avel-candidate-hero__name">
                {toDisplayText(candidate.fullName)}
                {!candidate.isActive ? <span className="modern-chip modern-chip--critical">Inactive</span> : null}
                {candidate.isHot ? <span className="modern-chip modern-chip--warning">Hot</span> : null}
              </div>
              <div className="avel-candidate-hero__meta">
                {String(candidate.email1 || '').trim() !== '' ? (
                  <a className="modern-link" href={`mailto:${candidate.email1}`}>
                    {toDisplayText(candidate.email1)}
                  </a>
                ) : (
                  <span>{toDisplayText(candidate.email1)}</span>
                )}
                <span>{toDisplayText(candidate.phoneCell)}</span>
                <span>{`${toDisplayText(candidate.city)}, ${toDisplayText(candidate.country)}`}</span>
                <span>Owner: {toDisplayText(candidate.owner)}</span>
                <span>Source: {toDisplayText(candidate.source)}</span>
              </div>
              {candidate.duplicates.length > 0 ? (
                <div className="avel-candidate-hero__duplicates">
                  {candidate.duplicates.map((duplicate) => (
                    <a key={duplicate.candidateID} className="modern-chip modern-chip--info" href={ensureModernUIURL(duplicate.showURL)}>
                      Duplicate #{duplicate.candidateID}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
            {candidate.profileImageURL !== '' ? (
              <div className="avel-candidate-hero__avatar">
                <img src={decodeLegacyURL(candidate.profileImageURL)} alt={candidate.fullName} />
              </div>
            ) : null}
          </section>

          <section className="avel-kpi-grid">
            <div className="avel-kpi">
              <span className="avel-kpi__label">Pipeline Entries</span>
              <span className="avel-kpi__value">{candidate.pipelineCount}</span>
              <span className="avel-kpi__hint">Active: {data.pipelines.activeCount}</span>
            </div>
            <div className="avel-kpi">
              <span className="avel-kpi__label">Proposed</span>
              <span className="avel-kpi__value">{candidate.submittedCount}</span>
              <span className="avel-kpi__hint">To customer</span>
            </div>
            <div className="avel-kpi">
              <span className="avel-kpi__label">Comments</span>
              <span className="avel-kpi__value">{data.comments.count}</span>
              <span className="avel-kpi__hint">Profile notes</span>
            </div>
            <div className="avel-kpi">
              <span className="avel-kpi__label">Attachments</span>
              <span className="avel-kpi__value">{data.attachments.items.length}</span>
              <span className="avel-kpi__hint">Documents</span>
            </div>
          </section>

          <div className="avel-candidate-grid">
            <section className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Details</h2>
                <p className="avel-list-panel__hint">Core profile data and custom fields.</p>
              </div>
              <div className="avel-candidate-details">
                <div><strong>Current Employer:</strong> {toDisplayText(candidate.currentEmployer)}</div>
                <div><strong>Date Available:</strong> {toDisplayText(candidate.dateAvailable)}</div>
                <div><strong>Best Time To Call:</strong> {toDisplayText(candidate.bestTimeToCall)}</div>
                <div><strong>Can Relocate:</strong> {toDisplayText(candidate.canRelocate)}</div>
                <div><strong>Current Pay:</strong> {toDisplayText(candidate.currentPay)}</div>
                <div><strong>Desired Pay:</strong> {toDisplayText(candidate.desiredPay)}</div>
                <div><strong>Created:</strong> {toDisplayText(candidate.dateCreated)} ({toDisplayText(candidate.enteredBy)})</div>
                <div><strong>Modified:</strong> {toDisplayText(candidate.dateModified)}</div>
                <div className="avel-candidate-details__full"><strong>Address:</strong> {toDisplayText(candidate.address)}</div>
                <div className="avel-candidate-details__full"><strong>Key Skills:</strong> {toDisplayText(candidate.keySkills)}</div>
                {data.extraFields.map((field) => (
                  <div key={field.fieldName} className="avel-candidate-details__full">
                    <strong>{toDisplayText(field.fieldName)}:</strong> {toDisplayText(field.display)}
                  </div>
                ))}
              </div>
            </section>

            <section className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">GDPR</h2>
                <p className="avel-list-panel__hint">
                  Latest status: {toDisplayText(gdpr.latestRequest.status)}
                </p>
              </div>
              <div className="avel-candidate-details">
                <div><strong>Request Created:</strong> {toDisplayText(gdpr.latestRequest.createdAt)}</div>
                <div><strong>Email Sent:</strong> {toDisplayText(gdpr.latestRequest.emailSentAt)}</div>
                <div><strong>Link Expires:</strong> {toDisplayText(gdpr.latestRequest.expiresAt)}</div>
                <div><strong>Deleted At:</strong> {toDisplayText(gdpr.latestRequest.deletedAt)}</div>
                {gdpr.sendDisabledReason !== '' ? (
                  <div className="avel-candidate-details__full">
                    <strong>Send Disabled:</strong> {gdpr.sendDisabledReason}
                  </div>
                ) : null}
                {gdpr.legacyProof.link !== '' ? (
                  <div className="avel-candidate-details__full">
                    <strong>Legacy Proof:</strong>{' '}
                    <a className="modern-link" href={decodeLegacyURL(gdpr.legacyProof.link)} target="_blank" rel="noreferrer">
                      {toDisplayText(gdpr.legacyProof.fileName, 'View file')}
                    </a>
                  </div>
                ) : null}
                {gdpr.flashMessage !== '' ? (
                  <div className="avel-candidate-details__full">
                    <strong>Info:</strong> {gdpr.flashMessage}
                  </div>
                ) : null}
              </div>
            </section>
          </div>

          {data.eeoValues.length > 0 ? (
            <section className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">EEO Information</h2>
                <p className="avel-list-panel__hint">Compliance-related candidate attributes.</p>
              </div>
              <div className="avel-candidate-details">
                {data.eeoValues.map((item) => (
                  <div key={item.fieldName}>
                    <strong>{toDisplayText(item.fieldName)}:</strong> {toDisplayText(item.fieldValue)}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Notes & Comments</h2>
              <p className="avel-list-panel__hint">Profile notes plus latest team comments.</p>
            </div>
            <div className="avel-candidate-notes">
              <pre>{toDisplayText(candidate.notesText, '') || 'No notes provided.'}</pre>
            </div>
            {data.comments.items.length > 0 ? (
              <div className="avel-candidate-comments">
                {data.comments.items.slice(0, 8).map((comment) => (
                  <article key={comment.activityID} className="avel-candidate-comment">
                    <div className="avel-candidate-comment__meta">
                      <span>{toDisplayText(comment.category)}</span>
                      <span>{toDisplayText(comment.enteredBy)}</span>
                      <span>{toDisplayText(comment.dateCreated)}</span>
                    </div>
                    <p>{toDisplayText(comment.commentText, '')}</p>
                  </article>
                ))}
              </div>
            ) : null}
          </section>

          <section className="avel-list-panel">
            <div className="avel-list-panel__header">
              <h2 className="avel-list-panel__title">Pipelines</h2>
              <div className="avel-candidates-pagination">
                <label className="modern-command-toggle">
                  <input
                    type="checkbox"
                    checked={showClosed}
                    onChange={(event) => navigateWithShowClosed(event.target.checked)}
                  />
                  <span className="modern-command-toggle__switch" aria-hidden="true"></span>
                  <span>Show Closed</span>
                </label>
              </div>
            </div>
            <DataTable
              columns={[
                { key: 'job', title: 'Job Order' },
                { key: 'company', title: 'Company' },
                { key: 'status', title: 'Status' },
                { key: 'owner', title: 'Owner' },
                { key: 'date', title: 'Added' },
                { key: 'actions', title: 'Actions' }
              ]}
              hasRows={data.pipelines.items.length > 0}
              emptyMessage="No pipeline entries for this candidate."
            >
              {data.pipelines.items.map((pipeline) => (
                <tr key={pipeline.candidateJobOrderID}>
                  <td>
                    <a className="modern-link" href={decodeLegacyURL(pipeline.jobOrderURL)}>
                      {toDisplayText(pipeline.jobOrderTitle)}
                    </a>
                    {pipeline.clientJobID !== '' ? <div>{pipeline.clientJobID}</div> : null}
                  </td>
                  <td>
                    <a className="modern-link" href={decodeLegacyURL(pipeline.companyURL)}>
                      {toDisplayText(pipeline.companyName)}
                    </a>
                  </td>
                  <td>
                    <span className={createStatusClassName(pipeline.statusSlug)}>{toDisplayText(pipeline.statusLabel)}</span>
                    {!pipeline.isActive ? <span className="modern-chip modern-chip--critical">Closed</span> : null}
                  </td>
                  <td>{toDisplayText(pipeline.ownerName)}</td>
                  <td>{toDisplayText(pipeline.dateCreated)}</td>
                  <td>
                    <div className="modern-table-actions">
                      {permissions.canChangePipelineStatus ? (
                        <button
                          type="button"
                          className="modern-btn modern-btn--mini modern-btn--secondary"
                          onClick={() => openLegacyPopup(pipeline.actions.changeStatusURL, 700, 620, true)}
                        >
                          Change Status
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="modern-btn modern-btn--mini modern-btn--secondary"
                        onClick={() => openLegacyPopup(pipeline.actions.pipelineDetailsURL, 1200, 760, false)}
                      >
                        Details
                      </button>
                      {permissions.canRemoveFromPipeline ? (
                        <button
                          type="button"
                          className="modern-btn modern-btn--mini modern-btn--secondary"
                          onClick={() => openLegacyPopup(pipeline.actions.removeFromPipelineURL, 500, 320, true)}
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </DataTable>
          </section>

          <div className="avel-candidate-grid">
            <section className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Attachments</h2>
                {permissions.canCreateAttachment ? (
                  <button
                    type="button"
                    className="modern-btn modern-btn--mini modern-btn--secondary"
                    onClick={() => openLegacyPopup(data.actions.createAttachmentURL, 480, 220, true)}
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
                        {attachment.previewAvailable ? (
                          <a className="modern-btn modern-btn--mini modern-btn--secondary" href={decodeLegacyURL(attachment.previewURL)} target="_blank" rel="noreferrer">
                            Preview
                          </a>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </DataTable>
            </section>

            <section className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Tags & Lists</h2>
                <div className="modern-table-actions">
                  {permissions.canManageTags ? (
                    <button
                      type="button"
                      className="modern-btn modern-btn--mini modern-btn--secondary"
                      onClick={() => openLegacyPopup(data.actions.addTagsURL, 460, 240, true)}
                    >
                      Manage Tags
                    </button>
                  ) : null}
                  {permissions.canManageLists ? (
                    <button
                      type="button"
                      className="modern-btn modern-btn--mini modern-btn--secondary"
                      onClick={() => openLegacyPopup(data.actions.addToListURL, 720, 520, true)}
                    >
                      Manage Lists
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="avel-candidate-tag-cloud">
                {data.tags.length > 0 ? data.tags.map((tag) => <span key={tag} className="modern-chip">{tag}</span>) : <span>No tags.</span>}
              </div>
              <ul className="avel-candidate-lists">
                {data.lists.map((list) => (
                  <li key={list.listID}>
                    <a className="modern-link" href={decodeLegacyURL(list.url)}>
                      {toDisplayText(list.name)}
                    </a>
                  </li>
                ))}
                {data.lists.length === 0 ? <li>No lists linked.</li> : null}
              </ul>
            </section>
          </div>

          <div className="avel-candidate-grid">
            <section className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Upcoming Events</h2>
                <p className="avel-list-panel__hint">Calendar items linked to this profile.</p>
              </div>
              {data.calendar.length > 0 ? (
                <ul className="avel-candidate-lists">
                  {data.calendar.slice(0, 10).map((eventItem) => (
                    <li key={eventItem.eventID}>
                      <a className="modern-link" href={decodeLegacyURL(eventItem.eventURL)}>
                        {toDisplayText(eventItem.dateShow)}: {toDisplayText(eventItem.title)}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="modern-state modern-state--empty">No upcoming events.</div>
              )}
            </section>

            <section className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Questionnaires</h2>
                <p className="avel-list-panel__hint">Submitted candidate questionnaires.</p>
              </div>
              {data.questionnaires.length > 0 ? (
                <DataTable
                  columns={[
                    { key: 'title', title: 'Title' },
                    { key: 'completed', title: 'Completed' },
                    { key: 'description', title: 'Description' },
                    { key: 'actions', title: 'Actions' }
                  ]}
                  hasRows={data.questionnaires.length > 0}
                >
                  {data.questionnaires.slice(0, 10).map((questionnaire, index) => {
                    const row = questionnaire as Record<string, unknown>;
                    const rawTitle = row['questionnaireTitle'];
                    const title = toDisplayText(rawTitle);
                    const titleEncoded = encodeURIComponent(String(rawTitle || ''));
                    const viewURL =
                      `${bootstrap.indexName}?m=candidates&a=show_questionnaire&candidateID=${candidate.candidateID}` +
                      `&questionnaireTitle=${titleEncoded}&print=no&ui=legacy`;
                    const printURL =
                      `${bootstrap.indexName}?m=candidates&a=show_questionnaire&candidateID=${candidate.candidateID}` +
                      `&questionnaireTitle=${titleEncoded}&print=yes&ui=legacy`;

                    return (
                      <tr key={`${title}-${index}`}>
                        <td>{title}</td>
                        <td>{formatQuestionnaireDate(row['questionnaireDate'])}</td>
                        <td>{toDisplayText(row['questionnaireDescription'])}</td>
                        <td>
                          <div className="modern-table-actions">
                            <a className="modern-btn modern-btn--mini modern-btn--secondary" href={viewURL}>
                              View
                            </a>
                            <a className="modern-btn modern-btn--mini modern-btn--secondary" href={printURL}>
                              Print
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </DataTable>
              ) : (
                <div className="modern-state modern-state--empty">No questionnaires available.</div>
              )}
            </section>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
