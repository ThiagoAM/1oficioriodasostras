CREATE TABLE `contact_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`telefone` varchar(20) NOT NULL,
	`mensagem` text NOT NULL,
	`lido` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contact_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `google_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`place_id` varchar(255),
	`api_key` varchar(255),
	`reviews_json` text,
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `google_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`url` varchar(500) NOT NULL,
	`order` int NOT NULL DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `news` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`image_url` varchar(500),
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `news_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pages_id` PRIMARY KEY(`id`),
	CONSTRAINT `pages_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `scripts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`google_tag_manager` text,
	`facebook_pixel` text,
	`google_analytics` text,
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scripts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `social_media` (
	`id` int AUTO_INCREMENT NOT NULL,
	`youtube` varchar(500),
	`instagram` varchar(500),
	`facebook` varchar(500),
	`tiktok` varchar(500),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `social_media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `contacts` MODIFY COLUMN `email` text;