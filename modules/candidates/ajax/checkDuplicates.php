<?php
/*
 * CATS
 * Candidate Duplicate Check (Pre-save)
 */

include_once(LEGACY_ROOT . '/lib/DatabaseConnection.php');
include_once(LEGACY_ROOT . '/lib/StringUtility.php');

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

if ($_SESSION['CATS']->getAccessLevel('candidates.add') < ACCESS_LEVEL_EDIT)
{
    jsonError('You do not have permission to add candidates.');
}

function normalizeWhitespaceLower($value)
{
    $value = strtolower(trim($value));
    $value = preg_replace('/\s+/', ' ', $value);
    return $value;
}

function normalizeEmail($value)
{
    $value = strtolower(trim($value));
    if ($value === '' || strpos($value, '@') === false)
    {
        return '';
    }
    return $value;
}

function normalizePhoneDigits($value)
{
    $value = trim($value);
    if ($value === '')
    {
        return '';
    }
    $hasPlus = ($value[0] === '+');
    $digits = preg_replace('/\D+/', '', $value);
    if ($digits === '' || strlen($digits) < 6)
    {
        return '';
    }
    return $hasPlus ? ('+' . $digits) : $digits;
}

$firstNameRaw = $interface->getTrimmedInput('firstName');
$lastNameRaw = $interface->getTrimmedInput('lastName');
$emailRaw = $interface->getTrimmedInput('email');
$phoneRaw = $interface->getTrimmedInput('phone');
$cityRaw = $interface->getTrimmedInput('city');
$countryRaw = $interface->getTrimmedInput('country');

$firstNameNorm = normalizeWhitespaceLower($firstNameRaw);
$lastNameNorm = normalizeWhitespaceLower($lastNameRaw);
$emailNorm = normalizeEmail($emailRaw);
$phoneNorm = normalizePhoneDigits($phoneRaw);
$cityNorm = normalizeWhitespaceLower($cityRaw);
$countryNorm = normalizeWhitespaceLower($countryRaw);

if ($firstNameNorm === '' && $lastNameNorm === '' && $emailNorm === '' && $phoneNorm === '')
{
    jsonResponse(array('success' => 1, 'hardMatches' => array(), 'softMatches' => array()));
    die();
}

$siteID = $interface->getSiteID();
$db = DatabaseConnection::getInstance();

$hardRows = array();
$hardConditions = array();

if ($emailNorm !== '')
{
    $hardConditions[] = 'candidate.email1 = ' . $db->makeQueryString($emailNorm);
}

$phoneCandidates = array();
$phoneFormatted = StringUtility::extractPhoneNumber($phoneRaw);
if ($phoneFormatted !== '')
{
    $phoneCandidates[] = $phoneFormatted;
}
if ($phoneNorm !== '')
{
    $phoneCandidates[] = $phoneNorm;
}
if ($phoneFormatted === '' && $phoneRaw !== '')
{
    $phoneCandidates[] = trim($phoneRaw);
}
if (!empty($phoneCandidates))
{
    $phoneCandidates = array_values(array_unique($phoneCandidates));
    foreach ($phoneCandidates as $phoneValue)
    {
        if ($phoneValue !== '')
        {
            $hardConditions[] = 'candidate.phone_cell = ' . $db->makeQueryString($phoneValue);
        }
    }
}

if (!empty($hardConditions))
{
    $sql = sprintf(
        "SELECT
            candidate.candidate_id AS candidateID,
            candidate.first_name AS firstName,
            candidate.last_name AS lastName,
            candidate.email1 AS email1,
            candidate.phone_cell AS phoneCell,
            candidate.city AS city,
            candidate.country AS country,
            candidate.is_active AS isActive,
            candidate.is_admin_hidden AS isAdminHidden,
            candidate.date_created AS dateCreated
        FROM
            candidate
        WHERE
            candidate.site_id = %s
            AND (%s)
        ORDER BY
            candidate.date_created DESC
        LIMIT 5",
        $db->makeQueryInteger($siteID),
        implode(' OR ', $hardConditions)
    );
    $hardRows = $db->getAllAssoc($sql);
}

$rows = $hardRows;

if (empty($rows) && $firstNameNorm !== '' && $lastNameNorm !== '')
{
    $nameExact = sprintf(
        "(candidate.first_name = %s AND candidate.last_name = %s)",
        $db->makeQueryString($firstNameRaw),
        $db->makeQueryString($lastNameRaw)
    );
    $soundex = sprintf(
        "(SOUNDEX(candidate.first_name) = SOUNDEX(%s) AND SOUNDEX(candidate.last_name) = SOUNDEX(%s))",
        $db->makeQueryString($firstNameRaw),
        $db->makeQueryString($lastNameRaw)
    );

    $sql = sprintf(
        "SELECT
            candidate.candidate_id AS candidateID,
            candidate.first_name AS firstName,
            candidate.last_name AS lastName,
            candidate.email1 AS email1,
            candidate.phone_cell AS phoneCell,
            candidate.city AS city,
            candidate.country AS country,
            candidate.is_active AS isActive,
            candidate.is_admin_hidden AS isAdminHidden,
            candidate.date_created AS dateCreated
        FROM
            candidate
        WHERE
            candidate.site_id = %s
            AND (%s OR %s)
        ORDER BY
            CASE WHEN %s THEN 1 ELSE 2 END,
            candidate.date_created DESC
        LIMIT 5",
        $db->makeQueryInteger($siteID),
        $nameExact,
        $soundex,
        $nameExact
    );
    $rows = $db->getAllAssoc($sql);
}

if (empty($rows))
{
    jsonResponse(array('success' => 1, 'hardMatches' => array(), 'softMatches' => array()));
    die();
}

$now = time();
$recentCutoff = $now - (60 * 24 * 60 * 60);

$matches = array();
foreach ($rows as $row)
{
    $reasons = array();
    $score = 0;

    $candidateEmailNorm = normalizeEmail($row['email1']);
    $candidatePhoneNorm = normalizePhoneDigits($row['phoneCell']);
    $candidateFirstNorm = normalizeWhitespaceLower($row['firstName']);
    $candidateLastNorm = normalizeWhitespaceLower($row['lastName']);
    $candidateCityNorm = normalizeWhitespaceLower($row['city']);
    $candidateCountryNorm = normalizeWhitespaceLower($row['country']);

    if ($emailNorm !== '' && $candidateEmailNorm !== '' && $candidateEmailNorm === $emailNorm)
    {
        $score = max($score, 100);
        $reasons[] = 'Email match';
    }

    if ($phoneNorm !== '' && $candidatePhoneNorm !== '' && $candidatePhoneNorm === $phoneNorm)
    {
        $score = max($score, 95);
        $reasons[] = 'Phone match';
    }

    $hasExactName = ($firstNameNorm !== '' && $lastNameNorm !== '' &&
        $candidateFirstNorm === $firstNameNorm && $candidateLastNorm === $lastNameNorm);

    if ($hasExactName && $cityNorm !== '' && $candidateCityNorm === $cityNorm)
    {
        $score = max($score, 80);
        $reasons[] = 'Name + City match';
    }

    if ($hasExactName && $countryNorm !== '' && $candidateCountryNorm === $countryNorm)
    {
        $score = max($score, 70);
        $reasons[] = 'Name + Country match';
    }

    if (!$hasExactName && $firstNameNorm !== '' && $lastNameNorm !== '')
    {
        $soundexInputFirst = soundex($firstNameNorm);
        $soundexInputLast = soundex($lastNameNorm);
        if ($soundexInputFirst !== '' && $soundexInputLast !== '')
        {
            $soundexCandidateFirst = soundex($candidateFirstNorm);
            $soundexCandidateLast = soundex($candidateLastNorm);
            if ($soundexInputFirst === $soundexCandidateFirst && $soundexInputLast === $soundexCandidateLast)
            {
                $score = max($score, 55);
                $reasons[] = 'Name phonetic match';
            }
        }
    }

    if ($score === 0 && $hasExactName)
    {
        $createdTimestamp = strtotime($row['dateCreated']);
        if ($createdTimestamp !== false && $createdTimestamp >= $recentCutoff)
        {
            $score = max($score, 40);
            $reasons[] = 'Recent name match';
        }
    }

    if ($score <= 0)
    {
        continue;
    }

    $status = 'Active';
    if ((int) $row['isAdminHidden'] === 1)
    {
        $status = 'Hidden';
    }
    else if ((int) $row['isActive'] === 0)
    {
        $status = 'Inactive';
    }

    $matches[] = array(
        'candidate_id' => (int) $row['candidateID'],
        'name' => trim($row['firstName'] . ' ' . $row['lastName']),
        'email' => $row['email1'],
        'phone' => $row['phoneCell'],
        'city' => $row['city'],
        'country' => $row['country'],
        'status' => $status,
        'matchReasons' => $reasons,
        'score' => $score,
        'dateCreated' => $row['dateCreated']
    );
}

if (empty($matches))
{
    jsonResponse(array('success' => 1, 'hardMatches' => array(), 'softMatches' => array()));
    die();
}

usort($matches, function ($a, $b)
{
    if ($a['score'] == $b['score'])
    {
        $aTime = strtotime($a['dateCreated']);
        $bTime = strtotime($b['dateCreated']);
        if ($aTime == $bTime)
        {
            return 0;
        }
        return ($aTime > $bTime) ? -1 : 1;
    }
    return ($a['score'] > $b['score']) ? -1 : 1;
});

$hardMatches = array();
$softMatches = array();

foreach ($matches as $match)
{
    if ($match['score'] >= 90)
    {
        $hardMatches[] = $match;
    }
    else if ($match['score'] >= 45 || $match['score'] === 40)
    {
        $softMatches[] = $match;
    }
}

jsonResponse(array(
    'success' => 1,
    'hardMatches' => $hardMatches,
    'softMatches' => $softMatches
));

?>
