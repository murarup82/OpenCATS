<?php
/*
 * CATS
 * Job Orders Module
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
 * $Id: JobOrdersUI.php 3810 2007-12-05 19:13:25Z brian $
 */

include_once(LEGACY_ROOT . '/lib/StringUtility.php');
include_once(LEGACY_ROOT . '/lib/ResultSetUtility.php');
include_once(LEGACY_ROOT . '/lib/DateUtility.php'); /* Depends on StringUtility. */
include_once(LEGACY_ROOT . '/lib/JobOrders.php');
include_once(LEGACY_ROOT . '/lib/JobOrderHiringPlans.php');
include_once(LEGACY_ROOT . '/lib/Pipelines.php');
include_once(LEGACY_ROOT . '/lib/Attachments.php');
include_once(LEGACY_ROOT . '/lib/Companies.php');
include_once(LEGACY_ROOT . '/lib/Candidates.php');
include_once(LEGACY_ROOT . '/lib/ActivityEntries.php');
include_once(LEGACY_ROOT . '/lib/Export.php');
include_once(LEGACY_ROOT . '/lib/InfoString.php');
include_once(LEGACY_ROOT . '/lib/GDPRSettings.php');
include_once(LEGACY_ROOT . '/lib/EmailTemplates.php');
include_once(LEGACY_ROOT . '/lib/FileUtility.php');
include_once(LEGACY_ROOT . '/lib/CareerPortal.php');
include_once(LEGACY_ROOT . '/lib/ExtraFields.php');
include_once(LEGACY_ROOT . '/lib/Graphs.php');
include_once(LEGACY_ROOT . '/lib/Questionnaire.php');
include_once(LEGACY_ROOT . '/lib/CommonErrors.php');
include_once(LEGACY_ROOT . '/lib/JobOrderTypes.php');
include_once(LEGACY_ROOT . '/lib/JobOrderStatuses.php');
include_once(LEGACY_ROOT . '/lib/UserRoles.php');
include_once(LEGACY_ROOT . '/lib/Users.php');


class JobOrdersUI extends UserInterface
{

    /* Maximum number of characters of the job description to show without the
     * user clicking "[More]"
     */
    const DESCRIPTION_MAXLEN = 500;

    /* Maximum number of characters of the job notes to show without the user
     * clicking "[More]"
     */
    const NOTES_MAXLEN = 500;

    /* Maximum number of characters of the Job Order Title to show on the main
     * job order list view.
     */
    const TRUNCATE_JOBORDER_TITLE = 35;

    /* Maximum number of characters of the company name to show on the job orders
     * list view.
     */
    const TRUNCATE_CLIENT_NAME = 28;


    public function __construct()
    {
        parent::__construct();

        $this->_authenticationRequired = true;
        $this->_moduleDirectory = 'joborders';
        $this->_moduleName = 'joborders';
        $this->_moduleTabText = 'Job Orders';
        $this->_subTabs = array(
            //'Add Job Order'     => CATSUtility::getIndexName() . '?m=joborders&amp;a=add*al=' . ACCESS_LEVEL_EDIT . '@joborders.add',
            'Add Job Order' => 'javascript:void(0);*js=showPopWin(\''.CATSUtility::getIndexName().'?m=joborders&amp;a=addJobOrderPopup\', 400, 250, null);*al=' . ACCESS_LEVEL_EDIT . '@joborders.add',
            'Search Job Orders' => CATSUtility::getIndexName() . '?m=joborders&amp;a=search'
        );

        if (isset($_SESSION['CATS']) &&
            is_object($_SESSION['CATS']) &&
            method_exists($_SESSION['CATS'], 'isLoggedIn') &&
            $_SESSION['CATS']->isLoggedIn() &&
            $this->canManageRecruiterAllocation())
        {
            $this->_subTabs['Recruiter Allocation'] = CATSUtility::getIndexName() . '?m=joborders&amp;a=recruiterAllocation';
        }
    }


    public function handleRequest()
    {
        $action = $this->getAction();

        if (!eval(Hooks::get('JO_HANDLE_REQUEST'))) return;

        switch ($action)
        {
            case 'show':
                if ($this->getUserAccessLevel('joborders.show') < ACCESS_LEVEL_READ)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->show();
                break;

            case 'addJobOrderPopup':
                if ($this->getUserAccessLevel('joborders.add') < ACCESS_LEVEL_EDIT)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->addJobOrderPopup();
                break;

            case 'add':
                if ($this->getUserAccessLevel('joborders.add') < ACCESS_LEVEL_EDIT)
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
                if ($this->getUserAccessLevel('joborders.edit') < ACCESS_LEVEL_EDIT)
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

            case 'editHiringPlan':
                if ($this->getUserAccessLevel('joborders.edit') < ACCESS_LEVEL_EDIT)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                if ($this->isPostBack())
                {
                    $this->onEditHiringPlan();
                }
                else
                {
                    $this->editHiringPlan();
                }

                break;

            case 'delete':
                if ($this->getUserAccessLevel('joborders.delete') < ACCESS_LEVEL_DELETE)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->onDelete();
                break;

            case 'search':
                if ($this->getUserAccessLevel('joborders.search') < ACCESS_LEVEL_READ)
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

            /* Change candidate-joborder status. */
            case 'addActivityChangeStatus':
                if ($this->getUserAccessLevel('pipelines.addActivityChangeStatus') < ACCESS_LEVEL_EDIT)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                if ($this->isPostBack())
                {
                    $this->onAddActivityChangeStatus();
                }
                else
                {
                    $this->addActivityChangeStatus();
                }

                break;

            case 'pipelineStatusDetails':
                if ($this->getUserAccessLevel('joborders.show') < ACCESS_LEVEL_READ)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->pipelineStatusDetails();
                break;
            case 'pipelineStatusEditDate':
                if ($this->getUserAccessLevel('joborders.show') < ACCESS_LEVEL_READ)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->pipelineStatusEditDate();
                break;

            /*
             * Search for a candidate (in the modal window) for which to
             * consider for this job order.
             */
            case 'considerCandidateSearch':
                if ($this->getUserAccessLevel('joborders.considerCandidateSearch') < ACCESS_LEVEL_EDIT)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                include_once(LEGACY_ROOT . '/lib/Search.php');

                if ($this->isPostBack())
                {
                    $this->onConsiderCandidateSearch();
                }
                else
                {
                    $this->considerCandidateSearch();
                }

                break;

            /*
             * Add candidate to pipeline after selecting a job order for which
             * to consider a candidate (in the modal window).
             */
            case 'addToPipeline':
                if ($this->getUserAccessLevel('pipelines.addToPipeline') < ACCESS_LEVEL_EDIT)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->onAddToPipeline();
                break;

            /*
             * Quick add candidate (in the modal window).
             */
            case 'addCandidateModal':
                if ($this->getUserAccessLevel('candidates.add') < ACCESS_LEVEL_EDIT)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                if ($this->isPostBack())
                {
                    $this->onAddCandidateModal();
                }
                else
                {
                    $this->addCandidateModal();
                }

                break;

            /* Remove a candidate from a pipeline. */
            case 'removeFromPipeline':
                if ($this->getUserAccessLevel('pipelines.removeFromPipeline') < ACCESS_LEVEL_DELETE)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->onRemoveFromPipeline();
                break;

            /* Add an attachment */
            case 'createAttachment':
                if ($this->getUserAccessLevel('joborders.createAttachment') < ACCESS_LEVEL_EDIT)
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
                if ($this->getUserAccessLevel('joborders.deleteAttachment') < ACCESS_LEVEL_DELETE)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->onDeleteAttachment();
                break;

            /* FIXME: function setCandidateJobOrder() does not exist
            case 'setCandidateJobOrder':
                if ($this->getUserAccessLevel('joborders.setCandidateJobOrder') < ACCESS_LEVEL_EDIT)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->setCandidateJobOrder();
                break;
            */

            case 'administrativeHideShow':
                if ($this->getUserAccessLevel('joborders.administrativeHideShow') < ACCESS_LEVEL_MULTI_SA)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->administrativeHideShow();
                break;

            case 'recruiterAllocation':
                if (!$this->canManageRecruiterAllocation())
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }

                if ($this->isPostBack())
                {
                    $this->onRecruiterAllocation();
                }
                else
                {
                    $this->recruiterAllocation();
                }
                break;

            /* Main job orders page. */
            case 'listByView':
            default:
                if ($this->getUserAccessLevel('joborders.list') < ACCESS_LEVEL_READ)
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
        $jobOrderFilters = JobOrderStatuses::getFilters();

        $dataGridProperties = DataGrid::getRecentParamaters("joborders:JobOrdersListByViewDataGrid");

        /* If this is the first time we visited the datagrid this session, the recent paramaters will
         * be empty.  Fill in some default values. */
        if ($dataGridProperties == array())
        {
            $dataGridProperties = array('rangeStart'    => 0,
                                        'maxResults'    => 50,
                                        'filter'        => 'Status=='.$jobOrderFilters[0],
                                        'filterVisible' => false);
        }

        $dataGrid = DataGrid::get("joborders:JobOrdersListByViewDataGrid", $dataGridProperties);

        $this->_template->assign('active', $this);
        $this->_template->assign('dataGrid', $dataGrid);
        $this->_template->assign('userID', $_SESSION['CATS']->getUserID());
        $this->_template->assign('errMessage', $errMessage);
        $this->_template->assign('jobOrderFilters', $jobOrderFilters);
        $this->_template->assign('canManageRecruiterAllocation', $this->canManageRecruiterAllocation());

        if (!eval(Hooks::get('JO_LIST_BY_VIEW'))) return;

        $jl = new JobOrders($this->_siteID);
        $this->_template->assign('totalJobOrders', $jl->getCount());

        $this->_template->display('./modules/joborders/JobOrders.tpl');
    }

    /*
     * Called by handleRequest() to process loading the details page.
     */
    private function show()
    {
        /* Is this a popup? */
        if (isset($_GET['display']) && $_GET['display'] == 'popup')
        {
            $isPopup = true;
        }
        else
        {
            $isPopup = false;
        }

        /* Bail out if we don't have a valid candidate ID. */
        if (!$this->isRequiredIDValid('jobOrderID', $_GET))
        {
            /* FIXME: fatalPopup()? */
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid job order ID.');
        }

        $jobOrderID = $_GET['jobOrderID'];

        $showClosed = false;
        if (isset($_GET['showClosed']) && ($_GET['showClosed'] == '1' || $_GET['showClosed'] === 'true'))
        {
            $showClosed = true;
        }


        $jobOrders = new JobOrders($this->_siteID);
        $data = $jobOrders->get($jobOrderID);

        /* Bail out if we got an empty result set. */
        if (empty($data))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'The specified job order ID could not be found.');
        }

        if ($data['isAdminHidden'] == 1 && $this->getUserAccessLevel('joborders.hidden') < ACCESS_LEVEL_MULTI_SA)
        {
            $this->listByView('This Job Order is hidden - only a CATS Administrator can unlock the Job Order.');
            return;
        }

        /* We want to handle formatting the city and state here instead of in
         * the template.
         */
        $data['cityAndState'] = StringUtility::makeCityStateString(
            $data['city'], $data['state']
        );

        $data['description'] = trim($data['description']);
        $data['notes'] = trim($data['notes']);

        /* Determine the Job Type Description */
        $data['typeDescription'] = $jobOrders->typeCodeToString($data['type']);

        /* Convert '00-00-00' dates to empty strings. */
        $data['startDate'] = DateUtility::fixZeroDate(
            $data['startDate']
        );

        /* Hot jobs [can] have different title styles than normal jobs. */
        if ($data['isHot'] == 1)
        {
            $data['titleClass'] = 'jobTitleHot';
        }
        else
        {
            $data['titleClass'] = 'jobTitleCold';
        }

        if ($data['public'] == 1)
        {
            $data['public'] = '<img src="images/public.gif" height="16" '
                . 'width="16" title="This Job Order is marked as Public." />';
        }
        else
        {
            $data['public'] = '';
        }

        $attachments = new Attachments($this->_siteID);
        $attachmentsRS = $attachments->getAll(
            DATA_ITEM_JOBORDER, $jobOrderID
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

        $careerPortalSettings = new CareerPortalSettings($this->_siteID);
        $careerPortalSettingsRS = $careerPortalSettings->getAll();

        if ($careerPortalSettingsRS['enabled'] == 1)
        {
            $careerPortalEnabled = true;
        }
        else
        {
            $careerPortalEnabled = false;
        }

        /* Add an MRU entry. */
        $_SESSION['CATS']->getMRU()->addEntry(
            DATA_ITEM_JOBORDER, $jobOrderID, $data['title']
        );

        if ($this->getUserAccessLevel('joborders.show') < ACCESS_LEVEL_DEMO)
        {
            $privledgedUser = false;
        }
        else
        {
            $privledgedUser = true;
        }

        /* Get extra fields. */
        $extraFieldRS = $jobOrders->extraFields->getValuesForShow($jobOrderID);

        $pipelineEntriesPerPage = $_SESSION['CATS']->getPipelineEntriesPerPage();

        $sessionCookie = $_SESSION['CATS']->getCookie();

        /* Get pipeline graph. */
        $graphs = new graphs();
        $pipelineGraph = $graphs->miniJobOrderPipeline(450, 250, array($jobOrderID));

        $jobOrderHiringPlans = new JobOrderHiringPlans($this->_siteID);
        $hiringPlanRS = $jobOrderHiringPlans->getByJobOrder($jobOrderID);
        foreach ($hiringPlanRS as $index => $planRow)
        {
            $hiringPlanRS[$index]['startDate'] = $this->formatHiringPlanDateForInput($planRow['startDate']);
            $hiringPlanRS[$index]['endDate'] = $this->formatHiringPlanDateForInput($planRow['endDate']);
        }
        $hiringPlanTotal = 0;
        foreach ($hiringPlanRS as $planRow)
        {
            $hiringPlanTotal += (int) $planRow['openings'];
        }

        /* Get questionnaire information (if exists) */
        $questionnaireID = false;
        $questionnaireData = false;
        $careerPortalURL = false;
        $isPublic = false;



        if ($careerPortalEnabled && $data['public'])
        {
            $isPublic = true;
            if ($data['questionnaireID'])
            {
                $questionnaire = new Questionnaire($this->_siteID);
                $q = $questionnaire->get($data['questionnaireID']);
                if (is_array($q) && !empty($q))
                {
                    $questionnaireID = $q['questionnaireID'];
                    $questionnaireData = $q;
                }
            }
        }

        $careerPortalSettings = new CareerPortalSettings($this->_siteID);
        $cpSettings = $careerPortalSettings->getAll();
        if (intval($cpSettings['enabled']))
        {
            $careerPortalURL = CATSUtility::getAbsoluteURI() . 'careers/';
        }

        $this->_template->assign('active', $this);
        $this->_template->assign('isPublic', $isPublic);
        $this->_template->assign('questionnaireID', $questionnaireID);
        $this->_template->assign('questionnaireData', $questionnaireData);
        $this->_template->assign('careerPortalURL', $careerPortalURL);
        $this->_template->assign('data', $data);
        $this->_template->assign('extraFieldRS', $extraFieldRS);
        $this->_template->assign('hiringPlanRS', $hiringPlanRS);
        $this->_template->assign('hiringPlanTotal', $hiringPlanTotal);
        $this->_template->assign('hiringPlanLink', CATSUtility::getIndexName() . '?m=joborders&a=editHiringPlan&jobOrderID=' . $jobOrderID);
        $this->_template->assign('attachmentsRS', $attachmentsRS);
        $this->_template->assign('pipelineEntriesPerPage', $pipelineEntriesPerPage);
        $this->_template->assign('pipelineGraph', $pipelineGraph);
        $this->_template->assign('jobOrderID', $jobOrderID);
        $this->_template->assign('isPopup', $isPopup);
        $this->_template->assign('careerPortalEnabled', $careerPortalEnabled);
        $this->_template->assign('privledgedUser', $privledgedUser);
        $this->_template->assign('sessionCookie', $_SESSION['CATS']->getCookie());
        $this->_template->assign('showClosedPipeline', $showClosed);
        $this->_template->assign(
            'deleteAttachmentToken',
            $this->getCSRFToken('joborders.deleteAttachment')
        );

        if (!eval(Hooks::get('JO_SHOW'))) return;

        $this->_template->display('./modules/joborders/Show.tpl');
    }

    /*
     * Called by handleRequest() to render the add popup.
     */
    private function addJobOrderPopup()
    {
        $jobOrders = new JobOrders($this->_siteID);

        $rs = $jobOrders->getAll(JOBORDERS_STATUS_ALL);

        $this->_template->assign('isModal', true);
        $this->_template->assign('rs', $rs);

        if (!eval(Hooks::get('JO_ADD_MODAL'))) return;

        $this->_template->display('./modules/joborders/AddModalPopup.tpl');
    }

    /*
     * Called by handleRequest() to process loading the add page.
     */
    private function add()
    {
        $users = new Users($this->_siteID);
        $usersRS = $users->getSelectList();

        $companies = new Companies($this->_siteID);
        $companiesRS = $companies->getSelectList();

        $jobOrders = new JobOrders($this->_siteID);

        /* Do we have any companies yet? */
        if (empty($companiesRS))
        {
            $noCompanies = true;
        }
        else
        {
            $noCompanies = false;
        }

        if (!$this->isRequiredIDValid('selected_company_id', $_GET))
        {
            $selectedCompanyID = false;
        }
        else
        {
            $selectedCompanyID = $_GET['selected_company_id'];
        }

        if ($_SESSION['CATS']->isHrMode())
        {
            $companies = new Companies($this->_siteID);
            $selectedCompanyID = $companies->getDefaultCompany();
        }

        /* Do we have a selected_company_id? */
        if ($selectedCompanyID === false)
        {
            $selectedCompanyContacts = array();
            $selectedCompanyLocation = array();
            $selectedDepartmentsString = '';

            $defaultCompanyID = $companies->getDefaultCompany();
            if ($defaultCompanyID !== false)
            {
                $defaultCompanyRS = $companies->get($defaultCompanyID);
            }
            else
            {
                $defaultCompanyRS = array();
            }

            $companyRS = array();
        }
        else
        {
            $selectedCompanyContacts = $companies->getContactsArray(
                $selectedCompanyID
            );
            $selectedCompanyLocation = $companies->getLocationArray(
                $selectedCompanyID
            );
            $departmentsRS = $companies->getDepartments($selectedCompanyID);
            $selectedDepartmentsString = ListEditor::getStringFromList(
                $departmentsRS, 'name'
            );

            $defaultCompanyID = false;
            $defaultCompanyRS = array();

            $companyRS = $companies->get($selectedCompanyID);
        }

        /* Should we prepopulate the blank JO with the contents of another JO? */
        if (isset($_GET['typeOfAdd']) &&
            $this->isRequiredIDValid('jobOrderID', $_GET) &&
            $_GET['typeOfAdd'] == 'existing')
        {
            $jobOrderID = $_GET['jobOrderID'];

            $jobOrderSourceRS = $jobOrders->get($jobOrderID);

            $jobOrderSourceExtraFields = $jobOrders->extraFields->getValuesForEdit($jobOrderID);

            $this->_template->assign('jobOrderSourceRS', $jobOrderSourceRS);
            $this->_template->assign('jobOrderSourceExtraFields', $jobOrderSourceExtraFields);
        }
        else
        {
            $this->_template->assign('jobOrderSourceRS', false);
            $this->_template->assign('jobOrderSourceExtraFields', false);
        }

        /* Get extra fields. */
        $extraFieldRS = $jobOrders->extraFields->getValuesForAdd();

        /* Get questionnaires to attach (if public) */
        $questionnaire = new Questionnaire($this->_siteID);
        $questionnaires = $questionnaire->getAll(false);

        $careerPortalSettings = new CareerPortalSettings($this->_siteID);
        $careerPortalSettingsRS = $careerPortalSettings->getAll();
        $careerPortalEnabled = intval($careerPortalSettingsRS['enabled']) ? true : false;

        $this->_template->assign('careerPortalEnabled', $careerPortalEnabled);
        $this->_template->assign('questionnaires', $questionnaires);
        $this->_template->assign('extraFieldRS', $extraFieldRS);
        $this->_template->assign('defaultCompanyID', $defaultCompanyID);
        $this->_template->assign('defaultCompanyRS', $defaultCompanyRS);
        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', 'Add Job Order');
        $this->_template->assign('usersRS', $usersRS);
        $this->_template->assign('userID', $this->_userID);
        $this->_template->assign('companiesRS', $companiesRS);
        $this->_template->assign('companyRS', $companyRS);
        $this->_template->assign('noCompanies', $noCompanies);
        $this->_template->assign('selectedCompanyID', $selectedCompanyID);
        $this->_template->assign('selectedCompanyContacts', $selectedCompanyContacts);
        $this->_template->assign('selectedCompanyLocation', $selectedCompanyLocation);
        $this->_template->assign('selectedDepartmentsString', $selectedDepartmentsString);
        $this->_template->assign('isHrMode', $_SESSION['CATS']->isHrMode());
        $this->_template->assign('sessionCookie', $_SESSION['CATS']->getCookie());
        $this->_template->assign('jobTypes', (new JobOrderTypes())->getAll());

        if (!eval(Hooks::get('JO_ADD'))) return;

        $this->_template->display('./modules/joborders/Add.tpl');
    }

    /*
     * Called by handleRequest() to process saving / submitting the add page.
     */
    private function onAdd()
    {
        /* Bail out if we don't have a valid company ID. */
        if (!$this->isRequiredIDValid('companyID', $_POST))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid company ID.');
        }

        /* Bail out if we don't have a valid recruiter user ID. */
        if (!$this->isRequiredIDValid('recruiter', $_POST))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid recruiter user ID.');
        }

        /* Bail out if we don't have a valid owner user ID. */
        if (!$this->isRequiredIDValid('owner', $_POST))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid owner user ID.');
        }

        /* Bail out if we don't have a valid number of openings. */
        if (!$this->isRequiredIDValid('openings', $_POST))
        {
            CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'Invalid number of openings.');
        }

        /* Bail out if we don't have a valid contact ID. */
        if (!$this->isOptionalIDValid('contactID', $_POST))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid contact ID.');
        }

        if (isset($_POST['openings']) && !empty($_POST['openings']) &&
            !ctype_digit((string) trim($_POST['openings'])))
        {        	
            CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'Invalid number of openings.');
        }

        /* Bail out if we received an invalid start date; if not, go ahead and
         * convert the date to MySQL format.
         */
        $startDate = $this->getTrimmedInput('startDate', $_POST);
        if (!empty($startDate))
        {
            if (!DateUtility::validate('-', $startDate, DATE_FORMAT_MMDDYY))
            {
                CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'Invalid start date.');
            }

            /* Convert start_date to something MySQL can understand. */
            $startDate = DateUtility::convert(
                '-', $startDate, DATE_FORMAT_MMDDYY, DATE_FORMAT_YYYYMMDD
            );
        }

        /* Hot job? */
        $isHot = $this->isChecked('isHot', $_POST);

        /* Public Job? */
        $isPublic = $this->isChecked('public', $_POST);

        /* If it is public, is a questionnaire attached? */
        $questionnaireID =
            // If a questionnaire is provided the field will be shown and it will != 'none'
            isset($_POST['questionnaire']) && !empty($_POST['questionnaire']) &&
            strcmp($_POST['questionnaire'], 'none') && $isPublic ?
            // The result will be an ID from the questionnaire table:
            intval($_POST['questionnaire']) :
            // If no questionnaire exists, boolean false
            false;

        $companyID   = $_POST['companyID'];
        $contactID   = $_POST['contactID'];
        $recruiter   = $_POST['recruiter'];
        $owner       = $_POST['owner'];
        $openings    = $_POST['openings'];

        $title       = $this->getSanitisedInput('title', $_POST);
        $companyJobID = $this->getTrimmedInput('companyJobID', $_POST);
        $type        = $this->getTrimmedInput('type', $_POST);
        $city        = $this->getSanitisedInput('city', $_POST);
        $state       = $this->getSanitisedInput('state', $_POST);
        $duration    = $this->getSanitisedInput('duration', $_POST);
        $department  = $this->getTrimmedInput('department', $_POST);
        $maxRate     = $this->getSanitisedInput('maxRate', $_POST);
        $salary      = $this->getSanitisedInput('salary', $_POST);
        $description = $this->getTrimmedInput('description', $_POST);
        $notes       = $this->getSanitisedInput('notes', $_POST);

        /* Bail out if any of the required fields are empty. */
        if (empty($title) || empty($type) || empty($city) || empty($state))
        {
            CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'Required fields are missing.');
        }

        if (!eval(Hooks::get('JO_ON_ADD'))) return;

        $jobOrders = new JobOrders($this->_siteID);
        $jobOrderID = $jobOrders->add(
            $title, $companyID, $contactID, $description, $notes, $duration,
            $maxRate, $type, $isHot, $isPublic, $openings, $companyJobID,
            $salary, $city, $state, $startDate, $this->_userID, $recruiter,
            $owner, $department, $questionnaireID
        );

        if ($jobOrderID <= 0)
        {
            CommonErrors::fatal(COMMONERROR_RECORDERROR, $this, 'Failed to add job order.');
        }

        /* Update extra fields. */
        $jobOrders->extraFields->setValuesOnEdit($jobOrderID);

        $jobOrderHiringPlans = new JobOrderHiringPlans($this->_siteID);
        $jobOrderHiringPlans->createDefaultPlan($jobOrderID, (int) $openings, $this->_userID);

        if (!eval(Hooks::get('JO_ON_ADD_POST'))) return;

        CATSUtility::transferRelativeURI(
            'm=joborders&a=show&jobOrderID=' . $jobOrderID
        );
    }

    /*
     * Called by handleRequest() to process loading the edit page.
     */
    private function edit()
    {
        /* Bail out if we don't have a valid candidate ID. */
        if (!$this->isRequiredIDValid('jobOrderID', $_GET))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid job order ID.');
        }

        $jobOrderID = $_GET['jobOrderID'];


        $jobOrders = new JobOrders($this->_siteID);
        $data = $jobOrders->getForEditing($jobOrderID);

        /* Bail out if we got an empty result set. */
        if (empty($data))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'The specified job order ID could not be found.');
        }

        $users = new Users($this->_siteID);
        $usersRS = $users->getSelectList();

        $companies = new Companies($this->_siteID);
        $companiesRS = $companies->getSelectList();
        $contactsRS = $companies->getContactsArray($data['companyID']);

        /* Add an MRU entry. */
        $_SESSION['CATS']->getMRU()->addEntry(
            DATA_ITEM_JOBORDER, $jobOrderID, $data['title']
        );

        $emailTemplates = new EmailTemplates($this->_siteID);
        $statusChangeTemplateRS = $emailTemplates->getByTag(
            'EMAIL_TEMPLATE_OWNERSHIPASSIGNJOBORDER'
        );
        if ($statusChangeTemplateRS['disabled'] == 1)
        {
            $emailTemplateDisabled = true;
        }
        else
        {
            $emailTemplateDisabled = false;
        }

        if ($this->getUserAccessLevel('joborders.email') == ACCESS_LEVEL_DEMO)
        {
            $canEmail = false;
        }
        else
        {
            $canEmail = true;
        }

        $companies = new Companies($this->_siteID);
        $defaultCompanyID = $companies->getDefaultCompany();
        if ($defaultCompanyID !== false)
        {
            $defaultCompanyRS = $companies->get($defaultCompanyID);
        }
        else
        {
            $defaultCompanyRS = array();
        }

        /* Get departments. */
        $departmentsRS = $companies->getDepartments($data['companyID']);
        $departmentsString = ListEditor::getStringFromList($departmentsRS, 'name');

        /* Date format for DateInput()s. */
        if ($_SESSION['CATS']->isDateDMY())
        {
            $data['startDateMDY'] = DateUtility::convert(
                '-', $data['startDate'], DATE_FORMAT_DDMMYY, DATE_FORMAT_MMDDYY
            );
        }
        else
        {
            $data['startDateMDY'] = $data['startDate'];
        }

        if ($_SESSION['CATS']->isDateDMY())
        {
            $data['createdDateMDY'] = DateUtility::convert(
                '-', $data['createdDate'], DATE_FORMAT_DDMMYY, DATE_FORMAT_MMDDYY
            );
        }
        else
        {
            $data['createdDateMDY'] = $data['createdDate'];
        }

        /* Get extra fields. */
        $extraFieldRS = $jobOrders->extraFields->getValuesForEdit($jobOrderID);

        /* Check if career portal is enabled */
        $careerPortalSettings = new CareerPortalSettings($this->_siteID);
        $careerPortalSettingsRS = $careerPortalSettings->getAll();
        $careerPortalEnabled = intval($careerPortalSettingsRS['enabled']) ? true : false;

        /* Get questionnaire information (if exists) */
        $questionnaireID = false;
        $questionnaireData = false;
        $isPublic = false;
        $questionnaire = new Questionnaire($this->_siteID);

        $questionnaires = $questionnaire->getAll(false);

        if ($careerPortalEnabled && $data['public'])
        {
            $isPublic = true;
            if ($data['questionnaireID'])
            {
                $questionnaire = new Questionnaire($this->_siteID);
                $q = $questionnaire->get($data['questionnaireID']);
                if (is_array($q) && !empty($q))
                {
                    $questionnaireID = $q['questionnaireID'];
                    $questionnaireData = $q;
                }
            }
        }

        $this->_template->assign('extraFieldRS', $extraFieldRS);
        $this->_template->assign('careerPortalEnabled', $careerPortalEnabled);
        $this->_template->assign('questionnaireID', $questionnaireID);
        $this->_template->assign('questionnaireData', $questionnaireData);
        $this->_template->assign('questionnaires', $questionnaires);
        $this->_template->assign('isPublic', $isPublic);
        $this->_template->assign('defaultCompanyID', $defaultCompanyID);
        $this->_template->assign('defaultCompanyRS', $defaultCompanyRS);
        $this->_template->assign('canEmail', $canEmail);
        $this->_template->assign('emailTemplateDisabled', $emailTemplateDisabled);
        $this->_template->assign('active', $this);
        $this->_template->assign('data', $data);
        $this->_template->assign('usersRS', $usersRS);
        $this->_template->assign('companiesRS', $companiesRS);
        $this->_template->assign('departmentsRS', $departmentsRS);
        $this->_template->assign('departmentsString', $departmentsString);
        $this->_template->assign('contactsRS', $contactsRS);
        $this->_template->assign('jobOrderID', $jobOrderID);
        $this->_template->assign('isHrMode', $_SESSION['CATS']->isHrMode());
        $this->_template->assign('sessionCookie', $_SESSION['CATS']->getCookie());
        $this->_template->assign('jobTypes', (new JobOrderTypes())->getAll());
        $this->_template->assign('jobOrderStatuses', (JobOrderStatuses::getAll()));
        $jobOrderHiringPlans = new JobOrderHiringPlans($this->_siteID);
        $this->_template->assign('hasHiringPlan', ($jobOrderHiringPlans->getCount($jobOrderID) > 0));
        $this->_template->assign('hiringPlanLink', CATSUtility::getIndexName() . '?m=joborders&a=editHiringPlan&jobOrderID=' . $jobOrderID);

        if (!eval(Hooks::get('JO_EDIT'))) return;

        $this->_template->display('./modules/joborders/Edit.tpl');
    }

    private function editHiringPlan()
    {
        if (!$this->isRequiredIDValid('jobOrderID', $_GET))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid job order ID.');
        }

        $jobOrderID = $_GET['jobOrderID'];
        $jobOrders = new JobOrders($this->_siteID);
        $data = $jobOrders->get($jobOrderID);

        if (empty($data))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'The specified job order ID could not be found.');
        }

        $jobOrderHiringPlans = new JobOrderHiringPlans($this->_siteID);
        $hiringPlanRS = $jobOrderHiringPlans->getByJobOrder($jobOrderID);
        foreach ($hiringPlanRS as $index => $planRow)
        {
            // DateInputForDOM expects MM-DD-YY, so normalize for the picker.
            $hiringPlanRS[$index]['startDate'] = $this->formatHiringPlanDateForPicker($planRow['startDate']);
            $hiringPlanRS[$index]['endDate'] = $this->formatHiringPlanDateForPicker($planRow['endDate']);
        }

        $this->_template->assign('active', $this);
        $this->_template->assign('jobOrderID', $jobOrderID);
        $this->_template->assign('jobOrderTitle', $data['title']);
        $this->_template->assign('hiringPlanRS', $hiringPlanRS);

        $this->_template->display('./modules/joborders/HiringPlan.tpl');
    }

    private function onEditHiringPlan()
    {
        if (!$this->isRequiredIDValid('jobOrderID', $_POST))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid job order ID.');
        }

        $jobOrderID = $_POST['jobOrderID'];

        $planIDs = isset($_POST['planID']) ? $_POST['planID'] : array();
        $startDates = isset($_POST['startDate']) ? $_POST['startDate'] : array();
        $endDates = isset($_POST['endDate']) ? $_POST['endDate'] : array();
        $openings = isset($_POST['openings']) ? $_POST['openings'] : array();
        $priorities = isset($_POST['priority']) ? $_POST['priority'] : array();
        $notes = isset($_POST['notes']) ? $_POST['notes'] : array();
        $deleteIDs = isset($_POST['delete']) ? $_POST['delete'] : array();
        $deleteIDs = array_map('intval', $deleteIDs);

        $plans = array();
        $rowCount = count($planIDs);
        $debugHiringPlan = (defined('HIRING_PLAN_DEBUG') && HIRING_PLAN_DEBUG);
        for ($i = 0; $i < $rowCount; $i++)
        {
            $planID = (int) $planIDs[$i];
            $startDate = isset($startDates[$i]) ? trim($startDates[$i]) : '';
            $endDate = isset($endDates[$i]) ? trim($endDates[$i]) : '';
            $openingsRaw = isset($openings[$i]) ? trim($openings[$i]) : '';
            $priorityRaw = isset($priorities[$i]) ? trim($priorities[$i]) : '';
            $noteText = isset($notes[$i]) ? trim($notes[$i]) : '';

            $hasData = ($openingsRaw !== '' || $startDate !== '' || $endDate !== '' || $noteText !== '');
            if (!$hasData)
            {
                continue;
            }

            if ($openingsRaw === '' || !ctype_digit($openingsRaw))
            {
                CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'Invalid openings.');
            }

            $startRaw = $startDate;
            $endRaw = $endDate;
            if ($debugHiringPlan)
            {
                error_log(
                    'HiringPlan debug raw: ' . json_encode(array(
                        'jobOrderID' => $jobOrderID,
                        'row' => $i,
                        'startRaw' => $startRaw,
                        'endRaw' => $endRaw,
                        'openingsRaw' => $openingsRaw,
                        'priorityRaw' => $priorityRaw,
                        'isDateDMY' => ($_SESSION['CATS']->isDateDMY() ? 1 : 0)
                    ))
                );
            }

            $startDate = $this->normalizeHiringPlanInputDate($startDate, 'start');
            $endDate = $this->normalizeHiringPlanInputDate($endDate, 'end');
            if ($debugHiringPlan)
            {
                error_log(
                    'HiringPlan debug parsed: ' . json_encode(array(
                        'jobOrderID' => $jobOrderID,
                        'row' => $i,
                        'startRaw' => $startRaw,
                        'endRaw' => $endRaw,
                        'startISO' => $startDate,
                        'endISO' => $endDate
                    ))
                );
            }

            $priority = (int) $priorityRaw;
            if ($priority < 1 || $priority > 5)
            {
                CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'Invalid priority.');
            }

            if ($startDate !== null && $endDate !== null && $endDate < $startDate)
            {
                CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'End date cannot be before start date.');
            }

            $plans[] = array(
                'planID' => $planID,
                'startDate' => $startDate,
                'endDate' => $endDate,
                'openings' => (int) $openingsRaw,
                'priority' => $priority,
                'notes' => $noteText
            );
        }

        $jobOrderHiringPlans = new JobOrderHiringPlans($this->_siteID);
        $jobOrderHiringPlans->savePlans($jobOrderID, $plans, $deleteIDs, $this->_userID);

        CATSUtility::transferRelativeURI(
            'm=joborders&a=show&jobOrderID=' . $jobOrderID
        );
    }

    private function formatHiringPlanDateForInput($dateString)
    {
        $isoDate = $this->parseHiringPlanDateToISO($dateString);
        if ($isoDate === '')
        {
            return '';
        }

        $outputFormat = $_SESSION['CATS']->isDateDMY() ? DATE_FORMAT_DDMMYY : DATE_FORMAT_MMDDYY;
        return DateUtility::convert('-', $isoDate, DATE_FORMAT_YYYYMMDD, $outputFormat);
    }

    private function formatHiringPlanDateForPicker($dateString)
    {
        $dateString = trim((string) $dateString);
        if ($dateString === '')
        {
            return '';
        }

        $isoDate = $this->parseHiringPlanDateToISO($dateString);
        if ($isoDate === '')
        {
            return '';
        }

        return DateUtility::convert('-', $isoDate, DATE_FORMAT_YYYYMMDD, DATE_FORMAT_MMDDYY);
    }

    private function parseHiringPlanDateToISO($dateString)
    {
        $dateString = trim((string) $dateString);
        if ($dateString === '')
        {
            return '';
        }

        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateString))
        {
            if (DateUtility::validate('-', $dateString, DATE_FORMAT_YYYYMMDD))
            {
                return $dateString;
            }

            return '';
        }

        if (preg_match('/^(\\d{2})-(\\d{2})-(\\d{4})$/', $dateString, $matches))
        {
            // DateInputForDOM submissions are MDY (MM-DD-YYYY) regardless of locale.
            $month = (int) $matches[1];
            $day = (int) $matches[2];
            $year = (int) $matches[3];
            $isoDate = sprintf('%04d-%02d-%02d', $year, $month, $day);
            if (DateUtility::validate('-', $isoDate, DATE_FORMAT_YYYYMMDD))
            {
                return $isoDate;
            }
            return '';
        }

        $validMDY = DateUtility::validate('-', $dateString, DATE_FORMAT_MMDDYY);
        $validDMY = DateUtility::validate('-', $dateString, DATE_FORMAT_DDMMYY);
        if ($validMDY && $validDMY)
        {
            return DateUtility::convert('-', $dateString, DATE_FORMAT_MMDDYY, DATE_FORMAT_YYYYMMDD);
        }
        if ($validMDY)
        {
            return DateUtility::convert('-', $dateString, DATE_FORMAT_MMDDYY, DATE_FORMAT_YYYYMMDD);
        }
        if ($validDMY)
        {
            return DateUtility::convert('-', $dateString, DATE_FORMAT_DDMMYY, DATE_FORMAT_YYYYMMDD);
        }

        return '';
    }

    private function normalizeHiringPlanInputDate($dateString, $label)
    {
        $dateString = trim((string) $dateString);
        if ($dateString === '')
        {
            return null;
        }

        $isoDate = $this->parseHiringPlanDateToISO($dateString);
        if ($isoDate === '')
        {
            CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'Invalid ' . $label . ' date.');
        }

        return $isoDate;
    }

    /*
     * Called by handleRequest() to process saving / submitting the edit page.
     */
    private function onEdit()
    {
        $jobOrders = new JobOrders($this->_siteID);

        /* Bail out if we don't have a valid job order ID. */
        if (!$this->isRequiredIDValid('jobOrderID', $_POST))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid job order ID.');
        }

        $jobOrderID = $_POST['jobOrderID'];

        /* Bail out if we don't have a valid company ID. */
        if (!$this->isRequiredIDValid('companyID', $_POST))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid company ID.');
        }

        /* Bail out if we don't have a valid contact ID. */
        if (!$this->isOptionalIDValid('contactID', $_POST))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid contact ID.');
        }

        /* Bail out if we don't have a valid recruiter user ID. */
        if (!$this->isRequiredIDValid('recruiter', $_POST))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid recruiter user ID.');
        }

        /* Bail out if we don't have a valid owner user ID. */
        if (!$this->isOptionalIDValid('owner', $_POST))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid owner user ID.');
        }

        /* Bail out if we received an invalid start date; if not, go ahead and
         * convert the date to MySQL format.
         */
        $startDate = $this->getTrimmedInput('startDate', $_POST);
        if (!empty($startDate))
        {
            if (!DateUtility::validate('-', $startDate, DATE_FORMAT_MMDDYY))
            {
                CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'Invalid start date.');
                return;
            }

            /* Convert start_date to something MySQL can understand. */
            $startDate = DateUtility::convert(
                '-', $startDate, DATE_FORMAT_MMDDYY, DATE_FORMAT_YYYYMMDD
            );
        }

        $createdDate = $this->getTrimmedInput('createdDate', $_POST);
        $createdTime = $this->getTrimmedInput('createdTime', $_POST);
        $dateCreated = null;

        if ($createdDate !== '' || $createdTime !== '')
        {
            if ($createdDate === '' || $createdTime === '')
            {
                CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'Created date and time are required.');
            }

            if (!DateUtility::validate('-', $createdDate, DATE_FORMAT_MMDDYY))
            {
                CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'Invalid created date.');
            }

            $createdDate = DateUtility::convert(
                '-', $createdDate, DATE_FORMAT_MMDDYY, DATE_FORMAT_YYYYMMDD
            );

            if (!preg_match('/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i', $createdTime, $matches))
            {
                CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'Invalid created time.');
            }

            $hour = (int) $matches[1];
            $minute = (int) $matches[2];
            $meridiem = strtoupper($matches[3]);

            if ($hour < 1 || $hour > 12 || $minute > 59)
            {
                CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'Invalid created time.');
            }

            if ($hour == 12)
            {
                $hour = 0;
            }
            if ($meridiem == 'PM')
            {
                $hour += 12;
            }

            $dateCreated = sprintf('%s %02d:%02d:00', $createdDate, $hour, $minute);
        }

        /* Bail out if we received an invalid status. */
        /* FIXME: Check actual status codes. */
        if (!isset($_POST['status']) || empty($_POST['status']))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid status.');
        }

        if (isset($_POST['openings']) && !empty($_POST['openings']) &&
            !ctype_digit((string) trim($_POST['openings'])))
        {
            CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'Invalid number of openings.');
        }

        /* Hot job? */
        $isHot = $this->isChecked('isHot', $_POST);

        /* Public Job? */
        $public = $this->isChecked('public', $_POST);

        /* If it is public, is a questionnaire attached? */
        $questionnaireID =
            // If a questionnaire is provided the field will be shown and it will != 'none'
            isset($_POST['questionnaire']) && !empty($_POST['questionnaire']) &&
            strcmp($_POST['questionnaire'], 'none') && $public ?
            // The result will be an ID from the questionnaire table:
            intval($_POST['questionnaire']) :
            // If no questionnaire exists, boolean false
            false;

        $companyID         = $_POST['companyID'];
        $contactID         = $_POST['contactID'];
        $owner             = $_POST['owner'];
        $recruiter         = $_POST['recruiter'];
        $openings          = $_POST['openings'];
        $openingsAvailable = $_POST['openingsAvailable'];
        $jobOrderHiringPlans = new JobOrderHiringPlans($this->_siteID);
        if ($jobOrderHiringPlans->getCount($jobOrderID) > 0)
        {
            $openings = $jobOrderHiringPlans->getTotalOpenings($jobOrderID);
            if ((int) $openingsAvailable > (int) $openings)
            {
                $openingsAvailable = $openings;
            }
        }

        /* Change ownership email? */
        if ($this->isChecked('ownershipChange', $_POST) && $owner > 0)
        {
            $jobOrderDetails = $jobOrders->get($jobOrderID);

            $users = new Users($this->_siteID);
            $ownerDetails = $users->get($_POST['owner']);

            if (!empty($ownerDetails))
            {
                $emailAddress = $ownerDetails['email'];

                /* Get the change status email template. */
                $emailTemplates = new EmailTemplates($this->_siteID);
                $statusChangeTemplateRS = $emailTemplates->getByTag(
                    'EMAIL_TEMPLATE_OWNERSHIPASSIGNJOBORDER'
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
                    '%JBODOWNER%',
                    '%JBODTITLE%',
                    '%JBODCLIENT%',
                    '%JBODID%',
                    '%JBODCATSURL%'
                );
                $replacementStrings = array(
                    $ownerDetails['fullName'],
                    $jobOrderDetails['title'],
                    $jobOrderDetails['companyName'],
                    $jobOrderID,
                    '<a href="http://' . $_SERVER['HTTP_HOST'] . substr($_SERVER['REQUEST_URI'], 0, strpos($_SERVER['REQUEST_URI'], '?')) . '?m=joborders&amp;a=show&amp;jobOrderID=' . $jobOrderID . '">'.
                        'http://' . $_SERVER['HTTP_HOST'] . substr($_SERVER['REQUEST_URI'], 0, strpos($_SERVER['REQUEST_URI'], '?')) . '?m=joborders&amp;a=show&amp;jobOrderID=' . $jobOrderID . '</a>'
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

        $title       = $this->getSanitisedInput('title', $_POST);
        $companyJobID = $this->getTrimmedInput('companyJobID', $_POST);
        $type        = $this->getTrimmedInput('type', $_POST);
        $city        = $this->getSanitisedInput('city', $_POST);
        $state       = $this->getSanitisedInput('state', $_POST);
        $status      = $this->getTrimmedInput('status', $_POST);
        $duration    = $this->getSanitisedInput('duration', $_POST);
        $department  = $this->getTrimmedInput('department', $_POST);
        $maxRate     = $this->getSanitisedInput('maxRate', $_POST);
        $salary      = $this->getSanitisedInput('salary', $_POST);
        $description = $this->getTrimmedInput('description', $_POST);
        $notes       = $this->getSanitisedInput('notes', $_POST);

        /* Bail out if any of the required fields are empty. */
        if (empty($title) || empty($type) || empty($city) || empty($state))
        {
            CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'Required fields are missing.');
        }

        if (!eval(Hooks::get('JO_ON_EDIT_PRE'))) return;

        if (!$jobOrders->update($jobOrderID, $title, $companyJobID, $companyID, $contactID,
            $description, $notes, $duration, $maxRate, $type, $isHot,
            $openings, $openingsAvailable, $salary, $city, $state, $startDate, $status, $recruiter,
            $owner, $public, $email, $emailAddress, $department, $questionnaireID, $dateCreated))
        {
            CommonErrors::fatal(COMMONERROR_RECORDERROR, $this, 'Failed to update job order.');
        }

        /* Update extra fields. */
        $jobOrders->extraFields->setValuesOnEdit($jobOrderID);

        if (!eval(Hooks::get('JO_ON_EDIT_POST'))) return;

        CATSUtility::transferRelativeURI(
            'm=joborders&a=show&jobOrderID=' . $jobOrderID
        );
    }

    /*
     * Called by handleRequest() to process deleting a job order.
     */
    private function onDelete()
    {
        /* Bail out if we don't have a valid job order ID. */
        if (!$this->isRequiredIDValid('jobOrderID', $_GET))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid job order ID.');
        }

        $jobOrderID = $_GET['jobOrderID'];

        if (!eval(Hooks::get('JO_ON_DELETE_PRE'))) return;

        $joborders = new JobOrders($this->_siteID);
        $joborders->delete($jobOrderID);

        /* Delete the MRU entry if present. */
        $_SESSION['CATS']->getMRU()->removeEntry(
            DATA_ITEM_JOBORDER, $jobOrderID
        );

        if (!eval(Hooks::get('JO_ON_DELETE_POST'))) return;

        CATSUtility::transferRelativeURI('m=joborders&a=listByView');
    }

    /*
     * Called by handleRequest() to handle loading the "Add candidate to this
     * Job Order" initial search page in the modal dialog.
     */
    private function considerCandidateSearch()
    {
        /* Bail out if we don't have a valid job order ID. */
        if (!$this->isRequiredIDValid('jobOrderID', $_GET))
        {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid job order ID.');
        }

        $jobOrderID = $_GET['jobOrderID'];

        if (!eval(Hooks::get('JO_CONSIDER_CANDIDATE_SEARCH'))) return;

        $this->_template->assign('isFinishedMode', false);
        $this->_template->assign('isResultsMode', false);
        $this->_template->assign('jobOrderID', $jobOrderID);
        $this->_template->display('./modules/joborders/ConsiderSearchModal.tpl');
    }

    /*
     * Called by handleRequest() to handle processing an "Add candidate to
     * this Job Order" search and displaying the results in the
     * modal dialog.
     */
    private function onConsiderCandidateSearch()
    {
        /* Bail out if we don't have a valid candidate ID. */
        if (!$this->isRequiredIDValid('jobOrderID', $_POST))
        {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid job order ID.');
        }

        /* Bail out to prevent an error if the POST string doesn't even contain
         * a field named 'wildCardString' at all.
         */
        if (!isset($_POST['wildCardString']))
        {
            CommonErrors::fatal(COMMONERROR_WILDCARDSTRING, $this, 'No wild card string specified.');
        }

        $jobOrderID = $_POST['jobOrderID'];

        $query = $this->getTrimmedInput('wildCardString', $_POST);

        /* Get our current searching mode. */
        $mode = $this->getTrimmedInput('mode', $_POST);

        /* Execute the search. */
        $search = new SearchCandidates($this->_siteID);
        switch ($mode)
        {
            case 'searchByFullName':
                $rs = $search->byFullName($query, 'lastName', 'ASC');
                break;

            default:
                $this->listByView('Invalid search mode.');
                return;
                break;
        }

        $pipelines = new Pipelines($this->_siteID);
        $pipelinesRS = $pipelines->getJobOrderPipeline($jobOrderID);

        foreach ($rs as $rowIndex => $row)
        {
            if (ResultSetUtility::findRowByColumnValue($pipelinesRS,
                'candidateID', $row['candidateID']) !== false)
            {
                $rs[$rowIndex]['inPipeline'] = true;
            }
            else
            {
                $rs[$rowIndex]['inPipeline'] = false;
            }

            $rs[$rowIndex]['ownerAbbrName'] = StringUtility::makeInitialName(
                $row['ownerFirstName'],
                $row['ownerLastName'],
                false,
                LAST_NAME_MAXLEN
            );
        }

        $this->_template->assign('rs', $rs);
        $this->_template->assign('isFinishedMode', false);
        $this->_template->assign('isResultsMode', true);
        $this->_template->assign('jobOrderID', $jobOrderID);

        if (!eval(Hooks::get('JO_ON_CONSIDER_CANDIDATE_SEARCH'))) return;

        $this->_template->display('./modules/joborders/ConsiderSearchModal.tpl');
    }

    /*
     * Called by handleRequest() to process adding a candidate to the pipeline
     * in the modal dialog.
     */
    private function onAddToPipeline()
    {
        /* Bail out if we don't have a valid job order ID. */
        if (!$this->isRequiredIDValid('jobOrderID', $_GET))
        {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid job order ID.');
        }

        /* Bail out if we don't have a valid candidate ID. */
        if (!$this->isRequiredIDValid('candidateID', $_GET))
        {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid candidate ID.');
        }

        $jobOrderID  = $_GET['jobOrderID'];
        $candidateID = $_GET['candidateID'];

        if (!eval(Hooks::get('JO_ON_ADD_PIPELINE'))) return;

        $pipelines = new Pipelines($this->_siteID);
        if (!$pipelines->add($candidateID, $jobOrderID, $this->_userID))
        {
            CommonErrors::fatal(COMMONERROR_RECORDERROR, $this, 'Failed to add candidate to job order.');
        }

        $this->_template->assign('isFinishedMode', true);
        $this->_template->assign('jobOrderID', $jobOrderID);
        $this->_template->assign('candidateID', $candidateID);

        if (!eval(Hooks::get('JO_ON_ADD_PIPELINE_POST'))) return;

        $this->_template->display(
            './modules/joborders/ConsiderSearchModal.tpl'
        );
    }

    /*
     * Called by handleRequest() to handle loading the quick add candidate form
     * in the modal dialog.
     */
    private function addCandidateModal($contents = '', $fields = array())
    {
        /* Bail out if we don't have a valid job order ID. */
        if (!$this->isRequiredIDValid('jobOrderID', $_GET))
        {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid job order ID.');
        }

        $jobOrderID = $_GET['jobOrderID'];

        $candidates = new Candidates($this->_siteID);

        /* Get possible sources. */
        $sourcesRS = $candidates->getPossibleSources();
        $sourcesString = ListEditor::getStringFromList($sourcesRS, 'name');

        /* Get extra fields. */
        $extraFieldRS = $candidates->extraFields->getValuesForAdd();

        $associatedAttachment = 0;
        $associatedAttachmentRS = array();

        $EEOSettings = new EEOSettings($this->_siteID);
        $EEOSettingsRS = $EEOSettings->getAll();

        if (is_array($parsingStatus = LicenseUtility::getParsingStatus()) &&
            isset($parsingStatus['parseLimit']))
        {
            $parsingStatus['parseLimit'] = $parsingStatus['parseLimit'] - 1;
        }

        $careerPortalSettings = new CareerPortalSettings($this->_siteID);
        $careerPortalSettingsRS = $careerPortalSettings->getAll();
        $careerPortalEnabled = intval($careerPortalSettingsRS['enabled']) ? true : false;

        /* Get questionnaires to attach (if public) */
        $questionnaire = new Questionnaire($this->_siteID);
        $questionnaires = $questionnaire->getAll(false);

        $gdprSettings = new GDPRSettings($this->_siteID);
        $gdprSettingsRS = $gdprSettings->getAll();

        $gdprExpirationYears = (int) $gdprSettingsRS['gdprExpirationYears'];
        if ($gdprExpirationYears <= 0) {
            $gdprExpirationYears = 2;
        }

        $defaultGdprExpiration = date(
            'm-d-y',
            strtotime('+' . $gdprExpirationYears . ' years')
        );

        if (!isset($fields['gdprSigned'])) {
            $fields['gdprSigned'] = 0;
        } else {
            $fields['gdprSigned'] = ((int) $fields['gdprSigned'] === 1) ? 1 : 0;
        }

        if (
            !isset($fields['gdprExpirationDate']) ||
            $fields['gdprExpirationDate'] === ''
        ) {
            $fields['gdprExpirationDate'] = $defaultGdprExpiration;
        }

        $this->_template->assign('careerPortalEnabled', $careerPortalEnabled);
        $this->_template->assign('questionnaires', $questionnaires);
        $this->_template->assign('contents', $contents);
        $this->_template->assign('isParsingEnabled', $tmp = LicenseUtility::isParsingEnabled());
        $this->_template->assign('parsingStatus', $parsingStatus);
        $this->_template->assign('extraFieldRS', $extraFieldRS);
        $this->_template->assign('sourcesRS', $sourcesRS);
        $this->_template->assign('isModal', true);
        $this->_template->assign('jobOrderID', $jobOrderID);
        $this->_template->assign('sourcesString', $sourcesString);
        $this->_template->assign('preassignedFields', $fields);
        $this->_template->assign('associatedAttachment', $associatedAttachment);
        $this->_template->assign('associatedAttachmentRS', $associatedAttachmentRS);
        $this->_template->assign('associatedTextResume', false);
        $this->_template->assign('associatedFileResume', false);
        $this->_template->assign('EEOSettingsRS', $EEOSettingsRS);
        $this->_template->assign('gdprSettingsRS', $gdprSettingsRS);
        $this->_template->assign('sessionCookie', $_SESSION['CATS']->getCookie());
        $this->_template->assign('currentUserID', $_SESSION['CATS']->getUserID());
        $this->_template->assign(
            'dupCheckIsAdmin',
            ($_SESSION['CATS']->getAccessLevel('candidates.duplicates') >= ACCESS_LEVEL_SA)
        );

        if (!eval(Hooks::get('JO_ADD_CANDIDATE_MODAL'))) return;

        /* REMEMBER TO ALSO UPDATE CandidatesUI::add() IF APPLICABLE. */
        $this->_template->display('./modules/candidates/Add.tpl');
    }

    /*
     * Called by handleRequest() to handle processing the quick add candidate
     * form in the modal dialog.
     */
    private function onAddCandidateModal()
    {
        /* Bail out if we don't have a valid job order ID. */
        if (!$this->isRequiredIDValid('jobOrderID', $_POST))
        {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid job order ID.');
        }

        $jobOrderID = $_POST['jobOrderID'];

        /* URI to transfer after candidate is successfully added. */
        $transferURI = sprintf(
            'm=candidates&a=addToPipeline&candidateID=%s&jobOrderID=%s',
            '__CANDIDATE_ID__',
            $jobOrderID
        );

        if (!eval(Hooks::get('JO_ON_ADD_CANDIDATE_MODAL'))) return;

        include_once(LEGACY_ROOT . '/modules/candidates/CandidatesUI.php');
        $candidatesUI = new CandidatesUI();

        if (is_array($mp = $candidatesUI->checkParsingFunctions()))
        {
            return $this->addCandidateModal($mp[0], $mp[1]);
        }

        $candidatesUI->publicAddCandidate(
            true, $transferURI, $this->_moduleDirectory
        );
    }

    private function addActivityChangeStatus()
    {
        $input = $_POST;
        if (!$this->isRequiredIDValid('candidateID', $input))
        {
            $input = $_GET;
        }

        /* Bail out if we don't have a valid candidate ID. */
        if (!$this->isRequiredIDValid('candidateID', $input))
        {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid candidate ID.');
        }

        /* Bail out if we don't have a valid job order ID. */
        if (!$this->isRequiredIDValid('jobOrderID', $input))
        {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid job order ID.');
        }

        $candidateID = $input['candidateID'];
        $jobOrderID  = $input['jobOrderID'];
        $enforceOwner = ((int) $this->getTrimmedInput('enforceOwner', $input) === 1);
        $refreshParentOnClose = ((int) $this->getTrimmedInput('refreshParent', $input) === 1);

        if ($enforceOwner)
        {
            $jobOrders = new JobOrders($this->_siteID);
            $jobOrderData = $jobOrders->get($jobOrderID);
            if (!$this->canAccessJobOrderPipelineByJobOrderData($jobOrderData))
            {
                CommonErrors::fatalModal(COMMONERROR_PERMISSION, $this, 'You do not have permission to change status for this job order.');
            }
        }

        $candidates = new Candidates($this->_siteID);
        $candidateData = $candidates->get($candidateID);

        /* Bail out if we got an empty result set. */
        if (empty($candidateData))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'The specified candidate ID could not be found.');
        }

        $pipelines = new Pipelines($this->_siteID);
        $pipelineData = $pipelines->get($candidateID, $jobOrderID);

        /* Bail out if we got an empty result set. */
        if (empty($pipelineData))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'The specified pipeline entry could not be found.');
        }

        $statusRS = $pipelines->getStatusesForPicking();

        $selectedStatusID = $pipelineData['statusID'];

        /* Override default send email behavior with site specific send email behavior. */
        $mailerSettings = new MailerSettings($this->_siteID);
        $mailerSettingsRS = $mailerSettings->getAll();

        $candidateJoborderStatusSendsMessage = unserialize($mailerSettingsRS['candidateJoborderStatusSendsMessage']);

        foreach ($statusRS as $index => $status)
        {
            $statusRS[$index]['triggersEmail'] = $candidateJoborderStatusSendsMessage[$status['statusID']];
        }

        /* Get the change status email template. */
        $emailTemplates = new EmailTemplates($this->_siteID);
        $statusChangeTemplateRS = $emailTemplates->getByTag(
            'EMAIL_TEMPLATE_STATUSCHANGE'
        );
        if (empty($statusChangeTemplateRS) ||
            empty($statusChangeTemplateRS['textReplaced']))
        {
            $statusChangeTemplate = '';
            $emailDisabled = $statusChangeTemplateRS['disabled'];
        }
        else
        {
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
            $candidateData['firstName'] . ' ' . $candidateData['lastName']
        );
        $statusChangeTemplate = str_replace(
            $stringsToFind,
            $replacementStrings,
            $statusChangeTemplate
        );

        $activityEntries = new ActivityEntries($this->_siteID);
        $activityTypes = $activityEntries->getTypes();

        $calendar = new Calendar($this->_siteID);
        $calendarEventTypes = $calendar->getAllEventTypes();

        if (SystemUtility::isSchedulerEnabled() && !$_SESSION['CATS']->isDemo())
        {
            $allowEventReminders = true;
        }
        else
        {
            $allowEventReminders = false;
        }

        $this->_template->assign('candidateID', $candidateID);
        $this->_template->assign('pipelineData', $pipelineData);
        $this->_template->assign('statusRS', $statusRS);
        $this->_template->assign('selectedJobOrderID', $jobOrderID);
        $this->_template->assign('selectedStatusID', $selectedStatusID);
        $this->_template->assign('calendarEventTypes', $calendarEventTypes);
        $this->_template->assign('allowEventReminders', $allowEventReminders);
        $this->_template->assign('userEmail', $_SESSION['CATS']->getEmail());
        $this->_template->assign('onlyScheduleEvent', false);
        $this->_template->assign('statusChangeTemplate', $statusChangeTemplate);
        $this->_template->assign('emailDisabled', $emailDisabled);
        $this->_template->assign('isFinishedMode', false);
        $this->_template->assign('isJobOrdersMode', true);
        $this->_template->assign('activityTypes', $activityTypes);
        $rejectionReasons = $this->getRejectionReasons();
        $this->_template->assign('rejectionReasons', $rejectionReasons);
        $this->_template->assign(
            'rejectionOtherReasonId',
            $this->getOtherRejectionReasonId($rejectionReasons)
        );
        $this->_template->assign('rejectedStatusId', PIPELINE_STATUS_REJECTED);
        $this->_template->assign('enforceOwner', $enforceOwner ? 1 : 0);
        $this->_template->assign('refreshParentOnClose', $refreshParentOnClose ? 1 : 0);

        if (!eval(Hooks::get('JO_ADD_ACTIVITY_CHANGE_STATUS'))) return;

        $this->_template->display(
            './modules/candidates/AddActivityChangeStatusModal.tpl'
        );
    }

    private function pipelineStatusDetails()
    {
        $pipelineID = (int) $this->getTrimmedInput('pipelineID', $_GET);
        $candidateID = (int) $this->getTrimmedInput('candidateID', $_GET);
        $jobOrderID = (int) $this->getTrimmedInput('jobOrderID', $_GET);

        $pipelines = new Pipelines($this->_siteID);
        if ($pipelineID <= 0 && $candidateID > 0 && $jobOrderID > 0)
        {
            $pipelineID = $pipelines->getCandidateJobOrderID($candidateID, $jobOrderID);
        }

        if ($pipelineID <= 0)
        {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid pipeline entry.');
        }

        $db = DatabaseConnection::getInstance();
        $sql = sprintf(
            "SELECT
                candidate_joborder.candidate_id AS candidateID,
                candidate_joborder.joborder_id AS jobOrderID,
                candidate.first_name AS candidateFirstName,
                candidate.last_name AS candidateLastName,
                joborder.title AS jobOrderTitle,
                joborder.owner AS jobOrderOwner,
                joborder.recruiter AS jobOrderRecruiter,
                company.name AS companyName
            FROM
                candidate_joborder
            INNER JOIN candidate
                ON candidate.candidate_id = candidate_joborder.candidate_id
            INNER JOIN joborder
                ON joborder.joborder_id = candidate_joborder.joborder_id
            LEFT JOIN company
                ON company.company_id = joborder.company_id
            WHERE
                candidate_joborder.candidate_joborder_id = %s
            AND
                candidate_joborder.site_id = %s",
            $db->makeQueryInteger($pipelineID),
            $db->makeQueryInteger($this->_siteID)
        );

        $pipelineData = $db->getAssoc($sql);
        if (empty($pipelineData))
        {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Pipeline entry not found.');
        }

        if (!$this->canAccessJobOrderPipelineByOwnerRecruiter(
            $pipelineData['jobOrderOwner'],
            $pipelineData['jobOrderRecruiter']
        ))
        {
            CommonErrors::fatalModal(
                COMMONERROR_PERMISSION,
                $this,
                'You do not have permission to view this pipeline entry.'
            );
        }

        $statusHistoryRS = $pipelines->getStatusHistory($pipelineID);
        $canEditHistory = $this->canEditPipelineStatusHistory();

        $this->_template->assign('pipelineID', $pipelineID);
        $this->_template->assign('pipelineData', $pipelineData);
        $this->_template->assign('statusHistoryRS', $statusHistoryRS);
        $this->_template->assign('canEditHistory', $canEditHistory ? 1 : 0);
        $this->_template->assign('featureFlagEditHistory', false);

        $this->_template->display('./modules/joborders/PipelineStatusDetails.tpl');
    }

    private function pipelineStatusEditDate()
    {
        if (!$this->isPostBack())
        {
            CommonErrors::fatalModal(COMMONERROR_BADFIELDS, $this, 'Invalid request.');
        }

        if (!$this->canEditPipelineStatusHistory())
        {
            CommonErrors::fatalModal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
        }

        if (!$this->isRequiredIDValid('pipelineID', $_POST))
        {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid pipeline entry.');
        }

        $pipelineID = (int) $_POST['pipelineID'];
        $newDates = isset($_POST['newDate']) ? $_POST['newDate'] : array();
        $editNotes = isset($_POST['editNote']) ? $_POST['editNote'] : array();
        $originalDates = isset($_POST['originalDate']) ? $_POST['originalDate'] : array();

        if (!is_array($newDates))
        {
            $singleHistoryID = (int) $this->getTrimmedInput('historyID', $_POST);
            if ($singleHistoryID > 0)
            {
                $newDates = array($singleHistoryID => $newDates);
                $editNotes = array($singleHistoryID => $this->getTrimmedInput('editNote', $_POST));
                $originalDates = array($singleHistoryID => $this->getTrimmedInput('originalDate', $_POST));
            }
            else
            {
                $newDates = array();
            }
        }

        if (empty($newDates))
        {
            CommonErrors::fatalModal(COMMONERROR_BADFIELDS, $this, 'No changes submitted.');
        }

        $db = DatabaseConnection::getInstance();
        $isAdmin = $this->canEditPipelineStatusHistory();

        foreach ($newDates as $historyID => $newDateInput)
        {
            $historyID = (int) $historyID;
            if ($historyID <= 0)
            {
                continue;
            }

            $newDateInput = trim((string) $newDateInput);
            if ($newDateInput === '')
            {
                continue;
            }

            $editNote = isset($editNotes[$historyID]) ? trim((string) $editNotes[$historyID]) : '';
            $originalDate = isset($originalDates[$historyID]) ? trim((string) $originalDates[$historyID]) : '';
            if ($originalDate !== '' && $newDateInput === $originalDate && $editNote === '')
            {
                continue;
            }

            if (!preg_match('/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}(:\d{2})?)?$/', $newDateInput))
            {
                CommonErrors::fatalModal(COMMONERROR_MISSINGFIELDS, $this, 'Invalid date format.');
            }

            $timestamp = strtotime($newDateInput);
            if ($timestamp === false)
            {
                CommonErrors::fatalModal(COMMONERROR_MISSINGFIELDS, $this, 'Invalid date value.');
            }

            $newDate = date('Y-m-d H:i:s', $timestamp);
            if ($editNote === '')
            {
                $editNote = 'Date updated.';
            }

            $row = $db->getAssoc(sprintf(
                "SELECT
                    h.candidate_joborder_status_history_id AS historyID,
                    cjo.candidate_joborder_id AS pipelineID,
                    jo.owner AS jobOrderOwner
                 FROM
                    candidate_joborder_status_history h
                 INNER JOIN candidate_joborder cjo
                    ON cjo.candidate_id = h.candidate_id
                    AND cjo.joborder_id = h.joborder_id
                    AND cjo.site_id = h.site_id
                 INNER JOIN joborder jo
                    ON jo.joborder_id = cjo.joborder_id
                 WHERE
                    h.candidate_joborder_status_history_id = %s
                 AND
                    cjo.candidate_joborder_id = %s
                 AND
                    h.site_id = %s",
                $db->makeQueryInteger($historyID),
                $db->makeQueryInteger($pipelineID),
                $db->makeQueryInteger($this->_siteID)
            ));

            if (empty($row))
            {
                CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Pipeline history entry not found.');
            }

            if (!$isAdmin && (int) $row['jobOrderOwner'] !== (int) $this->_userID)
            {
                CommonErrors::fatalModal(
                    COMMONERROR_PERMISSION,
                    $this,
                    'You do not have permission to edit this pipeline entry.'
                );
            }

            $db->query(sprintf(
                "UPDATE candidate_joborder_status_history
                 SET
                    date = %s,
                    edited_at = NOW(),
                    edited_by = %s,
                    edit_note = %s
                 WHERE
                    candidate_joborder_status_history_id = %s
                 AND
                    site_id = %s",
                $db->makeQueryString($newDate),
                $db->makeQueryInteger($this->_userID),
                $db->makeQueryString($editNote),
                $db->makeQueryInteger($historyID),
                $db->makeQueryInteger($this->_siteID)
            ));
        }

        $redirect = CATSUtility::getIndexName() . '?m=joborders&a=pipelineStatusDetails&pipelineID=' . (int) $pipelineID;
        echo '<html><head><script type="text/javascript">',
             'if (window.opener && !window.opener.closed) { try { window.opener.location.reload(); } catch (e) {} }',
             'window.close();',
             'setTimeout(function(){ if (!window.closed) { window.location.href = \'', addslashes($redirect), '\'; } }, 200);',
             '</script></head><body></body></html>';
        return;
    }

    private function onAddActivityChangeStatus()
    {
        /* Bail out if we don't have a valid regarding job order ID. */
        if (!$this->isRequiredIDValid('regardingID', $_POST))
        {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid job order ID.');
        }

        $regardingID = $_POST['regardingID'];

        if (!eval(Hooks::get('JO_ON_ADD_ACTIVITY_CHANGE_STATUS'))) return;

        include_once(LEGACY_ROOT . '/modules/candidates/CandidatesUI.php');
        $candidatesUI = new CandidatesUI();
        $candidatesUI->publicAddActivityChangeStatus(
            true, $regardingID, $this->_moduleDirectory
        );
    }

    /*
     * Called by handleRequest() to process removing a candidate from the
     * pipeline for  a job order.
     */
    private function onRemoveFromPipeline()
    {
        $input = $_POST;
        if (!$this->isRequiredIDValid('candidateID', $input))
        {
            $input = $_GET;
        }

        /* Bail out if we don't have a valid candidate ID. */
        if (!$this->isRequiredIDValid('candidateID', $input))
        {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid candidate ID.');
        }

        /* Bail out if we don't have a valid job order ID. */
        if (!$this->isRequiredIDValid('jobOrderID', $input))
        {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid job order ID.');
        }

        $candidateID = $input['candidateID'];
        $jobOrderID  = $input['jobOrderID'];
        $commentText = $this->getTrimmedInput('comment', $input);
        if (!isset($input['comment']))
        {
            $this->renderRemoveFromPipelineForm($candidateID, $jobOrderID);
            return;
        }

        if (!eval(Hooks::get('JO_ON_REMOVE_PIPELINE'))) return;

        $pipelines = new Pipelines($this->_siteID);
        $pipelines->remove($candidateID, $jobOrderID, $this->_userID, $commentText);

        if (!eval(Hooks::get('JO_ON_REMOVE_PIPELINE_POST'))) return;

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
            'm=joborders&a=show&jobOrderID=' . $jobOrderID
        );
    }

    private function renderRemoveFromPipelineForm($candidateID, $jobOrderID)
    {
        $this->_template->assign('active', $this);
        $this->_template->assign('candidateID', $candidateID);
        $this->_template->assign('jobOrderID', $jobOrderID);

        if ($this->isPopupRequest())
        {
            $this->_template->display('./modules/joborders/RemoveFromPipelineModal.tpl');
            return;
        }

        $this->_template->display('./modules/joborders/RemoveFromPipeline.tpl');
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
     * Called by handleRequest() to process loading the search page.
     */
    private function search()
    {
        $savedSearches = new SavedSearches($this->_siteID);
        $savedSearchRS = $savedSearches->get(DATA_ITEM_JOBORDER);

        $this->_template->assign('savedSearchRS', $savedSearchRS);
        $this->_template->assign('wildCardString', '');
        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', 'Search Job Orders');
        $this->_template->assign('isResultsMode', false);
        $this->_template->assign('wildCardString_companyName', '');
        $this->_template->assign('wildCardString_jobTitle', '');
        $this->_template->assign('mode', '');

        if (!eval(Hooks::get('JO_SEARCH'))) return;

        $this->_template->display('./modules/joborders/Search.tpl');
    }

    /*
     * Called by handleRequest() to process displaying the search results.
     */
    private function onSearch()
    {
        $query_jobTitle = '';
        $query_companyName = '';

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
            $sortBy = 'title';
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

        /* Get our current searching mode. */
        $mode = $this->getTrimmedInput('mode', $_GET);

        /* Execute the search. */
        $search = new SearchJobOrders($this->_siteID);
        switch ($mode)
        {
            case 'searchByJobTitle':
                $query_jobTitle = $query;
                $rs = $search->byTitle($query, $sortBy, $sortDirection, false);
                break;

            case 'searchByCompanyName':
                $query_companyName = $query;
                $rs = $search->byCompanyName($query, $sortBy, $sortDirection, false);
                break;

            default:
                $this->listByView('Invalid search mode.');
                return;
                break;
        }

        foreach ($rs as $rowIndex => $row)
        {
            /* Convert '00-00-00' dates to empty strings. */
            $rs[$rowIndex]['startDate'] = DateUtility::fixZeroDate(
                $row['startDate']
            );

            if ($row['isHot'] == 1)
            {
                $rs[$rowIndex]['linkClass'] = 'jobLinkHot';
            }
            else
            {
                $rs[$rowIndex]['linkClass'] = 'jobLinkCold';
            }

            $rs[$rowIndex]['recruiterAbbrName'] = StringUtility::makeInitialName(
                $row['recruiterFirstName'],
                $row['recruiterLastName'],
                false,
                LAST_NAME_MAXLEN
            );

            $rs[$rowIndex]['ownerAbbrName'] = StringUtility::makeInitialName(
                $row['ownerFirstName'],
                $row['ownerLastName'],
                false,
                LAST_NAME_MAXLEN
            );
        }

        /* Save the search. */
        $savedSearches = new SavedSearches($this->_siteID);
        $savedSearches->add(
            DATA_ITEM_JOBORDER,
            $query,
            $_SERVER['REQUEST_URI'],
            false
        );

        $savedSearchRS = $savedSearches->get(DATA_ITEM_JOBORDER);

        $query = urlencode(htmlspecialchars($query));

        $jobOderIDs = implode(',', ResultSetUtility::getColumnValues($rs, 'jobOrderID'));
        $exportForm = ExportUtility::getForm(
            DATA_ITEM_JOBORDER, $jobOderIDs, 29, 5
        );

        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', 'Search Job Orders');
        $this->_template->assign('pager', $searchPager);
        $this->_template->assign('exportForm', $exportForm);

        $this->_template->assign('wildCardString', $query);
        $this->_template->assign('wildCardString_jobTitle', $query_jobTitle);
        $this->_template->assign('wildCardString_companyName', $query_companyName);
        $this->_template->assign('savedSearchRS', $savedSearchRS);
        $this->_template->assign('rs', $rs);
        $this->_template->assign('isResultsMode', true);
        $this->_template->assign('mode', $mode);

        if (!eval(Hooks::get('JO_ON_SEARCH'))) return;

        $this->_template->display('./modules/joborders/Search.tpl');
    }

    /*
     * Called by handleRequest() to process loading the create attachment
     * modal dialog.
     */
    private function createAttachment()
    {
        /* Bail out if we don't have a valid joborder ID. */
        if (!$this->isRequiredIDValid('jobOrderID', $_GET))
        {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid joborder ID.');
        }

        $jobOrderID = $_GET['jobOrderID'];

        $this->_template->assign('isFinishedMode', false);
        $this->_template->assign('jobOrderID', $jobOrderID);

        if (!eval(Hooks::get('JO_CREATE_ATTACHMENT'))) return;

        $this->_template->display(
            './modules/joborders/CreateAttachmentModal.tpl'
        );
    }

    /*
     * Called by handleRequest() to process creating an attachment.
     */
    private function onCreateAttachment()
    {
        /* Bail out if we don't have a valid joborder ID. */
        if (!$this->isRequiredIDValid('jobOrderID', $_POST))
        {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid joborder ID.');
        }

        $jobOrderID = $_POST['jobOrderID'];

        if (!eval(Hooks::get('JO_ON_CREATE_ATTACHMENT_PRE'))) return;

        $attachmentCreator = new AttachmentCreator($this->_siteID);
        $attachmentCreator->createFromUpload(
            DATA_ITEM_JOBORDER, $jobOrderID, 'file', false, false
        );

        if ($attachmentCreator->isError())
        {
            CommonErrors::fatalModal(COMMONERROR_FILEERROR, $this, $attachmentCreator->getError());
        }

        if (!eval(Hooks::get('JO_ON_CREATE_ATTACHMENT_POST'))) return;

        $this->_template->assign('isFinishedMode', true);
        $this->_template->assign('jobOrderID', $jobOrderID);

        $this->_template->display(
            './modules/joborders/CreateAttachmentModal.tpl'
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
        if (!$this->isRequiredIDValid('jobOrderID', $_POST))
        {
            CommonErrors::fatalModal(COMMONERROR_BADINDEX, $this, 'Invalid Job Order ID.');
        }

        $jobOrderID  = $_POST['jobOrderID'];
        $attachmentID = $_POST['attachmentID'];
        $securityToken = $this->getTrimmedInput('securityToken', $_POST);

        if (!$this->isCSRFTokenValid('joborders.deleteAttachment', $securityToken))
        {
            CommonErrors::fatalModal(COMMONERROR_PERMISSION, $this, 'Invalid request token.');
        }

        if (!eval(Hooks::get('JO_ON_DELETE_ATTACHMENT_PRE'))) return;

        $attachments = new Attachments($this->_siteID);
        $attachmentRS = $attachments->get($attachmentID, true);
        if (empty($attachmentRS) ||
            (int) $attachmentRS['dataItemType'] !== DATA_ITEM_JOBORDER ||
            (int) $attachmentRS['dataItemID'] !== (int) $jobOrderID)
        {
            CommonErrors::fatalModal(COMMONERROR_PERMISSION, $this, 'Attachment does not belong to this job order.');
        }

        $attachments->delete($attachmentID);

        if (!eval(Hooks::get('JO_ON_DELETE_ATTACHMENT_POST'))) return;

        CATSUtility::transferRelativeURI(
            'm=joborders&a=show&jobOrderID=' . $jobOrderID
        );
    }

    //Only accessable by MSA users - hides this job order from everybody by
    // FIXME: Document me.
    private function administrativeHideShow()
    {
        /* Bail out if we don't have a valid joborder ID. */
        if (!$this->isRequiredIDValid('jobOrderID', $_GET))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid Job Order ID.');
        }

        /* Bail out if we don't have a valid status ID. */
        if (!$this->isRequiredIDValid('state', $_GET, true))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid state ID.');
        }

        $jobOrderID = $_GET['jobOrderID'];

        // FIXME: Checkbox?
        (boolean) $state = $_GET['state'];

        $joborders = new JobOrders($this->_siteID);
        $joborders->administrativeHideShow($jobOrderID, $state);

        CATSUtility::transferRelativeURI('m=joborders&a=show&jobOrderID='.$jobOrderID);
    }

    private function canManageRecruiterAllocation()
    {
        if (!isset($_SESSION['CATS']) ||
            !is_object($_SESSION['CATS']) ||
            !method_exists($_SESSION['CATS'], 'isLoggedIn') ||
            !$_SESSION['CATS']->isLoggedIn())
        {
            return false;
        }

        $baseAccessLevel = 0;
        if (method_exists($_SESSION['CATS'], 'getBaseAccessLevel'))
        {
            $baseAccessLevel = (int) $_SESSION['CATS']->getBaseAccessLevel();
        }
        else
        {
            $baseAccessLevel = (int) $_SESSION['CATS']->getRealAccessLevel();
        }

        if ($baseAccessLevel >= ACCESS_LEVEL_SA)
        {
            return true;
        }

        $userRoles = new UserRoles($this->_siteID);
        if ($userRoles->isSchemaAvailable())
        {
            $role = $userRoles->getForUser($this->_userID);
            if (!empty($role) && isset($role['roleKey']) && $role['roleKey'] === 'hr_manager')
            {
                return true;
            }
        }

        return ($baseAccessLevel >= ACCESS_LEVEL_DELETE);
    }

    private function canEditPipelineStatusHistory()
    {
        return $this->canManageRecruiterAllocation();
    }

    private function canAccessJobOrderPipelineByOwnerRecruiter($ownerUserID, $recruiterUserID)
    {
        if ($this->canManageRecruiterAllocation())
        {
            return true;
        }

        $ownerUserID = (int) $ownerUserID;
        $recruiterUserID = (int) $recruiterUserID;
        $currentUserID = (int) $this->_userID;

        return ($ownerUserID === $currentUserID || $recruiterUserID === $currentUserID);
    }

    private function canAccessJobOrderPipelineByJobOrderData($jobOrderData)
    {
        if (empty($jobOrderData))
        {
            return false;
        }

        $ownerUserID = 0;
        if (isset($jobOrderData['owner']))
        {
            $ownerUserID = (int) $jobOrderData['owner'];
        }

        $recruiterUserID = 0;
        if (isset($jobOrderData['recruiter']))
        {
            $recruiterUserID = (int) $jobOrderData['recruiter'];
        }

        return $this->canAccessJobOrderPipelineByOwnerRecruiter($ownerUserID, $recruiterUserID);
    }

    private function getRecruiterAllocationUsers()
    {
        $db = DatabaseConnection::getInstance();
        $userRoles = new UserRoles($this->_siteID);

        if ($userRoles->isSchemaAvailable())
        {
            $sql = sprintf(
                "SELECT
                    user.user_id AS userID,
                    user.first_name AS firstName,
                    user.last_name AS lastName,
                    user.user_name AS username,
                    user.access_level AS accessLevel,
                    user_role.role_key AS roleKey,
                    user_role.role_name AS roleName
                FROM
                    user
                LEFT JOIN user_role
                    ON user_role.user_role_id = user.role_id
                   AND user_role.site_id = user.site_id
                WHERE
                    user.site_id = %s
                AND
                    user.access_level > %s
                AND
                    user.user_name <> 'cats@rootadmin'
                AND
                    (
                        user_role.role_key IN ('hr_recruiter', 'hr_manager', 'site_admin')
                        OR
                        (
                            user_role.user_role_id IS NULL
                            AND user.access_level >= %s
                        )
                    )
                ORDER BY
                    user.last_name ASC,
                    user.first_name ASC",
                $db->makeQueryInteger($this->_siteID),
                $db->makeQueryInteger(ACCESS_LEVEL_DISABLED),
                $db->makeQueryInteger(ACCESS_LEVEL_EDIT)
            );
        }
        else
        {
            $sql = sprintf(
                "SELECT
                    user.user_id AS userID,
                    user.first_name AS firstName,
                    user.last_name AS lastName,
                    user.user_name AS username,
                    user.access_level AS accessLevel,
                    '' AS roleKey,
                    '' AS roleName
                FROM
                    user
                WHERE
                    user.site_id = %s
                AND
                    user.access_level >= %s
                AND
                    user.user_name <> 'cats@rootadmin'
                ORDER BY
                    user.last_name ASC,
                    user.first_name ASC",
                $db->makeQueryInteger($this->_siteID),
                $db->makeQueryInteger(ACCESS_LEVEL_EDIT)
            );
        }

        $rows = $db->getAllAssoc($sql);
        foreach ($rows as $index => $row)
        {
            $fullName = trim($row['firstName'] . ' ' . $row['lastName']);
            if ($fullName === '')
            {
                $fullName = $row['username'];
            }
            $rows[$index]['fullName'] = $fullName;
        }

        return $rows;
    }

    private function recruiterAllocation($noticeMessage = '', $errorMessage = '')
    {
        $scope = strtolower(trim($this->getTrimmedInput('scope', $_REQUEST)));
        if (!in_array($scope, array('all', 'mine', 'unassigned'), true))
        {
            $scope = 'all';
        }

        $search = trim($this->getTrimmedInput('search', $_REQUEST));
        $ownerUserID = (int) $this->getTrimmedInput('ownerUserID', $_REQUEST);
        $recruiterUserIDRaw = $this->getTrimmedInput('recruiterUserID', $_REQUEST);
        if ($recruiterUserIDRaw === '')
        {
            $recruiterUserID = -2;
        }
        else
        {
            $recruiterUserID = (int) $recruiterUserIDRaw;
        }

        $page = (int) $this->getTrimmedInput('page', $_REQUEST);
        if ($page <= 0)
        {
            $page = 1;
        }

        $perPage = 50;
        $jobOrders = new JobOrders($this->_siteID);
        $totalRows = $jobOrders->getRecruiterAllocationCount(
            $scope,
            $search,
            $ownerUserID,
            $recruiterUserID,
            $this->_userID
        );

        $totalPages = 1;
        if ($totalRows > 0)
        {
            $totalPages = (int) ceil($totalRows / $perPage);
        }
        if ($page > $totalPages)
        {
            $page = $totalPages;
        }

        $offset = ($page - 1) * $perPage;
        $rows = $jobOrders->getRecruiterAllocationRows(
            $scope,
            $search,
            $ownerUserID,
            $recruiterUserID,
            $this->_userID,
            $perPage,
            $offset
        );

        $users = new Users($this->_siteID);
        $ownerOptions = $users->getSelectList();
        $recruiterOptions = $this->getRecruiterAllocationUsers();

        $this->_template->assign('active', $this);
        $this->_template->assign('scope', $scope);
        $this->_template->assign('search', $search);
        $this->_template->assign('ownerUserID', $ownerUserID);
        $this->_template->assign('recruiterUserID', $recruiterUserID);
        $this->_template->assign('page', $page);
        $this->_template->assign('totalPages', $totalPages);
        $this->_template->assign('totalRows', $totalRows);
        $this->_template->assign('rows', $rows);
        $this->_template->assign('ownerOptions', $ownerOptions);
        $this->_template->assign('recruiterOptions', $recruiterOptions);
        $this->_template->assign('noticeMessage', $noticeMessage);
        $this->_template->assign('errorMessage', $errorMessage);

        $this->_template->display('./modules/joborders/RecruiterAllocation.tpl');
    }

    private function onRecruiterAllocation()
    {
        $assignments = array();
        if (isset($_POST['recruiterAssignment']) && is_array($_POST['recruiterAssignment']))
        {
            $assignments = $_POST['recruiterAssignment'];
        }

        $currentAssignments = array();
        if (isset($_POST['currentRecruiterAssignment']) && is_array($_POST['currentRecruiterAssignment']))
        {
            $currentAssignments = $_POST['currentRecruiterAssignment'];
        }

        $allowedRecruiters = array(0 => true);
        foreach ($this->getRecruiterAllocationUsers() as $user)
        {
            $allowedRecruiters[(int) $user['userID']] = true;
        }

        $jobOrders = new JobOrders($this->_siteID);
        $updatedCount = 0;
        $errorCount = 0;

        foreach ($assignments as $jobOrderID => $newRecruiterUserID)
        {
            $jobOrderID = (int) $jobOrderID;
            if ($jobOrderID <= 0)
            {
                continue;
            }

            $newRecruiterUserID = (int) $newRecruiterUserID;
            if ($newRecruiterUserID < 0)
            {
                $newRecruiterUserID = 0;
            }

            $currentRecruiterUserID = -1;
            if (isset($currentAssignments[$jobOrderID]))
            {
                $currentRecruiterUserID = (int) $currentAssignments[$jobOrderID];
            }
            if ($currentRecruiterUserID === $newRecruiterUserID)
            {
                continue;
            }

            if (!isset($allowedRecruiters[$newRecruiterUserID]))
            {
                $errorCount++;
                continue;
            }

            if ($jobOrders->updateRecruiterAssignment($jobOrderID, $newRecruiterUserID))
            {
                $updatedCount++;
            }
            else
            {
                $errorCount++;
            }
        }

        if ($updatedCount <= 0 && $errorCount <= 0)
        {
            $noticeMessage = 'No assignment changes detected.';
            $errorMessage = '';
        }
        else
        {
            $noticeMessage = sprintf('Updated %d job assignment(s).', $updatedCount);
            if ($errorCount > 0)
            {
                $errorMessage = sprintf('%d update(s) failed. Check permissions and selected users.', $errorCount);
            }
            else
            {
                $errorMessage = '';
            }
        }

        $this->recruiterAllocation($noticeMessage, $errorMessage);
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
            /* Get info strings for popup titles */
            $resultSet[$rowIndex]['jobOrderInfo'] = InfoString::make(
                DATA_ITEM_JOBORDER,
                $resultSet[$rowIndex]['jobOrderID'],
                $this->_siteID
            );
            $resultSet[$rowIndex]['companyInfo'] = InfoString::make(
                DATA_ITEM_COMPANY,
                $resultSet[$rowIndex]['companyID'],
                $this->_siteID
            );

            /* Truncate job order title. */
            if (strlen($resultSet[$rowIndex]['title']) > self::TRUNCATE_JOBORDER_TITLE)
            {
                $resultSet[$rowIndex]['title'] = substr(
                    $resultSet[$rowIndex]['title'],
                    0,
                    self::TRUNCATE_JOBORDER_TITLE
                ) . "...";
            }

            /* Truncate company name. */
            if (strlen($resultSet[$rowIndex]['companyName']) > self::TRUNCATE_CLIENT_NAME)
            {
                $resultSet[$rowIndex]['companyName'] = substr(
                    $resultSet[$rowIndex]['companyName'],
                    0,
                    self::TRUNCATE_CLIENT_NAME
                ) . "...";
            }

            /* Convert '00-00-00' dates to empty strings. */
            $resultSet[$rowIndex]['startDate'] = DateUtility::fixZeroDate(
                $resultSet[$rowIndex]['startDate']
            );

            /* Hot jobs [can] have different title styles than normal
             * jobs.
             */
            if ($resultSet[$rowIndex]['isHot'] == 1)
            {
                $resultSet[$rowIndex]['linkClass'] = 'jobLinkHot';
            }
            else
            {
                $resultSet[$rowIndex]['linkClass'] = 'jobLinkCold';
            }

            $resultSet[$rowIndex]['recruiterAbbrName'] = StringUtility::makeInitialName(
                $resultSet[$rowIndex]['recruiterFirstName'],
                $resultSet[$rowIndex]['recruiterLastName'],
                false,
                LAST_NAME_MAXLEN
            );

            $resultSet[$rowIndex]['ownerAbbrName'] = StringUtility::makeInitialName(
                $resultSet[$rowIndex]['ownerFirstName'],
                $resultSet[$rowIndex]['ownerLastName'],
                false,
                LAST_NAME_MAXLEN
            );

            if ($resultSet[$rowIndex]['attachmentPresent'] == 1)
            {
                $resultSet[$rowIndex]['iconTag'] = '<img src="images/paperclip.gif" alt="" width="16" height="16" />';
            }
            else
            {
                $resultSet[$rowIndex]['iconTag'] = '&nbsp;';
            }
        }

        if (!eval(Hooks::get('JO_FORMAT_LIST_BY_VIEW_RESULTS'))) return;

        return $resultSet;
    }
}

?>
