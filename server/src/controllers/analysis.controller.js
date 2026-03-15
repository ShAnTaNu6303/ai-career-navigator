const Profile = require('../models/Profile.model');
const Analysis = require('../models/Analysis.model');
const { analyzeSkills } = require('../services/claude.service');
const User = require('../models/User.model');

exports.generateAnalysis = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });
    if (!profile || !profile.isComplete) {
      return res.status(400).json({ error: 'Please complete your profile before generating analysis' });
    }

    // Merge in any overrides from request body (targetRole, etc.)
    const profileData = { ...profile.toObject(), ...req.body };

    const result = await analyzeSkills(profileData);

    // Upsert analysis (one per user, always latest)
    const analysis = await Analysis.findOneAndUpdate(
      { userId: req.userId },
      {
        userId: req.userId,
        profileId: profile._id,
        ...result,
      },
      { new: true, upsert: true }
    );

    // Award points for completing analysis
    await User.findByIdAndUpdate(req.userId, { $inc: { points: 50 } });

    res.json({ analysis, message: 'Analysis generated successfully' });
  } catch (err) {
    console.error('Analysis error:', err.message);
    res.status(500).json({ error: 'Failed to generate analysis: ' + err.message });
  }
};

exports.getLatestAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({ userId: req.userId }).sort({ createdAt: -1 });
    if (!analysis) return res.status(404).json({ error: 'No analysis found. Please generate one first.' });
    res.json({ analysis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAnalysisById = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.userId });
    if (!analysis) return res.status(404).json({ error: 'Analysis not found' });
    res.json({ analysis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
