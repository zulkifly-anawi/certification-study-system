CREATE TABLE `questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`questionId` varchar(20) NOT NULL,
	`text` text NOT NULL,
	`options` json NOT NULL,
	`correctAnswer` varchar(1) NOT NULL,
	`explanation` text NOT NULL,
	`topic` varchar(100) NOT NULL,
	`difficulty` enum('easy','medium','hard') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `questions_id` PRIMARY KEY(`id`),
	CONSTRAINT `questions_questionId_unique` UNIQUE(`questionId`)
);
--> statement-breakpoint
CREATE TABLE `sessionAnswers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`questionId` int NOT NULL,
	`userAnswer` varchar(1) NOT NULL,
	`isCorrect` boolean NOT NULL,
	`answeredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sessionAnswers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionType` enum('practice','quiz','exam','topic') NOT NULL,
	`topic` varchar(100),
	`totalQuestions` int NOT NULL,
	`correctAnswers` int NOT NULL,
	`score` int NOT NULL,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`durationSeconds` int,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `topicProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`topic` varchar(100) NOT NULL,
	`totalAttempts` int NOT NULL DEFAULT 0,
	`correctAttempts` int NOT NULL DEFAULT 0,
	`accuracy` int NOT NULL DEFAULT 0,
	`lastPracticedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `topicProgress_id` PRIMARY KEY(`id`)
);
