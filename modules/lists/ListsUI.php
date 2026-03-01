<?php
/*
 * CATS
 * Lists Module
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
 * $Id: ListsUI.php 3807 2007-12-05 01:47:41Z will $
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
include_once(LEGACY_ROOT . '/lib/SavedLists.php');
include_once(LEGACY_ROOT . '/lib/ExtraFields.php');
include_once(LEGACY_ROOT . '/lib/Users.php');


class ListsUI extends UserInterface
{

    public function __construct()
    {
        parent::__construct();

        $this->_authenticationRequired = true;
        $this->_moduleDirectory = 'lists';
        $this->_moduleName = 'lists';
        $this->_moduleTabText = 'Lists';
        $this->_subTabs = array(
            'Show Lists'     => CATSUtility::getIndexName() . '?m=lists'
        );
    }


    public function handleRequest()
    {
        $action = $this->getAction();

        if (!eval(Hooks::get('LISTS_HANDLE_REQUEST'))) return;

        switch ($action)
        {
            /* FIXME: function show() undefined
            case 'show':
                $this->show();
                break;
            */

            case 'showList':
                if ($this->getUserAccessLevel('lists.listByView') < ACCESS_LEVEL_READ)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                    return;
                }
                $this->showList();
                break;

            case 'saveListAccess':
                if ($this->getUserAccessLevel('lists.listByView') < ACCESS_LEVEL_EDIT)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                    return;
                }
                $this->onSaveListAccess();
                break;

            /* Add to list popup. */
            case 'quickActionAddToListModal':
                if ($this->getUserAccessLevel('lists.listByView') < ACCESS_LEVEL_EDIT)
                {
                    CommonErrors::fatalModal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                    return;
                }
                $this->quickActionAddToListModal();
                break;

            /* Add to list popup via datagrid. */
            case 'addToListFromDatagridModal':
                if ($this->getUserAccessLevel('lists.listByView') < ACCESS_LEVEL_EDIT)
                {
                    CommonErrors::fatalModal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                    return;
                }
                $this->addToListFromDatagridModal();
                break;

            case 'removeFromListDatagrid':
                if ($this->getUserAccessLevel('lists.listByView') < ACCESS_LEVEL_EDIT)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                    return;
                }
                $this->removeFromListDatagrid();
                break;

            case 'deleteStaticList':
                if ($this->getUserAccessLevel('lists.listByView') < ACCESS_LEVEL_DELETE)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                    return;
                }
                $this->onDeleteStaticList();
                break;

            /* Main list page. */
            case 'listByView':
            default:
                if ($this->getUserAccessLevel('lists.listByView') < ACCESS_LEVEL_READ)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                    return;
                }
                $this->listByView();
                break;
        }
    }

    /*
     * Called by handleRequest() to process loading the list / main page.
     */
    private function listByView()
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));
        $isModernJSON = ($responseFormat === 'modern-json');

        if ($isModernJSON)
        {
            if ($modernPage !== '' && $modernPage !== 'lists-manage')
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

            $this->renderModernListsManageJSON('lists-manage');
            return;
        }

        /* First, if we are operating in HR mode we will never see the
           companies pager.  Immediantly forward to My Company. */

        $dataGridProperties = DataGrid::getRecentParamaters("lists:ListsDataGrid");

        /* If this is the first time we visited the datagrid this session, the recent paramaters will
         * be empty.  Fill in some default values. */
        if ($dataGridProperties == array())
        {
            $dataGridProperties = array('rangeStart'    => 0,
                                        'maxResults'    => 15,
                                        'filterVisible' => false);
        }

        $dataGrid = DataGrid::get("lists:ListsDataGrid", $dataGridProperties);

        $this->_template->assign('active', $this);
        $this->_template->assign('dataGrid', $dataGrid);
        $this->_template->assign('userID', $_SESSION['CATS']->getUserID());

        if (!eval(Hooks::get('LISTS_LIST_BY_VIEW'))) return;

        $this->_template->display('./modules/lists/Lists.tpl');
    }

    private function renderModernListsManageJSON($modernPage)
    {
        $db = DatabaseConnection::getInstance();
        $baseURL = CATSUtility::getIndexName();
        $siteID = (int) $this->_siteID;
        $currentUserID = (int) $this->_userID;

        $savedLists = new SavedLists($this->_siteID);
        $hasListAccessSchema = $savedLists->hasListAccessSchema();
        $canBypassVisibility = ($this->getUserAccessLevel('lists.listByView') >= ACCESS_LEVEL_DELETE);

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
        $dataItemTypeFilter = (int) $this->getTrimmedInput('dataItemType', $_GET);
        if (!in_array($dataItemTypeFilter, array(DATA_ITEM_CANDIDATE, DATA_ITEM_JOBORDER, DATA_ITEM_COMPANY, DATA_ITEM_CONTACT), true))
        {
            $dataItemTypeFilter = 0;
        }

        $listType = strtolower(trim($this->getTrimmedInput('listType', $_GET)));
        if ($listType !== 'static' && $listType !== 'dynamic')
        {
            $listType = 'all';
        }

        $sortMap = array(
            'description' => 'saved_list.description',
            'count' => 'saved_list.number_entries',
            'dataType' => 'saved_list.data_item_type',
            'listType' => 'saved_list.is_dynamic',
            'owner' => 'ownerSort',
            'dateCreated' => 'saved_list.date_created',
            'dateModified' => 'saved_list.date_modified'
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
            'saved_list.site_id = ' . $db->makeQueryInteger($siteID)
        );

        if ($dataItemTypeFilter > 0)
        {
            $whereConditions[] = 'saved_list.data_item_type = ' . $db->makeQueryInteger($dataItemTypeFilter);
        }

        if ($listType === 'static')
        {
            $whereConditions[] = 'saved_list.is_dynamic = 0';
        }
        else if ($listType === 'dynamic')
        {
            $whereConditions[] = 'saved_list.is_dynamic = 1';
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
                "(saved_list.description LIKE %s ESCAPE '\\\\'
                OR owner_user.first_name LIKE %s ESCAPE '\\\\'
                OR owner_user.last_name LIKE %s ESCAPE '\\\\')",
                $db->makeQueryString($quickSearchLike),
                $db->makeQueryString($quickSearchLike),
                $db->makeQueryString($quickSearchLike)
            );
        }

        if ($hasListAccessSchema && !$canBypassVisibility)
        {
            $whereConditions[] = sprintf(
                "(
                    saved_list.created_by = %1\$s
                    OR
                    NOT EXISTS (
                        SELECT 1
                        FROM saved_list_user_access access_exists
                        WHERE
                            access_exists.site_id = saved_list.site_id
                        AND
                            access_exists.saved_list_id = saved_list.saved_list_id
                    )
                    OR
                    EXISTS (
                        SELECT 1
                        FROM saved_list_user_access list_access
                        WHERE
                            list_access.site_id = saved_list.site_id
                        AND
                            list_access.saved_list_id = saved_list.saved_list_id
                        AND
                            list_access.user_id = %1\$s
                    )
                )",
                $db->makeQueryInteger($currentUserID)
            );
        }

        $whereSQL = implode(' AND ', $whereConditions);
        $orderSQL = sprintf('%s %s, saved_list.saved_list_id DESC', $sortMap[$sortBy], $sortDirection);

        $sql = sprintf(
            "SELECT SQL_CALC_FOUND_ROWS
                saved_list.saved_list_id AS savedListID,
                saved_list.description AS description,
                saved_list.data_item_type AS dataItemType,
                saved_list.is_dynamic AS isDynamic,
                saved_list.number_entries AS numberEntries,
                saved_list.created_by AS createdBy,
                DATE_FORMAT(saved_list.date_created, '%%m-%%d-%%y') AS dateCreated,
                DATE_FORMAT(saved_list.date_modified, '%%m-%%d-%%y') AS dateModified,
                owner_user.first_name AS ownerFirstName,
                owner_user.last_name AS ownerLastName,
                CONCAT(COALESCE(owner_user.last_name, ''), COALESCE(owner_user.first_name, '')) AS ownerSort
            FROM
                saved_list
            LEFT JOIN user AS owner_user
                ON saved_list.created_by = owner_user.user_id
            WHERE
                %s
            ORDER BY
                %s
            LIMIT
                %s, %s",
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

        $dataItemTypeLabels = array(
            DATA_ITEM_CANDIDATE => 'Candidates',
            DATA_ITEM_JOBORDER => 'Job Orders',
            DATA_ITEM_COMPANY => 'Companies',
            DATA_ITEM_CONTACT => 'Contacts'
        );

        $responseRows = array();
        foreach ($rows as $row)
        {
            $savedListID = (int) (isset($row['savedListID']) ? $row['savedListID'] : 0);
            if ($savedListID <= 0)
            {
                continue;
            }

            $dataItemType = (int) (isset($row['dataItemType']) ? $row['dataItemType'] : 0);
            $isDynamic = ((int) (isset($row['isDynamic']) ? $row['isDynamic'] : 0) === 1);
            $canEditList = $savedLists->canUserEditList($savedListID, $currentUserID);
            $canManageListAccess = $savedLists->canUserManageListAccess($savedListID, $currentUserID);
            $listAccessRestricted = ($hasListAccessSchema ? $savedLists->hasExplicitAccessRows($savedListID) : false);

            $responseRows[] = array(
                'savedListID' => $savedListID,
                'description' => (isset($row['description']) ? (string) $row['description'] : ''),
                'dataItemType' => $dataItemType,
                'dataItemTypeLabel' => (isset($dataItemTypeLabels[$dataItemType]) ? $dataItemTypeLabels[$dataItemType] : 'Unknown'),
                'isDynamic' => $isDynamic,
                'listTypeLabel' => ($isDynamic ? 'Dynamic' : 'Static'),
                'numberEntries' => (int) (isset($row['numberEntries']) ? $row['numberEntries'] : 0),
                'ownerName' => trim(
                    (isset($row['ownerFirstName']) ? (string) $row['ownerFirstName'] : '') .
                    ' ' .
                    (isset($row['ownerLastName']) ? (string) $row['ownerLastName'] : '')
                ),
                'dateCreated' => (isset($row['dateCreated']) ? (string) $row['dateCreated'] : ''),
                'dateModified' => (isset($row['dateModified']) ? (string) $row['dateModified'] : ''),
                'canEdit' => ((bool) $canEditList),
                'canManageAccess' => ((bool) $canManageListAccess),
                'listAccessRestricted' => ((bool) $listAccessRestricted),
                'canDelete' => ($this->getUserAccessLevel('lists.listByView') >= ACCESS_LEVEL_DELETE && $canManageListAccess),
                'showURL' => sprintf('%s?m=lists&a=showList&savedListID=%d', $baseURL, $savedListID),
                'showLegacyURL' => sprintf('%s?m=lists&a=showList&savedListID=%d&ui=legacy', $baseURL, $savedListID),
                'deleteLegacyURL' => sprintf('%s?m=lists&a=deleteStaticList&savedListID=%d&ui=legacy', $baseURL, $savedListID)
            );
        }

        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'lists.listByView.v1',
                'modernPage' => $modernPage,
                'page' => (int) $page,
                'totalPages' => (int) $totalPages,
                'totalRows' => (int) $totalRows,
                'entriesPerPage' => (int) $entriesPerPage,
                'sortBy' => $sortBy,
                'sortDirection' => $sortDirection,
                'permissions' => array(
                    'canCreateList' => ($this->getUserAccessLevel('lists.listByView') >= ACCESS_LEVEL_EDIT),
                    'canDeleteList' => ($this->getUserAccessLevel('lists.listByView') >= ACCESS_LEVEL_DELETE),
                    'hasListAccessSchema' => ((bool) $hasListAccessSchema)
                )
            ),
            'filters' => array(
                'quickSearch' => $quickSearch,
                'dataItemType' => (int) $dataItemTypeFilter,
                'listType' => $listType
            ),
            'options' => array(
                'dataItemTypes' => array(
                    array('value' => 0, 'label' => 'All Data Types'),
                    array('value' => DATA_ITEM_CANDIDATE, 'label' => 'Candidates'),
                    array('value' => DATA_ITEM_JOBORDER, 'label' => 'Job Orders'),
                    array('value' => DATA_ITEM_COMPANY, 'label' => 'Companies'),
                    array('value' => DATA_ITEM_CONTACT, 'label' => 'Contacts')
                ),
                'listTypes' => array(
                    array('value' => 'all', 'label' => 'All Lists'),
                    array('value' => 'static', 'label' => 'Static'),
                    array('value' => 'dynamic', 'label' => 'Dynamic')
                )
            ),
            'actions' => array(
                'legacyURL' => sprintf('%s?m=lists&a=listByView&ui=legacy', $baseURL),
                'ajaxEndpointURL' => 'ajax.php'
            ),
            'sessionCookie' => $_SESSION['CATS']->getCookie(),
            'rows' => $responseRows
        );

        if (!headers_sent())
        {
            header('Content-Type: application/json; charset=' . AJAX_ENCODING);
            header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        }
        echo json_encode($payload);
    }

    /*
     * Called by handleRequest() to process loading the static list display.
     */

    private function showList()
    {
        /* Bail out if we don't have a valid candidate ID. */
        if (!$this->isRequiredIDValid('savedListID', $_GET))
        {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this);
            return;
            //$this->fatalModal('Invalid saved list ID.');
        }

        //$dateAvailable = $this->getTrimmedInput('dateAvailable', $_POST);

        $savedListID = $_GET['savedListID'];

        $savedLists = new SavedLists($this->_siteID);

        $listRS = $savedLists->get($savedListID);
        if (empty($listRS))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid saved list ID.');
            return;
        }

        if (!$savedLists->canUserViewList($savedListID, $this->_userID))
        {
            CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'You do not have permission to view this list.');
            return;
        }

        if ($listRS['isDynamic'] == 0)
        {
            // Handle each kind of static list here:

            switch($listRS['dataItemType'])
            {
                case DATA_ITEM_CANDIDATE:
                    $dataGridInstance = 'candidates:candidatesSavedListByViewDataGrid';
                    break;

                case DATA_ITEM_COMPANY:
                    $dataGridInstance = 'companies:companiesSavedListByViewDataGrid';
                    break;

                case DATA_ITEM_CONTACT:
                    $dataGridInstance = 'contacts:contactSavedListByViewDataGrid';
                    break;

                case DATA_ITEM_JOBORDER:
                    $dataGridInstance = 'joborders:joborderSavedListByViewDataGrid';
                    break;
            }
        }

        $dataGridProperties = DataGrid::getRecentParamaters($dataGridInstance, $savedListID);

        /* If this is the first time we visited the datagrid this session, the recent paramaters will
         * be empty.  Fill in some default values. */
        if ($dataGridProperties == array())
        {
            $dataGridProperties = array('rangeStart'    => 0,
                                        'maxResults'    => 15,
                                        'filterVisible' => false,
                                        'savedListStatic' => true);
        }

        /* Add an MRU entry. */
        $_SESSION['CATS']->getMRU()->addEntry(
            DATA_ITEM_LIST, $savedListID, $listRS['description']
        );

        $dataGrid = DataGrid::get($dataGridInstance, $dataGridProperties, $savedListID);

        $canEditList = (
            $this->getUserAccessLevel('lists.listByView') >= ACCESS_LEVEL_EDIT
            && $savedLists->canUserEditList($savedListID, $this->_userID)
        );
        $canManageListAccess = $savedLists->canUserManageListAccess($savedListID, $this->_userID);

        $listAccessUsersRS = array();
        $listAccessMap = array();
        $listAccessRestricted = false;
        if ($savedLists->hasListAccessSchema())
        {
            $listAccessRestricted = $savedLists->hasExplicitAccessRows($savedListID);
        }

        if ($canManageListAccess)
        {
            $users = new Users($this->_siteID);
            $listAccessUsersRS = $users->getSelectList();

            $listAccessRS = $savedLists->getUserAccessRows($savedListID);
            foreach ($listAccessRS as $row)
            {
                $listAccessMap[(int) $row['userID']] = array(
                    'canEdit' => ((int) $row['canEdit'] > 0 ? 1 : 0)
                );
            }
        }

        $this->_template->assign('active', $this);
        $this->_template->assign('dataGrid', $dataGrid);
        $this->_template->assign('listRS', $listRS);
        $this->_template->assign('userID', $_SESSION['CATS']->getUserID());
        $this->_template->assign('canEditList', ($canEditList ? 1 : 0));
        $this->_template->assign('canManageListAccess', ($canManageListAccess ? 1 : 0));
        $this->_template->assign('listAccessUsersRS', $listAccessUsersRS);
        $this->_template->assign('listAccessMap', $listAccessMap);
        $this->_template->assign('listAccessRestricted', ($listAccessRestricted ? 1 : 0));
        $this->_template->assign('listAccessMessage', $this->getTrimmedInput('listAccessMessage', $_GET));
        $this->_template->assign('listAccessSchemaAvailable', ($savedLists->hasListAccessSchema() ? 1 : 0));

        $this->_template->display('./modules/lists/List.tpl');

    }

    /*
     * Called by handleRequest to process loading the add to list popup window.
     */
    private function quickActionAddToListModal()
    {
        /* Bail out if we don't have a valid type. */
        if (!$this->isRequiredIDValid('dataItemType', $_GET))
        {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this);
            return;
        }

        /* Bail out if we don't have a valid id. */
        if (!$this->isRequiredIDValid('dataItemID', $_GET))
        {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this);
            return;
        }

        $dataItemType = $_GET['dataItemType'];
        $dataItemID = $_GET['dataItemID'];
        $dataItemIDArray = array($dataItemID);

        $savedLists = new SavedLists($this->_siteID);

        $savedListsRS = $savedLists->getAllForUser($this->_userID, $dataItemType, STATIC_LISTS, true);

        $dataItemDesc = TemplateUtility::getDataItemTypeDescription($dataItemType);

        $responseFormat = strtolower(trim($this->getTrimmedInput('format', $_GET)));
        $modernPage = strtolower(trim($this->getTrimmedInput('modernPage', $_GET)));
        if ($responseFormat === 'modern-json')
        {
            if ($modernPage !== '' && $modernPage !== 'lists-quick-action-add')
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

            $savedListValues = array();
            foreach ($savedListsRS as $savedList)
            {
                $savedListValues[] = array(
                    'savedListID' => (int) $savedList['savedListID'],
                    'description' => (isset($savedList['description']) ? $savedList['description'] : ''),
                    'numberEntries' => (int) $savedList['numberEntries']
                );
            }

            $payload = array(
                'meta' => array(
                    'contractVersion' => 1,
                    'contractKey' => 'lists.quickActionAddToList.v1',
                    'modernPage' => 'lists-quick-action-add'
                ),
                'dataItem' => array(
                    'type' => (int) $dataItemType,
                    'typeLabel' => $dataItemDesc,
                    'ids' => array_map('intval', $dataItemIDArray)
                ),
                'permissions' => array(
                    'canManageLists' => ($this->getUserAccessLevel('lists.listByView') >= ACCESS_LEVEL_EDIT),
                    'canDeleteLists' => ($this->getUserAccessLevel('lists.listByView') >= ACCESS_LEVEL_DELETE)
                ),
                'sessionCookie' => $_SESSION['CATS']->getCookie(),
                'lists' => $savedListValues
            );

            if (!headers_sent())
            {
                header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
            }
            echo json_encode($payload);
            return;
        }

        $this->_template->assign('dataItemDesc', $dataItemDesc);
        $this->_template->assign('savedListsRS', $savedListsRS);
        $this->_template->assign('dataItemType', $dataItemType);
        $this->_template->assign('dataItemIDArray', $dataItemIDArray);
        $this->_template->assign('sessionCookie', $_SESSION['CATS']->getCookie());
        $this->_template->assign('canManageLists', ($this->getUserAccessLevel('lists.listByView') >= ACCESS_LEVEL_EDIT));
        $this->_template->assign('canDeleteLists', ($this->getUserAccessLevel('lists.listByView') >= ACCESS_LEVEL_DELETE));

        $this->_template->display('./modules/lists/QuickActionAddToListModal.tpl');
    }

    /*
     * Called by handleRequest to process loading the add to list popup window from a datagrid.
     */
    private function addToListFromDatagridModal()
    {
        /* Bail out if we don't have a valid type. */
        if (!$this->isRequiredIDValid('dataItemType', $_GET))
        {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this);
            return;
        }

        $dataGrid = DataGrid::getFromRequest();

        $dataItemIDArray = $dataGrid->getExportIDs();

        /* Validate each ID */
        foreach ($dataItemIDArray as $index => $dataItemID)
        {
            if (!$this->isRequiredIDValid($index, $dataItemIDArray))
            {
                CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid data item ID.');
                return;
            }
        }

        $dataItemType = $_GET['dataItemType'];

        $savedLists = new SavedLists($this->_siteID);

        $savedListsRS = $savedLists->getAllForUser($this->_userID, $dataItemType, STATIC_LISTS, true);

        $dataItemDesc = TemplateUtility::getDataItemTypeDescription($dataItemType);

        $responseFormat = strtolower(trim($this->getTrimmedInput('format', $_GET)));
        $modernPage = strtolower(trim($this->getTrimmedInput('modernPage', $_GET)));
        if ($responseFormat === 'modern-json')
        {
            if ($modernPage !== '' && $modernPage !== 'lists-quick-action-add')
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

            $savedListValues = array();
            foreach ($savedListsRS as $savedList)
            {
                $savedListValues[] = array(
                    'savedListID' => (int) $savedList['savedListID'],
                    'description' => (isset($savedList['description']) ? $savedList['description'] : ''),
                    'numberEntries' => (int) $savedList['numberEntries']
                );
            }

            $payload = array(
                'meta' => array(
                    'contractVersion' => 1,
                    'contractKey' => 'lists.quickActionAddToList.v1',
                    'modernPage' => 'lists-quick-action-add'
                ),
                'dataItem' => array(
                    'type' => (int) $dataItemType,
                    'typeLabel' => $dataItemDesc,
                    'ids' => array_map('intval', $dataItemIDArray)
                ),
                'permissions' => array(
                    'canManageLists' => ($this->getUserAccessLevel('lists.listByView') >= ACCESS_LEVEL_EDIT),
                    'canDeleteLists' => ($this->getUserAccessLevel('lists.listByView') >= ACCESS_LEVEL_DELETE)
                ),
                'sessionCookie' => $_SESSION['CATS']->getCookie(),
                'lists' => $savedListValues
            );

            if (!headers_sent())
            {
                header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
            }
            echo json_encode($payload);
            return;
        }

        $this->_template->assign('dataItemDesc', $dataItemDesc);
        $this->_template->assign('savedListsRS', $savedListsRS);
        $this->_template->assign('dataItemType', $dataItemType);
        $this->_template->assign('dataItemIDArray', $dataItemIDArray);
        $this->_template->assign('sessionCookie', $_SESSION['CATS']->getCookie());
        $this->_template->assign('canManageLists', ($this->getUserAccessLevel('lists.listByView') >= ACCESS_LEVEL_EDIT));
        $this->_template->assign('canDeleteLists', ($this->getUserAccessLevel('lists.listByView') >= ACCESS_LEVEL_DELETE));

        $this->_template->display('./modules/lists/QuickActionAddToListModal.tpl');
    }

    /*
     * Called by handleRequest to process the remove items from datagrid popup.
     */
    private function removeFromListDatagrid()
    {
        /* Bail out if we don't have a valid type. */
        if (!$this->isRequiredIDValid('dataItemType', $_GET))
        {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this);
            return;
        }

        $dataGrid = DataGrid::getFromRequest();

        $dataItemIDArray = $dataGrid->getExportIDs();

        /* Validate each ID */
        foreach ($dataItemIDArray as $index => $dataItemID)
        {
            if (!$this->isRequiredIDValid($index, $dataItemIDArray))
            {
                CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid data item ID.');
                return;
            }
        }

        $dataItemType = $_GET['dataItemType'];

        $dataItemDesc = TemplateUtility::getDataItemTypeDescription($dataItemType);

        if (!$this->isRequiredIDValid('savedListID', $_GET))
        {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid saved list ID.');
            return;
        }

        $savedListID = $_GET['savedListID'];

        /* Remove the items */
        $savedLists = new SavedLists($this->_siteID);
        if (!$savedLists->canUserEditList($savedListID, $this->_userID))
        {
            CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'You do not have permission to edit this list.');
            return;
        }

        $dataItemIDArrayTemp = array();
        foreach ($dataItemIDArray as $dataItemID)
        {
            $dataItemIDArrayTemp[] = $dataItemID;
            /* Because its too slow adding 1 item at a time, we do it in spurts of 200 items. */
            if (count($dataItemIDArrayTemp) > 200)
            {
                $savedLists->removeEntryMany($savedListID, $dataItemIDArrayTemp);
                $dataItemIDArrayTemp = array();
            }
        }
        if (count($dataItemIDArrayTemp) > 0)
        {
            $savedLists->removeEntryMany($savedListID, $dataItemIDArrayTemp);
        }

        /* Redirect to the saved list page we were on. */
        /* FIXME: What if we are on the last page? */
        CATSUtility::transferRelativeURI('m=lists&a=showList&savedListID='.$savedListID);
    }

    /*
     * Called by handleRequest to delete a list.
     */
    private function onDeleteStaticList()
    {
        /* Bail out if we don't have a valid type. */
        if (!$this->isRequiredIDValid('savedListID', $_GET))
        {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this);
            return;
        }

        $savedListID = $_GET['savedListID'];

        $savedLists = new SavedLists($this->_siteID);
        if (!$savedLists->canUserManageListAccess($savedListID, $this->_userID))
        {
            CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'You do not have permission to delete this list.');
            return;
        }

        /* Write changes. */
        $savedLists->delete($savedListID);


        CATSUtility::transferRelativeURI('m=lists');
    }

    private function onSaveListAccess()
    {
        if (!$this->isPostBack())
        {
            CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid request method.');
            return;
        }

        if (!$this->isRequiredIDValid('savedListID', $_POST))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid saved list ID.');
            return;
        }

        $savedListID = (int) $_POST['savedListID'];
        $savedLists = new SavedLists($this->_siteID);
        if (!$savedLists->hasListAccessSchema())
        {
            CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'List access schema is not available yet. Apply migrations first.');
            return;
        }
        if (!$savedLists->canUserManageListAccess($savedListID, $this->_userID))
        {
            CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'You do not have permission to manage list access.');
            return;
        }

        $listRS = $savedLists->get($savedListID);
        if (empty($listRS))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid saved list ID.');
            return;
        }

        $isRestricted = $this->isChecked('isRestricted', $_POST);
        $allowedUsers = array();
        $users = new Users($this->_siteID);
        foreach ($users->getSelectList() as $userRow)
        {
            $allowedUsers[(int) $userRow['userID']] = true;
        }

        $assignments = array();
        if ($isRestricted)
        {
            $enabledUsers = array();
            if (isset($_POST['accessEnabled']) && is_array($_POST['accessEnabled']))
            {
                foreach ($_POST['accessEnabled'] as $userID)
                {
                    $enabledUsers[] = (int) $userID;
                }
            }

            $accessMode = array();
            if (isset($_POST['accessMode']) && is_array($_POST['accessMode']))
            {
                $accessMode = $_POST['accessMode'];
            }

            foreach ($enabledUsers as $userID)
            {
                if ($userID <= 0 || !isset($allowedUsers[$userID]))
                {
                    continue;
                }

                $mode = 'view';
                if (isset($accessMode[$userID]))
                {
                    $mode = strtolower(trim($accessMode[$userID]));
                }
                $assignments[$userID] = ($mode === 'edit' ? 1 : 0);
            }
        }

        $savedLists->replaceUserAccessRows(
            $savedListID,
            (int) $listRS['createdBy'],
            $assignments
        );

        $message = 'List access updated.';
        if (!$isRestricted)
        {
            $message = 'List access set to default (visible to all list users).';
        }
        else if (empty($assignments))
        {
            $message = 'Restricted mode enabled but no users selected (owner/admin only).';
        }

        CATSUtility::transferRelativeURI(
            'm=lists&a=showList&savedListID=' . $savedListID
            . '&listAccessMessage=' . urlencode($message)
        );
    }
}

?>
