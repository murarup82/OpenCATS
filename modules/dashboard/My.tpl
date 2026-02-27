<?php /* My Dashboard */ ?>
<?php TemplateUtility::printHeader('My Dashboard', array('js/match.js')); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active); ?>
    <div id="main">
        <?php TemplateUtility::printQuickSearch(); ?>

        <div id="contents"<?php echo TemplateUtility::getUI2WrapperAttribute(); ?>>
            <style type="text/css">
                .my-dashboard .status-pill {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 12px;
                    font-weight: 600;
                    line-height: 1.3;
                    border: 1px solid #d1d9de;
                    color: #1f2933;
                    background: #f2f4f6;
                    white-space: nowrap;
                }
                .my-dashboard .status-allocated { background: #e6f0ff; color: #1d4ed8; border-color: #c7ddff; }
                .my-dashboard .status-delivery-validated { background: #e6f7f4; color: #0f766e; border-color: #c5ece6; }
                .my-dashboard .status-proposed-to-customer { background: #f3e8ff; color: #6b21a8; border-color: #e3d0ff; }
                .my-dashboard .status-customer-interview { background: #fff7ed; color: #b45309; border-color: #fde0b6; }
                .my-dashboard .status-customer-approved { background: #eef2ff; color: #4f46e5; border-color: #d6dcff; }
                .my-dashboard .status-avel-approved { background: #e0f2fe; color: #0369a1; border-color: #bae6fd; }
                .my-dashboard .status-offer-negotiation,
                .my-dashboard .status-offer-negociation { background: #fff1f2; color: #c2410c; border-color: #fed7aa; }
                .my-dashboard .status-offer-accepted { background: #ecfdf3; color: #15803d; border-color: #bbf7d0; }
                .my-dashboard .status-hired { background: #dcfce7; color: #166534; border-color: #86efac; }
                .my-dashboard .status-rejected { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }
                .my-dashboard .status-unknown { background: #f2f4f6; color: #4c5a61; border-color: #d1d9de; }
                .my-dashboard .ui2-datatable-card--avel table.sortable th:first-child,
                .my-dashboard .ui2-datatable-card--avel table.sortable td:first-child {
                    width: auto;
                    padding-left: 10px;
                    padding-right: 10px;
                }
                .my-dashboard .dashboardCommentBadge {
                    display: inline-block;
                    min-width: 20px;
                    margin-right: 4px;
                    padding: 1px 6px;
                    border-radius: 999px;
                    border: 1px solid #8cc8a4;
                    background: #e8f7ef;
                    color: #1f6f3c;
                    font-size: 11px;
                    font-weight: 600;
                    line-height: 15px;
                    text-align: center;
                }
                .my-dashboard .dashboardCommentBadge--empty {
                    border-color: #cdd8e3;
                    background: #f3f6f9;
                    color: #677787;
                    font-weight: 500;
                }
                .my-dashboard tr.dashboardRowHasComments td {
                    background-color: #f2fcf5 !important;
                }
                .my-dashboard .dashboardViewHint {
                    margin-top: 8px;
                    color: #4b5f69;
                    font-size: 12px;
                }
                .my-dashboard .dashboard-kanban-shell {
                    margin-top: 12px;
                }
                .my-dashboard .dashboard-kanban-board {
                    display: flex;
                    gap: 12px;
                    overflow-x: auto;
                    padding-bottom: 6px;
                }
                .my-dashboard .dashboard-kanban-column {
                    min-width: 280px;
                    width: 280px;
                    border: 1px solid #d9e5ec;
                    border-radius: 10px;
                    background: #f8fbfd;
                    display: flex;
                    flex-direction: column;
                    max-height: 72vh;
                }
                .my-dashboard .dashboard-kanban-column-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 8px;
                    padding: 10px;
                    border-bottom: 1px solid #dde8ef;
                    background: #eef6fb;
                    font-weight: 700;
                    color: #134b62;
                }
                .my-dashboard .dashboard-kanban-column-count {
                    font-size: 11px;
                    font-weight: 700;
                    border-radius: 999px;
                    padding: 2px 8px;
                    background: #ffffff;
                    border: 1px solid #cedae2;
                    color: #3f5a67;
                }
                .my-dashboard .dashboard-kanban-dropzone {
                    padding: 10px;
                    overflow-y: auto;
                    min-height: 120px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    transition: background-color 0.15s ease, box-shadow 0.15s ease;
                }
                .my-dashboard .dashboard-kanban-dropzone.is-drop-target {
                    background: #e9f5fb;
                    box-shadow: inset 0 0 0 2px #7fc3df;
                }
                .my-dashboard .dashboard-kanban-empty {
                    color: #708592;
                    font-size: 12px;
                    font-style: italic;
                    padding: 8px;
                }
                .my-dashboard .dashboard-kanban-card {
                    border: 1px solid #d8e3ea;
                    border-radius: 10px;
                    background: #ffffff;
                    box-shadow: 0 1px 2px rgba(10, 35, 55, 0.06);
                    padding: 9px;
                    cursor: grab;
                }
                .my-dashboard .dashboard-kanban-card.is-closed {
                    opacity: 0.92;
                }
                .my-dashboard .dashboard-kanban-card.is-locked {
                    cursor: default;
                }
                .my-dashboard .dashboard-kanban-card.is-dragging {
                    opacity: 0.55;
                }
                .my-dashboard .dashboard-kanban-card-title {
                    font-weight: 700;
                    margin-bottom: 3px;
                    color: #113f54;
                }
                .my-dashboard .dashboard-kanban-card-title a {
                    color: #0a5c7a;
                    text-decoration: none;
                }
                .my-dashboard .dashboard-kanban-card-title a:hover {
                    text-decoration: underline;
                }
                .my-dashboard .dashboard-kanban-card-subtitle {
                    font-size: 12px;
                    color: #234f63;
                    margin-bottom: 4px;
                }
                .my-dashboard .dashboard-kanban-card-subtitle a {
                    color: #1d5f7c;
                    text-decoration: none;
                }
                .my-dashboard .dashboard-kanban-card-subtitle a:hover {
                    text-decoration: underline;
                }
                .my-dashboard .dashboard-kanban-card-meta {
                    font-size: 11px;
                    color: #607987;
                    margin-bottom: 6px;
                }
                .my-dashboard .dashboard-kanban-card-row {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex-wrap: wrap;
                    margin-bottom: 5px;
                }
                .my-dashboard .dashboard-kanban-time {
                    font-size: 11px;
                    color: #657b87;
                }
                .my-dashboard .dashboard-kanban-card-actions {
                    display: flex;
                    gap: 6px;
                    margin-top: 6px;
                }
                .my-dashboard .dashboard-kanban-card-actions .ui2-button {
                    padding: 3px 8px;
                    font-size: 11px;
                    line-height: 1.4;
                }
            </style>
            <div class="ui2-page my-dashboard">
                <div class="ui2-header">
                    <div class="ui2-header-title">
                        <h2>My Dashboard</h2>
                    </div>
                </div>

                <div class="ui2-card ui2-card--section">
                    <form id="dashboardFilters" method="get" action="<?php echo(CATSUtility::getIndexName()); ?>">
                        <input type="hidden" name="m" value="dashboard" />
                        <input type="hidden" name="a" value="my" />
                        <input type="hidden" id="dashboardScopeInput" name="scope" value="<?php $this->_($this->dashboardScope); ?>" />
                        <input type="hidden" id="dashboardViewInput" name="view" value="<?php $this->_($this->dashboardView); ?>" />
                        <div class="ui2-datatable-toolbar">
                            <?php if (!empty($this->showScopeSwitcher)): ?>
                                <div>
                                    <label>Scope</label><br />
                                    <span class="ui2-inline">
                                        <button
                                            type="button"
                                            class="button ui2-button <?php echo(($this->dashboardScope === 'all') ? 'ui2-button--primary' : 'ui2-button--secondary'); ?>"
                                            onclick="setDashboardScope('all');"
                                        >All Jobs</button>
                                        <button
                                            type="button"
                                            class="button ui2-button <?php echo(($this->dashboardScope === 'mine') ? 'ui2-button--primary' : 'ui2-button--secondary'); ?>"
                                            onclick="setDashboardScope('mine');"
                                        >My Assigned Jobs</button>
                                    </span>
                                </div>
                            <?php endif; ?>
                            <div>
                                <label>View</label><br />
                                <span class="ui2-inline">
                                    <button
                                        type="button"
                                        class="button ui2-button <?php echo(($this->dashboardView === 'kanban') ? 'ui2-button--primary' : 'ui2-button--secondary'); ?>"
                                        onclick="setDashboardView('kanban');"
                                    >Kanban</button>
                                    <button
                                        type="button"
                                        class="button ui2-button <?php echo(($this->dashboardView === 'list') ? 'ui2-button--primary' : 'ui2-button--secondary'); ?>"
                                        onclick="setDashboardView('list');"
                                    >List</button>
                                </span>
                            </div>
                            <div>
                                <label for="dashboardJobOrder">Job Order</label><br />
                                <select id="dashboardJobOrder" name="jobOrderID" class="inputbox ui2-input ui2-input--md">
                                    <option value="0"><?php $this->_($this->jobOrderScopeLabel); ?></option>
                                    <?php foreach ($this->jobOrderOptions as $option): ?>
                                        <option value="<?php $this->_($option['jobOrderID']); ?>" <?php if ((int) $this->jobOrderID === (int) $option['jobOrderID']) echo('selected'); ?>>
                                            <?php $this->_($option['title']); ?><?php if (!empty($option['companyName'])): ?> (<?php $this->_($option['companyName']); ?>)<?php endif; ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            <div>
                                <label for="dashboardStatus">Status</label><br />
                                <select id="dashboardStatus" name="statusID" class="inputbox ui2-input ui2-input--md">
                                    <option value="0">All statuses</option>
                                    <?php foreach ($this->statusOptions as $option): ?>
                                        <option value="<?php $this->_($option['statusID']); ?>" <?php if ((int) $this->statusID === (int) $option['statusID']) echo('selected'); ?>>
                                            <?php $this->_($option['status']); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            <div>
                                <label>
                                    <input type="checkbox" name="showClosed" value="1" <?php if (!empty($this->showClosed)) echo('checked="checked"'); ?> />
                                    Show Closed
                                </label>
                            </div>
                        </div>
                    </form>

                    <?php $useKanban = ($this->dashboardScope === 'mine' && $this->dashboardView === 'kanban'); ?>
                    <?php if ($useKanban): ?>
                        <?php
                            $kanbanColumns = array(array('statusID' => 0, 'status' => 'No Status'));
                            foreach ($this->statusOptions as $statusOption)
                            {
                                $kanbanColumns[] = array(
                                    'statusID' => (int) $statusOption['statusID'],
                                    'status' => $statusOption['status']
                                );
                            }

                            $rowsByStatus = array();
                            foreach ($this->rows as $row)
                            {
                                $bucketStatusID = (int) $row['statusID'];
                                if ($bucketStatusID <= 0)
                                {
                                    $bucketStatusID = 0;
                                }
                                if (!isset($rowsByStatus[$bucketStatusID]))
                                {
                                    $rowsByStatus[$bucketStatusID] = array();
                                }
                                $rowsByStatus[$bucketStatusID][] = $row;
                            }
                        ?>
                        <div class="dashboardViewHint">
                            <?php if (!empty($this->canChangeStatus)): ?>
                                Drag a candidate card to the next stage to open the status transition popup.
                            <?php else: ?>
                                Kanban view is read-only for your role.
                            <?php endif; ?>
                        </div>
                        <div class="dashboard-kanban-shell">
                            <div class="dashboard-kanban-board" id="dashboardKanbanBoard">
                                <?php foreach ($kanbanColumns as $column): ?>
                                    <?php
                                        $columnStatusID = (int) $column['statusID'];
                                        $columnRows = isset($rowsByStatus[$columnStatusID]) ? $rowsByStatus[$columnStatusID] : array();
                                    ?>
                                    <div class="dashboard-kanban-column">
                                        <div class="dashboard-kanban-column-header">
                                            <span><?php echo(htmlspecialchars($column['status'])); ?></span>
                                            <span class="dashboard-kanban-column-count"><?php echo(count($columnRows)); ?></span>
                                        </div>
                                        <div class="dashboard-kanban-dropzone" data-status-id="<?php echo($columnStatusID); ?>">
                                            <?php if (empty($columnRows)): ?>
                                                <div class="dashboard-kanban-empty">No candidates.</div>
                                            <?php else: ?>
                                                <?php foreach ($columnRows as $row): ?>
                                                    <?php
                                                        $cardStatusLabel = trim($row['status']);
                                                        if ($cardStatusLabel === '' || $cardStatusLabel === null)
                                                        {
                                                            $cardStatusLabel = 'Unknown';
                                                        }
                                                        $cardStatusSlug = strtolower($cardStatusLabel);
                                                        $cardStatusSlug = preg_replace('/[^a-z0-9]+/', '-', $cardStatusSlug);
                                                        $cardStatusSlug = trim($cardStatusSlug, '-');
                                                        if ($cardStatusSlug === '')
                                                        {
                                                            $cardStatusSlug = 'unknown';
                                                        }
                                                        $cardStatusID = (int) $row['statusID'];
                                                        if ($cardStatusID <= 0)
                                                        {
                                                            $cardStatusID = 0;
                                                        }
                                                        $canDragCard = (!empty($this->canChangeStatus) && $cardStatusID !== (int) PIPELINE_STATUS_REJECTED);
                                                    ?>
                                                    <div
                                                        class="dashboard-kanban-card<?php if (!$canDragCard) echo(' is-locked'); ?><?php if ((int) $row['isActive'] === 0) echo(' is-closed'); ?>"
                                                        draggable="<?php echo($canDragCard ? 'true' : 'false'); ?>"
                                                        data-draggable="<?php echo($canDragCard ? '1' : '0'); ?>"
                                                        data-candidate-id="<?php echo((int) $row['candidateID']); ?>"
                                                        data-joborder-id="<?php echo((int) $row['jobOrderID']); ?>"
                                                        data-current-status-id="<?php echo($cardStatusID); ?>"
                                                        data-pipeline-id="<?php echo((int) $row['candidateJobOrderID']); ?>"
                                                    >
                                                        <div class="dashboard-kanban-card-title">
                                                            <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=candidates&amp;a=show&amp;candidateID=<?php echo($row['candidateID']); ?>">
                                                                <?php $this->_($row['firstName']); ?> <?php $this->_($row['lastName']); ?>
                                                            </a>
                                                        </div>
                                                        <div class="dashboard-kanban-card-subtitle">
                                                            <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=show&amp;jobOrderID=<?php echo($row['jobOrderID']); ?>">
                                                                <?php $this->_($row['jobOrderTitle']); ?>
                                                            </a>
                                                        </div>
                                                        <div class="dashboard-kanban-card-meta">
                                                            <?php $this->_($row['companyName']); ?> • <?php $this->_($row['location']); ?>
                                                        </div>
                                                        <div class="dashboard-kanban-card-row">
                                                            <span class="status-pill status-<?php echo($cardStatusSlug); ?>">
                                                                <?php $this->_($cardStatusLabel); ?>
                                                            </span>
                                                            <?php if ((int) $row['isActive'] === 0): ?>
                                                                <span class="pipelineClosedTag">Closed</span>
                                                            <?php endif; ?>
                                                        </div>
                                                        <div class="dashboard-kanban-card-row">
                                                            <span class="dashboardCommentBadge<?php if ((int) $row['candidateCommentCount'] <= 0) echo(' dashboardCommentBadge--empty'); ?>" title="Candidate comments">
                                                                C <?php echo((int) $row['candidateCommentCount']); ?>
                                                            </span>
                                                            <span class="dashboardCommentBadge<?php if ((int) $row['jobOrderCommentCount'] <= 0) echo(' dashboardCommentBadge--empty'); ?>" title="Job order comments">
                                                                JO <?php echo((int) $row['jobOrderCommentCount']); ?>
                                                            </span>
                                                            <span class="dashboard-kanban-time"><?php $this->_($row['lastStatusChangeDisplay']); ?></span>
                                                        </div>
                                                        <div class="dashboard-kanban-card-actions">
                                                            <a class="ui2-button ui2-button--secondary" href="#" onclick="showPopWin('<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=pipelineStatusDetails&amp;pipelineID=<?php echo($row['candidateJobOrderID']); ?>', 1200, 760, null); return false;">Details</a>
                                                            <?php if (!empty($this->canChangeStatus)): ?>
                                                                <a class="ui2-button ui2-button--secondary" href="#" onclick="dashboardOpenStatusModal(<?php echo((int) $row['candidateID']); ?>, <?php echo((int) $row['jobOrderID']); ?>, null); return false;">Change</a>
                                                            <?php endif; ?>
                                                        </div>
                                                    </div>
                                                <?php endforeach; ?>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    <?php else: ?>
                        <div class="ui2-datatable-card ui2-datatable-card--avel" style="margin-top: 12px;">
                        <table class="sortable">
                            <thead>
                                <tr>
                                    <th>Candidate Name</th>
                                    <th>Job Order Title</th>
                                    <th>Company</th>
                                    <th>Match</th>
                                    <th>Location</th>
                                    <th>Current Status</th>
                                    <th>Comments</th>
                                    <th>Last Status Change</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php if (empty($this->rows)): ?>
                                    <tr>
                                        <td colspan="9">No pipeline entries found.</td>
                                    </tr>
                                <?php else: ?>
                                    <?php foreach ($this->rows as $row): ?>
                                        <?php
                                            $rowClasses = array();
                                            if ((int) $row['isActive'] === 0)
                                            {
                                                $rowClasses[] = 'pipelineClosedRow';
                                            }
                                            if (!empty($row['totalCommentCount']))
                                            {
                                                $rowClasses[] = 'dashboardRowHasComments';
                                            }
                                        ?>
                                        <tr<?php if (!empty($rowClasses)) echo(' class="' . implode(' ', $rowClasses) . '"'); ?>>
                                            <td>
                                                <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=candidates&amp;a=show&amp;candidateID=<?php echo($row['candidateID']); ?>">
                                                    <?php $this->_($row['firstName']); ?> <?php $this->_($row['lastName']); ?>
                                                </a>
                                            </td>
                                            <td>
                                                <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=show&amp;jobOrderID=<?php echo($row['jobOrderID']); ?>">
                                                    <?php $this->_($row['jobOrderTitle']); ?>
                                                </a>
                                            </td>
                                            <td><?php $this->_($row['companyName']); ?></td>
                                            <td><?php echo($row['ratingLine']); ?></td>
                                            <td><?php $this->_($row['location']); ?></td>
                                            <td>
                                                <?php
                                                    $statusLabel = trim($row['status']);
                                                    if ($statusLabel === '' || $statusLabel === null)
                                                    {
                                                        $statusLabel = 'Unknown';
                                                    }
                                                    $statusSlug = strtolower($statusLabel);
                                                    $statusSlug = preg_replace('/[^a-z0-9]+/', '-', $statusSlug);
                                                    $statusSlug = trim($statusSlug, '-');
                                                    if ($statusSlug === '')
                                                    {
                                                        $statusSlug = 'unknown';
                                                    }
                                                ?>
                                                <span class="status-pill status-<?php echo($statusSlug); ?>">
                                                    <?php $this->_($statusLabel); ?>
                                                </span>
                                                <?php if ((int) $row['isActive'] === 0): ?>
                                                    <span class="pipelineClosedTag">Closed</span>
                                                <?php endif; ?>
                                            </td>
                                            <td>
                                                <span
                                                    class="dashboardCommentBadge<?php if ((int) $row['candidateCommentCount'] <= 0) echo(' dashboardCommentBadge--empty'); ?>"
                                                    title="Candidate comments"
                                                >C <?php echo((int) $row['candidateCommentCount']); ?></span>
                                                <span
                                                    class="dashboardCommentBadge<?php if ((int) $row['jobOrderCommentCount'] <= 0) echo(' dashboardCommentBadge--empty'); ?>"
                                                    title="Job order comments"
                                                >JO <?php echo((int) $row['jobOrderCommentCount']); ?></span>
                                            </td>
                                            <td><?php $this->_($row['lastStatusChangeDisplay']); ?></td>
                                            <td>
                                                <?php if (!empty($this->canChangeStatus)): ?>
                                                    <span class="ui2-inline">
                                                        <a class="button ui2-button ui2-button--secondary" href="#" onclick="showPopWin('<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=addActivityChangeStatus&amp;jobOrderID=<?php echo($row['jobOrderID']); ?>&amp;candidateID=<?php echo($row['candidateID']); ?>&amp;enforceOwner=1&amp;refreshParent=1', 600, 550, null); return false;">Change Status</a>
                                                        <a class="button ui2-button ui2-button--secondary" href="#" onclick="showPopWin('<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=pipelineStatusDetails&amp;pipelineID=<?php echo($row['candidateJobOrderID']); ?>', 1200, 760, null); return false;">Details</a>
                                                    </span>
                                                <?php else: ?>
                                                    <span class="ui2-status">No access</span>
                                                <?php endif; ?>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </tbody>
                        </table>
                        </div>
                    <?php endif; ?>

                    <?php if (!empty($this->totalRows)): ?>
                        <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                Showing
                                <?php echo(($this->entriesPerPage * ($this->page - 1)) + 1); ?>
                                -
                                <?php
                                    $end = $this->entriesPerPage * $this->page;
                                    if ($end > $this->totalRows) $end = $this->totalRows;
                                    echo($end);
                                ?>
                                of <?php echo($this->totalRows); ?>
                            </div>
                            <div>
                                <?php
                                    $base = CATSUtility::getIndexName() . '?m=dashboard&a=my';
                                    $params = array();
                                    if (!empty($this->showScopeSwitcher)) $params[] = 'scope=' . urlencode($this->dashboardScope);
                                    if (!empty($this->dashboardView)) $params[] = 'view=' . urlencode($this->dashboardView);
                                    if (!empty($this->showClosed)) $params[] = 'showClosed=1';
                                    if (!empty($this->jobOrderID)) $params[] = 'jobOrderID=' . (int) $this->jobOrderID;
                                    if (!empty($this->statusID)) $params[] = 'statusID=' . (int) $this->statusID;
                                    $base = $base . (count($params) ? '&' . implode('&', $params) : '');
                                ?>
                                <?php if ($this->page > 1): ?>
                                    <a href="<?php echo($base . '&page=' . ($this->page - 1)); ?>">&lt; Previous</a>
                                <?php endif; ?>
                                <?php if ($this->page < $this->totalPages): ?>
                                    &nbsp;&nbsp;
                                    <a href="<?php echo($base . '&page=' . ($this->page + 1)); ?>">Next &gt;</a>
                                <?php endif; ?>
                            </div>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
    <script type="text/javascript">
        function setDashboardScope(scopeValue)
        {
            var form = document.getElementById('dashboardFilters');
            var scopeInput = document.getElementById('dashboardScopeInput');
            var viewInput = document.getElementById('dashboardViewInput');
            if (!form || !scopeInput || !viewInput)
            {
                return;
            }
            scopeInput.value = scopeValue;
            if (scopeValue === 'mine')
            {
                viewInput.value = 'kanban';
            }
            else if (viewInput.value === 'kanban')
            {
                viewInput.value = 'list';
            }
            form.submit();
        }

        function setDashboardView(viewValue)
        {
            var form = document.getElementById('dashboardFilters');
            var scopeInput = document.getElementById('dashboardScopeInput');
            var viewInput = document.getElementById('dashboardViewInput');
            if (!form || !viewInput || !scopeInput)
            {
                return;
            }

            if (viewValue === 'kanban' && scopeInput.value !== 'mine')
            {
                scopeInput.value = 'mine';
            }
            viewInput.value = viewValue;
            form.submit();
        }

        function dashboardOpenStatusModal(candidateID, jobOrderID, targetStatusID)
        {
            var url = '<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&a=addActivityChangeStatus'
                + '&jobOrderID=' + encodeURIComponent(jobOrderID)
                + '&candidateID=' + encodeURIComponent(candidateID)
                + '&enforceOwner=1'
                + '&refreshParent=1';
            if (targetStatusID !== null && parseInt(targetStatusID, 10) > 0)
            {
                url += '&statusID=' + encodeURIComponent(targetStatusID);
            }
            showPopWin(url, 700, 620, null);
        }

        (function () {
            var form = document.getElementById('dashboardFilters');
            if (!form) return;
            var autoSubmit = function () { form.submit(); };
            var jobOrder = document.getElementById('dashboardJobOrder');
            var status = document.getElementById('dashboardStatus');
            var showClosed = form.querySelector('input[name="showClosed"]');
            if (jobOrder) jobOrder.onchange = autoSubmit;
            if (status) status.onchange = autoSubmit;
            if (showClosed) showClosed.onchange = autoSubmit;
        })();

        (function () {
            var board = document.getElementById('dashboardKanbanBoard');
            if (!board)
            {
                return;
            }

            var canChangeStatus = <?php echo(!empty($this->canChangeStatus) ? 'true' : 'false'); ?>;
            var rejectedStatusID = <?php echo((int) PIPELINE_STATUS_REJECTED); ?>;
            var statusOrder = <?php
                $statusOrder = array();
                foreach ($this->statusOptions as $option)
                {
                    $statusOrder[] = (int) $option['statusID'];
                }
                echo json_encode($statusOrder);
            ?>;
            var activeCard = null;

            function canMove(currentStatusID, targetStatusID)
            {
                if (!canChangeStatus)
                {
                    return false;
                }
                if (isNaN(currentStatusID) || isNaN(targetStatusID) || targetStatusID <= 0)
                {
                    return false;
                }
                if (currentStatusID === targetStatusID)
                {
                    return false;
                }
                if (currentStatusID === rejectedStatusID)
                {
                    return false;
                }
                if (targetStatusID === rejectedStatusID)
                {
                    return true;
                }
                var currentIndex = statusOrder.indexOf(currentStatusID);
                var targetIndex = statusOrder.indexOf(targetStatusID);
                if (currentIndex === -1 || targetIndex === -1)
                {
                    return true;
                }
                return targetIndex > currentIndex;
            }

            function clearDropTargets()
            {
                var zones = board.querySelectorAll('.dashboard-kanban-dropzone');
                for (var i = 0; i < zones.length; i++)
                {
                    zones[i].className = zones[i].className.replace(/\bis-drop-target\b/g, '').replace(/\s{2,}/g, ' ').replace(/^\s+|\s+$/g, '');
                }
            }

            var cards = board.querySelectorAll('.dashboard-kanban-card');
            for (var i = 0; i < cards.length; i++)
            {
                (function (card) {
                    if (card.getAttribute('data-draggable') !== '1')
                    {
                        return;
                    }

                    card.ondragstart = function (evt)
                    {
                        activeCard = card;
                        card.className += (card.className.indexOf(' is-dragging') === -1) ? ' is-dragging' : '';
                        if (evt.dataTransfer)
                        {
                            evt.dataTransfer.effectAllowed = 'move';
                            evt.dataTransfer.setData('text/plain', card.getAttribute('data-candidate-id') + ':' + card.getAttribute('data-joborder-id'));
                        }
                    };

                    card.ondragend = function ()
                    {
                        card.className = card.className.replace(/\bis-dragging\b/g, '').replace(/\s{2,}/g, ' ').replace(/^\s+|\s+$/g, '');
                        activeCard = null;
                        clearDropTargets();
                    };
                })(cards[i]);
            }

            var dropzones = board.querySelectorAll('.dashboard-kanban-dropzone');
            for (var j = 0; j < dropzones.length; j++)
            {
                (function (dropzone) {
                    dropzone.ondragover = function (evt)
                    {
                        if (!activeCard)
                        {
                            return;
                        }
                        var currentStatusID = parseInt(activeCard.getAttribute('data-current-status-id'), 10);
                        var targetStatusID = parseInt(dropzone.getAttribute('data-status-id'), 10);
                        if (!canMove(currentStatusID, targetStatusID))
                        {
                            return;
                        }
                        evt.preventDefault();
                        if (dropzone.className.indexOf('is-drop-target') === -1)
                        {
                            dropzone.className += ' is-drop-target';
                        }
                        if (evt.dataTransfer)
                        {
                            evt.dataTransfer.dropEffect = 'move';
                        }
                    };

                    dropzone.ondragleave = function ()
                    {
                        dropzone.className = dropzone.className.replace(/\bis-drop-target\b/g, '').replace(/\s{2,}/g, ' ').replace(/^\s+|\s+$/g, '');
                    };

                    dropzone.ondrop = function (evt)
                    {
                        if (!activeCard)
                        {
                            return;
                        }
                        evt.preventDefault();

                        var currentStatusID = parseInt(activeCard.getAttribute('data-current-status-id'), 10);
                        var targetStatusID = parseInt(dropzone.getAttribute('data-status-id'), 10);
                        if (!canMove(currentStatusID, targetStatusID))
                        {
                            if (currentStatusID === rejectedStatusID)
                            {
                                alert('Cannot move from Rejected. Re-assign the candidate to restart the pipeline.');
                            }
                            else
                            {
                                alert('Only forward stage transitions (or move to Rejected) are allowed from Kanban.');
                            }
                            clearDropTargets();
                            return;
                        }

                        clearDropTargets();
                        dashboardOpenStatusModal(
                            parseInt(activeCard.getAttribute('data-candidate-id'), 10),
                            parseInt(activeCard.getAttribute('data-joborder-id'), 10),
                            targetStatusID
                        );
                    };
                })(dropzones[j]);
            }
        })();
    </script>
<?php TemplateUtility::printFooter(); ?>
