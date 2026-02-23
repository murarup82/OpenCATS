-- 20260223_0009_personal_dashboard_priority_reminder.sql
-- Adds priority and reminder support for personal to-do items.

ALTER TABLE `user_personal_item`
    ADD COLUMN `priority` VARCHAR(16) NOT NULL DEFAULT 'medium' AFTER `due_date`,
    ADD COLUMN `reminder_at` DATETIME DEFAULT NULL AFTER `priority`,
    ADD KEY `idx_site_user_reminder` (`site_id`, `user_id`, `reminder_at`, `is_completed`);
