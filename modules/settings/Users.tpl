<?php /* $Id: Users.tpl 2452 2007-05-11 17:47:55Z brian $ */ ?>
<?php TemplateUtility::printHeader('Settings', 'js/sorttable.js'); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active, $this->subActive); ?>
    <div id="main">
        <?php TemplateUtility::printQuickSearch(); ?>

        <div id="contents"<?php echo TemplateUtility::getUI2WrapperAttribute(); ?>>
            <table>
                <tr>
                    <td width="3%">
                        <img src="images/settings.gif" width="24" height="24" alt="Settings" style="border: none; margin-top: 3px;" />&nbsp;
                    </td>
                    <td><h2>Settings: User Management</h2></td>
                </tr>
            </table>

            <p class="note">User Management</p>

            <table class="sortable">
                <thead>
                    <tr>
                        <th align="left" nowrap="nowrap">First Name</th>
                        <th align="left" nowrap="nowrap">Last Name</th>
                        <th align="left">Username</th>
                        <th align="left" nowrap="nowrap">Access Level</th>
                        <th align="left" nowrap="nowrap">Last Success</th>
                        <th align="left" nowrap="nowrap">Last Fail</th>
                        <th align="left" nowrap="nowrap">Actions</th>
                    </tr>
                </thead>

                <?php if (!empty($this->rs)): ?>
                    <?php foreach ($this->rs as $rowNumber => $data): ?>
                        <tr class="<?php TemplateUtility::printAlternatingRowClass($rowNumber); ?>">
                            <td valign="top" align="left">
                                <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=settings&amp;a=showUser&amp;userID=<?php $this->_($data['userID']); ?>">
                                    <?php $this->_($data['firstName']); ?>
                                </a>
                            </td>
                            <td valign="top" align="left">
                                <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=settings&amp;a=showUser&amp;userID=<?php $this->_($data['userID']); ?>">
                                    <?php $this->_($data['lastName']); ?>
                                </a>
                            </td>
                            <td valign="top" align="left"><?php $this->_($data['username']); ?></td>
                            <td valign="top" align="left"><?php $this->_($data['accessLevelDescription']); ?></td>
                            <td valign="top" align="left"><?php $this->_($data['successfulDate']); ?></td>
                            <td valign="top" align="left"><?php $this->_($data['unsuccessfulDate']); ?></td>
                            <td valign="top" align="left">
                                <span class="ui2-inline">
                                    <a class="ui2-button ui2-button--secondary" href="<?php echo(CATSUtility::getIndexName()); ?>?m=settings&amp;a=editUser&amp;userID=<?php $this->_($data['userID']); ?>">
                                        Edit
                                    </a>
                                    <?php if ($this->getUserAccessLevel('settings.deleteUser') >= ACCESS_LEVEL_SA && (int) $this->currentUser !== (int) $data['userID']): ?>
                                        <a class="ui2-button ui2-button--danger" href="javascript:void(0);" onclick="return deleteUser(<?php $this->_($data['userID']); ?>);">
                                            Delete
                                        </a>
                                    <?php endif; ?>
                                </span>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </table>
            <?php if (AUTH_MODE != "ldap"): ?>
                <a id="add_link" class="ui2-button ui2-button--secondary" href="<?php echo(CATSUtility::getIndexName()); ?>?m=settings&amp;a=addUser" title="You have <?php $this->_($this->license['diff']); ?> user accounts remaining.">
                    <img src="images/candidate_inline.gif" width="16" height="16" class="absmiddle" alt="add" style="border: none;" />&nbsp;Add User
                </a>
            <?php endif; ?>

            <script type="text/javascript">
                function deleteUser(userID)
                {
                    if (!confirm('Delete this user?'))
                    {
                        return false;
                    }

                    var http = AJAX_getXMLHttpObject();
                    if (!http)
                    {
                        alert('Browser does not support AJAX.');
                        return false;
                    }

                    http.onreadystatechange = function ()
                    {
                        if (http.readyState !== 4)
                        {
                            return;
                        }

                        if (http.status !== 200)
                        {
                            alert('Unable to delete user.');
                            return;
                        }

                        var response = (http.responseText || '').replace(/^\s+|\s+$/g, '');
                        if (response !== 'Ok')
                        {
                            alert(response || 'Unable to delete user.');
                            return;
                        }

                        window.location.reload();
                    };

                    http.open('GET', CATSIndexName + '?m=settings&a=ajax_wizardDeleteUser&userID=' + encodeURIComponent(userID), true);
                    http.send(null);
                    return false;
                }
            </script>
        </div>
    </div>
<?php TemplateUtility::printFooter(); ?>

