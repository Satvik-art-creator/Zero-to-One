const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Student = require('../models/Student');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safe = req.user.id + '-' + Date.now() + path.extname(file.originalname);
    cb(null, safe);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  },
});

// Known tech skills for extraction
const KNOWN_SKILLS = [
  'javascript', 'js', 'typescript', 'ts', 'python', 'java', 'c++', 'c#', 'c',
  'go', 'golang', 'rust', 'swift', 'kotlin', 'ruby', 'php', 'scala',
  'react', 'reactjs', 'react.js', 'angular', 'vue', 'vuejs', 'next.js', 'nextjs',
  'node.js', 'nodejs', 'express', 'expressjs', 'fastapi', 'django', 'flask',
  'spring', 'spring boot', 'springboot', 'hibernate',
  'html', 'css', 'tailwind', 'bootstrap', 'sass', 'scss',
  'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'sql', 'nosql',
  'graphql', 'rest', 'restful', 'grpc',
  'docker', 'kubernetes', 'k8s', 'aws', 'azure', 'gcp', 'git', 'github', 'ci/cd',
  'linux', 'bash', 'shell', 'nginx', 'terraform',
  'dsa', 'data structures', 'algorithms', 'system design', 'microservices',
  'distributed systems', 'cloud', 'devops', 'ml', 'machine learning', 'deep learning',
  'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn', 'opencv',
  'spark', 'kafka', 'rabbitmq', 'elasticsearch',
  'oops', 'oop', 'object oriented', 'dbms', 'os', 'networking basics',
  'communication', 'problem solving', 'logical reasoning', 'analytics',
  'basic web development', 'basic programming', 'cloud basics', 'cloud computing',
  'system design basics', 'microservices', 'distributed systems',
];

function extractSkillsFromText(text) {
  const lower = text.toLowerCase();
  const found = new Set();
  for (const skill of KNOWN_SKILLS) {
    // Word boundary match (allow special chars like . / +)
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<![a-z])${escaped}(?![a-z])`, 'i');
    if (regex.test(lower)) {
      // Normalize to canonical form
      const canonical = skill
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      found.add(canonical);
    }
  }
  // Remove low-value generic terms unless they are the only ones
  const highValue = [...found].filter((s) =>
    !['C', 'Go'].includes(s) || found.size <= 3
  );
  return highValue.length > 0 ? highValue : [...found];
}

// POST /api/resume/upload
router.post('/upload', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    let extractedSkills = [];
    const ext = path.extname(req.file.originalname).toLowerCase();

    // Try PDF parsing
    if (ext === '.pdf') {
      try {
        const pdfParse = require('pdf-parse');
        const buffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(buffer);
        extractedSkills = extractSkillsFromText(pdfData.text);
      } catch (pdfErr) {
        console.warn('PDF parse failed, using filename-based fallback:', pdfErr.message);
        extractedSkills = [];
      }
    }
    // For .doc/.docx, return empty skills (user can add manually)

    // Relative URL for frontend
    const resumeUrl = `/uploads/resumes/${req.file.filename}`;

    // Get existing student to merge skills
    const student = await Student.findById(req.user.id);
    const existingSkills = student.skills || [];
    const mergedSkills = [...new Set([...existingSkills, ...extractedSkills])];

    // Update student record
    const updated = await Student.findByIdAndUpdate(
      req.user.id,
      {
        resumeUrl,
        resumeOriginalName: req.file.originalname,
        skills: mergedSkills,
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Resume uploaded successfully!',
      resumeUrl,
      resumeOriginalName: req.file.originalname,
      skills: mergedSkills,
      extractedSkills,
    });
  } catch (err) {
    console.error('Resume upload error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Upload failed.' });
  }
});

// GET /api/resume/me — get current student's resume info
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select('resumeUrl resumeOriginalName skills');
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
