<?php /* $Id: JobOrders.tpl 3676 2007-11-21 21:02:15Z brian $ */ ?>
<?php TemplateUtility::printHeader('Job Orders', array( 'js/highlightrows.js',  'js/sweetTitles.js', 'js/export.js', 'js/dataGrid.js', 'js/dataGridFilters.js')); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active); ?>
<?php $md5InstanceName = md5($this->dataGrid->getInstanceName()); ?>
    <style type="text/css">
    div.addJobOrderButton { background: #4172E3 url(images/nodata/jobOrdersButton.jpg); cursor: pointer; width: 337px; height: 67px; }
    div.addJobOrderButton:hover { background: #4172E3 url(images/nodata/jobOrdersButton-o.jpg); cursor: pointer; width: 337px; height: 67px; }
    .jobOrderCommentCountBadge { display:inline-block; min-width:18px; padding:1px 6px; border-radius:999px; border:1px solid #8cc8a4; background:#e8f7ef; color:#1f6f3c; font-weight:bold; font-size:11px; line-height:14px; text-align:center; }
    .jobOrderCommentCountBadge--empty { border-color:#cdd8e3; background:#f3f6f9; color:#677787; font-weight:normal; }
    tr.jobOrderRowHasComments td { background-color:#f2fcf5 !important; }
    </style>
    <div id="main">
        <div id="contents"<?php echo TemplateUtility::getUI2WrapperAttribute(); ?><?php echo !$this->totalJobOrders ? ' style="background-color: #E6EEFF; padding: 0;"' : ''; ?>>
            <?php if ($this->totalJobOrders): ?>
            <div class="ui2-page-header">
                <div class="ui2-datatable-toolbar ui2-datatable-toolbar--no-search">
                    <div class="ui2-datatable-title">
                        <div class="ui2-datatable-title-row">
                            <img src="images/job_orders.gif" width="24" height="24" border="0" alt="Job Orders" style="margin-top: 3px;" />
                            <div>
                                <h2>Job Orders: Home</h2>
                                <div class="ui2-datatable-meta">
                                    Job Orders - Page <?php echo($this->dataGrid->getCurrentPageHTML()); ?>
                                    (<?php echo($this->dataGrid->getNumberOfRows()); ?> Items)
                                    (<?php if ($this->dataGrid->getFilterValue('Status') != '') echo ($this->dataGrid->getFilterValue('Status')); else echo ('All'); ?>)
                                    <?php if ($this->dataGrid->getFilterValue('OwnerID') ==  $this->userID): ?>(Only My Job Orders)<?php endif; ?>
                                    <?php if ($this->dataGrid->getFilterValue('IsHot') == '1'): ?>(Only Hot Job Orders)<?php endif; ?>
                                    <?php if (!empty($this->selectedCompanyFilterName)): ?>(Company: <?php $this->_($this->selectedCompanyFilterName); ?>)<?php endif; ?>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="ui2-datatable-actions">
                        <div class="ui2-header-utilities">
                            <form class="ui2-header-search" action="<?php echo(CATSUtility::getIndexName()); ?>" method="get" autocomplete="off">
                                <input type="hidden" name="m" value="joborders" />
                                <input type="hidden" name="a" value="search" />
                                <input type="hidden" name="mode" value="searchByJobTitle" />
                                <input type="text" name="wildCardString" class="ui2-input" placeholder="Search job orders..." />
                                <button type="submit" class="ui2-button ui2-button--secondary">Search</button>
                            </form>
                            <?php TemplateUtility::printRecentDropdown('joborders'); ?>
                        </div>
                        <?php if ($this->getUserAccessLevel('joborders.add') >= ACCESS_LEVEL_EDIT): ?>
                            <a class="ui2-button ui2-button--primary" href="javascript:void(0);" onclick="showPopWin('<?php echo CATSUtility::getIndexName(); ?>?m=joborders&amp;a=addJobOrderPopup', 400, 250, null); return false;">Add Job Order</a>
                        <?php endif; ?>
                        <?php if (!empty($this->canManageRecruiterAllocation)): ?>
                            <a class="ui2-button ui2-button--secondary" href="<?php echo CATSUtility::getIndexName(); ?>?m=joborders&amp;a=recruiterAllocation">Recruiter Allocation</a>
                        <?php endif; ?>
                        <?php $this->dataGrid->drawShowFilterControl(); ?>
                        <?php $this->dataGrid->drawRowsPerPageSelector(); ?>
                    </div>
                </div>

                <?php TemplateUtility::printPopupContainer(); ?>

                <form name="jobOrdersViewSelectorForm" id="jobOrdersViewSelectorForm" action="<?php echo(CATSUtility::getIndexName()); ?>" method="get">
                    <input type="hidden" name="m" value="joborders" />
                    <input type="hidden" name="a" value="list" />
                    <div class="ui2-datatable-filters">
                        <div class="ui2-datatable-nav">
                            <?php $this->dataGrid->printNavigation(false); ?>
                        </div>
                        <label class="ui2-inline">
                            Status
                            <select name="view" id="view" onchange="<?php echo($this->dataGrid->getJSAddFilter('Status', '==', 'this.value', 'true')); ?>" class="selectBox">
                                <?php
                                    foreach($this->jobOrderFilters as $filter){
                                        echo '<option value="'.$filter.'"';
                                        if($this->dataGrid->getFilterValue('Status') == $filter){
                                            echo ' selected="selected"';
                                        }
                                        echo ">".$filter."</option>";
                                    }
                                ?>
                                <option value=""<?php if ($this->dataGrid->getFilterValue('Status') == ''): ?> selected="selected"<?php endif; ?>>All</option>
                            </select>
                        </label>
                        <label class="ui2-inline" for="onlyMyJobOrders">
                            <input type="checkbox" name="onlyMyJobOrders" id="onlyMyJobOrders" <?php if ($this->dataGrid->getFilterValue('OwnerID') ==  $this->userID): ?>checked<?php endif; ?> onclick="<?php echo $this->dataGrid->getJSAddRemoveFilterFromCheckbox('OwnerID', '==',  $this->userID); ?>" />
                            Only My Job Orders
                        </label>
                        <label class="ui2-inline" for="onlyHotJobOrders">
                            <input type="checkbox" name="onlyHotJobOrders" id="onlyHotJobOrders" <?php if ($this->dataGrid->getFilterValue('IsHot') == '1'): ?>checked<?php endif; ?> onclick="<?php echo $this->dataGrid->getJSAddRemoveFilterFromCheckbox('IsHot', '==', '\'1\''); ?>" />
                            Only Hot Job Orders
                        </label>
                        <label class="ui2-inline">
                            Company
                            <select
                                name="companyFilter"
                                id="companyFilter"
                                onchange="if (this.value === '') { <?php echo($this->dataGrid->getJSRemoveFilter('CompanyID')); ?> } else { <?php echo($this->dataGrid->getJSAddFilter('CompanyID', '==', 'this.value', 'true')); ?> }"
                                class="selectBox"
                            >
                                <option value=""<?php if (empty($this->selectedCompanyFilterID)): ?> selected="selected"<?php endif; ?>>All</option>
                                <?php if (!empty($this->companiesRS)): ?>
                                    <?php foreach ($this->companiesRS as $company): ?>
                                        <option value="<?php echo((int) $company['companyID']); ?>"<?php if ((int) $this->selectedCompanyFilterID === (int) $company['companyID']): ?> selected="selected"<?php endif; ?>>
                                            <?php $this->_($company['name']); ?>
                                        </option>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </select>
                        </label>
                    </div>
                </form>
            </div>
            <?php endif; ?>

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

            <?php if ($this->totalJobOrders): ?>
            <div class="ui2-datatable-filterarea">
                <?php $this->dataGrid->drawFilterArea(); ?>
            </div>
            <div class="ui2-card ui2-datatable-card ui2-datatable-card--avel">
                <?php $this->dataGrid->draw();  ?>
            </div>
            <script type="text/javascript">
            (function ()
            {
                var table = document.getElementById('table<?php echo $md5InstanceName; ?>');
                if (!table)
                {
                    return;
                }

                var markers = table.getElementsByTagName('span');
                for (var i = 0; i < markers.length; i++)
                {
                    var marker = markers[i];
                    if (!marker.className || marker.className.indexOf('jobOrderCommentCountMeta') === -1)
                    {
                        continue;
                    }

                    var count = parseInt(marker.getAttribute('data-comment-count'), 10);
                    if (isNaN(count) || count <= 0)
                    {
                        continue;
                    }

                    var row = marker;
                    while (row && row.tagName !== 'TR')
                    {
                        row = row.parentNode;
                    }
                    if (!row)
                    {
                        continue;
                    }

                    if (row.className.indexOf('jobOrderRowHasComments') === -1)
                    {
                        row.className += (row.className ? ' ' : '') + 'jobOrderRowHasComments';
                    }
                }
            })();
            </script>

            <div class="ui2-datatable-footer">
                <div class="ui2-datatable-footer-left">
                    <?php $this->dataGrid->printActionArea(); ?>&nbsp;
                </div>
                <div class="ui2-datatable-footer-right">
                    <?php $this->dataGrid->printNavigation(true); ?>
                </div>
            </div>
            <?php else: ?>

            <br /><br /><br /><br />
            <div style="height: 95px; background: #E6EEFF url(images/nodata/jobOrdersTop.jpg);">
                &nbsp;
            </div>
            <br /><br />
                 <?php if ($this->getUserAccessLevel('joborders.add') >= ACCESS_LEVEL_EDIT): ?>
            <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                <td style="padding-left: 62px;" align="center" valign="center">

                    <div style="text-align: center; width: 600px; line-height: 22px; font-size: 18px; font-weight: bold; color: #666666; padding-bottom: 20px;">
                    Add a job order, then attach candidates
                    to the pipeline with their status (interviewing, qualifying, etc.)
                    </div>

                    <a href="javascript:void(0);"  onclick="showPopWin('<?php echo CATSUtility::getIndexName(); ?>?m=joborders&amp;a=addJobOrderPopup', 400, 250, null);">
                    <div class="addJobOrderButton">&nbsp;</div>
                    </a>
                </td>

                </tr>
            </table>
                <?php endif; ?>

            <?php endif; ?>
        </div>
    </div>

<script type="text/javascript">
function JobOrders_toggleMonitored(checkboxElement, jobOrderID)
{
    var monitoredValue = (checkboxElement && checkboxElement.checked) ? '1' : '0';
    var currentURL = (window.location.search && window.location.search.length > 1)
        ? window.location.search.substring(1)
        : 'm=joborders&a=listByView';

    window.location.href = '<?php echo CATSUtility::getIndexName(); ?>?m=joborders&a=setMonitoredJobOrder'
        + '&jobOrderID=' + encodeURIComponent(jobOrderID)
        + '&value=' + encodeURIComponent(monitoredValue)
        + '&currentURL=' + encodeURIComponent(currentURL);
}
</script>

<?php TemplateUtility::printFooter(); ?>

