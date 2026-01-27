<?php
/*
 * CATS
 * Job Order Hiring Plan Library
 */

class JobOrderHiringPlans
{
    private $_db;
    private $_siteID;

    public function __construct($siteID)
    {
        $this->_siteID = $siteID;
        $this->_db = DatabaseConnection::getInstance();
    }

    public function getByJobOrder($jobOrderID)
    {
        // Return raw ISO dates to avoid format ambiguities; UI handles display.
        $sql = sprintf(
            "SELECT
                joborder_hiring_plan_id AS planID,
                joborder_id AS jobOrderID,
                start_date AS startDate,
                end_date AS endDate,
                openings,
                priority,
                notes
            FROM
                joborder_hiring_plan
            WHERE
                joborder_id = %s
            AND
                site_id = %s
            ORDER BY
                start_date IS NULL,
                start_date ASC,
                end_date ASC,
                priority ASC,
                joborder_hiring_plan_id ASC",
            $this->_db->makeQueryInteger($jobOrderID),
            $this->_siteID
        );

        $rs = $this->_db->getAllAssoc($sql);
        if (!is_array($rs))
        {
            return array();
        }

        foreach ($rs as $index => $row)
        {
            if ($row['startDate'] === null)
            {
                $rs[$index]['startDate'] = '';
            }
            if ($row['endDate'] === null)
            {
                $rs[$index]['endDate'] = '';
            }
            if ($row['notes'] === null)
            {
                $rs[$index]['notes'] = '';
            }
        }

        return $rs;
    }

    public function getCount($jobOrderID)
    {
        $sql = sprintf(
            "SELECT COUNT(*) AS total
            FROM
                joborder_hiring_plan
            WHERE
                joborder_id = %s
            AND
                site_id = %s",
            $this->_db->makeQueryInteger($jobOrderID),
            $this->_siteID
        );
        $rs = $this->_db->getAssoc($sql);

        if (empty($rs))
        {
            return 0;
        }

        return (int) $rs['total'];
    }

    public function getTotalOpenings($jobOrderID)
    {
        $sql = sprintf(
            "SELECT IFNULL(SUM(openings), 0) AS totalOpenings
            FROM
                joborder_hiring_plan
            WHERE
                joborder_id = %s
            AND
                site_id = %s",
            $this->_db->makeQueryInteger($jobOrderID),
            $this->_siteID
        );
        $rs = $this->_db->getAssoc($sql);
        if (empty($rs))
        {
            return 0;
        }

        return (int) $rs['totalOpenings'];
    }

    public function createDefaultPlan($jobOrderID, $openings, $userID)
    {
        if ($this->getCount($jobOrderID) > 0)
        {
            return;
        }

        $sql = sprintf(
            "INSERT INTO joborder_hiring_plan (
                joborder_id,
                site_id,
                start_date,
                end_date,
                openings,
                priority,
                notes,
                date_created,
                date_modified,
                entered_by,
                modified_by
            )
            VALUES (
                %s,
                %s,
                NULL,
                NULL,
                %s,
                1,
                '',
                NOW(),
                NOW(),
                %s,
                %s
            )",
            $this->_db->makeQueryInteger($jobOrderID),
            $this->_siteID,
            $this->_db->makeQueryInteger($openings),
            $this->_db->makeQueryInteger($userID),
            $this->_db->makeQueryInteger($userID)
        );
        $this->_db->query($sql);

        $this->syncOpenings($jobOrderID);
    }

    public function savePlans($jobOrderID, $plans, $deleteIDs, $userID)
    {
        if (!empty($deleteIDs))
        {
            $deleteIDs = array_unique(array_map('intval', $deleteIDs));
            $deleteIDs = array_filter($deleteIDs);
            if (!empty($deleteIDs))
            {
                $sql = sprintf(
                    "DELETE FROM joborder_hiring_plan
                    WHERE
                        joborder_hiring_plan_id IN (%s)
                    AND
                        joborder_id = %s
                    AND
                        site_id = %s",
                    implode(',', $deleteIDs),
                    $this->_db->makeQueryInteger($jobOrderID),
                    $this->_siteID
                );
                $this->_db->query($sql);
            }
        }

        foreach ($plans as $plan)
        {
            $planID = (int) $plan['planID'];
            $startDate = $plan['startDate'];
            $endDate = $plan['endDate'];
            $openings = (int) $plan['openings'];
            $priority = (int) $plan['priority'];
            $notes = $plan['notes'];

            if ($priority < 1 || $priority > 5)
            {
                $priority = 1;
            }

            if ($planID > 0)
            {
                $sql = sprintf(
                    "UPDATE joborder_hiring_plan
                    SET
                        start_date = %s,
                        end_date = %s,
                        openings = %s,
                        priority = %s,
                        notes = %s,
                        date_modified = NOW(),
                        modified_by = %s
                    WHERE
                        joborder_hiring_plan_id = %s
                    AND
                        joborder_id = %s
                    AND
                        site_id = %s",
                    $this->_db->makeQueryStringOrNULL($startDate),
                    $this->_db->makeQueryStringOrNULL($endDate),
                    $this->_db->makeQueryInteger($openings),
                    $this->_db->makeQueryInteger($priority),
                    $this->_db->makeQueryStringOrNULL($notes),
                    $this->_db->makeQueryInteger($userID),
                    $this->_db->makeQueryInteger($planID),
                    $this->_db->makeQueryInteger($jobOrderID),
                    $this->_siteID
                );
                $this->_db->query($sql);
            }
            else
            {
                $sql = sprintf(
                    "INSERT INTO joborder_hiring_plan (
                        joborder_id,
                        site_id,
                        start_date,
                        end_date,
                        openings,
                        priority,
                        notes,
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
                        %s,
                        %s,
                        %s,
                        NOW(),
                        NOW(),
                        %s,
                        %s
                    )",
                    $this->_db->makeQueryInteger($jobOrderID),
                    $this->_siteID,
                    $this->_db->makeQueryStringOrNULL($startDate),
                    $this->_db->makeQueryStringOrNULL($endDate),
                    $this->_db->makeQueryInteger($openings),
                    $this->_db->makeQueryInteger($priority),
                    $this->_db->makeQueryStringOrNULL($notes),
                    $this->_db->makeQueryInteger($userID),
                    $this->_db->makeQueryInteger($userID)
                );
                $this->_db->query($sql);
            }
        }

        $this->syncOpenings($jobOrderID);
    }

    public function deleteByJobOrder($jobOrderID)
    {
        $sql = sprintf(
            "DELETE FROM joborder_hiring_plan
            WHERE
                joborder_id = %s
            AND
                site_id = %s",
            $this->_db->makeQueryInteger($jobOrderID),
            $this->_siteID
        );
        $this->_db->query($sql);
    }

    private function syncOpenings($jobOrderID)
    {
        $sql = sprintf(
            "SELECT
                IFNULL(SUM(openings), 0) AS totalOpenings,
                COUNT(*) AS rowCount
            FROM
                joborder_hiring_plan
            WHERE
                joborder_id = %s
            AND
                site_id = %s",
            $this->_db->makeQueryInteger($jobOrderID),
            $this->_siteID
        );
        $rs = $this->_db->getAssoc($sql);
        $totalOpenings = 0;
        if (!empty($rs))
        {
            $totalOpenings = (int) $rs['totalOpenings'];
        }

        $sql = sprintf(
            "SELECT
                openings,
                openings_available AS openingsAvailable
            FROM
                joborder
            WHERE
                joborder_id = %s
            AND
                site_id = %s",
            $this->_db->makeQueryInteger($jobOrderID),
            $this->_siteID
        );
        $jobOrderRS = $this->_db->getAssoc($sql);
        $currentOpenings = 0;
        $currentAvailable = 0;
        if (!empty($jobOrderRS))
        {
            $currentOpenings = (int) $jobOrderRS['openings'];
            $currentAvailable = (int) $jobOrderRS['openingsAvailable'];
        }

        $filled = $currentOpenings - $currentAvailable;
        if ($filled < 0)
        {
            $filled = 0;
        }

        $newAvailable = $totalOpenings - $filled;
        if ($newAvailable < 0)
        {
            $newAvailable = 0;
        }
        if ($newAvailable > $totalOpenings)
        {
            $newAvailable = $totalOpenings;
        }

        $sql = sprintf(
            "UPDATE joborder
            SET
                openings = %s,
                openings_available = %s,
                date_modified = NOW()
            WHERE
                joborder_id = %s
            AND
                site_id = %s",
            $this->_db->makeQueryInteger($totalOpenings),
            $this->_db->makeQueryInteger($newAvailable),
            $this->_db->makeQueryInteger($jobOrderID),
            $this->_siteID
        );
        $this->_db->query($sql);
    }
}

?>
