<?php
/*
 * OpenCATS
 * UI Interaction Logs Module
 */

class LogsUI extends UserInterface
{
    public function __construct()
    {
        parent::__construct();

        $this->_authenticationRequired = true;
        $this->_moduleDirectory = 'logs';
        $this->_moduleName = 'logs';
        $this->_moduleTabText = 'Logs';
        $this->_subTabs = array();
    }

    public function handleRequest()
    {
        $action = $this->getAction();

        if (!eval(Hooks::get('LOGS_HANDLE_REQUEST'))) return;

        switch ($action)
        {
            case 'view':
            default:
                $this->viewLogs();
                break;
        }
    }

    private function viewLogs()
    {
        $this->_template->assign('active', $this);
        $this->_template->display('./modules/logs/Logs.tpl');
    }
}
