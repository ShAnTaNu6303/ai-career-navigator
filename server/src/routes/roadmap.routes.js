const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const ctrl = require('../controllers/roadmap.controller');
router.post('/generate', protect, ctrl.generateRoadmap);
router.get('/active', protect, ctrl.getActiveRoadmap);
router.get('/all', protect, ctrl.getAllRoadmaps);
router.put('/:id/progress', protect, ctrl.updateProgress);
module.exports = router;
