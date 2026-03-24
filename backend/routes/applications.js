const express = require('express');
const Application = require('../models/Application');
const Company = require('../models/Company');
const authMiddleware = require('../middleware/authMiddleware');
const isEligible = require('../utils/eligibilityChecker');

const router = express.Router();

// POST /api/applications — apply to a company
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

    const application = await Application.create({
      student: student.id,
      company: companyId,
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
      .populate('company', 'name jobRole package tier driveDate location')
      .sort({ appliedAt: -1 });

    res.json({ success: true, count: applications.length, data: applications });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
