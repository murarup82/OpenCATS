<?php
/*
 * CATS
 * My Dashboard Module
 */

include_once(LEGACY_ROOT . '/lib/DatabaseConnection.php');
include_once(LEGACY_ROOT . '/lib/StringUtility.php');
include_once(LEGACY_ROOT . '/lib/CATSUtility.php');
include_once(LEGACY_ROOT . '/lib/TemplateUtility.php');
include_once(LEGACY_ROOT . '/lib/JobOrders.php');
include_once(LEGACY_ROOT . '/lib/JobOrderStatuses.php');
include_once(LEGACY_ROOT . '/lib/Pipelines.php');
include_once(LEGACY_ROOT . '/lib/UserRoles.php');
include_once(LEGACY_ROOT . '/lib/Hooks.php');

class DashboardUI extends UserInterface
{
    public function __construct()
    {
        parent::__construct();

        $this->_authenticationRequired = true;
        $this->_moduleDirectory = 'dashboard';
        $this->_moduleName = 'dashboard';
        $this->_moduleTabText = 'My Dashboard*al=' . ACCESS_LEVEL_READ . '@joborders.show';
        $this->_subTabs = array();
    }

    public function handleRequest()
    {
        if (!eval(Hooks::get('DASHBOARD_HANDLE_REQUEST'))) return;

        $action = $this->getAction();
        switch ($action)
        {
            case 'setPipelineStatus':
                $this->onSetPipelineStatus();
                break;

            case 'my':
            default:
                if ($this->getUserAccessLevel('joborders.show') < ACCESS_LEVEL_READ)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->myDashboard();
                break;
        }
    }

    private function myDashboard()
    {
        $responseFormat = strtolower(trim($this->getTrimmedInput('format', $_GET)));
        $modernPage = strtolower(trim($this->getTrimmedInput('modernPage', $_GET)));
        $showClosed = $this->isChecked('showClosed', $_GET);
        $companyID = (int) $this->getTrimmedInput('companyID', $_GET);
        $jobOrderID = (int) $this->getTrimmedInput('jobOrderID', $_GET);
        $statusID = (int) $this->getTrimmedInput('statusID', $_GET);
        if ($companyID < 0)
        {
            $companyID = 0;
        }
        if ($jobOrderID < 0)
        {
            $jobOrderID = 0;
        }
        if ($statusID < 0)
        {
            $statusID = 0;
        }

        $page = (int) $this->getTrimmedInput('page', $_GET);
        if ($page <= 0)
        {
            $page = 1;
        }

        $entriesPerPage = (int) $_SESSION['CATS']->getPipelineEntriesPerPage();
        if ($entriesPerPage <= 0)
        {
            $entriesPerPage = 15;
        }

        $offset = ($page - 1) * $entriesPerPage;

        $db = DatabaseConnection::getInstance();
        $siteID = $this->_siteID;
        $userID = $this->_userID;
        $canViewAllDashboardRows = $this->canViewAllDashboardRows();
        $requestedScope = strtolower(trim($this->getTrimmedInput('scope', $_GET)));
        if (!$canViewAllDashboardRows)
        {
            $dashboardScope = 'mine';
        }
        else if ($requestedScope === 'all')
        {
            $dashboardScope = 'all';
        }
        else
        {
            $dashboardScope = 'mine';
        }

        $requestedView = strtolower(trim($this->getTrimmedInput('view', $_GET)));
        if ($requestedView === 'kanban' || $requestedView === 'list')
        {
            $dashboardView = $requestedView;
        }
        else
        {
            $dashboardView = ($dashboardScope === 'mine') ? 'kanban' : 'list';
        }
        $isKanbanView = ($dashboardView === 'kanban');
        $canChangeStatus = $this->canChangeStatus();
        $canAssignToJobOrder = $this->canAssignToJobOrder();

        $companyOptions = $this->getDashboardCompanies($showClosed, $dashboardScope === 'all');
        $selectedCompanyName = '';
        foreach ($companyOptions as $companyOption)
        {
            if ((int) $companyOption['companyID'] === $companyID)
            {
                $selectedCompanyName = $companyOption['name'];
                break;
            }
        }
        if ($companyID > 0 && $selectedCompanyName === '')
        {
            $companyID = 0;
        }

        $jobOrderOptions = $this->getDashboardJobOrders($showClosed, $dashboardScope === 'all', $companyID);
        if ($jobOrderID > 0)
        {
            $jobOrderFound = false;
            foreach ($jobOrderOptions as $jobOrderOption)
            {
                if ((int) $jobOrderOption['jobOrderID'] === $jobOrderID)
                {
                    $jobOrderFound = true;
                    break;
                }
            }
            if (!$jobOrderFound)
            {
                $jobOrderID = 0;
            }
        }

        $statusFilter = '';
        if (!$showClosed)
        {
            $statusFilter = 'AND candidate_joborder.is_active = 1';
        }

        $jobOrderFilter = '';
        if ($jobOrderID > 0)
        {
            $jobOrderFilter = 'AND candidate_joborder.joborder_id = ' . $db->makeQueryInteger($jobOrderID);
        }

        $companyFilter = '';
        if ($companyID > 0)
        {
            $companyFilter = 'AND joborder.company_id = ' . $db->makeQueryInteger($companyID);
        }

        $statusFilterByID = '';
        if ($statusID > 0)
        {
            $statusFilterByID = 'AND candidate_joborder.status = ' . $db->makeQueryInteger($statusID);
        }

        $assignmentFilter = '';
        if ($dashboardScope === 'mine')
        {
            $assignmentFilter = sprintf(
                'AND (joborder.recruiter = %s OR joborder.owner = %s)',
                $db->makeQueryInteger($userID),
                $db->makeQueryInteger($userID)
            );
        }

        $limitSQL = '';
        if (!$isKanbanView)
        {
            $limitSQL = sprintf(
                'LIMIT %s, %s',
                $db->makeQueryInteger($offset),
                $db->makeQueryInteger($entriesPerPage)
            );
        }

        $sql = sprintf(
            "SELECT SQL_CALC_FOUND_ROWS
                candidate.candidate_id AS candidateID,
                candidate.first_name AS firstName,
                candidate.last_name AS lastName,
                candidate.country AS country,
                joborder.joborder_id AS jobOrderID,
                joborder.title AS jobOrderTitle,
                company.company_id AS companyID,
                company.name AS companyName,
                candidate_joborder.candidate_joborder_id AS candidateJobOrderID,
                candidate_joborder.status AS statusID,
                candidate_joborder.is_active AS isActive,
                candidate_joborder.rating_value AS ratingValue,
                (
                    SELECT
                        COUNT(*)
                    FROM
                        activity AS candidate_comment_activity
                    WHERE
                        candidate_comment_activity.data_item_id = candidate.candidate_id
                    AND
                        candidate_comment_activity.data_item_type = %s
                    AND
                        candidate_comment_activity.site_id = %s
                    AND
                        candidate_comment_activity.type = 400
                    AND
                        candidate_comment_activity.notes LIKE '[CANDIDATE_COMMENT]%%'
                ) AS candidateCommentCount,
                (
                    SELECT
                        COUNT(*)
                    FROM
                        activity AS joborder_comment_activity
                    WHERE
                        joborder_comment_activity.data_item_id = joborder.joborder_id
                    AND
                        joborder_comment_activity.data_item_type = %s
                    AND
                        joborder_comment_activity.site_id = %s
                    AND
                        joborder_comment_activity.type = 400
                    AND
                        joborder_comment_activity.notes LIKE '[JOBORDER_COMMENT]%%'
                ) AS jobOrderCommentCount,
                candidate_joborder_status.short_description AS status,
                COALESCE(history.lastStatusChange, candidate_joborder.date_modified) AS lastStatusChange,
                DATE_FORMAT(COALESCE(history.lastStatusChange, candidate_joborder.date_modified), '%%m-%%d-%%y (%%h:%%i %%p)') AS lastStatusChangeDisplay
            FROM
                candidate_joborder
            INNER JOIN candidate
                ON candidate_joborder.candidate_id = candidate.candidate_id
            INNER JOIN joborder
                ON candidate_joborder.joborder_id = joborder.joborder_id
            LEFT JOIN company
                ON joborder.company_id = company.company_id
            LEFT JOIN candidate_joborder_status
                ON candidate_joborder.status = candidate_joborder_status.candidate_joborder_status_id
            LEFT JOIN (
                SELECT
                    candidate_id,
                    joborder_id,
                    site_id,
                    MAX(date) AS lastStatusChange
                FROM
                    candidate_joborder_status_history
                WHERE
                    site_id = %s
                GROUP BY
                    candidate_id, joborder_id, site_id
            ) AS history
                ON history.candidate_id = candidate_joborder.candidate_id
                AND history.joborder_id = candidate_joborder.joborder_id
                AND history.site_id = candidate_joborder.site_id
            WHERE
                candidate_joborder.site_id = %s
            AND
                candidate.site_id = %s
            AND
                joborder.site_id = %s
            %s
            %s
            %s
            %s
            %s
            ORDER BY
                lastStatusChange DESC,
                candidate_joborder.date_modified DESC
            %s",
            $db->makeQueryInteger(DATA_ITEM_CANDIDATE),
            $db->makeQueryInteger($siteID),
            $db->makeQueryInteger(DATA_ITEM_JOBORDER),
            $db->makeQueryInteger($siteID),
            $db->makeQueryInteger($siteID),
            $db->makeQueryInteger($siteID),
            $db->makeQueryInteger($siteID),
            $db->makeQueryInteger($siteID),
            $assignmentFilter,
            $statusFilter,
            $jobOrderFilter,
            $companyFilter,
            $statusFilterByID,
            $limitSQL
        );

        $rows = $db->getAllAssoc($sql);
        if ($isKanbanView)
        {
            $totalRows = count($rows);
        }
        else
        {
            $totalRows = (int) $db->getColumn('SELECT FOUND_ROWS()', 0, 0);
        }

        foreach ($rows as $index => $row)
        {
            $candidateCommentCount = isset($row['candidateCommentCount']) ? (int) $row['candidateCommentCount'] : 0;
            $jobOrderCommentCount = isset($row['jobOrderCommentCount']) ? (int) $row['jobOrderCommentCount'] : 0;
            $rows[$index]['candidateCommentCount'] = $candidateCommentCount;
            $rows[$index]['jobOrderCommentCount'] = $jobOrderCommentCount;
            $rows[$index]['totalCommentCount'] = $candidateCommentCount + $jobOrderCommentCount;

            $rows[$index]['ratingLine'] = TemplateUtility::getRatingObject(
                $row['ratingValue'],
                $row['candidateJobOrderID'],
                $_SESSION['CATS']->getCookie()
            );

            $rows[$index]['location'] = $row['country'];
            if ($rows[$index]['location'] === '' || $rows[$index]['location'] === null)
            {
                $rows[$index]['location'] = '--';
            }

            $rows[$index]['status'] = $row['status'];
            if ($rows[$index]['status'] === '' || $rows[$index]['status'] === null)
            {
                $rows[$index]['status'] = '--';
            }

            $rows[$index]['lastStatusChangeDisplay'] = $row['lastStatusChangeDisplay'];
            if ($rows[$index]['lastStatusChangeDisplay'] === '' || $rows[$index]['lastStatusChangeDisplay'] === null)
            {
                $rows[$index]['lastStatusChangeDisplay'] = '--';
            }
        }

        $pipelines = new Pipelines($this->_siteID);
        $statusOptions = $pipelines->getStatusesForPicking();

        $totalPages = 1;
        if (!$isKanbanView && $entriesPerPage > 0)
        {
            $totalPages = (int) ceil($totalRows / $entriesPerPage);
            if ($totalPages <= 0)
            {
                $totalPages = 1;
            }
        }

        if ($companyID > 0 && $selectedCompanyName !== '')
        {
            $jobOrderScopeLabel = 'All job orders for ' . $selectedCompanyName;
        }
        else
        {
            $jobOrderScopeLabel = ($dashboardScope === 'all') ? 'All job orders' : 'All my assigned job orders';
        }

        if ($responseFormat === 'modern-json')
        {
            if ($modernPage !== '' && $modernPage !== 'dashboard-my')
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

            $this->renderModernDashboardJSON(
                $rows,
                $companyOptions,
                $jobOrderOptions,
                $statusOptions,
                $showClosed,
                $companyID,
                $jobOrderID,
                $statusID,
                $dashboardScope,
                $dashboardView,
                $canViewAllDashboardRows,
                $jobOrderScopeLabel,
                $page,
                $totalPages,
                $totalRows,
                $entriesPerPage,
                'dashboard-my',
                $canChangeStatus,
                $canAssignToJobOrder
            );
            return;
        }

        $this->_template->assign('rows', $rows);
        $this->_template->assign('showClosed', $showClosed);
        $this->_template->assign('companyID', $companyID);
        $this->_template->assign('jobOrderID', $jobOrderID);
        $this->_template->assign('statusID', $statusID);
        $this->_template->assign('companyOptions', $companyOptions);
        $this->_template->assign('jobOrderOptions', $jobOrderOptions);
        $this->_template->assign('showScopeSwitcher', $canViewAllDashboardRows ? 1 : 0);
        $this->_template->assign('dashboardScope', $dashboardScope);
        $this->_template->assign('dashboardView', $dashboardView);
        $this->_template->assign('jobOrderScopeLabel', $jobOrderScopeLabel);
        $this->_template->assign('statusOptions', $statusOptions);
        $this->_template->assign('page', $page);
        $this->_template->assign('totalPages', $totalPages);
        $this->_template->assign('totalRows', $totalRows);
        $this->_template->assign('entriesPerPage', $entriesPerPage);
        $this->_template->assign('sessionCookie', $_SESSION['CATS']->getCookie());
        $this->_template->assign('canChangeStatus', $canChangeStatus);
        $this->_template->assign('canAssignToJobOrder', $canAssignToJobOrder);
        $this->_template->assign('active', $this);

        if (!eval(Hooks::get('DASHBOARD_MY'))) return;

        $this->_template->display('./modules/dashboard/My.tpl');
    }

    private function renderModernDashboardJSON(
        $rows,
        $companyOptions,
        $jobOrderOptions,
        $statusOptions,
        $showClosed,
        $companyID,
        $jobOrderID,
        $statusID,
        $dashboardScope,
        $dashboardView,
        $canViewAllDashboardRows,
        $jobOrderScopeLabel,
        $page,
        $totalPages,
        $totalRows,
        $entriesPerPage,
        $modernPage,
        $canChangeStatus,
        $canAssignToJobOrder
    )
    {
        $baseURL = CATSUtility::getIndexName();
        $responseRows = array();

        foreach ($rows as $row)
        {
            $firstName = isset($row['firstName']) ? trim($row['firstName']) : '';
            $lastName = isset($row['lastName']) ? trim($row['lastName']) : '';
            $fullName = trim($firstName . ' ' . $lastName);
            if ($fullName === '')
            {
                $fullName = '--';
            }

            $statusLabel = isset($row['status']) ? trim($row['status']) : '--';
            if ($statusLabel === '')
            {
                $statusLabel = '--';
            }

            $responseRows[] = array(
                'candidateID' => (int) $row['candidateID'],
                'candidateName' => $fullName,
                'candidateURL' => sprintf(
                    '%s?m=candidates&a=show&candidateID=%d',
                    $baseURL,
                    (int) $row['candidateID']
                ),
                'jobOrderID' => (int) $row['jobOrderID'],
                'jobOrderTitle' => (isset($row['jobOrderTitle']) ? $row['jobOrderTitle'] : ''),
                'jobOrderURL' => sprintf(
                    '%s?m=joborders&a=show&jobOrderID=%d',
                    $baseURL,
                    (int) $row['jobOrderID']
                ),
                'companyID' => (int) $row['companyID'],
                'companyName' => (isset($row['companyName']) ? $row['companyName'] : ''),
                'candidateJobOrderID' => (int) $row['candidateJobOrderID'],
                'statusID' => (int) $row['statusID'],
                'statusLabel' => $statusLabel,
                'statusSlug' => $this->toStatusSlug($statusLabel),
                'lastStatusChangeDisplay' => (isset($row['lastStatusChangeDisplay']) ? $row['lastStatusChangeDisplay'] : '--'),
                'location' => (isset($row['location']) ? $row['location'] : '--'),
                'isActive' => (int) $row['isActive']
            );
        }

        $statusOptionValues = array();
        foreach ($statusOptions as $statusOption)
        {
            $statusOptionValues[] = array(
                'statusID' => (int) $statusOption['statusID'],
                'status' => (isset($statusOption['status']) ? $statusOption['status'] : '')
            );
        }
        $rejectionReasons = $this->getRejectionReasons();
        $rejectionReasonValues = array();
        foreach ($rejectionReasons as $rejectionReason)
        {
            $rejectionReasonValues[] = array(
                'reasonID' => (int) $rejectionReason['reasonID'],
                'label' => (isset($rejectionReason['label']) ? $rejectionReason['label'] : '')
            );
        }
        $orderedStatusIDs = array();
        foreach ($statusOptionValues as $statusOptionValue)
        {
            $orderedStatusIDs[] = (int) $statusOptionValue['statusID'];
        }

        $companyOptionValues = array();
        foreach ($companyOptions as $companyOption)
        {
            $companyOptionValues[] = array(
                'companyID' => (int) $companyOption['companyID'],
                'name' => (isset($companyOption['name']) ? $companyOption['name'] : '')
            );
        }

        $jobOrderOptionValues = array();
        foreach ($jobOrderOptions as $jobOrderOption)
        {
            $jobOrderOptionValues[] = array(
                'jobOrderID' => (int) $jobOrderOption['jobOrderID'],
                'title' => (isset($jobOrderOption['title']) ? $jobOrderOption['title'] : ''),
                'companyName' => (isset($jobOrderOption['companyName']) ? $jobOrderOption['companyName'] : '')
            );
        }

        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'dashboard.my.interactive.v1',
                'modernPage' => $modernPage,
                'scope' => $dashboardScope,
                'view' => $dashboardView,
                'showClosed' => ((bool) $showClosed),
                'canViewAllScopes' => ((bool) $canViewAllDashboardRows),
                'jobOrderScopeLabel' => $jobOrderScopeLabel,
                'page' => (int) $page,
                'totalPages' => (int) $totalPages,
                'totalRows' => (int) $totalRows,
                'entriesPerPage' => (int) $entriesPerPage,
                'permissions' => array(
                    'canChangeStatus' => ((bool) $canChangeStatus),
                    'canAssignToJobOrder' => ((bool) $canAssignToJobOrder)
                ),
                'statusRules' => array(
                    'rejectedStatusID' => (int) PIPELINE_STATUS_REJECTED,
                    'rejectionOtherReasonID' => (int) $this->getOtherRejectionReasonId($rejectionReasons),
                    'orderedStatusIDs' => $orderedStatusIDs
                )
            ),
            'filters' => array(
                'companyID' => (int) $companyID,
                'jobOrderID' => (int) $jobOrderID,
                'statusID' => (int) $statusID
            ),
            'options' => array(
                'companies' => $companyOptionValues,
                'jobOrders' => $jobOrderOptionValues,
                'statuses' => $statusOptionValues,
                'rejectionReasons' => $rejectionReasonValues
            ),
            'actions' => array(
                'setPipelineStatusURL' => $baseURL . '?m=dashboard&a=setPipelineStatus',
                'setPipelineStatusToken' => $this->getCSRFToken('dashboard.setPipelineStatus')
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

    private function toStatusSlug($statusLabel)
    {
        $statusLabel = strtolower(trim((string) $statusLabel));
        if ($statusLabel === '')
        {
            return 'unknown';
        }

        $statusSlug = preg_replace('/[^a-z0-9]+/', '-', $statusLabel);
        $statusSlug = trim($statusSlug, '-');
        if ($statusSlug === '')
        {
            $statusSlug = 'unknown';
        }

        return $statusSlug;
    }

    private function getDashboardJobOrders($includeClosed, $includeAll, $companyID = 0)
    {
        $db = DatabaseConnection::getInstance();
        $pipelineFilter = '';
        if (!$includeClosed)
        {
            $pipelineFilter = 'AND candidate_joborder.is_active = 1';
        }

        $assignmentFilter = '';
        if (!$includeAll)
        {
            $assignmentFilter = sprintf(
                'AND (joborder.recruiter = %s OR joborder.owner = %s)',
                $db->makeQueryInteger($this->_userID),
                $db->makeQueryInteger($this->_userID)
            );
        }

        $companyFilter = '';
        if ((int) $companyID > 0)
        {
            $companyFilter = 'AND joborder.company_id = ' . $db->makeQueryInteger((int) $companyID);
        }

        $sql = sprintf(
            "SELECT DISTINCT
                joborder.joborder_id AS jobOrderID,
                joborder.title AS title,
                company.name AS companyName
            FROM
                candidate_joborder
            INNER JOIN joborder
                ON joborder.joborder_id = candidate_joborder.joborder_id
                AND joborder.site_id = candidate_joborder.site_id
            LEFT JOIN company
                ON joborder.company_id = company.company_id
                AND company.site_id = joborder.site_id
            WHERE
                candidate_joborder.site_id = %s
            %s
            %s
            %s
            ORDER BY
                joborder.date_created DESC",
            $db->makeQueryInteger($this->_siteID),
            $assignmentFilter,
            $companyFilter,
            $pipelineFilter
        );

        return $db->getAllAssoc($sql);
    }

    private function getDashboardCompanies($includeClosed, $includeAll)
    {
        $db = DatabaseConnection::getInstance();
        $pipelineFilter = '';
        if (!$includeClosed)
        {
            $pipelineFilter = 'AND candidate_joborder.is_active = 1';
        }

        $assignmentFilter = '';
        if (!$includeAll)
        {
            $assignmentFilter = sprintf(
                'AND (joborder.recruiter = %s OR joborder.owner = %s)',
                $db->makeQueryInteger($this->_userID),
                $db->makeQueryInteger($this->_userID)
            );
        }

        $sql = sprintf(
            "SELECT DISTINCT
                company.company_id AS companyID,
                company.name AS name
            FROM
                candidate_joborder
            INNER JOIN joborder
                ON joborder.joborder_id = candidate_joborder.joborder_id
                AND joborder.site_id = candidate_joborder.site_id
            INNER JOIN company
                ON company.company_id = joborder.company_id
                AND company.site_id = joborder.site_id
            WHERE
                candidate_joborder.site_id = %s
            %s
            %s
            ORDER BY
                company.name ASC",
            $db->makeQueryInteger($this->_siteID),
            $assignmentFilter,
            $pipelineFilter
        );

        return $db->getAllAssoc($sql);
    }

    private function canViewAllDashboardRows()
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

        return ($this->getUserAccessLevel('joborders.show') >= ACCESS_LEVEL_DELETE);
    }

    private function canChangeStatus()
    {
        if ($_SESSION['CATS']->hasUserCategory('sourcer'))
        {
            return false;
        }

        return ($_SESSION['CATS']->getAccessLevel('pipelines.addActivityChangeStatus') >= ACCESS_LEVEL_EDIT);
    }

    private function canAssignToJobOrder()
    {
        return ($_SESSION['CATS']->getAccessLevel('joborders.considerCandidateSearch') >= ACCESS_LEVEL_EDIT);
    }

    private function onSetPipelineStatus()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST')
        {
            $this->respondJSON(405, array(
                'success' => false,
                'code' => 'invalidMethod',
                'message' => 'Invalid request method.'
            ));
            return;
        }

        if (!$this->canChangeStatus())
        {
            $this->respondJSON(403, array(
                'success' => false,
                'code' => 'forbidden',
                'message' => 'You do not have permission to change pipeline status.'
            ));
            return;
        }

        $securityToken = $this->getTrimmedInput('securityToken', $_POST);
        if (!$this->isCSRFTokenValid('dashboard.setPipelineStatus', $securityToken))
        {
            $this->respondJSON(403, array(
                'success' => false,
                'code' => 'invalidToken',
                'message' => 'Invalid security token.'
            ));
            return;
        }

        if (
            !$this->isRequiredIDValid('candidateID', $_POST) ||
            !$this->isRequiredIDValid('jobOrderID', $_POST) ||
            !$this->isRequiredIDValid('statusID', $_POST)
        )
        {
            $this->respondJSON(400, array(
                'success' => false,
                'code' => 'invalidInput',
                'message' => 'Missing or invalid status transition payload.'
            ));
            return;
        }

        $candidateID = (int) $_POST['candidateID'];
        $jobOrderID = (int) $_POST['jobOrderID'];
        $targetStatusID = (int) $_POST['statusID'];
        $enforceOwner = ((int) $this->getTrimmedInput('enforceOwner', $_POST) === 1);
        $statusComment = $this->getTrimmedInput('statusComment', $_POST);
        $rejectionReasonIDs = array();
        $rejectionReasonOther = null;

        $pipelines = new Pipelines($this->_siteID);
        $statusRS = $pipelines->getStatusesForPicking();
        $statusOrder = array();
        $statusLabelsByID = array();
        foreach ($statusRS as $statusRow)
        {
            $statusID = (int) $statusRow['statusID'];
            $statusOrder[] = $statusID;
            $statusLabelsByID[$statusID] = (isset($statusRow['status']) ? $statusRow['status'] : '');
        }

        if (!isset($statusLabelsByID[$targetStatusID]))
        {
            $this->respondJSON(400, array(
                'success' => false,
                'code' => 'invalidStatus',
                'message' => 'Invalid pipeline status.'
            ));
            return;
        }

        $pipelineData = $pipelines->get($candidateID, $jobOrderID);
        if (empty($pipelineData))
        {
            $this->respondJSON(404, array(
                'success' => false,
                'code' => 'notFound',
                'message' => 'Pipeline entry was not found.'
            ));
            return;
        }

        $currentStatusID = (int) $pipelineData['statusID'];
        if ($currentStatusID === $targetStatusID)
        {
            $this->respondJSON(200, array(
                'success' => true,
                'message' => 'Candidate is already in that status.',
                'updatedStatusID' => $currentStatusID,
                'updatedStatusLabel' => (isset($statusLabelsByID[$currentStatusID]) ? $statusLabelsByID[$currentStatusID] : '')
            ));
            return;
        }

        if ($enforceOwner)
        {
            $jobOrders = new JobOrders($this->_siteID);
            $jobOrderData = $jobOrders->get($jobOrderID);
            if (!$this->canAccessJobOrderPipelineByJobOrderData($jobOrderData))
            {
                $this->respondJSON(403, array(
                    'success' => false,
                    'code' => 'forbidden',
                    'message' => 'You do not have permission to update this job order pipeline.'
                ));
                return;
            }
        }

        if (
            $currentStatusID === (int) PIPELINE_STATUS_REJECTED &&
            $targetStatusID !== (int) PIPELINE_STATUS_REJECTED
        )
        {
            $this->respondJSON(409, array(
                'success' => false,
                'code' => 'rejectedLocked',
                'message' => 'Cannot move from Rejected. Re-assign candidate to restart the pipeline.'
            ));
            return;
        }

        if ($targetStatusID === (int) PIPELINE_STATUS_REJECTED)
        {
            $rawRejectionReasonIDs = array();
            if (isset($_POST['rejectionReasonIDs']))
            {
                if (is_array($_POST['rejectionReasonIDs']))
                {
                    $rawRejectionReasonIDs = $_POST['rejectionReasonIDs'];
                }
                else
                {
                    $rawRejectionReasonIDs = explode(',', $_POST['rejectionReasonIDs']);
                }
            }
            if (isset($_POST['rejectionReasonIDs']) && is_array($_POST['rejectionReasonIDs']))
            {
                $rawRejectionReasonIDs = $_POST['rejectionReasonIDs'];
            }
            else if (isset($_POST['rejectionReasonIDs[]']) && is_array($_POST['rejectionReasonIDs[]']))
            {
                $rawRejectionReasonIDs = $_POST['rejectionReasonIDs[]'];
            }
            $rejectionReasonIDs = array_map('intval', $rawRejectionReasonIDs);
            $rejectionReasonIDs = array_values(array_filter($rejectionReasonIDs));

            $rejectionReasons = $this->getRejectionReasons();
            $validRejectionReasonIDs = array();
            foreach ($rejectionReasons as $rejectionReason)
            {
                $validRejectionReasonIDs[(int) $rejectionReason['reasonID']] = true;
            }
            $rejectionReasonIDs = array_values(array_filter(
                $rejectionReasonIDs,
                function ($reasonID) use ($validRejectionReasonIDs)
                {
                    return isset($validRejectionReasonIDs[(int) $reasonID]);
                }
            ));

            if (empty($rejectionReasonIDs))
            {
                $this->respondJSON(400, array(
                    'success' => false,
                    'code' => 'missingRejectionReason',
                    'message' => 'Select at least one rejection reason.'
                ));
                return;
            }

            $otherReasonID = $this->getOtherRejectionReasonId($rejectionReasons);
            if ($otherReasonID > 0 && in_array($otherReasonID, $rejectionReasonIDs, true))
            {
                $rejectionReasonOther = $this->getTrimmedInput('rejectionReasonOther', $_POST);
                if ($rejectionReasonOther === '')
                {
                    $this->respondJSON(400, array(
                        'success' => false,
                        'code' => 'missingOtherReason',
                        'message' => 'Other rejection reason is required.'
                    ));
                    return;
                }
            }
        }

        if (!$this->isForwardDashboardTransitionAllowed($currentStatusID, $targetStatusID, $statusOrder))
        {
            $this->respondJSON(409, array(
                'success' => false,
                'code' => 'invalidTransition',
                'message' => 'Only forward stage transitions are allowed from Kanban.'
            ));
            return;
        }

        $jobOrders = new JobOrders($this->_siteID);
        if (
            $targetStatusID === (int) PIPELINE_STATUS_HIRED &&
            $currentStatusID !== (int) PIPELINE_STATUS_HIRED &&
            !$jobOrders->checkOpenings($jobOrderID)
        )
        {
            $this->respondJSON(409, array(
                'success' => false,
                'code' => 'openingsFull',
                'message' => 'This job order has been filled. Cannot assign Hired status.'
            ));
            return;
        }

        $autoFillStatusIDs = array();
        if ($targetStatusID !== (int) PIPELINE_STATUS_REJECTED)
        {
            $currentIndex = array_search($currentStatusID, $statusOrder, true);
            $targetIndex = array_search($targetStatusID, $statusOrder, true);
            if (
                $currentIndex !== false &&
                $targetIndex !== false &&
                $targetIndex > ($currentIndex + 1)
            )
            {
                $autoFillStatusIDs = array_slice(
                    $statusOrder,
                    $currentIndex + 1,
                    $targetIndex - $currentIndex - 1
                );
            }
        }

        foreach ($autoFillStatusIDs as $autoFillStatusID)
        {
            if (
                (int) $autoFillStatusID === (int) PIPELINE_STATUS_HIRED ||
                (int) $autoFillStatusID === (int) PIPELINE_STATUS_REJECTED
            )
            {
                $this->respondJSON(409, array(
                    'success' => false,
                    'code' => 'invalidAutoFill',
                    'message' => 'Auto-fill path includes terminal statuses. Use manual status change.'
                ));
                return;
            }
        }

        $db = DatabaseConnection::getInstance();
        $transactionStarted = false;
        if (!empty($autoFillStatusIDs))
        {
            $transactionStarted = $db->beginTransaction();
        }

        $autoFillComment = '[AUTO] Auto-filled pipeline steps from dashboard Kanban.';
        foreach ($autoFillStatusIDs as $autoFillStatusID)
        {
            $autoHistoryID = $pipelines->setStatus(
                $candidateID,
                $jobOrderID,
                (int) $autoFillStatusID,
                '',
                '',
                $this->_userID,
                $autoFillComment,
                null,
                1
            );
            if (empty($autoHistoryID) || (int) $autoHistoryID < 0)
            {
                if ($transactionStarted)
                {
                    $db->rollbackTransaction();
                }
                $this->respondJSON(500, array(
                    'success' => false,
                    'code' => 'autoFillFailed',
                    'message' => 'Failed to auto-fill intermediate pipeline steps.'
                ));
                return;
            }
        }

        if ($statusComment === '')
        {
            if ($targetStatusID === (int) PIPELINE_STATUS_REJECTED)
            {
                $statusComment = '[MODERN] Candidate rejected from dashboard workflow.';
            }
            else
            {
                $statusComment = '[MODERN] Pipeline status changed from dashboard Kanban.';
            }
        }

        $historyID = $pipelines->setStatus(
            $candidateID,
            $jobOrderID,
            $targetStatusID,
            '',
            '',
            $this->_userID,
            $statusComment,
            $rejectionReasonOther
        );

        if (empty($historyID) || (int) $historyID < 0)
        {
            if ($transactionStarted)
            {
                $db->rollbackTransaction();
            }
            $this->respondJSON(500, array(
                'success' => false,
                'code' => 'statusUpdateFailed',
                'message' => 'Failed to update pipeline status.'
            ));
            return;
        }

        if ($targetStatusID === (int) PIPELINE_STATUS_REJECTED && (int) $historyID > 0 && !empty($rejectionReasonIDs))
        {
            $pipelines->addStatusHistoryRejectionReasons($historyID, $rejectionReasonIDs);
        }

        if ($transactionStarted)
        {
            $db->commitTransaction();
        }

        if (
            $targetStatusID === (int) PIPELINE_STATUS_HIRED &&
            $currentStatusID !== (int) PIPELINE_STATUS_HIRED &&
            is_numeric($pipelineData['openingsAvailable']) &&
            (int) $pipelineData['openingsAvailable'] > 0
        )
        {
            $jobOrders->updateOpeningsAvailable(
                $jobOrderID,
                ((int) $pipelineData['openingsAvailable']) - 1
            );
        }

        if (
            $targetStatusID !== (int) PIPELINE_STATUS_HIRED &&
            $currentStatusID === (int) PIPELINE_STATUS_HIRED
        )
        {
            $jobOrders->updateOpeningsAvailable(
                $jobOrderID,
                ((int) $pipelineData['openingsAvailable']) + 1
            );
        }

        $this->respondJSON(200, array(
            'success' => true,
            'message' => 'Pipeline status updated.',
            'updatedStatusID' => $targetStatusID,
            'updatedStatusLabel' => (isset($statusLabelsByID[$targetStatusID]) ? $statusLabelsByID[$targetStatusID] : ''),
            'historyID' => (int) $historyID,
            'autoFilledStatusIDs' => array_values(array_map('intval', $autoFillStatusIDs))
        ));
    }

    private function respondJSON($statusCode, $payload)
    {
        if (!headers_sent())
        {
            header('Content-Type: application/json; charset=' . AJAX_ENCODING);
            header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
            if (function_exists('http_response_code'))
            {
                http_response_code((int) $statusCode);
            }
            else
            {
                header('HTTP/1.1 ' . (int) $statusCode);
            }
        }

        echo json_encode($payload);
    }

    private function canManagePipelineAdministration()
    {
        if (!isset($_SESSION['CATS']) || !is_object($_SESSION['CATS']))
        {
            return false;
        }

        $baseAccessLevel = 0;
        if (method_exists($_SESSION['CATS'], 'getBaseAccessLevel'))
        {
            $baseAccessLevel = (int) $_SESSION['CATS']->getBaseAccessLevel();
        }
        else if (method_exists($_SESSION['CATS'], 'getRealAccessLevel'))
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

    private function canAccessJobOrderPipelineByJobOrderData($jobOrderData)
    {
        if (empty($jobOrderData))
        {
            return false;
        }

        if ($this->canManagePipelineAdministration())
        {
            return true;
        }

        $ownerUserID = (isset($jobOrderData['owner']) ? (int) $jobOrderData['owner'] : 0);
        $recruiterUserID = (isset($jobOrderData['recruiter']) ? (int) $jobOrderData['recruiter'] : 0);
        $currentUserID = (int) $this->_userID;

        return ($ownerUserID === $currentUserID || $recruiterUserID === $currentUserID);
    }

    private function isForwardDashboardTransitionAllowed($currentStatusID, $targetStatusID, $statusOrder)
    {
        $currentStatusID = (int) $currentStatusID;
        $targetStatusID = (int) $targetStatusID;
        if ($currentStatusID <= 0 || $targetStatusID <= 0)
        {
            return false;
        }

        if ($currentStatusID === $targetStatusID)
        {
            return false;
        }

        if ($currentStatusID === (int) PIPELINE_STATUS_REJECTED)
        {
            return false;
        }

        if ($targetStatusID === (int) PIPELINE_STATUS_REJECTED)
        {
            return true;
        }

        $currentIndex = array_search($currentStatusID, $statusOrder, true);
        $targetIndex = array_search($targetStatusID, $statusOrder, true);
        if ($currentIndex === false || $targetIndex === false)
        {
            return true;
        }

        return ($targetIndex > $currentIndex);
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
}

?>
