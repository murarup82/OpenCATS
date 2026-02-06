<?php /* $Id: Companies.tpl 3460 2007-11-07 03:50:34Z brian $ */ ?>
<?php TemplateUtility::printHeader('Companies', array('js/highlightrows.js', 'js/export.js', 'js/dataGrid.js', 'js/dataGridFilters.js')); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active); ?>
    <style type="text/css">
    div.addCompaniesButton { background: #4172E3 url(images/nodata/companiesButton.jpg); cursor: pointer; width: 337px; height: 67px; }
    div.addCompaniesButton:hover { background: #4172E3 url(images/nodata/companiesButton-o.jpg); cursor: pointer; width: 337px; height: 67px; }
    </style>
    <div id="main">
        <?php TemplateUtility::printQuickSearch(); ?>

        <div id="contents"<?php echo TemplateUtility::getUI2WrapperAttribute(); ?>>
            <div class="ui2-datatable-toolbar">
                <div class="ui2-datatable-title">
                    <div class="ui2-datatable-title-row">
                        <img src="images/companies.gif" width="24" height="24" border="0" alt="Companies" style="margin-top: 3px;" />
                        <div>
                            <h2>Companies: Home</h2>
                            <div class="ui2-datatable-meta">
                                Companies - Page <?php echo($this->dataGrid->getCurrentPageHTML()); ?>
                                (<?php echo($this->dataGrid->getNumberOfRows()); ?> Items)
                                <?php if ($this->dataGrid->getFilterValue('OwnerID') ==  $this->userID): ?>(Only My Companies)<?php endif; ?>
                                <?php if ($this->dataGrid->getFilterValue('IsHot') == '1'): ?>(Only Hot Companies)<?php endif; ?>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="ui2-datatable-search">
                    <form class="ui2-datatable-search-form" action="<?php echo(CATSUtility::getIndexName()); ?>" method="get" autocomplete="off">
                        <input type="hidden" name="m" value="companies" />
                        <input type="hidden" name="a" value="search" />
                        <input type="hidden" name="mode" value="searchByName" />
                        <input type="text" name="wildCardString" class="ui2-input ui2-datatable-search-input" placeholder="Search companies..." />
                        <button type="submit" class="ui2-button ui2-button--secondary">Search</button>
                    </form>
                </div>
                <div class="ui2-datatable-actions">
                    <?php if ($this->getUserAccessLevel('companies.add') >= ACCESS_LEVEL_EDIT): ?>
                        <a class="ui2-button" href="<?php echo CATSUtility::getIndexName(); ?>?m=companies&amp;a=add">Add Company</a>
                    <?php endif; ?>
                    <?php $this->dataGrid->drawShowFilterControl(); ?>
                    <?php $this->dataGrid->drawRowsPerPageSelector(); ?>
                </div>
            </div>

            <form name="companiesViewSelectorForm" id="companiesViewSelectorForm" action="<?php echo(CATSUtility::getIndexName()); ?>" method="get">
                <input type="hidden" name="m" value="companies" />
                <input type="hidden" name="a" value="listByView" />
                <div class="ui2-datatable-filters">
                    <div class="ui2-datatable-nav">
                        <?php $this->dataGrid->printNavigation(false); ?>
                    </div>
                    <label class="ui2-inline" for="onlyMyCompanies">
                        <input type="checkbox" name="onlyMyCompanies" id="onlyMyCompanies" <?php if ($this->dataGrid->getFilterValue('OwnerID') ==  $this->userID): ?>checked<?php endif; ?> onclick="<?php echo $this->dataGrid->getJSAddRemoveFilterFromCheckbox('OwnerID', '==',  $this->userID); ?>" />
                        Only My Companies
                    </label>
                    <label class="ui2-inline" for="onlyHotCompanies">
                        <input type="checkbox" name="onlyHotCompanies" id="onlyHotCompanies" <?php if ($this->dataGrid->getFilterValue('IsHot') == '1'): ?>checked<?php endif; ?> onclick="<?php echo $this->dataGrid->getJSAddRemoveFilterFromCheckbox('IsHot', '==', '\'1\''); ?>" />
                        Only Hot Companies
                    </label>
                    <?php
                        $showMyCompanyLink = false;
                        if (isset($_SESSION['CATS']) && $_SESSION['CATS']->isHrMode() &&
                            $this->getUserAccessLevel('companies.internalPostings') >= ACCESS_LEVEL_READ)
                        {
                            include_once(LEGACY_ROOT . '/lib/Companies.php');
                            $companies = new Companies($_SESSION['CATS']->getSiteID());
                            $defaultCompanyID = $companies->getDefaultCompany();
                            if ($defaultCompanyID !== false)
                            {
                                $showMyCompanyLink = true;
                            }
                        }
                    ?>
                    <?php if ($showMyCompanyLink): ?>
                        <a class="ui2-button ui2-button--secondary" href="<?php echo CATSUtility::getIndexName(); ?>?m=companies&amp;a=internalPostings">Go To My Company</a>
                    <?php endif; ?>
                </div>
            </form>

            <?php if ($this->errMessage != ''): ?>
            <div id="errorMessage" style="padding: 25px 0px 25px 0px; border-top: 1px solid #800000; border-bottom: 1px solid #800000; background-color: #f7f7f7;margin-bottom: 15px;">
            <table>
                <tr>
                    <td align="left" valign="center" style="padding-right: 5px;">
                        <img src="images/large_error.gif" align="left">
                    </td>
                    <td align="left" valign="center">
                        <span style="font-size: 12pt; font-weight: bold; color: #800000; line-height: 12pt;">There was a problem with your request:</span>
                        <div style="font-size: 10pt; font-weight: bold; padding: 3px 0px 0px 0px;"><?php echo $this->errMessage; ?></div>
                    </td>
                </tr>
            </table>
            </div>
            <?php endif; ?>

            <div class="ui2-datatable-filterarea">
                <?php $this->dataGrid->drawFilterArea(); ?>
            </div>
            <div class="ui2-card ui2-datatable-card ui2-datatable-card--avel">
                <?php $this->dataGrid->draw();  ?>
            </div>

            <div class="ui2-datatable-footer">
                <div class="ui2-datatable-footer-left">
                    <?php $this->dataGrid->printActionArea(); ?>&nbsp;
                </div>
                <div class="ui2-datatable-footer-right">
                    <?php $this->dataGrid->printNavigation(true); ?>
                </div>
            </div>
        </div>
    </div>
<?php TemplateUtility::printFooter(); ?>

