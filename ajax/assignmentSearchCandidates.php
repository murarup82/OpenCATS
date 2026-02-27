<?php
/*
 * OpenCATS
 * AJAX Assignment Workspace Candidate Search
 */

$interface = new SecureAJAXInterface();

function assignmentSearchCandidates_jsonResponse($payload)
{
    header('Content-type: application/json');
    echo json_encode($payload);
}

function assignmentSearchCandidates_jsonError($message)
{
    assignmentSearchCandidates_jsonResponse(
        array(
            'success' => 0,
            'message' => $message,
            'results' => array()
        )
    );
}

if ($_SESSION['CATS']->getAccessLevel('joborders.considerCandidateSearch') < ACCESS_LEVEL_EDIT)
{
    assignmentSearchCandidates_jsonError('Invalid user level for action.');
    return;
}

if (!isset($_REQUEST['jobOrderID']) || !ctype_digit((string) $_REQUEST['jobOrderID']))
{
    assignmentSearchCandidates_jsonError('Invalid job order ID.');
    return;
}

$jobOrderID = (int) $_REQUEST['jobOrderID'];
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

$where = array();
$where[] = sprintf('candidate.site_id = %s', $db->makeQueryInteger($siteID));
$where[] = 'candidate.is_admin_hidden = 0';
$where[] = 'candidate.is_active = 1';

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
        "(CONCAT(candidate.first_name, ' ', candidate.last_name) LIKE %s
            OR CONCAT(candidate.last_name, ' ', candidate.first_name) LIKE %s
            OR candidate.email1 LIKE %s
            OR candidate.key_skills LIKE %s)",
        $wildCardSQL,
        $wildCardSQL,
        $wildCardSQL,
        $wildCardSQL
    );
}

$sql = sprintf(
    "SELECT
        candidate.candidate_id AS candidateID,
        candidate.first_name AS firstName,
        candidate.last_name AS lastName,
        candidate.email1 AS email,
        candidate.key_skills AS keySkills,
        DATE_FORMAT(candidate.date_modified, '%%m-%%d-%%y') AS dateModified,
        IF(candidate_duplicates.new_candidate_id IS NULL, 0, 1) AS isDuplicateCandidate,
        TRIM(CONCAT(
            IFNULL(owner_user.first_name, ''),
            ' ',
            IFNULL(owner_user.last_name, '')
        )) AS ownerName,
        IF(candidate_joborder_match.candidate_joborder_id IS NULL, 0, 1) AS inPipeline
    FROM
        candidate
    LEFT JOIN user AS owner_user
        ON owner_user.user_id = candidate.owner
    LEFT JOIN candidate_duplicates
        ON candidate_duplicates.new_candidate_id = candidate.candidate_id
    LEFT JOIN candidate_joborder AS candidate_joborder_match
        ON candidate_joborder_match.candidate_id = candidate.candidate_id
        AND candidate_joborder_match.joborder_id = %s
        AND candidate_joborder_match.site_id = %s
        AND candidate_joborder_match.is_active = 1
    WHERE
        %s
    ORDER BY
        candidate.date_modified DESC
    LIMIT %s, %s",
    $db->makeQueryInteger($jobOrderID),
    $db->makeQueryInteger($siteID),
    implode(' AND ', $where),
    $db->makeQueryInteger($offset),
    $db->makeQueryInteger($maxResults)
);

$results = $db->getAllAssoc($sql);
if (!is_array($results))
{
    $results = array();
}

assignmentSearchCandidates_jsonResponse(
    array(
        'success' => 1,
        'results' => $results
    )
);
