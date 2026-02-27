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

function assignmentSearchJobOrders_tokenize($text)
{
    $text = strtolower((string) $text);
    $text = preg_replace('/[^a-z0-9]+/', ' ', $text);
    $text = trim(preg_replace('/\s+/', ' ', $text));
    if ($text === '')
    {
        return array();
    }

    $stopWords = array(
        'and' => true, 'the' => true, 'for' => true, 'with' => true, 'from' => true,
        'this' => true, 'that' => true, 'are' => true, 'you' => true, 'your' => true,
        'job' => true, 'order' => true, 'candidate' => true, 'role' => true
    );

    $tokens = array();
    foreach (explode(' ', $text) as $token)
    {
        if (strlen($token) < 3)
        {
            continue;
        }
        if (isset($stopWords[$token]))
        {
            continue;
        }
        $tokens[$token] = true;
    }

    return array_keys($tokens);
}

function assignmentSearchJobOrders_daysOldFromTimestamp($timestamp)
{
    $timestamp = (int) $timestamp;
    if ($timestamp <= 0)
    {
        return 9999;
    }

    $diff = time() - $timestamp;
    if ($diff <= 0)
    {
        return 0;
    }

    return (int) floor($diff / 86400);
}

function assignmentSearchJobOrders_makeScore($row, $candidateTokens, $isCandidateContext, $openStatuses, $query)
{
    $score = 0;
    $reasons = array();

    if ($isCandidateContext && !empty($candidateTokens))
    {
        $jobTokens = assignmentSearchJobOrders_tokenize(
            $row['title'] . ' ' . $row['description']
        );
        if (!empty($jobTokens))
        {
            $common = count(array_intersect($candidateTokens, $jobTokens));
            $ratio = $common / max(1, min(8, count($candidateTokens)));
            $tokenScore = (int) round(min(1, $ratio) * 45);
            if ($tokenScore > 0)
            {
                $score += $tokenScore;
                $reasons[] = 'Skills/title overlap';
            }
        }
    }
    else
    {
        $reasons[] = 'Bulk mode: ranked by demand and freshness';
    }

    $openingsAvailable = (int) $row['openingsAvailable'];
    if ($openingsAvailable > 0)
    {
        $score += 15;
        $reasons[] = 'Openings available: ' . $openingsAvailable;
    }
    else
    {
        $score += 2;
    }

    $daysOld = assignmentSearchJobOrders_daysOldFromTimestamp($row['dateModifiedTS']);
    if ($daysOld <= 7)
    {
        $score += 15;
        $reasons[] = 'Recently updated';
    }
    else if ($daysOld <= 30)
    {
        $score += 10;
    }
    else if ($daysOld <= 90)
    {
        $score += 5;
    }
    else
    {
        $score += 1;
    }

    if (isset($openStatuses[$row['status']]))
    {
        $score += 10;
    }

    $query = trim((string) $query);
    if ($query !== '')
    {
        $queryLower = strtolower($query);
        $haystack = strtolower($row['title'] . ' ' . $row['companyName'] . ' ' . $row['clientJobID']);
        if (strpos($haystack, $queryLower) !== false)
        {
            $score += 10;
            $reasons[] = 'Matches search terms';
        }
    }

    if ($score > 100)
    {
        $score = 100;
    }
    if ($score < 0)
    {
        $score = 0;
    }

    $summary = '';
    if (!empty($reasons))
    {
        $summary = implode('; ', array_slice($reasons, 0, 3));
    }

    return array($score, $summary);
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

$candidateTokens = array();
if ($candidateID > 0)
{
    $candidateSQL = sprintf(
        "SELECT
            candidate_id AS candidateID,
            first_name AS firstName,
            last_name AS lastName,
            key_skills AS keySkills
        FROM
            candidate
        WHERE
            site_id = %s
        AND
            candidate_id = %s
        LIMIT 1",
        $db->makeQueryInteger($siteID),
        $db->makeQueryInteger($candidateID)
    );
    $candidateData = $db->getAssoc($candidateSQL);
    if (!empty($candidateData))
    {
        $candidateTokens = assignmentSearchJobOrders_tokenize(
            $candidateData['firstName'] . ' ' . $candidateData['lastName'] . ' ' . $candidateData['keySkills']
        );
    }
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
        joborder.description AS description,
        IFNULL(joborder.openings, 0) AS openings,
        IFNULL(joborder.openings_available, IFNULL(joborder.openings, 0)) AS openingsAvailable,
        DATE_FORMAT(joborder.date_modified, '%%m-%%d-%%y') AS dateModified,
        UNIX_TIMESTAMP(joborder.date_modified) AS dateModifiedTS,
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

$openStatuses = array();
foreach (JobOrderStatuses::getAll()['Open'] as $openStatusLabel)
{
    $openStatuses[$openStatusLabel] = true;
}

foreach ($results as $index => $row)
{
    list($matchScore, $matchSummary) = assignmentSearchJobOrders_makeScore(
        $row,
        $candidateTokens,
        ($candidateID > 0 && !empty($candidateTokens)),
        $openStatuses,
        $query
    );
    $results[$index]['matchScore'] = $matchScore;
    $results[$index]['matchSummary'] = $matchSummary;

    unset($results[$index]['description']);
}

usort(
    $results,
    function($left, $right)
    {
        $leftScore = (int) $left['matchScore'];
        $rightScore = (int) $right['matchScore'];
        if ($leftScore === $rightScore)
        {
            $leftTS = (int) $left['dateModifiedTS'];
            $rightTS = (int) $right['dateModifiedTS'];
            if ($leftTS === $rightTS)
            {
                return 0;
            }
            return ($leftTS > $rightTS) ? -1 : 1;
        }
        return ($leftScore > $rightScore) ? -1 : 1;
    }
);

foreach ($results as $index => $row)
{
    unset($results[$index]['dateModifiedTS']);
}

assignmentSearchJobOrders_jsonResponse(
    array(
        'success' => 1,
        'results' => $results
    )
);
