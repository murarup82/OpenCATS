<?php TemplateUtility::printHeader('Customer Dashboard'); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active); ?>
    <div id="main">
        <?php TemplateUtility::printQuickSearch(); ?>

        <div id="contents"<?php echo TemplateUtility::getUI2WrapperAttribute(); ?>>
            <div class="customerDashPage">
                <div class="customerDashHeader">
                    <div class="customerDashTitleWrap">
                        <img src="images/reports.gif" width="24" height="24" border="0" alt="Customer Dashboard" />
                        <h2>Reports: Customer Recruitment Dashboard</h2>
                    </div>
                    <div class="customerDashDateRange">
                        Window: <?php $this->_($this->rangeStartLabel); ?> to <?php $this->_($this->rangeEndLabel); ?>
                    </div>
                </div>

                <style type="text/css">
                    .customerDashPage {
                        max-width: 1480px;
                        margin: 0 auto;
                        padding-bottom: 18px;
                    }
                    .customerDashHeader {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 12px;
                        margin-bottom: 10px;
                    }
                    .customerDashTitleWrap {
                        display: flex;
                        align-items: center;
                        gap: 9px;
                    }
                    .customerDashTitleWrap h2 {
                        margin: 0;
                    }
                    .customerDashDateRange {
                        border: 1px solid #b8d7e3;
                        border-radius: 999px;
                        background: #f6fbfd;
                        padding: 4px 11px;
                        color: #15586e;
                        font-size: 12px;
                        font-weight: bold;
                        white-space: nowrap;
                    }
                    .customerDashFilters {
                        position: sticky;
                        top: 0;
                        z-index: 5;
                        display: flex;
                        align-items: flex-end;
                        flex-wrap: wrap;
                        gap: 10px;
                        border: 1px solid #cfe0e7;
                        border-radius: 12px;
                        padding: 10px 12px;
                        background: #ffffff;
                        box-shadow: 0 6px 18px rgba(15, 70, 89, 0.08);
                        margin-bottom: 12px;
                    }
                    .customerDashFilterField label {
                        display: block;
                        margin-bottom: 3px;
                        font-size: 12px;
                        color: #305463;
                        font-weight: bold;
                    }
                    .customerDashFilterField select {
                        min-width: 260px;
                    }
                    .customerDashInsight {
                        margin-bottom: 12px;
                        border: 1px solid #cfdebc;
                        border-radius: 10px;
                        background: linear-gradient(90deg, #f6fbe8 0%, #fffdf0 100%);
                        padding: 9px 12px;
                        color: #4f6025;
                        font-weight: bold;
                    }
                    .customerDashCards {
                        display: grid;
                        grid-template-columns: repeat(4, minmax(180px, 1fr));
                        gap: 10px;
                        margin-bottom: 12px;
                    }
                    .customerDashCard {
                        border: 1px solid #d8e5ec;
                        border-radius: 12px;
                        background: #ffffff;
                        padding: 11px;
                        box-shadow: 0 1px 3px rgba(13, 45, 72, 0.06);
                    }
                    .customerDashCardLabel {
                        color: #486777;
                        font-size: 12px;
                        margin-bottom: 4px;
                    }
                    .customerDashCardValue {
                        font-size: 26px;
                        color: #0a4f69;
                        font-weight: bold;
                        line-height: 1.05;
                    }
                    .customerDashCardMeta {
                        margin-top: 5px;
                        color: #5f7380;
                        font-size: 11px;
                    }
                    .customerDashGrid2 {
                        display: grid;
                        grid-template-columns: 2fr 1fr;
                        gap: 10px;
                        margin-bottom: 10px;
                    }
                    .customerDashPanel {
                        border: 1px solid #d8e5ec;
                        border-radius: 12px;
                        background: #ffffff;
                        box-shadow: 0 1px 3px rgba(13, 45, 72, 0.06);
                        overflow: hidden;
                    }
                    .customerDashPanelHeader {
                        background: #f3f8fb;
                        border-bottom: 1px solid #d8e5ec;
                        padding: 9px 12px;
                        font-size: 14px;
                        font-weight: bold;
                        color: #124f66;
                    }
                    .customerDashPanelBody {
                        padding: 10px 12px;
                    }
                    .customerDashFunnelRow {
                        display: grid;
                        grid-template-columns: 180px 1fr 52px;
                        gap: 9px;
                        align-items: center;
                        margin-bottom: 7px;
                    }
                    .customerDashFunnelLabel {
                        color: #2e4f5f;
                        font-size: 12px;
                    }
                    .customerDashBarWrap {
                        height: 10px;
                        border-radius: 999px;
                        background: #e6eef3;
                        overflow: hidden;
                    }
                    .customerDashBar {
                        height: 100%;
                        background: linear-gradient(90deg, #0b89af 0%, #2aa8c6 100%);
                    }
                    .customerDashFunnelCount {
                        text-align: right;
                        font-weight: bold;
                        color: #0e5973;
                        font-size: 12px;
                    }
                    .customerDashBadge {
                        display: inline-block;
                        padding: 2px 8px;
                        border-radius: 999px;
                        border: 1px solid #c8dbe5;
                        font-size: 11px;
                        color: #274f5f;
                        background: #f7fbfd;
                        margin-right: 6px;
                        margin-bottom: 6px;
                    }
                    .customerDashTable {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    .customerDashTable th {
                        background: #0f6886;
                        color: #ffffff;
                        border: 1px solid #0f6886;
                        padding: 7px 8px;
                        font-size: 12px;
                        text-align: left;
                    }
                    .customerDashTable td {
                        border: 1px solid #dce6ec;
                        padding: 7px 8px;
                        font-size: 12px;
                        vertical-align: top;
                    }
                    .customerDashTable tbody tr:nth-child(even) td {
                        background: #f9fcfe;
                    }
                    .customerDashHealth {
                        display: inline-block;
                        min-width: 62px;
                        text-align: center;
                        border-radius: 999px;
                        padding: 2px 8px;
                        font-size: 11px;
                        font-weight: bold;
                        border: 1px solid transparent;
                    }
                    .customerDashHealth.healthy {
                        color: #165d37;
                        background: #eaf9ef;
                        border-color: #bde6ca;
                    }
                    .customerDashHealth.watch {
                        color: #8a5a04;
                        background: #fff6df;
                        border-color: #f5d79c;
                    }
                    .customerDashHealth.risk {
                        color: #8a1f1f;
                        background: #fdeaea;
                        border-color: #f1b9b9;
                    }
                    .customerDashValueRows {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 8px;
                    }
                    .customerDashValueItem {
                        border: 1px solid #dce6ec;
                        border-radius: 8px;
                        padding: 8px;
                        background: #fbfdff;
                    }
                    .customerDashValueItemLabel {
                        color: #4d6675;
                        font-size: 11px;
                    }
                    .customerDashValueItemValue {
                        color: #0f5871;
                        font-weight: bold;
                        font-size: 20px;
                        line-height: 1.1;
                        margin-top: 2px;
                    }
                    .customerDashSparkRow {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                    }
                    .customerDashSpark {
                        flex: 1 1 auto;
                        height: 7px;
                        border-radius: 999px;
                        background: #e6eef3;
                        overflow: hidden;
                    }
                    .customerDashSparkBar {
                        height: 100%;
                        background: linear-gradient(90deg, #f38c27 0%, #ffb764 100%);
                    }
                    .customerDashActions {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 7px;
                        margin-top: 8px;
                    }
                    .customerDashActions .ui2-button {
                        font-size: 12px;
                    }
                    .customerDashMuted {
                        color: #67808e;
                    }
                    @media (max-width: 1240px) {
                        .customerDashCards {
                            grid-template-columns: repeat(2, minmax(180px, 1fr));
                        }
                        .customerDashGrid2 {
                            grid-template-columns: 1fr;
                        }
                    }
                    @media (max-width: 760px) {
                        .customerDashHeader {
                            flex-direction: column;
                            align-items: flex-start;
                        }
                        .customerDashFilterField select {
                            min-width: 0;
                            width: 100%;
                        }
                        .customerDashFilters {
                            display: block;
                        }
                        .customerDashCards {
                            grid-template-columns: 1fr;
                        }
                        .customerDashFunnelRow {
                            grid-template-columns: 1fr;
                            gap: 4px;
                        }
                    }
                </style>

                <?php $selectedActivityType = isset($this->activityType) ? (string) $this->activityType : 'all'; ?>
                <form id="customerDashFiltersForm" class="customerDashFilters" method="get" action="<?php echo(CATSUtility::getIndexName()); ?>">
                    <input type="hidden" name="m" value="reports" />
                    <input type="hidden" name="a" value="customerDashboard" />

                    <div class="customerDashFilterField">
                        <label for="customerDashCompanyID">Customer</label>
                        <select id="customerDashCompanyID" name="companyID" class="inputbox">
                            <?php foreach ($this->companiesRS as $companyData): ?>
                                <option value="<?php echo((int) $companyData['companyID']); ?>"<?php if ((int) $this->selectedCompanyID === (int) $companyData['companyID']): ?> selected="selected"<?php endif; ?>>
                                    <?php $this->_($companyData['name']); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="customerDashFilterField">
                        <label for="customerDashRangeDays">Reporting Window</label>
                        <select id="customerDashRangeDays" name="rangeDays" class="inputbox">
                            <?php foreach ($this->rangeOptions as $optionDays => $optionLabel): ?>
                                <option value="<?php echo((int) $optionDays); ?>"<?php if ((int) $this->rangeDays === (int) $optionDays): ?> selected="selected"<?php endif; ?>>
                                    <?php echo(htmlspecialchars($optionLabel)); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="customerDashFilterField">
                        <label for="customerDashActivityType">Activity Type</label>
                        <select id="customerDashActivityType" name="activityType" class="inputbox">
                            <?php foreach ($this->activityTypeOptions as $optionKey => $optionLabel): ?>
                                <option value="<?php echo(htmlspecialchars($optionKey)); ?>"<?php if ($selectedActivityType === (string) $optionKey): ?> selected="selected"<?php endif; ?>>
                                    <?php echo(htmlspecialchars($optionLabel)); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </form>

                <?php if (empty($this->companiesRS)): ?>
                    <p class="warning">No customers found. Add a company first to use this dashboard.</p>
                <?php else: ?>
                    <?php
                        $snapshot = isset($this->dashboardData['snapshot']) ? $this->dashboardData['snapshot'] : array();
                        $snapshot = array_merge(
                            array(
                                'openJobOrders' => 0,
                                'totalJobOrders' => 0,
                                'hiresInRange' => 0,
                                'medianDaysToFill' => null,
                                'activePipelineCount' => 0,
                                'offerAcceptanceLabel' => 'N/A',
                                'offersAccepted' => 0,
                                'offersMade' => 0,
                                'slaHitLabel' => 'N/A',
                                'slaWindowDays' => 5,
                                'riskNoActivityDays' => 10,
                                'riskLongOpenDays' => 30
                            ),
                            $snapshot
                        );

                        $aging = isset($this->dashboardData['aging']) ? $this->dashboardData['aging'] : array();
                        $aging = array_merge(
                            array(
                                'bucket0to15' => 0,
                                'bucket16to30' => 0,
                                'bucket31plus' => 0
                            ),
                            $aging
                        );
                        $funnelStages = isset($this->dashboardData['funnelStages']) ? $this->dashboardData['funnelStages'] : array();
                        $funnelConversions = isset($this->dashboardData['funnelConversions']) ? $this->dashboardData['funnelConversions'] : array();
                        $activityTrendRows = isset($this->dashboardData['activityTrendRows']) ? $this->dashboardData['activityTrendRows'] : array();
                        $sourceQualityRows = isset($this->dashboardData['sourceQualityRows']) ? $this->dashboardData['sourceQualityRows'] : array();
                        $atRiskJobs = isset($this->dashboardData['atRiskJobs']) ? $this->dashboardData['atRiskJobs'] : array();
                        $rejectionReasonRows = isset($this->dashboardData['rejectionReasonRows']) ? $this->dashboardData['rejectionReasonRows'] : array();
                        $upcomingOutcomes = isset($this->dashboardData['upcomingOutcomes']) ? $this->dashboardData['upcomingOutcomes'] : array();
                        $upcomingOutcomes = array_merge(
                            array(
                                'upcomingInterviewCount' => 0,
                                'recentActivityCount' => 0,
                                'pendingInterviewCount' => 0,
                                'pendingOfferCount' => 0,
                                'overdueOfferCount' => 0,
                                'upcomingInterviewsRS' => array(),
                                'recentPipelineActivityRS' => array()
                            ),
                            $upcomingOutcomes
                        );
                        $recentPipelineActivityRS = isset($upcomingOutcomes['recentPipelineActivityRS']) ? $upcomingOutcomes['recentPipelineActivityRS'] : array();
                    ?>

                    <div class="customerDashInsight">
                        <?php if (!empty($this->dashboardData['insightLine'])): ?>
                            <?php $this->_($this->dashboardData['insightLine']); ?>
                        <?php else: ?>
                            No insight available yet for this customer.
                        <?php endif; ?>
                        <span class="customerDashMuted">
                            (SLA <?php echo((int) $snapshot['slaWindowDays']); ?>d, risk if no movement ><?php echo((int) $snapshot['riskNoActivityDays']); ?>d or open ><?php echo((int) $snapshot['riskLongOpenDays']); ?>d)
                        </span>
                    </div>

                    <div class="customerDashCards">
                        <div class="customerDashCard">
                            <div class="customerDashCardLabel">Open Job Orders</div>
                            <div class="customerDashCardValue"><?php echo((int) $snapshot['openJobOrders']); ?></div>
                            <div class="customerDashCardMeta">Total job orders: <?php echo((int) $snapshot['totalJobOrders']); ?></div>
                        </div>
                        <div class="customerDashCard">
                            <div class="customerDashCardLabel">Hires (Window)</div>
                            <div class="customerDashCardValue"><?php echo((int) $snapshot['hiresInRange']); ?></div>
                            <div class="customerDashCardMeta">Median time-to-fill: <?php if ($snapshot['medianDaysToFill'] === null): ?>N/A<?php else: ?><?php echo((int) $snapshot['medianDaysToFill']); ?> days<?php endif; ?></div>
                        </div>
                        <div class="customerDashCard">
                            <div class="customerDashCardLabel">Active Pipeline Candidates</div>
                            <div class="customerDashCardValue"><?php echo((int) $snapshot['activePipelineCount']); ?></div>
                            <div class="customerDashCardMeta">Current active entries for open job orders</div>
                        </div>
                        <div class="customerDashCard">
                            <div class="customerDashCardLabel">Offer Acceptance Rate</div>
                            <div class="customerDashCardValue"><?php $this->_($snapshot['offerAcceptanceLabel']); ?></div>
                            <div class="customerDashCardMeta"><?php echo((int) $snapshot['offersAccepted']); ?> accepted from <?php echo((int) $snapshot['offersMade']); ?> offers</div>
                        </div>
                        <div class="customerDashCard">
                            <div class="customerDashCardLabel">SLA Hit Rate (<?php echo((int) $snapshot['slaWindowDays']); ?>-day activity)</div>
                            <div class="customerDashCardValue"><?php $this->_($snapshot['slaHitLabel']); ?></div>
                            <div class="customerDashCardMeta">Open jobs with recent candidate movement</div>
                        </div>
                        <div class="customerDashCard">
                            <div class="customerDashCardLabel">Aging 0-15 days</div>
                            <div class="customerDashCardValue"><?php echo((int) $aging['bucket0to15']); ?></div>
                            <div class="customerDashCardMeta">Fresh openings</div>
                        </div>
                        <div class="customerDashCard">
                            <div class="customerDashCardLabel">Aging 16-30 days</div>
                            <div class="customerDashCardValue"><?php echo((int) $aging['bucket16to30']); ?></div>
                            <div class="customerDashCardMeta">Needs active funneling</div>
                        </div>
                        <div class="customerDashCard">
                            <div class="customerDashCardLabel">Aging 31+ days</div>
                            <div class="customerDashCardValue"><?php echo((int) $aging['bucket31plus']); ?></div>
                            <div class="customerDashCardMeta">Potential delivery risk</div>
                        </div>
                    </div>

                    <div class="customerDashGrid2">
                        <div class="customerDashPanel">
                            <div class="customerDashPanelHeader">Pipeline Funnel and Conversion</div>
                            <div class="customerDashPanelBody">
                                <?php if (empty($funnelStages)): ?>
                                    <p class="customerDashMuted">No active pipeline data for this customer.</p>
                                <?php else: ?>
                                    <?php foreach ($funnelStages as $stage): ?>
                                        <div class="customerDashFunnelRow">
                                            <div class="customerDashFunnelLabel"><?php $this->_($stage['label']); ?></div>
                                            <div class="customerDashBarWrap">
                                                <div class="customerDashBar" style="width: <?php echo((int) $stage['barWidth']); ?>%;"></div>
                                            </div>
                                            <div class="customerDashFunnelCount"><?php echo((int) $stage['count']); ?></div>
                                        </div>
                                    <?php endforeach; ?>
                                <?php endif; ?>

                                <div style="margin-top: 8px;">
                                    <?php if (empty($funnelConversions)): ?>
                                        <span class="customerDashMuted">Not enough stage data for conversion rates.</span>
                                    <?php else: ?>
                                        <?php foreach ($funnelConversions as $conversion): ?>
                                            <span class="customerDashBadge">
                                                <?php $this->_($conversion['from']); ?> -> <?php $this->_($conversion['to']); ?>: <?php $this->_($conversion['rateLabel']); ?>
                                            </span>
                                        <?php endforeach; ?>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>

                        <div class="customerDashPanel">
                            <div class="customerDashPanelHeader">Next 7 Days Outlook</div>
                            <div class="customerDashPanelBody">
                                <div class="customerDashValueRows">
                                    <div class="customerDashValueItem">
                                        <div class="customerDashValueItemLabel">Recent <?php echo(htmlspecialchars($this->activityTypeLabel)); ?> (7d)</div>
                                        <div class="customerDashValueItemValue"><?php echo((int) $upcomingOutcomes['recentActivityCount']); ?></div>
                                    </div>
                                    <div class="customerDashValueItem">
                                        <div class="customerDashValueItemLabel">Pending interviews</div>
                                        <div class="customerDashValueItemValue"><?php echo((int) $upcomingOutcomes['pendingInterviewCount']); ?></div>
                                    </div>
                                    <div class="customerDashValueItem">
                                        <div class="customerDashValueItemLabel">Pending offers</div>
                                        <div class="customerDashValueItemValue"><?php echo((int) $upcomingOutcomes['pendingOfferCount']); ?></div>
                                    </div>
                                    <div class="customerDashValueItem">
                                        <div class="customerDashValueItemLabel">Overdue offers</div>
                                        <div class="customerDashValueItemValue"><?php echo((int) $upcomingOutcomes['overdueOfferCount']); ?></div>
                                    </div>
                                </div>

                                <div class="customerDashActions">
                                    <a class="ui2-button" href="<?php echo(CATSUtility::getIndexName()); ?>?m=companies&amp;a=show&amp;companyID=<?php echo((int) $this->selectedCompanyID); ?>">Company Details</a>
                                    <a class="ui2-button" href="<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=add&amp;selected_company_id=<?php echo((int) $this->selectedCompanyID); ?>">Add Job Order</a>
                                    <a class="ui2-button" href="<?php echo(CATSUtility::getIndexName()); ?>?m=joborders">All Job Orders</a>
                                    <a class="ui2-button" href="<?php echo(CATSUtility::getIndexName()); ?>?m=kpis">KPIs</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="customerDashGrid2">
                        <div class="customerDashPanel">
                            <div class="customerDashPanelHeader">Recruiter Activity Trend (Last 8 Weeks)</div>
                            <div class="customerDashPanelBody">
                                <?php if (empty($activityTrendRows)): ?>
                                    <p class="customerDashMuted">No pipeline activity logged in the last 8 weeks.</p>
                                <?php else: ?>
                                    <table class="customerDashTable">
                                        <thead>
                                            <tr>
                                                <th>Week</th>
                                                <th>Submissions</th>
                                                <th>Interviews</th>
                                                <th>Offers</th>
                                                <th>Hires</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <?php foreach ($activityTrendRows as $row): ?>
                                                <tr>
                                                    <td><?php $this->_($row['weekLabel']); ?></td>
                                                    <td>
                                                        <div class="customerDashSparkRow">
                                                            <div class="customerDashSpark"><div class="customerDashSparkBar" style="width: <?php echo((int) $row['submissionsWidth']); ?>%;"></div></div>
                                                            <span><?php echo((int) $row['submissionsCount']); ?></span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div class="customerDashSparkRow">
                                                            <div class="customerDashSpark"><div class="customerDashSparkBar" style="width: <?php echo((int) $row['interviewsWidth']); ?>%;"></div></div>
                                                            <span><?php echo((int) $row['interviewsCount']); ?></span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div class="customerDashSparkRow">
                                                            <div class="customerDashSpark"><div class="customerDashSparkBar" style="width: <?php echo((int) $row['offersWidth']); ?>%;"></div></div>
                                                            <span><?php echo((int) $row['offersCount']); ?></span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div class="customerDashSparkRow">
                                                            <div class="customerDashSpark"><div class="customerDashSparkBar" style="width: <?php echo((int) $row['hiresWidth']); ?>%;"></div></div>
                                                            <span><?php echo((int) $row['hiresCount']); ?></span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            <?php endforeach; ?>
                                        </tbody>
                                    </table>
                                <?php endif; ?>
                            </div>
                        </div>

                        <div class="customerDashPanel">
                            <div class="customerDashPanelHeader">Source Quality (Interview Path -> Hire)</div>
                            <div class="customerDashPanelBody">
                                <?php if (empty($sourceQualityRows)): ?>
                                    <p class="customerDashMuted">No source quality data for the selected window.</p>
                                <?php else: ?>
                                    <table class="customerDashTable">
                                        <thead>
                                            <tr>
                                                <th>Source</th>
                                                <th>Interview Path</th>
                                                <th>Hires</th>
                                                <th>Hire Rate</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <?php foreach ($sourceQualityRows as $row): ?>
                                                <tr>
                                                    <td><?php $this->_($row['source']); ?></td>
                                                    <td><?php echo((int) $row['interviewPathCount']); ?></td>
                                                    <td><?php echo((int) $row['hireCount']); ?></td>
                                                    <td><?php $this->_($row['hireRateLabel']); ?></td>
                                                </tr>
                                            <?php endforeach; ?>
                                        </tbody>
                                    </table>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>

                    <div class="customerDashPanel" style="margin-bottom: 10px;">
                        <div class="customerDashPanelHeader">At-Risk Job Orders</div>
                        <div class="customerDashPanelBody">
                            <?php if (empty($atRiskJobs)): ?>
                                <p class="customerDashMuted">No at-risk job orders right now.</p>
                            <?php else: ?>
                                <table class="customerDashTable">
                                    <thead>
                                        <tr>
                                            <th>Job Order</th>
                                            <th>Status</th>
                                            <th>Health</th>
                                            <th>Days Open</th>
                                            <th>Open Positions (Avail/Total)</th>
                                            <th>Active Candidates</th>
                                            <th>Last Activity</th>
                                            <th>Risk Drivers</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php foreach ($atRiskJobs as $row): ?>
                                            <tr>
                                                <td>
                                                    <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=show&amp;jobOrderID=<?php echo((int) $row['jobOrderID']); ?>">
                                                        <?php $this->_($row['title']); ?>
                                                    </a>
                                                </td>
                                                <td><?php $this->_($row['status']); ?></td>
                                                <td><span class="customerDashHealth <?php $this->_($row['healthClass']); ?>"><?php $this->_($row['healthLabel']); ?></span></td>
                                                <td><?php echo((int) $row['daysOpen']); ?></td>
                                                <td><?php echo((int) $row['openingsAvailable']); ?> / <?php echo((int) $row['openingsTotal']); ?></td>
                                                <td><?php echo((int) $row['activeCandidates']); ?></td>
                                                <td><?php $this->_($row['lastPipelineDateLabel']); ?></td>
                                                <td><?php $this->_($row['riskReasonsLabel']); ?></td>
                                            </tr>
                                        <?php endforeach; ?>
                                    </tbody>
                                </table>
                            <?php endif; ?>
                        </div>
                    </div>

                    <div class="customerDashGrid2">
                        <div class="customerDashPanel">
                            <div class="customerDashPanelHeader">Top Rejection Reasons</div>
                            <div class="customerDashPanelBody">
                                <?php if (empty($rejectionReasonRows)): ?>
                                    <p class="customerDashMuted">No rejection reasons logged in the selected window.</p>
                                <?php else: ?>
                                    <table class="customerDashTable">
                                        <thead>
                                            <tr>
                                                <th>Reason</th>
                                                <th>Count</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <?php foreach ($rejectionReasonRows as $row): ?>
                                                <tr>
                                                    <td><?php $this->_($row['label']); ?></td>
                                                    <td><?php echo((int) $row['rejectionCount']); ?></td>
                                                </tr>
                                            <?php endforeach; ?>
                                        </tbody>
                                    </table>
                                <?php endif; ?>
                            </div>
                        </div>

                        <div class="customerDashPanel">
                            <div class="customerDashPanelHeader">Recent Pipeline Activity: <?php echo(htmlspecialchars($this->activityTypeLabel)); ?> (Last 14 Days)</div>
                            <div class="customerDashPanelBody">
                                <?php if (empty($recentPipelineActivityRS)): ?>
                                    <p class="customerDashMuted">No matching pipeline activity in the last 14 days.</p>
                                <?php else: ?>
                                    <table class="customerDashTable">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Candidate</th>
                                                <th>Stage Move</th>
                                                <th>Job Order</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <?php foreach ($recentPipelineActivityRS as $row): ?>
                                                <tr>
                                                    <td><?php $this->_($row['activityDate']); ?></td>
                                                    <td>
                                                        <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=candidates&amp;a=show&amp;candidateID=<?php echo((int) $row['candidateID']); ?>">
                                                            <?php $this->_($row['candidateName']); ?>
                                                        </a>
                                                    </td>
                                                    <td><?php $this->_($row['stageMoveLabel']); ?></td>
                                                    <td>
                                                        <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=show&amp;jobOrderID=<?php echo((int) $row['jobOrderID']); ?>">
                                                            <?php $this->_($row['jobOrderTitle']); ?>
                                                        </a>
                                                    </td>
                                                </tr>
                                            <?php endforeach; ?>
                                        </tbody>
                                    </table>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
    <script type="text/javascript">
        (function() {
            var form = document.getElementById('customerDashFiltersForm');
            var companySelect = document.getElementById('customerDashCompanyID');
            var rangeSelect = document.getElementById('customerDashRangeDays');
            var activityTypeSelect = document.getElementById('customerDashActivityType');

            if (!form)
            {
                return;
            }

            var onFilterChange = function() {
                form.submit();
            };

            if (companySelect)
            {
                companySelect.addEventListener('change', onFilterChange);
            }

            if (rangeSelect)
            {
                rangeSelect.addEventListener('change', onFilterChange);
            }

            if (activityTypeSelect)
            {
                activityTypeSelect.addEventListener('change', onFilterChange);
            }
        })();
    </script>
<?php TemplateUtility::printFooter(); ?>
