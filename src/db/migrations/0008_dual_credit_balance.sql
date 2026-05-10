ALTER TABLE `user_credit` RENAME COLUMN `current_credits` TO `subscription_credits`;--> statement-breakpoint
ALTER TABLE `user_credit` ADD `pack_credits` integer NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `user_credit` ADD `pack_credits_expires_at` integer;