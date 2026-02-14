-- 20260213_0003_user_roles_phase1.sql
-- Phase 1 role model:
--   1) one application role per user (user.role_id)
--   2) per-site role catalog (user_role)
--   3) default role seeding and user backfill from access_level

SET @table_exists := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'user_role'
);
SET @sql := IF(
    @table_exists = 0,
    'CREATE TABLE `user_role` (
        `user_role_id` INT(11) NOT NULL AUTO_INCREMENT,
        `site_id` INT(11) NOT NULL,
        `role_key` VARCHAR(64) COLLATE utf8_unicode_ci NOT NULL,
        `role_name` VARCHAR(128) COLLATE utf8_unicode_ci NOT NULL,
        `access_level` INT(11) NOT NULL DEFAULT 100,
        `is_active` TINYINT(1) NOT NULL DEFAULT 1,
        `date_created` DATETIME NOT NULL,
        `date_modified` DATETIME DEFAULT NULL,
        PRIMARY KEY (`user_role_id`),
        UNIQUE KEY `uniq_site_role_key` (`site_id`, `role_key`),
        KEY `IDX_site_id` (`site_id`)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'user'
      AND COLUMN_NAME = 'role_id'
);
SET @sql := IF(
    @col_exists = 0,
    'ALTER TABLE `user` ADD COLUMN `role_id` INT(11) DEFAULT NULL AFTER `access_level`',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'user'
      AND INDEX_NAME = 'IDX_role_id'
);
SET @sql := IF(
    @idx_exists = 0,
    'ALTER TABLE `user` ADD KEY `IDX_role_id` (`role_id`)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

INSERT IGNORE INTO user_role
(
    site_id,
    role_key,
    role_name,
    access_level,
    is_active,
    date_created,
    date_modified
)
SELECT
    site.site_id,
    'site_admin',
    'Site Admin',
    400,
    1,
    NOW(),
    NOW()
FROM site;

INSERT IGNORE INTO user_role
(
    site_id,
    role_key,
    role_name,
    access_level,
    is_active,
    date_created,
    date_modified
)
SELECT
    site.site_id,
    'hr_manager',
    'HR Manager',
    300,
    1,
    NOW(),
    NOW()
FROM site;

INSERT IGNORE INTO user_role
(
    site_id,
    role_key,
    role_name,
    access_level,
    is_active,
    date_created,
    date_modified
)
SELECT
    site.site_id,
    'hr_recruiter',
    'HR Recruiter',
    200,
    1,
    NOW(),
    NOW()
FROM site;

INSERT IGNORE INTO user_role
(
    site_id,
    role_key,
    role_name,
    access_level,
    is_active,
    date_created,
    date_modified
)
SELECT
    site.site_id,
    'top_management',
    'Top Management',
    100,
    1,
    NOW(),
    NOW()
FROM site;

UPDATE user
INNER JOIN user_role
    ON user_role.site_id = user.site_id
   AND user_role.role_key = 'site_admin'
SET user.role_id = user_role.user_role_id
WHERE user.role_id IS NULL
  AND user.access_level >= 400;

UPDATE user
INNER JOIN user_role
    ON user_role.site_id = user.site_id
   AND user_role.role_key = 'hr_manager'
SET user.role_id = user_role.user_role_id
WHERE user.role_id IS NULL
  AND user.access_level >= 300
  AND user.access_level < 400;

UPDATE user
INNER JOIN user_role
    ON user_role.site_id = user.site_id
   AND user_role.role_key = 'hr_recruiter'
SET user.role_id = user_role.user_role_id
WHERE user.role_id IS NULL
  AND user.access_level >= 200
  AND user.access_level < 300;

UPDATE user
INNER JOIN user_role
    ON user_role.site_id = user.site_id
   AND user_role.role_key = 'top_management'
SET user.role_id = user_role.user_role_id
WHERE user.role_id IS NULL;
