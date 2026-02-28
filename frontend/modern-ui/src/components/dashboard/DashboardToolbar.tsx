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

  return (
    <section className="modern-kanban-toolbar" aria-label="Dashboard controls">
      <div className="modern-kanban-toolbar__top">
        <label className="modern-kanban-search">
          <span className="modern-kanban-toolbar__label">Search</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Candidate, job order, company, location..."
          />
        </label>

        <label className="modern-kanban-toolbar__group">
          <span className="modern-kanban-toolbar__label">Quick Status</span>
          <select value={localStatusID} onChange={(event) => onLocalStatusChange(event.target.value)}>
            {localStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="modern-kanban-toolbar__actions">
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
          <button type="button" className="modern-btn modern-btn--secondary" onClick={onClearLocalFilters}>
            Clear Local
          </button>
          <button type="button" className="modern-btn modern-btn--secondary" onClick={onResetServerFilters}>
            Reset Filters
          </button>
        </div>
      </div>

      <div className="modern-kanban-toolbar__bottom">
        {canViewAllScopes ? (
          <label className="modern-kanban-toolbar__group">
            <span className="modern-kanban-toolbar__label">Scope</span>
            <select value={scope} onChange={(event) => onScopeChange(event.target.value)}>
              <option value="mine">My Assigned Jobs</option>
              <option value="all">All Jobs</option>
            </select>
          </label>
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
          <span className="modern-kanban-toolbar__label">Server Status</span>
          <select value={statusID} onChange={(event) => onStatusChange(event.target.value)}>
            {statuses.map((option) => (
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
          <span>Show Closed Job Orders</span>
        </label>
      </div>
    </section>
  );
}
