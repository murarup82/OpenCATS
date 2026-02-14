-- 20260214_0005_saved_list_user_access_phase1.sql
-- Phase 1 list access assignments:
--   1) optional per-list user assignments
--   2) per-user edit flag for list membership actions

CREATE TABLE IF NOT EXISTS `saved_list_user_access` (
    `saved_list_user_access_id` INT(11) NOT NULL AUTO_INCREMENT,
    `site_id` INT(11) NOT NULL,
    `saved_list_id` INT(11) NOT NULL,
    `user_id` INT(11) NOT NULL,
    `can_edit` TINYINT(1) NOT NULL DEFAULT 0,
    `created_by` INT(11) NOT NULL DEFAULT 0,
    `date_created` DATETIME NOT NULL,
    `date_modified` DATETIME DEFAULT NULL,
    PRIMARY KEY (`saved_list_user_access_id`),
    UNIQUE KEY `uniq_site_list_user` (`site_id`, `saved_list_id`, `user_id`),
    KEY `idx_site_saved_list` (`site_id`, `saved_list_id`),
    KEY `idx_site_user` (`site_id`, `user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

