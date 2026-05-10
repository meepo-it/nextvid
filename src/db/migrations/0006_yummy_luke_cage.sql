CREATE TABLE `video_model_config` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_id` text NOT NULL,
	`model_key` text NOT NULL,
	`provider_model_name` text NOT NULL,
	`display_name_en` text NOT NULL,
	`display_name_zh` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`supported_types` text NOT NULL,
	`supported_resolutions` text NOT NULL,
	`supported_aspect_ratios` text NOT NULL,
	`supported_durations` text NOT NULL,
	`default_resolution` text NOT NULL,
	`default_duration` integer NOT NULL,
	`default_aspect_ratio` text NOT NULL,
	`credit_cost_480p` integer DEFAULT 2 NOT NULL,
	`credit_cost_720p` integer DEFAULT 3 NOT NULL,
	`credit_cost_1080p` integer DEFAULT 5 NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `video_provider`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `video_model_provider_idx` ON `video_model_config` (`provider_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `video_model_key_provider_idx` ON `video_model_config` (`model_key`,`provider_id`);--> statement-breakpoint
CREATE TABLE `video_provider` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`display_name` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`api_key_env_var` text NOT NULL,
	`base_url` text,
	`notes` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `video_provider_key_unique` ON `video_provider` (`key`);