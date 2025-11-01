import { drizzle } from 'drizzle-orm/mysql2';
import { certifications } from './drizzle/schema.ts';
import * as dotenv from 'dotenv';

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

async function seed() {
  try {
    console.log('Seeding certifications...');
    
    // Insert CAPM certification
    await db.insert(certifications).values({
      code: 'CAPM',
      name: 'CAPM Certification',
      description: 'Certified Associate in Project Management - Entry-level project management certification',
      totalQuestions: 150,
      examDuration: 180,
      passingScore: 70,
      isActive: true,
    }).onDuplicateKeyUpdate({
      set: {
        name: 'CAPM Certification',
        description: 'Certified Associate in Project Management - Entry-level project management certification',
        totalQuestions: 150,
        examDuration: 180,
        passingScore: 70,
        isActive: true,
      }
    });
    
    console.log('✓ CAPM certification seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding certifications:', error);
    process.exit(1);
  }
}

seed();
