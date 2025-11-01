import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import questionBankData from "./question_bank.json";
import { eq, desc } from "drizzle-orm";
import { certifications, questions } from "../drizzle/schema";

// Auto-seeding disabled - questions are now managed through Admin Import Panel
// Uncomment below to re-enable if needed
/*
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
*/

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
      .input(z.object({ 
        count: z.number().min(1).max(150),
        certification: z.string().default('CAPM')
      }))
      .query(async ({ input }) => {
        return await db.getRandomQuestions(input.count, input.certification);
      }),

    // Get questions by topic
    getByTopic: protectedProcedure
      .input(z.object({ 
        topic: z.string(),
        count: z.number().min(1).max(150),
        certification: z.string().default('CAPM')
      }))
      .query(async ({ input }) => {
        return await db.getQuestionsByTopic(input.topic, input.count, input.certification);
      }),

    // Get all available topics
    getTopics: protectedProcedure
      .input(z.object({ 
        certification: z.string().default('CAPM')
      }).optional())
      .query(async ({ input }) => {
        return await db.getAllTopics(input?.certification || 'CAPM');
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
        certification: z.string().default('CAPM'),
      }))
      .mutation(async ({ ctx, input }) => {
        const sessionId = await db.createSession({
          userId: ctx.user.id,
          certification: input.certification,
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
        userAnswer: z.string().regex(/^[A-Z](,[A-Z])*$/, "Must be a single letter A-Z or comma-separated (e.g., 'A,C')"),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get the question to check if answer is correct
        const question = await db.getQuestionById(input.questionId);
        if (!question) {
          throw new Error("Question not found");
        }

        // Support both single and multiple correct answers (e.g., 'A' or 'A,C')
        // Also support user selecting multiple answers (e.g., 'A,C')
        const correctAnswers = new Set(question.correctAnswer.split(',').map(a => a.trim()));
        const userAnswers = new Set(input.userAnswer.split(',').map(a => a.trim()));
        
        // Check if user answers match correct answers exactly (order-independent)
        const isCorrect = correctAnswers.size === userAnswers.size && 
                         Array.from(correctAnswers).every(a => userAnswers.has(a));

        // Save the answer
        await db.saveSessionAnswer({
          sessionId: input.sessionId,
          questionId: input.questionId,
          userAnswer: input.userAnswer,
          isCorrect,
          answeredAt: new Date(),
        });
        // Note: correctAnswer can be comma-separated for multiple correct answers

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
      .input(z.object({ 
        limit: z.number().optional().default(10),
        certification: z.string().default('CAPM')
      }))
      .query(async ({ ctx, input }) => {
        return await db.getUserSessions(ctx.user.id, input.limit, input.certification);
      }),

    // Get details of a specific session
    getById: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ ctx, input }) => {
        const session = await db.getSessionById(input.sessionId);
        if (!session) return null;

        // SECURITY: Verify session belongs to current user
        if (session.userId !== ctx.user.id) {
          throw new Error("Unauthorized: This session does not belong to you");
        }

        const answers = await db.getSessionAnswers(input.sessionId);
        return { ...session, answers };
      }),
  }),

  progress: router({
    // Get user's overall statistics
    getStats: protectedProcedure
      .input(z.object({ 
        certification: z.string().default('CAPM')
      }))
      .query(async ({ ctx, input }) => {
        const stats = await db.getUserStats(ctx.user.id, input.certification);
        const topicProgress = await db.getUserTopicProgress(ctx.user.id, input.certification);
        
        return {
          ...stats,
          topicProgress,
        };
      }),

    // Get user's progress by topic
    getByTopic: protectedProcedure
      .input(z.object({ 
        certification: z.string().default('CAPM')
      }))
      .query(async ({ ctx, input }) => {
        return await db.getUserTopicProgress(ctx.user.id, input.certification);
      }),

    // Get weak topics (below threshold accuracy)
    getWeakTopics: protectedProcedure
      .input(z.object({ 
        threshold: z.number().optional().default(75),
        certification: z.string().default('CAPM')
      }))
      .query(async ({ ctx, input }) => {
        return await db.getWeakTopics(ctx.user.id, input.threshold, input.certification);
      }),
  }),

  admin: router({
    importQuestions: adminProcedure
      .input(z.object({
        questions: z.array(z.object({
          text: z.string(),
          options: z.record(z.string(), z.string()), // Flexible options: A-D (standard) or A-Z (matching)
          correctAnswer: z.string().regex(/^[A-Z](,[A-Z])*$/, "Must be a single letter A-Z or comma-separated (e.g., 'A,C')"),
          explanation: z.string().optional(),
          topic: z.string(),
          difficulty: z.enum(['easy', 'medium', 'hard']).optional().default('medium'),
          // correctAnswer can be single or multiple (e.g., 'A' or 'A,C')
        })),
        certification: z.string().default('CAPM')
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
              certification: input.certification,
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
      .input(z.object({ 
        certification: z.string().default('CAPM')
      }))
      .query(async ({ input }) => {
        try {
          const allQuestions = await db.getAllQuestions(input.certification);
          
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

    getAllQuestionsForEdit: adminProcedure
      .input(z.object({ 
        certification: z.string().default('CAPM')
      }))
      .query(async ({ input }) => {
        try {
          const allQuestions = await db.getAllQuestions(input.certification);
          return {
            success: true,
            questions: allQuestions,
            totalCount: allQuestions.length,
          };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.error(`[Admin] Get all questions failed: ${errorMsg}`);
          throw new Error(`Failed to get questions: ${errorMsg}`);
        }
      }),

    uploadQuestionImage: adminProcedure
      .input(z.object({
        fileName: z.string(),
        fileData: z.string(), // base64 encoded file data
      }))
      .mutation(async ({ input }) => {
        try {
          const { storagePut } = await import('./storage');
          
          // Convert base64 to buffer
          const buffer = Buffer.from(input.fileData, 'base64');
          
          // Generate unique file key
          const timestamp = Date.now();
          const randomSuffix = Math.random().toString(36).substr(2, 9);
          const fileKey = `questions/images/${timestamp}-${randomSuffix}-${input.fileName}`;
          
          // Upload to S3
          const { url } = await storagePut(fileKey, buffer, 'image/jpeg');
          
          return {
            success: true,
            url,
            message: "Image uploaded successfully",
          };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.error(`[Admin] Image upload failed: ${errorMsg}`);
          throw new Error(`Failed to upload image: ${errorMsg}`);
        }
      }),

    updateQuestion: adminProcedure
      .input(z.object({
        id: z.number(),
        text: z.string().optional(),
        options: z.record(z.string(), z.string()).optional(),
        correctAnswer: z.string().optional(),
        explanation: z.string().optional(),
        topic: z.string().optional(),
        difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
        mediaUrl: z.string().nullable().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const { id, ...updates } = input;
          // Filter out null values to avoid updating with null
          const filteredUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
          );
          await db.updateQuestion(id, filteredUpdates);
          return {
            success: true,
            message: "Question updated successfully",
          };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.error(`[Admin] Update question failed: ${errorMsg}`);
          throw new Error(`Failed to update question: ${errorMsg}`);
        }
      }),

    deleteQuestion: adminProcedure
      .input(z.object({
        id: z.number(),
        certification: z.string().default('CAPM'),
      }))
      .mutation(async ({ input }) => {
        try {
          const database = await db.getDb();
          if (!database) throw new Error("Database not available");
          
          // Verify question exists and belongs to the selected certification
          const question = await database.select().from(questions).where(eq(questions.id, input.id)).limit(1);
          if (question.length === 0) {
            throw new Error("Question not found");
          }
          
          if (question[0].certification !== input.certification) {
            throw new Error("Cannot delete question from a different certification");
          }
          
          // Delete the question
          await database.delete(questions).where(eq(questions.id, input.id));
          
          return {
            success: true,
            message: "Question deleted successfully",
          };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.error(`[Admin] Delete question failed: ${errorMsg}`);
          throw new Error(`Failed to delete question: ${errorMsg}`);
        }
      }),

    createQuestion: adminProcedure
      .input(z.object({
        text: z.string().min(1, "Question text is required"),
        options: z.record(z.string(), z.string()),
        correctAnswer: z.string().min(1, "Correct answer is required"),
        explanation: z.string().optional(),
        topic: z.string().min(1, "Topic is required"),
        difficulty: z.enum(["easy", "medium", "hard"]),
        mediaUrl: z.string().optional(),
        certification: z.string().default('CAPM'),
      }))
      .mutation(async ({ input }) => {
        try {
          const database = await db.getDb();
          if (!database) throw new Error("Database not available");
          
          // Verify certification exists
          const cert = await database.select().from(certifications).where(eq(certifications.code, input.certification)).limit(1);
          if (cert.length === 0) {
            throw new Error(`Certification '${input.certification}' not found`);
          }
          
          // Get the next question ID for this certification
          const lastQuestion = await database.select().from(questions)
            .where(eq(questions.certification, input.certification))
            .orderBy(desc(questions.id))
            .limit(1);
          
          const nextId = lastQuestion.length > 0 ? lastQuestion[0].id + 1 : 1;
          const questionId = `${input.certification}-${nextId}`;
          
          // Insert the new question
          const insertData = {
            questionId: questionId,
            text: input.text,
            options: input.options as Record<string, string>,
            correctAnswer: input.correctAnswer,
            explanation: input.explanation || "",
            topic: input.topic,
            difficulty: input.difficulty as "easy" | "medium" | "hard",
            certification: input.certification,
          } as any;
          if (input.mediaUrl) {
            insertData.mediaUrl = input.mediaUrl;
          }
          await database.insert(questions).values(insertData);
          
          return {
            success: true,
            message: "Question created successfully",
            questionId: questionId,
          };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.error(`[Admin] Create question failed: ${errorMsg}`);
          throw new Error(`Failed to create question: ${errorMsg}`);
        }
      }),

    addCertification: adminProcedure
      .input(z.object({
        code: z.string().min(1, "Code is required"),
        name: z.string().min(1, "Name is required"),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const database = await db.getDb();
          if (!database) throw new Error("Database not available");
          
          const existing = await database.select().from(certifications).where(eq(certifications.code, input.code)).limit(1);
          if (existing.length > 0) {
            throw new Error(`Certification with code '${input.code}' already exists`);
          }
          
          await database.insert(certifications).values({
            code: input.code,
            name: input.name,
            description: input.description,
          });
          
          return { success: true, message: "Certification added successfully" };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          throw new Error(`Failed to add certification: ${errorMsg}`);
        }
      }),

    updateCertification: adminProcedure
      .input(z.object({
        code: z.string().min(1, "Code is required"),
        name: z.string().min(1, "Name is required"),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const database = await db.getDb();
          if (!database) throw new Error("Database not available");
          
          await database.update(certifications)
            .set({
              name: input.name,
              description: input.description,
            })
            .where(eq(certifications.code, input.code));
          
          return { success: true, message: "Certification updated successfully" };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          throw new Error(`Failed to update certification: ${errorMsg}`);
        }
      }),

    deleteCertification: adminProcedure
      .input(z.object({
        code: z.string().min(1, "Code is required"),
      }))
      .mutation(async ({ input }) => {
        try {
          const database = await db.getDb();
          if (!database) throw new Error("Database not available");
          
          const questionsCount = await database.select().from(questions)
            .where(eq(questions.certification, input.code))
            .limit(1);
          
          if (questionsCount.length > 0) {
            throw new Error(`Cannot delete certification '${input.code}' because it has questions. Please delete all questions first.`);
          }
          
          if (['CAPM', 'PSM1', 'PMP'].includes(input.code)) {
            throw new Error(`Cannot delete built-in certification '${input.code}'`);
          }
          
          await database.delete(certifications).where(eq(certifications.code, input.code));
          
          return { success: true, message: "Certification deleted successfully" };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          throw new Error(`Failed to delete certification: ${errorMsg}`);
        }
      }),
  }),

  certifications: router({
    getAll: protectedProcedure
      .query(async () => {
        const database = await db.getDb();
        if (!database) return [];
        const { certifications } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        return await database.select().from(certifications).where(eq(certifications.isActive, true));
      }),
  }),
});
