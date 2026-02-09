<?php
/*
 * GDPR Consent Public Endpoint
 *
 * Endpoint: /gdpr/consent.php?t=TOKEN
 */

chdir('..');

require_once('config.php');
require_once(LEGACY_ROOT . '/constants.php');
require_once(LEGACY_ROOT . '/lib/DatabaseConnection.php');
require_once(LEGACY_ROOT . '/lib/Template.php');
require_once(LEGACY_ROOT . '/lib/Site.php');
require_once(LEGACY_ROOT . '/lib/GDPRSettings.php');

if (function_exists('date_default_timezone_set'))
{
    @date_default_timezone_set(date_default_timezone_get());
}

/* Default policy: 24 months unless overridden below. */
if (!defined('GDPR_POLICY_MONTHS'))
{
    define('GDPR_POLICY_MONTHS', 24);
}

$db = DatabaseConnection::getInstance();

function getClientIP()
{
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR']))
    {
        $parts = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        return trim($parts[0]);
    }

    return isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '';
}

function getClientUA()
{
    if (!isset($_SERVER['HTTP_USER_AGENT'])) return '';
    return substr($_SERVER['HTTP_USER_AGENT'], 0, 255);
}

function normalizeLang($lang, $allowed)
{
    if ($lang === null) return '';
    $lang = strtolower(trim($lang));
    if ($lang === '') return '';
    if (strpos($lang, '-') !== false)
    {
        $lang = substr($lang, 0, 2);
    }
    if (in_array($lang, $allowed, true))
    {
        return $lang;
    }
    return '';
}

function parseAcceptLanguage($header, $allowed)
{
    if (empty($header)) return '';
    $parts = explode(',', $header);
    $scores = array();
    foreach ($parts as $part)
    {
        $part = trim($part);
        if ($part === '') continue;
        $segments = explode(';', $part);
        $langTag = strtolower(trim($segments[0]));
        $q = 1.0;
        if (isset($segments[1]) && strpos(trim($segments[1]), 'q=') === 0)
        {
            $qValue = substr(trim($segments[1]), 2);
            $q = (float) $qValue;
        }
        $base = substr($langTag, 0, 2);
        if (!in_array($base, $allowed, true))
        {
            continue;
        }
        if (!isset($scores[$base]) || $q > $scores[$base])
        {
            $scores[$base] = $q;
        }
    }
    if (empty($scores)) return '';
    arsort($scores);
    foreach ($scores as $lang => $score)
    {
        return $lang;
    }
    return '';
}

function getNoticeForLang($db, $siteID, $lang)
{
    $sql = sprintf(
        "SELECT
            title,
            body_text AS bodyText
         FROM
            gdpr_notice
         WHERE
            site_id = %s
            AND lang = %s
         LIMIT 1",
        $db->makeQueryInteger($siteID),
        $db->makeQueryString($lang)
    );

    return $db->getAssoc($sql);
}

function renderConsentPage($vars)
{
    $template = new Template();
    foreach ($vars as $key => $value)
    {
        $template->assign($key, $value);
    }
    $template->display('./modules/gdpr/Consent.tpl');
    exit;
}

$token = '';
if (isset($_GET['t'])) $token = (string) $_GET['t'];
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['t']))
{
    $token = (string) $_POST['t'];
}

if ($token === '')
{
    renderConsentPage(array(
        'title' => 'Invalid Consent Link',
        'message' => 'This consent link is invalid or has expired.',
        'showForm' => false
    ));
}

$tokenHash = hash('sha256', $token);

$sql = sprintf(
    "SELECT
        r.request_id AS requestID,
        r.site_id AS siteID,
        r.candidate_id AS candidateID,
        r.status AS status,
        r.expires_at AS expiresAt,
        r.deleted_at AS deletedAt,
        s.name AS siteName
     FROM
        candidate_gdpr_requests r
     INNER JOIN site s
        ON s.site_id = r.site_id
        AND s.account_deleted = 0
     LEFT JOIN candidate c
        ON c.candidate_id = r.candidate_id
        AND c.site_id = r.site_id
     WHERE
        r.token_hash = %s
     LIMIT 1",
    $db->makeQueryString($tokenHash)
);

$request = $db->getAssoc($sql);

if (empty($request) || empty($request['candidateID']))
{
    renderConsentPage(array(
        'title' => 'Invalid Consent Link',
        'message' => 'This consent link is invalid or has expired.',
        'showForm' => false
    ));
}

function resolveRequestState($request)
{
    $isExpired = false;
    if (!empty($request['expiresAt']))
    {
        $isExpired = (strtotime($request['expiresAt']) <= time());
    }

    if (!empty($request['deletedAt']))
    {
        return array('active' => false, 'state' => 'deleted', 'expired' => $isExpired);
    }

    if ($request['status'] === 'ACCEPTED')
    {
        return array('active' => false, 'state' => 'accepted', 'expired' => $isExpired);
    }

    if ($request['status'] === 'DECLINED')
    {
        return array('active' => false, 'state' => 'declined', 'expired' => $isExpired);
    }

    if ($request['status'] === 'CANCELED')
    {
        return array('active' => false, 'state' => 'canceled', 'expired' => $isExpired);
    }

    if ($request['status'] === 'EXPIRED' || $isExpired)
    {
        return array('active' => false, 'state' => 'expired', 'expired' => $isExpired);
    }

    return array(
        'active' => in_array($request['status'], array('CREATED', 'SENT')),
        'state' => 'active',
        'expired' => $isExpired
    );
}

$state = resolveRequestState($request);
$isActive = $state['active'];

$allowedLangs = array('ro', 'en', 'fr');
$langParam = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['lang']))
{
    $langParam = normalizeLang($_POST['lang'], $allowedLangs);
}
else if (isset($_GET['lang']))
{
    $langParam = normalizeLang($_GET['lang'], $allowedLangs);
}
$langHeader = parseAcceptLanguage(isset($_SERVER['HTTP_ACCEPT_LANGUAGE']) ? $_SERVER['HTTP_ACCEPT_LANGUAGE'] : '', $allowedLangs);
$currentLang = 'en';
if ($langParam !== '')
{
    $currentLang = $langParam;
}
else if ($langHeader !== '')
{
    $currentLang = $langHeader;
}

$notice = getNoticeForLang($db, $request['siteID'], $currentLang);
if (empty($notice) && $currentLang !== 'en')
{
    $notice = getNoticeForLang($db, $request['siteID'], 'en');
    $currentLang = 'en';
}
if (empty($notice))
{
    $notice = array(
        'title' => 'GDPR Consent',
        'bodyText' => ''
    );
}
$noticeTitle = isset($notice['title']) ? trim($notice['title']) : '';
$noticeBody = isset($notice['bodyText']) ? $notice['bodyText'] : '';
$normalizedBody = preg_replace("/\r\n|\r/", "\n", trim($noticeBody));
$noticeVersion = hash('sha256', $noticeTitle . "\n\n" . $normalizedBody);
$postedNoticeVersion = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['noticeVersion']))
{
    $posted = strtolower(trim($_POST['noticeVersion']));
    if (preg_match('/^[a-f0-9]{64}$/', $posted))
    {
        $postedNoticeVersion = $posted;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET')
{
    if (!$isActive)
    {
        $title = 'Consent Link Expired';
        $message = 'This consent request is no longer active.';
        if ($state['state'] === 'accepted')
        {
            $title = 'Already Processed';
            $message = 'This consent request has already been accepted.';
        }
        else if ($state['state'] === 'declined')
        {
            $title = 'Already Processed';
            $message = 'This consent request has already been declined.';
        }
        else if ($state['state'] === 'canceled')
        {
            $title = 'Request Canceled';
            $message = 'This consent request has been canceled.';
        }
        else if ($state['state'] === 'expired')
        {
            $title = 'Consent Link Expired';
            $message = 'This consent link has expired.';
        }

        renderConsentPage(array(
            'title' => $title,
            'message' => $message,
            'showForm' => false,
            'siteName' => $request['siteName'],
            'token' => $token,
            'currentLang' => $currentLang,
            'noticeTitle' => $notice['title'],
            'noticeBody' => $notice['bodyText'],
            'noticeVersion' => $noticeVersion
        ));
    }

    renderConsentPage(array(
        'title' => 'GDPR Consent',
        'message' => '',
        'showForm' => true,
        'token' => $token,
        'siteName' => $request['siteName'],
        'currentLang' => $currentLang,
        'noticeTitle' => $notice['title'],
        'noticeBody' => $notice['bodyText'],
        'noticeVersion' => $noticeVersion
    ));
}

/* POST: Accept or Decline */
$action = isset($_POST['action']) ? $_POST['action'] : '';
if ($action !== 'accept' && $action !== 'decline')
{
    renderConsentPage(array(
        'title' => 'Invalid Request',
        'message' => 'Invalid request.',
        'showForm' => false,
        'siteName' => $request['siteName'],
        'token' => $token,
        'currentLang' => $currentLang,
        'noticeTitle' => $notice['title'],
        'noticeBody' => $notice['bodyText'],
        'noticeVersion' => $noticeVersion
    ));
}

if (!$isActive)
{
    $title = 'Consent Link Expired';
    $message = 'This consent request is no longer active.';
    if ($state['state'] === 'accepted')
    {
        $title = 'Already Processed';
        $message = 'This consent request has already been accepted.';
    }
    else if ($state['state'] === 'declined')
    {
        $title = 'Already Processed';
        $message = 'This consent request has already been declined.';
    }
    else if ($state['state'] === 'canceled')
    {
        $title = 'Request Canceled';
        $message = 'This consent request has been canceled.';
    }
    else if ($state['state'] === 'expired')
    {
        $title = 'Consent Link Expired';
        $message = 'This consent link has expired.';
    }

    renderConsentPage(array(
        'title' => $title,
        'message' => $message,
        'showForm' => false,
        'siteName' => $request['siteName'],
        'token' => $token,
        'currentLang' => $currentLang,
        'noticeTitle' => $notice['title'],
        'noticeBody' => $notice['bodyText'],
        'noticeVersion' => $noticeVersion
    ));
}

$ip = getClientIP();
$ua = getClientUA();

if ($action === 'accept')
{
    $updateSQL = sprintf(
        "UPDATE candidate_gdpr_requests
         SET
            status = 'ACCEPTED',
            accepted_at = NOW(),
            accepted_ip = %s,
            accepted_ua = %s,
            accepted_lang = %s,
            notice_version = %s
         WHERE
            request_id = %s
            AND status IN ('CREATED','SENT')
            AND deleted_at IS NULL
            AND (expires_at IS NULL OR expires_at > NOW())",
        $db->makeQueryStringOrNULL($ip),
        $db->makeQueryStringOrNULL($ua),
        $db->makeQueryStringOrNULL($currentLang),
        $db->makeQueryStringOrNULL($postedNoticeVersion !== '' ? $postedNoticeVersion : null),
        $db->makeQueryInteger($request['requestID'])
    );
    $db->query($updateSQL);

    if ($db->getAffectedRows() <= 0)
    {
        renderConsentPage(array(
            'title' => 'Already Processed',
            'message' => 'This consent request is no longer active.',
            'showForm' => false,
            'siteName' => $request['siteName'],
            'token' => $token,
            'currentLang' => $currentLang,
            'noticeTitle' => $notice['title'],
            'noticeBody' => $notice['bodyText'],
            'noticeVersion' => $noticeVersion
        ));
    }

    $policyMonths = GDPR_POLICY_MONTHS;
    $gdprSettings = new GDPRSettings($request['siteID']);
    $settings = $gdprSettings->getAll();
    if (isset($settings[GDPRSettings::SETTING_KEY]))
    {
        $years = (int) $settings[GDPRSettings::SETTING_KEY];
        if ($years > 0)
        {
            $policyMonths = $years * 12;
        }
    }

    $db->query(sprintf(
        "UPDATE candidate
         SET
            gdpr_signed = 1,
            gdpr_expiration_date = DATE(DATE_ADD(NOW(), INTERVAL %s MONTH))
         WHERE
            candidate_id = %s
            AND site_id = %s",
        $db->makeQueryInteger($policyMonths),
        $db->makeQueryInteger($request['candidateID']),
        $db->makeQueryInteger($request['siteID'])
    ));

    renderConsentPage(array(
        'title' => 'Consent Recorded',
        'message' => 'Thank you. Your consent has been recorded.',
        'showForm' => false,
        'siteName' => $request['siteName'],
        'token' => $token,
        'currentLang' => $currentLang,
        'noticeTitle' => $notice['title'],
        'noticeBody' => $notice['bodyText'],
        'noticeVersion' => $noticeVersion
    ));
}

if ($action === 'decline')
{
    $updateSQL = sprintf(
        "UPDATE candidate_gdpr_requests
         SET
            status = 'DECLINED',
            declined_at = NOW(),
            declined_ip = %s,
            declined_ua = %s
         WHERE
            request_id = %s
            AND status IN ('CREATED','SENT')
            AND deleted_at IS NULL
            AND (expires_at IS NULL OR expires_at > NOW())",
        $db->makeQueryStringOrNULL($ip),
        $db->makeQueryStringOrNULL($ua),
        $db->makeQueryInteger($request['requestID'])
    );
    $db->query($updateSQL);

    if ($db->getAffectedRows() <= 0)
    {
        renderConsentPage(array(
            'title' => 'Already Processed',
            'message' => 'This consent request is no longer active.',
            'showForm' => false,
            'siteName' => $request['siteName'],
            'token' => $token,
            'currentLang' => $currentLang,
            'noticeTitle' => $notice['title'],
            'noticeBody' => $notice['bodyText'],
            'noticeVersion' => $noticeVersion
        ));
    }

    renderConsentPage(array(
        'title' => 'Consent Declined',
        'message' => 'Your consent has been declined.',
        'showForm' => false,
        'siteName' => $request['siteName'],
        'token' => $token,
        'currentLang' => $currentLang,
        'noticeTitle' => $notice['title'],
        'noticeBody' => $notice['bodyText'],
        'noticeVersion' => $noticeVersion
    ));
}
