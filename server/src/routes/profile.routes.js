const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');
const ctrl = require('../controllers/profile.controller');

router.get('/', protect, ctrl.getProfile);
router.post('/manual', protect, ctrl.updateManual);
router.post('/upload-resume', protect, upload.single('resume'), ctrl.uploadResume);
router.put('/', protect, ctrl.completeProfile);

module.exports = router;
