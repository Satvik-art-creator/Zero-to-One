const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    status: {
      type: String,
      enum: ['Applied', 'Shortlisted', 'Selected', 'Rejected'],
      default: 'Applied',
    },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent a student from applying to the same company twice
ApplicationSchema.index({ student: 1, company: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);
