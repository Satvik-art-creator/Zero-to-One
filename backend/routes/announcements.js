const express = require('express');
const Announcement = require('../models/Announcement');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/announcements — student-facing: only active announcements
router.get('/', authMiddleware, async (req, res) => {
  try {
    const announcements = await Announcement.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('companyId', 'name')
      .populate('createdBy', 'name');
    res.json({ success: true, data: announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
