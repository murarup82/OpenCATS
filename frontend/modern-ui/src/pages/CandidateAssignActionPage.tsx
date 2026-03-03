import { useCallback, useMemo, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { CandidateAssignJobOrderModal } from '../components/primitives/CandidateAssignJobOrderModal';
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
  const candidateID = Number(query.get('candidateID') || 0);
  if (Number.isFinite(candidateID) && candidateID > 0) {
    return ensureModernUIURL(`${indexName}?m=candidates&a=show&candidateID=${candidateID}`);
  }
  return ensureModernUIURL(`${indexName}?m=candidates&a=listByView`);
}

export function CandidateAssignActionPage({ bootstrap }: Props) {
  const [infoMessage, setInfoMessage] = useState('Open assignment modal to continue.');
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
        title="Candidate Assignment"
        subtitle="Assign this candidate to an open job order in modern mode."
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel">
            <div className="modern-state">{infoMessage}</div>
            <div className="modern-table-actions" style={{ marginTop: '10px' }}>
              <button type="button" className="modern-btn modern-btn--secondary" onClick={() => setModalOpen(true)}>
                Open Assignment Modal
              </button>
              <a className="modern-btn modern-btn--secondary" href={fallbackURL}>
                Back To Candidate
              </a>
              <a className="modern-btn modern-btn--secondary" href={legacyURL}>
                Open Legacy Assignment
              </a>
            </div>
          </section>
        </div>
      </PageContainer>

      <CandidateAssignJobOrderModal
        isOpen={modalOpen}
        bootstrap={bootstrap}
        sourceURL={sourceURL}
        onClose={closeModal}
        onAssigned={(message) => {
          setInfoMessage(message || 'Candidate assigned successfully.');
          closeModal();
        }}
      />
    </div>
  );
}
