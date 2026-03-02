import { useEffect, useState } from 'react';
import { fetchHomeInboxModernData } from '../lib/api';
import { useServerQueryState } from '../lib/useServerQueryState';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import type { HomeInboxModernDataResponse, UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

export function HomeInboxPage({ bootstrap }: Props) {
  const [data, setData] = useState<HomeInboxModernDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const { serverQueryString } = useServerQueryState(bootstrap.indexName);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchHomeInboxModernData(bootstrap, query)
      .then((result) => {
        if (!mounted) {
          return;
        }
        setData(result);
      })
      .catch((err: Error) => {
        if (!mounted) {
          return;
        }
        setError(err.message || 'Unable to load inbox.');
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [bootstrap, serverQueryString]);

  if (loading && !data) {
    return <div className="modern-state">Loading inbox...</div>;
  }

  if (error) {
    return <ErrorState message={error} actionLabel="Open Legacy UI" actionURL={bootstrap.legacyURL} />;
  }

  if (!data) {
    return <EmptyState message="Inbox data is unavailable." />;
  }

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="My Inbox"
        subtitle={`${data.summary.threadCount} threads | ${data.summary.messageCount} messages`}
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={data.actions.homeURL}>
              Home
            </a>
            <a className="modern-btn modern-btn--secondary" href={data.actions.myNotesURL}>
              My Notes
            </a>
            <a className="modern-btn modern-btn--secondary" href={data.actions.legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          {data.state.flashMessage ? (
            <div className={`modern-state${data.state.flashIsError ? ' modern-state--error' : ''}`} style={{ marginBottom: '10px' }}>
              {data.state.flashMessage}
            </div>
          ) : null}
          {!data.state.schemaAvailable ? (
            <ErrorState message="Inbox tables are missing. Apply schema migrations first." actionLabel="Open Legacy UI" actionURL={data.actions.legacyURL} />
          ) : (
            <section className="modern-command-grid modern-command-grid--dual">
              <article className="avel-list-panel">
                <div className="avel-list-panel__header">
                  <h3 className="avel-list-panel__title">Threads</h3>
                </div>
                {data.threads.length === 0 ? (
                  <div className="modern-state">No conversations yet.</div>
                ) : (
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Conversation</th>
                        <th>Unread</th>
                        <th>Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.threads.map((thread) => (
                        <tr key={`thread-${thread.threadKey}`}>
                          <td>
                            <a className="modern-link" href={thread.threadURL}>
                              {thread.entityName}
                            </a>
                            <div className="modern-state" style={{ marginTop: '4px' }}>
                              {thread.entityType}
                              {thread.entitySubName ? ` | ${thread.entitySubName}` : ''}
                            </div>
                          </td>
                          <td>{thread.unreadCount}</td>
                          <td>{thread.lastMessageAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </article>

              <article className="avel-list-panel">
                <div className="avel-list-panel__header">
                  <h3 className="avel-list-panel__title">
                    {data.selectedThread.entityName || 'Conversation'}
                  </h3>
                </div>
                {data.selectedThread.openURL ? (
                  <div className="modern-table-actions" style={{ marginBottom: '8px' }}>
                    <a className="modern-btn modern-btn--secondary modern-btn--mini" href={data.selectedThread.openURL}>
                      {data.selectedThread.openLabel || 'Open Source Record'}
                    </a>
                  </div>
                ) : null}
                {data.messages.length === 0 ? (
                  <div className="modern-state">No messages.</div>
                ) : (
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {data.messages.map((message, index) => (
                      <article key={`msg-${index}`} className="avel-list-panel" style={{ background: '#f9fcff' }}>
                        <div className="avel-list-panel__header">
                          <h4 className="avel-list-panel__title">{message.senderName}</h4>
                          <span className="modern-chip modern-chip--info">{message.dateCreated}</span>
                        </div>
                        {message.mentionedUsers ? (
                          <div className="modern-state" style={{ marginBottom: '6px' }}>
                            @{message.mentionedUsers}
                          </div>
                        ) : null}
                        <div dangerouslySetInnerHTML={{ __html: message.bodyHTML || '' }} />
                      </article>
                    ))}
                  </div>
                )}
              </article>
            </section>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
