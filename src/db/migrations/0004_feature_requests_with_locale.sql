CREATE TABLE `feature_request` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`status` text DEFAULT 'submitted' NOT NULL,
	`category` text,
	`locale` text DEFAULT 'en' NOT NULL,
	`user_id` text NOT NULL,
	`vote_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `feature_request_user_id_idx` ON `feature_request` (`user_id`);--> statement-breakpoint
CREATE INDEX `feature_request_status_idx` ON `feature_request` (`status`);--> statement-breakpoint
CREATE INDEX `feature_request_vote_count_idx` ON `feature_request` (`vote_count`);--> statement-breakpoint
CREATE TABLE `feature_vote` (
	`id` text PRIMARY KEY NOT NULL,
	`feature_request_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`feature_request_id`) REFERENCES `feature_request`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `feature_vote_unique_idx` ON `feature_vote` (`feature_request_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `feature_vote_feature_id_idx` ON `feature_vote` (`feature_request_id`);--> statement-breakpoint
CREATE INDEX `feature_vote_user_id_idx` ON `feature_vote` (`user_id`);--> statement-breakpoint
ALTER TABLE `user` ADD `locale` text;