import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import type { UIModeBootstrap } from '../types';
import '../dashboard-avel.css';

type Props = {
  bootstrap: UIModeBootstrap;
};

type InteractionLogEntry = {
  timestamp?: string;
  type?: string;
  route?: {
    module?: string;
    action?: string;
  };
  details?: unknown;
};

type InteractionLogger = {
  getEntries: (limit?: number) => InteractionLogEntry[];
  clear?: () => void;
  onChange?: (listener: () => void) => (() => void) | void;
};

const MAX_VISIBLE_LINES = 1500;

function compactJSON(value: unknown): string {
  try {
    return JSON.stringify(value == null ? {} : value);
  } catch (_error) {
    return '{"error":"unserializable"}';
  }
}

function formatTimestamp(rawValue: string | undefined): string {
  const input = String(rawValue || '');
  if (input === '') {
    return '';
  }
  return input.replace('T', ' ').replace('Z', '');
}

function formatRoute(entry: InteractionLogEntry): string {
  if (!entry || !entry.route) {
    return '(unknown)';
  }
  const moduleName = String(entry.route.module || '');
  const actionName = String(entry.route.action || '');
  if (moduleName === '' && actionName === '') {
    return '(unknown)';
  }
  if (actionName === '') {
    return `${moduleName}/(default)`;
  }
  return `${moduleName}/${actionName}`;
}

function toLine(entry: InteractionLogEntry): string {
  const ts = formatTimestamp(entry.timestamp);
  const type = String(entry.type || '');
  const route = formatRoute(entry);
  const details = compactJSON(entry.details);
  return `${ts} | ${type} | ${route} | ${details}`;
}

function getInteractionLogger(): InteractionLogger | null {
  const logger = (window as unknown as { OpenCATSInteractionLog?: InteractionLogger }).OpenCATSInteractionLog;
  if (!logger || typeof logger.getEntries !== 'function') {
    return null;
  }
  return logger;
}

export function LogsPage({ bootstrap }: Props) {
  const [lines, setLines] = useState<string>('');
  const [status, setStatus] = useState<string>('Loading...');

  const refreshText = useCallback(() => {
    const logger = getInteractionLogger();
    if (!logger) {
      setLines('Interaction logger is unavailable on this page.');
      setStatus('Logger unavailable');
      return;
    }

    const allEntries = logger.getEntries();
    if (!allEntries.length) {
      setLines('');
      setStatus('0 entries');
      return;
    }

    const visibleEntries = logger.getEntries(MAX_VISIBLE_LINES).slice().reverse();
    const nextLines = visibleEntries.map((entry) => toLine(entry)).join('\n');
    setLines(nextLines);

    if (allEntries.length > visibleEntries.length) {
      setStatus(`Showing latest ${visibleEntries.length} of ${allEntries.length} entries`);
    } else {
      setStatus(`${allEntries.length} entries`);
    }
  }, []);

  useEffect(() => {
    refreshText();

    const logger = getInteractionLogger();
    if (!logger || typeof logger.onChange !== 'function') {
      return;
    }

    const unsubscribe = logger.onChange(() => {
      refreshText();
    });
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [refreshText]);

  const copyLines = useCallback(async () => {
    const text = String(lines || '');
    if (text === '') {
      setStatus('Nothing to copy');
      return;
    }

    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(text);
        setStatus('Copied');
        return;
      }
    } catch (_error) {
      // Fallback below.
    }

    const helperTextArea = document.createElement('textarea');
    helperTextArea.value = text;
    helperTextArea.style.position = 'fixed';
    helperTextArea.style.left = '-9999px';
    document.body.appendChild(helperTextArea);
    helperTextArea.focus();
    helperTextArea.select();
    try {
      document.execCommand('copy');
      setStatus('Copied');
    } catch (_error) {
      setStatus('Copy failed');
    } finally {
      document.body.removeChild(helperTextArea);
    }
  }, [lines]);

  const clearLogs = useCallback(() => {
    const logger = getInteractionLogger();
    if (!logger || typeof logger.clear !== 'function') {
      setStatus('Logger unavailable');
      return;
    }

    if (!window.confirm('Clear all captured UI logs for this browser?')) {
      return;
    }

    logger.clear();
    refreshText();
  }, [refreshText]);

  const dashboardURL = useMemo(
    () => `${bootstrap.indexName}?m=dashboard&a=my&ui=modern`,
    [bootstrap.indexName]
  );

  return (
    <div className="avel-dashboard-page">
      <PageContainer
        title="UI Logs"
        subtitle="Plain text interaction logs for copy/paste debugging."
        actions={(
          <>
            <a className="modern-btn modern-btn--secondary" href={dashboardURL}>
              Back To Dashboard
            </a>
            <a className="modern-btn modern-btn--secondary" href={bootstrap.legacyURL}>
              Open Legacy UI
            </a>
          </>
        )}
      >
        <div className="modern-dashboard avel-dashboard-shell">
          <section className="avel-list-panel avel-logs-panel">
            <div className="avel-logs-toolbar">
              <button type="button" className="modern-btn modern-btn--secondary modern-btn--mini" onClick={refreshText}>
                Refresh
              </button>
              <button type="button" className="modern-btn modern-btn--secondary modern-btn--mini" onClick={copyLines}>
                Copy
              </button>
              <button type="button" className="modern-btn modern-btn--danger modern-btn--mini" onClick={clearLogs}>
                Clear Logs
              </button>
              <span className="avel-logs-status">{status}</span>
            </div>
            <textarea
              className="avel-logs-output"
              value={lines}
              readOnly
              spellCheck={false}
              aria-label="Interaction logs output"
            />
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
