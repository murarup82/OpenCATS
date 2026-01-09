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
        $output .= "    <cv_download_url>" . htmlspecialchars($status['cv_download_url'], ENT_QUOTES) . "</cv_download_url>\n";
    }

    $output .=
        "</data>\n";

    $interface->outputXMLPage($output);
    die();
}

if ($action !== 'create')
{
    $interface->outputXMLErrorPage(-1, 'Invalid action.');
    die();
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
        $jdFilePath = $candidateFilePath;
        break;
    }
}

if ($jdFilePath === '')
{
    $jdText = strip_tags($jobOrder['description']);
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

$options = array(
    'candidateId' => (string) $candidateID,
    'metadata' => $metadata,
    'language' => $language,
    'languageFolder' => $languageFolder,
    'roleType' => $roleType
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
