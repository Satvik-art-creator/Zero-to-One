# PlaceBridge — IIIT Nagpur Placement Engine

**PlaceBridge** is an intelligent, full-stack placement portal built exclusively for **IIIT Nagpur**. It combines a precision eligibility engine, an AI-powered resume intelligence system, and a comprehensive admin panel — all wrapped in a meticulously crafted "Digital Atelier" design system.

---

## The Problem It Solves

Campus placement at most colleges runs on WhatsApp forwards, PDF circulars, and manual spreadsheets. Students miss drives because they didn't see the email. They apply to companies they're ineligible for. Placement coordinators spend hours managing status updates by hand.

PlaceBridge fixes this end-to-end:

- **Manual eligibility tracking** → replaced by an automated exact-match engine
- **Redundant form filling** → replaced by 1-click applications using stored profiles
- **Information scattered across platforms** → replaced by a single source of truth
- **No feedback on where you stand** → replaced by AI-powered resume scoring and company intelligence

---

## Features

### Core Placement Engine
- **Precision Eligibility Checker** — automatically cross-references CGPA, active backlogs, branch, and skills against every company's exact requirements. Students only see companies they can apply to. Rejection reasons are shown explicitly, not as a generic "not eligible."
- **1-Click Applications** — apply to eligible drives without re-entering data. Resume snapshot is captured at application time.
- **Exclusive Access Control** — strict `@iiitn.ac.in` domain validation. No external registrations.
- **Automated Seeding** — first-run automatically seeds 20 real-world companies across all tiers to simulate a live placement season.

### AI-Powered Resume Intelligence (Groq)
- **Resume Validation** — detects whether the uploaded document is actually a resume before processing. Handles image-based/scanned PDFs gracefully.
- **Automated Skill Extraction** — parses hard technical skills from resume text using Groq AI. Merges with manually entered skills to build a richer eligibility profile.
- **Resume Score** — rates resume quality out of 100 across six categories: contact info, education, skills section, experience, projects, and formatting. Shows a breakdown with specific improvement suggestions.
- **Per-Company Match Score** — when a student opens any company, a personalized match score (0–100) is computed against that company's specific requirements. Informational only — does not gate eligibility.

### Company Intelligence System
- **Difficulty Rating** — student-specific difficulty level (Easy / Moderate / Hard / Reach) based on their skill gap and CGPA relative to the company.
- **Skill Gap Analysis** — instant visual split of which required skills you have vs. which you are missing. No AI needed — pure set comparison.
- **AI Preparation Roadmap** — Groq generates a focused, student-specific prep brief: topics to cover, realistic timeline, and what the evaluation process looks like for that company type.

### Prep Resources Tab
- **Personalized Resource Recommendations** — based on skill gap and company type, Groq selects the most relevant resources from a curated registry of verified links.
- **Platforms covered** — LeetCode, GeeksforGeeks, System Design Primer, Striver/NeetCode YouTube channels, Glassdoor, Unstop, AmbitionBox.
- **Reliable by design** — Groq picks from a hardcoded resource registry, never generates URLs freely. If AI is unavailable, a static skill-to-resource fallback map activates silently.
- **General Placement Library** — always-visible curated resource section organized by category (DSA, Core CS, System Design, Company Research). No AI, no loading states, always useful.

### Admin Panel (`/admin`)
- **Overview Dashboard** — placement season stats at a glance: total companies, students placed, upcoming drives, drive activity feed, and a selected students panel.
- **Company Management** — full CRUD for the company collection. Two-section form covering company info and eligibility criteria (CGPA, backlog policy, allowed branches, required skills, evaluation process).
- **Application Management** — per-company application pipeline with a placement funnel bar (Applied → Shortlisted → Selected). Admin manually updates student statuses with notes.
- **Student Directory** — read-only view of all registered students with filters by branch, CGPA range, and backlog status. Admin never edits student data.
- **Announcement Board** — admin posts drive updates, results, and reminders that appear directly on the student dashboard as a placement feed.

---

## Tech Stack

### Frontend
- **Framework** — React.js (functional components, hooks)
- **Routing** — React Router DOM v6+
- **Networking** — Axios
- **Charting** — Recharts (placement trajectory on landing page)
- **Notifications** — react-hot-toast
- **Styling** — Vanilla CSS3 with CSS Variables. Zero external UI libraries. Custom glassmorphic "Digital Atelier" design system.

### Backend
- **Runtime** — Node.js with Express.js
- **Database** — MongoDB with Mongoose ODM
- **Authentication** — JWT (stateless) + bcrypt.js (password hashing)
- **File Handling** — Multer (resume upload) + pdf-parse (text extraction)
- **AI** — Groq SDK (`llama3-8b-8192`) for resume parsing, scoring, match analysis, and resource recommendations

### Design System
- **Typography** — Plus Jakarta Sans + Inter
- **Colors** — Deep purple `#6C63FF` (primary), teal `#10D9A0` (success/selected), dark backgrounds, frosted glass surfaces
- **Components** — Bento Grid layouts, glassmorphic cards (`backdrop-filter: blur(20px)`), CSS micro-interactions

---

## Project Structure

```
Zero-to-One/
├── backend/
│   ├── models/
│   │   ├── Student.js
│   │   ├── Company.js
│   │   ├── Application.js
│   │   └── Announcement.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── companies.js
│   │   ├── applications.js
│   │   ├── admin.js
│   │   ├── upload.js
│   │   └── announcements.js
│   ├── middleware/
│   │   ├── verifyToken.js
│   │   └── isAdmin.js
│   ├── utils/
│   │   ├── eligibilityChecker.js
│   │   ├── resumeValidator.js
│   │   ├── resumeParser.js
│   │   ├── resumeScorer.js
│   │   ├── companyMatcher.js
│   │   ├── companyIntelligence.js
│   │   ├── prepResourcesEngine.js
│   │   ├── mergeSkills.js
│   │   └── aiCache.js
│   ├── data/
│   │   ├── resourceRegistry.js
│   │   ├── resourceFallbackMap.js
│   │   └── seed.js
│   └── server.js
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── Landing.jsx
        │   ├── Register.jsx
        │   ├── Login.jsx
        │   ├── Dashboard.jsx
        │   ├── EligibilitySummary.jsx
        │   └── AdminPanel.jsx
        └── components/
            └── (shared components)
```

---

## Setup and Installation

### Prerequisites
- Node.js v18.0 or higher
- MongoDB running locally on port `27017`
- A Groq API key (free at [console.groq.com](https://console.groq.com))

### 1. Clone the Repository
```bash
git clone <repository_url>
cd Zero-to-One
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/placebridge
JWT_SECRET=your_jwt_secret_here
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama3-8b-8192
```

Start the backend:
```bash
npm run dev
```

The backend runs on `http://localhost:5000`. On first run, it automatically seeds 20 companies into the database.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

The frontend runs on `http://localhost:3000`.

---

## How to Use

### As a Student
1. Visit `http://localhost:3000` and click **Get Started**
2. Register with your `@iiitn.ac.in` email, CGPA, branch, backlogs, and skills
3. Upload your resume — AI will extract additional technical skills automatically
4. View your **Eligibility Summary** showing which companies you qualify for and exact reasons for any rejections
5. Enter the **Dashboard** to browse companies, view your match scores, and apply
6. Click any company to see your match score, skill gap, difficulty rating, and AI prep roadmap
7. Use the **Prep Resources** tab to get personalized study material recommendations based on your gaps
8. Track all applications under **My Applications**

### As an Admin
1. Log in with an admin account (`role: "admin"` set directly in the database)
2. Navigate to `/admin` — the overview dashboard loads automatically
3. Use **Companies** tab to add, edit, or remove companies (changes reflect on student dashboard instantly)
4. Use **Applications** tab to update student statuses (Applied → Shortlisted → Selected / Rejected)
5. Post drive updates and results via the **Announcements** tab — students see these on their dashboard

---

## AI Features — Honest Limitations

PlaceBridge uses Groq AI responsibly. Here is what it actually does vs. what it does not claim to do:

| What it says | What it actually is |
|-------------|-------------------|
| Resume Score | A structured quality assessment based on section completeness — not a real ATS scan |
| Match Score | Weighted combination of skill overlap, CGPA fit, and AI experience relevance — not a hiring prediction |
| Prep Roadmap | Groq-generated guidance based on skill gap and company type — not sourced from actual interview data |
| Resource Recommendations | AI selects from a verified hardcoded registry — Groq never generates URLs freely |

All AI features degrade gracefully. If Groq is unavailable, the core eligibility engine, applications, and all student data continue working normally.

---

## Data Models

### Student
`name`, `email` (must be `@iiitn.ac.in`), `password` (hashed), `cgpa`, `branch`, `year`, `backlogs`, `skills[]`, `role`, `resumeUrl`, `resumeScore`, `resumeScoreBreakdown`, `lastResumeAnalyzedAt`

### Company
`name`, `logo`, `description`, `companyType`, `tier`, `package`, `ctc`, `minCGPA`, `backlogPolicy`, `allowedBranches[]`, `requiredSkills[]`, `openings`, `driveDate`, `website`, `evaluationProcess[]`

### Application
`student` (ref), `company` (ref), `status` (Applied / Shortlisted / Selected / Rejected), `resumeUrl` (snapshot), `adminNote`, `appliedAt`

### Announcement
`title`, `body`, `type` (Drive Update / Result / Reminder / General), `companyId` (optional ref), `createdBy` (admin ref), `isActive`, `createdAt`

---

## Eligibility Logic

A student is ineligible for a company if **any** of the following are true:

1. `student.cgpa < company.minCGPA`
2. `company.backlogPolicy === false` AND `student.backlogs > 0`
3. `student.branch` is not in `company.allowedBranches`
4. None of `student.skills` match any of `company.requiredSkills` (case-insensitive)

The dashboard shows the exact failure reason for every ineligible company — not a generic "not eligible" label.

---

## Team

Built during a rapid hackathon execution by a team of 4:

| Role | Responsibility |
|------|---------------|
| Backend Architecture | Database modeling, eligibility engine, JWT auth |
| Frontend Engineering | UI/UX, component architecture, API integration |
| API & Seeding | REST routes, middleware, database seeding logic |
| Documentation & QA | README, testing, deployment strategy |

---

## Roadmap

### V1
- [x] Precision eligibility engine
- [x] 1-click applications with resume snapshot
- [x] Student dashboard with Bento Grid UI
- [x] Eligibility summary with explicit rejection reasons
- [x] Automated company seeding

### V2
- [x] Admin Panel — company CRUD, application status management, announcements
- [x] Groq AI resume parsing and skill extraction
- [x] Resume Score and per-company Match Score
- [x] Company Intelligence — skill gap, difficulty rating, prep roadmap
- [x] Prep Resources tab with AI-personalized recommendations
