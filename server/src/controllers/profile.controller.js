const path = require('path');
const fs = require('fs');
const Profile = require('../models/Profile.model');
const { parseResumeFile } = require('../services/resumeParser.service');
const { parseResume } = require('../services/claude.service');

exports.getProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ userId: req.userId });
    if (!profile) profile = await Profile.create({ userId: req.userId });
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateManual = async (req, res) => {
  try {
    const { field, currentRole, targetRole, yearsExperience, education, location, desiredSalary, skills, careerGoal, challenges, githubUrl, linkedinUrl } = req.body;

    const profile = await Profile.findOneAndUpdate(
      { userId: req.userId },
      {
        inputType: 'manual',
        field, currentRole, targetRole, yearsExperience, education, location,
        desiredSalary, skills: Array.isArray(skills) ? skills : skills?.split(',').map(s => s.trim()).filter(Boolean),
        careerGoal, challenges, githubUrl, linkedinUrl, isComplete: true
      },
      { new: true, upsert: true }
    );

    res.json({ profile, message: 'Profile saved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const filePath = req.file.path;

    // Parse file to text
    let rawText;
    try {
      rawText = await parseResumeFile(filePath, req.file.mimetype);
    } catch (parseErr) {
      fs.unlinkSync(filePath);
      return res.status(422).json({ error: parseErr.message });
    }

    // Use Claude to extract structured data
    let extracted = {};
    try {
      extracted = await parseResume(rawText);
    } catch (claudeErr) {
      console.error('Claude parse error:', claudeErr.message);
    }

    const resumeUrl = `/uploads/${req.file.filename}`;

    const profile = await Profile.findOneAndUpdate(
      { userId: req.userId },
      {
        inputType: 'resume',
        resumeUrl,
        resumeOriginalName: req.file.originalname,
        rawResumeText: rawText.substring(0, 10000),
        isComplete: true,
        ...(extracted.currentRole && { currentRole: extracted.currentRole }),
        ...(extracted.location && { location: extracted.location }),
        ...(extracted.education && { education: extracted.education }),
        ...(extracted.yearsExperience && { yearsExperience: extracted.yearsExperience }),
        ...(extracted.field && { field: extracted.field }),
        ...(extracted.skills?.length && { skills: extracted.skills }),
      },
      { new: true, upsert: true }
    );

    res.json({ profile, extracted, message: 'Resume uploaded and parsed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.completeProfile = async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { userId: req.userId },
      { ...req.body, isComplete: true },
      { new: true, upsert: true }
    );
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
