<?php
/**
 * UI mode switcher for progressive frontend modernization.
 *
 * This class allows legacy and modern UI to coexist safely by deciding
 * per-request whether to render the modern shell or the legacy module.
 */
class UIModeSwitcher
{
    const SESSION_OVERRIDE_KEY = 'CATS_UI_MODE_OVERRIDE';

    /**
     * Captures explicit request override (ui=legacy|modern|auto) and stores
     * it in session for fast rollback/testing.
     */
    public static function captureRequestOverride()
    {
        if (!isset($_SESSION) || !is_array($_SESSION))
        {
            return;
        }

        if (!isset($_GET['ui']))
        {
            return;
        }

        $rawValue = strtolower(trim((string) $_GET['ui']));
        if ($rawValue === 'legacy' || $rawValue === 'modern')
        {
            $_SESSION[self::SESSION_OVERRIDE_KEY] = $rawValue;
            return;
        }

        if ($rawValue === 'auto' || $rawValue === '')
        {
            unset($_SESSION[self::SESSION_OVERRIDE_KEY]);
        }
    }

    /**
     * Returns true when the current request should render the modern shell.
     */
    public static function shouldUseModernUI($moduleName, $action)
    {
        if (!self::isEnabled())
        {
            return false;
        }

        if (self::isDataContractRequest())
        {
            return false;
        }

        if ($moduleName === '' || self::isExcludedRoute($moduleName, $action))
        {
            return false;
        }

        if (!self::isMethodAllowed() || !self::isAjaxAllowed())
        {
            return false;
        }

        if (!self::isUserInTargetCohort())
        {
            return false;
        }

        return (self::resolveMode($moduleName, $action) === 'modern');
    }

    /**
     * Renders the modern shell template. Returns false to allow safe fallback
     * to legacy rendering.
     */
    public static function renderModernShell($moduleName, $action)
    {
        $templatePath = './modules/modernui/Shell.tpl';
        if (!file_exists($templatePath))
        {
            self::logDecision('legacy-fallback', $moduleName, $action, 'missing-shell-template');
            return false;
        }

        $bootstrap = array(
            'targetModule'      => $moduleName,
            'targetAction'      => $action,
            'indexName'         => CATSUtility::getIndexName(),
            'requestURI'        => isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '',
            'siteID'            => (isset($_SESSION['CATS']) ? (int) $_SESSION['CATS']->getSiteID() : 0),
            'userID'            => (isset($_SESSION['CATS']) ? (int) $_SESSION['CATS']->getUserID() : 0),
            'fullName'          => (isset($_SESSION['CATS']) ? $_SESSION['CATS']->getFullName() : ''),
            'mode'              => 'modern',
            'legacyURL'         => self::buildCurrentURLWithMode('legacy'),
            'modernURL'         => self::buildCurrentURLWithMode('modern'),
            'resolvedBy'        => self::resolveReason($moduleName, $action),
            'timestampUTC'      => gmdate('c')
        );

        $template = new Template();
        $showShellChrome = self::getBooleanValue('UI_SWITCH_SHOW_SHELL_CHROME', 'OPENCATS_UI_SHOW_SHELL_CHROME', false);
        if (isset($_GET['ui_debug']) && trim((string) $_GET['ui_debug']) === '1')
        {
            $showShellChrome = true;
        }
        $template->assign('active', null);
        $template->assign('targetModule', $moduleName);
        $template->assign('targetAction', $action);
        $template->assign('legacyURL', self::buildCurrentURLWithMode('legacy'));
        $template->assign('modernURL', self::buildCurrentURLWithMode('modern'));
        $template->assign('bundleURL', self::resolveBundleURL());
        $template->assign('devServerURL', self::getStringValue('UI_SWITCH_MODERN_DEV_SERVER_URL', 'OPENCATS_UI_DEV_SERVER_URL', ''));
        $template->assign('clientLoggingEnabled', self::getBooleanValue('UI_SWITCH_CLIENT_LOGGING', 'OPENCATS_UI_CLIENT_LOGGING', true));
        $template->assign('autoLegacyFallbackSeconds', self::getIntegerValue('UI_SWITCH_CLIENT_AUTO_FALLBACK_SECONDS', 'OPENCATS_UI_CLIENT_AUTO_FALLBACK_SECONDS', 0));
        $template->assign('bootstrapPayload', base64_encode(json_encode($bootstrap)));
        $template->assign('showShellChrome', $showShellChrome);
        $template->display($templatePath);

        self::logDecision('modern', $moduleName, $action, $bootstrap['resolvedBy']);
        return true;
    }

    /**
     * Returns the currently resolved mode for route/module.
     */
    public static function resolveMode($moduleName, $action)
    {
        $override = self::getSessionOverrideMode();
        if ($override === 'legacy' || $override === 'modern')
        {
            if ($override === 'modern' &&
                self::getBooleanValue('UI_SWITCH_OVERRIDE_BYPASS_ROUTE_MAP', 'OPENCATS_UI_OVERRIDE_BYPASS_ROUTE_MAP', false))
            {
                return 'modern';
            }

            if ($override === 'modern' && !self::isRouteMapped($moduleName, $action) && self::requiresRouteMatch())
            {
                return 'legacy';
            }

            return $override;
        }

        $defaultMode = self::getDefaultMode();
        $isMappedRoute = self::isRouteMapped($moduleName, $action);

        if (self::requiresRouteMatch() && !$isMappedRoute)
        {
            return 'legacy';
        }

        if ($defaultMode === 'modern')
        {
            return 'modern';
        }

        if ($defaultMode === 'hybrid')
        {
            return ($isMappedRoute ? 'modern' : 'legacy');
        }

        return 'legacy';
    }

    private static function resolveReason($moduleName, $action)
    {
        $override = self::getSessionOverrideMode();
        if ($override === 'legacy' || $override === 'modern')
        {
            return 'session-override:' . $override;
        }

        if (self::requiresRouteMatch() && !self::isRouteMapped($moduleName, $action))
        {
            return 'route-not-mapped';
        }

        return 'default-mode:' . self::getDefaultMode();
    }

    private static function isEnabled()
    {
        return self::getBooleanValue('UI_SWITCH_ENABLED', 'OPENCATS_UI_SWITCH_ENABLED', false);
    }

    private static function getDefaultMode()
    {
        $mode = strtolower(self::getStringValue('UI_SWITCH_DEFAULT_MODE', 'OPENCATS_UI_MODE', 'legacy'));
        if ($mode !== 'legacy' && $mode !== 'modern' && $mode !== 'hybrid')
        {
            $mode = 'legacy';
        }

        return $mode;
    }

    private static function requiresRouteMatch()
    {
        return self::getBooleanValue('UI_SWITCH_REQUIRE_ROUTE_MATCH', 'OPENCATS_UI_REQUIRE_ROUTE_MATCH', true);
    }

    private static function isMethodAllowed()
    {
        if (self::getBooleanValue('UI_SWITCH_ALLOW_POST', 'OPENCATS_UI_ALLOW_POST', false))
        {
            return true;
        }

        $requestMethod = isset($_SERVER['REQUEST_METHOD']) ? strtoupper($_SERVER['REQUEST_METHOD']) : 'GET';
        return ($requestMethod === 'GET');
    }

    private static function isAjaxAllowed()
    {
        if (self::getBooleanValue('UI_SWITCH_ALLOW_AJAX', 'OPENCATS_UI_ALLOW_AJAX', false))
        {
            return true;
        }

        if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) &&
            strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest')
        {
            return false;
        }

        return true;
    }

    private static function isUserInTargetCohort()
    {
        $targetUserIDs = self::getIntegerListValue('UI_SWITCH_TARGET_USER_IDS', 'OPENCATS_UI_TARGET_USER_IDS');
        $targetAccessLevels = self::getIntegerListValue('UI_SWITCH_TARGET_ACCESS_LEVELS', 'OPENCATS_UI_TARGET_ACCESS_LEVELS');

        if (empty($targetUserIDs) && empty($targetAccessLevels))
        {
            return true;
        }

        if (!isset($_SESSION['CATS']))
        {
            return false;
        }

        $userID = (int) $_SESSION['CATS']->getUserID();
        if (!empty($targetUserIDs) && in_array($userID, $targetUserIDs, true))
        {
            return true;
        }

        if (!empty($targetAccessLevels))
        {
            $accessLevel = (int) $_SESSION['CATS']->getAccessLevel('');
            if (in_array($accessLevel, $targetAccessLevels, true))
            {
                return true;
            }
        }

        return false;
    }

    private static function isRouteMapped($moduleName, $action)
    {
        $map = self::getRouteMap();
        if (empty($map))
        {
            return false;
        }

        $moduleName = strtolower((string) $moduleName);
        $action = strtolower((string) $action);

        if (isset($map['*']) && self::isActionInList($map['*'], $action))
        {
            return true;
        }

        if (!isset($map[$moduleName]))
        {
            return false;
        }

        return self::isActionInList($map[$moduleName], $action);
    }

    private static function isActionInList($actionList, $action)
    {
        if (!is_array($actionList))
        {
            $actionList = array((string) $actionList);
        }

        foreach ($actionList as $candidateAction)
        {
            $candidateAction = strtolower(trim((string) $candidateAction));
            if ($candidateAction === '*' ||
                $candidateAction === $action ||
                ($candidateAction === '(default)' && $action === ''))
            {
                return true;
            }
        }

        return false;
    }

    private static function getRouteMap()
    {
        if (self::isPreviewAllRoutesEnabled())
        {
            return self::normalizeRouteMap(array(
                '*' => array('*')
            ));
        }

        $map = array();
        if (isset($GLOBALS['UI_SWITCH_ROUTE_MAP']) && is_array($GLOBALS['UI_SWITCH_ROUTE_MAP']))
        {
            $map = $GLOBALS['UI_SWITCH_ROUTE_MAP'];
        }

        $envMapRaw = getenv('OPENCATS_UI_ROUTE_MAP');
        if ($envMapRaw !== false && trim($envMapRaw) !== '')
        {
            $parsedMap = self::parseRouteMapString($envMapRaw);
            if (!empty($parsedMap))
            {
                $map = $parsedMap;
            }
        }

        return self::normalizeRouteMap($map);
    }

    private static function parseRouteMapString($rawMap)
    {
        $rawMap = trim((string) $rawMap);
        if ($rawMap === '')
        {
            return array();
        }

        $firstChar = substr($rawMap, 0, 1);
        if ($firstChar === '{')
        {
            $jsonMap = json_decode($rawMap, true);
            if (is_array($jsonMap))
            {
                return $jsonMap;
            }
        }

        /* Example format:
         * dashboard:my; candidates:show,search; reports:*
         */
        $map = array();
        $entries = explode(';', $rawMap);
        foreach ($entries as $entry)
        {
            $entry = trim($entry);
            if ($entry === '')
            {
                continue;
            }

            $pair = explode(':', $entry, 2);
            $module = strtolower(trim($pair[0]));
            if ($module === '')
            {
                continue;
            }

            $actionList = array('*');
            if (isset($pair[1]))
            {
                $actionList = array();
                $actions = explode(',', $pair[1]);
                foreach ($actions as $action)
                {
                    $action = strtolower(trim($action));
                    if ($action !== '')
                    {
                        $actionList[] = $action;
                    }
                }
                if (empty($actionList))
                {
                    $actionList[] = '*';
                }
            }

            $map[$module] = $actionList;
        }

        return $map;
    }

    private static function normalizeRouteMap($map)
    {
        $normalized = array();

        if (!is_array($map))
        {
            return $normalized;
        }

        foreach ($map as $module => $actions)
        {
            $module = strtolower(trim((string) $module));
            if ($module === '')
            {
                continue;
            }

            if (!is_array($actions))
            {
                $actions = array($actions);
            }

            $normalizedActions = array();
            foreach ($actions as $action)
            {
                $action = strtolower(trim((string) $action));
                if ($action !== '')
                {
                    $normalizedActions[] = $action;
                }
            }

            if (empty($normalizedActions))
            {
                $normalizedActions[] = '*';
            }

            $normalized[$module] = array_values(array_unique($normalizedActions));
        }

        return $normalized;
    }

    private static function isPreviewAllRoutesEnabled()
    {
        return self::getBooleanValue(
            'UI_SWITCH_PREVIEW_ALL_ROUTES',
            'OPENCATS_UI_PREVIEW_ALL_ROUTES',
            false
        );
    }

    private static function isExcludedRoute($moduleName, $action)
    {
        $moduleName = strtolower((string) $moduleName);
        $action = strtolower((string) $action);

        $excludedModules = array(
            'login',
            'logout',
            'install',
            'xml',
            'rss',
            'careers',
            'tests',
            'attachments',
            'export',
            'import',
            'queue',
            'toolbar',
            'graphs'
        );
        if (isset($GLOBALS['UI_SWITCH_EXCLUDE_MODULES']) && is_array($GLOBALS['UI_SWITCH_EXCLUDE_MODULES']))
        {
            $excludedModules = array_merge($excludedModules, $GLOBALS['UI_SWITCH_EXCLUDE_MODULES']);
        }

        foreach ($excludedModules as $excludedModule)
        {
            if ($moduleName === strtolower((string) $excludedModule))
            {
                return true;
            }
        }

        $excludedRoutes = array();
        if (isset($GLOBALS['UI_SWITCH_EXCLUDE_ROUTES']) && is_array($GLOBALS['UI_SWITCH_EXCLUDE_ROUTES']))
        {
            $excludedRoutes = $GLOBALS['UI_SWITCH_EXCLUDE_ROUTES'];
        }

        foreach ($excludedRoutes as $route)
        {
            $route = strtolower(trim((string) $route));
            if ($route === '')
            {
                continue;
            }
            $parts = explode('.', $route, 2);
            $excludedModule = $parts[0];
            $excludedAction = (isset($parts[1]) ? $parts[1] : '*');
            if ($excludedModule === $moduleName &&
                ($excludedAction === '*' || $excludedAction === $action))
            {
                return true;
            }
        }

        return false;
    }

    private static function isDataContractRequest()
    {
        if (!isset($_GET['format']))
        {
            return false;
        }

        $format = strtolower(trim((string) $_GET['format']));
        if ($format === 'json' ||
            $format === 'modern-json' ||
            strpos($format, 'modern-json') === 0 ||
            $format === 'api')
        {
            return true;
        }

        return false;
    }

    private static function resolveBundleURL()
    {
        $configuredURL = self::getStringValue('UI_SWITCH_MODERN_BUNDLE_URL', 'OPENCATS_UI_BUNDLE_URL', '');
        if ($configuredURL !== '')
        {
            $normalizedConfiguredURL = self::normalizeBundlePathForComparison($configuredURL);
            if ($normalizedConfiguredURL === 'public/modern-ui/app.bundle.js' &&
                file_exists('./public/modern-ui/build/app.bundle.js'))
            {
                $configuredURL = 'public/modern-ui/build/app.bundle.js';
            }

            return self::appendBundleCacheBuster($configuredURL);
        }

        if (self::getBooleanValue('UI_SWITCH_USE_MANIFEST', 'OPENCATS_UI_USE_MANIFEST', true))
        {
            $manifestPath = self::getStringValue(
                'UI_SWITCH_MANIFEST_PATH',
                'OPENCATS_UI_MANIFEST_PATH',
                './public/modern-ui/build/asset-manifest.json'
            );
            $manifestEntry = self::getStringValue(
                'UI_SWITCH_MANIFEST_ENTRY',
                'OPENCATS_UI_MANIFEST_ENTRY',
                'src/mount.tsx'
            );

            $resolvedFromManifest = self::resolveBundleURLFromManifest($manifestPath, $manifestEntry);
            if ($resolvedFromManifest !== '')
            {
                return self::appendBundleCacheBuster($resolvedFromManifest);
            }
        }

        return self::appendBundleCacheBuster('public/modern-ui/build/app.bundle.js');
    }

    private static function normalizeBundlePathForComparison($bundleURL)
    {
        $normalized = str_replace('\\', '/', trim((string) $bundleURL));
        if ($normalized === '')
        {
            return '';
        }

        $queryPos = strpos($normalized, '?');
        if ($queryPos !== false)
        {
            $normalized = substr($normalized, 0, $queryPos);
        }

        if (strpos($normalized, './') === 0)
        {
            $normalized = substr($normalized, 2);
        }

        return ltrim($normalized, '/');
    }

    private static function resolveBundleURLFromManifest($manifestPath, $manifestEntry)
    {
        $manifestPath = trim((string) $manifestPath);
        if ($manifestPath === '' || !file_exists($manifestPath))
        {
            return '';
        }

        $raw = @file_get_contents($manifestPath);
        if ($raw === false || trim($raw) === '')
        {
            return '';
        }

        $manifest = json_decode($raw, true);
        if (!is_array($manifest))
        {
            return '';
        }

        $compiledFile = '';
        if (isset($manifest['entries']) &&
            is_array($manifest['entries']) &&
            isset($manifest['entries'][$manifestEntry]))
        {
            $compiledFile = trim((string) $manifest['entries'][$manifestEntry]);
        }
        else if (isset($manifest[$manifestEntry]) &&
            is_array($manifest[$manifestEntry]) &&
            isset($manifest[$manifestEntry]['file']))
        {
            $compiledFile = trim((string) $manifest[$manifestEntry]['file']);
        }

        if ($compiledFile === '')
        {
            return '';
        }

        $compiledFile = str_replace('\\', '/', $compiledFile);
        $compiledFile = ltrim($compiledFile, '/');

        return 'public/modern-ui/build/' . $compiledFile;
    }

    private static function appendBundleCacheBuster($bundleURL)
    {
        if (!self::getBooleanValue('UI_SWITCH_BUST_CACHE', 'OPENCATS_UI_BUST_CACHE', true))
        {
            return $bundleURL;
        }

        $bundleURL = trim((string) $bundleURL);
        if ($bundleURL === '')
        {
            return $bundleURL;
        }

        if (strpos($bundleURL, '://') !== false)
        {
            return $bundleURL;
        }

        $relativePath = ltrim($bundleURL, '/');
        $queryPos = strpos($relativePath, '?');
        if ($queryPos !== false)
        {
            $relativePath = substr($relativePath, 0, $queryPos);
        }

        $localPath = './' . $relativePath;
        if (!file_exists($localPath))
        {
            return $bundleURL;
        }

        $mtime = @filemtime($localPath);
        if ($mtime === false || $mtime <= 0)
        {
            return $bundleURL;
        }

        $separator = (strpos($bundleURL, '?') !== false) ? '&' : '?';
        return $bundleURL . $separator . 'v=' . (int) $mtime;
    }

    private static function buildCurrentURLWithMode($mode)
    {
        $mode = strtolower((string) $mode);
        if ($mode !== 'legacy' && $mode !== 'modern')
        {
            $mode = 'legacy';
        }

        $query = $_GET;
        $query['ui'] = $mode;
        $queryString = http_build_query($query);

        return CATSUtility::getIndexName() . '?' . $queryString;
    }

    private static function getSessionOverrideMode()
    {
        if (!isset($_SESSION[self::SESSION_OVERRIDE_KEY]))
        {
            return '';
        }

        $value = strtolower(trim((string) $_SESSION[self::SESSION_OVERRIDE_KEY]));
        if ($value !== 'legacy' && $value !== 'modern')
        {
            return '';
        }

        return $value;
    }

    private static function getBooleanValue($configName, $envName, $defaultValue)
    {
        $envValue = getenv($envName);
        if ($envValue !== false)
        {
            return self::toBoolean($envValue, $defaultValue);
        }

        if (defined($configName))
        {
            return self::toBoolean(constant($configName), $defaultValue);
        }

        return $defaultValue;
    }

    private static function getIntegerValue($configName, $envName, $defaultValue)
    {
        $envValue = getenv($envName);
        if ($envValue !== false && trim((string) $envValue) !== '')
        {
            return (int) $envValue;
        }

        if (defined($configName))
        {
            return (int) constant($configName);
        }

        return (int) $defaultValue;
    }

    private static function getStringValue($configName, $envName, $defaultValue)
    {
        $envValue = getenv($envName);
        if ($envValue !== false)
        {
            return trim((string) $envValue);
        }

        if (defined($configName))
        {
            return trim((string) constant($configName));
        }

        return $defaultValue;
    }

    private static function getIntegerListValue($globalKey, $envName)
    {
        $values = array();

        if (isset($GLOBALS[$globalKey]) && is_array($GLOBALS[$globalKey]))
        {
            $values = $GLOBALS[$globalKey];
        }

        $envValue = getenv($envName);
        if ($envValue !== false && trim($envValue) !== '')
        {
            $values = explode(',', $envValue);
        }

        $normalized = array();
        foreach ($values as $value)
        {
            $value = trim((string) $value);
            if ($value === '')
            {
                continue;
            }
            $normalized[] = (int) $value;
        }

        return array_values(array_unique($normalized));
    }

    private static function toBoolean($value, $defaultValue)
    {
        if (is_bool($value))
        {
            return $value;
        }

        $value = strtolower(trim((string) $value));
        if ($value === '1' || $value === 'true' || $value === 'yes' || $value === 'on')
        {
            return true;
        }
        if ($value === '0' || $value === 'false' || $value === 'no' || $value === 'off')
        {
            return false;
        }

        return $defaultValue;
    }

    private static function logDecision($mode, $moduleName, $action, $reason)
    {
        if (!self::getBooleanValue('UI_SWITCH_LOGGING', 'OPENCATS_UI_SWITCH_LOGGING', true))
        {
            return;
        }

        $userID = 0;
        if (isset($_SESSION['CATS']))
        {
            $userID = (int) $_SESSION['CATS']->getUserID();
        }

        $message = sprintf(
            '[ui-switch] mode=%s module=%s action=%s userID=%d reason=%s uri=%s',
            $mode,
            $moduleName,
            $action,
            $userID,
            $reason,
            (isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '')
        );
        error_log($message);
    }
}
