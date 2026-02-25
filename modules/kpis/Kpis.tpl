<?php /* $Id: Kpis.tpl 1 2026-01-26 $ */ ?>
<?php TemplateUtility::printHeader('KPIs'); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active); ?>
    <div id="main">
        <?php TemplateUtility::printQuickSearch(); ?>

        <div id="contents"<?php echo TemplateUtility::getUI2WrapperAttribute(); ?>>
            <div class="kpiPage">
            <div class="kpiTitleRow">
                <div class="kpiTitleLeft">
                    <img src="images/reports.gif" width="24" height="24" border="0" alt="KPIs" />
                    <h2>KPIs</h2>
                </div>
                <div class="kpiMetaBadges">
                    <span class="noteUnsizedSpan kpiWeekBadge">Week: <?php $this->_($this->weekLabel); ?></span>
                    <span class="noteUnsizedSpan kpiWeekBadge">Data as of: <?php echo(htmlspecialchars($this->dataAsOfLabel)); ?></span>
                </div>
            </div>

            <style type="text/css">
                .kpiPage { max-width: 1500px; margin: 0 auto; padding-bottom: 18px; }
                .kpiTitleRow {
                    margin-bottom: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                }
                .kpiTitleLeft { display: flex; align-items: center; gap: 8px; }
                .kpiTitleLeft h2 { margin: 0; }
                .kpiWeekBadge {
                    display: inline-block;
                    padding: 4px 10px;
                    border: 1px solid #bfd5e0;
                    border-radius: 999px;
                    background: #ffffff;
                    font-weight: bold;
                    color: #075872;
                }
                .kpiMetaBadges { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
                .kpiCard {
                    margin-top: 12px;
                    border: 1px solid #dbe5ec;
                    border-radius: 10px;
                    background: #ffffff;
                    box-shadow: 0 1px 2px rgba(13, 45, 72, 0.06);
                    overflow: visible;
                }
                .kpiSectionHeader {
                    padding: 10px 12px;
                    border-bottom: 1px solid #e3ecf2;
                    background: #f8fbfd;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 10px;
                }
                .kpiSectionTitleWrap { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
                .kpiSectionTitle { margin: 0; font-size: 16px; color: #0c4f67; }
                .kpiChip {
                    display: inline-block;
                    padding: 2px 7px;
                    border-radius: 999px;
                    font-size: 11px;
                    border: 1px solid #cfe0e8;
                    background: #ffffff;
                    color: #375969;
                }
                .kpiChipOn { border-color: #9acbb3; background: #ecfaf2; color: #18603c; }
                .kpiChipOff { border-color: #dbc7c7; background: #fbf1f1; color: #8b2f2f; }
                .kpiSectionActions { display: flex; align-items: center; gap: 8px; }
                .kpiDetailsButton {
                    cursor: pointer;
                    border: 1px solid #bfd5e0;
                    background: #ffffff;
                    color: #0c4f67;
                    border-radius: 8px;
                    padding: 4px 10px;
                    font-size: 12px;
                    font-weight: bold;
                }
                .kpiDetailsButton:hover { background: #eaf4f9; }
                .kpiConfig { position: relative; }
                .kpiConfig summary {
                    list-style: none;
                    cursor: pointer;
                    border: 1px solid #0a6e8b;
                    background: #0b8fb3;
                    color: #ffffff;
                    border-radius: 8px;
                    padding: 4px 10px;
                    font-size: 12px;
                    font-weight: bold;
                }
                .kpiConfig summary::-webkit-details-marker { display: none; }
                .kpiConfig[open] summary { background: #0a6e8b; }
                .kpiConfigPanel {
                    position: absolute;
                    right: 0;
                    top: calc(100% + 6px);
                    min-width: 260px;
                    z-index: 20;
                    border: 1px solid #c8d9e3;
                    border-radius: 8px;
                    background: #ffffff;
                    box-shadow: 0 8px 20px rgba(0, 27, 46, 0.12);
                    padding: 10px;
                }
                .kpiConfigPanel .kpiToggleRow { display: flex; align-items: center; gap: 6px; margin-bottom: 7px; }
                .kpiConfigPanel .kpiToggleRow:last-of-type { margin-bottom: 10px; }
                .kpiConfigActions { display: flex; align-items: center; gap: 8px; }
                .kpiResetButton {
                    cursor: pointer;
                    border: 1px solid #d4c3c3;
                    background: #ffffff;
                    color: #7a3e3e;
                    border-radius: 6px;
                    padding: 3px 8px;
                    font-size: 12px;
                }
                .kpiResetButton:hover { background: #fff6f6; }
                .kpiConfigPanel .kpiConfigNote {
                    margin: 2px 0 10px;
                    padding: 6px 8px;
                    border: 1px solid #d7e5ef;
                    border-radius: 6px;
                    background: #f5f9fc;
                    color: #4d6675;
                    font-size: 12px;
                    line-height: 1.3;
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
                /* Keep day-status colors visible despite zebra-row and hover backgrounds. */
                .kpiTable tbody tr td.kpiDelayOk,
                .kpiTable tbody tr td.kpiDelayZero { background: #cfeedd; }
                .kpiTable tbody tr td.kpiDelayLate { background: #f5b2b2; }
                .kpiTable tbody tr td.kpiDelayUnknown { background: #e0e0e0; }
                .kpiInfoIcon { vertical-align: middle; margin-left: 4px; cursor: help; }
                .kpiHint { margin-top: 6px; }
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
                .kpiHelpTemplate { display: none; }
                .kpiHelpModal {
                    position: fixed;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(9, 33, 51, 0.55);
                    z-index: 9000;
                    display: none;
                    align-items: center;
                    justify-content: center;
                    padding: 18px;
                    box-sizing: border-box;
                }
                .kpiHelpModal.kpiHelpOpen { display: flex; }
                .kpiHelpDialog {
                    width: min(860px, 100%);
                    max-height: calc(100vh - 36px);
                    overflow: auto;
                    border-radius: 12px;
                    border: 1px solid #c8d9e3;
                    background: #ffffff;
                    box-shadow: 0 18px 40px rgba(0, 27, 46, 0.32);
                }
                .kpiHelpHead {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                    padding: 12px 14px;
                    border-bottom: 1px solid #e2ecf2;
                    background: #f8fbfd;
                }
                .kpiHelpTitle { margin: 0; font-size: 18px; color: #0c4f67; }
                .kpiHelpClose {
                    cursor: pointer;
                    border: 1px solid #c7d9e4;
                    background: #ffffff;
                    color: #285567;
                    border-radius: 8px;
                    padding: 3px 8px;
                    font-size: 12px;
                    font-weight: bold;
                }
                .kpiHelpBody { padding: 14px; color: #244a5a; }
                .kpiHelpBody h4 { margin: 0 0 8px; color: #0c4f67; }
                .kpiHelpBody p { margin: 0 0 8px; line-height: 1.45; }
                .kpiHelpBody details {
                    margin-top: 8px;
                    border: 1px solid #d9e6ee;
                    border-radius: 8px;
                    background: #fafcff;
                    padding: 8px 10px;
                }
                .kpiHelpBody details summary { cursor: pointer; font-weight: bold; color: #0c4f67; }
                .kpiHelpBody code {
                    background: #eff5fa;
                    border-radius: 4px;
                    padding: 0 4px;
                }
                @media (max-width: 1080px) {
                    .kpiTrendPanel { flex-direction: column; }
                    .kpiSourceMixCard { width: 100%; flex: 1 1 auto; }
                    .kpiConfigPanel { position: static; margin-top: 8px; box-shadow: none; }
                }
                @media (max-width: 760px) {
                    .kpiTitleRow { flex-direction: column; align-items: flex-start; }
                    .kpiSectionHeader { flex-direction: column; align-items: flex-start; }
                }
            </style>

            <?php
                $officialReportsChecked = !empty($this->officialReports);
                $showDeadlineChecked = !empty($this->showDeadline);
                $showCompletionRateChecked = !empty($this->showCompletionRate);
                $hideZeroOpenChecked = (!isset($this->hideZeroOpenPositions) || !empty($this->hideZeroOpenPositions));
                $candidateSourceScope = isset($this->candidateSourceScope) ? $this->candidateSourceScope : 'all';
                $jobOrderScope = isset($this->jobOrderScope) ? $this->jobOrderScope : 'all';
                $jobOrderScopeAllChecked = ($jobOrderScope !== 'open');
                $jobOrderScopeLabel = isset($this->jobOrderScopeLabel) ? $this->jobOrderScopeLabel : 'All Job Orders (Open + Closed + Cancelled)';
                $filledPositionsTitle = $jobOrderScopeAllChecked ?
                    'Candidates currently in status &quot;Hired&quot; for all job orders.' :
                    'Candidates currently in status &quot;Hired&quot; for open job orders only.';
            ?>

            <?php if (empty($this->kpiRows)): ?>
                <p class="warning">No KPI data found.</p>
            <?php else: ?>
                <div class="kpiCard">
                    <div class="kpiSectionHeader">
                        <div class="kpiSectionTitleWrap">
                            <h3 class="kpiSectionTitle">Positions Open</h3>
                            <span class="kpiChip <?php echo($officialReportsChecked ? 'kpiChipOn' : 'kpiChipOff'); ?>">Official Reports: <?php echo($officialReportsChecked ? 'On' : 'Off'); ?></span>
                            <span class="kpiChip <?php echo($jobOrderScopeAllChecked ? 'kpiChipOn' : 'kpiChipOff'); ?>">JO Scope: <?php echo(htmlspecialchars($jobOrderScopeLabel)); ?></span>
                        </div>
                        <div class="kpiSectionActions">
                            <button type="button" class="kpiDetailsButton" data-kpi-help-key="positions-open" data-kpi-help-title="Positions Open">Details</button>
                            <details class="kpiConfig">
                                <summary>Configure</summary>
                                <div class="kpiConfigPanel">
                                    <form method="get" action="<?php echo(CATSUtility::getIndexName()); ?>">
                                        <input type="hidden" name="m" value="kpis" />
                                        <input type="hidden" name="showDeadline" value="<?php echo($showDeadlineChecked ? 1 : 0); ?>" />
                                        <input type="hidden" name="showCompletionRate" value="<?php echo($showCompletionRateChecked ? 1 : 0); ?>" />
                                        <input type="hidden" name="hideZeroOpenPositions" value="<?php echo($hideZeroOpenChecked ? 1 : 0); ?>" />
                                        <input type="hidden" name="candidateSourceScope" value="<?php echo(htmlspecialchars($candidateSourceScope)); ?>" />
                                        <input type="hidden" name="trendView" value="<?php echo(htmlspecialchars($this->candidateTrendView)); ?>" />
                                        <input type="hidden" name="trendStart" value="<?php echo(htmlspecialchars($this->candidateTrendStart)); ?>" />
                                        <input type="hidden" name="trendEnd" value="<?php echo(htmlspecialchars($this->candidateTrendEnd)); ?>" />
                                        <input type="hidden" name="officialReports" value="0" />
                                        <label class="kpiToggleRow">
                                            <input type="checkbox" name="officialReports" value="1"<?php if ($officialReportsChecked): ?> checked="checked"<?php endif; ?> />
                                            Official Reports
                                        </label>
                                        <label class="kpiToggleRow">
                                            Job orders:
                                            <select name="jobOrderScope" class="inputbox">
                                                <option value="open"<?php if ($jobOrderScope === 'open'): ?> selected="selected"<?php endif; ?>>Only Open JO</option>
                                                <option value="all"<?php if ($jobOrderScope === 'all'): ?> selected="selected"<?php endif; ?>>All Job Orders (Open + Closed + Cancelled)</option>
                                            </select>
                                        </label>
                                        <p class="kpiConfigNote">Applies to Positions Open, Client Interview : Acceptance, and Request to qualified candidate.</p>
                                        <div class="kpiConfigActions">
                                            <input type="submit" class="button" value="Apply" />
                                            <button type="submit" class="kpiResetButton" name="resetKpiFilters" value="1">Reset filters</button>
                                        </div>
                                    </form>
                                </div>
                            </details>
                        </div>
                    </div>
                    <div class="kpiTableScroll">
                        <table class="kpiTable">
                            <thead>
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
                                        <img class="kpiInfoIcon" src="images/information.gif" width="12" height="12" alt="Info" title="<?php echo($filledPositionsTitle); ?>" />
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
                <div class="kpiCard">
                    <div class="kpiSectionHeader">
                        <div class="kpiSectionTitleWrap">
                            <h3 class="kpiSectionTitle">Client Interview : Acceptance</h3>
                            <span class="kpiChip <?php echo($jobOrderScopeAllChecked ? 'kpiChipOn' : 'kpiChipOff'); ?>">JO Scope: <?php echo(htmlspecialchars($jobOrderScopeLabel)); ?></span>
                            <span class="kpiChip <?php echo($showDeadlineChecked ? 'kpiChipOn' : 'kpiChipOff'); ?>">Deadline: <?php echo($showDeadlineChecked ? 'On' : 'Off'); ?></span>
                            <span class="kpiChip <?php echo($hideZeroOpenChecked ? 'kpiChipOn' : 'kpiChipOff'); ?>">Hide Open=0: <?php echo($hideZeroOpenChecked ? 'On' : 'Off'); ?></span>
                        </div>
                        <div class="kpiSectionActions">
                            <button type="button" class="kpiDetailsButton" data-kpi-help-key="interview-acceptance" data-kpi-help-title="Client Interview : Acceptance">Details</button>
                            <details class="kpiConfig">
                                <summary>Configure</summary>
                                <div class="kpiConfigPanel">
                                    <form method="get" action="<?php echo(CATSUtility::getIndexName()); ?>">
                                        <input type="hidden" name="m" value="kpis" />
                                        <input type="hidden" name="officialReports" value="<?php echo($officialReportsChecked ? 1 : 0); ?>" />
                                        <input type="hidden" name="jobOrderScope" value="<?php echo(htmlspecialchars($jobOrderScope)); ?>" />
                                        <input type="hidden" name="candidateSourceScope" value="<?php echo(htmlspecialchars($candidateSourceScope)); ?>" />
                                        <input type="hidden" name="trendView" value="<?php echo(htmlspecialchars($this->candidateTrendView)); ?>" />
                                        <input type="hidden" name="trendStart" value="<?php echo(htmlspecialchars($this->candidateTrendStart)); ?>" />
                                        <input type="hidden" name="trendEnd" value="<?php echo(htmlspecialchars($this->candidateTrendEnd)); ?>" />
                                        <input type="hidden" name="showDeadline" value="0" />
                                        <label class="kpiToggleRow">
                                            <input type="checkbox" name="showDeadline" value="1"<?php if ($showDeadlineChecked): ?> checked="checked"<?php endif; ?> />
                                            Show time to deadline
                                        </label>
                                        <input type="hidden" name="showCompletionRate" value="<?php echo($showCompletionRateChecked ? 1 : 0); ?>" />
                                        <input type="hidden" name="hideZeroOpenPositions" value="0" />
                                        <label class="kpiToggleRow">
                                            <input type="checkbox" name="hideZeroOpenPositions" value="1"<?php if ($hideZeroOpenChecked): ?> checked="checked"<?php endif; ?> />
                                            Hide Total Open Positions = 0
                                        </label>
                                        <div class="kpiConfigActions">
                                            <input type="submit" class="button" value="Apply" />
                                            <button type="submit" class="kpiResetButton" name="resetKpiFilters" value="1">Reset filters</button>
                                        </div>
                                    </form>
                                </div>
                            </details>
                        </div>
                    </div>
                    <div class="kpiTableScroll">
                        <table class="kpiTable">
                            <thead>
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
                                        Acceptance Rate
                                        <img class="kpiInfoIcon" src="images/information.gif" width="12" height="12" alt="Info" title="Candidates that reached status &quot;Customer Approved&quot; at any time / assigned candidates (Allocated)." />
                                    </th>
                                    <th>
                                        Hiring Rate
                                        <img class="kpiInfoIcon" src="images/information.gif" width="12" height="12" alt="Info" title="Hired / total open positions in KPI window. For closed job orders this can be 0, resulting in 0%." />
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
                                        <td><?php echo(htmlspecialchars($row['status'])); ?></td>
                                        <?php if (!empty($this->showDeadline)): ?>
                                            <td<?php if (!empty($row['timeToDeadlineClass'])): ?> class="<?php echo(htmlspecialchars($row['timeToDeadlineClass'])); ?>"<?php endif; ?>>
                                                <?php echo(htmlspecialchars($row['timeToDeadline'])); ?>
                                            </td>
                                        <?php endif; ?>
                                        <td><?php echo(htmlspecialchars($row['companyName'])); ?></td>
                                        <td><?php echo((int) $row['totalOpenPositions']); ?></td>
                                        <td><?php echo((int) $row['assignedCount']); ?></td>
                                        <td<?php if (!empty($row['acceptanceRateClass'])): ?> class="<?php echo(htmlspecialchars($row['acceptanceRateClass'])); ?>"<?php endif; ?>>
                                            <?php echo(htmlspecialchars($row['acceptanceRate'])); ?>
                                        </td>
                                        <td>
                                            <?php echo(htmlspecialchars($row['hiringRate'])); ?>
                                        </td>
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
                    <div class="kpiSectionHeader">
                        <div class="kpiSectionTitleWrap">
                            <h3 class="kpiSectionTitle">Request to qualified candidate</h3>
                            <span class="kpiChip">Target: &lt; 3 days</span>
                            <span class="kpiChip <?php echo($jobOrderScopeAllChecked ? 'kpiChipOn' : 'kpiChipOff'); ?>">JO Scope: <?php echo(htmlspecialchars($jobOrderScopeLabel)); ?></span>
                            <span class="kpiChip <?php echo($officialReportsChecked ? 'kpiChipOn' : 'kpiChipOff'); ?>">Official Reports: <?php echo($officialReportsChecked ? 'On' : 'Off'); ?></span>
                            <span class="kpiChip <?php echo($hideZeroOpenChecked ? 'kpiChipOn' : 'kpiChipOff'); ?>">Hide Open=0: <?php echo($hideZeroOpenChecked ? 'On' : 'Off'); ?></span>
                        </div>
                        <div class="kpiSectionActions">
                            <button type="button" class="kpiDetailsButton" data-kpi-help-key="request-qualified" data-kpi-help-title="Request to qualified candidate">Details</button>
                        </div>
                    </div>
                    <div class="kpiTableScroll">
                        <table class="kpiTable">
                            <thead>
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
                    <div class="kpiSectionHeader">
                        <div class="kpiSectionTitleWrap">
                            <h3 class="kpiSectionTitle">New Candidates</h3>
                            <span class="kpiChip">Source: <?php echo(htmlspecialchars(isset($this->candidateSourceScopeLabel) ? $this->candidateSourceScopeLabel : 'All')); ?></span>
                        </div>
                        <div class="kpiSectionActions">
                            <button type="button" class="kpiDetailsButton" data-kpi-help-key="new-candidates" data-kpi-help-title="New Candidates">Details</button>
                            <details class="kpiConfig">
                                <summary>Configure</summary>
                                <div class="kpiConfigPanel">
                                    <form method="get" action="<?php echo(CATSUtility::getIndexName()); ?>">
                                        <input type="hidden" name="m" value="kpis" />
                                        <input type="hidden" name="officialReports" value="<?php echo($officialReportsChecked ? 1 : 0); ?>" />
                                        <input type="hidden" name="jobOrderScope" value="<?php echo(htmlspecialchars($jobOrderScope)); ?>" />
                                        <input type="hidden" name="showDeadline" value="<?php echo($showDeadlineChecked ? 1 : 0); ?>" />
                                        <input type="hidden" name="showCompletionRate" value="<?php echo($showCompletionRateChecked ? 1 : 0); ?>" />
                                        <input type="hidden" name="hideZeroOpenPositions" value="<?php echo($hideZeroOpenChecked ? 1 : 0); ?>" />
                                        <input type="hidden" name="trendView" value="<?php echo(htmlspecialchars($this->candidateTrendView)); ?>" />
                                        <input type="hidden" name="trendStart" value="<?php echo(htmlspecialchars($this->candidateTrendStart)); ?>" />
                                        <input type="hidden" name="trendEnd" value="<?php echo(htmlspecialchars($this->candidateTrendEnd)); ?>" />
                                        <label class="kpiToggleRow">
                                            Source:
                                            <select name="candidateSourceScope" class="inputbox">
                                                <option value="all"<?php if ($candidateSourceScope === 'all'): ?> selected="selected"<?php endif; ?>>All</option>
                                                <option value="internal"<?php if ($candidateSourceScope === 'internal'): ?> selected="selected"<?php endif; ?>>Internal</option>
                                                <option value="partner"<?php if ($candidateSourceScope === 'partner'): ?> selected="selected"<?php endif; ?>>Partner</option>
                                            </select>
                                        </label>
                                        <div class="kpiConfigActions">
                                            <input type="submit" class="button" value="Apply" />
                                            <button type="submit" class="kpiResetButton" name="resetKpiFilters" value="1">Reset filters</button>
                                        </div>
                                    </form>
                                </div>
                            </details>
                        </div>
                    </div>
                    <div class="kpiTableScroll">
                        <table class="kpiTable kpiCandidateTable">
                            <thead>
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

            <div class="kpiCard">
                <div class="kpiSectionHeader">
                    <div class="kpiSectionTitleWrap">
                        <h3 class="kpiSectionTitle">New Candidates Trend</h3>
                        <span class="kpiChip">View: <?php echo(ucfirst($this->candidateTrendView)); ?></span>
                        <span class="kpiChip">Source: <?php echo(htmlspecialchars(isset($this->candidateSourceScopeLabel) ? $this->candidateSourceScopeLabel : 'All')); ?></span>
                        <span class="kpiChip"><?php echo(htmlspecialchars($this->candidateTrendStart)); ?> to <?php echo(htmlspecialchars($this->candidateTrendEnd)); ?></span>
                    </div>
                    <div class="kpiSectionActions">
                        <button type="button" class="kpiDetailsButton" data-kpi-help-key="new-candidates-trend" data-kpi-help-title="New Candidates Trend">Details</button>
                        <details class="kpiConfig">
                            <summary>Configure</summary>
                            <div class="kpiConfigPanel">
                                <form method="get" action="<?php echo(CATSUtility::getIndexName()); ?>">
                                    <input type="hidden" name="m" value="kpis" />
                                    <input type="hidden" name="officialReports" value="<?php echo($officialReportsChecked ? 1 : 0); ?>" />
                                    <input type="hidden" name="jobOrderScope" value="<?php echo(htmlspecialchars($jobOrderScope)); ?>" />
                                    <input type="hidden" name="showDeadline" value="<?php echo($showDeadlineChecked ? 1 : 0); ?>" />
                                    <input type="hidden" name="showCompletionRate" value="<?php echo($showCompletionRateChecked ? 1 : 0); ?>" />
                                    <input type="hidden" name="hideZeroOpenPositions" value="<?php echo($hideZeroOpenChecked ? 1 : 0); ?>" />
                                    <label class="kpiToggleRow">
                                        View:
                                        <select name="trendView" class="inputbox">
                                            <option value="weekly"<?php if ($this->candidateTrendView === 'weekly'): ?> selected="selected"<?php endif; ?>>Weekly</option>
                                            <option value="monthly"<?php if ($this->candidateTrendView === 'monthly'): ?> selected="selected"<?php endif; ?>>Monthly</option>
                                        </select>
                                    </label>
                                    <label class="kpiToggleRow">
                                        Source:
                                        <select name="candidateSourceScope" class="inputbox">
                                            <option value="all"<?php if ($candidateSourceScope === 'all'): ?> selected="selected"<?php endif; ?>>All</option>
                                            <option value="internal"<?php if ($candidateSourceScope === 'internal'): ?> selected="selected"<?php endif; ?>>Internal</option>
                                            <option value="partner"<?php if ($candidateSourceScope === 'partner'): ?> selected="selected"<?php endif; ?>>Partner</option>
                                        </select>
                                    </label>
                                    <label class="kpiToggleRow">
                                        Start:
                                        <input type="date" name="trendStart" value="<?php echo(htmlspecialchars($this->candidateTrendStart)); ?>" />
                                    </label>
                                    <label class="kpiToggleRow">
                                        End:
                                        <input type="date" name="trendEnd" value="<?php echo(htmlspecialchars($this->candidateTrendEnd)); ?>" />
                                    </label>
                                    <div class="kpiConfigActions">
                                        <input type="submit" class="button" value="Apply" />
                                        <button type="submit" class="kpiResetButton" name="resetKpiFilters" value="1">Reset filters</button>
                                    </div>
                                </form>
                            </div>
                        </details>
                    </div>
                </div>
                <div class="kpiTrendPanel">
                    <div class="kpiTrendChart">
                        <img src="<?php echo($this->candidateTrendGraphURL); ?>" alt="New Candidates Trend" />
                    </div>
                    <div class="kpiSourceMixCard">
                        <div class="kpiSourceMixHead">Candidate Source Distribution</div>
                        <div class="kpiSourceMixBody">
                            <div class="noteUnsizedSpan" style="margin-bottom: 4px;">
                                Total in database:
                                <strong><?php echo((int) $this->candidateSourceSnapshot['total']); ?></strong>
                            </div>
                            <?php if (!empty($this->candidateSourcePieURL)): ?>
                                <img src="<?php echo(htmlspecialchars($this->candidateSourcePieURL)); ?>" alt="Candidate Source Distribution Pie" />
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
            </div>

            <div id="kpiHelpTemplate-positions-open" class="kpiHelpTemplate">
                <h4>Overview</h4>
                <p>This table shows staffing progress per client for the selected job order scope and official-report filter.</p>
                <p>It answers: how many positions are planned, how many are already filled, and what the expected fill is based on conversion assumptions.</p>
                <details>
                    <summary>Fields and formulas</summary>
                    <p><code>New positions this week</code>: active hiring-plan openings for job orders created this week.</p>
                    <p><code>Total open positions</code>: hiring-plan openings in the active KPI window, capped by <code>joborder.openings_available</code>.</p>
                    <p><code>Filled positions</code>: candidates whose latest JO status is <code>Hired</code>, grouped by company, filtered by JO scope.</p>
                    <p><code>Expected conversion</code>: extra field <code>Conversion Rate</code> from JO (empty = <code>0%</code>).</p>
                    <p><code>Expected filled</code>: <code>round(sum(open_positions * conversion_rate)) - filled_positions</code>, floored at <code>0</code>.</p>
                    <p><code>Expected in FC</code>: <code>total_planned_openings - filled_positions</code>, floored at <code>0</code>.</p>
                </details>
            </div>

            <div id="kpiHelpTemplate-interview-acceptance" class="kpiHelpTemplate">
                <h4>Overview</h4>
                <p>This table tracks candidate progression per job order from assignment to customer approval and final hiring.</p>
                <p>It highlights pipeline quality with Acceptance Rate and Hiring Rate.</p>
                <details>
                    <summary>Fields and formulas</summary>
                    <p><code>Assigned candidates</code>: distinct candidates that reached status <code>Allocated</code>.</p>
                    <p><code>Acceptance Rate</code>: candidates that reached <code>Customer Approved</code> at least once, divided by assigned candidates.</p>
                    <p>Formula: <code>acceptance = approved_ever / assigned</code>.</p>
                    <p><code>Hiring Rate</code>: candidates in <code>Hired</code> divided by <code>Total open positions</code>.</p>
                    <p>Formula: <code>hiring = hired / total_open_positions</code>.</p>
                    <p><code>Time to deadline</code>: value from extra field <code>Expected Completion Date</code> minus today (days).</p>
                </details>
            </div>

            <div id="kpiHelpTemplate-request-qualified" class="kpiHelpTemplate">
                <h4>Overview</h4>
                <p>This table measures responsiveness: how quickly the first qualified candidate is submitted after a request is received.</p>
                <p>Target is under 3 business days.</p>
                <details>
                    <summary>Fields and formulas</summary>
                    <p><code>Date demand received</code>: <code>joborder.date_created</code>.</p>
                    <p><code>Date first qualified candidate submitted</code>: first date a candidate reached <code>Proposed to Customer</code>.</p>
                    <p><code>Days</code>: business days between the two dates (Monday-Friday, weekends excluded).</p>
                    <p>Color rules: <code>0</code> light green, <code>1-3</code> green, <code>&gt; 3</code> red, missing value gray.</p>
                </details>
            </div>

            <div id="kpiHelpTemplate-new-candidates" class="kpiHelpTemplate">
                <h4>Overview</h4>
                <p>This table compares weekly candidate inflow and key pipeline milestones against last week.</p>
                <p>It supports source scope filtering: All, Internal, or Partner.</p>
                <details>
                    <summary>Fields and formulas</summary>
                    <p>Source rows aggregate candidate creation counts by grouped source categories.</p>
                    <p>Metric rows count distinct candidates reaching each pipeline status during the selected week.</p>
                    <p><code>Delta vs LW</code>: <code>this_week - last_week</code>.</p>
                </details>
            </div>

            <div id="kpiHelpTemplate-new-candidates-trend" class="kpiHelpTemplate">
                <h4>Overview</h4>
                <p>This chart shows candidate creation trend over time (weekly or monthly), with optional source filtering.</p>
                <p>The pie chart shows current database distribution between Internal and Partner sources.</p>
                <details>
                    <summary>Fields and formulas</summary>
                    <p>Trend buckets are built from <code>candidate.date_created</code> between selected start/end dates.</p>
                    <p>Pie values are computed from current total candidates grouped by source classification.</p>
                </details>
            </div>

            <div id="kpiHelpModal" class="kpiHelpModal" aria-hidden="true">
                <div class="kpiHelpDialog" role="dialog" aria-modal="true" aria-labelledby="kpiHelpTitle">
                    <div class="kpiHelpHead">
                        <h3 id="kpiHelpTitle" class="kpiHelpTitle">KPI Details</h3>
                        <button type="button" id="kpiHelpClose" class="kpiHelpClose">Close</button>
                    </div>
                    <div id="kpiHelpBody" class="kpiHelpBody"></div>
                </div>
            </div>

            <script type="text/javascript">
                (function()
                {
                    var modal = document.getElementById('kpiHelpModal');
                    var body = document.getElementById('kpiHelpBody');
                    var title = document.getElementById('kpiHelpTitle');
                    var closeBtn = document.getElementById('kpiHelpClose');
                    if (!modal || !body || !title || !closeBtn)
                    {
                        return;
                    }
                    var activeTrigger = null;
                    var bodyOverflow = '';

                    function isModalOpen()
                    {
                        return (modal.className.indexOf('kpiHelpOpen') !== -1);
                    }

                    function getFocusableElements()
                    {
                        var selectors = 'a[href], button, textarea, input, select, [tabindex]';
                        var nodeList = modal.querySelectorAll(selectors);
                        var focusable = [];
                        var i;
                        for (i = 0; i < nodeList.length; i++)
                        {
                            var el = nodeList[i];
                            if (el.disabled)
                            {
                                continue;
                            }
                            if (el.getAttribute('tabindex') === '-1')
                            {
                                continue;
                            }
                            if (el.offsetWidth <= 0 && el.offsetHeight <= 0 && el !== document.activeElement)
                            {
                                continue;
                            }
                            focusable.push(el);
                        }

                        return focusable;
                    }

                    function openHelp(key, label)
                    {
                        var template = document.getElementById('kpiHelpTemplate-' + key);
                        if (!template)
                        {
                            return;
                        }
                        title.innerHTML = label || 'KPI Details';
                        body.innerHTML = template.innerHTML;
                        modal.className = 'kpiHelpModal kpiHelpOpen';
                        modal.setAttribute('aria-hidden', 'false');
                        activeTrigger = document.activeElement;
                        bodyOverflow = document.body.style.overflow || '';
                        document.body.style.overflow = 'hidden';
                        window.setTimeout(function()
                        {
                            closeBtn.focus();
                        }, 0);
                    }

                    function closeHelp()
                    {
                        modal.className = 'kpiHelpModal';
                        modal.setAttribute('aria-hidden', 'true');
                        body.innerHTML = '';
                        document.body.style.overflow = bodyOverflow;
                        if (activeTrigger && activeTrigger.focus)
                        {
                            activeTrigger.focus();
                        }
                        activeTrigger = null;
                    }

                    var buttons = document.querySelectorAll('.kpiDetailsButton');
                    var i;
                    for (i = 0; i < buttons.length; i++)
                    {
                        buttons[i].onclick = function()
                        {
                            var key = this.getAttribute('data-kpi-help-key');
                            var label = this.getAttribute('data-kpi-help-title');
                            openHelp(key, label);
                        };
                    }

                    closeBtn.onclick = closeHelp;
                    modal.onclick = function(event)
                    {
                        if (event.target === modal)
                        {
                            closeHelp();
                        }
                    };
                    function handleKeydown(event)
                    {
                        event = event || window.event;
                        if (!isModalOpen())
                        {
                            return;
                        }

                        if (event.key === 'Escape' || event.keyCode === 27)
                        {
                            closeHelp();
                            return;
                        }

                        var isTab = (event.key === 'Tab' || event.keyCode === 9);
                        if (!isTab)
                        {
                            return;
                        }

                        var focusable = getFocusableElements();
                        if (!focusable.length)
                        {
                            return;
                        }

                        var first = focusable[0];
                        var last = focusable[focusable.length - 1];
                        var current = document.activeElement;
                        var shift = !!event.shiftKey;

                        if (shift && current === first)
                        {
                            if (event.preventDefault) event.preventDefault();
                            else event.returnValue = false;
                            last.focus();
                        }
                        else if (!shift && current === last)
                        {
                            if (event.preventDefault) event.preventDefault();
                            else event.returnValue = false;
                            first.focus();
                        }
                    }

                    if (document.addEventListener)
                    {
                        document.addEventListener('keydown', handleKeydown);
                    }
                    else if (document.attachEvent)
                    {
                        document.attachEvent('onkeydown', handleKeydown);
                    }
                })();
            </script>

            </div>
        </div>
    </div>
<?php TemplateUtility::printFooter(); ?>

