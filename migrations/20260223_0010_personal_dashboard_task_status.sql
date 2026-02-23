-- 20260223_0010_personal_dashboard_task_status.sql
-- Adds Kanban task status support for personal to-do items.

ALTER TABLE `user_personal_item`
    ADD COLUMN `task_status` VARCHAR(32) NOT NULL DEFAULT 'open' AFTER `priority`,
    ADD KEY `idx_site_user_status` (`site_id`, `user_id`, `task_status`, `is_completed`);

UPDATE `user_personal_item`
SET
    task_status = CASE
        WHEN is_completed = 1 THEN 'done'
        ELSE 'open'
    END
WHERE
    task_status IS NULL OR task_status = '';
