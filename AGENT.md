# AGENT.md — PlaceBridge Execution System

> Read this before writing a single line of code. Every contributor, every AI agent, every pair-programming session starts here.

---

## 1. Project Identity

| Field | Value |
|---|---|
| Project Name | PlaceBridge |
| Type | Campus Placement Eligibility & Application Platform |
| Institution | TGPCET — TGPCET email domain enforced (@tgpcet.ac.in) |
| Stack | MERN — MongoDB, Express.js, React, Node.js |
| Hackathon | KRUTIVERSE 2K26 — 10-hour window |
| V1 Deadline | 1:00 PM (Round 1 evaluation — PPT + live prototype) |
| Code Freeze | 6:30 PM (Round 2 ends) |

---

## 2. Agent Behavior Rules (Non-Negotiable)

### MUST DO
- Read PRD.md before generating any feature
- Reference BACKEND_STRUCTURE.md before any route or schema
- Reference FRONTEND_GUIDELINES.md before any component
- Enforce V1 scope lock — do not generate V2 features before 1 PM
- Use exact field names from BACKEND_STRUCTURE.md schemas
- Keep eligibility logic in `utils/eligibilityChecker.js` only — never inline

### MUST NOT DO
- No TypeScript — plain JavaScript only
- No test frameworks (Jest, Mocha, etc.)
- No email/SMS code in V1
- No admin panel before Round 1
- No Redux — use React useState or Context only
- No animations, transitions, loading skeletons in V1
- No packages outside TECH_STACK.md without team approval
- No force push, no commit history rewriting

---

## 3. Core Logic — Eligibility Engine

This is the single most important function in the project. Preserve it exactly.

```javascript
// backend/utils/eligibilityChecker.js

function isEligible(student, company) {
  if (student.cgpa < company.minCGPA) return false;
  if (student.backlogs > 0 && !company.allowsBacklogs) return false;
  if (!company.allowedBranches.includes(student.branch)) return false;

  const hasSkillMatch = student.skills.some(skill =>
    company.requiredSkills.includes(skill)
  );
  if (!hasSkillMatch) return false;

  return true;
}

module.exports = isEligible;
```

Used in: `GET /api/companies/eligible` — filter with `.filter(company => isEligible(student, company))`.
Never duplicate. Never rewrite inline.

---

## 4. Phase Scope Lock

### V1 — LOCKED (Build before 1:00 PM)
- [x] Schemas: Student, Company, Application
- [x] Auth: register + login with JWT
- [x] Routes: GET /companies, GET /companies/eligible, POST /applications, GET /applications/mine
- [x] Frontend: Register/Login page
- [x] Frontend: Dashboard (Eligible tab + Applied tab)
- [x] Frontend: Company card + Apply button
- [x] Seed: 20 companies with varied criteria
- [x] README.md complete

### V2 — UNLOCKED (After 2:00 PM only)
- [ ] Admin panel (CRUD companies, view applications)
- [ ] Application status: shortlisted / rejected / selected
- [ ] Student profile edit
- [ ] Search + filter on dashboard
- [ ] In-app notification alerts
- [ ] Application count analytics per company

---

## 5. Commit Protocol

Format:
```
[type]: description

Types: feat | fix | seed | docs | refactor | style
```

Schedule:

| Time | Commit |
|---|---|
| ~10:00 AM | feat: init MERN project structure and env setup |
| ~10:45 AM | feat: add Student and Company schemas + auth routes |
| ~11:30 AM | feat: eligibility filter route + seed 20 companies |
| ~12:15 PM | feat: connect React dashboard to eligible companies API |
| ~12:50 PM | feat: apply flow working, UI polish, README updated |
| ~2:30 PM | feat: scaffold admin panel (V2 start) |
| ~4:30 PM | feat: admin CRUD complete + status tracking |
| ~6:20 PM | feat: final polish + V2 demo path complete |

All 4 team members must have at least 1 commit each before 1 PM.

---

## 6. File Ownership

| Path | Owner |
|---|---|
| `backend/models/` | P1 |
| `backend/routes/` | P1 + P3 |
| `backend/utils/eligibilityChecker.js` | P1 — do not modify without discussion |
| `backend/seed.js` | P3 |
| `frontend/src/pages/` | P2 |
| `frontend/src/components/` | P2 |
| `frontend/src/context/AuthContext.js` | P2 |
| `README.md` | P4 — must be complete before 1 PM |

---

## 7. Environment Variables

```env
# backend/.env
PORT=5000
MONGO_URI=mongodb://localhost:27017/placebridge
JWT_SECRET=placebridge_secret_2k26
NODE_ENV=development

# frontend/.env
REACT_APP_API_URL=http://localhost:5000/api
```

Never hardcode these values in source files.

---

## 8. Error Handling Standard

```javascript
// All backend routes
try {
  const result = await SomeModel.find();
  res.status(200).json({ success: true, data: result });
} catch (err) {
  console.error(err.message);
  res.status(500).json({ success: false, message: 'Server error' });
}
```

Frontend: show visible feedback on error. An `alert()` in V1 is acceptable. Silent failures are not.

---

## 9. Demo Path (Judges Will Follow This Exactly)

Protect this flow above everything else:

```
1. Open http://localhost:3000
2. Click Register → fill: name, @tgpcet.ac.in email, password, CGPA, branch, year, backlogs, skills[]
3. Submit → redirect to dashboard
4. Dashboard loads → "Eligible Companies" tab shows filtered list instantly
5. Click a company card → see: role, package, criteria
6. Click Apply → button changes to "Applied ✓"
7. Switch to "Applied" tab → application appears in list
```

If any step breaks, fix it before anything else. This IS the product.
