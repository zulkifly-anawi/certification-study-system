import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function seedCertifications() {
  let connection;
  try {
    connection = await mysql.createConnection(DATABASE_URL);

    // Check if CAPM already exists
    const [existing] = await connection.query(
      'SELECT * FROM certifications WHERE code = ?',
      ['CAPM']
    );
    
    if (existing.length > 0) {
      console.log('✓ CAPM certification already exists');
      await connection.end();
      return;
    }

    // Seed certifications
    const certData = [
      {
        code: 'CAPM',
        name: 'Certified Associate in Project Management',
        description: 'Entry-level project management certification by PMI',
        totalQuestions: 46,
        examDuration: 180,
        passingScore: 70,
        isActive: true,
      },
      {
        code: 'PSM1',
        name: 'Professional Scrum Master I',
        description: 'Scrum Master certification by Scrum.org',
        totalQuestions: 0,
        examDuration: 60,
        passingScore: 85,
        isActive: true,
      },
      {
        code: 'PMP',
        name: 'Project Management Professional',
        description: 'Advanced project management certification by PMI',
        totalQuestions: 0,
        examDuration: 230,
        passingScore: 61,
        isActive: true,
      },
    ];

    for (const cert of certData) {
      await connection.query(
        'INSERT INTO certifications (code, name, description, totalQuestions, examDuration, passingScore, isActive) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [cert.code, cert.name, cert.description, cert.totalQuestions, cert.examDuration, cert.passingScore, cert.isActive]
      );
      console.log(`✓ Seeded ${cert.code}: ${cert.name}`);
    }

    console.log('✓ All certifications seeded successfully');
    await connection.end();
  } catch (error) {
    console.error('Error seeding certifications:', error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

seedCertifications();
