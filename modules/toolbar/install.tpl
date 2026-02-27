<?php /* Legacy toolbar installer has been retired. */ ?>
<?php TemplateUtility::printHeader('Toolbar (Retired)'); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active); ?>
    <div id="main">
        <?php TemplateUtility::printQuickSearch(''); ?>
        <div id="contents"<?php echo TemplateUtility::getUI2WrapperAttribute(); ?> style="text-align:center;">
            <h2>
                <img src="images/search.gif" width="24" height="24" border="0" alt="Toolbar" style="margin-top: 3px;" />
                &nbsp;&nbsp;Legacy Firefox Toolbar Retired
            </h2>

            <table class="searchTable" style="max-width: 760px; margin: 18px auto; text-align: left;">
                <tr>
                    <td>
                        The old Firefox toolbar integration is no longer supported and the installer package is not distributed anymore.
                        <br /><br />
                        Recommended alternatives in current OpenCATS:
                        <ul>
                            <li>Use Candidate and Job Order quick actions directly in the web app.</li>
                            <li>Use Assignment Workspace for faster candidate/job linking.</li>
                            <li>Use Import and Search flows available from the main navigation.</li>
                        </ul>
                        <a class="button" href="<?php echo(CATSUtility::getIndexName()); ?>?m=candidates&amp;a=search">Open Candidates</a>
                        &nbsp;
                        <a class="button" href="<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=search">Open Job Orders</a>
                    </td>
                </tr>
            </table>
        </div>
    </div>
<?php TemplateUtility::printFooter(); ?>
