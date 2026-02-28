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
            '.modern-dashboard-app{display:grid;gap:14px;}' +
            '.modern-dashboard-summary{display:flex;flex-wrap:wrap;gap:8px;}' +
            '.modern-dashboard-chip{display:inline-flex;align-items:center;padding:5px 10px;border-radius:999px;background:#eef6fb;border:1px solid #d5e8f3;color:#294c5f;font-size:12px;font-weight:700;}' +
            '.modern-dashboard-filter-panel{border:1px solid #d8e7f2;border-radius:12px;padding:12px;background:linear-gradient(180deg,#fcfeff 0%,#f6fbff 100%);display:grid;gap:12px;}' +
            '.modern-dashboard-panel-header{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap;}' +
            '.modern-dashboard-panel-title{margin:0;color:#0b4463;font-size:16px;font-weight:700;}' +
            '.modern-dashboard-panel-hint{margin:4px 0 0 0;color:#597384;font-size:13px;}' +
            '.modern-dashboard-panel-actions{display:inline-flex;align-items:center;gap:8px;flex-wrap:wrap;}' +
            '.modern-dashboard-view-switch{display:inline-flex;border:1px solid #b8d3e3;border-radius:10px;overflow:hidden;background:#fff;}' +
            '.modern-dashboard-view-btn{border:0;border-right:1px solid #d4e6f1;background:#fff;color:#3a5a6d;padding:7px 12px;font-size:13px;font-weight:700;cursor:pointer;}' +
            '.modern-dashboard-view-btn:last-child{border-right:0;}' +
            '.modern-dashboard-view-btn:hover{background:#ecf7fd;}' +
            '.modern-dashboard-view-btn.is-active{background:linear-gradient(180deg,#1292bf 0%,#0f7da2 100%);color:#fff;}' +
            '.modern-dashboard-reset{border:1px solid #b7d2e2;border-radius:10px;background:#fff;color:#174e67;padding:7px 11px;font-size:13px;font-weight:700;cursor:pointer;}' +
            '.modern-dashboard-reset:hover{background:#eff7fc;}' +
            '.modern-dashboard-toolbar{display:grid;grid-template-columns:repeat(5,minmax(130px,1fr));gap:10px;align-items:end;}' +
            '.modern-dashboard-filter{border:1px solid #d3e4ef;background:#fff;border-radius:10px;padding:8px 10px;}' +
            '.modern-dashboard-filter label{display:block;font-size:11px;font-weight:700;color:#4c6775;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;}' +
            '.modern-dashboard-filter select,.modern-dashboard-filter input[type="checkbox"]{font-size:13px;}' +
            '.modern-dashboard-filter select{width:100%;border:1px solid #b8d4e4;border-radius:8px;padding:7px 8px;background:#fff;color:#243e4f;}' +
            '.modern-dashboard-filter select:focus{outline:none;border-color:#3395be;box-shadow:0 0 0 2px rgba(51,149,190,.14);}' +
            '.modern-dashboard-toggle{display:inline-flex;align-items:center;gap:8px;min-height:34px;color:#2f4f5f;font-weight:600;}' +
            '.modern-dashboard-toggle input{margin:0;}' +
            '.modern-dashboard-table{border:1px solid #d9e5ec;border-radius:12px;background:#fff;overflow:auto;box-shadow:inset 0 1px 0 rgba(255,255,255,.7);animation:modernDashboardFade .2s ease both;}' +
            '.modern-dashboard-table.is-hidden{display:none;}' +
            '.modern-dashboard-table table{width:100%;border-collapse:collapse;}' +
            '.modern-dashboard-table th{background:linear-gradient(180deg,#0f6f8f 0%,#0c5f7c 100%);color:#fff;font-size:12px;font-weight:700;padding:10px;text-align:left;}' +
            '.modern-dashboard-table td{padding:10px;border-top:1px solid #e6eef3;font-size:13px;color:#1f3440;vertical-align:top;}' +
            '.modern-dashboard-table tbody tr:nth-child(even) td{background:#fbfdff;}' +
            '.modern-dashboard-table tbody tr:hover td{background:#f2f9ff;}' +
            '.modern-dashboard-table a{color:#0a5f7d;text-decoration:none;font-weight:600;}' +
            '.modern-dashboard-table a:hover{text-decoration:underline;}' +
            '.modern-dashboard-cards{animation:modernDashboardFade .2s ease both;}' +
            '.modern-dashboard-cards.is-hidden{display:none;}' +
            '.modern-dashboard-cards-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px;}' +
            '.modern-dashboard-card{border:1px solid #d5e7f1;border-radius:12px;padding:11px;background:#fff;box-shadow:0 5px 14px rgba(10,52,80,.08);display:grid;gap:7px;}' +
            '.modern-dashboard-card-title{font-weight:800;color:#123f57;}' +
            '.modern-dashboard-card-job{font-size:13px;}' +
            '.modern-dashboard-card-meta{color:#5c7586;font-size:12px;}' +
            '.modern-dashboard-card-row{display:flex;align-items:center;justify-content:space-between;gap:8px;}' +
            '.modern-dashboard-card-time{color:#486576;font-size:12px;}' +
            '.modern-dashboard-empty{padding:16px;color:#607987;font-style:italic;border:1px dashed #c9dce8;border-radius:10px;background:#fbfeff;}' +
            '.modern-dashboard-pagination{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;}' +
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
            '@keyframes modernDashboardFade{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}' +
            '@media(max-width:1200px){.modern-dashboard-toolbar{grid-template-columns:repeat(3,minmax(130px,1fr));}}' +
            '@media(max-width:900px){.modern-dashboard-toolbar{grid-template-columns:repeat(2,minmax(130px,1fr));}}' +
            '@media(max-width:720px){.modern-dashboard-toolbar{grid-template-columns:repeat(1,minmax(130px,1fr));}.modern-dashboard-cards-grid{grid-template-columns:1fr;}}'
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
            display: currentQuery.display || '',
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
        apiQuery.modernPage = 'dashboard-my';
        apiQuery.contractVersion = '1';
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

        if (payload.meta.contractKey && payload.meta.contractKey !== 'dashboard.my.readonly.v1') {
            content.innerHTML = '<div class="modern-dashboard-empty">Unsupported dashboard data contract.</div>';
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

        var openRows = 0;
        var tableHTML = '';
        var cardsHTML = '';
        if (!rows.length) {
            tableHTML = '<div class="modern-dashboard-empty">No pipeline entries found for current filters.</div>';
            cardsHTML = '<div class="modern-dashboard-empty">No pipeline entries found for current filters.</div>';
        } else {
            tableHTML = '<table><thead><tr>' +
                '<th>Candidate</th>' +
                '<th>Job Order</th>' +
                '<th>Company</th>' +
                '<th>Status</th>' +
                '<th>Last Updated</th>' +
            '</tr></thead><tbody>';
            cardsHTML = '<div class="modern-dashboard-cards-grid">';

            for (var r = 0; r < rows.length; r++) {
                var row = rows[r];
                if (row.isActive === 1 || row.isActive === '1') {
                    openRows++;
                }
                tableHTML += '<tr>' +
                    '<td><a href="' + escapeHTML(row.candidateURL) + '">' + escapeHTML(row.candidateName) + '</a></td>' +
                    '<td><a href="' + escapeHTML(row.jobOrderURL) + '">' + escapeHTML(row.jobOrderTitle) + '</a></td>' +
                    '<td>' + escapeHTML(row.companyName || '--') + '</td>' +
                    '<td><span class="modern-dashboard-status status-' + escapeHTML(row.statusSlug || 'unknown') + '">' + escapeHTML(row.statusLabel || '--') + '</span></td>' +
                    '<td>' + escapeHTML(row.lastStatusChangeDisplay || '--') + '</td>' +
                '</tr>';

                cardsHTML +=
                    '<article class="modern-dashboard-card">' +
                        '<div class="modern-dashboard-card-title"><a href="' + escapeHTML(row.candidateURL) + '">' + escapeHTML(row.candidateName) + '</a></div>' +
                        '<div class="modern-dashboard-card-job"><a href="' + escapeHTML(row.jobOrderURL) + '">' + escapeHTML(row.jobOrderTitle) + '</a></div>' +
                        '<div class="modern-dashboard-card-meta">' + escapeHTML(row.companyName || '--') + '</div>' +
                        '<div class="modern-dashboard-card-row">' +
                            '<span class="modern-dashboard-status status-' + escapeHTML(row.statusSlug || 'unknown') + '">' + escapeHTML(row.statusLabel || '--') + '</span>' +
                            '<span class="modern-dashboard-card-time">' + escapeHTML(row.lastStatusChangeDisplay || '--') + '</span>' +
                        '</div>' +
                    '</article>';
            }

            tableHTML += '</tbody></table>';
            cardsHTML += '</div>';
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
        var displayMode = (baseQuery.display === 'cards' || baseQuery.display === 'table')
            ? baseQuery.display
            : ((window.innerWidth < 980) ? 'cards' : 'table');
        var cardsHiddenClass = (displayMode === 'cards') ? '' : ' is-hidden';
        var tableHiddenClass = (displayMode === 'table') ? '' : ' is-hidden';

        content.innerHTML =
            '<div class="modern-dashboard-summary">' +
                '<span class="modern-dashboard-chip">Rows: ' + escapeHTML(meta.totalRows) + '</span>' +
                '<span class="modern-dashboard-chip">Open Pipeline: ' + escapeHTML(openRows) + '</span>' +
                '<span class="modern-dashboard-chip">Page: ' + escapeHTML(meta.page) + ' / ' + escapeHTML(meta.totalPages) + '</span>' +
                '<span class="modern-dashboard-chip">Mode: Read-only</span>' +
            '</div>' +
            '<div class="modern-dashboard-filter-panel">' +
                '<div class="modern-dashboard-panel-header">' +
                    '<div>' +
                        '<h4 class="modern-dashboard-panel-title">Pipeline Filters</h4>' +
                        '<p class="modern-dashboard-panel-hint">Use filters, then switch between cards and table views.</p>' +
                    '</div>' +
                    '<div class="modern-dashboard-panel-actions">' +
                        '<div class="modern-dashboard-view-switch" role="group" aria-label="Display mode">' +
                            '<button type="button" id="modernDisplayCards" class="modern-dashboard-view-btn' + (displayMode === 'cards' ? ' is-active' : '') + '">Cards</button>' +
                            '<button type="button" id="modernDisplayTable" class="modern-dashboard-view-btn' + (displayMode === 'table' ? ' is-active' : '') + '">Table</button>' +
                        '</div>' +
                        '<button type="button" id="modernDashboardReset" class="modern-dashboard-reset">Reset Filters</button>' +
                    '</div>' +
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
                        '<label class="modern-dashboard-toggle"><input type="checkbox" id="modernDashboardShowClosed" ' + (meta.showClosed ? 'checked="checked"' : '') + ' /> Show Closed Job Orders</label>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div id="modernDashboardCardsWrap" class="modern-dashboard-cards' + cardsHiddenClass + '">' + cardsHTML + '</div>' +
            '<div id="modernDashboardTableWrap" class="modern-dashboard-table' + tableHiddenClass + '">' + tableHTML + '</div>' +
            '<div class="modern-dashboard-pagination">' +
                '<button type="button" class="button ui2-button ui2-button--secondary" id="modernDashboardPrev" ' + disablePrev + '>Previous</button>' +
                '<div>' +
                    '<a class="button ui2-button ui2-button--secondary" href="' + escapeHTML(bootstrap.legacyURL || 'index.php') + '">Open Legacy UI</a>' +
                '</div>' +
                '<button type="button" class="button ui2-button ui2-button--secondary" id="modernDashboardNext" ' + disableNext + '>Next</button>' +
            '</div>';

        var currentDisplayMode = displayMode;
        function setDisplayMode(mode) {
            var resolvedMode = (mode === 'cards') ? 'cards' : 'table';
            currentDisplayMode = resolvedMode;

            var cardsWrap = document.getElementById('modernDashboardCardsWrap');
            var tableWrap = document.getElementById('modernDashboardTableWrap');
            var cardsButton = document.getElementById('modernDisplayCards');
            var tableButton = document.getElementById('modernDisplayTable');

            if (cardsWrap) {
                cardsWrap.className = 'modern-dashboard-cards' + (resolvedMode === 'cards' ? '' : ' is-hidden');
            }
            if (tableWrap) {
                tableWrap.className = 'modern-dashboard-table' + (resolvedMode === 'table' ? '' : ' is-hidden');
            }
            if (cardsButton) {
                cardsButton.className = 'modern-dashboard-view-btn' + (resolvedMode === 'cards' ? ' is-active' : '');
            }
            if (tableButton) {
                tableButton.className = 'modern-dashboard-view-btn' + (resolvedMode === 'table' ? ' is-active' : '');
            }
        }

        var applyFilters = function (newPage, resetFilters) {
            var query = parseQuery(window.location.search);
            query.m = 'dashboard';
            query.a = 'my';
            query.view = 'list';
            query.display = currentDisplayMode;

            var scopeEl = document.getElementById('modernDashboardScope');
            if (scopeEl) {
                query.scope = scopeEl.value;
            }

            if (resetFilters) {
                query.companyID = '';
                query.jobOrderID = '';
                query.statusID = '';
                query.showClosed = '';
            } else {
                var companyEl = document.getElementById('modernDashboardCompany');
                query.companyID = companyEl ? companyEl.value : '';

                var jobOrderEl = document.getElementById('modernDashboardJobOrder');
                query.jobOrderID = jobOrderEl ? jobOrderEl.value : '';

                var statusEl = document.getElementById('modernDashboardStatus');
                query.statusID = statusEl ? statusEl.value : '';

                var showClosedEl = document.getElementById('modernDashboardShowClosed');
                query.showClosed = (showClosedEl && showClosedEl.checked) ? '1' : '';
            }

            query.page = toText(newPage || 1);
            if (!query.ui) {
                query.ui = 'modern';
            }

            var queryString = buildQuery(query);
            window.location.href = (bootstrap.indexName || 'index.php') + '?' + queryString;
        };

        function bindChange(id) {
            var element = document.getElementById(id);
            if (!element) {
                return;
            }
            element.onchange = function () {
                applyFilters(1, false);
            };
        }

        bindChange('modernDashboardScope');
        bindChange('modernDashboardCompany');
        bindChange('modernDashboardJobOrder');
        bindChange('modernDashboardStatus');
        bindChange('modernDashboardShowClosed');

        var displayCardsButton = document.getElementById('modernDisplayCards');
        if (displayCardsButton) {
            displayCardsButton.onclick = function () {
                setDisplayMode('cards');
            };
        }

        var displayTableButton = document.getElementById('modernDisplayTable');
        if (displayTableButton) {
            displayTableButton.onclick = function () {
                setDisplayMode('table');
            };
        }

        var resetButton = document.getElementById('modernDashboardReset');
        if (resetButton) {
            resetButton.onclick = function () {
                applyFilters(1, true);
            };
        }

        var prevButton = document.getElementById('modernDashboardPrev');
        if (prevButton) {
            prevButton.onclick = function () {
                var currentPage = parseInt(meta.page, 10) || 1;
                if (currentPage > 1) {
                    applyFilters(currentPage - 1, false);
                }
            };
        }

        var nextButton = document.getElementById('modernDashboardNext');
        if (nextButton) {
            nextButton.onclick = function () {
                var currentPage = parseInt(meta.page, 10) || 1;
                var totalPages = parseInt(meta.totalPages, 10) || 1;
                if (currentPage < totalPages) {
                    applyFilters(currentPage + 1, false);
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
