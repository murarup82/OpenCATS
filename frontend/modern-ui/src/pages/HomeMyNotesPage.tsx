import { DragEvent, useEffect, useRef, useState } from 'react';
import { fetchHomeMyNotesModernData, setHomeMyNotesTodoStatus } from '../lib/api';
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

type TodoStatusKey = keyof HomeMyNotesModernDataResponse['todosByStatus'];
type TodoRow = HomeMyNotesModernDataResponse['todosByStatus']['open'][number];

const TODO_SECTIONS: TodoStatusKey[] = ['open', 'in_progress', 'blocked', 'done'];
type MyNotesPane = 'both' | 'notes' | 'todos';
type NoteScope = 'all' | 'active' | 'archived';
type TodoFocus = 'all' | TodoStatusKey;
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

function moveTodoInData(
  payload: HomeMyNotesModernDataResponse | null,
  itemID: number,
  fromStatus: TodoStatusKey,
  toStatus: TodoStatusKey
): HomeMyNotesModernDataResponse | null {
  if (!payload || fromStatus === toStatus) {
    return payload;
  }

  const nextTodosByStatus: HomeMyNotesModernDataResponse['todosByStatus'] = {
    open: [...payload.todosByStatus.open],
    in_progress: [...payload.todosByStatus.in_progress],
    blocked: [...payload.todosByStatus.blocked],
    done: [...payload.todosByStatus.done]
  };

  let movedItem: TodoRow | null = null;
  nextTodosByStatus[fromStatus] = nextTodosByStatus[fromStatus].filter((todo) => {
    if (movedItem || Number(todo.itemID || 0) !== itemID) {
      return true;
    }
    movedItem = todo;
    return false;
  });

  if (!movedItem) {
    return payload;
  }

  nextTodosByStatus[toStatus] = [{ ...movedItem, taskStatus: toStatus }, ...nextTodosByStatus[toStatus]];

  const openCount = nextTodosByStatus.open.length + nextTodosByStatus.in_progress.length + nextTodosByStatus.blocked.length;
  const doneCount = nextTodosByStatus.done.length;

  return {
    ...payload,
    todosByStatus: nextTodosByStatus,
    summary: {
      ...payload.summary,
      todoOpenCount: openCount,
      todoDoneCount: doneCount,
      todoStatusOpenCount: nextTodosByStatus.open.length,
      todoStatusInProgressCount: nextTodosByStatus.in_progress.length,
      todoStatusBlockedCount: nextTodosByStatus.blocked.length,
      todoStatusDoneCount: nextTodosByStatus.done.length
    }
  };
}

function getAdjacentStatus(statusKey: TodoStatusKey, direction: -1 | 1): TodoStatusKey | null {
  const index = TODO_SECTIONS.indexOf(statusKey);
  if (index < 0) {
    return null;
  }
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= TODO_SECTIONS.length) {
    return null;
  }
  return TODO_SECTIONS[nextIndex];
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
  const [draggedTodo, setDraggedTodo] = useState<{ itemID: number; fromStatus: TodoStatusKey } | null>(null);
  const [dropStatus, setDropStatus] = useState<TodoStatusKey | null>(null);
  const [movePendingItemID, setMovePendingItemID] = useState<number>(0);
  const [todoMoveError, setTodoMoveError] = useState<string>('');
  const [todoMoveNotice, setTodoMoveNotice] = useState<string>('');
  const todoBoardRef = useRef<HTMLDivElement | null>(null);
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

  const moveTodoToStatus = async (itemID: number, fromStatus: TodoStatusKey, toStatus: TodoStatusKey): Promise<void> => {
    if (!data || fromStatus === toStatus || movePendingItemID > 0) {
      return;
    }

    const mutationURL = String(data.actions.mutations?.setTodoStatusURL || '').trim();
    const mutationToken = String(data.actions.mutations?.setTodoStatusToken || '').trim();
    if (mutationURL === '' || mutationToken === '') {
      setTodoMoveError('To-do move is unavailable in this session. Refresh the page or open Legacy UI.');
      return;
    }

    setMovePendingItemID(itemID);
    setTodoMoveError('');
    setTodoMoveNotice('');

    try {
      const result = await setHomeMyNotesTodoStatus(mutationURL, {
        itemID,
        taskStatus: toStatus,
        securityToken: mutationToken
      });
      if (!result || result.success !== true) {
        throw new Error(result?.message || 'Unable to update to-do status.');
      }

      setData((previous) => moveTodoInData(previous, itemID, fromStatus, toStatus));
      const toLabel = toStatus
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
      setTodoMoveNotice(`Moved item #${itemID} to ${toLabel}.`);
    } catch (moveError) {
      const message =
        moveError instanceof Error && moveError.message.trim() !== ''
          ? moveError.message
          : 'Unable to update to-do status.';
      setTodoMoveError(message);
    } finally {
      setMovePendingItemID(0);
      setDraggedTodo(null);
      setDropStatus(null);
    }
  };

  const scrollTodoBoardBy = (offset: number) => {
    const board = todoBoardRef.current;
    if (!board) {
      return;
    }
    board.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const handleTodoCardDragStart = (event: DragEvent<HTMLElement>, itemID: number, fromStatus: TodoStatusKey) => {
    if (movePendingItemID > 0) {
      event.preventDefault();
      return;
    }
    setTodoMoveError('');
    setDraggedTodo({ itemID, fromStatus });
    setDropStatus(null);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', `${itemID}:${fromStatus}`);
    }
  };

  const handleTodoCardDragEnd = () => {
    setDraggedTodo(null);
    setDropStatus(null);
  };

  const handleTodoColumnDragOver = (event: DragEvent<HTMLDivElement>, statusKey: TodoStatusKey) => {
    if (!draggedTodo || draggedTodo.fromStatus === statusKey || movePendingItemID > 0) {
      return;
    }
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    setDropStatus(statusKey);
  };

  const handleTodoColumnDragLeave = (statusKey: TodoStatusKey) => {
    if (dropStatus === statusKey) {
      setDropStatus(null);
    }
  };

  const handleTodoColumnDrop = async (event: DragEvent<HTMLDivElement>, toStatus: TodoStatusKey) => {
    if (!draggedTodo || movePendingItemID > 0) {
      return;
    }
    event.preventDefault();
    if (draggedTodo.fromStatus === toStatus) {
      setDraggedTodo(null);
      setDropStatus(null);
      return;
    }
    await moveTodoToStatus(draggedTodo.itemID, draggedTodo.fromStatus, toStatus);
  };

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
  const showNotesPane = pane === 'both' || pane === 'notes';
  const showTodosPane = pane === 'both' || pane === 'todos';
  const visibleTodoSections = TODO_SECTIONS.filter((statusKey) => todoFocus === 'all' || todoFocus === statusKey);
  const visibleTodoCount = visibleTodoSections.reduce((total, statusKey) => total + filteredTodosByStatus[statusKey].length, 0);
  const hasAnyFilteredTodos = visibleTodoCount > 0;
  const notesSubtitle =
    noteScope === 'all' ? 'All notes' : noteScope === 'active' ? 'Active notes only' : 'Archived notes only';
  const resultsSummary = `Showing ${showNotesPane ? filteredNotes.length : 0} notes and ${
    showTodosPane ? visibleTodoCount : 0
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
                {showTodosPane && todoMoveError ? (
                  <p className="avel-my-notes-results avel-my-notes-results--error" role="alert">
                    {todoMoveError}
                  </p>
                ) : null}
                {showTodosPane && todoMoveNotice ? (
                  <p className="avel-my-notes-results avel-my-notes-results--success" role="status" aria-live="polite">
                    {todoMoveNotice}
                  </p>
                ) : null}
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
                      <span className="modern-chip modern-chip--info">{visibleTodoCount}</span>
                    </div>
                    {!hasAnyFilteredTodos ? (
                      <div className="modern-state">No to-do items for the current filter.</div>
                    ) : (
                      <div className="modern-kanban-board-wrap avel-my-notes-kanban-shell">
                        <div className="modern-kanban-board__header">
                          <span className="modern-kanban-board__title">To-do Workflow</span>
                          <div className="modern-kanban-board__header-actions">
                            <span className="modern-kanban-board__hint">Drag a card to move status. Use arrow buttons for keyboard/mouse fallback.</span>
                            <button
                              type="button"
                              className="modern-kanban-board__scroll-btn"
                              onClick={() => scrollTodoBoardBy(-320)}
                              aria-label="Scroll board left"
                            >
                              <span aria-hidden="true">&lt;</span>
                            </button>
                            <button
                              type="button"
                              className="modern-kanban-board__scroll-btn"
                              onClick={() => scrollTodoBoardBy(320)}
                              aria-label="Scroll board right"
                            >
                              <span aria-hidden="true">&gt;</span>
                            </button>
                          </div>
                        </div>

                        <div ref={todoBoardRef} className="modern-kanban-board__viewport" aria-label="To-do kanban board">
                          <div className="modern-kanban-board">
                            {visibleTodoSections.map((statusKey) => {
                              const rows = filteredTodosByStatus[statusKey];
                              const share = visibleTodoCount > 0 ? Math.round((rows.length / visibleTodoCount) * 100) : 0;
                              const progressWidth = Math.min(100, Math.max(0, share));
                              const canDropHere = !!draggedTodo && draggedTodo.fromStatus !== statusKey && movePendingItemID === 0;
                              return (
                                <section key={`todo-${statusKey}`} className={`modern-kanban-column modern-kanban-column--todo-${statusKey}`}>
                                  <header className="modern-kanban-column__header">
                                    <div className="modern-kanban-column__title-wrap">
                                      <h4 className="modern-kanban-column__title">
                                        <span className="modern-kanban-column__stage-dot" aria-hidden="true"></span>
                                        {toTodoSectionLabel(statusKey)}
                                      </h4>
                                      <span className="modern-kanban-column__subtitle">{share}% of visible tasks</span>
                                    </div>
                                    <div className="modern-kanban-column__count-wrap">
                                      <span className="modern-kanban-column__count">{rows.length}</span>
                                      <span className="modern-kanban-column__count-label">tasks</span>
                                    </div>
                                  </header>
                                  <div className="modern-kanban-column__progress" aria-hidden="true">
                                    <span className="modern-kanban-column__progress-fill" style={{ width: `${progressWidth}%` }} />
                                  </div>
                                  <div
                                    className={`modern-kanban-column__body${canDropHere ? ' is-drop-enabled' : ''}${dropStatus === statusKey ? ' is-drop-target' : ''}`}
                                    onDragOver={(event) => handleTodoColumnDragOver(event, statusKey)}
                                    onDragLeave={() => handleTodoColumnDragLeave(statusKey)}
                                    onDrop={(event) => {
                                      void handleTodoColumnDrop(event, statusKey);
                                    }}
                                  >
                                    {rows.length === 0 ? (
                                      <div className="modern-kanban-column__empty">
                                        <span className="modern-kanban-column__empty-icon" aria-hidden="true">
                                          0
                                        </span>
                                        <span>No tasks in this stage.</span>
                                      </div>
                                    ) : (
                                      <div className="modern-kanban-column__cards">
                                        {rows.slice(0, 40).map((todo) => {
                                          const isDragging = !!draggedTodo && draggedTodo.itemID === todo.itemID && draggedTodo.fromStatus === statusKey;
                                          const isPending = movePendingItemID === todo.itemID;
                                          const previousStatus = getAdjacentStatus(statusKey, -1);
                                          const nextStatus = getAdjacentStatus(statusKey, 1);
                                          return (
                                            <article
                                              key={`todo-item-${statusKey}-${todo.itemID}`}
                                              className={`avel-my-notes-kanban-card${isDragging ? ' is-dragging' : ''}${isPending ? ' is-pending' : ''}`}
                                              draggable={!isPending}
                                              onDragStart={(event) => handleTodoCardDragStart(event, todo.itemID, statusKey)}
                                              onDragEnd={handleTodoCardDragEnd}
                                            >
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
                                              <div className="avel-my-notes-kanban-card__actions">
                                                <button
                                                  type="button"
                                                  className="modern-btn modern-btn--mini modern-btn--secondary"
                                                  disabled={isPending || !previousStatus}
                                                  onClick={() => {
                                                    if (previousStatus) {
                                                      void moveTodoToStatus(todo.itemID, statusKey, previousStatus);
                                                    }
                                                  }}
                                                >
                                                  Move Left
                                                </button>
                                                <button
                                                  type="button"
                                                  className="modern-btn modern-btn--mini modern-btn--secondary"
                                                  disabled={isPending || !nextStatus}
                                                  onClick={() => {
                                                    if (nextStatus) {
                                                      void moveTodoToStatus(todo.itemID, statusKey, nextStatus);
                                                    }
                                                  }}
                                                >
                                                  Move Right
                                                </button>
                                              </div>
                                            </article>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                </section>
                              );
                            })}
                          </div>
                        </div>
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
