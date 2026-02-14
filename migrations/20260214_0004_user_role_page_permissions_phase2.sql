-- 20260214_0004_user_role_page_permissions_phase2.sql
-- Phase 2 role-page matrix:
--   1) per-role page visibility
--   2) per-role minimum access level for each left-menu page

CREATE TABLE IF NOT EXISTS `user_role_page_permission` (
    `user_role_page_permission_id` INT(11) NOT NULL AUTO_INCREMENT,
    `site_id` INT(11) NOT NULL,
    `role_id` INT(11) NOT NULL,
    `page_key` VARCHAR(64) COLLATE utf8_unicode_ci NOT NULL,
    `is_visible` TINYINT(1) NOT NULL DEFAULT 1,
    `required_access_level` INT(11) NOT NULL DEFAULT 100,
    `date_created` DATETIME NOT NULL,
    `date_modified` DATETIME DEFAULT NULL,
    PRIMARY KEY (`user_role_page_permission_id`),
    UNIQUE KEY `uniq_site_role_page` (`site_id`, `role_id`, `page_key`),
    KEY `idx_site_role` (`site_id`, `role_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT IGNORE INTO user_role_page_permission
(
    site_id,
    role_id,
    page_key,
    is_visible,
    required_access_level,
    date_created,
    date_modified
)
SELECT
    user_role.site_id,
    user_role.user_role_id,
    defaults.page_key,
    defaults.is_visible,
    defaults.required_access_level,
    NOW(),
    NOW()
FROM
    user_role
INNER JOIN
(
    SELECT 'site_admin' AS role_key, 'dashboard' AS page_key, 1 AS is_visible, 100 AS required_access_level
    UNION ALL SELECT 'site_admin', 'home', 1, 100
    UNION ALL SELECT 'site_admin', 'activity', 1, 100
    UNION ALL SELECT 'site_admin', 'candidates', 1, 100
    UNION ALL SELECT 'site_admin', 'joborders', 1, 100
    UNION ALL SELECT 'site_admin', 'companies', 1, 100
    UNION ALL SELECT 'site_admin', 'contacts', 1, 100
    UNION ALL SELECT 'site_admin', 'sourcing', 1, 100
    UNION ALL SELECT 'site_admin', 'lists', 1, 100
    UNION ALL SELECT 'site_admin', 'kpis', 1, 100
    UNION ALL SELECT 'site_admin', 'reports', 1, 100
    UNION ALL SELECT 'site_admin', 'calendar', 1, 100
    UNION ALL SELECT 'site_admin', 'gdpr_consents', 1, 400
    UNION ALL SELECT 'site_admin', 'settings', 1, 100
    UNION ALL SELECT 'site_admin', 'settings_admin', 1, 400

    UNION ALL SELECT 'hr_manager', 'dashboard', 1, 100
    UNION ALL SELECT 'hr_manager', 'home', 1, 100
    UNION ALL SELECT 'hr_manager', 'activity', 0, 0
    UNION ALL SELECT 'hr_manager', 'candidates', 1, 100
    UNION ALL SELECT 'hr_manager', 'joborders', 1, 100
    UNION ALL SELECT 'hr_manager', 'companies', 1, 100
    UNION ALL SELECT 'hr_manager', 'contacts', 1, 100
    UNION ALL SELECT 'hr_manager', 'sourcing', 1, 100
    UNION ALL SELECT 'hr_manager', 'lists', 1, 100
    UNION ALL SELECT 'hr_manager', 'kpis', 1, 100
    UNION ALL SELECT 'hr_manager', 'reports', 1, 100
    UNION ALL SELECT 'hr_manager', 'calendar', 0, 0
    UNION ALL SELECT 'hr_manager', 'gdpr_consents', 0, 0
    UNION ALL SELECT 'hr_manager', 'settings', 0, 0
    UNION ALL SELECT 'hr_manager', 'settings_admin', 0, 0

    UNION ALL SELECT 'top_management', 'dashboard', 0, 0
    UNION ALL SELECT 'top_management', 'home', 0, 0
    UNION ALL SELECT 'top_management', 'activity', 0, 0
    UNION ALL SELECT 'top_management', 'candidates', 1, 100
    UNION ALL SELECT 'top_management', 'joborders', 1, 100
    UNION ALL SELECT 'top_management', 'companies', 1, 100
    UNION ALL SELECT 'top_management', 'contacts', 1, 100
    UNION ALL SELECT 'top_management', 'sourcing', 0, 0
    UNION ALL SELECT 'top_management', 'lists', 0, 0
    UNION ALL SELECT 'top_management', 'kpis', 1, 100
    UNION ALL SELECT 'top_management', 'reports', 1, 100
    UNION ALL SELECT 'top_management', 'calendar', 0, 0
    UNION ALL SELECT 'top_management', 'gdpr_consents', 0, 0
    UNION ALL SELECT 'top_management', 'settings', 0, 0
    UNION ALL SELECT 'top_management', 'settings_admin', 0, 0

    UNION ALL SELECT 'hr_recruiter', 'dashboard', 1, 100
    UNION ALL SELECT 'hr_recruiter', 'home', 1, 100
    UNION ALL SELECT 'hr_recruiter', 'activity', 0, 0
    UNION ALL SELECT 'hr_recruiter', 'candidates', 1, 100
    UNION ALL SELECT 'hr_recruiter', 'joborders', 1, 100
    UNION ALL SELECT 'hr_recruiter', 'companies', 1, 100
    UNION ALL SELECT 'hr_recruiter', 'contacts', 1, 100
    UNION ALL SELECT 'hr_recruiter', 'sourcing', 1, 100
    UNION ALL SELECT 'hr_recruiter', 'lists', 1, 100
    UNION ALL SELECT 'hr_recruiter', 'kpis', 0, 0
    UNION ALL SELECT 'hr_recruiter', 'reports', 0, 0
    UNION ALL SELECT 'hr_recruiter', 'calendar', 0, 0
    UNION ALL SELECT 'hr_recruiter', 'gdpr_consents', 0, 0
    UNION ALL SELECT 'hr_recruiter', 'settings', 0, 0
    UNION ALL SELECT 'hr_recruiter', 'settings_admin', 0, 0
) AS defaults
    ON defaults.role_key = user_role.role_key;
