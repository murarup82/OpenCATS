<?php TemplateUtility::printHeader('Settings'); ?>
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
                <td><h2>Settings: Administration</h2></td>
            </tr>
        </table>

        <p class="note">Role Access Matrix</p>
        <p class="noteUnsized">Each user has one role. Configure page visibility and minimum access level for each role.</p>

        <?php if (!empty($this->message)): ?>
            <?php if (strpos($this->message, 'Failed') !== false): ?>
                <p class="warning"><?php $this->_($this->message); ?></p>
            <?php else: ?>
                <p class="noteGood"><?php $this->_($this->message); ?></p>
            <?php endif; ?>
        <?php endif; ?>

        <?php if (!$this->rolePermissionsEnabled): ?>
            <p class="warning">
                Role/page permission schema is not available yet.
                Apply pending migration from
                <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=settings&amp;a=schemaMigrations">Schema Migrations</a>.
            </p>
            <input type="button" class="button" value="Back" onclick="document.location.href='<?php echo(CATSUtility::getIndexName()); ?>?m=settings&amp;a=administration';" />
        <?php else: ?>
            <form method="post" action="<?php echo(CATSUtility::getIndexName()); ?>?m=settings&amp;a=rolePagePermissions">
                <input type="hidden" name="postback" value="postback" />

                <table class="searchTable" width="100%" cellpadding="4" cellspacing="0">
                    <tr>
                        <th align="left" style="min-width: 220px;">Page</th>
                        <?php foreach ($this->roles as $role): ?>
                            <th align="left"><?php $this->_($role['roleName']); ?></th>
                        <?php endforeach; ?>
                    </tr>
                    <?php foreach ($this->pages as $pageKey => $pageData): ?>
                        <tr>
                            <td><?php $this->_($pageData['label']); ?></td>
                            <?php foreach ($this->roles as $role): ?>
                                <?php $roleID = (int) $role['roleID']; ?>
                                <td>
                                    <select name="perm[<?php echo $roleID; ?>][<?php echo $pageKey; ?>]">
                                        <?php foreach ($this->accessOptions as $optionKey => $optionData): ?>
                                            <option value="<?php echo $optionKey; ?>"<?php if ($this->matrix[$roleID][$pageKey]['option'] == $optionKey): ?> selected="selected"<?php endif; ?>>
                                                <?php $this->_($optionData['label']); ?>
                                            </option>
                                        <?php endforeach; ?>
                                    </select>
                                </td>
                            <?php endforeach; ?>
                        </tr>
                    <?php endforeach; ?>
                </table>

                <br />
                <input type="submit" class="button" value="Save Matrix" />
                <input type="button" class="button" value="Back" onclick="document.location.href='<?php echo(CATSUtility::getIndexName()); ?>?m=settings&amp;a=administration';" />
            </form>
        <?php endif; ?>
    </div>
</div>

<?php TemplateUtility::printFooter(); ?>
