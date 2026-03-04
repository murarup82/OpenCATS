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
type MyNotesPane = 'both' | 'notes' | 'todos';
type NoteScope = 'all' | 'active' | 'archived';
type TodoFocus = 'all' | keyof HomeMyNotesModernDataResponse['todosByStatus'];
type NoteSort = 'updated-desc' | 'updated-asc' | 'title-asc';
type TodoSort = 'due-soonest' | 'priority-desc' | 'title-asc';
type TodoFlagFilter = 'all' | 'overdue' | 'reminder-due';

function normalizeSearchValue(value: string): string {
  return String(value || '').trim().toLowerCase();
}

function stripHTML(value: string): string {
  const raw = String(value || '');
  if (raw === '') {
    return '';
  }
  if (typeof document === 'undefined') {
    return raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  const template = document.createElement('template');
  template.innerHTML = raw;
  return String(template.content.textContent || '').replace(/\s+/g, ' ').trim();
}

function parseTimestamp(value: string): number {
  const parsed = Date.parse(String(value || '').trim());
  return Number.isNaN(parsed) ? 0 : parsed;
}

function priorityWeight(label: string): number {
  const normalized = String(label || '').trim().toLowerCase();
  if (normalized.includes('high')) {
    return 3;
  }
  if (normalized.includes('medium')) {
    return 2;
  }
  if (normalized.includes('low')) {
    return 1;
  }
  return 0;
}

function parseDueDateWeight(value: string): number {
  const parsed = Date.parse(String(value || '').trim());
  if (Number.isNaN(parsed)) {
    return Number.MAX_SAFE_INTEGER;
  }
  return parsed;
}

export function HomeMyNotesPage({ bootstrap }: Props) {
  const [data, setData] = useState<HomeMyNotesModernDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>('');
  const [pane, setPane] = useState<MyNotesPane>('both');
  const [noteScope, setNoteScope] = useState<NoteScope>('all');
  const [todoFocus, setTodoFocus] = useState<TodoFocus>('all');
  const [noteSort, setNoteSort] = useState<NoteSort>('updated-desc');
  const [todoSort, setTodoSort] = useState<TodoSort>('due-soonest');
  const [todoFlagFilter, setTodoFlagFilter] = useState<TodoFlagFilter>('all');
  const { serverQueryString } = useServerQueryState(bootstrap.indexName);

  const clearAllFilters = () => {
    setSearchValue('');
    setPane('both');
    setNoteScope('all');
    setTodoFocus('all');
    setNoteSort('updated-desc');
    setTodoSort('due-soonest');
    setTodoFlagFilter('all');
  };

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

  const searchNeedle = normalizeSearchValue(searchValue);
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
  const matchesSearch = (parts: Array<string>) =>
    searchNeedle === '' || parts.some((part) => String(part || '').toLowerCase().includes(searchNeedle));
  const filteredNotes = data.notes
    .filter((note) => {
      if (noteScope === 'active' && note.isArchived) {
        return false;
      }
      if (noteScope === 'archived' && !note.isArchived) {
        return false;
      }
      return matchesSearch([note.title, stripHTML(note.bodyHTML), note.dateCreated, note.dateModified]);
    })
    .sort((left, right) => {
      if (noteSort === 'title-asc') {
        return String(left.title || '').localeCompare(String(right.title || ''));
      }
      const leftTime = parseTimestamp(left.dateModified || left.dateCreated);
      const rightTime = parseTimestamp(right.dateModified || right.dateCreated);
      return noteSort === 'updated-asc' ? leftTime - rightTime : rightTime - leftTime;
    });
  const filteredTodosByStatus: HomeMyNotesModernDataResponse['todosByStatus'] = {
    open: [],
    in_progress: [],
    blocked: [],
    done: []
  };

  TODO_SECTIONS.forEach((statusKey) => {
    if (todoFocus !== 'all' && todoFocus !== statusKey) {
      filteredTodosByStatus[statusKey] = [];
      return;
    }
    filteredTodosByStatus[statusKey] = data.todosByStatus[statusKey]
      .filter((todo) => {
        if (!matchesSearch([todo.title, stripHTML(todo.bodyHTML), todo.priorityLabel, todo.dueDate])) {
          return false;
        }
        if (todoFlagFilter === 'overdue') {
          return todo.isOverdue;
        }
        if (todoFlagFilter === 'reminder-due') {
          return todo.isReminderDue;
        }
        return true;
      })
      .sort((left, right) => {
        if (todoSort === 'title-asc') {
          return String(left.title || '').localeCompare(String(right.title || ''));
        }
        if (todoSort === 'priority-desc') {
          const leftPriority = priorityWeight(left.priorityLabel);
          const rightPriority = priorityWeight(right.priorityLabel);
          if (rightPriority !== leftPriority) {
            return rightPriority - leftPriority;
          }
          return parseDueDateWeight(left.dueDate) - parseDueDateWeight(right.dueDate);
        }
        return parseDueDateWeight(left.dueDate) - parseDueDateWeight(right.dueDate);
      });
  });
  const filteredTodoCount = TODO_SECTIONS.reduce((total, statusKey) => total + filteredTodosByStatus[statusKey].length, 0);
  const showNotesPane = pane === 'both' || pane === 'notes';
  const showTodosPane = pane === 'both' || pane === 'todos';
  const hasAnyFilteredTodos = filteredTodoCount > 0;
  const notesSubtitle =
    noteScope === 'all' ? 'All notes' : noteScope === 'active' ? 'Active notes only' : 'Archived notes only';
  const resultsSummary = `Showing ${showNotesPane ? filteredNotes.length : 0} notes and ${
    showTodosPane ? filteredTodoCount : 0
  } to-do items.`;

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

              <section className="modern-command-bar avel-my-notes-toolbar" aria-label="My notes filters">
                <label className="modern-field modern-field--search avel-my-notes-search" htmlFor="my-notes-search">
                  <span className="modern-label">Search</span>
                  <input
                    id="my-notes-search"
                    type="search"
                    className="modern-input"
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Search title, body, date, or priority"
                  />
                </label>
                <div className="avel-my-notes-toolbar-row">
                  <label className="modern-command-field">
                    <span className="modern-command-label">Note Sort</span>
                    <select
                      className="avel-form-control"
                      value={noteSort}
                      onChange={(event) => setNoteSort(event.target.value as NoteSort)}
                    >
                      <option value="updated-desc">Recently Updated</option>
                      <option value="updated-asc">Oldest Updated</option>
                      <option value="title-asc">Title A-Z</option>
                    </select>
                  </label>
                  <label className="modern-command-field">
                    <span className="modern-command-label">To-do Sort</span>
                    <select
                      className="avel-form-control"
                      value={todoSort}
                      onChange={(event) => setTodoSort(event.target.value as TodoSort)}
                    >
                      <option value="due-soonest">Due Soonest</option>
                      <option value="priority-desc">Priority (High First)</option>
                      <option value="title-asc">Title A-Z</option>
                    </select>
                  </label>
                  <label className="modern-command-field">
                    <span className="modern-command-label">To-do Flag</span>
                    <select
                      className="avel-form-control"
                      value={todoFlagFilter}
                      onChange={(event) => setTodoFlagFilter(event.target.value as TodoFlagFilter)}
                    >
                      <option value="all">All</option>
                      <option value="overdue">Overdue</option>
                      <option value="reminder-due">Reminder Due</option>
                    </select>
                  </label>
                  <button type="button" className="modern-btn modern-btn--mini modern-btn--secondary" onClick={clearAllFilters}>
                    Clear Filters
                  </button>
                </div>
                <div className="avel-my-notes-filter-groups">
                  <div className="avel-my-notes-toggle-group" role="group" aria-label="Workspace pane">
                    <button type="button" className={`modern-btn modern-btn--mini ${pane === 'both' ? 'modern-btn--emphasis' : 'modern-btn--secondary'}`} onClick={() => setPane('both')}>
                      Both
                    </button>
                    <button type="button" className={`modern-btn modern-btn--mini ${pane === 'notes' ? 'modern-btn--emphasis' : 'modern-btn--secondary'}`} onClick={() => setPane('notes')}>
                      Notes
                    </button>
                    <button type="button" className={`modern-btn modern-btn--mini ${pane === 'todos' ? 'modern-btn--emphasis' : 'modern-btn--secondary'}`} onClick={() => setPane('todos')}>
                      To-do
                    </button>
                  </div>
                  <div className="avel-my-notes-toggle-group" role="group" aria-label="Note scope">
                    <button type="button" className={`modern-btn modern-btn--mini ${noteScope === 'all' ? 'modern-btn--emphasis' : 'modern-btn--secondary'}`} onClick={() => setNoteScope('all')}>
                      All Notes
                    </button>
                    <button type="button" className={`modern-btn modern-btn--mini ${noteScope === 'active' ? 'modern-btn--emphasis' : 'modern-btn--secondary'}`} onClick={() => setNoteScope('active')}>
                      Active
                    </button>
                    <button type="button" className={`modern-btn modern-btn--mini ${noteScope === 'archived' ? 'modern-btn--emphasis' : 'modern-btn--secondary'}`} onClick={() => setNoteScope('archived')}>
                      Archived
                    </button>
                  </div>
                  <div className="avel-my-notes-toggle-group" role="group" aria-label="To-do status focus">
                    <button type="button" className={`modern-btn modern-btn--mini ${todoFocus === 'all' ? 'modern-btn--emphasis' : 'modern-btn--secondary'}`} onClick={() => setTodoFocus('all')}>
                      All To-do
                    </button>
                    {TODO_SECTIONS.map((statusKey) => (
                      <button
                        key={`todo-focus-${statusKey}`}
                        type="button"
                        className={`modern-btn modern-btn--mini ${todoFocus === statusKey ? 'modern-btn--emphasis' : 'modern-btn--secondary'}`}
                        onClick={() => setTodoFocus(statusKey)}
                      >
                        {toTodoSectionLabel(statusKey)}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="avel-my-notes-results" role="status" aria-live="polite">
                  {resultsSummary}
                </p>
              </section>

              <section className="modern-command-grid modern-command-grid--dual">
                {showNotesPane ? (
                  <article className="avel-list-panel avel-my-notes-panel">
                    <div className="avel-list-panel__header">
                      <h3 className="avel-list-panel__title">Notes</h3>
                      <span className="modern-chip modern-chip--info">{filteredNotes.length}</span>
                    </div>
                    <p className="avel-list-panel__hint">{notesSubtitle}</p>
                    {filteredNotes.length === 0 ? (
                      <div className="avel-richtext-block">No notes provided for the current filter.</div>
                    ) : (
                      <div className="avel-my-notes-stack">
                        {filteredNotes.slice(0, 40).map((note) => (
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
                ) : null}

                {showTodosPane ? (
                  <article className="avel-list-panel avel-my-notes-panel">
                    <div className="avel-list-panel__header">
                      <h3 className="avel-list-panel__title">To-do Boards</h3>
                      <span className="modern-chip modern-chip--info">{filteredTodoCount}</span>
                    </div>
                    {!hasAnyFilteredTodos ? (
                      <div className="modern-state">No to-do items for the current filter.</div>
                    ) : (
                      <div className="avel-my-notes-stack">
                        {TODO_SECTIONS.map((statusKey) => {
                          const rows = filteredTodosByStatus[statusKey];
                          if (todoFocus !== 'all' && todoFocus !== statusKey) {
                            return null;
                          }
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
                    )}
                  </article>
                ) : null}
              </section>
            </>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
