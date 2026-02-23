-- 20260223_0008_personal_dashboard_items.sql
-- Personal dashboard items (My Notes / To-do List)

CREATE TABLE IF NOT EXISTS `user_personal_item` (
    `user_personal_item_id` INT(11) NOT NULL AUTO_INCREMENT,
    `site_id` INT(11) NOT NULL,
    `user_id` INT(11) NOT NULL,
    `item_type` VARCHAR(16) NOT NULL DEFAULT 'note',
    `title` VARCHAR(255) NOT NULL DEFAULT '',
    `body` TEXT NOT NULL,
    `due_date` DATE DEFAULT NULL,
    `is_completed` TINYINT(1) NOT NULL DEFAULT 0,
    `date_completed` DATETIME DEFAULT NULL,
    `date_created` DATETIME NOT NULL,
    `date_modified` DATETIME DEFAULT NULL,
    PRIMARY KEY (`user_personal_item_id`),
    KEY `idx_site_user_type` (`site_id`, `user_id`, `item_type`),
    KEY `idx_site_user_due` (`site_id`, `user_id`, `due_date`),
    KEY `idx_site_user_completed` (`site_id`, `user_id`, `is_completed`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
