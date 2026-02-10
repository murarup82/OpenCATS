ALTER TABLE `candidate_joborder_status_history`
ADD COLUMN `entered_by` INT(11) DEFAULT NULL
AFTER `comment_is_system`;
