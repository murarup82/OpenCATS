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
            'showForm' => false
        ));
    }

    renderConsentPage(array(
        'title' => 'GDPR Consent',
        'message' => '',
        'showForm' => true,
        'token' => $token,
        'siteName' => $request['siteName']
    ));
}

/* POST: Accept or Decline */
$action = isset($_POST['action']) ? $_POST['action'] : '';
if ($action !== 'accept' && $action !== 'decline')
{
    renderConsentPage(array(
        'title' => 'Invalid Request',
        'message' => 'Invalid request.',
        'showForm' => false
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
        'showForm' => false
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
            accepted_ua = %s
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
            'showForm' => false
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
        'showForm' => false
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
            'showForm' => false
        ));
    }

    renderConsentPage(array(
        'title' => 'Consent Declined',
        'message' => 'Your consent has been declined.',
        'showForm' => false
    ));
}
