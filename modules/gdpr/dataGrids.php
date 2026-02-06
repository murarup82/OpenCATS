<?php

include_once(LEGACY_ROOT . '/lib/Width.php');
include_once(LEGACY_ROOT . '/lib/StringUtility.php');

class GDPRRequestsDataGrid extends DataGrid
{
    protected $_siteID;

    public function __construct($siteID, $parameters, $misc)
    {
        $this->_tableWidth = new Width(100, '%');
        $this->_defaultAlphabeticalSortBy = 'candidateLastName';
        $this->ajaxMode = false;
        $this->showExportColumn = false;
        $this->showExportCheckboxes = false;
        $this->showActionArea = false;
        $this->showChooseColumnsBox = true;
        $this->allowResizing = true;

        $this->defaultSortBy = 'createdAtSort';
        $this->defaultSortDirection = 'DESC';

        $this->_defaultColumns = array(
            array('name' => 'Candidate', 'width' => 180),
            array('name' => 'Email', 'width' => 200),
            array('name' => 'Status', 'width' => 90),
            array('name' => 'Created', 'width' => 80),
            array('name' => 'Expires', 'width' => 80),
            array('name' => 'Sent', 'width' => 80),
            array('name' => 'Decision', 'width' => 110),
            array('name' => 'Deleted', 'width' => 80),
            array('name' => 'Latest', 'width' => 60),
            array('name' => 'Actions', 'width' => 260)
        );

        $this->_siteID = $siteID;

        $actionsPagerRender = <<<'EOT'
            $actions = array();
            $isLatest = ($rsData['isLatest'] == 1);
            $hasCandidate = !empty($rsData['candidateExists']);
            $isExpired = ($rsData['isExpired'] == 1);
            if ($isLatest && $hasCandidate)
            {
                if (in_array($rsData['status'], array('CREATED', 'SENT')) && !$isExpired)
                {
                    $actions[] = '<a href="javascript:void(0);" class="ui2-button ui2-button--secondary" onclick="GDPRRequests.action(\'resend\', ' . $rsData['requestID'] . ');">Resend</a>';
                    $actions[] = '<a href="javascript:void(0);" class="ui2-button ui2-button--secondary" onclick="GDPRRequests.action(\'expire\', ' . $rsData['requestID'] . ');">Expire Now</a>';
                }
                $actions[] = '<a href="javascript:void(0);" class="ui2-button ui2-button--secondary" onclick="GDPRRequests.action(\'create\', ' . $rsData['requestID'] . ');">Create New</a>';
                if ($rsData['status'] == 'DECLINED' && empty($rsData['deletedAt']))
                {
                    $actions[] = '<a href="javascript:void(0);" class="ui2-button ui2-button--danger" onclick="GDPRRequests.action(\'delete\', ' . $rsData['requestID'] . ');">Delete Candidate Data</a>';
                }
            }
            if (empty($actions))
            {
                return '<span class="ui2-muted">--</span>';
            }
            return implode(' ', $actions);
EOT;

        $this->_classColumns = array(
            'Candidate' => array(
                'pagerRender' => 'if (!empty($rsData[\'candidateExists\'])) { $fullName = trim($rsData[\'firstName\'] . " " . $rsData[\'lastName\']); if ($fullName === \'\') { $fullName = \'(Unnamed Candidate)\'; } return \'<a href="'.CATSUtility::getIndexName().'?m=candidates&amp;a=show&amp;candidateID=\' . $rsData[\'candidateID\'] . \'">\' . htmlspecialchars($fullName) . \'</a>\'; } return \'<span class="ui2-muted">Deleted Candidate</span>\';',
                'sortableColumn' => 'candidateLastName',
                'pagerWidth' => 180,
                'alphaNavigation' => true,
                'filterHaving' => 'candidateLastName'
            ),
            'Email' => array(
                'pagerRender' => 'if (!empty($rsData[\'email1\'])) { return htmlspecialchars($rsData[\'email1\']); } return \'<span class="ui2-muted">--</span>\';',
                'sortableColumn' => 'candidateEmail',
                'pagerWidth' => 200
            ),
            'Status' => array(
                'pagerRender' => '$label = $rsData[\'status\']; if ($rsData[\'isExpired\'] == 1 && ($rsData[\'status\'] == \'CREATED\' || $rsData[\'status\'] == \'SENT\')) { $label = \'EXPIRED\'; } return $label;',
                'sortableColumn' => 'status',
                'pagerWidth' => 90
            ),
            'Created' => array(
                'pagerRender' => 'return !empty($rsData[\'createdAt\']) ? $rsData[\'createdAt\'] : \'--\';',
                'sortableColumn' => 'createdAtSort',
                'pagerWidth' => 80
            ),
            'Expires' => array(
                'pagerRender' => 'return !empty($rsData[\'expiresAt\']) ? $rsData[\'expiresAt\'] : \'--\';',
                'sortableColumn' => 'expiresAtSort',
                'pagerWidth' => 80
            ),
            'Sent' => array(
                'pagerRender' => 'return !empty($rsData[\'sentAt\']) ? $rsData[\'sentAt\'] : \'--\';',
                'sortableColumn' => 'sentAtSort',
                'pagerWidth' => 80
            ),
            'Decision' => array(
                'pagerRender' => 'if (!empty($rsData[\'acceptedAt\'])) { return \'Accepted \' . $rsData[\'acceptedAt\']; } if (!empty($rsData[\'declinedAt\'])) { return \'Declined \' . $rsData[\'declinedAt\']; } return \'--\';',
                'sortableColumn' => 'decisionSort',
                'pagerWidth' => 110
            ),
            'Deleted' => array(
                'pagerRender' => 'return !empty($rsData[\'deletedAtFormatted\']) ? $rsData[\'deletedAtFormatted\'] : \'--\';',
                'sortableColumn' => 'deletedAtSort',
                'pagerWidth' => 80
            ),
            'Latest' => array(
                'pagerRender' => 'return ($rsData[\'isLatest\'] == 1) ? \'Yes\' : \'\';',
                'sortableColumn' => 'isLatest',
                'pagerWidth' => 60
            ),
            'Actions' => array(
                'pagerRender' => $actionsPagerRender,
                'pagerWidth' => 260,
                'sortableColumn' => 'requestID',
                'pagerOptional' => false,
                'filterable' => false
            )
        );

        parent::__construct('gdpr:GDPRRequestsDataGrid', $parameters, $misc);
    }

    public function getSQL($selectSQL, $joinSQL, $whereSQL, $havingSQL, $orderSQL, $limitSQL, $distinct = '')
    {
        $db = DatabaseConnection::getInstance();

        $filters = array();

        if (isset($_GET['status']) && $_GET['status'] !== '')
        {
            $status = trim($_GET['status']);
            $allowed = array('CREATED', 'SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELED');
            if (in_array($status, $allowed, true))
            {
                $filters[] = 'r.status = ' . $db->makeQueryString($status);
            }
        }

        if (isset($_GET['expiring']) && $_GET['expiring'] !== '')
        {
            $days = (int) $_GET['expiring'];
            if ($days > 0)
            {
                $filters[] = sprintf(
                    '(r.expires_at IS NOT NULL AND r.expires_at > NOW() AND r.expires_at <= DATE_ADD(NOW(), INTERVAL %s DAY))',
                    $db->makeQueryInteger($days)
                );
            }
        }

        if (isset($_GET['search']) && trim($_GET['search']) !== '')
        {
            $search = trim($_GET['search']);
            $searchSQL = $db->makeQueryString('%' . $search . '%');
            $filters[] = '(CONCAT(c.first_name, \' \', c.last_name) LIKE ' . $searchSQL . ' OR c.email1 LIKE ' . $searchSQL . ')';
        }

        if (isset($_GET['needsDeletion']) && $_GET['needsDeletion'] !== '')
        {
            $filters[] = '(latest.latestRequestID = r.request_id AND r.status = \'DECLINED\' AND r.deleted_at IS NULL AND c.candidate_id IS NOT NULL)';
        }

        $filterSQL = '';
        if (!empty($filters))
        {
            $filterSQL = ' AND ' . implode(' AND ', $filters);
        }

        $sql = sprintf(
            "SELECT SQL_CALC_FOUND_ROWS %s
                r.request_id AS requestID,
                r.candidate_id AS candidateID,
                r.status AS status,
                r.created_at AS createdAtSort,
                DATE_FORMAT(r.created_at, '%%m-%%d-%%y') AS createdAt,
                r.email_sent_at AS sentAtSort,
                DATE_FORMAT(r.email_sent_at, '%%m-%%d-%%y') AS sentAt,
                r.expires_at AS expiresAtSort,
                DATE_FORMAT(r.expires_at, '%%m-%%d-%%y') AS expiresAt,
                r.accepted_at AS acceptedAtSort,
                DATE_FORMAT(r.accepted_at, '%%m-%%d-%%y') AS acceptedAt,
                r.declined_at AS declinedAtSort,
                DATE_FORMAT(r.declined_at, '%%m-%%d-%%y') AS declinedAt,
                r.deleted_at AS deletedAtSort,
                DATE_FORMAT(r.deleted_at, '%%m-%%d-%%y') AS deletedAtFormatted,
                c.first_name AS firstName,
                c.last_name AS lastName,
                c.email1 AS email1,
                c.candidate_id AS candidateExists,
                c.last_name AS candidateLastName,
                c.email1 AS candidateEmail,
                CASE
                    WHEN r.accepted_at IS NOT NULL THEN 3
                    WHEN r.declined_at IS NOT NULL THEN 2
                    ELSE 1
                END AS decisionSort,
                latest.latestRequestID AS latestRequestID,
                CASE WHEN latest.latestRequestID = r.request_id THEN 1 ELSE 0 END AS isLatest,
                CASE WHEN r.expires_at IS NOT NULL AND r.expires_at <= NOW() THEN 1 ELSE 0 END AS isExpired,
                %s
            FROM
                candidate_gdpr_requests r
            LEFT JOIN candidate c
                ON c.candidate_id = r.candidate_id
                AND c.site_id = r.site_id
            LEFT JOIN user u
                ON u.user_id = r.sent_by_user_id
            LEFT JOIN (
                SELECT site_id, candidate_id, MAX(request_id) AS latestRequestID
                FROM candidate_gdpr_requests
                GROUP BY site_id, candidate_id
            ) latest
                ON latest.site_id = r.site_id
                AND latest.candidate_id = r.candidate_id
            %s
            WHERE
                r.site_id = %s
            %s
            %s
            %s
            %s",
            $distinct,
            $selectSQL,
            $joinSQL,
            $this->_siteID,
            (strlen($whereSQL) > 0) ? ' AND ' . $whereSQL : '',
            $filterSQL,
            (strlen($havingSQL) > 0) ? ' HAVING ' . $havingSQL : '',
            $orderSQL . ' ' . $limitSQL
        );

        return $sql;
    }
}

?>
