import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ensureModernUIURL, ensureUIURL } from '../lib/navigation';
import type { UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

const SUPPORTED_LIST_ACTIONS = new Set([
  'quickactionaddtolistmodal',
  'addtolistfromdatagridmodal'
]);

function normalizeOverlaySourceURL(): string {
  const url = new URL(window.location.href);
  url.searchParams.delete('format');
  url.searchParams.delete('modernPage');
  url.searchParams.delete('contractVersion');
  url.searchParams.set('ui', 'modern');
  return url.toString();
}

export function ListsActionPage({ bootstrap }: Props) {
  const actionKey = String(bootstrap.targetAction || '').toLowerCase();
  const supportedAction = SUPPORTED_LIST_ACTIONS.has(actionKey);
  const overlaySourceURL = useMemo(() => normalizeOverlaySourceURL(), []);
  const [statusMessage, setStatusMessage] = useState(
    supportedAction ? 'Opening add-to-list workspace...' : 'Action is not supported in this native workspace.'
  );
  const [modalLaunchAttempted, setModalLaunchAttempted] = useState(false);
  const legacyURL = useMemo(() => ensureUIURL(bootstrap.legacyURL, 'legacy'), [bootstrap.legacyURL]);
  const listsWorkspaceURL = useMemo(
    () => ensureModernUIURL(`${bootstrap.indexName}?m=lists&a=listByView&ui=modern`),
    [bootstrap.indexName]
  );

  const openAddToListModal = useCallback(() => {
    const event = new CustomEvent('opencats:add-to-list:open', {
      cancelable: true,
      detail: {
        url: overlaySourceURL
      }
    });

    const dispatchResult = window.dispatchEvent(event);
    setModalLaunchAttempted(true);
    if (dispatchResult === false) {
      setStatusMessage('Add-to-list workspace opened. Complete your action in the modal.');
      return;
    }

    setStatusMessage('Unable to open add-to-list workspace from this route. Use legacy as fallback.');
  }, [overlaySourceURL]);

  useEffect(() => {
    if (!supportedAction) {
      return;
    }

    openAddToListModal();
  }, [supportedAction, openAddToListModal]);

  useEffect(() => {
    const handleCompleted = () => {
      setStatusMessage('List action completed successfully.');
    };

    window.addEventListener('opencats:add-to-list:completed', handleCompleted as EventListener);
    return () => {
      window.removeEventListener('opencats:add-to-list:completed', handleCompleted as EventListener);
    };
  }, []);

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="List Action Workspace"
        subtitle={`Executing lists action "${bootstrap.targetAction || '(default)'}" in modern mode.`}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel">
            <div className="modern-state">{statusMessage}</div>
            <div className="modern-table-actions" style={{ marginTop: '10px' }}>
              {supportedAction ? (
                <button type="button" className="modern-btn modern-btn--secondary" onClick={openAddToListModal}>
                  Open Add-To-List Modal
                </button>
              ) : null}
              <a className="modern-btn modern-btn--secondary" href={listsWorkspaceURL}>
                Open Lists Workspace
              </a>
              <a className="modern-btn modern-btn--secondary" href={legacyURL}>
                Open Legacy UI
              </a>
            </div>
            {modalLaunchAttempted ? (
              <div className="modern-state" style={{ marginTop: '10px' }}>
                If the modal was blocked, retry with "Open Add-To-List Modal" or use legacy fallback.
              </div>
            ) : null}
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
