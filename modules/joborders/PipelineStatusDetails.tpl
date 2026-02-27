<?php /* Pipeline Status Details */ ?>
<?php TemplateUtility::printModalHeader('Job Orders', array(), 'Pipeline Status Details'); ?>

<style type="text/css">
    .pipeline-status-details {
        font-size: 13px;
        line-height: 1.35;
        color: #1f3340;
        max-width: 1360px;
        margin: 0 auto;
        padding: 8px;
    }
    .pipeline-status-details .ui2-card {
        border: 1px solid #d8e5ec;
        border-radius: 12px;
        background: #ffffff;
        box-shadow: 0 1px 3px rgba(13, 45, 72, 0.06);
        overflow: hidden;
    }
    .pipeline-status-details .ui2-header {
        border: 0;
        background: linear-gradient(120deg, #f7fcff 0%, #eef7fd 100%);
        border-bottom: 1px solid #d8e5ec;
        padding: 12px;
        margin: 0;
    }
    .pipeline-status-details .ui2-header h2 {
        font-size: 20px;
        color: #0d4c64;
        margin: 0;
    }
    .pipeline-status-details .ui2-header-actions {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
    }
    .pipeline-status-details .ui2-muted {
        color: #587281;
    }
    .pipeline-status-details .ui2-input {
        font-size: 12px;
        padding: 5px 8px;
    }
    .pipeline-status-details .ui2-button {
        font-size: 12px;
        padding: 5px 10px;
    }
    .pipeline-status-summary {
        display: grid;
        grid-template-columns: repeat(4, minmax(160px, 1fr));
        gap: 10px;
        margin: 12px;
    }
    .pipeline-status-summary-card {
        border: 1px solid #d8e5ec;
        border-radius: 10px;
        background: #ffffff;
        padding: 9px 10px;
    }
    .pipeline-status-summary-label {
        font-size: 11px;
        color: #4f6c79;
    }
    .pipeline-status-summary-value {
        font-size: 24px;
        font-weight: 700;
        color: #0b4c66;
        line-height: 1.1;
    }
    .pipeline-status-summary-meta {
        margin-top: 3px;
        font-size: 11px;
        color: #607986;
    }
    .pipeline-status-summary-value--compact {
        font-size: 16px;
        line-height: 1.2;
        font-weight: 600;
    }
    .pipeline-status-details .ui2-table {
        width: calc(100% - 24px);
        margin: 0 12px 12px 12px;
        table-layout: fixed;
        border: 1px solid #dce7ef;
        border-radius: 10px;
        overflow: hidden;
    }
    .pipeline-status-details .ui2-table thead th {
        position: sticky;
        top: 0;
        z-index: 1;
        background: #0f6886;
        color: #ffffff;
        border-color: #0f6886;
    }
    .pipeline-status-details .ui2-table th,
    .pipeline-status-details .ui2-table td {
        white-space: normal;
        vertical-align: top;
    }
    .pipeline-status-details .ui2-table td {
        font-size: 13px;
        border-color: #dce7ef;
    }
    .pipeline-status-details .ui2-table tbody tr:nth-child(even) td {
        background: #f9fcfe;
    }
    .pipeline-status-details .ui2-table th:nth-child(1),
    .pipeline-status-details .ui2-table td:nth-child(1) {
        width: 14%;
    }
    .pipeline-status-details .ui2-table th:nth-child(2),
    .pipeline-status-details .ui2-table td:nth-child(2) {
        width: 17%;
    }
    .pipeline-status-details .ui2-table th:nth-child(3),
    .pipeline-status-details .ui2-table td:nth-child(3) {
        width: 12%;
    }
    .pipeline-status-details .ui2-table th:nth-child(4),
    .pipeline-status-details .ui2-table td:nth-child(4) {
        width: 31%;
        word-break: break-word;
        overflow-wrap: anywhere;
    }
    .pipeline-status-details .ui2-table th:nth-child(5),
    .pipeline-status-details .ui2-table td:nth-child(5) {
        width: 8%;
        text-align: center;
    }
    .pipeline-status-details .ui2-table th:nth-child(6),
    .pipeline-status-details .ui2-table td:nth-child(6) {
        width: 18%;
    }
    .pipeline-status-details .pipeline-auto-pill {
        display: inline-block;
        border-radius: 999px;
        padding: 2px 8px;
        font-size: 11px;
        font-weight: 700;
        border: 1px solid #d4e0e7;
        background: #f4f8fb;
        color: #4a6270;
    }
    .pipeline-status-details .pipeline-auto-pill--yes {
        background: #e8f7ef;
        border-color: #b7e1c8;
        color: #1f6f3c;
    }
    .pipeline-status-details .pipeline-auto-pill--no {
        background: #f3f6f9;
        border-color: #d4dde5;
        color: #607281;
    }
    .pipeline-status-details .edit-cell {
        min-width: 0;
    }
    .pipeline-status-details .edit-input-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    .pipeline-status-details .edit-date-input,
    .pipeline-status-details .edit-note-input {
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
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
    .pipeline-status-details .pipeline-note-block {
        margin-top: 4px;
        padding: 5px 7px;
        border-radius: 8px;
        background: #f4f8fb;
        border: 1px solid #dbe6ee;
    }
    .pipeline-status-details .pipeline-status-edit-actions {
        margin: 0 12px 12px 12px;
        text-align: right;
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
    @media (max-width: 1200px) {
        .pipeline-status-summary {
            grid-template-columns: repeat(2, minmax(160px, 1fr));
        }
    }
    @media (max-width: 760px) {
        .pipeline-status-summary {
            grid-template-columns: 1fr;
        }
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

        <?php
            $historyRows = is_array($this->statusHistoryRS) ? $this->statusHistoryRS : array();
            $totalTransitions = count($historyRows);
            $autoTransitions = 0;
            $editedTransitions = 0;
            $latestTransitionRaw = '';
            $latestTransitionDisplay = '--';

            foreach ($historyRows as $row)
            {
                $commentForMeta = trim($row['commentText']);
                $isAutoTransition = false;
                if ($commentForMeta !== '' && strpos($commentForMeta, '[AUTO] ') === 0)
                {
                    $isAutoTransition = true;
                }
                if ((int) $row['commentIsSystem'] === 1)
                {
                    $isAutoTransition = true;
                }

                if ($isAutoTransition)
                {
                    $autoTransitions++;
                }
                if (!empty($row['editedAt']))
                {
                    $editedTransitions++;
                }
                if (!empty($row['dateRaw']) && (empty($latestTransitionRaw) || strcmp($row['dateRaw'], $latestTransitionRaw) > 0))
                {
                    $latestTransitionRaw = $row['dateRaw'];
                    $latestTransitionDisplay = $row['dateDisplay'];
                }
            }

            $autoRate = 0;
            if ($totalTransitions > 0)
            {
                $autoRate = (int) round(($autoTransitions * 100) / $totalTransitions);
            }
        ?>

        <div class="pipeline-status-summary">
            <div class="pipeline-status-summary-card">
                <div class="pipeline-status-summary-label">Total transitions</div>
                <div class="pipeline-status-summary-value"><?php echo((int) $totalTransitions); ?></div>
                <div class="pipeline-status-summary-meta">Timeline events recorded</div>
            </div>
            <div class="pipeline-status-summary-card">
                <div class="pipeline-status-summary-label">Auto transitions</div>
                <div class="pipeline-status-summary-value"><?php echo((int) $autoTransitions); ?></div>
                <div class="pipeline-status-summary-meta"><?php echo((int) $autoRate); ?>% system-generated</div>
            </div>
            <div class="pipeline-status-summary-card">
                <div class="pipeline-status-summary-label">Edited entries</div>
                <div class="pipeline-status-summary-value"><?php echo((int) $editedTransitions); ?></div>
                <div class="pipeline-status-summary-meta">Audit trail corrections</div>
            </div>
            <div class="pipeline-status-summary-card">
                <div class="pipeline-status-summary-label">Latest transition</div>
                <div class="pipeline-status-summary-value pipeline-status-summary-value--compact"><?php $this->_($latestTransitionDisplay); ?></div>
                <div class="pipeline-status-summary-meta">Most recent status change</div>
            </div>
        </div>
        <table class="ui2-table">
            <thead>
                <tr>
                    <th>Timestamp</th>
                    <th>From -&gt; To</th>
                    <th>Entered By</th>
                    <th>Comment</th>
                    <th>Origin</th>
                    <?php if (!empty($this->canEditHistory)): ?>
                        <th>Edit</th>
                    <?php endif; ?>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($historyRows)): ?>
                    <tr>
                        <td colspan="<?php echo(!empty($this->canEditHistory) ? 6 : 5); ?>">No status history entries found.</td>
                    </tr>
                <?php else: ?>
                    <?php foreach ($historyRows as $row): ?>
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

                                <?php if (!empty($row['rejectionReasons']) || !empty($row['rejectionReasonOther'])): ?>
                                    <div class="pipeline-note-block">
                                        <?php if (!empty($row['rejectionReasons'])): ?>
                                            <div class="ui2-muted">Rejection reasons: <?php $this->_($row['rejectionReasons']); ?></div>
                                        <?php endif; ?>
                                        <?php if (!empty($row['rejectionReasonOther'])): ?>
                                            <div class="ui2-muted">Other reason: <?php $this->_($row['rejectionReasonOther']); ?></div>
                                        <?php endif; ?>
                                    </div>
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
                                    <div class="pipeline-note-block ui2-muted">
                                        Edited by <?php $this->_($editedByName); ?>
                                        on <?php $this->_($row['editedAtDisplay']); ?>:
                                        <?php $this->_($editNote); ?>
                                    </div>
                                <?php endif; ?>
                            </td>
                            <td>
                                <span class="pipeline-auto-pill <?php echo($auto ? 'pipeline-auto-pill--yes' : 'pipeline-auto-pill--no'); ?>">
                                    <?php echo($auto ? 'Auto' : 'Manual'); ?>
                                </span>
                            </td>
                            <?php if (!empty($this->canEditHistory)): ?>
                                <td>
                                    <div class="edit-cell">
                                        <input type="hidden" name="historyID[]" value="<?php echo((int) $row['historyID']); ?>" />
                                        <input type="hidden" name="originalDate[<?php echo((int) $row['historyID']); ?>]" value="<?php $this->_($dateEditInput); ?>" />
                                        <div class="edit-input-group">
                                            <input type="datetime-local" step="1" name="newDate[<?php echo((int) $row['historyID']); ?>]" class="inputbox ui2-input ui2-input--sm edit-date-input" value="<?php $this->_($dateEditInput); ?>" />
                                            <input type="text" name="editNote[<?php echo((int) $row['historyID']); ?>]" class="inputbox ui2-input ui2-input--sm edit-note-input" placeholder="Edit note (optional)" />
                                        </div>
                                    </div>
                                </td>
                            <?php endif; ?>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
        <?php if (!empty($this->canEditHistory)): ?>
            <div class="pipeline-status-edit-actions">
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

            var targetWidth = Math.min(Math.max(contentWidth + chromeWidth + 40, 1180), screen.availWidth - 40);
            var targetHeight = Math.min(Math.max(contentHeight + chromeHeight + 20, 620), screen.availHeight - 40);

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

