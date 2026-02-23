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
                    grid-template-columns: 360px minmax(0, 1fr);
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
                    min-height: 130px;
                    resize: vertical;
                    font-family: "Segoe UI", "Tahoma", "Verdana", sans-serif;
                    line-height: 1.45;
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
                            <div class="notes-grid">
                                <div class="notes-panel">
                                    <div class="notes-panel-head">Add To-do</div>
                                    <div class="notes-panel-body">
                                        <form method="post" action="<?php echo(CATSUtility::getIndexName()); ?>?m=home&amp;a=addPersonalItem">
                                            <input type="hidden" name="itemType" value="todo" />
                                            <input type="hidden" name="view" value="todos" />
                                            <input type="hidden" name="securityToken" value="<?php $this->_($this->addPersonalItemToken); ?>" />
                                            <div class="notes-field">
                                                <label class="notes-label" for="todoTitle">Title (optional)</label>
                                                <input class="notes-input" id="todoTitle" name="title" maxlength="255" />
                                            </div>
                                            <div class="notes-field">
                                                <label class="notes-label" for="todoDueDate">Due Date (optional)</label>
                                                <input class="notes-input" id="todoDueDate" name="dueDate" type="date" />
                                            </div>
                                            <div class="notes-field">
                                                <label class="notes-label" for="todoPriority">Priority</label>
                                                <select class="notes-input" id="todoPriority" name="priority">
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
                                                <label class="notes-label" for="todoReminderAt">Reminder (optional)</label>
                                                <input class="notes-input" id="todoReminderAt" name="reminderAt" type="datetime-local" />
                                            </div>
                                            <div class="notes-field">
                                                <label class="notes-label" for="todoBody">Task Details</label>
                                                <textarea class="notes-textarea" id="todoBody" name="body" maxlength="4000" required="required"></textarea>
                                            </div>
                                            <button type="submit" class="ui2-button ui2-button--primary">Add To-do</button>
                                        </form>
                                    </div>
                                </div>

                                <div class="notes-panel">
                                    <div class="notes-panel-head">
                                        To-do List
                                        <span style="font-weight: 500; color: #5f7388; font-size: 12px;">
                                            (<?php echo((int) $this->summary['todoOpenCount']); ?> open / <?php echo((int) $this->summary['todoDoneCount']); ?> done / <?php echo((int) $this->summary['reminderDueCount']); ?> reminders due)
                                        </span>
                                    </div>
                                    <div class="notes-list">
                                        <?php if (!empty($this->todoItems)): ?>
                                            <?php foreach ($this->todoItems as $todoItem): ?>
                                                <div class="notes-item">
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
                                                        <?php if ((int) $todoItem['isCompleted'] === 1): ?>
                                                            <span class="notes-pill done">Completed</span>
                                                            <?php if (!empty($todoItem['dateCompleted'])): ?>
                                                                Completed: <?php $this->_($todoItem['dateCompleted']); ?>
                                                            <?php endif; ?>
                                                        <?php else: ?>
                                                            <span class="notes-pill">Open</span>
                                                        <?php endif; ?>
                                                        <?php if (!empty($todoItem['priority'])): ?>
                                                            <span class="notes-pill priority-<?php echo(htmlspecialchars($todoItem['priority'], ENT_QUOTES)); ?>">
                                                                Priority: <?php $this->_(ucfirst($todoItem['priority'])); ?>
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
                                                        <form class="notes-inline-form" method="post" action="<?php echo(CATSUtility::getIndexName()); ?>?m=home&amp;a=togglePersonalTodo">
                                                            <input type="hidden" name="itemID" value="<?php echo((int) $todoItem['itemID']); ?>" />
                                                            <input type="hidden" name="view" value="todos" />
                                                            <input type="hidden" name="isCompleted" value="<?php if ((int) $todoItem['isCompleted'] === 1) echo('0'); else echo('1'); ?>" />
                                                            <input type="hidden" name="securityToken" value="<?php $this->_($this->togglePersonalTodoToken); ?>" />
                                                            <?php if ((int) $todoItem['isCompleted'] === 1): ?>
                                                                <button type="submit" class="notes-inline-button primary">Reopen</button>
                                                            <?php else: ?>
                                                                <button type="submit" class="notes-inline-button primary">Mark Done</button>
                                                            <?php endif; ?>
                                                        </form>
                                                        <form class="notes-inline-form" method="post" action="<?php echo(CATSUtility::getIndexName()); ?>?m=home&amp;a=deletePersonalItem" onsubmit="return confirm('Delete this item?');">
                                                            <input type="hidden" name="itemID" value="<?php echo((int) $todoItem['itemID']); ?>" />
                                                            <input type="hidden" name="view" value="todos" />
                                                            <input type="hidden" name="securityToken" value="<?php $this->_($this->deletePersonalItemToken); ?>" />
                                                            <button type="submit" class="notes-inline-button danger">Delete</button>
                                                        </form>
                                                    </div>
                                                </div>
                                            <?php endforeach; ?>
                                        <?php else: ?>
                                            <div class="notes-empty">
                                                No to-do items yet. Add one from the panel on the left.
                                            </div>
                                        <?php endif; ?>
                                    </div>
                                </div>
                            </div>
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
                                                <textarea class="notes-textarea" id="noteBody" name="body" maxlength="4000" required="required"></textarea>
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
<?php TemplateUtility::printFooter(); ?>
