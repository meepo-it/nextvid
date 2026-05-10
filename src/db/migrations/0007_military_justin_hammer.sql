DROP TABLE IF EXISTS `feature_request`;--> statement-breakpoint
DROP TABLE IF EXISTS `feature_vote`;--> statement-breakpoint
ALTER TABLE `user_credit` ADD `last_credit_reset_at` integer;