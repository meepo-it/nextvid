CREATE TABLE `user_credit` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`current_credits` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_credit_user_id_unique` ON `user_credit` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_credit_user_id_idx` ON `user_credit` (`user_id`);--> statement-breakpoint
CREATE TABLE `video_generation` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`model` text NOT NULL,
	`provider_model` text NOT NULL,
	`prompt` text,
	`negative_prompt` text,
	`image_url` text,
	`video_url` text,
	`media_urls` text,
	`resolution` text NOT NULL,
	`duration` integer NOT NULL,
	`aspect_ratio` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`provider_task_id` text,
	`output_video_url` text,
	`output_duration` integer,
	`provider_prompt` text,
	`credits_used` integer DEFAULT 0 NOT NULL,
	`error_message` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `video_gen_user_id_idx` ON `video_generation` (`user_id`);--> statement-breakpoint
CREATE INDEX `video_gen_status_idx` ON `video_generation` (`status`);--> statement-breakpoint
CREATE INDEX `video_gen_type_idx` ON `video_generation` (`type`);--> statement-breakpoint
CREATE INDEX `video_gen_created_at_idx` ON `video_generation` (`created_at`);