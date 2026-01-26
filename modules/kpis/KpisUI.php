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
    const EXPECTED_CONVERSION_FIELD = 'Expected Conversion';

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
                'totalOpenPositions' => 0,
                'fullPlanOpenings' => 0,
                'expectedFilled' => 0.0,
                'expectedInFullPlan' => 0.0,
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

        foreach ($jobOrders as $jobOrder)
        {
            $companyID = $jobOrder['companyID'];
            if (!isset($companyData[$companyID]))
            {
                $companyData[$companyID] = array(
                    'companyID' => $companyID,
                    'companyName' => '(Unknown)',
                    'expectedConversionMin' => null,
                    'expectedConversionMax' => null,
                    'newPositions' => 0,
                    'totalOpenPositions' => 0,
                    'fullPlanOpenings' => 0,
                    'expectedFilled' => 0.0,
                    'expectedInFullPlan' => 0.0,
                    'hasData' => false
                );
            }

            $companyData[$companyID]['hasData'] = true;

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
            $expiredOpenings = 0;
            $fullPlanOpenings = 0;

            foreach ($plans as $plan)
            {
                $startDate = $this->parsePlanDate($plan['startDate']);
                $endDate = $this->parsePlanDate($plan['endDate']);
                $openings = (int) $plan['openings'];

                $fullPlanOpenings += $openings;

                if ($this->isPlanActive($startDate, $endDate, $today))
                {
                    $activeOpenings += $openings;
                }
                else if ($this->isPlanExpired($endDate, $today))
                {
                    $expiredOpenings += $openings;
                }
            }

            $openPositions = $activeOpenings + $expiredOpenings;
            $openingsAvailable = $jobOrder['openingsAvailable'];
            if ($openingsAvailable < 0)
            {
                $openingsAvailable = 0;
            }
            if ($openPositions > $openingsAvailable)
            {
                $openPositions = $openingsAvailable;
            }

            $jobCreated = $this->parseDateTime($jobOrder['dateCreated']);
            if ($jobCreated !== null && $jobCreated >= $weekStart && $jobCreated <= $weekEnd)
            {
                $companyData[$companyID]['newPositions'] += $activeOpenings;
            }

            $companyData[$companyID]['totalOpenPositions'] += $openPositions;
            $companyData[$companyID]['fullPlanOpenings'] += $fullPlanOpenings;
            $companyData[$companyID]['expectedFilled'] += ($openPositions * ($conversion / 100));
        }

        $rows = array();
        $totals = array(
            'newPositions' => 0,
            'totalOpenPositions' => 0,
            'expectedFilled' => 0,
            'expectedInFullPlan' => 0
        );

        foreach ($companyData as $company)
        {
            if (!$company['hasData'])
            {
                continue;
            }

            $expectedFilled = (int) round($company['expectedFilled']);
            $expectedInFullPlan = (int) $company['fullPlanOpenings'];
            $conversionRange = $this->formatPercentRange(
                $company['expectedConversionMin'],
                $company['expectedConversionMax']
            );

            $rows[] = array(
                'companyID' => $company['companyID'],
                'companyName' => $company['companyName'],
                'newPositions' => $company['newPositions'],
                'totalOpenPositions' => $company['totalOpenPositions'],
                'expectedConversionDisplay' => $conversionRange,
                'expectedFilled' => $expectedFilled,
                'expectedInFullPlan' => $expectedInFullPlan
            );

            $totals['newPositions'] += $company['newPositions'];
            $totals['totalOpenPositions'] += $company['totalOpenPositions'];
            $totals['expectedFilled'] += $expectedFilled;
            $totals['expectedInFullPlan'] += $expectedInFullPlan;
        }

        $weekLabel = $this->formatDateLabel($weekStart) . ' - ' . $this->formatDateLabel($weekEnd);

        $this->_template->assign('active', $this);
        $this->_template->assign('kpiRows', $rows);
        $this->_template->assign('totals', $totals);
        $this->_template->assign('weekLabel', $weekLabel);
        $this->_template->assign('expectedConversionFieldName', self::EXPECTED_CONVERSION_FIELD);
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

    private function formatDateLabel(DateTime $date)
    {
        if ($_SESSION['CATS']->isDateDMY())
        {
            return $date->format('d-m-y');
        }

        return $date->format('m-d-y');
    }
}

?>
