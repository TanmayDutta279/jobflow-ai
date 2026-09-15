const OpenAI = require('openai');
const crypto = require('crypto');

let client;

function getClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured. Add your Groq API key to backend/.env.');
  }

  if (!client) {
    client = new OpenAI({
      baseURL: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
      apiKey: process.env.GROQ_API_KEY,
      defaultHeaders: {
        'X-Title': 'JobFlow AI',
      },
    });
  }
  return client;
}

function cleanJson(text) {
  const cleaned = String(text || '')
    .replace(/```(?:json)?/gi, '')
    .replace(/```/g, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {}

  const objectStart = cleaned.indexOf('{');
  const objectEnd = cleaned.lastIndexOf('}');
  if (objectStart !== -1 && objectEnd > objectStart) {
    try { return JSON.parse(cleaned.slice(objectStart, objectEnd + 1)); } catch {}
  }

  const arrayStart = cleaned.indexOf('[');
  const arrayEnd = cleaned.lastIndexOf(']');
  if (arrayStart !== -1 && arrayEnd > arrayStart) {
    try { return JSON.parse(cleaned.slice(arrayStart, arrayEnd + 1)); } catch {}
  }

  throw new Error('Invalid AI JSON response');
}

function asStringArray(value) {
  return Array.isArray(value) ? value.map(item => String(item).trim()).filter(Boolean) : [];
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
}

async function askAI(prompt, temperature = 0.2) {
  const ai = getClient();

  const completion = await ai.chat.completions.create({
    model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
    temperature,
    messages: [
      {
        role: 'system',
        content: 'You are JobFlow AI, an expert ATS and recruiting assistant. Return ONLY one valid JSON object. No markdown fences. No explanation outside the JSON object. Do not invent facts that are not supported by the supplied resume.',
      },
      { role: 'user', content: prompt },
    ],
  });

  const message = completion.choices?.[0]?.message;
  const content = message?.content || message?.text || completion.choices?.[0]?.text || '';
  if (!content) {
    console.error('AI raw response:', JSON.stringify(completion, null, 2));
    throw new Error('AI returned an empty response');
  }

  return cleanJson(content);
}

const resumeAnalysisCache = new Map();
const RESUME_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

async function analyzeResume(resumeText) {
  if (!resumeText || resumeText.trim().length < 50) {
    throw new Error('The resume text is too short to analyze reliably.');
  }

  const normalizedResume = resumeText.trim().replace(/\s+/g, ' ');
  const cacheKey = crypto.createHash('sha256').update(normalizedResume).digest('hex');
  const cached = resumeAnalysisCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return { ...cached.analysis, resumeText: normalizedResume, cached: true };
  }

  const result = await askAI(`Analyze the resume below as a professional ATS and recruiter.

ATS SCORE RULES:
- Score 0-100 based on ATS readability, section structure, relevant keywords, skills, experience/project evidence, measurable achievements, and role relevance.
- Do not reward a resume merely because it is long.
- Do not invent missing experience or skills.
- Explain actionable weaknesses in suggestions.
- Recommend realistic job roles based only on evidence in the resume.

Return exactly this JSON shape:
{
  "atsScore": 0,
  "skills": ["skill"],
  "jobRoles": ["role"],
  "suggestions": ["specific improvement"],
  "strengths": ["resume strength"],
  "atsBreakdown": {
    "formatting": 0,
    "keywords": 0,
    "experience": 0,
    "skills": 0,
    "impact": 0
  },
  "summary": "2-3 sentence professional assessment"
}

Resume:
${resumeText}`);

  const analysis = {
    atsScore: clampScore(result.atsScore),
    skills: asStringArray(result.skills),
    jobRoles: asStringArray(result.jobRoles),
    suggestions: asStringArray(result.suggestions),
    strengths: asStringArray(result.strengths),
    atsBreakdown: {
      formatting: clampScore(result.atsBreakdown?.formatting),
      keywords: clampScore(result.atsBreakdown?.keywords),
      experience: clampScore(result.atsBreakdown?.experience),
      skills: clampScore(result.atsBreakdown?.skills),
      impact: clampScore(result.atsBreakdown?.impact),
    },
    summary: String(result.summary || '').trim(),
    resumeText,
    analysisSource: 'groq-ai',
    aiModel: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
    cached: false,
  };

  resumeAnalysisCache.set(cacheKey, { expiresAt: Date.now() + RESUME_CACHE_TTL_MS, analysis });
  return analysis;
}

async function compareJob(resumeText, jobDescription) {
  const result = await askAI(`Compare this resume with this real job listing.

Evaluate:
1. Required and preferred skills actually supported by the resume.
2. Relevant experience and projects.
3. Role/title alignment.
4. Important gaps.
5. Overall likelihood of passing an initial recruiter/ATS screen.

Return exactly:
{
  "matchScore": 0,
  "missingSkills": ["skill"],
  "strengths": ["specific matching strength"],
  "suggestions": ["specific action"],
  "jobSummary": "A concise 2-3 sentence summary of this job based only on the listing"
}

Resume:
${resumeText}

Job listing:
${jobDescription}`);

  return {
    matchScore: clampScore(result.matchScore),
    missingSkills: asStringArray(result.missingSkills),
    strengths: asStringArray(result.strengths),
    suggestions: asStringArray(result.suggestions),
    jobSummary: String(result.jobSummary || '').trim(),
    analysisSource: 'groq-ai',
  };
}

async function rankJobsWithAI(resumeText, jobs) {
  if (!jobs.length) return [];

  const candidates = jobs.slice(0, 12).map((job, index) => ({
    index,
    title: job.title,
    company: job.company,
    location: job.location,
    type: job.type,
    tags: Array.isArray(job.tags) ? job.tags.slice(0, 10) : [],
    description: String(job.description || '').slice(0, 3500),
  }));

  const result = await askAI(`Rank these real job listings for the candidate's resume.

Use semantic understanding, not simple keyword counting. Consider role alignment, required skills, seniority, technology fit, location/remote constraints when stated, and evidence in the resume. A high score must mean the candidate appears genuinely relevant, not merely that a few words overlap.

Return exactly:
{
  "rankings": [
    {
      "index": 0,
      "matchScore": 0,
      "matchedSkills": ["skill"],
      "missingSkills": ["skill"],
      "matchReason": "one concise sentence",
      "summary": "2 concise sentences describing the job"
    }
  ]
}

Resume:
${resumeText}

Jobs:
${JSON.stringify(candidates)}`);

  if (!Array.isArray(result.rankings)) throw new Error('AI did not return job rankings');

  const ranked = result.rankings
    .map(item => {
      const job = candidates[item.index];
      if (!job) return null;
      return {
        ...jobs[item.index],
        matchScore: clampScore(item.matchScore),
        matchedSkills: asStringArray(item.matchedSkills),
        missingSkills: asStringArray(item.missingSkills),
        matchReason: String(item.matchReason || '').trim(),
        aiSummary: String(item.summary || '').trim(),
        analysisSource: 'groq-ai',
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.matchScore - a.matchScore);

  return ranked;
}

async function buildSearchQueryWithAI(resumeText) {
  const result = await askAI(`Create a concise job-search query from this resume.

Choose the strongest realistic target role and 1-3 important technologies/skills. Keep it suitable for Indeed, LinkedIn, Naukri and Wellfound search boxes.

Return exactly:
{"query":"Software Engineer React Node.js"}

Resume:
${resumeText}`);

  const query = String(result.query || '').replace(/\s+/g, ' ').trim();
  if (!query) throw new Error('AI did not return a job search query');
  return query.slice(0, 120);
}

module.exports = { analyzeResume, compareJob, rankJobsWithAI, buildSearchQueryWithAI };
