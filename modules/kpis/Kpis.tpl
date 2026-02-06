<?php /* $Id: Kpis.tpl 1 2026-01-26 $ */ ?>
<?php TemplateUtility::printHeader('KPIs'); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active); ?>
    <div id="main">
        <?php TemplateUtility::printQuickSearch(); ?>

        <div id="contents"<?php echo TemplateUtility::getUI2WrapperAttribute(); ?>>
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
                .kpiDeadlineOk { color: #1d7f3f; font-weight: bold; }
                .kpiDeadlineOverdue { color: #c0392b; font-weight: bold; }
                .kpiDeadlineUnknown { color: #666666; }
                .kpiAcceptanceOk { color: #1d7f3f; font-weight: bold; }
                .kpiAcceptanceLow { color: #c0392b; font-weight: bold; }
                .kpiAcceptanceZero { color: #000000; }
                .kpiDelayOk { background: #cfeedd; }
                .kpiDelayLate { background: #f5b2b2; }
                .kpiDelayZero { background: #e0e0e0; }
                .kpiInfoIcon { vertical-align: middle; margin-left: 4px; cursor: help; }
            </style>

            <?php if (empty($this->kpiRows)): ?>
                <p class="warning">No KPI data found.</p>
            <?php else: ?>
                <table class="kpiTable">
                    <thead>
                        <tr>
                            <th colspan="7">Positions Open</th>
                        </tr>
                        <tr>
                            <th>Client</th>
                            <th>
                                New positions this week
                                <img class="kpiInfoIcon" src="images/information.gif" width="12" height="12" alt="Info" title="Openings from active hiring plans for job orders created this week." />
                            </th>
                            <th>
                                Total open positions
                                <img class="kpiInfoIcon" src="images/information.gif" width="12" height="12" alt="Info" title="Openings planned in the current hiring window, capped by openings available." />
                            </th>
                            <th>
                                Filled positions
                                <img class="kpiInfoIcon" src="images/information.gif" width="12" height="12" alt="Info" title="Candidates currently in status &quot;Hired&quot; for open job orders." />
                            </th>
                            <th>
                                Expected conversion
                                <img class="kpiInfoIcon" src="images/information.gif" width="12" height="12" alt="Info" title="Range of &quot;Conversion Rate&quot; extra field values for this client's open job orders (empty = 0%)." />
                            </th>
                            <th>
                                Expected filled
                                <img class="kpiInfoIcon" src="images/information.gif" width="12" height="12" alt="Info" title="Sum of open positions x conversion rate, minus filled positions, floored at 0." />
                            </th>
                            <th>
                                Expected in FC
                                <img class="kpiInfoIcon" src="images/information.gif" width="12" height="12" alt="Info" title="Total planned openings across all hiring plans, minus filled positions, floored at 0." />
                            </th>
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

            <?php if (!empty($this->jobOrderKpiRows)): ?>
                <table class="kpiTable" style="margin-top: 12px;">
                    <thead>
                        <tr>
                            <th colspan="7">(Q) Client Interview : Acceptance</th>
                        </tr>
                        <tr>
                            <th>Role</th>
                            <th>
                                Time to deadline
                                <img class="kpiInfoIcon" src="images/information.gif" width="12" height="12" alt="Info" title="Expected Completion Date minus today (days). Negative = overdue; '-' = not set; gray = invalid date." />
                            </th>
                            <th>Client</th>
                            <th>
                                Total open positions
                                <img class="kpiInfoIcon" src="images/information.gif" width="12" height="12" alt="Info" title="Openings planned in the current hiring window, capped by openings available." />
                            </th>
                            <th>
                                CVs submitted to client
                                <img class="kpiInfoIcon" src="images/information.gif" width="12" height="12" alt="Info" title="Distinct candidates in status &quot;Proposed to Customer&quot;." />
                            </th>
                            <th>
                                Acceptance rate
                                <img class="kpiInfoIcon" src="images/information.gif" width="12" height="12" alt="Info" title="Accepted (submitted candidates who were later hired) / submitted." />
                            </th>
                            <th>
                                Completion rate
                                <img class="kpiInfoIcon" src="images/information.gif" width="12" height="12" alt="Info" title="Hired / total open positions." />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($this->jobOrderKpiRows as $row): ?>
                            <tr>
                                <td>
                                    <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=show&amp;jobOrderID=<?php echo((int) $row['jobOrderID']); ?>">
                                        <?php echo(htmlspecialchars($row['title'])); ?>
                                    </a>
                                </td>
                                <td<?php if (!empty($row['timeToDeadlineClass'])): ?> class="<?php echo(htmlspecialchars($row['timeToDeadlineClass'])); ?>"<?php endif; ?>>
                                    <?php echo(htmlspecialchars($row['timeToDeadline'])); ?>
                                </td>
                                <td><?php echo(htmlspecialchars($row['companyName'])); ?></td>
                                <td><?php echo((int) $row['totalOpenPositions']); ?></td>
                                <td><?php echo((int) $row['submittedCount']); ?></td>
                                <td<?php if (!empty($row['acceptanceRateClass'])): ?> class="<?php echo(htmlspecialchars($row['acceptanceRateClass'])); ?>"<?php endif; ?>>
                                    <?php echo(htmlspecialchars($row['acceptanceRate'])); ?>
                                </td>
                                <td><?php echo(htmlspecialchars($row['completionRate'])); ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
                <p class="noteUnsizedSpan">Time to deadline uses "<?php $this->_($this->expectedCompletionFieldName); ?>" (date - today). Official Reports filter applies.</p>
            <?php endif; ?>

            <?php if (!empty($this->requestQualifiedRows)): ?>
                <table class="kpiTable" style="margin-top: 12px;">
                    <thead>
                        <tr>
                            <th colspan="5">(S) Request to qualified candidate (target < 3 days)</th>
                        </tr>
                        <tr>
                            <th>Role</th>
                            <th>Client</th>
                            <th>
                                Date demand received
                                <img class="kpiInfoIcon" src="images/information.gif" width="12" height="12" alt="Info" title="Job order created date." />
                            </th>
                            <th>
                                Date first qualified candidate submitted
                                <img class="kpiInfoIcon" src="images/information.gif" width="12" height="12" alt="Info" title="First date a candidate reached status &quot;Proposed to Customer&quot;." />
                            </th>
                            <th>
                                Days
                                <img class="kpiInfoIcon" src="images/information.gif" width="12" height="12" alt="Info" title="Calendar days between demand received and first submission (target &lt; 3)." />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($this->requestQualifiedRows as $row): ?>
                            <tr>
                                <td>
                                    <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=show&amp;jobOrderID=<?php echo((int) $row['jobOrderID']); ?>">
                                        <?php echo(htmlspecialchars($row['title'])); ?>
                                    </a>
                                </td>
                                <td><?php echo(htmlspecialchars($row['companyName'])); ?></td>
                                <td><?php echo(htmlspecialchars($row['receivedDate'])); ?></td>
                                <td><?php echo(htmlspecialchars($row['submittedDate'])); ?></td>
                                <td<?php if (!empty($row['daysClass'])): ?> class="<?php echo(htmlspecialchars($row['daysClass'])); ?>"<?php endif; ?>>
                                    <?php echo(htmlspecialchars($row['daysValue'])); ?>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
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
                                <td>
                                    <?php if (!empty($row['thisWeekLink'])): ?>
                                        <a href="<?php echo(htmlspecialchars($row['thisWeekLink'])); ?>"><?php echo((int) $row['thisWeek']); ?></a>
                                    <?php else: ?>
                                        <?php echo((int) $row['thisWeek']); ?>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <?php if (!empty($row['lastWeekLink'])): ?>
                                        <a href="<?php echo(htmlspecialchars($row['lastWeekLink'])); ?>"><?php echo((int) $row['lastWeek']); ?></a>
                                    <?php else: ?>
                                        <?php echo((int) $row['lastWeek']); ?>
                                    <?php endif; ?>
                                </td>
                                <td><?php if ($row['delta'] > 0) echo('+'); ?><?php echo((int) $row['delta']); ?></td>
                            </tr>
                        <?php endforeach; ?>
                        <?php foreach ($this->candidateMetricRows as $row): ?>
                            <tr>
                                <td class="kpiLabel"><?php echo(htmlspecialchars($row['label'])); ?></td>
                                <td>
                                    <?php if (!empty($row['thisWeekLink'])): ?>
                                        <a href="<?php echo(htmlspecialchars($row['thisWeekLink'])); ?>"><?php echo((int) $row['thisWeek']); ?></a>
                                    <?php else: ?>
                                        <?php echo((int) $row['thisWeek']); ?>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <?php if (!empty($row['lastWeekLink'])): ?>
                                        <a href="<?php echo(htmlspecialchars($row['lastWeekLink'])); ?>"><?php echo((int) $row['lastWeek']); ?></a>
                                    <?php else: ?>
                                        <?php echo((int) $row['lastWeek']); ?>
                                    <?php endif; ?>
                                </td>
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
            <p class="noteUnsizedSpan">Trend counts all candidates by creation date, regardless of Official Reports.</p>

            <p class="noteUnsizedSpan">Expected conversion is pulled from the job order extra field "<?php $this->_($this->expectedConversionFieldName); ?>" (empty = 0%). Filled positions count job order candidates currently in status "Hired". Expected filled and Expected in FC are reduced by filled positions and floored at 0. Expected in FC shows total planned openings (past, present, future) from hiring plans. Official Reports limits job orders to "<?php $this->_($this->monitoredJobOrderFieldName); ?>" = Yes.</p>
        </div>
    </div>
<?php TemplateUtility::printFooter(); ?>

