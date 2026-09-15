const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfLib = require('pdf-parse');
const pdfParse = typeof pdfLib === 'function' ? pdfLib : (pdfLib.default || pdfLib.PDFParse);
const { analyzeResume } = require('../services/openaiService');
const { getRecommendedJobs, getExternalSearchLinks, buildSearchQueryFallback } = require('../services/jobsService');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No resume file uploaded' });
    if (req.file.mimetype !== 'application/pdf') return res.status(400).json({ error: 'Please upload a PDF resume.' });

    let textContent = '';
    try {
      const pdfData = await pdfParse(req.file.buffer);
      textContent = String(pdfData.text || '').replace(/\s+/g, ' ').trim();
    } catch (parseError) {
      console.error('PDF parsing failed:', parseError.message);
      return res.status(400).json({ error: 'Could not read this PDF. Please upload a text-based PDF.' });
    }

    const analysis = await analyzeResume(textContent);
    res.json(analysis);
  } catch (error) {
    console.error('Error in /upload-resume:', error);
    const status = /GROQ_API_KEY|AI returned|Invalid AI|resume text/i.test(error.message) ? 503 : 500;
    res.status(status).json({ error: error.message || 'Failed to process resume with AI' });
  }
});

router.post('/job-match', async (req, res) => {
  try {
    const { resumeText, resumeSkills = [] } = req.body;
    if (!resumeText) return res.status(400).json({ error: 'Missing resumeText' });

    const jobs = await getRecommendedJobs(resumeText, resumeSkills);
    if (!jobs.length) return res.status(503).json({ error: 'No live job listings are available right now.' });

    const bestJob = jobs[0];
    res.json({
      matchScore: bestJob.matchScore,
      missingSkills: bestJob.missingSkills || [],
      strengths: bestJob.matchedSkills || [],
      suggestions: bestJob.missingSkills?.length
        ? bestJob.missingSkills.slice(0, 4).map(skill => `Consider strengthening or adding evidence for ${skill}.`)
        : ['Tailor your resume wording to the requirements of this role.'],
      matchedJobTitle: bestJob.title,
      matchedJobDescription: bestJob.description,
      matchedJobSummary: bestJob.aiSummary || '',
      matchedJobLink: bestJob.link,
      matchedJobCompany: bestJob.company,
      matchedJobSource: bestJob.source,
      matchedJobLocation: bestJob.location,
      recommendedJobs: jobs,
      analysisSource: 'ai-assisted-profile',
      matchingMethod: 'AI-analyzed resume profile + local semantic ranking',
    });
  } catch (error) {
    console.error('Error in /job-match:', error);
    res.status(503).json({ error: error.message || 'Failed to match live jobs' });
  }
});

router.post('/job-search-links', async (req, res) => {
  try {
    const { resumeText, resumeSkills = [], jobRoles = [] } = req.body;
    if (!resumeText) return res.status(400).json({ error: 'Missing resumeText' });

    const role = Array.isArray(jobRoles) && jobRoles.length ? jobRoles.slice(0, 2).join(' ') : '';
    const skillText = Array.isArray(resumeSkills) ? resumeSkills.slice(0, 5).join(' ') : '';
    const query = (role || skillText || buildSearchQueryFallback(resumeText)).replace(/\s+/g, ' ').trim().slice(0, 120);
    res.json({ query, sources: getExternalSearchLinks(query) });
  } catch (error) {
    console.error('Error in /job-search-links:', error);
    res.status(500).json({ error: error.message || 'Failed to generate job search links' });
  }
});

router.post('/jobs', async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) return res.status(400).json({ error: 'Missing resumeText' });
    const jobs = await getRecommendedJobs(resumeText, req.body.resumeSkills || []);
    res.json(jobs);
  } catch (error) {
    console.error('Error in /jobs:', error);
    res.status(503).json({ error: error.message || 'Failed to fetch and rank live jobs with AI' });
  }
});

module.exports = router;
