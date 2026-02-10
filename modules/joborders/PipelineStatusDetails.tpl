<?php /* Pipeline Status Details */ ?>
<?php TemplateUtility::printModalHeader('Job Orders', array(), 'Pipeline Status Details'); ?>

<div class="ui2">
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

        <table class="ui2-table">
            <thead>
                <tr>
                    <th>Timestamp</th>
                    <th>From → To</th>
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
                            <td><?php $this->_($statusFrom); ?> → <?php $this->_($statusTo); ?></td>
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
                                <?php if (!empty($this->canEditHistory) && !empty($this->featureFlagEditHistory)): ?>
                                    <button class="ui2-button ui2-button--secondary" type="button" disabled="disabled">Edit</button>
                                <?php else: ?>
                                    <span class="ui2-muted">--</span>
                                <?php endif; ?>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

    </body>
</html>
