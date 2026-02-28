(function () {
    function toText(value) {
        if (value === null || typeof value === 'undefined') {
            return '';
        }

        return String(value);
    }

    function escapeHTML(value) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(toText(value)));
        return div.innerHTML;
    }

    function encode(value) {
        return encodeURIComponent(toText(value));
    }

    function parseQuery(search) {
        var query = {};
        var input = search || window.location.search || '';
        if (input.indexOf('?') === 0) {
            input = input.substring(1);
        }
        if (!input) {
            return query;
        }

        var pairs = input.split('&');
        for (var i = 0; i < pairs.length; i++) {
            if (!pairs[i]) {
                continue;
            }
            var parts = pairs[i].split('=');
            var key = decodeURIComponent(parts[0] || '');
            var value = decodeURIComponent(parts.slice(1).join('=') || '');
            if (key) {
                query[key] = value;
            }
        }

        return query;
    }

    function buildQuery(query) {
        var pairs = [];
        for (var key in query) {
            if (!query.hasOwnProperty(key)) {
                continue;
            }
            var value = query[key];
            if (value === null || typeof value === 'undefined' || value === '') {
                continue;
            }
            pairs.push(encode(key) + '=' + encode(value));
        }
        return pairs.join('&');
    }

    function requestJSON(url, onSuccess, onError) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) {
                return;
            }

            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    onSuccess(data);
                } catch (error) {
                    onError('Invalid JSON payload received.');
                }
                return;
            }

            onError('Request failed with status ' + xhr.status + '.');
        };
        xhr.send();
    }

    function ensureStyles() {
        if (document.getElementById('modern-dashboard-app-styles')) {
            return;
        }

        var style = document.createElement('style');
        style.id = 'modern-dashboard-app-styles';
        style.type = 'text/css';
        style.appendChild(document.createTextNode(
            '.modern-dashboard-app{display:grid;gap:12px;}' +
            '.modern-dashboard-toolbar{display:grid;grid-template-columns:repeat(5,minmax(140px,1fr));gap:10px;align-items:end;}' +
            '.modern-dashboard-filter{border:1px solid #dbe7ef;background:#f8fbfe;border-radius:10px;padding:8px 10px;}' +
            '.modern-dashboard-filter label{display:block;font-size:11px;font-weight:700;color:#4c6775;text-transform:uppercase;margin-bottom:6px;}' +
            '.modern-dashboard-filter select,.modern-dashboard-filter input[type="checkbox"]{font-size:13px;}' +
            '.modern-dashboard-filter select{width:100%;border:1px solid #c8d8e3;border-radius:8px;padding:6px 8px;background:#fff;}' +
            '.modern-dashboard-toggle{display:inline-flex;align-items:center;gap:8px;min-height:34px;color:#2f4f5f;font-weight:600;}' +
            '.modern-dashboard-summary{display:flex;flex-wrap:wrap;gap:8px;}' +
            '.modern-dashboard-chip{display:inline-flex;align-items:center;padding:5px 10px;border-radius:999px;background:#eef6fb;border:1px solid #d5e8f3;color:#294c5f;font-size:12px;font-weight:700;}' +
            '.modern-dashboard-table{border:1px solid #d9e5ec;border-radius:12px;background:#fff;overflow:hidden;}' +
            '.modern-dashboard-table table{width:100%;border-collapse:collapse;}' +
            '.modern-dashboard-table th{background:#0f6f8f;color:#fff;font-size:12px;font-weight:700;padding:10px;text-align:left;}' +
            '.modern-dashboard-table td{padding:10px;border-top:1px solid #e6eef3;font-size:13px;color:#1f3440;vertical-align:top;}' +
            '.modern-dashboard-table a{color:#0a5f7d;text-decoration:none;}' +
            '.modern-dashboard-table a:hover{text-decoration:underline;}' +
            '.modern-dashboard-empty{padding:16px;color:#607987;font-style:italic;}' +
            '.modern-dashboard-pagination{display:flex;align-items:center;justify-content:space-between;gap:10px;}' +
            '.modern-dashboard-pagination .button{min-width:92px;}' +
            '.modern-dashboard-status{display:inline-block;padding:2px 8px;border-radius:10px;font-size:12px;font-weight:600;line-height:1.3;border:1px solid #d1d9de;color:#1f2933;background:#f2f4f6;white-space:nowrap;}' +
            '.modern-dashboard-status.status-allocated{background:#e6f0ff;color:#1d4ed8;border-color:#c7ddff;}' +
            '.modern-dashboard-status.status-delivery-validated{background:#e6f7f4;color:#0f766e;border-color:#c5ece6;}' +
            '.modern-dashboard-status.status-proposed-to-customer{background:#f3e8ff;color:#6b21a8;border-color:#e3d0ff;}' +
            '.modern-dashboard-status.status-customer-interview{background:#fff7ed;color:#b45309;border-color:#fde0b6;}' +
            '.modern-dashboard-status.status-customer-approved{background:#eef2ff;color:#4f46e5;border-color:#d6dcff;}' +
            '.modern-dashboard-status.status-avel-approved{background:#e0f2fe;color:#0369a1;border-color:#bae6fd;}' +
            '.modern-dashboard-status.status-offer-negotiation,.modern-dashboard-status.status-offer-negociation{background:#fff1f2;color:#c2410c;border-color:#fed7aa;}' +
            '.modern-dashboard-status.status-offer-accepted{background:#ecfdf3;color:#15803d;border-color:#bbf7d0;}' +
            '.modern-dashboard-status.status-hired{background:#dcfce7;color:#166534;border-color:#86efac;}' +
            '.modern-dashboard-status.status-rejected{background:#fee2e2;color:#b91c1c;border-color:#fecaca;}' +
            '@media(max-width:1200px){.modern-dashboard-toolbar{grid-template-columns:repeat(3,minmax(140px,1fr));}}' +
            '@media(max-width:760px){.modern-dashboard-toolbar{grid-template-columns:repeat(1,minmax(140px,1fr));}.modern-dashboard-table{overflow:auto;}}'
        ));
        document.head.appendChild(style);
    }

    function renderUnsupported(root, bootstrap) {
        root.innerHTML =
            '<div class="modern-shell-fallback">' +
                '<h3>Modern route not implemented yet</h3>' +
                '<p>This route is routed through modern shell, but no dedicated modern page is available yet.</p>' +
                '<div class="modern-shell-fallback-actions">' +
                    '<a class="button ui2-button ui2-button--secondary" href="' + escapeHTML(bootstrap.legacyURL || 'index.php') + '">Open Legacy UI</a>' +
                '</div>' +
            '</div>';
    }

    function renderDashboardPage(root, bootstrap) {
        ensureStyles();

        var currentQuery = parseQuery(window.location.search);
        var baseQuery = {
            m: 'dashboard',
            a: 'my',
            scope: currentQuery.scope || 'mine',
            view: 'list',
            companyID: currentQuery.companyID || '',
            jobOrderID: currentQuery.jobOrderID || '',
            statusID: currentQuery.statusID || '',
            showClosed: currentQuery.showClosed ? '1' : '',
            page: currentQuery.page || '1',
            ui: currentQuery.ui || ''
        };

        root.innerHTML =
            '<div class="modern-dashboard-app">' +
                '<div class="modern-dashboard-summary">' +
                    '<span class="modern-dashboard-chip">Loading dashboard data...</span>' +
                '</div>' +
                '<div id="modernDashboardContent"></div>' +
            '</div>';

        var content = document.getElementById('modernDashboardContent');

        var apiQuery = {};
        for (var key in baseQuery) {
            if (baseQuery.hasOwnProperty(key)) {
                apiQuery[key] = baseQuery[key];
            }
        }
        apiQuery.format = 'modern-json';
        apiQuery.ui = 'legacy';

        var apiURL = (bootstrap.indexName || 'index.php') + '?' + buildQuery(apiQuery);

        requestJSON(
            apiURL,
            function (payload) {
                renderDashboardPayload(root, content, payload, baseQuery, bootstrap);
            },
            function (errorMessage) {
                content.innerHTML =
                    '<div class="modern-shell-fallback">' +
                        '<h3>Unable to load dashboard data</h3>' +
                        '<p>' + escapeHTML(errorMessage) + '</p>' +
                        '<div class="modern-shell-fallback-actions">' +
                            '<a class="button ui2-button ui2-button--secondary" href="' + escapeHTML(bootstrap.legacyURL || 'index.php') + '">Open Legacy UI</a>' +
                        '</div>' +
                    '</div>';
            }
        );
    }

    function renderDashboardPayload(root, content, payload, baseQuery, bootstrap) {
        if (!payload || !payload.meta || !payload.options) {
            content.innerHTML = '<div class="modern-dashboard-empty">Unexpected payload format.</div>';
            return;
        }

        var meta = payload.meta;
        var filters = payload.filters || {};
        var options = payload.options;
        var rows = payload.rows || [];

        var scopeMineSelected = (meta.scope !== 'all') ? 'selected="selected"' : '';
        var scopeAllSelected = (meta.scope === 'all') ? 'selected="selected"' : '';

        var companyOptionsHTML = '<option value="">All customers</option>';
        for (var i = 0; i < options.companies.length; i++) {
            var company = options.companies[i];
            var companySelected = ((String(filters.companyID) === String(company.companyID)) ? 'selected="selected"' : '');
            companyOptionsHTML += '<option value="' + escapeHTML(company.companyID) + '" ' + companySelected + '>' + escapeHTML(company.name) + '</option>';
        }

        var jobOrderOptionsHTML = '<option value="">' + escapeHTML(meta.jobOrderScopeLabel || 'All job orders') + '</option>';
        for (var j = 0; j < options.jobOrders.length; j++) {
            var jobOrder = options.jobOrders[j];
            var jobOrderSelected = ((String(filters.jobOrderID) === String(jobOrder.jobOrderID)) ? 'selected="selected"' : '');
            var jobOrderLabel = jobOrder.title;
            if (jobOrder.companyName) {
                jobOrderLabel += ' (' + jobOrder.companyName + ')';
            }
            jobOrderOptionsHTML += '<option value="' + escapeHTML(jobOrder.jobOrderID) + '" ' + jobOrderSelected + '>' + escapeHTML(jobOrderLabel) + '</option>';
        }

        var statusOptionsHTML = '<option value="">All statuses</option>';
        for (var k = 0; k < options.statuses.length; k++) {
            var statusOption = options.statuses[k];
            var statusSelected = ((String(filters.statusID) === String(statusOption.statusID)) ? 'selected="selected"' : '');
            statusOptionsHTML += '<option value="' + escapeHTML(statusOption.statusID) + '" ' + statusSelected + '>' + escapeHTML(statusOption.status) + '</option>';
        }

        var tableHTML = '';
        if (!rows.length) {
            tableHTML = '<div class="modern-dashboard-empty">No pipeline entries found for current filters.</div>';
        } else {
            tableHTML = '<table><thead><tr>' +
                '<th>Candidate</th>' +
                '<th>Job Order</th>' +
                '<th>Company</th>' +
                '<th>Status</th>' +
                '<th>Last Updated</th>' +
            '</tr></thead><tbody>';

            for (var r = 0; r < rows.length; r++) {
                var row = rows[r];
                tableHTML += '<tr>' +
                    '<td><a href="' + escapeHTML(row.candidateURL) + '">' + escapeHTML(row.candidateName) + '</a></td>' +
                    '<td><a href="' + escapeHTML(row.jobOrderURL) + '">' + escapeHTML(row.jobOrderTitle) + '</a></td>' +
                    '<td>' + escapeHTML(row.companyName || '--') + '</td>' +
                    '<td><span class="modern-dashboard-status status-' + escapeHTML(row.statusSlug || 'unknown') + '">' + escapeHTML(row.statusLabel || '--') + '</span></td>' +
                    '<td>' + escapeHTML(row.lastStatusChangeDisplay || '--') + '</td>' +
                '</tr>';
            }

            tableHTML += '</tbody></table>';
        }

        var disablePrev = ((meta.page || 1) <= 1) ? 'disabled="disabled"' : '';
        var disableNext = ((meta.page || 1) >= (meta.totalPages || 1)) ? 'disabled="disabled"' : '';
        var scopeSelectorHTML = '';
        if (meta.canViewAllScopes) {
            scopeSelectorHTML =
                '<div class="modern-dashboard-filter">' +
                    '<label>Scope</label>' +
                    '<select id="modernDashboardScope">' +
                        '<option value="mine" ' + scopeMineSelected + '>My Assigned Jobs</option>' +
                        '<option value="all" ' + scopeAllSelected + '>All Jobs</option>' +
                    '</select>' +
                '</div>';
        }

        content.innerHTML =
            '<div class="modern-dashboard-summary">' +
                '<span class="modern-dashboard-chip">Rows: ' + escapeHTML(meta.totalRows) + '</span>' +
                '<span class="modern-dashboard-chip">Page: ' + escapeHTML(meta.page) + ' / ' + escapeHTML(meta.totalPages) + '</span>' +
                '<span class="modern-dashboard-chip">Mode: Read-only</span>' +
            '</div>' +
            '<div class="modern-dashboard-toolbar">' +
                scopeSelectorHTML +
                '<div class="modern-dashboard-filter">' +
                    '<label>Customer</label>' +
                    '<select id="modernDashboardCompany">' + companyOptionsHTML + '</select>' +
                '</div>' +
                '<div class="modern-dashboard-filter">' +
                    '<label>Job Order</label>' +
                    '<select id="modernDashboardJobOrder">' + jobOrderOptionsHTML + '</select>' +
                '</div>' +
                '<div class="modern-dashboard-filter">' +
                    '<label>Status</label>' +
                    '<select id="modernDashboardStatus">' + statusOptionsHTML + '</select>' +
                '</div>' +
                '<div class="modern-dashboard-filter">' +
                    '<label>Visibility</label>' +
                    '<label class="modern-dashboard-toggle"><input type="checkbox" id="modernDashboardShowClosed" ' + (meta.showClosed ? 'checked="checked"' : '') + ' /> Show Closed</label>' +
                '</div>' +
            '</div>' +
            '<div class="modern-dashboard-table">' + tableHTML + '</div>' +
            '<div class="modern-dashboard-pagination">' +
                '<button type="button" class="button ui2-button ui2-button--secondary" id="modernDashboardPrev" ' + disablePrev + '>Previous</button>' +
                '<div>' +
                    '<a class="button ui2-button ui2-button--secondary" href="' + escapeHTML(bootstrap.legacyURL || 'index.php') + '">Open Legacy UI</a>' +
                '</div>' +
                '<button type="button" class="button ui2-button ui2-button--secondary" id="modernDashboardNext" ' + disableNext + '>Next</button>' +
            '</div>';

        var applyFilters = function (newPage) {
            var query = parseQuery(window.location.search);
            query.m = 'dashboard';
            query.a = 'my';
            query.view = 'list';

            var scopeEl = document.getElementById('modernDashboardScope');
            if (scopeEl) {
                query.scope = scopeEl.value;
            }

            var companyEl = document.getElementById('modernDashboardCompany');
            query.companyID = companyEl ? companyEl.value : '';

            var jobOrderEl = document.getElementById('modernDashboardJobOrder');
            query.jobOrderID = jobOrderEl ? jobOrderEl.value : '';

            var statusEl = document.getElementById('modernDashboardStatus');
            query.statusID = statusEl ? statusEl.value : '';

            var showClosedEl = document.getElementById('modernDashboardShowClosed');
            query.showClosed = (showClosedEl && showClosedEl.checked) ? '1' : '';

            query.page = toText(newPage || 1);

            var queryString = buildQuery(query);
            window.location.href = (bootstrap.indexName || 'index.php') + '?' + queryString;
        };

        function bindChange(id) {
            var element = document.getElementById(id);
            if (!element) {
                return;
            }
            element.onchange = function () {
                applyFilters(1);
            };
        }

        bindChange('modernDashboardScope');
        bindChange('modernDashboardCompany');
        bindChange('modernDashboardJobOrder');
        bindChange('modernDashboardStatus');
        bindChange('modernDashboardShowClosed');

        var prevButton = document.getElementById('modernDashboardPrev');
        if (prevButton) {
            prevButton.onclick = function () {
                var currentPage = parseInt(meta.page, 10) || 1;
                if (currentPage > 1) {
                    applyFilters(currentPage - 1);
                }
            };
        }

        var nextButton = document.getElementById('modernDashboardNext');
        if (nextButton) {
            nextButton.onclick = function () {
                var currentPage = parseInt(meta.page, 10) || 1;
                var totalPages = parseInt(meta.totalPages, 10) || 1;
                if (currentPage < totalPages) {
                    applyFilters(currentPage + 1);
                }
            };
        }
    }

    window.OpenCATSModernApp = {
        mount: function (root, bootstrap) {
            var moduleName = (bootstrap && bootstrap.targetModule) ? bootstrap.targetModule : '';
            var actionName = (bootstrap && bootstrap.targetAction) ? bootstrap.targetAction : '';

            if (moduleName === 'dashboard' && (actionName === 'my' || actionName === '')) {
                renderDashboardPage(root, bootstrap || {});
                return;
            }

            renderUnsupported(root, bootstrap || {});
        }
    };
})();

