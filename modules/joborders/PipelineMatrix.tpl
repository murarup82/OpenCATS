<?php TemplateUtility::printHeader('Job Orders: Pipeline Matrix'); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active); ?>

<div id="main">
    <div id="contents"<?php echo TemplateUtility::getUI2WrapperAttribute(); ?>>
        <div class="ui2-page-header">
            <div class="ui2-datatable-toolbar ui2-datatable-toolbar--no-search">
                <div class="ui2-datatable-title">
                    <div class="ui2-datatable-title-row">
                        <img src="images/job_orders.gif" width="24" height="24" border="0" alt="Job Orders" style="margin-top: 3px;" />
                        <div>
                            <h2>Job Orders: Pipeline Matrix</h2>
                            <div class="ui2-datatable-meta">
                                Spreadsheet-style recruiter matrix for candidate job-order assignments.
                            </div>
                        </div>
                    </div>
                </div>
                <div class="ui2-datatable-actions">
                    <a class="ui2-button ui2-button--primary" href="<?php echo CATSUtility::getIndexName(); ?>?m=joborders&amp;a=pipelineMatrix&amp;ui=modern">
                        Open Modern Matrix
                    </a>
                    <a class="ui2-button ui2-button--secondary" href="<?php echo CATSUtility::getIndexName(); ?>?m=joborders&amp;a=listByView">
                        Back To Job Orders
                    </a>
                </div>
            </div>
        </div>

        <?php if (!empty($this->errMessage)): ?>
            <div class="ui2-card" style="padding: 12px; margin-top: 12px; border: 1px solid #f2c4c4; background: #fff5f5; color: #8a1f1f;">
                <?php echo htmlspecialchars($this->errMessage); ?>
            </div>
        <?php endif; ?>

        <div class="ui2-card" style="padding: 18px; margin-top: 12px;">
            <p style="margin: 0 0 12px 0;">
                The full matrix experience (column customization, saved views, per-column filters, and reset controls)
                is available in the modern UI workspace.
            </p>
            <p style="margin: 0;">
                <a class="ui2-button ui2-button--primary" href="<?php echo CATSUtility::getIndexName(); ?>?m=joborders&amp;a=pipelineMatrix&amp;ui=modern">
                    Launch Pipeline Matrix
                </a>
            </p>
        </div>
    </div>
</div>
