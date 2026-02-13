<?php /* Google OIDC Settings */ ?>
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

            <p class="note">Google SSO / Access Request</p>

            <?php if ($this->googleOIDCSaved): ?>
                <p class="noteGood">Google SSO settings saved successfully.</p>
            <?php endif; ?>

            <table class="searchTable" width="100%">
                <tr>
                    <td>
                        <form action="<?php echo(CATSUtility::getIndexName()); ?>?m=settings&amp;a=googleOIDCSettings" method="post" autocomplete="off">
                            <input type="hidden" name="postback" value="postback" />

                            <label>
                                <input type="checkbox" name="enabled" value="1" <?php if ($this->googleOIDCSettings['enabled'] == '1'): ?>checked="checked"<?php endif; ?> />
                                Enable Google Sign-In
                            </label>

                            <br /><br />

                            <label for="clientId">Google OAuth Client ID:</label><br />
                            <input type="text" name="clientId" id="clientId" value="<?php $this->_($this->googleOIDCSettings['clientId']); ?>" style="width: 480px;" />

                            <br /><br />

                            <label for="clientSecret">Google OAuth Client Secret:</label><br />
                            <input type="password" name="clientSecret" id="clientSecret" value="<?php $this->_($this->googleOIDCSettings['clientSecret']); ?>" style="width: 480px;" />

                            <br /><br />

                            <label for="redirectUri">Redirect URI (optional override):</label><br />
                            <input type="text" name="redirectUri" id="redirectUri" value="<?php $this->_($this->googleOIDCSettings['redirectUri']); ?>" style="width: 480px;" />
                            <div class="noteUnsized">If blank, OpenCATS auto-generates: `index.php?m=login&amp;a=googleCallback`.</div>

                            <br /><br />

                            <label for="hostedDomain">Allowed Google Workspace domain(s):</label><br />
                            <input type="text" name="hostedDomain" id="hostedDomain" value="<?php $this->_($this->googleOIDCSettings['hostedDomain']); ?>" style="width: 280px;" />
                            <div class="noteUnsized">Single domain or multiple separated by comma (for example: `aveltechnologies.com`).</div>

                            <br /><br />

                            <label for="siteId">Default OpenCATS Site ID:</label><br />
                            <input type="text" name="siteId" id="siteId" value="<?php $this->_($this->googleOIDCSettings['siteId']); ?>" style="width: 80px;" />

                            <br /><br />

                            <label>
                                <input type="checkbox" name="autoProvisionEnabled" value="1" <?php if ($this->googleOIDCSettings['autoProvisionEnabled'] == '1'): ?>checked="checked"<?php endif; ?> />
                                Enable access request auto-provisioning
                            </label>

                            <br /><br />

                            <label for="notifyEmail">Access request notification recipient:</label><br />
                            <input type="text" name="notifyEmail" id="notifyEmail" value="<?php $this->_($this->googleOIDCSettings['notifyEmail']); ?>" style="width: 320px;" />

                            <br /><br />

                            <label for="fromEmail">Access request e-mail From address:</label><br />
                            <input type="text" name="fromEmail" id="fromEmail" value="<?php $this->_($this->googleOIDCSettings['fromEmail']); ?>" style="width: 320px;" />

                            <br /><br />

                            <label for="requestSubject">Access request e-mail subject:</label><br />
                            <input type="text" name="requestSubject" id="requestSubject" value="<?php $this->_($this->googleOIDCSettings['requestSubject']); ?>" style="width: 480px;" />

                            <br /><br />

                            <input type="submit" class="button" value="Save Settings" />
                            <input type="submit" class="button" name="testConfig" value="Test Google Config" />
                            <input type="button" class="button" value="Back" onclick="document.location.href='<?php echo(CATSUtility::getIndexName()); ?>?m=settings&amp;a=administration';" />

                            <?php if (isset($this->googleOIDCTestMessage)): ?>
                                <br /><br />
                                <?php if ($this->googleOIDCTestOk): ?>
                                    <p class="noteGood"><?php $this->_($this->googleOIDCTestMessage); ?></p>
                                <?php else: ?>
                                    <p class="warning"><?php $this->_($this->googleOIDCTestMessage); ?></p>
                                <?php endif; ?>
                            <?php endif; ?>
                        </form>
                    </td>
                </tr>
            </table>
        </div>
    </div>

<?php TemplateUtility::printFooter(); ?>
