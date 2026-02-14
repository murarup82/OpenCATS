<?php /* $Id: Lists.tpl 3311 2007-10-25 21:36:18Z andrew $ */ ?>
<?php TemplateUtility::printHeader('Lists', array( 'js/highlightrows.js', 'js/sweetTitles.js', 'js/export.js', 'js/dataGrid.js', 'js/dataGridFilters.js', 'js/lists.js')); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active); ?>
    <div id="main">
        <div id="contents"<?php echo TemplateUtility::getUI2WrapperAttribute(); ?><?php echo !$this->dataGrid->getNumberOfRows() ? ' style="background-color: #E6EEFF; padding: 0px;"' : ''; ?>>
            <?php if ($this->getUserAccessLevel('lists.listByView') >= ACCESS_LEVEL_EDIT): ?>
            <div id="savedListNew" class="ui2-card" style="display:none; margin: 16px 16px 0 16px; padding: 12px;">
                <div style="display:flex; flex-wrap:wrap; align-items:center; gap:8px;">
                    <input
                        type="text"
                        class="ui2-input"
                        id="savedListNewInput"
                        style="min-width: 260px;"
                        placeholder="List name"
                        onkeydown="if (event.keyCode === 13) { commitNewList('<?php echo($_SESSION['CATS']->getCookie()); ?>', document.getElementById('listsCreateDataItemType').value); return false; }"
                    />
                    <select id="listsCreateDataItemType" class="inputbox">
                        <option value="<?php echo DATA_ITEM_CANDIDATE; ?>">Candidates</option>
                        <option value="<?php echo DATA_ITEM_JOBORDER; ?>">Job Orders</option>
                        <option value="<?php echo DATA_ITEM_COMPANY; ?>">Companies</option>
                        <option value="<?php echo DATA_ITEM_CONTACT; ?>">Contacts</option>
                    </select>
                    <button
                        type="button"
                        class="ui2-button ui2-button--primary"
                        onclick="commitNewList('<?php echo($_SESSION['CATS']->getCookie()); ?>', document.getElementById('listsCreateDataItemType').value);"
                    >
                        Create List
                    </button>
                    <button type="button" class="ui2-button ui2-button--secondary" onclick="document.getElementById('savedListNew').style.display='none';">Cancel</button>
                </div>
            </div>
            <div id="savedListNewAjaxing" class="ui2-card" style="display:none; margin: 16px 16px 0 16px; padding: 12px;">
                <img src="images/indicator.gif" alt="" />&nbsp;Creating list, please wait...
            </div>
            <?php endif; ?>
            <?php if ($this->dataGrid->getNumberOfRows()): ?>
            <div class="ui2-page-header">
            <div class="ui2-datatable-toolbar">
                <div class="ui2-datatable-title">
                    <div class="ui2-datatable-title-row">
                        <img src="images/job_orders.gif" width="24" height="24" border="0" alt="Job Orders" style="margin-top: 3px;" />
                        <div>
                            <h2>Lists: Home</h2>
                            <div class="ui2-datatable-meta">
                                Lists - Page <?php echo($this->dataGrid->getCurrentPageHTML()); ?> (<?php echo($this->dataGrid->getNumberOfRows()); ?> Items)
                            </div>
                        </div>
                    </div>
                </div>
                <div class="ui2-datatable-search"></div>
                    <div class="ui2-datatable-actions">
                        <div class="ui2-header-utilities">
                        <?php TemplateUtility::printRecentDropdown('lists'); ?>
                    </div>
                    <?php if ($this->getUserAccessLevel('lists.listByView') >= ACCESS_LEVEL_EDIT): ?>
                        <button type="button" class="ui2-button ui2-button--primary" onclick="addListRow();">Add List</button>
                    <?php endif; ?>
                    <?php $this->dataGrid->drawShowFilterControl(); ?>
                    <?php $this->dataGrid->drawRowsPerPageSelector(); ?>
                </div>
            </div>
            </div>

            <div class="ui2-datatable-filterarea">
                <?php $this->dataGrid->drawFilterArea(); ?>
            </div>
            <div class="ui2-card ui2-datatable-card ui2-datatable-card--avel">
                <?php $this->dataGrid->draw();  ?>
            </div>

            <div class="ui2-datatable-footer">
                <div class="ui2-datatable-footer-left"></div>
                <div class="ui2-datatable-footer-right">
                    <?php $this->dataGrid->printNavigation(true); ?>
                </div>
            </div>
            <?php else: ?>

            <br /><br /><br /><br />
            <div style="height: 95px; background: #E6EEFF url(images/nodata/listsTop.jpg);">
                &nbsp;
            </div>
            <br /><br />
            <table cellpadding="0" cellspacing="0" border="0" width="956">
                <tr>
                <td style="padding-left: 62px;" align="center" valign="center">

                    <div style="text-align: center; width: 600px; line-height: 22px; font-size: 18px; font-weight: bold; color: #666666; padding-bottom: 20px;">
                    Create lists to group candidates, job orders, companies and contacts and perform actions on them quickly.
                    <br /><br />
                    <span style="font-size: 14px; font-weight: normal;">
                    Create lists from the <b>job orders, candidates, companies </b>or<b> contacts</b> tab.
                    </span>
                    <?php if ($this->getUserAccessLevel('lists.listByView') >= ACCESS_LEVEL_EDIT): ?>
                    <br /><br />
                    <button type="button" class="ui2-button ui2-button--primary" onclick="addListRow();">Add List</button>
                    <?php endif; ?>
                    </div>
                </td>

                </tr>
            </table>

            <?php endif; ?>

        </div>
    </div>

<?php TemplateUtility::printFooter(); ?>

