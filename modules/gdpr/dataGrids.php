<?php

include_once(LEGACY_ROOT . '/lib/Width.php');
include_once(LEGACY_ROOT . '/lib/StringUtility.php');
include_once(LEGACY_ROOT . '/lib/Attachments.php');

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
            array('name' => 'Accepted', 'width' => 80),
            array('name' => 'Accepted IP', 'width' => 110),
            array('name' => 'Lang', 'width' => 60),
            array('name' => 'Notice Hash', 'width' => 110),
            array('name' => 'Proof', 'width' => 120),
            array('name' => 'Deleted', 'width' => 80),
            array('name' => 'Latest', 'width' => 60),
            array('name' => 'Actions', 'width' => 260)
        );

        $this->_siteID = $siteID;

        $actionsPagerRender = <<<'EOT'
            $actions = array();
            $gdprAccessLevel = (int) $_SESSION['CATS']->getAccessLevel('gdpr.requests');
            $canEditGdpr = ($gdprAccessLevel >= ACCESS_LEVEL_EDIT);
            $canHardDeleteRequest = ($gdprAccessLevel >= ACCESS_LEVEL_SA);
            $isLatest = ($rsData['isLatest'] == 1);
            $hasCandidate = !empty($rsData['candidateExists']);
            $isExpired = ($rsData['isExpired'] == 1);
            if ($canEditGdpr && $rsData['isLegacy'] == 1)
            {
                if ($hasCandidate && (int) $rsData['renewalEligible'] === 1)
                {
                    $actions[] = '<a href="javascript:void(0);" class="ui2-button ui2-button--secondary" onclick="GDPRRequests.actionCandidate(\'createLegacy\', ' . $rsData['candidateID'] . ');" title="Creates an audited GDPR request and emails the candidate.">Send renewal request</a>';
                }
            }
            else if ($canEditGdpr && $isLatest && $hasCandidate)
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
            if ($canHardDeleteRequest && $rsData['isLegacy'] != 1 && !empty($rsData['requestID']))
            {
                $actions[] = '<a href="javascript:void(0);" class="ui2-button ui2-button--danger" onclick="GDPRRequests.action(\'deleteRequest\', ' . $rsData['requestID'] . ');">Delete (test)</a>';
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
                'pagerRender' => '$label = $rsData[\'status\']; if ($rsData[\'isExpired\'] == 1 && ($rsData[\'status\'] == \'CREATED\' || $rsData[\'status\'] == \'SENT\')) { $label = \'EXPIRED\'; } if ($rsData[\'status\'] == \'LEGACY\') { $needsAction = ($rsData[\'legacyProofStatus\'] == \'PROOF_MISSING\' || $rsData[\'legacyProofStatus\'] == \'UNKNOWN\'); if ($needsAction) { $label .= \' <span style="color:#b00000; font-weight:bold;">Action required</span>\'; } } return $label;',
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
                'pagerRender' => 'if ($rsData[\'status\'] == \'LEGACY\') { if ($rsData[\'legacyProofStatus\'] == \'PROOF_FOUND\') { return \'Legacy (proof attached)\'; } return \'Legacy (no proof on file)\'; } if (!empty($rsData[\'acceptedAt\'])) { return \'Accepted \' . $rsData[\'acceptedAt\']; } if (!empty($rsData[\'declinedAt\'])) { return \'Declined \' . $rsData[\'declinedAt\']; } return \'--\';',
                'sortableColumn' => 'decisionSort',
                'pagerWidth' => 110
            ),
            'Accepted' => array(
                'pagerRender' => 'return !empty($rsData[\'acceptedAt\']) ? $rsData[\'acceptedAt\'] : \'--\';',
                'sortableColumn' => 'acceptedAtSort',
                'pagerWidth' => 80
            ),
            'Accepted IP' => array(
                'pagerRender' => '$ip = trim($rsData[\'acceptedIP\']); if ($ip === \'\') { return \'--\'; } if (strpos($ip, \'.\') !== false) { $parts = explode(\'.\', $ip); if (count($parts) === 4) { $parts[3] = \'xxx\'; return htmlspecialchars(implode(\'.\', $parts)); } } if (strpos($ip, \':\') !== false) { $parts = explode(\':\', $ip); $parts[count($parts) - 1] = \'xxxx\'; return htmlspecialchars(implode(\':\', $parts)); } return htmlspecialchars($ip);',
                'exportRender' => 'return $rsData[\'acceptedIP\'];',
                'sortableColumn' => 'acceptedIP',
                'pagerWidth' => 110
            ),
            'Lang' => array(
                'pagerRender' => 'return !empty($rsData[\'acceptedLang\']) ? htmlspecialchars($rsData[\'acceptedLang\']) : \'--\';',
                'sortableColumn' => 'acceptedLang',
                'pagerWidth' => 60
            ),
            'Notice Hash' => array(
                'pagerRender' => 'if (empty($rsData[\'noticeVersion\'])) { return \'--\'; } $full = $rsData[\'noticeVersion\']; $short = substr($full, 0, 8); if (strlen($full) > 8) { $short .= \'...\'; } return \'<span title="\' . htmlspecialchars($full) . \'">\' . htmlspecialchars($short) . \'</span>\';',
                'sortableColumn' => 'noticeVersion',
                'pagerWidth' => 110
            ),
            'Proof' => array(
                'pagerRender' => 'if (!empty($rsData[\'proofAttachmentID\']) && !empty($rsData[\'proofDirName\'])) { $hash = Attachments::makeDirectoryAccessToken($rsData[\'proofAttachmentID\'], $rsData[\'proofDirName\']); $label = !empty($rsData[\'proofFilename\']) ? htmlspecialchars($rsData[\'proofFilename\']) : \'View PDF\'; return \'<a href="\' . CATSUtility::getIndexName() . \'?m=attachments&amp;a=getAttachment&amp;id=\' . $rsData[\'proofAttachmentID\'] . \'&amp;directoryNameHash=\' . urlencode($hash) . \'" target="_blank">\' . $label . \'</a>\'; } return \'--\';',
                'sortableColumn' => 'proofAttachmentID',
                'pagerWidth' => 120
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
        $renewalWindowDays = defined('GDPR_RENEWAL_WINDOW_DAYS') ? (int) GDPR_RENEWAL_WINDOW_DAYS : 30;
        if ($renewalWindowDays <= 0)
        {
            $renewalWindowDays = 30;
        }

        $filtersRequest = array();
        $filtersLegacy = array();
        $includeRequests = true;
        $includeLegacy = true;

        if (isset($_GET['status']) && $_GET['status'] !== '')
        {
            $status = trim($_GET['status']);
            $allowed = array('CREATED', 'SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELED', 'LEGACY');
            if (in_array($status, $allowed, true))
            {
                if ($status === 'LEGACY')
                {
                    $includeRequests = false;
                }
                else if ($status === 'EXPIRED')
                {
                    $includeLegacy = false;
                    $filtersRequest[] = "(r.status IN ('CREATED','SENT') AND r.expires_at IS NOT NULL AND r.expires_at <= NOW())";
                }
                else
                {
                    $includeLegacy = false;
                    $filtersRequest[] = 'r.status = ' . $db->makeQueryString($status);
                }
            }
        }

        if (isset($_GET['expiring']) && $_GET['expiring'] !== '')
        {
            $days = (int) $_GET['expiring'];
            if ($days > 0)
            {
                $effectiveRequestExpires = 'r.expires_at';
                $filtersRequest[] = sprintf(
                    '(%s IS NOT NULL AND %s > NOW() AND %s <= DATE_ADD(NOW(), INTERVAL %s DAY))',
                    $effectiveRequestExpires,
                    $effectiveRequestExpires,
                    $effectiveRequestExpires,
                    $db->makeQueryInteger($days)
                );
                $effectiveLegacyExpires = "CAST(NULLIF(c.gdpr_expiration_date, '0000-00-00') AS DATETIME)";
                $filtersLegacy[] = sprintf(
                    '(%s IS NOT NULL AND %s > NOW() AND %s <= DATE_ADD(NOW(), INTERVAL %s DAY))',
                    $effectiveLegacyExpires,
                    $effectiveLegacyExpires,
                    $effectiveLegacyExpires,
                    $db->makeQueryInteger($days)
                );
            }
        }

        if (isset($_GET['search']) && trim($_GET['search']) !== '')
        {
            $search = trim($_GET['search']);
            $searchSQL = $db->makeQueryString('%' . $search . '%');
            $searchFilter = '(CONCAT(c.first_name, \' \', c.last_name) LIKE ' . $searchSQL . ' OR c.email1 LIKE ' . $searchSQL . ')';
            $filtersRequest[] = $searchFilter;
            $filtersLegacy[] = $searchFilter;
        }

        if (isset($_GET['needsDeletion']) && $_GET['needsDeletion'] !== '')
        {
            $includeLegacy = false;
            $filtersRequest[] = '(latest.latestRequestID = r.request_id AND r.status = \'DECLINED\' AND r.deleted_at IS NULL AND c.candidate_id IS NOT NULL)';
        }

        if (isset($_GET['candidateID']) && ctype_digit((string) $_GET['candidateID']))
        {
            $candidateID = (int) $_GET['candidateID'];
            $filtersRequest[] = 'r.candidate_id = ' . $db->makeQueryInteger($candidateID);
            $filtersLegacy[] = 'c.candidate_id = ' . $db->makeQueryInteger($candidateID);
        }

        if (isset($_GET['dateFrom']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $_GET['dateFrom']))
        {
            $includeLegacy = false;
            $filtersRequest[] = 'r.created_at >= ' . $db->makeQueryString($_GET['dateFrom'] . ' 00:00:00');
        }

        if (isset($_GET['dateTo']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $_GET['dateTo']))
        {
            $includeLegacy = false;
            $filtersRequest[] = 'r.created_at <= ' . $db->makeQueryString($_GET['dateTo'] . ' 23:59:59');
        }

        if (!$includeRequests && !$includeLegacy)
        {
            $includeRequests = true;
            $filtersRequest[] = '1=0';
        }

        $requestFilterSQL = '';
        if (!empty($filtersRequest))
        {
            $requestFilterSQL = ' AND ' . implode(' AND ', $filtersRequest);
        }

        $legacyFilterSQL = '';
        if (!empty($filtersLegacy))
        {
            $legacyFilterSQL = ' AND ' . implode(' AND ', $filtersLegacy);
        }

        $requestSQL = sprintf(
            "SELECT
                r.request_id AS requestID,
                r.candidate_id AS candidateID,
                r.status AS status,
                r.created_at AS createdAtSort,
                DATE_FORMAT(r.created_at, '%%m-%%d-%%y') AS createdAt,
                r.email_sent_at AS sentAtSort,
                DATE_FORMAT(r.email_sent_at, '%%m-%%d-%%y') AS sentAt,
                r.expires_at AS effective_expires_at,
                r.expires_at AS expiresAtSort,
                DATE_FORMAT(r.expires_at, '%%m-%%d-%%y') AS expiresAt,
                r.accepted_at AS acceptedAtSort,
                DATE_FORMAT(r.accepted_at, '%%m-%%d-%%y') AS acceptedAt,
                r.accepted_ip AS acceptedIP,
                r.accepted_lang AS acceptedLang,
                r.notice_version AS noticeVersion,
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
                0 AS isLegacy,
                NULL AS legacyProofStatus,
                NULL AS legacyProofAttachmentID,
                NULL AS proofAttachmentID,
                NULL AS proofDirName,
                NULL AS proofFilename,
                0 AS renewalEligible,
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
            %s",
            $selectSQL,
            $joinSQL,
            $this->_siteID,
            $requestFilterSQL
        );

        $legacySQL = sprintf(
            "SELECT
                0 AS requestID,
                c.candidate_id AS candidateID,
                'LEGACY' AS status,
                c.date_created AS createdAtSort,
                DATE_FORMAT(c.date_created, '%%m-%%d-%%y') AS createdAt,
                NULL AS sentAtSort,
                NULL AS sentAt,
                CAST(NULLIF(c.gdpr_expiration_date, '0000-00-00') AS DATETIME) AS effective_expires_at,
                CAST(NULLIF(c.gdpr_expiration_date, '0000-00-00') AS DATETIME) AS expiresAtSort,
                DATE_FORMAT(CAST(NULLIF(c.gdpr_expiration_date, '0000-00-00') AS DATETIME), '%%m-%%d-%%y') AS expiresAt,
                NULL AS acceptedAtSort,
                NULL AS acceptedAt,
                NULL AS acceptedIP,
                NULL AS acceptedLang,
                NULL AS noticeVersion,
                NULL AS declinedAtSort,
                NULL AS declinedAt,
                NULL AS deletedAtSort,
                NULL AS deletedAtFormatted,
                c.first_name AS firstName,
                c.last_name AS lastName,
                c.email1 AS email1,
                c.candidate_id AS candidateExists,
                c.last_name AS candidateLastName,
                c.email1 AS candidateEmail,
                0 AS decisionSort,
                0 AS latestRequestID,
                1 AS isLatest,
                0 AS isExpired,
                1 AS isLegacy,
                c.gdpr_legacy_proof_status AS legacyProofStatus,
                c.gdpr_legacy_proof_attachment_id AS legacyProofAttachmentID,
                a.attachment_id AS proofAttachmentID,
                a.directory_name AS proofDirName,
                a.original_filename AS proofFilename,
                CASE
                    WHEN CAST(NULLIF(c.gdpr_expiration_date, '0000-00-00') AS DATETIME) IS NULL THEN 1
                    WHEN CAST(NULLIF(c.gdpr_expiration_date, '0000-00-00') AS DATETIME) <= NOW() THEN 1
                    WHEN CAST(NULLIF(c.gdpr_expiration_date, '0000-00-00') AS DATETIME) <= DATE_ADD(NOW(), INTERVAL %s DAY)
                    THEN 1
                    ELSE 0
                END AS renewalEligible,
                %s
            FROM
                candidate c
            LEFT JOIN attachment a
                ON a.attachment_id = c.gdpr_legacy_proof_attachment_id
                AND a.site_id = c.site_id
            %s
            WHERE
                c.site_id = %s
                AND c.gdpr_signed = 1
                AND NOT EXISTS (
                    SELECT 1
                    FROM candidate_gdpr_requests r2
                    WHERE r2.site_id = c.site_id
                    AND r2.candidate_id = c.candidate_id
                )
            %s",
            $db->makeQueryInteger($renewalWindowDays),
            $selectSQL,
            $joinSQL,
            $this->_siteID,
            $legacyFilterSQL
        );

        $queries = array();
        if ($includeRequests)
        {
            $queries[] = $requestSQL;
        }
        if ($includeLegacy)
        {
            $queries[] = $legacySQL;
        }
        if (empty($queries))
        {
            $queries[] = $requestSQL;
        }

        $unionSQL = implode("\nUNION ALL\n", $queries);

        $sql = sprintf(
            "SELECT SQL_CALC_FOUND_ROWS %s
                *
            FROM (
                %s
            ) gdpr
            %s
            %s
            %s",
            $distinct,
            $unionSQL,
            (strlen($whereSQL) > 0) ? ' WHERE ' . $whereSQL : '',
            (strlen($havingSQL) > 0) ? ' HAVING ' . $havingSQL : '',
            $orderSQL . ' ' . $limitSQL
        );

        return $sql;
    }
}

?>
