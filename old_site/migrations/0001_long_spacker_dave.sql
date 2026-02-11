CREATE TABLE `banners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`image_url` varchar(500) NOT NULL,
	`link` varchar(500),
	`active` boolean NOT NULL DEFAULT true,
	`order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `banners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gallery` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`type` varchar(20) NOT NULL,
	`media_url` varchar(500) NOT NULL,
	`description` text,
	`active` boolean NOT NULL DEFAULT true,
	`order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gallery_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `solicitacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipo_solicitacao` varchar(100) NOT NULL,
	`nome_solicitacao` varchar(255) NOT NULL,
	`dados_formulario` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `solicitacoes_id` PRIMARY KEY(`id`)
);
