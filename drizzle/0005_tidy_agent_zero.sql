CREATE TABLE `certifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`totalQuestions` int NOT NULL DEFAULT 0,
	`examDuration` int NOT NULL DEFAULT 180,
	`passingScore` int NOT NULL DEFAULT 70,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `certifications_id` PRIMARY KEY(`id`),
	CONSTRAINT `certifications_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
ALTER TABLE `questions` ADD `certification` varchar(50) DEFAULT 'CAPM' NOT NULL;--> statement-breakpoint
ALTER TABLE `sessions` ADD `certification` varchar(50) DEFAULT 'CAPM' NOT NULL;--> statement-breakpoint
ALTER TABLE `topicProgress` ADD `certification` varchar(50) DEFAULT 'CAPM' NOT NULL;