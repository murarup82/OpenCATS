<?php
/**
 * Stores canonical shared Google Drive file links for ATS attachments.
 */
class GoogleDriveSharedAttachmentLinks
{
    const TABLE_NAME = 'google_drive_shared_attachment_link';

    private $_db;
    private static $_tableEnsured = false;

    public function __construct()
    {
        $this->_db = DatabaseConnection::getInstance();
    }

    public function get($siteID, $attachmentID)
    {
        $siteID = (int) $siteID;
        $attachmentID = (int) $attachmentID;
        if ($siteID <= 0 || $attachmentID <= 0)
        {
            return array();
        }

        $this->ensureTableExists();

        $sql = sprintf(
            "SELECT
                site_id AS siteID,
                attachment_id AS attachmentID,
                file_id AS fileID,
                file_name AS fileName,
                shared_drive_id AS sharedDriveID,
                folder_path AS folderPath,
                created_by AS createdBy,
                created_at AS createdAt,
                updated_at AS updatedAt
            FROM
                %s
            WHERE
                site_id = %s
            AND
                attachment_id = %s",
            self::TABLE_NAME,
            $this->_db->makeQueryInteger($siteID),
            $this->_db->makeQueryInteger($attachmentID)
        );

        $row = $this->_db->getAssoc($sql);
        return (is_array($row) ? $row : array());
    }

    public function save($siteID, $attachmentID, $fileID, $fileName = '', $sharedDriveID = '', $folderPath = '', $createdBy = 0)
    {
        $siteID = (int) $siteID;
        $attachmentID = (int) $attachmentID;
        $fileID = trim((string) $fileID);
        $fileName = trim((string) $fileName);
        $sharedDriveID = trim((string) $sharedDriveID);
        $folderPath = trim((string) $folderPath);
        $createdBy = (int) $createdBy;

        if ($siteID <= 0 || $attachmentID <= 0 || $fileID === '')
        {
            return false;
        }

        $this->ensureTableExists();

        $sql = sprintf(
            "INSERT INTO %s (
                site_id,
                attachment_id,
                file_id,
                file_name,
                shared_drive_id,
                folder_path,
                created_by,
                created_at,
                updated_at
            ) VALUES (
                %s,
                %s,
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
                shared_drive_id = VALUES(shared_drive_id),
                folder_path = VALUES(folder_path),
                created_by = VALUES(created_by),
                updated_at = NOW()",
            self::TABLE_NAME,
            $this->_db->makeQueryInteger($siteID),
            $this->_db->makeQueryInteger($attachmentID),
            $this->_db->makeQueryString($fileID),
            $this->_db->makeQueryString($fileName),
            $this->_db->makeQueryString($sharedDriveID),
            $this->_db->makeQueryString($folderPath),
            $this->_db->makeQueryInteger($createdBy)
        );

        return (bool) $this->_db->query($sql);
    }

    public function delete($siteID, $attachmentID)
    {
        $siteID = (int) $siteID;
        $attachmentID = (int) $attachmentID;
        if ($siteID <= 0 || $attachmentID <= 0)
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
                attachment_id = %s",
            self::TABLE_NAME,
            $this->_db->makeQueryInteger($siteID),
            $this->_db->makeQueryInteger($attachmentID)
        );

        return (bool) $this->_db->query($sql);
    }

    public function getAttachmentIDMap($siteID, $attachmentIDs)
    {
        $siteID = (int) $siteID;
        if ($siteID <= 0 || !is_array($attachmentIDs) || empty($attachmentIDs))
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
                attachment_id IN (%s)",
            self::TABLE_NAME,
            $this->_db->makeQueryInteger($siteID),
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
                attachment_id int(11) NOT NULL,
                file_id varchar(191) NOT NULL DEFAULT '',
                file_name varchar(255) NOT NULL DEFAULT '',
                shared_drive_id varchar(191) NOT NULL DEFAULT '',
                folder_path varchar(255) NOT NULL DEFAULT '',
                created_by int(11) NOT NULL DEFAULT 0,
                created_at datetime NOT NULL,
                updated_at datetime NOT NULL,
                PRIMARY KEY (site_id, attachment_id),
                KEY idx_file (site_id, file_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8",
            self::TABLE_NAME
        );
        $this->_db->query($sql);
        self::$_tableEnsured = true;
    }
}
