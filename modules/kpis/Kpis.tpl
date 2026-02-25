<?php /* $Id: Kpis.tpl 1 2026-01-26 $ */ ?>
<?php TemplateUtility::printHeader('KPIs'); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active); ?>
    <div id="main">
        <?php TemplateUtility::printQuickSearch(); ?>

        <div id="contents"<?php echo TemplateUtility::getUI2WrapperAttribute(); ?>>
            <div class="kpiPage">
            <table class="kpiTitleBar">
                <tr>
                    <td width="3%">
                        <img src="images/reports.gif" width="24" height="24" border="0" alt="KPIs" style="margin-top: 3px;" />&nbsp;
                    </td>
                    <td><h2>KPIs</h2></td>
                </tr>
            </table>

            <form method="get" action="<?php echo(CATSUtility::getIndexName()); ?>" class="kpiControlBar">
                <input type="hidden" name="m" value="kpis" />
                <input type="hidden" name="officialReports" value="0" />
                <input type="hidden" name="showDeadline" value="0" />
                <input type="hidden" name="showCompletionRate" value="0" />
                <input type="hidden" name="hideZeroOpenPositions" value="0" />
                <input type="hidden" name="candidateSourceScope" value="<?php echo(htmlspecialchars(isset($this->candidateSourceScope) ? $this->candidateSourceScope : 'all')); ?>" />
                <label for="officialReports" class="noteUnsizedSpan kpiToggle">
                    <input type="checkbox" id="officialReports" name="officialReports" value="1"<?php if (!empty($this->officialReports)): ?> checked="checked"<?php endif; ?> onchange="this.form.submit();" />
                    Official Reports
                </label>
                <label for="showDeadline" class="noteUnsizedSpan kpiToggle">
                    <input type="checkbox" id="showDeadline" name="showDeadline" value="1"<?php if (!empty($this->showDeadline)): ?> checked="checked"<?php endif; ?> onchange="this.form.submit();" />
                    Show time to deadline
                </label>
                <label for="hideZeroOpenPositions" class="noteUnsizedSpan kpiToggle">
                    <input type="checkbox" id="hideZeroOpenPositions" name="hideZeroOpenPositions" value="1"<?php if (!isset($this->hideZeroOpenPositions) || !empty($this->hideZeroOpenPositions)): ?> checked="checked"<?php endif; ?> onchange="this.form.submit();" />
                    Hide Total Open Positions = 0
                </label>
                <label for="showCompletionRate" class="noteUnsizedSpan kpiToggle">
                    <input type="checkbox" id="showCompletionRate" name="showCompletionRate" value="1"<?php if (!empty($this->showCompletionRate)): ?> checked="checked"<?php endif; ?> onchange="this.form.submit();" />
                    Show completion rate
                </label>
                <span class="noteUnsizedSpan kpiWeekBadge">Week: <?php $this->_($this->weekLabel); ?></span>
            </form>

            <style type="text/css">
                .kpiPage { max-width: 1500px; margin: 0 auto; padding-bottom: 18px; }
                .kpiTitleBar { margin-bottom: 8px; width: 100%; border-collapse: collapse; }
                .kpiControlBar {
                    margin: 0 0 12px;
                    padding: 10px 12px;
                    border: 1px solid #d7e3ea;
                    border-radius: 8px;
                    background: #f7fbfd;
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 8px 14px;
                }
                .kpiToggle { display: inline-flex; align-items: center; gap: 4px; }
                .kpiWeekBadge {
                    margin-left: auto;
                    display: inline-block;
                    padding: 3px 8px;
                    border: 1px solid #bfd5e0;
                    border-radius: 999px;
                    background: #ffffff;
                    font-weight: bold;
                    color: #075872;
                }
                .kpiCard {
                    margin-top: 12px;
                    border: 1px solid #dbe5ec;
                    border-radius: 10px;
                    background: #ffffff;
                    box-shadow: 0 1px 2px rgba(13, 45, 72, 0.06);
                    overflow: hidden;
                }
                .kpiTableScroll { overflow-x: auto; }
                .kpiTable { width: 100%; border-collapse: collapse; }
                .kpiTable th {
                    background: #0b8fb3;
                    color: #ffffff;
                    padding: 8px 10px;
                    border: 1px solid #0b8fb3;
                    text-align: center;
                    font-size: 12px;
                    line-height: 1.2;
                }
                .kpiTable td {
                    border: 1px solid #dfe8ee;
                    padding: 7px 10px;
                    text-align: center;
                    vertical-align: middle;
                }
                .kpiTable tbody tr:nth-child(even) td { background: #fbfdff; }
                .kpiTable tbody tr:hover td { background: #f1f8fc; }
                .kpiTable td.kpiClient { text-align: left; }
                .kpiTable tfoot td { background: #f3f8fc; font-weight: bold; }
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
                .kpiDelayZero { background: #cfeedd; }
                .kpiDelayUnknown { background: #e0e0e0; }
                .kpiInfoIcon { vertical-align: middle; margin-left: 4px; cursor: help; }
                .kpiHint { margin-top: 6px; }
                .kpiTrendControls {
                    margin-top: 12px;
                    padding: 10px 12px;
                    border: 1px solid #d7e3ea;
                    border-radius: 8px;
                    background: #f7fbfd;
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 8px 12px;
                }
                .kpiTrendPanel {
                    display: flex;
                    gap: 12px;
                    align-items: flex-start;
                    margin-top: 8px;
                }
                .kpiTrendChart {
                    flex: 1 1 auto;
                    min-width: 0;
                    border: 1px solid #dbe5ec;
                    border-radius: 10px;
                    background: #ffffff;
                    padding: 8px;
                }
                .kpiTrendChart img { max-width: 100%; height: auto; display: block; }
                .kpiSourceMixCard {
                    width: 330px;
                    flex: 0 0 330px;
                    border: 1px solid #dbe5ec;
                    border-radius: 10px;
                    background: #ffffff;
                    box-shadow: 0 1px 2px rgba(13, 45, 72, 0.06);
                }
                .kpiSourceMixHead {
                    background: #075872;
                    color: #ffffff;
                    font-weight: bold;
                    text-align: center;
                    padding: 8px 10px;
                    border-bottom: 1px solid #075872;
                }
                .kpiSourceMixBody { padding: 10px; text-align: center; }
                .kpiSourceMixBody img { max-width: 100%; height: auto; }
                @media (max-width: 1080px) {
                    .kpiTrendPanel { flex-direction: column; }
                    .kpiSourceMixCard { width: 100%; flex: 1 1 auto; }
                    .kpiWeekBadge { margin-left: 0; }
                }
                @media (max-width: 760px) {
                    .kpiControlBar, .kpiTrendControls { gap: 6px 10px; }
                    .kpiToggle { width: 100%; }
                    .kpiTrendControls label { width: 100%; }
                }
            </style>

            <?php if (empty($this->kpiRows)): ?>
                <p class="warning">No KPI data found.</p>
            <?php else: ?>
                <div class="kpiCard">
                    <div class="kpiTableScroll">
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
                    </div>
                </div>
            <?php endif; ?>

            <?php if (!empty($this->jobOrderKpiRows)): ?>
                <?php $table2ColumnCount = 6 + (!empty($this->showDeadline) ? 1 : 0) + (!empty($this->showCompletionRate) ? 1 : 0); ?>
                <div class="kpiCard">
                    <div class="kpiTableScroll">
                        <table class="kpiTable">
                            <thead>
                                <tr>
                                    <th colspan="<?php echo((int) $table2ColumnCount); ?>">(Q) Client Interview : Acceptance</th>
                                </tr>
                                <tr>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <?php if (!empty($this->showDeadline)): ?>
                                        <th>
                                            Time to deadline
                                            <img class="kpiInfoIcon" src="images/information.gif" width="12" height="12" alt="Info" title="Expected Completion Date minus today (days). Negative = overdue; '-' = not set; gray = invalid date." />
                                        </th>
                                    <?php endif; ?>
                                    <th>Client</th>
                                    <th>
                                        Total open positions
                                        <img class="kpiInfoIcon" src="images/information.gif" width="12" height="12" alt="Info" title="Openings planned in the current hiring window, capped by openings available." />
                                    </th>
                                    <th>
                                        Assigned candidates
                                        <img class="kpiInfoIcon" src="images/information.gif" width="12" height="12" alt="Info" title="Distinct candidates in status &quot;Allocated&quot; for this job order." />
                                    </th>
                                    <th>
                                        Hiring Rate
                                        <img class="kpiInfoIcon" src="images/information.gif" width="12" height="12" alt="Info" title="Candidates with latest status in Customer Approved, Avel Approved, Offer Negotiation, Offer Accepted, or Hired / assigned candidates (Allocated). Rejected latest status is excluded." />
                                    </th>
                                    <?php if (!empty($this->showCompletionRate)): ?>
                                        <th>
                                            Completion rate
                                            <img class="kpiInfoIcon" src="images/information.gif" width="12" height="12" alt="Info" title="Hired / total open positions." />
                                        </th>
                                    <?php endif; ?>
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
                                        <td><?php echo(htmlspecialchars($row['status'])); ?></td>
                                        <?php if (!empty($this->showDeadline)): ?>
                                            <td<?php if (!empty($row['timeToDeadlineClass'])): ?> class="<?php echo(htmlspecialchars($row['timeToDeadlineClass'])); ?>"<?php endif; ?>>
                                                <?php echo(htmlspecialchars($row['timeToDeadline'])); ?>
                                            </td>
                                        <?php endif; ?>
                                        <td><?php echo(htmlspecialchars($row['companyName'])); ?></td>
                                        <td><?php echo((int) $row['totalOpenPositions']); ?></td>
                                        <td><?php echo((int) $row['assignedCount']); ?></td>
                                        <td<?php if (!empty($row['hiringRateClass'])): ?> class="<?php echo(htmlspecialchars($row['hiringRateClass'])); ?>"<?php endif; ?>>
                                            <?php echo(htmlspecialchars($row['hiringRate'])); ?>
                                        </td>
                                        <?php if (!empty($this->showCompletionRate)): ?>
                                            <td><?php echo(htmlspecialchars($row['completionRate'])); ?></td>
                                        <?php endif; ?>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
                <?php if (!empty($this->showDeadline)): ?>
                    <p class="noteUnsizedSpan kpiHint">Time to deadline uses "<?php $this->_($this->expectedCompletionFieldName); ?>" (date - today). Official Reports filter applies.</p>
                <?php endif; ?>
            <?php endif; ?>

            <?php if (!empty($this->requestQualifiedRows)): ?>
                <div class="kpiCard">
                    <div class="kpiTableScroll">
                        <table class="kpiTable">
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
                                        <img class="kpiInfoIcon" src="images/information.gif" width="12" height="12" alt="Info" title="Business days (Mon-Fri) between demand received and first submission; weekends excluded (target &lt; 3)." />
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
                    </div>
                </div>
            <?php endif; ?>

            <?php if (empty($this->candidateSourceRows) && empty($this->candidateMetricRows)): ?>
                <p class="warning">No candidate KPI data found.</p>
            <?php else: ?>
                <div class="kpiCard">
                    <div class="kpiTableScroll">
                        <table class="kpiTable kpiCandidateTable">
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
                    </div>
                </div>
            <?php endif; ?>

            <form method="get" action="<?php echo(CATSUtility::getIndexName()); ?>" class="kpiTrendControls">
                <input type="hidden" name="m" value="kpis" />
                <input type="hidden" name="officialReports" value="<?php echo(!empty($this->officialReports) ? 1 : 0); ?>" />
                <input type="hidden" name="showDeadline" value="<?php echo(!empty($this->showDeadline) ? 1 : 0); ?>" />
                <input type="hidden" name="showCompletionRate" value="<?php echo(!empty($this->showCompletionRate) ? 1 : 0); ?>" />
                <input type="hidden" name="hideZeroOpenPositions" value="<?php echo(!empty($this->hideZeroOpenPositions) ? 1 : 0); ?>" />
                <label class="noteUnsizedSpan">
                    View:
                    <select name="trendView" class="inputbox">
                        <option value="weekly"<?php if ($this->candidateTrendView === 'weekly'): ?> selected<?php endif; ?>>Weekly</option>
                        <option value="monthly"<?php if ($this->candidateTrendView === 'monthly'): ?> selected<?php endif; ?>>Monthly</option>
                    </select>
                </label>
                <label class="noteUnsizedSpan">
                    Source:
                    <select name="candidateSourceScope" class="inputbox">
                        <option value="all"<?php if (!isset($this->candidateSourceScope) || $this->candidateSourceScope === 'all'): ?> selected<?php endif; ?>>All</option>
                        <option value="internal"<?php if (isset($this->candidateSourceScope) && $this->candidateSourceScope === 'internal'): ?> selected<?php endif; ?>>Internal</option>
                        <option value="partner"<?php if (isset($this->candidateSourceScope) && $this->candidateSourceScope === 'partner'): ?> selected<?php endif; ?>>Partner</option>
                    </select>
                </label>
                <label class="noteUnsizedSpan">
                    Start:
                    <input type="date" name="trendStart" value="<?php echo(htmlspecialchars($this->candidateTrendStart)); ?>" />
                </label>
                <label class="noteUnsizedSpan">
                    End:
                    <input type="date" name="trendEnd" value="<?php echo(htmlspecialchars($this->candidateTrendEnd)); ?>" />
                </label>
                <input type="submit" class="button" value="Update" />
            </form>

            <div class="kpiTrendPanel">
                <div class="kpiTrendChart">
                    <img src="<?php echo($this->candidateTrendGraphURL); ?>" alt="New Candidates Trend" />
                </div>
                <div class="kpiSourceMixCard">
                    <div class="kpiSourceMixHead">Candidate Source Mix</div>
                    <div class="kpiSourceMixBody">
                        <div class="noteUnsizedSpan" style="margin-bottom: 4px;">
                            Total in database:
                            <strong><?php echo((int) $this->candidateSourceSnapshot['total']); ?></strong>
                        </div>
                        <?php if (!empty($this->candidateSourcePieURL)): ?>
                            <img src="<?php echo(htmlspecialchars($this->candidateSourcePieURL)); ?>" alt="Candidate Source Mix Pie" />
                        <?php else: ?>
                            <div class="noteUnsizedSpan">No candidates to chart yet.</div>
                        <?php endif; ?>
                        <div class="noteUnsizedSpan" style="margin-top: 4px;">
                            Internal: <?php echo((int) $this->candidateSourceSnapshot['internal']); ?>
                            &nbsp;|&nbsp;
                            Partner: <?php echo((int) $this->candidateSourceSnapshot['partner']); ?>
                        </div>
                    </div>
                </div>
            </div>
            <p class="noteUnsizedSpan kpiHint">Trend counts candidates by creation date. Source filter (<?php echo(htmlspecialchars(isset($this->candidateSourceScopeLabel) ? $this->candidateSourceScopeLabel : 'All')); ?>) applies. Official Reports does not apply to trend.</p>

            </div>
        </div>
    </div>
<?php TemplateUtility::printFooter(); ?>

