const express = require('express');
const Application = require('../models/Application');
const Company = require('../models/Company');
const Student = require('../models/Student');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const isEligible = require('../utils/eligibilityChecker');

const router = express.Router();

// POST /api/applications — apply to a company (with resume snapshot)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { companyId } = req.body;
    const student = req.user;

    if (!companyId) {
      return res.status(400).json({ success: false, message: 'companyId is required.' });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    // Re-verify eligibility server-side
    if (!isEligible(student, company)) {
      return res.status(403).json({ success: false, message: 'You are not eligible for this company.' });
    }

    // Get student's resume info
    const studentDoc = await Student.findById(student.id).select('resumeUrl resumeOriginalName');

    const application = await Application.create({
      student: student.id,
      company: companyId,
      resumeUrl: studentDoc?.resumeUrl || null,
      resumeOriginalName: studentDoc?.resumeOriginalName || null,
    });

    res.status(201).json({ success: true, message: 'Applied successfully!', data: application });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Already applied to this company.' });
    }
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/applications/mine — student's own applications
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user.id })
      .populate('company', 'name jobRole package tier driveDate location companyType evaluationProcess description ctc')
      .sort({ appliedAt: -1 });

    res.json({ success: true, count: applications.length, data: applications });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/applications/all — admin: all applications across students
router.get('/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('company', 'name jobRole package tier')
      .populate('student', 'name email cgpa branch')
      .sort({ appliedAt: -1 });

    res.json({ success: true, count: applications.length, data: applications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /api/applications/:id/status — admin: update status
router.patch('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const validStatuses = ['Applied', 'Shortlisted', 'Selected', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { status, adminNote: adminNote || null },
      { new: true }
    ).populate('company', 'name').populate('student', 'name email');

    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    res.json({ success: true, data: app });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
