// jobs.routes.js
const express = require('express');
const protect = require('../middleware/auth.middleware');
const ctrl = require('../controllers/other.controllers');

const jobRouter = express.Router();
jobRouter.get('/', protect, ctrl.getJobs);
jobRouter.get('/:id', protect, ctrl.getJobById);

// mentors.routes.js
const mentorRouter = express.Router();
mentorRouter.get('/', protect, ctrl.getMentors);
mentorRouter.get('/:id', protect, ctrl.getMentorById);
mentorRouter.post('/:id/book', protect, ctrl.bookMentor);
mentorRouter.get('/me/bookings', protect, ctrl.getMyBookings);

// community.routes.js
const communityRouter = express.Router();
communityRouter.get('/posts', protect, ctrl.getPosts);
communityRouter.post('/posts', protect, ctrl.createPost);
communityRouter.post('/posts/:id/like', protect, ctrl.likePost);
communityRouter.post('/posts/:id/comment', protect, ctrl.addComment);
communityRouter.get('/leaderboard', protect, ctrl.getLeaderboard);

// chat.routes.js
const chatRouter = express.Router();
chatRouter.post('/message', protect, ctrl.sendMessage);
chatRouter.get('/history', protect, ctrl.getChatHistory);
chatRouter.delete('/history', protect, ctrl.clearChat);

// payment.routes.js
const paymentRouter = express.Router();
paymentRouter.post('/create-order', protect, ctrl.createOrder);
paymentRouter.post('/verify', protect, ctrl.verifyPayment);

module.exports = { jobRouter, mentorRouter, communityRouter, chatRouter, paymentRouter };
