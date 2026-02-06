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
        $this->_template->assign('statusOptions', $statusOptions);

        $this->_template->display('./modules/gdpr/Requests.tpl');
    }
}

?>
