<?php /* Rejection Reasons administration */ ?>
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

            <p class="note">Rejection Reasons</p>

            <?php if ($this->saved): ?>
                <p class="noteGood">Rejection reasons saved successfully.</p>
            <?php endif; ?>

            <table class="searchTable" width="100%">
                <tr>
                    <td>
                        <form action="<?php echo(CATSUtility::getIndexName()); ?>?m=settings&amp;a=rejectionReasons" method="post" autocomplete="off">
                            <input type="hidden" name="postback" value="postback" />
                            <input type="hidden" name="action" value="add" />

                            <label for="newLabel">New Reason:</label><br />
                            <input type="text" name="newLabel" id="newLabel" style="width: 350px;" />
                            <input type="submit" class="button" value="Add" />
                        </form>
                    </td>
                </tr>
            </table>

            <br />

            <table class="searchTable" width="100%">
                <tr>
                    <th align="left">Existing Reasons</th>
                </tr>
                <?php foreach ($this->rejectionReasons as $reason): ?>
                <tr>
                    <td>
                        <form action="<?php echo(CATSUtility::getIndexName()); ?>?m=settings&amp;a=rejectionReasons" method="post" autocomplete="off">
                            <input type="hidden" name="postback" value="postback" />
                            <input type="hidden" name="action" value="update" />
                            <input type="hidden" name="reasonID" value="<?php $this->_($reason['rejectionReasonID']); ?>" />

                            <input type="text" name="label" value="<?php $this->_($reason['label']); ?>" style="width: 350px;" />
                            <input type="submit" class="button" value="Save" />
                        </form>
                    </td>
                </tr>
                <?php endforeach; ?>
            </table>

            <p class="noteUnsized">Rejection reasons cannot be deleted.</p>

            <input type="button" class="button" value="Back" onclick="document.location.href='<?php echo(CATSUtility::getIndexName()); ?>?m=settings&amp;a=administration';" />
        </div>
    </div>

<?php TemplateUtility::printFooter(); ?>

