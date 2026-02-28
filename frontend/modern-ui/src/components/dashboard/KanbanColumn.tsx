import { CandidateKanbanCard } from './CandidateKanbanCard';
import type { DashboardRow, DashboardStatusColumn } from './types';
import type { DragEvent as ReactDragEvent } from 'react';

type Props = {
  column: DashboardStatusColumn;
  totalVisibleRows: number;
  getStatusClassName: (statusLabel: string) => string;
  canChangeStatus: boolean;
  canDropHere: boolean;
  isDropTarget: boolean;
  isCardDragging: (row: DashboardRow) => boolean;
  canDragCard: (row: DashboardRow) => boolean;
  onCardDragStart: (event: ReactDragEvent<HTMLElement>, row: DashboardRow) => void;
  onCardDragEnd: () => void;
  onRequestStatusChange: (row: DashboardRow, targetStatusID: number | null) => void;
  onOpenDetails: (row: DashboardRow) => void;
  onDragOverColumn: (event: ReactDragEvent<HTMLDivElement>, targetStatusID: number) => void;
  onDragLeaveColumn: (targetStatusID: number) => void;
  onDropColumn: (event: ReactDragEvent<HTMLDivElement>, targetStatusID: number) => void;
};

export function KanbanColumn({
  column,
  totalVisibleRows,
  getStatusClassName,
  canChangeStatus,
  canDropHere,
  isDropTarget,
  isCardDragging,
  canDragCard,
  onCardDragStart,
  onCardDragEnd,
  onRequestStatusChange,
  onOpenDetails,
  onDragOverColumn,
  onDragLeaveColumn,
  onDropColumn
}: Props) {
  const columnShare = totalVisibleRows > 0
    ? Math.round((column.rows.length / totalVisibleRows) * 100)
    : 0;
  const progressWidth = Math.min(100, Math.max(0, columnShare));

  return (
    <section
      className={`modern-kanban-column modern-kanban-column--${column.statusSlug}`}
      aria-label={`Status column ${column.statusLabel}`}
    >
      <header className="modern-kanban-column__header">
        <div className="modern-kanban-column__title-wrap">
          <h4 className="modern-kanban-column__title">
            <span className="modern-kanban-column__stage-dot" aria-hidden="true"></span>
            {column.statusLabel}
          </h4>
          <span className="modern-kanban-column__subtitle">{columnShare}% of visible pipeline</span>
        </div>
        <div className="modern-kanban-column__count-wrap">
          <span className="modern-kanban-column__count">{column.rows.length}</span>
          <span className="modern-kanban-column__count-label">candidates</span>
        </div>
      </header>
      <div className="modern-kanban-column__progress" aria-hidden="true">
        <span className="modern-kanban-column__progress-fill" style={{ width: `${progressWidth}%` }} />
      </div>

      <div
        className={`modern-kanban-column__body${isDropTarget ? ' is-drop-target' : ''}${canDropHere ? ' is-drop-enabled' : ''}`}
        onDragOver={(event) => onDragOverColumn(event, column.statusID)}
        onDragLeave={() => onDragLeaveColumn(column.statusID)}
        onDrop={(event) => onDropColumn(event, column.statusID)}
      >
        {column.rows.length === 0 ? (
          <div className="modern-kanban-column__empty">
            <span className="modern-kanban-column__empty-icon" aria-hidden="true">
              0
            </span>
            <span>Nothing here yet. Move candidates into this stage to populate it.</span>
          </div>
        ) : (
          <div className="modern-kanban-column__cards">
            {column.rows.map((row) => (
              <CandidateKanbanCard
                key={`${row.candidateID}-${row.jobOrderID}-${row.statusID}`}
                row={row}
                statusClassName={getStatusClassName(row.statusLabel || '')}
                canChangeStatus={canChangeStatus}
                canDrag={canDragCard(row)}
                isDragging={isCardDragging(row)}
                onDragStart={onCardDragStart}
                onDragEnd={onCardDragEnd}
                onOpenDetails={onOpenDetails}
                onRequestStatusChange={onRequestStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
