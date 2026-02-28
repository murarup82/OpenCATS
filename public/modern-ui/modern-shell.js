(function () {
    function telemetry(root, level, eventName, details) {
        var loggingEnabled = root.getAttribute('data-client-logging') !== '0';
        var payload = {
            source: 'modern-shell',
            level: level,
            event: eventName,
            details: details || {},
            timestamp: (new Date()).toISOString()
        };

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

    function mountExternalBundle(root, bootstrap) {
        if (window.OpenCATSModernApp && typeof window.OpenCATSModernApp.mount === 'function') {
            try {
                window.OpenCATSModernApp.mount(root, bootstrap);
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
                if (window.OpenCATSModernApp && typeof window.OpenCATSModernApp.mount === 'function') {
                    try {
                        window.OpenCATSModernApp.mount(root, bootstrap);
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

        var bootstrap = decodeBootstrap(root);
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
