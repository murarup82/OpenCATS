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
        },

        renderJobOrderRow: function(data) {
            var jobOrderID = parseInt(data.jobOrderID, 10);
            var inPipeline = parseInt(data.inPipeline, 10) === 1;
            var addCell = inPipeline
                ? '<span class="assignmentWorkspaceBadge">In Pipeline</span>'
                : '<a class="ui2-button ui2-button--primary" href="' + this.escapeHTML(this.buildCandidateToJobAddURL(jobOrderID)) + '">Add</a>';

            return ''
                + '<tr>'
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
            var addCell = inPipeline
                ? '<span class="assignmentWorkspaceBadge">In Pipeline</span>'
                : '<a class="ui2-button ui2-button--primary" href="' + this.escapeHTML(this.buildJobToCandidateAddURL(candidateID)) + '">Add</a>';

            var duplicateIcon = '';
            if (parseInt(data.isDuplicateCandidate, 10) === 1) {
                duplicateIcon = '<img src="images/wf_error.gif" width="12" height="12" alt="Duplicate" title="Possible duplicate candidate" class="absmiddle" /> ';
            }

            return ''
                + '<tr>'
                + '<td>' + duplicateIcon + this.escapeHTML((data.firstName || '') + ' ' + (data.lastName || '')) + '</td>'
                + '<td>' + this.escapeHTML(data.keySkills || '--') + '</td>'
                + '<td>' + this.escapeHTML(data.email || '--') + '</td>'
                + '<td>' + this.escapeHTML(data.ownerName || '--') + '</td>'
                + '<td>' + this.escapeHTML(data.dateModified || '--') + '</td>'
                + '<td>' + addCell + '</td>'
                + '</tr>';
        },

        buildCandidateToJobAddURL: function(jobOrderID) {
            var url = this.getIndexName()
                + '?m=candidates&a=addToPipeline&getback=getback'
                + '&jobOrderID=' + encodeURIComponent(jobOrderID);

            if (this.config.candidateIDArrayStored) {
                url += '&candidateIDArrayStored=' + encodeURIComponent(this.config.candidateIDArrayStored);
            } else if (this.config.singleCandidateID) {
                url += '&candidateID=' + encodeURIComponent(this.config.singleCandidateID);
            }

            return url;
        },

        buildJobToCandidateAddURL: function(candidateID) {
            return this.getIndexName()
                + '?m=joborders&a=addToPipeline&getback=getback'
                + '&jobOrderID=' + encodeURIComponent(this.config.jobOrderID || 0)
                + '&candidateID=' + encodeURIComponent(candidateID);
        },

        getColumnCount: function() {
            if (this.config.mode === 'candidateToJobs') {
                return 8;
            }
            return 6;
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
