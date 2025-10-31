import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import questionBankData from "./question_bank.json";

// Seed questions on server start
(async () => {
  try {
    const questionsToSeed = questionBankData.map((q: any) => ({
      questionId: q.question_id,
      text: q.text,
      options: q.options,
      correctAnswer: q.correct_answer,
      explanation: q.explanation,
      topic: q.topic,
      difficulty: q.difficulty as "easy" | "medium" | "hard",
    }));
    await db.seedQuestions(questionsToSeed);
    console.log(`[Database] Seeded ${questionsToSeed.length} questions`);
  } catch (error) {
    console.error("[Database] Failed to seed questions:", error);
  }
})();

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  questions: router({
    // Get random questions for practice
    getRandom: protectedProcedure
      .input(z.object({ count: z.number().min(1).max(150) }))
      .query(async ({ input }) => {
        return await db.getRandomQuestions(input.count);
      }),

    // Get questions by topic
    getByTopic: protectedProcedure
      .input(z.object({ 
        topic: z.string(),
        count: z.number().min(1).max(150)
      }))
      .query(async ({ input }) => {
        return await db.getQuestionsByTopic(input.topic, input.count);
      }),

    // Get all available topics
    getTopics: protectedProcedure
      .query(async () => {
        return await db.getAllTopics();
      }),

    // Get a specific question by ID
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getQuestionById(input.id);
      }),
  }),

  sessions: router({
    // Start a new practice session
    start: protectedProcedure
      .input(z.object({
        sessionType: z.enum(["practice", "quiz", "exam", "topic"]),
        topic: z.string().optional(),
        totalQuestions: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const sessionId = await db.createSession({
          userId: ctx.user.id,
          sessionType: input.sessionType,
          topic: input.topic || null,
          totalQuestions: input.totalQuestions,
          correctAnswers: 0,
          score: 0,
          startedAt: new Date(),
        });
        return { sessionId };
      }),

    // Submit an answer for a question in a session
    submitAnswer: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        questionId: z.number(),
        userAnswer: z.string().length(1),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get the question to check if answer is correct
        const question = await db.getQuestionById(input.questionId);
        if (!question) {
          throw new Error("Question not found");
        }

        const isCorrect = question.correctAnswer === input.userAnswer;

        // Save the answer
        await db.saveSessionAnswer({
          sessionId: input.sessionId,
          questionId: input.questionId,
          userAnswer: input.userAnswer,
          isCorrect,
          answeredAt: new Date(),
        });

        // Update topic progress
        await db.updateTopicProgress(ctx.user.id, question.topic, isCorrect);

        return {
          isCorrect,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
        };
      }),

    // Complete a session and calculate final score
    complete: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        durationSeconds: z.number(),
      }))
      .mutation(async ({ input }) => {
        // Get all answers for this session
        const answers = await db.getSessionAnswers(input.sessionId);
        const correctCount = answers.filter(a => a.isCorrect).length;
        const totalCount = answers.length;
        const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

        // Update session
        await db.updateSession(input.sessionId, {
          correctAnswers: correctCount,
          score,
          completedAt: new Date(),
          durationSeconds: input.durationSeconds,
        });

        return {
          correctAnswers: correctCount,
          totalQuestions: totalCount,
          score,
        };
      }),

    // Get user's session history
    getHistory: protectedProcedure
      .input(z.object({ limit: z.number().optional().default(10) }))
      .query(async ({ ctx, input }) => {
        return await db.getUserSessions(ctx.user.id, input.limit);
      }),

    // Get details of a specific session
    getById: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }) => {
        const session = await db.getSessionById(input.sessionId);
        if (!session) return null;

        const answers = await db.getSessionAnswers(input.sessionId);
        return { ...session, answers };
      }),
  }),

  progress: router({
    // Get user's overall statistics
    getStats: protectedProcedure
      .query(async ({ ctx }) => {
        const stats = await db.getUserStats(ctx.user.id);
        const topicProgress = await db.getUserTopicProgress(ctx.user.id);
        
        return {
          ...stats,
          topicProgress,
        };
      }),

    // Get user's progress by topic
    getByTopic: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUserTopicProgress(ctx.user.id);
      }),

    // Get weak topics (below threshold accuracy)
    getWeakTopics: protectedProcedure
      .input(z.object({ threshold: z.number().optional().default(75) }))
      .query(async ({ ctx, input }) => {
        return await db.getWeakTopics(ctx.user.id, input.threshold);
      }),
  }),

  admin: router({
    importQuestions: adminProcedure
      .input(z.object({
        questions: z.array(z.object({
          text: z.string(),
          options: z.record(z.string(), z.string()), // Flexible options: A-D (standard) or A-Z (matching)
          correctAnswer: z.string().regex(/^[A-Z]$/, "Must be a single letter A-Z"),
          explanation: z.string().optional(),
          topic: z.string(),
          difficulty: z.enum(['easy', 'medium', 'hard']).optional().default('medium'),
        }))
      }))
      .mutation(async ({ input }) => {
        try {
          const timestamp = Date.now();
          const questionsToImport = input.questions.map((q, index) => {
            const uniqueId = `Q${timestamp}_${Math.random().toString(36).substr(2, 9)}_${index}`;
            return {
              questionId: uniqueId,
              text: q.text,
              options: q.options as Record<string, string>,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation || "See course materials for detailed explanation",
              topic: q.topic,
              difficulty: q.difficulty as "easy" | "medium" | "hard",
            };
          });

          console.log(`[Admin] Importing ${questionsToImport.length} questions`);
          await db.seedQuestions(questionsToImport);
          
          return {
            success: true,
            imported: questionsToImport.length,
            message: `Successfully imported ${questionsToImport.length} questions`,
          };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.error(`[Admin] Import failed: ${errorMsg}`);
          throw new Error(`Failed to import questions: ${errorMsg}`);
        }
      }),

    exportQuestions: adminProcedure
      .query(async () => {
        try {
          const allQuestions = await db.getAllQuestions();
          
          const formattedQuestions = allQuestions.map(q => ({
            text: q.text,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            topic: q.topic,
            difficulty: q.difficulty,
          }));

          return {
            success: true,
            questions: formattedQuestions,
            totalCount: formattedQuestions.length,
            exportedAt: new Date().toISOString(),
          };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.error(`[Admin] Export failed: ${errorMsg}`);
          throw new Error(`Failed to export questions: ${errorMsg}`);
        }
      }),
  }),
});
