ALTER TABLE `user` ADD `locale` text;--> statement-breakpoint
ALTER TABLE `feature_request` ADD `locale` text DEFAULT 'en' NOT NULL;