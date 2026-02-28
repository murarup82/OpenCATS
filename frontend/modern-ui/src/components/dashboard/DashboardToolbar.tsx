type Option = {
  value: string;
  label: string;
};

type Props = {
  canViewAllScopes: boolean;
  scope: 'mine' | 'all';
  customerID: string;
  jobOrderID: string;
  statusID: string;
  showClosed: boolean;
  customers: Option[];
  jobOrders: Option[];
  statuses: Option[];
  searchTerm: string;
  localStatusID: string;
  localStatusOptions: Option[];
  activeServerFilters: string[];
  activeLocalFilters: string[];
  viewMode: 'kanban' | 'list';
  onScopeChange: (scope: string) => void;
  onCustomerChange: (customerID: string) => void;
  onJobOrderChange: (jobOrderID: string) => void;
  onStatusChange: (statusID: string) => void;
  onShowClosedChange: (showClosed: boolean) => void;
  onSearchTermChange: (value: string) => void;
  onLocalStatusChange: (value: string) => void;
  onViewModeChange: (mode: 'kanban' | 'list') => void;
  onResetServerFilters: () => void;
  onClearLocalFilters: () => void;
};

export function DashboardToolbar(props: Props) {
  const {
    canViewAllScopes,
    scope,
    customerID,
    jobOrderID,
    statusID,
    showClosed,
    customers,
    jobOrders,
    statuses,
    searchTerm,
    localStatusID,
    localStatusOptions,
    activeServerFilters,
    activeLocalFilters,
    viewMode,
    onScopeChange,
    onCustomerChange,
    onJobOrderChange,
    onStatusChange,
    onShowClosedChange,
    onSearchTermChange,
    onLocalStatusChange,
    onViewModeChange,
    onResetServerFilters,
    onClearLocalFilters
  } = props;

  const activeFilterCount = activeServerFilters.length + activeLocalFilters.length;
  const hasServerFilters = activeServerFilters.length > 0;
  const hasLocalFilters = activeLocalFilters.length > 0;

  return (
    <section className="modern-kanban-toolbar modern-kanban-toolbar--sticky" aria-label="Dashboard controls">
      <div className="modern-kanban-toolbar__top">
        <label className="modern-kanban-search">
          <span className="modern-kanban-toolbar__label">Search candidates or jobs</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Candidate, job order, company, location..."
          />
        </label>

        <div className="modern-kanban-toolbar__actions">
          <div className={`modern-kanban-toolbar__active-counter${activeFilterCount > 0 ? ' is-active' : ''}`}>
            {activeFilterCount} active filter{activeFilterCount === 1 ? '' : 's'}
          </div>
          <div className="modern-segment" role="group" aria-label="View mode">
            <button
              type="button"
              className={`modern-segment__btn${viewMode === 'kanban' ? ' is-active' : ''}`}
              onClick={() => onViewModeChange('kanban')}
            >
              Kanban
            </button>
            <button
              type="button"
              className={`modern-segment__btn${viewMode === 'list' ? ' is-active' : ''}`}
              onClick={() => onViewModeChange('list')}
            >
              List
            </button>
          </div>
          <button
            type="button"
            className="modern-btn modern-btn--secondary"
            onClick={onClearLocalFilters}
            disabled={!hasLocalFilters && searchTerm.trim() === ''}
          >
            Clear Local
          </button>
          <button
            type="button"
            className="modern-btn modern-btn--secondary modern-btn--emphasis"
            onClick={onResetServerFilters}
            disabled={!hasServerFilters && !showClosed}
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="modern-kanban-toolbar__bottom">
        {canViewAllScopes ? (
          <div className="modern-kanban-toolbar__group modern-kanban-toolbar__group--scope">
            <span className="modern-kanban-toolbar__label">Scope</span>
            <div className="modern-segment modern-segment--scope" role="group" aria-label="Scope mode">
              <button
                type="button"
                className={`modern-segment__btn${scope === 'mine' ? ' is-active' : ''}`}
                onClick={() => onScopeChange('mine')}
              >
                My Assigned Jobs
              </button>
              <button
                type="button"
                className={`modern-segment__btn${scope === 'all' ? ' is-active' : ''}`}
                onClick={() => onScopeChange('all')}
              >
                All Jobs
              </button>
            </div>
          </div>
        ) : null}

        <label className="modern-kanban-toolbar__group">
          <span className="modern-kanban-toolbar__label">Customer</span>
          <select value={customerID} onChange={(event) => onCustomerChange(event.target.value)}>
            {customers.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="modern-kanban-toolbar__group">
          <span className="modern-kanban-toolbar__label">Job Order</span>
          <select value={jobOrderID} onChange={(event) => onJobOrderChange(event.target.value)}>
            {jobOrders.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="modern-kanban-toolbar__group">
          <span className="modern-kanban-toolbar__label">Server Status Filter</span>
          <select value={statusID} onChange={(event) => onStatusChange(event.target.value)}>
            {statuses.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="modern-kanban-toolbar__meta">
        <label className="modern-kanban-toolbar__group">
          <span className="modern-kanban-toolbar__label">Board Status Focus</span>
          <select value={localStatusID} onChange={(event) => onLocalStatusChange(event.target.value)}>
            {localStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="modern-kanban-toolbar__toggle">
          <input
            type="checkbox"
            checked={showClosed}
            onChange={(event) => onShowClosedChange(event.target.checked)}
          />
          <span>Include closed job orders</span>
        </label>

        {activeFilterCount > 0 ? (
          <div className="modern-kanban-toolbar__active-list">
            {activeServerFilters.map((filterLabel, index) => (
              <span className="modern-active-filter modern-active-filter--server" key={`server-${index}-${filterLabel}`}>
                {filterLabel}
              </span>
            ))}
            {activeLocalFilters.map((filterLabel, index) => (
              <span className="modern-active-filter modern-active-filter--local" key={`local-${index}-${filterLabel}`}>
                {filterLabel}
              </span>
            ))}
          </div>
        ) : (
          <div className="modern-kanban-toolbar__active-empty">No active filters. Showing full pipeline slice.</div>
        )}
      </div>
    </section>
  );
}
