<?php TemplateUtility::printModalHeader('Job Orders', array('js/assignmentWorkspace.js'), 'Assignment Workspace: Add Candidate to This Job Order'); ?>

<?php if (!$this->isFinishedMode): ?>
    <style type="text/css">
        .assignmentWorkspaceShell
        {
            padding: 8px;
        }

        .assignmentWorkspaceHeader
        {
            margin-bottom: 10px;
        }

        .assignmentWorkspaceHeader h3
        {
            margin: 0 0 5px 0;
            color: #114d6f;
        }

        .assignmentWorkspaceHeader p
        {
            margin: 0;
            color: #4a5c6a;
        }

        .assignmentWorkspaceControls
        {
            border: 1px solid #c6d8e5;
            border-radius: 8px;
            padding: 10px;
            background: #f8fbfe;
            margin-bottom: 10px;
        }

        .assignmentWorkspaceSearchRow
        {
            margin-bottom: 8px;
        }

        .assignmentWorkspaceSearchRow label
        {
            font-weight: bold;
            margin-right: 8px;
        }

        .assignmentWorkspaceSearchRow input[type="text"]
        {
            width: 420px;
            max-width: 100%;
        }

        .assignmentWorkspaceToggleRow label
        {
            margin-right: 16px;
            white-space: nowrap;
        }

        .assignmentWorkspaceToggleRow a
        {
            vertical-align: middle;
        }

        .assignmentWorkspaceStatus
        {
            margin: 8px 0;
            color: #1d5f85;
            font-weight: bold;
        }

        .assignmentWorkspaceStatus--error
        {
            color: #b00020;
        }

        .assignmentWorkspaceTable th,
        .assignmentWorkspaceTable td
        {
            vertical-align: top;
        }

        .assignmentWorkspaceBadge
        {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 999px;
            border: 1px solid #90a8bc;
            background: #edf3f8;
            color: #3f5970;
            font-size: 11px;
            font-weight: bold;
            line-height: 1;
        }
    </style>

    <div class="assignmentWorkspaceShell">
        <div class="assignmentWorkspaceHeader">
            <h3>Add Candidate to This Job Order</h3>
            <p>Job Order: <strong><?php $this->_($this->jobOrderTitle); ?></strong></p>
        </div>

        <div class="assignmentWorkspaceControls">
            <div class="assignmentWorkspaceSearchRow">
                <label for="assignmentSearchInput">Search Candidates:</label>
                <input type="text" id="assignmentSearchInput" class="inputbox" placeholder="Candidate name, email, or key skills" />
            </div>
            <div class="assignmentWorkspaceToggleRow">
                <label>
                    <input type="checkbox" id="assignmentOnlyNotInPipeline" checked="checked" />
                    Only show candidates not already active in this pipeline
                </label>
                <a href="#" id="assignmentRefreshButton" class="ui2-button ui2-button--secondary">Refresh</a>
                <label style="margin-left: 12px;">
                    Stage on Add:
                    <select id="assignmentTargetStatus" class="selectBox" <?php if (empty($this->canSetStatusOnAdd)) echo('disabled="disabled"'); ?>>
                        <?php foreach ($this->assignmentStatusOptions as $statusRow): ?>
                            <option value="<?php echo((int) $statusRow['statusID']); ?>" <?php if ((int) $statusRow['statusID'] === (int) $this->defaultAssignmentStatusID) echo('selected="selected"'); ?>>
                                <?php $this->_($statusRow['status']); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </label>
                <button type="button" id="assignmentAddSelected" class="ui2-button ui2-button--primary" disabled="disabled">Add Selected</button>
                <span id="assignmentSelectionCount" style="font-weight: bold; color: #1d5f85;">0 selected</span>
                <?php if (!empty($this->canUseQuickAddCandidate)): ?>
                    <a class="ui2-button ui2-button--secondary" href="<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=addCandidateModal&amp;jobOrderID=<?php echo($this->jobOrderID); ?>">
                        Quick Add Candidate
                    </a>
                <?php endif; ?>
            </div>
        </div>

        <div id="assignmentStatus" class="assignmentWorkspaceStatus">Loading...</div>

        <table class="sortable ui2-table assignmentWorkspaceTable" width="100%">
            <tr>
                <th align="center" width="30">
                    <input type="checkbox" id="assignmentSelectAll" title="Select all visible rows" />
                </th>
                <th align="left">Candidate</th>
                <th align="left">Key Skills</th>
                <th align="left">Email</th>
                <th align="left">Owner</th>
                <th align="left" nowrap="nowrap">Updated</th>
                <th align="center" nowrap="nowrap">Action</th>
            </tr>
            <tbody id="assignmentResultsBody">
                <tr>
                    <td colspan="6" class="data">Loading...</td>
                </tr>
            </tbody>
        </table>

        <p style="margin-top: 8px; color: #4a5c6a;">
            Tip: click <strong>Add</strong> to continue with pipeline safety checks (including rejected re-apply confirmation).
        </p>
    </div>

    <script type="text/javascript">
        AssignmentWorkspace.init({
            mode: 'jobToCandidates',
            searchFunction: 'assignmentSearchCandidates',
            searchInputId: 'assignmentSearchInput',
            onlyNotInPipelineControlId: 'assignmentOnlyNotInPipeline',
            refreshButtonId: 'assignmentRefreshButton',
            statusId: 'assignmentStatus',
            resultsBodyId: 'assignmentResultsBody',
            selectAllCheckboxId: 'assignmentSelectAll',
            bulkAddButtonId: 'assignmentAddSelected',
            selectionCountId: 'assignmentSelectionCount',
            stageSelectId: 'assignmentTargetStatus',
            defaultTargetStatusID: '<?php echo((int) $this->defaultAssignmentStatusID); ?>',
            maxResults: 40,
            jobOrderID: '<?php $this->_($this->jobOrderID); ?>'
        });
    </script>
<?php else: ?>
    <p>The selected candidate has been successfully added to the pipeline for this job order.</p>

    <form method="get" action="<?php echo(CATSUtility::getIndexName()); ?>">
        <input type="button" name="close" value="Close" onclick="parentGoToURL('<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=show&amp;jobOrderID=<?php echo($this->jobOrderID); ?>');" />
    </form>
<?php endif; ?>

</body>
</html>
