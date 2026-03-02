(function () {
    if (typeof window === 'undefined') {
        return;
    }

    if (window.OpenCATSInteractionLog && window.OpenCATSInteractionLog.version) {
        return;
    }

    var STORAGE_KEY = 'opencats:ui:interaction-logs:v1';
    var MAX_ENTRIES = 2000;
    var listeners = [];
    var entries = loadEntries();
    var serverContextLogged = false;

    function nowISO() {
        return (new Date()).toISOString();
    }

    function createID() {
        return String(new Date().getTime()) + '-' + String(Math.floor(Math.random() * 1000000));
    }

    function truncateString(value, maxLength) {
        var input = String(value == null ? '' : value);
        if (input.length <= maxLength) {
            return input;
        }
        return input.substring(0, maxLength) + '...';
    }

    function normalizeWhitespace(value) {
        return String(value == null ? '' : value).replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
    }

    function isSensitiveKey(key) {
        return /(token|password|passwd|secret|authorization|session|cookie|csrf|security)/i.test(String(key || ''));
    }

    function parseURL(rawURL) {
        if (!rawURL) {
            return null;
        }

        try {
            return new URL(String(rawURL), window.location.href);
        } catch (error) {
            return null;
        }
    }

    function redactURL(rawURL) {
        if (!rawURL) {
            return '';
        }

        var parsed = parseURL(rawURL);
        if (!parsed) {
            return truncateString(String(rawURL), 400).replace(
                /([?&][^=]*(token|password|secret|authorization|session|cookie|csrf|security)[^=]*)=[^&]*/ig,
                '$1=[REDACTED]'
            );
        }

        try {
            var keys = [];
            parsed.searchParams.forEach(function (_value, key) {
                keys.push(key);
            });
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (isSensitiveKey(key)) {
                    parsed.searchParams.set(key, '[REDACTED]');
                } else {
                    var value = parsed.searchParams.get(key);
                    parsed.searchParams.set(key, truncateString(value == null ? '' : value, 180));
                }
            }
        } catch (error) {}

        return parsed.pathname + parsed.search + parsed.hash;
    }

    function extractRoute(rawURL) {
        var route = {
            module: '',
            action: '',
            ui: '',
            format: ''
        };

        var parsed = parseURL(rawURL);
        if (!parsed) {
            return route;
        }

        try {
            route.module = normalizeWhitespace(parsed.searchParams.get('m') || '').toLowerCase();
            route.action = normalizeWhitespace(parsed.searchParams.get('a') || '').toLowerCase();
            route.ui = normalizeWhitespace(parsed.searchParams.get('ui') || '').toLowerCase();
            route.format = normalizeWhitespace(parsed.searchParams.get('format') || '').toLowerCase();
        } catch (error) {}

        if (route.module === '' && window.OpenCATSPageContext && typeof window.OpenCATSPageContext === 'object') {
            route.module = normalizeWhitespace(window.OpenCATSPageContext.module || '').toLowerCase();
        }
        if (route.action === '' && window.OpenCATSPageContext && typeof window.OpenCATSPageContext === 'object') {
            route.action = normalizeWhitespace(window.OpenCATSPageContext.action || '').toLowerCase();
        }
        if (route.ui === '' && window.OpenCATSPageContext && typeof window.OpenCATSPageContext === 'object') {
            route.ui = normalizeWhitespace(window.OpenCATSPageContext.queryUI || '').toLowerCase();
        }

        return route;
    }

    function getServerPageContext() {
        if (!window.OpenCATSPageContext || typeof window.OpenCATSPageContext !== 'object') {
            return null;
        }
        return sanitizeValue(window.OpenCATSPageContext, 0);
    }

    function logServerContextOnce(contextValue) {
        if (serverContextLogged) {
            return;
        }

        var context = contextValue || getServerPageContext();
        if (!context) {
            return;
        }

        serverContextLogged = true;
        logEvent('ui.server.context', context);
        if (context.uiSwitch && context.uiSwitch.switches) {
            logEvent('ui.server.switches', context.uiSwitch.switches);
        }
    }

    function sanitizeValue(value, depth) {
        if (depth > 4) {
            return '[MAX_DEPTH]';
        }

        if (value === null || typeof value === 'undefined') {
            return value;
        }

        var valueType = typeof value;
        if (valueType === 'number' || valueType === 'boolean') {
            return value;
        }

        if (valueType === 'string') {
            return truncateString(value, 500);
        }

        if (value instanceof Date) {
            return value.toISOString();
        }

        if (valueType === 'function') {
            return '[FUNCTION]';
        }

        if (Object.prototype.toString.call(value) === '[object Array]') {
            var arrayResult = [];
            var maxArrayItems = 30;
            for (var i = 0; i < value.length && i < maxArrayItems; i++) {
                arrayResult.push(sanitizeValue(value[i], depth + 1));
            }
            if (value.length > maxArrayItems) {
                arrayResult.push('[TRUNCATED]');
            }
            return arrayResult;
        }

        if (valueType === 'object') {
            var objectResult = {};
            var count = 0;
            for (var key in value) {
                if (!Object.prototype.hasOwnProperty.call(value, key)) {
                    continue;
                }

                count++;
                if (count > 40) {
                    objectResult.__truncated__ = true;
                    break;
                }

                if (isSensitiveKey(key)) {
                    objectResult[key] = '[REDACTED]';
                    continue;
                }

                if (/url/i.test(key)) {
                    objectResult[key] = redactURL(String(value[key] == null ? '' : value[key]));
                    continue;
                }

                objectResult[key] = sanitizeValue(value[key], depth + 1);
            }
            return objectResult;
        }

        return truncateString(String(value), 300);
    }

    function notifyListeners(change) {
        for (var i = 0; i < listeners.length; i++) {
            try {
                listeners[i](change);
            } catch (error) {}
        }
    }

    function trimEntries() {
        if (entries.length <= MAX_ENTRIES) {
            return;
        }
        entries.splice(0, entries.length - MAX_ENTRIES);
    }

    function persistEntries() {
        trimEntries();
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        } catch (error) {
            // Try to recover from storage quota by dropping oldest half.
            if (entries.length > 10) {
                entries.splice(0, Math.floor(entries.length / 2));
                try {
                    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
                } catch (secondError) {}
            }
        }
    }

    function loadEntries() {
        try {
            var raw = window.localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return [];
            }

            var parsed = JSON.parse(raw);
            if (Object.prototype.toString.call(parsed) !== '[object Array]') {
                return [];
            }

            if (parsed.length > MAX_ENTRIES) {
                parsed = parsed.slice(parsed.length - MAX_ENTRIES);
            }

            return parsed;
        } catch (error) {
            return [];
        }
    }

    function logEvent(type, details) {
        var route = extractRoute(window.location.href);
        var entry = {
            id: createID(),
            timestamp: nowISO(),
            type: truncateString(type || 'custom', 120),
            route: route,
            pageURL: redactURL(window.location.href),
            details: sanitizeValue(details || {}, 0)
        };

        entries.push(entry);
        persistEntries();
        notifyListeners({
            kind: 'append',
            entry: entry,
            count: entries.length
        });

        return entry;
    }

    function shouldLogNetworkRequest(rawURL) {
        if (!rawURL) {
            return false;
        }

        var parsed = parseURL(rawURL);
        if (!parsed) {
            return false;
        }

        if (parsed.origin !== window.location.origin) {
            return false;
        }

        var path = String(parsed.pathname || '').toLowerCase();
        if (/\.(js|css|png|jpe?g|gif|svg|ico|woff2?|ttf|map)$/.test(path)) {
            return false;
        }

        return true;
    }

    function eventTargetToElement(target) {
        var node = target;
        var depth = 0;
        while (node && depth < 8) {
            if (node.nodeType === 1) {
                var tag = String(node.tagName || '').toLowerCase();
                if (tag === 'a' || tag === 'button' || tag === 'select' || tag === 'summary') {
                    return node;
                }
                if (tag === 'input') {
                    var type = String(node.getAttribute('type') || '').toLowerCase();
                    if (type === '' || type === 'button' || type === 'submit' || type === 'checkbox' || type === 'radio') {
                        return node;
                    }
                }
                var role = String(node.getAttribute('role') || '').toLowerCase();
                if (role === 'button' || node.getAttribute('onclick')) {
                    return node;
                }
            }
            node = node.parentNode;
            depth++;
        }
        return null;
    }

    function getElementDescriptor(element) {
        if (!element || element.nodeType !== 1) {
            return {};
        }

        var descriptor = {
            tag: String(element.tagName || '').toLowerCase(),
            id: truncateString(element.id || '', 120),
            name: truncateString(element.getAttribute('name') || '', 120)
        };

        var className = normalizeWhitespace(element.className || '');
        if (className !== '') {
            descriptor.className = truncateString(className, 240);
        }

        var text = normalizeWhitespace(element.textContent || element.innerText || '');
        if (text !== '') {
            descriptor.text = truncateString(text, 180);
        }

        if (descriptor.tag === 'a') {
            descriptor.href = redactURL(element.getAttribute('href') || element.href || '');
        }

        if (descriptor.tag === 'input') {
            descriptor.inputType = String(element.getAttribute('type') || 'text').toLowerCase();
            if (descriptor.inputType === 'checkbox' || descriptor.inputType === 'radio') {
                descriptor.checked = !!element.checked;
            }
        }

        return descriptor;
    }

    function getErrorMessage(errorLike) {
        if (errorLike === null || typeof errorLike === 'undefined') {
            return '';
        }

        if (typeof errorLike === 'string') {
            return truncateString(errorLike, 400);
        }

        if (typeof errorLike.message === 'string') {
            return truncateString(errorLike.message, 400);
        }

        try {
            return truncateString(JSON.stringify(errorLike), 400);
        } catch (error) {
            return truncateString(String(errorLike), 400);
        }
    }

    function installFetchLogger() {
        if (!window.fetch || window.fetch.__openCatsInteractionPatched) {
            return;
        }

        var originalFetch = window.fetch;
        var patchedFetch = function (input, init) {
            var method = 'GET';
            var rawURL = '';

            if (typeof input === 'string') {
                rawURL = input;
            } else if (input && typeof input.url === 'string') {
                rawURL = input.url;
                if (input.method) {
                    method = input.method;
                }
            }

            if (init && init.method) {
                method = init.method;
            }
            method = String(method || 'GET').toUpperCase();

            var startedAt = new Date().getTime();
            return originalFetch.apply(this, arguments).then(function (response) {
                var responseURL = (response && response.url) ? response.url : rawURL;
                if (shouldLogNetworkRequest(responseURL)) {
                    logEvent('network.fetch', {
                        method: method,
                        url: redactURL(responseURL),
                        status: response.status,
                        ok: !!response.ok,
                        durationMs: (new Date().getTime() - startedAt)
                    });
                }
                return response;
            }, function (error) {
                if (shouldLogNetworkRequest(rawURL)) {
                    logEvent('network.fetch.error', {
                        method: method,
                        url: redactURL(rawURL),
                        durationMs: (new Date().getTime() - startedAt),
                        error: getErrorMessage(error)
                    });
                }
                throw error;
            });
        };

        patchedFetch.__openCatsInteractionPatched = true;
        window.fetch = patchedFetch;
    }

    function installXHRLogger() {
        if (!window.XMLHttpRequest || !window.XMLHttpRequest.prototype) {
            return;
        }

        if (window.XMLHttpRequest.prototype.open.__openCatsInteractionPatched) {
            return;
        }

        var originalOpen = window.XMLHttpRequest.prototype.open;
        var originalSend = window.XMLHttpRequest.prototype.send;

        window.XMLHttpRequest.prototype.open = function (method, url) {
            this.__openCatsInteraction = {
                method: String(method || 'GET').toUpperCase(),
                url: String(url || ''),
                startedAt: 0,
                outcome: 'ok'
            };
            return originalOpen.apply(this, arguments);
        };

        window.XMLHttpRequest.prototype.send = function () {
            var xhr = this;
            var context = xhr.__openCatsInteraction || null;
            if (context) {
                context.startedAt = new Date().getTime();
            }

            var finished = false;
            function finalize() {
                if (finished || !context) {
                    return;
                }
                finished = true;

                if (!shouldLogNetworkRequest(context.url)) {
                    return;
                }

                var statusCode = 0;
                try {
                    statusCode = xhr.status;
                } catch (error) {}

                var duration = 0;
                if (context.startedAt > 0) {
                    duration = new Date().getTime() - context.startedAt;
                }

                var eventType = 'network.xhr';
                if (context.outcome === 'abort') {
                    eventType = 'network.xhr.abort';
                } else if (context.outcome === 'timeout') {
                    eventType = 'network.xhr.timeout';
                } else if (context.outcome === 'error') {
                    eventType = 'network.xhr.error';
                }

                logEvent(eventType, {
                    method: context.method,
                    url: redactURL(context.url),
                    status: statusCode,
                    durationMs: duration
                });
            }

            xhr.addEventListener('abort', function () {
                if (context) {
                    context.outcome = 'abort';
                }
            });
            xhr.addEventListener('timeout', function () {
                if (context) {
                    context.outcome = 'timeout';
                }
            });
            xhr.addEventListener('error', function () {
                if (context) {
                    context.outcome = 'error';
                }
            });
            xhr.addEventListener('loadend', finalize);

            return originalSend.apply(this, arguments);
        };

        window.XMLHttpRequest.prototype.open.__openCatsInteractionPatched = true;
    }

    function installInteractionListeners() {
        document.addEventListener('click', function (event) {
            var element = eventTargetToElement(event.target || event.srcElement);
            if (!element) {
                return;
            }

            logEvent('ui.click', {
                element: getElementDescriptor(element),
                button: (typeof event.button === 'number') ? event.button : 0
            });
        }, true);

        document.addEventListener('change', function (event) {
            var element = event.target || event.srcElement;
            if (!element || element.nodeType !== 1) {
                return;
            }

            var tag = String(element.tagName || '').toLowerCase();
            if (tag !== 'input' && tag !== 'select' && tag !== 'textarea') {
                return;
            }

            var inputType = String(element.getAttribute('type') || '').toLowerCase();
            if (inputType === 'password' || inputType === 'hidden') {
                return;
            }

            var details = {
                field: {
                    tag: tag,
                    id: truncateString(element.id || '', 120),
                    name: truncateString(element.getAttribute('name') || '', 120),
                    inputType: inputType
                }
            };

            if (inputType === 'checkbox' || inputType === 'radio') {
                details.value = !!element.checked;
            } else {
                details.value = truncateString(String(element.value == null ? '' : element.value), 220);
            }

            logEvent('ui.change', details);
        }, true);

        document.addEventListener('submit', function (event) {
            var form = event.target || event.srcElement;
            if (!form || String(form.tagName || '').toLowerCase() !== 'form') {
                return;
            }

            logEvent('ui.submit', {
                method: String(form.getAttribute('method') || 'GET').toUpperCase(),
                action: redactURL(form.getAttribute('action') || window.location.href),
                hasFileUpload: ((form.enctype || '').toLowerCase() === 'multipart/form-data')
            });
        }, true);

        window.addEventListener('hashchange', function () {
            logEvent('ui.route.change', {
                trigger: 'hashchange',
                url: redactURL(window.location.href)
            });
        });

        window.addEventListener('popstate', function () {
            logEvent('ui.route.change', {
                trigger: 'popstate',
                url: redactURL(window.location.href)
            });
        });

        if (window.history && window.history.pushState && !window.history.pushState.__openCatsInteractionPatched) {
            var originalPushState = window.history.pushState;
            window.history.pushState = function () {
                var result = originalPushState.apply(window.history, arguments);
                logEvent('ui.route.change', {
                    trigger: 'pushState',
                    url: redactURL(window.location.href)
                });
                return result;
            };
            window.history.pushState.__openCatsInteractionPatched = true;
        }

        if (window.history && window.history.replaceState && !window.history.replaceState.__openCatsInteractionPatched) {
            var originalReplaceState = window.history.replaceState;
            window.history.replaceState = function () {
                var result = originalReplaceState.apply(window.history, arguments);
                logEvent('ui.route.change', {
                    trigger: 'replaceState',
                    url: redactURL(window.location.href)
                });
                return result;
            };
            window.history.replaceState.__openCatsInteractionPatched = true;
        }

        window.addEventListener('error', function (event) {
            logEvent('window.error', {
                message: truncateString(event.message || '', 400),
                filename: redactURL(event.filename || ''),
                line: event.lineno || 0,
                column: event.colno || 0
            });
        });

        window.addEventListener('unhandledrejection', function (event) {
            logEvent('window.unhandledrejection', {
                reason: getErrorMessage(event.reason)
            });
        });

        window.addEventListener('opencats:modern-shell', function (event) {
            logEvent('modern.shell', event && event.detail ? event.detail : {});
        });
    }

    window.OpenCATSInteractionLog = {
        version: '1.0.0',
        storageKey: STORAGE_KEY,
        getEntries: function (limit) {
            var data = entries.slice(0);
            if (typeof limit === 'number' && limit > 0 && data.length > limit) {
                return data.slice(data.length - limit);
            }
            return data;
        },
        clear: function () {
            entries = [];
            persistEntries();
            notifyListeners({
                kind: 'clear',
                count: 0
            });
        },
        add: function (type, details) {
            return logEvent(type, details);
        },
        onChange: function (handler) {
            if (typeof handler !== 'function') {
                return function () {};
            }
            listeners.push(handler);
            return function () {
                for (var i = 0; i < listeners.length; i++) {
                    if (listeners[i] === handler) {
                        listeners.splice(i, 1);
                        break;
                    }
                }
            };
        }
    };

    window.addEventListener('storage', function (event) {
        if (!event || event.key !== STORAGE_KEY) {
            return;
        }
        entries = loadEntries();
        notifyListeners({
            kind: 'sync',
            count: entries.length
        });
    });

    installFetchLogger();
    installXHRLogger();
    installInteractionListeners();

    logServerContextOnce();
    window.setTimeout(function () {
        logServerContextOnce();
    }, 0);
    window.setTimeout(function () {
        logServerContextOnce();
    }, 200);
    window.addEventListener('opencats:page-context', function (event) {
        if (event && event.detail) {
            logServerContextOnce(event.detail);
            return;
        }
        logServerContextOnce();
    });

    logEvent('ui.page.load', {
        title: truncateString(document.title || '', 180),
        referrer: redactURL(document.referrer || '')
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            logEvent('ui.page.ready', {
                title: truncateString(document.title || '', 180)
            });
        });
    } else {
        logEvent('ui.page.ready', {
            title: truncateString(document.title || '', 180)
        });
    }
})();
