import type { FreshnessInfo, DashboardRow } from './types';

type Props = {
  row: DashboardRow;
  statusClassName: string;
  freshness: FreshnessInfo;
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

function withLegacyMode(url: string): string {
  const safeURL = String(url || '').trim();
  if (safeURL === '') {
    return 'index.php?ui=legacy';
  }

  if (safeURL.includes('ui=')) {
    return safeURL.replace(/ui=[^&]*/i, 'ui=legacy');
  }

  return safeURL + (safeURL.includes('?') ? '&' : '?') + 'ui=legacy';
}

function getInitials(value: string): string {
  const tokens = value
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token !== '');

  if (tokens.length === 0) {
    return 'NA';
  }

  const initials = tokens
    .slice(0, 2)
    .map((token) => token.charAt(0).toUpperCase())
    .join('');

  return initials || 'NA';
}

export function CandidateKanbanCard({ row, statusClassName, freshness }: Props) {
  const statusSlug = toDisplayText(row.statusSlug, 'unknown');
  const candidateName = toDisplayText(row.candidateName);
  const jobOrderTitle = toDisplayText(row.jobOrderTitle);
  const companyName = toDisplayText(row.companyName);
  const statusLabel = toDisplayText(row.statusLabel);
  const location = toDisplayText(row.location);
  const lastUpdated = toDisplayText(row.lastStatusChangeDisplay);
  const isActive = Number(row.isActive) === 1;
  const initials = getInitials(candidateName);

  return (
    <article className={`modern-kanban-card modern-kanban-card--${statusSlug}`}>
      <div className="modern-kanban-card__head">
        <div className="modern-kanban-card__identity">
          <div className="modern-kanban-card__avatar" aria-hidden="true">
            {initials}
          </div>
          <div className="modern-kanban-card__identity-content">
            <a className="modern-link modern-kanban-card__candidate" href={row.candidateURL}>
              {candidateName}
            </a>
            <div className="modern-kanban-card__identity-hint">Candidate profile</div>
          </div>
        </div>

        <div className="modern-kanban-card__chips">
          <span className={statusClassName}>{statusLabel}</span>
          <span className={`modern-freshness modern-freshness--${freshness.tone}`}>{freshness.label}</span>
          <span className={`modern-chip modern-chip--pipeline ${isActive ? 'is-active' : 'is-closed'}`}>
            {isActive ? 'Open Pipeline' : 'Closed'}
          </span>
        </div>
      </div>

      <div className="modern-kanban-card__job-wrap">
        <span className="modern-kanban-card__job-label">Job Order</span>
        <a className="modern-link modern-kanban-card__job" href={row.jobOrderURL}>
          {jobOrderTitle}
        </a>
      </div>

      <div className="modern-kanban-card__facts">
        <div className="modern-kanban-card__fact modern-kanban-card__fact--summary">
          <span className="modern-kanban-card__fact-value">{companyName}</span>
          <span className="modern-kanban-card__fact-sep">•</span>
          <span className="modern-kanban-card__fact-value">{location}</span>
        </div>
        <div className="modern-kanban-card__fact">
          <span className="modern-kanban-card__fact-key">Updated</span>
          <span className="modern-kanban-card__fact-value">{lastUpdated}</span>
        </div>
      </div>

      <div className="modern-kanban-card__actions">
        <a className="modern-btn modern-btn--ghost modern-btn--mini" href={row.candidateURL}>
          Candidate
        </a>
        <a className="modern-btn modern-btn--ghost modern-btn--mini" href={row.jobOrderURL}>
          Job
        </a>
        <a className="modern-btn modern-btn--ghost modern-btn--mini" href={withLegacyMode(row.candidateURL)}>
          Open Legacy
        </a>
      </div>
    </article>
  );
}
