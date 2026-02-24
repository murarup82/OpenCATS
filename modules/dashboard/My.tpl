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
                                    if (!empty($this->showScopeSwitcher) && $this->dashboardScope === 'mine') $params[] = 'scope=mine';
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
            if (!form || !scopeInput)
            {
                return;
            }
            scopeInput.value = scopeValue;
            form.submit();
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
    </script>
<?php TemplateUtility::printFooter(); ?>
