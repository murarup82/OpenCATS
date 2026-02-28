export function DashboardKanbanSkeleton() {
  return (
    <section className="modern-kanban-skeleton" aria-label="Loading dashboard">
      <div className="modern-kanban-skeleton__toolbar">
        <span />
        <span />
        <span />
      </div>

      <div className="modern-kanban-skeleton__board">
        <div className="modern-kanban-skeleton__column">
          <div className="modern-kanban-skeleton__header" />
          <div className="modern-kanban-skeleton__card" />
          <div className="modern-kanban-skeleton__card" />
        </div>
        <div className="modern-kanban-skeleton__column">
          <div className="modern-kanban-skeleton__header" />
          <div className="modern-kanban-skeleton__card" />
        </div>
        <div className="modern-kanban-skeleton__column">
          <div className="modern-kanban-skeleton__header" />
          <div className="modern-kanban-skeleton__card" />
          <div className="modern-kanban-skeleton__card" />
          <div className="modern-kanban-skeleton__card" />
        </div>
      </div>
    </section>
  );
}
