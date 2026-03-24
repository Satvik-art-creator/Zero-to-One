const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const connectDB = require('./config/db');
const Company = require('./models/Company');
const companies = require('./data/companies_seed.json');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Static files — serve uploaded resumes ───────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin-auth', require('./routes/adminAuth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/resume', require('./routes/resume'));
app.use('/api/announcements', require('./routes/announcements'));

// ── Health check ────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'PlaceBridge API is running 🚀', institution: 'IIIT Nagpur' });
});

// ── Auto-seed companies if collection is empty ──────────────
const autoSeed = async () => {
  try {
    mongoose.connection.once('open', async () => {
      const count = await Company.countDocuments();
      if (count === 0) {
        await Company.insertMany(companies);
        console.log(`✅ Auto-seeded ${companies.length} companies into MongoDB.`);
      } else {
        console.log(`ℹ️  Companies already seeded (${count} found). Skipping.`);
      }
    });
  } catch (err) {
    console.error('Auto-seed error:', err.message);
  }
};

autoSeed();

// ── Start server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
