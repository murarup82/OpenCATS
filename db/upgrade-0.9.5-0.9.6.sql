/* Upgrade file for DB schema update from version 0.9.5 to 0.9.6 */

/* Add GDPR tracking columns to candidate table */
ALTER TABLE `candidate`
ADD COLUMN `gdpr_signed` int(1) NOT NULL DEFAULT '0' AFTER `best_time_to_call`,
ADD COLUMN `gdpr_expiration_date` date DEFAULT NULL AFTER `gdpr_signed`;

/* Initialize GDPR expiration defaults for all sites */
DELETE FROM `settings`
WHERE `setting` = 'gdprExpirationYears'
  AND `settings_type` = 5;

INSERT INTO `settings` (
    `setting`,
    `value`,
    `site_id`,
    `settings_type`
)
SELECT
    'gdprExpirationYears',
    '2',
    `site`.`site_id`,
    5
FROM
    `site`;
