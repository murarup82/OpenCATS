<?php
/*
 * CATS
 * Candidate Ownership Edit (Admin)
 */

include_once(LEGACY_ROOT . '/lib/Candidates.php');
include_once(LEGACY_ROOT . '/lib/Users.php');
include_once(LEGACY_ROOT . '/lib/History.php');

$interface = new SecureAJAXInterface();

function jsonResponse($payload)
{
    header('Content-type: application/json');
    echo json_encode($payload);
}

function jsonError($message)
{
    jsonResponse(array('success' => 0, 'message' => $message));
    die();
}

if ($_SESSION['CATS']->getAccessLevel('settings.administration') < ACCESS_LEVEL_SA)
{
    jsonError('You do not have permission to edit ownership metadata.');
}

$action = $interface->getTrimmedInput('action');
if ($action !== 'updateOwnership')
{
    jsonError('Invalid action.');
}

if (!$interface->isRequiredIDValid('candidateID'))
{
    jsonError('Invalid candidate ID.');
}

if (!$interface->isRequiredIDValid('ownerUserID'))
{
    jsonError('Invalid owner user ID.');
}

$candidateID = (int) $_REQUEST['candidateID'];
$ownerUserID = (int) $_REQUEST['ownerUserID'];
$createdInput = $interface->getTrimmedInput('createdDateTime');
$reason = $interface->getTrimmedInput('reason');

if ($reason === '')
{
    jsonError('Reason is required.');
}

if ($createdInput === '')
{
    jsonError('Created datetime is required.');
}

$createdInput = str_replace('T', ' ', $createdInput);
if (strpos($createdInput, '0000-00-00') === 0)
{
    jsonError('Created datetime is invalid.');
}
if (!preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/', $createdInput))
{
    jsonError('Created datetime format is invalid.');
}

$timestamp = strtotime($createdInput);
if ($timestamp === false)
{
    jsonError('Created datetime is invalid.');
}

if ($timestamp > (time() + 600))
{
    jsonError('Created datetime cannot be in the future.');
}

$siteID = $interface->getSiteID();
$db = DatabaseConnection::getInstance();

$candidateRow = $db->getAssoc(sprintf(
    "SELECT
        candidate_id AS candidateID,
        date_created AS dateCreatedRaw,
        owner AS ownerID
     FROM
        candidate
     WHERE
        candidate_id = %s
        AND site_id = %s
     LIMIT 1",
    $db->makeQueryInteger($candidateID),
    $db->makeQueryInteger($siteID)
));

if (empty($candidateRow))
{
    jsonError('Candidate not found.');
}

$users = new Users($siteID);
$ownerRow = $users->get($ownerUserID);
if (empty($ownerRow) || (int) $ownerRow['accessLevel'] <= ACCESS_LEVEL_DISABLED)
{
    jsonError('Owner user is invalid or disabled.');
}

$newDateCreated = date('Y-m-d H:i:s', $timestamp);
$prevDateCreated = $candidateRow['dateCreatedRaw'];
$prevOwnerID = (int) $candidateRow['ownerID'];

if ($prevDateCreated === $newDateCreated && $prevOwnerID === $ownerUserID)
{
    jsonError('No changes detected.');
}

$updateResult = $db->query(sprintf(
    "UPDATE candidate
     SET
        date_created = %s,
        owner = %s,
        date_modified = NOW()
     WHERE
        candidate_id = %s
        AND site_id = %s",
    $db->makeQueryString($newDateCreated),
    $db->makeQueryInteger($ownerUserID),
    $db->makeQueryInteger($candidateID),
    $db->makeQueryInteger($siteID)
));

if (!$updateResult)
{
    jsonError('Failed to update ownership metadata.');
}

$description = '(USER) updated ownership metadata. Reason: ' . $reason;
$history = new History($siteID);

if ($prevDateCreated !== $newDateCreated)
{
    $history->storeHistoryData(
        DATA_ITEM_CANDIDATE,
        $candidateID,
        'ownership.date_created',
        $prevDateCreated,
        $newDateCreated,
        $description
    );
}

if ($prevOwnerID !== $ownerUserID)
{
    $prevOwnerName = '';
    if ($prevOwnerID > 0)
    {
        $prevOwnerRow = $users->get($prevOwnerID);
        if (!empty($prevOwnerRow) && !empty($prevOwnerRow['fullName']))
        {
            $prevOwnerName = $prevOwnerRow['fullName'];
        }
    }

    $history->storeHistoryData(
        DATA_ITEM_CANDIDATE,
        $candidateID,
        'ownership.owner',
        $prevOwnerName,
        $ownerRow['fullName'],
        $description
    );
}

$candidates = new Candidates($siteID);
$updated = $candidates->get($candidateID);
$createdDisplay = !empty($updated['dateCreated']) ? $updated['dateCreated'] : '--';
$createdInputDisplay = !empty($updated['dateCreatedInput']) ? $updated['dateCreatedInput'] : '';
$ownerDisplay = !empty($updated['ownerFullName']) ? $updated['ownerFullName'] : '--';

jsonResponse(array(
    'success' => 1,
    'created_display' => $createdDisplay,
    'created_input' => $createdInputDisplay,
    'owner_display' => $ownerDisplay,
    'owner_id' => $updated['owner']
));

?>
