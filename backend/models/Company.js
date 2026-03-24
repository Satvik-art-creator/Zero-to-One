const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    jobRole: { type: String, required: true },
    package: { type: String, required: true }, // e.g. "12 LPA" (display)
    ctc: { type: Number, required: true, default: 0 }, // numeric LPA for filtering
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
      enum: ['Tier 1', 'Tier 2', 'Tier 3', 'Service-Based', 'Startup'],
      default: 'Tier 2',
    },
    companyType: {
      type: String,
      enum: ['Product', 'Service', 'Startup', 'Consulting', 'BFSI'],
      default: 'Service',
    },
    description: { type: String, default: '' },
    website: { type: String, default: '' },
    evaluationProcess: {
      type: [String],
      default: ['Online Test', 'Technical Interview', 'HR Interview'],
    },
    openings: { type: Number, default: null },
    bond: { type: String, default: null }, // e.g. "2 years" or null
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', CompanySchema);
