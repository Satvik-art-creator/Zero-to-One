const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const router = express.Router();

// Helper: generate JWT with student profile embedded
const generateToken = (student) => {
  return jwt.sign(
    {
      id: student._id,
      name: student.name,
      email: student.email,
      cgpa: student.cgpa,
      branch: student.branch,
      year: student.year,
      backlogs: student.backlogs,
      skills: student.skills || [],
      role: student.role || 'student',
      resumeUrl: student.resumeUrl || null,
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, cgpa, branch, year, backlogs, skills } = req.body;

    // Domain validation
    if (!email || !email.endsWith('@iiitn.ac.in')) {
      return res.status(400).json({ success: false, message: 'Use your IIIT Nagpur institutional email (@iiitn.ac.in)' });
    }

    // CGPA validation
    if (cgpa < 0 || cgpa > 10) {
      return res.status(400).json({ success: false, message: 'CGPA must be between 0 and 10' });
    }

    // Check duplicate
    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Account already exists. Please login.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Parse skills — accept array or comma-separated string
    const parsedSkills = Array.isArray(skills)
      ? skills.map((s) => s.trim()).filter(Boolean)
      : String(skills).split(',').map((s) => s.trim()).filter(Boolean);

    const student = await Student.create({
      name,
      email,
      password: hashedPassword,
      cgpa: parseFloat(cgpa),
      branch,
      year,
      backlogs: parseInt(backlogs) || 0,
      skills: parsedSkills,
    });

    const token = generateToken(student);

    res.status(201).json({
      success: true,
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        cgpa: student.cgpa,
        branch: student.branch,
        year: student.year,
        backlogs: student.backlogs,
        skills: student.skills,
        role: student.role || 'student',
        resumeUrl: student.resumeUrl || null,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Account already exists. Please login.' });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    console.error('Register error (500):', err.message, err.stack);
    res.status(500).json({ success: false, message: err.message || 'Registration failed. Try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = generateToken(student);

    res.json({
      success: true,
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        cgpa: student.cgpa,
        branch: student.branch,
        year: student.year,
        backlogs: student.backlogs,
        skills: student.skills,
        role: student.role || 'student',
        resumeUrl: student.resumeUrl || null,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: 'Login failed. Try again.' });
  }
});

module.exports = router;
