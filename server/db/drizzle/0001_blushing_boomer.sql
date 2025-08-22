CREATE TABLE `user_auth` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`cmp_token` varchar(1200) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_auth_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `user` ADD `regional` varchar(255);--> statement-breakpoint
ALTER TABLE `user` ADD `wilayah` varchar(255);--> statement-breakpoint
ALTER TABLE `user` ADD `company` varchar(255);--> statement-breakpoint
ALTER TABLE `user` ADD `company_abbr` varchar(255);--> statement-breakpoint
ALTER TABLE `user` ADD `company_name` varchar(255);--> statement-breakpoint
ALTER TABLE `user` ADD `dept_id` varchar(255);--> statement-breakpoint
ALTER TABLE `user` ADD `dept_abbr` varchar(255);--> statement-breakpoint
ALTER TABLE `user` ADD `dept_name` varchar(255);--> statement-breakpoint
ALTER TABLE `user_auth` ADD CONSTRAINT `user_auth_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;