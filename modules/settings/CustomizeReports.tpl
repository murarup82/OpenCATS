<?php /* Reports Settings */ ?>
<?php TemplateUtility::printHeader('Settings'); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active, $this->subActive); ?>
    <div id="main">
        <?php TemplateUtility::printQuickSearch(); ?>

        <div id="contents"<?php echo TemplateUtility::getUI2WrapperAttribute(); ?>>
            <table width="100%">
                <tr>
                    <td width="3%">
                        <img src="images/settings.gif" width="24" height="24" border="0" alt="Settings" style="margin-top: 3px;" />&nbsp;
                    </td>
                    <td align="left"><h2>Settings: Reports</h2></td>
                </tr>
            </table>

            <p class="note">Customer Dashboard Thresholds</p>

            <?php if ($this->reportsSaved): ?>
                <p class="noteGood">Report settings saved successfully.</p>
            <?php endif; ?>

            <table class="searchTable" width="100%">
                <tr>
                    <td>
                        <form action="<?php echo(CATSUtility::getIndexName()); ?>?m=settings&amp;a=reports" method="post" autocomplete="off">
                            <input type="hidden" name="postback" value="postback" />

                            <label for="customerDashboardSLAActivityDays">SLA activity window (days):</label><br />
                            <input
                                type="text"
                                name="customerDashboardSLAActivityDays"
                                id="customerDashboardSLAActivityDays"
                                value="<?php echo((int) $this->reportsSettings['customerDashboardSLAActivityDays']); ?>"
                                style="width: 60px;"
                            />
                            <span class="noteUnsized">Open jobs with candidate movement inside this window are counted as SLA hits. Allowed range: 1-30.</span>

                            <br /><br />

                            <label for="customerDashboardRiskNoActivityDays">No-activity risk threshold (days):</label><br />
                            <input
                                type="text"
                                name="customerDashboardRiskNoActivityDays"
                                id="customerDashboardRiskNoActivityDays"
                                value="<?php echo((int) $this->reportsSettings['customerDashboardRiskNoActivityDays']); ?>"
                                style="width: 60px;"
                            />
                            <span class="noteUnsized">A job is flagged when no candidate movement exceeds this value. Allowed range: 2-60.</span>

                            <br /><br />

                            <label for="customerDashboardRiskLongOpenDays">Long-open risk threshold (days):</label><br />
                            <input
                                type="text"
                                name="customerDashboardRiskLongOpenDays"
                                id="customerDashboardRiskLongOpenDays"
                                value="<?php echo((int) $this->reportsSettings['customerDashboardRiskLongOpenDays']); ?>"
                                style="width: 60px;"
                            />
                            <span class="noteUnsized">Open jobs older than this limit add risk score. Allowed range: 5-180.</span>

                            <br /><br />

                            <label for="customerDashboardRiskLowCoverageDays">Low-coverage threshold (days):</label><br />
                            <input
                                type="text"
                                name="customerDashboardRiskLowCoverageDays"
                                id="customerDashboardRiskLowCoverageDays"
                                value="<?php echo((int) $this->reportsSettings['customerDashboardRiskLowCoverageDays']); ?>"
                                style="width: 60px;"
                            />
                            <span class="noteUnsized">After this many open days, jobs with fewer active candidates than openings gain risk score. Allowed range: 2-90.</span>

                            <br /><br />

                            <input type="submit" class="button" value="Save Settings" />
                            <input type="button" class="button" value="Back" onclick="document.location.href='<?php echo(CATSUtility::getIndexName()); ?>?m=settings&amp;a=administration';" />
                        </form>
                    </td>
                </tr>
            </table>
        </div>
    </div>
<?php TemplateUtility::printFooter(); ?>

