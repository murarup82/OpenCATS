<?php
/*
 * CATS
 * Personal Dashboard Library (My Notes / To-do List)
 */

include_once(LEGACY_ROOT . '/lib/DatabaseConnection.php');

class PersonalDashboard
{
    const TITLE_MAXLEN = 255;
    const BODY_MAXLEN = 4000;

    const PRIORITY_LOW = 'low';
    const PRIORITY_MEDIUM = 'medium';
    const PRIORITY_HIGH = 'high';

    const STATUS_OPEN = 'open';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_BLOCKED = 'blocked';
    const STATUS_DONE = 'done';

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

        if (!$this->tableExists('user_personal_item'))
        {
            $this->_schemaAvailable = false;
            return false;
        }

        $requiredColumns = array(
            'user_personal_item_id',
            'site_id',
            'user_id',
            'item_type',
            'title',
            'body',
            'due_date',
            'priority',
            'task_status',
            'reminder_at',
            'is_completed'
        );
        foreach ($requiredColumns as $columnName)
        {
            if (!$this->columnExists('user_personal_item', $columnName))
            {
                $this->_schemaAvailable = false;
                return false;
            }
        }

        $this->_schemaAvailable = true;
        return true;
    }

    public function getAllowedPriorities()
    {
        return array(
            self::PRIORITY_LOW,
            self::PRIORITY_MEDIUM,
            self::PRIORITY_HIGH
        );
    }

    public function getAllowedTodoStatuses()
    {
        return array(
            self::STATUS_OPEN,
            self::STATUS_IN_PROGRESS,
            self::STATUS_BLOCKED,
            self::STATUS_DONE
        );
    }

    public function getSummary($userID)
    {
        if (!$this->isSchemaAvailable())
        {
            return array(
                'notesCount' => 0,
                'todoOpenCount' => 0,
                'todoDoneCount' => 0,
                'reminderDueCount' => 0,
                'todoStatusOpenCount' => 0,
                'todoStatusInProgressCount' => 0,
                'todoStatusBlockedCount' => 0,
                'todoStatusDoneCount' => 0
            );
        }

        $sql = sprintf(
            "SELECT
                SUM(CASE WHEN item_type = 'note' THEN 1 ELSE 0 END) AS notesCount,
                SUM(CASE WHEN item_type = 'todo' AND IFNULL(task_status, 'open') IN ('open', 'in_progress', 'blocked') THEN 1 ELSE 0 END) AS todoOpenCount,
                SUM(CASE WHEN item_type = 'todo' AND IFNULL(task_status, 'open') = 'done' AND (date_completed IS NULL OR date_completed >= DATE_SUB(NOW(), INTERVAL 7 DAY)) THEN 1 ELSE 0 END) AS todoDoneCount,
                SUM(CASE WHEN item_type = 'todo' AND is_completed = 0 AND reminder_at IS NOT NULL AND reminder_at <= NOW() THEN 1 ELSE 0 END) AS reminderDueCount
                ,
                SUM(CASE WHEN item_type = 'todo' AND IFNULL(task_status, 'open') = 'open' THEN 1 ELSE 0 END) AS todoStatusOpenCount,
                SUM(CASE WHEN item_type = 'todo' AND IFNULL(task_status, 'open') = 'in_progress' THEN 1 ELSE 0 END) AS todoStatusInProgressCount,
                SUM(CASE WHEN item_type = 'todo' AND IFNULL(task_status, 'open') = 'blocked' THEN 1 ELSE 0 END) AS todoStatusBlockedCount,
                SUM(CASE WHEN item_type = 'todo' AND IFNULL(task_status, 'open') = 'done' AND (date_completed IS NULL OR date_completed >= DATE_SUB(NOW(), INTERVAL 7 DAY)) THEN 1 ELSE 0 END) AS todoStatusDoneCount
             FROM
                user_personal_item
             WHERE
                site_id = %s
                AND user_id = %s",
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger($userID)
        );
        $row = $this->_db->getAssoc($sql);
        if (empty($row))
        {
            return array(
                'notesCount' => 0,
                'todoOpenCount' => 0,
                'todoDoneCount' => 0,
                'reminderDueCount' => 0,
                'todoStatusOpenCount' => 0,
                'todoStatusInProgressCount' => 0,
                'todoStatusBlockedCount' => 0,
                'todoStatusDoneCount' => 0
            );
        }

        return array(
            'notesCount' => (int) $row['notesCount'],
            'todoOpenCount' => (int) $row['todoOpenCount'],
            'todoDoneCount' => (int) $row['todoDoneCount'],
            'reminderDueCount' => (int) $row['reminderDueCount'],
            'todoStatusOpenCount' => (int) $row['todoStatusOpenCount'],
            'todoStatusInProgressCount' => (int) $row['todoStatusInProgressCount'],
            'todoStatusBlockedCount' => (int) $row['todoStatusBlockedCount'],
            'todoStatusDoneCount' => (int) $row['todoStatusDoneCount']
        );
    }

    public function getItems($userID, $itemType, $limit = 200)
    {
        if (!$this->isSchemaAvailable())
        {
            return array();
        }

        $itemType = $this->normalizeType($itemType);
        if ($itemType === '')
        {
            return array();
        }

        $limit = (int) $limit;
        if ($limit <= 0)
        {
            $limit = 200;
        }

        if ($itemType === 'note')
        {
            $orderBy = "IFNULL(date_modified, date_created) DESC, user_personal_item_id DESC";
            $extraWhere = '';
        }
        else
        {
            $orderBy = "FIELD(IFNULL(task_status, 'open'), 'open', 'in_progress', 'blocked', 'done') ASC, (reminder_at IS NULL) ASC, reminder_at ASC, (due_date IS NULL) ASC, due_date ASC, IFNULL(date_modified, date_created) DESC, user_personal_item_id DESC";
            $extraWhere = "AND (IFNULL(task_status, 'open') <> 'done' OR date_completed IS NULL OR date_completed >= DATE_SUB(NOW(), INTERVAL 7 DAY))";
        }

        $sql = sprintf(
            "SELECT
                user_personal_item_id AS itemID,
                item_type AS itemType,
                title,
                body,
                due_date AS dueDateISO,
                DATE_FORMAT(due_date, '%%m-%%d-%%y') AS dueDateDisplay,
                priority,
                task_status AS taskStatus,
                reminder_at AS reminderAtRaw,
                DATE_FORMAT(reminder_at, '%%m-%%d-%%y (%%h:%%i %%p)') AS reminderAtDisplay,
                is_completed AS isCompleted,
                DATE_FORMAT(date_created, '%%m-%%d-%%y (%%h:%%i %%p)') AS dateCreated,
                DATE_FORMAT(date_modified, '%%m-%%d-%%y (%%h:%%i %%p)') AS dateModified,
                DATE_FORMAT(date_completed, '%%m-%%d-%%y (%%h:%%i %%p)') AS dateCompleted
             FROM
                user_personal_item
             WHERE
                site_id = %s
                AND user_id = %s
                AND item_type = %s
                " . $extraWhere . "
             ORDER BY
                " . $orderBy . "
             LIMIT %s",
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger($userID),
            $this->_db->makeQueryString($itemType),
            $this->_db->makeQueryInteger($limit)
        );
        $items = $this->_db->getAllAssoc($sql);
        if (empty($items))
        {
            return array();
        }

        foreach ($items as $index => $item)
        {
            $items[$index]['title'] = trim((string) $item['title']);
            $items[$index]['body'] = trim((string) $item['body']);
            $items[$index]['dueDateISO'] = trim((string) $item['dueDateISO']);
            $items[$index]['priority'] = $this->normalizePriority($item['priority'], self::PRIORITY_MEDIUM);
            $items[$index]['taskStatus'] = $this->normalizeTodoStatus($item['taskStatus'], self::STATUS_OPEN);
            $items[$index]['reminderAtRaw'] = trim((string) $item['reminderAtRaw']);
            $items[$index]['reminderAtDisplay'] = trim((string) $item['reminderAtDisplay']);
            $items[$index]['isCompleted'] = (int) $item['isCompleted'];
        }

        return $items;
    }

    public function addItem($userID, $itemType, $title, $body, $dueDate, $priority = self::PRIORITY_MEDIUM, $reminderAt = '', $taskStatus = self::STATUS_OPEN)
    {
        if (!$this->isSchemaAvailable())
        {
            return array('success' => false, 'error' => 'schema');
        }

        $itemType = $this->normalizeType($itemType);
        if ($itemType === '')
        {
            return array('success' => false, 'error' => 'invalidType');
        }

        $title = trim((string) $title);
        $body = trim((string) $body);

        if ($body === '')
        {
            return array('success' => false, 'error' => 'empty');
        }

        if (strlen($title) > self::TITLE_MAXLEN)
        {
            return array('success' => false, 'error' => 'titleTooLong');
        }

        if (strlen($body) > self::BODY_MAXLEN)
        {
            return array('success' => false, 'error' => 'tooLong');
        }

        $dueDateSQL = 'NULL';
        $prioritySQL = $this->_db->makeQueryString(self::PRIORITY_MEDIUM);
        $reminderAtSQL = 'NULL';
        $taskStatusSQL = $this->_db->makeQueryString(self::STATUS_OPEN);
        $isCompletedSQL = '0';
        $dateCompletedSQL = 'NULL';

        if ($itemType === 'todo')
        {
            $normalizedDueDate = $this->normalizeDueDate($dueDate);
            if ($normalizedDueDate === false)
            {
                return array('success' => false, 'error' => 'badDate');
            }
            if ($normalizedDueDate !== null)
            {
                $dueDateSQL = $this->_db->makeQueryString($normalizedDueDate);
            }

            $normalizedPriority = $this->normalizePriority($priority, '');
            if ($normalizedPriority === '')
            {
                return array('success' => false, 'error' => 'badPriority');
            }
            $prioritySQL = $this->_db->makeQueryString($normalizedPriority);

            $normalizedReminderAt = $this->normalizeReminderAt($reminderAt);
            if ($normalizedReminderAt === false)
            {
                return array('success' => false, 'error' => 'badReminder');
            }
            if ($normalizedReminderAt !== null)
            {
                $reminderAtSQL = $this->_db->makeQueryString($normalizedReminderAt);
            }

            $normalizedTaskStatus = $this->normalizeTodoStatus($taskStatus, '');
            if ($normalizedTaskStatus === '')
            {
                return array('success' => false, 'error' => 'badStatus');
            }
            $taskStatusSQL = $this->_db->makeQueryString($normalizedTaskStatus);

            if ($normalizedTaskStatus === self::STATUS_DONE)
            {
                $isCompletedSQL = '1';
                $dateCompletedSQL = 'NOW()';
            }
        }

        $this->_db->query(sprintf(
            "INSERT INTO user_personal_item (
                site_id,
                user_id,
                item_type,
                title,
                body,
                due_date,
                priority,
                task_status,
                reminder_at,
                is_completed,
                date_completed,
                date_created,
                date_modified
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
            )",
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger($userID),
            $this->_db->makeQueryString($itemType),
            $this->_db->makeQueryString($title),
            $this->_db->makeQueryString($body),
            $dueDateSQL,
            $prioritySQL,
            $taskStatusSQL,
            $reminderAtSQL,
            $isCompletedSQL,
            $dateCompletedSQL
        ));

        $itemID = (int) $this->_db->getLastInsertID();
        if ($itemID <= 0)
        {
            return array('success' => false, 'error' => 'failed');
        }

        return array('success' => true, 'itemID' => $itemID);
    }

    public function moveNoteToTodo($itemID, $userID)
    {
        if (!$this->isSchemaAvailable())
        {
            return array('success' => false, 'error' => 'schema');
        }

        $item = $this->getItem($itemID, $userID);
        if (empty($item))
        {
            return array('success' => false, 'error' => 'notfound');
        }

        if ($item['itemType'] !== 'note')
        {
            return array('success' => false, 'error' => 'invalidType');
        }

        $this->_db->query(sprintf(
            "UPDATE user_personal_item
             SET
                item_type = 'todo',
                priority = %s,
                task_status = %s,
                reminder_at = NULL,
                is_completed = 0,
                date_completed = NULL,
                date_modified = NOW()
             WHERE
                user_personal_item_id = %s
                AND site_id = %s
            AND user_id = %s",
            $this->_db->makeQueryString(self::PRIORITY_MEDIUM),
            $this->_db->makeQueryString(self::STATUS_OPEN),
            $this->_db->makeQueryInteger($itemID),
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger($userID)
        ));

        return array('success' => true);
    }

    public function setTodoCompleted($itemID, $userID, $isCompleted)
    {
        if (!$this->isSchemaAvailable())
        {
            return array('success' => false, 'error' => 'schema');
        }

        $item = $this->getItem($itemID, $userID);
        if (empty($item))
        {
            return array('success' => false, 'error' => 'notfound');
        }

        if ($item['itemType'] !== 'todo')
        {
            return array('success' => false, 'error' => 'invalidType');
        }

        $isCompleted = ((int) $isCompleted > 0) ? 1 : 0;
        $dateCompletedSQL = ($isCompleted === 1) ? 'NOW()' : 'NULL';
        $taskStatusSQL = ($isCompleted === 1)
            ? $this->_db->makeQueryString(self::STATUS_DONE)
            : $this->_db->makeQueryString(self::STATUS_OPEN);

        $this->_db->query(sprintf(
            "UPDATE user_personal_item
             SET
                task_status = %s,
                is_completed = %s,
                date_completed = %s,
                date_modified = NOW()
             WHERE
                user_personal_item_id = %s
                AND site_id = %s
                AND user_id = %s",
            $taskStatusSQL,
            $this->_db->makeQueryInteger($isCompleted),
            $dateCompletedSQL,
            $this->_db->makeQueryInteger($itemID),
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger($userID)
        ));

        return array('success' => true);
    }

    public function setTodoStatus($itemID, $userID, $taskStatus)
    {
        if (!$this->isSchemaAvailable())
        {
            return array('success' => false, 'error' => 'schema');
        }

        $item = $this->getItem($itemID, $userID);
        if (empty($item))
        {
            return array('success' => false, 'error' => 'notfound');
        }

        if ($item['itemType'] !== 'todo')
        {
            return array('success' => false, 'error' => 'invalidType');
        }

        $normalizedTaskStatus = $this->normalizeTodoStatus($taskStatus, '');
        if ($normalizedTaskStatus === '')
        {
            return array('success' => false, 'error' => 'badStatus');
        }

        $isCompleted = ($normalizedTaskStatus === self::STATUS_DONE) ? 1 : 0;
        $dateCompletedSQL = ($isCompleted === 1) ? 'NOW()' : 'NULL';

        $this->_db->query(sprintf(
            "UPDATE user_personal_item
             SET
                task_status = %s,
                is_completed = %s,
                date_completed = %s,
                date_modified = NOW()
             WHERE
                user_personal_item_id = %s
                AND site_id = %s
                AND user_id = %s",
            $this->_db->makeQueryString($normalizedTaskStatus),
            $this->_db->makeQueryInteger($isCompleted),
            $dateCompletedSQL,
            $this->_db->makeQueryInteger($itemID),
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger($userID)
        ));

        return array('success' => true);
    }

    public function updateTodoItem($itemID, $userID, $title, $body, $dueDate, $priority, $reminderAt, $taskStatus)
    {
        if (!$this->isSchemaAvailable())
        {
            return array('success' => false, 'error' => 'schema');
        }

        $item = $this->getItem($itemID, $userID);
        if (empty($item))
        {
            return array('success' => false, 'error' => 'notfound');
        }

        if ($item['itemType'] !== 'todo')
        {
            return array('success' => false, 'error' => 'invalidType');
        }

        $title = trim((string) $title);
        $body = trim((string) $body);
        if ($body === '')
        {
            return array('success' => false, 'error' => 'empty');
        }

        if (strlen($title) > self::TITLE_MAXLEN)
        {
            return array('success' => false, 'error' => 'titleTooLong');
        }

        if (strlen($body) > self::BODY_MAXLEN)
        {
            return array('success' => false, 'error' => 'tooLong');
        }

        $normalizedDueDate = $this->normalizeDueDate($dueDate);
        if ($normalizedDueDate === false)
        {
            return array('success' => false, 'error' => 'badDate');
        }
        $dueDateSQL = 'NULL';
        if ($normalizedDueDate !== null)
        {
            $dueDateSQL = $this->_db->makeQueryString($normalizedDueDate);
        }

        $normalizedPriority = $this->normalizePriority($priority, '');
        if ($normalizedPriority === '')
        {
            return array('success' => false, 'error' => 'badPriority');
        }

        $normalizedReminderAt = $this->normalizeReminderAt($reminderAt);
        if ($normalizedReminderAt === false)
        {
            return array('success' => false, 'error' => 'badReminder');
        }
        $reminderAtSQL = 'NULL';
        if ($normalizedReminderAt !== null)
        {
            $reminderAtSQL = $this->_db->makeQueryString($normalizedReminderAt);
        }

        $normalizedTaskStatus = $this->normalizeTodoStatus($taskStatus, '');
        if ($normalizedTaskStatus === '')
        {
            return array('success' => false, 'error' => 'badStatus');
        }

        $isCompleted = ($normalizedTaskStatus === self::STATUS_DONE) ? 1 : 0;
        $dateCompletedSQL = ($isCompleted === 1) ? 'NOW()' : 'NULL';

        $this->_db->query(sprintf(
            "UPDATE user_personal_item
             SET
                title = %s,
                body = %s,
                due_date = %s,
                priority = %s,
                reminder_at = %s,
                task_status = %s,
                is_completed = %s,
                date_completed = %s,
                date_modified = NOW()
             WHERE
                user_personal_item_id = %s
                AND site_id = %s
                AND user_id = %s",
            $this->_db->makeQueryString($title),
            $this->_db->makeQueryString($body),
            $dueDateSQL,
            $this->_db->makeQueryString($normalizedPriority),
            $reminderAtSQL,
            $this->_db->makeQueryString($normalizedTaskStatus),
            $this->_db->makeQueryInteger($isCompleted),
            $dateCompletedSQL,
            $this->_db->makeQueryInteger($itemID),
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger($userID)
        ));

        return array('success' => true);
    }

    public function deleteItem($itemID, $userID)
    {
        if (!$this->isSchemaAvailable())
        {
            return array('success' => false, 'error' => 'schema');
        }

        $item = $this->getItem($itemID, $userID);
        if (empty($item))
        {
            return array('success' => false, 'error' => 'notfound');
        }

        $this->_db->query(sprintf(
            "DELETE FROM user_personal_item
             WHERE
                user_personal_item_id = %s
                AND site_id = %s
                AND user_id = %s",
            $this->_db->makeQueryInteger($itemID),
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger($userID)
        ));

        return array('success' => true);
    }

    public function appendToNote($itemID, $userID, $appendBody)
    {
        if (!$this->isSchemaAvailable())
        {
            return array('success' => false, 'error' => 'schema');
        }

        $appendBody = trim((string) $appendBody);
        if ($appendBody === '')
        {
            return array('success' => false, 'error' => 'empty');
        }

        if (strlen($appendBody) > self::BODY_MAXLEN)
        {
            return array('success' => false, 'error' => 'tooLong');
        }

        $item = $this->getItem($itemID, $userID);
        if (empty($item))
        {
            return array('success' => false, 'error' => 'notfound');
        }

        if ($item['itemType'] !== 'note')
        {
            return array('success' => false, 'error' => 'invalidType');
        }

        $body = trim((string) $item['body']);
        if ($body !== '')
        {
            $body .= "\n\n";
        }
        $body .= $appendBody;

        if (strlen($body) > self::BODY_MAXLEN)
        {
            return array('success' => false, 'error' => 'tooLong');
        }

        $this->_db->query(sprintf(
            "UPDATE user_personal_item
             SET
                body = %s,
                date_modified = NOW()
             WHERE
                user_personal_item_id = %s
                AND site_id = %s
                AND user_id = %s",
            $this->_db->makeQueryString($body),
            $this->_db->makeQueryInteger($itemID),
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger($userID)
        ));

        return array('success' => true);
    }

    public function sendNoteToUsers($itemID, $fromUserID, $recipientUserIDs, $senderDisplayName = '')
    {
        if (!$this->isSchemaAvailable())
        {
            return array('success' => false, 'error' => 'schema');
        }

        $item = $this->getItem($itemID, $fromUserID);
        if (empty($item))
        {
            return array('success' => false, 'error' => 'notfound');
        }

        if ($item['itemType'] !== 'note')
        {
            return array('success' => false, 'error' => 'invalidType');
        }

        if (!is_array($recipientUserIDs))
        {
            $recipientUserIDs = array();
        }

        $recipientUserIDs = array_values(array_unique(array_filter(array_map('intval', $recipientUserIDs))));
        $fromUserID = (int) $fromUserID;
        $validUserIDs = array();
        foreach ($recipientUserIDs as $recipientUserID)
        {
            if ($recipientUserID <= 0 || $recipientUserID === $fromUserID)
            {
                continue;
            }
            $validUserIDs[] = $recipientUserID;
        }

        if (empty($validUserIDs))
        {
            return array('success' => false, 'error' => 'noRecipients');
        }

        $senderDisplayName = trim((string) $senderDisplayName);
        if ($senderDisplayName === '')
        {
            $senderDisplayName = 'a teammate';
        }

        $sharedTitle = trim((string) $item['title']);
        if ($sharedTitle === '')
        {
            $sharedTitle = 'Shared note from ' . $senderDisplayName;
        }

        $sharedPrefix = '[Shared by ' . $senderDisplayName . ' on ' . date('Y-m-d H:i') . ']';
        $sharedBody = trim((string) $item['body']);
        if ($sharedBody === '')
        {
            $sharedBody = $sharedPrefix;
        }
        else
        {
            $sharedBody = $sharedPrefix . "\n\n" . $sharedBody;
        }

        if (strlen($sharedBody) > self::BODY_MAXLEN)
        {
            $sharedBody = substr($sharedBody, 0, self::BODY_MAXLEN);
        }

        $sentCount = 0;
        foreach ($validUserIDs as $recipientUserID)
        {
            $result = $this->addItem(
                (int) $recipientUserID,
                'note',
                $sharedTitle,
                $sharedBody,
                '',
                self::PRIORITY_MEDIUM,
                ''
            );
            if (!empty($result['success']))
            {
                $sentCount++;
            }
        }

        if ($sentCount <= 0)
        {
            return array('success' => false, 'error' => 'failed');
        }

        return array(
            'success' => true,
            'sentCount' => $sentCount
        );
    }

    private function getItem($itemID, $userID)
    {
        $row = $this->_db->getAssoc(sprintf(
            "SELECT
                user_personal_item_id AS itemID,
                item_type AS itemType,
                task_status AS taskStatus,
                title,
                body
             FROM
                user_personal_item
             WHERE
                user_personal_item_id = %s
                AND site_id = %s
                AND user_id = %s
             LIMIT 1",
            $this->_db->makeQueryInteger($itemID),
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger($userID)
        ));
        if (empty($row))
        {
            return array();
        }

        $row['itemType'] = $this->normalizeType($row['itemType']);
        $row['taskStatus'] = $this->normalizeTodoStatus($row['taskStatus'], self::STATUS_OPEN);
        $row['title'] = trim((string) $row['title']);
        $row['body'] = trim((string) $row['body']);
        return $row;
    }

    private function normalizeType($itemType)
    {
        $itemType = strtolower(trim((string) $itemType));
        if ($itemType !== 'note' && $itemType !== 'todo')
        {
            return '';
        }
        return $itemType;
    }

    private function normalizePriority($priority, $defaultPriority)
    {
        $priority = strtolower(trim((string) $priority));
        if ($priority === '')
        {
            return $defaultPriority;
        }

        $allowedPriorities = $this->getAllowedPriorities();
        if (!in_array($priority, $allowedPriorities, true))
        {
            return $defaultPriority;
        }

        return $priority;
    }

    private function normalizeTodoStatus($taskStatus, $defaultStatus)
    {
        $taskStatus = strtolower(trim((string) $taskStatus));
        if ($taskStatus === '')
        {
            return $defaultStatus;
        }

        $allowedStatuses = $this->getAllowedTodoStatuses();
        if (!in_array($taskStatus, $allowedStatuses, true))
        {
            return $defaultStatus;
        }

        return $taskStatus;
    }

    private function normalizeDueDate($dueDate)
    {
        $dueDate = trim((string) $dueDate);
        if ($dueDate === '')
        {
            return null;
        }

        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $dueDate))
        {
            return false;
        }

        $parts = explode('-', $dueDate);
        if (count($parts) !== 3)
        {
            return false;
        }

        $year = (int) $parts[0];
        $month = (int) $parts[1];
        $day = (int) $parts[2];
        if (!checkdate($month, $day, $year))
        {
            return false;
        }

        return sprintf('%04d-%02d-%02d', $year, $month, $day);
    }

    private function normalizeReminderAt($reminderAt)
    {
        $reminderAt = trim((string) $reminderAt);
        if ($reminderAt === '')
        {
            return null;
        }

        $match = array();
        if (!preg_match('/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::\d{2})?$/', $reminderAt, $match))
        {
            return false;
        }

        $year = (int) $match[1];
        $month = (int) $match[2];
        $day = (int) $match[3];
        $hour = (int) $match[4];
        $minute = (int) $match[5];

        if (!checkdate($month, $day, $year))
        {
            return false;
        }

        if ($hour < 0 || $hour > 23 || $minute < 0 || $minute > 59)
        {
            return false;
        }

        return sprintf('%04d-%02d-%02d %02d:%02d:00', $year, $month, $day, $hour, $minute);
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

    private function columnExists($tableName, $columnName)
    {
        $sql = sprintf(
            "SHOW COLUMNS FROM `%s` LIKE %s",
            str_replace('`', '', (string) $tableName),
            $this->_db->makeQueryString($columnName)
        );
        $rows = $this->_db->getAllAssoc($sql);
        return !empty($rows);
    }
}

?>
