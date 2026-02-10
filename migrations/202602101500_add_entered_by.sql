-- Add entered_by to candidate_joborder_status_history if missing.
SET @col_exists := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'candidate_joborder_status_history'
      AND COLUMN_NAME = 'entered_by'
);
SET @sql := IF(
    @col_exists = 0,
    'ALTER TABLE `candidate_joborder_status_history` ADD COLUMN `entered_by` INT(11) DEFAULT NULL AFTER `comment_is_system`',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
