<?php
/*
 * OpenCATS
 * AJAX Assignment Workspace Bulk Add
 */

include_once(LEGACY_ROOT . '/lib/Pipelines.php');

$interface = new SecureAJAXInterface();

function assignmentBulkAdd_jsonResponse($payload)
{
    header('Content-type: application/json');
    echo json_encode($payload);
}

function assignmentBulkAdd_jsonError($message)
{
    assignmentBulkAdd_jsonResponse(
        array(
            'success' => 0,
            'message' => $message
        )
    );
}

function assignmentBulkAdd_parseCSVIntegers($rawValue)
{
    $output = array();
    $parts = explode(',', (string) $rawValue);
    foreach ($parts as $part)
    {
        $part = trim($part);
        if ($part === '' || !ctype_digit($part))
        {
            continue;
        }

        $value = (int) $part;
        if ($value <= 0)
        {
            continue;
        }

        $output[$value] = $value;
    }

    return array_values($output);
}

if ($_SESSION['CATS']->getAccessLevel('pipelines.addToPipeline') < ACCESS_LEVEL_EDIT)
{
    assignmentBulkAdd_jsonError('You do not have permission to add to pipeline.');
    return;
}

$mode = '';
if (isset($_REQUEST['mode']))
{
    $mode = trim((string) $_REQUEST['mode']);
}
if ($mode !== 'candidateToJobs' && $mode !== 'jobToCandidates')
{
    assignmentBulkAdd_jsonError('Invalid assignment mode.');
    return;
}

$siteID = $interface->getSiteID();
$userID = $interface->getUserID();
$pipelines = new Pipelines($siteID);

$targetStatusID = PIPELINE_STATUS_ALLOCATED;
if (isset($_REQUEST['targetStatusID']) && ctype_digit((string) $_REQUEST['targetStatusID']))
{
    $targetStatusID = (int) $_REQUEST['targetStatusID'];
}

$canSetStatusOnAdd = (
    $_SESSION['CATS']->getAccessLevel('pipelines.addActivityChangeStatus') >= ACCESS_LEVEL_EDIT
);

$allowedStatusIDs = array();
foreach ($pipelines->getStatusesForPicking() as $statusRow)
{
    $statusID = (int) $statusRow['statusID'];
    if ($statusID === PIPELINE_STATUS_HIRED || $statusID === PIPELINE_STATUS_REJECTED)
    {
        continue;
    }
    $allowedStatusIDs[$statusID] = true;
}

if (!$canSetStatusOnAdd || !isset($allowedStatusIDs[$targetStatusID]))
{
    $targetStatusID = PIPELINE_STATUS_ALLOCATED;
}

$jobOrderIDs = array();
$candidateIDs = array();

if ($mode === 'candidateToJobs')
{
    if (isset($_REQUEST['jobOrderIDs']))
    {
        $jobOrderIDs = assignmentBulkAdd_parseCSVIntegers($_REQUEST['jobOrderIDs']);
    }

    if (isset($_REQUEST['candidateIDArrayStored']) && trim((string) $_REQUEST['candidateIDArrayStored']) !== '')
    {
        $storedKey = trim((string) $_REQUEST['candidateIDArrayStored']);
        $storedCandidateIDs = $_SESSION['CATS']->retrieveData($storedKey);
        if (is_array($storedCandidateIDs))
        {
            foreach ($storedCandidateIDs as $candidateID)
            {
                if (ctype_digit((string) $candidateID) && (int) $candidateID > 0)
                {
                    $candidateIDs[(int) $candidateID] = (int) $candidateID;
                }
            }
            $candidateIDs = array_values($candidateIDs);
        }
    }
    else if (isset($_REQUEST['candidateID']) && ctype_digit((string) $_REQUEST['candidateID']))
    {
        $candidateID = (int) $_REQUEST['candidateID'];
        if ($candidateID > 0)
        {
            $candidateIDs[] = $candidateID;
        }
    }
}
else
{
    if (isset($_REQUEST['jobOrderID']) && ctype_digit((string) $_REQUEST['jobOrderID']))
    {
        $jobOrderID = (int) $_REQUEST['jobOrderID'];
        if ($jobOrderID > 0)
        {
            $jobOrderIDs[] = $jobOrderID;
        }
    }

    if (isset($_REQUEST['candidateIDs']))
    {
        $candidateIDs = assignmentBulkAdd_parseCSVIntegers($_REQUEST['candidateIDs']);
    }
}

if (empty($jobOrderIDs))
{
    assignmentBulkAdd_jsonError('Please select at least one job order.');
    return;
}

if (empty($candidateIDs))
{
    assignmentBulkAdd_jsonError('Please select at least one candidate.');
    return;
}

$requestedCount = count($jobOrderIDs) * count($candidateIDs);
$addedCount = 0;
$statusAppliedCount = 0;
$skippedInPipelineCount = 0;
$skippedHiredCount = 0;
$skippedErrorCount = 0;

foreach ($jobOrderIDs as $jobOrderID)
{
    foreach ($candidateIDs as $candidateID)
    {
        if ($pipelines->hasEverBeenHiredForJobOrder($candidateID, $jobOrderID))
        {
            $skippedHiredCount++;
            continue;
        }

        if (!$pipelines->add($candidateID, $jobOrderID, $userID))
        {
            $errorMessage = strtolower(trim((string) $pipelines->getLastErrorMessage()));
            if (strpos($errorMessage, 'already exists') !== false)
            {
                $skippedInPipelineCount++;
            }
            else if (strpos($errorMessage, 'already been hired') !== false)
            {
                $skippedHiredCount++;
            }
            else
            {
                $skippedErrorCount++;
            }
            continue;
        }

        $addedCount++;

        if ($targetStatusID !== PIPELINE_STATUS_ALLOCATED)
        {
            $historyID = $pipelines->setStatus(
                $candidateID,
                $jobOrderID,
                $targetStatusID,
                '',
                '',
                $userID,
                'System: status set on assignment workspace',
                null,
                1,
                $userID
            );

            if (!empty($historyID))
            {
                $statusAppliedCount++;
            }
        }
    }
}

assignmentBulkAdd_jsonResponse(
    array(
        'success' => 1,
        'requestedCount' => $requestedCount,
        'addedCount' => $addedCount,
        'statusAppliedCount' => $statusAppliedCount,
        'skippedInPipelineCount' => $skippedInPipelineCount,
        'skippedHiredCount' => $skippedHiredCount,
        'skippedErrorCount' => $skippedErrorCount
    )
);

