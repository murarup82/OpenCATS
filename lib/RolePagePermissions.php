<?php

/**
 * Role Page Permissions Library
 *
 * Stores and resolves role-based page visibility and minimum access levels.
 */
class RolePagePermissions
{
    private $_db;
    private $_siteID;
    private $_schemaChecked;
    private $_schemaAvailable;
    private $_roleByUserID;
    private $_permissionsByRoleID;


    public function __construct($siteID)
    {
        $this->_db = DatabaseConnection::getInstance();
        $this->_siteID = (int) $siteID;
        $this->_schemaChecked = false;
        $this->_schemaAvailable = false;
        $this->_roleByUserID = array();
        $this->_permissionsByRoleID = array();
    }

    public function isSchemaAvailable()
    {
        if ($this->_schemaChecked)
        {
            return $this->_schemaAvailable;
        }

        $tableRS = $this->_db->getAllAssoc("SHOW TABLES LIKE 'user_role_page_permission'");
        if (empty($tableRS))
        {
            $this->_schemaChecked = true;
            $this->_schemaAvailable = false;
            return false;
        }

        $roleTableRS = $this->_db->getAllAssoc("SHOW TABLES LIKE 'user_role'");
        if (empty($roleTableRS))
        {
            $this->_schemaChecked = true;
            $this->_schemaAvailable = false;
            return false;
        }

        $roleColumnRS = $this->_db->getAllAssoc("SHOW COLUMNS FROM user LIKE 'role_id'");
        $this->_schemaAvailable = !empty($roleColumnRS);
        $this->_schemaChecked = true;

        return $this->_schemaAvailable;
    }

    public static function getPageDefinitions()
    {
        return array(
            'dashboard' => array(
                'label' => 'My Dashboard',
                'module' => 'dashboard',
                'action' => ''
            ),
            'home' => array(
                'label' => 'Overview',
                'module' => 'home',
                'action' => ''
            ),
            'activity' => array(
                'label' => 'Activities',
                'module' => 'activity',
                'action' => ''
            ),
            'candidates' => array(
                'label' => 'Candidates',
                'module' => 'candidates',
                'action' => ''
            ),
            'joborders' => array(
                'label' => 'Job Orders',
                'module' => 'joborders',
                'action' => ''
            ),
            'companies' => array(
                'label' => 'Companies',
                'module' => 'companies',
                'action' => ''
            ),
            'contacts' => array(
                'label' => 'Contacts',
                'module' => 'contacts',
                'action' => ''
            ),
            'sourcing' => array(
                'label' => 'Sourcing',
                'module' => 'sourcing',
                'action' => ''
            ),
            'lists' => array(
                'label' => 'Lists',
                'module' => 'lists',
                'action' => ''
            ),
            'kpis' => array(
                'label' => "KPI's",
                'module' => 'kpis',
                'action' => ''
            ),
            'reports' => array(
                'label' => 'Reports',
                'module' => 'reports',
                'action' => ''
            ),
            'calendar' => array(
                'label' => 'Calendar',
                'module' => 'calendar',
                'action' => ''
            ),
            'gdpr_consents' => array(
                'label' => 'GDPR Consents',
                'module' => 'gdpr',
                'action' => 'requests'
            ),
            'settings' => array(
                'label' => 'Settings',
                'module' => 'settings',
                'action' => ''
            ),
            'settings_admin' => array(
                'label' => 'Administration',
                'module' => 'settings',
                'action' => 'administration'
            )
        );
    }

    public static function getAccessOptions()
    {
        return array(
            'hidden' => array(
                'label' => 'Not Visible',
                'isVisible' => 0,
                'requiredAccessLevel' => ACCESS_LEVEL_DISABLED
            ),
            'read' => array(
                'label' => 'Read Only',
                'isVisible' => 1,
                'requiredAccessLevel' => ACCESS_LEVEL_READ
            ),
            'edit' => array(
                'label' => 'Add / Edit',
                'isVisible' => 1,
                'requiredAccessLevel' => ACCESS_LEVEL_EDIT
            ),
            'delete' => array(
                'label' => 'Add / Edit / Delete',
                'isVisible' => 1,
                'requiredAccessLevel' => ACCESS_LEVEL_DELETE
            ),
            'site_admin' => array(
                'label' => 'Site Administrator',
                'isVisible' => 1,
                'requiredAccessLevel' => ACCESS_LEVEL_SA
            )
        );
    }

    public static function mapRequestToPageKey($moduleName, $action = '')
    {
        $moduleName = strtolower(trim((string) $moduleName));
        $action = strtolower(trim((string) $action));

        if ($moduleName == 'gdpr')
        {
            return 'gdpr_consents';
        }

        if ($moduleName == 'settings')
        {
            if ($action === '' ||
                $action == 'myprofile' ||
                $action == 'changepassword' ||
                $action == 'showuser' ||
                $action == 'viewitemhistory' ||
                $action == 'getfirefoxmodal')
            {
                return 'settings';
            }

            return 'settings_admin';
        }

        $pages = self::getPageDefinitions();
        if (isset($pages[$moduleName]))
        {
            return $moduleName;
        }

        return '';
    }

    public static function mapSecuredObjectToPageKeys($securedObjectName)
    {
        $securedObjectName = strtolower(trim((string) $securedObjectName));
        if ($securedObjectName === '')
        {
            return array();
        }

        if (strpos($securedObjectName, '.') !== false)
        {
            $parts = explode('.', $securedObjectName, 2);
            $prefix = $parts[0];
        }
        else
        {
            $prefix = $securedObjectName;
        }

        switch ($prefix)
        {
            case 'dashboard':
            case 'home':
            case 'activity':
            case 'candidates':
            case 'joborders':
            case 'companies':
            case 'contacts':
            case 'sourcing':
            case 'lists':
            case 'kpis':
            case 'reports':
            case 'calendar':
                return array($prefix);

            case 'clients':
                return array('companies');

            case 'pipelines':
                return array('candidates', 'joborders');

            case 'settings':
                if ($securedObjectName === 'settings' ||
                    strpos($securedObjectName, 'settings.myprofile') === 0 ||
                    strpos($securedObjectName, 'settings.changepassword') === 0 ||
                    strpos($securedObjectName, 'settings.showuser') === 0 ||
                    strpos($securedObjectName, 'settings.viewitemhistory') === 0 ||
                    strpos($securedObjectName, 'settings.setemail') === 0)
                {
                    return array('settings');
                }
                return array('settings_admin');

            case 'gdpr':
                return array('gdpr_consents');

            default:
                return array();
        }
    }

    public function canAccessRequest($userID, $moduleName, $action, $currentAccessLevel)
    {
        if (!$this->isSchemaAvailable())
        {
            return true;
        }

        $pageKey = self::mapRequestToPageKey($moduleName, $action);
        if ($pageKey == '')
        {
            return true;
        }

        if ($pageKey == 'settings_admin' && (int) $currentAccessLevel >= ACCESS_LEVEL_SA)
        {
            // Prevent accidental self-lockout for site admins.
            return true;
        }

        return $this->isPageAllowedForUser((int) $userID, $pageKey, (int) $currentAccessLevel);
    }

    public function getRequestAccessCap($userID, $moduleName, $action, $currentAccessLevel)
    {
        if (!$this->isSchemaAvailable())
        {
            return null;
        }

        $pageKey = self::mapRequestToPageKey($moduleName, $action);
        if ($pageKey === '')
        {
            return null;
        }

        if ($pageKey == 'settings_admin' && (int) $currentAccessLevel >= ACCESS_LEVEL_SA)
        {
            // Prevent accidental self-lockout for site admins.
            return null;
        }

        $permission = $this->getPagePermissionForUser($userID, $pageKey);
        if (empty($permission))
        {
            return null;
        }

        if ((int) $permission['isVisible'] !== 1)
        {
            return ACCESS_LEVEL_DISABLED;
        }

        return (int) $permission['requiredAccessLevel'];
    }

    public function getAccessCapForSecuredObject($userID, $securedObjectName, $currentAccessLevel)
    {
        if (!$this->isSchemaAvailable())
        {
            return null;
        }

        $pageKeys = self::mapSecuredObjectToPageKeys($securedObjectName);
        if (empty($pageKeys))
        {
            return null;
        }

        $caps = array();
        foreach ($pageKeys as $pageKey)
        {
            if ($pageKey == 'settings_admin' && (int) $currentAccessLevel >= ACCESS_LEVEL_SA)
            {
                continue;
            }

            $permission = $this->getPagePermissionForUser($userID, $pageKey);
            if (empty($permission))
            {
                continue;
            }

            if ((int) $permission['isVisible'] !== 1)
            {
                $caps[] = ACCESS_LEVEL_DISABLED;
                continue;
            }

            $caps[] = (int) $permission['requiredAccessLevel'];
        }

        if (empty($caps))
        {
            return null;
        }

        return min($caps);
    }

    public function getPagePermissionForUser($userID, $pageKey)
    {
        if (!$this->isSchemaAvailable())
        {
            return array();
        }

        $pageKey = trim((string) $pageKey);
        if ($pageKey === '')
        {
            return array();
        }

        $role = $this->getRoleForUser((int) $userID);
        if (empty($role))
        {
            return array();
        }

        return $this->getEffectivePermission($role, $pageKey);
    }

    public function isPageAllowedForUser($userID, $pageKey, $currentAccessLevel)
    {
        if (!$this->isSchemaAvailable())
        {
            return true;
        }

        if (trim($pageKey) == '')
        {
            return true;
        }

        $role = $this->getRoleForUser($userID);
        $effectivePermission = $this->getEffectivePermission($role, $pageKey);
        if (empty($effectivePermission))
        {
            return true;
        }

        if ((int) $effectivePermission['isVisible'] !== 1)
        {
            return false;
        }

        if ((int) $currentAccessLevel < (int) $effectivePermission['requiredAccessLevel'])
        {
            return false;
        }

        return true;
    }

    public function getRoleMatrix()
    {
        $result = array(
            'roles' => array(),
            'pages' => self::getPageDefinitions(),
            'matrix' => array()
        );

        if (!$this->isSchemaAvailable())
        {
            return $result;
        }

        $rolesSQL = sprintf(
            "SELECT
                user_role.user_role_id AS roleID,
                user_role.role_key AS roleKey,
                user_role.role_name AS roleName,
                user_role.access_level AS accessLevel
            FROM
                user_role
            WHERE
                user_role.site_id = %s
                AND user_role.is_active = 1
            ORDER BY
                user_role.access_level DESC,
                user_role.role_name ASC",
            $this->_db->makeQueryInteger($this->_siteID)
        );
        $roles = $this->_db->getAllAssoc($rolesSQL);
        $result['roles'] = $roles;

        foreach ($roles as $role)
        {
            $roleID = (int) $role['roleID'];
            $rolePermissions = $this->getPermissionsForRole($roleID);
            $result['matrix'][$roleID] = array();

            foreach ($result['pages'] as $pageKey => $pageData)
            {
                $effectivePermission = $this->getEffectivePermission($role, $pageKey, $rolePermissions);
                $result['matrix'][$roleID][$pageKey] = array(
                    'isVisible' => (int) $effectivePermission['isVisible'],
                    'requiredAccessLevel' => (int) $effectivePermission['requiredAccessLevel'],
                    'option' => $this->permissionToOption(
                        (int) $effectivePermission['isVisible'],
                        (int) $effectivePermission['requiredAccessLevel']
                    )
                );
            }
        }

        return $result;
    }

    public function saveRoleMatrix($matrixByRole)
    {
        if (!$this->isSchemaAvailable())
        {
            return false;
        }

        $matrix = $this->getRoleMatrix();
        if (empty($matrix['roles']))
        {
            return false;
        }

        $rolesByID = array();
        foreach ($matrix['roles'] as $role)
        {
            $rolesByID[(int) $role['roleID']] = $role;
        }

        $pageDefinitions = self::getPageDefinitions();
        $accessOptions = self::getAccessOptions();

        $roleIDs = array_keys($rolesByID);
        if (!empty($roleIDs))
        {
            $deleteSQL = sprintf(
                "DELETE FROM
                    user_role_page_permission
                WHERE
                    site_id = %s
                AND
                    role_id IN (%s)",
                $this->_db->makeQueryInteger($this->_siteID),
                implode(', ', $roleIDs)
            );
            if (!$this->_db->query($deleteSQL))
            {
                return false;
            }
        }

        foreach ($rolesByID as $roleID => $role)
        {
            foreach ($pageDefinitions as $pageKey => $pageData)
            {
                $selectedOption = '';
                if (isset($matrixByRole[$roleID]) && isset($matrixByRole[$roleID][$pageKey]))
                {
                    $selectedOption = trim((string) $matrixByRole[$roleID][$pageKey]);
                }

                if (!isset($accessOptions[$selectedOption]))
                {
                    $defaultPermission = $this->getDefaultPermission($role['roleKey'], $pageKey);
                    $isVisible = (int) $defaultPermission['isVisible'];
                    $requiredAccessLevel = (int) $defaultPermission['requiredAccessLevel'];
                }
                else
                {
                    $optionData = $accessOptions[$selectedOption];
                    $isVisible = (int) $optionData['isVisible'];
                    $requiredAccessLevel = (int) $optionData['requiredAccessLevel'];
                }

                $insertSQL = sprintf(
                    "INSERT INTO user_role_page_permission
                    (
                        site_id,
                        role_id,
                        page_key,
                        is_visible,
                        required_access_level,
                        date_created,
                        date_modified
                    )
                    VALUES
                    (
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        NOW(),
                        NOW()
                    )",
                    $this->_db->makeQueryInteger($this->_siteID),
                    $this->_db->makeQueryInteger($roleID),
                    $this->_db->makeQueryString($pageKey),
                    $this->_db->makeQueryInteger($isVisible),
                    $this->_db->makeQueryInteger($requiredAccessLevel)
                );
                if (!$this->_db->query($insertSQL))
                {
                    return false;
                }
            }
        }

        $this->_permissionsByRoleID = array();
        return true;
    }

    public function getDefaultLandingRoute($userID, $currentAccessLevel)
    {
        if (!$this->isSchemaAvailable())
        {
            return array();
        }

        $priority = array(
            'dashboard',
            'home',
            'candidates',
            'joborders',
            'companies',
            'contacts',
            'sourcing',
            'lists',
            'kpis',
            'reports',
            'calendar',
            'settings'
        );
        $pages = self::getPageDefinitions();

        foreach ($priority as $pageKey)
        {
            if (!isset($pages[$pageKey]))
            {
                continue;
            }

            if ($this->isPageAllowedForUser($userID, $pageKey, $currentAccessLevel))
            {
                return array(
                    'module' => $pages[$pageKey]['module'],
                    'action' => $pages[$pageKey]['action']
                );
            }
        }

        return array();
    }

    private function getRoleForUser($userID)
    {
        $userID = (int) $userID;
        if ($userID <= 0)
        {
            return array();
        }

        if (isset($this->_roleByUserID[$userID]))
        {
            return $this->_roleByUserID[$userID];
        }

        $sql = sprintf(
            "SELECT
                user.role_id AS roleID,
                user.access_level AS userAccessLevel,
                user_role.role_key AS roleKey,
                user_role.role_name AS roleName
            FROM
                user
            LEFT JOIN user_role
                ON user_role.user_role_id = user.role_id
               AND user_role.site_id = user.site_id
            WHERE
                user.site_id = %s
            AND
                user.user_id = %s",
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger($userID)
        );
        $role = $this->_db->getAssoc($sql);
        if (empty($role))
        {
            $this->_roleByUserID[$userID] = array();
            return array();
        }

        if (empty($role['roleKey']))
        {
            $role['roleKey'] = $this->getRoleKeyByAccessLevel((int) $role['userAccessLevel']);
        }

        $this->_roleByUserID[$userID] = $role;
        return $role;
    }

    private function getPermissionsForRole($roleID)
    {
        $roleID = (int) $roleID;
        if ($roleID <= 0)
        {
            return array();
        }

        if (isset($this->_permissionsByRoleID[$roleID]))
        {
            return $this->_permissionsByRoleID[$roleID];
        }

        $permissions = array();
        $sql = sprintf(
            "SELECT
                user_role_page_permission.page_key AS pageKey,
                user_role_page_permission.is_visible AS isVisible,
                user_role_page_permission.required_access_level AS requiredAccessLevel
            FROM
                user_role_page_permission
            WHERE
                user_role_page_permission.site_id = %s
            AND
                user_role_page_permission.role_id = %s",
            $this->_db->makeQueryInteger($this->_siteID),
            $this->_db->makeQueryInteger($roleID)
        );
        $rs = $this->_db->getAllAssoc($sql);
        foreach ($rs as $row)
        {
            $permissions[$row['pageKey']] = array(
                'isVisible' => (int) $row['isVisible'],
                'requiredAccessLevel' => (int) $row['requiredAccessLevel']
            );
        }

        $this->_permissionsByRoleID[$roleID] = $permissions;
        return $permissions;
    }

    private function getEffectivePermission($role, $pageKey, $rolePermissions = null)
    {
        if (empty($role) || trim($pageKey) == '')
        {
            return array(
                'isVisible' => 1,
                'requiredAccessLevel' => ACCESS_LEVEL_READ
            );
        }

        if ($rolePermissions === null)
        {
            $rolePermissions = array();
            if (isset($role['roleID']))
            {
                $rolePermissions = $this->getPermissionsForRole((int) $role['roleID']);
            }
        }

        if (isset($rolePermissions[$pageKey]))
        {
            return $rolePermissions[$pageKey];
        }

        return $this->getDefaultPermission($role['roleKey'], $pageKey);
    }

    private function getDefaultPermission($roleKey, $pageKey)
    {
        $defaults = $this->getDefaultMatrix();
        if (isset($defaults[$roleKey]) && isset($defaults[$roleKey][$pageKey]))
        {
            return $defaults[$roleKey][$pageKey];
        }

        return array(
            'isVisible' => 1,
            'requiredAccessLevel' => ACCESS_LEVEL_READ
        );
    }

    private function permissionToOption($isVisible, $requiredAccessLevel)
    {
        if ((int) $isVisible !== 1)
        {
            return 'hidden';
        }

        if ((int) $requiredAccessLevel >= ACCESS_LEVEL_SA)
        {
            return 'site_admin';
        }
        if ((int) $requiredAccessLevel >= ACCESS_LEVEL_DELETE)
        {
            return 'delete';
        }
        if ((int) $requiredAccessLevel >= ACCESS_LEVEL_EDIT)
        {
            return 'edit';
        }

        return 'read';
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

    private function getDefaultMatrix()
    {
        return array(
            'site_admin' => array(
                'dashboard' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'home' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'activity' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'candidates' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'joborders' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'companies' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'contacts' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'sourcing' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'lists' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'kpis' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'reports' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'calendar' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'gdpr_consents' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_SA),
                'settings' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'settings_admin' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_SA)
            ),
            'hr_manager' => array(
                'dashboard' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'home' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'activity' => array('isVisible' => 0, 'requiredAccessLevel' => ACCESS_LEVEL_DISABLED),
                'candidates' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'joborders' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'companies' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'contacts' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'sourcing' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'lists' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'kpis' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'reports' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'calendar' => array('isVisible' => 0, 'requiredAccessLevel' => ACCESS_LEVEL_DISABLED),
                'gdpr_consents' => array('isVisible' => 0, 'requiredAccessLevel' => ACCESS_LEVEL_DISABLED),
                'settings' => array('isVisible' => 0, 'requiredAccessLevel' => ACCESS_LEVEL_DISABLED),
                'settings_admin' => array('isVisible' => 0, 'requiredAccessLevel' => ACCESS_LEVEL_DISABLED)
            ),
            'top_management' => array(
                'dashboard' => array('isVisible' => 0, 'requiredAccessLevel' => ACCESS_LEVEL_DISABLED),
                'home' => array('isVisible' => 0, 'requiredAccessLevel' => ACCESS_LEVEL_DISABLED),
                'activity' => array('isVisible' => 0, 'requiredAccessLevel' => ACCESS_LEVEL_DISABLED),
                'candidates' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'joborders' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'companies' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'contacts' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'sourcing' => array('isVisible' => 0, 'requiredAccessLevel' => ACCESS_LEVEL_DISABLED),
                'lists' => array('isVisible' => 0, 'requiredAccessLevel' => ACCESS_LEVEL_DISABLED),
                'kpis' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'reports' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'calendar' => array('isVisible' => 0, 'requiredAccessLevel' => ACCESS_LEVEL_DISABLED),
                'gdpr_consents' => array('isVisible' => 0, 'requiredAccessLevel' => ACCESS_LEVEL_DISABLED),
                'settings' => array('isVisible' => 0, 'requiredAccessLevel' => ACCESS_LEVEL_DISABLED),
                'settings_admin' => array('isVisible' => 0, 'requiredAccessLevel' => ACCESS_LEVEL_DISABLED)
            ),
            'hr_recruiter' => array(
                'dashboard' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'home' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'activity' => array('isVisible' => 0, 'requiredAccessLevel' => ACCESS_LEVEL_DISABLED),
                'candidates' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'joborders' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'companies' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'contacts' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'sourcing' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'lists' => array('isVisible' => 1, 'requiredAccessLevel' => ACCESS_LEVEL_READ),
                'kpis' => array('isVisible' => 0, 'requiredAccessLevel' => ACCESS_LEVEL_DISABLED),
                'reports' => array('isVisible' => 0, 'requiredAccessLevel' => ACCESS_LEVEL_DISABLED),
                'calendar' => array('isVisible' => 0, 'requiredAccessLevel' => ACCESS_LEVEL_DISABLED),
                'gdpr_consents' => array('isVisible' => 0, 'requiredAccessLevel' => ACCESS_LEVEL_DISABLED),
                'settings' => array('isVisible' => 0, 'requiredAccessLevel' => ACCESS_LEVEL_DISABLED),
                'settings_admin' => array('isVisible' => 0, 'requiredAccessLevel' => ACCESS_LEVEL_DISABLED)
            )
        );
    }
}

?>
