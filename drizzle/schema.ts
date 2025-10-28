import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Question bank table storing all CAPM practice questions
 */
export const questions = mysqlTable("questions", {
  id: int("id").autoincrement().primaryKey(),
  questionId: varchar("questionId", { length: 20 }).notNull().unique(), // e.g., Q001, Q002
  text: text("text").notNull(),
  options: json("options").notNull().$type<{ A: string; B: string; C: string; D: string }>(),
  correctAnswer: varchar("correctAnswer", { length: 1 }).notNull(), // A, B, C, or D
  explanation: text("explanation").notNull(),
  topic: varchar("topic", { length: 100 }).notNull(),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;

/**
 * Practice sessions - tracks each time a user takes a practice test
 */
export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sessionType: mysqlEnum("sessionType", ["practice", "quiz", "exam", "topic"]).notNull(),
  topic: varchar("topic", { length: 100 }), // null for general practice, specific for topic practice
  totalQuestions: int("totalQuestions").notNull(),
  correctAnswers: int("correctAnswers").notNull(),
  score: int("score").notNull(), // percentage (0-100)
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  durationSeconds: int("durationSeconds"), // time taken to complete
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

/**
 * Session answers - tracks individual question responses within a session
 */
export const sessionAnswers = mysqlTable("sessionAnswers", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  questionId: int("questionId").notNull(),
  userAnswer: varchar("userAnswer", { length: 1 }).notNull(), // A, B, C, or D
  isCorrect: boolean("isCorrect").notNull(),
  answeredAt: timestamp("answeredAt").defaultNow().notNull(),
});

export type SessionAnswer = typeof sessionAnswers.$inferSelect;
export type InsertSessionAnswer = typeof sessionAnswers.$inferInsert;

/**
 * User progress by topic - aggregated statistics
 */
export const topicProgress = mysqlTable("topicProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  topic: varchar("topic", { length: 100 }).notNull(),
  totalAttempts: int("totalAttempts").notNull().default(0),
  correctAttempts: int("correctAttempts").notNull().default(0),
  accuracy: int("accuracy").notNull().default(0), // percentage (0-100)
  lastPracticedAt: timestamp("lastPracticedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TopicProgress = typeof topicProgress.$inferSelect;
export type InsertTopicProgress = typeof topicProgress.$inferInsert;
