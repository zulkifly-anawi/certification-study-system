ALTER TABLE `questions` DROP INDEX `questions_questionId_unique`;--> statement-breakpoint
ALTER TABLE `questions` MODIFY COLUMN `questionId` varchar(50) NOT NULL;