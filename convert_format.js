const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./server/question_bank.json', 'utf8'));

const converted = data.map(q => ({
  text: q.text,
  options: {
    A: q.options.A,
    B: q.options.B,
    C: q.options.C,
    D: q.options.D,
  },
  correctAnswer: q.correct_answer,
  explanation: q.explanation,
  topic: q.topic,
  difficulty: q.difficulty,
}));

console.log(JSON.stringify(converted, null, 2));
