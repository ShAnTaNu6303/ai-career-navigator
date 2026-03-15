// ─── JOBS CONTROLLER ─────────────────────────────────────────────────────────
const { Job, Mentor, Booking, Post, ChatSession } = require('../models/other.models');
const User = require('../models/User.model');
const { chatMessage } = require('../services/claude.service');
const Profile = require('../models/Profile.model');

// ─── Jobs ─────────────────────────────────────────────────────────────────────
exports.getJobs = async (req, res) => {
  try {
    const { field, role, exp, location, type, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };

    if (field) query.field = { $regex: field, $options: 'i' };
    if (location && location !== 'all') query.location = { $regex: location, $options: 'i' };
    if (type) query.type = type;
    if (exp) {
      const expNum = parseInt(exp);
      query.experienceMin = { $lte: expNum };
      query.experienceMax = { $gte: expNum };
    }
    if (role) {
      query.$or = [
        { title: { $regex: role, $options: 'i' } },
        { requiredSkills: { $in: [new RegExp(role, 'i')] } }
      ];
    }

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .sort({ postedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ jobs, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({ job });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Mentors ──────────────────────────────────────────────────────────────────
exports.getMentors = async (req, res) => {
  try {
    const { expertise, slot } = req.query;
    const query = { isAvailable: true };
    if (expertise) query.expertise = { $in: [new RegExp(expertise, 'i')] };
    if (slot) query.slots = slot;

    const mentors = await Mentor.find(query).sort({ rating: -1 });
    res.json({ mentors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMentorById = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) return res.status(404).json({ error: 'Mentor not found' });
    res.json({ mentor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.bookMentor = async (req, res) => {
  try {
    const { duration, scheduledAt, notes } = req.body;
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) return res.status(404).json({ error: 'Mentor not found' });
    if (!mentor.slots.includes(duration)) return res.status(400).json({ error: 'Duration not available' });

    const price = mentor.pricing[duration];
    const booking = await Booking.create({
      mentorId: mentor._id,
      userId: req.userId,
      duration,
      price,
      scheduledAt,
      notes,
      status: 'pending',
    });

    res.status(201).json({ booking, message: 'Booking created. Complete payment to confirm.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.userId })
      .populate('mentorId', 'name title company avatarInitials accentColor')
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Community ────────────────────────────────────────────────────────────────
exports.getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const posts = await Post.find({ isDeleted: false })
      .populate('authorId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Post.countDocuments({ isDeleted: false });
    res.json({ posts, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { content, tags } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Content required' });

    const post = await Post.create({ authorId: req.userId, content, tags });
    const populated = await post.populate('authorId', 'name avatar');
    await User.findByIdAndUpdate(req.userId, { $inc: { points: 5 } });
    res.status(201).json({ post: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const liked = post.likes.includes(req.userId);
    if (liked) post.likes.pull(req.userId);
    else post.likes.push(req.userId);

    await post.save();
    res.json({ likes: post.likes.length, liked: !liked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { authorId: req.userId, content } } },
      { new: true }
    ).populate('authorId', 'name avatar').populate('comments.authorId', 'name avatar');
    res.json({ post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({}).select('name avatar points').sort({ points: -1 }).limit(10);
    res.json({ leaderboard: users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Chat ─────────────────────────────────────────────────────────────────────
exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message required' });

    let session = await ChatSession.findOne({ userId: req.userId });
    if (!session) session = await ChatSession.create({ userId: req.userId, messages: [] });

    // Add user message
    session.messages.push({ role: 'user', content: message });

    // Get profile context
    const profile = await Profile.findOne({ userId: req.userId });

    // Build history for Claude (last 10 messages)
    const recentMessages = session.messages.slice(-10).map(m => ({ role: m.role, content: m.content }));

    const reply = await chatMessage(recentMessages, profile);

    session.messages.push({ role: 'assistant', content: reply });
    session.lastActive = new Date();
    await session.save();

    res.json({ reply, messageCount: session.messages.length });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: 'Chat failed: ' + err.message });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const session = await ChatSession.findOne({ userId: req.userId });
    if (!session) return res.json({ messages: [] });
    res.json({ messages: session.messages.slice(-50) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.clearChat = async (req, res) => {
  try {
    await ChatSession.findOneAndUpdate({ userId: req.userId }, { messages: [], lastActive: new Date() });
    res.json({ message: 'Chat history cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Payment ──────────────────────────────────────────────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findOne({ _id: bookingId, userId: req.userId });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    // If Razorpay keys available, create real order
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      const Razorpay = require('razorpay');
      const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
      const order = await razorpay.orders.create({ amount: booking.price * 100, currency: 'INR', receipt: bookingId });
      await Booking.findByIdAndUpdate(bookingId, { orderId: order.id });
      return res.json({ orderId: order.id, amount: booking.price * 100, key: process.env.RAZORPAY_KEY_ID });
    }

    // Mock order for development
    const mockOrderId = 'order_mock_' + Date.now();
    await Booking.findByIdAndUpdate(bookingId, { orderId: mockOrderId, status: 'confirmed', paymentId: 'pay_mock_' + Date.now() });
    res.json({ orderId: mockOrderId, amount: booking.price * 100, mock: true, message: 'Mock payment (no Razorpay keys)' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { bookingId, paymentId, orderId } = req.body;
    await Booking.findByIdAndUpdate(bookingId, { status: 'confirmed', paymentId, orderId });
    res.json({ message: 'Payment verified. Booking confirmed!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
