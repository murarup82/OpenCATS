<?php
/*
 * CATS
 * AJAX TalentFitFlow Transform Interface
 */

include_once(LEGACY_ROOT . '/lib/Candidates.php');
include_once(LEGACY_ROOT . '/lib/Attachments.php');
include_once(LEGACY_ROOT . '/lib/JobOrders.php');
include_once(LEGACY_ROOT . '/lib/FileUtility.php');
include_once(LEGACY_ROOT . '/lib/TalentFitFlowClient.php');
include_once(LEGACY_ROOT . '/lib/TalentFitFlowSettings.php');

function logTalentFitFlowError($message, $context = array())
{
    $payload = $message;
    if (!empty($context))
    {
        if (function_exists('json_encode'))
        {
            $encoded = json_encode($context);
            if ($encoded !== false)
            {
                $payload .= ' | ' . $encoded;
            }
            else
            {
                $payload .= ' | (context_encode_failed)';
            }
        }
        else
        {
            $payload .= ' | (context_unavailable)';
        }
    }
    error_log($payload);
}

function rewriteTalentFitFlowDownloadUrl($downloadUrl, $baseUrl)
{
    $downloadUrl = trim((string) $downloadUrl);
    $baseUrl = trim((string) $baseUrl);
    if ($downloadUrl === '' || $baseUrl === '')
    {
        return $downloadUrl;
    }

    $downloadParts = parse_url($downloadUrl);
    $baseParts = parse_url($baseUrl);
    if ($downloadParts === false || $baseParts === false)
    {
        return $downloadUrl;
    }

    if (!isset($downloadParts['path']))
    {
        return $downloadUrl;
    }

    $host = isset($baseParts['host']) ? $baseParts['host'] : '';
    if ($host === '')
    {
        return $downloadUrl;
    }

    $scheme = isset($baseParts['scheme']) ? $baseParts['scheme'] : 'https';
    $port = isset($baseParts['port']) ? ':' . $baseParts['port'] : '';
    $path = $downloadParts['path'];
    $query = isset($downloadParts['query']) ? '?' . $downloadParts['query'] : '';
    $fragment = isset($downloadParts['fragment']) ? '#' . $downloadParts['fragment'] : '';

    return $scheme . '://' . $host . $port . $path . $query . $fragment;
}

function sanitizeTransformFilenameComponent($value)
{
    $value = trim((string) $value);
    if ($value === '')
    {
        return '';
    }

    $value = preg_replace('/\s+/', '_', $value);
    $value = preg_replace('/[^A-Za-z0-9_.+-]/', '_', $value);
    $value = preg_replace('/_+/', '_', $value);
    $value = trim($value, '._');

    return $value;
}

function stripLeadingNumericPrefix($value)
{
    $value = trim((string) $value);
    if ($value === '')
    {
        return '';
    }

    return preg_replace('/^\s*\d+(?:[.\/-]\d+)*\s*[.\-–—:]*\s*/', '', $value);
}

function normalizeJobTitleForFilename($jobTitle)
{
    $jobTitle = trim((string) $jobTitle);
    if ($jobTitle === '')
    {
        return '';
    }

    $jobTitle = html_entity_decode($jobTitle, ENT_QUOTES);
    $jobTitle = stripLeadingNumericPrefix($jobTitle);
    $jobTitle = str_replace('&', ' and ', $jobTitle);
    $jobTitle = str_replace(array('-', '–', '—', '/', '\\'), ' ', $jobTitle);
    $jobTitle = str_replace(array('(', ')', '[', ']', '{', '}', ':', ';', ','), ' ', $jobTitle);
    $jobTitle = preg_replace('/\s+/', ' ', $jobTitle);
    $jobTitle = trim($jobTitle);

    if ($jobTitle === '')
    {
        return '';
    }

    $jobTitle = preg_replace('/\s+/', '_', $jobTitle);
    $jobTitle = preg_replace('/[^A-Za-z0-9_.+]/', '_', $jobTitle);
    $jobTitle = preg_replace('/_+/', '_', $jobTitle);
    $jobTitle = trim($jobTitle, '._');

    return $jobTitle;
}

function buildCandidateCvFilename($candidate, $extension)
{
    $parts = array();
    $firstName = isset($candidate['firstName']) ? $candidate['firstName'] : '';
    $lastName = isset($candidate['lastName']) ? $candidate['lastName'] : '';

    $firstName = sanitizeTransformFilenameComponent($firstName);
    $lastName = sanitizeTransformFilenameComponent($lastName);

    if ($firstName !== '')
    {
        $parts[] = $firstName;
    }
    if ($lastName !== '')
    {
        $parts[] = $lastName;
    }

    if (empty($parts) && isset($candidate['candidateID']))
    {
        $parts[] = 'Candidate_' . (int) $candidate['candidateID'];
    }

    $extension = trim((string) $extension);
    if ($extension === '')
    {
        $extension = 'pdf';
    }

    $filename = 'CV_' . implode('_', $parts) . '.' . $extension;

    return FileUtility::makeSafeFilename($filename);
}

function buildTransformFilename($candidate, $jobOrder)
{
    $candidateParts = array();
    $firstName = isset($candidate['firstName']) ? $candidate['firstName'] : '';
    $lastName = isset($candidate['lastName']) ? $candidate['lastName'] : '';
    $firstName = sanitizeTransformFilenameComponent($firstName);
    $lastName = sanitizeTransformFilenameComponent($lastName);
    if ($firstName !== '')
    {
        $candidateParts[] = $firstName;
    }
    if ($lastName !== '')
    {
        $candidateParts[] = $lastName;
    }
    if (empty($candidateParts) && isset($candidate['candidateID']))
    {
        $candidateParts[] = 'Candidate_' . (int) $candidate['candidateID'];
    }

    $filenameParts = array('CV_' . implode('_', $candidateParts));

    $jobTitle = isset($jobOrder['title']) ? $jobOrder['title'] : '';
    $jobTitle = normalizeJobTitleForFilename($jobTitle);
    if ($jobTitle !== '')
    {
        $filenameParts[] = $jobTitle;
    }

    $companyName = isset($jobOrder['companyName']) ? $jobOrder['companyName'] : '';
    if ($companyName !== '')
    {
        $companyName = html_entity_decode($companyName, ENT_QUOTES);
        $companyName = sanitizeTransformFilenameComponent($companyName);
        if ($companyName !== '')
        {
            $filenameParts[] = $companyName;
        }
    }

    $filename = implode('-', $filenameParts) . '.docx';

    return FileUtility::makeSafeFilename($filename);
}

function buildTransformTempPath($filename)
{
    $filename = FileUtility::makeSafeFilename($filename);
    $tempPath = CATS_TEMP_DIR . '/' . $filename;

    if (file_exists($tempPath))
    {
        $baseName = FileUtility::getFileWithoutExtension($filename);
        $tempPath = CATS_TEMP_DIR . '/' . FileUtility::makeSafeFilename($baseName . '_' . time() . '.docx');
    }

    return $tempPath;
}

function buildTalentFitFlowRequestLogContext($client, $cvFilePath, $cvFileName, $jdFilePath, $jdText, $candidateID, $jobOrderID, $jobOrder, $language, $roleType, $languageFolder)
{
    $context = array(
        'baseUrl' => $client->getBaseUrl(),
        'candidateId' => $candidateID,
        'jobOrderId' => $jobOrderID,
        'jobOrderTitle' => isset($jobOrder['title']) ? $jobOrder['title'] : '',
        'jobOrderCompany' => isset($jobOrder['companyName']) ? $jobOrder['companyName'] : '',
        'cvFileName' => $cvFileName,
        'cvFilePath' => $cvFilePath,
        'cvFileSize' => @filesize($cvFilePath),
        'cvFileHash' => (is_readable($cvFilePath) ? hash_file('sha256', $cvFilePath) : ''),
        'jdMode' => ($jdFilePath !== '' ? 'file' : ($jdText !== '' ? 'text' : 'none')),
        'jdFilePath' => $jdFilePath,
        'jdFileSize' => ($jdFilePath !== '' ? @filesize($jdFilePath) : 0),
        'jdFileHash' => ($jdFilePath !== '' && is_readable($jdFilePath) ? hash_file('sha256', $jdFilePath) : ''),
        'jdTextLength' => ($jdText !== '' ? strlen($jdText) : 0),
        'jdTextHash' => ($jdText !== '' ? hash('sha256', $jdText) : ''),
        'language' => $language,
        'languageFolder' => $languageFolder,
        'roleType' => $roleType,
        'companyId' => isset($jobOrder['companyID']) ? $jobOrder['companyID'] : ''
    );

    return $context;
}

$interface = new SecureAJAXInterface();

if ($_SESSION['CATS']->getAccessLevel('candidates.show') < ACCESS_LEVEL_READ)
{
    $interface->outputXMLErrorPage(-1, 'Invalid user level for action.');
    die();
}

if ($_SESSION['CATS']->getAccessLevel('joborders.show') < ACCESS_LEVEL_READ)
{
    $interface->outputXMLErrorPage(-1, 'Invalid user level for action.');
    die();
}

$action = isset($_REQUEST['action']) ? trim($_REQUEST['action']) : '';
if ($action === '')
{
    $interface->outputXMLErrorPage(-1, 'Invalid action.');
    die();
}

$settings = new TalentFitFlowSettings($interface->getSiteID());
$settingsRS = $settings->getAll();

$client = new TalentFitFlowClient(
    ($settingsRS['baseUrl'] !== '') ? $settingsRS['baseUrl'] : null,
    ($settingsRS['apiKey'] !== '') ? $settingsRS['apiKey'] : null,
    ($settingsRS['hmacSecret'] !== '') ? $settingsRS['hmacSecret'] : null
);
if (!$client->isConfigured())
{
    $interface->outputXMLErrorPage(-1, 'TalentFitFlow is not configured.');
    die();
}

if ($action === 'status')
{
    $jobId = isset($_REQUEST['jobId']) ? trim($_REQUEST['jobId']) : '';
    if ($jobId === '')
    {
        $interface->outputXMLErrorPage(-1, 'Invalid job ID.');
        die();
    }

    $status = $client->getTransformStatus($jobId);
    if ($status === false)
    {
        logTalentFitFlowError('TalentFitFlow status failed', array(
            'jobId' => $jobId,
            'error' => $client->getLastError()
        ));
        $interface->outputXMLErrorPage(-1, $client->getLastError());
        die();
    }

    $output =
        "<data>\n" .
        "    <errorcode>0</errorcode>\n" .
        "    <errormessage></errormessage>\n" .
        "    <status>" . htmlspecialchars($status['status'], ENT_QUOTES) . "</status>\n";

    if (isset($status['error_code']))
    {
        $output .= "    <error_code>" . htmlspecialchars($status['error_code'], ENT_QUOTES) . "</error_code>\n";
    }
    if (isset($status['error_message']))
    {
        $output .= "    <error_message>" . htmlspecialchars($status['error_message'], ENT_QUOTES) . "</error_message>\n";
    }
    if (isset($status['cv_download_url']))
    {
        $downloadUrl = rewriteTalentFitFlowDownloadUrl($status['cv_download_url'], $client->getBaseUrl());
        $output .= "    <cv_download_url>" . htmlspecialchars($downloadUrl, ENT_QUOTES) . "</cv_download_url>\n";
    }

    $output .=
        "</data>\n";

    $interface->outputXMLPage($output);
    die();
}

if ($action !== 'create' && $action !== 'store')
{
    $interface->outputXMLErrorPage(-1, 'Invalid action.');
    die();
}

if ($action === 'store')
{
    if ($_SESSION['CATS']->getAccessLevel('candidates.createAttachment') < ACCESS_LEVEL_EDIT)
    {
        $interface->outputXMLErrorPage(-1, 'Invalid user level for action.');
        die();
    }
}

if (!$interface->isRequiredIDValid('candidateID'))
{
    $interface->outputXMLErrorPage(-1, 'Invalid candidate ID.');
    die();
}

if (!$interface->isRequiredIDValid('attachmentID'))
{
    $interface->outputXMLErrorPage(-1, 'Invalid attachment ID.');
    die();
}

if (!$interface->isRequiredIDValid('jobOrderID'))
{
    $interface->outputXMLErrorPage(-1, 'Invalid job order ID.');
    die();
}

$siteID = $interface->getSiteID();
$candidateID = (int) $_REQUEST['candidateID'];
$attachmentID = (int) $_REQUEST['attachmentID'];
$jobOrderID = (int) $_REQUEST['jobOrderID'];
$language = isset($_REQUEST['language']) ? trim($_REQUEST['language']) : '';
$roleType = isset($_REQUEST['roleType']) ? trim($_REQUEST['roleType']) : '';
$languageFolder = isset($_REQUEST['languageFolder']) ? trim($_REQUEST['languageFolder']) : '';

$candidates = new Candidates($siteID);
$candidate = $candidates->get($candidateID);
if (empty($candidate))
{
    $interface->outputXMLErrorPage(-1, 'Candidate not found.');
    die();
}

$attachments = new Attachments($siteID);
$attachment = $attachments->get($attachmentID);
if (empty($attachment) ||
    (int) $attachment['dataItemType'] !== DATA_ITEM_CANDIDATE ||
    (int) $attachment['dataItemID'] !== $candidateID)
{
    $interface->outputXMLErrorPage(-1, 'Attachment not found for candidate.');
    die();
}

$allowedExtensions = array('pdf', 'docx', 'txt');
$attachmentExtension = strtolower(FileUtility::getFileExtension($attachment['originalFilename']));
if (!in_array($attachmentExtension, $allowedExtensions, true))
{
    $interface->outputXMLErrorPage(-1, 'Attachment file type is not supported.');
    die();
}

$attachments->forceAttachmentLocal($attachmentID);
$cvFilePath = sprintf(
    'attachments/%s/%s',
    $attachment['directoryName'],
    $attachment['storedFilename']
);
if (!is_readable($cvFilePath))
{
    $interface->outputXMLErrorPage(-1, 'CV file is not available.');
    die();
}

$jobOrders = new JobOrders($siteID);
$jobOrder = $jobOrders->get($jobOrderID);
if (empty($jobOrder))
{
    $interface->outputXMLErrorPage(-1, 'Job order not found.');
    die();
}

$jobId = '';
if ($action === 'store')
{
    $jobId = isset($_REQUEST['jobId']) ? trim($_REQUEST['jobId']) : '';
    if ($jobId === '')
    {
        $interface->outputXMLErrorPage(-1, 'Invalid job ID.');
        die();
    }

    $status = $client->getTransformStatus($jobId);
    if ($status === false)
    {
        logTalentFitFlowError('TalentFitFlow status failed', array(
            'jobId' => $jobId,
            'error' => $client->getLastError()
        ));
        $interface->outputXMLErrorPage(-1, $client->getLastError());
        die();
    }

    if (!isset($status['status']) || $status['status'] !== 'COMPLETED')
    {
        $interface->outputXMLErrorPage(-1, 'Transform job is not completed.');
        die();
    }

    if (empty($status['cv_download_url']))
    {
        $interface->outputXMLErrorPage(-1, 'Download URL is missing.');
        die();
    }

    $downloadUrl = rewriteTalentFitFlowDownloadUrl($status['cv_download_url'], $client->getBaseUrl());
    $filename = buildTransformFilename($candidate, $jobOrder);
    $tempPath = buildTransformTempPath($filename);

    $downloadResponse = $client->downloadTransformedCv($downloadUrl, $tempPath);
    if ($downloadResponse === false)
    {
        logTalentFitFlowError('TalentFitFlow download failed', array(
            'jobId' => $jobId,
            'downloadUrl' => $downloadUrl,
            'error' => $client->getLastError()
        ));
        $interface->outputXMLErrorPage(-1, $client->getLastError());
        die();
    }

    $contentType = '';
    if (isset($downloadResponse['headers']) && isset($downloadResponse['headers']['Content-Type']))
    {
        $contentType = $downloadResponse['headers']['Content-Type'];
    }

    $attachmentCreator = new AttachmentCreator($siteID);
    $created = $attachmentCreator->createFromFile(
        DATA_ITEM_CANDIDATE,
        $candidateID,
        $tempPath,
        $filename,
        $contentType,
        true,
        true
    );

    if (!$created)
    {
        if ($attachmentCreator->duplicatesOccurred())
        {
            $interface->outputXMLErrorPage(-1, 'Attachment already exists.');
            die();
        }

        $errorMessage = $attachmentCreator->isError()
            ? $attachmentCreator->getError()
            : 'Failed to store attachment.';

        logTalentFitFlowError('TalentFitFlow attachment create failed', array(
            'jobId' => $jobId,
            'candidateId' => $candidateID,
            'attachmentId' => $attachmentID,
            'jobOrderId' => $jobOrderID,
            'error' => $errorMessage
        ));

        if (file_exists($tempPath))
        {
            @unlink($tempPath);
        }

        $interface->outputXMLErrorPage(-1, $errorMessage);
        die();
    }

    $newAttachmentID = $attachmentCreator->getAttachmentID();
    $newAttachment = $attachments->get($newAttachmentID);

    $output =
        "<data>\n" .
        "    <errorcode>0</errorcode>\n" .
        "    <errormessage></errormessage>\n" .
        "    <attachment_id>" . htmlspecialchars($newAttachmentID, ENT_QUOTES) . "</attachment_id>\n" .
        "    <attachment_filename>" . htmlspecialchars($filename, ENT_QUOTES) . "</attachment_filename>\n";

    if (isset($newAttachment['retrievalURL']))
    {
        $output .= "    <retrieval_url>" . htmlspecialchars($newAttachment['retrievalURL'], ENT_QUOTES) . "</retrieval_url>\n";
    }

    $output .=
        "</data>\n";

    $interface->outputXMLPage($output);
    die();
}

$jdFilePath = '';
$jdText = '';
$jobOrderAttachments = $attachments->getAll(DATA_ITEM_JOBORDER, $jobOrderID);
foreach ($jobOrderAttachments as $jobOrderAttachment)
{
    $attachmentExtension = strtolower(FileUtility::getFileExtension($jobOrderAttachment['originalFilename']));
    if (!in_array($attachmentExtension, $allowedExtensions, true))
    {
        continue;
    }

    $attachments->forceAttachmentLocal($jobOrderAttachment['attachmentID']);
    $candidateFilePath = sprintf(
        'attachments/%s/%s',
        $jobOrderAttachment['directoryName'],
        $jobOrderAttachment['storedFilename']
    );
    if (is_readable($candidateFilePath))
    {
        $fileSize = @filesize($candidateFilePath);
        if ($fileSize !== false && $fileSize > 0)
        {
            $jdFilePath = $candidateFilePath;
            break;
        }
    }
}

if ($jdFilePath === '')
{
    $jdText = trim(strip_tags($jobOrder['description']));
    if ($jdText === '')
    {
        $jdText = html_entity_decode($jobOrder['title'], ENT_QUOTES);
    }
}

$metadata = json_encode(
    array(
        'candidateId' => $candidateID,
        'jobOrderId' => $jobOrderID,
        'jobOrderTitle' => $jobOrder['title'],
        'userId' => $interface->getUserID()
    )
);
if ($metadata === false)
{
    $interface->outputXMLErrorPage(-1, 'Failed to encode metadata.');
    die();
}

$cvExtension = FileUtility::getFileExtension($attachment['originalFilename']);
$cvFileName = buildCandidateCvFilename($candidate, $cvExtension);

$options = array(
    'candidateId' => (string) $candidateID,
    'metadata' => $metadata,
    'language' => $language,
    'languageFolder' => $languageFolder,
    'roleType' => $roleType,
    'cvFileName' => $cvFileName
);
if (!empty($jobOrder['companyID']))
{
    $options['companyId'] = (string) $jobOrder['companyID'];
}

if ($jdFilePath !== '')
{
    $options['jdFilePath'] = $jdFilePath;
}
else if ($jdText !== '')
{
    $options['jdText'] = $jdText;
}

$response = $client->createTransform($cvFilePath, $options);
$lastHttpStatus = $client->getLastHttpStatus();
if ($response === false && $lastHttpStatus == 404)
{
    $context = buildTalentFitFlowRequestLogContext(
        $client,
        $cvFilePath,
        $cvFileName,
        $jdFilePath,
        $jdText,
        $candidateID,
        $jobOrderID,
        $jobOrder,
        $language,
        $roleType,
        $languageFolder
    );
    $context['httpStatus'] = $lastHttpStatus;
    $context['error'] = $client->getLastError();
    logTalentFitFlowError('TalentFitFlow transform 404', $context);
}
if ($response === false && $jdFilePath !== '' && $lastHttpStatus == 404)
{
    $fallbackJdText = strip_tags($jobOrder['description']);
    if (trim($fallbackJdText) === '')
    {
        $fallbackJdText = $jobOrder['title'];
    }

    $fallbackOptions = $options;
    unset($fallbackOptions['jdFilePath']);
    if (trim($fallbackJdText) !== '')
    {
        $fallbackOptions['jdText'] = $fallbackJdText;
    }

    $response = $client->createTransform($cvFilePath, $fallbackOptions);
    if ($response !== false)
    {
        logTalentFitFlowError('TalentFitFlow retried without JD file after 404', array(
            'candidateId' => $candidateID,
            'attachmentId' => $attachmentID,
            'jobOrderId' => $jobOrderID
        ));
    }
    else if ($client->getLastHttpStatus() == 404)
    {
        $context = buildTalentFitFlowRequestLogContext(
            $client,
            $cvFilePath,
            $cvFileName,
            '',
            $fallbackJdText,
            $candidateID,
            $jobOrderID,
            $jobOrder,
            $language,
            $roleType,
            $languageFolder
        );
        $context['httpStatus'] = $client->getLastHttpStatus();
        $context['error'] = $client->getLastError();
        logTalentFitFlowError('TalentFitFlow transform 404 (jd_text fallback)', $context);
    }
}
if ($response === false)
{
    logTalentFitFlowError('TalentFitFlow transform failed', array(
        'candidateId' => $candidateID,
        'attachmentId' => $attachmentID,
        'jobOrderId' => $jobOrderID,
        'cvFile' => $attachment['originalFilename'],
        'jdFile' => ($jdFilePath !== '') ? basename($jdFilePath) : '',
        'jdTextUsed' => ($jdText !== ''),
        'language' => $language,
        'roleType' => $roleType,
        'companyId' => isset($jobOrder['companyID']) ? $jobOrder['companyID'] : '',
        'error' => $client->getLastError()
    ));
    $interface->outputXMLErrorPage(-1, $client->getLastError());
    die();
}

$output =
    "<data>\n" .
    "    <errorcode>0</errorcode>\n" .
    "    <errormessage></errormessage>\n" .
    "    <jobid>" . htmlspecialchars($response['jobId'], ENT_QUOTES) . "</jobid>\n" .
    "    <status>" . htmlspecialchars($response['status'], ENT_QUOTES) . "</status>\n" .
    "</data>\n";

$interface->outputXMLPage($output);

?>
