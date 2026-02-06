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

if (!$interface->isRequiredIDValid('requestID'))
{
    $interface->outputXMLErrorPage(-1, 'Invalid request ID.');
    die();
}

$requestID = (int) $_REQUEST['requestID'];
$db = DatabaseConnection::getInstance();
$siteID = $interface->getSiteID();
$userID = $interface->getUserID();

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
            $body = str_replace('%CANDIDATE_NAME%', htmlspecialchars($fullName), $body);
            $body = str_replace('%CANDFULLNAME%', htmlspecialchars($fullName), $body);
            $body = str_replace('%CANDFIRSTNAME%', htmlspecialchars($safeName), $body);
            $body = str_replace('%CANDIDATEFIRSTNAME%', htmlspecialchars($safeName), $body);
            $body = str_replace('%CONSENT_LINK%', htmlspecialchars($link), $body);
            $body = str_replace('%CONSENTLINK%', htmlspecialchars($link), $body);
            $body = str_replace('%REQUEST_EXPIRES%', htmlspecialchars($requestExpires), $body);
        }
    }

    if (trim($body) === '')
    {
        $body = '';
        $body .= '<p>Hello ' . htmlspecialchars($safeName) . ',</p>';
        $body .= '<p>Please review and respond to our GDPR consent request by clicking the link below:</p>';
        $body .= '<p><a href="' . htmlspecialchars($link) . '">' . htmlspecialchars($link) . '</a></p>';
        if ($requestExpires !== '')
        {
            $body .= '<p>This link expires on ' . htmlspecialchars($requestExpires) . '.</p>';
        }
        $body .= '<p>Thank you,<br />' . htmlspecialchars($siteName) . '</p>';
    }

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
    $status = $mailer->sendToOne(
        array($email, ''),
        $subject,
        $body,
        true,
        true
    );

    if (!$status)
    {
        return array(false, $mailer->getError());
    }

    return array(true, '');
}

$request = fetchRequestRow($db, $siteID, $requestID);
if (empty($request))
{
    $interface->outputXMLErrorPage(-1, 'Request not found.');
    die();
}

$candidateID = (int) $request['candidateID'];
$latestRequestID = fetchLatestRequestID($db, $siteID, $candidateID);
$isLatest = ($latestRequestID === $requestID);
$isExpired = (!empty($request['expiresAt']) && strtotime($request['expiresAt']) <= time());

if ($action === 'resend')
{
    if (!$isLatest)
    {
        $interface->outputXMLErrorPage(-1, 'Only the latest request can be resent.');
        die();
    }

    if (empty($request['candidateExists']))
    {
        $interface->outputXMLErrorPage(-1, 'Candidate no longer exists.');
        die();
    }

    if (!in_array($request['status'], array('CREATED', 'SENT')) || $isExpired || !empty($request['deletedAt']))
    {
        $interface->outputXMLErrorPage(-1, 'Request is not active.');
        die();
    }

    if (empty($request['email1']))
    {
        $interface->outputXMLErrorPage(-1, 'Candidate email is missing.');
        die();
    }

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
            sent_by_user_id = %s
         WHERE
            request_id = %s
            AND site_id = %s",
        $db->makeQueryString($tokenHash),
        $db->makeQueryInteger(GDPR_CONSENT_LINK_DAYS),
        $db->makeQueryInteger($userID),
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

    $interface->outputXMLSuccessPage('Resent.');
    die();
}

if ($action === 'create')
{
    if (!$isLatest)
    {
        $interface->outputXMLErrorPage(-1, 'Only the latest request can be extended.');
        die();
    }

    if (empty($request['candidateExists']))
    {
        $interface->outputXMLErrorPage(-1, 'Candidate no longer exists.');
        die();
    }

    if (empty($request['email1']))
    {
        $interface->outputXMLErrorPage(-1, 'Candidate email is missing.');
        die();
    }

    $token = bin2hex(random_bytes(16));
    $tokenHash = hash('sha256', $token);
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
            (site_id, candidate_id, token_hash, status, created_at, email_sent_at, expires_at, sent_by_user_id)
         VALUES
            (%s, %s, %s, 'SENT', NOW(), NOW(), DATE_ADD(NOW(), INTERVAL %s DAY), %s)",
        $db->makeQueryInteger($siteID),
        $db->makeQueryInteger($candidateID),
        $db->makeQueryString($tokenHash),
        $db->makeQueryInteger(GDPR_CONSENT_LINK_DAYS),
        $db->makeQueryInteger($userID)
    ));

    $newRequestID = $db->getLastInsertID();
    $requestExpires = formatExpiryDate(time() + (GDPR_CONSENT_LINK_DAYS * 86400));

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

        $interface->outputXMLErrorPage(-1, $errorMessage);
        die();
    }

    $interface->outputXMLSuccessPage('Created.');
    die();
}

if ($action === 'expire')
{
    if (!$isLatest)
    {
        $interface->outputXMLErrorPage(-1, 'Only the latest request can be expired.');
        die();
    }

    if (!in_array($request['status'], array('CREATED', 'SENT')) || $isExpired)
    {
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

    $interface->outputXMLSuccessPage('Expired.');
    die();
}

if ($action === 'delete')
{
    if (!$isLatest)
    {
        $interface->outputXMLErrorPage(-1, 'Only the latest request can be deleted.');
        die();
    }

    if ($request['status'] !== 'DECLINED' || !empty($request['deletedAt']))
    {
        $interface->outputXMLErrorPage(-1, 'Candidate is not marked for deletion.');
        die();
    }

    if (empty($request['candidateExists']))
    {
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

    $interface->outputXMLSuccessPage('Deleted.');
    die();
}

$interface->outputXMLErrorPage(-1, 'Unknown action.');

?>
