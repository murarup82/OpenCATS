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

            <form method="get" action="<?php echo(CATSUtility::getIndexName()); ?>" style="margin-bottom: 6px;">
                <input type="hidden" name="m" value="kpis" />
                <input type="hidden" name="officialReports" value="0" />
                <label for="officialReports" class="noteUnsizedSpan" style="margin-right: 10px;">
                    <input type="checkbox" id="officialReports" name="officialReports" value="1"<?php if (!empty($this->officialReports)): ?> checked="checked"<?php endif; ?> onchange="this.form.submit();" />
                    Official Reports
                </label>
                <span class="noteUnsizedSpan">Company KPI summary (Week: <?php $this->_($this->weekLabel); ?>)</span>
            </form>

            <style type="text/css">
                .kpiTable { width: 100%; border-collapse: collapse; }
                .kpiTable th { background: #0b8fb3; color: #ffffff; padding: 6px 8px; border: 1px solid #0b8fb3; text-align: center; }
                .kpiTable td { border: 1px solid #d0d0d0; padding: 6px 8px; text-align: center; }
                .kpiTable td.kpiClient { text-align: left; }
                .kpiTable tfoot td { background: #f2f6fb; font-weight: bold; }
                .kpiCandidateTable th { background: #075872; border-color: #075872; }
                .kpiCandidateTable td.kpiLabel { text-align: left; }
                .kpiCandidateTable td.kpiSource { color: #075872; }
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
                            <th>Filled positions</th>
                            <th>Expected conversion</th>
                            <th>Expected filled</th>
                            <th>Expected in FC</th>
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
                                <td><?php echo((int) $row['filledPositions']); ?></td>
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
                            <td><?php echo((int) $this->totals['filledPositions']); ?></td>
                            <td></td>
                            <td><?php echo((int) $this->totals['expectedFilled']); ?></td>
                            <td><?php echo((int) $this->totals['expectedInFullPlan']); ?></td>
                        </tr>
                        <tr>
                            <td class="kpiClient">vs Last week</td>
                            <td><?php if ($this->totalsDiff['newPositions'] > 0) echo('+'); ?><?php echo((int) $this->totalsDiff['newPositions']); ?></td>
                            <td><?php if ($this->totalsDiff['totalOpenPositions'] > 0) echo('+'); ?><?php echo((int) $this->totalsDiff['totalOpenPositions']); ?></td>
                            <td><?php if ($this->totalsDiff['filledPositions'] > 0) echo('+'); ?><?php echo((int) $this->totalsDiff['filledPositions']); ?></td>
                            <td></td>
                            <td><?php if ($this->totalsDiff['expectedFilled'] > 0) echo('+'); ?><?php echo((int) $this->totalsDiff['expectedFilled']); ?></td>
                            <td><?php if ($this->totalsDiff['expectedInFullPlan'] > 0) echo('+'); ?><?php echo((int) $this->totalsDiff['expectedInFullPlan']); ?></td>
                        </tr>
                    </tfoot>
                </table>
            <?php endif; ?>

            <?php if (empty($this->candidateSourceRows) && empty($this->candidateMetricRows)): ?>
                <p class="warning">No candidate KPI data found.</p>
            <?php else: ?>
                <table class="kpiTable kpiCandidateTable" style="margin-top: 12px;">
                    <thead>
                        <tr>
                            <th colspan="4">New Candidates</th>
                        </tr>
                        <tr>
                            <th></th>
                            <th>This week</th>
                            <th>Last week</th>
                            <th>Delta vs LW</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($this->candidateSourceRows as $row): ?>
                            <tr>
                                <td class="kpiLabel kpiSource"><?php echo(htmlspecialchars($row['label'])); ?></td>
                                <td><?php echo((int) $row['thisWeek']); ?></td>
                                <td><?php echo((int) $row['lastWeek']); ?></td>
                                <td><?php if ($row['delta'] > 0) echo('+'); ?><?php echo((int) $row['delta']); ?></td>
                            </tr>
                        <?php endforeach; ?>
                        <?php foreach ($this->candidateMetricRows as $row): ?>
                            <tr>
                                <td class="kpiLabel"><?php echo(htmlspecialchars($row['label'])); ?></td>
                                <td><?php echo((int) $row['thisWeek']); ?></td>
                                <td><?php echo((int) $row['lastWeek']); ?></td>
                                <td><?php if ($row['delta'] > 0) echo('+'); ?><?php echo((int) $row['delta']); ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>

            <form method="get" action="<?php echo(CATSUtility::getIndexName()); ?>" style="margin-top: 12px;">
                <input type="hidden" name="m" value="kpis" />
                <input type="hidden" name="officialReports" value="<?php echo(!empty($this->officialReports) ? 1 : 0); ?>" />
                <label class="noteUnsizedSpan" style="margin-right: 8px;">
                    View:
                    <select name="trendView" class="inputbox">
                        <option value="weekly"<?php if ($this->candidateTrendView === 'weekly'): ?> selected<?php endif; ?>>Weekly</option>
                        <option value="monthly"<?php if ($this->candidateTrendView === 'monthly'): ?> selected<?php endif; ?>>Monthly</option>
                    </select>
                </label>
                <label class="noteUnsizedSpan" style="margin-right: 8px;">
                    Start:
                    <input type="date" name="trendStart" value="<?php echo(htmlspecialchars($this->candidateTrendStart)); ?>" />
                </label>
                <label class="noteUnsizedSpan" style="margin-right: 8px;">
                    End:
                    <input type="date" name="trendEnd" value="<?php echo(htmlspecialchars($this->candidateTrendEnd)); ?>" />
                </label>
                <input type="submit" class="button" value="Update" />
            </form>

            <div style="margin-top: 6px;">
                <img src="<?php echo($this->candidateTrendGraphURL); ?>" alt="New Candidates Trend" />
            </div>

            <p class="noteUnsizedSpan">Expected conversion is pulled from the job order extra field "<?php $this->_($this->expectedConversionFieldName); ?>" (empty = 0%). Filled positions count job order candidates currently in status "Hired". Expected filled and Expected in FC are reduced by filled positions and floored at 0. Expected in FC shows total planned openings (past, present, future) from hiring plans. Official Reports limits job orders to "<?php $this->_($this->monitoredJobOrderFieldName); ?>" = Yes.</p>
        </div>
    </div>
<?php TemplateUtility::printFooter(); ?>
