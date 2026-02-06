<?php /* $Id: Contacts.tpl 3430 2007-11-06 20:44:51Z will $ */ ?>
<?php TemplateUtility::printHeader('Contacts', array('js/highlightrows.js', 'js/export.js', 'js/dataGrid.js', 'js/dataGridFilters.js')); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active); ?>
    <style type="text/css">
    div.addContactsButton { background: #4172E3 url(images/nodata/contactsButton.jpg); cursor: pointer; width: 337px; height: 67px; }
    div.addContactsButton:hover { background: #4172E3 url(images/nodata/contactsButton-o.jpg); cursor: pointer; width: 337px; height: 67px; }
    </style>
    <div id="main">
        <?php TemplateUtility::printQuickSearch(); ?>

        <div id="contents"<?php echo TemplateUtility::getUI2WrapperAttribute(); ?><?php echo !$this->totalContacts ? ' style="background-color: #E6EEFF; padding: 0px;"' : ''; ?>>
            <?php if ($this->totalContacts): ?>
            <div class="ui2-datatable-toolbar">
                <div class="ui2-datatable-title">
                    <div class="ui2-datatable-title-row">
                        <img src="images/contact.gif" width="24" height="24" border="0" alt="Contacts" style="margin-top: 3px;" />
                        <div>
                            <h2>Contacts: Home</h2>
                            <div class="ui2-datatable-meta">
                                Contacts - Page <?php echo($this->dataGrid->getCurrentPageHTML()); ?>
                                (<?php echo($this->dataGrid->getNumberOfRows()); ?> Items)
                                <?php if ($this->dataGrid->getFilterValue('OwnerID') ==  $this->userID): ?>(Only My Contacts)<?php endif; ?>
                                <?php if ($this->dataGrid->getFilterValue('IsHot') == '1'): ?>(Only Hot Contacts)<?php endif; ?>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="ui2-datatable-search">
                    <form class="ui2-datatable-search-form" action="<?php echo(CATSUtility::getIndexName()); ?>" method="get" autocomplete="off">
                        <input type="hidden" name="m" value="contacts" />
                        <input type="hidden" name="a" value="search" />
                        <input type="hidden" name="mode" value="searchByFullName" />
                        <input type="text" name="wildCardString" class="ui2-input ui2-datatable-search-input" placeholder="Search contacts..." />
                        <button type="submit" class="ui2-button ui2-button--secondary">Search</button>
                    </form>
                </div>
                <div class="ui2-datatable-actions">
                    <?php if ($this->getUserAccessLevel('contacts.add') >= ACCESS_LEVEL_EDIT): ?>
                        <a class="ui2-button" href="<?php echo CATSUtility::getIndexName(); ?>?m=contacts&amp;a=add">Add Contact</a>
                    <?php endif; ?>
                    <?php $this->dataGrid->drawShowFilterControl(); ?>
                    <?php $this->dataGrid->drawRowsPerPageSelector(); ?>
                </div>
            </div>

            <form name="contactsViewSelectorForm" id="contactsViewSelectorForm" action="<?php echo(CATSUtility::getIndexName()); ?>" method="get">
                <input type="hidden" name="m" value="contacts" />
                <input type="hidden" name="a" value="listByView" />
                <div class="ui2-datatable-filters">
                    <div class="ui2-datatable-nav">
                        <?php $this->dataGrid->printNavigation(false); ?>
                    </div>
                    <label class="ui2-inline" for="onlyMyContacts">
                        <input type="checkbox" name="onlyMyCompanies" id="onlyMyContacts" <?php if ($this->dataGrid->getFilterValue('OwnerID') ==  $this->userID): ?>checked<?php endif; ?> onclick="<?php echo $this->dataGrid->getJSAddRemoveFilterFromCheckbox('OwnerID', '==',  $this->userID); ?>" />
                        Only My Contacts
                    </label>
                    <label class="ui2-inline" for="onlyHotContacts">
                        <input type="checkbox" name="onlyHotCompanies" id="onlyHotContacts" <?php if ($this->dataGrid->getFilterValue('IsHot') == '1'): ?>checked<?php endif; ?> onclick="<?php echo $this->dataGrid->getJSAddRemoveFilterFromCheckbox('IsHot', '==', '\'1\''); ?>" />
                        Only Hot Contacts
                    </label>
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
            <div style="height: 95px; background: #E6EEFF url(images/nodata/contactsTop.jpg);">
                &nbsp;
            </div>
            <br /><br />
                <?php if ($this->getUserAccessLevel('contacts.add') >= ACCESS_LEVEL_EDIT): ?>
            <table cellpadding="0" cellspacing="0" border="0" width="956">
                <tr>
                <td style="padding-left: 62px;" align="center" valign="center">

                    <div style="text-align: center; width: 600px; line-height: 22px; font-size: 18px; font-weight: bold; color: #666666; padding-bottom: 20px;">
                    Add contacts to keep track of people you work with.
                    </div>

                    <a href="<?php echo CATSUtility::getIndexName(); ?>?m=contacts&amp;a=add">
                    <div class="addContactsButton">&nbsp;</div>
                    </a>
                </td>

                </tr>
            </table>
                <?php endif; ?>

            <?php endif; ?>

        </div>
    </div>
<?php TemplateUtility::printFooter(); ?>

