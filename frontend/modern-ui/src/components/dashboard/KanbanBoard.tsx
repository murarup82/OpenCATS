import { useMemo, useRef, useState } from 'react';
import type {
  DragEvent as ReactDragEvent,
  WheelEvent as ReactWheelEvent
} from 'react';
import { KanbanColumn } from './KanbanColumn';
import type { DashboardRow, DashboardStatusColumn } from './types';

type PriorityChip = {
  statusID: number;
  statusLabel: string;
  statusSlug: string;
  count: number;
};

const CHIP_COLORS: Record<string, { accent: string; bg: string; border: string; text: string }> = {
  'allocated':            { accent: '#0f95bf', bg: '#d2eef8', border: '#7ecbea', text: '#0a4f66' },
  'delivery-validated':   { accent: '#2f9d8c', bg: '#ceeee9', border: '#78ccbf', text: '#0e4d45' },
  'proposed-to-customer': { accent: '#7e67d6', bg: '#e3dff8', border: '#b4a6ea', text: '#3d2a8c' },
  'customer-interview':   { accent: '#d98b3e', bg: '#fae4cf', border: '#e8b47e', text: '#7a3d0e' },
  'customer-approved':    { accent: '#6377dd', bg: '#dde1f8', border: '#a4abe8', text: '#2a3593' },
  'avel-approved':        { accent: '#3f92d9', bg: '#d6eaf8', border: '#82bae6', text: '#1a4a76' },
  'offer-negotiation':    { accent: '#cf7a32', bg: '#f8e5d0', border: '#e4ad7a', text: '#6b3a0a' },
  'offer-negociation':    { accent: '#cf7a32', bg: '#f8e5d0', border: '#e4ad7a', text: '#6b3a0a' },
  'offer-accepted':       { accent: '#3d9f67', bg: '#d2eddf', border: '#7ecba0', text: '#154d2e' },
  'hired':                { accent: '#2f8d56', bg: '#ceeadc', border: '#78c49c', text: '#0d4025' },
  'rejected':             { accent: '#c46b72', bg: '#f5dde0', border: '#e09ea3', text: '#6b1f26' },
};

type Props = {
  columns: DashboardStatusColumn[];
  totalVisibleRows: number;
  priorityChips?: PriorityChip[];
  focusedStatusID?: number | null;
  getStatusClassName: (statusLabel: string) => string;
  canChangeStatus: boolean;
  statusOrder: number[];
  rejectedStatusID: number;
  onRequestStatusChange: (row: DashboardRow, targetStatusID: number | null) => void;
  onOpenDetails: (row: DashboardRow) => void;
  onFocusStatus?: (statusID: number | null) => void;
  onInteractionError?: (message: string) => void;
};

function getRowKey(row: DashboardRow): string {
  if (typeof row.candidateJobOrderID === 'number' && row.candidateJobOrderID > 0) {
    return `pipeline-${row.candidateJobOrderID}`;
  }

  return `candidate-${row.candidateID}-job-${row.jobOrderID}`;
}

export function KanbanBoard({
  columns,
  totalVisibleRows,
  priorityChips,
  focusedStatusID,
  getStatusClassName,
  canChangeStatus,
  statusOrder,
  rejectedStatusID,
  onRequestStatusChange,
  onOpenDetails,
  onFocusStatus,
  onInteractionError
}: Props) {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const scrollStep = 320;
  const [draggedRow, setDraggedRow] = useState<DashboardRow | null>(null);
  const [dropStatusID, setDropStatusID] = useState<number | null>(null);

  const normalizedStatusOrder = useMemo(
    () =>
      statusOrder
        .map((value) => Number(value))
        .filter((value) => !Number.isNaN(value) && value > 0),
    [statusOrder]
  );

  const canMove = (currentStatusID: number, targetStatusID: number): boolean => {
    if (!canChangeStatus) {
      return false;
    }

    if (
      Number.isNaN(currentStatusID) ||
      Number.isNaN(targetStatusID) ||
      currentStatusID <= 0 ||
      targetStatusID <= 0
    ) {
      return false;
    }

    if (currentStatusID === targetStatusID) {
      return false;
    }

    if (currentStatusID === rejectedStatusID) {
      return false;
    }

    if (targetStatusID === rejectedStatusID) {
      return true;
    }

    const currentIndex = normalizedStatusOrder.indexOf(currentStatusID);
    const targetIndex = normalizedStatusOrder.indexOf(targetStatusID);
    if (currentIndex < 0 || targetIndex < 0) {
      return true;
    }

    return targetIndex > currentIndex;
  };

  const scrollBoardBy = (offset: number) => {
    const board = boardRef.current;
    if (!board) {
      return;
    }

    board.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    // Keep mouse-wheel scrolling vertical by default; use Shift+wheel or buttons for horizontal lane moves.
    if (event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
      return;
    }

    const board = boardRef.current;
    if (!board) {
      return;
    }

    event.preventDefault();
    window.scrollBy({
      top: event.deltaY,
      left: 0,
      behavior: 'auto'
    });
  };

  const handleCardDragStart = (event: ReactDragEvent<HTMLElement>, row: DashboardRow) => {
    setDraggedRow(row);
    setDropStatusID(null);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', `${row.candidateID}:${row.jobOrderID}`);
    }
  };

  const handleCardDragEnd = () => {
    setDraggedRow(null);
    setDropStatusID(null);
  };

  const handleDragOverColumn = (event: ReactDragEvent<HTMLDivElement>, targetStatusID: number) => {
    if (!draggedRow) {
      return;
    }

    const currentStatusID = Number(draggedRow.statusID || 0);
    if (!canMove(currentStatusID, targetStatusID)) {
      return;
    }

    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    setDropStatusID(targetStatusID);
  };

  const handleDragLeaveColumn = (targetStatusID: number) => {
    if (dropStatusID === targetStatusID) {
      setDropStatusID(null);
    }
  };

  const handleDropColumn = (event: ReactDragEvent<HTMLDivElement>, targetStatusID: number) => {
    if (!draggedRow) {
      return;
    }

    event.preventDefault();
    const currentStatusID = Number(draggedRow.statusID || 0);
    if (!canMove(currentStatusID, targetStatusID)) {
      if (currentStatusID === rejectedStatusID) {
        onInteractionError?.('Cannot move from Rejected. Re-assign the candidate to restart the pipeline.');
      } else {
        onInteractionError?.('Only forward stage transitions (or move to Rejected) are allowed from Kanban.');
      }
      setDraggedRow(null);
      setDropStatusID(null);
      return;
    }

    onRequestStatusChange(draggedRow, targetStatusID);
    setDraggedRow(null);
    setDropStatusID(null);
  };

  return (
    <div className="modern-kanban-board-wrap">
      <div className="modern-kanban-board__header">
        <div className="modern-kanban-board__header-left">
          <span className="modern-kanban-board__title">Pipeline Lanes</span>
          {priorityChips && priorityChips.length > 0 ? (
            <div className="modern-kanban-board__priority-chips" aria-label="Filter by pipeline stage">
              {priorityChips.map((chip) => {
                const colors = CHIP_COLORS[chip.statusSlug] ?? { accent: '#0097bd', bg: '#d2ecf8', border: '#7ec8e8', text: '#003f58' };
                const isActive = focusedStatusID === chip.statusID;
                return (
                  <button
                    key={chip.statusID}
                    type="button"
                    className={`modern-kanban-board__priority-chip${isActive ? ' is-active' : ''}`}
                    style={{ '--chip-accent': colors.accent, '--chip-bg': colors.bg, '--chip-border': colors.border, '--chip-text': colors.text } as React.CSSProperties}
                    aria-pressed={isActive}
                    title={isActive ? `Clear focus on ${chip.statusLabel}` : `Focus on ${chip.statusLabel}`}
                    onClick={() => onFocusStatus?.(isActive ? null : chip.statusID)}
                  >
                    <span className="modern-kanban-board__priority-chip-dot" aria-hidden="true" />
                    <span className="modern-kanban-board__priority-chip-label">{chip.statusLabel}</span>
                    <span className="modern-kanban-board__priority-chip-count">{chip.count}</span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
        <div className="modern-kanban-board__header-actions">
          <span className="modern-kanban-board__hint">Scroll to see all stages</span>
          <button
            type="button"
            className="modern-kanban-board__scroll-btn"
            onClick={() => scrollBoardBy(-scrollStep)}
            aria-label="Scroll lanes left"
          >
            <span aria-hidden="true">&lt;</span>
          </button>
          <button
            type="button"
            className="modern-kanban-board__scroll-btn"
            onClick={() => scrollBoardBy(scrollStep)}
            aria-label="Scroll lanes right"
          >
            <span aria-hidden="true">&gt;</span>
          </button>
        </div>
      </div>
      <div
        ref={boardRef}
        className="modern-kanban-board__viewport"
        aria-label="Candidate pipeline board"
        onWheel={handleWheel}
      >
        <div className="modern-kanban-board">
          {columns.map((column) => (
            <KanbanColumn
              key={`${column.statusID}-${column.statusSlug}`}
              column={column}
              totalVisibleRows={totalVisibleRows}
              getStatusClassName={getStatusClassName}
              canDropHere={
                !!draggedRow &&
                canMove(Number(draggedRow.statusID || 0), Number(column.statusID || 0))
              }
              isDropTarget={dropStatusID === column.statusID}
              isCardDragging={(row) =>
                !!draggedRow && getRowKey(draggedRow) === getRowKey(row)
              }
              canDragCard={(row) =>
                canChangeStatus &&
                Number(row.statusID || 0) > 0 &&
                Number(row.statusID || 0) !== rejectedStatusID
              }
              onCardDragStart={handleCardDragStart}
              onCardDragEnd={handleCardDragEnd}
              onOpenDetails={onOpenDetails}
              onDragOverColumn={handleDragOverColumn}
              onDragLeaveColumn={handleDragLeaveColumn}
              onDropColumn={handleDropColumn}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
