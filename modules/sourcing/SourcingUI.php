<?php
/*
 * CATS
 * Sourcing Module
 */

include_once(LEGACY_ROOT . '/lib/CommonErrors.php');

class SourcingUI extends UserInterface
{
    public function __construct()
    {
        parent::__construct();

        $this->_authenticationRequired = true;
        $this->_moduleDirectory = 'sourcing';
        $this->_moduleName = 'sourcing';
        $this->_moduleTabText = 'Sourcing';
        $this->_subTabs = array();

        $this->_schema = array(
            '1' => '
                CREATE TABLE IF NOT EXISTS `sourcing_weekly` (
                    `sourcing_weekly_id` int(11) NOT NULL auto_increment,
                    `site_id` int(11) NOT NULL default 0,
                    `week_year` int(11) NOT NULL,
                    `week_number` int(11) NOT NULL,
                    `sourced_count` int(11) NOT NULL default 0,
                    `date_created` datetime default NULL,
                    `date_modified` datetime default NULL,
                    `entered_by` int(11) default NULL,
                    `modified_by` int(11) default NULL,
                    PRIMARY KEY (`sourcing_weekly_id`),
                    UNIQUE KEY `IDX_sourcing_week` (`site_id`, `week_year`, `week_number`)
                ) ENGINE=MyISAM DEFAULT CHARSET=utf8;
            '
        );
    }

    public function handleRequest()
    {
        $action = $this->getAction();
        $isModernJSON = $this->isModernJSONRequest();
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_REQUEST));

        if (!eval(Hooks::get('SOURCING_HANDLE_REQUEST'))) return;

        switch ($action)
        {
            default:
                if ($isModernJSON)
                {
                    if ($modernPage !== '' && $modernPage !== 'sourcing-workspace')
                    {
                        $this->respondModernJSON(400, array(
                            'error' => true,
                            'message' => 'Unsupported modern page contract.',
                            'requestedPage' => $modernPage
                        ));
                        return;
                    }

                    if ($_SERVER['REQUEST_METHOD'] === 'POST')
                    {
                        $this->onSave(true);
                    }
                    else
                    {
                        $this->renderModernSourcingJSON('sourcing-workspace');
                    }
                }
                else
                {
                    if (isset($_POST['postback']))
                    {
                        $this->onSave(false);
                    }
                    else
                    {
                        $this->listSourcing();
                    }
                }
                break;
        }
    }

    private function listSourcing()
    {
        $data = $this->buildSourcingRowsData();

        $this->_template->assign('active', $this);
        $this->_template->assign('sourcingRows', $data['rows']);
        $this->_template->display('./modules/sourcing/Sourcing.tpl');
    }

    private function onSave($respondJSON = false)
    {
        $weekYears = isset($_POST['weekYear']) ? $_POST['weekYear'] : array();
        $weekNumbers = isset($_POST['weekNumber']) ? $_POST['weekNumber'] : array();
        $counts = isset($_POST['sourcedCount']) ? $_POST['sourcedCount'] : array();
        $validation = $this->parseSourcingEntries($weekYears, $weekNumbers, $counts);
        if (!$validation['success'])
        {
            if ($respondJSON)
            {
                $this->respondModernJSON(400, array(
                    'success' => false,
                    'code' => 'invalidInput',
                    'message' => $validation['message']
                ));
                return;
            }

            CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, $validation['message']);
            return;
        }
        $entries = $validation['entries'];

        $db = DatabaseConnection::getInstance();
        foreach ($entries as $entry)
        {
            $sql = sprintf(
                "INSERT INTO sourcing_weekly (
                    site_id,
                    week_year,
                    week_number,
                    sourced_count,
                    date_created,
                    date_modified,
                    entered_by,
                    modified_by
                )
                VALUES (
                    %s,
                    %s,
                    %s,
                    %s,
                    NOW(),
                    NOW(),
                    %s,
                    %s
                )
                ON DUPLICATE KEY UPDATE
                    sourced_count = VALUES(sourced_count),
                    date_modified = NOW(),
                    modified_by = %s",
                $db->makeQueryInteger($this->_siteID),
                $db->makeQueryInteger($entry['weekYear']),
                $db->makeQueryInteger($entry['weekNumber']),
                $db->makeQueryInteger($entry['count']),
                $db->makeQueryInteger($this->_userID),
                $db->makeQueryInteger($this->_userID),
                $db->makeQueryInteger($this->_userID)
            );

            $db->query($sql);
        }

        if ($respondJSON)
        {
            $this->respondModernJSON(200, array(
                'success' => true,
                'savedCount' => count($entries),
                'message' => 'Sourcing rows saved.'
            ));
            return;
        }

        CATSUtility::transferRelativeURI('m=sourcing');
    }

    private function parseSourcingEntries($weekYears, $weekNumbers, $counts)
    {
        $rowCount = max(count($weekYears), count($weekNumbers), count($counts));
        $entries = array();
        for ($i = 0; $i < $rowCount; $i++)
        {
            $yearRaw = isset($weekYears[$i]) ? trim($weekYears[$i]) : '';
            $weekRaw = isset($weekNumbers[$i]) ? trim($weekNumbers[$i]) : '';
            $countRaw = isset($counts[$i]) ? trim($counts[$i]) : '';

            if ($yearRaw === '' || $weekRaw === '')
            {
                continue;
            }

            if (!ctype_digit($yearRaw) || !ctype_digit($weekRaw))
            {
                return array('success' => false, 'message' => 'Invalid week or year.');
            }

            $weekYear = (int) $yearRaw;
            $weekNumber = (int) $weekRaw;
            if ($weekYear < 2000 || $weekYear > 2100 || $weekNumber < 1 || $weekNumber > 53)
            {
                return array('success' => false, 'message' => 'Invalid week or year.');
            }

            $validator = new DateTime();
            $validator->setISODate($weekYear, $weekNumber);
            if ((int) $validator->format('o') !== $weekYear || (int) $validator->format('W') !== $weekNumber)
            {
                return array('success' => false, 'message' => 'Invalid week or year.');
            }

            if ($countRaw === '')
            {
                $countRaw = '0';
            }
            if (!ctype_digit($countRaw))
            {
                return array('success' => false, 'message' => 'Invalid sourced count.');
            }

            $key = $weekYear . '-' . $weekNumber;
            $entries[$key] = array(
                'weekYear' => $weekYear,
                'weekNumber' => $weekNumber,
                'count' => (int) $countRaw
            );
        }

        return array(
            'success' => true,
            'entries' => $entries,
            'message' => ''
        );
    }

    private function buildSourcingRowsData()
    {
        $db = DatabaseConnection::getInstance();
        $siteID = $this->_siteID;

        $rows = $db->getAllAssoc(sprintf(
            "SELECT
                week_year AS weekYear,
                week_number AS weekNumber,
                sourced_count AS sourcedCount
            FROM
                sourcing_weekly
            WHERE
                site_id = %s",
            $db->makeQueryInteger($siteID)
        ));

        $counts = array();
        foreach ($rows as $row)
        {
            $key = (int) $row['weekYear'] . '-' . (int) $row['weekNumber'];
            $counts[$key] = (int) $row['sourcedCount'];
        }

        $startYear = 2026;
        $startWeek = 1;
        $currentWeek = new DateTime('today');
        $currentWeekYear = (int) $currentWeek->format('o');
        $currentWeekNumber = (int) $currentWeek->format('W');

        $cursor = new DateTime();
        $cursor->setISODate($startYear, $startWeek);
        $cursor->setTime(0, 0, 0);

        $end = new DateTime();
        $end->setISODate($currentWeekYear, $currentWeekNumber);
        $end->setTime(0, 0, 0);

        $sourcingRows = array();
        $totalSourced = 0;
        while ($cursor <= $end)
        {
            $weekYear = (int) $cursor->format('o');
            $weekNumber = (int) $cursor->format('W');
            $key = $weekYear . '-' . $weekNumber;
            $label = substr($cursor->format('o'), -2) . 'W' . $cursor->format('W');
            $count = isset($counts[$key]) ? (int) $counts[$key] : 0;

            $sourcingRows[] = array(
                'weekYear' => $weekYear,
                'weekNumber' => $weekNumber,
                'weekLabel' => $label,
                'count' => $count,
                'isCurrent' => ($weekYear === $currentWeekYear && $weekNumber === $currentWeekNumber)
            );
            $totalSourced += $count;

            $cursor->modify('+1 week');
        }

        $sourcingRows = array_reverse($sourcingRows);
        $weeksTotal = count($sourcingRows);
        $averagePerWeek = ($weeksTotal > 0) ? round(((float) $totalSourced / (float) $weeksTotal), 2) : 0.0;

        return array(
            'rows' => $sourcingRows,
            'startYear' => $startYear,
            'startWeek' => $startWeek,
            'currentWeekYear' => $currentWeekYear,
            'currentWeekNumber' => $currentWeekNumber,
            'totalSourced' => $totalSourced,
            'weeksTotal' => $weeksTotal,
            'averagePerWeek' => $averagePerWeek
        );
    }

    private function renderModernSourcingJSON($modernPage)
    {
        $data = $this->buildSourcingRowsData();
        $baseURL = CATSUtility::getIndexName();

        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'sourcing.list.v1',
                'modernPage' => $modernPage
            ),
            'state' => array(
                'startYear' => (int) $data['startYear'],
                'startWeek' => (int) $data['startWeek'],
                'currentWeekYear' => (int) $data['currentWeekYear'],
                'currentWeekNumber' => (int) $data['currentWeekNumber'],
                'weeksTotal' => (int) $data['weeksTotal']
            ),
            'summary' => array(
                'totalSourced' => (int) $data['totalSourced'],
                'averagePerWeek' => (float) $data['averagePerWeek']
            ),
            'actions' => array(
                'saveURL' => sprintf('%s?m=sourcing&format=modern-json&modernPage=sourcing-workspace&ui=legacy', $baseURL),
                'legacyURL' => sprintf('%s?m=sourcing&ui=legacy', $baseURL)
            ),
            'rows' => $data['rows']
        );

        $this->respondModernJSON(200, $payload);
    }

    private function isModernJSONRequest()
    {
        return (strtolower($this->getTrimmedInput('format', $_REQUEST)) === 'modern-json');
    }

    private function respondModernJSON($statusCode, $payload)
    {
        $statusCode = (int) $statusCode;
        if ($statusCode <= 0)
        {
            $statusCode = 200;
        }

        if (!headers_sent())
        {
            if (function_exists('http_response_code'))
            {
                http_response_code($statusCode);
            }
            else
            {
                header(sprintf('HTTP/1.1 %d', $statusCode));
            }
            header('Content-Type: application/json; charset=' . AJAX_ENCODING);
            header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        }

        echo json_encode($payload);
    }
}

?>
