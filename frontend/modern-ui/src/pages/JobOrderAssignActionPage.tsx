import { useCallback, useMemo, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { JobOrderAssignCandidateModal } from '../components/primitives/JobOrderAssignCandidateModal';
import { ensureModernUIURL, ensureUIURL } from '../lib/navigation';
import type { UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

function buildSourceURL(): string {
  const url = new URL(window.location.href);
  url.searchParams.delete('format');
  url.searchParams.delete('modernPage');
  url.searchParams.delete('contractVersion');
  url.searchParams.set('ui', 'modern');
  return url.toString();
}

function buildFallbackURL(indexName: string): string {
  const query = new URLSearchParams(window.location.search);
  const jobOrderID = Number(query.get('jobOrderID') || 0);
  if (Number.isFinite(jobOrderID) && jobOrderID > 0) {
    return ensureModernUIURL(`${indexName}?m=joborders&a=show&jobOrderID=${jobOrderID}`);
  }
  return ensureModernUIURL(`${indexName}?m=joborders&a=listByView`);
}

export function JobOrderAssignActionPage({ bootstrap }: Props) {
  const [infoMessage, setInfoMessage] = useState('Open candidate search modal to continue.');
  const [modalOpen, setModalOpen] = useState(true);
  const sourceURL = useMemo(() => buildSourceURL(), []);
  const fallbackURL = useMemo(() => buildFallbackURL(bootstrap.indexName), [bootstrap.indexName]);
  const legacyURL = useMemo(() => ensureUIURL(bootstrap.legacyURL, 'legacy'), [bootstrap.legacyURL]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    window.location.assign(fallbackURL);
  }, [fallbackURL]);

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="Job Order Candidate Search"
        subtitle="Find and assign candidates to this job order in modern mode."
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel">
            <div className="modern-state">{infoMessage}</div>
            <div className="modern-table-actions" style={{ marginTop: '10px' }}>
              <button type="button" className="modern-btn modern-btn--secondary" onClick={() => setModalOpen(true)}>
                Open Candidate Search Modal
              </button>
              <a className="modern-btn modern-btn--secondary" href={fallbackURL}>
                Back To Job Order
              </a>
              <a className="modern-btn modern-btn--secondary" href={legacyURL}>
                Open Legacy Assignment
              </a>
            </div>
          </section>
        </div>
      </PageContainer>

      <JobOrderAssignCandidateModal
        isOpen={modalOpen}
        bootstrap={bootstrap}
        sourceURL={sourceURL}
        subtitle="Search candidates and add them directly to this job order."
        onClose={closeModal}
        onAssigned={(message) => {
          setInfoMessage(message || 'Candidate assigned to job order.');
          closeModal();
        }}
      />
    </div>
  );
}
