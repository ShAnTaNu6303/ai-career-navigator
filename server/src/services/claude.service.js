const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Using llama-3.3-70b — Groq's best free model
const MODEL = 'llama-3.3-70b-versatile';

const CAREER_COACH_SYSTEM = `You are an expert Senior Career Coach and Technical Recruiter with 15+ years of experience in the tech industry. You specialize in skill gap analysis, career roadmaps, and helping professionals land their dream roles.

IMPORTANT: Always respond with valid JSON only. No prose, no markdown, no explanation outside the JSON structure. Your JSON must be parseable by JSON.parse().`;

// ─── Parse Resume Text ────────────────────────────────────────────────────────
async function parseResume(rawText) {
  const response = await groq.chat.completions.create({
    model: MODEL,
    max_tokens: 2000,
    temperature: 0.3,
    messages: [
      { role: 'system', content: CAREER_COACH_SYSTEM },
      { role: 'user', content: `Parse this resume text and extract structured data. Return ONLY this JSON:
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "currentRole": "string",
  "yearsExperience": number,
  "education": "string (highest degree + institution)",
  "skills": ["skill1", "skill2"],
  "field": "string (e.g. Software Engineering, Data Science)",
  "summary": "string (2-3 sentence professional summary)"
}

Resume text:
${rawText.substring(0, 4000)}` }
    ]
  });

  return safeParseJSON(response.choices[0].message.content);
}

// ─── Analyze Skills & Generate Gap Analysis ───────────────────────────────────
async function analyzeSkills(profile) {
  const profileStr = JSON.stringify({
    field: profile.field,
    currentRole: profile.currentRole,
    targetRole: profile.targetRole,
    yearsExperience: profile.yearsExperience,
    education: profile.education,
    location: profile.location,
    desiredSalary: profile.desiredSalary,
    skills: profile.skills,
    careerGoal: profile.careerGoal,
    challenges: profile.challenges,
  });

  const response = await groq.chat.completions.create({
    model: MODEL,
    max_tokens: 4000,
    temperature: 0.3,
    messages: [
      { role: 'system', content: CAREER_COACH_SYSTEM },
      { role: 'user', content: `Analyze this professional profile and return a comprehensive skill gap analysis.

Profile: ${profileStr}

Return ONLY this exact JSON structure:
{
  "currentSkills": [
    {"name": "string", "level": 0-100, "yearsUsed": number}
  ],
  "requiredSkills": [
    {"name": "string", "level": 0-100, "importance": "critical|high|medium|low"}
  ],
  "gaps": [
    {"skill": "string", "currentLevel": 0-100, "requiredLevel": 0-100, "priority": "critical|high|medium|low", "tip": "brief actionable tip"}
  ],
  "strengths": ["string"],
  "areasToImprove": ["string"],
  "readinessScore": 0-100,
  "summary": "3-4 sentence honest assessment",
  "targetRole": "string",
  "salaryInsight": "salary range insight for target role in their location",
  "estimatedTimeToReady": "e.g. 3-6 months with focused learning"
}

Be realistic and specific. Include 6-10 current skills, 6-10 required skills, and 4-6 gaps.` }
    ]
  });

  return safeParseJSON(response.choices[0].message.content);
}

// ─── Generate Career Roadmap ──────────────────────────────────────────────────
async function generateRoadmap(analysis, duration) {
  const durationMap = { week: '1 week (5 intensive days)', month: '4 weeks (1 month)', quarter: '12 weeks (3 months)' };
  const phaseCount = { week: 2, month: 4, quarter: 8 };

  const response = await groq.chat.completions.create({
    model: MODEL,
    max_tokens: 6000,
    temperature: 0.4,
    messages: [
      { role: 'system', content: CAREER_COACH_SYSTEM },
      { role: 'user', content: `Create a detailed career roadmap for this professional.

Target Role: ${analysis.targetRole}
Duration: ${durationMap[duration]}
Key Gaps to Close: ${JSON.stringify(analysis.gaps?.slice(0, 5))}
Readiness Score: ${analysis.readinessScore}/100
Strengths: ${JSON.stringify(analysis.strengths)}

Return ONLY this exact JSON (${phaseCount[duration]} phases):
{
  "phases": [
    {
      "weekLabel": "e.g. Week 1-2",
      "title": "Phase title",
      "goal": "One-sentence goal",
      "tasks": ["specific task 1", "specific task 2", "specific task 3", "specific task 4"],
      "resources": [
        {"title": "resource name", "url": "real URL", "platform": "platform name", "type": "course|video|article", "price": "Free|$X", "isFree": true, "rating": 4.8}
      ],
      "projects": [
        {"title": "project name", "description": "build description", "tech": ["tech1"], "difficulty": "beginner|intermediate|advanced", "impact": "high|very-high", "estimatedHours": 10}
      ]
    }
  ],
  "certifications": [
    {"title": "cert name", "url": "real URL", "platform": "provider", "type": "certification", "price": "$X", "isFree": false, "rating": 4.9}
  ]
}

Use REAL course URLs (Udemy, Coursera, freeCodeCamp, MDN, etc). Be specific and actionable.` }
    ]
  });

  return safeParseJSON(response.choices[0].message.content);
}

// ─── Chat Message ─────────────────────────────────────────────────────────────
async function chatMessage(messages, userProfile) {
  const systemPrompt = `You are an AI Career Navigator assistant — a knowledgeable, encouraging career coach who specializes in tech careers.

User's Context:
- Current Role: ${userProfile?.currentRole || 'Not specified'}
- Target Role: ${userProfile?.targetRole || 'Not specified'}
- Field: ${userProfile?.field || 'Technology'}
- Experience: ${userProfile?.yearsExperience || 0} years

Be concise (under 150 words), actionable, and supportive. Use bullet points when listing things. Never give generic advice — be specific to the user's context.`;

  const response = await groq.chat.completions.create({
    model: MODEL,
    max_tokens: 800,
    temperature: 0.7,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
    ]
  });

  return response.choices[0].message.content;
}

// ─── Score Job Match ──────────────────────────────────────────────────────────
async function scoreJobMatch(profile, job) {
  const response = await groq.chat.completions.create({
    model: MODEL,
    max_tokens: 200,
    temperature: 0.2,
    messages: [
      { role: 'system', content: CAREER_COACH_SYSTEM },
      { role: 'user', content: `Rate how well this candidate matches this job. Return ONLY: {"score": 0-100, "reason": "one sentence"}
Candidate skills: ${JSON.stringify(profile.skills)}
Candidate experience: ${profile.yearsExperience} years, role: ${profile.currentRole}
Job requires: ${JSON.stringify(job.requiredSkills)}, experience: ${job.experienceMin}-${job.experienceMax} years` }
    ]
  });

  return safeParseJSON(response.choices[0].message.content);
}

// ─── Safe JSON Parser ─────────────────────────────────────────────────────────
function safeParseJSON(text) {
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch {}
    }
    throw new Error('Failed to parse AI response as JSON: ' + text.substring(0, 200));
  }
}

module.exports = { parseResume, analyzeSkills, generateRoadmap, chatMessage, scoreJobMatch };
