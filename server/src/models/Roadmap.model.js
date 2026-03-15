const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: String,
  url: String,
  platform: String,
  type: { type: String, enum: ['course', 'certification', 'article', 'video', 'book'] },
  price: String,
  isFree: { type: Boolean, default: false },
  rating: Number,
}, { _id: false });

const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  tech: [String],
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  impact: { type: String, enum: ['low', 'medium', 'high', 'very-high'] },
  estimatedHours: Number,
}, { _id: false });

const phaseSchema = new mongoose.Schema({
  weekLabel: String,
  title: String,
  goal: String,
  tasks: [String],
  resources: [resourceSchema],
  projects: [projectSchema],
  completedTasks: [String],
  status: { type: String, enum: ['upcoming', 'active', 'done'], default: 'upcoming' },
}, { _id: true });

const roadmapSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  analysisId: { type: mongoose.Schema.Types.ObjectId, ref: 'Analysis', required: true },
  duration: { type: String, enum: ['week', 'month', 'quarter'], required: true },
  targetRole: { type: String },
  phases: [phaseSchema],
  certifications: [resourceSchema],
  overallStatus: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },
  progressPercent: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Roadmap', roadmapSchema);
