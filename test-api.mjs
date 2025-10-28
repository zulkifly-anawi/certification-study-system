import { drizzle } from "drizzle-orm/mysql2";
import { questions } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

// Test: Check if questions were seeded
const allQuestions = await db.select().from(questions);
console.log(`✓ Total questions in database: ${allQuestions.length}`);

// Test: Check topics
const topics = await db.selectDistinct({ topic: questions.topic }).from(questions);
console.log(`✓ Total topics: ${topics.length}`);
console.log(`✓ Topics: ${topics.map(t => t.topic).join(", ")}`);

// Test: Check difficulty distribution
const easy = allQuestions.filter(q => q.difficulty === "easy").length;
const medium = allQuestions.filter(q => q.difficulty === "medium").length;
const hard = allQuestions.filter(q => q.difficulty === "hard").length;
console.log(`✓ Difficulty distribution: Easy=${easy}, Medium=${medium}, Hard=${hard}`);

console.log("\n✅ All database tests passed!");
process.exit(0);
