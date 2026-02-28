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

export function CandidateKanbanCard({ row, statusClassName, freshness }: Props) {
  const statusSlug = toDisplayText(row.statusSlug, 'unknown');
  const candidateName = toDisplayText(row.candidateName);
  const jobOrderTitle = toDisplayText(row.jobOrderTitle);
  const companyName = toDisplayText(row.companyName);
  const statusLabel = toDisplayText(row.statusLabel);
  const location = toDisplayText(row.location);
  const lastUpdated = toDisplayText(row.lastStatusChangeDisplay);
  const isActive = Number(row.isActive) === 1;

  return (
    <article className={`modern-kanban-card modern-kanban-card--${statusSlug}`}>
      <div className="modern-kanban-card__head">
        <a className="modern-link modern-kanban-card__candidate" href={row.candidateURL}>
          {candidateName}
        </a>
        <div className="modern-kanban-card__chips">
          <span className={statusClassName}>{statusLabel}</span>
          <span className={`modern-freshness modern-freshness--${freshness.tone}`}>{freshness.label}</span>
        </div>
      </div>

      <a className="modern-link modern-kanban-card__job" href={row.jobOrderURL}>
        {jobOrderTitle}
      </a>

      <div className="modern-kanban-card__company">{companyName}</div>

      <div className="modern-kanban-card__meta">
        <span className="modern-kanban-card__meta-item">
          <span className="modern-kanban-card__meta-key">Location</span>
          <span>{location}</span>
        </span>
        <span className="modern-kanban-card__meta-item">
          <span className="modern-kanban-card__meta-key">Updated</span>
          <span>{lastUpdated}</span>
        </span>
        <span className="modern-kanban-card__meta-item">
          <span className="modern-kanban-card__meta-key">Pipeline</span>
          <span>{isActive ? 'Active' : 'Closed'}</span>
        </span>
      </div>

      <div className="modern-kanban-card__actions">
        <a className="modern-btn modern-btn--ghost" href={row.candidateURL}>
          View
        </a>
        <a className="modern-btn modern-btn--ghost" href={row.jobOrderURL}>
          Details
        </a>
        <a className="modern-btn modern-btn--ghost" href={withLegacyMode(row.candidateURL)}>
          Open Legacy
        </a>
      </div>
    </article>
  );
}
