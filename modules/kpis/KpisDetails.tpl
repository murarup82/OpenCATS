<?php /* $Id: KpisDetails.tpl 1 2026-01-27 $ */ ?>
<?php TemplateUtility::printHeader('KPI Details'); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active); ?>
    <div id="main">
        <?php TemplateUtility::printQuickSearch(); ?>

        <div id="contents"<?php echo TemplateUtility::getUI2WrapperAttribute(); ?>>
            <table>
                <tr>
                    <td width="3%">
                        <img src="images/reports.gif" width="24" height="24" border="0" alt="KPI Details" style="margin-top: 3px;" />&nbsp;
                    </td>
                    <td><h2>KPIs: Details</h2></td>
                </tr>
            </table>

            <p class="noteUnsizedSpan">
                <a href="<?php echo(htmlspecialchars($this->backURL)); ?>">Back to KPIs</a>
            </p>

            <h3 style="margin-top: 6px;"><?php echo(htmlspecialchars($this->detailTitle)); ?></h3>
            <p class="noteUnsizedSpan">Week: <?php echo(htmlspecialchars($this->detailRangeLabel)); ?></p>

            <style type="text/css">
                .kpiTable { width: 100%; border-collapse: collapse; }
                .kpiTable th { background: #0b8fb3; color: #ffffff; padding: 6px 8px; border: 1px solid #0b8fb3; text-align: left; }
                .kpiTable td { border: 1px solid #d0d0d0; padding: 6px 8px; text-align: left; }
            </style>

            <?php if (empty($this->detailRows)): ?>
                <p class="warning">No results found.</p>
            <?php else: ?>
                <div style="float: right"><?php $this->pager->printNavigation(); ?></div>
                <p class="noteUnsizedSpan">
                    Showing <?php echo(count($this->detailRows)); ?> of <?php echo((int) $this->pager->getTotalRows()); ?> results.
                </p>
                <table class="kpiTable">
                    <thead>
                        <tr>
                            <?php if ($this->detailMode === 'status'): ?>
                                <th>Candidate</th>
                                <th>Job Order</th>
                                <th>Status Date</th>
                            <?php else: ?>
                                <th>Candidate</th>
                                <th>Created</th>
                                <th>Source</th>
                            <?php endif; ?>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($this->detailRows as $row): ?>
                            <tr>
                                <?php if ($this->detailMode === 'status'): ?>
                                    <td>
                                        <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=candidates&amp;a=show&amp;candidateID=<?php echo((int) $row['candidateID']); ?>">
                                            <?php echo(htmlspecialchars($row['candidateName'])); ?>
                                        </a>
                                    </td>
                                    <td>
                                        <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=show&amp;jobOrderID=<?php echo((int) $row['jobOrderID']); ?>">
                                            <?php echo(htmlspecialchars($row['jobOrderTitle'])); ?>
                                        </a>
                                    </td>
                                    <td><?php echo(htmlspecialchars($row['statusDate'])); ?></td>
                                <?php else: ?>
                                    <td>
                                        <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=candidates&amp;a=show&amp;candidateID=<?php echo((int) $row['candidateID']); ?>">
                                            <?php echo(htmlspecialchars($row['candidateName'])); ?>
                                        </a>
                                    </td>
                                    <td><?php echo(htmlspecialchars($row['created'])); ?></td>
                                    <td><?php echo(htmlspecialchars($row['source'])); ?></td>
                                <?php endif; ?>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
                <div style="float: right; margin-top: 6px;"><?php $this->pager->printNavigation(); ?></div>
                <div style="clear: both;"></div>
            <?php endif; ?>
        </div>
    </div>
<?php TemplateUtility::printFooter(); ?>

