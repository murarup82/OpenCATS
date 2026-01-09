<?php
/*
 * CATS
 * AJAX Job Order Search Interface
 */

include_once(LEGACY_ROOT . '/lib/Search.php');

$interface = new SecureAJAXInterface();

if ($_SESSION['CATS']->getAccessLevel('joborders.search') < ACCESS_LEVEL_READ)
{
    $interface->outputXMLErrorPage(-1, 'Invalid user level for action.');
    die();
}

$siteID = $interface->getSiteID();

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

$maxResults = 25;
if (isset($_REQUEST['maxResults']) && ctype_digit((string) $_REQUEST['maxResults']))
{
    $maxResults = (int) $_REQUEST['maxResults'];
    if ($maxResults <= 0)
    {
        $maxResults = 25;
    }
}

if ($query === '')
{
    $db = DatabaseConnection::getInstance();
    $sql = sprintf(
        "SELECT
            joborder.joborder_id AS jobOrderID,
            joborder.title AS title,
            company.name AS companyName
        FROM
            joborder
        LEFT JOIN company
            ON joborder.company_id = company.company_id
        WHERE
            joborder.site_id = %s
        AND
            joborder.is_admin_hidden = 0
        AND
            (joborder.status IN %s)
        ORDER BY
            joborder.date_modified DESC
        LIMIT %s, %s",
        $db->makeQueryInteger($siteID),
        JobOrderStatuses::getOpenStatusSQL(),
        $db->makeQueryInteger($offset),
        $db->makeQueryInteger($maxResults)
    );
    $merged = $db->getAllAssoc($sql);

    $output =
        "<data>\n" .
        "    <errorcode>0</errorcode>\n" .
        "    <errormessage></errormessage>\n" .
        "    <totalelements>" . count($merged) . "</totalelements>\n";

    foreach ($merged as $row)
    {
        $output .=
            "    <joborder>\n" .
            "        <id>" . (int) $row['jobOrderID'] . "</id>\n" .
            "        <title>" . htmlspecialchars($row['title'], ENT_QUOTES) . "</title>\n" .
            "        <companyname>" . htmlspecialchars($row['companyName'], ENT_QUOTES) . "</companyname>\n" .
            "    </joborder>\n";
    }

    $output .=
        "</data>\n";

    $interface->outputXMLPage($output);
    die();
}

$search = new SearchJobOrders($siteID);
$results = $search->byTitle($query, 'joborder.date_modified', 'DESC', true);
$resultsByCompany = $search->byCompanyName($query, 'joborder.date_modified', 'DESC', true);

$merged = array();
foreach (array($results, $resultsByCompany) as $resultSet)
{
    if (empty($resultSet))
    {
        continue;
    }

    foreach ($resultSet as $row)
    {
        $jobOrderID = $row['jobOrderID'];
        if (isset($merged[$jobOrderID]))
        {
            continue;
        }
        $merged[$jobOrderID] = $row;
        if (count($merged) >= $maxResults)
        {
            break 2;
        }
    }
}

$output =
    "<data>\n" .
    "    <errorcode>0</errorcode>\n" .
    "    <errormessage></errormessage>\n" .
    "    <totalelements>" . count($merged) . "</totalelements>\n";

foreach ($merged as $row)
{
    $output .=
        "    <joborder>\n" .
        "        <id>" . (int) $row['jobOrderID'] . "</id>\n" .
        "        <title>" . htmlspecialchars($row['title'], ENT_QUOTES) . "</title>\n" .
        "        <companyname>" . htmlspecialchars($row['companyName'], ENT_QUOTES) . "</companyname>\n" .
        "    </joborder>\n";
}

$output .=
    "</data>\n";

/* Send back the XML data. */
$interface->outputXMLPage($output);

?>
