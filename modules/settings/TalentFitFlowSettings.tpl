<?php /* TalentFitFlow Settings */ ?>
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

            <p class="note">TalentFitFlow Integration</p>

            <?php if ($this->tffSaved): ?>
                <p class="noteGood">TalentFitFlow settings saved successfully.</p>
            <?php endif; ?>
            <?php if (isset($this->tffTestMessage)): ?>
                <?php if ($this->tffTestOk): ?>
                    <p class="noteGood"><?php $this->_($this->tffTestMessage); ?></p>
                <?php else: ?>
                    <p class="warning"><?php $this->_($this->tffTestMessage); ?></p>
                <?php endif; ?>
            <?php endif; ?>

            <table class="searchTable" width="100%">
                <tr>
                    <td>
                        <form action="<?php echo(CATSUtility::getIndexName()); ?>?m=settings&amp;a=talentFitFlowSettings" method="post" autocomplete="off">
                            <input type="hidden" name="postback" value="postback" />

                            <label for="baseUrl">Base URL:</label><br />
                            <input type="text" name="baseUrl" id="baseUrl" value="<?php $this->_($this->tffSettings['baseUrl']); ?>" style="width: 350px;" />
                            <div class="noteUnsized">Leave blank to use `TALENTFIT_BASE_URL` from the environment.</div>

                            <br /><br />

                            <label for="apiKey">API Key:</label><br />
                            <input type="text" name="apiKey" id="apiKey" value="<?php $this->_($this->tffSettings['apiKey']); ?>" style="width: 350px;" />
                            <div class="noteUnsized">Leave blank to use `OPENCATS_API_KEY` from the environment.</div>

                            <br /><br />

                            <label for="hmacSecret">HMAC Secret:</label><br />
                            <input type="password" name="hmacSecret" id="hmacSecret" value="<?php $this->_($this->tffSettings['hmacSecret']); ?>" style="width: 350px;" />
                            <div class="noteUnsized">Leave blank to use `OPENCATS_HMAC_SECRET` from the environment.</div>

                            <br /><br />

                            <input type="submit" class="button" value="Save Settings" />
                            <input type="submit" class="button" name="testConnection" value="Test Connection" />
                            <input type="button" class="button" value="Back" onclick="document.location.href='<?php echo(CATSUtility::getIndexName()); ?>?m=settings&amp;a=administration';" />
                        </form>
                    </td>
                </tr>
            </table>

        </div>
    </div>

<?php TemplateUtility::printFooter(); ?>

