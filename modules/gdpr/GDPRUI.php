<?php
/*
 * CATS
 * GDPR Consents Module
 */

include_once(LEGACY_ROOT . '/lib/StringUtility.php');
include_once(LEGACY_ROOT . '/lib/DateUtility.php');
include_once(LEGACY_ROOT . '/lib/ResultSetUtility.php');
include_once(LEGACY_ROOT . '/lib/DataGrid.php');
include_once(LEGACY_ROOT . '/modules/gdpr/dataGrids.php');

class GDPRUI extends UserInterface
{
    public function __construct()
    {
        parent::__construct();

        $this->_authenticationRequired = true;
        $this->_moduleDirectory = 'gdpr';
        $this->_moduleName = 'gdpr';
        $this->_moduleTabText = '';
        $this->_subTabs = array();
    }

    public function handleRequest()
    {
        $action = $this->getAction();

        switch ($action)
        {
            case 'requests':
            default:
                $this->requests();
                break;
            case 'export':
                $this->export();
                break;
        }
    }

    private function requests()
    {
        if ($this->getUserAccessLevel('settings.administration') < ACCESS_LEVEL_SA)
        {
            CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for GDPR consents.');
            return;
        }

        $dataGridProperties = DataGrid::getRecentParamaters('gdpr:GDPRRequestsDataGrid');
        if ($dataGridProperties == array())
        {
            $dataGridProperties = array(
                'rangeStart'    => 0,
                'maxResults'    => 15,
                'filterVisible' => false
            );
        }

        $dataGrid = DataGrid::get('gdpr:GDPRRequestsDataGrid', $dataGridProperties);

        $status = isset($_GET['status']) ? trim($_GET['status']) : '';
        $expiring = isset($_GET['expiring']) ? trim($_GET['expiring']) : '';
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';
        $needsDeletion = isset($_GET['needsDeletion']) ? trim($_GET['needsDeletion']) : '';
        $candidateID = isset($_GET['candidateID']) ? trim($_GET['candidateID']) : '';
        $dateFrom = isset($_GET['dateFrom']) ? trim($_GET['dateFrom']) : '';
        $dateTo = isset($_GET['dateTo']) ? trim($_GET['dateTo']) : '';

        $statusOptions = array(
            '' => 'All Statuses',
            'CREATED' => 'Created',
            'SENT' => 'Sent',
            'ACCEPTED' => 'Accepted',
            'DECLINED' => 'Declined',
            'EXPIRED' => 'Expired',
            'CANCELED' => 'Canceled'
        );

        $this->_template->assign('active', $this);
        $this->_template->assign('dataGrid', $dataGrid);
        $this->_template->assign('sessionCookie', $_SESSION['CATS']->getCookie());
        $this->_template->assign('statusFilter', $status);
        $this->_template->assign('expiringFilter', $expiring);
        $this->_template->assign('searchFilter', $search);
        $this->_template->assign('needsDeletionFilter', $needsDeletion);
        $this->_template->assign('candidateIDFilter', $candidateID);
        $this->_template->assign('dateFromFilter', $dateFrom);
        $this->_template->assign('dateToFilter', $dateTo);
        $this->_template->assign('statusOptions', $statusOptions);

        $this->_template->display('./modules/gdpr/Requests.tpl');
    }

    private function export()
    {
        if ($this->getUserAccessLevel('settings.administration') < ACCESS_LEVEL_SA)
        {
            CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for GDPR consents.');
            return;
        }

        $format = isset($_GET['exportFormat']) ? strtolower(trim($_GET['exportFormat'])) : 'csv';
        if ($format !== 'csv' && $format !== 'pdf')
        {
            $format = 'csv';
        }

        $db = DatabaseConnection::getInstance();
        $siteID = $_SESSION['CATS']->getSiteID();

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

        if (isset($_GET['expiring']) && trim($_GET['expiring']) !== '')
        {
            $days = (int) trim($_GET['expiring']);
            if ($days > 0)
            {
                $filters[] = sprintf(
                    '(r.expires_at IS NOT NULL AND r.expires_at <= DATE_ADD(NOW(), INTERVAL %s DAY) AND r.expires_at >= NOW())',
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

        if (isset($_GET['candidateID']) && ctype_digit((string) $_GET['candidateID']))
        {
            $filters[] = 'r.candidate_id = ' . $db->makeQueryInteger((int) $_GET['candidateID']);
        }

        if (isset($_GET['dateFrom']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $_GET['dateFrom']))
        {
            $filters[] = 'r.created_at >= ' . $db->makeQueryString($_GET['dateFrom'] . ' 00:00:00');
        }

        if (isset($_GET['dateTo']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $_GET['dateTo']))
        {
            $filters[] = 'r.created_at <= ' . $db->makeQueryString($_GET['dateTo'] . ' 23:59:59');
        }

        $filterSQL = '';
        if (!empty($filters))
        {
            $filterSQL = ' AND ' . implode(' AND ', $filters);
        }

        $sql = sprintf(
            "SELECT
                r.request_id AS requestID,
                r.candidate_id AS candidateID,
                r.status AS status,
                r.created_at AS createdAt,
                r.email_sent_at AS sentAt,
                r.expires_at AS expiresAt,
                r.accepted_at AS acceptedAt,
                r.accepted_ip AS acceptedIP,
                r.accepted_lang AS acceptedLang,
                r.notice_version AS noticeVersion,
                r.declined_at AS declinedAt,
                r.deleted_at AS deletedAt,
                c.first_name AS firstName,
                c.last_name AS lastName,
                c.email1 AS email1,
                CASE WHEN r.expires_at IS NOT NULL AND r.expires_at <= NOW() AND r.status IN ('CREATED','SENT') THEN 1 ELSE 0 END AS isExpired
            FROM
                candidate_gdpr_requests r
            LEFT JOIN candidate c
                ON c.candidate_id = r.candidate_id
                AND c.site_id = r.site_id
            LEFT JOIN (
                SELECT site_id, candidate_id, MAX(request_id) AS latestRequestID
                FROM candidate_gdpr_requests
                GROUP BY site_id, candidate_id
            ) latest
                ON latest.site_id = r.site_id
                AND latest.candidate_id = r.candidate_id
            WHERE
                r.site_id = %s
            %s
            ORDER BY r.created_at DESC",
            $siteID,
            $filterSQL
        );

        $rows = $db->getAllAssoc($sql);

        if ($format === 'pdf')
        {
            include_once(LEGACY_ROOT . '/lib/fpdf/fpdf.php');

            $pdf = new FPDF();
            $pdf->AddPage();
            $pdf->SetFont('Arial', 'B', 14);
            $pdf->Cell(0, 8, 'GDPR Audit Report', 0, 1);
            $pdf->SetFont('Arial', '', 9);
            $pdf->Cell(0, 6, 'Generated: ' . DateUtility::getAdjustedDate('Y-m-d H:i'), 0, 1);
            $pdf->Ln(2);

            foreach ($rows as $row)
            {
                $status = $row['status'];
                if ($row['isExpired'] == 1 && ($row['status'] == 'CREATED' || $row['status'] == 'SENT'))
                {
                    $status = 'EXPIRED';
                }

                $fullName = trim($row['firstName'] . ' ' . $row['lastName']);
                if ($fullName === '')
                {
                    $fullName = '(Unnamed Candidate)';
                }

                $pdf->SetFont('Arial', 'B', 10);
                $pdf->Cell(0, 6, 'Request #' . $row['requestID'] . ' - ' . $fullName, 0, 1);
                $pdf->SetFont('Arial', '', 9);
                $pdf->MultiCell(0, 5,
                    'Candidate ID: ' . $row['candidateID'] . "\n" .
                    'Email: ' . ($row['email1'] !== '' ? $row['email1'] : '--') . "\n" .
                    'Status: ' . $status . "\n" .
                    'Created: ' . ($row['createdAt'] !== null ? $row['createdAt'] : '--') . "\n" .
                    'Sent: ' . ($row['sentAt'] !== null ? $row['sentAt'] : '--') . "\n" .
                    'Expires: ' . ($row['expiresAt'] !== null ? $row['expiresAt'] : '--') . "\n" .
                    'Accepted: ' . ($row['acceptedAt'] !== null ? $row['acceptedAt'] : '--') . "\n" .
                    'Accepted IP: ' . ($row['acceptedIP'] !== null ? $row['acceptedIP'] : '--') . "\n" .
                    'Language: ' . ($row['acceptedLang'] !== null ? $row['acceptedLang'] : '--') . "\n" .
                    'Notice Hash: ' . ($row['noticeVersion'] !== null ? $row['noticeVersion'] : '--') . "\n" .
                    'Declined: ' . ($row['declinedAt'] !== null ? $row['declinedAt'] : '--') . "\n" .
                    'Deleted: ' . ($row['deletedAt'] !== null ? $row['deletedAt'] : '--'),
                    0
                );
                $pdf->Ln(2);
            }

            $pdf->Output('D', 'gdpr_audit_report.pdf');
            exit;
        }

        $filename = 'gdpr_audit_report.csv';
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Content-Type: text/x-csv; name=' . $filename . '; charset=utf-8');

        $out = fopen('php://output', 'w');
        fputcsv($out, array(
            'Request ID',
            'Candidate ID',
            'Candidate Name',
            'Email',
            'Status',
            'Created',
            'Sent',
            'Expires',
            'Accepted',
            'Accepted IP',
            'Language',
            'Notice Hash',
            'Declined',
            'Deleted'
        ));

        foreach ($rows as $row)
        {
            $status = $row['status'];
            if ($row['isExpired'] == 1 && ($row['status'] == 'CREATED' || $row['status'] == 'SENT'))
            {
                $status = 'EXPIRED';
            }

            $fullName = trim($row['firstName'] . ' ' . $row['lastName']);
            if ($fullName === '')
            {
                $fullName = '(Unnamed Candidate)';
            }

            fputcsv($out, array(
                $row['requestID'],
                $row['candidateID'],
                $fullName,
                $row['email1'],
                $status,
                $row['createdAt'],
                $row['sentAt'],
                $row['expiresAt'],
                $row['acceptedAt'],
                $row['acceptedIP'],
                $row['acceptedLang'],
                $row['noticeVersion'],
                $row['declinedAt'],
                $row['deletedAt']
            ));
        }

        fclose($out);
        exit;
    }
}

?>
