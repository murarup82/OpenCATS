<?php TemplateUtility::printHeader('Customer Dashboard Details'); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active); ?>
<div id="main">
    <?php TemplateUtility::printQuickSearch(); ?>

    <div id="contents"<?php echo TemplateUtility::getUI2WrapperAttribute(); ?>>
        <?php
            $backURL = CATSUtility::getIndexName()
                . '?m=reports&amp;a=customerDashboard'
                . '&amp;companyID=' . (int) $this->selectedCompanyID
                . '&amp;rangeDays=' . (int) $this->rangeDays
                . '&amp;activityType=' . urlencode($this->activityType);
        ?>

        <style type="text/css">
            .customerDashDetailsPage {
                max-width: 1480px;
                margin: 0 auto;
                padding-bottom: 18px;
            }
            .customerDashDetailsMeta {
                margin-bottom: 10px;
                color: #4a6674;
                font-size: 12px;
            }
            .customerDashDetailsBack {
                display: inline-block;
                margin-bottom: 8px;
                font-weight: bold;
            }
            .customerDashDetailsPanel {
                border: 1px solid #d8e5ec;
                border-radius: 12px;
                background: #ffffff;
                box-shadow: 0 1px 3px rgba(13, 45, 72, 0.06);
                overflow: hidden;
            }
            .customerDashDetailsHeader {
                background: #f3f8fb;
                border-bottom: 1px solid #d8e5ec;
                padding: 10px 12px;
                font-size: 16px;
                font-weight: bold;
                color: #124f66;
            }
            .customerDashDetailsBody {
                padding: 10px 12px;
            }
            .customerDashStatusPill {
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
            .customerDashStatusPill.status-allocated { background: #e6f0ff; color: #1d4ed8; border-color: #c7ddff; }
            .customerDashStatusPill.status-delivery-validated { background: #e6f7f4; color: #0f766e; border-color: #c5ece6; }
            .customerDashStatusPill.status-proposed-to-customer { background: #f3e8ff; color: #6b21a8; border-color: #e3d0ff; }
            .customerDashStatusPill.status-customer-interview { background: #fff7ed; color: #b45309; border-color: #fde0b6; }
            .customerDashStatusPill.status-customer-approved { background: #eef2ff; color: #4f46e5; border-color: #d6dcff; }
            .customerDashStatusPill.status-avel-approved { background: #e0f2fe; color: #0369a1; border-color: #bae6fd; }
            .customerDashStatusPill.status-offer-negotiation,
            .customerDashStatusPill.status-offer-negociation { background: #fff1f2; color: #c2410c; border-color: #fed7aa; }
            .customerDashStatusPill.status-offer-accepted { background: #ecfdf3; color: #15803d; border-color: #bbf7d0; }
            .customerDashStatusPill.status-hired { background: #dcfce7; color: #166534; border-color: #86efac; }
            .customerDashStatusPill.status-rejected { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }
            .customerDashStatusPill.status-unknown { background: #f2f4f6; color: #4c5a61; border-color: #d1d9de; }
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
            .customerDashHealth.healthy { color: #165d37; background: #eaf9ef; border-color: #bde6ca; }
            .customerDashHealth.watch { color: #8a5a04; background: #fff6df; border-color: #f5d79c; }
            .customerDashHealth.risk { color: #8a1f1f; background: #fdeaea; border-color: #f1b9b9; }
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
        </style>

        <div class="customerDashDetailsPage">
            <a class="customerDashDetailsBack" href="<?php echo($backURL); ?>">&laquo; Back to Customer Dashboard</a>
            <div class="customerDashDetailsMeta">
                Customer: <?php $this->_($this->selectedCompanyName); ?> |
                Window: <?php $this->_($this->rangeStartLabel); ?> to <?php $this->_($this->rangeEndLabel); ?> |
                Activity Type: <?php $this->_($this->activityTypeLabel); ?>
            </div>
            <div class="customerDashDetailsPanel">
                <div class="customerDashDetailsHeader"><?php $this->_($this->cardDetail['title']); ?> (<?php echo((int) count($this->cardDetail['rows'])); ?>)</div>
                <div class="customerDashDetailsBody">
                    <?php if (empty($this->cardDetail['rows'])): ?>
                        <p class="warning"><?php $this->_($this->cardDetail['emptyLabel']); ?></p>
                    <?php else: ?>
                        <?php if (in_array($this->cardDetail['key'], array('openJobOrders', 'aging0to15', 'aging16to30', 'aging31plus'))): ?>
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
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($this->cardDetail['rows'] as $row): ?>
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
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        <?php elseif (in_array($this->cardDetail['key'], array('currentHires', 'confirmedFutureHires'))): ?>
                            <table class="customerDashTable">
                                <thead>
                                    <tr>
                                        <th>Candidate</th>
                                        <th>Job Order</th>
                                        <th>Hire Date</th>
                                        <th>Days to Fill</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($this->cardDetail['rows'] as $row): ?>
                                        <tr>
                                            <td>
                                                <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=candidates&amp;a=show&amp;candidateID=<?php echo((int) $row['candidateID']); ?>">
                                                    <?php $this->_($row['candidateName']); ?>
                                                </a>
                                            </td>
                                            <td>
                                                <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=show&amp;jobOrderID=<?php echo((int) $row['jobOrderID']); ?>">
                                                    <?php $this->_($row['jobOrderTitle']); ?>
                                                </a>
                                            </td>
                                            <td><?php $this->_($row['hireDateLabel']); ?></td>
                                            <td><?php echo((int) $row['daysToFill']); ?></td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        <?php elseif ($this->cardDetail['key'] === 'activePipeline'): ?>
                            <table class="customerDashTable">
                                <thead>
                                    <tr>
                                        <th>Candidate</th>
                                        <th>Job Order</th>
                                        <th>Current Status</th>
                                        <th>Last Updated</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($this->cardDetail['rows'] as $row): ?>
                                        <tr>
                                            <td>
                                                <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=candidates&amp;a=show&amp;candidateID=<?php echo((int) $row['candidateID']); ?>">
                                                    <?php $this->_($row['candidateName']); ?>
                                                </a>
                                            </td>
                                            <td>
                                                <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=show&amp;jobOrderID=<?php echo((int) $row['jobOrderID']); ?>">
                                                    <?php $this->_($row['jobOrderTitle']); ?>
                                                </a>
                                            </td>
                                            <td><span class="customerDashStatusPill status-<?php echo(htmlspecialchars($row['statusSlug'])); ?>"><?php $this->_($row['statusLabel']); ?></span></td>
                                            <td><?php $this->_($row['lastUpdatedLabel']); ?></td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        <?php elseif ($this->cardDetail['key'] === 'offerAcceptance'): ?>
                            <table class="customerDashTable">
                                <thead>
                                    <tr>
                                        <th>Candidate</th>
                                        <th>Job Order</th>
                                        <th>Offer Date</th>
                                        <th>Outcome</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($this->cardDetail['rows'] as $row): ?>
                                        <tr>
                                            <td>
                                                <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=candidates&amp;a=show&amp;candidateID=<?php echo((int) $row['candidateID']); ?>">
                                                    <?php $this->_($row['candidateName']); ?>
                                                </a>
                                            </td>
                                            <td>
                                                <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=show&amp;jobOrderID=<?php echo((int) $row['jobOrderID']); ?>">
                                                    <?php $this->_($row['jobOrderTitle']); ?>
                                                </a>
                                            </td>
                                            <td><?php $this->_($row['offerDateLabel']); ?></td>
                                            <td><span class="customerDashStatusPill status-<?php echo(htmlspecialchars($row['outcomeSlug'])); ?>"><?php $this->_($row['outcomeLabel']); ?></span></td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        <?php endif; ?>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>

<?php TemplateUtility::printFooter(); ?>
