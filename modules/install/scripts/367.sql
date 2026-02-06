CREATE TABLE IF NOT EXISTS `candidate_gdpr_requests` (
  `request_id` int(11) NOT NULL auto_increment,
  `site_id` int(11) NOT NULL,
  `candidate_id` int(11) NOT NULL,
  `token_hash` char(64) NOT NULL,
  `status` enum('CREATED','SENT','ACCEPTED','DECLINED','EXPIRED','CANCELED') NOT NULL DEFAULT 'CREATED',
  `created_at` datetime NOT NULL,
  `email_sent_at` datetime DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `accepted_at` datetime DEFAULT NULL,
  `accepted_ip` varchar(45) DEFAULT NULL,
  `accepted_ua` varchar(255) DEFAULT NULL,
  `declined_at` datetime DEFAULT NULL,
  `declined_ip` varchar(45) DEFAULT NULL,
  `declined_ua` varchar(255) DEFAULT NULL,
  `sent_by_user_id` int(11) DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by_user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`request_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `candidate`
  ADD COLUMN `gdpr_signed` tinyint(1) NOT NULL DEFAULT 0,
  ADD COLUMN `gdpr_expiration_date` date DEFAULT NULL;

CREATE UNIQUE INDEX `IDX_gdpr_token_hash`
  ON `candidate_gdpr_requests` (`token_hash`);

CREATE INDEX `IDX_gdpr_status_expires`
  ON `candidate_gdpr_requests` (`site_id`, `status`, `expires_at`);

CREATE INDEX `IDX_gdpr_latest`
  ON `candidate_gdpr_requests` (`site_id`, `candidate_id`, `request_id`);
