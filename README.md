# PlaceBridge — IIIT Nagpur Placement Engine 🚀

**PlaceBridge** is an intelligent, high-fidelity MERN-stack platform designed exclusively for **IIIT Nagpur** students to simplify the campus placement journey. It features a precision "Exact Match" eligibility engine, a minimalist "Digital Atelier" design system, and frictionless 1-click applications.

---

## 🛑 Problem Statement

The traditional campus placement process is often plagued by friction and inefficiencies:
1. **Manual Eligibility Tracking**: Placement cells and students manually cross-reference CGPA, active backlogs, skills, and branches against every visiting company's criteria, leading to errors and missed opportunities.
2. **Redundant Form Filling**: Students repeatedly enter identical details (resume, CGPA, demographic data) for every company application.
3. **Information Overload**: Tracking drive dates, evaluation processes, and required skills across multiple platforms (emails, PDFs, WhatsApp groups) creates confusion and anxiety.
4. **Lack of Personalization**: Students struggle to identify which companies align best with their specific technical stack.

## 💡 Solution & Features

PlaceBridge solves these issues through intelligent automation and a student-first experience:

- **Precision Match Engine**: Automatically cross-references student profiles (CGPA, Branch, Backlogs, Skills) against company requirements. You only see companies you are eligible for.
- **1-Click Applications**: Seamlessly apply to eligible drives without redundant form-filling.
- **Exclusive Access Control**: Strict domain validation ensures only authorized `@iiitn.ac.in` emails can register.
- **Automated Seeding System**: Out-of-the-box local environment automatically seeds 20 diverse tech companies across all tiers (Tier 1 to Service-based) to simulate a real placement season.
- **"Digital Atelier" Aesthetic**: A meticulously crafted minimalist light theme using `Plus Jakarta Sans` and `Inter` typography, glassmorphic surface cards, and Bento Grid layouts—all built with custom CSS (zero external UI libraries).

---

## 🛠 Tech Stack

PlaceBridge is built entirely on a robust, modern MERN architecture:

### Frontend
- **Framework**: React.js (Component-driven architecture)
- **Routing**: React Router DOM (v6+)
- **Networking**: Axios (for robust REST API communication)
- **Styling**: Vanilla CSS3 with CSS Variables

### Backend
- **Core**: Node.js & Express.js
- **Database**: MongoDB & Mongoose (Object Data Modeling)
- **Authentication**: JWT (JSON Web Tokens for stateless auth) & bcrypt.js (password hashing)
- **File Handling**: Multer & pdf-parse (for upcoming resume extraction features)

---

## ⚙️ Setup and Installation Instructions

### Prerequisites
- **Node.js**: v18.0 or higher
- **MongoDB**: Running locally on default port `27017`
- **Git**: For version control

### 1. Clone the Repository
```bash
git clone <repository_url>
cd Zero-to-One
```

### 2. Backend Environment Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```
Start the development server:
```bash
npm run dev
```
> **Note:** The backend runs on `http://localhost:5000`. On its very first run, it will automatically connect to MongoDB and seed 20 tech companies (like Microsoft, Google, TCS, Flipkart) into the database.

### 3. Frontend Environment Setup
Open a new terminal window, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```
Start the React development server:
```bash
npm start
```
> **Note:** The frontend application runs on `http://localhost:3000`.

---

## 🧪 Demo Path (How to Use)

1. Open your browser and navigate to `http://localhost:3000`.
2. Click on **Get Started** to create an account.
3. Register using an official college email (`@iiitn.ac.in`) alongside your demographic details (e.g., CSE branch, 8.5 CGPA, 'Java' and 'React' in skills).
4. Instantly view your dynamically calculated **Eligibility Summary** upon login.
5. Enter the **Dashboard** to experience the Bento-grid UI.
6. Click **Apply Now** on companies you are eligible for.
7. Switch to the **My Apps** tab to track all your active applications.

---

## 👥 Team Details

Built with precision during a rapid 10-hour hackathon execution constraint by a dedicated team of 4 developers:
- **Team Member 1**: Backend Architecture & Database Modeling
- **Team Member 2**: Frontend UI/UX Engineering & Integration
- **Team Member 3**: API Routes & Database Seeding logic
- **Team Member 4**: Documentation, QA, & Deployment Strategy

---

## 🚀 Future Scope (V2 & Beyond)

While V1 successfully establishes the core eligibility engine, future updates are planned to transform PlaceBridge into a complete T&P (Training and Placement) ecosystem:

1. **Admin Panel**: A comprehensive dashboard for T&P officers to CRUD companies, view aggregate student data, and generate reports.
2. **Automated Resume Parsing**: AI-driven skill extraction directly from uploaded student PDFs to avoid manual skill entry.
3. **Application Status Tracking**: Multi-stage tracking (Applied → Shortlisted → Interviewing → Selected/Rejected).
4. **Rich Analytics Integration**: Real-time insights illustrating skill gaps mapped against tier-1 company requirements.
5. **In-App Notifications**: Alerts for looming drive deadlines and changes in application status.