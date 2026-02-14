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
        $showClosed = $this->isChecked('showClosed', $_GET);
        $jobOrderID = (int) $this->getTrimmedInput('jobOrderID', $_GET);
        $statusID = (int) $this->getTrimmedInput('statusID', $_GET);
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
        else if ($requestedScope === 'mine')
        {
            $dashboardScope = 'mine';
        }
        else
        {
            $dashboardScope = 'all';
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

        $statusFilterByID = '';
        if ($statusID > 0)
        {
            $statusFilterByID = 'AND candidate_joborder.status = ' . $db->makeQueryInteger($statusID);
        }

        $ownerFilter = '';
        if ($dashboardScope === 'mine')
        {
            $ownerFilter = 'AND joborder.owner = ' . $db->makeQueryInteger($userID);
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
            ORDER BY
                lastStatusChange DESC,
                candidate_joborder.date_modified DESC
            LIMIT %s, %s",
            $db->makeQueryInteger($siteID),
            $db->makeQueryInteger($siteID),
            $db->makeQueryInteger($siteID),
            $db->makeQueryInteger($siteID),
            $ownerFilter,
            $statusFilter,
            $jobOrderFilter,
            $statusFilterByID,
            $db->makeQueryInteger($offset),
            $db->makeQueryInteger($entriesPerPage)
        );

        $rows = $db->getAllAssoc($sql);
        $totalRows = (int) $db->getColumn('SELECT FOUND_ROWS()', 0, 0);

        foreach ($rows as $index => $row)
        {
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

        $jobOrderOptions = $this->getDashboardJobOrders($showClosed, $dashboardScope === 'all');
        $pipelines = new Pipelines($this->_siteID);
        $statusOptions = $pipelines->getStatusesForPicking();

        $totalPages = 1;
        if ($entriesPerPage > 0)
        {
            $totalPages = (int) ceil($totalRows / $entriesPerPage);
            if ($totalPages <= 0)
            {
                $totalPages = 1;
            }
        }

        $this->_template->assign('rows', $rows);
        $this->_template->assign('showClosed', $showClosed);
        $this->_template->assign('jobOrderID', $jobOrderID);
        $this->_template->assign('statusID', $statusID);
        $this->_template->assign('jobOrderOptions', $jobOrderOptions);
        $this->_template->assign('showScopeSwitcher', $canViewAllDashboardRows ? 1 : 0);
        $this->_template->assign('dashboardScope', $dashboardScope);
        $this->_template->assign(
            'jobOrderScopeLabel',
            ($dashboardScope === 'all') ? 'All job orders' : 'All my assigned job orders'
        );
        $this->_template->assign('statusOptions', $statusOptions);
        $this->_template->assign('page', $page);
        $this->_template->assign('totalPages', $totalPages);
        $this->_template->assign('totalRows', $totalRows);
        $this->_template->assign('entriesPerPage', $entriesPerPage);
        $this->_template->assign('sessionCookie', $_SESSION['CATS']->getCookie());
        $this->_template->assign('canChangeStatus', $this->canChangeStatus());
        $this->_template->assign('active', $this);

        if (!eval(Hooks::get('DASHBOARD_MY'))) return;

        $this->_template->display('./modules/dashboard/My.tpl');
    }

    private function getDashboardJobOrders($includeClosed, $includeAll)
    {
        $db = DatabaseConnection::getInstance();
        $statusFilter = '';
        if (!$includeClosed)
        {
            $statusFilter = 'AND joborder.status IN ' . JobOrderStatuses::getOpenStatusSQL();
        }

        $ownerFilter = '';
        if (!$includeAll)
        {
            $ownerFilter = 'AND joborder.owner = ' . $db->makeQueryInteger($this->_userID);
        }

        $sql = sprintf(
            "SELECT
                joborder.joborder_id AS jobOrderID,
                joborder.title AS title,
                company.name AS companyName
            FROM
                joborder
            LEFT JOIN company
                ON joborder.company_id = company.company_id
            WHERE
                joborder.site_id = %s
            %s
            %s
            ORDER BY
                joborder.date_created DESC",
            $db->makeQueryInteger($this->_siteID),
            $ownerFilter,
            $statusFilter
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
}

?>
