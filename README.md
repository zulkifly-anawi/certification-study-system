# CAPM Study System

A comprehensive web-based study platform for Project Management certification exam preparation. Built with React 19, Express 4, tRPC 11, and Drizzle ORM.

**Live Demo:** [CAPM Study System](https://capmstudy-c8q5zjhg.manus.space)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Database](#database)
- [Admin Panel](#admin-panel)
- [Deployment](#deployment)
- [Self-Hosting Guide](#self-hosting-guide)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### User Features
- **Practice Questions:** Choose 5, 10, 20, or custom number of questions
- **Quiz Mode:** 20-question timed assessments
- **Full Practice Exam:** 150-question 3-hour exam simulation
- **Study by Topic:** Focus practice on specific certification topics
- **Progress Dashboard:** Track accuracy, performance trends, and weak areas
- **Session History:** Review past practice sessions with detailed results
- **Multiple Certifications:** Support for CAPM, PSM1, PMP, and more
- **Responsive Design:** Mobile-friendly interface for study on-the-go

### Admin Features
- **Question Management:** Add, edit, delete, and preview questions
- **Bulk Import:** Import questions via CSV/JSON
- **Question Preview:** Test questions exactly as users see them
- **Certification Management:** Create and manage certification programs
- **Analytics:** Track user progress and question performance
- **Multi-Answer Support:** Questions with single or multiple correct answers
- **Image/Diagram Support:** Upload diagrams for visual questions

### Technical Features
- **Real-time Progress Tracking:** Session-based answer tracking
- **Multi-User Support:** Complete data isolation per user
- **Session Security:** Ownership validation prevents unauthorized access
- **Optimistic Updates:** Instant UI feedback for better UX
- **Type-Safe API:** End-to-end TypeScript with tRPC
- **Database Flexibility:** Drizzle ORM supports multiple databases

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - Component library
- **tRPC** - Type-safe API client
- **Wouter** - Lightweight routing
- **Lucide React** - Icons

### Backend
- **Express 4** - Web framework
- **tRPC 11** - RPC framework
- **Drizzle ORM** - Database toolkit
- **Zod** - Schema validation
- **Node.js** - Runtime

### Database
- **MySQL/TiDB** (default on Manus)
- **PostgreSQL** (recommended for self-hosting)
- **SQLite** (development)

### Deployment
- **Manus Platform** (current)
- **Vercel** (recommended for self-hosting)
- **Railway, Render, DigitalOcean** (alternatives)

---

## 📁 Project Structure

```
capm-study-web/
├── client/                          # Frontend (React)
│   ├── src/
│   │   ├── pages/                  # Page components
│   │   │   ├── Home.tsx            # Landing page
│   │   │   ├── Practice.tsx        # Practice mode
│   │   │   ├── Progress.tsx        # Progress dashboard
│   │   │   ├── History.tsx         # Session history
│   │   │   ├── SessionDetail.tsx   # Individual session details
│   │   │   ├── AdminImport.tsx     # Question import
│   │   │   ├── AdminEdit.tsx       # Question editing
│   │   │   ├── AdminAddQuestion.tsx # Add new questions
│   │   │   └── AdminCertifications.tsx # Manage certifications
│   │   ├── components/             # Reusable components
│   │   ├── contexts/               # React contexts
│   │   ├── lib/                    # Utilities
│   │   ├── App.tsx                 # Main router
│   │   └── main.tsx                # Entry point
│   ├── public/                     # Static assets
│   └── index.html
├── server/                          # Backend (Express + tRPC)
│   ├── routers.ts                  # tRPC procedures
│   ├── db.ts                       # Database helpers
│   ├── storage.ts                  # S3 storage helpers
│   └── _core/                      # Framework internals
├── drizzle/                         # Database schema
│   ├── schema.ts                   # Table definitions
│   └── migrations/                 # Database migrations
├── shared/                          # Shared types & constants
├── package.json
├── tsconfig.json
├── vite.config.ts
└── drizzle.config.ts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- MySQL/PostgreSQL database (or SQLite for development)
- Git

### Local Development

**1. Clone the repository:**
```bash
git clone https://github.com/yourusername/capm-study-web.git
cd capm-study-web
```

**2. Install dependencies:**
```bash
pnpm install
```

**3. Set up environment variables:**
Create a `.env.local` file:
```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/capm_study

# Authentication (Manus OAuth - or replace with your auth provider)
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# App Configuration
VITE_APP_TITLE="CAPM Study System"
VITE_APP_LOGO=/logo.svg

# JWT Secret (for sessions)
JWT_SECRET=your_secret_key_here
```

**4. Set up the database:**
```bash
pnpm db:push
```

**5. Start the development server:**
```bash
pnpm dev
```

Visit `http://localhost:3000` in your browser.

---

## 💻 Development

### Available Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Type check
pnpm tsc --noEmit

# Database operations
pnpm db:push        # Push schema changes
pnpm db:generate    # Generate migrations
pnpm db:studio      # Open Drizzle Studio

# Format code
pnpm format
```

### Adding New Features

**1. Add database schema** (if needed):
```typescript
// drizzle/schema.ts
export const myTable = mysqlTable("my_table", {
  id: int("id").autoincrement().primaryKey(),
  // ... columns
});
```

**2. Create database helper:**
```typescript
// server/db.ts
export async function getMyData(userId: number) {
  const db = await getDb();
  return db.select().from(myTable).where(eq(myTable.userId, userId));
}
```

**3. Add tRPC procedure:**
```typescript
// server/routers.ts
myFeature: router({
  getData: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return db.getMyData(ctx.user.id);
    }),
}),
```

**4. Use in frontend:**
```typescript
// client/src/pages/MyPage.tsx
const { data } = trpc.myFeature.getData.useQuery({ id: 123 });
```

### Code Style

- **TypeScript:** Strict mode enabled
- **Formatting:** Prettier (auto-formatted on save)
- **Linting:** ESLint configured
- **Components:** Functional components with hooks

---

## 🗄️ Database

### Schema Overview

**Users Table**
- Stores user identity via OAuth
- Tracks role (admin/user), login method, timestamps

**Questions Table**
- Question text, options (A-Z), correct answers
- Topic, difficulty, explanation, media URL
- Certification association

**Sessions Table**
- Practice session metadata
- Session type, certification, score, duration
- Start/completion timestamps

**SessionAnswers Table**
- Individual question responses
- User answer, correctness flag, timestamp

**TopicProgress Table**
- Aggregated statistics per topic
- Total attempts, correct attempts, accuracy percentage

**Certifications Table**
- Certification programs (CAPM, PSM1, PMP, etc.)
- Description and metadata

### Database Operations

**Push schema changes:**
```bash
pnpm db:push
```

**View database in GUI:**
```bash
pnpm db:studio
```

**Custom SQL queries:**
```typescript
// In server/db.ts
const result = await db.execute(sql`SELECT * FROM users WHERE id = ${userId}`);
```

### Switching Databases

**To PostgreSQL:**
1. Update `DATABASE_URL` to PostgreSQL connection string
2. Update `drizzle.config.ts`:
```typescript
export default defineConfig({
  dialect: "postgresql",
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```
3. Run `pnpm db:push`

**To SQLite (development):**
```typescript
// drizzle.config.ts
export default defineConfig({
  dialect: "sqlite",
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: "./dev.db",
  },
});
```

---

## 👨‍💼 Admin Panel

### Accessing Admin Features

1. Log in with admin account
2. Click **Admin** button in header
3. Choose from:
   - **Manage Certifications** - Create/edit certification programs
   - **Import Questions** - Bulk upload questions
   - **Edit Questions** - Modify existing questions
   - **Add Question** - Create new questions manually

### Adding Questions Manually

1. Go to **Admin → Add Question**
2. Fill in:
   - Question text
   - Answer options (A-Z, add/remove as needed)
   - Correct answer(s) - comma-separated for multiple (e.g., "A,C")
   - Explanation
   - Topic
   - Difficulty level
   - Optional: Image/diagram
3. Click **Create Question**
4. Use **Preview** button to test before saving

### Bulk Import Format

**CSV Format:**
```csv
question_text,option_a,option_b,option_c,option_d,correct_answer,explanation,topic,difficulty
"What is CAPM?","A definition","B definition","C definition","D definition","A","Explanation text","Fundamentals","easy"
```

**JSON Format:**
```json
[
  {
    "text": "What is CAPM?",
    "options": {
      "A": "A definition",
      "B": "B definition",
      "C": "C definition",
      "D": "D definition"
    },
    "correctAnswer": "A",
    "explanation": "Explanation text",
    "topic": "Fundamentals",
    "difficulty": "easy"
  }
]
```

---

## 🚀 Deployment

### Manus Platform (Current)

The application is currently deployed on Manus. To publish updates:

1. Make changes locally
2. Test thoroughly with `pnpm dev`
3. Create a checkpoint via Management UI
4. Click **Publish** button to deploy

### Self-Hosting Options

#### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Configuration:**
- Environment variables in Vercel dashboard
- Database: PostgreSQL on Railway or Supabase
- Storage: AWS S3 or Cloudinary

#### Option 2: Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway up
```

#### Option 3: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

```bash
docker build -t capm-study .
docker run -p 3000:3000 -e DATABASE_URL=... capm-study
```

---

## 🔧 Self-Hosting Guide

### Step 1: Replace Authentication

**Option A: Auth0**
```typescript
// server/_core/auth.ts
import { ManagementClient } from 'auth0';

const auth0 = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
});
```

**Option B: Firebase**
```typescript
import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
```

### Step 2: Configure Database

```env
# PostgreSQL (recommended)
DATABASE_URL=postgresql://user:password@host:5432/capm_study

# Or MySQL
DATABASE_URL=mysql://user:password@host:3306/capm_study
```

### Step 3: Set Up File Storage

**AWS S3:**
```typescript
// server/storage.ts
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
```

**Cloudinary:**
```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
```

### Step 4: Deploy

Choose your platform and follow their deployment guide:
- **Vercel:** `vercel deploy`
- **Railway:** `railway up`
- **Render:** Connect GitHub repo in dashboard
- **DigitalOcean:** Use App Platform or Droplet + Docker

---

## 📚 API Documentation

### Authentication

**Check current user:**
```typescript
const user = await trpc.auth.me.useQuery();
```

**Logout:**
```typescript
const logout = trpc.auth.logout.useMutation();
logout.mutate();
```

### Questions

**Get random questions:**
```typescript
const { data } = await trpc.questions.getRandom.useQuery({
  count: 10,
  certification: 'CAPM',
});
```

**Get questions by topic:**
```typescript
const { data } = await trpc.questions.getByTopic.useQuery({
  topic: 'Scope Management',
  count: 5,
  certification: 'CAPM',
});
```

**Get all topics:**
```typescript
const { data } = await trpc.questions.getTopics.useQuery({
  certification: 'CAPM',
});
```

### Sessions

**Start a session:**
```typescript
const session = await trpc.sessions.start.useMutation({
  sessionType: 'practice',
  count: 10,
  certification: 'CAPM',
});
```

**Submit answer:**
```typescript
const result = await trpc.sessions.submitAnswer.useMutation({
  sessionId: 123,
  questionId: 'Q123',
  userAnswer: 'A',
});
```

**Get session details:**
```typescript
const { data } = await trpc.sessions.getById.useQuery({
  sessionId: 123,
});
```

### Progress

**Get user statistics:**
```typescript
const { data } = await trpc.progress.getStats.useQuery({
  certification: 'CAPM',
});
```

**Get weak topics:**
```typescript
const { data } = await trpc.progress.getWeakTopics.useQuery({
  threshold: 75,
  certification: 'CAPM',
});
```

---

## 🐛 Troubleshooting

### Issue: "Database connection failed"

**Solution:**
1. Verify `DATABASE_URL` is correct
2. Check database server is running
3. Ensure firewall allows connection
4. Test with: `pnpm db:push`

### Issue: "Health check failed during deployment"

**Solution:**
- The `/api/trpc/system.health` endpoint must respond with `{"ok": true}`
- Verify endpoint is accessible: `curl http://localhost:3000/api/trpc/system.health`

### Issue: "Multi-answer questions won't submit"

**Solution:**
- Ensure at least one answer is selected
- Check that correct answers are comma-separated (e.g., "A,C")
- Verify question data in database

### Issue: "Session data not persisting"

**Solution:**
1. Check database connection
2. Verify `sessions` table exists: `pnpm db:push`
3. Check browser console for errors
4. Ensure user is authenticated

### Issue: "Images not uploading"

**Solution:**
1. Verify S3/storage credentials
2. Check file size < 10MB
3. Ensure CORS is configured
4. Check browser console for upload errors

---

## 📝 Recent Enhancements

### Version 1.0.0 (Current)
- ✅ Core practice platform with 450+ questions
- ✅ Admin panel with question management
- ✅ Multi-answer question support
- ✅ Session history and progress tracking
- ✅ Mobile-responsive design
- ✅ Question preview feature
- ✅ Security: sessionId ownership validation
- ✅ Fixed: Multi-answer submission bug
- ✅ Fixed: Mobile header responsiveness
- ✅ Fixed: Deployment health check

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Before submitting:
- Test thoroughly locally
- Update README if adding features
- Ensure TypeScript compiles without errors
- Run `pnpm format` to format code

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 📞 Support

For issues, questions, or suggestions:

1. Check [Troubleshooting](#troubleshooting) section
2. Open an issue on GitHub
3. Contact the development team

---

## 🗺️ Roadmap

- [ ] Real-time progress sync with WebSockets
- [ ] Spaced repetition algorithm
- [ ] Study group collaboration features
- [ ] Mobile native app (React Native)
- [ ] AI-powered question generation
- [ ] Advanced analytics dashboard
- [ ] Exam scheduling and reminders
- [ ] Certificate generation

---

**Last Updated:** November 2, 2025

For the latest updates and features, visit the [GitHub repository](https://github.com/zulkifly-anawi/certification-study-system).
