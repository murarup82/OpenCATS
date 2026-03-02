<?php TemplateUtility::printHeader('UI Logs'); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active); ?>
    <div id="main">
        <?php TemplateUtility::printQuickSearch(); ?>

        <div id="contents"<?php echo TemplateUtility::getUI2WrapperAttribute(); ?>>
            <table>
                <tr>
                    <td width="3%">
                        <img src="images/reports.gif" width="24" height="24" border="0" alt="Logs" style="margin-top: 3px;" />&nbsp;
                    </td>
                    <td><h2>Interaction Logs</h2></td>
                </tr>
            </table>

            <p class="noteUnsizedSpan">
                Plain text logs for easy copy/paste. Format: <strong>timestamp | event | route | details(json)</strong>.
            </p>

            <style type="text/css">
                .interaction-log-toolbar {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                    margin: 8px 0 10px 0;
                }
                .interaction-log-status {
                    font-size: 11px;
                    color: #334;
                    margin-left: 2px;
                }
                .interaction-log-output {
                    width: 100%;
                    min-height: 560px;
                    border: 1px solid #c9d2db;
                    border-radius: 4px;
                    box-sizing: border-box;
                    padding: 10px;
                    font-family: Consolas, "Courier New", monospace;
                    font-size: 11px;
                    line-height: 1.35;
                    color: #1a2530;
                    background: #fff;
                }
            </style>

            <div class="interaction-log-toolbar">
                <button type="button" class="ui2-button ui2-button--secondary" id="interactionLogRefresh">Refresh</button>
                <button type="button" class="ui2-button ui2-button--secondary" id="interactionLogCopy">Copy</button>
                <button type="button" class="ui2-button ui2-button--danger" id="interactionLogClear">Clear Logs</button>
                <span class="interaction-log-status" id="interactionLogStatus">Loading...</span>
            </div>

            <textarea id="interactionLogOutput" class="interaction-log-output" readonly="readonly"></textarea>

            <script type="text/javascript">
                (function () {
                    var MAX_VISIBLE_LINES = 1500;
                    var output = document.getElementById('interactionLogOutput');
                    var status = document.getElementById('interactionLogStatus');
                    var refreshButton = document.getElementById('interactionLogRefresh');
                    var copyButton = document.getElementById('interactionLogCopy');
                    var clearButton = document.getElementById('interactionLogClear');
                    var unsubscribe = null;

                    function compactJSON(value) {
                        try {
                            return JSON.stringify(value == null ? {} : value);
                        } catch (error) {
                            return '{"error":"unserializable"}';
                        }
                    }

                    function formatTimestamp(rawValue) {
                        var input = String(rawValue || '');
                        if (input === '') {
                            return '';
                        }
                        return input.replace('T', ' ').replace('Z', '');
                    }

                    function formatRoute(entry) {
                        if (!entry || !entry.route) {
                            return '(unknown)';
                        }
                        var moduleName = String(entry.route.module || '');
                        var actionName = String(entry.route.action || '');
                        if (moduleName === '' && actionName === '') {
                            return '(unknown)';
                        }
                        if (actionName === '') {
                            return moduleName + '/(default)';
                        }
                        return moduleName + '/' + actionName;
                    }

                    function toLine(entry) {
                        var safeEntry = entry || {};
                        var ts = formatTimestamp(safeEntry.timestamp);
                        var type = String(safeEntry.type || '');
                        var route = formatRoute(safeEntry);
                        var details = compactJSON(safeEntry.details || {});
                        return ts + ' | ' + type + ' | ' + route + ' | ' + details;
                    }

                    function renderText() {
                        var logger = window.OpenCATSInteractionLog;
                        if (!logger || typeof logger.getEntries !== 'function') {
                            output.value = 'Interaction logger is unavailable on this page.';
                            status.textContent = 'Logger unavailable';
                            return;
                        }

                        var allEntries = logger.getEntries();
                        if (!allEntries.length) {
                            output.value = '';
                            status.textContent = '0 entries';
                            return;
                        }

                        var visibleEntries = logger.getEntries(MAX_VISIBLE_LINES).slice().reverse();
                        var lines = [];
                        for (var i = 0; i < visibleEntries.length; i++) {
                            lines.push(toLine(visibleEntries[i]));
                        }
                        output.value = lines.join('\n');

                        if (allEntries.length > visibleEntries.length) {
                            status.textContent = 'Showing latest ' + visibleEntries.length + ' of ' + allEntries.length + ' entries';
                        } else {
                            status.textContent = allEntries.length + ' entries';
                        }
                    }

                    function copyText() {
                        var text = String(output.value || '');
                        if (text === '') {
                            status.textContent = 'Nothing to copy';
                            return;
                        }

                        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                            navigator.clipboard.writeText(text).then(function () {
                                status.textContent = 'Copied';
                            }, function () {
                                status.textContent = 'Copy failed';
                            });
                            return;
                        }

                        output.focus();
                        output.select();
                        try {
                            document.execCommand('copy');
                            status.textContent = 'Copied';
                        } catch (error) {
                            status.textContent = 'Copy failed';
                        }
                    }

                    function clearLogs() {
                        var logger = window.OpenCATSInteractionLog;
                        if (!logger || typeof logger.clear !== 'function') {
                            return;
                        }

                        if (!window.confirm('Clear all captured UI logs for this browser?')) {
                            return;
                        }

                        logger.clear();
                        renderText();
                    }

                    refreshButton.onclick = function () {
                        renderText();
                    };

                    copyButton.onclick = function () {
                        copyText();
                    };

                    clearButton.onclick = function () {
                        clearLogs();
                    };

                    if (window.OpenCATSInteractionLog &&
                        typeof window.OpenCATSInteractionLog.onChange === 'function')
                    {
                        unsubscribe = window.OpenCATSInteractionLog.onChange(function () {
                            renderText();
                        });
                    }

                    window.addEventListener('beforeunload', function () {
                        if (typeof unsubscribe === 'function') {
                            unsubscribe();
                        }
                    });

                    renderText();
                })();
            </script>
        </div>
    </div>
<?php TemplateUtility::printFooter(); ?>
