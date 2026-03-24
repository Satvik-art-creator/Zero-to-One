const express = require('express');
const Company = require('../models/Company');
const authMiddleware = require('../middleware/authMiddleware');
const isEligible = require('../utils/eligibilityChecker');

const router = express.Router();

// GET /api/companies — all companies (auth required)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const companies = await Company.find().sort({ tier: 1, minCGPA: -1 });
    res.json({ success: true, count: companies.length, data: companies });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/companies/eligible — filtered by student profile
router.get('/eligible', authMiddleware, async (req, res) => {
  try {
    const student = req.user; // decoded from JWT
    const companies = await Company.find();

    const result = companies.map((company) => {
      const eligible = isEligible(student, company);
      return { ...company.toObject(), eligible };
    });

    // Eligible companies first
    result.sort((a, b) => (b.eligible ? 1 : 0) - (a.eligible ? 1 : 0));

    const eligibleCount = result.filter((c) => c.eligible).length;

    res.json({
      success: true,
      total: result.length,
      eligibleCount,
      companies: result,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
