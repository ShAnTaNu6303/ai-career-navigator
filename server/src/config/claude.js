// Groq client — kept filename as claude.js to avoid changing imports
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
module.exports = groq;
