/**
 * PlaceBridge — Student Routes
 * Student-specific API endpoints (prep resources, etc.)
 */

const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Student = require('../models/Student');
const Company = require('../models/Company');
const { getRecommendedResources } = require('../utils/prepResourcesEngine');

const router = express.Router();

/**
 * GET /api/student/company/:companyId/prep-resources
 * Returns AI-personalized (or fallback) prep resource recommendations.
 */
router.get('/company/:companyId/prep-resources', authMiddleware, async (req, res) => {
  try {
    // Fetch fresh student data from DB (JWT snapshot may be stale for skills)
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Check if student has resume / skills
    if (!student.resumeUrl && (!student.skills || student.skills.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Please upload your resume first so we can assess your skill gaps.',
        code: 'NO_RESUME',
      });
    }

    // Fetch company
    const company = await Company.findById(req.params.companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    // Get recommendations
    const result = await getRecommendedResources(student, company);

    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Prep resources error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch prep resources' });
  }
});

module.exports = router;
