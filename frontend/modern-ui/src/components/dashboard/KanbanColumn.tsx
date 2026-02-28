import { CandidateKanbanCard } from './CandidateKanbanCard';
import type { DashboardStatusColumn, FreshnessInfo } from './types';

type Props = {
  column: DashboardStatusColumn;
  getStatusClassName: (statusLabel: string) => string;
  getFreshness: (lastStatusChangeDisplay: string) => FreshnessInfo;
};

export function KanbanColumn({ column, getStatusClassName, getFreshness }: Props) {
  return (
    <section className="modern-kanban-column" aria-label={`Status column ${column.statusLabel}`}>
      <header className="modern-kanban-column__header">
        <h4 className="modern-kanban-column__title">{column.statusLabel}</h4>
        <span className="modern-kanban-column__count">{column.rows.length}</span>
      </header>

      <div className="modern-kanban-column__body">
        {column.rows.length === 0 ? (
          <div className="modern-kanban-column__empty">No candidates in this stage.</div>
        ) : (
          <div className="modern-kanban-column__cards">
            {column.rows.map((row) => (
              <CandidateKanbanCard
                key={`${row.candidateID}-${row.jobOrderID}-${row.statusID}`}
                row={row}
                statusClassName={getStatusClassName(row.statusLabel || '')}
                freshness={getFreshness(row.lastStatusChangeDisplay || '')}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
