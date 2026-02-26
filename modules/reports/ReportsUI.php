<?php
/*
 * CATS
 * Reports Module
 *
 * Copyright (C) 2005 - 2007 Cognizo Technologies, Inc.
 *
 *
 * The contents of this file are subject to the CATS Public License
 * Version 1.1a (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.catsone.com/.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See the
 * License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is "CATS Standard Edition".
 *
 * The Initial Developer of the Original Code is Cognizo Technologies, Inc.
 * Portions created by the Initial Developer are Copyright (C) 2005 - 2007
 * (or from the year in which this file was created to the year 2007) by
 * Cognizo Technologies, Inc. All Rights Reserved.
 *
 *
 * $Id: ReportsUI.php 3810 2007-12-05 19:13:25Z brian $
 */

include_once(LEGACY_ROOT . '/lib/Statistics.php');
include_once(LEGACY_ROOT . '/lib/DateUtility.php');
include_once(LEGACY_ROOT . '/lib/Candidates.php');
include_once(LEGACY_ROOT . '/lib/CommonErrors.php');
include_once(LEGACY_ROOT . '/lib/JobOrderStatuses.php');
include_once(LEGACY_ROOT . '/lib/ReportsSettings.php');

class ReportsUI extends UserInterface
{
    const CUSTOMER_DASH_SLA_ACTIVITY_DAYS = 5;
    const CUSTOMER_DASH_RISK_NO_ACTIVITY_DAYS = 10;
    const CUSTOMER_DASH_RISK_LONG_OPEN_DAYS = 30;
    const CUSTOMER_DASH_RISK_LOW_COVERAGE_DAYS = 14;

    public function __construct()
    {
        parent::__construct();

        $this->_authenticationRequired = true;
        $this->_moduleDirectory = 'reports';
        $this->_moduleName = 'reports';
        $this->_moduleTabText = 'Reports';
        $this->_subTabs = array(
                'EEO Reports' => CATSUtility::getIndexName() . '?m=reports&amp;a=customizeEEOReport'
            );
    }


    public function handleRequest()
    {
        if (!eval(Hooks::get('REPORTS_HANDLE_REQUEST'))) return;

        $action = $this->getAction();
        switch ($action)
        {
            case 'customerDashboard':
                $this->customerDashboard();
                break;

            case 'graphView':
                $this->graphView();
                break;

            case 'generateJobOrderReportPDF':
                $this->generateJobOrderReportPDF();
                break;

            case 'showSubmissionReport':
                $this->showSubmissionReport();
                break;

            case 'showPlacementReport':
                $this->showHireReport();
                break;

            case 'showHireReport':
                $this->showHireReport();
                break;

            case 'customizeJobOrderReport':
                $this->customizeJobOrderReport();
                break;

            case 'customizeEEOReport':
                $this->customizeEEOReport();
                break;

            case 'generateEEOReportPreview':
                $this->generateEEOReportPreview();
                break;

            case 'reports':
            default:
                $this->reports();
                break;
        }
    }

    private function reports()
    {
        /* Grab an instance of Statistics. */
        $statistics = new Statistics($this->_siteID);

        /* Get company statistics. */
        $statisticsData['totalCompanies']     = $statistics->getCompanyCount(TIME_PERIOD_TODATE);
        $statisticsData['companiesToday']     = $statistics->getCompanyCount(TIME_PERIOD_TODAY);
        $statisticsData['companiesYesterday'] = $statistics->getCompanyCount(TIME_PERIOD_YESTERDAY);
        $statisticsData['companiesThisWeek']  = $statistics->getCompanyCount(TIME_PERIOD_THISWEEK);
        $statisticsData['companiesLastWeek']  = $statistics->getCompanyCount(TIME_PERIOD_LASTWEEK);
        $statisticsData['companiesThisMonth'] = $statistics->getCompanyCount(TIME_PERIOD_THISMONTH);
        $statisticsData['companiesLastMonth'] = $statistics->getCompanyCount(TIME_PERIOD_LASTMONTH);
        $statisticsData['companiesThisYear']  = $statistics->getCompanyCount(TIME_PERIOD_THISYEAR);
        $statisticsData['companiesLastYear']  = $statistics->getCompanyCount(TIME_PERIOD_LASTYEAR);

        /* Get candidate statistics. */
        $statisticsData['totalCandidates']     = $statistics->getCandidateCount(TIME_PERIOD_TODATE);
        $statisticsData['candidatesToday']     = $statistics->getCandidateCount(TIME_PERIOD_TODAY);
        $statisticsData['candidatesYesterday'] = $statistics->getCandidateCount(TIME_PERIOD_YESTERDAY);
        $statisticsData['candidatesThisWeek']  = $statistics->getCandidateCount(TIME_PERIOD_THISWEEK);
        $statisticsData['candidatesLastWeek']  = $statistics->getCandidateCount(TIME_PERIOD_LASTWEEK);
        $statisticsData['candidatesThisMonth'] = $statistics->getCandidateCount(TIME_PERIOD_THISMONTH);
        $statisticsData['candidatesLastMonth'] = $statistics->getCandidateCount(TIME_PERIOD_LASTMONTH);
        $statisticsData['candidatesThisYear']  = $statistics->getCandidateCount(TIME_PERIOD_THISYEAR);
        $statisticsData['candidatesLastYear']  = $statistics->getCandidateCount(TIME_PERIOD_LASTYEAR);

        /* Get submission statistics. */
        $statisticsData['totalSubmissions']     = $statistics->getSubmissionCount(TIME_PERIOD_TODATE);
        $statisticsData['submissionsToday']     = $statistics->getSubmissionCount(TIME_PERIOD_TODAY);
        $statisticsData['submissionsYesterday'] = $statistics->getSubmissionCount(TIME_PERIOD_YESTERDAY);
        $statisticsData['submissionsThisWeek']  = $statistics->getSubmissionCount(TIME_PERIOD_THISWEEK);
        $statisticsData['submissionsLastWeek']  = $statistics->getSubmissionCount(TIME_PERIOD_LASTWEEK);
        $statisticsData['submissionsThisMonth'] = $statistics->getSubmissionCount(TIME_PERIOD_THISMONTH);
        $statisticsData['submissionsLastMonth'] = $statistics->getSubmissionCount(TIME_PERIOD_LASTMONTH);
        $statisticsData['submissionsThisYear']  = $statistics->getSubmissionCount(TIME_PERIOD_THISYEAR);
        $statisticsData['submissionsLastYear']  = $statistics->getSubmissionCount(TIME_PERIOD_LASTYEAR);

		/* Get hire statistics. */
        $statisticsData['totalHires']     = $statistics->getHireCount(TIME_PERIOD_TODATE);
        $statisticsData['hiresToday']     = $statistics->getHireCount(TIME_PERIOD_TODAY);
        $statisticsData['hiresYesterday'] = $statistics->getHireCount(TIME_PERIOD_YESTERDAY);
        $statisticsData['hiresThisWeek']  = $statistics->getHireCount(TIME_PERIOD_THISWEEK);
        $statisticsData['hiresLastWeek']  = $statistics->getHireCount(TIME_PERIOD_LASTWEEK);
        $statisticsData['hiresThisMonth'] = $statistics->getHireCount(TIME_PERIOD_THISMONTH);
        $statisticsData['hiresLastMonth'] = $statistics->getHireCount(TIME_PERIOD_LASTMONTH);
        $statisticsData['hiresThisYear']  = $statistics->getHireCount(TIME_PERIOD_THISYEAR);
        $statisticsData['hiresLastYear']  = $statistics->getHireCount(TIME_PERIOD_LASTYEAR);

        /* Get contact statistics. */
        $statisticsData['totalContacts']     = $statistics->getContactCount(TIME_PERIOD_TODATE);
        $statisticsData['contactsToday']     = $statistics->getContactCount(TIME_PERIOD_TODAY);
        $statisticsData['contactsYesterday'] = $statistics->getContactCount(TIME_PERIOD_YESTERDAY);
        $statisticsData['contactsThisWeek']  = $statistics->getContactCount(TIME_PERIOD_THISWEEK);
        $statisticsData['contactsLastWeek']  = $statistics->getContactCount(TIME_PERIOD_LASTWEEK);
        $statisticsData['contactsThisMonth'] = $statistics->getContactCount(TIME_PERIOD_THISMONTH);
        $statisticsData['contactsLastMonth'] = $statistics->getContactCount(TIME_PERIOD_LASTMONTH);
        $statisticsData['contactsThisYear']  = $statistics->getContactCount(TIME_PERIOD_THISYEAR);
        $statisticsData['contactsLastYear']  = $statistics->getContactCount(TIME_PERIOD_LASTYEAR);

        /* Get job order statistics. */
        $statisticsData['totalJobOrders']     = $statistics->getJobOrderCount(TIME_PERIOD_TODATE);
        $statisticsData['jobOrdersToday']     = $statistics->getJobOrderCount(TIME_PERIOD_TODAY);
        $statisticsData['jobOrdersYesterday'] = $statistics->getJobOrderCount(TIME_PERIOD_YESTERDAY);
        $statisticsData['jobOrdersThisWeek']  = $statistics->getJobOrderCount(TIME_PERIOD_THISWEEK);
        $statisticsData['jobOrdersLastWeek']  = $statistics->getJobOrderCount(TIME_PERIOD_LASTWEEK);
        $statisticsData['jobOrdersThisMonth'] = $statistics->getJobOrderCount(TIME_PERIOD_THISMONTH);
        $statisticsData['jobOrdersLastMonth'] = $statistics->getJobOrderCount(TIME_PERIOD_LASTMONTH);
        $statisticsData['jobOrdersThisYear']  = $statistics->getJobOrderCount(TIME_PERIOD_THISYEAR);
        $statisticsData['jobOrdersLastYear']  = $statistics->getJobOrderCount(TIME_PERIOD_LASTYEAR);

        if (!eval(Hooks::get('REPORTS_SHOW'))) return;

        $this->_template->assign('active', $this);
        $this->_template->assign('statisticsData', $statisticsData);
        $this->_template->display('./modules/reports/Reports.tpl');
    }

    private function customerDashboard()
    {
        $db = DatabaseConnection::getInstance();

        $companiesRS = $this->getCompanyListForDashboard($db);
        $rangeOptions = array(
            30 => 'Last 30 days',
            90 => 'Last 90 days',
            180 => 'Last 180 days',
            365 => 'Last 365 days'
        );
        $activityTypeOptions = array(
            'all' => array(
                'label' => 'All Moves',
                'statusIDs' => array()
            ),
            'interview' => array(
                'label' => 'Interview Moves',
                'statusIDs' => array(
                    PIPELINE_STATUS_CUSTOMER_INTERVIEW
                )
            ),
            'offer' => array(
                'label' => 'Offer Moves',
                'statusIDs' => array(
                    PIPELINE_STATUS_OFFER_NEGOTIATION,
                    PIPELINE_STATUS_OFFER_ACCEPTED
                )
            ),
            'hire' => array(
                'label' => 'Hire Moves',
                'statusIDs' => array(
                    PIPELINE_STATUS_HIRED
                )
            )
        );

        $rangeDays = (int) $this->getTrimmedInput('rangeDays', $_GET);
        if (!isset($rangeOptions[$rangeDays]))
        {
            $rangeDays = 90;
        }

        $activityType = $this->getTrimmedInput('activityType', $_GET);
        if (!isset($activityTypeOptions[$activityType]))
        {
            $activityType = 'all';
        }
        $activityStatusIDs = $activityTypeOptions[$activityType]['statusIDs'];

        $focusMetric = $this->getTrimmedInput('focusMetric', $_GET);
        $allowedFocusMetrics = array(
            'openJobOrders',
            'currentHires',
            'confirmedFutureHires',
            'activePipeline',
            'offerAcceptance',
            'aging0to15',
            'aging16to30',
            'aging31plus'
        );
        if (!in_array($focusMetric, $allowedFocusMetrics))
        {
            $focusMetric = '';
        }

        $selectedCompanyID = (int) $this->getTrimmedInput('companyID', $_GET);
        $selectedCompanyName = '';
        foreach ($companiesRS as $companyData)
        {
            if ((int) $companyData['companyID'] === $selectedCompanyID)
            {
                $selectedCompanyName = $companyData['name'];
                break;
            }
        }

        if ($selectedCompanyName === '' && !empty($companiesRS))
        {
            $selectedCompanyID = (int) $companiesRS[0]['companyID'];
            $selectedCompanyName = $companiesRS[0]['name'];
        }

        $rangeEnd = new DateTime('now');
        $rangeEnd->setTime(23, 59, 59);
        $rangeStart = clone $rangeEnd;
        $rangeStart->setTime(0, 0, 0);
        $rangeStart->modify('-' . ($rangeDays - 1) . ' days');

        $thresholds = $this->getCustomerDashboardThresholds();

        $dashboardData = array();
        if ($selectedCompanyID > 0)
        {
            $dashboardData = $this->getCustomerDashboardData(
                $db,
                $selectedCompanyID,
                $rangeStart,
                $rangeEnd,
                $thresholds,
                $activityStatusIDs,
                $focusMetric
            );
        }

        if (!eval(Hooks::get('REPORTS_CUSTOMER_DASHBOARD'))) return;

        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', 'Customer Dashboard');
        $this->_template->assign('companiesRS', $companiesRS);
        $this->_template->assign('selectedCompanyID', $selectedCompanyID);
        $this->_template->assign('selectedCompanyName', $selectedCompanyName);
        $this->_template->assign('rangeDays', $rangeDays);
        $this->_template->assign('rangeOptions', $rangeOptions);
        $activityTypeTemplateOptions = array();
        foreach ($activityTypeOptions as $key => $meta)
        {
            $activityTypeTemplateOptions[$key] = $meta['label'];
        }
        $this->_template->assign('activityType', $activityType);
        $this->_template->assign('activityTypeOptions', $activityTypeTemplateOptions);
        $this->_template->assign('activityTypeLabel', $activityTypeOptions[$activityType]['label']);
        $this->_template->assign('focusMetric', $focusMetric);
        $this->_template->assign('rangeStartLabel', $rangeStart->format('M j, Y'));
        $this->_template->assign('rangeEndLabel', $rangeEnd->format('M j, Y'));
        $this->_template->assign('dashboardData', $dashboardData);
        $this->_template->display('./modules/reports/CustomerDashboard.tpl');
    }

    private function getCompanyListForDashboard($db)
    {
        return $db->getAllAssoc(sprintf(
            "SELECT
                company_id AS companyID,
                name
            FROM
                company
            WHERE
                site_id = %s
            ORDER BY
                name ASC",
            $db->makeQueryInteger($this->_siteID)
        ));
    }

    private function getCustomerDashboardThresholds()
    {
        $thresholds = array(
            'slaActivityDays' => self::CUSTOMER_DASH_SLA_ACTIVITY_DAYS,
            'riskNoActivityDays' => self::CUSTOMER_DASH_RISK_NO_ACTIVITY_DAYS,
            'riskLongOpenDays' => self::CUSTOMER_DASH_RISK_LONG_OPEN_DAYS,
            'riskLowCoverageDays' => self::CUSTOMER_DASH_RISK_LOW_COVERAGE_DAYS
        );

        $reportsSettings = new ReportsSettings($this->_siteID);
        $reportsSettingsRS = $reportsSettings->getAll();

        $thresholds['slaActivityDays'] = (int) $reportsSettingsRS[ReportsSettings::SETTING_SLA_ACTIVITY_DAYS];
        $thresholds['riskNoActivityDays'] = (int) $reportsSettingsRS[ReportsSettings::SETTING_RISK_NO_ACTIVITY_DAYS];
        $thresholds['riskLongOpenDays'] = (int) $reportsSettingsRS[ReportsSettings::SETTING_RISK_LONG_OPEN_DAYS];
        $thresholds['riskLowCoverageDays'] = (int) $reportsSettingsRS[ReportsSettings::SETTING_RISK_LOW_COVERAGE_DAYS];

        return $thresholds;
    }

    private function getCustomerDashboardData($db, $companyID, $rangeStart, $rangeEnd, $thresholds, $activityStatusIDs = array(), $focusMetric = '')
    {
        $summaryRS = $db->getAssoc(sprintf(
            "SELECT
                COUNT(*) AS totalJobOrders
            FROM
                joborder
            WHERE
                site_id = %s
            AND
                company_id = %s",
            $db->makeQueryInteger($this->_siteID),
            $db->makeQueryInteger($companyID)
        ));
        if (empty($summaryRS))
        {
            $summaryRS = array('totalJobOrders' => 0);
        }

        $openJobRowsRaw = $this->getCustomerOpenJobHealthRows($db, $companyID);
        $openJobRows = array();
        $atRiskJobs = array();
        $aging = array(
            'bucket0to15' => 0,
            'bucket16to30' => 0,
            'bucket31plus' => 0
        );
        $slaHits = 0;
        $todayTimestamp = time();

        foreach ($openJobRowsRaw as $row)
        {
            $daysOpen = (int) $row['daysOpen'];
            if ($daysOpen <= 15)
            {
                ++$aging['bucket0to15'];
            }
            else if ($daysOpen <= 30)
            {
                ++$aging['bucket16to30'];
            }
            else
            {
                ++$aging['bucket31plus'];
            }

            $lastPipelineDateRaw = trim((string) $row['lastPipelineDate']);
            $lastPipelineDateLabel = 'No pipeline activity';
            $daysSinceActivity = null;
            if ($lastPipelineDateRaw !== '' && strpos($lastPipelineDateRaw, '1000-01-01') !== 0)
            {
                $lastPipelineTimestamp = strtotime($lastPipelineDateRaw);
                if ($lastPipelineTimestamp !== false)
                {
                    $daysSinceActivity = (int) floor(($todayTimestamp - $lastPipelineTimestamp) / 86400);
                    if ($daysSinceActivity < 0)
                    {
                        $daysSinceActivity = 0;
                    }
                    if ($daysSinceActivity <= (int) $thresholds['slaActivityDays'])
                    {
                        ++$slaHits;
                    }

                    $lastPipelineDateLabel = date('M j, Y', $lastPipelineTimestamp);
                }
            }

            $riskScore = 0;
            $riskReasons = array();
            $activeCandidates = (int) $row['activeCandidates'];
            $openingsAvailable = (int) $row['openingsAvailable'];
            $openingsTotal = (int) $row['openingsTotal'];
            if ($openingsTotal < $openingsAvailable)
            {
                $openingsTotal = $openingsAvailable;
            }
            $hasOpenDemand = ($openingsAvailable > 0);

            if ($hasOpenDemand)
            {
                if ($activeCandidates <= 0)
                {
                    $riskScore += 3;
                    $riskReasons[] = 'No active candidates in pipeline';
                }

                if ($daysSinceActivity === null)
                {
                    $riskScore += 2;
                    $riskReasons[] = 'No recorded pipeline activity';
                }
                else if ($daysSinceActivity > (int) $thresholds['riskNoActivityDays'])
                {
                    $riskScore += 2;
                    $riskReasons[] = 'No candidate movement in ' . $daysSinceActivity . ' days';
                }

                if ($daysOpen > (int) $thresholds['riskLongOpenDays'])
                {
                    ++$riskScore;
                    $riskReasons[] = 'Open for ' . $daysOpen . ' days';
                }

                if ($activeCandidates < $openingsAvailable && $daysOpen > (int) $thresholds['riskLowCoverageDays'])
                {
                    ++$riskScore;
                    $riskReasons[] = 'Pipeline coverage lower than openings';
                }
            }
            else if ($daysOpen > (int) $thresholds['riskLongOpenDays'])
            {
                $riskScore += 2;
                $riskReasons[] = 'No openings available; still open for ' . $daysOpen . ' days';
            }

            if ($riskScore >= 4)
            {
                $healthLabel = 'At Risk';
                $healthClass = 'risk';
            }
            else if ($riskScore >= 2)
            {
                $healthLabel = 'Watch';
                $healthClass = 'watch';
            }
            else
            {
                $healthLabel = 'Healthy';
                $healthClass = 'healthy';
            }

            $openJobRow = array(
                'jobOrderID' => (int) $row['jobOrderID'],
                'title' => $row['title'],
                'status' => $row['status'],
                'openingsTotal' => $openingsTotal,
                'openingsAvailable' => $openingsAvailable,
                'activeCandidates' => $activeCandidates,
                'daysOpen' => $daysOpen,
                'lastPipelineDateLabel' => $lastPipelineDateLabel,
                'daysSinceActivity' => $daysSinceActivity,
                'healthLabel' => $healthLabel,
                'healthClass' => $healthClass,
                'riskScore' => $riskScore,
                'riskReasonsLabel' => implode('; ', $riskReasons)
            );
            $openJobRows[] = $openJobRow;

            if ($riskScore >= 2)
            {
                $atRiskJobs[] = $openJobRow;
            }
        }

        $openJobOrders = count($openJobRows);
        $slaHitRate = null;
        if ($openJobOrders > 0)
        {
            $slaHitRate = ((float) $slaHits / (float) $openJobOrders) * 100.0;
        }

        $aging0Rows = array();
        $aging16Rows = array();
        $aging31Rows = array();
        $slaHitRows = array();
        foreach ($openJobRows as $openJobRow)
        {
            if ($openJobRow['daysOpen'] <= 15)
            {
                $aging0Rows[] = $openJobRow;
            }
            else if ($openJobRow['daysOpen'] <= 30)
            {
                $aging16Rows[] = $openJobRow;
            }
            else
            {
                $aging31Rows[] = $openJobRow;
            }

            if ($openJobRow['daysSinceActivity'] !== null &&
                $openJobRow['daysSinceActivity'] <= (int) $thresholds['slaActivityDays'])
            {
                $slaHitRows[] = $openJobRow;
            }
        }

        $activePipelineRows = $this->getCustomerActivePipelineRows($db, $companyID);
        $activePipelineCount = count($activePipelineRows);

        $hireRowsInRange = $this->getCustomerHireRows($db, $companyID, $rangeStart, $rangeEnd, false);
        $daysToFillValues = array();
        foreach ($hireRowsInRange as $row)
        {
            $daysToFillValues[] = (int) $row['daysToFill'];
        }
        $hiresInRange = count($hireRowsInRange);
        $medianDaysToFill = $this->getMedianInteger($daysToFillValues);

        $futureHireRows = $this->getCustomerHireRows($db, $companyID, null, null, true);
        $confirmedFutureHires = count($futureHireRows);

        $offerRS = $db->getAssoc(sprintf(
            "SELECT
                COUNT(DISTINCT IF(cjh.status_to = %s, CONCAT(cjh.candidate_id, '-', cjh.joborder_id), NULL)) AS offersMade,
                COUNT(DISTINCT IF(cjh.status_to IN (%s, %s), CONCAT(cjh.candidate_id, '-', cjh.joborder_id), NULL)) AS offersAccepted
            FROM
                candidate_joborder_status_history AS cjh
            INNER JOIN joborder AS jo
                ON jo.joborder_id = cjh.joborder_id
                AND jo.site_id = cjh.site_id
            WHERE
                cjh.site_id = %s
            AND
                jo.company_id = %s
            AND
                cjh.date >= %s
            AND
                cjh.date <= %s",
            $db->makeQueryInteger(PIPELINE_STATUS_OFFER_NEGOTIATION),
            $db->makeQueryInteger(PIPELINE_STATUS_OFFER_ACCEPTED),
            $db->makeQueryInteger(PIPELINE_STATUS_HIRED),
            $db->makeQueryInteger($this->_siteID),
            $db->makeQueryInteger($companyID),
            $db->makeQueryString($rangeStart->format('Y-m-d H:i:s')),
            $db->makeQueryString($rangeEnd->format('Y-m-d H:i:s'))
        ));
        $offersMade = empty($offerRS) ? 0 : (int) $offerRS['offersMade'];
        $offersAccepted = empty($offerRS) ? 0 : (int) $offerRS['offersAccepted'];
        $offerAcceptanceRate = null;
        if ($offersMade > 0)
        {
            $offerAcceptanceRate = ((float) $offersAccepted / (float) $offersMade) * 100.0;
        }
        $offerBreakdownRows = $this->getCustomerOfferBreakdownRows($db, $companyID, $rangeStart, $rangeEnd);

        $funnelData = $this->getCustomerFunnelStages($db, $companyID);
        $activityTrendData = $this->getCustomerWeeklyActivity($db, $companyID);
        $sourceQualityRows = $this->getCustomerSourceQuality($db, $companyID, $rangeStart, $rangeEnd);
        $rejectionReasonRows = $this->getCustomerRejectionReasons($db, $companyID, $rangeStart, $rangeEnd);
        $upcomingOutcomes = $this->getCustomerUpcomingOutcomes($db, $companyID, $activityStatusIDs);
        $cardDetail = $this->getCustomerCardDetail(
            $focusMetric,
            $openJobRows,
            $aging0Rows,
            $aging16Rows,
            $aging31Rows,
            $slaHitRows,
            $hireRowsInRange,
            $futureHireRows,
            $activePipelineRows,
            $offerBreakdownRows
        );

        $insightLine = '';
        if (!empty($funnelData['biggestDropoff']))
        {
            $insightLine = sprintf(
                'Largest stage drop-off: %s -> %s (%s drop).',
                $funnelData['biggestDropoff']['from'],
                $funnelData['biggestDropoff']['to'],
                $funnelData['biggestDropoff']['dropLabel']
            );
        }
        else if (count($atRiskJobs) > 0)
        {
            $insightLine = count($atRiskJobs) . ' open job order(s) are currently flagged as at risk.';
        }
        else
        {
            $insightLine = 'Pipeline movement is stable for the selected period.';
        }

        return array(
            'snapshot' => array(
                'totalJobOrders' => (int) $summaryRS['totalJobOrders'],
                'openJobOrders' => $openJobOrders,
                'hiresInRange' => $hiresInRange,
                'confirmedFutureHires' => $confirmedFutureHires,
                'medianDaysToFill' => $medianDaysToFill,
                'activePipelineCount' => $activePipelineCount,
                'offersMade' => $offersMade,
                'offersAccepted' => $offersAccepted,
                'offerAcceptanceRate' => $offerAcceptanceRate,
                'offerAcceptanceLabel' => $this->formatPercentValue($offerAcceptanceRate),
                'slaHitRate' => $slaHitRate,
                'slaHitLabel' => $this->formatPercentValue($slaHitRate),
                'slaWindowDays' => (int) $thresholds['slaActivityDays'],
                'riskNoActivityDays' => (int) $thresholds['riskNoActivityDays'],
                'riskLongOpenDays' => (int) $thresholds['riskLongOpenDays']
            ),
            'aging' => $aging,
            'openJobRows' => $openJobRows,
            'atRiskJobs' => $atRiskJobs,
            'hireRowsInRange' => $hireRowsInRange,
            'futureHireRows' => $futureHireRows,
            'activePipelineRows' => $activePipelineRows,
            'offerBreakdownRows' => $offerBreakdownRows,
            'slaHitRows' => $slaHitRows,
            'aging0Rows' => $aging0Rows,
            'aging16Rows' => $aging16Rows,
            'aging31Rows' => $aging31Rows,
            'cardDetail' => $cardDetail,
            'funnelStages' => $funnelData['stages'],
            'funnelConversions' => $funnelData['conversions'],
            'biggestDropoff' => $funnelData['biggestDropoff'],
            'activityTrendRows' => $activityTrendData['rows'],
            'activityTrendMax' => $activityTrendData['maxValue'],
            'sourceQualityRows' => $sourceQualityRows,
            'rejectionReasonRows' => $rejectionReasonRows,
            'upcomingOutcomes' => $upcomingOutcomes,
            'insightLine' => $insightLine
        );
    }

    private function getCustomerOpenJobHealthRows($db, $companyID)
    {
        return $db->getAllAssoc(sprintf(
            "SELECT
                jo.joborder_id AS jobOrderID,
                jo.title,
                jo.status,
                jo.openings AS openingsTotal,
                jo.openings_available AS openingsAvailable,
                DATEDIFF(NOW(), jo.date_created) AS daysOpen,
                COUNT(DISTINCT IF(cjo.is_active = 1 AND cjo.status NOT IN (%s, %s), cjo.candidate_id, NULL)) AS activeCandidates,
                MAX(cjh.date) AS lastPipelineDate
            FROM
                joborder AS jo
            LEFT JOIN candidate_joborder AS cjo
                ON cjo.joborder_id = jo.joborder_id
                AND cjo.site_id = jo.site_id
            LEFT JOIN candidate_joborder_status_history AS cjh
                ON cjh.joborder_id = jo.joborder_id
                AND cjh.site_id = jo.site_id
            WHERE
                jo.site_id = %s
            AND
                jo.company_id = %s
            AND
                jo.status IN %s
            GROUP BY
                jo.joborder_id
            ORDER BY
                daysOpen DESC,
                jo.title ASC",
            $db->makeQueryInteger(PIPELINE_STATUS_HIRED),
            $db->makeQueryInteger(PIPELINE_STATUS_REJECTED),
            $db->makeQueryInteger($this->_siteID),
            $db->makeQueryInteger($companyID),
            JobOrderStatuses::getOpenStatusSQL()
        ));
    }

    private function getCustomerActivePipelineRows($db, $companyID)
    {
        $rows = $db->getAllAssoc(sprintf(
            "SELECT
                cjo.candidate_id AS candidateID,
                candidate.first_name AS firstName,
                candidate.last_name AS lastName,
                cjo.status AS statusID,
                jo.joborder_id AS jobOrderID,
                jo.title AS jobOrderTitle,
                DATE_FORMAT(cjo.date_modified, '%%m-%%d-%%y (%%h:%%i %%p)') AS lastUpdatedLabel
            FROM
                candidate_joborder AS cjo
            INNER JOIN joborder AS jo
                ON jo.joborder_id = cjo.joborder_id
                AND jo.site_id = cjo.site_id
            INNER JOIN candidate
                ON candidate.candidate_id = cjo.candidate_id
                AND candidate.site_id = cjo.site_id
            WHERE
                cjo.site_id = %s
            AND
                jo.company_id = %s
            AND
                jo.status IN %s
            AND
                cjo.is_active = 1
            AND
                cjo.status NOT IN (%s, %s)
            ORDER BY
                cjo.date_modified DESC,
                candidate.last_name ASC,
                candidate.first_name ASC",
            $db->makeQueryInteger($this->_siteID),
            $db->makeQueryInteger($companyID),
            JobOrderStatuses::getOpenStatusSQL(),
            $db->makeQueryInteger(PIPELINE_STATUS_HIRED),
            $db->makeQueryInteger(PIPELINE_STATUS_REJECTED)
        ));

        $outputRows = array();
        foreach ($rows as $row)
        {
            $candidateName = trim($row['firstName'] . ' ' . $row['lastName']);
            if ($candidateName === '')
            {
                $candidateName = 'Candidate #' . (int) $row['candidateID'];
            }

            $statusID = (int) $row['statusID'];
            $outputRows[] = array(
                'candidateID' => (int) $row['candidateID'],
                'candidateName' => $candidateName,
                'statusLabel' => $this->getPipelineStatusLabel($statusID),
                'statusSlug' => $this->getPipelineStatusSlug($statusID),
                'jobOrderID' => (int) $row['jobOrderID'],
                'jobOrderTitle' => $row['jobOrderTitle'],
                'lastUpdatedLabel' => $row['lastUpdatedLabel']
            );
        }

        return $outputRows;
    }

    private function getCustomerHireRows($db, $companyID, $rangeStart = null, $rangeEnd = null, $futureOnly = false)
    {
        $subqueryExtraFiltersSQL = '';
        if ($futureOnly)
        {
            $subqueryExtraFiltersSQL .= "\n                    AND\n                        cjh.date > NOW()";
        }

        $extraFiltersSQL = '';
        if ($rangeStart instanceof DateTime)
        {
            $extraFiltersSQL .= "\n            AND\n                first_hire.firstHireDate >= " . $db->makeQueryString($rangeStart->format('Y-m-d H:i:s'));
        }
        if ($rangeEnd instanceof DateTime)
        {
            $extraFiltersSQL .= "\n            AND\n                first_hire.firstHireDate <= " . $db->makeQueryString($rangeEnd->format('Y-m-d H:i:s'));
        }
        if ($futureOnly)
        {
            $extraFiltersSQL .= "\n            AND\n                first_hire.firstHireDate > NOW()";
        }

        $orderBySQL = ($futureOnly ? 'first_hire.firstHireDate ASC' : 'first_hire.firstHireDate DESC');

        $rows = $db->getAllAssoc(sprintf(
            "SELECT
                first_hire.candidate_id AS candidateID,
                candidate.first_name AS firstName,
                candidate.last_name AS lastName,
                first_hire.joborder_id AS jobOrderID,
                jo.title AS jobOrderTitle,
                DATE_FORMAT(first_hire.firstHireDate, '%%m-%%d-%%y (%%h:%%i %%p)') AS hireDateLabel,
                DATEDIFF(first_hire.firstHireDate, jo.date_created) AS daysToFill
            FROM
                (
                    SELECT
                        cjh.candidate_id,
                        cjh.joborder_id,
                        MIN(cjh.date) AS firstHireDate
                    FROM
                        candidate_joborder_status_history AS cjh
                    INNER JOIN joborder AS jo_hire
                        ON jo_hire.joborder_id = cjh.joborder_id
                        AND jo_hire.site_id = cjh.site_id
                    WHERE
                        cjh.site_id = %s
                    AND
                        jo_hire.company_id = %s
                    AND
                        cjh.status_to = %s
                    %s
                    GROUP BY
                        cjh.candidate_id,
                        cjh.joborder_id
                ) AS first_hire
            INNER JOIN joborder AS jo
                ON jo.joborder_id = first_hire.joborder_id
                AND jo.site_id = %s
            INNER JOIN candidate
                ON candidate.candidate_id = first_hire.candidate_id
                AND candidate.site_id = jo.site_id
            WHERE
                1 = 1
            %s
            ORDER BY
                %s",
            $db->makeQueryInteger($this->_siteID),
            $db->makeQueryInteger($companyID),
            $db->makeQueryInteger(PIPELINE_STATUS_HIRED),
            $subqueryExtraFiltersSQL,
            $db->makeQueryInteger($this->_siteID),
            $extraFiltersSQL,
            $orderBySQL
        ));

        $outputRows = array();
        foreach ($rows as $row)
        {
            $candidateName = trim($row['firstName'] . ' ' . $row['lastName']);
            if ($candidateName === '')
            {
                $candidateName = 'Candidate #' . (int) $row['candidateID'];
            }

            $daysToFill = (int) $row['daysToFill'];
            if ($daysToFill < 0)
            {
                $daysToFill = 0;
            }

            $outputRows[] = array(
                'candidateID' => (int) $row['candidateID'],
                'candidateName' => $candidateName,
                'jobOrderID' => (int) $row['jobOrderID'],
                'jobOrderTitle' => $row['jobOrderTitle'],
                'hireDateLabel' => $row['hireDateLabel'],
                'daysToFill' => $daysToFill
            );
        }

        return $outputRows;
    }

    private function getCustomerOfferBreakdownRows($db, $companyID, $rangeStart, $rangeEnd)
    {
        $rows = $db->getAllAssoc(sprintf(
            "SELECT
                cjh.candidate_id AS candidateID,
                candidate.first_name AS firstName,
                candidate.last_name AS lastName,
                cjh.joborder_id AS jobOrderID,
                jo.title AS jobOrderTitle,
                MIN(IF(cjh.status_to = %s, cjh.date, NULL)) AS offerDateRaw,
                DATE_FORMAT(MIN(IF(cjh.status_to = %s, cjh.date, NULL)), '%%m-%%d-%%y (%%h:%%i %%p)') AS offerDateLabel,
                MAX(IF(cjh.status_to IN (%s, %s), 1, 0)) AS acceptedInWindow,
                MAX(IF(cjh.status_to = %s, 1, 0)) AS hiredInWindow
            FROM
                candidate_joborder_status_history AS cjh
            INNER JOIN joborder AS jo
                ON jo.joborder_id = cjh.joborder_id
                AND jo.site_id = cjh.site_id
            INNER JOIN candidate
                ON candidate.candidate_id = cjh.candidate_id
                AND candidate.site_id = cjh.site_id
            WHERE
                cjh.site_id = %s
            AND
                jo.company_id = %s
            AND
                cjh.date >= %s
            AND
                cjh.date <= %s
            AND
                cjh.status_to IN (%s, %s, %s)
            GROUP BY
                cjh.candidate_id,
                cjh.joborder_id
            HAVING
                offerDateRaw IS NOT NULL
                OR acceptedInWindow = 1
                OR hiredInWindow = 1
            ORDER BY
                offerDateRaw DESC,
                candidate.last_name ASC,
                candidate.first_name ASC",
            $db->makeQueryInteger(PIPELINE_STATUS_OFFER_NEGOTIATION),
            $db->makeQueryInteger(PIPELINE_STATUS_OFFER_NEGOTIATION),
            $db->makeQueryInteger(PIPELINE_STATUS_OFFER_ACCEPTED),
            $db->makeQueryInteger(PIPELINE_STATUS_HIRED),
            $db->makeQueryInteger(PIPELINE_STATUS_HIRED),
            $db->makeQueryInteger($this->_siteID),
            $db->makeQueryInteger($companyID),
            $db->makeQueryString($rangeStart->format('Y-m-d H:i:s')),
            $db->makeQueryString($rangeEnd->format('Y-m-d H:i:s')),
            $db->makeQueryInteger(PIPELINE_STATUS_OFFER_NEGOTIATION),
            $db->makeQueryInteger(PIPELINE_STATUS_OFFER_ACCEPTED),
            $db->makeQueryInteger(PIPELINE_STATUS_HIRED)
        ));

        $outputRows = array();
        foreach ($rows as $row)
        {
            $candidateName = trim($row['firstName'] . ' ' . $row['lastName']);
            if ($candidateName === '')
            {
                $candidateName = 'Candidate #' . (int) $row['candidateID'];
            }

            $hiredInWindow = ((int) $row['hiredInWindow'] === 1);
            $acceptedInWindow = ((int) $row['acceptedInWindow'] === 1);
            $outcomeLabel = 'Pending';
            $outcomeSlug = 'offer-negotiation';
            if ($hiredInWindow)
            {
                $outcomeLabel = 'Hired';
                $outcomeSlug = 'hired';
            }
            else if ($acceptedInWindow)
            {
                $outcomeLabel = 'Accepted';
                $outcomeSlug = 'offer-accepted';
            }

            $offerDateLabel = trim((string) $row['offerDateLabel']);
            if ($offerDateLabel === '')
            {
                $offerDateLabel = 'N/A';
            }

            $outputRows[] = array(
                'candidateID' => (int) $row['candidateID'],
                'candidateName' => $candidateName,
                'jobOrderID' => (int) $row['jobOrderID'],
                'jobOrderTitle' => $row['jobOrderTitle'],
                'offerDateLabel' => $offerDateLabel,
                'outcomeLabel' => $outcomeLabel,
                'outcomeSlug' => $outcomeSlug
            );
        }

        return $outputRows;
    }

    private function getCustomerCardDetail(
        $focusMetric,
        $openJobRows,
        $aging0Rows,
        $aging16Rows,
        $aging31Rows,
        $slaHitRows,
        $hireRowsInRange,
        $futureHireRows,
        $activePipelineRows,
        $offerBreakdownRows
    )
    {
        switch ($focusMetric)
        {
            case 'openJobOrders':
                return array(
                    'key' => $focusMetric,
                    'title' => 'Open Job Orders',
                    'emptyLabel' => 'No open job orders found for this customer.',
                    'rows' => $openJobRows
                );

            case 'currentHires':
                return array(
                    'key' => $focusMetric,
                    'title' => 'Current Hires in Selected Window',
                    'emptyLabel' => 'No hires were recorded in the selected window.',
                    'rows' => $hireRowsInRange
                );

            case 'confirmedFutureHires':
                return array(
                    'key' => $focusMetric,
                    'title' => 'Confirmed Future Hires',
                    'emptyLabel' => 'No future-dated hires were found.',
                    'rows' => $futureHireRows
                );

            case 'activePipeline':
                return array(
                    'key' => $focusMetric,
                    'title' => 'Active Pipeline Candidates',
                    'emptyLabel' => 'No active pipeline candidates found.',
                    'rows' => $activePipelineRows
                );

            case 'offerAcceptance':
                return array(
                    'key' => $focusMetric,
                    'title' => 'Offer Outcomes in Selected Window',
                    'emptyLabel' => 'No offer activity was found in the selected window.',
                    'rows' => $offerBreakdownRows
                );

            case 'aging0to15':
                return array(
                    'key' => $focusMetric,
                    'title' => 'Aging 0-15 Days',
                    'emptyLabel' => 'No open jobs in the 0-15 day bucket.',
                    'rows' => $aging0Rows
                );

            case 'aging16to30':
                return array(
                    'key' => $focusMetric,
                    'title' => 'Aging 16-30 Days',
                    'emptyLabel' => 'No open jobs in the 16-30 day bucket.',
                    'rows' => $aging16Rows
                );

            case 'aging31plus':
                return array(
                    'key' => $focusMetric,
                    'title' => 'Aging 31+ Days',
                    'emptyLabel' => 'No open jobs in the 31+ day bucket.',
                    'rows' => $aging31Rows
                );
        }

        return array();
    }

    private function getCustomerFunnelStages($db, $companyID)
    {
        $funnelCountsRS = $db->getAllAssoc(sprintf(
            "SELECT
                cjo.status AS statusID,
                COUNT(*) AS pipelineCount
            FROM
                candidate_joborder AS cjo
            INNER JOIN joborder AS jo
                ON jo.joborder_id = cjo.joborder_id
                AND jo.site_id = cjo.site_id
            WHERE
                cjo.site_id = %s
            AND
                jo.company_id = %s
            AND
                jo.status IN %s
            AND
                cjo.is_active = 1
            GROUP BY
                cjo.status",
            $db->makeQueryInteger($this->_siteID),
            $db->makeQueryInteger($companyID),
            JobOrderStatuses::getOpenStatusSQL()
        ));

        $countByStatus = array();
        foreach ($funnelCountsRS as $row)
        {
            $countByStatus[(int) $row['statusID']] = (int) $row['pipelineCount'];
        }

        $stageMeta = array(
            array('statusID' => PIPELINE_STATUS_ALLOCATED, 'label' => 'Allocated'),
            array('statusID' => PIPELINE_STATUS_DELIVERY_VALIDATED, 'label' => 'Delivery Validated'),
            array('statusID' => PIPELINE_STATUS_PROPOSED_TO_CUSTOMER, 'label' => 'Proposed to Customer'),
            array('statusID' => PIPELINE_STATUS_CUSTOMER_INTERVIEW, 'label' => 'Customer Interview'),
            array('statusID' => PIPELINE_STATUS_CUSTOMER_APPROVED, 'label' => 'Customer Approved'),
            array('statusID' => PIPELINE_STATUS_AVEL_APPROVED, 'label' => 'Avel Approved'),
            array('statusID' => PIPELINE_STATUS_OFFER_NEGOTIATION, 'label' => 'Offer Negotiation'),
            array('statusID' => PIPELINE_STATUS_OFFER_ACCEPTED, 'label' => 'Offer Accepted'),
            array('statusID' => PIPELINE_STATUS_HIRED, 'label' => 'Hired')
        );

        $maxCount = 0;
        $stages = array();
        foreach ($stageMeta as $stage)
        {
            $count = isset($countByStatus[$stage['statusID']]) ? $countByStatus[$stage['statusID']] : 0;
            if ($count > $maxCount)
            {
                $maxCount = $count;
            }
            $stages[] = array(
                'statusID' => $stage['statusID'],
                'label' => $stage['label'],
                'count' => $count
            );
        }

        if ($maxCount <= 0)
        {
            $maxCount = 1;
        }
        foreach ($stages as $index => $stage)
        {
            $stages[$index]['barWidth'] = (int) round(($stage['count'] / $maxCount) * 100);
        }

        $conversions = array();
        $biggestDropoff = array();
        $maxDropPercent = -1;
        for ($i = 1; $i < count($stages); ++$i)
        {
            $previousStage = $stages[$i - 1];
            $currentStage = $stages[$i];
            if ($previousStage['count'] <= 0)
            {
                continue;
            }

            $conversionPercent = ((float) $currentStage['count'] / (float) $previousStage['count']) * 100.0;
            $conversions[] = array(
                'from' => $previousStage['label'],
                'to' => $currentStage['label'],
                'rate' => $conversionPercent,
                'rateLabel' => $this->formatPercentValue($conversionPercent)
            );

            if ($currentStage['count'] < $previousStage['count'])
            {
                $dropPercent = ((float) ($previousStage['count'] - $currentStage['count']) / (float) $previousStage['count']) * 100.0;
                if ($dropPercent > $maxDropPercent)
                {
                    $maxDropPercent = $dropPercent;
                    $biggestDropoff = array(
                        'from' => $previousStage['label'],
                        'to' => $currentStage['label'],
                        'dropPercent' => $dropPercent,
                        'dropLabel' => $this->formatPercentValue($dropPercent)
                    );
                }
            }
        }

        return array(
            'stages' => $stages,
            'conversions' => $conversions,
            'biggestDropoff' => $biggestDropoff
        );
    }

    private function getCustomerWeeklyActivity($db, $companyID)
    {
        $rows = $db->getAllAssoc(sprintf(
            "SELECT
                DATE_FORMAT(cjh.date, '%%x-W%%v') AS weekLabel,
                MIN(DATE(cjh.date)) AS weekStartDate,
                SUM(IF(cjh.status_to = %s, 1, 0)) AS submissionsCount,
                SUM(IF(cjh.status_to = %s, 1, 0)) AS interviewsCount,
                SUM(IF(cjh.status_to = %s, 1, 0)) AS offersCount,
                SUM(IF(cjh.status_to = %s, 1, 0)) AS hiresCount
            FROM
                candidate_joborder_status_history AS cjh
            INNER JOIN joborder AS jo
                ON jo.joborder_id = cjh.joborder_id
                AND jo.site_id = cjh.site_id
            WHERE
                cjh.site_id = %s
            AND
                jo.company_id = %s
            AND
                cjh.date >= DATE_SUB(CURDATE(), INTERVAL 56 DAY)
            AND
                cjh.date <= NOW()
            AND
                cjh.status_to IN (%s, %s, %s, %s)
            GROUP BY
                weekLabel
            ORDER BY
                weekStartDate ASC",
            $db->makeQueryInteger(PIPELINE_STATUS_PROPOSED_TO_CUSTOMER),
            $db->makeQueryInteger(PIPELINE_STATUS_CUSTOMER_INTERVIEW),
            $db->makeQueryInteger(PIPELINE_STATUS_OFFER_NEGOTIATION),
            $db->makeQueryInteger(PIPELINE_STATUS_HIRED),
            $db->makeQueryInteger($this->_siteID),
            $db->makeQueryInteger($companyID),
            $db->makeQueryInteger(PIPELINE_STATUS_PROPOSED_TO_CUSTOMER),
            $db->makeQueryInteger(PIPELINE_STATUS_CUSTOMER_INTERVIEW),
            $db->makeQueryInteger(PIPELINE_STATUS_OFFER_NEGOTIATION),
            $db->makeQueryInteger(PIPELINE_STATUS_HIRED)
        ));

        $maxValue = 0;
        $trendRows = array();
        foreach ($rows as $row)
        {
            $submissions = (int) $row['submissionsCount'];
            $interviews = (int) $row['interviewsCount'];
            $offers = (int) $row['offersCount'];
            $hires = (int) $row['hiresCount'];

            $maxValue = max($maxValue, $submissions, $interviews, $offers, $hires);
            $trendRows[] = array(
                'weekLabel' => $row['weekLabel'],
                'submissionsCount' => $submissions,
                'interviewsCount' => $interviews,
                'offersCount' => $offers,
                'hiresCount' => $hires
            );
        }

        if ($maxValue <= 0)
        {
            $maxValue = 1;
        }
        foreach ($trendRows as $index => $row)
        {
            $trendRows[$index]['submissionsWidth'] = (int) round(($row['submissionsCount'] / $maxValue) * 100);
            $trendRows[$index]['interviewsWidth'] = (int) round(($row['interviewsCount'] / $maxValue) * 100);
            $trendRows[$index]['offersWidth'] = (int) round(($row['offersCount'] / $maxValue) * 100);
            $trendRows[$index]['hiresWidth'] = (int) round(($row['hiresCount'] / $maxValue) * 100);
        }

        return array(
            'rows' => $trendRows,
            'maxValue' => $maxValue
        );
    }

    private function getCustomerSourceQuality($db, $companyID, $rangeStart, $rangeEnd)
    {
        $rows = $db->getAllAssoc(sprintf(
            "SELECT
                CASE
                    WHEN candidate.source IS NULL THEN 'N/A'
                    WHEN TRIM(candidate.source) = '' THEN 'N/A'
                    WHEN LOWER(TRIM(candidate.source)) = '(none)' THEN 'N/A'
                    ELSE candidate.source
                END AS source,
                COUNT(DISTINCT IF(cjh.status_to IN (%s, %s, %s, %s, %s, %s), CONCAT(cjh.candidate_id, '-', cjh.joborder_id), NULL)) AS interviewPathCount,
                COUNT(DISTINCT IF(cjh.status_to = %s, CONCAT(cjh.candidate_id, '-', cjh.joborder_id), NULL)) AS hireCount
            FROM
                candidate_joborder_status_history AS cjh
            INNER JOIN joborder AS jo
                ON jo.joborder_id = cjh.joborder_id
                AND jo.site_id = cjh.site_id
            INNER JOIN candidate
                ON candidate.candidate_id = cjh.candidate_id
                AND candidate.site_id = cjh.site_id
            WHERE
                cjh.site_id = %s
            AND
                jo.company_id = %s
            AND
                cjh.date >= %s
            AND
                cjh.date <= %s
            GROUP BY
                source
            HAVING
                interviewPathCount > 0
                OR hireCount > 0
            ORDER BY
                hireCount DESC,
                interviewPathCount DESC,
                source ASC
            LIMIT 8",
            $db->makeQueryInteger(PIPELINE_STATUS_CUSTOMER_INTERVIEW),
            $db->makeQueryInteger(PIPELINE_STATUS_CUSTOMER_APPROVED),
            $db->makeQueryInteger(PIPELINE_STATUS_AVEL_APPROVED),
            $db->makeQueryInteger(PIPELINE_STATUS_OFFER_NEGOTIATION),
            $db->makeQueryInteger(PIPELINE_STATUS_OFFER_ACCEPTED),
            $db->makeQueryInteger(PIPELINE_STATUS_HIRED),
            $db->makeQueryInteger(PIPELINE_STATUS_HIRED),
            $db->makeQueryInteger($this->_siteID),
            $db->makeQueryInteger($companyID),
            $db->makeQueryString($rangeStart->format('Y-m-d H:i:s')),
            $db->makeQueryString($rangeEnd->format('Y-m-d H:i:s'))
        ));

        $sourceQualityRows = array();
        foreach ($rows as $row)
        {
            $interviewCount = (int) $row['interviewPathCount'];
            $hireCount = (int) $row['hireCount'];
            $hireRate = null;
            if ($interviewCount > 0)
            {
                $hireRate = ((float) $hireCount / (float) $interviewCount) * 100.0;
            }

            $sourceQualityRows[] = array(
                'source' => $row['source'],
                'interviewPathCount' => $interviewCount,
                'hireCount' => $hireCount,
                'hireRate' => $hireRate,
                'hireRateLabel' => $this->formatPercentValue($hireRate)
            );
        }

        return $sourceQualityRows;
    }

    private function getCustomerRejectionReasons($db, $companyID, $rangeStart, $rangeEnd)
    {
        return $db->getAllAssoc(sprintf(
            "SELECT
                rejection_reason.label AS label,
                COUNT(*) AS rejectionCount
            FROM
                status_history_rejection_reason
            INNER JOIN rejection_reason
                ON rejection_reason.rejection_reason_id = status_history_rejection_reason.rejection_reason_id
            INNER JOIN candidate_joborder_status_history AS cjh
                ON cjh.candidate_joborder_status_history_id = status_history_rejection_reason.status_history_id
            INNER JOIN joborder AS jo
                ON jo.joborder_id = cjh.joborder_id
                AND jo.site_id = cjh.site_id
            WHERE
                cjh.site_id = %s
            AND
                jo.company_id = %s
            AND
                cjh.date >= %s
            AND
                cjh.date <= %s
            GROUP BY
                rejection_reason.label
            ORDER BY
                rejectionCount DESC,
                rejection_reason.label ASC
            LIMIT 5",
            $db->makeQueryInteger($this->_siteID),
            $db->makeQueryInteger($companyID),
            $db->makeQueryString($rangeStart->format('Y-m-d H:i:s')),
            $db->makeQueryString($rangeEnd->format('Y-m-d H:i:s'))
        ));
    }

    private function getCustomerUpcomingOutcomes($db, $companyID, $activityStatusIDs = array())
    {
        $activityStatusSQLValues = array();
        foreach ($activityStatusIDs as $statusID)
        {
            $statusID = (int) $statusID;
            if ($statusID > 0)
            {
                $activityStatusSQLValues[] = $db->makeQueryInteger($statusID);
            }
        }
        $activityStatusFilterSQL = '';
        if (!empty($activityStatusSQLValues))
        {
            $activityStatusFilterSQL = ' AND cjh.status_to IN (' . implode(', ', $activityStatusSQLValues) . ')';
        }

        $recentActivityRSRaw = $db->getAllAssoc(sprintf(
            "SELECT
                DATE_FORMAT(cjh.date, '%%m-%%d-%%y (%%h:%%i %%p)') AS activityDate,
                cjh.candidate_id AS candidateID,
                candidate.first_name AS firstName,
                candidate.last_name AS lastName,
                cjh.status_to AS statusToID,
                jo.joborder_id AS jobOrderID,
                jo.title AS jobOrderTitle
            FROM
                candidate_joborder_status_history AS cjh
            INNER JOIN joborder AS jo
                ON jo.joborder_id = cjh.joborder_id
                AND jo.site_id = cjh.site_id
            INNER JOIN candidate
                ON candidate.candidate_id = cjh.candidate_id
                AND candidate.site_id = cjh.site_id
            WHERE
                cjh.site_id = %s
            AND
                jo.company_id = %s
            %s
            AND
                cjh.date >= DATE_SUB(NOW(), INTERVAL 14 DAY)
            ORDER BY
                cjh.date DESC
            LIMIT 8",
            $db->makeQueryInteger($this->_siteID),
            $db->makeQueryInteger($companyID),
            $activityStatusFilterSQL
        ));

        $recentActivityCountRS = $db->getAssoc(sprintf(
            "SELECT
                COUNT(*) AS recentActivityCount
            FROM
                candidate_joborder_status_history AS cjh
            INNER JOIN joborder AS jo
                ON jo.joborder_id = cjh.joborder_id
                AND jo.site_id = cjh.site_id
            WHERE
                cjh.site_id = %s
            AND
                jo.company_id = %s
            %s
            AND
                cjh.date >= DATE_SUB(NOW(), INTERVAL 7 DAY)",
            $db->makeQueryInteger($this->_siteID),
            $db->makeQueryInteger($companyID),
            $activityStatusFilterSQL
        ));

        if (empty($recentActivityCountRS))
        {
            $recentActivityCountRS = array('recentActivityCount' => 0);
        }

        $pipelineOutcomeRS = $db->getAssoc(sprintf(
            "SELECT
                SUM(IF(cjo.status = %s, 1, 0)) AS pendingInterviewCount,
                SUM(IF(cjo.status IN (%s, %s), 1, 0)) AS pendingOfferCount,
                SUM(IF(cjo.status = %s AND cjo.date_modified < DATE_SUB(NOW(), INTERVAL 7 DAY), 1, 0)) AS overdueOfferCount
            FROM
                candidate_joborder AS cjo
            INNER JOIN joborder AS jo
                ON jo.joborder_id = cjo.joborder_id
                AND jo.site_id = cjo.site_id
            WHERE
                cjo.site_id = %s
            AND
                jo.company_id = %s
            AND
                jo.status IN %s
            AND
                cjo.is_active = 1",
            $db->makeQueryInteger(PIPELINE_STATUS_CUSTOMER_INTERVIEW),
            $db->makeQueryInteger(PIPELINE_STATUS_OFFER_NEGOTIATION),
            $db->makeQueryInteger(PIPELINE_STATUS_OFFER_ACCEPTED),
            $db->makeQueryInteger(PIPELINE_STATUS_OFFER_NEGOTIATION),
            $db->makeQueryInteger($this->_siteID),
            $db->makeQueryInteger($companyID),
            JobOrderStatuses::getOpenStatusSQL()
        ));

        if (empty($pipelineOutcomeRS))
        {
            $pipelineOutcomeRS = array(
                'pendingInterviewCount' => 0,
                'pendingOfferCount' => 0,
                'overdueOfferCount' => 0
            );
        }

        $recentPipelineActivityRS = array();
        foreach ($recentActivityRSRaw as $row)
        {
            $candidateName = trim($row['firstName'] . ' ' . $row['lastName']);
            if ($candidateName === '')
            {
                $candidateName = 'Candidate #' . (int) $row['candidateID'];
            }

            $toStatusID = (int) $row['statusToID'];
            $toStatusLabel = $this->getPipelineStatusLabel($toStatusID);

            $recentPipelineActivityRS[] = array(
                'activityDate' => $row['activityDate'],
                'candidateID' => (int) $row['candidateID'],
                'candidateName' => $candidateName,
                'stageToLabel' => $toStatusLabel,
                'stageToSlug' => $this->getPipelineStatusSlug($toStatusID),
                'jobOrderID' => (int) $row['jobOrderID'],
                'jobOrderTitle' => $row['jobOrderTitle']
            );
        }

        return array(
            'upcomingInterviewCount' => (int) $recentActivityCountRS['recentActivityCount'],
            'recentActivityCount' => (int) $recentActivityCountRS['recentActivityCount'],
            'pendingInterviewCount' => (int) $pipelineOutcomeRS['pendingInterviewCount'],
            'pendingOfferCount' => (int) $pipelineOutcomeRS['pendingOfferCount'],
            'overdueOfferCount' => (int) $pipelineOutcomeRS['overdueOfferCount'],
            'upcomingInterviewsRS' => $recentPipelineActivityRS,
            'recentPipelineActivityRS' => $recentPipelineActivityRS
        );
    }

    private function getPipelineStatusLabel($statusID)
    {
        $statusID = (int) $statusID;

        $labels = array(
            PIPELINE_STATUS_ALLOCATED => 'Allocated',
            PIPELINE_STATUS_DELIVERY_VALIDATED => 'Delivery Validated',
            PIPELINE_STATUS_PROPOSED_TO_CUSTOMER => 'Proposed to Customer',
            PIPELINE_STATUS_CUSTOMER_INTERVIEW => 'Customer Interview',
            PIPELINE_STATUS_CUSTOMER_APPROVED => 'Customer Approved',
            PIPELINE_STATUS_AVEL_APPROVED => 'Avel Approved',
            PIPELINE_STATUS_OFFER_NEGOTIATION => 'Offer Negotiation',
            PIPELINE_STATUS_OFFER_ACCEPTED => 'Offer Accepted',
            PIPELINE_STATUS_HIRED => 'Hired',
            PIPELINE_STATUS_REJECTED => 'Rejected'
        );

        if (isset($labels[$statusID]))
        {
            return $labels[$statusID];
        }

        if ($statusID <= 0)
        {
            return 'New';
        }

        return 'Status #' . $statusID;
    }

    private function getPipelineStatusSlug($statusID)
    {
        $statusID = (int) $statusID;

        $slugs = array(
            PIPELINE_STATUS_ALLOCATED => 'allocated',
            PIPELINE_STATUS_DELIVERY_VALIDATED => 'delivery-validated',
            PIPELINE_STATUS_PROPOSED_TO_CUSTOMER => 'proposed-to-customer',
            PIPELINE_STATUS_CUSTOMER_INTERVIEW => 'customer-interview',
            PIPELINE_STATUS_CUSTOMER_APPROVED => 'customer-approved',
            PIPELINE_STATUS_AVEL_APPROVED => 'avel-approved',
            PIPELINE_STATUS_OFFER_NEGOTIATION => 'offer-negotiation',
            PIPELINE_STATUS_OFFER_ACCEPTED => 'offer-accepted',
            PIPELINE_STATUS_HIRED => 'hired',
            PIPELINE_STATUS_REJECTED => 'rejected'
        );

        if (isset($slugs[$statusID]))
        {
            return $slugs[$statusID];
        }

        return 'unknown';
    }

    private function getMedianInteger($values)
    {
        if (empty($values))
        {
            return null;
        }

        sort($values, SORT_NUMERIC);
        $count = count($values);
        $middleIndex = (int) floor($count / 2);

        if (($count % 2) === 1)
        {
            return (int) $values[$middleIndex];
        }

        $leftValue = (int) $values[$middleIndex - 1];
        $rightValue = (int) $values[$middleIndex];
        return (int) round(($leftValue + $rightValue) / 2);
    }

    private function formatPercentValue($value)
    {
        if ($value === null)
        {
            return 'N/A';
        }

        $value = (float) $value;
        if ($value < 0)
        {
            $value = 0;
        }
        if ($value <= 0.0001)
        {
            return '0%';
        }

        if ($value >= 99.95)
        {
            return '100%';
        }

        if ($value >= 10)
        {
            return sprintf('%.0f%%', round($value));
        }

        return sprintf('%.1f%%', round($value, 1));
    }

    private function graphView()
    {
        if (isset($_GET['theImage']))
        {
            $this->_template->assign('theImage', $_GET['theImage']);
        }
        else
        {
            $this->_template->assign('theImage', '');
        }

        if (!eval(Hooks::get('REPORTS_GRAPH'))) return;

        $this->_template->assign('active', $this);
        $this->_template->display('./modules/reports/GraphView.tpl');
    }

    private function showSubmissionReport()
    {
        //FIXME: getTrimmedInput
        if (isset($_GET['period']) && !empty($_GET['period']))
        {
            $period = $_GET['period'];
        }
        else
        {
            $period = '';
        }


        switch ($period)
        {
            case 'yesterday':
                $period = TIME_PERIOD_YESTERDAY;
                $reportTitle = 'Yesterday\'s Hires';
                break;

            case 'thisWeek':
                $period = TIME_PERIOD_THISWEEK;
                $reportTitle = 'This Week\'s Hires';
                break;

            case 'lastWeek':
                $period = TIME_PERIOD_LASTWEEK;
                $reportTitle = 'Last Week\'s Hires';
                break;

            case 'thisMonth':
                $period = TIME_PERIOD_THISMONTH;
                $reportTitle = 'This Month\'s Hires';
                break;

            case 'lastMonth':
                $period = TIME_PERIOD_LASTMONTH;
                $reportTitle = 'Last Month\'s Hires';
                break;

            case 'thisYear':
                $period = TIME_PERIOD_THISYEAR;
                $reportTitle = 'This Year\'s Hires';
                break;

            case 'lastYear':
                $period = TIME_PERIOD_LASTYEAR;
                $reportTitle = 'Last Year\'s Hires';
                break;

            case 'toDate':
                $period = TIME_PERIOD_TODATE;
                $reportTitle = 'Total Hires';
                break;

            case 'today':
            default:
                $period = TIME_PERIOD_TODAY;
                $reportTitle = 'Today\'s Hires';
                break;
        }

        $statistics = new Statistics($this->_siteID);
        $submissionJobOrdersRS = $statistics->getSubmissionJobOrders($period);

        foreach ($submissionJobOrdersRS as $rowIndex => $submissionJobOrdersData)
        {
            /* Querys inside loops are bad, but I don't think there is any avoiding this. */
            $submissionJobOrdersRS[$rowIndex]['submissionsRS'] = $statistics->getSubmissionsByJobOrder(
                $period, $submissionJobOrdersData['jobOrderID'], $this->_siteID
            );
        }

        if (!eval(Hooks::get('REPORTS_SHOW_SUBMISSION'))) return;

        $this->_template->assign('reportTitle', $reportTitle);
        $this->_template->assign('submissionJobOrdersRS', $submissionJobOrdersRS);
        $this->_template->display('./modules/reports/SubmissionReport.tpl');
    }

    private function showHireReport()
    {
        //FIXME: getTrimmedInput
        if (isset($_GET['period']) && !empty($_GET['period']))
        {
            $period = $_GET['period'];
        }
        else
        {
            $period = '';
        }


        switch ($period)
        {
            case 'yesterday':
                $period = TIME_PERIOD_YESTERDAY;
                $reportTitle = 'Yesterday\'s Report';
                break;

            case 'thisWeek':
                $period = TIME_PERIOD_THISWEEK;
                $reportTitle = 'This Week\'s Report';
                break;

            case 'lastWeek':
                $period = TIME_PERIOD_LASTWEEK;
                $reportTitle = 'Last Week\'s Report';
                break;

            case 'thisMonth':
                $period = TIME_PERIOD_THISMONTH;
                $reportTitle = 'This Month\'s Report';
                break;

            case 'lastMonth':
                $period = TIME_PERIOD_LASTMONTH;
                $reportTitle = 'Last Month\'s Report';
                break;

            case 'thisYear':
                $period = TIME_PERIOD_THISYEAR;
                $reportTitle = 'This Year\'s Report';
                break;

            case 'lastYear':
                $period = TIME_PERIOD_LASTYEAR;
                $reportTitle = 'Last Year\'s Report';
                break;

            case 'toDate':
                $period = TIME_PERIOD_TODATE;
                $reportTitle = 'To Date Report';
                break;

            case 'today':
            default:
                $period = TIME_PERIOD_TODAY;
                $reportTitle = 'Today\'s Report';
                break;
        }

        $statistics = new Statistics($this->_siteID);
        $hiresJobOrdersRS = $statistics->getHiresJobOrders($period);

        foreach ($hiresJobOrdersRS as $rowIndex => $hiresJobOrdersData)
        {
            /* Querys inside loops are bad, but I don't think there is any avoiding this. */
            $hiresJobOrdersRS[$rowIndex]['hiresRS'] = $statistics->getHiresByJobOrder(
                $period, $hiresJobOrdersData['jobOrderID'], $this->_siteID
            );
        }

        if (!eval(Hooks::get('REPORTS_SHOW_SUBMISSION'))) return;

        $this->_template->assign('reportTitle', $reportTitle);
        $this->_template->assign('hiresJobOrdersRS', $hiresJobOrdersRS);
        $this->_template->display('./modules/reports/HiredReport.tpl');
    }

    private function customizeJobOrderReport()
    {
        /* Bail out if we don't have a valid candidate ID. */
        if (!$this->isRequiredIDValid('jobOrderID', $_GET))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid job order ID.');
        }

        $jobOrderID = $_GET['jobOrderID'];

        $siteName = $_SESSION['CATS']->getSiteName();


        $statistics = new Statistics($this->_siteID);
        $data = $statistics->getJobOrderReport($jobOrderID);

        /* Bail out if we got an empty result set. */
        if (empty($data))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'The specified job order ID could not be found.');
        }

        $reportParameters['siteName'] = $siteName;
        $reportParameters['companyName'] = $data['companyName'];
        $reportParameters['jobOrderName'] = $data['title'];
        $reportParameters['accountManager'] = $data['ownerFullName'];
        $reportParameters['recruiter'] = $data['recruiterFullName'];

        $reportParameters['periodLine'] = sprintf(
            '%s - %s',
            strtok($data['dateCreated'], ' '),
            DateUtility::getAdjustedDate('m-d-y')
        );

        $reportParameters['dataSet1'] = $data['pipeline'];
        $reportParameters['dataSet2'] = $data['submitted'];
        $reportParameters['dataSet3'] = $data['pipelineInterviewing'];
        $reportParameters['dataSet4'] = $data['pipelineHired'];

        $dataSet = array(
            $reportParameters['dataSet4'],
            $reportParameters['dataSet3'],
            $reportParameters['dataSet2'],
            $reportParameters['dataSet1']
        );

        $this->_template->assign('reportParameters', $reportParameters);
        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', '');
        $this->_template->display('./modules/reports/JobOrderReport.tpl');
    }

    private function customizeEEOReport()
    {
        $this->_template->assign('modePeriod', 'all');
        $this->_template->assign('modeStatus', 'all');
        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', '');
        $this->_template->display('./modules/reports/EEOReport.tpl');
    }

    private function generateJobOrderReportPDF()
    {
        /* E_STRICT doesn't like FPDF. */
        $errorReporting = error_reporting();
        error_reporting($errorReporting & ~ E_STRICT);
        include_once(LEGACY_ROOT . '/lib/fpdf/fpdf.php');
        error_reporting($errorReporting);

        // FIXME: Hook?
        $isASP = $_SESSION['CATS']->isASP();

        $unixName = $_SESSION['CATS']->getUnixName();

        $siteName       = $this->getTrimmedInput('siteName', $_GET);
        $companyName    = $this->getTrimmedInput('companyName', $_GET);
        $jobOrderName   = $this->getTrimmedInput('jobOrderName', $_GET);
        $periodLine     = $this->getTrimmedInput('periodLine', $_GET);
        $accountManager = $this->getTrimmedInput('accountManager', $_GET);
        $recruiter      = $this->getTrimmedInput('recruiter', $_GET);
        $notes          = $this->getTrimmedInput('notes', $_GET);

        if (isset($_GET['dataSet']))
        {
            $dataSet = $_GET['dataSet'];
            $dataSet = explode(',', $dataSet);
        }
        else
        {
            $dataSet = array(4, 3, 2, 1);
        }


        /* PDF Font Face. */
        // FIXME: Customizable.
        $fontFace = 'Arial';

        $pdf = new FPDF();
        $pdf->AddPage();

        if (!eval(Hooks::get('REPORTS_CUSTOMIZE_JO_REPORT_PRE'))) return;

        if ($isASP && $unixName == 'cognizo')
        {
            /* TODO: MAKE THIS CUSTOMIZABLE FOR EVERYONE. */
            $pdf->SetFont($fontFace, 'B', 10);
            $pdf->Image('images/cognizo-logo.jpg', 130, 10, 59, 20);
            $pdf->SetXY(129,27);
            $pdf->Write(5, 'Information Technology Consulting');
        }

        $pdf->SetXY(25, 35);
        $pdf->SetFont($fontFace, 'BU', 14);
        $pdf->Write(5, "Recruiting Summary Report\n");

        $pdf->SetFont($fontFace, '', 10);
        $pdf->SetX(25);
        $pdf->Write(5, DateUtility::getAdjustedDate('l, F d, Y') . "\n\n\n");

        $pdf->SetFont($fontFace, 'B', 10);
        $pdf->SetX(25);
        $pdf->Write(5, 'Company: '. $companyName . "\n");

        $pdf->SetFont($fontFace, '', 10);
        $pdf->SetX(25);
        $pdf->Write(5, 'Position: ' . $jobOrderName . "\n\n");

        $pdf->SetFont($fontFace, '', 10);
        $pdf->SetX(25);
        $pdf->Write(5, 'Period: ' . $periodLine . "\n\n");

        $pdf->SetFont($fontFace, '', 10);
        $pdf->SetX(25);
        $pdf->Write(5, 'Account Manager: ' . $accountManager . "\n");

        $pdf->SetFont($fontFace, '', 10);
        $pdf->SetX(25);
        $pdf->Write(5, 'Recruiter: ' . $recruiter . "\n");

        /* Note that the server is not logged in when getting this file from
         * itself.
         */
        // FIXME: Pass session cookie in URL? Use cURL and send a cookie? I
        //        really don't like this... There has to be a way.
        // FIXME: "could not make seekable" - http://demo.catsone.net/index.php?m=graphs&a=jobOrderReportGraph&data=%2C%2C%2C
        //        in /usr/local/www/catsone.net/data/lib/fpdf/fpdf.php on line 1500
        $URI = CATSUtility::getAbsoluteURI(
            CATSUtility::getIndexName()
            . '?m=graphs&a=jobOrderReportGraph&data='
            . urlencode(implode(',', $dataSet))
        );

        $pdf->Image($URI, 70, 95, 80, 80, 'jpg');

        $pdf->SetXY(25,180);
        $pdf->SetFont($fontFace, '', 10);
        $pdf->Write(5, 'Total Candidates ');
        $pdf->SetTextColor(255, 0, 0);
        $pdf->Write(5, 'in Pipeline');
        $pdf->SetTextColor(0, 0, 0);
        $pdf->Write(5, ' by ' . $siteName . ": \n\n");

        $pdf->SetX(25);
        $pdf->SetFont($fontFace, '', 10);
        $pdf->Write(5, 'Total Candidates ');
        $pdf->SetTextColor(0, 125, 0);
        $pdf->Write(5, 'Proposed to Customer');
        $pdf->SetTextColor(0, 0, 0);
        $pdf->Write(5, ' to ' . $companyName . ": \n\n");

        $pdf->SetX(25);
        $pdf->SetFont($fontFace, '', 10);
        $pdf->Write(5, 'Total Candidates ');
        $pdf->SetTextColor(0, 0, 255);
        $pdf->Write(5, 'Customer Interview');
        $pdf->SetTextColor(0, 0, 0);
        $pdf->Write(5, ' by ' . $companyName . ": \n\n");

        $pdf->SetX(25);
        $pdf->SetFont($fontFace, '', 10);
        $pdf->Write(5, 'Total Candidates ');
        $pdf->SetTextColor(255, 75, 0);
        $pdf->Write(5, 'Hired');
        $pdf->SetTextColor(0, 0, 0);
        $pdf->Write(5, ' at ' . $companyName . ": \n\n\n");

        if ($notes != '')
        {
            $pdf->SetX(25);
            $pdf->SetFont($fontFace, '', 10);
            $pdf->Write(5, "Notes:\n");

            $len = strlen($notes);
            $maxChars = 70;

            $pdf->SetLeftMargin(25);
            $pdf->SetRightMargin(25);
            $pdf->SetX(25);
            $pdf->Write(5, $notes . "\n");
        }

        $pdf->SetXY(165, 180);
        $pdf->SetFont($fontFace, 'B', 10);
        $pdf->Write(5, $dataSet[0] . "\n\n");
        $pdf->SetX(165);
        $pdf->Write(5, $dataSet[1] . "\n\n");
        $pdf->SetX(165);
        $pdf->Write(5, $dataSet[2] . "\n\n");
        $pdf->SetX(165);
        $pdf->Write(5, $dataSet[3] . "\n\n");

        $pdf->Rect(3, 6, 204, 285);

        if (!eval(Hooks::get('REPORTS_CUSTOMIZE_JO_REPORT_POST'))) return;

        $pdf->Output();
        die();
    }

    function generateEEOReportPreview()
    {
        $modePeriod = $this->getTrimmedInput('period', $_GET);
        $modeStatus = $this->getTrimmedInput('status', $_GET);

        $statistics = new Statistics($this->_siteID);
        $EEOReportStatistics = $statistics->getEEOReport($modePeriod, $modeStatus);

        //print_r($EEOReportStatistics);

        switch ($modePeriod)
        {
            case 'week':
                $labelPeriod = ' Last Week';
                break;

            case 'month':
                $labelPeriod = ' Last Month';
                break;

            default:
                $labelPeriod = '';
                break;
        }

        switch ($modeStatus)
        {
            case 'rejected':
                $labelStatus = ' Rejected';
                break;

            case 'placed':
                $labelStatus = ' Hired';
                break;

            default:
                $labelStatus = '';
                break;
        }

        /* Produce the URL to the ethic statistics graph. */
        $labels = array();
        $data = array();

        $rsEthnicStatistics = $EEOReportStatistics['rsEthnicStatistics'];

        foreach ($rsEthnicStatistics as $index => $line)
        {
            $labels[] = $line['EEOEthnicType'];
            $data[] = $line['numberOfCandidates'];
        }

        $urlEthnicGraph = CATSUtility::getAbsoluteURI(
            sprintf("%s?m=graphs&a=generic&title=%s&labels=%s&data=%s&width=%s&height=%s",
                CATSUtility::getIndexName(),
                urlencode('Number of Candidates'.$labelStatus.' by Ethnic Type'.$labelPeriod),
                urlencode(implode(',', $labels)),
                urlencode(implode(',', $data)),
                400,
                240
            ));


        /* Produce the URL to the veteran status statistics graph. */
        $labels = array();
        $data = array();

        $rsVeteranStatistics = $EEOReportStatistics['rsVeteranStatistics'];

        foreach ($rsVeteranStatistics as $index => $line)
        {
            $labels[] = $line['EEOVeteranType'];
            $data[] = $line['numberOfCandidates'];
        }

        $urlVeteranGraph = CATSUtility::getAbsoluteURI(
            sprintf("%s?m=graphs&a=generic&title=%s&labels=%s&data=%s&width=%s&height=%s",
                CATSUtility::getIndexName(),
                urlencode('Number of Candidates'.$labelStatus.' by Veteran Status'.$labelPeriod),
                urlencode(implode(',', $labels)),
                urlencode(implode(',', $data)),
                400,
                240
            ));

        /* Produce the URL to the gender statistics graph. */
        $labels = array();
        $data = array();

        $rsGenderStatistics = $EEOReportStatistics['rsGenderStatistics'];

        $labels[] = 'Male ('.$rsGenderStatistics['numberOfCandidatesMale'].')';
        $data[] = $rsGenderStatistics['numberOfCandidatesMale'];

        $labels[] = 'Female ('.$rsGenderStatistics['numberOfCandidatesFemale'].')';
        $data[] = $rsGenderStatistics['numberOfCandidatesFemale'];

        $urlGenderGraph = CATSUtility::getAbsoluteURI(
            sprintf("%s?m=graphs&a=genericPie&title=%s&labels=%s&data=%s&width=%s&height=%s&legendOffset=%s",
                CATSUtility::getIndexName(),
                urlencode('Number of Candidates by Gender'),
                urlencode(implode(',', $labels)),
                urlencode(implode(',', $data)),
                320,
                300,
                1.575
            ));

        if ($rsGenderStatistics['numberOfCandidatesMale'] == 0 && $rsGenderStatistics['numberOfCandidatesFemale'] == 0)
        {
            $urlGenderGraph = "images/noDataByGender.png";
        }

        /* Produce the URL to the disability statistics graph. */
        $labels = array();
        $data = array();

        $rsDisabledStatistics = $EEOReportStatistics['rsDisabledStatistics'];

        $labels[] = 'Disabled ('.$rsDisabledStatistics['numberOfCandidatesDisabled'].')';
        $data[] = $rsDisabledStatistics['numberOfCandidatesDisabled'];

        $labels[] = 'Non Disabled ('.$rsDisabledStatistics['numberOfCandidatesNonDisabled'].')';
        $data[] = $rsDisabledStatistics['numberOfCandidatesNonDisabled'];

        $urlDisabilityGraph = CATSUtility::getAbsoluteURI(
            sprintf("%s?m=graphs&a=genericPie&title=%s&labels=%s&data=%s&width=%s&height=%s&legendOffset=%s",
                CATSUtility::getIndexName(),
                urlencode('Number of Candidates by Disability Status'),
                urlencode(implode(',', $labels)),
                urlencode(implode(',', $data)),
                320,
                300,
                1.575
            ));

        if ($rsDisabledStatistics['numberOfCandidatesNonDisabled'] == 0 && $rsDisabledStatistics['numberOfCandidatesDisabled'] == 0)
        {
            $urlDisabilityGraph = "images/noDataByDisability.png";
        }

        $EEOSettings = new EEOSettings($this->_siteID);
        $EEOSettingsRS = $EEOSettings->getAll();

        $this->_template->assign('EEOReportStatistics', $EEOReportStatistics);
        $this->_template->assign('urlEthnicGraph', $urlEthnicGraph);
        $this->_template->assign('urlVeteranGraph', $urlVeteranGraph);
        $this->_template->assign('urlGenderGraph', $urlGenderGraph);
        $this->_template->assign('urlDisabilityGraph', $urlDisabilityGraph);
        $this->_template->assign('modePeriod', $modePeriod);
        $this->_template->assign('modeStatus', $modeStatus);
        $this->_template->assign('EEOSettingsRS', $EEOSettingsRS);
        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', '');
        $this->_template->display('./modules/reports/EEOReport.tpl');
    }
}

?>
