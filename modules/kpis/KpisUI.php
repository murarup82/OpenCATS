<?php
/*
 * CATS
 * KPIs Module
 */

include_once(LEGACY_ROOT . '/lib/CommonErrors.php');
include_once(LEGACY_ROOT . '/lib/DateUtility.php');
include_once(LEGACY_ROOT . '/lib/ExtraFields.php');
include_once(LEGACY_ROOT . '/lib/JobOrderStatuses.php');
include_once(LEGACY_ROOT . '/lib/Pager.php');

class KpisUI extends UserInterface
{
    const MONITORED_JOBORDER_FIELD = 'Monitored JO';
    const EXPECTED_CONVERSION_FIELD = 'Conversion Rate';
    const EXPECTED_COMPLETION_FIELD = 'Expected Completion Date';

    public function __construct()
    {
        parent::__construct();

        $this->_authenticationRequired = true;
        $this->_moduleDirectory = 'kpis';
        $this->_moduleName = 'kpis';
        $this->_moduleTabText = 'KPIs';
        $this->_subTabs = array();
    }

    public function handleRequest()
    {
        $action = $this->getAction();

        if (!eval(Hooks::get('KPI_HANDLE_REQUEST'))) return;

        switch ($action)
        {
            case 'details':
                $this->details();
                break;
            default:
                $this->listKpis();
                break;
        }
    }

    private function listKpis()
    {
        $db = DatabaseConnection::getInstance();
        $siteID = $this->_siteID;
        $officialReports = true;
        $showDeadline = false;
        $showCompletionRate = false;
        $hideZeroOpenPositions = true;
        if (isset($_GET['officialReports']))
        {
            if ($_GET['officialReports'] == '0' || $_GET['officialReports'] === 'false')
            {
                $officialReports = false;
            }
            else
            {
                $officialReports = true;
            }
        }
        $candidateSourceScope = $this->normalizeCandidateSourceScope(
            isset($_GET['candidateSourceScope']) ? $_GET['candidateSourceScope'] : 'all'
        );
        if (isset($_GET['showDeadline']))
        {
            if ($_GET['showDeadline'] == '0' || $_GET['showDeadline'] === 'false')
            {
                $showDeadline = false;
            }
            else
            {
                $showDeadline = true;
            }
        }
        if (isset($_GET['hideZeroOpenPositions']))
        {
            if ($_GET['hideZeroOpenPositions'] == '0' || $_GET['hideZeroOpenPositions'] === 'false')
            {
                $hideZeroOpenPositions = false;
            }
            else
            {
                $hideZeroOpenPositions = true;
            }
        }
        if (isset($_GET['showCompletionRate']))
        {
            if ($_GET['showCompletionRate'] == '0' || $_GET['showCompletionRate'] === 'false')
            {
                $showCompletionRate = false;
            }
            else
            {
                $showCompletionRate = true;
            }
        }

        $companiesRS = $db->getAllAssoc(sprintf(
            "SELECT
                company_id AS companyID,
                name
            FROM
                company
            WHERE
                site_id = %s
            ORDER BY
                name ASC",
            $db->makeQueryInteger($siteID)
        ));

        $companyData = array();
        foreach ($companiesRS as $company)
        {
            $companyData[$company['companyID']] = array(
                'companyID' => (int) $company['companyID'],
                'companyName' => $company['name'],
                'expectedConversionMin' => null,
                'expectedConversionMax' => null,
                'newPositions' => 0,
                'newPositionsLastWeek' => 0,
                'totalOpenPositions' => 0,
                'totalOpenPositionsLastWeek' => 0,
                'filledPositions' => 0,
                'filledPositionsLastWeek' => 0,
                'totalPlanOpenings' => 0,
                'totalPlanOpeningsLastWeek' => 0,
                'expectedFilled' => 0.0,
                'expectedFilledLastWeek' => 0.0,
                'hasData' => false
            );
        }

        $expectedFieldName = strtolower(self::EXPECTED_CONVERSION_FIELD);
        $expectedRS = $db->getAllAssoc(sprintf(
            "SELECT
                data_item_id AS jobOrderID,
                value
            FROM
                extra_field
            WHERE
                site_id = %s
            AND
                data_item_type = %s
            AND
                LOWER(field_name) = %s",
            $db->makeQueryInteger($siteID),
            DATA_ITEM_JOBORDER,
            $db->makeQueryString($expectedFieldName)
        ));

        $conversionByJobOrder = array();
        foreach ($expectedRS as $row)
        {
            $percent = $this->parseExpectedConversion($row['value']);
            $conversionByJobOrder[(int) $row['jobOrderID']] = $percent;
        }

        $completionFieldName = strtolower(self::EXPECTED_COMPLETION_FIELD);
        $completionRS = $db->getAllAssoc(sprintf(
            "SELECT
                data_item_id AS jobOrderID,
                value
            FROM
                extra_field
            WHERE
                site_id = %s
            AND
                data_item_type = %s
            AND
                LOWER(field_name) = %s",
            $db->makeQueryInteger($siteID),
            DATA_ITEM_JOBORDER,
            $db->makeQueryString($completionFieldName)
        ));

        $expectedCompletionByJobOrder = array();
        foreach ($completionRS as $row)
        {
            $expectedCompletionByJobOrder[(int) $row['jobOrderID']] = trim((string) $row['value']);
        }

        $monitoredJobOrders = array();
        if ($officialReports)
        {
            $monitoredFieldName = strtolower(self::MONITORED_JOBORDER_FIELD);
            $monitoredRS = $db->getAllAssoc(sprintf(
                "SELECT
                    data_item_id AS jobOrderID,
                    value
                FROM
                    extra_field
                WHERE
                    site_id = %s
                AND
                    data_item_type = %s
                AND
                    LOWER(field_name) = %s",
                $db->makeQueryInteger($siteID),
                DATA_ITEM_JOBORDER,
                $db->makeQueryString($monitoredFieldName)
            ));

            foreach ($monitoredRS as $row)
            {
                if ($this->isTruthyExtraField($row['value']))
                {
                    $monitoredJobOrders[(int) $row['jobOrderID']] = true;
                }
            }
        }

        $jobOrdersRS = $db->getAllAssoc(sprintf(
            "SELECT
                joborder_id AS jobOrderID,
                title,
                company_id AS companyID,
                status,
                date_created AS dateCreated,
                openings_available AS openingsAvailable,
                openings
            FROM
                joborder
            WHERE
                site_id = %s
            AND
                status IN %s",
            $db->makeQueryInteger($siteID),
            JobOrderStatuses::getOpenStatusSQL()
        ));

        $jobOrders = array();
        foreach ($jobOrdersRS as $row)
        {
            $jobOrders[(int) $row['jobOrderID']] = array(
                'jobOrderID' => (int) $row['jobOrderID'],
                'title' => $row['title'],
                'companyID' => (int) $row['companyID'],
                'status' => $row['status'],
                'dateCreated' => $row['dateCreated'],
                'openingsAvailable' => (int) $row['openingsAvailable'],
                'openings' => (int) $row['openings']
            );
        }

        $filledByJobOrder = array();
        $filledByJobOrderPrev = array();
        $monitoredFilterHistory = '';
        if (!empty($jobOrders))
        {
            if ($officialReports)
            {
                if (!empty($monitoredJobOrders))
                {
                    $monitoredIDs = $this->formatIntegerList(array_keys($monitoredJobOrders));
                    $monitoredFilterHistory = sprintf('AND cjh.joborder_id IN (%s)', $monitoredIDs);
                }
                else
                {
                    $monitoredFilterHistory = 'AND 1 = 0';
                }
            }

            $now = new DateTime();
            $filledCurrentRS = $db->getAllAssoc(sprintf(
                "SELECT
                    last_status.joborder_id AS jobOrderID,
                    COUNT(*) AS filledCount
                FROM
                    (
                        SELECT
                            cjh.candidate_id,
                            cjh.joborder_id,
                            MAX(cjh.date) AS maxDate
                        FROM
                            candidate_joborder_status_history AS cjh
                        INNER JOIN joborder AS jo
                            ON jo.joborder_id = cjh.joborder_id
                            AND jo.site_id = cjh.site_id
                        WHERE
                            cjh.site_id = %s
                        AND
                            cjh.date <= %s
                        AND
                            jo.status IN %s
                        %s
                        GROUP BY
                            cjh.candidate_id,
                            cjh.joborder_id
                    ) AS last_status
                INNER JOIN candidate_joborder_status_history AS cjh
                    ON cjh.candidate_id = last_status.candidate_id
                    AND cjh.joborder_id = last_status.joborder_id
                    AND cjh.date = last_status.maxDate
                WHERE
                    cjh.site_id = %s
                AND
                    cjh.status_to = %s
                GROUP BY
                    last_status.joborder_id",
                $db->makeQueryInteger($siteID),
                $db->makeQueryString($now->format('Y-m-d H:i:s')),
                JobOrderStatuses::getOpenStatusSQL(),
                $monitoredFilterHistory,
                $db->makeQueryInteger($siteID),
                $db->makeQueryInteger(PIPELINE_STATUS_HIRED)
            ));

            foreach ($filledCurrentRS as $row)
            {
                $filledByJobOrder[(int) $row['jobOrderID']] = (int) $row['filledCount'];
            }
        }

        $planRS = $db->getAllAssoc(sprintf(
            "SELECT
                joborder_id AS jobOrderID,
                start_date AS startDate,
                end_date AS endDate,
                openings
            FROM
                joborder_hiring_plan
            WHERE
                site_id = %s",
            $db->makeQueryInteger($siteID)
        ));

        $plansByJobOrder = array();
        foreach ($planRS as $row)
        {
            $jobOrderID = (int) $row['jobOrderID'];
            if (!isset($plansByJobOrder[$jobOrderID]))
            {
                $plansByJobOrder[$jobOrderID] = array();
            }

            $plansByJobOrder[$jobOrderID][] = array(
                'startDate' => $row['startDate'],
                'endDate' => $row['endDate'],
                'openings' => (int) $row['openings']
            );
        }

        $today = new DateTime('today');
        $weekStart = clone $today;
        $weekStart->modify('monday this week');
        $weekStart->setTime(0, 0, 0);
        $weekEnd = clone $weekStart;
        $weekEnd->modify('+6 days');
        $weekEnd->setTime(23, 59, 59);

        $lastWeekEnd = new DateTime('last sunday');
        $lastWeekEnd->setTime(23, 59, 59);
        $windowEnd = clone $lastWeekEnd;
        $windowEnd->modify('+3 months');
        $windowEnd->modify('last day of this month');
        $windowEnd->setTime(23, 59, 59);

        $weekStartPrev = clone $weekStart;
        $weekStartPrev->modify('-7 days');
        $weekEndPrev = clone $weekEnd;
        $weekEndPrev->modify('-7 days');

        $lastWeekEndPrev = clone $lastWeekEnd;
        $lastWeekEndPrev->modify('-7 days');
        $windowEndPrev = clone $lastWeekEndPrev;
        $windowEndPrev->modify('+3 months');
        $windowEndPrev->modify('last day of this month');
        $windowEndPrev->setTime(23, 59, 59);

        if (!empty($jobOrders))
        {
            $filledPrevRS = $db->getAllAssoc(sprintf(
                "SELECT
                    last_status.joborder_id AS jobOrderID,
                    COUNT(*) AS filledCount
                FROM
                    (
                        SELECT
                            cjh.candidate_id,
                            cjh.joborder_id,
                            MAX(cjh.date) AS maxDate
                        FROM
                            candidate_joborder_status_history AS cjh
                        INNER JOIN joborder AS jo
                            ON jo.joborder_id = cjh.joborder_id
                            AND jo.site_id = cjh.site_id
                        WHERE
                            cjh.site_id = %s
                        AND
                            cjh.date <= %s
                        AND
                            jo.status IN %s
                        %s
                        GROUP BY
                            cjh.candidate_id,
                            cjh.joborder_id
                    ) AS last_status
                INNER JOIN candidate_joborder_status_history AS cjh
                    ON cjh.candidate_id = last_status.candidate_id
                    AND cjh.joborder_id = last_status.joborder_id
                    AND cjh.date = last_status.maxDate
                WHERE
                    cjh.site_id = %s
                AND
                    cjh.status_to = %s
                GROUP BY
                    last_status.joborder_id",
                $db->makeQueryInteger($siteID),
                $db->makeQueryString($lastWeekEndPrev->format('Y-m-d H:i:s')),
                JobOrderStatuses::getOpenStatusSQL(),
                $monitoredFilterHistory,
                $db->makeQueryInteger($siteID),
                $db->makeQueryInteger(PIPELINE_STATUS_HIRED)
            ));

            foreach ($filledPrevRS as $row)
            {
                $filledByJobOrderPrev[(int) $row['jobOrderID']] = (int) $row['filledCount'];
            }
        }

        $assignedByJobOrder = array();
        $hiredByJobOrder = array();
        $approvedEverByJobOrder = array();
        $eligibleJobOrderIDs = array();
        foreach ($jobOrders as $jobOrder)
        {
            if ($officialReports && !isset($monitoredJobOrders[$jobOrder['jobOrderID']]))
            {
                continue;
            }
            $eligibleJobOrderIDs[] = (int) $jobOrder['jobOrderID'];
        }

        if (!empty($eligibleJobOrderIDs))
        {
            $statusCountsRS = $db->getAllAssoc(sprintf(
                "SELECT
                    joborder_id AS jobOrderID,
                    status_to AS statusTo,
                    COUNT(DISTINCT candidate_id) AS candidateCount
                FROM
                    candidate_joborder_status_history
                WHERE
                    site_id = %s
                AND
                    joborder_id IN (%s)
                AND
                    status_to IN (%s, %s)
                GROUP BY
                    joborder_id,
                    status_to",
                $db->makeQueryInteger($siteID),
                $this->formatIntegerList($eligibleJobOrderIDs),
                $db->makeQueryInteger(PIPELINE_STATUS_ALLOCATED),
                $db->makeQueryInteger(PIPELINE_STATUS_HIRED)
            ));

            foreach ($statusCountsRS as $row)
            {
                $jobOrderID = (int) $row['jobOrderID'];
                $statusTo = (int) $row['statusTo'];
                $count = (int) $row['candidateCount'];
                if ($statusTo === PIPELINE_STATUS_ALLOCATED)
                {
                    $assignedByJobOrder[$jobOrderID] = $count;
                }
                else if ($statusTo === PIPELINE_STATUS_HIRED)
                {
                    $hiredByJobOrder[$jobOrderID] = $count;
                }
            }

            $approvedRS = $db->getAllAssoc(sprintf(
                "SELECT
                    joborder_id AS jobOrderID,
                    COUNT(DISTINCT candidate_id) AS candidateCount
                FROM
                    candidate_joborder_status_history
                WHERE
                    site_id = %s
                AND
                    joborder_id IN (%s)
                AND
                    status_to = %s
                GROUP BY
                    joborder_id",
                $db->makeQueryInteger($siteID),
                $this->formatIntegerList($eligibleJobOrderIDs),
                $db->makeQueryInteger(PIPELINE_STATUS_CUSTOMER_APPROVED)
            ));

            foreach ($approvedRS as $row)
            {
                $approvedEverByJobOrder[(int) $row['jobOrderID']] = (int) $row['candidateCount'];
            }
        }

        $openPositionsByJobOrder = array();
        foreach ($jobOrders as $jobOrder)
        {
            if ($officialReports &&
                !isset($monitoredJobOrders[$jobOrder['jobOrderID']]))
            {
                continue;
            }

            $companyID = $jobOrder['companyID'];
            if (!isset($companyData[$companyID]))
            {
                $companyData[$companyID] = array(
                    'companyID' => $companyID,
                    'companyName' => '(Unknown)',
                    'expectedConversionMin' => null,
                    'expectedConversionMax' => null,
                    'newPositions' => 0,
                    'newPositionsLastWeek' => 0,
                    'totalOpenPositions' => 0,
                    'totalOpenPositionsLastWeek' => 0,
                    'filledPositions' => 0,
                    'filledPositionsLastWeek' => 0,
                    'totalPlanOpenings' => 0,
                    'totalPlanOpeningsLastWeek' => 0,
                    'expectedFilled' => 0.0,
                    'expectedFilledLastWeek' => 0.0,
                    'hasData' => false
                );
            }

            $companyData[$companyID]['hasData'] = true;

            $filledPositions = 0;
            if (isset($filledByJobOrder[$jobOrder['jobOrderID']]))
            {
                $filledPositions = (int) $filledByJobOrder[$jobOrder['jobOrderID']];
            }
            $filledPositionsPrev = 0;
            if (isset($filledByJobOrderPrev[$jobOrder['jobOrderID']]))
            {
                $filledPositionsPrev = (int) $filledByJobOrderPrev[$jobOrder['jobOrderID']];
            }
            $companyData[$companyID]['filledPositions'] += $filledPositions;

            $conversion = 0.0;
            if (isset($conversionByJobOrder[$jobOrder['jobOrderID']]))
            {
                $conversion = $conversionByJobOrder[$jobOrder['jobOrderID']];
            }

            if ($companyData[$companyID]['expectedConversionMin'] === null ||
                $conversion < $companyData[$companyID]['expectedConversionMin'])
            {
                $companyData[$companyID]['expectedConversionMin'] = $conversion;
            }
            if ($companyData[$companyID]['expectedConversionMax'] === null ||
                $conversion > $companyData[$companyID]['expectedConversionMax'])
            {
                $companyData[$companyID]['expectedConversionMax'] = $conversion;
            }

            $plans = array();
            if (isset($plansByJobOrder[$jobOrder['jobOrderID']]))
            {
                $plans = $plansByJobOrder[$jobOrder['jobOrderID']];
            }
            if (empty($plans))
            {
                $plans[] = array(
                    'startDate' => null,
                    'endDate' => null,
                    'openings' => $jobOrder['openings']
                );
            }

            $activeOpenings = 0;
            $activeOpeningsPrev = 0;
            $expiredOpenings = 0;
            $windowOpenings = 0;
            $windowOpeningsPrev = 0;
            $totalPlanOpenings = 0;

            foreach ($plans as $plan)
            {
                $startDate = $this->parsePlanDate($plan['startDate']);
                $endDate = $this->parsePlanDate($plan['endDate']);
                $openings = (int) $plan['openings'];

                $totalPlanOpenings += $openings;

                if ($this->isPlanActive($startDate, $endDate, $today))
                {
                    $activeOpenings += $openings;
                }
                if ($this->isPlanActive($startDate, $endDate, $lastWeekEndPrev))
                {
                    $activeOpeningsPrev += $openings;
                }
                else if ($this->isPlanExpired($endDate, $today))
                {
                    $expiredOpenings += $openings;
                }

                if ($this->isPlanInWindow($startDate, $endDate, $lastWeekEnd, $windowEnd))
                {
                    $windowOpenings += $openings;
                }
                if ($this->isPlanInWindow($startDate, $endDate, $lastWeekEndPrev, $windowEndPrev))
                {
                    $windowOpeningsPrev += $openings;
                }
            }

            $openPositions = $windowOpenings;
            $openPositionsPrev = $windowOpeningsPrev;
            $openingsAvailable = $jobOrder['openingsAvailable'];
            if ($openingsAvailable < 0)
            {
                $openingsAvailable = 0;
            }
            if ($openPositions > $openingsAvailable)
            {
                $openPositions = $openingsAvailable;
            }
            if ($openPositionsPrev > $openingsAvailable)
            {
                $openPositionsPrev = $openingsAvailable;
            }

            $openPositionsByJobOrder[$jobOrder['jobOrderID']] = $openPositions;

            $jobCreated = $this->parseDateTime($jobOrder['dateCreated']);
            if ($jobCreated !== null && $jobCreated >= $weekStart && $jobCreated <= $weekEnd)
            {
                $companyData[$companyID]['newPositions'] += $activeOpenings;
            }
            if ($jobCreated !== null && $jobCreated >= $weekStartPrev && $jobCreated <= $weekEndPrev)
            {
                $companyData[$companyID]['newPositionsLastWeek'] += $activeOpeningsPrev;
            }

            $companyData[$companyID]['totalOpenPositions'] += $openPositions;
            $companyData[$companyID]['totalPlanOpenings'] += $totalPlanOpenings;
            $companyData[$companyID]['expectedFilled'] += ($openPositions * ($conversion / 100));
            if ($jobCreated !== null && $jobCreated <= $lastWeekEndPrev)
            {
                $companyData[$companyID]['totalOpenPositionsLastWeek'] += $openPositionsPrev;
                $companyData[$companyID]['totalPlanOpeningsLastWeek'] += $totalPlanOpenings;
                $companyData[$companyID]['expectedFilledLastWeek'] += ($openPositionsPrev * ($conversion / 100));
                $companyData[$companyID]['filledPositionsLastWeek'] += $filledPositionsPrev;
            }
        }

        $rows = array();
        $totals = array(
            'newPositions' => 0,
            'totalOpenPositions' => 0,
            'filledPositions' => 0,
            'expectedFilled' => 0,
            'expectedInFullPlan' => 0
        );
        $totalsLastWeek = array(
            'newPositions' => 0,
            'totalOpenPositions' => 0,
            'filledPositions' => 0,
            'expectedFilled' => 0,
            'expectedInFullPlan' => 0
        );

        foreach ($companyData as $company)
        {
            if (!$company['hasData'])
            {
                continue;
            }

            $filledPositions = (int) $company['filledPositions'];
            $filledPositionsLastWeek = (int) $company['filledPositionsLastWeek'];
            $expectedFilled = (int) round($company['expectedFilled']) - $filledPositions;
            if ($expectedFilled < 0)
            {
                $expectedFilled = 0;
            }
            $expectedInFullPlan = (int) $company['totalPlanOpenings'] - $filledPositions;
            if ($expectedInFullPlan < 0)
            {
                $expectedInFullPlan = 0;
            }
            $expectedFilledLastWeek = (int) round($company['expectedFilledLastWeek']) - $filledPositionsLastWeek;
            if ($expectedFilledLastWeek < 0)
            {
                $expectedFilledLastWeek = 0;
            }
            $expectedInFullPlanLastWeek = (int) $company['totalPlanOpeningsLastWeek'] - $filledPositionsLastWeek;
            if ($expectedInFullPlanLastWeek < 0)
            {
                $expectedInFullPlanLastWeek = 0;
            }
            $conversionRange = $this->formatPercentRange(
                $company['expectedConversionMin'],
                $company['expectedConversionMax']
            );

            $rows[] = array(
                'companyID' => $company['companyID'],
                'companyName' => $company['companyName'],
                'newPositions' => $company['newPositions'],
                'totalOpenPositions' => $company['totalOpenPositions'],
                'filledPositions' => $filledPositions,
                'expectedConversionDisplay' => $conversionRange,
                'expectedFilled' => $expectedFilled,
                'expectedInFullPlan' => $expectedInFullPlan
            );

            $totals['newPositions'] += $company['newPositions'];
            $totals['totalOpenPositions'] += $company['totalOpenPositions'];
            $totals['filledPositions'] += $filledPositions;
            $totals['expectedFilled'] += $expectedFilled;
            $totals['expectedInFullPlan'] += $expectedInFullPlan;

            $totalsLastWeek['newPositions'] += $company['newPositionsLastWeek'];
            $totalsLastWeek['totalOpenPositions'] += $company['totalOpenPositionsLastWeek'];
            $totalsLastWeek['filledPositions'] += $filledPositionsLastWeek;
            $totalsLastWeek['expectedFilled'] += $expectedFilledLastWeek;
            $totalsLastWeek['expectedInFullPlan'] += $expectedInFullPlanLastWeek;
        }

        $totalsDiff = array(
            'newPositions' => $totals['newPositions'] - $totalsLastWeek['newPositions'],
            'totalOpenPositions' => $totals['totalOpenPositions'] - $totalsLastWeek['totalOpenPositions'],
            'filledPositions' => $totals['filledPositions'] - $totalsLastWeek['filledPositions'],
            'expectedFilled' => $totals['expectedFilled'] - $totalsLastWeek['expectedFilled'],
            'expectedInFullPlan' => $totals['expectedInFullPlan'] - $totalsLastWeek['expectedInFullPlan']
        );

        $jobOrderKpiRows = array();
        $requestQualifiedRows = array();
        foreach ($jobOrders as $jobOrder)
        {
            if ($officialReports &&
                !isset($monitoredJobOrders[$jobOrder['jobOrderID']]))
            {
                continue;
            }

            $jobOrderID = $jobOrder['jobOrderID'];
            $openPositions = isset($openPositionsByJobOrder[$jobOrderID]) ? $openPositionsByJobOrder[$jobOrderID] : 0;
            if ($hideZeroOpenPositions && $openPositions <= 0)
            {
                continue;
            }
            $assignedCount = isset($assignedByJobOrder[$jobOrderID]) ? $assignedByJobOrder[$jobOrderID] : 0;
            $hiredCount = isset($hiredByJobOrder[$jobOrderID]) ? $hiredByJobOrder[$jobOrderID] : 0;
            $approvedEverCount = isset($approvedEverByJobOrder[$jobOrderID]) ? $approvedEverByJobOrder[$jobOrderID] : 0;

            $deadlineValue = isset($expectedCompletionByJobOrder[$jobOrderID]) ?
                $expectedCompletionByJobOrder[$jobOrderID] : '';
            $deadlineDisplay = $this->buildDeadlineDisplay($deadlineValue, $today);

            $companyName = '(Unknown)';
            if (isset($companyData[$jobOrder['companyID']]['companyName']))
            {
                $companyName = $companyData[$jobOrder['companyID']]['companyName'];
            }

            $acceptanceRate = $this->formatAcceptanceRate($approvedEverCount, $assignedCount);
            $hiringRate = $this->formatCompletionRate($hiredCount, $openPositions);

            $jobOrderKpiRows[] = array(
                'jobOrderID' => $jobOrderID,
                'title' => $jobOrder['title'],
                'status' => $jobOrder['status'],
                'companyName' => $companyName,
                'timeToDeadline' => $deadlineDisplay['value'],
                'timeToDeadlineClass' => $deadlineDisplay['class'],
                'totalOpenPositions' => $openPositions,
                'assignedCount' => $assignedCount,
                'acceptanceRate' => $acceptanceRate['display'],
                'acceptanceRateClass' => $this->getAcceptanceRateClass($acceptanceRate['percent']),
                'hiringRate' => $hiringRate
            );
        }

        if (!empty($eligibleJobOrderIDs))
        {
            $firstSubmittedRS = $db->getAllAssoc(sprintf(
                "SELECT
                    joborder_id AS jobOrderID,
                    MIN(date) AS firstSubmitted
                FROM
                    candidate_joborder_status_history
                WHERE
                    site_id = %s
                AND
                    joborder_id IN (%s)
                AND
                    status_to = %s
                GROUP BY
                    joborder_id",
                $db->makeQueryInteger($siteID),
                $this->formatIntegerList($eligibleJobOrderIDs),
                $db->makeQueryInteger(PIPELINE_STATUS_PROPOSED_TO_CUSTOMER)
            ));

            $firstSubmittedByJobOrder = array();
            foreach ($firstSubmittedRS as $row)
            {
                $firstSubmittedByJobOrder[(int) $row['jobOrderID']] = $row['firstSubmitted'];
            }

            foreach ($jobOrders as $jobOrder)
            {
                if ($officialReports &&
                    !isset($monitoredJobOrders[$jobOrder['jobOrderID']]))
                {
                    continue;
                }

                $jobOrderID = $jobOrder['jobOrderID'];
                $receivedDate = $this->parseDateTime($jobOrder['dateCreated']);
                $receivedDisplay = $receivedDate ? $this->formatDateLabel($receivedDate) : '-';

                $submittedRaw = isset($firstSubmittedByJobOrder[$jobOrderID]) ?
                    $firstSubmittedByJobOrder[$jobOrderID] : '';
                $submittedDate = $this->parseDateTime($submittedRaw);
                $submittedDisplay = $submittedDate ? $this->formatDateLabel($submittedDate) : '-';

                $daysValue = '-';
                $daysClass = 'kpiDelayUnknown';
                if ($receivedDate !== null && $submittedDate !== null)
                {
                    $days = $this->countBusinessDaysBetween($receivedDate, $submittedDate);
                    $daysValue = $days;
                    if ($days === 0)
                    {
                        $daysClass = 'kpiDelayZero';
                    }
                    else if ($days <= 3)
                    {
                        $daysClass = 'kpiDelayOk';
                    }
                    else
                    {
                        $daysClass = 'kpiDelayLate';
                    }
                }

                $companyName = '(Unknown)';
                if (isset($companyData[$jobOrder['companyID']]['companyName']))
                {
                    $companyName = $companyData[$jobOrder['companyID']]['companyName'];
                }

                $requestQualifiedRows[] = array(
                    'jobOrderID' => $jobOrderID,
                    'title' => $jobOrder['title'],
                    'companyName' => $companyName,
                    'receivedDate' => $receivedDisplay,
                    'submittedDate' => $submittedDisplay,
                    'daysValue' => $daysValue,
                    'daysClass' => $daysClass
                );
            }
        }

        $candidateSourceThisWeek = $this->getCandidateSourceCounts(
            $db,
            $siteID,
            $weekStart,
            $weekEnd,
            false,
            array(),
            $candidateSourceScope
        );
        $candidateSourceLastWeek = $this->getCandidateSourceCounts(
            $db,
            $siteID,
            $weekStartPrev,
            $weekEndPrev,
            false,
            array(),
            $candidateSourceScope
        );
        $candidateSourceRows = $this->buildCandidateSourceRows(
            $candidateSourceThisWeek,
            $candidateSourceLastWeek
        );

        $totalCandidatesThisWeek = $this->getCandidateTotalCount(
            $db,
            $siteID,
            $weekStart,
            $weekEnd,
            false,
            array(),
            $candidateSourceScope
        );
        $totalCandidatesLastWeek = $this->getCandidateTotalCount(
            $db,
            $siteID,
            $weekStartPrev,
            $weekEndPrev,
            false,
            array(),
            $candidateSourceScope
        );

        $statusCountsThisWeek = $this->getCandidateStatusCounts(
            $db,
            $siteID,
            $weekStart,
            $weekEnd,
            $officialReports,
            $monitoredJobOrders,
            $candidateSourceScope
        );
        $statusCountsLastWeek = $this->getCandidateStatusCounts(
            $db,
            $siteID,
            $weekStartPrev,
            $weekEndPrev,
            $officialReports,
            $monitoredJobOrders,
            $candidateSourceScope
        );

        $candidateMetricRows = array();
        $candidateMetricRows[] = $this->buildCandidateMetricRow(
            'Sourced Candidates',
            $this->getSourcedCandidatesCount($db, $siteID, $weekStart),
            $this->getSourcedCandidatesCount($db, $siteID, $weekStartPrev)
        );
        $candidateMetricRows[] = $this->buildCandidateMetricRow(
            'Qualified Candidates',
            $totalCandidatesThisWeek,
            $totalCandidatesLastWeek
        );
        $candidateMetricRows[] = $this->buildCandidateMetricRow(
            'Candidates Associated to a Job Order',
            $this->getStatusCount($statusCountsThisWeek, PIPELINE_STATUS_ALLOCATED),
            $this->getStatusCount($statusCountsLastWeek, PIPELINE_STATUS_ALLOCATED)
        );
        $candidateMetricRows[] = $this->buildCandidateMetricRow(
            'Candidates Submitted to Customer',
            $this->getStatusCount($statusCountsThisWeek, PIPELINE_STATUS_PROPOSED_TO_CUSTOMER),
            $this->getStatusCount($statusCountsLastWeek, PIPELINE_STATUS_PROPOSED_TO_CUSTOMER)
        );
        $candidateMetricRows[] = $this->buildCandidateMetricRow(
            'Candidates Submitted to Interview',
            $this->getStatusCount($statusCountsThisWeek, PIPELINE_STATUS_CUSTOMER_INTERVIEW),
            $this->getStatusCount($statusCountsLastWeek, PIPELINE_STATUS_CUSTOMER_INTERVIEW)
        );
        $candidateMetricRows[] = $this->buildCandidateMetricRow(
            'Candidates Validated by Customer',
            $this->getStatusCount($statusCountsThisWeek, PIPELINE_STATUS_CUSTOMER_APPROVED),
            $this->getStatusCount($statusCountsLastWeek, PIPELINE_STATUS_CUSTOMER_APPROVED)
        );
        $this->addCandidateDetailLinks($candidateSourceRows, $candidateMetricRows, $officialReports);

        $candidateSourceSnapshot = $this->getCurrentCandidateSourceSnapshot($db, $siteID);
        $candidateSourcePieURL = '';
        if ($candidateSourceSnapshot['total'] > 0)
        {
            $pieLabels = array_map('rawurlencode', array('Internal', 'Partner'));
            $pieData = implode(',', array(
                (int) $candidateSourceSnapshot['internal'],
                (int) $candidateSourceSnapshot['partner']
            ));
            $candidateSourcePieURL = sprintf(
                '%s?m=graphs&a=genericPie&title=%s&labels=%s&data=%s&width=360&height=260',
                CATSUtility::getIndexName(),
                rawurlencode('Candidate Source Mix'),
                implode(',', $pieLabels),
                $pieData
            );
        }

        $trendView = (isset($_GET['trendView']) && $_GET['trendView'] === 'monthly') ? 'monthly' : 'weekly';
        $trendStart = $this->parseDateTime(isset($_GET['trendStart']) ? $_GET['trendStart'] : '');
        $trendEnd = $this->parseDateTime(isset($_GET['trendEnd']) ? $_GET['trendEnd'] : '');
        if ($trendEnd === null)
        {
            $trendEnd = new DateTime('today');
        }
        if ($trendStart === null)
        {
            $trendStart = clone $trendEnd;
            $trendStart->modify('-6 months');
        }
        $trendStart->setTime(0, 0, 0);
        $trendEnd->setTime(23, 59, 59);
        if ($trendStart > $trendEnd)
        {
            $swap = $trendStart;
            $trendStart = $trendEnd;
            $trendEnd = $swap;
        }

        // Trend is for all candidates created in the database (not limited by official reports).
        $candidateTrend = $this->getCandidateTrendData(
            $db,
            $siteID,
            $trendStart,
            $trendEnd,
            $trendView,
            false,
            array(),
            $candidateSourceScope
        );
        $trendTitle = 'New Candidates (' . ucfirst($trendView) . ' - ' . $this->getCandidateSourceScopeLabel($candidateSourceScope) . ')';
        $trendLabels = array_map('rawurlencode', $candidateTrend['labels']);
        $trendLabelParam = implode(',', $trendLabels);
        $trendDataParam = implode(',', $candidateTrend['data']);
        $candidateTrendGraphURL = sprintf(
            '%s?m=graphs&a=generic&title=%s&labels=%s&data=%s&width=900&height=240&showValues=1',
            CATSUtility::getIndexName(),
            rawurlencode($trendTitle),
            $trendLabelParam,
            $trendDataParam
        );

        $weekLabel = $this->formatDateLabel($weekStart) . ' - ' . $this->formatDateLabel($weekEnd);

        $this->_template->assign('active', $this);
        $this->_template->assign('kpiRows', $rows);
        $this->_template->assign('totals', $totals);
        $this->_template->assign('totalsLastWeek', $totalsLastWeek);
        $this->_template->assign('totalsDiff', $totalsDiff);
        $this->_template->assign('jobOrderKpiRows', $jobOrderKpiRows);
        $this->_template->assign('requestQualifiedRows', $requestQualifiedRows);
        $this->_template->assign('weekLabel', $weekLabel);
        $this->_template->assign('expectedConversionFieldName', self::EXPECTED_CONVERSION_FIELD);
        $this->_template->assign('officialReports', $officialReports);
        $this->_template->assign('showDeadline', $showDeadline);
        $this->_template->assign('showCompletionRate', $showCompletionRate);
        $this->_template->assign('hideZeroOpenPositions', $hideZeroOpenPositions);
        $this->_template->assign('monitoredJobOrderFieldName', self::MONITORED_JOBORDER_FIELD);
        $this->_template->assign('expectedCompletionFieldName', self::EXPECTED_COMPLETION_FIELD);
        $this->_template->assign('candidateSourceRows', $candidateSourceRows);
        $this->_template->assign('candidateMetricRows', $candidateMetricRows);
        $this->_template->assign('candidateSourceSnapshot', $candidateSourceSnapshot);
        $this->_template->assign('candidateSourcePieURL', $candidateSourcePieURL);
        $this->_template->assign('candidateTrendGraphURL', $candidateTrendGraphURL);
        $this->_template->assign('candidateTrendView', $trendView);
        $this->_template->assign('candidateTrendStart', $trendStart->format('Y-m-d'));
        $this->_template->assign('candidateTrendEnd', $trendEnd->format('Y-m-d'));
        $this->_template->assign('candidateSourceScope', $candidateSourceScope);
        $this->_template->assign('candidateSourceScopeLabel', $this->getCandidateSourceScopeLabel($candidateSourceScope));
        $this->_template->display('./modules/kpis/Kpis.tpl');
    }

    private function details()
    {
        $db = DatabaseConnection::getInstance();
        $siteID = $this->_siteID;

        $type = isset($_GET['type']) ? $_GET['type'] : '';
        $range = (isset($_GET['range']) && $_GET['range'] === 'last') ? 'last' : 'this';
        list($rangeStart, $rangeEnd) = $this->getWeekRange($range);

        $officialReports = true;
        if (isset($_GET['officialReports']))
        {
            if ($_GET['officialReports'] == '0' || $_GET['officialReports'] === 'false')
            {
                $officialReports = false;
            }
            else
            {
                $officialReports = true;
            }
        }
        $candidateSourceScope = $this->normalizeCandidateSourceScope(
            isset($_GET['candidateSourceScope']) ? $_GET['candidateSourceScope'] : 'all'
        );

        $page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
        if ($page < 1)
        {
            $page = 1;
        }
        $rowsPerPage = 50;

        $detailRows = array();
        $totalRows = 0;
        $detailTitle = '';
        $detailMode = '';

        $rangeLabel = $this->formatDateLabel($rangeStart) . ' - ' . $this->formatDateLabel($rangeEnd);

        if ($type === 'source')
        {
            $sourceRaw = isset($_GET['source']) ? urldecode($_GET['source']) : '';
            if ($sourceRaw === '')
            {
                CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Missing source.');
            }

            if ($sourceRaw === '__na')
            {
                $sourceLabel = 'N/A';
                $sourceFilter = "AND (candidate.source IS NULL OR TRIM(candidate.source) = '' OR LOWER(TRIM(candidate.source)) = '(none)')";
            }
            else
            {
                $sourceLabel = $sourceRaw;
                $sourceFilter = 'AND candidate.source = ' . $db->makeQueryString($sourceRaw);
            }
            $candidateSourceFilter = $this->buildCandidateSourceScopeFilter($db, $candidateSourceScope, 'candidate');

            $detailTitle = 'Source: ' . $sourceLabel;
            $detailMode = 'candidate';

            $countSQL = sprintf(
                "SELECT COUNT(*) AS totalCount
                FROM candidate
                WHERE site_id = %s
                AND date_created >= %s
                AND date_created <= %s
                AND is_admin_hidden = 0
                %s
                %s",
                $db->makeQueryInteger($siteID),
                $db->makeQueryString($rangeStart->format('Y-m-d H:i:s')),
                $db->makeQueryString($rangeEnd->format('Y-m-d H:i:s')),
                $sourceFilter,
                $candidateSourceFilter
            );
            $countRow = $db->getAssoc($countSQL);
            $totalRows = isset($countRow['totalCount']) ? (int) $countRow['totalCount'] : 0;

            $pager = new Pager($totalRows, $rowsPerPage, $page);
            $baseURL = $this->buildKpiDetailLink('source', $range, array('source' => $sourceRaw), $officialReports, true);
            $pager->setSortByParameters($baseURL, '', '');

            $resultSQL = sprintf(
                "SELECT
                    candidate_id AS candidateID,
                    first_name AS firstName,
                    last_name AS lastName,
                    source,
                    date_created AS dateCreated
                FROM
                    candidate
                WHERE
                    site_id = %s
                AND
                    date_created >= %s
                AND
                    date_created <= %s
                AND
                    is_admin_hidden = 0
                %s
                %s
                ORDER BY
                    date_created DESC,
                    candidate_id DESC
                LIMIT %s, %s",
                $db->makeQueryInteger($siteID),
                $db->makeQueryString($rangeStart->format('Y-m-d H:i:s')),
                $db->makeQueryString($rangeEnd->format('Y-m-d H:i:s')),
                $sourceFilter,
                $candidateSourceFilter,
                $db->makeQueryInteger($pager->getThisPageStartRow()),
                $db->makeQueryInteger($rowsPerPage)
            );

            $detailRows = $this->buildCandidateDetailRows($db->getAllAssoc($resultSQL));
        }
        else if ($type === 'created')
        {
            $detailTitle = 'Qualified Candidates';
            if ($candidateSourceScope !== 'all')
            {
                $detailTitle .= ' (' . $this->getCandidateSourceScopeLabel($candidateSourceScope) . ')';
            }
            $detailMode = 'candidate';
            $candidateSourceFilter = $this->buildCandidateSourceScopeFilter($db, $candidateSourceScope, 'candidate');

            $countSQL = sprintf(
                "SELECT COUNT(*) AS totalCount
                FROM candidate
                WHERE site_id = %s
                AND date_created >= %s
                AND date_created <= %s
                AND is_admin_hidden = 0
                %s",
                $db->makeQueryInteger($siteID),
                $db->makeQueryString($rangeStart->format('Y-m-d H:i:s')),
                $db->makeQueryString($rangeEnd->format('Y-m-d H:i:s')),
                $candidateSourceFilter
            );
            $countRow = $db->getAssoc($countSQL);
            $totalRows = isset($countRow['totalCount']) ? (int) $countRow['totalCount'] : 0;

            $pager = new Pager($totalRows, $rowsPerPage, $page);
            $baseURL = $this->buildKpiDetailLink('created', $range, array(), $officialReports, true);
            $pager->setSortByParameters($baseURL, '', '');

            $resultSQL = sprintf(
                "SELECT
                    candidate_id AS candidateID,
                    first_name AS firstName,
                    last_name AS lastName,
                    source,
                    date_created AS dateCreated
                FROM
                    candidate
                WHERE
                    site_id = %s
                AND
                    date_created >= %s
                AND
                    date_created <= %s
                AND
                    is_admin_hidden = 0
                %s
                ORDER BY
                    date_created DESC,
                    candidate_id DESC
                LIMIT %s, %s",
                $db->makeQueryInteger($siteID),
                $db->makeQueryString($rangeStart->format('Y-m-d H:i:s')),
                $db->makeQueryString($rangeEnd->format('Y-m-d H:i:s')),
                $candidateSourceFilter,
                $db->makeQueryInteger($pager->getThisPageStartRow()),
                $db->makeQueryInteger($rowsPerPage)
            );

            $detailRows = $this->buildCandidateDetailRows($db->getAllAssoc($resultSQL));
        }
        else if ($type === 'status')
        {
            $statusRaw = isset($_GET['status']) ? (int) $_GET['status'] : 0;
            $statusLabels = array(
                PIPELINE_STATUS_ALLOCATED => 'Candidates Associated to a Job Order',
                PIPELINE_STATUS_PROPOSED_TO_CUSTOMER => 'Candidates Submitted to Customer',
                PIPELINE_STATUS_CUSTOMER_INTERVIEW => 'Candidates Submitted to Interview',
                PIPELINE_STATUS_CUSTOMER_APPROVED => 'Candidates Validated by Customer'
            );
            if (!isset($statusLabels[$statusRaw]))
            {
                CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid status.');
            }

            $detailTitle = $statusLabels[$statusRaw];
            $detailMode = 'status';

            $monitoredJobOrders = array();
            if ($officialReports)
            {
                $monitoredFieldName = strtolower(self::MONITORED_JOBORDER_FIELD);
                $monitoredRS = $db->getAllAssoc(sprintf(
                    "SELECT
                        data_item_id AS jobOrderID,
                        value
                    FROM
                        extra_field
                    WHERE
                        site_id = %s
                    AND
                        data_item_type = %s
                    AND
                        LOWER(field_name) = %s",
                    $db->makeQueryInteger($siteID),
                    DATA_ITEM_JOBORDER,
                    $db->makeQueryString($monitoredFieldName)
                ));

                foreach ($monitoredRS as $row)
                {
                    if ($this->isTruthyExtraField($row['value']))
                    {
                        $monitoredJobOrders[(int) $row['jobOrderID']] = true;
                    }
                }
            }

            $monitoredFilter = '';
            $candidateSourceFilter = $this->buildCandidateSourceScopeExistsFilter(
                $db,
                $siteID,
                $candidateSourceScope,
                'candidate_joborder_status_history.candidate_id'
            );
            if ($officialReports)
            {
                if (empty($monitoredJobOrders))
                {
                    $totalRows = 0;
                    $detailRows = array();
                    $pager = new Pager(0, $rowsPerPage, $page);
                    $baseURL = $this->buildKpiDetailLink('status', $range, array('status' => $statusRaw), $officialReports, true);
                    $pager->setSortByParameters($baseURL, '', '');

                    $this->_template->assign('active', $this);
                    $this->_template->assign('detailRows', $detailRows);
                    $this->_template->assign('detailTitle', $detailTitle);
                    $this->_template->assign('detailRangeLabel', $rangeLabel);
                    $this->_template->assign('detailMode', $detailMode);
                    $this->_template->assign('pager', $pager);
                    $backURLParams = array(
                        'm' => 'kpis',
                        'officialReports' => ($officialReports ? 1 : 0),
                        'candidateSourceScope' => $candidateSourceScope
                    );
                    $this->_template->assign('backURL', CATSUtility::getIndexName() . '?' . http_build_query($backURLParams));
                    $this->_template->display('./modules/kpis/KpisDetails.tpl');
                    return;
                }

                $monitoredIDs = $this->formatIntegerList(array_keys($monitoredJobOrders));
                $monitoredFilter = sprintf('AND joborder_id IN (%s)', $monitoredIDs);
            }

            $countSQL = sprintf(
                "SELECT COUNT(*) AS totalCount
                FROM (
                    SELECT DISTINCT
                        candidate_id,
                        joborder_id
                    FROM
                        candidate_joborder_status_history
                    WHERE
                        site_id = %s
                    AND
                        status_to = %s
                    AND
                        date >= %s
                    AND
                        date <= %s
                    %s
                    %s
                ) AS status_rows",
                $db->makeQueryInteger($siteID),
                $db->makeQueryInteger($statusRaw),
                $db->makeQueryString($rangeStart->format('Y-m-d H:i:s')),
                $db->makeQueryString($rangeEnd->format('Y-m-d H:i:s')),
                $monitoredFilter,
                $candidateSourceFilter
            );
            $countRow = $db->getAssoc($countSQL);
            $totalRows = isset($countRow['totalCount']) ? (int) $countRow['totalCount'] : 0;

            $pager = new Pager($totalRows, $rowsPerPage, $page);
            $baseURL = $this->buildKpiDetailLink('status', $range, array('status' => $statusRaw), $officialReports, true);
            $pager->setSortByParameters($baseURL, '', '');

            $resultSQL = sprintf(
                "SELECT
                    status_rows.candidate_id AS candidateID,
                    status_rows.joborder_id AS jobOrderID,
                    status_rows.maxDate AS statusDate,
                    candidate.first_name AS firstName,
                    candidate.last_name AS lastName,
                    joborder.title AS jobOrderTitle
                FROM
                    (
                        SELECT
                            candidate_id,
                            joborder_id,
                            MAX(date) AS maxDate
                        FROM
                            candidate_joborder_status_history
                        WHERE
                            site_id = %s
                        AND
                            status_to = %s
                        AND
                            date >= %s
                        AND
                            date <= %s
                        %s
                        %s
                        GROUP BY
                            candidate_id,
                            joborder_id
                    ) AS status_rows
                INNER JOIN candidate
                    ON candidate.candidate_id = status_rows.candidate_id
                    AND candidate.site_id = %s
                INNER JOIN joborder
                    ON joborder.joborder_id = status_rows.joborder_id
                    AND joborder.site_id = %s
                WHERE
                    candidate.is_admin_hidden = 0
                ORDER BY
                    status_rows.maxDate DESC,
                    candidate.last_name,
                    candidate.first_name
                LIMIT %s, %s",
                $db->makeQueryInteger($siteID),
                $db->makeQueryInteger($statusRaw),
                $db->makeQueryString($rangeStart->format('Y-m-d H:i:s')),
                $db->makeQueryString($rangeEnd->format('Y-m-d H:i:s')),
                $monitoredFilter,
                $candidateSourceFilter,
                $db->makeQueryInteger($siteID),
                $db->makeQueryInteger($siteID),
                $db->makeQueryInteger($pager->getThisPageStartRow()),
                $db->makeQueryInteger($rowsPerPage)
            );

            $detailRows = $this->buildStatusDetailRows($db->getAllAssoc($resultSQL));
        }
        else
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid detail type.');
        }

        $this->_template->assign('active', $this);
        $this->_template->assign('detailRows', $detailRows);
        $this->_template->assign('detailTitle', $detailTitle);
        $this->_template->assign('detailRangeLabel', $rangeLabel);
        $this->_template->assign('detailMode', $detailMode);
        $this->_template->assign('pager', $pager);
        $backURLParams = array(
            'm' => 'kpis',
            'officialReports' => ($officialReports ? 1 : 0),
            'candidateSourceScope' => $candidateSourceScope
        );
        $this->_template->assign('backURL', CATSUtility::getIndexName() . '?' . http_build_query($backURLParams));
        $this->_template->display('./modules/kpis/KpisDetails.tpl');
    }

    private function parseExpectedConversion($rawValue)
    {
        $value = trim((string) $rawValue);
        if ($value === '')
        {
            return 0.0;
        }

        $value = str_replace('%', '', $value);
        $value = str_replace(',', '.', $value);
        if (!is_numeric($value))
        {
            return 0.0;
        }

        $percent = (float) $value;
        if ($percent <= 1)
        {
            $percent *= 100;
        }
        if ($percent < 0)
        {
            $percent = 0.0;
        }

        return $percent;
    }

    private function formatPercent($percent)
    {
        $display = number_format($percent, 2, '.', '');
        $display = rtrim(rtrim($display, '0'), '.');
        if ($display === '')
        {
            $display = '0';
        }

        return $display . '%';
    }

    private function formatPercentRange($min, $max)
    {
        if ($min === null || $max === null)
        {
            return '0%';
        }

        if ($min == $max)
        {
            return $this->formatPercent($min);
        }

        return $this->formatPercent($min) . ' - ' . $this->formatPercent($max);
    }

    private function buildDeadlineDisplay($rawValue, DateTime $today)
    {
        $value = trim((string) $rawValue);
        if ($value === '')
        {
            return array('value' => '-', 'class' => '');
        }

        $deadline = $this->parseExtraFieldDate($value);
        if ($deadline === null)
        {
            return array('value' => $value, 'class' => 'kpiDeadlineUnknown');
        }

        $deadline->setTime(0, 0, 0);
        $todayMidnight = clone $today;
        $todayMidnight->setTime(0, 0, 0);
        $seconds = $deadline->getTimestamp() - $todayMidnight->getTimestamp();
        $diffDays = (int) floor($seconds / 86400);
        $class = ($diffDays < 0) ? 'kpiDeadlineOverdue' : 'kpiDeadlineOk';

        return array('value' => $diffDays, 'class' => $class);
    }

    private function formatAcceptanceRate($acceptedCount, $submittedCount)
    {
        $acceptedCount = (int) $acceptedCount;
        $submittedCount = (int) $submittedCount;
        if ($submittedCount <= 0)
        {
            return array('display' => '0%', 'percent' => 0);
        }

        $percent = (int) round(($acceptedCount / $submittedCount) * 100);
        return array(
            'display' => sprintf('%d/%d - %d%%', $acceptedCount, $submittedCount, $percent),
            'percent' => $percent
        );
    }

    private function formatCompletionRate($hiredCount, $totalOpenPositions)
    {
        $hiredCount = (int) $hiredCount;
        $totalOpenPositions = (int) $totalOpenPositions;
        if ($totalOpenPositions <= 0)
        {
            return '0%';
        }

        $percent = (int) round(($hiredCount / $totalOpenPositions) * 100);
        return $percent . '%';
    }

    private function getAcceptanceRateClass($percent)
    {
        if ($percent <= 0)
        {
            return 'kpiAcceptanceZero';
        }
        if ($percent >= 50)
        {
            return 'kpiAcceptanceOk';
        }

        return 'kpiAcceptanceLow';
    }

    private function parseExtraFieldDate($value)
    {
        $value = trim((string) $value);
        if ($value === '')
        {
            return null;
        }

        $separator = (strpos($value, '/') !== false) ? '/' : '-';
        $normalized = str_replace('/', '-', $value);

        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $normalized))
        {
            $date = DateTime::createFromFormat('Y-m-d', $normalized);
            if ($date instanceof DateTime)
            {
                return $date;
            }
        }

        if (preg_match('/^\d{2}' . preg_quote($separator, '/') . '\d{2}' . preg_quote($separator, '/') . '\d{2}$/', $value))
        {
            // Extra field dates are stored by DateInput as MM-DD-YY; prefer MDY, fall back to DMY.
            if (DateUtility::validate($separator, $value, DATE_FORMAT_MMDDYY))
            {
                $iso = DateUtility::convert($separator, $value, DATE_FORMAT_MMDDYY, DATE_FORMAT_YYYYMMDD);
                $date = DateTime::createFromFormat('Y-m-d', $iso);
                if ($date instanceof DateTime)
                {
                    return $date;
                }
            }
            if (DateUtility::validate($separator, $value, DATE_FORMAT_DDMMYY))
            {
                $iso = DateUtility::convert($separator, $value, DATE_FORMAT_DDMMYY, DATE_FORMAT_YYYYMMDD);
                $date = DateTime::createFromFormat('Y-m-d', $iso);
                if ($date instanceof DateTime)
                {
                    return $date;
                }
            }
        }

        if (preg_match('/^\d{2}' . preg_quote($separator, '/') . '\d{2}' . preg_quote($separator, '/') . '\d{4}$/', $value))
        {
            $format = 'm' . $separator . 'd' . $separator . 'Y';
            $date = DateTime::createFromFormat($format, $value);
            if ($date instanceof DateTime)
            {
                return $date;
            }

            $format = 'd' . $separator . 'm' . $separator . 'Y';
            $date = DateTime::createFromFormat($format, $value);
            if ($date instanceof DateTime)
            {
                return $date;
            }
        }

        try
        {
            return new DateTime($value);
        }
        catch (Exception $e)
        {
            return null;
        }
    }

    private function parsePlanDate($value)
    {
        if ($value === null)
        {
            return null;
        }

        $value = trim((string) $value);
        if ($value === '' || $value === '0000-00-00')
        {
            return null;
        }

        try
        {
            return new DateTime($value);
        }
        catch (Exception $e)
        {
            return null;
        }
    }

    private function parseDateTime($value)
    {
        $value = trim((string) $value);
        if ($value === '')
        {
            return null;
        }

        try
        {
            return new DateTime($value);
        }
        catch (Exception $e)
        {
            return null;
        }
    }

    private function isPlanActive($startDate, $endDate, DateTime $today)
    {
        if ($startDate !== null && $startDate > $today)
        {
            return false;
        }
        if ($endDate !== null && $endDate < $today)
        {
            return false;
        }

        return true;
    }

    private function isPlanExpired($endDate, DateTime $today)
    {
        if ($endDate === null)
        {
            return false;
        }

        return ($endDate < $today);
    }

    private function isPlanFuture($startDate, DateTime $today)
    {
        if ($startDate === null)
        {
            return false;
        }

        return ($startDate > $today);
    }

    private function isPlanInWindow($startDate, $endDate, DateTime $windowStart, DateTime $windowEnd)
    {
        if ($endDate !== null && $endDate < $windowStart)
        {
            return false;
        }

        if ($startDate !== null && $startDate > $windowEnd)
        {
            return false;
        }

        return true;
    }

    private function formatDateLabel(DateTime $date)
    {
        if ($_SESSION['CATS']->isDateDMY())
        {
            return $date->format('d-m-y');
        }

        return $date->format('m-d-y');
    }

    private function countBusinessDaysBetween(DateTime $startDate, DateTime $endDate)
    {
        $start = clone $startDate;
        $end = clone $endDate;
        $start->setTime(0, 0, 0);
        $end->setTime(0, 0, 0);

        if ($end < $start)
        {
            return 0;
        }

        $days = 0;
        $cursor = clone $start;
        $cursor->modify('+1 day');
        while ($cursor <= $end)
        {
            $weekday = (int) $cursor->format('N');
            if ($weekday <= 5)
            {
                ++$days;
            }
            $cursor->modify('+1 day');
        }

        return $days;
    }

    private function isTruthyExtraField($value)
    {
        $value = strtolower(trim((string) $value));
        return in_array($value, array('yes', '1', 'true', 'on'), true);
    }

    private function normalizeCandidateSourceScope($scope)
    {
        $scope = strtolower(trim((string) $scope));
        if ($scope === 'internal' || $scope === 'partner')
        {
            return $scope;
        }

        return 'all';
    }

    private function getCandidateSourceScopeLabel($scope)
    {
        $scope = $this->normalizeCandidateSourceScope($scope);
        if ($scope === 'internal')
        {
            return 'Internal';
        }
        if ($scope === 'partner')
        {
            return 'Partner';
        }

        return 'All';
    }

    private function buildCandidateSourceScopeFilter($db, $scope, $candidateAlias = 'candidate')
    {
        $scope = $this->normalizeCandidateSourceScope($scope);
        if ($scope === 'partner')
        {
            return 'AND LOWER(COALESCE(' . $candidateAlias . ".source, '')) LIKE " .
                $db->makeQueryString('%partner%');
        }
        if ($scope === 'internal')
        {
            return 'AND LOWER(COALESCE(' . $candidateAlias . ".source, '')) NOT LIKE " .
                $db->makeQueryString('%partner%');
        }

        return '';
    }

    private function buildCandidateSourceScopeExistsFilter($db, $siteID, $scope, $candidateIDExpr)
    {
        $scope = $this->normalizeCandidateSourceScope($scope);
        if ($scope === 'all')
        {
            return '';
        }

        $sourceFilter = $this->buildCandidateSourceScopeFilter($db, $scope, 'candidate_scope');

        return sprintf(
            "AND EXISTS (
                SELECT 1
                FROM candidate AS candidate_scope
                WHERE candidate_scope.site_id = %s
                AND candidate_scope.candidate_id = %s
                %s
            )",
            $db->makeQueryInteger($siteID),
            $candidateIDExpr,
            $sourceFilter
        );
    }

    private function getCandidateSourceCounts($db, $siteID, DateTime $start, DateTime $end, $officialReports, $monitoredJobOrders, $candidateSourceScope)
    {
        if ($officialReports && empty($monitoredJobOrders))
        {
            return array();
        }

        $joinFilter = '';
        if ($officialReports)
        {
            $monitoredIDs = $this->formatIntegerList(array_keys($monitoredJobOrders));
            $joinFilter = sprintf(
                "AND EXISTS (
                    SELECT 1
                    FROM candidate_joborder AS cjo
                    WHERE cjo.candidate_id = candidate.candidate_id
                    AND cjo.site_id = %s
                    AND cjo.joborder_id IN (%s)
                )",
                $db->makeQueryInteger($siteID),
                $monitoredIDs
            );
        }
        $sourceScopeFilter = $this->buildCandidateSourceScopeFilter($db, $candidateSourceScope, 'candidate');

        $sql = sprintf(
            "SELECT
                CASE
                    WHEN candidate.source IS NULL THEN 'N/A'
                    WHEN TRIM(candidate.source) = '' THEN 'N/A'
                    WHEN LOWER(TRIM(candidate.source)) = '(none)' THEN 'N/A'
                    ELSE candidate.source
                END AS source,
                COUNT(DISTINCT candidate.candidate_id) AS candidateCount
            FROM
                candidate
            WHERE
                candidate.site_id = %s
            AND
                candidate.date_created >= %s
            AND
                candidate.date_created <= %s
            %s
            %s
            GROUP BY
                source",
            $db->makeQueryInteger($siteID),
            $db->makeQueryString($start->format('Y-m-d H:i:s')),
            $db->makeQueryString($end->format('Y-m-d H:i:s')),
            $joinFilter,
            $sourceScopeFilter
        );

        $rows = $db->getAllAssoc($sql);
        $counts = array();
        foreach ($rows as $row)
        {
            $counts[$row['source']] = (int) $row['candidateCount'];
        }

        return $counts;
    }

    private function getCandidateTotalCount($db, $siteID, DateTime $start, DateTime $end, $officialReports, $monitoredJobOrders, $candidateSourceScope)
    {
        if ($officialReports && empty($monitoredJobOrders))
        {
            return 0;
        }

        $joinFilter = '';
        if ($officialReports)
        {
            $monitoredIDs = $this->formatIntegerList(array_keys($monitoredJobOrders));
            $joinFilter = sprintf(
                "AND EXISTS (
                    SELECT 1
                    FROM candidate_joborder AS cjo
                    WHERE cjo.candidate_id = candidate.candidate_id
                    AND cjo.site_id = %s
                    AND cjo.joborder_id IN (%s)
                )",
                $db->makeQueryInteger($siteID),
                $monitoredIDs
            );
        }
        $sourceScopeFilter = $this->buildCandidateSourceScopeFilter($db, $candidateSourceScope, 'candidate');

        $sql = sprintf(
            "SELECT
                COUNT(DISTINCT candidate.candidate_id) AS candidateCount
            FROM
                candidate
            WHERE
                candidate.site_id = %s
            AND
                candidate.date_created >= %s
            AND
                candidate.date_created <= %s
            %s
            %s",
            $db->makeQueryInteger($siteID),
            $db->makeQueryString($start->format('Y-m-d H:i:s')),
            $db->makeQueryString($end->format('Y-m-d H:i:s')),
            $joinFilter,
            $sourceScopeFilter
        );

        $row = $db->getAssoc($sql);
        if (empty($row))
        {
            return 0;
        }

        return (int) $row['candidateCount'];
    }

    private function getSourcedCandidatesCount($db, $siteID, DateTime $weekStart)
    {
        $weekYear = (int) $weekStart->format('o');
        $weekNumber = (int) $weekStart->format('W');

        $row = $db->getAssoc(sprintf(
            "SELECT
                sourced_count AS sourcedCount
            FROM
                sourcing_weekly
            WHERE
                site_id = %s
            AND
                week_year = %s
            AND
                week_number = %s",
            $db->makeQueryInteger($siteID),
            $db->makeQueryInteger($weekYear),
            $db->makeQueryInteger($weekNumber)
        ));

        if (empty($row))
        {
            return 0;
        }

        return (int) $row['sourcedCount'];
    }

    private function getCurrentCandidateSourceSnapshot($db, $siteID)
    {
        $row = $db->getAssoc(sprintf(
            "SELECT
                SUM(CASE WHEN LOWER(COALESCE(source, '')) LIKE %s THEN 1 ELSE 0 END) AS partnerCount,
                SUM(CASE WHEN LOWER(COALESCE(source, '')) LIKE %s THEN 0 ELSE 1 END) AS internalCount
            FROM
                candidate
            WHERE
                site_id = %s
            AND
                is_admin_hidden = 0",
            $db->makeQueryString('%partner%'),
            $db->makeQueryString('%partner%'),
            $db->makeQueryInteger($siteID)
        ));

        $partner = isset($row['partnerCount']) ? (int) $row['partnerCount'] : 0;
        $internal = isset($row['internalCount']) ? (int) $row['internalCount'] : 0;

        return array(
            'internal' => $internal,
            'partner' => $partner,
            'total' => ($internal + $partner)
        );
    }

    private function getCandidateStatusCounts($db, $siteID, DateTime $start, DateTime $end, $officialReports, $monitoredJobOrders, $candidateSourceScope)
    {
        if ($officialReports && empty($monitoredJobOrders))
        {
            return array();
        }

        $statusIDs = array(
            PIPELINE_STATUS_ALLOCATED,
            PIPELINE_STATUS_PROPOSED_TO_CUSTOMER,
            PIPELINE_STATUS_CUSTOMER_INTERVIEW,
            PIPELINE_STATUS_CUSTOMER_APPROVED
        );

        $joinFilter = '';
        if ($officialReports)
        {
            $monitoredIDs = $this->formatIntegerList(array_keys($monitoredJobOrders));
            $joinFilter = sprintf(
                "AND joborder_id IN (%s)",
                $monitoredIDs
            );
        }
        $sourceScopeFilter = $this->buildCandidateSourceScopeExistsFilter(
            $db,
            $siteID,
            $candidateSourceScope,
            'candidate_joborder_status_history.candidate_id'
        );

        $sql = sprintf(
            "SELECT
                status_to AS statusTo,
                COUNT(*) AS statusCount
            FROM
                (
                    SELECT DISTINCT
                        candidate_id,
                        joborder_id,
                        status_to
                    FROM
                        candidate_joborder_status_history
                    WHERE
                        site_id = %s
                    AND
                        date >= %s
                    AND
                        date <= %s
                    AND
                        status_to IN (%s)
                    %s
                    %s
                ) AS status_rows
            GROUP BY
                status_to",
            $db->makeQueryInteger($siteID),
            $db->makeQueryString($start->format('Y-m-d H:i:s')),
            $db->makeQueryString($end->format('Y-m-d H:i:s')),
            $this->formatIntegerList($statusIDs),
            $joinFilter,
            $sourceScopeFilter
        );

        $rows = $db->getAllAssoc($sql);
        $counts = array();
        foreach ($rows as $row)
        {
            $counts[(int) $row['statusTo']] = (int) $row['statusCount'];
        }

        return $counts;
    }

    private function getCandidateTrendData($db, $siteID, DateTime $start, DateTime $end, $view, $officialReports, $monitoredJobOrders, $candidateSourceScope)
    {
        if ($officialReports && empty($monitoredJobOrders))
        {
            return array('labels' => array(), 'data' => array());
        }

        $joinFilter = '';
        if ($officialReports)
        {
            $monitoredIDs = $this->formatIntegerList(array_keys($monitoredJobOrders));
            $joinFilter = sprintf(
                "AND EXISTS (
                    SELECT 1
                    FROM candidate_joborder AS cjo
                    WHERE cjo.candidate_id = candidate.candidate_id
                    AND cjo.site_id = %s
                    AND cjo.joborder_id IN (%s)
                )",
                $db->makeQueryInteger($siteID),
                $monitoredIDs
            );
        }
        $sourceScopeFilter = $this->buildCandidateSourceScopeFilter($db, $candidateSourceScope, 'candidate');

        if ($view === 'monthly')
        {
            $sql = sprintf(
                "SELECT
                    DATE_FORMAT(candidate.date_created, '%%Y-%%m-01') AS periodKey,
                    COUNT(DISTINCT candidate.candidate_id) AS total
                FROM
                    candidate
                WHERE
                    candidate.site_id = %s
                AND
                    candidate.date_created >= %s
                AND
                    candidate.date_created <= %s
                %s
                %s
                GROUP BY
                    periodKey",
                $db->makeQueryInteger($siteID),
                $db->makeQueryString($start->format('Y-m-d H:i:s')),
                $db->makeQueryString($end->format('Y-m-d H:i:s')),
                $joinFilter,
                $sourceScopeFilter
            );
        }
        else
        {
            $sql = sprintf(
                "SELECT
                    YEARWEEK(candidate.date_created, 1) AS periodKey,
                    COUNT(DISTINCT candidate.candidate_id) AS total
                FROM
                    candidate
                WHERE
                    candidate.site_id = %s
                AND
                    candidate.date_created >= %s
                AND
                    candidate.date_created <= %s
                %s
                %s
                GROUP BY
                    periodKey",
                $db->makeQueryInteger($siteID),
                $db->makeQueryString($start->format('Y-m-d H:i:s')),
                $db->makeQueryString($end->format('Y-m-d H:i:s')),
                $joinFilter,
                $sourceScopeFilter
            );
        }

        $rows = $db->getAllAssoc($sql);
        $counts = array();
        foreach ($rows as $row)
        {
            $counts[(string) $row['periodKey']] = (int) $row['total'];
        }

        $labels = array();
        $data = array();
        if ($view === 'monthly')
        {
            $cursor = new DateTime($start->format('Y-m-01'));
            $endCursor = new DateTime($end->format('Y-m-01'));
            while ($cursor <= $endCursor)
            {
                $key = $cursor->format('Y-m-01');
                $labels[] = $cursor->format('M Y');
                $data[] = isset($counts[$key]) ? $counts[$key] : 0;
                $cursor->modify('+1 month');
            }
        }
        else
        {
            $cursor = clone $start;
            $cursor->modify('monday this week');
            $endCursor = clone $end;
            $endCursor->modify('monday this week');
            while ($cursor <= $endCursor)
            {
                $weekEnd = clone $cursor;
                $weekEnd->modify('+6 days');
                $key = $cursor->format('oW');
                $labels[] = substr($cursor->format('o'), -2) . 'W' . $cursor->format('W');
                $data[] = isset($counts[$key]) ? $counts[$key] : 0;
                $cursor->modify('+1 week');
            }
        }

        return array('labels' => $labels, 'data' => $data);
    }

    private function formatIntegerList($values)
    {
        $clean = array();
        foreach ($values as $value)
        {
            $clean[] = (int) $value;
        }

        return implode(',', $clean);
    }

    private function buildCandidateSourceRows($thisWeek, $lastWeek)
    {
        $partnerThisWeek = 0;
        $partnerLastWeek = 0;
        $internalThisWeek = 0;
        $internalLastWeek = 0;

        foreach ($thisWeek as $source => $count)
        {
            if ($this->isPartnerSourceLabel($source))
            {
                $partnerThisWeek += (int) $count;
            }
            else
            {
                $internalThisWeek += (int) $count;
            }
        }
        foreach ($lastWeek as $source => $count)
        {
            if ($this->isPartnerSourceLabel($source))
            {
                $partnerLastWeek += (int) $count;
            }
            else
            {
                $internalLastWeek += (int) $count;
            }
        }

        $rows = array();
        if ($internalThisWeek > 0 || $internalLastWeek > 0)
        {
            $internalRow = $this->buildCandidateMetricRow(
                'Internal Candidates',
                $internalThisWeek,
                $internalLastWeek
            );
            $internalRow['sourceScope'] = 'internal';
            $rows[] = $internalRow;
        }

        if ($partnerThisWeek > 0 || $partnerLastWeek > 0)
        {
            $partnerRow = $this->buildCandidateMetricRow(
                'Partner Candidates',
                $partnerThisWeek,
                $partnerLastWeek
            );
            $partnerRow['sourceScope'] = 'partner';
            $rows[] = $partnerRow;
        }

        return $rows;
    }

    private function isPartnerSourceLabel($source)
    {
        return (stripos((string) $source, 'partner') !== false);
    }

    private function buildCandidateMetricRow($label, $thisWeek, $lastWeek)
    {
        $thisWeek = (int) $thisWeek;
        $lastWeek = (int) $lastWeek;

        return array(
            'label' => $label,
            'thisWeek' => $thisWeek,
            'lastWeek' => $lastWeek,
            'delta' => $thisWeek - $lastWeek
        );
    }

    private function getStatusCount($counts, $statusID)
    {
        if (isset($counts[$statusID]))
        {
            return (int) $counts[$statusID];
        }

        return 0;
    }

    private function addCandidateDetailLinks(&$sourceRows, &$metricRows, $officialReports)
    {
        foreach ($sourceRows as &$row)
        {
            if (isset($row['sourceScope']))
            {
                $sourceScope = $this->normalizeCandidateSourceScope($row['sourceScope']);
                $params = array('candidateSourceScope' => $sourceScope);
                if ($row['thisWeek'] > 0)
                {
                    $row['thisWeekLink'] = $this->buildKpiDetailLink(
                        'created',
                        'this',
                        $params,
                        $officialReports
                    );
                }
                if ($row['lastWeek'] > 0)
                {
                    $row['lastWeekLink'] = $this->buildKpiDetailLink(
                        'created',
                        'last',
                        $params,
                        $officialReports
                    );
                }

                continue;
            }

            $sourceKey = ($row['label'] === 'N/A') ? '__na' : $row['label'];
            if ($row['thisWeek'] > 0)
            {
                $row['thisWeekLink'] = $this->buildKpiDetailLink(
                    'source',
                    'this',
                    array('source' => $sourceKey),
                    $officialReports
                );
            }
            if ($row['lastWeek'] > 0)
            {
                $row['lastWeekLink'] = $this->buildKpiDetailLink(
                    'source',
                    'last',
                    array('source' => $sourceKey),
                    $officialReports
                );
            }
        }
        unset($row);

        $metricMap = array(
            'Sourced Candidates' => array('type' => 'sourcing'),
            'Qualified Candidates' => array('type' => 'created'),
            'Candidates Associated to a Job Order' => array('type' => 'status', 'status' => PIPELINE_STATUS_ALLOCATED),
            'Candidates Submitted to Customer' => array('type' => 'status', 'status' => PIPELINE_STATUS_PROPOSED_TO_CUSTOMER),
            'Candidates Submitted to Interview' => array('type' => 'status', 'status' => PIPELINE_STATUS_CUSTOMER_INTERVIEW),
            'Candidates Validated by Customer' => array('type' => 'status', 'status' => PIPELINE_STATUS_CUSTOMER_APPROVED)
        );

        foreach ($metricRows as &$row)
        {
            if (!isset($metricMap[$row['label']]))
            {
                continue;
            }

            $meta = $metricMap[$row['label']];
            if ($meta['type'] === 'sourcing')
            {
                if ($row['thisWeek'] > 0)
                {
                    $row['thisWeekLink'] = CATSUtility::getIndexName() . '?m=sourcing';
                }
                if ($row['lastWeek'] > 0)
                {
                    $row['lastWeekLink'] = CATSUtility::getIndexName() . '?m=sourcing';
                }
                continue;
            }

            $params = array();
            if (isset($meta['status']))
            {
                $params['status'] = $meta['status'];
            }

            if ($row['thisWeek'] > 0)
            {
                $row['thisWeekLink'] = $this->buildKpiDetailLink(
                    $meta['type'],
                    'this',
                    $params,
                    $officialReports
                );
            }
            if ($row['lastWeek'] > 0)
            {
                $row['lastWeekLink'] = $this->buildKpiDetailLink(
                    $meta['type'],
                    'last',
                    $params,
                    $officialReports
                );
            }
        }
        unset($row);
    }

    private function buildKpiDetailLink($type, $range, $params, $officialReports, $rawQuery = false)
    {
        $candidateSourceScope = $this->normalizeCandidateSourceScope(
            isset($_GET['candidateSourceScope']) ? $_GET['candidateSourceScope'] : 'all'
        );
        $queryParams = array(
            'm' => 'kpis',
            'a' => 'details',
            'type' => $type,
            'range' => $range,
            'officialReports' => ($officialReports ? 1 : 0),
            'candidateSourceScope' => $candidateSourceScope
        );

        foreach ($params as $key => $value)
        {
            $queryParams[$key] = $value;
        }

        $query = http_build_query($queryParams);
        if ($rawQuery)
        {
            return $query;
        }

        return CATSUtility::getIndexName() . '?' . $query;
    }

    private function getWeekRange($range)
    {
        $today = new DateTime('today');
        $weekStart = clone $today;
        $weekStart->modify('monday this week');
        $weekStart->setTime(0, 0, 0);

        $weekEnd = clone $weekStart;
        $weekEnd->modify('+6 days');
        $weekEnd->setTime(23, 59, 59);

        if ($range === 'last')
        {
            $weekStart->modify('-7 days');
            $weekEnd->modify('-7 days');
        }

        return array($weekStart, $weekEnd);
    }

    private function buildCandidateDetailRows($rows)
    {
        $detailRows = array();
        foreach ($rows as $row)
        {
            $detailRows[] = array(
                'candidateID' => (int) $row['candidateID'],
                'candidateName' => trim($row['firstName'] . ' ' . $row['lastName']),
                'created' => $this->formatDetailDateValue($row['dateCreated']),
                'source' => $this->normalizeSourceLabel($row['source'])
            );
        }

        return $detailRows;
    }

    private function buildStatusDetailRows($rows)
    {
        $detailRows = array();
        foreach ($rows as $row)
        {
            $detailRows[] = array(
                'candidateID' => (int) $row['candidateID'],
                'candidateName' => trim($row['firstName'] . ' ' . $row['lastName']),
                'jobOrderID' => (int) $row['jobOrderID'],
                'jobOrderTitle' => $row['jobOrderTitle'],
                'statusDate' => $this->formatDetailDateValue($row['statusDate'])
            );
        }

        return $detailRows;
    }

    private function formatDetailDateValue($value)
    {
        $date = $this->parseDateTime($value);
        if ($date === null)
        {
            return '';
        }

        return $this->formatDateLabel($date);
    }

    private function normalizeSourceLabel($value)
    {
        $value = trim((string) $value);
        if ($value === '' || strtolower($value) === '(none)')
        {
            return 'N/A';
        }

        return $value;
    }
}

?>
