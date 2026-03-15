const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  inputType: { type: String, enum: ['resume', 'manual'], default: 'manual' },
  resumeUrl: { type: String, default: '' },
  resumeOriginalName: { type: String, default: '' },
  githubUrl: { type: String, default: '' },
  linkedinUrl: { type: String, default: '' },
  portfolioUrl: { type: String, default: '' },
  field: { type: String, default: '' },
  currentRole: { type: String, default: '' },
  targetRole: { type: String, default: '' },
  yearsExperience: { type: Number, default: 0 },
  education: { type: String, default: '' },
  location: { type: String, default: '' },
  desiredSalary: { type: Number, default: 0 },
  skills: [{ type: String }],
  careerGoal: { type: String, default: '' },
  challenges: { type: String, default: '' },
  rawResumeText: { type: String, default: '' },
  isComplete: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
