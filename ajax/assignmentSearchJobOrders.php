<?php
/*
 * OpenCATS
 * AJAX Assignment Workspace Job Order Search
 */

include_once(LEGACY_ROOT . '/lib/JobOrderStatuses.php');

$interface = new SecureAJAXInterface();

function assignmentSearchJobOrders_jsonResponse($payload)
{
    header('Content-type: application/json');
    echo json_encode($payload);
}

function assignmentSearchJobOrders_jsonError($message)
{
    assignmentSearchJobOrders_jsonResponse(
        array(
            'success' => 0,
            'message' => $message,
            'results' => array()
        )
    );
}

if (
    $_SESSION['CATS']->getAccessLevel('candidates.search') < ACCESS_LEVEL_EDIT
    && $_SESSION['CATS']->getAccessLevel('joborders.search') < ACCESS_LEVEL_READ
)
{
    assignmentSearchJobOrders_jsonError('Invalid user level for action.');
    return;
}

$siteID = $interface->getSiteID();
$db = DatabaseConnection::getInstance();

$query = '';
if (isset($_REQUEST['query']))
{
    $query = trim($_REQUEST['query']);
}

$offset = 0;
if (isset($_REQUEST['offset']) && ctype_digit((string) $_REQUEST['offset']))
{
    $offset = (int) $_REQUEST['offset'];
    if ($offset < 0)
    {
        $offset = 0;
    }
}

$maxResults = 30;
if (isset($_REQUEST['maxResults']) && ctype_digit((string) $_REQUEST['maxResults']))
{
    $maxResults = (int) $_REQUEST['maxResults'];
    if ($maxResults <= 0)
    {
        $maxResults = 30;
    }
}
if ($maxResults > 100)
{
    $maxResults = 100;
}

$includeClosed = false;
if (isset($_REQUEST['includeClosed']))
{
    $includeClosedValue = strtolower(trim((string) $_REQUEST['includeClosed']));
    $includeClosed = ($includeClosedValue === '1' || $includeClosedValue === 'true');
}

$candidateID = 0;
if (isset($_REQUEST['candidateID']) && ctype_digit((string) $_REQUEST['candidateID']))
{
    $candidateID = (int) $_REQUEST['candidateID'];
}

$where = array();
$where[] = sprintf('joborder.site_id = %s', $db->makeQueryInteger($siteID));
$where[] = 'joborder.is_admin_hidden = 0';

if (!$includeClosed)
{
    $where[] = '(joborder.status IN ' . JobOrderStatuses::getOpenStatusSQL() . ')';
}

if ($query !== '')
{
    $wildCard = str_replace('*', '%', $query);
    if (strpos($wildCard, '%') === false && strpos($wildCard, '_') === false)
    {
        $wildCard = '%' . $wildCard . '%';
    }
    else if (substr($wildCard, -1) !== '%')
    {
        $wildCard .= '%';
    }
    $wildCardSQL = $db->makeQueryString($wildCard);

    $where[] = sprintf(
        '(joborder.title LIKE %s OR company.name LIKE %s OR joborder.client_job_id LIKE %s)',
        $wildCardSQL,
        $wildCardSQL,
        $wildCardSQL
    );
}

$candidateJoin = '';
$inPipelineSelect = '0 AS inPipeline';
if ($candidateID > 0)
{
    $candidateJoin = sprintf(
        "LEFT JOIN candidate_joborder AS candidate_joborder_match
            ON candidate_joborder_match.joborder_id = joborder.joborder_id
            AND candidate_joborder_match.site_id = %s
            AND candidate_joborder_match.candidate_id = %s
            AND candidate_joborder_match.is_active = 1",
        $db->makeQueryInteger($siteID),
        $db->makeQueryInteger($candidateID)
    );
    $inPipelineSelect = 'IF(candidate_joborder_match.candidate_joborder_id IS NULL, 0, 1) AS inPipeline';
}

$sql = sprintf(
    "SELECT
        joborder.joborder_id AS jobOrderID,
        joborder.client_job_id AS clientJobID,
        joborder.title AS title,
        company.name AS companyName,
        joborder.status AS status,
        IFNULL(joborder.openings, 0) AS openings,
        IFNULL(joborder.openings_available, IFNULL(joborder.openings, 0)) AS openingsAvailable,
        DATE_FORMAT(joborder.date_modified, '%%m-%%d-%%y') AS dateModified,
        TRIM(CONCAT(
            IFNULL(owner_user.first_name, ''),
            ' ',
            IFNULL(owner_user.last_name, '')
        )) AS ownerName,
        %s
    FROM
        joborder
    LEFT JOIN company
        ON company.company_id = joborder.company_id
    LEFT JOIN user AS owner_user
        ON owner_user.user_id = joborder.owner
    %s
    WHERE
        %s
    ORDER BY
        joborder.date_modified DESC
    LIMIT %s, %s",
    $inPipelineSelect,
    $candidateJoin,
    implode(' AND ', $where),
    $db->makeQueryInteger($offset),
    $db->makeQueryInteger($maxResults)
);

$results = $db->getAllAssoc($sql);
if (!is_array($results))
{
    $results = array();
}

assignmentSearchJobOrders_jsonResponse(
    array(
        'success' => 1,
        'results' => $results
    )
);
