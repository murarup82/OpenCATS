<?php
/*
 * CATS
 * Home Module
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
 * $Id: HomeUI.php 3810 2007-12-05 19:13:25Z brian $
 */

include_once(LEGACY_ROOT . '/lib/NewVersionCheck.php');
include_once(LEGACY_ROOT . '/lib/CommonErrors.php');
include_once(LEGACY_ROOT . '/lib/Dashboard.php');
include_once(LEGACY_ROOT . '/lib/JobOrders.php');
include_once(LEGACY_ROOT . '/lib/JobOrderStatuses.php');
include_once(LEGACY_ROOT . '/lib/CandidateMessages.php');
include_once(LEGACY_ROOT . '/lib/JobOrderMessages.php');

class HomeUI extends UserInterface
{
    public function __construct()
    {
        parent::__construct();

        $this->_authenticationRequired = true;
        $this->_moduleDirectory = 'home';
        $this->_moduleName = 'home';
        $this->_moduleTabText = 'Overview';
        $this->_subTabs = array(
            'Dashboard' => CATSUtility::getIndexName() . '?m=home&amp;a=home',
            'My Inbox'  => CATSUtility::getIndexName() . '?m=home&amp;a=inbox'
        );
    }


    public function handleRequest()
    {
        $action = $this->getAction();

        if (!eval(Hooks::get('HOME_HANDLE_REQUEST'))) return;

        switch ($action)
        {
            case 'quickSearch':
                include_once(LEGACY_ROOT . '/lib/Search.php');
                include_once(LEGACY_ROOT . '/lib/StringUtility.php');

                $this->quickSearch();
                break;

            case 'inbox':
                if (!$this->canAccessAnyInbox())
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->inbox();
                break;

            case 'postInboxMessage':
                if (!$this->canPostAnyInboxMessage())
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->onPostInboxMessage();
                break;

            case 'deleteInboxThread':
                if (!$this->canAccessAnyInbox())
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->onDeleteInboxThread();
                break;

            case 'deleteSavedSearch':
                include_once(LEGACY_ROOT . '/lib/Search.php');

                $this->deleteSavedSearch();
                break;

            case 'addSavedSearch':
                include_once(LEGACY_ROOT . '/lib/Search.php');

                $this->addSavedSearch();
                break;

            /* FIXME: undefined function getAttachment()
            case 'getAttachment':
                include_once(LEGACY_ROOT . '/lib/Attachments.php');

                $this->getAttachment();
                break;
            */     

            case 'home':
            default:
                $this->home();
                break;
        }
    }


    private function canAccessAnyInbox()
    {
        return (
            $this->getUserAccessLevel('candidates.show') >= ACCESS_LEVEL_READ ||
            $this->getUserAccessLevel('joborders.show') >= ACCESS_LEVEL_READ
        );
    }

    private function canPostAnyInboxMessage()
    {
        return (
            $this->getUserAccessLevel('candidates.edit') >= ACCESS_LEVEL_EDIT ||
            $this->getUserAccessLevel('joborders.edit') >= ACCESS_LEVEL_EDIT
        );
    }

    private function home()
    {        
        if (!eval(Hooks::get('HOME'))) return;
        
        NewVersionCheck::getNews();
        
        $dashboard = new Dashboard($this->_siteID);
        $hiredRS = $dashboard->getHires();
        
        $calendar = new Calendar($this->_siteID);
        $upcomingEventsHTML = $calendar->getUpcomingEventsHTML(7, UPCOMING_FOR_DASHBOARD);
        
        $calendar = new Calendar($this->_siteID);
        $upcomingEventsFupHTML = $calendar->getUpcomingEventsHTML(7, UPCOMING_FOR_DASHBOARD_FUP);        

        /* Important cand datagrid */

        $dataGridProperties = array(
            'rangeStart'    => 0,
            'maxResults'    => 15,
            'filterVisible' => false
        );

        $dataGrid = DataGrid::get("home:ImportantPipelineDashboard", $dataGridProperties);

        $this->_template->assign('dataGrid', $dataGrid);

        $dataGridProperties = array(
            'rangeStart'    => 0,
            'maxResults'    => 15,
            'filterVisible' => false
        );

        /* Only show a month of activities. */
        $dataGridProperties['startDate'] = '';
        $dataGridProperties['endDate'] = '';
        $dataGridProperties['period'] = 'DATE_SUB(CURDATE(), INTERVAL 1 MONTH)';

        $dataGrid2 = DataGrid::get("home:CallsDataGrid", $dataGridProperties);

        $this->_template->assign('dataGrid2', $dataGrid2);
        
        /* Job order list for funnel filter. */
        $jobOrders = new JobOrders($this->_siteID);
        $jobOrderList = $jobOrders->getAll(JOBORDERS_STATUS_ALL);
        $jobOrderOptions = array();
        foreach ($jobOrderList as $row)
        {
            $jobOrderOptions[] = array(
                'id' => $row['jobOrderID'],
                'title' => $row['title']
            );
        }
        $this->_template->assign('jobOrderOptions', $jobOrderOptions);
        
        $this->_template->assign('active', $this);
        $this->_template->assign('hiredRS', $hiredRS);
        $this->_template->assign('upcomingEventsHTML', $upcomingEventsHTML);
        $this->_template->assign('upcomingEventsFupHTML', $upcomingEventsFupHTML);
        $this->_template->assign('wildCardQuickSearch', '');
        $this->_template->assign('subActive', 'Dashboard');
        $this->_template->display('./modules/home/Home.tpl');
    }

    private function inbox()
    {
        $candidateMessages = new CandidateMessages($this->_siteID);
        $jobOrderMessages = new JobOrderMessages($this->_siteID);
        $candidateSchemaAvailable = $candidateMessages->isSchemaAvailable();
        $jobOrderSchemaAvailable = $jobOrderMessages->isSchemaAvailable();
        $schemaAvailable = ($candidateSchemaAvailable || $jobOrderSchemaAvailable);

        $flashMessage = '';
        $flashIsError = false;
        if (isset($_GET['msg']))
        {
            $msgStatus = $this->getTrimmedInput('msg', $_GET);
            switch ($msgStatus)
            {
                case 'sent':
                    $flashMessage = 'Message sent.';
                    break;

                case 'empty':
                    $flashMessage = 'Message cannot be empty.';
                    $flashIsError = true;
                    break;

                case 'tooLong':
                    $flashMessage = 'Message is too long.';
                    $flashIsError = true;
                    break;

                case 'token':
                case 'invalid':
                    $flashMessage = 'Invalid message request.';
                    $flashIsError = true;
                    break;

                case 'forbidden':
                    $flashMessage = 'You do not have access to this thread.';
                    $flashIsError = true;
                    break;

                case 'deleted':
                    $flashMessage = 'Thread removed from your inbox.';
                    break;

                case 'deletefailed':
                    $flashMessage = 'Unable to delete thread.';
                    $flashIsError = true;
                    break;

                case 'schema':
                    $flashMessage = 'Inbox tables are missing. Apply schema migrations first.';
                    $flashIsError = true;
                    break;

                default:
                    $flashMessage = 'Unable to send message.';
                    $flashIsError = true;
                    break;
            }
        }

        $selectedThreadType = '';
        $selectedThreadID = 0;
        $selectedThreadKey = $this->getTrimmedInput('threadKey', $_GET);
        if ($selectedThreadKey !== '' && strpos($selectedThreadKey, ':') !== false)
        {
            $parts = explode(':', $selectedThreadKey, 2);
            $selectedThreadType = strtolower(trim($parts[0]));
            $selectedThreadID = (int) trim($parts[1]);
        }
        else if ($this->isOptionalIDValid('threadID', $_GET))
        {
            /* Backward compatibility for old links (candidate-only). */
            $selectedThreadType = 'candidate';
            $selectedThreadID = (int) $_GET['threadID'];
            $selectedThreadKey = 'candidate:' . $selectedThreadID;
        }

        $threads = array();
        $selectedThread = array();
        $messages = array();
        $mentionUsers = array();
        $mentionHintNames = array();
        $mentionAutocompleteValues = array();
        if ($schemaAvailable)
        {
            if ($candidateSchemaAvailable)
            {
                $candidateThreads = $candidateMessages->getInboxThreads($this->_userID, 250);
                foreach ($candidateThreads as $thread)
                {
                    $thread['threadType'] = 'candidate';
                    $thread['threadKey'] = 'candidate:' . (int) $thread['threadID'];
                    $thread['entityType'] = 'Candidate';
                    $thread['entityName'] = $thread['candidateName'];
                    $thread['entitySubName'] = '';
                    $thread['openURL'] = CATSUtility::getIndexName() . '?m=candidates&a=show&candidateID=' . (int) $thread['candidateID'] . '&showMessages=1';
                    $thread['openLabel'] = 'Open Candidate';
                    $threads[] = $thread;
                }
            }

            if ($jobOrderSchemaAvailable)
            {
                $jobOrderThreads = $jobOrderMessages->getInboxThreads($this->_userID, 250);
                foreach ($jobOrderThreads as $thread)
                {
                    $entityName = trim((string) $thread['jobOrderTitle']);
                    if ($entityName === '')
                    {
                        $entityName = 'Job Order #' . (int) $thread['jobOrderID'];
                    }

                    $companyName = trim((string) $thread['companyName']);
                    $thread['threadType'] = 'joborder';
                    $thread['threadKey'] = 'joborder:' . (int) $thread['threadID'];
                    $thread['entityType'] = 'Job Order';
                    $thread['entityName'] = $entityName;
                    $thread['entitySubName'] = $companyName;
                    $thread['openURL'] = CATSUtility::getIndexName() . '?m=joborders&a=show&jobOrderID=' . (int) $thread['jobOrderID'] . '&showMessages=1';
                    $thread['openLabel'] = 'Open Job Order';
                    $threads[] = $thread;
                }
            }

            if (!empty($threads))
            {
                usort($threads, function ($a, $b) {
                    $aTS = strtotime((string) $a['lastMessageAtRaw']);
                    $bTS = strtotime((string) $b['lastMessageAtRaw']);
                    if ($aTS === $bTS)
                    {
                        return 0;
                    }
                    return ($aTS > $bTS) ? -1 : 1;
                });
            }

            $threadByKey = array();
            foreach ($threads as $thread)
            {
                $threadByKey[$thread['threadKey']] = $thread;
            }

            if (($selectedThreadID <= 0 || $selectedThreadType === '') && !empty($threads))
            {
                $selectedThreadType = $threads[0]['threadType'];
                $selectedThreadID = (int) $threads[0]['threadID'];
                $selectedThreadKey = $threads[0]['threadKey'];
            }

            if ($selectedThreadID > 0 && $selectedThreadType !== '')
            {
                $selectedThreadKey = $selectedThreadType . ':' . $selectedThreadID;
                if (!isset($threadByKey[$selectedThreadKey]))
                {
                    $selectedThreadID = 0;
                    $selectedThreadType = '';
                    if ($flashMessage === '')
                    {
                        $flashMessage = 'You do not have access to this thread.';
                        $flashIsError = true;
                    }
                }
                else if ($selectedThreadType === 'candidate')
                {
                    if (!$candidateSchemaAvailable || !$candidateMessages->isUserParticipant($selectedThreadID, $this->_userID))
                    {
                        $selectedThreadID = 0;
                        $selectedThreadType = '';
                        if ($flashMessage === '')
                        {
                            $flashMessage = 'You do not have access to this thread.';
                            $flashIsError = true;
                        }
                    }
                    else
                    {
                        $selectedThread = $candidateMessages->getThread($selectedThreadID);
                        if (!empty($selectedThread))
                        {
                            $candidateMessages->markThreadRead($selectedThreadID, $this->_userID);
                            $messages = $candidateMessages->getMessagesByThread($selectedThreadID, 250);
                            $selectedThread['threadType'] = 'candidate';
                            $selectedThread['entityType'] = 'Candidate';
                            $selectedThread['entityName'] = trim($selectedThread['candidateFirstName'] . ' ' . $selectedThread['candidateLastName']);
                            if ($selectedThread['entityName'] === '')
                            {
                                $selectedThread['entityName'] = 'Candidate #' . (int) $selectedThread['candidateID'];
                            }
                            $selectedThread['entitySubName'] = '';
                            $selectedThread['openURL'] = CATSUtility::getIndexName() . '?m=candidates&a=show&candidateID=' . (int) $selectedThread['candidateID'] . '&showMessages=1';
                            $selectedThread['openLabel'] = 'Open Candidate';
                        }
                    }
                }
                else if ($selectedThreadType === 'joborder')
                {
                    if (!$jobOrderSchemaAvailable || !$jobOrderMessages->isUserParticipant($selectedThreadID, $this->_userID))
                    {
                        $selectedThreadID = 0;
                        $selectedThreadType = '';
                        if ($flashMessage === '')
                        {
                            $flashMessage = 'You do not have access to this thread.';
                            $flashIsError = true;
                        }
                    }
                    else
                    {
                        $selectedThread = $jobOrderMessages->getThread($selectedThreadID);
                        if (!empty($selectedThread))
                        {
                            $jobOrderMessages->markThreadRead($selectedThreadID, $this->_userID);
                            $messages = $jobOrderMessages->getMessagesByThread($selectedThreadID, 250);
                            $selectedThread['threadType'] = 'joborder';
                            $selectedThread['entityType'] = 'Job Order';
                            $selectedThread['entityName'] = trim((string) $selectedThread['jobOrderTitle']);
                            if ($selectedThread['entityName'] === '')
                            {
                                $selectedThread['entityName'] = 'Job Order #' . (int) $selectedThread['jobOrderID'];
                            }
                            $selectedThread['entitySubName'] = trim((string) $selectedThread['companyName']);
                            $selectedThread['openURL'] = CATSUtility::getIndexName() . '?m=joborders&a=show&jobOrderID=' . (int) $selectedThread['jobOrderID'] . '&showMessages=1';
                            $selectedThread['openLabel'] = 'Open Job Order';
                        }
                    }
                }
            }

            if ($selectedThreadID <= 0 || $selectedThreadType === '')
            {
                $selectedThreadKey = '';
            }
            else if (empty($selectedThread))
            {
                $selectedThreadID = 0;
                $selectedThreadType = '';
                $selectedThreadKey = '';
                if ($flashMessage === '')
                {
                    $flashMessage = 'Unable to open the selected thread.';
                    $flashIsError = true;
                }
            }

            if ($candidateSchemaAvailable)
            {
                $mentionUsers = $candidateMessages->getMentionableUsers();
            }
            else if ($jobOrderSchemaAvailable)
            {
                $mentionUsers = $jobOrderMessages->getMentionableUsers();
            }

            foreach ($mentionUsers as $mentionUser)
            {
                $fullName = trim($mentionUser['fullName']);
                $userName = trim($mentionUser['userName']);
                $mentionLabel = ($fullName !== '') ? $fullName : $userName;
                if ($mentionLabel === '')
                {
                    continue;
                }
                $mentionAutocompleteValues[] = $mentionLabel;

                if (count($mentionHintNames) >= 5)
                {
                    break;
                }

                $mentionHintNames[] = $mentionLabel;
            }
        }

        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', 'My Inbox');
        $this->_template->assign('schemaAvailable', $schemaAvailable);
        $this->_template->assign('flashMessage', $flashMessage);
        $this->_template->assign('flashIsError', $flashIsError);
        $this->_template->assign('threads', $threads);
        $this->_template->assign('selectedThreadKey', $selectedThreadKey);
        $this->_template->assign('selectedThreadType', $selectedThreadType);
        $this->_template->assign('selectedThreadID', $selectedThreadID);
        $this->_template->assign('selectedThread', $selectedThread);
        $this->_template->assign('messages', $messages);
        $this->_template->assign('mentionHintNames', $mentionHintNames);
        $this->_template->assign('mentionAutocompleteValues', array_values(array_unique($mentionAutocompleteValues)));
        $this->_template->assign(
            'postInboxMessageToken',
            $this->getCSRFToken('home.postInboxMessage')
        );
        $this->_template->assign(
            'deleteInboxThreadToken',
            $this->getCSRFToken('home.deleteInboxThread')
        );

        $this->_template->display('./modules/home/MyInbox.tpl');
    }

    private function onPostInboxMessage()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST')
        {
            CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid request method.');
        }

        if (!$this->isRequiredIDValid('threadID', $_POST))
        {
            CATSUtility::transferRelativeURI('m=home&a=inbox&msg=invalid');
        }

        $threadID = (int) $_POST['threadID'];
        $threadType = strtolower($this->getTrimmedInput('threadType', $_POST));
        if ($threadType !== 'joborder')
        {
            $threadType = 'candidate';
        }
        $body = $this->getTrimmedInput('messageBody', $_POST);
        $securityToken = $this->getTrimmedInput('securityToken', $_POST);
        $threadKey = $threadType . ':' . $threadID;

        if (!$this->isCSRFTokenValid('home.postInboxMessage', $securityToken))
        {
            CATSUtility::transferRelativeURI('m=home&a=inbox&threadKey=' . rawurlencode($threadKey) . '&msg=token');
        }

        if ($threadType === 'joborder')
        {
            $jobOrderMessages = new JobOrderMessages($this->_siteID);
            if (!$jobOrderMessages->isSchemaAvailable())
            {
                CATSUtility::transferRelativeURI('m=home&a=inbox&msg=schema');
            }

            if (!$jobOrderMessages->isUserParticipant($threadID, $this->_userID))
            {
                CATSUtility::transferRelativeURI('m=home&a=inbox&threadKey=' . rawurlencode($threadKey) . '&msg=forbidden');
            }

            $result = $jobOrderMessages->postMessageToThread($threadID, $this->_userID, $body);
        }
        else
        {
            $candidateMessages = new CandidateMessages($this->_siteID);
            if (!$candidateMessages->isSchemaAvailable())
            {
                CATSUtility::transferRelativeURI('m=home&a=inbox&msg=schema');
            }

            if (!$candidateMessages->isUserParticipant($threadID, $this->_userID))
            {
                CATSUtility::transferRelativeURI('m=home&a=inbox&threadKey=' . rawurlencode($threadKey) . '&msg=forbidden');
            }

            $result = $candidateMessages->postMessageToThread($threadID, $this->_userID, $body);
        }

        if (empty($result['success']))
        {
            $error = isset($result['error']) ? $result['error'] : 'failed';
            CATSUtility::transferRelativeURI(
                'm=home&a=inbox&threadKey=' . rawurlencode($threadKey) . '&msg=' . rawurlencode($error)
            );
        }

        CATSUtility::transferRelativeURI('m=home&a=inbox&threadKey=' . rawurlencode($threadKey) . '&msg=sent');
    }

    private function onDeleteInboxThread()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST')
        {
            CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid request method.');
        }

        if (!$this->isRequiredIDValid('threadID', $_POST))
        {
            CATSUtility::transferRelativeURI('m=home&a=inbox&msg=invalid');
        }

        $threadID = (int) $_POST['threadID'];
        $threadType = strtolower($this->getTrimmedInput('threadType', $_POST));
        if ($threadType !== 'joborder')
        {
            $threadType = 'candidate';
        }
        $threadKey = $threadType . ':' . $threadID;
        $securityToken = $this->getTrimmedInput('securityToken', $_POST);
        if (!$this->isCSRFTokenValid('home.deleteInboxThread', $securityToken))
        {
            CATSUtility::transferRelativeURI('m=home&a=inbox&threadKey=' . rawurlencode($threadKey) . '&msg=token');
        }

        if ($threadType === 'joborder')
        {
            $jobOrderMessages = new JobOrderMessages($this->_siteID);
            if (!$jobOrderMessages->isSchemaAvailable())
            {
                CATSUtility::transferRelativeURI('m=home&a=inbox&msg=schema');
            }

            if (!$jobOrderMessages->isUserParticipant($threadID, $this->_userID))
            {
                CATSUtility::transferRelativeURI('m=home&a=inbox&threadKey=' . rawurlencode($threadKey) . '&msg=forbidden');
            }

            if (!$jobOrderMessages->archiveThreadForUser($threadID, $this->_userID))
            {
                CATSUtility::transferRelativeURI('m=home&a=inbox&threadKey=' . rawurlencode($threadKey) . '&msg=deletefailed');
            }
        }
        else
        {
            $candidateMessages = new CandidateMessages($this->_siteID);
            if (!$candidateMessages->isSchemaAvailable())
            {
                CATSUtility::transferRelativeURI('m=home&a=inbox&msg=schema');
            }

            if (!$candidateMessages->isUserParticipant($threadID, $this->_userID))
            {
                CATSUtility::transferRelativeURI('m=home&a=inbox&threadKey=' . rawurlencode($threadKey) . '&msg=forbidden');
            }

            if (!$candidateMessages->archiveThreadForUser($threadID, $this->_userID))
            {
                CATSUtility::transferRelativeURI('m=home&a=inbox&threadKey=' . rawurlencode($threadKey) . '&msg=deletefailed');
            }
        }

        CATSUtility::transferRelativeURI('m=home&a=inbox&msg=deleted');
    }

    private function deleteSavedSearch()
    {
        if (!isset($_GET['searchID']))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'No search ID specified.');
        }

        if (!isset($_GET['currentURL']))
        {
            CommonErrors::fatal(COMMONERROR_BADFIELDS, $this, 'No current URL specified.');
        }

        $searchID   = $_GET['searchID'];
        $currentURL = $_GET['currentURL'];

        if (!eval(Hooks::get('HOME_DELETE_SAVED_SEARCH_PRE'))) return;

        $savedSearches = new SavedSearches($this->_siteID);
        $savedSearches->remove($searchID);

        if (!eval(Hooks::get('HOME_DELETE_SAVED_SEARCH_POST'))) return;

        CATSUtility::transferRelativeURI($currentURL);
    }

    private function addSavedSearch()
    {
        if (!isset($_GET['searchID']))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'No search ID specified.');
        }

        if (!isset($_GET['currentURL']))
        {
            CommonErrors::fatal(COMMONERROR_BADFIELDS, $this, 'No current URL specified.');
        }

        $searchID   = $_GET['searchID'];
        $currentURL = $_GET['currentURL'];

        if (!eval(Hooks::get('HOME_ADD_SAVED_SEARCH_PRE'))) return;

        $savedSearches = new SavedSearches($this->_siteID);
        $savedSearches->save($searchID);

        if (!eval(Hooks::get('HOME_ADD_SAVED_SEARCH_POST'))) return;

        CATSUtility::transferRelativeURI($currentURL);
    }

    private function quickSearch()
    {
        /* Bail out to prevent an error if the GET string doesn't even contain
         * a field named 'quickSearchFor' at all.
         */
        if (!isset($_GET['quickSearchFor']))
        {
            CommonErrors::fatal(COMMONERROR_BADFIELDS, $this, 'No query string specified.');
        }

        $query = trim($_GET['quickSearchFor']);
        $wildCardQuickSearch = $query;

        $search = new QuickSearch($this->_siteID);
        $candidatesRS = $search->candidates($query);
        $companiesRS  = $search->companies($query);
        $contactsRS   = $search->contacts($query);
        $jobOrdersRS  = $search->jobOrders($query);
        //$listsRS      = $search->lists($query);

        $activeCandidatesRS = array();
        $inactiveCandidatesRS = array();

        if (!empty($candidatesRS))
        {
            foreach ($candidatesRS as $rowIndex => $row)
            {
                if (!empty($candidatesRS[$rowIndex]['ownerFirstName']))
                {
                    $candidatesRS[$rowIndex]['ownerAbbrName'] = StringUtility::makeInitialName(
                        $candidatesRS[$rowIndex]['ownerFirstName'],
                        $candidatesRS[$rowIndex]['ownerLastName'],
                        false,
                        LAST_NAME_MAXLEN
                    );
                }
                else
                {
                    $candidatesRS[$rowIndex]['ownerAbbrName'] = 'None';
                }

                

                if (empty($candidatesRS[$rowIndex]['phoneCell']))
                {
                    $candidatesRS[$rowIndex]['phoneCell'] = 'None';
                }

                $isActive = !isset($candidatesRS[$rowIndex]['isActive']) ||
                    $candidatesRS[$rowIndex]['isActive'];

                if ($isActive)
                {
                    $activeCandidatesRS[] = $candidatesRS[$rowIndex];
                }
                else
                {
                    $inactiveCandidatesRS[] = $candidatesRS[$rowIndex];
                }
            }
        }

        if (!empty($companiesRS))
        {
            foreach ($companiesRS as $rowIndex => $row)
            {
                if (!empty($companiesRS[$rowIndex]['ownerFirstName']))
                {
                    $companiesRS[$rowIndex]['ownerAbbrName'] = StringUtility::makeInitialName(
                        $companiesRS[$rowIndex]['ownerFirstName'],
                        $companiesRS[$rowIndex]['ownerLastName'],
                        false,
                        LAST_NAME_MAXLEN
                    );
                }
                else
                {
                    $companiesRS[$rowIndex]['ownerAbbrName'] = 'None';
                }

                if (empty($companiesRS[$rowIndex]['phone1']))
                {
                    $companiesRS[$rowIndex]['phone1'] = 'None';
                }
            }
        }

        if (!empty($contactsRS))
        {
            foreach ($contactsRS as $rowIndex => $row)
            {

                if ($contactsRS[$rowIndex]['isHotContact'] == 1)
                {
                    $contactsRS[$rowIndex]['linkClassContact'] = 'jobLinkHot';
                }
                else
                {
                    $contactsRS[$rowIndex]['linkClassContact'] = 'jobLinkCold';
                }

                if ($contactsRS[$rowIndex]['leftCompany'] == 1)
                {
                    $contactsRS[$rowIndex]['linkClassCompany'] = 'jobLinkDead';
                }
                else if ($contactsRS[$rowIndex]['isHotCompany'] == 1)
                {
                    $contactsRS[$rowIndex]['linkClassCompany'] = 'jobLinkHot';
                }
                else
                {
                    $contactsRS[$rowIndex]['linkClassCompany'] = 'jobLinkCold';
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

                if (empty($contactsRS[$rowIndex]['phoneCell']))
                {
                    $contactsRS[$rowIndex]['phoneCell'] = 'None';
                }
            }
        }

        if (!empty($jobOrdersRS))
        {
            foreach ($jobOrdersRS as $rowIndex => $row)
            {
                if ($jobOrdersRS[$rowIndex]['startDate'] == '00-00-00')
                {
                    $jobOrdersRS[$rowIndex]['startDate'] = '';
                }

                if ($jobOrdersRS[$rowIndex]['isHot'] == 1)
                {
                    $jobOrdersRS[$rowIndex]['linkClass'] = 'jobLinkHot';
                }
                else
                {
                    $jobOrdersRS[$rowIndex]['linkClass'] = 'jobLinkCold';
                }

                if (!empty($jobOrdersRS[$rowIndex]['recruiterAbbrName']))
                {
                    $jobOrdersRS[$rowIndex]['recruiterAbbrName'] = StringUtility::makeInitialName(
                        $jobOrdersRS[$rowIndex]['recruiterFirstName'],
                        $jobOrdersRS[$rowIndex]['recruiterLastName'],
                        false,
                        LAST_NAME_MAXLEN
                    );
                }
                else
                {
                    $jobOrdersRS[$rowIndex]['recruiterAbbrName'] = 'None';
                }

                if (!empty($jobOrdersRS[$rowIndex]['ownerFirstName']))
                {
                    $jobOrdersRS[$rowIndex]['ownerAbbrName'] = StringUtility::makeInitialName(
                        $jobOrdersRS[$rowIndex]['ownerFirstName'],
                        $jobOrdersRS[$rowIndex]['ownerLastName'],
                        false,
                        LAST_NAME_MAXLEN
                    );
                }
                else
                {
                    $jobOrdersRS[$rowIndex]['ownerAbbrName'] = 'None';
                }
            }
        }

        $this->_template->assign('active', $this);
        $this->_template->assign('jobOrdersRS', $jobOrdersRS);
        $this->_template->assign('candidatesRS', $candidatesRS);
        $this->_template->assign('activeCandidatesRS', $activeCandidatesRS);
        $this->_template->assign('inactiveCandidatesRS', $inactiveCandidatesRS);
        $this->_template->assign('companiesRS', $companiesRS);
        $this->_template->assign('contactsRS', $contactsRS);
        //$this->_template->assign('listsRS', $listsRS);
        $this->_template->assign('wildCardQuickSearch', $wildCardQuickSearch);

        if (!eval(Hooks::get('HOME_QUICK_SEARCH'))) return;

        $this->_template->display('./modules/home/SearchEverything.tpl');
    }
}

?>
