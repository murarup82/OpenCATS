(function () {
    function getLogStore() {
        if (typeof window === 'undefined') {
            return [];
        }

        if (!window.__openCATSModernShellLogs || !Array.isArray(window.__openCATSModernShellLogs)) {
            window.__openCATSModernShellLogs = [];
        }

        return window.__openCATSModernShellLogs;
    }

    function recordLog(payload) {
        var logs = getLogStore();
        logs.push(payload);
        if (logs.length > 40) {
            logs.splice(0, logs.length - 40);
        }
    }

    function getRecentLogs(limit) {
        var logs = getLogStore();
        var count = limit || 8;
        if (count <= 0) {
            count = 8;
        }
        if (logs.length <= count) {
            return logs.slice(0);
        }
        return logs.slice(logs.length - count);
    }

    function formatLogLine(entry) {
        var ts = entry && entry.timestamp ? entry.timestamp : '';
        var level = entry && entry.level ? entry.level.toUpperCase() : 'INFO';
        var eventName = entry && entry.event ? entry.event : 'unknown';
        var details = '';

        if (entry && entry.details) {
            try {
                details = JSON.stringify(entry.details);
            } catch (error) {
                details = '[unserializable details]';
            }
        }

        if (details !== '') {
            return '[' + ts + '] ' + level + ' ' + eventName + ' ' + details;
        }

        return '[' + ts + '] ' + level + ' ' + eventName;
    }

    function ensureProcessShim() {
        if (typeof window === 'undefined') {
            return;
        }

        if (typeof window.process === 'undefined') {
            window.process = { env: { NODE_ENV: 'production' } };
            return;
        }

        if (!window.process.env) {
            window.process.env = { NODE_ENV: 'production' };
            return;
        }

        if (typeof window.process.env.NODE_ENV === 'undefined') {
            window.process.env.NODE_ENV = 'production';
        }
    }

    function resolveModernAppHost() {
        if (window.OpenCATSModernApp && typeof window.OpenCATSModernApp.mount === 'function') {
            return window.OpenCATSModernApp;
        }

        if (window.OpenCATSModernBundle && typeof window.OpenCATSModernBundle.mount === 'function') {
            window.OpenCATSModernApp = {
                mount: window.OpenCATSModernBundle.mount
            };
            return window.OpenCATSModernApp;
        }

        if (window.OpenCATSModernApp && typeof window.OpenCATSModernApp === 'function') {
            window.OpenCATSModernApp = {
                mount: window.OpenCATSModernApp
            };
            return window.OpenCATSModernApp;
        }

        return null;
    }

    function telemetry(root, level, eventName, details) {
        var loggingEnabled = root.getAttribute('data-client-logging') !== '0';
        var payload = {
            source: 'modern-shell',
            level: level,
            event: eventName,
            details: details || {},
            timestamp: (new Date()).toISOString()
        };
        recordLog(payload);

        if (loggingEnabled && window.console) {
            var message = '[modern-shell] ' + eventName;
            if (level === 'error' && typeof window.console.error === 'function') {
                window.console.error(message, payload);
            } else if (level === 'warn' && typeof window.console.warn === 'function') {
                window.console.warn(message, payload);
            } else if (typeof window.console.info === 'function') {
                window.console.info(message, payload);
            }
        }

        if (typeof window.CustomEvent === 'function') {
            try {
                window.dispatchEvent(new CustomEvent('opencats:modern-shell', { detail: payload }));
            } catch (error) {}
        }
    }

    function decodeBootstrap(root) {
        var payload = root.getAttribute('data-bootstrap') || '';
        if (!payload) {
            telemetry(root, 'warn', 'bootstrap.missing');
            return {};
        }

        try {
            return JSON.parse(atob(payload));
        } catch (error) {
            telemetry(root, 'error', 'bootstrap.decode.failed', {
                message: (error && error.message) ? error.message : 'Unknown error'
            });
            return {};
        }
    }

    function renderFallback(root, bootstrap, reason) {
        var safeModule = bootstrap.targetModule || 'unknown-module';
        var safeAction = bootstrap.targetAction || '(default)';
        var legacyURL = bootstrap.legacyURL || 'index.php';
        var modernURL = bootstrap.modernURL || 'index.php';
        var fallbackReason = reason || 'No modern bundle configured for this route.';
        var autoFallbackSeconds = parseInt(root.getAttribute('data-auto-legacy-fallback-seconds'), 10);
        if (isNaN(autoFallbackSeconds) || autoFallbackSeconds < 0) {
            autoFallbackSeconds = 0;
        }
        var recentLogs = getRecentLogs(8);
        var debugLogHTML = '';
        if (recentLogs.length > 0) {
            var logLines = [];
            for (var i = 0; i < recentLogs.length; i++) {
                logLines.push(formatLogLine(recentLogs[i]));
            }

            debugLogHTML =
                '<div class="modern-shell-fallback-log">' +
                    '<div class="modern-shell-fallback-log-title">Diagnostics</div>' +
                    '<pre class="modern-shell-fallback-log-pre">' + escapeHtml(logLines.join('\n')) + '</pre>' +
                '</div>';
        }

        telemetry(root, 'warn', 'fallback.rendered', {
            module: safeModule,
            action: safeAction,
            reason: fallbackReason,
            autoLegacyFallbackSeconds: autoFallbackSeconds
        });

        root.innerHTML =
            '<div class="modern-shell-fallback">' +
                '<h3>Modern shell is active</h3>' +
                '<p>This route is ready for progressive migration. The legacy page remains one click away.</p>' +
                '<div class="modern-shell-fallback-meta">' +
                    '<span class="modern-shell-fallback-chip">Module: ' + escapeHtml(safeModule) + '</span>' +
                    '<span class="modern-shell-fallback-chip">Action: ' + escapeHtml(safeAction) + '</span>' +
                    '<span class="modern-shell-fallback-chip">Reason: ' + escapeHtml(fallbackReason) + '</span>' +
                '</div>' +
                '<div class="modern-shell-fallback-actions">' +
                    '<a class="button ui2-button ui2-button--secondary" href="' + escapeAttribute(legacyURL) + '">Open Legacy UI</a>' +
                    '<a class="button ui2-button ui2-button--primary" href="' + escapeAttribute(modernURL) + '">Stay on Modern UI</a>' +
                '</div>' +
                debugLogHTML +
            '</div>';

        if (autoFallbackSeconds > 0) {
            window.setTimeout(function () {
                telemetry(root, 'warn', 'fallback.auto-legacy-redirect', {
                    targetURL: legacyURL,
                    seconds: autoFallbackSeconds
                });
                window.location.href = legacyURL;
            }, autoFallbackSeconds * 1000);
        }
    }

    function escapeHtml(value) {
        var div = document.createElement('div');
        div.textContent = value == null ? '' : String(value);
        return div.innerHTML;
    }

    function escapeAttribute(value) {
        return escapeHtml(value).replace(/"/g, '&quot;');
    }

    function loadScript(url, onLoad, onError) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.async = true;
        script.onload = onLoad;
        script.onerror = onError;
        document.head.appendChild(script);
    }

    function sanitizeDimension(value, fallback) {
        var parsed = parseInt(value, 10);
        if (isNaN(parsed) || parsed <= 0) {
            return fallback;
        }
        return parsed;
    }

    function parseURLSearchParams(rawURL) {
        var normalizedURL = String(rawURL || '').replace(/&amp;/g, '&');
        if (normalizedURL === '') {
            return null;
        }

        try {
            var parsed = new URL(normalizedURL, window.location.href);
            return parsed.searchParams;
        } catch (error) {
            return null;
        }
    }

    function enforceModernNavigationLinks(sidebar, bootstrap) {
        if (!bootstrap || String(bootstrap.mode || '').toLowerCase() !== 'modern') {
            return;
        }

        var containers = [];
        if (sidebar) {
            containers.push(sidebar);
        }

        var shellLayout = document.querySelector('.modern-shell-layout');
        if (shellLayout) {
            containers.push(shellLayout);
        }

        for (var containerIndex = 0; containerIndex < containers.length; containerIndex++) {
            var container = containers[containerIndex];
            if (!container) {
                continue;
            }

            var links = container.querySelectorAll('a[href]');
            for (var linkIndex = 0; linkIndex < links.length; linkIndex++) {
                var link = links[linkIndex];
                if (!link || link.getAttribute('data-modern-shell-ui-link') === '1') {
                    continue;
                }

                if (link.hasAttribute('download')) {
                    continue;
                }

                var targetAttr = String(link.getAttribute('target') || '').toLowerCase();
                if (targetAttr !== '' && targetAttr !== '_self') {
                    continue;
                }

                var hrefValue = String(link.getAttribute('href') || '');
                if (hrefValue === '' || hrefValue.charAt(0) === '#') {
                    continue;
                }

                var parsed;
                try {
                    parsed = new URL(hrefValue, window.location.href);
                } catch (error) {
                    continue;
                }

                if (parsed.origin !== window.location.origin) {
                    continue;
                }

                var moduleName = String(parsed.searchParams.get('m') || '').toLowerCase();
                if (moduleName === '') {
                    continue;
                }

                if (moduleName === 'logout' || moduleName === 'login') {
                    continue;
                }

                var currentUiMode = String(parsed.searchParams.get('ui') || '').toLowerCase();
                if (currentUiMode === 'legacy') {
                    continue;
                }

                parsed.searchParams.set('ui', 'modern');
                link.setAttribute('href', parsed.pathname + parsed.search + parsed.hash);
                link.setAttribute('data-modern-shell-ui-link', '1');
            }
        }
    }

    function installAppShellNavigation(root, bootstrap) {
        if (typeof document === 'undefined' || !document.body) {
            return;
        }

        var sidebar = document.querySelector('.ui2-sidebar');
        if (!sidebar || sidebar.getAttribute('data-modern-shell-enhanced') === '1') {
            return;
        }

        var storageKey = 'opencats-modern-shell-sidebar-collapsed';
        var mount = document.getElementById('modernShellAppShellMount');

        var shellHeader = document.createElement('div');
        shellHeader.className = 'modern-shell-sidebar-header';

        var shellLabel = document.createElement('span');
        shellLabel.className = 'modern-shell-sidebar-label';
        shellLabel.textContent = 'Workspace';

        var shellToggle = document.createElement('button');
        shellToggle.type = 'button';
        shellToggle.className = 'modern-shell-sidebar-toggle';
        shellToggle.setAttribute('aria-label', 'Toggle sidebar');

        shellHeader.appendChild(shellLabel);
        shellHeader.appendChild(shellToggle);
        sidebar.insertBefore(shellHeader, sidebar.firstChild);

        function applySidebarState(collapsed) {
            document.body.classList.toggle('modern-shell-sidebar-collapsed', collapsed);
            shellToggle.textContent = collapsed ? 'Expand' : 'Collapse';
            shellToggle.setAttribute('aria-pressed', collapsed ? 'true' : 'false');
            shellToggle.setAttribute('title', collapsed ? 'Expand navigation' : 'Collapse navigation');
            try {
                window.localStorage.setItem(storageKey, collapsed ? '1' : '0');
            } catch (error) {}
        }

        function isCollapsed() {
            try {
                return window.localStorage.getItem(storageKey) === '1';
            } catch (error) {
                return false;
            }
        }

        shellToggle.addEventListener('click', function () {
            applySidebarState(!document.body.classList.contains('modern-shell-sidebar-collapsed'));
        });

        applySidebarState(isCollapsed());
        installSidebarGroupToggles(sidebar);
        enforceModernNavigationLinks(sidebar, bootstrap);

        if (mount) {
            mount.innerHTML = '';

            var appbar = document.createElement('div');
            appbar.className = 'modern-shell-appbar';

            var appbarLeft = document.createElement('div');
            appbarLeft.className = 'modern-shell-appbar__left';

            var appbarMenuButton = document.createElement('button');
            appbarMenuButton.type = 'button';
            appbarMenuButton.className = 'modern-shell-appbar__menu';
            appbarMenuButton.textContent = 'Menu';
            appbarMenuButton.addEventListener('click', function () {
                applySidebarState(!document.body.classList.contains('modern-shell-sidebar-collapsed'));
            });

            var appbarRoute = document.createElement('div');
            appbarRoute.className = 'modern-shell-appbar__route';
            var moduleText = bootstrap && bootstrap.targetModule ? bootstrap.targetModule : 'dashboard';
            var actionText = bootstrap && bootstrap.targetAction ? bootstrap.targetAction : '(default)';
            appbarRoute.textContent = moduleText + ' / ' + actionText;

            appbarLeft.appendChild(appbarMenuButton);
            appbarLeft.appendChild(appbarRoute);

            var appbarRight = document.createElement('div');
            appbarRight.className = 'modern-shell-appbar__right';
            appbarRight.textContent = 'Modern App Shell';

            appbar.appendChild(appbarLeft);
            appbar.appendChild(appbarRight);
            mount.appendChild(appbar);
        }

        enforceModernNavigationLinks(sidebar, bootstrap);

        sidebar.setAttribute('data-modern-shell-enhanced', '1');
        telemetry(root, 'info', 'shell.sidebar.enhanced');
    }

    function installSidebarGroupToggles(sidebar) {
        if (!sidebar || sidebar.getAttribute('data-modern-sidebar-groups') === '1') {
            return;
        }

        var groups = sidebar.querySelectorAll('.ui2-sidebar-group');
        var storagePrefix = 'opencats-modern-shell-group-collapsed-';

        for (var i = 0; i < groups.length; i++) {
            var group = groups[i];
            var title = group.querySelector('.ui2-sidebar-group-title');
            if (!title) {
                continue;
            }

            var childrenToMove = [];
            for (var childIndex = 0; childIndex < group.children.length; childIndex++) {
                var childNode = group.children[childIndex];
                if (childNode === title) {
                    continue;
                }
                childrenToMove.push(childNode);
            }

            if (childrenToMove.length === 0) {
                continue;
            }

            var panel = document.createElement('div');
            panel.className = 'modern-shell-sidebar-group-panel';
            panel.id = 'modernShellSidebarGroupPanel' + i;

            for (var itemIndex = 0; itemIndex < childrenToMove.length; itemIndex++) {
                panel.appendChild(childrenToMove[itemIndex]);
            }
            group.appendChild(panel);

            title.classList.add('modern-shell-sidebar-group-title--toggle');
            title.setAttribute('role', 'button');
            title.setAttribute('tabindex', '0');
            title.setAttribute('aria-controls', panel.id);

            (function (groupNode, titleNode, panelNode, key) {
                function setCollapsed(collapsed) {
                    groupNode.classList.toggle('modern-shell-sidebar-group--collapsed', collapsed);
                    titleNode.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
                    panelNode.style.display = collapsed ? 'none' : '';
                    try {
                        window.localStorage.setItem(key, collapsed ? '1' : '0');
                    } catch (error) {}
                }

                function getCollapsed() {
                    try {
                        return window.localStorage.getItem(key) === '1';
                    } catch (error) {
                        return false;
                    }
                }

                titleNode.addEventListener('click', function () {
                    setCollapsed(!groupNode.classList.contains('modern-shell-sidebar-group--collapsed'));
                });

                titleNode.addEventListener('keydown', function (event) {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setCollapsed(!groupNode.classList.contains('modern-shell-sidebar-group--collapsed'));
                    }
                });

                setCollapsed(getCollapsed());
            })(group, title, panel, storagePrefix + String(i));
        }

        sidebar.setAttribute('data-modern-sidebar-groups', '1');
    }

    function installLegacyPopupBridge(root) {
        if (typeof window === 'undefined' || !document || !document.body) {
            return;
        }

        if (window.__openCATSModernPopupBridgeInstalled) {
            return;
        }

        var overlay = document.createElement('div');
        overlay.className = 'modern-legacy-popup-mask';
        overlay.style.display = 'none';

        var panel = document.createElement('div');
        panel.className = 'modern-legacy-popup';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'true');
        panel.setAttribute('aria-label', 'Popup dialog');

        var titleBar = document.createElement('div');
        titleBar.className = 'modern-legacy-popup__titlebar';

        var titleNode = document.createElement('div');
        titleNode.className = 'modern-legacy-popup__title';
        titleNode.textContent = '';

        var closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'modern-legacy-popup__close';
        closeButton.textContent = 'Close';

        var body = document.createElement('div');
        body.className = 'modern-legacy-popup__body';

        var iframe = document.createElement('iframe');
        iframe.className = 'modern-legacy-popup__iframe';
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowtransparency', 'true');
        iframe.style.display = '';
        iframe.src = 'js/submodal/loading.html';

        var htmlPane = document.createElement('div');
        htmlPane.className = 'modern-legacy-popup__html';
        htmlPane.style.display = 'none';

        body.appendChild(iframe);
        body.appendChild(htmlPane);
        titleBar.appendChild(titleNode);
        titleBar.appendChild(closeButton);
        panel.appendChild(titleBar);
        panel.appendChild(body);
        overlay.appendChild(panel);
        document.body.appendChild(overlay);

        var bridgeState = {
            isOpen: false,
            returnFunc: null
        };

        function getReturnValue() {
            try {
                if (iframe && iframe.contentWindow && typeof iframe.contentWindow.returnVal !== 'undefined') {
                    return iframe.contentWindow.returnVal;
                }
            } catch (error) {}
            return undefined;
        }

        function setTitle(title) {
            titleNode.textContent = title == null ? '' : String(title);
        }

        function updateSize(width, height) {
            var viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
            var viewportHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
            var maxWidth = Math.max(340, viewportWidth - 44);
            var maxHeight = Math.max(260, viewportHeight - 56);
            var nextWidth = Math.min(width, maxWidth);
            var nextHeight = Math.min(height, maxHeight);

            panel.style.width = nextWidth + 'px';
            body.style.height = nextHeight + 'px';
        }

        function showPopup(url, width, height, returnFunc, html) {
            var safeWidth = sanitizeDimension(width, 760);
            var safeHeight = sanitizeDimension(height, 540);

            bridgeState.isOpen = true;
            bridgeState.returnFunc = returnFunc;
            window.gPopupIsShown = true;

            setTitle('');
            updateSize(safeWidth, safeHeight);
            overlay.style.display = 'grid';

            if (html == null) {
                htmlPane.style.display = 'none';
                iframe.style.display = '';
                iframe.src = url || 'js/submodal/loading.html';
            } else {
                iframe.style.display = 'none';
                iframe.src = 'js/submodal/loading.html';
                htmlPane.style.display = '';
                htmlPane.innerHTML = String(html);
            }
        }

        function hidePopup(callReturnFunc, refreshAfterClose) {
            if (!bridgeState.isOpen) {
                return;
            }

            bridgeState.isOpen = false;
            window.gPopupIsShown = false;
            overlay.style.display = 'none';

            var callback = bridgeState.returnFunc;
            bridgeState.returnFunc = null;

            if (callReturnFunc === true && typeof callback === 'function') {
                callback(getReturnValue());
            }

            htmlPane.innerHTML = '';
            htmlPane.style.display = 'none';
            iframe.style.display = '';
            iframe.src = 'js/submodal/loading.html';

            if (refreshAfterClose) {
                window.location.reload();
            }
        }

        closeButton.addEventListener('click', function () {
            hidePopup(false, false);
        });

        overlay.addEventListener('mousedown', function (event) {
            if (event.target === overlay) {
                hidePopup(false, false);
            }
        });

        window.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && bridgeState.isOpen) {
                hidePopup(false, false);
            }
        });

        window.showPopWin = function (url, width, height, returnFunc) {
            var searchParams = parseURLSearchParams(url);
            if (searchParams && typeof window.CustomEvent === 'function') {
                var moduleName = String(searchParams.get('m') || '').toLowerCase();
                var actionName = String(searchParams.get('a') || '').toLowerCase();
                if (moduleName === 'lists' &&
                    (actionName === 'quickactionaddtolistmodal' || actionName === 'addtolistfromdatagridmodal')) {
                    var detail = {
                        url: url
                    };
                    var dataItemType = parsePositiveInt(searchParams.get('dataItemType'));
                    var dataItemID = parsePositiveInt(searchParams.get('dataItemID'));
                    if (dataItemType > 0) {
                        detail.dataItemType = dataItemType;
                    }
                    if (dataItemID > 0) {
                        detail.dataItemID = dataItemID;
                    }

                    var openEvent = new CustomEvent('opencats:add-to-list:open', {
                        cancelable: true,
                        detail: detail
                    });
                    var shouldFallback = window.dispatchEvent(openEvent);
                    if (!shouldFallback) {
                        telemetry(root, 'info', 'popup.bridge.handled-by-react', {
                            module: moduleName,
                            action: actionName
                        });
                        return;
                    }
                }
            }

            if (!dispatchCancelableEvent('opencats:legacy-popup:open', {
                mode: 'url',
                url: url,
                width: sanitizeDimension(width, 760),
                height: sanitizeDimension(height, 540),
                returnFunc: returnFunc
            })) {
                telemetry(root, 'info', 'popup.bridge.handled-by-react', {
                    module: 'generic',
                    action: 'showPopWin'
                });
                return;
            }

            showPopup(url, width, height, returnFunc, null);
        };

        window.showPopWinHTML = function (html, width, height, returnFunc) {
            if (!dispatchCancelableEvent('opencats:legacy-popup:open', {
                mode: 'html',
                html: html,
                width: sanitizeDimension(width, 760),
                height: sanitizeDimension(height, 540),
                returnFunc: returnFunc
            })) {
                telemetry(root, 'info', 'popup.bridge.handled-by-react', {
                    module: 'generic',
                    action: 'showPopWinHTML'
                });
                return;
            }

            showPopup('', width, height, returnFunc, html);
        };

        window.hidePopWin = function (callReturnFunc) {
            if (!dispatchCancelableEvent('opencats:legacy-popup:close', {
                callReturnFunc: callReturnFunc === true,
                refresh: false
            })) {
                return;
            }

            hidePopup(callReturnFunc === true, false);
        };

        window.hidePopWinRefresh = function (callReturnFunc) {
            if (!dispatchCancelableEvent('opencats:legacy-popup:close', {
                callReturnFunc: callReturnFunc === true,
                refresh: true
            })) {
                return;
            }

            hidePopup(callReturnFunc === true, true);
        };

        window.setPopTitle = function (title) {
            if (!dispatchCancelableEvent('opencats:legacy-popup:title', {
                title: title
            })) {
                return;
            }

            setTitle(title);
        };

        window.__openCATSModernPopupBridgeInstalled = true;
        telemetry(root, 'info', 'popup.bridge.installed');
    }

    function parsePositiveInt(value) {
        var parsed = parseInt(value, 10);
        if (isNaN(parsed) || parsed <= 0) {
            return 0;
        }
        return parsed;
    }

    function dispatchCancelableEvent(eventName, detail) {
        if (typeof window.CustomEvent !== 'function') {
            return true;
        }

        var event = new CustomEvent(eventName, {
            cancelable: true,
            detail: detail || {}
        });

        return window.dispatchEvent(event);
    }

    function mountExternalBundle(root, bootstrap) {
        ensureProcessShim();
        var modernAppHost = resolveModernAppHost();
        if (modernAppHost) {
            try {
                modernAppHost.mount(root, bootstrap);
                telemetry(root, 'info', 'bundle.mount.success', {
                    source: 'preloaded-global'
                });
            } catch (error) {
                telemetry(root, 'error', 'bundle.mount.failed', {
                    source: 'preloaded-global',
                    message: (error && error.message) ? error.message : 'Unknown error'
                });
                renderFallback(root, bootstrap, 'Modern app failed during mount.');
            }
            return true;
        }

        var bundleURL = root.getAttribute('data-bundle-url');
        if (!bundleURL) {
            telemetry(root, 'warn', 'bundle.url.missing');
            return false;
        }

        telemetry(root, 'info', 'bundle.load.start', { bundleURL: bundleURL });

        loadScript(
            bundleURL,
            function () {
                var loadedModernAppHost = resolveModernAppHost();
                if (loadedModernAppHost) {
                    try {
                        loadedModernAppHost.mount(root, bootstrap);
                        telemetry(root, 'info', 'bundle.mount.success', {
                            source: 'loaded-script',
                            bundleURL: bundleURL
                        });
                        return;
                    } catch (error) {
                        telemetry(root, 'error', 'bundle.mount.failed', {
                            source: 'loaded-script',
                            bundleURL: bundleURL,
                            message: (error && error.message) ? error.message : 'Unknown error'
                        });
                        renderFallback(root, bootstrap, 'Modern app failed during mount.');
                        return;
                    }
                }

                telemetry(root, 'error', 'bundle.mount.missing', { bundleURL: bundleURL });
                renderFallback(root, bootstrap, 'Bundle loaded but OpenCATSModernApp.mount() was not found.');
            },
            function () {
                telemetry(root, 'error', 'bundle.load.failed', { bundleURL: bundleURL });
                renderFallback(root, bootstrap, 'Failed to load configured modern bundle.');
            }
        );

        return true;
    }

    function mountDevServerIfConfigured(root, bootstrap) {
        var devServerURL = root.getAttribute('data-dev-server-url');
        if (!devServerURL) {
            return false;
        }

        telemetry(root, 'info', 'dev-server.mount.start', { devServerURL: devServerURL });
        var iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.minHeight = '560px';
        iframe.style.border = '0';
        iframe.style.borderRadius = '10px';
        iframe.src = devServerURL + (devServerURL.indexOf('?') >= 0 ? '&' : '?') + 'route=' + encodeURIComponent(bootstrap.targetModule + '/' + (bootstrap.targetAction || ''));
        root.innerHTML = '';
        root.appendChild(iframe);
        return true;
    }

    function boot() {
        var root = document.getElementById('modernAppRoot');
        if (!root) {
            return;
        }

        ensureProcessShim();
        installLegacyPopupBridge(root);
        var bootstrap = decodeBootstrap(root);
        installAppShellNavigation(root, bootstrap);
        telemetry(root, 'info', 'shell.boot', {
            module: bootstrap.targetModule || '',
            action: bootstrap.targetAction || '',
            resolvedBy: bootstrap.resolvedBy || ''
        });
        if (mountExternalBundle(root, bootstrap)) {
            return;
        }

        if (mountDevServerIfConfigured(root, bootstrap)) {
            return;
        }

        renderFallback(root, bootstrap, 'No bundle URL or dev server URL configured.');
    }

    if (typeof window.addEventListener === 'function') {
        window.addEventListener('error', function (event) {
            var root = document.getElementById('modernAppRoot');
            if (!root) {
                return;
            }
            telemetry(root, 'error', 'window.error', {
                message: event && event.message ? event.message : 'Unknown error'
            });
        });

        window.addEventListener('unhandledrejection', function (event) {
            var root = document.getElementById('modernAppRoot');
            if (!root) {
                return;
            }
            var reason = (event && event.reason && event.reason.message) ? event.reason.message : String(event.reason || 'Unhandled rejection');
            telemetry(root, 'error', 'window.unhandledrejection', {
                message: reason
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
