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
                Captures UI actions and frontend-to-backend calls (legacy and modern) to help debug behavior mismatches.
            </p>

            <style type="text/css">
                .interaction-log-toolbar {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                    margin: 8px 0 10px 0;
                }
                .interaction-log-count {
                    font-size: 11px;
                    color: #445;
                    margin-left: 4px;
                }
                .interaction-log-table-wrap {
                    border: 1px solid #c9d2db;
                    border-radius: 4px;
                    max-height: 560px;
                    overflow: auto;
                    background: #fff;
                }
                .interaction-log-table {
                    width: 100%;
                    border-collapse: collapse;
                    table-layout: fixed;
                    font-size: 11px;
                }
                .interaction-log-table thead th {
                    position: sticky;
                    top: 0;
                    z-index: 2;
                    background: #0b8fb3;
                    color: #fff;
                    text-align: left;
                    border: 1px solid #0b8fb3;
                    padding: 6px 8px;
                }
                .interaction-log-table td {
                    border: 1px solid #d4dde6;
                    padding: 6px 8px;
                    vertical-align: top;
                    overflow-wrap: anywhere;
                }
                .interaction-log-table tr:nth-child(even) td {
                    background: #f8fbff;
                }
                .interaction-log-col-time {
                    width: 180px;
                    white-space: nowrap;
                }
                .interaction-log-col-type {
                    width: 170px;
                    font-weight: bold;
                    color: #183548;
                }
                .interaction-log-col-route {
                    width: 170px;
                    color: #274b60;
                }
                .interaction-log-col-details pre {
                    margin: 0;
                    white-space: pre-wrap;
                    word-break: break-word;
                    font-family: Consolas, "Courier New", monospace;
                    font-size: 11px;
                    line-height: 1.35;
                }
                .interaction-log-empty {
                    text-align: center;
                    color: #334;
                    padding: 20px;
                }
            </style>

            <div class="interaction-log-toolbar">
                <button type="button" class="ui2-button ui2-button--secondary" id="interactionLogRefresh">Refresh</button>
                <button type="button" class="ui2-button ui2-button--secondary" id="interactionLogCopy">Copy Visible</button>
                <button type="button" class="ui2-button ui2-button--danger" id="interactionLogClear">Clear Logs</button>
                <span class="interaction-log-count" id="interactionLogCount">Loading...</span>
            </div>

            <div class="interaction-log-table-wrap">
                <table class="interaction-log-table">
                    <thead>
                        <tr>
                            <th class="interaction-log-col-time">Time (UTC)</th>
                            <th class="interaction-log-col-type">Type</th>
                            <th class="interaction-log-col-route">Route</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody id="interactionLogBody">
                        <tr>
                            <td colspan="4" class="interaction-log-empty">Loading logs...</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <script type="text/javascript">
                (function () {
                    var MAX_VISIBLE_ROWS = 500;
                    var logsBody = document.getElementById('interactionLogBody');
                    var countElement = document.getElementById('interactionLogCount');
                    var refreshButton = document.getElementById('interactionLogRefresh');
                    var copyButton = document.getElementById('interactionLogCopy');
                    var clearButton = document.getElementById('interactionLogClear');
                    var unsubscribe = null;

                    function escapeHTML(value) {
                        var div = document.createElement('div');
                        div.textContent = value == null ? '' : String(value);
                        return div.innerHTML;
                    }

                    function safeJSON(value) {
                        try {
                            return JSON.stringify(value, null, 2);
                        } catch (error) {
                            return '[Unserializable details]';
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

                    function renderRows() {
                        var logger = window.OpenCATSInteractionLog;
                        if (!logger || typeof logger.getEntries !== 'function') {
                            logsBody.innerHTML = '<tr><td colspan="4" class="interaction-log-empty">Interaction logger is unavailable on this page.</td></tr>';
                            countElement.textContent = 'Logger unavailable';
                            return;
                        }

                        var allEntries = logger.getEntries();
                        var visibleEntries = logger.getEntries(MAX_VISIBLE_ROWS).slice().reverse();

                        if (!visibleEntries.length) {
                            logsBody.innerHTML = '<tr><td colspan="4" class="interaction-log-empty">No logs captured yet. Interact with the UI to generate entries.</td></tr>';
                            countElement.textContent = '0 entries';
                            return;
                        }

                        var rowsHTML = [];
                        for (var i = 0; i < visibleEntries.length; i++) {
                            var entry = visibleEntries[i] || {};
                            rowsHTML.push(
                                '<tr>' +
                                    '<td class="interaction-log-col-time">' + escapeHTML(formatTimestamp(entry.timestamp)) + '</td>' +
                                    '<td class="interaction-log-col-type">' + escapeHTML(entry.type || '') + '</td>' +
                                    '<td class="interaction-log-col-route">' + escapeHTML(formatRoute(entry)) + '</td>' +
                                    '<td class="interaction-log-col-details"><pre>' + escapeHTML(safeJSON(entry.details || {})) + '</pre></td>' +
                                '</tr>'
                            );
                        }

                        logsBody.innerHTML = rowsHTML.join('');

                        if (allEntries.length > visibleEntries.length) {
                            countElement.textContent = 'Showing latest ' + visibleEntries.length + ' of ' + allEntries.length + ' entries';
                        } else {
                            countElement.textContent = allEntries.length + ' entries';
                        }
                    }

                    function clearLogs() {
                        var logger = window.OpenCATSInteractionLog;
                        if (!logger || typeof logger.clear !== 'function') {
                            return;
                        }

                        if (!window.confirm('Clear all captured UI logs for this browser session?')) {
                            return;
                        }

                        logger.clear();
                        renderRows();
                    }

                    function copyVisibleLogs() {
                        var logger = window.OpenCATSInteractionLog;
                        if (!logger || typeof logger.getEntries !== 'function') {
                            return;
                        }

                        var visibleEntries = logger.getEntries(MAX_VISIBLE_ROWS).slice().reverse();
                        if (!visibleEntries.length) {
                            countElement.textContent = 'Nothing to copy';
                            return;
                        }

                        var lines = [];
                        for (var i = 0; i < visibleEntries.length; i++) {
                            var entry = visibleEntries[i] || {};
                            lines.push(
                                formatTimestamp(entry.timestamp) +
                                ' | ' + String(entry.type || '') +
                                ' | ' + formatRoute(entry) +
                                ' | ' + safeJSON(entry.details || {})
                            );
                        }
                        var copyPayload = lines.join('\n');

                        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                            navigator.clipboard.writeText(copyPayload).then(function () {
                                countElement.textContent = 'Copied ' + visibleEntries.length + ' entries';
                            }, function () {
                                countElement.textContent = 'Copy failed';
                            });
                            return;
                        }

                        var textarea = document.createElement('textarea');
                        textarea.value = copyPayload;
                        textarea.style.position = 'fixed';
                        textarea.style.left = '-9999px';
                        document.body.appendChild(textarea);
                        textarea.focus();
                        textarea.select();
                        try {
                            document.execCommand('copy');
                            countElement.textContent = 'Copied ' + visibleEntries.length + ' entries';
                        } catch (error) {
                            countElement.textContent = 'Copy failed';
                        }
                        document.body.removeChild(textarea);
                    }

                    refreshButton.onclick = function () {
                        renderRows();
                    };

                    copyButton.onclick = function () {
                        copyVisibleLogs();
                    };

                    clearButton.onclick = function () {
                        clearLogs();
                    };

                    if (window.OpenCATSInteractionLog && typeof window.OpenCATSInteractionLog.onChange === 'function') {
                        unsubscribe = window.OpenCATSInteractionLog.onChange(function () {
                            renderRows();
                        });
                    }

                    window.addEventListener('beforeunload', function () {
                        if (typeof unsubscribe === 'function') {
                            unsubscribe();
                        }
                    });

                    renderRows();
                })();
            </script>
        </div>
    </div>
<?php TemplateUtility::printFooter(); ?>
