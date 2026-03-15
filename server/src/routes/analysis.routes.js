// analysis.routes.js
const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const ctrl = require('../controllers/analysis.controller');
router.post('/generate', protect, ctrl.generateAnalysis);
router.get('/latest', protect, ctrl.getLatestAnalysis);
router.get('/:id', protect, ctrl.getAnalysisById);
module.exports = router;
