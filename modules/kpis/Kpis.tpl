<?php /* $Id: Kpis.tpl 1 2026-01-26 $ */ ?>
<?php TemplateUtility::printHeader('KPIs'); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active); ?>
    <div id="main">
        <?php TemplateUtility::printQuickSearch(); ?>

        <div id="contents">
            <table>
                <tr>
                    <td width="3%">
                        <img src="images/reports.gif" width="24" height="24" border="0" alt="KPIs" style="margin-top: 3px;" />&nbsp;
                    </td>
                    <td><h2>KPIs</h2></td>
                </tr>
            </table>

            <p class="note">Company KPI summary (Week: <?php $this->_($this->weekLabel); ?>)</p>

            <style type="text/css">
                .kpiTable { width: 100%; border-collapse: collapse; }
                .kpiTable th { background: #0b8fb3; color: #ffffff; padding: 6px 8px; border: 1px solid #0b8fb3; text-align: center; }
                .kpiTable td { border: 1px solid #d0d0d0; padding: 6px 8px; text-align: center; }
                .kpiTable td.kpiClient { text-align: left; }
                .kpiTable tfoot td { background: #f2f6fb; font-weight: bold; }
            </style>

            <?php if (empty($this->kpiRows)): ?>
                <p class="warning">No KPI data found.</p>
            <?php else: ?>
                <table class="kpiTable">
                    <thead>
                        <tr>
                            <th>Client</th>
                            <th>New positions this week</th>
                            <th>Total open positions</th>
                            <th>Expected conversion</th>
                            <th>Expected filled</th>
                            <th>Expected in FT</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($this->kpiRows as $row): ?>
                            <tr>
                                <td class="kpiClient">
                                    <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=companies&amp;a=show&amp;companyID=<?php echo((int) $row['companyID']); ?>">
                                        <?php echo(htmlspecialchars($row['companyName'])); ?>
                                    </a>
                                </td>
                                <td><?php echo((int) $row['newPositions']); ?></td>
                                <td><?php echo((int) $row['totalOpenPositions']); ?></td>
                                <td><?php echo(htmlspecialchars($row['expectedConversionDisplay'])); ?></td>
                                <td><?php echo((int) $row['expectedFilled']); ?></td>
                                <td><?php echo((int) $row['expectedInFullPlan']); ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td class="kpiClient">Total</td>
                            <td><?php echo((int) $this->totals['newPositions']); ?></td>
                            <td><?php echo((int) $this->totals['totalOpenPositions']); ?></td>
                            <td></td>
                            <td><?php echo((int) $this->totals['expectedFilled']); ?></td>
                            <td><?php echo((int) $this->totals['expectedInFullPlan']); ?></td>
                        </tr>
                    </tfoot>
                </table>
            <?php endif; ?>

            <p class="noteUnsizedSpan">Expected conversion is pulled from the job order extra field "<?php $this->_($this->expectedConversionFieldName); ?>" (empty = 0%). Expected filled is calculated per job order and summed by client. Expected in FT shows total openings from the full hiring plan.</p>
        </div>
    </div>
<?php TemplateUtility::printFooter(); ?>
