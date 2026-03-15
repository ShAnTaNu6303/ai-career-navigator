require('dotenv').config();
const mongoose = require('mongoose');
const { Job, Mentor } = require('../models/other.models');

const jobs = [
  { title: 'Senior Frontend Developer', company: 'Razorpay', location: 'Bangalore', salaryMin: 1800000, salaryMax: 2800000, salaryDisplay: '₹18-28 LPA', type: 'full-time', field: 'Frontend', requiredSkills: ['React', 'TypeScript', 'GraphQL', 'CSS'], experienceMin: 3, experienceMax: 7, description: 'Build world-class payment interfaces', applyUrl: 'https://razorpay.com/jobs', isActive: true, postedAt: new Date() },
  { title: 'Full Stack Engineer', company: 'CRED', location: 'Remote', salaryMin: 1500000, salaryMax: 2200000, salaryDisplay: '₹15-22 LPA', type: 'full-time', field: 'Full Stack', requiredSkills: ['Node.js', 'React', 'AWS', 'MongoDB'], experienceMin: 2, experienceMax: 6, description: 'Build fintech products at scale', applyUrl: 'https://cred.club/jobs', isActive: true, postedAt: new Date(Date.now() - 86400000) },
  { title: 'UI Engineer', company: 'Zepto', location: 'Mumbai', salaryMin: 1200000, salaryMax: 1800000, salaryDisplay: '₹12-18 LPA', type: 'full-time', field: 'Frontend', requiredSkills: ['React', 'CSS', 'JavaScript', 'Performance'], experienceMin: 1, experienceMax: 4, description: 'Craft blazing-fast grocery app UI', applyUrl: 'https://www.zeptonow.com/careers', isActive: true, postedAt: new Date(Date.now() - 3 * 3600000) },
  { title: 'Software Engineer II', company: 'PhonePe', location: 'Bangalore', salaryMin: 2000000, salaryMax: 3000000, salaryDisplay: '₹20-30 LPA', type: 'full-time', field: 'Backend', requiredSkills: ['Java', 'Spring Boot', 'Kafka', 'MySQL'], experienceMin: 3, experienceMax: 8, description: 'Scale our payments platform', applyUrl: 'https://phonepe.com/en-in/careers.html', isActive: true, postedAt: new Date(Date.now() - 5 * 86400000) },
  { title: 'Data Scientist', company: 'Swiggy', location: 'Bangalore', salaryMin: 1800000, salaryMax: 2500000, salaryDisplay: '₹18-25 LPA', type: 'full-time', field: 'Data Science', requiredSkills: ['Python', 'ML', 'SQL', 'TensorFlow', 'Statistics'], experienceMin: 2, experienceMax: 6, description: 'ML models for food delivery optimization', applyUrl: 'https://careers.swiggy.com', isActive: true, postedAt: new Date(Date.now() - 2 * 86400000) },
  { title: 'Backend Engineer', company: 'Groww', location: 'Bangalore', salaryMin: 1600000, salaryMax: 2400000, salaryDisplay: '₹16-24 LPA', type: 'full-time', field: 'Backend', requiredSkills: ['Go', 'Microservices', 'PostgreSQL', 'Redis'], experienceMin: 2, experienceMax: 6, description: 'Build high-frequency trading backends', applyUrl: 'https://careers.groww.in', isActive: true, postedAt: new Date(Date.now() - 4 * 86400000) },
  { title: 'ML Engineer', company: 'Amazon', location: 'Hyderabad', salaryMin: 2500000, salaryMax: 4000000, salaryDisplay: '₹25-40 LPA', type: 'full-time', field: 'Machine Learning', requiredSkills: ['Python', 'PyTorch', 'AWS SageMaker', 'MLOps'], experienceMin: 3, experienceMax: 8, description: 'Build recommendation systems at scale', applyUrl: 'https://amazon.jobs', isActive: true, postedAt: new Date(Date.now() - 86400000) },
  { title: 'Product Engineer', company: 'Notion', location: 'Remote', salaryMin: 2200000, salaryMax: 3500000, salaryDisplay: '₹22-35 LPA', type: 'full-time', field: 'Full Stack', requiredSkills: ['TypeScript', 'React', 'Node.js', 'System Design'], experienceMin: 3, experienceMax: 8, description: 'Shape the future of knowledge tools', applyUrl: 'https://notion.so/jobs', isActive: true, postedAt: new Date() },
  { title: 'DevOps Engineer', company: 'Juspay', location: 'Bangalore', salaryMin: 1400000, salaryMax: 2000000, salaryDisplay: '₹14-20 LPA', type: 'full-time', field: 'DevOps', requiredSkills: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'CI/CD'], experienceMin: 2, experienceMax: 6, description: 'Infrastructure for payment reliability', applyUrl: 'https://juspay.in/careers', isActive: true, postedAt: new Date(Date.now() - 3 * 86400000) },
  { title: 'React Native Developer', company: 'Meesho', location: 'Bangalore', salaryMin: 1200000, salaryMax: 1800000, salaryDisplay: '₹12-18 LPA', type: 'full-time', field: 'Mobile', requiredSkills: ['React Native', 'JavaScript', 'Redux', 'iOS', 'Android'], experienceMin: 1, experienceMax: 5, description: 'Build for 150M+ social commerce users', applyUrl: 'https://meesho.io/jobs', isActive: true, postedAt: new Date(Date.now() - 86400000) },
];

const mentors = [
  { name: 'Arjun Mehta', title: 'Senior Software Engineer', company: 'Google', bio: 'Ex-Amazon, 12 years in distributed systems. Helped 100+ engineers crack FAANG interviews.', expertise: ['System Design', 'DSA', 'Backend', 'Java', 'FAANG Prep'], yearsExperience: 12, avatarInitials: 'AM', accentColor: '#00d4ff', rating: 4.9, totalReviews: 128, slots: ['15min', '30min', '1hr'], pricing: { '15min': 499, '30min': 899, '1hr': 1499 }, isAvailable: true },
  { name: 'Priya Sharma', title: 'ML Engineer', company: 'Amazon', bio: 'Built ML models serving 100M users. Specializes in NLP, computer vision, and ML system design.', expertise: ['Machine Learning', 'Python', 'Deep Learning', 'AWS', 'MLOps'], yearsExperience: 8, avatarInitials: 'PS', accentColor: '#7c3aed', rating: 4.8, totalReviews: 94, slots: ['30min', '1hr'], pricing: { '30min': 1099, '1hr': 1799 }, isAvailable: true },
  { name: 'Rahul Gupta', title: 'Senior Product Manager', company: 'Microsoft', bio: '0 to 1 product launches at Microsoft and two startups. MBA from IIM-A.', expertise: ['Product Strategy', 'Career Switch', 'PM Interviews', 'Leadership'], yearsExperience: 10, avatarInitials: 'RG', accentColor: '#10b981', rating: 4.7, totalReviews: 76, slots: ['15min', '30min', '1hr'], pricing: { '15min': 599, '30min': 999, '1hr': 1699 }, isAvailable: true },
  { name: 'Sneha Patel', title: 'Data Scientist', company: 'Netflix', bio: 'Stanford MS CS. Recommendation algorithms powering millions of hours of content discovery.', expertise: ['Data Science', 'Python', 'Statistics', 'SQL', 'Career Pivot'], yearsExperience: 6, avatarInitials: 'SP', accentColor: '#f59e0b', rating: 5.0, totalReviews: 52, slots: ['15min', '1hr'], pricing: { '15min': 449, '1hr': 1299 }, isAvailable: true },
  { name: 'Kiran Reddy', title: 'Frontend Architect', company: 'Flipkart', bio: 'Built Flipkart\'s design system. Expert in React, performance, and frontend architecture at scale.', expertise: ['React', 'TypeScript', 'Frontend Architecture', 'Performance', 'CSS'], yearsExperience: 9, avatarInitials: 'KR', accentColor: '#ef4444', rating: 4.8, totalReviews: 63, slots: ['30min', '1hr'], pricing: { '30min': 799, '1hr': 1399 }, isAvailable: true },
  { name: 'Aisha Khan', title: 'Engineering Manager', company: 'Uber', bio: 'IC to EM journey at Uber. Coaches engineers on leadership, team dynamics, and getting promoted.', expertise: ['Engineering Leadership', 'Career Growth', 'Promotion', 'Management'], yearsExperience: 11, avatarInitials: 'AK', accentColor: '#06b6d4', rating: 4.9, totalReviews: 87, slots: ['30min', '1hr'], pricing: { '30min': 1199, '1hr': 1999 }, isAvailable: true },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-career-navigator');
  console.log('Connected to MongoDB');

  await Job.deleteMany({});
  await Mentor.deleteMany({});

  await Job.insertMany(jobs);
  await Mentor.insertMany(mentors);

  console.log(`✅ Seeded ${jobs.length} jobs and ${mentors.length} mentors`);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
