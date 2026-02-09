ALTER TABLE `candidate` ADD COLUMN `gdpr_legacy_proof_attachment_id` INT(11) DEFAULT NULL;
ALTER TABLE `candidate` ADD COLUMN `gdpr_legacy_proof_status` ENUM('UNKNOWN','PROOF_FOUND','PROOF_MISSING') NOT NULL DEFAULT 'UNKNOWN';
