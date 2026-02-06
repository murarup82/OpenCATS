<?php /* $Id: ActivityDataGrid.tpl 3355 2007-10-31 16:11:56Z andrew $ */ ?>
<?php TemplateUtility::printHeader('Activities', array('js/highlightrows.js', 'js/sweetTitles.js', 'js/dataGrid.js', 'js/dataGridFilters.js')); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active); ?>
    <div id="main">
        <?php TemplateUtility::printQuickSearch(); ?>
        <div id="contents"<?php echo TemplateUtility::getUI2WrapperAttribute(); ?><?php echo !$this->numActivities ? ' style="background-color: #E6EEFF; padding: 0px;"' : ''; ?>>
            <?php if ($this->numActivities): ?>
            <div class="ui2-datatable-toolbar">
                <div class="ui2-datatable-title">
                    <div class="ui2-datatable-title-row">
                        <img src="images/activities.gif" width="24" height="24" alt="Activities" style="border: none; margin-top: 3px;" />
                        <div>
                            <h2>Activities</h2>
                            <div class="ui2-datatable-meta">
                                Activities - Page <?php echo($this->dataGrid->getCurrentPageHTML()); ?>
                                (<?php echo($this->dataGrid->getNumberOfRows()); ?> Items)
                            </div>
                        </div>
                    </div>
                </div>
                <div class="ui2-datatable-search">
                    <?php echo($this->quickLinks); ?>
                </div>
                <div class="ui2-datatable-actions">
                    <?php $this->dataGrid->drawShowFilterControl(); ?>
                    <?php $this->dataGrid->drawRowsPerPageSelector(); ?>
                </div>
            </div>

            <div class="ui2-datatable-filters">
                <div class="ui2-datatable-nav">
                    <?php $this->dataGrid->printNavigation(false); ?>
                </div>
            </div>

            <div class="ui2-datatable-filterarea">
                <?php $this->dataGrid->drawFilterArea(); ?>
            </div>
            <div class="ui2-card ui2-datatable-card">
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

            <?php else: ?>

            <br /><br /><br /><br />
            <div style="height: 95px; background: #E6EEFF url(images/nodata/activitiesTop.jpg);">
                &nbsp;
            </div>
            <br /><br />
            <table cellpadding="0" cellspacing="0" border="0" width="956">
                <tr>
                <td style="padding-left: 62px;" align="center" valign="center">

                    <div style="text-align: center; width: 700px; line-height: 22px; font-size: 18px; font-weight: bold; color: #666666; padding-bottom: 20px;">
                    Activities are automatically recorded based on actions you perform.
                    </div>
                </td>

                </tr>
            </table>

            <?php endif; ?>
        </div>
    </div>
<?php TemplateUtility::printFooter(); ?>

