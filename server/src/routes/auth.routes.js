// auth.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth.controller');
const protect = require('../middleware/auth.middleware');

router.post('/register', auth.register);
router.post('/login', auth.login);
router.get('/me', protect, auth.getMe);
router.put('/me', protect, auth.updateMe);

module.exports = router;
