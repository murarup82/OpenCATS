<?php
/*
 * CATS
 * Candidates Module
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
 * $Id: CandidatesUI.php 3810 2007-12-05 19:13:25Z brian $
 */

include_once(LEGACY_ROOT . '/lib/FileUtility.php');
include_once(LEGACY_ROOT . '/lib/StringUtility.php');
include_once(LEGACY_ROOT . '/lib/DatabaseConnection.php');
include_once(LEGACY_ROOT . '/lib/ResultSetUtility.php');
include_once(LEGACY_ROOT . '/lib/DateUtility.php'); /* Depends on StringUtility. */
include_once(LEGACY_ROOT . '/lib/Candidates.php');
include_once(LEGACY_ROOT . '/lib/Pipelines.php');
include_once(LEGACY_ROOT . '/lib/Attachments.php');
include_once(LEGACY_ROOT . '/lib/ActivityEntries.php');
include_once(LEGACY_ROOT . '/lib/JobOrders.php');
include_once(LEGACY_ROOT . '/lib/Export.php');
include_once(LEGACY_ROOT . '/lib/ExtraFields.php');
include_once(LEGACY_ROOT . '/lib/GDPRSettings.php');
include_once(LEGACY_ROOT . '/lib/Calendar.php');
include_once(LEGACY_ROOT . '/lib/SavedLists.php');
include_once(LEGACY_ROOT . '/lib/EmailTemplates.php');
include_once(LEGACY_ROOT . '/lib/DocumentToText.php');
include_once(LEGACY_ROOT . '/lib/DatabaseSearch.php');
include_once(LEGACY_ROOT . '/lib/CommonErrors.php');
include_once(LEGACY_ROOT . '/lib/License.php');
include_once(LEGACY_ROOT . '/lib/ParseUtility.php');
include_once(LEGACY_ROOT . '/lib/Questionnaire.php');
include_once(LEGACY_ROOT . '/lib/Tags.php');
include_once(LEGACY_ROOT . '/lib/Search.php');
include_once(LEGACY_ROOT . '/lib/CandidateMessages.php');

class CandidatesUI extends UserInterface
{
    /* Maximum number of characters of the candidate notes to show without the
     * user clicking "[More]"
     */
    const NOTES_MAXLEN = 500;

    /* Maximum number of characters of the candidate name to show on the main
     * contacts listing.
     */
    const TRUNCATE_KEYSKILLS = 30;
    const PROFILE_COMMENT_ACTIVITY_TYPE = 400;
    const PROFILE_COMMENT_MARKER = '[CANDIDATE_COMMENT]';
    const PROFILE_COMMENT_MAXLEN = 4000;


    public function __construct()
    {
        parent::__construct();

        $this->_authenticationRequired = true;
        $this->_moduleDirectory = 'candidates';
        $this->_moduleName = 'candidates';
        $this->_moduleTabText = 'Candidates';
        $this->_subTabs = array(
            'Add Candidate'     => CATSUtility::getIndexName() . '?m=candidates&amp;a=add*al=' . ACCESS_LEVEL_EDIT . '@candidates.add',
            'Search Candidates' => CATSUtility::getIndexName() . '?m=candidates&amp;a=search'
        );
    }


    public function handleRequest()
    {
        if (!eval(Hooks::get('CANDIDATES_HANDLE_REQUEST'))) return;

        $action = $this->getAction();
        switch ($action) {
            case 'show':
                if ($this->getUserAccessLevel('candidates.show') < ACCESS_LEVEL_READ) {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->show();
                break;

            case 'add':
                if ($this->getUserAccessLevel('candidates.add') < ACCESS_LEVEL_EDIT) {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                if ($this->isPostBack()) {
                    $this->onAdd();
                } else {
                    $this->add();
                }

                break;

            case 'edit':
                if ($this->getUserAccessLevel('candidates.edit') < ACCESS_LEVEL_EDIT) {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                if ($this->isPostBack()) {
                    $this->onEdit();
                } else {
                    $this->edit();
                }

                break;

            case 'saveSources':
                if ($this->getUserAccessLevel('candidates.edit') < ACCESS_LEVEL_EDIT) {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                if (!$this->isPostBack()) {
                    CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid request.');
                }
                $this->onSaveSources();
                break;

            case 'delete':
                if ($this->getUserAccessLevel('candidates.delete') < ACCESS_LEVEL_DELETE) {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->onDelete();
                break;

            case 'search':
                if ($this->getUserAccessLevel('candidates.search') < ACCESS_LEVEL_READ) {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                include_once(LEGACY_ROOT . '/lib/Search.php');

                if ($this->isGetBack()) {
                    $this->onSearch();
                } else {
                    $this->search();
                }

                break;

            case 'viewResume':
                if ($this->getUserAccessLevel('candidates.viewResume') < ACCESS_LEVEL_READ) {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                include_once(LEGACY_ROOT . '/lib/Search.php');

                $this->viewResume();
                break;

            /*
             * Search for a job order (in the modal window) for which to
             * consider a candidate.
             */
            case 'considerForJobSearch':
                if ($this->getUserAccessLevel('candidates.search') < ACCESS_LEVEL_EDIT) {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                include_once(LEGACY_ROOT . '/lib/Search.php');

                $this->considerForJobSearch();

                break;

            /*
             * Add candidate to pipeline after selecting a job order for which
             * to consider a candidate (in the modal window).
             */
            case 'addToPipeline':
                if ($this->getUserAccessLevel('pipelines.addToPipeline') < ACCESS_LEVEL_EDIT) {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->onAddToPipeline();
                break;

            case 'addCandidateTags':
                if ($this->getUserAccessLevel('candidates.addCandidateTags') < ACCESS_LEVEL_EDIT) {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                if ($this->isPostBack()) {
                    $this->onAddCandidateTags();
                } else {
                    $this->addCandidateTags();
                }
                break;

            case 'postMessage':
                if ($this->getUserAccessLevel('candidates.edit') < ACCESS_LEVEL_EDIT) {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->onPostCandidateMessage();
                break;

            case 'deleteMessageThread':
                if ($this->getUserAccessLevel('candidates.edit') < ACCESS_LEVEL_EDIT) {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->onDeleteCandidateMessageThread();
                break;

            case 'addProfileComment':
                if ($this->getUserAccessLevel('candidates.edit') < ACCESS_LEVEL_EDIT) {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->onAddProfileComment();
                break;

            /* Change candidate-joborder status. */
            case 'addActivityChangeStatus':
                if ($this->getUserAccessLevel('pipelines.addActivityChangeStatus') < ACCESS_LEVEL_EDIT) {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                if ($this->isPostBack()) {
                    $this->onAddActivityChangeStatus();
                } else {
                    $this->addActivityChangeStatus();
                }

                break;

            /* Remove a candidate from a pipeline. */
            case 'removeFromPipeline':
                if ($this->getUserAccessLevel('pipelines.removeFromPipeline') < ACCESS_LEVEL_DELETE) {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->onRemoveFromPipeline();
                break;

            case 'addEditImage':
                if ($this->getUserAccessLevel('candidates.addEditImage') < ACCESS_LEVEL_EDIT) {
                    CommonErrors::fatalModal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                if ($this->isPostBack()) {
                    $this->onAddEditImage();
                } else {
                    $this->addEditImage();
                }

                break;

            /* Add an attachment to the candidate. */
            case 'createAttachment':
                if ($this->getUserAccessLevel('candidates.createAttachment') < ACCESS_LEVEL_EDIT) {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }

                include_once(LEGACY_ROOT . '/lib/DocumentToText.php');

                if ($this->isPostBack()) {
                    $this->onCreateAttachment();
                } else {
                    $this->createAttachment();
                }

                break;

            /* Administrators can hide a candidate from a site with this action. */
            case 'administrativeHideShow':
                if ($this->getUserAccessLevel('candidates.hidden') < ACCESS_LEVEL_MULTI_SA) {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->administrativeHideShow();
                break;

            /* Delete a candidate attachment */
            case 'deleteAttachment':
                if ($this->getUserAccessLevel('candidates.deleteAttachment') < ACCESS_LEVEL_DELETE) {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->onDeleteAttachment();
                break;

            /* Hot List Page */
            /* FIXME: function savedList() missing
            case 'savedLists':
                if ($this->getUserAccessLevel('candidates.savedLists') < ACCESS_LEVEL_READ)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->savedList();
                break;
            */

            case 'emailCandidates':
                if ($this->getUserAccessLevel('candidates.emailCandidates') < ACCESS_LEVEL_READ) {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                if ($this->getUserAccessLevel('candidates.emailCandidates') < ACCESS_LEVEL_SA) {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Sorry, but you are not allowed to send e-mails.');
                }
                $this->onEmailCandidates();
                break;

            case 'show_questionnaire':
                if ($this->getUserAccessLevel('candidates.show_questionnaire') < ACCESS_LEVEL_READ) {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->onShowQuestionnaire();
                break;

            case 'linkDuplicate':
                if ($this->getUserAccessLevel('candidates.duplicates') < ACCESS_LEVEL_SA) {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->findDuplicateCandidateSearch();
                break;

            /* Merge two duplicate candidates into the older one */
            case 'merge':
                if ($this->getUserAccessLevel('candidates.duplicates') < ACCESS_LEVEL_SA) {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->mergeDuplicates();
                break;

            case 'mergeInfo':
                if ($this->getUserAccessLevel('candidates.duplicates') < ACCESS_LEVEL_SA) {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->mergeDuplicatesInfo();
                break;

            /* Remove duplicity warning from a new candidate */
            case 'removeDuplicity':
                if ($this->getUserAccessLevel('candidates.duplicates') < ACCESS_LEVEL_SA) {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->removeDuplicity();
                break;

            case 'addDuplicates':
                if ($this->getUserAccessLevel('candidates.duplicates') < ACCESS_LEVEL_SA) {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->addDuplicates();
                break;

            /* Main candidates page. */
            case 'listByView':
            default:
                if ($this->getUserAccessLevel('candidates.list') < ACCESS_LEVEL_READ) {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->listByView();
                break;
        }
    }




    /*
     * Called by external modules for adding candidates.
     */
    public function publicAddCandidate($isModal, $transferURI, $moduleDirectory)
    {
        if ($this->getUserAccessLevel('candidates.add') < ACCESS_LEVEL_EDIT) {
            CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
        }

        $candidateID = $this->_addCandidate($isModal, $moduleDirectory);

        if ($candidateID <= 0) {
            CommonErrors::fatalModal(COMMONERROR_RECORDERROR, $this, 'Failed to add candidate.');
        }

        $transferURI = str_replace(
            '__CANDIDATE_ID__',
            $candidateID,
            $transferURI
        );
        CATSUtility::transferRelativeURI($transferURI);
    }


    /*
     * Called by external modules for processing the log activity / change
     * status dialog.
     */
    public function publicAddActivityChangeStatus($isJobOrdersMode, $regardingID, $moduleDirectory)
    {
        if ($this->getUserAccessLevel('pipelines.addActivityChangeStatus') < ACCESS_LEVEL_EDIT) {
            CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
        }

        $this->_AddActivityChangeStatus(
            $isJobOrdersMode,
            $regardingID,
            $moduleDirectory
        );
    }

    /*
     * Called by handleRequest() to process loading the list / main page.
     */
    private function listByView($errMessage = '')
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));
        $isModernJSON = ($responseFormat === 'modern-json');

        // Log message that shows up on the top of the list page
        $topLog = '';
        $quickSearchQuery = '';

        if ($isModernJSON)
        {
            $dataGridProperties = array(
                'rangeStart'    => 0,
                'maxResults'    => 15,
                'filterVisible' => false,
                'filter'        => 'IsActive==1'
            );
            $this->applyModernListRequestToDataGridProperties($dataGridProperties);
        }
        else
        {
            $dataGridProperties = DataGrid::getRecentParamaters("candidates:candidatesListByViewDataGrid");

            /* If this is the first time we visited the datagrid this session, the recent paramaters will
             * be empty.  Fill in some default values. */
            if ($dataGridProperties == array())
            {
                $dataGridProperties = array(
                    'rangeStart'    => 0,
                    'maxResults'    => 15,
                    'filterVisible' => false,
                    'filter'        => 'IsActive==1'
                );
            }
        }

        if (isset($_GET['wildCardString']))
        {
            $quickSearchQuery = $this->getTrimmedInput('wildCardString', $_GET);
            $this->applyQuickSearchToDataGrid($dataGridProperties, $quickSearchQuery, $topLog);
        }
        else if (isset($dataGridProperties['quickSearchQuery']))
        {
            $quickSearchQuery = $dataGridProperties['quickSearchQuery'];
        }

        //$newParameterArray = $this->_parameters;
        $tags = new Tags($this->_siteID);
        $tagsRS = $tags->getAll();
        //foreach($tagsRS as $r) $r['link'] = DataGrid::_makeControlLink($newParameterArray);

        $dataGrid = DataGrid::get("candidates:candidatesListByViewDataGrid", $dataGridProperties);

        $candidates = new Candidates($this->_siteID);
        $totalCandidates = $candidates->getCount();
        $sourcesRS = $candidates->getPossibleSources();
        $sourceFilterValue = $dataGrid->getFilterValue('Source');

        if ($isModernJSON)
        {
            if ($modernPage !== '' && $modernPage !== 'candidates-list')
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

            $this->renderModernCandidatesListJSON(
                $dataGrid,
                $totalCandidates,
                $sourcesRS,
                $sourceFilterValue,
                $quickSearchQuery,
                $topLog,
                'candidates-list'
            );
            return;
        }

        $this->_template->assign('totalCandidates', $totalCandidates);
        $this->_template->assign('sourcesRS', $sourcesRS);
        $this->_template->assign('sourceFilterValue', $sourceFilterValue);

        $this->_template->assign('active', $this);
        $this->_template->assign('dataGrid', $dataGrid);
        $this->_template->assign('userID', $_SESSION['CATS']->getUserID());
        $this->_template->assign('errMessage', $errMessage);
        $this->_template->assign('topLog', $topLog);
        $this->_template->assign('quickSearchQuery', $quickSearchQuery);
        $this->_template->assign('tagsRS', $tagsRS);

        if (!eval(Hooks::get('CANDIDATE_LIST_BY_VIEW'))) return;

        $this->_template->display('./modules/candidates/Candidates.tpl');
    }

    private function applyModernListRequestToDataGridProperties(&$dataGridProperties)
    {
        $allowedRowsPerPage = array(15, 30, 50, 100);

        $maxResults = (int) $this->getTrimmedInput('maxResults', $_GET);
        if (!in_array($maxResults, $allowedRowsPerPage, true))
        {
            $maxResults = 15;
        }
        $dataGridProperties['maxResults'] = $maxResults;

        $page = (int) $this->getTrimmedInput('page', $_GET);
        if ($page > 0)
        {
            $dataGridProperties['rangeStart'] = ($page - 1) * $maxResults;
        }
        else
        {
            $rangeStart = (int) $this->getTrimmedInput('rangeStart', $_GET);
            if ($rangeStart < 0)
            {
                $rangeStart = 0;
            }
            $dataGridProperties['rangeStart'] = $rangeStart;
        }

        $sortBy = $this->getTrimmedInput('sortBy', $_GET);
        if ($sortBy !== '')
        {
            $dataGridProperties['sortBy'] = $sortBy;
        }

        $sortDirection = strtoupper($this->getTrimmedInput('sortDirection', $_GET));
        if ($sortDirection === 'ASC' || $sortDirection === 'DESC')
        {
            $dataGridProperties['sortDirection'] = $sortDirection;
        }

        $onlyMyCandidates = $this->getRequestBooleanFlag('onlyMyCandidates', false);
        $onlyHotCandidates = $this->getRequestBooleanFlag('onlyHotCandidates', false);
        $onlyGdprUnsigned = $this->getRequestBooleanFlag('onlyGdprUnsigned', false);
        $onlyInternalCandidates = $this->getRequestBooleanFlag('onlyInternalCandidates', false);
        $onlyActiveCandidates = $this->getRequestBooleanFlag('onlyActiveCandidates', true);
        $sourceFilter = $this->getTrimmedInput('sourceFilter', $_GET);

        $this->setDataGridFilter($dataGridProperties, 'OwnerID', '==', (string) $this->_userID, $onlyMyCandidates);
        $this->setDataGridFilter($dataGridProperties, 'IsHot', '==', '1', $onlyHotCandidates);
        $this->setDataGridFilter($dataGridProperties, 'GdprSigned', '==', '0', $onlyGdprUnsigned);
        $this->setDataGridFilter($dataGridProperties, 'InternalCandidates', '=#', 'partner', $onlyInternalCandidates);
        $this->setDataGridFilter($dataGridProperties, 'IsActive', '==', '1', $onlyActiveCandidates);
        $this->setDataGridFilter($dataGridProperties, 'Source', '==', $sourceFilter, ($sourceFilter !== ''));
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

    private function setDataGridFilter(&$dataGridProperties, $columnName, $operator, $value, $enabled)
    {
        $existingFilter = '';
        if (isset($dataGridProperties['filter']) && is_string($dataGridProperties['filter']))
        {
            $existingFilter = $this->removeFilterColumnFromDataGrid(
                $dataGridProperties['filter'],
                $columnName
            );
        }

        if (!$enabled)
        {
            $dataGridProperties['filter'] = $existingFilter;
            return;
        }

        $nextFilter = urlencode((string) $columnName) . $operator . urlencode((string) $value);
        if ($existingFilter === '')
        {
            $dataGridProperties['filter'] = $nextFilter;
            return;
        }

        $dataGridProperties['filter'] = $existingFilter . ',' . $nextFilter;
    }

    private function renderModernCandidatesListJSON(
        $dataGrid,
        $totalCandidates,
        $sourcesRS,
        $sourceFilterValue,
        $quickSearchQuery,
        $topLog,
        $modernPage
    )
    {
        $baseURL = CATSUtility::getIndexName();
        $rows = $dataGrid->getRows();
        $parameters = $dataGrid->getParameters();

        $entriesPerPage = (isset($parameters['maxResults']) ? (int) $parameters['maxResults'] : 15);
        if ($entriesPerPage <= 0)
        {
            $entriesPerPage = 15;
        }

        $totalRows = (int) $dataGrid->getNumberOfRows();
        $totalPages = (int) ceil($totalRows / $entriesPerPage);
        if ($totalPages <= 0)
        {
            $totalPages = 1;
        }

        $page = (int) $dataGrid->getCurrentPage();
        if ($page <= 0)
        {
            $page = 1;
        }

        $responseRows = array();
        foreach ($rows as $row)
        {
            $candidateID = (isset($row['candidateID']) ? (int) $row['candidateID'] : 0);
            $firstName = (isset($row['firstName']) ? trim($row['firstName']) : '');
            $lastName = (isset($row['lastName']) ? trim($row['lastName']) : '');
            $fullName = trim($firstName . ' ' . $lastName);
            if ($fullName === '')
            {
                $fullName = '--';
            }

            $ownerName = trim(
                (isset($row['ownerFirstName']) ? $row['ownerFirstName'] : '') .
                ' ' .
                (isset($row['ownerLastName']) ? $row['ownerLastName'] : '')
            );
            if ($ownerName === '')
            {
                $ownerName = '--';
            }

            $responseRows[] = array(
                'candidateID' => $candidateID,
                'firstName' => ($firstName !== '' ? $firstName : '--'),
                'lastName' => ($lastName !== '' ? $lastName : '--'),
                'fullName' => $fullName,
                'city' => (isset($row['city']) && trim($row['city']) !== '' ? trim($row['city']) : '--'),
                'country' => (isset($row['country']) && trim($row['country']) !== '' ? trim($row['country']) : '--'),
                'keySkills' => (isset($row['keySkills']) ? trim($row['keySkills']) : ''),
                'source' => (isset($row['source']) && trim($row['source']) !== '' ? trim($row['source']) : '--'),
                'ownerName' => $ownerName,
                'createdDate' => (isset($row['dateCreated']) && trim($row['dateCreated']) !== '' ? trim($row['dateCreated']) : '--'),
                'modifiedDate' => (isset($row['dateModified']) && trim($row['dateModified']) !== '' ? trim($row['dateModified']) : '--'),
                'isHot' => (isset($row['isHot']) ? ((int) $row['isHot'] === 1) : false),
                'commentCount' => (isset($row['profileCommentCount']) ? (int) $row['profileCommentCount'] : 0),
                'hasAttachment' => (isset($row['attachmentPresent']) ? ((int) $row['attachmentPresent'] === 1) : false),
                'hasDuplicate' => (isset($row['duplicatePresent']) ? ((int) $row['duplicatePresent'] === 1) : false),
                'isSubmitted' => (isset($row['submitted']) ? ((int) $row['submitted'] === 1) : false),
                'candidateURL' => sprintf('%s?m=candidates&a=show&candidateID=%d&ui=modern', $baseURL, $candidateID),
                'candidateEditURL' => sprintf('%s?m=candidates&a=edit&candidateID=%d&ui=legacy', $baseURL, $candidateID),
                'addToListURL' => sprintf(
                    '%s?m=lists&a=quickActionAddToListModal&dataItemType=%d&dataItemID=%d&ui=legacy',
                    $baseURL,
                    DATA_ITEM_CANDIDATE,
                    $candidateID
                ),
                'addToJobOrderURL' => sprintf(
                    '%s?m=candidates&a=considerForJobSearch&candidateID=%d&ui=legacy',
                    $baseURL,
                    $candidateID
                )
            );
        }

        $sourceOptions = array(
            array('value' => '', 'label' => 'All'),
            array('value' => '(none)', 'label' => '(None)')
        );
        if (is_array($sourcesRS))
        {
            foreach ($sourcesRS as $sourceRow)
            {
                $sourceName = (isset($sourceRow['name']) ? trim($sourceRow['name']) : '');
                if ($sourceName === '' || $sourceName === '(none)')
                {
                    continue;
                }

                $sourceOptions[] = array(
                    'value' => $sourceName,
                    'label' => $sourceName
                );
            }
        }

        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'candidates.listByView.v1',
                'modernPage' => $modernPage,
                'page' => $page,
                'totalPages' => $totalPages,
                'totalRows' => $totalRows,
                'entriesPerPage' => $entriesPerPage,
                'totalCandidates' => (int) $totalCandidates,
                'sortBy' => (isset($parameters['sortBy']) ? (string) $parameters['sortBy'] : ''),
                'sortDirection' => (isset($parameters['sortDirection']) ? (string) $parameters['sortDirection'] : ''),
                'permissions' => array(
                    'canAddCandidate' => ($this->getUserAccessLevel('candidates.add') >= ACCESS_LEVEL_EDIT),
                    'canEditCandidate' => ($this->getUserAccessLevel('candidates.edit') >= ACCESS_LEVEL_EDIT),
                    'canDeleteCandidate' => ($this->getUserAccessLevel('candidates.delete') >= ACCESS_LEVEL_DELETE),
                    'canAddToList' => ($this->getUserAccessLevel('lists.listByView') >= ACCESS_LEVEL_EDIT),
                    'canAddToJobOrder' => ($this->getUserAccessLevel('pipelines.addToPipeline') >= ACCESS_LEVEL_EDIT),
                    'canEmailCandidates' => (MAIL_MAILER != 0 &&
                        $this->getUserAccessLevel('candidates.emailCandidates') >= ACCESS_LEVEL_SA)
                )
            ),
            'filters' => array(
                'quickSearch' => (string) $quickSearchQuery,
                'sourceFilter' => (string) $sourceFilterValue,
                'onlyMyCandidates' => ((int) $dataGrid->getFilterValue('OwnerID') === (int) $this->_userID),
                'onlyHotCandidates' => ($dataGrid->getFilterValue('IsHot') === '1'),
                'onlyGdprUnsigned' => ($dataGrid->getFilterValue('GdprSigned') === '0'),
                'onlyInternalCandidates' => ($dataGrid->getFilterValue('InternalCandidates') !== ''),
                'onlyActiveCandidates' => ($dataGrid->getFilterValue('IsActive') === '1')
            ),
            'options' => array(
                'sources' => $sourceOptions
            ),
            'state' => array(
                'topLog' => trim(strip_tags((string) $topLog))
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

    private function renderModernCandidateShowJSON(
        $candidateID,
        $isPopup,
        $showClosedPipeline,
        $data,
        $extraFieldRS,
        $EEOValues,
        $attachmentsRS,
        $transformAttachments,
        $pipelinesRS,
        $calendarRS,
        $lists,
        $candidateComments,
        $candidateCommentCategories,
        $canAddCandidateComment,
        $candidateCommentsInitiallyOpen,
        $candidateCommentFlashMessage,
        $candidateCommentFlashIsError,
        $candidateMessagingEnabled,
        $candidateMessageThreadID,
        $candidateThreadVisibleToCurrentUser,
        $candidateThreadMessages,
        $candidateMessageMentionHintNames,
        $candidateMessageMentionAutocompleteValues,
        $candidateMessagesInitiallyOpen,
        $candidateMessageFlashMessage,
        $candidateMessageFlashIsError,
        $questionnaires,
        $gdprLatestRequest,
        $gdprDeletionRequired,
        $gdprSendEnabled,
        $gdprSendDisabled,
        $gdprSendDisabledReason,
        $gdprLegacyConsent,
        $gdprLegacyProof,
        $gdprLegacyProofWarning,
        $gdprFlashMessage,
        $assignedTags,
        $pipelineStatusRS,
        $addCommentToken,
        $postCandidateMessageToken,
        $deleteCandidateMessageThreadToken,
        $modernPage
    )
    {
        $baseURL = CATSUtility::getIndexName();
        $candidateID = (int) $candidateID;

        $fullName = trim(
            (isset($data['firstName']) ? $data['firstName'] : '') .
            ' ' .
            (isset($data['lastName']) ? $data['lastName'] : '')
        );
        if ($fullName === '')
        {
            $fullName = 'Candidate #' . $candidateID;
        }

        $notesHTML = (isset($data['notes']) ? (string) $data['notes'] : '');
        $notesText = trim(
            html_entity_decode(
                strip_tags(str_replace(array('<br />', '<br/>', '<br>'), "\n", $notesHTML)),
                ENT_QUOTES
            )
        );

        $profileImageURL = '';
        $attachmentsPayload = array();
        foreach ($attachmentsRS as $attachmentData)
        {
            $isProfileImage = ((int) $attachmentData['isProfileImage'] === 1);
            $retrievalURL = '';
            if (!empty($attachmentData['retrievalURL']))
            {
                $retrievalURL = html_entity_decode((string) $attachmentData['retrievalURL'], ENT_QUOTES);
            }
            else if (!empty($attachmentData['retrievalURLLocal']))
            {
                $retrievalURL = (string) $attachmentData['retrievalURLLocal'];
            }

            if ($isProfileImage)
            {
                if ($profileImageURL === '')
                {
                    $profileImageURL = $retrievalURL;
                }
                continue;
            }

            $attachmentsPayload[] = array(
                'attachmentID' => (int) $attachmentData['attachmentID'],
                'fileName' => (isset($attachmentData['originalFilename']) ? $attachmentData['originalFilename'] : ''),
                'dateCreated' => (isset($attachmentData['dateCreated']) ? $attachmentData['dateCreated'] : '--'),
                'retrievalURL' => $retrievalURL,
                'previewAvailable' => ((int) $attachmentData['hasText'] === 1),
                'previewURL' => sprintf(
                    '%s?m=candidates&a=viewResume&attachmentID=%d&ui=legacy',
                    $baseURL,
                    (int) $attachmentData['attachmentID']
                )
            );
        }

        $pipelinesPayload = array();
        $activePipelineCount = 0;
        $closedPipelineCount = 0;
        foreach ($pipelinesRS as $pipelineData)
        {
            $isActivePipeline = ((int) $pipelineData['isActive'] === 1);
            if ($isActivePipeline)
            {
                $activePipelineCount++;
            }
            else
            {
                $closedPipelineCount++;
            }

            $ownerName = trim(
                (isset($pipelineData['ownerAbbrName']) ? $pipelineData['ownerAbbrName'] : '') .
                ''
            );
            if ($ownerName === '')
            {
                $ownerName = trim(
                    (isset($pipelineData['ownerFirstName']) ? $pipelineData['ownerFirstName'] : '') .
                    ' ' .
                    (isset($pipelineData['ownerLastName']) ? $pipelineData['ownerLastName'] : '')
                );
            }
            if ($ownerName === '')
            {
                $ownerName = '--';
            }

            $addedByName = trim(
                (isset($pipelineData['addedByAbbrName']) ? $pipelineData['addedByAbbrName'] : '') .
                ''
            );
            if ($addedByName === '')
            {
                $addedByName = trim(
                    (isset($pipelineData['addedByFirstName']) ? $pipelineData['addedByFirstName'] : '') .
                    ' ' .
                    (isset($pipelineData['addedByLastName']) ? $pipelineData['addedByLastName'] : '')
                );
            }
            if ($addedByName === '')
            {
                $addedByName = '--';
            }

            $statusLabel = (isset($pipelineData['status']) ? trim($pipelineData['status']) : '--');
            if ($statusLabel === '')
            {
                $statusLabel = '--';
            }
            $statusSlug = strtolower(trim(preg_replace('/[^a-z0-9]+/i', '-', $statusLabel), '-'));
            if ($statusSlug === '')
            {
                $statusSlug = 'unknown';
            }

            $jobOrderID = (int) $pipelineData['jobOrderID'];
            $candidateJobOrderID = (int) $pipelineData['candidateJobOrderID'];

            $pipelinesPayload[] = array(
                'candidateJobOrderID' => $candidateJobOrderID,
                'jobOrderID' => $jobOrderID,
                'jobOrderTitle' => (isset($pipelineData['title']) ? $pipelineData['title'] : ''),
                'jobOrderURL' => sprintf(
                    '%s?m=joborders&a=show&jobOrderID=%d&ui=legacy',
                    $baseURL,
                    $jobOrderID
                ),
                'clientJobID' => (isset($pipelineData['clientJobID']) ? $pipelineData['clientJobID'] : ''),
                'companyID' => (int) $pipelineData['companyID'],
                'companyName' => (isset($pipelineData['companyName']) ? $pipelineData['companyName'] : ''),
                'companyURL' => sprintf(
                    '%s?m=companies&a=show&companyID=%d&ui=legacy',
                    $baseURL,
                    (int) $pipelineData['companyID']
                ),
                'ownerName' => $ownerName,
                'addedByName' => $addedByName,
                'statusID' => (int) $pipelineData['statusID'],
                'statusLabel' => $statusLabel,
                'statusSlug' => $statusSlug,
                'isActive' => $isActivePipeline,
                'dateCreated' => (isset($pipelineData['dateCreated']) ? $pipelineData['dateCreated'] : '--'),
                'ratingValue' => (isset($pipelineData['ratingValue']) ? (int) $pipelineData['ratingValue'] : 0),
                'actions' => array(
                    'changeStatusURL' => sprintf(
                        '%s?m=candidates&a=addActivityChangeStatus&candidateID=%d&jobOrderID=%d&ui=legacy',
                        $baseURL,
                        $candidateID,
                        $jobOrderID
                    ),
                    'removeFromPipelineURL' => sprintf(
                        '%s?m=candidates&a=removeFromPipeline&candidateID=%d&jobOrderID=%d&display=popup&ui=legacy',
                        $baseURL,
                        $candidateID,
                        $jobOrderID
                    ),
                    'pipelineDetailsURL' => sprintf(
                        '%s?m=joborders&a=pipelineStatusDetails&pipelineID=%d&ui=legacy',
                        $baseURL,
                        $candidateJobOrderID
                    )
                )
            );
        }

        $calendarPayload = array();
        foreach ($calendarRS as $calendarData)
        {
            $calendarPayload[] = array(
                'eventID' => (int) $calendarData['eventID'],
                'title' => (isset($calendarData['title']) ? $calendarData['title'] : ''),
                'dateShow' => (isset($calendarData['dateShow']) ? $calendarData['dateShow'] : '--'),
                'typeImage' => (isset($calendarData['typeImage']) ? $calendarData['typeImage'] : ''),
                'eventURL' => sprintf(
                    '%s?m=calendar&view=DAYVIEW&month=%s&year=20%s&day=%s&showEvent=%s&ui=legacy',
                    $baseURL,
                    (isset($calendarData['month']) ? $calendarData['month'] : ''),
                    (isset($calendarData['year']) ? $calendarData['year'] : ''),
                    (isset($calendarData['day']) ? $calendarData['day'] : ''),
                    (isset($calendarData['eventID']) ? $calendarData['eventID'] : '')
                )
            );
        }

        $extraFieldsPayload = array();
        foreach ($extraFieldRS as $extraFieldData)
        {
            $extraFieldsPayload[] = array(
                'fieldName' => (isset($extraFieldData['fieldName']) ? $extraFieldData['fieldName'] : ''),
                'display' => (isset($extraFieldData['display']) ? (string) $extraFieldData['display'] : '')
            );
        }

        $eeoValuesPayload = array();
        foreach ($EEOValues as $eeoValue)
        {
            $eeoValuesPayload[] = array(
                'fieldName' => (isset($eeoValue['fieldName']) ? $eeoValue['fieldName'] : ''),
                'fieldValue' => (isset($eeoValue['fieldValue']) ? $eeoValue['fieldValue'] : '')
            );
        }

        $listsPayload = array();
        foreach ($lists as $listData)
        {
            $listsPayload[] = array(
                'listID' => (int) $listData['listID'],
                'name' => (isset($listData['name']) ? $listData['name'] : ''),
                'url' => sprintf(
                    '%s?m=lists&a=showList&savedListID=%d&ui=legacy',
                    $baseURL,
                    (int) $listData['listID']
                )
            );
        }

        $commentsPayload = array();
        foreach ($candidateComments as $commentData)
        {
            $commentHTML = (isset($commentData['commentHTML']) ? (string) $commentData['commentHTML'] : '');
            $commentsPayload[] = array(
                'activityID' => (int) $commentData['activityID'],
                'dateCreated' => (isset($commentData['dateCreated']) ? $commentData['dateCreated'] : '--'),
                'enteredBy' => (isset($commentData['enteredBy']) ? $commentData['enteredBy'] : '--'),
                'category' => (isset($commentData['category']) ? $commentData['category'] : 'General'),
                'commentHTML' => $commentHTML,
                'commentText' => trim(
                    html_entity_decode(
                        strip_tags(str_replace(array('<br />', '<br/>', '<br>'), "\n", $commentHTML)),
                        ENT_QUOTES
                    )
                )
            );
        }

        $messageItemsPayload = array();
        foreach ($candidateThreadMessages as $messageData)
        {
            $bodyHTML = (isset($messageData['bodyHTML']) ? (string) $messageData['bodyHTML'] : '');
            $messageItemsPayload[] = array(
                'messageID' => (isset($messageData['messageID']) ? (int) $messageData['messageID'] : 0),
                'dateCreated' => (isset($messageData['dateCreated']) ? (string) $messageData['dateCreated'] : '--'),
                'senderName' => (isset($messageData['senderName']) ? (string) $messageData['senderName'] : '--'),
                'mentionedUsers' => (isset($messageData['mentionedUsers']) ? (string) $messageData['mentionedUsers'] : ''),
                'bodyHTML' => $bodyHTML,
                'bodyText' => trim(
                    html_entity_decode(
                        strip_tags(str_replace(array('<br />', '<br/>', '<br>'), "\n", $bodyHTML)),
                        ENT_QUOTES
                    )
                )
            );
        }

        $openInboxURL = sprintf('%s?m=home&a=inbox&ui=modern', $baseURL);
        if ((int) $candidateMessageThreadID > 0 && $candidateThreadVisibleToCurrentUser)
        {
            $openInboxURL = sprintf(
                '%s?m=home&a=inbox&threadKey=%s&ui=modern',
                $baseURL,
                rawurlencode('candidate:' . (int) $candidateMessageThreadID)
            );
        }

        $canDeleteMessageThread = (
            !$isPopup &&
            $candidateMessagingEnabled &&
            ((int) $candidateMessageThreadID > 0) &&
            $candidateThreadVisibleToCurrentUser &&
            ($this->getUserAccessLevel('candidates.edit') >= ACCESS_LEVEL_EDIT)
        );

        $duplicatePayload = array();
        if (isset($data['isDuplicate']) && is_array($data['isDuplicate']))
        {
            foreach ($data['isDuplicate'] as $duplicateData)
            {
                $duplicateID = (int) (isset($duplicateData['duplicateTo']) ? $duplicateData['duplicateTo'] : 0);
                if ($duplicateID <= 0)
                {
                    continue;
                }

                $duplicatePayload[] = array(
                    'candidateID' => $duplicateID,
                    'showURL' => sprintf(
                        '%s?m=candidates&a=show&candidateID=%d&ui=modern',
                        $baseURL,
                        $duplicateID
                    )
                );
            }
        }

        $questionnairesPayload = array();
        foreach ($questionnaires as $questionnaire)
        {
            $questionnairesPayload[] = $questionnaire;
        }

        $pipelineStatusOptionsPayload = array();
        $orderedPipelineStatusIDs = array();
        foreach ($pipelineStatusRS as $statusRow)
        {
            $statusID = (int) (isset($statusRow['statusID']) ? $statusRow['statusID'] : 0);
            if ($statusID <= 0)
            {
                continue;
            }

            $orderedPipelineStatusIDs[] = $statusID;
            $pipelineStatusOptionsPayload[] = array(
                'statusID' => $statusID,
                'status' => (isset($statusRow['status']) ? (string) $statusRow['status'] : '')
            );
        }

        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'candidates.show.v1',
                'modernPage' => $modernPage,
                'candidateID' => $candidateID,
                'showClosedPipeline' => ((bool) $showClosedPipeline),
                'isPopup' => ((bool) $isPopup),
                'permissions' => array(
                    'canEditCandidate' => ($this->getUserAccessLevel('candidates.edit') >= ACCESS_LEVEL_EDIT),
                    'canDeleteCandidate' => ($this->getUserAccessLevel('candidates.delete') >= ACCESS_LEVEL_DELETE),
                    'canAddToJobOrder' => (
                        $this->getUserAccessLevel('candidates.considerForJobSearch') >= ACCESS_LEVEL_EDIT ||
                        $this->getUserAccessLevel('pipelines.addToPipeline') >= ACCESS_LEVEL_EDIT
                    ),
                    'canChangePipelineStatus' => ($this->getUserAccessLevel('pipelines.addActivityChangeStatus') >= ACCESS_LEVEL_EDIT),
                    'canRemoveFromPipeline' => ($this->getUserAccessLevel('pipelines.removeFromPipeline') >= ACCESS_LEVEL_DELETE),
                    'canCreateAttachment' => ($this->getUserAccessLevel('candidates.createAttachment') >= ACCESS_LEVEL_EDIT),
                    'canDeleteAttachment' => ($this->getUserAccessLevel('candidates.deleteAttachment') >= ACCESS_LEVEL_DELETE),
                    'canManageTags' => ($this->getUserAccessLevel('candidates.addCandidateTags') >= ACCESS_LEVEL_EDIT),
                    'canManageLists' => ($this->getUserAccessLevel('lists.listByView') >= ACCESS_LEVEL_EDIT),
                    'canViewLists' => ($this->getUserAccessLevel('lists.listByView') >= ACCESS_LEVEL_READ),
                    'canPostComment' => ($this->getUserAccessLevel('candidates.edit') >= ACCESS_LEVEL_EDIT),
                    'canSendGDPR' => ((bool) $gdprSendEnabled && !(bool) $gdprSendDisabled),
                    'candidateMessagingEnabled' => ($this->getUserAccessLevel('candidates.edit') >= ACCESS_LEVEL_EDIT),
                    'canDeleteMessageThread' => $canDeleteMessageThread
                )
            ),
            'actions' => array(
                'legacyURL' => sprintf('%s?m=candidates&a=show&candidateID=%d&ui=legacy', $baseURL, $candidateID),
                'editURL' => sprintf('%s?m=candidates&a=edit&candidateID=%d&ui=legacy', $baseURL, $candidateID),
                'deleteURL' => sprintf('%s?m=candidates&a=delete&candidateID=%d&ui=legacy', $baseURL, $candidateID),
                'addToJobOrderURL' => sprintf('%s?m=candidates&a=considerForJobSearch&candidateID=%d&ui=legacy', $baseURL, $candidateID),
                'createAttachmentURL' => sprintf('%s?m=candidates&a=createAttachment&candidateID=%d&ui=legacy', $baseURL, $candidateID),
                'addTagsURL' => sprintf('%s?m=candidates&a=addCandidateTags&candidateID=%d&ui=legacy', $baseURL, $candidateID),
                'addToListURL' => sprintf('%s?m=lists&a=quickActionAddToListModal&dataItemType=%d&dataItemID=%d&ui=legacy', $baseURL, DATA_ITEM_CANDIDATE, $candidateID),
                'linkDuplicateURL' => sprintf('%s?m=candidates&a=linkDuplicate&candidateID=%d&ui=legacy', $baseURL, $candidateID),
                'viewHistoryURL' => sprintf('%s?m=settings&a=viewItemHistory&dataItemType=%d&dataItemID=%d&ui=legacy', $baseURL, DATA_ITEM_CANDIDATE, $candidateID),
                'addCommentURL' => sprintf('%s?m=candidates&a=addProfileComment', $baseURL),
                'postMessageURL' => sprintf('%s?m=candidates&a=postMessage', $baseURL),
                'deleteMessageThreadURL' => sprintf('%s?m=candidates&a=deleteMessageThread', $baseURL),
                'removeFromPipelineToken' => $this->getCSRFToken('candidates.removeFromPipeline'),
                'setPipelineStatusURL' => sprintf('%s?m=dashboard&a=setPipelineStatus', $baseURL),
                'setPipelineStatusToken' => $this->getCSRFToken('dashboard.setPipelineStatus')
            ),
            'pipelineStatus' => array(
                'rejectedStatusID' => (int) PIPELINE_STATUS_REJECTED,
                'orderedStatusIDs' => $orderedPipelineStatusIDs,
                'statuses' => $pipelineStatusOptionsPayload
            ),
            'candidate' => array(
                'candidateID' => $candidateID,
                'firstName' => (isset($data['firstName']) ? $data['firstName'] : ''),
                'lastName' => (isset($data['lastName']) ? $data['lastName'] : ''),
                'fullName' => $fullName,
                'titleClass' => (isset($data['titleClass']) ? $data['titleClass'] : 'jobTitleCold'),
                'isActive' => ((int) $data['isActive'] === 1),
                'isHot' => ((int) $data['isHot'] === 1),
                'email1' => (isset($data['email1']) ? $data['email1'] : ''),
                'phoneCell' => (isset($data['phoneCell']) ? $data['phoneCell'] : ''),
                'bestTimeToCall' => (isset($data['bestTimeToCall']) ? $data['bestTimeToCall'] : ''),
                'address' => (isset($data['address']) ? $data['address'] : ''),
                'city' => (isset($data['city']) ? $data['city'] : ''),
                'country' => (isset($data['country']) ? $data['country'] : ''),
                'dateAvailable' => (isset($data['dateAvailable']) ? $data['dateAvailable'] : ''),
                'currentEmployer' => (isset($data['currentEmployer']) ? $data['currentEmployer'] : ''),
                'keySkills' => (isset($data['keySkills']) ? $data['keySkills'] : ''),
                'canRelocate' => (isset($data['canRelocate']) ? $data['canRelocate'] : ''),
                'currentPay' => (isset($data['currentPay']) ? $data['currentPay'] : ''),
                'desiredPay' => (isset($data['desiredPay']) ? $data['desiredPay'] : ''),
                'owner' => (isset($data['ownerFullName']) ? $data['ownerFullName'] : '--'),
                'enteredBy' => (isset($data['enteredByFullName']) ? $data['enteredByFullName'] : '--'),
                'source' => (isset($data['source']) ? $data['source'] : '--'),
                'dateCreated' => (isset($data['dateCreated']) ? $data['dateCreated'] : '--'),
                'dateModified' => (isset($data['dateModified']) ? $data['dateModified'] : '--'),
                'pipelineCount' => (isset($data['pipeline']) ? (int) $data['pipeline'] : 0),
                'submittedCount' => (isset($data['submitted']) ? (int) $data['submitted'] : 0),
                'notesHTML' => $notesHTML,
                'notesText' => $notesText,
                'profileImageURL' => $profileImageURL,
                'duplicates' => $duplicatePayload
            ),
            'extraFields' => $extraFieldsPayload,
            'eeoValues' => $eeoValuesPayload,
            'gdpr' => array(
                'latestRequest' => $gdprLatestRequest,
                'deletionRequired' => ((bool) $gdprDeletionRequired),
                'sendEnabled' => ((bool) $gdprSendEnabled),
                'sendDisabled' => ((bool) $gdprSendDisabled),
                'sendDisabledReason' => (string) $gdprSendDisabledReason,
                'legacyConsent' => ((bool) $gdprLegacyConsent),
                'legacyProof' => $gdprLegacyProof,
                'legacyProofWarning' => ((bool) $gdprLegacyProofWarning),
                'flashMessage' => (string) $gdprFlashMessage
            ),
            'tags' => array_values((is_array($assignedTags) ? $assignedTags : array())),
            'lists' => $listsPayload,
            'comments' => array(
                'count' => count($commentsPayload),
                'initiallyOpen' => ((bool) $candidateCommentsInitiallyOpen),
                'canAddComment' => ((bool) $canAddCandidateComment),
                'categories' => array_values($candidateCommentCategories),
                'maxLength' => self::PROFILE_COMMENT_MAXLEN,
                'securityToken' => (string) $addCommentToken,
                'flashMessage' => (string) $candidateCommentFlashMessage,
                'flashIsError' => ((bool) $candidateCommentFlashIsError),
                'items' => $commentsPayload
            ),
            'messages' => array(
                'enabled' => ((bool) $candidateMessagingEnabled),
                'threadID' => (int) $candidateMessageThreadID,
                'threadVisibleToCurrentUser' => ((bool) $candidateThreadVisibleToCurrentUser),
                'initiallyOpen' => ((bool) $candidateMessagesInitiallyOpen),
                'maxLength' => CandidateMessages::MESSAGE_MAXLEN,
                'securityToken' => (string) $postCandidateMessageToken,
                'deleteThreadSecurityToken' => (string) $deleteCandidateMessageThreadToken,
                'openInboxURL' => $openInboxURL,
                'mentionHintNames' => array_values($candidateMessageMentionHintNames),
                'mentionAutocompleteValues' => array_values(array_unique($candidateMessageMentionAutocompleteValues)),
                'flashMessage' => (string) $candidateMessageFlashMessage,
                'flashIsError' => ((bool) $candidateMessageFlashIsError),
                'items' => $messageItemsPayload
            ),
            'attachments' => array(
                'items' => $attachmentsPayload,
                'transformCandidates' => $transformAttachments
            ),
            'pipelines' => array(
                'activeCount' => $activePipelineCount,
                'closedCount' => $closedPipelineCount,
                'items' => $pipelinesPayload
            ),
            'calendar' => $calendarPayload,
            'questionnaires' => $questionnairesPayload
        );

        if (!headers_sent())
        {
            header('Content-Type: application/json; charset=' . AJAX_ENCODING);
            header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        }
        echo json_encode($payload);
    }

    private function applyQuickSearchToDataGrid(&$dataGridProperties, $query, &$topLog)
    {
        $columnName = 'QuickSearchCandidateIDs';
        $filterString = '';

        if (isset($dataGridProperties['filter'])) {
            $filterString = $this->removeFilterColumnFromDataGrid($dataGridProperties['filter'], $columnName);
        }

        $query = trim($query);
        $dataGridProperties['quickSearchQuery'] = $query;

        if ($query === '') {
            $dataGridProperties['filter'] = $filterString;
            $dataGridProperties['rangeStart'] = 0;
            return;
        }

        $candidateIDs = $this->getQuickSearchCandidateIDs($query);
        if (empty($candidateIDs)) {
            $quickFilter = $columnName . '=#0';
            $topLog = sprintf(
                'No candidates found for "<strong>%s</strong>" in name, key skills, or resume.',
                htmlspecialchars($query)
            );
        } else {
            $quickFilter = $columnName . '=#' . implode('-', $candidateIDs);
            $topLog = sprintf(
                'Showing candidates matching "<strong>%s</strong>" in name, key skills, or resume.',
                htmlspecialchars($query)
            );
        }

        if ($filterString !== '') {
            $dataGridProperties['filter'] = $filterString . ',' . $quickFilter;
        } else {
            $dataGridProperties['filter'] = $quickFilter;
        }

        $dataGridProperties['rangeStart'] = 0;
    }

    private function removeFilterColumnFromDataGrid($filterString, $columnName)
    {
        if (!is_string($filterString) || $filterString === '') {
            return '';
        }

        $updatedFilters = array();
        $filterParts = explode(',', $filterString);
        foreach ($filterParts as $filterPart) {
            $filterPart = trim($filterPart);
            if ($filterPart === '' || strpos($filterPart, '=') === false) {
                continue;
            }

            $filterColumn = urldecode(substr($filterPart, 0, strpos($filterPart, '=')));
            if ($filterColumn === $columnName) {
                continue;
            }

            $updatedFilters[] = $filterPart;
        }

        return implode(',', $updatedFilters);
    }

    private function getQuickSearchCandidateIDs($query)
    {
        $candidateIDMap = array();
        $search = new SearchCandidates($this->_siteID);

        $this->addCandidateIDsToMap(
            $candidateIDMap,
            $search->byFullName($query, 'lastName', 'ASC')
        );
        $this->addCandidateIDsToMap(
            $candidateIDMap,
            $search->byKeySkills($query, 'lastName', 'ASC')
        );

        foreach ($this->getResumeSearchCandidateIDs($query) as $candidateID) {
            $candidateID = (int) $candidateID;
            if ($candidateID > 0) {
                $candidateIDMap[$candidateID] = true;
            }
        }

        $candidateIDs = array_keys($candidateIDMap);
        sort($candidateIDs, SORT_NUMERIC);

        return $candidateIDs;
    }

    private function addCandidateIDsToMap(&$candidateIDMap, $resultSet)
    {
        if (!is_array($resultSet)) {
            return;
        }

        foreach ($resultSet as $row) {
            if (!is_array($row) || !isset($row['candidateID'])) {
                continue;
            }

            $candidateID = (int) $row['candidateID'];
            if ($candidateID > 0) {
                $candidateIDMap[$candidateID] = true;
            }
        }
    }

    private function getResumeSearchCandidateIDs($query)
    {
        $candidateIDMap = array();
        $rowsPerPage = 200;

        $resumePager = new SearchByResumePager(
            $rowsPerPage,
            1,
            $this->_siteID,
            $query,
            'lastName',
            'ASC'
        );
        $resumePager->setSortByParameters('', 'lastName', 'ASC');

        $totalPages = (int) $resumePager->getTotalPages();
        if ($totalPages <= 0) {
            return array();
        }

        for ($page = 1; $page <= $totalPages; $page++) {
            if ($page === 1) {
                $pagePager = $resumePager;
            } else {
                $pagePager = new SearchByResumePager(
                    $rowsPerPage,
                    $page,
                    $this->_siteID,
                    $query,
                    'lastName',
                    'ASC'
                );
                $pagePager->setSortByParameters('', 'lastName', 'ASC');
            }

            $this->addCandidateIDsToMap($candidateIDMap, $pagePager->getPage());
        }

        return array_keys($candidateIDMap);
    }

    /*
     * Called by handleRequest() to process loading the details page.
     */
    private function show()
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));
        $isModernJSON = ($responseFormat === 'modern-json');

        /* Is this a popup? */
        if (isset($_GET['display']) && $_GET['display'] == 'popup') {
            $isPopup = true;
        } else {
            $isPopup = false;
        }

        /* Bail out if we don't have a valid candidate ID. */
        if (!$this->isRequiredIDValid('candidateID', $_GET) && !isset($_GET['email'])) {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid candidate ID.');
        }

        $candidates = new Candidates($this->_siteID);

        if (isset($_GET['candidateID'])) {
            $candidateID = $_GET['candidateID'];
        } else {
            $candidateID = $candidates->getIDByEmail($_GET['email']);
        }

        $gdprFlashMessage = '';
        if (isset($_GET['gdpr']))
        {
            $gdprStatus = $this->getTrimmedInput('gdpr', $_GET);
            if ($gdprStatus === 'sent')
            {
                $gdprFlashMessage = 'GDPR request sent.';
            }
        }

        $candidateCommentFlashMessage = '';
        $candidateCommentFlashIsError = false;
        if (isset($_GET['comment']))
        {
            $commentStatus = $this->getTrimmedInput('comment', $_GET);
            switch ($commentStatus)
            {
                case 'added':
                    $candidateCommentFlashMessage = 'Comment added.';
                    break;

                case 'empty':
                    $candidateCommentFlashMessage = 'Comment text is required.';
                    $candidateCommentFlashIsError = true;
                    break;

                case 'tooLong':
                    $candidateCommentFlashMessage = 'Comment is too long.';
                    $candidateCommentFlashIsError = true;
                    break;

                case 'invalid':
                case 'token':
                    $candidateCommentFlashMessage = 'Invalid comment request.';
                    $candidateCommentFlashIsError = true;
                    break;

                case 'failed':
                    $candidateCommentFlashMessage = 'Failed to save comment.';
                    $candidateCommentFlashIsError = true;
                    break;
            }
        }
        $candidateCommentsInitiallyOpen = (
            (isset($_GET['showComments']) && $_GET['showComments'] === '1') ||
            $candidateCommentFlashMessage !== ''
        );

        $candidateMessageFlashMessage = '';
        $candidateMessageFlashIsError = false;
        if (isset($_GET['msg']))
        {
            $msgStatus = $this->getTrimmedInput('msg', $_GET);
            switch ($msgStatus)
            {
                case 'sent':
                    $candidateMessageFlashMessage = 'Message sent.';
                    break;

                case 'empty':
                    $candidateMessageFlashMessage = 'Message cannot be empty.';
                    $candidateMessageFlashIsError = true;
                    break;

                case 'tooLong':
                    $candidateMessageFlashMessage = 'Message is too long.';
                    $candidateMessageFlashIsError = true;
                    break;

                case 'schema':
                    $candidateMessageFlashMessage = 'Inbox tables are missing. Apply schema migrations first.';
                    $candidateMessageFlashIsError = true;
                    break;

                case 'token':
                case 'invalid':
                    $candidateMessageFlashMessage = 'Invalid message request.';
                    $candidateMessageFlashIsError = true;
                    break;

                case 'forbidden':
                    $candidateMessageFlashMessage = 'You do not have access to this thread.';
                    $candidateMessageFlashIsError = true;
                    break;

                case 'deleted':
                    $candidateMessageFlashMessage = 'Thread deleted for all users.';
                    break;

                case 'deletefailed':
                    $candidateMessageFlashMessage = 'Unable to delete thread.';
                    $candidateMessageFlashIsError = true;
                    break;

                default:
                    $candidateMessageFlashMessage = 'Unable to send message.';
                    $candidateMessageFlashIsError = true;
                    break;
            }
        }

        $candidateMessagesInitiallyOpen = (
            (isset($_GET['showMessages']) && $_GET['showMessages'] === '1') ||
            $candidateMessageFlashMessage !== ''
        );

        $data = $candidates->getWithDuplicity($candidateID);

        /* Bail out if we got an empty result set. */
        if (empty($data)) {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'The specified candidate ID could not be found.');
            return;
        }

        if ($data['isAdminHidden'] == 1 && $this->getUserAccessLevel('candidates.hidden') < ACCESS_LEVEL_MULTI_SA) {
            $this->listByView('This candidate is hidden - only a CATS Administrator can unlock the candidate.');
            return;
        }

        /*
         * Replace newlines with <br />, fix HTML "special" characters, and
         * strip leading empty lines and spaces.
         */
        $data['notes'] = trim(
            nl2br(htmlspecialchars($data['notes'], ENT_QUOTES))
        );

        /* Chop $data['notes'] to make $data['shortNotes']. */
        if (strlen($data['notes']) > self::NOTES_MAXLEN) {
            $data['shortNotes']  = substr(
                $data['notes'],
                0,
                self::NOTES_MAXLEN
            );
            $isShortNotes = true;
        } else {
            $data['shortNotes'] = $data['notes'];
            $isShortNotes = false;
        }

        /* Format "can relocate" status. */
        if ($data['canRelocate'] == 1) {
            $data['canRelocate'] = 'Yes';
        } else {
            $data['canRelocate'] = 'No';
        }

        if ($data['isHot'] == 1) {
            $data['titleClass'] = 'jobTitleHot';
        } else {
            $data['titleClass'] = 'jobTitleCold';
        }

        if ($data['gdprSigned'] == 1) {
            $data['gdprSignedText'] = 'Yes';
        } else {
            $data['gdprSignedText'] = 'No';
        }

        if (
            empty($data['gdprExpirationDateISO']) ||
            $data['gdprExpirationDateISO'] == '0000-00-00'
        ) {
            $data['gdprExpirationDateDisplay'] = '';
        } else {
            $data['gdprExpirationDateDisplay'] = $data['gdprExpirationDate'];
        }

        $gdprLatestRequest = array(
            'hasRequest' => false,
            'status' => 'None',
            'createdAt' => '--',
            'emailSentAt' => '--',
            'expiresAt' => '--',
            'deletedAt' => '--',
            'rawStatus' => '',
            'requestID' => 0
        );
        $gdprDeletionRequired = false;
        $gdprSendDisabled = false;
        $gdprSendDisabledReason = '';
        $gdprSendEnabled = ($this->getUserAccessLevel('candidates.edit') >= ACCESS_LEVEL_EDIT);
        $gdprLegacyConsent = false;
        $gdprLegacyProof = array(
            'status' => 'UNKNOWN',
            'attachmentID' => 0,
            'link' => '',
            'fileName' => ''
        );
        $gdprLegacyProofWarning = false;

        $db = DatabaseConnection::getInstance();
        $gdprLatestRequestRow = $db->getAssoc(sprintf(
            "SELECT
                request_id AS requestID,
                status,
                created_at AS createdAt,
                email_sent_at AS emailSentAt,
                expires_at AS expiresAt,
                deleted_at AS deletedAt
             FROM
                candidate_gdpr_requests
             WHERE
                site_id = %s
                AND candidate_id = %s
             ORDER BY
                request_id DESC
             LIMIT 1",
            $db->makeQueryInteger($this->_siteID),
            $db->makeQueryInteger($candidateID)
        ));

        if (!empty($gdprLatestRequestRow))
        {
            $gdprLatestRequest['hasRequest'] = true;
            $gdprLatestRequest['requestID'] = (int) $gdprLatestRequestRow['requestID'];
            $gdprLatestRequest['rawStatus'] = $gdprLatestRequestRow['status'];

            $statusDisplay = $gdprLatestRequestRow['status'];
            if (
                in_array($gdprLatestRequestRow['status'], array('CREATED', 'SENT'), true) &&
                !empty($gdprLatestRequestRow['expiresAt']) &&
                strtotime($gdprLatestRequestRow['expiresAt']) <= time()
            ) {
                $statusDisplay = 'EXPIRED';
            }
            $gdprLatestRequest['status'] = $statusDisplay;
            $gdprLatestRequest['createdAt'] = $this->formatGdprRequestDate($gdprLatestRequestRow['createdAt']);
            $gdprLatestRequest['emailSentAt'] = $this->formatGdprRequestDate($gdprLatestRequestRow['emailSentAt']);
            $gdprLatestRequest['expiresAt'] = $this->formatGdprRequestDate($gdprLatestRequestRow['expiresAt']);
            $gdprLatestRequest['deletedAt'] = $this->formatGdprRequestDate($gdprLatestRequestRow['deletedAt']);

            if (
                $gdprLatestRequestRow['status'] === 'DECLINED' &&
                empty($gdprLatestRequestRow['deletedAt'])
            ) {
                $gdprDeletionRequired = true;
            }
        }
        else if ((int) $data['gdprSigned'] === 1)
        {
            $gdprLegacyConsent = true;
            $gdprLatestRequest['status'] = 'LEGACY (Signed)';
        }

        if (isset($data['gdprLegacyProofStatus']) && $data['gdprLegacyProofStatus'] !== '')
        {
            $gdprLegacyProof['status'] = $data['gdprLegacyProofStatus'];
        }

        if ($gdprLegacyProof['status'] === 'PROOF_FOUND' && empty($data['gdprLegacyProofAttachmentID']))
        {
            $gdprLegacyProof['status'] = 'UNKNOWN';
        }

        if (!$gdprLatestRequest['hasRequest'] && (int) $data['gdprSigned'] === 1)
        {
            if ($gdprLegacyProof['status'] === 'UNKNOWN' || $gdprLegacyProof['status'] === '')
            {
                $legacyMatch = $this->findLegacyGdprProofAttachment($candidateID);
                if (!empty($legacyMatch['attachmentID']))
                {
                    $gdprLegacyProof['status'] = 'PROOF_FOUND';
                    $gdprLegacyProof['attachmentID'] = (int) $legacyMatch['attachmentID'];

                    $db->query(sprintf(
                        "UPDATE candidate
                         SET
                            gdpr_legacy_proof_status = 'PROOF_FOUND',
                            gdpr_legacy_proof_attachment_id = %s
                         WHERE
                            candidate_id = %s
                            AND site_id = %s",
                        $db->makeQueryInteger($gdprLegacyProof['attachmentID']),
                        $db->makeQueryInteger($candidateID),
                        $db->makeQueryInteger($this->_siteID)
                    ));
                }
                else
                {
                    $gdprLegacyProof['status'] = 'PROOF_MISSING';
                    $gdprLegacyProof['attachmentID'] = 0;

                    $db->query(sprintf(
                        "UPDATE candidate
                         SET
                            gdpr_legacy_proof_status = 'PROOF_MISSING',
                            gdpr_legacy_proof_attachment_id = NULL
                         WHERE
                            candidate_id = %s
                            AND site_id = %s",
                        $db->makeQueryInteger($candidateID),
                        $db->makeQueryInteger($this->_siteID)
                    ));
                }

                if ($_SESSION['CATS']->getAccessLevel('gdpr.requests') >= ACCESS_LEVEL_SA)
                {
                    error_log('GDPR legacy proof lookup | ' . json_encode(array(
                        'candidateID' => $candidateID,
                        'attachments' => $legacyMatch['attachments'],
                        'normalized' => $legacyMatch['normalized'],
                        'matchedFilename' => $legacyMatch['matchedFilename'],
                        'matchedPattern' => $legacyMatch['matchedPattern']
                    )));
                }
            }
        }

        if (!empty($data['gdprLegacyProofAttachmentID']))
        {
            $gdprLegacyProof['attachmentID'] = (int) $data['gdprLegacyProofAttachmentID'];
        }

        if (!empty($gdprLegacyProof['attachmentID']))
        {
            $attachmentsLookup = new Attachments($this->_siteID);
            $proofAttachment = $attachmentsLookup->get($gdprLegacyProof['attachmentID']);
            if (!empty($proofAttachment) && !empty($proofAttachment['retrievalURL']))
            {
                $gdprLegacyProof['link'] = $proofAttachment['retrievalURL'];
                $gdprLegacyProof['fileName'] = $proofAttachment['originalFilename'];
            }
        }

        if (!$gdprLatestRequest['hasRequest'] && (int) $data['gdprSigned'] === 1)
        {
            if ($gdprLegacyProof['status'] === 'PROOF_MISSING' || $gdprLegacyProof['status'] === 'UNKNOWN')
            {
                $gdprLegacyProofWarning = true;
            }
        }

        if ($gdprDeletionRequired)
        {
            $gdprSendDisabled = true;
            $gdprSendDisabledReason = 'Candidate declined; delete required.';
        }
        else if ((int) $data['gdprSigned'] === 1)
        {
            $gdprSendDisabled = true;
            $gdprSendDisabledReason = 'GDPR already signed.';
        }
        else if (empty($data['email1']))
        {
            $gdprSendDisabled = true;
            $gdprSendDisabledReason = 'Candidate email is missing.';
        }

        $attachments = new Attachments($this->_siteID);
        $attachmentsRS = $attachments->getAll(
            DATA_ITEM_CANDIDATE,
            $candidateID
        );
        if (!empty($attachmentsRS))
        {
            usort($attachmentsRS, function ($left, $right) {
                return ((int) $right['attachmentID']) - ((int) $left['attachmentID']);
            });
        }

        $aiPrefillDefaultAttachmentID = 0;
        if (!empty($attachmentsRS))
        {
            $aiPrefillDefaultAttachmentID = (int) $attachmentsRS[0]['attachmentID'];
        }

        foreach ($attachmentsRS as $rowNumber => $attachmentsData) {
            /* If profile image is not local, force it to be local. */
            if ($attachmentsData['isProfileImage'] == 1) {
                $attachments->forceAttachmentLocal($attachmentsData['attachmentID']);
            }

            /* Show an attachment icon based on the document's file type. */
            $attachmentIcon = strtolower(
                FileUtility::getAttachmentIcon(
                    $attachmentsRS[$rowNumber]['originalFilename']
                )
            );

            $attachmentsRS[$rowNumber]['attachmentIcon'] = $attachmentIcon;

            /* If the text field has any text, show a preview icon. */
            if ($attachmentsRS[$rowNumber]['hasText']) {
                $attachmentsRS[$rowNumber]['previewLink'] = sprintf(
                    '<a href="#" onclick="window.open(\'%s?m=candidates&amp;a=viewResume&amp;attachmentID=%s\', \'viewResume\', \'scrollbars=1,width=800,height=760\')"><img width="15" height="15" style="border: none;" src="images/search.gif" alt="(Preview)" /></a>',
                    CATSUtility::getIndexName(),
                    $attachmentsRS[$rowNumber]['attachmentID']
                );
            } else {
                $attachmentsRS[$rowNumber]['previewLink'] = '&nbsp;';
            }
        }

        $transformAttachments = array();
        $transformAllowedExtensions = array('pdf', 'docx', 'txt');
        foreach ($attachmentsRS as $attachmentsData)
        {
            if ($attachmentsData['isProfileImage'] == 1)
            {
                continue;
            }

            $extension = strtolower(
                FileUtility::getFileExtension($attachmentsData['originalFilename'])
            );
            if (!in_array($extension, $transformAllowedExtensions, true))
            {
                continue;
            }

            $transformAttachments[] = array(
                'attachmentID' => $attachmentsData['attachmentID'],
                'originalFilename' => $attachmentsData['originalFilename']
            );
        }
        $pipelines = new Pipelines($this->_siteID);
        $showClosed = false;
        if (isset($_GET['showClosed']) && ($_GET['showClosed'] == '1' || $_GET['showClosed'] === 'true'))
        {
            $showClosed = true;
        }

        $pipelinesRS = $pipelines->getCandidatePipeline($candidateID, $showClosed);

        $sessionCookie = $_SESSION['CATS']->getCookie();

        /* Format pipeline data. */
        foreach ($pipelinesRS as $rowIndex => $row) {
            /* Hot jobs [can] have different title styles than normal
             * jobs.
             */
            if ($row['isHot'] == 1) {
                $pipelinesRS[$rowIndex]['linkClass'] = 'jobLinkHot';
            } else {
                $pipelinesRS[$rowIndex]['linkClass'] = 'jobLinkCold';
            }

            $pipelinesRS[$rowIndex]['ownerAbbrName'] = StringUtility::makeInitialName(
                $pipelinesRS[$rowIndex]['ownerFirstName'],
                $pipelinesRS[$rowIndex]['ownerLastName'],
                false,
                LAST_NAME_MAXLEN
            );

            $pipelinesRS[$rowIndex]['addedByAbbrName'] = StringUtility::makeInitialName(
                $pipelinesRS[$rowIndex]['addedByFirstName'],
                $pipelinesRS[$rowIndex]['addedByLastName'],
                false,
                LAST_NAME_MAXLEN
            );

            $pipelinesRS[$rowIndex]['ratingLine'] = TemplateUtility::getRatingObject(
                $pipelinesRS[$rowIndex]['ratingValue'],
                $pipelinesRS[$rowIndex]['candidateJobOrderID'],
                $sessionCookie
            );
        }

        /* Get upcoming calendar entries. */
        $calendarRS = $candidates->getUpcomingEvents($candidateID);
        if (!empty($calendarRS)) {
            foreach ($calendarRS as $rowIndex => $row) {
                $calendarRS[$rowIndex]['enteredByAbbrName'] = StringUtility::makeInitialName(
                    $calendarRS[$rowIndex]['enteredByFirstName'],
                    $calendarRS[$rowIndex]['enteredByLastName'],
                    false,
                    LAST_NAME_MAXLEN
                );
            }
        }

        /* Get extra fields. */
        $extraFieldRS = $candidates->extraFields->getValuesForShow($candidateID);

        /* Add an MRU entry. */
        $_SESSION['CATS']->getMRU()->addEntry(
            DATA_ITEM_CANDIDATE,
            $candidateID,
            $data['firstName'] . ' ' . $data['lastName']
        );

        /* Is the user an admin - can user see history? */
        if ($this->getUserAccessLevel('candidates.priviledgedUser') < ACCESS_LEVEL_DEMO) {
            $privledgedUser = false;
        } else {
            $privledgedUser = true;
        }

        $ownershipEditEnabled = (!$isPopup && $this->getUserAccessLevel('candidates') >= ACCESS_LEVEL_SA);
        $ownershipUsersRS = array();
        if ($ownershipEditEnabled)
        {
            $users = new Users($this->_siteID);
            $ownershipUsersRS = $users->getSelectList();
        }

        $EEOSettings = new EEOSettings($this->_siteID);
        $EEOSettingsRS = $EEOSettings->getAll();
        $EEOValues = array();

        /* Make a list of all EEO related values so they can be positioned by index
         * rather than static positioning (like extra fields). */
        if ($EEOSettingsRS['enabled'] == 1) {
            if ($EEOSettingsRS['genderTracking'] == 1) {
                $EEOValues[] = array('fieldName' => 'Gender', 'fieldValue' => $data['eeoGenderText']);
            }
            if ($EEOSettingsRS['ethnicTracking'] == 1) {
                $EEOValues[] = array('fieldName' => 'Ethnicity', 'fieldValue' => $data['eeoEthnicType']);
            }
            if ($EEOSettingsRS['veteranTracking'] == 1) {
                $EEOValues[] = array('fieldName' => 'Veteran Status', 'fieldValue' => $data['eeoVeteranType']);
            }
            if ($EEOSettingsRS['disabilityTracking'] == 1) {
                $EEOValues[] = array('fieldName' => 'Disability Status', 'fieldValue' => $data['eeoDisabilityStatus']);
            }
        }

        $tags = new Tags($this->_siteID);

        $questionnaire = new Questionnaire($this->_siteID);
        $questionnaires = $questionnaire->getCandidateQuestionnaires($candidateID);

        $lists = $candidates->getListsForCandidate($candidateID);
        $candidateComments = $this->getCandidateProfileComments($candidateID);
        $candidateCommentCategories = $this->getCandidateCommentCategories();
        $canAddCandidateComment = (
            !$isPopup &&
            $this->getUserAccessLevel('candidates.edit') >= ACCESS_LEVEL_EDIT
        );

        $candidateMessages = new CandidateMessages($this->_siteID);
        $candidateMessagingEnabled = $candidateMessages->isSchemaAvailable();
        $candidateMessageThread = array();
        $candidateMessageThreadID = 0;
        $candidateThreadVisibleToCurrentUser = false;
        $candidateThreadMessages = array();
        $candidateMessageMentionHintNames = array();
        $candidateMessageMentionAutocompleteValues = array();
        if ($candidateMessagingEnabled)
        {
            $candidateMessageThread = $candidateMessages->getThreadByCandidate($candidateID);
            if (!empty($candidateMessageThread))
            {
                $candidateMessageThreadID = (int) $candidateMessageThread['threadID'];
                $candidateThreadVisibleToCurrentUser = $candidateMessages->isUserParticipant(
                    $candidateMessageThreadID,
                    $this->_userID
                );
                if ($candidateThreadVisibleToCurrentUser)
                {
                    $candidateMessages->markThreadRead($candidateMessageThreadID, $this->_userID);
                    $candidateThreadMessages = $candidateMessages->getMessagesByThread($candidateMessageThreadID, 100);
                }
            }

            $mentionUsers = $candidateMessages->getMentionableUsers();
            foreach ($mentionUsers as $mentionUser)
            {
                $fullName = trim($mentionUser['fullName']);
                $userName = trim($mentionUser['userName']);
                $mentionLabel = ($fullName !== '') ? $fullName : $userName;
                if ($mentionLabel === '')
                {
                    continue;
                }
                $candidateMessageMentionAutocompleteValues[] = $mentionLabel;

                if (count($candidateMessageMentionHintNames) >= 5)
                {
                    break;
                }

                $candidateMessageMentionHintNames[] = $mentionLabel;
            }
        }

        if ($isModernJSON)
        {
            if ($modernPage !== '' && $modernPage !== 'candidates-show')
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

            $this->renderModernCandidateShowJSON(
                $candidateID,
                $isPopup,
                $showClosed,
                $data,
                $extraFieldRS,
                $EEOValues,
                $attachmentsRS,
                $transformAttachments,
                $pipelinesRS,
                $calendarRS,
                $lists,
                $candidateComments,
                $candidateCommentCategories,
                $canAddCandidateComment,
                $candidateCommentsInitiallyOpen,
                $candidateCommentFlashMessage,
                $candidateCommentFlashIsError,
                $candidateMessagingEnabled,
                $candidateMessageThreadID,
                $candidateThreadVisibleToCurrentUser,
                $candidateThreadMessages,
                $candidateMessageMentionHintNames,
                $candidateMessageMentionAutocompleteValues,
                $candidateMessagesInitiallyOpen,
                $candidateMessageFlashMessage,
                $candidateMessageFlashIsError,
                $questionnaires,
                $gdprLatestRequest,
                $gdprDeletionRequired,
                $gdprSendEnabled,
                $gdprSendDisabled,
                $gdprSendDisabledReason,
                $gdprLegacyConsent,
                $gdprLegacyProof,
                $gdprLegacyProofWarning,
                $gdprFlashMessage,
                $tags->getCandidateTagsTitle($candidateID),
                $pipelines->getStatusesForPicking(),
                $this->getCSRFToken('candidates.addProfileComment'),
                $this->getCSRFToken('candidates.postMessage'),
                $this->getCSRFToken('candidates.deleteMessageThread'),
                'candidates-show'
            );
            return;
        }

        $this->_template->assign('active', $this);
        $this->_template->assign('questionnaires', $questionnaires);
        $this->_template->assign('data', $data);
        $this->_template->assign('isShortNotes', $isShortNotes);
        $this->_template->assign('attachmentsRS', $attachmentsRS);
        $this->_template->assign('transformAttachments', $transformAttachments);
        $this->_template->assign('pipelinesRS', $pipelinesRS);
        $this->_template->assign('showClosedPipeline', $showClosed);
        $this->_template->assign('calendarRS', $calendarRS);
        $this->_template->assign('extraFieldRS', $extraFieldRS);
        $this->_template->assign('candidateID', $candidateID);
        $this->_template->assign('isPopup', $isPopup);
        $this->_template->assign('EEOSettingsRS', $EEOSettingsRS);
        $this->_template->assign('EEOValues', $EEOValues);
        $this->_template->assign('privledgedUser', $privledgedUser);
        $this->_template->assign('ownershipEditEnabled', $ownershipEditEnabled);
        $this->_template->assign('ownershipUsersRS', $ownershipUsersRS);
        $this->_template->assign('sessionCookie', $_SESSION['CATS']->getCookie());
        $this->_template->assign('tagsRS', $tags->getAll());
        $this->_template->assign('assignedTags', $tags->getCandidateTagsTitle($candidateID));
        $this->_template->assign('lists', $lists);
        $this->_template->assign('candidateComments', $candidateComments);
        $this->_template->assign('candidateCommentCategories', $candidateCommentCategories);
        $this->_template->assign('candidateCommentCount', count($candidateComments));
        $this->_template->assign('canAddCandidateComment', $canAddCandidateComment);
        $this->_template->assign('candidateCommentsInitiallyOpen', $candidateCommentsInitiallyOpen);
        $this->_template->assign('candidateCommentFlashMessage', $candidateCommentFlashMessage);
        $this->_template->assign('candidateCommentFlashIsError', $candidateCommentFlashIsError);
        $this->_template->assign('candidateMessagingEnabled', $candidateMessagingEnabled);
        $this->_template->assign('candidateMessageThreadID', $candidateMessageThreadID);
        $this->_template->assign('candidateThreadVisibleToCurrentUser', $candidateThreadVisibleToCurrentUser);
        $this->_template->assign('candidateThreadMessages', $candidateThreadMessages);
        $this->_template->assign('candidateMessageMentionHintNames', $candidateMessageMentionHintNames);
        $this->_template->assign(
            'candidateMessageMentionAutocompleteValues',
            array_values(array_unique($candidateMessageMentionAutocompleteValues))
        );
        $this->_template->assign('candidateMessagesInitiallyOpen', $candidateMessagesInitiallyOpen);
        $this->_template->assign('candidateMessageFlashMessage', $candidateMessageFlashMessage);
        $this->_template->assign('candidateMessageFlashIsError', $candidateMessageFlashIsError);
        $this->_template->assign('gdprLatestRequest', $gdprLatestRequest);
        $this->_template->assign('gdprDeletionRequired', $gdprDeletionRequired);
        $this->_template->assign('gdprSendEnabled', $gdprSendEnabled);
        $this->_template->assign('gdprSendDisabled', $gdprSendDisabled);
        $this->_template->assign('gdprSendDisabledReason', $gdprSendDisabledReason);
        $this->_template->assign('gdprLegacyConsent', $gdprLegacyConsent);
        $this->_template->assign('gdprLegacyProof', $gdprLegacyProof);
        $this->_template->assign('gdprLegacyProofWarning', $gdprLegacyProofWarning);
        $this->_template->assign('gdprFlashMessage', $gdprFlashMessage);
        $this->_template->assign(
            'deleteAttachmentToken',
            $this->getCSRFToken('candidates.deleteAttachment')
        );
        $this->_template->assign(
            'addCommentToken',
            $this->getCSRFToken('candidates.addProfileComment')
        );
        $this->_template->assign(
            'postCandidateMessageToken',
            $this->getCSRFToken('candidates.postMessage')
        );
        $this->_template->assign(
            'deleteCandidateMessageThreadToken',
            $this->getCSRFToken('candidates.deleteMessageThread')
        );

        $this->_template->display('./modules/candidates/Show.tpl');

        if (!eval(Hooks::get('CANDIDATE_SHOW'))) return;
    }

    /*
     * Called by handleRequest() to process loading the add page.
     *
     * The user could have already added a resume to the system
     * before this page is displayed.  They could have indicated
     * that they want to use a bulk resume, or a text resume
     * stored in the  session.  These ocourances are looked
     * for here, and the Add.tpl file displays the results.
     */
    private function add($contents = '', $fields = array())
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));
        $isModernJSON = ($responseFormat === 'modern-json');

        $perfEnabled = (isset($_GET['perf']) && $_GET['perf'] === '1');
        $perfStart = microtime(true);
        $perfLast = $perfStart;

        $candidates = new Candidates($this->_siteID);

        /* Get possible sources. */
        $sourcesRS = $candidates->getPossibleSources();
        $sourcesString = ListEditor::getStringFromList($sourcesRS, 'name');
        if ($perfEnabled)
        {
            error_log(sprintf('AddCandidate perf: sources %.3fms', (microtime(true) - $perfLast) * 1000));
            $perfLast = microtime(true);
        }

        /* Get extra fields. */
        $extraFieldRS = $candidates->extraFields->getValuesForAdd();
        if ($perfEnabled)
        {
            error_log(sprintf('AddCandidate perf: extraFields %.3fms', (microtime(true) - $perfLast) * 1000));
            $perfLast = microtime(true);
        }

        /* Get passed variables. */
        $preassignedFields = $_GET;
        if (count($fields) > 0) {
            $preassignedFields = array_merge($preassignedFields, $fields);
        }

        $gdprSettings = new GDPRSettings($this->_siteID);
        $gdprSettingsRS = $gdprSettings->getAll();
        if ($perfEnabled)
        {
            error_log(sprintf('AddCandidate perf: gdprSettings %.3fms', (microtime(true) - $perfLast) * 1000));
            $perfLast = microtime(true);
        }

        $gdprExpirationYears = (int) $gdprSettingsRS[GDPRSettings::SETTING_KEY];
        if ($gdprExpirationYears <= 0) {
            $gdprExpirationYears = 2;
        }

        $defaultGdprExpiration = date(
            'm-d-y',
            strtotime('+' . $gdprExpirationYears . ' years')
        );

        if (!isset($preassignedFields['gdprSigned'])) {
            $preassignedFields['gdprSigned'] = 0;
        } else {
            $preassignedFields['gdprSigned'] =
                ((int) $preassignedFields['gdprSigned'] === 1) ? 1 : 0;
        }

        if (
            !isset($preassignedFields['gdprExpirationDate']) ||
            $preassignedFields['gdprExpirationDate'] === ''
        ) {
            $preassignedFields['gdprExpirationDate'] = $defaultGdprExpiration;
        }

        if ($isModernJSON)
        {
            if ($modernPage !== '' && $modernPage !== 'candidates-add')
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

            $this->renderModernCandidateAddJSON(
                $sourcesRS,
                $sourcesString,
                $preassignedFields,
                $gdprSettingsRS,
                $extraFieldRS,
                'candidates-add'
            );
            return;
        }

        /* Get preattached resume, if any. */
        if ($this->isRequiredIDValid('attachmentID', $_GET)) {
            $associatedAttachment = $_GET['attachmentID'];

            $attachments = new Attachments($this->_siteID);
            $associatedAttachmentRS = $attachments->get($associatedAttachment);

            /* Show an attachment icon based on the document's file type. */
            $attachmentIcon = strtolower(
                FileUtility::getAttachmentIcon(
                    $associatedAttachmentRS['originalFilename']
                )
            );

            $associatedAttachmentRS['attachmentIcon'] = $attachmentIcon;

            /* If the text field has any text, show a preview icon. */
            if ($associatedAttachmentRS['hasText']) {
                $associatedAttachmentRS['previewLink'] = sprintf(
                    '<a href="#" onclick="window.open(\'%s?m=candidates&amp;a=viewResume&amp;attachmentID=%s\', \'viewResume\', \'scrollbars=1,width=800,height=760\')"><img width="15" height="15" style="border: none;" src="images/popup.gif" alt="(Preview)" /></a>',
                    CATSUtility::getIndexName(),
                    $associatedAttachmentRS['attachmentID']
                );
            } else {
                $associatedAttachmentRS['previewLink'] = '&nbsp;';
            }
        } else {
            $associatedAttachment = 0;
            $associatedAttachmentRS = array();
        }
        if ($perfEnabled)
        {
            error_log(sprintf('AddCandidate perf: attachmentLookup %.3fms', (microtime(true) - $perfLast) * 1000));
            $perfLast = microtime(true);
        }

        /* Get preuploaded resume text, if any */
        if ($this->isRequiredIDValid('resumeTextID', $_GET, true)) {
            $associatedTextResume = $_SESSION['CATS']->retrieveData($_GET['resumeTextID']);
        } else {
            $associatedTextResume = false;
        }

        /* Get preuploaded resume file (unattached), if any */
        if ($this->isRequiredIDValid('resumeFileID', $_GET, true)) {
            $associatedFileResume = $_SESSION['CATS']->retrieveData($_GET['resumeFileID']);
            $associatedFileResume['id'] = $_GET['resumeFileID'];
            $associatedFileResume['attachmentIcon'] = strtolower(
                FileUtility::getAttachmentIcon(
                    $associatedFileResume['filename']
                )
            );
        } else {
            $associatedFileResume = false;
        }
        if ($perfEnabled)
        {
            error_log(sprintf('AddCandidate perf: preuploadedResume %.3fms', (microtime(true) - $perfLast) * 1000));
            $perfLast = microtime(true);
        }

        $EEOSettings = new EEOSettings($this->_siteID);
        $EEOSettingsRS = $EEOSettings->getAll();
        if ($perfEnabled)
        {
            error_log(sprintf('AddCandidate perf: eeoSettings %.3fms', (microtime(true) - $perfLast) * 1000));
            $perfLast = microtime(true);
        }


        if (!eval(Hooks::get('CANDIDATE_ADD'))) return;

        /* If parsing is not enabled server-wide, say so. */
        if (!LicenseUtility::isParsingEnabled()) {
            $isParsingEnabled = false;
        }
        /* For CATS Toolbar, if e-mail has been sent and it wasn't set by
         * parser, it's toolbar and it needs the old format.
         */ else if (!isset($preassignedFields['email'])) {
            $isParsingEnabled = true;
        } else if (empty($preassignedFields['email'])) {
            $isParsingEnabled = true;
        } else if (isset($preassignedFields['isFromParser']) && $preassignedFields['isFromParser']) {
            $isParsingEnabled = true;
        } else {
            $isParsingEnabled = false;
        }

        if (
            is_array($parsingStatus = LicenseUtility::getParsingStatus()) &&
            isset($parsingStatus['parseLimit'])
        ) {
            $parsingStatus['parseLimit'] = $parsingStatus['parseLimit'] - 1;
        }
        if ($perfEnabled)
        {
            error_log(sprintf('AddCandidate perf: parsingStatus %.3fms', (microtime(true) - $perfLast) * 1000));
            $perfLast = microtime(true);
        }

        $this->_template->assign('parsingStatus', $parsingStatus);
        $this->_template->assign('isParsingEnabled', $isParsingEnabled);
        $this->_template->assign('contents', $contents);
        $this->_template->assign('extraFieldRS', $extraFieldRS);
        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', 'Add Candidate');
        $this->_template->assign('sourcesRS', $sourcesRS);
        $this->_template->assign('sourcesString', $sourcesString);
        $this->_template->assign('preassignedFields', $preassignedFields);
        $this->_template->assign('associatedAttachment', $associatedAttachment);
        $this->_template->assign('associatedAttachmentRS', $associatedAttachmentRS);
        $this->_template->assign('associatedTextResume', $associatedTextResume);
        $this->_template->assign('associatedFileResume', $associatedFileResume);
        $this->_template->assign('EEOSettingsRS', $EEOSettingsRS);
        $this->_template->assign('gdprSettingsRS', $gdprSettingsRS);
        $this->_template->assign('sessionCookie', $_SESSION['CATS']->getCookie());
        $this->_template->assign('currentUserID', $_SESSION['CATS']->getUserID());
        $this->_template->assign('isModal', false);
        $this->_template->assign(
            'dupCheckIsAdmin',
            ($this->getUserAccessLevel('candidates.duplicates') >= ACCESS_LEVEL_SA)
        );

        /* REMEMBER TO ALSO UPDATE JobOrdersUI::addCandidateModal() IF
         * APPLICABLE.
         */
        $this->_template->display('./modules/candidates/Add.tpl');
        if ($perfEnabled)
        {
            error_log(sprintf('AddCandidate perf: render %.3fms', (microtime(true) - $perfLast) * 1000));
            error_log(sprintf('AddCandidate perf: total %.3fms', (microtime(true) - $perfStart) * 1000));
        }
    }

    private function renderModernCandidateAddJSON(
        $sourcesRS,
        $sourcesString,
        $preassignedFields,
        $gdprSettingsRS,
        $extraFieldRS,
        $modernPage
    )
    {
        $baseURL = CATSUtility::getIndexName();
        $extraFieldsPayload = $this->buildModernExtraFieldPayload($extraFieldRS, false);

        $sourceOptions = array(
            array(
                'value' => '(none)',
                'label' => '(None)'
            )
        );
        foreach ($sourcesRS as $sourceData)
        {
            $sourceName = (isset($sourceData['name']) ? trim($sourceData['name']) : '');
            if ($sourceName === '' || $sourceName === '(none)')
            {
                continue;
            }

            $sourceOptions[] = array(
                'value' => $sourceName,
                'label' => $sourceName
            );
        }

        $defaultSource = '(none)';
        if (isset($preassignedFields['source']) && trim((string) $preassignedFields['source']) !== '')
        {
            $defaultSource = (string) $preassignedFields['source'];
        }

        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'candidates.add.v1',
                'modernPage' => $modernPage,
                'permissions' => array(
                    'canAddCandidate' => ($this->getUserAccessLevel('candidates.add') >= ACCESS_LEVEL_EDIT)
                )
            ),
            'actions' => array(
                'submitURL' => sprintf('%s?m=candidates&a=add&ui=modern', $baseURL),
                'listURL' => sprintf('%s?m=candidates&a=listByView&ui=modern', $baseURL),
                'legacyURL' => sprintf('%s?m=candidates&a=add&ui=legacy', $baseURL)
            ),
            'defaults' => array(
                'firstName' => (isset($preassignedFields['firstName']) ? (string) $preassignedFields['firstName'] : ''),
                'lastName' => (isset($preassignedFields['lastName']) ? (string) $preassignedFields['lastName'] : ''),
                'email1' => (isset($preassignedFields['email1']) ? (string) $preassignedFields['email1'] : ''),
                'phoneCell' => (isset($preassignedFields['phoneCell']) ? (string) $preassignedFields['phoneCell'] : ''),
                'address' => (isset($preassignedFields['address']) ? (string) $preassignedFields['address'] : ''),
                'city' => (isset($preassignedFields['city']) ? (string) $preassignedFields['city'] : ''),
                'country' => (isset($preassignedFields['country']) ? (string) $preassignedFields['country'] : ''),
                'bestTimeToCall' => (isset($preassignedFields['bestTimeToCall']) ? (string) $preassignedFields['bestTimeToCall'] : ''),
                'dateAvailable' => (isset($preassignedFields['dateAvailable']) ? (string) $preassignedFields['dateAvailable'] : ''),
                'gdprSigned' => ((isset($preassignedFields['gdprSigned']) && (int) $preassignedFields['gdprSigned'] === 1) ? true : false),
                'gdprExpirationDate' => (isset($preassignedFields['gdprExpirationDate']) ? (string) $preassignedFields['gdprExpirationDate'] : ''),
                'source' => $defaultSource,
                'keySkills' => (isset($preassignedFields['keySkills']) ? (string) $preassignedFields['keySkills'] : ''),
                'currentEmployer' => (isset($preassignedFields['currentEmployer']) ? (string) $preassignedFields['currentEmployer'] : ''),
                'currentPay' => (isset($preassignedFields['currentPay']) ? (string) $preassignedFields['currentPay'] : ''),
                'desiredPay' => (isset($preassignedFields['desiredPay']) ? (string) $preassignedFields['desiredPay'] : ''),
                'notes' => (isset($preassignedFields['notes']) ? (string) $preassignedFields['notes'] : ''),
                'canRelocate' => ((isset($preassignedFields['canRelocate']) && (string) $preassignedFields['canRelocate'] !== '' && (string) $preassignedFields['canRelocate'] !== '0') ? true : false),
                'gender' => (isset($preassignedFields['gender']) ? (string) $preassignedFields['gender'] : ''),
                'race' => (isset($preassignedFields['race']) ? (string) $preassignedFields['race'] : ''),
                'veteran' => (isset($preassignedFields['veteran']) ? (string) $preassignedFields['veteran'] : ''),
                'disability' => (isset($preassignedFields['disability']) ? (string) $preassignedFields['disability'] : '')
            ),
            'options' => array(
                'sources' => $sourceOptions,
                'sourceCSV' => $sourcesString,
                'gdprExpirationYears' => (isset($gdprSettingsRS['gdprExpirationYears']) ? (int) $gdprSettingsRS['gdprExpirationYears'] : 2)
            ),
            'extraFields' => $extraFieldsPayload
        );

        if (!headers_sent())
        {
            header('Content-Type: application/json; charset=' . AJAX_ENCODING);
            header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        }
        echo json_encode($payload);
    }

    private function formatGdprRequestDate($dateValue)
    {
        if (empty($dateValue) || $dateValue === '0000-00-00 00:00:00')
        {
            return '--';
        }

        $timestamp = strtotime($dateValue);
        if ($timestamp <= 0)
        {
            return '--';
        }

        $format = $_SESSION['CATS']->isDateDMY() ? 'd-m-Y' : 'm-d-Y';
        return DateUtility::getAdjustedDate($format, $timestamp);
    }

    private function normalizeLegacyGdprText($value)
    {
        $value = strtolower(trim($value));

        $map = array(
            'ă' => 'a', 'â' => 'a', 'î' => 'i', 'ș' => 's', 'ş' => 's', 'ț' => 't', 'ţ' => 't',
            'á' => 'a', 'à' => 'a', 'ä' => 'a', 'ã' => 'a', 'å' => 'a',
            'é' => 'e', 'è' => 'e', 'ê' => 'e', 'ë' => 'e',
            'í' => 'i', 'ì' => 'i', 'ï' => 'i',
            'ó' => 'o', 'ò' => 'o', 'ö' => 'o', 'ô' => 'o', 'õ' => 'o',
            'ú' => 'u', 'ù' => 'u', 'ü' => 'u',
            'ç' => 'c'
        );

        $value = strtr($value, $map);
        $value = str_replace(array('_', '-'), ' ', $value);
        $value = preg_replace('/\s+/', ' ', $value);

        return trim($value);
    }

    private function findLegacyGdprProofAttachment($candidateID)
    {
        $db = DatabaseConnection::getInstance();
        $siteID = $this->_siteID;

        $sql = sprintf(
            "SELECT
                attachment_id AS attachmentID,
                original_filename AS originalFilename
             FROM
                attachment
             WHERE
                site_id = %s
                AND data_item_type = %s
                AND data_item_id = %s
                AND LOWER(original_filename) LIKE '%%.pdf'
             ORDER BY
                date_created DESC",
            $db->makeQueryInteger($siteID),
            $db->makeQueryInteger(DATA_ITEM_CANDIDATE),
            $db->makeQueryInteger($candidateID)
        );

        $rows = $db->getAllAssoc($sql);
        $patterns = array(
            'acord prelucrare',
            'acord prelucrarea',
            'prelucrare date',
            'prelucrarea date',
            'prelucrarea datelor',
            'gdpr',
            'consent'
        );

        $normalizedPatterns = array();
        foreach ($patterns as $pattern)
        {
            $normalizedPatterns[] = $this->normalizeLegacyGdprText($pattern);
        }

        $matchedAttachmentID = 0;
        $matchedFilename = '';
        $matchedPattern = '';
        $attachmentNames = array();
        $normalizedNames = array();

        foreach ($rows as $row)
        {
            if (empty($row['originalFilename']))
            {
                continue;
            }

            $attachmentNames[] = $row['originalFilename'];
            $normalizedName = $this->normalizeLegacyGdprText($row['originalFilename']);
            $normalizedNames[] = $normalizedName;

            foreach ($normalizedPatterns as $pattern)
            {
                if ($pattern !== '' && strpos($normalizedName, $pattern) !== false)
                {
                    $matchedAttachmentID = (int) $row['attachmentID'];
                    $matchedFilename = $row['originalFilename'];
                    $matchedPattern = $pattern;
                    break 2;
                }
            }
        }

        return array(
            'attachmentID' => $matchedAttachmentID,
            'matchedFilename' => $matchedFilename,
            'matchedPattern' => $matchedPattern,
            'attachments' => $attachmentNames,
            'normalized' => $normalizedNames
        );
    }

    public function checkParsingFunctions()
    {
        if (LicenseUtility::isParsingEnabled()) {
            if (isset($_POST['documentText'])) $contents = $_POST['documentText'];
            else $contents = '';

            // Retain all field data since this isn't done over AJAX (yet)
            $fields = array(
                'firstName'       => $this->getSanitisedInput('firstName', $_POST),
                'lastName'        => $this->getSanitisedInput('lastName', $_POST),
                'email1'          => $this->getSanitisedInput('email1', $_POST),
                'phoneCell'       => $this->getSanitisedInput('phoneCell', $_POST),
                'address'         => $this->getSanitisedInput('address', $_POST),
                'city'            => $this->getSanitisedInput('city', $_POST),
                'country'         => $this->getSanitisedInput('country', $_POST),
                'source'          => $this->getTrimmedInput('source', $_POST),
                'keySkills'       => $this->getSanitisedInput('keySkills', $_POST),
                'currentEmployer' => $this->getSanitisedInput('currentEmployer', $_POST),
                'currentPay'      => $this->getSanitisedInput('currentPay', $_POST),
                'desiredPay'      => $this->getSanitisedInput('desiredPay', $_POST),
                'notes'           => $this->getSanitisedInput('notes', $_POST),
                'canRelocate'     => $this->getSanitisedInput('canRelocate', $_POST),
                'bestTimeToCall'  => $this->getSanitisedInput('bestTimeToCall', $_POST),
                'gender'          => $this->getTrimmedInput('gender', $_POST),
                'race'            => $this->getTrimmedInput('race', $_POST),
                'veteran'         => $this->getTrimmedInput('veteran', $_POST),
                'disability'      => $this->getTrimmedInput('disability', $_POST),
                'gdprSigned'      => $this->getTrimmedInput('gdprSigned', $_POST),
                'gdprExpirationDate' => $this->getTrimmedInput('gdprExpirationDate', $_POST),
                'documentTempFile' => $this->getTrimmedInput('documentTempFile', $_POST),
                'isFromParser'    => true
            );

            /**
             * User is loading a resume from a document. Convert it to a string and paste the contents
             * into the textarea field on the add candidate page after validating the form.
             */
            if (isset($_POST['loadDocument']) && $_POST['loadDocument'] == 'true') {
                // Get the upload file from the post data
                $newFileName = FileUtility::getUploadFileFromPost(
                    $this->_siteID, // The site ID
                    'addcandidate', // Sub-directory of the site's upload folder
                    'documentFile'  // The DOM "name" from the <input> element
                );

                if ($newFileName !== false) {
                    // Get the relative path to the file (to perform operations on)
                    $newFilePath = FileUtility::getUploadFilePath(
                        $this->_siteID, // The site ID
                        'addcandidate', // The sub-directory
                        $newFileName
                    );

                    $documentToText = new DocumentToText();
                    $doctype = $documentToText->getDocumentType($newFilePath);

                    if ($documentToText->convert($newFilePath, $doctype)) {
                        $contents = $documentToText->getString();
                        if ($doctype == DOCUMENT_TYPE_DOC) {
                            $contents = str_replace('|', "\n", $contents);
                        }

                        // Remove things like _rDOTr for ., etc.
                        $contents = DatabaseSearch::fulltextDecode($contents);
                    } else {
                        $contents = @file_get_contents($newFilePath);
                        $fields['binaryData'] = true;
                    }

                    // Save the short (un-pathed) name
                    $fields['documentTempFile'] = $newFileName;

                    if (
                        isset($_COOKIE['CATS_SP_TEMP_FILE']) && ($oldFile = $_COOKIE['CATS_SP_TEMP_FILE']) != '' &&
                        strcasecmp($oldFile, $newFileName)
                    ) {
                        // Get the safe, old file they uploaded and didn't use (if exists) and delete
                        $oldFilePath = FileUtility::getUploadFilePath($this->_siteID, 'addcandidate', $oldFile);

                        if ($oldFilePath !== false) {
                            @unlink($oldFilePath);
                        }
                    }

                    // Prevent users from creating more than 1 temp file for single parsing (sp)
                    setcookie('CATS_SP_TEMP_FILE', $newFileName, time() + (60 * 60 * 24 * 7));
                }

                if (isset($_POST['parseDocument']) && $_POST['parseDocument'] == 'true' && $contents != '') {
                    // ...
                } else {
                    return array($contents, $fields);
                }
            }

            /**
             * User is parsing the contents of the textarea field on the add candidate page.
             */
            if (isset($_POST['parseDocument']) && $_POST['parseDocument'] == 'true' && $contents != '') {
                $pu = new ParseUtility();
                if ($res = $pu->documentParse('untitled', strlen($contents), '', $contents)) {
                    if (isset($res['first_name'])) $fields['firstName'] = $res['first_name'];
                    else $fields['firstName'] = '';
                    if (isset($res['last_name'])) $fields['lastName'] = $res['last_name'];
                    else $fields['lastName'] = '';
                    // middle name removed from UI/schema
                    if (isset($res['email_address'])) $fields['email1'] = $res['email_address'];
                    else $fields['email1'] = '';
                    if (isset($res['us_address'])) $fields['address'] = $res['us_address'];
                    else $fields['address'] = '';
                    if (isset($res['city'])) $fields['city'] = $res['city'];
                    else $fields['city'] = '';
                    if (isset($res['country'])) {
                        $fields['country'] = $res['country'];
                    } else if (isset($res['state'])) {
                        $fields['country'] = $res['state'];
                    } else {
                        $fields['country'] = '';
                    }
                    if (isset($res['phone_number'])) $fields['phoneCell'] = $res['phone_number'];
                    else $fields['phoneCell'] = '';
                    if (isset($res['skills'])) $fields['keySkills'] = str_replace("\n", ' ', str_replace('"', '\'\'', $res['skills']));
                }

                return array($contents, $fields);
            }
        }

        return false;
    }

    /*
     * Called by handleRequest() to process saving / submitting the add page.
     */
    private function onAdd()
    {
        if (is_array($mp = $this->checkParsingFunctions())) {
            return $this->add($mp[0], $mp[1]);
        }

        $candidateID = $this->_addCandidate(false);

        if ($candidateID <= 0) {
            CommonErrors::fatal(COMMONERROR_RECORDERROR, $this, 'Failed to add candidate.');
        }

        $activityEntries = new ActivityEntries($this->_siteID);
        $activityID = $activityEntries->add(
            $candidateID,
            DATA_ITEM_CANDIDATE,
            400,
            'Added a new candidate.',
            $this->_userID
        );

        CATSUtility::transferRelativeURI('m=candidates&a=listByView');
    }

    /*
     * Called by handleRequest() to process loading the edit page.
     */
    private function edit()
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));
        $isModernJSON = ($responseFormat === 'modern-json');

        /* Bail out if we don't have a valid candidate ID. */
        if (!$this->isRequiredIDValid('candidateID', $_GET)) {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid candidate ID.');
        }

        $candidateID = $_GET['candidateID'];

        $candidates = new Candidates($this->_siteID);
        $data = $candidates->getForEditing($candidateID);

        /* Bail out if we got an empty result set. */
        if (empty($data)) {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'The specified candidate ID could not be found.');
        }

        if ($data['isAdminHidden'] == 1 && $this->getUserAccessLevel('candidates.hidden') < ACCESS_LEVEL_MULTI_SA) {
            $this->listByView('This candidate is hidden - only a CATS Administrator can unlock the candidate.');
            return;
        }

        $users = new Users($this->_siteID);
        $usersRS = $users->getSelectList();

        /* Add an MRU entry. */
        $_SESSION['CATS']->getMRU()->addEntry(
            DATA_ITEM_CANDIDATE,
            $candidateID,
            $data['firstName'] . ' ' . $data['lastName']
        );

        /* Get extra fields. */
        $extraFieldRS = $candidates->extraFields->getValuesForEdit($candidateID);

        /* Get possible sources. */
        $sourcesRS = $candidates->getPossibleSources();
        $sourcesString = ListEditor::getStringFromList($sourcesRS, 'name');

        /* Is current source a possible source? */
        // FIXME: Use array search functions!
        $sourceInRS = false;
        foreach ($sourcesRS as $sourceData) {
            if ($sourceData['name'] == $data['source']) {
                $sourceInRS = true;
            }
        }

        $attachments = new Attachments($this->_siteID);
        $attachmentsRS = $attachments->getAll(
            DATA_ITEM_CANDIDATE,
            $candidateID
        );

        // TODO - improve for permission who can send email
        if ($this->getUserAccessLevel('candidates.emailCandidates') == ACCESS_LEVEL_DEMO) {
            $canEmail = false;
        } else {
            $canEmail = true;
        }

        $emailTemplates = new EmailTemplates($this->_siteID);
        $statusChangeTemplateRS = $emailTemplates->getByTag(
            'EMAIL_TEMPLATE_OWNERSHIPASSIGNCANDIDATE'
        );
        if ($statusChangeTemplateRS['disabled'] == 1) {
            $emailTemplateDisabled = true;
        } else {
            $emailTemplateDisabled = false;
        }

        /* Date format for DateInput()s. */
        if ($_SESSION['CATS']->isDateDMY()) {
            $data['dateAvailableMDY'] = DateUtility::convert(
                '-',
                $data['dateAvailable'],
                DATE_FORMAT_DDMMYY,
                DATE_FORMAT_MMDDYY
            );
        } else {
            $data['dateAvailableMDY'] = $data['dateAvailable'];
        }

        if (!empty($data['gdprExpirationDate'])) {
            $data['gdprExpirationDateMDY'] = $data['gdprExpirationDate'];
        } else {
            $data['gdprExpirationDateMDY'] = '';
        }

        if (!eval(Hooks::get('CANDIDATE_EDIT'))) return;

        if ($isModernJSON)
        {
            if ($modernPage !== '' && $modernPage !== 'candidates-edit')
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

            $this->renderModernCandidateEditJSON(
                $candidateID,
                $data,
                $usersRS,
                $sourcesRS,
                $sourcesString,
                $extraFieldRS,
                $attachmentsRS,
                'candidates-edit'
            );
            return;
        }

        $EEOSettings = new EEOSettings($this->_siteID);
        $EEOSettingsRS = $EEOSettings->getAll();

        $this->_template->assign('active', $this);
        $this->_template->assign('data', $data);
        $this->_template->assign('usersRS', $usersRS);
        $this->_template->assign('extraFieldRS', $extraFieldRS);
        $this->_template->assign('sourcesRS', $sourcesRS);
        $this->_template->assign('sourcesString', $sourcesString);
        $this->_template->assign('sourceInRS', $sourceInRS);
        $this->_template->assign('candidateID', $candidateID);
        $this->_template->assign('attachmentsRS', $attachmentsRS);
        $this->_template->assign('aiPrefillDefaultAttachmentID', $aiPrefillDefaultAttachmentID);
        $this->_template->assign('canEmail', $canEmail);
        $this->_template->assign('EEOSettingsRS', $EEOSettingsRS);
        $this->_template->assign('emailTemplateDisabled', $emailTemplateDisabled);
        $this->_template->assign('sessionCookie', $_SESSION['CATS']->getCookie());
        $this->_template->assign('currentUserID', $_SESSION['CATS']->getUserID());
        $this->_template->display('./modules/candidates/Edit.tpl');
    }

    private function renderModernCandidateEditJSON(
        $candidateID,
        $data,
        $usersRS,
        $sourcesRS,
        $sourcesString,
        $extraFieldRS,
        $attachmentsRS,
        $modernPage
    )
    {
        $baseURL = CATSUtility::getIndexName();
        $candidateID = (int) $candidateID;
        $extraFieldsPayload = $this->buildModernExtraFieldPayload($extraFieldRS, true);

        $ownerOptions = array(
            array(
                'value' => '-1',
                'label' => 'None'
            )
        );
        foreach ($usersRS as $userData)
        {
            $ownerOptions[] = array(
                'value' => (string) (int) $userData['userID'],
                'label' => trim($userData['lastName'] . ', ' . $userData['firstName'])
            );
        }

        $sourceOptions = array(
            array(
                'value' => '(none)',
                'label' => '(None)'
            )
        );
        foreach ($sourcesRS as $sourceData)
        {
            $sourceName = (isset($sourceData['name']) ? trim($sourceData['name']) : '');
            if ($sourceName === '' || $sourceName === '(none)')
            {
                continue;
            }

            $sourceOptions[] = array(
                'value' => $sourceName,
                'label' => $sourceName
            );
        }

        $attachmentsPayload = array();
        foreach ($attachmentsRS as $attachmentData)
        {
            $retrievalURL = '';
            if (!empty($attachmentData['retrievalURL']))
            {
                $retrievalURL = html_entity_decode((string) $attachmentData['retrievalURL'], ENT_QUOTES);
            }
            else if (!empty($attachmentData['retrievalURLLocal']))
            {
                $retrievalURL = (string) $attachmentData['retrievalURLLocal'];
            }

            $attachmentsPayload[] = array(
                'attachmentID' => (int) $attachmentData['attachmentID'],
                'fileName' => (isset($attachmentData['originalFilename']) ? (string) $attachmentData['originalFilename'] : ''),
                'dateCreated' => (isset($attachmentData['dateCreated']) ? (string) $attachmentData['dateCreated'] : '--'),
                'isProfileImage' => ((isset($attachmentData['isProfileImage']) && (int) $attachmentData['isProfileImage'] === 1) ? true : false),
                'retrievalURL' => $retrievalURL
            );
        }

        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'candidates.edit.v1',
                'modernPage' => $modernPage,
                'candidateID' => $candidateID,
                'permissions' => array(
                    'canEditCandidate' => ($this->getUserAccessLevel('candidates.edit') >= ACCESS_LEVEL_EDIT),
                    'canCreateAttachment' => ($this->getUserAccessLevel('candidates.createAttachment') >= ACCESS_LEVEL_EDIT),
                    'canDeleteAttachment' => ($this->getUserAccessLevel('candidates.deleteAttachment') >= ACCESS_LEVEL_DELETE)
                )
            ),
            'actions' => array(
                'submitURL' => sprintf('%s?m=candidates&a=edit&ui=modern', $baseURL),
                'showURL' => sprintf('%s?m=candidates&a=show&candidateID=%d&ui=modern', $baseURL, $candidateID),
                'legacyURL' => sprintf('%s?m=candidates&a=edit&candidateID=%d&ui=legacy', $baseURL, $candidateID),
                'createAttachmentURL' => sprintf('%s?m=candidates&a=createAttachment&candidateID=%d&ui=legacy', $baseURL, $candidateID)
            ),
            'candidate' => array(
                'candidateID' => $candidateID,
                'isActive' => ((int) $data['isActive'] === 1),
                'firstName' => (isset($data['firstName']) ? $data['firstName'] : ''),
                'lastName' => (isset($data['lastName']) ? $data['lastName'] : ''),
                'email1' => (isset($data['email1']) ? $data['email1'] : ''),
                'phoneCell' => (isset($data['phoneCell']) ? $data['phoneCell'] : ''),
                'address' => (isset($data['address']) ? $data['address'] : ''),
                'city' => (isset($data['city']) ? $data['city'] : ''),
                'country' => (isset($data['country']) ? $data['country'] : ''),
                'bestTimeToCall' => (isset($data['bestTimeToCall']) ? $data['bestTimeToCall'] : ''),
                'dateAvailable' => (isset($data['dateAvailableMDY']) ? $data['dateAvailableMDY'] : ''),
                'gdprSigned' => ((int) $data['gdprSigned'] === 1),
                'gdprExpirationDate' => (isset($data['gdprExpirationDateMDY']) ? $data['gdprExpirationDateMDY'] : ''),
                'isHot' => ((int) $data['isHot'] === 1),
                'source' => (isset($data['source']) && trim($data['source']) !== '' ? $data['source'] : '(none)'),
                'owner' => (isset($data['owner']) ? (string) (int) $data['owner'] : '-1'),
                'keySkills' => (isset($data['keySkills']) ? $data['keySkills'] : ''),
                'currentEmployer' => (isset($data['currentEmployer']) ? $data['currentEmployer'] : ''),
                'currentPay' => (isset($data['currentPay']) ? $data['currentPay'] : ''),
                'desiredPay' => (isset($data['desiredPay']) ? $data['desiredPay'] : ''),
                'notes' => (isset($data['notes']) ? $data['notes'] : ''),
                'canRelocate' => ((int) $data['canRelocate'] === 1),
                'gender' => (isset($data['eeoGender']) ? $data['eeoGender'] : ''),
                'race' => (isset($data['eeoEthnicTypeID']) ? (string) $data['eeoEthnicTypeID'] : ''),
                'veteran' => (isset($data['eeoVeteranTypeID']) ? (string) $data['eeoVeteranTypeID'] : ''),
                'disability' => (isset($data['eeoDisabilityStatus']) ? $data['eeoDisabilityStatus'] : '')
            ),
            'options' => array(
                'owners' => $ownerOptions,
                'sources' => $sourceOptions,
                'sourceCSV' => $sourcesString
            ),
            'extraFields' => $extraFieldsPayload,
            'attachments' => $attachmentsPayload
        );

        if (!headers_sent())
        {
            header('Content-Type: application/json; charset=' . AJAX_ENCODING);
            header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        }
        echo json_encode($payload);
    }

    private function mapModernExtraFieldInputType($extraFieldType)
    {
        switch ((int) $extraFieldType)
        {
            case EXTRA_FIELD_TEXTAREA:
                return 'textarea';

            case EXTRA_FIELD_CHECKBOX:
                return 'checkbox';

            case EXTRA_FIELD_DROPDOWN:
                return 'dropdown';

            case EXTRA_FIELD_RADIO:
                return 'radio';

            case EXTRA_FIELD_DATE:
                return 'date';

            case EXTRA_FIELD_TEXT:
            default:
                return 'text';
        }
    }

    private function buildModernExtraFieldPayload($extraFieldRS, $isEditMode)
    {
        $payload = array();
        if (!is_array($extraFieldRS))
        {
            return $payload;
        }

        foreach ($extraFieldRS as $index => $fieldData)
        {
            $options = array();
            if (isset($fieldData['extraFieldOptions']) && trim((string) $fieldData['extraFieldOptions']) !== '')
            {
                $rawOptions = explode(',', (string) $fieldData['extraFieldOptions']);
                foreach ($rawOptions as $rawOption)
                {
                    $decoded = trim(urldecode((string) $rawOption));
                    if ($decoded === '')
                    {
                        continue;
                    }
                    $options[] = $decoded;
                }
            }

            $value = '';
            if ($isEditMode && isset($fieldData['value']))
            {
                $value = (string) $fieldData['value'];
            }
            else if (!$isEditMode && isset($fieldData['value']))
            {
                $value = (string) $fieldData['value'];
            }

            if ($this->mapModernExtraFieldInputType(
                (isset($fieldData['extraFieldType']) ? (int) $fieldData['extraFieldType'] : EXTRA_FIELD_TEXT)
            ) === 'checkbox' && $value === '')
            {
                $value = 'No';
            }

            $payload[] = array(
                'postKey' => 'extraField' . $index,
                'fieldName' => (isset($fieldData['fieldName']) ? (string) $fieldData['fieldName'] : ('Extra Field ' . $index)),
                'inputType' => $this->mapModernExtraFieldInputType(
                    (isset($fieldData['extraFieldType']) ? (int) $fieldData['extraFieldType'] : EXTRA_FIELD_TEXT)
                ),
                'value' => $value,
                'options' => $options
            );
        }

        return $payload;
    }

    /*
     * Called by handleRequest() to process saving / submitting the edit page.
     */
    private function onEdit()
    {
        $candidates = new Candidates($this->_siteID);

        /* Bail out if we don't have a valid candidate ID. */
        if (!$this->isRequiredIDValid('candidateID', $_POST)) {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid candidate ID.');
            return;
        }

        /* Bail out if we don't have a valid owner user ID. */
        if (!$this->isOptionalIDValid('owner', $_POST)) {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid owner user ID.');
        }

        /* Bail out if we received an invalid availability date; if not, go
         * ahead and convert the date to MySQL format.
         */
        $dateAvailable = $this->getTrimmedInput('dateAvailable', $_POST);
        if (!empty($dateAvailable)) {
            if (!DateUtility::validate('-', $dateAvailable, DATE_FORMAT_MMDDYY)) {
                CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'Invalid availability date.');
            }

            /* Convert start_date to something MySQL can understand. */
            $dateAvailable = DateUtility::convert(
                '-',
                $dateAvailable,
                DATE_FORMAT_MMDDYY,
                DATE_FORMAT_YYYYMMDD
            );
        }

        // phoneHome removed: candidates no longer store a separate home phone field

        $formattedPhoneCell = StringUtility::extractPhoneNumber(
            $this->getSanitisedInput('phoneCell', $_POST)
        );
        if (!empty($formattedPhoneCell)) {
            $phoneCell = $formattedPhoneCell;
        } else {
            $phoneCell = $this->getSanitisedInput('phoneCell', $_POST);
        }

        $candidateID = $_POST['candidateID'];
        $owner       = $_POST['owner'];

        /* Can Relocate */
        $canRelocate = $this->isChecked('canRelocate', $_POST);

        $isHot = $this->isChecked('isHot', $_POST);

        /* Change ownership email? */
        if ($this->isChecked('ownershipChange', $_POST) && $owner > 0) {
            $candidateDetails = $candidates->get($candidateID);

            $users = new Users($this->_siteID);
            $ownerDetails = $users->get($owner);

            if (!empty($ownerDetails)) {
                $emailAddress = $ownerDetails['email'];

                /* Get the change status email template. */
                $emailTemplates = new EmailTemplates($this->_siteID);
                $statusChangeTemplateRS = $emailTemplates->getByTag(
                    'EMAIL_TEMPLATE_OWNERSHIPASSIGNCANDIDATE'
                );

                if (
                    empty($statusChangeTemplateRS) ||
                    empty($statusChangeTemplateRS['textReplaced'])
                ) {
                    $statusChangeTemplate = '';
                } else {
                    $statusChangeTemplate = $statusChangeTemplateRS['textReplaced'];
                }
                /* Replace e-mail template variables. */
                $stringsToFind = array(
                    '%CANDOWNER%',
                    '%CANDFIRSTNAME%',
                    '%CANDFULLNAME%',
                    '%CANDCATSURL%'
                );
                $replacementStrings = array(
                    $ownerDetails['fullName'],
                    $candidateDetails['firstName'],
                    $candidateDetails['firstName'] . ' ' . $candidateDetails['lastName'],
                    '<a href="http://' . $_SERVER['HTTP_HOST'] . substr($_SERVER['REQUEST_URI'], 0, strpos($_SERVER['REQUEST_URI'], '?')) . '?m=candidates&amp;a=show&amp;candidateID=' . $candidateID . '">' .
                        'http://' . $_SERVER['HTTP_HOST'] . substr($_SERVER['REQUEST_URI'], 0, strpos($_SERVER['REQUEST_URI'], '?')) . '?m=candidates&amp;a=show&amp;candidateID=' . $candidateID . '</a>'
                );
                $statusChangeTemplate = str_replace(
                    $stringsToFind,
                    $replacementStrings,
                    $statusChangeTemplate
                );

                $email = $statusChangeTemplate;
            } else {
                $email = '';
                $emailAddress = '';
            }
        } else {
            $email = '';
            $emailAddress = '';
        }

        $isActive        = $this->isChecked('isActive', $_POST);
        $firstName       = $this->getSanitisedInput('firstName', $_POST);
        $lastName        = $this->getSanitisedInput('lastName', $_POST);
        $email1          = $this->getSanitisedInput('email1', $_POST);
        $address         = $this->getSanitisedInput('address', $_POST);
        $city            = $this->getSanitisedInput('city', $_POST);
        $country         = $this->getSanitisedInput('country', $_POST);
        $source          = $this->getSanitisedInput('source', $_POST);
        $keySkills       = $this->getSanitisedInput('keySkills', $_POST);
        $currentEmployer = $this->getSanitisedInput('currentEmployer', $_POST);
        $currentPay      = $this->getSanitisedInput('currentPay', $_POST);
        $desiredPay      = $this->getSanitisedInput('desiredPay', $_POST);
        $notes           = $this->getSanitisedInput('notes', $_POST);
        $bestTimeToCall  = $this->getTrimmedInput('bestTimeToCall', $_POST);
        $gender          = $this->getTrimmedInput('gender', $_POST);
        $race            = $this->getTrimmedInput('race', $_POST);
        $veteran         = $this->getTrimmedInput('veteran', $_POST);
        $disability      = $this->getTrimmedInput('disability', $_POST);

        $gdprSignedInput = $this->getTrimmedInput('gdprSigned', $_POST);
        $gdprSigned = ((int) $gdprSignedInput === 1) ? 1 : 0;

        $gdprExpirationDateInput = $this->getTrimmedInput('gdprExpirationDate', $_POST);
        $gdprExpirationDate = null;
        if (!empty($gdprExpirationDateInput)) {
            if (!DateUtility::validate('-', $gdprExpirationDateInput, DATE_FORMAT_MMDDYY)) {
                CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'Invalid GDPR expiration date.');
            }

            $gdprExpirationDate = DateUtility::convert(
                '-',
                $gdprExpirationDateInput,
                DATE_FORMAT_MMDDYY,
                DATE_FORMAT_YYYYMMDD
            );
        } else if ($gdprSigned) {
            CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'GDPR expiration date is required when GDPR Signed is Yes.');
        }
        if (!$gdprSigned) {
            $gdprExpirationDate = null;
        }
        /* Candidate source list editor. */
        $sourceCSV = $this->getTrimmedInput('sourceCSV', $_POST);

        /* Bail out if any of the required fields are empty. */
        if (empty($firstName) || empty($lastName)) {
            CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'Required fields are missing.');
        }

        if (!eval(Hooks::get('CANDIDATE_ON_EDIT_PRE'))) return;

        /* Update the candidate record. */
        $updateSuccess = $candidates->update(
            $candidateID,
            $isActive,
            $firstName,
            $lastName,
            $email1,
            $phoneCell,
            $address,
            $city,
            $country,
            $source,
            $keySkills,
            $dateAvailable,
            $currentEmployer,
            $canRelocate,
            $currentPay,
            $desiredPay,
            $notes,
            $bestTimeToCall,
            $gdprSigned,
            $gdprExpirationDate,
            $owner,
            $isHot,
            $email,
            $emailAddress,
            $gender,
            $race,
            $veteran,
            $disability
        );
        if (!$updateSuccess) {
            CommonErrors::fatal(COMMONERROR_RECORDERROR, $this, 'Failed to update candidate.');
        }

        /* Update extra fields. */
        $candidates->extraFields->setValuesOnEdit($candidateID);

        /* Update possible source list */
        $sources = $candidates->getPossibleSources();
        $sourcesDifferences = ListEditor::getDifferencesFromList(
            $sources,
            'name',
            'sourceID',
            $sourceCSV
        );

        $candidates->updatePossibleSources($sourcesDifferences);

        if (!eval(Hooks::get('CANDIDATE_ON_EDIT_POST'))) return;

        CATSUtility::transferRelativeURI(
            'm=candidates&a=show&candidateID=' . $candidateID
        );
    }

    private function onSaveSources()
    {
        if (!$this->isRequiredIDValid('candidateID', $_POST)) {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid candidate ID.');
        }

        $candidateID = $_POST['candidateID'];
        $sourceCSV = $this->getTrimmedInput('sourceCSV', $_POST);

        $candidates = new Candidates($this->_siteID);
        $sources = $candidates->getPossibleSources();
        $sourcesDifferences = ListEditor::getDifferencesFromList(
            $sources,
            'name',
            'sourceID',
            $sourceCSV
        );
        $candidates->updatePossibleSources($sourcesDifferences);

        CATSUtility::transferRelativeURI(
            'm=candidates&a=edit&candidateID=' . $candidateID
        );
    }

    /*
     * Called by handleRequest() to process deleting a candidate.
     */
    private function onDelete()
    {
        /* Bail out if we don't have a valid candidate ID. */
        if (!$this->isRequiredIDValid('candidateID', $_GET)) {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid candidate ID.');
        }

        $candidateID = $_GET['candidateID'];

        if (!eval(Hooks::get('CANDIDATE_DELETE'))) return;

        $candidates = new Candidates($this->_siteID);
        $candidates->delete($candidateID);

        /* Delete the MRU entry if present. */
        $_SESSION['CATS']->getMRU()->removeEntry(
            DATA_ITEM_CANDIDATE,
            $candidateID
        );

        CATSUtility::transferRelativeURI('m=candidates&a=listByView');
    }

    /*
     * Called by handleRequest() to handle processing an "Add to a Job Order
     * Pipeline" search and displaying the results in the modal dialog, or
     * to show the initial dialog.
     */
    private function considerForJobSearch($candidateIDArray = array())
    {

        /* Get list of candidates. */
        if (isset($_REQUEST['candidateIDArrayStored']) && $this->isRequiredIDValid('candidateIDArrayStored', $_REQUEST, true)) {
            $candidateIDArray = $_SESSION['CATS']->retrieveData($_REQUEST['candidateIDArrayStored']);
        } else if ($this->isRequiredIDValid('candidateID', $_REQUEST)) {
            $candidateIDArray = array($_REQUEST['candidateID']);
        } else if ($candidateIDArray === array()) {
            $dataGrid = DataGrid::getFromRequest();

            $candidateIDArray = $dataGrid->getExportIDs();
        }

        if (!is_array($candidateIDArray)) {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid variable type.');
            return;
        }

        /* Validate each ID */
        foreach ($candidateIDArray as $index => $candidateID) {
            if (!$this->isRequiredIDValid($index, $candidateIDArray)) {
                echo ('&' . $candidateID . '>');

                CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid candidate ID.');
                return;
            }
        }

        if (empty($candidateIDArray))
        {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'No candidate selected.');
            return;
        }

        $singleCandidateID = 0;
        $candidateDisplayName = 'Selected Candidate';
        if (count($candidateIDArray) === 1)
        {
            $singleCandidateID = (int) $candidateIDArray[0];
            $candidates = new Candidates($this->_siteID);
            $candidateData = $candidates->get($singleCandidateID);
            if (!empty($candidateData))
            {
                $candidateDisplayName = trim(
                    $candidateData['firstName'] . ' ' . $candidateData['lastName']
                );
                if ($candidateDisplayName === '')
                {
                    $candidateDisplayName = 'Candidate #' . $singleCandidateID;
                }
            }
        }

        $pipelines = new Pipelines($this->_siteID);
        $assignmentStatusOptions = array();
        foreach ($pipelines->getStatusesForPicking() as $statusRow)
        {
            $statusID = (int) $statusRow['statusID'];
            if ($statusID === PIPELINE_STATUS_HIRED || $statusID === PIPELINE_STATUS_REJECTED)
            {
                continue;
            }

            $assignmentStatusOptions[] = array(
                'statusID' => $statusID,
                'status' => $statusRow['status']
            );
        }
        if (empty($assignmentStatusOptions))
        {
            $assignmentStatusOptions[] = array(
                'statusID' => PIPELINE_STATUS_ALLOCATED,
                'status' => 'Allocated'
            );
        }

        if (!eval(Hooks::get('CANDIDATE_ON_CONSIDER_FOR_JOB_SEARCH'))) return;

        $this->_template->assign('isFinishedMode', false);
        $this->_template->assign('candidateIDArray', $candidateIDArray);
        $this->_template->assign('candidateIDArrayStored', $_SESSION['CATS']->storeData($candidateIDArray));
        $this->_template->assign('isMultipleCandidates', (count($candidateIDArray) > 1));
        $this->_template->assign('singleCandidateID', $singleCandidateID);
        $this->_template->assign('candidateDisplayName', $candidateDisplayName);
        $this->_template->assign('assignmentStatusOptions', $assignmentStatusOptions);
        $this->_template->assign('defaultAssignmentStatusID', PIPELINE_STATUS_ALLOCATED);
        $this->_template->assign(
            'canSetStatusOnAdd',
            ($this->getUserAccessLevel('pipelines.addActivityChangeStatus') >= ACCESS_LEVEL_EDIT)
        );
        $this->_template->display('./modules/candidates/ConsiderSearchModal.tpl');
    }

    /*
     * Called by handleRequest() to process adding a candidate to a pipeline
     * in the modal dialog.
     */
    private function onAddToPipeline()
    {
        /* Bail out if we don't have a valid job order ID. */
        if (!$this->isRequiredIDValid('jobOrderID', $_GET)) {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid job order ID.');
        }

        if (isset($_GET['candidateID'])) {
            /* Bail out if we don't have a valid candidate ID. */
            if (!$this->isRequiredIDValid('candidateID', $_GET)) {
                CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid candidate ID.');
            }

            $candidateIDArray = array($_GET['candidateID']);
        } else {
            if (!isset($_REQUEST['candidateIDArrayStored']) || !$this->isRequiredIDValid('candidateIDArrayStored', $_REQUEST, true)) {
                CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid candidateIDArrayStored parameter.');
                return;
            }

            $candidateIDArray = $_SESSION['CATS']->retrieveData($_REQUEST['candidateIDArrayStored']);

            if (!is_array($candidateIDArray)) {
                CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid variable type.');
                return;
            }

            /* Validate each ID */
            foreach ($candidateIDArray as $index => $candidateID) {
                if (!$this->isRequiredIDValid($index, $candidateIDArray)) {
                    echo ($dataItemID);

                    CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid candidate ID.');
                    return;
                }
            }
        }


        $jobOrderID  = $_GET['jobOrderID'];
        $confirmReapplyRejected = ((int) $this->getTrimmedInput('confirmReapplyRejected', $_GET) === 1);

        if (!eval(Hooks::get('CANDIDATE_ADD_TO_PIPELINE_PRE'))) return;

        $pipelines = new Pipelines($this->_siteID);

        /* Drop candidate ID's who are already in the pipeline */
        $pipelinesRS = $pipelines->getJobOrderPipeline($jobOrderID);

        foreach ($pipelinesRS as $data) {
            $arrayPos = array_search($data['candidateID'], $candidateIDArray);
            if ($arrayPos !== false) {
                unset($candidateIDArray[$arrayPos]);
            }
        }

        /* Drop candidate IDs that were already hired for this job order. */
        foreach ($candidateIDArray as $arrayPos => $candidateID) {
            if ($pipelines->hasEverBeenHiredForJobOrder($candidateID, $jobOrderID)) {
                unset($candidateIDArray[$arrayPos]);
            }
        }

        $rejectedCandidateIDs = array();
        foreach ($candidateIDArray as $candidateID) {
            if ($pipelines->hasEverBeenRejectedForJobOrder($candidateID, $jobOrderID)) {
                $rejectedCandidateIDs[] = (int) $candidateID;
            }
        }

        if (!$confirmReapplyRejected && !empty($rejectedCandidateIDs)) {
            $confirmURL = CATSUtility::getIndexName()
                . '?m=candidates&a=addToPipeline'
                . '&jobOrderID=' . (int) $jobOrderID
                . '&confirmReapplyRejected=1';

            if (isset($_GET['candidateID']) && $this->isRequiredIDValid('candidateID', $_GET)) {
                $confirmURL .= '&candidateID=' . (int) $_GET['candidateID'];
            } else if (isset($_REQUEST['candidateIDArrayStored']) && $this->isRequiredIDValid('candidateIDArrayStored', $_REQUEST, true)) {
                $confirmURL .= '&candidateIDArrayStored=' . urlencode($_REQUEST['candidateIDArrayStored']);
            }

            if (isset($_GET['getback']) && trim($_GET['getback']) !== '') {
                $confirmURL .= '&getback=' . urlencode(trim($_GET['getback']));
            }

            $isMultiple = (count($rejectedCandidateIDs) > 1);
            $message = $isMultiple
                ? 'One or more selected candidates were already rejected for this role. Please check closed transitions. Continue to re-assign and start a new flow?'
                : 'This candidate was already rejected for this role. Please check closed transitions. Continue to re-assign and start a new flow?';

            $messageJS = function_exists('json_encode')
                ? json_encode($message)
                : "'" . addslashes($message) . "'";
            $confirmURLJS = function_exists('json_encode')
                ? json_encode($confirmURL)
                : "'" . addslashes($confirmURL) . "'";

            echo '<html><head><script type="text/javascript">',
                '(function(){',
                'var msg=', $messageJS, ';',
                'var url=', $confirmURLJS, ';',
                'if (window.confirm(msg)) { window.location.href = url; return; }',
                'if (window.history && window.history.length > 1) { window.history.back(); }',
                '})();',
                '</script></head><body></body></html>';
            return;
        }

        /* Add to pipeline */
        foreach ($candidateIDArray as $candidateID) {
            if (!$pipelines->add($candidateID, $jobOrderID, $this->_userID)) {
                $errorMessage = $pipelines->getLastErrorMessage();
                if (empty($errorMessage)) {
                    $errorMessage = 'Failed to add candidate to Job Order.';
                }
                CommonErrors::fatalModal(COMMONERROR_RECORDERROR, $this, $errorMessage);
            }

            if (!eval(Hooks::get('CANDIDATE_ADD_TO_PIPELINE_POST_IND'))) return;
        }

        if (!eval(Hooks::get('CANDIDATE_ADD_TO_PIPELINE_POST'))) return;

        $this->_template->assign('isFinishedMode', true);
        $this->_template->assign('jobOrderID', $jobOrderID);
        $this->_template->assign('candidateIDArray', $candidateIDArray);
        $this->_template->display(
            './modules/candidates/ConsiderSearchModal.tpl'
        );
    }

    private function addActivityChangeStatus()
    {
        /* Bail out if we don't have a valid candidate ID. */
        if (!$this->isRequiredIDValid('candidateID', $_GET)) {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid candidate ID.');
        }

        /* Bail out if we don't have a valid job order ID. */
        if (!$this->isOptionalIDValid('jobOrderID', $_GET)) {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid job order ID.');
        }

        $selectedJobOrderID = $_GET['jobOrderID'];
        $candidateID        = $_GET['candidateID'];

        $candidates = new Candidates($this->_siteID);
        $candidateData = $candidates->get($candidateID);

        /* Bail out if we got an empty result set. */
        if (empty($candidateData)) {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this);
            return;
        }

        $pipelines = new Pipelines($this->_siteID);
        /* Include closed entries so rejected/hired job-order details remain accessible from this modal. */
        $pipelineRS = $pipelines->getCandidatePipeline($candidateID, true);

        $statusRS = $pipelines->getStatusesForPicking();

        if ($selectedJobOrderID != -1) {
            $selectedStatusID = ResultSetUtility::getColumnValueByIDValue(
                $pipelineRS,
                'jobOrderID',
                $selectedJobOrderID,
                'statusID'
            );
        } else {
            $selectedStatusID = -1;
        }

        /* Rejected entries cannot transition directly; open details flow instead. */
        if (
            $selectedJobOrderID != -1 &&
            (int) $selectedStatusID === (int) PIPELINE_STATUS_REJECTED
        ) {
            $pipelineID = $pipelines->getCandidateJobOrderID($candidateID, $selectedJobOrderID);
            if ($pipelineID > 0) {
                $detailsURL = CATSUtility::getIndexName() . '?m=joborders&a=pipelineStatusDetails&pipelineID=' . (int) $pipelineID;
                $detailsURLForJS = str_replace("'", "\\'", $detailsURL);

                echo '<html><head><script type="text/javascript">',
                    '(function(){',
                    'var url=\'' . $detailsURLForJS . '\';',
                    'if (window.parent && window.parent.showPopWin){',
                    'window.parent.showPopWin(url, 1200, 760, null);',
                    'return;',
                    '}',
                    'window.location.href=url;',
                    '})();',
                    '</script></head><body></body></html>';
                return;
            }
        }

        /* Get the change status email template. */
        $emailTemplates = new EmailTemplates($this->_siteID);
        $statusChangeTemplateRS = $emailTemplates->getByTag(
            'EMAIL_TEMPLATE_STATUSCHANGE'
        );
        if (
            empty($statusChangeTemplateRS) ||
            empty($statusChangeTemplateRS['textReplaced'])
        ) {
            $statusChangeTemplate = '';
            $emailDisabled = '1';
        } else {
            $statusChangeTemplate = $statusChangeTemplateRS['textReplaced'];
            $emailDisabled = $statusChangeTemplateRS['disabled'];
        }

        /* Replace e-mail template variables. '%CANDSTATUS%', '%JBODTITLE%',
         * '%JBODCLIENT%' are replaced by JavaScript.
         */
        $stringsToFind = array(
            '%CANDOWNER%',
            '%CANDFIRSTNAME%',
            '%CANDFULLNAME%'
        );
        $replacementStrings = array(
            $candidateData['ownerFullName'],
            $candidateData['firstName'],
            $candidateData['firstName'] . ' ' . $candidateData['lastName'],
            $candidateData['firstName'],
            $candidateData['firstName']
        );
        $statusChangeTemplate = str_replace(
            $stringsToFind,
            $replacementStrings,
            $statusChangeTemplate
        );

        /* Schedule-only mode is disabled. */
        $onlyScheduleEvent = false;

        $calendar = new Calendar($this->_siteID);
        $calendarEventTypes = $calendar->getAllEventTypes();

        if (!eval(Hooks::get('CANDIDATE_ADD_ACTIVITY_CHANGE_STATUS'))) return;

        if (SystemUtility::isSchedulerEnabled() && !$_SESSION['CATS']->isDemo()) {
            $allowEventReminders = true;
        } else {
            $allowEventReminders = false;
        }

        $this->_template->assign('candidateID', $candidateID);
        $this->_template->assign('pipelineRS', $pipelineRS);
        $this->_template->assign('statusRS', $statusRS);
        $this->_template->assign('selectedJobOrderID', $selectedJobOrderID);
        $this->_template->assign('selectedStatusID', $selectedStatusID);
        $this->_template->assign('allowEventReminders', $allowEventReminders);
        $this->_template->assign('userEmail', $_SESSION['CATS']->getEmail());
        $this->_template->assign('calendarEventTypes', $calendarEventTypes);
        $this->_template->assign('statusChangeTemplate', $statusChangeTemplate);
        $this->_template->assign('onlyScheduleEvent', $onlyScheduleEvent);
        $this->_template->assign('emailDisabled', $emailDisabled);
        $this->_template->assign('isFinishedMode', false);
        $this->_template->assign('isJobOrdersMode', false);
        $rejectionReasons = $this->getRejectionReasons();
        $this->_template->assign('rejectionReasons', $rejectionReasons);
        $this->_template->assign(
            'rejectionOtherReasonId',
            $this->getOtherRejectionReasonId($rejectionReasons)
        );
        $this->_template->assign('rejectedStatusId', PIPELINE_STATUS_REJECTED);
        $this->_template->display(
            './modules/candidates/AddActivityChangeStatusModal.tpl'
        );
    }

    private function onAddCandidateTags()
    {
        /* Bail out if we don't have a valid regardingjob order ID. */
        if (!$this->isOptionalIDValid('candidateID', $_POST)) {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid Candidate ID.');
        }

        /* Bail out if we don't have a valid regardingjob order ID. */
        if (!isset($_POST['candidate_tags']) || !is_array($_POST['candidate_tags'])) {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid Tag ID.');
        }

        $candidateID    = $_POST['candidateID'];
        $tagIDs            = $_POST['candidate_tags'];

        $tags = new Tags($this->_siteID);
        $tags->AddTagsToCandidate($candidateID, $tagIDs);

        $this->_template->assign('candidateID', $candidateID);
        $this->_template->assign('isFinishedMode', true);
        $this->_template->display(
            './modules/candidates/AssignCandidateTagModal.tpl'
        );
    }


    private function addCandidateTags()
    {
        /* Bail out if we don't have a valid candidate ID. */
        if (!$this->isRequiredIDValid('candidateID', $_GET)) {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid candidate ID.');
        }

        $candidateID        = $_GET['candidateID'];

        $candidates = new Candidates($this->_siteID);
        $candidateData = $candidates->get($candidateID);

        /* Bail out if we got an empty result set. */
        if (empty($candidateData)) {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this);
            return;
            /*$this->fatalModal(
                'The specified candidate ID could not be found.'
            );*/
        }

        $tags = new Tags($this->_siteID);
        $tagsRS = $tags->getAll();

        $this->_template->assign('candidateID', $candidateID);
        $this->_template->assign('assignedTags', $tags->getCandidateTagsID($candidateID));
        $this->_template->assign('isFinishedMode', false);

        $this->_template->assign('tagsRS', $tagsRS);
        $this->_template->display(
            './modules/candidates/AssignCandidateTagModal.tpl'
        );
    }


    private function onAddActivityChangeStatus()
    {
        /* Bail out if we don't have a valid regardingjob order ID. */
        if (!$this->isOptionalIDValid('regardingID', $_POST)) {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid job order ID.');
        }

        $regardingID = $_POST['regardingID'];

        $this->_addActivityChangeStatus(false, $regardingID);
    }

    /*
     * Called by handleRequest() to process removing a candidate from the
     * pipeline for a job order.
     */
    private function onRemoveFromPipeline()
    {
        $input = $_POST;
        if (!$this->isRequiredIDValid('candidateID', $input)) {
            $input = $_GET;
        }
        $isModernJSON = (strtolower($this->getTrimmedInput('format', $_REQUEST)) === 'modern-json');

        /* Bail out if we don't have a valid candidate ID. */
        if (!$this->isRequiredIDValid('candidateID', $input)) {
            if ($isModernJSON)
            {
                if (!headers_sent())
                {
                    header('HTTP/1.1 400 Bad Request');
                    header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                }
                echo json_encode(array(
                    'success' => false,
                    'code' => 'invalidCandidate',
                    'message' => 'Invalid candidate ID.'
                ));
                return;
            }
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid candidate ID.');
        }

        /* Bail out if we don't have a valid job order ID. */
        if (!$this->isRequiredIDValid('jobOrderID', $input)) {
            if ($isModernJSON)
            {
                if (!headers_sent())
                {
                    header('HTTP/1.1 400 Bad Request');
                    header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                }
                echo json_encode(array(
                    'success' => false,
                    'code' => 'invalidJobOrder',
                    'message' => 'Invalid job order ID.'
                ));
                return;
            }
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid job order ID.');
        }

        $candidateID = $input['candidateID'];
        $jobOrderID  = $input['jobOrderID'];
        $commentText = $this->getTrimmedInput('comment', $input);
        if ($isModernJSON)
        {
            $securityToken = $this->getTrimmedInput('securityToken', $input);
            if (!$this->isCSRFTokenValid('candidates.removeFromPipeline', $securityToken))
            {
                if (!headers_sent())
                {
                    header('HTTP/1.1 403 Forbidden');
                    header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                }
                echo json_encode(array(
                    'success' => false,
                    'code' => 'invalidToken',
                    'message' => 'Invalid security token.'
                ));
                return;
            }
        }
        if (!isset($input['comment']))
        {
            if ($isModernJSON)
            {
                $commentText = '';
            }
            else
            {
            $this->renderRemoveFromPipelineForm($candidateID, $jobOrderID);
            return;
            }
        }

        if (!eval(Hooks::get('CANDIDATE_REMOVE_FROM_PIPELINE_PRE'))) return;

        $pipelines = new Pipelines($this->_siteID);
        $pipelines->remove($candidateID, $jobOrderID, $this->_userID, $commentText);

        if (!eval(Hooks::get('CANDIDATE_REMOVE_FROM_PIPELINE_POST'))) return;

        if ($isModernJSON)
        {
            if (!headers_sent())
            {
                header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
            }
            echo json_encode(array(
                'success' => true,
                'message' => 'Candidate removed from pipeline.',
                'candidateID' => (int) $candidateID,
                'jobOrderID' => (int) $jobOrderID
            ));
            return;
        }

        if ($this->isPopupRequest())
        {
            echo '<html><head><script type="text/javascript">',
                 'if (parent && parent.hidePopWinRefresh) { parent.hidePopWinRefresh(false); }',
                 'else if (parent && parent.hidePopWin) { parent.hidePopWin(false); parent.location.reload(); }',
                 'else { window.location.reload(); }',
                 '</script></head><body></body></html>';
            return;
        }

        CATSUtility::transferRelativeURI(
            'm=candidates&a=show&candidateID=' . $candidateID
        );
    }

    private function renderRemoveFromPipelineForm($candidateID, $jobOrderID)
    {
        $this->_template->assign('active', $this);
        $this->_template->assign('candidateID', $candidateID);
        $this->_template->assign('jobOrderID', $jobOrderID);

        if ($this->isPopupRequest())
        {
            $this->_template->display('./modules/candidates/RemoveFromPipelineModal.tpl');
            return;
        }

        $this->_template->display('./modules/candidates/RemoveFromPipeline.tpl');
    }

    private function isPopupRequest()
    {
        if (isset($_REQUEST['display']))
        {
            $display = strtolower(trim($_REQUEST['display']));
            return ($display === 'popup' || $display === '1' || $display === 'true');
        }

        return false;
    }

    /*
     * Called by handleRequest() to process loading the search page.
     */
    private function search()
    {
        $savedSearches = new SavedSearches($this->_siteID);
        $savedSearchRS = $savedSearches->get(DATA_ITEM_CANDIDATE);

        if (!eval(Hooks::get('CANDIDATE_SEARCH'))) return;

        $this->_template->assign('wildCardString', '');
        $this->_template->assign('savedSearchRS', $savedSearchRS);
        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', 'Search Candidates');
        $this->_template->assign('isResultsMode', false);
        $this->_template->assign('isResumeMode', false);
        $this->_template->assign('resumeWildCardString', '');
        $this->_template->assign('keySkillsWildCardString', '');
        $this->_template->assign('fullNameWildCardString', '');
        $this->_template->assign('phoneNumberWildCardString', '');
        $this->_template->assign('mode', '');
        $this->_template->display('./modules/candidates/Search.tpl');
    }

    /*
     * Called by handleRequest() to process displaying the search results.
     */
    private function onSearch()
    {
        /* Bail out to prevent an error if the GET string doesn't even contain
         * a field named 'wildCardString' at all.
         */
        if (!isset($_GET['wildCardString'])) {
            $this->listByView('No wild card string specified.');
            return;
        }

        $query = trim($_GET['wildCardString']);

        /* Initialize stored wildcard strings to safe default values. */
        $resumeWildCardString      = '';
        $keySkillsWildCardString   = '';
        $phoneNumberWildCardString = '';
        $fullNameWildCardString    = '';

        /* Set up sorting. */
        if ($this->isRequiredIDValid('page', $_GET)) {
            $currentPage = $_GET['page'];
        } else {
            $currentPage = 1;
        }

        $searchPager = new SearchPager(
            CANDIDATES_PER_PAGE,
            $currentPage,
            $this->_siteID
        );

        if ($searchPager->isSortByValid('sortBy', $_GET)) {
            $sortBy = $_GET['sortBy'];
        } else {
            $sortBy = 'lastName';
        }

        if ($searchPager->isSortDirectionValid('sortDirection', $_GET)) {
            $sortDirection = $_GET['sortDirection'];
        } else {
            $sortDirection = 'ASC';
        }

        $baseURL = CATSUtility::getFilteredGET(
            array('sortBy', 'sortDirection', 'page'),
            '&amp;'
        );
        $searchPager->setSortByParameters($baseURL, $sortBy, $sortDirection);

        $candidates = new Candidates($this->_siteID);

        /* Get our current searching mode. */
        $mode = $this->getTrimmedInput('mode', $_GET);

        /* Execute the search. */
        $search = new SearchCandidates($this->_siteID);
        switch ($mode) {
            case 'searchByFullName':
                $rs = $search->byFullName($query, $sortBy, $sortDirection);

                foreach ($rs as $rowIndex => $row) {
                    if (!empty($row['ownerFirstName'])) {
                        $rs[$rowIndex]['ownerAbbrName'] = StringUtility::makeInitialName(
                            $row['ownerFirstName'],
                            $row['ownerLastName'],
                            false,
                            LAST_NAME_MAXLEN
                        );
                    } else {
                        $rs[$rowIndex]['ownerAbbrName'] = 'None';
                    }

                    $rsResume = $candidates->getResumes($row['candidateID']);
                    if (isset($rsResume[0])) {
                        $rs[$rowIndex]['resumeID'] = $rsResume[0]['attachmentID'];
                    }
                }

                $isResumeMode = false;

                $fullNameWildCardString = $query;
                break;

            case 'searchByKeySkills':
                $rs = $search->byKeySkills($query, $sortBy, $sortDirection);

                foreach ($rs as $rowIndex => $row) {
                    if (!empty($row['ownerFirstName'])) {
                        $rs[$rowIndex]['ownerAbbrName'] = StringUtility::makeInitialName(
                            $row['ownerFirstName'],
                            $row['ownerLastName'],
                            false,
                            LAST_NAME_MAXLEN
                        );
                    } else {
                        $rs[$rowIndex]['ownerAbbrName'] = 'None';
                    }

                    $rsResume = $candidates->getResumes($row['candidateID']);
                    if (isset($rsResume[0])) {
                        $rs[$rowIndex]['resumeID'] = $rsResume[0]['attachmentID'];
                    }
                }

                $isResumeMode = false;

                $keySkillsWildCardString = $query;

                break;

            case 'searchByResume':
                $searchPager = new SearchByResumePager(
                    20,
                    $currentPage,
                    $this->_siteID,
                    $query,
                    $sortBy,
                    $sortDirection
                );

                $baseURL = 'm=candidates&amp;a=search&amp;getback=getback&amp;mode=searchByResume&amp;wildCardString='
                    . urlencode($query)
                    . '&amp;searchByResume=Search';

                $searchPager->setSortByParameters(
                    $baseURL,
                    $sortBy,
                    $sortDirection
                );

                $rs = $searchPager->getPage();

                $currentPage = $searchPager->getCurrentPage();
                $totalPages  = $searchPager->getTotalPages();

                $pageStart = $searchPager->getThisPageStartRow() + 1;

                if (($searchPager->getThisPageStartRow() + 20) <= $searchPager->getTotalRows()) {
                    $pageEnd = $searchPager->getThisPageStartRow() + 20;
                } else {
                    $pageEnd = $searchPager->getTotalRows();
                }

                foreach ($rs as $rowIndex => $row) {
                    $rs[$rowIndex]['excerpt'] = SearchUtility::searchExcerpt(
                        $query,
                        $row['text']
                    );

                    if (!empty($row['ownerFirstName'])) {
                        $rs[$rowIndex]['ownerAbbrName'] = StringUtility::makeInitialName(
                            $row['ownerFirstName'],
                            $row['ownerLastName'],
                            false,
                            LAST_NAME_MAXLEN
                        );
                    } else {
                        $rs[$rowIndex]['ownerAbbrName'] = 'None';
                    }
                }

                $isResumeMode = true;

                $this->_template->assign('active', $this);
                $this->_template->assign('currentPage', $currentPage);
                $this->_template->assign('pageStart', $pageStart);
                $this->_template->assign('totalResults', $searchPager->getTotalRows());
                $this->_template->assign('pageEnd', $pageEnd);
                $this->_template->assign('totalPages', $totalPages);

                $resumeWildCardString = $query;
                break;

            case 'phoneNumber':
                $rs = $search->byPhone($query, $sortBy, $sortDirection);

                foreach ($rs as $rowIndex => $row) {
                    if (!empty($row['ownerFirstName'])) {
                        $rs[$rowIndex]['ownerAbbrName'] = StringUtility::makeInitialName(
                            $row['ownerFirstName'],
                            $row['ownerLastName'],
                            false,
                            LAST_NAME_MAXLEN
                        );
                    } else {
                        $rs[$rowIndex]['ownerAbbrName'] = 'None';
                    }

                    $rsResume = $candidates->getResumes($row['candidateID']);
                    if (isset($rsResume[0])) {
                        $rs[$rowIndex]['resumeID'] = $rsResume[0]['attachmentID'];
                    }
                }

                $isResumeMode = false;

                $phoneNumberWildCardString = $query;
                break;

            default:
                $this->listByView('Invalid search mode.');
                return;
                break;
        }

        $candidateIDs = implode(',', ResultSetUtility::getColumnValues($rs, 'candidateID'));
        $exportForm = ExportUtility::getForm(
            DATA_ITEM_CANDIDATE,
            $candidateIDs,
            32,
            9
        );

        if (!eval(Hooks::get('CANDIDATE_ON_SEARCH'))) return;

        /* Save the search. */
        $savedSearches = new SavedSearches($this->_siteID);
        $savedSearches->add(
            DATA_ITEM_CANDIDATE,
            $query,
            $_SERVER['REQUEST_URI'],
            false
        );
        $savedSearchRS = $savedSearches->get(DATA_ITEM_CANDIDATE);

        $this->_template->assign('savedSearchRS', $savedSearchRS);
        $this->_template->assign('exportForm', $exportForm);
        $this->_template->assign('active', $this);
        $this->_template->assign('rs', $rs);
        $this->_template->assign('pager', $searchPager);
        $this->_template->assign('isResultsMode', true);
        $this->_template->assign('isResumeMode', $isResumeMode);
        $this->_template->assign('wildCardString', $query);
        $this->_template->assign('resumeWildCardString', $resumeWildCardString);
        $this->_template->assign('keySkillsWildCardString', $keySkillsWildCardString);
        $this->_template->assign('fullNameWildCardString', $fullNameWildCardString);
        $this->_template->assign('phoneNumberWildCardString', $phoneNumberWildCardString);
        $this->_template->assign('mode', $mode);
        $this->_template->display('./modules/candidates/Search.tpl');
    }

    private function getRejectionReasons()
    {
        $db = DatabaseConnection::getInstance();
        $sql = sprintf(
            "SELECT
                rejection_reason_id AS reasonID,
                label
            FROM
                rejection_reason
            ORDER BY
                rejection_reason_id ASC"
        );

        $rs = $db->getAllAssoc($sql);
        if (!is_array($rs))
        {
            return array();
        }

        return $rs;
    }

    private function getOtherRejectionReasonId($rejectionReasons)
    {
        foreach ($rejectionReasons as $reason)
        {
            if (strcasecmp($reason['label'], 'OTHER REASONS / NOT MENTIONED') === 0)
            {
                return (int) $reason['reasonID'];
            }
        }

        return 0;
    }

    /*
     * Called by handleRequest() to process showing a resume preview.
     */
    private function viewResume()
    {
        /* Bail out if we don't have a valid candidate ID. */
        if (!$this->isRequiredIDValid('attachmentID', $_GET)) {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid attachment ID.');
        }

        $attachmentID = $_GET['attachmentID'];

        /* Get the search string. */
        $query = $this->getTrimmedInput('wildCardString', $_GET);

        /* Get resume text. */
        $candidates = new Candidates($this->_siteID);
        $data = $candidates->getResume($attachmentID);

        if (!empty($data)) {
            /* Keyword highlighting. */
            $data['text'] = SearchUtility::makePreview($query, $data['text']);
        }

        if (!eval(Hooks::get('CANDIDATE_VIEW_RESUME'))) return;

        $this->_template->assign('active', $this);
        $this->_template->assign('data', $data);
        $this->_template->display('./modules/candidates/ResumeView.tpl');
    }

    private function addEditImage()
    {
        /* Bail out if we don't have a valid candidate ID. */
        if (!$this->isRequiredIDValid('candidateID', $_GET)) {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid candidate ID.');
        }

        $candidateID = $_GET['candidateID'];

        $attachments = new Attachments($this->_siteID);
        $attachmentsRS = $attachments->getAll(
            DATA_ITEM_CANDIDATE,
            $candidateID
        );

        if (!eval(Hooks::get('CANDIDATE_ADD_EDIT_IMAGE'))) return;

        $this->_template->assign('isFinishedMode', false);
        $this->_template->assign('candidateID', $candidateID);
        $this->_template->assign('attachmentsRS', $attachmentsRS);
        $this->_template->display(
            './modules/candidates/CreateImageAttachmentModal.tpl'
        );
    }

    /*
     * Called by handleRequest() to process creating an attachment.
     */
    private function onAddEditImage()
    {
        /* Bail out if we don't have a valid candidate ID. */
        if (!$this->isRequiredIDValid('candidateID', $_POST)) {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid candidate ID.');
        }

        $candidateID = $_POST['candidateID'];

        if (!eval(Hooks::get('CANDIDATE_ON_ADD_EDIT_IMAGE_PRE'))) return;

        $attachmentCreator = new AttachmentCreator($this->_siteID);
        $attachmentCreator->createFromUpload(
            DATA_ITEM_CANDIDATE,
            $candidateID,
            'file',
            true,
            false
        );

        if ($attachmentCreator->isError()) {
            CommonErrors::fatalModal(COMMONERROR_FILEERROR, $this, $attachmentCreator->getError());
            return;
            //$this->fatalModal($attachmentCreator->getError());
        }

        if (!eval(Hooks::get('CANDIDATE_ON_ADD_EDIT_IMAGE_POST'))) return;

        $this->_template->assign('isFinishedMode', true);
        $this->_template->assign('candidateID', $candidateID);
        $this->_template->display(
            './modules/candidates/CreateImageAttachmentModal.tpl'
        );
    }

    /*
     * Called by handleRequest() to process loading the create attachment
     * modal dialog.
     */
    private function createAttachment()
    {
        /* Bail out if we don't have a valid candidate ID. */
        if (!$this->isRequiredIDValid('candidateID', $_GET)) {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid candidate ID.');
        }

        $candidateID = $_GET['candidateID'];

        if (!eval(Hooks::get('CANDIDATE_CREATE_ATTACHMENT'))) return;

        $this->_template->assign('isFinishedMode', false);
        $this->_template->assign('candidateID', $candidateID);
        $this->_template->display(
            './modules/candidates/CreateAttachmentModal.tpl'
        );
    }

    /*
     * Called by handleRequest() to process creating an attachment.
     */
    private function onCreateAttachment()
    {
        /* Bail out if we don't have a valid candidate ID. */
        if (!$this->isRequiredIDValid('candidateID', $_POST)) {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid candidate ID.');
        }

        /* Bail out if we don't have a valid resume status. */
        if (
            !$this->isRequiredIDValid('resume', $_POST, true) ||
            $_POST['resume'] < 0 || $_POST['resume'] > 1
        ) {
            CommonErrors::fatalModal(COMMONERROR_RECORDERROR, $this, 'Invalid resume status.');
        }

        $candidateID = $_POST['candidateID'];

        if ($_POST['resume'] == '1') {
            $isResume = true;
        } else {
            $isResume = false;
        }

        if (!eval(Hooks::get('CANDIDATE_ON_CREATE_ATTACHMENT_PRE'))) return;

        $attachmentCreator = new AttachmentCreator($this->_siteID);
        $attachmentCreator->createFromUpload(
            DATA_ITEM_CANDIDATE,
            $candidateID,
            'file',
            false,
            $isResume
        );

        if ($attachmentCreator->isError()) {
            CommonErrors::fatalModal(COMMONERROR_FILEERROR, $this, $attachmentCreator->getError());
            return;
            //$this->fatalModal($attachmentCreator->getError());
        }

        if ($attachmentCreator->duplicatesOccurred()) {
            $this->fatalModal(
                'This attachment has already been added to this candidate.'
            );
        }

        $isTextExtractionError = $attachmentCreator->isTextExtractionError();
        $textExtractionErrorMessage = $attachmentCreator->getTextExtractionError();
        $resumeText = $attachmentCreator->getExtractedText();

        if (!eval(Hooks::get('CANDIDATE_ON_CREATE_ATTACHMENT_POST'))) return;

        $this->_template->assign('resumeText', $resumeText);
        $this->_template->assign('isFinishedMode', true);
        $this->_template->assign('candidateID', $candidateID);
        $this->_template->display(
            './modules/candidates/CreateAttachmentModal.tpl'
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
        if (!$this->isRequiredIDValid('attachmentID', $_POST)) {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid attachment ID.');
        }

        /* Bail out if we don't have a valid candidate ID. */
        if (!$this->isRequiredIDValid('candidateID', $_POST)) {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid candidate ID.');
        }

        $candidateID  = $_POST['candidateID'];
        $attachmentID = $_POST['attachmentID'];
        $securityToken = $this->getTrimmedInput('securityToken', $_POST);

        if (!$this->isCSRFTokenValid('candidates.deleteAttachment', $securityToken))
        {
            CommonErrors::fatalModal(COMMONERROR_PERMISSION, $this, 'Invalid request token.');
        }

        if (!eval(Hooks::get('CANDIDATE_ON_DELETE_ATTACHMENT_PRE'))) return;

        $attachments = new Attachments($this->_siteID);
        $attachmentRS = $attachments->get($attachmentID, true);
        if (empty($attachmentRS) ||
            (int) $attachmentRS['dataItemType'] !== DATA_ITEM_CANDIDATE ||
            (int) $attachmentRS['dataItemID'] !== (int) $candidateID)
        {
            CommonErrors::fatalModal(COMMONERROR_PERMISSION, $this, 'Attachment does not belong to this candidate.');
        }

        $attachments->delete($attachmentID);

        if (!eval(Hooks::get('CANDIDATE_ON_DELETE_ATTACHMENT_POST'))) return;

        CATSUtility::transferRelativeURI(
            'm=candidates&a=show&candidateID=' . $candidateID
        );
    }

    private function onAddProfileComment()
    {
        $isModernJSON = (strtolower($this->getTrimmedInput('format', $_REQUEST)) === 'modern-json');
        if ($_SERVER['REQUEST_METHOD'] !== 'POST')
        {
            if ($isModernJSON)
            {
                if (!headers_sent())
                {
                    header('HTTP/1.1 405 Method Not Allowed');
                    header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                }
                echo json_encode(array(
                    'success' => false,
                    'code' => 'invalidMethod',
                    'message' => 'Invalid request method.'
                ));
                return;
            }
            CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid request method.');
        }

        if (!$this->isRequiredIDValid('candidateID', $_POST))
        {
            if ($isModernJSON)
            {
                if (!headers_sent())
                {
                    header('HTTP/1.1 400 Bad Request');
                    header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                }
                echo json_encode(array(
                    'success' => false,
                    'code' => 'invalidCandidate',
                    'message' => 'Invalid candidate ID.'
                ));
                return;
            }
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid candidate ID.');
        }

        $candidateID = (int) $_POST['candidateID'];
        $candidates = new Candidates($this->_siteID);
        if (empty($candidates->get($candidateID)))
        {
            if ($isModernJSON)
            {
                if (!headers_sent())
                {
                    header('HTTP/1.1 404 Not Found');
                    header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                }
                echo json_encode(array(
                    'success' => false,
                    'code' => 'candidateNotFound',
                    'message' => 'The specified candidate ID could not be found.'
                ));
                return;
            }
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'The specified candidate ID could not be found.');
        }

        $redirectParams = array('showComments' => '1');

        $securityToken = $this->getTrimmedInput('securityToken', $_POST);
        if (!$this->isCSRFTokenValid('candidates.addProfileComment', $securityToken))
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
                    'success' => false,
                    'code' => 'invalidToken',
                    'message' => 'Invalid security token.'
                ));
                return;
            }
            $this->redirectToCandidateShow($candidateID, array_merge(
                $redirectParams,
                array('comment' => 'token')
            ));
        }

        $candidateComment = $this->getTrimmedInput('commentText', $_POST);
        if ($candidateComment === '')
        {
            if ($isModernJSON)
            {
                if (!headers_sent())
                {
                    header('HTTP/1.1 400 Bad Request');
                    header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                }
                echo json_encode(array(
                    'success' => false,
                    'code' => 'emptyComment',
                    'message' => 'Comment text is required.'
                ));
                return;
            }
            $this->redirectToCandidateShow($candidateID, array_merge(
                $redirectParams,
                array('comment' => 'empty')
            ));
        }

        if (strlen($candidateComment) > self::PROFILE_COMMENT_MAXLEN)
        {
            if ($isModernJSON)
            {
                if (!headers_sent())
                {
                    header('HTTP/1.1 400 Bad Request');
                    header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                }
                echo json_encode(array(
                    'success' => false,
                    'code' => 'commentTooLong',
                    'message' => 'Comment is too long.'
                ));
                return;
            }
            $this->redirectToCandidateShow($candidateID, array_merge(
                $redirectParams,
                array('comment' => 'tooLong')
            ));
        }

        $candidateCommentCategory = $this->getTrimmedInput('commentCategory', $_POST);
        $candidateCommentCategories = $this->getCandidateCommentCategories();
        if (!in_array($candidateCommentCategory, $candidateCommentCategories, true))
        {
            $candidateCommentCategory = 'General';
        }

        $activityEntries = new ActivityEntries($this->_siteID);
        $activityID = $activityEntries->add(
            $candidateID,
            DATA_ITEM_CANDIDATE,
            self::PROFILE_COMMENT_ACTIVITY_TYPE,
            htmlspecialchars(
                $this->makeCandidateProfileComment(
                    $candidateCommentCategory,
                    $candidateComment
                ),
                ENT_QUOTES
            ),
            $this->_userID,
            -1
        );

        if (empty($activityID))
        {
            if ($isModernJSON)
            {
                if (!headers_sent())
                {
                    header('HTTP/1.1 500 Internal Server Error');
                    header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                }
                echo json_encode(array(
                    'success' => false,
                    'code' => 'commentSaveFailed',
                    'message' => 'Failed to save comment.'
                ));
                return;
            }
            $this->redirectToCandidateShow($candidateID, array_merge(
                $redirectParams,
                array('comment' => 'failed')
            ));
        }

        if ($isModernJSON)
        {
            if (!headers_sent())
            {
                header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
            }
            echo json_encode(array(
                'success' => true,
                'code' => 'commentAdded',
                'message' => 'Comment added.'
            ));
            return;
        }

        $this->redirectToCandidateShow($candidateID, array_merge(
            $redirectParams,
            array('comment' => 'added')
        ));
    }

    private function onPostCandidateMessage()
    {
        $isModernJSON = (strtolower($this->getTrimmedInput('format', $_REQUEST)) === 'modern-json');
        if ($_SERVER['REQUEST_METHOD'] !== 'POST')
        {
            if ($isModernJSON)
            {
                if (!headers_sent())
                {
                    header('HTTP/1.1 405 Method Not Allowed');
                    header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                }
                echo json_encode(array(
                    'success' => false,
                    'code' => 'invalidMethod',
                    'message' => 'Invalid request method.'
                ));
                return;
            }
            CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid request method.');
        }

        if (!$this->isRequiredIDValid('candidateID', $_POST))
        {
            if ($isModernJSON)
            {
                if (!headers_sent())
                {
                    header('HTTP/1.1 400 Bad Request');
                    header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                }
                echo json_encode(array(
                    'success' => false,
                    'code' => 'invalidCandidate',
                    'message' => 'Invalid candidate ID.'
                ));
                return;
            }
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid candidate ID.');
        }

        $candidateID = (int) $_POST['candidateID'];
        $securityToken = $this->getTrimmedInput('securityToken', $_POST);
        if (!$this->isCSRFTokenValid('candidates.postMessage', $securityToken))
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
                    'success' => false,
                    'code' => 'invalidToken',
                    'message' => 'Invalid security token.'
                ));
                return;
            }
            $this->redirectToCandidateShow($candidateID, array('showMessages' => '1', 'msg' => 'token'));
        }

        $candidates = new Candidates($this->_siteID);
        if (empty($candidates->get($candidateID)))
        {
            if ($isModernJSON)
            {
                if (!headers_sent())
                {
                    header('HTTP/1.1 404 Not Found');
                    header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                }
                echo json_encode(array(
                    'success' => false,
                    'code' => 'candidateNotFound',
                    'message' => 'The specified candidate ID could not be found.'
                ));
                return;
            }
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'The specified candidate ID could not be found.');
        }

        $candidateMessages = new CandidateMessages($this->_siteID);
        if (!$candidateMessages->isSchemaAvailable())
        {
            if ($isModernJSON)
            {
                if (!headers_sent())
                {
                    header('HTTP/1.1 409 Conflict');
                    header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                }
                echo json_encode(array(
                    'success' => false,
                    'code' => 'schema',
                    'message' => 'Messaging tables are missing.'
                ));
                return;
            }
            $this->redirectToCandidateShow($candidateID, array('showMessages' => '1', 'msg' => 'schema'));
        }

        $messageBody = $this->getTrimmedInput('messageBody', $_POST);
        $result = $candidateMessages->postMessageForCandidate(
            $candidateID,
            $this->_userID,
            $messageBody
        );

        if (empty($result['success']))
        {
            $error = isset($result['error']) ? $result['error'] : 'failed';
            if ($isModernJSON)
            {
                if (!headers_sent())
                {
                    header('HTTP/1.1 400 Bad Request');
                    header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                }
                echo json_encode(array(
                    'success' => false,
                    'code' => $error,
                    'message' => 'Unable to post message.'
                ));
                return;
            }
            $this->redirectToCandidateShow($candidateID, array(
                'showMessages' => '1',
                'msg' => $error
            ));
        }

        if ($isModernJSON)
        {
            if (!headers_sent())
            {
                header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
            }
            echo json_encode(array(
                'success' => true,
                'code' => 'sent',
                'message' => 'Message sent.'
            ));
            return;
        }

        $this->redirectToCandidateShow($candidateID, array(
            'showMessages' => '1',
            'msg' => 'sent'
        ));
    }

    private function onDeleteCandidateMessageThread()
    {
        $isModernJSON = (strtolower($this->getTrimmedInput('format', $_REQUEST)) === 'modern-json');
        if ($_SERVER['REQUEST_METHOD'] !== 'POST')
        {
            if ($isModernJSON)
            {
                if (!headers_sent())
                {
                    header('HTTP/1.1 405 Method Not Allowed');
                    header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                }
                echo json_encode(array(
                    'success' => false,
                    'code' => 'invalidMethod',
                    'message' => 'Invalid request method.'
                ));
                return;
            }
            CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid request method.');
        }

        if (!$this->isRequiredIDValid('candidateID', $_POST))
        {
            if ($isModernJSON)
            {
                if (!headers_sent())
                {
                    header('HTTP/1.1 400 Bad Request');
                    header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                }
                echo json_encode(array(
                    'success' => false,
                    'code' => 'invalidCandidate',
                    'message' => 'Invalid candidate ID.'
                ));
                return;
            }
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid candidate ID.');
        }

        if (!$this->isRequiredIDValid('threadID', $_POST))
        {
            if ($isModernJSON)
            {
                if (!headers_sent())
                {
                    header('HTTP/1.1 400 Bad Request');
                    header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                }
                echo json_encode(array(
                    'success' => false,
                    'code' => 'invalidThread',
                    'message' => 'Invalid thread ID.'
                ));
                return;
            }
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid thread ID.');
        }

        $candidateID = (int) $_POST['candidateID'];
        $threadID = (int) $_POST['threadID'];
        $securityToken = $this->getTrimmedInput('securityToken', $_POST);
        if (!$this->isCSRFTokenValid('candidates.deleteMessageThread', $securityToken))
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
                    'success' => false,
                    'code' => 'invalidToken',
                    'message' => 'Invalid security token.'
                ));
                return;
            }
            $this->redirectToCandidateShow($candidateID, array('showMessages' => '1', 'msg' => 'token'));
        }

        $candidateMessages = new CandidateMessages($this->_siteID);
        if (!$candidateMessages->isSchemaAvailable())
        {
            if ($isModernJSON)
            {
                if (!headers_sent())
                {
                    header('HTTP/1.1 409 Conflict');
                    header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                }
                echo json_encode(array(
                    'success' => false,
                    'code' => 'schema',
                    'message' => 'Messaging tables are missing.'
                ));
                return;
            }
            $this->redirectToCandidateShow($candidateID, array('showMessages' => '1', 'msg' => 'schema'));
        }

        $thread = $candidateMessages->getThread($threadID);
        if (empty($thread) || (int) $thread['candidateID'] !== $candidateID)
        {
            if ($isModernJSON)
            {
                if (!headers_sent())
                {
                    header('HTTP/1.1 404 Not Found');
                    header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                }
                echo json_encode(array(
                    'success' => false,
                    'code' => 'invalid',
                    'message' => 'Message thread not found for this candidate.'
                ));
                return;
            }
            $this->redirectToCandidateShow($candidateID, array('showMessages' => '1', 'msg' => 'invalid'));
        }

        if (!$candidateMessages->isUserParticipant($threadID, $this->_userID))
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
                    'success' => false,
                    'code' => 'forbidden',
                    'message' => 'You are not allowed to delete this thread.'
                ));
                return;
            }
            $this->redirectToCandidateShow($candidateID, array('showMessages' => '1', 'msg' => 'forbidden'));
        }

        if (!$candidateMessages->deleteThread($threadID))
        {
            if ($isModernJSON)
            {
                if (!headers_sent())
                {
                    header('HTTP/1.1 500 Internal Server Error');
                    header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                }
                echo json_encode(array(
                    'success' => false,
                    'code' => 'deletefailed',
                    'message' => 'Failed to delete thread.'
                ));
                return;
            }
            $this->redirectToCandidateShow($candidateID, array('showMessages' => '1', 'msg' => 'deletefailed'));
        }

        if ($isModernJSON)
        {
            if (!headers_sent())
            {
                header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
            }
            echo json_encode(array(
                'success' => true,
                'code' => 'deleted',
                'message' => 'Thread deleted.'
            ));
            return;
        }

        $this->redirectToCandidateShow($candidateID, array('showMessages' => '1', 'msg' => 'deleted'));
    }

    private function getCandidateProfileComments($candidateID)
    {
        $activityEntries = new ActivityEntries($this->_siteID);
        $activityRS = $activityEntries->getAllByDataItem($candidateID, DATA_ITEM_CANDIDATE);
        if (empty($activityRS))
        {
            return array();
        }

        $comments = array();
        foreach ($activityRS as $activityData)
        {
            $parsedComment = $this->parseCandidateProfileComment($activityData['notes']);
            if ($parsedComment === false)
            {
                continue;
            }

            $enteredBy = trim(
                $activityData['enteredByFirstName'] . ' ' . $activityData['enteredByLastName']
            );
            if ($enteredBy === '')
            {
                $enteredBy = 'Unknown User';
            }

            $comments[] = array(
                'activityID' => (int) $activityData['activityID'],
                'dateCreated' => $activityData['dateCreated'],
                'enteredBy' => $enteredBy,
                'category' => $parsedComment['category'],
                'commentHTML' => nl2br(htmlspecialchars($parsedComment['comment'], ENT_QUOTES))
            );
        }

        return array_reverse($comments);
    }

    private function getCandidateCommentCategories()
    {
        return array(
            'General',
            'Interview Feedback',
            'Technical Feedback',
            'Client Feedback',
            'Internal Note'
        );
    }

    private function makeCandidateProfileComment($category, $comment)
    {
        return self::PROFILE_COMMENT_MARKER . '[' . $category . '] ' . $comment;
    }

    private function parseCandidateProfileComment($note)
    {
        $decoded = html_entity_decode((string) $note, ENT_QUOTES);
        if (strpos($decoded, self::PROFILE_COMMENT_MARKER) !== 0)
        {
            return false;
        }

        $payload = trim(substr($decoded, strlen(self::PROFILE_COMMENT_MARKER)));
        if ($payload === '')
        {
            return false;
        }

        $category = 'General';
        $comment = $payload;
        if (preg_match('/^\[([^\]]+)\]\s*(.*)$/s', $payload, $matches))
        {
            if (trim($matches[1]) !== '')
            {
                $category = trim($matches[1]);
            }
            $comment = trim($matches[2]);
        }

        if ($comment === '')
        {
            return false;
        }

        return array(
            'category' => $category,
            'comment' => $comment
        );
    }

    private function redirectToCandidateShow($candidateID, $params = array())
    {
        $transferURI = 'm=candidates&a=show&candidateID=' . (int) $candidateID;
        if (!empty($params))
        {
            $queryParts = array();
            foreach ($params as $key => $value)
            {
                $queryParts[] = rawurlencode($key) . '=' . rawurlencode((string) $value);
            }
            $transferURI .= '&' . implode('&', $queryParts);
        }

        CATSUtility::transferRelativeURI($transferURI);
    }

    //TODO: Document me.
    //Only accessable by MSA users - hides this job order from everybody by
    private function administrativeHideShow()
    {
        /* Bail out if we don't have a valid joborder ID. */
        if (!$this->isRequiredIDValid('candidateID', $_GET)) {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid Job Order ID.');
        }

        /* Bail out if we don't have a valid status ID. */
        if (!$this->isRequiredIDValid('state', $_GET, true)) {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid state ID.');
        }

        $candidateID = $_GET['candidateID'];

        // FIXME: Checkbox?
        $state = (bool) $_GET['state'];

        $candidates = new Candidates($this->_siteID);
        $candidates->administrativeHideShow($candidateID, $state);

        CATSUtility::transferRelativeURI('m=candidates&a=show&candidateID=' . $candidateID);
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
        if (empty($resultSet)) {
            return $resultSet;
        }

        foreach ($resultSet as $rowIndex => $row) {
            if ($resultSet[$rowIndex]['isHot'] == 1) {
                $resultSet[$rowIndex]['linkClass'] = 'jobLinkHot';
            } else {
                $resultSet[$rowIndex]['linkClass'] = 'jobLinkCold';
            }

            if (!empty($resultSet[$rowIndex]['ownerFirstName'])) {
                $resultSet[$rowIndex]['ownerAbbrName'] = StringUtility::makeInitialName(
                    $resultSet[$rowIndex]['ownerFirstName'],
                    $resultSet[$rowIndex]['ownerLastName'],
                    false,
                    LAST_NAME_MAXLEN
                );
            } else {
                $resultSet[$rowIndex]['ownerAbbrName'] = 'None';
            }

            if ($resultSet[$rowIndex]['submitted'] == 1) {
                $resultSet[$rowIndex]['iconTag'] = '<img src="images/job_orders.gif" alt="" width="16" height="16" title="Proposed to Customer for a Job Order" />';
            } else {
                $resultSet[$rowIndex]['iconTag'] = '<img src="images/mru/blank.gif" alt="" width="16" height="16" />';
            }

            if ($resultSet[$rowIndex]['attachmentPresent'] == 1) {
                $resultSet[$rowIndex]['iconTag'] .= '<img src="images/paperclip.gif" alt="" width="16" height="16" title="Attachment Present" />';
            } else {
                $resultSet[$rowIndex]['iconTag'] .= '<img src="images/mru/blank.gif" alt="" width="16" height="16" />';
            }


            if (empty($resultSet[$rowIndex]['keySkills'])) {
                $resultSet[$rowIndex]['keySkills'] = '&nbsp;';
            } else {
                $resultSet[$rowIndex]['keySkills'] = htmlspecialchars(
                    $resultSet[$rowIndex]['keySkills']
                );
            }

            /* Truncate Key Skills to fit the column width */
            if (strlen($resultSet[$rowIndex]['keySkills']) > self::TRUNCATE_KEYSKILLS) {
                $resultSet[$rowIndex]['keySkills'] = substr(
                    $resultSet[$rowIndex]['keySkills'],
                    0,
                    self::TRUNCATE_KEYSKILLS
                ) . "...";
            }
        }

        return $resultSet;
    }

    /**
     * Adds a candidate. This is factored out for code clarity.
     *
     * @param boolean is modal window
     * @param string module directory
     * @return integer candidate ID
     */
    private function _addCandidate($isModal, $directoryOverride = '')
    {
        /* Module directory override for fatal() calls. */
        if ($directoryOverride != '') {
            $moduleDirectory = $directoryOverride;
        } else {
            $moduleDirectory = $this->_moduleDirectory;
        }

        /* Modal override for fatal() calls. */
        if ($isModal) {
            $fatal = 'fatalModal';
        } else {
            $fatal = 'fatal';
        }

        /* Bail out if we received an invalid availability date; if not, go
         * ahead and convert the date to MySQL format.
         */
        $dateAvailable = $this->getTrimmedInput('dateAvailable', $_POST);
        if (!empty($dateAvailable)) {
            if (!DateUtility::validate('-', $dateAvailable, DATE_FORMAT_MMDDYY)) {
                $this->$fatal('Invalid availability date.', $moduleDirectory);
            }

            /* Convert start_date to something MySQL can understand. */
            $dateAvailable = DateUtility::convert(
                '-',
                $dateAvailable,
                DATE_FORMAT_MMDDYY,
                DATE_FORMAT_YYYYMMDD
            );
        }

        // phoneHome removed: candidates no longer store a separate home phone field

        $formattedPhoneCell = StringUtility::extractPhoneNumber(
            $this->getTrimmedInput('phoneCell', $_POST)
        );
        if (!empty($formattedPhoneCell)) {
            $phoneCell = $formattedPhoneCell;
        } else {
            $phoneCell = $this->getTrimmedInput('phoneCell', $_POST);
        }

        /* Can Relocate */
        $canRelocate = $this->isChecked('canRelocate', $_POST);

        $lastName        = $this->getTrimmedInput('lastName', $_POST);
        $firstName       = $this->getTrimmedInput('firstName', $_POST);
        $email1          = $this->getTrimmedInput('email1', $_POST);
        $address         = $this->getTrimmedInput('address', $_POST);
        $city            = $this->getTrimmedInput('city', $_POST);
        $country         = $this->getTrimmedInput('country', $_POST);
        $source          = $this->getTrimmedInput('source', $_POST);
        $keySkills       = $this->getTrimmedInput('keySkills', $_POST);
        $currentEmployer = $this->getTrimmedInput('currentEmployer', $_POST);
        $currentPay      = $this->getTrimmedInput('currentPay', $_POST);
        $desiredPay      = $this->getTrimmedInput('desiredPay', $_POST);
        $notes           = $this->getTrimmedInput('notes', $_POST);
        $bestTimeToCall  = $this->getTrimmedInput('bestTimeToCall', $_POST);
        $gender          = $this->getTrimmedInput('gender', $_POST);
        $race            = $this->getTrimmedInput('race', $_POST);
        $veteran         = $this->getTrimmedInput('veteran', $_POST);
        $disability      = $this->getTrimmedInput('disability', $_POST);

        $gdprSignedInput = $this->getTrimmedInput('gdprSigned', $_POST);
        $gdprSigned = ((int) $gdprSignedInput === 1) ? 1 : 0;

        $gdprExpirationDateInput = $this->getTrimmedInput('gdprExpirationDate', $_POST);
        $gdprExpirationDate = null;
        if (!empty($gdprExpirationDateInput)) {
            if (!DateUtility::validate('-', $gdprExpirationDateInput, DATE_FORMAT_MMDDYY)) {
                $this->$fatal('Invalid GDPR expiration date.', $moduleDirectory);
            }

            $gdprExpirationDate = DateUtility::convert(
                '-',
                $gdprExpirationDateInput,
                DATE_FORMAT_MMDDYY,
                DATE_FORMAT_YYYYMMDD
            );
        } else if ($gdprSigned) {
            $this->$fatal('GDPR expiration date is required when GDPR Signed is Yes.', $moduleDirectory);
        }
        if (!$gdprSigned) {
            $gdprExpirationDate = null;
        }

        /* Candidate source list editor. */
        $sourceCSV = $this->getTrimmedInput('sourceCSV', $_POST);

        /* Text resume. */
        $textResumeBlock = $this->getTrimmedInput('textResumeBlock', $_POST);
        $textResumeFilename = $this->getTrimmedInput('textResumeFilename', $_POST);

        /* File resume. */
        $associatedFileResumeID = $this->getTrimmedInput('associatedbFileResumeID', $_POST);

        /* Bail out if any of the required fields are empty. */
        if (empty($firstName) || empty($lastName)) {
            CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this);
        }

        if (!eval(Hooks::get('CANDIDATE_ON_ADD_PRE'))) return;

        $candidates = new Candidates($this->_siteID);

        $hardDuplicateID = -1;
        $hardMatchConditions = array();
        $db = DatabaseConnection::getInstance();

        if (!empty($email1) && strpos($email1, '@') !== false)
        {
            $hardDuplicateID = $candidates->getIDByEmail($email1);
            $hardMatchConditions[] = 'candidate.email1 = ' . $db->makeQueryString($email1);
        }

        if (!empty($phoneCell))
        {
            if ($hardDuplicateID <= 0)
            {
                $hardDuplicateID = $candidates->getIDByPhone($phoneCell);
            }
            $hardMatchConditions[] = 'candidate.phone_cell = ' . $db->makeQueryString($phoneCell);
        }

        if (!empty($phoneCell))
        {
            $phoneDigits = preg_replace('/\\D+/', '', $phoneCell);
            if (strlen($phoneDigits) >= 6)
            {
                $phoneRow = $db->getAssoc(sprintf(
                    "SELECT
                        candidate_id AS candidateID
                     FROM
                        candidate
                     WHERE
                        site_id = %s
                        AND REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(phone_cell, ' ', ''), '-', ''), '(', ''), ')', ''), '.', ''), '+', '') = %s
                     LIMIT 1",
                    $db->makeQueryInteger($this->_siteID),
                    $db->makeQueryString($phoneDigits)
                ));
                if (!empty($phoneRow))
                {
                    $hardDuplicateID = (int) $phoneRow['candidateID'];
                }
                $hardMatchConditions[] =
                    "REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(phone_cell, ' ', ''), '-', ''), '(', ''), ')', ''), '.', ''), '+', '') = "
                    . $db->makeQueryString($phoneDigits);
            }
        }

        if ($hardDuplicateID > 0)
        {
            $hardMatches = array();
            if (!empty($hardMatchConditions))
            {
                $hardMatches = $db->getAllAssoc(sprintf(
                    "SELECT
                        candidate_id AS candidateID,
                        first_name AS firstName,
                        last_name AS lastName
                     FROM
                        candidate
                     WHERE
                        site_id = %s
                        AND (%s)
                     ORDER BY
                        date_created DESC
                     LIMIT 5",
                    $db->makeQueryInteger($this->_siteID),
                    implode(' OR ', $hardMatchConditions)
                ));
            }

            $matchLinks = array();
            if (!empty($hardMatches))
            {
                foreach ($hardMatches as $matchRow)
                {
                    $matchID = (int) $matchRow['candidateID'];
                    $matchName = trim($matchRow['firstName'] . ' ' . $matchRow['lastName']);
                    if ($matchName === '')
                    {
                        $matchName = 'Candidate #' . $matchID;
                    }
                    $matchLinks[] = sprintf(
                        '<li><a href="%s" target="_blank">%s</a></li>',
                        htmlspecialchars(
                            CATSUtility::getIndexName() . '?m=candidates&a=show&candidateID=' . $matchID,
                            ENT_QUOTES
                        ),
                        htmlspecialchars($matchName, ENT_QUOTES)
                    );
                }
            }
            else
            {
                $matchLinks[] = sprintf(
                    '<li><a href="%s" target="_blank">Candidate #%d</a></li>',
                    htmlspecialchars(
                        CATSUtility::getIndexName() . '?m=candidates&a=show&candidateID=' . (int) $hardDuplicateID,
                        ENT_QUOTES
                    ),
                    (int) $hardDuplicateID
                );
            }

            $this->$fatal(
                'Duplicate candidate detected (email/phone). Please open the existing candidate profile:<br />'
                . '<ul>' . implode('', $matchLinks) . '</ul>',
                $moduleDirectory
            );
        }

        $duplicatesID = $candidates->checkDuplicity($firstName, $lastName, $email1, $phoneCell, $address, $city);

        $candidateID = $candidates->add(
            $firstName,
            $lastName,
            $email1,
            $phoneCell,
            $address,
            $city,
            $country,
            $source,
            $keySkills,
            $dateAvailable,
            $currentEmployer,
            $canRelocate,
            $currentPay,
            $desiredPay,
            $notes,
            $bestTimeToCall,
            $gdprSigned,
            $gdprExpirationDate,
            $this->_userID,
            $this->_userID,
            $gender,
            $race,
            $veteran,
            $disability
        );


        if ($candidateID <= 0) {
            return $candidateID;
        }

        if (sizeof($duplicatesID) > 0) {
            $candidates->addDuplicates($candidateID, $duplicatesID);
        }

        /* Update extra fields. */
        $candidates->extraFields->setValuesOnEdit($candidateID);

        /* Update possible source list. */
        $sources = $candidates->getPossibleSources();
        $sourcesDifferences = ListEditor::getDifferencesFromList(
            $sources,
            'name',
            'sourceID',
            $sourceCSV
        );
        $candidates->updatePossibleSources($sourcesDifferences);

        /* Associate an exsisting resume if the user created a candidate with one. (Bulk) */
        if (isset($_POST['associatedAttachment'])) {
            $attachmentID = $_POST['associatedAttachment'];

            $attachments = new Attachments($this->_siteID);
            $attachments->setDataItemID($attachmentID, $candidateID, DATA_ITEM_CANDIDATE);
        }

        /* Attach a resume if the user uploaded one. (http POST) */
        /* NOTE: This function cannot be called if parsing is enabled */ else if (isset($_FILES['file']) && !empty($_FILES['file']['name'])) {
            if (!eval(Hooks::get('CANDIDATE_ON_CREATE_ATTACHMENT_PRE'))) return;

            $attachmentCreator = new AttachmentCreator($this->_siteID);
            $attachmentCreator->createFromUpload(
                DATA_ITEM_CANDIDATE,
                $candidateID,
                'file',
                false,
                true
            );

            if ($attachmentCreator->isError()) {
                CommonErrors::fatal(COMMONERROR_FILEERROR, $this, $attachmentCreator->getError());
            }


            if ($attachmentCreator->duplicatesOccurred()) {
                $this->listByView(
                    'This attachment has already been added to this candidate.'
                );
                return;
            }

            $isTextExtractionError = $attachmentCreator->isTextExtractionError();
            $textExtractionErrorMessage = $attachmentCreator->getTextExtractionError();

            // FIXME: Show parse errors!

            if (!eval(Hooks::get('CANDIDATE_ON_CREATE_ATTACHMENT_POST'))) return;
        }

        /**
         * User has loaded and/or parsed a resume. The attachment is saved in a temporary
         * file already and just needs to be attached. The attachment has also successfully
         * been DocumentToText converted, so we know it's a good file.
         */
        else if (LicenseUtility::isParsingEnabled()) {
            /**
             * Description: User clicks "browse" and selects a resume file. User doesn't click
             * upload. The resume file is STILL uploaded.
             * Controversial: User uploads a resume, parses, etc. User selects a new file with
             * "Browse" but doesn't click "Upload". New file is accepted.
             * It's technically correct either way, I'm opting for the "use whats in "file"
             * box over what's already uploaded method to avoid losing resumes on candidate
             * additions.
             */
            $newFile = FileUtility::getUploadFileFromPost($this->_siteID, 'addcandidate', 'documentFile');

            if ($newFile !== false) {
                $newFilePath = FileUtility::getUploadFilePath($this->_siteID, 'addcandidate', $newFile);

                $tempFile = $newFile;
                $tempFullPath = $newFilePath;
            } else {
                $attachmentCreated = false;

                $tempFile = false;
                $tempFullPath = false;

                if (isset($_POST['documentTempFile']) && !empty($_POST['documentTempFile'])) {
                    $tempFile = $_POST['documentTempFile'];
                    // Get the path of the file they uploaded already to attach
                    $tempFullPath = FileUtility::getUploadFilePath(
                        $this->_siteID,   // ID of the containing site
                        'addcandidate',   // Sub-directory in their storage
                        $tempFile         // Name of the file (not pathed)
                    );
                }
            }

            if ($tempFile !== false && $tempFullPath !== false) {
                if (!eval(Hooks::get('CANDIDATE_ON_CREATE_ATTACHMENT_PRE'))) return;

                $attachmentCreator = new AttachmentCreator($this->_siteID);
                $attachmentCreator->createFromFile(
                    DATA_ITEM_CANDIDATE,
                    $candidateID,
                    $tempFullPath,
                    $tempFile,
                    '',
                    true,
                    true
                );

                if ($attachmentCreator->isError()) {
                    CommonErrors::fatal(COMMONERROR_FILEERROR, $this, $attachmentCreator->getError());
                }


                if ($attachmentCreator->duplicatesOccurred()) {
                    $this->listByView(
                        'This attachment has already been added to this candidate.'
                    );
                    return;
                }

                $isTextExtractionError = $attachmentCreator->isTextExtractionError();
                $textExtractionErrorMessage = $attachmentCreator->getTextExtractionError();

                if (!eval(Hooks::get('CANDIDATE_ON_CREATE_ATTACHMENT_POST'))) return;

                // Remove the cleanup cookie since the file no longer exists
                setcookie('CATS_SP_TEMP_FILE', '');

                $attachmentCreated = true;
            }

            if (!$attachmentCreated && isset($_POST['documentText']) && !empty($_POST['documentText'])) {
                // Resume was pasted into the form and not uploaded from a file

                if (!eval(Hooks::get('CANDIDATE_ON_CREATE_ATTACHMENT_PRE'))) return;

                $attachmentCreator = new AttachmentCreator($this->_siteID);
                $attachmentCreator->createFromText(
                    DATA_ITEM_CANDIDATE,
                    $candidateID,
                    $_POST['documentText'],
                    'MyResume.txt',
                    true
                );

                if ($attachmentCreator->isError()) {
                    CommonErrors::fatal(COMMONERROR_FILEERROR, $this, $attachmentCreator->getError());
                }

                if ($attachmentCreator->duplicatesOccurred()) {
                    $this->listByView(
                        'This attachment has already been added to this candidate.'
                    );
                    return;
                }

                if (!eval(Hooks::get('CANDIDATE_ON_CREATE_ATTACHMENT_POST'))) return;
            }
        }

        /* Create a text resume if the user posted one. (automated tool) */ else if (!empty($textResumeBlock)) {
            $attachmentCreator = new AttachmentCreator($this->_siteID);
            $attachmentCreator->createFromText(
                DATA_ITEM_CANDIDATE,
                $candidateID,
                $textResumeBlock,
                $textResumeFilename,
                true
            );

            if ($attachmentCreator->isError()) {
                CommonErrors::fatal(COMMONERROR_FILEERROR, $this, $attachmentCreator->getError());
                return;
                //$this->fatal($attachmentCreator->getError());
            }
            $isTextExtractionError = $attachmentCreator->isTextExtractionError();
            $textExtractionErrorMessage = $attachmentCreator->getTextExtractionError();

            // FIXME: Show parse errors!
        }

        if (!eval(Hooks::get('CANDIDATE_ON_ADD_POST'))) return;

        return $candidateID;
    }

    /**
     * Processes an Add Activity / Change Status form and displays
     * candidates/AddActivityChangeStatusModal.tpl. This is factored out
     * for code clarity.
     *
     * @param boolean from joborders module perspective
     * @param integer "regarding" job order ID or -1
     * @param string module directory
     * @return void
     */
    private function _addActivityChangeStatus(
        $isJobOrdersMode,
        $regardingID,
        $directoryOverride = ''
    ) {
        $notificationHTML = '';

        $pipelines = new Pipelines($this->_siteID);
        $statusRS = $pipelines->getStatusesForPicking();

        $activityEntries = new ActivityEntries($this->_siteID);
        $activityTypes = $activityEntries->getTypes();

        /* Module directory override for fatal() calls. */
        if ($directoryOverride != '') {
            $moduleDirectory = $directoryOverride;
        } else {
            $moduleDirectory = $this->_moduleDirectory;
        }

        /* Bail out if we don't have a valid candidate ID. */
        if (!$this->isRequiredIDValid('candidateID', $_POST)) {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid candidate ID.');
        }

        /* Do we have a valid status ID. */
        if (!$this->isOptionalIDValid('statusID', $_POST)) {
            $statusID = -1;
        } else {
            $statusID = $_POST['statusID'];
            if ($statusID == PIPELINE_STATUS_HIRED) {
                $jobOrders = new JobOrders($this->_siteID);
                $canBeHired = $jobOrders->checkOpenings($regardingID);
                if (!$canBeHired) {
                    $this->fatalModal(
                        'This job order has been filled. Cannot assign the status Hired to any other candidate.'
                    );
                }
            }
        }

        $candidateID = $_POST['candidateID'];
        $enforceOwner = ((int) $this->getTrimmedInput('enforceOwner', $_POST) === 1);

        if ($enforceOwner && $regardingID > 0)
        {
            $jobOrders = new JobOrders($this->_siteID);
            $jobOrderData = $jobOrders->get($regardingID);
            $isAdmin = ($this->getUserAccessLevel('joborders') >= ACCESS_LEVEL_SA);

            if (empty($jobOrderData) || ((int) $jobOrderData['owner'] !== (int) $this->_userID && !$isAdmin))
            {
                $this->fatalModal('You do not have permission to change status for this job order.');
            }
        }

        if (!eval(Hooks::get('CANDIDATE_ON_ADD_ACTIVITY_CHANGE_STATUS_PRE'))) return;

        if ($this->isChecked('addActivity', $_POST)) {
            /* Bail out if we don't have a valid job order ID. */
            if (!$this->isOptionalIDValid('activityTypeID', $_POST)) {
                CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid activity type ID.');
            }

            $activityTypeID = $_POST['activityTypeID'];

            $activityNote = $this->getTrimmedInput('activityNote', $_POST);

            $activityNote = htmlspecialchars($activityNote);

            // FIXME: Move this to a highlighter-method? */
            if (strpos($activityNote, 'Status change: ') === 0) {
                foreach ($statusRS as $data) {
                    $activityNote = StringUtility::replaceOnce(
                        $data['status'],
                        '<span style="color: #ff6c00;">' . $data['status'] . '</span>',
                        $activityNote
                    );
                }
            }

            /* Add the activity entry. */
            $activityID = $activityEntries->add(
                $candidateID,
                DATA_ITEM_CANDIDATE,
                $activityTypeID,
                $activityNote,
                $this->_userID,
                $regardingID
            );
            $activityTypes = $activityEntries->getTypes();
            $activityTypeDescription = ResultSetUtility::getColumnValueByIDValue(
                $activityTypes,
                'typeID',
                $activityTypeID,
                'type'
            );

            $activityAdded = true;
        } else {
            $activityAdded = false;
            $activityNote = '';
            $activityTypeDescription = '';
        }

        if ($regardingID <= 0 || $statusID == -1) {
            $statusChanged = false;
            $oldStatusDescription = '';
            $newStatusDescription = '';
        } else {
            $data = $pipelines->get($candidateID, $regardingID);

            /* Bail out if we got an empty result set. */
            if (empty($data)) {
                $this->fatalModal(
                    'The specified pipeline entry could not be found.'
                );
            }

            if (
                (int) $data['statusID'] === (int) PIPELINE_STATUS_REJECTED &&
                (int) $statusID !== (int) PIPELINE_STATUS_REJECTED
            ) {
                CommonErrors::fatalModal(
                    COMMONERROR_BADFIELDS,
                    $this,
                    'Cannot change status from Rejected. Re-assign this candidate to the job order to restart the pipeline.'
                );
            }

            $validStatus = ResultSetUtility::findRowByColumnValue(
                $statusRS,
                'statusID',
                $statusID
            );

            /* If the status is invalid or unchanged, don't mess with it. */
            if ($validStatus === false || $statusID == $data['status']) {
                $oldStatusDescription = '';
                $newStatusDescription = '';
                $statusChanged = false;
            } else {
                $oldStatusDescription = $data['status'];
                $newStatusDescription = ResultSetUtility::getColumnValueByIDValue(
                    $statusRS,
                    'statusID',
                    $statusID,
                    'status'
                );

                if ($oldStatusDescription != $newStatusDescription) {
                    $statusChanged = true;
                } else {
                    $statusChanged = false;
                }
            }

            $statusComment = $this->getTrimmedInput('statusComment', $_POST);
            $rejectionReasonIDs = array();
            $rejectionReasonOther = null;
            $statusHistoryDate = null;
            $autoFillEnabled = true;

            if (isset($_POST['autoFillStages']))
            {
                $autoFillEnabled = $this->isChecked('autoFillStages', $_POST);
            }

            if (isset($_POST['rejectionReasonIDs']) && is_array($_POST['rejectionReasonIDs']))
            {
                $rejectionReasonIDs = array_map('intval', $_POST['rejectionReasonIDs']);
                $rejectionReasonIDs = array_values(array_filter($rejectionReasonIDs));
            }

            if ($statusChanged)
            {
                if ($statusComment === '')
                {
                    CommonErrors::fatalModal(
                        COMMONERROR_MISSINGFIELDS,
                        $this,
                        'Status comment is required.'
                    );
                }

                $transitionDateInput = $this->getTrimmedInput('transitionDate', $_POST);
                if ($transitionDateInput === '')
                {
                    /* Backward compatibility with older modal field name. */
                    $transitionDateInput = $this->getTrimmedInput('rejectionDate', $_POST);
                }

                if ((int) $statusID !== (int) PIPELINE_STATUS_ALLOCATED)
                {
                    if (
                        $transitionDateInput === '' ||
                        !DateUtility::validate('-', $transitionDateInput, DATE_FORMAT_MMDDYY)
                    )
                    {
                        CommonErrors::fatalModal(
                            COMMONERROR_MISSINGFIELDS,
                            $this,
                            'Invalid transition date.'
                        );
                    }

                    $transitionDate = DateUtility::convert(
                        '-',
                        $transitionDateInput,
                        DATE_FORMAT_MMDDYY,
                        DATE_FORMAT_YYYYMMDD
                    );
                    $statusHistoryDate = $transitionDate . ' ' . date('H:i:s');
                }

                if ($statusID == PIPELINE_STATUS_REJECTED)
                {
                    if (empty($rejectionReasonIDs))
                    {
                        CommonErrors::fatalModal(
                            COMMONERROR_MISSINGFIELDS,
                            $this,
                            'Select at least one rejection reason.'
                        );
                    }

                    $otherReasonId = $this->getOtherRejectionReasonId(
                        $this->getRejectionReasons()
                    );
                    if ($otherReasonId > 0 && in_array($otherReasonId, $rejectionReasonIDs))
                    {
                        $rejectionReasonOther = $this->getTrimmedInput(
                            'rejectionReasonOther',
                            $_POST
                        );
                        if ($rejectionReasonOther === '')
                        {
                            CommonErrors::fatalModal(
                                COMMONERROR_MISSINGFIELDS,
                                $this,
                                'Other rejection reason is required.'
                            );
                        }
                    }
                }
            }

            $autoFillSteps = array();
            $autoFillComment = '';
            if ($statusChanged && $autoFillEnabled && $statusID != PIPELINE_STATUS_REJECTED)
            {
                $statusOrder = array();
                foreach ($statusRS as $statusRow)
                {
                    $statusOrder[] = (int) $statusRow['statusID'];
                }

                $currentIndex = array_search((int) $data['statusID'], $statusOrder, true);
                $targetIndex = array_search((int) $statusID, $statusOrder, true);
                if ($currentIndex !== false && $targetIndex !== false && $targetIndex > ($currentIndex + 1))
                {
                    $autoFillSteps = array_slice(
                        $statusOrder,
                        $currentIndex + 1,
                        $targetIndex - $currentIndex - 1
                    );
                    $autoFillComment = '[AUTO] Auto-filled pipeline steps.';
                }
            }

            if ($statusChanged && $this->isChecked('triggerEmail', $_POST)) {
                $customMessage = $this->getTrimmedInput('customMessage', $_POST);

                // FIXME: Actually validate the e-mail address?
                if (empty($data['candidateEmail'])) {
                    $email = '';
                    $notificationHTML = '<p><span class="bold">Error:</span> An e-mail notification'
                        . ' could not be sent to the candidate because the candidate'
                        . ' does not have a valid e-mail address.</p>';
                } else if (empty($customMessage)) {
                    $email = '';
                    $notificationHTML = '<p><span class="bold">Error:</span> An e-mail notification'
                        . ' will not be sent because the message text specified was blank.</p>';
                } else if ($this->getUserAccessLevel('candidates.emailCandidates') == ACCESS_LEVEL_DEMO) {
                    $email = '';
                    $notificationHTML = '<p><span class="bold">Error:</span> Demo users can not send'
                        . ' E-Mails.  No E-Mail was sent.</p>';
                } else {
                    $email = $data['candidateEmail'];
                    $notificationHTML = '<p>An e-mail notification has been sent to the candidate.</p>';
                }
            } else {
                $email = '';
                $customMessage = '';
                $notificationHTML = '<p>No e-mail notification has been sent to the candidate.</p>';
            }

            $db = DatabaseConnection::getInstance();
            $transactionStarted = false;
            $autoFillHistoryIDs = array();
            $originalPipelineRow = array();
            if (!empty($autoFillSteps))
            {
                $originalPipelineRow = $db->getAssoc(sprintf(
                    "SELECT
                        candidate_joborder_id AS candidateJobOrderID,
                        status AS statusID,
                        is_active AS isActive,
                        closed_at AS closedAt,
                        closed_by AS closedBy,
                        date_modified AS dateModified
                    FROM
                        candidate_joborder
                    WHERE
                        candidate_id = %s
                    AND
                        joborder_id = %s
                    AND
                        site_id = %s",
                    $db->makeQueryInteger($candidateID),
                    $db->makeQueryInteger($regardingID),
                    $db->makeQueryInteger($this->_siteID)
                ));

                if (empty($originalPipelineRow))
                {
                    CommonErrors::fatalModal(
                        COMMONERROR_BADINDEX,
                        $this,
                        'Pipeline entry not found.'
                    );
                }

                $transactionStarted = $db->beginTransaction();
                foreach ($autoFillSteps as $stepStatusID)
                {
                    if ($stepStatusID == PIPELINE_STATUS_HIRED || $stepStatusID == PIPELINE_STATUS_REJECTED)
                    {
                        if ($transactionStarted)
                        {
                            $db->rollbackTransaction();
                        }
                        if (!empty($autoFillHistoryIDs))
                        {
                            $db->query(sprintf(
                                "DELETE FROM status_history_rejection_reason WHERE status_history_id IN (%s)",
                                implode(',', array_map('intval', $autoFillHistoryIDs))
                            ));
                            $db->query(sprintf(
                                "DELETE FROM candidate_joborder_status_history WHERE candidate_joborder_status_history_id IN (%s)",
                                implode(',', array_map('intval', $autoFillHistoryIDs))
                            ));
                        }
                        if (!empty($originalPipelineRow))
                        {
                            $db->query(sprintf(
                                "UPDATE candidate_joborder
                                SET
                                    status = %s,
                                    is_active = %s,
                                    closed_at = %s,
                                    closed_by = %s,
                                    date_modified = %s
                                WHERE
                                    candidate_joborder_id = %s
                                AND
                                    site_id = %s",
                                $db->makeQueryInteger($originalPipelineRow['statusID']),
                                $db->makeQueryInteger($originalPipelineRow['isActive']),
                                $db->makeQueryStringOrNULL($originalPipelineRow['closedAt']),
                                $db->makeQueryIntegerOrNULL($originalPipelineRow['closedBy']),
                                $db->makeQueryStringOrNULL($originalPipelineRow['dateModified']),
                                $db->makeQueryInteger($originalPipelineRow['candidateJobOrderID']),
                                $db->makeQueryInteger($this->_siteID)
                            ));
                        }
                        CommonErrors::fatalModal(
                            COMMONERROR_RECORDERROR,
                            $this,
                            'Auto-fill encountered a terminal status and was aborted.'
                        );
                    }

                    $stepHistoryID = $pipelines->setStatus(
                        $candidateID,
                        $regardingID,
                        $stepStatusID,
                        '',
                        '',
                        $this->_userID,
                        $autoFillComment,
                        null,
                        1
                    );
                    if (empty($stepHistoryID) || $stepHistoryID < 0)
                    {
                        if ($transactionStarted)
                        {
                            $db->rollbackTransaction();
                        }
                        if (!empty($autoFillHistoryIDs))
                        {
                            $db->query(sprintf(
                                "DELETE FROM status_history_rejection_reason WHERE status_history_id IN (%s)",
                                implode(',', array_map('intval', $autoFillHistoryIDs))
                            ));
                            $db->query(sprintf(
                                "DELETE FROM candidate_joborder_status_history WHERE candidate_joborder_status_history_id IN (%s)",
                                implode(',', array_map('intval', $autoFillHistoryIDs))
                            ));
                        }
                        if (!empty($originalPipelineRow))
                        {
                            $db->query(sprintf(
                                "UPDATE candidate_joborder
                                SET
                                    status = %s,
                                    is_active = %s,
                                    closed_at = %s,
                                    closed_by = %s,
                                    date_modified = %s
                                WHERE
                                    candidate_joborder_id = %s
                                AND
                                    site_id = %s",
                                $db->makeQueryInteger($originalPipelineRow['statusID']),
                                $db->makeQueryInteger($originalPipelineRow['isActive']),
                                $db->makeQueryStringOrNULL($originalPipelineRow['closedAt']),
                                $db->makeQueryIntegerOrNULL($originalPipelineRow['closedBy']),
                                $db->makeQueryStringOrNULL($originalPipelineRow['dateModified']),
                                $db->makeQueryInteger($originalPipelineRow['candidateJobOrderID']),
                                $db->makeQueryInteger($this->_siteID)
                            ));
                        }
                        CommonErrors::fatalModal(
                            COMMONERROR_RECORDERROR,
                            $this,
                            'Failed to auto-fill pipeline history.'
                        );
                    }
                    $autoFillHistoryIDs[] = (int) $stepHistoryID;
                }
            }

            /* Set the pipeline entry's final status, but don't send e-mails for now. */
            $historyID = $pipelines->setStatus(
                $candidateID,
                $regardingID,
                $statusID,
                $email,
                $customMessage,
                $this->_userID,
                $statusComment,
                $rejectionReasonOther,
                0,
                null,
                $statusHistoryDate
            );

            if (!empty($autoFillSteps))
            {
                if (empty($historyID) || $historyID < 0)
                {
                    if ($transactionStarted)
                    {
                        $db->rollbackTransaction();
                    }
                    if (!empty($autoFillHistoryIDs))
                    {
                        $db->query(sprintf(
                            "DELETE FROM status_history_rejection_reason WHERE status_history_id IN (%s)",
                            implode(',', array_map('intval', $autoFillHistoryIDs))
                        ));
                        $db->query(sprintf(
                            "DELETE FROM candidate_joborder_status_history WHERE candidate_joborder_status_history_id IN (%s)",
                            implode(',', array_map('intval', $autoFillHistoryIDs))
                        ));
                    }
                    if (!empty($originalPipelineRow))
                    {
                        $db->query(sprintf(
                            "UPDATE candidate_joborder
                            SET
                                status = %s,
                                is_active = %s,
                                closed_at = %s,
                                closed_by = %s,
                                date_modified = %s
                            WHERE
                                candidate_joborder_id = %s
                            AND
                                site_id = %s",
                            $db->makeQueryInteger($originalPipelineRow['statusID']),
                            $db->makeQueryInteger($originalPipelineRow['isActive']),
                            $db->makeQueryStringOrNULL($originalPipelineRow['closedAt']),
                            $db->makeQueryIntegerOrNULL($originalPipelineRow['closedBy']),
                            $db->makeQueryStringOrNULL($originalPipelineRow['dateModified']),
                            $db->makeQueryInteger($originalPipelineRow['candidateJobOrderID']),
                            $db->makeQueryInteger($this->_siteID)
                        ));
                    }
                    CommonErrors::fatalModal(
                        COMMONERROR_RECORDERROR,
                        $this,
                        'Failed to update pipeline status.'
                    );
                }
                if ($transactionStarted)
                {
                    $db->commitTransaction();
                }
            }

            if ($statusID == PIPELINE_STATUS_REJECTED && $historyID > 0)
            {
                $pipelines->addStatusHistoryRejectionReasons(
                    $historyID,
                    $rejectionReasonIDs
                );
            }

            /* If status = placed, and open positions > 0, reduce number of open positions by one. */
            if ($statusID == PIPELINE_STATUS_HIRED && is_numeric($data['openingsAvailable']) && $data['openingsAvailable'] > 0) {
                $jobOrders = new JobOrders($this->_siteID);
                $jobOrders->updateOpeningsAvailable($regardingID, $data['openingsAvailable'] - 1);
            }

            /* If status is changed from placed to something else, increase number of open positions by one. */
            if ($statusID != PIPELINE_STATUS_HIRED && $data['statusID'] == PIPELINE_STATUS_HIRED) {
                $jobOrders = new JobOrders($this->_siteID);
                $jobOrders->updateOpeningsAvailable($regardingID, $data['openingsAvailable'] + 1);
            }
        }

        if ($this->isChecked('scheduleEvent', $_POST)) {
            /* Bail out if we received an invalid date. */
            $trimmedDate = $this->getTrimmedInput('dateAdd', $_POST);
            if (
                empty($trimmedDate) ||
                !DateUtility::validate('-', $trimmedDate, DATE_FORMAT_MMDDYY)
            ) {
                CommonErrors::fatalModal(COMMONERROR_MISSINGFIELDS, $this, 'Invalid date.');
            }

            /* Bail out if we don't have a valid event type. */
            if (!$this->isRequiredIDValid('eventTypeID', $_POST)) {
                CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid event type ID.');
            }

            /* Bail out if we don't have a valid time format ID. */
            if (
                !isset($_POST['allDay']) ||
                ($_POST['allDay'] != '0' && $_POST['allDay'] != '1')
            ) {
                CommonErrors::fatalModal(COMMONERROR_MISSINGFIELDS, $this, 'Invalid time format ID.');
            }

            $eventTypeID = $_POST['eventTypeID'];

            if ($_POST['allDay'] == 1) {
                $allDay = true;
            } else {
                $allDay = false;
            }

            $publicEntry = $this->isChecked('publicEntry', $_POST);

            $reminderEnabled = $this->isChecked('reminderToggle', $_POST);
            $reminderEmail = $this->getTrimmedInput('sendEmail', $_POST);
            $reminderTime  = $this->getTrimmedInput('reminderTime', $_POST);
            $duration = $this->getTrimmedInput('duration', $_POST);;

            /* Is this a scheduled event or an all day event? */
            if ($allDay) {
                $date = DateUtility::convert(
                    '-',
                    $trimmedDate,
                    DATE_FORMAT_MMDDYY,
                    DATE_FORMAT_YYYYMMDD
                );

                $hour = 12;
                $minute = 0;
                $meridiem = 'AM';
            } else {
                /* Bail out if we don't have a valid hour. */
                if (!isset($_POST['hour'])) {
                    CommonErrors::fatalModal(COMMONERROR_MISSINGFIELDS, $this, 'Invalid hour.');
                }

                /* Bail out if we don't have a valid minute. */
                if (!isset($_POST['minute'])) {
                    CommonErrors::fatalModal(COMMONERROR_MISSINGFIELDS, $this, 'Invalid minute.');
                }

                /* Bail out if we don't have a valid meridiem value. */
                if (
                    !isset($_POST['meridiem']) ||
                    ($_POST['meridiem'] != 'AM' && $_POST['meridiem'] != 'PM')
                ) {
                    $this->fatalModal(
                        'Invalid meridiem value.',
                        $moduleDirectory
                    );
                }

                $hour     = $_POST['hour'];
                $minute   = $_POST['minute'];
                $meridiem = $_POST['meridiem'];

                /* Convert formatted time to UNIX timestamp. */
                $time = strtotime(
                    sprintf('%s:%s %s', $hour, $minute, $meridiem)
                );

                /* Create MySQL date string w/ 24hr time (YYYY-MM-DD HH:MM:SS). */
                $date = sprintf(
                    '%s %s',
                    DateUtility::convert(
                        '-',
                        $trimmedDate,
                        DATE_FORMAT_MMDDYY,
                        DATE_FORMAT_YYYYMMDD
                    ),
                    date('H:i:00', $time)
                );
            }

            $description = $this->getTrimmedInput('description', $_POST);
            $title       = $this->getTrimmedInput('title', $_POST);

            /* Bail out if any of the required fields are empty. */
            if (empty($title)) {
                CommonErrors::fatalModal(COMMONERROR_MISSINGFIELDS, $this);
                return;
                /*$this->fatalModal(
                    'Required fields are missing.', $moduleDirectory
                );*/
            }

            if ($regardingID > 0) {
                $eventJobOrderID = $regardingID;
            } else {
                $eventJobOrderID = -1;
            }

            $calendar = new Calendar($this->_siteID);
            $eventID = $calendar->addEvent(
                $eventTypeID,
                $date,
                $description,
                $allDay,
                $this->_userID,
                $candidateID,
                DATA_ITEM_CANDIDATE,
                $eventJobOrderID,
                $title,
                $duration,
                $reminderEnabled,
                $reminderEmail,
                $reminderTime,
                $publicEntry,
                $_SESSION['CATS']->getTimeZoneOffset()
            );

            if ($eventID <= 0) {
                $this->fatalModal(
                    'Failed to add calendar event.',
                    $moduleDirectory
                );
            }

            /* Extract the date parts from the specified date. */
            $parsedDate = strtotime($date);
            $formattedDate = date('l, F jS, Y', $parsedDate);

            $calendar = new Calendar($this->_siteID);
            $calendarEventTypes = $calendar->getAllEventTypes();

            $eventTypeDescription = ResultSetUtility::getColumnValueByIDValue(
                $calendarEventTypes,
                'typeID',
                $eventTypeID,
                'description'
            );

            $eventHTML = sprintf(
                '<p>An event of type <span class="bold">%s</span> has been scheduled on <span class="bold">%s</span>.</p>',
                htmlspecialchars($eventTypeDescription),
                htmlspecialchars($formattedDate)

            );
            $eventScheduled = true;
        } else {
            $eventHTML = '<p>No event has been scheduled.</p>';
            $eventScheduled = false;
        }

        $onlyScheduleEvent = false;

        if (!$statusChanged && !$activityAdded && !$eventScheduled) {
            $changesMade = false;
        } else {
            $changesMade = true;
        }

        if (!eval(Hooks::get('CANDIDATE_ON_ADD_ACTIVITY_CHANGE_STATUS_POST'))) return;

        $this->_template->assign('candidateID', $candidateID);
        $this->_template->assign('regardingID', $regardingID);
        $this->_template->assign('oldStatusDescription', $oldStatusDescription);
        $this->_template->assign('newStatusDescription', $newStatusDescription);
        $this->_template->assign('statusChanged', $statusChanged);
        $this->_template->assign('activityAdded', $activityAdded);
        $this->_template->assign('activityDescription', $activityNote);
        $this->_template->assign('activityType', $activityTypeDescription);
        $this->_template->assign('eventScheduled', $eventScheduled);
        $this->_template->assign('eventHTML', $eventHTML);
        $this->_template->assign('notificationHTML', $notificationHTML);
        $this->_template->assign('onlyScheduleEvent', $onlyScheduleEvent);
        $this->_template->assign('changesMade', $changesMade);
        $this->_template->assign('isFinishedMode', true);
        $this->_template->assign('isJobOrdersMode', $isJobOrdersMode);
        $this->_template->assign('activityTypes', $activityTypes);
        $rejectionReasons = $this->getRejectionReasons();
        $this->_template->assign('rejectionReasons', $rejectionReasons);
        $this->_template->assign(
            'rejectionOtherReasonId',
            $this->getOtherRejectionReasonId($rejectionReasons)
        );
        $this->_template->assign('rejectedStatusId', PIPELINE_STATUS_REJECTED);
        $this->_template->display(
            './modules/candidates/AddActivityChangeStatusModal.tpl'
        );
    }

    /*
     * Sends mass emails from the datagrid
     */
    private function onEmailCandidates()
    {
        if (isset($_POST['postback'])) {
            $emailTo = $_POST['emailTo'];
            $emailSubject = $_POST['emailSubject'];
            $emailBody = $_POST['emailBody'];

            $tmpDestination = explode(', ', $emailTo);
            $destination = array();
            foreach ($tmpDestination as $emailDest) {
                $destination[] = array($emailDest, $emailDest);
            }

            $mailer = new Mailer(CATS_ADMIN_SITE);

            if ($_POST['emailTemplate'] == "-1") {
                $mailerStatus = $mailer->send(
                    array($_SESSION['CATS']->getEmail(), $_SESSION['CATS']->getEmail()),
                    $destination,
                    $emailSubject,
                    $emailBody,
                    true,
                    true
                );
            } else {
                $emailTemplates = new EmailTemplates($this->_siteID);
                $candidates = new Candidates($this->_siteID);

                $emailsToIDs = $_POST['candidateID'];
                $candidateIDs = array();
                foreach ($emailsToIDs as $email) {
                    $temp = explode('=', $email);
                    $candidateIDs[$temp[0]] = $temp[1];
                }
                foreach ($candidateIDs as $email => $ID) {
                    $candidateData = $candidates->get($ID);
                    $emailTextSubstituted = $emailTemplates->replaceVariables($emailBody);
                    $stringsToFind = array(
                        '%CANDOWNER%',
                        '%CANDFIRSTNAME%',
                        '%CANDFULLNAME%'
                    );
                    $replacementStrings = array(
                        $candidateData['ownerFullName'],
                        $candidateData['firstName'],
                        $candidateData['candidateFullName']
                    );
                    $emailTextSubstituted = str_replace(
                        $stringsToFind,
                        $replacementStrings,
                        $emailTextSubstituted
                    );

                    $mailerStatus = $mailer->sendToOne(
                        array($email, $candidateData['candidateFullName']),
                        $emailSubject,
                        $emailTextSubstituted,
                        true
                    );
                }
            }

            $this->_template->assign('active', $this);
            $this->_template->assign('success', true);
            $this->_template->assign('success_to', $emailTo);
            $this->_template->display('./modules/candidates/SendEmail.tpl');
        } else {
            $dataGrid = DataGrid::getFromRequest();

            $candidateIDs = $dataGrid->getExportIDs();

            /* Validate each ID */
            foreach ($candidateIDs as $index => $candidateID) {
                if (!$this->isRequiredIDValid($index, $candidateIDs)) {
                    CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid candidate ID.');
                    return;
                }
            }

            $db_str = implode(", ", $candidateIDs);

            $db = DatabaseConnection::getInstance();

            $rs = $db->getAllAssoc(sprintf(
                'SELECT candidate_id, first_name, last_name, email1 '
                    . 'FROM candidate '
                    . 'WHERE candidate_id IN (%s)',
                $db_str
            ));

            $emailTemplates = new EmailTemplates($this->_siteID);
            $emailTemplatesRS = $emailTemplates->getAllCustom();

            //$this->_template->assign('privledgedUser', $privledgedUser);
            $this->_template->assign('active', $this);
            $this->_template->assign('success', false);
            $this->_template->assign('emailTemplatesRS', $emailTemplatesRS);
            $this->_template->assign('recipients', $rs);
            $this->_template->assign('sessionCookie', $_SESSION['CATS']->getCookie());
            $this->_template->display('./modules/candidates/SendEmail.tpl');
        }
    }

    private function onShowQuestionnaire()
    {
        $candidateID = isset($_GET[$id = 'candidateID']) ? $_GET[$id] : false;
        $title = isset($_GET[$id = 'questionnaireTitle']) ? urldecode($_GET[$id]) : false;
        $printOption = isset($_GET[$id = 'print']) ? $_GET[$id] : '';
        $printValue = !strcasecmp($printOption, 'yes') ? true : false;

        if (!$candidateID || !$title) {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Bad Server Information.');
        }

        $candidates = new Candidates($this->_siteID);
        $cData = $candidates->get($candidateID);

        $questionnaire = new Questionnaire($this->_siteID);
        $qData = $questionnaire->getCandidateQuestionnaire($candidateID, $title);

        $attachment = new Attachments($this->_siteID);
        $attachments = $attachment->getAll(DATA_ITEM_CANDIDATE, $candidateID);
        if (!empty($attachments)) {
            $resume = $candidates->getResume($attachments[0]['attachmentID']);
            $this->_template->assign('resumeText', str_replace("\n", "<br \>\n", htmlentities(DatabaseSearch::fulltextDecode($resume['text']))));
            $this->_template->assign('resumeTitle', htmlentities($resume['title']));
        }

        $this->_template->assign('active', $this);
        $this->_template->assign('candidateID', $candidateID);
        $this->_template->assign('title', $title);
        $this->_template->assign('cData', $cData);
        $this->_template->assign('qData', $qData);
        $this->_template->assign('print', $printValue);

        $this->_template->display('./modules/candidates/Questionnaire.tpl');
    }

    private function findDuplicateCandidateSearch()
    {
        $duplicateCandidateID = $_GET['candidateID'];
        if ($duplicateCandidateID == "") {
            $duplicateCandidateID = $_POST['candidateID'];
        }
        $query = $this->getSanitisedInput('wildCardString', $_POST);
        $mode  = $this->getSanitisedInput('mode', $_POST);

        /* Execute the search. */
        $search = new SearchCandidates($this->_siteID);
        switch ($mode) {
            case 'searchByCandidateName':
                $rs = $search->byFullName($query, 'candidate.last_name', 'ASC', true);
                $resultsMode = true;
                break;

            default:
                $rs = $search->all($query, 'candidate.last_name', 'ASC', 'true');
                $resultsMode = false;
                break;
        }

        $candidates = new Candidates($this->_siteID);

        foreach ($rs as $rowIndex => $row) {
            $rs[$rowIndex]['duplicateCandidateID'] = $duplicateCandidateID;
            if ($candidates->checkIfLinked($rs[$rowIndex]['candidateID'], $duplicateCandidateID)) {
                $rs[$rowIndex]['linked'] = true;
            } else {
                $rs[$rowIndex]['linked'] = false;
            }

            if ($row['isHot'] == 1) {
                $rs[$rowIndex]['linkClass'] = 'jobLinkHot';
            } else {
                $rs[$rowIndex]['linkClass'] = 'jobLinkCold';
            }
        }

        if (!eval(Hooks::get('DUPLICATE_ON_LINK_DUPLICATES'))) return;

        $this->_template->assign('rs', $rs);
        $this->_template->assign('isFinishedMode', false);
        $this->_template->assign('isResultsMode', $resultsMode);
        $this->_template->assign('duplicateCandidateID', $duplicateCandidateID);
        $this->_template->display('./modules/candidates/LinkDuplicity.tpl');
    }

    private function mergeDuplicates()
    {
        $candidates = new Candidates($this->_siteID);
        $oldCandidateID = $_GET['oldCandidateID'];
        $newCandidateID = $_GET['newCandidateID'];

        $rsOld = $candidates->getWithDuplicity($oldCandidateID);
        $rsNew = $candidates->getWithDuplicity($newCandidateID);

        $this->_template->assign('isFinishedMode', false);
        $this->_template->assign('rsOld', $rsOld);
        $this->_template->assign('rsNew', $rsNew);
        $this->_template->assign('oldCandidateID', $oldCandidateID);
        $this->_template->assign('newCandidateID', $newCandidateID);
        $this->_template->display('./modules/candidates/Merge.tpl');
    }

    private function mergeDuplicatesInfo()
    {
        $candidates = new Candidates($this->_siteID);
        $params = array();
        $params['firstName'] = $_POST['firstName'];
        // middleName removed from schema
        $params['lastName'] = $_POST['lastName'];
        if (isset($_POST['email'])) {
            $params['emails'] = $_POST['email'];
        } else {
            $params['emails'] = array();
        }
        $params['phoneCell'] = $_POST['phoneCell'];
        $params['address'] = $_POST['address'];
        $params['oldCandidateID'] = $_POST['oldCandidateID'];
        $params['newCandidateID'] = $_POST['newCandidateID'];

        $candidates->mergeDuplicates($params, $candidates->getWithDuplicity($params['newCandidateID']));
        $this->_template->assign('isFinishedMode', true);
        $this->_template->display('./modules/candidates/Merge.tpl');
    }

    private function removeDuplicity()
    {
        $candidates = new Candidates($this->_siteID);
        $oldCandidateID = $_GET['oldCandidateID'];
        $newCandidateID = $_GET['newCandidateID'];
        $candidates->removeDuplicity($oldCandidateID, $newCandidateID);
        $url = CATSUtility::getIndexName() . "?m=candidates";
        header("Location: " . $url); /* Redirect browser */
        exit();
    }


    private function addDuplicates()
    {
        $candidates = new Candidates($this->_siteID);
        $oldCandidateID = $_GET['candidateID'];
        $newCandidateID = $_GET['duplicateCandidateID'];
        $candidates->addDuplicates($newCandidateID, $oldCandidateID);
        $this->_template->assign('isFinishedMode', true);
        $this->_template->display('./modules/candidates/LinkDuplicity.tpl');
    }
}
