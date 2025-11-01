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
- [x] Add export questions function to admin panel
- [x] Remove duplicate questionIds (Q006-Q030) from database
- [x] Support matching questions with more than 4 options (A-Z, not just A-D)
- [x] Update database schema to allow any letter as correctAnswer
- [x] Update validation in import form to accept A-Z
- [x] Update frontend to handle matching questions with extended options
- [x] Support multiple correct answers in questions (e.g., "A,C")
- [x] Update database schema to handle comma-separated correct answers
- [x] Update validation to accept comma-separated letters
- [x] Update grading logic to check if user answer matches any correct answer
- [ ] Update frontend UI to support multiple answer selection (checkboxes)
- [ ] Update backend submitAnswer to accept comma-separated user answers
- [ ] Detect multi-answer questions on Practice page
- [ ] Render checkboxes instead of radio buttons for multi-answer questions
- [ ] Test multiple answer selection and validation
- [ ] Fix database insert error with onDuplicateKeyUpdate for questions with large options JSON
- [x] Disable auto-seeding of Q006-Q030 questions on server restart
- [ ] Fix validation mismatch between preview and published versions for comma-separated answers
- [x] Add mediaUrl field to database schema for storing diagram/image URLs
- [x] Update import validation to accept optional mediaUrl field
- [x] Display diagrams above questions in practice mode
- [x] Build admin edit panel with question list and edit form
- [x] Implement image upload to S3 with public URL generation
- [x] Test media display on all question types (multiple choice, matching, multiple answers)

## Topic-Based Filtering Feature
- [x] Extract all unique topics from questions database
- [x] Create backend procedure to fetch all available topics
- [x] Add topic selection UI to Practice page
- [x] Create backend procedure to fetch questions filtered by topic
- [x] Implement topic filtering in practice session
- [x] Display selected topic in practice session header
- [x] Test topic filtering with various topics

## Admin Panel UI Improvements
- [x] Add question text preview in question list (first 100 chars)
- [x] Add difficulty level badge to question list
- [x] Add topic display with better formatting
- [x] Implement expandable question preview in list
- [x] Add search by question text functionality
- [x] Add filter by difficulty level
- [x] Add filter by topic in question list
- [x] Improve question list layout with better visual hierarchy


## Phase 1: Multi-Certification Architecture
- [x] Add certification column to questions table with CAPM default
- [x] Add certification column to sessions table with CAPM default
- [x] Add certification column to progress table with CAPM default
- [x] Create certifications reference table
- [x] Update getRandomQuestions to filter by certification
- [x] Update getQuestionsByTopic to filter by certification
- [x] Update getAllTopics to filter by certification
- [x] Update getAllQuestionsForEdit to filter by certification
- [x] Update tRPC questions.getTopics procedure to accept certification
- [x] Update tRPC questions.getByTopic procedure to accept certification
- [x] Update tRPC sessions.start procedure to accept certification
- [x] Update tRPC sessions.submit procedure to handle certification
- [x] Test backend changes with CAPM certification


## Phase 2: Frontend Certification Selector
- [x] Create context/state for selected certification
- [x] Add certification selector dropdown to home page
- [x] Fetch available certifications from backend
- [x] Display certification selector with CAPM as default
- [x] Update Practice page to use selected certification
- [x] Update Quiz page to use selected certification
- [x] Update Exam page to use selected certification
- [x] Update Topic Study to use selected certification
- [x] Update Progress Dashboard to filter by certification
- [x] Update Session History to filter by certification
- [x] Test certification selector with all practice modes
## Phase 3: Progress Dashboard and Session History Filtering
- [x] Update Progress page to use useCertification hook
- [x] Update progress.getStats procedure to accept certification parameter
- [x] Update progress.getWeakTopics procedure to accept certification parameter
- [x] Update Session History page to use useCertification hook
- [x] Update sessions.getHistory procedure to accept certification parameter
- [x] Update AdminEdit to filter questions by certification
- [x] Update getAllQuestionsForEdit to accept certification parameter
- [x] Update exportQuestions to accept certification parameter
- [x] Update getUserSessions to filter by certification
- [x] Update getUserStats to filter by certification
- [x] Update getUserTopicProgress to filter by certification
- [x] Update getWeakTopics to filter by certification
- [x] Update getAllQuestions to filter by certification
- [ ] Test progress filtering with different certifications
- [ ] Test session history filtering with different certificationsarameter
- [x] Update getUserSessions to filter by certification
- [x] Update getUserStats to filter by certification
- [x] Update getUserTopicProgress to filter by certification
- [x] Update getWeakTopics to filter by certification
- [x] Update getAllQuestions to filter by certification
- [ ] Test progress filtering with different certifications
- [ ] Test session history filtering with different certifications

## Phase 3 Completion Notes
- All progress dashboard queries now filter by certification
- Session history queries now filter by certification
- Admin panel now filters questions by certification
- All database helper functions updated to accept certification parameter
- All tRPC procedures updated to accept certification parameter
- Frontend pages (Progress, History, AdminEdit) now use CertificationContext
- Backward compatibility maintained - defaults to CAPM certification
