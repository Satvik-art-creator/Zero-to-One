const express = require('express');
const mongoose = require('mongoose');
const Company = require('../models/Company');
const Application = require('../models/Application');
const Student = require('../models/Student');
const Announcement = require('../models/Announcement');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// All admin routes require auth + admin
router.use(authMiddleware, adminMiddleware);

// ─── Overview Stats ──────────────────────────────────────────
router.get('/overview', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [totalCompanies, allApps, companies] = await Promise.all([
      Company.countDocuments(),
      Application.find().populate('student', 'name'),
      Company.find(),
    ]);

    // Unique students with status Selected
    const selectedApps = allApps.filter((a) => a.status === 'Selected');
    const uniquePlaced = new Set(selectedApps.map((a) => a.student?._id?.toString())).size;

    // Drives this month
    const drivesThisMonth = companies.filter((c) => {
      if (!c.driveDate || c.driveDate === 'TBD') return false;
      const d = new Date(c.driveDate);
      return d >= startOfMonth && d <= endOfMonth;
    }).length;

    res.json({
      success: true,
      data: {
        totalCompanies,
        studentsPlaced: uniquePlaced,
        drivesThisMonth,
        totalApplicants: allApps.length,
      },
    });
  } catch (err) {
    console.error('Overview error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── Activity Feed ───────────────────────────────────────────
router.get('/activity-feed', async (req, res) => {
  try {
    const apps = await Application.find({ status: { $ne: 'Applied' } })
      .sort({ updatedAt: -1 })
      .limit(30)
      .populate('student', 'name')
      .populate('company', 'name');

    res.json({ success: true, data: apps });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── Companies ───────────────────────────────────────────────
router.get('/companies', async (req, res) => {
  try {
    const companies = await Company.find().sort({ driveDate: 1 });
    // Attach applicant counts
    const appCounts = await Application.aggregate([
      { $group: { _id: '$company', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    appCounts.forEach((a) => { countMap[a._id.toString()] = a.count; });

    const result = companies.map((c) => ({
      ...c.toObject(),
      applicantCount: countMap[c._id.toString()] || 0,
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/companies', async (req, res) => {
  try {
    const company = await Company.create(req.body);
    res.status(201).json({ success: true, data: company });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/companies/:id', async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    res.json({ success: true, data: company });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/companies/:id', async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    // Cascade delete applications
    await Application.deleteMany({ company: req.params.id });
    res.json({ success: true, message: 'Company and associated applications deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── Applications ────────────────────────────────────────────
router.get('/applications', async (req, res) => {
  try {
    const apps = await Application.find()
      .populate('company', 'name jobRole package tier ctc requiredSkills')
      .populate('student', 'name email cgpa branch skills resumeUrl')
      .sort({ appliedAt: -1 });
    res.json({ success: true, data: apps });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/applications/:companyId', async (req, res) => {
  try {
    const apps = await Application.find({ company: req.params.companyId })
      .populate('company', 'name jobRole package tier ctc requiredSkills')
      .populate('student', 'name email cgpa branch skills resumeUrl')
      .sort({ appliedAt: -1 });
    res.json({ success: true, data: apps });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.patch('/applications/:id/status', async (req, res) => {
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
    )
      .populate('company', 'name')
      .populate('student', 'name email');

    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    // If selected, mark student as placed
    if (status === 'Selected') {
      await Student.findByIdAndUpdate(app.student._id, { isPlaced: true });
    }

    res.json({ success: true, data: app });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── Students ────────────────────────────────────────────────
router.get('/students', async (req, res) => {
  try {
    const students = await Student.find({ role: 'student' })
      .select('-password')
      .sort({ name: 1 });

    // Attach application counts
    const appCounts = await Application.aggregate([
      { $group: { _id: '$student', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    appCounts.forEach((a) => { countMap[a._id.toString()] = a.count; });

    const result = students.map((s) => ({
      ...s.toObject(),
      applicationCount: countMap[s._id.toString()] || 0,
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── Announcements (Admin CRUD) ─────────────────────────────
router.post('/announcements', async (req, res) => {
  try {
    const { title, body, type, companyId } = req.body;
    const announcement = await Announcement.create({
      title,
      body,
      type: type || 'General',
      companyId: companyId || null,
      createdBy: req.user.id,
    });
    const populated = await Announcement.findById(announcement._id)
      .populate('companyId', 'name')
      .populate('createdBy', 'name');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get('/announcements', async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .populate('companyId', 'name')
      .populate('createdBy', 'name');
    res.json({ success: true, data: announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.patch('/announcements/:id/toggle', async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) return res.status(404).json({ success: false, message: 'Announcement not found' });
    ann.isActive = !ann.isActive;
    await ann.save();
    const populated = await Announcement.findById(ann._id)
      .populate('companyId', 'name')
      .populate('createdBy', 'name');
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/announcements/:id', async (req, res) => {
  try {
    const ann = await Announcement.findByIdAndDelete(req.params.id);
    if (!ann) return res.status(404).json({ success: false, message: 'Announcement not found' });
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
