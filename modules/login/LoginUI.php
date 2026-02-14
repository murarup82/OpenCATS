<?php
/*
 * CATS
 * Login Module
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
 *
 * $Id: LoginUI.php 3720 2007-11-27 21:06:13Z andrew $
 */

include_once(LEGACY_ROOT . '/lib/SystemInfo.php');
include_once(LEGACY_ROOT . '/lib/Mailer.php');
include_once(LEGACY_ROOT . '/lib/Site.php');
include_once(LEGACY_ROOT . '/lib/NewVersionCheck.php');
include_once(LEGACY_ROOT . '/lib/Wizard.php');
include_once(LEGACY_ROOT . '/lib/License.php');
include_once(LEGACY_ROOT . '/lib/Users.php');
include_once(LEGACY_ROOT . '/lib/DatabaseConnection.php');
include_once(LEGACY_ROOT . '/lib/GoogleOIDCSettings.php');
include_once(LEGACY_ROOT . '/lib/RolePagePermissions.php');

class LoginUI extends UserInterface
{
    const GOOGLE_STATE_SESSION_KEY = 'googleOIDCLoginState';
    const GOOGLE_PROFILE_SESSION_KEY = 'googleOIDCAccessRequestProfile';
    const GOOGLE_REQUEST_STATUS_SESSION_KEY = 'googleOIDCAccessRequestStatus';

    public function __construct()
    {
        parent::__construct();

        $this->_authenticationRequired = false;
        $this->_moduleName = 'login';
        $this->_moduleDirectory = 'login';
    }

    public function handleRequest()
    {
        $action = $this->getAction();
        switch ($action)
        {
            case 'attemptLogin':
                $this->attemptLogin();
                break;

            case 'forgotPassword':
                if ($this->isPostBack())
                {
                    $this->onForgotPassword();
                }
                else
                {
                    $this->forgotPassword();
                }
                break;

            case 'googleStart':
                $this->googleStart();
                break;

            case 'googleCallback':
                $this->googleCallback();
                break;

            case 'requestAccess':
                if ($this->isPostBack() ||
                    (isset($_SERVER['REQUEST_METHOD']) && strtoupper($_SERVER['REQUEST_METHOD']) === 'POST'))
                {
                    $this->onRequestAccess();
                }
                else
                {
                    $this->requestAccess();
                }
                break;

            case 'noCookiesModal':
                $this->noCookiesModal();
                break;

            case 'showLoginForm':
            default:
                $this->showLoginForm();
                break;
        }
    }


    /*
     * Called by handleRequest() to handle displaying the initial login form.
     */
    private function showLoginForm()
    {
        /* The username can be pre-filled in the input box by specifing
         * "&loginusername=Username" in the URL.
         */
        $username = $this->getTrimmedInput('loginusername', $_GET);

        /* If GET variables exist, preserve them so that after login, the user
         * can be transfered to the URL they were trying to access.
         */
        $reloginVars = $this->_getReloginVars();

        /* A message can be specified in the url via "&message=Message". The
         * message can be displayed as either an error or a "success" notice.
         * This is controlled by specifing "&messageSuccess=true" or
         * "&messageSuccess=false" in the URL.
         */
        $message = $this->getTrimmedInput('message', $_GET);
        if (isset($_GET['messageSuccess']) &&
            $_GET['messageSuccess'] == 'true')
        {
            $this->_template->assign('messageSuccess', true);
        }
        else
        {
            $this->_template->assign('messageSuccess', false);
        }

        /* A site name can be specified in the URL via "&s=Name". */
        if (isset($_GET['s']))
        {
            $siteName = $_GET['s'];
        }
        else
        {
            $siteName = '';
        }

        /* Only allow one user to be logged into a single account at the same
         * time.
         */
        if ($_SESSION['CATS']->isLoggedIn() &&
            $_SESSION['CATS']->checkForceLogout())
        {
            $siteName = $_SESSION['CATS']->getUnixName();
        }

        if (!eval(Hooks::get('SHOW_LOGIN_FORM_PRE'))) return;

        /* If a site was specified, get the site's full name from its
         * unixname.
         */
        if ($siteName != '')
        {
            $site = new Site(-1);
            $rs = $site->getSiteByUnixName($siteName);

            if (!empty($rs))
            {
                $siteNameFull = $rs['name'];
            }
            else
            {
                $siteNameFull = 'error';
            }
        }
        else
        {
            $siteNameFull = '';
        }

        if (!eval(Hooks::get('SHOW_LOGIN_FORM_POST'))) return;

        /* Display the login page. */
        $this->_template->assign('message', $message);
        $this->_template->assign('username', $username);
        $this->_template->assign('reloginVars', $reloginVars);
        $this->_template->assign('siteName', $siteName);
        $this->_template->assign('siteNameFull', $siteNameFull);
        $this->_template->assign('dateString', date('l, F jS, Y'));
        $this->assignGoogleLoginTemplateVars($reloginVars, $siteName);

        if (!eval(Hooks::get('SHOW_LOGIN_FORM_POST_2'))) return;

        $this->_template->display('./modules/login/Login.tpl');
    }

    private function noCookiesModal()
    {
        if (!eval(Hooks::get('NO_COOKIES_MODAL'))) return;

        $this->_template->display('./modules/login/NoCookiesModal.tpl');
    }

    /*
     * Called by handleRequest() to handle attempting to log in a user.
     */
    private function attemptLogin()
    {
        //FIXME: getTrimmedInput()!
        if (isset($_POST['siteName']))
        {
            $siteName = $_POST['siteName'];
        }
        else
        {
            $siteName = '';
        }

        if (!isset($_POST['username']) || !isset($_POST['password']))
        {
            $message = 'Invalid username or password.';

            if (isset($_GET['reloginVars']))
            {
                $this->_template->assign('reloginVars', urlencode($_GET['reloginVars']));
            }
            else
            {
                $this->_template->assign('reloginVars', '');
            }

            $site = new Site(-1);
            $rs = $site->getSiteByUnixName($siteName);
            if (isset($rs['name']))
            {
                $siteNameFull = $rs['name'];
            }
            else
            {
                $siteNameFull = $siteName;
            }

            if (!eval(Hooks::get('LOGIN_NO_CREDENTIALS'))) return;

            $this->_template->assign('message', $message);
            $this->_template->assign('messageSuccess', false);
            $this->_template->assign('siteName', $siteName);
            $this->_template->assign('siteNameFull', $siteNameFull);
            $this->_template->assign('dateString', date('l, F jS, Y'));
            $this->assignGoogleLoginTemplateVars(
                isset($_GET['reloginVars']) ? urlencode($_GET['reloginVars']) : '',
                $siteName
            );

            $this->_template->display('./modules/login/Login.tpl');

            return;
        }

        $username = $this->getTrimmedInput('username', $_POST);
        $password = $this->getTrimmedInput('password', $_POST);

        if (strpos($username, '@') !== false)
        {
            $siteName = '';
        }

        if ($siteName != '')
        {
            $site = new Site(-1);
            $rs = $site->getSiteByUnixName($siteName);
            if (isset($rs['siteID']))
            {
                $username .= '@' . $rs['siteID'];
            }
        }

        /* Make a blind attempt at logging the user in. */
        $_SESSION['CATS']->processLogin($username, $password);

        /* If unsuccessful, take the user back to the login page. */
        if (!$_SESSION['CATS']->isLoggedIn())
        {
            $message = $_SESSION['CATS']->getLoginError();

            if (isset($_GET['reloginVars']))
            {
                $this->_template->assign('reloginVars', urlencode($_GET['reloginVars']));
            }
            else
            {
                $this->_template->assign('reloginVars', '');
            }

            $site = new Site(-1);
            $rs = $site->getSiteByUnixName($siteName);
            if (isset($rs['name']))
            {
                $siteNameFull = $rs['name'];
            }
            else
            {
                $siteNameFull = $siteName;
            }

            if (!eval(Hooks::get('LOGIN_UNSUCCESSFUL'))) return;

            $this->_template->assign('message', $message);
            $this->_template->assign('messageSuccess', false);
            $this->_template->assign('siteName', $siteName);
            $this->_template->assign('siteNameFull', $siteNameFull);
            $this->_template->assign('dateString', date('l, F jS, Y'));
            $this->assignGoogleLoginTemplateVars(
                isset($_GET['reloginVars']) ? urlencode($_GET['reloginVars']) : '',
                $siteName
            );
            $this->_template->display('./modules/login/Login.tpl');

            return;
        }

        $systemInfoDb = new SystemInfo();

        $accessLevel = $_SESSION['CATS']->getAccessLevel(ACL::SECOBJ_ROOT);

        $mailerSettings = new MailerSettings($_SESSION['CATS']->getSiteID());
        $mailerSettingsRS = $mailerSettings->getAll();

        /***************************** BEGIN NEW WIZARD *****************************************/
        /**
         * Improved setup wizard using the Wizard library. If the user succeeds,
         * all old-style wizards will no longer be shown.
         */

        $wizard = new Wizard(CATSUtility::getIndexName(), './js/wizardIntro.js');
        if ($_SESSION['CATS']->isFirstTimeSetup())
        {
            $wizard->addPage('Welcome!', './modules/login/wizard/Intro.tpl', '', false, true);
        }

        if (!$_SESSION['CATS']->isAgreedToLicense())
        {
            $phpeval = '';
            if (!eval(Hooks::get('LICENSE_TERMS'))) return;
            $wizard->addPage('License', './modules/login/wizard/License.tpl', $phpeval, true, true);
        }

        if (defined('CATS_TEST_MODE') && CATS_TEST_MODE)
        {
            // On-site wizard pages
            if (!LicenseUtility::isLicenseValid())
            {
                if (defined('LICENSE_KEY') && LICENSE_KEY == '')
                {
                    $template = 'Register.tpl';
                    $templateName = 'Register';
                }
                else
                {
                    $template = 'Reregister.tpl';
                    $templateName = 'License Expired';
                }
                $wizard->addPage($templateName, './modules/login/wizard/' . $template, '', false, true);
            }
        }

        // if logged in for the first time, change password
        if (strtolower($username) == 'admin' && $password === DEFAULT_ADMIN_PASSWORD)
        {
            $wizard->addPage('Password', './modules/login/wizard/Password.tpl', '', false, true);
        }

        // make user set an e-mail address
        if (trim($_SESSION['CATS']->getEmail()) == '')
        {
            $wizard->addPage('E-mail', './modules/login/wizard/Email.tpl', '', false, true);
        }

        // if no site name set, make user set site name
        if ($accessLevel >= ACCESS_LEVEL_SA && $_SESSION['CATS']->getSiteName() === 'default_site')
        {
            $wizard->addPage('Site', './modules/login/wizard/SiteName.tpl', '', false, true);
        }

        // CATS Hosted Wizard Pages
        if (!eval(Hooks::get('ASP_WIZARD_PAGES'))) return;

        if ($_SESSION['CATS']->isFirstTimeSetup())
        {
            $wizard->addPage('Setup Users', './modules/login/wizard/Users.tpl', '
                $users = new Users($siteID);
                $mp = $users->getAll();
                $data = $users->getLicenseData();

                $this->_template->assign(\'users\', $mp);
                $this->_template->assign(\'totalUsers\', $data[\'totalUsers\']);
                $this->_template->assign(\'userLicenses\', $data[\'userLicenses\']);
                $this->_template->assign(\'accessLevels\', $users->getAccessLevels());
            ');

            if (!eval(Hooks::get('ASP_WIZARD_IMPORT'))) return;
        }

        // The wizard will not display if no pages have been added.
        $wizard->doModal();

        /******************************* END NEW WIZARD *******************************************/

        /* Session is logged in, do we need to send the user to the wizard?
         * This should be done only on the first use, indicated by the
         * admin user's password still being set to the default.
         */

        /* If we have a specific page to go to, go there. */

        /* These hooks are for important things, like disabling the site based on criteria. */
        if (!eval(Hooks::get('LOGGED_IN'))) return;

        if (isset($_GET['reloginVars']))
        {
            CATSUtility::transferRelativeURI($_GET['reloginVars']);
        }

        /* LOGGED_IN_MESSAGES hooks are only for messages which show up on initial login (warnings, etc) */
        if (!eval(Hooks::get('LOGGED_IN_MESSAGES'))) return;

        /* If logged in for the first time, make user change password. */
        if (strtolower($username) == 'admin' &&
            $password === DEFAULT_ADMIN_PASSWORD)
        {
            CATSUtility::transferRelativeURI('m=settings&a=newInstallPassword');
        }

        /* If no site name set, make user set site name. */
        else if ($accessLevel >= ACCESS_LEVEL_SA &&
                 $_SESSION['CATS']->getSiteName() === 'default_site')
        {
            CATSUtility::transferRelativeURI('m=settings&a=upgradeSiteName');
        }

        /* If the default email is set in the configuration, complain to the admin. */
        else if ($accessLevel >= ACCESS_LEVEL_SA &&
                 $mailerSettingsRS['configured'] == '0')
        {
            NewVersionCheck::checkForUpdate();

            $this->_template->assign('inputType', 'conclusion');
            $this->_template->assign('title', 'E-Mail Disabled');
            $this->_template->assign('prompt', 'E-mail features are disabled. In order to enable e-mail features (such as e-mail notifications), please configure your e-mail settings by clicking on the Settings tab and then clicking on Administration.');
            $this->_template->assign('action', $this->getAction());
            $this->_template->assign('home', 'home');
            $this->_template->display('./modules/settings/NewInstallWizard.tpl');
        }

        /* If no E-Mail set for current user, make user set E-Mail address. */
        else if (trim($_SESSION['CATS']->getEmail()) == '')
        {
            CATSUtility::transferRelativeURI('m=settings&a=forceEmail');
        }

        /* If nothing else has stopped us, just go to the home page. */
        else
        {
            if (!eval(Hooks::get('LOGGED_IN_HOME_PAGE'))) return;
            CATSUtility::transferURL(
                CATSUtility::getAbsoluteURI(CATSUtility::getIndexName())
            );
        }
    }

    /*
     * Called by handleRequest() to handle displaying the form for retrieving
     * forgotten passwords.
     */
    private function forgotPassword()
    {
        if (!eval(Hooks::get('FORGOT_PASSWORD'))) return;

        $this->_template->display('./modules/login/ForgotPassword.tpl');
    }

    /*
     * Called by handleRequest() to handle processing the form for retrieving
     * forgotten passwords.
     */
    private function onForgotPassword()
    {
        $username = $this->getTrimmedInput('username', $_POST);

        if (!eval(Hooks::get('ON_FORGOT_PASSWORD'))) return;

        $user = new Users($this->_siteID);
        $userID = $user->getIDByUsername($username);
        if ($userID !== false && $userID > 0)
        {
            if (function_exists('random_bytes'))
            {
                try
                {
                    $temporaryPassword = bin2hex(random_bytes(8));
                }
                catch (Exception $e)
                {
                    $temporaryPassword = substr(sha1(uniqid((string) mt_rand(), true)), 0, 16);
                }
            }
            else
            {
                $temporaryPassword = substr(sha1(uniqid((string) mt_rand(), true)), 0, 16);
            }

            if (!$user->resetPassword((int) $userID, $temporaryPassword))
            {
                $this->_template->assign('message', 'Unable to process password reset at this time.');
                $this->_template->assign('complete', false);
                $this->_template->display('./modules/login/ForgotPassword.tpl');
                return;
            }

            $mailer = new Mailer($this->_siteID);
            $mailerStatus = $mailer->sendToOne(
                array($username, $username),
                PASSWORD_RESET_SUBJECT,
                sprintf(PASSWORD_RESET_BODY, $temporaryPassword),
                true
            );

            if ($mailerStatus)
            {
                $this->_template->assign('username', $username);
                $this->_template->assign('complete', true);
            }
            else
            {
                $this->_template->assign('message',' Unable to send password to address specified.');
                $this->_template->assign('complete', false);
            }
        }
        else
        {
            $this->_template->assign('message', 'No such username found.');
            $this->_template->assign('complete', false);
        }

        $this->_template->display('./modules/login/ForgotPassword.tpl');
    }

    private function googleStart()
    {
        $reloginVars = $this->getTrimmedInput('reloginVars', $_GET);
        $siteName = $this->getTrimmedInput('s', $_GET);
        $siteID = $this->resolveGoogleSiteID($siteName);
        $googleSettings = $this->getGoogleSettingsForSite($siteID);

        if ($siteName === '')
        {
            $configuredSiteID = (int) $googleSettings['siteId'];
            if ($configuredSiteID > 0 && $configuredSiteID !== $siteID)
            {
                $siteID = $configuredSiteID;
                $googleSettings = $this->getGoogleSettingsForSite($siteID);
            }
        }

        if (!$this->isGoogleOIDCConfigured($googleSettings))
        {
            $this->displayLoginMessage(
                'Google sign-in is not configured yet. Please contact your administrator.',
                $siteName
            );
            return;
        }

        $_SESSION[self::GOOGLE_STATE_SESSION_KEY] = array(
            'token' => $this->makeRandomToken(16),
            'reloginVars' => $reloginVars,
            'siteName' => $siteName,
            'siteID' => $siteID
        );

        $params = array(
            'client_id' => $googleSettings['clientId'],
            'redirect_uri' => $this->getGoogleRedirectURI($googleSettings),
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'access_type' => 'online',
            'include_granted_scopes' => 'true',
            'prompt' => 'select_account',
            'state' => $_SESSION[self::GOOGLE_STATE_SESSION_KEY]['token']
        );

        if (trim($googleSettings['hostedDomain']) !== '')
        {
            $params['hd'] = trim($googleSettings['hostedDomain']);
        }

        CATSUtility::transferURL(
            'https://accounts.google.com/o/oauth2/v2/auth?' .
            http_build_query($params, '', '&')
        );
    }

    private function googleCallback()
    {
        $googleError = $this->getTrimmedInput('error', $_GET);
        if ($googleError !== '')
        {
            $this->displayLoginMessage('Google sign-in was cancelled or failed.');
            return;
        }

        $state = $this->getTrimmedInput('state', $_GET);
        $code = $this->getTrimmedInput('code', $_GET);
        if ($state === '' || $code === '')
        {
            $this->displayLoginMessage('Google sign-in did not return a valid response.');
            return;
        }

        if (!isset($_SESSION[self::GOOGLE_STATE_SESSION_KEY]) ||
            !is_array($_SESSION[self::GOOGLE_STATE_SESSION_KEY]))
        {
            $this->displayLoginMessage('Google sign-in session has expired. Please try again.');
            return;
        }

        $stateData = $_SESSION[self::GOOGLE_STATE_SESSION_KEY];
        unset($_SESSION[self::GOOGLE_STATE_SESSION_KEY]);

        if (!isset($stateData['token']) ||
            !$this->secureCompare((string) $stateData['token'], $state))
        {
            $this->displayLoginMessage('Google sign-in validation failed. Please try again.');
            return;
        }

        $siteName = (isset($stateData['siteName']) ? $stateData['siteName'] : '');
        $siteID = (isset($stateData['siteID']) ? (int) $stateData['siteID'] : 0);
        if ($siteID <= 0)
        {
            $siteID = $this->resolveGoogleSiteID($siteName);
        }
        if ($siteID <= 0)
        {
            $this->displayLoginMessage('Unable to resolve target site for Google sign-in.', $siteName);
            return;
        }

        $googleSettings = $this->getGoogleSettingsForSite($siteID);
        if (!$this->isGoogleOIDCConfigured($googleSettings))
        {
            $this->displayLoginMessage(
                'Google sign-in is not configured yet. Please contact your administrator.',
                $siteName
            );
            return;
        }

        $tokenRS = $this->exchangeGoogleAuthCode($code, $googleSettings);
        if (!$tokenRS['success'])
        {
            $this->displayLoginMessage($tokenRS['error']);
            return;
        }

        $profileRS = $this->fetchGoogleUserInfo($tokenRS['accessToken']);
        if (!$profileRS['success'])
        {
            $this->displayLoginMessage($profileRS['error']);
            return;
        }

        $profile = $profileRS['profile'];
        if (empty($profile['email']) || empty($profile['email_verified']))
        {
            $this->displayLoginMessage('Google account e-mail is missing or not verified.');
            return;
        }

        $email = strtolower(trim($profile['email']));
        if (!$this->isAllowedGoogleEmail($email, $googleSettings['hostedDomain']))
        {
            $this->displayLoginMessage('Your Google account domain is not allowed.');
            return;
        }

        $user = $this->getUserByEmailAndSite($email, $siteID);
        if (!empty($user) && (int) $user['accessLevel'] > ACCESS_LEVEL_DISABLED)
        {
            $_SESSION['CATS']->transparentLogin($siteID, (int) $user['userID'], (int) $user['siteID']);
            $this->transferAfterLogin(
                isset($stateData['reloginVars']) ? $stateData['reloginVars'] : ''
            );
            return;
        }

        if (!$this->isGoogleAutoProvisionEnabled($googleSettings))
        {
            $this->displayLoginMessage(
                'Google sign-in is configured, but automatic access request is disabled.'
            );
            return;
        }

        $fullName = trim(
            (isset($profile['given_name']) ? $profile['given_name'] : '') . ' ' .
            (isset($profile['family_name']) ? $profile['family_name'] : '')
        );
        if ($fullName === '' && isset($profile['name']))
        {
            $fullName = trim($profile['name']);
        }

        $_SESSION[self::GOOGLE_PROFILE_SESSION_KEY] = array(
            'email' => $email,
            'firstName' => isset($profile['given_name']) ? trim($profile['given_name']) : '',
            'lastName' => isset($profile['family_name']) ? trim($profile['family_name']) : '',
            'fullName' => $fullName,
            'googleSub' => isset($profile['sub']) ? $profile['sub'] : '',
            'siteID' => $siteID,
            'reloginVars' => isset($stateData['reloginVars']) ? $stateData['reloginVars'] : ''
        );

        CATSUtility::transferRelativeURI('m=login&a=requestAccess');
    }

    private function requestAccess()
    {
        if (!isset($_SESSION[self::GOOGLE_PROFILE_SESSION_KEY]) ||
            !is_array($_SESSION[self::GOOGLE_PROFILE_SESSION_KEY]))
        {
            $this->displayLoginMessage('Please sign in with Google before requesting access.');
            return;
        }

        $profile = $_SESSION[self::GOOGLE_PROFILE_SESSION_KEY];
        $status = 'form';
        $statusMessage = '';
        if (isset($_SESSION[self::GOOGLE_REQUEST_STATUS_SESSION_KEY]) &&
            is_array($_SESSION[self::GOOGLE_REQUEST_STATUS_SESSION_KEY]))
        {
            $status = $_SESSION[self::GOOGLE_REQUEST_STATUS_SESSION_KEY]['status'];
            $statusMessage = $_SESSION[self::GOOGLE_REQUEST_STATUS_SESSION_KEY]['message'];
            unset($_SESSION[self::GOOGLE_REQUEST_STATUS_SESSION_KEY]);
        }

        $fullName = trim($profile['fullName']);
        if ($fullName === '')
        {
            $fullName = trim($profile['firstName'] . ' ' . $profile['lastName']);
        }
        if ($fullName === '')
        {
            $fullName = $profile['email'];
        }

        $this->_template->assign('status', $status);
        $this->_template->assign('statusMessage', $statusMessage);
        $this->_template->assign('fullName', $fullName);
        $this->_template->assign('email', $profile['email']);
        $this->_template->assign('reason', '');
        $this->_template->display('./modules/login/GoogleAccessRequest.tpl');
    }

    private function onRequestAccess()
    {
        if (!isset($_SESSION[self::GOOGLE_PROFILE_SESSION_KEY]) ||
            !is_array($_SESSION[self::GOOGLE_PROFILE_SESSION_KEY]))
        {
            $this->displayLoginMessage('Please sign in with Google before requesting access.');
            return;
        }

        $profile = $_SESSION[self::GOOGLE_PROFILE_SESSION_KEY];
        $reason = $this->getTrimmedInput('reason', $_POST);

        $siteID = (int) $profile['siteID'];
        $email = strtolower(trim($profile['email']));
        $googleSettings = $this->getGoogleSettingsForSite($siteID);

        $existingUser = $this->getUserByEmailAndSite($email, $siteID);
        if (!empty($existingUser) &&
            (int) $existingUser['accessLevel'] > ACCESS_LEVEL_DISABLED)
        {
            $_SESSION['CATS']->transparentLogin(
                $siteID,
                (int) $existingUser['userID'],
                (int) $existingUser['siteID']
            );
            $this->transferAfterLogin(
                isset($profile['reloginVars']) ? $profile['reloginVars'] : ''
            );
            return;
        }

        $alreadyPending = false;
        $userID = 0;
        $username = '';
        if (!empty($existingUser))
        {
            $alreadyPending = true;
            $userID = (int) $existingUser['userID'];
            $username = $existingUser['username'];
        }
        else
        {
            $username = $this->createUniqueUsernameFromEmail($email);
            $firstName = trim($profile['firstName']);
            $lastName = trim($profile['lastName']);
            if ($firstName === '' && $lastName === '')
            {
                $firstName = 'Google';
                $lastName = 'User';
            }

            $users = new Users($siteID);
            $generatedPassword = 'google-' . $this->makeRandomToken(8);
            $userID = (int) $users->add(
                $lastName,
                $firstName,
                $email,
                $username,
                $generatedPassword,
                ACCESS_LEVEL_DISABLED,
                false,
                $siteID
            );

            if ($userID <= 0)
            {
                $_SESSION[self::GOOGLE_REQUEST_STATUS_SESSION_KEY] = array(
                    'status' => 'error',
                    'message' => 'Unable to create your account request. Please contact an administrator.'
                );
                CATSUtility::transferRelativeURI('m=login&a=requestAccess');
            }
        }

        $mailSent = $this->sendGoogleAccessRequestNotification(
            $siteID,
            $profile,
            $username,
            $userID,
            $reason,
            $alreadyPending,
            $googleSettings
        );

        if ($alreadyPending)
        {
            $message = 'Your account request is already pending approval.';
        }
        else
        {
            $message = 'Your access request was submitted and is pending approval.';
        }

        if (!$mailSent)
        {
            $message .= ' Notification e-mail could not be sent automatically.';
        }

        $_SESSION[self::GOOGLE_REQUEST_STATUS_SESSION_KEY] = array(
            'status' => 'submitted',
            'message' => $message
        );

        CATSUtility::transferRelativeURI('m=login&a=requestAccess');
    }

    private function assignGoogleLoginTemplateVars($reloginVars, $siteName)
    {
        $siteID = $this->resolveGoogleSiteID($siteName);
        $googleSettings = $this->getGoogleSettingsForSite($siteID);

        if ($siteName === '')
        {
            $configuredSiteID = (int) $googleSettings['siteId'];
            if ($configuredSiteID > 0 && $configuredSiteID !== $siteID)
            {
                $siteID = $configuredSiteID;
                $googleSettings = $this->getGoogleSettingsForSite($siteID);
            }
        }

        $this->_template->assign('googleAuthEnabled', $this->isGoogleOIDCConfigured($googleSettings));
        $this->_template->assign(
            'googleLoginURL',
            $this->buildGoogleStartURL($reloginVars, $siteName)
        );
    }

    private function getGoogleSettingsForSite($siteID = -1)
    {
        $settings = array(
            'enabled' => (defined('GOOGLE_OIDC_ENABLED') && GOOGLE_OIDC_ENABLED) ? '1' : '0',
            'clientId' => (defined('GOOGLE_OIDC_CLIENT_ID') ? trim((string) GOOGLE_OIDC_CLIENT_ID) : ''),
            'clientSecret' => (defined('GOOGLE_OIDC_CLIENT_SECRET') ? trim((string) GOOGLE_OIDC_CLIENT_SECRET) : ''),
            'redirectUri' => (defined('GOOGLE_OIDC_REDIRECT_URI') ? trim((string) GOOGLE_OIDC_REDIRECT_URI) : ''),
            'hostedDomain' => (defined('GOOGLE_OIDC_HOSTED_DOMAIN') ? trim((string) GOOGLE_OIDC_HOSTED_DOMAIN) : ''),
            'siteId' => (defined('GOOGLE_OIDC_SITE_ID') ? (string) ((int) GOOGLE_OIDC_SITE_ID) : ''),
            'autoProvisionEnabled' => (!defined('GOOGLE_AUTO_PROVISION_ENABLED') || GOOGLE_AUTO_PROVISION_ENABLED) ? '1' : '0',
            'notifyEmail' => (defined('GOOGLE_ACCESS_REQUEST_NOTIFY_EMAIL') ? trim((string) GOOGLE_ACCESS_REQUEST_NOTIFY_EMAIL) : ''),
            'fromEmail' => (defined('GOOGLE_ACCESS_REQUEST_FROM_EMAIL') ? trim((string) GOOGLE_ACCESS_REQUEST_FROM_EMAIL) : ''),
            'requestSubject' => (defined('GOOGLE_ACCESS_REQUEST_SUBJECT') ? trim((string) GOOGLE_ACCESS_REQUEST_SUBJECT) : '')
        );

        $siteID = (int) $siteID;
        if ($siteID > 0)
        {
            $googleOIDCSettings = new GoogleOIDCSettings($siteID);
            $siteSettings = $googleOIDCSettings->getAll();
            foreach ($settings as $key => $value)
            {
                if (isset($siteSettings[$key]))
                {
                    $settings[$key] = trim((string) $siteSettings[$key]);
                }
            }
        }

        return $settings;
    }

    private function isGoogleOIDCConfigured($googleSettings)
    {
        if (!isset($googleSettings['enabled']) || $googleSettings['enabled'] !== '1')
        {
            return false;
        }

        if (!isset($googleSettings['clientId']) ||
            trim($googleSettings['clientId']) === '')
        {
            return false;
        }

        if (!isset($googleSettings['clientSecret']) ||
            trim($googleSettings['clientSecret']) === '')
        {
            return false;
        }

        return true;
    }

    private function isGoogleAutoProvisionEnabled($googleSettings)
    {
        return (isset($googleSettings['autoProvisionEnabled']) &&
            $googleSettings['autoProvisionEnabled'] === '1');
    }

    private function buildGoogleStartURL($reloginVars, $siteName)
    {
        $query = array(
            'm' => 'login',
            'a' => 'googleStart'
        );

        if ($reloginVars !== '')
        {
            $query['reloginVars'] = $reloginVars;
        }
        if ($siteName !== '')
        {
            $query['s'] = $siteName;
        }

        return CATSUtility::getIndexName() . '?' . http_build_query($query, '', '&');
    }

    private function getGoogleRedirectURI($googleSettings = array())
    {
        if (isset($googleSettings['redirectUri']) &&
            trim($googleSettings['redirectUri']) !== '')
        {
            return trim($googleSettings['redirectUri']);
        }

        return CATSUtility::getAbsoluteURI(
            CATSUtility::getIndexName() . '?m=login&a=googleCallback'
        );
    }

    private function resolveGoogleSiteID($siteName)
    {
        $siteName = trim((string) $siteName);
        if ($siteName !== '' && $siteName !== 'choose')
        {
            $site = new Site(-1);
            $rs = $site->getSiteByUnixName($siteName);
            if (isset($rs['siteID']))
            {
                return (int) $rs['siteID'];
            }
        }

        if (defined('GOOGLE_OIDC_SITE_ID') && (int) GOOGLE_OIDC_SITE_ID > 0)
        {
            return (int) GOOGLE_OIDC_SITE_ID;
        }

        if (defined('LDAP_SITEID') && (int) LDAP_SITEID > 0)
        {
            return (int) LDAP_SITEID;
        }

        $site = new Site(-1);
        return (int) $site->getFirstSiteID();
    }

    private function isAllowedGoogleEmail($email, $allowedDomainsRaw = '')
    {
        $atPosition = strpos($email, '@');
        if ($atPosition === false)
        {
            return false;
        }

        $domain = strtolower(substr($email, $atPosition + 1));
        $allowedDomainsRaw = strtolower(trim((string) $allowedDomainsRaw));
        if ($allowedDomainsRaw === '')
        {
            return true;
        }

        $allowedDomains = preg_split('/[\s,;]+/', $allowedDomainsRaw);
        foreach ($allowedDomains as $allowedDomain)
        {
            $allowedDomain = trim($allowedDomain);
            if ($allowedDomain !== '' && $domain === $allowedDomain)
            {
                return true;
            }
        }

        return false;
    }

    private function exchangeGoogleAuthCode($code, $googleSettings)
    {
        $response = $this->httpRequest(
            'https://oauth2.googleapis.com/token',
            'POST',
            array(
                'code' => $code,
                'client_id' => $googleSettings['clientId'],
                'client_secret' => $googleSettings['clientSecret'],
                'redirect_uri' => $this->getGoogleRedirectURI($googleSettings),
                'grant_type' => 'authorization_code'
            ),
            array('Accept: application/json')
        );

        if (!$response['ok'])
        {
            return array(
                'success' => false,
                'error' => 'Google token exchange failed.'
            );
        }

        $payload = json_decode($response['body'], true);
        if (!is_array($payload) || !isset($payload['access_token']))
        {
            return array(
                'success' => false,
                'error' => 'Invalid token response from Google.'
            );
        }

        return array(
            'success' => true,
            'accessToken' => $payload['access_token']
        );
    }

    private function fetchGoogleUserInfo($accessToken)
    {
        $response = $this->httpRequest(
            'https://openidconnect.googleapis.com/v1/userinfo',
            'GET',
            array(),
            array(
                'Accept: application/json',
                'Authorization: Bearer ' . $accessToken
            )
        );

        if (!$response['ok'])
        {
            return array(
                'success' => false,
                'error' => 'Unable to read Google user profile.'
            );
        }

        $payload = json_decode($response['body'], true);
        if (!is_array($payload))
        {
            return array(
                'success' => false,
                'error' => 'Invalid Google user profile response.'
            );
        }

        return array(
            'success' => true,
            'profile' => $payload
        );
    }

    private function httpRequest($url, $method = 'GET', $data = array(), $headers = array())
    {
        $method = strtoupper($method);
        $queryString = http_build_query($data, '', '&');

        if ($method === 'GET' && $queryString !== '')
        {
            $url .= (strpos($url, '?') === false ? '?' : '&') . $queryString;
        }

        if (function_exists('curl_init'))
        {
            $curl = curl_init();
            curl_setopt($curl, CURLOPT_URL, $url);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 10);
            curl_setopt($curl, CURLOPT_TIMEOUT, 20);
            curl_setopt($curl, CURLOPT_FOLLOWLOCATION, false);
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, true);
            curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 2);

            if (!empty($headers))
            {
                curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
            }

            if ($method === 'POST')
            {
                curl_setopt($curl, CURLOPT_POST, true);
                curl_setopt($curl, CURLOPT_POSTFIELDS, $queryString);
            }
            else if ($method !== 'GET')
            {
                curl_setopt($curl, CURLOPT_CUSTOMREQUEST, $method);
                if ($queryString !== '')
                {
                    curl_setopt($curl, CURLOPT_POSTFIELDS, $queryString);
                }
            }

            $body = curl_exec($curl);
            $statusCode = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
            $error = '';
            if ($body === false)
            {
                $error = curl_error($curl);
                $body = '';
            }
            curl_close($curl);

            return array(
                'ok' => ($statusCode >= 200 && $statusCode < 300 && $error === ''),
                'statusCode' => $statusCode,
                'body' => $body,
                'error' => $error
            );
        }

        $headerLines = $headers;
        if (($method === 'POST' || $method === 'PUT') &&
            !empty($data))
        {
            $headerLines[] = 'Content-Type: application/x-www-form-urlencoded';
        }

        $contextOptions = array(
            'http' => array(
                'method' => $method,
                'ignore_errors' => true,
                'timeout' => 20,
                'header' => implode("\r\n", $headerLines)
            )
        );
        if (($method === 'POST' || $method === 'PUT') && $queryString !== '')
        {
            $contextOptions['http']['content'] = $queryString;
        }

        $body = @file_get_contents(
            $url,
            false,
            stream_context_create($contextOptions)
        );

        $statusCode = 0;
        if (isset($http_response_header[0]) &&
            preg_match('/\s(\d{3})\s/', $http_response_header[0], $matches))
        {
            $statusCode = (int) $matches[1];
        }

        return array(
            'ok' => ($body !== false && $statusCode >= 200 && $statusCode < 300),
            'statusCode' => $statusCode,
            'body' => ($body === false ? '' : $body),
            'error' => ($body === false ? 'HTTP request failed.' : '')
        );
    }

    private function getUserByEmailAndSite($email, $siteID)
    {
        $db = DatabaseConnection::getInstance();
        $sql = sprintf(
            "SELECT
                user_id AS userID,
                site_id AS siteID,
                user_name AS username,
                access_level AS accessLevel
            FROM
                user
            WHERE
                site_id = %s
            AND
                (
                    LOWER(email) = LOWER(%s)
                    OR LOWER(user_name) = LOWER(%s)
                )
            LIMIT 1",
            $db->makeQueryInteger($siteID),
            $db->makeQueryString($email),
            $db->makeQueryString($email)
        );

        return $db->getAssoc($sql);
    }

    private function createUniqueUsernameFromEmail($email)
    {
        $db = DatabaseConnection::getInstance();

        $base = strtolower(trim($email));
        $base = preg_replace('/[^a-z0-9._@-]/', '', $base);
        if ($base === '')
        {
            $base = 'googleuser';
        }

        $candidate = $base;
        $suffix = 1;
        while ($suffix < 1000)
        {
            $sql = sprintf(
                "SELECT
                    user_id AS userID
                FROM
                    user
                WHERE
                    user_name = %s
                LIMIT 1",
                $db->makeQueryString($candidate)
            );
            $rs = $db->getAssoc($sql);
            if (empty($rs))
            {
                return $candidate;
            }

            $candidate = $base . '.' . $suffix;
            $suffix++;
        }

        return $base . '.' . time();
    }

    private function sendGoogleAccessRequestNotification(
        $siteID,
        $profile,
        $username,
        $userID,
        $reason,
        $alreadyPending,
        $googleSettings
    )
    {
        if (!isset($googleSettings['notifyEmail']) ||
            trim((string) $googleSettings['notifyEmail']) === '')
        {
            return false;
        }

        $notifyEmail = trim((string) $googleSettings['notifyEmail']);
        $subject = 'OpenCATS Access Request - ' . $profile['email'];
        if (isset($googleSettings['requestSubject']) &&
            trim((string) $googleSettings['requestSubject']) !== '')
        {
            $subject = trim((string) $googleSettings['requestSubject']);
        }

        $body = "A Google sign-in access request was submitted.\n\n";
        $body .= 'Name: ' . $profile['fullName'] . "\n";
        $body .= 'Email: ' . $profile['email'] . "\n";
        $body .= 'Username: ' . $username . "\n";
        $body .= 'User ID: ' . $userID . "\n";
        $body .= 'Site ID: ' . $siteID . "\n";
        $body .= 'Request Type: ' . ($alreadyPending ? 'Reminder (already pending)' : 'New request') . "\n";
        $body .= 'Reason: ' . ($reason === '' ? '(not provided)' : $reason) . "\n";
        $body .= 'Source IP: ' . $this->getClientIP() . "\n";
        $body .= 'Requested At: ' . date('Y-m-d H:i:s') . "\n";

        $mailer = new Mailer($siteID);
        if (isset($googleSettings['fromEmail']) &&
            trim((string) $googleSettings['fromEmail']) !== '')
        {
            $mailer->overrideSetting('fromAddress', trim((string) $googleSettings['fromEmail']));
        }

        return (bool) $mailer->sendToOne(
            array($notifyEmail, $notifyEmail),
            $subject,
            $body,
            false,
            true,
            array(),
            78,
            false
        );
    }

    private function transferAfterLogin($reloginVars)
    {
        if ($reloginVars !== '')
        {
            CATSUtility::transferRelativeURI($reloginVars);
        }

        CATSUtility::transferURL(
            CATSUtility::getAbsoluteURI(CATSUtility::getIndexName())
        );
    }

    private function displayLoginMessage($message, $siteName = '')
    {
        $siteNameFull = '';
        if ($siteName !== '')
        {
            $site = new Site(-1);
            $siteRS = $site->getSiteByUnixName($siteName);
            $siteNameFull = (isset($siteRS['name']) ? $siteRS['name'] : $siteName);
        }

        $this->_template->assign('message', $message);
        $this->_template->assign('messageSuccess', false);
        $this->_template->assign('username', '');
        $this->_template->assign('reloginVars', '');
        $this->_template->assign('siteName', $siteName);
        $this->_template->assign('siteNameFull', $siteNameFull);
        $this->_template->assign('dateString', date('l, F jS, Y'));
        $this->assignGoogleLoginTemplateVars('', $siteName);
        $this->_template->display('./modules/login/Login.tpl');
    }

    private function secureCompare($knownString, $userString)
    {
        if (function_exists('hash_equals'))
        {
            return hash_equals($knownString, $userString);
        }

        if (strlen($knownString) !== strlen($userString))
        {
            return false;
        }

        $result = 0;
        $maxLength = strlen($knownString);
        for ($i = 0; $i < $maxLength; $i++)
        {
            $result |= (ord($knownString[$i]) ^ ord($userString[$i]));
        }

        return ($result === 0);
    }

    private function makeRandomToken($bytes = 16)
    {
        if (function_exists('random_bytes'))
        {
            try
            {
                return bin2hex(random_bytes($bytes));
            }
            catch (Exception $e)
            {
            }
        }

        return sha1(uniqid((string) mt_rand(), true));
    }

    private function getClientIP()
    {
        if (isset($_SERVER['HTTP_X_FORWARDED_FOR']) &&
            trim($_SERVER['HTTP_X_FORWARDED_FOR']) !== '')
        {
            $parts = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
            return trim($parts[0]);
        }

        if (isset($_SERVER['REMOTE_ADDR']))
        {
            return $_SERVER['REMOTE_ADDR'];
        }

        return '';
    }


    // FIXME: Document me.
    private function _getReloginVars()
    {
        if (empty($_GET))
        {
            return '';
        }

        $getFormatted = array();
        foreach ($_GET as $key => $value)
        {
            if (($key == 'm' && $value == 'logout') ||
                ($key == 'm' && $value == 'login') ||
                ($key == 's'))
            {
                continue;
            }

            $getFormatted[] = urlencode($key) . '=' . urlencode($value);
        }

        return urlencode(implode('&', $getFormatted));
    }
}

?>
