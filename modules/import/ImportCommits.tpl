<?php /* Retired legacy template kept for backward URL compatibility. */ ?>
<?php TemplateUtility::printHeader('Import'); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active); ?>
    <div id="main">
        <?php TemplateUtility::printQuickSearch(); ?>

        <div id="contents"<?php echo TemplateUtility::getUI2WrapperAttribute(); ?>>
            <p class="note">Import: Legacy Commit Page Retired</p>
            <table class="searchTable" width="100%">
                <tr>
                    <td>
                        This page is no longer used by the current import workflow.
                        <br /><br />
                        Use the active Import pages to review pending imports, revert, and continue processing.
                        <br /><br />
                        <a class="button" href="<?php echo(CATSUtility::getIndexName()); ?>?m=import&amp;a=viewpending">Open Pending Imports</a>
                        &nbsp;
                        <a class="button" href="<?php echo(CATSUtility::getIndexName()); ?>?m=import">Open Import Home</a>
                    </td>
                </tr>
            </table>
        </div>
    </div>
<?php TemplateUtility::printFooter(); ?>
