<?php /* Schema Migrations */ ?>
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

            <p class="note">Schema Migrations</p>

            <?php if (!empty($this->errorMessage)): ?>
                <p class="noteBad"><?php $this->_($this->errorMessage); ?></p>
            <?php elseif (!empty($this->message)): ?>
                <p class="noteGood"><?php $this->_($this->message); ?></p>
            <?php endif; ?>

            <?php if (!empty($this->dirMissing)): ?>
                <p class="noteBad">Migrations directory not found.</p>
            <?php else: ?>
                <p class="noteUnsized">
                    Pending migrations: <?php echo((int) $this->pendingCount); ?>.
                </p>

                <form method="post" action="<?php echo(CATSUtility::getIndexName()); ?>?m=settings&amp;a=schemaMigrations" style="margin-bottom: 10px;">
                    <input type="hidden" name="postback" value="postback" />
                    <input type="hidden" name="applyAll" value="1" />
                    <?php if ((int) $this->pendingCount > 0): ?>
                        <input type="submit" class="button ui2-button ui2-button--primary" value="Apply All Pending" />
                    <?php else: ?>
                        <input type="submit" class="button ui2-button ui2-button--secondary" value="Apply All Pending" disabled="disabled" />
                    <?php endif; ?>
                </form>

                <table class="sortable" width="100%">
                    <thead>
                        <tr>
                            <th>Version</th>
                            <th>Status</th>
                            <th>Applied At</th>
                            <th>Applied By</th>
                            <th>Checksum</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($this->migrations)): ?>
                            <tr>
                                <td colspan="6">No migrations found.</td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($this->migrations as $migration): ?>
                                <?php
                                    $statusLabel = $migration['applied'] ? 'Applied' : 'Pending';
                                    if ($migration['applied'] && empty($migration['checksumMatches']))
                                    {
                                        $statusLabel = 'Applied (checksum mismatch)';
                                    }
                                ?>
                                <tr>
                                    <td><?php $this->_($migration['version']); ?></td>
                                    <td><?php $this->_($statusLabel); ?></td>
                                    <td><?php $this->_($migration['appliedAt']); ?></td>
                                    <td><?php $this->_($migration['appliedBy']); ?></td>
                                    <td><span style="font-family: monospace; font-size: 11px;"><?php $this->_($migration['checksum']); ?></span></td>
                                    <td>
                                        <form method="post" action="<?php echo(CATSUtility::getIndexName()); ?>?m=settings&amp;a=schemaMigrations">
                                            <input type="hidden" name="postback" value="postback" />
                                            <input type="hidden" name="version" value="<?php $this->_($migration['version']); ?>" />
                                            <?php if (!empty($migration['applied'])): ?>
                                                <input type="submit" class="button ui2-button ui2-button--secondary" value="Applied" disabled="disabled" />
                                            <?php else: ?>
                                                <input type="submit" class="button ui2-button ui2-button--primary" value="Apply" />
                                            <?php endif; ?>
                                        </form>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>

                <br />
                <input type="button" class="button" value="Back" onclick="document.location.href='<?php echo(CATSUtility::getIndexName()); ?>?m=settings&amp;a=administration';" />
            <?php endif; ?>
        </div>
    </div>

<?php TemplateUtility::printFooter(); ?>
