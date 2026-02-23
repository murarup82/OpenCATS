<?php TemplateUtility::printHeader('Overview - My Notes & To-do', array('js/sweetTitles.js')); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active, 'My Notes & To-do'); ?>
<div id="main" class="home">
    <?php TemplateUtility::printQuickSearch(); ?>

    <div id="contents"<?php echo TemplateUtility::getUI2WrapperAttribute(); ?> style="padding-top: 10px;">
        <div class="ui2-page">
            <style type="text/css">
                .my-notes-page {
                    --notes-bg: #f2f6fb;
                    --notes-panel: #ffffff;
                    --notes-border: #d4deea;
                    --notes-text: #142433;
                    --notes-muted: #5c7084;
                    --notes-primary: #0a6fb3;
                    --notes-primary-soft: #e8f4ff;
                    --notes-danger: #b21e2b;
                    font-family: "Segoe UI", "Tahoma", "Verdana", sans-serif;
                }
                .my-notes-page .notes-shell {
                    background: linear-gradient(180deg, #f8fbff 0%, var(--notes-bg) 100%);
                    border: 1px solid var(--notes-border);
                    border-radius: 10px;
                    padding: 12px;
                }
                .my-notes-page .notes-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 10px;
                    flex-wrap: wrap;
                }
                .my-notes-page .notes-title {
                    font-size: 22px;
                    color: #0f3c64;
                    font-weight: 700;
                    margin: 0;
                }
                .my-notes-page .notes-subtitle {
                    color: var(--notes-muted);
                    font-size: 12px;
                }
                .my-notes-page .notes-view-switch {
                    display: inline-flex;
                    background: #dfeaf5;
                    border-radius: 999px;
                    padding: 4px;
                    gap: 4px;
                }
                .my-notes-page .notes-view-link {
                    text-decoration: none;
                    font-size: 12px;
                    color: #113a5a;
                    padding: 7px 12px;
                    border-radius: 999px;
                    font-weight: 600;
                    white-space: nowrap;
                }
                .my-notes-page .notes-view-link.active {
                    background: #ffffff;
                    color: var(--notes-primary);
                    box-shadow: 0 1px 2px rgba(15, 44, 70, 0.18);
                }
                .my-notes-page .notes-grid {
                    display: grid;
                    grid-template-columns: 460px minmax(0, 1fr);
                    gap: 14px;
                    align-items: start;
                }
                .my-notes-page .notes-panel {
                    border: 1px solid var(--notes-border);
                    border-radius: 8px;
                    background: var(--notes-panel);
                    overflow: hidden;
                }
                .my-notes-page .notes-panel-head {
                    border-bottom: 1px solid #e5edf6;
                    padding: 11px 12px;
                    color: #0f3c64;
                    font-size: 15px;
                    font-weight: 700;
                }
                .my-notes-page .notes-panel-body {
                    padding: 12px;
                }
                .my-notes-page .notes-field {
                    margin-bottom: 10px;
                }
                .my-notes-page .notes-field:last-child {
                    margin-bottom: 0;
                }
                .my-notes-page .notes-label {
                    display: block;
                    font-size: 12px;
                    color: #2f4a61;
                    margin-bottom: 4px;
                    font-weight: 600;
                }
                .my-notes-page .notes-input,
                .my-notes-page .notes-textarea {
                    width: 100%;
                    box-sizing: border-box;
                    border: 1px solid #c5d4e4;
                    border-radius: 6px;
                    padding: 8px 9px;
                    font-size: 13px;
                    color: var(--notes-text);
                    background: #fff;
                }
                .my-notes-page .notes-textarea {
                    min-height: 180px;
                    resize: vertical;
                    font-family: "Segoe UI", "Tahoma", "Verdana", sans-serif;
                    line-height: 1.45;
                }
                .my-notes-page .notes-textarea--xl {
                    min-height: 260px;
                }
                .my-notes-page .notes-list {
                    max-height: 760px;
                    overflow-y: auto;
                    padding: 10px;
                    background: #f9fcff;
                }
                .my-notes-page .notes-empty {
                    padding: 16px;
                    color: var(--notes-muted);
                    font-size: 13px;
                    border: 1px dashed #cbd9e7;
                    border-radius: 8px;
                    background: #fff;
                }
                .my-notes-page .notes-item {
                    background: #fff;
                    border: 1px solid #dbe6f2;
                    border-radius: 9px;
                    padding: 11px 12px;
                    margin-bottom: 9px;
                    box-shadow: 0 1px 2px rgba(13, 38, 61, 0.05);
                }
                .my-notes-page .notes-item:last-child {
                    margin-bottom: 0;
                }
                .my-notes-page .notes-item-head {
                    display: flex;
                    justify-content: space-between;
                    align-items: baseline;
                    gap: 8px;
                    margin-bottom: 7px;
                }
                .my-notes-page .notes-item-title {
                    font-size: 14px;
                    font-weight: 700;
                    color: #123a5d;
                }
                .my-notes-page .notes-item-meta {
                    font-size: 11px;
                    color: #678096;
                    white-space: nowrap;
                }
                .my-notes-page .notes-item-body {
                    font-size: 13px;
                    color: #1f3246;
                    line-height: 1.45;
                    margin-bottom: 9px;
                    word-break: break-word;
                }
                .my-notes-page .notes-item-tags {
                    margin-bottom: 8px;
                    font-size: 11px;
                    color: #395670;
                }
                .my-notes-page .notes-pill {
                    display: inline-flex;
                    align-items: center;
                    border-radius: 999px;
                    font-size: 11px;
                    font-weight: 700;
                    padding: 3px 8px;
                    margin-right: 6px;
                    background: #eaf3ff;
                    color: #20598a;
                }
                .my-notes-page .notes-pill.done {
                    background: #e6f6eb;
                    color: #256943;
                }
                .my-notes-page .notes-pill.overdue {
                    background: #ffecef;
                    color: #a0212f;
                }
                .my-notes-page .notes-pill.priority-low {
                    background: #eef3f8;
                    color: #35556e;
                }
                .my-notes-page .notes-pill.priority-medium {
                    background: #e8f3ff;
                    color: #1b5f95;
                }
                .my-notes-page .notes-pill.priority-high {
                    background: #ffe7ea;
                    color: #a11f2f;
                }
                .my-notes-page .notes-pill.reminder-due {
                    background: #fff1dc;
                    color: #8d5310;
                }
                .my-notes-page .notes-item-actions {
                    display: flex;
                    gap: 7px;
                    flex-wrap: wrap;
                }
                .my-notes-page .notes-inline-panel {
                    margin-top: 10px;
                    padding: 10px;
                    border: 1px dashed #c8d7e5;
                    border-radius: 8px;
                    background: #f8fbff;
                }
                .my-notes-page .notes-inline-panel-title {
                    font-size: 12px;
                    color: #224864;
                    font-weight: 700;
                    margin-bottom: 7px;
                }
                .my-notes-page .notes-multi-select {
                    min-height: 140px;
                }
                .my-notes-page .notes-help {
                    margin-top: 6px;
                    color: #5d7285;
                    font-size: 11px;
                }
                .my-notes-page .notes-recipient-tools {
                    display: flex;
                    gap: 6px;
                    align-items: center;
                    flex-wrap: wrap;
                    margin-bottom: 8px;
                }
                .my-notes-page .notes-recipient-tools .notes-input {
                    flex: 1 1 190px;
                }
                .my-notes-page .todo-toolbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 10px;
                    flex-wrap: wrap;
                }
                .my-notes-page .kanban-board {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    gap: 10px;
                    align-items: start;
                }
                .my-notes-page .kanban-column {
                    background: #f7fbff;
                    border: 1px solid #d6e2ef;
                    border-radius: 8px;
                    min-height: 540px;
                    display: flex;
                    flex-direction: column;
                }
                .my-notes-page .kanban-column-head {
                    padding: 9px 10px;
                    border-bottom: 1px solid #dfe9f4;
                    font-size: 12px;
                    font-weight: 700;
                    color: #123a5d;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .my-notes-page .kanban-column-body {
                    padding: 9px;
                    min-height: 470px;
                }
                .my-notes-page .kanban-column.is-drop-target {
                    border-color: #75aee0;
                    box-shadow: inset 0 0 0 2px #d9ecff;
                    background: #f1f8ff;
                }
                .my-notes-page .kanban-empty {
                    font-size: 12px;
                    color: #6a7f93;
                    border: 1px dashed #cddaea;
                    border-radius: 7px;
                    background: #fff;
                    padding: 10px;
                }
                .my-notes-page .kanban-card {
                    cursor: grab;
                    margin-bottom: 8px;
                }
                .my-notes-page .kanban-card:active {
                    cursor: grabbing;
                }
                .my-notes-page .kanban-status-select {
                    width: auto;
                    min-width: 130px;
                    margin-right: 6px;
                }
                .my-notes-page .modal-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(8, 20, 33, 0.45);
                    z-index: 1600;
                    display: none;
                }
                .my-notes-page .modal-panel {
                    position: fixed;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    width: min(760px, 92vw);
                    max-height: 88vh;
                    overflow: auto;
                    background: #fff;
                    border: 1px solid #c9d9ea;
                    border-radius: 10px;
                    box-shadow: 0 10px 28px rgba(3, 17, 31, 0.35);
                    z-index: 1610;
                    display: none;
                }
                .my-notes-page .modal-header {
                    padding: 12px 14px;
                    border-bottom: 1px solid #dfe9f3;
                    font-size: 16px;
                    font-weight: 700;
                    color: #123a5d;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .my-notes-page .modal-body {
                    padding: 14px;
                }
                .my-notes-page .modal-close {
                    border: 0;
                    background: transparent;
                    color: #4d6277;
                    font-size: 18px;
                    line-height: 1;
                    cursor: pointer;
                }
                .my-notes-page .notes-inline-form {
                    display: inline;
                }
                .my-notes-page .notes-inline-button {
                    border: 1px solid #c8d7e5;
                    background: #fff;
                    color: #1f4a6d;
                    border-radius: 6px;
                    padding: 5px 9px;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                }
                .my-notes-page .notes-inline-button.primary {
                    border-color: #b4d2ea;
                    background: var(--notes-primary-soft);
                    color: var(--notes-primary);
                }
                .my-notes-page .notes-inline-button.danger {
                    border-color: #e4b8be;
                    background: #fff6f7;
                    color: var(--notes-danger);
                }
                @media (max-width: 1120px) {
                    .my-notes-page .notes-grid {
                        grid-template-columns: 1fr;
                    }
                    .my-notes-page .kanban-board {
                        grid-template-columns: 1fr 1fr;
                    }
                }
                @media (max-width: 760px) {
                    .my-notes-page .kanban-board {
                        grid-template-columns: 1fr;
                    }
                }
            </style>

            <div class="notes-header my-notes-page">
                <div>
                    <h2 class="notes-title">Overview: My Notes & To-do</h2>
                    <div class="notes-subtitle">
                        Capture ideas in notes and move them into actionable tasks.
                    </div>
                </div>
                <div class="notes-view-switch">
                    <a
                        class="notes-view-link<?php if ($this->view === 'notes') echo(' active'); ?>"
                        href="<?php echo(CATSUtility::getIndexName()); ?>?m=home&amp;a=myNotes&amp;view=notes"
                    >My Notes (<?php echo((int) $this->summary['notesCount']); ?>)</a>
                    <a
                        class="notes-view-link<?php if ($this->view === 'todos') echo(' active'); ?>"
                        href="<?php echo(CATSUtility::getIndexName()); ?>?m=home&amp;a=myNotes&amp;view=todos"
                    >To-do List (<?php echo((int) $this->summary['todoOpenCount']); ?> open)</a>
                </div>
            </div>

            <?php if (!empty($this->flashMessage)): ?>
                <div class="ui2-ai-status" style="margin-bottom: 8px;<?php if (!empty($this->flashIsError)): ?> color:#b00000; border-left-color:#b00000;<?php endif; ?>">
                    <?php $this->_($this->flashMessage); ?>
                </div>
            <?php endif; ?>

            <?php if (empty($this->schemaAvailable)): ?>
                <div class="ui2-ai-status" style="color:#b00000; border-left-color:#b00000;">
                    My Notes / To-do tables are missing. Apply schema migrations from Settings -> Schema Migrations.
                </div>
            <?php else: ?>
                <div class="my-notes-page">
                    <div class="notes-shell">
                        <?php if ($this->view === 'todos'): ?>
                            <?php
                                $todoStatusOrder = !empty($this->todoStatuses)
                                    ? $this->todoStatuses
                                    : array('open', 'in_progress', 'blocked', 'done');
                                $todoStatusLabels = array(
                                    'open' => 'Open',
                                    'in_progress' => 'In Progress',
                                    'blocked' => 'Blocked',
                                    'done' => 'Done'
                                );
                            ?>
                            <div class="todo-toolbar">
                                <div class="notes-subtitle">
                                    (<?php echo((int) $this->summary['todoOpenCount']); ?> active / <?php echo((int) $this->summary['todoDoneCount']); ?> done shown / <?php echo((int) $this->summary['reminderDueCount']); ?> reminders due)
                                </div>
                                <button type="button" class="ui2-button ui2-button--primary" onclick="MyNotes_openTodoModal();">
                                    New To-do
                                </button>
                            </div>

                            <div class="kanban-board">
                                <?php foreach ($todoStatusOrder as $todoStatus): ?>
                                    <?php
                                        $columnItems = array();
                                        if (!empty($this->todoItemsByStatus) && isset($this->todoItemsByStatus[$todoStatus]) && is_array($this->todoItemsByStatus[$todoStatus]))
                                        {
                                            $columnItems = $this->todoItemsByStatus[$todoStatus];
                                        }
                                        $columnLabel = isset($todoStatusLabels[$todoStatus]) ? $todoStatusLabels[$todoStatus] : ucfirst(str_replace('_', ' ', $todoStatus));
                                    ?>
                                    <div
                                        class="kanban-column"
                                        data-status="<?php echo(htmlspecialchars($todoStatus, ENT_QUOTES)); ?>"
                                        ondragover="MyNotes_kanbanDragOver(event, this);"
                                        ondragleave="MyNotes_kanbanDragLeave(this);"
                                        ondrop="MyNotes_kanbanDrop(event, this);"
                                    >
                                        <div class="kanban-column-head">
                                            <span><?php $this->_($columnLabel); ?></span>
                                            <span><?php echo((int) count($columnItems)); ?></span>
                                        </div>
                                        <div class="kanban-column-body">
                                            <?php if (!empty($columnItems)): ?>
                                                <?php foreach ($columnItems as $todoItem): ?>
                                                    <div
                                                        class="notes-item kanban-card"
                                                        draggable="true"
                                                        data-item-id="<?php echo((int) $todoItem['itemID']); ?>"
                                                        data-current-status="<?php echo(htmlspecialchars($todoItem['taskStatus'], ENT_QUOTES)); ?>"
                                                        ondragstart="MyNotes_kanbanDragStart(event, this);"
                                                    >
                                                        <div class="notes-item-head">
                                                            <div class="notes-item-title">
                                                                <?php if ($todoItem['title'] !== ''): ?>
                                                                    <?php $this->_($todoItem['title']); ?>
                                                                <?php else: ?>
                                                                    (Untitled task)
                                                                <?php endif; ?>
                                                            </div>
                                                            <div class="notes-item-meta"><?php $this->_($todoItem['dateCreated']); ?></div>
                                                        </div>
                                                        <div class="notes-item-tags">
                                                            <?php if (!empty($todoItem['priority'])): ?>
                                                                <span class="notes-pill priority-<?php echo(htmlspecialchars($todoItem['priority'], ENT_QUOTES)); ?>">
                                                                    <?php $this->_(ucfirst($todoItem['priority'])); ?>
                                                                </span>
                                                            <?php endif; ?>
                                                            <?php if (!empty($todoItem['dueDateDisplay'])): ?>
                                                                <span class="notes-pill<?php if (!empty($todoItem['isOverdue'])) echo(' overdue'); ?>">
                                                                    Due: <?php $this->_($todoItem['dueDateDisplay']); ?>
                                                                </span>
                                                            <?php endif; ?>
                                                            <?php if (!empty($todoItem['reminderAtDisplay'])): ?>
                                                                <span class="notes-pill<?php if (!empty($todoItem['isReminderDue'])) echo(' reminder-due'); ?>">
                                                                    Reminder: <?php $this->_($todoItem['reminderAtDisplay']); ?>
                                                                </span>
                                                            <?php endif; ?>
                                                        </div>
                                                        <div class="notes-item-body"><?php echo($todoItem['bodyHTML']); ?></div>
                                                        <div class="notes-item-actions">
                                                            <button
                                                                type="button"
                                                                class="notes-inline-button"
                                                                onclick="MyNotes_openTodoEditModal(<?php echo((int) $todoItem['itemID']); ?>);"
                                                            >Edit</button>
                                                            <form class="notes-inline-form" method="post" action="<?php echo(CATSUtility::getIndexName()); ?>?m=home&amp;a=setPersonalTodoStatus">
                                                                <input type="hidden" name="itemID" value="<?php echo((int) $todoItem['itemID']); ?>" />
                                                                <input type="hidden" name="securityToken" value="<?php $this->_($this->setPersonalTodoStatusToken); ?>" />
                                                                <select name="taskStatus" class="notes-input kanban-status-select">
                                                                    <?php foreach ($todoStatusOrder as $todoStatusOption): ?>
                                                                        <?php $todoStatusOptionLabel = isset($todoStatusLabels[$todoStatusOption]) ? $todoStatusLabels[$todoStatusOption] : ucfirst(str_replace('_', ' ', $todoStatusOption)); ?>
                                                                        <option value="<?php echo(htmlspecialchars($todoStatusOption, ENT_QUOTES)); ?>"<?php if ($todoStatusOption === $todoItem['taskStatus']) echo(' selected="selected"'); ?>>
                                                                            <?php $this->_($todoStatusOptionLabel); ?>
                                                                        </option>
                                                                    <?php endforeach; ?>
                                                                </select>
                                                                <button type="submit" class="notes-inline-button primary">Move</button>
                                                            </form>
                                                            <form class="notes-inline-form" method="post" action="<?php echo(CATSUtility::getIndexName()); ?>?m=home&amp;a=deletePersonalItem" onsubmit="return confirm('Delete this item?');">
                                                                <input type="hidden" name="itemID" value="<?php echo((int) $todoItem['itemID']); ?>" />
                                                                <input type="hidden" name="view" value="todos" />
                                                                <input type="hidden" name="securityToken" value="<?php $this->_($this->deletePersonalItemToken); ?>" />
                                                                <button type="submit" class="notes-inline-button danger">Delete</button>
                                                            </form>
                                                        </div>
                                                        <script type="application/json" id="todoCardData<?php echo((int) $todoItem['itemID']); ?>">
<?php
echo json_encode(
    array(
        'itemID' => (int) $todoItem['itemID'],
        'title' => (string) $todoItem['title'],
        'body' => (string) $todoItem['body'],
        'dueDate' => (string) $todoItem['dueDateISO'],
        'priority' => (string) $todoItem['priority'],
        'reminderAtRaw' => (string) $todoItem['reminderAtRaw'],
        'taskStatus' => (string) $todoItem['taskStatus']
    )
);
?>
                                                        </script>
                                                    </div>
                                                <?php endforeach; ?>
                                            <?php else: ?>
                                                <div class="kanban-empty">No tasks in this stage.</div>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            </div>

                            <div class="modal-backdrop" id="todoCreateModalBackdrop" onclick="MyNotes_closeTodoModal();"></div>
                            <div class="modal-panel" id="todoCreateModalPanel">
                                <div class="modal-header">
                                    <span>New To-do</span>
                                    <button type="button" class="modal-close" aria-label="Close" onclick="MyNotes_closeTodoModal();">&times;</button>
                                </div>
                                <div class="modal-body">
                                    <form method="post" action="<?php echo(CATSUtility::getIndexName()); ?>?m=home&amp;a=addPersonalItem">
                                        <input type="hidden" name="itemType" value="todo" />
                                        <input type="hidden" name="view" value="todos" />
                                        <input type="hidden" name="taskStatus" value="open" />
                                        <input type="hidden" name="securityToken" value="<?php $this->_($this->addPersonalItemToken); ?>" />
                                        <div class="notes-field">
                                            <label class="notes-label" for="todoTitleModal">Title (optional)</label>
                                            <input class="notes-input" id="todoTitleModal" name="title" maxlength="255" />
                                        </div>
                                        <div class="notes-field">
                                            <label class="notes-label" for="todoDueDateModal">Due Date (optional)</label>
                                            <input class="notes-input" id="todoDueDateModal" name="dueDate" type="date" />
                                        </div>
                                        <div class="notes-field">
                                            <label class="notes-label" for="todoPriorityModal">Priority</label>
                                            <select class="notes-input" id="todoPriorityModal" name="priority">
                                                <?php if (!empty($this->todoPriorities)): ?>
                                                    <?php foreach ($this->todoPriorities as $todoPriority): ?>
                                                        <option value="<?php echo(htmlspecialchars($todoPriority, ENT_QUOTES)); ?>"<?php if ($todoPriority === 'medium') echo(' selected="selected"'); ?>>
                                                            <?php $this->_(ucfirst($todoPriority)); ?>
                                                        </option>
                                                    <?php endforeach; ?>
                                                <?php else: ?>
                                                    <option value="medium" selected="selected">Medium</option>
                                                    <option value="low">Low</option>
                                                    <option value="high">High</option>
                                                <?php endif; ?>
                                            </select>
                                        </div>
                                        <div class="notes-field">
                                            <label class="notes-label" for="todoReminderAtModal">Reminder (optional)</label>
                                            <input class="notes-input" id="todoReminderAtModal" name="reminderAt" type="datetime-local" />
                                        </div>
                                        <div class="notes-field">
                                            <label class="notes-label" for="todoBodyModal">Task Details</label>
                                            <textarea class="notes-textarea notes-textarea--xl" id="todoBodyModal" name="body" maxlength="4000" required="required"></textarea>
                                        </div>
                                        <button type="submit" class="ui2-button ui2-button--primary">Create To-do</button>
                                        <button type="button" class="ui2-button ui2-button--secondary" onclick="MyNotes_closeTodoModal();">Cancel</button>
                                    </form>
                                </div>
                            </div>

                            <div class="modal-backdrop" id="todoEditModalBackdrop" onclick="MyNotes_closeTodoEditModal();"></div>
                            <div class="modal-panel" id="todoEditModalPanel">
                                <div class="modal-header">
                                    <span>Edit To-do</span>
                                    <button type="button" class="modal-close" aria-label="Close" onclick="MyNotes_closeTodoEditModal();">&times;</button>
                                </div>
                                <div class="modal-body">
                                    <form method="post" action="<?php echo(CATSUtility::getIndexName()); ?>?m=home&amp;a=updatePersonalTodo">
                                        <input type="hidden" name="itemID" id="todoEditItemID" value="" />
                                        <input type="hidden" name="securityToken" value="<?php $this->_($this->updatePersonalTodoToken); ?>" />
                                        <div class="notes-field">
                                            <label class="notes-label" for="todoEditTitle">Title (optional)</label>
                                            <input class="notes-input" id="todoEditTitle" name="title" maxlength="255" />
                                        </div>
                                        <div class="notes-field">
                                            <label class="notes-label" for="todoEditDueDate">Due Date (optional)</label>
                                            <input class="notes-input" id="todoEditDueDate" name="dueDate" type="date" />
                                        </div>
                                        <div class="notes-field">
                                            <label class="notes-label" for="todoEditPriority">Priority</label>
                                            <select class="notes-input" id="todoEditPriority" name="priority">
                                                <?php if (!empty($this->todoPriorities)): ?>
                                                    <?php foreach ($this->todoPriorities as $todoPriority): ?>
                                                        <option value="<?php echo(htmlspecialchars($todoPriority, ENT_QUOTES)); ?>">
                                                            <?php $this->_(ucfirst($todoPriority)); ?>
                                                        </option>
                                                    <?php endforeach; ?>
                                                <?php else: ?>
                                                    <option value="medium">Medium</option>
                                                    <option value="low">Low</option>
                                                    <option value="high">High</option>
                                                <?php endif; ?>
                                            </select>
                                        </div>
                                        <div class="notes-field">
                                            <label class="notes-label" for="todoEditReminderAt">Reminder (optional)</label>
                                            <input class="notes-input" id="todoEditReminderAt" name="reminderAt" type="datetime-local" />
                                        </div>
                                        <div class="notes-field">
                                            <label class="notes-label" for="todoEditStatus">Status</label>
                                            <select class="notes-input" id="todoEditStatus" name="taskStatus">
                                                <?php foreach ($todoStatusOrder as $todoStatusOption): ?>
                                                    <?php $todoStatusOptionLabel = isset($todoStatusLabels[$todoStatusOption]) ? $todoStatusLabels[$todoStatusOption] : ucfirst(str_replace('_', ' ', $todoStatusOption)); ?>
                                                    <option value="<?php echo(htmlspecialchars($todoStatusOption, ENT_QUOTES)); ?>">
                                                        <?php $this->_($todoStatusOptionLabel); ?>
                                                    </option>
                                                <?php endforeach; ?>
                                            </select>
                                        </div>
                                        <div class="notes-field">
                                            <label class="notes-label" for="todoEditBody">Task Details</label>
                                            <textarea class="notes-textarea notes-textarea--xl" id="todoEditBody" name="body" maxlength="4000" required="required"></textarea>
                                        </div>
                                        <button type="submit" class="ui2-button ui2-button--primary">Save Changes</button>
                                        <button type="button" class="ui2-button ui2-button--secondary" onclick="MyNotes_closeTodoEditModal();">Cancel</button>
                                    </form>
                                </div>
                            </div>

                            <form id="todoKanbanMoveForm" method="post" action="<?php echo(CATSUtility::getIndexName()); ?>?m=home&amp;a=setPersonalTodoStatus" style="display:none;">
                                <input type="hidden" name="itemID" id="todoKanbanMoveItemID" value="" />
                                <input type="hidden" name="taskStatus" id="todoKanbanMoveTaskStatus" value="" />
                                <input type="hidden" name="securityToken" value="<?php $this->_($this->setPersonalTodoStatusToken); ?>" />
                            </form>
                        <?php else: ?>
                            <div class="notes-grid">
                                <div class="notes-panel">
                                    <div class="notes-panel-head">Add Note</div>
                                    <div class="notes-panel-body">
                                        <form method="post" action="<?php echo(CATSUtility::getIndexName()); ?>?m=home&amp;a=addPersonalItem">
                                            <input type="hidden" name="itemType" value="note" />
                                            <input type="hidden" name="view" value="notes" />
                                            <input type="hidden" name="securityToken" value="<?php $this->_($this->addPersonalItemToken); ?>" />
                                            <div class="notes-field">
                                                <label class="notes-label" for="noteTitle">Title (optional)</label>
                                                <input class="notes-input" id="noteTitle" name="title" maxlength="255" />
                                            </div>
                                            <div class="notes-field">
                                                <label class="notes-label" for="noteBody">Note</label>
                                                <textarea class="notes-textarea notes-textarea--xl" id="noteBody" name="body" maxlength="4000" required="required"></textarea>
                                            </div>
                                            <button type="submit" class="ui2-button ui2-button--primary">Save Note</button>
                                        </form>
                                    </div>
                                </div>

                                <div class="notes-panel">
                                    <div class="notes-panel-head">My Notes</div>
                                    <div class="notes-list">
                                        <?php if (!empty($this->noteItems)): ?>
                                            <?php foreach ($this->noteItems as $noteItem): ?>
                                                <div class="notes-item">
                                                    <div class="notes-item-head">
                                                        <div class="notes-item-title">
                                                            <?php if ($noteItem['title'] !== ''): ?>
                                                                <?php $this->_($noteItem['title']); ?>
                                                            <?php else: ?>
                                                                (Untitled note)
                                                            <?php endif; ?>
                                                        </div>
                                                        <div class="notes-item-meta"><?php $this->_($noteItem['dateCreated']); ?></div>
                                                    </div>
                                                    <div class="notes-item-body"><?php echo($noteItem['bodyHTML']); ?></div>
                                                    <div class="notes-item-actions">
                                                        <button
                                                            type="button"
                                                            class="notes-inline-button"
                                                            onclick="MyNotes_togglePanel('appendNotePanel<?php echo((int) $noteItem['itemID']); ?>');"
                                                        >Edit / Append</button>
                                                        <button
                                                            type="button"
                                                            class="notes-inline-button"
                                                            onclick="MyNotes_togglePanel('sendNotePanel<?php echo((int) $noteItem['itemID']); ?>');"
                                                        >Send Note</button>
                                                        <form class="notes-inline-form" method="post" action="<?php echo(CATSUtility::getIndexName()); ?>?m=home&amp;a=movePersonalNoteToTodo">
                                                            <input type="hidden" name="itemID" value="<?php echo((int) $noteItem['itemID']); ?>" />
                                                            <input type="hidden" name="securityToken" value="<?php $this->_($this->movePersonalNoteToTodoToken); ?>" />
                                                            <button type="submit" class="notes-inline-button primary">Move to To-do</button>
                                                        </form>
                                                        <form class="notes-inline-form" method="post" action="<?php echo(CATSUtility::getIndexName()); ?>?m=home&amp;a=deletePersonalItem" onsubmit="return confirm('Delete this note?');">
                                                            <input type="hidden" name="itemID" value="<?php echo((int) $noteItem['itemID']); ?>" />
                                                            <input type="hidden" name="view" value="notes" />
                                                            <input type="hidden" name="securityToken" value="<?php $this->_($this->deletePersonalItemToken); ?>" />
                                                            <button type="submit" class="notes-inline-button danger">Delete</button>
                                                        </form>
                                                    </div>
                                                    <div class="notes-inline-panel" id="appendNotePanel<?php echo((int) $noteItem['itemID']); ?>" style="display: none;">
                                                        <div class="notes-inline-panel-title">Append to this note</div>
                                                        <form method="post" action="<?php echo(CATSUtility::getIndexName()); ?>?m=home&amp;a=appendPersonalNote">
                                                            <input type="hidden" name="itemID" value="<?php echo((int) $noteItem['itemID']); ?>" />
                                                            <input type="hidden" name="securityToken" value="<?php $this->_($this->appendPersonalNoteToken); ?>" />
                                                            <textarea class="notes-textarea" name="appendBody" maxlength="4000" required="required" placeholder="Add new content to this note..."></textarea>
                                                            <div style="margin-top: 8px;">
                                                                <button type="submit" class="ui2-button ui2-button--primary">Append</button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                    <div class="notes-inline-panel" id="sendNotePanel<?php echo((int) $noteItem['itemID']); ?>" style="display: none;">
                                                        <div class="notes-inline-panel-title">Send this note to teammates</div>
                                                        <?php if (!empty($this->shareTargetUsers)): ?>
                                                            <form method="post" action="<?php echo(CATSUtility::getIndexName()); ?>?m=home&amp;a=sendPersonalNote">
                                                                <input type="hidden" name="itemID" value="<?php echo((int) $noteItem['itemID']); ?>" />
                                                                <input type="hidden" name="securityToken" value="<?php $this->_($this->sendPersonalNoteToken); ?>" />
                                                                <div class="notes-recipient-tools">
                                                                    <input
                                                                        type="text"
                                                                        class="notes-input"
                                                                        id="noteRecipientSearch<?php echo((int) $noteItem['itemID']); ?>"
                                                                        placeholder="Search users..."
                                                                        onkeyup="MyNotes_filterRecipients(<?php echo((int) $noteItem['itemID']); ?>);"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        class="notes-inline-button"
                                                                        onclick="MyNotes_setRecipientSelection(<?php echo((int) $noteItem['itemID']); ?>, true);"
                                                                    >Select all</button>
                                                                    <button
                                                                        type="button"
                                                                        class="notes-inline-button"
                                                                        onclick="MyNotes_setRecipientSelection(<?php echo((int) $noteItem['itemID']); ?>, false);"
                                                                    >Clear</button>
                                                                </div>
                                                                <select
                                                                    name="recipientUserIDs[]"
                                                                    id="noteRecipientList<?php echo((int) $noteItem['itemID']); ?>"
                                                                    multiple="multiple"
                                                                    class="notes-input notes-multi-select"
                                                                    required="required"
                                                                >
                                                                    <?php foreach ($this->shareTargetUsers as $shareTargetUser): ?>
                                                                        <option value="<?php echo((int) $shareTargetUser['userID']); ?>" data-name="<?php echo(htmlspecialchars(strtolower($shareTargetUser['fullName']), ENT_QUOTES)); ?>"><?php $this->_($shareTargetUser['fullName']); ?></option>
                                                                    <?php endforeach; ?>
                                                                </select>
                                                                <div class="notes-help">Use Ctrl/Command + click to select multiple users.</div>
                                                                <div style="margin-top: 8px;">
                                                                    <button type="submit" class="ui2-button ui2-button--primary">Send Note</button>
                                                                </div>
                                                            </form>
                                                        <?php else: ?>
                                                            <div class="notes-help">No users available to receive notes.</div>
                                                        <?php endif; ?>
                                                    </div>
                                                </div>
                                            <?php endforeach; ?>
                                        <?php else: ?>
                                            <div class="notes-empty">
                                                No notes yet. Add your first note from the panel on the left.
                                            </div>
                                        <?php endif; ?>
                                    </div>
                                </div>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>
<script type="text/javascript">
    function MyNotes_togglePanel(panelID)
    {
        var panel = document.getElementById(panelID);
        if (!panel)
        {
            return false;
        }

        if (panel.style.display === 'none' || panel.style.display === '')
        {
            panel.style.display = 'block';
        }
        else
        {
            panel.style.display = 'none';
        }

        return false;
    }

    function MyNotes_filterRecipients(noteID)
    {
        var search = document.getElementById('noteRecipientSearch' + noteID);
        var list = document.getElementById('noteRecipientList' + noteID);
        if (!search || !list)
        {
            return false;
        }

        var query = String(search.value || '').toLowerCase().replace(/^\s+|\s+$/g, '');
        for (var i = 0; i < list.options.length; i++)
        {
            var option = list.options[i];
            var name = option.getAttribute('data-name') || String(option.text || '').toLowerCase();
            var visible = (query === '' || name.indexOf(query) !== -1);
            option.style.display = visible ? '' : 'none';
        }

        return false;
    }

    function MyNotes_setRecipientSelection(noteID, selectAll)
    {
        var list = document.getElementById('noteRecipientList' + noteID);
        if (!list)
        {
            return false;
        }

        for (var i = 0; i < list.options.length; i++)
        {
            var option = list.options[i];
            if (option.style.display === 'none')
            {
                continue;
            }
            option.selected = !!selectAll;
        }

        return false;
    }

    function MyNotes_openTodoModal()
    {
        var backdrop = document.getElementById('todoCreateModalBackdrop');
        var panel = document.getElementById('todoCreateModalPanel');
        if (backdrop)
        {
            backdrop.style.display = 'block';
        }
        if (panel)
        {
            panel.style.display = 'block';
        }
        return false;
    }

    function MyNotes_closeTodoModal()
    {
        var backdrop = document.getElementById('todoCreateModalBackdrop');
        var panel = document.getElementById('todoCreateModalPanel');
        if (backdrop)
        {
            backdrop.style.display = 'none';
        }
        if (panel)
        {
            panel.style.display = 'none';
        }
        return false;
    }

    function MyNotes_toDateTimeLocal(reminderAtRaw)
    {
        var value = String(reminderAtRaw || '').replace(/^\s+|\s+$/g, '');
        if (value === '')
        {
            return '';
        }

        if (value.length >= 16)
        {
            value = value.substring(0, 16);
        }

        return value.replace(' ', 'T');
    }

    function MyNotes_openTodoEditModal(itemID)
    {
        var dataNode = document.getElementById('todoCardData' + itemID);
        if (!dataNode)
        {
            return false;
        }

        var data = {};
        try
        {
            data = JSON.parse(dataNode.textContent || dataNode.innerText || '{}');
        }
        catch (e)
        {
            data = {};
        }

        var fieldItemID = document.getElementById('todoEditItemID');
        var fieldTitle = document.getElementById('todoEditTitle');
        var fieldBody = document.getElementById('todoEditBody');
        var fieldDueDate = document.getElementById('todoEditDueDate');
        var fieldPriority = document.getElementById('todoEditPriority');
        var fieldReminderAt = document.getElementById('todoEditReminderAt');
        var fieldStatus = document.getElementById('todoEditStatus');

        if (fieldItemID) fieldItemID.value = data.itemID || itemID;
        if (fieldTitle) fieldTitle.value = data.title || '';
        if (fieldBody) fieldBody.value = data.body || '';
        if (fieldDueDate) fieldDueDate.value = data.dueDate || '';
        if (fieldPriority) fieldPriority.value = data.priority || 'medium';
        if (fieldReminderAt) fieldReminderAt.value = MyNotes_toDateTimeLocal(data.reminderAtRaw || '');
        if (fieldStatus) fieldStatus.value = data.taskStatus || 'open';

        var backdrop = document.getElementById('todoEditModalBackdrop');
        var panel = document.getElementById('todoEditModalPanel');
        if (backdrop)
        {
            backdrop.style.display = 'block';
        }
        if (panel)
        {
            panel.style.display = 'block';
        }

        return false;
    }

    function MyNotes_closeTodoEditModal()
    {
        var backdrop = document.getElementById('todoEditModalBackdrop');
        var panel = document.getElementById('todoEditModalPanel');
        if (backdrop)
        {
            backdrop.style.display = 'none';
        }
        if (panel)
        {
            panel.style.display = 'none';
        }
        return false;
    }

    function MyNotes_kanbanDragStart(event, cardElement)
    {
        if (!event || !event.dataTransfer || !cardElement)
        {
            return;
        }

        var itemID = cardElement.getAttribute('data-item-id');
        var currentStatus = cardElement.getAttribute('data-current-status');
        event.dataTransfer.setData('text/plain', String(itemID || ''));
        event.dataTransfer.setData('application/x-cats-status', String(currentStatus || ''));
        event.dataTransfer.effectAllowed = 'move';
    }

    function MyNotes_kanbanDragOver(event, columnElement)
    {
        if (!event || !columnElement)
        {
            return false;
        }
        if (event.preventDefault)
        {
            event.preventDefault();
        }
        columnElement.classList.add('is-drop-target');
        return false;
    }

    function MyNotes_kanbanDragLeave(columnElement)
    {
        if (!columnElement)
        {
            return false;
        }
        columnElement.classList.remove('is-drop-target');
        return false;
    }

    function MyNotes_kanbanDrop(event, columnElement)
    {
        if (!event || !columnElement || !event.dataTransfer)
        {
            return false;
        }
        if (event.preventDefault)
        {
            event.preventDefault();
        }
        columnElement.classList.remove('is-drop-target');

        var itemID = event.dataTransfer.getData('text/plain');
        var fromStatus = event.dataTransfer.getData('application/x-cats-status');
        var toStatus = columnElement.getAttribute('data-status');
        if (!itemID || !toStatus || toStatus === fromStatus)
        {
            return false;
        }

        var itemField = document.getElementById('todoKanbanMoveItemID');
        var statusField = document.getElementById('todoKanbanMoveTaskStatus');
        var form = document.getElementById('todoKanbanMoveForm');
        if (!itemField || !statusField || !form)
        {
            return false;
        }

        itemField.value = itemID;
        statusField.value = toStatus;
        form.submit();
        return false;
    }
</script>
<?php TemplateUtility::printFooter(); ?>
