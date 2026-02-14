<?php /* $Id: QuickActionAddToListModal.tpl 3198 2007-10-14 23:36:43Z will $ */ ?>
<?php TemplateUtility::printModalHeader('Lists', array('js/lists.js'), 'Add to '.$this->dataItemDesc.' Static Lists'); ?>
    <style type="text/css">
        .list-modal {
            padding: 2px 0 0 0;
            color: #1f2933;
        }
        .list-modal-intro {
            margin: 0 0 10px 0;
            font-size: 13px;
            color: #4a5560;
        }
        .list-modal .addToListListBox {
            max-height: 270px;
            overflow-y: auto;
            border: 1px solid #d6dce1;
            border-radius: 6px;
            background: #ffffff;
        }
        .list-modal .evenDivRow,
        .list-modal .oddDivRow {
            min-height: 44px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 8px 10px;
            border-bottom: 1px solid #e8edf1;
        }
        .list-modal .evenDivRow {
            background: #ffffff;
        }
        .list-modal .oddDivRow {
            background: #f8fbfd;
        }
        .list-modal-row-main {
            display: flex;
            align-items: center;
            min-width: 0;
            flex: 1;
            gap: 8px;
        }
        .list-modal-row-label {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 13px;
        }
        .list-modal-row-count {
            color: #63707a;
        }
        .list-modal-row-actions {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
        }
        .list-modal .ui2-button {
            border: 1px solid #c8d1d9;
            border-radius: 4px;
            background: #ffffff;
            color: #1f2933;
            text-decoration: none;
            height: 30px;
            line-height: 28px;
            padding: 0 10px;
            font-size: 12px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        .list-modal .ui2-button:hover {
            background: #f5f8fa;
        }
        .list-modal .ui2-button--primary {
            background: #2e7ea4;
            border-color: #2e7ea4;
            color: #ffffff;
        }
        .list-modal .ui2-button--primary:hover {
            background: #2a3a42;
            border-color: #2a3a42;
        }
        .list-modal .ui2-button--danger:hover {
            background: #ffecec;
            border-color: #c0392b;
            color: #7a1c14;
        }
        .list-modal .inputbox {
            height: 32px;
            width: 280px;
            max-width: 100%;
            padding: 6px 10px;
            border: 1px solid #d6dce1;
            border-radius: 4px;
        }
        .list-modal-empty {
            padding: 14px;
            font-size: 13px;
            color: #63707a;
            text-align: center;
        }
        .list-modal-footer {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 8px;
            margin-top: 12px;
        }
        .list-modal-progress {
            margin-top: 12px;
            font-size: 13px;
            color: #4a5560;
        }
    </style>

    <div class="list-modal">
        <p class="list-modal-intro">Select the lists you want to add the item<?php if (count($this->dataItemIDArray) > 1): ?>s<?php endif; ?> to.</p>
        <input type="hidden" style="width:200px;" id="dataItemArray" value="<?php $this->_(implode(',', $this->dataItemIDArray)); ?>">

        <div class="addToListListBox" id="addToListBox">
            <?php if (empty($this->savedListsRS)): ?>
                <div class="list-modal-empty">No lists available yet. Create one to continue.</div>
            <?php endif; ?>
            <?php foreach($this->savedListsRS as $index => $data): ?>
                <div class="<?php TemplateUtility::printAlternatingDivClass($index); ?> list-modal-row" id="savedListRow<?php echo($data['savedListID']); ?>">
                    <div class="list-modal-row-main">
                        <input type="checkbox" id="savedListRowCheck<?php echo($data['savedListID']); ?>">
                        <span class="list-modal-row-label" id="savedListRowDescriptionArea<?php echo($data['savedListID']); ?>"><?php $this->_($data['description']); ?></span>
                        <span class="list-modal-row-count">(<?php echo($data['numberEntries']); ?>)</span>
                    </div>
                    <?php if (!empty($this->canManageLists)): ?>
                    <div class="list-modal-row-actions">
                        <a href="javascript:void(0);" class="ui2-button ui2-button--secondary" onclick="editListRow(<?php echo($data['savedListID']); ?>);">Edit</a>
                    </div>
                    <?php endif; ?>
                </div>
                <div class="<?php TemplateUtility::printAlternatingDivClass($index); ?> list-modal-row" style="display:none;" id="savedListRowEditing<?php echo($data['savedListID']); ?>">
                    <div class="list-modal-row-main">
                        <input class="inputbox" value="<?php $this->_($data['description']); ?>" id="savedListRowInput<?php echo($data['savedListID']); ?>">
                    </div>
                    <div class="list-modal-row-actions">
                        <?php if (!empty($this->canDeleteLists)): ?>
                        <a href="javascript:void(0);" class="ui2-button ui2-button--danger" onclick="deleteListRow(<?php echo($data['savedListID']); ?>, '<?php echo($this->sessionCookie); ?>', <?php echo($data['numberEntries']); ?>);">Delete</a>
                        <?php endif; ?>
                        <a href="javascript:void(0);" class="ui2-button ui2-button--primary" onclick="saveListRow(<?php echo($data['savedListID']); ?>, '<?php echo($this->sessionCookie); ?>');">Save</a>
                    </div>
                </div>
                <div class="<?php TemplateUtility::printAlternatingDivClass($index); ?> list-modal-row" style="display:none;" id="savedListRowAjaxing<?php echo($data['savedListID']); ?>">
                    <div class="list-modal-row-main">
                        <img src="images/indicator.gif" alt="Saving" />&nbsp;Saving changes, please wait...
                    </div>
                </div>
            <?php endforeach; ?>

            <div class="<?php TemplateUtility::printAlternatingDivClass(count($this->savedListsRS)); ?> list-modal-row" style="display:none;" id="savedListNew">
                <div class="list-modal-row-main">
                    <input class="inputbox" value="" id="savedListNewInput">
                </div>
                <div class="list-modal-row-actions">
                    <a href="javascript:void(0);" class="ui2-button ui2-button--secondary" onclick="document.getElementById('savedListNew').style.display='none';">Cancel</a>
                    <a href="javascript:void(0);" class="ui2-button ui2-button--primary" onclick="commitNewList('<?php echo($this->sessionCookie); ?>', <?php echo($this->dataItemType); ?>);">Save</a>
                </div>
            </div>
            <div class="<?php TemplateUtility::printAlternatingDivClass(count($this->savedListsRS)); ?> list-modal-row" style="display:none;" id="savedListNewAjaxing">
                <div class="list-modal-row-main">
                    <img src="images/indicator.gif" alt="Saving" />&nbsp;Saving changes...
                </div>
            </div>
        </div>

        <div class="list-modal-footer" id="actionArea">
            <?php if (!empty($this->canManageLists)): ?>
            <input type="button" class="ui2-button ui2-button--secondary" value="New List" onclick="addListRow();">
            <input type="button" class="ui2-button ui2-button--primary" value="Add To Lists" onclick="addItemsToList('<?php echo($this->sessionCookie); ?>', <?php echo($this->dataItemType); ?>);">
            <?php endif; ?>
            <input type="button" class="ui2-button ui2-button--secondary" value="Close" onclick="parentHidePopWin();">
        </div>
        <div class="list-modal-progress" style="display:none;" id="addingToListAjaxing">
            <img src="images/indicator.gif" alt="Adding" />&nbsp;Adding to lists, please wait <?php if (count($this->dataItemIDArray) > 20): ?>(this could take awhile)<?php endif; ?>...
        </div>
        <div class="list-modal-progress" style="display:none;" id="addingToListAjaxingComplete">
            <img src="images/indicator.gif" alt="Added" />&nbsp;Items have been added to lists successfully.
        </div>
    </div>
            <script type="text/javascript">
                function relabelEvenOdd()
                {
                    var onEven = 1;
                    <?php foreach($this->savedListsRS as $index => $data): ?>
                        if (document.getElementById("savedListRow<?php echo($data['savedListID']); ?>").style.display == '' || 
                            document.getElementById("savedListRowEditing<?php echo($data['savedListID']); ?>").style.display == '' || 
                            document.getElementById("savedListRowAjaxing<?php echo($data['savedListID']); ?>").style.display == '')
                        {
                            if (onEven == 1)
                            {
                                document.getElementById("savedListRow<?php echo($data['savedListID']); ?>").className = 'evenDivRow list-modal-row';
                                document.getElementById("savedListRowEditing<?php echo($data['savedListID']); ?>").className = 'evenDivRow list-modal-row';
                                document.getElementById("savedListRowAjaxing<?php echo($data['savedListID']); ?>").className = 'evenDivRow list-modal-row';
                                onEven = 0;
                            }
                            else
                            {
                                document.getElementById("savedListRow<?php echo($data['savedListID']); ?>").className = 'oddDivRow list-modal-row';
                                document.getElementById("savedListRowEditing<?php echo($data['savedListID']); ?>").className = 'oddDivRow list-modal-row';
                                document.getElementById("savedListRowAjaxing<?php echo($data['savedListID']); ?>").className = 'oddDivRow list-modal-row';
                                onEven = 1;
                            }
                        }
                    <?php endforeach; ?>
                    if (onEven == 1)
                    {
                        document.getElementById("savedListNew").className = 'evenDivRow list-modal-row';
                        document.getElementById("savedListNewAjaxing").className = 'evenDivRow list-modal-row';
                    }
                    else
                    {
                        document.getElementById("savedListNew").className = 'oddDivRow list-modal-row';
                        document.getElementById("savedListNewAjaxing").className = 'oddDivRow list-modal-row';
                    }
                }
                function getCheckedBoxes()
                {
                    var checked='';
                     <?php foreach($this->savedListsRS as $index => $data): ?>
                        if (document.getElementById("savedListRowCheck<?php echo($data['savedListID']); ?>").checked)
                        {
                            checked += "<?php echo($data['savedListID']); ?>,";
                        }
                    <?php endforeach; ?>  
                    return checked;                 
                }
                relabelEvenOdd();
            </script>
    </body>
</html>
