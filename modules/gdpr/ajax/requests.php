<?php
/*
 * CATS
 * GDPR Requests AJAX Actions
 */

include_once(LEGACY_ROOT . '/lib/Candidates.php');
include_once(LEGACY_ROOT . '/lib/Mailer.php');
include_once(LEGACY_ROOT . '/lib/EmailTemplates.php');
include_once(LEGACY_ROOT . '/lib/CATSUtility.php');
include_once(LEGACY_ROOT . '/lib/Site.php');
include_once(LEGACY_ROOT . '/lib/DateUtility.php');
include_once(LEGACY_ROOT . '/lib/GDPRSettings.php');
include_once(LEGACY_ROOT . '/lib/StringUtility.php');

if (!defined('GDPR_CONSENT_LINK_DAYS'))
{
    define('GDPR_CONSENT_LINK_DAYS', 30);
}

$interface = new SecureAJAXInterface();

if ($_SESSION['CATS']->getAccessLevel('settings.administration') < ACCESS_LEVEL_SA)
{
    $interface->outputXMLErrorPage(-1, 'You do not have permission to access GDPR consents.');
    die();
}

$action = $interface->getTrimmedInput('action');
if ($action === '')
{
    $interface->outputXMLErrorPage(-1, 'No action specified.');
    die();
}

$db = DatabaseConnection::getInstance();
$siteID = $interface->getSiteID();
$userID = $interface->getUserID();

function logGdprEvent($message, $context = array())
{
    $payload = array_merge(
        array(
            'action' => isset($context['action']) ? $context['action'] : '',
            'siteID' => isset($context['siteID']) ? $context['siteID'] : '',
            'userID' => isset($context['userID']) ? $context['userID'] : '',
        ),
        $context
    );

    error_log('GDPR request | ' . $message . ' | ' . json_encode($payload));
}

function fetchRequestRow($db, $siteID, $requestID)
{
    $sql = sprintf(
        "SELECT
            r.request_id AS requestID,
            r.site_id AS siteID,
            r.candidate_id AS candidateID,
            r.status AS status,
            r.expires_at AS expiresAt,
            r.deleted_at AS deletedAt,
            c.candidate_id AS candidateExists,
            c.first_name AS firstName,
            c.last_name AS lastName,
            c.email1 AS email1
         FROM
            candidate_gdpr_requests r
         LEFT JOIN candidate c
            ON c.candidate_id = r.candidate_id
            AND c.site_id = r.site_id
         WHERE
            r.request_id = %s
            AND r.site_id = %s
         LIMIT 1",
        $db->makeQueryInteger($requestID),
        $db->makeQueryInteger($siteID)
    );

    return $db->getAssoc($sql);
}

function fetchLatestRequestID($db, $siteID, $candidateID)
{
    $sql = sprintf(
        "SELECT
            MAX(request_id) AS latestRequestID
         FROM
            candidate_gdpr_requests
         WHERE
            site_id = %s
            AND candidate_id = %s",
        $db->makeQueryInteger($siteID),
        $db->makeQueryInteger($candidateID)
    );

    $row = $db->getAssoc($sql);
    if (empty($row))
    {
        return 0;
    }

    return (int) $row['latestRequestID'];
}

function fetchLatestRequestRow($db, $siteID, $candidateID)
{
    $sql = sprintf(
        "SELECT
            request_id AS requestID,
            status,
            expires_at AS expiresAt,
            deleted_at AS deletedAt
         FROM
            candidate_gdpr_requests
         WHERE
            site_id = %s
            AND candidate_id = %s
         ORDER BY
            request_id DESC
         LIMIT 1",
        $db->makeQueryInteger($siteID),
        $db->makeQueryInteger($candidateID)
    );

    return $db->getAssoc($sql);
}

function fetchCandidateRow($db, $siteID, $candidateID)
{
    $sql = sprintf(
        "SELECT
            candidate_id AS candidateID,
            first_name AS firstName,
            last_name AS lastName,
            email1 AS email1,
            gdpr_signed AS gdprSigned
         FROM
            candidate
         WHERE
            candidate_id = %s
            AND site_id = %s
         LIMIT 1",
        $db->makeQueryInteger($candidateID),
        $db->makeQueryInteger($siteID)
    );

    return $db->getAssoc($sql);
}

function formatExpiryDate($timestamp)
{
    if ($timestamp <= 0)
    {
        return '';
    }

    $format = $_SESSION['CATS']->isDateDMY() ? 'd-m-Y' : 'm-d-Y';
    return DateUtility::getAdjustedDate($format, $timestamp);
}

function buildConsentEmail($firstName, $lastName, $siteName, $link, $requestExpires, $templateRow = array())
{
    $safeName = trim($firstName);
    if ($safeName === '')
    {
        $safeName = 'there';
    }

    $fullName = trim($firstName . ' ' . $lastName);
    if ($fullName === '')
    {
        $fullName = $safeName;
    }

    $subject = 'GDPR Consent Request';
    $body = '';

    if (!empty($templateRow) && isset($templateRow['disabled']) && $templateRow['disabled'] == '0')
    {
        $subject = !empty($templateRow['emailTemplateTitle']) ? $templateRow['emailTemplateTitle'] : $subject;
        $body = '';
        if (!empty($templateRow['textReplaced']))
        {
            $body = $templateRow['textReplaced'];
        }
        else if (!empty($templateRow['text']))
        {
            $body = $templateRow['text'];
        }

        if ($body !== '')
        {
            $body = str_replace('%CANDIDATE_NAME%', $fullName, $body);
            $body = str_replace('%CANDFULLNAME%', $fullName, $body);
            $body = str_replace('%CANDFIRSTNAME%', $safeName, $body);
            $body = str_replace('%CANDIDATEFIRSTNAME%', $safeName, $body);
            $body = str_replace('%CONSENT_LINK%', $link, $body);
            $body = str_replace('%CONSENTLINK%', $link, $body);
            $body = str_replace('%REQUEST_EXPIRES%', $requestExpires, $body);
        }
    }

    if (trim($body) === '')
    {
        $body = "* This is an automated message. Please do not reply. *\n";
        $body .= "%DATETIME%\n\n";
        $body .= "Hello " . $safeName . ",\n\n";
        $body .= "To continue processing your application and storing your personal data,\n";
        $body .= "we need your consent in accordance with GDPR regulations.\n\n";
        $body .= "Please review and respond by clicking the link below:\n";
        $body .= $link . "\n\n";
        if ($requestExpires !== '')
        {
            $body .= "This link will expire on " . $requestExpires . ".\n\n";
        }
        $body .= "Thank you,\n\n";
        $body .= $siteName;
    }

    $body = strip_tags($body);
    $body = str_replace(array("\\r\\n", "\\n", "\\r"), "\n", $body);
    $body = str_replace(array("\r\n", "\r"), "\n", $body);
    $dateFormat = $_SESSION['CATS']->isDateDMY() ? 'd-m-Y' : 'm-d-Y';
    $body = str_replace('%DATETIME%', DateUtility::getAdjustedDate($dateFormat . ' g:i A'), $body);
    $body = str_replace('%SITENAME%', $siteName, $body);

    return array($subject, $body);
}

function sendConsentEmail($siteID, $userID, $email, $firstName, $lastName, $link, $requestExpires)
{
    if (MAIL_MAILER == MAILER_MODE_DISABLED)
    {
        return array(false, 'Email sending is disabled.');
    }

    $siteName = $_SESSION['CATS']->getSiteName();
    $emailTemplates = new EmailTemplates($siteID);
    $templateRow = $emailTemplates->getByTag('GDPR_CONSENT');

    list($subject, $body) = buildConsentEmail($firstName, $lastName, $siteName, $link, $requestExpires, $templateRow);

    $mailer = new Mailer($siteID, $userID);
    $gdprSettings = new GDPRSettings($siteID);
    $gdprSettingsRS = $gdprSettings->getAll();
    $gdprFromAddress = '';
    if (isset($gdprSettingsRS[GDPRSettings::SETTING_FROM_ADDRESS]))
    {
        $gdprFromAddress = trim($gdprSettingsRS[GDPRSettings::SETTING_FROM_ADDRESS]);
    }
    if ($gdprFromAddress !== '' && StringUtility::isEmailAddress($gdprFromAddress))
    {
        $mailer->overrideSetting('fromAddress', $gdprFromAddress);
    }
    $status = $mailer->sendToOne(
        array($email, ''),
        $subject,
        $body,
        false,
        true,
        array(),
        78,
        false
    );

    if (!$status)
    {
        return array(false, $mailer->getError());
    }

    return array(true, '');
}

function createNewRequestAndSend($db, $siteID, $userID, $candidateID, $email, $firstName, $lastName)
{
    $token = bin2hex(random_bytes(16));
    $tokenHash = hash('sha256', $token);
    $emailHash = hash('sha256', strtolower(trim($email)));
    $link = CATSUtility::getAbsoluteURI('gdpr/consent.php?t=' . $token);

    $db->query(sprintf(
        "UPDATE candidate_gdpr_requests
         SET
            status = 'EXPIRED',
            expires_at = NOW()
         WHERE
            site_id = %s
            AND candidate_id = %s
            AND status IN ('CREATED','SENT')
            AND deleted_at IS NULL",
        $db->makeQueryInteger($siteID),
        $db->makeQueryInteger($candidateID)
    ));

    $db->query(sprintf(
        "INSERT INTO candidate_gdpr_requests
            (site_id, candidate_id, token_hash, status, created_at, email_sent_at, expires_at, sent_by_user_id, email_to_hash)
         VALUES
            (%s, %s, %s, 'SENT', NOW(), NOW(), DATE_ADD(NOW(), INTERVAL %s DAY), %s, %s)",
        $db->makeQueryInteger($siteID),
        $db->makeQueryInteger($candidateID),
        $db->makeQueryString($tokenHash),
        $db->makeQueryInteger(GDPR_CONSENT_LINK_DAYS),
        $db->makeQueryInteger($userID),
        $db->makeQueryString($emailHash)
    ));

    $newRequestID = $db->getLastInsertID();
    $requestExpires = formatExpiryDate(time() + (GDPR_CONSENT_LINK_DAYS * 86400));

    list($emailSent, $errorMessage) = sendConsentEmail(
        $siteID,
        $userID,
        $email,
        $firstName,
        $lastName,
        $link,
        $requestExpires
    );

    if (!$emailSent)
    {
        $db->query(sprintf(
            "UPDATE candidate_gdpr_requests
             SET
                status = 'CREATED',
                email_sent_at = NULL,
                sent_by_user_id = NULL
             WHERE
                request_id = %s
                AND site_id = %s",
            $db->makeQueryInteger($newRequestID),
            $db->makeQueryInteger($siteID)
        ));

        return array(false, $errorMessage, $newRequestID);
    }

    return array(true, '', $newRequestID);
}

function isHardDeleteAllowed($requestRow)
{
    if (defined('GDPR_ALLOW_HARD_DELETE') && GDPR_ALLOW_HARD_DELETE === true)
    {
        return true;
    }

    $email = '';
    if (isset($requestRow['email1']))
    {
        $email = strtolower(trim($requestRow['email1']));
    }

    if ($email === '')
    {
        return false;
    }

    if (strpos($email, '+test') !== false)
    {
        return true;
    }

    if (substr($email, -10) === '@gmail.com')
    {
        return true;
    }

    return false;
}

if ($action === 'sendCandidate')
{
    logGdprEvent('sendCandidate: start', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID));
    if (!$interface->isRequiredIDValid('candidateID'))
    {
        logGdprEvent('sendCandidate: invalid candidate ID', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID));
        $interface->outputXMLErrorPage(-1, 'Invalid candidate ID.');
        die();
    }

    $candidateID = (int) $_REQUEST['candidateID'];
    $candidateRow = fetchCandidateRow($db, $siteID, $candidateID);
    if (empty($candidateRow))
    {
        logGdprEvent('sendCandidate: candidate not found', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID, 'candidateID' => $candidateID));
        $interface->outputXMLErrorPage(-1, 'Candidate not found.');
        die();
    }

    if (empty($candidateRow['email1']))
    {
        logGdprEvent('sendCandidate: missing email', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID, 'candidateID' => $candidateID));
        $interface->outputXMLErrorPage(-1, 'Candidate email is missing.');
        die();
    }

    if (!empty($candidateRow['gdprSigned']))
    {
        logGdprEvent('sendCandidate: gdpr already signed', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID, 'candidateID' => $candidateID));
        $interface->outputXMLErrorPage(-1, 'GDPR already signed.');
        die();
    }

    $latestRequestRow = fetchLatestRequestRow($db, $siteID, $candidateID);
    if (
        !empty($latestRequestRow) &&
        $latestRequestRow['status'] === 'DECLINED' &&
        empty($latestRequestRow['deletedAt'])
    ) {
        logGdprEvent('sendCandidate: declined requires deletion', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID, 'candidateID' => $candidateID));
        $interface->outputXMLErrorPage(-1, 'Candidate declined; delete required.');
        die();
    }

    list($emailSent, $errorMessage) = createNewRequestAndSend(
        $db,
        $siteID,
        $userID,
        $candidateID,
        $candidateRow['email1'],
        $candidateRow['firstName'],
        $candidateRow['lastName']
    );

    if (!$emailSent)
    {
        logGdprEvent('sendCandidate: email send failed', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID, 'candidateID' => $candidateID, 'error' => $errorMessage));
        $interface->outputXMLErrorPage(-1, $errorMessage);
        die();
    }

    logGdprEvent('sendCandidate: success', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID, 'candidateID' => $candidateID));
    $interface->outputXMLSuccessPage('Sent.');
    die();
}

if (!$interface->isRequiredIDValid('requestID'))
{
    logGdprEvent('request action: invalid request ID', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID));
    $interface->outputXMLErrorPage(-1, 'Invalid request ID.');
    die();
}

$requestID = (int) $_REQUEST['requestID'];
$request = fetchRequestRow($db, $siteID, $requestID);
if (empty($request))
{
    logGdprEvent('request action: not found', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID, 'requestID' => $requestID));
    $interface->outputXMLErrorPage(-1, 'Request not found.');
    die();
}

$candidateID = (int) $request['candidateID'];
$latestRequestID = fetchLatestRequestID($db, $siteID, $candidateID);
$isLatest = ($latestRequestID === $requestID);
$isExpired = (!empty($request['expiresAt']) && strtotime($request['expiresAt']) <= time());

if ($action === 'deleteRequest')
{
    logGdprEvent('deleteRequest: start', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID, 'requestID' => $requestID, 'candidateID' => $candidateID));
    if ($_SESSION['CATS']->getAccessLevel('settings.administration') < ACCESS_LEVEL_MULTI_SA)
    {
        logGdprEvent('deleteRequest: permission denied', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID, 'requestID' => $requestID));
        $interface->outputXMLErrorPage(-1, 'You do not have permission to hard delete GDPR requests.');
        die();
    }

    if (!isHardDeleteAllowed($request))
    {
        logGdprEvent('deleteRequest: hard delete disabled', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID, 'requestID' => $requestID));
        $interface->outputXMLErrorPage(-1, 'Hard delete disabled outside test mode.');
        die();
    }

    $db->query(sprintf(
        "DELETE FROM candidate_gdpr_requests
         WHERE
            request_id = %s
            AND site_id = %s",
        $db->makeQueryInteger($requestID),
        $db->makeQueryInteger($siteID)
    ));

    logGdprEvent('deleteRequest: success', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID, 'requestID' => $requestID, 'candidateID' => $candidateID));
    $interface->outputXMLSuccessPage('Deleted request.');
    die();
}

if ($action === 'resend')
{
    logGdprEvent('resend: start', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID, 'requestID' => $requestID, 'candidateID' => $candidateID));
    if (!$isLatest)
    {
        logGdprEvent('resend: not latest', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID, 'requestID' => $requestID, 'candidateID' => $candidateID));
        $interface->outputXMLErrorPage(-1, 'Only the latest request can be resent.');
        die();
    }

    if (empty($request['candidateExists']))
    {
        logGdprEvent('resend: candidate missing', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID, 'requestID' => $requestID, 'candidateID' => $candidateID));
        $interface->outputXMLErrorPage(-1, 'Candidate no longer exists.');
        die();
    }

    if (!in_array($request['status'], array('CREATED', 'SENT')) || $isExpired || !empty($request['deletedAt']))
    {
        logGdprEvent('resend: not active', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID, 'requestID' => $requestID, 'candidateID' => $candidateID, 'status' => $request['status']));
        $interface->outputXMLErrorPage(-1, 'Request is not active.');
        die();
    }

    if (empty($request['email1']))
    {
        logGdprEvent('resend: missing email', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID, 'requestID' => $requestID, 'candidateID' => $candidateID));
        $interface->outputXMLErrorPage(-1, 'Candidate email is missing.');
        die();
    }

    $emailHash = hash('sha256', strtolower(trim($request['email1'])));
    $token = bin2hex(random_bytes(16));
    $tokenHash = hash('sha256', $token);
    $link = CATSUtility::getAbsoluteURI('gdpr/consent.php?t=' . $token);

    $db->query(sprintf(
        "UPDATE candidate_gdpr_requests
         SET
            token_hash = %s,
            status = 'SENT',
            email_sent_at = NOW(),
            expires_at = IF(expires_at IS NULL OR expires_at <= NOW(), DATE_ADD(NOW(), INTERVAL %s DAY), expires_at),
            sent_by_user_id = %s,
            email_to_hash = %s
         WHERE
            request_id = %s
            AND site_id = %s",
        $db->makeQueryString($tokenHash),
        $db->makeQueryInteger(GDPR_CONSENT_LINK_DAYS),
        $db->makeQueryInteger($userID),
        $db->makeQueryString($emailHash),
        $db->makeQueryInteger($requestID),
        $db->makeQueryInteger($siteID)
    ));

    $expiresTimestamp = 0;
    if (empty($request['expiresAt']) || $isExpired)
    {
        $expiresTimestamp = time() + (GDPR_CONSENT_LINK_DAYS * 86400);
    }
    else
    {
        $expiresTimestamp = strtotime($request['expiresAt']);
    }
    $requestExpires = formatExpiryDate($expiresTimestamp);

    list($emailSent, $errorMessage) = sendConsentEmail(
        $siteID,
        $userID,
        $request['email1'],
        $request['firstName'],
        $request['lastName'],
        $link,
        $requestExpires
    );

    if (!$emailSent)
    {
        logGdprEvent('resend: email send failed', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID, 'requestID' => $requestID, 'candidateID' => $candidateID, 'error' => $errorMessage));
        $db->query(sprintf(
            "UPDATE candidate_gdpr_requests
             SET
                status = 'CREATED',
                email_sent_at = NULL,
                sent_by_user_id = NULL
             WHERE
                request_id = %s
                AND site_id = %s",
            $db->makeQueryInteger($requestID),
            $db->makeQueryInteger($siteID)
        ));

        $interface->outputXMLErrorPage(-1, $errorMessage);
        die();
    }

    logGdprEvent('resend: success', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID, 'requestID' => $requestID, 'candidateID' => $candidateID));
    $interface->outputXMLSuccessPage('Resent.');
    die();
}

if ($action === 'create')
{
    logGdprEvent('create: start', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID, 'requestID' => $requestID, 'candidateID' => $candidateID));
    if (!$isLatest)
    {
        logGdprEvent('create: not latest', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID, 'requestID' => $requestID, 'candidateID' => $candidateID));
        $interface->outputXMLErrorPage(-1, 'Only the latest request can be extended.');
        die();
    }

    if (empty($request['candidateExists']))
    {
        logGdprEvent('create: candidate missing', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID, 'requestID' => $requestID, 'candidateID' => $candidateID));
        $interface->outputXMLErrorPage(-1, 'Candidate no longer exists.');
        die();
    }

    if (empty($request['email1']))
    {
        logGdprEvent('create: missing email', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID, 'requestID' => $requestID, 'candidateID' => $candidateID));
        $interface->outputXMLErrorPage(-1, 'Candidate email is missing.');
        die();
    }

    list($emailSent, $errorMessage) = createNewRequestAndSend(
        $db,
        $siteID,
        $userID,
        $candidateID,
        $request['email1'],
        $request['firstName'],
        $request['lastName']
    );

    if (!$emailSent)
    {
        logGdprEvent('create: email send failed', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID, 'requestID' => $requestID, 'candidateID' => $candidateID, 'error' => $errorMessage));
        $interface->outputXMLErrorPage(-1, $errorMessage);
        die();
    }

    logGdprEvent('create: success', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID, 'requestID' => $requestID, 'candidateID' => $candidateID));
    $interface->outputXMLSuccessPage('Created.');
    die();
}

if ($action === 'expire')
{
    logGdprEvent('expire: start', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID, 'requestID' => $requestID, 'candidateID' => $candidateID));
    if (!$isLatest)
    {
        logGdprEvent('expire: not latest', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID, 'requestID' => $requestID, 'candidateID' => $candidateID));
        $interface->outputXMLErrorPage(-1, 'Only the latest request can be expired.');
        die();
    }

    if (!in_array($request['status'], array('CREATED', 'SENT')) || $isExpired)
    {
        logGdprEvent('expire: not active', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID, 'requestID' => $requestID, 'candidateID' => $candidateID, 'status' => $request['status']));
        $interface->outputXMLErrorPage(-1, 'Request is not active.');
        die();
    }

    $db->query(sprintf(
        "UPDATE candidate_gdpr_requests
         SET
            status = 'EXPIRED',
            expires_at = NOW()
         WHERE
            request_id = %s
            AND site_id = %s",
        $db->makeQueryInteger($requestID),
        $db->makeQueryInteger($siteID)
    ));

    logGdprEvent('expire: success', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID, 'requestID' => $requestID, 'candidateID' => $candidateID));
    $interface->outputXMLSuccessPage('Expired.');
    die();
}

if ($action === 'delete')
{
    logGdprEvent('delete: start', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID, 'requestID' => $requestID, 'candidateID' => $candidateID));
    if (!$isLatest)
    {
        logGdprEvent('delete: not latest', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID, 'requestID' => $requestID, 'candidateID' => $candidateID));
        $interface->outputXMLErrorPage(-1, 'Only the latest request can be deleted.');
        die();
    }

    if ($request['status'] !== 'DECLINED' || !empty($request['deletedAt']))
    {
        logGdprEvent('delete: not eligible', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID, 'requestID' => $requestID, 'candidateID' => $candidateID, 'status' => $request['status']));
        $interface->outputXMLErrorPage(-1, 'Candidate is not marked for deletion.');
        die();
    }

    if (empty($request['candidateExists']))
    {
        logGdprEvent('delete: candidate missing', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID, 'requestID' => $requestID, 'candidateID' => $candidateID));
        $interface->outputXMLErrorPage(-1, 'Candidate no longer exists.');
        die();
    }

    $db->query('BEGIN');
    $db->setInTransaction(true);

    $db->query(sprintf(
        "DELETE FROM activity
         WHERE
            data_item_type = %s
            AND data_item_id = %s
            AND site_id = %s",
        DATA_ITEM_CANDIDATE,
        $db->makeQueryInteger($candidateID),
        $db->makeQueryInteger($siteID)
    ));

    $db->query(sprintf(
        "DELETE FROM candidate_tag
         WHERE
            candidate_id = %s
            AND site_id = %s",
        $db->makeQueryInteger($candidateID),
        $db->makeQueryInteger($siteID)
    ));

    $db->query(sprintf(
        "DELETE FROM career_portal_questionnaire_history
         WHERE
            candidate_id = %s
            AND site_id = %s",
        $db->makeQueryInteger($candidateID),
        $db->makeQueryInteger($siteID)
    ));

    $db->query(sprintf(
        "DELETE status_history_rejection_reason
         FROM status_history_rejection_reason
         INNER JOIN candidate_joborder_status_history
            ON candidate_joborder_status_history.candidate_joborder_status_history_id = status_history_rejection_reason.status_history_id
         WHERE
            candidate_joborder_status_history.candidate_id = %s
            AND candidate_joborder_status_history.site_id = %s",
        $db->makeQueryInteger($candidateID),
        $db->makeQueryInteger($siteID)
    ));

    if (!empty($request['email1']))
    {
        $db->query(sprintf(
            "UPDATE email_history
             SET recipients = REPLACE(recipients, %s, '[deleted]')
             WHERE
                site_id = %s
                AND recipients LIKE %s",
            $db->makeQueryString($request['email1']),
            $db->makeQueryInteger($siteID),
            $db->makeQueryString('%' . $request['email1'] . '%')
        ));
    }

    $candidates = new Candidates($siteID);
    $candidates->delete($candidateID);

    $db->query(sprintf(
        "UPDATE candidate_gdpr_requests
         SET
            deleted_at = NOW(),
            deleted_by_user_id = %s
         WHERE
            request_id = %s
            AND site_id = %s",
        $db->makeQueryInteger($userID),
        $db->makeQueryInteger($requestID),
        $db->makeQueryInteger($siteID)
    ));

    $db->query('COMMIT');
    $db->setInTransaction(false);

    logGdprEvent('delete: success', array('action' => $action, 'siteID' => $siteID, 'userID' => $userID, 'requestID' => $requestID, 'candidateID' => $candidateID));
    $interface->outputXMLSuccessPage('Deleted.');
    die();
}

$logContext = array('action' => $action, 'siteID' => $siteID, 'userID' => $userID, 'requestID' => isset($requestID) ? $requestID : null);
logGdprEvent('unknown action', $logContext);
$interface->outputXMLErrorPage(-1, 'Unknown action.');

?>
