<?php
/*
 * CATS
 * AJAX TalentFitFlow Candidate Parse Interface
 */

include_once(LEGACY_ROOT . '/lib/FileUtility.php');
include_once(LEGACY_ROOT . '/lib/Attachments.php');
include_once(LEGACY_ROOT . '/lib/TalentFitFlowClient.php');
include_once(LEGACY_ROOT . '/lib/TalentFitFlowSettings.php');

function logTalentFitFlowCandidateParseError($message, $context = array())
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

function normalizeTalentFitFlowJson($value)
{
    if ($value === null)
    {
        return '';
    }

    if (is_string($value))
    {
        return $value;
    }

    if (!function_exists('json_encode'))
    {
        return '';
    }

    $encoded = json_encode($value);
    if ($encoded === false && function_exists('json_last_error') && json_last_error() !== JSON_ERROR_NONE)
    {
        return '';
    }

    return $encoded;
}

$interface = new SecureAJAXInterface();

if (
    $_SESSION['CATS']->getAccessLevel('candidates.add') < ACCESS_LEVEL_EDIT &&
    $_SESSION['CATS']->getAccessLevel('candidates.edit') < ACCESS_LEVEL_EDIT
)
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

if ($action === 'create')
{
    $documentTempFile = isset($_REQUEST['documentTempFile']) ? trim($_REQUEST['documentTempFile']) : '';
    $attachmentID = isset($_REQUEST['attachmentID']) ? (int) $_REQUEST['attachmentID'] : 0;
    $candidateID = isset($_REQUEST['candidateID']) ? (int) $_REQUEST['candidateID'] : 0;

    if ($documentTempFile === '' && $attachmentID <= 0)
    {
        $interface->outputXMLErrorPage(-1, 'Missing resume upload.');
        die();
    }

    $consent = isset($_REQUEST['consent']) ? trim($_REQUEST['consent']) : '';
    if ($consent === '')
    {
        $interface->outputXMLErrorPage(-1, 'Consent is required.');
        die();
    }

    $cvPath = false;

    if ($documentTempFile !== '')
    {
        $cvPath = FileUtility::getUploadFilePath(
            $interface->getSiteID(),
            'addcandidate',
            $documentTempFile
        );
    }
    else
    {
        if ($attachmentID <= 0 || $candidateID <= 0)
        {
            $interface->outputXMLErrorPage(-1, 'Invalid attachment or candidate ID.');
            die();
        }

        $attachments = new Attachments($interface->getSiteID());
        $attachment = $attachments->get($attachmentID);
        if (
            empty($attachment) ||
            (int) $attachment['dataItemType'] !== DATA_ITEM_CANDIDATE ||
            (int) $attachment['dataItemID'] !== $candidateID
        )
        {
            $interface->outputXMLErrorPage(-1, 'Attachment not found for candidate.');
            die();
        }

        $attachments->forceAttachmentLocal($attachmentID);
        $cvPath = FileUtility::getUploadFilePath(
            $interface->getSiteID(),
            $attachment['directoryName'],
            $attachment['storedFilename']
        );
    }

    if ($cvPath === false || !is_readable($cvPath))
    {
        $interface->outputXMLErrorPage(-1, 'Resume file is not available.');
        die();
    }

    $options = array(
        'consent' => $consent,
        'requestedFields' => isset($_REQUEST['requested_fields']) ? trim($_REQUEST['requested_fields']) : '',
        'language' => isset($_REQUEST['language']) ? trim($_REQUEST['language']) : '',
        'companyId' => isset($_REQUEST['companyId']) ? trim($_REQUEST['companyId']) : '',
        'candidateId' => isset($_REQUEST['candidate_id']) ? trim($_REQUEST['candidate_id']) : '',
        'idempotencyKey' => isset($_REQUEST['idempotency_key']) ? trim($_REQUEST['idempotency_key']) : ''
    );

    $response = $client->createCandidateParse($cvPath, $options);
    if ($response === false)
    {
        logTalentFitFlowCandidateParseError('TalentFitFlow candidate parse create failed', array(
            'error' => $client->getLastError(),
            'documentTempFile' => $documentTempFile,
            'attachmentID' => $attachmentID,
            'candidateID' => $candidateID
        ));
        $interface->outputXMLErrorPage(-1, $client->getLastError());
        die();
    }
    logTalentFitFlowCandidateParseError('TalentFitFlow candidate parse create response', $response);

    $candidateJson = normalizeTalentFitFlowJson(
        isset($response['candidate']) ? $response['candidate'] : null
    );
    $warningsJson = normalizeTalentFitFlowJson(
        isset($response['warnings']) ? $response['warnings'] : array()
    );

    $output =
        "<data>\n" .
        "    <errorcode>0</errorcode>\n" .
        "    <errormessage></errormessage>\n" .
        "    <jobid>" . htmlspecialchars(isset($response['jobId']) ? $response['jobId'] : '', ENT_QUOTES) . "</jobid>\n" .
        "    <status>" . htmlspecialchars(isset($response['status']) ? $response['status'] : '', ENT_QUOTES) . "</status>\n";

    if (isset($response['schema_version']))
    {
        $output .= "    <schema_version>" . htmlspecialchars($response['schema_version'], ENT_QUOTES) . "</schema_version>\n";
    }
    if (isset($response['request_id']))
    {
        $output .= "    <request_id>" . htmlspecialchars($response['request_id'], ENT_QUOTES) . "</request_id>\n";
    }
    if ($candidateJson !== '')
    {
        $output .= "    <candidate_json>" . htmlspecialchars($candidateJson, ENT_QUOTES) . "</candidate_json>\n";
    }
    if ($warningsJson !== '')
    {
        $output .= "    <warnings_json>" . htmlspecialchars($warningsJson, ENT_QUOTES) . "</warnings_json>\n";
    }

    $output .= "</data>\n";

    $interface->outputXMLPage($output);
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

    $status = $client->getCandidateParseStatus($jobId);
    if ($status === false)
    {
        logTalentFitFlowCandidateParseError('TalentFitFlow candidate parse status failed', array(
            'jobId' => $jobId,
            'error' => $client->getLastError()
        ));
        if ($client->getLastHttpStatus() == 404)
        {
            $interface->outputXMLErrorPage(-1, 'Job expired or not found; please retry.');
        }
        else
        {
            $interface->outputXMLErrorPage(-1, $client->getLastError());
        }
        die();
    }
    logTalentFitFlowCandidateParseError('TalentFitFlow candidate parse status response', $status);

    $candidateJson = normalizeTalentFitFlowJson(
        isset($status['candidate']) ? $status['candidate'] : null
    );
    $warningsJson = normalizeTalentFitFlowJson(
        isset($status['warnings']) ? $status['warnings'] : array()
    );

    $output =
        "<data>\n" .
        "    <errorcode>0</errorcode>\n" .
        "    <errormessage></errormessage>\n" .
        "    <jobid>" . htmlspecialchars(isset($status['jobId']) ? $status['jobId'] : $jobId, ENT_QUOTES) . "</jobid>\n" .
        "    <status>" . htmlspecialchars(isset($status['status']) ? $status['status'] : '', ENT_QUOTES) . "</status>\n";

    if (isset($status['schema_version']))
    {
        $output .= "    <schema_version>" . htmlspecialchars($status['schema_version'], ENT_QUOTES) . "</schema_version>\n";
    }
    if (isset($status['request_id']))
    {
        $output .= "    <request_id>" . htmlspecialchars($status['request_id'], ENT_QUOTES) . "</request_id>\n";
    }
    if (isset($status['error_code']))
    {
        $output .= "    <error_code>" . htmlspecialchars($status['error_code'], ENT_QUOTES) . "</error_code>\n";
    }
    if (isset($status['error_message']))
    {
        $output .= "    <error_message>" . htmlspecialchars($status['error_message'], ENT_QUOTES) . "</error_message>\n";
    }
    if ($candidateJson !== '')
    {
        $output .= "    <candidate_json>" . htmlspecialchars($candidateJson, ENT_QUOTES) . "</candidate_json>\n";
    }
    if ($warningsJson !== '')
    {
        $output .= "    <warnings_json>" . htmlspecialchars($warningsJson, ENT_QUOTES) . "</warnings_json>\n";
    }

    $output .= "</data>\n";

    $interface->outputXMLPage($output);
    die();
}

$interface->outputXMLErrorPage(-1, 'Invalid action.');
die();

?>
