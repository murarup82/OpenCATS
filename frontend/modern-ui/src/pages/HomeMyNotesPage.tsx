import { useEffect, useState } from 'react';
import { fetchHomeMyNotesModernData } from '../lib/api';
import { useServerQueryState } from '../lib/useServerQueryState';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { FormattedTextBlock } from '../components/primitives/FormattedTextBlock';
import type { HomeMyNotesModernDataResponse, UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

const TODO_SECTIONS: Array<keyof HomeMyNotesModernDataResponse['todosByStatus']> = ['open', 'in_progress', 'blocked', 'done'];

export function HomeMyNotesPage({ bootstrap }: Props) {
  const [data, setData] = useState<HomeMyNotesModernDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const { serverQueryString } = useServerQueryState(bootstrap.indexName);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchHomeMyNotesModernData(bootstrap, query)
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
        setError(err.message || 'Unable to load My Notes.');
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
    return <div className="modern-state">Loading my notes...</div>;
  }

  if (error) {
    return <ErrorState message={error} actionLabel="Open Legacy UI" actionURL={bootstrap.legacyURL} />;
  }

  if (!data) {
    return <EmptyState message="My Notes data is unavailable." />;
  }

  const todoLabelByStatus = data.todoStatuses.reduce<Record<string, string>>((labels, option) => {
    labels[String(option.value || '')] = String(option.label || '').trim();
    return labels;
  }, {});

  const toTodoSectionLabel = (statusKey: keyof HomeMyNotesModernDataResponse['todosByStatus']) => {
    const mapped = String(todoLabelByStatus[statusKey] || '').trim();
    if (mapped !== '') {
      return mapped;
    }
    return statusKey
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="My Notes & To-do"
        subtitle="Personal notes and action tracking in modern workspace."
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={data.actions.homeURL}>
              Home
            </a>
            <a className="modern-btn modern-btn--secondary" href={data.actions.inboxURL}>
              Inbox
            </a>
            <a className="modern-btn modern-btn--secondary" href={data.actions.legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          {data.state.flashMessage ? (
            <div
              className={`modern-state${data.state.flashIsError ? ' modern-state--error' : ''}`}
              style={{ marginBottom: '10px' }}
              role={data.state.flashIsError ? 'alert' : 'status'}
            >
              {data.state.flashMessage}
            </div>
          ) : null}
          {!data.state.schemaAvailable ? (
            <ErrorState message="My Notes / To-do table is missing. Apply schema migrations first." actionLabel="Open Legacy UI" actionURL={data.actions.legacyURL} />
          ) : (
            <>
              <section className="avel-kpi-grid" style={{ marginBottom: '10px' }}>
                <article className="avel-kpi">
                  <p className="avel-kpi__label">Active Notes</p>
                  <p className="avel-kpi__value">{data.summary.notesCount}</p>
                </article>
                <article className="avel-kpi">
                  <p className="avel-kpi__label">Archived Notes</p>
                  <p className="avel-kpi__value">{data.summary.archivedNotesCount}</p>
                </article>
                <article className="avel-kpi">
                  <p className="avel-kpi__label">Open To-do</p>
                  <p className="avel-kpi__value">{data.summary.todoOpenCount}</p>
                </article>
                <article className="avel-kpi">
                  <p className="avel-kpi__label">Done To-do</p>
                  <p className="avel-kpi__value">{data.summary.todoDoneCount}</p>
                </article>
              </section>

              <section className="modern-command-grid modern-command-grid--dual">
                <article className="avel-list-panel avel-my-notes-panel">
                  <div className="avel-list-panel__header">
                    <h3 className="avel-list-panel__title">Notes</h3>
                  </div>
                  {data.notes.length === 0 ? (
                    <div className="avel-richtext-block">No notes provided.</div>
                  ) : (
                    <div className="avel-my-notes-stack">
                      {data.notes.slice(0, 40).map((note) => (
                        <article key={`note-${note.itemID}`} className="avel-list-panel avel-my-notes-card">
                          <div className="avel-list-panel__header">
                            <h4 className="avel-list-panel__title">{note.title || `Note #${note.itemID}`}</h4>
                            {note.isArchived ? <span className="modern-chip modern-chip--warn">Archived</span> : null}
                          </div>
                          <div className="avel-my-notes-meta">Updated {note.dateModified || note.dateCreated || '--'}</div>
                          <FormattedTextBlock text={note.bodyHTML || ''} emptyMessage="No content provided." />
                        </article>
                      ))}
                    </div>
                  )}
                </article>

                <article className="avel-list-panel avel-my-notes-panel">
                  <div className="avel-list-panel__header">
                    <h3 className="avel-list-panel__title">To-do Boards</h3>
                  </div>
                  <div className="avel-my-notes-stack">
                    {TODO_SECTIONS.map((statusKey) => {
                      const rows = data.todosByStatus[statusKey];
                      return (
                        <section key={`todo-${statusKey}`} className="avel-list-panel avel-my-notes-card">
                          <div className="avel-list-panel__header">
                            <h4 className="avel-list-panel__title">{toTodoSectionLabel(statusKey)}</h4>
                            <span className="modern-chip modern-chip--info">{rows.length}</span>
                          </div>
                          {rows.length === 0 ? (
                            <div className="modern-state">No items.</div>
                          ) : (
                            <div className="avel-my-notes-stack avel-my-notes-stack--compact">
                              {rows.slice(0, 12).map((todo) => (
                                <article key={`todo-item-${statusKey}-${todo.itemID}`} className="avel-list-panel avel-my-notes-card avel-my-notes-card--todo">
                                  <div className="avel-list-panel__header">
                                    <h5 className="avel-list-panel__title">{todo.title || `To-do #${todo.itemID}`}</h5>
                                    <div className="avel-my-notes-chip-row">
                                      <span className="modern-chip modern-chip--info">{todo.priorityLabel || 'Priority'}</span>
                                      {todo.isOverdue ? <span className="modern-chip modern-chip--warn">Overdue</span> : null}
                                      {todo.isReminderDue ? <span className="modern-chip modern-chip--warn">Reminder Due</span> : null}
                                    </div>
                                  </div>
                                  {todo.dueDate ? <div className="avel-my-notes-meta">Due {todo.dueDate}</div> : null}
                                  <FormattedTextBlock text={todo.bodyHTML || ''} emptyMessage="No details provided." />
                                </article>
                              ))}
                            </div>
                          )}
                        </section>
                      );
                    })}
                  </div>
                </article>
              </section>
            </>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
