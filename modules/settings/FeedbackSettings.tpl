<?php /* Feedback Settings configuration */ ?>
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

            <p class="note">Feedback Settings</p>

            <?php if ($this->feedbackSaved): ?>
                <p class="noteGood">Feedback settings saved successfully.</p>
            <?php endif; ?>

            <table class="searchTable" width="100%">
                <tr>
                    <td>
                        <form action="<?php echo(CATSUtility::getIndexName()); ?>?m=settings&amp;a=feedbackSettings" method="post" autocomplete="off">
                            <input type="hidden" name="postback" value="postback" />

                            <label for="feedbackRecipientUserID">Feedback recipient user:</label><br />
                            <select name="feedbackRecipientUserID" id="feedbackRecipientUserID" style="min-width: 320px;">
                                <option value="0"<?php if ((int) $this->feedbackRecipientUserID <= 0) echo(' selected="selected"'); ?>>-- Not configured --</option>
                                <?php foreach ($this->recipientOptions as $recipientOption): ?>
                                    <option value="<?php echo((int) $recipientOption['userID']); ?>"<?php if ((int) $this->feedbackRecipientUserID === (int) $recipientOption['userID']) echo(' selected="selected"'); ?>>
                                        <?php $this->_($recipientOption['fullName']); ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                            <span class="noteUnsized">The global footer feedback button sends a note to this user.</span>

                            <br /><br />

                            <input type="submit" class="button" value="Save Settings" />
                            <input type="button" class="button" value="Back" onclick="document.location.href='<?php echo(CATSUtility::getIndexName()); ?>?m=settings&amp;a=administration';" />
                        </form>
                    </td>
                </tr>
            </table>

        </div>
    </div>

<?php TemplateUtility::printFooter(); ?>

