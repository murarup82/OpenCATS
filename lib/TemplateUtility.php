<?php
/**
 * CATS
 * Template Utility Library
 *
 * Copyright (C) 2005 - 2007 Cognizo Technologies, Inc.
 *
 *
 * The contents of this file are subject to the CATS Public License
 * Version 1.1a (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.catsone.com/.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See the
 * License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is "CATS Standard Edition".
 *
 * The Initial Developer of the Original Code is Cognizo Technologies, Inc.
 * Portions created by the Initial Developer are Copyright (C) 2005 - 2007
 * (or from the year in which this file was created to the year 2007) by
 * Cognizo Technologies, Inc. All Rights Reserved.
 *
 * In the interest of readability and performance, this file is not wrapped
 * at 80 characters per line, as it contains quite a bit of long HTML strings.
 * Lines should, however, be wrapped at around 120 characters per line to
 * ensure readability on a 1280 x 1024 resolution monitor.
 *
 *
 * @package    CATS
 * @subpackage Library
 * @copyright  Copyright (C) 2005 - 2007 Cognizo Technologies, Inc.
 * @version    $Id: TemplateUtility.php 3835 2007-12-12 19:08:38Z brian $
 */

include_once('./vendor/autoload.php');
include_once(LEGACY_ROOT . '/lib/Candidates.php');
include_once(LEGACY_ROOT . '/lib/DateUtility.php');
include_once(LEGACY_ROOT . '/lib/SystemInfo.php');
include_once(LEGACY_ROOT . '/lib/RolePagePermissions.php');
include_once(LEGACY_ROOT . '/lib/CandidateMessages.php');
include_once(LEGACY_ROOT . '/lib/JobOrderMessages.php');
include_once(LEGACY_ROOT . '/lib/FeedbackSettings.php');

use OpenCATS\UI\QuickActionMenu;

/**
 *	Template Utility Library
 *	@package    CATS
 *	@subpackage Library
 */
class TemplateUtility
{
    private static $_isModalWindow = false;

    /* Prevent this class from being instantiated. */
    private function __construct() {}
    private function __clone() {}


    /**
     * Prints the template header HTML for a non-modal window.
     *
     * @param string page title
     * @param array JavaScript / CSS files to load
     * @return void
     */
    public static function printHeader($pageTitle, $headIncludes = array())
    {
        self::$_isModalWindow = false;
        self::_printCommonHeader($pageTitle, $headIncludes);
        $bodyClass = self::isUI2Enabled() ? ' class="ui2-body ui2-sidebar-enabled"' : ' class="ui2-body"';
        echo '<body', $bodyClass, ' style="background: #fff">', "\n";
        self::_printQuickActionMenuHolder();
        self::printPopupContainer();
    }

    /**
     * Prints the template header HTML for a modal window.
     *
     * @param string page title
     * @param array JavaScript / CSS files to load
     * @return void
     */
    public static function printModalHeader($pageTitle, $headIncludes = array(), $title = '')
    {
        self::$_isModalWindow = true;
        self::_printCommonHeader($pageTitle, $headIncludes);
        echo '<body class="ui2-body" style="background: #eee;">', "\n";
        if ($title != '')
        {
            $title = str_replace('\'', '\\\'', $title);
            echo '<script type="text/javascript">parentSetPopTitle(\''.$title.'\');</script>';
        }
        self::_printQuickActionMenuHolder();
    }

    /**
     * Prints logo and "top-right" header HTML.
     *
     * @return void
     */
    public static function printHeaderBlock($showTopRight = true)
    {
        if (self::isUI2Enabled())
        {
            return;
        }

        $username     = $_SESSION['CATS']->getUsername();
        $siteName     = $_SESSION['CATS']->getSiteName();
        $fullName     = $_SESSION['CATS']->getFullName();
        $indexName    = CATSUtility::getIndexName();

        echo '<div id="headerBlock">', "\n";

        /* CATS Logo */
        echo '<table cellspacing="0" cellpadding="0" style="margin: 0px; padding: 0px; float: left;">', "\n";
        echo '<tr>', "\n";
        echo '<td rowspan="2"><img src="images/applicationLogo.jpg" border="0" alt="CATS Applicant Tracking System" /></td>', "\n";
        echo '</tr>', "\n";
        echo '</table>', "\n";

        if (!eval(Hooks::get('TEMPLATE_LIVE_CHAT'))) return;

        if (!eval(Hooks::get('TEMPLATE_LOGIN_INFO_PRE_TOP_RIGHT'))) return;

        if ($showTopRight)
        {
            // FIXME: Use common functions.
            // FIXME: Isn't the UNIX-name stuff ASP specific? Hook?
            if (strpos($username, '@'.$_SESSION['CATS']->getSiteID()) !== false &&
                substr($username, strpos($username, '@'.$_SESSION['CATS']->getSiteID())) ==
                '@'.$_SESSION['CATS']->getSiteID() )
            {
               $username = str_replace('@'.$_SESSION['CATS']->getSiteID(), '', $username);
            }

            if (!eval(Hooks::get('TEMPLATE_LOGIN_INFO_TOP_RIGHT_1'))) return;

            /* Top Right Corner */
            echo '<div id="topRight">', "\n";

            echo '<div style="padding-bottom: 8px;">';
            // Begin top-right action block
            if (!eval(Hooks::get('TEMPLATE_LOGIN_INFO_TOP_RIGHT_UPGRADE'))) return;

            if (LicenseUtility::isProfessional() &&
                $_SESSION['CATS']->getAccessLevel(ACL::SECOBJ_ROOT) >= ACCESS_LEVEL_SA)
            {
                if (abs(LicenseUtility::getExpirationDate() - time()) < 60*60*24*30)
                {
                    $daysLeft = abs(LicenseUtility::getExpirationDate() - time())/60/60/24;
                    echo '<a href="http://www.catsone.com/professional" target="_blank">';
                    echo '<img src="images/tabs/small_upgrade.jpg" border="0" /> ';
                    echo 'License expires in ' . number_format($daysLeft, 0) . ' days, Renew?</a>&nbsp;&nbsp;&nbsp;&nbsp;', "\n";
                }
                else
                {
                    echo '<a href="http://www.opencats.org" target="_blank">';
                    echo '<img src="images/tabs/small_upgrade.jpg" border="0" /> ';
                    echo 'OpenCATS.org</a>&nbsp;&nbsp;&nbsp;&nbsp;', "\n";
                }
            }

            echo '<a href="', $indexName, '?m=logout">';
            echo '<img src="images/tabs/small_logout.jpg" border="0" /> ';
            echo 'Logout</a>', "\n";
            echo '</div>', "\n";
            // End top-right action block

            if (!eval(Hooks::get('TEMPLATE_LOGIN_INFO_EXTENDED_SITE_NAME'))) return;

            echo '<span>', $fullName, '&nbsp;&lt;', $username, '&gt;&nbsp;(', $siteName, ')</span>', "\n";

            if ($_SESSION['CATS']->getAccessLevel(ACL::SECOBJ_ROOT) >= ACCESS_LEVEL_SA)
            {
                echo '&nbsp;<span style="font-weight:bold;">Administrator</span>', "\n";
            }

            echo '<br />';

            $systemInfo = new SystemInfo();
            $systemInfoData = $systemInfo->getSystemInfo();

            if (isset($systemInfoData['available_version']) &&
                $systemInfoData['available_version'] > CATSUtility::getVersionAsInteger() &&
                isset($systemInfoData['disable_version_check']) &&
                !$systemInfoData['disable_version_check'] &&
                $_SESSION['CATS']->getAccessLevel(ACL::SECOBJ_ROOT) >= ACCESS_LEVEL_SA)
            {
                echo '<a href="http://www.catsone.com/download.php" target="catsdl">A new CATS version is available!</a><br />';
            }

            /* Disabled notice */
            if (!$_SESSION['CATS']->accountActive())
            {
                echo '<span style="font-weight:bold;">Account Inactive</span><br />', "\n";
            }
            else if ($_SESSION['CATS']->getAccessLevel(ACL::SECOBJ_ROOT) == ACCESS_LEVEL_READ)
            {
                echo '<span>Read Only Access</span><br />', "\n";
            }
            else
            {
                if (!eval(Hooks::get('TEMPLATE_LOGIN_INFO_TOP_RIGHT_2_ELSE'))) return;
            }

            echo '</div>', "\n";
        }

        echo '</div>', "\n";
    }

    /**
     * Determines if UI2 should be enabled for the current request/module.
     *
     * @param string|null $module
     * @param string|null $action
     * @return bool
     */
    public static function isUI2Enabled($module = null, $action = null)
    {
        if ($module === null)
        {
            $module = isset($_REQUEST['m']) ? $_REQUEST['m'] : '';
        }

        if ($action === null)
        {
            $action = isset($_REQUEST['a']) ? $_REQUEST['a'] : '';
        }

        if (defined('UI2_ENABLED'))
        {
            $enabled = UI2_ENABLED;
        }
        else
        {
            $enabled = self::_getDefaultUI2Enabled();
        }

        if ($enabled === true)
        {
            return true;
        }

        if ($enabled === false || $module === '')
        {
            return false;
        }

        if (is_array($enabled))
        {
            if (!isset($enabled[$module]))
            {
                return false;
            }

            if ($enabled[$module] === true)
            {
                return true;
            }

            if (is_array($enabled[$module]) && $action !== '')
            {
                return in_array($action, $enabled[$module], true);
            }
        }

        return false;
    }

    /**
     * Returns the UI2 wrapper class attribute for template usage.
     *
     * @return string
     */
    public static function getUI2WrapperAttribute()
    {
        if (!self::isUI2Enabled())
        {
            return '';
        }

        return ' class="ui2 ui2-theme-avel ui2-page ui2-page-header-auto"';
    }

    private static function _getDefaultUI2Enabled()
    {
        return true;
    }

    /**
     * Prints the time zone selection dropdown list.
     *
     * @param integer ID and name attributes of the time zone select input
     * @param string style attribute of the time zone select input
     * @param string class attribute of the time zone select input
     * @param integer selected GMT offset
     * @return void
     */
    public static function printTimeZoneSelect($selectID, $selectStyle,
        $selectClass, $selectedTimeZone)
    {
        echo '<select id="', $selectID, '" name="', $selectID, '"';

        if (!empty($selectClass))
        {
            echo ' class="', $selectClass, '"';
        }

        if (!empty($selectStyle))
        {
            echo ' style="', $selectStyle, '"';
        }

        echo '>';

        $currentTimeZone = '';

        foreach ($GLOBALS['timeZones'] as $timeZone)
        {
            echo '<option value="', $timeZone[0], '"';

            if ($timeZone[0] !== $currentTimeZone)
            {
                $currentTimeZone = $timeZone[0];
                if ($timeZone[0] == $selectedTimeZone)
                {
                    echo ' selected="selected"';
                }
            }

            echo '>', htmlspecialchars($timeZone[1]), '</option>';
        }

        echo '</select>';
    }

    /**
     * Prints the Quick Search box and MRU list.
     *
     * @return void
     */
    public static function printQuickSearch($wildCardString = '')
    {
        $isUI2 = self::isUI2Enabled();
        $module = isset($_GET['m']) ? $_GET['m'] : '';
        $action = isset($_GET['a']) ? $_GET['a'] : '';
        $isQuickSearchPage = ($module === 'home' && $action === 'quickSearch');

        if ($isUI2 && !$isQuickSearchPage)
        {
            return;
        }

        /* Get the formatted MRU list from Session. */
        $MRU = $isUI2 ? '' : $_SESSION['CATS']->getMRU()->getFormatted();
        $indexName = CATSUtility::getIndexName();

        /* MRU List */
        if (!$isUI2)
        {
            echo '<div id="MRUPanel">', "\n";
            echo '<div id="MRUBlock">', "\n";

            if (!empty($MRU))
            {
                echo '<span class="MRUTitle">Recent:&nbsp;</span>&nbsp;', $MRU, "\n";
            }
            else
            {
                echo '<span class="MRUTitle"></span>&nbsp;', "\n";
            }

            echo '</div>', "\n\n";
        }

        /* Quick Search */
        echo '<form id="quickSearchForm" action="', $indexName,
             '" method="get" onsubmit="return checkQuickSearchForm(document.quickSearchForm);">', "\n";
        echo '<div id="quickSearchBlock">', "\n";

        //FIXME:  Abstract into a hook.
        if ($_SESSION['CATS']->hasUserCategory('msa'))
        {
            echo '<input type="hidden" name="m" value="asp" />', "\n";
            echo '<input type="hidden" name="a" value="aspSearch" />', "\n";
            echo '<span class="quickSearchLabel" id="quickSearchLabel">ASP Search:</span>&nbsp;', "\n";
        }
        else
        {
            echo '<input type="hidden" name="m" value="home" />', "\n";
            echo '<input type="hidden" name="a" value="quickSearch" />', "\n";
            echo '<span class="quickSearchLabel" id="quickSearchLabel">Quick Search:</span>&nbsp;', "\n";
        }

        echo '<input name="quickSearchFor" id="quickSearchFor" class="quickSearchBox" value="',
             $wildCardString, '" />&nbsp;', "\n";
        echo '<input type="submit" name="quickSearch" class="button" value="Go" />&nbsp;', "\n";
        echo '</div>', "\n";
        echo '</form>', "\n";
        echo '</div>', "\n";
    }

    /**
     * Prints a module-scoped Recent dropdown (MRU) for UI2 headers.
     *
     * @param string $module
     * @param integer $limit
     * @param string $label
     * @return void
     */
    public static function printRecentDropdown($module, $limit = 7, $label = 'Recent')
    {
        $entries = $_SESSION['CATS']->getMRU()->getEntries();
        $filtered = array();
        $moduleToken = '?m=' . $module;
        $moduleTokenAlt = '&amp;m=' . $module;

        foreach ($entries as $entry)
        {
            if (strpos($entry['URL'], $moduleToken) !== false ||
                strpos($entry['URL'], $moduleTokenAlt) !== false)
            {
                $filtered[] = $entry;
                if (count($filtered) >= $limit)
                {
                    break;
                }
            }
        }

        $safeModule = htmlspecialchars($module, ENT_QUOTES);
        $safeLabel = htmlspecialchars($label, ENT_QUOTES);

        echo '<details class="ui2-recent" id="ui2-recent-', $safeModule, '">', "\n";
        echo '    <summary class="ui2-button ui2-button--secondary ui2-recent-toggle">', $safeLabel,
             '<span class="ui2-recent-caret">v</span></summary>', "\n";
        echo '    <div class="ui2-recent-menu">', "\n";

        if (empty($filtered))
        {
            echo '        <div class="ui2-recent-empty">No recent items</div>', "\n";
        }
        else
        {
            echo '        <ul class="ui2-recent-list">', "\n";
            foreach ($filtered as $entry)
            {
                echo '            <li><a href="', $entry['URL'], '">',
                     htmlspecialchars($entry['dataItemText'], ENT_QUOTES),
                     '</a></li>', "\n";
            }
            echo '        </ul>', "\n";
        }

        echo '    </div>', "\n";
        echo '</details>', "\n";
    }

    /**
     * Prints Advanced Search for search pages.
     *
     * @return void
     */
    public static function printAdvancedSearch($considerFields)
    {
        echo '<input type="button" class="button" name="advancedSearch" id="advancedSearch" value="Advanced"',
             ' onclick="document.getElementById(\'advancedSearchField\').style.display=\'block\'; ',
             'advancedSearchReset();" style="display:none;">', "\n";
        echo '<input type="hidden" id="advancedSearchParser" name="advancedSearchParser" value="">', "\n";

        if (isset($_GET['advancedSearchOn']) && isset($_GET['advancedSearchParser']) &&
            $_GET['advancedSearchOn'] != 0 && !empty($_GET['advancedSearchParser']))
        {
            /* Output an active advanced search. */
            echo '<input type="hidden" id="advancedSearchOn" name="advancedSearchOn" value="',
                  $_GET['advancedSearchOn'], '" />', "\n";
            echo '<span id="advancedSearchField" style="display:block;">', "\n";
            echo '</span>', "\n";

            echo '<script type="text/javascript">', "\n";
            echo '    data = [];', "\n";
            echo '    nodes = [];', "\n";

            $stuff = explode('{[+', $_GET['advancedSearchParser']);
            for ($i = 0; $i < sizeof($stuff); $i++)
            {
                $innerStuff = explode('[|]', $stuff[$i]);

                echo '    data[',  $i, '] = "', $innerStuff[0], '";', "\n";
                echo '    nodes[', $i, '] = "', $innerStuff[1], '";', "\n";
            }
            echo '    data[', sizeof($stuff), '] = "";', "\n";
            echo '    advancedSearchDraw();', "\n";
            echo '</script>', "\n";
        }
        else
        {
            /* Output basic framework to start an advanced search; no search visible. */
            echo '<input type="hidden" id="advancedSearchOn" name="advancedSearchOn" value="0">', "\n";
            echo '<span id="advancedSearchField" style="display:none;">', "\n";
            echo '</span>', "\n";
        }

        /* Tell the script what fields have access to advanced search. */
        if (!empty($considerFields))
        {
            $considerFieldsArray = explode(',', $considerFields);

            echo '<script type="text/javascript">';
            echo '    advancedValidFields = ["', implode('","', $considerFieldsArray), '"];';
            echo '    advancedSearchConsider();';
            echo '</script>';
        }
    }

    /**
     * Prints the HTML for a saved search from a response array.
     *
     * @param response array
     * @return void
     */
    public static function printSavedSearch($savedSearchRS)
    {
        $savedSearchRecent = array();
        $savedSearchSaved = array();

        foreach ($savedSearchRS as $savedSearchRow)
        {
            if ($savedSearchRow['isCustom'] == 1)
            {
                $savedSearchSaved[] = $savedSearchRow;
            }
            else
            {
                $savedSearchRecent[] = $savedSearchRow;
            }
        }

        $currentUrlGET = array();
        foreach ($_GET as $key => $value)
        {
            if ($key != 'savedSearchID')
            {
                $currentUrlGET[] = $key . '=' . urlencode($value);
            }
        }

        $currentUrlGETString = urlencode(implode('&', $currentUrlGET));
        $indexName = CATSUtility::getIndexName();

        echo '<div class="recentSearchResults">';
        echo '<table style="vertical-align: top; border-collapse: collapse;"><tr style="vertical-align: top;"><td>';

        echo 'Recent Searches&nbsp;&nbsp;';
        echo '<img title="To save a recent search, press the + button below."',
             ' src="images/information.gif" alt="" width="16" height="16" />';

        echo '<div id="searchRecent" class="recentSearchResultsHidden">';

        /* Recent Search Results */
        if (count($savedSearchRecent) == 0)
        {
           echo '(None)';
        }
        else
        {
            foreach ($savedSearchRecent as $savedSearchRow)
            {
                if (strlen($savedSearchRow['dataItemText']) > 35)
                {
                    $savedSearchRow['dataItemText'] = substr($savedSearchRow['dataItemText'], 0, 35) . '...';
                }

                if (count($savedSearchSaved) >= RECENT_SEARCH_MAX_ITEMS)
                {
                    echo '<a href="javascript:void(0);" onclick="alert(\'The maximum amount of saved searches is ',
                         RECENT_SEARCH_MAX_ITEMS, '. To save this search, delete another saved search.\');">';
                }
                else
                {
                    echo '<a href="', $indexName, '?m=home&amp;a=addSavedSearch&amp;searchID=',
                         $savedSearchRow['searchID'], '&amp;currentURL=', $currentUrlGETString, '">';
                }

                echo '<img src="images/actions/add_small.gif" alt="" style="border: none;" title="Save This Search" /></a>&nbsp;', "\n";

                $escapedURL  = htmlspecialchars($savedSearchRow['URL']);

                /* Remove leading slashes. */
                while (substr($escapedURL, 0, 1) == '/')
                {
                    $escapedURL = substr($escapedURL, 1);
                }
                $escapedURL = '/'.$escapedURL;


                $escapedText = htmlspecialchars($savedSearchRow['dataItemText']);

                echo '<a href="', $escapedURL,
                     '" onclick="gotoSearch(\'', $escapedText, "', '", $escapedURL, '\');"',
                     ' onmouseover="this.className += \'recentSearchResultsHighlight\';" ',
                     ' onmouseout="this.className = this.className.replace(\'recentSearchResultsHighlight\', \'\');">',
                     $escapedText, '</a>', '<br />', "\n";
            }
        }

        echo '</div>';
        echo '</td><td>&nbsp;</td><td>';

        echo 'Saved Searches&nbsp;&nbsp;';
        echo '<img title="To delete a recent search, press the - button."',
             ' src="images/information.gif" alt="" width="16" height="16" />';

        echo '<div id="searchSaved" class="savedSearchResultsHidden">';

        /* Saved Search Results */
        if (count($savedSearchSaved) == 0)
        {
           echo '(None)';
        }
        else
        {
            foreach ($savedSearchSaved as $savedSearchRow)
            {
                if (strlen($savedSearchRow['dataItemText']) > 35)
                {
                    $savedSearchRow['dataItemText'] = substr($savedSearchRow['dataItemText'], 0, 35) . '...';
                }

                $escapedURL  = htmlspecialchars($savedSearchRow['URL']);
                $escapedText = htmlspecialchars($savedSearchRow['dataItemText']);

                /* Remove leading slashes. */
                while (substr($escapedURL, 0, 1) == '/')
                {
                    $escapedURL = substr($escapedURL, 1);
                }
                $escapedURL = '/'.$escapedURL;

                echo '<a href="', $indexName, '?m=home&amp;a=deleteSavedSearch&amp;searchID=',
                     $savedSearchRow['searchID'], '&currentURL=', $currentUrlGETString, '">',
                     '<img src="images/actions/delete_small.gif" style="border: none;" title="Delete This Search" /></a>&nbsp;';

                echo '<a href="', $escapedURL, '&amp;savedSearchID=', $savedSearchRow['searchID'],
                     '" onclick="gotoSearch(\'', $escapedText, "', '", $escapedURL,
                     '&amp;savedSearchID=', $savedSearchRow['searchID'], '\');"',
                     ' onmouseover="this.className += \'recentSearchResultsHighlight\';" ',
                     ' onmouseout="this.className = this.className.replace(\'recentSearchResultsHighlight\', \'\');">',
                     $escapedText,'</a><br />', "\n";
            }
        }

        echo '</div>', "\n";

        echo '</td></tr></table></div>';
        echo '<br /><br />';
        echo '<script type="text/javascript">syncRowHeightsSaved();</script>';
    }

    /**
     * Outputs a tester which checks if cookies are enabled in the user's
     * browser.
     *
     * @return void
     */
    public static function printCookieTester()
    {
        $indexName = CATSUtility::getIndexName();

        echo '<script type="text/javascript">
            if (navigator.cookieEnabled)
            {
                var cookieEnabled = true;
            }
            else
            {
                var cookieEnabled = false;
            }

            if (typeof(navigator.cookieEnabled) == "undefined" && !cookieEnabled)
            {
                document.cookie = \'testcookie\';
                cookieEnabled = (document.cookie.indexOf(\'testcookie\') != -1) ? true : false;
            }

            if (!cookieEnabled)
            {
                showPopWin(\'' . $indexName . '?m=login&amp;a=noCookiesModal\', 400, 225, null);
            }
            </script>';
    }

    /**
     * Outputs a popup container for use with JavaScript based popups like
     * ListEditor.js and other subModal.js-based dialogs.
     *
     * @return void
     */
    public static function printPopupContainer()
    {
        echo '<div id="popupMask">&nbsp;</div><div id="popupContainer">',
             '<div id="popupInner"><div id="popupTitleBar">',
             '<div id="popupTitle"></div><div id="popupControls">',
             '<img src="js/submodal/close.gif" alt="X" width="16" height="16"',
             ' onclick="hidePopWin(false);" /></div></div>';

        echo '<div style="width: 100%; height: 100%; background-color:',
             ' transparent; display: none;" id="popupFrameDiv"></div>';

        echo '<iframe src="js/submodal/loading.html" style="width: 100%; height: 100%;',
             ' background-color: transparent; display: none;" scrolling="auto"',
             ' frameborder="0" allowtransparency="true" id="popupFrameIFrame"',
             ' width="100%" height="100%"></iframe>';

        echo '</div></div>';
    }

    /**
     * Prints the module tabs.
     *
     * @param UserInterface active module interface
     * @param string active subtab name
     * @param string module name to forcibly highlight
     * @return void
     */
    public static function printTabs($active, $subActive = '', $forceHighlight = '')
    {
        if (self::isUI2Enabled())
        {
            self::_printSidebarNavigation($active, $forceHighlight);
            return;
        }

        /* Special tab behaviors:
         *
         * Tab text = 'something*al=somenumber' where somenumber is an access level -
         *      Only display tab if current user userlevel >= somenumber.
         * Tab text = 'something*al=somenumber@somesecuredobject' where somenumber is an access level and somesecuredobject is secured objec name -
         *      Only display tab if current user userlevel_for_securedobject >= somenumber.
         *
         * Subtab url = 'url*al=somenumber' where somenumber is an access level -
         *      Only display subtab if current user userlevel >= somenumber.
         * Subtab url = 'url*al=somenumber@somesecuredobject' where somenumber is an access level and somesecuredobject is secured objec name -
         *      Only display subtab if current user userlevel_for_securedobject >= somenumber.
         *
         * Subtab url = 'url*js=javascript code' where javascript code is JS commands -
         *      JS code to execute for button OnClick event.
         */

         /* FIXME:  There is too much logic going on here, there should be something that loads settings or evaluates what tabs
                    shouldn't be drawn. */

        echo '<div id="header">', "\n";
        echo '<ul id="primary">', "\n";

        $indexName = CATSUtility::getIndexName();
        $rolePagePermissions = null;
        $currentUserID = 0;
        $currentAccessLevel = ACCESS_LEVEL_DISABLED;
        if (isset($_SESSION['CATS']) && $_SESSION['CATS']->isLoggedIn())
        {
            $rolePagePermissions = new RolePagePermissions($_SESSION['CATS']->getSiteID());
            if (!$rolePagePermissions->isSchemaAvailable())
            {
                $rolePagePermissions = null;
            }
            else
            {
                $currentUserID = (int) $_SESSION['CATS']->getUserID();
                if (method_exists($_SESSION['CATS'], 'getBaseAccessLevel'))
                {
                    $currentAccessLevel = (int) $_SESSION['CATS']->getBaseAccessLevel();
                }
                else
                {
                    $currentAccessLevel = (int) $_SESSION['CATS']->getAccessLevel('');
                }
            }
        }

        $modules = ModuleUtility::getModules();
        foreach ($modules as $moduleName => $parameters)
        {
            $tabText = $parameters[1];

            /* Don't display a module's tab if $tabText is empty. */
            if (empty($tabText))
            {
                continue;
            }

            /* If name = Companies and HR mode is on, change tab name to My Company. */
            if ($_SESSION['CATS']->isHrMode() && $tabText == 'Companies')
            {
                $tabText = 'My Company';
            }

            /* Allow a hook to prevent a module from being displayed. */
            $displayTab = true;

            if (!eval(Hooks::get('TEMPLATE_UTILITY_EVALUATE_TAB_VISIBLE'))) return;

            if (!$displayTab)
            {
                continue;
            }

            if ($rolePagePermissions !== null)
            {
                $pageKey = RolePagePermissions::mapRequestToPageKey($moduleName, '');
                if (!$rolePagePermissions->isPageAllowedForUser($currentUserID, $pageKey, $currentAccessLevel))
                {
                    continue;
                }
            }

            /* Inactive Tab? */
            if ($active === null || $moduleName != $active->getModuleName())
            {
                if ($moduleName == $forceHighlight)
                {
                    $className = 'active';
                }
                else
                {
                    $className = 'inactive';
                }

                $alPosition = strpos($tabText, "*al=");
                if ($alPosition === false)
                {
                    echo '<li><a class="', $className, '" href="', $indexName,
                         '?m=', $moduleName, '">', $tabText, '</a></li>', "\n";
                }
                else
                {
                     $al = substr($tabText, $alPosition + 4);
                     $soPosition = strpos($al, "@");
                     $soName = '';
                     if( $soPosition !== false )		
                     {		
                         $soName = substr($al, $soPosition + 1);		
                         $al = substr($al, 0, $soPosition);		
                     }		
                     if ($_SESSION['CATS']->getAccessLevel($soName) >= $al ||
                         $_SESSION['CATS']->isDemo())
                     {
                        echo '<li><a class="', $className, '" href="', $indexName, '?m=', $moduleName, '">',
                             substr($tabText, 0, $alPosition), '</a></li>', "\n";
                    }
                }

                continue;
            }

            $alPosition = strpos($tabText, "*al=");
            if ($alPosition !== false)
            {
                $tabText = substr($tabText, 0, $alPosition);
            }

            /* Start the <li> block for the active tab. The secondary <ul>
             * for subtabs MUST be contained within this block. It is
             * closed after subtabs are printed. */
            echo '<li>';

            echo '<a class="active" href="', $indexName, '?m=', $moduleName,
                 '">', $tabText, '</a>', "\n";

            $subTabs = $active->getSubTabs($modules);
            if ($subTabs)
            {
                echo '<ul id="secondary">';

                foreach ($subTabs as $subTabText => $link)
                {
                    if ($subTabText == $subActive)
                    {
                        $style = "color:#cccccc;";
                    }
                    else
                    {
                        $style = "";
                    }

                    /* Check HR mode for displaying tab. */
                    $hrmodePosition = strpos($link, "*hrmode=");
                    if ($hrmodePosition !== false)
                    {
                        /* Access level restricted subtab. */
                        $hrmode = substr($link, $hrmodePosition + 8);
                        if ((!$_SESSION['CATS']->isHrMode() && $hrmode == 0) ||
                            ($_SESSION['CATS']->isHrMode() && $hrmode == 1))
                        {
                            $link =  substr($link, 0, $hrmodePosition);
                        }
                        else
                        {
                            $link = '';
                        }
                    }

                    /* Check access level for displaying tab. */
                    $alPosition = strpos($link, "*al=");
                    if ($alPosition !== false)
                    {
                        /* Access level restricted subtab. */
                        $al = substr($link, $alPosition + 4);
                        $soPosition = strpos($al, "@");
                        $soName = '';
                        if( $soPosition !== false )		
                        {		
                            $soName = substr($al, $soPosition + 1);		
                            $al = substr($al, 0, $soPosition);		
                        }		
                        if ($_SESSION['CATS']->getAccessLevel($soName) >= $al ||
                            $_SESSION['CATS']->isDemo())
                        {
                            $link =  substr($link, 0, $alPosition);
                        }
                        else
                        {
                            $link = '';
                        }
                    }

                    $jsPosition = strpos($link, "*js=");
                    if ($jsPosition !== false)
                    {
                        /* Javascript subtab. */
                        echo '<li><a href="', substr($link, 0, $jsPosition), '" onclick="',
                             substr($link, $jsPosition + 4), '" style="'.$style.'">', $subTabText, '</a></li>', "\n";
                    }

                    /* A few subtabs have special logic to decide if they display or not. */
                    /* FIXME:  Put the logic for these somewhere else.  Perhaps the definitions of the subtabs
                               themselves should have an eval()uatable rule?
                               Brian 6-14-07:  Second.  */
                    else if (strpos($link, 'a=internalPostings') !== false)
                    {
                        /* Default company subtab. */
                        include_once(LEGACY_ROOT . '/lib/Companies.php');

                        $companies = new Companies($_SESSION['CATS']->getSiteID());
                        $defaultCompanyID = $companies->getDefaultCompany();
                        if ($defaultCompanyID !== false)
                        {
                            echo '<li><a href="', $link, '" style="'.$style.'">', $subTabText, '</a></li>', "\n";
                        }
                    }
                    else if (strpos($link, 'a=administration') !== false)
                    {
                        /* Administration subtab. */
                        if ($_SESSION['CATS']->getAccessLevel('settings.administration') >= ACCESS_LEVEL_DEMO)
                        {
                            echo '<li><a href="', $link, '" style="'.$style.'">', $subTabText, '</a></li>', "\n";
                        }
                    }
                    else if (strpos($link, 'a=customizeEEOReport') !== false)
                    {
                        /* EEO Report subtab.  Shouldn't be visible if EEO tracking is disabled. */
                        $EEOSettings = new EEOSettings($_SESSION['CATS']->getSiteID());
                        $EEOSettingsRS = $EEOSettings->getAll();

                        if ($EEOSettingsRS['enabled'] == 1)
                        {
                            echo '<li><a href="', $link, '" style="'.$style.'">', $subTabText, '</a></li>', "\n";
                        }
                    }


                    /* Tab is ok to draw. */
                    else if ($link != '')
                    {
                        /* Normal subtab. */
                        echo '<li><a href="', $link, '" style="'.$style.'">', $subTabText, '</a></li>', "\n";
                    }
                }

                if (!eval(Hooks::get('TEMPLATE_UTILITY_DRAW_SUBTABS'))) return;

                echo '</ul>';
            }

            echo '</li>';
        }
        echo '</ul>', "\n";
        echo '</div>', "\n";

        if (self::isUI2Enabled())
        {
            self::_printSidebarNavigation($active, $forceHighlight);
        }
    }

    /**
     * Prints the left sidebar navigation for UI2.
     *
     * @param UserInterface active module interface
     * @param string module name to forcibly highlight
     * @return void
     */
    private static function _printSidebarNavigation($active, $forceHighlight = '')
    {
        $indexName = CATSUtility::getIndexName();
        $modules = ModuleUtility::getModules();
        $rolePagePermissions = null;
        $currentUserID = 0;
        $currentAccessLevel = ACCESS_LEVEL_DISABLED;
        if (isset($_SESSION['CATS']) && $_SESSION['CATS']->isLoggedIn())
        {
            $rolePagePermissions = new RolePagePermissions($_SESSION['CATS']->getSiteID());
            if (!$rolePagePermissions->isSchemaAvailable())
            {
                $rolePagePermissions = null;
            }
            else
            {
                $currentUserID = (int) $_SESSION['CATS']->getUserID();
                if (method_exists($_SESSION['CATS'], 'getBaseAccessLevel'))
                {
                    $currentAccessLevel = (int) $_SESSION['CATS']->getBaseAccessLevel();
                }
                else
                {
                    $currentAccessLevel = (int) $_SESSION['CATS']->getAccessLevel('');
                }
            }
        }
        $itemsByKey = array();
        $username  = $_SESSION['CATS']->getUsername();
        $fullName  = $_SESSION['CATS']->getFullName();
        $currentModuleName = ($active !== null) ? $active->getModuleName() : '';
        $currentAction = isset($_REQUEST['a']) ? $_REQUEST['a'] : '';

        if (strpos($username, '@'.$_SESSION['CATS']->getSiteID()) !== false &&
            substr($username, strpos($username, '@'.$_SESSION['CATS']->getSiteID())) ==
            '@'.$_SESSION['CATS']->getSiteID() )
        {
           $username = str_replace('@'.$_SESSION['CATS']->getSiteID(), '', $username);
        }

        foreach ($modules as $moduleName => $parameters)
        {
            $tabText = $parameters[1];

            if (empty($tabText))
            {
                continue;
            }

            if ($_SESSION['CATS']->isHrMode() && $tabText == 'Companies')
            {
                $tabText = 'My Company';
            }

            if ($tabText == 'Home')
            {
                $tabText = 'Overview';
            }

            $displayTab = true;
            if (!eval(Hooks::get('TEMPLATE_UTILITY_EVALUATE_TAB_VISIBLE'))) return;

            if (!$displayTab)
            {
                continue;
            }

            if ($rolePagePermissions !== null)
            {
                $pageKey = RolePagePermissions::mapRequestToPageKey($moduleName, '');
                if (!$rolePagePermissions->isPageAllowedForUser($currentUserID, $pageKey, $currentAccessLevel))
                {
                    continue;
                }
            }

            $alPosition = strpos($tabText, "*al=");
            if ($alPosition !== false)
            {
                $al = substr($tabText, $alPosition + 4);
                $soPosition = strpos($al, "@");
                $soName = '';
                if ($soPosition !== false)
                {
                    $soName = substr($al, $soPosition + 1);
                    $al = substr($al, 0, $soPosition);
                }
                if ($_SESSION['CATS']->getAccessLevel($soName) < $al && !$_SESSION['CATS']->isDemo())
                {
                    continue;
                }
                $tabText = substr($tabText, 0, $alPosition);
            }

            $item = array(
                'label' => $tabText,
                'href' => $indexName . '?m=' . $moduleName,
                'module' => $moduleName
            );

            $itemsByKey[$moduleName] = $item;
        }

        echo '<nav class="ui2-sidebar" aria-label="Primary">', "\n";
        echo '<div class="ui2-sidebar-logo">', "\n";
        echo '<a href="', $indexName, '"><img src="images/applicationLogo.jpg" alt="OpenCATS" /></a>', "\n";
        echo '</div>', "\n";
        $iconMap = array(
            'home' => 'home',
            'home_inbox' => 'activity',
            'home_notes' => 'activity',
            'dashboard' => 'home',
            'candidates' => 'candidates',
            'joborders' => 'joborders',
            'companies' => 'companies',
            'contacts' => 'contacts',
            'lists' => 'lists',
            'activity' => 'activity',
            'calendar' => 'calendar',
            'sourcing' => 'sourcing',
            'kpis' => 'kpis',
            'reports' => 'reports',
            'settings' => 'settings'
        );

        if ($_SESSION['CATS']->getAccessLevel('settings.administration') >= ACCESS_LEVEL_DEMO)
        {
            if ($rolePagePermissions === null ||
                $rolePagePermissions->isPageAllowedForUser($currentUserID, 'settings_admin', $currentAccessLevel))
            {
                $itemsByKey['settings_admin'] = array(
                    'label' => 'Administration',
                    'href' => $indexName . '?m=settings&amp;a=administration',
                    'module' => 'settings',
                    'action' => 'administration',
                    'icon' => 'settings'
                );
            }
        }

        if ($_SESSION['CATS']->getAccessLevel('gdpr.requests') >= ACCESS_LEVEL_READ)
        {
            if ($rolePagePermissions === null ||
                $rolePagePermissions->isPageAllowedForUser($currentUserID, 'gdpr_consents', $currentAccessLevel))
            {
                $itemsByKey['gdpr_consents'] = array(
                    'label' => 'GDPR Consents',
                    'href' => $indexName . '?m=gdpr&amp;a=requests',
                    'module' => 'gdpr',
                    'action' => 'requests',
                    'icon' => 'settings'
                );
            }
        }

        if (isset($itemsByKey['home']))
        {
            $itemsByKey['home']['href'] = $indexName . '?m=home&amp;a=home';
            $itemsByKey['home']['action'] = 'home';
        }

        if ($rolePagePermissions === null ||
            $rolePagePermissions->isPageAllowedForUser($currentUserID, 'home', $currentAccessLevel))
        {
            $itemsByKey['home_notes'] = array(
                'label' => 'My Notes & To-do',
                'href' => $indexName . '?m=home&amp;a=myNotes',
                'module' => 'home',
                'action' => 'myNotes',
                'icon' => 'activity'
            );
        }

        if (
            $_SESSION['CATS']->getAccessLevel('candidates.show') >= ACCESS_LEVEL_READ ||
            $_SESSION['CATS']->getAccessLevel('joborders.show') >= ACCESS_LEVEL_READ
        )
        {
            if ($rolePagePermissions === null ||
                $rolePagePermissions->isPageAllowedForUser($currentUserID, 'home', $currentAccessLevel))
            {
                $inboxUnreadCount = self::_getUnreadInboxNotificationCount();
                $inboxLabel = 'My Inbox';
                if ($inboxUnreadCount > 0)
                {
                    $inboxLabel .= ' <span class="ui2-sidebar-badge">' . (int) $inboxUnreadCount . '</span>';
                }
                $itemsByKey['home_inbox'] = array(
                    'label' => $inboxLabel,
                    'href' => $indexName . '?m=home&amp;a=inbox',
                    'module' => 'home',
                    'action' => 'inbox',
                    'icon' => 'activity'
                );
            }
        }

          $groups = array(
              array('label' => 'Overview', 'modules' => array('dashboard', 'home', 'home_inbox', 'home_notes', 'activity')),
            array('label' => 'Core Recruiting', 'modules' => array('candidates', 'joborders', 'companies', 'contacts')),
            array('label' => 'Sourcing & Lists', 'modules' => array('sourcing', 'lists')),
            array('label' => 'Insights & Reporting', 'modules' => array('kpis', 'reports')),
            array('label' => 'Planning & Admin', 'modules' => array('calendar', 'gdpr_consents', 'settings', 'settings_admin'))
        );

        foreach ($groups as $group)
        {
            $groupItems = array();
            foreach ($group['modules'] as $moduleName)
            {
                if (isset($itemsByKey[$moduleName]))
                {
                    $groupItems[] = $itemsByKey[$moduleName];
                }
            }

            if (empty($groupItems))
            {
                continue;
            }

            echo '<div class="ui2-sidebar-group">', "\n";
            echo '<div class="ui2-sidebar-group-title">', htmlspecialchars($group['label']), '</div>', "\n";

            foreach ($groupItems as $item)
            {
                $isActive = false;
                if ($item['module'] === $forceHighlight)
                {
                    $isActive = true;
                }
                else if ($item['module'] === $currentModuleName)
                {
                    if (isset($item['action']))
                    {
                        $isActive = ($currentAction === $item['action']);
                        if (!$isActive &&
                            $item['module'] === 'home' &&
                            $item['action'] === 'home' &&
                            $currentAction === '')
                        {
                            $isActive = true;
                        }
                    }
                    else
                    {
                        $isActive = !($item['module'] === 'settings' && $currentAction === 'administration');
                    }
                }

                $class = 'ui2-sidebar-link' . ($isActive ? ' is-active' : '');
                $iconKey = isset($item['icon']) ? $item['icon'] : (isset($iconMap[$item['module']]) ? $iconMap[$item['module']] : 'default');
                echo '<a class="', $class, '" href="', $item['href'], '"><span class="ui2-sidebar-icon ui2-sidebar-icon--', $iconKey, '" aria-hidden="true"></span>', $item['label'], '</a>', "\n";
            }

            echo '</div>', "\n";
        }

        echo '<div class="ui2-sidebar-group ui2-sidebar-group--bottom">', "\n";
        echo '<div class="ui2-sidebar-user">', htmlspecialchars($fullName), '<br /><span>', htmlspecialchars($username), '</span></div>', "\n";
        echo '<a class="ui2-sidebar-link ui2-sidebar-link--utility" href="', $indexName, '?m=logout"><span class="ui2-sidebar-icon ui2-sidebar-icon--default" aria-hidden="true"></span>Logout</a>', "\n";
        echo '</div>', "\n";
        echo '</nav>', "\n";
    }

    private static function _getUnreadInboxNotificationCount()
    {
        static $cachedCount = null;

        if ($cachedCount !== null)
        {
            return $cachedCount;
        }

        if (!isset($_SESSION['CATS']) || !$_SESSION['CATS']->isLoggedIn())
        {
            $cachedCount = 0;
            return 0;
        }

        $siteID = (int) $_SESSION['CATS']->getSiteID();
        $userID = (int) $_SESSION['CATS']->getUserID();
        $total = 0;

        $candidateMessages = new CandidateMessages($siteID);
        if ($candidateMessages->isSchemaAvailable())
        {
            $total += (int) $candidateMessages->getUnreadThreadCount($userID);
        }

        $jobOrderMessages = new JobOrderMessages($siteID);
        if ($jobOrderMessages->isSchemaAvailable())
        {
            $total += (int) $jobOrderMessages->getUnreadThreadCount($userID);
        }

        $cachedCount = $total;
        return $total;
    }

    private static function _getCSRFTokenFor($tokenName)
    {
        if (!isset($_SESSION['CATS_CSRF_TOKENS']) ||
            !is_array($_SESSION['CATS_CSRF_TOKENS']))
        {
            $_SESSION['CATS_CSRF_TOKENS'] = array();
        }

        if (!isset($_SESSION['CATS_CSRF_TOKENS'][$tokenName]) ||
            $_SESSION['CATS_CSRF_TOKENS'][$tokenName] === '')
        {
            if (function_exists('random_bytes'))
            {
                try
                {
                    $_SESSION['CATS_CSRF_TOKENS'][$tokenName] = bin2hex(random_bytes(32));
                }
                catch (Exception $e)
                {
                    $_SESSION['CATS_CSRF_TOKENS'][$tokenName] = sha1(uniqid((string) mt_rand(), true));
                }
            }
            else
            {
                $_SESSION['CATS_CSRF_TOKENS'][$tokenName] = sha1(uniqid((string) mt_rand(), true));
            }
        }

        return $_SESSION['CATS_CSRF_TOKENS'][$tokenName];
    }

    private static function _getFeedbackStatusMeta($status)
    {
        switch ((string) $status)
        {
            case 'sent':
                return array('Feedback submitted.', 'noteGood');

            case 'empty':
                return array('Please enter feedback details before submitting.', 'noteBad');

            case 'token':
                return array('Your feedback session expired. Please try again.', 'noteBad');

            case 'notConfigured':
                return array('Feedback recipient is not configured. Go to Settings > Feedback Settings.', 'noteBad');

            case 'schema':
                return array('My Notes schema is missing. Please apply schema migrations.', 'noteBad');

            case 'failed':
                return array('Unable to submit feedback right now.', 'noteBad');
        }

        return array('', '');
    }

    private static function _printFeedbackFooterWidget()
    {
        if (self::$_isModalWindow ||
            !isset($_SESSION['CATS']) ||
            !$_SESSION['CATS']->isLoggedIn())
        {
            return;
        }

        $siteID = (int) $_SESSION['CATS']->getSiteID();
        $feedbackSettings = new FeedbackSettings($siteID);
        $recipientUserID = (int) $feedbackSettings->getRecipientUserID();
        $isConfigured = ($recipientUserID > 0);

        $feedbackStatus = '';
        if (isset($_GET['feedbackStatus']))
        {
            $feedbackStatus = trim((string) $_GET['feedbackStatus']);
        }
        list($feedbackStatusMessage, $feedbackStatusClass) = self::_getFeedbackStatusMeta($feedbackStatus);

        $returnQuery = isset($_SERVER['QUERY_STRING']) ? (string) $_SERVER['QUERY_STRING'] : '';
        $returnQuery = preg_replace('/(^|&)feedbackStatus=[^&]*/i', '$1', $returnQuery);
        $returnQuery = trim((string) $returnQuery, '&');
        if ($returnQuery === '')
        {
            $returnQuery = 'm=home&a=home';
        }

        $requestURI = isset($_SERVER['REQUEST_URI'])
            ? (string) $_SERVER['REQUEST_URI']
            : (CATSUtility::getIndexName() . '?' . $returnQuery);

        $feedbackToken = self::_getCSRFTokenFor('home.submitFeedback');
        $indexName = CATSUtility::getIndexName();

        echo '<style type="text/css">';
        echo '.global-feedback-wrap{margin:18px auto 8px auto;}';
        echo '.ui2-sidebar-enabled .global-feedback-wrap{margin-left:220px;margin-right:0;width:calc(100% - 220px);}';
        echo '.global-feedback-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;background:#00425B;color:#fff;border-radius:4px;flex-wrap:wrap;}';
        echo '.ui2 .global-feedback-bar,.ui2-body .global-feedback-bar{background:var(--ui2-sidebar-bg,var(--ui2-primary,#00425B));}';
        echo '.global-feedback-copy{min-width:260px;flex:1 1 auto;}';
        echo '.global-feedback-title{font-size:12px;font-weight:bold;letter-spacing:0.03em;text-transform:uppercase;}';
        echo '.global-feedback-subtitle{font-size:12px;opacity:0.9;line-height:1.4;}';
        echo '.global-feedback-actions{display:flex;align-items:center;gap:8px;flex:0 0 auto;}';
        echo '.global-feedback-button{border:1px solid rgba(255,255,255,0.55);background:#fff;color:#00425B;padding:6px 10px;cursor:pointer;border-radius:3px;font-size:12px;font-weight:bold;}';
        echo '.global-feedback-button[disabled]{cursor:not-allowed;opacity:0.65;}';
        echo '.global-feedback-config-warning{font-size:11px;color:#ffd0d0;}';
        echo '.global-feedback-modal-backdrop{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:2500;}';
        echo '.global-feedback-modal{display:none;position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2501;width:min(640px,92vw);background:#fff;border:1px solid #c7d0d8;border-radius:6px;box-shadow:0 10px 36px rgba(0,0,0,0.35);}';
        echo '.global-feedback-modal-header{padding:12px 14px;background:#00425B;color:#fff;font-weight:bold;border-radius:6px 6px 0 0;}';
        echo '.global-feedback-modal-body{padding:12px 14px;}';
        echo '.global-feedback-modal-row{margin-bottom:10px;}';
        echo '.global-feedback-modal-label{display:block;font-size:12px;font-weight:bold;margin-bottom:4px;color:#334;}';
        echo '.global-feedback-modal-input,.global-feedback-modal-textarea,.global-feedback-modal-select{width:100%;padding:6px 8px;border:1px solid #bcc8d3;border-radius:3px;font-size:13px;}';
        echo '.global-feedback-modal-textarea{min-height:140px;resize:vertical;}';
        echo '.global-feedback-modal-actions{display:flex;justify-content:flex-end;gap:8px;padding:0 14px 14px 14px;}';
        echo '.global-feedback-modal-cancel,.global-feedback-modal-submit{padding:6px 12px;border:1px solid #bcc8d3;border-radius:3px;cursor:pointer;font-size:12px;}';
        echo '.global-feedback-modal-submit{background:#0097BD;border-color:#0097BD;color:#fff;font-weight:bold;}';
        echo '@media (max-width: 1024px){.ui2-sidebar-enabled .global-feedback-wrap{margin-left:0;margin-right:0;width:auto;}}';
        echo '</style>', "\n";

        echo '<div class="global-feedback-wrap">', "\n";

        if ($feedbackStatusMessage !== '')
        {
            echo '<p class="', $feedbackStatusClass, '" style="margin-top:0;">', htmlspecialchars($feedbackStatusMessage), '</p>', "\n";
        }

        echo '<div class="global-feedback-bar">', "\n";
        echo '<div class="global-feedback-copy">', "\n";
        echo '<div class="global-feedback-title">Help Improve OpenCATS</div>', "\n";
        echo '<div class="global-feedback-subtitle">Please use the &quot;Submit Feedback&quot; button to report bugs or request new features.</div>', "\n";
        echo '</div>', "\n";
        echo '<div class="global-feedback-actions">', "\n";
        if (!$isConfigured)
        {
            echo '<span class="global-feedback-config-warning">Recipient not configured in Settings.</span>', "\n";
        }
        echo '<button type="button" class="global-feedback-button" onclick="CATSFeedback_openModal();"';
        if (!$isConfigured)
        {
            echo ' disabled="disabled"';
        }
        echo '>Submit Feedback</button>', "\n";
        echo '</div>', "\n";
        echo '</div>', "\n";
        echo '</div>', "\n";

        echo '<div class="global-feedback-modal-backdrop" id="globalFeedbackBackdrop" onclick="CATSFeedback_closeModal();"></div>', "\n";
        echo '<div class="global-feedback-modal" id="globalFeedbackModal">', "\n";
        echo '<div class="global-feedback-modal-header">Submit Feedback</div>', "\n";
        echo '<form method="post" action="', htmlspecialchars($indexName, ENT_QUOTES), '?m=home&amp;a=submitFeedback" autocomplete="off">', "\n";
        echo '<div class="global-feedback-modal-body">', "\n";
        echo '<input type="hidden" name="securityToken" value="', htmlspecialchars($feedbackToken, ENT_QUOTES), '" />', "\n";
        echo '<input type="hidden" name="returnQuery" value="', htmlspecialchars($returnQuery, ENT_QUOTES), '" />', "\n";
        echo '<input type="hidden" name="pageURL" value="', htmlspecialchars($requestURI, ENT_QUOTES), '" />', "\n";
        echo '<div class="global-feedback-modal-row"><label class="global-feedback-modal-label" for="globalFeedbackType">Type</label>';
        echo '<select class="global-feedback-modal-select" id="globalFeedbackType" name="feedbackType">';
        echo '<option value="bug">Bug Report</option>';
        echo '<option value="feature">Feature Request</option>';
        echo '<option value="general">General Feedback</option>';
        echo '</select></div>', "\n";
        echo '<div class="global-feedback-modal-row"><label class="global-feedback-modal-label" for="globalFeedbackSubject">Subject (optional)</label>';
        echo '<input class="global-feedback-modal-input" id="globalFeedbackSubject" name="subject" maxlength="255" /></div>', "\n";
        echo '<div class="global-feedback-modal-row"><label class="global-feedback-modal-label" for="globalFeedbackMessage">Details</label>';
        echo '<textarea class="global-feedback-modal-textarea" id="globalFeedbackMessage" name="message" maxlength="4000" required="required"></textarea></div>', "\n";
        echo '</div>', "\n";
        echo '<div class="global-feedback-modal-actions">';
        echo '<button type="button" class="global-feedback-modal-cancel" onclick="CATSFeedback_closeModal();">Cancel</button>';
        echo '<button type="submit" class="global-feedback-modal-submit">Send Feedback</button>';
        echo '</div>', "\n";
        echo '</form>', "\n";
        echo '</div>', "\n";

        echo '<script type="text/javascript">';
        echo 'function CATSFeedback_openModal(){var m=document.getElementById("globalFeedbackModal");var b=document.getElementById("globalFeedbackBackdrop");if(m&&b){m.style.display="block";b.style.display="block";}var t=document.getElementById("globalFeedbackMessage");if(t){t.focus();}}';
        echo 'function CATSFeedback_closeModal(){var m=document.getElementById("globalFeedbackModal");var b=document.getElementById("globalFeedbackBackdrop");if(m){m.style.display="none";}if(b){b.style.display="none";}}';
        echo '</script>', "\n";
    }

    /**
     * Prints footer HTML for non-report pages.
     *
     * @return void
     */
    public static function printFooter()
    {
        $build    = $_SESSION['CATS']->getCachedBuild();
        $loadTime = $_SESSION['CATS']->getExecutionTime();

        if ($build > 0)
        {
            $buildString = ' build ' . $build;
        }
        else
        {
            $buildString = '';
        }

        /* THE MODIFICATION OF THE COPYRIGHT AND 'Powered by OpenCATS' LINES IS NOT ALLOWED
           BY THE TERMS OF THE CPL FOR OpenCATS OPEN SOURCE EDITION.

             II) The following copyright notice must be retained and clearly legible
             at the bottom of every rendered HTML document: Copyright (C) 2007-2023
             OpenCATs All rights reserved.

             III) The "Powered by OpenCATS" text or logo must be retained and clearly
             legible on every rendered HTML document. The logo, or the text
             "OpenCATS", must be a hyperlink to the CATS Project website, currently
             http://www.opencats.org/.
       */

        self::_printFeedbackFooterWidget();

        echo '<div class="footerBlock">', "\n";
        echo '<p id="footerText">OpenCATS Version ', CATS_VERSION, $buildString,
             '. <span id="toolbarVersion"></span>Powered by <a href="http://www.opencats.org/"><strong>OpenCATS</strong></a>.</p>', "\n";
        echo '<span id="footerResponse">Server Response Time: ', $loadTime, ' seconds.</span><br />';
        echo '<span id="footerCopyright">', COPYRIGHT_HTML, '</span>', "\n";
        if (!eval(Hooks::get('TEMPLATEUTILITY_SHOWPRIVACYPOLICY'))) return;
        echo '</div>', "\n";

        eval(Hooks::get('TEMPLATE_UTILITY_PRINT_FOOTER'));

        echo '</body>', "\n";
        echo '</html>', "\n";

        if (LicenseUtility::isProfessional() && !rand(0,10))
        {
            if (!LicenseUtility::validateProfessionalKey(LICENSE_KEY))
            {
                CATSUtility::changeConfigSetting('LICENSE_KEY', "''");
            }
        }
    }

    /**
     * Prints footer HTML for report pages.
     *
     * @return void
     */
    public static function printReportFooter()
    {
        $build = $_SESSION['CATS']->getCachedBuild();

        // FIXME: LOCAL TIME ZONE!
        $date  = date('l, F jS, Y \a\t h:i:s A T');

        if ($build > 0)
        {
            $buildString = ' build ' . $build;
        }
        else
        {
            $buildString = '';
        }

        echo '<div class="footerBlock">', "\n";
        echo '<p id="footerText">Report generated on ', $date, '.<br />', "\n";
        echo 'CATS Version ', CATS_VERSION, $buildString,
             '. Powered by <a href="http://www.catsone.com/"><strong>CATS</strong></a>.</p>', "\n";
        echo '<span id="footerCopyright">', COPYRIGHT_HTML, '</span>', "\n";
        echo '</div>', "\n";

        echo '</body>', "\n";
        echo '</html>', "\n";
    }

    /**
     * Prints HTML for pipeline candidate-joborder match rating stars.
     *
     * @param integer rating (0-5)
     * @param integer candidate-joborder ID
     * @param string PHP session cookie
     * @return string HTML
     */
    public static function getRatingObject($rating, $candidateJobOrderID, $sessionCookie)
    {
        static $firstCall = true;

        /* These usually come straight from the database; make sure it's an
         * integer.
         */
        $rating = (int) $rating;

        $ratings = self::_getRatingImages();
        $indexName = CATSUtility::getIndexName();

        if ($_SESSION['CATS']->getAccessLevel('pipelines.editRating') < ACCESS_LEVEL_EDIT)
        {
            $HTML = '<img src="' . $ratings[$rating] . '" style="border: none;" alt="" id="moImage' . $candidateJobOrderID . '" />';
            return $HTML;
        }

        $HTML  = '<!--MATCHROW moImageValue' . $candidateJobOrderID . '-->';
        if ($rating >= 0)
        {
            $HTML .= '<img src="' . $ratings[$rating] . '" style="border: none;" alt="" id="moImage' . $candidateJobOrderID . '" usemap="#moImageMapPos' . $candidateJobOrderID . '" />';
        }
        else
        {
            $HTML .= '<img src="' . $ratings[$rating] . '" style="border: none;" alt="" id="moImage' . $candidateJobOrderID . '" usemap="#moImageMapNeg' . $candidateJobOrderID . '" />';
            $HTML .= '<map id ="moImageMapNeg' . $candidateJobOrderID . '" name="moImageMapNeg' . $candidateJobOrderID . '">';
            $HTML .= '<area shape="rect" coords="0,0,3,12"  href="javascript:void(0);" onmouseout="showImage(\'moImage' . $candidateJobOrderID . '\', moImageValue' . $candidateJobOrderID . ');" onmouseover="showImage(\'moImage' . $candidateJobOrderID . '\', 0);" onclick="moImageValue' . $candidateJobOrderID . ' = 0; setRating(' . $candidateJobOrderID . ', 0, \'moImage' . $candidateJobOrderID . '\', \'' . $sessionCookie . '\');" alt="">';
            $HTML .= '<area shape="rect" coords="4,1,12,12"  href="javascript:void(0);" onmouseout="showImage(\'moImage' . $candidateJobOrderID . '\', moImageValue' . $candidateJobOrderID . ');" onmouseover="showImage(\'moImage' . $candidateJobOrderID . '\', 7);" onclick="moImageValue' . $candidateJobOrderID . ' = -2; setRating(' . $candidateJobOrderID . ', -2, \'moImage' . $candidateJobOrderID . '\', \'' . $sessionCookie . '\');" alt="">';
            $HTML .= '<area shape="rect" coords="13,1,23,12" href="javascript:void(0);" onmouseout="showImage(\'moImage' . $candidateJobOrderID . '\', moImageValue' . $candidateJobOrderID . ');" onmouseover="showImage(\'moImage' . $candidateJobOrderID . '\', 8);" onclick="moImageValue' . $candidateJobOrderID . ' = -3; setRating(' . $candidateJobOrderID . ', -3, \'moImage' . $candidateJobOrderID . '\', \'' . $sessionCookie . '\');" alt="">';
            $HTML .= '<area shape="rect" coords="24,1,34,12" href="javascript:void(0);" onmouseout="showImage(\'moImage' . $candidateJobOrderID . '\', moImageValue' . $candidateJobOrderID . ');" onmouseover="showImage(\'moImage' . $candidateJobOrderID . '\', 9);" onclick="moImageValue' . $candidateJobOrderID . ' = -4; setRating(' . $candidateJobOrderID . ', -4, \'moImage' . $candidateJobOrderID . '\', \'' . $sessionCookie . '\');" alt="">';
            $HTML .= '<area shape="rect" coords="35,1,45,12" href="javascript:void(0);" onmouseout="showImage(\'moImage' . $candidateJobOrderID . '\', moImageValue' . $candidateJobOrderID . ');" onmouseover="showImage(\'moImage' . $candidateJobOrderID . '\', 10);" onclick="moImageValue' . $candidateJobOrderID . ' = -5; setRating(' . $candidateJobOrderID . ', -5, \'moImage' . $candidateJobOrderID . '\', \'' . $sessionCookie . '\');" alt="">';
            $HTML .= '<area shape="rect" coords="46,1,56,12" href="javascript:void(0);" onmouseout="showImage(\'moImage' . $candidateJobOrderID . '\', moImageValue' . $candidateJobOrderID . ');" onmouseover="showImage(\'moImage' . $candidateJobOrderID . '\', 11);" onclick="moImageValue' . $candidateJobOrderID . ' = -6; setRating(' . $candidateJobOrderID . ', -6, \'moImage' . $candidateJobOrderID . '\', \'' . $sessionCookie . '\');" alt="">';
            $HTML .= '</map>';
        }
        $HTML .= '<map id ="moImageMapPos' . $candidateJobOrderID . '" name="moImageMapPos' . $candidateJobOrderID . '">';
        $HTML .= '<area shape="rect" coords="0,0,3,12"  href="javascript:void(0);" onmouseout="showImage(\'moImage' . $candidateJobOrderID . '\', moImageValue' . $candidateJobOrderID . ');" onmouseover="showImage(\'moImage' . $candidateJobOrderID . '\', 0);" onclick="moImageValue' . $candidateJobOrderID . ' = 0; setRating(' . $candidateJobOrderID . ', 0, \'moImage' . $candidateJobOrderID . '\', \'' . $sessionCookie . '\');" alt="">';
        $HTML .= '<area shape="rect" coords="4,1,12,12"  href="javascript:void(0);" onmouseout="showImage(\'moImage' . $candidateJobOrderID . '\', moImageValue' . $candidateJobOrderID . ');" onmouseover="showImage(\'moImage' . $candidateJobOrderID . '\', 1);" onclick="moImageValue' . $candidateJobOrderID . ' = 1; setRating(' . $candidateJobOrderID . ', 1, \'moImage' . $candidateJobOrderID . '\', \'' . $sessionCookie . '\');" alt="">';
        $HTML .= '<area shape="rect" coords="13,1,23,12" href="javascript:void(0);" onmouseout="showImage(\'moImage' . $candidateJobOrderID . '\', moImageValue' . $candidateJobOrderID . ');" onmouseover="showImage(\'moImage' . $candidateJobOrderID . '\', 2);" onclick="moImageValue' . $candidateJobOrderID . ' = 2; setRating(' . $candidateJobOrderID . ', 2, \'moImage' . $candidateJobOrderID . '\', \'' . $sessionCookie . '\');" alt="">';
        $HTML .= '<area shape="rect" coords="24,1,34,12" href="javascript:void(0);" onmouseout="showImage(\'moImage' . $candidateJobOrderID . '\', moImageValue' . $candidateJobOrderID . ');" onmouseover="showImage(\'moImage' . $candidateJobOrderID . '\', 3);" onclick="moImageValue' . $candidateJobOrderID . ' = 3; setRating(' . $candidateJobOrderID . ', 3, \'moImage' . $candidateJobOrderID . '\', \'' . $sessionCookie . '\');" alt="">';
        $HTML .= '<area shape="rect" coords="35,1,45,12" href="javascript:void(0);" onmouseout="showImage(\'moImage' . $candidateJobOrderID . '\', moImageValue' . $candidateJobOrderID . ');" onmouseover="showImage(\'moImage' . $candidateJobOrderID . '\', 4);" onclick="moImageValue' . $candidateJobOrderID . ' = 4; setRating(' . $candidateJobOrderID . ', 4, \'moImage' . $candidateJobOrderID . '\', \'' . $sessionCookie . '\');" alt="">';
        $HTML .= '<area shape="rect" coords="46,1,56,12" href="javascript:void(0);" onmouseout="showImage(\'moImage' . $candidateJobOrderID . '\', moImageValue' . $candidateJobOrderID . ');" onmouseover="showImage(\'moImage' . $candidateJobOrderID . '\', 5);" onclick="moImageValue' . $candidateJobOrderID . ' = 5; setRating(' . $candidateJobOrderID . ', 5, \'moImage' . $candidateJobOrderID . '\', \'' . $sessionCookie . '\');" alt="">';
        $HTML .= '</map>';

        $HTML .= '<script type="text/javascript">';
        $HTML .= 'moImageValue' . $candidateJobOrderID . ' = ' . $rating . ';';

        $HTML .= '</script>';

        /* Only on the first call... */
        if ($firstCall)
        {
            $HTML .= self::getRatingsArrayJS();
        }

        return $HTML;
    }

    /**
     * Prints out the image array of ratings for associated JavaScript.
     *
     * @param integer table row number
     * @return void
     */
    public static function getRatingsArrayJS()
    {
        $ratings = self::_getRatingImages();

        $HTML = '<script type="text/javascript">';

        foreach ($ratings as $rating)
        {
            $ratingsQuoted[] = '"' . $rating . '"';
        }

        $ratingsQuotedString = implode(',', $ratingsQuoted);
        $HTML .= "\n" . 'defineImages(new Array(' . $ratingsQuotedString . '));';

        $HTML .= "\n" . '</script>';

        return $HTML;
    }

    // TODO: Document me.
    public static function getDataItemTypeDescription($dataItemType)
    {
        switch ($dataItemType)
        {
            case DATA_ITEM_CANDIDATE:
                return 'Candidate';
                break;

            case DATA_ITEM_COMPANY:
                return 'Company';
                break;

            case DATA_ITEM_CONTACT:
                return 'Contact';
                break;

            case DATA_ITEM_JOBORDER:
                return 'Joborder';
                break;

            default:
                return '';
        }
    }

    /**
     * Prints out the class name for the current row number (for tables where
     * row color alternates). Even row numbers get the 'evenTableRow' class;
     * odd numbers get the 'oddTableRow' class.
     *
     * @param integer table row number
     * @return void
     */
    public static function printAlternatingRowClass($rowNumber)
    {
        /* Is the row number even? */
        if (($rowNumber % 2) == 0)
        {
            echo 'evenTableRow';
            return;
        }

        echo 'oddTableRow';
    }

    /**
     * Prints out the class name for the current row number (for div pairs where
     * row color alternates). Even row numbers get the 'evenTableRow' class;
     * odd numbers get the 'oddTableRow' class.
     *
     * @param integer div row number
     * @return void
     */
    public static function printAlternatingDivClass($rowNumber)
    {
        /* Is the row number even? */
        if (($rowNumber % 2) == 0)
        {
            echo 'evenDivRow';
            return;
        }

        echo 'oddDivRow';
    }

    /**
     * Returns the class name for the current row number (for tables where
     * row color alternates). Even row numbers get the 'evenTableRow' class;
     * odd numbers get the 'oddTableRow' class.
     *
     * @param integer table row number
     * @return void
     */
    public static function getAlternatingRowClass($rowNumber)
    {
        /* Is the row number even? */
        if (($rowNumber % 2) == 0)
        {
            return 'evenTableRow';
        }
        else
        {
            return 'oddTableRow';
        }
    }

    /**
     * Removes from $text everything from starting block through ending block.
     * Optionally also removes a following piece of text indicated by closing
     * tag.
     *
     * For example, lets say you had the following text:
     *
     *   <a href="blah/blah.html?id=55"><b>My Link</b></a>
     *
     * If you wanted to remove the hyperlink from the text for every occurrence
     * of this format of link, you could use:
     *
     *   $HTML = filterRemoveTextBlock(
     *       $HTML, '<a href="blah/blah.html?id=', '>', '</a>'
     *   );
     *
     * and the link would be replaced with '<b>My Link</b>' in the returned
     * text / HTML.
     *
     * @param string output HTML to filter
     * @param string text at start of text to be removed
     * @param string text at end of text to be removed
     * @param string closing tag to be removed
     * @return string filtered HTML output
     */
    public static function filterRemoveTextBlock($text, $startBlock, $endBlock, $closingTag = '')
    {
        $startPos = strpos($text, $startBlock);
        if ($startPos !== false)
        {
            $endPos = strpos(substr($text, $startPos + strlen($startBlock)), $endBlock);
        }
        else
        {
            $endPos = false;
        }

        while ($startPos !== false || $endPos !== false)
        {
            if ($startPos === false)
            {
                $startPos = 0;
            }

            if ($endPos === false)
            {
                $endPos = 0;
            }
            else
            {
                $endPos += strlen($endBlock);
            }

            $text = substr_replace($text, '', $startPos, $endPos + strlen($startBlock));

            if ($closingTag != '')
            {
                $closingPos = strpos(substr($text, $startPos), $closingTag);

                if ($closingPos !== false)
                {
                    $text = substr_replace($text, '', $closingPos + $startPos, strlen($closingTag));
                }
            }

            $startPos = strpos($text, $startBlock);
            if ($startPos !== false)
            {
                $endPos = strpos(substr($text, $startPos + strlen($startBlock)), $endBlock);
            }
            else
            {
                $endPos = false;
            }
        }

        return $text;
    }

    public static function printSingleQuickActionMenu(QuickActionMenu $menu)
    {
        return $menu->getHtml();
    }

    public static function _printQuickActionMenuHolder()
    {
        echo '<div class="ajaxSearchResults" id="singleQuickActionMenu" align="left" style="width:200px;" onclick="toggleVisibility()">';

        echo '</div>';
    }

    /**
     * Prints template header HTML.
     *
     * @param string page title
     * @param array JavaScript / CSS files to load
     * @return void
     */
    private static function _printCommonHeader($pageTitle, $headIncludes = array())
    {
        if (!is_array($headIncludes))
        {
            $headIncludes = array($headIncludes);
        }

        $siteID = $_SESSION['CATS']->getSiteID();

        /* This prevents caching problems when SVN updates are preformed. */
        if ($_SESSION['CATS']->getCachedBuild() > 0)
        {
            $javascriptAntiCache = '?b=' . $_SESSION['CATS']->getCachedBuild();
        }
        else
        {
            $javascriptAntiCache = '?v=' . CATSUtility::getVersionAsInteger();
        }

        echo '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"', "\n";
        echo '"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">', "\n";
        echo '<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">', "\n";
        echo '<head>', "\n";
        echo '<title>OpenCATS - ', $pageTitle, '</title>', "\n";
        echo '<meta http-equiv="Content-Type" content="text/html; charset=', HTML_ENCODING, '" />', "\n";
        echo '<link rel="icon" href="images/favicon.ico" type="image/x-icon" />', "\n";
        echo '<link rel="shortcut icon" href="images/favicon.ico" type="image/x-icon" />', "\n";
        echo '<link rel="alternate" type="application/rss+xml" title="RSS" href="',
             CATSUtility::getIndexName(), '?m=rss" />', "\n";

        /* Core JS files */
        echo '<script type="text/javascript" src="js/lib.js'.$javascriptAntiCache.'"></script>', "\n";
        echo '<script type="text/javascript" src="js/quickAction.js'.$javascriptAntiCache.'"></script>', "\n";
        echo '<script type="text/javascript" src="js/calendarDateInput.js'.$javascriptAntiCache.'"></script>', "\n";
        echo '<script type="text/javascript" src="js/submodal/subModal.js'.$javascriptAntiCache.'"></script>', "\n";
        echo '<script type="text/javascript" src="js/jquery-1.3.2.min.js'.$javascriptAntiCache.'"></script>', "\n";
        echo '<script type="text/javascript">CATSIndexName = "'.CATSUtility::getIndexName().'";</script>', "\n";

       $headIncludes[] = 'main.css';
       $headIncludes[] = 'public/css/ui2.css';
       $headIncludes[] = 'public/css/ui2-theme-avel.css';

        foreach ($headIncludes as $key => $filename)
        {
            $extension = substr($filename, strrpos($filename, '.') + 1);

            $filename .= $javascriptAntiCache;

            if ($extension == 'js')
            {
                echo '<script type="text/javascript" src="', $filename, '"></script>', "\n";
            }
            else if ($extension == 'css')
            {
                echo '<style type="text/css" media="all">@import "', $filename, '";</style>', "\n";
            }
        }

        echo '<!--[if IE]><link rel="stylesheet" type="text/css" href="ie.css" /><![endif]-->', "\n";
        echo '<![if !IE]><link rel="stylesheet" type="text/css" href="not-ie.css" /><![endif]>', "\n";
        echo '</head>', "\n\n";
    }


    /**
     * Returns an array of "star" images for rating values.
     *
     * @return array rating values and associated image paths
     */
    private static function _getRatingImages()
    {
        return array(
            0  => 'images/stars/star0.gif',
            1  => 'images/stars/star1.gif',
            2  => 'images/stars/star2.gif',
            3  => 'images/stars/star3.gif',
            4  => 'images/stars/star4.gif',
            5  => 'images/stars/star5.gif',
            -1 => 'images/stars/starneg1.gif',
            -2 => 'images/stars/starneg2.gif',
            -3 => 'images/stars/starneg3.gif',
            -4 => 'images/stars/starneg4.gif',
            -5 => 'images/stars/starneg5.gif',
            -6 => 'images/stars/starneg6.gif'
        );
    }
}

?>
