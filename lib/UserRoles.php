<?php

/**
 * User Roles Library
 *
 * Provides role catalog and role assignment helpers for phase 1.
 */
class UserRoles
{
    private $_db;
    private $_siteID;
    private $_schemaChecked;
    private $_schemaAvailable;


    public function __construct($siteID)
    {
        $this->_siteID = (int) $siteID;
        $this->_db = DatabaseConnection::getInstance();
        $this->_schemaChecked = false;
        $this->_schemaAvailable = false;
    }

    public function isSchemaAvailable()
    {
        if ($this->_schemaChecked)
        {
            return $this->_schemaAvailable;
        }

        $tableRS = $this->_db->getAllAssoc("SHOW TABLES LIKE 'user_role'");
        if (empty($tableRS))
        {
            $this->_schemaChecked = true;
            $this->_schemaAvailable = false;
            return false;
        }

        $columnRS = $this->_db->getAllAssoc("SHOW COLUMNS FROM user LIKE 'role_id'");
        $this->_schemaAvailable = !empty($columnRS);
        $this->_schemaChecked = true;

        return $this->_schemaAvailable;
    }

    public function getAll($includeInactive = false)
    {
        if (!$this->isSchemaAvailable())
        {
            return array();
        }

        $activeSQL = '';
        if (!$includeInactive)
        {
            $activeSQL = ' AND user_role.is_active = 1';
        }

        $sql = sprintf(
            "SELECT
                user_role.user_role_id AS roleID,
                user_role.role_key AS roleKey,
                user_role.role_name AS roleName,
                user_role.access_level AS accessLevel,
                user_role.is_active AS isActive
            FROM
                user_role
            WHERE
                user_role.site_id = %s
                %s
            ORDER BY
                user_role.access_level DESC,
                user_role.role_name ASC",
            $this->_db->makeQueryInteger($this->_siteID),
            $activeSQL
        );

        return $this->_db->getAllAssoc($sql);
    }

    public function getByID($roleID)
    {
        if (!$this->isSchemaAvailable())
        {
            return array();
        }

        $sql = sprintf(
            "SELECT
                user_role.user_role_id AS roleID,
                user_role.role_key AS roleKey,
                user_role.role_name AS roleName,
                user_role.access_level AS accessLevel,
                user_role.is_active AS isActive
            FROM
                user_role
            WHERE
                user_role.site_id = %s
            AND
                user_role.user_role_id = %s",
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger($roleID)
        );

        return $this->_db->getAssoc($sql);
    }

    public function getByKey($roleKey)
    {
        if (!$this->isSchemaAvailable())
        {
            return array();
        }

        $sql = sprintf(
            "SELECT
                user_role.user_role_id AS roleID,
                user_role.role_key AS roleKey,
                user_role.role_name AS roleName,
                user_role.access_level AS accessLevel,
                user_role.is_active AS isActive
            FROM
                user_role
            WHERE
                user_role.site_id = %s
            AND
                user_role.role_key = %s",
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryString($roleKey)
        );

        return $this->_db->getAssoc($sql);
    }

    public function getForUser($userID)
    {
        if (!$this->isSchemaAvailable())
        {
            return array();
        }

        $sql = sprintf(
            "SELECT
                user_role.user_role_id AS roleID,
                user_role.role_key AS roleKey,
                user_role.role_name AS roleName,
                user_role.access_level AS accessLevel,
                user_role.is_active AS isActive
            FROM
                user
            LEFT JOIN user_role
                ON user.role_id = user_role.user_role_id
               AND user_role.site_id = user.site_id
            WHERE
                user.site_id = %s
            AND
                user.user_id = %s",
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger($userID)
        );

        return $this->_db->getAssoc($sql);
    }

    public function setForUser($userID, $roleID)
    {
        if (!$this->isSchemaAvailable())
        {
            return false;
        }

        $role = $this->getByID($roleID);
        if (empty($role))
        {
            return false;
        }

        $sql = sprintf(
            "UPDATE
                user
            SET
                role_id = %s
            WHERE
                user_id = %s
            AND
                site_id = %s",
            $this->_db->makeQueryInteger($roleID),
            $this->_db->makeQueryInteger($userID),
            $this->_db->makeQueryInteger($this->_siteID)
        );

        return (boolean) $this->_db->query($sql);
    }

    public function getDefaultRoleByAccessLevel($accessLevel)
    {
        $roleKey = $this->getRoleKeyByAccessLevel($accessLevel);
        return $this->getByKey($roleKey);
    }

    public function getRoleNamesByUserIDs($userIDs)
    {
        $roleNames = array();
        if (!$this->isSchemaAvailable())
        {
            return $roleNames;
        }

        $safeUserIDs = array();
        foreach ($userIDs as $userID)
        {
            $safeUserID = (int) $userID;
            if ($safeUserID > 0)
            {
                $safeUserIDs[] = $safeUserID;
            }
        }

        if (empty($safeUserIDs))
        {
            return $roleNames;
        }

        $sql = sprintf(
            "SELECT
                user.user_id AS userID,
                user_role.role_name AS roleName
            FROM
                user
            LEFT JOIN user_role
                ON user.role_id = user_role.user_role_id
               AND user_role.site_id = user.site_id
            WHERE
                user.site_id = %s
            AND
                user.user_id IN (%s)",
            $this->_db->makeQueryInteger($this->_siteID),
            implode(', ', $safeUserIDs)
        );

        $rs = $this->_db->getAllAssoc($sql);
        foreach ($rs as $row)
        {
            $roleNames[(int) $row['userID']] = $row['roleName'];
        }

        return $roleNames;
    }

    private function getRoleKeyByAccessLevel($accessLevel)
    {
        $accessLevel = (int) $accessLevel;

        if ($accessLevel >= ACCESS_LEVEL_SA)
        {
            return 'site_admin';
        }
        if ($accessLevel >= ACCESS_LEVEL_DELETE)
        {
            return 'hr_manager';
        }
        if ($accessLevel >= ACCESS_LEVEL_EDIT)
        {
            return 'hr_recruiter';
        }

        return 'top_management';
    }
}

?>
