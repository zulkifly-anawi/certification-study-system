import { eq, and, sql, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  questions, 
  sessions, 
  sessionAnswers, 
  topicProgress,
  InsertQuestion,
  InsertSession,
  InsertSessionAnswer,
  InsertTopicProgress
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ Question Bank Functions ============

export async function seedQuestions(questionList: InsertQuestion[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Use INSERT IGNORE to skip duplicates instead of onDuplicateKeyUpdate
  // This avoids issues with large JSON payloads in the update clause
  for (const q of questionList) {
    try {
      await db.insert(questions).values(q);
    } catch (error: any) {
      // Ignore duplicate key errors
      if (error?.code !== 'ER_DUP_ENTRY') {
        throw error;
      }
    }
  }
}

export async function getRandomQuestions(count: number, certification: string = 'CAPM') {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(questions)
    .where(eq(questions.certification, certification))
    .orderBy(sql`RAND()`)
    .limit(count);

  return result;
}

export async function getQuestionsByTopic(topic: string, count: number, certification: string = 'CAPM') {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(questions)
    .where(and(eq(questions.topic, topic), eq(questions.certification, certification)))
    .orderBy(sql`RAND()`)
    .limit(count);

  return result;
}

export async function getAllTopics(certification: string = 'CAPM') {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .selectDistinct({ topic: questions.topic })
    .from(questions)
    .where(eq(questions.certification, certification));

  return result.map(r => r.topic);
}

export async function getQuestionById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(questions)
    .where(eq(questions.id, id))
    .limit(1);

  return result[0] || null;
}

// ============ Session Functions ============

export async function createSession(session: InsertSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(sessions).values(session);
  return result[0].insertId;
}

export async function updateSession(sessionId: number, updates: Partial<InsertSession>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(sessions)
    .set(updates)
    .where(eq(sessions.id, sessionId));
}

export async function getUserSessions(userId: number, limit: number = 10, certification: string = 'CAPM') {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(sessions)
    .where(and(
      eq(sessions.userId, userId),
      eq(sessions.certification, certification)
    ))
    .orderBy(desc(sessions.startedAt))
    .limit(limit);

  return result;
}

export async function getSessionById(sessionId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);

  return result[0] || null;
}

// ============ Session Answer Functions ============

export async function saveSessionAnswer(answer: InsertSessionAnswer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(sessionAnswers).values(answer);
}

export async function getSessionAnswers(sessionId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(sessionAnswers)
    .where(eq(sessionAnswers.sessionId, sessionId));

  return result;
}

// ============ Topic Progress Functions ============

export async function updateTopicProgress(userId: number, topic: string, isCorrect: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get existing progress
  const existing = await db
    .select()
    .from(topicProgress)
    .where(and(
      eq(topicProgress.userId, userId),
      eq(topicProgress.topic, topic)
    ))
    .limit(1);

  if (existing.length > 0) {
    // Update existing
    const current = existing[0];
    const newTotal = current.totalAttempts + 1;
    const newCorrect = current.correctAttempts + (isCorrect ? 1 : 0);
    const newAccuracy = Math.round((newCorrect / newTotal) * 100);

    await db
      .update(topicProgress)
      .set({
        totalAttempts: newTotal,
        correctAttempts: newCorrect,
        accuracy: newAccuracy,
        lastPracticedAt: new Date(),
      })
      .where(eq(topicProgress.id, current.id));
  } else {
    // Insert new
    await db.insert(topicProgress).values({
      userId,
      topic,
      totalAttempts: 1,
      correctAttempts: isCorrect ? 1 : 0,
      accuracy: isCorrect ? 100 : 0,
      lastPracticedAt: new Date(),
    });
  }
}

export async function getUserTopicProgress(userId: number, certification: string = 'CAPM') {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(topicProgress)
    .where(and(
      eq(topicProgress.userId, userId),
      eq(topicProgress.certification, certification)
    ))
    .orderBy(desc(topicProgress.lastPracticedAt));

  return result;
}

export async function getWeakTopics(userId: number, threshold: number = 75, certification: string = 'CAPM') {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(topicProgress)
    .where(and(
      eq(topicProgress.userId, userId),
      eq(topicProgress.certification, certification),
      sql`${topicProgress.accuracy} < ${threshold}`
    ))
    .orderBy(topicProgress.accuracy);

  return result;
}

// ============ Statistics Functions ============

export async function getUserStats(userId: number, certification: string = 'CAPM') {
  const db = await getDb();
  if (!db) return null;

  // Get overall stats
  const sessionStats = await db
    .select({
      totalSessions: sql<number>`COUNT(*)`,
      totalQuestions: sql<number>`COALESCE(SUM(${sessions.totalQuestions}), 0)`,
      totalCorrect: sql<number>`COALESCE(SUM(${sessions.correctAnswers}), 0)`,
      avgScore: sql<number>`COALESCE(AVG(${sessions.score}), 0)`,
    })
    .from(sessions)
    .where(and(
      eq(sessions.userId, userId),
      eq(sessions.certification, certification)
    ));

  const result = sessionStats[0];
  return result ? {
    totalSessions: Number(result.totalSessions) || 0,
    totalQuestions: Number(result.totalQuestions) || 0,
    totalCorrect: Number(result.totalCorrect) || 0,
    avgScore: Number(result.avgScore) || 0,
  } : {
    totalSessions: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    avgScore: 0,
  };
}

export async function getAllQuestions(certification: string = 'CAPM') {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(questions)
    .where(eq(questions.certification, certification))
    .orderBy(questions.topic, questions.difficulty);

  return result;
}

export async function updateQuestion(id: number, updates: Partial<InsertQuestion>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .update(questions)
    .set(updates)
    .where(eq(questions.id, id));

  return result;
}
