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
  const canClearLocal = hasLocalFilters || searchTerm.trim() !== '';
  const canResetServer = hasServerFilters || showClosed;

  return (
    <section className="modern-command-bar modern-command-bar--sticky" aria-label="Dashboard controls">
      <div
        className={`modern-command-bar__row modern-command-bar__row--primary${canViewAllScopes ? '' : ' modern-command-bar__row--primary-noscope'}`}
      >
        {canViewAllScopes ? (
          <div className="modern-command-group modern-command-group--scope">
            <span className="modern-command-label">Scope</span>
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

        <label className="modern-command-search">
          <span className="modern-command-label">Search</span>
          <span className="modern-command-search__shell">
            <span className="modern-command-search__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="presentation">
                <path d="M11 4a7 7 0 1 1-4.95 11.95A7 7 0 0 1 11 4zm0-2a9 9 0 1 0 5.66 16l4.17 4.17 1.41-1.41-4.17-4.17A9 9 0 0 0 11 2z" />
              </svg>
            </span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
              placeholder="Search candidate, role, company, location"
            />
          </span>
        </label>

        <div className="modern-command-group modern-command-group--view">
          <span className="modern-command-label">View</span>
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
        </div>

        <div className="modern-command-actions modern-command-actions--primary">
          <button
            type="button"
            className="modern-btn modern-btn--secondary"
            onClick={onClearLocalFilters}
            disabled={!canClearLocal}
          >
            Clear Local
          </button>
          <button
            type="button"
            className="modern-btn modern-btn--secondary modern-btn--emphasis"
            onClick={onResetServerFilters}
            disabled={!canResetServer}
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="modern-command-bar__row modern-command-bar__row--filters">
        <label className="modern-command-field">
          <span className="modern-command-label">Customer</span>
          <span className="modern-command-field__shell">
            <select value={customerID} onChange={(event) => onCustomerChange(event.target.value)}>
              {customers.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </span>
        </label>

        <label className="modern-command-field">
          <span className="modern-command-label">Job Order</span>
          <span className="modern-command-field__shell">
            <select value={jobOrderID} onChange={(event) => onJobOrderChange(event.target.value)}>
              {jobOrders.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </span>
        </label>

        <label className="modern-command-field">
          <span className="modern-command-label">Server Status</span>
          <span className="modern-command-field__shell">
            <select value={statusID} onChange={(event) => onStatusChange(event.target.value)}>
              {statuses.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </span>
        </label>

        <label className="modern-command-field">
          <span className="modern-command-label">Board Focus</span>
          <span className="modern-command-field__shell">
            <select value={localStatusID} onChange={(event) => onLocalStatusChange(event.target.value)}>
              {localStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </span>
        </label>

        <label className="modern-command-toggle">
          <input
            type="checkbox"
            checked={showClosed}
            onChange={(event) => onShowClosedChange(event.target.checked)}
          />
          <span className="modern-command-toggle__switch" aria-hidden="true"></span>
          <span>Include closed job orders</span>
        </label>
      </div>

      <div className="modern-command-bar__row modern-command-bar__row--meta">
        <div className="modern-command-active">
          <div className={`modern-command-active__count${activeFilterCount > 0 ? ' is-active' : ''}`}>
            {activeFilterCount} active filter{activeFilterCount === 1 ? '' : 's'}
          </div>
          {activeFilterCount > 0 ? (
            <div className="modern-command-active__list">
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
            <div className="modern-command-active__empty">No active filters. Board is showing the full available slice.</div>
          )}
        </div>
      </div>
    </section>
  );
}
