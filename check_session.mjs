import { drizzle } from "drizzle-orm/mysql2";
import { sessions } from "./drizzle/schema.js";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);
const result = await db.select().from(sessions).where(eq(sessions.id, 210004)).limit(1);
console.log("Session 210004:", result);
