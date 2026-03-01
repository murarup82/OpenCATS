<?php
/*
 * CATS
 * Companies Module
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
 * $Id: CompaniesUI.php 3460 2007-11-07 03:50:34Z brian $
 */

include_once(LEGACY_ROOT . '/lib/StringUtility.php');
include_once(LEGACY_ROOT . '/lib/DateUtility.php'); /* Depends on StringUtility. */
include_once(LEGACY_ROOT . '/lib/ResultSetUtility.php');
include_once(LEGACY_ROOT . '/lib/Companies.php');
include_once(LEGACY_ROOT . '/lib/Contacts.php');
include_once(LEGACY_ROOT . '/lib/JobOrders.php');
include_once(LEGACY_ROOT . '/lib/Attachments.php');
include_once(LEGACY_ROOT . '/lib/Export.php');
include_once(LEGACY_ROOT . '/lib/ListEditor.php');
include_once(LEGACY_ROOT . '/lib/FileUtility.php');
include_once(LEGACY_ROOT . '/lib/ExtraFields.php');
include_once(LEGACY_ROOT . '/lib/CommonErrors.php');

class CompaniesUI extends UserInterface
{
    /* Maximum number of characters of the job notes to show without the user
     * clicking "[More]"
     */
    const NOTES_MAXLEN = 500;


    public function __construct()
    {
        parent::__construct();

        $this->_authenticationRequired = true;
        $this->_moduleDirectory = 'companies';
        $this->_moduleName = 'companies';
        $this->_moduleTabText = 'Companies';
        $this->_subTabs = array(
            'Add Company'     => CATSUtility::getIndexName() . '?m=companies&amp;a=add*al=' . ACCESS_LEVEL_EDIT . '@companies.add' . '*hrmode=0',
            'Search Companies' => CATSUtility::getIndexName() . '?m=companies&amp;a=search*hrmode=0',
            'Go To My Company' => CATSUtility::getIndexName() . '?m=companies&amp;a=internalPostings*hrmode=0'
        );
    }


    public function handleRequest()
    {
        $action = $this->getAction();

        if (!eval(Hooks::get('CLIENTS_HANDLE_REQUEST'))) return;

        switch ($action)
        {
            case 'show':
                if ($this->getUserAccessLevel('companies.show') < ACCESS_LEVEL_READ)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->show();
                break;

            case 'internalPostings':
                if ($this->getUserAccessLevel('companies.internalPostings') < ACCESS_LEVEL_READ)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->internalPostings();
                break;

            case 'add':
                if ($this->getUserAccessLevel('companies.add') < ACCESS_LEVEL_EDIT)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                if ($this->isPostBack())
                {
                    $this->onAdd();
                }
                else
                {
                    $this->add();
                }

                break;

            case 'edit':
                if ($this->getUserAccessLevel('companies.edit') < ACCESS_LEVEL_EDIT)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                if ($this->isPostBack())
                {
                    $this->onEdit();
                }
                else
                {
                    $this->edit();
                }

                break;

            case 'delete':
                if ($this->getUserAccessLevel('companies.delete') < ACCESS_LEVEL_DELETE)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->onDelete();
                break;

            case 'search':
                if ($this->getUserAccessLevel('companies.search') < ACCESS_LEVEL_READ)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                include_once(LEGACY_ROOT . '/lib/Search.php');

                if ($this->isGetBack())
                {
                    $this->onSearch();
                }
                else
                {
                    $this->search();
                }

                break;

            /* Add an attachment */
            case 'createAttachment':
                if ($this->getUserAccessLevel('companies.createAttachment') < ACCESS_LEVEL_EDIT)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                include_once(LEGACY_ROOT . '/lib/DocumentToText.php');

                if ($this->isPostBack())
                {
                    $this->onCreateAttachment();
                }
                else
                {
                    $this->createAttachment();
                }

                break;

            /* Delete an attachment */
            case 'deleteAttachment':
                if ($this->getUserAccessLevel('companies.deleteAttachment') < ACCESS_LEVEL_DELETE)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->onDeleteAttachment();
                break;

            /* Main companies page. */
            case 'listByView':
            default:
                if ($this->getUserAccessLevel('companies.list') < ACCESS_LEVEL_READ)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->listByView();
                break;
        }
    }


    /*
     * Called by handleRequest() to process loading the list / main page.
     */
    private function listByView($errMessage = '')
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));
        $isModernJSON = ($responseFormat === 'modern-json');

        /* First, if we are operating in HR mode we will never see the
           companies pager.  Immediantly forward to My Company. */

        if ($_SESSION['CATS']->isHrMode())
        {
            if ($isModernJSON)
            {
                if (!headers_sent())
                {
                    header('HTTP/1.1 403 Forbidden');
                    header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                }
                echo json_encode(array(
                    'error' => true,
                    'message' => 'Companies list is unavailable in HR mode.'
                ));
                return;
            }
            $this->internalPostings();
            die();
        }

        if ($isModernJSON)
        {
            if ($modernPage !== '' && $modernPage !== 'companies-list')
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

            $this->renderModernCompaniesListJSON('companies-list');
            return;
        }

        $dataGridProperties = DataGrid::getRecentParamaters("companies:CompaniesListByViewDataGrid");

        /* If this is the first time we visited the datagrid this session, the recent paramaters will
         * be empty.  Fill in some default values. */
        if ($dataGridProperties == array())
        {
            $dataGridProperties = array('rangeStart'    => 0,
                                        'maxResults'    => 15,
                                        'filterVisible' => false);
        }

        $dataGrid = DataGrid::get("companies:CompaniesListByViewDataGrid", $dataGridProperties);

        $this->_template->assign('active', $this);
        $this->_template->assign('dataGrid', $dataGrid);
        $this->_template->assign('userID', $_SESSION['CATS']->getUserID());
        $this->_template->assign('errMessage', $errMessage);

        if (!eval(Hooks::get('CLIENTS_LIST_BY_VIEW'))) return;

        $this->_template->display('./modules/companies/Companies.tpl');
    }

    private function renderModernCompaniesListJSON($modernPage)
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
        $onlyMyCompanies = $this->getRequestBooleanFlag('onlyMyCompanies', false);
        $onlyHotCompanies = $this->getRequestBooleanFlag('onlyHotCompanies', false);

        $sortMap = array(
            'name' => 'company.name',
            'jobs' => 'jobs',
            'city' => 'company.city',
            'country' => 'company.country',
            'phone' => 'company.phone',
            'owner' => 'ownerSort',
            'dateCreated' => 'company.date_created',
            'dateModified' => 'company.date_modified'
        );
        $sortBy = $this->getTrimmedInput('sortBy', $_GET);
        if (!isset($sortMap[$sortBy]))
        {
            $sortBy = 'dateModified';
        }
        $sortDirection = strtoupper(trim($this->getTrimmedInput('sortDirection', $_GET)));
        if ($sortDirection !== 'ASC' && $sortDirection !== 'DESC')
        {
            $sortDirection = 'DESC';
        }

        $whereConditions = array(
            'company.site_id = ' . $db->makeQueryInteger($siteID)
        );

        if ($onlyMyCompanies)
        {
            $whereConditions[] = 'company.owner = ' . $db->makeQueryInteger($this->_userID);
        }
        if ($onlyHotCompanies)
        {
            $whereConditions[] = 'company.is_hot = 1';
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
                "(company.name LIKE %s ESCAPE '\\\\'
                OR company.city LIKE %s ESCAPE '\\\\'
                OR company.country LIKE %s ESCAPE '\\\\'
                OR company.phone LIKE %s ESCAPE '\\\\'
                OR company.key_technologies LIKE %s ESCAPE '\\\\'
                OR company.notes LIKE %s ESCAPE '\\\\')",
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
            '%s %s, company.date_modified DESC',
            $sortMap[$sortBy],
            $sortDirection
        );

        $sql = sprintf(
            "SELECT SQL_CALC_FOUND_ROWS
                company.company_id AS companyID,
                company.name AS name,
                company.is_hot AS isHot,
                company.city AS city,
                company.country AS country,
                company.phone AS phone,
                company.url AS webSite,
                company.key_technologies AS keyTechnologies,
                DATE_FORMAT(company.date_created, '%%m-%%d-%%y') AS dateCreated,
                DATE_FORMAT(company.date_modified, '%%m-%%d-%%y') AS dateModified,
                CONCAT(COALESCE(owner_user.first_name, ''), ' ', COALESCE(owner_user.last_name, '')) AS ownerFullName,
                CONCAT(COALESCE(owner_user.last_name, ''), COALESCE(owner_user.first_name, '')) AS ownerSort,
                (
                    SELECT COUNT(*)
                    FROM joborder
                    WHERE
                        joborder.company_id = company.company_id
                    AND
                        joborder.site_id = company.site_id
                ) AS jobs,
                IF(
                    EXISTS(
                        SELECT 1
                        FROM attachment
                        WHERE
                            attachment.data_item_id = company.company_id
                        AND
                            attachment.site_id = company.site_id
                        AND
                            attachment.data_item_type = %s
                        LIMIT 1
                    ),
                    1,
                    0
                ) AS attachmentPresent
            FROM
                company
            LEFT JOIN user AS owner_user
                ON company.owner = owner_user.user_id
            WHERE
                %s
            ORDER BY
                %s
            LIMIT
                %s, %s",
            $db->makeQueryInteger(DATA_ITEM_COMPANY),
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

        $responseRows = array();
        foreach ($rows as $row)
        {
            $companyID = (int) $row['companyID'];
            $responseRows[] = array(
                'companyID' => $companyID,
                'name' => (isset($row['name']) ? (string) $row['name'] : ''),
                'isHot' => ((int) (isset($row['isHot']) ? $row['isHot'] : 0) === 1),
                'jobs' => (int) (isset($row['jobs']) ? $row['jobs'] : 0),
                'city' => (isset($row['city']) ? (string) $row['city'] : ''),
                'country' => (isset($row['country']) ? (string) $row['country'] : ''),
                'phone' => (isset($row['phone']) ? (string) $row['phone'] : ''),
                'webSite' => (isset($row['webSite']) ? (string) $row['webSite'] : ''),
                'ownerName' => trim((isset($row['ownerFullName']) ? (string) $row['ownerFullName'] : '')),
                'dateCreated' => (isset($row['dateCreated']) ? (string) $row['dateCreated'] : ''),
                'dateModified' => (isset($row['dateModified']) ? (string) $row['dateModified'] : ''),
                'hasAttachment' => ((int) (isset($row['attachmentPresent']) ? $row['attachmentPresent'] : 0) === 1),
                'showURL' => sprintf('%s?m=companies&a=show&companyID=%d', $baseURL, $companyID),
                'editURL' => sprintf('%s?m=companies&a=edit&companyID=%d', $baseURL, $companyID),
                'addToListURL' => sprintf(
                    '%s?m=lists&a=quickActionAddToListModal&dataItemType=%d&dataItemID=%d&ui=legacy',
                    $baseURL,
                    DATA_ITEM_COMPANY,
                    $companyID
                )
            );
        }

        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'companies.listByView.v1',
                'modernPage' => $modernPage,
                'page' => (int) $page,
                'totalPages' => (int) $totalPages,
                'totalRows' => (int) $totalRows,
                'entriesPerPage' => (int) $entriesPerPage,
                'sortBy' => $sortBy,
                'sortDirection' => $sortDirection,
                'permissions' => array(
                    'canAddCompany' => ($this->getUserAccessLevel('companies.add') >= ACCESS_LEVEL_EDIT),
                    'canEditCompany' => ($this->getUserAccessLevel('companies.edit') >= ACCESS_LEVEL_EDIT),
                    'canDeleteCompany' => ($this->getUserAccessLevel('companies.delete') >= ACCESS_LEVEL_DELETE),
                    'canAddToList' => ($this->getUserAccessLevel('lists.listByView') >= ACCESS_LEVEL_EDIT)
                )
            ),
            'filters' => array(
                'quickSearch' => $quickSearch,
                'onlyMyCompanies' => ((bool) $onlyMyCompanies),
                'onlyHotCompanies' => ((bool) $onlyHotCompanies)
            ),
            'actions' => array(
                'addCompanyURL' => sprintf('%s?m=companies&a=add&ui=legacy', $baseURL),
                'legacyURL' => sprintf('%s?m=companies&a=listByView&ui=legacy', $baseURL)
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

    private function getRequestBooleanFlag($key, $defaultValue = false)
    {
        if (!isset($_GET[$key]))
        {
            return (bool) $defaultValue;
        }

        $rawValue = strtolower(trim((string) $_GET[$key]));
        if ($rawValue === '' || $rawValue === '1' || $rawValue === 'true' || $rawValue === 'yes' || $rawValue === 'on')
        {
            return true;
        }
        if ($rawValue === '0' || $rawValue === 'false' || $rawValue === 'no' || $rawValue === 'off')
        {
            return false;
        }

        return (bool) $defaultValue;
    }

    /*
     * Called by handleRequest() to process loading the details page.
     */
    private function show()
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));
        $isModernJSON = ($responseFormat === 'modern-json');

        /* Bail out if we don't have a valid company ID. */
        if (!$this->isRequiredIDValid('companyID', $_GET))
        {
            $this->listByView('Invalid company ID.');
            return;
        }

        $companyID = $_GET['companyID'];

        $companies = new Companies($this->_siteID);
        $data = $companies->get($companyID);

        /* Bail out if we got an empty result set. */
        if (empty($data))
        {
            $this->listByView('The specified company ID could not be found.');
            return;
        }
        $notesText = (isset($data['notes']) ? (string) $data['notes'] : '');

        /* We want to handle formatting the city and state here instead
         * of in the template.
         */
        $data['cityAndState'] = StringUtility::makeCityStateString(
            $data['city'], $data['country']
        );

        /*
         * Replace newlines with <br />, fix HTML "special" characters, and
         * strip leading empty lines and spaces.
         */
        $data['notes'] = trim(
            nl2br(htmlspecialchars($data['notes'], ENT_QUOTES))
        );

        /* Chop $data['notes'] to make $data['shortNotes']. */
        if (strlen($data['notes']) > self::NOTES_MAXLEN)
        {
            $data['shortNotes']  = substr(
                $data['notes'], 0, self::NOTES_MAXLEN
            );
            $isShortNotes = true;
        }
        else
        {
            $data['shortNotes'] = $data['notes'];
            $isShortNotes = false;
        }

        /* Hot companies [can] have different title styles than normal companies. */
        if ($data['isHot'] == 1)
        {
            $data['titleClass'] = 'jobTitleHot';
        }
        else
        {
            $data['titleClass'] = 'jobTitleCold';
        }

        /* Link to Google Maps for this address */
        if (!empty($data['address']) && !empty($data['city']) && !empty($data['country']))
        {
            $data['googleMaps'] = '<a href="http://maps.google.com/maps?q=' .
                     urlencode($data['address']) . '+' .
                     urlencode($data['city'])     . '+' .
                     urlencode($data['country']);

            $data['googleMaps'] .= '" target=_blank><img src="images/google_maps.gif" style="border: none;" class="absmiddle" /></a>';
        }
        else
        {
            $data['googleMaps'] = '';
        }

        /* Attachments */
        $attachments = new Attachments($this->_siteID);
        $attachmentsRS = $attachments->getAll(
            DATA_ITEM_COMPANY, $companyID
        );

        foreach ($attachmentsRS as $rowNumber => $attachmentsData)
        {
            /* Show an attachment icon based on the document's file type. */
            $attachmentIcon = strtolower(
                FileUtility::getAttachmentIcon(
                    $attachmentsRS[$rowNumber]['originalFilename']
                )
            );

            $attachmentsRS[$rowNumber]['attachmentIcon'] = $attachmentIcon;
        }

        /* Job Orders for this company */
        $jobOrders   = new JobOrders($this->_siteID);
        $jobOrdersRS = $jobOrders->getAll(
            JOBORDERS_STATUS_ALL, -1, $companyID, -1
        );

        if (!empty($jobOrdersRS))
        {
            foreach ($jobOrdersRS as $rowIndex => $row)
            {
                /* Convert '00-00-00' dates to empty strings. */
                $jobOrdersRS[$rowIndex]['startDate'] = DateUtility::fixZeroDate(
                    $jobOrdersRS[$rowIndex]['startDate']
                );

                /* Hot jobs [can] have different title styles than normal
                 * jobs.
                 */
                if ($jobOrdersRS[$rowIndex]['isHot'] == 1)
                {
                    $jobOrdersRS[$rowIndex]['linkClass'] = 'jobLinkHot';
                }
                else
                {
                    $jobOrdersRS[$rowIndex]['linkClass'] = 'jobLinkCold';
                }

                $jobOrdersRS[$rowIndex]['recruiterAbbrName'] = StringUtility::makeInitialName(
                    $jobOrdersRS[$rowIndex]['recruiterFirstName'],
                    $jobOrdersRS[$rowIndex]['recruiterLastName'],
                    false,
                    LAST_NAME_MAXLEN
                );

                $jobOrdersRS[$rowIndex]['ownerAbbrName'] = StringUtility::makeInitialName(
                    $jobOrdersRS[$rowIndex]['ownerFirstName'],
                    $jobOrdersRS[$rowIndex]['ownerLastName'],
                    false,
                    LAST_NAME_MAXLEN
                );
            }
        }

        /* Contacts for this company */
        $contacts   = new Contacts($this->_siteID);
        $contactsRS = $contacts->getAll(-1, $companyID);
        $contactsRSWC = null;

        if (!empty($contactsRS))
        {
            foreach ($contactsRS as $rowIndex => $row)
            {

                /* Hot contacts [can] have different title styles than normal contacts. */
                if ($contactsRS[$rowIndex]['isHot'] == 1)
                {
                    $contactsRS[$rowIndex]['linkClass'] = 'jobLinkHot';
                }
                else
                {
                    $contactsRS[$rowIndex]['linkClass'] = 'jobLinkCold';
                }

                if (!empty($contactsRS[$rowIndex]['ownerFirstName']))
                {
                    $contactsRS[$rowIndex]['ownerAbbrName'] = StringUtility::makeInitialName(
                        $contactsRS[$rowIndex]['ownerFirstName'],
                        $contactsRS[$rowIndex]['ownerLastName'],
                        false,
                        LAST_NAME_MAXLEN
                    );
                }
                else
                {
                    $contactsRS[$rowIndex]['ownerAbbrName'] = 'None';
                }

                if ($contactsRS[$rowIndex]['leftCompany'] == 0)
                {
                    $contactsRSWC[] = $contactsRS[$rowIndex];
                }
                else
                {
                    $contactsRS[$rowIndex]['linkClass'] = 'jobLinkDead';
                }
            }
        }

        /* Add an MRU entry. */
        $_SESSION['CATS']->getMRU()->addEntry(
            DATA_ITEM_COMPANY, $companyID, $data['name']
        );

        /* Get extra fields. */
        $extraFieldRS = $companies->extraFields->getValuesForShow($companyID);

        /* Get departments. */
        $departmentsRS = $companies->getDepartments($companyID);

        /* Is the user an admin - can user see history? */
        if ($this->getUserAccessLevel('companies.show') < ACCESS_LEVEL_DEMO)
        {
            $privledgedUser = false;
        }
        else
        {
            $privledgedUser = true;
        }

        if ($isModernJSON)
        {
            if ($modernPage !== '' && $modernPage !== 'companies-show')
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

            $this->renderModernCompanyShowJSON(
                'companies-show',
                $companyID,
                $data,
                $notesText,
                $attachmentsRS,
                $jobOrdersRS,
                $contactsRS,
                $contactsRSWC,
                $extraFieldRS,
                $departmentsRS,
                $privledgedUser
            );
            return;
        }

        $this->_template->assign('active', $this);
        $this->_template->assign('data', $data);
        $this->_template->assign('attachmentsRS', $attachmentsRS);
        $this->_template->assign('departmentsRS', $departmentsRS);
        $this->_template->assign('extraFieldRS', $extraFieldRS);
        $this->_template->assign('isShortNotes', $isShortNotes);
        $this->_template->assign('jobOrdersRS', $jobOrdersRS);
        $this->_template->assign('contactsRS', $contactsRS);
        $this->_template->assign('contactsRSWC', $contactsRSWC);
        $this->_template->assign('privledgedUser', $privledgedUser);
        $this->_template->assign('companyID', $companyID);
        $this->_template->assign(
            'deleteAttachmentToken',
            $this->getCSRFToken('companies.deleteAttachment')
        );

        if (!eval(Hooks::get('CLIENTS_SHOW'))) return;

        $this->_template->display('./modules/companies/Show.tpl');
    }

    private function renderModernCompanyShowJSON(
        $modernPage,
        $companyID,
        $data,
        $notesText,
        $attachmentsRS,
        $jobOrdersRS,
        $contactsRS,
        $contactsRSWC,
        $extraFieldRS,
        $departmentsRS,
        $privledgedUser
    )
    {
        $baseURL = CATSUtility::getIndexName();
        $companyName = (isset($data['name']) ? (string) $data['name'] : '');
        $companyNameTrimmed = trim($companyName);
        if ($companyNameTrimmed === '')
        {
            $companyNameTrimmed = 'Company #' . (int) $companyID;
        }

        $attachmentsPayload = array();
        foreach ($attachmentsRS as $attachmentRow)
        {
            $attachmentsPayload[] = array(
                'attachmentID' => (int) (isset($attachmentRow['attachmentID']) ? $attachmentRow['attachmentID'] : 0),
                'fileName' => (isset($attachmentRow['originalFilename']) ? (string) $attachmentRow['originalFilename'] : ''),
                'dateCreated' => (isset($attachmentRow['dateCreated']) ? (string) $attachmentRow['dateCreated'] : ''),
                'retrievalURL' => (isset($attachmentRow['retrievalURL']) ? (string) $attachmentRow['retrievalURL'] : '')
            );
        }

        $jobOrdersPayload = array();
        foreach ($jobOrdersRS as $jobOrderRow)
        {
            $jobOrderID = (int) (isset($jobOrderRow['jobOrderID']) ? $jobOrderRow['jobOrderID'] : 0);
            if ($jobOrderID <= 0)
            {
                continue;
            }
            $jobOrdersPayload[] = array(
                'jobOrderID' => $jobOrderID,
                'title' => (isset($jobOrderRow['title']) ? (string) $jobOrderRow['title'] : ''),
                'status' => (isset($jobOrderRow['status']) ? (string) $jobOrderRow['status'] : ''),
                'type' => (isset($jobOrderRow['type']) ? (string) $jobOrderRow['type'] : ''),
                'dateCreated' => (isset($jobOrderRow['dateCreated']) ? (string) $jobOrderRow['dateCreated'] : ''),
                'dateModified' => (isset($jobOrderRow['dateModified']) ? (string) $jobOrderRow['dateModified'] : ''),
                'daysOld' => (int) (isset($jobOrderRow['daysOld']) ? $jobOrderRow['daysOld'] : 0),
                'submitted' => (int) (isset($jobOrderRow['submitted']) ? $jobOrderRow['submitted'] : 0),
                'pipeline' => (int) (isset($jobOrderRow['pipeline']) ? $jobOrderRow['pipeline'] : 0),
                'showURL' => sprintf('%s?m=joborders&a=show&jobOrderID=%d', $baseURL, $jobOrderID),
                'editURL' => sprintf('%s?m=joborders&a=edit&jobOrderID=%d', $baseURL, $jobOrderID)
            );
        }

        $contactsPayload = array();
        $contactsSeen = array();
        if (!is_array($contactsRS))
        {
            $contactsRS = array();
        }
        foreach ($contactsRS as $contactRow)
        {
            $contactID = (int) (isset($contactRow['contactID']) ? $contactRow['contactID'] : 0);
            if ($contactID <= 0 || isset($contactsSeen[$contactID]))
            {
                continue;
            }
            $contactsSeen[$contactID] = true;
            $contactsPayload[] = array(
                'contactID' => $contactID,
                'firstName' => (isset($contactRow['firstName']) ? (string) $contactRow['firstName'] : ''),
                'lastName' => (isset($contactRow['lastName']) ? (string) $contactRow['lastName'] : ''),
                'title' => (isset($contactRow['title']) ? (string) $contactRow['title'] : ''),
                'department' => (isset($contactRow['department']) ? (string) $contactRow['department'] : ''),
                'email' => (isset($contactRow['email1']) ? (string) $contactRow['email1'] : ''),
                'phone' => (isset($contactRow['phoneCell']) ? (string) $contactRow['phoneCell'] : ''),
                'dateCreated' => (isset($contactRow['dateCreated']) ? (string) $contactRow['dateCreated'] : ''),
                'ownerName' => (isset($contactRow['ownerAbbrName']) ? (string) $contactRow['ownerAbbrName'] : ''),
                'leftCompany' => ((int) (isset($contactRow['leftCompany']) ? $contactRow['leftCompany'] : 0) === 1),
                'showURL' => sprintf('%s?m=contacts&a=show&contactID=%d', $baseURL, $contactID),
                'editURL' => sprintf('%s?m=contacts&a=edit&contactID=%d', $baseURL, $contactID)
            );
        }

        $extraFieldsPayload = array();
        foreach ($extraFieldRS as $extraFieldRow)
        {
            $extraFieldsPayload[] = array(
                'fieldName' => (isset($extraFieldRow['fieldName']) ? (string) $extraFieldRow['fieldName'] : ''),
                'display' => (isset($extraFieldRow['display']) ? (string) $extraFieldRow['display'] : '')
            );
        }

        $departmentsPayload = array();
        foreach ($departmentsRS as $departmentRow)
        {
            $departmentsPayload[] = array(
                'departmentID' => (int) (isset($departmentRow['departmentID']) ? $departmentRow['departmentID'] : 0),
                'name' => (isset($departmentRow['name']) ? (string) $departmentRow['name'] : '')
            );
        }

        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'companies.show.v1',
                'modernPage' => $modernPage,
                'companyID' => (int) $companyID,
                'permissions' => array(
                    'canEditCompany' => ($this->getUserAccessLevel('companies.edit') >= ACCESS_LEVEL_EDIT),
                    'canDeleteCompany' => ($this->getUserAccessLevel('companies.delete') >= ACCESS_LEVEL_DELETE),
                    'canAddJobOrder' => ($this->getUserAccessLevel('joborders.add') >= ACCESS_LEVEL_EDIT),
                    'canAddContact' => ($this->getUserAccessLevel('contacts.add') >= ACCESS_LEVEL_EDIT),
                    'canCreateAttachment' => ($this->getUserAccessLevel('companies.createAttachment') >= ACCESS_LEVEL_EDIT),
                    'canDeleteAttachment' => ($this->getUserAccessLevel('companies.deleteAttachment') >= ACCESS_LEVEL_DELETE),
                    'canViewHistory' => ((bool) $privledgedUser)
                )
            ),
            'actions' => array(
                'legacyURL' => sprintf('%s?m=companies&a=show&companyID=%d&ui=legacy', $baseURL, (int) $companyID),
                'editURL' => sprintf('%s?m=companies&a=edit&companyID=%d&ui=legacy', $baseURL, (int) $companyID),
                'deleteURL' => sprintf('%s?m=companies&a=delete&companyID=%d&ui=legacy', $baseURL, (int) $companyID),
                'addJobOrderURL' => sprintf('%s?m=joborders&a=add&selected_company_id=%d&ui=legacy', $baseURL, (int) $companyID),
                'addContactURL' => sprintf('%s?m=contacts&a=add&selected_company_id=%d&ui=legacy', $baseURL, (int) $companyID),
                'historyURL' => sprintf('%s?m=settings&a=viewItemHistory&dataItemType=%d&dataItemID=%d&ui=legacy', $baseURL, DATA_ITEM_COMPANY, (int) $companyID),
                'createAttachmentURL' => sprintf('%s?m=companies&a=createAttachment&companyID=%d&ui=legacy', $baseURL, (int) $companyID),
                'deleteAttachmentURL' => sprintf('%s?m=companies&a=deleteAttachment', $baseURL),
                'deleteAttachmentToken' => $this->getCSRFToken('companies.deleteAttachment')
            ),
            'company' => array(
                'companyID' => (int) $companyID,
                'name' => $companyNameTrimmed,
                'isHot' => ((int) (isset($data['isHot']) ? $data['isHot'] : 0) === 1),
                'titleClass' => (isset($data['titleClass']) ? (string) $data['titleClass'] : ''),
                'phone' => (isset($data['phone']) ? (string) $data['phone'] : ''),
                'address' => (isset($data['address']) ? (string) $data['address'] : ''),
                'city' => (isset($data['city']) ? (string) $data['city'] : ''),
                'country' => (isset($data['country']) ? (string) $data['country'] : ''),
                'cityAndState' => (isset($data['cityAndState']) ? (string) $data['cityAndState'] : ''),
                'billingContactID' => (int) (isset($data['billingContact']) ? $data['billingContact'] : 0),
                'billingContactFullName' => (isset($data['billingContactFullName']) ? (string) $data['billingContactFullName'] : ''),
                'webSite' => (isset($data['url']) ? (string) $data['url'] : ''),
                'keyTechnologies' => (isset($data['keyTechnologies']) ? (string) $data['keyTechnologies'] : ''),
                'dateCreated' => (isset($data['dateCreated']) ? (string) $data['dateCreated'] : ''),
                'enteredByFullName' => (isset($data['enteredByFullName']) ? (string) $data['enteredByFullName'] : ''),
                'ownerFullName' => (isset($data['ownerFullName']) ? (string) $data['ownerFullName'] : ''),
                'notesHTML' => (isset($data['notes']) ? (string) $data['notes'] : ''),
                'notesText' => (string) $notesText
            ),
            'attachments' => array(
                'count' => count($attachmentsPayload),
                'items' => $attachmentsPayload
            ),
            'jobOrders' => array(
                'count' => count($jobOrdersPayload),
                'items' => $jobOrdersPayload
            ),
            'contacts' => array(
                'count' => count($contactsPayload),
                'activeCount' => count((is_array($contactsRSWC) ? $contactsRSWC : array())),
                'items' => $contactsPayload
            ),
            'departments' => $departmentsPayload,
            'extraFields' => $extraFieldsPayload
        );

        if (!headers_sent())
        {
            header('Content-Type: application/json; charset=' . AJAX_ENCODING);
            header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        }
        echo json_encode($payload);
    }

    /*
     * Called by handleRequest() to process loading the internal postings company.
     */
    private function internalPostings()
    {
        $companies = new Companies($this->_siteID);
        $companyID = $companies->getDefaultCompany();

        CATSUtility::transferRelativeURI(
            'm=companies&a=show&companyID=' . $companyID
        );
    }

    /*
     * Called by handleRequest() to process loading the add page.
     */
    private function add()
    {
        $companies = new Companies($this->_siteID);

        /* Get extra fields. */
        $extraFieldRS = $companies->extraFields->getValuesForAdd();

        if (!eval(Hooks::get('CLIENTS_ADD'))) return;

        $this->_template->assign('extraFieldRS', $extraFieldRS);
        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', 'Add Company');
        $this->_template->display('./modules/companies/Add.tpl');
    }

    /*
     * Called by handleRequest() to process saving / submitting the add page.
     */
    private function onAdd()
    {
        $formattedPhone = StringUtility::extractPhoneNumber(
            $this->getSanitisedInput('phone', $_POST)
        );
        if (!empty($formattedPhone))
        {
            $phone = $formattedPhone;
        }
        else
        {
            $phone = $this->getSanitisedInput('phone', $_POST);
        }

        $url = $this->getSanitisedInput('url', $_POST);
        if (!empty($url))
        {
            $formattedURL = StringUtility::extractURL($url);

            if (!empty($formattedURL))
            {
                $url = $formattedURL;
            }
        }

        /* Hot company? */
        $isHot = $this->isChecked('isHot', $_POST);

        $name            = $this->getSanitisedInput('name', $_POST);
        $address         = $this->getSanitisedInput('address', $_POST);
        $city            = $this->getSanitisedInput('city', $_POST);
        $country         = $this->getSanitisedInput('country', $_POST);
        $keyTechnologies = $this->getSanitisedInput('keyTechnologies', $_POST);
        $notes           = $this->getSanitisedInput('notes', $_POST);

        /* Departments list editor. */
        $departmentsCSV = $this->getTrimmedInput('departmentsCSV', $_POST);

        /* Bail out if any of the required fields are empty. */
        if (empty($name))
        {
            $this->listByView('Required fields are missing.');
            return;
        }

        if (!eval(Hooks::get('CLIENTS_ON_ADD_PRE'))) return;

        $companies = new Companies($this->_siteID);
        $companyID = $companies->add(
            $name, $address, $city, $country, $phone,
            $url, $keyTechnologies, $isHot,
            $notes, $this->_userID, $this->_userID
        );

        if ($companyID <= 0)
        {
            CommonErrors::fatal(COMMONERROR_RECORDERROR, $this, 'Failed to add company.');
        }

        if (!eval(Hooks::get('CLIENTS_ON_ADD_POST'))) return;

        /* Update extra fields. */
        $companies->extraFields->setValuesOnEdit($companyID);

        /* Add departments */
        $departments = array();
        $departmentsDifferences = ListEditor::getDifferencesFromList(
            $departments, 'name', 'departmentID', $departmentsCSV
        );

        $companies->updateDepartments($companyID, $departmentsDifferences);

        CATSUtility::transferRelativeURI(
            'm=companies&a=show&companyID=' . $companyID
        );
    }

    /*
     * Called by handleRequest() to process loading the edit page.
     */
    private function edit()
    {
        /* Bail out if we don't have a valid company ID. */
        if (!$this->isRequiredIDValid('companyID', $_GET))
        {
            $this->listByView('Invalid company ID.');
            return;
        }

        $companyID = $_GET['companyID'];

        $companies = new Companies($this->_siteID);
        $data = $companies->getForEditing($companyID);

        /* Bail out if we got an empty result set. */
        if (empty($data))
        {
            $this->listByView('The specified company ID could not be found.');
            return;
        }

        /* Get the company's contacts data. */
        $contactsRS = $companies->getContactsArray($companyID);

        $users = new Users($this->_siteID);
        $usersRS = $users->getSelectList();

        /* Add an MRU entry. */
        $_SESSION['CATS']->getMRU()->addEntry(
            DATA_ITEM_COMPANY, $companyID, $data['name']
        );

        /* Get extra fields. */
        $extraFieldRS = $companies->extraFields->getValuesForEdit($companyID);

        /* Get departments. */
        $departmentsRS = $companies->getDepartments($companyID);
        $departmentsString = ListEditor::getStringFromList($departmentsRS, 'name');

        $emailTemplates = new EmailTemplates($this->_siteID);
        $statusChangeTemplateRS = $emailTemplates->getByTag(
            'EMAIL_TEMPLATE_OWNERSHIPASSIGNCLIENT'
        );

        if (!isset($statusChangeTemplateRS['disabled']) || $statusChangeTemplateRS['disabled'] == 1)
        {
            $emailTemplateDisabled = true;
        }
        else
        {
            $emailTemplateDisabled = false;
        }

        if ($this->getUserAccessLevel('companies.email') == ACCESS_LEVEL_DEMO)
        {
            $canEmail = false;
        }
        else
        {
            $canEmail = true;
        }

        if (!eval(Hooks::get('CLIENTS_EDIT'))) return;

        $this->_template->assign('canEmail', $canEmail);
        $this->_template->assign('active', $this);
        $this->_template->assign('data', $data);
        $this->_template->assign('usersRS', $usersRS);
        $this->_template->assign('extraFieldRS', $extraFieldRS);
        $this->_template->assign('contactsRS', $contactsRS);
        $this->_template->assign('departmentsRS', $departmentsRS);
        $this->_template->assign('departmentsString', $departmentsString);
        $this->_template->assign('emailTemplateDisabled', $emailTemplateDisabled);
        $this->_template->assign('companyID', $companyID);
        $this->_template->display('./modules/companies/Edit.tpl');
    }

    /*
     * Called by handleRequest() to process saving / submitting the edit page.
     */
    private function onEdit()
    {
        $companies = new Companies($this->_siteID);

        /* Bail out if we don't have a valid company ID. */
        if (!$this->isRequiredIDValid('companyID', $_POST))
        {
            $this->listByView('Invalid company ID.');
            return;
        }

        /* Bail out if we don't have a valid owner user ID. */
        if (!$this->isOptionalIDValid('owner', $_POST))
        {
            $this->listByView('Invalid owner user ID.');
            return;
        }

        /* Bail out if we don't have a valid billing contact ID. */
        if (!$this->isOptionalIDValid('billingContact', $_POST))
        {
            $this->listByView('Invalid billing contact ID.');
            return;
        }

        $formattedPhone = StringUtility::extractPhoneNumber(
            $this->getSanitisedInput('phone', $_POST)
        );
        if (!empty($formattedPhone))
        {
            $phone = $formattedPhone;
        }
        else
        {
            $phone = $this->getSanitisedInput('phone', $_POST);
        }

        $url = $this->getSanitisedInput('url', $_POST);
        if (!empty($url))
        {
            $formattedURL = StringUtility::extractURL($url);

            if (!empty($formattedURL))
            {
                $url = $formattedURL;
            }
        }

        /* Hot company? */
        $isHot = $this->isChecked('isHot', $_POST);

        $companyID       = $_POST['companyID'];
        $owner           = $_POST['owner'];
        $billingContact  = $_POST['billingContact'];

        /* Change ownership email? */
        if ($this->isChecked('ownershipChange', $_POST) && $owner > 0)
        {
            $companyDetails = $companies->get($companyID);

            $users = new Users($this->_siteID);
            $ownerDetails = $users->get($_POST['owner']);

            if (!empty($ownerDetails))
            {
                $emailAddress = $ownerDetails['email'];

                /* Get the change status email template. */
                $emailTemplates = new EmailTemplates($this->_siteID);
                $statusChangeTemplateRS = $emailTemplates->getByTag(
                    'EMAIL_TEMPLATE_OWNERSHIPASSIGNCLIENT'
                );

                if (empty($statusChangeTemplateRS) ||
                    empty($statusChangeTemplateRS['textReplaced']))
                {
                    $statusChangeTemplate = '';
                }
                else
                {
                    $statusChangeTemplate = $statusChangeTemplateRS['textReplaced'];
                }
                /* Replace e-mail template variables. */
                $stringsToFind = array(
                    '%CLNTOWNER%',
                    '%CLNTNAME%',
                    '%CLNTCATSURL%'
                );
                $replacementStrings = array(
                    $ownerDetails['fullName'],
                    $companyDetails['name'],
                    '<a href="http://' . $_SERVER['HTTP_HOST'] . substr($_SERVER['REQUEST_URI'], 0, strpos($_SERVER['REQUEST_URI'], '?')) . '?m=companies&amp;a=show&amp;companyID=' . $companyID . '">'.
                        'http://' . $_SERVER['HTTP_HOST'] . substr($_SERVER['REQUEST_URI'], 0, strpos($_SERVER['REQUEST_URI'], '?')) . '?m=companies&amp;a=show&amp;companyID=' . $companyID . '</a>'
                );
                $statusChangeTemplate = str_replace(
                    $stringsToFind,
                    $replacementStrings,
                    $statusChangeTemplate
                );

                $email = $statusChangeTemplate;
            }
            else
            {
                $email = '';
                $emailAddress = '';
            }
        }
        else
        {
            $email = '';
            $emailAddress = '';
        }

        $name            = $this->getSanitisedInput('name', $_POST);
        $address         = $this->getSanitisedInput('address', $_POST);
        $city            = $this->getSanitisedInput('city', $_POST);
        $country         = $this->getSanitisedInput('country', $_POST);
        $keyTechnologies = $this->getSanitisedInput('keyTechnologies', $_POST);
        $notes           = $this->getSanitisedInput('notes', $_POST);

        /* Departments list editor. */
        $departmentsCSV = $this->getTrimmedInput('departmentsCSV', $_POST);

        /* Bail out if any of the required fields are empty. */
        if (empty($name))
        {
            $this->listByView('Required fields are missing.');
            return;
        }

       if (!eval(Hooks::get('CLIENTS_ON_EDIT_PRE'))) return;

        $departments = $companies->getDepartments($companyID);
        $departmentsDifferences = ListEditor::getDifferencesFromList(
            $departments, 'name', 'departmentID', $departmentsCSV
        );
        $companies->updateDepartments($companyID, $departmentsDifferences);

        if (!$companies->update($companyID, $name, $address, $city, $country,
            $phone, $url, $keyTechnologies,
            $isHot, $notes, $owner, $billingContact, $email, $emailAddress))
        {
            CommonErrors::fatal(COMMONERROR_RECORDERROR, $this, 'Failed to update company.');
        }

       if (!eval(Hooks::get('CLIENTS_ON_EDIT_POST'))) return;

        /* Update extra fields. */
        $companies->extraFields->setValuesOnEdit($companyID);

        /* Update contacts? */
        if (isset($_POST['updateContacts']))
        {
            if ($_POST['updateContacts'] == 'yes')
            {
                $contacts = new Contacts($this->_siteID);
                $contacts->updateByCompany($companyID, $address, $city, $country);
            }
        }


       CATSUtility::transferRelativeURI(
            'm=companies&a=show&companyID=' . $companyID
        );
    }

    /*
     * Called by handleRequest() to process deleting a company.
     */
    private function onDelete()
    {
        /* Bail out if we don't have a valid company ID. */
        if (!$this->isRequiredIDValid('companyID', $_GET))
        {
            $this->listByView('Invalid company ID.');
            return;
        }

        $companyID = $_GET['companyID'];

        $companies = new Companies($this->_siteID);
        $rs = $companies->get($companyID);

        if (empty($rs))
        {
            $this->listByView('The specified company ID could not be found.');
            return;
        }

        if ($rs['defaultCompany'] == 1)
        {
            $this->listByView('Cannot delete default company.');
            return;
        }

       if (!eval(Hooks::get('CLIENTS_ON_DELETE_PRE'))) return;

        $companies->delete($companyID);

        /* Delete the MRU entry if present. */
        $_SESSION['CATS']->getMRU()->removeEntry(
            DATA_ITEM_COMPANY, $companyID
        );

       if (!eval(Hooks::get('CLIENTS_ON_DELETE_POST'))) return;

        CATSUtility::transferRelativeURI('m=companies&a=listByView');
    }

    /*
     * Called by handleRequest() to process loading the search page.
     */
    private function search()
    {
        $savedSearches = new SavedSearches($this->_siteID);
        $savedSearchRS = $savedSearches->get(DATA_ITEM_COMPANY);

        if (!eval(Hooks::get('CLIENTS_SEARCH'))) return;

        $this->_template->assign('wildCardString', '');
        $this->_template->assign('savedSearchRS', $savedSearchRS);
        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', 'Search Companies');
        $this->_template->assign('isResultsMode', false);
        $this->_template->assign('wildCardCompanyName' , '');
        $this->_template->assign('wildCardKeyTechnologies', '');
        $this->_template->assign('mode', '');
        $this->_template->display('./modules/companies/Search.tpl');
    }

    /*
     * Called by handleRequest() to process displaying the search results.
     */
    private function onSearch()
    {
        $wildCardCompanyName = '';
        $wildCardKeyTechnologies = '';

        /* Bail out to prevent an error if the GET string doesn't even contain
         * a field named 'wildCardString' at all.
         */
        if (!isset($_GET['wildCardString']))
        {
            $this->listByView('No wild card string specified.');
            return;
        }

        $query = trim($_GET['wildCardString']);

        /* Set up sorting. */
        if ($this->isRequiredIDValid('page', $_GET))
        {
            $currentPage = $_GET['page'];
        }
        else
        {
            $currentPage = 1;
        }

        $searchPager = new SearchPager(
            CANDIDATES_PER_PAGE, $currentPage, $this->_siteID, $_GET
        );

        if ($searchPager->isSortByValid('sortBy', $_GET))
        {
            $sortBy = $_GET['sortBy'];
        }
        else
        {
            $sortBy = 'name';
        }

        if ($searchPager->isSortDirectionValid('sortDirection', $_GET))
        {
            $sortDirection = $_GET['sortDirection'];
        }
        else
        {
            $sortDirection = 'ASC';
        }

        $baseURL = CATSUtility::getFilteredGET(
            array('sortBy', 'sortDirection', 'page'), '&amp;'
        );
        $searchPager->setSortByParameters($baseURL, $sortBy, $sortDirection);

        if (!eval(Hooks::get('CLIENTS_ON_SEARCH_PRE'))) return;

        /* Get our current searching mode. */
        $mode = $this->getSanitisedInput('mode', $_GET);

        /* Execute the search. */
        $search = new SearchCompanies($this->_siteID);
        switch ($mode)
        {
            case 'searchByName':
                $wildCardCompanyName = $query;
                $rs = $search->byName($query, $sortBy, $sortDirection);
                break;

            case 'searchByKeyTechnologies':
                $wildCardKeyTechnologies = $query;
                $rs = $search->byKeyTechnologies($query, $sortBy, $sortDirection);
                break;

            default:
                $this->listByView('Invalid search mode.');
                return;
                break;
        }

        foreach ($rs as $rowIndex => $row)
        {
            if ($row['isHot'] == 1)
            {
                $rs[$rowIndex]['linkClass'] = 'jobLinkHot';
            }
            else
            {
                $rs[$rowIndex]['linkClass'] = 'jobLinkCold';
            }

            if (!empty($row['ownerFirstName']))
            {
                $rs[$rowIndex]['ownerAbbrName'] = StringUtility::makeInitialName(
                    $row['ownerFirstName'],
                    $row['ownerLastName'],
                    false,
                    LAST_NAME_MAXLEN
                );
            }
            else
            {
                $rs[$rowIndex]['ownerAbbrName'] = 'None';
            }
        }

        $companyIDs = implode(',', ResultSetUtility::getColumnValues($rs, 'companyID'));
        $exportForm = ExportUtility::getForm(
            DATA_ITEM_COMPANY, $companyIDs, 40, 15
        );

        /* Save the search. */
        $savedSearches = new SavedSearches($this->_siteID);
        $savedSearches->add(
            DATA_ITEM_COMPANY,
            $query,
            $_SERVER['REQUEST_URI'],
            false
        );
        $savedSearchRS = $savedSearches->get(DATA_ITEM_COMPANY);

        $query = urlencode(htmlspecialchars($query));

        if (!eval(Hooks::get('CLIENTS_ON_SEARCH_POST'))) return;

        $this->_template->assign('savedSearchRS', $savedSearchRS);
        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', 'Search Companies');
        $this->_template->assign('exportForm', $exportForm);
        $this->_template->assign('pager', $searchPager);
        $this->_template->assign('rs', $rs);
        $this->_template->assign('isResultsMode', true);
        $this->_template->assign('wildCardCompanyName', $wildCardCompanyName);
        $this->_template->assign('wildCardString', $query);
        $this->_template->assign('wildCardKeyTechnologies', $wildCardKeyTechnologies);
        $this->_template->assign('mode', $mode);
        $this->_template->display('./modules/companies/Search.tpl');
    }

    /*
     * Called by handleRequest() to process loading the create attachment
     * modal dialog.
     */
    private function createAttachment()
    {
        /* Bail out if we don't have a valid joborder ID. */
        if (!$this->isRequiredIDValid('companyID', $_GET))
        {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid job order ID.');
        }

        $companyID = $_GET['companyID'];

        if (!eval(Hooks::get('CLIENTS_CREATE_ATTACHMENT'))) return;

        $this->_template->assign('isFinishedMode', false);
        $this->_template->assign('companyID', $companyID);
        $this->_template->display(
            './modules/companies/CreateAttachmentModal.tpl'
        );
    }

    /*
     * Called by handleRequest() to process creating an attachment.
     */
    private function onCreateAttachment()
    {
        /* Bail out if we don't have a valid joborder ID. */
        if (!$this->isRequiredIDValid('companyID', $_POST))
        {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid company ID.');
        }

        $companyID = $_POST['companyID'];

        if (!eval(Hooks::get('CLIENTS_ON_CREATE_ATTACHMENT_PRE'))) return;

        $attachmentCreator = new AttachmentCreator($this->_siteID);
        $attachmentCreator->createFromUpload(
            DATA_ITEM_COMPANY, $companyID, 'file', false, false
        );

        if ($attachmentCreator->isError())
        {
            CommonErrors::fatalModal(COMMONERROR_FILEERROR, $this, $attachmentCreator->getError());
        }

        if (!eval(Hooks::get('CLIENTS_ON_CREATE_ATTACHMENT_POST'))) return;

        $this->_template->assign('isFinishedMode', true);
        $this->_template->assign('companyID', $companyID);
        $this->_template->display(
            './modules/companies/CreateAttachmentModal.tpl'
        );
    }

    /*
     * Called by handleRequest() to process deleting an attachment.
     */
    private function onDeleteAttachment()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST')
        {
            CommonErrors::fatalModal(COMMONERROR_PERMISSION, $this, 'Invalid request method.');
        }

        /* Bail out if we don't have a valid attachment ID. */
        if (!$this->isRequiredIDValid('attachmentID', $_POST))
        {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid attachment ID.');
        }

        /* Bail out if we don't have a valid joborder ID. */
        if (!$this->isRequiredIDValid('companyID', $_POST))
        {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid company ID.');
        }

        $companyID  = $_POST['companyID'];
        $attachmentID = $_POST['attachmentID'];
        $securityToken = $this->getTrimmedInput('securityToken', $_POST);

        if (!$this->isCSRFTokenValid('companies.deleteAttachment', $securityToken))
        {
            CommonErrors::fatalModal(COMMONERROR_PERMISSION, $this, 'Invalid request token.');
        }

        if (!eval(Hooks::get('CLIENTS_ON_DELETE_ATTACHMENT_PRE'))) return;

        $attachments = new Attachments($this->_siteID);
        $attachmentRS = $attachments->get($attachmentID, true);
        if (empty($attachmentRS) ||
            (int) $attachmentRS['dataItemType'] !== DATA_ITEM_COMPANY ||
            (int) $attachmentRS['dataItemID'] !== (int) $companyID)
        {
            CommonErrors::fatalModal(COMMONERROR_PERMISSION, $this, 'Attachment does not belong to this company.');
        }

        $attachments->delete($attachmentID);

        if (!eval(Hooks::get('CLIENTS_ON_DELETE_ATTACHMENT_POST'))) return;

        CATSUtility::transferRelativeURI(
            'm=companies&a=show&companyID=' . $companyID
        );
    }


    /**
     * Formats SQL result set for display. This is factored out for code
     * clarity.
     *
     * @param array result set from listByView()
     * @return array formatted result set
     */
    private function _formatListByViewResults($resultSet)
    {
        if (empty($resultSet))
        {
            return $resultSet;
        }

        foreach ($resultSet as $rowIndex => $row)
        {
            /* Hot companies [can] have different title styles than normal
             * companies.
             */
            if ($resultSet[$rowIndex]['isHot'] == 1)
            {
                $resultSet[$rowIndex]['linkClass'] = 'jobLinkHot';
            }
            else
            {
                $resultSet[$rowIndex]['linkClass'] = 'jobLinkCold';
            }

            if (!empty($resultSet[$rowIndex]['ownerFirstName']))
            {
                $resultSet[$rowIndex]['ownerAbbrName'] = StringUtility::makeInitialName(
                    $resultSet[$rowIndex]['ownerFirstName'],
                    $resultSet[$rowIndex]['ownerLastName'],
                    false,
                    LAST_NAME_MAXLEN
                );
            }
            else
            {
                $resultSet[$rowIndex]['ownerAbbrName'] = 'None';
            }

            if ($resultSet[$rowIndex]['attachmentPresent'] == 1)
            {
                $resultSet[$rowIndex]['iconTag'] = '<img src="images/paperclip.gif" alt="" width="16" height="16" />';
            }
            else
            {
                $resultSet[$rowIndex]['iconTag'] = '&nbsp;';
            }

            /* Display nothing instead of zero's for Job Order Count on Companies
             * display page.
             */
            if ($resultSet[$rowIndex]['jobOrdersCount'] == 0)
            {
                $resultSet[$rowIndex]['jobOrdersCount'] = '&nbsp;';
            }
        }

        return $resultSet;
    }
}
