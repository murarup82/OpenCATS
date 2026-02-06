<?php /* $Id: RemoveFromPipelineModal.tpl 1 2026-01-13 $ */ ?>
<?php TemplateUtility::printModalHeader('Job Orders', array(), 'Reject Candidate'); ?>

<form action="<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=removeFromPipeline" method="post">
    <input type="hidden" name="candidateID" value="<?php echo((int) $this->candidateID); ?>" />
    <input type="hidden" name="jobOrderID" value="<?php echo((int) $this->jobOrderID); ?>" />
    <input type="hidden" name="display" value="popup" />
    <table class="editTable" width="500">
        <tr>
            <td class="tdVertical">
                <label for="comment">Rejection Comment (optional):</label>
            </td>
            <td class="tdData">
                <textarea name="comment" id="comment" cols="50" rows="4" style="width:300px;" class="inputbox"></textarea>
            </td>
        </tr>
        <tr>
            <td class="tdVertical"></td>
            <td class="tdData">
                <input type="submit" class="button ui2-button--danger" value="Reject" />
                &nbsp;
                <a href="javascript:void(0);" onclick="hidePopWin();">Cancel</a>
            </td>
        </tr>
    </table>
</form>
