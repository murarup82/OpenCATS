<?php TemplateUtility::printHeader('Job Orders: Recruiter Allocation'); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active); ?>
<div id="main">
    <div id="contents"<?php echo TemplateUtility::getUI2WrapperAttribute(); ?>>
        <div class="ui2-page-header">
            <div class="ui2-datatable-toolbar ui2-datatable-toolbar--no-search">
                <div class="ui2-datatable-title">
                    <div class="ui2-datatable-title-row">
                        <img src="images/job_orders.gif" width="24" height="24" border="0" alt="Job Orders" style="margin-top: 3px;" />
                        <div>
                            <h2>Job Orders: Recruiter Allocation</h2>
                            <div class="ui2-datatable-meta">
                                Assign recruiters across job orders regardless of owner.
                                Showing page <?php echo (int) $this->page; ?> of <?php echo (int) $this->totalPages; ?> (<?php echo (int) $this->totalRows; ?> jobs)
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <?php if (!empty($this->noticeMessage)): ?>
            <div class="ui2-card" style="margin-bottom: 12px; border-left: 4px solid #2e7ea4; background: #f5fbfe;">
                <?php $this->_($this->noticeMessage); ?>
            </div>
        <?php endif; ?>

        <?php if (!empty($this->errorMessage)): ?>
            <div class="ui2-card" style="margin-bottom: 12px; border-left: 4px solid #c0392b; background: #fff6f5;">
                <?php $this->_($this->errorMessage); ?>
            </div>
        <?php endif; ?>

        <div class="ui2-card" style="margin-bottom: 12px;">
            <form method="get" action="<?php echo CATSUtility::getIndexName(); ?>" style="display:flex; flex-wrap:wrap; gap:10px; align-items:flex-end;">
                <input type="hidden" name="m" value="joborders" />
                <input type="hidden" name="a" value="recruiterAllocation" />

                <label>
                    Scope<br />
                    <select name="scope" class="inputbox">
                        <option value="all"<?php if ($this->scope === 'all'): ?> selected="selected"<?php endif; ?>>All Job Orders</option>
                        <option value="mine"<?php if ($this->scope === 'mine'): ?> selected="selected"<?php endif; ?>>My Job Orders</option>
                        <option value="unassigned"<?php if ($this->scope === 'unassigned'): ?> selected="selected"<?php endif; ?>>Unassigned Recruiter</option>
                    </select>
                </label>

                <label>
                    Owner<br />
                    <select name="ownerUserID" class="inputbox">
                        <option value="0">Any Owner</option>
                        <?php foreach ($this->ownerOptions as $owner): ?>
                            <option value="<?php echo (int) $owner['userID']; ?>"<?php if ((int) $this->ownerUserID === (int) $owner['userID']): ?> selected="selected"<?php endif; ?>>
                                <?php echo htmlspecialchars(trim($owner['firstName'] . ' ' . $owner['lastName'])); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </label>

                <label>
                    Recruiter<br />
                    <select name="recruiterUserID" class="inputbox">
                        <option value="-2"<?php if ((int) $this->recruiterUserID === -2): ?> selected="selected"<?php endif; ?>>Any Recruiter</option>
                        <option value="-1"<?php if ((int) $this->recruiterUserID === -1): ?> selected="selected"<?php endif; ?>>Unassigned</option>
                        <?php foreach ($this->recruiterOptions as $recruiter): ?>
                            <option value="<?php echo (int) $recruiter['userID']; ?>"<?php if ((int) $this->recruiterUserID === (int) $recruiter['userID']): ?> selected="selected"<?php endif; ?>>
                                <?php echo htmlspecialchars($recruiter['fullName']); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </label>

                <label style="min-width: 260px;">
                    Search Title / Company / Job ID<br />
                    <input type="text" name="search" class="inputbox" style="width:100%;" value="<?php echo htmlspecialchars($this->search); ?>" />
                </label>

                <button type="submit" class="ui2-button ui2-button--primary">Apply Filters</button>
            </form>
        </div>

        <?php if (empty($this->rows)): ?>
            <div class="ui2-card">No job orders match the selected filters.</div>
        <?php else: ?>
            <form method="post" action="<?php echo CATSUtility::getIndexName(); ?>?m=joborders&amp;a=recruiterAllocation">
                <input type="hidden" name="scope" value="<?php echo htmlspecialchars($this->scope); ?>" />
                <input type="hidden" name="ownerUserID" value="<?php echo (int) $this->ownerUserID; ?>" />
                <input type="hidden" name="recruiterUserID" value="<?php echo (int) $this->recruiterUserID; ?>" />
                <input type="hidden" name="search" value="<?php echo htmlspecialchars($this->search); ?>" />
                <input type="hidden" name="page" value="<?php echo (int) $this->page; ?>" />

                <div class="ui2-card ui2-datatable-card ui2-datatable-card--avel">
                    <table class="dataGrid">
                        <tr>
                            <th style="width: 80px;">Job ID</th>
                            <th>Title</th>
                            <th style="width: 180px;">Company</th>
                            <th style="width: 150px;">Status</th>
                            <th style="width: 170px;">Owner</th>
                            <th style="width: 170px;">Current Recruiter</th>
                            <th style="width: 220px;">Assign Recruiter</th>
                            <th style="width: 90px;">Modified</th>
                        </tr>
                        <?php foreach ($this->rows as $index => $row): ?>
                            <tr class="<?php echo ($index % 2 === 0) ? 'evenTableRow' : 'oddTableRow'; ?>">
                                <td><?php echo htmlspecialchars($row['companyJobID']); ?></td>
                                <td>
                                    <a href="<?php echo CATSUtility::getIndexName(); ?>?m=joborders&amp;a=show&amp;jobOrderID=<?php echo (int) $row['jobOrderID']; ?>">
                                        <?php echo htmlspecialchars($row['title']); ?>
                                    </a>
                                </td>
                                <td><?php echo htmlspecialchars($row['companyName']); ?></td>
                                <td><?php echo htmlspecialchars($row['status']); ?></td>
                                <td><?php echo htmlspecialchars($row['ownerFullName']); ?></td>
                                <td>
                                    <?php
                                        $currentRecruiterLabel = trim((string) $row['recruiterFullName']);
                                        if ($currentRecruiterLabel === '') { $currentRecruiterLabel = '(Unassigned)'; }
                                        echo htmlspecialchars($currentRecruiterLabel);
                                    ?>
                                </td>
                                <td>
                                    <select name="recruiterAssignment[<?php echo (int) $row['jobOrderID']; ?>]" class="inputbox" style="width: 100%;">
                                        <option value="0"<?php if ((int) $row['recruiterUserID'] <= 0): ?> selected="selected"<?php endif; ?>>Unassigned</option>
                                        <?php foreach ($this->recruiterOptions as $recruiter): ?>
                                            <option value="<?php echo (int) $recruiter['userID']; ?>"<?php if ((int) $row['recruiterUserID'] === (int) $recruiter['userID']): ?> selected="selected"<?php endif; ?>>
                                                <?php echo htmlspecialchars($recruiter['fullName']); ?>
                                            </option>
                                        <?php endforeach; ?>
                                    </select>
                                    <input type="hidden" name="currentRecruiterAssignment[<?php echo (int) $row['jobOrderID']; ?>]" value="<?php echo (int) $row['recruiterUserID']; ?>" />
                                </td>
                                <td><?php echo htmlspecialchars($row['dateModified']); ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </table>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; margin-top: 12px;">
                    <div>
                        <?php
                            $startRow = ($this->totalRows > 0) ? (($this->page - 1) * 50) + 1 : 0;
                            $endRow = ($this->totalRows > 0) ? min($this->totalRows, $this->page * 50) : 0;
                        ?>
                        Showing <?php echo (int) $startRow; ?> - <?php echo (int) $endRow; ?> of <?php echo (int) $this->totalRows; ?>
                    </div>
                    <div style="display:flex; gap:8px;">
                        <button type="submit" class="ui2-button ui2-button--primary">Save Assignments</button>
                    </div>
                </div>
            </form>

            <?php if ((int) $this->totalPages > 1): ?>
                <?php
                    $baseParams = array(
                        'm' => 'joborders',
                        'a' => 'recruiterAllocation',
                        'scope' => $this->scope,
                        'ownerUserID' => (int) $this->ownerUserID,
                        'recruiterUserID' => (int) $this->recruiterUserID,
                        'search' => $this->search
                    );
                ?>
                <div style="margin-top: 12px; display:flex; gap:8px;">
                    <?php if ((int) $this->page > 1): ?>
                        <?php $prevParams = $baseParams; $prevParams['page'] = (int) $this->page - 1; ?>
                        <a class="ui2-button ui2-button--secondary" href="<?php echo CATSUtility::getIndexName(); ?>?<?php echo htmlspecialchars(http_build_query($prevParams)); ?>">Prev</a>
                    <?php endif; ?>

                    <?php if ((int) $this->page < (int) $this->totalPages): ?>
                        <?php $nextParams = $baseParams; $nextParams['page'] = (int) $this->page + 1; ?>
                        <a class="ui2-button ui2-button--secondary" href="<?php echo CATSUtility::getIndexName(); ?>?<?php echo htmlspecialchars(http_build_query($nextParams)); ?>">Next</a>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
        <?php endif; ?>
    </div>
</div>
<?php TemplateUtility::printFooter(); ?>
