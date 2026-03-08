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

function resolveConsentLanguage($allowedLangs)
{
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
    if ($langParam !== '')
    {
        return $langParam;
    }
    if ($langHeader !== '')
    {
        return $langHeader;
    }

    return 'en';
}

function getConsentCopy($lang)
{
    $copy = array(
        'en' => array(
            'invalidLinkTitle' => 'Invalid Consent Link',
            'invalidLinkMessage' => 'This consent link is invalid or has expired.',
            'gdprConsentTitle' => 'GDPR Consent',
            'consentLinkExpiredTitle' => 'Consent Link Expired',
            'consentRequestInactiveMessage' => 'This consent request is no longer active.',
            'alreadyProcessedTitle' => 'Already Processed',
            'consentAlreadyAcceptedMessage' => 'This consent request has already been accepted.',
            'consentAlreadyDeclinedMessage' => 'This consent request has already been declined.',
            'requestCanceledTitle' => 'Request Canceled',
            'consentRequestCanceledMessage' => 'This consent request has been canceled.',
            'consentLinkExpiredMessage' => 'This consent link has expired.',
            'invalidRequestTitle' => 'Invalid Request',
            'invalidRequestMessage' => 'Invalid request.',
            'consentRecordedTitle' => 'Consent Recorded',
            'consentRecordedMessage' => 'Thank you. Your consent has been recorded.',
            'consentDeclinedTitle' => 'Consent Declined',
            'consentDeclinedMessage' => 'Your consent has been declined.',
            'ui' => array(
                'eyebrow' => 'Privacy Consent',
                'securePublicLink' => 'Secure Public Link',
                'intro' => 'Review the notice below and choose whether you consent to data processing for recruitment activities.',
                'languageLabel' => 'Language',
                'languageNavLabel' => 'Choose consent language',
                'acceptButton' => 'Accept Consent',
                'declineButton' => 'Decline',
                'footnote' => 'This consent link expires automatically if no response is submitted.'
            )
        ),
        'ro' => array(
            'invalidLinkTitle' => 'Link de consimtamant invalid',
            'invalidLinkMessage' => 'Acest link de consimtamant este invalid sau a expirat.',
            'gdprConsentTitle' => 'Consimtamant GDPR',
            'consentLinkExpiredTitle' => 'Link de consimtamant expirat',
            'consentRequestInactiveMessage' => 'Aceasta solicitare de consimtamant nu mai este activa.',
            'alreadyProcessedTitle' => 'Deja procesat',
            'consentAlreadyAcceptedMessage' => 'Aceasta solicitare de consimtamant a fost deja acceptata.',
            'consentAlreadyDeclinedMessage' => 'Aceasta solicitare de consimtamant a fost deja refuzata.',
            'requestCanceledTitle' => 'Solicitare anulata',
            'consentRequestCanceledMessage' => 'Aceasta solicitare de consimtamant a fost anulata.',
            'consentLinkExpiredMessage' => 'Acest link de consimtamant a expirat.',
            'invalidRequestTitle' => 'Cerere invalida',
            'invalidRequestMessage' => 'Cerere invalida.',
            'consentRecordedTitle' => 'Consimtamant inregistrat',
            'consentRecordedMessage' => 'Multumim. Consimtamantul a fost inregistrat.',
            'consentDeclinedTitle' => 'Consimtamant refuzat',
            'consentDeclinedMessage' => 'Consimtamantul a fost refuzat.',
            'ui' => array(
                'eyebrow' => 'Consimtamant GDPR',
                'securePublicLink' => 'Link public securizat',
                'intro' => 'Revizuiti notificarea de mai jos si alegeti daca sunteti de acord cu prelucrarea datelor pentru activitati de recrutare.',
                'languageLabel' => 'Limba',
                'languageNavLabel' => 'Alegeti limba consimtamantului',
                'acceptButton' => 'Accept consimtamantul',
                'declineButton' => 'Refuz',
                'footnote' => 'Acest link de consimtamant expira automat daca nu este trimis niciun raspuns.'
            )
        ),
        'fr' => array(
            'invalidLinkTitle' => 'Lien de consentement invalide',
            'invalidLinkMessage' => 'Ce lien de consentement est invalide ou a expire.',
            'gdprConsentTitle' => 'Consentement RGPD',
            'consentLinkExpiredTitle' => 'Lien de consentement expire',
            'consentRequestInactiveMessage' => 'Cette demande de consentement n est plus active.',
            'alreadyProcessedTitle' => 'Deja traite',
            'consentAlreadyAcceptedMessage' => 'Cette demande de consentement a deja ete acceptee.',
            'consentAlreadyDeclinedMessage' => 'Cette demande de consentement a deja ete refusee.',
            'requestCanceledTitle' => 'Demande annulee',
            'consentRequestCanceledMessage' => 'Cette demande de consentement a ete annulee.',
            'consentLinkExpiredMessage' => 'Ce lien de consentement a expire.',
            'invalidRequestTitle' => 'Requete invalide',
            'invalidRequestMessage' => 'Requete invalide.',
            'consentRecordedTitle' => 'Consentement enregistre',
            'consentRecordedMessage' => 'Merci. Votre consentement a ete enregistre.',
            'consentDeclinedTitle' => 'Consentement refuse',
            'consentDeclinedMessage' => 'Votre consentement a ete refuse.',
            'ui' => array(
                'eyebrow' => 'Consentement RGPD',
                'securePublicLink' => 'Lien public securise',
                'intro' => 'Consultez la notice ci-dessous et choisissez si vous consentez au traitement des donnees pour les activites de recrutement.',
                'languageLabel' => 'Langue',
                'languageNavLabel' => 'Choisissez la langue du consentement',
                'acceptButton' => 'Accepter le consentement',
                'declineButton' => 'Refuser',
                'footnote' => 'Ce lien de consentement expire automatiquement si aucune reponse n est envoyee.'
            )
        )
    );

    if (!isset($copy[$lang]))
    {
        return $copy['en'];
    }

    return $copy[$lang];
}

function getInactiveStatePresentation($stateName, $consentCopy)
{
    if ($stateName === 'accepted')
    {
        return array(
            'title' => $consentCopy['alreadyProcessedTitle'],
            'message' => $consentCopy['consentAlreadyAcceptedMessage'],
            'messageTone' => 'success',
            'isAlert' => false
        );
    }

    if ($stateName === 'declined')
    {
        return array(
            'title' => $consentCopy['alreadyProcessedTitle'],
            'message' => $consentCopy['consentAlreadyDeclinedMessage'],
            'messageTone' => 'warning',
            'isAlert' => false
        );
    }

    if ($stateName === 'canceled')
    {
        return array(
            'title' => $consentCopy['requestCanceledTitle'],
            'message' => $consentCopy['consentRequestCanceledMessage'],
            'messageTone' => 'warning',
            'isAlert' => true
        );
    }

    if ($stateName === 'expired')
    {
        return array(
            'title' => $consentCopy['consentLinkExpiredTitle'],
            'message' => $consentCopy['consentLinkExpiredMessage'],
            'messageTone' => 'warning',
            'isAlert' => true
        );
    }

    return array(
        'title' => $consentCopy['consentLinkExpiredTitle'],
        'message' => $consentCopy['consentRequestInactiveMessage'],
        'messageTone' => 'warning',
        'isAlert' => true
    );
}

function getConsentFormAction()
{
    if (!empty($_SERVER['SCRIPT_NAME']))
    {
        return (string) $_SERVER['SCRIPT_NAME'];
    }
    if (!empty($_SERVER['PHP_SELF']))
    {
        return (string) $_SERVER['PHP_SELF'];
    }
    return 'consent.php';
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

function renderConsentView($vars, $consentCopy)
{
    $defaults = array(
        'title' => $consentCopy['gdprConsentTitle'],
        'message' => '',
        'showForm' => false,
        'siteName' => '',
        'token' => '',
        'currentLang' => 'en',
        'noticeTitle' => '',
        'noticeBody' => '',
        'noticeVersion' => '',
        'messageTone' => 'info',
        'isAlert' => false,
        'uiCopy' => $consentCopy['ui'],
        'formAction' => getConsentFormAction()
    );

    renderConsentPage(array_merge($defaults, $vars));
}

$allowedLangs = array('ro', 'en', 'fr');
$currentLang = resolveConsentLanguage($allowedLangs);
$consentCopy = getConsentCopy($currentLang);

$token = '';
if (isset($_GET['t'])) $token = (string) $_GET['t'];
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['t']))
{
    $token = (string) $_POST['t'];
}

if ($token === '')
{
    renderConsentView(array(
        'title' => $consentCopy['invalidLinkTitle'],
        'message' => $consentCopy['invalidLinkMessage'],
        'messageTone' => 'warning',
        'isAlert' => true,
        'currentLang' => $currentLang
    ), $consentCopy);
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
    renderConsentView(array(
        'title' => $consentCopy['invalidLinkTitle'],
        'message' => $consentCopy['invalidLinkMessage'],
        'messageTone' => 'warning',
        'isAlert' => true,
        'currentLang' => $currentLang
    ), $consentCopy);
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

$notice = getNoticeForLang($db, $request['siteID'], $currentLang);
if (empty($notice) && $currentLang !== 'en')
{
    $notice = getNoticeForLang($db, $request['siteID'], 'en');
    $currentLang = 'en';
    $consentCopy = getConsentCopy($currentLang);
}
if (empty($notice))
{
    $notice = array(
        'title' => $consentCopy['gdprConsentTitle'],
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

$pageContext = array(
    'siteName' => $request['siteName'],
    'token' => $token,
    'currentLang' => $currentLang,
    'noticeTitle' => $notice['title'],
    'noticeBody' => $notice['bodyText'],
    'noticeVersion' => $noticeVersion
);

if ($_SERVER['REQUEST_METHOD'] === 'GET')
{
    if (!$isActive)
    {
        $inactive = getInactiveStatePresentation($state['state'], $consentCopy);

        renderConsentView(array_merge($pageContext, array(
            'title' => $inactive['title'],
            'message' => $inactive['message'],
            'showForm' => false,
            'messageTone' => $inactive['messageTone'],
            'isAlert' => $inactive['isAlert']
        )), $consentCopy);
    }

    renderConsentView(array_merge($pageContext, array(
        'title' => $consentCopy['gdprConsentTitle'],
        'showForm' => true,
        'messageTone' => 'info',
        'isAlert' => false
    )), $consentCopy);
}

/* POST: Accept or Decline */
$action = isset($_POST['action']) ? $_POST['action'] : '';
if ($action !== 'accept' && $action !== 'decline')
{
    renderConsentView(array_merge($pageContext, array(
        'title' => $consentCopy['invalidRequestTitle'],
        'message' => $consentCopy['invalidRequestMessage'],
        'showForm' => false,
        'messageTone' => 'warning',
        'isAlert' => true
    )), $consentCopy);
}

if (!$isActive)
{
    $inactive = getInactiveStatePresentation($state['state'], $consentCopy);

    renderConsentView(array_merge($pageContext, array(
        'title' => $inactive['title'],
        'message' => $inactive['message'],
        'showForm' => false,
        'messageTone' => $inactive['messageTone'],
        'isAlert' => $inactive['isAlert']
    )), $consentCopy);
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
        renderConsentView(array_merge($pageContext, array(
            'title' => $consentCopy['alreadyProcessedTitle'],
            'message' => $consentCopy['consentRequestInactiveMessage'],
            'showForm' => false,
            'messageTone' => 'warning',
            'isAlert' => true
        )), $consentCopy);
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

    renderConsentView(array_merge($pageContext, array(
        'title' => $consentCopy['consentRecordedTitle'],
        'message' => $consentCopy['consentRecordedMessage'],
        'showForm' => false,
        'messageTone' => 'success',
        'isAlert' => false
    )), $consentCopy);
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
        renderConsentView(array_merge($pageContext, array(
            'title' => $consentCopy['alreadyProcessedTitle'],
            'message' => $consentCopy['consentRequestInactiveMessage'],
            'showForm' => false,
            'messageTone' => 'warning',
            'isAlert' => true
        )), $consentCopy);
    }

    renderConsentView(array_merge($pageContext, array(
        'title' => $consentCopy['consentDeclinedTitle'],
        'message' => $consentCopy['consentDeclinedMessage'],
        'showForm' => false,
        'messageTone' => 'warning',
        'isAlert' => false
    )), $consentCopy);
}
