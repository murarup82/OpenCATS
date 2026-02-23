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
include_once(LEGACY_ROOT . '/lib/PersonalDashboard.php');
include_once(LEGACY_ROOT . '/lib/FeedbackSettings.php');
include_once(LEGACY_ROOT . '/lib/Users.php');
include_once(LEGACY_ROOT . '/lib/UserRoles.php');

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
            'My Inbox'  => CATSUtility::getIndexName() . '?m=home&amp;a=inbox',
            'My Notes & To-do' => CATSUtility::getIndexName() . '?m=home&amp;a=myNotes'
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

            case 'myNotes':
                $this->myNotes();
                break;

            case 'addPersonalItem':
                $this->onAddPersonalItem();
                break;

            case 'movePersonalNoteToTodo':
                $this->onMovePersonalNoteToTodo();
                break;

            case 'togglePersonalTodo':
                $this->onTogglePersonalTodo();
                break;

            case 'setPersonalTodoStatus':
                $this->onSetPersonalTodoStatus();
                break;

            case 'updatePersonalTodo':
                $this->onUpdatePersonalTodo();
                break;

            case 'deletePersonalItem':
                $this->onDeletePersonalItem();
                break;

            case 'appendPersonalNote':
                $this->onAppendPersonalNote();
                break;

            case 'updatePersonalNote':
                $this->onUpdatePersonalNote();
                break;

            case 'sendPersonalNote':
                $this->onSendPersonalNote();
                break;

            case 'setPersonalNoteArchived':
                $this->onSetPersonalNoteArchived();
                break;

            case 'submitFeedback':
                $this->onSubmitFeedback();
                break;

            case 'postInboxMessage':
                if (!$this->canPostAnyInboxMessage())
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->onPostInboxMessage();
                break;

            case 'createInboxNote':
                if (!$this->canAccessAnyInbox())
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->onCreateInboxNote();
                break;

            case 'createInboxTodo':
                if (!$this->canAccessAnyInbox())
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->onCreateInboxTodo();
                break;

            case 'archiveInboxThread':
                if (!$this->canAccessAnyInbox())
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->onArchiveInboxThread();
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

    private function canDeleteAnyInboxThread()
    {
        $userRoles = new UserRoles($this->_siteID);
        if ($userRoles->isSchemaAvailable())
        {
            $role = $userRoles->getForUser($this->_userID);
            if (!empty($role) && !empty($role['roleKey']))
            {
                return in_array($role['roleKey'], array('site_admin', 'hr_manager'), true);
            }
        }

        return ($_SESSION['CATS']->getAccessLevel(ACL::SECOBJ_ROOT) >= ACCESS_LEVEL_DELETE);
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

                case 'noteCreated':
                    $flashMessage = 'Note created in My Notes.';
                    break;

                case 'todoCreated':
                    $flashMessage = 'To-do created in My Notes.';
                    break;

                case 'archived':
                    $flashMessage = 'Thread archived.';
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
                    $flashMessage = 'Thread deleted for all users.';
                    break;

                case 'deletefailed':
                    $flashMessage = 'Unable to delete thread.';
                    $flashIsError = true;
                    break;

                case 'archivefailed':
                    $flashMessage = 'Unable to archive thread.';
                    $flashIsError = true;
                    break;

                case 'schema':
                    $flashMessage = 'Inbox tables are missing. Apply schema migrations first.';
                    $flashIsError = true;
                    break;

                case 'personalSchema':
                    $flashMessage = 'My Notes / To-do table is missing. Apply schema migrations first.';
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
        $this->_template->assign('canDeleteInboxThread', $this->canDeleteAnyInboxThread());
        $this->_template->assign('messages', $messages);
        $this->_template->assign('mentionHintNames', $mentionHintNames);
        $this->_template->assign('mentionAutocompleteValues', array_values(array_unique($mentionAutocompleteValues)));
        $this->_template->assign(
            'postInboxMessageToken',
            $this->getCSRFToken('home.postInboxMessage')
        );
        $this->_template->assign(
            'createInboxNoteToken',
            $this->getCSRFToken('home.createInboxNote')
        );
        $this->_template->assign(
            'createInboxTodoToken',
            $this->getCSRFToken('home.createInboxTodo')
        );
        $this->_template->assign(
            'archiveInboxThreadToken',
            $this->getCSRFToken('home.archiveInboxThread')
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
            if ($this->getUserAccessLevel('joborders.edit') < ACCESS_LEVEL_EDIT)
            {
                CATSUtility::transferRelativeURI('m=home&a=inbox&threadKey=' . rawurlencode($threadKey) . '&msg=forbidden');
            }

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

    private function parseInboxComposerRequest($tokenName, $defaultErrorMsg = 'invalid')
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST')
        {
            CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid request method.');
        }

        if (!$this->isRequiredIDValid('threadID', $_POST))
        {
            CATSUtility::transferRelativeURI('m=home&a=inbox&msg=' . rawurlencode($defaultErrorMsg));
        }

        $threadID = (int) $_POST['threadID'];
        $threadType = strtolower($this->getTrimmedInput('threadType', $_POST));
        if ($threadType !== 'joborder')
        {
            $threadType = 'candidate';
        }
        $threadKey = $threadType . ':' . $threadID;

        $securityToken = $this->getTrimmedInput('securityToken', $_POST);
        if (!$this->isCSRFTokenValid($tokenName, $securityToken))
        {
            CATSUtility::transferRelativeURI('m=home&a=inbox&threadKey=' . rawurlencode($threadKey) . '&msg=token');
        }

        $messageBody = $this->getTrimmedInput('messageBody', $_POST);
        if ($messageBody === '')
        {
            CATSUtility::transferRelativeURI('m=home&a=inbox&threadKey=' . rawurlencode($threadKey) . '&msg=empty');
        }

        return array(
            'threadID' => $threadID,
            'threadType' => $threadType,
            'threadKey' => $threadKey,
            'messageBody' => $messageBody
        );
    }

    private function getInboxThreadContextForUser($threadType, $threadID)
    {
        if ($threadType === 'joborder')
        {
            if ($this->getUserAccessLevel('joborders.show') < ACCESS_LEVEL_READ)
            {
                return array('success' => false, 'error' => 'forbidden');
            }

            $jobOrderMessages = new JobOrderMessages($this->_siteID);
            if (!$jobOrderMessages->isSchemaAvailable())
            {
                return array('success' => false, 'error' => 'schema');
            }

            if (!$jobOrderMessages->isUserParticipant($threadID, $this->_userID))
            {
                return array('success' => false, 'error' => 'forbidden');
            }

            $thread = $jobOrderMessages->getThread($threadID);
            if (empty($thread))
            {
                return array('success' => false, 'error' => 'forbidden');
            }

            $entityName = trim((string) $thread['jobOrderTitle']);
            if ($entityName === '')
            {
                $entityName = 'Job Order #' . (int) $thread['jobOrderID'];
            }

            return array(
                'success' => true,
                'threadID' => (int) $threadID,
                'threadType' => 'joborder',
                'entityType' => 'Job Order',
                'entityName' => $entityName,
                'entitySubName' => trim((string) $thread['companyName'])
            );
        }

        if ($this->getUserAccessLevel('candidates.show') < ACCESS_LEVEL_READ)
        {
            return array('success' => false, 'error' => 'forbidden');
        }

        $candidateMessages = new CandidateMessages($this->_siteID);
        if (!$candidateMessages->isSchemaAvailable())
        {
            return array('success' => false, 'error' => 'schema');
        }

        if (!$candidateMessages->isUserParticipant($threadID, $this->_userID))
        {
            return array('success' => false, 'error' => 'forbidden');
        }

        $thread = $candidateMessages->getThread($threadID);
        if (empty($thread))
        {
            return array('success' => false, 'error' => 'forbidden');
        }

        $entityName = trim(
            (string) $thread['candidateFirstName'] . ' ' . (string) $thread['candidateLastName']
        );
        if ($entityName === '')
        {
            $entityName = 'Candidate #' . (int) $thread['candidateID'];
        }

        return array(
            'success' => true,
            'threadID' => (int) $threadID,
            'threadType' => 'candidate',
            'entityType' => 'Candidate',
            'entityName' => $entityName,
            'entitySubName' => ''
        );
    }

    private function buildInboxPersonalItemBody($threadContext, $messageBody)
    {
        $senderDisplayName = trim((string) $_SESSION['CATS']->getFullName());
        if ($senderDisplayName === '')
        {
            $senderDisplayName = trim((string) $_SESSION['CATS']->getUsername());
        }
        if ($senderDisplayName === '')
        {
            $senderDisplayName = 'Unknown User';
        }

        $body = '[Created from My Inbox]' . "\n";
        $body .= 'Thread: ' . $threadContext['entityType'] . ' - ' . $threadContext['entityName'];
        if (trim((string) $threadContext['entitySubName']) !== '')
        {
            $body .= ' (' . trim((string) $threadContext['entitySubName']) . ')';
        }
        $body .= "\n";
        $body .= 'Thread ID: ' . (int) $threadContext['threadID'] . "\n";
        $body .= 'Captured by: ' . $senderDisplayName . "\n";
        $body .= 'Captured on: ' . date('Y-m-d H:i:s') . "\n\n";
        $body .= $messageBody;

        if (strlen($body) > PersonalDashboard::BODY_MAXLEN)
        {
            $body = substr($body, 0, PersonalDashboard::BODY_MAXLEN);
        }

        return $body;
    }

    private function onCreateInboxNote()
    {
        $payload = $this->parseInboxComposerRequest('home.createInboxNote');
        $threadContext = $this->getInboxThreadContextForUser(
            $payload['threadType'],
            $payload['threadID']
        );
        if (empty($threadContext['success']))
        {
            CATSUtility::transferRelativeURI(
                'm=home&a=inbox&threadKey=' . rawurlencode($payload['threadKey']) .
                '&msg=' . rawurlencode(isset($threadContext['error']) ? $threadContext['error'] : 'failed')
            );
        }

        $personalDashboard = new PersonalDashboard($this->_siteID);
        if (!$personalDashboard->isSchemaAvailable())
        {
            CATSUtility::transferRelativeURI(
                'm=home&a=inbox&threadKey=' . rawurlencode($payload['threadKey']) . '&msg=personalSchema'
            );
        }

        $title = 'Inbox Note: ' . $threadContext['entityName'];
        if (strlen($title) > PersonalDashboard::TITLE_MAXLEN)
        {
            $title = substr($title, 0, PersonalDashboard::TITLE_MAXLEN);
        }

        $body = $this->buildInboxPersonalItemBody($threadContext, $payload['messageBody']);
        $result = $personalDashboard->addItem(
            $this->_userID,
            'note',
            $title,
            $body,
            '',
            PersonalDashboard::PRIORITY_MEDIUM,
            ''
        );

        if (empty($result['success']))
        {
            $error = isset($result['error']) ? $result['error'] : 'failed';
            CATSUtility::transferRelativeURI(
                'm=home&a=inbox&threadKey=' . rawurlencode($payload['threadKey']) .
                '&msg=' . rawurlencode($error)
            );
        }

        CATSUtility::transferRelativeURI(
            'm=home&a=inbox&threadKey=' . rawurlencode($payload['threadKey']) . '&msg=noteCreated'
        );
    }

    private function onCreateInboxTodo()
    {
        $payload = $this->parseInboxComposerRequest('home.createInboxTodo');
        $threadContext = $this->getInboxThreadContextForUser(
            $payload['threadType'],
            $payload['threadID']
        );
        if (empty($threadContext['success']))
        {
            CATSUtility::transferRelativeURI(
                'm=home&a=inbox&threadKey=' . rawurlencode($payload['threadKey']) .
                '&msg=' . rawurlencode(isset($threadContext['error']) ? $threadContext['error'] : 'failed')
            );
        }

        $personalDashboard = new PersonalDashboard($this->_siteID);
        if (!$personalDashboard->isSchemaAvailable())
        {
            CATSUtility::transferRelativeURI(
                'm=home&a=inbox&threadKey=' . rawurlencode($payload['threadKey']) . '&msg=personalSchema'
            );
        }

        $firstLine = preg_split('/\r\n|\r|\n/', $payload['messageBody'], 2);
        $firstLine = trim((string) (is_array($firstLine) ? $firstLine[0] : ''));
        $title = $firstLine;
        if ($title === '')
        {
            $title = 'Inbox Follow-up: ' . $threadContext['entityName'];
        }
        if (strlen($title) > PersonalDashboard::TITLE_MAXLEN)
        {
            $title = substr($title, 0, PersonalDashboard::TITLE_MAXLEN);
        }

        $body = $this->buildInboxPersonalItemBody($threadContext, $payload['messageBody']);
        $result = $personalDashboard->addItem(
            $this->_userID,
            'todo',
            $title,
            $body,
            '',
            PersonalDashboard::PRIORITY_MEDIUM,
            '',
            PersonalDashboard::STATUS_OPEN
        );

        if (empty($result['success']))
        {
            $error = isset($result['error']) ? $result['error'] : 'failed';
            CATSUtility::transferRelativeURI(
                'm=home&a=inbox&threadKey=' . rawurlencode($payload['threadKey']) .
                '&msg=' . rawurlencode($error)
            );
        }

        CATSUtility::transferRelativeURI(
            'm=home&a=inbox&threadKey=' . rawurlencode($payload['threadKey']) . '&msg=todoCreated'
        );
    }

    private function myNotes()
    {
        $personalDashboard = new PersonalDashboard($this->_siteID);
        $schemaAvailable = $personalDashboard->isSchemaAvailable();

        $view = $this->getMyNotesView($_GET, 'notes');

        $flashMessage = '';
        $flashIsError = false;
        if (isset($_GET['msg']))
        {
            $msgStatus = $this->getTrimmedInput('msg', $_GET);
            switch ($msgStatus)
            {
                case 'noteAdded':
                    $flashMessage = 'Note added.';
                    break;

                case 'todoAdded':
                    $flashMessage = 'To-do added.';
                    break;

                case 'movedToTodo':
                    $flashMessage = 'Note moved to To-do List.';
                    break;

                case 'todoCompleted':
                    $flashMessage = 'To-do marked as completed.';
                    break;

                case 'todoReopened':
                    $flashMessage = 'To-do reopened.';
                    break;

                case 'todoStatusChanged':
                    $flashMessage = 'To-do status updated.';
                    break;

                case 'todoUpdated':
                    $flashMessage = 'To-do updated.';
                    break;

                case 'deleted':
                    $flashMessage = 'Item deleted.';
                    break;

                case 'noteAppended':
                case 'noteUpdated':
                    $flashMessage = 'Note updated.';
                    break;

                case 'noteSent':
                    $flashMessage = 'Note forwarded to selected users.';
                    break;

                case 'noteArchived':
                    $flashMessage = 'Note archived.';
                    break;

                case 'noteUnarchived':
                    $flashMessage = 'Note restored to active notes.';
                    break;

                case 'token':
                case 'invalid':
                    $flashMessage = 'Invalid request.';
                    $flashIsError = true;
                    break;

                case 'empty':
                    $flashMessage = 'Details are required.';
                    $flashIsError = true;
                    break;

                case 'titleTooLong':
                    $flashMessage = 'Title is too long.';
                    $flashIsError = true;
                    break;

                case 'tooLong':
                    $flashMessage = 'Item details are too long.';
                    $flashIsError = true;
                    break;

                case 'badDate':
                    $flashMessage = 'Invalid due date.';
                    $flashIsError = true;
                    break;

                case 'badPriority':
                    $flashMessage = 'Invalid priority.';
                    $flashIsError = true;
                    break;

                case 'badReminder':
                    $flashMessage = 'Invalid reminder date/time.';
                    $flashIsError = true;
                    break;

                case 'badStatus':
                    $flashMessage = 'Invalid to-do status.';
                    $flashIsError = true;
                    break;

                case 'noRecipients':
                    $flashMessage = 'Select at least one recipient.';
                    $flashIsError = true;
                    break;

                case 'schema':
                    $flashMessage = 'My Notes / To-do table is missing. Apply schema migrations first.';
                    $flashIsError = true;
                    break;

                case 'notfound':
                    $flashMessage = 'Item was not found.';
                    $flashIsError = true;
                    break;

                default:
                    $flashMessage = 'Unable to save changes.';
                    $flashIsError = true;
                    break;
            }
        }

        $summary = array(
            'notesCount' => 0,
            'archivedNotesCount' => 0,
            'todoOpenCount' => 0,
            'todoDoneCount' => 0,
            'reminderDueCount' => 0,
            'todoStatusOpenCount' => 0,
            'todoStatusInProgressCount' => 0,
            'todoStatusBlockedCount' => 0,
            'todoStatusDoneCount' => 0
        );
        $noteFilters = $this->getMyNotesNoteFilters($_GET);
        $noteMode = $noteFilters['noteMode'];
        $noteSearch = $noteFilters['noteSearch'];
        $archiveYear = $noteFilters['archiveYear'];
        $archiveMonth = $noteFilters['archiveMonth'];
        $noteArchiveBuckets = array();
        $noteArchiveYears = array();
        $noteItems = array();
        $todoItems = array();
        $todoPriorities = array();
        $todoStatuses = array();
        $todoItemsByStatus = array(
            'open' => array(),
            'in_progress' => array(),
            'blocked' => array(),
            'done' => array()
        );
        $shareTargetUsers = array();
        if ($schemaAvailable)
        {
            $summary = $personalDashboard->getSummary($this->_userID);
            $noteItems = $personalDashboard->getItems(
                $this->_userID,
                'note',
                500,
                array(
                    'noteMode' => $noteMode,
                    'archiveYear' => $archiveYear,
                    'archiveMonth' => $archiveMonth,
                    'noteSearch' => $noteSearch
                )
            );
            $noteArchiveBuckets = $personalDashboard->getNoteArchiveBuckets($this->_userID, $noteSearch);
            $todoItems = $personalDashboard->getItems($this->_userID, 'todo', 250);
            $todoPriorities = $personalDashboard->getAllowedPriorities();
            $todoStatuses = $personalDashboard->getAllowedTodoStatuses();

            $users = new Users($this->_siteID);
            $usersRS = $users->getSelectList();
            foreach ($usersRS as $userData)
            {
                $userID = (int) $userData['userID'];
                if ($userID <= 0 || $userID === (int) $this->_userID)
                {
                    continue;
                }

                $fullName = trim($userData['firstName'] . ' ' . $userData['lastName']);
                if ($fullName === '')
                {
                    $fullName = trim((string) $userData['username']);
                }
                if ($fullName === '')
                {
                    continue;
                }

                $shareTargetUsers[] = array(
                    'userID' => $userID,
                    'fullName' => $fullName
                );
            }

            $todayISO = date('Y-m-d');
            $nowISO = date('Y-m-d H:i:s');
            foreach ($noteItems as $index => $noteItem)
            {
                $noteItems[$index]['title'] = trim((string) $noteItem['title']);
                $noteItems[$index]['bodyHTML'] = nl2br(htmlspecialchars((string) $noteItem['body'], ENT_QUOTES));
                $noteItems[$index]['isArchived'] = ((int) $noteItem['isCompleted'] > 0);

                $bucketSource = trim((string) $noteItem['dateModifiedRaw']);
                if ($bucketSource === '')
                {
                    $bucketSource = trim((string) $noteItem['dateCreatedRaw']);
                }
                $bucketYear = 0;
                $bucketMonth = 0;
                if ($bucketSource !== '' && preg_match('/^(\d{4})-(\d{2})/', $bucketSource, $matches))
                {
                    $bucketYear = (int) $matches[1];
                    $bucketMonth = (int) $matches[2];
                }
                $noteItems[$index]['archiveBucketKey'] = '';
                $noteItems[$index]['archiveBucketLabel'] = '';
                if ($bucketYear > 0 && $bucketMonth >= 1 && $bucketMonth <= 12)
                {
                    $noteItems[$index]['archiveBucketKey'] = sprintf('%04d-%02d', $bucketYear, $bucketMonth);
                    $noteItems[$index]['archiveBucketLabel'] = date('F Y', mktime(0, 0, 0, $bucketMonth, 1, $bucketYear));
                }
            }

            foreach ($noteArchiveBuckets as $bucket)
            {
                $bucketYear = (int) $bucket['year'];
                $bucketMonth = (int) $bucket['month'];
                if ($bucketYear <= 0 || $bucketMonth <= 0 || $bucketMonth > 12)
                {
                    continue;
                }

                if (!in_array($bucketYear, $noteArchiveYears, true))
                {
                    $noteArchiveYears[] = $bucketYear;
                }
            }

            foreach ($todoItems as $index => $todoItem)
            {
                $todoItems[$index]['title'] = trim((string) $todoItem['title']);
                $todoItems[$index]['bodyHTML'] = nl2br(htmlspecialchars((string) $todoItem['body'], ENT_QUOTES));
                $todoItems[$index]['isOverdue'] = (
                    (int) $todoItem['isCompleted'] === 0 &&
                    trim((string) $todoItem['dueDateISO']) !== '' &&
                    trim((string) $todoItem['dueDateISO']) < $todayISO
                );
                $todoItems[$index]['isReminderDue'] = (
                    (int) $todoItem['isCompleted'] === 0 &&
                    trim((string) $todoItem['reminderAtRaw']) !== '' &&
                    trim((string) $todoItem['reminderAtRaw']) <= $nowISO
                );
                if (empty($todoItems[$index]['taskStatus']))
                {
                    $todoItems[$index]['taskStatus'] = 'open';
                }

                if (!isset($todoItemsByStatus[$todoItems[$index]['taskStatus']]))
                {
                    $todoItems[$index]['taskStatus'] = 'open';
                }
                $todoItemsByStatus[$todoItems[$index]['taskStatus']][] = $todoItems[$index];
            }
        }

        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', 'My Notes & To-do');
        $this->_template->assign('view', $view);
        $this->_template->assign('schemaAvailable', $schemaAvailable);
        $this->_template->assign('flashMessage', $flashMessage);
        $this->_template->assign('flashIsError', $flashIsError);
        $this->_template->assign('summary', $summary);
        $this->_template->assign('noteItems', $noteItems);
        $this->_template->assign('noteMode', $noteMode);
        $this->_template->assign('noteSearch', $noteSearch);
        $this->_template->assign('archiveYear', $archiveYear);
        $this->_template->assign('archiveMonth', $archiveMonth);
        $this->_template->assign('noteArchiveBuckets', $noteArchiveBuckets);
        $this->_template->assign('noteArchiveYears', $noteArchiveYears);
        $this->_template->assign('todoItems', $todoItems);
        $this->_template->assign('todoStatuses', $todoStatuses);
        $this->_template->assign('todoItemsByStatus', $todoItemsByStatus);
        $this->_template->assign('todoPriorities', $todoPriorities);
        $this->_template->assign('shareTargetUsers', $shareTargetUsers);
        $this->_template->assign(
            'addPersonalItemToken',
            $this->getCSRFToken('home.addPersonalItem')
        );
        $this->_template->assign(
            'movePersonalNoteToTodoToken',
            $this->getCSRFToken('home.movePersonalNoteToTodo')
        );
        $this->_template->assign(
            'togglePersonalTodoToken',
            $this->getCSRFToken('home.togglePersonalTodo')
        );
        $this->_template->assign(
            'setPersonalTodoStatusToken',
            $this->getCSRFToken('home.setPersonalTodoStatus')
        );
        $this->_template->assign(
            'updatePersonalTodoToken',
            $this->getCSRFToken('home.updatePersonalTodo')
        );
        $this->_template->assign(
            'deletePersonalItemToken',
            $this->getCSRFToken('home.deletePersonalItem')
        );
        $this->_template->assign(
            'appendPersonalNoteToken',
            $this->getCSRFToken('home.appendPersonalNote')
        );
        $this->_template->assign(
            'updatePersonalNoteToken',
            $this->getCSRFToken('home.updatePersonalNote')
        );
        $this->_template->assign(
            'sendPersonalNoteToken',
            $this->getCSRFToken('home.sendPersonalNote')
        );
        $this->_template->assign(
            'setPersonalNoteArchivedToken',
            $this->getCSRFToken('home.setPersonalNoteArchived')
        );

        $this->_template->display('./modules/home/MyNotes.tpl');
    }

    private function onAddPersonalItem()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST')
        {
            CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid request method.');
        }

        $itemType = strtolower($this->getTrimmedInput('itemType', $_POST));
        $defaultView = ($itemType === 'todo') ? 'todos' : 'notes';
        $view = $this->getMyNotesView($_POST, $defaultView);
        $noteFilters = $this->getMyNotesNoteFilters($_POST);
        $redirectFilters = ($view === 'notes') ? $noteFilters : array();

        $securityToken = $this->getTrimmedInput('securityToken', $_POST);
        if (!$this->isCSRFTokenValid('home.addPersonalItem', $securityToken))
        {
            $this->redirectToMyNotes($view, 'token', $redirectFilters);
        }

        $personalDashboard = new PersonalDashboard($this->_siteID);
        if (!$personalDashboard->isSchemaAvailable())
        {
            $this->redirectToMyNotes($view, 'schema', $redirectFilters);
        }

        $title = $this->getTrimmedInput('title', $_POST);
        $body = $this->getTrimmedInput('body', $_POST);
        $dueDate = $this->getTrimmedInput('dueDate', $_POST);
        $priority = $this->getTrimmedInput('priority', $_POST);
        $reminderAt = $this->getTrimmedInput('reminderAt', $_POST);
        $taskStatus = $this->getTrimmedInput('taskStatus', $_POST);
        if ($taskStatus === '')
        {
            $taskStatus = 'open';
        }

        $result = $personalDashboard->addItem(
            $this->_userID,
            $itemType,
            $title,
            $body,
            $dueDate,
            $priority,
            $reminderAt,
            $taskStatus
        );

        if (empty($result['success']))
        {
            $error = isset($result['error']) ? $result['error'] : 'failed';
            if ($error === 'invalidType')
            {
                $error = 'invalid';
            }
            $this->redirectToMyNotes($view, $error, $redirectFilters);
        }

        if ($itemType === 'todo')
        {
            $this->redirectToMyNotes('todos', 'todoAdded');
        }

        $this->redirectToMyNotes('notes', 'noteAdded', array('noteMode' => 'active'));
    }

    private function onMovePersonalNoteToTodo()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST')
        {
            CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid request method.');
        }

        $noteFilters = $this->getMyNotesNoteFilters($_POST);
        if (!$this->isRequiredIDValid('itemID', $_POST))
        {
            $this->redirectToMyNotes('notes', 'invalid', $noteFilters);
        }

        $securityToken = $this->getTrimmedInput('securityToken', $_POST);
        if (!$this->isCSRFTokenValid('home.movePersonalNoteToTodo', $securityToken))
        {
            $this->redirectToMyNotes('notes', 'token', $noteFilters);
        }

        $itemID = (int) $_POST['itemID'];
        $personalDashboard = new PersonalDashboard($this->_siteID);
        if (!$personalDashboard->isSchemaAvailable())
        {
            $this->redirectToMyNotes('notes', 'schema', $noteFilters);
        }

        $result = $personalDashboard->moveNoteToTodo($itemID, $this->_userID);
        if (empty($result['success']))
        {
            $error = isset($result['error']) ? $result['error'] : 'failed';
            if ($error === 'invalidType')
            {
                $error = 'invalid';
            }
            $this->redirectToMyNotes('notes', $error, $noteFilters);
        }

        $this->redirectToMyNotes('todos', 'movedToTodo');
    }

    private function onTogglePersonalTodo()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST')
        {
            CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid request method.');
        }

        if (!$this->isRequiredIDValid('itemID', $_POST))
        {
            $this->redirectToMyNotes('todos', 'invalid');
        }

        $securityToken = $this->getTrimmedInput('securityToken', $_POST);
        if (!$this->isCSRFTokenValid('home.togglePersonalTodo', $securityToken))
        {
            $this->redirectToMyNotes('todos', 'token');
        }

        $itemID = (int) $_POST['itemID'];
        $isCompleted = $this->getTrimmedInput('isCompleted', $_POST);
        $nextState = ((int) $isCompleted > 0) ? 1 : 0;

        $personalDashboard = new PersonalDashboard($this->_siteID);
        if (!$personalDashboard->isSchemaAvailable())
        {
            $this->redirectToMyNotes('todos', 'schema');
        }

        $result = $personalDashboard->setTodoCompleted($itemID, $this->_userID, $nextState);
        if (empty($result['success']))
        {
            $error = isset($result['error']) ? $result['error'] : 'failed';
            if ($error === 'invalidType')
            {
                $error = 'invalid';
            }
            $this->redirectToMyNotes('todos', $error);
        }

        $message = ($nextState === 1) ? 'todoCompleted' : 'todoReopened';
        $this->redirectToMyNotes('todos', $message);
    }

    private function onSetPersonalTodoStatus()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST')
        {
            CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid request method.');
        }

        if (!$this->isRequiredIDValid('itemID', $_POST))
        {
            $this->redirectToMyNotes('todos', 'invalid');
        }

        $securityToken = $this->getTrimmedInput('securityToken', $_POST);
        if (!$this->isCSRFTokenValid('home.setPersonalTodoStatus', $securityToken))
        {
            $this->redirectToMyNotes('todos', 'token');
        }

        $itemID = (int) $_POST['itemID'];
        $taskStatus = strtolower($this->getTrimmedInput('taskStatus', $_POST));
        if ($taskStatus === '')
        {
            $taskStatus = 'open';
        }

        $personalDashboard = new PersonalDashboard($this->_siteID);
        if (!$personalDashboard->isSchemaAvailable())
        {
            $this->redirectToMyNotes('todos', 'schema');
        }

        $result = $personalDashboard->setTodoStatus($itemID, $this->_userID, $taskStatus);
        if (empty($result['success']))
        {
            $error = isset($result['error']) ? $result['error'] : 'failed';
            if ($error === 'invalidType')
            {
                $error = 'invalid';
            }
            $this->redirectToMyNotes('todos', $error);
        }

        $this->redirectToMyNotes('todos', 'todoStatusChanged');
    }

    private function onUpdatePersonalTodo()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST')
        {
            CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid request method.');
        }

        if (!$this->isRequiredIDValid('itemID', $_POST))
        {
            $this->redirectToMyNotes('todos', 'invalid');
        }

        $securityToken = $this->getTrimmedInput('securityToken', $_POST);
        if (!$this->isCSRFTokenValid('home.updatePersonalTodo', $securityToken))
        {
            $this->redirectToMyNotes('todos', 'token');
        }

        $itemID = (int) $_POST['itemID'];
        $title = $this->getTrimmedInput('title', $_POST);
        $body = $this->getTrimmedInput('body', $_POST);
        $dueDate = $this->getTrimmedInput('dueDate', $_POST);
        $priority = $this->getTrimmedInput('priority', $_POST);
        $reminderAt = $this->getTrimmedInput('reminderAt', $_POST);
        $taskStatus = strtolower($this->getTrimmedInput('taskStatus', $_POST));
        if ($taskStatus === '')
        {
            $taskStatus = 'open';
        }

        $personalDashboard = new PersonalDashboard($this->_siteID);
        if (!$personalDashboard->isSchemaAvailable())
        {
            $this->redirectToMyNotes('todos', 'schema');
        }

        $result = $personalDashboard->updateTodoItem(
            $itemID,
            $this->_userID,
            $title,
            $body,
            $dueDate,
            $priority,
            $reminderAt,
            $taskStatus
        );

        if (empty($result['success']))
        {
            $error = isset($result['error']) ? $result['error'] : 'failed';
            if ($error === 'invalidType')
            {
                $error = 'invalid';
            }
            $this->redirectToMyNotes('todos', $error);
        }

        $this->redirectToMyNotes('todos', 'todoUpdated');
    }

    private function onDeletePersonalItem()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST')
        {
            CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid request method.');
        }

        if (!$this->isRequiredIDValid('itemID', $_POST))
        {
            $this->redirectToMyNotes('notes', 'invalid');
        }

        $view = $this->getMyNotesView($_POST, 'notes');
        $redirectFilters = ($view === 'notes') ? $this->getMyNotesNoteFilters($_POST) : array();
        $securityToken = $this->getTrimmedInput('securityToken', $_POST);
        if (!$this->isCSRFTokenValid('home.deletePersonalItem', $securityToken))
        {
            $this->redirectToMyNotes($view, 'token', $redirectFilters);
        }

        $itemID = (int) $_POST['itemID'];
        $personalDashboard = new PersonalDashboard($this->_siteID);
        if (!$personalDashboard->isSchemaAvailable())
        {
            $this->redirectToMyNotes($view, 'schema', $redirectFilters);
        }

        $result = $personalDashboard->deleteItem($itemID, $this->_userID);
        if (empty($result['success']))
        {
            $error = isset($result['error']) ? $result['error'] : 'failed';
            $this->redirectToMyNotes($view, $error, $redirectFilters);
        }

        $this->redirectToMyNotes($view, 'deleted', $redirectFilters);
    }

    private function onAppendPersonalNote()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST')
        {
            CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid request method.');
        }

        $noteFilters = $this->getMyNotesNoteFilters($_POST);
        if (!$this->isRequiredIDValid('itemID', $_POST))
        {
            $this->redirectToMyNotes('notes', 'invalid', $noteFilters);
        }

        $securityToken = $this->getTrimmedInput('securityToken', $_POST);
        if (!$this->isCSRFTokenValid('home.appendPersonalNote', $securityToken))
        {
            $this->redirectToMyNotes('notes', 'token', $noteFilters);
        }

        $itemID = (int) $_POST['itemID'];
        $appendBody = $this->getTrimmedInput('appendBody', $_POST);

        $personalDashboard = new PersonalDashboard($this->_siteID);
        if (!$personalDashboard->isSchemaAvailable())
        {
            $this->redirectToMyNotes('notes', 'schema', $noteFilters);
        }

        $result = $personalDashboard->appendToNote($itemID, $this->_userID, $appendBody);
        if (empty($result['success']))
        {
            $error = isset($result['error']) ? $result['error'] : 'failed';
            if ($error === 'invalidType')
            {
                $error = 'invalid';
            }
            $this->redirectToMyNotes('notes', $error, $noteFilters);
        }

        $this->redirectToMyNotes('notes', 'noteAppended', $noteFilters);
    }

    private function onUpdatePersonalNote()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST')
        {
            CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid request method.');
        }

        $noteFilters = $this->getMyNotesNoteFilters($_POST);
        if (!$this->isRequiredIDValid('itemID', $_POST))
        {
            $this->redirectToMyNotes('notes', 'invalid', $noteFilters);
        }

        $securityToken = $this->getTrimmedInput('securityToken', $_POST);
        if (!$this->isCSRFTokenValid('home.updatePersonalNote', $securityToken))
        {
            $this->redirectToMyNotes('notes', 'token', $noteFilters);
        }

        $itemID = (int) $_POST['itemID'];
        $title = $this->getTrimmedInput('title', $_POST);
        $body = $this->getTrimmedInput('body', $_POST);

        $personalDashboard = new PersonalDashboard($this->_siteID);
        if (!$personalDashboard->isSchemaAvailable())
        {
            $this->redirectToMyNotes('notes', 'schema', $noteFilters);
        }

        $result = $personalDashboard->updateNote($itemID, $this->_userID, $title, $body);
        if (empty($result['success']))
        {
            $error = isset($result['error']) ? $result['error'] : 'failed';
            if ($error === 'invalidType')
            {
                $error = 'invalid';
            }
            $this->redirectToMyNotes('notes', $error, $noteFilters);
        }

        $this->redirectToMyNotes('notes', 'noteUpdated', $noteFilters);
    }

    private function onSendPersonalNote()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST')
        {
            CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid request method.');
        }

        $noteFilters = $this->getMyNotesNoteFilters($_POST);
        if (!$this->isRequiredIDValid('itemID', $_POST))
        {
            $this->redirectToMyNotes('notes', 'invalid', $noteFilters);
        }

        $securityToken = $this->getTrimmedInput('securityToken', $_POST);
        if (!$this->isCSRFTokenValid('home.sendPersonalNote', $securityToken))
        {
            $this->redirectToMyNotes('notes', 'token', $noteFilters);
        }

        $itemID = (int) $_POST['itemID'];
        $recipientUserIDs = array();
        if (isset($_POST['recipientUserIDs']) && is_array($_POST['recipientUserIDs']))
        {
            foreach ($_POST['recipientUserIDs'] as $recipientUserIDRaw)
            {
                $recipientUserID = (int) $recipientUserIDRaw;
                if ($recipientUserID > 0)
                {
                    $recipientUserIDs[$recipientUserID] = true;
                }
            }
            $recipientUserIDs = array_keys($recipientUserIDs);
        }

        if (empty($recipientUserIDs))
        {
            $this->redirectToMyNotes('notes', 'noRecipients', $noteFilters);
        }

        $users = new Users($this->_siteID);
        $usersRS = $users->getSelectList();
        $allowedUserIDs = array();
        foreach ($usersRS as $userData)
        {
            $allowedUserIDs[(int) $userData['userID']] = true;
        }

        $validRecipientUserIDs = array();
        foreach ($recipientUserIDs as $recipientUserID)
        {
            if ($recipientUserID === (int) $this->_userID)
            {
                continue;
            }
            if (!isset($allowedUserIDs[$recipientUserID]))
            {
                continue;
            }
            $validRecipientUserIDs[] = $recipientUserID;
        }

        if (empty($validRecipientUserIDs))
        {
            $this->redirectToMyNotes('notes', 'noRecipients', $noteFilters);
        }

        $senderDisplayName = trim((string) $_SESSION['CATS']->getFullName());
        if ($senderDisplayName === '')
        {
            $senderDisplayName = trim((string) $_SESSION['CATS']->getUsername());
        }

        $personalDashboard = new PersonalDashboard($this->_siteID);
        if (!$personalDashboard->isSchemaAvailable())
        {
            $this->redirectToMyNotes('notes', 'schema', $noteFilters);
        }

        $result = $personalDashboard->sendNoteToUsers(
            $itemID,
            $this->_userID,
            $validRecipientUserIDs,
            $senderDisplayName
        );

        if (empty($result['success']))
        {
            $error = isset($result['error']) ? $result['error'] : 'failed';
            if ($error === 'invalidType')
            {
                $error = 'invalid';
            }
            $this->redirectToMyNotes('notes', $error, $noteFilters);
        }

        $this->redirectToMyNotes('notes', 'noteSent', $noteFilters);
    }

    private function onSetPersonalNoteArchived()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST')
        {
            CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid request method.');
        }

        $noteFilters = $this->getMyNotesNoteFilters($_POST);
        if (!$this->isRequiredIDValid('itemID', $_POST))
        {
            $this->redirectToMyNotes('notes', 'invalid', $noteFilters);
        }

        $securityToken = $this->getTrimmedInput('securityToken', $_POST);
        if (!$this->isCSRFTokenValid('home.setPersonalNoteArchived', $securityToken))
        {
            $this->redirectToMyNotes('notes', 'token', $noteFilters);
        }

        $itemID = (int) $_POST['itemID'];
        $isArchived = ((int) $this->getTrimmedInput('isArchived', $_POST) > 0) ? 1 : 0;

        $personalDashboard = new PersonalDashboard($this->_siteID);
        if (!$personalDashboard->isSchemaAvailable())
        {
            $this->redirectToMyNotes('notes', 'schema', $noteFilters);
        }

        $result = $personalDashboard->setNoteArchived($itemID, $this->_userID, $isArchived);
        if (empty($result['success']))
        {
            $error = isset($result['error']) ? $result['error'] : 'failed';
            if ($error === 'invalidType')
            {
                $error = 'invalid';
            }
            $this->redirectToMyNotes('notes', $error, $noteFilters);
        }

        $this->redirectToMyNotes('notes', ($isArchived > 0) ? 'noteArchived' : 'noteUnarchived', $noteFilters);
    }

    private function onSubmitFeedback()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST')
        {
            CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid request method.');
        }

        $securityToken = $this->getTrimmedInput('securityToken', $_POST);
        $returnQuery = $this->getTrimmedInput('returnQuery', $_POST);
        if (!$this->isCSRFTokenValid('home.submitFeedback', $securityToken))
        {
            $this->redirectToFeedbackReturn($returnQuery, 'token');
        }

        $feedbackType = strtolower($this->getTrimmedInput('feedbackType', $_POST));
        if (!in_array($feedbackType, array('bug', 'feature', 'general'), true))
        {
            $feedbackType = 'general';
        }

        $subject = $this->getTrimmedInput('subject', $_POST);
        $message = $this->getTrimmedInput('message', $_POST);
        $pageURL = $this->getTrimmedInput('pageURL', $_POST);

        if ($message === '')
        {
            $this->redirectToFeedbackReturn($returnQuery, 'empty');
        }

        if (strlen($subject) > PersonalDashboard::TITLE_MAXLEN)
        {
            $subject = substr($subject, 0, PersonalDashboard::TITLE_MAXLEN);
        }

        $feedbackSettings = new FeedbackSettings($this->_siteID);
        $recipientUserID = (int) $feedbackSettings->getRecipientUserID();
        if ($recipientUserID <= 0)
        {
            $this->redirectToFeedbackReturn($returnQuery, 'notConfigured');
        }

        $users = new Users($this->_siteID);
        $recipientUser = $users->get($recipientUserID);
        if (empty($recipientUser))
        {
            $this->redirectToFeedbackReturn($returnQuery, 'notConfigured');
        }

        $personalDashboard = new PersonalDashboard($this->_siteID);
        if (!$personalDashboard->isSchemaAvailable())
        {
            $this->redirectToFeedbackReturn($returnQuery, 'schema');
        }

        $senderDisplayName = trim((string) $_SESSION['CATS']->getFullName());
        if ($senderDisplayName === '')
        {
            $senderDisplayName = trim((string) $_SESSION['CATS']->getUsername());
        }
        if ($senderDisplayName === '')
        {
            $senderDisplayName = 'Unknown User';
        }

        $feedbackTypeLabel = ucfirst($feedbackType);
        $noteTitle = '[Feedback][' . $feedbackTypeLabel . ']';
        if ($subject !== '')
        {
            $noteTitle .= ' ' . $subject;
        }
        else
        {
            $noteTitle .= ' Submitted by ' . $senderDisplayName;
        }
        if (strlen($noteTitle) > PersonalDashboard::TITLE_MAXLEN)
        {
            $noteTitle = substr($noteTitle, 0, PersonalDashboard::TITLE_MAXLEN);
        }

        $noteBody = 'Feedback type: ' . $feedbackTypeLabel . "\n";
        $noteBody .= 'Submitted by: ' . $senderDisplayName . ' (' . $_SESSION['CATS']->getUsername() . ')' . "\n";
        $noteBody .= 'Submitted on: ' . date('Y-m-d H:i:s') . "\n";
        if ($pageURL !== '')
        {
            $noteBody .= 'Page: ' . $pageURL . "\n";
        }
        $noteBody .= "\n" . $message;
        if (strlen($noteBody) > PersonalDashboard::BODY_MAXLEN)
        {
            $noteBody = substr($noteBody, 0, PersonalDashboard::BODY_MAXLEN);
        }

        $result = $personalDashboard->addItem(
            $recipientUserID,
            'note',
            $noteTitle,
            $noteBody,
            '',
            PersonalDashboard::PRIORITY_MEDIUM,
            ''
        );

        if (empty($result['success']))
        {
            $this->redirectToFeedbackReturn($returnQuery, 'failed');
        }

        $this->redirectToFeedbackReturn($returnQuery, 'sent');
    }

    private function getMyNotesView($source, $defaultView = 'notes')
    {
        if (!is_array($source) || !isset($source['view']))
        {
            return $defaultView;
        }

        $view = strtolower(trim((string) $source['view']));
        if ($view === 'todos')
        {
            return 'todos';
        }

        return 'notes';
    }

    private function getMyNotesNoteFilters($source)
    {
        $filters = array(
            'noteMode' => 'active',
            'noteSearch' => '',
            'archiveYear' => 0,
            'archiveMonth' => 0
        );

        if (!is_array($source))
        {
            return $filters;
        }

        if (isset($source['noteMode']))
        {
            $noteMode = strtolower(trim((string) $source['noteMode']));
            if (in_array($noteMode, array('active', 'archived', 'all'), true))
            {
                $filters['noteMode'] = $noteMode;
            }
        }

        if (isset($source['noteSearch']))
        {
            $noteSearch = trim((string) $source['noteSearch']);
            if (strlen($noteSearch) > 200)
            {
                $noteSearch = substr($noteSearch, 0, 200);
            }
            $filters['noteSearch'] = $noteSearch;
        }

        if (isset($source['archiveYear']))
        {
            $archiveYear = (int) trim((string) $source['archiveYear']);
            if ($archiveYear >= 1970 && $archiveYear <= 2100)
            {
                $filters['archiveYear'] = $archiveYear;
            }
        }

        if (isset($source['archiveMonth']))
        {
            $archiveMonth = (int) trim((string) $source['archiveMonth']);
            if ($archiveMonth >= 1 && $archiveMonth <= 12)
            {
                $filters['archiveMonth'] = $archiveMonth;
            }
        }

        if ($filters['noteMode'] === 'active')
        {
            $filters['archiveYear'] = 0;
            $filters['archiveMonth'] = 0;
        }

        return $filters;
    }

    private function redirectToMyNotes($view, $msg = '', $extraParams = array())
    {
        $view = ($view === 'todos') ? 'todos' : 'notes';
        $transferURI = 'm=home&a=myNotes&view=' . $view;

        if ($view === 'notes' && is_array($extraParams))
        {
            $noteFilters = $this->getMyNotesNoteFilters($extraParams);
            if ($noteFilters['noteMode'] !== 'active')
            {
                $transferURI .= '&noteMode=' . rawurlencode($noteFilters['noteMode']);
            }
            if ($noteFilters['noteSearch'] !== '')
            {
                $transferURI .= '&noteSearch=' . rawurlencode($noteFilters['noteSearch']);
            }
            if ($noteFilters['archiveYear'] > 0)
            {
                $transferURI .= '&archiveYear=' . rawurlencode((string) $noteFilters['archiveYear']);
            }
            if ($noteFilters['archiveMonth'] > 0)
            {
                $transferURI .= '&archiveMonth=' . rawurlencode((string) $noteFilters['archiveMonth']);
            }
        }

        if ($msg !== '')
        {
            $transferURI .= '&msg=' . rawurlencode($msg);
        }
        CATSUtility::transferRelativeURI($transferURI);
    }

    private function sanitizeFeedbackReturnQuery($returnQuery)
    {
        $returnQuery = trim((string) $returnQuery);
        if ($returnQuery === '')
        {
            return 'm=home&a=home';
        }

        $returnQuery = preg_replace('/[\r\n]+/', '', $returnQuery);
        $returnQuery = preg_replace('/^index\.php\?/i', '', $returnQuery);
        $returnQuery = ltrim($returnQuery, '?');

        if ($returnQuery === '' ||
            stripos($returnQuery, 'http://') === 0 ||
            stripos($returnQuery, 'https://') === 0)
        {
            return 'm=home&a=home';
        }

        return $returnQuery;
    }

    private function redirectToFeedbackReturn($returnQuery, $status)
    {
        $returnQuery = $this->sanitizeFeedbackReturnQuery($returnQuery);
        $returnQuery = preg_replace('/(^|&)feedbackStatus=[^&]*/i', '$1', $returnQuery);
        $returnQuery = trim((string) $returnQuery, '&');
        if ($returnQuery === '')
        {
            $returnQuery = 'm=home&a=home';
        }

        $returnQuery .= '&feedbackStatus=' . rawurlencode((string) $status);
        CATSUtility::transferRelativeURI($returnQuery);
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

        if (!$this->canDeleteAnyInboxThread())
        {
            CATSUtility::transferRelativeURI('m=home&a=inbox&threadKey=' . rawurlencode($threadKey) . '&msg=forbidden');
        }

        if ($threadType === 'joborder')
        {
            if ($this->getUserAccessLevel('joborders.edit') < ACCESS_LEVEL_EDIT)
            {
                CATSUtility::transferRelativeURI('m=home&a=inbox&threadKey=' . rawurlencode($threadKey) . '&msg=forbidden');
            }

            $jobOrderMessages = new JobOrderMessages($this->_siteID);
            if (!$jobOrderMessages->isSchemaAvailable())
            {
                CATSUtility::transferRelativeURI('m=home&a=inbox&msg=schema');
            }

            if (!$jobOrderMessages->isUserParticipant($threadID, $this->_userID))
            {
                CATSUtility::transferRelativeURI('m=home&a=inbox&threadKey=' . rawurlencode($threadKey) . '&msg=forbidden');
            }

            if (!$jobOrderMessages->deleteThread($threadID))
            {
                CATSUtility::transferRelativeURI('m=home&a=inbox&threadKey=' . rawurlencode($threadKey) . '&msg=deletefailed');
            }
        }
        else
        {
            if ($this->getUserAccessLevel('candidates.edit') < ACCESS_LEVEL_EDIT)
            {
                CATSUtility::transferRelativeURI('m=home&a=inbox&threadKey=' . rawurlencode($threadKey) . '&msg=forbidden');
            }

            $candidateMessages = new CandidateMessages($this->_siteID);
            if (!$candidateMessages->isSchemaAvailable())
            {
                CATSUtility::transferRelativeURI('m=home&a=inbox&msg=schema');
            }

            if (!$candidateMessages->isUserParticipant($threadID, $this->_userID))
            {
                CATSUtility::transferRelativeURI('m=home&a=inbox&threadKey=' . rawurlencode($threadKey) . '&msg=forbidden');
            }

            if (!$candidateMessages->deleteThread($threadID))
            {
                CATSUtility::transferRelativeURI('m=home&a=inbox&threadKey=' . rawurlencode($threadKey) . '&msg=deletefailed');
            }
        }

        CATSUtility::transferRelativeURI('m=home&a=inbox&msg=deleted');
    }

    private function onArchiveInboxThread()
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
        if (!$this->isCSRFTokenValid('home.archiveInboxThread', $securityToken))
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

            if (!$jobOrderMessages->isUserParticipant($threadID, $this->_userID, true))
            {
                CATSUtility::transferRelativeURI('m=home&a=inbox&threadKey=' . rawurlencode($threadKey) . '&msg=forbidden');
            }

            if (!$jobOrderMessages->archiveThreadForUser($threadID, $this->_userID))
            {
                CATSUtility::transferRelativeURI('m=home&a=inbox&threadKey=' . rawurlencode($threadKey) . '&msg=archivefailed');
            }
        }
        else
        {
            $candidateMessages = new CandidateMessages($this->_siteID);
            if (!$candidateMessages->isSchemaAvailable())
            {
                CATSUtility::transferRelativeURI('m=home&a=inbox&msg=schema');
            }

            if (!$candidateMessages->isUserParticipant($threadID, $this->_userID, true))
            {
                CATSUtility::transferRelativeURI('m=home&a=inbox&threadKey=' . rawurlencode($threadKey) . '&msg=forbidden');
            }

            if (!$candidateMessages->archiveThreadForUser($threadID, $this->_userID))
            {
                CATSUtility::transferRelativeURI('m=home&a=inbox&threadKey=' . rawurlencode($threadKey) . '&msg=archivefailed');
            }
        }

        CATSUtility::transferRelativeURI('m=home&a=inbox&msg=archived');
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
