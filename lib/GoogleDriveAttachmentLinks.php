<?php
/**
 * Stores per-user Google Drive file links for ATS attachments.
 */
class GoogleDriveAttachmentLinks
{
    const TABLE_NAME = 'google_drive_attachment_link';

    private $_db;
    private static $_tableEnsured = false;

    public function __construct()
    {
        $this->_db = DatabaseConnection::getInstance();
    }

    public function get($siteID, $userID, $attachmentID)
    {
        $siteID = (int) $siteID;
        $userID = (int) $userID;
        $attachmentID = (int) $attachmentID;
        if ($siteID <= 0 || $userID <= 0 || $attachmentID <= 0)
        {
            return array();
        }

        $this->ensureTableExists();

        $sql = sprintf(
            "SELECT
                site_id AS siteID,
                user_id AS userID,
                attachment_id AS attachmentID,
                file_id AS fileID,
                file_name AS fileName,
                created_at AS createdAt,
                updated_at AS updatedAt
            FROM
                %s
            WHERE
                site_id = %s
            AND
                user_id = %s
            AND
                attachment_id = %s",
            self::TABLE_NAME,
            $this->_db->makeQueryInteger($siteID),
            $this->_db->makeQueryInteger($userID),
            $this->_db->makeQueryInteger($attachmentID)
        );

        $row = $this->_db->getAssoc($sql);
        return (is_array($row) ? $row : array());
    }

    public function save($siteID, $userID, $attachmentID, $fileID, $fileName = '')
    {
        $siteID = (int) $siteID;
        $userID = (int) $userID;
        $attachmentID = (int) $attachmentID;
        $fileID = trim((string) $fileID);
        $fileName = trim((string) $fileName);

        if ($siteID <= 0 || $userID <= 0 || $attachmentID <= 0 || $fileID === '')
        {
            return false;
        }

        $this->ensureTableExists();

        $sql = sprintf(
            "INSERT INTO %s (
                site_id,
                user_id,
                attachment_id,
                file_id,
                file_name,
                created_at,
                updated_at
            ) VALUES (
                %s,
                %s,
                %s,
                %s,
                %s,
                NOW(),
                NOW()
            )
            ON DUPLICATE KEY UPDATE
                file_id = VALUES(file_id),
                file_name = VALUES(file_name),
                updated_at = NOW()",
            self::TABLE_NAME,
            $this->_db->makeQueryInteger($siteID),
            $this->_db->makeQueryInteger($userID),
            $this->_db->makeQueryInteger($attachmentID),
            $this->_db->makeQueryString($fileID),
            $this->_db->makeQueryString($fileName)
        );

        return (bool) $this->_db->query($sql);
    }

    public function delete($siteID, $userID, $attachmentID)
    {
        $siteID = (int) $siteID;
        $userID = (int) $userID;
        $attachmentID = (int) $attachmentID;
        if ($siteID <= 0 || $userID <= 0 || $attachmentID <= 0)
        {
            return false;
        }

        $this->ensureTableExists();

        $sql = sprintf(
            "DELETE FROM
                %s
            WHERE
                site_id = %s
            AND
                user_id = %s
            AND
                attachment_id = %s",
            self::TABLE_NAME,
            $this->_db->makeQueryInteger($siteID),
            $this->_db->makeQueryInteger($userID),
            $this->_db->makeQueryInteger($attachmentID)
        );

        return (bool) $this->_db->query($sql);
    }

    public function getAttachmentIDMap($siteID, $userID, $attachmentIDs)
    {
        $siteID = (int) $siteID;
        $userID = (int) $userID;
        if ($siteID <= 0 || $userID <= 0 || !is_array($attachmentIDs) || empty($attachmentIDs))
        {
            return array();
        }

        $this->ensureTableExists();

        $attachmentIDSQL = array();
        foreach ($attachmentIDs as $attachmentID)
        {
            $attachmentID = (int) $attachmentID;
            if ($attachmentID > 0)
            {
                $attachmentIDSQL[] = $this->_db->makeQueryInteger($attachmentID);
            }
        }
        $attachmentIDSQL = array_unique($attachmentIDSQL);
        if (empty($attachmentIDSQL))
        {
            return array();
        }

        $sql = sprintf(
            "SELECT
                attachment_id AS attachmentID
            FROM
                %s
            WHERE
                site_id = %s
            AND
                user_id = %s
            AND
                attachment_id IN (%s)",
            self::TABLE_NAME,
            $this->_db->makeQueryInteger($siteID),
            $this->_db->makeQueryInteger($userID),
            implode(',', $attachmentIDSQL)
        );

        $rows = $this->_db->getAllAssoc($sql);
        if (!is_array($rows))
        {
            return array();
        }

        $map = array();
        foreach ($rows as $row)
        {
            $attachmentID = (int) (isset($row['attachmentID']) ? $row['attachmentID'] : 0);
            if ($attachmentID > 0)
            {
                $map[$attachmentID] = true;
            }
        }

        return $map;
    }

    private function ensureTableExists()
    {
        if (self::$_tableEnsured)
        {
            return;
        }

        $sql = sprintf(
            "CREATE TABLE IF NOT EXISTS %s (
                site_id int(11) NOT NULL,
                user_id int(11) NOT NULL,
                attachment_id int(11) NOT NULL,
                file_id varchar(191) NOT NULL DEFAULT '',
                file_name varchar(255) NOT NULL DEFAULT '',
                created_at datetime NOT NULL,
                updated_at datetime NOT NULL,
                PRIMARY KEY (site_id, user_id, attachment_id),
                KEY idx_file (site_id, user_id, file_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8",
            self::TABLE_NAME
        );
        $this->_db->query($sql);
        self::$_tableEnsured = true;
    }
}

