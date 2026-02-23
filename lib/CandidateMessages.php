<?php
/*
 * CATS
 * Candidate Messages Library
 */

include_once(LEGACY_ROOT . '/lib/DatabaseConnection.php');

class CandidateMessages
{
    const MESSAGE_MAXLEN = 4000;

    private $_db;
    private $_siteID;
    private $_schemaAvailable;

    public function __construct($siteID)
    {
        $this->_siteID = (int) $siteID;
        $this->_db = DatabaseConnection::getInstance();
        $this->_schemaAvailable = null;
    }

    public function isSchemaAvailable()
    {
        if ($this->_schemaAvailable !== null)
        {
            return $this->_schemaAvailable;
        }

        $requiredTables = array(
            'candidate_message_thread',
            'candidate_message',
            'candidate_message_participant',
            'candidate_message_mention'
        );

        foreach ($requiredTables as $tableName)
        {
            if (!$this->tableExists($tableName))
            {
                $this->_schemaAvailable = false;
                return false;
            }
        }

        $this->_schemaAvailable = true;
        return true;
    }

    public function getMentionableUsers()
    {
        if (!$this->isSchemaAvailable())
        {
            return array();
        }

        $sql = sprintf(
            "SELECT
                user_id AS userID,
                user_name AS userName,
                first_name AS firstName,
                last_name AS lastName
             FROM
                user
             WHERE
                site_id = %s
                AND access_level > %s
             ORDER BY
                last_name ASC,
                first_name ASC",
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger(ACCESS_LEVEL_DISABLED)
        );
        $users = $this->_db->getAllAssoc($sql);

        if (empty($users))
        {
            return array();
        }

        foreach ($users as $index => $user)
        {
            $fullName = trim($user['firstName'] . ' ' . $user['lastName']);
            $users[$index]['fullName'] = $fullName;
        }

        return $users;
    }

    public function extractMentionedUserIDs($body, $excludeUserID = 0)
    {
        $body = (string) $body;
        if ($body === '')
        {
            return array();
        }

        $users = $this->getMentionableUsers();
        if (empty($users))
        {
            return array();
        }

        $mentionedUserIDs = array();
        foreach ($users as $user)
        {
            $userID = (int) $user['userID'];
            if ($userID <= 0 || $userID === (int) $excludeUserID)
            {
                continue;
            }

            $fullName = trim($user['fullName']);
            if ($fullName !== '')
            {
                $fullNamePattern = '/(^|[\s\(\[\{])@' . preg_quote($fullName, '/') .
                    '(?=$|[\s\.,;:!\?\)\]\}])/iu';
                if (preg_match($fullNamePattern, $body))
                {
                    $mentionedUserIDs[$userID] = true;
                    continue;
                }
            }

            $userName = trim($user['userName']);
            if ($userName !== '')
            {
                $userNamePattern = '/(^|[\s\(\[\{])@' . preg_quote($userName, '/') .
                    '(?=$|[\s\.,;:!\?\)\]\}])/iu';
                if (preg_match($userNamePattern, $body))
                {
                    $mentionedUserIDs[$userID] = true;
                }
            }
        }

        return array_keys($mentionedUserIDs);
    }

    public function getThreadByCandidate($candidateID)
    {
        if (!$this->isSchemaAvailable())
        {
            return array();
        }

        $sql = sprintf(
            "SELECT
                t.candidate_message_thread_id AS threadID,
                t.candidate_id AS candidateID,
                t.last_message_id AS lastMessageID,
                t.last_message_by AS lastMessageBy,
                t.last_message_at AS lastMessageAtRaw,
                DATE_FORMAT(t.last_message_at, '%%m-%%d-%%y (%%h:%%i %%p)') AS lastMessageAt,
                c.first_name AS candidateFirstName,
                c.last_name AS candidateLastName
             FROM
                candidate_message_thread t
             LEFT JOIN candidate c
                ON c.candidate_id = t.candidate_id
                AND c.site_id = t.site_id
             WHERE
                t.site_id = %s
                AND t.candidate_id = %s",
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger($candidateID)
        );

        $row = $this->_db->getAssoc($sql);
        if (!$row)
        {
            return array();
        }

        return $row;
    }

    public function getThread($threadID)
    {
        if (!$this->isSchemaAvailable())
        {
            return array();
        }

        $sql = sprintf(
            "SELECT
                t.candidate_message_thread_id AS threadID,
                t.candidate_id AS candidateID,
                t.last_message_id AS lastMessageID,
                t.last_message_by AS lastMessageBy,
                t.last_message_at AS lastMessageAtRaw,
                DATE_FORMAT(t.last_message_at, '%%m-%%d-%%y (%%h:%%i %%p)') AS lastMessageAt,
                c.first_name AS candidateFirstName,
                c.last_name AS candidateLastName
             FROM
                candidate_message_thread t
             LEFT JOIN candidate c
                ON c.candidate_id = t.candidate_id
                AND c.site_id = t.site_id
             WHERE
                t.site_id = %s
                AND t.candidate_message_thread_id = %s",
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger($threadID)
        );

        $row = $this->_db->getAssoc($sql);
        if (!$row)
        {
            return array();
        }

        return $row;
    }

    public function isUserParticipant($threadID, $userID, $includeArchived = false)
    {
        if (!$this->isSchemaAvailable())
        {
            return false;
        }

        if ($includeArchived)
        {
            $archivedCriterion = '';
        }
        else
        {
            $archivedCriterion = 'AND is_archived = 0';
        }

        $sql = sprintf(
            "SELECT
                candidate_message_participant_id AS participantID
             FROM
                candidate_message_participant
             WHERE
                site_id = %s
                AND thread_id = %s
                AND user_id = %s
                %s
             LIMIT 1",
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger($threadID),
            $this->_db->makeQueryInteger($userID),
            $archivedCriterion
        );

        $row = $this->_db->getAssoc($sql);
        return !empty($row);
    }

    public function archiveThreadForUser($threadID, $userID)
    {
        if (!$this->isSchemaAvailable())
        {
            return false;
        }

        $sql = sprintf(
            "UPDATE candidate_message_participant
             SET
                is_archived = 1,
                date_modified = NOW()
             WHERE
                site_id = %s
                AND thread_id = %s
                AND user_id = %s",
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger($threadID),
            $this->_db->makeQueryInteger($userID)
        );
        $this->_db->query($sql);

        return true;
    }

    public function deleteThread($threadID)
    {
        if (!$this->isSchemaAvailable())
        {
            return false;
        }

        $threadID = (int) $threadID;
        if ($threadID <= 0)
        {
            return false;
        }

        $this->_db->query(sprintf(
            "DELETE mention
             FROM candidate_message_mention mention
             INNER JOIN candidate_message message
                ON message.candidate_message_id = mention.message_id
                AND message.site_id = mention.site_id
             WHERE
                message.site_id = %s
                AND message.thread_id = %s",
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger($threadID)
        ));

        $this->_db->query(sprintf(
            "DELETE FROM candidate_message
             WHERE
                site_id = %s
                AND thread_id = %s",
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger($threadID)
        ));

        $this->_db->query(sprintf(
            "DELETE FROM candidate_message_participant
             WHERE
                site_id = %s
                AND thread_id = %s",
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger($threadID)
        ));

        $this->_db->query(sprintf(
            "DELETE FROM candidate_message_thread
             WHERE
                site_id = %s
                AND candidate_message_thread_id = %s",
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger($threadID)
        ));

        return true;
    }

    public function markThreadRead($threadID, $userID)
    {
        if (!$this->isSchemaAvailable())
        {
            return false;
        }

        $this->ensureParticipant($threadID, $userID, true);
        return true;
    }

    public function postMessageForCandidate($candidateID, $senderUserID, $body)
    {
        if (!$this->isSchemaAvailable())
        {
            return array(
                'success' => false,
                'error' => 'schema'
            );
        }

        $body = $this->normalizeMessageBody($body);
        if ($body === '')
        {
            return array(
                'success' => false,
                'error' => 'empty'
            );
        }

        if (strlen($body) > self::MESSAGE_MAXLEN)
        {
            return array(
                'success' => false,
                'error' => 'tooLong'
            );
        }

        $threadID = $this->ensureThreadForCandidate($candidateID, $senderUserID);
        if ($threadID <= 0)
        {
            return array(
                'success' => false,
                'error' => 'thread'
            );
        }

        return $this->postMessageToThread($threadID, $senderUserID, $body);
    }

    public function postMessageToThread($threadID, $senderUserID, $body)
    {
        if (!$this->isSchemaAvailable())
        {
            return array(
                'success' => false,
                'error' => 'schema'
            );
        }

        $body = $this->normalizeMessageBody($body);
        if ($body === '')
        {
            return array(
                'success' => false,
                'error' => 'empty'
            );
        }

        if (strlen($body) > self::MESSAGE_MAXLEN)
        {
            return array(
                'success' => false,
                'error' => 'tooLong'
            );
        }

        $thread = $this->getThread($threadID);
        if (empty($thread))
        {
            return array(
                'success' => false,
                'error' => 'thread'
            );
        }

        $candidateID = (int) $thread['candidateID'];
        $mentionedUserIDs = $this->extractMentionedUserIDs($body, $senderUserID);

        $sql = sprintf(
            "INSERT INTO candidate_message (
                site_id,
                thread_id,
                candidate_id,
                sender_user_id,
                body,
                date_created
            ) VALUES (
                %s, %s, %s, %s, %s, NOW()
            )",
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger($threadID),
            $this->_db->makeQueryInteger($candidateID),
            $this->_db->makeQueryInteger($senderUserID),
            $this->_db->makeQueryString($body)
        );
        $this->_db->query($sql);

        $messageID = (int) $this->_db->getLastInsertID();
        if ($messageID <= 0)
        {
            return array(
                'success' => false,
                'error' => 'insert'
            );
        }

        foreach ($mentionedUserIDs as $mentionedUserID)
        {
            $this->_db->query(sprintf(
                "INSERT IGNORE INTO candidate_message_mention (
                    site_id,
                    message_id,
                    mentioned_user_id,
                    date_created
                ) VALUES (
                    %s, %s, %s, NOW()
                )",
                $this->_db->makeQueryInteger($this->_siteID),
                $this->_db->makeQueryInteger($messageID),
                $this->_db->makeQueryInteger($mentionedUserID)
            ));
        }

        $this->ensureParticipant($threadID, $senderUserID, true);
        foreach ($mentionedUserIDs as $mentionedUserID)
        {
            $this->ensureParticipant($threadID, $mentionedUserID, false);
        }

        $this->_db->query(sprintf(
            "UPDATE candidate_message_thread
             SET
                last_message_id = %s,
                last_message_by = %s,
                last_message_at = NOW(),
                date_modified = NOW()
             WHERE
                candidate_message_thread_id = %s
                AND site_id = %s",
            $this->_db->makeQueryInteger($messageID),
            $this->_db->makeQueryInteger($senderUserID),
            $this->_db->makeQueryInteger($threadID),
            $this->_db->makeQueryInteger($this->_siteID)
        ));

        return array(
            'success' => true,
            'threadID' => $threadID,
            'messageID' => $messageID,
            'mentionedUserIDs' => $mentionedUserIDs
        );
    }

    public function getMessagesByThread($threadID, $limit = 100)
    {
        if (!$this->isSchemaAvailable())
        {
            return array();
        }

        $limit = (int) $limit;
        if ($limit <= 0)
        {
            $limit = 100;
        }

        $sql = sprintf(
            "SELECT
                m.candidate_message_id AS messageID,
                m.thread_id AS threadID,
                m.sender_user_id AS senderUserID,
                m.body AS body,
                DATE_FORMAT(m.date_created, '%%m-%%d-%%y (%%h:%%i %%p)') AS dateCreated,
                m.date_created AS dateCreatedSort,
                sender.first_name AS senderFirstName,
                sender.last_name AS senderLastName,
                GROUP_CONCAT(
                    DISTINCT CONCAT(mentioned.first_name, ' ', mentioned.last_name)
                    ORDER BY mentioned.last_name ASC, mentioned.first_name ASC
                    SEPARATOR ', '
                ) AS mentionedUsers
             FROM
                candidate_message m
             LEFT JOIN user sender
                ON sender.user_id = m.sender_user_id
             LEFT JOIN candidate_message_mention mention
                ON mention.message_id = m.candidate_message_id
                AND mention.site_id = m.site_id
             LEFT JOIN user mentioned
                ON mentioned.user_id = mention.mentioned_user_id
             WHERE
                m.site_id = %s
                AND m.thread_id = %s
             GROUP BY
                m.candidate_message_id,
                m.thread_id,
                m.sender_user_id,
                m.body,
                m.date_created,
                sender.first_name,
                sender.last_name
             ORDER BY
                m.date_created DESC
             LIMIT %s",
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger($threadID),
            $this->_db->makeQueryInteger($limit)
        );

        $messages = $this->_db->getAllAssoc($sql);
        if (empty($messages))
        {
            return array();
        }

        $messages = array_reverse($messages);
        foreach ($messages as $index => $message)
        {
            $senderName = trim($message['senderFirstName'] . ' ' . $message['senderLastName']);
            if ($senderName === '')
            {
                $senderName = 'Unknown User';
            }

            $messages[$index]['senderName'] = $senderName;
            $messages[$index]['bodyHTML'] = nl2br(htmlspecialchars($message['body'], ENT_QUOTES));
            $messages[$index]['mentionedUsers'] = trim((string) $message['mentionedUsers']);
        }

        return $messages;
    }

    public function getInboxThreads($userID, $limit = 100)
    {
        if (!$this->isSchemaAvailable())
        {
            return array();
        }

        $limit = (int) $limit;
        if ($limit <= 0)
        {
            $limit = 100;
        }

        $sql = sprintf(
            "SELECT
                t.candidate_message_thread_id AS threadID,
                t.candidate_id AS candidateID,
                t.last_message_id AS lastMessageID,
                t.last_message_by AS lastMessageBy,
                t.last_message_at AS lastMessageAtRaw,
                DATE_FORMAT(t.last_message_at, '%%m-%%d-%%y (%%h:%%i %%p)') AS lastMessageAt,
                c.first_name AS candidateFirstName,
                c.last_name AS candidateLastName,
                sender.first_name AS lastSenderFirstName,
                sender.last_name AS lastSenderLastName,
                m.body AS lastMessageBody,
                (
                    SELECT COUNT(*)
                    FROM candidate_message unread
                    WHERE
                        unread.site_id = t.site_id
                        AND unread.thread_id = t.candidate_message_thread_id
                        AND unread.sender_user_id <> %s
                        AND (
                            participant.last_read_at IS NULL OR
                            unread.date_created > participant.last_read_at
                        )
                ) AS unreadCount
             FROM
                candidate_message_participant participant
             INNER JOIN candidate_message_thread t
                ON t.candidate_message_thread_id = participant.thread_id
                AND t.site_id = participant.site_id
             LEFT JOIN candidate c
                ON c.candidate_id = t.candidate_id
                AND c.site_id = t.site_id
             LEFT JOIN candidate_message m
                ON m.candidate_message_id = t.last_message_id
                AND m.site_id = t.site_id
             LEFT JOIN user sender
                ON sender.user_id = t.last_message_by
             WHERE
                participant.site_id = %s
                AND participant.user_id = %s
                AND participant.is_archived = 0
             ORDER BY
                t.last_message_at DESC,
                t.date_modified DESC
             LIMIT %s",
            $this->_db->makeQueryInteger($userID),
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger($userID),
            $this->_db->makeQueryInteger($limit)
        );

        $threads = $this->_db->getAllAssoc($sql);
        if (empty($threads))
        {
            return array();
        }

        foreach ($threads as $index => $thread)
        {
            $candidateName = trim($thread['candidateFirstName'] . ' ' . $thread['candidateLastName']);
            if ($candidateName === '')
            {
                $candidateName = 'Candidate #' . (int) $thread['candidateID'];
            }

            $lastSenderName = trim($thread['lastSenderFirstName'] . ' ' . $thread['lastSenderLastName']);
            if ($lastSenderName === '')
            {
                $lastSenderName = 'Unknown User';
            }

            $snippet = trim((string) $thread['lastMessageBody']);
            if (strlen($snippet) > 140)
            {
                $snippet = substr($snippet, 0, 140) . '...';
            }

            $threads[$index]['candidateName'] = $candidateName;
            $threads[$index]['lastSenderName'] = $lastSenderName;
            $threads[$index]['snippet'] = $snippet;
            $threads[$index]['unreadCount'] = (int) $thread['unreadCount'];
        }

        return $threads;
    }

    public function getUnreadThreadCount($userID)
    {
        if (!$this->isSchemaAvailable())
        {
            return 0;
        }

        $sql = sprintf(
            "SELECT COUNT(*) AS unreadThreadCount
             FROM
                candidate_message_participant participant
             INNER JOIN candidate_message_thread t
                ON t.candidate_message_thread_id = participant.thread_id
                AND t.site_id = participant.site_id
             WHERE
                participant.site_id = %s
                AND participant.user_id = %s
                AND participant.is_archived = 0
                AND EXISTS (
                    SELECT 1
                    FROM candidate_message unread
                    WHERE
                        unread.site_id = t.site_id
                        AND unread.thread_id = t.candidate_message_thread_id
                        AND unread.sender_user_id <> %s
                        AND (
                            participant.last_read_at IS NULL OR
                            unread.date_created > participant.last_read_at
                        )
                )",
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger($userID),
            $this->_db->makeQueryInteger($userID)
        );
        $row = $this->_db->getAssoc($sql);
        if (empty($row))
        {
            return 0;
        }

        return (int) $row['unreadThreadCount'];
    }

    private function tableExists($tableName)
    {
        $sql = sprintf(
            "SHOW TABLES LIKE %s",
            $this->_db->makeQueryString($tableName)
        );
        $rows = $this->_db->getAllAssoc($sql);
        return !empty($rows);
    }

    private function normalizeMessageBody($body)
    {
        return trim((string) $body);
    }

    private function ensureThreadForCandidate($candidateID, $createdBy)
    {
        $thread = $this->getThreadByCandidate($candidateID);
        if (!empty($thread))
        {
            return (int) $thread['threadID'];
        }

        $this->_db->query(sprintf(
            "INSERT INTO candidate_message_thread (
                site_id,
                candidate_id,
                created_by,
                date_created,
                date_modified
            ) VALUES (
                %s, %s, %s, NOW(), NOW()
            )",
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger($candidateID),
            $this->_db->makeQueryInteger($createdBy)
        ));

        $threadID = (int) $this->_db->getLastInsertID();
        if ($threadID > 0)
        {
            $this->ensureParticipant($threadID, $createdBy, true);
            return $threadID;
        }

        $thread = $this->getThreadByCandidate($candidateID);
        if (!empty($thread))
        {
            $threadID = (int) $thread['threadID'];
            $this->ensureParticipant($threadID, $createdBy, true);
            return $threadID;
        }

        return 0;
    }

    private function ensureParticipant($threadID, $userID, $markRead)
    {
        $threadID = (int) $threadID;
        $userID = (int) $userID;
        if ($threadID <= 0 || $userID <= 0)
        {
            return false;
        }

        $participant = $this->_db->getAssoc(sprintf(
            "SELECT
                candidate_message_participant_id AS participantID
             FROM
                candidate_message_participant
             WHERE
                site_id = %s
                AND thread_id = %s
                AND user_id = %s
             LIMIT 1",
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger($threadID),
            $this->_db->makeQueryInteger($userID)
        ));

        if (!empty($participant))
        {
            if ($markRead)
            {
                $this->_db->query(sprintf(
                    "UPDATE candidate_message_participant
                     SET
                        is_archived = 0,
                        last_read_at = NOW(),
                        date_modified = NOW()
                     WHERE
                        candidate_message_participant_id = %s
                        AND site_id = %s",
                    $this->_db->makeQueryInteger($participant['participantID']),
                    $this->_db->makeQueryInteger($this->_siteID)
                ));
            }
            else
            {
                $this->_db->query(sprintf(
                    "UPDATE candidate_message_participant
                     SET
                        is_archived = 0,
                        date_modified = NOW()
                     WHERE
                        candidate_message_participant_id = %s
                        AND site_id = %s",
                    $this->_db->makeQueryInteger($participant['participantID']),
                    $this->_db->makeQueryInteger($this->_siteID)
                ));
            }

            return true;
        }

        $lastReadAtSQL = $markRead ? 'NOW()' : 'NULL';
        $this->_db->query(sprintf(
            "INSERT INTO candidate_message_participant (
                site_id,
                thread_id,
                user_id,
                last_read_at,
                is_archived,
                date_created,
                date_modified
            ) VALUES (
                %s, %s, %s, %s, 0, NOW(), NOW()
            )",
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger($threadID),
            $this->_db->makeQueryInteger($userID),
            $lastReadAtSQL
        ));

        return true;
    }
}

?>
