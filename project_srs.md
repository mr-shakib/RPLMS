1. Project Overview
Project Name

Research Paper Lifecycle Management System (RPLMS)

Project Vision

A centralized web-based platform for managing the complete lifecycle of academic research papers, from idea generation to publication and post-publication tracking.

The platform will help:

Supervisors
Researchers
Students
Research groups
University labs

manage research efficiently using structured workflows, collaboration tools, task management, and publication tracking.

2. Technology Stack
Frontend
Next.js
TypeScript
TailwindCSS
Shadcn UI
React Query / TanStack Query
Axios
Zustand or Redux Toolkit
Backend
Django
Django REST Framework (DRF)
JWT Authentication
Celery (background jobs)
Redis (queue + caching)
Database
PostgreSQL
File Storage

Primary:

Cloudinary

Alternative:

Amazon S3
Authentication
JWT Access Token
JWT Refresh Token
Role-based Access Control (RBAC)
Deployment

Frontend:

Vercel

Backend:

Railway

OR
Render

Database:

Neon

OR
Supabase
3. User Roles
3.1 Super Admin

Permissions:

Manage all users
Manage departments
View all papers
Access analytics
Configure system settings
3.2 Supervisor

Permissions:

Create papers
Assign researchers
Review submissions
Approve milestones
View analytics
3.3 Researcher / Student

Permissions:

Work on assigned papers
Upload files
Update tasks
Add experiments
Submit drafts
3.4 External Collaborator

Permissions:

Limited access
View assigned papers only
Upload files
Comment on drafts
4. Core System Modules
MODULE 1 — Authentication & Authorization
Features
User Registration

Fields:

Full Name
Email
Password
Institution
Department
ORCID ID
Role
Login System

Features:

JWT login
Refresh token
Remember me
Session expiration
Secure logout
Password Management
Forgot password
Reset password email
Change password
Password strength validation
Security Features
CSRF protection
Rate limiting
Email verification
IP logging
Audit logging
Device tracking
MODULE 2 — Dashboard
Dashboard Widgets
Research Summary
Total papers
Active papers
Submitted papers
Published papers
Rejected papers
Deadlines
Upcoming submissions
Revision deadlines
Meeting reminders
Quick Stats
Acceptance rate
Q1 publications
Average review time
Total citations
Recent Activities
File uploads
Task completion
Comments
Status changes
Personal Dashboard

For each user:

Assigned tasks
Pending reviews
Upcoming deadlines
Notifications
MODULE 3 — Paper Lifecycle Management

This is the main module.

3.1 Create New Paper
Required Fields
Paper Title
Short Title
Paper ID (auto-generated)
Research Domain
Keywords
Abstract
Problem Statement
Research Gap
Objective
Methodology
Expected Contribution
Funding Source
SDG Goal Mapping
Ethics Approval Number
3.2 Paper Status Workflow
Planning Phase
Idea Proposed
Topic Discussion
Literature Review
Research Gap Analysis
Proposal Drafting
Proposal Approved
Development Phase
Dataset Collection
Dataset Cleaning
Model Development
Experimentation
Evaluation
Result Analysis
Writing Phase
Initial Draft
Figure Preparation
Formatting
Citation Checking
Grammar Review
Internal Review
Supervisor Review
Submission Phase
Journal Selection
Submission Ready
Submitted
Under Review
Revision Requested
Resubmitted
Accepted
Rejected
Withdrawn
Published
3.3 Paper Metadata

Fields:

DOI
ISSN
ISBN
Conference Name
Publisher
Journal Quartile
Impact Factor
Indexing
APC Fee
Acceptance Rate
Submission Deadline
3.4 Progress Tracking
Progress Sections
Literature Review %
Dataset %
Experiment %
Writing %
Revision %
Milestone System

Each milestone:

Title
Description
Deadline
Responsible Person
Status
Comments
3.5 Paper Tags

Example:

Machine Learning
NLP
Healthcare AI
Image Processing
MODULE 4 — Author Management
Features
Author Information
Name
Email
Affiliation
Department
ORCID
Google Scholar Link
Author Order Management
Drag & Drop ordering
Contribution percentage
Contribution Tracking

Based on:

Writing
Coding
Experiments
Literature review
MODULE 5 — Task Management
Features
Create Tasks

Fields:

Task Title
Description
Assigned User
Priority
Deadline
Estimated Time
Dependencies
Task Status
Todo
In Progress
Waiting Review
Completed
Blocked
Task Features
Kanban board
Calendar view
Timeline view
Activity log
Subtasks
Attachments
Comments
MODULE 6 — Literature Review Management
Features
Paper Repository

Store:

Title
Authors
Year
DOI
Journal
Summary
Method
Dataset
Limitations
PDF Upload
PDF preview
Highlighting
Notes
Annotations
Citation Export

Formats:

APA
IEEE
BibTeX
MLA
Search & Filter

By:

Year
Domain
Keywords
Author
Citation count
MODULE 7 — File Management System
Supported Files
PDF
DOCX
XLSX
PPTX
ZIP
Images
CSV
JSON
Features
Folder structure
Version history
File preview
File locking
Secure download
Access permissions
File Categories
Manuscript
Dataset
Source Code
Figures
Ethics Documents
Reviewer Responses
Supplementary Files
MODULE 8 — Submission Management
Journal/Conference Database

Fields:

Venue Name
Website
Publisher
Quartile
Impact Factor
Submission Link
Review Duration
Acceptance Rate
Formatting Template
Submission Tracking

Fields:

Submission Date
Submission ID
Manuscript Version
Status
Decision Date
Multiple Submission Attempts

Track:
| Attempt | Venue | Result |

MODULE 9 — Reviewer Management
Features
Reviewer Comments
Reviewer 1
Reviewer 2
Reviewer 3
Revision Tracking
Major Revision
Minor Revision
Camera Ready
Response Management
Response-to-reviewer document
Change logs
Reviewer checklist
MODULE 10 — Meeting Management
Features
Meeting Records
Date
Participants
Agenda
Notes
Decisions
Action Items
Calendar Integration
Google Calendar sync
MODULE 11 — Notifications System
Notifications
Email Notifications
Task assigned
Deadline reminder
Submission updates
Review comments
In-App Notifications
Mention alerts
File uploaded
Status changed
Scheduled Reminders
1 day before
3 days before
7 days before
MODULE 12 — Analytics & Reports
Charts & Metrics
Research Metrics
Total publications
Publications by year
Acceptance rate
Journal distribution
Research domain analysis
User Metrics
Productivity score
Task completion rate
Contribution analysis
Supervisor Metrics
Students supervised
Publications generated
Research impact
MODULE 13 — Search System
Global Search

Search by:

Paper title
Author
DOI
Keywords
Venue
Tags
Advanced Filtering
Date range
Status
Department
Research area
MODULE 14 — Comment & Collaboration System
Features
Threaded comments
Mention users
File comments
Inline comments
Discussion history
MODULE 15 — AI ASSISTANCE (Future)
Features
Abstract improvement
Grammar checking
Journal recommendation
Reviewer response drafting
Citation generation
Research gap extraction
Title suggestions
5. Functional Requirements
FR-1 User Authentication

The system shall allow secure JWT-based login.

FR-2 Paper Creation

Users shall create and manage papers.

FR-3 Status Tracking

The system shall maintain paper lifecycle statuses.

FR-4 Task Assignment

Supervisors shall assign tasks.

FR-5 File Upload

Users shall upload research files.

FR-6 Notifications

System shall send deadline reminders.

FR-7 Analytics

System shall generate visual analytics.

6. Non-Functional Requirements
Performance
Page load < 2 seconds
API response < 500ms
Support 500+ concurrent users
Security
JWT authentication
HTTPS
Password hashing
Rate limiting
RBAC
Scalability
Modular architecture
Microservice-ready APIs
Availability
99.9% uptime target
Usability
Mobile responsive
Clean dashboard
Dark mode
7. Database Design
USERS TABLE
id
name
email
password
role
institution
department
orcid
profile_image
created_at
updated_at
PAPERS TABLE
id
paper_id
title
short_title
abstract
research_gap
objective
methodology
status
domain
keywords
supervisor_id
created_by
created_at
updated_at
AUTHORS TABLE
id
paper_id
user_id
author_order
contribution
corresponding_author
TASKS TABLE
id
paper_id
title
description
assigned_to
priority
deadline
status
created_by
FILES TABLE
id
paper_id
uploaded_by
file_url
file_type
version
size
uploaded_at
SUBMISSIONS TABLE
id
paper_id
venue_name
submission_date
status
decision
review_deadline
REVIEWS TABLE
id
submission_id
reviewer_name
comment
revision_type
NOTIFICATIONS TABLE
id
user_id
title
message
is_read
created_at
MEETINGS TABLE
id
paper_id
meeting_date
notes
action_items
8. API Structure
Auth APIs
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
Paper APIs
GET /api/papers
POST /api/papers
GET /api/papers/:id
PUT /api/papers/:id
DELETE /api/papers/:id
Task APIs
POST /api/tasks
PUT /api/tasks/:id
GET /api/tasks
File APIs
POST /api/files/upload
GET /api/files/:id
DELETE /api/files/:id
9. Frontend Pages
Public Pages
Landing page
Features page
Pricing page
Login
Register
Forgot password
Protected Pages
Dashboard
Papers
Paper Details
Tasks
Calendar
Notifications
Analytics
Profile
Settings
10. UI/UX Requirements
Theme
Minimal
Academic-focused
Modern SaaS design
Features
Dark mode
Responsive design
Keyboard shortcuts
Drag-and-drop
Real-time updates
11. Advanced Features
Version Control

Track:

Draft v1
Draft v2
Camera-ready version
Audit Logs

Track:

Who changed what
Timestamp
Old vs new value
Export Features

Export:

PDF reports
CSV
Excel
BibTeX
Backup System
Automatic backups
Restore system
12. Future Integrations
Integrations
Google Scholar
ORCID
Crossref
Scopus
Overleaf
GitHub
13. Suggested Folder Structure
Frontend
src/
 ├── app/
 ├── components/
 ├── features/
 ├── hooks/
 ├── services/
 ├── store/
 ├── utils/
 ├── types/
Backend
backend/
 ├── apps/
 │    ├── auth/
 │    ├── papers/
 │    ├── tasks/
 │    ├── submissions/
 │    ├── reviews/
 │    ├── notifications/
 │    └── analytics/
14. Suggested Development Phases
Phase 1 — MVP
Authentication
Paper CRUD
Task system
File upload
Dashboard
Phase 2
Submission tracking
Reviewer management
Analytics
Notifications
Phase 3
AI features
Integrations
Advanced reports