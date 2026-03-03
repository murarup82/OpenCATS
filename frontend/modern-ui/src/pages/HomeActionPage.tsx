import { useEffect, useMemo } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import type { UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

const HOME_INBOX_ACTIONS = new Set([
  'postinboxmessage',
  'createinboxnote',
  'createinboxtodo',
  'archiveinboxthread',
  'deleteinboxthread'
]);

const HOME_MYNOTES_ACTIONS = new Set([
  'addpersonalitem',
  'movepersonalnotetotodo',
  'togglepersonaltodo',
  'setpersonaltodostatus',
  'updatepersonaltodo',
  'deletepersonalitem',
  'appendpersonalnote',
  'updatepersonalnote',
  'sendpersonalnote',
  'setpersonalnotearchived'
]);

const HOME_OVERVIEW_ACTIONS = new Set([
  'addsavedsearch',
  'deletesavedsearch',
  'submitfeedback'
]);

function buildLegacyURL(rawURL: string): string {
  const url = new URL(String(rawURL || ''), window.location.href);
  url.searchParams.set('ui', 'legacy');
  return url.toString();
}

function buildModernHomeURL(indexName: string, targetAction: string): string | null {
  const actionKey = String(targetAction || '').toLowerCase();
  if (actionKey === 'quicksearch') {
    return null;
  }

  const nextQuery = new URLSearchParams(window.location.search);
  nextQuery.delete('m');
  nextQuery.delete('a');
  nextQuery.delete('ui');
  nextQuery.delete('format');
  nextQuery.delete('modernPage');
  nextQuery.delete('contractVersion');

  let destinationAction = 'home';
  if (HOME_INBOX_ACTIONS.has(actionKey)) {
    destinationAction = 'inbox';
  } else if (HOME_MYNOTES_ACTIONS.has(actionKey)) {
    destinationAction = 'myNotes';
  } else if (HOME_OVERVIEW_ACTIONS.has(actionKey)) {
    destinationAction = 'home';
  } else {
    return null;
  }

  nextQuery.set('m', 'home');
  nextQuery.set('a', destinationAction);
  nextQuery.set('ui', 'modern');

  return `${indexName}?${nextQuery.toString()}`;
}

export function HomeActionPage({ bootstrap }: Props) {
  const targetAction = String(bootstrap.targetAction || '');
  const modernURL = useMemo(
    () => buildModernHomeURL(bootstrap.indexName, targetAction),
    [bootstrap.indexName, targetAction]
  );
  const legacyURL = useMemo(() => buildLegacyURL(bootstrap.legacyURL), [bootstrap.legacyURL]);
  const destinationURL = modernURL || legacyURL;

  useEffect(() => {
    window.location.replace(destinationURL);
  }, [destinationURL]);

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="Redirecting Action"
        subtitle={`Processing home action "${targetAction || '(default)'}" in modern flow.`}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel">
            <div className="modern-state">Redirecting...</div>
            <div className="modern-table-actions" style={{ marginTop: '10px' }}>
              <a className="modern-btn modern-btn--secondary" href={destinationURL}>
                Continue
              </a>
              <a className="modern-btn modern-btn--secondary" href={legacyURL}>
                Open Legacy Action
              </a>
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
