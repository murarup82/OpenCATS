<?php /* $Id: List.tpl 3096 2007-09-25 19:27:04Z brian $ */ ?>
<?php TemplateUtility::printHeader('Lists', array( 'js/highlightrows.js', 'js/sweetTitles.js', 'js/export.js', 'js/dataGrid.js', 'js/dataGridFilters.js', 'js/lists.js')); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active); ?>
    <div id="main">
        <div id="contents"<?php echo TemplateUtility::getUI2WrapperAttribute(); ?>>
            <div class="ui2-page-header">
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
                    <div class="ui2-header-utilities">
                        <?php TemplateUtility::printRecentDropdown('lists'); ?>
                    </div>
                    <?php if (!empty($this->canManageListAccess) && $this->getUserAccessLevel('lists.listByView') >= ACCESS_LEVEL_DELETE): ?>
                    <a href="javascript:void(0);" class="ui2-button ui2-button--danger" onclick="deleteListFromListView(<?php $this->_($this->listRS['savedListID']); ?>, <?php $this->_($this->listRS['numberEntries']); ?>);">Delete List</a>
                    <?php endif; ?>
                    <?php $this->dataGrid->drawShowFilterControl(); ?>
                    <?php $this->dataGrid->drawRowsPerPageSelector(); ?>
                </div>
            </div>
            </div>

            <?php if (!empty($this->listAccessSchemaAvailable)): ?>
            <div class="ui2-card ui2-card--section" style="margin-bottom: 12px;">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
                    <div>
                        <strong>List Access</strong><br />
                        <span class="ui2-status">
                            <?php if (!empty($this->listAccessRestricted)): ?>
                                Restricted to assigned users.
                            <?php else: ?>
                                Default mode: visible to all users with list access.
                            <?php endif; ?>
                        </span>
                    </div>
                </div>

                <?php if (!empty($this->listAccessMessage)): ?>
                    <div class="message" style="margin-top:8px;"><?php $this->_($this->listAccessMessage); ?></div>
                <?php endif; ?>

                <?php if (!empty($this->canManageListAccess)): ?>
                    <form method="post" action="<?php echo(CATSUtility::getIndexName()); ?>" style="margin-top: 10px;">
                        <input type="hidden" name="m" value="lists" />
                        <input type="hidden" name="a" value="saveListAccess" />
                        <input type="hidden" name="postback" value="1" />
                        <input type="hidden" name="savedListID" value="<?php $this->_($this->listRS['savedListID']); ?>" />

                        <label style="display:block;margin-bottom:8px;">
                            <input
                                type="checkbox"
                                id="listAccessRestricted"
                                name="isRestricted"
                                value="1"
                                <?php if (!empty($this->listAccessRestricted)) echo('checked="checked"'); ?>
                                onchange="toggleListAccessRestriction();"
                            />
                            Restrict this list to selected users
                        </label>

                        <div style="max-height: 220px; overflow:auto; border:1px solid #d6dce1; border-radius:6px;">
                            <table class="sortable" style="margin:0;">
                                <thead>
                                    <tr>
                                        <th style="width:90px;">Grant</th>
                                        <th>User</th>
                                        <th style="width:140px;">Access</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($this->listAccessUsersRS as $userRow): ?>
                                        <?php
                                            $listAccessUserID = (int) $userRow['userID'];
                                            $isOwner = ($listAccessUserID === (int) $this->listRS['createdBy']);
                                            $isAssigned = $isOwner || isset($this->listAccessMap[$listAccessUserID]);
                                            $canEditAssigned = $isOwner ? 1 : 0;
                                            if (isset($this->listAccessMap[$listAccessUserID]))
                                            {
                                                $canEditAssigned = (int) $this->listAccessMap[$listAccessUserID]['canEdit'];
                                            }
                                        ?>
                                        <tr>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    id="listAccessEnabled<?php echo($listAccessUserID); ?>"
                                                    name="accessEnabled[]"
                                                    value="<?php echo($listAccessUserID); ?>"
                                                    <?php if ($isAssigned) echo('checked="checked"'); ?>
                                                    <?php if ($isOwner) echo('disabled="disabled"'); ?>
                                                    onchange="toggleListAccessUser(<?php echo($listAccessUserID); ?>);"
                                                />
                                            </td>
                                            <td>
                                                <?php $this->_($userRow['firstName']); ?> <?php $this->_($userRow['lastName']); ?>
                                                <?php if ($isOwner): ?>
                                                    <span class="ui2-status">(Owner)</span>
                                                <?php endif; ?>
                                            </td>
                                            <td>
                                                <select
                                                    id="listAccessMode<?php echo($listAccessUserID); ?>"
                                                    name="accessMode[<?php echo($listAccessUserID); ?>]"
                                                    class="inputbox"
                                                    <?php if ($isOwner) echo('disabled="disabled"'); ?>
                                                >
                                                    <option value="view" <?php if (!$canEditAssigned) echo('selected="selected"'); ?>>View</option>
                                                    <option value="edit" <?php if ($canEditAssigned) echo('selected="selected"'); ?>>Edit</option>
                                                </select>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>

                        <div style="margin-top:10px;">
                            <input type="submit" class="button ui2-button ui2-button--primary" value="Save List Access" />
                        </div>
                    </form>
                <?php endif; ?>
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
                    <?php $this->dataGrid->printActionArea(); ?>
                </div>
                <div class="ui2-datatable-footer-right">
                    <?php $this->dataGrid->printNavigation(true); ?>
                </div>
            </div>

        </div>
    </div>

<?php if (!empty($this->listAccessSchemaAvailable) && !empty($this->canManageListAccess)): ?>
<script type="text/javascript">
    function toggleListAccessRestriction()
    {
        var restrictCheckbox = document.getElementById('listAccessRestricted');
        var isRestricted = (restrictCheckbox && restrictCheckbox.checked);

        <?php foreach ($this->listAccessUsersRS as $userRow): ?>
            <?php $listAccessUserID = (int) $userRow['userID']; ?>
            var enabledControl<?php echo($listAccessUserID); ?> = document.getElementById('listAccessEnabled<?php echo($listAccessUserID); ?>');
            var modeControl<?php echo($listAccessUserID); ?> = document.getElementById('listAccessMode<?php echo($listAccessUserID); ?>');
            if (enabledControl<?php echo($listAccessUserID); ?> && !enabledControl<?php echo($listAccessUserID); ?>.disabled)
            {
                enabledControl<?php echo($listAccessUserID); ?>.disabled = !isRestricted;
            }
            if (modeControl<?php echo($listAccessUserID); ?>)
            {
                var canUse = isRestricted;
                if (enabledControl<?php echo($listAccessUserID); ?> && !enabledControl<?php echo($listAccessUserID); ?>.disabled)
                {
                    canUse = canUse && enabledControl<?php echo($listAccessUserID); ?>.checked;
                }
                modeControl<?php echo($listAccessUserID); ?>.disabled = !canUse;
            }
        <?php endforeach; ?>
    }

    function toggleListAccessUser(userID)
    {
        var restrictCheckbox = document.getElementById('listAccessRestricted');
        var isRestricted = (restrictCheckbox && restrictCheckbox.checked);
        var enabledControl = document.getElementById('listAccessEnabled' + userID);
        var modeControl = document.getElementById('listAccessMode' + userID);
        if (!modeControl || !enabledControl)
        {
            return;
        }
        modeControl.disabled = !(isRestricted && enabledControl.checked);
    }

    toggleListAccessRestriction();
</script>
<?php endif; ?>

<?php TemplateUtility::printFooter(); ?>

