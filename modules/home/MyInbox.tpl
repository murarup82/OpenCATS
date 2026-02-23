<?php TemplateUtility::printHeader('Overview - My Inbox', array('js/sweetTitles.js', 'js/mentionAutocomplete.js')); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active, 'My Inbox'); ?>
<div id="main" class="home">
    <?php TemplateUtility::printQuickSearch(); ?>

    <div id="contents"<?php echo TemplateUtility::getUI2WrapperAttribute(); ?> style="padding-top: 10px;">
        <div class="ui2-page">
            <style type="text/css">
                .my-inbox-page {
                    --inbox-bg: #f3f6fa;
                    --inbox-pane: #ffffff;
                    --inbox-border: #d7e0ea;
                    --inbox-text: #142433;
                    --inbox-muted: #617486;
                    --inbox-primary: #0078d4;
                    --inbox-primary-soft: #e7f2ff;
                    --inbox-unread: #0b5cab;
                    font-family: "Segoe UI", "Tahoma", "Verdana", sans-serif;
                }
                .my-inbox-page .inbox-shell {
                    display: grid;
                    grid-template-columns: 340px minmax(0, 1fr);
                    gap: 16px;
                    min-height: 620px;
                    background: linear-gradient(180deg, #f8fbff 0%, var(--inbox-bg) 100%);
                    border: 1px solid var(--inbox-border);
                    border-radius: 10px;
                    padding: 12px;
                }
                .my-inbox-page .inbox-pane {
                    background: var(--inbox-pane);
                    border: 1px solid var(--inbox-border);
                    border-radius: 8px;
                    min-height: 0;
                }
                .my-inbox-page .inbox-pane-header {
                    padding: 12px 14px;
                    border-bottom: 1px solid var(--inbox-border);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                }
                .my-inbox-page .inbox-pane-title {
                    font-size: 16px;
                    font-weight: 700;
                    letter-spacing: 0.02em;
                    color: #0f3c64;
                }
                .my-inbox-page .inbox-pane-subtitle {
                    font-size: 12px;
                    color: var(--inbox-muted);
                }
                .my-inbox-page .inbox-thread-list {
                    max-height: 720px;
                    overflow-y: auto;
                }
                .my-inbox-page .inbox-thread-item {
                    display: block;
                    text-decoration: none;
                    color: var(--inbox-text);
                    padding: 12px 14px;
                    border-bottom: 1px solid #edf2f7;
                    transition: background-color 0.15s ease, border-left-color 0.15s ease;
                    border-left: 3px solid transparent;
                }
                .my-inbox-page .inbox-thread-item:hover {
                    background: #f7fbff;
                }
                .my-inbox-page .inbox-thread-item.selected {
                    background: var(--inbox-primary-soft);
                    border-left-color: var(--inbox-primary);
                }
                .my-inbox-page .inbox-thread-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 8px;
                    margin-bottom: 5px;
                }
                .my-inbox-page .inbox-thread-name {
                    font-weight: 700;
                    color: #123a5d;
                    font-size: 14px;
                    line-height: 1.2;
                }
                .my-inbox-page .inbox-thread-time {
                    color: var(--inbox-muted);
                    font-size: 12px;
                    white-space: nowrap;
                }
                .my-inbox-page .inbox-thread-bottom {
                    display: flex;
                    justify-content: space-between;
                    gap: 8px;
                    align-items: flex-start;
                }
                .my-inbox-page .inbox-thread-snippet {
                    font-size: 12px;
                    color: #3f5366;
                    line-height: 1.35;
                    max-height: 2.8em;
                    overflow: hidden;
                }
                .my-inbox-page .inbox-unread-badge {
                    background: var(--inbox-unread);
                    color: #fff;
                    min-width: 20px;
                    height: 20px;
                    border-radius: 999px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                    font-weight: 700;
                    padding: 0 6px;
                }
                .my-inbox-page .inbox-unread-none {
                    color: #90a4b7;
                    font-size: 12px;
                    min-width: 20px;
                    text-align: center;
                }
                .my-inbox-page .inbox-empty {
                    padding: 16px;
                    color: var(--inbox-muted);
                    font-size: 13px;
                }
                .my-inbox-page .inbox-reading-pane {
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                }
                .my-inbox-page .inbox-reading-title {
                    font-size: 18px;
                    color: #0f3c64;
                    font-weight: 700;
                }
                .my-inbox-page .inbox-reading-actions {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                    flex-wrap: wrap;
                }
                .my-inbox-page .inbox-message-list {
                    flex: 1 1 auto;
                    min-height: 280px;
                    max-height: 500px;
                    overflow-y: auto;
                    padding: 14px;
                    background: #f8fbff;
                    border-bottom: 1px solid var(--inbox-border);
                }
                .my-inbox-page .inbox-message-item {
                    background: #ffffff;
                    border: 1px solid #e3ebf3;
                    border-radius: 10px;
                    padding: 10px 12px;
                    margin-bottom: 10px;
                    box-shadow: 0 1px 1px rgba(9, 30, 66, 0.04);
                }
                .my-inbox-page .inbox-message-item:last-child {
                    margin-bottom: 0;
                }
                .my-inbox-page .inbox-message-meta {
                    display: flex;
                    justify-content: space-between;
                    gap: 8px;
                    align-items: baseline;
                    margin-bottom: 6px;
                }
                .my-inbox-page .inbox-message-sender {
                    font-size: 13px;
                    font-weight: 700;
                    color: #123a5d;
                }
                .my-inbox-page .inbox-message-date {
                    font-size: 11px;
                    color: #6b7e92;
                    white-space: nowrap;
                }
                .my-inbox-page .inbox-message-mentions {
                    margin-bottom: 6px;
                    font-size: 11px;
                    color: #0c6bb4;
                    font-weight: 700;
                }
                .my-inbox-page .inbox-message-body {
                    font-size: 13px;
                    line-height: 1.45;
                    color: #1e2f40;
                    word-break: break-word;
                }
                .my-inbox-page .inbox-composer {
                    padding: 12px 14px 14px 14px;
                    background: #fff;
                }
                .my-inbox-page .inbox-composer textarea {
                    width: 100%;
                    min-height: 170px;
                    border: 1px solid #c5d3e1;
                    border-radius: 8px;
                    padding: 10px 12px;
                    box-sizing: border-box;
                    resize: vertical;
                    font-family: "Consolas", "Lucida Console", monospace;
                    font-size: 13px;
                    line-height: 1.4;
                }
                .my-inbox-page .inbox-mention-help {
                    margin: 8px 0 10px 0;
                    font-size: 11px;
                    color: #5f7284;
                }
                .my-inbox-page .inbox-placeholder {
                    padding: 20px;
                }
                @media (max-width: 1200px) {
                    .my-inbox-page .inbox-shell {
                        grid-template-columns: 300px minmax(0, 1fr);
                    }
                }
                @media (max-width: 960px) {
                    .my-inbox-page .inbox-shell {
                        grid-template-columns: 1fr;
                        min-height: 0;
                    }
                    .my-inbox-page .inbox-thread-list {
                        max-height: 300px;
                    }
                    .my-inbox-page .inbox-message-list {
                        max-height: 380px;
                    }
                }
            </style>
            <div class="ui2-header">
                <div class="ui2-header-title">
                    <h2>Overview: My Inbox</h2>
                </div>
                <div class="ui2-header-actions">
                    <a class="ui2-button ui2-button--secondary" href="<?php echo(CATSUtility::getIndexName()); ?>?m=home&amp;a=home">
                        Back to Dashboard
                    </a>
                </div>
            </div>

            <?php if (!empty($this->flashMessage)): ?>
                <div class="ui2-ai-status" style="margin-bottom: 8px;<?php if (!empty($this->flashIsError)): ?> color:#b00000; border-left-color:#b00000;<?php endif; ?>">
                    <?php $this->_($this->flashMessage); ?>
                </div>
            <?php endif; ?>

            <?php if (empty($this->schemaAvailable)): ?>
                <div class="ui2-ai-status" style="color:#b00000; border-left-color:#b00000;">
                    Inbox tables are missing. Apply schema migrations from Settings -> Schema Migrations.
                </div>
            <?php else: ?>
                <div class="my-inbox-page">
                    <div class="inbox-shell">
                        <div class="inbox-pane">
                            <div class="inbox-pane-header">
                                <div>
                                    <div class="inbox-pane-title">Inbox</div>
                                    <div class="inbox-pane-subtitle"><?php echo((int) count($this->threads)); ?> thread(s)</div>
                                </div>
                            </div>
                            <div class="inbox-thread-list">
                                <?php if (!empty($this->threads)): ?>
                                    <?php foreach ($this->threads as $thread): ?>
                                        <a
                                            class="inbox-thread-item<?php if (!empty($this->selectedThreadKey) && $this->selectedThreadKey === $thread['threadKey']) echo(' selected'); ?>"
                                            href="<?php echo(CATSUtility::getIndexName()); ?>?m=home&amp;a=inbox&amp;threadKey=<?php echo(rawurlencode($thread['threadKey'])); ?>"
                                        >
                                            <div class="inbox-thread-top">
                                                <div class="inbox-thread-name"><?php $this->_($thread['entityName']); ?></div>
                                                <div class="inbox-thread-time"><?php $this->_($thread['lastMessageAt']); ?></div>
                                            </div>
                                            <div class="inbox-thread-bottom">
                                                <div class="inbox-thread-snippet">
                                                    [<?php $this->_($thread['entityType']); ?>]
                                                    <?php if (!empty($thread['entitySubName'])): ?>
                                                        <?php $this->_($thread['entitySubName']); ?> -
                                                    <?php endif; ?>
                                                    <?php $this->_($thread['snippet']); ?>
                                                </div>
                                                <?php if ((int) $thread['unreadCount'] > 0): ?>
                                                    <span class="inbox-unread-badge"><?php echo((int) $thread['unreadCount']); ?></span>
                                                <?php else: ?>
                                                    <span class="inbox-unread-none">0</span>
                                                <?php endif; ?>
                                            </div>
                                        </a>
                                    <?php endforeach; ?>
                                <?php else: ?>
                                    <div class="inbox-empty">No conversations yet.</div>
                                <?php endif; ?>
                            </div>
                        </div>

                        <div class="inbox-pane inbox-reading-pane">
                            <?php if (!empty($this->selectedThread)): ?>
                                <div class="inbox-pane-header">
                                    <div>
                                        <div class="inbox-reading-title">
                                            <?php $this->_($this->selectedThread['entityName']); ?>
                                        </div>
                                        <div class="inbox-pane-subtitle">
                                            <?php $this->_($this->selectedThread['entityType']); ?> conversation history
                                            <?php if (!empty($this->selectedThread['entitySubName'])): ?>
                                                | <?php $this->_($this->selectedThread['entitySubName']); ?>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                    <div class="inbox-reading-actions">
                                        <a class="ui2-button ui2-button--secondary" href="<?php echo($this->selectedThread['openURL']); ?>">
                                            <?php $this->_($this->selectedThread['openLabel']); ?>
                                        </a>
                                        <form method="post" action="<?php echo(CATSUtility::getIndexName()); ?>?m=home&amp;a=deleteInboxThread" style="display:inline;" onsubmit="return confirm('Remove this thread from your inbox?');">
                                            <input type="hidden" name="threadType" value="<?php $this->_($this->selectedThread['threadType']); ?>" />
                                            <input type="hidden" name="threadID" value="<?php echo((int) $this->selectedThread['threadID']); ?>" />
                                            <input type="hidden" name="securityToken" value="<?php $this->_($this->deleteInboxThreadToken); ?>" />
                                            <button type="submit" class="ui2-button ui2-button--danger">Delete Thread</button>
                                        </form>
                                    </div>
                                </div>

                                <div class="inbox-message-list">
                                    <?php if (!empty($this->messages)): ?>
                                        <?php foreach ($this->messages as $message): ?>
                                            <div class="inbox-message-item">
                                                <div class="inbox-message-meta">
                                                    <div class="inbox-message-sender"><?php $this->_($message['senderName']); ?></div>
                                                    <div class="inbox-message-date"><?php $this->_($message['dateCreated']); ?></div>
                                                </div>
                                                <?php if (!empty($message['mentionedUsers'])): ?>
                                                    <div class="inbox-message-mentions">@<?php $this->_($message['mentionedUsers']); ?></div>
                                                <?php endif; ?>
                                                <div class="inbox-message-body"><?php echo($message['bodyHTML']); ?></div>
                                            </div>
                                        <?php endforeach; ?>
                                    <?php else: ?>
                                        <div class="inbox-empty">No messages yet.</div>
                                    <?php endif; ?>
                                </div>

                                <div class="inbox-composer">
                                    <form method="post" action="<?php echo(CATSUtility::getIndexName()); ?>?m=home&amp;a=postInboxMessage">
                                        <input type="hidden" name="threadType" value="<?php $this->_($this->selectedThread['threadType']); ?>" />
                                        <input type="hidden" name="threadID" value="<?php echo((int) $this->selectedThread['threadID']); ?>" />
                                        <input type="hidden" name="securityToken" value="<?php $this->_($this->postInboxMessageToken); ?>" />
                                        <textarea
                                            rows="6"
                                            maxlength="4000"
                                            name="messageBody"
                                            id="inboxMessageBody"
                                            placeholder="Reply here. Mention teammates with @First Last."
                                            required="required"
                                        ></textarea>
                                        <?php if (!empty($this->mentionHintNames)): ?>
                                            <div class="inbox-mention-help">
                                                Mention examples:
                                                <?php foreach ($this->mentionHintNames as $mentionIndex => $mentionName): ?>
                                                    <?php if ($mentionIndex > 0): ?>, <?php endif; ?>
                                                    @<?php $this->_($mentionName); ?>
                                                <?php endforeach; ?>
                                            </div>
                                        <?php endif; ?>
                                        <button type="submit" class="ui2-button ui2-button--primary">Send Reply</button>
                                    </form>
                                </div>
                            <?php else: ?>
                                <div class="inbox-placeholder">
                                    <div class="ui2-ai-status">
                                        Select a thread from the left to open it.
                                    </div>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>
<script type="text/javascript">
    if (typeof MentionAutocomplete !== 'undefined')
    {
        MentionAutocomplete.bind(
            'inboxMessageBody',
            <?php echo json_encode(isset($this->mentionAutocompleteValues) ? $this->mentionAutocompleteValues : array()); ?>
        );
    }
</script>
<?php TemplateUtility::printFooter(); ?>
