/* OpenCATS custom upgrade for pipeline/status history extensions. */

ALTER TABLE `candidate_joborder`
    ADD COLUMN `is_active` int(1) NOT NULL DEFAULT '1' AFTER `status`,
    ADD COLUMN `closed_at` datetime DEFAULT NULL AFTER `is_active`,
    ADD COLUMN `closed_by` int(11) DEFAULT NULL AFTER `closed_at`;

ALTER TABLE `candidate_joborder_status_history`
    ADD COLUMN `comment_text` text COLLATE utf8_unicode_ci,
    ADD COLUMN `comment_is_system` int(1) NOT NULL DEFAULT '0',
    ADD COLUMN `rejection_reason_other` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
    ADD COLUMN `edited_at` datetime DEFAULT NULL,
    ADD COLUMN `edited_by` int(11) DEFAULT NULL,
    ADD COLUMN `edit_note` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL;

CREATE TABLE `rejection_reason` (
    `rejection_reason_id` int(11) NOT NULL AUTO_INCREMENT,
    `label` varchar(128) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
    `created_at` datetime NOT NULL DEFAULT '1000-01-01 00:00:00',
    `updated_at` datetime NOT NULL DEFAULT '1000-01-01 00:00:00',
    PRIMARY KEY (`rejection_reason_id`),
    KEY `IDX_rejection_reason_label` (`label`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT IGNORE INTO `rejection_reason` (`rejection_reason_id`, `label`, `created_at`, `updated_at`) VALUES
    (1, 'FAILED SOFT SKILL', '1000-01-01 00:00:00', '1000-01-01 00:00:00'),
    (2, 'FAILED TECH INTERVIEW', '1000-01-01 00:00:00', '1000-01-01 00:00:00'),
    (3, 'NOT MATCHED / NO INTEREST', '1000-01-01 00:00:00', '1000-01-01 00:00:00'),
    (4, 'ALREADY IN CUSTOMER DATABASE', '1000-01-01 00:00:00', '1000-01-01 00:00:00'),
    (5, 'POSITION CLOSED', '1000-01-01 00:00:00', '1000-01-01 00:00:00'),
    (6, 'FINANCIAL REASON', '1000-01-01 00:00:00', '1000-01-01 00:00:00'),
    (7, 'WORKPLACE ENVIRONMENT', '1000-01-01 00:00:00', '1000-01-01 00:00:00'),
    (8, 'ACCEPT ANOTHER OFFER', '1000-01-01 00:00:00', '1000-01-01 00:00:00'),
    (9, 'PERSONAL REASONS', '1000-01-01 00:00:00', '1000-01-01 00:00:00'),
    (10, 'OTHER REASONS / NOT MENTIONED', '1000-01-01 00:00:00', '1000-01-01 00:00:00');

CREATE TABLE `status_history_rejection_reason` (
    `status_history_id` int(11) NOT NULL,
    `rejection_reason_id` int(11) NOT NULL,
    PRIMARY KEY (`status_history_id`, `rejection_reason_id`),
    KEY `IDX_rejection_reason_id` (`rejection_reason_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT IGNORE INTO `candidate_joborder_status`
    (`candidate_joborder_status_id`, `short_description`, `can_be_scheduled`, `triggers_email`, `is_enabled`)
VALUES
    (9000, 'Allocated', 0, 0, 1),
    (9001, 'Delivery Validated', 0, 0, 1),
    (9002, 'Proposed to Customer', 0, 0, 1),
    (9003, 'Customer Interview', 0, 0, 1),
    (9004, 'Customer Approved', 0, 0, 1),
    (9005, 'Avel Approved', 0, 0, 1),
    (9006, 'Offer Negotiation', 0, 0, 1),
    (9007, 'Offer Accepted', 0, 0, 1),
    (9008, 'Rejected', 0, 0, 1);

UPDATE `candidate_joborder_status`
    SET `short_description` = 'Hired'
    WHERE `candidate_joborder_status_id` = 800;
