import { useMemo, useRef, useState } from 'react';
import type {
  DragEvent as ReactDragEvent,
  WheelEvent as ReactWheelEvent
} from 'react';
import { KanbanColumn } from './KanbanColumn';
import type { DashboardRow, DashboardStatusColumn } from './types';

type Props = {
  columns: DashboardStatusColumn[];
  totalVisibleRows: number;
  getStatusClassName: (statusLabel: string) => string;
  canChangeStatus: boolean;
  statusOrder: number[];
  rejectedStatusID: number;
  onRequestStatusChange: (row: DashboardRow, targetStatusID: number | null) => void;
  onOpenDetails: (row: DashboardRow) => void;
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
  getStatusClassName,
  canChangeStatus,
  statusOrder,
  rejectedStatusID,
  onRequestStatusChange,
  onOpenDetails
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
        window.alert('Cannot move from Rejected. Re-assign the candidate to restart the pipeline.');
      } else {
        window.alert('Only forward stage transitions (or move to Rejected) are allowed from Kanban.');
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
        <span className="modern-kanban-board__title">Pipeline Lanes</span>
        <div className="modern-kanban-board__header-actions">
          <span className="modern-kanban-board__hint">Horizontal scroll enabled for all workflow stages</span>
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
              canChangeStatus={canChangeStatus}
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
              onRequestStatusChange={onRequestStatusChange}
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
