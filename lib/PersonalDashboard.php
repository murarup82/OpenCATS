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

    public function getSummary($userID)
    {
        if (!$this->isSchemaAvailable())
        {
            return array(
                'notesCount' => 0,
                'todoOpenCount' => 0,
                'todoDoneCount' => 0,
                'reminderDueCount' => 0
            );
        }

        $sql = sprintf(
            "SELECT
                SUM(CASE WHEN item_type = 'note' THEN 1 ELSE 0 END) AS notesCount,
                SUM(CASE WHEN item_type = 'todo' AND is_completed = 0 THEN 1 ELSE 0 END) AS todoOpenCount,
                SUM(CASE WHEN item_type = 'todo' AND is_completed = 1 THEN 1 ELSE 0 END) AS todoDoneCount,
                SUM(CASE WHEN item_type = 'todo' AND is_completed = 0 AND reminder_at IS NOT NULL AND reminder_at <= NOW() THEN 1 ELSE 0 END) AS reminderDueCount
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
                'reminderDueCount' => 0
            );
        }

        return array(
            'notesCount' => (int) $row['notesCount'],
            'todoOpenCount' => (int) $row['todoOpenCount'],
            'todoDoneCount' => (int) $row['todoDoneCount'],
            'reminderDueCount' => (int) $row['reminderDueCount']
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
        }
        else
        {
            $orderBy = "is_completed ASC, (reminder_at IS NULL) ASC, reminder_at ASC, (due_date IS NULL) ASC, due_date ASC, IFNULL(date_modified, date_created) DESC, user_personal_item_id DESC";
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
            $items[$index]['reminderAtRaw'] = trim((string) $item['reminderAtRaw']);
            $items[$index]['reminderAtDisplay'] = trim((string) $item['reminderAtDisplay']);
            $items[$index]['isCompleted'] = (int) $item['isCompleted'];
        }

        return $items;
    }

    public function addItem($userID, $itemType, $title, $body, $dueDate, $priority = self::PRIORITY_MEDIUM, $reminderAt = '')
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
                reminder_at,
                is_completed,
                date_created,
                date_modified
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, 0, NOW(), NOW()
            )",
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger($userID),
            $this->_db->makeQueryString($itemType),
            $this->_db->makeQueryString($title),
            $this->_db->makeQueryString($body),
            $dueDateSQL,
            $prioritySQL,
            $reminderAtSQL
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
                reminder_at = NULL,
                is_completed = 0,
                date_completed = NULL,
                date_modified = NOW()
             WHERE
                user_personal_item_id = %s
                AND site_id = %s
                AND user_id = %s",
            $this->_db->makeQueryString(self::PRIORITY_MEDIUM),
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

        $this->_db->query(sprintf(
            "UPDATE user_personal_item
             SET
                is_completed = %s,
                date_completed = %s,
                date_modified = NOW()
             WHERE
                user_personal_item_id = %s
                AND site_id = %s
                AND user_id = %s",
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

    private function getItem($itemID, $userID)
    {
        $row = $this->_db->getAssoc(sprintf(
            "SELECT
                user_personal_item_id AS itemID,
                item_type AS itemType
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
