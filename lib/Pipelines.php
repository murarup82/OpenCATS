<?php
/**
 * CATS
 * Pipelines Library
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
 * @package    CATS
 * @subpackage Library
 * @copyright Copyright (C) 2005 - 2007 Cognizo Technologies, Inc.
 * @version    $Id: Pipelines.php 3593 2007-11-13 17:36:57Z andrew $
 */

include_once(LEGACY_ROOT . '/lib/History.php');

/**
 *	Pipelines Library
 *	@package    CATS
 *	@subpackage Library
 */
class Pipelines
{
    private $_db;
    private $_siteID;
    private $_lastErrorMessage;


    public function __construct($siteID)
    {
        $this->_siteID = $siteID;
        $this->_db = DatabaseConnection::getInstance();
        $this->_lastErrorMessage = '';
    }

    public function getLastErrorMessage()
    {
        return $this->_lastErrorMessage;
    }

    private function setLastErrorMessage($message)
    {
        $this->_lastErrorMessage = $message;
    }

    public function hasEverBeenHiredForJobOrder($candidateID, $jobOrderID)
    {
        $sql = sprintf(
            "SELECT
                candidate_joborder_status_history_id AS historyID
            FROM
                candidate_joborder_status_history
            WHERE
                candidate_id = %s
            AND
                joborder_id = %s
            AND
                status_to = %s
            AND
                site_id = %s
            LIMIT 1",
            $this->_db->makeQueryInteger($candidateID),
            $this->_db->makeQueryInteger($jobOrderID),
            $this->_db->makeQueryInteger(PIPELINE_STATUS_HIRED),
            $this->_siteID
        );
        $rs = $this->_db->getAssoc($sql);
        if (!empty($rs))
        {
            return true;
        }

        $sql = sprintf(
            "SELECT
                candidate_joborder_id AS candidateJobOrderID
            FROM
                candidate_joborder
            WHERE
                candidate_id = %s
            AND
                joborder_id = %s
            AND
                status = %s
            AND
                site_id = %s
            LIMIT 1",
            $this->_db->makeQueryInteger($candidateID),
            $this->_db->makeQueryInteger($jobOrderID),
            $this->_db->makeQueryInteger(PIPELINE_STATUS_HIRED),
            $this->_siteID
        );
        $rs = $this->_db->getAssoc($sql);

        return !empty($rs);
    }

    private function normalizeStatusLabel($statusID, $label)
    {
        $map = array(
            PIPELINE_STATUS_ALLOCATED => 'Allocated',
            PIPELINE_STATUS_DELIVERY_VALIDATED => 'Delivery Validated',
            PIPELINE_STATUS_PROPOSED_TO_CUSTOMER => 'Proposed to Customer',
            PIPELINE_STATUS_CUSTOMER_INTERVIEW => 'Customer Interview',
            PIPELINE_STATUS_CUSTOMER_APPROVED => 'Customer Approved',
            PIPELINE_STATUS_AVEL_APPROVED => 'Avel Approved',
            PIPELINE_STATUS_OFFER_NEGOTIATION => 'Offer Negotiation',
            PIPELINE_STATUS_OFFER_ACCEPTED => 'Offer Accepted',
            PIPELINE_STATUS_HIRED => 'Hired',
            PIPELINE_STATUS_REJECTED => 'Rejected'
        );

        if (isset($map[$statusID]))
        {
            return $map[$statusID];
        }

        return $label;
    }


    /**
     * Adds a candidate to the pipeline for a job order.
     *
     * @param integer job order ID
     * @param integer candidate ID
     * @return true on success; false otherwise.
     */
    public function add($candidateID, $jobOrderID, $userID = 0)
    {
        $this->setLastErrorMessage('');

        if ($this->hasEverBeenHiredForJobOrder($candidateID, $jobOrderID))
        {
            $this->setLastErrorMessage(
                'This candidate has already been hired for this job order and cannot be added again.'
            );
            return false;
        }

        $sql = sprintf(
            "SELECT
                candidate_joborder_id AS candidateJobOrderID,
                is_active AS isActive
            FROM
                candidate_joborder
            WHERE
                candidate_id = %s
            AND
                joborder_id = %s
            AND
                site_id = %s",
            $this->_db->makeQueryInteger($candidateID),
            $this->_db->makeQueryInteger($jobOrderID),
            $this->_siteID
        );
        $rs = $this->_db->getAssoc($sql);

        if (!empty($rs))
        {
            if ((int) $rs['isActive'] === 0)
            {
                $sql = sprintf(
                    "UPDATE
                        candidate_joborder
                    SET
                        status = %s,
                        is_active = 1,
                        closed_at = NULL,
                        closed_by = NULL,
                        added_by = %s,
                        date_modified = NOW()
                    WHERE
                        candidate_joborder_id = %s
                    AND
                        site_id = %s",
                    $this->_db->makeQueryInteger(PIPELINE_STATUS_ALLOCATED),
                    $this->_db->makeQueryInteger($userID),
                    $this->_db->makeQueryInteger($rs['candidateJobOrderID']),
                    $this->_siteID
                );
                $queryResult = $this->_db->query($sql);
                if (!$queryResult)
                {
                    $this->setLastErrorMessage('Failed to reopen candidate in pipeline.');
                    return false;
                }

                $this->addStatusHistory(
                    $candidateID,
                    $jobOrderID,
                    PIPELINE_STATUS_ALLOCATED,
                    PIPELINE_STATUS_NOSTATUS,
                    'System: allocated on job association',
                    1,
                    null,
                    $userID
                );

                return true;
            }

            /* Candidate already exists in the pipeline. */
            $this->setLastErrorMessage('Candidate already exists in the pipeline for this job order.');
            return false;
        }

        $extraFields = '';
        $extraValues = '';

        if (!eval(Hooks::get('PIPELINES_ADD_SQL'))) return;

        $sql = sprintf(
            "INSERT INTO candidate_joborder (
                site_id,
                joborder_id,
                candidate_id,
                status,
                added_by,
                date_created,
                date_modified%s
            )
            VALUES (
                %s,
                %s,
                %s,
                %s,
                %s,
                NOW(),
                NOW()%s
            )",
            $extraFields,
            $this->_siteID,
            $this->_db->makeQueryInteger($jobOrderID),
            $this->_db->makeQueryInteger($candidateID),
            $this->_db->makeQueryInteger(PIPELINE_STATUS_ALLOCATED),
            $this->_db->makeQueryInteger($userID),
            $extraValues
        );

        $queryResult = $this->_db->query($sql);
        if (!$queryResult)
        {
            $this->setLastErrorMessage('Failed to add candidate to job order.');
            return false;
        }

        $this->addStatusHistory(
            $candidateID,
            $jobOrderID,
            PIPELINE_STATUS_ALLOCATED,
            PIPELINE_STATUS_NOSTATUS,
            'System: allocated on job association',
            1,
            null,
            $userID
        );

        return true;
    }

    /**
     * Removes a candidate from the pipeline for a job order.
     *
     * @param integer candidate ID
     * @param integer job order ID
     * @return void
     */
    public function remove($candidateID, $jobOrderID, $userID = 0,
                           $commentText = '')
    {
        $sql = sprintf(
            "SELECT
                candidate_joborder_id AS candidateJobOrderID,
                status AS statusID
            FROM
                candidate_joborder
            WHERE
                joborder_id = %s
            AND
                candidate_id = %s
            AND
                site_id = %s",
            $this->_db->makeQueryInteger($jobOrderID),
            $this->_db->makeQueryInteger($candidateID),
            $this->_siteID
        );
        $rs = $this->_db->getAssoc($sql);
        if (empty($rs))
        {
            return;
        }

        $candidateJobOrderID = $rs['candidateJobOrderID'];
        $statusFromID = (int) $rs['statusID'];
        $statusToID = PIPELINE_STATUS_REJECTED;
        $rejectionReasonOther = null;
        $rejectionReasonID = $this->getRejectionReasonIdByLabel('OTHER REASONS / NOT MENTIONED');
        if ($rejectionReasonID <= 0)
        {
            $rejectionReasonOther = 'OTHER REASONS / NOT MENTIONED';
        }

        $sql = sprintf(
            "UPDATE
                candidate_joborder
            SET
                status = %s,
                is_active = 0,
                closed_at = NOW(),
                closed_by = %s,
                date_modified = NOW()
            WHERE
                candidate_joborder_id = %s
            AND
                site_id = %s",
            $this->_db->makeQueryInteger($statusToID),
            $this->_db->makeQueryInteger($userID),
            $this->_db->makeQueryInteger($candidateJobOrderID),
            $this->_siteID
        );
        $this->_db->query($sql);

        $historyID = $this->addStatusHistory(
            $candidateID,
            $jobOrderID,
            $statusToID,
            $statusFromID,
            $commentText,
            0,
            $rejectionReasonOther,
            $userID
        );
        if ($historyID > 0 && $rejectionReasonID > 0)
        {
            $this->addStatusHistoryRejectionReasons($historyID, array($rejectionReasonID));
        }

        $history = new History($this->_siteID);
        $history->storeHistoryData(
            DATA_ITEM_CANDIDATE,
            $candidateID,
            'PIPELINE',
            $jobOrderID,
            '(CLOSE)',
            '(USER) closed candidate pipeline entry for job order ' . $jobOrderID . '.'
        );
        $history->storeHistoryData(
            DATA_ITEM_JOBORDER,
            $jobOrderID,
            'PIPELINE',
            $candidateID,
            '(CLOSE)',
            '(USER) closed job order pipeline entry for candidate ' . $candidateID . '.'
        );
    }

    /**
     * Returns a single pipeline row.
     *
     * @param integer candidate ID
     * @param integer job order ID
     * @return array pipeline data
     */
    public function get($candidateID, $jobOrderID)
    {
        $sql = sprintf(
            "SELECT
                candidate_joborder.candidate_joborder_id as candidateJobOrderID,
                company.company_id AS companyID,
                company.name AS companyName,
                joborder.joborder_id AS jobOrderID,
                joborder.title AS title,
                joborder.type AS type,
                joborder.duration AS duration,
                joborder.rate_max AS maxRate,
                joborder.status AS jobOrderStatus,
                joborder.salary AS salary,
                joborder.is_hot AS isHot,
                joborder.openings AS openings,
                joborder.openings_available AS openingsAvailable,
                DATE_FORMAT(
                    joborder.start_date, '%%m-%%d-%%y'
                ) AS start_date,
                DATE_FORMAT(
                    joborder.date_created, '%%m-%%d-%%y'
                ) AS dateCreated,
                candidate.candidate_id AS candidateID,
                candidate.email1 AS candidateEmail,
                candidate_joborder_status.candidate_joborder_status_id AS statusID,
                candidate_joborder_status.short_description AS status,
                owner_user.first_name AS ownerFirstName,
                owner_user.last_name AS ownerLastName
            FROM
                candidate_joborder
            LEFT JOIN candidate
                ON candidate_joborder.candidate_id = candidate.candidate_id
            LEFT JOIN joborder
                ON candidate_joborder.joborder_id = joborder.joborder_id
            LEFT JOIN company
                ON company.company_id = joborder.company_id
            LEFT JOIN user AS owner_user
                ON joborder.owner = owner_user.user_id
            LEFT JOIN candidate_joborder_status
                ON candidate_joborder.status = candidate_joborder_status.candidate_joborder_status_id
            WHERE
                candidate.candidate_id = %s
            AND
                joborder.joborder_id = %s
            AND
                candidate.site_id = %s
            AND
                joborder.site_id = %s
            AND
                company.site_id = %s",
            $this->_db->makeQueryInteger($candidateID),
            $this->_db->makeQueryInteger($jobOrderID),
            $this->_siteID,
            $this->_siteID,
            $this->_siteID
        );

        $rs = $this->_db->getAssoc($sql);
        if (!empty($rs))
        {
            $rs['status'] = $this->normalizeStatusLabel($rs['statusID'], $rs['status']);
        }

        return $rs;
    }

    /**
     * Returns a pipeline entry's candidate-joborder ID from the specified
     * candidate ID and job order ID; -1 if not found.
     *
     * @param integer candidate ID
     * @param integer job order ID
     * @return integer candidate-joborder ID or -1 if not found
     */
    public function getCandidateJobOrderID($candidateID, $jobOrderID)
    {
        $sql = sprintf(
            "SELECT
                candidate_joborder_id AS candidateJobOrderID
            FROM
                candidate_joborder
            WHERE
                candidate_id = %s
            AND
                joborder_id = %s
            AND
                site_id = %s",
            $this->_db->makeQueryInteger($candidateID),
            $this->_db->makeQueryInteger($jobOrderID),
            $this->_siteID
        );
        $rs = $this->_db->getAssoc($sql);

        if (empty($rs))
        {
            return -1;
        }

        return (int) $rs['candidateJobOrderID'];
    }

    // FIXME: Document me.
    public function setStatus($candidateID, $jobOrderID, $statusID,
                              $emailAddress, $emailText, $userID = 0,
                              $commentText = '', $rejectionReasonOther = null,
                              $commentIsSystem = 0, $enteredBy = null,
                              $historyDate = null)
    {
        /* Get existing status. */
        $sql = sprintf(
            "SELECT
                status AS oldStatusID,
                candidate_joborder_id AS candidateJobOrderID
            FROM
                candidate_joborder
            WHERE
                joborder_id = %s
            AND
                candidate_id = %s
            AND
                site_id = %s",
            $this->_db->makeQueryInteger($jobOrderID),
            $this->_db->makeQueryInteger($candidateID),
            $this->_siteID
        );
        $rs = $this->_db->getAssoc($sql);

        if (empty($rs))
        {
            return;
        }

        $candidateJobOrderID = $rs['candidateJobOrderID'];
        $oldStatusID         = $rs['oldStatusID'];

        if ($enteredBy === null)
        {
            $enteredBy = $userID;
        }

        if ($oldStatusID == $statusID)
        {
            /* No need to update the database and scew the history if there is
             * no actual change.
             */
            return;
        }

        /* Change status. */
        $sql = sprintf(
            "UPDATE
                candidate_joborder
            SET
                status        = %s,
                date_modified = NOW()
            WHERE
                candidate_joborder_id = %s
            AND
                site_id = %s",
            $this->_db->makeQueryInteger($statusID),
            $this->_db->makeQueryInteger($candidateJobOrderID),
            $this->_siteID
        );
        $this->_db->query($sql);

        if ($statusID == PIPELINE_STATUS_REJECTED || $statusID == PIPELINE_STATUS_HIRED)
        {
            $sql = sprintf(
                "UPDATE
                    candidate_joborder
                SET
                    is_active = 0,
                    closed_at = NOW(),
                    closed_by = %s
                WHERE
                    candidate_joborder_id = %s
                AND
                    site_id = %s",
                $this->_db->makeQueryInteger($userID),
                $this->_db->makeQueryInteger($candidateJobOrderID),
                $this->_siteID
            );
            $this->_db->query($sql);
        }
        else
        {
            $sql = sprintf(
                "UPDATE
                    candidate_joborder
                SET
                    is_active = 1,
                    closed_at = NULL,
                    closed_by = NULL
                WHERE
                    candidate_joborder_id = %s
                AND
                    site_id = %s",
                $this->_db->makeQueryInteger($candidateJobOrderID),
                $this->_siteID
            );
            $this->_db->query($sql);
        }

        /* Add history. */
        $historyID = $this->addStatusHistory(
            $candidateID,
            $jobOrderID,
            $statusID,
            $oldStatusID,
            $commentText,
            $commentIsSystem,
            $rejectionReasonOther,
            $enteredBy,
            $historyDate
        );

        /* Add auditing history. */
        $historyDescription = '(USER) changed pipeline status of candidate '
            . $candidateID . ' for job order ' . $jobOrderID . '.';
        $history = new History($this->_siteID);
        $history->storeHistoryData(
            DATA_ITEM_PIPELINE,
            $candidateJobOrderID,
            'PIPELINE',
            $oldStatusID,
            $statusID,
            $historyDescription
        );

        if (!empty($emailAddress))
        {
            /* Send e-mail notification. */
            //FIXME: Make subject configurable.
            $mailer = new Mailer($this->_siteID);
            $mailerStatus = $mailer->sendToOne(
                array($emailAddress, ''),
                CANDIDATE_STATUSCHANGE_SUBJECT,
                $emailText,
                true
            );
        }

        return $historyID;
    }

    // FIXME: Document me.
    public function getStatuses()
    {
        $orderClause = sprintf(
            "FIELD(candidate_joborder_status_id, %s)",
            implode(',', array(
                PIPELINE_STATUS_ALLOCATED,
                PIPELINE_STATUS_DELIVERY_VALIDATED,
                PIPELINE_STATUS_PROPOSED_TO_CUSTOMER,
                PIPELINE_STATUS_CUSTOMER_INTERVIEW,
                PIPELINE_STATUS_CUSTOMER_APPROVED,
                PIPELINE_STATUS_AVEL_APPROVED,
                PIPELINE_STATUS_OFFER_NEGOTIATION,
                PIPELINE_STATUS_OFFER_ACCEPTED,
                PIPELINE_STATUS_HIRED,
                PIPELINE_STATUS_REJECTED
            ))
        );

        $sql = sprintf(
            "SELECT
                candidate_joborder_status_id AS statusID,
                short_description AS status,
                can_be_scheduled AS canBeScheduled,
                triggers_email AS triggersEmail
            FROM
                candidate_joborder_status
            WHERE
                is_enabled = 1
            AND
                candidate_joborder_status_id IN (%s)
            ORDER BY
                %s",
            implode(',', array(
                PIPELINE_STATUS_ALLOCATED,
                PIPELINE_STATUS_DELIVERY_VALIDATED,
                PIPELINE_STATUS_PROPOSED_TO_CUSTOMER,
                PIPELINE_STATUS_CUSTOMER_INTERVIEW,
                PIPELINE_STATUS_CUSTOMER_APPROVED,
                PIPELINE_STATUS_AVEL_APPROVED,
                PIPELINE_STATUS_OFFER_NEGOTIATION,
                PIPELINE_STATUS_OFFER_ACCEPTED,
                PIPELINE_STATUS_HIRED,
                PIPELINE_STATUS_REJECTED
            )),
            $orderClause
        );

        $rs = $this->_db->getAllAssoc($sql);
        foreach ($rs as $index => $row)
        {
            $rs[$index]['status'] = $this->normalizeStatusLabel($row['statusID'], $row['status']);
        }

        return $rs;
    }

    // FIXME: Document me.
    // Throws out No Status.
    public function getStatusesForPicking()
    {
        $orderClause = sprintf(
            "FIELD(candidate_joborder_status_id, %s)",
            implode(',', array(
                PIPELINE_STATUS_ALLOCATED,
                PIPELINE_STATUS_DELIVERY_VALIDATED,
                PIPELINE_STATUS_PROPOSED_TO_CUSTOMER,
                PIPELINE_STATUS_CUSTOMER_INTERVIEW,
                PIPELINE_STATUS_CUSTOMER_APPROVED,
                PIPELINE_STATUS_AVEL_APPROVED,
                PIPELINE_STATUS_OFFER_NEGOTIATION,
                PIPELINE_STATUS_OFFER_ACCEPTED,
                PIPELINE_STATUS_HIRED,
                PIPELINE_STATUS_REJECTED
            ))
        );

        $sql = sprintf(
            "SELECT
                candidate_joborder_status_id AS statusID,
                short_description AS status,
                can_be_scheduled AS canBeScheduled,
                triggers_email AS triggersEmail
            FROM
                candidate_joborder_status
            WHERE
                is_enabled = 1
            AND
                candidate_joborder_status_id IN (%s)
            ORDER BY
                %s",
            implode(',', array(
                PIPELINE_STATUS_ALLOCATED,
                PIPELINE_STATUS_DELIVERY_VALIDATED,
                PIPELINE_STATUS_PROPOSED_TO_CUSTOMER,
                PIPELINE_STATUS_CUSTOMER_INTERVIEW,
                PIPELINE_STATUS_CUSTOMER_APPROVED,
                PIPELINE_STATUS_AVEL_APPROVED,
                PIPELINE_STATUS_OFFER_NEGOTIATION,
                PIPELINE_STATUS_OFFER_ACCEPTED,
                PIPELINE_STATUS_HIRED,
                PIPELINE_STATUS_REJECTED
            )),
            $orderClause
        );

        $rs = $this->_db->getAllAssoc($sql);
        foreach ($rs as $index => $row)
        {
            $rs[$index]['status'] = $this->normalizeStatusLabel($row['statusID'], $row['status']);
        }

        return $rs;
    }

    // FIXME: Document me.
    public function addStatusHistory($candidateID, $jobOrderID, $statusToID,
                                     $statusFromID, $commentText = '',
                                     $commentIsSystem = 0,
                                     $rejectionReasonOther = null,
                                     $enteredBy = null,
                                     $historyDate = null)
    {
        $historyDateSQL = 'NOW()';
        if (!empty($historyDate))
        {
            $historyDateSQL = $this->_db->makeQueryString($historyDate);
        }

        $sql = sprintf(
            "INSERT INTO candidate_joborder_status_history (
                joborder_id,
                candidate_id,
                site_id,
                date,
                status_to,
                status_from,
                comment_text,
                comment_is_system,
                entered_by,
                rejection_reason_other
            )
            VALUES (
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s
            )",
            $this->_db->makeQueryInteger($jobOrderID),
            $this->_db->makeQueryInteger($candidateID),
            $this->_siteID,
            $historyDateSQL,
            $this->_db->makeQueryInteger($statusToID),
            $this->_db->makeQueryInteger($statusFromID),
            $this->_db->makeQueryStringOrNULL($commentText),
            $this->_db->makeQueryInteger($commentIsSystem),
            $this->_db->makeQueryIntegerOrNULL($enteredBy),
            $this->_db->makeQueryStringOrNULL($rejectionReasonOther)
        );

        $queryResult = $this->_db->query($sql);
        if (!$queryResult)
        {
            return -1;
        }

        return $this->_db->getLastInsertID();
    }

    public function addStatusHistoryRejectionReasons($historyID, $reasonIDs)
    {
        if (empty($historyID) || empty($reasonIDs))
        {
            return;
        }

        $reasonIDs = array_unique($reasonIDs);
        $values = array();
        foreach ($reasonIDs as $reasonID)
        {
            $values[] = sprintf(
                "(%s, %s)",
                $this->_db->makeQueryInteger($historyID),
                $this->_db->makeQueryInteger($reasonID)
            );
        }

        if (empty($values))
        {
            return;
        }

        $sql = sprintf(
            "INSERT INTO status_history_rejection_reason (
                status_history_id,
                rejection_reason_id
            )
            VALUES %s",
            implode(', ', $values)
        );
        $this->_db->query($sql);
    }

    private function getRejectionReasonIdByLabel($label)
    {
        $sql = sprintf(
            "SELECT
                rejection_reason_id AS reasonID
            FROM
                rejection_reason
            WHERE
                UPPER(label) = UPPER(%s)
            LIMIT 1",
            $this->_db->makeQueryString($label)
        );
        $rs = $this->_db->getAssoc($sql);
        if (empty($rs))
        {
            return 0;
        }

        return (int) $rs['reasonID'];
    }

    /**
     * Returns a candidate's pipeline.
     *
     * @param integer candidate ID
     * @return array pipeline data
     */
    public function getCandidatePipeline($candidateID, $includeClosed = false)
    {
        $statusFilter = '';
        if (!$includeClosed)
        {
            $statusFilter = 'AND candidate_joborder.is_active = 1';
        }

        $sql = sprintf(
            "SELECT
                company.company_id AS companyID,
                company.name AS companyName,
                joborder.joborder_id AS jobOrderID,
                joborder.title AS title,
                joborder.type AS type,
                joborder.duration AS duration,
                joborder.rate_max AS maxRate,
                joborder.status AS jobOrderStatus,
                joborder.salary AS salary,
                joborder.is_hot AS isHot,
                joborder.client_job_id AS clientJobID,
                DATE_FORMAT(
                    joborder.start_date, '%%m-%%d-%%y'
                ) AS start_date,
                DATE_FORMAT(
                    joborder.date_created, '%%m-%%d-%%y'
                ) AS dateCreated,
                candidate.candidate_id AS candidateID,
                candidate.email1 AS candidateEmail,
                candidate_joborder_status.candidate_joborder_status_id AS statusID,
                candidate_joborder_status.short_description AS status,
                candidate_joborder.candidate_joborder_id AS candidateJobOrderID,
                candidate_joborder.is_active AS isActive,
                candidate_joborder.closed_at AS closedAt,
                candidate_joborder.closed_by AS closedBy,
                candidate_joborder.rating_value AS ratingValue,
                owner_user.first_name AS ownerFirstName,
                owner_user.last_name AS ownerLastName,
                added_user.first_name AS addedByFirstName,
                added_user.last_name AS addedByLastName
            FROM
                candidate_joborder
            INNER JOIN candidate
                ON candidate_joborder.candidate_id = candidate.candidate_id
            INNER JOIN joborder
                ON candidate_joborder.joborder_id = joborder.joborder_id
            INNER JOIN company
                ON company.company_id = joborder.company_id
            LEFT JOIN user AS owner_user
                ON joborder.owner = owner_user.user_id
            LEFT JOIN user AS added_user
                ON candidate_joborder.added_by = added_user.user_id
            INNER JOIN candidate_joborder_status
                ON candidate_joborder.status = candidate_joborder_status.candidate_joborder_status_id
            WHERE
                candidate.candidate_id = %s
            AND
                candidate.site_id = %s
            AND
                joborder.site_id = %s
            AND
                company.site_id = %s
            %s",
            $this->_db->makeQueryInteger($candidateID),
            $this->_siteID,
            $this->_siteID,
            $this->_siteID,
            $statusFilter
        );

        $rs = $this->_db->getAllAssoc($sql);
        foreach ($rs as $index => $row)
        {
            $rs[$index]['status'] = $this->normalizeStatusLabel($row['statusID'], $row['status']);
        }

        return $rs;
    }

    /**
     * Returns a job order's pipeline.
     *
     * @param integer job order ID
     * @return array pipeline data
     */
    public function getJobOrderPipeline($jobOrderID, $orderBy = '',
                                        $includeClosed = false)
    {
        $statusFilter = '';
        if (!$includeClosed)
        {
            $statusFilter = 'AND candidate_joborder.is_active = 1';
        }

        $sql = sprintf(
            "SELECT
                IF(attachment_id, 1, 0) AS attachmentPresent,
                IF(old_candidate_id, 1, 0) AS isDuplicateCandidate,
                candidate.candidate_id AS candidateID,
                candidate.first_name AS firstName,
                candidate.last_name AS lastName,
                candidate.country AS country,
                candidate.email1 AS candidateEmail,
                candidate_joborder.status AS statusID,
                candidate_joborder.status AS jobOrderStatus,
                candidate_joborder.is_active AS isActive,
                candidate_joborder.closed_at AS closedAt,
                candidate_joborder.closed_by AS closedBy,
                candidate.is_hot AS isHotCandidate,
                DATE_FORMAT(
                    candidate_joborder.date_created, '%%m-%%d-%%y'
                ) AS dateCreated,
                UNIX_TIMESTAMP(candidate_joborder.date_created) AS dateCreatedInt,
                candidate_joborder_status.short_description AS status,
                candidate_joborder.candidate_joborder_id AS candidateJobOrderID,
                candidate_joborder.rating_value AS ratingValue,
                owner_user.first_name AS ownerFirstName,
                owner_user.last_name AS ownerLastName,
                IF((
                    SELECT
                        COUNT(*)
                    FROM
                        candidate_joborder_status_history
                    WHERE
                        joborder_id = %s
                    AND
                        candidate_id = candidate.candidate_id
                    AND
                        status_to = %s
                    AND
                        site_id = %s
                ) >= 1, 1, 0) AS submitted,
                added_user.first_name AS addedByFirstName,
                added_user.last_name AS addedByLastName
            FROM
                candidate_joborder
            LEFT JOIN candidate
                ON candidate_joborder.candidate_id = candidate.candidate_id
            LEFT JOIN user AS owner_user
                ON candidate.owner = owner_user.user_id
            LEFT JOIN user AS added_user
                ON candidate_joborder.added_by = added_user.user_id
            LEFT JOIN attachment
                ON candidate.candidate_id = attachment.data_item_id
            LEFT JOIN candidate_joborder_status
                ON candidate_joborder.status = candidate_joborder_status.candidate_joborder_status_id
            LEFT JOIN candidate_duplicates
                ON candidate_duplicates.new_candidate_id = candidate.candidate_id
            WHERE
                candidate_joborder.joborder_id = %s
            AND
                candidate_joborder.site_id = %s
            AND
                candidate.site_id = %s
            %s
            GROUP BY
                candidate_joborder.candidate_id
            %s",
            $this->_db->makeQueryInteger($jobOrderID),
            PIPELINE_STATUS_PROPOSED_TO_CUSTOMER,
            $this->_siteID,
            $this->_db->makeQueryInteger($jobOrderID),
            $this->_siteID,
            $this->_siteID,
            $statusFilter,
            $orderBy
        );

        $rs = $this->_db->getAllAssoc($sql);
        foreach ($rs as $index => $row)
        {
            $rs[$index]['status'] = $this->normalizeStatusLabel($row['statusID'], $row['status']);
        }

        return $rs;
    }

    // FIXME: Document me.
    public function updateRatingValue($candidateJobOrderID, $value)
    {
        $sql = sprintf(
            "UPDATE
                candidate_joborder
            SET
                rating_value = %s
            WHERE
                candidate_joborder.candidate_joborder_id = %s
            AND
                candidate_joborder.site_id = %s",
            $this->_db->makeQueryInteger($value),
            $this->_db->makeQueryInteger($candidateJobOrderID),
            $this->_siteID
        );

        $queryResult = $this->_db->query($sql);
        if (!$queryResult)
        {
            return -1;
        }
    }

    // FIXME: Document me.
    public function getRatingValue($candidateJobOrderID)
    {
        $sql = sprintf(
            "SELECT
                rating_value AS ratingValue
            FROM
                candidate_joborder
            WHERE
                candidate_joborder_id = %s
            AND
                site_id = %s",
            $this->_db->makeQueryInteger($candidateJobOrderID),
            $this->_siteID
        );
        $rs = $this->_db->getAssoc($sql);

        if (!isset($rs['ratingValue']) || empty($rs['ratingValue']))
        {
            return 0;
        }

        return $rs['ratingValue'];
    }

    //FIXME: Document me.
    public function getPipelineDetails($candidateJobOrderID)
    {
        $sql = sprintf(
            "SELECT
                candidate.first_name AS firstName,
                candidate.last_name AS lastName,
                candidate.email1 AS candidateEmail,
                candidate_joborder.status AS jobOrderStatus,
                activity.notes AS notes,
                DATE_FORMAT(
                    candidate_joborder.date_created, '%%m-%%d-%%y'
                ) AS dateCreated,
                candidate_joborder.candidate_joborder_id AS candidateJobOrderID,
                candidate_joborder.rating_value AS ratingValue,
                entered_by_user.first_name AS enteredByFirstName,
                entered_by_user.last_name AS enteredByLastName,
                DATE_FORMAT(activity.date_modified, '%%m-%%d-%%y (%%h:%%i:%%s %%p)') AS dateModified
            FROM
                candidate_joborder
            LEFT JOIN candidate
                ON candidate_joborder.candidate_id = candidate.candidate_id
            INNER JOIN activity
                ON activity.joborder_id = candidate_joborder.joborder_id
            LEFT JOIN user AS entered_by_user
                ON entered_by_user.user_id = activity.entered_by
            WHERE
                candidate_joborder.candidate_joborder_id = %s
            AND
                activity.data_item_type = %s
            AND
                activity.data_item_id = candidate_joborder.candidate_id
            AND
                candidate_joborder.site_id = %s
            ",
            $this->_db->makeQueryInteger($candidateJobOrderID),
            DATA_ITEM_CANDIDATE,
            $this->_siteID
        );

        return $this->_db->getAllAssoc($sql);
    }

    public function getStatusHistory($candidateJobOrderID)
    {
        $sql = sprintf(
            "SELECT
                candidate_joborder_status_history.candidate_joborder_status_history_id AS historyID,
                candidate_joborder_status_history.date AS dateRaw,
                DATE_FORMAT(candidate_joborder_status_history.date, '%%Y-%%m-%%d %%H:%%i:%%s') AS dateEdit,
                DATE_FORMAT(candidate_joborder_status_history.date, '%%m-%%d-%%y (%%h:%%i:%%s %%p)') AS dateDisplay,
                candidate_joborder_status_history.status_from AS statusFromID,
                candidate_joborder_status_history.status_to AS statusToID,
                status_from.short_description AS statusFrom,
                status_to.short_description AS statusTo,
                candidate_joborder_status_history.comment_text AS commentText,
                candidate_joborder_status_history.comment_is_system AS commentIsSystem,
                candidate_joborder_status_history.rejection_reason_other AS rejectionReasonOther,
                GROUP_CONCAT(DISTINCT rejection_reason.label ORDER BY rejection_reason.label SEPARATOR ', ') AS rejectionReasons,
                candidate_joborder_status_history.entered_by AS enteredByID,
                entered_by_user.first_name AS enteredByFirstName,
                entered_by_user.last_name AS enteredByLastName,
                candidate_joborder_status_history.edited_at AS editedAt,
                DATE_FORMAT(candidate_joborder_status_history.edited_at, '%%m-%%d-%%y (%%h:%%i:%%s %%p)') AS editedAtDisplay,
                candidate_joborder_status_history.edit_note AS editNote,
                edited_by_user.first_name AS editedByFirstName,
                edited_by_user.last_name AS editedByLastName
            FROM
                candidate_joborder_status_history
            INNER JOIN candidate_joborder
                ON candidate_joborder.candidate_id = candidate_joborder_status_history.candidate_id
                AND candidate_joborder.joborder_id = candidate_joborder_status_history.joborder_id
                AND candidate_joborder.site_id = candidate_joborder_status_history.site_id
            LEFT JOIN user AS entered_by_user
                ON entered_by_user.user_id = candidate_joborder_status_history.entered_by
            LEFT JOIN candidate_joborder_status AS status_from
                ON status_from.candidate_joborder_status_id = candidate_joborder_status_history.status_from
            LEFT JOIN candidate_joborder_status AS status_to
                ON status_to.candidate_joborder_status_id = candidate_joborder_status_history.status_to
            LEFT JOIN status_history_rejection_reason
                ON status_history_rejection_reason.status_history_id = candidate_joborder_status_history.candidate_joborder_status_history_id
            LEFT JOIN rejection_reason
                ON rejection_reason.rejection_reason_id = status_history_rejection_reason.rejection_reason_id
            LEFT JOIN user AS edited_by_user
                ON edited_by_user.user_id = candidate_joborder_status_history.edited_by
            WHERE
                candidate_joborder.candidate_joborder_id = %s
            AND
                candidate_joborder_status_history.site_id = %s
            GROUP BY
                candidate_joborder_status_history.candidate_joborder_status_history_id
            ORDER BY
                candidate_joborder_status_history.date ASC,
                candidate_joborder_status_history.candidate_joborder_status_history_id ASC",
            $this->_db->makeQueryInteger($candidateJobOrderID),
            $this->_siteID
        );

        $rs = $this->_db->getAllAssoc($sql);
        foreach ($rs as $index => $row)
        {
            $rs[$index]['statusFrom'] = $this->normalizeStatusLabel($row['statusFromID'], $row['statusFrom']);
            $rs[$index]['statusTo'] = $this->normalizeStatusLabel($row['statusToID'], $row['statusTo']);
        }

        return $rs;
    }

    public function purgeHistory($candidateJobOrderID)
    {
        $sql = sprintf(
            "SELECT
                candidate_id AS candidateID,
                joborder_id AS jobOrderID
            FROM
                candidate_joborder
            WHERE
                candidate_joborder_id = %s
            AND
                site_id = %s",
            $this->_db->makeQueryInteger($candidateJobOrderID),
            $this->_siteID
        );
        $rs = $this->_db->getAssoc($sql);
        if (empty($rs))
        {
            return false;
        }

        $candidateID = $rs['candidateID'];
        $jobOrderID = $rs['jobOrderID'];

        $sql = sprintf(
            "DELETE status_history_rejection_reason
            FROM
                status_history_rejection_reason
            INNER JOIN candidate_joborder_status_history
                ON candidate_joborder_status_history.candidate_joborder_status_history_id = status_history_rejection_reason.status_history_id
            WHERE
                candidate_joborder_status_history.candidate_id = %s
            AND
                candidate_joborder_status_history.joborder_id = %s
            AND
                candidate_joborder_status_history.site_id = %s",
            $this->_db->makeQueryInteger($candidateID),
            $this->_db->makeQueryInteger($jobOrderID),
            $this->_siteID
        );
        $this->_db->query($sql);

        $sql = sprintf(
            "DELETE FROM candidate_joborder_status_history
            WHERE
                candidate_id = %s
            AND
                joborder_id = %s
            AND
                site_id = %s",
            $this->_db->makeQueryInteger($candidateID),
            $this->_db->makeQueryInteger($jobOrderID),
            $this->_siteID
        );
        $this->_db->query($sql);

        $sql = sprintf(
            "DELETE FROM activity
            WHERE
                data_item_type = %s
            AND
                data_item_id = %s
            AND
                joborder_id = %s
            AND
                site_id = %s",
            $this->_db->makeQueryInteger(DATA_ITEM_CANDIDATE),
            $this->_db->makeQueryInteger($candidateID),
            $this->_db->makeQueryInteger($jobOrderID),
            $this->_siteID
        );
        $this->_db->query($sql);

        $sql = sprintf(
            "DELETE FROM history
            WHERE
                data_item_type = %s
            AND
                data_item_id = %s
            AND
                site_id = %s",
            $this->_db->makeQueryInteger(DATA_ITEM_PIPELINE),
            $this->_db->makeQueryInteger($candidateJobOrderID),
            $this->_siteID
        );
        $this->_db->query($sql);

        $candidateHistoryDescription = '(USER) closed candidate pipeline entry for job order ' . $jobOrderID . '.';
        $sql = sprintf(
            "DELETE FROM history
            WHERE
                data_item_type = %s
            AND
                data_item_id = %s
            AND
                site_id = %s
            AND
                description = %s",
            $this->_db->makeQueryInteger(DATA_ITEM_CANDIDATE),
            $this->_db->makeQueryInteger($candidateID),
            $this->_siteID,
            $this->_db->makeQueryString($candidateHistoryDescription)
        );
        $this->_db->query($sql);

        $jobOrderHistoryDescription = '(USER) closed job order pipeline entry for candidate ' . $candidateID . '.';
        $sql = sprintf(
            "DELETE FROM history
            WHERE
                data_item_type = %s
            AND
                data_item_id = %s
            AND
                site_id = %s
            AND
                description = %s",
            $this->_db->makeQueryInteger(DATA_ITEM_JOBORDER),
            $this->_db->makeQueryInteger($jobOrderID),
            $this->_siteID,
            $this->_db->makeQueryString($jobOrderHistoryDescription)
        );
        $this->_db->query($sql);

        $sql = sprintf(
            "DELETE FROM candidate_joborder
            WHERE
                candidate_joborder_id = %s
            AND
                site_id = %s",
            $this->_db->makeQueryInteger($candidateJobOrderID),
            $this->_siteID
        );
        $this->_db->query($sql);

        return true;
    }

    public function updateStatusHistoryDate($historyID, $newDate, $editedBy, $editNote)
    {
        $sql = sprintf(
            "UPDATE
                candidate_joborder_status_history
            SET
                date = %s,
                edited_at = NOW(),
                edited_by = %s,
                edit_note = %s
            WHERE
                candidate_joborder_status_history_id = %s
            AND
                site_id = %s",
            $this->_db->makeQueryString($newDate),
            $this->_db->makeQueryInteger($editedBy),
            $this->_db->makeQueryString($editNote),
            $this->_db->makeQueryInteger($historyID),
            $this->_siteID
        );

        return $this->_db->query($sql);
    }

}

?>
