import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchCalendarModernData } from '../lib/api';
import type { CalendarModernDataResponse, UIModeBootstrap } from '../types';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorState } from '../components/states/ErrorState';
import { EmptyState } from '../components/states/EmptyState';
import { DataTable } from '../components/primitives/DataTable';
import { ensureModernUIURL } from '../lib/navigation';
import { usePageRefreshEvents } from '../lib/usePageRefreshEvents';
import { SelectMenu } from '../ui-core';
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

export function CalendarPage({ bootstrap }: Props) {
  const [data, setData] = useState<CalendarModernDataResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [serverQueryString, setServerQueryString] = useState<string>(() => new URLSearchParams(window.location.search).toString());
  const [reloadToken, setReloadToken] = useState(0);
  const loadRequestRef = useRef(0);

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
                  { key: 'owner', title: 'Owner' }
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
        </div>
      </PageContainer>
    </div>
  );
}
