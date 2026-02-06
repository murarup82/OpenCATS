<?php /* $Id: List.tpl 3096 2007-09-25 19:27:04Z brian $ */ ?>
<?php TemplateUtility::printHeader('Lists', array( 'js/highlightrows.js', 'js/sweetTitles.js', 'js/export.js', 'js/dataGrid.js', 'js/dataGridFilters.js', 'js/lists.js')); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active); ?>
    <div id="main">
        <?php TemplateUtility::printQuickSearch(); ?>

        <div id="contents"<?php echo TemplateUtility::getUI2WrapperAttribute(); ?>>
            <div class="ui2-datatable-toolbar">
                <div class="ui2-datatable-title">
                    <div class="ui2-datatable-title-row">
                        <img src="images/job_orders.gif" width="24" height="24" border="0" alt="Job Orders" style="margin-top: 3px;" />
                        <div>
                            <h2>Lists: <?php $this->_($this->listRS['description']); ?></h2>
                            <div class="ui2-datatable-meta">
                                <?php $this->_($this->listRS['description']); ?> -
                                Page <?php echo($this->dataGrid->getCurrentPageHTML()); ?>
                                (<?php echo($this->dataGrid->getNumberOfRows()); ?> Items)
                            </div>
                        </div>
                    </div>
                </div>
                <div class="ui2-datatable-search"></div>
                <div class="ui2-datatable-actions">
                    <a href="javascript:void(0);" class="ui2-button ui2-button--danger" onclick="deleteListFromListView(<?php $this->_($this->listRS['savedListID']); ?>, <?php $this->_($this->listRS['numberEntries']); ?>);">Delete List</a>
                    <?php $this->dataGrid->drawShowFilterControl(); ?>
                    <?php $this->dataGrid->drawRowsPerPageSelector(); ?>
                </div>
            </div>

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

<?php TemplateUtility::printFooter(); ?>

