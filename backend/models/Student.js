const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: (v) => v.endsWith('@iiitn.ac.in'),
        message: 'Must use a valid IIIT Nagpur email (@iiitn.ac.in)',
      },
    },
    password: { type: String, required: true, minlength: 6 },
    cgpa: { type: Number, required: true, min: 0, max: 10 },
    branch: {
      type: String,
      required: true,
      enum: ['CSE', 'ECE'],
    },
    year: {
      type: String,
      required: true,
      enum: ['1st', '2nd', '3rd', '4th'],
    },
    backlogs: { type: Number, required: true, default: 0, min: 0 },
    skills: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'At least one skill is required',
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', StudentSchema);
