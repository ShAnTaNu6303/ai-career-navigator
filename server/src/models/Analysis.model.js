const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: String,
  level: { type: Number, min: 0, max: 100 },
  yearsUsed: Number,
  importance: { type: String, enum: ['critical', 'high', 'medium', 'low'], default: 'medium' }
}, { _id: false });

const gapSchema = new mongoose.Schema({
  skill: String,
  currentLevel: { type: Number, min: 0, max: 100 },
  requiredLevel: { type: Number, min: 0, max: 100 },
  priority: { type: String, enum: ['critical', 'high', 'medium', 'low'] },
  tip: String
}, { _id: false });

const analysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
  currentSkills: [skillSchema],
  requiredSkills: [skillSchema],
  gaps: [gapSchema],
  strengths: [String],
  areasToImprove: [String],
  readinessScore: { type: Number, min: 0, max: 100, default: 0 },
  summary: { type: String, default: '' },
  targetRole: { type: String, default: '' },
  salaryInsight: { type: String, default: '' },
  estimatedTimeToReady: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Analysis', analysisSchema);
