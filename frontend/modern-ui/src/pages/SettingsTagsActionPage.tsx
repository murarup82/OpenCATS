import { useEffect, useMemo, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ensureUIURL } from '../lib/navigation';
import type { UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type ExecutionState = 'forwarding' | 'error';

const TAG_ACTION_TITLES: Record<string, string> = {
  ajax_tags_add: 'Add Tag',
  ajax_tags_del: 'Delete Tag',
  ajax_tags_upd: 'Update Tag'
};

function toText(value: unknown): string {
  return String(value || '')
    .trim()
    .toLowerCase();
}

export function SettingsTagsActionPage({ bootstrap }: Props) {
  const actionKey = useMemo(() => toText(bootstrap.targetAction), [bootstrap.targetAction]);
  const legacyURL = useMemo(() => ensureUIURL(bootstrap.legacyURL, 'legacy'), [bootstrap.legacyURL]);
  const title = useMemo(() => TAG_ACTION_TITLES[actionKey] || 'Settings Tags Action', [actionKey]);
  const canContinue = legacyURL !== '';

  const [attemptID, setAttemptID] = useState(0);
  const [executionState, setExecutionState] = useState<ExecutionState>('forwarding');

  useEffect(() => {
    if (!canContinue) {
      setExecutionState('error');
      return;
    }

    setExecutionState('forwarding');
    const timer = window.setTimeout(() => {
      window.location.assign(legacyURL);
    }, 80);

    return () => window.clearTimeout(timer);
  }, [attemptID, canContinue, legacyURL]);

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title={title}
        subtitle={`Processing ${toText(bootstrap.targetModule) || 'settings'}.${actionKey || 'action'} through legacy tags endpoint.`}
        actions={
          <>
            {canContinue ? (
              <a className="modern-btn modern-btn--secondary" href={legacyURL}>
                Continue
              </a>
            ) : null}
            <button
              type="button"
              className="modern-btn modern-btn--secondary"
              onClick={() => {
                setAttemptID((current) => current + 1);
              }}
            >
              Retry
            </button>
          </>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel">
            <div className={`modern-state${executionState === 'error' ? ' modern-state--error' : ''}`}>
              {executionState === 'error'
                ? 'Legacy endpoint URL is unavailable for this tags action.'
                : 'Forwarding settings tags action to legacy endpoint...'}
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}

