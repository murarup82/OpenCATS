<?php TemplateUtility::printHeader('GDPR Consents', array('js/highlightrows.js', 'js/export.js', 'js/dataGrid.js', 'js/dataGridFilters.js', 'modules/gdpr/requests.js')); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active); ?>
<?php $md5InstanceName = md5($this->dataGrid->getInstanceName());?>
<div id="main">
    <div id="contents"<?php echo TemplateUtility::getUI2WrapperAttribute(); ?>>
        <form id="gdprRequestsFilterForm" class="ui2-page-header" action="<?php echo(CATSUtility::getIndexName()); ?>" method="get">
            <input type="hidden" name="m" value="gdpr" />
            <input type="hidden" name="a" value="requests" />
            <input type="hidden" id="gdprExportFormat" name="exportFormat" value="" />
            <div class="ui2-datatable-toolbar ui2-datatable-toolbar--no-search">
                <div class="ui2-datatable-title">
                    <div class="ui2-datatable-title-row">
                        <img src="images/settings.gif" width="24" height="24" alt="GDPR" style="border: none; margin-top: 3px;" />
                        <div>
                            <h2>GDPR Consents</h2>
                            <div class="ui2-datatable-meta">
                                Requests - Page <?php echo($this->dataGrid->getCurrentPageHTML()); ?> (<?php echo($this->dataGrid->getNumberOfRows()); ?> Items)
                            </div>
                        </div>
                    </div>
                </div>
                <div class="ui2-datatable-actions">
                    <div class="ui2-header-utilities">
                        <div class="ui2-header-search">
                            <input type="text" name="search" class="ui2-input" placeholder="Search candidates..." value="<?php echo htmlspecialchars($this->searchFilter); ?>" />
                            <button type="submit" class="ui2-button ui2-button--secondary">Search</button>
                        </div>
                    </div>
                    <div class="ui2-inline">
                        <button type="button" class="ui2-button" onclick="gdprExport('csv');">Export CSV</button>
                        <button type="button" class="ui2-button ui2-button--secondary" onclick="gdprExport('pdf');">Export PDF</button>
                    </div>
                    <?php $this->dataGrid->drawShowFilterControl(); ?>
                    <?php $this->dataGrid->drawRowsPerPageSelector(); ?>
                </div>
            </div>

            <div class="ui2-datatable-filters">
                <label class="ui2-inline">Status
                    <select name="status" class="ui2-select">
                        <?php foreach ($this->statusOptions as $key => $label): ?>
                            <option value="<?php echo htmlspecialchars($key); ?>"<?php if ($this->statusFilter === $key): ?> selected="selected"<?php endif; ?>><?php echo htmlspecialchars($label); ?></option>
                        <?php endforeach; ?>
                    </select>
                </label>
                <label class="ui2-inline">Expiring in
                    <input type="text" name="expiring" class="ui2-input" style="width: 60px;" value="<?php echo htmlspecialchars($this->expiringFilter); ?>" /> days
                </label>
                <label class="ui2-inline">
                    <input type="checkbox" name="needsDeletion" value="1"<?php if ($this->needsDeletionFilter !== ''): ?> checked="checked"<?php endif; ?> />
                    Needs deletion
                </label>
                <label class="ui2-inline">Candidate ID
                    <input type="text" name="candidateID" class="ui2-input" style="width: 80px;" value="<?php echo htmlspecialchars($this->candidateIDFilter); ?>" />
                </label>
                <label class="ui2-inline">Created from
                    <input type="text" name="dateFrom" class="ui2-input" style="width: 110px;" placeholder="YYYY-MM-DD" value="<?php echo htmlspecialchars($this->dateFromFilter); ?>" />
                </label>
                <label class="ui2-inline">to
                    <input type="text" name="dateTo" class="ui2-input" style="width: 110px;" placeholder="YYYY-MM-DD" value="<?php echo htmlspecialchars($this->dateToFilter); ?>" />
                </label>
                <button type="submit" class="ui2-button ui2-button--secondary">Apply</button>
            </div>
        </form>

        <div id="gdprRequestsStatus" class="ui2-ai-status" style="display:none;"></div>

        <div class="ui2-datatable-filterarea">
            <?php $this->dataGrid->drawFilterArea(); ?>
        </div>
        <div class="ui2-card ui2-datatable-card ui2-datatable-card--avel">
            <?php $this->dataGrid->draw();  ?>
        </div>

        <div class="ui2-datatable-footer">
            <div class="ui2-datatable-footer-left">
                <?php $this->dataGrid->printActionArea(); ?>
            </div>
            <div class="ui2-datatable-footer-right">
                <?php $this->dataGrid->printNavigation(true); ?>
            </div>
        </div>
    </div>
</div>
<script type="text/javascript">
    if (typeof GDPRRequests !== 'undefined')
    {
        GDPRRequests.configure({ sessionCookie: '<?php echo($this->sessionCookie); ?>' });
    }

    function gdprExport(format)
    {
        var form = document.getElementById('gdprRequestsFilterForm');
        if (!form) return;
        var actionField = form.querySelector('input[name="a"]');
        var formatField = document.getElementById('gdprExportFormat');
        if (!actionField || !formatField) return;
        var prevAction = actionField.value;
        var prevTarget = form.target;
        actionField.value = 'export';
        formatField.value = format;
        form.target = '_blank';
        form.submit();
        actionField.value = prevAction;
        formatField.value = '';
        form.target = prevTarget;
    }
</script>
<?php TemplateUtility::printFooter(); ?>
