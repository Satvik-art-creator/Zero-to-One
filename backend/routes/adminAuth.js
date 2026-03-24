const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const router = express.Router();

const ADMIN_DOMAIN = '@tnp.iiitn.ac.in';

// Helper: generate JWT with admin profile embedded
const generateToken = (admin) => {
  return jwt.sign(
    {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: 'admin',
      cgpa: admin.cgpa || 0,
      branch: admin.branch || 'CSE',
      year: admin.year || '4th',
      backlogs: admin.backlogs || 0,
      skills: admin.skills || [],
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// POST /api/admin-auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (!email.endsWith(ADMIN_DOMAIN)) {
      return res.status(400).json({
        success: false,
        message: `Admin registration requires a TNP email (${ADMIN_DOMAIN})`,
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const existing = await Student.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Account already exists. Please login.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Student.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      cgpa: 0,
      branch: 'CSE',
      year: '4th',
      backlogs: 0,
      role: 'admin',
    });

    const token = generateToken(admin);

    res.status(201).json({
      success: true,
      token,
      student: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'admin',
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Account already exists. Please login.' });
    }
    console.error('Admin register error:', err.message);
    res.status(500).json({ success: false, message: 'Registration failed. Try again.' });
  }
});

// POST /api/admin-auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    if (!email.endsWith(ADMIN_DOMAIN)) {
      return res.status(400).json({
        success: false,
        message: `Admin login requires a TNP email (${ADMIN_DOMAIN})`,
      });
    }

    const admin = await Student.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (admin.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'This account is not an admin account.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = generateToken(admin);

    res.json({
      success: true,
      token,
      student: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'admin',
      },
    });
  } catch (err) {
    console.error('Admin login error:', err.message);
    res.status(500).json({ success: false, message: 'Login failed. Try again.' });
  }
});

module.exports = router;
