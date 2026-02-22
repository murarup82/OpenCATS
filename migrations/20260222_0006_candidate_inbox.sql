-- 20260222_0006_candidate_inbox.sql
-- Internal candidate messaging inbox (mentions + per-user unread tracking)

CREATE TABLE IF NOT EXISTS `candidate_message_thread` (
    `candidate_message_thread_id` INT(11) NOT NULL AUTO_INCREMENT,
    `site_id` INT(11) NOT NULL,
    `candidate_id` INT(11) NOT NULL,
    `created_by` INT(11) NOT NULL DEFAULT 0,
    `last_message_id` INT(11) DEFAULT NULL,
    `last_message_by` INT(11) DEFAULT NULL,
    `last_message_at` DATETIME DEFAULT NULL,
    `date_created` DATETIME NOT NULL,
    `date_modified` DATETIME DEFAULT NULL,
    PRIMARY KEY (`candidate_message_thread_id`),
    UNIQUE KEY `uniq_site_candidate` (`site_id`, `candidate_id`),
    KEY `idx_site_last_message_at` (`site_id`, `last_message_at`),
    KEY `idx_site_candidate` (`site_id`, `candidate_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `candidate_message` (
    `candidate_message_id` INT(11) NOT NULL AUTO_INCREMENT,
    `site_id` INT(11) NOT NULL,
    `thread_id` INT(11) NOT NULL,
    `candidate_id` INT(11) NOT NULL,
    `sender_user_id` INT(11) NOT NULL,
    `body` TEXT NOT NULL,
    `date_created` DATETIME NOT NULL,
    PRIMARY KEY (`candidate_message_id`),
    KEY `idx_site_thread_created` (`site_id`, `thread_id`, `date_created`),
    KEY `idx_site_candidate` (`site_id`, `candidate_id`),
    KEY `idx_site_sender_created` (`site_id`, `sender_user_id`, `date_created`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `candidate_message_participant` (
    `candidate_message_participant_id` INT(11) NOT NULL AUTO_INCREMENT,
    `site_id` INT(11) NOT NULL,
    `thread_id` INT(11) NOT NULL,
    `user_id` INT(11) NOT NULL,
    `last_read_at` DATETIME DEFAULT NULL,
    `is_archived` TINYINT(1) NOT NULL DEFAULT 0,
    `date_created` DATETIME NOT NULL,
    `date_modified` DATETIME DEFAULT NULL,
    PRIMARY KEY (`candidate_message_participant_id`),
    UNIQUE KEY `uniq_site_thread_user` (`site_id`, `thread_id`, `user_id`),
    KEY `idx_site_user_archived` (`site_id`, `user_id`, `is_archived`),
    KEY `idx_site_thread` (`site_id`, `thread_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `candidate_message_mention` (
    `candidate_message_mention_id` INT(11) NOT NULL AUTO_INCREMENT,
    `site_id` INT(11) NOT NULL,
    `message_id` INT(11) NOT NULL,
    `mentioned_user_id` INT(11) NOT NULL,
    `date_created` DATETIME NOT NULL,
    PRIMARY KEY (`candidate_message_mention_id`),
    UNIQUE KEY `uniq_site_message_user` (`site_id`, `message_id`, `mentioned_user_id`),
    KEY `idx_site_mentioned_user` (`site_id`, `mentioned_user_id`),
    KEY `idx_site_message` (`site_id`, `message_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
