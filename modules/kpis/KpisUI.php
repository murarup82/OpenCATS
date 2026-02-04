<?php
/*
 * CATS
 * KPIs Module
 */

include_once(LEGACY_ROOT . '/lib/CommonErrors.php');
include_once(LEGACY_ROOT . '/lib/ExtraFields.php');
include_once(LEGACY_ROOT . '/lib/JobOrderStatuses.php');

class KpisUI extends UserInterface
{
    const MONITORED_JOBORDER_FIELD = 'Monitored JO';
    const EXPECTED_CONVERSION_FIELD = 'Conversion Rate';

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
                company_id AS companyID,
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
                'companyID' => (int) $row['companyID'],
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

        $candidateSourceThisWeek = $this->getCandidateSourceCounts(
            $db,
            $siteID,
            $weekStart,
            $weekEnd,
            false,
            array()
        );
        $candidateSourceLastWeek = $this->getCandidateSourceCounts(
            $db,
            $siteID,
            $weekStartPrev,
            $weekEndPrev,
            false,
            array()
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
            array()
        );
        $totalCandidatesLastWeek = $this->getCandidateTotalCount(
            $db,
            $siteID,
            $weekStartPrev,
            $weekEndPrev,
            false,
            array()
        );

        $statusCountsThisWeek = $this->getCandidateStatusCounts(
            $db,
            $siteID,
            $weekStart,
            $weekEnd,
            $officialReports,
            $monitoredJobOrders
        );
        $statusCountsLastWeek = $this->getCandidateStatusCounts(
            $db,
            $siteID,
            $weekStartPrev,
            $weekEndPrev,
            $officialReports,
            $monitoredJobOrders
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
            array()
        );
        $trendTitle = 'New Candidates (' . ucfirst($trendView) . ')';
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
        $this->_template->assign('weekLabel', $weekLabel);
        $this->_template->assign('expectedConversionFieldName', self::EXPECTED_CONVERSION_FIELD);
        $this->_template->assign('officialReports', $officialReports);
        $this->_template->assign('monitoredJobOrderFieldName', self::MONITORED_JOBORDER_FIELD);
        $this->_template->assign('candidateSourceRows', $candidateSourceRows);
        $this->_template->assign('candidateMetricRows', $candidateMetricRows);
        $this->_template->assign('candidateTrendGraphURL', $candidateTrendGraphURL);
        $this->_template->assign('candidateTrendView', $trendView);
        $this->_template->assign('candidateTrendStart', $trendStart->format('Y-m-d'));
        $this->_template->assign('candidateTrendEnd', $trendEnd->format('Y-m-d'));
        $this->_template->display('./modules/kpis/Kpis.tpl');
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

    private function isTruthyExtraField($value)
    {
        $value = strtolower(trim((string) $value));
        return in_array($value, array('yes', '1', 'true', 'on'), true);
    }

    private function getCandidateSourceCounts($db, $siteID, DateTime $start, DateTime $end, $officialReports, $monitoredJobOrders)
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
            GROUP BY
                source",
            $db->makeQueryInteger($siteID),
            $db->makeQueryString($start->format('Y-m-d H:i:s')),
            $db->makeQueryString($end->format('Y-m-d H:i:s')),
            $joinFilter
        );

        $rows = $db->getAllAssoc($sql);
        $counts = array();
        foreach ($rows as $row)
        {
            $counts[$row['source']] = (int) $row['candidateCount'];
        }

        return $counts;
    }

    private function getCandidateTotalCount($db, $siteID, DateTime $start, DateTime $end, $officialReports, $monitoredJobOrders)
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
            %s",
            $db->makeQueryInteger($siteID),
            $db->makeQueryString($start->format('Y-m-d H:i:s')),
            $db->makeQueryString($end->format('Y-m-d H:i:s')),
            $joinFilter
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

    private function getCandidateStatusCounts($db, $siteID, DateTime $start, DateTime $end, $officialReports, $monitoredJobOrders)
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
                ) AS status_rows
            GROUP BY
                status_to",
            $db->makeQueryInteger($siteID),
            $db->makeQueryString($start->format('Y-m-d H:i:s')),
            $db->makeQueryString($end->format('Y-m-d H:i:s')),
            $this->formatIntegerList($statusIDs),
            $joinFilter
        );

        $rows = $db->getAllAssoc($sql);
        $counts = array();
        foreach ($rows as $row)
        {
            $counts[(int) $row['statusTo']] = (int) $row['statusCount'];
        }

        return $counts;
    }

    private function getCandidateTrendData($db, $siteID, DateTime $start, DateTime $end, $view, $officialReports, $monitoredJobOrders)
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
                GROUP BY
                    periodKey",
                $db->makeQueryInteger($siteID),
                $db->makeQueryString($start->format('Y-m-d H:i:s')),
                $db->makeQueryString($end->format('Y-m-d H:i:s')),
                $joinFilter
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
                GROUP BY
                    periodKey",
                $db->makeQueryInteger($siteID),
                $db->makeQueryString($start->format('Y-m-d H:i:s')),
                $db->makeQueryString($end->format('Y-m-d H:i:s')),
                $joinFilter
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
        $sources = array_keys($thisWeek);
        $sources = array_merge($sources, array_keys($lastWeek));
        $sources = array_values(array_unique($sources));
        natcasesort($sources);

        $rows = array();
        foreach ($sources as $source)
        {
            $countThisWeek = isset($thisWeek[$source]) ? (int) $thisWeek[$source] : 0;
            $countLastWeek = isset($lastWeek[$source]) ? (int) $lastWeek[$source] : 0;
            if ($countThisWeek <= 0 && $countLastWeek <= 0)
            {
                continue;
            }

            $rows[] = $this->buildCandidateMetricRow(
                $source,
                $countThisWeek,
                $countLastWeek
            );
        }

        return $rows;
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
}

?>
