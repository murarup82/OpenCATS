ALTER TABLE candidate_gdpr_requests ADD COLUMN accepted_lang VARCHAR(5) DEFAULT NULL;
ALTER TABLE candidate_gdpr_requests ADD COLUMN notice_version CHAR(64) DEFAULT NULL;
ALTER TABLE candidate_gdpr_requests ADD COLUMN email_to_hash CHAR(64) DEFAULT NULL;
