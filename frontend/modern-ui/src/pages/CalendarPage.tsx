import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createCalendarEvent,
  deleteCalendarEvent,
  fetchCalendarModernData,
  updateCalendarEvent
} from '../lib/api';
import type { CalendarModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { DataTable } from '../components/primitives/DataTable';
import { ConfirmActionModal } from '../components/primitives/ConfirmActionModal';
import { MutationErrorSurface } from '../components/primitives/MutationErrorSurface';
import { MutationToast, type MutationToastState } from '../components/primitives/MutationToast';
import { ensureModernUIURL } from '../lib/navigation';
import { usePageRefreshEvents } from '../lib/usePageRefreshEvents';
import { InlineModal, SelectMenu } from '../ui-core';
import type { SelectMenuOption } from '../ui-core';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
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

function decodeURL(url: string): string {
  return String(url || '').replace(/&amp;/g, '&');
}

type CalendarModalMode = 'create' | 'edit';

type CalendarEventEditorState = {
  eventID: number;
  eventTypeID: number;
  title: string;
  description: string;
  dateISO: string;
  timeHHMM: string;
  allDay: boolean;
  duration: number;
  isPublic: boolean;
  dataItemID: number;
  dataItemType: number;
  jobOrderID: number;
};

const DEFAULT_EVENT_TIME = '09:00';

function normalizeTimeHHMM(value: unknown): string {
  const normalized = String(value || '').trim();
  if (/^([01]\d|2[0-3]):([0-5]\d)$/.test(normalized)) {
    return normalized;
  }

  return DEFAULT_EVENT_TIME;
}

function parseTimeDisplayToHHMM(value: unknown): string {
  const normalized = String(value || '').trim().toUpperCase();
  const match = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!match) {
    return DEFAULT_EVENT_TIME;
  }

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3];
  if (!Number.isFinite(hour) || !Number.isFinite(minute) || minute < 0 || minute > 59) {
    return DEFAULT_EVENT_TIME;
  }
  if (hour < 1 || hour > 12) {
    return DEFAULT_EVENT_TIME;
  }

  if (meridiem === 'PM' && hour < 12) {
    hour += 12;
  }
  if (meridiem === 'AM' && hour === 12) {
    hour = 0;
  }

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function parseQueryInteger(query: URLSearchParams, key: string, fallback: number): number {
  const raw = String(query.get(key) || '').trim();
  if (!/^-?\d+$/.test(raw)) {
    return fallback;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseQueryBoolean(query: URLSearchParams, key: string, fallback: boolean): boolean {
  const raw = String(query.get(key) || '').trim().toLowerCase();
  if (raw === '') {
    return fallback;
  }
  if (raw === '1' || raw === 'true' || raw === 'yes' || raw === 'on') {
    return true;
  }
  if (raw === '0' || raw === 'false' || raw === 'no' || raw === 'off') {
    return false;
  }
  return fallback;
}

function parseLegacyMDYToISO(value: string): string {
  const normalized = String(value || '').trim();
  const match = normalized.match(/^(\d{1,2})-(\d{1,2})-(\d{2}|\d{4})$/);
  if (!match) {
    return '';
  }

  const month = Number(match[1]);
  const day = Number(match[2]);
  const yearRaw = Number(match[3]);
  if (!Number.isFinite(month) || !Number.isFinite(day) || !Number.isFinite(yearRaw)) {
    return '';
  }

  let year = yearRaw;
  if (year < 100) {
    year += year >= 70 ? 1900 : 2000;
  }
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) {
    return '';
  }

  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function resolveEntryDateISO(query: URLSearchParams, fallbackISO: string): string {
  const iso = String(query.get('dateISO') || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    return iso;
  }

  const legacyDate = parseLegacyMDYToISO(query.get('dateAdd') || query.get('dateEdit') || '');
  if (legacyDate !== '') {
    return legacyDate;
  }

  const year = parseQueryInteger(query, 'year', 0);
  const month = parseQueryInteger(query, 'month', 0);
  const day = parseQueryInteger(query, 'day', 0);
  if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
    return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  return fallbackISO;
}

function resolveEntryTimeHHMM(query: URLSearchParams): string {
  const direct = normalizeTimeHHMM(query.get('timeHHMM'));
  if (direct !== DEFAULT_EVENT_TIME || String(query.get('timeHHMM') || '').trim() !== '') {
    return direct;
  }

  const hourRaw = String(query.get('hour') || '').trim();
  const minuteRaw = String(query.get('minute') || '').trim();
  const meridiem = String(query.get('meridiem') || '').trim().toUpperCase();
  if (/^\d{1,2}$/.test(hourRaw) && /^\d{1,2}$/.test(minuteRaw) && (meridiem === 'AM' || meridiem === 'PM')) {
    const hour = Number(hourRaw);
    const minute = Number(minuteRaw);
    if (hour >= 1 && hour <= 12 && minute >= 0 && minute <= 59) {
      const display = `${hour}:${String(minute).padStart(2, '0')} ${meridiem}`;
      return parseTimeDisplayToHHMM(display);
    }
  }

  return DEFAULT_EVENT_TIME;
}

function buildInitialEditorState(data: CalendarModernDataResponse): CalendarEventEditorState {
  return {
    eventID: 0,
    eventTypeID: Number(data.options.eventTypes[0]?.typeID || 0),
    title: '',
    description: '',
    dateISO: data.filters.selectedDateISO,
    timeHHMM: DEFAULT_EVENT_TIME,
    allDay: false,
    duration: 30,
    isPublic: true,
    dataItemID: -1,
    dataItemType: -1,
    jobOrderID: -1
  };
}

function buildCreateStateFromQuery(
  data: CalendarModernDataResponse,
  query: URLSearchParams
): CalendarEventEditorState {
  const initial = buildInitialEditorState(data);
  const requestedTypeID = parseQueryInteger(query, 'eventTypeID', parseQueryInteger(query, 'type', initial.eventTypeID));
  const hasType = data.options.eventTypes.some((eventType) => Number(eventType.typeID) === requestedTypeID);

  return {
    ...initial,
    eventTypeID: hasType ? requestedTypeID : initial.eventTypeID,
    title: String(query.get('title') || '').trim(),
    description: String(query.get('description') || '').trim(),
    dateISO: resolveEntryDateISO(query, initial.dateISO),
    timeHHMM: resolveEntryTimeHHMM(query),
    allDay: parseQueryBoolean(query, 'allDay', false),
    duration: Math.max(1, Math.min(720, parseQueryInteger(query, 'duration', 30))),
    isPublic: parseQueryBoolean(query, 'publicEntry', parseQueryBoolean(query, 'isPublic', true)),
    dataItemID: parseQueryInteger(query, 'dataItemID', -1),
    dataItemType: parseQueryInteger(query, 'dataItemType', -1),
    jobOrderID: parseQueryInteger(query, 'jobOrderID', -1)
  };
}

export function CalendarPage({ bootstrap }: Props) {
  const [data, setData] = useState<CalendarModernDataResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [serverQueryString, setServerQueryString] = useState<string>(() => new URLSearchParams(window.location.search).toString());
  const [reloadToken, setReloadToken] = useState(0);
  const [modalMode, setModalMode] = useState<CalendarModalMode | null>(null);
  const [editorState, setEditorState] = useState<CalendarEventEditorState | null>(null);
  const [mutationPending, setMutationPending] = useState(false);
  const [mutationError, setMutationError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ eventID: number; title: string } | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [toast, setToast] = useState<MutationToastState | null>(null);
  const loadRequestRef = useRef(0);
  const toastIDRef = useRef(0);
  const actionEntryHandledRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    const requestID = loadRequestRef.current + 1;
    loadRequestRef.current = requestID;
    setLoading(true);
    setError('');

    const query = new URLSearchParams(serverQueryString);
    fetchCalendarModernData(bootstrap, query)
      .then((result) => {
        if (!isMounted || requestID !== loadRequestRef.current) {
          return;
        }
        setData(result);
      })
      .catch((err: Error) => {
        if (!isMounted || requestID !== loadRequestRef.current) {
          return;
        }
        setError(err.message || 'Unable to load calendar.');
      })
      .finally(() => {
        if (isMounted && requestID === loadRequestRef.current) {
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
  usePageRefreshEvents(refreshPageData);

  const showToast = useCallback((tone: MutationToastState['tone'], message: string) => {
    toastIDRef.current += 1;
    setToast({
      id: toastIDRef.current,
      tone,
      message
    });
  }, []);

  const navigateWithState = (next: {
    view?: string;
    year?: number;
    month?: number;
    day?: number;
    showEvent?: number;
  }) => {
    if (!data) {
      return;
    }

    const nextQuery = new URLSearchParams(serverQueryString);
    nextQuery.set('m', 'calendar');
    nextQuery.set('a', 'showCalendar');
    nextQuery.set('view', next.view ?? data.filters.view);
    nextQuery.set('year', String(next.year ?? data.filters.year));
    nextQuery.set('month', String(next.month ?? data.filters.month));
    nextQuery.set('day', String(next.day ?? data.filters.day));

    if (typeof next.showEvent === 'number' && next.showEvent > 0) {
      nextQuery.set('showEvent', String(next.showEvent));
    } else {
      nextQuery.delete('showEvent');
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

  const navigateFromURL = (url: string) => {
    const normalizedURL = decodeURL(url);
    if (normalizedURL === '') {
      return;
    }

    const parsedURL = new URL(normalizedURL, window.location.origin);
    const query = parsedURL.searchParams;
    query.set('m', 'calendar');
    query.set('a', 'showCalendar');
    query.set('ui', 'modern');
    const nextQueryString = query.toString();
    window.history.replaceState({}, '', `${bootstrap.indexName}?${nextQueryString}`);
    setServerQueryString(nextQueryString);
  };

  const viewOptions = useMemo<SelectMenuOption[]>(
    () =>
      data
        ? data.options.views.map((view) => ({
            value: view.value,
            label: view.label
          }))
        : [],
    [data]
  );

  const eventTypeOptions = useMemo<SelectMenuOption[]>(
    () =>
      data
        ? data.options.eventTypes.map((eventType) => ({
            value: String(eventType.typeID),
            label: eventType.description
          }))
        : [],
    [data]
  );

  const focusEvent = (eventID: number, dateISO: string) => {
    const [year, month, day] = String(dateISO || '')
      .split('-')
      .map((entry) => Number(entry));
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
      refreshPageData();
      return;
    }

    navigateWithState({ year, month, day, showEvent: eventID });
    refreshPageData();
  };

  const closeEditorModal = useCallback(() => {
    if (mutationPending) {
      return;
    }
    setModalMode(null);
    setEditorState(null);
    setMutationError('');
  }, [mutationPending]);

  const openCreateModal = useCallback((seed?: Partial<CalendarEventEditorState>) => {
    if (!data || !data.meta.permissions.canAddEvent) {
      return;
    }

    const nextState = {
      ...buildInitialEditorState(data),
      ...(seed || {})
    };
    setEditorState(nextState);
    setModalMode('create');
    setMutationError('');
  }, [data]);

  const openEditModal = useCallback(
    (event: CalendarModernDataResponse['events'][number]) => {
      if (!data || !data.meta.permissions.canEditEvent) {
        return;
      }

      setEditorState({
        eventID: event.eventID,
        eventTypeID: Number(event.eventTypeID || data.options.eventTypes[0]?.typeID || 0),
        title: event.title || '',
        description: event.description || '',
        dateISO: event.dateISO || data.filters.selectedDateISO,
        timeHHMM: normalizeTimeHHMM(event.timeHHMM || parseTimeDisplayToHHMM(event.timeDisplay)),
        allDay: Boolean(event.allDay),
        duration: Math.max(1, Number(event.duration || 30)),
        isPublic: Boolean(event.isPublic),
        dataItemID: Number(event.dataItemID || -1),
        dataItemType: Number(event.dataItemType || -1),
        jobOrderID: Number(event.regardingJobOrderID || -1)
      });
      setModalMode('edit');
      setMutationError('');
    },
    [data]
  );

  const submitEditor = useCallback(async () => {
    if (!data || !editorState || !modalMode) {
      return;
    }

    const title = editorState.title.trim();
    if (title === '') {
      setMutationError('Event title is required.');
      return;
    }

    const dateISO = editorState.dateISO.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) {
      setMutationError('Date is required.');
      return;
    }

    if (!editorState.allDay && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(editorState.timeHHMM.trim())) {
      setMutationError('Time is required for non all-day events.');
      return;
    }

    setMutationPending(true);
    setMutationError('');

    try {
      const payload = {
        eventID: editorState.eventID,
        eventTypeID: Number(editorState.eventTypeID || 0),
        title,
        description: editorState.description || '',
        allDay: editorState.allDay,
        dateISO,
        timeHHMM: editorState.allDay ? '12:00' : editorState.timeHHMM.trim(),
        duration: Math.max(1, Number(editorState.duration || 30)),
        isPublic: editorState.isPublic,
        dataItemID: Number(editorState.dataItemID || -1),
        dataItemType: Number(editorState.dataItemType || -1),
        jobOrderID: Number(editorState.jobOrderID || -1)
      };

      const result =
        modalMode === 'create'
          ? await createCalendarEvent(data.actions.addEventURL, data.actions.addEventToken, payload)
          : await updateCalendarEvent(data.actions.editEventURL, data.actions.editEventToken, payload);

      if (!result.success) {
        setMutationError(result.message || 'Calendar event save failed.');
        return;
      }

      setModalMode(null);
      setEditorState(null);
      showToast('success', modalMode === 'create' ? 'Event created.' : 'Event updated.');

      const nextEventID = Number(result.eventID || payload.eventID || 0);
      if (nextEventID > 0) {
        focusEvent(nextEventID, result.dateISO || payload.dateISO);
      } else {
        refreshPageData();
      }
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Calendar event save failed.');
    } finally {
      setMutationPending(false);
    }
  }, [data, editorState, modalMode, focusEvent, refreshPageData, showToast]);

  const submitDelete = useCallback(async () => {
    if (!data || !deleteTarget) {
      return;
    }

    setDeletePending(true);
    setDeleteError('');

    try {
      const result = await deleteCalendarEvent(
        data.actions.deleteEventURL,
        data.actions.deleteEventToken,
        deleteTarget.eventID
      );
      if (!result.success) {
        setDeleteError(result.message || 'Calendar event delete failed.');
        return;
      }

      setDeleteTarget(null);
      showToast('success', 'Event deleted.');
      refreshPageData();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Calendar event delete failed.');
    } finally {
      setDeletePending(false);
    }
  }, [data, deleteTarget, refreshPageData, showToast]);

  useEffect(() => {
    if (!data || actionEntryHandledRef.current) {
      return;
    }

    const entryAction = String(bootstrap.targetAction || '').trim().toLowerCase();
    if (entryAction !== 'addevent' && entryAction !== 'editevent' && entryAction !== 'deleteevent') {
      actionEntryHandledRef.current = true;
      return;
    }

    const query = new URLSearchParams(serverQueryString);
    if (entryAction === 'deleteevent') {
      actionEntryHandledRef.current = true;
      const eventID = parseQueryInteger(query, 'eventID', 0);
      if (eventID <= 0) {
        showToast('info', 'Event ID is required to delete a calendar event.');
        return;
      }

      if (!data.meta.permissions.canDeleteEvent) {
        showToast('error', 'You do not have permission to delete events.');
        return;
      }

      setDeletePending(true);
      setDeleteError('');
      void deleteCalendarEvent(data.actions.deleteEventURL, data.actions.deleteEventToken, eventID)
        .then((result) => {
          if (!result.success) {
            const message = result.message || 'Calendar event delete failed.';
            setDeleteError(message);
            showToast('error', message);
            return;
          }

          showToast('success', 'Event deleted.');

          const nextQuery = new URLSearchParams(serverQueryString);
          nextQuery.set('m', 'calendar');
          nextQuery.set('a', 'showCalendar');
          nextQuery.delete('eventID');
          nextQuery.delete('showEvent');
          if (!nextQuery.get('ui')) {
            nextQuery.set('ui', 'modern');
          }

          const nextQueryString = nextQuery.toString();
          window.history.replaceState({}, '', `${bootstrap.indexName}?${nextQueryString}`);
          if (nextQueryString !== serverQueryString) {
            setServerQueryString(nextQueryString);
          } else {
            refreshPageData();
          }
        })
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : 'Calendar event delete failed.';
          setDeleteError(message);
          showToast('error', message);
        })
        .finally(() => {
          setDeletePending(false);
        });
      return;
    }

    if (entryAction === 'addevent') {
      openCreateModal(buildCreateStateFromQuery(data, query));
      actionEntryHandledRef.current = true;
      return;
    }

    const eventID = parseQueryInteger(query, 'eventID', 0);
    if (eventID <= 0) {
      actionEntryHandledRef.current = true;
      showToast('info', 'Event ID is required to edit a calendar event.');
      return;
    }

    const matchedEvent = data.events.find((event) => Number(event.eventID) === eventID);
    if (matchedEvent) {
      openEditModal(matchedEvent);
      actionEntryHandledRef.current = true;
      return;
    }

    actionEntryHandledRef.current = true;
    showToast('info', `Event #${eventID} is outside the current calendar range. Navigate to its date and try again.`);
  }, [bootstrap.indexName, bootstrap.targetAction, data, openCreateModal, openEditModal, refreshPageData, serverQueryString, showToast]);

  if (loading && !data) {
    return <div className="modern-state">Loading calendar...</div>;
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
    return <EmptyState message="Calendar data unavailable." />;
  }

  const highlightedEventID = data.filters.showEvent;
  const canMutateEvents = data.meta.permissions.canEditEvent || data.meta.permissions.canDeleteEvent;

  return (
    <div className="avel-dashboard-page avel-joborders-page">
      <PageContainer
        title="Calendar"
        subtitle={`${data.summary.dateLabel} | ${data.summary.rangeLabel}`}
        actions={
          <a className="modern-btn modern-btn--secondary" href={bootstrap.legacyURL}>
            Open Legacy UI
          </a>
        }
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="modern-command-bar modern-command-bar--sticky" aria-label="Calendar controls">
            <div className="modern-command-bar__row modern-command-bar__row--filters">
              <SelectMenu
                label="View"
                value={data.filters.view}
                options={viewOptions}
                onChange={(value) => navigateWithState({ view: value })}
                className="modern-command-field"
              />
              <label className="modern-command-field">
                <span className="modern-command-label">Anchor Date</span>
                <input
                  type="date"
                  value={data.filters.selectedDateISO}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value === '') {
                      return;
                    }
                    const [year, month, day] = value.split('-').map((entry) => Number(entry));
                    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
                      return;
                    }
                    navigateWithState({ year, month, day });
                  }}
                  style={{ width: '100%', minHeight: 42 }}
                />
              </label>
              <div className="modern-command-actions modern-command-actions--primary">
                {data.meta.permissions.canAddEvent ? (
                  <button type="button" className="modern-btn modern-btn--emphasis" onClick={() => openCreateModal()}>
                    Add Event
                  </button>
                ) : null}
                <button
                  type="button"
                  className="modern-btn modern-btn--secondary"
                  onClick={() => navigateFromURL(data.actions.prevURL)}
                >
                  Prev
                </button>
                <button
                  type="button"
                  className="modern-btn modern-btn--secondary"
                  onClick={() => navigateFromURL(data.actions.todayURL)}
                >
                  Today
                </button>
                <button
                  type="button"
                  className="modern-btn modern-btn--secondary"
                  onClick={() => navigateFromURL(data.actions.nextURL)}
                >
                  Next
                </button>
              </div>
            </div>

            <div className="modern-command-bar__row modern-command-bar__row--meta">
              <div className="modern-command-active">
                <div className="modern-command-active__list">
                  <span className="modern-active-filter modern-active-filter--server">
                    {data.summary.eventsInRange} events in selected range
                  </span>
                  <span className="modern-active-filter modern-active-filter--server">
                    {data.summary.upcomingCount} upcoming events
                  </span>
                  <span className="modern-active-filter modern-active-filter--server">
                    View: {data.filters.view}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="avel-joborder-show-split">
            <div className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">Scheduled Events</h2>
                <p className="avel-list-panel__hint">{data.summary.rangeLabel}</p>
              </div>
              <DataTable
                columns={[
                  { key: 'when', title: 'When' },
                  { key: 'event', title: 'Event' },
                  { key: 'linked', title: 'Linked To' },
                  { key: 'regarding', title: 'Regarding' },
                  { key: 'owner', title: 'Owner' },
                  ...(canMutateEvents ? [{ key: 'actions', title: 'Actions' }] : [])
                ]}
                hasRows={data.events.length > 0}
                emptyMessage="No events in this range."
              >
                {data.events.map((event) => (
                  <tr
                    key={event.eventID}
                    style={
                      highlightedEventID > 0 && highlightedEventID === event.eventID
                        ? { backgroundColor: 'rgba(14, 165, 233, 0.08)' }
                        : undefined
                    }
                  >
                    <td>
                      {toDisplayText(event.dateDisplay)}
                      <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--modern-muted)' }}>
                        {event.allDay ? 'All Day' : toDisplayText(event.timeDisplay)}
                      </div>
                    </td>
                    <td>
                      <a className="modern-link" href={ensureModernUIURL(event.showURL)}>
                        {toDisplayText(event.title)}
                      </a>
                      <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--modern-muted)' }}>
                        {toDisplayText(event.eventTypeDescription)}
                        {event.isPublic ? ' | Public' : ' | Private'}
                      </div>
                    </td>
                    <td>
                      {event.dataItemURL.trim() !== '' ? (
                        <a className="modern-link" href={ensureModernUIURL(event.dataItemURL)}>
                          {toDisplayText(event.dataItemLabel)}
                        </a>
                      ) : (
                        toDisplayText(event.dataItemLabel, 'General')
                      )}
                    </td>
                    <td>
                      {event.regardingURL.trim() !== '' ? (
                        <a className="modern-link" href={ensureModernUIURL(event.regardingURL)}>
                          {toDisplayText(event.regardingLabel)}
                        </a>
                      ) : (
                        toDisplayText(event.regardingLabel)
                      )}
                    </td>
                    <td>{toDisplayText(event.enteredByName)}</td>
                    {canMutateEvents ? (
                      <td>
                        <div className="avel-calendar-event-actions">
                          {data.meta.permissions.canEditEvent ? (
                            <button
                              type="button"
                              className="modern-btn modern-btn--mini modern-btn--secondary"
                              onClick={() => openEditModal(event)}
                            >
                              Edit
                            </button>
                          ) : null}
                          {data.meta.permissions.canDeleteEvent ? (
                            <button
                              type="button"
                              className="modern-btn modern-btn--mini modern-btn--danger"
                              onClick={() => {
                                setDeleteError('');
                                setDeleteTarget({
                                  eventID: event.eventID,
                                  title: toDisplayText(event.title, 'this event')
                                });
                              }}
                            >
                              Delete
                            </button>
                          ) : null}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </DataTable>
            </div>

            <div className="avel-list-panel">
              <div className="avel-list-panel__header">
                <h2 className="avel-list-panel__title">My Upcoming Events</h2>
                <p className="avel-list-panel__hint">Next 12 events</p>
              </div>
              <DataTable
                columns={[
                  { key: 'date', title: 'Date' },
                  { key: 'title', title: 'Title' }
                ]}
                hasRows={data.upcoming.length > 0}
                emptyMessage="No upcoming events."
              >
                {data.upcoming.map((event) => (
                  <tr key={`upcoming:${event.eventID}`}>
                    <td>
                      {toDisplayText(event.dateDisplay)}
                      <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--modern-muted)' }}>
                        {event.allDay ? 'All Day' : toDisplayText(event.timeDisplay)}
                      </div>
                    </td>
                    <td>
                      <a className="modern-link" href={ensureModernUIURL(event.showURL)}>
                        {toDisplayText(event.title)}
                      </a>
                    </td>
                  </tr>
                ))}
              </DataTable>
            </div>
          </section>

          <InlineModal
            isOpen={modalMode !== null && !!editorState}
            ariaLabel={modalMode === 'edit' ? 'Edit Event' : 'Add Event'}
            dialogClassName="modern-inline-modal__dialog--status"
            closeOnBackdrop={!mutationPending}
            closeOnEscape={!mutationPending}
            onClose={closeEditorModal}
          >
              <div className="modern-inline-modal__header">
                <h3>{modalMode === 'edit' ? 'Edit Calendar Event' : 'Add Calendar Event'}</h3>
                <p>Changes are saved immediately to the shared calendar.</p>
              </div>
              <div className="modern-inline-modal__body modern-inline-modal__body--form">
                {editorState ? (
                  <div className="avel-calendar-event-form">
                    <label className="avel-calendar-event-form__field avel-calendar-event-form__field--wide">
                      <span>Title</span>
                      <input
                        type="text"
                        value={editorState.title}
                        onChange={(event) =>
                          setEditorState((current) =>
                            current
                              ? {
                                  ...current,
                                  title: event.target.value
                                }
                              : current
                          )
                        }
                        placeholder="Event title"
                        disabled={mutationPending}
                      />
                    </label>

                    <label className="avel-calendar-event-form__field">
                      <span>Event Type</span>
                      <select
                        value={String(editorState.eventTypeID || '')}
                        onChange={(event) =>
                          setEditorState((current) =>
                            current
                              ? {
                                  ...current,
                                  eventTypeID: Number(event.target.value || 0)
                                }
                              : current
                          )
                        }
                        disabled={mutationPending}
                      >
                        {eventTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="avel-calendar-event-form__field">
                      <span>Date</span>
                      <input
                        type="date"
                        value={editorState.dateISO}
                        onChange={(event) =>
                          setEditorState((current) =>
                            current
                              ? {
                                  ...current,
                                  dateISO: event.target.value
                                }
                              : current
                          )
                        }
                        disabled={mutationPending}
                      />
                    </label>

                    <label className="avel-calendar-event-form__field">
                      <span>Duration (min)</span>
                      <input
                        type="number"
                        min={1}
                        max={720}
                        value={String(editorState.duration || 30)}
                        onChange={(event) =>
                          setEditorState((current) =>
                            current
                              ? {
                                  ...current,
                                  duration: Math.max(1, Number(event.target.value || 30))
                                }
                              : current
                          )
                        }
                        disabled={mutationPending}
                      />
                    </label>

                    {!editorState.allDay ? (
                      <label className="avel-calendar-event-form__field">
                        <span>Time</span>
                        <input
                          type="time"
                          value={editorState.timeHHMM}
                          onChange={(event) =>
                            setEditorState((current) =>
                              current
                                ? {
                                    ...current,
                                    timeHHMM: event.target.value
                                  }
                                : current
                            )
                          }
                          disabled={mutationPending}
                        />
                      </label>
                    ) : (
                      <div className="avel-calendar-event-form__field avel-calendar-event-form__field--placeholder" />
                    )}

                    <label className="avel-calendar-event-form__check">
                      <input
                        type="checkbox"
                        checked={editorState.allDay}
                        onChange={(event) =>
                          setEditorState((current) =>
                            current
                              ? {
                                  ...current,
                                  allDay: event.target.checked
                                }
                              : current
                          )
                        }
                        disabled={mutationPending}
                      />
                      <span>All day event</span>
                    </label>

                    <label className="avel-calendar-event-form__check">
                      <input
                        type="checkbox"
                        checked={editorState.isPublic}
                        onChange={(event) =>
                          setEditorState((current) =>
                            current
                              ? {
                                  ...current,
                                  isPublic: event.target.checked
                                }
                              : current
                          )
                        }
                        disabled={mutationPending}
                      />
                      <span>Public visibility</span>
                    </label>

                    <label className="avel-calendar-event-form__field avel-calendar-event-form__field--wide">
                      <span>Description</span>
                      <textarea
                        rows={4}
                        value={editorState.description}
                        onChange={(event) =>
                          setEditorState((current) =>
                            current
                              ? {
                                  ...current,
                                  description: event.target.value
                                }
                              : current
                          )
                        }
                        placeholder="Optional description"
                        disabled={mutationPending}
                      />
                    </label>
                  </div>
                ) : null}

                <MutationErrorSurface message={mutationError} />
              </div>
              <div className="modern-inline-modal__actions">
                <button type="button" className="modern-btn modern-btn--secondary" onClick={closeEditorModal} disabled={mutationPending}>
                  Cancel
                </button>
                <button type="button" className="modern-btn modern-btn--emphasis" onClick={submitEditor} disabled={mutationPending || !editorState}>
                  {mutationPending ? 'Saving...' : modalMode === 'edit' ? 'Save Event' : 'Create Event'}
                </button>
              </div>
          </InlineModal>

          <ConfirmActionModal
            isOpen={!!deleteTarget}
            title="Delete Calendar Event"
            message={`Delete "${deleteTarget?.title || 'this event'}"? This cannot be undone.`}
            confirmLabel="Delete Event"
            pending={deletePending}
            error={deleteError}
            onCancel={() => {
              if (deletePending) {
                return;
              }
              setDeleteError('');
              setDeleteTarget(null);
            }}
            onConfirm={submitDelete}
          />

          <MutationToast toast={toast} onDismiss={() => setToast(null)} />
        </div>
      </PageContainer>
    </div>
  );
}
