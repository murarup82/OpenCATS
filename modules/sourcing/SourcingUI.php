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

        if (!eval(Hooks::get('SOURCING_HANDLE_REQUEST'))) return;

        switch ($action)
        {
            default:
                if (isset($_POST['postback']))
                {
                    $this->onSave();
                }
                else
                {
                    $this->listSourcing();
                }
                break;
        }
    }

    private function listSourcing()
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
        while ($cursor <= $end)
        {
            $weekYear = (int) $cursor->format('o');
            $weekNumber = (int) $cursor->format('W');
            $key = $weekYear . '-' . $weekNumber;
            $label = substr($cursor->format('o'), -2) . 'W' . $cursor->format('W');

            $sourcingRows[] = array(
                'weekYear' => $weekYear,
                'weekNumber' => $weekNumber,
                'weekLabel' => $label,
                'count' => isset($counts[$key]) ? $counts[$key] : 0,
                'isCurrent' => ($weekYear === $currentWeekYear && $weekNumber === $currentWeekNumber)
            );

            $cursor->modify('+1 week');
        }

        $sourcingRows = array_reverse($sourcingRows);

        $this->_template->assign('active', $this);
        $this->_template->assign('sourcingRows', $sourcingRows);
        $this->_template->display('./modules/sourcing/Sourcing.tpl');
    }

    private function onSave()
    {
        $weekYears = isset($_POST['weekYear']) ? $_POST['weekYear'] : array();
        $weekNumbers = isset($_POST['weekNumber']) ? $_POST['weekNumber'] : array();
        $counts = isset($_POST['sourcedCount']) ? $_POST['sourcedCount'] : array();

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
                CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'Invalid week or year.');
            }

            $weekYear = (int) $yearRaw;
            $weekNumber = (int) $weekRaw;
            if ($weekYear < 2000 || $weekYear > 2100 || $weekNumber < 1 || $weekNumber > 53)
            {
                CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'Invalid week or year.');
            }

            $validator = new DateTime();
            $validator->setISODate($weekYear, $weekNumber);
            if ((int) $validator->format('o') !== $weekYear || (int) $validator->format('W') !== $weekNumber)
            {
                CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'Invalid week or year.');
            }

            if ($countRaw === '')
            {
                $countRaw = '0';
            }
            if (!ctype_digit($countRaw))
            {
                CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'Invalid sourced count.');
            }

            $key = $weekYear . '-' . $weekNumber;
            $entries[$key] = array(
                'weekYear' => $weekYear,
                'weekNumber' => $weekNumber,
                'count' => (int) $countRaw
            );
        }

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

        CATSUtility::transferRelativeURI('m=sourcing');
    }
}

?>
