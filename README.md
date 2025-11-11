<div align="center">

# 🎓 CAPM Study System

### A Modern, Full-Stack Certification Study Platform

Built with React 19, Express 4, tRPC 11, and Drizzle ORM

[![Live Demo](https://img.shields.io/badge/Live%20Demo-capmstudy-blue?style=for-the-badge&logo=vercel)](https://capmstudy-c8q5zjhg.manus.space)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)

[Live Demo](https://capmstudy-c8q5zjhg.manus.space) • [Report Bug](https://github.com/zulkifly-anawi/certification-study-system/issues) • [Request Feature](https://github.com/zulkifly-anawi/certification-study-system/issues)

</div>

---

## 📖 Overview

**CAPM Study System** is a comprehensive web-based platform designed to help professionals prepare for certification exams through interactive practice questions, timed quizzes, and full exam simulations. The system currently supports CAPM, PSM1, PMP, and other professional certifications with a robust admin panel for managing questions and tracking user progress.

### 🎯 What Makes It Special?

- **🔒 Type-Safe Full Stack** - End-to-end TypeScript with tRPC for complete type safety
- **📊 Advanced Progress Tracking** - Detailed analytics on performance trends and weak areas
- **🎨 Modern UI/UX** - Built with shadcn/ui components and Tailwind CSS 4
- **🔧 Admin-Friendly** - Comprehensive admin panel with bulk import, editing, and preview features
- **🚀 Production-Ready** - Deployed on Manus with 450+ questions and active users
- **📱 Mobile-First** - Fully responsive design for study on-the-go
- **🔐 Secure** - Session ownership validation and role-based access control

### ✨ Key Highlights

| Feature | Description |
|---------|-------------|
| **Multiple Study Modes** | Practice (5-150 questions), Quiz (20 questions), Full Exam (150 questions, 3 hours) |
| **Multi-Certification** | Support for CAPM, PSM1, PMP with complete data isolation |
| **Real-Time Analytics** | Track accuracy, identify weak topics, review session history |
| **Question Flexibility** | Single/multiple answers, A-Z options, image/diagram support |
| **Admin Dashboard** | Add, edit, import (CSV/JSON), preview, and export questions |
| **Database Agnostic** | MySQL, PostgreSQL, or SQLite via Drizzle ORM |

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Development](#-development)
- [Database](#%EF%B8%8F-database)
- [Admin Panel](#-admin-panel)
- [Deployment](#-deployment)
- [Self-Hosting Guide](#-self-hosting-guide)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [Roadmap](#%EF%B8%8F-roadmap)
- [License](#-license)

---

## 🏗️ Architecture

The system follows a modern full-stack architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (React 19)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Practice   │  │   Progress   │  │    Admin     │     │
│  │     Pages    │  │   Dashboard  │  │    Panel     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│           │                │                  │             │
│           └────────────────┴──────────────────┘             │
│                           │                                 │
│                    tRPC Client (Type-Safe)                  │
└───────────────────────────┼─────────────────────────────────┘
                            │
                   ┌────────▼────────┐
                   │   tRPC Server   │
                   │   (Express 4)   │
                   └────────┬────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   ┌────▼─────┐      ┌─────▼──────┐     ┌─────▼────┐
   │  Auth    │      │  Business  │     │  Storage │
   │  (OAuth) │      │   Logic    │     │  (AWS S3)│
   └──────────┘      └─────┬──────┘     └──────────┘
                           │
                    ┌──────▼───────┐
                    │ Drizzle ORM  │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        ┌─────▼─────┐ ┌───▼────┐ ┌────▼─────┐
        │   MySQL   │ │ PostgreSQL │ SQLite  │
        │  (TiDB)   │ │            │  (Dev)  │
        └───────────┘ └────────────┘ └────────┘
```

**Data Flow:**
1. **Client** - React components make type-safe API calls via tRPC
2. **Server** - Express handles requests, validates inputs with Zod
3. **Business Logic** - Database helpers manage CRUD operations
4. **Persistence** - Drizzle ORM provides database abstraction
5. **Storage** - AWS S3 handles question images/diagrams

---

## ✨ Features

### 👨‍🎓 For Students

<table>
<tr>
<td width="50%">

**📝 Practice Modes**
- Choose 5, 10, 20, or custom question count
- 20-question timed quiz assessments
- Full 150-question, 3-hour exam simulation
- Topic-focused study sessions

</td>
<td width="50%">

**📊 Progress Analytics**
- Real-time accuracy tracking
- Performance trends over time
- Weak area identification (< 75% accuracy)
- Comprehensive session history

</td>
</tr>
<tr>
<td>

**🎯 Study Tools**
- Multiple certification support (CAPM, PSM1, PMP)
- Study by specific topics
- Instant answer feedback with explanations
- Question bookmarking and review

</td>
<td>

**📱 User Experience**
- Fully responsive mobile design
- Dark/light theme support
- Intuitive navigation
- Session persistence

</td>
</tr>
</table>

### 👨‍💼 For Administrators

<table>
<tr>
<td width="50%">

**📚 Question Management**
- Add questions via intuitive form
- Edit existing questions with live preview
- Delete with safety confirmations
- Bulk import from CSV/JSON files
- Export questions for backup

</td>
<td width="50%">

**🎨 Advanced Question Types**
- Single answer (A-D standard)
- Multiple correct answers (A,C,D)
- Extended options (A-Z for matching)
- Image/diagram upload support
- Rich text explanations

</td>
</tr>
<tr>
<td>

**🔧 Certification Management**
- Create new certification programs
- Set exam duration and passing scores
- Manage active/inactive certifications
- View question count per certification

</td>
<td>

**📈 Analytics Dashboard**
- User progress tracking
- Question performance metrics
- Topic difficulty analysis
- Session completion rates

</td>
</tr>
</table>

### 🔐 Technical Capabilities

| Feature | Implementation | Benefit |
|---------|----------------|---------|
| **Type Safety** | End-to-end TypeScript + tRPC | Catch errors at compile time, not runtime |
| **Data Isolation** | User-scoped queries + session validation | Complete privacy and security |
| **Real-time Updates** | Optimistic UI + instant feedback | Smooth, responsive user experience |
| **Database Flexibility** | Drizzle ORM abstraction | Switch between MySQL, PostgreSQL, SQLite |
| **Scalability** | Stateless architecture + connection pooling | Handle thousands of concurrent users |
| **Authentication** | OAuth 2.0 via Manus platform | Secure, industry-standard auth flow |

---

## 📸 Screenshots

> **Note:** Screenshots coming soon! Check the [Live Demo](https://capmstudy-c8q5zjhg.manus.space) to see the application in action.

**Key Screens:**
- **🏠 Home Dashboard** - Certification selector, study modes, quick stats
- **📝 Practice Mode** - Question display, timer, progress indicator
- **📊 Progress Analytics** - Charts, topic breakdown, weak areas
- **📚 Session History** - Past sessions, scores, review links
- **👨‍💼 Admin Panel** - Question management, bulk import, preview
- **✏️ Question Editor** - Form fields, media upload, live preview

*Want to contribute screenshots? See the [Contributing](#-contributing) section!*

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose & Why We Chose It |
|------------|---------|---------------------------|
| **React** | 19 | Modern UI framework with latest features (Server Components, Actions). Chosen for component reusability and vast ecosystem. |
| **Tailwind CSS** | 4 | Utility-first CSS framework for rapid UI development. Latest version brings performance improvements and better DX. |
| **shadcn/ui** | Latest | High-quality, accessible component library built on Radix UI. Copy-paste components for full customization. |
| **tRPC** | 11 | End-to-end type-safe APIs. Eliminates need for API documentation and catches errors at compile time. |
| **Wouter** | 3.x | Lightweight (1.5KB) React router. Chosen over React Router for simplicity and bundle size optimization. |
| **Tanstack Query** | 5.x | Powerful data fetching and caching. Works seamlessly with tRPC for optimal performance. |
| **Lucide React** | Latest | Beautiful, consistent icon set. Tree-shakeable and optimized for performance. |
| **Recharts** | 2.x | Composable charting library for analytics visualizations. |

### Backend

| Technology | Version | Purpose & Why We Chose It |
|------------|---------|---------------------------|
| **Express** | 4 | Battle-tested Node.js web framework. Simple, unopinionated, and widely supported. |
| **tRPC** | 11 | Type-safe RPC framework. Shares types between client and server, eliminating API drift. |
| **Drizzle ORM** | Latest | Lightweight TypeScript ORM with excellent type inference. Superior DX compared to Prisma/TypeORM. |
| **Zod** | 4.x | Schema validation library. Ensures data integrity and provides excellent TypeScript integration. |
| **Jose** | Latest | JavaScript module for JWT/JWE/JWS operations. Secure session management. |
| **AWS SDK** | 3.x | S3 integration for question image/diagram storage. |

### Database Options

| Database | Use Case | Notes |
|----------|----------|-------|
| **MySQL/TiDB** | Production (Manus deployment) | Currently deployed. TiDB provides MySQL compatibility with horizontal scaling. |
| **PostgreSQL** | Self-hosting (recommended) | More features than MySQL. Excellent for analytics queries. Better JSON support. |
| **SQLite** | Local development | Zero-config database. Perfect for rapid prototyping and testing. |

**Why Drizzle ORM?** Database-agnostic abstraction allows switching between MySQL, PostgreSQL, and SQLite with minimal code changes.

### Infrastructure & Deployment

| Platform | Purpose | Why Chosen |
|----------|---------|------------|
| **Manus Platform** | Current production hosting | Integrated deployment, OAuth, and database. Simplified DevOps. |
| **Vercel** | Recommended for self-hosting | Excellent DX, automatic deployments, edge functions, global CDN. |
| **Railway / Render** | Alternative platforms | Docker support, managed PostgreSQL, competitive pricing. |
| **AWS S3** | Media storage | Industry-standard object storage for question images/diagrams. |

### Developer Experience

| Tool | Purpose |
|------|---------|
| **TypeScript** | Type safety across entire stack |
| **Prettier** | Code formatting automation |
| **ESLint** | Code quality and consistency |
| **Vite** | Lightning-fast build tool and dev server |
| **pnpm** | Fast, disk-efficient package manager |
| **Drizzle Studio** | Visual database explorer and editor |

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

Before you begin, ensure you have the following installed:

| Requirement | Version | Installation |
|-------------|---------|--------------|
| **Node.js** | 18+ | [Download](https://nodejs.org/) |
| **pnpm** | Latest | `npm install -g pnpm` |
| **Database** | Any | MySQL, PostgreSQL, or SQLite |
| **Git** | Latest | [Download](https://git-scm.com/) |

### Quick Start (5 minutes)

<details open>
<summary><b>Option 1: Using SQLite (Fastest - Zero Database Setup)</b></summary>

Perfect for trying out the application locally!

```bash
# 1. Clone and navigate
git clone https://github.com/zulkifly-anawi/certification-study-system.git
cd certification-study-system

# 2. Install dependencies
pnpm install

# 3. Configure for SQLite (create .env.local)
cat > .env.local << 'EOF'
DATABASE_URL=file:./dev.db
VITE_APP_ID=demo_app
VITE_APP_TITLE="CAPM Study System"
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
EOF

# 4. Update drizzle.config.ts dialect to "sqlite" (see Database section)
# 5. Initialize database
pnpm db:push

# 6. Start development server
pnpm dev
```

✅ Open `http://localhost:3000` - you're ready to go!

</details>

<details>
<summary><b>Option 2: Using MySQL/PostgreSQL (Production-like)</b></summary>

For a production-like local environment:

```bash
# 1. Clone and navigate
git clone https://github.com/zulkifly-anawi/certification-study-system.git
cd certification-study-system

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cat > .env.local << 'EOF'
# Database (change to your database URL)
DATABASE_URL=mysql://user:password@localhost:3306/capm_study
# OR for PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/capm_study

# Authentication (use Manus OAuth or replace with your provider)
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# App Configuration
VITE_APP_TITLE="CAPM Study System"
VITE_APP_LOGO=/logo.svg

# JWT Secret (generate a strong secret for production)
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
EOF

# 4. Create database (if using MySQL/PostgreSQL)
# MySQL: CREATE DATABASE capm_study;
# PostgreSQL: CREATE DATABASE capm_study;

# 5. Push schema to database
pnpm db:push

# 6. Start development server
pnpm dev
```

✅ Open `http://localhost:3000` and start developing!

</details>

### First Steps After Setup

1. **Access the application**: Navigate to `http://localhost:3000`
2. **Log in**: Use OAuth to create your account
3. **Explore as admin**: Check your user role in the database and set to "admin" if needed
4. **Import questions**: Go to Admin → Import Questions and upload sample questions
5. **Start practicing**: Return to home and select a study mode

**Need sample questions?** Check `existing_questions.json` in the project root!

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

## 📝 Version History & Recent Enhancements

### 🚀 Version 1.0.0 (Current - Production)

<table>
<tr>
<td width="50%">

**✨ Features Delivered**
- ✅ Core practice platform with 450+ questions
- ✅ Complete admin panel with CRUD operations
- ✅ Multi-certification architecture (CAPM, PSM1, PMP)
- ✅ Session history and progress analytics
- ✅ Mobile-responsive design with dark mode
- ✅ Question preview feature for admins
- ✅ Image/diagram support for questions
- ✅ Bulk import/export (CSV & JSON)

</td>
<td width="50%">

**🔒 Security & Performance**
- ✅ SessionId ownership validation
- ✅ Role-based access control (admin/user)
- ✅ OAuth 2.0 authentication
- ✅ Type-safe API with tRPC
- ✅ Optimistic UI updates
- ✅ Database connection pooling
- ✅ Health check endpoint for deployments
- ✅ Production deployment on Manus platform

</td>
</tr>
</table>

**🐛 Recent Bug Fixes:**
- Fixed multi-answer submission validation
- Fixed mobile header responsiveness issues
- Fixed deployment health check failures
- Fixed cached question count display
- Fixed duplicate questionId imports

**📊 Current Stats:**
- 450+ practice questions across multiple certifications
- Production deployment with active users
- 100% TypeScript coverage
- Full mobile responsiveness

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

### 🎯 Planned Features

<table>
<tr>
<td width="50%">

**🤖 AI & Intelligence**
- [ ] AI-powered question generation
- [ ] Spaced repetition algorithm (SM-2)
- [ ] Smart question recommendations
- [ ] Personalized study plans
- [ ] Answer explanation improvements

</td>
<td width="50%">

**👥 Collaboration & Social**
- [ ] Study group creation and management
- [ ] Real-time progress sync with WebSockets
- [ ] Leaderboards and achievements
- [ ] Peer-to-peer question sharing
- [ ] Discussion forums per topic

</td>
</tr>
<tr>
<td>

**📱 Mobile & Desktop**
- [ ] React Native mobile app (iOS/Android)
- [ ] Offline mode for mobile practice
- [ ] Push notifications for study reminders
- [ ] Desktop app (Electron)
- [ ] Progressive Web App (PWA) enhancements

</td>
<td>

**📊 Analytics & Reporting**
- [ ] Advanced analytics dashboard
- [ ] Exam readiness predictor
- [ ] Performance comparison charts
- [ ] Export progress reports (PDF)
- [ ] Admin usage statistics

</td>
</tr>
<tr>
<td>

**🎓 Exam Management**
- [ ] Exam scheduling and reminders
- [ ] Mock exam timer with breaks
- [ ] Certificate generation on passing
- [ ] Digital badge integration
- [ ] Exam attempt history

</td>
<td>

**🔧 Platform Improvements**
- [ ] Multi-language support (i18n)
- [ ] Dark mode enhancements
- [ ] Accessibility improvements (WCAG 2.1)
- [ ] API rate limiting
- [ ] Comprehensive test suite

</td>
</tr>
</table>

### 💡 Feature Requests

Have an idea? [Open an issue](https://github.com/zulkifly-anawi/certification-study-system/issues) with the `enhancement` label!

**Community Priorities** (vote on GitHub):
1. Spaced repetition algorithm
2. Mobile native app
3. AI question generation
4. Study groups

---

<div align="center">

## 🌟 Star This Project

If you find this project helpful, please consider giving it a ⭐ on GitHub!

[![GitHub stars](https://img.shields.io/github/stars/zulkifly-anawi/certification-study-system?style=social)](https://github.com/zulkifly-anawi/certification-study-system)

---

**Built with ❤️ by the CAPM Study System Team**

[Live Demo](https://capmstudy-c8q5zjhg.manus.space) • [GitHub](https://github.com/zulkifly-anawi/certification-study-system) • [Report Issues](https://github.com/zulkifly-anawi/certification-study-system/issues)

**Last Updated:** November 11, 2025

</div>
