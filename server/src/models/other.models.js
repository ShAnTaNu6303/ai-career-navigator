const mongoose = require('mongoose');

// ─── Job Model ────────────────────────────────────────────────────────────────
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, default: 'Remote' },
  salaryMin: Number,
  salaryMax: Number,
  salaryDisplay: String,
  type: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship'], default: 'full-time' },
  field: String,
  requiredSkills: [String],
  experienceMin: { type: Number, default: 0 },
  experienceMax: { type: Number, default: 10 },
  description: String,
  applyUrl: String,
  logoUrl: String,
  isActive: { type: Boolean, default: true },
  postedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// ─── Mentor Model ─────────────────────────────────────────────────────────────
const mentorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  title: String,
  company: String,
  bio: String,
  expertise: [String],
  yearsExperience: Number,
  avatarInitials: String,
  accentColor: String,
  rating: { type: Number, default: 5.0, min: 1, max: 5 },
  totalReviews: { type: Number, default: 0 },
  slots: [{ type: String, enum: ['15min', '30min', '1hr'] }],
  pricing: {
    '15min': Number,
    '30min': Number,
    '1hr': Number,
  },
  isAvailable: { type: Boolean, default: true },
  linkedinUrl: String,
}, { timestamps: true });

// ─── Booking Model ────────────────────────────────────────────────────────────
const bookingSchema = new mongoose.Schema({
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  duration: { type: String, enum: ['15min', '30min', '1hr'], required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  scheduledAt: Date,
  paymentId: String,
  orderId: String,
  meetLink: String,
  notes: String,
}, { timestamps: true });

// ─── Post Model ───────────────────────────────────────────────────────────────
const postSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 1000 },
  tags: [String],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

// ─── ChatSession Model ────────────────────────────────────────────────────────
const chatSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'] },
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  context: { type: String, default: '' },
  lastActive: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = {
  Job: mongoose.model('Job', jobSchema),
  Mentor: mongoose.model('Mentor', mentorSchema),
  Booking: mongoose.model('Booking', bookingSchema),
  Post: mongoose.model('Post', postSchema),
  ChatSession: mongoose.model('ChatSession', chatSessionSchema),
};
