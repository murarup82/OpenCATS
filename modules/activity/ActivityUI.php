<?php
/*
 * CATS
 * Recent Activites module
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
 */

include_once(LEGACY_ROOT . '/lib/ActivityEntries.php');
include_once(LEGACY_ROOT . '/lib/StringUtility.php');
include_once(LEGACY_ROOT . '/lib/Contacts.php');
include_once(LEGACY_ROOT . '/lib/Candidates.php');
include_once(LEGACY_ROOT . '/lib/DateUtility.php');
include_once(LEGACY_ROOT . '/lib/InfoString.php');


class ActivityUI extends UserInterface
{
    /* Maximum number of characters of a line in the regarding field to show
     * on the main listing.
     */
    const TRUNCATE_REGARDING = 24;

    /* Maximum number of characters to display of an activity note. */
    const ACTIVITY_NOTE_MAXLEN = 140;


    public function __construct()
    {
        parent::__construct();

        $this->_authenticationRequired = true;
        $this->_moduleDirectory = 'activity';
        $this->_moduleName = 'activity';
        $this->_moduleTabText = 'Activities';
    }

    public function handleRequest()
    {
        $action = $this->getAction();

        if (!eval(Hooks::get('ACTIVITY_HANDLE_REQUEST'))) return;

        switch ($action)
        {
            case 'viewByDate':
                if ($this->isGetBack())
                {
                    $this->onSearch();
                }
                else
                {
                    $this->Search();
                }

                break;

            case 'listByViewDataGrid':
            default:
                $this->listByViewDataGrid();
                break;
        }
    }

    /*
     * Called by handleRequest() to process loading the list / main page.
     */
    private function listByViewDataGrid()
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));
        $isModernJSON = ($responseFormat === 'modern-json');

        if ($isModernJSON)
        {
            if ($modernPage !== '' && $modernPage !== 'activity-list')
            {
                if (!headers_sent())
                {
                    header('HTTP/1.1 400 Bad Request');
                    header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                }
                echo json_encode(array(
                    'error' => true,
                    'message' => 'Unsupported modern page contract.',
                    'requestedPage' => $modernPage
                ));
                return;
            }

            $this->renderModernActivityListJSON('activity-list');
            return;
        }

        $dataGridProperties = DataGrid::getRecentParamaters("activity:ActivityDataGrid");

        /* If this is the first time we visited the datagrid this session, the recent paramaters will
         * be empty.  Fill in some default values. */
        if ($dataGridProperties == array())
        {
            $dataGridProperties = array(
                'rangeStart'    => 0,
                'maxResults'    => 15,
                'filterVisible' => false
            );
        }

        /* Only show a month of activities. */
        $dataGridProperties['startDate'] = '';
        $dataGridProperties['endDate'] = '';
        $dataGridProperties['period'] = 'DATE_SUB(CURDATE(), INTERVAL 1 MONTH)';

        $dataGrid = DataGrid::get("activity:ActivityDataGrid", $dataGridProperties);

        $quickLinks = $this->getQuickLinks();

        if (!eval(Hooks::get('ACTIVITY_LIST_BY_VIEW_DG'))) return;

        $this->_template->assign('quickLinks', $quickLinks);
        $this->_template->assign('active', $this);
        $this->_template->assign('dataGrid', $dataGrid);
        $this->_template->assign('userID', $_SESSION['CATS']->getUserID());

        $activityEntries = new ActivityEntries($this->_siteID);
        $this->_template->assign('numActivities', $activityEntries->getCount());

        $this->_template->display('./modules/activity/ActivityDataGrid.tpl');
    }

    /*
     * Called by handleRequest() to handle displaying the search page.
     */
    private function search()
    {
        if (!eval(Hooks::get('ACTIVITY_SEARCH'))) return;

        $this->_template->assign('isResultsMode', false);
        $this->_template->assign('wildCardString', '');
        $this->_template->assign('active', $this);
        $this->_template->display('./modules/activity/Search.tpl');
    }

    /*
     * Called by handleRequest() to process displaying the search results.
     */
    private function onSearch()
    {
        $periodString = $this->getTrimmedInput('period', $_GET);
        if (!empty($periodString) &&
            in_array($periodString, array('lastweek', 'lastmonth', 'lastsixmonths', 'lastyear', 'all')))
        {
            /* formats start and end date for searching */
            switch ($periodString)
            {
                case 'lastweek':
                    $period = 'DATE_SUB(CURDATE(), INTERVAL 1 WEEK)';
                    break;

                case 'lastmonth':
                    $period = 'DATE_SUB(CURDATE(), INTERVAL 1 MONTH)';
                    break;

                case 'lastsixmonths':
                    $period = 'DATE_SUB(CURDATE(), INTERVAL 6 MONTH)';
                    break;

                case 'lastyear':
                    $period = 'DATE_SUB(CURDATE(), INTERVAL 1 YEAR)';
                    break;

                case 'all':
                default:
                    $period = '';
                    break;
            }

            $startDate = '';
            $endDate = '';

            $startDateURLString = '';
            $endDateURLString   = '';
        }
        else
        {
            /* Do we have a valid starting date? */
            if (!$this->isRequiredIDValid('startDay', $_GET) ||
                !$this->isRequiredIDValid('startMonth', $_GET) ||
                !$this->isRequiredIDValid('startYear', $_GET))
            {
                CommonErrors::fatal(COMMONERROR_BADFIELDS, $this, 'Invalid starting date.');
            }

            /* Do we have a valid ending date? */
            if (!$this->isRequiredIDValid('endDay', $_GET) ||
                !$this->isRequiredIDValid('endMonth', $_GET) ||
                !$this->isRequiredIDValid('endYear', $_GET))
            {
                CommonErrors::fatal(COMMONERROR_BADFIELDS, $this, 'Invalid ending date.');
            }

            if (!checkdate($_GET['startMonth'], $_GET['startDay'], $_GET['startYear']))
            {
                CommonErrors::fatal(COMMONERROR_BADFIELDS, $this, 'Invalid starting date.');
            }

            if (!checkdate($_GET['endMonth'], $_GET['endDay'], $_GET['endYear']))
            {
                CommonErrors::fatal(COMMONERROR_BADFIELDS, $this, 'Invalid ending date.');
            }

            /* formats start and end date for searching */
            $startDate = DateUtility::formatSearchDate(
                $_GET['startMonth'], $_GET['startDay'], $_GET['startYear']
            );
            $endDate = DateUtility::formatSearchDate(
                $_GET['endMonth'], $_GET['endDay']+1, $_GET['endYear']
            );

            $startDateURLString = sprintf(
                '&amp;startMonth=%s&amp;startDay=%s&amp;startYear=%s',
                $_GET['startMonth'],
                $_GET['startDay'],
                $_GET['startYear']
            );

            $endDateURLString = sprintf(
                '&amp;endMonth=%s&amp;endDay=%s&amp;endYear=%s',
                $_GET['endMonth'],
                $_GET['endDay'],
                $_GET['endYear']
            );

            $period = '';
        }

        $baseURL = sprintf(
            'm=activity&amp;a=viewByDate&amp;getback=getback%s%s',
            $startDateURLString, $endDateURLString
        );

        $dataGridProperties = DataGrid::getRecentParamaters("activity:ActivityDataGrid");

        /* If this is the first time we visited the datagrid this session, the recent paramaters will
         * be empty.  Fill in some default values. */
        if ($dataGridProperties == array())
        {
            $dataGridProperties = array(
                'rangeStart'    => 0,
                'maxResults'    => 15,
                'filterVisible' => false
            );
        }

        $dataGridProperties['startDate'] = $startDate;
        $dataGridProperties['endDate']   = $endDate;
        $dataGridProperties['period']    = $period;

        $dataGrid = DataGrid::get("activity:ActivityDataGrid", $dataGridProperties);

        $quickLinks = $this->getQuickLinks();

        if (!eval(Hooks::get('ACTIVITY_LIST_BY_VIEW_DG'))) return;

        $this->_template->assign('quickLinks', $quickLinks);
        $this->_template->assign('active', $this);
        $this->_template->assign('dataGrid', $dataGrid);
        $this->_template->assign('userID', $_SESSION['CATS']->getUserID());
        
        $activityEntries = new ActivityEntries($this->_siteID);
        $this->_template->assign('numActivities', $activityEntries->getCount());

        $this->_template->display('./modules/activity/ActivityDataGrid.tpl');
    }

    private function renderModernActivityListJSON($modernPage)
    {
        $db = DatabaseConnection::getInstance();
        $baseURL = CATSUtility::getIndexName();
        $siteID = (int) $this->_siteID;

        $allowedRowsPerPage = array(15, 30, 50, 100);
        $entriesPerPage = (int) $this->getTrimmedInput('maxResults', $_GET);
        if (!in_array($entriesPerPage, $allowedRowsPerPage, true))
        {
            $entriesPerPage = 15;
        }

        $page = (int) $this->getTrimmedInput('page', $_GET);
        if ($page <= 0)
        {
            $page = 1;
        }
        $offset = ($page - 1) * $entriesPerPage;

        $quickSearch = trim($this->getTrimmedInput('wildCardString', $_GET));
        $dataItemTypeFilter = strtolower(trim($this->getTrimmedInput('dataItemType', $_GET)));
        if ($dataItemTypeFilter !== 'candidate' && $dataItemTypeFilter !== 'contact')
        {
            $dataItemTypeFilter = 'all';
        }

        $activityTypeID = (int) $this->getTrimmedInput('activityTypeID', $_GET);
        if ($activityTypeID < 0)
        {
            $activityTypeID = 0;
        }

        $resolvedPeriod = '';
        $resolvedStartDate = '';
        $resolvedEndDate = '';
        $dateCriterion = $this->buildModernActivityDateCriterion(
            $db,
            $resolvedPeriod,
            $resolvedStartDate,
            $resolvedEndDate
        );

        $sortMap = array(
            'dateCreated' => 'activity.date_created',
            'firstName' => 'firstNameSort',
            'lastName' => 'lastNameSort',
            'regarding' => 'regardingSort',
            'activityType' => 'activity_type.short_description',
            'enteredBy' => 'enteredBySort'
        );
        $sortBy = $this->getTrimmedInput('sortBy', $_GET);
        if (!isset($sortMap[$sortBy]))
        {
            $sortBy = 'dateCreated';
        }
        $sortDirection = strtoupper(trim($this->getTrimmedInput('sortDirection', $_GET)));
        if ($sortDirection !== 'ASC' && $sortDirection !== 'DESC')
        {
            $sortDirection = 'DESC';
        }

        $whereConditions = array(
            'activity.site_id = ' . $db->makeQueryInteger($siteID),
            sprintf(
                'activity.data_item_type IN (%s, %s)',
                $db->makeQueryInteger(DATA_ITEM_CANDIDATE),
                $db->makeQueryInteger(DATA_ITEM_CONTACT)
            )
        );

        if ($dateCriterion !== '')
        {
            $whereConditions[] = $dateCriterion;
        }

        if ($dataItemTypeFilter === 'candidate')
        {
            $whereConditions[] = 'activity.data_item_type = ' . $db->makeQueryInteger(DATA_ITEM_CANDIDATE);
        }
        else if ($dataItemTypeFilter === 'contact')
        {
            $whereConditions[] = 'activity.data_item_type = ' . $db->makeQueryInteger(DATA_ITEM_CONTACT);
        }

        if ($activityTypeID > 0)
        {
            $whereConditions[] = 'activity.type = ' . $db->makeQueryInteger($activityTypeID);
        }

        if ($quickSearch !== '')
        {
            $quickSearchEscaped = str_replace(
                array('\\', '%', '_'),
                array('\\\\', '\\%', '\\_'),
                $quickSearch
            );
            $quickSearchLike = '%' . $quickSearchEscaped . '%';

            $whereConditions[] = sprintf(
                "(candidate.first_name LIKE %s ESCAPE '\\\\'
                OR candidate.last_name LIKE %s ESCAPE '\\\\'
                OR contact.first_name LIKE %s ESCAPE '\\\\'
                OR contact.last_name LIKE %s ESCAPE '\\\\'
                OR joborder.title LIKE %s ESCAPE '\\\\'
                OR company.name LIKE %s ESCAPE '\\\\'
                OR activity.notes LIKE %s ESCAPE '\\\\'
                OR activity_type.short_description LIKE %s ESCAPE '\\\\')",
                $db->makeQueryString($quickSearchLike),
                $db->makeQueryString($quickSearchLike),
                $db->makeQueryString($quickSearchLike),
                $db->makeQueryString($quickSearchLike),
                $db->makeQueryString($quickSearchLike),
                $db->makeQueryString($quickSearchLike),
                $db->makeQueryString($quickSearchLike),
                $db->makeQueryString($quickSearchLike)
            );
        }

        $whereSQL = implode(' AND ', $whereConditions);
        $orderSQL = sprintf(
            '%s %s, activity.date_created DESC',
            $sortMap[$sortBy],
            $sortDirection
        );

        $sql = sprintf(
            "SELECT SQL_CALC_FOUND_ROWS
                activity.activity_id AS activityID,
                activity.data_item_id AS dataItemID,
                activity.data_item_type AS dataItemType,
                activity.joborder_id AS jobOrderID,
                activity.notes AS notes,
                DATE_FORMAT(activity.date_created, '%%m-%%d-%%y (%%h:%%i %%p)') AS dateCreated,
                activity.date_created AS dateCreatedSort,
                activity_type.short_description AS typeDescription,
                COALESCE(entered_by_user.first_name, '') AS enteredByFirstName,
                COALESCE(entered_by_user.last_name, '') AS enteredByLastName,
                CONCAT(COALESCE(entered_by_user.first_name, ''), ' ', COALESCE(entered_by_user.last_name, '')) AS enteredByFullName,
                CONCAT(COALESCE(entered_by_user.last_name, ''), COALESCE(entered_by_user.first_name, '')) AS enteredBySort,
                CASE
                    WHEN activity.data_item_type = %s THEN COALESCE(candidate.first_name, '')
                    ELSE COALESCE(contact.first_name, '')
                END AS firstName,
                CASE
                    WHEN activity.data_item_type = %s THEN COALESCE(candidate.last_name, '')
                    ELSE COALESCE(contact.last_name, '')
                END AS lastName,
                CASE
                    WHEN activity.data_item_type = %s THEN COALESCE(candidate.is_hot, 0)
                    ELSE COALESCE(contact.is_hot, 0)
                END AS isHot,
                CASE
                    WHEN activity.data_item_type = %s THEN 'candidate'
                    ELSE 'contact'
                END AS dataItemTypeKey,
                CASE
                    WHEN joborder.joborder_id IS NULL THEN 'General'
                    ELSE CONCAT(joborder.title, ' (', COALESCE(company.name, ''), ')')
                END AS regarding,
                CASE
                    WHEN joborder.joborder_id IS NULL THEN 'General'
                    ELSE CONCAT(COALESCE(joborder.title, ''), COALESCE(company.name, ''))
                END AS regardingSort,
                COALESCE(joborder.title, '') AS jobOrderTitle,
                COALESCE(company.name, '') AS companyName,
                company.company_id AS companyID,
                CONCAT(
                    CASE
                        WHEN activity.data_item_type = %s THEN COALESCE(candidate.last_name, '')
                        ELSE COALESCE(contact.last_name, '')
                    END,
                    CASE
                        WHEN activity.data_item_type = %s THEN COALESCE(candidate.first_name, '')
                        ELSE COALESCE(contact.first_name, '')
                    END
                ) AS nameSort,
                CASE
                    WHEN activity.data_item_type = %s THEN COALESCE(candidate.first_name, '')
                    ELSE COALESCE(contact.first_name, '')
                END AS firstNameSort,
                CASE
                    WHEN activity.data_item_type = %s THEN COALESCE(candidate.last_name, '')
                    ELSE COALESCE(contact.last_name, '')
                END AS lastNameSort
            FROM
                activity
            LEFT JOIN activity_type
                ON activity.type = activity_type.activity_type_id
            LEFT JOIN user AS entered_by_user
                ON activity.entered_by = entered_by_user.user_id
            LEFT JOIN joborder
                ON activity.joborder_id = joborder.joborder_id
                AND joborder.site_id = activity.site_id
            LEFT JOIN company
                ON joborder.company_id = company.company_id
                AND company.site_id = activity.site_id
            LEFT JOIN candidate
                ON activity.data_item_type = %s
                AND activity.data_item_id = candidate.candidate_id
                AND candidate.site_id = activity.site_id
            LEFT JOIN contact
                ON activity.data_item_type = %s
                AND activity.data_item_id = contact.contact_id
                AND contact.site_id = activity.site_id
            WHERE
                %s
            ORDER BY
                %s
            LIMIT
                %s, %s",
            $db->makeQueryInteger(DATA_ITEM_CANDIDATE),
            $db->makeQueryInteger(DATA_ITEM_CANDIDATE),
            $db->makeQueryInteger(DATA_ITEM_CANDIDATE),
            $db->makeQueryInteger(DATA_ITEM_CANDIDATE),
            $db->makeQueryInteger(DATA_ITEM_CANDIDATE),
            $db->makeQueryInteger(DATA_ITEM_CANDIDATE),
            $db->makeQueryInteger(DATA_ITEM_CANDIDATE),
            $db->makeQueryInteger(DATA_ITEM_CANDIDATE),
            $db->makeQueryInteger(DATA_ITEM_CANDIDATE),
            $db->makeQueryInteger(DATA_ITEM_CONTACT),
            $whereSQL,
            $orderSQL,
            $db->makeQueryInteger($offset),
            $db->makeQueryInteger($entriesPerPage)
        );

        $rows = $db->getAllAssoc($sql);
        $totalRows = (int) $db->getColumn('SELECT FOUND_ROWS()', 0, 0);

        $totalPages = 1;
        if ($entriesPerPage > 0)
        {
            $totalPages = (int) ceil($totalRows / $entriesPerPage);
            if ($totalPages <= 0)
            {
                $totalPages = 1;
            }
        }

        $activityTypeOptions = array();
        $activityTypesRS = $db->getAllAssoc(
            "SELECT
                activity_type_id AS activityTypeID,
                short_description AS shortDescription
            FROM
                activity_type
            ORDER BY
                short_description ASC"
        );
        foreach ($activityTypesRS as $activityTypeRow)
        {
            $activityTypeOptions[] = array(
                'activityTypeID' => (int) (isset($activityTypeRow['activityTypeID']) ? $activityTypeRow['activityTypeID'] : 0),
                'label' => (isset($activityTypeRow['shortDescription']) ? (string) $activityTypeRow['shortDescription'] : '')
            );
        }

        $responseRows = array();
        foreach ($rows as $row)
        {
            $activityID = (int) (isset($row['activityID']) ? $row['activityID'] : 0);
            $dataItemID = (int) (isset($row['dataItemID']) ? $row['dataItemID'] : 0);
            $jobOrderID = (int) (isset($row['jobOrderID']) ? $row['jobOrderID'] : 0);
            $companyID = (int) (isset($row['companyID']) ? $row['companyID'] : 0);
            $dataItemType = (int) (isset($row['dataItemType']) ? $row['dataItemType'] : 0);
            $dataItemTypeKey = (isset($row['dataItemTypeKey']) ? (string) $row['dataItemTypeKey'] : 'contact');
            if ($dataItemTypeKey !== 'candidate' && $dataItemTypeKey !== 'contact')
            {
                $dataItemTypeKey = ($dataItemType === DATA_ITEM_CANDIDATE ? 'candidate' : 'contact');
            }

            $firstName = (isset($row['firstName']) ? (string) $row['firstName'] : '');
            $lastName = (isset($row['lastName']) ? (string) $row['lastName'] : '');
            $fullName = trim($firstName . ' ' . $lastName);
            if ($fullName === '')
            {
                $fullName = ucfirst($dataItemTypeKey) . ' #' . $dataItemID;
            }

            if ($dataItemTypeKey === 'candidate')
            {
                $profileURL = sprintf('%s?m=candidates&a=show&candidateID=%d', $baseURL, $dataItemID);
            }
            else
            {
                $profileURL = sprintf('%s?m=contacts&a=show&contactID=%d', $baseURL, $dataItemID);
            }

            $responseRows[] = array(
                'activityID' => $activityID,
                'dataItemID' => $dataItemID,
                'dataItemType' => $dataItemType,
                'dataItemTypeKey' => $dataItemTypeKey,
                'firstName' => $firstName,
                'lastName' => $lastName,
                'fullName' => $fullName,
                'isHot' => ((int) (isset($row['isHot']) ? $row['isHot'] : 0) === 1),
                'dateCreated' => (isset($row['dateCreated']) ? (string) $row['dateCreated'] : ''),
                'typeDescription' => (isset($row['typeDescription']) ? (string) $row['typeDescription'] : ''),
                'notes' => (isset($row['notes']) ? (string) $row['notes'] : ''),
                'enteredByName' => trim((isset($row['enteredByFullName']) ? (string) $row['enteredByFullName'] : '')),
                'regarding' => (isset($row['regarding']) ? (string) $row['regarding'] : 'General'),
                'jobOrderID' => $jobOrderID,
                'jobOrderTitle' => (isset($row['jobOrderTitle']) ? (string) $row['jobOrderTitle'] : ''),
                'companyID' => $companyID,
                'companyName' => (isset($row['companyName']) ? (string) $row['companyName'] : ''),
                'profileURL' => $profileURL,
                'jobOrderURL' => sprintf('%s?m=joborders&a=show&jobOrderID=%d', $baseURL, $jobOrderID),
                'companyURL' => sprintf('%s?m=companies&a=show&companyID=%d', $baseURL, $companyID)
            );
        }

        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'activity.listByView.v1',
                'modernPage' => $modernPage,
                'page' => (int) $page,
                'totalPages' => (int) $totalPages,
                'totalRows' => (int) $totalRows,
                'entriesPerPage' => (int) $entriesPerPage,
                'sortBy' => $sortBy,
                'sortDirection' => $sortDirection
            ),
            'filters' => array(
                'quickSearch' => $quickSearch,
                'period' => $resolvedPeriod,
                'startDate' => $resolvedStartDate,
                'endDate' => $resolvedEndDate,
                'dataItemType' => $dataItemTypeFilter,
                'activityTypeID' => (int) $activityTypeID
            ),
            'options' => array(
                'periods' => array(
                    array('value' => 'today', 'label' => 'Today'),
                    array('value' => 'yesterday', 'label' => 'Yesterday'),
                    array('value' => 'lastweek', 'label' => 'Last Week'),
                    array('value' => 'lastmonth', 'label' => 'Last Month'),
                    array('value' => 'lastsixmonths', 'label' => 'Last 6 Months'),
                    array('value' => 'lastyear', 'label' => 'Last Year'),
                    array('value' => 'all', 'label' => 'All'),
                    array('value' => 'custom', 'label' => 'Custom Range')
                ),
                'dataItemTypes' => array(
                    array('value' => 'all', 'label' => 'All Profiles'),
                    array('value' => 'candidate', 'label' => 'Candidates'),
                    array('value' => 'contact', 'label' => 'Contacts')
                ),
                'activityTypes' => $activityTypeOptions
            ),
            'actions' => array(
                'legacyURL' => sprintf('%s?m=activity&a=listByViewDataGrid&ui=legacy', $baseURL)
            ),
            'rows' => $responseRows
        );

        if (!headers_sent())
        {
            header('Content-Type: application/json; charset=' . AJAX_ENCODING);
            header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        }
        echo json_encode($payload);
    }

    private function buildModernActivityDateCriterion($db, &$resolvedPeriod, &$resolvedStartDate, &$resolvedEndDate)
    {
        $resolvedPeriod = strtolower(trim($this->getTrimmedInput('period', $_GET)));
        $resolvedStartDate = '';
        $resolvedEndDate = '';

        if ($resolvedPeriod === '')
        {
            $resolvedPeriod = 'lastmonth';
        }

        switch ($resolvedPeriod)
        {
            case 'today':
                return 'activity.date_created >= CURDATE() AND activity.date_created < DATE_ADD(CURDATE(), INTERVAL 1 DAY)';

            case 'yesterday':
                return 'activity.date_created >= DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND activity.date_created < CURDATE()';

            case 'lastweek':
                return 'activity.date_created >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)';

            case 'lastmonth':
                return 'activity.date_created >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)';

            case 'lastsixmonths':
                return 'activity.date_created >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)';

            case 'lastyear':
                return 'activity.date_created >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)';

            case 'all':
                return '';

            case 'custom':
                $resolvedStartDate = $this->resolveModernDateInput('startDate', 'startMonth', 'startDay', 'startYear');
                $resolvedEndDate = $this->resolveModernDateInput('endDate', 'endMonth', 'endDay', 'endYear');
                if ($resolvedStartDate !== '' && $resolvedEndDate !== '')
                {
                    if ($resolvedStartDate > $resolvedEndDate)
                    {
                        $tempDate = $resolvedStartDate;
                        $resolvedStartDate = $resolvedEndDate;
                        $resolvedEndDate = $tempDate;
                    }

                    $endExclusive = date('Y-m-d', strtotime($resolvedEndDate . ' +1 day'));
                    if (!empty($endExclusive))
                    {
                        return sprintf(
                            "activity.date_created >= %s AND activity.date_created < %s",
                            $db->makeQueryString($resolvedStartDate . ' 00:00:00'),
                            $db->makeQueryString($endExclusive . ' 00:00:00')
                        );
                    }
                }
                $resolvedPeriod = 'lastmonth';
                return 'activity.date_created >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)';

            default:
                $resolvedPeriod = 'lastmonth';
                return 'activity.date_created >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)';
        }
    }

    private function resolveModernDateInput($dateKey, $monthKey, $dayKey, $yearKey)
    {
        $dateValue = trim($this->getTrimmedInput($dateKey, $_GET));
        if ($dateValue !== '')
        {
            if (preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $dateValue, $matches))
            {
                $year = (int) $matches[1];
                $month = (int) $matches[2];
                $day = (int) $matches[3];
                if (checkdate($month, $day, $year))
                {
                    return sprintf('%04d-%02d-%02d', $year, $month, $day);
                }
            }
            return '';
        }

        $monthValue = trim($this->getTrimmedInput($monthKey, $_GET));
        $dayValue = trim($this->getTrimmedInput($dayKey, $_GET));
        $yearValue = trim($this->getTrimmedInput($yearKey, $_GET));
        if ($monthValue === '' || $dayValue === '' || $yearValue === '')
        {
            return '';
        }

        $month = (int) $monthValue;
        $day = (int) $dayValue;
        $year = (int) $yearValue;
        if (!checkdate($month, $day, $year))
        {
            return '';
        }

        return sprintf('%04d-%02d-%02d', $year, $month, $day);
    }

    /**
     * Returns the "Quick Links" navigation HTML for the top right corner of
     * the Activities page.
     *
     * @return string "Quick Links" HTML
     */
    private function getQuickLinks()
    {
        $today = array(
            'month' => date('n'),
            'day'   => date('j'),
            'year'  => date('Y')
        );

        $yesterdayTimeStamp = DateUtility::subtractDaysFromDate(time(), 1);
        $yesterday = array(
            'month' => date('n', $yesterdayTimeStamp),
            'day'   => date('j', $yesterdayTimeStamp),
            'year'  => date('Y', $yesterdayTimeStamp)
        );

        $baseURL = sprintf(
            '%s?m=activity&amp;a=viewByDate&amp;getback=getback',
            CATSUtility::getIndexName()
        );

        $quickLinks[0] = sprintf(
            '<a href="%s&amp;startMonth=%s&amp;startDay=%s&amp;startYear=%s&amp;endMonth=%s&amp;endDay=%s&amp;endYear=%s">Today</a>',
            $baseURL,
            $today['month'],
            $today['day'],
            $today['year'],
            $today['month'],
            $today['day'],
            $today['year']
        );

        $quickLinks[1] = sprintf(
            '<a href="%s&amp;startMonth=%s&amp;startDay=%s&amp;startYear=%s&amp;endMonth=%s&amp;endDay=%s&amp;endYear=%s">Yesterday</a>',
            $baseURL,
            $yesterday['month'],
            $yesterday['day'],
            $yesterday['year'],
            $yesterday['month'],
            $yesterday['day'],
            $yesterday['year']
        );

        $quickLinks[2] = sprintf(
            '<a href="%s&amp;period=lastweek">Last Week</a>',
            $baseURL
        );

        $quickLinks[3] = sprintf(
            '<a href="%s&amp;period=lastmonth">Last Month</a>',
            $baseURL
        );

        $quickLinks[4] = sprintf(
            '<a href="%s&amp;period=lastsixmonths">Last 6 Months</a>',
            $baseURL
        );

        $quickLinks[5] = sprintf(
            '<a href="%s&amp;period=all">All</a>',
            $baseURL
        );

        return implode(' | ', $quickLinks);
    }
}
?>
