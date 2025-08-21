CREATE TABLE `coordinate_history` (
	`id` varchar(255) NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`timestamp` timestamp NOT NULL,
	`lat` decimal(10,8) NOT NULL,
	`lon` decimal(10,8) NOT NULL,
	`accuracy` bigint unsigned NOT NULL,
	`speed` decimal(10,2) NOT NULL,
	`bearing` bigint unsigned NOT NULL,
	`activity` varchar(255) NOT NULL,
	`battery` bigint unsigned NOT NULL,
	`network` varchar(255) NOT NULL,
	`provider` varchar(255) NOT NULL,
	`inside_geofence` boolean NOT NULL DEFAULT false,
	`h3_index` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `coordinate_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`username` varchar(255) NOT NULL,
	`nama` varchar(255) NOT NULL,
	`jabatan` varchar(255) NOT NULL,
	`kemandoran` bigint unsigned,
	`kemandoran_ppro` bigint unsigned,
	`kemandoran_nama` varchar(255),
	`kemandoran_kode` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `user_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `coordinate_history` ADD CONSTRAINT `coordinate_history_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_user_id` ON `coordinate_history` (`user_id`);