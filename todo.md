# CAPM Study Web App - TODO

## Phase 1: Database Schema & Project Structure
- [x] Define database schema for questions, user progress, and sessions
- [x] Set up question bank table with topics and difficulty levels
- [x] Set up user progress tracking tables
- [x] Set up practice session history tables

## Phase 2: Backend API (tRPC Procedures)
- [x] Create procedure to fetch random questions
- [x] Create procedure to fetch questions by topic
- [x] Create procedure to submit answers and calculate scores
- [x] Create procedure to fetch user progress statistics
- [x] Create procedure to identify weak areas (topics < 75% accuracy)
- [x] Create procedure to fetch session history
- [x] Seed initial 25 questions from the question bank

## Phase 3: Frontend UI
- [x] Design landing page with study modes
- [x] Implement Practice Questions mode (5, 10, 20, custom)
- [x] Implement Quiz Mode (20 questions)
- [x] Implement Full Exam Mode (150 questions)
- [x] Implement Study by Topic mode
- [x] Implement Progress Dashboard with statistics
- [x] Implement Weak Areas Review page
- [x] Implement Session History page
- [x] Add question display with multiple choice options
- [x] Add immediate feedback with explanations
- [x] Add performance charts and visualizations

## Phase 4: Testing & Polish
- [x] Test all practice modes
- [x] Test progress tracking accuracy
- [x] Test responsive design on mobile
- [x] Create checkpoint for deployment

## Bugs to Fix
- [x] Fix "Failed to start session" error when starting practice
- [x] Fix loading screen stuck issue after completing session when navigating to progress page

## Enhancement Tasks
- [x] Create Admin Import Panel for bulk question import
- [x] Build question import form with JSON/CSV support
- [x] Add admin-only route and access control
- [ ] Populate database with questions from user's PDFs using the import panel
- [x] Add admin import link to home page (visible only to admins)
- [x] Fix "Failed to import questions" error in admin import panel
- [x] Fix Quick Stats showing cached question count after import
