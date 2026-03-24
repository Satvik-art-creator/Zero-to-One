# PlaceBridge — IIIT Nagpur Placement Engine

**PlaceBridge** is an intelligent, high-fidelity MERN-stack platform designed exclusively for **IIIT Nagpur** students to simplify the campus placement journey. It features a precision "Exact Match" eligibility engine, a minimalist "Digital Atelier" design system, and frictionless 1-click applications.

![PlaceBridge Dashboard Screenshot](./landing-minimalist-light.png)

## 🚀 Features

- **Exclusive Access**: Strict domain validation ensures only `@iiitn.ac.in` emails can register.
- **Precision Match Engine**: Automatically cross-references student profiles (CGPA, Branch, Backlogs, Skills) against company requirements.
- **1-Click Applications**: Seamlessly apply to eligible drives without redundant form-filling.
- **Digital Atelier Aesthetic**: A meticulously crafted minimalist light theme using `Plus Jakarta Sans` and `Inter` typography, glassmorphic surface cards, and Bento Grid layouts.
- **Automated Seeding**: Local environment automatically seeds 20 diverse tech companies across all tiers (Tier 1 to Service-based) to simulate a real placement season.

## 🛠 Tech Stack

- **Frontend**: React.js, React Router, Axios, Custom CSS (No external UI libraries)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB & Mongoose
- **Auth**: JWT (Stateless Authentication) & bcrypt.js

## ⚙️ Local Development Setup

### Prerequisites
Make sure you have Node.js (v18+) and MongoDB installed and running locally.

### 1. Backend Setup
```bash
cd backend
npm install
# Ensure MongoDB is running locally on port 27017
npm run dev
```
*The backend runs on `http://localhost:5000`. On first run, it will automatically seed 20 tech companies into the database.*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start
```
*The frontend runs on `http://localhost:3000`.*

## 🧪 Demo Path

1. Open `http://localhost:3000`.
2. Click **Get Started** and register using an `@iiitn.ac.in` email and demo details (e.g., CSE, 8.5 CGPA, Java/React skills).
3. View your dynamically calculated **Eligibility Summary**.
4. Enter the **Dashboard** to see the Bento-grid UI.
5. Click **Apply Now** on eligible companies and check the **My Apps** tab to track applications.

---
*Built with precision during a rapid 10-hour execution constraint.*
