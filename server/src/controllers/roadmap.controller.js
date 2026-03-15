const Analysis = require('../models/Analysis.model');
const Roadmap = require('../models/Roadmap.model');
const { generateRoadmap } = require('../services/claude.service');
const User = require('../models/User.model');

exports.generateRoadmap = async (req, res) => {
  try {
    const { duration } = req.body;
    if (!['week', 'month', 'quarter'].includes(duration)) {
      return res.status(400).json({ error: 'Duration must be week, month, or quarter' });
    }

    const analysis = await Analysis.findOne({ userId: req.userId }).sort({ createdAt: -1 });
    if (!analysis) {
      return res.status(400).json({ error: 'Please generate your skill analysis first' });
    }

    const result = await generateRoadmap(analysis, duration);

    // Mark first phase as active
    if (result.phases?.length > 0) result.phases[0].status = 'active';

    const roadmap = await Roadmap.findOneAndUpdate(
      { userId: req.userId, duration },
      {
        userId: req.userId,
        analysisId: analysis._id,
        duration,
        targetRole: analysis.targetRole,
        phases: result.phases,
        certifications: result.certifications || [],
        overallStatus: 'active',
        progressPercent: 0,
      },
      { new: true, upsert: true }
    );

    await User.findByIdAndUpdate(req.userId, { $inc: { points: 30 } });
    res.json({ roadmap, message: 'Roadmap generated successfully' });
  } catch (err) {
    console.error('Roadmap error:', err.message);
    res.status(500).json({ error: 'Failed to generate roadmap: ' + err.message });
  }
};

exports.getActiveRoadmap = async (req, res) => {
  try {
    const { duration } = req.query;
    const query = { userId: req.userId };
    if (duration) query.duration = duration;

    const roadmap = await Roadmap.findOne(query).sort({ createdAt: -1 });
    if (!roadmap) return res.status(404).json({ error: 'No roadmap found' });
    res.json({ roadmap });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { phaseId, taskText, completed } = req.body;
    const roadmap = await Roadmap.findOne({ _id: req.params.id, userId: req.userId });
    if (!roadmap) return res.status(404).json({ error: 'Roadmap not found' });

    const phase = roadmap.phases.id(phaseId);
    if (!phase) return res.status(404).json({ error: 'Phase not found' });

    if (completed && !phase.completedTasks.includes(taskText)) {
      phase.completedTasks.push(taskText);
    } else if (!completed) {
      phase.completedTasks = phase.completedTasks.filter(t => t !== taskText);
    }

    // Update phase status
    if (phase.completedTasks.length >= phase.tasks.length) phase.status = 'done';
    else if (phase.completedTasks.length > 0) phase.status = 'active';

    // Calculate overall progress
    const totalTasks = roadmap.phases.reduce((sum, p) => sum + p.tasks.length, 0);
    const doneTasks = roadmap.phases.reduce((sum, p) => sum + p.completedTasks.length, 0);
    roadmap.progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    if (roadmap.progressPercent === 100) roadmap.overallStatus = 'completed';

    await roadmap.save();
    await User.findByIdAndUpdate(req.userId, { $inc: { points: 10 } });
    res.json({ roadmap });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllRoadmaps = async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ userId: req.userId }).select('duration targetRole progressPercent overallStatus createdAt');
    res.json({ roadmaps });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
