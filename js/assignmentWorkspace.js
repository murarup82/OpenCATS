/*
 * OpenCATS Assignment Workspace
 * Phase 1 UX refresh for candidate <-> job order assignment.
 */
(function(window) {
    'use strict';

    var AssignmentWorkspace = {
        config: null,
        searchTimer: null,
        activeRequest: null,
        activeAddRequest: null,

        init: function(config) {
            this.config = config || {};
            this.bindEvents();
            this.loadResults();
        },

        bindEvents: function() {
            var self = this;
            var searchInput = this.byId(this.config.searchInputId);
            if (searchInput) {
                searchInput.onkeyup = function() {
                    self.scheduleSearch();
                };
            }

            var includeClosed = this.byId(this.config.includeClosedControlId);
            if (includeClosed) {
                includeClosed.onclick = function() {
                    self.loadResults();
                };
            }

            var onlyNotInPipeline = this.byId(this.config.onlyNotInPipelineControlId);
            if (onlyNotInPipeline) {
                onlyNotInPipeline.onclick = function() {
                    self.loadResults();
                };
            }

            var refreshButton = this.byId(this.config.refreshButtonId);
            if (refreshButton) {
                refreshButton.onclick = function() {
                    self.loadResults();
                    return false;
                };
            }

            var bulkAddButton = this.byId(this.config.bulkAddButtonId);
            if (bulkAddButton) {
                bulkAddButton.onclick = function() {
                    self.addSelected();
                    return false;
                };
            }

            var selectAll = this.byId(this.config.selectAllCheckboxId);
            if (selectAll) {
                selectAll.onclick = function() {
                    self.toggleSelectAll(selectAll.checked);
                };
            }
        },

        scheduleSearch: function() {
            var self = this;
            if (this.searchTimer !== null) {
                window.clearTimeout(this.searchTimer);
            }
            this.searchTimer = window.setTimeout(function() {
                self.loadResults();
            }, 220);
        },

        loadResults: function() {
            var self = this;
            var requestURL = this.buildRequestURL();
            if (requestURL === '') {
                this.renderError('Unable to prepare search request.');
                return;
            }

            this.renderStatus('Searching...', false);

            if (this.activeRequest && this.activeRequest.abort) {
                try {
                    this.activeRequest.abort();
                } catch (ignoreAbortError) {
                }
            }

            var http = new XMLHttpRequest();
            this.activeRequest = http;
            http.onreadystatechange = function() {
                if (http.readyState !== 4) {
                    return;
                }

                self.activeRequest = null;

                if (http.status < 200 || http.status >= 300) {
                    self.renderError('Search request failed (' + http.status + ').');
                    return;
                }

                var payload = self.parseJSON(http.responseText);
                if (!payload || !payload.success) {
                    self.renderError(payload && payload.message ? payload.message : 'Unexpected response.');
                    return;
                }

                self.renderRows(payload.results || []);
            };

            http.open('GET', requestURL, true);
            http.send(null);
        },

        buildRequestURL: function() {
            if (!this.config || !this.config.searchFunction) {
                return '';
            }

            var params = [];
            params.push('f=' + encodeURIComponent(this.config.searchFunction));
            params.push('query=' + encodeURIComponent(this.getSearchText()));
            params.push('maxResults=' + encodeURIComponent(this.config.maxResults || 30));

            if (this.config.mode === 'candidateToJobs') {
                if (this.config.singleCandidateID && parseInt(this.config.singleCandidateID, 10) > 0) {
                    params.push('candidateID=' + encodeURIComponent(this.config.singleCandidateID));
                }
                params.push('includeClosed=' + (this.isChecked(this.config.includeClosedControlId) ? '1' : '0'));
            } else if (this.config.mode === 'jobToCandidates') {
                params.push('jobOrderID=' + encodeURIComponent(this.config.jobOrderID || 0));
            }

            return 'ajax.php?' + params.join('&');
        },

        renderRows: function(results) {
            var body = this.byId(this.config.resultsBodyId);
            if (!body) {
                return;
            }

            var rows = [];
            var onlyNotInPipeline = this.isChecked(this.config.onlyNotInPipelineControlId);
            var visibleCount = 0;
            var i;

            for (i = 0; i < results.length; i++) {
                if (onlyNotInPipeline && parseInt(results[i].inPipeline, 10) === 1) {
                    continue;
                }

                if (this.config.mode === 'candidateToJobs') {
                    rows.push(this.renderJobOrderRow(results[i]));
                } else {
                    rows.push(this.renderCandidateRow(results[i]));
                }
                visibleCount++;
            }

            if (rows.length === 0) {
                rows.push('<tr><td colspan="' + this.getColumnCount() + '" class="data">No matching entries found.</td></tr>');
            }

            body.innerHTML = rows.join('');
            this.renderStatus('Showing ' + visibleCount + ' result(s).', false);
            var selectAll = this.byId(this.config.selectAllCheckboxId);
            if (selectAll) {
                selectAll.checked = false;
            }
            this.bindRowSelectionEvents();
            this.updateSelectionCount();
        },

        renderJobOrderRow: function(data) {
            var jobOrderID = parseInt(data.jobOrderID, 10);
            var inPipeline = parseInt(data.inPipeline, 10) === 1;
            var selectCell = '<input type="checkbox" class="assignmentWorkspaceSelect" value="' + jobOrderID + '"' + (inPipeline ? ' disabled="disabled"' : '') + ' />';
            var addCell = inPipeline
                ? '<span class="assignmentWorkspaceBadge">In Pipeline</span>'
                : '<a class="ui2-button ui2-button--primary" href="#" onclick="return AssignmentWorkspace.addSingle(' + jobOrderID + ');">Add</a>';

            return ''
                + '<tr>'
                + '<td align="center">' + selectCell + '</td>'
                + '<td>' + this.escapeHTML(data.clientJobID || '--') + '</td>'
                + '<td>' + this.escapeHTML(data.title || '') + '</td>'
                + '<td>' + this.escapeHTML(data.companyName || '') + '</td>'
                + '<td>' + this.escapeHTML(data.status || '') + '</td>'
                + '<td>' + this.escapeHTML(this.formatOpenings(data.openingsAvailable, data.openings)) + '</td>'
                + '<td>' + this.escapeHTML(data.ownerName || '--') + '</td>'
                + '<td>' + this.escapeHTML(data.dateModified || '--') + '</td>'
                + '<td>' + addCell + '</td>'
                + '</tr>';
        },

        renderCandidateRow: function(data) {
            var candidateID = parseInt(data.candidateID, 10);
            var inPipeline = parseInt(data.inPipeline, 10) === 1;
            var selectCell = '<input type="checkbox" class="assignmentWorkspaceSelect" value="' + candidateID + '"' + (inPipeline ? ' disabled="disabled"' : '') + ' />';
            var addCell = inPipeline
                ? '<span class="assignmentWorkspaceBadge">In Pipeline</span>'
                : '<a class="ui2-button ui2-button--primary" href="#" onclick="return AssignmentWorkspace.addSingle(' + candidateID + ');">Add</a>';

            var duplicateIcon = '';
            if (parseInt(data.isDuplicateCandidate, 10) === 1) {
                duplicateIcon = '<img src="images/wf_error.gif" width="12" height="12" alt="Duplicate" title="Possible duplicate candidate" class="absmiddle" /> ';
            }

            return ''
                + '<tr>'
                + '<td align="center">' + selectCell + '</td>'
                + '<td>' + duplicateIcon + this.escapeHTML((data.firstName || '') + ' ' + (data.lastName || '')) + '</td>'
                + '<td>' + this.escapeHTML(data.keySkills || '--') + '</td>'
                + '<td>' + this.escapeHTML(data.email || '--') + '</td>'
                + '<td>' + this.escapeHTML(data.ownerName || '--') + '</td>'
                + '<td>' + this.escapeHTML(data.dateModified || '--') + '</td>'
                + '<td>' + addCell + '</td>'
                + '</tr>';
        },

        addSelected: function() {
            var selectedIDs = this.getSelectedIDs();
            if (selectedIDs.length === 0) {
                this.renderError('Please select at least one row first.');
                return false;
            }

            return this.submitAdd(selectedIDs, false);
        },

        addSingle: function(entityID) {
            return this.submitAdd([parseInt(entityID, 10)], true);
        },

        submitAdd: function(entityIDs, isSingle) {
            var self = this;
            var ids = this.normalizeIDs(entityIDs);
            if (ids.length === 0) {
                this.renderError('Nothing selected to add.');
                return false;
            }

            var confirmMessage = isSingle
                ? 'Add the selected entry to pipeline?'
                : 'Add the selected entries to pipeline?';
            if (!window.confirm(confirmMessage)) {
                return false;
            }

            if (this.activeAddRequest && this.activeAddRequest.abort) {
                try {
                    this.activeAddRequest.abort();
                } catch (ignoreAbortError) {
                }
            }

            var postData = [];
            postData.push('f=assignmentBulkAdd');
            postData.push('mode=' + encodeURIComponent(this.config.mode || ''));
            postData.push('targetStatusID=' + encodeURIComponent(this.getTargetStatusID()));

            if (this.config.mode === 'candidateToJobs') {
                postData.push('jobOrderIDs=' + encodeURIComponent(ids.join(',')));
                if (this.config.candidateIDArrayStored) {
                    postData.push('candidateIDArrayStored=' + encodeURIComponent(this.config.candidateIDArrayStored));
                } else if (this.config.singleCandidateID) {
                    postData.push('candidateID=' + encodeURIComponent(this.config.singleCandidateID));
                }
            } else {
                postData.push('jobOrderID=' + encodeURIComponent(this.config.jobOrderID || 0));
                postData.push('candidateIDs=' + encodeURIComponent(ids.join(',')));
            }

            this.renderStatus('Applying assignment...', false);

            var http = new XMLHttpRequest();
            this.activeAddRequest = http;
            http.onreadystatechange = function() {
                if (http.readyState !== 4) {
                    return;
                }

                self.activeAddRequest = null;

                if (http.status < 200 || http.status >= 300) {
                    self.renderError('Add request failed (' + http.status + ').');
                    return;
                }

                var payload = self.parseJSON(http.responseText);
                if (!payload || !payload.success) {
                    self.renderError(payload && payload.message ? payload.message : 'Failed to add selected entries.');
                    return;
                }

                var summary = 'Added ' + payload.addedCount + ' of ' + payload.requestedCount + ' assignment(s).';
                if (payload.statusAppliedCount > 0) {
                    summary += ' Stage applied on ' + payload.statusAppliedCount + '.';
                }
                if (payload.skippedInPipelineCount > 0) {
                    summary += ' Skipped already in pipeline: ' + payload.skippedInPipelineCount + '.';
                }
                if (payload.skippedHiredCount > 0) {
                    summary += ' Skipped already hired: ' + payload.skippedHiredCount + '.';
                }
                if (payload.skippedErrorCount > 0) {
                    summary += ' Skipped with errors: ' + payload.skippedErrorCount + '.';
                }

                self.renderStatus(summary, false);
                self.loadResults();
            };

            http.open('POST', 'ajax.php', true);
            http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            http.send(postData.join('&'));

            return false;
        },

        getColumnCount: function() {
            if (this.config.mode === 'candidateToJobs') {
                return 9;
            }
            return 7;
        },

        formatOpenings: function(openingsAvailable, openingsTotal) {
            var available = parseInt(openingsAvailable, 10);
            var total = parseInt(openingsTotal, 10);

            if (isNaN(available)) {
                available = 0;
            }
            if (isNaN(total)) {
                total = 0;
            }

            return available + ' / ' + total;
        },

        getSearchText: function() {
            var el = this.byId(this.config.searchInputId);
            if (!el) {
                return '';
            }
            return this.trim(el.value || '');
        },

        isChecked: function(id) {
            if (!id) {
                return false;
            }
            var el = this.byId(id);
            if (!el) {
                return false;
            }
            return !!el.checked;
        },

        getTargetStatusID: function() {
            var stageSelect = this.byId(this.config.stageSelectId);
            if (!stageSelect || stageSelect.disabled) {
                return this.config.defaultTargetStatusID || 9000;
            }
            var selected = parseInt(stageSelect.value, 10);
            if (isNaN(selected) || selected <= 0) {
                return this.config.defaultTargetStatusID || 9000;
            }
            return selected;
        },

        getSelectedIDs: function() {
            var body = this.byId(this.config.resultsBodyId);
            var selected = [];
            if (!body) {
                return selected;
            }

            var inputs = body.getElementsByTagName('input');
            for (var i = 0; i < inputs.length; i++) {
                if (!inputs[i] || inputs[i].type !== 'checkbox') {
                    continue;
                }
                if (inputs[i].className.indexOf('assignmentWorkspaceSelect') === -1) {
                    continue;
                }
                if (inputs[i].disabled || !inputs[i].checked) {
                    continue;
                }

                var value = parseInt(inputs[i].value, 10);
                if (!isNaN(value) && value > 0) {
                    selected.push(value);
                }
            }

            return this.normalizeIDs(selected);
        },

        normalizeIDs: function(values) {
            var unique = {};
            var output = [];
            for (var i = 0; i < values.length; i++) {
                var value = parseInt(values[i], 10);
                if (isNaN(value) || value <= 0) {
                    continue;
                }
                if (unique[value]) {
                    continue;
                }
                unique[value] = true;
                output.push(value);
            }
            return output;
        },

        toggleSelectAll: function(isChecked) {
            var body = this.byId(this.config.resultsBodyId);
            if (!body) {
                return;
            }

            var inputs = body.getElementsByTagName('input');
            for (var i = 0; i < inputs.length; i++) {
                if (!inputs[i] || inputs[i].type !== 'checkbox') {
                    continue;
                }
                if (inputs[i].className.indexOf('assignmentWorkspaceSelect') === -1) {
                    continue;
                }
                if (inputs[i].disabled) {
                    continue;
                }

                inputs[i].checked = !!isChecked;
            }

            this.updateSelectionCount();
        },

        bindRowSelectionEvents: function() {
            var self = this;
            var body = this.byId(this.config.resultsBodyId);
            if (!body) {
                return;
            }

            var inputs = body.getElementsByTagName('input');
            for (var i = 0; i < inputs.length; i++) {
                if (!inputs[i] || inputs[i].type !== 'checkbox') {
                    continue;
                }
                if (inputs[i].className.indexOf('assignmentWorkspaceSelect') === -1) {
                    continue;
                }
                inputs[i].onclick = function() {
                    self.updateSelectionCount();
                };
            }
        },

        updateSelectionCount: function() {
            var selected = this.getSelectedIDs().length;
            var countEl = this.byId(this.config.selectionCountId);
            if (countEl) {
                countEl.innerHTML = this.escapeHTML(String(selected) + ' selected');
            }

            var addButton = this.byId(this.config.bulkAddButtonId);
            if (addButton) {
                addButton.disabled = (selected === 0);
            }
        },

        renderStatus: function(message, isError) {
            var statusEl = this.byId(this.config.statusId);
            if (!statusEl) {
                return;
            }
            statusEl.innerHTML = this.escapeHTML(message || '');
            statusEl.className = isError ? 'assignmentWorkspaceStatus assignmentWorkspaceStatus--error' : 'assignmentWorkspaceStatus';
        },

        renderError: function(message) {
            this.renderStatus(message, true);
            var body = this.byId(this.config.resultsBodyId);
            if (body) {
                body.innerHTML = '<tr><td colspan="' + this.getColumnCount() + '" class="data">' + this.escapeHTML(message) + '</td></tr>';
            }
        },

        parseJSON: function(text) {
            if (typeof text !== 'string' || text === '') {
                return null;
            }

            if (window.JSON && typeof window.JSON.parse === 'function') {
                try {
                    return window.JSON.parse(text);
                } catch (error) {
                    return null;
                }
            }

            try {
                return eval('(' + text + ')');
            } catch (legacyError) {
                return null;
            }
        },

        getIndexName: function() {
            if (typeof CATSIndexName !== 'undefined' && CATSIndexName !== '') {
                return CATSIndexName;
            }
            return 'index.php';
        },

        byId: function(id) {
            if (!id) {
                return null;
            }
            return document.getElementById(id);
        },

        trim: function(value) {
            return String(value).replace(/^\s+|\s+$/g, '');
        },

        escapeHTML: function(value) {
            if (value === null || typeof value === 'undefined') {
                return '';
            }

            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }
    };

    window.AssignmentWorkspace = AssignmentWorkspace;
}(window));
