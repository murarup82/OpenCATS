<?php /* $Id: RemoveFromPipeline.tpl 1 2026-01-13 $ */ ?>
<?php TemplateUtility::printHeader('Candidates'); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active); ?>
    <div id="main">
        <?php TemplateUtility::printQuickSearch(); ?>

        <div id="contents">
            <table>
                <tr>
                    <td width="3%">
                        <img src="images/candidate.gif" width="24" height="24" border="0" alt="Candidates" style="margin-top: 3px;" />&nbsp;
                    </td>
                    <td><h2>Candidates: Remove from Job Order</h2></td>
               </tr>
            </table>

            <form action="<?php echo(CATSUtility::getIndexName()); ?>?m=candidates&amp;a=removeFromPipeline" method="post">
                <input type="hidden" name="candidateID" value="<?php echo((int) $this->candidateID); ?>" />
                <input type="hidden" name="jobOrderID" value="<?php echo((int) $this->jobOrderID); ?>" />
                <table class="editTable" width="560">
                    <tr>
                        <td class="tdVertical">
                            <label for="comment">Removal Comment:</label>
                        </td>
                        <td class="tdData">
                            <textarea name="comment" id="comment" cols="50" rows="4" style="width:375px;" class="inputbox"></textarea>
                        </td>
                    </tr>
                    <tr>
                        <td class="tdVertical"></td>
                        <td class="tdData">
                            <input type="submit" class="button" value="Remove" />
                            &nbsp;
                            <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=candidates&amp;a=show&amp;candidateID=<?php echo((int) $this->candidateID); ?>">Cancel</a>
                        </td>
                    </tr>
                </table>
            </form>
        </div>
    </div>
<?php TemplateUtility::printFooter(); ?>
