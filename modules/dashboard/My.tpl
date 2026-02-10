<?php /* My Dashboard */ ?>
<?php TemplateUtility::printHeader('My Dashboard', array('js/match.js')); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active); ?>
    <div id="main">
        <?php TemplateUtility::printQuickSearch(); ?>

        <div id="contents"<?php echo TemplateUtility::getUI2WrapperAttribute(); ?>>
            <div class="ui2-page">
                <div class="ui2-header">
                    <div class="ui2-header-title">
                        <h2>My Dashboard</h2>
                    </div>
                </div>

                <div class="ui2-card ui2-card--section">
                    <form id="dashboardFilters" method="get" action="<?php echo(CATSUtility::getIndexName()); ?>">
                        <input type="hidden" name="m" value="dashboard" />
                        <input type="hidden" name="a" value="my" />
                        <div class="ui2-datatable-toolbar">
                            <div>
                                <label for="dashboardJobOrder">Job Order</label><br />
                                <select id="dashboardJobOrder" name="jobOrderID" class="inputbox ui2-input ui2-input--md">
                                    <option value="0">All my job orders</option>
                                    <?php foreach ($this->jobOrderOptions as $option): ?>
                                        <option value="<?php $this->_($option['jobOrderID']); ?>" <?php if ((int) $this->jobOrderID === (int) $option['jobOrderID']) echo('selected'); ?>>
                                            <?php $this->_($option['title']); ?><?php if (!empty($option['companyName'])): ?> (<?php $this->_($option['companyName']); ?>)<?php endif; ?>
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
                            <div>
                                <input type="submit" class="button ui2-button" value="Apply" />
                            </div>
                        </div>
                    </form>

                    <table class="ui2-table" style="margin-top: 12px;">
                        <thead>
                            <tr>
                                <th>Candidate Name</th>
                                <th>Job Order Title</th>
                                <th>Company</th>
                                <th>Match</th>
                                <th>Location</th>
                                <th>Current Status</th>
                                <th>Last Status Change</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if (empty($this->rows)): ?>
                                <tr>
                                    <td colspan="8">No pipeline entries found.</td>
                                </tr>
                            <?php else: ?>
                                <?php foreach ($this->rows as $row): ?>
                                    <tr<?php if ((int) $row['isActive'] === 0) echo(' class="pipelineClosedRow"'); ?>>
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
                                            <?php $this->_($row['status']); ?>
                                            <?php if ((int) $row['isActive'] === 0): ?>
                                                <span class="pipelineClosedTag">Closed</span>
                                            <?php endif; ?>
                                        </td>
                                        <td><?php $this->_($row['lastStatusChangeDisplay']); ?></td>
                                        <td>
                                            <?php if (!empty($this->canChangeStatus)): ?>
                                                <span class="ui2-inline">
                                                    <a class="button ui2-button ui2-button--secondary" href="#" onclick="showPopWin('<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=addActivityChangeStatus&amp;jobOrderID=<?php echo($row['jobOrderID']); ?>&amp;candidateID=<?php echo($row['candidateID']); ?>&amp;enforceOwner=1&amp;refreshParent=1', 600, 550, null); return false;">Change Status</a>
                                                    <a class="button ui2-button ui2-button--secondary" href="#" onclick="window.open('<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=pipelineStatusDetails&amp;pipelineID=<?php echo($row['candidateJobOrderID']); ?>', 'pipelineStatusDetails', 'width=900,height=650,scrollbars=yes,resizable=yes'); return false;">Details</a>
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
                                    if (!empty($this->showClosed)) $params[] = 'showClosed=1';
                                    if (!empty($this->jobOrderID)) $params[] = 'jobOrderID=' . (int) $this->jobOrderID;
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
<?php TemplateUtility::printFooter(); ?>
