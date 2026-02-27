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

function assignmentSearchCandidates_tokenize($text)
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

function assignmentSearchCandidates_daysOldFromTimestamp($timestamp)
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

function assignmentSearchCandidates_makeScore($row, $jobTokens, $query)
{
    $score = 0;
    $reasons = array();

    $candidateTokens = assignmentSearchCandidates_tokenize(
        $row['firstName'] . ' ' . $row['lastName'] . ' ' . $row['keySkills']
    );
    if (!empty($jobTokens) && !empty($candidateTokens))
    {
        $common = count(array_intersect($jobTokens, $candidateTokens));
        $ratio = $common / max(1, min(10, count($jobTokens)));
        $tokenScore = (int) round(min(1, $ratio) * 55);
        if ($tokenScore > 0)
        {
            $score += $tokenScore;
            $reasons[] = 'Skills overlap with role';
        }
    }

    $daysOld = assignmentSearchCandidates_daysOldFromTimestamp($row['dateModifiedTS']);
    if ($daysOld <= 7)
    {
        $score += 15;
        $reasons[] = 'Recently updated profile';
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

    if ((int) $row['isHot'] === 1)
    {
        $score += 10;
        $reasons[] = 'Hot candidate';
    }

    if ((int) $row['isDuplicateCandidate'] === 1)
    {
        $score -= 15;
        $reasons[] = 'Duplicate warning';
    }

    $query = trim((string) $query);
    if ($query !== '')
    {
        $queryLower = strtolower($query);
        $haystack = strtolower(
            $row['firstName'] . ' ' . $row['lastName'] . ' '
            . $row['email'] . ' ' . $row['keySkills']
        );
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

$jobOrderSQL = sprintf(
    "SELECT
        title AS title,
        description AS description
    FROM
        joborder
    WHERE
        joborder_id = %s
    AND
        site_id = %s
    LIMIT 1",
    $db->makeQueryInteger($jobOrderID),
    $db->makeQueryInteger($siteID)
);
$jobOrderData = $db->getAssoc($jobOrderSQL);
if (empty($jobOrderData))
{
    assignmentSearchCandidates_jsonError('Job order not found.');
    return;
}
$jobTokens = assignmentSearchCandidates_tokenize(
    $jobOrderData['title'] . ' ' . $jobOrderData['description']
);

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
        candidate.is_hot AS isHot,
        candidate.key_skills AS keySkills,
        DATE_FORMAT(candidate.date_modified, '%%m-%%d-%%y') AS dateModified,
        UNIX_TIMESTAMP(candidate.date_modified) AS dateModifiedTS,
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

foreach ($results as $index => $row)
{
    list($matchScore, $matchSummary) = assignmentSearchCandidates_makeScore(
        $row,
        $jobTokens,
        $query
    );
    $results[$index]['matchScore'] = $matchScore;
    $results[$index]['matchSummary'] = $matchSummary;
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

assignmentSearchCandidates_jsonResponse(
    array(
        'success' => 1,
        'results' => $results
    )
);
