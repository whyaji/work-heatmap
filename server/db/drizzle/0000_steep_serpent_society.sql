CREATE TABLE `coordinate_history` (
	`id` varchar(36) NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`timestamp` timestamp NOT NULL,
	`lat` decimal(11,8) NOT NULL,
	`lon` decimal(11,8) NOT NULL,
	`accuracy` int unsigned NOT NULL,
	`speed` decimal(8,2),
	`bearing` int unsigned,
	`activity` varchar(50),
	`battery` tinyint unsigned,
	`network` varchar(20),
	`provider` varchar(50),
	`inside_geofence` boolean DEFAULT false,
	`h3index` varchar(50),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `coordinate_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`username` varchar(255),
	`nama` varchar(255),
	`jabatan` varchar(255),
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