<?php /* Pipeline Status Details */ ?>
<?php TemplateUtility::printModalHeader('Job Orders', array(), 'Pipeline Status Details'); ?>

<style type="text/css">
    .pipeline-status-details {
        font-size: 13px;
        line-height: 1.35;
    }
    .pipeline-status-details .ui2-header h2 {
        font-size: 18px;
    }
    .pipeline-status-details .ui2-table td {
        font-size: 13px;
    }
    .pipeline-status-details .ui2-input {
        font-size: 12px;
        padding: 5px 8px;
    }
    .pipeline-status-details .ui2-button {
        font-size: 12px;
        padding: 5px 10px;
    }
</style>

<div class="ui2 ui2-theme-avel pipeline-status-details">
    <div class="ui2-card ui2-card--section">
        <div class="ui2-header">
            <div class="ui2-header-title">
                <h2>Pipeline Status Details</h2>
                <div class="ui2-muted" style="margin-top: 4px;">
                    Candidate:
                    <?php $this->_($this->pipelineData['candidateFirstName']); ?>
                    <?php $this->_($this->pipelineData['candidateLastName']); ?>
                    &nbsp;|&nbsp;
                    Job Order: <?php $this->_($this->pipelineData['jobOrderTitle']); ?>
                    <?php if (!empty($this->pipelineData['companyName'])): ?>
                        &nbsp;|&nbsp;
                        Company: <?php $this->_($this->pipelineData['companyName']); ?>
                    <?php endif; ?>
                </div>
            </div>
            <div class="ui2-header-actions">
                <a class="ui2-button ui2-button--secondary" href="#" onclick="window.close(); return false;">Close</a>
            </div>
        </div>

        <?php if (!empty($this->canEditHistory)): ?>
        <form id="pipelineStatusEditForm" method="post" action="<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=pipelineStatusEditDate">
            <input type="hidden" name="postback" value="postback" />
            <input type="hidden" name="pipelineID" value="<?php echo((int) $this->pipelineID); ?>" />
        <?php endif; ?>
        <table class="ui2-table">
            <thead>
                <tr>
                    <th>Timestamp</th>
                    <th>From -&gt; To</th>
                    <th>Entered By</th>
                    <th>Comment</th>
                    <th>Auto?</th>
                    <th>Edit</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($this->statusHistoryRS)): ?>
                    <tr>
                        <td colspan="6">No status history entries found.</td>
                    </tr>
                <?php else: ?>
                    <?php foreach ($this->statusHistoryRS as $row): ?>
                        <?php
                            $comment = trim($row['commentText']);
                            $auto = false;
                            if ($comment !== '' && strpos($comment, '[AUTO] ') === 0)
                            {
                                $auto = true;
                            }
                            if ((int) $row['commentIsSystem'] === 1)
                            {
                                $auto = true;
                            }

                            $enteredByName = trim($row['enteredByFirstName'] . ' ' . $row['enteredByLastName']);
                            if ($enteredByName === '')
                            {
                                $enteredByName = '--';
                            }

                            $statusFrom = $row['statusFrom'];
                            $statusTo = $row['statusTo'];
                            if ($statusFrom === null || $statusFrom === '')
                            {
                                $statusFrom = 'None';
                            }
                            if ($statusTo === null || $statusTo === '')
                            {
                                $statusTo = 'None';
                            }
                        ?>
                        <tr>
                            <td><?php $this->_($row['dateDisplay']); ?></td>
                            <td><?php $this->_($statusFrom); ?> -&gt; <?php $this->_($statusTo); ?></td>
                            <td><?php $this->_($enteredByName); ?></td>
                            <td>
                                <?php if ($comment !== ''): ?>
                                    <div><?php echo nl2br(htmlspecialchars($comment)); ?></div>
                                <?php else: ?>
                                    <span class="ui2-muted">--</span>
                                <?php endif; ?>

                                <?php if (!empty($row['rejectionReasons'])): ?>
                                    <div class="ui2-muted">Rejection reasons: <?php $this->_($row['rejectionReasons']); ?></div>
                                <?php endif; ?>

                                <?php if (!empty($row['rejectionReasonOther'])): ?>
                                    <div class="ui2-muted">Other reason: <?php $this->_($row['rejectionReasonOther']); ?></div>
                                <?php endif; ?>

                                <?php if (!empty($row['editedAt'])): ?>
                                    <?php
                                        $editedByName = trim($row['editedByFirstName'] . ' ' . $row['editedByLastName']);
                                        if ($editedByName === '')
                                        {
                                            $editedByName = 'Unknown';
                                        }
                                        $editNote = trim($row['editNote']);
                                        if ($editNote === '')
                                        {
                                            $editNote = '(No edit note)';
                                        }
                                    ?>
                                    <div class="ui2-muted">
                                        Edited by <?php $this->_($editedByName); ?>
                                        on <?php $this->_($row['editedAtDisplay']); ?>:
                                        <?php $this->_($editNote); ?>
                                    </div>
                                <?php endif; ?>
                            </td>
                            <td><?php echo($auto ? 'Yes' : 'No'); ?></td>
                            <td>
                                <?php if (!empty($this->canEditHistory)): ?>
                                    <input type="hidden" name="historyID[]" value="<?php echo((int) $row['historyID']); ?>" />
                                    <input type="hidden" name="originalDate[<?php echo((int) $row['historyID']); ?>]" value="<?php $this->_($row['dateEdit']); ?>" />
                                    <input type="text" name="newDate[<?php echo((int) $row['historyID']); ?>]" class="inputbox ui2-input ui2-input--sm" style="width: 170px;" value="<?php $this->_($row['dateEdit']); ?>" placeholder="YYYY-MM-DD HH:MM:SS" />
                                    <input type="text" name="editNote[<?php echo((int) $row['historyID']); ?>]" class="inputbox ui2-input ui2-input--sm" style="width: 200px;" placeholder="Edit note (optional)" />
                                <?php else: ?>
                                    <span class="ui2-muted">--</span>
                                <?php endif; ?>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
        <?php if (!empty($this->canEditHistory)): ?>
            <div style="margin-top: 12px; text-align: right;">
                <button class="ui2-button ui2-button--primary" type="submit">Save Changes</button>
            </div>
        </form>
        <?php endif; ?>
    </div>
</div>

    </body>
</html>

