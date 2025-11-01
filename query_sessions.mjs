import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await connection.execute(
  'SELECT id, userId, sessionType, totalQuestions, correctAnswers, score FROM sessions LIMIT 10'
);
console.log('Sessions in database:');
console.table(rows);
connection.end();
