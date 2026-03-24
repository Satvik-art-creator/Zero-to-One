const express = require('express');
const Company = require('../models/Company');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const isEligible = require('../utils/eligibilityChecker');

const router = express.Router();

// GET /api/companies/public-stats — aggregated stats for landing page (no auth required)
router.get('/public-stats', async (req, res) => {
  try {
    const companies = await Company.find();
    const getCtcNum = (c) => typeof c.ctc === 'number' ? c.ctc : parseFloat(c.package) || 0;
    
    const totalCompanies = companies.length;
    const productCompanies = companies.filter((c) => c.companyType === 'Product').length;
    const highPackageCompanies = companies.filter((c) => getCtcNum(c) >= 15).length;
    const totalOpenings = companies.reduce((sum, c) => sum + (parseInt(c.openings) || 0), 0);
    
    res.json({ success: true, data: { totalCompanies, productCompanies, highPackageCompanies, totalOpenings } });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/companies — all companies with eligibility + filters (auth required)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const companies = await Company.find().sort({ tier: 1, minCGPA: -1 });
    res.json({ success: true, count: companies.length, data: companies });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/companies/eligible — filtered by student profile + query filters
router.get('/eligible', authMiddleware, async (req, res) => {
  try {
    const student = req.user; // decoded from JWT
    const { role, skill, companyType, minPackage, maxPackage, search } = req.query;

    let query = {};

    // Filter by companyType
    if (companyType && companyType !== 'all') {
      query.companyType = companyType;
    }

    // Filter by job role (partial match)
    if (role && role !== 'all') {
      query.jobRole = { $regex: role, $options: 'i' };
    }

    // Filter by package range
    if (minPackage) query.ctc = { ...(query.ctc || {}), $gte: parseFloat(minPackage) };
    if (maxPackage) query.ctc = { ...(query.ctc || {}), $lte: parseFloat(maxPackage) };

    // Search by company name
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { jobRole: { $regex: search, $options: 'i' } },
      ];
    }

    const companies = await Company.find(query);

    const result = companies.map((company) => {
      const eligibilityData = isEligible(student, company);
      // Check skill filter — if filtering by skill, check both student and company skills
      if (skill && skill !== 'all') {
        const companyHasSkill = company.requiredSkills.some(
          (s) => s.toLowerCase().includes(skill.toLowerCase())
        );
        if (!companyHasSkill) return null;
      }
      return { ...company.toObject(), eligible: eligibilityData.eligible, ineligibleReasons: eligibilityData.reasons };
    }).filter(Boolean);

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

// GET /api/companies/:id — single company detail
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    
    const eligibilityData = isEligible(req.user, company);
    res.json({ success: true, data: { ...company.toObject(), eligible: eligibilityData.eligible, ineligibleReasons: eligibilityData.reasons } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/companies — admin only
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const company = await Company.create(req.body);
    res.status(201).json({ success: true, data: company });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/companies/:id — admin only
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    res.json({ success: true, data: company });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/companies/:id — admin only
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    res.json({ success: true, message: 'Company deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
