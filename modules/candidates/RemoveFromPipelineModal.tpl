<?php /* $Id: RemoveFromPipelineModal.tpl 1 2026-01-13 $ */ ?>
<?php TemplateUtility::printModalHeader('Candidates', array(), 'Reject from Job Order'); ?>

<style type="text/css">
    .pipeline-remove-modal {
        padding: 8px;
        color: #1f3440;
    }
    .pipeline-remove-modal form {
        max-width: 680px;
        margin: 0 auto;
    }
    .pipeline-remove-modal .ui2-card {
        border: 1px solid #d8e5ec;
        border-radius: 12px;
        background: #ffffff;
        box-shadow: 0 1px 3px rgba(13, 45, 72, 0.06);
        overflow: hidden;
        margin: 0;
    }
    .pipeline-remove-modal .pipeline-remove-header {
        padding: 12px 14px;
        border-bottom: 1px solid #d8e5ec;
        background: linear-gradient(120deg, #f7fcff 0%, #eef7fd 100%);
    }
    .pipeline-remove-modal .pipeline-remove-title {
        font-size: 20px;
        line-height: 1.2;
        font-weight: 700;
        color: #0d4c64;
        margin: 0;
    }
    .pipeline-remove-modal .pipeline-remove-subtitle {
        margin-top: 5px;
        color: #597583;
        font-size: 12px;
    }
    .pipeline-remove-modal .pipeline-remove-body {
        padding: 12px 14px 6px 14px;
    }
    .pipeline-remove-modal .pipeline-remove-label {
        display: block;
        margin-bottom: 6px;
        font-weight: 700;
        color: #355b6b;
    }
    .pipeline-remove-modal textarea {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid #c8d8e3;
        border-radius: 8px;
        padding: 8px 10px;
        min-height: 100px;
        background: #ffffff;
    }
    .pipeline-remove-modal .pipeline-remove-actions {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 8px;
        padding: 10px 14px 14px 14px;
        border-top: 1px solid #e1ebf2;
    }
</style>

<div class="ui2 ui2-theme-avel pipeline-remove-modal">
    <form action="<?php echo(CATSUtility::getIndexName()); ?>?m=candidates&amp;a=removeFromPipeline" method="post">
        <input type="hidden" name="candidateID" value="<?php echo((int) $this->candidateID); ?>" />
        <input type="hidden" name="jobOrderID" value="<?php echo((int) $this->jobOrderID); ?>" />
        <input type="hidden" name="display" value="popup" />

        <div class="ui2-card ui2-card--section">
            <div class="pipeline-remove-header">
                <h2 class="pipeline-remove-title">Reject from Job Order</h2>
                <div class="pipeline-remove-subtitle">This candidate will be marked as rejected for the selected job order.</div>
            </div>

            <div class="pipeline-remove-body">
                <label class="pipeline-remove-label" for="comment">Rejection Comment (optional)</label>
                <textarea name="comment" id="comment" class="inputbox" placeholder="Add context for this rejection to help team visibility."></textarea>
            </div>

            <div class="pipeline-remove-actions">
                <a href="javascript:void(0);" class="ui2-button ui2-button--secondary" onclick="hidePopWin(); return false;">Cancel</a>
                <input type="submit" class="button ui2-button ui2-button--danger" value="Reject Candidate" />
            </div>
        </div>
    </form>
</div>
