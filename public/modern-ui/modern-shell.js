(function () {
    function decodeBootstrap(root) {
        var payload = root.getAttribute('data-bootstrap') || '';
        if (!payload) {
            return {};
        }

        try {
            return JSON.parse(atob(payload));
        } catch (error) {
            return {};
        }
    }

    function renderFallback(root, bootstrap, reason) {
        var safeModule = bootstrap.targetModule || 'unknown-module';
        var safeAction = bootstrap.targetAction || '(default)';
        var legacyURL = bootstrap.legacyURL || 'index.php';
        var modernURL = bootstrap.modernURL || 'index.php';
        var fallbackReason = reason || 'No modern bundle configured for this route.';

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
            '</div>';
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

    function mountExternalBundle(root, bootstrap) {
        if (window.OpenCATSModernApp && typeof window.OpenCATSModernApp.mount === 'function') {
            window.OpenCATSModernApp.mount(root, bootstrap);
            return true;
        }

        var bundleURL = root.getAttribute('data-bundle-url');
        if (!bundleURL) {
            return false;
        }

        loadScript(
            bundleURL,
            function () {
                if (window.OpenCATSModernApp && typeof window.OpenCATSModernApp.mount === 'function') {
                    window.OpenCATSModernApp.mount(root, bootstrap);
                    return;
                }

                renderFallback(root, bootstrap, 'Bundle loaded but OpenCATSModernApp.mount() was not found.');
            },
            function () {
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

        var bootstrap = decodeBootstrap(root);
        if (mountExternalBundle(root, bootstrap)) {
            return;
        }

        if (mountDevServerIfConfigured(root, bootstrap)) {
            return;
        }

        renderFallback(root, bootstrap, 'No bundle URL or dev server URL configured.');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();

