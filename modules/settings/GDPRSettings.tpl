<?php /* GDPR Settings configuration */ ?>
<?php TemplateUtility::printHeader('Settings'); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active, $this->subActive); ?>

    <div id="main">
        <?php TemplateUtility::printQuickSearch(); ?>

        <div id="contents">
            <table>
                <tr>
                    <td width="3%">
                        <img src="images/settings.gif" width="24" height="24" alt="Settings" style="border: none; margin-top: 3px;" />&nbsp;
                    </td>
                    <td><h2>Settings: Administration</h2></td>
                </tr>
            </table>

            <p class="note">GDPR Settings</p>

            <?php if ($this->gdprSaved): ?>
                <p class="noteGood">GDPR settings saved successfully.</p>
            <?php endif; ?>

            <table class="searchTable" width="100%">
                <tr>
                    <td>
                        <form action="<?php echo(CATSUtility::getIndexName()); ?>?m=settings&amp;a=gdprSettings" method="post" autocomplete="off">
                            <input type="hidden" name="postback" value="postback" />

                            <label for="gdprExpirationYears">Consent expiration (years):</label><br />
                            <input type="text" name="gdprExpirationYears" id="gdprExpirationYears" value="<?php $this->_($this->gdprSettings['gdprExpirationYears']); ?>" style="width: 60px;" />
                            <span class="noteUnsized">This value is used to pre-fill the GDPR expiration date when adding new candidates.</span>

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
