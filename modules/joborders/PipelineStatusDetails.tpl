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
    .pipeline-status-details .ui2-table {
        width: 100%;
        table-layout: auto;
    }
    .pipeline-status-details .ui2-table th,
    .pipeline-status-details .ui2-table td {
        white-space: normal;
    }
    .pipeline-status-details .ui2-table th:nth-child(1),
    .pipeline-status-details .ui2-table td:nth-child(1) {
        width: 150px;
    }
    .pipeline-status-details .ui2-table th:nth-child(2),
    .pipeline-status-details .ui2-table td:nth-child(2) {
        min-width: 260px;
    }
    .pipeline-status-details .ui2-table th:nth-child(3),
    .pipeline-status-details .ui2-table td:nth-child(3) {
        width: 150px;
    }
    .pipeline-status-details .ui2-table th:nth-child(4),
    .pipeline-status-details .ui2-table td:nth-child(4) {
        min-width: 360px;
        word-break: break-word;
    }
    .pipeline-status-details .ui2-table th:nth-child(5),
    .pipeline-status-details .ui2-table td:nth-child(5) {
        width: 70px;
        text-align: center;
    }
    .pipeline-status-details .ui2-table th:nth-child(6),
    .pipeline-status-details .ui2-table td:nth-child(6) {
        min-width: 280px;
    }
    .pipeline-status-details .ui2-header-actions {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .pipeline-status-details .edit-mode-toggle {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: #4c5a61;
        cursor: pointer;
        user-select: none;
    }
    .pipeline-status-details .edit-mode-toggle input[type="checkbox"] {
        margin: 0;
    }
    .pipeline-status-details.edit-column-hidden .ui2-table th:nth-child(6),
    .pipeline-status-details.edit-column-hidden .ui2-table td:nth-child(6),
    .pipeline-status-details.edit-column-hidden .ui2-table col:nth-child(6) {
        display: none;
    }
    .pipeline-status-details.edit-column-hidden .pipeline-status-edit-actions {
        display: none;
    }
    .pipeline-status-details .status-pill {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 12px;
        font-weight: 600;
        line-height: 1.3;
        border: 1px solid #d1d9de;
        color: #1f2933;
        background: #f2f4f6;
        white-space: nowrap;
    }
    .pipeline-status-details .status-allocated { background: #e6f0ff; color: #1d4ed8; border-color: #c7ddff; }
    .pipeline-status-details .status-delivery-validated { background: #e6f7f4; color: #0f766e; border-color: #c5ece6; }
    .pipeline-status-details .status-proposed-to-customer { background: #f3e8ff; color: #6b21a8; border-color: #e3d0ff; }
    .pipeline-status-details .status-customer-interview { background: #fff7ed; color: #b45309; border-color: #fde0b6; }
    .pipeline-status-details .status-customer-approved { background: #eef2ff; color: #4f46e5; border-color: #d6dcff; }
    .pipeline-status-details .status-avel-approved { background: #e0f2fe; color: #0369a1; border-color: #bae6fd; }
    .pipeline-status-details .status-offer-negotiation,
    .pipeline-status-details .status-offer-negociation { background: #fff1f2; color: #c2410c; border-color: #fed7aa; }
    .pipeline-status-details .status-offer-accepted { background: #ecfdf3; color: #15803d; border-color: #bbf7d0; }
    .pipeline-status-details .status-hired { background: #dcfce7; color: #166534; border-color: #86efac; }
    .pipeline-status-details .status-rejected { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }
    .pipeline-status-details .status-unknown { background: #f2f4f6; color: #4c5a61; border-color: #d1d9de; }
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
                <?php if (!empty($this->canEditHistory)): ?>
                    <label class="edit-mode-toggle">
                        <input type="checkbox" id="toggleEditMode" />
                        Enable edit mode
                    </label>
                <?php endif; ?>
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

                            $statusFromSlug = strtolower($statusFrom);
                            $statusFromSlug = preg_replace('/[^a-z0-9]+/', '-', $statusFromSlug);
                            $statusFromSlug = trim($statusFromSlug, '-');
                            if ($statusFromSlug === '')
                            {
                                $statusFromSlug = 'unknown';
                            }
                            $statusToSlug = strtolower($statusTo);
                            $statusToSlug = preg_replace('/[^a-z0-9]+/', '-', $statusToSlug);
                            $statusToSlug = trim($statusToSlug, '-');
                            if ($statusToSlug === '')
                            {
                                $statusToSlug = 'unknown';
                            }
                            $dateEditInput = str_replace(' ', 'T', $row['dateEdit']);
                        ?>
                        <tr>
                            <td><?php $this->_($row['dateDisplay']); ?></td>
                            <td>
                                <span class="status-pill status-<?php echo($statusFromSlug); ?>">
                                    <?php $this->_($statusFrom); ?>
                                </span>
                                &nbsp;-&gt;&nbsp;
                                <span class="status-pill status-<?php echo($statusToSlug); ?>">
                                    <?php $this->_($statusTo); ?>
                                </span>
                            </td>
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
                                    <input type="hidden" name="originalDate[<?php echo((int) $row['historyID']); ?>]" value="<?php $this->_($dateEditInput); ?>" />
                                    <input type="datetime-local" step="1" name="newDate[<?php echo((int) $row['historyID']); ?>]" class="inputbox ui2-input ui2-input--sm" style="width: 190px;" value="<?php $this->_($dateEditInput); ?>" />
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
            <div class="pipeline-status-edit-actions" style="margin-top: 12px; text-align: right;">
                <button class="ui2-button ui2-button--primary" type="submit">Save Changes</button>
            </div>
        </form>
        <?php endif; ?>
    </div>
</div>

<script type="text/javascript">
    (function () {
        function resizeAndCenter() {
            var body = document.body;
            var html = document.documentElement;
            if (!body || !html || !window.resizeTo) return;

            var contentWidth = Math.max(
                body.scrollWidth, body.offsetWidth,
                html.clientWidth, html.scrollWidth, html.offsetWidth
            );
            var contentHeight = Math.max(
                body.scrollHeight, body.offsetHeight,
                html.clientHeight, html.scrollHeight, html.offsetHeight
            );

            var chromeWidth = window.outerWidth - window.innerWidth;
            var chromeHeight = window.outerHeight - window.innerHeight;
            if (isNaN(chromeWidth) || chromeWidth < 0) chromeWidth = 16;
            if (isNaN(chromeHeight) || chromeHeight < 0) chromeHeight = 88;

            var targetWidth = Math.min(Math.max(contentWidth + chromeWidth + 40, 980), screen.availWidth - 40);
            var targetHeight = Math.min(Math.max(contentHeight + chromeHeight + 20, 520), screen.availHeight - 40);

            try {
                window.resizeTo(targetWidth, targetHeight);
            } catch (e) {}

            if (window.moveTo) {
                var left = Math.max(0, Math.floor((screen.availWidth - targetWidth) / 2));
                var top = Math.max(0, Math.floor((screen.availHeight - targetHeight) / 2));
                try { window.moveTo(left, top); } catch (e) {}
            }
        }

        if (document.readyState === 'complete') {
            resizeAndCenter();
        } else {
            window.addEventListener('load', resizeAndCenter);
        }
        setTimeout(resizeAndCenter, 150);
        setTimeout(resizeAndCenter, 400);

        function setEditMode(enabled) {
            var container = document.querySelector('.pipeline-status-details');
            if (!container) return;
            container.classList.toggle('edit-column-hidden', !enabled);
        }

        function setupEditModeToggle() {
            var toggle = document.getElementById('toggleEditMode');
            if (!toggle) {
                return;
            }
            setEditMode(false);
            toggle.checked = false;
            toggle.addEventListener('change', function () {
                setEditMode(!!toggle.checked);
            });
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupEditModeToggle);
        } else {
            setupEditModeToggle();
        }
    })();
</script>

    </body>
</html>

