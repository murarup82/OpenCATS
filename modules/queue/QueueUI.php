<?php
/*
 * CATS
 * Queue module
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
 * This module builds an XML file containing public job postings. The
 * exported XML data can be used to submit, en masse, all public job
 * postings to job bulletin sites such as Indeed.com.
 *
 *
 * $Id: QueueUI.php 3600 2007-11-13 18:01:57Z andrew $
 */

include_once(LEGACY_ROOT . '/lib/QueueProcessor.php');

class QueueUI extends UserInterface
{
    public function __construct()
    {
        parent::__construct();

        $this->_authenticationRequired = true;
        $this->_moduleDirectory = 'queue';
        $this->_moduleName = 'queue';
        $this->_moduleTabText = '';
        $this->_subTabs = array();
    }


    public function handleRequest()
    {
        $action = $this->getAction();
        $isModernJSON = $this->isModernJSONRequest();
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_REQUEST));

        switch ($action)
        {
            default:
                if ($isModernJSON)
                {
                    if ($modernPage !== '' && $modernPage !== 'queue-workspace')
                    {
                        $this->respondModernJSON(400, array(
                            'error' => true,
                            'message' => 'Unsupported modern page contract.',
                            'requestedPage' => $modernPage
                        ));
                        return;
                    }

                    $this->renderModernQueueOverviewJSON('queue-workspace');
                }
                break;
        }
    }

    private function renderModernQueueOverviewJSON($modernPage)
    {
        $db = DatabaseConnection::getInstance();
        $baseURL = CATSUtility::getIndexName();

        $queueTableAvailable = false;
        $queueTableRS = $db->getAllAssoc("SHOW TABLES LIKE 'queue'");
        if (!empty($queueTableRS))
        {
            $queueTableAvailable = true;
        }

        $summary = array(
            'totalCount' => 0,
            'pendingCount' => 0,
            'lockedCount' => 0,
            'errorCount' => 0,
            'completedCount' => 0,
            'staleLockedCount' => 0,
            'processorActive' => false,
            'lastRunEpoch' => 0,
            'lastRunLabel' => 'Never'
        );

        $priorityBuckets = array();
        $rows = array();

        if ($queueTableAvailable)
        {
            $summary['pendingCount'] = (int) QueueProcessor::getActiveTasksCount();
            $summary['lockedCount'] = (int) QueueProcessor::getLockedTasksCount();
            $summary['errorCount'] = (int) QueueProcessor::getErrorTasksCount();
            $summary['processorActive'] = (QueueProcessor::isActive() ? true : false);
            $summary['lastRunEpoch'] = (int) QueueProcessor::getLastRunTime();
            if ($summary['lastRunEpoch'] > 0)
            {
                $summary['lastRunLabel'] = date('Y-m-d H:i:s', $summary['lastRunEpoch']);
            }

            $countsRS = $db->getAssoc(
                "SELECT
                    COUNT(*) AS totalCount,
                    COUNT(IF(date_completed IS NOT NULL, 1, NULL)) AS completedCount,
                    COUNT(IF(locked = 1 AND date_timeout <= NOW(), 1, NULL)) AS staleLockedCount
                FROM
                    queue"
            );
            if (!empty($countsRS))
            {
                $summary['totalCount'] = (int) $countsRS['totalCount'];
                $summary['completedCount'] = (int) $countsRS['completedCount'];
                $summary['staleLockedCount'] = (int) $countsRS['staleLockedCount'];
            }

            $priorityRS = $db->getAllAssoc(
                "SELECT
                    priority,
                    COUNT(*) AS queueCount
                FROM
                    queue
                GROUP BY
                    priority
                ORDER BY
                    priority DESC"
            );
            foreach ($priorityRS as $row)
            {
                $priorityBuckets[] = array(
                    'priority' => (int) $row['priority'],
                    'count' => (int) $row['queueCount']
                );
            }

            $queueRS = $db->getAllAssoc(
                "SELECT
                    queue_id AS queueID,
                    site_id AS siteID,
                    task,
                    args,
                    priority,
                    DATE_FORMAT(date_created, '%Y-%m-%d %H:%i:%s') AS dateCreated,
                    DATE_FORMAT(date_timeout, '%Y-%m-%d %H:%i:%s') AS dateTimeout,
                    DATE_FORMAT(date_completed, '%Y-%m-%d %H:%i:%s') AS dateCompleted,
                    locked,
                    error,
                    response
                FROM
                    queue
                ORDER BY
                    queue_id DESC
                LIMIT
                    150"
            );

            foreach ($queueRS as $row)
            {
                $errorCode = (int) $row['error'];
                $locked = ((int) $row['locked'] === 1);
                $completed = (isset($row['dateCompleted']) && $row['dateCompleted'] !== null && trim($row['dateCompleted']) !== '');
                $state = 'pending';
                if ($errorCode === 1)
                {
                    $state = 'error';
                }
                else if ($locked)
                {
                    $state = 'locked';
                }
                else if ($completed)
                {
                    $state = 'completed';
                }

                $argsRaw = (isset($row['args']) ? (string) $row['args'] : '');
                $argsPreview = trim($argsRaw);
                if (strlen($argsPreview) > 160)
                {
                    $argsPreview = substr($argsPreview, 0, 157) . '...';
                }

                $responseRaw = (isset($row['response']) ? (string) $row['response'] : '');
                $responsePreview = trim($responseRaw);
                if (strlen($responsePreview) > 200)
                {
                    $responsePreview = substr($responsePreview, 0, 197) . '...';
                }

                $rows[] = array(
                    'queueID' => (int) $row['queueID'],
                    'siteID' => (int) $row['siteID'],
                    'task' => (isset($row['task']) ? (string) $row['task'] : ''),
                    'argsPreview' => $argsPreview,
                    'priority' => (int) $row['priority'],
                    'dateCreated' => (isset($row['dateCreated']) ? (string) $row['dateCreated'] : ''),
                    'dateTimeout' => (isset($row['dateTimeout']) ? (string) $row['dateTimeout'] : ''),
                    'dateCompleted' => (isset($row['dateCompleted']) ? (string) $row['dateCompleted'] : ''),
                    'locked' => $locked,
                    'error' => $errorCode,
                    'state' => $state,
                    'responsePreview' => $responsePreview
                );
            }
        }

        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'queue.overview.v1',
                'modernPage' => $modernPage
            ),
            'state' => array(
                'queueTableAvailable' => $queueTableAvailable
            ),
            'summary' => $summary,
            'charts' => array(
                'priorityBuckets' => $priorityBuckets
            ),
            'actions' => array(
                'legacyURL' => sprintf('%s?m=queue&ui=legacy', $baseURL),
                'refreshURL' => sprintf('%s?m=queue&ui=modern', $baseURL)
            ),
            'rows' => $rows
        );

        $this->respondModernJSON(200, $payload);
    }

    private function isModernJSONRequest()
    {
        return (strtolower($this->getTrimmedInput('format', $_REQUEST)) === 'modern-json');
    }

    private function respondModernJSON($statusCode, $payload)
    {
        $statusCode = (int) $statusCode;
        if ($statusCode <= 0)
        {
            $statusCode = 200;
        }

        if (!headers_sent())
        {
            if (function_exists('http_response_code'))
            {
                http_response_code($statusCode);
            }
            else
            {
                header(sprintf('HTTP/1.1 %d', $statusCode));
            }
            header('Content-Type: application/json; charset=' . AJAX_ENCODING);
            header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        }

        echo json_encode($payload);
    }
}

?>
