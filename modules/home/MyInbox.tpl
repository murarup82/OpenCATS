<?php TemplateUtility::printHeader('Overview - My Inbox', array('js/sweetTitles.js')); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active, 'My Inbox'); ?>
<div id="main" class="home">
    <?php TemplateUtility::printQuickSearch(); ?>

    <div id="contents"<?php echo TemplateUtility::getUI2WrapperAttribute(); ?> style="padding-top: 10px;">
        <div class="ui2-page">
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
                    Candidate inbox tables are missing. Apply schema migrations from Settings -> Schema Migrations.
                </div>
            <?php else: ?>
                <div class="ui2-grid">
                    <div class="ui2-col-main" style="width: 40%;">
                        <div class="ui2-card ui2-card--section">
                            <div class="ui2-card-header">
                                <div class="ui2-card-title">Threads</div>
                            </div>
                            <table class="ui2-table">
                                <tr>
                                    <th align="left">Candidate</th>
                                    <th align="left" width="120">Last Message</th>
                                    <th align="left" width="80">Unread</th>
                                </tr>
                                <?php if (!empty($this->threads)): ?>
                                    <?php foreach ($this->threads as $rowNumber => $thread): ?>
                                        <tr class="<?php TemplateUtility::printAlternatingRowClass($rowNumber); ?><?php if ((int) $this->selectedThreadID === (int) $thread['threadID']) echo(' pipelineClosedRow'); ?>">
                                            <td valign="top">
                                                <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=home&amp;a=inbox&amp;threadID=<?php echo((int) $thread['threadID']); ?>">
                                                    <?php $this->_($thread['candidateName']); ?>
                                                </a>
                                                <div style="font-size: 10px; color: #666;"><?php $this->_($thread['snippet']); ?></div>
                                            </td>
                                            <td valign="top"><?php $this->_($thread['lastMessageAt']); ?></td>
                                            <td valign="top">
                                                <?php if ((int) $thread['unreadCount'] > 0): ?>
                                                    <span class="pipelineClosedTag"><?php echo((int) $thread['unreadCount']); ?></span>
                                                <?php else: ?>
                                                    0
                                                <?php endif; ?>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                <?php else: ?>
                                    <tr>
                                        <td colspan="3">(No conversations yet)</td>
                                    </tr>
                                <?php endif; ?>
                            </table>
                        </div>
                    </div>
                    <div class="ui2-col-side" style="width: 60%;">
                        <div class="ui2-card ui2-card--section">
                            <div class="ui2-card-header">
                                <div class="ui2-card-title">
                                    <?php if (!empty($this->selectedThread)): ?>
                                        Conversation: <?php $this->_($this->selectedThread['candidateFirstName']); ?> <?php $this->_($this->selectedThread['candidateLastName']); ?>
                                    <?php else: ?>
                                        Conversation
                                    <?php endif; ?>
                                </div>
                                <?php if (!empty($this->selectedThread)): ?>
                                    <div class="ui2-card-actions">
                                        <a class="ui2-button ui2-button--secondary" href="<?php echo(CATSUtility::getIndexName()); ?>?m=candidates&amp;a=show&amp;candidateID=<?php echo((int) $this->selectedThread['candidateID']); ?>&amp;showMessages=1">
                                            Open Candidate
                                        </a>
                                    </div>
                                <?php endif; ?>
                            </div>

                            <?php if (!empty($this->selectedThread)): ?>
                                <div style="margin-bottom: 8px; max-height: 440px; overflow-y: auto;">
                                    <table class="ui2-table">
                                        <tr>
                                            <th align="left" width="160">Date</th>
                                            <th align="left" width="140">From</th>
                                            <th align="left" width="170">Mentions</th>
                                            <th align="left">Message</th>
                                        </tr>
                                        <?php if (!empty($this->messages)): ?>
                                            <?php foreach ($this->messages as $rowNumber => $message): ?>
                                                <tr class="<?php TemplateUtility::printAlternatingRowClass($rowNumber); ?>">
                                                    <td valign="top"><?php $this->_($message['dateCreated']); ?></td>
                                                    <td valign="top"><?php $this->_($message['senderName']); ?></td>
                                                    <td valign="top"><?php if (!empty($message['mentionedUsers'])) $this->_($message['mentionedUsers']); else echo('--'); ?></td>
                                                    <td valign="top"><?php echo($message['bodyHTML']); ?></td>
                                                </tr>
                                            <?php endforeach; ?>
                                        <?php else: ?>
                                            <tr>
                                                <td colspan="4">(No messages yet)</td>
                                            </tr>
                                        <?php endif; ?>
                                    </table>
                                </div>
                                <form method="post" action="<?php echo(CATSUtility::getIndexName()); ?>?m=home&amp;a=postInboxMessage">
                                    <input type="hidden" name="threadID" value="<?php echo((int) $this->selectedThread['threadID']); ?>" />
                                    <input type="hidden" name="securityToken" value="<?php $this->_($this->postInboxMessageToken); ?>" />
                                    <div style="margin-bottom: 6px;">
                                        <textarea
                                            class="ui2-textarea"
                                            style="width: 100%;"
                                            rows="4"
                                            maxlength="4000"
                                            name="messageBody"
                                            placeholder="Reply here. Mention teammates with @First Last."
                                            required="required"
                                        ></textarea>
                                    </div>
                                    <?php if (!empty($this->mentionHintNames)): ?>
                                        <div style="margin-bottom: 8px; font-size: 11px; color: #666;">
                                            Mention examples:
                                            <?php foreach ($this->mentionHintNames as $mentionIndex => $mentionName): ?>
                                                <?php if ($mentionIndex > 0): ?>, <?php endif; ?>
                                                @<?php $this->_($mentionName); ?>
                                            <?php endforeach; ?>
                                        </div>
                                    <?php endif; ?>
                                    <button type="submit" class="ui2-button ui2-button--primary">Send Reply</button>
                                </form>
                            <?php else: ?>
                                <div class="ui2-ai-status">
                                    Select a thread from the left to open it.
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>
<?php TemplateUtility::printFooter(); ?>
