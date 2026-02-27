<?php TemplateUtility::printModalHeader('Job Orders', array('js/assignmentWorkspace.js'), 'Assignment Workspace: Add Candidate to This Job Order'); ?>

<?php if (!$this->isFinishedMode): ?>
    <style type="text/css">
        .assignmentWorkspaceShell
        {
            padding: 14px;
            background: linear-gradient(180deg, #f7fbfe 0%, #eef5fb 100%);
            font-family: "Segoe UI", Tahoma, Arial, sans-serif;
            color: #193545;
        }

        .assignmentWorkspaceHeader
        {
            margin-bottom: 12px;
            border: 1px solid #cfe0e9;
            border-radius: 12px;
            background: #ffffff;
            padding: 12px 14px;
            box-shadow: 0 2px 6px rgba(16, 65, 91, 0.08);
        }

        .assignmentWorkspaceHeader h3
        {
            margin: 0 0 4px 0;
            color: #0f5b78;
            font-size: 26px;
            line-height: 1.1;
        }

        .assignmentWorkspaceHeader p
        {
            margin: 0;
            color: #486777;
            font-size: 14px;
        }

        .assignmentWorkspaceControls
        {
            border: 1px solid #cfe0e9;
            border-radius: 12px;
            padding: 12px 14px;
            background: #ffffff;
            box-shadow: 0 2px 6px rgba(16, 65, 91, 0.08);
            margin-bottom: 12px;
        }

        .assignmentWorkspaceSearchRow
        {
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
        }

        .assignmentWorkspaceSearchRow label
        {
            font-weight: bold;
            color: #2f5669;
        }

        .assignmentWorkspaceSearchRow input[type="text"]
        {
            width: 420px;
            max-width: 100%;
            height: 36px;
            border: 1px solid #bcd3df;
            border-radius: 8px;
            padding: 0 10px;
            font-size: 14px;
            background: #fbfeff;
        }

        .assignmentWorkspaceToggleRow
        {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
        }

        .assignmentWorkspaceToggleRow label.assignmentWorkspaceToggleChip
        {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            border: 1px solid #c9dce6;
            border-radius: 999px;
            background: #f6fbfe;
            padding: 6px 11px;
            color: #355667;
            font-size: 12px;
            font-weight: 600;
            line-height: 1;
        }

        .assignmentWorkspaceToggleRow .ui2-button
        {
            border-radius: 8px !important;
        }

        .assignmentWorkspaceSelectionCount
        {
            font-weight: bold;
            color: #1d5f85;
            font-size: 12px;
            border: 1px solid #c9dce6;
            border-radius: 999px;
            padding: 5px 10px;
            background: #f8fcff;
        }

        .assignmentWorkspaceStatus
        {
            margin: 0;
            color: #125f7d;
            font-weight: bold;
            font-size: 13px;
        }

        .assignmentWorkspaceStatus--error
        {
            color: #b00020;
        }

        .assignmentWorkspaceStatusBar
        {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            border: 1px solid #cfe0e9;
            border-radius: 10px;
            background: #ffffff;
            box-shadow: 0 2px 6px rgba(16, 65, 91, 0.08);
            padding: 9px 12px;
            margin-bottom: 10px;
        }

        .assignmentWorkspaceRankInfo
        {
            color: #486777;
            font-size: 12px;
        }

        .assignmentWorkspaceTableWrap
        {
            border: 1px solid #cfe0e9;
            border-radius: 12px;
            overflow: hidden;
            background: #ffffff;
            box-shadow: 0 2px 6px rgba(16, 65, 91, 0.08);
        }

        .assignmentWorkspaceTable
        {
            width: 100%;
            border-collapse: collapse;
        }

        .assignmentWorkspaceTable th
        {
            background: #0f6886;
            color: #ffffff;
            border: 1px solid #0f6886;
            padding: 8px 8px;
            text-align: left;
            font-size: 12px;
            font-weight: bold;
        }

        .assignmentWorkspaceTable td
        {
            border: 1px solid #dce6ec;
            padding: 7px 8px;
            font-size: 12px;
            vertical-align: top;
            color: #163748;
        }

        .assignmentWorkspaceTable tbody tr:nth-child(even) td
        {
            background: #f9fcfe;
        }

        .assignmentWorkspaceTable tbody tr:hover td
        {
            background: #edf7fc;
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

        .assignmentWorkspaceFitScore
        {
            display: inline-block;
            min-width: 36px;
            text-align: center;
            font-weight: bold;
            border-radius: 999px;
            padding: 3px 8px;
            color: #fff;
            font-size: 12px;
        }

        .assignmentWorkspaceFitScore--high { background: #1f8f4d; }
        .assignmentWorkspaceFitScore--medium { background: #d49012; }
        .assignmentWorkspaceFitScore--low { background: #6e7c8a; }

        .assignmentWorkspaceFitSummary
        {
            margin-top: 4px;
            color: #445a6e;
            font-size: 11px;
            line-height: 1.35;
        }

        .assignmentWorkspaceHint
        {
            margin-top: 10px;
            color: #4c6675;
            font-size: 12px;
        }

        @media (max-width: 980px)
        {
            .assignmentWorkspaceStatusBar
            {
                flex-direction: column;
                align-items: flex-start;
            }

            .assignmentWorkspaceSearchRow input[type="text"]
            {
                width: 100%;
            }
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
                <label class="assignmentWorkspaceToggleChip">
                    <input type="checkbox" id="assignmentOnlyNotInPipeline" checked="checked" />
                    Only show candidates not already active in this pipeline
                </label>
                <a href="#" id="assignmentRefreshButton" class="ui2-button ui2-button--secondary">Refresh</a>
                <button type="button" id="assignmentAddSelected" class="ui2-button ui2-button--primary" disabled="disabled">Add Selected</button>
                <span id="assignmentSelectionCount" class="assignmentWorkspaceSelectionCount">0 selected</span>
                <?php if (!empty($this->canUseQuickAddCandidate)): ?>
                    <a class="ui2-button ui2-button--secondary" href="<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=addCandidateModal&amp;jobOrderID=<?php echo($this->jobOrderID); ?>">
                        Quick Add Candidate
                    </a>
                <?php endif; ?>
            </div>
        </div>

        <div class="assignmentWorkspaceStatusBar">
            <div id="assignmentStatus" class="assignmentWorkspaceStatus">Loading...</div>
            <div class="assignmentWorkspaceRankInfo">Results are ranked by fit score.</div>
        </div>

        <div class="assignmentWorkspaceTableWrap">
            <table class="assignmentWorkspaceTable">
                <tr>
                    <th align="center" width="30">
                        <input type="checkbox" id="assignmentSelectAll" title="Select all visible rows" />
                    </th>
                    <th align="left">Candidate</th>
                    <th align="left">Key Skills</th>
                    <th align="left">Email</th>
                    <th align="left">Owner</th>
                    <th align="left" nowrap="nowrap">Updated</th>
                    <th align="left" nowrap="nowrap">Fit</th>
                    <th align="center" nowrap="nowrap">Action</th>
                </tr>
                <tbody id="assignmentResultsBody">
                    <tr>
                        <td colspan="8" class="data">Loading...</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <p class="assignmentWorkspaceHint">
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
