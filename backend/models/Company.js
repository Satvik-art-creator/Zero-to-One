const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    jobRole: { type: String, required: true },
    package: { type: String, required: true }, // e.g. "12 LPA"
    minCGPA: { type: Number, required: true, min: 0, max: 10 },
    backlogPolicy: {
      type: Boolean,
      required: true,
      default: false, // false = no backlogs allowed
    },
    allowedBranches: { type: [String], required: true },
    requiredSkills: { type: [String], required: true },
    driveDate: { type: String, default: 'TBD' },
    location: { type: String, default: 'Nagpur' },
    tier: {
      type: String,
      enum: ['Tier 1', 'Tier 2', 'Tier 3'],
      default: 'Tier 2',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', CompanySchema);
